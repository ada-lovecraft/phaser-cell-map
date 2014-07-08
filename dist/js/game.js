(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'bsp-maps');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":5,"./states/gameover":6,"./states/menu":7,"./states/play":8,"./states/preload":9}],2:[function(require,module,exports){
'use strict';
var Primative = require('./Primative');
var CellTypes = require('../utils/CellTypes');
var Entity = function(game, x, y, color,size) {
  size = size || 70;
  Phaser.Sprite.call(this, game, x, y, 'hero');
  this.id = Entity.counter++;
  this.type = 'entity';


  this.targetWeights = [
    { cellType: CellTypes.TREASURE, weight: 0.0 },
    { cellType: CellTypes.MONSTER, weight: 0.0 },
    { cellType: CellTypes.EXIT, weight: 0.0 }
  ];

  this.game.physics.arcade.enableBody(this);
  
};

Entity.prototype = Object.create(Phaser.Sprite.prototype);
Entity.prototype.constructor = Entity;

Entity.prototype.update = function() {
  // write your prefab's specific update code here
};

Entity.counter = 0;


Object.defineProperty(Entity.prototype, 'mapPosition', {
  get: function() {
    var pos = new Phaser.Point(Math.floor(this.x/ 70), Math.floor(this.y/70));
    return pos;
  }, 
  set: function(value) {
    this.x = value.x * 70;
    this.y = value.y * 70;
  }
});

module.exports = Entity;

},{"../utils/CellTypes":10,"./Primative":4}],3:[function(require,module,exports){
'use strict';
var Entity = require('./Entity');
var CellTypes = require('../utils/CellTypes');
var Hero = function(game, color) {
  Entity.call(this, game, 0, 0);
  this.scale.setTo(0.75, 0.75);
  this.anchor.setTo(-0.25, 0);
  this.currentDungeonLevel = 1;

  this.type = 'HERO';
  this.canAdvance = false;

  this.targetWeights = [
    { cellType: CellTypes.TREASURE, weight: 2.0 },
    //{ cellType: CellTypes.MONSTER, weight: 1.5 },
    { cellType: CellTypes.EXIT, weight: 0.1 }
  ];
  this.events.onTreasure = new Phaser.Signal();
  this.events.onExit = new Phaser.Signal();
};

Hero.prototype = Object.create(Entity.prototype);
Hero.prototype.constructor = Hero;

Hero.prototype.update = function() {
  // write your prefab's specific update code here
};

Hero.prototype.getTreasure = function() {
  this.events.onTreasure.dispatch();
};

module.exports = Hero;

},{"../utils/CellTypes":10,"./Entity":2}],4:[function(require,module,exports){
'use strict';

var Primative = function(game, x, y, color, size) {
  this.color = color || '#ffffff';
  this.size = size || 10;
  console.log('primative size:', this.size);
  this.bmd = game.make.bitmapData(size,size);
  this.updateTexture();
  Phaser.Sprite.call(this, game, x, y, this.bmd);

  // initialize your prefab here
  
};

Primative.prototype = Object.create(Phaser.Sprite.prototype);
Primative.prototype.constructor = Primative;

Primative.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};


Primative.prototype.updateTexture = function() {
  this.bmd.clear();
  var ctx = this.bmd.ctx;
  ctx.fillStyle = this.color;
  ctx.fillRect(0,0,this.size,this.size);
  this.bmd.render();
  this.bmd.refreshBuffer();
  this.bmd.dirty = true;
};

module.exports = Primative;

},{}],5:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],6:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {

    this.titleText = this.game.add.bitmapText(200, 100, 'minecraftia','Game Over\n',64);
    
    this.congratsText = this.game.add.bitmapText(320, 200, 'minecraftia','You win!',32);

    this.instructionText = this.game.add.bitmapText(330, 300, 'minecraftia','Tap to play again!',12);
    
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],7:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {

    this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'yeoman');
    this.sprite.anchor.setTo(0.5, 0.5);

    this.sprite.angle = -20;
    this.game.add.tween(this.sprite).to({angle: 20}, 1000, Phaser.Easing.Linear.NONE, true, 0, 1000, true);


    this.titleText = this.game.add.bitmapText(200, 250, 'minecraftia','\'Allo, \'Allo!',64);

    this.instructionsText = this.game.add.bitmapText(200, 400, 'minecraftia','Tap anywhere to play\n "Catch the Yeoman Logo"',24);
    this.instructionsText.align = 'center';
    
  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};

module.exports = Menu;

},{}],8:[function(require,module,exports){

  'use strict';
  var CellularMapGenerator = require('../utils/CellularMapGenerator');
  var CellTypes = require('../utils/CellTypes');
  var DungeonLevel = require('../utils/DungeonLevel');
  var Hero = require('../prefabs/Hero');
  function Play() {
    this.map = null;
    this.layer = null;
    this.levels = [];
    this.levelLookup = {};
    this.tickTimer = 0;
    this.tickRate = 100;
  }
  Play.prototype = {
    create: function() {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      
      console.time('generateManyMaps');
      var levelCounter = 1;
      
      for(var i = 10; i <= 30; i+=1){
        this.levels.push({id: levelCounter, size: i, map:new CellularMapGenerator(i, i, 6)});
        this.levelLookup[levelCounter] = this.levels.length -1;
        levelCounter++;
      }

      console.timeEnd('generateManyMaps');
      console.log('generated',this.levels.length,'levels');
      
      this.map = this.game.add.tilemap();
      this.map.addTilesetImage('dungeon-tiles', 'dungeon-tiles', 70,70);
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.createTileMapFromLevel(1);
      this.heroes = this.game.add.group();
      this.heroes.add(new Hero(this.game));
      this.heroes.z = 1000;
      this.game.camera.follow(this.heroes.getAt(0));
      this.level = new DungeonLevel(this.map, this.layer,'dungeon-tiles',this.heroes);
      this.level.events.onExit.add(this.nextDungeon, this);
    },
    update: function() {
      if(this.tickTimer <= this.game.time.now) {
        this.level.tick();
        this.tickTimer = this.game.time.now + this.tickRate;
      }

      if(this.cursors.right.isDown) {
        this.game.camera.x +=5;
      }
      if(this.cursors.left.isDown) {
        this.game.camera.x -=5;
      }
      if(this.cursors.up.isDown) {
        this.game.camera.y -=5;
      }
      if(this.cursors.down.isDown) {
        this.game.camera.y +=5;
      }
      this.game.physics.arcade.collide(this.heroes, this.layer);
      
      
    },
    drawMap: function() {
      this.bmd.clear();
      var ctx = this.bmd.ctx;
      var map = this.mapGenerator.grid;
      
      var row;

      for(var y = 0; y < this.mapGenerator.height; y++) {
        for(var x = 0; x < this.mapGenerator.width; x++) {
          ctx.fillStyle = map[y][x].color;
          ctx.fillRect(x*10, y*10, 10,10);
        }
      }
      this.bmd.render();
      this.bmd.refreshBuffer();
    },
    createTileMapFromLevel: function(levelId) {
      var level = this.levels[this.levelLookup[levelId]];
      console.time('createTileMap');
      
      this.layer = this.map.create('level1', level.map.width, level.map.height, 70, 70);
      this.layer.resizeWorld();
      var currentLayer = this.layer;
      for(var y = 0; y < level.map.height; y++) {
        for(var x = 0; x < level.map.width; x++) {
          var tile = level.map.grid[y][x];
          var newTile = this.map.putTile(tile.tileIndex,currentLayer.getTileX(x*70), currentLayer.getTileY(y*70), currentLayer);
          newTile.properties.cellType = tile;
        }
      }
      this.map.setTileIndexCallback(CellTypes.TREASURE.tileIndex, this.onTreasureCollision, this);
      this.map.setTileIndexCallback(CellTypes.EXIT.tileIndex, this.onExitCollision, this);
      
      console.log('map:', this.map);
      console.timeEnd('createTileMap');
    },

    nextDungeon: function(heroes) {
      var nextLevel = heroes.getAt(0).currentDungeonLevel + 1;
      heroes.setAll('currentDungeonLevel', nextLevel);
      heroes.setAll('canAdvance', false);
      this.map.removeAllLayers();
      this.createTileMapFromLevel(nextLevel);
      this.level = new DungeonLevel(this.map, this.layer,'dungeon-tiles',heroes);
      this.game.world.bringToTop(this.heroes);
    },
    onTreasureCollision: function(hero, tile) {
      hero.events.onTreasure.dispatch(tile);
    },

    onExitCollision: function(hero) {
      if(hero.canAdvance) {
        hero.events.onExit.dispatch();
      }
    },
    render: function() {
      /*
      this.game.debug.text('(L)/(R) Change Map Size: ' + this.mapSize,20, this.game.height - 80);
      this.game.debug.text('Entrance',20,this.game.height - 60, '#00ff00');
      this.game.debug.text('Exit',20,this.game.height - 40, '#0000ff');
      this.game.debug.text('Treasures: ' + this.mapGenerator.treasures.length,20,this.game.height - 20, '#ffff00');
      */
    }
};
  
  module.exports = Play;
},{"../prefabs/Hero":3,"../utils/CellTypes":10,"../utils/CellularMapGenerator":11,"../utils/DungeonLevel":12}],9:[function(require,module,exports){
'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.game.width/2,this.game.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('yeoman', 'assets/yeoman-logo.png');
    this.load.spritesheet('dungeon-tiles', 'assets/tiles.png', 70, 70, 3);
    this.load.image('hero', 'assets/p2_stand.png');
    this.load.bitmapFont('minecraftia', 'assets/fonts/minecraftia.png', 'assets/fonts/minecraftia.xml');


  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('play');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}],10:[function(require,module,exports){
module.exports = Object.freeze({
  FLOOR: {
    name: 'FLOOR',
    tileIndex: 4,
    walkable: true,
    symbol: '.'
  },
  WALL: {
    name: 'WALL',
    tileIndex: 3,
    walkable: false,
    symbol: '#'
  },
  ENTRY: {
    name: 'ENTRY',
    tileIndex: 2,
    walkable: true,
    symbol: '^'
  },
  EXIT: {
    name: 'EXIT',
    tileIndex: 1,
    walkable: true,
    symbol: 'v'
  },
  TREASURE: {
    name: 'TREASURE',
    tileIndex: 0,
    walkable: true,
    symbol: '†'
  },
  FILLED: {
    name: 'FILLED',
    tileIndex: -1,
    walkable: null
  }
});


},{}],11:[function(require,module,exports){
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
},{"./CellTypes":10}],12:[function(require,module,exports){
'use strict';
var CellTypes = require('../utils/CellTypes');
var DungeonLevel = function(map, layer, tilesetName, heroes) {
  this.walkableIndex = 0;
  this._tilemap = map;
  this._layerIndex = layer.index;
  this._layer = layer;
  this._tilesetIndex = this._tilemap.getTilesetIndex(tilesetName);
  this._tiles = this.getAllTiles();
  this._open;
  this._closed;
  this._visited; 
  this._useDiagonal = false;
  this._findClosest = false;
  this._walkablePropName = 'walkable';
  this._distanceFunction = DungeonLevel.DISTANCE_EUCLIDIAN;
  this._lastPath = null;
  this._debug = true;
  this.heroes  = heroes;
  this.interesting = {
    entry: {
      tiles: this.findTilesByCellType(CellTypes.ENTRY),
      cellType: CellTypes.ENTRY
    },
    exit: {
      tiles: this.findTilesByCellType(CellTypes.EXIT),
      cellType: CellTypes.EXIT
    },
    treasure: {
      tiles: this.findTilesByCellType(CellTypes.TREASURE),
      cellType: CellTypes.TREASURE
    }
  };
  this.events = {
    onExit: new Phaser.Signal()
  };
  this.updateMap();
  console.log('interseting:', this.interesting);
  this.heroes.setAll('mapPosition', this.interesting.entry.tiles[0]);
  this.heroes.children.forEach(function(hero) {
    hero.events.onTreasure.add(this.clearTile, this);
    hero.events.onExit.add(this.exitLevel, this);
    hero.canAdvance = false;
  }, this);

  return this;
  
};

DungeonLevel.DISTANCE_MANHATTAN = 'distManhattan';
DungeonLevel.DISTANCE_EUCLIDIAN = 'distEuclidian';
DungeonLevel.COST_ORTHOGONAL = 1;
DungeonLevel.COST_DIAGONAL = DungeonLevel.COST_ORTHOGONAL*Math.sqrt(2);


module.exports = DungeonLevel;


DungeonLevel.prototype.tick = function() {
  var targetObj = {};
  var targetTypes;
  
  if(this.heroes) {
    this.heroes.forEach(function(hero) {
      var paths = [];
      targetTypes = hero.targetWeights;
      targetTypes.forEach(function(type) {
        var matches = _.filter(this.interesting, {cellType: type.cellType});
        matches.forEach(function(match) {
          match.tiles.forEach(function(tile) {
            var path = this.findPath(hero.mapPosition, {x: tile.x, y: tile.y});
            if(path.nodes.length) {
              var pathObj = {path: path, order: path.nodes.length / type.weight, node: path.nodes[path.nodes.length-1]  }
              paths.push(pathObj);
            }
          }, this);
        }, this);
      }, this);
      paths.sort(function(a, b) {
        return a.order - b.order;
      });
      if(paths.length) {
        hero.mapPosition = paths[0].node;
      }
    }, this);
  }
};


DungeonLevel.prototype.findTilesByCellType = function(type) {
  var matching = [];
  this._tiles.forEach(function(tile) {
    if(_.isEqual(tile.properties.cellType,type)) {
      matching.push(tile);
    }
  });
  return matching;
};

DungeonLevel.prototype.findInterestingTilesByCellType = function(cellType) {
  var matching = [];
  _.forOwn(this.interesting, function(item) {
    if(_.isEqual(item.cellType, cellType)) {
      matching = item.tiles;
    }
  });
  return matching;
};




DungeonLevel.prototype.getAllTiles = function() {
  var tiles = [];;
  for(var x = 0; x < this._tilemap.width; x++) {
    for(var y = 0; y < this._tilemap.height; y++) {
      tiles.push(this._tilemap.getTile(x,y, this._layerIndex));
    }
  }
  return tiles;
};

DungeonLevel.prototype.clearTile = function(tile) {
  this._tilemap.putTile(CellTypes.FLOOR.tileIndex, tile.x, tile.y, this._tilemap.currentLayer);
  var interesting = _.find(this.interesting, {cellType: tile.properties.cellType});
  _.remove(interesting.tiles, tile);
  if(this.interesting.treasure.tiles.length === 0) {
    this.heroes.setAll('canAdvance', true);
  }

};

DungeonLevel.prototype.exitLevel = function() {
  console.log('exiting level...');
  this.events.onExit.dispatch(this.heroes);
};



DungeonLevel.prototype.updateMap = function()
{
    var tile;
    var walkable;

    //for each tile, add a default AStarNode with x, y and walkable properties according to the tilemap/tileset datas
    for(var y=0; y < this._tilemap.height; y++)
    {
        for(var x=0; x < this._tilemap.width; x++)
        {
            tile = this._tilemap.layers[this._layerIndex].data[y][x];
            walkable = tile.properties.cellType.walkable;
            tile.properties.astarNode = new DungeonLevel.AStarNode(x, y, walkable);
        }
    }

};


/**
 * Find a path between to tiles coordinates
 * @method DungeonLevel#findPath
 * @public
 * @param {Phaser.Point} startPoint - The start point x, y in tiles coordinates to search a path.
 * @param {Phaser.Point} goalPoint - The goal point x, y in tiles coordinates that you trying to reach.
 * @return {DungeonLevel.AStarPath} The DungeonLevel.AStarPath that results
 */
DungeonLevel.prototype.findPath = function(startPoint, goalPoint)
{
    var path = new DungeonLevel.AStarPath();

    var start = this._tilemap.layers[this._layerIndex].data[startPoint.y][startPoint.x].properties.astarNode; //:AStarNode;
    var goal = this._tilemap.layers[this._layerIndex].data[goalPoint.y][goalPoint.x].properties.astarNode

    path.start = start;
    path.goal = goal;

    this._open = [];
    this._closed = [];
    this._visited = [];
   
    this._open.push(start);
    
    start.g = 0;
    start.h = this[this._distanceFunction](start, goal);
    start.f = start.h;
    start.parent = null;                    
   
    //Loop until there are no more nodes to search
    while(this._open.length > 0) 
    {
        //Find lowest f in this._open
        var f = Infinity;
        var x;
        for (var i=0; i<this._open.length; i++) 
        {
            if (this._open[i].f < f) 
            {
                x = this._open[i];
                f = x.f;
            }
        }
       
        //Solution found, return solution
        if (x == goal) 
        {
            path.nodes = this.reconstructPath(goal);
            this._lastPath = path;
            if(this._debug === true) path.visited = this._visited;
            return path;
        }    
       
        //Close current node
        this._open.splice(this._open.indexOf(x), 1);
        this._closed.push(x);
       
        //Then get its neighbors       
        var n = this.neighbors(x);

        for(var yIndex=0; yIndex < n.length; yIndex++) 
        {

            var y = n[yIndex];
               
            if (-1 != this._closed.indexOf(y))
                continue;
           
            var g = x.g + y.travelCost;
            var better = false;
           
            //Add the node for being considered next loop.
            if (-1 == this._open.indexOf(y)) 
            {
                    this._open.push(y);
                    better = true;
                    if(this._debug === true) this.visit(y);
            } 
            else if (g < y.g) 
            {
                    better = true;
            }

            if (better) {
                    y.parent = x;
                    y.g = g;
                    y.h = this[this._distanceFunction](y, goal);
                    y.f = y.g + y.h;
            }
               
        }
           
    }

    //If no solution found, does A* try to return the closest result?
    if(this._findClosest === true)
    {
        var min = Infinity;
        var closestGoal, node, dist;
        for(var i=0, ii=this._closed.length; i<ii; i++) 
        {
            node = this._closed[i];

            var dist = this[this._distanceFunction](goal, node);
            if (dist < min) 
            {
                min = dist;
                closestGoal = node;
            }
        }

        //Reconstruct a path a path from the closestGoal
        path.nodes = this.reconstructPath(closestGoal);
        if(this._debug === true) path.visited = this._visited;
    }

    this._lastPath = path;

    return path;                              
};


/**
 * Reconstruct the result path backwards from the goal point, crawling its parents. Internal method.
 * @method DungeonLevel-reconstructPath
 * @private
 * @param {DungeonLevel.AStarNode} n - The astar node from wich you want to rebuild the path.
 * @return {array} An array of DungeonLevel.AStarNode
 */ 
DungeonLevel.prototype.reconstructPath = function(n) 
{
    var solution = [];
    var nn = n;
    while(nn.parent) {
            solution.push({x: nn.x, y: nn.y});
            nn = nn.parent;
    }
    return solution;
};

 
/**
 * Add a node into visited if it is not already in. Debug only.
 * @method DungeonLevel-visit
 * @private
 * @param {DungeonLevel.AStarNode} node - The astar node you want to register as visited
 * @return {void}
 */ 
DungeonLevel.prototype.visit = function(node)
{
    for(var i in this._visited)
    {
        if (this._visited[i] == node) return;
    }

    this._visited.push(node);
};
   

/**
 * Add a node into visited if it is not already in. Debug only.
 * @method DungeonLevel-neighbors
 * @private
 * @param {DungeonLevel.AStarNode} n - The astar node you want to register as visited
 * @return {void}
 */
DungeonLevel.prototype.neighbors = function(node)
{
    var x = node.x;
    var y = node.y;
    var n = null;
    var neighbors = [];
   
    var map = this._tilemap.layers[this._layerIndex].data;

    //West
    if (x > 0) {
           
        n = map[y][x-1].properties.astarNode;
        if (n.walkable) {
            n.travelCost = DungeonLevel.COST_ORTHOGONAL;
            neighbors.push(n);
        }
    }
    //East
    if (x < this._tilemap.width-1) {
        n = map[y][x+1].properties.astarNode;
        if (n.walkable) {
            n.travelCost = DungeonLevel.COST_ORTHOGONAL;
            neighbors.push(n);
        }
    }
    //North
    if (y > 0) {
        n = map[y-1][x].properties.astarNode;
        if (n.walkable) {
            n.travelCost = DungeonLevel.COST_ORTHOGONAL;
            neighbors.push(n);
        }
    }
    //South
    if (y < this._tilemap.height-1) {
        n = map[y+1][x].properties.astarNode;
        if (n.walkable) {
            n.travelCost = DungeonLevel.COST_ORTHOGONAL;
            neighbors.push(n);
        }
    }
   
    //If diagonals aren't used do not search for other neighbors and return orthogonal search result
    if(this._useDiagonal === false)
        return neighbors;
   
    //NorthWest
    if (x > 0 && y > 0) {
        n = map[y-1][x-1].properties.astarNode;
        if (n.walkable
            && map[y][x-1].properties.astarNode.walkable
            && map[y-1][x].properties.astarNode.walkable
        ) {                                            
            n.travelCost = DungeonLevel.COST_DIAGONAL;
            neighbors.push(n);
        }
    }
    //NorthEast
    if (x < this._tilemap.width-1 && y > 0) {
        n = map[y-1][x+1].properties.astarNode;
        if (n.walkable
            && map[y][x+1].properties.astarNode.walkable
            && map[y-1][x].properties.astarNode.walkable
        ) {
            n.travelCost = DungeonLevel.COST_DIAGONAL;
            neighbors.push(n);
        }
    }
    //SouthWest
    if (x > 0 && y < this._tilemap.height-1) {
        n = map[y+1][x-1].properties.astarNode;
        if (n.walkable
            && map[y][x-1].properties.astarNode.walkable
            && map[y+1][x].properties.astarNode.walkable
        ) {
            n.travelCost = DungeonLevel.COST_DIAGONAL;
            neighbors.push(n);
        }
    }
    //SouthEast
    if (x < this._tilemap.width-1 && y < this._tilemap.height-1) {
        n = map[y+1][x+1].properties.astarNode;
        if (n.walkable
            && map[y][x+1].properties.astarNode.walkable
            && map[y+1][x].properties.astarNode.walkable
        ) {
            n.travelCost = DungeonLevel.COST_DIAGONAL;
            neighbors.push(n);
        }
    }
   
    return neighbors;
};


/**
 * Calculate a distance between tow astar nodes coordinates according to the Manhattan method
 * @method DungeonLevel-distManhattan
 * @private
 * @param {DungeonLevel.AStarNode} nodeA - The A node.
 * @param {DungeonLevel.AStarNode} nodeB - The B node.
 * @return {number} The distance between nodeA and nodeB
 */
DungeonLevel.prototype.distManhattan = function (nodeA, nodeB) 
{
    return Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y);
};

/**
 * Calculate a distance between tow astar nodes coordinates according to the Euclidian method. More accurate
 * @method DungeonLevel-distEuclidian
 * @private
 * @param {DungeonLevel.AStarNode} nodeA - The A node.
 * @param {DungeonLevel.AStarNode} nodeB - The B node.
 * @return {number} The distance between nodeA and nodeB
 */
DungeonLevel.prototype.distEuclidian = function(nodeA, nodeB)
{
    return Math.sqrt(Math.pow((nodeA.x - nodeB.x), 2) + Math.pow((nodeA.y  -nodeB.y), 2));
};


/**
 * Tells if a tile is walkable from its tilemap coordinates
 * @method DungeonLevel-isWalkable
 * @public
 * @param {number} x - The x coordiante of the tile in tilemap's coordinate.
 * @param {number} y - The y coordinate of the tile in tilemap's coordinate.
 * @return {boolean} The distance between nodeA and nodeB
 */
DungeonLevel.prototype.isWalkable = function(x, y)
{  
    return this._tilemap.layers[this._layerIndex].data[y][x].properties.astarNode.walkable;
};


/**
 * @properties {string} version - The version number of DungeonLevel read only
 */
Object.defineProperty(DungeonLevel.prototype, "version", {
    
    get: function () {
        return DungeonLevel.VERSION;
    }

});

        
/**
* AStarNode is an object that stores AStar value. Each tile have an AStarNode in their properties
* @class DungeonLevel.AStarNode
* @constructor
* @param {number} x - The x coordinate of the tile.
* @param {number} y - The y coordinate of the tile.
* @param {boolean} isWalkable - Is this tile is walkable?
*/
DungeonLevel.AStarNode = function(x, y, isWalkable)
{

    /**
    * @property {number} x - The x coordinate of the tile.
    */
    this.x = x;
    
    /**
    * @property {number} y - The y coordinate of the tile.
    */
    this.y = y;

    /**
    * @property {number} g - The total travel cost from the start point. Sum of COST_ORTHOGONAL and COST_DIAGONAL
    */
    this.g = 0;

    /**
    * @property {number} h - The remaing distance as the crow flies between this node and the goal.
    */
    this.h = 0;

    /**
    * @property {number} f - The weight. Sum of g + h.
    */
    this.f = 0;

    /**
     * @property {DungeonLevel.AStarNode} parent - Where do we come from? It's an AStarNode reference needed to reconstruct a path backwards (from goal to start point)
     */
    this.parent; 

    /**
     * @property {boolean} walkable - Is this node is walkable?
     */
    this.walkable = isWalkable;

    /**
     * @property {number} travelCost - The cost to travel to this node, COST_ORTHOGONAL or COST_DIAGONAL 
     */
    this.travelCost;
};


/**
* AStarPath is an object that stores a searchPath result.
* @class DungeonLevel.AStarPath
* @constructor
* @param {array} nodes - An array of nodes coordinates sorted backward from goal to start point.
* @param {DungeonLevelNode} start - The start AStarNode used for the searchPath.
* @param {DungeonLevelNode} goal - The goal AStarNode used for the searchPath.
*/
DungeonLevel.AStarPath = function(nodes, start, goal)
{
    /**
     * @property {array} nodes - Array of AstarNodes x, y coordiantes that are the path solution from goal to start point. 
     */
    this.nodes = nodes || [];

    /**
     * @property {DungeonLevel.AStarNode} start - Reference to the start point used by findPath. 
     */
    this.start = start || null;

    /**
     * @property {DungeonLevel.AStarNode} goal - Reference to the goal point used by findPath. 
     */
    this.goal = goal || null;

    /**
     * @property {array} visited - Array of AStarNodes that the findPath algorythm has visited. Used for debug only.
     */
    this.visited = [];
};


/**
* Debug method to draw the last calculated path by AStar
* @method Phaser.Utils.Debug.AStar
* @param {DungeonLevel} astar- The AStar plugin that you want to debug.
* @param {number} x - X position on camera for debug display.
* @param {number} y - Y position on camera for debug display.
* @param {string} color - Color to stroke the path line.
* @return {void}
*/
Phaser.Utils.Debug.prototype.AStar = function(astar, x, y, color, showVisited)
{
    if (this.context == null)
    {
        return;
    }
    
    var pathLength = 0;
    if(astar._lastPath !== null)
    {
        pathLength = astar._lastPath.nodes.length;
    }

    color = color || 'rgb(255,255,255)';

    game.debug.start(x, y, color);


    if(pathLength > 0)
    {
        var node = astar._lastPath.nodes[0];
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.moveTo((node.x * astar._tilemap.tileWidth) + (astar._tilemap.tileWidth/2) - game.camera.view.x, (node.y * astar._tilemap.tileHeight) + (astar._tilemap.tileHeight/2) - game.camera.view.y);

        for(var i=0; i<pathLength; i++)
        {
            node = astar._lastPath.nodes[i];
            this.context.lineTo((node.x * astar._tilemap.tileWidth) + (astar._tilemap.tileWidth/2) - game.camera.view.x, (node.y * astar._tilemap.tileHeight) + (astar._tilemap.tileHeight/2) - game.camera.view.y);
        }

        this.context.lineTo((astar._lastPath.start.x * astar._tilemap.tileWidth) + (astar._tilemap.tileWidth/2) - game.camera.view.x, (astar._lastPath.start.y * astar._tilemap.tileHeight) + (astar._tilemap.tileHeight/2) - game.camera.view.y);

        this.context.stroke(); 

        //Draw circles on visited nodes
        if(showVisited !== false)
        {
            var visitedNode;
            for(var j=0; j < astar._lastPath.visited.length; j++)
            {
                visitedNode = astar._lastPath.visited[j];
                this.context.beginPath();
                this.context.arc((visitedNode.x * astar._tilemap.tileWidth) + (astar._tilemap.tileWidth/2) - game.camera.view.x, (visitedNode.y * astar._tilemap.tileHeight) + (astar._tilemap.tileHeight/2) - game.camera.view.y, 2, 0, Math.PI*2, true);
                this.context.stroke(); 
            }
        }
    }

    this.line('Path length: ' + pathLength);
    this.line('Distance func: ' + astar._distanceFunction);
    this.line('Use diagonal: ' + astar._useDiagonal);
    this.line('Find Closest: ' + astar._findClosest);

    game.debug.stop();
};




},{"../utils/CellTypes":10}]},{},[1])