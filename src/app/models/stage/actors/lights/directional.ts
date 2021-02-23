// directional.ts
// Actor is a Factory interface - so Directional 'creates' instances using the
// options Object as variations, i.e. Directional is a factory and NOT a singleton
//
// Directional implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Directional.create(options)
// Directional instances implement Actor interface:
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
//        'directional':{ 
//          factory:'Directional',
//          url:'./app/models/stage/actors/lights/directional',
//          options:{
//             *color:string,         // default='white'
//             *intensity:number     // default=1.0
//              position:number[]   // default Object3D.DefaultUp=[0,1,0]
//             *castShadow:boolean    // default=false,
//             *_visualizer:boolean  //creates THREE.DirectionalLightHelper 
//                                  // default=false,
//             *transform:Object   // see services/transform3d
//          }
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d';



// class Directional - Factory
export const Directional:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{    
    return new Promise((resolve, reject) => {

      // return actor ready to be added to scene
      // directional
      const color = <string>options['color'] || 'white',
            intensity = <number>options['intensity'] || 1.0,
            p = <number[]>options['position'], // default Object3D.DefaultUp=[0,1,0]
            castShadow = <boolean>options['castShadow'] || false,
            _visualizer = <boolean>options['_visualizer'] || false,
            transform = <Record<string,number[]>>options['transform'],
            dlight = new THREE.DirectionalLight(color, intensity);
          
      let visualizer:THREE.DirectionalLightHelper;


      // position
      if(p){
        dlight.position.set(p[0],p[1],p[2]).normalize();
      }

      // add/remove visualizer
      if(_visualizer){  // true
        visualizer = new THREE.DirectionalLightHelper(dlight, 3);
        dlight.add(visualizer);
      }else{
        if(visualizer){
          dlight.remove(visualizer);
          visualizer = undefined;
        }
      }
  
      // cast shadow
      dlight.castShadow = castShadow;

      // transform
      if(transform){
        transform3d.apply(transform, dlight);
      }


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      dlight['delta'] = (options:Record<string,unknown>) => {
        //console.log(`directional.delta: options = ${options}:`);
        //console.dir(options);

        const _v = <boolean>options['_visualizer'],
              t = <Record<string,number[]>>(options['transform'] || {});


        // property changes
        dlight.color = options['color'] || color;
        dlight.intensity = options['intensity'] || intensity;

        // castShadow
        if(<boolean>options['castShadow'] !== undefined){
           dlight.castShadow = <boolean>options['castShadow'];
        }

        // add/remove visualizer
        if(_v !== undefined){
          if(_v){  //true
            if(visualizer === undefined){
              visualizer = new THREE.DirectionalHelper(dlight,3);
              dlight.add(visualizer);
            }
          }else{   //false
            if(visualizer){
              dlight.remove(visualizer);
              visualizer = undefined;
            }
          }
        }
        
        // transform
        if(Object.keys(t).length > 0){
          transform3d.apply(t, dlight);
        }
      };//delta

      resolve(dlight);
    });//return new Promise<Actor>

  }// create

};//Directional;
