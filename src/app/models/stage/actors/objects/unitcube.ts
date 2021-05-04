// unitcube.ts
// Actor is a Factory interface - so Unitcube 'creates' instances using the
// options Object as variations, i.e. Unitcube is a factory and NOT a singleton
//
// Unitcube implements ActorFactory interface:
// export interface ActorFactory {
//   create(Record<string,unknown>): Promise<Actor>;   //static=> Unitcube.create(options)
// Unitcube instances implement Actor interface:
// export interface Actor {
//   delta(Record<string,unknown>):void;   
//
//
// declarative specification in context of the stage:actors Record<string,unknown>:
// NOTE: urls are relative to app/scenes directory
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'unitcube':{ 
//          factory:'Unitcube',
//          url:'./app/models/stage/actors/objects/unitcube',
//          options:{
//               *wireframe:false, 
//                material:'basic'|'phong',  // default basic
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


// class Unitcube - Factory
export const Unitcube:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{

    // options
    const wireframe = options['wireframe'] || false,
        material = options['material'] || 'basic',
        color = options['color'] || 'red',
        opacity = options['opacity'] || 1.0,
        map = options['map'],
        loader = new THREE.TextureLoader(),
        transform = <Record<string,number[]>>(options['transform'] || {});

    let cube_g:THREE.Geometry,
        cube_m:THREE.Material,
        cube:THREE.Mesh;
      
    //diagnostics
    //console.log(`&&& Unitcube options:`);
    //console.dir(options);


    return new Promise((resolve, reject) => {

      cube_g = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0);
      cube_m = (material === 'basic') ? new THREE.MeshBasicMaterial({
           wireframe: wireframe,
           color: color,            
           transparent: true,
           opacity:opacity,
           side:THREE.DoubleSide
      }):
      new THREE.MeshPhongMaterial({
           wireframe: wireframe,
           color: color,            
           transparent: true,
           opacity:opacity,
           side:THREE.DoubleSide
      });
      cube_m.blending = THREE.CustomBlending;
      cube_m.blendSrc = THREE.SrcAlphaFactor; // default
      cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
      //cube_m.depthTest = false;
      cube = new THREE.Mesh(cube_g, cube_m);
  
  
      // ACTOR.INTERFACE method
      // delta method for modifying properties
      cube['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`unitcube.delta: options = ${options}:`);
        //console.dir(options);

        const wireframe = options['wireframe'],
            color = options['color'],
            opacity = options['opacity'],
            map = options['map'],
            transform = options['transform'];
            

        if(wireframe !== undefined){
          cube_m.wireframe = new Boolean(wireframe);
        }
        if(color !== undefined){
          cube_m.color = color;
        }
        if(opacity !== undefined){
          cube_m.opacity = opacity;
        }

        // texture map
        if(map){
          loader.load(map, (t) => {
            cube_m.map = t;
            cube_m.needsUpdate=true;
          });
        }

        // transform
        if(transform && Object.keys(<Record<string,number[]>>transform).length >0){
          transform3d.apply(transform, cube);
        }
      };//cube.delta
  

      // blending
      // check: need gl.enable(gl.BLEND)
      cube_m.blending = THREE.CustomBlending;
      cube_m.blendSrc = THREE.SrcAlphaFactor; // default
      cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
      cube_m.blendEquation = THREE.AddEquation; // default
      //cube_m.depthTest = false;  //default


      // render method - not needed in this case
      //cube['render'] = (et:number=0, options:object={}) => {}

      // transform
      transform3d.apply(transform, cube);
 
      // return actor ready to be added to scene
      if(map){
        loader.load(map, (t) => {
          cube_m.map = t;
          cube_m.needsUpdate=true;
          resolve(cube);
        });
      }else{
        resolve(cube);
      }

    });//return new Promise
  }//create

};//Unitcube
