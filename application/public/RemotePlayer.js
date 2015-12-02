/* global game */

var RemotePlayer = function (index, game, player, startX, startY) {
  var x = startX;
  var y = startY;

  this.game = game
  this.player = player
  //console.log(this.player);
  this.player = game.add.sprite(x, y, 'dude')
  // this.player.animations.add('move', [0, 1, 2, 3, 4, 5, 6, 7], 20, true)
  // this.player.animations.add('stop', [3], 20, true)
  this.player.animations.add('left', [0, 1, 2, 3], 10, true);
  this.player.animations.add('right', [5, 6, 7, 8], 10, true);
 
  console.log('player:', player);
  this.player.name = index.toString();
  //this.player.collideWorldBounds = true
  //this.player.bounce[y] = 0.2;
  //this.player.body.gravity.y = 300;
  this.lastPosition = { x: x, y: y }
  console.log('thisplayer', this.player);
}

RemotePlayer.prototype.update = function () {

  this.lastPosition.x = this.player.x
  this.lastPosition.y = this.player.y
}

window.RemotePlayer = RemotePlayer