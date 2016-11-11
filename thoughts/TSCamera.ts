module cameras {
  export class CameraFollow {
    public radius:number = 12;
    public CAMERA_SPEED = 0.05;
    public MAX_CAMERA_SPEED:number = 20;
    public orbit:number = 0;
    public height:number=3;
    constructor() {}

    private getRadians (degrees):number {
      return degrees * Math.PI / 180;
    }

    public moveCamera(camera:BABYLON.FreeCamera, cameraTarget:BABYLON.AbstractMesh) {
      if (!cameraTarget)return;
      if (!camera)return;

      var radians:number = this.getRadians(cameraTarget.rotation.y - this.orbit);
      var targetX:number = cameraTarget.position.x + Math.sin(radians) * this.radius;
      var targetZ:number = cameraTarget.position.z + Math.cos(radians) * this.radius;
      var dx:number = targetX - camera.position.x;
      var dy:number = (cameraTarget.position.y + this.height) - camera.position.y;
      var dz:number = (targetZ) - camera.position.z;
      var vx:number = dx * this.CAMERA_SPEED * 2;
      //this is set to .05
      var vy:number = dy * this.CAMERA_SPEED;
      var vz:number = dz * this.CAMERA_SPEED * 2;
      if (vx > this.MAX_CAMERA_SPEED || vx < -this.MAX_CAMERA_SPEED) {
        vx = vx < 1 ? -this.MAX_CAMERA_SPEED : this.MAX_CAMERA_SPEED;
        //max speed is 40
      }
      if (vy > this.MAX_CAMERA_SPEED || vy < -this.MAX_CAMERA_SPEED) {
        vy = vy < 1 ? -this.MAX_CAMERA_SPEED : this.MAX_CAMERA_SPEED;
      }
      if (vz > this.MAX_CAMERA_SPEED || vz < -this.MAX_CAMERA_SPEED) {
        vz = vz < 1 ? -this.MAX_CAMERA_SPEED : this.MAX_CAMERA_SPEED;
      }
      camera.position = new BABYLON.Vector3(camera.position.x + vx, camera.position.y + vy, camera.position.z + vz);
      camera.setTarget(cameraTarget.position);
    }
  }
}
