
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