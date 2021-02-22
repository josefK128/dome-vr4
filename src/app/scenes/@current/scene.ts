// @current/scene.ts
// webGL2, es300 three.js ==0.125.2
 

// CONFIG
// [1] config:Config (interface) is used once for initialization
// [2] substates are dynamic - used for initialization AND subsequent variation
// [3] There are 4 substates:
//   stage,    // stage (scenegraph) 
//   camera, 
//   audio
//   actions


import {Config} from '../config.interface';
import {State} from '../state.interface';



const config:Config = {

    // rendering topology
    topology:{
      // webxr?
      _webxr: true,
     
      // displayed_scene = 'sg|rm|vr'
      displayed_scene: 'vr', 


      // render sgscene either to display, or to sgTarget offscreen for 
      // bg texturing in rmscene or texturing in vrscene
      _sg: false,
      
      //'sg'|'rm'|'texture'|undefined
      //use frame n-1 sgTarget.tex ('sg') 
      //or rmTarget.tex ('rm') in sghud frame n
      //or image url OR undefined => NO sgpost/sghud
      sgpost: undefined,
  
      // rmstage or vrstage actors 
      sgTargetNames: [],
  
  
      // render rmscene to display, or to rmTarget offscreen for texturing 
      // in vrscene - either skybox/skydome/etc. or actors
      // NOTE! true=>must define rmquad and rmTargetName(s)
      _rm: false,
  
      rmTargetNames: ['vrcube'],
      //skyfaces:string[];  //used if actor 'skyfaces' exists and is rmTgtName
      //value is some subset of ['f','b','l','r','t','g']
      //order-independent: front,back,left,right,top,ground
      // raymarch - via fragment shader in rmquad ShaderMaterial
      // NOTE! obviously requires rm:t and a vr-actor name in rmTargetNames
    
      //these are positions of raymarch objects which can
      //be animated using declarative actions in sequences
      //NOTE! <=1000 - more effects performance but positions
      //defined in animation with pos.z=0 are ignored
      rm_npositions: 100,


      // render vrscene - which implies displayed_scene = 'vr'
      _vr:true,

      //'vr'|'texture'|undefined
      //use frame n-1 vrTarget.tex ('vr') in sghud frame n
      //or image url OR undefined => NO sgpost/sghud
      vrpost: undefined,

    },//topology


    // initialization of canvas and renderer
    // canvas = document.createElement(canvas_id);
    // renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias:antialias, alpha:alpha} );
    // renderer.setClearColor(clearColor-rgb, clearAlpha);
    // put in rendering object [?]
    renderer:{
      _stats:true,
      canvas_id: 'webgl',
      clearColor: 'black',
      clearAlpha: 1.0,
      alpha: true,
      antialias: false
    },


    // actions/log/etc. server communications
    server:{
      server_connect: false,
      server_host: 'localhost',
      server_port: 8081,
      log: false,
      channels: ['actions', 'log']
    },
};



// STATE
// for initialization AND subsequent changeState actions 
// NOTE: media assets are relative to <base href='/dist/'> so exp.
// dist/app/media/images/glad.png in scene is:
// ./app/media/images/glad.png
// NOTE: actors are relative to dist/app/state/stage.js so exp.
// dist/app/models/stage/actors/environment/panorama.js is:
// ../models/stage/actors/environment/panorama.js is:

// A substate which is undefined (not allowed by interface) or {} is IGNORED.
// the use of a non-empty substate object implies that a creation/deletion or
// modification of substate properti(es) is requested.
//
// there are two cases for substate or substate-property change:
// Let p be a substate or substate-property:
// state entries have the form:  p:{_p:boolean; ...} 
//   _p true => create new p using properties listed (previous p deleted first)
//   _p false => if object[p] does not exist - ignore. If object[p] exists,
//      set p to undefined to remove and ignore for rendering scene 
//   _p undefined => modify the properties listed (no effect on non-existent p)
// NOTE: in the special case of substate 'action': 
//   _action:true => set queue.fifo = actions
//   _action:false => set queue.fifo = []
//   _action undefined => append actions to queue.fifo
// NOTE: substate camera only creates the initial_camera or modifies 
// properties - it is NEVER removed or replaced


const state:State = {
    // NOTE: after initial creation of the camera, only modifications are 
    // allowed to camera - _camera is ignored
    // NOTE!: webxr:true => lens.position = [0, 1.6, 0] - avatar head position,
    // 1.6 meters 'tall'
    // since sgscene,vrscene are translated by 1.6 in y, in all
    // cases the scene and camera coincide at camera coords (0,0,0)
    camera: {
        vr:{
          lens: {
            _lens: true,
            fov: 90,
            near: 0.001,
            far: 100000,
            transform: {'t':[0,0,0]}
          },
          fog: {
            _fog: true,
            color: 'pink', //0x00ff00,
            near: 0.1,
            far: 200 //default:100
          }
          //controls: {
          //  _controls: true,
          //  controls: 'vr'
          //},
          //csphere: {
          //}
        }
    },

    // stage - initialization and management of stats performance meter,
    // and actors in one of two possible scenes, sgscene and/or vrscene
    stage: {
        // each scene the has two properties:
        // _actors:true=>create actors; false=>remove actors, undefined=>modify 
        // actors:Record<string,Actor>[] => iterate through actors by 'name'
        vrscene: {
            _actors: true,
            actors: {
                'axes': {
                    factory: 'Axes',
                    url: '../models/stage/actors/objects/axes.js',
                    options: {
                        length: 10000,
                        // setting axes translation-y at -0.01 allows z-axis to be seen
                        transform: { t: [0.0, 0.0, -0.99] }
                    }
                },
                'unitcube': {
                    factory: 'Unitcube',
                    url: '../models/stage/actors/objects/unitcube.js',
                    options: { wireframe: false,
                        color: 'white',
                        opacity: 0.8,
                        map: './app/media/images/glad.png',
                        transform: { t: [0.0, 0.15, -0.99], e: [0.0, 0.0, 0.0], s: [0.2, 0.3, 0.2] }
                    }
                },
                'panorama':{
                    factory:'Panorama',
                    url:'../models/stage/actors/environment/panorama.js',
                    options:{
                      texture_url:'./app/media/images/cube/sun_temple_stripe_stereo.jpg',
                      ntextures:12
                    }
                }
            } //actors
        } //vrscene
    },


    // audio
    audio:{
        _audio:false
    },


    // actions - default fifo=[] in queue
    // _actions = t/f/undefined => load seq/remove seq:load []/append seq
    // sequence is array of actions {t:, f:, o:, ms:}
    // dt/et are in decimal seconds!!!
    // actions:{_actions:boolean,
    //          sequence_url:string}  // sequence is url of specific sequence 
    //                               // array of Action-Objects 
    //                              // (see models/actions/sequence.interface.ts
    actions: {
        _actions: true,
        sequence_url: './app/models/actions/sequences/bezier/rmbezier-actorbezier'
    } //actions:{}
};



export { config, state };
//# sourceMappingURL=scene.js.map
