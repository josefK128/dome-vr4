// Config.interface.ts

export interface Config {

  // rendering topology
  //webVR?
  // NOTE!: webvr:true => lens.position = [0, 1.6, 0] - avatar head position,
  // 1.6 meters 'tall'
  // optional parameter defaults are boolean-false and string[]-[]
  webvr:boolean;
  displayed_scene:string;        //'sg'|'vr'

  // sgscene
  sg?:boolean;                // skip sgscene rendering
  sgfog?:{                   //sgscene.fog = new Fog(color,near,far)-default:f
    color?:number,          //default:0xffffff
    near?:number,          //default:.01
    far?:number           //default:100
  };
  sgpost?:string;                 //post-pr with prv frame 
                                 //'sg'|'rm'|'texture'|undefined
                                //use frame n-1 sgTarget.tex ('sg') 
                               //or rmTarget.tex ('rm') in sghud frame n
                              //or image url OR undefined => NO sgpost/sghud
  sgTargetNames?:string[];   //actor names to be textured by sgTarget.texture


  // rmscene
  rm?:boolean;               //render to rmTarget for raymarch texture in vr
                            //NOTE! true=>must define rmquad and rmTargetName(s)
  rmTargetNames?:string[]; //actor names to be textured by rmTarget.texture
  skyfaces?:string[];     //used if actor 'skyfaces' exists and is rmTgtName
                         //value is some subset of ['f','b','l','r','t','g']
                        //order-independent: front,back,left,right,top,ground

  // raymarch - via fragment shader in rmquad ShaderMaterial
  // NOTE! obviously requires rm:t and a vr-actor name in rmTargetNames
  rm_npositions?:number;  //number of raymarch obj positions (pos.z=0=>ignored)
                         //these are positions of raymarch objects which can
                        //be animated using declarative actions in sequences
                       //NOTE! <=1000 - more effects performance but positions
                      //defined in animation with pos.z=0 are ignored

  
  // vrscene
  // vrfog -> actor [?]
  vrfog?:{          //vrscene.fog = new Fog(color,near,far) - default:false
    color?:number, //hex - default:0xffffff
    near?:number, //default:.01
    far?:number  //default:100
  };


  // initialization of canvas and renderer
  // canvas = document.createElement(canvas_id);
  // renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias:antialias, alpha:alpha} );
  // renderer.setClearColor(clearColor-rgb, clearAlpha);
  // -> renderer object [?]
  canvas_id:string;
  clearColor:string;    // background color - exp THREE.Color('black')
  clearAlpha:number;   // 0.0 to 1.0 =>  1 opaque, 0 transparent - background
  alpha:boolean;      // true => canvas can be made transparent/semi-transp.
  antialias:boolean; // caution - true will slow performance


  // cut [?]
  // test? Uses mockmediator or server-mediator
  // best to set false if sequence:true
  test: boolean;


  // actions targets - for director service
  // NOTE: 'narrative' is ALWAYS a target
  targets:{narrative:Record<string,unknown>,
           animation:Record<string,unknown>};

  // actions/log/etc. communication
  server_connect:boolean;
  server_host:string;
  server_port:number;
  log:boolean;
  channels:string[];
}

