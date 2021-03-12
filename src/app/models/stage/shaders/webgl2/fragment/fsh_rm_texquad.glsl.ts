// fsh_rm_texquad.glsl.ts
// rm-quad NDC [-1,1]x[-1,1] texture map
// Fragment shader program 


const uniforms:Record<string,unknown> = {
  tDiffuse: {type: 't', value: null},
  uTime:{type: 'f', value: 0.0},
  uResolution:{type: 'v2', value: new THREE.Vector2(960,1080)}
};

const fsh = `
      #version 300 es

      #ifdef GL_ES
      precision mediump float;
      #endif
      uniform sampler2D tDiffuse; 
      uniform float uTime; 
      in vec2 vuv;
      out vec4 out_FragColor;

      void main() {
        // map texture pixels to [-1,1]x[-1,1] near plane of fsh-eye fov=90
        vec3 fwd = normalize(vec3(2.0*vuv.s-1.0, 2.0*vuv.t-1.0,-1.0));

        // paint
        out_FragColor = texture2D(tDiffuse, vuv); 
      }`;


export {fsh, uniforms};
