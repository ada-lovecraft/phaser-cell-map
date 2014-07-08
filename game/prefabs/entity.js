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
