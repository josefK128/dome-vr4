// camera.ts 

// NOTE! - class OrbitControls has syntax problems, and in any case should
// be replaced by a VR-capable 'vrcontrols' built from OrbitControls
//var controls = new THREE.OrbitControls( camera );
//import {OrbitControls} from '../models/camera/controls/OrbitControls';
import {Cast} from '../cast.interface';
import {transform3d} from '../services/transform3d.js';
import {Controls} from '../models/camera/controls/Controls.interface';


// singleton closure-instance variable
let camera:Camera;



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
  create_lens(l:Record<string,unknown>, scene:THREE.Scene, lens:THREE.PerspectiveCamera):THREE.PerspectiveCamera{
    console.log(`camera.create_lens(l,scene,lens)`);
    console.log(`l =`);
    console.dir(l);
    console.log(`initially lens = ${lens}:`);
    console.dir(lens);

    // lens 
    // NOTE: l['_lens'] is only true or undefined (create or modify)
    if(l && Object.keys(l).length > 0){
      console.log(`l['_lens'] = ${l['_lens']}`);
      if(l['_lens']){   //t=>create
        //console.log(`\ncamera.create_lens(): creating lens`);
        const aspect = window.innerWidth/window.innerHeight,
              fov = l['fov'] || 90,
              near = l['near'] || .01,
              far = l['far'] || 10000;

        // create lens
        console.log(`fov=${fov} aspect=${aspect} near=${near} far=${far}`);
        lens = new THREE.PerspectiveCamera(fov, aspect, near, far);
        console.log(`camera.create_lens(): created lens = ${lens}:`);
        console.dir(lens);

        if(l['transform']){transform3d.apply(l['transform'], lens); }

      }else{      //undefined=>modify
        //console.log(`\ncamera.create_lens(): modifying lens`);
        if(lens){
          if(l['fov']){lens.fov = l['fov'];}
          if(l['near']){lens.near = l['near'];}
          if(l['far']){lens.far = l['far'];}
          if(l['transform']){transform3d.apply(l['transform'],lens);}
        }
      }
    }//l
    return(lens);

  }//create_lens


  // l = state['sg'|'vr']['fog']  - no return
  create_fog(f:Record<string,unknown>, scene:THREE.Scene):void{
    console.log(`camera.create_fog(f,scene)`);

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


  create_controls(cs:Record<string,unknown>, scene:THREE.Scene, controls:Record<string,unknown>):Record<string,unknown>{
    console.log('camera.create_controls(cs,scene,controls)');
    //controls = controls;
    return controls;
  }//create_controls


  create_csphere(ss:Record<string,unknown>, scene:THREE.Scene, csphere:THREE.Mesh):THREE.Mesh{
    console.log('camera.create_csphere(ss,scene,csphere)');
    //csphere = csphere;
    return csphere;
  }//create_csphere



  // create objects specified in arg camera-state === state['camera']
  // returns new Promise<Record<string,unknown>>((resolve, reject) => {});
  delta(state:Record<string,unknown>, narrative:Cast):Promise<number>{
    console.log(`\n@@ camera.delta(state, scenes) state:`);
    console.dir(state);


    return new Promise((resolve, reject) => {

      // process state
      // sg
      console.log(`camera.delta: sg`);
      const state_sg = <Record<string,unknown>>state['sg'];
      if(state_sg && Object.keys(state_sg).length > 0){
        const scene = narrative['sg']['scene'];
        console.log(`camera.delta: sgscene = ${scene}`);
        console.dir(scene);

        // lens
        const sgl = <Record<string,unknown>>state_sg['lens'];
        console.log(`sgl = ${sgl}`);
        console.dir(sgl);
        if(sgl){
          narrative['sg']['lens'] = camera.create_lens(sgl, scene, narrative['sg']['lens']);
          console.log(`after camera.create_lens sglens is:`);
          console.dir(narrative['sg']['lens']);
        }


        // fog
        const sgf = <Record<string,unknown>>(state_sg['fog']);
        //console.dir(sgf);
        if(sgf && Object.keys(sgf).length > 0){
          camera.create_fog(sgf, scene); 
        }else{
          //console.log(`state['sg']['fog'] is undefined or empty`);
        }


        // controls
        const sgc = <Record<string,unknown>>(state_sg['controls']);
        //console.dir(sgc);
        if(sgc && Object.keys(sgc).length > 0){
          narrative['sg']['controls'] = camera.create_controls(sgc, scene, narrative['sg']['controls']);
        }else{
          //console.log(`state['sg']['controls'] is undefined or empty`);
        }


        // csphere
        const sgs = <Record<string,unknown>>(state_sg['csphere']);
        //console.dir(sgs);
        if(sgs && Object.keys(sgs).length > 0){
          narrative['sg']['csphere'] = camera.create_csphere(sgs, scene, narrative['sg']['csphere']);
        }else{
          //console.log(`state['sg']['csphere'] is undefined or empty`);
        }

      }else{
        console.log(`state['sg'] is undefined or empty`);
      }


      // vr
      console.log(`camera.delta: vr`);
      const state_vr = <Record<string,unknown>>state['vr'];
      if(state_vr && Object.keys(state_vr).length > 0){
        const scene = narrative['vr']['scene'];
        console.log(`camera.delta: vrscene = ${scene}`);
        console.dir(scene);

        // lens
        const vrl = <Record<string,unknown>>state_vr['lens'];
        console.log(`vrl = ${vrl}`);
        console.dir(vrl);
        if(vrl){
          narrative['vr']['lens'] = camera.create_lens(vrl, scene, narrative['vr']['lens']);
          console.log(`after camera.create_lens vrlens is:`);
          console.dir(narrative['vr']['lens']);
        }


        // fog
        const vrf = <Record<string,unknown>>(state_vr['fog']);
        //console.dir(vrf);
        if(vrf && Object.keys(vrf).length > 0){
          camera.create_fog(vrf, scene); 
        }else{
          //console.log(`state['vr']['fog'] is undefined or empty`);
        }


        // controls
        const vrc = <Record<string,unknown>>(state_vr['controls']);
        //console.dir(vrc);
        if(vrc && Object.keys(vrc).length > 0){
          narrative['vr']['controls'] = camera.create_controls(vrc, scene, narrative['vr']['controls']);
        }else{
          //console.log(`state['vr']['controls'] is undefined or empty`);
        }


        // csphere
        const vrs = <Record<string,unknown>>(state_vr['csphere']);
        //console.dir(vrs);
        if(vrs && Object.keys(vrs).length > 0){
          narrative['vr']['csphere'] = camera.create_csphere(vrs, scene, narrative['vr']['csphere']);
        }else{
          //console.log(`state['vr']['csphere'] is undefined or empty`);
        }

        resolve(narrative['devclock'].getElapsedTime());

      }else{
        console.log(`state['vr'] is undefined or empty - resolve possible sg`);
        resolve(narrative['devclock'].getElapsedTime());
      }
    });

  }//camera.delta

}//Camera


Camera.create();
export {camera};
