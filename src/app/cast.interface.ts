// cast.interface.ts
// defines an interface which is used by stage to add actors to scene
// and remove actor from scene

export interface Cast {
  addActor(scene:THREE.Scene, name:string, actor:THREE.Object3D):void;
  removeActor(scene:THREE.Scene, name:string):void;
}

