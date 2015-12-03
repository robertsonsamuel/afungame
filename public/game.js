/* global Phaser RemotePlayer io */
var game = new Phaser.Game(800, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

  game.load.image('sky', 'assets/skybox.png');
  game.load.image('ground', 'assets/platform2.png');
  game.load.image('platform', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.image('diamond', 'assets/diamond.png');
  game.load.image('bullet', 'assets/bullet.png');
  game.load.spritesheet('dude', './assets/dude.png', 32, 48);
  

}

var socket; // Socket connections
var player;
var platforms;
var cursors;
var enemies;
var stars;
var diamonds;
var score = 0;
var scoreText;

var currentSpeed = 0;
var cursors;

var bullets;
var fireRate = 100;
var nextFire = 0;


function create () {
  enemies = [];
  socket = io.connect("http://localhost:3000");


  game.physics.startSystem(Phaser.Physics.ARCADE);
   //add sky
   game.add.sprite(0, 0, 'sky');
   platforms = game.add.group();
   platforms.enableBody = true;

   var ground = platforms.create(0, game.world.height - 64, 'ground');


   var plat1= platforms.create(200, 600,'platform');
   plat1.scale.setTo(3,2)
   plat1.body.immovable = true;

   var plat2= platforms.create(100, 500,'platform');
   plat2.scale.setTo(3,1)
   plat2.body.immovable = true;  

   var plat3= platforms.create(500, 450,'platform');
   plat3.scale.setTo(2,2)
   plat3.body.immovable = true;

   var plat4= platforms.create(500, 300, 'platform');
   plat4.body.immovable = true;

   var plat5= platforms.create(200, 100, 'platform');
   plat5.body.immovable = true;

   var plat6= platforms.create(350, 225, 'platform');
   plat6.body.immovable = true;

   var plat7= platforms.create(150, 300,'platform');
   plat7.body.immovable = true;   

   var plat8= platforms.create(250, 425,'platform');
   plat8.scale.setTo(2,1)
   plat8.body.immovable = true;

   var plat9= platforms.create(650, 650,'platform');
   plat9.body.immovable = true;

   var plat10= platforms.create(650, 200,'platform');
   plat10.body.immovable = true;



   stars = game.add.group();
   stars.enableBody = true;
   var star = stars.create(200, 00, 'star');

   star.body.bounce.y = 0.7 + Math.random() * 0.2;
   star.body.gravity.y = 300;

   diamonds = game.add.group();
   diamonds.enableBody = true;
   var diamond = diamonds.create(650, 50, 'diamond');

   diamond.body.bounce.y = 0.7 + Math.random() * 0.2;
   diamond.body.gravity.y = 300;

   star.body.bounce.y = 0.7 + Math.random() * 0.2;
   star.body.gravity.y = 300;

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


   bullets = game.add.group();
   bullets.enableBody = true;        
   bullets.physicsBodyType = Phaser.Physics.ARCADE;
   bullets.createMultiple(30, 'bullet', 0, false);
   bullets.setAll('anchor.x', 0.5);
   bullets.setAll('anchor.y', 0.5);
   bullets.setAll('outOfBoundsKill', true);
   bullets.setAll('checkWorldBounds', true);







   scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });





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
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.overlap(player, stars, collectStar, null, this);
  game.physics.arcade.collide(diamonds, platforms);
  game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this);
  
  player.body.velocity.x = 0;
  socket.emit('move player', { x: player.body.x, y: player.body.y });

  if (cursors.left.isDown){
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
      }
      else if (cursors.right.isDown){
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
      }
      else{
        //  Stand still
        player.animations.stop();

        player.frame = 4;
      }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down){
      player.body.velocity.y = -350;
    }

    if (game.input.activePointer.isDown){
        //  Boom!
        fire();
      }



    }


    function fire(){
      if (game.time.now > nextFire && bullets.countDead() > 0){
        nextFire = game.time.now + fireRate;
        bullet = bullets.getFirstDead();
        bullet.reset(player.x + 80, player.y + 10)
        bullet.damageAmount = 1
        game.physics.arcade.moveToPointer(bullet, 400);
        console.log(bullet)
      }
    }

    function collectStar (player, star) {
      star.kill();
      socket.emit('playerwon');  

    }

    function collectDiamond (player, diamond) {
      diamond.kill();
      socket.emit('playerwon');  

    }





    var setEventHandlers = function  () {
   // Socket connection successful
   socket.on('connect', onSocketConnected);
   socket.on('new player', onNewPlayer);
   socket.on('move player', onMovePlayer);
   socket.on('remove player', onRemovePlayer);
   socket.on('disconnect', onSocketDisconnect);
   socket.on('gameover', gameover);


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


function onMoveStar (data) {
  stars.children[0].position.x = data.x;
  stars.children[0].position.y = data.y;
}


function gameover (data) {
  alert('Item Collected!');
  console.log('Item Collected', data);  
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
