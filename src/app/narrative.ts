// narrative.ts
// bootstrap controller-application
// RECALL: src/app/narrative.ts is transpiled to dist/app/narrative.js
// and index.html <base href='/dist/'>  
// so all js-files referenced in narrative.ts are loaded relative to 
// dome-vr4/dist/app
// RECALL: jsm-lib is at dome-vr4/dist/jsm, 
// so the path to the jsm-lib relative to dist/app/narrative is ../jsm
// exp: import {VRButton} from '../jsm/three/webxr/VRButton.js



// modules exterior to dome-vr4

// Three.js
import * as THREE from '../jsm/three/build/three.module.js';
import {VRButton} from '../jsm/three/webxr/VRButton.js';
import Stats from '../jsm/three/stats/stats.module.js'; //default export

// gsap
import {gsap, TweenMax, TimelineMax, Power1} from '../jsm/gsap/all.js';

// make exterior modules available globally 
window['THREE'] = THREE;
window['VRButton'] = VRButton;
window['Stats'] = Stats;
window['gsap'] = gsap;
window['TweenMax'] = TweenMax;
window['TimelineMax'] = TimelineMax;
window['Power1'] = Power1;



// dome-vr4 modules

// first 2 imports are compile-time only so don't need to use js-ext
// interfaces for scene
import {Config} from './scenes/config.interface';
import {State} from './scenes/state.interface';

// at compile time tsc is smart enough to load <module>.ts even though the 
// file-extension is .js - note that .js is needed for runtime usage

// services
//import {mediator} from './services/actions/mediator.js';
//import {director} from './services/actions/director.js';
import {queue} from './services/actions/queue.js';
import {transform3d} from './services/transform3d.js';
//import {animation} from './services/animation.js';
if(typeof queue !== undefined){
  //console.log(`queue is defined!`);  //otherwise queue is NOT used - tsc warn
}

// state
import {stage} from './state/stage.js';
import {camera} from './state/camera.js';
//import {audio} from './state/audio.js';
//import {actions} from './state/actions.js';

// models
import {Actor} from './models/stage/actors/actor.interface';  
import {Panorama} from './models/stage/actors/environment/Panorama.js';  
//import {Action} from './models/actions/action.interface';
//import {vrcontrols} from './models/camera/controls/vrcontrols';  
//import {vrkeymap} from './models/camera/keymaps/vrkeymap';  
//// for actors/cloud/spritecloud.ts
//import TWEEN from '../libs/tween.js/tween.esm';



// singleton closure variables
// const but uninitialized
let narrative:Narrative,
    config:Config,
    canvas:HTMLCanvasElement,       // DOM singularity 
    context:WebGLRenderingContext|CanvasRenderingContext2D, //webGL(2) context
    renderer:THREE.WebGLRenderer, // from state/stage
                                 // NOTE:renderer.render(sgscene,lens)
    // cameras, controls
    //lens:THREE.PerspectiveCamera,      // from state/camera
                   // NOTE:TBD 'csphere' is whole apparatus - lens, lights etc
    //lens_offset:THREE.Object3D,      // _webxr:t => lower camera by 1.6
    vrlens:THREE.PerspectiveCamera, // separate camera for rendering vrscene
    //vrlens_offset:THREE.Object3D, // _webxr:t => lower camera by 1.6
    //_controls:boolean = false,   // use controls/keymap? 
                                // set by config.controls:boolean? default false
    //controls:Object,           // vrcontrols
    //keymap:Object,            // vrcontrols-keymap - vrkeymap

    //clock and performance meter
    clock:THREE.Clock,    // uses perfomance.now() - fine grain
    stats:Stats,

    // actors
    cast:Record<string, Actor>,  //stage creates name-actor entries & 
      // registers them in cast via narrative.addSGActor(name, actor) 
      // for all actors in sgscene, or narrative.addVRActor(name, actor) 
      // for all actors in vrscene

    sgscene:THREE.Scene,
    rmscene:THREE.Scene,
    vrscene:THREE.Scene;

// const - initialized
const tl = gsap.timeline({paused:true}),
      targetNames:Record<string,unknown> = {
        'narrative':narrative
      },
      timer = (t:number, dt:number, fr:number) => {
        // sync frame and gsap-frame => no need to increment frame in render()
        frame = fr;
        if(fr % 1000 === 0){
          console.log(`timer:frame=${frame} et=${et} fr=${fr} t=${t}`);
        }
      };


//dynamic
let _stats = false,            // performance meter - update stats in render 
    aspect = 1.0,             // window.innerW/window.innerH
    animating = false,       // animation => render-loop running
    et = 0,                 // elapsed time - clock starts at render start
    frame = 0;             // frame index (as in rendered frames - fps)
   



class Narrative {
  // ctor
  private constructor(){
    narrative = this;
    cast = {};
  } 

  static create():Narrative{
    //console.log(`\n\nnarrative.create !!!!!!!!!!!!!!!!!!!!!!!`);
    if(narrative === undefined){
      narrative = new Narrative();
    }
    return narrative;
  }

  foo():string{
    return 'foo';
  }



  // set up rendering framework and initialize services and state 
  //bootstrap(_config:Config, state:State){
  bootstrap(_config:Config, state:State):void{
    console.log(`\n@@@ narrative.bootstrap:`);

    // initialize config
    config = _config;


    // canvas and gl-context
    canvas = <HTMLCanvasElement>document.getElementById(config.renderer.canvas_id);
    //as of Oct 2019 webgl2 cannot render antialiasing - when supported
    //change false to config.renderer.antialias - done! jan30_2021
    context = canvas.getContext('webgl2', {antialias:true});

    // initialize renderer
    renderer = new THREE.WebGLRenderer({
      canvas:canvas,
      context:context,
      alpha:config.renderer.alpha,
    });

    renderer.setClearColor(new THREE.Color(config.renderer.clearColor), 
      config.renderer.clearAlpha);
    renderer.setSize(window.innerWidth, window.innerHeight);

    if(renderer.capabilities.isWebGL2){
      console.log(`webGL2 renderer created !!!!!!!`);
    }else{
      console.log(`webGL1 renderer created !!!!!!!`);
    }


    // initialize scenes 
    if(config.topology._sg){
      sgscene = new THREE.Scene();
      console.log(`_sg = ${config.topology._sg} so creating sgscene`);
    }
    if(config.topology._rm){
      rmscene = new THREE.Scene();
      console.log(`_rm = ${config.topology._rm} so creating rmscene`);
    }
    if(config.topology._vr){
      vrscene = new THREE.Scene();
      console.log(`_vr = ${config.topology._vr} so creating vrscene`);
    }


    // stats
    _stats = state['stage']['frame']['_stats'];
    stats = new Stats();
    document.body.appendChild(stats.dom);
    if(_stats){
      //console.log('setting stats display style to block');
      stats.dom.style.display = 'block';  // show
    }else{
      //console.log('setting stats display style to none');
      stats.dom.style.display = 'none';  // hide
    }

    // webxr
    if(config.topology._webxr){
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local');

      // webXR VRButton
      document.body.append(VRButton.createButton(renderer));
      console.log(`_webxr = ${config.topology._webxr} so rendering in webXR`);
    }else{
      console.log(`_webxr = ${config.topology._webxr} so rendering in webGL`);
    }


    // connect to server?
    if(config.server.server_connect){
      //mediator.connect();
    }

    // initialize state 
    narrative.changeState(state);

  }



  // for actions (usually from server)
  // change state of framework states
  //async changeState(state:State):void{
  changeState(state:State):void{
    console.log(`\n@@@ narrative.changeState state:`);
    console.dir(state);


    const result:Record<string,unknown> = Promise.all([
      camera.delta(state['camera']),
      //stage.delta(state['stage', narrative]),
      //audio.delta(state['audio']),
      //actions.delta(state['actions'])
    ]);
    console.log(`camera.delta resolves to result:Record<string,unknown> =`);
    console.dir(result);

    // TEMP !!!
    // create/modify cameras/lenses
    aspect = window.innerWidth/window.innerHeight;
    vrlens = new THREE.PerspectiveCamera(90, aspect, 0.1, 1000); 


    // panorama - Promise resolves to Actor instance - contains
    // delta() and layers:THREE.Mesh[]  (layers.length = 2)
//    Panorama.create({'camera': vrlens}).then((panorama) => {
//      console.log(`Panorama.create returns panorama containing layers - length = ${panorama['layers'].length}`);
//      //console.log(`panorama['layers'][0] = ${panorama['layers'][0]}`);
//      vrscene.add(panorama['layers'][0]);
//      //console.log(`panorama['layers'][1] = ${panorama['layers'][1]}`);
//      vrscene.add(panorama['layers'][1]);
//    }).catch((e) => {
//      console.log(`error creating panorama: ${e}`);
//    });

    Panorama.create({'lens': vrlens}).then((actor) => {
      console.log(`Panorama.create returns panorama containing layers - length = ${actor['layers'].length}`);
      if(actor['layers']){
        for(const layer of actor['layers']){
          vrscene.add(layer);
        }
      }else{
        vrscene.add(actor);
      }
    }).catch((e) => {
      console.log(`error creating panorama: ${e}`);
    });

    if(!animating){
      // initialize clock, timeline
      clock = new THREE.Clock();
      clock.start();
      tl.play();

      // set timer to report time passage - t, dt, frames
      gsap.ticker.add(timer);
  
      // setAnimationLoop => begin render-loop
      animating = true;
      renderer.setAnimationLoop(narrative.render);
      narrative.render();
    }
  }//changeState



  // render current frame - frame holds current frame number
  render():void {
    // time
    et = clock.getElapsedTime();

    //console.log('narrative.render()');
    if(_stats){
      stats.update();
    } 

    //renderer.render( scene, camera );
    renderer.render(vrscene, vrlens);

  }



  // reset params based on window resize event
  onWindowResize():void {
    //sglens.aspect = window.innerWidth / window.innerHeight;
    //sglens.updateProjectionMatrix();
    //vrlens.aspect = window.innerWidth / window.innerHeight;
    //vrlens.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }


  // method to allow infinite seq-loop mainly for music sequence playing
  // for infinite loop of sequence place this action at tail of sequence
  // with appropriate execution time (ms)
  /*      
  {t:'narrative',
   f:'sequence',
   a:'n',
   o:{'arg':'./app/models/actions/sequences/loop/seq_loop'},
   ms:15000}
  */
  sequence(sequence_url:string):void{
    console.log(`\n\n****** narrative.sequence seq_url = ${sequence_url}`);
//    if(sequence_url){
//      import(sequence_url).then((seq) => {
//        console.log(`****** narrative.sequence seq = ${seq}:`);
//        console.dir(seq);
//        if(seq['actions']){
//          console.log(`seq['actions'].len=${seq['actions'].length}`);
//          console.dir(seq['actions']);
//          queue.load(seq['actions']);   // load sequence to repeat
//          clock.start();  //reset clock to zero for re-play of sequence 
//          console.log(`clock.ellapsedTime=${clock.elapsedTime}`);
//        }
//      });
//    }
  }



  // following two functions are for sgscene-actor management (by actor name)
  addSGActor(name:string, actor:THREE.Object3D):void{
    if(actor && name && name.length > 0){
      if(cast[name]){
        narrative.removeSGActor(name);  // if replace actor with same name?
      }
      console.log(`\n############################### addSGActor`);
      console.log(`narrative: adding sg actor ${actor} with name ${name}`); 
      actor.name = name;  // possible diagnostic use
      //console.dir(actor);
      cast[name] = actor;
      sgscene.add(actor);
      console.log(`n.addSGActor: sgscene.children.length = ${sgscene.children.length}`);
    }else{
      console.log(`narrative: FAILED to add sg actor ${actor} with name ${name}!!`); 
    }
  }

  removeSGActor(name:string):void{
    if(name && name.length > 0){
      if(cast[name]){
        sgscene.remove(cast[name]);
        delete cast[name];
        console.log(`removing sg actor ${name}`); 
      }
    }else{
      console.log(`FAILED to remove sg actor with name ${name}!!`); 
    }
  }

  // following two functions are for rmscene-actor management (by actor name)
  // in all cases this should simply be 'rmquad' (PlaneXY) - quad equal to
  // the rm-'eye' near plane (in normalized device coords (NDC) [-1,1]x[-1,1]
  addRMActor(name:string, actor:THREE.Object3D):void{
    if(actor && name && name.length > 0){
      if(cast[name]){
        narrative.removeRMActor(name);  // if replace actor with same name?
      }
      console.log(`narrative:adding rm actor ${actor} with name ${name}`); 
      actor.name = name;  // possible diagnostic use
      cast[name] = actor;
      rmscene.add(actor);
      console.log(`n.addRMActor: rmscene.children.length = ${rmscene.children.length}`);
    }else{
      console.log(`narrative: FAILED to add rm actor ${actor} with name ${name}!!`); 
    }
  }

  removeRMActor(name:string):void{
    if(name && name.length > 0){
      if(cast[name]){
        rmscene.remove(cast[name]);
        delete cast[name];
        console.log(`removing rm actor ${name}`); 
      }
    }else{
      console.log(`FAILED to remove rm actor with name ${name}!!`); 
    }
  }

  // following two functions are for vrscene-actor management (by actor name)
  addVRActor(name:string, actor:THREE.Object3D):void{
    if(actor && name && name.length > 0){
      if(cast[name]){
        narrative.removeVRActor(name);  // if replace actor with same name?
      }
      console.log(`\n############################### addVRActor`);
      console.log(`narrative:adding vr actor ${actor} with name ${name}`); 
      actor.name = name;  // possible diagnostic use
      cast[name] = actor;
      vrscene.add(actor);
      console.log(`n.addVRActor: vrscene.children.length = ${vrscene.children.length}`);
    }else{
      console.log(`narrative: FAILED to add vr actor ${actor} with name ${name}!!`); 
    }
  }

  removeVRActor(name:string):void{
    if(name && name.length > 0){
      if(cast[name]){
        vrscene.remove(cast[name]);
        delete cast[name];
        console.log(`removing vr actor ${name}`); 
      }
    }else{
      console.log(`FAILED to remove vr actor with name ${name}!!`); 
    }
  }



  // following two functions are for actor report and fetch
  reportActors(display=false):Record<string, Actor>{
    //console.log('\nnarrative.reportActors()');
    if(display){
      for(const [k,v] of Object.entries(cast)){
        console.log(`cast contains actor ${v} with name ${k}`); 
          // and actor.name ${v.name}`);
      }
    }
    return cast;
  }

  findActor(name:string):Actor{
    //console.log(`narrative.find: seeking actor name=${name}`);
    if(name && name.length > 0){
      if(cast[name]){
        //console.log(`narrative.find: cast[${name}] = ${cast[name]}`);
        return cast[name];
      }else{
        console.log(`actor name ${name} NOT found - returning null!!`); 
        return null;
      }
    }else{
      console.log(`actor name ${name} is malformed - returning null!!`); 
      return null;
    }
  }

}//Narrative


// enforce singleton export
Narrative.create();
export {narrative};
