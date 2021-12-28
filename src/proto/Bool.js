import { Proto } from '../core/Proto.js';

export class Bool extends Proto {

    constructor( o = {} ) {

        super( o );
        
        this.value = o.value || false;

        this.model = o.mode !== undefined ? o.mode : 0;

        this.onName = o.rename || this.txt;
        if( o.onName ) o.onname = o.onName
        if( o.onname ) this.onName = o.onname;

        this.buttonColor = o.bColor || this.colors.button;

        this.inh = o.inh || Math.floor( this.h*0.8 );
        this.inw = o.inw || 36;

       
        if( this.model === 0 ){
            let t = Math.floor(this.h*0.5)-((this.inh-2)*0.5);
            this.c[2] = this.dom( 'div', this.css.basic + 'background:'+ this.colors.boolbg +'; height:'+(this.inh-2)+'px; width:'+this.inw+'px; top:'+t+'px; border-radius:10px; border:2px solid '+this.boolbg );
            this.c[3] = this.dom( 'div', this.css.basic + 'height:'+(this.inh-6)+'px; width:16px; top:'+(t+2)+'px; border-radius:10px; background:'+this.buttonColor+';' );
        } else {
            this.p =0
            this.c[1].textContent = '';
            this.c[2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; background:'+this.colors.button+'; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:'+this.radius+'px;' );

            
            /*
            this.c[2].style.background = this.value ? this.colors.select : this.colors.button;
            this.c[2].style.color = this.value ? this.fontSelect : this.fontColor;*/
        }

        this.stat = -1;
        this.mode( this.value ? 2 : 1 )

        



        this.init();
        this.update();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown ( e ) {

        this.value = !this.value// ? false : true;
        this.update( true );
        //this.send();
        return this.mousemove( e );

    }

    mousemove ( e ) {

        this.cursor('pointer');
        return this.mode( this.value ? 4 : 3 )
        
    }

    reset () {

        this.cursor();
        return this.mode( this.value ? 2 : 1 )

    }

    mode ( n ) {

        let change = false

        if( this.stat !== n ){

            if( this.model !== 0 ){

                let s = this.c[2].style

                switch( n ){

                    case 1: this.stat = 1; s.color = this.fontColor;  s.background = this.colors.button; break;
                    case 2: this.stat = 2; s.color = this.fontSelect; s.background = this.colors.select; break;
                    case 3: this.stat = 3; s.color = this.fontSelect; s.background = this.colors.over2; break;
                    case 4: this.stat = 4; s.color = this.fontSelect; s.background = this.colors.over; break;

                }

                this.c[2].innerHTML = this.value ? this.onName : this.name;
            } else {

                this.c[2].style.background = this.value ? this.colors.boolon : this.colors.boolbg;
                this.c[2].style.borderColor = this.value ? this.colors.boolon : this.colors.boolbg;
                this.c[3].style.marginLeft = this.value ? '17px' : '2px';

                this.c[1].textContent = this.value ? this.onName : this.name;
            }

            change = true

        }

        return change;

    }

    // ----------------------

    update ( up ) {

        this.mode( this.value ? 4 : 3 )
        if( up ) this.send();
            
    }



    rSize () {

        super.rSize();
        let s = this.s;
        let w = (this.w - 10 ) - this.inw;
        if( this.model === 0 ){
            s[2].left = w + 'px';
            s[3].left = w + 'px';
        } else {
            s[2].left = this.sa + 'px';
            s[2].width = (this.w- 20)  + 'px';
        }
        

    }

}