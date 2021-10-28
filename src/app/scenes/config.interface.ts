// Config.interface.ts
// webGL2, es300 three.js ==0.125.2


// CONFIG
// [1] config:Config (interface) is used once for initialization
// [2] substates are dynamic - used for initialization AND subsequent variation
// [3] There are 3 substates:
//   stage,    // stage (scenegraph) 
//   camera, 
//   actions


export interface Config {

  // topology - rendering topology
  // NOTE: topologies 2,3 can NOT be used for VR since they produce 
  // 2D near-plane framebuffers which cannot be rendered in stereo.
  // Use of topologies 2/3 for VR is not prevented - but should not be chosen!
  topology:{
    // webxr? true => lens.position=[0, 1.6, 0] - avatar 1.6 meters 'tall'
    _webxr:boolean;  //NOTE:connection of VR headset turns off OrbitControls!!
    _test?:boolean; //test-assert
    topology:number;                 // {1,...,7}: sg=1;rm=2;vr=4 => rm->vr=6
    displayed_scene:string;         //'sg'|'rm'|'vr'


    // render sgscene either to display, or to sgTarget offscreen for 
    // bg texturing in rmscene or texturing in vrscene
    _sg:boolean;                  // render to sgTarget
    _sgpost?:boolean;            //post-pr with prv frame 
                                //use frame n-1 sgTarget.tex ('sg') 
                           //always set false !!! (commented out in n.render())
    sgTargetNames?:string[]; //actor names to be textured by sgTarget.texture
                            //these can be in vrscene or sgscene
    sgvrSkyboxFaces?:string[];  // if 'vrskybox' is in sgTargetNames then
                    // specify which of 6 faces to texture - default is all 6.
                   // faces are 'px' (positive-x) 'nx', 'py', 'ny', 'pz', 'nz'


    // render rmscene to display, or to rmTarget offscreen for texturing 
    // in vrscene - either skybox/skydome/etc. or actors
    // NOTE! true=>must define rmquad and if texturing - define rmTargetName(s)
    // raymarch - via fragment shader in rmquad ShaderMaterial
    _rm:boolean;             
    _rmpost?:boolean;       //post-pr with prv frame - 
                           //always set false !!! (commented out in n.render())
    rmTargetNames?:string[]; //actor names to be textured by rmTarget.texture
                            //these can be in vrscene or sgscene
    rmvrSkyboxFaces?:string[];  // if 'vrskybox' is in rmTargetNames then
                    // specify which of 6 faces to texture - default is all 6
                   // faces are 'px' (positive-x) 'nx', 'py', 'ny', 'pz', 'nz'


    // render vrscene - which implies displayed_scene = 'vr'
    _vr:boolean;

  },//topology
  

  // initialization of canvas and renderer
  // canvas = document.createElement(canvas_id);
  // renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias:antialias, alpha:alpha} );
  // renderer.setClearColor(clearColor-rgb, clearAlpha);
  renderer:{
    _stats:boolean;         //show fps
    canvas_id:string;
    clearColor:string;    // background color - exp THREE.Color('black')
    clearAlpha:number;   // 0.0 to 1.0 =>  1 opaque, 0 transparent - background
    alpha:boolean;      // true => canvas can be made transparent/semi-transp.
    antialias:boolean; // caution - true will slow performance
  },//renderer


  // actions/log/etc. communication
  server:{
    server_connect:boolean;
    server_host:string;
    server_port:number;
    log:boolean;
    channels:string[];
  }//server
}
