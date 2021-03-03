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
//          url:'./app/models/stage/actors/lights/point',
//          options:{
//             *color:string,         // default='white'
//             *intensity:number,    // default=1.0
//              position:number[]   // default Object3D.DefaultUp=[0,1,0]
//             *distance:number,   // default=0.0 - no limit to illumination
//             *decay:number,     // default=1.0 - linear
//             *castShadow:boolean   // default=false,
//             *_visualizer:boolean,  //creates THREE.PointLightHelper 
//                                   // default=false,
//             *transform:Object    // see services/transform3d
//          }
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
      const color = <string>options['color'] || 'white',
            intensity = <number>options['intensity'] || 1.0,
            distance = <number>options['distance'] || 0.0,
            decay = <number>options['decay'] || 1.0,
            p = <number[]>options['position'], // default Object3D.DefaultUp=[0,1,0]
            castShadow = <boolean>options['castShadow'] || false,
            _visualizer = <boolean>options['_visualizer'] || false,
            transform = <Record<string,unknown>>options['transform'],
            plight = new THREE.PointLight(color, intensity);
      
      let visualizer:THREE.PointLightHelper;


      // position
      if(p){
        plight.position.set(p[0],p[1],p[2]);
      }


      // add/remove visualizer
      if(_visualizer){  // true
        visualizer = new THREE.PointLightHelper(plight, 3);
        plight.add(visualizer);
      }else{
        plight.remove(visualizer);
        visualizer = undefined;
      }
  
      // cast shadow
      plight.castShadow = castShadow;

      // transform
      if(transform){
        transform3d.apply(transform, plight);
      }


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      plight['delta'] = (options:Record<string,unknown>) => {
        //console.log(`point.delta: options = ${options}:`);
        //console.dir(options);

        const _v = <boolean>options['_visualizer'],
              t = <Record<string,unknown>>(options['transform'] || {});


        // property changes
        plight.color = <string>options['color'] || color;
        plight.intensity = <number>options['intensity'] || intensity;
        plight.distance = <number>options['distance'] || 0.0;
        plight.decay = <number>options['decay'] || 1.0;

        // castShadow
        if(options['castShadow'] !== undefined){
           plight.castShadow = <boolean>options['castShadow'];
        }

        // add/remove visualizer
        if(_v !== undefined){
          if(_v){
            if(visualizer === undefined){
              visualizer = new THREE.PointHelper(plight,3);
              plight.add(visualizer);
            }
          }else{
            if(visualizer){
              plight.remove(visualizer);
              visualizer = undefined;
            }
          }
        }
        
        // transform
        if(Object.keys(t).length > 0){
          transform3d.apply(t, plight);
        }
      };//delta

      resolve(plight);
    });//return new Promise<Actor>
  }// create

};//Point;
