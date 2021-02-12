// dome-vr3.changeState()

  // for actions (usually from server)
  // change state of framework states
  async changeState(state:Object){
    console.log(`\nnarrative.changeState state:`);
    console.dir(state);

    // initialize states - asynch
    // NOTE: type of 'result' must match both the type of a resolved 
    // Promise.all (Object[]) AND the return type of a reject which is void.
    // Later, after reject is ruled out, result is cast to Object[]
    let result:any = await Promise.all([
      camera.delta(state['camera'] || {}),
      stage.delta(state['stage'] || {}, narrative),
      actions.delta(state['actions'] || {})
    ]).catch((e) => {
      console.error(`error is <state>.delta: ${e}`);
    });


    // initialization result
    console.log(`\n***narrative: changeState resolves to result:`);
    console.dir(result)

    for(let o of <Object[]>result){
      for(let [n,v] of Object.entries(o)){

        console.log(`\n*** n=${n}`);
        console.log(`*** v=${v}:`);
        console.dir(v);

        // camera
        // result contains lens
        if(n === 'camera'){
          console.log(`\n***narrative receives camera result:`);
          console.dir(v);
          if(v._lens){        // t|undefined
            lens = v.lens;   // t => set lens
          }                 // undef => lens modified - nothing to do
          if(v._controls !== undefined){  // t|f
            _controls = v._controls;     // set _controls = v._controls 

            // if _controls:true - camera creates controls and sends them back
            // as v.controls
            if(_controls){
              if(v.controls === 'vr'){
                controls = vrcontrols;
                keymap = vrkeymap;
                console.log(`narrative: setting controls = ${v.controls}`);
              }else{
                console.error(`unknown camera controls ${v.controls}`);
              }
            }
          }
        }


        // stage - _<obj> => create, remove or modify stage object or actor(s)
        // stage adds/removes actors to/from narrative.cast
        // result contains stats
        if(n === 'stage'){
          console.log(`\n***narrative receives stage result:`);
          console.dir(v);

          if(v['_stats'] !== undefined){
            _stats = v['_stats']; 
            if(_stats){
              stats.dom.style.display = 'block';  // show
            }else{
              stats.dom.style.display = 'none';  // hide
            }
          }
        }

        // actions - _actions:t/f/undefined => load, empty or append to queue
        // NOTE: queue.load(sequence), queue.load([]) and queue.append(seq)
        // all done in state/actions.ts - v._actions merely reports what was
        // done in state/actions.ts
        // _actions:undefined=>append(seq); _actions:true=>load(seq),
        //_actions:false=>load([])
        if(n === 'actions'){
          console.log(`\n***narrative receives actions result:`);
          console.dir(v);

          if(Object.keys(v).length >0){
            if(v._actions !== undefined){
              if(v._actions){
                console.log(`narrative: queue loaded w. actions sequence`);
              }else{
                console.log(`narrative: queue emptied, i.e loaded with []`);
              }
            }else{
              console.log(`narrative: queue appended w. actions sequence`);
            }
          }
        }

        
        // prepare render-loop; start clock; start animation-render loop
        if(!_rendering){
          _rendering = true;
          console.log(`\nnarrative:starting clock and render-loop in 1000ms..`);
          setTimeout(() => {
            narrative.prerender();
            clock.start();
            narrative.animate();
          },1000);
        }
      }
    }

  }//changeState

