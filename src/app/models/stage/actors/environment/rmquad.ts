// rmquad.ts
// Actor is a Factory interface - so Rmquad 'creates' instances using the
// options Object as variations, i.e. Rmquad is a factory and NOT a singleton
//
// Rmquad implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Rmquad.create(options)
// Rmquad instances implement Actor interface:
// export interface Actor {
//   delta(Object):void;   
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
//        'rmquad':{ 
//          factory:'Rmquad',
//          url:'./app/models/stage/actors/objects/rmquad',
//          options:{
//               *color:'red', 
//               *opacity:0.9, 
//                fsh:url,
//                vsh:url,
//                texture?:url   // test ONLY! - not for production use!
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Rmquad - Factory
export const Rmquad:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    // options
    const color = <string>options['color'] || 'white',
          opacity = <number>options['opacity'] || 1.0,
          vsh = <string>options['vsh'], 
          fsh = <string>options['fsh'], 
          texture = <THREE.Texture>options['texture'];



    return new Promise((resolve, reject) => {    
      let plane_g:THREE.PlaneBufferGeometry,
          plane_m:THREE.ShaderMaterial,
          vshader:string,
          fshader:string,
          uniforms:string,
          plane:THREE.Mesh;
          
      const loader:THREE.TextureLoader = new THREE.TextureLoader();


      async function load() {
        const a = await Promise.all([
          import(vsh),
          import(fsh)
        ]).catch((e) => {
          console.error(`error loading module: ${e}`);
        });

        vshader = a[0].vsh;
        fshader = a[1].fsh;
        uniforms = a[1].uniforms;

        plane_g = new THREE.PlaneBufferGeometry(2,2,1,1);
        plane_m = new THREE.ShaderMaterial({
                vertexShader: vshader,
                uniforms: uniforms, 
                fragmentShader: fshader,
                transparent:true,
                side:THREE.DoubleSide,
              });

        // blending
        // check: need gl.enable(gl.BLEND)
        plane_m.blendSrc = THREE.SrcAlphaFactor; // default
        plane_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
        //grid_m.depthTest = false;  //default

        // plane
        plane = new THREE.Mesh(plane_g, plane_m);


        // test ONLY!!!
        if(texture){
          loader.load(texture, (t) => {
            plane_m.uniforms.tDiffuse.value = t;
            plane_m.uniforms.tDiffuse.needsUpdate = true;
          });
        }


        // ACTOR.INTERFACE method
        // delta method for modifying properties
        plane['delta'] = (options:Record<string,unknown>={}) => {
          //console.log(`rmquad.delta: options = ${options}:`);
          //console.dir(options);
  
          const color = <string>options['color'] || 'black',
              opacity = <number>options['opacity'] || 0.0;
              
          if(color !== undefined){
            plane_m.color = color;
          }
          if(opacity !== undefined){
            plane_m.opacity = opacity;
          }
        };
  

        // render method - not needed in this case
        //plane['render'] = (et:number=0, options:object={}) => {}
   
        // return actor ready to be added to scene
        resolve(plane);
      }//load()

      load();

    });//return new Promise
  }//create

};//Rmquad;