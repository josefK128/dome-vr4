// actors/cloud/spritecloud.ts 
// Actor is a Factory interface - so Spritecloud 'creates' instances using the
// options Record<string,unknown> as variations, i.e. Spritecloud is a factory and NOT a singleton
//
// Spritecloud implements ActorFactory interface:
// export interface ActorFactory {
//   create(Record<string,unknown>):Promise<Actor>;   //static=> Spritecloud.create(options)
// Spritecloud instances implement Actor interface:
// export interface Actor {
//   delta(Record<string,unknown>):void;   
//
//
// declarative specification in context of stage:actorsRecord<string,unknown>:
// NOTE: urls are relative to app/scenes directory
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'spritecloud':{ 
//          factory:'Spritecloud',
//          url:'./app/models/stage/actors/objects/spritecloud',
//          options:{
//            N:4,
//            urls:["./app/assets/images/cloud/sprite_redlight.png",
//              "./app/assets/images/cloud/moon_256.png" ,
//              "./app/assets/images/cloud/lotus_64.png" ,
//              "./app/assets/images/cloud/sprites/ball.png" ],
//            transparent:true,
//            opacity:1.0,
//            cloudRadius:1000,
//            morphtargets:[],                      //options
//            positions:[], //positions.len = particles*mTargets.len*3
//            particles:128,  // 128,  // 256    //options
//            duration:20000,  // 2000           //options
//            group_speed_base:.01,             //defaults...
//            group_speed_variance:.01,
//            sprite_rotation_speedX:.2,
//            sprite_rotation_speedZ:.3,
//            pivot_rotation_speedX:.2,
//            pivot_rotation_speedZ:.3,
//            transform:{t:[0.0,0.0,-500.0]}
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d.js';
import {morphTargets} from '../../../../services/morphtargets.js';
import {generators} from '../../../../models/stage/actors/cloud/generators/generators.js';




// closure vars and default values
//eleven options 
let current = 0,
    N = 4,
    urls = ["../../../../../../app/media/images/cloud/sprite_redlight.png",
        "../../../../../../dist/app/media/images/cloud/moon_256.png" ,
        "../../../../../../dist/app/media/images/cloud/lotus64.png" ,
        "../../../../../../dist/app/media/images/cloud/sprites/ball.png"],
    transparent = true,
    opacity = 1.0,
    fog = false,
    lights = false,
    cloudRadius = 1000,
    particles = 128,  // 128,  // 256    //options
    duration = 20000,  // 2000           //options

    group_speed_base = .01,             //defaults...
    group_speed_variance = .01,
    sprite_rotation_speedX = .2,
    sprite_rotation_speedZ = .3,
    pivot_rotation_speedX = .2,
    pivot_rotation_speedZ = .3,

    particlesByN = particles/N,
    state_positions:number[] = [],
    positions:number[] = [], //positions.len = particles*mTargets.len*3
    object_:THREE.Object3D,
    targets:number; 
    
const objects:THREE.Object3D[] = [],
      group:THREE.Group = new THREE.Group(),
  
      // animations
      transition = () => {
        const offset:number = current * particles * 3;
  
        //console.log(`current target = ${current} offset=${offset}`);
        for(let i = 0, j = offset; i < particles; i++, j += 3 ) {
          object_ = objects[ i ];
  
          // TWEEN
          new TWEEN.Tween( object_.position )
            .to( {
              x: positions[ j ],
              y: positions[ j + 1 ],
              z: positions[ j + 2 ] 
            }, Math.random() * duration + duration )
            .easing( TWEEN.Easing.Exponential.InOut )
            .start();
          //console.log(`tween ${i} ${j} starting`);
        }
  
        // TWEEN  
        new TWEEN.Tween({x:0, y:0, z:0})          // z=0
          .to( {x:0, y:0, z:0}, duration * 3 )    // z=0
          .onComplete(transition )
          .start();
  
        current = ( current + 1 ) % targets; 
      };//transition()



export const Spritecloud:ActorFactory = class {

  static create(state:Record<string,unknown>={}):Promise<Actor>{
    const textureLoader:THREE.TextureLoader = new THREE.TextureLoader(),
          transform = <Record<string,number[]>>state['transform'],
          pivot:THREE.Group = new THREE.Group();

    let mat:THREE.Material,
        spr:THREE.Object3D,
        loaded = 0;


    //console.log(`\n\n\n **************** state = ${state}:`);
    //console.dir(state);


    particles = <number>state['particles'] || particles;
    targets = <number>state['targets'] || targets;
    N = <number>state['N'] || N;
    particlesByN = particles/N;
    current = 0;
    urls = <string[]>state['urls'] || urls;
    transparent = <boolean>state['transparent'] || transparent;
    opacity = <number>state['opacity'] || opacity;
    duration = <number>state['duration'] || duration;

    group_speed_base = <number>state['group_speed_base'] || group_speed_base;
    group_speed_variance = <number>state['group_speed_variance'] || group_speed_variance;            
    sprite_rotation_speedX = <number>state['sprite_rotation_speedX'] || sprite_rotation_speedX;
    sprite_rotation_speedZ = <number>state['sprite_rotation_speedZ'] || sprite_rotation_speedZ;
    pivot_rotation_speedX = <number>state['pivot_rotation_speedX'] || pivot_rotation_speedX;
    pivot_rotation_speedZ = <number>state['pivot_rotation_speedZ'] || pivot_rotation_speedZ;

    state_positions = <number[]>state['positions'] || [];
    cloudRadius = <number>state['cloudRadius'] || cloudRadius;
    fog = <boolean>state['fog'] || fog;
    lights = <boolean>state['lights'] || lights;


    //console.log(`targets = ${targets}`);


    return new Promise((resolve, reject) => {
      try {
        // delta sprites and morph-morphtargets
        for(let i=0; i<N; i++){
          textureLoader.load(urls[i],
            // load
            (texture) => {
              loaded += 1;
              mat = new THREE.SpriteMaterial( { map: texture, color: 'white', fog: true } );
              for (let j=0; j<particlesByN; j++ ) {
                spr = new THREE.Sprite( mat);
                let x = Math.random() - 0.5;
                let y = Math.random() - 0.5;
                let z = Math.random() - 0.5;
                spr.position.set( x, y, z );
                spr.position.normalize();
                spr.position.multiplyScalar(cloudRadius);
                x = spr.position.x;
                y = spr.position.y;
                z = spr.position.z;
                positions.push(x,y,z);
                objects.push(spr);
                group.add(spr);
                //console.log(`spritecloud positions i=${i} j=${j}`);
              }
              if(loaded === N){
                console.log(`cld texture loading complete - ${loaded} images`);
                //console.log(`textures complete - objs.l = ${objects.length}`);
  
                // if state_positions = [] or undefined generate morph positions
                if(state_positions.length === 0){ 
                  //console.log(`initially positions.length = ${positions.length}`);
                  positions = morphTargets.generate(state);
                  //console.log(`after positions.length = ${positions.length}`);
                  //for(let i=0; i<positions.length; i++){
                  //  console.log(`positions[${i}] = ${positions[i]}`);
                  //}
                }else{
                  //console.log(`initially positions.length = ${positions.length}`);
                  positions = state_positions;
                  console.log(`after positions.length = ${positions.length}`);
                }
  
                // calculate number of morphtargets
                // NOTE: positions is array of (x,y,z) (3) for each vertex 
                // (particles) for each target
                targets = positions.length/(particles * 3);
  
                // start animation cycle
                //console.log(`at cld.transition: pos.l=${positions.length}`);
                //console.log(`targets=${targets}`);
                transition();
              }
            },
            // progress
            (xhr) => {
              console.log(`cloud loading textures...`);
            },
            // error
            (xhr) => {
              console.log(`error loading url ${urls[i]}`);
            }
          );
        }
      } catch(e) {
        console.log(`error in spritecloud_init: ${e.message}`);
      }

      //transform
      if(transform){
        transform3d.apply(transform, group);
      }

      //implement animate method - optional method on actor.interface.ts
      // et is ellapsedTime obtained from clock in narrative render-loop
      group['animate'] = (et:number):void => {
        //period = 0.1 + Math.random() * 0.1;  //period = 0.001;
        const period = group_speed_base + group_speed_variance*Math.random();  //period = 0.001;
        for (let i = 0, l = group.children.length; i < l; i ++ ) {
          const sprite = group.children[ i ],
                material = sprite.material;
          // orig - exceeds screen to much
          //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 1.0;
          // more constrained
          // orig
          //scale = Math.sin( et + sprite.position.x * 0.01 ) * 0.3 + 0.5;
          //scale = Math.sin( et + sprite.position.z * 0.01 ) * 0.3 + 0.5;
          const scale = Math.sin( et + sprite.position.z * 0.1 ) * 0.3 + 0.5;
          let imageWidth = 1;
          let imageHeight = 1;
          if(material.map && material.map.image && material.map.image.width){
            imageWidth = material.map.image.width;
            imageHeight = material.map.image.height;
          }

          material.rotation += period * 0.1;     // ( i / l ); 
          sprite.scale.set( scale * imageWidth, scale * imageHeight, 1.0 );

          sprite.rotation.x = et * sprite_rotation_speedX;
          sprite.rotation.z = et * sprite_rotation_speedZ; //0.6;
        }

        // EXPT!!!!! - no spritegroup rotation in X or Y
        //group.rotation.x = et * 0.5;
        //group.rotation.y = et * 0.75;
        //group.rotation.z = et * 1.0;

        //group.rotation.x = et * 0.2;
        //group.rotation.y = et * 0.4;
        //group.rotation.z = et * 0.3; //0.6;

        pivot.rotation.x = et * pivot_rotation_speedX;
        pivot.rotation.z = et * pivot_rotation_speedZ; //0.6;
      };

      resolve(group);

    });//return new Promise

  }//create()

};//Spritecloud
