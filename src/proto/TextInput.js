import { Proto } from '../core/Proto';

function TextInput( o ){

    Proto.call( this, o );

    this.cmode = 0;

    this.value = o.value || '';
    this.allway = o.allway || false;
    this.firstImput = false;

    this.c[2] = this.dom( 'div', this.css.txtselect );
    this.c[2].textContent = this.value;


    this.init();

}

TextInput.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: TextInput,

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown: function ( e ) {



        this.setInput( this.c[2], function(){ this.validate() }.bind(this) );
        return this.mode(2);

    },

    mousemove: function ( e ) {

        return this.mode(1);

    },

    keydown: function ( e ) { return true; },

    mode: function ( n ) {

        if( n === this.cmode ) return false;

        var m;

        switch ( n ) {

            case 0: m = this.colors.border; break;
            case 1: m = this.colors.borderOver; break;
            case 2: m = this.colors.borderSelect;  break;

        }

        this.c[2].style.borderColor = m;
        this.cmode = n;
        return true;

    },

    reset: function () {

        this.mode(0);

    },

    // ----------------------

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var s = this.s;
        s[2].color = this.fontColor;
        s[2].left = this.sa + 'px';
        s[2].width = this.sb + 'px';
        s[2].height = this.h -4 + 'px';
        s[2].lineHeight = this.h - 8 + 'px';
     
    },

    validate: function () {

        this.value = this.c[2].textContent;
        this.send();

    },


} );

export { TextInput };