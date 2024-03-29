// camera.ts 


import {Cast} from '../cast.interface';
import {transform3d} from '../services/transform3d.js';
import {Controls} from '../models/camera/controls/controls.interface';
import {Keymap} from '../models/camera/keymaps/keymap.interface';
//import {sgcontrols} from '../models/camera/controls/sgcontrols.js';
//import {sgkeymap} from '../models/camera/keymaps/sgkeymap.js';
import {vrcontrols} from '../models/camera/controls/vrcontrols.js';
import {vrkeymap} from '../models/camera/keymaps/vrkeymap.js';


// singleton closure-instance variable
let camera:Camera,
    sglens:THREE.PerspectiveCamera,
    vrlens:THREE.PerspectiveCamera,
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


  // l = state['sg'|'vr']['lens']  - return THREE.PerspectiveCamera if created
  create_lens(l:Record<string,unknown>, scene:THREE.Scene, narrative:Cast, scenename:string):THREE.PerspectiveCamera{
    //console.log(`camera.create_lens(): creating lens camera component`);
    let lens:THREE.PerspectiveCamera;

    // lens 
    // NOTE: l['_lens'] is only true or undefined (create or modify)
    //console.log(`l['_lens'] = ${l['_lens']}`);
    if(l['_lens']){   //t=>create
      const aspect = window.innerWidth/window.innerHeight,
            fov = l['fov'] || 90,
            near = l['near'] || .01,
            far = l['far'] || 10000;

      // create lens
      lens = new THREE.PerspectiveCamera(fov, aspect, near, far);
      //console.log(`camera.create_lens(): created lens = ${lens}:`);
      //console.dir(lens);


      //transform lens - need to move lens from origin if OrbitControls effects
      //are to be seen
      //console.log(`l['transform'] = ${l['transform']}`);
      if(l['transform']){
        transform3d.apply(l['transform'], lens); 
        lens.updateWorldMatrix();  
      }

    }else{      //l['_lens'] undefined => modify lens

      //console.log(`\ncamera.create_lens(): modifying lens`);
      if(lens){
        if(l['fov']){lens.fov = l['fov'];}
        if(l['near']){lens.near = l['near'];}
        if(l['far']){lens.far = l['far'];}
        if(l['transform']){transform3d.apply(l['transform'],lens);}
      }
    }

    if(scenename === 'sg'){
      sglens = lens;
      narrative.addActor(scene, 'sglens', sglens);
    }else{
      vrlens = lens;
      narrative.addActor(scene, 'vrlens', vrlens);
    }

    return(lens);

  }//create_lens



  // l = state['sg'|'vr']['fog']  - no return
  create_fog(f:Record<string,unknown>, scene:THREE.Scene):void{
    console.log(`camera.create_fog(f,scene) camera component`);

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



  create_csphere(ss:Record<string,unknown>, scene:THREE.Scene, narrative:Cast, scenename:string):void{
    console.log('camera.create_csphere(ss,scene,csphere) camera component');

    let lens_:THREE.Perspectivecamera,
        key = <Record<string,unknown>>ss['key'] || {},
        fill = <Record<string,unknown>>ss['fill'] || {},
        back = <Record<string,unknown>>ss['back'] || {};

    if(scenename === 'vr'){
      lens_ = vrlens;
    }else{
      lens_ = sglens;
    }

    if(ss['key'] === undefined){ss['key'] = {};}
    if(ss['fill'] === undefined){ss['fill'] = {};}
    if(ss['back'] === undefined){ss['back'] = {};}

    const opacity:number = <number>ss['opacity'] || 1.0,
          color:string = <string>ss['color'] || 'green',
          key_color:string = <string>(key['color']) || 'white',
          key_intensity:number = <number>key['intensity'] || 1.0,
          key_distance:number = <number>key['distance'] || 0.0,
          key_position:number[] = <number[]>key['position'] || lens_.position,
          fill_color:string = <string>fill['color'],
          fill_intensity:number = <number>fill['intensity'] || 1.0,
          fill_distance:number = <number>fill['distance'] || 0.0,
          fill_position:number[] = <number[]>fill['position'] || lens_.position ,
          back_color:string = <string>back['color'],
          back_intensity:number = <number>back['intensity'],
          back_distance:number = <number>back['distance'],
          back_position:number[] = <number[]>back['position'] || lens_.position;

    let _visible = false,
        _wireframe = false,
        radius:number = <number>ss['radius'];

   
    if((ss['_visible'] !== undefined) && (ss['_visible'] !== false)){
      _visible = <boolean>ss['_visible'];
    }
    if((ss['_wireframe'] !== undefined) && (ss['_wireframe'] !== false)){
      _wireframe = <boolean>ss['_wireframe'];
    }
    if(radius === undefined){
      const p:THREE.Vector3 = <THREE.Vector3>lens_['position'];
      radius = Math.sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
    }
    console.log(`radius of csphere is ${radius}`);

    // avoid radius=0
    if(radius < .1){
      radius = 10.0;
    }

    //csphere
    const csphere_g = new THREE.SphereBufferGeometry(radius),
          csphere_m = new THREE.MeshBasicMaterial({
            visible: _visible,
            color: color,
            transparent:true,
            opacity: opacity,
            wireframe: _wireframe
          }),
          csphere = new THREE.Mesh(csphere_g, csphere_m);

    // lights
    [key, fill, back] = ['key', 'fill', 'map'].map((name) => {
      const o:Record<string,unknown> = <Record<string,unknown>>ss[name] || {},
            l = new THREE.PointLight(),
            pos_a:number[] = <number[]>o['position'] || lens_.position.toArray();
      
      l.color = o['color'] || 'white';    // default white
      l.intensity = o['intensity'] || 1.0; // default 1.0
      l.distance = o['distance'] || 0.0,   // default is infinite extent
      l.position.fromArray(pos_a);         // default lens 'headlight'
      return l;
    });

    //add to scene
    csphere.add(key);
    csphere.add(fill);
    csphere.add(back);
    scene.add(csphere);
    console.log(`csphere = ${csphere}:`);
    console.dir(csphere);

    //add actors with canonical names
    narrative.addActor(scene, `${scenename}csphere`, csphere);
    narrative.addActor(scene, `${scenename}key`, key);
    narrative.addActor(scene, `${scenename}fill`, fill);
    narrative.addActor(scene, `${scenename}back`, back);


    //write
    if(scenename === 'vr'){
      vrcsphere = csphere;
      console.log(`camera.create_csphere: vrcsphere = ${vrcsphere}:`);
      console.dir(vrcsphere);
    }else{
      sgcsphere = csphere;
      console.log(`camera.create_csphere: sgcsphere = ${sgcsphere}:`);
      console.dir(sgcsphere);
    }

  }//create_csphere



  create_controls(cs:Record<string,unknown>, scene:THREE.Scene, narrative:Cast, scenename:string):void{
    console.log('camera.create_controls(cs,scene,controls,scenename) ');
    console.log(`scenename = ${scenename}`);


    if(scenename === 'sg'){
      console.log(`implememtation of sgcontrols.ts/sgkeymap.ts NOT complete`);
      if(cs['_controls']){
        const controls_speed:number = <number>cs['controls_speed'] || 0.1;
        const canvas:HTMLCanvasElement = <HTMLCanvasElement>narrative['canvas'];
        //sgcontrols.start(sglens, sgcsphere, controls_speed);
      }
      if(cs['_keymap']){
        const keymap_speed:number = <number>cs['keymap_speed'] || 0.01;
        const canvas:HTMLCanvasElement = <HTMLCanvasElement>narrative['canvas'];
        //sgkeymap.start(sglens, sgcsphere, keymap_speed);
      }
    }else{
      if(cs['_controls']){
        const controls_speed:number = <number>cs['controls_speed'] || 0.1;
        const canvas:HTMLCanvasElement = <HTMLCanvasElement>narrative['canvas'];
        vrcontrols.start(scene, canvas, controls_speed);
      }
      if(cs['_keymap']){
        const keymap_speed:number = <number>cs['keymap_speed'] || 0.01;
        const canvas:HTMLCanvasElement = <HTMLCanvasElement>narrative['canvas'];
        vrkeymap.start(scene, vrcsphere, keymap_speed);
      }
    }
  }//create_controls




  // create objects specified in arg camera-state === state['camera']
  // returns new Promise<Record<string,unknown>>((resolve, reject) => {});
  delta(state:Record<string,unknown>, narrative:Cast):Promise<number>{
    //console.log(`@@ camera.delta(state, scenes) state:`);
    //console.dir(state);

    return new Promise((resolve, reject) => {
      // process state
      // sg
      const state_sg = <Record<string,unknown>>state['sg'];
      if(state_sg && Object.keys(state_sg).length > 0){
        const scene = narrative['sg']['scene'];
        //console.log(`camera.delta: creating camera components for sg`);

        // lens
        const sgl = <Record<string,unknown>>state_sg['lens'];
        if(sgl && Object.keys(sgl).length > 0){
          narrative['sg']['lens'] = camera.create_lens(sgl, scene, narrative, 'sg');
        }


        // fog
        const sgf = <Record<string,unknown>>(state_sg['fog']);
        if(sgf && Object.keys(sgf).length > 0){
          camera.create_fog(sgf, scene); 
        }else{
          //console.log(`state['sg']['fog'] is undefined or empty`);
        }


        // csphere
        const sgs = <Record<string,unknown>>(state_sg['csphere']);
        if(sgs && Object.keys(sgs).length > 0){
          camera.create_csphere(sgs, scene, narrative, 'sg');
        }else{
          //console.log(`state['sg']['csphere'] is undefined or empty`);
        }


        // controls
        const sgc = <Record<string,unknown>>(state_sg['controls']);
        if(sgc && Object.keys(sgc).length > 0){
          camera.create_controls(sgc, scene, narrative, 'sg');
        }else{
          //console.log(`state['sg']['controls'] is undefined or empty`);
        }

      }else{
        //console.log(`state['sg'] is undefined or empty`);
      }


      // vr
      const state_vr = <Record<string,unknown>>state['vr'];
      if(state_vr && Object.keys(state_vr).length > 0){
        const scene = narrative['vr']['scene'];
        //console.log(`camera.delta: creating camera components for vr`);

        // lens
        const vrl = <Record<string,unknown>>state_vr['lens'];
        if(vrl){
          narrative['vr']['lens'] = camera.create_lens(vrl, scene, narrative, 'vr');
        }


        // fog
        const vrf = <Record<string,unknown>>(state_vr['fog']);
        if(vrf && Object.keys(vrf).length > 0){
          camera.create_fog(vrf, scene); 
        }else{
          //console.log(`state['vr']['fog'] is undefined or empty`);
        }


        // csphere
        const vrs = <Record<string,unknown>>(state_vr['csphere']);
        if(vrs && Object.keys(vrs).length > 0){
          camera.create_csphere(vrs, scene, narrative, 'vr');
        }else{
          //console.log(`state['vr']['csphere'] is undefined or empty`);
        }


        // controls
        const vrc = <Record<string,unknown>>(state_vr['controls']);
        if(vrc && Object.keys(vrc).length > 0){
          camera.create_controls(vrc, scene, narrative, 'vr');
        }else{
          //console.log(`state['vr']['controls'] is undefined or empty`);
        }



        //HACK!!! attach audioListener to lens from displayed scene
        const dslens:THREE.PerspectiveCamera = <THREE.PerspectiveCamera>narrative[narrative['displayed_scene']]['lens'];
        //console.log(`\n\n ### camera: dslens = ${dslens}`);
        //console.dir(dslens);
        //console.log(`before dslens.children.length = ${dslens.children.length}`);
        //console.log(`attaching audioListener to ${narrative['displayed_scene']}lens`);
        dslens.add(narrative['audioListener']);
        //console.log(`after dslens.children.length = ${dslens.children.length}`);
        //console.log(`dslens.children[0]:`);
        //console.dir(dslens.children[0]);
        resolve(narrative['devclock'].getElapsedTime());

      }else{

        //console.log(`state['vr'] is undefined or empty`);
        //HACK!!! attach audioListener to lens from displayed scene
        const dslens:THREE.PerspectiveCamera = <THREE.PerspectiveCamera>narrative[narrative['displayed_scene']]['lens'];
        //console.log(`attaching audioListener to ${narrative['displayed_scene']}lens`);
        dslens.add(narrative['audioListener']);
        resolve(narrative['devclock'].getElapsedTime());

      }
    });

  }//camera.delta

}//Camera


Camera.create();
export {camera};
