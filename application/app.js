'use strict';

var http = require('http');
var path = require('path');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var server = http.Server(app)
var io = require('socket.io');
var Player = require('./playerSchema');

var players=[];
var socket;


app.use(express.static('public'));


app.use('/', function  (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
})


server.listen(PORT, function  (err) {
  if(err) throw err;
  init();  // starts game server listener
});



function init () {
  players = [];

  socket = io.listen(server).on('error', function  (err) {
    console.log(err);
  });

  // Only use WebSockets
  // socket.set('transports', ['websocket'])

  setEventHandlers();
}



var setEventHandlers = function  () {
  socket.on('connection', onSocketConnection).on('error', function  (err) {
    console.log(err);
  });


}

function onSocketConnection (client) {
  console.log('New player has connected: ' + client.id)

  // Listen for client disconnected
  //client.on('disconnect', onClientDisconnect)

  // Listen for new player message
  client.on('new player', onNewPlayer)

  // Listen for move player message
  client.on('move player', onMovePlayer)

  client.on('disconnect', onClientDisconnect)

  client.on('kill star', onKillstar)

  // client.on('remove player', onRemovePlayer)
}

function onClientDisconnect(){
  console.log('player is disconnected', this.id);
  var removePlayer = playerById(this.id);

  if (!removePlayer) {
    console.log('player not found' + this.id);
    return;
  }

  players.splice(players.indexOf(removePlayer), 1);

  this.broadcast.emit('remove player', { id: this.id});
}






function onNewPlayer (data) {

  // Create a new player
  var newPlayer = new Player(data.x, data.y)
  
  newPlayer.id = this.id

  // Broadcast new player to connected socket clients
  this.broadcast.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()})

  // Send existing players to the new player
  var i, existingPlayer
  for (i = 0; i < players.length; i++) {
    existingPlayer = players[i]
    this.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()})
  }

  // Add new player to the players array
  players.push(newPlayer)


}


// Player has moved
function onMovePlayer (data) {

  // Find player in array
  var movePlayer = playerById(this.id)
  // Player not found
  if (!movePlayer) {
    //console.log('Player not found: ' + this.id)
    return
  }

  // Update player position
  movePlayer.setX(data.x)
  movePlayer.setY(data.y)

  // Broadcast updated position to connected socket clients
  this.broadcast.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()})
}

function onKillstar (data) {
  this.emit('starKilled');
  
}




// Find player by ID
function playerById (id) {

  var i
  for (i = 0; i < players.length; i++) {
    if (players[i].id === id) {
      return players[i]
    }
  }

  return false
}