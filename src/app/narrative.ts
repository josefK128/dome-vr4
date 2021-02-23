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

// tween.js
import TWEEN from '../jsm/tween.js/tween.esm.js';

// make exterior modules available globally 
window['THREE'] = THREE;
window['VRButton'] = VRButton;
window['Stats'] = Stats;
window['gsap'] = gsap;
window['TweenMax'] = TweenMax;
window['TimelineMax'] = TimelineMax;
window['Power1'] = Power1;
window['TWEEN'] = TWEEN;


// dome-vr4 modules
// first 3 imports are compile-time only so don't need to use js-ext
// interfaces for scene
import {Cast} from './cast.interface';
import {Config} from './scenes/config.interface';
import {State} from './scenes/state.interface';


// at compile time tsc is smart enough to load <module>.ts even though the 
// file-extension is .js - note that .js is needed for runtime usage
// services
//import {mediator} from './services/actions/mediator.js';
import {director} from './services/actions/director.js';
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



// singleton closure variables
// const but uninitialized
let narrative:Narrative,
    config:Config,
    canvas:HTMLCanvasElement,       // DOM singularity 
    context:WebGLRenderingContext|CanvasRenderingContext2D, //webGL(2) context
    renderer:THREE.WebGLRenderer, // from state/stage
                                 // NOTE:renderer.render(sgscene,lens)
    // cameras, controls
    sglens:THREE.PerspectiveCamera,      // from state/camera
                   // NOTE:TBD 'csphere' is whole apparatus - lens, lights etc
    //sglens_offset:THREE.Object3D,      // _webxr:t => lower camera by 1.6
    rmlens:THREE.PerspectiveCamera,   // separate camera for rendering rmscene
    vrlens:THREE.PerspectiveCamera,   // separate camera for rendering vrscene,
    //vrlens_offset:THREE.Object3D, // _webxr:t => lower camera by 1.6
    //_controls:boolean = false,   // use controls/keymap? 
                                // set by config.controls:boolean? default false
    //controls:Object,           // vrcontrols
    //keymap:Object,            // vrcontrols-keymap - vrkeymap

    // topology type and corresponding flags
    // see function calculate_topology(sg:boolen,rm:boolean,vr:boolean):number
    topology:number,
    _sg:boolean,
    _rm:boolean,
    _vr:boolean,

    // scenes
    sgscene:THREE.Scene,
    rmscene:THREE.Scene,
    vrscene:THREE.Scene,
    displayed_scene:string,

    // actors
    cast:Record<string, Actor>,  //stage creates name-actor entries & 
      // registers them in cast via narrative.addActor(scene, name, actor) 

    // fps-performance meter
    stats:Stats;
    

// const - initialized
const tl = gsap.timeline({paused:true}),
      clock = new THREE.Clock(),    // uses perfomance.now() - fine grain
      actionsTargets:Record<string,unknown> = { // targets of actions 
        'narrative':narrative
      },
      timer = (t:number, dt:number, fr:number):void => {
        // sync frame and gsap-frame => no need to increment frame in render()
        frame = fr;
//        if(fr % 1000 === 0){
//          console.log(`timer:frame=${frame} et=${et} fr=${fr} t=${t}`);
//        }
      },
      calculate_topology = (sg:boolean, rm:boolean, vr:boolean):number => {
        let t = 0;
        if(sg){t+=1;}
        if(rm){t+=2;}
        if(vr){t+=4;}
        return t;
      };


//dynamic
let _stats = false,
    aspect = 1.0,             // window.innerW/window.innerH
    animating = false,       // animation => render-loop running
    et = 0,                 // elapsed time - clock starts at render start
    frame = 0;             // frame index (as in rendered frames - fps)
   



class Narrative implements Cast{
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

    // initialize director with set of possible actions targets {t:'target',...}
    // and with ref to narrative (contained in 'actionsTargets')
    config['actionsTargets'] = actionsTargets;
    director.initialize(config);


    // renderer
    // canvas and gl-context
    canvas = <HTMLCanvasElement>document.getElementById(config.renderer.canvas_id);
    context = canvas.getContext('webgl2', {antialias:true});

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

    // stats - display fps performance
    _stats = config['renderer']['_stats'];
    if(_stats){
      stats = new Stats();
      document.body.appendChild(stats.dom);
      stats.dom.style.display = 'block';  // show
    }


    // topology
    _sg = config.topology._sg;
    _rm = config.topology._rm;
    _vr = config.topology._vr;
    topology = calculate_topology(_sg, _rm, _vr);
    //console.log(`_sg=${_sg} _rm=${_rm} _vr=${_vr}`);
    console.log(`rendering topology type = ${topology}`);

    // initialize scenes according to topology 
    sgscene = _sg ? new THREE.Scene() : undefined;
    rmscene = _rm ? new THREE.Scene() : undefined;
    aspect = window.innerWidth/window.innerHeight;
    rmlens = _rm ? new THREE.PerspectiveCamera(90, aspect,.1,1000) : undefined;
    vrscene = _vr ? new THREE.Scene() : undefined;
    displayed_scene = config.topology.displayed_scene;
    console.log(`displayed_scene = ${displayed_scene}`);


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

    (async () => {

      // prepare scenes={existing scenes} second arg for camera.delta
      const scenes:Record<string,THREE.Scene> = {};
      scenes['sgscene'] = sgscene;
      scenes['rmscene'] = rmscene;
      scenes['vrscene'] = vrscene;

      // get camera_results so lens(es) can be attached to corresponding
      // scenes - needed by some actors created in stage.delta - exp. panorama
      try{
        const camera_results:Record<string,unknown> = await camera.delta(state['camera'], scenes);

        // process camera_results
        console.log(`\n@@@ n.chSt camera_results:`);
        console.dir(camera_results);
        console.log(`@@@ n.chSt camera_results\n`);
        if(sgscene){
          sglens = <THREE.PerspectiveCamera>(<Record<string,unknown>>camera_results['sg'])['lens'];
        }
        if(vrscene){
          vrlens = <THREE.PerspectiveCamera>(<Record<string,unknown>>camera_results['vr'])['lens'];
        }
      }catch(e){
        console.log(`error in camera.delta: ${e}`);
      }

   
      try{
        const results:unknown[] = await Promise.all([
          stage.delta(state['stage'], scenes, narrative),
          //audio.delta(state['audio']),
          //actions.delta(state['actions'], narrative)
        ]);

        // process stage, audio and actions results
        //console.log(`these results should be [void,void,void]`);
        console.log(`\n\n@@@ n.chSt: Promise.all([stage,audio,actions]) results[]:`);
        console.dir(results);
        console.log(`@@@ n.chSt Promise.all([stage,audio,actions]) results[]:\n`);

        if(!animating){
          // start clock, timeline
          clock.start();
          tl.play();
    
          // set timer to report time passage - t, dt, frames
          gsap.ticker.add(timer);

          // listen for resize events
          window.addEventListener( 'resize', narrative.onWindowResize, false );

          // setAnimationLoop => begin render-loop
          animating = true;
          renderer.setAnimationLoop(narrative.render);
          narrative.render();
        }

      }catch(e){
        console.log(`n.chSt - error in processing state from scene: ${e}`);
      }

    })();//async-IIFE 

  }//changeState



  // render current frame - frame holds current frame number
  render():void {
    // time
    et = clock.getElapsedTime();

    //console.log('narrative.render()');
    if(_stats){
      stats.update();
    } 


    // render config-defined topology using defined rendering functions
    switch(topology){
      case 7:     // sg-rm-vr
        break;

      case 6:     // rm-vr
        break;

      case 5:     // sg-vr
        break;

      case 4:     // vr
        renderer.render(vrscene, vrlens);
        break;

      case 3:     // sg-rm
        break;

      case 2:     // rm
        renderer.render(rmscene, rmlens);
        break;

      case 1:     // sg
        renderer.render(sgscene, sglens);
        break;

      default:    // error
        console.log(`unrecgnized topology ${topology}`);
    }    

  }//render



  // reset params based on window resize event
  onWindowResize():void {
    const width_:number = window.innerWidth,
          height_:number = window.innerHeight;
 
    console.log(`resize: width=${width_} height=${height_}`);
    canvas.width = width_;
    canvas.height = height_;
    aspect = width_/height_;

    if(sglens){
      sglens.aspect = aspect;
      sglens.updateProjectionMatrix();
    }
    if(rmlens){
      rmlens.aspect = aspect;
      rmlens.updateProjectionMatrix();
    }
    if(vrlens){
      vrlens.aspect = aspect;
      vrlens.updateProjectionMatrix();
    }
    renderer.setSize(width_, height_);
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
  addActor(scene:THREE.Scene, name:string, actor:THREE.Object3D):void{
    console.log(`\n@@@ narrative.addActor ${name}`);
    if(scene && actor && name && name.length > 0){
      if(cast[name]){
        narrative.removeActor(scene, name);  //if replace actor with same name?
      }
      actor.name = name;  // possible diagnostic use
      cast[name] = actor;
      scene.add(actor);
      console.log(`n.addActor: scene.children.l = ${scene.children.length}`);
    }else{
      console.log(`n.addActor:FAILED to add actor ${actor} w. name ${name}!!`); 
    }
  }

  removeActor(scene:THREE.Scene, name:string):void{
    console.log('\nnarrative.removeActor ${name}');
    if(scene && name && name.length > 0){
      if(cast[name]){
        scene.remove(cast[name]);
        delete cast[name];
      }
    }else{
      console.log(`n.removeActor:FAILED to remove actor with name ${name}!!`); 
    }
  }

  // following two functions are for actor report and fetch
  reportActors(display=false):Record<string, THREE.Object3D>{
    //console.log('\nnarrative.reportActors()');
    if(display){
      for(const [k,v] of Object.entries(cast)){
        console.log(`cast contains actor ${v} with name ${k}`); 
          // and actor.name ${v.name}`);
      }
    }
    return cast;
  }

  findActor(name:string):THREE.Object3D{
    //console.log(`\nnarrative.findActor: seeking actor name=${name}`);
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
