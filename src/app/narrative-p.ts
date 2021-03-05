// narrative.ts
// bootstrap controller-application
// RECALL: src/app/narrative.ts is transpiled to dist/app/narrative.js
// and index.html <base href='/dist/'>  
// so all js-files referenced in narrative.ts are loaded relative to 
// dome-vr4/dist/app
// RECALL: external-lib is at dome-vr4/dist/external, 
// so the path to the external-lib relative to dist/app/narrative is ../external
// exp: import {VRButton} from '../external/three/examples/jsm/webxr/VRButton.js



// modules exterior to dome-vr4

// Three.js
import * as THREE from '../external/three/build/three.module.js';
import {VRButton} from '../external/three/examples/jsm/webxr/VRButton.js';
import Stats from '../external/three/examples/jsm/libs/stats/stats.module.js'; //default export
import {OrbitControls} from '../external/three/examples/jsm/controls/OrbitControls.js'; 

// gsap
import {gsap, TweenMax, TimelineMax, Quad, Power1} from '../external/gsap/all.js';

// tween.js
import TWEEN from '../external/tween.js/tween.esm.js';

// make exterior modules available globally 
window['THREE'] = THREE;
window['VRButton'] = VRButton;
window['Stats'] = Stats;
window['gsap'] = gsap;
window['TweenMax'] = TweenMax;
window['TimelineMax'] = TimelineMax;
window['Quad'] = Quad;
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
import {animation} from './services/animation.js';
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

    // canvas DOM-singularity, and webgl2-context
    canvas:HTMLCanvasElement, 
    context:WebGLRenderingContext|CanvasRenderingContext2D,

    // topology type and corresponding flags
    // see function calculate_topology(sg:boolen,rm:boolean,vr:boolean):number
    topology:number,
    _sg:boolean,
    _rm:boolean,
    _vr:boolean,

    // webGLRender
    renderer:THREE.WebGLRenderer, // from state/stage
                                 // NOTE:renderer.render(sgscene,lens)

    // scenes
    sgscene:THREE.Scene,
    rmscene:THREE.Scene,
    vrscene:THREE.Scene,
    displayed_scene:string,

    // sg
    //NOTE:'csphere' is whole 'camera' apparatus - lens, lights, hud etc
    sglens:THREE.PerspectiveCamera,
    sgorbit:OrbitControls,
    sgcsphere:THREE.Mesh,
    sgcontrols:Record<string,unknown>,
    sgmap:Record<string,unknown>,
    sgTargetNames:string[],
    sgRenderTarget:THREE.WebGLRenderTarget,

    // rm
    rmlens:THREE.PerspectiveCamera,
    rmTargetNames:string[],
    rmRenderTarget:THREE.WebGLRenderTarget,

    // vr
    vrlens:THREE.PerspectiveCamera,
    vrorbit:OrbitControls,
    vrcsphere:THREE.Mesh,
    vrcontrols:Record<string,unknown>,
    vrmap:Record<string,unknown>,
    vrTargetNames:string[],
    vrRenderTarget:THREE.WebGLRenderTarget,

    // fps-performance meter
    stats:Stats;
  

// const - initialized
      // dictionary of all scenes
const scenes:Record<string, THREE.Scene> = {},
    
      // dictionary of all actors.
      cast:Record<string, THREE.Object3D> = {},
           //state/stage creates name-actor entries & registers them in cast 
          //via narrative.addActor(scene, name, actor) 

      // dictionary of targets of actions 
      actionsTargets:Record<string,unknown> = { 
        'narrative':narrative
      },

      // time
      tl = gsap.timeline({paused:true}),
      clock = new THREE.Clock(),    // uses perfomance.now() - fine grain
      timer = (t:number, dt:number, fr:number):void => {
        // sync frame and gsap-frame => no need to increment frame in render()
        frame = fr;
//        if(fr % 1000 === 0){
//          console.log(`timer:frame=${frame} et=${et} fr=${fr} t=${t}`);
//        }
      },

      // renderers
      create_renderer = ():THREE.WebGLRenderer => {
        renderer = new THREE.WebGLRenderer({
          canvas:canvas,
          context:context,
          antialias:config.renderer.antialias,
          alpha:config.renderer.alpha
        });
        renderer.setClearColor(new THREE.Color(config.renderer.clearColor),
          config.renderer.clearAlpha);
        renderer.setSize(window.innerWidth, window.innerHeight);
        return renderer;
      };


//dynamic
let _stats = false,
    aspect = 1.0,             // dynamic measure of window.innerW/window.innerH
    animating = false,       // animation => render-loop running
    et = 0,                 // elapsed time - clock starts at render start
    frame = 0;             // frame index (as in rendered frames - fps)
   



class Narrative implements Cast{
  // ctor
  private constructor(){
    narrative = this;
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
    console.log(`\n@@@ narrative.bootstrap():`);

    // initialize config
    config = _config;


    // initialize needed narrative closure variables and copy references
    // to narrative instance object for use in state modules camera, stage
    // audio and actions.
    //NOTE: config is not needed as arg since it is a closure var of narrative
    narrative.initialize();

    // initialize modules with set of possible actions targets {t:'target',...}
    // and with ref to narrative (narrative contained in 'actionsTargets')
    config['actionsTargets'] = actionsTargets;
    director.initialize(config);
    animation.initialize(config);


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

    // stats - display fps performance
    _stats = config['renderer']['_stats'];
    if(_stats){
      stats = new Stats();
      document.body.appendChild(stats.dom);
      stats.dom.style.display = 'block';  // show
    }


    // connect to server?
    if(config.server.server_connect){
      //mediator.connect();
    }

    // initialize state of scene 
    narrative.changeState(state);

  }



  // initialize needed narrative closure variables and copy references
  // to narrative instance object for use in state modules camera, stage
  // audio and actions.
  initialize():void{
    console.log(`@@@ narrative.initialize():`);

    // canvas DOM-singularity, and webgl2-context
    canvas = <HTMLCanvasElement>document.getElementById(config.renderer.canvas_id);
    context = canvas.getContext('webgl2', {antialias:true});


    // topology
    _sg = config.topology._sg;
    _rm = config.topology._rm;
    _vr = config.topology._vr;
    topology = config.topology.topology;  //topology=_sg + _rm*2 + _vr*4
    //console.log(`_sg=${_sg} _rm=${_rm} _vr=${_vr}`);
    console.log(`rendering topology type = ${topology}`);
    displayed_scene = config.topology.displayed_scene;
    console.log(`displayed_scene = ${displayed_scene}`);

    // create WebGLRenderer for all scenes
    renderer = create_renderer();
    //console.log(`renderer = ${renderer}:`);
    //console.dir(renderer);

    sgscene = _sg ? new THREE.Scene() : undefined;
    rmscene = _rm ? new THREE.Scene() : undefined;
    vrscene = _vr ? new THREE.Scene() : undefined;
    scenes['sgscene'] = sgscene;
    scenes['rmscene'] = rmscene;
    scenes['vrscene'] = vrscene;

//    //non-essential rmlens

    if(_sg){
      narrative['sg'] = {};
      const nsg:Record<string,unknown> = narrative['sg'];
      sgscene = new THREE.Scene();
      nsg['scene'] = sgscene;
      nsg['lens'] = sglens;
      nsg['orbit'] = sgorbit;
      nsg['csphere'] = sgcsphere;
      nsg['controls'] = sgcontrols;
      nsg['map'] = sgmap;
      nsg['targetNames'] = sgTargetNames;
    }

    if(_rm){
      narrative['rm'] = {};
      const nrm:Record<string,unknown> = narrative['rm'];
      rmscene = new THREE.Scene();
      nrm['scene'] = rmscene;
      const aspect = window.innerWidth/window.innerHeight;
      rmlens = new THREE.PerspectiveCamera(90, aspect,.1,1000); // never used
      nrm['lens'] = rmlens;
      nrm['targetNames'] = rmTargetNames;
    }
    
    if(_vr){
      narrative['vr'] = {};
      const nvr:Record<string,unknown> = narrative['vr'];
      vrscene = new THREE.Scene();
      nvr['scene'] = vrscene;
      nvr['lens'] = vrlens;
      nvr['orbit'] = vrorbit;
      nvr['csphere'] = vrcsphere;
      nvr['controls'] = vrcontrols;
      nvr['map'] = vrmap;
      nvr['targetNames'] = vrTargetNames;
    }
    // returns to bootstrap()

  }//initialize()



  // for actions (usually from server)
  // change state of framework states
  changeState(state:State):void{
    console.log(`\n@@@ narrative.changeState state:`);
    console.dir(state);


    //@TODO - add camera.delta(state['camera']:Record<string,unknow>, narrative:Cast):void to await Promise.all([...]):void[]
    (async () => {

      // state/camera
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
          console.log(`***n.chState sglens.position:`);
          console.dir(sglens.position);
          console.log(`***n.chState sglens.getWorldPosition():`);
          console.dir(sglens.getWorldPosition(new THREE.Vector3()));

          //sgorbit = <THREE.PerspectiveCamera>(<Record<string,unknown>>camera_results['sg'])['orbit'];
          console.log(`state['camera']['sg']['lens'] = ${state['camera']['sg']['lens']}`);
          console.dir(state['camera']['sg']['lens']);
          console.log(`state['camera']['sg']['lens']['_orbit'] = ${state['camera']['sg']['lens']['_orbit']}`);
          if(state['camera']['sg']['lens'] && state['camera']['sg']['lens']['_orbit']){
            console.log(`\n*** enabling orbit controls for sglens:`);
            console.log(`***n.chState sglens.position:`);
            console.dir(sglens.position);

            //NOTE:get canvas wo need for any narrative properties
            const canvas_ = <HTMLCanvasElement>document.getElementsByTagName('canvas')[0];
            console.log(`canvas_ === canvas is = ${canvas_===canvas}`);
            console.log(`canvas_ = ${canvas_}:`);
            console.dir(canvas_);

            //sgorbit = new OrbitControls(sglens, renderer.domElement);
            sgorbit = new OrbitControls(sglens, canvas_);

            sgorbit.update();
            sgorbit.enableDamping = true;
            sgorbit.dampingFactor = 0.25;
            sgorbit.enableZoom = true;
            sgorbit.autoRotate = true;
          }
        }
        if(vrscene){
          vrlens = <THREE.PerspectiveCamera>(<Record<string,unknown>>camera_results['vr'])['lens'];
          //vrorbit = <THREE.PerspectiveCamera>(<Record<string,unknown>>camera_results['vr'])['orbit'];
          if(state['camera']['vr'] && state['camera']['vr']['_orbit']){
            console.log(`\n*** enabling orbit controls for vrlens:`);
            //console.dir(vrlens);
            vrorbit = new OrbitControls(sglens, renderer.domElement);
            vrorbit.update();
            vrorbit.enableDamping = true;
            vrorbit.dampingFactor = 0.25;
            vrorbit.enableZoom = true;
            //vrorbit.autoRotate = true;
            console.dir(vrorbit);
          }
        }
      }catch(e){
        console.log(`error in camera.delta: ${e}`);
      }

   
      // non-camera states
      // stage prepares scenes
      // audio prepares music/sound
      // actions prepares sequences - music, animation and changes
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

          // initialize rendering topology
          //narrative.prerender();

          // start clock, timeline
          clock.start();
          tl.play();
    
          // set timer to report time passage - t, dt, frames
          gsap.ticker.add(timer);

          // listen for resize events
          window.addEventListener( 'resize', narrative.onWindowResize, false );

          // setAnimationLoop => begin render-loop
          animating = true;
          console.log(`renderer = ${renderer}`);
          renderer.setAnimationLoop(narrative.render);
          narrative.render();
        }

      }catch(e){
        console.log(`n.chSt - error in processing state from scene: ${e}`);
      }

    })();//async-IIFE 

  }//changeState()


  // prerender - prepare specific rendering topology
  prerender():void {
    //renderer = create_renderer();
  }//prerender()


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

  }//render()



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
  }//onWindowResize()


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
        console.log(`actor name ${name} NOT found - returning undefined!`); 
        return undefined;
      }
    }else{
      console.log(`actor name ${name} is malformed - returning undefined!`); 
      return null;
    }
  }


//  findRenderTarget(name:string):THREE.WebGLRenderTarget{
//    //console.log(`\nnarrative.getRenderTarget: name=${name}`);
//    if(name && name.length > 0){
//      if(name.match(/sg/)){return sgRenderTarget;}
//      if(name.match(/rm/)){return rmRenderTarget;}
//      if(name.match(/vr/)){return vrRenderTarget;}
//      console.log(`renderTarget matching ${name} NOT found!`); 
//    }else{
//      console.log(`renderTarget name ${name} is malformed!`); 
//    }
//    return undefined;
//  }


}//Narrative


// enforce singleton export
Narrative.create();
export {narrative};
