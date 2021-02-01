// Actorfactory.interface.ts
// defines a Factory interface - i.e. factory and NOT a singleton
// The factory creates instances of a particular THREE.Object3D, each of which
// implements the Actor interface 'delta(Object):void'. Therefore,
// each module 'models/stage/actors/*.ts implements the ActorFactory interface 
// 'create(Object):Promise<Actor>' where each instance the Promise resolves to
// implements the Actor interface 'delta(Object):void'

// NOTE: the returned Promise<Actor> is a closure for the returned actor
// instance - each Promise-closure holds a unique set of instance-properties 
// for each actor-object3D-instance created.
import {Actor} from './actor.interface';

export interface ActorFactory {
  create(Object): Promise<Actor>; 
}



