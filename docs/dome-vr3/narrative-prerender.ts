//dome-vr3:narrative.prerender()

  // prepare render-loop actors, cameras, controls
  prerender(){
    // diagnostics - list all actors
    console.log(`@@@ reportActors:`)
    narrative.reportActors(true);

    // if _webvr adjust y-coord of displayed scene to adjust for webvr
    // camera position at (0,1.6,0)  (displayed_scene:'vr'|'sg')
    // NOTE: both lens and vrlens are modified by webvr:t to (0,1.6!,0) ?!
    if(_webvr){
      lens_offset = new THREE.Object3D();
      lens_offset.position.y = -1.6;
      lens_offset.add(lens);
      sgscene.add(lens_offset);
      if(displayed_scene === 'vr'){
        vrlens_offset = new THREE.Object3D();
        vrlens_offset.position.y = -1.6;
        vrlens_offset.add(vrlens);
        vrscene.add(vrlens_offset);
        //vrscene.scale.set(10,10,10);
      }
    }


    // test
//    console.log(`\n\n#####################################`);
//    report(lens, 'lens');
//    report(vrlens, 'vrlens');
//    report(sgscene);
//    report(vrscene);
//    console.log(`#####################################\n\n`);
  
    // ensure cameras lookAt (0,0,0)
    lens.lookAt(new THREE.Vector3());      // (0,0,0)
    vrlens.lookAt(new THREE.Vector3());   // (0,0,0)

  
    //initial setting of sgTargetActors // (one per sgTargetName, if any)
    if(_sg){
      for(let name of sgTargetNames){
        //console.log(`narrative: sgTargetName = ${name}`);
        let actor = narrative.findActor(name);
        //console.log(`narrative: sgTargetActor[${name}] = ${actor}`);
        //console.dir(actor);
        if(actor){
          actor['name'] = name;    // for use in rendering logic (just below)
          sgTargetActors.push(actor);
        }
      }

      // initial scale of sgquad
      sgquad = narrative.findActor('sgquad');
      if(sgquad){
        let aspect = window.innerWidth/window.innerHeight,
            sx = sgquad.scale.x,
            sy = sgquad.scale.y;
        console.log(`\n@@@ prerender start; aspect=${aspect} sgquad.scale:`);
        console.dir(sgquad.scale);
        transform3d.apply({s:[aspect*sy/sx,1.0,1.0]}, sgquad);
        console.log(`\n@@@ prerender - after scaling sgquad; sgquad.scale:`);
        console.dir(sgquad.scale);
      }

      //sg spritecloud - must give default name 'sgcloud' !!!!!
      sgcloud = narrative.findActor('sgcloud');
      if(sgcloud){
        _sgcloud = true;
      }

    }//if(_sg)
      
  
    // get reference to rmquad if _rm:true
    if(_rm){
      //initial setting of rmTargetActors (one per rmTargetName, if any)
      for(let name of rmTargetNames){
        //console.log(`narrative: rmTargetName = ${name}`);
        let actor = narrative.findActor(name);
        //co/nsole.log(`narrative: rmTargetActor[${name}] = ${actor}`);
        //console.dir(actor);
        if(actor){
          actor['name'] = name;    // for use in rendering logic (just below)
          rmTargetActors.push(actor);
        }
      }

      // raymarch
      rmquad = narrative.findActor('rmquad');
      console.log(`\n@@@ prerender rmquad=${rmquad}`);
      console.log(`\n@@@ prerender rm_npositions=${rm_npositions}`);

      //NOTE: this section is highly dependent on the raymarch shader values:
      // rm_npositions = config.rm_npositions is the number of independent
      // raymarch object positions.
      // 0 < rm_npositions <=1000 is required for raymarch
      //
      // N=100 is a good number of positions allowed (probably can be 1000)
      // n_positions is the cpu buffer address for the corresponding gpu
      // fragment shader uniform (var) rmquad.material.uniforms.n_positions.
      //
      // n_positions can be less than this meaningful length N, but then 
      // positions with indices exceding n_positions will NOT be seen.
      // n_positions can NEVER be more than N (equality is OK)
      //NOTE: a positions index can also be ignored if it has a z-value of 0.0.
      // Thus new THREE.Vector3() is ignored in the shader and the next
      // positions vector is considered.
      // RECALL!: zero is false! so condition is false if rm_npositions===0
      if(rmquad && rm_npositions){

        // initialize rm_positions and load values to uniform positions
        let positions = rmquad.material.uniforms.positions,
            n_positions = rmquad.material.uniforms.n_positions;
  
        // create rm_positions - initialize values for procedural animation
        // NOTE:rm_positions[j].z === 0.0 => position is ignored in raymarch
        // min-distance position-to-ray search 
        //rm_positions = Array(rm_npositions).fill(new THREE.Vector3(0.0,,1.0,-2.0));
        // NOTE ?! 
        // the for-loop is needed to ensure each new animation does not
        // remove the previous one ?!
        rm_positions = Array(rm_npositions).fill(new THREE.Vector3());
        for(let i=0; i<rm_npositions; i++){
          rm_positions[i] = new THREE.Vector3(0.0,0.0,0.0);
        }

        // set buffers for GPU
        positions.value = rm_positions;
        n_positions.value = rm_npositions;
  
        // create timeline for raymarch animations
        rm_timeline = new TimelineMax({delay:1, repeat:-1, repeatDelay:2,
          onUpdate:function(){
            //positions.value = rm_positions.slice(0);  //clone of rm_positions
            positions.value = rm_positions;
            positions.needsUpdate=true;
          },
          onRepeat:function(){
            // check TTL for all tweens - remove tween from timeline
            // tl.remove(positions[j]) - check!
            // positions[j].z = 0.0;
          }
        });

        // attach rm_timeline and rm_positions to narrative so they may be 
        // accessed by services/animation.ts
        narrative['rm_timeline'] = rm_timeline;
        narrative['rm_positions'] = rm_positions;

      }//if(rmquad)
    }//if(_rm)
  
 
    // initial scale of vrquad
    vrquad = narrative.findActor('vrquad');
    if(vrquad){
      let aspect = window.innerWidth/window.innerHeight,
          sx = vrquad.scale.x,
          sy = vrquad.scale.y;
      console.log(`\n@@@ prerender start; aspect=${aspect} vrquad.scale:`);
      console.dir(vrquad.scale);
      transform3d.apply({s:[aspect*sy/sx,1.0,1.0]}, vrquad);
      console.log(`\n@@@ prerender - after scaling vrquad; vrquad.scale:`);
      console.dir(vrquad.scale);
    }

    //vr spritecloud - must give default name 'vrcloud' !!!!!
    vrcloud = narrative.findActor('vrcloud');
    console.log(`\n\n\n\n\n\n\n\n\n\n &&&&&&&&&&&&& vrcloud = ${vrcloud}`);
    console.dir(vrcloud);
    if(vrcloud){
      _vrcloud = true;
    }
    console.log(`vrcloud = ${vrcloud}`);


    // start controls
    if(displayed_scene === 'vr'){
      if(_controls){
        let vrglobe = narrative.findActor('vrglobe');
        
        console.log(`narrative: starting mouse-controls vrscene.position:`); 
        console.dir(vrscene.position);
        if(vrglobe){
          console.log(`narrative: starting keymap-controls vrglobe.position:`); 
          console.log(`NOTE: vrglobe position is in vrscene-vrlens coords:`); 
          console.dir(vrglobe.position);
        }
  
        // start mouse-listening in controls, key-listening in keymap
        controls['start'](vrscene, canvas);
        keymap['start'](vrscene, _webvr, vrglobe);
      }
    }else{                             // displayed_scene='sg'
      // start controls
      if(_controls){
        let sgglobe = narrative.findActor('sgglobe');

        console.log(`narrative: starting mouse-controls vrscene.position:`); 
        console.dir(vrscene.position);
        if(sgglobe){
          console.log(`narrative: starting controls sgglobe.position:`); 
          console.log(`NOTE: sgglobe position is in sgscene-lens coords:`); 
          console.dir(sgglobe.position);
        }
  
        // start mouse-listening in controls, key-listening in keymap
        controls['start'](sgscene,canvas);
        keymap['start'](sgscene, _webvr, sgglobe);
      }
    }
  }//prerender()

