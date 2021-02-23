// multimaterial.ts
// Actor is a Factory interface - so Multimaterial 'creates' instances using the
// options Object as variations,i.e. Multimaterial is a factory NOT a singleton
//
// Multimaterial implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Multimaterial.create(options)
// Multimaterial instances implement Actor interface:
// export interface Actor {
//   delta(Object):void;   
//
//
// declarative specification in context of the stage:actors Object:
// NOTE: urls are relative to app/scenes directory
//
// NOTE: either a 'quad' or a 'sphere' may be selected via 'geometry' property
// NOTE: quad => width and height
// NOTE: sphere => radius
// NOTE: unspecified values are set to default values
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'multimaterial':{ 
//          factory:'Multimaterial',
//          url:'./app/models/stage/actors/objects/multimaterial',
//          options:{
//                geometry:'quad'|'sphere',  // default 'quad'  
//                width:10,   // iff 'quad'
//                height:10,
//                radius:5.0,  // iff 'sphere'
//                widthSegments: 10,    // default=1 quad, default=8 sphere
//                heightSegments: 10,  // default=1 quad, default=6 sphere 
//                color:[c1,c2,...],            // string[] - default 'white'
//                opacity:[o1,o2,...],         // number[] default:0.5
//                textures:[url1, url2, ...], //i.e string[] - default []
//               *transform:{t:[0.0,2.0,-3.0001],
//                            e:[0.0,1.0,0.0],
//                            s:[1.0,3.0,1.0]}   //default {} => no transform
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d';



// class Multimaterial - Factory
export const Multimaterial:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{

    //console.log(`\n&&& Multimaterial.create options:`);
    //console.dir(options);

    const geometry = <string>options['geometry'] || 'quad',  // defining option
        // other options (superset of geometry cases)
        width = <number>options['width'] || 1.0,
        height = <number>options['height'] || 1.0,
        radius = <number>options['radius'] || 1.0,
        quad_widthSegments = <number>options['widthSegments'] || 1,  
        quad_heightSegments = <number>options['heightSegments'] || 1,  
        sphere_widthSegments = <number>options['widthSegments'] || 32,  
        sphere_heightSegments = <number>options['heightSegments'] || 32,
        // NOTE: the following two arrays are truncated in use by a lesser
        // textures length, and all three arrays can have repeated elements
        color = <string[]>options['color'] || ['white'], //undef tail els default 'white' 
        opacity = <number[]>options['opacity'] || [0.5], //undef tail els default to 0.5 
        textures = <string[]>options['textures'] || [], //textures.l limits colr and opac 
        loader = new THREE.TextureLoader(),
        transform = <Record<string,number[]>>(options['transform'] || {});  // {} => no transform
             
    let multimat_g:THREE.Geometry,
        multimat_m:THREE.Material[],
        multimat:THREE.Mesh;


    return new Promise((resolve, reject) => {
      
      let maps;  // cannot be declared even 'any' or 'any[]' ?! 
                // see 'just in case 10 lines or so below

      async function load(){
        maps = await Promise.all(
          textures.map(url => loader.load(url))
        ).catch((e) => {
          const err = `failure to load textures ${textures}:${e}`;
          console.error(err);
          reject(err);
        });

        // just in case
        if(maps === undefined){
          maps = [];
        }

        // NOTE: execution within load() will wait for all textures to load.
        // i.e maps will be loaded when switch etc.,... is executed
        let e:string;
        switch(geometry) {
          case 'quad':
            multimat_g = new THREE.PlaneBufferGeometry(width, height,
              quad_widthSegments, quad_heightSegments);
            break;
  
          case 'sphere':
            multimat_g = new THREE.SphereBufferGeometry(radius,
              quad_widthSegments, quad_heightSegments);
            break;
  
          default:
            e = `unrecognized geometry = ${geometry}`;
            console.error(e);
            reject(e);
        }


        //diagnostics
        //console.log(`multimat_g:`);
        //console.dir(multimat_g);

        // prepare layers
        multimat_g.clearGroups();
  
        // create multimaterial multimat_m and layered geometry multimat_g
        if(maps.length > 0){
          for(const i in maps){
            multimat_g.addGroup(0, Infinity, i);
            const m = new THREE.MeshBasicMaterial({color:color[i] || 'white', 
              transparent:true, opacity:opacity[i] || 0.5, map:maps[i], 
              side:THREE.DoubleSide});
            //console.log(`adding material ${m} using texture ${textures[i]} to multimat_m`); 
            //console.dir(m);
            multimat_m.push(m);
          }
        }else{   // no textures ! use simple default non-textured material
          multimat_m.push( new THREE.MeshBasicMaterial({
            color:color[0] || 'white', transparent:true, 
            opacity:opacity[0] || 0.5, side:THREE.DoubleSide
          }));
        }


        // create multimaterial mesh
        multimat = new THREE.Mesh(multimat_g, multimat_m);

        // transform
        if(Object.keys(transform).length > 0){
          transform3d.apply(transform, multimat);
        }
    
        // ACTOR.INTERFACE method
        // delta method for modifying properties - only transform can be applied
        multimat['delta'] = (options:Record<string,unknown>={}) => {
          const transform = <Record<string,number[]>>options['transform'];


          // transform
          if(Object.keys(<Record<string,unknown>>transform).length > 0){
            transform3d.apply(transform, multimat);
          }
        };
    
        // render method - not needed in this case
        //sphere['render'] = (et:number=0, options:object={}) => {}
    
        // return actor ready to be added to scene
        resolve(multimat);

      }//load

      load();

    });//return new Promise<Actor>
  }//create

};//Multimaterial;
