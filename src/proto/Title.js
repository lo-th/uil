import { Proto } from '../core/Proto.js';


export class Title extends Proto {

    constructor( o = {} ) {

        if ( !o.name && !o.txt ) o.name = ' ';
        super( o );

        this.isTitle = true;

        const s1 = this.s[1];
        const align = o.align || 'left';

        s1.justifyContent = align === 'right' ? 'flex-start' : ( align === 'center' ? 'center' : 'flex-end' );
        s1.textAlign = align;
        if ( o.fontSize ) s1.fontSize = typeof o.fontSize === 'number' ? o.fontSize + 'px' : o.fontSize;
        s1.fontWeight = o.weight || 'normal';
        s1.color = o.color || this.colors.text;

        this.text( this.txt );
        this.init();

    }

    handleEvent () { return false; }

    text( txt ) {

        const el = this.c[1];
        if ( !el ) return;
        if ( typeof txt === 'string' && txt.indexOf( '<' ) !== -1 ) el.innerHTML = txt;
        else el.textContent = txt;

    }


    rSize() {

        super.rSize();
        this.s[1].width = this.w + 'px'; //- 50 + 'px';
        //this.s[2].left = this.w + 'px';//- ( 50 + 26 ) + 'px';

    }

    setColor( c ) {
        this.s[1].color = c
    }

}