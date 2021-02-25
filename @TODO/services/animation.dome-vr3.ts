/* eslint prefer-const: 0 */  // --> OFF
/* 
caused 18 flags of prefer-const for assignment to previously declared 
block variables (exp: let foo;)

C:\public\tsjs\dome-vr4\src\app\services\animation.ts
581:7  error  'pduration' is never reassigned. Use 'const' instead     prefer-const
 582:7 error  'pstartTime' is never reassigned. Use 'const' instead prefer-const
 583:7 error  'pdelay' is never reassigned. Use 'const' instead     prefer-const
 584:7 error  'prepeat' is never reassigned. Use 'const' instead    prefer-const
 585:7 error  'prepeatDelay' is never reassigned. Use 'const' insteaprefer-const
 586:7 error  'pyoyo' is never reassigned. Use 'const' instead      prefer-const
 587:7 error  'pease' is never reassigned. Use 'const' instead      prefer-const
 588:7 error  'ponStart' is never reassigned. Use 'const' instead   prefer-const
 589:7 error  'ponRepeat' is never reassigned. Use 'const' instead  prefer-const
 590:7 error  'ponComplete' is never reassigned. Use 'const' insteadprefer-const
 591:7 error  'ponUpdate' is never reassigned. Use 'const' instead  prefer-const
 592:7 error  'ptype' is never reassigned. Use 'const' instead      prefer-const
 593:7 error  'pcurviness' is never reassigned. Use 'const' instead prefer-const
 594:7 error  'pautoRotate' is never reassigned. Use 'const' insteadprefer-const
 655:7 error  'type' is never reassigned. Use 'const' instead       prefer-const
  656:7  error  'curviness' is never reassigned. Use 'const' insteadprefer-const
  657:7  error  'autoRotate' is never reassigned. Use 'const' insteaprefer-const
  667:7  error  'ease' is never reassigned. Use 'const' instead     prefer-const

? 18 problems (18 errors, 0 warnings)
*/

// animation.ts
// NOTE!: need global gsap namespace refs TimelineMax and TweenMax
// singleton instance - exported


// closure vars
let animation:Animation,
       targets:Record<string,unknown> = {},  // possible sources for animation 
    narrative:Record<string,unknown>, // source for actors via narrative.findActor(name:string)
                     // and as holder for narrative.rm_positions n.rm_timeline
    sg_timeline:TimelineMax,
    vr_timeline:TimelineMax;
    
const timelines:Record<string,unknown> = {},  // record timelines by name for subsequent actions
      delayed_calls = function(target:Record<string,unknown>, cycle_end=true){
      console.log(`*** delayed_calls cycle_end=${cycle_end} target=${target}:`);
      console.dir(target);

      if(cycle_end){
        console.log(`target['modify']=${target['modify']}`);
        console.log(`target['remove']=${target['remove']}`);
  
        if(target['modify']){
          console.log(`***delayed_calls: ${target}['modify']()`);
          target['modify'](); 
          target['modify']=undefined;
        }
        if(target['remove']){
          console.log(`***delayed_calls: ${target}['remove']()`);
          target['remove'](); 
          target['remove']=undefined;
        }
      }//cycle_end:true
    };



class Animation {

  private constructor() {
    animation = this;
  }

  static create(){
    if(animation === undefined){
      animation = new Animation();
    }
  }

  initialize(config:Record<string,unknown>, _narrative:Record<string,unknown>):void{
    console.log(`services/animation initializing`);

    targets = config['targets'];
    narrative = _narrative;

    // create and start sg-actors-timeline, vr-actors-timeline
    // 'vr_timeline' is the default timeline
    sg_timeline = new TimelineMax({
      duration:10,
      repeat:-1,
      paused:true
    });
    timelines['sg_timeline'] = sg_timeline;

    vr_timeline = new TimelineMax({
      //onRepeat:function(){origin},   // FAILS?!
      duration:10,
      repeat:-1,
      paused:true
    });
    timelines['vr_timeline'] = vr_timeline;

    //diagnostics
    console.log(`$$$$ vr_timeline:`);
    console.dir(vr_timeline);
    //console.log(`vr_timeline.vars.onRepeat=${vr_timeline['vars']['onRepeat']}`);
    //vr_timeline['vars']['onRepeat'] = origin;
    //vr_timeline['vars']['onRepeat']();

    // label and callback
    //vr_timeline.addLabel('origin','0');
    //vr_timeline.call(origin);        // FAILS?!
    //vr_timeline.add(origin, 0);      // FAILS?!
  }


  // addrmBezier
  //
  // construct and execute the animation given by options
  // action = { t:'animation',
  //            f:'addrmBezier',
  //            a:'o',
  //            ms:0,
  //
  //       o:{                         // options
  //         timeline_name?:string,   //default 'rm_timeline'
  //         rm_index:number,        //rm_positions index to 'add'
  //         duration?:number,      //default 10sec
  //         start_time?:number,   //default 0sec
  //         type?:string,        //default 'quadratic'/'cubic','thru','soft'
  //         curviness?:number,  //thru ONLY:0=>linear,def1=>normal,k>1 curvy
  //         autoRotate?:boolean,  // rotate target along path - default false
  //         values:Record<string,unknown>[],  //quadratic => vec3[3] = [{x:,y:,z:},{},{}]
  //                          //cubic => vec3[4] = [{x:,y:,z:},{},{},{}]
  //                         //thru,soft => vec3[K] K >=4 
  //       }//o 
  // }//action
  //
  // NOTE: Bezier animation seems to have an ease-in-out function built-in so
  // additional ease is not needed !!
  //
  // NOTE: narrative['rm_positions'] is the cpu buffer communicating to the
  // gpu buffer rmquad.material.uniforms.positions
  addrmBezier(options:Record<string,unknown>){
    console.log(`addrmBezier:`); 

    const rm_positions = narrative['rm_positions'],
        timeline_name = options['timeline_name'] || 'rm_timeline',
        rm_index = options['rm_index'],
        duration = options['duration'] || 10,
        type = options['type'] || 'quadratic',  
        curviness = options['curviness'] || 1,
        autoRotate = options['autoRotate'] || false,
        values = options['values'],
        start_time = options['start_time'] || 0,
        tl = narrative[timeline_name];

    if(tl){
      tl.to(rm_positions[rm_index],
            duration,
            {bezier:{
                type:type,
                curviness:curviness,
                autoRotate:autoRotate,
                //ease:Expo.easeInOut,
                values:values,
              }
            },  
            start_time
      );
    }
  }//addrmBezier


  // modifyrmBezier
  //
  // modify an animation by the given options - this is equivalent to 
  // 'replacing' the original animation by another
  // action = { t:'animation',
  //            f:'modifyrmBezier',
  //            a:'o',
  //            ms:0,
  //
  //       o:{                         // options
  //         timeline_name?:string,   //default 'rm_timeline'
  //         rm_index:number,        //rm_positions index to 'modify'
  //         duration?:number,      //default 10sec
  //         start_time?:number,   //default 0sec
  //         type?:string,        //default 'quadratic'/'cubic','thru','soft'
  //         curviness?:number,  //thru ONLY:0=>linear,def1=>normal,k>1 curvy
  //         autoRotate?:boolean,  // rotate target along path - default false
  //         values:Record<string,unknown>[],     //represents vec3[3] = [{x:,y:,z:},{},{}]
  //       }//o 
  // }//action
  modifyrmBezier(options:Record<string,unknown>){
    console.log(`modifyrmBezier:`);

    const j = options['rm_index'];

    animation.removermBezier({rm_index:j});
    animation.addrmBezier(options);
  }//modifyrmBezier


  // removermBezier
  //
  // remove the animation by setting position.z=0 which removes it from
  // the raymarch min-distance search - so it will NOT be rendered, and
  // that index can be re-used for a new addrmBezier action
  // action = { t:'animation',
  //            f:'removermBezier',
  //            a:'o',
  //            ms:0,
  //
  //       o:{                         // options
  //         timeline_name?:string,   //default 'rm_timeline'
  //         rm_index:number,        //rm_positions index to 'remove'
  //       }//o 
  // }//action
  removermBezier(options:Record<string,unknown>){
    console.log(`removermBezier:`); 

    const tl_name = options['timeline_name'] || 'rm_timeline',
          tl = narrative[tl_name],
          rm_index = options['rm_index'];
  
    if(tl){
      //diagnostics
      //console.log(`tl = ${tl}`);
      //console.log(`before removal tl.getChildren returns array:`);
      //console.dir(tl.getChildren());

      // remove animation
      tl.remove(narrative['rm_positions'][rm_index]);

      //diagnostics - verify removal
      //console.log(`after removal tl.getChildren returns array:`);
      //console.dir(tl.getChildren());

      // remove raymarch position from rendering - without this removal the
      // final animated position will remain on the screen
      narrative['rm_positions'][rm_index].z = 0.0;
    }
  }//removermBezier


  // controlTimeline
  // timeline can be 'rm_timeline' or any actor-timeline, exp 'actor_timeline'
  //
  // action = { t:'animation',
  //            f:'controlTimeline',
  //            a:'o',
  //            ms:0,
  //
  //       o:{                           // options
  //         timeline_name?:string,     //default 'rm_timeline'
  //         pause?:true,
  //         resume?:true,            //resumes timeline cycle from pause-point
  //         restart?:true,          //restarts timeline cycle at zero
  //         yoyo?:boolean,         //add/rm a return journey to/from tl cycle 
  //         seek?:number,         //move timeline head to seek secs in cycle
  //         timescale?:number,   //scale the overall dur. of all tl-animations
  //                             //1=>normal 0.5=>half-speed 2.0=>double speed
  //         duration?:number   //change the duration of the timeline cycle -
  //                           //has the same effect as timescale but inverse?!
  //       }//o 
  // }//action
  controlTimeline(options:Record<string,unknown>){
    console.log(`controlTimeline:`); 

    const tl_name = options['timeline_name'] || 'rm_timeline';

    let tl = timelines[tl_name];

    if(tl === undefined){
      tl = narrative[tl_name];
    }


    //flow test control actions
    for(const arg in options){ 
      console.log(`${tl_name}.${arg}`);
    }

    if(tl){
      if(options['pause']){tl.pause();}
      if(options['resume']){tl.resume();}
      if(options['restart']){tl.restart();}
      if(options['yoyo'] !== undefined){
        tl.yoyo(options['yoyo']);
      }
      if(options['seek']){tl.seek(options['seek']);}
      if(options['timescale']){tl.timeScale(options['timescale']);}
      if(options['duration']){tl.duration(options['duration']);}
    }
  }//controlTimeline




  // addActorBezier
  //
  // construct and execute the animation given by options
  // action = { t:'animation',
  //            f:'addActorBezier',
  //            a:'o',
  //            ms:0,
  //
  //       o:{                          //options
  //         actors:{
  //           <'name.a.b.c'>:{
  //             timeline_name?:string, //default 'vr_timeline'
  //             duration?:number,     //default 10sec
  //             start_time?:number,  //default 0sec
  //             type?:string,       //default 'thru'/'quadratic','cubic','soft'
  //             curviness?:number, //thru ONLY:0=>linear,def1=>normal,k>1 curvy
  //             autoRotate?:boolean, // rotate target along path - def false
  //             values:Record<string,unknown>[],  //quadratic => vec3[3] = [{x:,y:,z:},{},{}]
  //                              //cubic => vec3[4] = [{x:,y:,z:},{},{},{}]
  //                             //thru,soft => vec3[K] K >=4 
  //             repeat?:number,        //default -1 => infinite repeat
  //             repeatDelay?:number,  //default 2secs
  //             delay?:number,       //default 00secs
  //             yoyo?:boolean,      //add/remv a return journey to/from anim
  //
  //                               //NOTE: the following functions are valid 
  //                              //ONLY in models/action/sequences, not in 
  //                             //actions sent from server!!
  //             onStart?:function(){},       //called at start of animation
  //             onRepeat?:function(){},     //called at end of each anim cycle
  //             onComplete?:function(){},  //called at end of animation
  //             onUpdate?:function(){}    //called after each value generated
  //           },...
  //         }
  //       }//o 
  // }//action
  //
  // NOTE: Bezier animation seems to have an ease-in-out function built-in so
  // additional ease is not needed !!
  //
  addActorBezier(o:Record<string,unknown>){
    console.log(`addActorBezier:`); 

    const actors = o['actors'];

    let tl:TimelineMax;

      
    for(const [key,options] of Object.entries(actors)){
      const a = key.split('.'),
            actorname = a[0],
            timeline_name = options['timeline_name'] || 'vr_timeline',
            duration = options['duration'] || 10,
            start_time = options['start_time'] || 0,
            type = options['type'] || 'thru',  
            curviness = options['curviness'] || 1,
            autoRotate = options['autoRotate'] || false,
            values = options['values'],    // vec3[3] - defines quadratic bezier
            delay = options['delay'] || 0,
            repeat = options['repeat'] || -1,
            repeatDelay = options['repeatDelay'] || 2,
            yoyo = options['yoyo'] || false,
            timescale = options['timescale'] || 1.0,
            onStart = options['onStart'],
            onRepeat = options['onRepeat'],
            onComplete = options['onComplete'],
            onUpdate = options['onUpdate'],
            cycle_end = true,
            // timeline
            tl = timelines[timeline_name];

      let target = narrative['findActor'](actorname);
          

      //concatenate target from <name.a.b.c...>
      if(target){
        for(let i=1; i<a.length; i++){
          target = target[a[i]];
        }
      }else{
        console.log(`actor ${actorname} NOT found!`);
        return;
      }
           
      //diagnostics
//      console.log(`actorname = ${actorname} target:`);
//      console.log(`full target:`);
//      console.dir(target);
//      console.log(`timeline_name = ${timeline_name}`);
//      console.log(`tl = ${tl}:`);
//      console.dir(tl);
//      console.log(`duration = ${duration}`);
//      console.log(`start_time = ${start_time}`);
//      console.log(`type = ${type}`);
//      console.log(`curviness = ${curviness}`);
//      console.log(`autoRotate = ${autoRotate}`);
//      console.log(`delay = ${delay}`);
//      console.log(`repeat = ${repeat}`);
//      console.log(`repeatDelay = ${repeatDelay}`);
//      console.log(`yoyo = ${yoyo}`);
//      console.log(`onStart = ${onStart}`);
//      console.log(`onRepeat = ${onRepeat}`);
//      console.log(`onComplete = ${onComplete}`);
//      console.log(`onUpdate = ${onUpdate}`);
      console.log(`values:`);
      console.dir(values);

      if(tl){
        tl.to(target,      //add animation to timeline
              duration,
              {
                bezier:{
                  type:type,
                  curviness:curviness,
                  autoRotate:autoRotate,
                  values:values,
                },
                ease:Expo.easeInOut,
                repeat:repeat,
                repeatDelay:repeatDelay,
                delay:delay,
                yoyo:yoyo,
                onStart:onStart,
                onRepeat:function(){
                  console.log(`***add onRepeat yoyo=${yoyo}`);
                  //if(yoyo) half-anim('PI') => cycle_end=false=>mod/rm blocked
                  //if(yoyo) full-anim('2PI') => cycle_end=t=>possible mod/rm
                  if(yoyo){
                    cycle_end = !cycle_end;
                    delayed_calls(target, cycle_end);
                  }else{
                    delayed_calls(target);  //cycle_end=true always
                  }
                },
                onComplete:onComplete,
                onUpdate:onUpdate
              },  
              start_time
        );
      }
    }//actors

    // start animation if not already playing
    if(!tl.isActive()){
      tl.play();
    }
  }//addActorBezier



  // removeActorBezier
  //
  // construct and execute the animation given by options
  // action = { t:'animation',
  //            f:'removeActorBezier',
  //            a:'o',
  //            ms:0,
  //
  //       o:{                          //options
  //         actors:{
  //           <'name.a.b.c'>:{
  //             timeline_name?:string,  //default 'vr_timeline'
  //           },...
  //         }
  //       }//o 
  // }//action
  //
  // NOTE: Bezier animation seems to have an ease-in-out function built-in so
  // additional ease is not needed !!
  //
  removeActorBezier(o:Record<string,unknown>){
    console.log(`removeActorBezier:`); 

    const actors = o['actors'];  
      
    for(const [key,options] of Object.entries(actors)){
      const a = key.split('.'),
            timeline_name = options['timeline_name'] || 'vr_timeline',
            tl = timelines[timeline_name];

      let target = narrative['findActor'](a[0]);


      console.log(`***removeActorBezier a=${a} timeline_name=${timeline_name}`);

      for(let i=1; i<a.length; i++){
        target = target[a[i]];
      }
      
      target['remove'] = function(){
        console.log(`***remove: target['remove']`);
        tl.remove(target);
      };

    }//actors
  }//removeActorBezier



  // modifyActorBezier
  //
  // modify the animation given by options
  // action = { t:'animation',
  //            f:'modifyActorBezier',
  //            a:'o',
  //            ms:0,
  //
  //       o:{                          //options
  //         actors:{
  //           <'name.a.b.c'>:{
  //             timeline_name?:string,  //default 'vr_timeline'
  //             duration?:number,      //default 10sec
  //             start_time?:number,   //default 0sec
  //             values:Object[],     //represents vec3[3] = [{x:,y:,z:},{},{}]
  //                                 //cubic => vec3[4] = [{x:,y:,z:},{},{},{}]
  //                                //thru,soft => vec3[K] K >=4 
  //             delay?:number,    //default 0 
  //             repeat?:number,        //default -1 => infinite repeat
  //             repeatDelay?:number,  //default 2secs
  //             type?:string,       //default 'thru'/'quadratic','cubic','soft'
  //             curviness?:number, //thru ONLY:0=>linear,def1=>normal,k>1 curvy
  //             autoRotate?:boolean, // rotate target along path - def false
  //                               //NOTE: the following functions are valid 
  //                              //ONLY in models/action/sequences, not in 
  //                             //actions sent from server!!
  //             onComplete?:function(){},  //called at end of anim cycle
  //             onUpdate?:function(){},   //called after each value generated
  //           },...
  //         }
  //       }//o 
  // }//action
  //
  // NOTE: Bezier animation seems to have an ease-in-out function built-in so
  // additional ease is not needed !!
  //
  modifyActorBezier(o:Record<string,unknown>){
    console.log(`modifyActorBezier:`); 

    const actors = o['actors'];

    let tl:TimelineMax,
        delta:Record<string,unknown>;     //changes name:value for bezier tween
      

    for(const [key,options] of Object.entries(actors)){
      const a = key.split('.'),
            actorname = a[0],
            timeline_name = options['timeline_name'] || 'vr_timeline';

      //possible property changes
      let duration = options['duration'],
          start_time = options['start_time'],
          type:string,
          curviness:number,
          autoRotate:string,
          values = options['values'],    // vec3[3] - defines quadratic bezier
          delay = options['delay'],
          repeat = options['repeat'],
          repeatDelay = options['repeatDelay'],
          yoyo = options['yoyo'],
          onStart = options['onStart'],
          onRepeat = options['onRepeat'],
          onComplete = options['onComplete'],
          onUpdate = options['onUpdate'],
          ease:Record<string,unknown>,

          // vars to hold present (to be previous) animation values
          pduration:number,
          pstartTime:number,
          ptype:string,
          pcurviness:number,
          pautoRotate:string,
          pvalues:Record<string,unknown>[],
          pdelay:number,
          prepeat:number,
          prepeatDelay:number,
          pyoyo:number,
          pease:number,
          ponStart:(...unknown) => unknown,
          ponRepeat:(...unknown) => unknown,
          ponComplete:(...unknown) => unknown,
          ponUpdate:(...unknown) => unknown,
          cycle_end = true,
          target = narrative['findActor'](actorname);


      // timeline
      tl = timelines[timeline_name];

      // form full animation target
      if(target){
        for(let i=1; i<a.length; i++){
          target = target[a[i]];
        }
      }else{
        console.log(`actor ${actorname} NOT found!`);
        return;
      }


      // modify
      console.log(`timeline_name = ${timeline_name}`);
      console.log(`tl = ${tl}`);
      console.log(`actorname = ${actorname} final target:`);
      console.dir(target);
      const ta = tl.getTweensOf(target),
            t = ta[0],
            t_vars = t['vars'],
            bezier = t['vars']['bezier'];

      pduration = t['_duration'];
      pstartTime = t['_startTime'];
      pdelay = t_vars['delay'];
      prepeat = t_vars['repeat'];
      prepeatDelay = t_vars['repeatDelay'];
      pyoyo = t_vars['yoyo'];
      pease = t_vars['ease'];
      ponStart = t_vars['onStart'];
      ponRepeat = t_vars['onRepeat'];
      ponComplete = t_vars['onComplete'];
      ponUpdate = t_vars['onUpdate'];
      ptype = t_vars['bezier']['type'];
      pcurviness = t_vars['bezier']['curviness'];
      pautoRotate = t_vars['bezier']['autoRotate'];
 

      // diagnostics
      console.log(`t = ${t}:`);
      console.dir(t);


      // copy values into pvalues Record<string,unknown> array 
      for(const i in t_vars['bezier']['values']){
        console.log(`i = ${i}`);
        console.log(`bezier['values'][${i}].x = ${bezier['values'][1].x}`);
        console.log(`bezier['values'][${i}].y = ${bezier['values'][1].y}`);
        console.log(`bezier['values'][${i}].z = ${bezier['values'][1].z}`);
        pvalues[i] = {};
        for(const p in t['vars']['bezier']['values'][i]){
          console.log(`i=${i} p=${p}`);
          console.log(`bezier.values[${i}][${p}]=${t['vars']['bezier']['values'][i][p]}`);
          pvalues[i][p] = t['vars']['bezier']['values'][i][p];
        }
      }


//      for(let p in t['vars']['bezier']['values']['0']){
//        console.log(`bezier.values[${p}]=${t['vars']['bezier']['values']['0'][p]}`);
//        pvalues[0][p] = t['vars']['bezier']['values']['0'][p]
//      }
//      for(let p in t['vars']['bezier']['values']['1']){
//        console.log(`bezier.values[${p}]=${t['vars']['bezier']['values']['1'][p]}`);
//        pvalues[1][p] = t['vars']['bezier']['values']['1'][p]
//      }
//      for(let p in t['vars']['bezier']['values']['2']){
//        console.log(`bezier.values[${p}]=${t['vars']['bezier']['values']['2'][p]}`);
//        pvalues[2][p] = t['vars']['bezier']['values']['2'][p]
//      }



      // diagnostics - copy of 'previous' (now removed) bezier animation
//      console.log(`\n previous animation values`);
//      console.log(`pduration = ${pduration}`);
//      console.log(`pstartTime = ${pstartTime}`);
//      console.log(`ptype = ${ptype}`);
//      console.log(`pcurviness = ${pcurviness}`);
//      console.log(`pautoRotate = ${pautoRotate}`);
//      console.log(`pdelay = ${pdelay}`);
//      console.log(`prepeat = ${prepeat}`);
//      console.log(`prepeatDelay = ${prepeatDelay}`);
//      console.log(`pyoyo = ${pyoyo}`);
//      console.log(`pease = ${pease}`);
//      console.log(`ponStart = ${ponStart}`);
//      console.log(`ponRepeat = ${ponRepeat}`);
//      console.log(`ponComplete = ${ponComplete}`);
//      console.log(`ponUpdate = ${ponUpdate}`);
      console.log(`pvalues:`);
      console.dir(pvalues);

      // start new (modified) version of previous animation
      // first create desired properties
      duration = duration || pduration;
      start_time = start_time || pstartTime;
      type = type || ptype;
      curviness = curviness || pcurviness;
      autoRotate = autoRotate || pautoRotate;
      values = values || pvalues;  //vec3[3] defines quad. bezier
      delay = delay || pdelay;
      repeat = repeat || prepeat;
      repeatDelay = repeatDelay || prepeatDelay;
      yoyo = yoyo || pyoyo;
      onStart = onStart || ponStart;
      onRepeat = onRepeat || ponRepeat;
      onComplete = onComplete || ponComplete;
      onUpdate = onUpdate || ponUpdate;
      ease = pease || Expo.easeInOut;

      // diagnostics - copy of 'previous' (now removed) bezier animation
//      console.log(`\n new animation values`);
//      console.log(`duration = ${duration}`);
//      console.log(`start_time = ${start_time}`);
//      console.log(`+++type = ${type}`);
//      console.log(`+++curviness = ${curviness}`);
//      console.log(`+++autoRotate = ${autoRotate}`);
//      console.log(`delay = ${delay}`);
//      console.log(`repeat = ${repeat}`);
//      console.log(`repeatDelay = ${repeatDelay}`);
//      console.log(`yoyo = ${yoyo}`);
//      console.log(`ease = ${ease}`);
//      console.log(`onStart = ${onStart}`);
//      console.log(`onRepeat = ${onRepeat}`);
//      console.log(`onComplete = ${onComplete}`);
//      console.log(`onUpdate = ${onUpdate}`);
      console.log(`+++values:`);
      console.dir(values);


      target['modify'] = function(){
        // remove present animation
        console.log(`removing ${target} from timeline ${timeline_name}`);
        tl.remove(target);
  
        // start new animation
        if(tl){
          tl.to(target,      //add animation to timeline
                duration,
                {
                  bezier:{
                    type:type,
                    curviness:curviness,
                    autoRotate:autoRotate,
                    values:values,
                  },
                  ease:ease,
                  repeat:repeat,
                  repeatDelay:repeatDelay,
                  delay:delay,
                  yoyo:yoyo,
                  onStart:onStart,
                  onRepeat:function(){
                    console.log(`***mod onRepeat yoyo=${yoyo}`);
                    //if(yoyo) half-anim('PI') =>cycle_end=false=>mod/rm blocked
                    //if(yoyo) full-anim('2PI') => cycle_end=t=>possible mod/rm
                    if(yoyo){
                      cycle_end = !cycle_end;
                      delayed_calls(target, cycle_end);
                    }else{
                      delayed_calls(target);  //cycle_end=true always
                    }
                  },
                  onComplete:onComplete,
                  onUpdate:onUpdate
                },  
                start_time
          );
        }
      };//target['modify']

    }//actors
  }//modifyActorBezier

}//class Animation



// enforce singleton export
Animation.create();
export {animation};
