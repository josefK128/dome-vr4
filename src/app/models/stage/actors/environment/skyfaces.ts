// actors/environment/skyfaces.ts
// Actor is a Factory interface - so Skyfaces 'creates' instances using the
// options Object as variations, i.e. Skyfaces is a factory and NOT a singleton
//
// Skyfaces implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Skyfaces.create(options)
// Skyfaces instances implement Actor interface:
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
// NOTE: specific texture source (sgTarget.texture/rmTarget.texture) set by
// 'skyfaces' actor-name (see below) being included in either 
// config.sgTargetNames xor config.rmTargetNames respectively.
// NOTE: In that case there must also exist a config.skyfaces:string[] var
// which specifies the faces to texture - some subset from the full set of 
// six cube faces abreviated by the following six chars:
// skyfaces:['f','b','l','r','t','g'], //front,back,left,right,top,ground
//
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'skyfaces':{ 
//          factory:'Skyfaces',
//          url:'./app/models/stage/actors/environment/skyfaces',
//          options:{
//                size:1000,                  // default 1000
//                material:'basic'|'phong',  // default 'basic'
//               *color:'red',              // default 'white'
//               *opacity:0.9,             // default 1.0
//               *transform:{s:[1.0,1.0,-1.0]}  // default 
//                  //need scaling by sz<0 to invert normals to change the 
//                 //texture-image from mirror-reflection to correct left-right
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d';


// class Skyfaces - Factory
export const Skyfaces:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{

    // from options
    const size = options['size'] || 1000,
          material = options['material'] || 'basic',
          color = options['color'] || 'white',
          opacity = options['opacity'] || 1.0,
          transform = options['transform'] || {s:[1.0,1.0,-1.0]};

    let skyfaces_g:THREE.Geometry,
        skyfaces_m:THREE.Material[],
        skyfaces:THREE.Mesh;

      
    //diagnostics
    //console.log(`\n&&& Skyfaces - options`);
    //console.dir(options);
    //console.log(`size = ${size}`);
    //console.log(`material = ${material}`);
    //console.log(`color = ${color}`);
    //console.log(`opacity = ${opacity}`);
    //console.log(`transform = ${transform}:`);
    //console.dir(transform);



    return new Promise((resolve, reject) => {
      //geometry
      skyfaces_g = new THREE.BoxBufferGeometry(size, size, size);
      //console.log(`skyfaces_g = ${skyfaces_g}:`);
      //console.dir(skyfaces_g);

      //materials[] (for six sides of cube)
      for(let i=0; i<6; i++){
        skyfaces_m[i] = (material === 'basic') ? new THREE.MeshBasicMaterial({
             color: color,            
             transparent: true,
             opacity:opacity,
             side:THREE.DoubleSide
        }):
        new THREE.MeshPhongMaterial({
             color: color,            
             transparent: true,
             opacity:opacity,
             side:THREE.DoubleSide
        });

        //console.log(`skyfaces_m[${i}] = ${skyfaces_m[i]}:`);
        //console.dir(skyfaces_m[i]);
        
        skyfaces_m[i].blendSrc = THREE.SrcAlphaFactor; // default
        skyfaces_m[i].blendDst = THREE.OneMinusSrcAlphaFactor; //default
        //skyfaces_m.depthTest = false;
      }

      // actor
      skyfaces = new THREE.Mesh(skyfaces_g, skyfaces_m);
      //console.log(`skyfaces = ${skyfaces}:`);
      //console.dir(skyfaces);
  
  
      // ACTOR.INTERFACE method
      // delta method for modifying properties
      skyfaces['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`skyfaces.delta: options = ${options}:`);
        //console.dir(options);

        const color = <string>options['color'],
              opacity = <string>options['opacity'],
              transform = <Record<string,number>>(options['transform'] || {});
            
        if(color !== undefined){
          for(let i=0; i<6; i++){
            skyfaces_m[i].color = color;
          }
        }
        if(opacity !== undefined){
          for(let i=0; i<6; i++){
            skyfaces_m[i].opacity = opacity;
          }
        }
 
        // transform
        if(transform && Object.keys(transform).length >0){
          transform3d.apply(transform, skyfaces);
        }
      };
  

      // transform
      //console.log(`skyfaces: transform = ${transform}:`);
      //console.dir(transform);
      if(transform && Object.keys(transform).length >0){
        transform3d.apply(transform, skyfaces);
      }

 
      // return actor ready to be added to scene
      resolve(skyfaces);

    });//return new Promise
  }//create

};//Skyfaces;
