// anim1.ts
// test anim-sequence 
import {Action} from '../../action.interface';


export const actions:Action[] = [
       {t:'narrative',
        f:'foo',
        a:'o',
        o: {a:1, b:2},
        ms:1000
       },

       {t:'animation',
        f:'perform',
        ms:1000,
        a:'o',
        o: {
          timeline:{
          },
          actors:{
            'vrcsphere~material':{
              'opacity':0.0,
              duration:5,
              repeat:-1
            }
          }
        }//anim
       }//animation.perform
];
