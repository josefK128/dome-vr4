// seq-actorbezier.ts
// test sequence for services/animation.ts 
// 
// NOTE:for actorBezier actions o.values is an Object[3] which are the
// three defining vec3 points of a Quadratic bezier curve:
// start
// control
// end

import {Action} from '../../action.interface';


export const actions:Action[] = [
       {t:'narrative',
        f:'foo',
        a:'o',
        o: {a:2, b:3},
        ms:1000},


       {t:'animation',
        f:'addActorBezier',
        a:'o',
        o:{
          actors:{
            'unitcube.position':{
               duration:10,            //duration(secs)
               type:'quadratic',
               autoRotate:true,
               yoyo:true,
               delay:1,
               values:[                 //quadratic bezier coords
                 {x:0.0,y:0.0,z:-0.5},  //arc in positive-x half-plane
                 {x:0.15, y:0.5,z:-0.5}, 
                 {x:0.35,y:0.0,z:-0.5} 
               ],
               start_time:0,     //time position in timeline duration cycle
               onStart:function():void{
                 console.log(`***add: onStart`);
               },
               onRepeat:function():void{
                 console.log(`***add: onRepeat`);
               },
               onComplete:function():void{
                 console.log(`***add: onComplete`);
               }
            }
          }//actors
        },//o
        ms:2000},


       {t:'animation',
        f:'modifyActorBezier',
        a:'o',
        o:{
          actors:{
            'unitcube.position':{
              //yoyo:true,   
              onStart:function():void{
                console.log(`***modified: onStart`);
              },
              onRepeat:function():void{
                console.log(`***modified: onRepeat`);
              },
              onComplete:function():void{
                console.log(`***modified: onComplete`);
              },
              delay:0,
              values:[                 //quadratic bezier coords
                {x:0.0,y:0.0,z:-0.5},  //arc in negative-x half-plane
                {x:-.15, y:0.5,z:-0.5}, 
                {x:-.35,y:0.0,z:-0.5} 
              ]
            }
          }//actors
        },//o
        ms:30000},


       {t:'animation',
        f:'removeActorBezier',
        a:'o',
         o:{
           actors:{
             'unitcube.position':{
               timeline_name:'vr_timeline'
             }
           }
        },
        ms:90000}
];
