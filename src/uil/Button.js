UIL.Button = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || false;

    this.c[2] = UIL.DOM('UIL', 'div', 'border:1px solid '+UIL.Border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+UIL.bgcolor(UIL.COLOR)+'; height:'+(this.h-2)+'px;' );
    this.c[3] = UIL.DOM('UIL text', 'div', 'text-align:center; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
    this.c[3].style.color = this.fontColor;

    this.c[2].events = [ 'click', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

    if( this.c[1] !== undefined ) this.c[1].textContent = '';
    this.c[3].innerHTML = this.txt;

    this.init();

};

UIL.Button.prototype = Object.create( UIL.Proto.prototype );
UIL.Button.prototype.constructor = UIL.Button;

UIL.Button.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'click': this.click( e ); break;
        case 'mouseover': this.mode( 1 ); break;
        case 'mousedown': this.mode( 2 ); break;
        case 'mouseup': this.mode( 0 ); break;
        case 'mouseout': this.mode( 0 ); break;
    }

};

UIL.Button.prototype.mode = function( mode ){

    var s = this.s;

    switch(mode){
        case 0: // base
            s[3].color = this.fontColor;
            s[2].background = UIL.bgcolor(UIL.COLOR);
        break;
        case 1: // over
            s[3].color = '#FFF';
            s[2].background = UIL.SELECT;
        break;
        case 2: // edit / down
            s[3].color = this.fontColor;
            s[2].background = UIL.SELECTDOWN;
        break;

    }
}

UIL.Button.prototype.click = function( e ){

    this.send();

};

UIL.Button.prototype.label = function( string ){

    this.c[3].textContent = string;

};

UIL.Button.prototype.icon = function( string, y ){

    this.s[3].padding = ( y || 0 )+'px 0px';
    this.c[3].innerHTML = string;

};

UIL.Button.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    var s = this.s;

    s[2].left = this.sa + 'px';
    s[3].left = this.sa + 'px';
    s[2].width = this.sb + 'px';
    s[3].width = this.sb + 'px';

};