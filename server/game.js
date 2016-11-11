var game = {};
game.players = {};

game.addPlayer = function(player){
  game.players[player.id]=player;

}

game.removePlayer = function(id){
    delete game.players[id];



}

game.getPlayers = function(){
    return game.players;
}

game.updatePlayerData = function(id, data){
  game.players[id].position = data.position;
  game.players[id].destination = data.destination;
  return game.players[id];
}

game.getOtherPlayers = function(){
  console.log('printing players object: \n');
  console.log(JSON.stringify(game.players));

  console.log('printing all player objects: ');
  var counter = 0;
  for (var obj in game.players){
    console.log('object: ' + counter + ' ' + game.players[obj]['id'] + ' ' + JSON.stringify(game.players[obj]['position']) + '\n');
    counter++;
  }

  return game.players;

}




module.exports = game;
