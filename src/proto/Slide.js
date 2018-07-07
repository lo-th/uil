import { Proto } from '../core/Proto';

function Slide ( o ){

    Proto.call( this, o );

    this.setTypeNumber( o );


    this.model = o.stype || 0;
    if( o.mode !== undefined ) this.model = o.mode;
    this.buttonColor = o.bColor || this.colors.button;

    this.isDown = false;
    this.isOver = false;
    this.allway = o.allway || false;

    this.firstImput = false;

    this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; border:1px dashed '+this.colors.hide+'; color:'+ this.fontColor );
    this.c[3] = this.dom( 'div', this.css.basic + ' top:0; height:'+this.h+'px;' );
    this.c[4] = this.dom( 'div', this.css.basic + 'background:'+this.colors.scrollback+'; top:2px; height:'+(this.h-4)+'px;' );
    this.c[5] = this.dom( 'div', this.css.basic + 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + this.fontColor +';' );

    this.c[2].isNum = true;

    if(this.model !== 0){
        if(this.model === 1 || this.model === 3){
            var h1 = 4;
            var h2 = 8;
            var ww = this.h-4;
            var ra = 20;
        }

        if(this.model === 2){
            h1 = 2;
            h2 = 4;
            ra = 2;
            ww = (this.h-4)*0.5
        }

        if(this.model === 3) this.c[5].style.visible = 'none';

        this.c[4].style.borderRadius = h1 + 'px';
        this.c[4].style.height = h2 + 'px';
        this.c[4].style.top = (this.h*0.5) - h1 + 'px';
        this.c[5].style.borderRadius = (h1*0.5) + 'px';
        this.c[5].style.height = h1 + 'px';
        this.c[5].style.top = (this.h*0.5)-(h1*0.5) + 'px';

        this.c[6] = this.dom( 'div', this.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+this.colors.border+'; background:'+this.buttonColor+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );
    }

    this.init();

}

Slide.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Slide,

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        
        if( l.x >= this.txl ) return 'text';
        else if( l.x >= this.sa ) return 'scroll';
        else return '';

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup: function ( e ) {
        
        if(this.isDown) this.isDown = false;
        
    },

    mousedown: function ( e ) {

        var name = this.testZone( e );

        if( !name ) return false;

        if( name === 'scroll' ){ 
            this.isDown = true;
            this.old = this.value;
            this.mousemove( e );
            
        }

        if( name === 'text' ){
            this.setInput( this.c[2], function(){ this.validate() }.bind(this) );
        }

        return true;

    },

    mousemove: function ( e ) {

        var nup = false;

        var name = this.testZone( e );

        if( name === 'scroll' ) {
            this.mode(1);
            this.cursor('w-resize');
        } else if(name === 'text'){ 
            this.cursor('pointer');
        } else {
            this.cursor();
        }

        if( this.isDown ){

            var n = ((( e.clientX - (this.zone.x+this.sa) - 3 ) / this.ww ) * this.range + this.min ) - this.old;
            if(n >= this.step || n <= this.step){ 
                n = Math.floor( n / this.step );
                this.value = this.numValue( this.old + ( n * this.step ) );
                this.update( true );
                this.old = this.value;
            }
            nup = true;
        }

        return nup;

    },

    keydown: function ( e ) { return true; },

    // ----------------------

    validate: function () {
        
        var n = this.c[2].textContent;

        if(!isNaN( n )){ 
            this.value = this.numValue( n ); 
            this.update(true); 
        }

        else this.c[2].textContent = this.value;

    },


    reset: function () {

        //this.clearInput();
        this.isDown = false;
        this.mode(0);

    },

    mode: function ( mode ) {

        var s = this.s;

        switch(mode){
            case 0: // base
               // s[2].border = '1px solid ' + this.colors.hide;
                s[2].color = this.fontColor;
                s[4].background = this.colors.scrollback;
                s[5].background = this.fontColor;
            break;
            case 1: // scroll over
                //s[2].border = '1px dashed ' + this.colors.hide;
                s[2].color = this.colorPlus;
                s[4].background = this.colors.scrollbackover;
                s[5].background = this.colorPlus;
            break;
           /* case 2: 
                s[2].border = '1px solid ' + this.colors.borderSelect;
            break;
            case 3: 
                s[2].border = '1px dashed ' + this.fontColor;//this.colors.borderSelect;
            break;
            case 4: 
                s[2].border = '1px dashed ' + this.colors.hide;
            break;*/


        }
    },

    update: function ( up ) {

        var ww = Math.floor( this.ww * (( this.value - this.min ) / this.range ));
       
        if(this.model !== 3) this.s[5].width = ww + 'px';
        if(this.s[6]) this.s[6].left = ( this.sa + ww + 3 ) + 'px';
        this.c[2].textContent = this.value;

        if( up ) this.send();

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var w = this.sb - this.sc;
        this.ww = w - 6;

        var tx = this.sc;
        if(this.isUI || !this.simple) tx = this.sc+10;
        this.txl = this.w - tx + 2;

        var ty = Math.floor(this.h * 0.5) - 8;

        var s = this.s;

        s[2].width = (this.sc -2 )+ 'px';
        s[2].left = this.txl + 'px';
        s[2].top = ty + 'px';
        s[3].left = this.sa + 'px';
        s[3].width = w + 'px';
        s[4].left = this.sa + 'px';
        s[4].width = w + 'px';
        s[5].left = (this.sa + 3) + 'px';

        this.update();

    },

} );

export { Slide };