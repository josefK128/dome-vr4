// point.ts
// Actor is a Factory interface - so Point 'creates' instances using the
// options Object as variations, i.e. Point is a factory and NOT a singleton
//
// Point implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Point.create(options)
// Point instances implement Actor interface:
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
//        'point':{ 
//          factory:'Point',
//          url:'../models/stage/actors/objects/point.js',
//          options:{
//              position:[1,2,3],         //default [0,0,0]
//              pointsize:1.0,           //default 0.0
//             *transform:{t:[0,0,0]}   //default t:[0,0,0]
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Point - Factory
export const Point:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    return new Promise((resolve, reject) => {
      // return actor ready to be added to scene
      // point
      const position = <number[]>options['position'] || [0,0,0],
            transform = <Record<string,number[]>>options['transform'] || {},
            pointsize:number = <number>options['pointsize'] || 0.0,
            vertices:number[] = [],
            point_g:THREE.BufferGeometry = new THREE.BufferGeometry(),
            point_m:THREE.Material = new THREE.PointsMaterial({color:'white', size:pointsize});  //size must be zero or visible!
            
      //vertices
      console.log(`position.l = ${position.length}`);
      vertices.push(...position);

      // geometry, material, mesh
      point_g.setAttribute('position', new THREE.Float32BufferAttribute(vertices,3));

      // point
      const point = new THREE.Points(point_g, point_m);


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      // NOTE: only modification by transform is possible - for exp, 'length'
      // modification is ignored (AxisHelper has no length-property or method) 
      point['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`point.delta: options = ${options}:`);
        //console.dir(options);
    
        const transform = <Record<string,number[]>>options['transform'] || {};
        if(transform && Object.keys(transform).length>0){
          transform3d.apply(transform, point);
        }
      };

      // transform
      //console.log(`transform = ${transform}`);
      if(transform && Object.keys(transform).length>0){
        transform3d.apply(transform, point);
      }

      resolve(point);
    });//return new Promise
  }

};//Point
