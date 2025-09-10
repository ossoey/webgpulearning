import {Vectrixer} from './vectrixer.js';

export class Points extends Vectrixer {

    constructor ( {points = [ [1, 0], [1, 2]], sizes = [0.2, 0.3]}) {

        super();
        this.points = points;
        this.sizes = sizes;  
        this._square = this._square.bind(this);
        this._squares = this._squares.bind(this)
    }

    set setPoints(points = [ [1, 0], [1, 2]]) {
        this.points = points; 
    }

    _square(point, size) {
       
        const corners = [
            [point[0] - size/2, point[1] -size], 
            [point[0] + size/2, point[1] -size],
            [point[0] + size/2, point[1] +size],
            [point[0] - size/2, point[1] +size],
        ];

        const triangles = [
                corners[0], 
                corners[1], 
                corners[2], 
                corners[0],
                corners[2], 
                corners[3],  
        ];


        return {vertsFlat: triangles.flat(), vertsCount: 6 }

    }

    _squares() {
       
        const vertsFlat = [];
        let vertsCount = 0;
        this.points.forEach((elt, ndx) => {
   
            const result = this._square(elt, this.sizes[ndx])

            vertsCount += result.vertsCount; 

            vertsFlat.push(result.vertsFlat);

        });


        return {vertsFlat: vertsFlat.flat() , vertsCount}

    } 


    get info() {

        return { vertices: this._squares().vertsFlat, vertsCount: this._squares().vertsCount };
    }


}