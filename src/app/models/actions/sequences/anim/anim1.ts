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

//       {t:'vrlens',
//        f:'fov',
//        a:'n',
//        o: {'fov':60.0},
//        ms:2000
//       }

//       {t:'vrcsphere',
//        f:'rotateZ',
//        a:'n',
//        o: {'arg':0.785},
//        ms:2000
//       },
//
//       {t:'vrcsphere',
//        f:'translateX',
//        a:'n',
//        o: {'arg':0.785},
//        ms:4000
//       },


//       {t:'animation',
//        f:'perform',
//        ms:10000,
//        a:'o',
//        o: {
//          timeline:{
//          },
//          actors:{
//            'vrcsphere~material':{
//              'opacity':0.0,
//              duration:5,
//              repeat:-1,
//              yoyo:true
//            }
//
//          }
//        }//anim
//       }//animation.perform
];
