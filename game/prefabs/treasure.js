'use strict';

var Entity = require('./Entity');
var Treasure = function(game, x, y) {
  Entity.call(this, game, x, y, 'dungeon-tiles', 0);

  // initialize your prefab here
  
};

Treasure.prototype = Object.create(Entity.prototype);
Treasure.prototype.constructor = Treasure;

Treasure.prototype.update = function() {
  
  // write your prefab's specific update code here
  
};

module.exports = Treasure;
