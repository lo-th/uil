import { Proto } from '../core/Proto.js';


export class Title extends Proto {

    constructor( o = {} ) {

        super( o );

        this.isTitle = true;

        let s = this.s;

        s[1].justifyContent = o.align || 'left';
        s[1].textAlign = o.align || 'left';
        if(o.fontSize) s[1].fontSize = o.fontSize;
        s[1].fontWeight = o.weight || 'normal';
        s[1].color = o.color || this.colors.text;


        this.c[1].innerHTML = this.txt//.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
        //this.c[2].textContent = prefix;

        this.init();

    }

    text( txt ) {

        this.c[1].innerHTML = txt;

    }

    text2( txt ) {

        //this.c[2].textContent = txt;

    }

    rSize() {

        super.rSize();
        this.s[1].width = this.w + 'px'; //- 50 + 'px';
        //this.s[2].left = this.w + 'px';//- ( 50 + 26 ) + 'px';

    }

    setColor( c ) {
        this.s[1].color = c
        //this.s[2].color = c
    }

}