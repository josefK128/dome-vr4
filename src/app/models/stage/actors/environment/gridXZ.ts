// actors/environment/gridXZ.ts
// Actor is a Factory interface - so GridXZ 'creates' instances using the
// options Object as variations, i.e. GridXZ is a factory and NOT a singleton
//
// GridXZ implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> GridXZ.create(options)
// GridXZ instances implement Actor interface:
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
//          factory:'GridXZ',
//          url:'../models/stage/actors/environment/gridXZ',
//          options:{
//                size:1000,
//                divisions:100,
//               *colorGrid:'red', 
//                colorCenterLine:'green', 
//               *opacity:0.9, 
//               *transform:{t:[0.0,2.0,-3.0001],e:[0.0,1.0,0.0],s:[1.0,3.0,1.0]}
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';



// class GridXZ - Factory
export const GridXZ:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    //console.log(`\n&&& GridXZ.create - options:`);
    //console.dir(options);

    // options
    const size = options['size'] || 1000,
          divisions = options['divisions'] ||100,
          colorGrid = options['colorGrid'] || 'white',
          colorCenterLine = options['colorCenterLine'] || colorGrid,
          opacity = options['opacity'] || 1.0,
          transform = options['transform'] || {};
      
    //diagnostics
    //console.log(`size = ${size}`);
    //console.log(`colorGrid = ${colorGrid}`);
    //console.log(`divisions = ${divisions}`);
    //console.log(`colorCenterLine = ${colorCenterLine}`);
    //console.log(`opacity = ${opacity}`);
    //console.log(`transform = ${transform}:`);
    //console.dir(transform);


    return new Promise((resolve, reject) => {
    
      const grid_m = new THREE.LineBasicMaterial({
            transparent: true,
            opacity:opacity,
            side:THREE.DoubleSide
          }),
          grid = new THREE.GridHelper(size, divisions, new THREE.Color(colorGrid), new THREE.Color(colorCenterLine));


      //console.log(`grid_m = ${grid_m}`);
      //console.log(`grid = ${grid}:`);
      //console.dir(grid);


      // blending
      // check: need gl.enable(gl.BLEND)
      //console.log(`blending of grid`);
      grid.material = grid_m;
      grid_m.blendSrc = THREE.SrcAlphaFactor; // default
      grid_m.blendDst = THREE.OneMinusSrcAlphaFactor; //default
      //grid_m.depthTest = false;  //default
 
      // transform
      //console.log(`transform of grid`);
      if(Object.keys(<Record<string,number[]>>transform).length > 0){
        transform3d.apply(transform, grid);
      } 


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      grid['delta'] = (options:Record<string,unknown>={}) => {
        //console.log(`gridXZ.delta: options = ${options}:`);
        //console.dir(options);

        const t = <Record<string,number[]>>(options['transform'] || {});
   
        grid_m.color = options['color'] || grid_m.color;
        grid_m.opacity = options['opacity'] || grid_m.opacity;

        // transform
        if(Object.keys(t).length > 0){
          transform3d.apply(t, grid);
        }
      };


      // render method - not needed in this case
      //grid['render'] = (et:number=0, options:object={}) => {}
 
      // return actor ready to be added to scene
      resolve(grid);

    });//return new Promise
  }//create

};//GridXZ;
