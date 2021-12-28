import { Proto } from '../core/Proto.js';

export class Selector extends Proto {

    constructor( o = {} ) {

        super( o );

        this.values = o.values;
        if(typeof this.values === 'string' ) this.values = [ this.values ];

        this.value = o.value || null;//this.values[0];

        this.isSelectable = true;
        if( o.selectable!== undefined ) this.isSelectable = o.selectable



        //this.selected = null;
        this.isDown = false;

        this.buttonColor = o.bColor || this.colors.button;
        this.buttonOver = o.bOver || this.colors.over;
        this.buttonDown = o.bDown || this.colors.select;

        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];

        let sel;

        for(let i = 0; i < this.lng; i++){

            sel = false;
            if( this.values[i] === this.value && this.isSelectable ) sel = true;

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:'+this.radius+'px;' );
            this.c[i+2].style.background = sel ? this.buttonDown : this.buttonColor;
            this.c[i+2].style.color = sel ? this.fontSelect : this.fontColor;
            this.c[i+2].innerHTML = this.values[i];
            
            this.stat[i] = sel ? 3:1;
        }

        this.init();
     
    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let i = this.lng;
        let t = this.tmp;

        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i;
        }

        return -1;

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            //this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

    	//let name = this.testZone( e );

       // if( !name ) return false;

        let id = this.testZone( e );

        if( id < 0 ) return false;

    	this.isDown = true;
        //this.value = this.values[ name-2 ];
        this.value = this.values[ id ];
        this.send();
    	return this.mousemove( e );
 
        // true;

    }

    mousemove ( e ) {

        let up = false;
        let id = this.testZone( e );

        if( id !== -1 ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, id );
        } else {
        	up = this.reset();
        }

        return up;

    }

    // ----------------------
    //   MODE
    // ----------------------

    modes ( n, id ) {

        let v, r = false;

        let i = this.lng;
        while(i--){

            if( i === id ) v = this.mode( n, i );
            else {
                if( this.isSelectable ){
                    if( this.values[ i ] === this.value ) v = this.mode( 3, i );
                    else v = this.mode( 1, i );
                }
                else v = this.mode( 1, i );
            }

            if( v ) r = true;

        }

        return r;

    }

    mode ( n, id ) {

        let change = false;
        let i = id+2;

        if( this.stat[id] !== n ){

            switch( n ){

                case 1: this.stat[id] = 1; this.s[ i ].color = this.fontColor;  this.s[ i ].background = this.buttonColor; break;
                case 2: this.stat[id] = 2; this.s[ i ].color = this.fontSelect; this.s[ i ].background = this.buttonOver; break;
                case 3: this.stat[id] = 3; this.s[ i ].color = this.fontSelect; this.s[ i ].background = this.buttonDown; break;

            }

            change = true;

        }
        
        return change;

    }

    // ----------------------

    reset () {

        this.cursor();
        return this.modes( 1 , -1 );

    }

    label ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

    }

    icon ( string, y, n ) {

        n = n || 2;
        this.s[n].padding = ( y || 0 ) +'px 0px';
        this.c[n].innerHTML = string;

    }

    rSize () {

        super.rSize();;

        let s = this.s;
        let w = this.sb;
        let d = this.sa;

        let i = this.lng;
        let dc =  3;
        let size = Math.floor( ( w-(dc*(i-1)) ) / i );

        while(i--){

        	this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
            s[i+2].left = this.tmp[i][0] + 'px';
            s[i+2].width = this.tmp[i][1] + 'px';

        }

    }

}