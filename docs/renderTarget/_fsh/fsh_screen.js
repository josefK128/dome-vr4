// fsh_screen.ts

export const fsh = `
      #version 300 es

      precision highp float;
      precision highp int;
      
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      out vec4 out_FragColor;

      void main() {
         out_FragColor = texture2D( tDiffuse, vUv );
      }
`;
