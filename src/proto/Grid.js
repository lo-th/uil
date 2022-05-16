import { Proto } from '../core/Proto.js'
import { Button } from './Button.js'

export class Grid extends Proto {

    constructor( o = {} ) {

        super( o );

        this.values = o.values || [];

        if( typeof this.values === 'string' ) this.values = [ this.values ];
        this.lng = this.values.length;

        this.value = o.value || null;


        let cc = this.colors


        this.isSelectable = o.selectable || false
        this.spaces = o.spaces || [cc.sx,cc.sy]
        this.bsize = o.bsize || [90,20];

        if( o.h ) this.bsize[1] = o.h
        this.bsizeMax = this.bsize[0]

        this.tmp = [];
        this.stat = [];
        this.grid = [ 2, Math.round( this.lng * 0.5 ) ];
        this.h = ( this.grid[1] * this.bsize[1] ) + ( (this.grid[1]) * this.spaces[1] ) + 4 - (this.mtop*2) //+ (this.spaces[1] - this.mtop);

        this.c[1].textContent = '';
        //this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; top:'+(this.spaces[1]-2)+'px; height:auto; border-collapse:separate; border:none; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1]-2)+'px;' );
        this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1])+'px; border:none;' );

        let n = 0, b, mid, td, tr, sel;

        this.res = -1
        this.isDown = false
        this.neverlock = true

        this.buttons = []; 
        this.stat = [];
        this.tmpX = [];
        this.tmpY = [];

        for( let i = 0; i < this.grid[1]; i++ ){

            tr = this.c[2].insertRow();
            tr.style.cssText = 'pointer-events:none;';
            for( let j = 0; j < this.grid[0]; j++ ){

                td = tr.insertCell();
                td.style.cssText = 'pointer-events:none;';

                if( this.values[n] ){

                    sel = false;
                    if( this.values[n] === this.value && this.isSelectable ) sel = true;

                    b = document.createElement( 'div' );
                    b.style.cssText = this.css.txt + this.css.button + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; border:'+cc.borderSize+'px solid '+cc.border+'; left:auto; right:auto; border-radius:'+this.radius+'px;';
                    b.style.background = sel ? cc.select : cc.button;
                    b.style.color = sel ? cc.textSelect : cc.text;
                    b.innerHTML = this.values[n];
                    td.appendChild( b );

                    this.buttons.push(b)
                    this.stat.push(1)

                } else {

                    b = document.createElement( 'div' )
                    b.style.cssText = this.css.txt + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; text-align:center; left:auto; right:auto; background:none;'
                    td.appendChild( b )

                }

                if(j===0) b.style.cssText += 'float:right;';
                else b.style.cssText += 'float:left;';
            
                n++;

            }
        }

        //this.s[0].border = 'none'

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return -1;

        l.y += this.mtop
        
        let tx = this.tmpX;
        let ty = this.tmpY;

        let id = -1;
        let c = -1;
        let line = -1;
        let i = this.grid[0];
        while( i-- ){
        	if( l.x > tx[i][0] && l.x < tx[i][1] ) c = i;
        }

        i = this.grid[1];
        while( i-- ){
            if( l.y > ty[i][0] && l.y < ty[i][1] ) line = i;
        }

        if(c!==-1 && line!==-1){
            id = c + (line*2);
            if(id>this.lng-1) id = -1;
        }

        return id;

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        if( !this.isDown ) return false

        this.isDown = false
        if( this.res !== -1 ){
            this.value = this.values[this.res]
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

        let up = false;
        this.res = this.testZone( e )

        if( this.res !== -1 ){
            this.cursor('pointer')
            up = this.modes( this.isDown ? 3 : 2, this.res )
        } else {
        	up = this.reset();
        }

        return up;

    }

    // ----------------------
    //   MODE
    // -----------------------

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

            if( this.mode( n, i ) ) r = true

        }

        return r

    }

    mode ( n, id ) {

        let change = false;
        let cc = this.colors, s = this.buttons
        let i = id

        if( this.stat[id] !== n ){

            this.stat[id] = n;
        
            switch( n ){

                case 1: s[i].style.color = cc.text; s[i].style.background = cc.button; break;
                case 2: s[i].style.color = cc.textOver; s[i].style.background = cc.overoff; break;
                case 3: s[i].style.color = cc.textOver; s[i].style.background = cc.over; break;
                case 4: s[i].style.color = cc.textSelect; s[i].style.background = cc.select; break;

            }

            change = true;

        }

        return change;

    }

    // ----------------------

    reset () {

        this.res = -1
        this.cursor()
        return this.modes()

    }


    label ( string, n ) {

        this.buttons[n].textContent = string;

    }

    icon ( string, y, n ) {

        this.buttons[n].style.padding = ( y || 0 ) +'px 0px';
        this.buttons[n].innerHTML = string;

    }

    testW () {

        let vw = this.spaces[0]*3 + this.bsizeMax*2, rz = false;
        if( vw > this.w ) {
            this.bsize[0] = ( this.w-(this.spaces[0]*3) ) * 0.5;
            rz = true;
        } else {
            if( this.bsize[0] !== this.bsizeMax ) {
                this.bsize[0] = this.bsizeMax;
                rz = true;
            }
        }

        if( !rz ) return;

        let i = this.buttons.length;
        while(i--) this.buttons[i].style.width = this.bsize[0] + 'px';

    }

    rSize () {

        super.rSize();

        this.testW();

        let n = 0, b, mid;

        this.tmpX = [];
        this.tmpY = [];

        for( let j = 0; j < this.grid[0]; j++ ){

            if(j===0){
                mid = ( this.w*0.5 ) - ( this.spaces[0]*0.5 );
                this.tmpX.push( [ mid-this.bsize[0], mid ] );
            } else {
                mid = ( this.w*0.5 ) + ( this.spaces[0]*0.5 );
                this.tmpX.push( [ mid, mid+this.bsize[0] ] );
            }

        }

        mid = this.spaces[1];

        for( let i = 0; i < this.grid[1]; i++ ){

            this.tmpY.push( [ mid, mid + this.bsize[1] ] );
            mid += this.bsize[1] + this.spaces[1];
            
        }

    }

}