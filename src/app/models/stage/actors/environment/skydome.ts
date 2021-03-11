// actors/environment/skydome.ts
// Actor is a Factory interface - so Skydome 'creates' instances using the
// options Object as variations, i.e. Skydome is a factory and NOT a singleton
//
// Skydome implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Skydome.create(options)
// Skydome instances implement Actor interface:
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
//        'skydome':{ 
//          factory:'Skydome',
//          url:'../models/stage/actors/environment/skydome',
//          options:{
//             width:5000,         // default=10000
//             height:10000,         // default=10000
//             *color:'black',
//             *opacity: 1.0,      // default 1.0
//             *texture:'pathTo/image.png',
//             *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//          }
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {Cast} from '../../../../cast.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class Skydome - Factory
export const Skydome:ActorFactory = class {

  static create(options:Record<string,unknown>={}, narrative:Cast):Promise<Actor>{
    const width:number = <number>options['width'] || 5000,
          height:number = <number>options['height'] || 10000,
          color:string = <string>options['color'] || 'black',
          opacity:number = <number>options['opacity'] || 1.0,
          url = <string[]>options['texture'] || '',
          transform = <Record<string,number[]>>(options['transform'] || {}),
          textureLoader = new THREE.TextureLoader(); 

    let dome_g:THREE.Geometry,
        dome_m:THREE.Material,
        dome:THREE.Mesh;

    //diagnostics
    console.log(`\n\n&&& Skydome.create():`);
    console.log(`width = ${width}`);
    console.log(`height = ${height}`);
    console.log(`color = ${color}`);
    console.log(`opacity = ${opacity}`);
    console.log(`url = ${url}`);
    console.log(`transform = ${transform}:`);
    console.dir(transform);


    return new Promise((resolve, reject) => {
        try{
          dome_g = new THREE.SphereBufferGeometry(1.0);  // unit sphere
          dome_m = new THREE.MeshBasicMaterial({
            color:color,
            opacity:opacity, 
            fog:true,
            side:THREE.DoubleSide,
            map: textureLoader.load(url)
          }); 
          dome_m.blending = THREE.CustomBlending;
          dome_m.blendSrc = THREE.SrcAlphaFactor; // default
          dome_m.blendDst = THREE.OneMinusSrcAlphaFactor; // default
          dome_m.blendEquation = THREE.AddEquation; // default

          // object3D
          dome = new THREE.Mesh(dome_g, dome_m);

          // apply width and height scaling
          transform3d.apply({s:[width,height,width]}, dome);

          // render order - try to render first - i.e background
          dome.renderOrder = 10;  // larger rO is rendered first
                                 // dome rendered 'behind' vr stage & actors

          // transform
          if(Object.keys(transform).length > 0){
            transform3d.apply(transform, dome);
          }
  

            
          // delta() for property modification required by Actor interface
          dome['delta'] = (options:Record<string,unknown>={}):void => {
            const color_ = <number>options['color'] || color,
                  opacity_ = <number>options['opacity'] || opacity,
                  url_ = <string[]>options['texture'] || url,
                  transform = <Record<string,number[]>>options['transform'];

            dome.material = new THREE.MeshBasicMaterial({
              color:color_,
              opacity:opacity_, 
              fog:true,
              side:THREE.BackSide,
              map: textureLoader.load(url_)
            }); 
            dome.material.blending = THREE.CustomBlending;
            dome.material.blendSrc = THREE.SrcAlphaFactor; // default
            dome.material.blendDst = THREE.OneMinusSrcAlphaFactor; // default
            dome.material.blendEquation = THREE.AddEquation; // default

            if(transform && Object.keys(transform).length > 0){
              //console.log(`dome.delta: transform = ${transform}`);
              transform3d.apply(transform, dome);
            }
          };//delta

          // return created skydome instance
          resolve(dome);

      } catch(e) {
        const err = `error in skydome.create: ${e.message}`;
        console.error(err);
        reject(err);
      }
    });//return Promise<Actor>

  }//create

};
