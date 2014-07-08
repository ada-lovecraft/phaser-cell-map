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
