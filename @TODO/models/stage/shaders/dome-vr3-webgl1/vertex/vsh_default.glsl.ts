// webGL Vertex shader program 
// vsh_default - model coords to perspective-view coords - allows model sharing

export var vsh:string = `

  void main(){
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
