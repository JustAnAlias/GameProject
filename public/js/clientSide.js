var canvas, engine, scene, light, groundMaterial, groundPlane, ground, freeCam, playerCam, archCam;
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
window.addEventListener("click", function () {
  players[playerID].mesh.toggle();
  // We try to pick an object
  // console.log('players orientation: ');
  // console.log(players[playerID]);
  console.log(my3dObjects);
  var target = scene.pick(scene.pointerX, scene.pointerY);
  console.log(target);
  var update = {};
  // // console.log(target);

  if(target.pickedMesh.name == 'ground'){
    update.destination = target.pickedPoint;
  }
  else{
    update.destination = target.pickedMesh.getAbsolutePosition();
  }
  update.position = players[playerID].mesh.body.getAbsolutePosition();
  // moveItem(update.destination);
  socket.emit('update', update);
  // console.log('object ' + players[playerID].id + ' is at position: ' + JSON.stringify(update.position) + ' and going to ' + JSON.stringify(update.destination));

});

function removeRemotePlayer(player){
    players[player.id].mesh.dispose();
}



function updatePlayerPosition(data){

    // console.log('incoming playerposition data: ');
    // console.log(JSON.stringify(data));
  //  // console.log('object: ' + data.id);
  //  // console.log('object position: ' + JSON.stringify(data.position));
  //  moveItem(players[data.id], data.position);
    // players[data.id].mesh.position = data.position;
}


function createPlayer(data){
  if (!playerID){
    // console.log('setting playerID to: ' + data.id);
    playerID = data.id;
  }
}

function addRemotePlayer(player){
  if (players[player.id]){
    // console.log('addRemotePlayer says: player ' + data.id + ' already exists');
  }
  else{
    players[player.id] = player;
    players[player.id] = nativeCannonVehicle(player.id);

  }

  if (playerID === player.id){
    archCam.target = new BABYLON.Vector3(0, 0, 0);
    changeCameraToPlayer(players[playerID]);

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
	scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.CannonJSPlugin());

	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.5;

	archCam = new BABYLON.ArcRotateCamera("Camera", 0, 0.9, 50, BABYLON.Vector3.Zero(), scene);
	archCam.attachControl(canvas, false);

	ground = BABYLON.Mesh.CreateGroundFromHeightMap(
		"ground",
		"map",
		500, 500, 100, 0, 40, scene, false,
		function () { // callback.  When heightMap done, run this.
			var ground2 = ground.clone();
			ground2.material = new BABYLON.StandardMaterial("wire", scene);
			ground2.material.diffuseColor = BABYLON.Color3.Black();
			ground2.material.wireframe = true;

			var gbody = ground.setPhysicsState(BABYLON.PhysicsEngine.HeightmapImpostor, { mass: 0 });

		} // end of callback
	);

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





//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------
//----------------------------------------------------------------------

function nativeCannonVehicle(newPlayerID){
  //CAR!
  var res ={};
    res.id = newPlayerID;
          res.width = 8;
          res.depth = 8;
          res.height = 1;
          res.mass = 10;

          res.wheelDiameter = 5;
          res.wheelDepthPosition = (res.depth + res.wheelDiameter) / 2

          res.axisWidth = res.width + res.wheelDiameter;

          var centerOfMassAdjust = new CANNON.Vec3(0, -res.wheelDiameter, 0);

          res.chassis = BABYLON.MeshBuilder.CreateBox("chassis", {
              width: res.width,
              height: res.height,
              depth: res.depth
          }, scene);
          res.chassis.position.y = res.wheelDiameter + res.height / 2;
          res.chassis.physicsImpostor = new BABYLON.PhysicsImpostor(res.chassis, BABYLON.PhysicsEngine.BoxImpostor, {
              mass: res.mass
          })
          // archCam.target = res.chassis;
          res.wheels = [0, 1, 2, 3].map(function(num) {
              var wheel = BABYLON.MeshBuilder.CreateSphere("wheel" + num, {
                  segments: 4,
                  diameter: res.wheelDiameter
              }, scene);
              var a = (num % 2) ? -1 : 1;
              var b = num < 2 ? 1 : -1;
              wheel.position.copyFromFloats(a * res.axisWidth / 2, res.wheelDiameter / 2, b * res.wheelDepthPosition)
              wheel.scaling.x = 0.4;
              wheel.physicsImpostor = new BABYLON.PhysicsImpostor(wheel, BABYLON.PhysicsEngine.SphereImpostor, {
                  mass: 3
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
              direction: down
          });

          res.vehicle.addWheel({
              body: res.wheels[1].physicsImpostor.physicsBody,
              position: new CANNON.Vec3(-res.axisWidth / 2, 0, res.wheelDepthPosition).vadd(centerOfMassAdjust),
              axis: new CANNON.Vec3(-1, 0, -0),
              direction: down
          });

          res.vehicle.addWheel({
              body: res.wheels[2].physicsImpostor.physicsBody,
              position: new CANNON.Vec3(res.axisWidth / 2, 0, -res.wheelDepthPosition).vadd(centerOfMassAdjust),
              axis: new CANNON.Vec3(1, 0, 0),
              direction: down
          });

          res.vehicle.addWheel({
              body: res.wheels[3].physicsImpostor.physicsBody,
              position: new CANNON.Vec3(-res.axisWidth / 2, 0, -res.wheelDepthPosition).vadd(centerOfMassAdjust),
              axis: new CANNON.Vec3(-1, 0, 0),
              direction: down
          });

          // Some damping to not spin wheels too fast
          for (var i = 0; i < res.vehicle.wheelBodies.length; i++) {
              res.vehicle.wheelBodies[i].angularDamping = 0.4;
          }

          //add the constraints to the world
          var world = res.wheels[3].physicsImpostor.physicsBody.world

          for (var i = 0; i < res.vehicle.constraints.length; i++) {
              world.addConstraint(res.vehicle.constraints[i]);
          }

          res.setSteeringValue = function(value, wheelIndex) {
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

          document.onkeydown = handler;
          document.onkeyup = handler;

          scene.onPointerUp = function() {
              chassis.physicsImpostor.applyImpulse(new BABYLON.Vector3(100, 100, 0), chassis.getAbsolutePosition())
          }

          var maxSteerVal = Math.PI / 6;
          var maxSpeed = 200;
          var maxForce = 200;

          function handler(event) {
              var up = (event.type == 'keyup');

              if (!up && event.type !== 'keydown')
                  return;

              switch (event.keyCode) {

                  case 119: // forward
                      vehicle.setWheelForce(up ? 0 : -maxForce, 0);
                      vehicle.setWheelForce(up ? 0 : maxForce, 1);
                      break;

                  case 115: // backward
                      vehicle.setWheelForce(up ? 0 : maxForce / 2, 0);
                      vehicle.setWheelForce(up ? 0 : -maxForce / 2, 1);
                      break;

                  case 100: // right
                      vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 2);
                      vehicle.setSteeringValue(up ? 0 : -maxSteerVal, 3);
                      break;

                  case 97: // left
                      vehicle.setSteeringValue(up ? 0 : maxSteerVal, 2);
                      vehicle.setSteeringValue(up ? 0 : maxSteerVal, 3);
                      break;

              }
          }
          res.chassis.position.y += 60;
          return res;
        }









/*
			var ball;
			var ballbody;
			var createBall = function () {
				ball = BABYLON.Mesh.CreateSphere("s", 8, 14, scene);
				ball.position.y = 160;
				ball.position.x = (Math.random() * 50) * ((Math.random() < 0.5) ? -1 : 1);
				ball.position.z = (Math.random() * 50) * ((Math.random() < 0.5) ? -1 : 1);
				ball.material = new BABYLON.StandardMaterial("ballmat", scene);
				ball.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
				return ball.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
					mass: 1,
					friction: 0,
					restitution: .5
				});
			}

			var ballbody = createBall();
			var power = 20;  // impulsing power.

			scene.onPointerUp = function (evt, pickInfo) {
				if (pickInfo.pickedMesh.name === "s") {
					pickInfo.pickedMesh.applyImpulse(
						pickInfo.pickedMesh.position.subtract(camera.position).normalize().scale(power), // dir & magnitude
						pickInfo.pickedPoint // impact point on the mesh
						)
				}
			}

			scene.registerBeforeRender(function () {
				if (ball.position.y < 0) {
					ball.position.y = 160;
					ball.position.x = (Math.random() * 50) * ((Math.random() < 0.5) ? -1 : 1);
					ball.position.z = (Math.random() * 50) * ((Math.random() < 0.5) ? -1 : 1);
					ball.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
					ball.updatePhysicsBodyPosition();
				}
			});



//---------------- MORE UNUSED CODE -----------------

function playerObject(playerNumber, startPos){
  var rad = 8;
    var h = 2;
    var w = 5;
    var d = 10;
    var car = {};

    car.body = BABYLON.MeshBuilder.CreateBox("body", {
        width: (w + 10) * 1.5,
        height: h,
        depth: (d + 17) * 1.5
    }, scene);
    car.body.position.x = 0;
    car.body.position.y = 30;
    car.body.position.z = 0;
    // copyFromFloats(0, (h * 0.5) + rad, 0);
    //Wheels
    car.wheel1 = BABYLON.MeshBuilder.CreateSphere("wheel1", {
        diameterY: rad,
        diameterX: rad/2,
        diameterZ: rad,
        segments: 5
    }, scene);
    car.wheel1.position.copyFromFloats(-w, car.body.position.y-5, -d);

    car.wheel2 = BABYLON.MeshBuilder.CreateSphere("wheel2", {
        diameterY: rad,
        diameterX: rad/2,
        diameterZ: rad,
        segments: 5
    }, scene);
    car.wheel2.position.copyFromFloats(w, car.body.position.y-5, -d);

    car.wheel3 = BABYLON.MeshBuilder.CreateSphere("wheel3", {
        diameterY: rad,
        diameterX: rad / 2,
        diameterZ: rad,
        segments: 5
    }, scene);
    car.wheel3.position.copyFromFloats(-w, car.body.position.y-5, d);

    car.wheel4 = BABYLON.MeshBuilder.CreateSphere("wheel4", {
        diameterY: rad,
        diameterX: rad / 2,
        diameterZ: rad,
        segments: 5
    }, scene);
    car.wheel4.position.copyFromFloats(w, car.body.position.y-5, d);



    car.body.physicsImpostor = new BABYLON.PhysicsImpostor(car.body, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 130,
        friction: 0.5,
        restitution: 0.5,
        nativeOptions: {
            noSleep: true,
            //move: true
        }
    });

    [car.wheel3, car.wheel4].forEach(function(w) {
        w.physicsImpostor = new BABYLON.PhysicsImpostor(w, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            friction: 4,
            restitution: 0.5,
            nativeOptions: {
                move: true
            }
        });
    })

    w = 7;

    [car.wheel1, car.wheel2].forEach(function (w) {
        w.physicsImpostor = new BABYLON.PhysicsImpostor(w, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            friction: 1,
            restitution: 0.5,
            nativeOptions: {
                //move: true
            }
        });
    })

    //Joints
    car.joint1 = new BABYLON.Hinge2Joint({
        mainPivot: new BABYLON.Vector3(-w, car.body.position.y-30, -(d-2)),
        mainAxis: new BABYLON.Vector3(car.body.position.x-10, car.body.position.y-30, 0),
        connectedAxis: new BABYLON.Vector3(10, 0, 0),
		nativeParams: {
            limit: [0, 0],
            spring: [1000, 1]
        }
    });
    car.body.physicsImpostor.addJoint(car.wheel1.physicsImpostor, car.joint1);

    car.joint2 = new BABYLON.Hinge2Joint({
        mainPivot: new BABYLON.Vector3(w, car.body.position.y-30, -(d-2)),
        mainAxis: new BABYLON.Vector3(car.body.position.x-10, car.body.position.y-30, 0),
        connectedAxis: new BABYLON.Vector3(-10, 0, 0),
        nativeParams: {
            limit: [0, 0],
            spring: [1000, 1]
        }
    });
    car.body.physicsImpostor.addJoint(car.wheel2.physicsImpostor, car.joint2);

    car.joint3 = new BABYLON.Hinge2Joint({
        mainPivot: new BABYLON.Vector3(-w, car.body.position.y-30, d),
        mainAxis: new BABYLON.Vector3(0, car.body.position.y-30, -10),
        connectedAxis: new BABYLON.Vector3(0, car.body.position.y-30, 0),
        nativeParams: {
            limit: [0, 0],
            spring: [100, 1]
        }
    });
    car.body.physicsImpostor.addJoint(car.wheel3.physicsImpostor, car.joint3);

    car.joint4 = new BABYLON.Hinge2Joint({
        mainPivot: new BABYLON.Vector3(w, car.body.position.y-30, d),
        mainAxis: new BABYLON.Vector3(0, car.body.position.y-30, -10),
        connectedAxis: new BABYLON.Vector3(0, car.body.position.y-30, 0),
        nativeParams: {
            limit: [0, 0],
            spring: [100, 1]
        }
    });
    car.body.physicsImpostor.addJoint(car.wheel4.physicsImpostor, car.joint4);

    car.drive = function(speed){

      car.joint1.setMotor(speed, 5000, 0);
      car.joint2.setMotor(speed, 5000, 0);
    }
    car.stop = function(){
      car.joint1.setMotor(0, 0, 0);
      car.joint2.setMotor(0, 0, 0);
    }
    car.isMoving = false;
    car.toggle = function (){
      if (car.isMoving){
        car.isMoving = false;
        car.stop();
      }
      else{
        car.isMoving = true;
        car.drive(300);
      }
    }
    return car;
}

//---------------- MORE UNUSED CODE -----------------



*/






// end of file
