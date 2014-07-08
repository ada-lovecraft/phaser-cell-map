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
