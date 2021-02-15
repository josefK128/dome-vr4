// camera.ts 

// NOTE! - class OrbitControls has syntax pronlems, and in any case should
// be replaced by a VR-capable 'vrcontrols' built from OrbitControls
//var controls = new THREE.OrbitControls( camera );
//import {OrbitControls} from '../models/camera/controls/OrbitControls';
import {transform3d} from '../services/transform3d.js';
import {Controls} from '../models/camera/controls/Controls.interface';


// singleton closure-instance variable
let camera:Camera,
    lens:THREE.PerspectiveCamera,
    controls:THREE.OrbitContols,
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


  // new Promise<Record<string,unknown>>((resolve, reject) => {});
  delta(state:Record<string,unknown>):Promise<Record<string,unknown>>{
    console.log(`\nstate/camera.delta state:`);
    console.dir(state);

    return new Promise((resolve, reject) => {
      const result:Record<string,unknown> = {'camera':{}},
            o = <Record<string,unknown>>result['camera'];

      // process state
      if(state && Object.keys(state).length > 0){

        // lens - _lens:t|f - os contain 'lens':lens or nothing(undefined)
        if(state['lens'] && Object.keys(<THREE.Camera>state['lens']).length > 0){
          const l = <Record<string,unknown>>state['lens'],
                _lens = <boolean>l['_lens'];
          if(_lens){  // create
            console.log(`camera: creating lens`);
            const aspect = window.innerWidth/window.innerHeight,
                  fov = l['fov'] || 90,
                  near = l['near'] || .001,
                  far = l['far'] || 10000;

            //console.log(`fov = ${fov}`);
            //console.log(`aspect = ${aspect}`);
            //console.log(`near = ${near}`);
            //console.log(`far = ${far}`);
            lens = new THREE.PerspectiveCamera(fov, aspect, near, far);

            o['_lens'] = true;
            o['lens'] = lens;
          }else{      // modify
            console.log(`camera: modifying lens`);
            lens['fov'] = l['fov'] || lens['fov'];
            lens['near'] = l['near'] || lens['near'];
            lens['far'] = l['far'] || lens['far'];
          }

          // transform camera position and/or orientation
          transform = <Record<string,number[]>>l['transform'];
          if(transform){
            transform3d.apply(transform, lens);
          }
        }//lens


        // controls
        // return state - controls now created in narrative since canvas needed
        if(state['controls'] && Object.keys(<string>state['controls']).length > 0){
          o['_controls'] = (<string>state['controls'])['_controls'] || false;
          o['controls'] = (<string>state['controls'])['controls'];
        }else{
          o['_controls'] = false;
        }

        resolve(result);               //promise fulfilled
      }else{
        resolve({});  // don't reject because ruins Promise.all
        //reject(new Error(`camera: malformed state:${state}`));//reject promise
      }
    });
  }
}//Camera


Camera.create();
export {camera};
