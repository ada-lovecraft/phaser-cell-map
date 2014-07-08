
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
