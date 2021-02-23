// seq1.ts

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
       {t:'narrative',
        f:'foo',
        a:'o',
        o: {a:1, b:2},
        ms:5000},
       {t:'narrative',
        f:'foo',
        a:'o',
        o: {a:2, b:3},
        ms:10000},
       {t:'narrative',
        f:'bar',
        a:'v',
        ms:15000},
       {t:'narrative',
        f:'baz',
        a:'m',
        o: {arg:['hello', 7, [1,2,3]]},
        ms:20000},
       {t:'unitcube',
        a:'n',
        o: {'visible':false},
        ms:25000},
       {t:'unitcube',
        a:'n',
        o: {'visible':true},
        ms:30000},
       {t:'unitcube',
        f:'rotateY',
        a:'n',
        o: {'arg':1.0},
        ms:35000},
       {t:'unitcube',
        f:'rotateY',
        a:'n',
        o: {'arg':-1.0},
        ms:40000},
       {t:'narrative.o1.o2',
        f:'f',
        a:'v',
        ms:45000}
];


