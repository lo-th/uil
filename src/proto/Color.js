import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';
import { V2 } from '../core/V2';

function Color ( o ) {
    
    Proto.call( this, o );

    //this.autoHeight = true;

    this.ctype = o.ctype || 'hex';

    this.wfixe = this.sb > 256 ? 256 : this.sb;

    // color up or down
    this.side = o.side || 'down';
    this.up = this.side === 'down' ? 0 : 1;
    
    this.baseH = this.h;

    this.offset = new V2();
    this.decal = new V2();
    this.p = new V2();

    this.c[2] = this.dom( 'div',  this.css.txt + 'height:'+(this.h-4)+'px;' + 'border-radius:'+this.radius+'px; line-height:'+(this.h-8)+'px;' );
    this.s[2] = this.c[2].style;

    if( this.up ){
        this.s[2].top = 'auto';
        this.s[2].bottom = '2px';
    }

    this.c[3] = this.getColorRing();
    this.c[3].style.visibility  = 'hidden';

    this.hsl = null;
    this.value = '#ffffff';
    if( o.value !== undefined ){
        if( o.value instanceof Array ) this.value = Tools.rgbToHex( o.value );
        else if(!isNaN(o.value)) this.value = Tools.hexToHtml( o.value );
        else this.value = o.value;
    }

    this.bcolor = null;
    this.isDown = false;
    this.fistDown = false;

    this.tr = 98;
    this.tsl = Math.sqrt(3) * this.tr;

    this.hue = 0;
    this.d = 256;

    this.setColor( this.value );

    this.init();

    if( o.open !== undefined ) this.open();

}

Color.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Color,

	testZone: function ( mx, my ) {

		var l = this.local;
		if( l.x === -1 && l.y === -1 ) return '';



		if( this.up && this.isOpen ){

			if( l.y > this.wfixe ) return 'title';
		    else return 'color';

		} else {

			if( l.y < this.baseH+2 ) return 'title';
	    	else if( this.isOpen ) return 'color';


		}

    },

	// ----------------------
    //   EVENTS
    // ----------------------

	mouseup: function ( e ) {

	    this.isDown = false;
	    this.d = 256;

	},

	mousedown: function ( e ) {


		var name = this.testZone( e.clientX, e.clientY );


		//if( !name ) return;
		if(name === 'title'){
			if( !this.isOpen ) this.open();
	        else this.close();
	        return true;
		}


		if( name === 'color' ){

			this.isDown = true;
			this.fistDown = true
			this.mousemove( e );
		}
	},

	mousemove: function ( e ) {

	    var name = this.testZone( e.clientX, e.clientY );

	    var off, d, hue, sat, lum, rad, x, y, rr, T = Tools;

	    if( name === 'title' ){

	        this.cursor('pointer');

	    }

	    if( name === 'color' ){

	    	off = this.offset;
		    off.x = e.clientX - ( this.zone.x + this.decal.x + this.mid );
		    off.y = e.clientY - ( this.zone.y + this.decal.y + this.mid );
			d = off.length() * this.ratio;
			rr = off.angle();
			if(rr < 0) rr += 2 * T.PI;
						

	    	if ( d < 128 ) this.cursor('crosshair');
	    	else if( !this.isDown ) this.cursor()

	    	if( this.isDown ){

			    if( this.fistDown ){
			    	this.d = d;
			    	this.fistDown = false;
			    }

			    if ( this.d < 128 ) {

				    if ( this.d > this.tr ) { // outside hue

				        hue = ( rr + T.pi90 ) / T.TwoPI;
				        this.hue = (hue + 1) % 1;
				        this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);

				    } else { // triangle

				    	x = off.x * this.ratio;
				    	y = off.y * this.ratio;

				    	var rr = (this.hue * T.TwoPI) + T.PI;
				    	if(rr < 0) rr += 2 * T.PI;

				    	rad = Math.atan2(-y, x);
				    	if(rad < 0) rad += 2 * T.PI;
						
				    	var rad0 = ( rad + T.pi90 + T.TwoPI + rr ) % (T.TwoPI),
				    	rad1 = rad0 % ((2/3) * T.PI) - (T.pi60),
				    	a    = 0.5 * this.tr,
				    	b    = Math.tan(rad1) * a,
				    	r    = Math.sqrt(x*x + y*y),
				    	maxR = Math.sqrt(a*a + b*b);

				    	if( r > maxR ) {
							var dx = Math.tan(rad1) * r;
							var rad2 = Math.atan(dx / maxR);
							if(rad2 > T.pi60)  rad2 = T.pi60;
						    else if( rad2 < -T.pi60 ) rad2 = -T.pi60;
						
							rad += rad2 - rad1;

							rad0 = (rad + T.pi90  + T.TwoPI + rr) % (T.TwoPI),
							rad1 = rad0 % ((2/3) * T.PI) - (T.pi60);
							b = Math.tan(rad1) * a;
							r = maxR = Math.sqrt(a*a + b*b);
						}

						lum = ((Math.sin(rad0) * r) / this.tsl) + 0.5;
				
						var w = 1 - (Math.abs(lum - 0.5) * 2);
						sat = (((Math.cos(rad0) * r) + (this.tr / 2)) / (1.5 * this.tr)) / w;
						sat = T.clamp( sat, 0, 1 );
						
				        this.setHSL([this.hsl[0], sat, lum]);

				    }
				}
			}
		}

	},

	setHeight: function () {

		this.h = this.isOpen ? this.wfixe + this.baseH + 5 : this.baseH;
		this.s[0].height = this.h + 'px';
		this.zone.h = this.h;

	},

	parentHeight: function ( t ) {

		if ( this.parentGroup !== null ) this.parentGroup.calc( t );
	    else if ( this.isUI ) this.main.calc( t );

	},

	open: function () {

		Proto.prototype.open.call( this );

		this.setHeight();

		if( this.up ) this.zone.y -= this.wfixe + 5;

		var t = this.h - this.baseH;

	    this.s[3].visibility = 'visible';
	    //this.s[3].display = 'block';
	    this.parentHeight( t );

	},

	close: function () {

		Proto.prototype.close.call( this );

		if( this.up ) this.zone.y += this.wfixe + 5;

		var t = this.h - this.baseH;

		this.setHeight();

	    this.s[3].visibility  = 'hidden';
	    //this.s[3].display = 'none';
	    this.parentHeight( -t );

	},

	update: function ( up ) {

	    var cc = Tools.rgbToHex( Tools.hslToRgb([ this.hsl[0], 1, 0.5 ]) );

	    this.moveMarkers();
	    
	    this.value = this.bcolor;

	    this.setSvg( this.c[3], 'fill', cc, 2, 0 );


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

	setColor: function ( color ) {

	    var unpack = Tools.unpack(color);
	    if (this.bcolor != color && unpack) {

	        this.bcolor = color;
	        this.rgb = unpack;
	        this.hsl = Tools.rgbToHsl( this.rgb );

	        this.hue = this.hsl[0];

	        this.update();
	    }
	    return this;

	},

	setHSL: function ( hsl ) {

	    this.hsl = hsl;
	    this.rgb = Tools.hslToRgb( hsl );
	    this.bcolor = Tools.rgbToHex( this.rgb );
	    this.update( true );
	    return this;

	},

	moveMarkers: function () {

		var p = this.p;
		var T = Tools;

	    var c1 = this.invert ? '#fff' : '#000';
	    var a = this.hsl[0] * T.TwoPI;
	    var third = (2/3) * T.PI;
	    var r = this.tr;
	    var h = this.hsl[0];
	    var s = this.hsl[1];
	    var l = this.hsl[2];

	    var angle = ( a - T.pi90 ) * T.todeg;

	    h = - a + T.pi90;

		var hx = Math.cos(h) * r;
		var hy = -Math.sin(h) * r;
		var sx = Math.cos(h - third) * r;
		var sy = -Math.sin(h - third) * r;
		var vx = Math.cos(h + third) * r;
		var vy = -Math.sin(h + third) * r;
		var mx = (sx + vx) / 2, my = (sy + vy) / 2, a  = (1 - 2 * Math.abs(l - .5)) * s;
		var x = sx + (vx - sx) * l + (hx - mx) * a;
		var y = sy + (vy - sy) * l + (hy - my) * a;

	    p.set( x, y ).addScalar(128);

	    //var ff = (1-l)*255;
	    // this.setSvg( this.c[3], 'stroke', 'rgb('+ff+','+ff+','+ff+')', 3 );

	    this.setSvg( this.c[3], 'transform', 'rotate('+angle+' )', 2 );

	    this.setSvg( this.c[3], 'cx', p.x, 3 );
	    this.setSvg( this.c[3], 'cy', p.y, 3 );
	    
	    this.setSvg( this.c[3], 'stroke', this.invert ? '#fff' : '#000', 2, 3 );
	    this.setSvg( this.c[3], 'stroke', this.invert ? '#fff' : '#000', 3 );
	    this.setSvg( this.c[3], 'fill',this.bcolor, 3 );

	},

	rSize: function () {

	    Proto.prototype.rSize.call( this );

	    var s = this.s;

	    s[2].width = this.sb + 'px';
	    s[2].left = this.sa + 'px';

	    this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);
	    this.decal.y = this.side === 'up' ? 2 : this.baseH + 2;
	    this.mid = Math.floor( this.wfixe * 0.5 );


	    this.setSvg( this.c[3], 'viewBox', '0 0 '+this.wfixe+' '+this.wfixe );
	    s[3].width = this.wfixe + 'px';
	    s[3].height = this.wfixe + 'px';
    	s[3].left = this.decal.x + 'px';
	    s[3].top = this.decal.y + 'px';

	    this.ratio = 256/this.wfixe;
	    this.square = 1 / (60*(this.wfixe/256));
	    
	    this.setHeight();
	    
	}

} );

export { Color };