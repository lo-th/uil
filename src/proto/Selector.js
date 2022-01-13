//import { Proto } from '../core/Proto.js';
import { Button } from './Button.js';

export class Selector extends Button {

    constructor( o = {} ) {

        if( o.selectable === undefined ) o.selectable = true
        super( o );
     
    }

}