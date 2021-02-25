// Fragment shader program 
// fsh_color - single semi-transparent color
export var uniforms:object = {
  tDiffuse: {type: 't', value: null},
  uTime:{type: 'f', value: 0.0},
  uResolution:{type: 'v2', value: new THREE.Vector2(960,1080)}
};


export var fsh:string = `
      precision highp float;
      precision highp int;

      void main(){
        gl_FragColor = vec4(0.0, 1.0, 1.0, 0.5);  //NOTE: must enable transp.
                                                  //and alpha-blend 
      }
  `;
