// scene: scene.ts
// webGL2, es300 three.js >=0.124.0
// 
// [1] config:Config (interface) is used once for initialization
// [2] substates are dynamic - used for initialization AND subsequent variation
// [3] There are 3 substates:
//   stage,    // stage (scenegraph) 
//   camera, 
//   LATER - actions
//
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
// NOTE: initial_camera is a configuration object - not a substate

// all substate property objects are optional so a non-trivial state change
// could consist of as few as one substate - for example:
// delta0 = {
//   stage: {cube: {}}  // replace original cube (or no cube) with new cube
// }
//
// NOTE: stateChange action has form:
// { t:'narrative',
//   f:'changeState',
//   a:'o',
//   o: {stage: {cube:{}},   // delta0 state
//   ms: 0}                  // immediate
//
// NOTE: see models/actions/action.interface.ts


// import scene.interface - enforces required properties 
// NOTE: ../config.interface is relative to location of this file
import {Config} from '../config.interface';
import {State} from '../state.interface';


// CONFIG
// for initialization
const config:Config = {

  // imports - needed node_module/jsm libraries urls - relative to
  // index.html <base href='/dist/'
  imports:[
    //'../src/jsm/stats/stats.module.js',
    //'../node_modules/socket.io-client/dist/socket.io.js',
    //'../node_modules/gsap/umd/Tweenmax.js'
  ],


  //rendering topology
  // webVR?
  webvr:true,
  displayed_scene:'vr',   //'sg'|'vr'


  // sg-stage
  sg:false,                        //render sgscene
  sgpost:undefined,               //post-pr with prv frame 
                                 //'sg'|'rm'|'texture'|undefined
                                //use frame n-1 sgTarget.tex ('sg') 
                               //or rmTarget.tex ('rm') in sghud frame n
                              //or image url OR undefined => NO sgpost/sghud
  sgTargetNames:[],  //actor names to be textured by sgTarget.texture

  // rm-stage and vr-stage
  rm:true,               //render to rmTarget for raymarch texture in vr
                            //NOTE! true=>must define rmquad and rmTargetName(s)
  rmTargetNames:['vrcube'], //actor names to be textured by rmTarget.texture
  //skyfaces:string[];     //used if actor 'skyfaces' exists and is rmTgtName
                         //value is some subset of ['f','b','l','r','t','g']
                        //order-independent: front,back,left,right,top,ground

  // raymarch - via fragment shader in rmquad ShaderMaterial
  // NOTE! obviously requires rm:t and a vr-actor name in rmTargetNames
  rm_npositions:100,  //number of raymarch obj positions (pos.z=0=>ignored)
                         //these are positions of raymarch objects which can
                        //be animated using declarative actions in sequences
                       //NOTE! <=1000 - more effects performance but positions
                      //defined in animation with pos.z=0 are ignored

  // vr
  vrfog:{          //vrscene.fog = new Fog(color,near,far) - default:false
    color:0x00ff00, //hex - default:0xffffff
    near:0.1, //default:.01
    far:1000  //default:100
  },


 
// initialization of canvas and renderer
// canvas = document.createElement(canvas_id);
// renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias:antialias, alpha:alpha} );
// renderer.setClearColor(clearColor-rgb, clearAlpha);
  canvas_id: 'webgl',
  clearColor:'black',
  clearAlpha: 1.0,    // opaque
  alpha:true,     
  antialias:false,  // webGL2 needs antialias false as of oct 2019 ????? 


  // test? Uses mockmediator or server-mediator
  // best to set false if sequence:true
  test:false,


  // actions targets - for director service
  // NOTE: 'narrative' and 'animation' are ALWAYS targets
  // narrative.bootstrap sets config.targets
  targets: {narrative:{},
            animation:{}},

  // acions/log/etc. communications
  server_connect: false,
  server_host: 'localhost',
  server_port: 8081,   // channels
  log: false,
  channels:['actions', 'log']
};



// STATE
// for initialization AND subsequent changeState actions 
const state:State = {
  // NOTE: after initial creation of the camera, only modifications are 
  // allowed to camera - _camera is ignored
  // NOTE!: webvr:true => lens.position = [0, 1.6, 0] - avatar head position,
  // 1.6 meters 'tall'
  // since sgscene,vrscene are translated by 1.6 in y, in all
  // cases the scene and camera coincide at camera coords (0,0,0)
  camera:{
    lens: {
      _lens:true,   // t|undefined => create or modify, but no deletion
      fov:90,
      near: 0.001,
      far: 100000,
    },//lens
    controls:{
      _controls:true,  // t|f => create or delete
      controls:'vr'
    }
  },//camera


  // stage - initialization and management of stats performance meter,
  // and actors in one of two possible scenes, sgscene and/or vrscene
  stage:{
    frame:{
      _stats: true    // fps monitor built by default - t/f => show/hide
    },

    // there are two possible and possibly co-existing scenes - sgscene which
    // renders a 3D-scene possibly off-screen to sgTarget, and vrscene
    // which renders a VR scene to a headset possibly using sgTarget.texture
    // as a texture map within vrscene
    //
    // The actors for each are created by the 'stage' state and then added
    // to the respective 'cast' and 'scene' via the narrative interfaces of
    // narrative.addActor or narrative.addVRActor respectively.
    //
    // Each follows the following syntax:
    // _actors:true=>create actors; false=>remove actors, undefined=>modify 
    // actors object non-empty => iterate through actors by key 'names'
//    sgscene: {
//    },

    rmscene: {
      _actors:true,
      actors:{
        'rmquad':{ 
          factory:'Rmquad',
          url:'./app/models/stage/actors/raymarch/rmquad',
          options:{
                color:'white', 
                opacity:1.0, 
                vsh:'./app/models/stage/shaders/webgl2/vertex/vsh_rm_texquad.glsl',
                fsh:'./app/models/stage/shaders/webgl2/fragment/fsh_rm_positions_texquad.glsl',
                transform:{t:[0.0,0.0,-1.0]}, //default {} => no transform
                texture:'./app/assets/images/glad.png'  // test ONLY!   
          } 
        }
      }//actors
},//rmscene


    vrscene:{
      _actors:true,
      actors:{
        'axes':{ 
          factory:'Axes',
          url:'./app/models/stage/actors/environment/axes',
          options:{
            length:10000,     // default=10000
            // setting axes translation-y at -0.01 allows z-axis to be seen
            transform:{t:[0.0,-0.01,-0.99]}
          }
        },

        'unitcube':{ 
          factory:'Unitcube',
          url:'./app/models/stage/actors/objects/unitcube',
          options:{wireframe:false, 
                color:'red', 
                opacity:1.0, 
                map:'./app/assets/images/glad.png',
                transform:{t:[0.0,0.0,-0.5],e:[0.0,0.0,0.0],s:[0.05,0.05,0.05]}
          } 
        },

        //NOTE: name is vrquad (although should be vrcube) so rmquad renders
        //texture to cube (object named vrquad)
        'vrcube':{ 
          factory:'Unitcube',
          url:'./app/models/stage/actors/objects/unitcube',
          options:{
            wireframe:false,
            color:'white', 
            opacity:1.0, 
            // place ground at y=0.0; lens/vrlens view is at y=1.6 (meters)
            // NOTE: sz=-1000 inverts the normals thus correcting 
            // the 'backwards' facing texture-map 
            transform:{t:[0.0,0.0,0.0], s:[1000.0,1000.0,-1000.0]}
          } 
        }

      }//actors
    }//vrscene

  }, //stage


  // actions - default fifo=[] in queue
  // _actions = t/f/undefined => load seq/remove seq:load []/append seq
  // sequence is array of actions {t:, f:, o:, ms:}
  // dt/et are in decimal seconds!!!
  // actions:{_actions:boolean,
  //          sequence_url:string}  // sequence is url of specific sequence 
  //                               // array of Action-Objects 
  //                              // (see models/actions/sequence.interface.ts
  actions: {
    _actions:true,
    sequence_url: './app/models/actions/sequences/bezier/rmbezier-actorbezier'
  }//actions:{}
};


export {config, state};
