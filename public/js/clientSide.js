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


  function createScene(){
    // creating the scene
    scene = new BABYLON.Scene(engine);
     // setting gravity and physics engine and enabling it
     var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
     var physicsPlugin = new BABYLON.CannonJSPlugin();
     scene.enablePhysics(gravityVector, physicsPlugin);

    scene.collisionsEnabled = true;
    scene.workerCollisions = true;
    var postProcess = new BABYLON.FxaaPostProcess("fxaa",1.0,null,null,engine,true);

/*
    groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("/grass1.jpg", scene);
    groundPlane = BABYLON.Mesh.CreatePlane("groundPlane", 100, scene);
    groundPlane.material = groundMaterial;
    // ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "/map", 200, 200, 250, 0, 10, scene, false, successCallback);
    ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "/map", 200, 200, 250, 0, 10, scene, false);
*/
    // add camera

    freeCam = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0,5,-10), scene);
    freeCam.setTarget(BABYLON.Vector3.Zero());
    freeCam.attachControl(canvas, false);
    freeCam.checkCollisions = true;
    // scene.activeCamera = freeCam;

    archCam = new BABYLON.ArcRotateCamera("cam",10,20,50, new BABYLON.Vector3(0,0,0), scene);
    archCam.attachPostProcess(postProcess);
    archCam.checkCollisions = true;
    archCam.collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5);
    archCam.attachControl(canvas, true);
    scene.activeCamera = archCam;
    // add lights
    light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);

//    Name, picture url, meshSize, width, height, number of subdivisions, minHeight, maxHeight, scene, updateable?
//    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("grd", "/map", 300,300,125,0,60,scene,false);

    var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "/map", 1000, 1000, 64, 0, 60, scene, true);

    var groundMaterial1 = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial1.diffuseTexture = new BABYLON.Texture("/gras1.jpg", scene);
  	groundMaterial1.diffuseTexture.uScale = 10.0;
  	groundMaterial1.diffuseTexture.vScale = 10.0;
    // does groundmaterial have collisionchecking? - or is it only ground?
    // groundMaterial1.checkCollisions = true;
    ground.material = groundMaterial1;
    ground.checkCollisions = true;
    ground.collisionRadius = new BABYLON.Vector3(0.1, 0.1, 0.1);
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);

    // var groundPlane = BABYLON.Mesh.CreatePlane("groundPlane", 200.0, scene);
    // groundPlane.material = groundMaterial1;



    // old white ground
//    var ground = BABYLON.Mesh.CreateGround('ground1', 20,20,2,scene);

    // new create ground from heightMap

    // groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    // ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "/map", 200, 200, 250, 0, 10, scene, false);
    // ground.material = groundMaterial;

    // add local players avatar


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



    return scene;
  }

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
/*
    console.log(target);
    item.mesh.position.x = target.x;
    item.mesh.position.y = target.y + 1;
    item.mesh.position.z = target.z;

    */

//    var easingFunction = new BABYLON.BackEase(.8);
	//			easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEIN);

				//Animation.CreateAndStartAnimation = function(name, mesh, tartgetProperty, framePerSecond, totalFrame, from, to, loopMode,easingfunction );
				// var anim = BABYLON.Animation.CreateAndStartAnimation("anim", item.mesh, "position", 30, 100, item.mesh.position, target, 2, easingFunction);
    // item.mesh.translate(new BABYLON.Vector3(target.x, target.y, target.z), 0.5);

    var anim = BABYLON.Animation.CreateAndStartAnimation("anim", item.mesh, "position", 30, 100, item.mesh.position, target, 0);

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
      players[player.id].mesh = BABYLON.Mesh.CreateSphere(player.id, 16, 1, scene);
      players[player.id].mesh.position.y += 60;
      players[player.id].mesh.checkCollisions = true;
      players[player.id].collisionRadius = new BABYLON.Vector3(0.5, 0.5, 0.5);
      players[player.id].physicsImpostor = new BABYLON.PhysicsImpostor(players[player.id].mesh, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene);
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









/*
var player = {};
player.rotationSpeed = 1;
player.movementSpeed = 1;

window.addEventListener('resize', function(){
  engine.resize();
});

*/
