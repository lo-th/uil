import { Proto } from '../core/Proto.js';
import { Roots } from '../core/Roots.js';

export class TextInput extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = o.value !== undefined ? o.value : '';
        this.placeHolder = o.placeHolder || 'text';

        this.allway = o.allway || false;
        this.editable = o.edit !== undefined ? o.edit : true;

        this.isDown = false;

        let cc = this.colors

        // text
        this.c[2] = this.dom( 'div', this.css.txtselect + 'top:1px; height:' + (this.h-2) + 'px; color:' + cc.text + '; background:' + cc.back + '; border:' + cc.borderSize + 'px solid ' + cc.border + '; border-radius:' + this.radius + 'px;' );
        //this.c[2] = this.dom( 'div', this.css.txtselect + 'top:1px; height:' + (this.h-2) + 'px; color:' + cc.text + '; background:' + cc.back + '; borderColor:' + cc.border+'; border-radius:'+this.radius+'px;' );
        this.c[2].textContent = this.value;

        // fake
        this.c[3] = this.dom( 'div', this.css.txtselect + 'top:1px; height:' + (this.h-2) + 'px; border:none; justify-content: center; font-style: italic; color:'+cc.border+';' );
        if( this.value === '' ) this.c[3].textContent = this.placeHolder;

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x >= this.sa ) return 'text';
        return '';

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        if(!this.editable) return;

        if( this.isDown ){
            this.isDown = false;
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

        if(!this.editable) return;

        let name = this.testZone( e );

        if( !this.isDown ){
            this.isDown = true;
            if( name === 'text' ) this.setInput( this.c[2] );
            return this.mousemove( e );
        }

        return false;

    }

    mousemove ( e ) {

        if(!this.editable) return;

        let name = this.testZone( e );

        let x = 0;

        if( name === 'text' ) this.cursor('text');
        else this.cursor();

        if ( this.isDown ) {
            const el = this.c[ 2 ];
            const pad = 5 - this.colors.borderSize;
            Roots.hiddenSizer.innerHTML = el.textContent.replace(/ /g, '&nbsp;');
            const full = Roots.hiddenSizer.clientWidth;
            const w = el.clientWidth || ( this.sb - this.colors.borderSize * 2 )
            const left = w - pad - full;
            x = ( e.clientX - this.zone.x - this.sa ) - left;
        }

        return this.upInput( x, this.isDown );

       //if( this.isDown ) x = e.clientX - this.zone.x;

        //return this.upInput( x - this.sa -3, this.isDown );

    }

    update ( ) {

        this.c[2].textContent = this.value;
        
    }

    // ----------------------

    reset () {

        this.cursor();

    }

    // ----------------------
    //   INPUT
    // ----------------------

    /*select ( c, e, w, t ) {
        if ( !this.editable ) return;

        console.log(c,e,w)
        const cc = this.colors;
        const pad = 5;
        const right = this.c[2].clientWidth - pad;
        const start = right - w - e;
        const end = right - e;
        //const cur = right - c;

        //const start = right + w - e;
        //const end = right - e;
        const cur = right + c;
        //const cur = c - right

        this.s[2].background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;
    }*/

    select ( c, e, w, t, full ) {
        if ( !this.editable ) return;
        const cc = this.colors;
        const pad = 5 - cc.borderSize;
        const el = this.c[ 2 ];
        const st = this.s[ 2 ];

        const width = el.clientWidth || ( this.sb - cc.borderSize * 2 );
        const left = width - pad - ( full || 0 );
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
        const cc = this.colors;
        const pad = 5;
        const start = pad + e;
        const end = start + w;
        const cur = pad + c;

        this.s[2].background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;
    }*/

    unselect () {
        if ( !this.s ) return;
        this.s[2].background = this.colors.back;
    }

    validate ( force ) {

        if( this.allway ) force = true; 

        this.value = this.c[2].textContent;

        if(this.value !== '') this.c[3].textContent = '';
        else this.c[3].textContent = this.placeHolder;

        if( !force ) return;

        this.send();

    }

    // ----------------------
    //   REZISE
    // ----------------------

    rSize () {

        super.rSize();

        let s = this.s;
        s[2].left = this.sa + 'px';
        s[2].width = this.sb + 'px';

        s[3].left = this.sa + 'px';
        s[3].width = this.sb + 'px';
     
    }


}