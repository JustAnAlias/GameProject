var canvas, engine, scene, light, groundMaterial, groundPlane, ground, freeCam, playerCam, archCam;
var playerID;
var players = {};

window.addEventListener('DOMContentLoaded', function(){

  // get canvas
  canvas = document.getElementById('renderCanvas');
  // start motoren
  engine = new BABYLON.Engine(canvas, true);
  // lav en scene
  scene = createScene();
  scene.registerBeforeRender(function(){
      if(scene.isReady()) {
        for (var p in players){

          if (BABYLON.Vector3.Distance(players[p].mesh.position, players[p].destination)> 10){
            // players[p].rotate();
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
  var target = scene.pick(scene.pointerX, scene.pointerY);

  // console.log(target);

  if(target.pickedMesh.name == 'GroundMesh'){
    socket.emit('updatePosition', target.pickedPoint);
    console.log('you clicked on ' + target.pickedMesh.name + ' at position ' + target.pickedMesh.position);
    moveItem(players[playerID], target.pickedPoint);
  }
  else{
    socket.emit('updatePosition', target.pickedPoint);
    target.pickedPoint.y ++;
    moveItem(players[playerID], target.pickedMesh.position);
  }

});
  function removeRemotePlayer(player){
    players[player.id].mesh.dispose();
  }



  function updatePlayerPosition(data){
  //  console.log('incoming playerposition data: ');
  //  console.log(JSON.stringify(data));
  //  console.log('object: ' + data.id);
  //  console.log('object position: ' + JSON.stringify(data.position));
    moveItem(players[data.id], data.position);
    // players[data.id].mesh.position = data.position;
  }

  function rotateItem(item, direction){

  }

  // move an item in the world to the target position
  function moveItem(item, target){
    //var anim = BABYLON.Animation.CreateAndStartAnimation("anim", item.mesh, "position", 30, 100, item.mesh.position, target, 0);
/*

    scene.registerBeforeRender(function(){
		    if(scene.isReady() && meshPlayer) {
          for (var p in players){
            if (players[p].mesh.position !== players[p].destination){
              players[p].rotate();
              players[p].move();
            }
          }
          if (keys.avancer == 1){	// En avant
            posX = Math.sin(parseFloat(meshPlayer.rotation.y));
            posZ = Math.cos(parseFloat(meshPlayer.rotation.y));
            velocity = new BABYLON.Vector3(parseFloat(posX) / VitessePerso, 0, parseFloat(posZ) / VitessePerso);
		          meshPlayer.moveWithCollisions(velocity);
          }
		    }
	   });
*/
  }


  function createPlayer(data){
    if (!playerID){
      console.log('setting playerID to: ' + data.id);
      playerID = data.id;
    }

  }
  function addRemotePlayer(player){
    if (players[player.id]){
      console.log('addRemotePlayer says: player ' + data.id + ' already exists');
    }
    else{
      players[player.id] = player;
      players[player.id].speed = 20;
      players[player.id].mesh = BABYLON.Mesh.CreateBox(player.id, 1, scene);
      players[player.id].mesh.position.y += 60;
      players[player.id].mesh.checkCollisions = true;
      players[player.id].collisionRadius = new BABYLON.Vector3(0.01, 0.01, 0.01);
      players[player.id].physicsImpostor = new BABYLON.PhysicsImpostor(players[player.id].mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 100, restitution: 0.3 }, scene);
      players[player.id].move = function(){
        // make it rotate a degree towards target here...

        players[player.id].mesh.rotation.x -= (1/180);

        // run forrest!
        posX = Math.sin(parseFloat(players[player.id].mesh.rotation.y));
        posZ = Math.cos(parseFloat(players[player.id].mesh.rotation.y));
        velocity = new BABYLON.Vector3(parseFloat(posX) / players[player.id].speed, 0, parseFloat(posZ) / players[player.id].speed);
          players[player.id].mesh.moveWithCollisions(velocity);
      }
    }
    if (playerID === player.id){
      changeCameraToPlayer(players[player.id]);

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

	archCam = new BABYLON.ArcRotateCamera("Camera", 0, 0.9, 300, BABYLON.Vector3.Zero(), scene);
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
