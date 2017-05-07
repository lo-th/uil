import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';
import { Circular } from './Circular';

function Knob ( o ) {

    Proto.call( this, o );

    //this.type = 'knob';
    this.autoWidth = false;

    this.buttonColor = Tools.colors.button;

    this.setTypeNumber( o );

    this.mPI = Math.PI * 0.8;
    this.toDeg = 180 / Math.PI;
    this.cirRange = this.mPI * 2;

    this.radius = Math.floor((this.width-20)*0.5);

    /*this.radius = o.radius || 15;
    
    this.width = (this.radius*2)+20;

    if(o.width !== undefined){
        this.width = o.width;
        this.radius = ~~ (this.width-20)*0.5;
    }

    if(o.size !== undefined){
        this.width = o.size;
        this.radius = ~~ (this.width-20)*0.5;
    }*/

    this.w = this.height = this.radius * 2;
    this.h = o.height || (this.height + 40);
    this.top = 0;

    this.c[0].style.width = this.width +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.width +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.percent = 0;

    this.c[2] = Tools.dom( 'div', Tools.css.txtnumber + 'text-align:center; top:'+(this.height+24)+'px; width:'+this.width+'px; color:'+ this.fontColor );

    this.c[3] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;  pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius-4, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius*0.5, r:3, fill:this.fontColor });
    this.c[5] = Tools.dom( 'path', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { d:this.makeGrad(), 'stroke-width':1, stroke:Tools.colors.stroke });
    
    Tools.dom( 'circle', null, { cx:this.radius, cy:this.radius, r:this.radius*0.7, fill:this.buttonColor, 'stroke-width':1, stroke:Tools.colors.stroke }, this.c[3] );

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.r = 0;

    this.init();

    this.update();

};

Knob.prototype = Object.assign( Object.create( Circular.prototype ), {

    constructor: Knob,

    move: function( e ){

        if( !this.isDown ) return;

        var x = this.radius - (e.clientX - this.rect.left);
        var y = this.radius - (e.clientY - this.rect.top);
        this.r = - Math.atan2( x, y );

        if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

        this.r = this.r > this.mPI ? this.mPI : this.r;
        this.r = this.r < -this.mPI ? -this.mPI : this.r;

        var steps = 1 / this.cirRange;
        var value = (this.r + this.mPI) * steps;

        var n = ( ( this.range * value ) + this.min ) - this.old;

        if(n >= this.step || n <= this.step){ 
            n = ~~ ( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
        }

    },

    makeGrad: function () {

        var d = '', step, range, a, x, y, x2, y2, r = this.radius;
        var startangle = Math.PI + this.mPI;
        var endangle = Math.PI - this.mPI;

        if(this.step>5){
            range =  this.range / this.step;
            step = ( startangle - endangle ) / range;
        } else {
            step = ( startangle - endangle ) / r;
            range = r;
        }

        for ( var i = 0; i <= range; ++i ) {

            a = startangle - ( step * i );
            x = r + Math.sin( a ) * r;
            y = r + Math.cos( a ) * r;
            x2 = r + Math.sin( a ) * ( r - 3 );
            y2 = r + Math.cos( a ) * ( r - 3 );
            d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

        }

        return d;

    },

    update: function ( up ) {

        this.c[2].textContent = this.value;
        this.percent = (this.value - this.min) / this.range;

        var r = ( (this.percent * this.cirRange) - (this.mPI)) * this.toDeg;

        Tools.setSvg( this.c[4], 'transform', 'rotate('+ r +' '+this.radius+' '+this.radius+')' );

        if( up ) this.send();
        
    },

} );

export { Knob };