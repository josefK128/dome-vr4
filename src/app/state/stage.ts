// stage.ts 
import {transform3d} from '../services/transform3d';


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


  delta(state:Record<string,unknown>, narrative:Narrative):Promise<Record<string,unknown>>{
    console.log(`\nstate/stage.delta state:`);
    console.dir(state);

    return new Promise((resolve, reject) => {
      const frame = <Record<string,unknown>>state['frame'],
          sg = state['sgscene'],
          rm = state['rmscene'],
          vr = state['vrscene'],
          result:Record<string,unknown> = {'stage':{}},
          o = result['stage'];   // initially {}


      // process state
      if(state && Object.keys(state).length > 0){

        // frame
        // toggle visibility of stats performance meter 
        if(frame && Object.keys(frame).length > 0){
          if(frame['_stats'] !== undefined){
            o['_stats'] = frame['_stats'];
          }
        }

        // sgscene
        if( sg && Object.keys(sg).length > 0){
          const _actors:boolean = sg['_actors'],
                actors:Record<string,unknown> = sg['actors'];

          // _actors can be t or f or undefined 
          // t/f => create/remove actor(s)
          // undefined => modify actor(s) via actor.delta(options), a method
          // required on every actor instance by implementing the Actor 
          // interface ('delta(Record<string,unknown>):void')
          if(_actors !== undefined){
            if(actors && Object.keys(actors).length >0){
              for(const name of Object.keys(actors)){
                console.log(`### sg-actor name = ${name}`);

                if(_actors){                // t => add actor(s)
                  const descriptor = actors[name] || {},
                        options = descriptor['options'] || {},
                        factory = descriptor['factory'],
                        url = descriptor['url'];

                  // diagnostics
                  //console.log(`url = ${url}`);
                  //console.log(`factory = ${factory}`);
                  //console.log(`options = ${options}:`);
                  //console.dir(options);

                  if(url){
                    System.import(url).then((m) => {
                      //diagnostics
                      //console.log(`imported module ${m}:`);
                      //console.dir(m);

                      // EXP: 
                      // stage:{
                      //   sgscene:{ _actors:true
                      //               actors:{
                      //               'unitcube':{
                      //                  factory:'Unitcube'
                      //                  url:'../src/app/models/stage/actors/
                      //                      objects/unicube'
                      //                  options:{...}
                      //                },
                      //                ...
                      //             }
                      //      }
                      //   }
                      //   ...
                      //
                      //
                      // factory.create is actorfactory.interface method 
                      // returns Promise<Actor> resolving to Actor instance
                      // 
                      // m['Unitcube'].create(options).then((actor) => {
                      //   ...
                      //   narrative['addSGActor']('unitcube', actor);
                      // });
                      //

                      //console.log(`**** url = ${url}:`);
                      //console.log(`**** m = ${m}:`);
                      //console.dir(m);
                      //console.log(`factory = ${factory}`);
                      //console.log(`**** m[factory] = ${m[factory]}`);
                      //console.log(`**** m[factory].create = ${m[factory].create}`);
                   
                      m[factory].create(options,narrative).then((actor) => {
                        console.log(`### stage: adding sg actor ${name}`);
                        narrative['addSGActor'](name, actor);
                        //let cast = narrative['reportActors'](true);
                        //console.dir(cast);
                      }).catch((e) => {
                        console.log(`actor fetch error: ${e}!!!!!!!!!!!!!!!`);
                      });
                    }).catch((e) => {
                      console.log(`actor-factory url error: ${e}`);
                    });
                  }//if(url
                }else{                    // f => remove actor 
                  console.log(`### stage: removing sg actor ${name}`);
                  narrative['removeSGActor'](name);
                }//actors name-iteration
                resolve(result); 
              }
            }else{//options actors undefined or {}  
              resolve(result); 
            }
          }else{//if(_actors!===undefined=>create/remove

            // _actors===undefined=>modify
            // NOTE: actor must implement the Actor interface, which requires
            // actor to provide modification method 'delta(Record<string,unknown>):void'
            if(actors && Object.keys(actors).length >0){
              for(const name of Object.keys(actors)){
                const actor = narrative['findActor'](name);
                if(actor){
                  const options = actors[name]['options'];
                  actor.delta(options);
                }
              }//actors name-iteration
            }else{
              console.log(`stage resolves sgscene with result={}`);
              resolve(result);
            }
          }//_actors===undefined=>modify  
        }else{ //if Object.keys(sg).length===0
          console.log(`stage resolves sgscene with result={}`);
          resolve(result);
        }


        // rmscene
        if( rm && Object.keys(rm).length > 0){
          const _actors:boolean = rm['_actors'],
                actors:Record<string,unknown> = rm['actors'];

          // _actors can be t or f or undefined 
          // t/f => create/remove actor(s)
          // undefined => modify actor(s) via actor.delta(options), a method
          // required on every actor instance by implementing the Actor 
          // interface ('delta(Record<string,unknown>):void')
          if(_actors !== undefined){
            if(actors && Object.keys(actors).length >0){
              for(const name of Object.keys(actors)){
                console.log(`### rm-actor name = ${name}`);
                if(_actors){                // t => add actor(s)
                  const descriptor = actors[name] || {},
                        options = descriptor['options'] || {},
                        factory = descriptor['factory'],
                        url = descriptor['url'];

                  // diagnostics
                  //console.log(`url = ${url}`);
                  //console.log(`factory = ${factory}`);
                  //console.log(`options = ${options}:`);
                  //console.dir(options);

                  if(url){
                    System.import(url).then((m) => {
                      //diagnostics
                      //console.log(`imported module ${m}:`);
                      //console.dir(m);

                      m[factory].create(options,narrative).then((actor) => {
                        //console.log(`\n\n!!!!!! url = ${url}`);
                        //console.log(`!!!factory.create resolved to ${actor}`);

                        narrative['addRMActor'](name, actor);
                        //console.log(`stage:adding rm actor ${name}=${actor}`);
                      }).catch((e) => {
                        console.error(`actor fetch error: ${e}`);
                      });
                    }).catch((e) => {
                      console.error(`actor-factory url error: ${e}`);
                    });
                  }//if(url
                }else{                    // f => remove actor 
                  console.log(`### stage: removing rm actor ${name}`);
                  narrative['removeRMActor'](name);
                }//actors name-iteration
              }
            }else{ 
              resolve(result);  //{}
            }
          }else{//if(_actors!===undefined=>create/remove

            // _actors===undefined=>modify
            // NOTE: actor must implement the Actor interface, which requires
            // actor to provide modification method 'delta(Record<string,unknown>):void'
            if(actors && Object.keys(actors).length >0){
              for(const name of Object.keys(actors)){
                const actor = narrative['findActor'](name);
                if(actor){
                  const options = actors[name]['options'];
                  actor.delta(options);
                }
              }//actors name-iteration
            }else{
              console.log(`stage resolves rmscene with result={}`);
              resolve(result);
            }
          }//_actors===undefined=>modify  
        }else{ //if Object.keys(rm).length===0
          console.log(`stage resolves rmscene with result={}`);
          resolve(result);
        }


        // vrscene
        if( vr && Object.keys(vr).length > 0){
          const _actors:boolean = vr['_actors'],
                actors:Record<string,unknown> = vr['actors'];

          // _actors can be t or f or undefined 
          // t/f => create/remove actor(s)
          // undefined => modify actor(s) via actor.delta(options), a method
          // required on every actor instance by implementing the Actor 
          // interface ('delta(Record<string,unknown>):void')
          if(_actors !== undefined){
            if(actors && Object.keys(actors).length >0){
              for(const name of Object.keys(actors)){
                console.log(`### vr-actor name = ${name}`);
                if(_actors){                // t => add actor(s)
                  const descriptor = actors[name] || {},
                        options = descriptor['options'] || {},
                        factory = descriptor['factory'],
                        url = descriptor['url'];

                  // diagnostics
                  //console.log(`url = ${url}`);
                  //console.log(`factory = ${factory}`);
                  //console.log(`options = ${options}:`);
                  //console.dir(options);

                  if(url){
                    System.import(url).then((m) => {
                      //diagnostics
                      //console.log(`imported module ${m}:`);
                      //console.dir(m);

                      m[factory].create(options,narrative).then((actor) => {
                        //console.log(`\n\n!!!!!! url = ${url}`);
                        //console.log(`!!!factory.create resolved to ${actor}`);

                        narrative['addVRActor'](name, actor);
                        //console.log(`stage:adding vr actor ${name}=${actor}`);
                      }).catch((e) => {
                        console.error(`actor fetch error: ${e}`);
                      });
                    }).catch((e) => {
                      console.error(`actor-factory url error: ${e}`);
                    });
                  }//if(url
                }else{                    // f => remove actor 
                  console.log(`### stage: removing vr actor ${name}`);
                  narrative['removeVRActor'](name);
                }//actors name-iteration
              }
            }else{ 
              resolve(result);  //{}
            }
          }else{//if(_actors!===undefined=>create/remove

            // _actors===undefined=>modify
            // NOTE: actor must implement the Actor interface, which requires
            // actor to provide modification method 'delta(Record<string,unknown>):void'
            if(actors && Object.keys(actors).length >0){
              for(const name of Object.keys(actors)){
                const actor = narrative['findActor'](name);
                if(actor){
                  const options = actors[name]['options'];
                  actor.delta(options);
                }
              }//actors name-iteration
            }else{
              console.log(`stage resolves vrscene with result={}`);
              resolve(result);
            }
          }//_actors===undefined=>modify  
        }else{ //if Object.keys(vr).length===0
          console.log(`stage resolves rmscene with result={}`);
          resolve(result);
        }

      }//if(state

    });//return Promise

  }//delta
}//Stage


Stage.create();
export {stage};
