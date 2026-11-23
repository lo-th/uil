import { Roots } from '../core/Roots.js';
import { Proto } from '../core/Proto.js';

export class Checker extends Proto {

    constructor( o = {} ) {

        super( o );

        this.wfixe = 128
        this.hfixe = 85

        this.ratio = this.hfixe/this.wfixe

        this.hhh = this.w*this.ratio

        this.baseH = this.h;
        this.hplus = o.hplus || this.hhh;

        this.c[1].textContent = this.txt;
        this.c[0].style.cursor = 'pointer';
        this.c[0].style.pointerEvents = 'auto';

        this.c[2] = this.getCkecker( this.model );
        this.setSvg( this.c[2], 'viewBox', '0 0 128 85' );
        this.setCss( this.c[2], { width:this.w, height:this.hhh, left:0, top:this.baseH  });
        this.c[2].setAttribute('display', 'none' );

        this.isShow = false;

        let s = this.s;

        this.init();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown ( e ) {

        if( this.isShow ) this.close();
        else this.open();

    }

    open () {

        super.open()

        this.hplus = (this.w*this.ratio)
        this.h = this.hplus + this.baseH;

        if( this.group !== null ){ this.group.calc( this.hplus );}
        else if( this.isUI ) this.main.calc( this.hplus );

        this.s[0].height = this.h +'px';
        this.s[2].display = 'block'; 
        this.isShow = true;

    }

    close () {

        super.close()

        this.h = this.baseH;

        if( this.group !== null ){ this.group.calc( -this.hplus );}
        else if( this.isUI ) this.main.calc( -this.hplus );
        
        this.s[0].height = this.h +'px';
        this.s[2].display = 'none';
        this.isShow = false;
        
    }


    rSize () {

        let s = this.s;
        let w = this.w;

        s[0].width = w + 'px';
        s[1].width = w + 'px';
        s[2].width = w + 'px';
        s[2].height = (w*this.ratio) + 'px';
        
    }
    
}