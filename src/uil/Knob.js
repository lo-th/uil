UIL.Knob = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'knob';
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
    this.h = this.height + 40;

    this.twoPi = Math.PI * 2;
    this.mPI = Math.PI * 0.8;
    this.toDeg = 180 / Math.PI;

    this.top = 0;

    this.c[0].style.width = this.size +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.size +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.percent = 0;

    this.c[2] = UIL.DOM('UIL text', 'div', 'top:'+(this.height+20)+'px; text-align:center; width:'+this.size+'px; padding:3px 5px; color:'+ this.fontColor );

    this.c[3] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius-4, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = UIL.DOM('UIL svgbox', 'path', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { d:this.makeGrad(), 'stroke-width':1, stroke:UIL.SVGC });
    this.c[5] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { cx:this.radius, cy:this.radius, r:this.radius*0.7, fill:UIL.bgcolor(UIL.COLOR, 1), 'stroke-width':1, stroke:UIL.SVGC });

    UIL.DOM( null, 'circle', null, { cx:this.radius, cy:this.radius*0.5, r:3, fill:this.fontColor }, this.c[5] );

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.r = 0;

    this.init();

    this.update();

};

UIL.Knob.prototype = Object.create( UIL.Proto.prototype );
UIL.Knob.prototype.constructor = UIL.Knob;

UIL.Knob.prototype.handleEvent = function( e ) {

    e.preventDefault();
    
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
            UIL.setSvg( this.c[5], 'fill', this.fontColor, 1 );
        break;
        case 1: // over
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
            UIL.setSvg( this.c[5], 'fill', UIL.SELECT, 1 );
        break;
        case 2: // edit
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[5], 'fill', UIL.MOVING, 1 );
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
    this.move( e );
    this.mode(2);

    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

};

UIL.Knob.prototype.move = function( e ){

    if( this.isDown ){

        e.preventDefault(); 
        var rect = this.c[3].getBoundingClientRect();
        var x = this.radius - (e.clientX - rect.left);
        var y = this.radius - (e.clientY - rect.top);
        this.r = Math.atan2( x, y ) *-1;//- Math.PI*0.5;

        if (this.r > this.mPI) this.r = this.mPI;
        if (this.r < -this.mPI) this.r = -this.mPI

        var range = this.mPI - -this.mPI;//this.twoPi;
        //this.r = (((this.r%range)+range)%range);

        if( this.oldr!==null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

        var steps = 1/range;
        //var value = (this.r)*steps;
        var value = (this.r- -this.mPI)*steps;

        this.value = this.numValue( (this.range*value)+this.min );

        this.update( true );

        this.oldr = this.r;
    }

};

UIL.Knob.prototype.makeGrad = function(){

    var d = '';

    var startangle = Math.PI+this.mPI;
    var endangle = Math.PI-this.mPI;
    var step = (startangle-endangle)/this.radius;

    var p90 = Math.PI*0.5;
    var angle = [this.mPI-p90, -this.mPI-p90, 0, Math.PI, Math.PI+p90];
    var r = this.radius;

    var a, x, y, x2, y2;

    for ( var i = 0; i <= this.radius; ++i ) {
        a = startangle-(step*i);
        x = r + Math.sin(a)*r;
        y = r + Math.cos(a)*r;
        x2 = r + Math.sin(a)*(r-3);
        y2 = r + Math.cos(a)*(r-3);
        d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

    }

    
    return d;

};

UIL.Knob.prototype.update = function( up ){

    this.c[2].textContent = this.value;
    this.percent = (this.value - this.min) / this.range;

    var range = this.mPI - -this.mPI;
    this.rr = ( (this.percent*range) - (this.mPI)) * this.toDeg;
    UIL.setSvg( this.c[5], 'transform', 'rotate('+this.rr+' '+this.radius+' '+this.radius+')', 1 );

    //UIL.setSvg( this.c[4], 'd', this.makePath() );
    if( up ) this.callback(this.value);
    
};

/*UIL.Knob.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    //this.c[3].style.left = 10 + 'px';
    //this.c[4].style.left = 10 + 'px';
    //this.c[5].style.left = 10 + 'px';

    //this.update();

};*/