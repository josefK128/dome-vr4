// Config.interface.ts
// webGL2, es300 three.js ==0.125.2


// CONFIG
// [1] config:Config (interface) is used once for initialization
// [2] substates are dynamic - used for initialization AND subsequent variation
// [3] There are 4 substates:
//   stage,    // stage (scenegraph) 
//   camera, 
//   audio
//   actions


export interface Config {

  // topology - rendering topology
  topology:{
    // webxr? true => lens.position=[0, 1.6, 0] - avatar 1.6 meters 'tall'
    _webxr:boolean;   //NOTE:_webxr:true turns off OrbitControls
    topology:number;                 // {1,...,7}: sg=1;rm=2;vr=4 => rm->vr=6
    displayed_scene:string;         //'sg'|'rm'|'vr'


    // render sgscene either to display, or to sgTarget offscreen for 
    // bg texturing in rmscene or texturing in vrscene
    _sg:boolean;                  // render to sgTarget
    _sgpost?:string;             //post-pr with prv frame 
                                //use frame n-1 sgTarget.tex ('sg') 
    sgTargetNames?:string[]; //actor names to be textured by sgTarget.texture
                            //these can be in vrscene or sgscene


    // render rmscene to display, or to rmTarget offscreen for texturing 
    // in vrscene - either skybox/skydome/etc. or actors
    // NOTE! true=>must define rmquad and if texturing - define rmTargetName(s)
    // raymarch - via fragment shader in rmquad ShaderMaterial
    _rm:boolean;             
    _rmpost?:boolean;         //post-pr with prv frame 
    rmTargetNames?:string[]; //actor names to be textured by rmTarget.texture
                            //these can be in vrscene or sgscene


    // render vrscene - which implies displayed_scene = 'vr'
    _vr:boolean;
    _vrpost?:string;              //post-pr with prv frame 
                                 //use frame n-1 vrTarget.tex in vrhud frame n
    vrTargetNames?:string[]; //actor names to be textured by vrTarget.texture
                            //these must be in vrscene such as vrhud
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
