import { Proto } from '../core/Proto.js';


export class Slide extends Proto {

    constructor( o = {} ) {

        super( o );

        this.setTypeNumber( o );


        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;

        //this.defaultBorderColor = this.colors.hide;

        this.isDown = false;
        this.isOver = false;
        this.allway = o.allway || false;

        this.isDeg = o.isDeg || false;
        this.isCyclic = o.cyclic || false;

        this.firstImput = false;

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

            if( this.model === 3 ) this.c[5].style.visible = 'none';

            this.c[4].style.borderRadius = r1 + 'px';
            this.c[4].style.height = h2 + 'px';
            this.c[4].style.top = (this.h*0.5) - h1 + 'px';
            this.c[5].style.borderRadius = (r1*0.5) + 'px';
            this.c[5].style.height = h1 + 'px';
            this.c[5].style.top = (this.h*0.5)-(h1*0.5) + 'px';

            //this.c[6] = this.dom( 'div', this.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+cc.border+'; background:'+cc.button+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );
            this.c[6] = this.dom( 'div', this.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; background:'+cc.text+'; left:4px; top:3px; height:'+(this.h-6)+'px; width:'+ww+'px;' )
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

    mouseup ( e ) {
        
        if( this.isDown ) this.isDown = false;
        
    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false;

        if( name === 'scroll' ){ 
            this.isDown = true;
            this.old = this.value;
            this.mousemove( e );
            
        }

        /*if( name === 'text' ){
            this.setInput( this.c[2], function(){ this.validate() }.bind(this) );
        }*/

        return true;

    }

    mousemove ( e ) {

        let nup = false;

        let name = this.testZone( e );

        if( name === 'scroll' ) {
            this.mode(1);
            this.cursor('w-resize');
        //} else if(name === 'text'){ 
            //this.cursor('pointer');
        } else {
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
    
    }

    //keydown: function ( e ) { return true; },

    // ----------------------

    validate () {
        
        let n = this.c[2].textContent;

        if(!isNaN( n )){ 
            this.value = this.numValue( n ); 
            this.update(true); 
        }

        else this.c[2].textContent = this.value + (this.isDeg ? '°':'');

    }


    reset () {

        //this.clearInput();
        this.isDown = false;
        this.mode(0);

    }

    mode ( mode ) {

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
    }

    update ( up ) {

        let ww = Math.floor( this.ww * (( this.value - this.min ) / this.range ));
       
        if(this.model !== 3) this.s[5].width = ww + 'px';
        if(this.s[6]) this.s[6].left = ( this.sa + ww + 3 ) + 'px';
        this.c[2].textContent = this.value + (this.isDeg ? '°':'');

        if( up ) this.send();

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