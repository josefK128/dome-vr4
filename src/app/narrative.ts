// narrative.ts
// bootstrap controller


// scene
import {Config} from './scenes/config.interface';
import {State} from './scenes/state.interface';
//// services
//import {mediator} from './services/actions/mediator';
//import {director} from './services/actions/director';
//import {queue} from './services/actions/queue';
//import {transform3d} from './services/transform3d';
//import {animation} from './services/animation';
//// state
//import {stage} from './state/stage';
//import {camera} from './state/camera';
//import {actions} from './state/actions';
//// models
//import {Actor} from './models/stage/actors/actor.interface';  
//import {Action} from './models/actions/action.interface';
//import {vrcontrols} from './models/camera/controls/vrcontrols';  
//import {vrkeymap} from './models/camera/keymaps/vrkeymap';  
//// for actors/cloud/spritecloud.ts
//import TWEEN from '../libs/tween.js/tween.esm';


// singleton closure-instance variable
let narrative:Narrative;


class Narrative {
  // ctor
  private constructor(){
    narrative = this;
  } 

  static create(){
    console.log(`\n\n\n\n\n narrative.create !!!!!!!!!!!!!!!!!!!!!!!`);
    if(narrative === undefined){
      narrative = new Narrative();
    }
  }

  foo(){
    return 'foo';
  }

  // set up rendering framework and initialize services and state 
  //bootstrap(_config:Config, state:State){
  bootstrap(_config:Config, state:State){
    console.log(`\nnarrative.bootstrap:`);
    console.log(`_config = ${_config} state = ${state}`);
  }

}//Narrative


// enforce singleton export
Narrative.create();
export {narrative};
