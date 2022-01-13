import { Proto } from '../core/Proto.js';
import { Tools } from '../core/Tools.js';
import { V2 } from '../core/V2.js';

export class Pad2D extends Proto {

    constructor( o = {} ) {

        super( o );

        this.autoWidth = false;
        this.minw  = this.w
        this.diam = o.diam || this.w 

        //this.margin = 15;
        this.pos = new V2(0,0);
        this.maxPos = 90

        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;

        this.min = o.min === undefined ? -1 : o.min;
        this.max = o.max === undefined ? 1 : o.max;

        this.range = (this.max - this.min)*0.5;  

        this.cmode = 0;


        //console.log(this.range)



        this.precision = o.precision === undefined ? 2 : o.precision;

        /*this.bounds = {};
        this.bounds.x1 = o.x1 || -1;
        this.bounds.x2 = o.x2 || 1;
        this.bounds.y1 = o.y1 || -1;
        this.bounds.y2 = o.y2 || 1;

        this.lerpX = this.lerp( this.margin, this.w - this.margin , this.bounds.x1, this.bounds.x2 );
        this.lerpY = this.lerp( this.margin, this.w - this.margin , this.bounds.y1, this.bounds.y2 );

        this.alerpX = this.lerp( this.bounds.x1, this.bounds.x2, this.margin, this.w - this.margin );
        this.alerpY = this.lerp( this.bounds.y1, this.bounds.y2, this.margin, this.w - this.margin );*/

        this.value = ( Array.isArray( o.value ) && o.value.length == 2 ) ? o.value : [ 0, 0 ];
        
        
        this.h = o.h || this.w + 10;
        this.top = 0;

        this.c[0].style.width = this.w + 'px';

        // Title
        if( this.c[1] !== undefined ) { // with title

            this.c[1].style.width = '100%';
            this.c[1].style.justifyContent = 'center';
            this.top = 10;
            this.h += 10;

        }

        let cc = this.colors


        // Value
        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+ ( this.h - 20 ) + 'px; width:100%; color:' + cc.text );
        this.c[2].textContent = this.value;

        // Pad

        let pad = this.getPad2d()

        this.setSvg( pad, 'fill', cc.back, 0 )
        this.setSvg( pad, 'fill', cc.button, 1 )
        this.setSvg( pad, 'stroke', cc.back, 2 )
        this.setSvg( pad, 'stroke', cc.back, 3 )
        this.setSvg( pad, 'stroke', cc.text, 4 )

        this.setSvg( pad, 'viewBox', '0 0 '+this.diam+' '+this.diam )
        this.setCss( pad, { width:this.diam, height:this.diam, left:0, top:this.top })

        this.c[3] = pad

        this.init()
        this.setValue()

    }
    
    testZone ( e ) {
        
        let l = this.local;

        if( l.x === -1 && l.y === -1 ) return '';

        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
        else return 'pad';

        /*if( ( l.x >= this.margin ) && ( l.x <= this.w - this.margin ) && ( l.y >= this.top + this.margin ) && ( l.y <= this.top + this.w - this.margin ) ) {
            return 'pad';
        }*/
        
        //return '';

    }

    mouseup ( e ) {

        this.isDown = false;
        return this.mode(0);
    
    }

    mousedown ( e ) {

        if ( this.testZone(e) === 'pad' ) {
            this.isDown = true;
            this.mousemove( e );
            return this.mode(1);
        }

    }

    mousemove ( e ) {

        if( !this.isDown ) return;

        let x = (this.w*0.5) - ( e.clientX - this.zone.x )
        let y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.top )
        let r = 256 / this.diam

        x = -(x*r)
        y = -(y*r)

        x = Tools.clamp( x, -this.maxPos, this.maxPos )
        y = Tools.clamp( y, -this.maxPos, this.maxPos )

        //let x = e.clientX - this.zone.x;
        //let y = e.clientY - this.zone.y - this.top;

        /*if( x < this.margin ) x = this.margin;
        if( x > this.w - this.margin ) x = this.w - this.margin;
        if( y < this.margin ) y = this.margin;
        if( y > this.w - this.margin ) y = this.w - this.margin;*/

        //console.log(x,y)

        this.setPos( [ x , y ] );
        
        this.update( true );

    }

    mode ( mode ) {

        if( this.cmode === mode ) return false;

        let cc = this.colors

        switch( mode ){
            case 0: // base

                this.s[2].color = cc.text;
                this.setSvg( this.c[3], 'fill', cc.back, 0)
                this.setSvg( this.c[3], 'fill', cc.button, 1)
                this.setSvg( this.c[3], 'stroke', cc.back, 2)
                this.setSvg( this.c[3], 'stroke', cc.back, 3)
                this.setSvg( this.c[3], 'stroke', cc.text, 4 )
                
            break;
            case 1: // down

                this.s[2].color = cc.textSelect;
                this.setSvg( this.c[3], 'fill', cc.backoff, 0)
                this.setSvg( this.c[3], 'fill', cc.overoff, 1)
                this.setSvg( this.c[3], 'stroke', cc.backoff, 2)
                this.setSvg( this.c[3], 'stroke', cc.backoff, 3)
                this.setSvg( this.c[3], 'stroke', cc.textSelect, 4 )
                
            break;
        }

        this.cmode = mode;
        return true;



    }

    update ( up ) {

        //if( up === undefined ) up = true;
        
        this.c[2].textContent = this.value;

        this.updateSVG();

        if( up ) this.send();

    }

    updateSVG() {

        if ( this.model == 1 ) {

            this.setSvg( this.c[3], 'y1', this.pos.y, 2 );
            this.setSvg( this.c[3], 'y2', this.pos.y, 2 );

            this.setSvg( this.c[3], 'x1', this.pos.x, 3 );
            this.setSvg( this.c[3], 'x2', this.pos.x, 3 );

        }

        this.setSvg( this.c[3], 'cx', this.pos.x, 4 );
        this.setSvg( this.c[3], 'cy', this.pos.y, 4 );

    }

    setPos ( p ) {

        //if( p === undefined ) p = [ this.w / 2, this.w / 2 ];

        this.pos.set( p[0]+128 , p[1]+128 );

        let r = 1/this.maxPos

        this.value[0] = ((p[0]*r)*this.range).toFixed( this.precision );
        this.value[1] = ((p[1]*r)*this.range).toFixed( this.precision );

    }

    setValue ( v, up = false ) {

        if( v === undefined ) v = this.value;

        /*if ( v[0] < this.bounds.x1 ) v[0] = this.bounds.x1;
        if ( v[0] > this.bounds.x2 ) v[0] = this.bounds.x2;
        if ( v[1] < this.bounds.y1 ) v[1] = this.bounds.y1;
        if ( v[1] > this.bounds.y2 ) v[1] = this.bounds.y2;*/

        this.value[0] = Math.min( this.max, Math.max( this.min, v[0] ) ).toFixed( this.precision ) * 1;
        this.value[1] = Math.min( this.max, Math.max( this.min, v[1] ) ).toFixed( this.precision ) * 1;

        this.pos.set( ((this.value[0]/this.range)*this.maxPos)+128  , ((this.value[1]/this.range)*this.maxPos)+128 )

        //console.log(this.pos)

        this.update( up );

    }

    /*lerp( s1, s2, d1, d2, c = true ) {

        let s = ( d2 - d1 ) / ( s2 - s1 );

        return c ? ( v ) => { 
            return ( ( v < s1 ? s1 : v > s2 ? s2 : v ) - s1 ) * s + d1
        } : ( v ) => { 
          return ( v - s1 ) * s + d1
        }

    }*/

}