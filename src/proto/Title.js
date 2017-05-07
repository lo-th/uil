import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function Title ( o ) {
    
    Proto.call( this, o );

    //var id = o.id || 0;
    var prefix = o.prefix || '';

    this.c[2] = Tools.dom( 'div', Tools.css.txt + 'text-align:right; width:60px; line-height:'+ (this.h-8) + 'px; color:' + this.fontColor );

    if( this.h === 31 ){

        this.s[0].height = this.h + 'px';
        this.s[1].top = 8 + 'px';
        this.c[2].style.top = 8 + 'px';

    }

    this.c[1].textContent = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
    this.c[2].textContent = prefix;

    this.init();

};

Title.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Title,

    text: function ( txt ) {

        this.c[1].textContent = txt;

    },

    text2: function ( txt ) {

        this.c[2].textContent = txt;

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );
        this.s[1].width = this.width-50 + 'px';
        this.s[2].left = this.width-(50+26) + 'px';

    },

} );

export { Title };