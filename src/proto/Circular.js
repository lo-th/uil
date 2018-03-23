import { Proto } from '../core/Proto';
import { V2 } from '../core/V2';

function Circular ( o ) {

    Proto.call( this, o );

    //this.type = 'circular';
    this.autoWidth = false;

    this.buttonColor = this.colors.button;

    this.setTypeNumber( o );

    this.radius = this.w * 0.5;//Math.floor((this.w-20)*0.5);


    //this.ww = this.radius * 2;

   // this.h = this.height + 40;



    this.twoPi = Math.PI * 2;
    this.pi90 = Math.PI * 0.5;

    this.offset = new V2();

    this.h = o.h || this.w + 10;
    this.top = 0;

    this.c[0].style.width = this.w +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.w +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 10;
        this.h += 10;

    }

    this.percent = 0;

    this.cmode = 0;

    this.c[2] = this.dom( 'div', this.css.txt + 'text-align:center; top:'+(this.h-20)+'px; width:'+this.w+'px; color:'+ this.fontColor );
    this.c[3] = this.getCircular();

    this.setSvg( this.c[3], 'd', this.makePath(), 1 );
    this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );

    this.setSvg( this.c[3], 'viewBox', '0 0 '+this.w+' '+this.w );
    this.setCss( this.c[3], { width:this.w, height:this.w, left:0, top:this.top });

    this.init();
    this.update();

}

Circular.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Circular,

    mode: function ( mode ) {

        if( this.cmode === mode ) return false;

        switch( mode ){
            case 0: // base
                this.s[2].color = this.fontColor;
                this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.1)', 0);
                this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );
            break;
            case 1: // over
                this.s[2].color = this.colorPlus;
                this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.3)', 0);
                this.setSvg( this.c[3], 'stroke', this.colorPlus, 1 );
            break;
        }

        this.cmode = mode;
        return true;

    },


    reset: function () {

        this.isDown = false;
        

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup: function ( e ) {

        this.isDown = false;
        this.sendEnd();
        return this.mode(0);

    },

    mousedown: function ( e ) {

        this.isDown = true;
        this.old = this.value;
        this.oldr = null;
        this.mousemove( e );
        return this.mode(1);

    },

    mousemove: function ( e ) {

        //this.mode(1);

        if( !this.isDown ) return;

        var off = this.offset;

        off.x = this.radius - (e.clientX - this.zone.x );
        off.y = this.radius - (e.clientY - this.zone.y - this.top );

        this.r = off.angle() - this.pi90;
        this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

        if( this.oldr !== null ){ 

            var dif = this.r - this.oldr;
            this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

            if( dif > 6 ) this.r = 0;
            if( dif < -6 ) this.r = this.twoPi;

        }

        var steps = 1 / this.twoPi;
        var value = this.r * steps;

        var n = ( ( this.range * value ) + this.min ) - this.old;

        if(n >= this.step || n <= this.step){ 
            n = ~~ ( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
        }

    },

    makePath: function () {

        var r = 40;
        var d = 24;
        var a = this.percent * this.twoPi - 0.001;
        var x2 = (r + r * Math.sin(a)) + d;
        var y2 = (r - r * Math.cos(a)) + d;
        var big = a > Math.PI ? 1 : 0;
        return "M " + (r+d) + "," + d + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2;

    },

    update: function ( up ) {

        this.c[2].textContent = this.value;
        this.percent = ( this.value - this.min ) / this.range;

        this.setSvg( this.c[3], 'd', this.makePath(), 1 );
        if( up ) this.send();
        
    },

} );

export { Circular };