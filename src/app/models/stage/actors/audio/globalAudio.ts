// globalAudio.ts
// Actor is a Factory interface - so GlobalAudio 'creates' instances using the
// options Object as variations, i.e. GlobalAudio is a factory and NOT a singleton
//
// GlobalAudio implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> GlobalAudio.create(options)
// GlobalAudio instances implement Actor interface:
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
//   {t:'globalAudio',    // target - audio actorname
//    f:'delta',          // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{pause:true}}     // arg-object
//
//    OR - replace sound
//
//   {t:'globalAudio',    // target - audio actorname
//    f:'delta',          // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{                 // arg-object
//      url:string,
//      volume:0.7,           // default=1.0
//      playbackRate:1.2,    // default=1.0 (>1=> faster, <1=>slower)
//      loop:true,          // def=f  (true=>infinite loop)
//      play:true,         // (delta only - starts or resumes audio)
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
//            'globalAudio':{      // audio actorname
//              options:{
//                url:string,
//                volume:0.7,           // default=1.0
//                playbackRate:1.2,    // default=1.0 (>1=> faster, <1=>slower)
//                loop:true,          // def=f  (true=>infinite loop)
//                play:true,         // (delta only - starts or resumes audio)
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
//      'globalAudio':{ 
//        factory:'GlobalAudio',
//        url:'./app/models/stage/actors/audio/globalAudio',
//        options:{
//           *url:string,
//           *autoplay:boolean,  // def:true=>play after enable-sound button clk
//           *volume:number,         // default=1.0
//           *playbackRate:number,  // default=1.0 (>1=> faster, <1=>slower)
//           *loop:boolean,        // def=f  (true=>infinite loop)
//                                // effects only globalAudio.delta function!
//                               // NOTE:autoplay NOT used in globalAudio.delta
//           *play:boolean,     // (delta only - starts or resumes audio)
//           *pause:boolean,   // (delta only - pauses sound)
//           *stop:boolean    // (delta only - pauses and sets time to start)
//        }
//      }
//    }//actors
//
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {narrative} from '../../../../narrative';



// class GlobalAudio - Factory
export const GlobalAudio:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{    
    return new Promise((resolve, reject) => {

      // return actor ready to be added to scene
      // globalAudio
      const url = <string>options['url'],
            autoplay = <boolean>options['autoplay'] || true,
            play = false,
            pause = false,
            stop = true,
            audioLoader = new THREE.AudioLoader();

      let playbackRate = <number>options['playbackRate'] || 1.0,
          volume = <number>options['volume'] || 1.0,
          loop = <boolean>options['loop'] || false,
          audiobutton:HTMLElement;


      // create sound and extract AudioContext
      const sound:THREE.GlobalAudio = new THREE.Audio(narrative['audioListener']),
            contextAudioContext = sound.context;


      console.log(`\n\n&&& GlobalAudio: url=${url} sound=${sound}`);
      
      audioLoader.load(url, (buffer) => {
        console.log(`\n\n\n\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);
        sound.setBuffer(buffer);
        sound.setVolume(volume);
        sound.setPlaybackRate(playbackRate);
        sound.setLoop(loop);
        sound.isPlaying = false;  //probably redundant
        console.log(`sound=${sound}`); 
        console.dir(sound);

        // start sound.play by 'enable audio' button click
        if(document.getElementById('audio')){
          audiobutton = document.getElementById('audio');
          audiobutton.addEventListener('click', () => {
            console.log(`!!!!!!!!!! click !!!!!!!!!!!!!!!`);
            console.log(`entering eventL sound.isPlaying=${sound.isPlaying}`); 
            if(autoplay){
              console.log('PLAY');
              audiobutton.innerHTML = 'audio active';
              sound.play();
              //console.log(`sound.isPlaying is ${sound.isPlaying}:`);
              //console.dir(sound);
            }
          });
        }
      });


      // ACTOR.INTERFACE method
      // delta method for modifying properties
      sound['delta'] = (options:Record<string,unknown>) => {
        //console.log(`globalAudio.delta: options = ${options}:`);
        //console.dir(options);

        const url = options['url'];
        let play = options['play'],
            pause = options['pause'],
            stop = options['stop'];
 
  
        // create or modify sound
        if(url){   // new sound source
          audioLoader.load(url, (buffer) => {
            sound.setBuffer(buffer);
            if(options['volume']){volume = <number>options['volume'];}
            if(options['playbackRate']){playbackRate = <number>options['playbackRate'];}
            if(options['loop']){loop = <boolean>options['loop'];}
            if(play){
              console.log('PLAY');
              audiobutton.innerHTML = 'audio active';    //redundant
              pause = false;
              stop = false;
              sound.play();
              console.log(`sound.isPlaying is ${sound.isPlaying}:`);
              console.dir(sound);
            }            
          });
        }else{     // same sound source
          if(stop){
            console.log('STOP');
            play = false;
            pause = false;
            sound.stop();
            console.log(`sound.isPlaying is ${sound.isPlaying}:`);
            console.dir(sound);
          }
          if(pause){
            console.log('PAUSE');
            play = false;
            stop = false;
            sound.pause();
            console.log(`sound.isPlaying is ${sound.isPlaying}:`);
            console.dir(sound);
          }
          if(options['volume']){volume = <number>options['volume'];}
          if(options['playbackRate']){playbackRate = <number>options['playbackRate'];}
          if(options['loop']){loop = <boolean>options['loop'];}
          if(play){
            console.log('PLAY');
            audiobutton.innerHTML = 'audio active';   //redundant
            sound.play();
            console.log(`sound.isPlaying is ${sound.isPlaying}:`);
            console.dir(sound);
          }
        }       

      };//delta

      resolve(sound);
    });//return new Promise<Actor>
  }// create

};//GlobalAudio;
