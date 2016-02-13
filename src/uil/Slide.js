UIL.Slide = function( o ){

    UIL.Proto.call( this, o );

    this.setTypeNumber( o );

    this.old = this.value;
    this.isDown = false;
    this.isOver = false;

    this.c[2] = UIL.DOM('UIL number', 'div', ' text-align:right; width:47px; color:'+ this.fontColor );
    this.c[3] = UIL.DOM('UIL slidebg', 'div', 'top:2px; height:'+(this.h-4)+'px;' );
    this.c[4] = UIL.DOM('UIL', 'div', 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + this.fontColor +';' );

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;

UIL.Slide.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout': this.out( e ); break;

        case 'mouseup': this.up( e ); break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Slide.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            this.c[2].style.color = this.fontColor;
            this.c[4].style.background = this.fontColor;
        break;
        case 1: // over
            this.c[2].style.color = this.colorPlus;
            this.c[4].style.background = this.colorPlus;
        break;
    }
}

UIL.Slide.prototype.over = function( e ){

    this.isOver = true;
    this.mode(1);

};

UIL.Slide.prototype.out = function( e ){

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Slide.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.isOver) this.mode(1);
    else this.mode(0);

    this.sendEnd();
    
};

UIL.Slide.prototype.down = function( e ){

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    this.left = this.c[3].getBoundingClientRect().left;
    this.old = this.value;
    this.move( e );
    //this.mode(2);

};

UIL.Slide.prototype.move = function( e ){

    if( this.isDown ){
        var n = ((( e.clientX - this.left - 4 ) / this.w ) * this.range + this.min ) - this.old;
        if(n >= this.step || n <= this.step){ 
            n = ~~ ( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
        }
    }

};

UIL.Slide.prototype.listen = function( v ){

    this.value = v;
    this.update();

};

UIL.Slide.prototype.update = function( up ){

    var ww = this.w * (( this.value - this.min ) / this.range );
    this.c[4].style.width = ww + 'px';
    this.c[2].textContent = this.value;

    if( up ) this.send();

};

UIL.Slide.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.width = this.sb - 47;
    this.w = this.width - 8;

    var tx = 47;
    if(this.isUI) tx = 57;

    var ty = ~~(this.h * 0.5) - 8;

    if(this.c[1]!==undefined) this.c[1].style.top = ty + 'px';
    this.c[2].style.left = this.size - tx + 'px';
    this.c[2].style.top = ty + 'px';
    this.c[3].style.left = this.sa + 'px';
    this.c[3].style.width = this.width + 'px';
    this.c[4].style.left = (this.sa + 4) + 'px';

    this.update();

};