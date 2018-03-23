import { Proto } from '../core/Proto';

function Bool ( o ){

    Proto.call( this, o );
    
    this.value = o.value || false;

    this.buttonColor = o.bColor || this.colors.button;

    this.inh = o.inh || this.h;

    var t = Math.floor(this.h*0.5)-((this.inh-2)*0.5);

    this.c[2] = this.dom( 'div', this.css.basic + 'background:'+ this.colors.boolbg +'; height:'+(this.inh-2)+'px; width:36px; top:'+t+'px; border-radius:10px; border:2px solid '+this.boolbg );
    this.c[3] = this.dom( 'div', this.css.basic + 'height:'+(this.inh-6)+'px; width:16px; top:'+(t+2)+'px; border-radius:10px; background:'+this.buttonColor+';' );

    this.init();
    this.update();

}

Bool.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Bool,

    // ----------------------
    //   EVENTS
    // ----------------------

    mousemove: function ( e ) {

        this.cursor('pointer');

    },

    mousedown: function ( e ) {

        this.value = this.value ? false : true;
        this.update();
        this.send();
        return true;

    },

    update: function () {

        var s = this.s;

        if( this.value ){
            
            s[2].background = this.fontColor;
            s[2].borderColor = this.fontColor;
            s[3].marginLeft = '17px';

        } else {
            
            s[2].background = this.colors.boolbg;
            s[2].borderColor = this.colors.boolbg;
            s[3].marginLeft = '2px';

        }
            
    },

    rSize: function () {

        Proto.prototype.rSize.call( this );
        var s = this.s;
        s[2].left = this.sa + 'px';
        s[3].left = this.sa+1+ 'px';

    }

} );

export { Bool };