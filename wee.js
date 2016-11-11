"use strict";

var THEGAME = THEGAME || {};

var _showPhysicsDebugObjects = false;       // set to true to see the dude physics

var enumDirectionKeys = {
    keyNone: 0,
    keyUp: 87,
    keyLeft: 65,
    keyRight: 68,
    keyDown: 83,
    keyJump: 32
}

var enumDirections = {
    none: 0,
    north: 1,
    northeast: 2,
    east: 3,
    southeast: 4,
    south: 5,
    southwest: 6,
    west: 7,
    northwest: 8,
    jump: 9,
    kick: 10
}

// key states
var keyStates = new Object();

THEGAME.Engine = function (babylonEngine) {

    this._babylonEngine = babylonEngine;
    this._scene = null;
    this._currentDirection = enumDirections.none;
    this._currentAngle = 0;
    this._meshRegularGuy = null;
    this._walkSpeed = 1.5;
    this._walkSpeedPhysics = 10;
    this._camera = null;
    this._soundLoadedCount = 0;
    this._numSounds = 3;
    this._soundsReady = false;
    this._leftJoystick = new BABYLON.GameFX.VirtualJoystick(true);
    this._busyKicking = false;

    this._leftJoystick.setActionOnTouch(function (action) {
        that.moveInDirection(enumDirections.kick);
    });

    var that = this;

    this.handleKeyDown = function (evt) {
        if (evt.ctrlKey) {
            keyStates['ctrl'] = true;
        } else {
            keyStates[evt.keyCode] = true;
        }
        that.moveTheGuy();
        evt.preventDefault();;
    };

    this.handleKeyUp = function (evt) {
        keyStates['ctrl'] = false;
        keyStates[evt.keyCode] = false;

        that.moveTheGuy();
        evt.preventDefault();;

    };

    THEGAME.Engine.prototype.anyKeyDown = function () {

        for (var key in keyStates) {
            if (keyStates[key] == true) {
                return true;
            }
        }

        return false;
    }

    THEGAME.Engine.prototype.createScene = function () {

        // the physics body for the guy
        this._regularGuyBox = null;
        this._regularGuyBoxBody = null;
        this._regularGuyBoxWheel = null;
        this._regularGuyBoxWheelSphere = null;
        this._regularGuyKickLegBox = null;
        this._regularGuyBoxWheelConstraint = null;

        // create the Scene
        var scene = new BABYLON.Scene(this._babylonEngine);
        this._scene = scene;

        // sound fx
        createjs.Sound.initializeDefaultPlugins();
        var audioPath = "sounds/";
        var manifest = [
            { id: "kick", src: "kick.mp3" },
            { id: "wood", src: "wood.mp3" },
            { id: "ball", src: "ball.mp3" },
        ];
        createjs.Sound.addEventListener("fileload", function (e) {
            that._soundLoadedCount++;
            if (that._soundLoadedCount == that._numSounds) {
                that._soundsReady = true;
            }
        });
        createjs.Sound.registerManifest(manifest, audioPath);

        // physics
        scene.enablePhysics();
        scene.setGravity(new BABYLON.Vector3(0, -10, 0));

        // add a light
        var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
        light.position = new BABYLON.Vector3(0, 150, 20);

        // skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 800.0, this._scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this._scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", this._scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        // shadows
        var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);

        // Add a camera that allows rotating view around a point
        var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, new BABYLON.Vector3.Zero(), scene);
        this._camera = camera;
        scene.activeCamera.attachControl(canvas);

        // create the ground
        var ground = BABYLON.Mesh.CreateBox("Box", 60.0, scene);
        var groundMat = new BABYLON.StandardMaterial("boxMat", scene);
        groundMat.diffuseTexture = new BABYLON.Texture("images/models/grass_diffuse.jpg", scene);
        groundMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        groundMat.specularColor = new BABYLON.Color3(0, 0, 0);
        groundMat.diffuseTexture.uScale = 30;
        groundMat.diffuseTexture.vScale = 30;
        ground.material = groundMat;
        ground.receiveShadows = true;
        ground.scaling = new BABYLON.Vector3(5, 1, 5);
        ground.position.y = 0;
        ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.7 });
        var groundBody = scene._physicsEngine._registeredMeshes[scene._physicsEngine._registeredMeshes.length - 1].body;

        // create our "three walls"
        var wall1 = BABYLON.Mesh.CreateBox("wall1", 2, scene);
        wall1.position = new BABYLON.Vector3(0, 31, -24);
        wall1.scaling = new BABYLON.Vector3(20, 2, 0.7);
        wall1.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.7 });

        var wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
        wallMaterial.backFaceCulling = false;
        wallMaterial.diffuseTexture = new BABYLON.Texture("images/brick_diffuse.jpg", scene);
        wallMaterial.specularTexture = new BABYLON.Texture("images/brick_specularity.jpg", scene);
        wallMaterial.bumpTexture = new BABYLON.Texture("images/brick_normals.jpg", scene);
        wallMaterial.diffuseTexture.vScale = 0.3;
        wallMaterial.specularTexture.vScale = 0.3;
        wallMaterial.bumpTexture.vScale = 0.3;
        wall1.material = wallMaterial;

        var wall2 = BABYLON.Mesh.CreateBox("wall2", 2, scene);
        wall2.position = new BABYLON.Vector3(20, 31, -5);
        wall2.scaling = new BABYLON.Vector3(20, 2, 0.7);
        wall2.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.7 });
        var wallBody = scene._physicsEngine._registeredMeshes[scene._physicsEngine._registeredMeshes.length - 1].body;
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0,0,1), this.degreeToRadians(90));
        wall2.material = wallMaterial;

        var wall3 = BABYLON.Mesh.CreateBox("wall3", 2, scene);
        wall3.position = new BABYLON.Vector3(-20, 31, -5);
        wall3.scaling = new BABYLON.Vector3(20, 2, 0.7);
        wall3.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 0, friction: 0.5, restitution: 0.7 });
        wallBody = scene._physicsEngine._registeredMeshes[scene._physicsEngine._registeredMeshes.length - 1].body;
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), this.degreeToRadians(90)); wall3.material = wallMaterial;

        // load the "regular guy" model
        BABYLON.SceneLoader.ImportMesh("", "images/models/", "regularGuy.babylon", scene, function (newMeshes, particleSystems, skeletons) {
            // optional - position and size the mesh
            var mesh = newMeshes[0];
            mesh.position.y = 26;

            camera.target = new BABYLON.Vector3(0, 0, 0);
            camera.setPosition(new BABYLON.Vector3(0, 0, 10));
            that._meshRegularGuy = mesh;

            // begin the standing animation
            that._skeletonRegularGuy = skeletons[0];
            scene.beginAnimation(that._skeletonRegularGuy, 31, 60, true, 1.0);

            shadowGenerator.getShadowMap().renderList.push(mesh);

            // create the physics bodies representing the dude
            var regularGuyBox = BABYLON.Mesh.CreateBox("regularGuyBox", 1, scene);
            regularGuyBox.scaling = new BABYLON.Vector3(1, 2, 1);
            regularGuyBox.position = new BABYLON.Vector3(mesh.position.x, mesh.position.y + 6.3, mesh.position.z);
            regularGuyBox.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 1, friction: 0.5, restitution: 0.1 });
            regularGuyBox.visibility = _showPhysicsDebugObjects;
            that._regularGuyBox = regularGuyBox;

            // get the physics body reference of the box
            that._regularGuyBoxBody = scene._physicsEngine._registeredMeshes[scene._physicsEngine._registeredMeshes.length - 1].body;
            that._regularGuyBoxBody.inertia.set(0, 0, 0);
            that._regularGuyBoxBody.invInertia.set(0, 0, 0);

            // create the "leg" for kicking
            that._regularGuyKickLegBox = BABYLON.Mesh.CreateBox("regularGuyKickLegBox", 1, scene);
            that._regularGuyKickLegBox.visibility = _showPhysicsDebugObjects;
            that._regularGuyKickLegBox.scaling = new BABYLON.Vector3(1, 1, 1);
            that._regularGuyKickLegBox.position = new BABYLON.Vector3(mesh.position.x, mesh.position.y + 5, mesh.position.z - 1.2);

            // create the "wheel" that the guy moves on
            that._regularGuyBoxWheelSphere = BABYLON.Mesh.CreateSphere("regularGuyWheel", 10, 1, scene);
            that._regularGuyBoxWheelSphere.visibility = _showPhysicsDebugObjects;
            that._regularGuyBoxWheelSphere.position = new BABYLON.Vector3(mesh.position.x, mesh.position.y + 4.8, mesh.position.z);
            that._regularGuyBoxWheelSphere.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 1, friction: 0.5, restitution: 0.1 });

            // get the physics body reference of the wheel
            that._regularGuyBoxWheel = scene._physicsEngine._registeredMeshes[scene._physicsEngine._registeredMeshes.length - 1].body;

            // create the hinge (joint) and motor for wheel
            var leftAxis = new CANNON.Vec3(0, 1, 0);
            var leftFrontAxis = new CANNON.Vec3(0, 1, 0);
            that._regularGuyBoxWheelConstraint = new CANNON.HingeConstraint(that._regularGuyBoxBody, new CANNON.Vec3(0, 0, -1.5), leftFrontAxis, that._regularGuyBoxWheel, new CANNON.Vec3(), leftAxis)
            scene._physicsEngine._world.addConstraint(that._regularGuyBoxWheelConstraint);
            that._regularGuyBoxWheelConstraint.enableMotor();

            // hide the loading divs
            document.getElementById("divLoading").style.display = 'none';
            document.getElementById("divLoadingMessage").style.display = 'none';
        });

        // create some crates
        var crateSize = 2;
        var crate = BABYLON.Mesh.CreateBox("crate", 0.9, scene);
        var crateMat = new BABYLON.StandardMaterial("boxMat", scene);
        crateMat.bumpTexture = new BABYLON.Texture("images/models/floor_normal.jpg", scene);
        crateMat.diffuseTexture = new BABYLON.Texture("images/models/floor_diffuse.jpg", scene);
        crateMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        crateMat.specularColor = new BABYLON.Color3(0, 0, 0);
        crate.scaling = new BABYLON.Vector3(2, 2, 2);
        crate.material = crateMat;
        shadowGenerator.getShadowMap().renderList.push(crate);
        crate.position.x = 3;
        crate.position.y = crateSize + 29;
        crate.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 1, friction: 0.5, restitution: 0 });
        var crateBody = scene._physicsEngine._registeredMeshes[scene._physicsEngine._registeredMeshes.length - 1].body;
        crateBody.addEventListener("collide", function (e) {
            if (that._soundsReady && that.isHardImpact(e))
                createjs.Sound.play("wood");
        });

        for (var i = 0; i < 2; i++) {
            var newCrate = crate.clone("crate" + i);
            newCrate.position.y = crate.position.y + crateSize + (crateSize * i);
            shadowGenerator.getShadowMap().renderList.push(newCrate);
            newCrate.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, mass: 1, friction: 0.5, restitution: 0.3 });
            var newCrateBody = scene._physicsEngine._registeredMeshes[scene._physicsEngine._registeredMeshes.length - 1].body;
            newCrateBody.addEventListener("collide", function (e) {
                if (that._soundsReady && that.isHardImpact(e))
                    createjs.Sound.play("wood");
            });
        }

        // create some balls
        var ballMat = new BABYLON.StandardMaterial("ballMat", scene);
        ballMat.diffuseTexture = new BABYLON.Texture("images/beachball_diffuse.jpg", scene);
        for (var i = 0; i < 5; i++) {
            var ballSize = 1;
            var ball = BABYLON.Mesh.CreateSphere("ball", 16, 1.5, scene);
            ball.material = ballMat;
            shadowGenerator.getShadowMap().renderList.push(ball);
            ball.position.x = -6 + i;
            ball.position.y = ballSize + 30;
            ball.position.z = i - 8;
            ball.setPhysicsState({ impostor: BABYLON.PhysicsEngine.SphereImpostor, mass: 0.05, friction: 0.5, restitution: 0.9 });
            var ballBody = scene._physicsEngine._registeredMeshes[scene._physicsEngine._registeredMeshes.length - 1].body;
            ballBody.addEventListener("collide", function (e) {
                if (that._soundsReady && that.isHardImpact(e))
                    createjs.Sound.play("ball");
            });
        }

        // code to execute on each render cycle
        this._scene.registerBeforeRender(function () {
            if (that._meshRegularGuy != null) {
                that._currentDebugBoxToDisplay = 0;

                that.getJoystickInput();
                that.moveTheGuyPosition();
            }
        });

        // Once the scene is loaded, just register a render loop to render it
        this._babylonEngine.runRenderLoop(function () {
            scene.render();
        });

        // Resize
        window.addEventListener("resize", function () {
            that._babylonEngine.resize();
        });

        // key input
        window.addEventListener("keydown", this.handleKeyDown, false);
        window.addEventListener("keyup", this.handleKeyUp, false);


        return scene;

    }

    THEGAME.Engine.prototype.moveTheGuy = function () {
        var newDirection = enumDirections.none;

        if (keyStates[enumDirectionKeys.keyJump]) {
            newDirection = enumDirections.jump;
        } else if (keyStates['ctrl']) {
            newDirection = enumDirections.kick;
        } else if (keyStates[enumDirectionKeys.keyUp] && keyStates[enumDirectionKeys.keyRight]) {
            newDirection = enumDirections.northeast;
        } else if (keyStates[enumDirectionKeys.keyDown] && keyStates[enumDirectionKeys.keyRight]) {
            newDirection = enumDirections.southeast;
        } else if (keyStates[enumDirectionKeys.keyUp] && keyStates[enumDirectionKeys.keyLeft]) {
            newDirection = enumDirections.northwest;
        } else if (keyStates[enumDirectionKeys.keyDown] && keyStates[enumDirectionKeys.keyLeft]) {
            newDirection = enumDirections.southwest;
        } else if (keyStates[enumDirectionKeys.keyUp]) {
            newDirection = enumDirections.north;
        } else if (keyStates[enumDirectionKeys.keyDown]) {
            newDirection = enumDirections.south;
        } else if (keyStates[enumDirectionKeys.keyRight]) {
            newDirection = enumDirections.east;
        } else if (keyStates[enumDirectionKeys.keyLeft]) {
            newDirection = enumDirections.west;
        }
        else {
            newDirection = enumDirections.none;
        }

        that.moveInDirection(newDirection);

    }


    THEGAME.Engine.prototype.moveInDirection = function (newDirection) {

        //jumping is a bit wonky right now, so disabled!

        //if (newDirection == enumDirections.jump) {
        //    that._scene.beginAnimation(that._skeletonRegularGuy, 61, 85, false, 2, function () {
        //        that._regularGuyBoxWheelConstraint.motorTargetVelocity = 0;
        //        that._regularGuyBoxBody.applyImpulse(new CANNON.Vec3(0, 0, 15), new CANNON.Vec3(0, 0, 0));
        //        scene.beginAnimation(that._skeletonRegularGuy, 31, 60, true, 1.0);
        //        that._currentDirection = enumDirections.none;
        //    });
        //}
        //else {

        if (newDirection == enumDirections.kick) {
            that._currentDirection = enumDirections.none;
            that._regularGuyBoxWheelConstraint.motorTargetVelocity = 0;

            createjs.Sound.play("kick");

            // this is the "kick"
            // see if anything intersects with the kick box
            var POWER = 0.5;
            for (var i = 0; i < that._scene.meshes.length; i++) {
                var thisMesh = that._scene.meshes[i];

                if (!thisMesh.name || (thisMesh.name.indexOf("crate") < 0
                    && thisMesh.name.indexOf("ball") < 0))
                    continue;

                that._regularGuyKickLegBox.lookAt(thisMesh.position);
                if (that._regularGuyKickLegBox.intersectsMesh(thisMesh, false)) {
                    var dir = thisMesh.position.subtract(that._regularGuyBoxWheelSphere.position);
                    dir.normalize();
                    thisMesh.applyImpulse(dir.scale(thisMesh._physicsMass * 15), that._regularGuyBoxWheelSphere.position);
                    createjs.Sound.play("wood");
                }
            }

            keyStates['ctrl'] = false;

            that._busyKicking = true;
            that._scene.beginAnimation(that._skeletonRegularGuy, 91, 100, false, 1, function () {
                that._busyKicking = false;
            });

        }
        else {

            if (newDirection != that._currentDirection) {

                that._currentDirection = newDirection;

                switch (that._currentDirection) {

                    case enumDirections.north:

                        that._scene.beginAnimation(that._skeletonRegularGuy, 0, 30, true, that._walkSpeed);
                        that._currentAngle = 180;
                        break;
                    case enumDirections.northeast:

                        that._scene.beginAnimation(that._skeletonRegularGuy, 0, 30, true, that._walkSpeed);
                        that._currentAngle = 135;
                        break;
                    case enumDirections.east:

                        that._scene.beginAnimation(that._skeletonRegularGuy, 0, 30, true, that._walkSpeed);
                        that._currentAngle = 90;
                        break;
                    case enumDirections.southeast:

                        that._scene.beginAnimation(that._skeletonRegularGuy, 0, 30, true, that._walkSpeed);
                        that._currentAngle = 45;
                        break;
                    case enumDirections.south:

                        that._scene.beginAnimation(that._skeletonRegularGuy, 0, 30, true, that._walkSpeed);
                        that._currentAngle = 0;
                        break;
                    case enumDirections.southwest:

                        that._scene.beginAnimation(that._skeletonRegularGuy, 0, 30, true, that._walkSpeed);
                        that._currentAngle = 315;
                        break;
                    case enumDirections.west:

                        that._scene.beginAnimation(that._skeletonRegularGuy, 0, 30, true, that._walkSpeed);
                        that._currentAngle = 270;
                        break;
                    case enumDirections.northwest:

                        that._scene.beginAnimation(that._skeletonRegularGuy, 0, 30, true, that._walkSpeed);
                        that._currentAngle = 225;
                        break;

                    case enumDirections.none:
                        that._regularGuyBoxWheelConstraint.motorTargetVelocity = 0;
                        scene.beginAnimation(that._skeletonRegularGuy, 31, 60, true, 1.0);
                        break;
                }
            }
        }
    }

    THEGAME.Engine.prototype.getJoystickInput = function () {

        var joystick = that._leftJoystick;
        var newDirection = that._currentDirection;
        var delta = (that._leftJoystick.deltaJoystickVector);
        var thresholdZero = 20;

        // check for busy kicking
        if (that._busyKicking)
            return;

        if (joystick._joystickPressed == false && !that.anyKeyDown()) {
            newDirection = enumDirections.none;
        } else if (delta.x < -thresholdZero && delta.y < -thresholdZero) {
            newDirection = enumDirections.northwest;
        } else if (delta.x < -thresholdZero && delta.y > thresholdZero) {
            newDirection = enumDirections.southwest;
        } else if (delta.x > thresholdZero && delta.y > thresholdZero) {
            newDirection = enumDirections.southeast;
        } else if (delta.x > thresholdZero && delta.y < -thresholdZero) {
            newDirection = enumDirections.northeast;
        } else if (delta.x > thresholdZero) {
            newDirection = enumDirections.east;
        } else if (delta.x < -thresholdZero) {
            newDirection = enumDirections.west;
        } else if (delta.y > thresholdZero) {
            newDirection = enumDirections.south;
        } else if (delta.y < -thresholdZero) {
            newDirection = enumDirections.north;
        }

        that.moveInDirection(newDirection);

    }

    THEGAME.Engine.prototype.moveTheGuyPosition = function () {
        that._meshRegularGuy.position = (new BABYLON.Vector3(that._regularGuyBoxBody.position.x, that._regularGuyBoxBody.position.z - 6.25, that._regularGuyBoxBody.position.y));

        if (that._currentDirection > enumDirections.none && that._currentDirection < enumDirections.jump) {
            var angleCamera = that.getAngleBetweenPoints(that._meshRegularGuy.position.x, that._meshRegularGuy.position.z,
                         that._camera.position.x, that._camera.position.z);
            that._meshRegularGuy.rotation.y = -(angleCamera + (that.degreeToRadians(that._currentAngle + 90)));
            var angle = angleCamera + that.degreeToRadians(that._currentAngle);
            that._regularGuyBoxBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), angle);
            that._regularGuyBoxWheel.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), angle);
            that._regularGuyBoxWheelConstraint.motorTargetVelocity = -that._walkSpeedPhysics;
        }

        // place the "kick box" where the kick takes place
        var boxPos = that.getPointGivenDistanceAndBearing(that._regularGuyBoxWheelSphere.position.x, that._regularGuyBoxWheelSphere.position.z, 1, (-that._meshRegularGuy.rotation.y) - that.degreeToRadians(90));
        that._regularGuyKickLegBox.position = (new BABYLON.Vector3(boxPos.x, that._regularGuyKickLegBox.position.y, boxPos.y));

        // update the camera
        this._camera.target = new BABYLON.Vector3(that._meshRegularGuy.position.x, that._meshRegularGuy.position.y + 7, that._meshRegularGuy.position.z);

    }

    THEGAME.Engine.prototype.getPointGivenDistanceAndBearing = function (x1, y1, d, angle) {
        var x2 = x1 + Math.cos(angle) * d;
        var y2 = y1 + Math.sin(angle) * d;

        return { x: x2, y: y2 };
    }

    THEGAME.Engine.prototype.getAngleBetweenPoints = function (x1, y1, x2, y2) {
        var xDiff = x2 - x1;
        var yDiff = y2 - y1;
        return Math.atan2(yDiff, xDiff);  // for degrees do * (180 / Math.PI);
    }

    THEGAME.Engine.prototype.degreeToRadians = function (deg) {
        return deg * (Math.PI / 180);
    }

    THEGAME.Engine.prototype.getAngleBetweenVectors = function (a, b, c) {
        var v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
        var v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

        var v1Mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
        var v1Norm = { x: v1.x / v1Mag, y: v1.y / v1Mag, z: v1.z / v1Mag };

        var v2Mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);
        var v2Norm = { x: v2.x / v2Mag, y: v2.y / v2Mag, z: v2.z / v2Mag };

        var res = v1Norm.x * v2Norm.x + v1Norm.y * v2Norm.y + v1Norm.z * v2Norm.z;

        var angle = Math.acos(res);

        if (isNaN(angle))
            angle = 0;

        return angle;

    }

    THEGAME.Engine.prototype.getDistanceBetweenPoints = function (vec1, vec2) {
        var xd = Math.abs(vec2.x - vec1.x);
        var yd = Math.abs(vec2.y - vec1.y);
        var zd = Math.abs(vec2.z - vec1.z);
        var distance = Math.sqrt(xd * xd + yd * yd + zd * zd)
        return distance;
    }

    THEGAME.Engine.prototype.isHardImpact = function (e) {
        if (Math.abs(e.contact.bi.angularVelocity.x) > 2
            || Math.abs(e.contact.bi.angularVelocity.y) > 2
            || Math.abs(e.contact.bi.angularVelocity.z) > 2)
            return true;
        else
            return false;
    }

}
