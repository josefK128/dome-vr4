// ambient.ts
// Actor is a Factory interface - so Ambient 'creates' instances using the
// options Object as variations, i.e. Ambient is a factory and NOT a singleton
//
// Ambient implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Ambient.create(options)
// Ambient instances implement Actor interface:
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
//        'ambient':{ 
//          factory:'Ambient',
//          url:'./app/models/stage/actors/lights/ambient',
//          options:{
//             *color:string,       // default='white'
//             *intensity:number,  // default=1.0
//             *transform:Object  // see services/transform3d
//          }
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d';



// class Ambient - Factory
export const Ambient:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{    
    return new Promise((resolve, reject) => {

      // return actor ready to be added to scene
      // ambient
      const color = <string>options['color'] || 'white',
            intensity = <number>options['intensity'] || 1.0,
            transform = <Record<string,number[]>>options['transform'],
            alight = new THREE.AmbientLight(color, intensity);


      // transform
      if(transform){
        transform3d.apply(transform, alight);
      }

      // ACTOR.INTERFACE method
      // delta method for modifying properties
      alight['delta'] = (options:Record<string,unknown>) => {
        //console.log(`directional.delta: options = ${options}:`);
        //console.dir(options);

        const transform = <Record<string,number[]>>(options['transform'] || {});
        alight.color = <string>options['color'] || 'white';
        alight.intensity = <number>options['intensity'] || 1.0;
        
  
        // transform
        if(transform){
          transform3d.apply(transform, alight);
        }
      };

      resolve(alight);
    });//return new Promise<Actor>
  }// create

};//Ambient;
