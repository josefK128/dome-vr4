// hud.ts
// Actor is a Factory interface - so Hud 'creates' instances using the
// options Record<string,unknown> as variations, i.e. Hud is a factory and NOT a singleton
//
// Hud implements ActorFactory interface:
// export interface ActorFactory {
//   create(Record<string,unknown>): Promise<Actor>;   //static=> Hud.create(options)
// Hud instances implement Actor interface:
// export interface Actor {
//   delta(Record<string,unknown>):void;   
//
// declarative specification in context of the stage:actors Record<string,unknown>:
// NOTE: urls are relative to app/scenes directory
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
// NOTE! hud creation is controlled by config.sgpost:string whose values are
//   'sg'|'rm'|'texture'|undefined where...
//   'sg' => use webGLRenderTarget sgTarget.texture
//   'rm' => use webGLRenderTarget rmTarget.texture
//   'texture' => use image url (probably for test ONLY)
//   undefined => NO sgpost, hud
//
// NOTE: default shaders are provided below in static create method
//
// NOTE! three.js r88 and perhaps some other following versions permit the
// use of sgTarget.texture and rmTarget.texture texture maps on hud. However
// r103-104 and presumably later DO NOT! WebGL 2 permites multiple render
// targets so will once again allow sgTarget.texture and rmTarget.texture to be
// used again.
// Until then the hud may only use an image texture map, or custom shaders
// (not the default texture map shaders)
//
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'hud':{ 
//          factory:'Hud',
//          url:'../models/stage/actors/post/hud.js',
//          options:{
//               *color:'red', 
//               *opacity:0.9, 
//                fsh?:url,
//                vsh?:url,
//                texture?:url,   // test ONLY! - not for production use!
//                scaleX?:number, //default=1
//                scaleY?:number; //default=1
//               *transform:{s:[1,1,1]}  //effect depends on shader also
//                            //raymarch fsh NOT effected by grid transform
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Hud - Factory
export const Hud:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    // options
    const color = <string>options['color'] || 'white',
          opacity = <number>options['opacity'] || 0.5,
          vsh = <string>options['vsh'] || '../../shaders/webgl1/quad_vsh/vsh_default.glsl.js', 
          fsh = <string>options['fsh'] || '../../shaders/webgl1/quad_fsh/fsh_default.glsl.js',
          texture = <string>options['texture'],
          scaleX = <number>options['scaleX'] || 1.0,
          scaleY = <number>options['scaleY'] || 1.0,
          transform = <Record<string,number[]>>options['transform'];



    return new Promise((resolve, reject) => {    
      let hud_g:THREE.PlaneBufferGeometry,
          hud_m:THREE.ShaderMaterial,
          vshader:string,
          fshader:string,
          uniforms:string,
          hud:THREE.Mesh;

      const loader:THREE.TextureLoader = new THREE.TextureLoader();


      async function load() {
        const w = 2.0*scaleX,
              h = 2.0*scaleY,
              a = await Promise.all([
                import(vsh),
                import(fsh)
              ]).catch((e) => {
                console.error(`error loading module: ${e}`);
              });

        vshader = a[0].vsh;
        fshader = a[1].fsh;
        uniforms = a[1].uniforms;

        hud_g = new THREE.PlaneBufferGeometry(w,h,1,1);
        hud_m = new THREE.ShaderMaterial({
                vertexShader: vshader,
                uniforms: uniforms, 
                fragmentShader: fshader,
                opacity:opacity,
                transparent:true,
                side:THREE.DoubleSide,
              });

        // blending
        // check: need gl.enable(gl.BLEND)
        hud_m.blending = THREE.CustomBlending;
        hud_m.blendSrc = THREE.SrcAlphaFactor; // default
        hud_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
        //grid_m.depthTest = false;  //default

        // hud
        hud = new THREE.Mesh(hud_g, hud_m);

        // transform
        if(transform && Object.keys(<Record<string,number[]>>transform).length >0){
          transform3d.apply(transform, hud);
        }


        // test ONLY!!!
        if(texture){
          loader.load(texture, (t) => {
            //console.log(`\n\n\n\n!!!!!!!!!loaded texture t=${t}`);
            //console.log(`scaleX = ${scaleX} scaleY = ${scaleY}`);
            hud_m.uniforms.tDiffuse.value = t;
            hud_m.uniforms.tDiffuse.needsUpdate = true;
            resolve(hud);
          });
        }else{
          resolve(hud);
        }




        // ACTOR.INTERFACE method
        // delta method for modifying properties
        hud['delta'] = (options:Record<string,unknown>={}) => {
          //console.log(`hud.delta: options = ${options}:`);
          //console.dir(options);
  
          const color = options['color'],
                opacity = options['opacity'],
                transform = <Record<string,number[]>>options['transform'];
              
          if(color !== undefined){
            hud_m.color = color;
          }
          if(opacity !== undefined){
            hud_m.opacity = opacity;
          }

          //transform
          if(transform && Object.keys(<Record<string,number[]>>transform).length > 0){
            transform3d.apply(transform, hud);
          }
        };

      }//load

      load();

    });//return new Promise
  }//create

};//Hud;
