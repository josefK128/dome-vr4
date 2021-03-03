// hemisphere.ts
// Actor is a Factory interface - so Hemisphere 'creates' instances using the
// options Object as variations, i.e. Hemisphere is a factory and NOT a singleton
//
// Hemisphere implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Hemisphere.create(options)
// Hemisphere instances implement Actor interface:
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
//        'hemisphere':{ 
//          factory:'Hemisphere',
//          url:'./app/models/stage/actors/lights/hemisphere',
//          options:{
//             *skycolor:string,       // default='white'
//             *groundcolor:string,       // default='white'
//             *intensity:number,  // default=1.0
//             *castShadow:boolean   // default=false,
//             *_visualizer:boolean //creates THREE.HemisphericLightHelper 
//                                 // default=false,
//             *transform:Object  // see services/transform3d
//          }
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Hemisphere - Factory
export const Hemisphere:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{    
    return new Promise((resolve, reject) => {

      // return actor ready to be added to scene
      // hemisphere
      const skycolor = <string>options['skycolor'] || 'white',
            groundcolor = <string>options['groundcolor'] || 'green',
            intensity = <number>options['intensity'] || 1.0,
            castShadow = <boolean>options['castShadow'] || false,
            _visualizer = <boolean>options['_visualizer'] || false,
            transform = <Record<string,number[]>>options['transform'],
            hlight = new THREE.HemisphereLight(skycolor, groundcolor, intensity);
      
      let visualizer:THREE.HemisphericLightHelper;


      // add/remove visualizer
      if(_visualizer){  // true
        visualizer = new THREE.HemisphereLightHelper(hlight, 3);
        hlight.add(visualizer);
      }else{
        hlight.remove(visualizer);
        visualizer = undefined;
      }

      // cast shadow
      hlight.castShadow = castShadow;

      // transform
      if(transform){
        transform3d.apply(transform, hlight);
      }


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      hlight['delta'] = (options:Record<string,unknown>) => {
        //console.log(`directional.delta: options = ${options}:`);
        //console.dir(options);

        const _v = <boolean>options['_visualizer'],
              t = <Record<string,number[]>>options['transform'] || {};


        // NOTE:hlight.color IS skycolor; intensity is property of parent Light
        if(options['skycolor']){hlight.color = options['skycolor'];}
        if(options['groundcolor']){hlight.groundColor = options['groundcolor'];}
        if(options['intensity']){hlight.intensity = options['intensity'];}

        // castShadow
        if(options['castShadow'] !== undefined){
           hlight.castShadow = <boolean>options['castShadow'];
        }

        // add/remove visualizer
        if(_v !== undefined){
          if(_v){  //true
            if(visualizer === undefined){
              visualizer = new THREE.HemisphereLightHelper(hlight,3);
              hlight.add(visualizer);
            }
          }else{   //false
            if(visualizer){
              hlight.remove(visualizer);
              visualizer = undefined;
            }
          }
        }
  
        // transform
        if(transform){
          transform3d.apply(transform, hlight);
        }
      };

      resolve(hlight);
    });//return new Promise<Actor>
  }// create

};//Hemisphere;
