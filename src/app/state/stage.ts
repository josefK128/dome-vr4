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
  async scene(scene_name:string, state:Record<string,unknown>, scene:THREE.Scene, narrative:Cast):Promise<void>{

      // break-resolve if state[scene_name] (exp state['sgscene']) is undefined
      // or if state[scene_name] = {}
      if(state === undefined){ 
        console.log(`@@ stage.scene: ${scene_name} state is undefined`);
        return new Promise((resolve, reject) => {
          resolve();
        });
      }
      console.log(`@@ stage.scene: ${scene_name} state is defined:`);
      console.dir(state);


      const _actors = <boolean>(state['_actors'] || false),
            actors = <Record<string,Actor>>(state['actors'] || {});
      //console.log(`_actors = ${_actors}`);
      //console.log(`actors = ${actors}`);

      // asignable
      let m:Record<string,unknown>,
          actor:Actor;


      // process actors one by one
      if(actors && Object.keys(actors).length > 0){
        for(const name of Object.keys(actors)){
          const descriptor = actors[name],
                factory = <string>descriptor['factory'],
                url = <string>descriptor['url'],
                options = <Record<string,unknown>>descriptor['options'];

          console.log(`\n\n*************************************`);
          console.log(`actors[${name}] = ${actors[name]}`);
          console.dir(actors[name]);
          console.log(`options = ${options}`);
          console.dir(options);
          console.log(`typeof factory = ${typeof factory}`);



          switch(_actors){
            case true:     // _actor=t => create actor
              if(url){
                console.log(`creating actor - url = ${url}`);

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
                  //if(factory === 'Panorama'){
                  if(actor['layers'] && actor['layers'].length > 0){
                    console.log(`\nstage.sc ${scene_name} - adding ${name}.layers to scene`);
                    let i=0;
                    for(const layer of actor['layers']){
                      narrative.addActor(scene, `${name}.layer${i}`, actor['layers'][i]);
                      i++;
                    }
                  }else{
                    console.log(`stage.scene ${scene_name} - narrative.addActor(${name})`);
                    console.log(`add actor = ${actor}`);
                    console.log(`typeof actor = ${typeof actor}`);
                    console.log(`typeof scene = ${typeof scene}`);
                    console.log(`scene = ${scene}`);
                    console.dir(scene);
                    narrative.addActor(scene, name, actor);
                  }
                }catch(e){
                  console.log(`factory.create(${options}) error:${e}`);
                }
              }
              break;

            case false:    // _actor=f => remove actor
              actor = narrative.findActor(name);
              if(actor['layers'] && actor['layers'].length > 0){
                console.log(`\nstage.sc ${scene_name} - removing ${name}.layers from scene`);
                let i=0;
                for(const layer of actor['layers']){
                  narrative.removeActor(scene, `${name}.layer${i}`);
                  i++;
                }
              }else{
                console.log(`stage.scene ${scene_name} - narrative.removeActor(${name})`);
                narrative.removeActor(scene, name);
              }
              break;

            default:       // _actor=undefined => modify actor
              console.log(`stage.scene ${scene_name} modifying actor ${name}`);
              actors[name].delta(options);

          }//switch(_actors)
        }//for(name)
      }//if(actors.l >0

//      console.log(`\nafter stage.scene():`);
//      for(const [n,a] of Object.entries(narrative.reportActors())){
//        console.log(`cast contains actor ${n}`);
//      }

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
            stage.scene('sgscene', sgstate, scenes['sgscene'], narrative),
            stage.scene('rmscene', rmstate, scenes['rmscene'], narrative),
            stage.scene('vrscene', vrstate, scenes['vrscene'], narrative),
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
