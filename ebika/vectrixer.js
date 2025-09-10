import { BaseUtils } from './baseUtils.js';

export class Vectrixer extends BaseUtils {

    static vecIni({ dim = 3, value = 0 } = {}) {
        return Array(dim).fill(value);
    }

    static copy({  matrix = [[1, 2], [3, 4]]} = {}) {
        return  matrix.map(row => [...row]);
    }

    static vector({ p1 = [1, 1, 1], p2 = [3, 4, -1] } = {}) {
        return p2.map((val, i) => val - p1[i]);
    }

    static add({ v1 = [1, 1, 1], v2 = [3, 4, -1] } = {}) {
        return v1.map((val, i) => val + v2[i]);
    }

    static scale({ v = [1, 1, 1], scalar = 0.5 } = {}) {
        return v.map((val) => scalar*val);
    }

    static magnitude({v = [2, 3, 3]} = {}) {
        const sum = v.reduce((acc, val) => { return  acc + val * val }, 0 ) ; 
        return Math.sqrt(sum); 
    } 

    static distance({ p1 = [1, 1, 1], p2 = [3, 4, -1] } = {}) {
        const v = this.vector({ p1, p2 });
        return this.magnitude({ v });
    }

    static scaleVectors({vectors = [[1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]] , scalar = 1.4} = {}){

          return vectors.map(elt => Vectrixer.scale({v: elt, scalar}));
    }

    static barycentre({ points = [[1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]] } = {}) {
       return  Vectrixer.sumVectors({ vectors: points  }).map(elt => elt / points[0].length );
    }

    static sumVectors({ vectors = [[1, 1, 1], [2, 2, 2], [3, 3, 3]] } = {}) {
       return  vectors.reduce((acc, curr) => {
              return Vectrixer.add({v1:acc, v2: curr});
       }, Vectrixer.vecIni( {dim: vectors[0].length, value: 0}));
    }

    static vectorsFromCenter({center = [-1, -1, -1], 
       points = [[1, 1, 1], [2, 2, 2], [3, 3, 3]]
    } = {}) {

       return points.map(elt => Vectrixer.vector({p1: center, p2: elt}) );

    }

    static addToCenter({center = [-1, -1, -1], 
       vectors = [[1, 1, 1], [2, 2, 2], [3, 3, 3]]
    } = {}) {

       return vectors.map(elt => Vectrixer.add({v1: center, v2: elt}) );

    }



    static pathInfo({ path = [[1, 5, 2], [2, 2.5, 3], [5, 4.4, 1.9], [7, 3.2, -6.9]] } = {}) {

        const vectors = path.map((point, i) => {
          if (i === 0) {
            return this.vecIni({ dim: path[0].length, value: 0 });  
          }
          return this.vector({ p1: path[i - 1], p2: point });
        });
      
        const distances = path.map((point, i) => {
          if (i === 0) return 0;
          return this.distance({ p1: path[i - 1], p2: point });
        });
      
        let runningTotal = 0;
        const accudistances = distances.map(d => {
          runningTotal += d;
          return runningTotal;
        });
      
        const totalDistance = accudistances[accudistances.length - 1] || 1;
        const ratio = accudistances.map(d => d / totalDistance);
      
        return { vectors, distances, accudistances, ratio };
    }

    
    static dot({ v1 = [], v2 = [] }) {
        return v1.reduce((acc, val, i) => acc + val * v2[i], 0);
      }
    
      // Cross product: a × b
      static cross({ v1 = [], v2 = [] }) {
        return [
          v1[1] * v2[2] - v1[2] * v2[1],
          v1[2] * v2[0] - v1[0] * v2[2],
          v1[0] * v2[1] - v1[1] * v2[0]
        ];
      }
    
      // Magnitude (length): ||v||
      static magnitude({ v = [] }) {
        const sum = v.reduce((acc, val) => acc + val * val, 0);
        return Math.sqrt(sum);
      }
    
      // Normalize vector: v / ||v||
      static normalize({ v = [] }) {
        const mag = this.magnitude({ v });
        if (mag === 0) throw new Error("Cannot normalize a zero vector");
        return v.map(val => val / mag);
      }

      static perpendicular2D({ vector = [1, 0], direction = Config.DIR_LEFT }) {
        const [x, y] = vector;
      

        if (direction === Config.DIR_LEFT || direction === Config.DIR_CCW) {
          return [-y, x];  // 90° counterclockwise
        } else if (direction === Config.DIR_RIGHT || direction === Config.DIR_CW) {
          return [y, -x];  // 90° clockwise
        } else  
          throw new Error("Invalid direction: use 'left' (ccw) or 'right' (cw)");
         
      }
      
      static perpendicularPlaneBasis({ normal = [0, 0, 1] }) {
        // Pick a vector not parallel to the normal
        const guess = Math.abs(normal[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      
        const u = this.normalize({ v: this.cross({ v1: normal, v2: guess }) });
        const v = this.normalize({ v: this.cross({ v1: normal, v2: u }) });
      
        return { u, v };
      }


}