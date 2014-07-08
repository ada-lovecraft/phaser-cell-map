'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '<%= _.slugify(projectName) %>');

  // Game States
  <% _.forEach(gameStates, function(gameState) {  %>game.state.add('<%= gameState.shortName %>', require('./states/<%= gameState.shortName %>'));
  <% }); %>

  game.state.start('boot');
};