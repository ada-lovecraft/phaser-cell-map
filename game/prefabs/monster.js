'use strict';

var Monster = function(game, x, y, color) {
  Primative.call(this, game, x, y, color,32);

  this.type = 'MONSTER';

  this.targetWeights = [
    HERO: 1.0
  ];
  
};

Monster.prototype = Object.create(Primative.prototype);
Monster.prototype.constructor = Monster;

Monster.prototype.update = function() {
  // write your prefab's specific update code here
};

module.exports = Monster;
