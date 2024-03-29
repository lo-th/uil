import { Proto } from '../core/Proto.js';

export class Bool extends Proto {

    constructor( o = {} ) {

        super( o )
        
        this.value = o.value || false
        this.model = o.mode !== undefined ? o.mode : 0

        this.onName = o.rename || this.txt
        if( o.onName ) o.onname = o.onName
        if( o.onname ) this.onName = o.onname

        this.inh = o.inh || Math.floor( this.h*0.8 )
        this.inw = o.inw || 36

        let cc = this.colors
       
        if( this.model === 0 ){
            let t = Math.floor(this.h*0.5)-((this.inh-2)*0.5);
            this.c[2] = this.dom( 'div', this.css.basic + 'background:'+ cc.inputBg +'; height:'+(this.inh-2)+'px; width:'+this.inw+'px; top:'+t+'px; border-radius:10px; border:2px solid '+ cc.back )
            this.c[3] = this.dom( 'div', this.css.basic + 'height:'+(this.inh-6)+'px; width:16px; top:'+(t+2)+'px; border-radius:10px; background:'+ cc.button+';' )
        } else {
            this.p = 0
            if( this.c[1] !== undefined ) this.c[1].textContent = '';
            this.c[2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; border-radius:'+this.radius+'px;' )
        }

        this.stat = -1

        this.init()
        this.update()

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown ( e ) {

        this.value = !this.value
        this.update( true )
        return this.mousemove( e )

    }

    mousemove ( e ) {

        this.cursor('pointer')
        return this.mode( true )
        
    }

    reset () {

        this.cursor()
        return this.mode()

    }

    // ----------------------
    //   MODE
    // ----------------------

    mode ( over ) {

        let change = false
        let cc = this.colors, s = this.s, n, v = this.value

        if( over ) n = v ? 4 : 3
        else n = v ? 2 : 1

        if( this.stat !== n ){

            this.stat = n

            if( this.model !== 0 ){

                switch( n ){

                    case 1: s[2].color = cc.text; s[2].background = cc.button; break;
                    case 2: s[2].color = cc.textSelect; s[2].background = cc.select; break;
                    case 3: s[2].color = cc.textOver; s[2].background = cc.overoff; break;
                    case 4: s[2].color = cc.textOver; s[2].background = cc.over; break;

                }

                this.c[2].innerHTML = v ? this.onName : this.name

            } else {

                switch( n ){

                    case 1: s[2].background = s[2].borderColor = cc.backoff; s[3].background = cc.button; break;// off out
                    case 2: s[2].background = s[2].borderColor = cc.back; s[3].background = cc.textOver; break;// on over
                    case 3: s[2].background = s[2].borderColor = cc.back; s[3].background = cc.overoff; break;// off over
                    case 4: s[2].background = s[2].borderColor = cc.backoff; s[3].background = cc.textSelect; break;// on out

                }

                s[3].marginLeft = v ? '17px' : '2px'
                this.c[1].textContent = v ? this.onName : this.name

            }

            change = true

        }

        return change

    }

    // ----------------------

    update ( up ) {

        this.mode()
        if( up ) this.send()
            
    }

    rSize () {

        super.rSize()

        let s = this.s
        let w = (this.w - 10 ) - this.inw
        if( this.model === 0 ){
            s[2].left = w + 'px'
            s[3].left = w + 'px'
        } else {
            s[2].left = this.sa + 'px'
            s[2].width = this.sb  + 'px'
        }
        
    }

}