// cast.interface.ts
// defines an interface which is used by stage to add actors to scene
// and remove actor from scene

import {Actor} from './models/stage/actors/actor.interface';

export interface Cast {
  addActor(scene:THREE.Scene, name:string, actor:THREE.Object3D):void;
  removeActor(scene:THREE.Scene, name:string):void,
  findActor(name:string):Actor;
  reportActors(display?:boolean):Record<string,Actor>;
}

