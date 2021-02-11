// state.interface.ts
// @TODO Later import Stage and Camera interfaces and specify State
// properties as Stage and Camera respectively

export interface State {
  // NOTE: after initial creation of the camera, only modifications are 
  // allowed to camera - _camera is ignored
  // NOTE!: webvr:true => lens.position = [0, 1.6, 0] - avatar head position,
  // 1.6 meters 'tall'
  camera:{
    lens?:{
      _lens?:boolean,
      fov?:number,
      near?:number,
      far?:number,
      transform?:Record<string,unknown>
    },
    controls?:{
      _controls?:boolean,
      controls?:string
    }
  }

  // stage - default stage is empty. 
  // booleans are in sub-states frame/_stats, cast/_actors
  stage:{
    frame?:{
      _stats?:boolean   // fps monitor - t/f => show/hide
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
    // and/or feedback to rmscene and/or sgscene
    // one actor needed which specifies fragment shader (and token vertex
    // shader as part of a Shadermaterial for a quad which is rendered to
    // rmTarget
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

    // vr (vr-headset) is the 2nd stage vrscene 
    // If there is a vrscene sgscene renders off-screen to sgTarget and 
    // sgTarget.texture is used as a texture map within vrscene
    vrscene?:{
      _actors?:boolean,
      actors?:{    
        [name:string]:{      // name of actor
          factory:string,
          url:string,
          options:Record<string,unknown>  // options (Record<string,unknown>) 
            // is specific to each actor type  
            // see documentation at top of each actor
        }
      }
    }
  },
      
  actions:{
    _actions?:boolean,
    sequence_url?:string
  }
}

