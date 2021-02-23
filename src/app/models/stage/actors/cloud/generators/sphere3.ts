// morphtarget generators
// sphere3
export const sphere3 = (state:Record<string,unknown>):number[] => {
  const radius = 0.3 * <number>state['cloudRadius'],  // 750
        vertices:number[] = [],
        particles = <number>state['particles'];


      for(let i = 0; i < particles; i ++ ) {
        const phi = Math.acos( -1 + ( 2 * i ) / particles ),
              theta = Math.sqrt( particles * Math.PI ) * phi;

        vertices.push(
          radius * Math.cos( theta ) * Math.sin( phi ),
          radius * Math.sin( theta ) * Math.sin( phi ),
          2*radius * Math.cos( phi )
        );
      }

  return vertices;
};
