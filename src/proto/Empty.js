import { Proto } from '../core/Proto';

function Empty ( o ){

    o.simple = true;
    o.isEmpty = true;

    Proto.call( this, o );

    this.init();

}

Empty.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Empty,

} );

export { Empty };