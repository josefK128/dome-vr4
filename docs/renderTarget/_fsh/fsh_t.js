// fsh_t.ts
export const fsh_t_uniforms = {
  tDiffuse: {type: 't', value: null}
};

export const fsh_t = `

      precision highp float;
      precision highp int;
      
      varying vec2 vUv;
      uniform sampler2D tDiffuse;

      void main() {
         gl_FragColor = texture2D( tDiffuse, vUv );
      }
`;
