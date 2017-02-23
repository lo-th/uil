import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';
//import { add } from '../core/Gui';
import { add } from '../core/add';

 function Group ( o ) {
 
    Proto.call( this, o );

    this.autoHeight = true;
    this.isGroup = true;

    //this.bg = o.bg || null;
    

    //this.h = 25;
    this.baseH = this.h;
    var fltop = Math.floor(this.h*0.5)-6;

    this.isOpen = o.open || false;

    this.isLine = o.line !== undefined ? o.line : true;

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

    if( this.isOpen ) this.open();

};

Group.prototype = Object.create( Proto.prototype );
Group.prototype.constructor = Group;

Group.prototype.setBG = function( c ){

    this.s[0].background = c;

    var i = this.uis.length;
    while(i--){
        this.uis[i].setBG( c );
    }

};

Group.prototype.handleEvent = function( e ) {

    e.preventDefault();
    //e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click( e ); break;
    }

};


Group.prototype.click = function( e ){

    if( this.isOpen ) this.close();
    else this.open();

};

Group.prototype.add = function( ){

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

    /*n.py = this.h;

    if( !n.autoWidth ){
        var y = n.c[0].getBoundingClientRect().top;
        if( this.prevY !== y ){
            this.calc( n.h + 1 );
            this.prevY = y;
        }
    }else{
        this.prevY = -1;
        this.calc( n.h + 1 );
    }*/

    if( n.autoHeight ) n.parentGroup = this;

    return n;

}

/*Group.prototype.add = function( ){

    var a = arguments;

    if( typeof a[1] === 'object' ){ 
        a[1].isUI = this.isUI;
        a[1].target = this.c[2];
    } else if( typeof arguments[1] === 'string' ){
        if( a[2] === undefined ) [].push.call(a, { isUI:true, target:this.c[2] });
        else{ 
            a[2].isUI = true;
            a[2].target = this.c[2];
        }
    }

    //var n = Gui.prototype.add.apply( this, a );
    var n = Gui.prototype.add.call( this, a );
    //var n = add.apply( this, a );
    if( n.autoHeight ) n.parentGroup = this;

    return n;

};*/

Group.prototype.open = function(){

    this.isOpen = true;
    Tools.setSvg( this.c[4], 'd','M 5 8 L 8 3 2 3 5 8 Z');
    //this.s[4].background = UIL.F1;
    this.rSizeContent();

    if( this.isUI ) this.main.calc( this.h - this.baseH );

};

Group.prototype.close = function(){

    if( this.isUI ) this.main.calc(-(this.h-this.baseH ));

    this.isOpen = false;
    //this.s[4].background = UIL.F0;
    Tools.setSvg( this.c[4], 'd','M 3 8 L 8 5 3 2 3 8 Z');
    this.h = this.baseH;

    this.s[0].height = this.h + 'px';

};

Group.prototype.clear = function(){

    this.clearGroup();
    if( this.isUI ) this.main.calc( -(this.h +1 ));
    Proto.prototype.clear.call( this );

};

Group.prototype.clearGroup = function(){

    this.close();

    var i = this.uis.length;
    while(i--){
        this.uis[i].clear();
        this.uis.pop();
    }
    this.uis = [];

    //if( this.isUI ) this.main.calc( -this.h+ this.baseH );

    this.h = this.baseH;
    //this.s[0].height = this.h + 'px';
    //this.s[2].height = 0;

    


    //this.calc();

};

Group.prototype.calc = function( y ){

    if( !this.isOpen ) return;

    //this.h = this.baseH;

    if( y !== undefined ){ 
        this.h += y;
        if( this.isUI ) this.main.calc( y );

    }
    else this.h = this.c[2].offsetHeight + this.baseH;

    //var total = this.c[2].offsetHeight;
    //this.h += total;

    this.s[0].height = this.h + 'px';

    //

};

Group.prototype.rSizeContent = function(){

    var i = this.uis.length;
    while(i--){
        this.uis[i].setSize( this.width );
        this.uis[i].rSize();
    }
    this.calc();

};

Group.prototype.rSize = function(){

    Proto.prototype.rSize.call( this );

    var s = this.s;

    s[3].left = ( this.sa + this.sb - 17 ) + 'px';
    s[1].width = this.width + 'px';
    s[2].width = this.width + 'px';

    if(this.isOpen) this.rSizeContent();

};

export { Group };