// Fragment shader program 
// fsh_checker - checkerboard pattern
export var uniforms:object = {
  tDiffuse: {type: 't', value: null},
  uTime:{type: 'f', value: 0.0},
  uResolution:{type: 'v2', value: new THREE.Vector2(960,1080)}
};


export var fsh:string = `
      precision highp float;
      precision highp int;

      uniform sampler2D tDiffuse; 
      varying vec2 v_texcoord;


      void main()	{
          float x = mod(gl_FragCoord.x, 20.) < 10. ? 1. : 0.;
          float y = mod(gl_FragCoord.y, 20.) < 10. ? 1. : 0.;
          //gl_FragColor = vec4(vec3(min(x, y)), 1.);
          gl_FragColor = vec4(vec3(min(x, y)), 0.5);

          //gl_FragColor = texture2D(tDiffuse, v_texcoord); 
      }
  `;
