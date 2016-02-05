UIL.Group = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'group';

    this.h = 25;

    this.isOpen = o.open || false;

    this.c[2] = UIL.DOM('UIL', 'div', 'top:25px; overflow:hidden; height:auto;');
    this.c[3] = UIL.DOM('UIL', 'path','position:absolute; width:16px; left:'+(this.sa+this.sb-17)+'px; top:4px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:this.fontColor, fill:'none', 'stroke-linecap':'butt' } );

    this.c[0].style.height = this.h + 'px';
    this.c[1].style.height = this.h + 'px';
    this.c[1].style.top = 4 + 'px';
    this.c[1].style.pointerEvents = 'auto';
    this.c[1].style.cursor = 'pointer';
    this.c[1].name = 'group';

    this.uis = [];

    this.c[1].events = [ 'click' ];

    this.init();

    if( this.isOpen ) this.open();
    if( UIL.main ) UIL.main.calc();

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

    //if( UIL.main ) UIL.main.calc();

};



UIL.Group.prototype.add = function(type, obj){
    obj.target = this.c[2];
    UIL.Gui.prototype.add.call( this, type, obj );
};



UIL.Group.prototype.open = function(){

    this.isOpen = true;
    UIL.setSvg( this.c[3], 'd','M 12 6 L 8 10 4 6');
    this.calc();

    if(UIL.main) UIL.main.calc( this.h-25 );

};

UIL.Group.prototype.close = function(){

    if(UIL.main) UIL.main.calc(-(this.h-25));
    this.isOpen = false;
    UIL.setSvg( this.c[3], 'd','M 6 4 L 10 8 6 12');
    this.h = 25;

    //this.c[2].style.height = 0 + 'px';
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
    var i = this.uis.length;
    while(i--) this.h += this.uis[i].h;


    //this.h = this.c[2].clientHeight + 25;

    //this.c[2].style.height = ( this.h - 25 ) + 'px';
    this.c[0].style.height = this.h + 'px';

};

UIL.Group.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.c[3].style.left = ( this.sa + this.sb - 17 ) + 'px';
    this.c[1].style.width = this.size + 'px';
    this.c[2].style.width = this.size + 'px';

    var i = this.uis.length;
    while(i--){
        this.uis[i].setSize();
        this.uis[i].rSize();
    }
    this.calc();

};