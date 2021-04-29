import { Proto } from '../core/Proto';
import { Tools } from '../core/Tools';
import { V2 } from '../core/V2';

export class Pad2D extends Proto {

    constructor( o = {} ) {

        super( o );

        this.autoWidth = false;

        this.value = [ 0, 0 ];
        this.pos = new V2();
        this.bounds = { x1: -180, x2: 180, y1: -180, y2: 180 };
        this.pos.x = this.w / 2;
        this.pos.y = this.w / 2;
        this.margin = 10;

        this.lerpX = this.lerp( this.margin, this.w - this.margin , this.bounds.x1, this.bounds.x2 );
        this.lerpY = this.lerp( this.margin, this.w - this.margin , this.bounds.y1, this.bounds.y2 );

        this.precision = 0;

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
        Tools.dom( 'rect', '', { x: this.margin, y: this.margin, width: this.w - 20, height: this.w - 20, stroke:'rgba(0,0,0,0.25)', 'stroke-width':0, fill: 'rgba(0,0,0,0.1)' }, svg ); // 0
        this.c[3] = svg;
        this.setSvg( this.c[3], 'viewBox', '0 0 ' + this.w + ' ' + this.w );
        this.setCss( this.c[3], { left: 0, top: this.top } );

        // Pointer
        Tools.dom( 'line', '', { x1: this.margin, y1: this.w / 2, x2: this.w - this.margin, y2: this.w / 2, stroke:'rgba(1,1,1,0.25)', 'stroke-width':1 }, this.c[3] ); // 1
        Tools.dom( 'line', '', { x1: this.w / 2, y1: this.margin, x2: this.w / 2, y2: this.w - this.margin, stroke:'rgba(1,1,1,0.25)', 'stroke-width':1 }, this.c[3] ); // 2
        Tools.dom( 'circle', '', { cx: this.w / 2, cy: this.w / 2, r: 5, stroke:'rgba(0,0,0,0.25)', 'stroke-width':0, fill: this.fontColor }, this.c[3] ); // 3

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

        this.pos.x = e.clientX - this.zone.x;
        this.pos.y = e.clientY - this.zone.y - this.top;
        
        this.update();

    }

    update ( up ) {

        if( up === undefined ) up = true;
        
        let x = this.pos.x;
        let y = this.pos.y;

        if( x < this.margin ) x = this.margin;
        if( x > this.w - this.margin ) x = this.w - this.margin;
        if( y < this.margin ) y = this.margin;
        if( y > this.w - this.margin ) y = this.w - this.margin;
   
        this.setValue( [ x , y ] );

        if( up ) this.send();

    }

    updateSVG() {

        let x = this.pos.x;
        let y = this.pos.y;

        this.setSvg( this.c[3], 'y1', y, 1 );
        this.setSvg( this.c[3], 'y2', y, 1 );

        this.setSvg( this.c[3], 'x1', x, 2 );
        this.setSvg( this.c[3], 'x2', x, 2 );

        this.setSvg( this.c[3], 'cx', x, 3 );
        this.setSvg( this.c[3], 'cy', y, 3 );
    }

    setValue ( v ) {

        if( v === undefined ) v = [ 0, 0 ];

        this.pos.set( v[0] , v[1] );

        this.value[0] = this.lerpX( v[0] ).toFixed( this.precision );
        this.value[1] = this.lerpY( v[1] ).toFixed( this.precision );

        this.c[2].textContent = this.value;

        this.updateSVG();

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