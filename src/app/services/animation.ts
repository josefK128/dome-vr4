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
    console.log(`animation.perform ${shot}`);
  }//perform
}//class Animation


// enforce singleton export
if(animation === undefined){
  animation = new Animation();
}
export {animation};

