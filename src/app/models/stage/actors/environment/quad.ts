// actors/environment/quad.ts
// Actor is a Factory interface - so Quad 'creates' instances using the
// options Object as variations, i.e. Quad is a factory and NOT a singleton
//
// Quad implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Quad.create(options)
// Quad instances implement Actor interface:
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
//          factory:'Quad',
//          url:'./app/models/stage/actors/environment/quad',
//          options:{
//                width:2,
//                height:2,
//               *color:'red', 
//               *opacity:0.9, 
//                vsh_url:url
//                fsh_url:url,
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d';



// class Quad - Factory
export const Quad:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    // const options
    const width = <number>options['width'] || 2,
          height = <number>options['height'] || 2,
          color = <string>options['color'] || 'white',
          opacity = <number>options['opacity'] || 1.0,
          vsh_url = <string>options['vsh'], 
          fsh_url = <string>options['fsh']; 

    // const but unassigned
    let vsh:string,
        fsh:string,
        uniforms:string,
        shaders:string[];
      

    //diagnostics
    console.log(`\n&&& Quad vsh_url=${vsh_url} fsh_url=${fsh_url}; options:`);
    console.dir(options);


    try{
      (async () => {
        shaders = await Promise.all([
          import(vsh_url),
          import(fsh_url)
        ]);
        vsh = shaders[0];
        fsh = shaders[1]['fsh'];
        uniforms = shaders[1]['uniforms'];
      })();
    }catch(e){
      console.log(`quad shaders Promise rejected: ${e}`);
      return new Promise((resolve,reject) => {
        reject(e);
      });
    } 


    return new Promise((resolve, reject) => {
    
      const plane_g = new THREE.PlaneBufferGeometry(width,height,1,1),
            plane_m = new THREE.ShaderMaterial({
                vertexShader: vsh,
                fragmentShader: fsh,
                uniforms: uniforms, 
                transparent:true,
                side:THREE.DoubleSide,
              });
            //plane:THREE.Mesh;


      // blending
      // check: need gl.enable(gl.BLEND)
      plane_m.blendSrc = THREE.SrcAlphaFactor; // default
      plane_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
      //grid_m.depthTest = false;  //default


      // plane
      const plane = new THREE.Mesh(plane_g, plane_m);
 

      // ACTOR.INTERFACE method
      // delta method for modifying properties
      plane['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`rmquad.delta: options = ${options}:`);
        //console.dir(options);

        const color = <string>options['color'],
              opacity = <number>options['opacity'];
            
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

    });//return new Promise
  }//create

};//Quad;
