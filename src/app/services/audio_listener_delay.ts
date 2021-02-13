/**
 * @author mrdoob / http://mrdoob.com/
 * rudolph - added delay node
 */
//import { Vector3 } from '../math/Vector3';
//import { Quaternion } from '../math/Quaternion';
//import { Object3D } from '../core/Object3D';
//import { AudioContext } from './AudioContext';


let listener:AudioListenerDelay;
const delayTime = 0.0;


// constructor - wire gain to delay, gain to output, delay to output (dest)
function AudioListenerDelay() {
  THREE.Object3D.call( this );
  this.type = 'AudioListener';
  this.context = THREE.AudioContext.getContext();
  this.gain = this.context.createGain();

        // delay
        this.delay = this.context.createDelay(10);
        this.delay.delayTime.value = delayTime;
        
        // integrate delay
        this.gain.connect(this.delay);
        this.delay.connect(this.context.destination); 

        // undelayed output
  this.gain.connect( this.context.destination );
  this.filter = null;
}

AudioListenerDelay.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {
  constructor: AudioListener,

        setDelay(d:number){
          this.delay.delayTime.value = d;
        },

  getInput: function () {
    return this.gain;
  },

  removeFilter: function ( ) {
    if ( this.filter !== null ) {
      this.gain.disconnect( this.filter );
      this.filter.disconnect( this.context.destination );
      this.gain.connect( this.context.destination );
      this.filter = null;
    }
  },

  getFilter: function () {
    return this.filter;
  },

  setFilter: function ( value ) {
    if ( this.filter !== null ) {
      this.gain.disconnect( this.filter );
      this.filter.disconnect( this.context.destination );
    } else {
      this.gain.disconnect( this.context.destination );
    }

    this.filter = value;
    this.gain.connect( this.filter );
    this.filter.connect( this.context.destination );
  },

  getMasterVolume: function () {
    return this.gain.gain.value;
  },

  setMasterVolume: function ( value ) {
    this.gain.gain.value = value;
  },

  updateMatrixWorld: ( function () {
      const position = new THREE.Vector3(),
            quaternion = new THREE.Quaternion(),
            scale = new THREE.Vector3(),
            orientation = new THREE.Vector3();

      return function updateMatrixWorld( force ) {
      //o.prototype.updateMatrixWorld.call( this, force );
      const listener = this.context.listener,
            up = this.up;

      this.matrixWorld.decompose( position, quaternion, scale );
      orientation.set( 0, 0, - 1 ).applyQuaternion( quaternion );

      if ( listener.positionX ) {

        listener.positionX.setValueAtTime( position.x, this.context.currentTime );
        listener.positionY.setValueAtTime( position.y, this.context.currentTime );
        listener.positionZ.setValueAtTime( position.z, this.context.currentTime );
        listener.forwardX.setValueAtTime( orientation.x, this.context.currentTime );
        listener.forwardY.setValueAtTime( orientation.y, this.context.currentTime );
        listener.forwardZ.setValueAtTime( orientation.z, this.context.currentTime );
        listener.upX.setValueAtTime( up.x, this.context.currentTime );
        listener.upY.setValueAtTime( up.y, this.context.currentTime );
        listener.upZ.setValueAtTime( up.z, this.context.currentTime );

      } else {

        listener.setPosition( position.x, position.y, position.z );
        listener.setOrientation( orientation.x, orientation.y, orientation.z, up.x, up.y, up.z );

      }
    };
  } )()
} );


if(!listener){
  listener = new AudioListenerDelay();
}

export {listener};
