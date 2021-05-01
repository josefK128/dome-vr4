// vsh_default.glsl.ts 
// model coords to perspective-view coords - allows model sharing
// webGL2 Vertex shader program 

export const vsh = `
  /* #version 300 es */

  in vec4 a_position;
  out vec2 vuv;
  
  void main(){
    vuv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * a_position;
  }
`;
