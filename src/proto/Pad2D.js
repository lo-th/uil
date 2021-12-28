import { Proto } from '../core/Proto.js';
import { Tools } from '../core/Tools.js';
import { V2 } from '../core/V2.js';

export class Pad2D extends Proto {

    constructor( o = {} ) {

        super( o );

        this.autoWidth = false;
        this.margin = 15;
        this.pos = new V2();

        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;

        this.precision = o.precision === undefined ? 2 : o.precision;

        this.bounds = {};
        this.bounds.x1 = o.x1 || -1;
        this.bounds.x2 = o.x2 || 1;
        this.bounds.y1 = o.y1 || -1;
        this.bounds.y2 = o.y2 || 1;

        this.lerpX = this.lerp( this.margin, this.w - this.margin , this.bounds.x1, this.bounds.x2 );
        this.lerpY = this.lerp( this.margin, this.w - this.margin , this.bounds.y1, this.bounds.y2 );

        this.alerpX = this.lerp( this.bounds.x1, this.bounds.x2, this.margin, this.w - this.margin );
        this.alerpY = this.lerp( this.bounds.y1, this.bounds.y2, this.margin, this.w - this.margin );

        this.value = [];
        let v = ( Array.isArray( o.value ) && o.value.length == 2 ) ? o.value : [ 0, 0 ];
        this.setValue( v );
        
        this.h = o.h || this.w + 10;
        this.top = 0;

        this.c[0].style.width = this.w + 'px';

        // Title
        if( this.c[1] !== undefined ) { // with title

            this.c[1].style.width = this.w + 'px';
            this.c[1].style.textAlign = 'center';
            this.top = 10;
            this.h += 10;

        }

        // Value
        this.c[2] = this.dom( 'div', this.css.txt + 'text-align:center; top:'+ ( this.h - 20 ) + 'px; width:' + this.w + 'px; color:' + this.fontColor );
        this.c[2].textContent = this.value;

        // Pad
        let svg = Tools.dom( 'svg', Tools.css.basic , { viewBox: '0 0 ' + this.w + ' ' + this.w, width: this.w, height: this.w, preserveAspectRatio: 'none' } );
        Tools.dom( 'rect', '', { x: this.margin - 5, 
                                 y: this.margin - 5, 
                                 width: this.w - ( this.margin - 5 ) * 2 , 
                                 height: this.w - ( this.margin -5 ) * 2 ,
                                 rx: 5, ty: 5, 
                                 stroke:'rgba(0,0,0,0.25)', 
                                 'stroke-width':0, 
                                 fill: 'rgba(0,0,0,0.1)' }, svg ); // 0

        Tools.dom( 'rect', '', { x: this.margin, y: this.margin, width: this.w - this.margin * 2, height: this.w - this.margin * 2, stroke:'rgba(0,0,0,0.25)', 'stroke-width':0, fill: 'rgba(0,0,0,0.1)' }, svg ); // 1
        this.c[3] = svg;
        this.setSvg( this.c[3], 'viewBox', '0 0 ' + this.w + ' ' + this.w );
        this.setCss( this.c[3], { left: 0, top: this.top } );

        // Pointer
        Tools.dom( 'line', '', { x1: this.margin, y1: this.w / 2, x2: this.w - this.margin, y2: this.w / 2, stroke:'#1C1C1C', 'stroke-width': 1 }, this.c[3] ); // 2
        Tools.dom( 'line', '', { x1: this.w / 2, y1: this.margin, x2: this.w / 2, y2: this.w - this.margin, stroke:'#1C1C1C', 'stroke-width': 1 }, this.c[3] ); // 3
        Tools.dom( 'circle', '', { cx: this.w / 2, cy: this.w / 2, r: 5, stroke: 'rgba(0,0,0,0.25)', 'stroke-width': 0, fill: this.fontColor }, this.c[3] ); // 4

        this.init();
        
        this.update( false );

    }
    
    testZone ( e ) {
        
        let l = this.local;

        if( l.x === -1 && l.y === -1 ) return '';

        if( ( l.x >= this.margin ) && ( l.x <= this.w - this.margin ) && ( l.y >= this.top + this.margin ) && ( l.y <= this.top + this.w - this.margin ) ) {
            return 'pad';
        }
        
        return '';

    }

    mouseup ( e ) {

        this.isDown = false;
    
    }

    mousedown ( e ) {

        if ( this.testZone(e) === 'pad' ) {
            this.isDown = true;
            this.mousemove( e );
        }

    }

    mousemove ( e ) {

        if( !this.isDown ) return;

        let x = e.clientX - this.zone.x;
        let y = e.clientY - this.zone.y - this.top;

        if( x < this.margin ) x = this.margin;
        if( x > this.w - this.margin ) x = this.w - this.margin;
        if( y < this.margin ) y = this.margin;
        if( y > this.w - this.margin ) y = this.w - this.margin;

        this.setPos( [ x , y ] );
        
        this.update();

    }

    update ( up ) {

        if( up === undefined ) up = true;
        
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

        if( p === undefined ) p = [ this.w / 2, this.w / 2 ];

        this.pos.set( p[0] , p[1] );

        this.value[0] = this.lerpX( p[0] ).toFixed( this.precision );
        this.value[1] = this.lerpY( p[1] ).toFixed( this.precision );

    }

    setValue ( v, up = false ) {

        if( v === undefined ) v = [ 0, 0 ];

        if ( v[0] < this.bounds.x1 ) v[0] = this.bounds.x1;
        if ( v[0] > this.bounds.x2 ) v[0] = this.bounds.x2;
        if ( v[1] < this.bounds.y1 ) v[1] = this.bounds.y1;
        if ( v[1] > this.bounds.y2 ) v[1] = this.bounds.y2;

        this.value[0] = v[0];
        this.value[1] = v[1];

        this.pos.set( this.alerpX( v[0] ) , this.alerpY( v[1] ) );

       if ( up ) this.update();

    }

    lerp( s1, s2, d1, d2, c = true ) {

        let s = ( d2 - d1 ) / ( s2 - s1 );

        return c ? ( v ) => { 
            return ( ( v < s1 ? s1 : v > s2 ? s2 : v ) - s1 ) * s + d1
        } : ( v ) => { 
          return ( v - s1 ) * s + d1
        }

    }

}