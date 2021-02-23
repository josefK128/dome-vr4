// director.ts 
import {Config} from '../../scenes/config.interface';
import {Cast} from '../../cast.interface';
import {Action} from '../../models/actions/action.interface';
import {Actor} from '../../models/stage/actors/actor.interface';
import {queue} from './queue.js';


// singleton closure-instance variable
let director:Director,
    actionsTargets:Record<string,unknown>,
    narrative:Cast; // needed to fetch actors
    

class Director {

  // ctor
  private constructor(){
    director = this;
  } //ctor

  static create():void{
    if(director === undefined){
      director = new Director();
    }
  }


  // actionsTargets are the first name determing the action exec 'signature'
  // narrative reference is needed to fetch actors if action-target (a.t)
  // is not in actionsTargets name-keys
  initialize(config:Config):void{
    console.log(`services/actions/director initializing`);
    actionsTargets = config['actionsTargets'] || {};
    narrative = config['actionsTargets']['narrative'];
  }


  // peek at queued actions - compare current elapsed time to action timestamp
  // execute action if timestamp < et
  // NOTE: called in animation-render loop - so approx every 16ms. (60 fps)
  // NOTE: et is sent in from clock maintaining elapsed rendering time
  // NOTE: queue.peek() returns a Promise so await below is asynchronous, and
  // thus execution returns to the animation-render loop to complete the frame
  async look(et:number){
    let done = false;
    while(!done){
      try{
        const action = <Action>await queue.peek(); //promise returned by 
                // queue.peek() resolves to queue.fifo[0] if it exists
        // if exists, test the timestamp against elapsed time et
        // promise resolved => action exists - so the first check is unneeded
        if(action && action['ms'] < et){
          console.log(`director.look: action['ms']=${action['ms']} et=${et}`);
          director.exec(<Action>queue.pop());
        }else{
          done=true;   // no actions are ready to be executed
        }
      } catch(e) {   //promise returned by queue.peek() rejected => queue empty
        done=true;
        break;
      }
    }
  }//look


  // execute action by composing the action execution signature
  // NOTE: a is action - arg is maximally shortened for simplest signatures
  // see models/actions/action.interface.ts
  // NOTE: if a.t does not exist in actionsTargets, then we can assume a.t is an
  // actor name and fetch the actor using narrative.findActor(name:string)
  exec(a:Action):void{
    console.log(`\ndirector.exec: a.t=${a.t} a.f=${a.f} a.a=${a.a} a.o=${a.o} ${a.ms}`);

    // set target
    const names:string[] = a.t.split('.'), //possibly multiple exp:'a.b.c'
        name:string = names[0];

    let target:Record<string,unknown>;


    if(actionsTargets[name]){
      target = <Record<string,unknown>>actionsTargets[name];   // named target in config.actionsTargets list
    }else{
      target = narrative['findActor'](name); // name not in actionsTargets => actor
      if(!target){
        console.error(`name ${name} NOT found in actionsTargets or n.actors!`);
        return;
      }
    }

    // if target has multiple name exp:'a.b.c'
    if(names.length > 1){
      for(let i=1; i<names.length; i++){
        target = <Record<string,unknown>>target[names[i]];   // append next embedded name
        console.log(`adding ${names[i]} to target now = ${target}`);
        console.dir(target);
      }
    }


    // invoke method on target, or set a property on target by assignment
    if(a.f){   // invoke method a.f <action.function>
      try{
        switch(a.a){
          case 'o':             // a.f has type Object arg
            (<(...unknown)=>unknown>target[a.f])(a.o);
            break;
          case 'v':           // a.f has type void arg 
            (<(...unknown)=>unknown>target[a.f])();
            break;
          case 'm':         // multiple args in a.f signature exp: a.f(a,b,c)
             (<(...unknown)=>unknown>target[a.f])(...<unknown[]>a.o['arg']);    // a.o[arg] MUST be array of args!
            break;
          default:
             (<(...unknown)=>unknown>target[a.f])(a.o['arg']);     // default is single non-Object arg  
            break;
        }
      }catch(e){
        console.error(`error invoking ${a.t}.${a.f}: ${e}`);
      }
    }else{     // set property of target by assignment
      try{
        for(const [n,v] of Object.entries(a.o)){
          // n is property name, v is property value
          target[n] = v;
        }
      }catch(e){
        console.error(`error assigning ${a.o} to ${target}: ${e}`);
      }
    }
  }//exec
}//Director


Director.create();
export {director};
