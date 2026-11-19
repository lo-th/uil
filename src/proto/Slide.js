import { Proto } from '../core/Proto.js';
import { Roots } from '../core/Roots.js';

export class Slide extends Proto {

    constructor( o = {} ) {

        super( o );

        this.setTypeNumber( o );


        this.model = o.stype!== undefined ? o.stype : 2;
        if( o.mode !== undefined ) this.model = o.mode;

        //this.defaultBorderColor = this.colors.hide;

        this.isDown = false;
        this.isOver = false;
        this.allway = o.allway || false;

        this.editable = o.editable !== undefined ? o.editable : false;

        this.autoValue = true
        if(o.autoValue!==undefined) this.autoValue = false

        this.isDeg = o.isDeg || false;
        this.isCyclic = o.cyclic || false;
        this.isTime = o.isTime || false;

        this.firstImput = false;
        this.cmode = 0;

        let cc = this.colors

        //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.colors.text );
        //this.c[2] = this.dom( 'div', this.css.txtselect + 'text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.colors.text );
        this.c[2] = this.dom( 'div', this.css.txtselect + 'border:none; background:none; width:47px; color:'+ cc.text +';' );
        //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; color:'+ this.colors.text );
        this.c[3] = this.dom( 'div', this.css.basic + ' top:0; height:'+this.h+'px;' );
        this.c[4] = this.dom( 'div', this.css.basic + 'background:'+cc.back+'; top:2px; height:'+(this.h-4)+'px;' );
        this.c[5] = this.dom( 'div', this.css.basic + 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + cc.text +';' );

        this.c[2].isNum = true;
        //this.c[2].style.height = (this.h-4) + 'px';
        //this.c[2].style.lineHeight = (this.h-8) + 'px';
        this.c[2].style.height = (this.h-2) + 'px';
        this.c[2].style.lineHeight = (this.h-10) + 'px';

        if(this.model !== 0){

            let r1 = 4, h1 = 4, h2 = 8, ww = this.h-6, ra = 16;

            if( this.model === 2 ){
                r1 = 0
                h1 = 2
                h2 = 4
                ra = 2
                ww = (this.h-6)*0.5
            }

            if( this.model === 3 ) this.c[5].style.visibility = 'hidden';

            this.c[4].style.borderRadius = r1 + 'px';
            this.c[4].style.height = h2 + 'px';
            this.c[4].style.top = (this.h*0.5) - h1 + 'px';

            this.c[5].style.borderRadius = (r1*0.5) + 'px';
            this.c[5].style.height = h1 + 'px';
            this.c[5].style.top = (this.h*0.5)-(h1*0.5) + 'px';

            //this.c[6] = this.dom( 'div', this.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+cc.border+'; background:'+cc.button+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );
            //this.c[6] = this.dom( 'div', this.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; background:'+cc.text+'; left:4px; top:3px; height:'+(this.h-6)+'px; width:'+ww+'px;' )
            this.c[6] = this.dom( 'div', this.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; background:'+cc.text+'; left:4px; top:'+((this.h-ww)*0.5)+'px; height:'+ww+'px; width:'+ww+'px;' )
        }

        

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        
        if( l.x >= this.txl ) return 'text';
        else if( l.x >= this.sa ) return 'scroll';
        else return '';

    }

    // ----------------------
    //   EVENTS
    // ----------------------

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
        let name = this.testZone( e );

        if ( name === 'text' && this.editable ) {
            this.cursor('text');
        } else if ( name === 'scroll' ) {
            if ( this.mode(1) ) nup = true;
            this.cursor('w-resize');
        } else {
            if ( this.mode(0) ) nup = true;
            this.cursor();
        }

        if ( this.isScroll && this.isDown ) {
            let n = ((( e.clientX - (this.zone.x + this.sa) - 3 ) / this.ww ) * this.range + this.min ) - this.old;
            if ( n >= this.step || n <= -this.step ) {
                n = Math.floor( n / this.step );
                this.value = this.numValue( this.old + ( n * this.step ) );
                this.update( true );
                this.old = this.value;
            }
            return true;
        }

        if ( this.editable && !this.isScroll ) {
            let x = 0;
            if ( this.isDown ) {
                const el = this.c[ 2 ];
                const full = Roots.hiddenSizer ? Roots.hiddenSizer.clientWidth : 0;
                const left = el.clientWidth - 5 - full;
                x = ( e.clientX - this.zone.x - 3 - ( this.txl + 4 ) ) - left;
            }
            return this.upInput( x, this.isDown );
            /*let x = 0;
            if ( this.isDown ) x = e.clientX - this.zone.x - 3 - ( this.txl + 4 );
            return this.upInput( x, this.isDown );*/
        }

        return nup;
    }

    /*mouseup ( e ) {
        
        if ( this.isDown ) {
            this.isDown = false;
            if ( this.editable && Roots.parent === this ) {
                this.upInput( 0, false );
                return;
            }
            this.sendEnd();
        }
        
    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false;

        if( name === 'scroll' ){ 
            this.isDown = true;
            this.old = this.value;
            this.mousemove( e );
            
        } else if ( name === 'text' && this.editable ) {
            this.isDown = true;
            this.c[2].textContent = this.value; // Affiche la valeur brute sans ° ou h
            this.setInput( this.c[2] );
            return this.mousemove( e );
        }


        return true;

    }

    mousemove ( e ) {

        let nup = false;

        let name = this.testZone( e );

        if ( name === 'text' && this.editable ) {
            this.cursor('text');
            if ( this.isDown ) {
                let x = e.clientX - ( this.zone.x + this.txl + 4 );
                return this.upInput( x, true );
            }
            return false;
        }

        if( name === 'scroll' ) {
            
            if ( this.mode(1) ) nup = true;
            this.cursor('w-resize');

        } else {
            if ( this.mode(0) ) nup = true;
            this.cursor();
        }

        if( this.isDown ){

            let n = ((( e.clientX - (this.zone.x+this.sa) - 3 ) / this.ww ) * this.range + this.min ) - this.old;
            if(n >= this.step || n <= this.step){ 
                n = Math.floor( n / this.step );
                this.value = this.numValue( this.old + ( n * this.step ) );
                this.update( true );
                this.old = this.value;
            }
            nup = true;
        }

        return nup;

    }

    wheel ( e ) {

        let name = this.testZone( e );
    
        if( name === 'scroll' ) {
    
            let v = this.value - this.step * e.delta;
    
            if ( v > this.max ) {
                v = this.isCyclic ? this.min : this.max;
            } else if ( v < this.min ) {
                v = this.isCyclic ? this.max : this.min;
            }
    
            this.setValue(v);
            this.old = v;
            this.update( true );

            return true;
    
        }
              
        return false;
    
    }*/

    //keydown: function ( e ) { return true; },

    // ----------------------

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

    // ----------------------

    validate ( force ) {

        if ( this.allway ) force = true;
        let n = this.c[2].textContent;
        if ( !isNaN( n ) && n !== '' ) {
            this.value = this.numValue( n );
            this.update( force );
        } else if ( force && this.autoValue ) {
            this.c[2].textContent = this.formatOutput();
        }

        /*let n = this.c[2].textContent;
        if ( !isNaN( n ) && n !== '' ) {
            this.value = this.numValue( n );
            this.update( force || this.allway );
        } else if ( force && this.autoValue ) {
            this.c[2].textContent = this.formatOutput();
        }*/
        
        /*let n = this.c[2].textContent;

        if(!isNaN( n )){ 
            this.value = this.numValue( n ); 
            this.update(true); 
        }

        else {
            if(this.autoValue) this.c[2].textContent = this.formatOutput();
        }*/

    }


    reset () {

        //this.clearInput();
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

    /*mode ( mode ) {

        let s = this.s;
        let cc = this.colors

        switch(mode){
            case 0: // base
               // s[2].border = '1px solid ' + this.colors.hide;
                s[2].color = cc.text;
                s[4].background = cc.back;
                s[5].background = cc.text;
                if(this.model !== 0) s[6].background = cc.text//cc.button;
            break;
            case 1: // scroll over
                //s[2].border = '1px dashed ' + this.colors.hide;
                s[2].color = cc.textOver;
                s[4].background = cc.back;
                s[5].background = cc.textOver;
                if(this.model !== 0) s[6].background = cc.textOver//cc.overoff;
            break;

        }
    }*/

    update ( up ) {

        const pct = this.range > 0 ? ( this.value - this.min ) / this.range : 0;
        let ww = Math.floor( this.ww * pct );

        if(this.model !== 3) this.s[5].width = ww + 'px';
        if(this.s[6]) this.s[6].left = ( this.sa + ww + 3 ) + 'px';
        if( !this.isEdit && this.autoValue) this.c[2].textContent = this.formatOutput();

        if( up ) this.send();
        
    }

    /*select ( c, e, w, t ) {
        if ( !this.editable ) return;
        const cc = this.colors;
        const pad = 5; // padding horizontal de css.txtselect
        const el = this.c;

        // Mesure la largeur totale du texte complet via Roots.textWidth
        const fullW = w//Roots.textWidth( el.textContent );
        const boxW = el.clientWidth;

        // Calcule le point de départ X du texte selon l'alignement
        let offset = pad;
        const align = el.style.textAlign || el.style.justifyContent;
        if ( align === 'right' || align === 'flex-end' ) {
            offset = boxW - pad - fullW;
        } else if ( align === 'center' ) {
            offset = ( boxW - fullW ) * 0.5;
        }

        const start = Math.max( 0, offset + e );
        const end = Math.max( start, offset + e + w );
        const cur = Math.max( 0, offset + c );

        this.s.background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;
    }*/

    /*select ( c, e, w, t ) {
        if ( !this.editable ) return;
        const cc = this.colors;
        const pad = 5;
        const full = this.c.scrollWidth - pad * 2;
        const start = this.c.clientWidth - pad - ( full - e );
        const end = start + w;
        const cur = this.c.clientWidth - pad - ( full - c );

        this.s.background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;
    }*/

    select ( c, e, w, t, full ) {
        if ( !this.editable ) return;
        const cc = this.colors;
        const pad = 5;
        const el = this.c[ 2 ];
        const st = this.s[ 2 ];

        const left = el.clientWidth - pad - ( full || 0 );
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

    /*select ( c, e, w, t, full ) {
        if ( !this.editable ) return;
        const cc = this.colors;
        const pad = 5; // padding gauche de css.txtselect
        const start = pad + e;
        const end = start + w;
        const cur = pad + c;

        // Dessine la sélection (cc.select) et le curseur de 1px (cc.text) sur le fond de c[2]
        this.s[2].background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;
    }*/

    unselect () {
        if ( !this.s ) return;
        this.s[2].background = 'none';
        if ( this.autoValue ) this.c[2].textContent = this.formatOutput();
    }

    rSize () {

        super.rSize();

        let w = this.sb - this.sc;
        this.ww = w - 6;

        let tx = this.sc;
        if(this.isUI || !this.simple) tx = this.sc+10;
        this.txl = this.w - tx + 2;

        //let ty = Math.floor(this.h * 0.5) - 8;

        let s = this.s;

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

}