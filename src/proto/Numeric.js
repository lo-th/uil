import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function Numeric( o ){

    Proto.call( this, o );

    this.type = 'number';

    this.setTypeNumber( o );

    this.allway = o.allway || false;
    this.isDrag = o.drag === undefined ? true : o.drag;

    this.value = [0];
    this.toRad = 1;
    this.isNumber = true;
    this.isAngle = false;
    this.isVector = false;
    this.isSelect = false;

    if( o.value !== undefined ){
        if(!isNaN(o.value)){ this.value = [o.value];}
        else if(o.value instanceof Array ){ this.value = o.value; this.isNumber=false;}
        else if(o.value instanceof Object ){ 
            this.value = [];
            if(o.value.x) this.value[0] = o.value.x;
            if(o.value.y) this.value[1] = o.value.y;
            if(o.value.z) this.value[2] = o.value.z;
            if(o.value.w) this.value[3] = o.value.w;
            this.isVector = true;
        }
    }

    this.length = this.value.length;

    if(o.isAngle){
        this.isAngle = true;
        this.toRad = Math.PI/180;
    }

    //this.w = ((Tools.base.BW+5)/(this.length))-5;
    this.current = undefined;
    
    var i = this.length;
    while(i--){
        if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
        this.c[2+i] = Tools.dom( 'div', Tools.css.txtselect + 'letter-spacing:-1px; cursor:pointer; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
        this.c[2+i].name = i;
        if(this.isDrag) this.c[2+i].style.cursor = 'move';
        if(o.center) this.c[2+i].style.textAlign = 'center';

        this.c[2+i].textContent = this.value[i];
        this.c[2+i].style.color = this.fontColor;
        //this.c[2+i].contentEditable = true;
        this.c[2+i].events = [ 'keydown', 'keyup', 'mousedown', 'blur', 'focus' ]; //'click', 

    }

    this.init();
}

Numeric.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Numeric,

    handleEvent: function( e ) {

        //e.preventDefault();
        //e.stopPropagation();

        switch( e.type ) {
            //case 'click': this.click( e ); break;
            case 'mousedown': this.down( e ); break;
            case 'keydown': this.keydown( e ); break;
            case 'keyup': this.keyup( e ); break;

            case 'blur': this.blur( e ); break;
            case 'focus': this.focus( e ); break;

            // document
            case 'mouseup': this.up( e ); break;
            case 'mousemove': this.move( e ); break;

        }

    },

    setValue: function ( v, n ) {

        n = n || 0;
        this.value[n] = this.numValue( v );
        this.c[2+n].textContent = this.value[n];

    },

    keydown: function ( e ) {

        e.stopPropagation();

        if( e.keyCode === 13 ){
            e.preventDefault();
            this.testValue( parseFloat(e.target.name) );
            this.validate();
            e.target.blur();
        }

    },

    keyup: function ( e ) {
        
        e.stopPropagation();

        if( this.allway ){ 
            this.testValue( parseFloat(e.target.name) );
            this.validate();
        }

    },

    blur: function ( e ) {

        this.isSelect = false;
        e.target.style.borderColor = Tools.colors.border;
        e.target.contentEditable = false;
        //e.target.style.border = '1px solid rgba(255,255,255,0.1)';
        if(this.isDrag) e.target.style.cursor = 'move';
        else  e.target.style.cursor = 'pointer';

    },

    focus: function ( e ) {

        this.isSelect = true;
        this.current = undefined;
        e.target.style.borderColor = Tools.colors.borderSelect;
        
        //e.target.style.border = '1px solid ' + UIL.BorderSelect;
        if(this.isDrag) e.target.style.cursor = 'auto';

    },

    down: function ( e ) {

        if(this.isSelect) return;

        e.preventDefault();

        this.current = parseFloat(e.target.name);

        this.prev = { x:e.clientX, y:e.clientY, d:0, id:(this.current+2)};
        if( this.isNumber ) this.prev.v = parseFloat(this.value);
        else this.prev.v = parseFloat( this.value[this.current] );



        document.addEventListener( 'mouseup', this, false );
        if(this.isDrag) document.addEventListener( 'mousemove', this, false );

    },

    ////

    up: function( e ){

        e.preventDefault();

        document.removeEventListener( 'mouseup', this, false );
        if(this.isDrag) document.removeEventListener( 'mousemove', this, false );

        if(this.current !== undefined){ 

            if( this.current === parseFloat(e.target.name) ){ 
                e.target.contentEditable = true;
                e.target.focus();
            }

        }

    },

    move: function( e ){

        e.preventDefault();

        if( this.current === undefined ) return;

        this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );
        var n = this.prev.v + ( this.prev.d * this.step);

        this.value[this.current] = this.numValue(n);
        //this.c[2+this.current].value = this.value[this.current];

        this.c[2+this.current].textContent = this.value[this.current];

        this.validate();

        this.prev.x = e.clientX;
        this.prev.y = e.clientY;

    },

    /////

    testValue: function( n ){

        if(!isNaN( this.c[2+n].textContent )){ 
            var nx = this.numValue( this.c[2+n].textContent );
            this.c[2+n].textContent = nx;
            this.value[n] = nx;
        } else { // not number
            this.c[2+n].textContent = this.value[n];
        }

    },

    validate: function(){

        var ar = [];
        var i = this.length;
        while(i--) ar[i] = this.value[i]*this.toRad;

        if( this.isNumber ) this.send( ar[0] );
        else this.send( ar );

    },

    rSize: function(){

        Proto.prototype.rSize.call( this );

        this.w = ~~( ( this.sb + 5 ) / this.length )-5;
        var s = this.s;
        var i = this.length;
        while(i--){
            s[2+i].left = (~~( this.sa + ( this.w * i )+( 5 * i ))) + 'px';
            s[2+i].width = this.w + 'px';
        }

    }

} );

export { Numeric };