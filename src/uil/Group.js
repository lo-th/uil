UIL.Group = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;

    this.h = 25;

    this.isOpen = o.open || false;

    this.c[2] = UIL.DOM('UIL inner', 'div', 'top:25px');
    this.c[3] = UIL.DOM('UIL', 'div', 'top:2px; left:2px; height:21px; width:6px; background-image:'+ UIL.GroupBG );
    this.c[4] = UIL.DOM('UIL', 'path','position:absolute; width:16px; left:'+(this.sa+this.sb-17)+'px; top:4px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:this.fontColor, fill:'none', 'stroke-linecap':'butt' } );

    this.c[0].style.height = this.h + 'px';
    this.c[1].style.height = this.h + 'px';
    this.c[1].style.top = 4 + 'px';
    this.c[1].style.left = 4 + 'px';
    this.c[1].style.pointerEvents = 'auto';
    this.c[1].style.cursor = 'pointer';
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

UIL.Group.prototype.add = function( type, o ){

    o.target = this.c[2];
    o.isUI = this.isUI;

    UIL.Gui.prototype.add.call( this, type, o );

};

UIL.Group.prototype.open = function(){

    this.isOpen = true;
    UIL.setSvg( this.c[4], 'd','M 12 6 L 8 10 4 6');
    this.rSizeContent();

    if( this.isUI ) UIL.main.calc( this.h -25 );

};

UIL.Group.prototype.close = function(){

    if( this.isUI ) UIL.main.calc(-(this.h-25 ));

    this.isOpen = false;
    UIL.setSvg( this.c[4], 'd','M 6 4 L 10 8 6 12');
    this.h = 25;

    this.c[0].style.height = this.h + 'px';

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

UIL.Group.prototype.calc = function(){

    if( !this.isOpen ) return;
    this.h = 25;

    var total = this.c[2].offsetHeight;
    this.h += total;

    this.c[0].style.height = this.h + 'px';

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

    this.c[4].style.left = ( this.sa + this.sb - 17 ) + 'px';
    this.c[1].style.width = this.size + 'px';
    this.c[2].style.width = this.size + 'px';
    //this.c[3].style.width = (this.size - 4) + 'px';

    if(this.isOpen) this.rSizeContent();

};