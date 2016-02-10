UIL.Circular = function( o ){

    UIL.Proto.call( this, o );

    //this.type = 'circular';
    this.autoWidth = false;

    this.setTypeNumber( o );

    this.range = this.max - this.min;

    this.value = o.value || 0;

    this.radius = o.radius || 15;
    
    this.size = (this.radius*2)+20;

    if(o.size !== undefined){
        this.size = o.size;
        this.radius = ~~ (this.size-20)*0.5;
    }

    this.w = this.radius*2;
    this.height = this.radius*2;
    this.h = o.height || (this.height + 40);

    this.twoPi = Math.PI * 2;

    this.top = 0;

    this.c[0].style.width = this.size +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.size +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.percent = 0;

    this.c[2] = UIL.DOM('UIL text', 'div', 'top:'+(this.height+20)+'px; text-align:center; width:'+this.size+'px; padding:3px 5px; color:'+ this.fontColor );

    this.c[3] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = UIL.DOM('UIL svgbox', 'path', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { d:this.makePath(), fill:this.fontColor });
    this.c[5] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { cx:this.radius, cy:this.radius, r:this.radius*0.5, fill:UIL.bgcolor(UIL.COLOR, 1), 'stroke-width':1, stroke:UIL.SVGC });

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    this.update();

};

UIL.Circular.prototype = Object.create( UIL.Proto.prototype );
UIL.Circular.prototype.constructor = UIL.Circular;

UIL.Circular.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout':  this.out( e );  break;

        case 'mouseup':   this.up( e );   break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Circular.prototype.mode = function( mode ){

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
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[4], 'fill', UIL.MOVING );
        break;

    }
}

UIL.Circular.prototype.over = function( e ){

    this.isOver = true;
    this.mode(1);

};

UIL.Circular.prototype.out = function( e ){

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Circular.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.isOver) this.mode(1);
    else this.mode(0);
    

};

UIL.Circular.prototype.down = function( e ){

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    this.rect = this.c[3].getBoundingClientRect();
    this.old = this.value;
    this.oldr = null;
    this.move( e );
    this.mode(2);

};

UIL.Circular.prototype.move = function( e ){

    if( !this.isDown ) return;

    var x = this.radius - (e.clientX - this.rect.left);
    var y = this.radius - (e.clientY - this.rect.top);

    this.r = Math.atan2( y, x ) - (Math.PI * 0.5);
    this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

    if( this.oldr !== null ){ 

        var dif = this.r - this.oldr;
        this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

        if(dif>6) this.r = 0;
        if(dif<-6) this.r = this.twoPi;

    }

    var steps = 1 / this.twoPi;
    var value = this.r * steps;

    var n = ( ( this.range * value ) + this.min ) - this.old;

    if(n >= this.step || n <= this.step){ 
        n = ~~ ( n / this.step );
        this.value = this.numValue( this.old + ( n * this.step ) );
        this.update( true );
        this.old = this.value;
        this.oldr = this.r;
    }

};

UIL.Circular.prototype.makePath = function(){

    var r = this.radius;
    var unit = this.twoPi;  
    var start = 0;
    var end = this.percent * unit - 0.001;
    var x1 = r + r * Math.sin(start);
    var y1 = r - r * Math.cos(start);
    var x2 = r + r * Math.sin(end);
    var y2 = r - r * Math.cos(end);
    var big = end - start > Math.PI ? 1 : 0;
    return "M " + r + "," + r + " L " + x1 + "," + y1 + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2 + " Z";

};

UIL.Circular.prototype.update = function( up ){

    this.c[2].textContent = this.value;
    this.percent = (this.value - this.min) / this.range;
    UIL.setSvg( this.c[4], 'd', this.makePath() );
    if( up ) this.callback(this.value);
    
};