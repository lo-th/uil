UIL.Group = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;
    this.isGroup = true;

    //this.h = 25;
    this.baseH = this.h;

    this.isOpen = o.open || false;

    this.c[2] = UIL.DOM('UIL', 'div', 'width:100%; left:0; height:auto; top:'+this.h+'px');
    this.c[3] = UIL.DOM('UIL', 'div', 'top:2px; left:2px; height:'+(this.h-4)+'px; width:6px; background-image:'+ UIL.GroupBG );
    this.c[4] = UIL.DOM('UIL', 'div','position:absolute; width:10px; height:10px; top:'+(~~(this.h*0.5)-5)+'px; pointer-events:none; background:'+ UIL.F0 );

    var s = this.s;

    s[0].height = this.h + 'px';
    s[1].height = this.h + 'px';
    s[1].top = 4 + 'px';
    s[1].left = 4 + 'px';
    s[1].pointerEvents = 'auto';
    s[1].cursor = 'pointer';
    this.c[1].name = 'group';

    this.uis = [];

    this.c[1].events = [ 'click' ];

    this.init();

    if( this.isOpen ) this.open();

};

UIL.Group.prototype = Object.create( UIL.Proto.prototype );
UIL.Group.prototype.constructor = UIL.Group;

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
    this.s[4].background = UIL.F1;
    this.rSizeContent();

    if( this.isUI ) UIL.main.calc( this.h - this.baseH );

};

UIL.Group.prototype.close = function(){

    if( this.isUI ) UIL.main.calc(-(this.h-this.baseH ));

    this.isOpen = false;
    this.s[4].background = UIL.F0;
    this.h = this.baseH;

    this.s[0].height = this.h + 'px';

};

UIL.Group.prototype.clear = function(){

    this.clearGroup();
    UIL.Proto.prototype.clear.call( this );

};

UIL.Group.prototype.clearGroup = function(){

    var i = this.uis.length;
    while(i--){
        this.uis[i].clear();
        this.uis.pop();
    }
    this.uis = [];
    this.calc();

};

UIL.Group.prototype.calc = function( y ){

    if( !this.isOpen ) return;

    //this.h = this.baseH;

    if( y !== undefined ){ this.h += y; }
    else this.h = this.c[2].offsetHeight + this.baseH;

    //var total = this.c[2].offsetHeight;
    //this.h += total;

    this.s[0].height = this.h + 'px';

};

UIL.Group.prototype.rSizeContent = function(){

    var i = this.uis.length;
    while(i--){
        this.uis[i].setSize();
        this.uis[i].rSize();
    }
    this.calc();

};

UIL.Group.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    var s = this.s;

    s[4].left = ( this.sa + this.sb - 17 ) + 'px';
    s[1].width = this.size + 'px';
    s[2].width = this.size + 'px';

    if(this.isOpen) this.rSizeContent();

};