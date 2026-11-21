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
        } else if ( this.model === 2 ) {
            let box = this.inh - 2;
            let t = Math.floor( (this.h - box) * 0.5 );
            this.inw = box;
            this.c[2] = this.dom( 'div', this.css.txt + this.css.middle + 'padding:0; line-height:1; justify-content:center; background:' + cc.inputBg + '; height:' + box + 'px; width:' + box + 'px; top:' + t + 'px; border-radius:' + this.radius + 'px; border:' + cc.borderSize + 'px solid ' + cc.border + '; font-size:' + (box - 4) + 'px;' );
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
    mouseup () { 
        this.sendEnd(); 
        return false; 
    }

    mousedown ( e ) {

        this.value = !this.value
        this.update( true )
        this.mousemove( e )
        return true 

    }

    mousemove ( e ) {

        this.cursor('pointer')
        return this.mode( true )
        
    }

    reset () {

        this.cursor()
        //return this.mode()
        return this.mode( false );

    }

    // ----------------------
    //   MODE
    // ----------------------

    mode ( over ) {

        if ( over !== undefined ) this.isOver = over;

        let change = false;
        let cc = this.colors, s = this.s, v = this.value;
        let n = this.isOver ? ( v ? 4 : 3 ) : ( v ? 2 : 1 );

        if( this.stat !== n ){

            this.stat = n

            if( this.model === 1 ){

                switch( n ){

                    case 1: s[2].color = cc.text; s[2].background = cc.button; break;
                    case 2: s[2].color = cc.textSelect; s[2].background = cc.select; break;
                    case 3: s[2].color = cc.textOver; s[2].background = cc.overoff; break;
                    case 4: s[2].color = cc.textOver; s[2].background = cc.over; break;

                }

                if ( this.c[2] !== undefined )  this.c[2].textContent = v ? this.onName : this.name

            } else if ( this.model === 2 ) {

                    switch ( n ) {
                        case 1: s[2].background = cc.backoff; s[2].borderColor = cc.border; break; // off out
                        case 2: s[2].background = cc.back; s[2].borderColor = cc.overoff; s[2].color = cc.textSelect; break; // on out
                        case 3: s[2].background = cc.back; s[2].borderColor = cc.overoff; break; // off over
                        case 4: s[2].background = cc.backoff; s[2].borderColor = cc.border; s[2].color = cc.textOver; break; // on over
                    }
                    if ( this.c[2] ) this.c[2].textContent = v ? '✖' : '';
                    if ( this.c[1] ) this.c[1].textContent = v ? this.onName : this.name

            } else {

                switch( n ){

                    case 1: s[2].background = s[2].borderColor = cc.backoff; s[3].background = cc.button; break;// off out
                    case 2: s[2].background = s[2].borderColor = cc.back; s[3].background = cc.textOver; break;// on over
                    case 3: s[2].background = s[2].borderColor = cc.back; s[3].background = cc.overoff; break;// off over
                    case 4: s[2].background = s[2].borderColor = cc.backoff; s[3].background = cc.textSelect; break;// on out

                }

                s[3].marginLeft = v ? ( this.inw - 20 ) + 'px' : '4px';
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
        } else if( this.model === 2 ){
            s[2].left = w + 'px'
        } else {
            s[2].left = this.sa + 'px'
            s[2].width = this.sb  + 'px'
        }
        
    }

}