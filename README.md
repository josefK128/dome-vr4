### __dome-vr4 README__


* [1] clone the repo - cd to 'dome-vr4'

* [2] install external modules
  npm install

* [3] run included lite http-server
  npm run live-server              => runs live-server at root of tree

* [4] run URL (<hostname>:8080/src/index.html for exp) in webXR-capable browser 
  
   

  NOTE: enter in html-file urls to specific scene (default index.html =>
  app/scenes/scene.ts) and specific bootstrap controller 
  (default app/narrative.ts)   In this manner the particular scene-application desired can be run simply by choosing the corresponding html-file url entered in the browser
  
  

  NOTE: 'npm run tsc' creates an 'esnext' javascript app-tree in /dist which allows inspection of the tsc transpiled code running in the application
  
  
  
  NOTE: 'npm run webpack' bundles the dist/es2018 tree into dist/app.js via 
webpack.config.js
