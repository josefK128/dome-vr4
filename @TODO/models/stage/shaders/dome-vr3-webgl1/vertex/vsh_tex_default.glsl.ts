// webGL Vertex shader program 
// vsh_tex_default - model coords to perspective-view coords - allows model sharing

export var vsh:string = `

varying vec2 vuv;

  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    vuv = uv;
  }
`;
