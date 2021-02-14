// state.interface.ts
// only inner properties are typed.
// outer group-containers are type Record<string:unknown>
// NOTE: unknowns must be narrowed before assignment to variables

export interface State {
  // NOTE: an initial camera is created so only modifications are allowed.
  // NOTE!: webxr:true => lens.position = [0, 1.6, 0] - avatar head position,
  camera:{
    sg?:{
      lens?:{
        _lens?:boolean,
        fov?:number,
        near?:number,
        far?:number,
        transform?:Record<string,number[]>
      },
      fog?:{           //sgscene.fog = new Fog(color,near,far)-default:f
        color?:string|number,          //default:'white'|0xffffff
        near?:number,                 //default:.01
        far?:number                  //default:100
      },
      controls?:{
        _controls?:boolean,
        controls?:string
      },
      csphere?:{
        _visible:boolean,
        _wireframe:boolean,
        opacity:number,
        color:string,
        hud?: {
          _post:boolean,
          _hud_rendered:boolean,
          fsh: string,
          opacity:number,
          scaleX:number,
          scaleY:number
        },//hud
        key?: {
          color:string,
          intensity:number,
          distance:number,  // 0 => infinite range of light
          position:number[]
        },//key
        fill?: { 
          color:string,
          intensity:number,
          distance:number,  // 0 => infinite range of light
          position:number[]
        },//fill
        back?: {
          color:string,
          intensity:number,
          distance:number,  // 0 => infinite range of light
          position:number[]
        }//back
      }//csphere
    },//sg

    vr?:{
      lens?:{
        _lens?:boolean,
        fov?:number,
        near?:number,
        far?:number,
        transform?:Record<string,number[]>   //moves vrscene rel to vrlens 
      },
      fog?:{           //vrscene.fog = new Fog(color,near,far)-default:f
        color?:string|number,          //default:'white'|0xffffff
        near?:number,                 //default:.01
        far?:number                  //default:100
      },
      controls?:{
        _controls?:boolean,
        controls?:string
      }
    }//vr
  }


  // stage - default stage is empty. 
  // booleans are in sub-states frame/_stats, cast/_actors
  stage:{
    frame?:{
      _stats:boolean   // fps monitor - t/f => show/hide
    },
  
    // _actors:true => create actors; false => remove actors 
    // actors object non-empty => iterate through actors
    // sg (scenegraph) is the first stage scene  
    sgscene?:{
      _actors?:boolean,
      actors?:{    
        [name:string]:{      // name of actor
          factory:string,
          url:string,
          options:Record<string,unknown>  // options (Record<string,unknown>) is            // specific to each actor type
            // see documentation at top of each actor
        }
      }
    },

    // raymarch - pure fragment-shader generated scene on rendered quad,
    // rendered to rmTarget and then rmTarget.texture used in vrscene
    // one quad actor needed to specify fragment shader (and token vertex 
    // shader as part of a Shadermaterial. quad is rendered to rmTarget,
    // or if displayed_scene='rm' rendered to screen
    //
    // NOTE!!! - to use rm texture or raymarch fsh rendering 
    // [1] rmquad MUST be an rmscene rm-actor, and 
    // [2] there MUST exist a vrscene vr-actor whose name is in 
    // config.rmTargetNames
    rmscene?:{
      _actors?:boolean,
      actors?:{    
        [name:string]:{      // name of actor
          factory:string,
          url:string,
          options:Record<string,unknown>  // options (Record<string,unknown>) is            // specific to each actor type
            // see documentation at top of each actor
        }
      }
    },

    // vr (vr-headset) is the 3rd stage vrscene 
    vrscene?:{
      _actors?:boolean,
      actors?:{    
        [name:string]:{      // name of actor
          factory:string,
          url:string,
          options:Record<string,unknown>  // options is specific to each 
            // actor type - see documentation at top of each actor
        }
      }
    }
  }//stage,


  audio:{
    _audio?:boolean,
    url?:string,
    refDistance?:number,
    maxDistance?:number,
    playbackRate?:number,
    volume?:number,
    loop?:boolean,
    delay?:number,
    play?:boolean,
    pause?:boolean,
    stop?:boolean
  }


  actions:{
    _actions?:boolean,
    sequence_url?:string
  }
}

