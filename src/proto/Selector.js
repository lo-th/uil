import { Proto } from '../core/Proto';

function Selector ( o ) {

    Proto.call( this, o );

    this.values = o.values;
    if(typeof this.values === 'string' ) this.values = [ this.values ];

    this.value = o.value || this.values[0];



    //this.selected = null;
    this.isDown = false;

    this.buttonColor = o.bColor || this.colors.button;

    this.lng = this.values.length;
    this.tmp = [];
    this.stat = [];

    var sel;

    for(var i = 0; i < this.lng; i++){

        sel = false;
        if( this.values[i] === this.value ) sel = true;

        this.c[i+2] = this.dom( 'div', this.css.txt + 'text-align:center; top:1px; background:'+(sel? this.colors.select : this.buttonColor)+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px; line-height:'+(this.h-4)+'px;' );
        this.c[i+2].style.color = sel ? '#FFF' : this.fontColor;
        this.c[i+2].innerHTML = this.values[i];
        //this.c[i+2].name = this.values[i];
        
        this.stat[i] = sel ? 3:1;
    }

    this.init();

}

Selector.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Selector,

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        var i = this.lng;
        var t = this.tmp;
        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i+2;
        }

        return ''

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup: function ( e ) {
    
        if( this.isDown ){
            //this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    },

    mousedown: function ( e ) {

    	var name = this.testZone( e );

        if( !name ) return false;

    	this.isDown = true;
        this.value = this.values[ name-2 ];
        this.send();
    	return this.mousemove( e );
 
        // true;

    },

    mousemove: function ( e ) {

        var up = false;

        var name = this.testZone( e );
        //var sel = false;

        

        //console.log(name)

        if( name !== '' ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, name );
        } else {
        	up = this.reset();
        }

        return up;

    },

    // ----------------------

    modes: function ( n, name ) {

        var v, r = false;

        for( var i = 0; i < this.lng; i++ ){

            if( i === name-2 && this.values[ i ] !== this.value ) v = this.mode( n, i+2 );
            else{ 

                if( this.values[ i ] === this.value ) v = this.mode( 3, i+2 );
                else v = this.mode( 1, i+2 );

            }

            if(v) r = true;

        }

        return r;

    },

    mode: function ( n, name ) {

        var change = false;

        var i = name - 2;


        if( this.stat[i] !== n ){

           
        
            switch( n ){

                case 1: this.stat[i] = 1; this.s[ i+2 ].color = this.fontColor; this.s[ i+2 ].background = this.buttonColor; break;
                case 2: this.stat[i] = 2; this.s[ i+2 ].color = '#FFF';         this.s[ i+2 ].background = this.colors.over; break;
                case 3: this.stat[i] = 3; this.s[ i+2 ].color = '#FFF';         this.s[ i+2 ].background = this.colors.select; break;

            }

            change = true;

        }
        

        return change;

    },

    // ----------------------

    reset: function () {

        this.cursor();

        var v, r = false;

        for( var i = 0; i < this.lng; i++ ){

            if( this.values[ i ] === this.value ) v = this.mode( 3, i+2 );
            else v = this.mode( 1, i+2 );
            if(v) r = true;
        }

        return r;//this.modes( 1 , 2 );

    	/*if( this.selected ){
    		this.s[ this.selected ].color = this.fontColor;
            this.s[ this.selected ].background = this.buttonColor;
            this.selected = null;
            
            return true;
    	}
        return false;*/

    },

    label: function ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

    },

    icon: function ( string, y, n ) {

        n = n || 2;
        this.s[n].padding = ( y || 0 ) +'px 0px';
        this.c[n].innerHTML = string;

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var s = this.s;
        var w = this.sb;
        var d = this.sa;

        var i = this.lng;
        var dc =  3;
        var size = Math.floor( ( w-(dc*(i-1)) ) / i );

        while(i--){

        	this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
            s[i+2].left = this.tmp[i][0] + 'px';
            s[i+2].width = this.tmp[i][1] + 'px';

        }

    }

} );

export { Selector };