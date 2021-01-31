// narrative.ts
// bootstrap controller


// Stats
//import Stats from '../src/jsm/stats/stats.module.js';

// scene
// first 2 imports are compile-time only so don't need to use js-ext
import {Config} from './scenes/config.interface';
import {State} from './scenes/state.interface';

// other runtime imports must use .js-ext for correct runtime browser execution
// NOTE: at compile-time tsc will import the correct ts-file even though in the
// import statement the file has a .js-ext
//import {config, state} from './scenes/@current/scene.js';
// just to use defined names config, state
//console.log(`import expt: config = ${config}`); 
//console.log(`import expt: state = ${state}`); 


//// services
//import {mediator} from './services/actions/mediator';
//import {director} from './services/actions/director';
//import {queue} from './services/actions/queue';
//import {transform3d} from './services/transform3d';
//import {animation} from './services/animation';
//// state
//import {stage} from './state/stage';
//import {camera} from './state/camera';
//import {actions} from './state/actions';
//// models
//import {Actor} from './models/stage/actors/actor.interface';  
//import {Action} from './models/actions/action.interface';
//import {vrcontrols} from './models/camera/controls/vrcontrols';  
//import {vrkeymap} from './models/camera/keymaps/vrkeymap';  
//// for actors/cloud/spritecloud.ts
//import TWEEN from '../libs/tween.js/tween.esm';



// singleton closure-instance variable
let narrative:Narrative,
    config:Config,
    //canvas:HTMLCanvasElement,       // DOM singularity 
    //context:Object,                //webGL context
    renderer:THREE.WebGLRenderer, // from state/stage
                                 // NOTE:renderer.render(sgscene,lens)
    //clock:THREE.Clock,          // uses perfomance.now() - fine grain
    //et:number = 0,             // elapsed time - clock starts at render start
    //frame:number = 0,         // frame index (as in rendered frames - fps)
    _stats = false,            // performance meter - update stats in render 
    stats:Stats,

    // actors
    cast:Record<string, Actor>,  //stage creates name-actor entries & 
      // registers them in cast via narrative.addSGActor(name, actor) 
      // for all actors in sgscene, or narrative.addVRActor(name, actor) 
      // for all actors in vrscene

    sgscene:THREE.Scene,
    rmscene:THREE.Scene,
    vrscene:THREE.Scene;


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
    console.log(`\nnarrative.bootstrap:`);
    console.log(`_config = ${_config} state = ${state}`);

    // initialize config
    config = _config;

    // TEMP !!!!!
    //console.log(`Stats = ${Stats}`);
    _stats = state['stage']['frame']['_stats'];
    console.log(`_stats = ${state['stage']['frame']['_stats']}`);
    stats = new window['Stats']();
    document.body.appendChild(stats.dom);
    if(_stats){
      stats.dom.style.display = 'block';  // show
    }else{
      stats.dom.style.display = 'none';  // hide
    }


    // initialize state 
    narrative.changeState(state);

    // connect to server?
    if(config.server_connect){
      //mediator.connect();
    }
  }



  // for actions (usually from server)
  // change state of framework states
  //async changeState(state:State):void{
  changeState(state:State):void{
    console.log(`\nnarrative.changeState state:`);
    console.dir(state);

    narrative.prerender();
    narrative.animate();
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



  // prepare render-loop actors, cameras, controls
  prerender(){
    // diagnostics - list all actors
    console.log(`\nprerender: reportActors():`);
    narrative.reportActors(true);

    // if _webxr adjust y-coord of displayed scene to adjust for webxr
    // camera position at (0,1.6,0)  (displayed_scene:'vr'|'sg')
    // NOTE: both lens and vrlens are modified by webxr:t to (0,1.6!,0) ?!
//    if(_webxr){
//      lens_offset = new THREE.Object3D();
//      lens_offset.position.y = -1.6;
//      lens_offset.add(lens);
//      sgscene.add(lens_offset);
//      if(displayed_scene === 'vr'){
//        vrlens_offset = new THREE.Object3D();
//        vrlens_offset.position.y = -1.6;
//        vrlens_offset.add(vrlens);
//        vrscene.add(vrlens_offset);
//        //vrscene.scale.set(10,10,10);
//      }
//    }
  }



  // reset params based on window resize event
  onWindowResize():void {
    //camera.aspect = window.innerWidth / window.innerHeight;
    //camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }



  // animate-render loop - et holds current elapsed time
  animate():void {
    console.log('narrative.animate()');
    //renderer.setAnimationLoop(narrative.render);
    narrative.render();
  }



  // render current frame - frame holds current frame number
  render():void {
    console.log('narrative.render()');
    //renderer.render( scene, camera );
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
    console.log('\nnarrative.reportActors()');
    if(display){
      for(const [k,v] of Object.entries(cast)){
        console.log(`cast contains actor ${v} with name ${k} and actor.name ${v.name}`);
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
