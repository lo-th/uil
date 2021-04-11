import { Proto } from '../core/Proto';

export class Empty extends Proto {

    constructor( o = {} ) {

	    o.simple = true;
	    o.isSpace = true;

        super( o );
        
        this.init();

    }
    
}
