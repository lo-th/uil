import { Proto } from '../core/Proto';
import { V2 } from '../core/V2';

function Joystick ( o ) {

    Proto.call( this, o );

    this.autoWidth = false;

    this.value = [0,0];

    this.joyType = 'analogique';
    this.model = o.mode !== undefined ? o.mode : 0;

    this.precision = o.precision || 2;
    this.multiplicator = o.multiplicator || 1;

    this.pos = new V2();
    this.tmp = new V2();

    this.interval = null;

    this.radius = this.w * 0.5;
    this.distance = this.radius*0.25;

    this.h = o.h || this.w + 10;
    this.top = 0;

    this.c[0].style.width = this.w +'px';

    if( this.c[1] !== undefined ) { // with title

        this.c[1].style.width = this.w +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 10;
        this.h += 10;

    }

    this.c[2] = this.dom( 'div', this.css.txt + 'text-align:center; top:'+(this.h-20)+'px; width:'+this.w+'px; color:'+ this.fontColor );
    this.c[2].textContent = this.value;

    this.c[3] = this.getJoystick( this.model );
    this.setSvg( this.c[3], 'viewBox', '0 0 '+this.w+' '+this.w );
    this.setCss( this.c[3], { width:this.w, height:this.w, left:0, top:this.top });


    this.ratio = 128/this.w;

    this.init();

    this.update(false);
    
}

Joystick.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Joystick,

    mode: function ( mode ) {

        switch(mode){
            case 0: // base
                if(this.model===0){
                    this.setSvg( this.c[3], 'fill', 'url(#gradIn)', 4 );
                    this.setSvg( this.c[3], 'stroke', '#000', 4 );
                } else {
                    this.setSvg( this.c[3], 'stroke', 'rgba(100,100,100,0.25)', 2 );
                    //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.1)', 3 );
                    this.setSvg( this.c[3], 'stroke', '#666', 4 );
                    this.setSvg( this.c[3], 'fill', 'none', 4 );
                }
                
            break;
            case 1: // over
                if(this.model===0){
                    this.setSvg( this.c[3], 'fill', 'url(#gradIn2)', 4 );
                    this.setSvg( this.c[3], 'stroke', 'rgba(0,0,0,0)', 4 );
                } else {
                    this.setSvg( this.c[3], 'stroke', 'rgba(48,138,255,0.25)', 2 );
                    //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.3)', 3 );
                    this.setSvg( this.c[3], 'stroke', this.colors.select, 4 );
                    this.setSvg( this.c[3], 'fill', 'rgba(48,138,255,0.25)', 4 );
                }
            break;
            case 2: // edit
            break;

        }
    },

    // ----------------------
    //   EVENTS
    // ----------------------

    addInterval: function (){
        if( this.interval !== null ) this.stopInterval();
        if( this.pos.isZero() ) return;
        this.interval = setInterval( function(){ this.update(); }.bind(this), 10 );

    },

    stopInterval: function (){

        if( this.interval === null ) return;
        clearInterval( this.interval );
        this.interval = null;

    },

    reset: function () {

        this.addInterval();
        this.mode(0);

    },

    mouseup: function ( e ) {

        this.addInterval();
        this.isDown = false;
    
    },

    mousedown: function ( e ) {

        this.isDown = true;
        this.mousemove( e );
        this.mode( 2 );

    },

    mousemove: function ( e ) {

        this.mode(1);

        if( !this.isDown ) return;

        this.tmp.x = this.radius - ( e.clientX - this.zone.x );
        this.tmp.y = this.radius - ( e.clientY - this.zone.y - this.top );

        var distance = this.tmp.length();

        if ( distance > this.distance ) {
            var angle = Math.atan2(this.tmp.x, this.tmp.y);
            this.tmp.x = Math.sin( angle ) * this.distance;
            this.tmp.y = Math.cos( angle ) * this.distance;
        }

        this.pos.copy( this.tmp ).divideScalar( this.distance ).negate();

        this.update();

    },

    setValue: function ( v ) {

        if(v===undefined) v=[0,0];

        this.pos.set( v[0] || 0, v[1]  || 0 );
        this.updateSVG();

    },

    update: function ( up ) {

        if( up === undefined ) up = true;

        if( this.interval !== null ){

            if( !this.isDown ){

                this.pos.lerp( null, 0.3 );

                this.pos.x = Math.abs( this.pos.x ) < 0.01 ? 0 : this.pos.x;
                this.pos.y = Math.abs( this.pos.y ) < 0.01 ? 0 : this.pos.y;

                if( this.isUI && this.main.isCanvas ) this.main.draw();

            }

        }

        this.updateSVG();

        if( up ) this.send();
        

        if( this.pos.isZero() ) this.stopInterval();

    },

    updateSVG: function () {

        var x = this.radius - ( -this.pos.x * this.distance );
        var y = this.radius - ( -this.pos.y * this.distance );

         if(this.model === 0){

            var sx = x + ((this.pos.x)*5) + 5;
            var sy = y + ((this.pos.y)*5) + 10;

            this.setSvg( this.c[3], 'cx', sx*this.ratio, 3 );
            this.setSvg( this.c[3], 'cy', sy*this.ratio, 3 );
        } else {
            this.setSvg( this.c[3], 'cx', x*this.ratio, 3 );
            this.setSvg( this.c[3], 'cy', y*this.ratio, 3 );
        }

        

        this.setSvg( this.c[3], 'cx', x*this.ratio, 4 );
        this.setSvg( this.c[3], 'cy', y*this.ratio, 4 );

        this.value[0] =  ( this.pos.x * this.multiplicator ).toFixed( this.precision ) * 1;
        this.value[1] =  ( this.pos.y * this.multiplicator ).toFixed( this.precision ) * 1;

        this.c[2].textContent = this.value;

    },

    clear: function () {
        
        this.stopInterval()
        Proto.prototype.clear.call( this );

    },

} );

export { Joystick };