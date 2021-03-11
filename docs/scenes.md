### __index-scene.md  README__


#### rmscene branch - texturing rmquad fragment shader 

* [1] index.html-scenes/scene.ts maps sgquad off-screen to sgTarget and sgTarget.texture is mapped to rmquad.material.map. Then rmscene is off-screen rendered to rmTarget and rmtarget.texture is mapped to vrquad.material.map.
Also, the example is an exercise of new 'vrcontrols' also tested in
tests/vrcontrols, and a check on the precise numeric placements of camera, scene
and actors to normalize actor definitions for use in scenes with either
webvr:true or webvr:false (webGL). (see the accompanying controls/keymaps
vrcontrols/vrkeymaps documentation in ./index-scene-controls.md) 

* [2]  index.html-scene.ts is the same as sgT-rmfsh-positions-vrquad.html/ts

* [3] sgT-rmfsh-vrquad.html - scenes/sgT-rmfsh-vrquad: sgscene renders to
off-screen buffer sgTarget and sgTarget.texture is CPU-GPU mapped dynamically to the fragment shader uniform 'tDiffuse' in rmquad. rmscene is rendered off-screen to rmTarget and rmTarget.texture is dynamically mapped to vrquad.material.map.

* [4] sgT-rmfsh-skyfaces - scenes/sgT-rmfsh-skyfaces: sgscene renders to
off-screen buffer sgTarget and sgTarget.texture is CPU-GPU mapped dynamically to the fragment shader uniform 'tDiffuse' in rmquad. rmscene is rendered off-screen to rmTarget and rmTarget.texture is dynamically mapped to all six faces of skfaces.material.map.

* [5] sgT-rmfsh-vrglobe.html - scenes/sgT-rmfsh-vrquad: sgscene renders to
off-screen buffer sgTarget and sgTarget.texture is CPU-GPU mapped dynamically to the fragment shader uniform 'tDiffuse' in rmquad. rmscene is rendered off-screen to rmTarget and rmTarget.texture is dynamically mapped to vrglobe.material.map.



#### rmscene, animation and dev branch - texturing meshes and various actors

* [1] index.html-scenes/scene.ts maps sgquad off-screen to sgTarget and sgTarget.texture is mapped to rmquad.material.map. Then rmscene is off-screen rendered to rmTarget and rmtarget.texture is mapped to vrquad.material.map.

The fragment shader for rmquad webgl/fragment/fsh_rm_positions.glsl.ts uses a
raymarch method to 'animate' 'spheres' on quadratic bezier tracks by procedural
animation in narrative.prerender.

Also, the example is an exercise of new 'vrcontrols' also tested in tests/vrcontrols, and a check on the precise numeric placements of camera, scene and actors to normalize actor definitions for use in scenes with either webvr:true or webvr:false (webGL). (see the accompanying controls/keymaps vrcontrols/vrkeymaps documentation in ./index-scene-controls.md)

  see [3] for a more complete summary example of sgTarget.texture mapping to vrcube-skybox and vrglobe-sphere.

  In summary the sgTarget.texture target actors are 'skyfaces', 'vrglobe' (unitsphere), 'vrquad' (planeXY), and possibly 'vrcube (unitcube) - although vrcube is a special case of vrfaces, but easier to declare.

  

* [2a] skyfaces.html-scenes/skyfaces.ts -  maps sgquad off-screen to sgTarget and sgTarget.texture is mapped to rmquad.material.map. Then rmscene is off-screen rendered to rmTarget and rmtarget.texture is mapped to all six faces of skyfaces.material.map. NOTE: set config.sgTargetNames:['skyfaces'] and set optional config.skyfaces to some subset of ['f','b','l','r','t','g']  where, relative to the camera looking down the negative z-axis,  f=>front (negZ face), b=>back (posZ face), l=>left (negX face), r=>right (posX face), t=>top (posY face), g=>ground(bottom) (negY face). These do not match the indices of the sides of the default cube so need to be permuted in narrative.render (render-loop) but this is an implementation detail designed to make the choice of face directions more intuitive to the camera-viewer. The texture maps need inverted normals to reverse the mirror imaged 'error'. Currently to better see all faces the size of the skyfaces 'skybox' is unit and placed at z=-2 and small rotations about x and y reveal b,r and g. (all sides can be seen by adding appropriate small rotation in the e:[rx,ry,rz] component of the transform (these are euler angle radian rotations). The normal default for a skyfaces-skybox is size:1000 (or more) and transform {t:[0,1.6,0], s:[1,1,-1]} - the sz=-1 scaling is critical for texture mirror-flip as explained elsewhere.

* [2b] skyfaces-sg-vr.html-scenes/skyfaces-sg-vr - same as 2a but rm:false
  so sgTarget.texture maps to vrquad (i.e. sgTargetNames=['vrquad'] 
  (not 'rmquad' as above)


* [3] sgquad-to-vrcube-w-globe.html-scenes/sgquad-to-vrcube-w-globe.ts  renders sgquad sgTarget.texture to both 'vrcube' (as in [4]) , and 'vrglobe' as in [5] - these are seven instances (6 cube sides and the globe-sphere) of one texture map created in sgscene.  However, given the greater flexibility of actor 'skyfaces' (see [2]) the 'vrcube' based on actor 'unitcube' is probably not really needed - in summary the sgTarget.texture target actors are 'skyfaces', 'vrglobe' (unitsphere), 'vrquad' (planeXY), and possibly 'vrcube (unitcube).'

* [4] sgquad-to-vrcube.html-scenes/sgquad-to-vrcube.ts is multimaterial quad rendered off-screen and used to texture a unitcube actor ('vrcube' - skybox). NOTE: the unitcube is scaled by [1000,1000,-1000], first to make it an immersive 'skybox', and with sz=-1000 to invert the normals to the 'backwards' texturemap sgTarget.texture appears correctly on the faces.


* [5a] sgquad-to-vrglobe.html-scenes/sgquad-to-vrglobe.ts is multimaterial quad rrendered off-screen and used to texture a unitsphere actor (globe) at z=-2

* [5b] sgquad-to-vrglobe-vrskybox.html-scenes/sgquad-to-vrglobe-vrskybox - same as 5a but adds skybox in vrscene.


* [6] sgquad-to-vrglobe-inv.html-scenes/sgquad-to-vrglobe-inv.ts is multimaterial quad rendered off-screen and used to texture a large unitsphere actor (globe) which surrounds the camera so that the camera is 'at the center of the earth'. The map (sgTarget.texture) is inverted so as to appear correctly (insteaad of mirroe image) - this is done by an inversion of the normals via scale by sz=-1.


* [7] sgquad-to-vrquad-w-globe.html-scenes/sgquad-to-vrquad-w-globe.ts is multimaterial quad rendered off-screen and used to texture a planeXY actor (quad) and with webvr:false or webvr:true => no difference EXCEPT initial camera position has y=1.6 so initial transform tarnsforms the camera ('lens') by t:[0.0,1.6,1.0] and the 'multitexture_quad' by t:[0.0,1.6,0.0]  Also 'multimaterial-sphere added to vrscene - vrscene contains both multi-material map and sphere'

* [8] sgquad-to-vrquad.html-scenes/sgquad-to-vrquad.ts is the same as scenes/scene.ts above but without the additional 'multimaterial-sphere'



* other scenes are in the tests directory:

  [1] actions is a sequences of 'command' actions acting on narrtive.ts and a unitcube actor

  [2] actors-actions is a large set of actors (Axes, GridXZ, PlaneXZ, Skybox, Unitcube, UnitSphere, MultiMaterial quad and MultiMaterial sphere, and multishader ellipse)

  [3] multishader.ts is a composite of four shaders - one checkerboard, one color, and two texturemaps all maps to a [-1,1]x[-1,1] NDC quad and then mapped on a sphere

  [4] sgskybox.ts skybox with six mikyway faces and coordinate axes

  [5] sgquad-no-vrscene is the sgscene from scenes/sgquad-to-vrquad.ts rendered to display BUT no off-screen render to sgTarget, AND using a quadmap of width:4 height:2 instead of 2:2., (as a control test - this fills the window and is less distorted relative to the texture maps)



  
  
  

