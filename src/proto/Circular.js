import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function Circular ( o ) {

    Proto.call( this, o );

    //this.type = 'circular';
    this.autoWidth = false;

    this.buttonColor = Tools.colors.button;

    this.setTypeNumber( o );

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

    this.twoPi = Math.PI * 2;

    this.top = 0;

    this.c[0].style.width = this.width +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.width +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.percent = 0;

    this.c[2] = Tools.dom( 'div', Tools.css.txtnumber + 'text-align:center; top:'+(this.height+24)+'px; width:'+this.width+'px; color:'+ this.fontColor );
    this.c[3] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = Tools.dom( 'path', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { d:this.makePath(), fill:this.fontColor });
    this.c[5] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius, r:this.radius*0.5, fill:this.buttonColor, 'stroke-width':1, stroke:Tools.colors.stroke });

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    this.update();

};

Circular.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Circular,

    handleEvent: function ( e ) {

        e.preventDefault();

        switch( e.type ) {
            case 'mouseover': this.over( e ); break;
            case 'mousedown': this.down( e ); break;
            case 'mouseout':  this.out( e );  break;

            case 'mouseup':   this.up( e );   break;
            case 'mousemove': this.move( e ); break;
        }

    },

    mode: function ( mode ) {

        switch(mode){
            case 0: // base
                this.s[2].color = this.fontColor;
                Tools.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
                Tools.setSvg( this.c[4], 'fill', this.fontColor );
            break;
            case 1: // over
                this.s[2].color = this.colorPlus;
                Tools.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
                Tools.setSvg( this.c[4], 'fill', this.colorPlus );
            break;
        }

    },

    // ACTION

    over: function ( e ) {

        this.isOver = true;
        this.mode(1);

    },

    out: function ( e ) {

        this.isOver = false;
        if(this.isDown) return;
        this.mode(0);

    },

    up: function ( e ) {

        this.isDown = false;
        document.removeEventListener( 'mouseup', this, false );
        document.removeEventListener( 'mousemove', this, false );

        if(this.isOver) this.mode(1);
        else this.mode(0);

        this.sendEnd();

    },

    down: function ( e ) {

        this.isDown = true;
        document.addEventListener( 'mouseup', this, false );
        document.addEventListener( 'mousemove', this, false );

        this.rect = this.c[3].getBoundingClientRect();
        this.old = this.value;
        this.oldr = null;
        this.move( e );

    },

    move: function ( e ) {

        if( !this.isDown ) return;

        var x = this.radius - (e.clientX - this.rect.left);
        var y = this.radius - (e.clientY - this.rect.top);

        this.r = Math.atan2( y, x ) - (Math.PI * 0.5);
        this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

        if( this.oldr !== null ){ 

            var dif = this.r - this.oldr;
            this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

            if(dif > 6) this.r = 0;
            if(dif < -6) this.r = this.twoPi;

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

        var r = this.radius;
        //var start = 0;
        var end = this.percent * this.twoPi - 0.001;
        //var x1 = r + r * Math.sin(start);
        //var y1 = r - r * Math.cos(start);
        var x2 = r + r * Math.sin(end);
        var y2 = r - r * Math.cos(end);
        //var big = end - start > Math.PI ? 1 : 0;
        var big = end > Math.PI ? 1 : 0;
        return "M " + r + "," + r + " L " + r + "," + 0 + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2 + " Z";

    },

    update: function ( up ) {

        this.c[2].textContent = this.value;
        this.percent = ( this.value - this.min ) / this.range;
        Tools.setSvg( this.c[4], 'd', this.makePath() );
        if( up ) this.send();
        
    },

} );

export { Circular };