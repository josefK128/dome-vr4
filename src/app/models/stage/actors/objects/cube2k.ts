// cube2k.ts
// Actor is a Factory interface - so Cube2k 'creates' instances using the
// options Record<string,unknown> as variations, i.e. Cube2k is a factory and NOT a singleton
//
// Cube2k implements ActorFactory interface:
// export interface ActorFactory {
//   create(Record<string,unknown>): Promise<Actor>;   //static=> Cube2k.create(options)
// Cube2k instances implement Actor interface:
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
//        'cube2k':{ 
//          factory:'Cube2k',
//          url:'./app/models/stage/actors/objects/cube2k',
//          options:{
//               *wireframe:false, 
//                material:'basic'|'phong',  // default basic
//               *color:'red', 
//               *opacity:0.9, 
//               *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d';


// class Cube2k - Factory
export const Cube2k:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    let cube_g:THREE.Geometry,
        cube_m:THREE.Material,
        cube:THREE.Mesh;

    // options
    const wireframe = <boolean>options['wireframe'] || false,
          material =<string>options['material'] || 'basic',
          color = <string>options['color'] || 'red',
          opacity = <number>options['opacity'] || 1.0,
          transform = <Record<string,number[]>>(options['transform'] || {});
      

    //diagnostics
    //console.log(`&&& Cube2k options:`);
    //console.dir(option);


    return new Promise((resolve, reject) => {

      const cube_g = new THREE.BoxBufferGeometry(2000.0, 2000.0, 2000.0);
            cube_m = (material === 'basic') ? 
              new THREE.MeshBasicMaterial({
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
            cube_m.blendSrc = THREE.SrcAlphaFactor; // default
            cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
            //cube_m.depthTest = false;
            cube = new THREE.Mesh(cube_g, cube_m);
  
  
      // ACTOR.INTERFACE method
      // delta method for modifying properties
      cube['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`cube2k.delta: options = ${options}:`);
        //console.dir(options);

        const wireframe = <boolean>options['wireframe'],
              color = <string>options['color'],
              opacity = <number>options['opacity'],
              transform = <Record<string,number[]>>options['transform'];
            

        if(wireframe !== undefined){
          cube_m.wireframe = new Boolean(wireframe);
        }
        if(color !== undefined){
          cube_m.color = color;
        }
        if(opacity !== undefined){
          cube_m.opacity = opacity;
        }

        // transform
        if(transform && Object.keys(transform).length >0){
          transform3d.apply(transform, cube);
        }
       };
  

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
       resolve(cube);

     });//return new Promise
  }//create

};//Cube2k;
