UIL.Bool = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'bool';

    this.value = o.value || false;

    this.c[2] = UIL.DOM('UIL svgbox', 'rect', 'width:17px;', {width:17, height:17, fill:UIL.SVGB, 'stroke-width':1, stroke:UIL.SVGC });
    this.c[3] = UIL.DOM('UIL svgbox', 'path','width:17px; pointer-events:none;',{ width:17, height:17, d:'M 4 9 L 6 12 14 4', 'stroke-width':2, stroke:this.fontColor, fill:'none', 'stroke-linecap':'butt' });

    if(!this.value) this.c[3].style.display = 'none';

    this.c[2].events = [ 'click' ];

   

    this.init();

};

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;

UIL.Bool.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click(e); break;
    }

};

UIL.Bool.prototype.click = function( e ){

    if(this.value){
        this.value = false;
        this.c[3].style.display = 'none';
        UIL.setSvg( this.c[2], 'fill', 'rgba(0,0,0,0.2)' );
    } else {
        this.value = true;
        this.c[3].style.display = 'block';
        UIL.setSvg( this.c[2], 'fill', 'rgba(0,0,0,0.4)' );
    }

    this.callback( this.value );

};



UIL.Bool.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.c[2].style.left = this.sa + 'px';
    this.c[3].style.left = this.sa + 'px';

};