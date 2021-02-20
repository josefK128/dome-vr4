// panorama.ts
// Actor is a Factory interface - so Panorama 'creates' instances using the
// options Object as variations, i.e. Panorama is a factory and NOT a singleton
//
// Panorama implements ActorFactory interface:
// export interface ActorFactory {
//   create(Object): Promise<Actor>;   //static=> Panorama.create(options)
// Panorama instances implement Actor interface:
// export interface Actor {
//   delta(Object):void;   
//
// declarative specification in context of the stage:actors Object:
// NOTE: urls are relative to app/scenes directory
// NOTE: _actors:true (create) => name, factory, url and options are needed
// NOTE: _actors undefined (modify) => name and options are needed
// NOTE: _actors:false (remove) => only name is needed
// NOTE: options properties which are modifiable (case _actors undefined)
// are preceded by *:
//
//      _actors:true,   // true=>create; false=>remove; undefined=>modify
//      actors:{
//        'panorama':{ 
//          factory:'Panorama',
//          url:'./app/models/stage/actors/environment/panorama',
//          options:{
//            texture_url:'../media/images/cube/sun_temple_stripe__stereo.jpg',
//            ntextures:12
//          } 
//        }
//      }//actors
//};
import {ActorFactory} from '../actorfactory.interface';
import {Actor} from '../actor.interface';
import {transform3d} from '../../../../services/transform3d';


// closure function
function getTexturesFromAtlasFile(atlasImgUrl:string, tilesNum:number ):THREE.Texture[] {
  const textures = [];
  for ( let i = 0; i < tilesNum; i ++ ) {
    textures[ i ] = new THREE.Texture();
  }

  const loader = new THREE.ImageLoader();

  loader.load( atlasImgUrl, function ( imageObj ) {
    let canvas, context;
    const tileWidth = imageObj.height;

    for ( let i = 0; i < textures.length; i ++ ) {
      canvas = document.createElement( 'canvas' );
      context = canvas.getContext( '2d' );
      canvas.height = tileWidth;
      canvas.width = tileWidth;
      context.drawImage( imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth );
      textures[ i ].image = canvas;
      textures[ i ].needsUpdate = true;
    }
  } );

  return textures;
}



// class Panorama - Factory
export const Panorama:ActorFactory = class {

  static create(options:Record<string,unknown>={}):Promise<Actor>{

    console.log(`@Panorama.create(options:)`);
    console.dir(options);

    return new Promise((resolve, reject) => {

      const panorama:Actor = <Actor>{delta: (options:Record<string,unknown>={}):void => {console.log(`panorama.delta(): options=${options}`);}},
            texture_url = <string>options['texture_url'] ||
        '../../../../../../../media/images/cube/sun_temple_stripe_stereo.jpg',
            ntextures = <number>options['ntextures'] || 12,
            lens = <THREE.PerspectiveCamera>options['lens'],
            layers:THREE.Mesh[] = [];


      try{
        // layerL === layer
        // prepare camera for two layers of panorama
        lens['layers'].enable( 1 );

        // geometry
        const geometry = new THREE.BoxGeometry( 100, 100, 100 );
        geometry.scale( 1, 1, - 1 );
        
        //const textures = getTexturesFromAtlasFile( "../../../../../../../media/images/cube/sun_temple_stripe_stereo.jpg", 12 );
        const textures = getTexturesFromAtlasFile(texture_url, ntextures );
//        console.log(`panorama: textures = ${textures}:`);
//        console.dir(textures);
//        console.log(`textures[0]:`);
//        console.dir(textures[0]);


        // skyBoxL - geometry to be SHARED with skyBoxR
        const materialsL = [];
        for ( let i = 0; i < 6; i ++ ) {
          materialsL.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );
        }
        const skyBoxL = new THREE.Mesh( geometry, materialsL );
        skyBoxL.layers.set( 1 );
        layers[0] = skyBoxL;


        // skyBoxR - geometry shared; material NOT shared - distinct materialsR
        const materialsR = [];
        for ( let i = 6; i < 12; i ++ ) {
          materialsR.push( new THREE.MeshBasicMaterial( { map: textures[ i ] } ) );
        }
        const skyBoxR = new THREE.Mesh( geometry, materialsR );
        skyBoxR.layers.set( 2 );
        layers[1] = skyBoxR;


        // attach layers[2] to panorama
        panorama['layers'] = layers;

        // return created panorama instance of Actor - contains
        // delta() and layers:THREE.Mesh[]
        resolve(panorama);

      } catch(e) {
        const err = `error in panorama.create: ${e.message}`;
        console.error(err);
        reject(err);
      }
    });//return Promise<Actor>

  }//create

};//class Panorama
