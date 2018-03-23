import { Proto } from '../core/Proto';

function Numeric( o ){

    Proto.call( this, o );

    this.setTypeNumber( o );

    //this.allway = o.allway || false;

    this.isDown = false;

    this.value = [0];
    this.toRad = 1;
    this.isNumber = true;
    this.isAngle = false;
    this.isVector = false;

    if( o.value !== undefined ){
        if(!isNaN(o.value)){ this.value = [o.value];}
        else if(o.value instanceof Array ){ this.value = o.value; this.isNumber=false;}
        else if(o.value instanceof Object ){ 
            this.value = [];
            if(o.value.x) this.value[0] = o.value.x;
            if(o.value.y) this.value[1] = o.value.y;
            if(o.value.z) this.value[2] = o.value.z;
            if(o.value.w) this.value[3] = o.value.w;
            this.isVector = true;
        }
    }

    this.lng = this.value.length;
    this.tmp = [];

    if(o.isAngle){
        this.isAngle = true;
        this.toRad = Math.PI/180;
    }

    this.current = -1;
    this.prev = { x:0, y:0, d:0, v:0 };

    this.cMode = [];
    
    var i = this.lng;
    while(i--){
        if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
        this.c[2+i] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
        if(o.center) this.c[2+i].style.textAlign = 'center';
        this.c[2+i].textContent = this.value[i];
        this.c[2+i].style.color = this.fontColor;
        this.c[2+i].isNum = true;

        this.cMode[i] = 0;

    }

    this.init();
}

Numeric.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Numeric,

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        var i = this.lng;
        var t = this.tmp;
        

        while( i-- ){
            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
        }

        return ''

    },

    mode: function ( n, name ) {

        if( n === this.cMode[name] ) return false;

        var m;

        switch(n){

            case 0: m = this.colors.border; break;
            case 1: m = this.colors.borderOver; break;
            case 2: m = this.colors.borderSelect;  break;

        }

        this.reset();
        this.c[name+2].style.borderColor = m;
        this.cMode[name] = n;

        return true;

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown: function ( e ) {

        //if( this.isSelect ) return;

        var name = this.testZone( e );

        if( name === '' ) return false;


        this.current = name;
        this.isDown = true;

        this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isNumber ? parseFloat(this.value) : parseFloat( this.value[this.current] )  };


        return this.mode( 2, name );

    },

    mouseup: function ( e ) {

        var name = this.testZone( e );
        this.isDown = false;

        if( this.current !== -1 ){ 

            //var tm = this.current;
            var td = this.prev.d;

            this.current = -1;
            this.prev = { x:0, y:0, d:0, v:0 };

            if( !td ){

                this.setInput( this.c[ name+2 ], function(){ this.testValue() }.bind(this) );
                return true;//this.mode( 2, name );

            } else {
                return this.reset();//this.mode( 0, tm );
            }

        }

    },

    mousemove: function ( e ) {

        var nup = false;

        var name = this.testZone( e );

        if( name === '' ){

            nup = this.reset();
            this.cursor();

        } else { 

            nup = this.mode( 1, name );
            this.cursor( this.current !== -1 ? 'move' : 'pointer' );

        }

        

        if( this.current !== -1 ){


            this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );

            var n = this.prev.v + ( this.prev.d * this.step);

            this.value[this.current] = this.numValue(n);
            this.c[2+this.current].textContent = this.value[this.current];

            this.validate();

            this.prev.x = e.clientX;
            this.prev.y = e.clientY;

            nup = true;
        }


        return nup;



    },

    keydown: function ( e ) { return true; },

    // ----------------------

    reset: function () {

        var nup = false;
        this.isDown = false;

        var i = this.lng;
        while(i--){ 
            if(this.cMode[i]!==0){
                this.cMode[i] = 0;
                this.c[2+i].style.borderColor = this.colors.border;
                nup = true;
            }
        }

        return nup;

    },


    setValue: function ( v, n ) {

        n = n || 0;
        this.value[n] = this.numValue( v );
        this.c[2+n].textContent = this.value[n];

    },

    testValue: function () {

        var i = this.lng;
        while(i--){

            if(!isNaN( this.c[2+i].textContent )){ 
                var nx = this.numValue( this.c[2+i].textContent );
                this.c[2+i].textContent = nx;
                this.value[i] = nx;
            } else { // not number
                this.c[2+i].textContent = this.value[i];
            }
        }

        this.validate();

    },

    validate: function () {

        var ar = [];
        var i = this.lng;
        while(i--) ar[i] = this.value[i] * this.toRad;

        if( this.isNumber ) this.send( ar[0] );
        else this.send( ar );

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var w = Math.floor( ( this.sb + 5 ) / this.lng )-5;
        var s = this.s;
        var i = this.lng;
        while(i--){
            this.tmp[i] = [ Math.floor( this.sa + ( w * i )+( 5 * i )), w ];
            this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
            s[2+i].left = this.tmp[i][0] + 'px';
            s[2+i].width = this.tmp[i][1] + 'px';
        }

    }

} );

export { Numeric };