// vsh_default.glsl.ts 
// Vertex shader program 

export const vsh_default = `
      varying vec2 vUv;

      void main() {
        /* vUv = uv; */
  		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
      `;

