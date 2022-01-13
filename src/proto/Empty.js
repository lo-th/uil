import { Proto } from '../core/Proto.js';

export class Empty extends Proto {

    constructor( o = {} ) {

	    o.isSpace = true
        o.margin = 0
        if(!o.h) o.h = 10
        super( o )
        this.init()

    }
    
}
