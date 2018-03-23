import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function Bool ( o ){

    Proto.call( this, o );

    this.value = o.value || false;

    this.buttonColor = o.bColor || Tools.colors.button;

    this.inh = o.inh || this.h;

    var t = ~~ (this.h*0.5)-((this.inh-2)*0.5);

    this.c[2] = Tools.dom( 'div', Tools.css.basic + 'background:'+ Tools.colors.boolbg +'; height:'+(this.inh-2)+'px; width:36px; top:'+t+'px; border-radius:20px; pointer-events:auto; cursor:pointer; transition:0.1s ease-out;' );
    this.c[3] = Tools.dom( 'div', Tools.css.basic + 'opasity:0, background:'+ Tools.colors.boolbg +'; height:'+(this.inh-6)+'px; width:'+(this.inh-6)+'px; top:'+(t+2)+'px; border-radius:20px; ' );
    this.c[4] = Tools.dom( 'div', Tools.css.basic + 'border:1px solid '+this.buttonColor+'; height:'+(this.inh-4)+'px; width:16px; top:'+(t+1)+'px; border-radius:20px; background:'+this.buttonColor+'; transition:margin 0.1s ease-out;' );

    if(this.value){
        this.c[4].style.marginLeft = '18px';
        this.c[2].style.background = this.fontColor;
        this.c[2].style.borderColor = this.fontColor;
    }

    this.c[2].events = [ 'click' ];

    this.init();

};

Bool.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Bool,

    handleEvent: function ( e ) {

        e.preventDefault();

        switch( e.type ) {
            case 'click': this.click(e); break;
        }

    },

    click: function( e ){

        if(this.value) this.value = false;
        else this.value = true;
        this.update();
        this.send();

    },

    update: function() {

        var s = this.s;

        if(this.value){
            s[4].marginLeft = '18px';
            s[2].background = this.fontColor;
            s[2].borderColor = this.fontColor;
            s[4].borderColor = this.fontColor;
        } else {
            s[4].marginLeft = '0px';
            s[2].background = Tools.colors.boolbg;
            s[2].borderColor = Tools.colors.boolbg;
            s[4].borderColor = Tools.colors.border;
        }
            
    },

    rSize: function(){

        Proto.prototype.rSize.call( this );
        var s = this.s;
        s[2].left = this.sa + 'px';
        s[3].left = this.sa+1+ 'px';
        s[4].left = this.sa+1 + 'px';

    }

} );

export { Bool };