import { Proto } from '../core/Proto.js';
import { Roots } from '../core/Roots.js';

export class Slide extends Proto {

    constructor( o = {} ) {

        super( o );

        this.setTypeNumber( o );

        this.model = o.stype!== undefined ? o.stype : 1;
        if( o.mode !== undefined ) this.model = o.mode;

        this.isDown = false;
        this.isOver = false;
        this.allway = o.allway || false;

        this.editable = o.editable !== undefined ? o.editable : false;
        this.haveInput = this.editable;

        this.autoValue = true
        if( o.autoValue!==undefined ) this.autoValue = false

        this.isDeg = o.isDeg || false;
        this.isCyclic = o.cyclic || false;
        this.isTime = o.isTime || false;

        this.firstImput = false;
        this.cmode = 0;

        let cc = this.colors;

        this.c[2] = this.dom( 'div', this.css.txtselect + 'border:none; background:none; width:47px; color:'+ cc.text +';' );
        this.c[3] = this.dom( 'div', this.css.basic + ' top:0; height:'+this.h+'px;' );
        this.c[4] = this.dom( 'div', this.css.basic + 'background:'+cc.back+'; top:2px; height:'+(this.h-4)+'px;' );
        this.c[5] = this.dom( 'div', this.css.basic + 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + cc.text +';' );

        this.c[2].isNum = true;
        this.c[2].style.height = (this.h-2) + 'px';
        this.c[2].style.lineHeight = (this.h-10) + 'px';

        if(this.editable) this.addInput( this.c[2] );

        if ( this.model > 0 ) {

            let r1 = 4, h1 = 3, h2 = 6, ww = this.h * 0.5, ra = '100%';

            if ( this.model === 2 ) {
                r1 = 0;
                ra = '0px';
                ww = ( this.h - 6 ) * 0.5;
            }

            this.thumbSize = ww;

            if ( this.model === 3 ) this.c[ 5 ].style.visibility = 'hidden';

            this.c[ 4 ].style.borderRadius = r1 + 'px';
            this.c[ 4 ].style.height = h2 + 'px';
            this.c[ 4 ].style.top = ( this.h * 0.5 ) - h1 + 'px';

            this.c[ 5 ].style.borderRadius = ( r1 * 0.5 ) + 'px';
            this.c[ 5 ].style.height = h1 + 'px';
            this.c[ 5 ].style.top = ( this.h * 0.5 ) - ( h1 * 0.5 ) + 'px';

            // Sans margin-left, positionné en (0,0) et déplacé par le GPU
            this.c[ 6 ] = this.dom( 'div', this.css.basic + `border-radius:${ra}; background:${cc.text}; left:0px; top:0px; height:${ww}px; width:${ww}px; will-change:transform;` );

        }

        this.init();

    }

    //----> ZONE

    testZone ( e ) {

        let l = this.local;
        if ( l.x === -1 && l.y === -1 ) return '';

        const pad = this.model > 0 ? this.thumbSize * 0.5 : 0;
        if ( l.x >= this.sa - pad && l.x <= this.txl + pad ) return 'scroll';
        if ( l.x > this.txl + pad ) return 'text';
        return '';

    }

    //----> EVENTS

    mousedown ( e ) {

        let name = this.testZone( e );
        if ( !name ) return false;

        if ( !this.isDown ) {
            this.isDown = true;
            if ( name === 'scroll' ) {
                this.isScroll = true; 
                this.old = this.value;
            } else if ( name === 'text' && this.editable ) {
                this.isScroll = false;
                this.c[2].textContent = this.value;
                this.setInput( this.c[2] );
            }
            return this.mousemove( e );
        }
        return false;

    }

    mouseup ( e ) {

        if ( this.isDown ) {
            this.isDown = false;
            if ( this.isScroll ) {
                this.isScroll = false;
                this.sendEnd();
                return false;
            }
            return this.mousemove( e );
        }
        return false;
    }

    mousemove ( e ) {

        let nup = false;

        if ( this.isScroll && this.isDown ) {
            // Le centre de la piste utile commence à (this.zone.x + this.sa + 3)
            const mouseX = e.clientX - ( this.zone.x + this.sa + 3 );
            const rawPct = Math.max( 0, Math.min( 1, mouseX / this.ww ) );
            const rawVal = rawPct * this.range + this.min;
            const nv = this.numValue( Math.round( rawVal / this.step ) * this.step );

            if ( nv !== this.value ) {
                this.value = nv;
                this.update( true );
                nup = true;
            }
            return nup;
        }

        let name = this.testZone( e );

        if ( name === 'text' && this.editable ) {
            this.cursor( 'text' );
        } else if ( name === 'scroll' ) {
            if ( this.mode( 1 ) ) nup = true;
            this.cursor( 'w-resize' );
        } else {
            if ( this.mode( 0 ) ) nup = true;
            this.cursor();
        }

        if ( this.editable && !this.isScroll ) {
            let x = 0;
            if ( this.isDown ) {
                const idxText = 2;
                const el = this.c[ idxText ];
                const full = Roots.textWidth( el.textContent );
                const elW = el.clientWidth || ( this.sc - 6 );
                const left = elW - 5 - full;
                x = ( e.clientX - this.zone.x - ( this.txl + 4 ) ) - left;
            }
            return this.upInput( x, this.isDown );
        }

        return nup;

    }

    //----> ACTION

    formatOutput(){

        let v = this.value;
        if(this.isDeg) v+='°'
        if(this.isTime){

            const heures = Math.floor(this.value);
            const minutes = Math.round((this.value - heures) * 60);

            if(minutes === 60) { v = `${heures + 1}h00`; }
            else {
                const minutesFormatees = minutes < 10 ? '0' + minutes : minutes;
                v = `${heures}h${minutesFormatees}`;
            }

        }

        return v 

    }

    validate ( force ) {

        if ( this.allway ) force = true;
        let n = this.c[2].textContent;
        if ( !isNaN( n ) && n !== '' ) {
            this.value = this.numValue( n );
            this.update( force );
        } else if ( force && this.autoValue ) {
            this.c[2].textContent = this.formatOutput();
        }

    }

    reset () {

        this.isDown = false;
        this.mode(0);

    }

    mode ( mode ) {

        if ( this.cmode === mode ) return false;
        this.cmode = mode;
        let s = this.s, cc = this.colors;
        const isOver = mode === 1;

        s[2].color = isOver ? cc.textOver : cc.text;
        s[4].background = cc.back;
        s[5].background = isOver ? cc.textOver : cc.text;
        if ( this.model !== 0 ) s[6].background = isOver ? cc.textOver : cc.text;
        return true;

    }

    update ( up ) {

        const pct = this.range > 0 ? ( this.value - this.min ) / this.range : 0;
        const ww = this.ww * pct;

        if ( this.model !== 3 ) this.s[ 5 ].width = ww + 'px';

        if ( this.s[ 6 ] ) {
            // Centre exact sur (this.sa + 3 + ww) horizontalement et (this.h * 0.5) verticalement
            const x = ( this.sa + 3 + ww ) - ( this.thumbSize * 0.5 );
            const y = ( this.h - this.thumbSize ) * 0.5;
            this.s[ 6 ].transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        if ( !this.isEdit && this.autoValue ) this.c[ 2 ].textContent = this.formatOutput();

        if ( up ) this.send();

    }

    //----> REZISE

    rSize () {

        super.rSize();

        let w = this.sb - this.sc;
        this.ww = w - 6;

        let tx = this.sc;
        if(this.isUI || !this.simple) tx = this.sc+10;
        this.txl = this.w - tx + 2;

        const s = this.s;

        s[2].width = (this.sc -6 )+ 'px';
        s[2].left = (this.txl +4) + 'px';
        //s[2].top = ty + 'px';
        s[3].left = this.sa + 'px';
        s[3].width = w + 'px';
        s[4].left = this.sa + 'px';
        s[4].width = w + 'px';
        s[5].left = (this.sa + 3) + 'px';

        this.update();

    }

    //----> INPUT

    select ( c, e, w, t, full ) {
        
        if ( !this.editable ) return;
        const cc = this.colors;
        const pad = 5;
        const el = this.c[ 2 ];
        const st = this.s[ 2 ];

        const elW = el.clientWidth || ( this.sc - 6 );
        const left = elW - pad - ( full || 0 );
        const start = left + e;
        const end = start + w;
        const cur = left + c;

        st.background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;

    }

    unselect () {

        if ( !this.s ) return;
        this.s[2].background = 'none';
        if ( this.autoValue ) this.c[2].textContent = this.formatOutput();

    }

}