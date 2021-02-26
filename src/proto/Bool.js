import { Proto } from '../core/Proto';

export class Bool extends Proto {

    constructor( o = {} ) {

        super( o );
        
        this.value = o.value || false;

        this.buttonColor = o.bColor || this.colors.button;

        this.inh = o.inh || Math.floor( this.h*0.8 );
        this.inw = o.inw || 36;

        let t = Math.floor(this.h*0.5)-((this.inh-2)*0.5);

        this.c[2] = this.dom( 'div', this.css.basic + 'background:'+ this.colors.boolbg +'; height:'+(this.inh-2)+'px; width:'+this.inw+'px; top:'+t+'px; border-radius:10px; border:2px solid '+this.boolbg );
        this.c[3] = this.dom( 'div', this.css.basic + 'height:'+(this.inh-6)+'px; width:16px; top:'+(t+2)+'px; border-radius:10px; background:'+this.buttonColor+';' );

        this.init();
        this.update();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousemove ( e ) {

        this.cursor('pointer');

    }

    mousedown ( e ) {

        this.value = this.value ? false : true;
        this.update();
        this.send();
        return true;

    }

    // ----------------------

    update () {

        let s = this.s;

        if( this.value ){
            
            s[2].background = this.colors.boolon;
            s[2].borderColor = this.colors.boolon;
            s[3].marginLeft = '17px';

        } else {
            
            s[2].background = this.colors.boolbg;
            s[2].borderColor = this.colors.boolbg;
            s[3].marginLeft = '2px';

        }
            
    }

    rSize () {

        super.rSize();
        let s = this.s;
        let w = (this.w - 10 ) - this.inw;
        s[2].left = w + 'px';
        s[3].left = w + 'px';

    }

}