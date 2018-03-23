import { Proto } from '../core/Proto';
import { Circular } from './Circular';
import { V2 } from '../core/V2';

function Knob ( o ) {

    Proto.call( this, o );

    this.autoWidth = false;

    this.buttonColor = this.colors.button;

    this.setTypeNumber( o );

    this.mPI = Math.PI * 0.8;
    this.toDeg = 180 / Math.PI;
    this.cirRange = this.mPI * 2;

    this.offset = new V2();

    this.radius = this.w * 0.5;//Math.floor((this.w-20)*0.5);

    //this.ww = this.height = this.radius * 2;
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

    this.c[3] = this.getKnob();
    
    this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );
    this.setSvg( this.c[3], 'stroke', this.fontColor, 3 );
    this.setSvg( this.c[3], 'd', this.makeGrad(), 3 );
    

    this.setSvg( this.c[3], 'viewBox', '0 0 '+this.ww+' '+this.ww );
    this.setCss( this.c[3], { width:this.w, height:this.w, left:0, top:this.top });

    this.r = 0;

    this.init();

    this.update();

}

Knob.prototype = Object.assign( Object.create( Circular.prototype ), {

    constructor: Knob,

    mode: function ( mode ) {

        if( this.cmode === mode ) return false;

        switch(mode){
            case 0: // base
                this.s[2].color = this.fontColor;
                this.setSvg( this.c[3], 'fill',this.colors.button, 0);
                //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.2)', 2);
                this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );
            break;
            case 1: // over
                this.s[2].color = this.colorPlus;
                this.setSvg( this.c[3], 'fill',this.colors.select, 0);
                //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.6)', 2);
                this.setSvg( this.c[3], 'stroke', this.colorPlus, 1 );
            break;
        }

        this.cmode = mode;
        return true;

    },

    

    mousemove: function ( e ) {

        //this.mode(1);

        if( !this.isDown ) return;

        var off = this.offset;

        off.x = this.radius - ( e.clientX - this.zone.x );
        off.y = this.radius - ( e.clientY - this.zone.y - this.top );

        this.r = - Math.atan2( off.x, off.y );

        if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

        this.r = this.r > this.mPI ? this.mPI : this.r;
        this.r = this.r < -this.mPI ? -this.mPI : this.r;

        var steps = 1 / this.cirRange;
        var value = (this.r + this.mPI) * steps;

        var n = ( ( this.range * value ) + this.min ) - this.old;

        if(n >= this.step || n <= this.step){ 
            n = Math.floor( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
        }

    },

    makeGrad: function () {

        var d = '', step, range, a, x, y, x2, y2, r = 64;
        var startangle = Math.PI + this.mPI;
        var endangle = Math.PI - this.mPI;
        //var step = this.step>5 ? this.step : 1;

        if(this.step>5){
            range =  this.range / this.step;
            step = ( startangle - endangle ) / range;
        } else {
            step = (( startangle - endangle ) / r)*2;
            range = r*0.5;
        }

        for ( var i = 0; i <= range; ++i ) {

            a = startangle - ( step * i );
            x = r + Math.sin( a ) * ( r - 20 );
            y = r + Math.cos( a ) * ( r - 20 );
            x2 = r + Math.sin( a ) * ( r - 24 );
            y2 = r + Math.cos( a ) * ( r - 24 );
            d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

        }

        return d;

    },

    update: function ( up ) {

        this.c[2].textContent = this.value;
        this.percent = (this.value - this.min) / this.range;

       // var r = 50;
       // var d = 64; 
        var r = ( (this.percent * this.cirRange) - (this.mPI))//* this.toDeg;

        var sin = Math.sin(r);
        var cos = Math.cos(r);

        var x1 = (25 * sin) + 64;
        var y1 = -(25 * cos) + 64;
        var x2 = (20 * sin) + 64;
        var y2 = -(20 * cos) + 64;

        //this.setSvg( this.c[3], 'cx', x, 1 );
        //this.setSvg( this.c[3], 'cy', y, 1 );

        this.setSvg( this.c[3], 'd', 'M ' + x1 +' ' + y1 + ' L ' + x2 +' ' + y2, 1 );

        //this.setSvg( this.c[3], 'transform', 'rotate('+ r +' '+64+' '+64+')', 1 );

        if( up ) this.send();
        
    },

} );

export { Knob };