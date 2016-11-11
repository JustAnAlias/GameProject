var canvas, engine, scene, light, groundMaterial, groundPlane, ground, freeCam, playerCam, archCam;
var playerID;
var players = {};
var my3dObjects = {};

window.addEventListener('DOMContentLoaded', function(){

  // get canvas
  canvas = document.getElementById('renderCanvas');
  // start motoren
  engine = new BABYLON.Engine(canvas, true);
  // lav en scene
  scene = createScene();

  BABYLON.SceneLoader.ImportMesh("car", "/textures/", "mini-cooper.babylon", scene, function (newMeshes, particleSystems, skeletons) {
      my3dObjects.car = newMeshes;
  });
  console.log(JSON.stringify(my3dObjects.car));
  scene.registerBeforeRender(function(){
      if(scene.isReady()) {
        for (var p in players){

          if (BABYLON.Vector3.Distance(players[p].mesh.position, players[p].destination)> 10){
             players[p].rotate();
             players[p].move();
          }
        }

      }
   });


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
  // We try to pick an object
  // console.log('players orientation: ');
  // console.log(players[playerID]);
  console.log(my3dObjects.car);
  var target = scene.pick(scene.pointerX, scene.pointerY);
  var update = {};
  // // console.log(target);

  if(target.pickedMesh.name == 'ground'){
    update.destination = target.pickedPoint;
  }
  else{
    update.destination = target.pickedMesh.getAbsolutePosition();
  }
  update.position = players[playerID].mesh.getAbsolutePosition();
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

  function rotateItem(item, direction){

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
      players[player.id].speed = 0.7;
      //players[player.id].mesh = my3dObjects.car;
      players[player.id].mesh = BABYLON.Mesh.CreateBox(player.id, 1, scene);
      players[player.id].mesh.position.y += 30;
      players[player.id].mesh.checkCollisions = true;
      players[player.id].collisionRadius = new BABYLON.Vector3(0.01, 0.01, 0.01);
      players[player.id].physicsImpostor = new BABYLON.PhysicsImpostor(players[player.id].mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 100, restitution: 0.2 }, scene);
      players[player.id].move = function(){
        // make it rotate a degree towards target here...



        // run forrest!
        posX = Math.sin(parseFloat(players[player.id].mesh.rotation.y));
        posZ = Math.cos(parseFloat(players[player.id].mesh.rotation.y));
        velocity = new BABYLON.Vector3(parseFloat(posX) / players[player.id].speed, 0, parseFloat(posZ) / players[player.id].speed);
          players[player.id].physicsImpostor.setLinearVelocity(velocity);
      }
      players[player.id].rotate = function(){

        this.mesh.rotation.y -= (1/180);
        this.physicsImpostor.setAngularVelocity(new BABYLON.Quaternion(0,-2,0,0));
      }
    }
    if (playerID === player.id){
      changeCameraToPlayer(players[playerID]);
      addOrientationLines(players[playerID].mesh);

    }
  }

  function changeCameraToPlayer(thePlayer){
    scene.activeCamera = archCam;
    archCam.target = thePlayer.mesh;

  }

    // players[data.id].mesh = BABYLON.Mesh.CreateSphere(player.id, 16, 1, scene);

    // playerCam = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(2, 40, -45), scene);
    // playerCam.target = players[data.id].mesh; // target any mesh or object with a "position" Vector3
    // scene.activeCamera = playerCam;



    // cam.target = players[data.id].mesh;
    // scene.activeCamera = cam;
    // scene.activeCamera.attachControl(canvas);



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
	archCam.attachControl(canvas, true);

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
*/
		} // end of callback
	);

	return scene;
};


// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------







function addOrientationLines(thing){
  var size = 15;
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
