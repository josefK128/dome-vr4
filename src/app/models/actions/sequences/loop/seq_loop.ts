// seq-loop.ts

/*
    // services/Director.exec(a) - action a
    // invoke method on target, or set a property on target by assignment
    if(a.f){   // invoke method a.f <action.function>
      try{
        switch(a.a){
          case 'o':             // a.f has type Object arg
            target[a.f](a.o);
            break;
          case 'v':           // a.f has type void arg 
            target[a.f]();
            break;
          case 'm':         // multiple args in a.f signature exp: a.f(a,b,c)
            target[a.f](...a.o['arg']);    // a.o[arg] MUST be array of args!
            break;
          default:
            target[a.f](a.o['arg']);     // default is single non-Object arg  
            break;
        }
      }catch(e){
        console.error(`error invoking ${a.t}.${a.f}: ${e}`);
      }
 */
// test sequence load
import {Action} from '../../action.interface';


export const actions:Action[] = [
       {t:'unitcube',
        f:'rotateY',
        a:'n',
        o: {'arg':1.0},
        ms:5000},
       {t:'unitcube',
        f:'rotateY',
        a:'n',
        o: {'arg':-1.0},
        ms:10000},
       {t:'narrative',
        f:'sequence',
        a:'n',
        o:{'arg':'./app/models/actions/sequences/loop/seq_loop'},
        ms:15000}
];


