UIL.Button = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || false;

    this.c[2] = UIL.DOM('UIL svgbox', 'rect', '', { width:this.sb, height:17, fill:UIL.bgcolor(UIL.COLOR), 'stroke-width':1, stroke:UIL.SVGC  });
    this.c[3] = UIL.DOM('UIL text', 'div', 'text-align:center;');

    this.c[2].events = [ 'click', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

    this.c[1].textContent = '';
    this.c[3].innerHTML = this.txt;

    this.init();

};

UIL.Button.prototype = Object.create( UIL.Proto.prototype );
UIL.Button.prototype.constructor = UIL.Button;

UIL.Button.prototype.handleEvent = function( e ) {

    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mouseover': this.over(e); break;
        case 'mousedown': this.down(e); break;
        case 'mouseup': this.out(e); break;
        case 'mouseout': this.out(e); break;
    }

}

UIL.Button.prototype.click = function( e ){

    this.callback( this.value );

};

UIL.Button.prototype.over = function( e ){

    this.c[3].style.color = '#FFF';
    UIL.setSvg(this.c[2], 'fill', UIL.SELECT );

};

UIL.Button.prototype.out = function( e ){

    this.c[3].style.color = '#CCC';
    UIL.setSvg(this.c[2], 'fill', UIL.bgcolor(UIL.COLOR) );

};

UIL.Button.prototype.down = function( e ){

    this.c[3].style.color = '#CCC';
    UIL.setSvg(this.c[2], 'fill', UIL.SELECTDOWN );

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

    UIL.setSvg( this.c[2], 'width', this.sb, 0 );

};