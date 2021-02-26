import { Proto } from '../core/Proto';

export class Selector extends Proto {

    constructor( o = {} ) {

        super( o );

        this.values = o.values;
        if(typeof this.values === 'string' ) this.values = [ this.values ];

        this.value = o.value || this.values[0];



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
            if( this.values[i] === this.value ) sel = true;

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+(sel? this.buttonDown : this.buttonColor)+'; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:'+this.radius+'px;' );
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
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i+2;
        }

        return ''

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

    	let name = this.testZone( e );

        if( !name ) return false;

    	this.isDown = true;
        this.value = this.values[ name-2 ];
        this.send();
    	return this.mousemove( e );
 
        // true;

    }

    mousemove ( e ) {

        let up = false;

        let name = this.testZone( e );
        //let sel = false;

        

        //console.log(name)

        if( name !== '' ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, name );
        } else {
        	up = this.reset();
        }

        return up;

    }

    // ----------------------

    modes ( n, name ) {

        let v, r = false;

        for( let i = 0; i < this.lng; i++ ){

            if( i === name-2 && this.values[ i ] !== this.value ) v = this.mode( n, i+2 );
            else{ 

                if( this.values[ i ] === this.value ) v = this.mode( 3, i+2 );
                else v = this.mode( 1, i+2 );

            }

            if(v) r = true;

        }

        return r;

    }

    mode ( n, name ) {

        let change = false;

        let i = name - 2;


        if( this.stat[i] !== n ){

           
        
            switch( n ){

                case 1: this.stat[i] = 1; this.s[ i+2 ].color = this.fontColor;  this.s[ i+2 ].background = this.buttonColor; break;
                case 2: this.stat[i] = 2; this.s[ i+2 ].color = this.fontSelect; this.s[ i+2 ].background = this.buttonOver; break;
                case 3: this.stat[i] = 3; this.s[ i+2 ].color = this.fontSelect; this.s[ i+2 ].background = this.buttonDown; break;

            }

            change = true;

        }
        

        return change;

    }

    // ----------------------

    reset () {

        this.cursor();

        let v, r = false;

        for( let i = 0; i < this.lng; i++ ){

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