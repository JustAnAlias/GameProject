var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Player = require(__dirname + '/server/player.js');
var Roles = require(__dirname + '/server/roles.js');
var game = require(__dirname + '/server/game.js');

var clients = 0;
var updateInterval = 100;
var nextUpdate = [];


var players = {};
/*
app.all('*', function(req, res, next){
  console.log(req);
  next();
});
*/
app.get('/', function(req, res){
  // console.log(req);
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/textures/mini-cooper.babylon', function(req, res) {
    // the user was found and is available in req.user

    res.sendFile(__dirname + "/public/textures/mini_cooper/mini-cooper.babylon");
});

app.get('/css', function(req, res){
  res.sendFile(__dirname + '/public/css/main.css');
});

app.get('/engine', function(req, res){
  //// console.log(req);
  res.sendFile(__dirname + '/public/js/lib/babylon.2.4.max.js');
});

app.get('/physics', function(req, res){
  //// console.log(req);
  res.sendFile(__dirname + '/public/js/lib/cannon.js');
});

app.get('/client', function(req, res){
  //// console.log(req);
  res.sendFile(__dirname + '/public/js/clientSide.js');
});

app.get('/map', function(req, res){
  // console.log(req);
  // res.sendFile(__dirname + '/public/textures/map.jpg');
  res.sendFile(__dirname + '/public/textures/map3.jpg');
});

app.get('/gras1.jpg', function(req, res){
  // console.log(req);
  res.sendFile(__dirname + '/public/textures/gras1.jpg');
});

// broadcast all player info to all players
var updateClients = function(){
  io.sockets.emit('update', nextUpdate);
  nextUpdate = [];
}
 setInterval(updateClients, updateInterval);


io.on('connection', function(socket){
    clients++;
    // console.log('a user connected');


    // make updateClients run every 'x' milliseconds
    var id = socket.id;
    //world.addPlayer(id);
    var player = new Player(id, {x:0,y:30,z:0}, Roles.archer);
    //socket.emit('createPlayer', player);
    game.addPlayer(player);
    socket.emit('createPlayer', player);
    socket.emit('existingPlayers', game.getOtherPlayers());


    socket.broadcast.emit('addOtherPlayer', player);

    socket.on('update', function(data){
        var newData = game.updatePlayerData(socket.id, data);
        // console.log('a player moved \n' + JSON.stringify(newData));
        // socket.broadcast.emit('updatePosition', newData);
    });
    socket.on('disconnect', function(){
        // console.log('user disconnected');
        io.emit('removeOtherPlayer', player);
        game.removePlayer( player.id );
        clients--;
    });
    socket.on('moving', function(data){
      var item = data;
      item.id = socket.id;
      nextUpdate.push(item);
    });

});

var port = 1338;
var ip_address = '127.0.0.1';

http.listen(port, ip_address, function(){
    // console.log( "Listening on " + ip_address + ", server_port " + port );
});
