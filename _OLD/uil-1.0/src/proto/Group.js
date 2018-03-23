import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';
import { add } from '../core/add';

function Group ( o ) {
 
    Proto.call( this, o );

    this.autoHeight = true;
    this.isGroup = true;

    //this.bg = o.bg || null;
    

    //this.h = 25;
    this.baseH = this.h;
    var fltop = Math.floor(this.h*0.5)-6;


    this.isLine = o.line !== undefined ? o.line : false;

    this.c[2] = Tools.dom( 'div', Tools.css.basic + 'width:100%; left:0; height:auto; overflow:hidden; top:'+this.h+'px');
    this.c[3] = Tools.dom( 'path', Tools.css.basic + 'position:absolute; width:10px; height:10px; left:0; top:'+fltop+'px;', { d:Tools.GPATH, fill:this.fontColor, stroke:'none'});
    this.c[4] = Tools.dom( 'path', Tools.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:'M 3 8 L 8 5 3 2 3 8 Z', fill:this.fontColor, stroke:'none'});
    // bottom line
    if(this.isLine) this.c[5] = Tools.dom( 'div', Tools.css.basic +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');

    var s = this.s;

    s[0].height = this.h + 'px';
    s[1].height = this.h + 'px';
    //s[1].top = 4 + 'px';
    //s[1].left = 4 + 'px';
    s[1].pointerEvents = 'auto';
    s[1].cursor = 'pointer';
    this.c[1].name = 'group';

    this.s[1].marginLeft = '10px';
    this.s[1].lineHeight = this.h-4;
    this.s[1].color = this.fontColor;
    this.s[1].fontWeight = 'bold';

    this.uis = [];

    this.c[1].events = [ 'click' ];

    this.init();

    if( o.bg !== undefined ) this.setBG(o.bg);
    if( o.open !== undefined ) this.open();

};

Group.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Group,

    handleEvent: function ( e ) {

        e.preventDefault();
        //e.stopPropagation();

        switch( e.type ) {
            case 'click': this.click( e ); break;
        }

    },


    click: function ( e ) {

        if( this.isOpen ) this.close();
        else this.open();

    },

    setBG: function ( c ) {

        this.s[0].background = c;

        var i = this.uis.length;
        while(i--){
            this.uis[i].setBG( c );
        }

    },

    add: function( ){

        var a = arguments;

        if( typeof a[1] === 'object' ){ 
            a[1].isUI = this.isUI;
            a[1].target = this.c[2];
            a[1].main = this.main;
        } else if( typeof arguments[1] === 'string' ){
            if( a[2] === undefined ) [].push.call(a, { isUI:true, target:this.c[2], main:this.main });
            else{ 
                a[2].isUI = true;
                a[2].target = this.c[2];
                a[2].main = this.main;
            }
        }

        var n = add.apply( this, a );
        this.uis.push( n );

        if( n.autoHeight ) n.parentGroup = this;

        return n;

    },

    open: function () {

        Proto.prototype.open.call( this );

        Tools.setSvg( this.c[4], 'd','M 5 8 L 8 3 2 3 5 8 Z');
        //this.s[4].background = UIL.F1;
        this.rSizeContent();

        if( this.isUI ) this.main.calc( this.h - this.baseH );

    },

    close: function () {

        Proto.prototype.close.call( this );

        if( this.isUI ) this.main.calc( -( this.h - this.baseH ) );

        Tools.setSvg( this.c[4], 'd','M 3 8 L 8 5 3 2 3 8 Z');
        this.h = this.baseH;
        this.s[0].height = this.h + 'px';

    },

    clear: function(){

        this.clearGroup();
        if( this.isUI ) this.main.calc( -(this.h +1 ));
        Proto.prototype.clear.call( this );

    },

    clearGroup: function(){

        this.close();

        var i = this.uis.length;
        while(i--){
            this.uis[i].clear();
            this.uis.pop();
        }
        this.uis = [];
        this.h = this.baseH;

    },

    calc: function( y ){

        if( !this.isOpen ) return;

        if( y !== undefined ){ 
            this.h += y;
            if( this.isUI ) this.main.calc( y );
        } else {
            this.h = this.c[2].offsetHeight + this.baseH;
        }
        this.s[0].height = this.h + 'px';

    },

    rSizeContent: function(){

        var i = this.uis.length;
        while(i--){
            this.uis[i].setSize( this.width );
            this.uis[i].rSize();
        }
        this.calc();

    },

    rSize: function(){

        Proto.prototype.rSize.call( this );

        var s = this.s;

        s[3].left = ( this.sa + this.sb - 17 ) + 'px';
        s[1].width = this.width + 'px';
        s[2].width = this.width + 'px';

        if(this.isOpen) this.rSizeContent();

    }

} );

export { Group };