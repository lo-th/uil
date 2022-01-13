import { Proto } from '../core/Proto.js';
import { Tools } from '../core/Tools.js';
import { V2 } from '../core/V2.js';

export class Circular extends Proto {

    constructor( o = {} ) {

        super( o )

        this.isCyclic = o.cyclic || false
        this.model = o.stype || 0
        if( o.mode !== undefined ) this.model = o.mode

        this.autoWidth = false
        this.minw = this.w
        this.diam = o.diam || this.w 

        this.setTypeNumber( o )

        this.twoPi = Tools.TwoPI
        this.pi90 = Tools.pi90

        this.offset = new V2()

        this.h = o.h || this.w + 10
        this.top = 0

        this.c[0].style.width = this.w +'px'

        if(this.c[1] !== undefined) {

            this.c[1].style.width = '100%'
            this.c[1].style.justifyContent = 'center'
            this.top = 10
            this.h += 10

        }



        this.percent = 0
        this.cmode = 0
        let cc = this.colors

        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+(this.h-20)+'px; width:100%; color:'+ cc.text )

        // svg
        
        this.c[3] = this.getCircular()

        this.setSvg( this.c[3], 'stroke', cc.back, 0 )
        this.setSvg( this.c[3], 'd', this.makePath(), 1 )
        this.setSvg( this.c[3], 'stroke', cc.text, 1 )

        this.setSvg( this.c[3], 'viewBox', '0 0 '+this.diam+' '+this.diam )
        this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top })

        this.init()
        this.update()

    }

    mode ( mode ) {

        if( this.cmode === mode ) return false;

        let cc = this.colors
        let color

        switch( mode ){
            case 0: // base

                this.s[2].color = cc.text;
                this.setSvg( this.c[3], 'stroke', cc.back, 0);
                color = this.model > 0 ? Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( cc.text, -0.75) ), Tools.unpack( cc.text ), this.percent ) ) : cc.text;
                this.setSvg( this.c[3], 'stroke', color, 1 );
                
            break;
            case 1: // down

                this.s[2].color = cc.textOver;
                this.setSvg( this.c[3], 'stroke', cc.backoff, 0);
                color = this.model > 0 ? Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( cc.text, -0.75) ), Tools.unpack( cc.text ), this.percent ) ) : cc.textOver
                this.setSvg( this.c[3], 'stroke', color, 1 );
                
            break;
        }

        this.cmode = mode;
        return true;

    }

    reset () {

        this.isDown = false;
        
    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        
        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
        else return 'circular';

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        this.isDown = false;
        this.sendEnd();
        return this.mode(0);

    }

    mousedown ( e ) {

        this.isDown = true;
        this.old = this.value;
        this.oldr = null;
        this.mousemove( e );
        return this.mode(1);

    }

    mousemove ( e ) {

        if( !this.isDown ) return;

        //console.log('over')

        let off = this.offset;
        off.x = (this.w*0.5) - ( e.clientX - this.zone.x );
        off.y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.top );

        this.r = off.angle() - this.pi90;
        this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

        if( this.oldr !== null ){ 

            let dif = this.r - this.oldr;
            this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

            if( dif > 6 ) this.r = 0;
            if( dif < -6 ) this.r = this.twoPi;

        }

        let steps = 1 / this.twoPi;
        let value = this.r * steps;

        let n = ( ( this.range * value ) + this.min ) - this.old;

        if(n >= this.step || n <= this.step){ 
            n = ~~ ( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
        }

    }

    wheel ( e ) {

        let name = this.testZone( e );

        if( name === 'circular' ) {
    
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

    // ----------------------

    makePath () {

        let r = 40;
        let d = 24;
        let a = this.percent * this.twoPi - 0.001;
        let x2 = (r + r * Math.sin(a)) + d;
        let y2 = (r - r * Math.cos(a)) + d;
        let big = a > Math.PI ? 1 : 0;
        return "M " + (r+d) + "," + d + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2;

    }

    update ( up ) {

        this.c[2].textContent = this.value;
        this.percent = ( this.value - this.min ) / this.range;

        this.setSvg( this.c[3], 'd', this.makePath(), 1 );

        if ( this.model > 0 ) {

            let cc = this.colors
            let color = Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( cc.text, -0.75) ), Tools.unpack( cc.text ), this.percent ) );
            this.setSvg( this.c[3], 'stroke', color, 1 );
        
        }

        if( up ) this.send();
        
    }

}