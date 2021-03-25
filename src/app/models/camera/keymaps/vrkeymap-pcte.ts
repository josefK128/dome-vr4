// vrkeymap.ts
//
// spacebar returns controlTarget to origin
// horizontal arrow keys control dollyX
// vertical arrow keys control dollyY
// possibly shift-horizontal arrows control zoom-in and out via fov
// In that case spacebar should also return fov to 90 (original)
import {Keymap} from './keymap.interface';


// singleton closure-instance variable
let vrkeymap:Vrkeymap,
    a:Record<string,unknown>;


class Vrkeymap implements Keymap {

  private constructor(){
    //console.log(`private Vrkeymap ctor`
  }

  static create(){
    if(vrkeymap === undefined){
      vrkeymap = new Vrkeymap();
    }
  }

  // start key-listening and identify controlTarget and optional dolly spped
  // typically controlTarget is vrscene, but can be individual actor for exp.
  start(controlTarget:THREE.Object3D, webxr=false, rotateTarget:THREE.Object3D=undefined, speed=0.01){

    //console.log(`+++ vrkeymap:  controlTarget = ${controlTarget}:`);
    //console.dir(controlTarget);
    //console.log(`+++ vrkeymap:  rotateTarget = ${rotateTarget}:`);
    //console.dir(rotateTarget);


    // vars
    a={};

    document.addEventListener('keydown', (e) => {
      switch(e.keyCode){

        // HOME = SPACEBAR
        // restore controlTarget to position=origin, 
        // with default up and orientation, and scale,
        // and if using zoom by fov, set fov=90 (original) 
        case 32:
          //console.log(`key pressed is ${e.key} SPACEBAR webxr=${webxr}`);  
          //console.log(`controlTarget.position:`);
          //console.dir(controlTarget.position);

          // RECALL: webxr=t => camera is at (0,1.6,0) => controlTarget:
          controlTarget.position.x = 0.0;
          controlTarget.position.y = 0.0;
          controlTarget.position.z = 0.0;
          controlTarget.rotation.x = 0.0;
          controlTarget.rotation.y = 0.0;
          controlTarget.rotation.z = 0.0;
          controlTarget.up.x = 0.0;
          controlTarget.up.y = 0.0;
          controlTarget.up.z = 0.0;

          // rotateTarget
          if(rotateTarget){
            rotateTarget.rotation.x = 0.0;
            rotateTarget.rotation.y = 0.0;
            rotateTarget.rotation.z = 0.0;
          }

          break;


        // DOLLY - arrows
        // left arrow - LEFT X-         
        // SHIFT-left arrow - yaw cw         
        case 37: 
          //console.log(`key pressed is ${e.key} LEFT-ARROW`);  
          if(e.shiftKey){ // sh => UP Y+
            if(rotateTarget){
              rotateTarget.rotation.y -= speed;
            }
          }else{   
            controlTarget.position.x -= speed;
          }
          break;
  
        // right arrow - RIGHT X+
        // SHIFT-right arrow - yaw ccw         
        case 39: 
          //console.log(`key pressed is ${e.key} RIGHT-ARROW`);  
          if(e.shiftKey){ // sh => UP Y+
            if(rotateTarget){
              rotateTarget.rotation.y += speed;
            }
          }else{   
            controlTarget.position.x += speed;
          }
          break;
    
        // up arrow - UP Y+          
        // SHIFT-up arrow - pitch ccw         
        case 38: 
          //console.log(`key pressed is ${e.key} UP-ARROW`); 
          if(e.shiftKey){ // sh => UP Y+
            if(rotateTarget){
              rotateTarget.rotation.x += speed;
            }
          }else{          // no-sh => FWD Z-
            controlTarget.position.y -= speed;
          }
          break;
    
        // down arrow - DOWN Y-          
        // SHIFT-down arrow - pitch cw         
        case 40: 
          //console.log(`key pressed is ${e.key} DOWN-ARROW`); 
          if(e.shiftKey){ // sh => UP Y+
            if(rotateTarget){
              rotateTarget.rotation.x -= speed;
            }
          }else{   
            controlTarget.position.y += speed;
          }
          break;
    
        default:
          //console.log(`key '${e.keyCode}' not associated with //c3d function`);

      }
    });
    
//    document.addEventListener('keyup', (e) => {
//      switch(e.keyCode){
//      }
//    });

  }//start
 
}

//enforce singleton
Vrkeymap.create();
export {vrkeymap};
