UIL.Knob = function( o ){

    UIL.Proto.call( this, o );

    this.setTypeNumber( o );

    this.range = this.max - this.min;

    this.value = o.value || 0;

    this.radius = o.radius || 15;
    this.w = this.radius*2;
    this.height = this.radius*2;
    this.h = (this.radius*2) + 22;

    this.percent = 0;

    this.mPI = Math.PI*0.8;

    //this.c[2] = UIL.DOM( 'UIL text', 'div', 'pointer-events:auto; padding:3px 5px; outlineStyle:none; webkitAppearance:none;' );
    //this.c[2].name = 'input';
    //this.c[2].value = this.value;
    //this.c[2].style.color = this.fontColor;
    //this.c[2].contentEditable = true;
    //this.c[2].textContent = this.value;
    this.c[2] = UIL.DOM('UIL text', 'div', 'top:'+(this.height+2)+'px; text-align:center; width:40px; padding:3px 5px; color:'+ this.fontColor );

    this.c[3] = UIL.DOM('UIL svgbox', 'circle', 'width:'+this.w+'px; height:'+this.height+'px; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = UIL.DOM('UIL svgbox', 'path', 'width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { d:this.makePath(), fill:this.fontColor });
    this.c[5] = UIL.DOM('UIL svgbox', 'circle', 'width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { cx:this.radius, cy:this.radius, r:this.radius*0.5, fill:UIL.bgcolor(UIL.COLOR, 1) });
    
    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];
    //this.c[2].events = [ 'click', 'keydown', 'keyup' ];

    this.init();

    //if(UIL.main) UIL.main.calc();

};

UIL.Knob.prototype = Object.create( UIL.Proto.prototype );
UIL.Knob.prototype.constructor = UIL.Knob;

UIL.Knob.prototype.handleEvent = function( e ) {

    //e.preventDefault();
    //e.stopPropagation();

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout':  this.out( e );  break;

        case 'mouseup':   this.up( e );   break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Knob.prototype.mode = function( mode ){

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

UIL.Knob.prototype.over = function( e ){

    this.isOver = true;
    this.mode(1);

};

UIL.Knob.prototype.out = function( e ){

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Knob.prototype.keydown = function( e ){

    if( e.keyCode === 13 ){ 
        e.preventDefault();
        this.value = e.target.textContent;//e.target.value;
        this.callback( this.value );
        e.target.blur();
    }

};

UIL.Knob.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.isOver) this.mode(1);
    else this.mode(0);
    

};

UIL.Knob.prototype.down = function( e ){

    this.isDown = true;
    this.oldr = null;
    //this.prev = { x:e.clientX, d:0, v:parseFloat(this.value), r:this.r  };
    this.move( e );
    this.mode(2);

    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

};

UIL.Knob.prototype.move = function( e ){

    if( this.isDown ){
        e.preventDefault(); 
        var rect = this.c[3].getBoundingClientRect();
        //var x = e.clientX - (rect.left + this.radius);
        //var y = e.clientY - (rect.top + this.radius);

        var x = this.radius - (e.clientX - rect.left);
        var y = this.radius - (e.clientY - rect.top);
        this.r = Math.atan2(y, x) - Math.PI*0.5;

        var range = Math.PI*2;
        this.r = (((this.r%range)+range)%range);

        if(this.oldr!==null) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

        var steps = 1/range;
        var value = (this.r)*steps;

        this.value = this.numValue( (this.range*value)+this.min );

        this.oldr = this.r;

        this.update( true );
    }

};

UIL.Knob.prototype.makePath = function(){

    var r = this.radius;
    var unit = ( Math.PI * 2 );  
    var start = 0;
    var end = this.percent * unit - 0.001;
    var x1 = r + r * Math.sin(start);
    var y1 = r - r * Math.cos(start);
    var x2 = r + r * Math.sin(end);
    var y2 = r - r * Math.cos(end);
    var big = end - start > Math.PI ? 1 : 0;
    return "M " + r + "," + r + " L " + x1 + "," + y1 + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2 + " Z";

};

UIL.Knob.prototype.update = function( up ){

    this.c[2].textContent = this.value;

    this.percent = (this.value - this.min) / this.range;

    UIL.setSvg( this.c[4], 'd', this.makePath() );
    if( up ) this.callback(this.value);
    
};

UIL.Knob.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.c[2].style.left = (this.sa+(this.radius-20)) + 'px';
    this.c[3].style.left = this.sa + 'px';
    //this.c[2].style.width = this.sb + 'px';

    this.update();

};