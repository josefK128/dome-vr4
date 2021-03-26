// state.interface.ts
// only inner properties are typed.
// outer group-containers are type Record<string:unknown>
// NOTE: unknowns must be narrowed before assignment to variables


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


export interface State {
  // NOTE: an initial camera is created so only modifications are allowed.
  // NOTE!: webxr:true => lens.position = [0, 1.6, 0] - avatar head position,
  camera:{
    sg?:{
      lens?:{
        _lens?:boolean,      // t=>create, f=>delete undef=>modify
        _orbit?:boolean,    //t=>create OrbitControls (default false)
                           //NOTE:_webxr:true turns off OrbitControls
        fov?:number,
        near?:number,
        far?:number,
        transform?:Record<string,number[]>
      },
      fog?:{           //sgscene.fog = new Fog(color,near,far)-default:f
        _fog?:boolean,                 // t=>create, f=>delete undef=>modify
        color?:string,                //default:'white'
        near?:number,                //default:.01
        far?:number                 //default:100
      },
      controls?:{
        _controls?:boolean,   //true => attach sgcontrols (the controls can
                             //be any implementation of Controls interface but
                            //MUST be named '../camera/controls/sgcontrols.ts'
                           //target of control functions is 'sgcsphere' so
                          //obviously requires creation of 'sgcsphere'
        controls_speed?:number,  //default 0.1
        _keymap?:boolean,   //true => attach sgkeymap (the keymap can
                           //be any implementation of Keymap interface but
                          //MUST be named '../camera/keymaps/sgkeymap.ts'
                         //target is sgcsphere
        keymap_speed?:number  //default 0.01
      },
      csphere?:{
        _csphere:boolean,    // t=>create, f=>delete undef=>modify
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
        _lens?:boolean, // t=>create, f=>delete undef=>modify
        _orbit?:boolean,    //t=>create OrbitControls (default false)
                           //NOTE:_webxr:true turns off OrbitControls
        fov?:number,
        near?:number,
        far?:number,
        transform?:Record<string,number[]>   //moves vrscene rel to vrlens 
      },
      fog?:{           //vrscene.fog = new Fog(color,near,far)-default:f
        _fog?:boolean, // t=>create, f=>delete undef=>modify
        color?:string|number,          //default:'white'|0xffffff
        near?:number,                 //default:.01
        far?:number                  //default:100
      },
      controls?:{
        _controls?:boolean,   //true => attach vrcontrols (the controls can
                             //be any implementation of Controls interface but
                            //MUST be named '../camera/controls/vrcontrols.ts'
                           //target is entire vrscene (rotating/dollying scene
                          //is equivalent (by relative motion) to rotating
                         //and/or dollying the viewpoint in vrscene
        controls_speed?:number,  //default 0.1
        _keymap?:boolean,   //true => attach vrkeymap (the keymap can
                           //be any implementation of Keymap interface but
                          //MUST be named '../camera/keymaps/vrkeymap.ts'
                         //vrkeymap acts on vrscene (as above) but if 
                        //if vrcsphere is defined it will be 
                       //counter-rotated/translated so as to
                      //appear 'stationary' relative to the headset position.
                     //REASON - vrcsphere attached modeling-lights 
                    //(key,fill,back) remain fixed relative to headset-vpoint
        keymap_speed?:number  //default 0.01
      },
      csphere?:{
        _csphere:boolean,    // t=>create, f=>delete undef=>modify
        _visible?:boolean,
        _wireframe?:boolean,
        opacity?:number,
        color?:string,
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
    }//vr
  }


  // stage - default stage is empty. 
  // booleans are in sub-states frame/_stats, cast/_actors
  stage:{

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



  actions:{
    _actions?:boolean,
    sequence_url?:string
  }
}

