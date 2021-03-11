### __vrcontrols.md  README__

* Each scene is enabled with a particular pair of controls/keymap - see:
  models/camera/controls/controls.interface.ts
  models/camera/keymaps/keymap.interface.ts
  The particular controls enabled at present are 
  models/camera/controls/vrcontrols.ts, and the keymap is
  models/camera/controls/keymaps/vrkeymap.ts
  
  


   * vrcontrols maps mouse movements to rotations of an entire scene, namely
     the scene identified in config.diplayed_scene:'sg'|'vr' - where vrscene is
     the more common and variable choice even if viewed in webGL and not webVR.
     The vrcontrols are assigned to 'controls' in narrative.ts and started at
     frame=0 (first render-loop) by the following line (probably never needing
     to be edited since any future controls will implement the same interface):
     ```controls['start'](vrscene, canvas, [speed=0.01]);```

  


   * vrkeymap maps key-press to actions on two possible 'targets' - the
     controlTarget which is identical to the controlTarget in vrcontrols - an
     entire scene, namely the scene identified in config.diplayed_scene:
     'sg'|'vr' - where (as explained above) vrscene is the more common and 
     variable choice even if viewed in webGL and not webVR. The second targrt is
     rotateTarget, an optional THREE.Object3D nominated in the start invocation
     and which receives rotation actions.
     The vrkeymap keymap is assigned to 'keymap' in narrative.ts and started at
     frame=0 (first render-loop) by the following line (probably never needing
     to be edited since any future controls will implement the same interface):
     ```keymap['start'](vrscene, _webvr, [vrglobe], [speed=0.1]);```

     
     
     The vrkeymap operates in the following manner:


     LEFT-ARROW and RIGHT-ARROW translate the 'controlTarget' scene left and 
     right 
       
     UP-ARROW and DOWN-ARROW translate the 'controlTarget' scene up and down 
     Note that these translations will only be noticed on discrete objects and 
     probably not on large size 'skycubes' or 'skyfaces' or 'globes'.
       
     Adding the SHIFT key to the ARROWS rotates the 'rotateTarget' vrglobe
     for example (if it exists - if not there is no result)
       
     SHIFT-ARROW-LEFT rotates-by yaw (rotation around y-axis) clockwise
     SHIFT-ARROW-RIGHT rotates-by yaw (rotation around y-axis) c-clockwise
     SHIFT-ARROW-UP rotates-by pitch (rotation around x-axis) c-clockwise
     SHIFT-ARROW-DOWN rotates-by pitch (rotation around x-axis) clockwise
       
     SPACEBAR normalizes all control/keymap actions - ie returns to the initial 
     visual presentation of the scene (good for returning to a stable view after
     'roll' is introduced by rotations and position/orientation are confused 
     after accumulated navigation.
       
     NOTE: the control/keymap actions do NOT operate on the camera so should 
     work equivalently in webVR and/or webGL, and they are designed to be 
     simple enough to be used while wearing a VR-headset.

