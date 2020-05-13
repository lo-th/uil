import { Proto } from '../core/Proto';

function TextInput( o ){

    Proto.call( this, o );

    this.cmode = 0;

    this.value = o.value || '';
    this.placeHolder = o.placeHolder || '';

    this.allway = o.allway || false;
    //this.firstImput = false;

    this.isDown = false;

    // bg
    this.c[2] = this.dom( 'div', this.css.basic + ' background:' + this.colors.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' );

    this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; line-height:'+(this.h-8)+'px; background:' + this.colors.inputBg + '; borderColor:' + this.colors.inputBorder+'; border-radius:'+this.radius+'px;' );
    this.c[3].textContent = this.value;

    // cursor
    this.c[4] = this.dom( 'div', this.css.basic + 'top:4px; height:' + (this.h-8) + 'px; width:0px; background:'+this.fontColor+';' );


    this.init();

}

TextInput.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: TextInput,

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x >= this.sa ) return 'text';
        return '';

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup: function ( e ) {

        if( this.isDown ){
            this.isDown = false;
            return this.mousemove( e );
        }

        return false;

    },

    mousedown: function ( e ) {

        var name = this.testZone( e );

        if( !this.isDown ){
            this.isDown = true;
            if( name === 'text' ) this.setInput( this.c[3] );
            return this.mousemove( e );
        }

        return false;

    },

    mousemove: function ( e ) {

        var name = this.testZone( e );

        //var l = this.local;
        //if( l.x === -1 && l.y === -1 ){ return;}

        //if( l.x >= this.sa ) this.cursor('text');
        //else this.cursor();

        var x = 0;

        if( name === 'text' ) this.cursor('text');
        else this.cursor();

        if( this.isDown ) x = e.clientX - this.zone.x;

        return this.upInput( x - this.sa -3, this.isDown );

    },

    render: function ( c, e, s ) {

        this.s[4].width = '1px';
        this.s[4].left = (this.sa + c+5) + 'px';

        this.s[2].left = (this.sa + e+5) + 'px';
        this.s[2].width = s+'px';
    
    },


    reset: function () {

        this.cursor();

    },

    // ----------------------
    //   INPUT
    // ----------------------

    select: function ( c, e, w ) {

        var s = this.s;
        var d = this.sa + 5;
        s[4].width = '1px';
        s[4].left = ( d + c ) + 'px';
        s[2].left = ( d + e ) + 'px';
        s[2].width = w + 'px';
    
    },

    unselect: function () {

        var s = this.s;
        if(!s) return;
        s[2].width = 0 + 'px';
        s[4].width = 0 + 'px';

    },

    validate: function () {

        this.value = this.c[3].textContent;
        this.send();

    },

    // ----------------------
    //   REZISE
    // ----------------------

    rSize: function () {

        


        Proto.prototype.rSize.call( this );

        var s = this.s;
        s[3].left = this.sa + 'px';
        s[3].width = this.sb + 'px';
     
    },


});

export { TextInput };