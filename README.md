### __dome-vr2 README__


* [1] clone the repo - cd to 'dome-vr2'

* [2] install external modules
  npm install

* [3] run included lite http-server
  npm run live-server              => runs live-server at root of tree

* [4] run URL (<hostname>:8080/src/index.html for exp) in browser - preferably 
  webVR/webXR enabled such as Firefox nightly (needed if config.webvr:true) 
  or alternatively Chrome >=v73 if config.webvr:false.

  
  
  NOTE: If using Chrome version less than v73 use <hostname> instead of localhost. Chrome (earlier than v73) using localhost has a bug causing an error (TypeError: navigator.xr.requestDevice is not a function). For example, if hostname = 'tosca' run as in following:
  http://tosca:8080/src/*.html   
  
 
  
  NOTE: enter in html-file urls to specific scene (default index.html =>
  app/scenes/scene.ts) and specific bootstrap controller 
  (default app/narrative.ts)   In this manner the particular scene-application desired can be run simply by choosing the corresponding html-file url entered in the browser
  

  
  NOTE: 'npm run tsc' creates an 'es2018' javascript app-tree in /dist which allows inspection of the tsc transpiled code running in the application (tsconfig controls the npm-scripts, app/systemjs/systemjs-dynamic-ts.js controls the browser loading of the dynamically transpiled application - they both have target:es2018 and load the typescript es2018 lib for transpiling, so are identical.
  
  
  
  NOTE: 'npm run webpack' bundles the dist/es2018 tree into dist/app.js via 
webpack.config.js
