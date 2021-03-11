// dome-vr3 narrative.ts - bootstrap()

  // set up rendering framework and initialize services and state 
  bootstrap(_config:Config, state:State){
    console.log(`\nnarrative.bootstrap:`);
   
    // save config for use in render-loop
    config = _config;

//    // diagnostics
//    console.log(`diagnostics:`);
//    console.log(`config:`);
//    console.dir(config);
//    console.log(`state:`);
//    console.dir(state);
//    console.log(`director is ${director}`);
//    console.log(`stage is ${stage}`);
//    console.log(`camera is ${camera}`);


    // prepare config.targets
    config.targets['narrative'] = narrative;
    config.targets['animation'] = animation;


    // initialize sgscene, rmscene and vrscene (and vrlens) and canvas
    sgscene = new THREE.Scene();
    rmscene = new THREE.Scene();
    vrscene = new THREE.Scene();
    sgscene.name = 'sgscene';  // possible diagnostics
    rmscene.name = 'rmscene';  // possible diagnostics
    vrscene.name = 'vrscene';  // possible diagnostics

    // fog
    if(config.sgfog){
      let f = config.sgfog;
      sgscene.fog = new THREE.Fog(f.color || 0xffffff, f.near || 0.01, f.far || 1000);
    }
    if(config.vrfog){
      let f = config.vrfog;
      //console.log(`\n\n****** config.vrfog = ${config.vrfog}:`);
      //console.dir(config.vrfog);
      vrscene.fog = new THREE.Fog(f.color || 0xffffff, f.near || 0.01, f.far || 1000);
      //console.log(`vrscene.fog = ${vrscene.fog}:`);
      //console.dir(vrscene.fog);
    }

    vrlens = new THREE.PerspectiveCamera(90.0,
      window.innerWidth/window.innerHeight, .001, 10000); 
    canvas = <HTMLCanvasElement>document.getElementById(config.canvas_id);
    //as of Oct 2019 webgl2 cannot render antialiasing - when supported
    //change false to config.antialias
    context = canvas.getContext('webgl2', {antialias:false});

    // cloud
    sgpivot = new THREE.Object3D();
    sgpivot.translateZ(-1000);   // no effect ?!
    sgcloud = new THREE.Group();
    sgpivot.add(sgcloud);
    sgscene.add(sgpivot);
    vrpivot = new THREE.Object3D();
    vrpivot.translateZ(-1000); // no effect ?!
    vrcloud = new THREE.Group();
    vrpivot.add(vrcloud);
    vrscene.add(vrpivot);


    // diagnostics
    console.log(`\n@@@ vrlens ctor - before renderer.vr.enable=true vrlens.position:`);
    //vrlens.position = new THREE.Vector3();  // const!! - READ-ONLY!!!
    console.dir(vrlens.position);
    let gl = canvas.getContext('webgl2');
    console.log(`webgl2 verification - gl.constructor:`);
    console.dir(gl.constructor);


    // initialize renderer
    renderer = new THREE.WebGLRenderer({
      canvas:canvas,
      context:context,
      alpha:config.alpha,
    });
    if(renderer.capabilities.isWebGL2){
      console.log(`!!!!!!!!!!!!!!!!!!!!! webGL2!`);
    }else{
      console.log(`!!!!!!!!!!!!!!!!!!!!! webGL1!`);
    }

    renderer.setClearColor(new THREE.Color(config.clearColor), 
      config.clearAlpha);
    renderer.setSize(window.innerWidth, window.innerHeight);


    // initialize WebGLRenderTargets
    sgTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    rmTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    rmTarget.width = window.innerWidth;
    rmTarget.height = window.innerHeight;

//    sgTarget = new THREE.WebGLRenderTarget(window.innerHeight, window.innerHeight);
//    rmTarget = new THREE.WebGLRenderTarget(window.innerHeight, window.innerHeight);
//    rmTarget.width = window.innerHeight;
//    rmTarget.height = window.innerHeight;

    // names
    sgTarget.name = 'sgTarget';  // possible diagnostics
    rmTarget.name = 'rmTarget';  // possible diagnostics


    //console.log(`narrative created sgscene=${sgscene} vrscene=${vrscene} renderer=${renderer} sgTarget=${sgTarget}`);


    // rendering topology
    // render to webVR?
    // display sgscene or vrscene
    _webvr = config.webvr || false;
    displayed_scene = config.displayed_scene;  // 'sg'|'vr'
    console.log(`displayed scene is ${displayed_scene}`);
    if(_webvr){
      console.log(`webvr true!! WEBVR=${WEBVR}`);
      renderer.vr.enabled = true;
      document.body.appendChild( WEBVR.createButton( renderer ) );
      //console.log(`\n\nvrlens has fov ${renderer.vr.getCamera(vrlens).fov}`);
    }
    _sg = config.sg || false;
    _sgpost = config.sgpost;
    _rm = config.rm || false;
    rm_npositions = config.rm_npositions || 0;


    // attach audioListener displayed_scene, sgscene, vrscene
    // NOTE:creation of AudioListener causes warning: the AudioContext was not 
    // allowed to start. It must be resumed (or created) after a user gesture 
    // on the page. If audio is used the audio actor (exp:GlobalAudio.ts)
    // creates an <enable audio> button below fps-stats monitor - it is clicked
    // once to enable audio (chnages to <audio active> and start audio playback
    // NOTE: It cannot at present be turned off after activation - except by
    // master audio volume control on device.
    audioListener = new THREE.AudioListener();  
    narrative['audioListener'] = audioListener;
    narrative['displayed_scene'] = displayed_scene;
    narrative['sgscene'] = sgscene;
    narrative['vrscene'] = vrscene;


    // actor-names to be textured by sgTarget.texture
    sgTargetNames = config.sgTargetNames || [];
    rmTargetNames = config.rmTargetNames || [];
    skyfaces = config.skyfaces || [];


    // stats - create and append stats to body
    stats = new Stats();
    document.body.appendChild(stats.dom);

    // create clock and add eventListener for window resize
    clock = new THREE.Clock();
    window.addEventListener( 'resize', narrative.onWindowResize, false );

    // run e2e test? - TBD
    _test = config.test;


    // initialize services - synchronous - quick
    director.initialize(config);
    mediator.initialize(config);
    queue.initialize(config);
    animation.initialize(config, narrative);
    transform3d.initialize(config);


    // initialize state
    narrative.changeState(state);

    // connect to server?
    if(config.server_connect){
      //mediator.connect();
    }
  }//bootstrap

