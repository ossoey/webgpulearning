import {Vectrixer} from './vectrixer.js';

export class Lines extends Vectrixer {

    constructor ( {segment = [ [1, 0], [1, 2]]}) {

        super();
        this.segment = segment; 
        this.margin = null; 
        
    }

    set setSegment(segment = [ [1, 0], [1, 2]]) {
        this.segment = segment; 
    }

    get info() {

        return { segment: this.segment, segmentFlat: this.segment.flat()}
    }


}