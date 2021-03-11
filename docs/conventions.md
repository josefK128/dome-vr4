### __conventions.md README__

* [1] NOTE: all scenes are set webvr:true so can be run with VR-headset,
  but if no gear is connected the VR-enable button will show 'VR not found'
  and webGL will be run as if webvr:false.

* [2] The rendering topology consists of three 'scenes' - sgscene, rmscene
  and vrscene. If displayed_scene='sg' then rmscene and vrscene are ignored
  since sgscene is rendered to display. The other option for displayed_scene is
  'vr' - i.e. vrscene is rendered to display. The second sstage, rmscene, can
  be skipped by setting rm:false. If rm:true the offscreen target sgTarget is
  used as a screen for a prescribed fragment shader algorithm to further 
  'paint' - usually by raymarch. The combined screen is rendered to rmTarget 
  to be used as a texture map in vrscene. 

* [3] sgscene has a camera at (0,0,0) looking down the negative-Z axis, and by
  default renders through a 2x2 quad 'sgquad' placed at z=-1 in the XY plane.
  The rmscene uses a virtual camera 'eye' at (0,0,0) which creates a bundle of
  rays through the Normalized device Coordinate quad, 'rmquad', placed at
  z=-1 in the XY plane. By default the sgTarget.texture is conceived to be
  placed at z=-4 in the XY plane - its size is chosen so that its projection
  is always exactly to the rmquad plane. In this manner virtual geometric
  bodies can be placed in the space between rmquad and the sgTarget map and 
  thus vary in size as if 'flying' above the sgTarget map to a zenith in the
  rmquad (where the total rendering is projected) The appearance and animation
  of the raymarch objects are controlled by an array of THREE.Vector3, one
  per object position, and the config variable rm_npositions controls the 
  total number of objects (max 1000). These positions should be defined to
  fit in the previously mentioned frustum between rmquad (2x2 at z=-1) and the
  map - for example 8x8 placed at z=-4. Therefore longitudesd and lattitudes 
  lie between -4 and 4 with z-coordinates between -1 and -4 (furthest away).
  Similar to sgscene, the vr camera is at (0,0,0) looking down the negativeZ
  axis. The VR space onto which the the sgTarget or rmTarget is mapped can
  be arbitrary, and actors are chosen by name and appear in either 
  rmTargetNames or sgTargetNames depending on whether rmscene is used or not,
  respectively.
  
* [4] All scenes should follow a small set of naming conventions - a quad
  actor planeXY) is used in sgscene to contain all visual information. It is 2x2
  and placed at (0,0,-1) where the camera (fov=90) is placed at (0,0,0). 
  It should be named 'sgquad' -   This placement/fov is optimal since the 
  sgquad is pixel-for-pixel alligned projectively to the near plane of the 
  camera (and is adjusted dynamically for aspect ratio should the screen be 
  resized. 
  
  NOTE: if webvr:true then the camera is set by webVR at (0,1.6,0) and is 
  'Object.frozen' so cannot be assigned alternate positions or even transformed
  by matrices. In that case, narrative.ts sets sgscene.position and 
  vrscene.position to (0,1.6,0) also. In this manner, all actors in all scenes 
  are defined (declaratively) and run identically in scenes running in either 
  webGL and webVR. 
  
  The quad in sgscene described above should always be named 'sgquad' (!)
  If post-processing is used in sgscene another actor of type sghud (named 
  'sghud') should also be defined.

  Similarly the quad used in rmscene should be of type rmquad and named
  'rmquad'.

  Finally, if a quad is used in vrscene as a target for offscreen texture
  'sgTarget.texture', it should be named 'vrquad' (!) 
  Finally, if a globe is used in the vrscene it should be named 'vrglobe' (!) 
  (or 'sgglobe' (!) in the unlikely case it is used in sgscene). 
  These name conventions make it easy to reliably fetch an intended actor by
  name for the controls and keymaps described below. (All scene examples follow
  these conventions so it should be easy to use them as templates or even 
  copy-paste actor-declarations for possible further elaboration.)


* [5] Each scene is enabled with a particular pair of controls/keymap - see:
  models/camera/controls/controls.interface.ts
  models/camera/keymaps/keymap.interface.ts
  The particular controls enabled at present are 
  models/camera/controls/vrcontrols.ts, and the keymap is
  models/camera/controls/keymaps/vrkeymap.ts
  (see vrcontrols.md for more specifics on controls/keymaps)


