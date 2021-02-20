// stage.ts 

import {Actor} from '../models/stage/actors/actor.interface';
import {ActorFactory} from '../models/stage/actors/actorfactory.interface';
import {Cast} from '../cast.interface';


// singleton closure-instance variable
let stage:Stage;



class Stage {

  // ctor
  private constructor(){
    stage = this;
  } //ctor

  static create(){
    if(stage === undefined){
      stage = new Stage();
    }
  }


  // scene(name, state, scene, narrative)
  // exp: scene('sg', sgstate, sgscene, narrative);
  // NOTE: state is shorthand for state['stage']['<sg|rm|vr>']
  // state has two possible properties: 
  // [1] _actors can be t or f or undefined 
  // t/f => create/remove actor(s)
  // undefined => modify actor(s) via actor.delta(options), a method
  // [2] actors = Record<string,unknown>[] = [{name:Actor},...]
  async scene(name:string, state:Record<string,unknown>, scene:THREE.Scene,
    narrative:Cast):Promise<void>{
      //console.log(`stage.scene(${name}):`);
      const _actors = <boolean>state['_actors'],
            actors = <Record<string,Actor>>state['actors'];
      //console.log(`_actors = ${_actors}`);
      //console.log(`actors = ${actors}`);

      // process actors one by one
      if(actors && Object.keys(actors).length > 0){
        for(const name of Object.keys(actors)){
          const descriptor = actors[name],
                factory = <string>descriptor['factory'],
                url = <string>descriptor['url'],
                options = <Record<string,unknown>>descriptor['options'];

//          console.log(`actors[${name}] = ${actors[name]}`);
//          console.dir(actors[name]);
//          console.log(`descriptor = ${descriptor}`);
//          console.dir(descriptor);
//          console.log(`options = ${options}`);
//          console.dir(options);
//          console.log(`typeof factory = ${typeof factory}`);


          switch(_actors){
            case true:     // _actor=t => create actor
              if(url){
                console.log(`creating actor - url = ${url}`);

                let m:Record<string,unknown>,
                    actor:Actor;
                try{
                  m = await import(url);
                  //console.log(`m:`);
                  //console.dir(m);
                  //console.log(`m[${factory}]:`);
                  //console.dir(m[factory]);
                }catch(e){
                  console.log(`import(${url}) error:${e}`);
                }

                try{
                  // Panorama is *special case*
                  if(factory === 'Panorama'){
                    console.log(`\nPanorama - adding scene['lens'] to options`);
                    options['lens'] = scene['lens'];
                  }

                  actor = await (<ActorFactory>m[factory]).create(options);
                  
                  // Panorama is *special case*
                  if(factory === 'Panorama'){
                    console.log(`\nstage.sc Panorama - adding layers to scene`);
                    //console.log(`\nstage.sc Panorama - mock narrative.addActor()`);
                    narrative.addActor(scene, `${name}.layer0`, actor['layers'][0]);
                    narrative.addActor(scene, `${name}.layer1`, actor['layers'][1]);
                  }else{
                    //console.log(`stage.scene - mock narrative.addActor()`);
                    console.log(`stage.scene - narrative.addActor()`);
                    narrative.addActor(scene, name, actor);
                  }
                }catch(e){
                  console.log(`factory.create(${options}) error:${e}`);
                }
              }
              break;

            case false:    // _actor=f => remove actor
              narrative.removeActor(scene, name);
              break;

            default:       // _actor=undefined => modify actor
              actors[name].delta(options);

          }//switch(_actors)
        }//for(name)
      }//if(actors.l >0

      return new Promise((resolve, reject) => {
        resolve();
      });

  }//scene()


  // process state = state[stage']
  async delta(state:Record<string,unknown>, scenes:Record<string,THREE.Scene>,narrative:Cast):Promise<void>{
    console.log(`\n\n@@ stage.delta(state,scenes,narrative) state:`);
    console.dir(state);

    return new Promise((resolve, reject) => {

      // process state
      try{
        (async () => {
          const sgstate = <Record<string,unknown>>state['sgscene'],
                rmstate = <Record<string,unknown>>state['rmscene'],
                vrstate = <Record<string,unknown>>state['vrscene'];

          await Promise.all([
            stage.scene('sg', sgstate, scenes['sgscene'], narrative),
            stage.scene('rm', rmstate, scenes['rmscene'], narrative),
            stage.scene('vr', vrstate, scenes['vrscene'], narrative),
          ]);

        })();
        resolve();

      }catch(e){
        console.log(`stage Promise rejected: ${e}`);
        reject();
      }

    });//return Promise

  }//delta

}//Stage


Stage.create();
export {stage};
