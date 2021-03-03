// spot.ts
// Actor is a Factory interface - so Spot 'creates' instances using the
// options Object as variations, i.e. Spot is a factory and NOT a singleton
//
// Spot implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Spot.create(options)
// Spot instances implement Actor interface:
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
//        'spot':{ 
//          factory:'Spot',
//          url:'./app/models/stage/actors/lights/spot',
//          options:{
//             *color:string,       // default='white'
//             *angle:number,      // range [0,PI/2] - default Math.PI/4
//             *penumbra:number,  // default=0.0
//             *intensity:number,     // default=1.0
//             *decay:number,        // default=1.0 - linear
//              position:number[],  // default Object3D.DefaultUp=[0,1,0]
//             *target:string,     // undefined => default origin [0,0,0]
//                                // string is actorname - must be in scene!
//             *castShadow:boolean,    //default=false 
//             *_visualizer:boolean,  //creates THREE.SpotLightHelper 
//                                   // default=false,
//             *transform:Object    // see services/transform3d
//          }
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';
import {narrative} from '../../../../narrative.js';



// class Spot - Factory
export const Spot:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{    
    return new Promise((resolve, reject) => {

      // return actor ready to be added to scene
      // spot
      const color = <string>options['color'] || 'white',
            intensity = <number>options['intensity'] || 1.0,
            angle = <number>options['angle'] || Math.PI/2,
            penumbra = <number>options['penumbra'] || 0.0,
            decay = <number>options['decay'] || 1.0,
            p = <number[]>options['position'], // default Object3D.DefaultUp=[0,1,0]
            target = <string>options['target'],    // actor name
            castShadow = <boolean>options['castShadow'] || false,
            _visualizer = <boolean>options['_visualizer'] || false,
            transform = <Record<string,number[]>>options['transform'],
            spotlight = new THREE.SpotLight(color, intensity);

      let visualizer:THREE.SpotLightHelper;


      // spotlight properties
      spotlight.angle = angle;
      spotlight.penumbra = penumbra;
      spotlight.decay = decay;
      spotlight.angle = angle;

      // position, orientation to target
      if(p){
        spotlight.position.set(p[0],p[1],p[2]);
      }
      if(target){
        const actor = narrative.findActor(target);
        if(actor){
          spotlight.target = actor;
        }
      }
     

      // add/remove visualizer
      if(_visualizer){  // true
        visualizer = new THREE.SpotLightHelper(spotlight);
        spotlight.add(visualizer);
      }else{
        spotlight.remove(visualizer);
        visualizer = undefined;
      }
  
      // cast shadow
      spotlight.castShadow = castShadow;

      // transform
      if(transform){
        transform3d.apply(transform, spotlight);
      }


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      spotlight['delta'] = (options:Record<string,unknown>) => {
        //console.log(`spot.delta: options = ${options}:`);
        //console.dir(options);

        const color = <string>options['color'],
              intensity = <number>options['intensity'],
              angle = <number>options['angle'],
              penumbra = <number>options['penumbra'],
              decay = <number>options['decay'],
              _v = <boolean>options['_visualizer'],
              p = <number[]>options['position'],
              target = <string>options['target'],    // actor name
              t = <Record<string,number[]>>(options['transform'] || {});


        // property changes
        if(color){spotlight.color = color;}
        if(intensity){spotlight.intensity = intensity;}
        if(angle){spotlight.angle = angle;}
        if(penumbra){spotlight.penumbra = penumbra;}
        if(decay){spotlight.decay = decay;}

        // position, orientation to target
        if(p){
          spotlight.position.set(p[0],p[1],p[2]);
        }
        if(target){
          const actor = narrative.findActor(target);
          if(actor){
            spotlight.target = actor;
          }
        }

        // castShadow
        if(options['castShadow'] !== undefined){
           spotlight.castShadow = <boolean>options['castShadow'];
        }

        // add/remove visualizer
        if(_v !== undefined){
          if(_v){
            if(visualizer === undefined){
              visualizer = new THREE.SpotHelper(5);
              spotlight.add(visualizer);
            }
          }else{
            if(visualizer){
              spotlight.remove(visualizer);
              visualizer = undefined;
            }
          }
        }
 
        // transform
        if(Object.keys(t).length > 0){
          transform3d.apply(t, spotlight);
        }
      };//delta


      resolve(spotlight);
    });//return new Promise<Actor>
  }// create

};//Spot;
