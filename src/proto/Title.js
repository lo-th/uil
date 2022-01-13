import { Proto } from '../core/Proto.js';


export class Title extends Proto {

    constructor( o = {} ) {

        super( o );

        let prefix = o.prefix || '';

        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:right; width:60px; line-height:'+ (this.h-8) + 'px; color:' + this.colors.text );

        if( this.h === 31 ){

            this.s[0].height = this.h + 'px';
            this.s[1].top = 8 + 'px';
            this.c[2].style.top = 8 + 'px';

        }

        let s = this.s;

        s[1].justifyContent = o.align || 'left';
        //s[1].textAlign = o.align || 'left';
        s[1].fontWeight = o.fontWeight || 'bold';


        this.c[1].textContent = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
        this.c[2].textContent = prefix;

        this.init();

    }

    text ( txt ) {

        this.c[1].textContent = txt;

    }

    text2 ( txt ) {

        this.c[2].textContent = txt;

    }

    rSize () {

        super.rSize();
        this.s[1].width = this.w + 'px'; //- 50 + 'px';
        this.s[2].left = this.w + 'px';//- ( 50 + 26 ) + 'px';

    }

}