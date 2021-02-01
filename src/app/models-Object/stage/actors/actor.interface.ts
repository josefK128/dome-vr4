// Actor.interface.ts
// NOTE: defines an interface which all Object3D-actors MUST implement,
// which is a 'delta(Object)' method for modifying actor properties

// NOTE: each actor-instance is returned in the resolution of the 
// returned Promise<Actor> by the ActorFactory corresponding to the 
// particular THREE.Object3D actor type. The Promise is a closure for the 
// returned actor instance - each Promise-closure holds a unique set of 
// instance-properties for each actor-object3D-instance created.
// see './actorfactory.interface.ts'

export interface Actor {
  delta(Object):void;
}

