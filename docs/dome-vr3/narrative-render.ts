//dome-vr3:narrative.render()

  // render current frame - frame holds current frame number
  render(){
    // RENDERING TOPOLOGY

    // _sgpost: 'sg'|'rm'|undefined
    // if _sgpost use frame n-1 sgTarget.tex ('sg') or rmTarget.tex as
    // sgposthud texture in frame n
    //if(_sgpost){
      // TBD
      //if(_sgpost === 'sg'{
        //sghud.material.uniforms.tDiffusePOST.value = sgTarget.texture;
      //}else{
        //sghud.material.uniforms.tDiffusePOST.value = rmTarget.texture;
      //}
      //sghud.material.uniforms.tDiffusePOST.needsUpdate = true;
    //}


    if(displayed_scene === 'vr'){  // 2-3 stages

      //[1]SG STAGE
      if(_sg){
        renderer.setRenderTarget(sgTarget);
        renderer.render(sgscene, lens);

        // animate sgscene spritecloud
        if(_sgcloud){
          //period = 0.1 + Math.random() * 0.1;  //period = 0.001;
          let period = 0.01 + 0.01*Math.random();  //period = 0.001;
          for (let i = 0, l = sgcloud.children.length; i < l; i ++ ) {
            let sprite = sgcloud.children[ i ];
            let material = sprite.material;
            // orig - exceeds screen to much
            //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 1.0;
            // more constrained
            // orig
            //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 0.5;
            //scale = Math.sin( et + sprite.position.z * 0.01 ) * 0.3 + 0.5;
            let scale = Math.sin( et + sprite.position.z * 0.1 ) * 0.3 + 0.5;
            let imageWidth = 1;
            let imageHeight = 1;
            if(material.map && material.map.image && material.map.image.width){
              imageWidth = material.map.image.width;
              imageHeight = material.map.image.height;
            }
  
            material.rotation += period * 0.1;     // ( i / l ); 
            sprite.scale.set( scale * imageWidth, scale * imageHeight, 1.0 );
          }
          // EXPT!!!!! - no spritegroup rotation in X or Y
          //spritegroup.rotation.x = et * 0.5;
          //spritegroup.rotation.y = et * 0.75;
          //spritegroup.rotation.z = et * 1.0;
          //sgpivot.rotation.x = et * 0.2;
          //cloud_pivot.rotation.y = et * 0.4;
          sgpivot.rotation.x = et * 0.2; //0.6;
          sgpivot.rotation.z = et * 0.3; //0.6;

          //sgcloud.rotation.x = et * 0.2;
          //sgcloud.rotation.y = et * 0.4;
          //sgcloud.rotation.z = et * 0.3; //0.6;
        }

 
        // texture map actors (if any) in sgTargetActors with sgTarget.texture
        for(let actor of sgTargetActors){
          if(actor['name'] === 'skyfaces'){     //'skyfaces'
  
            // f is R, b is L, l is T, r is G, t is F, g is B ?!
            // so must permute indices to get intuitive visual mapping:
            // f=>4,  b=>5, l=>1, r=>0, t=>2, g=>3 (g is 'ground, i.e bottom)
            if(skyfaces.includes('f')){
              actor['material'][4]['map'] = sgTarget.texture;  // correct
              actor['material'][4]['map'].update = true;
            }
            if(skyfaces.includes('b')){  //correct
              actor['material'][5]['map'] = sgTarget.texture;  
              actor['material'][5]['map'].update = true;
            }
            if(skyfaces.includes('l')){
              actor['material'][1]['map'] = sgTarget.texture; // correct
              actor['material'][1]['map'].update = true;
            }
            if(skyfaces.includes('r')){
              actor['material'][0]['map'] = sgTarget.texture;  // correct
              actor['material'][0]['map'].update = true;
            }
            if(skyfaces.includes('t')){
              actor['material'][2]['map'] = sgTarget.texture;
              actor['material'][2]['map'].update = true;
            }
            if(skyfaces.includes('g')){
              actor['material'][3]['map'] = sgTarget.texture;
              actor['material'][3]['map'].update = true;
            }
          }else{                              // name other than 'skyfaces' 
            // actor 'rmquad' is handled below
            // Both are special cases of ShaderMaterials and alpha blending,
            // not simple texture maps
            if(actor['name'] !== 'rmquad'){
              actor['material']['map'] = sgTarget.texture;
              actor['material']['map'].update = true;
              actor['material'].needsUpdate = true;
            }
          }
        }
      }//_sg true => SG stage


      // [2]RM STAGE
      if(_rm){
        if(sgTargetActors.includes('rmquad')){
          // map sgTarget.texture frame n to rmquad.material
          if(rmquad.material.uniforms){
            rmquad.material.uniforms.tDiffuse.value = sgTarget.texture;
            rmquad.material.uniforms.tDiffuse.needsUpdate = true;
          }else{
            rmquad.material.map = sgTarget.texture;
            rmquad.material.needsUpdate = true;
          }
        }


        // use raymarch in fragment shader fsh to 
        // render rmscene to rmTarget frame n
        renderer.setRenderTarget(rmTarget);
        renderer.render(rmscene, lens);        

        // texture map actors (if any) in rmTargetActors with rmTarget.texture
        for(let actor of rmTargetActors){
          if(actor['name'] === 'skyfaces'){     //'skyfaces'
  
            // f is R, b is L, l is T, r is G, t is F, g is B ?!
            // so must permute indices to get intuitive visual mapping:
            // f=>4,  b=>5, l=>1, r=>0, t=>2, g=>3 (g is 'ground, i.e bottom)
            if(skyfaces.includes('f')){
              actor['material'][4]['map'] = rmTarget.texture;  // correct
              actor['material'][4]['map'].update = true;
            }
            if(skyfaces.includes('b')){  //correct
              actor['material'][5]['map'] = rmTarget.texture;  
              actor['material'][5]['map'].update = true;
            }
            if(skyfaces.includes('l')){
              actor['material'][1]['map'] = rmTarget.texture; // correct
              actor['material'][1]['map'].update = true;
            }
            if(skyfaces.includes('r')){
              actor['material'][0]['map'] = rmTarget.texture;  // correct
              actor['material'][0]['map'].update = true;
            }
            if(skyfaces.includes('t')){
              actor['material'][2]['map'] = rmTarget.texture;
              actor['material'][2]['map'].update = true;
            }
            if(skyfaces.includes('g')){
              actor['material'][3]['map'] = rmTarget.texture;
              actor['material'][3]['map'].update = true;
            }
          }else{                              // name other than 'skyfaces' 
            actor['material']['map'] = rmTarget.texture;
            actor['material']['map'].update = true;
            actor['material'].needsUpdate = true;
          }
        }
      }//_rm true => RM STAGE

      //[3]VR STAGE - final render to display/headset if displayed_scene==='vr'
      // animate vrscene spritecloud
      //console.log(`_vrcloud = ${_vrcloud}`);
      //console.log(`vrcloud = ${vrcloud}`);
      //console.log(`vrcloud.children.l = ${vrcloud.children.length}`);
      //console.log(`vrpivot.position.x = ${vrpivot.position.x}`);
      if(_vrcloud){
        //period = 0.1 + Math.random() * 0.1;  //period = 0.001;
        let period = 0.01 + 0.01*Math.random();  //period = 0.001;
        for (let i = 0, l = vrcloud.children.length; i < l; i ++ ) {
          let sprite = vrcloud.children[ i ];
          let material = sprite.material;
          // orig - exceeds screen to much
          //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 1.0;
          // more constrained
          // orig
          //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 0.5;
          //scale = Math.sin( et + sprite.position.z * 0.01 ) * 0.3 + 0.5;
          let scale = Math.sin( et + sprite.position.z * 0.1 ) * 0.3 + 0.5;
          let imageWidth = 1;
          let imageHeight = 1;
          if(material.map && material.map.image && material.map.image.width){
            imageWidth = material.map.image.width;
            imageHeight = material.map.image.height;
          }

          material.rotation += period * 0.1;     // ( i / l ); 
          sprite.scale.set( scale * imageWidth, scale * imageHeight, 1.0 );

          sprite.rotation.x = et * 0.2;
          sprite.rotation.z = et * 0.3; //0.6;
        }
        // EXPT!!!!! - no spritegroup rotation in X or Y
        //vrcloud.rotation.x = et * 0.5;
        //vrcloud.rotation.y = et * 0.75;
        //vrcloud.rotation.z = et * 1.0;

        //vrcloud.rotation.x = et * 0.2;
        //vrcloud.rotation.y = et * 0.4;
        //vrcloud.rotation.z = et * 0.3; //0.6;

        vrpivot.rotation.x = et * 0.2;
        vrpivot.rotation.z = et * 0.3; //0.6;
      }
      
      renderer.setRenderTarget(null);   
      renderer.render(vrscene, vrlens);

    }else{ //displayed_scene==='sg' => single sg stage ONLY - for test !!!!  

      //SG STAGE - final render to display/headset if displayed_scene 'sg'
      // test ONLY!!!!!
      renderer.render(sgscene, lens);  // displayed_scene === 'sg'
    }

    frame++;                         // frame>0 after first render-loop

  }//render

