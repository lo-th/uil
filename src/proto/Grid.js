import { Proto } from '../core/Proto';

export class Grid extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = false;
        this.values = o.values || [];

        if( typeof this.values === 'string' ) this.values = [ this.values ];

        //this.selected = null;
        this.isDown = false;

        this.buttonColor = o.bColor || this.colors.button;
        this.buttonOver = o.bOver || this.colors.over;
        this.buttonDown = o.bDown || this.colors.select;

        this.spaces = o.spaces || [10,3];
        this.bsize = o.bsize || [100,20];

        this.bsizeMax = this.bsize[0];

        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];
        this.grid = [ 2, Math.round( this.lng * 0.5 ) ];
        this.h = this.grid[1] * ( this.bsize[1] + this.spaces[1] ) + this.spaces[1];

        this.c[1].textContent = '';

        this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; top:'+(this.spaces[1]-2)+'px; height:auto; border-collapse:separate; border:none; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1]-2)+'px;' );

        let n = 0, b, mid, td, tr;

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

                    b = document.createElement( 'div' );
                    b.style.cssText = this.css.txt + this.css.button + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; border:'+this.colors.buttonBorder+'; left:auto; right:auto; background:'+this.buttonColor+';  border-radius:'+this.radius+'px;';
                    b.innerHTML = this.values[n];
                    td.appendChild( b );

                    this.buttons.push(b);
                    this.stat.push(1);

                } else {

                    b = document.createElement( 'div' );
                    b.style.cssText = this.css.txt + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; text-align:center;  left:auto; right:auto; background:none;';
                    td.appendChild( b );

                }

                if(j===0) b.style.cssText += 'float:right;';
                else b.style.cssText += 'float:left;';
            
                n++;

            }
        }

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return -1;
        
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
    
        if( this.isDown ){
            this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

    	let id = this.testZone( e );

        if( id < 0 ) return false;

    	this.isDown = true;
        this.value = this.values[id];
        this.send();
    	return this.mousemove( e );

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

    modes ( n, id ) {

        let v, r = false;

        for( let i = 0; i < this.lng; i++ ){

            if( i === id ) v = this.mode( n, i );
            else v = this.mode( 1, i );

            if(v) r = true;

        }

        return r;

    }

    mode ( n, id ) {

        let change = false;

        let i = id;

        if( this.stat[i] !== n ){
        
            switch( n ){

                case 1: this.stat[i] = 1; this.buttons[ i ].style.color = this.fontColor;  this.buttons[ i ].style.background = this.buttonColor; break;
                case 2: this.stat[i] = 2; this.buttons[ i ].style.color = this.fontSelect; this.buttons[ i ].style.background = this.buttonOver; break;
                case 3: this.stat[i] = 3; this.buttons[ i ].style.color = this.fontSelect; this.buttons[ i ].style.background = this.buttonDown; break;

            }

            change = true;

        }
        

        return change;

    }

    // ----------------------

    reset () {

        this.cursor();
        return this.modes( 1 , 0 );
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