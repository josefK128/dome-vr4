// multishader.ts
// Actor is a Factory interface - so MultiShader 'creates' instances using the
// options Object as variations,i.e. MultiShader is a factory NOT a singleton
//
// MultiShader implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> MultiShader.create(options)
// MultiShader instances implement Actor interface:
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
// !!!!!!!!!!
// NOTE!!!! to use textures (at all!) the fragment shaders corresponding to
// the fshaders url-array MUST define a uniform tDiffuse as follows:
// export var uniforms:object = {
//   tDiffuse: {type: 't', value: null}
// };
// Then in the ith ShaderMaterial the texture corresponding to textures[i] url
// will be mapped to the uniform 'tDiffuse' and all will be well!
// !!!!!!!!!!
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'multishader_sphere':{ 
//          factory:'MultiShader',
//          url:'./app/models/stage/actors/objects/multishader',
//          options:{
//                geometry:'quad'|'sphere',  // default 'quad'  
//                width:10,   // iff 'quad'
//                height:10,
//                radius:5.0,  // iff 'sphere'
//                widthSegments: 1,    // default=1 quad, default=32 sphere
//                heightSegments: 1,  // default=1 quad, default=32 sphere 
//                  //three arrays below should have two shaders(vsh,fsh) xor
//                  // one texture per array-element
//                  //i.e two shaders to create a ShaderMaterial (no uniforms)
//                  // xor one texture to create a MeshBasicMaterial
//                material:['basic'|'shader',..], //shader can still use texture
//                  // via the fsh uniform tDiffuse wich is assigned texture
//                  // NOTE: No matter what the material 'shader' or 'basic', a
//                  // vaild shader url be present in every array position(!)
//                vshaders:[url|''  ...]  //i.e string[]
//                fshaders:[url|'',  ...]  //i.e string[]
//                textures:[url|'',  ...]  //i.e string[]
//                //NOTE: color, opacity etc. are handled in the fsh
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



// class Multishader - Factory
export const Multishader:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{

    const geometry = <string>options['geometry'] || 'quad',  // defining option
        // other options (superset of geometry cases)
        width = <number>options['width'] || 1.0,
        height = <number>options['height'] || 1.0,
        radius = <number>options['radius'] || 1.0,
        quad_widthSegments = <number>options['widthSegments'] || 1,  
        quad_heightSegments = <number>options['heightSegments'] || 1,  
        sphere_widthSegments = <number>options['widthSegments'] || 32,  
        sphere_heightSegments = <number>options['heightSegments'] || 32,
        // read notes above
        material = <string[]>options['material'] || [],
        vshaders = <string[]>options['vshaders'] || [], 
        fshaders = <string[]>options['fshaders'] || [],
        textures = <string[]>options['textures'] || [],
        loader = new THREE.TextureLoader(),
        transform = <Record<string,number[]>>options['transform'] || {};  // {} => no transform

    let multimat_g:THREE.Geometry,
        multimat_m:THREE.Material[],
        multimat:THREE.Mesh;
      

    return new Promise((resolve, reject) => {
      
      let maps,  // cannot be declared even 'any' or 'any[]' ?! 
          vsh,  // see 'just in case' commented section below
          fsh;


      async function load(){
        maps = await Promise.all(
          textures.map(url => <THREE.Texture>loader.load(<string>url) || '')
        ).catch((e) => {
          const err = `failure to load textures ${textures}:${e}`;
          console.error(err);
          reject(err);
        });

        // maps
        //console.log(`&&& multishader: maps = ${maps}`);
        //console.dir(maps);


        vsh = await Promise.all(
          vshaders.map(url => import(<string>url) || '')
        ).catch((e) => {
          const err = `failure to load vshaders ${vshaders}:${e}`;
          console.error(err);
          reject(err);
        });

        fsh = await Promise.all(
          fshaders.map(url => import(<string>url) || '')
        ).catch((e) => {
          const err = `failure to load fshaders ${fshaders}:${e}`;
          console.error(err);
          reject(err);
        });



        // NOTE: execution within load() will wait for all textures, vshaders
        // and fshaders to load, before the switch below executes, i.e all
        // maps, vsh and fsh will be loaded when switch etc.,... is executed
        let e:string;
        switch(geometry) {
          case 'quad':
            multimat_g = new THREE.PlaneBufferGeometry(width, height,
              quad_widthSegments, quad_heightSegments);
            break;
  
          case 'sphere':
            multimat_g = new THREE.SphereBufferGeometry(radius,
              sphere_widthSegments, sphere_heightSegments);
            break;
  
          default:
            e = `unrecognized geometry = ${geometry}`;
            console.error(e);
            reject(e);
        }
  
        // prepare layers
        multimat_g.clearGroups();
  
        // create multishader multimat_m and layered geometry multimat_g
        // NOTE: exp of creation of array a: k=4 => a = [0,1,2,3]
        const k = Math.min(vsh.length, fsh.length),
              a = [...Array(k).keys()];
        let m:THREE.Material;

        //console.log(`multishader: &&& k=${k}`);
        //console.log(`multishader: &&& a=${a}`);
     
        if(k > 0){
          for(const i in a){
            //diagnostics
//            console.log(`vsh[${i}]['vsh'] = ${vsh[i]['vsh']}`);
//            console.log(`fsh[${i}]['fsh'] = ${fsh[i]['fsh']}`);
//            console.log(`fsh[${i}]['uniforms'] = ${fsh[i]['uniforms']}`);
//            console.dir(fsh[i]['uniforms']);
//            console.log(`maps[${i}] = ${maps[i]}:`);
//            console.dir(maps[i]);


            // add layer to BufferGeometry multimat_g
            multimat_g.addGroup(0, 5192, i);


            // create and add ShaderMaterial OR MeshBasicMaterial
            //console.log(`multishader: &&& material[${i}] = ${material[i]}:`);
            if(material[i] === 'shader'){  //shader material (possibly texture)
              m = new THREE.ShaderMaterial({
                vertexShader: vsh[i]['vsh'],
                uniforms: fsh[i]['uniforms'], 
                fragmentShader: fsh[i]['fsh'],
                transparent:true,
                side:THREE.DoubleSide,
              });

              // if textures[i], set uniform tDiffuse to maps[i] texture map
              // send texture map to m uniform tDiffuse 
              setTimeout(() => {
              if(textures[i]){
                m.uniforms.tDiffuse.value = maps[i];
                m.uniforms.tDiffuse.needsUpdate = true;
              }
              }, 3000);

              //console.log(`created material ${m} using vsh=${vsh} and fsh=${fsh}`); 

            }else{          // meshbasic texture-material
              m = new THREE.MeshBasicMaterial({
                map: maps[i],
                transparent:true,
                opacity:0.5,
                side:THREE.DoubleSide
              });
              //console.log(`created material ${m} using texture ${maps[i]}`); 
            }

            //console.log(`adding material ${m} to multimat_m`); 
            //console.dir(m);
            multimat_m.push(m);
          }
        }else{   // no shaders ! use simple default non-textured material
          console.error(`multishader: &&&!!!  no shader entries for all indices - creating white material`);
          multimat_m.push( new THREE.MeshBasicMaterial({color:'white',
            transparent:true, opacity:0.5, side:THREE.DoubleSide,
          })); 
        }


        // create multishader mesh
        multimat = new THREE.Mesh(multimat_g, multimat_m);


        // transform
        if(Object.keys(transform).length > 0){
          transform3d.apply(transform, multimat);
        }
    
        // ACTOR.INTERFACE method
        // delta method for modifying properties - only transform can be applied
        multimat['delta'] = (options:Record<string,unknown>={}) => {
          const transform = options['transform'];

          // transform
          if(Object.keys(<Record<string,number[]>>transform).length > 0){
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

};//MultiShader;
