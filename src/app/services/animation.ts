// animation.ts
// NOTE!: need TweenMax, TimelineMax Quad

// interface to access actor methods of narrative - passed in at initialization
import {Cast} from '../cast.interface.js';
import {Config} from '../scenes/config.interface.js';

// services
// director used to execute shot-actions - director.exec({})
import {director} from './actions/director.js';



// singleton instance - exported
let animation:Animation,
    narrative:Cast,  // source for actor methods
    actionsTargets:Record<string,unknown>;  // possible actions['t'] for anim

const timeline = (shot:Record<string,unknown>) => {
  const _timeline = <Record<string,unknown>>shot['timeline'] || {},
        tlp = <Record<string,unknown>>_timeline['p'] || {},
        actors = <Record<string,unknown>>_timeline['actors'] || {},
        emptyf = () => {return;};
  
  let ntuple:string[],
      target:Record<string,unknown>,  // target obj for property to be tweened - animated
      tweens:Record<string,unknown>[],
      quad_m:THREE.ShaderMaterial,
      hud_m:THREE.ShaderMaterial;

  // timeline ctor params - tlp
  tlp.timeScale = <number>tlp['timeScale'] || 1.0;
  tlp.repeat = <number>tlp['repeat'] || 0;
  tlp.repeatDelay = tlp['repeatDelay'] || 0;
  tlp.yoyo = tlp['yoyo'] || true;
  tlp.ease = tlp['ease'] || Power1.easeInOut;
  tlp.paused = tlp['paused'] || false; // default
  tlp.immediateRender = tlp['immediateRender'] || false; // default

  // callbacks & params
  tlp.onStart = tlp['onStart'] || emptyf;      
  tlp.onStartParams = tlp['onStartParams'] || [];

  // TEMP !!!!
  tlp.onUpdate = tlp['onUpdate'] || emptyf;      
  tlp.onUpdateParams = tlp['onUpdateParams'] || [];
  //tlp.onUpdate = console.log;      
  //tlp.onUpdateParams = [`timeline-update`];

  tlp.onComplete = tlp['onComplete'] || emptyf;      
  tlp.onCompleteParams = tlp['onCompleteParams'] || [];
  tlp.onReverseComplete = tlp['onReverseComplete'] || emptyf;      
  tlp.onReverseCompleteParams = tlp['onReverseCompleteParams'] || [];



  // iterate through actors on which one or more tweens are defined
  for(const a of Object.keys(actors)){
    console.log(`actor = ${a}`);

    ntuple = a.split('~');
    console.log(`ntuple = ${ntuple.join('~')}`);  
    if(!ntuple[0]){
      continue;  // bail if first slot is empty
    }


    // determine target of property animation
    if(ntuple[0].match(/target/)){
      target = <Record<string,unknown>>actionsTargets[ntuple[0]];
      if(ntuple[1]){target = <Record<string,unknown>>target[ntuple[1]];}
      if(ntuple[2]){target = <Record<string,unknown>>target[ntuple[2]];}
    }else{
      if(ntuple[0].match(/uniform/)){
        //console.log(`ntuple[0] matches /uniform/`);
        //console.log(`ntuple[1] = ${ntuple[1]}`);
        if(ntuple[1].match(/quad/)){
          quad_m = (<THREE.Mesh>narrative.findActor(ntuple[1])).material;
          //console.log(`ntuple[1] matches /quad/`);
          //for(let p of Object.keys(quad_m.uniforms)){
          //  console.log(`quad_m has uniform ${p}`);
          //}
          //console.log(`ntuple[2] = ${ntuple[2]}`);
          target = quad_m.uniforms[ntuple[2]];
        }
        if(ntuple[1].match(/hud/)){
          hud_m = (<THREE.Mesh>narrative.findActor(ntuple[1])).material;
          //console.log(`ntuple[1] matches /hud/`);
          //for(let p of Object.keys(hud_m.uniforms)){
          //  console.log(`hud_m has uniform ${p}`);
          //}
          target = hud_m.uniforms[ntuple[2]];
        }
      }else{
        target = <THREE.Object3D>narrative.findActor(ntuple[0]);
        if(ntuple[1]){target = <THREE.Object3D>target[ntuple[1]];}
        if(ntuple[2]){target = <THREE.Object3D>target[ntuple[2]];}
      }
    }
    //console.log(`target = ${target}`);
    //if(target && target['value']){
    //  console.log(`target['value'] = ${target['value']}`);
    //}
  
    if(!target){
      continue;  // bail if target is undefined|unknown
    }


    // insert tween defaults if not specified
    // add actor tween array(s) to tlp.tweens array
    tlp.tweens = tlp['tweens'] || [];
    tweens = <Record<string,unknown>[]>actors[a];
    for(const tween of tweens){
      // dur - duration of the tween animation
      if(tween.dur === undefined){
        tween.dur = 10;
      }

      // property to animate - tween['p'] = {{name:value}, ...}
      tween.p = <Record<string,unknown>>((<TweenMax>tween)['p']) || {};

      // other tween.p properties - nearly identical to timeline-tlp properties
      tween.p['timeScale'] = <number>(tween['p']['timeScale']) || 1.0;
      tween.p['repeat'] = <number>(tween.p['repeat']) || 0;
      tween.p['repeatDelay'] = <number>(tween.p['repeatDelay']) || 0;
      tween.p['yoyo'] = <boolean>(tween.p['yoyo']) || true;
      tween.p['ease'] = tween.p['ease'] || Quad.easeInOut;
//      tween.p.paused = tween.p['paused'] || true; // default DO NOT USE!!!!
      tween.p['immediateRender'] = <boolean>(tween.p['immediateRender']) || false; // default
      tween.p['delay'] = <number>(tween['delay']) || '0';
    
      // callbacks & params
      tween.p['onStart'] = tween.p['onStart'] || emptyf;      
      tween.p['onStartParams'] = tween.p['onStartParams'] || [];

      // update - if target is uniform target.needsUpdate=true
      //quad.material.uniforms.uCam_up.needsUpdate = true;
      if(ntuple[0].match(/uniform/)){
        if(ntuple[1].match(/quad/)){
          //console.log(`tween:ntuple[1] matches /quad/`);
          tween.p['onUpdate'] = () => {
            quad_m.uniforms[ntuple[2]]['needsUpdate']=true;
            //console.log(`u.value = ${quad_m.uniforms[ntuple[2]]['value']}`);
          };
          quad_m.uniforms[ntuple[2]]['needsUpdate']=true;
          //console.log(`q.u.u = ${quad_m.uniforms[ntuple[2]]}`);
          //console.log(`q.u.u.nUpdt = ${quad_m.uniforms[ntuple[2]]['needsUpdate']}`);
        }else{  
          console.log(`tween:ntuple[1] matches /hud/`);
          tween.p['onUpdate'] = ()=>{hud_m.uniforms[ntuple[2]]['needsUpdate']=true;};
          hud_m.uniforms[ntuple[2]]['needsUpdate']=true;
          //console.log(`q.u.u = ${hud_m.uniforms[ntuple[2]]}`);
          //console.log(`q.u.u.nUpdt = ${hud_m.uniforms[ntuple[2]]['needsUpdate']}`);
        } 
      }else{
        tween.p['onUpdate'] = tween.p['onUpdate'] || emptyf;      
      }
      tween.p['onUpdateParams'] = tween.p['onUpdateParams'] || [];

      // onComplete
      tween.p['onComplete'] = tween.p['onComplete'] || emptyf;      
      tween.p['onCompleteParams'] = tween.p['onCompleteParams'] || [];
      tween.p['onReverseComplete'] = tween.p['onReverseComplete'] || emptyf;  
      tween.p['onReverseCompleteParams'] = tween.p['onReverseCompleteParams'] || [];

      // add tween to tlp.tweens array
      (<Tweenmax[]>tlp['tweens']).push(TweenMax.to(target, tween.dur, tween.p));
    }
  }//actors


  // return primed timeline
  return new TimelineMax(tlp);
};//timeline() 
            



class Animation {

  constructor() {
    console.log(`Animation ctor`);
  }


  // actionsTargets are the first name determing the action exec 'signature'
  // narrative reference is needed to fetch actors if action-target (a.t)
  // is not in actionsTargets name-keys
  initialize(config:Config):void{
    console.log(`services/animation initializing`);
    actionsTargets = config['actionsTargets'] || {};
    narrative = config['actionsTargets']['narrative'];
  }


  // NOTE: reverse=true if back-button, but also if choosing scene sequence
  // such as: (1) sceneA, (2) sceneB, (3) sceneA => reverse=true
  perform(shot:Record<string,unknown>={}, reverse=false){

    // diagnostics
    console.log(`Animation.perform: shot = ${shot}`);
    //console.log(`Animation.perform: reverse = ${reverse}`);
    
    // prepare timeline for shot
    const tl:TimelineMax = timeline(shot);
    //console.log(`tl = ${tl}`);
    //console.dir(tl);


    // timeline - if back - run anim in reverse, else forward
    //console.log(`Animation.perform: playing tl = ${tl}`);
    if(reverse === true){
      tl.seek(tl.duration());
      tl.reverse();
    }else{
      tl.play();
    }
  }//perform
}//class Animation


// enforce singleton export
if(animation === undefined){
  animation = new Animation();
}
export {animation};

