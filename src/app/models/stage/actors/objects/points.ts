// points.ts
// Actor is a Factory interface - so Points 'creates' instances using the
// options Object as variations, i.e. Points is a factory and NOT a singleton
//
// Points implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Points.create(options)
// Points instances implement Actor interface:
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
//        'points':{ 
//          factory:'Points',
//          url:'../models/stage/actors/objects/points.js',
//          options:{
//              positions:[[0,0,0],[1,2,3]],  //no default
//              pointsize:1.0,               //default 0.0
//             *transform:{t:[0,0,0]}       //default t:[0,0,0]
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Points - Factory
export const Points:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    return new Promise((resolve, reject) => {
      // return actor ready to be added to scene
      // points
      const positions = <number[][]>options['positions'] || [[0,0,0]],
            transform = <Record<string,number[]>>options['transform'] || {},
            vertices:number[] = [],
            pointsize:number = <number>options['pointsize'] || 0.0,
            points_g:THREE.BufferGeometry = new THREE.BufferGeometry(),
            points_m:THREE.Material = new THREE.PointsMaterial({color:'white', size:pointsize});  //size must be zero or visible!
            
      //vertices
      for(let i=0; i<positions.length; i++){
        vertices.push(...positions[i]);
      }

      // geometry, material, mesh
      points_g.setAttribute('position', new THREE.Float32BufferAttribute(vertices,3));

      // points
      const points = new THREE.Points(points_g, points_m);


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      // NOTE: only modification by transform is possible - for exp, 'length'
      // modification is ignored (AxisHelper has no length-property or method) 
      points['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`points.delta: options = ${options}:`);
        //console.dir(options);
    
        const transform = <Record<string,number[]>>options['transform'] || {};
        if(transform && Object.keys(transform).length>0){
          transform3d.apply(transform, points);
        }
      };

      // transform
      //console.log(`transform = ${transform}`);
      if(transform && Object.keys(transform).length>0){
        transform3d.apply(transform, points);
      }

      resolve(points);
    });//return new Promise
  }

};//Points
