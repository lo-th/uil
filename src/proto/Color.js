import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';
import { V2 } from '../core/V2';

function Color ( o ) {
    
    Proto.call( this, o );

    //this.autoHeight = true;

    this.ctype = o.ctype || 'array';

    this.wfixe = this.sb > 256 ? 256 : this.sb;

    // color up or down
    this.side = o.side || 'down';
    this.up = this.side === 'down' ? 0 : 1;
    
    this.baseH = this.h;

    this.offset = new V2();
    this.decal = new V2();

    //this.c[0].style.background = '#FF0000'

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

    this.triangleRadius = 98;
    this.triangleSideLength = Math.sqrt(3) * this.triangleRadius;

    this.hue = 0;
	//this.saturation = 0;
	//this.lightness = 0;

	this.p = new V2();

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

	/*down: function( e ){

	    if(!this.isOpen) return;
	    this.isDown = true;
	    this.move( e );
	    //return false;


	},*/

	mousemove: function ( e ) {

	    var name = this.testZone( e.clientX, e.clientY );

	    var off, d, hue, sat, lum, rad, x, y, rr;

	    if( name === 'title' ){

	        this.cursor('pointer');

	    }

	    if( name === 'color' ){

	    	off = this.offset;
		    off.x = e.clientX - ( this.zone.x + this.decal.x + this.mid );
		    off.y = e.clientY - ( this.zone.y + this.decal.y + this.mid );
			d = off.length() * this.ratio;
			rr = off.angle();
			if(rr < 0) rr += 2 * Tools.PI;
						

	    	if ( d < 128 ) this.cursor('crosshair');
	    	else if( !this.isDown ) this.cursor()

	    	if( this.isDown ){

			    if( this.fistDown ){
			    	this.d = d;
			    	this.fistDown = false;
			    }

			    if ( this.d < 128 ) {

				    if ( this.d > this.triangleRadius ) { // outside round

				        hue = ( rr + Tools.pi90 ) / Tools.TwoPI;
				        this.hue = (hue + 1) % 1;
				        this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);

				    } else { // triangle

				    	x = (off.x )* this.ratio;
				    	y = (off.y )* this.ratio;

				    	var rr = (this.hue * Tools.TwoPI) + Tools.PI;
				    	if(rr < 0) rr += 2 * Tools.PI;

				    	rad = Math.atan2(-y, x);
				    	if(rad < 0) rad += 2 * Tools.PI;
						

				    	//var rad0 = (rad - Tools.pi90 + Tools.TwoPI - this.hue) % (Tools.TwoPI),
				    	var rad0 = ( rad + Tools.pi90 + Tools.TwoPI +rr ) % (Tools.TwoPI),
				    	rad1 = rad0 % ((2/3) * Tools.PI) - (Tools.PI/3),
				    	a    = 0.5 * this.triangleRadius,
				    	b    = Math.tan(rad1) * a,
				    	r    = Math.sqrt(x*x + y*y), // Pythagoras
				    	maxR = Math.sqrt(a*a + b*b); // Pythagoras

				    	if(r > maxR) {
							var dx = Math.tan(rad1) * r;
							var rad2 = Math.atan(dx / maxR);
							if(rad2 > Tools.PI/3) {
								rad2 = Tools.PI/3;
							} else if(rad2 < -Tools.PI/3) {
								rad2 = -Tools.PI/3;
							}
							rad += rad2 - rad1;

							//rad0 = (rad + Tools.TwoPI - this.hue) % (Tools.TwoPI);
							rad0 = (rad + Tools.pi90  + Tools.TwoPI +rr) % (Tools.TwoPI),
							rad1 = rad0 % ((2/3) * Tools.PI) - (Tools.PI/3);
							b = Math.tan(rad1) * a;
							r = maxR = Math.sqrt(a*a + b*b); // Pythagoras
						}

						lum = ((Math.sin(rad0) * r) / this.triangleSideLength) + 0.5
				
						var widthShare = 1 - (Math.abs(lum - 0.5) * 2);
						sat = (((Math.cos(rad0) * r) + (this.triangleRadius / 2)) / (1.5 * this.triangleRadius)) / widthShare;
						sat = Math.max(0, sat); // cannot be lower than 0
						sat = Math.min(1, sat); // cannot be greater than 1
						
				        this.setHSL([this.hsl[0], sat, lum]);

				    }
				}
			}
		}

	    //console.log(this.isDraw)


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

	    //this.setSvg( this.c[3], 'fill', cc, 2 );
	    this.setSvg( this.c[3], 'fill', cc, 3, 0 );


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

	    var sr = 60
	    var ra = 128-15; 
	    var c1 = this.invert ? '#fff' : '#000';
	    var a = this.hsl[0] * Tools.TwoPI;
	    var third = (2/3) * Tools.PI;
	    var r = this.triangleRadius;
	    var h = this.hsl[0];
	    var s = this.hsl[1];
	    var l = this.hsl[2];

	    var angle = ( a-Tools.pi90 ) * Tools.todeg;

	    this.setSvg( this.c[3], 'transform', 'rotate('+angle+' )', 3 );

	    p.set( Math.sin(a) * ra, -Math.cos(a) * ra ).addScalar(128);
	    this.setSvg( this.c[3], 'cx', p.x, 2 );
	    this.setSvg( this.c[3], 'cy', p.y, 2 );
	    
	    
	    h = -a+Tools.pi90;
        // Colored point
		var hx = this.hx =  Math.cos(h) * r;
		var hy = this.hy = -Math.sin(h) * r;
		// Black point
		var sx = this.sx =  Math.cos(h - third) * r;
		var sy = this.sy = -Math.sin(h - third) * r;
		// White point
		var vx = this.vx =  Math.cos(h + third) * r;
		var vy = this.vy = -Math.sin(h + third) * r;
		// Current point
		var mx = (sx + vx) / 2, my = (sy + vy) / 2, a  = (1 - 2 * Math.abs(l - .5)) * s;
		var x = sx + (vx - sx) * l + (hx - mx) * a;
		var y = sy + (vy - sy) * l + (hy - my) * a;

	    p.set( x, y ).addScalar(128);



	    this.setSvg( this.c[3], 'cx', p.x, 4 );
	    this.setSvg( this.c[3], 'cy', p.y, 4 );
	    var ff = (1-l)*255;
	    this.setSvg( this.c[3], 'stroke', 'rgb('+ff+','+ff+','+ff+')', 4 );

	    

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

	   /* this.c[4].width = this.c[4].height = this.ww;
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
	    }*/


	    this.ratio = 256/this.wfixe;
	    this.square = 1 / (60*(this.wfixe/256));
	    
	    this.setHeight();
	    
	}

} );

export { Color };