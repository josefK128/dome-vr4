// actions.ts 
import {Action} from '../models/actions/action.interface';
import {queue} from '../services/actions/queue';

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
  delta(state:Record<string,unknown>={}):Promise<Record<string,unknown>>{
    console.log(`\n state/actions.delta state:`);
    console.dir(state);

    const result:Record<string,unknown> = {actions:{}};

    return new Promise((resolve, reject) => {
      // process state
      if(state && Object.keys(state).length > 0){
        const _actions = state['_actions'],
              sequence_url = state['sequence_url'];

        //diagnostics
        //console.log(`actions: _actions=${_actions}:`);
        //console.log(`actions: sequence_url=${sequence_url}:`);

        if(_actions === false){   // _actions:f => load []
          queue.load([]);
          result['_actions'] = false;
          resolve(result);     // don't reject because ruins Promise.all
          //reject(new Error("emptying queue failed")); 
        }else{               // _actions:t => load actions[] from sequence_url
          if(sequence_url){ 
            import(sequence_url as string).then((sequence) => {

              // diagnostics
              //console.log(`sequence=${sequence}:`);
              //console.dir(sequence);
              //console.log(`sequence['actions'] = ${sequence['actions']}`);

              if(sequence['actions']){
                if(_actions === true){
                  queue.load(sequence['actions']);
                }else{  // undefined
                  queue.append(sequence['actions']);  // append actions to queue
                }
              }
              result['_actions'] = _actions;
              resolve(result); // don't reject because ruins Promise.all
              //reject(new Error("emptying queue failed")); 
            });
          }
          resolve(result);  // don't reject because ruins Promise.all
          //reject(new Error("stage: malformed state:undefined or {}")); 
        }
      }else{
        resolve(result); //{}
      }
    });//return Promise
  }//delta
}//Actions


Actions.create();
export {actions};
