// queue.ts - holds timed actions 

import {Config} from '../../scenes/config.interface';
import {Action} from '../../models/actions/action.interface';

// singleton closure-instance variable
let queue:Queue;


class Queue {
  private fifo:Action[];


  private constructor() {
    queue = this;
    queue.fifo = [];  
  }

  static create(){
    if(queue === undefined){
      queue = new Queue();
    }
  }

  initialize(config:Config):void{
    //console.log(`services/actions/queue initializing config=${config}`);
  }

  load(actions:Action[] = []):void{
    //deep clone actions
    //queue.fifo = actions;
    queue.fifo = JSON.parse(JSON.stringify(actions));
  }

  append(actions:Action[] = []):void{
    //deep clone actions
    //queue.fifo.concat(actions);
    queue.fifo.concat(JSON.parse(JSON.stringify(actions)));
  }

  push(a:Action):void{
    queue.fifo.push(a);
  }

  pop():Action{
    return (queue.fifo.length > 0 ? queue.fifo.shift() : null);
  }

  peek():Promise<Action>{
    return new Promise((resolve, reject) => {
      if(queue.fifo.length > 0){
        resolve(queue.fifo[0]);
      }else{
        reject('queue is empty');
      }
    });
  }
}


// enforce singleton export
Queue.create();
export {queue};

