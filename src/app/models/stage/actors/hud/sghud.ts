// sghud.ts
// Actor is a Factory interface - so Sghud 'creates' instances using the
// options Record<string,unknown> as variations, i.e. Sghud is a factory and NOT a singleton
//
// Sghud implements ActorFactory interface:
// export interface ActorFactory {
//   create(Record<string,unknown>): Promise<Actor>;   //static=> Sghud.create(options)
// Sghud instances implement Actor interface:
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
// NOTE! sghud creation is controlled by config.sgpost:string whose values are
//   'sg'|'rm'|'texture'|undefined where...
//   'sg' => use webGLRenderTarget sgTarget.texture
//   'rm' => use webGLRenderTarget rmTarget.texture
//   'texture' => use image url (probably for test ONLY)
//   undefined => NO sgpost, sghud
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
//        'sghud':{ 
//          factory:'Sghud',
//          url:'./app/models/stage/actors/hud/sghud',
//          options:{
//               *color:'red', 
//               *opacity:0.9, 
//                fsh?:url,
//                vsh?:url,
//                texture?:url,   // test ONLY! - not for production use!
//                scaleX?:number, //default=1
//                scaleY?:number; //default=1
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Sghud - Factory
export const Sghud:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    // options
    const color = options['color'] || 'white',
          opacity = options['opacity'] || 0.5,
          vsh = <string>options['vsh'] || './app/models/stage/shaders/webgl/vertex/vsh_tex_default.glsl', 
          fsh = <string>options['fsh'] || './app/models/stage/shaders/webgl/fragment/fsh_tex_default.glsl',
          texture = options['texture'],
          scaleX = options['scaleX'] || 1.0,
          scaleY = options['scaleY'] || 1.0,
          transform = options['transform'];



    return new Promise((resolve, reject) => {    
      let sghud_g:THREE.PlaneBufferGeometry,
          sghud_m:THREE.ShaderMaterial,
          vshader:string,
          fshader:string,
          uniforms:string,
          sghud:THREE.Mesh;

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

        sghud_g = new THREE.PlaneBufferGeometry(1,1,1,1);
        sghud_m = new THREE.ShaderMaterial({
                vertexShader: vshader,
                uniforms: uniforms, 
                fragmentShader: fshader,
                transparent:true,
                side:THREE.DoubleSide,
              });

        // blending
        // check: need gl.enable(gl.BLEND)
        sghud_m.blendSrc = THREE.SrcAlphaFactor; // default
        sghud_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
        //grid_m.depthTest = false;  //default

        // sghud
        sghud = new THREE.Mesh(sghud_g, sghud_m);

        // transform
        if(transform && Object.keys(<Record<string,number[]>>transform).length >0){
          transform3d.apply(transform, sghud);
        }

        //scale
        sghud.scale.set(scaleX, scaleY, 1.0);


        // test ONLY!!!
        if(texture){
          loader.load(texture, (t) => {
            console.log(`\n\n\n\n!!!!!!!!!loaded texture t=${t}`);
            console.log(`scaleX = ${scaleX} scaleY = ${scaleY}`);
            sghud_m.uniforms.tDiffuse.value = t;
            sghud_m.uniforms.tDiffuse.needsUpdate = true;
            resolve(sghud);
          });
        }else{
          resolve(sghud);
        }




        // ACTOR.INTERFACE method
        // delta method for modifying properties
        sghud['delta'] = (options:Record<string,unknown>={}) => {
          //console.log(`sghud.delta: options = ${options}:`);
          //console.dir(options);
  
          const color = options['color'],
                opacity = options['opacity'];
              
          if(color !== undefined){
            sghud_m.color = color;
          }
          if(opacity !== undefined){
            sghud_m.opacity = opacity;
          }
        };

      }//load

      load();

    });//return new Promise
  }//create

};//Sghud;
