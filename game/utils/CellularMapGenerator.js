'use strict';

var CellTypes = require('./CellTypes');
var CellularMapGenerator = function(width, height, steps, debug) {
  this.chanceToBeAWall = 40;
  this.floorsToWallConversion = 4;
  this.wallsToFloorConversion = 3;
  this.treasureHiddenLimit = 3;
  this._width = width;
  this._height = height;
  this.steps = steps;
  this.debug = debug;
  this.failureCount = 0;
  this.failureMax = 10;

  this.refresh();

};

CellularMapGenerator.prototype.refresh = function() {
  this.seed();
  this.populateGrid();
  this.prepareForGame();
};

CellularMapGenerator.prototype.seed = function() {
  this.grid = [];
  this.caverns = [];
  this.treasures = [];
  this.entrance = new Phaser.Point();
  this.exit = new Phaser.Point();
  this.minDistanceBetweenEntryAndExit = Math.floor(this.width/2);
  this.minTreasureDistance = Math.floor(this.width / 10);
  this.maxTreasureCount = this.width / 5;
  this.rnd = new Phaser.RandomDataGenerator([(Date.now() * Math.random()).toString()]); 
  

};

CellularMapGenerator.prototype.populateGrid  = function() {
  for(var y = 0; y < this.height; y++) {
    this.grid[y] = [];
    for(var x = 0; x < this.width; x++) {
      this.grid[y][x] = Phaser.Math.chanceRoll(this.chanceToBeAWall) ? CellTypes.WALL : CellTypes.FLOOR; 
    }
  }
};

CellularMapGenerator.prototype.prepareForGame = function() {
  for(var i = 0; i < this.steps; i++) {
    this.doSimulationStep();
  }

  
  this.identfyCaverns();
  this.removeDisconnectedCaverns();
  if(this.debug) {
    this.print();
  }
  this.placeEntranceAndExit();
  this.placeTreasure();


  
    
};

CellularMapGenerator.prototype.print = function(map) {
  map = map || this.grid;
  var flattened = [];
  console.log('****** MAP DEBUG ******');
  console.log('Number of Caverns:', this.caverns.length);
  console.log('Number of Treasures:', this.treasures.length);
  for(var y = 0; y < this.height; y++) {
    for(var x = 0; x < this.width; x++) {
      flattened.push(map[y][x].symbol);
    }
    flattened.push('\n');
  }
  console.log(flattened.join(''));
};

CellularMapGenerator.prototype.doSimulationStep = function() {
  var newMap = [];
  for(var y = 0; y < this._height; y++) {
    newMap[y] = [];
    for(var x = 0; x < this._width; x++) {
      var neighborWallCount = this.countWallNeighbors(this.grid, x, y);
      if(this.grid[y][x] === CellTypes.WALL) {
        newMap[y][x] = (neighborWallCount < this.wallsToFloorConversion) ? 
                        CellTypes.FLOOR : 
                        CellTypes.WALL;
      } else {
        newMap[y][x] = (neighborWallCount > this.floorsToWallConversion) ?
                      CellTypes.WALL :
                      CellTypes.FLOOR;
      }
    }
  }
  this.grid = newMap;
};

CellularMapGenerator.prototype.countWallNeighbors = function(map, x, y) {
  this.invalid = null;
  var count = 0;
  for(var i = -1; i < 2; i++) {
    for(var j = -1; j < 2; j++) {
      if (i === 0 && j === 0) {
        break;
      } 
      var neighborCoord = new Phaser.Point(x+i, y+j);
      if(!this.isValidGridCoordinate(neighborCoord)) {
        this.invalid = true;
        count++;
      } else if (this.caveCellFromCoord(neighborCoord) === CellTypes.WALL) {
        this.invalid = false;
        count++;
      }
      
    }
  }
  return count;
};


CellularMapGenerator.prototype.isValidGridCoordinate = function(coord) {
  return !(coord.x < 0 ||
           coord.x >= this.width ||
           coord.y < 0 ||
           coord.y >= this.height);
};

CellularMapGenerator.prototype.caveCellFromCoord = function(coord) {
  if(this.isValidGridCoordinate(coord)) {
    return this.grid[coord.y][coord.x];
  } else {
    return null;
  }
};

CellularMapGenerator.prototype.identfyCaverns = function() {
  var floodFillArray = [];
  var x, y;
  this.caverns = [];
  floodFillArray = _.cloneDeep(this.grid);
  var fillNumber = CellTypes.FILLED;
  for(y = 0; y < this.height; y++) {
    for(x = 0; x < this.width; x++) {
      if(_.isEqual(floodFillArray[y][x],CellTypes.FLOOR)) {
        this.caverns.push([]);
        this.floodFill(floodFillArray, new Phaser.Point(x,y), fillNumber);
        fillNumber++;
      }
    }
  }
  if(!this.caverns.length) {
    console.error('Cavern Generation Failed, trying again...');
    this.failureCount++;
    if(this.failureCount >= this.failureMax) {
      console.error('max generation failures hit. Aborting.');
    }
    else {
      this.refresh();
    }
  } 
};

CellularMapGenerator.prototype.floodFill = function(map, coord, fillNumber) {
  var cell = map[coord.y][coord.x];
  if(!_.isEqual(cell,CellTypes.FLOOR)) {
    return;
  } 
  map[coord.y][coord.x] = fillNumber;
  this.caverns[this.caverns.length-1].push({cell:cell, x: coord.x, y: coord.y});
  if(coord.x > 0) {
    this.floodFill(map, new Phaser.Point(coord.x - 1, coord.y), fillNumber);
  }
  if(coord.x < this.width - 1) {
    this.floodFill(map, new Phaser.Point(coord.x + 1, coord.y), fillNumber);
  }
  if(coord.y > 0) {
    this.floodFill(map, new Phaser.Point(coord.x, coord.y -1), fillNumber);
  }
  if(coord.y < this.height - 1) {
    this.floodFill(map, new Phaser.Point(coord.x, coord.y + 1), fillNumber);
  }
};

CellularMapGenerator.prototype.mainCavernIndex = function() {
  var mainCavernIndex = -1;
  var maxCavernSize = 0;
  for(var i = 0; i < this.caverns.length; i++) {
    if(this.caverns[i].length > maxCavernSize) {
      maxCavernSize = this.caverns[i].length;
      mainCavernIndex = i;
    }

  }
  console.log('mainCavernIndex:', mainCavernIndex);
  return mainCavernIndex;
};

CellularMapGenerator.prototype.removeDisconnectedCaverns = function() {
  var mainCavernIndex = this.mainCavernIndex();
  var cavernsCount =  this.caverns.length;
  if(cavernsCount > 0) {
    for(var i = 0; i < cavernsCount; i++) {
      if(i !== mainCavernIndex) {
        this.caverns[i].forEach(function(cell) {
          this.grid[cell.y][cell.x] = CellTypes.WALL;
        }, this);      
      }
    }
  }
};

CellularMapGenerator.prototype.placeEntranceAndExit = function() {
  var mainCavernIndex = this.mainCavernIndex();
  var mainCavern = this.caverns[mainCavernIndex];

  var entranceCell = this.rnd.pick(mainCavern);

  this.grid[entranceCell.y][entranceCell.x] = CellTypes.ENTRY;

  this.entrance = entranceCell;
  var exitCell = null;
  var distance = 0;

  do {
    exitCell = this.rnd.pick(mainCavern);
    distance = Phaser.Point.distance(entranceCell, exitCell);
  } while(distance < this.minDistanceBetweenEntryAndExit);

  this.grid[exitCell.y][exitCell.x] = CellTypes.EXIT;
  this.exit = this.grid[exitCell.y][exitCell.x];
};

CellularMapGenerator.prototype.placeTreasure = function() {
  var cell, 
      neighborWallCount, 
      minDistance, 
      otherTreasure, 
      treasureDistance, 
      shouldPlaceTreasure,
      treasureMap = [],
      i, x, y, len;

  for(y = 0; y < this.height; y++) {
    for(x = 0; x < this.width; x++) {
      cell = this.grid[y][x];
      shouldPlaceTreasure = true;
      if(cell === CellTypes.FLOOR) {
        neighborWallCount = this.countWallNeighbors(this.grid, x, y);
        if(neighborWallCount > this.treasureHiddenLimit) {
          minDistance = Number.MAX_VALUE;
          if(this.treasures.length) {
            if(this.treasures.length === this.maxTreasureCount) {
              shouldPlaceTreasure = false;
            } else {
              for(i = 0; i < this.treasures.length; i++) {
                otherTreasure = this.treasures[i];
                treasureDistance = Phaser.Point.distance(new Phaser.Point(x,y), otherTreasure);
                if(treasureDistance < minDistance) {
                  minDistance = treasureDistance; 
                }
              }
              if(minDistance < this.minTreasureDistance) {
                shouldPlaceTreasure = false;
              }
            }
          } 
          if(shouldPlaceTreasure) {
            treasureMap.push({x: x, y:y});
          }
        }
      }
    }
  }

  Phaser.Utils.shuffle(treasureMap);

  for(i = 0, len = treasureMap.length; i < this.maxTreasureCount && i < len; i++) {
    var t = treasureMap[i];
    this.grid[t.y][t.x] = CellTypes.TREASURE;
    this.treasures.push(t);
  }
};


Object.defineProperty(CellularMapGenerator.prototype, 'width', {
  get: function() {
    return this._width;
  }
});

Object.defineProperty(CellularMapGenerator.prototype, 'height', {
  get: function() {
    return this._height;
  }
});

Object.defineProperty(CellularMapGenerator.prototype, 'size', {
  get: function() {
    return new Phaser.Point(this._width, this._height);
  }, set: function(value) { // Must be a Phaser.Point
    this._width = value.x;
    this._height = value.y;
    this.failureCount = 0;
    this.refresh();
  }
});



module.exports = CellularMapGenerator;