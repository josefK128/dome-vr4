// axes.ts
// Actor is a Factory interface - so Axes 'creates' instances using the
// options Object as variations, i.e. Axes is a factory and NOT a singleton
//
// Axes implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Axes.create(options)
// Axes instances implement Actor interface:
// export interface Actor {
//   delta(Object):void;   
//
//
// declarative specification in context of the stage:actors Object:
// NOTE: urls are relative to app/scenes directory
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'axes':{ 
//          factory:'Axes',
//          url:'./app/models/stage/actors/environment/axes',
//          options:{
//              length:10000,     // default=10000
//             *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Axes - Factory
export const Axes:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    return new Promise((resolve, reject) => {
      // return actor ready to be added to scene
      // axes
      const length = options['length'] || 10000,
            transform = <Record<string,number[]>>options['transform'] || {},
            axes = new THREE.AxesHelper(length);

      // transform
      //console.log(`transform = ${transform}`);
      if(transform && Object.keys(transform).length>0){
        transform3d.apply(transform, axes);
      }


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      // NOTE: only modification by transform is possible - for exp, 'length'
      // modification is ignored (AxisHelper has no length-property or method) 
      axes['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`axes.delta: options = ${options}:`);
        //console.dir(options);
    
        const transform = <Record<string,number[]>>options['transform'] || {};
        if(transform && Object.keys(transform).length>0){
          transform3d.apply(transform, axes);
        }
      };

      resolve(axes);
    });//return new Promise
  }

};//Axes
