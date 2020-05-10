#!/usr/bin/env node

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter port: (3000 is default)", function(port) {
    if(port=='') {
        var port = process.env.PORT || 3000;
    }
});

rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http, {
  pingInterval: 1000,
  pingTimeout: 3000
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

console.log("//////////////////////////////////////////////////////////////////////////////////////");
console.log("Angry Choppers has begun");
console.log("Starting http server on port "+port);
console.log("//////////////////////////////////////////////////////////////////////////////////////");


app.use(express.static('js'))
app.use(express.static('img'))
app.use(express.static('node_modules'))

var allClients = [];
var allIds = [];
io.sockets.on('connection', function(socket) {

    socket.on('sendname', function(name) {
        socket.broadcast.emit('new player name', name);
    });
    socket.broadcast.emit('new player', socket.id);
    allClients.push(socket);
    socket.emit('self id', socket.id );
    socket.emit('player list', allIds );
    allIds.push(socket.id);
    console.log(Math.floor(Date.now()/1000)+": New player connected");
    console.log(Math.floor(Date.now()/1000)+": "+allClients.length+" players");
    socket.on('chat message', function(msg){
        socket.broadcast.emit('chat message', msg);
    });
    socket.on('disconnect', function() {
        socket.broadcast.emit('user disconnect', socket.id);
        console.log(Math.floor(Date.now()/1000)+": "+'Player disconnected');
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
        allIds.splice(i, 1);
        console.log(Math.floor(Date.now()/1000)+": "+allClients.length+" players");
    });

});

http.listen(port, function(){
  console.log(Math.floor(Date.now()/1000)+": "+'listening on *:' + port);
});
