import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function TextInput( o ){

    Proto.call( this, o );

    this.value = o.value || '';
    this.allway = o.allway || false;

    this.c[2] = Tools.dom( 'div',  Tools.css.txtselect );
    this.c[2].name = 'input';
    //this.c[2].style.color = ;
    this.c[2].textContent = this.value;

    this.c[2].events = [ 'mousedown', 'keydown', 'keyup', 'blur', 'focus' ];

    this.init();

};

TextInput.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: TextInput,

    handleEvent: function( e ) {

        switch( e.type ) {
            case 'mousedown': this.down( e ); break;
            case 'blur': this.blur( e ); break;
            case 'focus': this.focus( e ); break
            case 'keydown': this.keydown( e ); break;
            case 'keyup': this.keyup( e ); break;
        }

    },

    down: function( e ){

        e.target.contentEditable = true;
        e.target.focus();
        e.target.style.cursor = 'auto';

    },

    blur: function( e ){

        e.target.style.borderColor = Tools.colors.border;
        e.target.contentEditable = false;

    },

    focus: function( e ){

        e.target.style.borderColor = Tools.colors.borderSelect;

    },

    keydown: function( e ){
        
        e.stopPropagation();

        if( e.keyCode === 13 ){ 
            e.preventDefault();
            this.value = e.target.textContent;
            e.target.blur();
            this.send();
        }

    },

    keyup: function( e ){
        
        e.stopPropagation();

        this.value = e.target.textContent;
        if( this.allway ) this.send();
        
    },

    rSize: function(){

        Proto.prototype.rSize.call( this );
        this.s[2].color = this.fontColor;
        this.s[2].left = this.sa + 'px';
        this.s[2].width = this.sb + 'px';
        this.s[2].height = this.h -4 + 'px';
        this.s[2].lineHeight = this.h - 8 + 'px';
     
    }

} );

export { TextInput };