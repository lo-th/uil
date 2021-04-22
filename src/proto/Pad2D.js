import { Proto } from '../core/Proto';
import { Tools } from '../core/Tools';
import { V2 } from '../core/V2';

export class Pad2D extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = [ 0, 0 ];

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
        let w = 128;
        let svg = Tools.dom( 'svg', Tools.css.basic , { viewBox: '0 0 ' + w + ' ' + w, width: w, height: w, preserveAspectRatio: 'none' } );
        Tools.dom( 'rect', '', { x: 14, y: 14, width: 100, height: 100, stroke:'rgba(0,0,0,0.25)', 'stroke-width':1, fill: 'rgba(0,0,0,0.1)' }, svg ); //0
        this.c[3] = svg;
        this.setSvg( this.c[3], 'viewBox', '0 0 ' + this.w + ' ' + this.w );
        this.setCss( this.c[3], { width: this.w, height: this.w, left: 0, top: this.top } );

        this.init();

    }
    
}