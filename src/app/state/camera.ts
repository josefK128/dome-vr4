// camera.ts 

// NOTE! - class OrbitControls has syntax pronlems, and in any case should
// be replaced by a VR-capable 'vrcontrols' built from OrbitControls
//var controls = new THREE.OrbitControls( camera );
//import {OrbitControls} from '../models/camera/controls/OrbitControls';
import {transform3d} from '../services/transform3d.js';
import {Controls} from '../models/camera/controls/Controls.interface';


// singleton closure-instance variable
let camera:Camera,
    sglens:THREE.PerspectiveCamera,
    vrlens:THREE.PerspectiveCamera,
    sgcontrols:THREE.OrbitContols,
    vrcontrols:THREE.OrbitContols,
    csphere:THREE.Mesh,
    transform:Record<string,number[]>;

class Camera {

  // ctor
  private constructor(){
    camera = this;
  } //ctor

  static create(){
    if(camera === undefined){
      camera = new Camera();
    }
  }


  // create objects specified in arg camera-state === state['camera']
  // returns new Promise<Record<string,unknown>>((resolve, reject) => {});
  delta(state:Record<string,unknown>, scenes:Record<string,THREE.Scene>):
    Promise<Record<string,unknown>>{
      console.log(`\n@@ camera.delta(state, scenes) state:`);
      console.dir(state);

      // canvas needed to create controls
      const canvas = document.getElementsByTagName("canvas")[0];
      console.log(`\n@@ camera.delta canavs = ${canvas}`);


    return new Promise((resolve, reject) => {
      const result:Record<string,unknown> = {'camera':{'sg':{}, 'vr':{}}},
            o = <Record<string,unknown>>result['camera'],
            o_sg = <Record<string,unknown>>o['sg'],
            o_vr = <Record<string,unknown>>o['vr'];


      // process state
      // sg
      if(state['sg'] && Object.keys(<Record<string,unknown>>state['sg']).length > 0){
        console.log(`state['sg']:`);
        console.dir(state['sg']);
      }else{
        console.log(`state['sg'] is undefined or empty`);
      }


      // vr
      if(state['vr'] && Object.keys(<Record<string,unknown>>state['vr']).length > 0){
        console.log(`state['vr']:`);
        console.dir(state['vr']);
        const vr_l = <Record<string,unknown>>(<Record<string,unknown>>state['vr'])['lens'];
        console.log(`vr_l = state['vr']['lens']:`);
        console.dir(vr_l);

        // lens 
        if(vr_l && Object.keys(vr_l).length > 0){
          const _lens = <boolean>vr_l['_lens'];
          if(_lens){   //t=>create
            console.log(`camera: creating vrlens`);
            const aspect = window.innerWidth/window.innerHeight,
                  fov = vr_l['fov'] || 90,
                  near = vr_l['near'] || .001,
                  far = vr_l['far'] || 10000;

            //console.log(`fov = ${fov}`);
            //console.log(`aspect = ${aspect}`);
            //console.log(`near = ${near}`);
            //console.log(`far = ${far}`);
            vrlens = new THREE.PerspectiveCamera(fov, aspect, near, far);
            o_vr['_lens'] = true;
            o_vr['lens'] = vrlens;
            console.log(`o_vr['_lens'] = ${o_vr['_lens']}`);
            console.log(`o_vr['lens']:`);
            console.dir(o_vr['lens']);
          }else{      // modify
            console.log(`camera: modifying lens`);
          }

          // transform camera position and/or orientation
          transform = <Record<string,number[]>>vr_l['transform'];
          if(transform){
            console.log(`applying transform ${transform} to vrlens`);
            transform3d.apply(transform, vrlens);
          }
        }//lens

        // fog
        const vr_f = <Record<string,unknown>>(<Record<string,unknown>>state['vr'])['fog'];
        console.log(`vr_f = state['vr']['fog']:`);
        console.dir(vr_f);
        if(vr_f && Object.keys(vr_f).length > 0){
          const _fog = <boolean>vr_f['_fog'], 
                color = <string>vr_f['color'] || 'white',
                near = <number>vr_f['near'] || .01,
                far = <number>vr_f['far'] || 1000;

          if(_fog){     //t=>create
            scenes['vrscene'].fog = new THREE.Fog(color, near, far);
          }else{
            if(_fog === false){   //f=>delete
              scenes['vrscene'].fog = undefined;
            }else{   //undefined=>modify
              if(color){scenes['vrscene'].fog.color = color;}
              if(near){scenes['vrscene'].fog.near = near;}
              if(far){scenes['vrscene'].fog.far = far;}
            }
          }
          o_vr['_fog'] = _fog;
        }

        // controls
//        if(state['controls'] && Object.keys(<string>state['controls']).length > 0){
//          o['_controls'] = (<string>state['controls'])['_controls'] || false;
//          o['controls'] = (<string>state['controls'])['controls'];
//        }else{
//          o['_controls'] = false;
//        }
        console.log(`state['vr'] is non-trivial - resolve(result)`);
        resolve(result);               //promise fulfilled

      }else{
        console.log(`state['vr'] is undefined or empty - resolve({})`);
        resolve({});  // don't reject because ruins Promise.all
        //reject(new Error(`camera: malformed state:${state}`));//reject promise
      }
    });
  }
}//Camera


Camera.create();
export {camera};
