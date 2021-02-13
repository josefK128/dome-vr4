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
// CONFIG
// for initialization
const config = {


    // rendering topology
    topology:{
      // webxr?
      webvr: true,
     
      // displayed_scene = 'sg|rm|vr'
      displayed_scene: 'vr', 

      // render sgscene to sgTarget offscreen for bg texturing in rmscene
      // or texturing in vrscene
      sg: false,
      
      //'sg'|'rm'|'texture'|undefined
      //use frame n-1 sgTarget.tex ('sg') 
      //or rmTarget.tex ('rm') in sghud frame n
      //or image url OR undefined => NO sgpost/sghud
      sgpost: undefined,
  
      // rmstage or vrstage actors 
      sgTargetNames: [],
  
  
      // render rmscene to rmTarget offscreen for texturing in vrscene
      // NOTE! true=>must define rmquad and rmTargetName(s)
      rm: true,
  
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

      _vr_:true

    },//topology


    // initialization of canvas and renderer
    // canvas = document.createElement(canvas_id);
    // renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias:antialias, alpha:alpha} );
    // renderer.setClearColor(clearColor-rgb, clearAlpha);
    // put in rendering object [?]
    renderer:{
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
const state = {
    // NOTE: after initial creation of the camera, only modifications are 
    // allowed to camera - _camera is ignored
    // NOTE!: webvr:true => lens.position = [0, 1.6, 0] - avatar head position,
    // 1.6 meters 'tall'
    // since sgscene,vrscene are translated by 1.6 in y, in all
    // cases the scene and camera coincide at camera coords (0,0,0)
    camera: {
        vrlens: {
            _lens: true,
            fov: 90,
            near: 0.001,
            far: 100000,
        },
        fog: {
          color: 'white', //0x00ff00,
          near: 0.1,
          far: 1000 //default:100
        },
        controls: {
            _controls: true,
            controls: 'vr'
        }
    },

    // stage - initialization and management of stats performance meter,
    // and actors in one of two possible scenes, sgscene and/or vrscene
    stage: {
        frame: {
            _stats: true // fps monitor built by default - t/f => show/hide
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
        sgscene: {
        },

        rmscene: {
            _actors: true,
            actors: {
                'rmquad': {
                    factory: 'Rmquad',
                    url: './app/models/stage/actors/raymarch/rmquad',
                    options: {
                        color: 'white',
                        opacity: 1.0,
                        vsh: './app/models/stage/shaders/webgl2/vertex/vsh_rm_texquad.glsl',
                        fsh: './app/models/stage/shaders/webgl2/fragment/fsh_rm_positions_texquad.glsl',
                        transform: { t: [0.0, 0.0, -1.0] },
                        texture: './app/assets/images/glad.png' // test ONLY!   
                    }
                }
            } //actors
        },
        vrscene: {
            _actors: true,
            actors: {
                'axes': {
                    factory: 'Axes',
                    url: './app/models/stage/actors/environment/axes',
                    options: {
                        length: 10000,
                        // setting axes translation-y at -0.01 allows z-axis to be seen
                        transform: { t: [0.0, -0.01, -0.99] }
                    }
                },
                'unitcube': {
                    factory: 'Unitcube',
                    url: './app/models/stage/actors/objects/unitcube',
                    options: { wireframe: false,
                        color: 'red',
                        opacity: 1.0,
                        map: './app/assets/images/glad.png',
                        transform: { t: [0.0, 0.0, -0.5], e: [0.0, 0.0, 0.0], s: [0.05, 0.05, 0.05] }
                    }
                },
                //'vrskybox':{
                //   factory:'Skybox',
                //   url:'',
                //   options:{}
                // }
             
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
