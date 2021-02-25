// WebGL Fragment shader program 
// fsh_tex_default
export var uniforms:object = {
  //  tDiffuse: {type: 't', value: null},
  tDiffuse: {value: null},
  uTime:{type: 'f', value: 0.0},
  uResolution:{type: 'v2', value: new THREE.Vector2(960,1080)}
};


export var fsh:string = `
      #ifdef GL_ES
      precision mediump float;
      #endif

      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      varying vec2 vuv;

      void main() {
        gl_FragColor = texture2D(tDiffuse, vuv); 
      }`;


