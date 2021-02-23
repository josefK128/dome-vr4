// actors/environmant/skybox.ts
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
//          url:'./app/models/stage/actors/environment/skybox',
//          options:{
//              size:10000,        // default=10000
//             *opacity: 1.0,    // default 1.0
//             *textures:[      // string[] - default space - see below
//                url/posX.png,
//                url/negX.png,
//                url/posY.png,
//                url/negY.png,
//                url/posZ.png,
//                url/negZ.png,
//              ],
//             *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//          }
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d';



// class Skybox - Factory
export const Skybox:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{

    const size = <number>options['size'] || 10000,
          opacity = <number>options['opacity'] || 1.0,
          textures = <string[]>options['textures'] || [
            './app/assets/images/skybox/space/space_posX.jpg',
            './app/assets/images/skybox/space/space_negX.jpg',
            './app/assets/images/skybox/space/space_posY.jpg',
            './app/assets/images/skybox/space/space_negY.jpg',
            './app/assets/images/skybox/space/space_posZ.jpg',
            './app/assets/images/skybox/space/space_negZ.jpg'
          ],
          transform = <Record<string,number[]>>options['transform'] || {};
          
    let cubeLoader:THREE.CubeTextureLoader, 
        cube_shader:THREE.ShaderLib,
        cube_g:THREE.Geometry,
        cube_m:THREE.Material,
        cube:THREE.Mesh,
        maps;


    //diagnostics
    //console.log(`size = ${size}`);
    //console.log(`opacity = ${opacity}`);
    //console.log(`transform = ${transform}:`);
    //console.dir(transform);


    return new Promise((resolve, reject) => {
        try{
          cube_g = new THREE.BoxBufferGeometry(size, size, size, 1,1,1);
          cubeLoader = new THREE.CubeTextureLoader();
          cubeLoader.load(textures, (t) => {
            //console.log(`skybox: t = ${t}:`);
            //console.dir(t);
            //console.log(`skybox: Array.isArray(t) is ${Array.isArray(t)}`);
            cube_shader = THREE.ShaderLib['cube'];
            cube_shader.uniforms['tCube'].value = t;
            cube_m = new THREE.ShaderMaterial({
              vertexShader: cube_shader.vertexShader,
              fragmentShader: cube_shader.fragmentShader,
              uniforms: cube_shader.uniforms,
              depthWrite: false,
              opacity: opacity, 
              fog:true,
              side: THREE.BackSide
            });


            // blending
            // check: need gl.enable(gl.BLEND)
            cube_m.blending = THREE.CustomBlending;
            cube_m.blendSrc = THREE.SrcAlphaFactor; // default
            cube_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
            cube_m.blendEquation = THREE.AddEquation; // default
            //cube_m.depthTest = false;  //default


            // cube
            cube = new THREE.Mesh(cube_g, cube_m);
            cube.renderOrder = 10;  // larger rO is rendered first
                                   // cube rendered 'behind' vr stage & actors
            //cube.visible = true;  // default - not needed
    

            // transform
            if(Object.keys(transform).length > 0){
              transform3d.apply(transform, cube);
            }
  
            
            // delta() for property modification required by Actor interface
            cube['delta'] = (options:Record<string,unknown>={}) => {
              const opacity = <number>options['opacity'],
                    textures = <string[]>options['textures'],
                    transform = <Record<string,number[]>>options['transform'];

              if(opacity){
                //console.log(`cube.delta: opacity = ${opacity}`);
                cube_m.opacity = opacity;
              }
              if(textures){
                cubeLoader.load(textures, (t) => {
                  //console.log(`cube.delta: textures = ${textures}`);
                  //console.log(`cube.delta: t = ${t}`);
                  cube_shader.uniforms['tCube'].value = t;
                  cube_shader.uniforms['tCube'].needsUpdate = true;
                });  
              }
              if(transform && Object.keys(transform).length > 0){
                //console.log(`cube.delta: transform = ${transform}`);
                transform3d.apply(transform, cube);
              }
            };

            // return created skybox instance
            resolve(cube);

          });//cubeLoader.load()
        } catch(e) {
          const err = `error in skybox.create: ${e.message}`;
          console.error(err);
          reject(err);
        }
    });//return Promise<Actor>

  }//create

};
