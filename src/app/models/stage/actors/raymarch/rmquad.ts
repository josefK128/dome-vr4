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
//          url:'../models/stage/actors/objects/rmquad.js',
//          options:{
//               *opacity:0.9, 
//                fsh:'../models/stage/shaders/webgl2/fragment/fsh_rm_texquad.glsl.js'
//                vsh:'../models/stage/shaders/webgl2/fragment/vsh_default.glsl.js'
//                texture?:url   // test ONLY! - not for production use!
//               *transform:{s:[1,1,1]}  //effect depends on shader also
//                            //raymarch fsh NOT effected by grid transform
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
    const opacity = <number>options['opacity'] || 1.0,
          vsh = <string>options['vsh'] || '../../shaders/webgl2/vertex/vsh_default.glsl.js',
          fsh = <string>options['fsh'] || '../../shaders/webgl2/fragment/fsh_rm_texquad.glsl.js',
          texture = <THREE.Texture>options['texture'],
          transform = <Record<string,number[]>>options['transform']; 



    return new Promise((resolve, reject) => {    
      let plane_g:THREE.PlaneBufferGeometry,
          plane_m:THREE.ShaderMaterial,
          vshader:string,
          fshader:string,
          uniforms:string,
          //aspect:number = window.innerWidth/window.innerHeight, //aspect ratio
          //aspectp:number = window.innerWidth/window.innerHeight, //prev aspect 
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

        plane_g = new THREE.PlaneBufferGeometry(2,2);
        plane_m = new THREE.ShaderMaterial({
                opacity:opacity,
                vertexShader: vshader,
                uniforms: uniforms, 
                fragmentShader: fshader,
                transparent:true,
                side:THREE.DoubleSide,
              });

        // blending - check: need gl.enable(gl.BLEND)
        plane_m.blending = THREE.CustomBlending;
        plane_m.blendSrc = THREE.SrcAlphaFactor; // default
        plane_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
        //plane_m.depthTest = true;  //default is f

        // plane
        plane = new THREE.Mesh(plane_g, plane_m);


        //transform
//        console.log(`rmquad: transform = ${transform}:`);
//        console.dir(transform);
        if(transform && Object.keys(<Record<string,number[]>>transform).length > 0){
//          console.log(`rmquad: *** executing transform`);
          transform3d.apply(transform, plane);
//          console.log(`rmquad.position.x = ${plane.position.x}`);
//          console.log(`rmquad.position.y = ${plane.position.y}`);
//          console.log(`rmquad.position.z = ${plane.position.z}`);
        } 


        plane['animate'] = function(et:number){
          if(plane_m.uniforms && plane_m.uniforms['uTime']){
            plane_m.uniforms.uTime.value = et/1000.;
            plane_m.uniforms.uTime.needsUpdate = true;
          }
//          aspect = window.innerWidth/window.innerHeight;
//          if(aspect !== aspectp){
//            if(plane_m.uniforms && plane_m.uniforms['uAspect']){
//              //console.log('aspect');
//              plane_m.uniforms.uAspect.value = aspect;
//              plane_m.uniforms.uAspect.needsUpdate = true;
//            }
//          }
//          aspectp = aspect;
          //plane_m.uniforms.uResolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
          //plane_m.uniforms.uResolution.needsUpdate = true;
        };


        // ACTOR.INTERFACE delta method for modifying properties
        plane['delta'] = (options:Record<string,unknown>={}) => {
          //console.log(`rmquad.delta: options = ${options}:`);
          //console.dir(options); 
         const opacity = <number>options['opacity'],
               transform = <Record<string,number[]>>options['transform'];
            
          if(opacity !== undefined){
            plane_m.opacity = opacity;
          }
  
          //transform
          if(transform && Object.keys(<Record<string,number[]>>transform).length > 0){
            transform3d.apply(transform, plane);
          }
        };


        // test ONLY!!!
        if(texture){
          loader.load(texture, (t) => {
            plane_m.uniforms.tDiffuse.value = t;
            plane_m.uniforms.tDiffuse.needsUpdate = true;

            // return textured rmquad ready to be added to scene
            resolve(plane);
          });
        }else{
          // return untextured rmquad ready to be added to scene
          resolve(plane);
        }
     
      }//load()

      load();

    });//return new Promise
  }//create

};//Rmquad;
