// morphtarget generators
// helix2
export const helix2 = (state:Record<string,unknown>):number[] => {
  const TWOPI = 2*Math.PI,
        radius = 0.6 * <number>state['cloudRadius'],  // 600
        vertices:number[] = [],
        particles = <number>state['particles'];
  let i:number;


  for (let j = 0; j < particles; j++ ) {
        if(j%2 === 0){
          i = j;
        }else{
          i = particles/2.0 + j;
        }
        const p = i/particles;
        vertices.push(
          radius * Math.cos(3*p * TWOPI),
          2*p*radius - 600,
          radius * Math.sin(3*p * TWOPI)
        );
  }
  return vertices;
};
