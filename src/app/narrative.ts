// narrative.ts
// bootstrap controller-application
// RECALL: src/app/narrative.ts is transpiled to dist/app/narrative.js
// and index.html <base href='/dist/'>  
// so all js-files referenced in narrative.ts are loaded relative to 
// dome-vr4/dist/app
// RECALL: external-lib is at dome-vr4/dist/external, 
// so the path to the external-lib relative to dist/app/narrative is ../external
// exp: import {VRButton} from '../external/three/examples/jsm/webxr/VRButton.js



// modules exterior to dome-vr4

// Three.js
import * as THREE from '../external/three/build/three.module.js';
import {VRButton} from '../external/three/examples/jsm/webxr/VRButton.js';
import Stats from '../external/three/examples/jsm/libs/stats/stats.module.js'; //default export
import {OrbitControls} from '../external/three/examples/jsm/controls/OrbitControls.js'; 

// gsap
import {gsap} from '../external/gsap/all.js';

// tween.js
import TWEEN from '../external/tween.js/tween.esm.js';

// make exterior modules available globally 
window['THREE'] = THREE;
window['TWEEN'] = TWEEN;


// dome-vr4 modules
// first 3 imports are compile-time only so don't need to use js-ext
// interfaces for scene
import {Cast} from './cast.interface';
import {Config} from './scenes/config.interface';
import {State} from './scenes/state.interface';


// at compile time tsc is smart enough to load <module>.ts even though the 
// file-extension is .js - note that .js is needed for runtime usage
// services
import {mediator} from './services/actions/mediator.js';
import {director} from './services/actions/director.js';
import {queue} from './services/actions/queue.js';
import {transform3d} from './services/transform3d.js';
import {animation} from './services/animation.js';
if(typeof queue !== undefined){
  //console.log(`queue is defined!`);  //otherwise queue is NOT used - tsc warn
}

// state
import {stage} from './state/stage.js';
import {camera} from './state/camera.js';
import {actions} from './state/actions.js';

// models
import {Actor} from './models/stage/actors/actor.interface';  
import {Panorama} from './models/stage/actors/environment/Panorama.js';  
import {Action} from './models/actions/action.interface';



// singleton closure variables
// const but uninitialized
let narrative:Narrative,
    config:Config,

    // canvas DOM-singularity, and webgl2-context
    canvas:HTMLCanvasElement, 
    context:WebGLRenderingContext|CanvasRenderingContext2D,

    // topology type and corresponding flags
    // see function calculate_topology(sg:boolen,rm:boolean,vr:boolean):number
    topology:number,
    _sg:boolean,
    _rm:boolean,
    _vr:boolean,
    _sgpost = false,
    _rmpost = false,
    renderer:THREE.WebGLRenderer, // NOTE:renderer.render(sgscene,lens)
    displayed_scene:string,

    
    // sg - camera components, renderTarget, actors
    sgscene:THREE.Scene,
    sglens:THREE.PerspectiveCamera,      // from state/camera
                   // NOTE:TBD 'csphere' is whole apparatus - lens, lights etc
    sgorbit:OrbitControls,
    sgTargetNames:string[],

    //_sgpost
    sghud:THREE.Mesh,
    sghud_tDiffuse:Record<string,unknown>,

    //bg
    sgskybox:THREE.Mesh,
    sgskybox_materials:THREE.Material[],
    sgskydome:THREE.Mesh,
    sgskydome_map:THREE.Texture,

    //spritecloud
    sgcloud:THREE.Group,


    // rm - lens, renderTarget, actors
    rmscene:THREE.Scene,
    rmlens:THREE.PerspectiveCamera,   // separate camera for rendering rmscene
    rmTargetNames:string[],

    rmquad:THREE.Mesh,
    rmquad_tDiffuse:Record<string,unknown>,
    rmhud:THREE.Mesh,
    rmhud_tDiffuse:Record<string,unknown>,

    // test-quad
    rmplane:THREE.Mesh,


    // vr - camera components, renderTarget, actors
    vrscene:THREE.Scene,
    vrlens:THREE.PerspectiveCamera,   // separate camera for rendering vrscene,
    vrorbit:OrbitControls,

    //bg
    vrskybox:THREE.Mesh,
    vrskybox_materials:THREE.Material[],
    vrskydome:THREE.Mesh,
    vrskydome_map:THREE.Texture,

    //spritecloud
    vrcloud:THREE.Group,


    // variable actor in narrative.render()
    actor:THREE.Object3D,

    // fps-performance meter
    stats:Stats;
  

// const - initialized
const initial_width:number = window.innerWidth,
      initial_height:number = window.innerHeight,
      dpr = window.devicePixelRatio,
      tVector = new THREE.Vector2(),
      
      // dictionary of all actors.
      cast:Record<string, THREE.Object3D> = {},
           //state/stage creates name-actor entries & registers them in cast 
          //via narrative.addActor(scene, name, actor) 

      // dictionary of targets of actions 
      actionsTargets:Record<string,unknown> = {}, 

  
      // 'startAudio' - enable audio button
      startAudio = document.getElementById('startAudio'),

      // AudioListener - needed to create audio actors 
      audioListener = new THREE.AudioListener(),


      // renderTargets
      sgTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
      //causes three.module.js:24784 WebGL: INVALID_OPERATION: readPixels: no PIXEL_PACK buffer bound
      //sgTarget = new THREE.WebGLRenderTarget(window.innerWidth*dpr, window.innerHeight*dpr),
      rmTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),


      // test-textures
      tloader = new THREE.TextureLoader(),
      escher:THREE.Texture = <THREE.Texture>tloader.load('./app/media/images/escher.jpg'),
      glad:THREE.Texture = <THREE.Texture>tloader.load('./app/media/images/glad.png'),
      lotus:THREE.Texture = <THREE.Texture>tloader.load('./app/media/images/lotus_64.png'),
      moon:THREE.Texture = <THREE.Texture>tloader.load('./app/media/images/moon_tr.png'),

      // time
      tl = gsap.timeline({paused:true}),
      clock = new THREE.Clock(),    // uses perfomance.now() - fine grain
      devclock = new THREE.Clock(),    // uses perfomance.now() - fine grain
      timer = (t:number, dt:number, fr:number):void => {
        // sync frame and gsap-frame => no need to increment frame in render()
        frame = fr;
//        if(fr % 1000 === 0){
//          console.log(`timer:frame=${frame} et=${et} fr=${fr} t=${t}`);
//        }
      },

      // renderers
      create_renderer = ():THREE.WebGLRenderer => {
        renderer = new THREE.WebGLRenderer({
          canvas:canvas,
          context:context,
          antialias:config.renderer.antialias,
          alpha:config.renderer.alpha
        });
        renderer.setClearColor(new THREE.Color(config.renderer.clearColor),
          config.renderer.clearAlpha);
        renderer.setSize(window.innerWidth, window.innerHeight);
        return renderer;
      };


//dynamic
let tw = window.innerWidth * dpr,
    th = window.innerHeight * dpr,
    tData = new Uint8Array(tw*th*4),  //RGBA => 4  NOTE- dpr scale NEEDED
                                     //since creating from Framebuffer
    dTexture = new THREE.DataTexture(tData, tw, th, THREE.RGBAFormat),
    iData = new Uint8Array(tw*th*4),  //RGBA => 4 NOTE-dpr scale not needed
                                     //since creating from sgTarget.texture
    rtTexture:THREE.Texture,
    image:HTMLImageElement,   //HTMLImageElement? - as returned by ImageLoader
    _stats = false,
    aspect = 1.0,             // dynamic measure of window.innerW/window.innerH
    animating = false,       // animation => render-loop running
    et = 0,                 // elapsed time - clock starts at render start
    frame = 0;             // frame index (as in rendered frames - fps)
   



class Narrative implements Cast{
  // ctor
  private constructor(){
    narrative = this;
  } 

  static create():Narrative{
    //console.log(`\n\nnarrative.create !!!!!!!!!!!!!!!!!!!!!!!`);
    if(narrative === undefined){
      narrative = new Narrative();
    }
    return narrative;
  }

  foo():string{
    console.log(`narrative.foo()`);
    //diagnostics
    for(const [name,actor] of Object.entries(cast)){
      console.log(`cast has actor  ${name}`);
      //console.dir(actor);
    }
    //narrative.reportActors(true);
//    console.log(`vrscene.children:`);
//    for(const c in vrscene.children){
//      console.log(`vrscene contains child ${vrscene.children[c].name}`);
//    }
    return 'foo';
  }



  // set up rendering framework and initialize services and state 
  //bootstrap(_config:Config, state:State){
  bootstrap(_config:Config, state:State):void{
    //console.log(`\n@@@ narrative.bootstrap:`);
    devclock.start();

    // initialize config
    config = _config;

    // initialize needed narrative closure variables and copy references
    // to narrative instance object for use in state modules camera, stage
    // audio and actions.
    //NOTE: config is not needed as arg since it is a closure var of narrative
    narrative.initialize();
    narrative['config'] = config;


    // initialize actionsTargets
    // initialize modules with set of possible actions targets {t:'target',...}
    // and with ref to narrative (contained in 'actionsTargets')
    actionsTargets['narrative'] = narrative;
    actionsTargets['animation'] = animation;    // services
    actionsTargets['mediator'] = mediator;
    config['actionsTargets'] = actionsTargets;


    // initialize services
    director.initialize(config);
    animation.initialize(config);
    mediator.initialize(config);
    queue.initialize(config);
    transform3d.initialize(config);


    // webxr
    if(config.topology._webxr){
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType('local');

      // webXR VRButton
      document.body.append(VRButton.createButton(renderer));
      //console.log(`_webxr=${config.topology._webxr} => rendering in webXR`);
    }else{
      console.log(`_webxr = ${config.topology._webxr} so rendering in webGL`);
    }

    // stats - display fps performance
    _stats = config['renderer']['_stats'];
    if(_stats){
      stats = new Stats();
      document.body.appendChild(stats.dom);
      stats.dom.style.display = 'block';  // show
    }


    // connect to server?
    if(config.server.server_connect){
      //mediator.connect();
    }

    // initialize state 
    narrative.changeState(state);

  }



  // initialize needed narrative closure variables and copy references
  // to narrative instance object for use in state modules camera, stage
  // audio and actions.
  initialize():void{
    //console.log(`@@@ narrative.initialize():`);

    // canvas DOM-singularity, and webgl2-context
    canvas = <HTMLCanvasElement>document.getElementById(config.renderer.canvas_id);
    context = canvas.getContext('webgl2', {antialias:true});


    // topology
    _sg = config.topology._sg;
    _rm = config.topology._rm;
    _vr = config.topology._vr;
    _sgpost = config.topology._sgpost;
    _rmpost = config.topology._rmpost;
    topology = config.topology.topology;  //topology=_sg + _rm*2 + _vr*4
    //console.log(`rendering topology type = ${topology}`);
    //console.log(`!!! config.top._sgpost = ${config.topology._sgpost}`);


    // canvas needed in camera.delta for vrcontrols and possibly others
    narrative['canvas'] = canvas;

    // displayed_scene needed in state/camera to add audioListener to 
    // lens from displayed_scene
    narrative['audioListener'] = audioListener;
    displayed_scene = config.topology.displayed_scene;
    narrative['displayed_scene'] = displayed_scene; //'sg'|'rm'|'vr'
    //console.log(`n['displayed_scene'] = ${narrative['displayed_scene']}`);

    // create WebGLRenderer for all scenes
    renderer = create_renderer();
    //EXPT!
    renderer.setPixelRatio(dpr);  // critically important for post!!
    //renderer.autoClear = false;

    //DataTexture filters
    dTexture.minFilter = THREE.NearestFilter;
    dTexture.magFilter = THREE.NearestFilter;

    //initial center (x,y) of DataTexture 
    tVector.x = 0.0; //0.5*tw;
    tVector.y = 0.0; //0.5*th;
    //console.log(`dpr = ${dpr} tVector.x = ${tVector.x} tVector.y = ${tVector.y}`);

    // populate Narrative instance for use in state modules
    narrative['devclock'] = devclock;
    if(_sg){
      narrative['sg'] = {};
      const nsg = narrative['sg'];
      sgscene = new THREE.Scene;
      nsg['scene'] = sgscene;

      nsg['lens'] = sglens;
      nsg['orbit'] = sgorbit;
      sgTargetNames = config.topology.sgTargetNames;
    }

    if(_rm){
      narrative['rm'] = {};
      const nrm = narrative['rm'];
      rmscene = new THREE.Scene;
      nrm['scene'] = rmscene;

      //fixed rmlens 
      const aspect = window.innerWidth/window.innerHeight;
      rmlens = new THREE.PerspectiveCamera(90, aspect,.01,1000);
      rmlens.position.z = 1.0;
      rmlens.lookAt(new THREE.Vector3(0,0,0));
      nrm['lens'] = rmlens;
      rmTargetNames = config.topology.rmTargetNames;
    }

    if(_vr){
      narrative['vr'] = {};
      const nvr = narrative['vr'];
      vrscene = new THREE.Scene;
      nvr['scene'] = vrscene;

      nvr['lens'] = vrlens;
      nvr['orbit'] = vrorbit;
    }

    // returns to bootstrap()
  }//initialize()



  // for actions (usually from server)
  // change state of framework states
  changeState(state:State):void{
    //console.log(`\n@@@ narrative.changeState:`);

    (async () => {
      // camera creates camera components, controls and maps, and fog
      // stage prepares scenes - all actors and associated media
      // actions prepares sequences - music, animation and changes
      try{
        //console.log('\n\n ######## camera-stage-actions');
        const results:number[] = await Promise.all([
          camera.delta(state['camera'], narrative),
          stage.delta(state['stage'], narrative),
          actions.delta(state['actions'], narrative)
        ]);


        // prepare components and actors for render()
        narrative.prerender(state).then((t) => {
          //console.log(`prerender() finished! at et = ${t}`);

          if(!animating){
            // stop devclock, start clock and timeline
            devclock.stop();
            clock.start();
            tl.play();
    
            // set timer to report time passage - t, dt, frames
            gsap.ticker.add(timer);


            // listen for enable audio event from startAudio button (if exists)
            // and upon click start audio actors - singleton globalaudio and
            // zero or more pointaudio actors
            if(startAudio){
              startAudio.addEventListener('click', function(){
                // remove startAudio button
                startAudio.remove();
  
                // match actor names to /audio/ 
                // exps 'globalaudio', 'pointaudio1', 'pointaudio2'
                // match => call startAudio() on audio actor to initialize play
                for(const name of Object.keys(cast)){
                  //console.log(`testing /audio/ match with name = ${name}`);
                  //console.log(`cast[name] = ${cast[name]}:`);
                  //console.dir(cast[name]);
                  if(/[aA]udio/.test(name)){
                    console.log(`/[aA]udio/ MATCH with name = ${name}`);
                    cast[name].startAudio();
                  }else{
                    //console.log(`/[aA]udio/ NO MATCH with name = ${name}`);
                  }
                }
              });
            }//if(startAudio)

            // listen for resize events
            window.addEventListener( 'resize', narrative.onWindowResize, false );

            // setAnimationLoop => begin render-loop
            animating = true;
            renderer.setAnimationLoop(narrative.render);
            narrative.render();
          }

        });//n.prerender()

      }catch(e){
        console.log(`n.chSt - error in processing state from scene: ${e}`);
      }

    })();//async-IIFE 

  }//changeState



  // prepare actors and components for render()
  prerender(state:State):Promise<number> {
    //console.log(`\n@@@ narrative.prerender() _sgpost = ${_sgpost}`);

    return new Promise((resolve, reject) => {

      if(sgscene){
        //console.log(`prerender(): sgscene is defined!`);
        sglens = narrative['sg']['lens'];
        if(state['camera']['sg']['lens'] && state['camera']['sg']['lens']['_orbit']){
          console.log(`*** enabling orbit controls for sglens:`);
          sgorbit = new OrbitControls(sglens, renderer.domElement);
          sgorbit.update();
          sgorbit.enableDamping = true;
          sgorbit.dampingFactor = 0.25;
          sgorbit.enableZoom = true;
          //sgorbit.autoRotate = true;
        }
  
        // build rendering components, actors
        sghud = narrative.findActor('sghud');
        //console.log(`_sgpost = ${_sgpost}`);
        if(sghud){
          sghud_tDiffuse = sghud.material.uniforms.tDiffuse;
          sghud_tDiffuse['value'] = dTexture;
          sghud_tDiffuse['needsUpdate'] = true;
          //console.log(`sghud_tDiffuse = ${sghud_tDiffuse}`);
        }else{
          _sgpost = false;
        }
  
        sgskybox = narrative.findActor('sgskybox');
        if(sgskybox){
          //console.log(`sgskybox actor found`);
          //console.log(`Array.isArray(sgskybox.material) = ${Array.isArray(sgskybox.material)}`);
          //console.log(`sgskybox.material.length = ${sgskybox.material.length}`);
          sgskybox_materials = [];
          for(let i=0; i<sgskybox.material.length; i++){
            sgskybox_materials[i] = (<THREE.Material[]>sgskybox.material)[i];
          }
        }
  
        sgskydome = narrative.findActor('sgskydome');
        if(sgskydome){
          console.log(`sgskydome actor found`);
          sgskydome_map = sgskydome.material.map;
        }

        sgcloud = narrative.findActor('sgcloud');

      }//if(sgscene)
  

      if(rmscene){
        //console.log(`prerender(): rmscene is defined!`);
        // build rendering components, actors
        rmquad = narrative.findActor('rmquad');
        rmhud = narrative.findActor('rmhud');
        //console.log(`n.prerender(): rmquad = ${rmquad}`);
        //console.log(`n.prerender(): rmhud = ${rmhud}`);
        //console.dir(rmquad);
        if(rmquad){
          rmquad_tDiffuse = rmquad.material.uniforms.tDiffuse;
        }
        if(rmhud){
          rmhud_tDiffuse = rmhud.material.uniforms.tDiffuse;
          if(rmhud_tDiffuse === undefined){
            rmhud_tDiffuse = rmhud.material.uniforms.tDiffusePost;
          }
          transform3d.apply({s:[initial_width, initial_height, 1.0]},rmhud);
          //console.log(`rmhud_tDiffuse = ${rmhud_tDiffuse}`);
        }
        if(!rmquad && !rmhud){
          _rm = false;
          _rmpost = false;
        }
        //TEMP - test
        rmplane = <THREE.Mesh>narrative.findActor('rmplane');
      }


      if(vrscene){
        //console.log(`prerender(): vrscene is defined!`);
        vrlens = narrative['vr']['lens'];
        if(state['camera']['vr']['lens'] && state['camera']['vr']['lens']['_orbit']){
          console.log(`*** enabling orbit controls for vrlens:`);
          vrorbit = new OrbitControls(vrlens, renderer.domElement);
          vrorbit.update();
          vrorbit.enableDamping = true;
          vrorbit.dampingFactor = 0.25;
          vrorbit.enableZoom = true;
          //vrorbit.autoRotate = true;
        }
  
        vrskybox = narrative.findActor('vrskybox');
        if(vrskybox){
          //console.log(`vrskybox actor found`);
          //console.log(`Array.isArray(vrskybox.material) = ${Array.isArray(vrskybox.material)}`);
          //console.log(`vrskybox.material.length = ${vrskybox.material.length}`);
          if(Array.isArray(vrskybox.material)){
            vrskybox_materials = [];
            for(let i=0; i<6; i++){
              //console.log(`\n________________setting vrskybox_materials[${i}]`);
              //(<THREE.Materials[]>vrskybox.material)[i].map = sgTarget.texture;
              vrskybox_materials[i] = vrskybox.material[i] || new THREE.Material();
            }
          }else{    // not array
            vrskybox_materials = [];
          }
        }
  
        vrskydome = narrative.findActor('vrskydome');
        if(vrskydome){
          //console.log(`vrskydome actor found`);
          vrskydome_map = vrskydome.material.map;
        }

        vrcloud = narrative.findActor('vrcloud');

      }//if(vrscene)

      resolve(devclock.getElapsedTime());

    });//return new Promise

  }//prerender()



  // render current frame - frame holds current frame number
  render():void {

    //TEMP! get displayed_scene lens worldPosition - after 'enterVR'
    //the headset worldPosition/Orientation is written into the 
    //displayed_scene lens worldPosition, i.e. in this case sglens.matrixWorld
    //since topology for test was 1 - for {4,5,6,7} it is vrlens.matrixWorld.
    //see: https://stackoverflow.com/questions/64639081/how-do-you-get-the-position-of-the-vr-headset-in-three-js
//    if(frame%6000 === 0){   //10sec period
//      //test is using topology1 and hence sglens - {4,5,6,7} would use vrlens
//      const p = new THREE.Vector3(),
//            q = new THREE.Quaternion(),
//            s = new THREE.Vector3();
//
//      //p.setFromMatrixPosition(sglens.matrixWorld );
//      sglens.matrixWorld.decompose(p,q,s);
//      console.log(`p.x=${p.x}  p.y=${p.y}  p.z=${p.z}`);
//      //console.log(`q.x=${q.x}  q.y=${q.y}  q.z=${q.z}  q.w=${q.w}`);
//      //console.log(`s.x=${s.x}  s.y=${s.y} `r s.z=${s.z}`);
//      console.log(`------------------------`);
//      
////      //test is using topology1 and hence sglens - {4,5,6,7} would use vrlens
////      //FAILS - sglens is not the correct arg for 'camera'
////      const vp = renderer.xr.getCamera(sglens).getWorldPosition(wvp);
////      console.log(`wvp = ${wvp.x}  ${wvp.y}  ${wvp.z}`);
//    }


    // time-ms, check msgs
    et = 1000.*clock.getElapsedTime();
//    if(rmquad && rmquad.material.uniforms.uTime){
//      rmquad.material.uniforms.uTime.value = et;
//      rmquad.material.uniforms.uTime.needsUpdate = true;
//    }
    if(frame%10 === 0){     //check for pending msgs - period is approx 160ms 
      director.look(et);
    }
    // fps
    if(_stats){
      stats.update();
    } 


    //clouds - use TWEEN
    if(sgcloud || vrcloud){
      TWEEN.update();
    }


    // animate actors with special sub-renders - exps sgcloud/vrcloud
    for(const [name,actor] of Object.entries(cast)){
      if(actor['animate']){actor['animate'](et);}
    }
   


    // render config-defined topology using defined rendering functions
    switch(topology){
      case 7:     // sg-rm-vr
        renderer.xr.enabled = false;  //5f
        renderer.setRenderTarget(sgTarget);
        renderer.render(sgscene, sglens);

        if(_sgpost){  
          //if(frame%600===0){console.log(`_sgpost:rtTexture to sghud`);}
          image = sgTarget.texture.image;
          const w = image.width,
                h = image.height;
          iData = new Uint8Array(w * h * 4 );
          renderer.readRenderTargetPixels(sgTarget, 0,0,w,h, iData);
          rtTexture = new THREE.DataTexture(iData, w, h, THREE.RGBAFormat);

          sghud_tDiffuse['value'] = rtTexture;
          sghud_tDiffuse['needsUpdate'] = true;
        }

        //sgTargetNames - 'rmquad' a/o 'rmhud'
        for(const actorname of sgTargetNames){
          if(actorname === 'rmquad'){
            //if(frame%600===0){console.log(`sgTarget to rmquad`);}
            if(rmquad_tDiffuse){
              rmquad_tDiffuse['value'] = sgTarget.texture;  // both WORK!
              rmquad_tDiffuse['needsUpdate'] = true;
            }
          }
          if(actorname === 'rmhud'){
            //if(frame%600===0){console.log(`sgTarget to rmhud`);}
            if(rmhud_tDiffuse){
              rmhud_tDiffuse['value'] = sgTarget.texture;  
              rmhud_tDiffuse['needsUpdate'] = true;
            }
          }
        }

        renderer.setRenderTarget(rmTarget);
        renderer.render(rmscene, rmlens);
        if(_rmpost){  
          //if(frame%600===0){console.log(`_rmpost:rtTexture to rmhud`);}
          image = rmTarget.texture.image;
          const w = image.width,
                h = image.height;
          iData = new Uint8Array(w * h * 4 );
          renderer.readRenderTargetPixels(rmTarget, 0,0,w,h, iData);
          rtTexture = new THREE.DataTexture(iData, w, h, THREE.RGBAFormat);

          if(rmhud_tDiffuse){
            rmhud_tDiffuse['value'] = rtTexture;
            rmhud_tDiffuse['needsUpdate'] = true;
          }
//          if(rmquad_tDiffuse){ //do not overwrite sgTarget.texture on rmquad
//            rmquad_tDiffuse['value'] = rtTexture;
//            rmquad_tDiffuse['needsUpdate'] = true;
//          }
        }//if(_rmpost)

        for(const actorname of rmTargetNames){
          if(actorname === 'vrskybox'){
            //if(frame%600===0){console.log(`rmTarget.tex to vrskybox`);}
            const faces:string[] = <string[]>config.topology.rmvrSkyboxFaces;
            //console.log(`faces = ${faces} faces.length = ${faces.length}`)
            if(faces && faces.length > 0){
              for(const face of faces){
                switch(face){
                  case 'px':
                    vrskybox_materials[0].map = rmTarget.texture;
                    vrskybox_materials[0].needsUpdate = true;
                    break;
                  case 'nx':
                    vrskybox_materials[1].map = rmTarget.texture;
                    vrskybox_materials[1].needsUpdate = true;
                    break;
                  case 'py':
                    vrskybox_materials[2].map = rmTarget.texture;
                    vrskybox_materials[2].needsUpdate = true;
                    break;
                  case 'ny':
                    vrskybox_materials[3].map = rmTarget.texture;
                    vrskybox_materials[3].needsUpdate = true;
                    break;
                  case 'pz':
                    vrskybox_materials[4].map = rmTarget.texture;
                    vrskybox_materials[4].needsUpdate = true;
                    break;
                  case 'nz':
                    vrskybox_materials[5].map = rmTarget.texture;
                    vrskybox_materials[5].needsUpdate = true;
                    break;
                  default:
                    console.log(`unrecognized face code ${face}`);
                }//switch
              }//face

            }else{  //faces undef or [] => texture vrskybox with rmTarget.tex
              if(actor = narrative.findActor('vrskybox')){   // if defined
                actor.material.map = rmTarget.texture;
                actor.material.needsUpdate = true;
              }
            }

          }else{ //texture non-vrskybox actor with rmTarget.texture
            if(actor = narrative.findActor(actorname)){  // if defined
                actor.material.map = rmTarget.texture;
                actor.material.needsUpdate = true;
            }
          }
        }
        renderer.xr.enabled = true;   // 7t
        renderer.setRenderTarget(null);
        renderer.render(vrscene, vrlens);
        break;



      case 6:     // rm-vr
        renderer.xr.enabled = false;  //6f
        renderer.setRenderTarget(rmTarget);
        renderer.render(rmscene, rmlens);

        if(_rmpost){  
          image = rmTarget.texture.image;
          const w = image.width,
                h = image.height;
          iData = new Uint8Array(w * h * 4 );
          renderer.readRenderTargetPixels(rmTarget, 0,0,w,h, iData);
          rtTexture = new THREE.DataTexture(iData, w, h, THREE.RGBAFormat);

          if(rmhud_tDiffuse){
            rmhud_tDiffuse['value'] = rtTexture;
            rmhud_tDiffuse['needsUpdate'] = true;
          }
          if(rmquad_tDiffuse){
            rmquad_tDiffuse['value'] = rtTexture;
            rmquad_tDiffuse['needsUpdate'] = true;
          }
        }//if(_rmpost)
       
        for(const actorname of rmTargetNames){
          if(actorname === 'vrskybox'){
            const faces:string[] = <string[]>config.topology.rmvrSkyboxFaces;
            //console.log(`faces = ${faces} faces.length = ${faces.length}`)
            if(faces && faces.length > 0){
              for(const face of faces){
                switch(face){
                  case 'px':
                    vrskybox_materials[0].map = rmTarget.texture;
                    vrskybox_materials[0].needsUpdate = true;
                    break;
                  case 'nx':
                    vrskybox_materials[1].map = rmTarget.texture;
                    vrskybox_materials[1].needsUpdate = true;
                    break;
                  case 'py':
                    vrskybox_materials[2].map = rmTarget.texture;
                    vrskybox_materials[2].needsUpdate = true;
                    break;
                  case 'ny':
                    vrskybox_materials[3].map = rmTarget.texture;
                    vrskybox_materials[3].needsUpdate = true;
                    break;
                  case 'pz':
                    vrskybox_materials[4].map = rmTarget.texture;
                    vrskybox_materials[4].needsUpdate = true;
                    break;
                  case 'nz':
                    vrskybox_materials[5].map = rmTarget.texture;
                    vrskybox_materials[5].needsUpdate = true;
                    break;
                  default:
                    console.log(`unrecognized face code ${face}`);
                }//switch
              }//face

            }else{  //faces undef or [] => texture vrskybox with rmTarget.tex
              if(actor = narrative.findActor('vrskybox')){   // if defined
                actor.material.map = rmTarget.texture;
                actor.material.needsUpdate = true;
              }
            }

          }else{ //texture non-vrskybox actor with rmTarget.texture
            if(actor = narrative.findActor(actorname)){  // if defined
                actor.material.map = rmTarget.texture;
                actor.material.needsUpdate = true;
            }
          }
        }
        renderer.xr.enabled = true;   // 6t
        renderer.setRenderTarget(null);
        renderer.render(vrscene, vrlens);
        break;



      case 5:     // sg-vr
        renderer.xr.enabled = false;  //5f
        renderer.setRenderTarget(sgTarget);
        renderer.render(sgscene, sglens);

        if(_sgpost){  
          image = sgTarget.texture.image;
          const w = image.width,
                h = image.height;
          iData = new Uint8Array(w * h * 4 );
          renderer.readRenderTargetPixels(sgTarget, 0,0,w,h, iData);
          rtTexture = new THREE.DataTexture(iData, w, h, THREE.RGBAFormat);

          sghud_tDiffuse['value'] = rtTexture;
          sghud_tDiffuse['needsUpdate'] = true;
        }

        //possibly map (post) sgTarget.texture to vrskybox
        for(const actorname of sgTargetNames){
          if(actorname === 'vrskybox'){
            const faces:string[] = <string[]>config.topology.sgvrSkyboxFaces;
            if(faces && faces.length > 0){
              for(const face of faces){
                switch(face){
                  case 'px':
                    vrskybox_materials[0].map = sgTarget.texture;
                    break;
                  case 'nx':
                    vrskybox_materials[1].map = sgTarget.texture;
                    break;
                  case 'py':
                    vrskybox_materials[2].map = sgTarget.texture;
                    break;
                  case 'ny':
                    vrskybox_materials[3].map = sgTarget.texture;
                    break;
                  case 'pz':
                    vrskybox_materials[4].map = sgTarget.texture;
                    break;
                  case 'nz':
                    vrskybox_materials[5].map = sgTarget.texture;
                    break;
                  default:
                    console.log(`unrecognized face code ${face}`);
                }//switch              
              }//face
            }

          }else{
            if(actor = narrative.findActor(actorname)){  // if defined
              actor.material.map = sgTarget.texture;
            }
          }
        }
        renderer.xr.enabled = true;   // 5t
        renderer.setRenderTarget(null);
        renderer.render(vrscene, vrlens);
        break;



      //no '_vrpost' - framebuffer is stereo - cannot use to render renderTgt
      case 4:     // vr
        renderer.render(vrscene, vrlens);
        break;



      //_webxr:false - rmscene output is on near plane - flat and mono
      case 3:     // sg-rm
        renderer.xr.enabled = false;  //5f top3 cannot be webxr:t - rm is FLAT
        renderer.setRenderTarget(sgTarget);
        renderer.render(sgscene, sglens);

        //if(frame%600===0){console.log(`\nrendered to sgTarget`);}
        //_sgpost=f => only fsh-rmquad as rmscene
        if(_sgpost){  
          if(sghud_tDiffuse){
            image = sgTarget.texture.image;
            const w = image.width,
                  h = image.height;
            iData = new Uint8Array(w * h * 4 );
            renderer.readRenderTargetPixels(sgTarget, 0,0,w,h, iData);
            rtTexture = new THREE.DataTexture(iData, w, h, THREE.RGBAFormat);

            sghud_tDiffuse['value'] = rtTexture;
            sghud_tDiffuse['needsUpdate'] = true;
          }
        }
        //if(frame%600===0){console.log(`wrote rtTexture to sghud`);}

        //texture map rmquad a/o rmhud with sgTarget.texture
        //if(frame%600===0){console.log(`sgTNames.l=${sgTargetNames.length}`);}
        for(const actorname of sgTargetNames){
          //if(frame%600===0){console.log(`sgTNames=${sgTargetNames}`);}
          if(actorname === 'rmquad'){
            if(rmquad_tDiffuse){
              rmquad_tDiffuse['value'] = sgTarget.texture;  // both WORK!
              rmquad_tDiffuse['needsUpdate'] = true;
            }
          }
          if(actorname === 'rmhud'){
            if(rmhud_tDiffuse){
              rmhud_tDiffuse['value'] = sgTarget.texture;  
              rmhud_tDiffuse['needsUpdate'] = true;
            }
          }
        }
        //if(frame%600===0){console.log(`rmq_tD['v']===sgT.tex=${rmquad_tDiffuse['value']===sgTarget.texture}`);}
        //if(frame%600===0){console.log(`wrote sgTarget.tex to rmquad`);}

        //render rmscene to framebuffer
        renderer.clear();
        renderer.setRenderTarget(null);
        renderer.render(rmscene, rmlens);
        //if(frame%600===0){console.log(`rendered rmscene to framebuffer`);}

        if(_rmpost){  
          renderer.copyFramebufferToTexture(tVector, dTexture);
          if(rmhud_tDiffuse){
            rmhud_tDiffuse['value'] = dTexture;
            rmhud_tDiffuse['needsUpdate'] = true;
          }
//          if(rmquad_tDiffuse){ //do not overwrite sgTarget.texture on rmquad
//            rmquad_tDiffuse['value'] = dTexture;
//            rmquad_tDiffuse['needsUpdate'] = true;
//          }
        }//if(_rmpost)
        //if(frame%600===0){console.log(`wrote dTexture to rmhud`);}
        break;



      //_webxr:false - rmscene output is on near plane - flat and mono
      case 2:     // rm:  k shader-layers (in this case k=2)
        //TEMP!!!
//        if(frame%1200 < 600){
//          rmquad_tDiffuse['value'] = glad;
//          rmquad_tDiffuse['needsUpdate'] = true;
//          if(_rmpost){
//            rmhud_tDiffuse['value'] = moon;
//            rmhud_tDiffuse['needsUpdate'] = true;
//          }
//        }else{
//          rmquad_tDiffuse['value'] = moon;
//          rmquad_tDiffuse['needsUpdate'] = true;
//          if(_rmpost){
//            rmhud_tDiffuse['value'] = glad;
//            rmhud_tDiffuse['needsUpdate'] = true;
//          }
//        }
        renderer.render(rmscene, rmlens);
        if(_rmpost){  
          renderer.copyFramebufferToTexture(tVector, dTexture);
          if(rmhud_tDiffuse){
            rmhud_tDiffuse['value'] = dTexture;
            rmhud_tDiffuse['needsUpdate'] = true;
          }
          if(rmquad_tDiffuse){
            rmquad_tDiffuse['value'] = dTexture;
            rmquad_tDiffuse['needsUpdate'] = true;
          }
        }//if(_rmpost)
        break;



      //if _sgpost then _webxr:false - sghud is on near plane - flat and mono
      //webxf:f - working
      //webxf:t - working - but not viewable in VR since flat sghud is on
                            //the near camera plane
      case 1:     // sg
        renderer.render(sgscene, sglens);
        if(_sgpost){  
          if(sghud_tDiffuse){
            renderer.copyFramebufferToTexture(tVector, dTexture);
            sghud_tDiffuse['value'] = dTexture;
            sghud_tDiffuse['needsUpdate'] = true;
          }
        }//if(_sgpost)
        break;



      default:    // error
        console.log(`unrecognized topology ${topology}`);
    }    

    //track rendered frames for diagnostics etc.
    frame++;

  }//render



  // reset params based on window resize event
  onWindowResize():void {
    const width_:number = window.innerWidth,
          height_:number = window.innerHeight;
          //ratiow:number = width_/initial_width,
          //ratioh:number = height_/initial_height;
 

    //diagnostics
    //console.log(`resize: init_w=${initial_width} init_h=${initial_height}`);
    console.log(`resize: width=${width_} height=${height_}`);

    
    // renderTargets
    sgTarget.setSize(width_, height_);
    rmTarget.setSize(width_, height_);


    //diagnostics for post textures from renderer.copyRenderTargetToTexture
////          image = sgTarget.texture.image;
////          const w = image.width,
////                h = image.height,
////                iData = new Uint8Array(w * h * 4 );
////          renderer.readRenderTargetPixels(sgTarget, 0,0,w,h, iData);
////          rtTexture = new THREE.DataTexture(iData, w, h, THREE.RGBAFormat);
//    console.log(`sgTg.w=${sgTarget.width} sgTg.h=${sgTarget.height}`);
//    console.log(`sgT.tex.im.w=${sgTarget.texture.image.width}`); 
//    console.log(`sgT.tex.im.h=${sgTarget.texture.image.height}`);
//    console.log(`iData.length=${iData.length}`);
//    if(rtTexture){
//      console.log(`rtTx.im.w=${rtTexture.image.width} rtTx.im.h=${rtTexture.image.height}`);
//    }


    //rmquad
//    if(rmquad){
//      const t = {s:[ratiow, ratioh, 1.0]};
//      transform3d.apply(t, rmquad);
//    }
//    // rmhud
//    if(rmhud){
//      const t = {s:[ratiow, ratioh, 1.0]};
//      transform3d.apply(t, rmhud);
//    }


    //post textures from renderer.copyFramebufferToTexture
    if(_sgpost || _rmpost){
      //console.log(`_sgpost || _rmpost true!!!`);
      tw = width_ * dpr;
      th = height_ * dpr;
      tData = new Uint8Array(tw*th*4);
      dTexture = new THREE.DataTexture(tData, tw, th, THREE.RGBAFormat);
      dTexture.minFilter = THREE.NearestFilter;
      dTexture.magFilter = THREE.NearestFilter;
    }

    //canvas
    canvas.width = width_;
    canvas.height = height_;

    //cameras
    aspect = width_/height_;
    if(sglens){
      sglens.aspect = aspect;
      sglens.updateProjectionMatrix();
    }
    if(rmlens){
      rmlens.aspect = aspect;
      rmlens.updateProjectionMatrix();
    }
    if(vrlens){
      vrlens.aspect = aspect;
      vrlens.updateProjectionMatrix();
    }

    //renderer
    renderer.setSize(width_, height_);
  }



  // method to allow infinite seq-loop mainly for music sequence playing
  // for infinite loop of sequence place this action at tail of sequence
  // with appropriate execution time (ms)
  /*      
  {t:'narrative',
   f:'sequence',
   a:'n',
   o:{'arg':'./app/models/actions/sequences/loop/seq_loop'},
   ms:15000}
  */
  sequence(sequence_url:string):void{
    console.log(`\n*** narrative.sequence sequence_url = ${sequence_url}`);
//    if(sequence_url){
//      import(sequence_url).then((seq) => {
//        console.log(`****** narrative.sequence seq = ${seq}:`);
//        console.dir(seq);
//        if(seq['actions']){
//          console.log(`seq['actions'].len=${seq['actions'].length}`);
//          console.dir(seq['actions']);
//          queue.load(seq['actions']);   // load sequence to repeat
//          clock.start();  //reset clock to zero for re-play of sequence 
//          console.log(`clock.elapsedTime=${clock.elapsedTime}`);
//        }
//      });
//    }
  }



  // following two functions are for sgscene-actor management (by actor name)
  addActor(scene:THREE.Scene, name:string, actor:THREE.Object3D):void{
    //console.log(`\n@@@ narrative.addActor ${name} actor=${actor}:`);
    //console.dir(actor);
    //console.log(`addActor: et = ${devclock.getElapsedTime()}`);
    if(scene && actor && name && name.length > 0){
      if(cast[name]){
        narrative.removeActor(scene, name);  //if replace actor with same name?
      }
      actor.name = name;  // possible diagnostic use
      cast[name] = actor;
      //console.log(`addActor: et = ${devclock.getElapsedTime()}`);

      //prevent sglens and vrlens from becoming children of sgscene/vrscene
      //NOTE: if exp vrlens is child of vrscene vrcontrols FAIL!
      //NOTE: vrkeymap still works
      if(!/lens/.test(name)){
        scene.add(actor);
      }

      //console.log(`n.addActor: scene.children.l = ${scene.children.length}`);
      //console.log(`n.addActor: cast size = ${Object.keys(cast).length}`);
      //console.log(`n.addActor: cast = ${Object.keys(cast)}`);
    }else{
      console.log(`n.addActor:FAILED to add actor ${actor} w. name ${name}!!`); 
    }
  }

  removeActor(scene:THREE.Scene, name:string):void{
    console.log('\nnarrative.removeActor ${name}');
    if(scene && name && name.length > 0){
      if(cast[name]){
        scene.remove(cast[name]);
        delete cast[name];
      }
    }else{
      console.log(`n.removeActor:FAILED to remove actor with name ${name}!!`); 
    }
  }

  // following two functions are for actor report and fetch
  reportActors(display=false):Record<string, THREE.Object3D>{
    console.log(`\nnarrative.reportActors() display=${display}`);
    if(display){
      for(const [k,v] of Object.entries(cast)){
        console.log(`cast contains actor ${v} with name ${k}`); 
          // and actor.name ${v.name}`);
      }
    }
    return cast;
  }

  findActor(name:string):THREE.Object3D{
    //console.log(`\nnarrative.findActor: seeking actor name=${name}`);
    if(name && name.length > 0){
      if(cast[name]){
        //console.log(`narrative.find: cast[${name}] = ${cast[name]}`);
        return cast[name];
      }else{
        //console.log(`actor name ${name} NOT found - returning undefined!`); 
        return undefined;
      }
    }else{
      console.log(`actor name ${name} is malformed - returning undefined!`); 
      return null;
    }
  }

}//Narrative


// enforce singleton export
Narrative.create();
export {narrative};
