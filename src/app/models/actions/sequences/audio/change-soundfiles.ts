// seq1.ts
// test sequence load
import {Action} from '../../action.interface';


export const actions:Action[] = [
       {t:'narrative',
        f:'foo',
        a:'o',
        o: {a:1, b:2},
         ms:5000},

      // pause each audio sound one by one
      {t:'globalaudio',    // target - audio actorname
       f:'delta',          // method
       a:'o',              // arg type - object
       o:{pause:true
       },     // arg-object
       ms:10000},             // timestamp

      {t:'globalaudio2',    // target - audio actorname
       f:'delta',          // method
       a:'o',              // arg type - object
       o:{pause:true
       },     // arg-object
       ms:15000},             // timestamp

       {t:'globalaudio3',    // target - audio actorname
       f:'delta',          // method
       a:'o',              // arg type - object
       o:{pause:true
       },     // arg-object
       ms:20000},             // timestamp



      // restart each audio sound one by one
      {t:'globalaudio',    // target - audio actorname
       f:'delta',          // method
       a:'o',              // arg type - object
        o:{url:'./app/assets/audio/ebirds.ogg',
           play:true,
           playbackRate:0.5,
           volume:1.5
       },     // arg-object
       ms:30000},             // timestamp

      {t:'globalaudio2',    // target - audio actorname
       f:'delta',          // method
       a:'o',              // arg type - object
       o:{url:'./app/assets/audio/ebirds.ogg',
          play:true,
          playbackRate:1.5,
          volume:0.5
       },     // arg-object
       ms:35000},             // timestamp

       {t:'globalaudio3',    // target - audio actorname
       f:'delta',          // method
       a:'o',              // arg type - object
         o:{play:true,
            volume:1.0,
            playbackRate:1.0
       },     // arg-object
       ms:40000}             // timestamp

];

