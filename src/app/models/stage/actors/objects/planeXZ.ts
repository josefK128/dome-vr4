// planeXZ.ts
// Actor is a Factory interface - so PlaneXZ 'creates' instances using the
// options Object as variations, i.e. PlaneXZ is a factory and NOT a singleton
//
// PlaneXZ implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> PlaneXZ.create(options)
// PlaneXZ instances implement Actor interface:
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
//        'ground':{ 
//          factory:'PlaneXZ',
//          url:'./app/models/stage/actors/objects/planeXZ',
//          options:{
//               *wireframe:false, 
//               *color:'red', 
//               *opacity:0.9, 
//                width:1000,
//                height:1000,
//               *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class PlaneXZ - Factory
export const PlaneXZ:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    // options
    const wireframe = <string>options['wireframe'] || false,
        color = <string>options['color'] || 'red',
        opacity = <number>options['opacity'] || 1.0,
        width = <number>options['width'] || 1000,
        height = <number>options['height'] || 1000,
        transform = <Record<string,number[]>>options['transform'] || {};
      

    //diagnostics
    //console.log(`\n&&&&&&&&&&&&& PlaneXZ.create options:`);
    //console.dir(options);



    return new Promise((resolve, reject) => {
    
      const plane_g = new THREE.PlaneBufferGeometry(width,height,1,1),
            plane_m = new THREE.MeshBasicMaterial({
              wireframe: wireframe,
              color: color,            
              transparent: true,
              opacity:opacity,
              side:THREE.DoubleSide
            });


      // blending
      // check: need gl.enable(gl.BLEND)
      plane_m.blendSrc = THREE.SrcAlphaFactor; // default
      plane_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
      //grid_m.depthTest = false;  //default


      // plane
      const plane = new THREE.Mesh(plane_g, plane_m);
 
      // transform
      if(Object.keys(transform).length >0){
        //console.log(`planeXZ executing transform ${transform}`);
        //transform = {t:[0.0,0.0,0.0],e:[0.0,0.0,0.0],s:[1.0,1.0,1.0]};
        transform3d.apply(transform, plane);
        //console.log(`after executing transform plane = ${plane}:`);
        //console.dir(plane);
      }else{
        //console.log(`transform is {}`);
      }
 
      // situate in XZ plane (default PlaneGeometry vertices are in XY plane)
      plane.rotateX(0.5*Math.PI);
 

      // ACTOR.INTERFACE method
      // delta method for modifying properties
      plane['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`planeXZ.delta: options = ${options}:`);
        //console.dir(options);

        const wireframe = <boolean>options['wireframe'],
            color = <string>options['color'],
            opacity = <number>options['opacity'],
            transform = <Record<string,number[]>>options['transform'];
            

        if(wireframe !== undefined){
          plane_m.wireframe = new Boolean(wireframe);
        }
        if(color !== undefined){
          plane_m.color = color;
        }
        if(opacity !== undefined){
          plane_m.opacity = opacity;
        }

        // transform
        if(transform && Object.keys(transform).length >0){
          transform3d.apply(transform, plane);
        }
      };


      // render method - not needed in this case
      //plane['render'] = (et:number=0, options:object={}) => {}
 
      // return actor ready to be added to scene
      resolve(plane);

    });//return new Promise
  }//create

};//PlaneXZ;
