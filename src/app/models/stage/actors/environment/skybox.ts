// actors/environment/skybox.ts
// Actor is a Factory interface - so Skybox 'creates' instances using the
// options Object as variations, i.e. Skybox is a factory and NOT a singleton
//
// Skybox implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Skybox.create(options)
// Skybox instances implement Actor interface:
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
//        'skybox':{ 
//          factory:'Skybox',
//          url:'../models/stage/actors/environment/skybox.js',
//          options:{
//              size:10000,         // default=10000
//             *color:'black',
//             *opacity: 1.0,      // default 1.0
//              textures:[        // string[] - cube face urls - see below
//                pathTo/posX.png,
//                pathTo/negX.png,
//                pathTo/posY.png,
//                pathTo/negY.png,
//                pathTo/posZ.png,
//                pathTo/negZ.png,
//              ],
//             *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//          }
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {Cast} from '../../../../cast.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Skybox - Factory
export const Skybox:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    const size:number = <number>options['size'] || 10000,
          color:string = <string>options['color'] || 'black',
          opacity:number = <number>options['opacity'] || 1.0,
          urls = <string[]>options['textures'],
          transform = <Record<string,number[]>>(options['transform'] || {}),

          create_material = (url_):Promise<THREE.Material> => {
            const loader = new THREE.TextureLoader();
            let material:THREE.MeshBasicMaterial;

            return new Promise((resolve, reject) => {
              try{
                loader.load(url_, (texture) => {
                  //console.log(`create_material((${url_}) texture = ${texture}:`);
                  //console.dir(texture);

                  material = new THREE.MeshBasicMaterial({
                    color:color,
                    opacity:opacity, 
                    fog:true,
                    side:THREE.DoubleSide,
                    map: texture
                  });
                  material.blending = THREE.CustomBlending;
                  material.blendSrc = THREE.SrcAlphaFactor; // default
                  material.blendDst = THREE.OneMinusSrcAlphaFactor; // default
                  material.blendEquation = THREE.AddEquation; // default
                  
                  //console.log(`create_material((${url_}) material = ${material}:`);
                  //console.dir(material);

                  resolve(material);

                });//load

              }catch(e){
                const err = `error in skybox.create_material: ${e.message}`;
                console.error(err);
                reject(err);
              }
            });
          },

          create_materials = (urls_):Promise<THREE.Material[]> => {
            try{
              return Promise.all([
                create_material(urls_[0]),
                create_material(urls_[1]),
                create_material(urls_[2]),
                create_material(urls_[3]),
                create_material(urls_[4]),
                create_material(urls_[5])
              ]);//resolve

            }catch(e){
              const err = `error in skybox.create_materials: ${e.message}`;
              console.error(err);
            }
          };


    let cube_g:THREE.Geometry,
        materials:THREE.Material[],
        cube_m:THREE.Material,
        cube:THREE.Mesh;

    //diagnostics
//    console.log(`\n\n!!! Skybox.create():`);
//    console.log(`size = ${size}`);
//    console.log(`color = ${color}`);
//    console.log(`opacity = ${opacity}`);
//    console.log(`urls = ${urls}`);
//    console.log(`transform = ${transform}:`);
//    console.dir(transform);


    return new Promise((resolve, reject) => {

      cube_g = new THREE.BoxBufferGeometry(size, size, size, 1,1,1);

      try{
        if(urls){

          create_materials(urls).then((materials_) => {
            materials = materials_;
            //console.log(`materials = ${materials}`);
            //console.dir(materials[0]);
          
            // object3D
            cube = new THREE.Mesh(cube_g, materials);
            //console.log(`cube = ${cube}`);
            //console.dir(cube);

            // render order - try to render first - i.e background
            cube.renderOrder = 10;  // larger rO is rendered first
                                 // cube rendered 'behind' vr stage & actors
            // transform
            if(Object.keys(transform).length > 0){
              transform3d.apply(transform, cube);
            }

            // delta() for property modification required by Actor interface
            cube['delta'] = (options:Record<string,unknown>={}):void => {
              if(options['color']){cube.material.color = <string>options['color'];} 
              if(options['opacity']){cube.material.opacity = <number>options['opacity'];} 

              const transform = <Record<string,number[]>>options['transform'];
              if(transform && Object.keys(transform).length > 0){
                //console.log(`cube.delta: transform = ${transform}`);
                transform3d.apply(transform, cube);
              }
            };//delta

            // return created skybox instance
            resolve(cube);

          });

        }else{  //urls=undefined
          cube_m = new THREE.MeshBasicMaterial({
            color:color,
            opacity:opacity, 
            fog:true,
            side:THREE.BackSide
          }); 
          // blending
          // check: need gl.enable(gl.BLEND)
          cube_m.blending = THREE.CustomBlending;
          cube_m.blendSrc = THREE.SrcAlphaFactor; // default
          cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
          cube_m.blendEquation = THREE.AddEquation; // default
          //cube_m.depthTest = false;  //default
  
          // object3D
          cube = new THREE.Mesh(cube_g, cube_m);

          // render order - try to render first - i.e background
          cube.renderOrder = 10;  // larger rO is rendered first
                              // cube rendered 'behind' vr stage & actors
          // transform
          if(Object.keys(transform).length > 0){
            transform3d.apply(transform, cube);
          }

          // delta() for property modification required by Actor interface
          cube['delta'] = (options:Record<string,unknown>={}):void => {
            if(options['color']){cube.material.color = <string>options['color'];} 
            if(options['opacity']){cube.material.opacity = <number>options['opacity'];} 

            const transform = <Record<string,number[]>>options['transform'];
            if(transform && Object.keys(transform).length > 0){
               //console.log(`cube.delta: transform = ${transform}`);
               transform3d.apply(transform, cube);
            }
          };//delta
 
          // return created skybox instance
          resolve(cube);
         
        }//urls


      }catch(e){
        const err = `error in skybox.create: ${e.message}`;
        console.error(err);
        reject(err);
      }

    });//return Promise<Actor>

  }//create
};//class Skybox
