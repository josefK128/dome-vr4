// audio.ts 


import {listener} from '../services/audio_listener_delay';


// singleton closure-instance variable
let audio:Audio,
    loader:THREE.AudioLoader,
    sound:THREE.PositionalAudio,
    parent:THREE.Object3D;

// defaults
const _refDistance = 1000,
      _maxDistance = 1000,
      _volume = 0.5,
      _playbackRate = 1.0,
      _loop = true,
      _actor = 'lens',
      coneInnerAngle = 360,   // webAudio default 
      coneOuterAngle = 360,   // webAudio default 
      coneOuterGain = 0;   // webAudio default 

// dynamic
let url = '',
    refDistance = 1000,
    maxDistance = 1000,
    volume = 1.0,
    playbackRate = 1.0,
    delay = 0.0,
    loop = true,
    panner:Record<string,unknown> = {},
    actor = 'lens';



class Audio {

  // ctor
  constructor(){
    audio = this;
    //console.log(`listener = ${listener}`);
  } //ctor
  

  // initialization
  initialize(lens){
    lens.add(listener);
    loader = new THREE.AudioLoader();
  }


  delta(state:Record<string,unknown>, narrative:Narrative):void{
    console.log(`Audio.delta: state = ${state} _audio = ${state['_audio']}`);
    //for(let p of Object.keys(state)){
    //  console.log(`audio: state has property ${p} val ${state[p]}`);
    //}


    // _audio
    if(state['_audio'] !== undefined){
      if(state['_audio']){  // _audio=true
        sound = new THREE.PositionalAudio(listener);
        panner = sound.getOutput();

        // delay
        delay = <number>state['delay'] || delay;
        listener.setDelay(delay);

        // properties
        // panner
        panner.coneInnerAngle = state['coneInnerAngle'] || coneInnerAngle;
        panner.coneOuterAngle = state['coneOuterAngle'] || coneOuterAngle;
        if(state['coneOuterGain'] === 0.0){
          panner.coneOuterGain = 0.0;
        }else{
          panner.coneOuterGain = state['coneOuterGain'] || coneOuterGain;
        }

        refDistance = <number>state['refDistance'] || _refDistance;
        maxDistance = <number>state['maxDistance'] || _maxDistance;
        if(<number>state['volume'] !== undefined && (<number>state['volume'] === 0.0)){
          volume = 0.0;
        }else{
          volume = <number>state['volume'] || _volume;
        }
        playbackRate = <number>state['playbackRate'] || _playbackRate;

        if(<boolean>state['loop'] !== undefined && (<boolean>state['loop'] === false)){
          loop = false;
        }else{
          loop = <boolean>state['loop'] || _loop;
        }
        actor = <string>state['actor'] || _actor;
        if(state['url']){
          url = <string>state['url'];
          loader.load(url, (buffer) => {
            sound.setBuffer(buffer);
            sound.setRefDistance(refDistance);
            sound.setMaxDistance(maxDistance);
            sound.setVolume(volume);
            sound.setLoop(_loop);
            sound.playbackRate = playbackRate;
            parent = narrative.actors[actor];
            if(parent){
              //console.log(`adding sound ${url} to ${state['actor']}`);
              //console.log(`sound vol = ${volume} playbackRate = ${playbackRate}`);
              parent.add(sound);
              sound.play();
            }else{
              console.log(`audio: actor ${actor} not found!`);
            }
            //console.log(`sound ${url} is playing is ${sound.isPlaying}`);
          });
        }
      }else{     // _audio=false
        if(sound){
          sound.stop();
          parent.remove(sound);
          sound = null;
          console.log(`soundnode removed`);
        }
      }
    }else{       // _audio=undefined => modify properties
      if(sound){
        // properties
        // panner
        panner = sound.getOutput();
        panner.coneInnerAngle = state['coneInnerAngle'] || coneInnerAngle;
        panner.coneOuterAngle = state['coneOuterAngle'] || coneOuterAngle;
        if(state['coneOuterGain'] === 0.0){
          panner.coneOuterGain = 0.0;
        }else{
          panner.coneOuterGain = state['coneOuterGain'] || coneOuterGain;
        }

        sound.setRefDistance(state['refDistance'] || refDistance);
        sound.setMaxDistance(state['maxDistance'] || maxDistance);
        if(state['volume']){
          sound.setVolume(state['volume']);
        }
        sound.playbackRate = state['playbackRate'] || playbackRate;
  
  
        if(state['loop'] !== undefined && (state['loop'] === false)){
          sound.setLoop(false);
        }else{
          sound.setLoop(state['loop'] || loop);
        }
        if(state['actor']){
          parent.remove(sound);
          parent = narrative.actors(state['actor']);
          if(parent){
            parent.add(sound);
          }
        }
        
        // play
        if(state['play']){
          audio.play();
        }
        // pause
        if(state['pause']){
          audio.pause();
        }
        // stop
        if(state['stop']){
          audio.stop();
        }
      }
    }
  }//delta

  play(){
    if(sound){sound.play();}
  }

  pause(){
    if(sound){sound.pause();}
  }

  stop(){
    if(sound){sound.stop();}
  }
  
  setVolume(level:number){
    if(sound){sound.setVolume(level);}
  }

}//Audio


// enforce singleton export
if(audio === undefined){
  audio = new Audio();
}
export {audio};
