import { Proto } from '../core/Proto.js';

export class Empty extends Proto {

    constructor( o = {} ) {

        super( { ...o, isSpace: true, margin: 0, h: o.h !== undefined ? o.h : 10 } );

        this.s[ 0 ].pointerEvents = 'none';
        this.init();

    }

    handleEvent () { return false; }
    
}
