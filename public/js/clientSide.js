var canvas, engine, scene, light, groundMaterial, groundPlane, ground, freeCam, playerCam, archCam, bor, bord, world;
var playerID;
var players = {};
var my3dObjects = {};

var keys = {
  'fwd': 1,
  'bck': 2,
  'left': 3,
  'right': 4
};

window.addEventListener('DOMContentLoaded', function(){

  // get canvas
  canvas = document.getElementById('renderCanvas');
  // start motoren
  engine = new BABYLON.Engine(canvas, true);
  // lav en scene
  scene = createScene();

// this loads it
// it loads the entire scene, i guess it's not really what we want, is it?




  //addLocalPlayer();

  // ved ikke om engine.resize() skal have noget input, bør undersøges..
  window.addEventListener('resize', function(){
    engine.resize();
  });

  // renderloop / gameloop
  engine.runRenderLoop(function() {
    scene.render();
  });
});

/*
window.addEventListener("click", function () {
  // players[playerID].mesh.toggle();
  // We try to pick an object
  // // console.log('players orientation: ');
  // // console.log(players[playerID]);
  // console.log(my3dObjects);
  var target = scene.pick(scene.pointerX, scene.pointerY);
  // console.log(target);
  var update = {};
  // // // console.log(target);

  if(target.pickedMesh.name == 'ground'){
    update.destination = target.pickedPoint;
  }
  else{
    update.destination = target.pickedMesh.getAbsolutePosition();
  }
  update.position = players[playerID].mesh.body.getAbsolutePosition();
  // moveItem(update.destination);
  socket.emit('update', update);
  // // console.log('object ' + players[playerID].id + ' is at position: ' + JSON.stringify(update.position) + ' and going to ' + JSON.stringify(update.destination));

});
*/

function removeRemotePlayer(player){
    players[player.id].mesh.dispose();
}



function updatePlayerPosition(data){

    // // console.log('incoming playerposition data: ');
    // // console.log(JSON.stringify(data));
  //  // // console.log('object: ' + data.id);
  //  // // console.log('object position: ' + JSON.stringify(data.position));
  //  moveItem(players[data.id], data.position);
    // players[data.id].mesh.position = data.position;
}

// setting the clients playerID
function createPlayer(data){
  if (!playerID){
    // // console.log('setting playerID to: ' + data.id);
    playerID = data.id;
  }
}

function updatePlayerMoves(data){
  for(var i = 0; i<data.length; i++){
    // console.log('trying to move player ' + data[i].id);
    // console.log('i have these players in my list: ');
    // console.log(players);
    players[data[i].id].move(data[i].action, data[i].value);
    // console.log('player: ' + data[i].id);
    // console.log('action: ' + data[i].action);
    // console.log('is:' + data[i].value);
    // console.log(data[i]);
  }
}

function addRemotePlayer(player){
  console.log('trying to add player with id: ' + player.id);
  if (players[player.id]){
    // // console.log('addRemotePlayer says: player ' + data.id + ' already exists');
  }
  else{

    players[player.id] = nativeCannonVehicle(player);

  }

  if (playerID === player.id){
    archCam.target = new BABYLON.Vector3(0, 0, 0);
    changeCameraToPlayer(players[playerID]);
    addControls();
  }
}

function changeCameraToPlayer(thePlayer){
  scene.activeCamera = archCam;
  archCam.target = thePlayer.chassis;
}


function destroyPlayer(){
  player.mesh.dispose();
  // then what?
}


var createScene = function () {
	scene = new BABYLON.Scene(engine);
  world = new BABYLON.Vector3(0, -9.8, 0), new BABYLON.CannonJSPlugin();
	scene.enablePhysics(world);

	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.5;

	archCam = new BABYLON.ArcRotateCamera("Camera", 0, 0.9, 50, BABYLON.Vector3.Zero(), scene);
	archCam.attachControl(canvas, false);

	ground = BABYLON.Mesh.CreateGroundFromHeightMap(
		"ground",
		"map",
		600, 600, 100, 0, 40, scene, false,
		function () { // callback.  When heightMap done, run this.
			var ground2 = ground.clone();
			ground2.material = new BABYLON.StandardMaterial("wire", scene);
      ground2.material.diffuseTexture = new BABYLON.Texture("/gras1.jpg", scene);
			var gbody = ground.setPhysicsState(BABYLON.PhysicsEngine.HeightmapImpostor, { mass: 0, friction: 10 });
		} // end of callback
	);

  var materialbox2 = new BABYLON.StandardMaterial("texture2", scene);
    // materialbox2.diffuseTexture = new BABYLON.Texture("carx/palm_s.png", scene);
  materialbox2.specularColor = new BABYLON.Color3(0, 0, 0);

  bor = new Array(4);
  var boxShape411 = new CANNON.Box(new CANNON.Vec3(298, 40, 300)); // changed 4 to 40 in the y-axis
  for (var i = 0; i < bor.length; i++) {
    bor[i] = new CANNON.Body(9999999, boxShape411); // changed 0 to a lot
    if (i == 0){
      bor[i].position.y = 300;
    }
    else if (i == 1){
      bor[i].position.y = -300;
    }
    else {
      bor[i].position.y = 0;
    }
    if (i == 2) bor[i].position.x = 300; else if (i == 3) bor[i].position.x = -300; else bor[i].position.x = 0;
    bor[i].position.z = 50;
    if (i > 1) bor[i].quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI/2);
      world.add(bor[i]);
  }

  bord = new Array(bor.length);
  bord[0] = BABYLON.MeshBuilder.CreateBox("bord1", {
    width: 1,
    height: 40,
    depth: 1
  }, scene);
  bord[0].scaling = new BABYLON.Vector3(602, 10, 2);
  bord[0].visibility = 0.3;
  bord[0].material = materialbox2;
  bord[0].physicsImpostor = new BABYLON.PhysicsImpostor(bord[0], BABYLON.PhysicsEngine.BoxImpostor, {
    mass: 0
  });
  bord[1] = bord[0].clone();
  bord[2] = bord[0].clone();
  bord[3] = bord[0].clone();

  for (i = 0; i < bor.length; i++) {
    bord[i].position = new BABYLON.Vector3(bor[i].position.x, bor[i].position.z - 50, bor[i].position.y + 5); // added 5 to position.y
    bord[i].rotationQuaternion = new BABYLON.Quaternion(bor[i].quaternion.x, bor[i].quaternion.z, bor[i].quaternion.y, -bor[i].quaternion.w);
  }

  return scene;
};


function addOrientationLines(thing){
  var size = 20;
  var pilot_world_local_axisX = BABYLON.Mesh.CreateLines("pilot_world_local_axisX", [
    new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
    new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
  ], scene);
  pilot_world_local_axisX.color = new BABYLON.Color3(1, 0, 0);
  pilot_world_local_axisY = BABYLON.Mesh.CreateLines("pilot_world_local_axisY", [
    new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
    new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
  ], scene);
  pilot_world_local_axisY.color = new BABYLON.Color3(0, 1, 0);

  var pilot_world_local_axisZ = BABYLON.Mesh.CreateLines("pilot_world_local_axisZ", [
    new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
    new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
  ], scene);
pilot_world_local_axisZ.color = new BABYLON.Color3(0, 0, 1);


pilot_world_local_axisX.parent = thing;
pilot_world_local_axisY.parent = thing;
pilot_world_local_axisZ.parent = thing;
}

function nativeCannonVehicle(newPlayer){
  //CAR!
  var res = newPlayer;
  res.hitPoints = 100;

  res.width = 8;
  res.depth = 8;
  res.height = 3;
  res.mass = 40;
  res.wheelDiameter = 5;
  res.wheelDepthPosition = (res.depth + res.wheelDiameter) / 2;
  res.axisWidth = res.width + res.wheelDiameter;
  res.chassis = BABYLON.MeshBuilder.CreateBox("chassis", {
    width: res.width,
    height: res.height,
    depth: res.depth
  }, scene);

  res.chassis.position.y = res.wheelDiameter + 40;


  res.chassis.physicsImpostor = new BABYLON.PhysicsImpostor(res.chassis, BABYLON.PhysicsEngine.BoxImpostor, {
    mass: res.mass
  });
  //
  var centerOfMassAdjust = new CANNON.Vec3(0, -res.wheelDiameter, 0);
  // add wheels
  res.wheels = [0, 1, 2, 3].map(function(num) {
    var wheel = BABYLON.MeshBuilder.CreateSphere("wheel" + num,{
      segments: 4,
      diameter: res.wheelDiameter
    }, scene);
    var a = (num % 2) ? -1 : 1;
    var b = num < 2 ? 1 : -1;
    wheel.position.copyFromFloats(a * res.axisWidth / 2, res.wheelDiameter / 2, b * res.wheelDepthPosition)
    wheel.scaling.x = 0.4;
    wheel.physicsImpostor = new BABYLON.PhysicsImpostor(wheel, BABYLON.PhysicsEngine.SphereImpostor,{
      mass: 10
    });
    return wheel;
  });

  res.vehicle = new CANNON.RigidVehicle({
    chassisBody: res.chassis.physicsImpostor.physicsBody
  });
  var down = new CANNON.Vec3(0, -1, 0);

  res.vehicle.addWheel({
    body: res.wheels[0].physicsImpostor.physicsBody,
    position: new CANNON.Vec3(res.axisWidth / 2, 0, res.wheelDepthPosition).vadd(centerOfMassAdjust),
    axis: new CANNON.Vec3(1, 0, 0),
    direction: down,
    friction: 20,
    suspensionLength: 1
  });

  res.vehicle.addWheel({
    body: res.wheels[1].physicsImpostor.physicsBody,
    position: new CANNON.Vec3(-res.axisWidth / 2, 0, res.wheelDepthPosition).vadd(centerOfMassAdjust),
    axis: new CANNON.Vec3(-1, 0, -0),
    direction: down,
    friction: 20,
    suspensionLength: 1
  });

  res.vehicle.addWheel({
    body: res.wheels[2].physicsImpostor.physicsBody,
    position: new CANNON.Vec3(res.axisWidth / 2, 0, -res.wheelDepthPosition).vadd(centerOfMassAdjust),
    axis: new CANNON.Vec3(1, 0, 0),
    direction: down,
    friction: 20,
    suspensionLength: 1
  });

  res.vehicle.addWheel({
    body: res.wheels[3].physicsImpostor.physicsBody,
    position: new CANNON.Vec3(-res.axisWidth / 2, 0, -res.wheelDepthPosition).vadd(centerOfMassAdjust),
    axis: new CANNON.Vec3(-1, 0, 0),
    direction: down,
    friction: 20,
    suspensionLength: 1
  });

  // Some damping to not spin wheels too fast
  for (var i = 0; i < res.vehicle.wheelBodies.length; i++) {
    res.vehicle.wheelBodies[i].angularDamping = 0.2;
  }

          //add the constraints to the world
  var world = res.wheels[3].physicsImpostor.physicsBody.world;

  for (var i = 0; i < res.vehicle.constraints.length; i++){
    world.addConstraint(res.vehicle.constraints[i]);
  }

  res.setSteeringValue = function(value, wheelIndex){
    // Set angle of the hinge axis
    var axis = this.wheelAxes[wheelIndex];
    var c = Math.cos(value),
        s = Math.sin(value),
        x = axis.x,
        z = axis.z;
    this.constraints[wheelIndex].axisA.set(
      c * x - s * z,
      0,
      s * x + c * z
    );
  };
  res.vehicle.setSteeringValue = res.setSteeringValue.bind(res.vehicle);
  world.addEventListener('preStep', res.vehicle._update.bind(res.vehicle));
  var turnPerTick = Math.PI /100;
  var steerVal = 0;
  var maxSteerVal = Math.PI / 6;
  var maxSpeed = 200;
  var maxForce = 300;
  res.controlValues = {};


  res.controlValues.steerLeft = false;
  res.controlValues.steerRight = false;
  res.controlValues.forwards = false;
  res.controlValues.backwards = false;
  res.controlValues.handbrake = true;
  res.controlValues.flip = false;
  /*
  var steerLeft = false;
  var steerRight = false;
  var forwards = false;
  var backwards = false;
  var handbrake = true;
  */
  res.moveInterval = setInterval(function(){
    if (res.controlValues.forwards){
      res.controlValues.handbrake = false;
      res.vehicle.setWheelForce(-maxForce, 0);
      res.vehicle.setWheelForce(maxForce, 1);
    }
    else if (res.controlValues.backwards){
      res.controlValues.handbrake = false;
      res.vehicle.setWheelForce(maxForce / 2, 0);
      res.vehicle.setWheelForce(-maxForce / 2, 1);
    }
    else{
      res.vehicle.setWheelForce(0, 0);
      res.vehicle.setWheelForce(0, 1);
    }
    if(res.controlValues.steerLeft){
      res.controlValues.handbrake = false;
      steerVal = Math.min(steerVal+= turnPerTick, maxSteerVal);
    }
    else if (res.controlValues.steerRight) {
      res.controlValues.handbrake = false;
      steerVal = Math.max(steerVal-= turnPerTick, 0-maxSteerVal);
    }
    else{

      if (res.controlValues.steerVal < 0 - turnPerTick){
        res.controlValues.handbrake = false;
        steerVal += turnPerTick;
      }
      else if (steerVal > 0 + turnPerTick){
        res.controlValues.handbrake = false;
        steerVal -= turnPerTick;
      }
      else {
          steerVal = 0;
      }
    }
    if (res.controlValues.flip){
      res.controlValues.handbrake = false;
      flipVehicle();
      res.controlValues.flip = false;
    }
    res.vehicle.setSteeringValue(steerVal, 2);
    res.vehicle.setSteeringValue(steerVal, 3);
  }, 50);


  res.move = function(act, val){
    res.controlValues[act] = val;
  }

  res.turnLeft = function(){
    steerLeft = true;
  }

  res.noTurnLeft = function(){
    steerLeft = false;
  }

  res.turnRight = function(){
    steerRight = true;
  }

  res.noTurnRight = function(){
    steerRight = false;
  }

  res.accellerate = function(){
    forwards = true;
  }

  res.noAccellerate = function(){
    forwards = false;
  }

  res.decellerate = function(){
    backwards = true;
  }

  res.noDecellerate = function(){
    backwards = false;
  }

  res.handBrakeOn = function(){
    for (var i = 0; i < res.vehicle.wheelBodies.length; i++) {
      res.vehicle.wheelBodies[i].angularDamping = 1;
      res.vehicle.wheelBodies[i].friction = 1000;
    }
  }

  res.handbrakeOff = function(){
    for (var i = 0; i < res.vehicle.wheelBodies.length; i++) {
      res.vehicle.wheelBodies[i].angularDamping = 0.2;
      res.vehicle.wheelBodies[i].friction = 20;
    }
  }

  var flipVehicle = function(){
    res.wheels[3].physicsImpostor.applyImpulse(new BABYLON.Vector3(res.mass * 0, res.mass * 10, res.mass * 0), res.wheels[3].getAbsolutePosition());
    res.wheels[2].physicsImpostor.applyImpulse(new BABYLON.Vector3(res.mass * 0, res.mass * 10, res.mass * 0), res.wheels[2].getAbsolutePosition());
  }
  return res;
}


// player controls goes here:

function addControls(){
  document.onkeydown = handler;
  document.onkeyup = handler;

  function handler(event){
    var down = (event.type == 'keydown');
    var up = (event.type == 'keyup');
    // // console.log('keyhandler seems to be working!');
    if (!up && !down){
      return;
    }
    var toSend = {};
    switch (event.keyCode) {
      case 87: // forward
      if (down){
        // players[playerID].accellerate();
        toSend.action = 'forwards';
        toSend.value = true;
      }
      else{
        // players[playerID].noAccellerate();
        toSend.action = 'forwards';
        toSend.value = false;
      }
        break;

      case 83: // backward
        if (down){
          // players[playerID].decellerate();
          toSend.action = 'backwards';
          toSend.value = true;
        }
        else{
          // players[playerID].noDecellerate();
          toSend.action = 'backwards';
          toSend.value = false;
        }

        break;

      case 68: // right
        if (down){
          // players[playerID].turnRight();
          toSend.action = 'steerRight';
          toSend.value = true;
        }
        else{
          // players[playerID].noTurnRight();
          toSend.action = 'steerRight';
          toSend.value = false;
        }

        break;

      case 65: // left
      if (down){
        // players[playerID].turnLeft();
        toSend.action = 'steerLeft';
        toSend.value = true;
      }
      else{
        // players[playerID].noTurnLeft();
        toSend.action = 'steerLeft';
        toSend.value = false;
      }
      break;
      case 70:
        // players[playerID].flipVehicle();
        toSend.action = 'flip';
        toSend.value = true;
        break;
      case 32:
        if (down){
          // players[playerID].handBrakeOn();
          toSend.action = 'handbrake';
          toSend.value = true;
        }
        else{
          // players[playerID].handbrakeOff();
          toSend.action = 'handbrake';
          toSend.value = false;
        }
        break;

    }
    socket.emit('moving', toSend);
  }
}
