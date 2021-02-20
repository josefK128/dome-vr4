// Actorfactory.interface.ts
// defines a Factory interface - i.e. factory and NOT a singleton
// The factory creates instances of a particular THREE.Object3D, each of which
// implements the Actor interface 'delta(Record<string,unknown>):void'. 
// Therefore, each module 'models/stage/actors/*.ts implements the ActorFactory // interface 'create(Record<string,unknown>):Promise<Actor>' where in
// each instance the Promise resolves to an object which implements the
// Actor interface 'delta(Record<string,unknown>):void'

// NOTE: Record<string,unknown> represents an 'options' object,
// essentially a Dictionary or Hash

// NOTE: the returned Promise<Actor> is a closure for the returned actor
// instance - each Promise-closure holds a unique set of instance-properties 
// for each actor-object3D-instance created.
import {Actor} from './actor.interface';

export interface ActorFactory {
  create(options:Record<string,unknown>): Promise<Actor>; 
}



