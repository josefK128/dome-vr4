// Config.interface.ts
// only inner properties are typed.
// outer group-containers are type Record<string:unknown>
// NOTE: unknowns must be narrowed before assignment to variables

export interface Config {

  // topology - rendering topology
  topology:{
    // webxr? true => lens.position=[0, 1.6, 0] - avatar 1.6 meters 'tall'
    _webxr:boolean;
    displayed_scene:string;         //'sg'|'rm'|'vr'


    // render sgscene either to display, or to sgTarget offscreen for 
    // bg texturing in rmscene or texturing in vrscene
    _sg?:boolean,                  // render to sgTarget
    sgpost?:string,               //post-pr with prv frame 
                                 //'sg'|'rm'|'texture'|nothing
                                //use frame n-1 sgTarget.tex ('sg') 
                               //or rmTarget.tex ('rm') in sghud frame n
    sgTargetNames?:string[], //actor names to be textured by sgTarget.texture


    // render rmscene to display, or to rmTarget offscreen for texturing 
    // in vrscene - either skybox/skydome/etc. or actors
    // NOTE! true=>must define rmquad and if texturing - define rmTargetName(s)
    _rm?:boolean,             
    rmTargetNames?:string[], //actor names to be textured by rmTarget.texture
    skyfaces?:string[],     //used if actor 'skyfaces' exists and is rmTgtName
                         //value is some subset of ['f','b','l','r','t','g']
                        //order-independent: front,back,left,right,top,ground
    // raymarch - via fragment shader in rmquad ShaderMaterial
    // NOTE! obviously requires rm:t and a vr-actor name in rmTargetNames
    rm_npositions?:number,//number of raymarch obj positions (pos.z=0=>ignored)
                         //these are positions of raymarch objects which can
                        //be animated using declarative actions in sequences
                       //NOTE! <=1000 - more effects performance but positions
                      //defined in animation with pos.z=0 are ignored

    // render vrscene - which implies displayed_scene = 'vr'
    _vr?:boolean

  },//stage
  

  // initialization of canvas and renderer
  // canvas = document.createElement(canvas_id);
  // renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias:antialias, alpha:alpha} );
  // renderer.setClearColor(clearColor-rgb, clearAlpha);
  renderer:{
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
