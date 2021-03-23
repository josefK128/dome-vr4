// pointaudio.ts
// Actor is a Factory interface - so PointAudio 'creates' instances using the
// options Object as variations, i.e. PointAudio is a factory and NOT a singleton
//
// PointAudio implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> PointAudio.create(options)
// PointAudio instances implement Actor interface:
// export interface Actor {
//   delta(Object):void;   
//
//
// declarative specification in context of the stage:actors Object:
// NOTE: urls are relative to app/scenes directory
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
// NOTE: requires narrative, and narrative.audioListener
//
// NOTE!: audio MUST be enable by user click on 'enable audio' button - this
//   is due to a BINARY browser policy requiring user gesture to play media ?!
//   Due to this restriction play, pause and stop are only usable in delta
//   actions such as:
//
//   modify sound - pause, play, stop
//
//   {t:'pointaudio',    // target - audio actorname
//    f:'delta',          // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{pause:true}}     // arg-object
//
//    OR - replace sound
//
//   {t:'pointaudio',    // target - audio actorname
//    f:'delta',          // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{                 // arg-object
//      url:string,
//      actorname:string,       // where to attach pointaudio
//      refd:number,          // d at which attenuation begins
//      maxd:number,         // d at which audibility ends
//      volume:0.7,           // default=1.0
//      playbackRate:1.2,    // default=1.0 (>1=> faster, <1=>slower)
//      loop:true          // def=f  (true=>infinite loop)
//    }}
//
//    OR - replace sound as an actor-group modification
//
//   {t:'narrative',      // target
//    f:'changeState',    // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{ 
//      stage:{
//        vrscene:{
//          _actors:undefined,     // undefined => modify
//          actors:{
//            'pointaudio':{      // audio actorname
//              options:{
//                url:'./app/media/audio/music/test1.mp3',
//                actorname:string       // where to attach pointaudio
//                refd:number,          // d at which attenuation begins
//                maxd:number,         // d at which audibility ends
//                volume:0.7,           // default=1.0
//                playbackRate:1.2,    // default=1.0 (>1=> faster, <1=>slower)
//                loop:true          // def=f  (true=>infinite loop)
//              }
//            },
//            //...               // other actor modifications
//          }//actors
//        }//vrscene
//      }//stage
//    }//o
//
//
//    create sound in sgscene or vrscene:
//
//    _actors:true,   // true=>create; false=>remove; undefined=>modify
//    actors:{
//      'pointaudio':{ 
//        factory:'PointAudio',
//        url:'./app/models/stage/actors/audio/pointaudio',
//        options:{
//            url:string,
//            actorname:string
//            refd:number,          // d at which attenuation begins
//            maxd:number,         // d at which audibility ends
//           *volume:number,         // default=1.0
//           *playbackRate:number,  // default=1.0 (>1=> faster, <1=>slower)
//           *loop:boolean,        // def=f  (true=>infinite loop)
//                                // effects only pointaudio.delta function!
//                               // NOTE:autoplay NOT used in pointaudio.delta
//           *play:boolean,     // (delta only - starts or resumes audio)
//           *pause:boolean,   // (delta only - pauses sound)
//           *stop:boolean    // (delta only - pauses and sets time to start)
//        }
//      }
//    }//actors
//
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {Cast} from '../../../../cast.interface.js';



// class PointAudio - Factory
export const Pointaudio:ActorFactory = class {

  static create(options:Record<string,unknown>={}, narrative:Cast):Promise<Actor>{    
    console.log(`\n\n&&& Pointaudio.create() pointaudio: ${options['url']}`);


    return new Promise((resolve, reject) => {

      // return Promise<Actor> ready to be added to scene
      // pointaudio
      const url= <string>options['url'],
            actorname = <string>options['actorname'],
            // d at which attenuation begins (?)  0.0 => no sound!
            refd = <number>options['refd'] || 0.0,
            // d at which audibility ends
            maxd = <number>options['maxd'] || 1000.,

            playbackRate = <number>options['playbackRate'] || 1.0,
            volume = <number>options['volume'] || 1.0,
            loop = <boolean>options['loop'] || false,
            play = false,
            pause = false,
            stop = true,
            audioLoader = new THREE.AudioLoader(),
            sound = new THREE.PositionalAudio(narrative['audioListener']),
            actor = narrative.findActor(actorname);

      console.log(`\n\n&&& pointaudio: sound=${sound} refd=${refd} maxd=${maxd}`);
      console.dir(sound);
      sound.setRefDistance(refd);
      sound.setMaxDistance(maxd);
      sound.setVolume(volume);
      sound.setPlaybackRate(playbackRate);
      sound.setLoop(loop);
      if(actor){
        console.log(`adding pointaudio to actor ${actorname}`);
        console.log(`refd = ${refd}  maxd = ${maxd} volume = ${volume}`);
        actor.add(sound);
      }else{
        console.log(`actor ${actorname} NOT found! pointaudio can't be placed`);
      }
      console.log(`sound=${sound}:`); 
      console.dir(sound);


      // called in startAudio button click-event handler
      sound['startAudio'] = () => {
        console.log(`\n *** sound.startAudio`);

        audioLoader.load(url, (buffer) => {
          console.log(`audioLoader loaded ${buffer} from url=${url}`);
          sound.setBuffer(buffer);

          sound.setRefDistance(refd);
          sound.setMaxDistance(maxd);
          sound.setVolume(volume);
          sound.setPlaybackRate(playbackRate);
          sound.setLoop(loop);
          if(actor){
            console.log(`adding pointaudio to actor ${actorname}`);
            console.log(`refd = ${refd}  maxd = ${maxd} volume = ${volume}`);
            actor.add(sound);
          }else{
            console.log(`actor ${actorname} NOT found! pointaudio can't be placed`);
          }
          console.log(`sound=${sound}:`); 
          console.dir(sound);
          console.log(`audioLoader: playing sound=${sound}`);
          sound.play();
        },
        (progress) => {
          console.log(); 
        },
        (err) => {
          console.log(`error loading url:${err}`);
        });

      };//startAudio


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      sound['delta'] = (options:Record<string,unknown>) => {
        //console.log(`pointaudio.delta: options = ${options}:`);
        //console.dir(options);

        if(options['volume']){sound.volume = <number>options['volume'];}
        if(options['playbackRate']){sound.playbackRate = <number>options['playbackRate'];}
        if(options['loop']){sound.loop = <boolean>options['loop'];}
        if(options['play']){sound.play = <boolean>options['play'];}
        if(options['pause']){sound.pause = <boolean>options['pause'];}
        if(options['stop']){sound.stop = <boolean>options['stop'];}

      };//delta


      resolve(sound);
    });//return new Promise<Actor>
  }// create

};//PointAudio;
