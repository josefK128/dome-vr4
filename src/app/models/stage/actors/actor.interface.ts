// Actor.interface.ts
// defines an interface which all Object3D-actors MUST implement,
// which is a 'delta(Record<string,unknown>):void' method for 
// modifying actor properties

// NOTE: Record<string,unknown> represents an 'options' object,
// essentially a Dictionary or Hash

// NOTE: each actor-instance is returned in the resolution of the 
// returned Promise<Actor> by the ActorFactory corresponding to the 
// particular THREE.Object3D actor type. The Promise is a closure for the 
// returned actor instance - each Promise-closure holds a unique set of 
// instance-properties for each actor-object3D-instance created.
// see './actorfactory.interface.ts'
import {Cast} from '../../../cast.interface';

export interface Actor {
  delta(options:Record<string,unknown>, narrative?:Cast):void;
}

