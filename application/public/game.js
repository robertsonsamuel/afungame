/* global Phaser RemotePlayer io */
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.spritesheet('dude', './assets/dude.png', 32, 48);
  

}

var socket; // Socket connections
var player;
var platforms;
var cursors;
var enemies;
var stars;
var score = 0;
var scoreText;


function create () {
  enemies = [];
  socket = io.connect("http://localhost:3000");

 game.physics.startSystem(Phaser.Physics.ARCADE);
   //add sky
   game.add.sprite(0, 0, 'sky');
   platforms = game.add.group();
   platforms.enableBody = true;

   var ground = platforms.create(0, game.world.height - 64, 'ground');
   ground.scale.setTo(2, 2);
   ground.body.immovable = true;

   player = game.add.sprite(32, game.world.height - 150, 'dude');
   game.physics.arcade.enable(player);
   player.body.collideWorldBounds = true;
   player.body.bounce.y = 0.2;
   player.body.gravity.y = 300;
   player.body.collideWorldBounds = true;

  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

   cursors = game.input.keyboard.createCursorKeys();
   setEventHandlers();
 }

 function update () {
  // console.log('enemies:', enemies);
  // for (var i = 0; i < enemies.length; i++) {
  //   if (enemies[i].alive) {
  //     enemies[i].update()
  //     game.physics.collide(player, enemies[i].player)
  //   }
  // }
  game.physics.arcade.collide(player, platforms);
  player.body.velocity.x = 0;
  socket.emit('move player', { x: player.body.x, y: player.body.y })

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }
    
    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.body.velocity.y = -350;
    }

}














var setEventHandlers = function  () {
   // Socket connection successful
  socket.on('connect', onSocketConnected);
  socket.on('new player', onNewPlayer);
  socket.on('move player', onMovePlayer);
  socket.on('remove player', onRemovePlayer);
  socket.on('disconnect', onSocketDisconnect);
}

function onSocketConnected () {
  console.log('Connected to socket server')

  // Send local player data to the game server
  socket.emit('new player', { x: player.body.x, y: player.body.y })
}


function onSocketDisconnect () {
  console.log('Disconnected from socket server')
}


function onNewPlayer (data) {
  console.log('New player connected:', data.id)

  // Add new player to the remote players array
  enemies.push(new RemotePlayer(data.id, game, player, data.x, data.y)) 
  //console.log('enimies:',enemies);
}

function onRemovePlayer (data) {
  var removePlayer = playerById(data.id);
  console.log('removePlayer:', removePlayer);

  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', data.id)
    return;
  }

  removePlayer.player.kill()

  // Remove player from array
  enemies.splice(enemies.indexOf(removePlayer), 1)
}

function onMovePlayer (data) {

  var movePlayer = playerById(data.id)

  // Player not found
  if (!movePlayer) {
    console.log('Player not found: ', data.id)
    return
  }

  // Update player position
  movePlayer.player.x = data.x
  movePlayer.player.y = data.y
}


// Find player by ID
function playerById (id) {
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i].player.name === id) {
      return enemies[i]
    }
  }

  return false
}
