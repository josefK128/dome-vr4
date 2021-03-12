// morphtarget generators
// sphere2
export const sphere2 = (state:Record<string,unknown>):number[] => {
  const radius = 0.75 * <number>state['cloudRadius'],  // 750
        vertices:number[] = [],
        particles = <number>state['particles'];

  for ( let i = 0; i < particles; i ++ ) {
        const phi = 3*Math.acos( -1 + ( 2 * i ) / particles ),
            theta = 0.5 * Math.sqrt( particles * Math.PI ) * phi;

        vertices.push(
          radius * Math.cos( theta ) * Math.sin( phi ),
          radius * Math.sin( theta ) * Math.sin( phi ),
          radius * Math.cos( phi )
        );
  }
  return vertices;
};
