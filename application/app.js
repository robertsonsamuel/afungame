'use strict';

var http = require('http');
var path = require('path');
var express = require('express');
var app = express();

var server = http.Server(app)

var io = require('socket.io')(server);
var Player = require('playerSchema');

app.use(express.static('public'));


app.use('/', function  (req, res) {
  res.sendFile(path.join(__dirname, 'public/index.html'));
})

var PORT = process.env.PORT || 3000;
server.listen('Listening on port:', PORT);



