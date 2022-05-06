import { Proto } from '../core/Proto.js';

export class Button extends Proto {

    constructor( o = {} ) {

        super( o )

        this.value = o.value || '';

        this.values = o.value || this.txt
        if( o.values ) this.values = o.values

            if( !o.values && !o.value ) this.txt = ''

        

        this.onName = o.onName || null;

        this.on = false;

        // force button width
        this.bw = o.forceWidth || 0
        if(o.bw) this.bw = o.bw
        this.space = o.space || 3

        if( typeof this.values === 'string' ) this.values = [ this.values ];

        this.isDown = false
        this.neverlock = true
        this.res = 0

        this.lng = this.values.length;
        this.tmp = []
        this.stat = []

        let sel, cc = this.colors;

        for( let i = 0; i < this.lng; i++ ){

            sel = false
            if( this.values[i] === this.value && this.isSelectable ) sel = true

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; height:'+(this.h-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; border-radius:'+this.radius+'px;' );
            this.c[i+2].style.background = sel ? cc.select : cc.button
            this.c[i+2].style.color = sel ? cc.textSelect : cc.text
            this.c[i+2].innerHTML = this.values[i];
            this.stat[i] = sel ? 3:1;

        }

        if( !o.value && !o.values ){
            if( this.c[1] !== undefined ) {
                this.c[1].textContent = '';
                //this.txt = ''
            }
        } 
        if( this.txt==='' ) this.p = 0 

        this.init();

    }

    onOff() {

        this.on = !this.on;
        this.label( this.on ? this.onName : this.txt )
        
    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return -1

        let i = this.lng
        let t = this.tmp
        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i
        }

        return -1

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        if( !this.isDown ) return false

        this.isDown = false
        if( this.res !== -1 ){
            if( this.value === this.values[this.res] && this.unselectable ) this.value = ''
            else this.value = this.values[this.res]
            if( this.onName !== null ) this.onOff()
            this.send()
        }

        return this.mousemove( e )

    }

    mousedown ( e ) {

        if( this.isDown ) return false
        this.isDown = true
    	return this.mousemove( e )

    }

    mousemove ( e ) {

        let up = false
        this.res = this.testZone( e )

        if( this.res !== -1 ){
            this.cursor('pointer')
            up = this.modes( this.isDown ? 3 : 2, this.res )
        } else {
        	up = this.reset()
        }

        return up

    }

    // ----------------------

    modes ( N = 1, id = -1 ) {

        let i = this.lng, w, n, r = false

        while( i-- ){

            n = N
            w = this.isSelectable ? this.values[ i ] === this.value : false
            
            if( i === id ){
                if( w && n === 2 ) n = 3 
            } else {
                n = 1
                if( w ) n = 4
            }

            //if( this.mode( n, i ) ) r = true
            r = this.mode( n, i )

        }

        return r

    }

    mode ( n, id ) {

        //if(!this.s) return false
 
        let change = false;
        let cc = this.colors, s = this.s
        let i = id+2

        if( this.stat[id] !== n ){

            this.stat[id] = n;
        
            switch( n ){

                case 1: s[i].color = cc.text; s[i].background = cc.button; break;
                case 2: s[i].color = cc.textOver; s[i].background = cc.overoff; break;
                case 3: s[i].color = cc.textOver; s[i].background = cc.over; break;
                case 4: s[i].color = cc.textSelect; s[i].background = cc.select; break;

            }

            change = true;

        }

        return change

    }

    // ----------------------

    reset () {

        this.res = -1
        this.cursor()
        return this.modes()

    }

    label ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

    }

    icon ( string, y = 0, n = 2 ) {

        //if(y) this.s[n].margin = ( y ) +'px 0px';
        this.s[n].padding = ( y ) +'px 0px';
        this.c[n].innerHTML = string;

        return this

    }

    rSize () {

        super.rSize();

        let s = this.s;
        let w = this.sb;
        let d = this.sa;

        let i = this.lng;
        let sx = this.colors.sx //this.space;
        //let size = Math.floor( ( w-(dc*(i-1)) ) / i );
        let size = ( ( w-(sx*(i-1)) ) / i )

        if( this.bw ){ 
            size = this.bw < size ? this.bw : size
            //d = Math.floor((this.w-( (size * i) + (dc * (i-1)) ))*0.5)
            d = ((this.w-( (size * i) + (sx * (i-1)) ))*0.5)
        }

        while( i-- ){

        	//this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
            this.tmp[i] = [ ( d + ( size * i ) + ( sx * i )), size ];
        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];

            s[i+2].left = this.tmp[i][0] + 'px'
            s[i+2].width = this.tmp[i][1] + 'px'

        }

    }

}