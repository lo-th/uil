UIL.Group = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;
    this.isGroup = true;

    //this.bg = o.bg || null;
    

    //this.h = 25;
    this.baseH = this.h;
    var fltop = Math.floor(this.h*0.5)-6;

    this.isOpen = o.open || false;

    this.c[2] = UIL.DOM( null, 'div', UIL.BASIC + 'width:100%; left:0; height:auto; overflow:hidden; top:'+this.h+'px');
    //this.c[3] = UIL.DOM( null, 'div', UIL.BASIC + 'top:2px; left:2px; height:'+(this.h-4)+'px; width:6px; background-image:'+ UIL.GroupBG );
    //this.c[4] = UIL.DOM( null, 'div', UIL.BASIC + 'position:absolute; width:10px; height:10px; top:'+(~~(this.h*0.5)-5)+'px; pointer-events:none; background:'+ UIL.F0 );
    this.c[3] = UIL.DOM(null, 'path', UIL.BASIC + 'position:absolute; width:10px; height:10px; left:0; top:'+fltop+'px;', { d:UIL.GPATH, fill:this.fontColor, stroke:'none'});

    this.c[4] = UIL.DOM(null, 'path', UIL.BASIC + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:'M 3 8 L 8 5 3 2 3 8 Z', fill:this.fontColor, stroke:'none'});

    // bottom line
    this.c[5] = UIL.DOM( null, 'div', UIL.BASIC +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');

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

UIL.Group.prototype = Object.create( UIL.Proto.prototype );
UIL.Group.prototype.constructor = UIL.Group;

UIL.Group.prototype.setBG = function( c ){

    this.s[0].background = c;

    var i = this.uis.length;
    while(i--){
        this.uis[i].setBG( c );
    }

};

UIL.Group.prototype.handleEvent = function( e ) {

    e.preventDefault();
    //e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click( e ); break;
    }

};


UIL.Group.prototype.click = function( e ){

    if( this.isOpen ) this.close();
    else this.open();

};

UIL.Group.prototype.add = function( ){

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

    var n = UIL.Gui.prototype.add.apply( this, a );
    if( n.autoHeight ) n.parentGroup = this;

    return n;

};

UIL.Group.prototype.open = function(){

    this.isOpen = true;
    UIL.setSvg( this.c[4], 'd','M 5 8 L 8 3 2 3 5 8 Z');
    //this.s[4].background = UIL.F1;
    this.rSizeContent();

    if( this.isUI ) this.main.calc( this.h - this.baseH );

};

UIL.Group.prototype.close = function(){

    if( this.isUI ) this.main.calc(-(this.h-this.baseH ));

    this.isOpen = false;
    //this.s[4].background = UIL.F0;
    UIL.setSvg( this.c[4], 'd','M 3 8 L 8 5 3 2 3 8 Z');
    this.h = this.baseH;

    this.s[0].height = this.h + 'px';

};

UIL.Group.prototype.clear = function(){

    this.clearGroup();
    if( this.isUI ) this.main.calc( -(this.h +1 ));
    UIL.Proto.prototype.clear.call( this );

};

UIL.Group.prototype.clearGroup = function(){

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

UIL.Group.prototype.calc = function( y ){

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

UIL.Group.prototype.rSizeContent = function(){

    var i = this.uis.length;
    while(i--){
        this.uis[i].setSize( this.width );
        this.uis[i].rSize();
    }
    this.calc();

};

UIL.Group.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    var s = this.s;

    s[3].left = ( this.sa + this.sb - 17 ) + 'px';
    s[1].width = this.width + 'px';
    s[2].width = this.width + 'px';

    if(this.isOpen) this.rSizeContent();

};