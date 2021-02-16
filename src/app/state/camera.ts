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
    sgcsphere:THREE.Mesh,
    vrcsphere:THREE.Mesh;



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


  // l = state['sg'|'vr']['lens']  - return rl = result['sg'|'vr']['lens']
  create_lens(l:Record<string,unknown>, scene:THREE.Scene):THREE.Camera{
    console.log('\n\ncamera.create_lens');
    let lens:THREE.Camera;

    // lens 
    // NOTE: l['_lens'] is only true or undefined (create or modify)
    if(l && Object.keys(l).length > 0){
      if(l['_lens']){   //t=>create
        const aspect = window.innerWidth/window.innerHeight,
              fov = l['fov'] || 90,
              near = l['near'] || .001,
              far = l['far'] || 10000;

        //console.log(`fov = ${fov}`);
        //console.log(`aspect = ${aspect}`);
        //console.log(`near = ${near}`);
        //console.log(`far = ${far}`);
        lens = new THREE.PerspectiveCamera(fov, aspect, near, far);
      }else{      // undefined=>modify
        console.log(`camera: modifying lens - NOT YET IMPLEMENTED`);
      }

      // transform camera position and/or orientation
      const transform = <Record<string,number[]>>l['transform'];
      if(transform){
        console.log(`applying transform to lens`);
        transform3d.apply(transform, lens);
      }

      return lens;
    }//l

  }//create_lens


  create_fog(fs:Record<string,unknown>, scene:THREE.Scene):void{
    console.log('camera.create_fog');
  }//create_fog

  create_controls(cs:Record<string,unknown>, scene:THREE.Scene):void{
    console.log('camera.create_controls');
  }//create_controls

  create_csphere(ss:Record<string,unknown>, scene:THREE.Scene):void{
    console.log('camera.create_csphere');
  }//create_csphere



  // create objects specified in arg camera-state === state['camera']
  // returns new Promise<Record<string,unknown>>((resolve, reject) => {});
  delta(state:Record<string,unknown>, scenes:Record<string,THREE.Scene>):
    Promise<Record<string,unknown>>{
      console.log(`\n\n\n@@ camera.delta(state, scenes) state:`);
      console.dir(state);

      // camera-created objects passed to narrative in result_ Object
      const result_:Record<string,unknown> = {'sg':{}, 'vr':{}};

      // canvas needed to create controls
      const canvas = document.getElementsByTagName("canvas")[0];
      //console.log(`\n@@ camera.delta canvas = ${canvas}`)


    return new Promise((resolve, reject) => {

      // process state
      // sg
      if(state['sg'] && Object.keys(<Record<string,unknown>>state['sg']).length > 0){
        console.log(`state['sg'] is non-empty`);

        // lens
        const sgl = <Record<string,unknown>>(<Record<string,unknown>>state['sg'])['lens'];
        if(sgl){
          const lens:THREE.Camera = camera.create_lens(sgl, scenes['sgscene']);
          if(lens){
            (<Record<string,unknown>>result_['vr'])['lens'] = <THREE.Camera>lens;
            sglens = <THREE.Camera>lens;
          }
        }
      }else{
        console.log(`state['sg'] is undefined or empty`);
      }


      // vr
      if(state['vr'] && Object.keys(<Record<string,unknown>>state['vr']).length > 0){
        console.log(`state['vr'] is non-empty`);

        // lens
        const vrl = <Record<string,unknown>>(<Record<string,unknown>>state['vr'])['lens'];
        if(vrl){
          const lens:THREE.Camera = camera.create_lens(vrl, scenes['vrscene']);
          if(lens){
            (<Record<string,unknown>>result_['vr'])['lens'] = <THREE.Camera>lens;
            vrlens = <THREE.Camera>result_['lens'];
          }
        }
        console.log(`after camera.create_lens result_ is:`);
        console.dir(result_);


//        // fog
//        const vr_f = <Record<string,unknown>>(<Record<string,unknown>>state['vr'])['fog'];
//        console.log(`\n\nfog:  vr_f = state['vr']['fog']:`);
//        console.dir(vr_f);
//        console.log(`typreof vr_f = ${typeof vr_f}`);
//
//        if(vr_f && Object.keys(vr_f).length > 0){
//          const _fog = <boolean>vr_f['_fog'], 
//                color = <string>vr_f['color'] || 'white',
//                near = <number>vr_f['near'] || .01,
//                far = <number>vr_f['far'] || 1000;
//
//          if(_fog){     //t=>create
//            scenes['vrscene'].fog = new THREE.Fog(color, near, far);
//          }else{
//            if(_fog === false){   //f=>delete
//              scenes['vrscene'].fog = undefined;
//            }else{   //undefined=>modify
//              if(color){scenes['vrscene'].fog.color = color;}
//              if(near){scenes['vrscene'].fog.near = near;}
//              if(far){scenes['vrscene'].fog.far = far;}
//            }
//          }
//          o_vr['_fog'] = _fog;
//        }

        // controls
//        if(state['controls'] && Object.keys(<string>state['controls']).length > 0){
//          o['_controls'] = (<string>state['controls'])['_controls'] || false;
//          o['controls'] = (<string>state['controls'])['controls'];
//        }else{
//          o['_controls'] = false;
//        }
        console.log(`state['vr'] is non-trivial - resolve(result)`);
        resolve(result_);               //promise fulfilled

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
