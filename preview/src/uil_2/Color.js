UIL.Color = function( o ){
    
    UIL.Proto.call( this, o );

    this.autoHeight = true;

    this.ctype = o.ctype || 'array';
    this.width = this.sb;
    this.oldWidth = 0;

    // color up or down
    this.side = o.side || 'down';
    this.holdTop = 0;
    
    this.wheelWidth = this.width*0.1;
    this.decal = this.h + 2;
    
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    this.baseH = this.h;

    var css = '', actif = 'auto';
    if( this.side === 'up' ){ 
        this.decal = 5;
        css = ' top:auto; bottom:2px;';
        actif = 'none';

    }

    this.c[2] = UIL.DOM('UIL text', 'div',  'height:'+(this.h-4)+'px;' + 'border-radius:6px; pointer-events:auto; cursor:pointer; border:1px solid '+ UIL.Border + '; line-height:'+(this.h-8)+'px;' + css );
    this.c[3] = UIL.DOM('UIL', 'div', 'display:none' );
    this.c[4] = UIL.DOM('UIL', 'div', 'display:none;');
    this.c[5] = UIL.DOM('UIL', 'div', 'pointer-events:'+actif+'; cursor:pointer; display:none;');


    // tmp canvas

    this.canvas_mask = document.createElement( 'canvas' );
    this.canvas_over = document.createElement( 'canvas' );

    this.ctx_mask = this.canvas_mask.getContext('2d');
    this.ctx_over = this.canvas_over.getContext('2d');

    this.ctx_mask.translate( this.mid, this.mid );
    this.ctx_over.translate( this.mid, this.mid );

    this.hsl = null;
    this.value = '#ffffff';
    if( o.value !== undefined ){
        if(o.value instanceof Array) this.value = UIL.rgbToHex( o.value );
        else if(!isNaN(o.value)) this.value = UIL.hexToHtml( o.value );
        else this.value = o.value;
    }

    this.bcolor = null;
    this.isDown = false;
    this.isShow = false;

    this.c[2].events = [ 'click' ];
    this.c[5].events = [ 'mousedown', 'mousemove', 'mouseup', 'mouseout' ];

    this.init();

    this.setColor( this.value );

};

UIL.Color.prototype = Object.create( UIL.Proto.prototype );
UIL.Color.prototype.constructor = UIL.Color;

UIL.Color.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mousedown': this.down(e); break;
        case 'mousemove': this.move(e); break;
        case 'mouseup': this.up(e); break;
        case 'mouseout': this.out(e); break;
    }

};

/////

UIL.Color.prototype.click = function( e ){

    if( !this.isShow ) this.show();
    else this.hide();

};

UIL.Color.prototype.up = function( e ){

    this.isDown = false;

};

UIL.Color.prototype.out = function( e ){

    this.hide();

};

UIL.Color.prototype.down = function( e ){

    if(!this.isShow) return;
    this.isDown = true;
    this.move( e );
    return false;

};

UIL.Color.prototype.move = function ( e ) {

    if(!this.isDown) return;

    this.offset = this.c[5].getBoundingClientRect();
    var pos = { x: e.pageX - this.offset.left - this.mid, y: e.pageY - this.offset.top - this.mid };
    this.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) > (this.square + 2);

    if ( this.circleDrag ) {
        var hue = Math.atan2(pos.x, -pos.y) / 6.28;
        this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);
    } else {
        var sat = Math.max(0, Math.min(1, -( pos.x / this.square * 0.5) + .5) );
        var lum = Math.max(0, Math.min(1, -( pos.y / this.square * 0.5) + .5) );
        this.setHSL([this.hsl[0], sat, lum]);
    }

};

//////

UIL.Color.prototype.maskToImage = function () {

    this.s[4].background = "url(" + this.canvas_mask.toDataURL("image/png")+ ")";

};

UIL.Color.prototype.overToImage = function () {

    this.s[5].background = "url(" + this.canvas_over.toDataURL("image/png")+ ")";

};

//////

UIL.Color.prototype.redraw = function () {

    this.oldWidth = this.width;
    this.drawCircle();
    this.drawMask();
    this.drawMarkers();

    this.maskToImage();

};

UIL.Color.prototype.show = function(){

    if(this.oldWidth!==this.width) this.redraw();
    this.isShow = true;
    this.h = this.width + this.baseH + 10;
    this.s[0].height = this.h+'px';

    if(this.side=='up'){ 
        this.holdTop = this.s[0].top.substring(0,this.s[0].top.length-2) * 1 || 'auto';
        if(!isNaN(this.holdTop)) this.s[0].top = (this.holdTop-(this.h-20))+'px';
        setTimeout(function(){this.s[5].pointerEvents = 'auto';}.bind(this), 100);
    }

    this.s[3].display = 'block';
    this.s[4].display = 'block';
    this.s[5].display = 'block';

    if( this.parentGroup !== null ){ this.parentGroup.calc( this.h - this.baseH );}
    else if( this.isUI ) this.main.calc( this.h - this.baseH );

};

UIL.Color.prototype.hide = function(){

    if( this.parentGroup !== null ){ this.parentGroup.calc( -(this.h-this.baseH) );}
    else if( this.isUI ) this.main.calc( -(this.h-this.baseH) );

    this.isShow = false;
    this.h = this.baseH;
    if(this.side === 'up'){ 
        if(!isNaN(this.holdTop)) this.s[0].top = (this.holdTop)+'px';
        this.s[5].pointerEvents = 'none';
    }
    this.s[0].height = this.h+'px';
    this.s[3].display = 'none';
    this.s[4].display = 'none';
    this.s[5].display = 'none';
    
};

UIL.Color.prototype.update = function( up ){

    this.s[3].background = UIL.rgbToHex( UIL.hslToRgb([this.hsl[0], 1, 0.5]) );

    this.drawMarkers();
    
    this.value = this.bcolor;

    this.s[2].background = this.bcolor;
    this.c[2].textContent = UIL.htmlToHex(this.bcolor);

    this.invert = UIL.findDeepInver( this.rgb );
    this.s[2].color = this.invert ? '#fff' : '#000';;

    if(!up) return;

    if( this.ctype === 'array' ) this.send( this.rgb );
    if( this.ctype === 'rgb' ) this.send( UIL.htmlRgb( this.rgb ) );
    if( this.ctype === 'hex' ) this.send( UIL.htmlToHex( this.value ) );
    if( this.ctype === 'html' ) this.send();

};

UIL.Color.prototype.setColor = function( color ){

    var unpack = UIL.unpack( color );
    if ( this.bcolor != color && unpack ) {
        this.bcolor = color;
        this.rgb = unpack;
        this.hsl = UIL.rgbToHsl( this.rgb );
        this.update();
    }
    return this;

};

UIL.Color.prototype.setHSL = function( hsl ){

    this.hsl = hsl;
    this.rgb = UIL.hslToRgb( hsl );
    this.bcolor = UIL.rgbToHex( this.rgb );
    this.update( true );
    return this;

};

UIL.Color.prototype.calculateMask = function ( sizex, sizey, outputPixel ) {

    var isx = 1 / sizex, isy = 1 / sizey, y, x, s, a, c, l;

    for ( y = 0; y <= sizey; ++y ) {
        l = 1 - y * isy;
        for ( x = 0; x <= sizex; ++x ) {
            s = 1 - x * isx;
            a = 1 - 2 * Math.min( l * s, (1 - l) * s );
            c = (a > 0) ? ( 2 * l - 1 + a ) * 0.5 / a : 0;
            outputPixel( x, y, c, a );
        }
    }

};

UIL.Color.prototype.drawMask = function () {

    var size = this.square * 2, sq = this.square;
    var sz = Math.floor(size / 2);
    var buffer = document.createElement('canvas');
    buffer.width = buffer.height = sz + 1;
    var ctx = buffer.getContext('2d');
    var frame = ctx.getImageData(0, 0, sz + 1, sz + 1);

    var i = 0;
    this.calculateMask( sz, sz, function ( x, y, c, a ) {
        frame.data[i++] = frame.data[i++] = frame.data[i++] = c * 255;
        frame.data[i++] = a * 255;
    });

    ctx.putImageData(frame, 0, 0);
    this.ctx_mask.drawImage( buffer, 0, 0, sz + 1, sz + 1, -sq, -sq, sq * 2, sq * 2 );

};

UIL.Color.prototype.drawCircle = function () {

    var n = 24, r = this.radius, w = this.wheelWidth, nudge = 8 / r / n * Math.PI, m = this.ctx_mask, a1 = 0, color1, d1;
    var ym, am, tan, xm, color2, d2, a2, ar, grad, i;
    m.save();
    m.lineWidth = w / r;
    m.scale(r, r);
    for ( i = 0; i <= n; ++i) {
        d2 = i / n;
        a2 = d2 * Math.PI * 2;
        ar = [ Math.sin(a1), -Math.cos(a1), Math.sin(a2), -Math.cos(a2) ];
        am = (a1 + a2) * 0.5;
        tan = 1 / Math.cos(( a2 - a1 ) * 0.5);
        xm = Math.sin(am) * tan, ym = -Math.cos(am) * tan;
        color2 = UIL.rgbToHex( UIL.hslToRgb([d2, 1, 0.5]) );
        if (i > 0) {
            grad = m.createLinearGradient( ar[0], ar[1], ar[2], ar[3] );
            grad.addColorStop( 0, color1 );
            grad.addColorStop( 1, color2 );
            m.strokeStyle = grad;
            m.beginPath();
            m.moveTo( ar[0], ar[1] );
            m.quadraticCurveTo( xm, ym, ar[2], ar[3] );
            m.stroke();
        }
        a1 = a2 - nudge; 
        color1 = color2;
        d1 = d2;
    }
    m.restore();

};

UIL.Color.prototype.drawMarkers = function () {

    var m = this.markerSize, ra=this.radius, sz = this.width, lw = Math.ceil(m/ 4), r = m - lw + 1, c1 = this.invert ? '#fff' : '#000', c2 = this.invert ? '#000' : '#fff';
    var angle = this.hsl[0] * 6.28;
    var ar = [ Math.sin(angle) * ra, -Math.cos(angle) * ra, 2 * this.square * (.5 - this.hsl[1]), 2 * this.square * (.5 - this.hsl[2]) ];
  
    var circles = [
        { x: ar[2], y: ar[3], r: m, c: c1,     lw: lw },
        { x: ar[2], y: ar[3], r: r, c: c2,     lw: lw + 1 },
        { x: ar[0], y: ar[1], r: m, c: '#fff', lw: lw },
        { x: ar[0], y: ar[1], r: r, c: '#000', lw: lw + 1 },
    ];

    this.ctx_over.clearRect(-this.mid, -this.mid, sz, sz);
    var i = circles.length;
    while(i--){
        var c = circles[i];
        this.ctx_over.lineWidth = c.lw;
        this.ctx_over.strokeStyle = c.c;
        this.ctx_over.beginPath();
        this.ctx_over.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
        this.ctx_over.stroke();
    }

    this.overToImage();

};

UIL.Color.prototype.rSize = function () {

    UIL.Proto.prototype.rSize.call( this );

    this.width = this.sb;
    this.wheelWidth = this.width*0.1;

    if( this.side === 'up' ) this.decal = 5;
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    var s = this.s;

    s[2].width = this.sb + 'px';
    s[2].left = this.sa + 'px';

    s[3].width = (this.square * 2 - 1) + 'px';
    s[3].height = (this.square * 2 - 1) + 'px';
    s[3].top = (this.mid+this.decal )-this.square + 'px';
    s[3].left = (this.mid+this.sa )-this.square + 'px';

    this.canvas_mask.width = this.canvas_over.width = this.width;
    this.canvas_mask.height = this.canvas_over.height = this.width;

    s[4].width = s[4].height = this.width + 'px';
    s[4].left = this.sa + 'px';
    s[4].top = this.decal + 'px';

    s[5].width = s[5].height = this.width + 'px';
    s[5].left = this.sa + 'px';
    s[5].top = this.decal + 'px';

    this.ctx_mask.translate(this.mid, this.mid);
    this.ctx_over.translate(this.mid, this.mid);

    if( this.isShow ){ 
        this.redraw();
        this.h = this.width+30;
        this.c[0].height = this.h + 'px';
        if( this.isUI ) this.main.calc();
    }

};