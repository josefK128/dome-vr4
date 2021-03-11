// dome-vr3 narrative.ts

// scene
import {Config} from './scenes/config.interface';
import {State} from './scenes/state.interface';
// services
import {mediator} from './services/actions/mediator';
import {director} from './services/actions/director';
import {queue} from './services/actions/queue';
import {transform3d} from './services/transform3d';
import {animation} from './services/animation';
// state
import {stage} from './state/stage';
import {camera} from './state/camera';
import {actions} from './state/actions';
// models
import {Actor} from './models/stage/actors/actor.interface';  
import {Action} from './models/actions/action.interface';
import {vrcontrols} from './models/camera/controls/vrcontrols';  
import {vrkeymap} from './models/camera/keymaps/vrkeymap';  
// for actors/cloud/spritecloud.ts
import TWEEN from '../libs/tween.js/tween.esm';


// singleton closure-instance variable
var narrative:Narrative,
    config:Config,
    canvas:HTMLCanvasElement,       // DOM singularity 
    context:Object,                //webGL context
    renderer:THREE.WebGLRenderer, // from state/stage
                                 // NOTE:renderer.render(sgscene,lens)
    clock:THREE.Clock,          // uses perfomance.now() - fine grain
    et:number = 0,             // elapsed time - clock starts at render start
    frame:number = 0,         // frame index (as in rendered frames - fps)
    _stats:boolean = false,  // performance meter - update stats in render 
    stats:Stats,

    // actors
    cast:Object = {},  //stage creates name-actor entries & registers them in
      // cast via narrative.addSGActor(name, actor) for all actors in sgscene 
      // or narrative.addVRActor(name, actor) for all actors in vrscene

    // cameras, controls
    lens:THREE.PerspectiveCamera,      // from state/camera
                   // NOTE:TBD 'csphere' is whole apparatus - lens, lights etc
    lens_offset:THREE.Object3D,      // _webvr:t => lower camera by 1.6
    vrlens:THREE.PerspectiveCamera, // separate camera for rendering vrscene
    vrlens_offset:THREE.Object3D, // _webvr:t => lower camera by 1.6
    _controls:boolean = false,   // use controls/keymap? 
                                // set by config.controls:boolean? default false
    controls:Object,           // vrcontrols
    keymap:Object,            // vrcontrols-keymap - vrkeymap

    // audio
    audioListener:THREE.AudioListener, //used in actors/audio

    // rendering topology
    _webvr:boolean = false,       // render to stereo headset-device 
    _sg:boolean=false,           //render sgscene
    _sgpost:string,             //use frame n-1 sgTarget.tex in sghud frame n   
    displayed_scene:string,    // 'sg'|'vr'
    _rm:boolean,              //render to rmTarget for raymarch texture in vr
    //_rmpost:boolean,         //use frame n-1 rmTarget.tex in rmquad frame n

    // sg
    sgscene:THREE.Scene,   // populated from state/stage - root of sg-scenegraph
    sgTargetNames:string[] = [],  //Actor-names to be textured by sgTgt.texture
    sgTargetActors:THREE.Object3D[] = [],  //Actors to be textured by sgTgt.tex
    sgTarget:THREE.WebGLRenderingTarget,  //off-screen framebuffer for sgscene
    sgquad:THREE.Object3D,
    sgpivot:THREE.Object, //to rotate sg_cloud
    sgcloud:THREE.Group,
    _sgcloud:boolean = false,

    // rm
    rmscene:THREE.Scene,  // populated from state/stage - root of rm-scenegraph
    rmTargetNames:string[] = [],  //Actor-names to be textured by rmTgt.texture
    rmTargetActors:THREE.Object3D[] = [],  //Actors to be textured by rmTgt.tex
    rmTarget:THREE.WebGLRenderingTarget,  //off-screen framebuffer for rmscene
    rmquad:THREE.Object3D,
    // raymarch animations values
    rm_timeline:TimelineMax,
    rm_positions:any[] = [],
    rm_npositions:number,

    // vr
    vrscene:THREE.Scene,  // populated from state/stage - root of vr-scenegraph
    vrquad:THREE.Object3D,
    vrpivot:THREE.Object, //to rotate vr_cloud
    vrcloud:THREE.Group,
    _vrcloud:boolean = false,

    // faces to render if actor 'skyfaces' included in [sg|rm]TargetNames
    skyfaces:string[] = [],


    // state booleans
    _test:boolean = false,     // run actions test - _test=config.test
    _rendering:boolean = false,  // set true at clock & render start


    // diagnostics
    report:Function = function(t:THREE.Object3D, name:string): void{
      let target:THREE.Vector3,
          targetq:THREE.Quaternion;

      if(!target){target = new THREE.Vector3()};
      if(!targetq){targetq = new THREE.Quaternion()};
      if(!name){name = t.name};
      
      if(t){
        console.log(`\n\n^^^^^^^^^^^^^^^^ report target ${name}:`);
        console.dir(t);
        console.log(`${name}.position:`);
        console.dir(t['position']);
        console.log(`${name}.worldPosition:`);
        console.dir(t['getWorldPosition'](target));
        /*
        console.log(`\n${name}.quaternion:);
        console.dir(t['quaternion']);
        console.log(`${name}.worldQuaternion:);
        console.dir(t['getWorldQuaternion'](targetq));
         */
        console.log(`\n`);
      }
    };
