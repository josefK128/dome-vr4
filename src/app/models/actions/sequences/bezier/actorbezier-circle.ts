// seq-actorbezier-alt.ts
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
               type:'thru',
               autoRotate:true,
               yoyo:false,
               delay:1,
               values:[                 //quadratic bezier coords
                 {x:0.0,y:0.0,z:-0.5},  //arc in positive-x half-plane
                 {x:0.45, y:0.3,z:-0.5}, 
                 {x:0.0,y:0.5,z:-0.5}, 
                 {x:-0.45, y:0.3,z:-0.5}, 
                 {x:0.0,y:0.0,z:-0.5} 
               ],
               start_time:0,     //time position in timeline duration cycle
               onStart:function():void{
                 console.log(`***add thru: onStart`);
               },
              onRepeat:function():void{
                 console.log(`***add thru: onRepeat`);
               },
              onComplete:function():void{
                 console.log(`***add thru: onComplete`);
               }
            }
          }//actors
        },//o
        ms:20000},


       {t:'animation',
        f:'modifyActorBezier',
        a:'o',
        o:{
          actors:{
            'unitcube.position':{
              onStart:function():void{
                console.log(`***modified thru: onStart`);
              },
              onRepeat:function():void{
                console.log(`***modified thru: onRepeat`);
              },
              onComplete:function():void{
                console.log(`***modified thru: onComplete`);
              },
            }
          }//actors
        },//o
        ms:40000},


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
        ms:60000}

];
