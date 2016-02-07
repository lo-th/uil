UIL.Slide = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'slide';

    this.setTypeNumber( o );

    this.range = this.max - this.min;
    this.width = UIL.BW - 40;
    this.w = this.width - 8;

    this.h = o.height || 20;
    this.h = this.h < 11 ? 11 : this.h;

    //this.height = this.h - 3;
    this.value = o.value || 0;
    this.isDown = false;
    this.isOver = false;

    var ty = (o.height * 0.5) - 10;

    if(this.c[1]!==undefined) this.c[1].style.top = ty+'px';

    this.c[2] = UIL.DOM('UIL text', 'div', 'top:'+ty+'px; text-align:right; width:40px; padding:3px 5px; color:'+ this.fontColor );
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+(this.h-3)+'px; cursor:w-resize;', { width:'100%', height:this.h-3, fill:UIL.SVGB, 'stroke-width':1, stroke:UIL.SVGC });
    this.c[4] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+(this.h-3)+'px; pointer-events:none;', { x:4, y:4, width:this.width-8, height:this.h-10, fill: this.fontColor });
    
    // pattern test
    UIL.DOM( null, 'defs', null, {}, this.c[3] );
    UIL.DOM( null, 'pattern', null, {id:'sripe', x:0, y:0, width:10, height:10, patternUnits:'userSpaceOnUse' }, this.c[3], 1 );
    UIL.DOM( null, 'line', null, { x1:5, x2:0, y1:0, y2:10, stroke:UIL.SVGC, 'stroke-width':1  }, this.c[3].childNodes[1], 0 );
    UIL.DOM( null, 'line', null, { x1:10, x2:5, y1:0, y2:10, stroke:UIL.SVGC, 'stroke-width':1  }, this.c[3].childNodes[1], 0 );

    //console.log(this.c[3])

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    //if(UIL.main) UIL.main.calc();

};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;

UIL.Slide.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

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
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[4], 'fill', this.fontColor );
        break;
        case 1: // over
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
            UIL.setSvg( this.c[4], 'fill', UIL.SELECT );
        break;
        case 2: // edit
            UIL.setSvg( this.c[3], 'fill','url(#sripe)');
            UIL.setSvg( this.c[4], 'fill', UIL.MOVING );
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
    

};

UIL.Slide.prototype.down = function( e ){

    this.isDown = true;
    this.prev = { x:e.clientX, d:0, v:parseFloat(this.value) };
    this.move( e );
    this.mode(2);

    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

};

UIL.Slide.prototype.move = function( e ){

    if( this.isDown ){
        e.preventDefault(); 
        var rect = this.c[3].getBoundingClientRect();
        var n = (((( e.clientX - rect.left - 4 ) / this.w ) * this.range + this.min )-this.prev.v);
        if(n > this.step || n < this.step){ 
            n = ~~ ( n / this.step );
            this.value = this.numValue( this.prev.v + ( n * this.step ) );
            this.update( true );
            this.prev.v = this.value;
        }
    }

};

UIL.Slide.prototype.update = function( up ){

    var ww = (this.w * ((this.value-this.min)/this.range));
    UIL.setSvg( this.c[4], 'width', ww );
    this.c[2].textContent = this.value;
    if( up ) this.callback(this.value);

};

UIL.Slide.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.width = this.sb - 40;
    this.w = this.width - 8;

    this.c[2].style.left = this.size - 50 + 'px';
    this.c[3].style.left = this.sa + 'px';
    this.c[3].style.width = this.width + 'px';
    this.c[4].style.left = this.sa + 'px';
    this.c[4].style.width = this.width + 'px';
    
    this.update();

};