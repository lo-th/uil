import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function Slide ( o ){

    Proto.call( this, o );

    this.setTypeNumber( o );

    this.stype = o.stype || 0;
    this.buttonColor = o.bColor || Tools.colors.button;

    //this.old = this.value;
    this.isDown = false;
    this.isOver = false;
    this.allway = o.allway || false;

    this.c[2] = Tools.dom( 'div', Tools.css.txtselect + 'letter-spacing:-1px; padding:2px 5px; text-align:right; cursor:pointer; width:47px; border:none; color:'+ this.fontColor );
    this.c[3] = Tools.dom( 'div', Tools.css.basic + 'pointer-events:auto; cursor:w-resize; top:0; height:'+this.h+'px;' );
    //this.c[4] = Tools.dom( 'div', Tools.css.basic + 'border:1px solid '+this.buttonColor+'; pointer-events:none; background:rgba(0,0,0,0.3); top:2px; height:'+(this.h-4)+'px;' );
    this.c[4] = Tools.dom( 'div', Tools.css.basic + 'pointer-events:none; background:rgba(0,0,0,0.3); top:2px; height:'+(this.h-4)+'px;' );
    this.c[5] = Tools.dom( 'div', Tools.css.basic + 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + this.fontColor +';' );

    this.c[2].name = 'text';
    this.c[3].name = 'scroll';

    if(this.stype !== 0){
        if(this.stype === 1 || this.stype === 3){
            var h1 = 4;
            var h2 = 8;
            var ww = this.h-4;
            var ra = 20;
        }

        if(this.stype === 2){
            h1 = 2;
            h2 = 4;
            ra = 2;
            ww = (this.h-4)*0.5
        }

        if(this.stype === 3) this.c[5].style.visible = 'none';

        this.c[4].style.borderRadius = h1 + 'px';
        this.c[4].style.height = h2 + 'px';
        this.c[4].style.top = (this.h*0.5) - h1 + 'px';
        this.c[5].style.borderRadius = (h1*0.5) + 'px';
        this.c[5].style.height = h1 + 'px';
        this.c[5].style.top = (this.h*0.5)-(h1*0.5) + 'px';

        this.c[6] = Tools.dom( 'div', Tools.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+Tools.colors.border+'; background:'+this.buttonColor+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );
    }

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];
    this.c[2].events = [ 'keydown', 'keyup', 'mousedown', 'blur', 'focus' ];

    this.init();

};

Slide.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Slide,

    handleEvent: function ( e ) {

        //e.preventDefault();

        //console.log(e.target.name)

        switch( e.type ) {
            case 'mouseover': this.over( e ); break;
            case 'mousedown': e.target.name === 'text' ? this.textdown( e ) : this.down( e ); break;
            case 'mouseout': this.out( e ); break;

            case 'mouseup': this.up( e ); break;
            case 'mousemove': if(this.isDown) this.move( e ); break;

            case 'blur': this.blur( e ); break;
            case 'focus': this.focus( e ); break;
            case 'keydown': this.keydown( e ); break;
            case 'keyup': this.keyup( e ); break;
        }

    },

    mode: function ( mode ) {

        var s = this.s;

        switch(mode){
            case 0: // base
                s[2].color = this.fontColor;
                s[4].background = 'rgba(0,0,0,0.3)';
                s[5].background = this.fontColor;
            break;
            case 1: // over
                s[2].color = this.colorPlus;
               // if( !s[6] ) s[4].background = UIL.SlideBG;
               // else 
                s[4].background = 'rgba(0,0,0,0.6)';
                s[5].background = this.colorPlus;
            break;
        }
    },

    over: function( e ){

        e.preventDefault();
        e.stopPropagation();

        this.isOver = true;
        this.mode(1);

    },

    out: function( e ){

        e.preventDefault();
        e.stopPropagation();

        this.isOver = false;
        if(this.isDown) return;
        this.mode(0);

    },

    up: function( e ){

        e.preventDefault();
        e.stopPropagation();

        this.isDown = false;
        document.removeEventListener( 'mouseup', this, false );
        document.removeEventListener( 'mousemove', this, false );

        if(this.isOver) this.mode(1);
        else this.mode(0);

        this.sendEnd();
        
    },

    down: function( e ){

        e.preventDefault();
        e.stopPropagation();

        this.isDown = true;
        document.addEventListener( 'mouseup', this, false );
        document.addEventListener( 'mousemove', this, false );

        this.left = this.c[3].getBoundingClientRect().left;
        this.old = this.value;
        this.move( e );

    },

    move: function( e ){

        var n = ((( e.clientX - this.left - 3 ) / this.w ) * this.range + this.min ) - this.old;
        if(n >= this.step || n <= this.step){ 
            n = ~~ ( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
        }

    },

    update: function( up ){

        var ww = this.w * (( this.value - this.min ) / this.range );
       
        if(this.stype !== 3) this.s[5].width = ~~ ww + 'px';
        if(this.s[6]) this.s[6].left = ~~ (this.sa +ww + 3) + 'px';
        this.c[2].textContent = this.value;

        if( up ) this.send();

    },

    rSize: function(){

        Proto.prototype.rSize.call( this );

        var w = this.sb - this.sc;
        this.w = w - 6;

        var tx = this.sc;
        if(this.isUI || !this.simple) tx = this.sc+10;

        var ty = ~~(this.h * 0.5) - 8;

        var s = this.s;

        s[2].width = (this.sc -2 )+ 'px';
        s[2].left = (this.width - tx +2) + 'px';
        s[2].top = ty + 'px';
        s[3].left = this.sa + 'px';
        s[3].width = w + 'px';
        s[4].left = this.sa + 'px';
        s[4].width = w + 'px';
        s[5].left = (this.sa + 3) + 'px';

        this.update();

    },

    // text

    validate: function( e ){

        if(!isNaN( this.c[2].textContent )){ 
            this.value = this.numValue( this.c[2].textContent ); 
            this.update(true); 
        }
        else this.c[2].textContent = this.value;

    },

    textdown: function( e ){

        e.target.contentEditable = true;
        e.target.focus();
        this.isEdit = true;

    },

    keydown: function( e ){

        e.stopPropagation();

        if( e.keyCode === 13 ){
            e.preventDefault();
            this.validate();
            e.target.blur();
        }

    },

    keyup: function( e ){
        
        e.stopPropagation();
        if( this.allway ) this.validate();

    },

    blur: function( e ){

        e.target.style.border = 'none';
        e.target.contentEditable = false;
        this.isEdit = false;

    },

    focus: function( e ){

        e.target.style.border = '1px dashed ' + Tools.colors.borderSelect;

    }

} );

export { Slide };