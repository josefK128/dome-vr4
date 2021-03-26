// group.ts
// Actor is a Factory interface - so Group 'creates' instances using the
// options Object as variations, i.e. Group is a factory and NOT a singleton
//
// Group implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Group.create(options)
// Group instances implement Actor interface:
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
//        'group':{ 
//          factory:'Group',
//          url:'./app/models/stage/actors/object/group.js',
//          options:{
//              children:[],     // default=[]
//             *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Group - Factory
export const Group:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    return new Promise((resolve, reject) => {
      // return actor ready to be added to scene
      // group
      const children:THREE.Object3D[] = <THREE.Object3D[]>options['chiildren'],
            transform = <Record<string,number[]>>options['transform'] || {},
            group = new THREE.Group();

      
      //children
      for(const child of children){
        group.add(child);
      }


      // transform
      //console.log(`transform = ${transform}`);
      if(transform && Object.keys(transform).length>0){
        transform3d.apply(transform, group);
      }


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      // NOTE: only modification by transform is possible - for exp, 'length'
      // modification is ignored (AxisHelper has no length-property or method) 
      group['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`group.delta: options = ${options}:`);
        //console.dir(options);
    
        const transform = <Record<string,number[]>>options['transform'] || {};
        if(transform && Object.keys(transform).length>0){
          transform3d.apply(transform, group);
        }
      };

      resolve(group);
    });//return new Promise
  }

};//Group
