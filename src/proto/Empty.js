import { Proto } from '../core/Proto';

export class Empty extends Proto {

    constructor( o = {} ) {

	    o.simple = true;
	    o.isEmpty = true;

        super( o );
        this.init();

    }
    
}
