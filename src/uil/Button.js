UIL.Button = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || false;

    this.c[2] = UIL.DOM('UIL button', 'div', 'background:'+UIL.bgcolor(UIL.COLOR)+'; height:18px' );
    this.c[3] = UIL.DOM('UIL text', 'div', 'text-align:center;');
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
    e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click( e ); break;
        case 'mouseover': this.mode( 1 ); break;
        case 'mousedown': this.mode( 2 ); break;
        case 'mouseup': this.mode( 0 ); break;
        case 'mouseout': this.mode( 0 ); break;
    }

};

UIL.Button.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            this.c[3].style.color = this.fontColor;
            this.c[2].style.background = UIL.bgcolor(UIL.COLOR);
            //this.c[3].style.background = UIL.bgcolor(UIL.COLOR);
            //UIL.setSvg(this.c[2], 'fill', UIL.bgcolor(UIL.COLOR) );
        break;
        case 1: // over
            this.c[3].style.color = '#FFF';
            this.c[2].style.background = UIL.SELECT;
            //this.c[3].style.background = UIL.SELECT;
            //UIL.setSvg(this.c[2], 'fill', UIL.SELECT );
        break;
        case 2: // edit / down
            this.c[3].style.color = this.fontColor;
            this.c[2].style.background = UIL.SELECTDOWN;
            //this.c[3].style.background = UIL.SELECTDOWN;
            //UIL.setSvg(this.c[2], 'fill', UIL.SELECTDOWN );
        break;

    }
}

UIL.Button.prototype.click = function( e ){

    this.send();

};

UIL.Button.prototype.label = function( string ){

    this.c[3].textContent = string;

};

UIL.Button.prototype.icon = function( string ){

    this.c[3].style.padding = '0px 0px';
    this.c[3].innerHTML = string;

};

UIL.Button.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.c[2].style.left = this.sa + 'px';
    this.c[3].style.left = this.sa + 'px';
    this.c[2].style.width = this.sb + 'px';
    this.c[3].style.width = this.sb + 'px';

};