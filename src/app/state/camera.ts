// camera.ts 

// NOTE! - class OrbitControls has syntax problems, and in any case should
// be replaced by a VR-capable 'vrcontrols' built from OrbitControls
//var controls = new THREE.OrbitControls( camera );
//import {OrbitControls} from '../models/camera/controls/OrbitControls';
import {transform3d} from '../services/transform3d.js';
import {Controls} from '../models/camera/controls/Controls.interface';


// singleton closure-instance variable
let camera:Camera,
    sglens_:THREE.PerspectiveCamera,
    vrlens_:THREE.PerspectiveCamera,
    sgcontrols_:Record<string,unknown>,
    vrcontrols_:Record<string,unknown>,
    sgcsphere_:Record<string,unknown>,
    vrcsphere_:Record<string,unknown>;


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


  // l = state['sg'|'vr']['lens']  - return THREE.PerspectiveCamera if created
  create_lens(l:Record<string,unknown>, scene:THREE.Scene, lens_:THREE.PerspectiveCamera):THREE.PerspectiveCamera{

    // lens 
    // NOTE: l['_lens'] is only true or undefined (create or modify)
    if(l && Object.keys(l).length > 0){
      if(l['_lens']){   //t=>create
        //console.log(`\ncamera.create_lens(): creating lens`);
        const aspect = window.innerWidth/window.innerHeight,
              fov = l['fov'] || 90,
              near = l['near'] || .01,
              far = l['far'] || 10000,
              lens = new THREE.PerspectiveCamera(fov, aspect, near, far);

        if(l['transform']){transform3d.apply(l['transform'],lens);}
        //console.log(`camera.create_lens(): created lens = ${lens}:`);
        //console.dir(lens);

        // keep closure ref to lens
        lens_ = lens;
        //console.log(`camera.create_lens(): (sglens/vrlens) lens_ = ${lens_}`);

        // attach lens to scene for reference elsewhere
        scene['lens'] = lens;
        //console.log(`camera.create_lens(): scene['lens'] = ${scene['lens']}`);

        return lens;

      }else{      //undefined=>modify
        //console.log(`\ncamera.create_lens(): modifying lens`);
        if(lens_){
          if(l['fov']){lens_.fov = l['fov'];}
          if(l['near']){lens_.near = l['near'];}
          if(l['far']){lens_.far = l['far'];}
          if(l['transform']){transform3d.apply(l['transform'],lens_);}
        }
      }
    }//l

  }//create_lens


  // l = state['sg'|'vr']['fog']  - no return
  create_fog(f:Record<string,unknown>, scene:THREE.Scene):void{

    if(f && Object.keys(f).length > 0){
      const _fog = f['_fog'];  //_fog is boolean - inferred 

      if(_fog){     //t=>create
        //console.log('\ncamera.create_fog() - creating scene.fog');
        const color = f['color'] || 'white',
              near = f['near'] || .01,
              far = f['far'] || 1000;
        scene.fog = new THREE.Fog(color, near, far);
      }else{
        if(_fog === false){     //f=>delete
          //console.log('\ncamera.create_fog() - deleting scene.fog');
          scene.fog = undefined;
        }else{             //undefined=>modify
          //console.log('\ncamera.create_fog() - modifying scene.fog');
          if(f['color']){scene.fog.color = f['color'];}
          if(f['near']){scene.fog.near = f['near'];}
          if(f['far']){scene.fog.far = f['far'];}
        }
      }
    }//f

  }//create_fog


  create_controls(cs:Record<string,unknown>, scene:THREE.Scene, canvas_:THREE.CanvasElement, controls_:Record<string,unknown>):void{
    console.log('camera.create_controls');
    //controls_ = controls;
  }//create_controls


  create_csphere(ss:Record<string,unknown>, scene:THREE.Scene, csphere_:Record<string,unknown>):void{
    console.log('camera.create_csphere');
    //csphere = csphere;
  }//create_csphere



  // create objects specified in arg camera-state === state['camera']
  // returns new Promise<Record<string,unknown>>((resolve, reject) => {});
  delta(state:Record<string,unknown>, scenes:Record<string,THREE.Scene>):
    Promise<Record<string,unknown>>{
      console.log(`\n@@ camera.delta(state, scenes) state:`);
      console.dir(state);

      // camera-created objects passed to narrative in result_ Object
      const result_:Record<string,unknown> = {'sg':{}, 'vr':{}};

      // canvas needed to create controls
      const canvas = document.getElementsByTagName("canvas")[0];
      //console.log(`\n@@ camera.delta canvas = ${canvas}`)


    return new Promise((resolve, reject) => {

      // process state
      // sg
      const state_sg = <Record<string,unknown>>state['sg'];
      if(state_sg && Object.keys(state_sg).length > 0){

        // lens
        const sgl = <Record<string,unknown>>state_sg['lens'];
        //console.dir(sgl);
        if(sgl){
          const lens = camera.create_lens(sgl, scenes['sgscene'], sglens_);
          if(lens){
            (<Record<string,unknown>>result_['sg'])['lens'] = lens;
            sglens_ = lens;
            //console.log(`after camera.create_lens sglens is:`);
            //console.dir(sglens);
          }
        }


        // fog
        const sgf = <Record<string,unknown>>(state_sg['fog']);
        //console.dir(sgf);
        if(sgf && Object.keys(sgf).length > 0){
          camera.create_fog(sgf, scenes['sgscene']); 
        }else{
          //console.log(`state['sg']['fog'] is undefined or empty`);
        }


        // controls
        const sgc = <Record<string,unknown>>(state_sg['controls']);
        //console.dir(sgc);
        if(sgc && Object.keys(sgc).length > 0){
          camera.create_controls(sgc, scenes, canvas, sgcontrols_);
        }else{
          //console.log(`state['sg']['controls'] is undefined or empty`);
        }


        // csphere
        const sgs = <Record<string,unknown>>(state_sg['csphere']);
        //console.dir(sgs);
        if(sgs && Object.keys(sgs).length > 0){
          camera.create_csphere(sgs, scenes, sgcsphere_);
        }else{
          //console.log(`state['sg']['csphere'] is undefined or empty`);
        }

      }else{
        console.log(`state['sg'] is undefined or empty`);
      }


      // vr
      const state_vr = <Record<string,unknown>>state['vr'];
      if(state_vr && Object.keys(state_vr).length > 0){

        // lens
        const vrl = <Record<string,unknown>>state_vr['lens'];
        //console.dir(vrl);
        if(vrl){
          const lens = camera.create_lens(vrl, scenes['vrscene'], vrlens_);
          if(lens){
            (<Record<string,unknown>>result_['vr'])['lens'] = lens;
            vrlens_ = lens;
            //console.log(`after camera.create_lens vrlens is:`);
            //console.dir(vrlens);
          }
        }


        // fog
        const vrf = <Record<string,unknown>>(state_vr['fog']);
        //console.diyyr(vrf);
        if(vrf && Object.keys(vrf).length > 0){
          camera.create_fog(vrf, scenes['vrscene']); 
        }else{
          console.log(`state['vr']['fog'] is undefined or empty`);
        }


        // controls
        const vrc = <Record<string,unknown>>(state_vr['controls']);
        //console.dir(vrc);
        if(vrc && Object.keys(vrc).length > 0){
          camera.create_controls(vrc, scenes, canvas, vrcontrols_);
        }else{
          //console.log(`state['vr']['controls'] is undefined or empty`);
        }


        // csphere
        const vrs = <Record<string,unknown>>(state_vr['csphere']);
        //console.dir(vrs);
        if(vrs && Object.keys(vrs).length > 0){
          camera.create_csphere(vrs, scenes, vrcsphere_);
        }else{
          //console.log(`state['vr']['csphere'] is undefined or empty`);
        }

        resolve(result_);               //promise fulfilled

      }else{
        console.log(`state['vr'] is undefined or empty - resolve possible sg`);
        resolve(result_);  // don't reject because ruins Promise.all
        //reject(new Error(`camera: malformed state:${state}`));//reject promise
      }
    });

  }//camera.delta

}//Camera


Camera.create();
export {camera};
