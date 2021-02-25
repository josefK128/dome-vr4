#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable


// glsl sandbox standard uniforms 
// could be replaced with uTime, uResolution defined in fsh_rm_texquad.glsl
uniform float time;
uniform vec2 resolution;


uniform sampler2D tDiffuse;
varying vec2 vuv;

//uniform vec3 positions[1000];  // manage this array on cpu!
//uniform int n_positions;
// simulate uniforms
vec3 positions[4];
const int n_positions = 4;


// simulate uniform positions values
void init(){
  positions[0] = vec3(0.0,0.1,-2.0);
  positions[1] = vec3(0.0,-0.1,-2.0);
  positions[2] = vec3(0.1,0.0,-2.0);
  positions[3] = vec3(-0.1,0.0,-2.0);
}



// distance of ray-point from sphere surface (negative if inside sphere)
float d(vec3 p, vec3 c){
  return length(p-c) - 0.03;   //radius=0.03	
}


vec3 march(vec3 o, vec3 r){
  float t = 1.0;

  float min_d = 1000.0;
  float dp;
	

  for(int i=0; i<32; ++i){     // iterations=32
      vec3 p = o + r*t;         // ray p
    
      // for stage i find min of distances to all _n_positions spheres
      for(int j=0; j<n_positions; j++){   // sphere center _positions[j]     
        dp = d(p, positions[j]);   // distance of p to _positions[j] sphere surface
        min_d = min(min_d,dp);     // min_d is min distance over all spheres
      }
      if(min_d < .005){   //.001
        return vec3(0.0,0.5,1.0);   // if intersect sphere surface - return color
      }
      t += min_d*0.5;             // else, march raypoint p by min_d*0.5
  }
	
  return vec3(0.0,0.0,0.0);   // no intersection - return background
}


void main( void ) {

	vec2 position = ( gl_FragCoord.xy / resolution.xy );
	position = position*2.0 -1.0;   // normalized device coords [-1,1]x[-1,1]  	
	
	// correct for aspect ratio - not needed in rm-stage - corrected in vr-stage
	//position.x *= resolution.x/resolution.y;

	
	// TEMP - init simluated uniforms
	init();
	
	
	vec3 ray = normalize(vec3(position.xy, -1.0));  // ray starts on [-1,1]x[-1,1] z=-1.0	
	vec3 eye = vec3(0,0,0);           // eye at (0,0,0)
	
        vec3 color = march(eye, ray);
	
	if(color.rgb == vec3(0.0,0.0,0.0)){
	  //gl_FragColor = vec4(1.0,0.0,0.0,0.0);  // check on conditional - produces red bg
          //gl_FragColor = texture2D(tDiffuse, position.xy);  //produces small ghost image ?!
          gl_FragColor = texture2D(tDiffuse, vuv);  // needs vertex shader definition !  
	}else{
	  gl_FragColor = vec4(color, 1.0);
	}
}
