(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.UIL = global.UIL || {})));
}(this, (function (exports) { 'use strict';

	// Polyfills

	if ( Number.EPSILON === undefined ) {

		Number.EPSILON = Math.pow( 2, - 52 );

	}

	//

	if ( Math.sign === undefined ) {

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign

		Math.sign = function ( x ) {

			return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : + x;

		};

	}

	if ( Function.prototype.name === undefined ) {

		// Missing in IE9-11.
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name

		Object.defineProperty( Function.prototype, 'name', {

			get: function () {

				return this.toString().match( /^\s*function\s*([^\(\s]*)/ )[ 1 ];

			}

		} );

	}

	if ( Object.assign === undefined ) {

		// Missing in IE.
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

		( function () {

			Object.assign = function ( target ) {

				'use strict';

				if ( target === undefined || target === null ) {

					throw new TypeError( 'Cannot convert undefined or null to object' );

				}

				var output = Object( target );

				for ( var index = 1; index < arguments.length; index ++ ) {

					var source = arguments[ index ];

					if ( source !== undefined && source !== null ) {

						for ( var nextKey in source ) {

							if ( Object.prototype.hasOwnProperty.call( source, nextKey ) ) {

								output[ nextKey ] = source[ nextKey ];

							}

						}

					}

				}

				return output;

			};

		} )();

	}

	/**
	 * @author lo-th / https://github.com/lo-th
	 */

	var Tools = {

	    main: null,

	    doc: document,
	    frag: document.createDocumentFragment(),

	    URL: window.URL || window.webkitURL,

	    isLoop: false,
	    listens: [],

	    svgns: "http://www.w3.org/2000/svg",
	    htmls: "http://www.w3.org/1999/xhtml",

	    DOM_SIZE: [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'],
	    SVG_TYPE_D: [ 'pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient', 'animateMotion' ],
	    SVG_TYPE_G: [ 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject' ],

	    size: {
	        
	        w: 240,
	        h: 20,
	        p: 30,
	        s: 20,

	    },

	    // colors

	    colors: {

	        text : '#C0C0C0',
	        background: 'rgba(44,44,44,0.3)',

	        border : '#4f4f4f',
	        borderSelect : '#308AFF',

	        button : '#404040',
	        boolbg : '#181818',

	        select : '#308AFF',
	        moving : '#03afff',
	        down : '#024699',

	        stroke: '#606060',//'rgba(120,120,120,0.6)',
	        scroll: '#333333',

	    },

	    // style css

	    css : {
	        basic: '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;' + 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; border:none; overflow:hidden; background:none;',
	    },

	    // svg path

	    GPATH: 'M 7 7 L 7 8 8 8 8 7 7 7 M 5 7 L 5 8 6 8 6 7 5 7 M 3 7 L 3 8 4 8 4 7 3 7 M 7 5 L 7 6 8 6 8 5 7 5 M 6 6 L 6 5 5 5 5 6 6 6 M 7 3 L 7 4 8 4 8 3 7 3 M 6 4 L 6 3 5 3 5 4 6 4 M 3 5 L 3 6 4 6 4 5 3 5 M 3 3 L 3 4 4 4 4 3 3 3 Z',

	    setText : function( size, color, font ){

	        size = size || 11;
	        color = color || '#CCC';
	        font = font || '"Consolas", "Lucida Console", Monaco, monospace';

	        Tools.colors.text = color;

	        Tools.css.txt = Tools.css.basic + 'font-family:'+font+'; font-size:'+size+'px; color:'+color+'; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';
	        Tools.css.txtedit = Tools.css.txt + 'pointer-events:auto; padding:2px 5px; outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px dashed #4f4f4f; -ms-user-select:element;';
	        Tools.css.txtselect = Tools.css.txt + 'pointer-events:auto; padding:2px 5px; outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px dashed ' + Tools.colors.border+'; -ms-user-select:element;';
	        Tools.css.txtnumber = Tools.css.txt + 'letter-spacing:-1px; padding:2px 5px;';
	        Tools.css.item = Tools.css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px; pointer-events:auto; cursor:pointer;';

	    },

	    setSvg: function( dom, type, value, id ){

	        if( id === -1 ) dom.setAttributeNS( null, type, value );
	        else dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

	    },

	    set: function( g, o ){

	        for( var att in o ){
	            if( att === 'txt' ) g.textContent = o[ att ];
	            g.setAttributeNS( null, att, o[ att ] );
	        }
	        
	    },

	    get: function( dom, id ){

	        if( id === undefined ) return dom; // root
	        else if( !isNaN( id ) ) return dom.childNodes[ id ]; // first child
	        else if( id instanceof Array ){
	            if(id.length === 2) return dom.childNodes[ id[0] ].childNodes[ id[1] ];
	            if(id.length === 3) return dom.childNodes[ id[0] ].childNodes[ id[1] ].childNodes[ id[2] ];
	        }

	    },

	    /*setDom : function( dom, type, value ){

	        var ext = Tools.DOM_SIZE.indexOf(type) !== -1 ? 'px' : '';
	        dom.style[type] = value + ext;

	    },*/

	    dom : function ( type, css, obj, dom, id ) {

	        type = type || 'div';

	        if( Tools.SVG_TYPE_D.indexOf(type) !== -1 || Tools.SVG_TYPE_G.indexOf(type) !== -1 ){ // is svg element

	            // create new svg if not def
	            if( dom === undefined ) dom = Tools.doc.createElementNS( Tools.svgns, 'svg' );

	            Tools.addAttributes( dom, type, obj, id );
	            
	        } else { // is html element

	            if( dom === undefined ) dom = Tools.doc.createElementNS( Tools.htmls, type );
	            else dom = dom.appendChild( Tools.doc.createElementNS( Tools.htmls, type ) );

	        }

	        if( css ) dom.style.cssText = css; 

	        if( id === undefined ) return dom;
	        else return dom.childNodes[ id || 0 ];

	    },

	    addAttributes : function( dom, type, o, id ){

	        var g = Tools.doc.createElementNS( Tools.svgns, type );
	        Tools.set( g, o );
	        Tools.get( dom, id ).appendChild( g );
	        if( Tools.SVG_TYPE_G.indexOf(type) !== -1 ) g.style.pointerEvents = 'none';
	        return g;

	    },

	    clear : function( dom ){

	        Tools.purge( dom );
	        while (dom.firstChild) {
	            if ( dom.firstChild.firstChild ) Tools.clear( dom.firstChild );
	            dom.removeChild( dom.firstChild ); 
	        }

	    },

	    purge : function ( dom ) {

	        var a = dom.attributes, i, n;
	        if (a) {
	            i = a.length;
	            while(i--){
	                n = a[i].name;
	                if (typeof dom[n] === 'function') dom[n] = null;
	            }
	        }
	        a = dom.childNodes;
	        if (a) {
	            i = a.length;
	            while(i--){ 
	                Tools.purge( dom.childNodes[i] ); 
	            }
	        }

	    },



	    // LOOP

	    loop : function(){

	        if( Tools.isLoop ) requestAnimationFrame( Tools.loop );
	        Tools.update();

	    },

	    update : function(){

	        var i = Tools.listens.length;
	        while(i--) Tools.listens[i].listening();

	    },

	    removeListen : function ( proto ){

	        var id = Tools.listens.indexOf( proto );
	        Tools.listens.splice(id, 1);

	        if( Tools.listens.length === 0 ) Tools.isLoop = false;

	    },

	    addListen : function ( proto ){

	        var id = Tools.listens.indexOf( proto );

	        if( id !== -1 ) return; 

	        Tools.listens.push( proto );

	        if( !Tools.isLoop ){
	            Tools.isLoop = true;
	            Tools.loop();
	        }

	    },

	    // ----------------------
	    //   Color function
	    // ----------------------

	    ColorLuma : function ( hex, lum ) {

	        // validate hex string
	        hex = String(hex).replace(/[^0-9a-f]/gi, '');
	        if (hex.length < 6) {
	            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	        }
	        lum = lum || 0;

	        // convert to decimal and change luminosity
	        var rgb = "#", c, i;
	        for (i = 0; i < 3; i++) {
	            c = parseInt(hex.substr(i*2,2), 16);
	            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
	            rgb += ("00"+c).substr(c.length);
	        }

	        return rgb;

	    },

	    findDeepInver: function( rgb ){ 

	        return (rgb[0] * 0.3 + rgb[1] * .59 + rgb[2] * .11) <= 0.6;
	        
	    },


	    hexToHtml: function(v){ 
	        v = v === undefined ? 0x000000 : v;
	        return "#" + ("000000" + v.toString(16)).substr(-6);
	        
	    },

	    htmlToHex: function(v){ 

	        return v.toUpperCase().replace("#", "0x");

	    },

	    u255: function(color, i){

	        return parseInt(color.substring(i, i + 2), 16) / 255;

	    },

	    u16: function( color, i ){

	        return parseInt(color.substring(i, i + 1), 16) / 15;

	    },

	    unpack: function( color ){

	        if (color.length == 7) return [ Tools.u255(color, 1), Tools.u255(color, 3), Tools.u255(color, 5) ];
	        else if (color.length == 4) return [ Tools.u16(color,1), Tools.u16(color,2), Tools.u16(color,3) ];

	    },

	    htmlRgb: function( rgb ){

	        return 'rgb(' + Math.round(rgb[0] * 255) + ','+ Math.round(rgb[1] * 255) + ','+ Math.round(rgb[2] * 255) + ')';

	    },

	    rgbToHex : function( rgb ){

	        return '#' + ( '000000' + ( ( rgb[0] * 255 ) << 16 ^ ( rgb[1] * 255 ) << 8 ^ ( rgb[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

	    },

	    hueToRgb: function( p, q, t ){

	        if ( t < 0 ) t += 1;
	        if ( t > 1 ) t -= 1;
	        if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
	        if ( t < 1 / 2 ) return q;
	        if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
	        return p;

	    },

	    rgbToHsl: function(rgb){

	        var r = rgb[0], g = rgb[1], b = rgb[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
	        if (l > 0 && l < 1) s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
	        if (delta > 0) {
	            if (max == r && max != g) h += (g - b) / delta;
	            if (max == g && max != b) h += (2 + (b - r) / delta);
	            if (max == b && max != r) h += (4 + (r - g) / delta);
	            h /= 6;
	        }
	        return [ h, s, l ];

	    },

	    hslToRgb: function( hsl ){

	        var p, q, h = hsl[0], s = hsl[1], l = hsl[2];

	        if ( s === 0 ) return [ l, l, l ];
	        else {
	            q = l <= 0.5 ? l * (s + 1) : l + s - ( l * s );
	            p = l * 2 - q;
	            return [ Tools.hueToRgb(p, q, h + 0.33333), Tools.hueToRgb(p, q, h), Tools.hueToRgb(p, q, h - 0.33333) ];
	        }

	    },

	    // svg to canvas test 

	    toCanvas: function( canvas, content, w, h ){

	        var ctx = canvas.getContext("2d");

	        var dcopy = null;

	        if( typeof content === 'string' ){

	            dcopy = Tools.dom( 'iframe', 'position:abolute; left:0; top:0; width:'+w+'px; height:'+h+'px;' );
	            dcopy.src = content;

	        }else{
	            dcopy = content.cloneNode(true);
	            dcopy.style.left = 0;
	        }

	        var svg = Tools.dom( 'foreignObject', 'position:abolute; left:0; top:0;', { width:w, height:h });

	        svg.childNodes[0].appendChild( dcopy );
	        
	        svg.setAttribute("version", "1.1");
	        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg' );
	        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

	        svg.setAttribute('width', w );
	        svg.setAttribute('height', h );
	        svg.childNodes[0].setAttribute('width', '100%' );
	        svg.childNodes[0].setAttribute('height', '100%' );

	        //console.log(svg)

	        var img = new Image();
	        

	        var data = 'data:image/svg+xml;base64,'+ window.btoa((new XMLSerializer).serializeToString(svg));
	        dcopy = null;

	        img.onload = function() {
	            ctx.clearRect( 0, 0, w, h );
	            ctx.drawImage( img, 0, 0, w, h, 0, 0, w, h );
	        };
	        
	        img.src = data;

	        /*setTimeout(function() {
	            ctx.clearRect( 0, 0, w, h );
	            ctx.drawImage( img, 0, 0, w, h, 0, 0, w, h );
	        }, 0);*/

	        // blob

	        /*var svgBlob = new Blob([(new XMLSerializer).serializeToString(svg)], {type: "image/svg+xml;charset=utf-8"});
	        var url = URL.createObjectURL(svgBlob);

	        img.onload = function() {
	            ctx.clearRect( 0, 0, w, h );
	            ctx.drawImage( img, 0, 0, w, h, 0, 0, w, h );
	            URL.revokeObjectURL(url);
	        };
	        img.src = url;*/

	    },

	};

	Tools.setText();

	/**
	 * @author lo-th / https://github.com/lo-th
	 */

	function Proto ( o ) {

	    o = o || {};

	    this.main = o.main || null;
	    // if is on ui pannel
	    this.isUI = o.isUI || false;

	    // percent of title
	    this.p = o.p !== undefined ? o.p : Tools.size.p;

	    this.width = this.isUI ? this.main.size.w : Tools.size.w;
	    if( o.w !== undefined ) this.width = o.w;

	    this.h = this.isUI ? this.main.size.h : Tools.size.h;
	    if( o.h !== undefined ) this.h = o.h;
	    this.h = this.h < 11 ? 11 : this.h;

	    // if need resize width
	    this.autoWidth = true;

	    // if need resize height
	    this.isOpen = false;

	    this.isGroup = false;
	    this.parentGroup = null;

	    // if height can change
	    this.autoHeight = false;

	    // radius for toolbox
	    this.radius = o.radius || 0;

	    

	    // only for number
	    this.isNumber = false;

	    // only most simple 
	    this.mono = false;

	    // stop listening for edite slide text
	    this.isEdit = false;

	    // no title 
	    this.simple = o.simple || false;
	    if( this.simple ) this.sa = 0;

	    // define obj size
	    this.setSize( this.width );

	    // title size
	    if(o.sa !== undefined ) this.sa = o.sa;
	    if(o.sb !== undefined ) this.sb = o.sb;

	    if( this.simple ) this.sb = this.width - this.sa;

	    // last number size for slide
	    this.sc = o.sc === undefined ? 47 : o.sc;

	    // like dat gui
	    this.parent = null;
	    this.val = null;
	    this.isSend = false;

	    
	    
	    // Background
	    this.bg = this.isUI ? this.main.bg : Tools.colors.background;
	    if( o.bg !== undefined ) this.bg = o.bg;

	    // Font Color;
	    this.titleColor = o.titleColor || Tools.colors.text;
	    this.fontColor = o.fontColor || Tools.colors.text;
	    this.colorPlus = Tools.ColorLuma( this.fontColor, 0.3 );

	    this.name = o.name || 'Proto';
	    
	    this.txt = o.name || 'Proto';
	    this.rename = o.rename || '';
	    this.target = o.target || null;

	    this.callback = o.callback === undefined ? null : o.callback;
	    this.endCallback = null;

	    if( this.callback === null && this.isUI && this.main.callback !== null ) this.callback = this.main.callback;

	    // elements

	    this.c = [];

	    // style 

	    this.s = [];

	    //this.c[0] = Tools.dom('UIL', 'div', 'position:relative; height:20px; float:left;');
	    this.c[0] = Tools.dom( 'div', Tools.css.basic + 'position:relative; height:20px; float:left; overflow:hidden;');
	    this.s[0] = this.c[0].style;

	    if( this.isUI ) this.s[0].marginBottom = '1px';
	    

	    if( !this.simple ){ 
	        //this.c[1] = Tools.dom('UIL text');
	        this.c[1] = Tools.dom( 'div', Tools.css.txt );
	        this.s[1] = this.c[1].style;
	        this.c[1].textContent = this.rename === '' ? this.txt : this.rename;
	        this.s[1].color = this.titleColor;
	    }

	    if(o.pos){
	        this.s[0].position = 'absolute';
	        for(var p in o.pos){
	            this.s[0][p] = o.pos[p];
	        }
	        this.mono = true;
	    }

	    if(o.css){
	        this.s[0].cssText = o.css; 
	    }

	}

	Proto.prototype = {

	    constructor: Proto,

	    // ----------------------
	    // make de node
	    // ----------------------

	    init: function () {

	        var s = this.s; // style cache
	        var c = this.c; // div cache

	        s[0].height = this.h + 'px';

	        //if( this.isUI ) s[0].background = this.bg;
	        if( this.autoHeight ) s[0].transition = 'height 0.1s ease-out';
	        if( c[1] !== undefined && this.autoWidth ){
	            s[1] = c[1].style;
	            s[1].height = (this.h-4) + 'px';
	            s[1].lineHeight = (this.h-8) + 'px';
	        }

	        var frag = Tools.frag;

	        for( var i=1, lng = c.length; i !== lng; i++ ){
	            if( c[i] !== undefined ) {
	                frag.appendChild( c[i] );
	                s[i] = c[i].style;
	            }
	        }


	        if( this.target !== null ){ 
	            this.target.appendChild( c[0] );
	        } else {
	            if( this.isUI ) this.main.inner.appendChild( c[0] );
	            else document.body.appendChild( c[0] );
	        }

	        c[0].appendChild( frag );

	        this.rSize();
	        this.addEvent();

	    },

	    rename: function ( s ) {

	        this.c[1].textContent = s;

	    },

	    setBG: function ( c ) {

	        this.bg = c;
	        this.s[0].background = c;

	    },

	    listen: function () {

	        Tools.addListen( this );
	        Tools.listens.push( this );
	        return this;

	    },

	    listening: function () {

	        if( this.parent === null ) return;
	        if( this.isSend ) return;
	        if( this.isEdit ) return;

	        this.setValue( this.parent[ this.val ] );

	    },

	    setValue: function ( v ) {

	        if( this.isNumber ) this.value = this.numValue( v );
	        else this.value = v;
	        this.update();

	    },

	    update: function () {
	        
	    },

	    // ----------------------
	    // update every change
	    // ----------------------

	    onChange: function ( f ) {

	        this.callback = f;
	        return this;

	    },

	    // ----------------------
	    // update only on end
	    // ----------------------

	    onFinishChange: function ( f ) {

	        this.callback = null;
	        this.endCallback = f;
	        return this;

	    },

	    send: function ( v ) {

	        this.isSend = true;
	        if( this.parent !== null ) this.parent[ this.val ] = v || this.value;
	        if( this.callback ) this.callback( v || this.value );
	        this.isSend = false;

	    },

	    sendEnd: function ( v ) {

	        if( this.endCallback ) this.endCallback( v || this.value );
	        if( this.parent !== null ) this.parent[ this.val ] = v || this.value;

	    },

	    // ----------------------
	    // clear node
	    // ----------------------
	    
	    clear: function () {

	        this.clearEvent();
	        Tools.clear( this.c[0] );

	        if( this.target !== null ){ 
	            this.target.removeChild( this.c[0] );
	        } else {
	            if( this.isUI ) this.main.clearOne( this );
	            else document.body.removeChild( this.c[0] );
	        }

	        this.c = null;
	        this.s = null;
	        this.callback = null;
	        this.target = null;

	    },

	    // ----------------------
	    // change size 
	    // ----------------------

	    setSize: function ( sx ) {

	        if( !this.autoWidth ) return;

	        this.width = sx;

	        if( this.simple ){
	            //this.sa = 0;
	            this.sb = this.width - this.sa;
	        } else {
	            var pp = this.width * ( this.p / 100 );
	            this.sa = ~~ pp + 10;
	            this.sb = ~~ this.width - pp - 20;
	        }

	    },

	    rSize: function () {

	        if( !this.autoWidth ) return;

	        this.s[0].width = this.width + 'px';
	        if( !this.simple ) this.s[1].width = this.sa + 'px';
	    
	    },

	    // ----------------------
	    // for numeric value
	    // ----------------------

	    setTypeNumber: function ( o ) {

	        this.isNumber = true;

	        this.value = 0;
	        if(o.value !== undefined){
	            if( typeof o.value === 'string' ) this.value = o.value * 1;
	            else this.value = o.value;
	        }

	        this.min = o.min === undefined ? -Infinity : o.min;
	        this.max = o.max === undefined ?  Infinity : o.max;
	        this.precision = o.precision === undefined ? 2 : o.precision;

	        var s;

	        switch(this.precision){
	            case 0: s = 1; break;
	            case 1: s = 0.1; break;
	            case 2: s = 0.01; break;
	            case 3: s = 0.001; break;
	            case 4: s = 0.0001; break;
	        }

	        this.step = o.step === undefined ?  s : o.step;

	        this.range = this.max - this.min;

	        this.value = this.numValue( this.value );
	        
	    },

	    numValue: function ( n ) {

	        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision ) * 1;

	    },

	    // ----------------------
	    //   Events dispatch
	    // ----------------------

	    addEvent: function () {

	        var i = this.c.length, j, c;
	        while( i-- ){
	            c = this.c[i];
	            if( c !== undefined ){
	                if( c.events !== undefined ){
	                    j = c.events.length;
	                    while( j-- ) c.addEventListener( c.events[j], this, false );
	                }
	            }
	        }

	    },

	    clearEvent: function () {

	        var i = this.c.length, j, c;
	        while( i-- ){
	            c = this.c[i];
	            if( c !== undefined ){
	                if( c.events !== undefined ){
	                    j = c.events.length;
	                    while( j-- ) c.removeEventListener( c.events[j], this, false );
	                }
	            }
	        }

	    },

	    handleEvent: function ( e ) {
	        
	    },

	    // ----------------------
	    // object referency
	    // ----------------------

	    setReferency: function ( obj, val ) {

	        this.parent = obj;
	        this.val = val;

	    },

	    display: function ( v ) {

	        this.s[0].display = v ? 'block' : 'none';

	    },

	    // ----------------------
	    // resize height 
	    // ----------------------

	    open: function () {

	        if( this.isOpen ) return;
	        this.isOpen = true;

	    },

	    close: function () {

	        if( !this.isOpen ) return;
	        this.isOpen = false;

	    },


	};

	function Bool ( o ){

	    Proto.call( this, o );

	    this.value = o.value || false;

	    this.buttonColor = o.bColor || Tools.colors.button;

	    this.inh = o.inh || this.h;

	    var t = ~~ (this.h*0.5)-((this.inh-2)*0.5);

	    this.c[2] = Tools.dom( 'div', Tools.css.basic + 'background:'+ Tools.colors.boolbg +'; height:'+(this.inh-2)+'px; width:36px; top:'+t+'px; border-radius:20px; pointer-events:auto; cursor:pointer; transition:0.1s ease-out;' );
	    this.c[3] = Tools.dom( 'div', Tools.css.basic + 'opasity:0, background:'+ Tools.colors.boolbg +'; height:'+(this.inh-6)+'px; width:'+(this.inh-6)+'px; top:'+(t+2)+'px; border-radius:20px; ' );
	    this.c[4] = Tools.dom( 'div', Tools.css.basic + 'border:1px solid '+this.buttonColor+'; height:'+(this.inh-4)+'px; width:16px; top:'+(t+1)+'px; border-radius:20px; background:'+this.buttonColor+'; transition:margin 0.1s ease-out;' );

	    if(this.value){
	        this.c[4].style.marginLeft = '18px';
	        this.c[2].style.background = this.fontColor;
	        this.c[2].style.borderColor = this.fontColor;
	    }

	    this.c[2].events = [ 'click' ];

	    this.init();

	}

	Bool.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Bool,

	    handleEvent: function ( e ) {

	        e.preventDefault();

	        switch( e.type ) {
	            case 'click': this.click(e); break;
	        }

	    },

	    click: function( e ){

	        if(this.value) this.value = false;
	        else this.value = true;
	        this.update();
	        this.send();

	    },

	    update: function() {

	        var s = this.s;

	        if(this.value){
	            s[4].marginLeft = '18px';
	            s[2].background = this.fontColor;
	            s[2].borderColor = this.fontColor;
	            s[4].borderColor = this.fontColor;
	        } else {
	            s[4].marginLeft = '0px';
	            s[2].background = Tools.colors.boolbg;
	            s[2].borderColor = Tools.colors.boolbg;
	            s[4].borderColor = Tools.colors.border;
	        }
	            
	    },

	    rSize: function(){

	        Proto.prototype.rSize.call( this );
	        var s = this.s;
	        s[2].left = this.sa + 'px';
	        s[3].left = this.sa+1+ 'px';
	        s[4].left = this.sa+1 + 'px';

	    }

	} );

	function Button ( o ) {

	    Proto.call( this, o );

	    this.value = o.value || [this.txt];

	    this.buttonColor = o.bColor || Tools.colors.button;

	    this.isLoadButton = o.loader || false;
	    this.isDragButton = o.drag || false;
	    if(this.isDragButton ) this.isLoadButton = true;
	    //this.r = o.r || 3;

	    this.lng = this.value.length;

	    for(var i = 0; i < this.lng; i++){
	        //this.c[i+2] = Tools.dom( 'div', Tools.css.txt + 'text-align:center; border:1px solid ' + Tools.colors.border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.r+'px; line-height:'+(this.h-4)+'px;' );
	        this.c[i+2] = Tools.dom( 'div', Tools.css.txt + 'text-align:center; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px; line-height:'+(this.h-4)+'px;' );
	        this.c[i+2].style.color = this.fontColor;

	        this.c[i+2].events = [ 'click', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];
	        this.c[i+2].innerHTML = this.value[i];//this.txt;
	        this.c[i+2].name = i;
	    }

	    if( this.c[1] !== undefined ) this.c[1].textContent = '';
	    

	    if( this.isLoadButton ) this.initLoader();
	    if( this.isDragButton ){ 
	        this.lng ++;
	        this.initDrager();
	    }

	    this.init();

	}

	Button.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Button,

	    handleEvent: function ( e ) {

	        e.preventDefault();

	        switch( e.type ) {
	            case 'click': this.click( e ); break;
	            case 'mouseover': this.mode( 1, e ); break;
	            case 'mousedown': this.mode( 2, e ); break;
	            case 'mouseup': this.mode( 0, e ); break;
	            case 'mouseout': this.mode( 0, e ); break;
	            case 'change': this.fileSelect( e.target.files[0] ); break;

	            case 'dragover': this.dragover(); break;
	            case 'dragend': this.dragend(); break;
	            case 'dragleave': this.dragend(); break;
	            case 'drop': this.drop( e ); break;
	        }

	    },

	    mode: function ( mode, e ) {

	        var s = this.s;
	        var i = e.target.name || 0;
	        if(i==='loader') i = 0;

	        switch( mode ){
	            case 0: // base
	                s[i+2].color = this.fontColor;
	                s[i+2].background = this.buttonColor;
	            break;
	            case 1: // over
	                s[i+2].color = '#FFF';
	                s[i+2].background = Tools.colors.select;
	            break;
	            case 2: // edit / down
	                s[i+2].color = this.fontColor;
	                s[i+2].background = Tools.colors.down;
	            break;

	        }
	    },

	    dragover: function () {

	        this.s[4].borderColor = Tools.colors.select;
	        this.s[4].color = Tools.colors.select;

	    },

	    dragend: function () {

	        this.s[4].borderColor = this.fontColor;
	        this.s[4].color = this.fontColor;
	    },

	    drop: function ( e ) {

	        this.dragend();
	        this.fileSelect( e.dataTransfer.files[0] );

	    },

	    

	    initDrager: function () {

	        this.c[4] = Tools.dom( 'div', Tools.css.txt +' text-align:center; line-height:'+(this.h-8)+'px; border:1px dashed '+this.fontColor+'; top:2px; pointer-events:auto; cursor:default; height:'+(this.h-4)+'px; border-radius:'+this.r+'px;' );
	        this.c[4].textContent = 'DRAG';

	        this.c[2].events = [  ];
	        this.c[4].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];


	    },

	    initLoader: function () {

	        this.c[3] = Tools.dom( 'input', Tools.css.basic +'border:1px solid '+Tools.colors.border+'; top:1px; opacity:0; pointer-events:auto; cursor:pointer; height:'+(this.h-2)+'px;' );
	        this.c[3].name = 'loader';
	        this.c[3].type = "file";

	        this.c[2].events = [  ];
	        this.c[3].events = [ 'change', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

	        //this.hide = document.createElement('input');

	    },

	    fileSelect: function ( file ) {

	        var dataUrl = [ 'png', 'jpg', 'mp4', 'webm', 'ogg' ];
	        var dataBuf = [ 'sea', 'bvh', 'BVH', 'z' ];

	        //if( ! e.target.files ) return;

	        //var file = e.target.files[0];
	       
	        //this.c[3].type = "null";
	        // console.log( this.c[4] )

	        if( file === undefined ) return;

	        var reader = new FileReader();
	        var fname = file.name;
	        var type = fname.substring(fname.lastIndexOf('.')+1, fname.length );

	        if( dataUrl.indexOf( type ) !== -1 ) reader.readAsDataURL( file );
	        else if( dataBuf.indexOf( type ) !== -1 ) reader.readAsArrayBuffer( file );
	        else reader.readAsText( file );

	        // if( type === 'png' || type === 'jpg' || type === 'mp4' || type === 'webm' || type === 'ogg' ) reader.readAsDataURL( file );
	        //else if( type === 'z' ) reader.readAsBinaryString( file );
	        //else if( type === 'sea' || type === 'bvh' || type === 'BVH' || type === 'z') reader.readAsArrayBuffer( file );
	        //else if(  ) reader.readAsArrayBuffer( file );
	        //else reader.readAsText( file );

	        reader.onload = function(e) {
	            
	            if( this.callback ) this.callback( e.target.result, fname, type );
	            //this.c[3].type = "file";
	            //this.send( e.target.result ); 
	        }.bind(this);

	    },

	    click: function ( e ) {

	        var i = e.target.name || 0;
	        var v = this.value[i];

	        this.send( v );

	    },

	    label: function ( string, n ) {

	        n = n || 2;
	        this.c[n].textContent = string;

	    },

	    icon: function ( string, y, n ) {

	        n = n || 2;
	        this.s[n].padding = ( y || 0 ) +'px 0px';
	        this.c[n].innerHTML = string;

	    },

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	        var s = this.s;
	        var w = this.sb;
	        var d = this.sa;

	        var i = this.lng;
	        var dc =  3;
	        var size = Math.floor( ( w-(dc*(i-1)) ) / i );

	        while(i--){
	            
	            s[i+2].width = size + 'px';
	            s[i+2].left = d + ( size * i ) + ( dc * i) + 'px';

	        }

	        if( this.isDragButton ){ 
	            s[4].left = (d+size+dc) + 'px';
	            s[4].width = size + 'px';
	        }

	        if( this.isLoadButton ){
	            s[3].left = d + 'px';
	            s[3].width = size + 'px';
	        }

	    }

	} );

	function Circular ( o ) {

	    Proto.call( this, o );

	    //this.type = 'circular';
	    this.autoWidth = false;

	    this.buttonColor = Tools.colors.button;

	    this.setTypeNumber( o );

	    this.radius = Math.floor((this.width-20)*0.5);

	    /*this.radius = o.radius || 15;
	    
	    this.width = (this.radius*2)+20;

	    if(o.width !== undefined){
	        this.width = o.width;
	        this.radius = ~~ (this.width-20)*0.5;
	    }

	    if(o.size !== undefined){
	        this.width = o.size;
	        this.radius = ~~ (this.width-20)*0.5;
	    }*/

	    this.w = this.height = this.radius * 2;
	    this.h = o.height || (this.height + 40);

	    this.twoPi = Math.PI * 2;

	    this.top = 0;

	    this.c[0].style.width = this.width +'px';

	    if(this.c[1] !== undefined) {

	        this.c[1].style.width = this.width +'px';
	        this.c[1].style.textAlign = 'center';
	        this.top = 20;

	    }

	    this.percent = 0;

	    this.c[2] = Tools.dom( 'div', Tools.css.txtnumber + 'text-align:center; top:'+(this.height+24)+'px; width:'+this.width+'px; color:'+ this.fontColor );
	    this.c[3] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'rgba(0,0,0,0.3)' });
	    this.c[4] = Tools.dom( 'path', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { d:this.makePath(), fill:this.fontColor });
	    this.c[5] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius, r:this.radius*0.5, fill:this.buttonColor, 'stroke-width':1, stroke:Tools.colors.stroke });

	    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

	    this.init();

	    this.update();

	}

	Circular.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Circular,

	    handleEvent: function ( e ) {

	        e.preventDefault();

	        switch( e.type ) {
	            case 'mouseover': this.over( e ); break;
	            case 'mousedown': this.down( e ); break;
	            case 'mouseout':  this.out( e );  break;

	            case 'mouseup':   this.up( e );   break;
	            case 'mousemove': this.move( e ); break;
	        }

	    },

	    mode: function ( mode ) {

	        switch(mode){
	            case 0: // base
	                this.s[2].color = this.fontColor;
	                Tools.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
	                Tools.setSvg( this.c[4], 'fill', this.fontColor );
	            break;
	            case 1: // over
	                this.s[2].color = this.colorPlus;
	                Tools.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
	                Tools.setSvg( this.c[4], 'fill', this.colorPlus );
	            break;
	        }

	    },

	    // ACTION

	    over: function ( e ) {

	        this.isOver = true;
	        this.mode(1);

	    },

	    out: function ( e ) {

	        this.isOver = false;
	        if(this.isDown) return;
	        this.mode(0);

	    },

	    up: function ( e ) {

	        this.isDown = false;
	        document.removeEventListener( 'mouseup', this, false );
	        document.removeEventListener( 'mousemove', this, false );

	        if(this.isOver) this.mode(1);
	        else this.mode(0);

	        this.sendEnd();

	    },

	    down: function ( e ) {

	        this.isDown = true;
	        document.addEventListener( 'mouseup', this, false );
	        document.addEventListener( 'mousemove', this, false );

	        this.rect = this.c[3].getBoundingClientRect();
	        this.old = this.value;
	        this.oldr = null;
	        this.move( e );

	    },

	    move: function ( e ) {

	        if( !this.isDown ) return;

	        var x = this.radius - (e.clientX - this.rect.left);
	        var y = this.radius - (e.clientY - this.rect.top);

	        this.r = Math.atan2( y, x ) - (Math.PI * 0.5);
	        this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

	        if( this.oldr !== null ){ 

	            var dif = this.r - this.oldr;
	            this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

	            if(dif > 6) this.r = 0;
	            if(dif < -6) this.r = this.twoPi;

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

	    },

	    makePath: function () {

	        var r = this.radius;
	        //var start = 0;
	        var end = this.percent * this.twoPi - 0.001;
	        //var x1 = r + r * Math.sin(start);
	        //var y1 = r - r * Math.cos(start);
	        var x2 = r + r * Math.sin(end);
	        var y2 = r - r * Math.cos(end);
	        //var big = end - start > Math.PI ? 1 : 0;
	        var big = end > Math.PI ? 1 : 0;
	        return "M " + r + "," + r + " L " + r + "," + 0 + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2 + " Z";

	    },

	    update: function ( up ) {

	        this.c[2].textContent = this.value;
	        this.percent = ( this.value - this.min ) / this.range;
	        Tools.setSvg( this.c[4], 'd', this.makePath() );
	        if( up ) this.send();
	        
	    },

	} );

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

	}

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

		    console.log('open');

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

		    console.log('close');
		    
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

	function Fps ( o ) {

	    Proto.call( this, o );

	    this.round = Math.round;

	    this.autoHeight = true;

	    this.baseH = this.h;
	    this.hplus = 50;

	    this.res = o.res || 40;
	    this.l = 1;

	    this.pa1 = [];
	    this.pa2 = [];
	    this.pa3 = [];

	    var i = this.res+1;
	    while(i--){
	        this.pa1.push(50);
	        this.pa2.push(50);
	        this.pa3.push(50);
	    }

	    var fltop = Math.floor(this.h*0.5)-6;

	    this.c[1].textContent = 'FPS';
	    this.c[0].style.cursor = 'pointer';
	    this.c[0].style.pointerEvents = 'auto';

	    var panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px; background: rgba(0, 0, 0, 0.2);' + 'border:1px solid rgba(255, 255, 255, 0.2); ';

	    this.c[2] = Tools.dom( 'path', Tools.css.basic + panelCss , { fill:'rgba(200,200,200,0.3)', 'stroke-width':1, stroke:this.fontColor, 'vector-effect':'non-scaling-stroke' });

	    this.c[2].setAttribute('viewBox', '0 0 '+this.res+' 42' );
	    this.c[2].setAttribute('height', '100%' );
	    this.c[2].setAttribute('width', '100%' );
	    this.c[2].setAttribute('preserveAspectRatio', 'none' );

	    Tools.dom( 'path', null, { fill:'rgba(255,255,0,0.3)', 'stroke-width':1, stroke:'#FF0', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	    Tools.dom( 'path', null, { fill:'rgba(0,255,255,0.3)', 'stroke-width':1, stroke:'#0FF', 'vector-effect':'non-scaling-stroke' }, this.c[2] );


	    // bottom line
	    this.c[3] = Tools.dom( 'div', Tools.css.basic + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');

	    this.c[4] = Tools.dom( 'path', Tools.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:'M 3 8 L 8 5 3 2 3 8 Z', fill:this.fontColor, stroke:'none'});

	    this.isShow = o.show || false;

	    this.c[1].style.marginLeft = '10px';

	    this.now = ( self.performance && self.performance.now ) ? self.performance.now.bind( performance ) : Date.now;
	    this.startTime = this.now();
	    this.prevTime = this.startTime;
	    this.frames = 0;

	    this.isMem = false;

	    this.ms = 0;
	    this.fps = 0;
	    this.mem = 0;
	    this.mm = 0;

	    if ( self.performance && self.performance.memory ) this.isMem = true;

	    this.c[0].events = [ 'click', 'mousedown', 'mouseover', 'mouseout' ];

	    this.init();

	    //if( this.isShow ) this.show();

	}


	Fps.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Fps,

	    handleEvent: function ( e ) {

	        e.preventDefault();

	        switch( e.type ) {
	            case 'click': this.click(e); break;
	            case 'mouseover': this.mode(1); break;
	            case 'mousedown': this.mode(2); break;
	            case 'mouseout':  this.mode(0); break;
	        }

	    },

	    mode: function ( mode ) {

	        var s = this.s;

	        switch(mode){
	            case 0: // base
	                s[1].color = this.fontColor;
	                //s[1].background = 'none';
	            break;
	            case 1: // over
	                s[1].color = '#FFF';
	                //s[1].background = UIL.SELECT;
	            break;
	            case 2: // edit / down
	                s[1].color = this.fontColor;
	                //s[1].background = UIL.SELECTDOWN;
	            break;

	        }
	    },

	    click: function ( e ) {

	        if( this.isShow ) this.hide();
	        else this.show();

	    },

	    makePath: function ( point ) {

	        var p = '';
	        p += 'M ' + (-1) + ' ' + 50;
	        for ( var i = 0; i < this.res + 1; i ++ ) { p += ' L ' + i + ' ' + point[i]; }
	        p += ' L ' + (this.res + 1) + ' ' + 50;

	        return p;

	    },

	    drawGraph: function( ){

	        var svg = this.c[2];

	        this.pa1.shift();
	        this.pa1.push( 8.5 + this.round( ( 1 - (this.fps / 100)) * 30 ) );

	        Tools.setSvg( svg, 'd', this.makePath( this.pa1 ), 0 );

	        this.pa2.shift();
	        this.pa2.push( 8.5 + this.round( ( 1 - (this.ms / 200)) * 30 ) );

	        Tools.setSvg( svg, 'd', this.makePath( this.pa2 ), 1 );

	        if ( this.isMem ) {

	            this.pa3.shift();
	            this.pa3.push( 8.5 + this.round( ( 1 - this.mm) * 30 ) );

	            Tools.setSvg( svg, 'd', this.makePath( this.pa3 ), 2 );

	        }

	    },

	    show: function(){

	        this.h = this.hplus + this.baseH;

	        Tools.setSvg( this.c[4], 'd','M 5 8 L 8 3 2 3 5 8 Z');


	        if( this.parentGroup !== null ){ this.parentGroup.calc( this.hplus );}
	        else if( this.isUI ) this.main.calc( this.hplus );

	        this.s[0].height = this.h +'px';
	        this.s[2].display = 'block'; 
	        this.isShow = true;

	        Tools.addListen( this );

	    },

	    hide: function(){

	        this.h = this.baseH;

	        Tools.setSvg( this.c[4], 'd','M 3 8 L 8 5 3 2 3 8 Z');

	        if( this.parentGroup !== null ){ this.parentGroup.calc( -this.hplus );}
	        else if( this.isUI ) this.main.calc( -this.hplus );
	        
	        this.s[0].height = this.h +'px';
	        this.s[2].display = 'none';
	        this.isShow = false;

	        Tools.removeListen( this );
	        this.c[1].textContent = 'FPS';
	        
	    },



	    //////////////////

	    begin: function(){

	        this.startTime = this.now();
	        
	    },

	    end: function(){


	        var time = this.now();
	        this.ms = time - this.startTime;

	        this.frames ++;

	        if ( time > this.prevTime + 1000 ) {

	            this.fps = this.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );

	            this.prevTime = time;
	            this.frames = 0;

	            if ( this.isMem ) {

	                var heapSize = performance.memory.usedJSHeapSize;
	                var heapSizeLimit = performance.memory.jsHeapSizeLimit;

	                this.mem = this.round( heapSize * 0.000000954 );

	                this.mm = heapSize / heapSizeLimit;

	            }

	        }

	        this.drawGraph();
	        this.c[1].innerHTML = 'FPS ' + this.fps + '<font color="yellow"> MS '+ ( this.ms | 0 ) + '</font><font color="cyan"> MB '+ this.mem + '</font>';

	        return time;

	        
	    },

	    listening: function(){

	        this.startTime = this.end();
	        
	    },


	    rSize: function(){

	        this.s[0].width = this.width + 'px';
	        this.s[1].width = this.width + 'px';
	        this.s[2].left = 10 + 'px';
	        this.s[2].width = (this.width-20) + 'px';
	        
	    },
	    
	} );

	function Group ( o ) {
	 
	    Proto.call( this, o );

	    this.autoHeight = true;
	    this.isGroup = true;

	    //this.bg = o.bg || null;
	    

	    //this.h = 25;
	    this.baseH = this.h;
	    var fltop = Math.floor(this.h*0.5)-6;


	    this.isLine = o.line !== undefined ? o.line : false;

	    this.c[2] = Tools.dom( 'div', Tools.css.basic + 'width:100%; left:0; height:auto; overflow:hidden; top:'+this.h+'px');
	    this.c[3] = Tools.dom( 'path', Tools.css.basic + 'position:absolute; width:10px; height:10px; left:0; top:'+fltop+'px;', { d:Tools.GPATH, fill:this.fontColor, stroke:'none'});
	    this.c[4] = Tools.dom( 'path', Tools.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:'M 3 8 L 8 5 3 2 3 8 Z', fill:this.fontColor, stroke:'none'});
	    // bottom line
	    if(this.isLine) this.c[5] = Tools.dom( 'div', Tools.css.basic +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');

	    var s = this.s;

	    s[0].height = this.h + 'px';
	    s[1].height = this.h + 'px';
	    //s[1].top = 4 + 'px';
	    //s[1].left = 4 + 'px';
	    s[1].pointerEvents = 'auto';
	    s[1].cursor = 'pointer';
	    this.c[1].name = 'group';

	    this.s[1].marginLeft = '10px';
	    this.s[1].lineHeight = this.h-4;
	    this.s[1].color = this.fontColor;
	    this.s[1].fontWeight = 'bold';

	    this.uis = [];

	    this.c[1].events = [ 'click' ];

	    this.init();

	    if( o.bg !== undefined ) this.setBG(o.bg);
	    if( o.open !== undefined ) this.open();

	}

	Group.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Group,

	    handleEvent: function ( e ) {

	        e.preventDefault();
	        //e.stopPropagation();

	        switch( e.type ) {
	            case 'click': this.click( e ); break;
	        }

	    },


	    click: function ( e ) {

	        if( this.isOpen ) this.close();
	        else this.open();

	    },

	    setBG: function ( c ) {

	        this.s[0].background = c;

	        var i = this.uis.length;
	        while(i--){
	            this.uis[i].setBG( c );
	        }

	    },

	    add: function( ){

	        var a = arguments;

	        if( typeof a[1] === 'object' ){ 
	            a[1].isUI = this.isUI;
	            a[1].target = this.c[2];
	            a[1].main = this.main;
	        } else if( typeof arguments[1] === 'string' ){
	            if( a[2] === undefined ) [].push.call(a, { isUI:true, target:this.c[2], main:this.main });
	            else{ 
	                a[2].isUI = true;
	                a[2].target = this.c[2];
	                a[2].main = this.main;
	            }
	        }

	        var n = add.apply( this, a );
	        this.uis.push( n );

	        if( n.autoHeight ) n.parentGroup = this;

	        return n;

	    },

	    open: function () {

	        Proto.prototype.open.call( this );

	        Tools.setSvg( this.c[4], 'd','M 5 8 L 8 3 2 3 5 8 Z');
	        //this.s[4].background = UIL.F1;
	        this.rSizeContent();

	        if( this.isUI ) this.main.calc( this.h - this.baseH );

	    },

	    close: function () {

	        Proto.prototype.close.call( this );

	        if( this.isUI ) this.main.calc( -( this.h - this.baseH ) );

	        Tools.setSvg( this.c[4], 'd','M 3 8 L 8 5 3 2 3 8 Z');
	        this.h = this.baseH;
	        this.s[0].height = this.h + 'px';

	    },

	    clear: function(){

	        this.clearGroup();
	        if( this.isUI ) this.main.calc( -(this.h +1 ));
	        Proto.prototype.clear.call( this );

	    },

	    clearGroup: function(){

	        this.close();

	        var i = this.uis.length;
	        while(i--){
	            this.uis[i].clear();
	            this.uis.pop();
	        }
	        this.uis = [];
	        this.h = this.baseH;

	    },

	    calc: function( y ){

	        if( !this.isOpen ) return;

	        if( y !== undefined ){ 
	            this.h += y;
	            if( this.isUI ) this.main.calc( y );
	        } else {
	            this.h = this.c[2].offsetHeight + this.baseH;
	        }
	        this.s[0].height = this.h + 'px';

	    },

	    rSizeContent: function(){

	        var i = this.uis.length;
	        while(i--){
	            this.uis[i].setSize( this.width );
	            this.uis[i].rSize();
	        }
	        this.calc();

	    },

	    rSize: function(){

	        Proto.prototype.rSize.call( this );

	        var s = this.s;

	        s[3].left = ( this.sa + this.sb - 17 ) + 'px';
	        s[1].width = this.width + 'px';
	        s[2].width = this.width + 'px';

	        if(this.isOpen) this.rSizeContent();

	    }

	} );

	function Joystick ( o ) {

	    Proto.call( this, o );

	    this.autoWidth = false;

	    this.value = [0,0];

	    this.joyType = 'analogique';

	    this.precision = o.precision || 2;
	    this.multiplicator = o.multiplicator || 1;

	    this.x = 0;
	    this.y = 0;

	    this.oldx = 0;
	    this.oldy = 0;

	    this.interval = null;

	    this.radius = Math.floor((this.width-20)*0.5);

	    /*this.radius = o.radius || 50;

	    this.width = (this.radius*2)+20;

	    if(o.width !== undefined){
	        this.width = o.width;
	        this.radius = ~~ (( this.width-20 )*0.5);
	    }
	    if(o.size !== undefined){
	        this.width = o.size;
	        this.radius = ~~ (this.width-20)*0.5;
	    }*/

	    this.innerRadius = o.innerRadius || this.radius*0.6;
	    this.maxDistance = this.radius - this.innerRadius - 5;
	    this.height = this.radius*2;
	    this.h = o.height || (this.height + 40);

	    this.top = 0;

	    this.c[0].style.width = this.width +'px';

	    if(this.c[1] !== undefined) {

	        this.c[1].style.width = this.width +'px';
	        this.c[1].style.textAlign = 'center';
	        this.top = 20;

	    }

	    this.c[2] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;  pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'url(#grad)' });
	    this.c[3] = Tools.dom( 'circle', Tools.css.basic + 'left:0px; top:'+(this.top-10)+'px; width:'+(this.w+20)+'px; height:'+(this.height+20)+'px;', { cx:this.radius+10, cy:this.radius+10, r:this.innerRadius+10, fill:'url(#gradS)'});
	    this.c[4] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius, r:this.innerRadius, fill:'url(#gradIn)', 'stroke-width':1, stroke:'#000'  });
	    this.c[5] = Tools.dom( 'div', Tools.css.txt + 'text-align:center; top:'+(this.height+20)+'px; width:'+this.width+'px; color:'+ this.fontColor );

	    // gradian bakground
	    var svg = this.c[2];
	    Tools.dom( 'defs', null, {}, svg );
	    Tools.dom( 'radialGradient', null, {id:'grad', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
	    Tools.dom( 'stop', null, { offset:'40%', style:'stop-color:rgb(0,0,0); stop-opacity:0.3;' }, svg, [1,0] );
	    Tools.dom( 'stop', null, { offset:'80%', style:'stop-color:rgb(0,0,0); stop-opacity:0;' }, svg, [1,0] );
	    Tools.dom( 'stop', null, { offset:'90%', style:'stop-color:rgb(50,50,50); stop-opacity:0.4;' }, svg, [1,0] );
	    Tools.dom( 'stop', null, { offset:'100%', style:'stop-color:rgb(50,50,50); stop-opacity:0;' }, svg, [1,0] );

	    // gradian shadow
	    svg = this.c[3];
	    Tools.dom( 'defs', null, {}, svg );
	    Tools.dom( 'radialGradient', null, {id:'gradS', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
	    Tools.dom( 'stop', null, { offset:'60%', style:'stop-color:rgb(0,0,0); stop-opacity:0.5;' }, svg, [1,0] );
	    Tools.dom( 'stop', null, { offset:'100%', style:'stop-color:rgb(0,0,0); stop-opacity:0;' }, svg, [1,0] );

	    // gradian stick

	    var cc0 = ['rgb(40,40,40)', 'rgb(48,48,48)', 'rgb(30,30,30)'];
	    var cc1 = ['rgb(1,90,197)', 'rgb(3,95,207)', 'rgb(0,65,167)'];

	    svg = this.c[4];
	    Tools.dom( 'defs', null, {}, svg );
	    Tools.dom( 'radialGradient', null, {id:'gradIn', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
	    Tools.dom( 'stop', null, { offset:'30%', style:'stop-color:'+cc0[0]+'; stop-opacity:1;' }, svg, [1,0] );
	    Tools.dom( 'stop', null, { offset:'60%', style:'stop-color:'+cc0[1]+'; stop-opacity:1;' }, svg, [1,0]  );
	    Tools.dom( 'stop', null, { offset:'80%', style:'stop-color:'+cc0[1]+'; stop-opacity:1;' }, svg, [1,0]  );
	    Tools.dom( 'stop', null, { offset:'100%', style:'stop-color:'+cc0[2]+'; stop-opacity:1;' }, svg, [1,0]  );

	    Tools.dom( 'radialGradient', null, {id:'gradIn2', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, this.c[4], 1 );
	    Tools.dom( 'stop', null, { offset:'30%', style:'stop-color:'+cc1[0]+'; stop-opacity:1;' }, svg, [1,1]  );
	    Tools.dom( 'stop', null, { offset:'60%', style:'stop-color:'+cc1[1]+'; stop-opacity:1;' }, svg, [1,1] );
	    Tools.dom( 'stop', null, { offset:'80%', style:'stop-color:'+cc1[1]+'; stop-opacity:1;' }, svg, [1,1] );
	    Tools.dom( 'stop', null, { offset:'100%', style:'stop-color:'+cc1[2]+'; stop-opacity:1;' }, svg, [1,1] );

	    //console.log( this.c[4] )

	    this.c[5].textContent = 'x'+ this.value[0] +' y' + this.value[1];

	    this.c[2].events = [ 'mouseover', 'mousedown', 'mouseout' ];

	    this.init();

	    this.update(false);
	}

	Joystick.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Joystick,

	    handleEvent: function ( e ) {

	        e.preventDefault();

	        switch( e.type ) {
	            case 'mouseover': this.over( e ); break;
	            case 'mousedown': this.down( e ); break;
	            case 'mouseout':  this.out( e );  break;
	            case 'mouseup':   this.up( e );   break;
	            case 'mousemove': this.move( e ); break;
	        }

	    },

	    mode: function ( mode ) {

	        switch(mode){
	            case 0: // base
	                Tools.setSvg( this.c[4], 'fill','url(#gradIn)');
	                Tools.setSvg( this.c[4], 'stroke', '#000' );
	            break;
	            case 1: // over
	                Tools.setSvg( this.c[4], 'fill', 'url(#gradIn2)' );
	                Tools.setSvg( this.c[4], 'stroke', 'rgba(0,0,0,0)' );
	            break;
	            case 2: // edit
	            break;

	        }
	    },

	    over: function( e ){

	        this.isOver = true;
	        this.mode(1);

	    },

	    out: function( e ){

	        this.isOver = false;
	        if(this.isDown) return;
	        this.mode(0);

	    },

	    up: function( e ){

	        this.isDown = false;
	        document.removeEventListener( 'mouseup', this, false );
	        document.removeEventListener( 'mousemove', this, false );

	        this.interval = setInterval(this.update.bind(this), 10);

	        if(this.isOver) this.mode(1);
	        else this.mode(0);
	        
	    },

	    down: function( e ){

	        this.isDown = true;
	        document.addEventListener( 'mouseup', this, false );
	        document.addEventListener( 'mousemove', this, false );

	        this.rect = this.c[2].getBoundingClientRect();
	        this.move( e );
	        this.mode( 2 );

	    },

	    move: function ( e ) {

	        if( !this.isDown ) return;

	        var x = this.radius - ( e.clientX - this.rect.left );
	        var y = this.radius - ( e.clientY - this.rect.top );

	        var distance = Math.sqrt( x * x + y * y );

	        if ( distance > this.maxDistance ) {
	            var angle = Math.atan2(x, y);
	            x = Math.sin(angle) * this.maxDistance;
	            y = Math.cos(angle) * this.maxDistance;
	        }

	        this.x = x / this.maxDistance;
	        this.y = y / this.maxDistance;

	        this.update();

	    },

	    setValue: function ( x, y ) {

	        this.x = x || 0;
	        this.y = y || 0;

	        this.updateSVG();

	    },

	    update: function ( up ) {

	        if(up === undefined) up = true;

	        if( this.interval !== null ){

	            if( !this.isDown ){
	                this.x += (0 - this.x)/3;
	                this.y += (0 - this.y)/3;
	            }

	            if ( this.x.toFixed(2) === this.oldx.toFixed(2) && this.y.toFixed(2) === this.oldy.toFixed(2)){
	                
	                this.x = 0;
	                this.y = 0;
	            }

	        }

	        this.updateSVG();

	        if( up ) this.send();

	        if( this.interval !== null && this.x === 0 && this.y === 0 ){
	            clearInterval( this.interval );
	            this.interval = null;
	        }

	    },

	    updateSVG: function () {

	        var rx = this.x * this.maxDistance;
	        var ry = this.y * this.maxDistance;
	        var x = this.radius - rx;
	        var y = this.radius - ry;
	        var sx = x + ((1-this.x)*5) + 5;
	        var sy = y + ((1-this.y)*5) + 10;

	        Tools.setSvg( this.c[3], 'cx', sx );
	        Tools.setSvg( this.c[3], 'cy', sy );
	        Tools.setSvg( this.c[4], 'cx', x );
	        Tools.setSvg( this.c[4], 'cy', y );

	        this.oldx = this.x;
	        this.oldy = this.y;

	        this.value[0] = -( this.x * this.multiplicator ).toFixed( this.precision ) * 1;
	        this.value[1] =  ( this.y * this.multiplicator ).toFixed( this.precision ) * 1;

	        this.c[5].textContent = 'x'+ this.value[0] +' y' + this.value[1];

	    },

	} );

	function Knob ( o ) {

	    Proto.call( this, o );

	    //this.type = 'knob';
	    this.autoWidth = false;

	    this.buttonColor = Tools.colors.button;

	    this.setTypeNumber( o );

	    this.mPI = Math.PI * 0.8;
	    this.toDeg = 180 / Math.PI;
	    this.cirRange = this.mPI * 2;

	    this.radius = Math.floor((this.width-20)*0.5);

	    /*this.radius = o.radius || 15;
	    
	    this.width = (this.radius*2)+20;

	    if(o.width !== undefined){
	        this.width = o.width;
	        this.radius = ~~ (this.width-20)*0.5;
	    }

	    if(o.size !== undefined){
	        this.width = o.size;
	        this.radius = ~~ (this.width-20)*0.5;
	    }*/

	    this.w = this.height = this.radius * 2;
	    this.h = o.height || (this.height + 40);
	    this.top = 0;

	    this.c[0].style.width = this.width +'px';

	    if(this.c[1] !== undefined) {

	        this.c[1].style.width = this.width +'px';
	        this.c[1].style.textAlign = 'center';
	        this.top = 20;

	    }

	    this.percent = 0;

	    this.c[2] = Tools.dom( 'div', Tools.css.txtnumber + 'text-align:center; top:'+(this.height+24)+'px; width:'+this.width+'px; color:'+ this.fontColor );

	    this.c[3] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;  pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius-4, fill:'rgba(0,0,0,0.3)' });
	    this.c[4] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius*0.5, r:3, fill:this.fontColor });
	    this.c[5] = Tools.dom( 'path', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { d:this.makeGrad(), 'stroke-width':1, stroke:Tools.colors.stroke });
	    
	    Tools.dom( 'circle', null, { cx:this.radius, cy:this.radius, r:this.radius*0.7, fill:this.buttonColor, 'stroke-width':1, stroke:Tools.colors.stroke }, this.c[3] );

	    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

	    this.r = 0;

	    this.init();

	    this.update();

	}

	Knob.prototype = Object.assign( Object.create( Circular.prototype ), {

	    constructor: Knob,

	    move: function( e ){

	        if( !this.isDown ) return;

	        var x = this.radius - (e.clientX - this.rect.left);
	        var y = this.radius - (e.clientY - this.rect.top);
	        this.r = - Math.atan2( x, y );

	        if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

	        this.r = this.r > this.mPI ? this.mPI : this.r;
	        this.r = this.r < -this.mPI ? -this.mPI : this.r;

	        var steps = 1 / this.cirRange;
	        var value = (this.r + this.mPI) * steps;

	        var n = ( ( this.range * value ) + this.min ) - this.old;

	        if(n >= this.step || n <= this.step){ 
	            n = ~~ ( n / this.step );
	            this.value = this.numValue( this.old + ( n * this.step ) );
	            this.update( true );
	            this.old = this.value;
	            this.oldr = this.r;
	        }

	    },

	    makeGrad: function () {

	        var d = '', step, range, a, x, y, x2, y2, r = this.radius;
	        var startangle = Math.PI + this.mPI;
	        var endangle = Math.PI - this.mPI;

	        if(this.step>5){
	            range =  this.range / this.step;
	            step = ( startangle - endangle ) / range;
	        } else {
	            step = ( startangle - endangle ) / r;
	            range = r;
	        }

	        for ( var i = 0; i <= range; ++i ) {

	            a = startangle - ( step * i );
	            x = r + Math.sin( a ) * r;
	            y = r + Math.cos( a ) * r;
	            x2 = r + Math.sin( a ) * ( r - 3 );
	            y2 = r + Math.cos( a ) * ( r - 3 );
	            d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

	        }

	        return d;

	    },

	    update: function ( up ) {

	        this.c[2].textContent = this.value;
	        this.percent = (this.value - this.min) / this.range;

	        var r = ( (this.percent * this.cirRange) - (this.mPI)) * this.toDeg;

	        Tools.setSvg( this.c[4], 'transform', 'rotate('+ r +' '+this.radius+' '+this.radius+')' );

	        if( up ) this.send();
	        
	    },

	} );

	function List ( o ) {

	    Proto.call( this, o );

	    this.autoHeight = true;
	    var align = o.align || 'center';

	    this.buttonColor = o.bColor || Tools.colors.button;

	    var fltop = Math.floor(this.h*0.5)-5;

	    //this.c[2] = Tools.dom( 'div', Tools.css.basic + 'top:0; height:90px; cursor:s-resize; pointer-events:auto; display:none; overflow:hidden; border:1px solid '+Tools.colors.border+';' );
	    //this.c[3] = Tools.dom( 'div', Tools.css.txt + 'text-align:'+align+'; line-height:'+(this.h-4)+'px; border:1px solid '+Tools.colors.border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px;' );

	    this.c[2] = Tools.dom( 'div', Tools.css.basic + 'top:0; height:90px; cursor:s-resize; pointer-events:auto; display:none; overflow:hidden;' );
	    this.c[3] = Tools.dom( 'div', Tools.css.txt + 'text-align:'+align+'; line-height:'+(this.h-4)+'px; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px;' );
	    this.c[4] = Tools.dom( 'path', Tools.css.basic + 'position:absolute; width:10px; height:10px; top:'+fltop+'px;', { d:'M 3 8 L 8 5 3 2 3 8 Z', fill:this.fontColor, stroke:'none'});

	    this.scroller = Tools.dom( 'div', Tools.css.basic + 'right:5px;  width:10px; pointer-events:none; background:#666; display:none;');

	    this.c[2].name = 'list';
	    this.c[3].name = 'title';

	    //this.c[2].style.borderTop = this.h + 'px solid transparent';
	    this.c[3].style.color = this.fontColor;

	    this.c[2].events = [ 'mousedown', 'mousemove', 'mouseup', 'mousewheel', 'mouseout', 'mouseover' ];
	    this.c[3].events = [ 'mousedown', 'mouseover' ,'mouseout']; 

	    this.list = o.list || [];

	    this.baseH = this.h;

	    //this.maxItem = o.maxItem || 5;
	    this.itemHeight = o.itemHeight || (this.h-3);
	    //this.length = this.list.length;

	    // force full list 
	    this.full = o.full || false;

	    this.py = 0;
	    this.w = this.sb;
	    this.scroll = false;
	    this.isDown = false;

	    // list up or down
	    this.side = o.side || 'down';
	    this.holdTop = 0;

	    if( this.side === 'up' ){

	        this.c[2].style.top = 'auto';
	        this.c[3].style.top = 'auto';
	        this.c[4].style.top = 'auto';
	        //this.c[5].style.top = 'auto';

	        this.c[2].style.bottom = this.h-2 + 'px';
	        this.c[3].style.bottom = '1px';
	        this.c[4].style.bottom = fltop + 'px';
	        //this.c[5].style.bottom = '2px';

	    } else {
	        this.c[2].style.top = this.h-2 + 'px';
	        //this.c[6].style.top = this.h + 'px';
	    }

	    this.listIn = Tools.dom( 'div', Tools.css.basic + 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2);');
	    this.listIn.name = 'list';

	    
	    this.c[2].appendChild( this.listIn );
	    this.c[2].appendChild( this.scroller );

	    // populate list

	    this.setList( this.list, o.value );

	   
	    this.init();

	    if( o.open !== undefined ) this.open();

	}

	List.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: List,

	    handleEvent: function( e ) {

	        e.preventDefault();

	        var name = e.target.name || '';
	        switch( e.type ) {
	            case 'click': this.click(e); break;
	            case 'mouseover': if(name === 'title') this.mode(1); else this.listover(e); break;
	            case 'mousedown': if(name === 'title') this.titleClick(e); else this.listdown(e); break;
	            case 'mouseup':   if(name === 'title') this.mode(0); else this.listup(e); break;
	            case 'mouseout':  if(name === 'title') this.mode(0);  else this.listout(e); break;
	            case 'mousemove': this.listmove(e); break;
	            case 'mousewheel': this.listwheel(e); break;
	        }

	    },

	    mode: function( mode ){

	        var s = this.s;

	        switch(mode){
	            case 0: // base
	                s[3].color = this.fontColor;
	                s[3].background = this.buttonColor;
	            break;
	            case 1: // over
	                s[3].color = '#FFF';
	                s[3].background = Tools.colors.select;
	            break;
	            case 2: // edit / down
	                s[3].color = this.fontColor;
	                s[3].background = Tools.colors.down;
	            break;

	        }
	    },

	    clearList: function() {

	        while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );

	    },

	    setList: function( list, value ) {

	        this.clearList();

	        this.list = list;
	        this.length = this.list.length;

	        this.maxItem = this.full ? this.length : 5;
	        this.maxItem = this.length < this.maxItem ? this.length : this.maxItem;

	        this.maxHeight = this.maxItem * (this.itemHeight+1) + 2;

	        this.max = this.length * (this.itemHeight+1) + 2;
	        this.ratio = this.maxHeight / this.max;
	        this.sh = this.maxHeight * this.ratio;
	        this.range = this.maxHeight - this.sh;

	        this.c[2].style.height = this.maxHeight + 'px';
	        this.scroller.style.height = this.sh + 'px';

	        if( this.max > this.maxHeight ){ 
	            this.w = this.sb - 20;
	            this.scroll = true;
	        }

	        var item, n;//, l = this.sb;
	        for( var i=0; i<this.length; i++ ){
	            n = this.list[i];
	            item = Tools.dom( 'div', Tools.css.item + 'width:'+this.w+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px;');
	            item.textContent = n;
	            item.style.color = this.fontColor;
	            item.name = 'item';
	            this.listIn.appendChild( item );
	        }

	        if( value !== undefined ){
	            if(!isNaN(value)) this.value = this.list[ value ];
	            else this.value = value;
	        }else{
	            this.value = this.list[0];
	        }
	        
	        this.c[3].textContent = this.value;

	    },

	    // -----

	    click: function( e ){

	        var name = e.target.name;
	        if( name !== 'title' && name !== 'list' ) this.close();

	    },

	    titleClick: function( e ){

	        if( this.isOpen ) this.close();
	        else {
	            this.open(); 
	            this.mode(2);
	        }

	    },

	    // ----- LIST

	    listover: function( e ){

	        var name = e.target.name;
	        //console.log(name)
	        if( name === 'item' ){
	            e.target.style.background = Tools.colors.select;
	            e.target.style.color = '#FFF'; 
	        }

	    },

	    listdown: function( e ){

	        var name = e.target.name;
	        if( name !== 'list' && name !== undefined ){
	            this.value = e.target.textContent;//name;
	            this.c[3].textContent = this.value;
	            this.send();
	           // this.close();
	        } else if ( name ==='list' && this.scroll ){
	            this.isDown = true;
	            this.listmove( e );
	            this.listIn.style.background = 'rgba(0,0,0,0.6)';
	            this.scroller.style.background = '#AAA';
	        }

	    },

	    listmove: function( e ){

	        if( this.isDown ){
	            var rect = this.c[2].getBoundingClientRect();
	            this.update( ( e.clientY - rect.top  ) - ( this.sh*0.5 ) );
	        }

	    },

	    listup: function( e ){

	        this.isDown = false;
	        this.listIn.style.background = 'rgba(0,0,0,0.2)';
	        this.scroller.style.background = '#666';

	    },

	    listout: function( e ){

	        var n = e.target.name;
	        if( n === 'item' ){
	            e.target.style.background ='rgba(0,0,0,0.2)';
	            e.target.style.color = this.fontColor; 
	        }


	        if( this.isUI ) this.main.lockwheel = false;
	        this.listup();
	        //var name = e.relatedTarget.name;
	        //if( name === undefined ) this.close();

	        

	    },

	    listwheel: function( e ){

	        if( !this.scroll ) return;
	        if( this.isUI ) this.main.lockwheel = true;
	        var delta = 0;
	        if( e.wheelDeltaY ) delta = -e.wheelDeltaY*0.04;
	        else if( e.wheelDelta ) delta = -e.wheelDelta*0.2;
	        else if( e.detail ) delta = e.detail*4.0;

	        this.py += delta;

	        this.update(this.py);

	    },


	    // ----- LIST

	    update: function( y ){

	        if( !this.scroll ) return;

	        y = y < 0 ? 0 : y;
	        y = y > this.range ? this.range : y;

	        this.listIn.style.top = -Math.floor( y / this.ratio )+'px';
	        this.scroller.style.top = Math.floor( y )  + 'px';

	        this.py = y;

	    },

	    open: function(){

	        Proto.prototype.open.call( this );

	        document.addEventListener( 'click', this, false );

	        this.update( 0 );
	        this.h = this.maxHeight + this.baseH + 10;
	        if( !this.scroll ){
	            this.h = this.baseH + 10 + this.max;
	            this.scroller.style.display = 'none';
	        } else {
	            this.scroller.style.display = 'block';
	        }
	        this.s[0].height = this.h + 'px';
	        this.s[2].display = 'block';
	        if( this.side === 'up' ) Tools.setSvg( this.c[4], 'd','M 5 2 L 2 7 8 7 5 2 Z');
	        else Tools.setSvg( this.c[4], 'd','M 5 8 L 8 3 2 3 5 8 Z');

	        this.rSizeContent();

	        if( this.parentGroup !== null ) this.parentGroup.calc( this.h - this.baseH );
	        else if( this.isUI ) this.main.calc( this.h - this.baseH );

	    },

	    close: function(){

	        Proto.prototype.close.call( this );

	        document.removeEventListener( 'click', this, false );

	        if( this.parentGroup !== null ) this.parentGroup.calc( -(this.h-this.baseH) );
	        else if( this.isUI ) this.main.calc(-(this.h-this.baseH));

	        this.h = this.baseH;
	        this.s[0].height = this.h + 'px';
	        this.s[2].display = 'none';
	        Tools.setSvg( this.c[4], 'd','M 3 8 L 8 5 3 2 3 8 Z');
	        
	    },

	    // -----

	    text: function( txt ){

	        this.c[3].textContent = txt;

	    },

	    rSizeContent: function () {

	        var i = this.length;
	        while(i--) this.listIn.children[i].style.width = this.w + 'px';

	    },

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	        var s = this.s;
	        var w = this.sb;
	        var d = this.sa;

	        s[2].width = w + 'px';
	        s[2].left = d +'px';

	        s[3].width = w + 'px';
	        s[3].left = d + 'px';

	        s[4].left = d + w - 17 + 'px';

	        //s[5].width = w + 'px';
	        //s[5].left = d + 'px';

	        this.w = w;
	        if( this.max > this.maxHeight ) this.w = w-20;

	        if(this.isOpen) this.rSizeContent();

	    }

	} );

	function Numeric( o ){

	    Proto.call( this, o );

	    this.type = 'number';

	    this.setTypeNumber( o );

	    this.allway = o.allway || false;
	    this.isDrag = o.drag === undefined ? true : o.drag;

	    this.value = [0];
	    this.toRad = 1;
	    this.isNumber = true;
	    this.isAngle = false;
	    this.isVector = false;
	    this.isSelect = false;

	    if( o.value !== undefined ){
	        if(!isNaN(o.value)){ this.value = [o.value];}
	        else if(o.value instanceof Array ){ this.value = o.value; this.isNumber=false;}
	        else if(o.value instanceof Object ){ 
	            this.value = [];
	            if(o.value.x) this.value[0] = o.value.x;
	            if(o.value.y) this.value[1] = o.value.y;
	            if(o.value.z) this.value[2] = o.value.z;
	            if(o.value.w) this.value[3] = o.value.w;
	            this.isVector = true;
	        }
	    }

	    this.length = this.value.length;

	    if(o.isAngle){
	        this.isAngle = true;
	        this.toRad = Math.PI/180;
	    }

	    //this.w = ((Tools.base.BW+5)/(this.length))-5;
	    this.current = undefined;
	    
	    var i = this.length;
	    while(i--){
	        if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
	        this.c[2+i] = Tools.dom( 'div', Tools.css.txtselect + 'letter-spacing:-1px; cursor:pointer; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
	        this.c[2+i].name = i;
	        if(this.isDrag) this.c[2+i].style.cursor = 'move';
	        if(o.center) this.c[2+i].style.textAlign = 'center';

	        this.c[2+i].textContent = this.value[i];
	        this.c[2+i].style.color = this.fontColor;
	        //this.c[2+i].contentEditable = true;
	        this.c[2+i].events = [ 'keydown', 'keyup', 'mousedown', 'blur', 'focus' ]; //'click', 

	    }

	    this.init();
	}

	Numeric.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Numeric,

	    handleEvent: function( e ) {

	        //e.preventDefault();
	        //e.stopPropagation();

	        switch( e.type ) {
	            //case 'click': this.click( e ); break;
	            case 'mousedown': this.down( e ); break;
	            case 'keydown': this.keydown( e ); break;
	            case 'keyup': this.keyup( e ); break;

	            case 'blur': this.blur( e ); break;
	            case 'focus': this.focus( e ); break;

	            // document
	            case 'mouseup': this.up( e ); break;
	            case 'mousemove': this.move( e ); break;

	        }

	    },

	    setValue: function ( v, n ) {

	        n = n || 0;
	        this.value[n] = this.numValue( v );
	        this.c[2+n].textContent = this.value[n];

	    },

	    keydown: function ( e ) {

	        e.stopPropagation();

	        if( e.keyCode === 13 ){
	            e.preventDefault();
	            this.testValue( parseFloat(e.target.name) );
	            this.validate();
	            e.target.blur();
	        }

	    },

	    keyup: function ( e ) {
	        
	        e.stopPropagation();

	        if( this.allway ){ 
	            this.testValue( parseFloat(e.target.name) );
	            this.validate();
	        }

	    },

	    blur: function ( e ) {

	        this.isSelect = false;
	        e.target.style.borderColor = Tools.colors.border;
	        e.target.contentEditable = false;
	        //e.target.style.border = '1px solid rgba(255,255,255,0.1)';
	        if(this.isDrag) e.target.style.cursor = 'move';
	        else  e.target.style.cursor = 'pointer';

	    },

	    focus: function ( e ) {

	        this.isSelect = true;
	        this.current = undefined;
	        e.target.style.borderColor = Tools.colors.borderSelect;
	        
	        //e.target.style.border = '1px solid ' + UIL.BorderSelect;
	        if(this.isDrag) e.target.style.cursor = 'auto';

	    },

	    down: function ( e ) {

	        if(this.isSelect) return;

	        e.preventDefault();

	        this.current = parseFloat(e.target.name);

	        this.prev = { x:e.clientX, y:e.clientY, d:0, id:(this.current+2)};
	        if( this.isNumber ) this.prev.v = parseFloat(this.value);
	        else this.prev.v = parseFloat( this.value[this.current] );



	        document.addEventListener( 'mouseup', this, false );
	        if(this.isDrag) document.addEventListener( 'mousemove', this, false );

	    },

	    ////

	    up: function( e ){

	        e.preventDefault();

	        document.removeEventListener( 'mouseup', this, false );
	        if(this.isDrag) document.removeEventListener( 'mousemove', this, false );

	        if(this.current !== undefined){ 

	            if( this.current === parseFloat(e.target.name) ){ 
	                e.target.contentEditable = true;
	                e.target.focus();
	            }

	        }

	    },

	    move: function( e ){

	        e.preventDefault();

	        if( this.current === undefined ) return;

	        this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );
	        var n = this.prev.v + ( this.prev.d * this.step);

	        this.value[this.current] = this.numValue(n);
	        //this.c[2+this.current].value = this.value[this.current];

	        this.c[2+this.current].textContent = this.value[this.current];

	        this.validate();

	        this.prev.x = e.clientX;
	        this.prev.y = e.clientY;

	    },

	    /////

	    testValue: function( n ){

	        if(!isNaN( this.c[2+n].textContent )){ 
	            var nx = this.numValue( this.c[2+n].textContent );
	            this.c[2+n].textContent = nx;
	            this.value[n] = nx;
	        } else { // not number
	            this.c[2+n].textContent = this.value[n];
	        }

	    },

	    validate: function(){

	        var ar = [];
	        var i = this.length;
	        while(i--) ar[i] = this.value[i]*this.toRad;

	        if( this.isNumber ) this.send( ar[0] );
	        else this.send( ar );

	    },

	    rSize: function(){

	        Proto.prototype.rSize.call( this );

	        this.w = ~~( ( this.sb + 5 ) / this.length )-5;
	        var s = this.s;
	        var i = this.length;
	        while(i--){
	            s[2+i].left = (~~( this.sa + ( this.w * i )+( 5 * i ))) + 'px';
	            s[2+i].width = this.w + 'px';
	        }

	    }

	} );

	function Slide ( o ){

	    Proto.call( this, o );

	    this.setTypeNumber( o );

	    this.stype = o.stype || 0;
	    this.buttonColor = o.bColor || Tools.colors.button;

	    //this.old = this.value;
	    this.isDown = false;
	    this.isOver = false;
	    this.allway = o.allway || false;

	    this.c[2] = Tools.dom( 'div', Tools.css.txtselect + 'letter-spacing:-1px; padding:2px 5px; text-align:right; cursor:pointer; width:47px; border:none; color:'+ this.fontColor );
	    this.c[3] = Tools.dom( 'div', Tools.css.basic + 'pointer-events:auto; cursor:w-resize; top:0; height:'+this.h+'px;' );
	    //this.c[4] = Tools.dom( 'div', Tools.css.basic + 'border:1px solid '+this.buttonColor+'; pointer-events:none; background:rgba(0,0,0,0.3); top:2px; height:'+(this.h-4)+'px;' );
	    this.c[4] = Tools.dom( 'div', Tools.css.basic + 'pointer-events:none; background:rgba(0,0,0,0.3); top:2px; height:'+(this.h-4)+'px;' );
	    this.c[5] = Tools.dom( 'div', Tools.css.basic + 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + this.fontColor +';' );

	    this.c[2].name = 'text';
	    this.c[3].name = 'scroll';

	    if(this.stype !== 0){
	        if(this.stype === 1 || this.stype === 3){
	            var h1 = 4;
	            var h2 = 8;
	            var ww = this.h-4;
	            var ra = 20;
	        }

	        if(this.stype === 2){
	            h1 = 2;
	            h2 = 4;
	            ra = 2;
	            ww = (this.h-4)*0.5;
	        }

	        if(this.stype === 3) this.c[5].style.visible = 'none';

	        this.c[4].style.borderRadius = h1 + 'px';
	        this.c[4].style.height = h2 + 'px';
	        this.c[4].style.top = (this.h*0.5) - h1 + 'px';
	        this.c[5].style.borderRadius = (h1*0.5) + 'px';
	        this.c[5].style.height = h1 + 'px';
	        this.c[5].style.top = (this.h*0.5)-(h1*0.5) + 'px';

	        this.c[6] = Tools.dom( 'div', Tools.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+Tools.colors.border+'; background:'+this.buttonColor+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );
	    }

	    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];
	    this.c[2].events = [ 'keydown', 'keyup', 'mousedown', 'blur', 'focus' ];

	    this.init();

	}

	Slide.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Slide,

	    handleEvent: function ( e ) {

	        //e.preventDefault();

	        //console.log(e.target.name)

	        switch( e.type ) {
	            case 'mouseover': this.over( e ); break;
	            case 'mousedown': e.target.name === 'text' ? this.textdown( e ) : this.down( e ); break;
	            case 'mouseout': this.out( e ); break;

	            case 'mouseup': this.up( e ); break;
	            case 'mousemove': if(this.isDown) this.move( e ); break;

	            case 'blur': this.blur( e ); break;
	            case 'focus': this.focus( e ); break;
	            case 'keydown': this.keydown( e ); break;
	            case 'keyup': this.keyup( e ); break;
	        }

	    },

	    mode: function ( mode ) {

	        var s = this.s;

	        switch(mode){
	            case 0: // base
	                s[2].color = this.fontColor;
	                s[4].background = 'rgba(0,0,0,0.3)';
	                s[5].background = this.fontColor;
	            break;
	            case 1: // over
	                s[2].color = this.colorPlus;
	               // if( !s[6] ) s[4].background = UIL.SlideBG;
	               // else 
	                s[4].background = 'rgba(0,0,0,0.6)';
	                s[5].background = this.colorPlus;
	            break;
	        }
	    },

	    over: function( e ){

	        e.preventDefault();
	        e.stopPropagation();

	        this.isOver = true;
	        this.mode(1);

	    },

	    out: function( e ){

	        e.preventDefault();
	        e.stopPropagation();

	        this.isOver = false;
	        if(this.isDown) return;
	        this.mode(0);

	    },

	    up: function( e ){

	        e.preventDefault();
	        e.stopPropagation();

	        this.isDown = false;
	        document.removeEventListener( 'mouseup', this, false );
	        document.removeEventListener( 'mousemove', this, false );

	        if(this.isOver) this.mode(1);
	        else this.mode(0);

	        this.sendEnd();
	        
	    },

	    down: function( e ){

	        e.preventDefault();
	        e.stopPropagation();

	        this.isDown = true;
	        document.addEventListener( 'mouseup', this, false );
	        document.addEventListener( 'mousemove', this, false );

	        this.left = this.c[3].getBoundingClientRect().left;
	        this.old = this.value;
	        this.move( e );

	    },

	    move: function( e ){

	        var n = ((( e.clientX - this.left - 3 ) / this.w ) * this.range + this.min ) - this.old;
	        if(n >= this.step || n <= this.step){ 
	            n = ~~ ( n / this.step );
	            this.value = this.numValue( this.old + ( n * this.step ) );
	            this.update( true );
	            this.old = this.value;
	        }

	    },

	    update: function( up ){

	        var ww = this.w * (( this.value - this.min ) / this.range );
	       
	        if(this.stype !== 3) this.s[5].width = ~~ ww + 'px';
	        if(this.s[6]) this.s[6].left = ~~ (this.sa +ww + 3) + 'px';
	        this.c[2].textContent = this.value;

	        if( up ) this.send();

	    },

	    rSize: function(){

	        Proto.prototype.rSize.call( this );

	        var w = this.sb - this.sc;
	        this.w = w - 6;

	        var tx = this.sc;
	        if(this.isUI || !this.simple) tx = this.sc+10;

	        var ty = ~~(this.h * 0.5) - 8;

	        var s = this.s;

	        s[2].width = (this.sc -2 )+ 'px';
	        s[2].left = (this.width - tx +2) + 'px';
	        s[2].top = ty + 'px';
	        s[3].left = this.sa + 'px';
	        s[3].width = w + 'px';
	        s[4].left = this.sa + 'px';
	        s[4].width = w + 'px';
	        s[5].left = (this.sa + 3) + 'px';

	        this.update();

	    },

	    // text

	    validate: function( e ){

	        if(!isNaN( this.c[2].textContent )){ 
	            this.value = this.numValue( this.c[2].textContent ); 
	            this.update(true); 
	        }
	        else this.c[2].textContent = this.value;

	    },

	    textdown: function( e ){

	        e.target.contentEditable = true;
	        e.target.focus();
	        this.isEdit = true;

	    },

	    keydown: function( e ){

	        e.stopPropagation();

	        if( e.keyCode === 13 ){
	            e.preventDefault();
	            this.validate();
	            e.target.blur();
	        }

	    },

	    keyup: function( e ){
	        
	        e.stopPropagation();
	        if( this.allway ) this.validate();

	    },

	    blur: function( e ){

	        e.target.style.border = 'none';
	        e.target.contentEditable = false;
	        this.isEdit = false;

	    },

	    focus: function( e ){

	        e.target.style.border = '1px dashed ' + Tools.colors.borderSelect;

	    }

	} );

	function TextInput( o ){

	    Proto.call( this, o );

	    this.value = o.value || '';
	    this.allway = o.allway || false;

	    this.c[2] = Tools.dom( 'div',  Tools.css.txtselect );
	    this.c[2].name = 'input';
	    //this.c[2].style.color = ;
	    this.c[2].textContent = this.value;

	    this.c[2].events = [ 'mousedown', 'keydown', 'keyup', 'blur', 'focus' ];

	    this.init();

	}

	TextInput.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: TextInput,

	    handleEvent: function( e ) {

	        switch( e.type ) {
	            case 'mousedown': this.down( e ); break;
	            case 'blur': this.blur( e ); break;
	            case 'focus': this.focus( e ); break
	            case 'keydown': this.keydown( e ); break;
	            case 'keyup': this.keyup( e ); break;
	        }

	    },

	    down: function( e ){

	        e.target.contentEditable = true;
	        e.target.focus();
	        e.target.style.cursor = 'auto';

	    },

	    blur: function( e ){

	        e.target.style.borderColor = Tools.colors.border;
	        e.target.contentEditable = false;

	    },

	    focus: function( e ){

	        e.target.style.borderColor = Tools.colors.borderSelect;

	    },

	    keydown: function( e ){
	        
	        e.stopPropagation();

	        if( e.keyCode === 13 ){ 
	            e.preventDefault();
	            this.value = e.target.textContent;
	            e.target.blur();
	            this.send();
	        }

	    },

	    keyup: function( e ){
	        
	        e.stopPropagation();

	        this.value = e.target.textContent;
	        if( this.allway ) this.send();
	        
	    },

	    rSize: function(){

	        Proto.prototype.rSize.call( this );
	        this.s[2].color = this.fontColor;
	        this.s[2].left = this.sa + 'px';
	        this.s[2].width = this.sb + 'px';
	        this.s[2].height = this.h -4 + 'px';
	        this.s[2].lineHeight = this.h - 8 + 'px';
	     
	    }

	} );

	function Title ( o ) {
	    
	    Proto.call( this, o );

	    //var id = o.id || 0;
	    var prefix = o.prefix || '';

	    this.c[2] = Tools.dom( 'div', Tools.css.txt + 'text-align:right; width:60px; line-height:'+ (this.h-8) + 'px; color:' + this.fontColor );

	    if( this.h === 31 ){

	        this.s[0].height = this.h + 'px';
	        this.s[1].top = 8 + 'px';
	        this.c[2].style.top = 8 + 'px';

	    }

	    this.c[1].textContent = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
	    this.c[2].textContent = prefix;

	    this.init();

	}

	Title.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Title,

	    text: function ( txt ) {

	        this.c[1].textContent = txt;

	    },

	    text2: function ( txt ) {

	        this.c[2].textContent = txt;

	    },

	    rSize: function () {

	        Proto.prototype.rSize.call( this );
	        this.s[1].width = this.width-50 + 'px';
	        this.s[2].left = this.width-(50+26) + 'px';

	    },

	} );

	function getType( name, o ) {

	        var n = null;

	        switch( name ){

	            case 'Bool': case 'bool': n = new Bool(o); break;
	            case 'Button': case 'button': n = new Button(o); break;
	            case 'Circular': case 'circular': n = new Circular(o); break;
	            case 'Color': case 'color': n = new Color(o); break;
	            case 'Fps': case 'fps': n = new Fps(o); break;
	            case 'Group': case 'group': n = new Group(o); break;
	            case 'Joystick': case 'joystick': n = new Joystick(o); break;
	            case 'Knob': case 'knob': n = new Knob(o); break;
	            case 'List': case 'list': n = new List(o); break;
	            case 'Numeric':case 'Number': case 'numeric':case 'number': n = new Numeric(o); break;
	            case 'Slide': case 'slide': n = new Slide(o); break;
	            case 'TextInput':case 'String': case 'textInput':case 'string': n = new TextInput(o); break;
	            case 'Title': case 'title': n = new Title(o); break;

	        }

	        return n;
	}

	function add (){

	    var a = arguments; 

	    var type, o, ref = false;

	    if( typeof a[0] === 'string' ){ 

	        type = a[0];//[0].toUpperCase() + a[0].slice(1);
	        o = a[1] || {};

	    } else if ( typeof a[0] === 'object' ){ // like dat gui

	        ref = true;
	        if( a[2] === undefined ) [].push.call(a, {});

	        type = autoType.apply( this, a );

	        o = a[2];

	        o.name = a[1];
	        o.value = a[0][a[1]];

	    }

	    var n = getType( type, o );

	    if(n !== null ){
	        if( ref ) n.setReferency( a[0], a[1] );
	        return n;
	    }
	    

	}

	function autoType () {

	    var a = arguments;

	    var type = 'Slide';

	    if(a[2].type) type = a[2].type;

	    return type;

	}

	var REVISION = '1.0';

	/**
	 * @author lo-th / https://github.com/lo-th
	 */

	function Gui ( o ) {

	    o = o || {};

	    // css plus
	    this.css = o.css !== undefined ? o.css : '';

	    // size define
	    this.size = Tools.size;
	    if( o.p !== undefined ) this.size.p = o.p;
	    if( o.w !== undefined ) this.size.w = o.w;
	    if( o.h !== undefined ) this.size.h = o.h;
	    if( o.s !== undefined ) this.size.s = o.s;

	    this.size.h = this.size.h < 11 ? 11 : this.size.h;

	    this.width = this.size.w;

	    // bottom height
	    this.bh = this.size.h;




	    //this.width = o.width !== undefined ? o.width : Tools.size.width;
	    //this.width = o.size !== undefined ? o.size : this.width;


	    // tmp variable
	    this.height = 0;
	    this.left = 0;
	    this.h = 0;
	    this.prevY = -1;
	    this.sw = 0;


	    // color
	    this.colors = Tools.colors;
	    this.bg = o.bg || Tools.colors.background;

	    // bottom and close height
	    this.isWithClose = true;
	    

	    //this.baseH = Tools.size.height;

	    if(o.close !== undefined ){
	        this.isWithClose = o.close;
	        this.bh = !this.isWithClose ? 0 : this.bh;
	    }



	    

	    Tools.main = this;

	    this.callback = o.callback  === undefined ? null : o.callback;

	   
	    
	    this.isCenter = o.center || false;
	    this.lockwheel = false;
	    this.onWheel = false;
	    this.isOpen = true;

	    this.uis = [];

	    this.content = Tools.dom( 'div', Tools.css.basic + 'display:block; width:'+this.width+'px; height:auto; top:0; right:10px; transition:height 0.1s ease-out;' + this.css );
	    if( o.parent !== undefined ) o.parent.appendChild( this.content );
	    else document.body.appendChild( this.content );

	    this.innerContent = Tools.dom( 'div', Tools.css.basic + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
	    this.content.appendChild( this.innerContent );

	    this.inner = Tools.dom( 'div', Tools.css.basic + 'width:100%; top:0; left:0; height:auto; background:'+this.bg+';');
	    this.innerContent.appendChild(this.inner);
	    this.inner.name = 'inner';

	    // scroll background
	    this.scrollBG = Tools.dom( 'div', Tools.css.basic + 'right:0; top:0; width:'+this.size.s+'px; height:10px; cursor:s-resize; pointer-events:auto; display:none; background:'+this.bg+'; border-left:1px solid '+this.colors.stroke+';');
	    this.content.appendChild( this.scrollBG );
	    this.scrollBG.name = 'scroll';

	    // scroll
	    this.scroll = Tools.dom( 'div', Tools.css.basic + 'background:'+this.colors.scroll+'; right:0px; top:0; width:'+this.size.s+'px; height:10px;');
	    this.scrollBG.appendChild( this.scroll );

	    this.bottom = Tools.dom( 'div',  Tools.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:10px;  border-bottom-left-radius:10px; text-align:center; pointer-events:auto; cursor:pointer; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px; border-top:1px solid '+Tools.colors.stroke+';');
	    this.content.appendChild(this.bottom);
	    this.bottom.textContent = 'close';
	    this.bottom.name = 'bottom';
	    this.bottom.style.background = this.bg;
	    
	    this.isDown = false;
	    this.isScroll = false;

	    this.callbackClose = function(){};

	    this.content.addEventListener( 'mousedown', this, false );
	    this.content.addEventListener( 'mousemove', this, false );
	    this.content.addEventListener( 'mouseout',  this, false );
	    this.content.addEventListener( 'mouseup',   this, false );
	    this.content.addEventListener( 'mouseover', this, false );

	    //console.log(this.content.getBoundingClientRect().top);

	    this.top = o.top || this.content.getBoundingClientRect().top;
	    //this.content.addEventListener( 'mousewheel', this, false );

	    document.addEventListener( 'mousewheel', function(e){this.wheel(e);}.bind(this), false );
	    window.addEventListener("resize", function(e){this.resize(e);}.bind(this), false );

	    //

	    this.setWidth( this.width );

	}

	Gui.prototype = {

	    constructor: Gui,

	    setText: function ( size, color, font ) {

	        Tools.setText( size, color, font );

	    },

	    hide : function (b) {

	        if(b) this.content.style.display = 'none';
	        else this.content.style.display = 'block';
	        
	    },

	    setBG : function(c){

	        this.bg = c;

	        /*var i = this.uis.length;
	        while(i--){
	            this.uis[i].setBG(c);
	        }*/

	        this.innerstyle.background = this.bg;
	        this.bottom.style.background = this.bg;

	    },

	    getHTML : function(){

	        return this.content;

	    },

	    onChange : function( f ){

	        this.callback = f;
	        return this;

	    },

	    handleEvent : function( e ) {

	        //e.preventDefault();
	        //e.stopPropagation();

	        switch( e.type ) {
	            case 'mousedown': this.down( e ); break;
	            case 'mouseout': this.out( e ); break;
	            case 'mouseover': this.over( e ); break;
	            //case 'mousewheel': this.wheel( e ); break;

	            case 'mouseup': this.up( e ); break;
	            case 'mousemove': this.move( e ); break;
	        }

	    },

	    // Mouse event

	    down: function( e ){

	        if( !e.target.name ) return;

	        if(e.target.name === 'scroll'){
	            this.isDown = true;
	            this.move( e );
	            document.addEventListener( 'mouseup', this, false );
	            document.addEventListener( 'mousemove', this, false );
	        }
	        if(e.target.name === 'bottom'){
	            this.isOpen = this.isOpen ? false : true;
	            this.bottom.textContent = this.isOpen ? 'close' : 'open';
	            this.testHeight();
	        }
	        
	    },

	    move: function( e ){

	        if(!this.isDown) return;
	        this.scroll.style.background = this.colors.down;
	        this.update( (e.clientY-this.top)-(this.sh*0.5) );

	    },

	    

	    out: function( e ){

	        if( !e.target.name ) return;

	        if(e.target.name === 'scroll'){
	            this.scroll.style.background = this.colors.scroll;
	        }

	        if(e.target.name === 'bottom'){
	            this.bottom.style.color = '#CCC';
	        }

	    },

	    up: function( e ){

	        this.isDown = false;
	        this.scroll.style.background = this.colors.scroll;
	        document.removeEventListener( 'mouseup', this, false );
	        document.removeEventListener( 'mousemove', this, false );

	    },

	    over: function( e ){

	        if( !e.target.name ) return;
	        if(e.target.name === 'scroll'){
	            this.scroll.style.background = this.colors.select;
	        }
	        if(e.target.name === 'bottom'){
	            this.bottom.style.color = '#FFF';
	        }

	    },

	    // Wheel event

	    wheel: function ( e ){

	        //e.preventDefault();
	        //e.stopPropagation();

	        if( this.lockwheel || !this.isScroll ) return;

	        //this.onWheel = true;

	        var x = e.clientX;
	        var px = this.content.getBoundingClientRect().left;

	        if(x<px) return;
	        if(x>(px+this.width)) return;

	        var delta = 0;
	        if(e.wheelDeltaY) delta = -e.wheelDeltaY*0.04;
	        else if(e.wheelDelta) delta = -e.wheelDelta*0.2;
	        else if(e.detail) delta = e.detail*4.0;

	        this.py += delta;

	        this.update( this.py );

	    },

	    // -----------------------------------

	    // Add node to gui

	    add:function(){

	        var a = arguments;

	        if( typeof a[1] === 'object' ){ 

	            a[1].isUI = true;
	            a[1].main = this;

	        } else if( typeof a[1] === 'string' ){

	            if( a[2] === undefined ) [].push.call(a, { isUI:true, main:this });
	            else {
	                a[2].isUI = true;
	                a[2].main = this;
	            }
	            
	        } 


	        var n = add.apply( this, a );
	        //var n = UIL.add( ...args );

	        this.uis.push( n );
	        n.py = this.h;

	        if( !n.autoWidth ){
	            var y = n.c[0].getBoundingClientRect().top;
	            if( this.prevY !== y ){
	                this.calc( n.h + 1 );
	                this.prevY = y;
	            }
	        }else{
	            this.prevY = -1;
	            this.calc( n.h + 1 );
	        }

	        return n;
	    },

	    // remove one node

	    remove: function ( n ) { 

	        var i = this.uis.indexOf( n ); 
	        if ( i !== -1 ) this.uis[i].clear();

	    },

	    // call after uis clear

	    clearOne: function ( n ) { 

	        var i = this.uis.indexOf( n ); 
	        if ( i !== -1 ) {
	            this.inner.removeChild( this.uis[i].c[0] );
	            this.uis.splice( i, 1 ); 
	        }

	    },

	    // clear all gui

	    clear:function(){

	        var i = this.uis.length;
	        while(i--) this.uis[i].clear();

	        this.uis = [];
	        Tools.listens = [];

	        this.calc( - this.h );

	    },

	    // -----------------------------------

	    // Scroll

	    update: function ( y ){

	        y = y < 0 ? 0 :y;
	        y = y > this.range ? this.range : y;

	        this.inner.style.top = - Math.floor( y / this.ratio ) + 'px';
	        this.scroll.style.top = Math.floor( y ) + 'px';

	        this.py = y;

	        //this.onWheel = false;

	    },

	    showScroll:function(h){

	        this.isScroll = true;
	        this.sw = this.size.s;

	        this.total = this.h;
	        this.maxView = this.maxHeight;// - this.height;

	        this.ratio = this.maxView / this.total;
	        this.sh = this.maxView * this.ratio;

	        if( this.sh < 20 ) this.sh = 20;

	        this.range = this.maxView - this.sh;

	        this.scrollBG.style.display = 'block';
	        this.scrollBG.style.height = this.maxView + 'px';
	        this.scroll.style.height = this.sh + 'px';

	        

	        this.setItemWidth( this.width - this.sw );

	        this.update( 0 );

	    },

	    hideScroll:function(){

	        this.isScroll = false;
	        this.sw = 0;
	        

	        this.setItemWidth( this.width - this.sw );

	        this.update( 0 );

	        this.scrollBG.style.display = 'none';

	    },

	    // -----------------------------------

	    resize:function(e){

	        this.testHeight();

	    },

	    calc:function( y ) {

	        this.h += y;
	        clearTimeout( this.tmp );
	        this.tmp = setTimeout( this.testHeight.bind(this), 10 );

	    },

	    testHeight:function(){

	        if( this.tmp ) clearTimeout( this.tmp );

	        this.height = this.top + this.bh;

	        if( this.isOpen ){

	            this.maxHeight = window.innerHeight - this.top - this.bh;

	            if( this.h > this.maxHeight ){

	                this.height = this.maxHeight + this.bh;
	                this.showScroll();

	            }else{

	                this.height = this.h + this.bh;
	                this.hideScroll();

	            }

	        } else {

	            this.height = this.bh;
	            this.hideScroll();

	        }

	        this.innerContent.style.height = this.height - this.bh + 'px';
	        this.content.style.height = this.height + 'px';
	        this.bottom.style.top = this.height - this.bh + 'px';

	    },

	    setWidth: function( w ) {

	        if( w ) this.width = w;
	        this.content.style.width = this.width + 'px';

	        //console.log(this.width)


	        if( this.isCenter ) this.content.style.marginLeft = -(~~ (this.width*0.5)) + 'px';

	        this.setItemWidth( this.width - this.sw );

	        /*var l = this.uis.length;
	        var i = l;
	        while(i--){
	            this.uis[i].setSize( this.width );
	        }

	        i = l;
	        while(i--){
	            this.uis[i].rSize();
	        }*/

	        this.resize();

	    },

	    setItemWidth: function( w ){

	        var i = this.uis.length;
	        while(i--){
	            this.uis[i].setSize( w );
	            this.uis[i].rSize();
	        }

	    },


	};

	exports.Tools = Tools;
	exports.Gui = Gui;
	exports.Proto = Proto;
	exports.Bool = Bool;
	exports.Button = Button;
	exports.Circular = Circular;
	exports.Color = Color;
	exports.Fps = Fps;
	exports.Group = Group;
	exports.Joystick = Joystick;
	exports.Knob = Knob;
	exports.List = List;
	exports.Numeric = Numeric;
	exports.Slide = Slide;
	exports.TextInput = TextInput;
	exports.Title = Title;
	exports.add = add;
	exports.REVISION = REVISION;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
