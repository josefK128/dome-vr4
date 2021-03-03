// unitsphere.ts
// Actor is a Factory interface - so Unitsphere 'creates' instances using the
// options Object as variations,i.e. Unitsphere is a factory and NOT a singleton
//
// Unitsphere implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Unitsphere.create(options)
// Unitsphere instances implement Actor interface:
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
//        'unitsphere':{ 
//          factory:'Unitsphere',
//          url:'./app/models/stage/actors/objects/unitsphere',
//          options:{
//               *wireframe:false,
//                material: 'basic' | 'phong',  //default basic
//                radius:5.0,
//                widthSegments: 10,    // default = 32
//                heightSegments: 10,  // default = 32
//               *color:'red', 
//               *opacity:0.9, 
//               *map:<url>
//               *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Unitsphere - Factory
export const Unitsphere:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{

    // options
    const radius = <number>options['radius'] || 1.0,
          widthSegments = <number>options['widthSegments'] || 32,  
          heightSegments = <number>options['heightSegments'] || 32,  
          wireframe = <boolean>options['wireframe'] || false,
          material = <string>options['material'] || 'basic',
          color = <string>options['color'] || 'red',
          opacity = <number>options['opacity'] || 1.0,
          map = options['map'],
          loader = new THREE.TextureLoader(),
          transform = <Record<string,number[]>>options['transform'] || {};
      

    //diagnostics
    //console.log(`&&& Unitsphere options:`);
    //console.dir(options);


    return new Promise((resolve, reject) => {

      const sphere_g = new THREE.SphereBufferGeometry(radius, widthSegments, heightSegments),
            sphere_m = (material === 'basic') ? new THREE.MeshBasicMaterial({
                wireframe: wireframe,
                color: color,            
                transparent: true,
                opacity:opacity,
                side:THREE.DoubleSide
              }) :
              new THREE.MeshPhongMaterial({
                wireframe: wireframe,
                color: color,            
                transparent: true,
                opacity:opacity,
                side:THREE.DoubleSide
              });


      // blending
      // check: need gl.enable(gl.BLEND)
      sphere_m.blending = THREE.CustomBlending;
      sphere_m.blendSrc = THREE.SrcAlphaFactor; // default
      sphere_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
      sphere_m.blendEquation = THREE.AddEquation; // default
      //sphere_m.depthTest = false;  //default


      // sphere
      const sphere = new THREE.Mesh(sphere_g, sphere_m);


      // transform
      transform3d.apply(transform, sphere);
 
 
      // ACTOR.INTERFACE method
      // delta method for modifying properties
      sphere['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`unitsphere.delta: options = ${options}:`);
        //console.dir(options);

        const wireframe = <boolean>options['wireframe'],
            color = <string>options['color'],
            opacity = <number>options['opacity'],
            map = options['map'],
            transform = <Record<string,number[]>>options['transform'];
           

        if(wireframe !== undefined){
          sphere_m.wireframe = wireframe;
        }
        if(color !== undefined){
          sphere_m.color = color;
        }
        if(opacity !== undefined){
          sphere_m.opacity = opacity;
        }

        // texture map
        if(map){
          loader.load(map, (t) => {
            sphere_m.map = t;
            sphere_m.needsUpdate=true;
          });
        }

        // transform
        if(transform && Object.keys(transform).length >0){
          transform3d.apply(transform, sphere);
        }
      };//sphere.delta

 
      // render method - not needed in this case
      //sphere['render'] = (et:number=0, options:object={}) => {}
 
      // return actor ready to be added to scene
      if(map){
        loader.load(map, (t) => {
          sphere_m.map = t;
          sphere_m.needsUpdate=true;
          resolve(sphere);
        });
      }else{
        resolve(sphere);
      }

    });//return new Promise
  }

};//Unitsphere;
