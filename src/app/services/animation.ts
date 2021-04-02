// animation.ts
// NOTE!: need TweenMax, TimelineMax Quad

// interface to access actor methods of narrative - passed in at initialization
import {Cast} from '../cast.interface.js';
import {Config} from '../scenes/config.interface.js';




// singleton instance - exported
let animation:Animation,
    actionsTargets:Record<string,unknown>,
    narrative:Cast;  // source for actor methods


const timeline = (anim:Record<string,unknown>):TimelineMax => {
  const tlp = <Record<string,unknown>>anim['timeline'] || {},
        actors = <Record<string,unknown>>anim['actors'] || {},
        startf = ():void => {console.log('start!!');},
        emptyf = ():void => {return;},
        completef = ():void => {console.log('complete!!');};
  
  let ntuple:string[],
      target:Record<string,unknown>,  // target obj for property to be tweened - animated
      tweens:TweenMax[];



  // timeline ctor params - tlp
  tlp.duration = tlp['duration'] || 10;
  //tlp.timeScale = <number>tlp['timeScale'] || 1.0;
  tlp.repeat = <number>tlp['repeat'] || 0;
  tlp.repeatDelay = tlp['repeatDelay'] || 0;
  tlp.yoyo = tlp['yoyo'] || true;
  tlp.ease = tlp['ease'] || Power1.easeInOut;
  tlp.paused = tlp['paused'] || false; // default
  tlp.immediateRender = tlp['immediateRender'] || false; // default

  // callbacks & params
  tlp.onStart = tlp['onStart'] || startf;      
  tlp.onStartParams = tlp['onStartParams'] || [];

  // TEMP !!!!
  //tlp.onUpdate = tlp['onUpdate'] || emptyf;      
  //tlp.onUpdateParams = tlp['onUpdateParams'] || [];
  //tlp.onUpdate = console.log;      
  //tlp.onUpdateParams = [`timeline-update`];

  tlp.onComplete = tlp['onComplete'] || completef;      
  tlp.onCompleteParams = tlp['onCompleteParams'] || [];
  tlp.onReverseComplete = tlp['onReverseComplete'] || completef;      
  tlp.onReverseCompleteParams = tlp['onReverseCompleteParams'] || [];



  // iterate through actors on which one or more tweens are defined
  tlp['tweens'] = [];
  for(const a of Object.keys(actors)){
    console.log(`\n\n @@@@animation target = ${a}`);
    console.dir(a);

    //tween
    const ntuple:string[] = a.split('~'),
          tweenp:Record<string,unknown> = <Record<string,unknown>>actors[a],
          duration:number = a['duration'] || 10.0;

    //console.log(`ntuple = ${ntuple}`);
    //console.log(`ntuple[0] = ${ntuple[0]}`);

    const actor:THREE.Object3D = narrative.findActor(ntuple[0]);
    let target:Record<string,unknown> = actor;

    //narrative.reportActors(true);
    //console.log(`actor.name = ${actor.name}`);

    for(let i=1; i<ntuple.length; i++){
      //console.log(`initial target = ${target}`);
      target = <Record<string,unknown>>target[ntuple[i]];
      console.log(`extended target = ${target}:`);
      console.dir(target);
    }

    //console.log(`tweenp = actors[a] w. type = ${typeof actors[a]}:`);
    //console.dir(actors[a]);
    

    // other tweenp properties - nearly identical to timeline-tlp properties
    //tweenp['timeScale'] = <number>(tweenp['timeScale']) || 1.0;
    tweenp['repeat'] = <number>(tweenp['repeat']) || 0;
    tweenp['repeatDelay'] = <number>(tweenp['repeatDelay']) || 0;
    tweenp['yoyo'] = <boolean>(tweenp['yoyo']) || true;
    tweenp['ease'] = tweenp['ease'] || Quad.easeInOut;
//      tweenp.paused = tweenp['paused'] || true; // default DO NOT USE!!!!
    tweenp['immediateRender'] = <boolean>(tweenp['immediateRender']) || false; // default
    tweenp['delay'] = <number>(tweenp['delay']) || '0';
    
      // callbacks & params
    tweenp['onStart'] = tweenp['onStart'] || startf;      
    tweenp['onStartParams'] = tweenp['onStartParams'] || [];
    //tweenp['onUpdate'] = tweenp['onUpdate'] || emptyf;      
    //tweenp['onUpdateParams'] = tweenp['onUpdateParams'] || [];
    tweenp['onComplete'] = tweenp['onComplete'] || completef;      
    tweenp['onCompleteParams'] = tweenp['onCompleteParams'] || [];
    tweenp['onReverseComplete'] = tweenp['onReverseComplete'] || completef;  
    tweenp['onReverseCompleteParams'] = tweenp['onReverseCompleteParams'] || [];

    // add tween to tlp.tweens array
//    console.log(`target = ${target}:`);
//    console.dir(target);
//    console.log(`duration = ${duration}`);
    console.log(`tweenp = ${tweenp}:`);
    console.dir(tweenp);
    (<Tweenmax[]>tlp['tweens']).push(TweenMax.to(target, duration, tweenp));

  }//actors


  // return primed timeline
  return new TimelineMax(tlp);
};//timeline() 
            



class Animation {

  constructor() {
    //console.log(`Animation ctor`);
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
  perform(anim:Record<string,unknown>={}):void{

    // diagnostics
    console.log(`Animation.perform: anim = ${anim}:`);
    console.dir(anim);

    
    // prepare timeline for anim
    const tl:TimelineMax = timeline(anim);
    console.log(`tl = ${tl}`);
    console.dir(tl);


    // timeline - if back - run anim in reverse, else forward
    console.log(`Animation.perform: playing tl = ${tl}`);
    tl.play();
  }//perform



  perform_reverse(anim:Record<string,unknown>={}):void{

    // diagnostics
    console.log(`Animation.perform: anim = ${anim}`);
    //console.log(`Animation.perform: reverse = ${reverse}`);
    
    // prepare timeline for anim
    const tl:TimelineMax = timeline(anim);
    //console.log(`tl = ${tl}`);
    //console.dir(tl);


    // timeline - if back - run anim in reverse, else forward
    //console.log(`Animation.perform: playing tl = ${tl}`);
    tl.seek(tl.duration());
    tl.reverse();
  }//perform

}//class Animation


// enforce singleton export
if(animation === undefined){
  animation = new Animation();
}
export {animation};

