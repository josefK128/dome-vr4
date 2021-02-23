// pointAudio.ts
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
//   {t:'pointAudio',     // target - audio actorname
//    f:'delta',          // method
//    a:'o',              // arg type - object
//    ms:'0',             // timestamp
//    o:{pause:true}}     // arg-object
//
//    OR - replace sound
//
//   {t:'pointAudio',    // target - audio actorname
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
//            'pointAudio':{      // audio actorname
//              options:{
//                url:string,
//                volume:0.7,           // default=1.0
//                playbackRate:1.2,    // default=1.0 (>1=> faster, <1=>slower)
//                loop:true,          // def=f  (true=>infinite loop)
//                play:true,         // (delta only - starts or resumes audio)
//              }
//            },
//            ...                 // other actor modifications
//          }//actors
//        }//vrscene
//      }//stage
//    }//o
//
//
//    create sound in sgscene or vrscene:
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'pointAudio':{ 
//          factory:'PointAudio',
//          url:'./app/models/stage/actors/audio/pointAudio',
//          options:{
//              actorname:string,   // actor name - to attach pointAudio
//             *autoplay:boolean,  // def:t=>play after enable sound button clk
//             *refDistence:number        // def=1 (d when attenuation starts)
//             *maxDistence:number       // def=10000 (d when level=0db)
//             *url:string,
//             *volume:number,         // default=1.0
//             *playbackRate:number,  // default=1.0 (>1=> faster, <1=>slower)
//             *loop:boolean,        // def=f  (true=>infinite loop)
//                                // effects only pointAudio.delta function!
//                               // NOTE:autoplay NOT used in pointAudio.delta
//             *play:boolean,   // (delta only - starts or resumes audio)
//             *pause:boolean, // (delta only - pauses sound)
//             *stop:boolean  // (delta only - and sets time to start)
//          }
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {narrative} from '../../../../narrative';



// class PointAudio - Factory
export const PointAudio:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{    
    return new Promise((resolve, reject) => {

      // return actor ready to be added to scene
      // pointAudio
      const audioLoader = new THREE.AudioLoader(),
            actorname = <string>options['actorname'], 
            autoplay = <boolean>options['autoplay'] || true,
            url = <string>options['url'],
            play = false,
            pause = false,
            stop = true;

      let refDistance = <number>options['refDistance'] || 1.0,
          maxDistance = <number>options['maxDistance'] || 10000.0,
          volume = <number>options['volume'] || 1.0,
          playbackRate = <number>options['playbackRate'] || 1.0,
          loop = <boolean>options['loop'] || false,
          actor:THREE.Object3D,
          audiobutton:HTMLElement;



      // create sound and extract AudioContext
      const sound:THREE.PointAudio = new THREE.PositionalAudio(narrative['audioListener']),
            context:AudioContext = sound.context;
      
      console.log(`\n\n&&& PointAudio: url=${url} sound=${sound}`);


      audioLoader.load(url, (buffer) => {
        console.log(`\n\n\n\n\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`);
        console.log(`fetching audio buffer=${buffer}`); 
        sound.setBuffer(buffer);
        sound.setRefDistance(refDistance);
        sound.setMaxDistance(maxDistance);
        sound.setVolume(volume);
        sound.setPlaybackRate(playbackRate);
        sound.setLoop(loop);
        sound.isPlaying = false;  //probably redundant
        console.log(`sound=${sound}`); 
        console.dir(sound);

        // attach sound to nominated actor or if error, the displayed_scene,
        // so if error, sound is a pointSound at an origin, not an actor.position
        actor = narrative.findActor(actorname);
        console.log(`\n\npointaudio: actor ${actorname} = ${actor}`);
        if(actor){
          actor.add(sound);
          console.log(`\n\n\n!!!!!!!!!! actor.add(sound) !!!!!!!!!!!!!!!`);
          console.log(`actor.name=${actor.name} actor=${actor}`); 
        }else{
          console.error(`trying to add sound to actor ${actorname} - NOT FOUND`);
          if(narrative['displayed_scene'] === 'vr'){
            narrative['vrscene'].add(sound);
          }else{
            narrative['sgscene'].add(sound);
          }
        }

        // start sound.play by 'enable audio' button click
        if(document.getElementById('audio')){
          audiobutton = document.getElementById('audio');
          audiobutton.addEventListener('click', function(){        
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
        //console.log(`pointAudio.delta: options = ${options}:`);
        //console.dir(options);

        const url = <string>options['url'];
        let play = <boolean>options['play'],
            pause = <boolean>options['pause'],
            stop = <boolean>options['stop'];
 
  
        // create or modify sound
        if(url){   // new sound source
          audioLoader.load(url, function(buffer){    // (buffer) => {
            sound.setBuffer(buffer);
            if(options['refDistance']){refDistance = <number>options['refDistance'];}
            if(options['maxDistance']){maxDistance = <number>options['maxDistance'];}
            if(options['volume']){volume = <number>options['volume'];}
            if(options['playbackRate']){playbackRate = <number>options['playbackRate'];}
            if(options['loop']){loop = <boolean>options['loop'];}
            if(play){
              console.log('PLAY');
              audiobutton.innerHTML = 'audio active';  //redundant
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
          if(options['refDistance']){refDistance = <number>options['refDistance'];}
          if(options['maxDistance']){maxDistance = <number>options['maxDistance'];}
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

};//PointAudio;
