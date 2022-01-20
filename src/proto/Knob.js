import { Proto } from '../core/Proto.js';
import { Tools } from '../core/Tools.js';
import { V2 } from '../core/V2.js';

export class Knob extends Proto {

    constructor( o = {} ) {

        super( o );

        this.isCyclic = o.cyclic || false;
        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;

        this.autoWidth = false;

        this.setTypeNumber( o );

        this.minw  = this.w
        this.diam = o.diam || this.w 

        this.mPI = Math.PI * 0.8;
        this.toDeg = 180 / Math.PI;
        this.cirRange = this.mPI * 2;

        this.offset = new V2();

        this.h = o.h || this.w + 10;
        this.top = 0;

        this.c[0].style.width = this.w +'px'
        this.c[0].style.display = 'block'

        if(this.c[1] !== undefined) {

            this.c[1].style.width = '100%'
            this.c[1].style.justifyContent = 'center'
            this.top = 10;
            this.h += 10;

        }

        this.percent = 0;

        this.cmode = 0;
        let cc = this.colors

        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+(this.h-20)+'px; width:100%; color:'+ cc.text );

        this.c[3] = this.getKnob();
        this.setSvg( this.c[3], 'fill', cc.button, 0 )
        this.setSvg( this.c[3], 'stroke', cc.text, 1 )
        this.setSvg( this.c[3], 'stroke', cc.text, 3 )
        this.setSvg( this.c[3], 'd', this.makeGrad(), 3 )
        
        this.setSvg( this.c[3], 'viewBox', '0 0 ' + this.diam + ' ' + this.diam )
        this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top })

        if ( this.model > 0 ) {

            Tools.dom( 'path', '', { d: '', stroke:cc.text, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, this.c[3] ); //4

            if ( this.model == 2) {
            
                Tools.addSVGGlowEffect();
                this.setSvg( this.c[3], 'style', 'filter: url("#UILGlow");', 4 );
            
            }

        }

        this.r = 0;

        this.init();

        this.update();

    }

    mode ( mode ) {

        let cc = this.colors

        if( this.cmode === mode ) return false;

        switch( mode ) {
            case 0: // base
                this.s[2].color = cc.text;
                this.setSvg( this.c[3], 'fill', cc.button, 0);
                //this.setSvg( this.c[3], 'stroke','rgba(255,0,0,0.2)', 2);
                this.setSvg( this.c[3], 'stroke', cc.text, 1 );
            break;
            case 1: // down
                this.s[2].color = cc.textOver;
                this.setSvg( this.c[3], 'fill', cc.select, 0);
                //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.6)', 2);
                this.setSvg( this.c[3], 'stroke', cc.textOver, 1 );
            break;
        }

        this.cmode = mode;
        return true;

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
        else return 'knob';

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        this.isDown = false;
        this.sendEnd()
        return this.mode(0)

    }

    mousedown ( e ) {

        this.isDown = true
        this.old = this.value
        this.oldr = null
        this.mousemove( e )
        return this.mode(1)

    }

    mousemove ( e ) {

        if( !this.isDown ) return;

        let off = this.offset;

        //off.x = this.radius - ( e.clientX - this.zone.x );
        //off.y = this.radius - ( e.clientY - this.zone.y - this.top );

        off.x = (this.w*0.5) - ( e.clientX - this.zone.x );
        off.y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.top );

        this.r = - Math.atan2( off.x, off.y );

        if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

        this.r = this.r > this.mPI ? this.mPI : this.r;
        this.r = this.r < -this.mPI ? -this.mPI : this.r;

        let steps = 1 / this.cirRange;
        let value = (this.r + this.mPI) * steps;

        let n = ( ( this.range * value ) + this.min ) - this.old;

        if(n >= this.step || n <= this.step){ 
            n = Math.floor( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
        }

    }

    wheel ( e ) {

        let name = this.testZone( e );

        if( name === 'knob' ) {
    
            let v = this.value - this.step * e.delta;
    
            if ( v > this.max ) {
                v = this.isCyclic ? this.min : this.max;
            } else if ( v < this.min ) {
                v = this.isCyclic ? this.max : this.min;
            }
    
            this.setValue( v );
            this.old = v;
            this.update( true );

            return true;
    
        }
        return false;

    }

    makeGrad () {

        let d = '', step, range, a, x, y, x2, y2, r = 64;
        let startangle = Math.PI + this.mPI;
        let endangle = Math.PI - this.mPI;
        //let step = this.step>5 ? this.step : 1;

        if(this.step>5){
            range =  this.range / this.step;
            step = ( startangle - endangle ) / range;
        } else {
            step = (( startangle - endangle ) / r)*2;
            range = r*0.5;
        }

        for ( let i = 0; i <= range; ++i ) {

            a = startangle - ( step * i );
            x = r + Math.sin( a ) * ( r - 20 );
            y = r + Math.cos( a ) * ( r - 20 );
            x2 = r + Math.sin( a ) * ( r - 24 );
            y2 = r + Math.cos( a ) * ( r - 24 );
            d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

        }

        return d;

    }

    update ( up ) {

        this.c[2].textContent = this.value;
        this.percent = (this.value - this.min) / this.range;

        let sa = Math.PI + this.mPI;
        let ea = ( ( this.percent * this.cirRange ) - ( this.mPI ) );

        let sin = Math.sin( ea );
        let cos = Math.cos( ea );

        let x1 = ( 25 * sin ) + 64;
        let y1 = -( 25 * cos ) + 64;
        let x2 = ( 20 * sin ) + 64;
        let y2 = -( 20 * cos ) + 64;

        this.setSvg( this.c[3], 'd', 'M ' + x1 +' ' + y1 + ' L ' + x2 +' ' + y2, 1 );
        
        if ( this.model > 0 ) {

            let x1 = 36 * Math.sin( sa ) + 64;
            let y1 = 36 * Math.cos( sa ) + 64;
            let x2 = 36 * sin + 64;
            let y2 = -36 * cos + 64;
            let big = ea <= Math.PI - this.mPI ? 0 : 1;
            this.setSvg( this.c[3], 'd', 'M ' + x1 + ',' + y1 + ' A ' + 36 + ',' + 36 + ' 1 ' + big + ' 1 ' + x2 + ',' + y2, 4 );

            let color = Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( this.colors.text, -0.75) ), Tools.unpack( this.colors.text ), this.percent ) );
            this.setSvg( this.c[3], 'stroke', color, 4 );
        
        }

        if( up ) this.send();
        
    }

}