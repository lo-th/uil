UIL.Slide = function( o ){

    UIL.Proto.call( this, o );

    this.setTypeNumber( o );

    this.range = this.max - this.min;
    this.width = UIL.BW - 40;
    this.w = this.width - 8;
    this.height = 17;
    this.value = o.value || 0;
    this.isDown = false;

    this.c[2] = UIL.DOM('UIL text', 'div', 'text-align:right; width:40px; padding:3px 5px;');
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+this.height+'px; cursor:w-resize;', { width:this.width, height:this.height, fill:UIL.SVGB, 'stroke-width':1, stroke:UIL.SVGC });
    this.c[4] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+this.height+'px; pointer-events:none;', { x:4, y:4, width:this.width-8, height:this.height-8, fill:'#CCC', 'stroke-width':1, stroke:UIL.SVGC });

    //this.c[3].events = [ 'mouseover', 'mousedown', 'mouseup', 'mouseout', 'mousemove' ];
    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;

UIL.Slide.prototype.handleEvent = function( e ) {

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout': this.out( e ); break;

        case 'mouseup': this.up( e ); break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Slide.prototype.over = function( e ){

    UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
    UIL.setSvg( this.c[4], 'fill', UIL.SELECT );

};

UIL.Slide.prototype.out = function( e ){

    if(this.isDown) return;
    UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
    UIL.setSvg( this.c[4], 'fill','#CCC');

};

UIL.Slide.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
    UIL.setSvg( this.c[4], 'fill','#CCC');

};

UIL.Slide.prototype.down = function( e ){

    this.isDown = true;
    this.prev = { x:e.clientX, d:0, v:parseFloat(this.value) };
    this.move( e );

    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

};

UIL.Slide.prototype.move = function( e ){

    if( this.isDown ){
        e.preventDefault(); 
        var rect = this.c[3].getBoundingClientRect();
        var n = (((( e.clientX - rect.left - 4 ) / this.w) * this.range + this.min )-this.prev.v);
        if(n > this.step || n < this.step){ 
            n = ~~(n/this.step);//.toFixed(0)*1;
            this.value = this.numValue( this.prev.v + ( n * this.step ) );
            this.updatePos( true );
            this.prev.v = this.value;
        }
    }

};

UIL.Slide.prototype.updatePos = function( up ){

    var ww = (this.w * ((this.value-this.min)/this.range));
    UIL.setSvg( this.c[4], 'width', ww );
    this.c[2].innerHTML = this.value;
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

    UIL.setSvg( this.c[3], 'width', this.width );
    
    this.updatePos();

};