function Player(id, startPosition, startDestination){
  // set players starting position
  this.id = id;
  this.position = position;
  this.destination = destination;

  this.spam = function(){
    console.log('player ' + this.id + ' is at ' + this.position + 'and moving towards: ' + this.destination);
  }
  setInterval(this.spam(), 3000);
  // set player role (includes abilities and modifiers)
  // this.role = role;

  // set players health based on role
  // this.baseHealth = 100;
  // this.maxHealth = this.baseHealth * role.healthModifier;
  // this.health = this.maxHealth;

// check if player is alive


/*
this.isAlive(){
  return this.health > 0;
}

this.attack(abilityNumber){
  return this.role.ability[abilityNumber];
}
// let the player take some damage
this.damage(amount, type){
  if(this.alive){
    this.health -= amount;
  }
  else if (this.alive){
    this.health -= amount * this.role.modifier[type];
  }

}



// let the player be healed
this.heal(amount){
  this.health += amount;
}

  this.move(x,y,z){
    this.x = x;
    this.y = y;
  }
  */
}

exports.Player = Player;
