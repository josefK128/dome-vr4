// actors/cloud/pointcloud.ts 
// Actor is a Factory interface - so Pointcloud 'creates' instances using the
// options Record<string,unknown> as variations, i.e. Pointcloud is a factory and NOT a singleton
//
// Pointcloud implements ActorFactory interface:
// export interface ActorFactory {
//   create(Record<string,unknown>):Promise<Actor>;   //static=> Pointcloud.create(options)
// Pointcloud instances implement Actor interface:
// export interface Actor {
//   delta(Record<string,unknown>):void;   
//
//
// declarative specification in context of stage:actorsRecord<string,unknown>:
// NOTE: urls are relative to app/scenes directory
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'pointcloud':{ 
//          factory:'Pointcloud',
//          url:'./app/models/stage/actors/cloud/pointcloud',
//          options:{
//            *color:string,       //default='red'
//             pointsize:number,  //default=2.0
//             radius:number,    //default=100
//             rotation_speed:number,  //default=.005
//            *transform:Record<string,unknown> //exp {t:[0.0,0.0,-200.0]}
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';
import {vsh} from '../../shaders/webgl1/quad_vsh/vsh_pointcloud2.glsl.js';
import {fsh} from '../../shaders/webgl1/quad_fsh/fsh_pointcloud2.glsl.js';
import {uniforms} from '../../shaders/webgl1/quad_fsh/fsh_pointcloud2.glsl.js';



// closure vars and default values
let pcloud:THREE.Points; 


export const Pointcloud:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{
    //console.log(`\n\n$$$ pointcloud: o['radius'] = ${options['radius']}`);

    const pointsize = <number>options['pointsize'] || 2.0,
          radius = <number>options['radius'] || 100,
          rotation_speed = options['rotation_speed'] || .005,
          pcloud_g = new THREE.SphereBufferGeometry(radius,160,80),
          pcloud_m = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vsh,
            fragmentShader: fsh,
            transparent: true
          }),
          nvertices:number = pcloud_g.attributes.position.count,
          alphas = new Float32Array(nvertices * 1),
          psizes = new Float32Array(nvertices * 1);

    let color = <string>options['color'] || 'red',
        transform = options['transform'];


    //create pointcloud
    pcloud = new THREE.Points(pcloud_g, pcloud_m);

    //initialize alphas - add attribute 'alpha' to pcloud_g
    for(let i=0; i<nvertices; i++){
      alphas[i] = Math.random();
      psizes[i] = pointsize;  //pointsize*Math.random();
    }
    //setAtrribute NOT addAttribute - set alpha
    pcloud_g.setAttribute('alpha', new THREE.BufferAttribute(alphas,1));

    //set pointsize
    pcloud_g.setAttribute('pointsize', new THREE.BufferAttribute(psizes,1));


    //diagnostics
    //console.log(`$$$ pointcloud: pcloud_m['uniforms']:`);
    //console.dir(uniforms);
    //set color
    (<Record<string,unknown>>uniforms['uColor'])['value'] = new THREE.Color(color);
    (<Record<string,unknown>>uniforms['uColor'])['needsUpdate'] = true;



    return new Promise((resolve, reject) => {

      pcloud['delta'] = (options:Record<string,unknown>):void => {
        color = <string>options['color'];
        transform = options['transform'];

        //set color
        if(color){
          (<Record<string,unknown>>uniforms['uColor'])['value'] = new THREE.Color(color);
          (<Record<string,unknown>>uniforms['uColor'])['needsUpdate'] = true;
        }
        if(transform){
          transform3d.apply(transform, pcloud);
        }
      };


      pcloud['animate'] = (et:number):void => {
        const alphas = pcloud_g['attributes']['alpha'],
              count = alphas['count'];

        for(let i = 0; i < count; i++ ) {
          // dynamically change alphas
          alphas.array[i] *= 0.95;
          if(alphas.array[i] < 0.01){ 
            alphas.array[i] = Math.random(); //1.0;
          }
        }
        alphas.needsUpdate = true; // important!
        pcloud.rotation.x += rotation_speed;
        pcloud.rotation.y += rotation_speed;
      };


      //transform
      if(transform){
        transform3d.apply(transform, pcloud);
      }

      resolve(pcloud);

    });//return new Promise

  }//create()

};//Pointcloud
