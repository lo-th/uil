import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function Color ( o ) {
    
    Proto.call( this, o );

    this.autoHeight = true;

    this.ctype = o.ctype || 'array';
    this.ww = this.sb;
    this.oldWidth = 0;

    // color up or down
    this.side = o.side || 'down';
    this.holdTop = 0;
    
    this.wheelWidth = this.ww*0.1;
    this.decal = this.h + 2;
    
    this.colorRadius = (this.ww - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.colorRadius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.ww * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    this.baseH = this.h;

    //this.c[2] = Tools.dom( 'div',  Tools.css.txt + 'height:'+(this.h-4)+'px;' + 'border-radius:3px; pointer-events:auto; cursor:pointer; border:1px solid '+ Tools.colors.border + '; line-height:'+(this.h-8)+'px;' );
    this.c[2] = Tools.dom( 'div',  Tools.css.txt + 'height:'+(this.h-4)+'px;' + 'border-radius:'+this.radius+'px; pointer-events:auto; cursor:pointer; line-height:'+(this.h-8)+'px;' );

    this.s[2] = this.c[2].style;

    if(this.side === 'up'){
        this.decal = 5;
        this.s[2].top = 'auto';
        this.s[2].bottom = '2px';
    }

    this.c[3] = Tools.dom( 'div', Tools.css.basic + 'display:none' );
    this.c[4] = Tools.dom( 'canvas', Tools.css.basic + 'display:none;');
    this.c[5] = Tools.dom( 'canvas', Tools.css.basic + 'pointer-events:auto; cursor:pointer; display:none;');

    this.s[3] = this.c[3].style;
    this.s[5] = this.c[5].style;

    if(this.side === 'up') this.s[5].pointerEvents = 'none';

    this.c[4].width = this.c[4].height = this.ww;
    this.c[5].width = this.c[5].height = this.ww;

    this.ctxMask = this.c[4].getContext('2d');
    this.ctxOverlay = this.c[5].getContext('2d');
    this.ctxMask.translate(this.mid, this.mid);
    this.ctxOverlay.translate(this.mid, this.mid);

    this.hsl = null;
    this.value = '#ffffff';
    if( o.value !== undefined ){
        if(o.value instanceof Array) this.value = Tools.rgbToHex( o.value );
        else if(!isNaN(o.value)) this.value = Tools.hexToHtml( o.value );
        else this.value = o.value;
    }
    this.bcolor = null;
    this.isDown = false;
    this.isDraw = false;

    this.c[2].events = [ 'click' ];
    this.c[5].events = [ 'mousedown', 'mousemove', 'mouseup', 'mouseout' ];

    this.setColor( this.value );

    this.init();

    if( o.open !== undefined ) this.open();

};

Color.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Color,

	handleEvent: function( e ) {

	    e.preventDefault();
	    e.stopPropagation();

	    switch( e.type ) {
	        case 'click': this.click(e); break;
	        case 'mousedown': this.down(e); break;
	        case 'mousemove': this.move(e); break;
	        case 'mouseup': this.up(e); break;
	        case 'mouseout': this.out(e); break;
	    }

	},

	// ACTION

	click: function( e ){

	    if( !this.isOpen ) this.open();
	    else this.close();

	},

	up: function( e ){

	    this.isDown = false;

	},

	out: function( e ){

	    if( this.isOpen ) this.close();

	},

	down: function( e ){

	    if(!this.isOpen) return;
	    this.isDown = true;
	    this.move( e );
	    //return false;

	},

	move: function( e ){

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

	},


	//////

	redraw: function(){

	    
	    this.drawCircle();
	    this.drawMask();
	    this.drawMarkers();

	    this.oldWidth = this.ww;
	    this.isDraw = true;

	    //console.log(this.isDraw)

	},

	open: function(){

		Proto.prototype.open.call( this );

	    if( this.oldWidth !== this.ww ) this.redraw();

	    this.h = this.ww + this.baseH + 10;
	    this.s[0].height = this.h + 'px';

	    if( this.side === 'up' ){ 
	        this.holdTop = this.s[0].top.substring(0,this.s[0].top.length-2) * 1 || 'auto';
	        if(!isNaN(this.holdTop)) this.s[0].top = (this.holdTop-(this.h-20))+'px';
	        setTimeout(function(){this.s[5].pointerEvents = 'auto';}.bind(this), 100);
	    }

	    this.s[3].display = 'block';
	    this.s[4].display = 'block';
	    this.s[5].display = 'block';

	    var t = this.h - this.baseH;

	    if ( this.parentGroup !== null ) this.parentGroup.calc( t );
	    else if ( this.isUI ) this.main.calc( t );

	    console.log('open')

	},

	close: function(){

	    Proto.prototype.close.call( this );

	    var t = this.h - this.baseH;

	    if ( this.parentGroup !== null ) this.parentGroup.calc( -t );
	    else if ( this.isUI ) this.main.calc( -t ); 

	    
	    this.h = this.baseH;
	    if(this.side === 'up'){ 
	        if(!isNaN(this.holdTop)) this.s[0].top = (this.holdTop)+'px';
	        this.s[5].pointerEvents = 'none';
	    }
	    this.s[0].height = this.h+'px';
	    this.s[3].display = 'none';
	    this.s[4].display = 'none';
	    this.s[5].display = 'none';

	    console.log('close')
	    
	},

	update: function( up ){

	    this.s[3].background = Tools.rgbToHex( Tools.hslToRgb([this.hsl[0], 1, 0.5]) );

	    this.drawMarkers();
	    
	    this.value = this.bcolor;

	    this.s[2].background = this.bcolor;
	    this.c[2].textContent = Tools.htmlToHex( this.bcolor );

	    this.invert = Tools.findDeepInver( this.rgb );
	    this.s[2].color = this.invert ? '#fff' : '#000';

	    if(!up) return;

	    if( this.ctype === 'array' ) this.send( this.rgb );
	    if( this.ctype === 'rgb' ) this.send( Tools.htmlRgb( this.rgb ) );
	    if( this.ctype === 'hex' ) this.send( Tools.htmlToHex( this.value ) );
	    if( this.ctype === 'html' ) this.send();

	},

	setColor: function( color ){

	    var unpack = Tools.unpack(color);
	    if (this.bcolor != color && unpack) {
	        this.bcolor = color;
	        this.rgb = unpack;
	        this.hsl = Tools.rgbToHsl( this.rgb );
	        this.update();
	    }
	    return this;

	},

	setHSL: function( hsl ){

	    this.hsl = hsl;
	    this.rgb = Tools.hslToRgb( hsl );
	    this.bcolor = Tools.rgbToHex( this.rgb );
	    this.update( true );
	    return this;

	},

	calculateMask: function( sizex, sizey, outputPixel ){

	    var isx = 1 / sizex, isy = 1 / sizey;
	    for (var y = 0; y <= sizey; ++y) {
	        var l = 1 - y * isy;
	        for (var x = 0; x <= sizex; ++x) {
	            var s = 1 - x * isx;
	            var a = 1 - 2 * Math.min(l * s, (1 - l) * s);
	            var c = (a > 0) ? ((2 * l - 1 + a) * .5 / a) : 0;
	            outputPixel(x, y, c, a);
	        }
	    }

	},

	drawMask: function(){

	    var size = this.square * 2, sq = this.square;
	    var sz = Math.floor(size / 2);
	    var buffer = document.createElement('canvas');
	    buffer.width = buffer.height = sz + 1;
	    var ctx = buffer.getContext('2d');
	    var frame = ctx.getImageData(0, 0, sz + 1, sz + 1);

	    var i = 0;
	    this.calculateMask(sz, sz, function (x, y, c, a) {
	        frame.data[i++] = frame.data[i++] = frame.data[i++] = c * 255;
	        frame.data[i++] = a * 255;
	    });

	    ctx.putImageData(frame, 0, 0);
	    this.ctxMask.drawImage(buffer, 0, 0, sz + 1, sz + 1, -sq, -sq, sq * 2, sq * 2);

	},

	drawCircle: function(){

	    var n = 24,r = this.colorRadius, w = this.wheelWidth, nudge = 8 / r / n * Math.PI, m = this.ctxMask, a1 = 0, color1, d1;
	    var ym, am, tan, xm, color2, d2, a2, ar;
	    m.save();
	    m.lineWidth = w / r;
	    m.scale(r, r);
	    for (var i = 0; i <= n; ++i) {
	        d2 = i / n;
	        a2 = d2 * Math.PI * 2;
	        ar = [Math.sin(a1), -Math.cos(a1), Math.sin(a2), -Math.cos(a2)];
	        am = (a1 + a2) * 0.5;
	        tan = 1 / Math.cos((a2 - a1) * 0.5);
	        xm = Math.sin(am) * tan, ym = -Math.cos(am) * tan;
	        color2 = Tools.rgbToHex( Tools.hslToRgb([d2, 1, 0.5]) );
	        if (i > 0) {
	            var grad = m.createLinearGradient(ar[0], ar[1], ar[2], ar[3]);
	            grad.addColorStop(0, color1);
	            grad.addColorStop(1, color2);
	            m.strokeStyle = grad;
	            m.beginPath();
	            m.moveTo(ar[0], ar[1]);
	            m.quadraticCurveTo(xm, ym, ar[2], ar[3]);
	            m.stroke();
	        }
	        a1 = a2 - nudge; 
	        color1 = color2;
	        d1 = d2;
	    }
	    m.restore();

	},

	drawMarkers: function(){

	    var m = this.markerSize, ra=this.colorRadius, sz = this.ww, lw = Math.ceil(m/ 4), r = m - lw + 1, c1 = this.invert ? '#fff' : '#000', c2 = this.invert ? '#000' : '#fff';
	    var angle = this.hsl[0] * 6.28;
	    var ar = [Math.sin(angle) * ra, -Math.cos(angle) * ra, 2 * this.square * (.5 - this.hsl[1]), 2 * this.square * (.5 - this.hsl[2]) ];
	  
	    var circles = [
	        { x: ar[2], y: ar[3], r: m, c: c1,     lw: lw },
	        { x: ar[2], y: ar[3], r: r, c: c2,     lw: lw + 1 },
	        { x: ar[0], y: ar[1], r: m, c: '#fff', lw: lw },
	        { x: ar[0], y: ar[1], r: r, c: '#000', lw: lw + 1 },
	    ];
	    this.ctxOverlay.clearRect(-this.mid, -this.mid, sz, sz);
	    var i = circles.length;
	    while(i--){
	        var c = circles[i];
	        this.ctxOverlay.lineWidth = c.lw;
	        this.ctxOverlay.strokeStyle = c.c;
	        this.ctxOverlay.beginPath();
	        this.ctxOverlay.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
	        this.ctxOverlay.stroke();
	    }

	},

	rSize: function(){

	    Proto.prototype.rSize.call( this );

	    this.ww = this.sb;
	    this.wheelWidth = this.ww*0.1;

	    if( this.side === 'up' ) this.decal = 5;
	    this.colorRadius = (this.ww - this.wheelWidth) * 0.5 - 1;
	    this.square = Math.floor((this.colorRadius - this.wheelWidth * 0.5) * 0.7) - 1;
	    this.mid = Math.floor(this.ww * 0.5 );
	    this.markerSize = this.wheelWidth * 0.3;

	    var s = this.s;

	    s[2].width = this.sb + 'px';
	    s[2].left = this.sa + 'px';

	    s[3].width = (this.square * 2 - 1) + 'px';
	    s[3].height = (this.square * 2 - 1) + 'px';
	    s[3].top = (this.mid+this.decal )-this.square + 'px';
	    s[3].left = (this.mid+this.sa )-this.square + 'px';

	    this.c[4].width = this.c[4].height = this.ww;
	    s[4].left = this.sa + 'px';
	    s[4].top = this.decal + 'px';

	    this.c[5].width = this.c[5].height = this.ww;
	    s[5].left = this.sa + 'px';
	    s[5].top = this.decal + 'px';

	    this.ctxMask.translate(this.mid, this.mid);
	    this.ctxOverlay.translate(this.mid, this.mid);

	    if( this.isOpen ){ 
	        this.redraw();

	        //this.open();
	        //this.h = this.ww+30;
	        //this.c[0].height = this.h + 'px';
	        //if( this.isUI ) this.main.calc();
	    }

	}

} );

export { Color };