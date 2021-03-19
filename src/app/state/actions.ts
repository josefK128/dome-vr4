// actions.ts 
// actions - _actions:t/f/undefined => load, empty or append to queue
// NOTE: queue.load(sequence), queue.load([]) and queue.append(seq)
// all done in state/actions.ts - result['actions'] merely reports 
// what was done in state/actions.ts
// _actions:true=>load(seq), _actions:undefined=>append(seq),     
// _actions:false=>load([]


import {Action} from '../models/actions/action.interface';
import {Cast} from '../cast.interface';
import {queue} from '../services/actions/queue.js';


// singleton closure-instance variable
let actions:Actions;



class Actions {

  // ctor
  private constructor(){
    actions = this;
  } //ctor

  static create(){
    if(actions === undefined){
      actions = new Actions();
    }
  }


  // new Promise<Record<string,unknown>>((resolve, reject) => {});
  // state['_actions']: t=>q.load; f=>empty queue; undefined=>append to queue
  delta(state:Record<string,unknown>={}, narrative:Cast):Promise<number>{
    //console.log(`\n state/actions.delta state:`);
    //console.dir(state);

    const result:Record<string,unknown> = {actions:{}};
    const devclock = narrative['devclock'];
    //console.log(`devclock = ${devclock}`);


    return new Promise((resolve, reject) => {
      // process state
      if(state && Object.keys(state).length > 0){
        const _actions = state['_actions'],
              sequence_url = state['sequence_url'];

        //diagnostics
        //console.log(`actions: _actions=${_actions}:`);
        console.log(`actions: sequence_url=${sequence_url} _actions=${_actions}:`);

        if(_actions === false){   // _actions:f => load []
          queue.load([]);
          result['_actions'] = false;
          resolve(devclock.getElapsedTime());     // don't reject because ruins Promise.all
          //reject(new Error("emptying queue failed")); 
        }else{               // _actions:t => load actions[] from sequence_url
          if(sequence_url){ 
            import(sequence_url as string).then((sequence) => {

              if(sequence['actions']){
                if(_actions === true){
                  queue.load(sequence['actions']);
                }else{  // undefined
                  queue.append(sequence['actions']);  // append actions to queue
                }
              }
              resolve(devclock.getElapsedTime()); // don't reject because ruins Promise.all
              //reject(new Error("emptying queue failed")); 
            });
          }
          resolve(devclock.getElapsedTime());  // don't reject because ruins Promise.all
          //reject(new Error("stage: malformed state:undefined or {}")); 
        }
      }else{
        resolve(devclock.getElapsedTime()); //{}
      }
    });//return Promise
  }//delta
}//Actions


Actions.create();
export {actions};
