(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.UIL = {}));
}(this, function (exports) { 'use strict';

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
	 * @author lth / https://github.com/lo-th
	 */

	var T = {

	    frag: document.createDocumentFragment(),

	    colorRing: null,
	    joystick_0: null,
	    joystick_1: null,
	    circular: null,
	    knob: null,
	    //graph: null,

	    svgns: "http://www.w3.org/2000/svg",
	    htmls: "http://www.w3.org/1999/xhtml",

	    DOM_SIZE: [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'],
	    SVG_TYPE_D: [ 'pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient', 'animateMotion' ],
	    SVG_TYPE_G: [ 'svg', 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject' ],

	    TwoPI: 6.283185307179586,

	    size: {  w: 240, h: 20, p: 30, s: 20 },

	    // ----------------------
	    //   COLOR
	    // ----------------------

	    cloneColor: function () {

	        var cc = Object.assign({}, T.colors );
	        return cc;

	    },

	    cloneCss: function () {

	        var cc = Object.assign({}, T.css );
	        return cc;

	    },

	    colors: {

	        text : '#C0C0C0',
	        textOver : '#FFFFFF',
	        txtselectbg : 'none',

	        background: 'rgba(44,44,44,0.3)',
	        backgroundOver: 'rgba(11,11,11,0.5)',

	        //input: '#005AAA',

	        inputBorder: '#454545',
	        inputBorderSelect: '#005AAA',
	        inputBg: 'rgba(0,0,0,0.2)',
	        inputOver: 'rgba(80,80,170,0.2)',

	        border : '#454545',
	        borderOver : '#5050AA',
	        borderSelect : '#308AFF',

	        scrollback:'rgba(44,44,44,0.2)',
	        scrollbackover:'rgba(44,44,44,0.2)',

	        button : '#404040',
	        boolbg : '#181818',
	        boolon : '#C0C0C0',

	        select : '#308AFF',
	        moving : '#03afff',
	        down : '#024699',
	        over : '#024699',

	        stroke: 'rgba(11,11,11,0.5)',
	        scroll: '#333333',

	        hide: 'rgba(0,0,0,0)',

	        groupBorder: 'none',

	    },

	    // style css

	    css : {
	        //unselect: '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;', 
	        basic: 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; overflow:hidden; ' + '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;',
	    },

	    // svg path

	    svgs: {

	        group:'M 7 7 L 7 8 8 8 8 7 7 7 M 5 7 L 5 8 6 8 6 7 5 7 M 3 7 L 3 8 4 8 4 7 3 7 M 7 5 L 7 6 8 6 8 5 7 5 M 6 6 L 6 5 5 5 5 6 6 6 M 7 3 L 7 4 8 4 8 3 7 3 M 6 4 L 6 3 5 3 5 4 6 4 M 3 5 L 3 6 4 6 4 5 3 5 M 3 3 L 3 4 4 4 4 3 3 3 Z',
	        arrow:'M 3 8 L 8 5 3 2 3 8 Z',
	        arrowDown:'M 5 8 L 8 3 2 3 5 8 Z',
	        arrowUp:'M 5 2 L 2 7 8 7 5 2 Z',

	        solid:'M 13 10 L 13 1 4 1 1 4 1 13 10 13 13 10 M 11 3 L 11 9 9 11 3 11 3 5 5 3 11 3 Z',
	        body:'M 13 10 L 13 1 4 1 1 4 1 13 10 13 13 10 M 11 3 L 11 9 9 11 3 11 3 5 5 3 11 3 M 5 4 L 4 5 4 10 9 10 10 9 10 4 5 4 Z',
	        vehicle:'M 13 6 L 11 1 3 1 1 6 1 13 3 13 3 11 11 11 11 13 13 13 13 6 M 2.4 6 L 4 2 10 2 11.6 6 2.4 6 M 12 8 L 12 10 10 10 10 8 12 8 M 4 8 L 4 10 2 10 2 8 4 8 Z',
	        articulation:'M 13 9 L 12 9 9 2 9 1 5 1 5 2 2 9 1 9 1 13 5 13 5 9 4 9 6 5 8 5 10 9 9 9 9 13 13 13 13 9 Z',
	        character:'M 13 4 L 12 3 9 4 5 4 2 3 1 4 5 6 5 8 4 13 6 13 7 9 8 13 10 13 9 8 9 6 13 4 M 6 1 L 6 3 8 3 8 1 6 1 Z',
	        terrain:'M 13 8 L 12 7 Q 9.06 -3.67 5.95 4.85 4.04 3.27 2 7 L 1 8 7 13 13 8 M 3 8 Q 3.78 5.420 5.4 6.6 5.20 7.25 5 8 L 7 8 Q 8.39 -0.16 11 8 L 7 11 3 8 Z',
	        joint:'M 7.7 7.7 Q 8 7.45 8 7 8 6.6 7.7 6.3 7.45 6 7 6 6.6 6 6.3 6.3 6 6.6 6 7 6 7.45 6.3 7.7 6.6 8 7 8 7.45 8 7.7 7.7 M 3.35 8.65 L 1 11 3 13 5.35 10.65 Q 6.1 11 7 11 8.28 11 9.25 10.25 L 7.8 8.8 Q 7.45 9 7 9 6.15 9 5.55 8.4 5 7.85 5 7 5 6.54 5.15 6.15 L 3.7 4.7 Q 3 5.712 3 7 3 7.9 3.35 8.65 M 10.25 9.25 Q 11 8.28 11 7 11 6.1 10.65 5.35 L 13 3 11 1 8.65 3.35 Q 7.9 3 7 3 5.7 3 4.7 3.7 L 6.15 5.15 Q 6.54 5 7 5 7.85 5 8.4 5.55 9 6.15 9 7 9 7.45 8.8 7.8 L 10.25 9.25 Z',
	        ray:'M 9 11 L 5 11 5 12 9 12 9 11 M 12 5 L 11 5 11 9 12 9 12 5 M 11.5 10 Q 10.9 10 10.45 10.45 10 10.9 10 11.5 10 12.2 10.45 12.55 10.9 13 11.5 13 12.2 13 12.55 12.55 13 12.2 13 11.5 13 10.9 12.55 10.45 12.2 10 11.5 10 M 9 10 L 10 9 2 1 1 2 9 10 Z',
	        collision:'M 11 12 L 13 10 10 7 13 4 11 2 7.5 5.5 9 7 7.5 8.5 11 12 M 3 2 L 1 4 4 7 1 10 3 12 8 7 3 2 Z',
	        none:'M 9 5 L 5 5 5 9 9 9 9 5 Z',

	    },

	    // custom text

	    setText : function( size, color, font, shadow, colors, css ){

	        size = size || 13;
	        color = color || '#CCC';
	        font = font || 'Consolas,monaco,monospace;';//'Monospace';//'"Consolas", "Lucida Console", Monaco, monospace';

	        colors = colors || T.colors;
	        css = css || T.css;

	        colors.text = color;
	        css.txt = css.basic + 'font-family:'+font+'; font-size:'+size+'px; color:'+color+'; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';
	        if( shadow ) { css.txt += ' text-shadow:'+ shadow + '; '; } //"1px 1px 1px #ff0000";
	        css.txtselect = css.txt + 'padding:2px 5px; border:1px dashed ' + colors.border + '; background:'+ colors.txtselectbg+';';
	        css.item = css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px;';

	    },

	    clone: function ( o ) {

	        return o.cloneNode( true );

	    },

	    setSvg: function( dom, type, value, id ){

	        if( id === -1 ) { dom.setAttributeNS( null, type, value ); }
	        else { dom.childNodes[ id || 0 ].setAttributeNS( null, type, value ); }

	    },

	    setCss: function( dom, css ){

	        for( var r in css ){
	            if( T.DOM_SIZE.indexOf(r) !== -1 ) { dom.style[r] = css[r] + 'px'; }
	            else { dom.style[r] = css[r]; }
	        }

	    },

	    set: function( g, o ){

	        for( var att in o ){
	            if( att === 'txt' ) { g.textContent = o[ att ]; }
	            g.setAttributeNS( null, att, o[ att ] );
	        }
	        
	    },

	    get: function( dom, id ){

	        if( id === undefined ) { return dom; } // root
	        else if( !isNaN( id ) ) { return dom.childNodes[ id ]; } // first child
	        else if( id instanceof Array ){
	            if(id.length === 2) { return dom.childNodes[ id[0] ].childNodes[ id[1] ]; }
	            if(id.length === 3) { return dom.childNodes[ id[0] ].childNodes[ id[1] ].childNodes[ id[2] ]; }
	        }

	    },

	    dom : function ( type, css, obj, dom, id ) {

	        type = type || 'div';

	        if( T.SVG_TYPE_D.indexOf(type) !== -1 || T.SVG_TYPE_G.indexOf(type) !== -1 ){ // is svg element

	            if( type ==='svg' ){

	                dom = document.createElementNS( T.svgns, 'svg' );
	                T.set( dom, obj );

	            } else {
	                // create new svg if not def
	                if( dom === undefined ) { dom = document.createElementNS( T.svgns, 'svg' ); }
	                T.addAttributes( dom, type, obj, id );

	            }
	            
	        } else { // is html element

	            if( dom === undefined ) { dom = document.createElementNS( T.htmls, type ); }
	            else { dom = dom.appendChild( document.createElementNS( T.htmls, type ) ); }

	        }

	        if( css ) { dom.style.cssText = css; } 

	        if( id === undefined ) { return dom; }
	        else { return dom.childNodes[ id || 0 ]; }

	    },

	    addAttributes : function( dom, type, o, id ){

	        var g = document.createElementNS( T.svgns, type );
	        T.set( g, o );
	        T.get( dom, id ).appendChild( g );
	        if( T.SVG_TYPE_G.indexOf(type) !== -1 ) { g.style.pointerEvents = 'none'; }
	        return g;

	    },

	    clear : function( dom ){

	        T.purge( dom );
	        while (dom.firstChild) {
	            if ( dom.firstChild.firstChild ) { T.clear( dom.firstChild ); }
	            dom.removeChild( dom.firstChild ); 
	        }

	    },

	    purge : function ( dom ) {

	        var a = dom.attributes, i, n;
	        if (a) {
	            i = a.length;
	            while(i--){
	                n = a[i].name;
	                if (typeof dom[n] === 'function') { dom[n] = null; }
	            }
	        }
	        a = dom.childNodes;
	        if (a) {
	            i = a.length;
	            while(i--){ 
	                T.purge( dom.childNodes[i] ); 
	            }
	        }

	    },

	    clamp: function ( value, min, max ) {

	        //return value <= min ? min : value >= max ? max : value;
	        return value < min ? min : value > max ? max : value;
	        //return Math.max( min, Math.min( max, value ) );

	    },

	    // ----------------------
	    //   Color function
	    // ----------------------

	    ColorLuma : function ( hex, l ) {

	        // validate hex string
	        hex = String(hex).replace(/[^0-9a-f]/gi, '');
	        if (hex.length < 6) {
	            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	        }
	        l = l || 0;

	        // convert to decimal and change luminosity
	        var rgb = "#", c, i;
	        for (i = 0; i < 3; i++) {
	            c = parseInt(hex.substr(i*2,2), 16);
	            c = Math.round(Math.min(Math.max(0, c + (c * l)), 255)).toString(16);
	            rgb += ("00"+c).substr(c.length);
	        }

	        return rgb;

	    },

	    findDeepInver: function ( c ) { 

	        return (c[0] * 0.3 + c[1] * .59 + c[2] * .11) <= 0.6;
	        
	    },


	    hexToHtml: function ( v ) { 
	        v = v === undefined ? 0x000000 : v;
	        return "#" + ("000000" + v.toString(16)).substr(-6);
	        
	    },

	    htmlToHex: function ( v ) { 

	        return v.toUpperCase().replace("#", "0x");

	    },

	    u255: function (c, i) {

	        return parseInt(c.substring(i, i + 2), 16) / 255;

	    },

	    u16: function ( c, i ) {

	        return parseInt(c.substring(i, i + 1), 16) / 15;

	    },

	    unpack: function( c ){

	        if (c.length == 7) { return [ T.u255(c, 1), T.u255(c, 3), T.u255(c, 5) ]; }
	        else if (c.length == 4) { return [ T.u16(c,1), T.u16(c,2), T.u16(c,3) ]; }

	    },

	    htmlRgb: function( c ){

	        return 'rgb(' + Math.round(c[0] * 255) + ','+ Math.round(c[1] * 255) + ','+ Math.round(c[2] * 255) + ')';

	    },

	    rgbToHex : function( c ){

	        return '#' + ( '000000' + ( ( c[0] * 255 ) << 16 ^ ( c[1] * 255 ) << 8 ^ ( c[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

	    },

	    hueToRgb: function( p, q, t ){

	        if ( t < 0 ) { t += 1; }
	        if ( t > 1 ) { t -= 1; }
	        if ( t < 1 / 6 ) { return p + ( q - p ) * 6 * t; }
	        if ( t < 1 / 2 ) { return q; }
	        if ( t < 2 / 3 ) { return p + ( q - p ) * 6 * ( 2 / 3 - t ); }
	        return p;

	    },

	    rgbToHsl: function ( c ) {

	        var r = c[0], g = c[1], b = c[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
	        if (l > 0 && l < 1) { s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l)); }
	        if (delta > 0) {
	            if (max == r && max != g) { h += (g - b) / delta; }
	            if (max == g && max != b) { h += (2 + (b - r) / delta); }
	            if (max == b && max != r) { h += (4 + (r - g) / delta); }
	            h /= 6;
	        }
	        return [ h, s, l ];

	    },

	    hslToRgb: function ( c ) {

	        var p, q, h = c[0], s = c[1], l = c[2];

	        if ( s === 0 ) { return [ l, l, l ]; }
	        else {
	            q = l <= 0.5 ? l * (s + 1) : l + s - ( l * s );
	            p = l * 2 - q;
	            return [ T.hueToRgb(p, q, h + 0.33333), T.hueToRgb(p, q, h), T.hueToRgb(p, q, h - 0.33333) ];
	        }

	    },

	    // ----------------------
	    //   SVG MODEL
	    // ----------------------

	    makeGradiant: function ( type, settings, parent, colors ) {

	        T.dom( type, null, settings, parent, 0 );

	        var n = parent.childNodes[0].childNodes.length - 1, c;

	        for( var i = 0; i < colors.length; i++ ){

	            c = colors[i];
	            T.dom( 'stop', null, { offset:c[0]+'%', style:'stop-color:'+c[1]+'; stop-opacity:'+c[2]+';' }, parent, [0,n] );

	        }

	    },

	    /*makeGraph: function () {

	        var w = 128;
	        var radius = 34;
	        var svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'butt' }, svg );//0
	        //T.dom( 'rect', '', { x:10, y:10, width:108, height:108, stroke:'rgba(0,0,0,0.3)', 'stroke-width':2 , fill:'none'}, svg );//1
	        //T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
	        
	        //T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.3)', 'stroke-width':7 , fill:'none'}, svg );//2
	        //T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
	        T.graph = svg;

	    },*/

	    makeKnob: function ( model ) {

	        var w = 128;
	        var radius = 34;
	        var svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
	        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'round' }, svg );//1
	        T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.1)', 'stroke-width':7 , fill:'none'}, svg );//2
	        T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
	        T.knob = svg;

	    },

	    makeCircular: function ( model ) {

	        var w = 128;
	        var radius = 40;
	        var svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'circle', '', { cx:64, cy:64, r:radius, stroke:'rgba(0,0,0,0.1)', 'stroke-width':10, fill:'none' }, svg );//0
	        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':7, fill:'none', 'stroke-linecap':'butt' }, svg );//1
	        T.circular = svg;

	    },

	    makeJoystick: function ( model ) {

	        //+' background:#f00;'

	        var w = 128;
	        var radius = Math.floor((w-30)*0.5);
	        var innerRadius = Math.floor(radius*0.6);
	        var svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'defs', null, {}, svg );
	        T.dom( 'g', null, {}, svg );

	        if( model === 0 ){

	        

	            // gradian background
	            var ccc = [ [40, 'rgb(0,0,0)', 0.3], [80, 'rgb(0,0,0)', 0], [90, 'rgb(50,50,50)', 0.4], [100, 'rgb(50,50,50)', 0] ];
	            T.makeGradiant( 'radialGradient', { id:'grad', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            // gradian shadow
	            ccc = [ [60, 'rgb(0,0,0)', 0.5], [100, 'rgb(0,0,0)', 0] ];
	            T.makeGradiant( 'radialGradient', { id:'gradS', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            // gradian stick
	            var cc0 = ['rgb(40,40,40)', 'rgb(48,48,48)', 'rgb(30,30,30)'];
	            var cc1 = ['rgb(1,90,197)', 'rgb(3,95,207)', 'rgb(0,65,167)'];

	            ccc = [ [30, cc0[0], 1], [60, cc0[1], 1], [80, cc0[1], 1], [100, cc0[2], 1] ];
	            T.makeGradiant( 'radialGradient', { id:'gradIn', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            ccc = [ [30, cc1[0], 1], [60, cc1[1], 1], [80, cc1[1], 1], [100, cc1[2], 1] ];
	            T.makeGradiant( 'radialGradient', { id:'gradIn2', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            // graph

	            T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:'url(#grad)' }, svg );//2
	            T.dom( 'circle', '', { cx:64+5, cy:64+10, r:innerRadius+10, fill:'url(#gradS)' }, svg );//3
	            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius, fill:'url(#gradIn)' }, svg );//4

	            T.joystick_0 = svg;

	        } else {
	             // gradian shadow
	            ccc = [ [69, 'rgb(0,0,0)', 0],[70, 'rgb(0,0,0)', 0.3], [100, 'rgb(0,0,0)', 0] ];
	            T.makeGradiant( 'radialGradient', { id:'gradX', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

	            T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:'none', stroke:'rgba(100,100,100,0.25)', 'stroke-width':'4' }, svg );//2
	            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius+14, fill:'url(#gradX)' }, svg );//3
	            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius, fill:'none', stroke:'rgb(100,100,100)', 'stroke-width':'4' }, svg );//4

	            T.joystick_1 = svg;
	        }

	        

	    },

	    makeColorRing: function () {

	        var w = 256;
	        var svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
	        T.dom( 'defs', null, {}, svg );
	        T.dom( 'g', null, {}, svg );

	        var s = 40;//stroke
	        var r =( w-s )*0.5;
	        var mid = w*0.5;
	        var n = 24, nudge = 8 / r / n * Math.PI, a1 = 0;
	        var am, tan, d2, a2, ar, i, j, path, ccc;
	        var color = [];
	        
	        for ( i = 0; i <= n; ++i) {

	            d2 = i / n;
	            a2 = d2 * T.TwoPI;
	            am = (a1 + a2) * 0.5;
	            tan = 1 / Math.cos((a2 - a1) * 0.5);

	            ar = [
	                Math.sin(a1), -Math.cos(a1), 
	                Math.sin(am) * tan, -Math.cos(am) * tan, 
	                Math.sin(a2), -Math.cos(a2)
	            ];
	            
	            color[1] = T.rgbToHex( T.hslToRgb([d2, 1, 0.5]) );

	            if (i > 0) {

	                j = 6;
	                while(j--){
	                   ar[j] = ((ar[j]*r)+mid).toFixed(2);
	                }

	                path = ' M' + ar[0] + ' ' + ar[1] + ' Q' + ar[2] + ' ' + ar[3] + ' ' + ar[4] + ' ' + ar[5];

	                ccc = [ [0,color[0],1], [100,color[1],1] ];
	                T.makeGradiant( 'linearGradient', { id:'G'+i, x1:ar[0], y1:ar[1], x2:ar[4], y2:ar[5], gradientUnits:"userSpaceOnUse" }, svg, ccc );

	                T.dom( 'path', '', { d:path, 'stroke-width':s, stroke:'url(#G'+i+')', 'stroke-linecap':"butt" }, svg, 1 );
	                
	            }
	            a1 = a2 - nudge; 
	            color[0] = color[1];
	        }

	        var br = (128 - s ) + 2;
	        var bw = 60;

	        // black / white
	        ccc = [ [0, '#FFFFFF', 1], [50, '#FFFFFF', 0], [50, '#000000', 0], [100, '#000000', 1] ];
	        T.makeGradiant( 'linearGradient', { id:'GL1', x1:mid-bw, y1:mid-bw, x2:mid-bw, y2:mid+bw, gradientUnits:"userSpaceOnUse" }, svg, ccc );

	        // saturation
	        ccc = [ [0, '#7f7f7f', 0], [50, '#7f7f7f', 0.5], [100, '#7f7f7f', 1] ];
	        T.makeGradiant( 'linearGradient', { id:'GL2', x1:mid-bw, y1:mid-bw, x2:mid+bw, y2:mid-bw, gradientUnits:"userSpaceOnUse" }, svg, ccc );

	        T.dom( 'circle', '', { cx:128, cy:128, r:br, fill:'red' }, svg );//2
	        T.dom( 'circle', '', { cx:128, cy:128, r:br, fill:'url(#GL2)' }, svg );//3
	        T.dom( 'circle', '', { cx:128, cy:128, r:br, fill:'url(#GL1)' }, svg );//4

	        //T.dom( 'polygon', '', { points:'128,0 256,190 0,210', r:br, fill:'url(#GL1)' }, svg );//4

	        //T.dom( 'circle', '', { cx:0, cy:0, r:6, 'stroke-width':3, stroke:'#FFF', fill:'none' }, svg );//5
	        //T.dom( 'circle', '', { cx:0, cy:0, r:6, 'stroke-width':3, stroke:'#000', fill:'none' }, svg );//6
	        T.dom( 'circle', '', { cx:0, cy:0, r:8, 'stroke-width':4, stroke:'#FFF', fill:'none' }, svg );//5
	        T.dom( 'circle', '', { cx:0, cy:0, r:8, 'stroke-width':4, stroke:'#000', fill:'none' }, svg );//6


	        T.colorRing = svg;

	    },

	    icon: function ( type, color, w ){

	        w = w || 40;
	        color = color || '#DEDEDE';
	        var viewBox = '0 0 256 256';
	        var t = ["<svg xmlns='"+T.svgns+"' version='1.1' xmlns:xlink='"+T.htmls+"' style='pointer-events:none;' preserveAspectRatio='xMinYMax meet' x='0px' y='0px' width='"+w+"px' height='"+w+"px' viewBox='"+viewBox+"'><g>"];
	        switch(type){
	            case 'logo':
	            //t[1]="<path id='logoin' stroke='"+color+"' stroke-width='16' stroke-linejoin='round' stroke-linecap='square' fill='none' d='M 192 44 L 192 148 Q 192 174.5 173.3 193.25 154.55 212 128 212 101.5 212 82.75 193.25 64 174.5 64 148 L 64 44 M 160 44 L 160 148 Q 160 161.25 150.65 170.65 141.25 180 128 180 114.75 180 105.35 170.65 96 161.25 96 148 L 96 44'/>";
	            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logoFill_d+"'/>";
	            
	            break;
	            case 'save':
	            t[1]="<path stroke='"+color+"' stroke-width='4' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 26.125 17 L 20 22.95 14.05 17 M 20 9.95 L 20 22.95'/><path stroke='"+color+"' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 32.6 23 L 32.6 25.5 Q 32.6 28.5 29.6 28.5 L 10.6 28.5 Q 7.6 28.5 7.6 25.5 L 7.6 23'/>";
	            break;
	        }
	        t[2] = "</g></svg>";
	        return t.join("\n");

	    },

	    logoFill_d: [
	    "M 171 150.75 L 171 33.25 155.5 33.25 155.5 150.75 Q 155.5 162.2 147.45 170.2 139.45 178.25 128 178.25 116.6 178.25 108.55 170.2 100.5 162.2 100.5 150.75 ",
	    "L 100.5 33.25 85 33.25 85 150.75 Q 85 168.65 97.55 181.15 110.15 193.75 128 193.75 145.9 193.75 158.4 181.15 171 168.65 171 150.75 ",
	    "M 200 33.25 L 184 33.25 184 150.8 Q 184 174.1 167.6 190.4 151.3 206.8 128 206.8 104.75 206.8 88.3 190.4 72 174.1 72 150.8 L 72 33.25 56 33.25 56 150.75 ",
	    "Q 56 180.55 77.05 201.6 98.2 222.75 128 222.75 157.8 222.75 178.9 201.6 200 180.55 200 150.75 L 200 33.25 Z" ].join('\n'),

	};

	T.setText();

	var Tools = T;

	/**
	 * @author lth / https://github.com/lo-th
	 */

	// INTENAL FUNCTION

	var R = {

		ui: [],

		ID: null,
	    lock:false,
	    wlock:false,
	    current:-1,

		needReZone: true,
		isEventsInit: false,

	    prevDefault: ['contextmenu', 'mousedown', 'mousemove', 'mouseup'],

		xmlserializer: new XMLSerializer(),
		tmpTime: null,
	    tmpImage: null,

	    oldCursor:'auto',

	    input: null,
	    parent: null,
	    firstImput: true,
	    //callbackImput: null,
	    hiddenImput:null,
	    hiddenSizer:null,
	    hasFocus:false,
	    startInput:false,
	    inputRange : [0,0],
	    cursorId : 0,
	    str:'',
	    pos:0,
	    startX:-1,
	    moveX:-1,

	    debugInput:false,

	    isLoop: false,
	    listens: [],

	    e:{
	        type:null,
	        clientX:0,
	        clientY:0,
	        keyCode:NaN,
	        key:null,
	        delta:0,
	    },

	    isMobile: false,

	    

		add: function ( o ) {

	        R.ui.push( o );
	        R.getZone( o );

	        if( !R.isEventsInit ) { R.initEvents(); }

	    },

	    testMobile: function () {

	        var n = navigator.userAgent;
	        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) { return true; }
	        else { return false; }  

	    },

	    remove: function ( o ) {

	        var i = R.ui.indexOf( o );
	        
	        if ( i !== -1 ) {
	            R.removeListen( o );
	            R.ui.splice( i, 1 ); 
	        }

	        if( R.ui.length === 0 ){
	            R.removeEvents();
	        }

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    initEvents: function () {

	        if( R.isEventsInit ) { return; }

	        var domElement = document.body;

	        R.isMobile = R.testMobile();

	        if( R.isMobile ){
	            domElement.addEventListener( 'touchstart', R, false );
	            domElement.addEventListener( 'touchend', R, false );
	            domElement.addEventListener( 'touchmove', R, false );
	        }else{
	            domElement.addEventListener( 'mousedown', R, false );
	            domElement.addEventListener( 'contextmenu', R, false );
	            domElement.addEventListener( 'wheel', R, false );
	            document.addEventListener( 'mousemove', R, false );
	            document.addEventListener( 'mouseup', R, false );
	        }

	        window.addEventListener( 'keydown', R, false );
	        window.addEventListener( 'keyup', R, false );
	        window.addEventListener( 'resize', R.resize , false );
	        //window.addEventListener( 'mousedown', R, false );

	        R.isEventsInit = true;

	    },

	    removeEvents: function () {

	        if( !R.isEventsInit ) { return; }

	        var domElement = document.body;

	        if( R.isMobile ){
	            domElement.removeEventListener( 'touchstart', R, false );
	            domElement.removeEventListener( 'touchend', R, false );
	            domElement.removeEventListener( 'touchmove', R, false );
	        }else{
	            domElement.removeEventListener( 'mousedown', R, false );
	            domElement.removeEventListener( 'contextmenu', R, false );
	            domElement.removeEventListener( 'wheel', R, false );
	            document.removeEventListener( 'mousemove', R, false );
	            document.removeEventListener( 'mouseup', R, false );
	        }

	        window.removeEventListener( 'keydown', R );
	        window.removeEventListener( 'keyup', R );
	        window.removeEventListener( 'resize', R.resize  );

	        R.isEventsInit = false;

	    },

	    resize: function () {

	        R.needReZone = true;

	        var i = R.ui.length, u;
	        
	        while( i-- ){

	            u = R.ui[i];
	            if( u.isGui && !u.isCanvasOnly && u.autoResize ) { u.setHeight(); }
	        
	        }

	    },

	    // ----------------------
	    //   HANDLE EVENTS
	    // ----------------------
	    

	    handleEvent: function ( event ) {

	        //if(!event.type) return;

	      //  console.log( event.type )

	        if( event.type.indexOf( R.prevDefault ) !== -1 ) { event.preventDefault(); } 

	        if( event.type === 'contextmenu' ) { return; } 

	        //if( event.type === 'keydown'){ R.editText( event ); return;}

	        //if( event.type !== 'keydown' && event.type !== 'wheel' ) event.preventDefault();
	        //event.stopPropagation();

	        R.findZone();
	       
	        var e = R.e;

	        if( event.type === 'keydown') { R.keydown( event ); }
	        if( event.type === 'keyup') { R.keyup( event ); }

	        if( event.type === 'wheel' ) { e.delta = event.deltaY > 0 ? 1 : -1; }
	        else { e.delta = 0; }
	        
	        e.clientX = event.clientX || 0;
	        e.clientY = event.clientY || 0;
	        e.type = event.type;

	        // mobile

	        if( R.isMobile ){

	            if( event.touches && event.touches.length > 0 ){
	        
	                e.clientX = event.touches[ 0 ].clientX || 0;
	                e.clientY = event.touches[ 0 ].clientY || 0;

	            }

	            if( event.type === 'touchstart') { e.type = 'mousedown'; }
	            if( event.type === 'touchend') { e.type = 'mouseup'; }
	            if( event.type === 'touchmove') { e.type = 'mousemove'; }

	        }
	        
	        
	        /*
	        if( event.type === 'touchstart'){ e.type = 'mousedown'; R.findID( e ); }
	        if( event.type === 'touchend'){ e.type = 'mouseup';  if( R.ID !== null ) R.ID.handleEvent( e ); R.clearOldID(); }
	        if( event.type === 'touchmove'){ e.type = 'mousemove';  }
	        */


	        if( e.type === 'mousedown' ) { R.lock = true; }
	        if( e.type === 'mouseup' ) { R.lock = false; }

	        if( R.isMobile && e.type === 'mousedown' ) { R.findID( e ); }
	        if( e.type === 'mousemove' && !R.lock ) { R.findID( e ); }
	        

	        if( R.ID !== null ){

	            if( R.ID.isCanvasOnly ) {

	                e.clientX = R.ID.mouse.x;
	                e.clientY = R.ID.mouse.y;

	            }

	            R.ID.handleEvent( e );

	        }

	        if( R.isMobile && e.type === 'mouseup' ) { R.clearOldID(); }

	    },

	    // ----------------------
	    //   ID
	    // ----------------------

	    findID: function ( e ) {

	        var i = R.ui.length, next = -1, u, x, y;

	        while( i-- ){

	            u = R.ui[i];

	            if( u.isCanvasOnly ) {

	                x = u.mouse.x;
	                y = u.mouse.y;

	            } else {

	                x = e.clientX;
	                y = e.clientY;

	            }

	            if( R.onZone( u, x, y ) ){ 
	                
	                next = i;
	                
	                if( next !== R.current ){
	                    R.clearOldID();
	                    R.current = next;
	                    R.ID = u;
	                }
	                break;
	            }
	                
	        }

	        if( next === -1 ) { R.clearOldID(); }

	    },

	    clearOldID: function () {

	        if( !R.ID ) { return; }
	        R.current = -1;
	        R.ID.reset();
	        R.ID = null;
	        R.cursor();

	    },

	    // ----------------------
	    //   GUI / GROUP FUNCTION
	    // ----------------------

	    calcUis: function ( uis, zone, py ) {

	        var lng = uis.length, u, i, px = 0, my = 0;

	        for( i = 0; i < lng; i++ ){

	            u = uis[i];

	            u.zone.w = u.w;
	            u.zone.h = u.h;

	            if( !u.autoWidth ){

	                if( px === 0 ) { py += u.h + 1; }

	                u.zone.x = zone.x + px;
	                u.zone.y = px === 0 ? py - u.h : my;

	                my = u.zone.y;
	                
	                px += u.w;
	                if( px + u.w > zone.w ) { px = 0; }

	            } else {

	                u.zone.x = zone.x;
	                u.zone.y = py;
	                py += u.h + 1;

	            }

	            if( u.isGroup ) { u.calcUis(); }

	        }

	    },


		findTarget: function ( uis, e ) {

	        var i = uis.length;

	        while( i-- ){
	            if( R.onZone( uis[i], e.clientX, e.clientY ) ) { return i; }
	        }

	        return -1;

	    },

	    // ----------------------
	    //   ZONE
	    // ----------------------

	    findZone: function ( force ) {

	        if( !R.needReZone && !force ) { return; }

	        var i = R.ui.length, u;

	        while( i-- ){ 

	            u = R.ui[i];
	            R.getZone( u );
	            if( u.isGui ) { u.calcUis(); }

	        }

	        R.needReZone = false;

	    },

	    onZone: function ( o, x, y ) {

	        if( x === undefined || y === undefined ) { return false; }

	        var z = o.zone;
	        var mx = x - z.x;
	        var my = y - z.y;

	        var over = ( mx >= 0 ) && ( my >= 0 ) && ( mx <= z.w ) && ( my <= z.h );

	        if( over ) { o.local.set( mx, my ); }
	        else { o.local.neg(); }

	        return over;

	    },

	    getZone: function ( o ) {

	        if( o.isCanvasOnly ) { return; }
	        var r = o.getDom().getBoundingClientRect();
	        o.zone = { x:r.left, y:r.top, w:r.width, h:r.height };

	    },

	    // ----------------------
	    //   CURSOR
	    // ----------------------

	    cursor: function ( name ) {

	        name = name ? name : 'auto';
	        if( name !== R.oldCursor ){
	            document.body.style.cursor = name;
	            R.oldCursor = name;
	        }

	    },

	    // ----------------------
	    //   CANVAS
	    // ----------------------

	    toCanvas: function ( o, w, h, force ) {

	        // prevent exesive redraw

	        if( force && R.tmpTime !== null ) { clearTimeout(R.tmpTime); R.tmpTime = null;  }

	        if( R.tmpTime !== null ) { return; }

	        if( R.lock ) { R.tmpTime = setTimeout( function(){ R.tmpTime = null; }, 10 ); }

	        ///

	        var isNewSize = false;
	        if( w !== o.canvas.width || h !== o.canvas.height ) { isNewSize = true; }

	        if( R.tmpImage === null ) { R.tmpImage = new Image(); }

	        var img = R.tmpImage; //new Image();

	        var htmlString = R.xmlserializer.serializeToString( o.content );
	        
	        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><foreignObject style="pointer-events: none; left:0;" width="100%" height="100%">'+ htmlString +'</foreignObject></svg>';

	        img.onload = function() {

	            var ctx = o.canvas.getContext("2d");

	            if( isNewSize ){ 
	                o.canvas.width = w;
	                o.canvas.height = h;
	            }else{
	                ctx.clearRect( 0, 0, w, h );
	            }
	            ctx.drawImage( this, 0, 0 );

	            o.onDraw();

	        };

	        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
	        //img.src = 'data:image/svg+xml;base64,'+ window.btoa( svg );
	        img.crossOrigin = '';


	    },

	    // ----------------------
	    //   INPUT
	    // ----------------------

	    setHidden: function () {

	        if( R.hiddenImput === null ){

	            var hide = R.debugInput ? '' : 'opacity:0; zIndex:0;';

	            var css = R.parent.css.txt + 'padding:0; width:auto; height:auto; text-shadow:none;';
	            css += 'left:10px; top:auto; border:none; color:#FFF; background:#000;' + hide;

	            R.hiddenImput = document.createElement('input');
	            R.hiddenImput.type = 'text';
	            R.hiddenImput.style.cssText = css + 'bottom:30px;' + (R.debugInput ? '' : 'transform:scale(0);');
	            R.hiddenSizer = document.createElement('div');
	            R.hiddenSizer.style.cssText = css + 'bottom:60px;';
	            
	            document.body.appendChild( R.hiddenImput );
	            document.body.appendChild( R.hiddenSizer );

	        }

	        R.hiddenImput.style.width = R.input.clientWidth + 'px';
	        R.hiddenImput.value = R.str;
	        R.hiddenSizer.innerHTML = R.str;

	        R.hasFocus = true;

	    },

	    clearHidden: function ( p ) {

	        if( R.hiddenImput === null ) { return; }
	        R.hasFocus = false;

	    },

	    clickPos: function( x ){

	        var i = R.str.length, l = 0, n = 0;
	        while( i-- ){
	            l += R.textWidth( R.str[n] );
	            if( l >= x ) { break; }
	            n++;
	        }
	        return n;

	    },

	    upInput: function ( x, down ) {

	        if( R.parent === null ) { return false; }

	        var up = false;
	     
	        if( down ){

	            var id = R.clickPos( x );

	            R.moveX = id;

	            if( R.startX === -1 ){ 

	                R.startX = id;
	                R.cursorId = id;
	                R.inputRange = [ R.startX, R.startX ];

	            } else {
	            
	                var isSelection = R.moveX !== R.startX;

	                if( isSelection ){
	                    if( R.startX > R.moveX ) { R.inputRange = [ R.moveX, R.startX ]; }
	                    else { R.inputRange = [ R.startX, R.moveX ]; }    
	                }
	            }

	            up = true;
	            
	        } else {

	            if( R.startX !== -1 ){

	                R.hasFocus = true;
	                R.hiddenImput.focus();
	                R.hiddenImput.selectionStart = R.inputRange[0];
	                R.hiddenImput.selectionEnd = R.inputRange[1];
	                R.startX = -1;

	                up = true;

	            }

	        }

	        if( up ) { R.selectParent(); }

	        return up;

	    },

	    selectParent: function (){

	        var c = R.textWidth( R.str.substring( 0, R.cursorId ));
	        var e = R.textWidth( R.str.substring( 0, R.inputRange[0] ));
	        var s = R.textWidth( R.str.substring( R.inputRange[0],  R.inputRange[1] ));

	        R.parent.select( c, e, s );

	    },

	    textWidth: function ( text ){

	        if( R.hiddenSizer === null ) { return 0; }
	        text = text.replace(/ /g, '&nbsp;');
	        R.hiddenSizer.innerHTML = text;
	        return R.hiddenSizer.clientWidth;

	    },


	    clearInput: function () {

	        if( R.parent === null ) { return; }
	        if( !R.firstImput ) { R.parent.validate(); }

	        R.clearHidden();
	        R.parent.unselect();

	        //R.input.style.background = 'none';
	        R.input.style.background = R.parent.colors.inputBg;
	        R.input.style.borderColor = R.parent.colors.inputBorder;
	        R.parent.isEdit = false;

	        R.input = null;
	        R.parent = null;
	        R.str = '',
	        R.firstImput = true;

	    },

	    setInput: function ( Input, parent ) {

	        R.clearInput();
	        
	        R.input = Input;
	        R.parent = parent;

	        R.input.style.background = R.parent.colors.inputOver;
	        R.input.style.borderColor = R.parent.colors.inputBorderSelect;
	        R.str = R.input.textContent;

	        R.setHidden();

	    },

	    /*select: function () {

	        document.execCommand( "selectall", null, false );

	    },*/

	    keydown: function ( e ) {

	        if( R.parent === null ) { return; }

	        var keyCode = e.which;

	        R.firstImput = false;


	        if (R.hasFocus) {
	            // hack to fix touch event bug in iOS Safari
	            window.focus();
	            R.hiddenImput.focus();

	        }


	        R.parent.isEdit = true;

	       // e.preventDefault();

	        // add support for Ctrl/Cmd+A selection
	        //if ( keyCode === 65 && (e.ctrlKey || e.metaKey )) {
	            //R.selectText();
	            //e.preventDefault();
	            //return self.render();
	        //}

	        if( keyCode === 13 ){ //enter

	            R.clearInput();

	        } else if( keyCode === 9 ); else {

	            if( R.input.isNum ){
	                if ( ((e.keyCode > 95) && (e.keyCode < 106)) || e.keyCode === 110 || e.keyCode === 109 ){
	                    R.hiddenImput.readOnly = false;
	                } else {
	                    R.hiddenImput.readOnly = true;
	                }
	            } else {
	                R.hiddenImput.readOnly = false;
	            }

	        }

	    },

	    keyup: function ( e ) {

	        if( R.parent === null ) { return; }

	        R.str = R.hiddenImput.value;
	        R.input.textContent = R.str;
	        R.cursorId = R.hiddenImput.selectionStart;
	        R.inputRange = [ R.hiddenImput.selectionStart, R.hiddenImput.selectionEnd ];

	        R.selectParent();

	        if( R.parent.allway ) { R.parent.validate(); }

	    },

	    // ----------------------
	    //
	    //   LISTENING
	    //
	    // ----------------------

	    loop: function () {

	        if( R.isLoop ) { requestAnimationFrame( R.loop ); }
	        R.update();

	    },

	    update: function () {

	        var i = R.listens.length;
	        while(i--) { R.listens[i].listening(); }

	    },

	    removeListen: function ( proto ) {

	        var id = R.listens.indexOf( proto );
	        if( id !== -1 ) { R.listens.splice(id, 1); }
	        if( R.listens.length === 0 ) { R.isLoop = false; }

	    },

	    addListen: function ( proto ) {

	        var id = R.listens.indexOf( proto );

	        if( id !== -1 ) { return; } 

	        R.listens.push( proto );

	        if( !R.isLoop ){
	            R.isLoop = true;
	            R.loop();
	        }

	    },

	};

	var Roots = R;

	// minimal vector 2

	function V2 ( x, y ){

		this.x = x || 0;
		this.y = y || 0;

	}

	Object.assign( V2.prototype, {

		set: function ( x, y ) {

			this.x = x;
			this.y = y;

			return this;

		},

		divide: function ( v ) {

			this.x /= v.x;
			this.y /= v.y;

			return this;

		},

		multiply: function ( v ) {

			this.x *= v.x;
			this.y *= v.y;

			return this;

		},

		multiplyScalar: function ( scalar ) {

			this.x *= scalar;
			this.y *= scalar;

			return this;

		},

		divideScalar: function ( scalar ) {

			return this.multiplyScalar( 1 / scalar );

		},

		length: function () {

			return Math.sqrt( this.x * this.x + this.y * this.y );

		},

		angle: function () {

			// computes the angle in radians with respect to the positive x-axis

			var angle = Math.atan2( this.y, this.x );

			if ( angle < 0 ) { angle += 2 * Math.PI; }

			return angle;

		},

		addScalar: function ( s ) {

			this.x += s;
			this.y += s;

			return this;

		},

		negate: function () {

			this.x *= -1;
			this.y *= -1;

			return this;

		},

		neg: function () {

			this.x = -1;
			this.y = -1;

			return this;

		},

		isZero: function () {

			return ( this.x === 0 && this.y === 0 );

		},

		copy: function ( v ) {

			this.x = v.x;
			this.y = v.y;

			return this;

		},

		equals: function ( v ) {

			return ( ( v.x === this.x ) && ( v.y === this.y ) );

		},

		nearEquals: function ( v, n ) {

			return ( ( v.x.toFixed(n) === this.x.toFixed(n) ) && ( v.y.toFixed(n) === this.y.toFixed(n) ) );

		},

		lerp: function ( v, alpha ) {

			if(v===null){
				this.x -= this.x * alpha;
			    this.y -= this.y * alpha;
			} else {
				this.x += ( v.x - this.x ) * alpha;
			    this.y += ( v.y - this.y ) * alpha;
			}

			

			return this;

		},



	} );

	/**
	 * @author lth / https://github.com/lo-th
	 */

	function Proto ( o ) {

	    o = o || {};


	    // if is on gui or group
	    this.main = o.main || null;
	    this.isUI = o.isUI || false;
	    this.parentGroup = null;

	    this.css = this.main ? this.main.css : Tools.css;
	    this.colors = this.main ? this.main.colors : Tools.colors;

	    this.defaultBorderColor = this.colors.border;
	    this.svgs = Tools.svgs;

	    // only space 
	    this.isEmpty = o.isEmpty || false;

	    this.zone = { x:0, y:0, w:0, h:0 };
	    this.local = new V2().neg();

	    this.isCanvasOnly = false;

	    this.isSelect = false;

	    // percent of title
	    this.p = o.p !== undefined ? o.p : Tools.size.p;

	    this.w = this.isUI ? this.main.size.w : Tools.size.w;
	    if( o.w !== undefined ) { this.w = o.w; }

	    this.h = this.isUI ? this.main.size.h : Tools.size.h;
	    if( o.h !== undefined ) { this.h = o.h; }
	    if(!this.isEmpty) { this.h = this.h < 11 ? 11 : this.h; }

	    // if need resize width
	    this.autoWidth = o.auto || true;

	    // open statu
	    this.isOpen = false;

	    // radius for toolbox
	    this.radius = o.radius || 0;

	    // only for number
	    this.isNumber = false;

	    // only most simple 
	    this.mono = false;

	    // stop listening for edit slide text
	    this.isEdit = false;

	    // no title 
	    this.simple = o.simple || false;
	    if( this.simple ) { this.sa = 0; }

	    

	    // define obj size
	    this.setSize( this.w );

	    // title size
	    if(o.sa !== undefined ) { this.sa = o.sa; }
	    if(o.sb !== undefined ) { this.sb = o.sb; }

	    if( this.simple ) { this.sb = this.w - this.sa; }

	    // last number size for slide
	    this.sc = o.sc === undefined ? 47 : o.sc;

	    // for listening object
	    this.objectLink = null;
	    this.isSend = false;
	    this.val = null;
	    
	    // Background
	    this.bg = this.colors.background;//this.isUI ? this.main.bg : Tools.colors.background;
	    this.bgOver = this.colors.backgroundOver;
	    if( o.bg !== undefined ){ this.bg = o.bg; this.bgOver = o.bg; }
	    if( o.bgOver !== undefined ){ this.bgOver = o.bgOver; }

	    // Font Color;
	    this.titleColor = o.titleColor || this.colors.text;
	    this.fontColor = o.fontColor || this.colors.text;

	    if( o.color !== undefined ){ 

	        if(o.color === 'n') { o.color = '#ff0000'; }

	        if( o.color !== 'no' ) {
	            if( !isNaN(o.color) ) { this.fontColor = Tools.hexToHtml(o.color); }
	            else { this.fontColor = o.color; }
	            this.titleColor = this.fontColor;
	        }
	        
	    }
	    
	    /*if( o.color !== undefined ){ 
	        if( !isNaN(o.color) ) this.fontColor = Tools.hexToHtml(o.color);
	        else this.fontColor = o.color;
	        this.titleColor = this.fontColor;
	    }*/

	    this.colorPlus = Tools.ColorLuma( this.fontColor, 0.3 );

	    this.txt = o.name || 'Proto';
	    this.rename = o.rename || '';
	    this.target = o.target || null;

	    this.callback = o.callback === undefined ? null : o.callback;
	    this.endCallback = null;

	    if( this.callback === null && this.isUI && this.main.callback !== null ) { this.callback = this.main.callback; }

	    // elements
	    this.c = [];

	    // style 
	    this.s = [];


	    this.c[0] = Tools.dom( 'div', this.css.basic + 'position:relative; height:20px; float:left; overflow:hidden;');
	    this.s[0] = this.c[0].style;

	    if( this.isUI ) { this.s[0].marginBottom = '1px'; }
	    
	    // with title
	    if( !this.simple ){ 
	        this.c[1] = Tools.dom( 'div', this.css.txt );
	        this.s[1] = this.c[1].style;
	        this.c[1].textContent = this.rename === '' ? this.txt : this.rename;
	        this.s[1].color = this.titleColor;
	    }

	    if( o.pos ){
	        this.s[0].position = 'absolute';
	        for(var p in o.pos){
	            this.s[0][p] = o.pos[p];
	        }
	        this.mono = true;
	    }

	    if( o.css ) { this.s[0].cssText = o.css; } 
	    

	}

	Object.assign( Proto.prototype, {

	    constructor: Proto,

	    // ----------------------
	    // make de node
	    // ----------------------
	    
	    init: function () {

	        this.zone.h = this.h;


	        var s = this.s; // style cache
	        var c = this.c; // div cach

	        s[0].height = this.h + 'px';

	        if( this.isUI  ) { s[0].background = this.bg; }
	        if( this.isEmpty  ) { s[0].background = 'none'; }

	        //if( this.autoHeight ) s[0].transition = 'height 0.01s ease-out';
	        if( c[1] !== undefined && this.autoWidth ){
	            s[1] = c[1].style;
	            s[1].height = (this.h-4) + 'px';
	            s[1].lineHeight = (this.h-8) + 'px';
	        }

	        var frag = Tools.frag;

	        for( var i = 1, lng = c.length; i !== lng; i++ ){
	            if( c[i] !== undefined ) {
	                frag.appendChild( c[i] );
	                s[i] = c[i].style;
	            }
	        }

	        if( this.target !== null ){ 
	            this.target.appendChild( c[0] );
	        } else {
	            if( this.isUI ) { this.main.inner.appendChild( c[0] ); }
	            else { document.body.appendChild( c[0] ); }
	        }

	        c[0].appendChild( frag );

	        this.rSize();

	        // ! solo proto
	        if( !this.isUI ){

	            this.c[0].style.pointerEvents = 'auto';
	            Roots.add( this );
	            
	        }

	    },

	    // TRANS FUNCTIONS from Tools

	    dom: function ( type, css, obj, dom, id ) {

	        return Tools.dom( type, css, obj, dom, id );

	    },

	    setSvg: function ( dom, type, value, id ) {

	        Tools.setSvg( dom, type, value, id );

	    },

	    setCss: function ( dom, css ) {

	        Tools.setCss( dom, css );

	    },

	    clamp: function ( value, min, max ) {

	        return Tools.clamp( value, min, max );

	    },

	    getColorRing: function () {

	        if( !Tools.colorRing ) { Tools.makeColorRing(); }
	        return Tools.clone( Tools.colorRing );

	    },

	    getJoystick: function ( model ) {

	        if( !Tools[ 'joystick_'+ model ] ) { Tools.makeJoystick( model ); }
	        return Tools.clone( Tools[ 'joystick_'+ model ] );

	    },

	    getCircular: function ( model ) {

	        if( !Tools.circular ) { Tools.makeCircular( model ); }
	        return Tools.clone( Tools.circular );

	    },

	    getKnob: function ( model ) {

	        if( !Tools.knob ) { Tools.makeKnob( model ); }
	        return Tools.clone( Tools.knob );

	    },

	    /*getGraph: function () {

	         if( !Tools.graph ) Tools.makeGraph();
	         return Tools.clone( Tools.graph );

	    },*/

	    // TRANS FUNCTIONS from Roots

	    cursor: function ( name ) {

	         Roots.cursor( name );

	    },

	    

	    /////////

	    update: function () {},

	    reset:  function () {},

	    /////////

	    getDom: function () {

	        return this.c[0];

	    },

	    uiout: function () {

	        if( this.isEmpty ) { return; }

	        this.s[0].background = this.bg;

	    },

	    uiover: function () {

	        if( this.isEmpty ) { return; }

	        this.s[0].background = this.bgOver;

	    },

	    rename: function ( s ) {

	        if( this.c[1] !== undefined) { this.c[1].textContent = s; }

	    },

	    listen: function () {

	        Roots.addListen( this );
	        //Roots.listens.push( this );
	        return this;

	    },

	    listening: function () {

	        if( this.objectLink === null ) { return; }
	        if( this.isSend ) { return; }
	        if( this.isEdit ) { return; }

	        this.setValue( this.objectLink[ this.val ] );

	    },

	    setValue: function ( v ) {

	        if( this.isNumber ) { this.value = this.numValue( v ); }
	        else { this.value = v; }
	        this.update();

	    },


	    // ----------------------
	    // update every change
	    // ----------------------

	    onChange: function ( f ) {

	        if( this.isEmpty ) { return; }

	        this.callback = f;
	        return this;

	    },

	    // ----------------------
	    // update only on end
	    // ----------------------

	    onFinishChange: function ( f ) {

	        if( this.isEmpty ) { return; }

	        this.callback = null;
	        this.endCallback = f;
	        return this;

	    },

	    send: function ( v ) {

	        this.isSend = true;
	        if( this.objectLink !== null ) { this.objectLink[ this.val ] = v || this.value; }
	        if( this.callback ) { this.callback( v || this.value ); }
	        this.isSend = false;

	    },

	    sendEnd: function ( v ) {

	        if( this.endCallback ) { this.endCallback( v || this.value ); }
	        if( this.objectLink !== null ) { this.objectLink[ this.val ] = v || this.value; }

	    },

	    // ----------------------
	    // clear node
	    // ----------------------
	    
	    clear: function () {

	        Tools.clear( this.c[0] );

	        if( this.target !== null ){ 
	            this.target.removeChild( this.c[0] );
	        } else {
	            if( this.isUI ) { this.main.clearOne( this ); }
	            else { document.body.removeChild( this.c[0] ); }
	        }

	        if( !this.isUI ) { Roots.remove( this ); }

	        this.c = null;
	        this.s = null;
	        this.callback = null;
	        this.target = null;

	    },

	    // ----------------------
	    // change size 
	    // ----------------------

	    setSize: function ( sx ) {

	        if( !this.autoWidth ) { return; }

	        this.w = sx;

	        if( this.simple ){
	            this.sb = this.w - this.sa;
	        } else {
	            var pp = this.w * ( this.p / 100 );
	            this.sa = Math.floor( pp + 10 );
	            this.sb = Math.floor( this.w - pp - 20 );
	        }

	    },

	    rSize: function () {

	        if( !this.autoWidth ) { return; }
	        this.s[0].width = this.w + 'px';
	        if( !this.simple ) { this.s[1].width = this.sa + 'px'; }
	    
	    },

	    // ----------------------
	    // for numeric value
	    // ----------------------

	    setTypeNumber: function ( o ) {

	        this.isNumber = true;

	        this.value = 0;
	        if(o.value !== undefined){
	            if( typeof o.value === 'string' ) { this.value = o.value * 1; }
	            else { this.value = o.value; }
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
	    //   EVENTS DEFAULT
	    // ----------------------

	    handleEvent: function ( e ){

	        if( this.isEmpty ) { return; }
	        return this[e.type](e);
	    
	    },

	    wheel: function ( e ) { return false; },

	    mousedown: function( e ) { return false; },

	    mousemove: function( e ) { return false; },

	    mouseup: function( e ) { return false; },

	    keydown: function( e ) { return false; },

	    keyup: function( e ) { return false; },


	    // ----------------------
	    // object referency
	    // ----------------------

	    setReferency: function ( obj, val ) {

	        this.objectLink = obj;
	        this.val = val;

	    },

	    display: function ( v ) {
	        
	        v = v || false;
	        this.s[0].display = v ? 'block' : 'none';
	        //this.isReady = v ? false : true;

	    },

	    // ----------------------
	    // resize height 
	    // ----------------------

	    open: function () {

	        if( this.isOpen ) { return; }
	        this.isOpen = true;

	    },

	    close: function () {

	        if( !this.isOpen ) { return; }
	        this.isOpen = false;

	    },

	    needZone: function () {

	        Roots.needReZone = true;

	    },

	    // ----------------------
	    //  INPUT
	    // ----------------------

	    select: function () {
	    
	    },

	    unselect: function () {

	    },

	    setInput: function ( Input ) {
	        
	        Roots.setInput( Input, this );

	    },

	    upInput: function ( x, down ) {

	        return Roots.upInput( x, down );

	    },

	    // ----------------------
	    // special item 
	    // ----------------------

	    selected: function ( b ){

	        this.isSelect = b || false;
	        
	    },


	} );

	function Bool ( o ){

	    Proto.call( this, o );
	    
	    this.value = o.value || false;

	    this.buttonColor = o.bColor || this.colors.button;

	    this.inh = o.inh || this.h;

	    var t = Math.floor(this.h*0.5)-((this.inh-2)*0.5);

	    this.c[2] = this.dom( 'div', this.css.basic + 'background:'+ this.colors.boolbg +'; height:'+(this.inh-2)+'px; width:36px; top:'+t+'px; border-radius:10px; border:2px solid '+this.boolbg );
	    this.c[3] = this.dom( 'div', this.css.basic + 'height:'+(this.inh-6)+'px; width:16px; top:'+(t+2)+'px; border-radius:10px; background:'+this.buttonColor+';' );

	    this.init();
	    this.update();

	}

	Bool.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Bool,

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mousemove: function ( e ) {

	        this.cursor('pointer');

	    },

	    mousedown: function ( e ) {

	        this.value = this.value ? false : true;
	        this.update();
	        this.send();
	        return true;

	    },

	    update: function () {

	        var s = this.s;

	        if( this.value ){
	            
	            s[2].background = this.colors.boolon;
	            s[2].borderColor = this.colors.boolon;
	            s[3].marginLeft = '17px';

	        } else {
	            
	            s[2].background = this.colors.boolbg;
	            s[2].borderColor = this.colors.boolbg;
	            s[3].marginLeft = '2px';

	        }
	            
	    },

	    rSize: function () {

	        Proto.prototype.rSize.call( this );
	        var s = this.s;
	        s[2].left = this.sa + 'px';
	        s[3].left = this.sa+1+ 'px';

	    }

	} );

	function Button ( o ) {

	    Proto.call( this, o );

	    this.value = false;

	    this.values = o.value || this.txt;

	    if(typeof this.values === 'string' ) { this.values = [this.values]; }

	    //this.selected = null;
	    this.isDown = false;

	    this.buttonColor = o.bColor || this.colors.button;

	    this.isLoadButton = o.loader || false;
	    this.isDragButton = o.drag || false;
	    if( this.isDragButton ) { this.isLoadButton = true; }

	    this.lng = this.values.length;
	    this.tmp = [];
	    this.stat = [];

	    for(var i = 0; i < this.lng; i++){
	        this.c[i+2] = this.dom( 'div', this.css.txt + 'text-align:center; top:1px; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px; line-height:'+(this.h-4)+'px;' );
	        this.c[i+2].style.color = this.fontColor;
	        this.c[i+2].innerHTML = this.values[i];
	        this.stat[i] = 1;
	    }

	    if( this.c[1] !== undefined ) { this.c[1].textContent = ''; }

	    if( this.isLoadButton ) { this.initLoader(); }
	    if( this.isDragButton ){ 
	        this.lng ++;
	        this.initDrager();
	    }

	    this.init();

	}

	Button.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Button,

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }

	        var i = this.lng;
	        var t = this.tmp;
	        
	        while( i-- ){
	        	if( l.x>t[i][0] && l.x<t[i][2] ) { return i+2; }
	        }

	        return ''

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup: function ( e ) {
	    
	        if( this.isDown ){
	            this.value = false;
	            this.isDown = false;
	            //this.send();
	            return this.mousemove( e );
	        }

	        return false;

	    },

	    mousedown: function ( e ) {

	    	var name = this.testZone( e );

	        if( !name ) { return false; }

	    	this.isDown = true;
	        this.value = this.values[name-2];
	        if( !this.isLoadButton ) { this.send(); }
	        //else this.fileSelect( e.target.files[0] );
	    	return this.mousemove( e );
	 
	        // true;

	    },

	    mousemove: function ( e ) {

	        var up = false;

	        var name = this.testZone( e );

	       // console.log(name)

	        if( name !== '' ){
	            this.cursor('pointer');
	            up = this.modes( this.isDown ? 3 : 2, name );
	        } else {
	        	up = this.reset();
	        }

	        //console.log(up)

	        return up;

	    },

	    // ----------------------

	    modes: function ( n, name ) {

	        var v, r = false;

	        for( var i = 0; i < this.lng; i++ ){

	            if( i === name-2 ) { v = this.mode( n, i+2 ); }
	            else { v = this.mode( 1, i+2 ); }

	            if(v) { r = true; }

	        }

	        return r;

	    },

	    mode: function ( n, name ) {

	        var change = false;

	        var i = name - 2;

	        if( this.stat[i] !== n ){
	        
	            switch( n ){

	                case 1: this.stat[i] = 1; this.s[ i+2 ].color = this.fontColor; this.s[ i+2 ].background = this.buttonColor; break;
	                case 2: this.stat[i] = 2; this.s[ i+2 ].color = '#FFF';         this.s[ i+2 ].background = this.colors.select; break;
	                case 3: this.stat[i] = 3; this.s[ i+2 ].color = '#FFF';         this.s[ i+2 ].background = this.colors.down; break;

	            }

	            change = true;

	        }
	        

	        return change;

	    },

	    // ----------------------

	    reset: function () {

	        this.cursor();

	        /*var v, r = false;

	        for( var i = 0; i < this.lng; i++ ){
	            v = this.mode( 1, i+2 );
	            if(v) r = true;
	        }*/

	        return this.modes( 1 , 2 );

	    	/*if( this.selected ){
	    		this.s[ this.selected ].color = this.fontColor;
	            this.s[ this.selected ].background = this.buttonColor;
	            this.selected = null;
	            
	            return true;
	    	}
	        return false;*/

	    },

	    // ----------------------

	    dragover: function ( e ) {

	        e.preventDefault();

	        this.s[4].borderColor = this.colors.select;
	        this.s[4].color = this.colors.select;

	    },

	    dragend: function ( e ) {

	        e.preventDefault();

	        this.s[4].borderColor = this.fontColor;
	        this.s[4].color = this.fontColor;

	    },

	    drop: function ( e ) {

	        e.preventDefault();

	        this.dragend(e);
	        this.fileSelect( e.dataTransfer.files[0] );

	    },

	    initDrager: function () {

	        this.c[4] = this.dom( 'div', this.css.txt +' text-align:center; line-height:'+(this.h-8)+'px; border:1px dashed '+this.fontColor+'; top:2px;  height:'+(this.h-4)+'px; border-radius:'+this.radius+'px; pointer-events:auto;' );// cursor:default;
	        this.c[4].textContent = 'DRAG';

	        this.c[4].addEventListener( 'dragover', function(e){ this.dragover(e); }.bind(this), false );
	        this.c[4].addEventListener( 'dragend', function(e){ this.dragend(e); }.bind(this), false );
	        this.c[4].addEventListener( 'dragleave', function(e){ this.dragend(e); }.bind(this), false );
	        this.c[4].addEventListener( 'drop', function(e){ this.drop(e); }.bind(this), false );

	        //this.c[2].events = [  ];
	        //this.c[4].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];


	    },

	    initLoader: function () {

	        this.c[3] = this.dom( 'input', this.css.basic +'top:0px; opacity:0; height:'+(this.h)+'px; pointer-events:auto; cursor:pointer;' );//
	        this.c[3].name = 'loader';
	        this.c[3].type = "file";

	        this.c[3].addEventListener( 'change', function(e){ this.fileSelect( e.target.files[0] ); }.bind(this), false );
	        //this.c[3].addEventListener( 'mousedown', function(e){  }.bind(this), false );

	        //this.c[2].events = [  ];
	        //this.c[3].events = [ 'change', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

	        //this.hide = document.createElement('input');

	    },

	    fileSelect: function ( file ) {

	        var dataUrl = [ 'png', 'jpg', 'mp4', 'webm', 'ogg' ];
	        var dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'BVH' ];

	        //if( ! e.target.files ) return;

	        //var file = e.target.files[0];
	       
	        //this.c[3].type = "null";
	        // console.log( this.c[4] )

	        if( file === undefined ) { return; }

	        var reader = new FileReader();
	        var fname = file.name;
	        var type = fname.substring(fname.lastIndexOf('.')+1, fname.length );

	        if( dataUrl.indexOf( type ) !== -1 ) { reader.readAsDataURL( file ); }
	        else if( dataBuf.indexOf( type ) !== -1 ) { reader.readAsArrayBuffer( file ); }//reader.readAsArrayBuffer( file );
	        else { reader.readAsText( file ); }

	        // if( type === 'png' || type === 'jpg' || type === 'mp4' || type === 'webm' || type === 'ogg' ) reader.readAsDataURL( file );
	        //else if( type === 'z' ) reader.readAsBinaryString( file );
	        //else if( type === 'sea' || type === 'bvh' || type === 'BVH' || type === 'z') reader.readAsArrayBuffer( file );
	        //else if(  ) reader.readAsArrayBuffer( file );
	        //else reader.readAsText( file );

	        reader.onload = function (e) {
	            
	            if( this.callback ) { this.callback( e.target.result, fname, type ); }
	            //this.c[3].type = "file";
	            //this.send( e.target.result ); 
	        }.bind(this);

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

	        	this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
	        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
	            s[i+2].left = this.tmp[i][0] + 'px';
	            s[i+2].width = this.tmp[i][1] + 'px';

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

	    this.buttonColor = this.colors.button;

	    this.setTypeNumber( o );

	    this.radius = this.w * 0.5;//Math.floor((this.w-20)*0.5);


	    //this.ww = this.radius * 2;

	   // this.h = this.height + 40;



	    this.twoPi = Math.PI * 2;
	    this.pi90 = Math.PI * 0.5;

	    this.offset = new V2();

	    this.h = o.h || this.w + 10;
	    this.top = 0;

	    this.c[0].style.width = this.w +'px';

	    if(this.c[1] !== undefined) {

	        this.c[1].style.width = this.w +'px';
	        this.c[1].style.textAlign = 'center';
	        this.top = 10;
	        this.h += 10;

	    }

	    this.percent = 0;

	    this.cmode = 0;

	    this.c[2] = this.dom( 'div', this.css.txt + 'text-align:center; top:'+(this.h-20)+'px; width:'+this.w+'px; color:'+ this.fontColor );
	    this.c[3] = this.getCircular();

	    this.setSvg( this.c[3], 'd', this.makePath(), 1 );
	    this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );

	    this.setSvg( this.c[3], 'viewBox', '0 0 '+this.w+' '+this.w );
	    this.setCss( this.c[3], { width:this.w, height:this.w, left:0, top:this.top });

	    this.init();
	    this.update();

	}

	Circular.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Circular,

	    mode: function ( mode ) {

	        if( this.cmode === mode ) { return false; }

	        switch( mode ){
	            case 0: // base
	                this.s[2].color = this.fontColor;
	                this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.1)', 0);
	                this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );
	            break;
	            case 1: // over
	                this.s[2].color = this.colorPlus;
	                this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.3)', 0);
	                this.setSvg( this.c[3], 'stroke', this.colorPlus, 1 );
	            break;
	        }

	        this.cmode = mode;
	        return true;

	    },


	    reset: function () {

	        this.isDown = false;
	        

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup: function ( e ) {

	        this.isDown = false;
	        this.sendEnd();
	        return this.mode(0);

	    },

	    mousedown: function ( e ) {

	        this.isDown = true;
	        this.old = this.value;
	        this.oldr = null;
	        this.mousemove( e );
	        return this.mode(1);

	    },

	    mousemove: function ( e ) {

	        //this.mode(1);

	        if( !this.isDown ) { return; }

	        var off = this.offset;

	        off.x = this.radius - (e.clientX - this.zone.x );
	        off.y = this.radius - (e.clientY - this.zone.y - this.top );

	        this.r = off.angle() - this.pi90;
	        this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

	        if( this.oldr !== null ){ 

	            var dif = this.r - this.oldr;
	            this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

	            if( dif > 6 ) { this.r = 0; }
	            if( dif < -6 ) { this.r = this.twoPi; }

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

	        var r = 40;
	        var d = 24;
	        var a = this.percent * this.twoPi - 0.001;
	        var x2 = (r + r * Math.sin(a)) + d;
	        var y2 = (r - r * Math.cos(a)) + d;
	        var big = a > Math.PI ? 1 : 0;
	        return "M " + (r+d) + "," + d + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2;

	    },

	    update: function ( up ) {

	        this.c[2].textContent = this.value;
	        this.percent = ( this.value - this.min ) / this.range;

	        this.setSvg( this.c[3], 'd', this.makePath(), 1 );
	        if( up ) { this.send(); }
	        
	    },

	} );

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

	    this.pi90 = Math.PI * 0.5;

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
	        if( o.value instanceof Array ) { this.value = Tools.rgbToHex( o.value ); }
	        else if(!isNaN(o.value)) { this.value = Tools.hexToHtml( o.value ); }
	        else { this.value = o.value; }
	    }

	    this.bcolor = null;
	    this.isDown = false;

	    this.setColor( this.value );

	    this.init();

	    if( o.open !== undefined ) { this.open(); }

	}

	Color.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Color,

		testZone: function ( mx, my ) {

			var l = this.local;
			if( l.x === -1 && l.y === -1 ) { return ''; }

			if( this.up && this.isOpen ){

				if( l.y > this.wfixe ) { return 'title'; }
			    else { return 'color'; }

			} else {

				if( l.y < this.baseH+2 ) { return 'title'; }
		    	else if( this.isOpen ) { return 'color'; }


			}

	    },

		// ----------------------
	    //   EVENTS
	    // ----------------------

		mouseup: function ( e ) {

		    this.isDown = false;

		},

		mousedown: function ( e ) {


			var name = this.testZone( e.clientX, e.clientY );


			//if( !name ) return;
			if(name === 'title'){
				if( !this.isOpen ) { this.open(); }
		        else { this.close(); }
		        return true;
			}


			if( name === 'color' ){
				this.isDown = true;
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

		    var off, d, hue, sat, lum;

		    if( name === 'title' ){

		        this.cursor('pointer');

		    }

		    if( name === 'color' ){

		    	this.cursor('crosshair');

		    	if( this.isDown ){

		    		off = this.offset;
			    	off.x = e.clientX - ( this.zone.x + this.decal.x + this.mid );
			    	off.y = e.clientY - ( this.zone.y + this.decal.y + this.mid );
				    d = off.length() * this.ratio;

				    if ( d < 128 ) {
					    if ( d > 88 ) {

					        hue = ( off.angle() + this.pi90 ) / 6.28;
					        this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);

					    } else {


					    	sat = Math.max( 0, Math.min( 1, 0.5 - ( off.x * this.square * 0.5 ) ) );
					        lum = Math.max( 0, Math.min( 1, 0.5 - ( off.y * this.square * 0.5 ) ) );
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

			if ( this.parentGroup !== null ) { this.parentGroup.calc( t ); }
		    else if ( this.isUI ) { this.main.calc( t ); }

		},

		open: function () {

			Proto.prototype.open.call( this );

			this.setHeight();

			if( this.up ) { this.zone.y -= this.wfixe + 5; }

			var t = this.h - this.baseH;

		    this.s[3].visibility = 'visible';
		    //this.s[3].display = 'block';
		    this.parentHeight( t );

		},

		close: function () {

			Proto.prototype.close.call( this );

			if( this.up ) { this.zone.y += this.wfixe + 5; }

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

		    this.setSvg( this.c[3], 'fill', cc, 2 );

		    this.s[2].background = this.bcolor;
		    this.c[2].textContent = Tools.htmlToHex( this.bcolor );

		    this.invert = Tools.findDeepInver( this.rgb );
		    this.s[2].color = this.invert ? '#fff' : '#000';

		    if(!up) { return; }

		    if( this.ctype === 'array' ) { this.send( this.rgb ); }
		    if( this.ctype === 'rgb' ) { this.send( Tools.htmlRgb( this.rgb ) ); }
		    if( this.ctype === 'hex' ) { this.send( Tools.htmlToHex( this.value ) ); }
		    if( this.ctype === 'html' ) { this.send(); }

		},

		setColor: function ( color ) {

		    var unpack = Tools.unpack(color);
		    if (this.bcolor != color && unpack) {
		        this.bcolor = color;
		        this.rgb = unpack;
		        this.hsl = Tools.rgbToHsl( this.rgb );
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

		    var sr = 60;
		    var ra = 128-20; 
		    var c1 = this.invert ? '#fff' : '#000';
		    var a = this.hsl[0] * 6.28;

		    var p = new V2( Math.sin(a) * ra, -Math.cos(a) * ra ).addScalar(128);

		    this.setSvg( this.c[3], 'cx', p.x, 5 );
		    this.setSvg( this.c[3], 'cy', p.y, 5 );
		    
		    p.set( 2 * sr * (.5 - this.hsl[1]), 2 * sr * (.5 - this.hsl[2]) ).addScalar(128);

		    this.setSvg( this.c[3], 'cx', p.x, 6 );
		    this.setSvg( this.c[3], 'cy', p.y, 6 );
		    this.setSvg( this.c[3], 'stroke', c1, 6 );

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

	function Fps ( o ) {

	    Proto.call( this, o );

	    this.round = Math.round;

	    this.autoHeight = true;

	    this.baseH = this.h;
	    this.hplus = o.hplus || 50;

	    this.res = o.res || 40;
	    this.l = 1;

	    this.precision = o.precision || 0;
	    

	    this.custom = o.custom || false;
	    this.names = o.names || ['FPS', 'MS'];
	    var cc = o.cc || ['90,90,90', '255,255,0'];

	   // this.divid = [ 100, 100, 100 ];
	   // this.multy = [ 30, 30, 30 ];

	    this.adding = o.adding || false;

	    this.range = o.range || [ 165, 100, 100 ];

	    this.alpha = o.alpha || 0.25;

	    this.values = [];
	    this.points = [];
	    this.textDisplay = [];

	    if(!this.custom){

	        this.now = ( self.performance && self.performance.now ) ? self.performance.now.bind( performance ) : Date.now;
	        this.startTime = 0;//this.now()
	        this.prevTime = 0;//this.startTime;
	        this.frames = 0;

	        this.ms = 0;
	        this.fps = 0;
	        this.mem = 0;
	        this.mm = 0;

	        this.isMem = ( self.performance && self.performance.memory ) ? true : false;

	       // this.divid = [ 100, 200, 1 ];
	       // this.multy = [ 30, 30, 30 ];

	        if( this.isMem ){

	            this.names.push('MEM');
	            cc.push('0,255,255');

	        }

	        this.txt = 'FPS';

	    }


	    var fltop = Math.floor(this.h*0.5)-6;

	    this.c[1].textContent = this.txt;
	    this.c[0].style.cursor = 'pointer';
	    this.c[0].style.pointerEvents = 'auto';

	    var panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px; box-sizing:border-box; background: rgba(0, 0, 0, 0.2); border:' + (this.colors.groupBorder !== 'none'? this.colors.groupBorder+';' : '1px solid rgba(255, 255, 255, 0.2);');

	    if( this.radius !== 0 ) { panelCss += 'border-radius:' + this.radius+'px;'; } 

	    this.c[2] = this.dom( 'path', this.css.basic + panelCss , {} );

	    this.c[2].setAttribute('viewBox', '0 0 '+this.res+' 50' );
	    this.c[2].setAttribute('height', '100%' );
	    this.c[2].setAttribute('width', '100%' );
	    this.c[2].setAttribute('preserveAspectRatio', 'none' );


	    //this.dom( 'path', null, { fill:'rgba(255,255,0,0.3)', 'stroke-width':1, stroke:'#FF0', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	    //this.dom( 'path', null, { fill:'rgba(0,255,255,0.3)', 'stroke-width':1, stroke:'#0FF', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	    
	    // arrow
	    this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.fontColor, stroke:'none'});

	    // result test
	    this.c[4] = this.dom( 'div', this.css.txt + 'position:absolute; left:10px; top:'+(this.h+2) +'px; display:none; width:100%; text-align:center;' );

	    // bottom line
	    if( o.bottomLine ) { this.c[4] = this.dom( 'div', this.css.basic + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);'); }

	    this.isShow = false;

	    var s = this.s;

	    s[1].marginLeft = '10px';
	    s[1].lineHeight = this.h-4;
	    s[1].color = this.fontColor;
	    s[1].fontWeight = 'bold';

	    if( this.radius !== 0 )  { s[0].borderRadius = this.radius+'px'; } 
	    s[0].border = this.colors.groupBorder;

	    


	    for( var j=0; j<this.names.length; j++ ){

	        var base = [];
	        var i = this.res+1;
	        while( i-- ) { base.push(50); }

	        this.range[j] = ( 1 / this.range[j] ) * 49;
	        
	        this.points.push( base );
	        this.values.push(0);
	       //  this.dom( 'path', null, { fill:'rgba('+cc[j]+',0.5)', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	        this.textDisplay.push( "<span style='color:rgb("+cc[j]+")'> " + this.names[j] +" ");

	    }

	    j = this.names.length;
	    while(j--){
	        this.dom( 'path', null, { fill:'rgba('+cc[j]+','+this.alpha+')', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
	    }


	    this.init();

	    //if( this.isShow ) this.show();

	}

	Fps.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Fps,

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mousedown: function ( e ) {

	        if( this.isShow ) { this.close(); }
	        else { this.open(); }

	    },

	    // ----------------------

	    /*mode: function ( mode ) {

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
	    },*/

	    tick: function ( v ){

	        this.values = v;
	        if( !this.isShow ) { return; }
	        this.drawGraph();
	        this.upText();

	    },

	    makePath: function ( point ) {

	        var p = '';
	        p += 'M ' + (-1) + ' ' + 50;
	        for ( var i = 0; i < this.res + 1; i ++ ) { p += ' L ' + i + ' ' + point[i]; }
	        p += ' L ' + (this.res + 1) + ' ' + 50;
	        return p;

	    },

	    upText: function( val ){

	        var v = val || this.values, t = '';
	        for( var j=0, lng =this.names.length; j<lng; j++ ) { t += this.textDisplay[j] + (v[j]).toFixed(this.precision) + '</span>'; }
	        this.c[4].innerHTML = t;
	    
	    },

	    drawGraph: function( ){

	        var svg = this.c[2];
	        var i = this.names.length, v, old = 0, n = 0;

	        while( i-- ){
	            if( this.adding ) { v = (this.values[n]+old) * this.range[n]; }
	            else  { v = (this.values[n] * this.range[n]); }
	            this.points[n].shift();
	            this.points[n].push( 50 - v );
	            this.setSvg( svg, 'd', this.makePath( this.points[n] ), i+1 );
	            old += this.values[n];
	            n++;

	        }

	    },

	    open: function(){

	        Proto.prototype.open.call( this );

	        this.h = this.hplus + this.baseH;

	        this.setSvg( this.c[3], 'd', this.svgs.arrowDown );

	        if( this.parentGroup !== null ){ this.parentGroup.calc( this.hplus );}
	        else if( this.isUI ) { this.main.calc( this.hplus ); }

	        this.s[0].height = this.h +'px';
	        this.s[2].display = 'block'; 
	        this.s[4].display = 'block';
	        this.isShow = true;

	        if( !this.custom ) { Roots.addListen( this ); }

	    },

	    close: function(){

	        Proto.prototype.close.call( this );

	        this.h = this.baseH;

	        this.setSvg( this.c[3], 'd', this.svgs.arrow );

	        if( this.parentGroup !== null ){ this.parentGroup.calc( -this.hplus );}
	        else if( this.isUI ) { this.main.calc( -this.hplus ); }
	        
	        this.s[0].height = this.h +'px';
	        this.s[2].display = 'none';
	        this.s[4].display = 'none';
	        this.isShow = false;

	        if( !this.custom ) { Roots.removeListen( this ); }

	        this.c[4].innerHTML = '';
	        
	    },


	    ///// AUTO FPS //////

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

	        this.values = [ this.fps, this.ms , this.mm ];

	        this.drawGraph();
	        this.upText( [ this.fps, this.ms, this.mem ] );

	        return time;

	    },

	    listening: function(){

	        if( !this.custom ) { this.startTime = this.end(); }
	        
	    },

	    rSize: function(){

	        var s = this.s;
	        var w = this.w;

	        s[0].width = w + 'px';
	        s[1].width = w + 'px';
	        s[2].left = 10 + 'px';
	        s[2].width = (w-20) + 'px';
	        s[4].width = (w-20) + 'px';
	        
	    },
	    
	} );

	function Graph ( o ) {

		Proto.call( this, o );

		this.value = o.value !== undefined ? o.value : [0,0,0];
	    this.lng = this.value.length;

	    this.precision = o.precision !== undefined ? o.precision : 2;
	    this.multiplicator = o.multiplicator || 1;
	    this.neg = o.neg || false;

	    this.line = o.line !== undefined ?  o.line : true;

	    //if(this.neg)this.multiplicator*=2;

	    this.autoWidth = o.autoWidth !== undefined ? o.autoWidth : true;
	    this.isNumber = false;

	    this.isDown = false;

	    this.h = o.h || 128 + 10;
	    this.rh = this.h - 10;
	    this.top = 0;

	    this.c[0].style.width = this.w +'px';

	    if( this.c[1] !== undefined ) { // with title

	        this.c[1].style.width = this.w +'px';
	        
	        
	        //this.c[1].style.background = '#ff0000';
	        //this.c[1].style.textAlign = 'center';
	        this.top = 10;
	        this.h += 10;

	    }

	    this.gh = this.rh - 28;
	    this.gw = this.w - 28;

	    this.c[2] = this.dom( 'div', this.css.txt + 'text-align:center; top:'+(this.h-20)+'px; width:'+this.w+'px; color:'+ this.fontColor );
	    this.c[2].textContent = this.value;

	    var svg = this.dom( 'svg', this.css.basic , { viewBox:'0 0 '+this.w+' '+this.rh, width:this.w, height:this.rh, preserveAspectRatio:'none' } );
	    this.setCss( svg, { width:this.w, height:this.rh, left:0, top:this.top });

	    this.dom( 'path', '', { d:'', stroke:this.colors.text, 'stroke-width':2, fill:'none', 'stroke-linecap':'butt' }, svg );
	    this.dom( 'rect', '', { x:10, y:10, width:this.gw+8, height:this.gh+8, stroke:'rgba(0,0,0,0.3)', 'stroke-width':1 , fill:'none'}, svg );

	    this.iw = ((this.gw-(4*(this.lng-1)))/this.lng);
	    var t = [];
	    this.cMode = [];

	    this.v = [];

	    for( var i = 0; i < this.lng; i++ ){

	    	t[i] = [ 14 + (i*this.iw) + (i*4), this.iw ];
	    	t[i][2] = t[i][0] + t[i][1];
	    	this.cMode[i] = 0;

	        if( this.neg ) { this.v[i] = ((1+(this.value[i] / this.multiplicator))*0.5); }
	    	else { this.v[i] = this.value[i] / this.multiplicator; }

	    	this.dom( 'rect', '', { x:t[i][0], y:14, width:t[i][1], height:1, fill:this.fontColor, 'fill-opacity':0.3 }, svg );

	    }

	    this.tmp = t;
	    this.c[3] = svg;

	    //console.log(this.w)

	    this.init();

	    if( this.c[1] !== undefined ){
	        this.c[1].style.top = 0 +'px';
	        this.c[1].style.height = 20 +'px';
	        this.s[1].lineHeight = (20-5)+'px';
	    }

	    this.update( false );

	}

	Graph.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Graph,

	    updateSVG: function () {

	        if( this.line ) { this.setSvg( this.c[3], 'd', this.makePath(), 0 ); }

	        for(var i = 0; i<this.lng; i++ ){

	            
	            this.setSvg( this.c[3], 'height', this.v[i]*this.gh, i+2 );
	            this.setSvg( this.c[3], 'y', 14 + (this.gh - this.v[i]*this.gh), i+2 );
	            if( this.neg ) { this.value[i] = ( ((this.v[i]*2)-1) * this.multiplicator ).toFixed( this.precision ) * 1; }
	            else { this.value[i] = ( (this.v[i] * this.multiplicator) ).toFixed( this.precision ) * 1; }

	        }

	        this.c[2].textContent = this.value;

	    },

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }

	        var i = this.lng;
	        var t = this.tmp;
	        
		    if( l.y>this.top && l.y<this.h-20 ){
		        while( i-- ){
		            if( l.x>t[i][0] && l.x<t[i][2] ) { return i; }
		        }
		    }

	        return ''

	    },

	    mode: function ( n, name ) {

	    	if( n === this.cMode[name] ) { return false; }

	    	var a;

	        switch(n){
	            case 0: a=0.3; break;
	            case 1: a=0.6; break;
	            case 2: a=1; break;
	        }

	        this.reset();

	        this.setSvg( this.c[3], 'fill-opacity', a, name + 2 );
	        this.cMode[name] = n;

	        return true;



	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    reset: function () {

	    	var nup = false;
	        //this.isDown = false;

	        var i = this.lng;
	        while(i--){ 
	            if( this.cMode[i] !== 0 ){
	                this.cMode[i] = 0;
	                this.setSvg( this.c[3], 'fill-opacity', 0.3, i + 2 );
	                nup = true;
	            }
	        }

	        return nup;

	    },

	    mouseup: function ( e ) {

	        this.isDown = false;
	        if( this.current !== -1 ) { return this.reset(); }
	        
	    },

	    mousedown: function ( e ) {

	    	this.isDown = true;
	        return this.mousemove( e );

	    },

	    mousemove: function ( e ) {

	    	var nup = false;

	    	var name = this.testZone(e);

	    	if( name === '' ){

	            nup = this.reset();
	            //this.cursor();

	        } else { 

	            nup = this.mode( this.isDown ? 2 : 1, name );
	            //this.cursor( this.current !== -1 ? 'move' : 'pointer' );
	            if(this.isDown){
	            	this.v[name] = this.clamp( 1 - (( e.clientY - this.zone.y - this.top - 10 ) / this.gh) , 0, 1 );
	            	this.update( true );
	            }

	        }

	        return nup;

	    },

	    update: function ( up ) {

	    	this.updateSVG();

	        if( up ) { this.send(); }

	    },

	    makePath: function () {

	    	var p = "", h, w, wn, wm, ow, oh;
	    	//var g = this.iw*0.5

	    	for(var i = 0; i<this.lng; i++ ){

	    		h = 14 + (this.gh - this.v[i]*this.gh);
	    		w = (14 + (i*this.iw) + (i*4));

	    		wm = w + this.iw*0.5;
	    		wn = w + this.iw;

	    		if(i===0) { p+='M '+w+' '+ h + ' T ' + wm +' '+ h; }
	    		else { p += ' C ' + ow +' '+ oh + ',' + w +' '+ h + ',' + wm +' '+ h; }
	    		if(i === this.lng-1) { p+=' T ' + wn +' '+ h; }

	    		ow = wn;
	    		oh = h; 

	    	}

	    	return p;

	    },


	    

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	        var s = this.s;
	        if( this.c[1] !== undefined ) { s[1].width = this.w + 'px'; }
	        s[2].width = this.w + 'px';
	        s[3].width = this.w + 'px';

	        var gw = this.w - 28;
	        var iw = ((gw-(4*(this.lng-1)))/this.lng);

	        var t = [];

	        for( var i = 0; i < this.lng; i++ ){

	            t[i] = [ 14 + (i*iw) + (i*4), iw ];
	            t[i][2] = t[i][0] + t[i][1];

	        }

	        this.tmp = t;

	    }

	} );

	//import { add } from '../core/add';

	function Group ( o ) {
	 
	    Proto.call( this, o );

	    this.ADD = o.add;

	    this.uis = [];

	    this.autoHeight = true;
	    this.current = -1;
	    this.target = null;

	    this.decal = 0;

	    this.baseH = this.h;

	    var fltop = Math.floor(this.h*0.5)-6;

	    this.isLine = o.line !== undefined ? o.line : false;

	    this.c[2] = this.dom( 'div', this.css.basic + 'width:100%; left:0; height:auto; overflow:hidden; top:'+this.h+'px');
	    this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:0; top:'+fltop+'px;', { d:this.svgs.group, fill:this.fontColor, stroke:'none'});
	    this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.fontColor, stroke:'none'});
	    // bottom line
	    if(this.isLine) { this.c[5] = this.dom( 'div', this.css.basic +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px'); }

	    var s = this.s;

	    s[0].height = this.h + 'px';
	    s[1].height = this.h + 'px';
	    this.c[1].name = 'group';

	    s[1].marginLeft = '10px';
	    s[1].lineHeight = this.h-4;
	    s[1].color = this.fontColor;
	    s[1].fontWeight = 'bold';

	    if( this.radius !== 0 ) { s[0].borderRadius = this.radius+'px'; } 
	    s[0].border = this.colors.groupBorder;

	    
	    this.init();

	    if( o.bg !== undefined ) { this.setBG(o.bg); }
	    if( o.open !== undefined ) { this.open(); }

	}

	Group.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Group,

	    isGroup: true,

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }

	        var name = '';

	        if( l.y < this.baseH ) { name = 'title'; }
	        else {
	            if( this.isOpen ) { name = 'content'; }
	        }

	        return name;

	    },

	    clearTarget: function () {

	        if( this.current === -1 ) { return false; }

	       // if(!this.target) return;
	        this.target.uiout();
	        this.target.reset();
	        this.current = -1;
	        this.target = null;
	        this.cursor();
	        return true;

	    },

	    reset: function () {

	        this.clearTarget();

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    handleEvent: function ( e ) {

	        var type = e.type;

	        var change = false;
	        var targetChange = false;

	        var name = this.testZone( e );

	        if( !name ) { return; }

	        switch( name ){

	            case 'content':
	            this.cursor();

	            if( Roots.isMobile && type === 'mousedown' ) { this.getNext( e, change ); }

	            if( this.target ) { targetChange = this.target.handleEvent( e ); }

	            //if( type === 'mousemove' ) change = this.styles('def');

	            if( !Roots.lock ) { this.getNext( e, change ); }

	            break;
	            case 'title':
	            this.cursor('pointer');
	            if( type === 'mousedown' ){
	                if( this.isOpen ) { this.close(); }
	                else { this.open(); }
	            }
	            break;


	        }

	        if( this.isDown ) { change = true; }
	        if( targetChange ) { change = true; }

	        return change;

	    },

	    getNext: function ( e, change ) {

	        var next = Roots.findTarget( this.uis, e );

	        if( next !== this.current ){
	            this.clearTarget();
	            this.current = next;
	        }

	        if( next !== -1 ){ 
	            this.target = this.uis[ this.current ];
	            this.target.uiover();
	        }

	    },

	    // ----------------------

	    calcH: function () {

	        var lng = this.uis.length, i, u,  h=0, px=0, tmph=0;
	        for( i = 0; i < lng; i++){
	            u = this.uis[i];
	            if( !u.autoWidth ){

	                if(px===0) { h += u.h+1; }
	                else {
	                    if(tmph<u.h) { h += u.h-tmph; }
	                }
	                tmph = u.h;

	                //tmph = tmph < u.h ? u.h : tmph;
	                px += u.w;
	                if( px+u.w > this.w ) { px = 0; }

	            }
	            else { h += u.h+1; }
	        }

	        return h;
	    },

	    calcUis: function () {

	        if( !this.isOpen ) { return; }

	        Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH );

	    },


	    setBG: function ( c ) {

	        this.s[0].background = c;

	        var i = this.uis.length;
	        while(i--){
	            this.uis[i].setBG( c );
	        }

	    },

	    add: function () {

	        var a = arguments;

	        if( typeof a[1] === 'object' ){ 
	            a[1].isUI = this.isUI;
	            a[1].target = this.c[2];
	            a[1].main = this.main;
	        } else if( typeof arguments[1] === 'string' ){
	            if( a[2] === undefined ) { [].push.call(a, { isUI:true, target:this.c[2], main:this.main }); }
	            else{ 
	                a[2].isUI = true;
	                a[2].target = this.c[2];
	                a[2].main = this.main;
	            }
	        }

	        //var n = add.apply( this, a );
	        var n = this.ADD.apply( this, a );
	        this.uis.push( n );

	        if( n.autoHeight ) { n.parentGroup = this; }

	        return n;

	    },

	    parentHeight: function ( t ) {

	        if ( this.parentGroup !== null ) { this.parentGroup.calc( t ); }
	        else if ( this.isUI ) { this.main.calc( t ); }

	    },

	    open: function () {

	        Proto.prototype.open.call( this );

	        this.setSvg( this.c[4], 'd', this.svgs.arrowDown );
	        this.rSizeContent();

	        var t = this.h - this.baseH;

	        this.parentHeight( t );

	    },

	    close: function () {

	        Proto.prototype.close.call( this );

	        var t = this.h - this.baseH;

	        this.setSvg( this.c[4], 'd', this.svgs.arrow );
	        this.h = this.baseH;
	        this.s[0].height = this.h + 'px';

	        this.parentHeight( -t );

	    },

	    clear: function () {

	        this.clearGroup();
	        if( this.isUI ) { this.main.calc( -(this.h +1 )); }
	        Proto.prototype.clear.call( this );

	    },

	    clearGroup: function () {

	        this.close();

	        var i = this.uis.length;
	        while(i--){
	            this.uis[i].clear();
	            this.uis.pop();
	        }
	        this.uis = [];
	        this.h = this.baseH;

	    },

	    calc: function ( y ) {

	        if( !this.isOpen ) { return; }

	        if( y !== undefined ){ 
	            this.h += y;
	            if( this.isUI ) { this.main.calc( y ); }
	        } else {
	            this.h = this.calcH() + this.baseH;
	        }
	        this.s[0].height = this.h + 'px';

	        //if(this.isOpen) this.calcUis();

	    },

	    rSizeContent: function () {

	        var i = this.uis.length;
	        while(i--){
	            this.uis[i].setSize( this.w );
	            this.uis[i].rSize();
	        }
	        this.calc();

	    },

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	        var s = this.s;

	        s[3].left = ( this.sa + this.sb - 17 ) + 'px';
	        s[1].width = this.w + 'px';
	        s[2].width = this.w + 'px';

	        if( this.isOpen ) { this.rSizeContent(); }

	    }

	} );

	function Joystick ( o ) {

	    Proto.call( this, o );

	    this.autoWidth = false;

	    this.value = [0,0];

	    this.joyType = 'analogique';
	    this.model = o.mode !== undefined ? o.mode : 0;

	    this.precision = o.precision || 2;
	    this.multiplicator = o.multiplicator || 1;

	    this.pos = new V2();
	    this.tmp = new V2();

	    this.interval = null;

	    this.radius = this.w * 0.5;
	    this.distance = this.radius*0.25;

	    this.h = o.h || this.w + 10;
	    this.top = 0;

	    this.c[0].style.width = this.w +'px';

	    if( this.c[1] !== undefined ) { // with title

	        this.c[1].style.width = this.w +'px';
	        this.c[1].style.textAlign = 'center';
	        this.top = 10;
	        this.h += 10;

	    }

	    this.c[2] = this.dom( 'div', this.css.txt + 'text-align:center; top:'+(this.h-20)+'px; width:'+this.w+'px; color:'+ this.fontColor );
	    this.c[2].textContent = this.value;

	    this.c[3] = this.getJoystick( this.model );
	    this.setSvg( this.c[3], 'viewBox', '0 0 '+this.w+' '+this.w );
	    this.setCss( this.c[3], { width:this.w, height:this.w, left:0, top:this.top });


	    this.ratio = 128/this.w;

	    this.init();

	    this.update(false);
	    
	}

	Joystick.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Joystick,

	    mode: function ( mode ) {

	        switch(mode){
	            case 0: // base
	                if(this.model===0){
	                    this.setSvg( this.c[3], 'fill', 'url(#gradIn)', 4 );
	                    this.setSvg( this.c[3], 'stroke', '#000', 4 );
	                } else {
	                    this.setSvg( this.c[3], 'stroke', 'rgba(100,100,100,0.25)', 2 );
	                    //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.1)', 3 );
	                    this.setSvg( this.c[3], 'stroke', '#666', 4 );
	                    this.setSvg( this.c[3], 'fill', 'none', 4 );
	                }
	                
	            break;
	            case 1: // over
	                if(this.model===0){
	                    this.setSvg( this.c[3], 'fill', 'url(#gradIn2)', 4 );
	                    this.setSvg( this.c[3], 'stroke', 'rgba(0,0,0,0)', 4 );
	                } else {
	                    this.setSvg( this.c[3], 'stroke', 'rgba(48,138,255,0.25)', 2 );
	                    //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.3)', 3 );
	                    this.setSvg( this.c[3], 'stroke', this.colors.select, 4 );
	                    this.setSvg( this.c[3], 'fill', 'rgba(48,138,255,0.25)', 4 );
	                }
	            break;
	            case 2: // edit
	            break;

	        }
	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    addInterval: function (){
	        if( this.interval !== null ) { this.stopInterval(); }
	        if( this.pos.isZero() ) { return; }
	        this.interval = setInterval( function(){ this.update(); }.bind(this), 10 );

	    },

	    stopInterval: function (){

	        if( this.interval === null ) { return; }
	        clearInterval( this.interval );
	        this.interval = null;

	    },

	    reset: function () {

	        this.addInterval();
	        this.mode(0);

	    },

	    mouseup: function ( e ) {

	        this.addInterval();
	        this.isDown = false;
	    
	    },

	    mousedown: function ( e ) {

	        this.isDown = true;
	        this.mousemove( e );
	        this.mode( 2 );

	    },

	    mousemove: function ( e ) {

	        this.mode(1);

	        if( !this.isDown ) { return; }

	        this.tmp.x = this.radius - ( e.clientX - this.zone.x );
	        this.tmp.y = this.radius - ( e.clientY - this.zone.y - this.top );

	        var distance = this.tmp.length();

	        if ( distance > this.distance ) {
	            var angle = Math.atan2(this.tmp.x, this.tmp.y);
	            this.tmp.x = Math.sin( angle ) * this.distance;
	            this.tmp.y = Math.cos( angle ) * this.distance;
	        }

	        this.pos.copy( this.tmp ).divideScalar( this.distance ).negate();

	        this.update();

	    },

	    setValue: function ( v ) {

	        if(v===undefined) { v=[0,0]; }

	        this.pos.set( v[0] || 0, v[1]  || 0 );
	        this.updateSVG();

	    },

	    update: function ( up ) {

	        if( up === undefined ) { up = true; }

	        if( this.interval !== null ){

	            if( !this.isDown ){

	                this.pos.lerp( null, 0.3 );

	                this.pos.x = Math.abs( this.pos.x ) < 0.01 ? 0 : this.pos.x;
	                this.pos.y = Math.abs( this.pos.y ) < 0.01 ? 0 : this.pos.y;

	                if( this.isUI && this.main.isCanvas ) { this.main.draw(); }

	            }

	        }

	        this.updateSVG();

	        if( up ) { this.send(); }
	        

	        if( this.pos.isZero() ) { this.stopInterval(); }

	    },

	    updateSVG: function () {

	        var x = this.radius - ( -this.pos.x * this.distance );
	        var y = this.radius - ( -this.pos.y * this.distance );

	         if(this.model === 0){

	            var sx = x + ((this.pos.x)*5) + 5;
	            var sy = y + ((this.pos.y)*5) + 10;

	            this.setSvg( this.c[3], 'cx', sx*this.ratio, 3 );
	            this.setSvg( this.c[3], 'cy', sy*this.ratio, 3 );
	        } else {
	            this.setSvg( this.c[3], 'cx', x*this.ratio, 3 );
	            this.setSvg( this.c[3], 'cy', y*this.ratio, 3 );
	        }

	        

	        this.setSvg( this.c[3], 'cx', x*this.ratio, 4 );
	        this.setSvg( this.c[3], 'cy', y*this.ratio, 4 );

	        this.value[0] =  ( this.pos.x * this.multiplicator ).toFixed( this.precision ) * 1;
	        this.value[1] =  ( this.pos.y * this.multiplicator ).toFixed( this.precision ) * 1;

	        this.c[2].textContent = this.value;

	    },

	    clear: function () {
	        
	        this.stopInterval();
	        Proto.prototype.clear.call( this );

	    },

	} );

	function Knob ( o ) {

	    Proto.call( this, o );

	    this.autoWidth = false;

	    this.buttonColor = this.colors.button;

	    this.setTypeNumber( o );

	    this.mPI = Math.PI * 0.8;
	    this.toDeg = 180 / Math.PI;
	    this.cirRange = this.mPI * 2;

	    this.offset = new V2();

	    this.radius = this.w * 0.5;//Math.floor((this.w-20)*0.5);

	    //this.ww = this.height = this.radius * 2;
	    this.h = o.h || this.w + 10;
	    this.top = 0;

	    this.c[0].style.width = this.w +'px';

	    if(this.c[1] !== undefined) {

	        this.c[1].style.width = this.w +'px';
	        this.c[1].style.textAlign = 'center';
	        this.top = 10;
	        this.h += 10;

	    }

	    this.percent = 0;

	    this.cmode = 0;

	    this.c[2] = this.dom( 'div', this.css.txt + 'text-align:center; top:'+(this.h-20)+'px; width:'+this.w+'px; color:'+ this.fontColor );

	    this.c[3] = this.getKnob();
	    
	    this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );
	    this.setSvg( this.c[3], 'stroke', this.fontColor, 3 );
	    this.setSvg( this.c[3], 'd', this.makeGrad(), 3 );
	    

	    this.setSvg( this.c[3], 'viewBox', '0 0 '+this.ww+' '+this.ww );
	    this.setCss( this.c[3], { width:this.w, height:this.w, left:0, top:this.top });

	    this.r = 0;

	    this.init();

	    this.update();

	}

	Knob.prototype = Object.assign( Object.create( Circular.prototype ), {

	    constructor: Knob,

	    mode: function ( mode ) {

	        if( this.cmode === mode ) { return false; }

	        switch(mode){
	            case 0: // base
	                this.s[2].color = this.fontColor;
	                this.setSvg( this.c[3], 'fill',this.colors.button, 0);
	                //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.2)', 2);
	                this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );
	            break;
	            case 1: // over
	                this.s[2].color = this.colorPlus;
	                this.setSvg( this.c[3], 'fill',this.colors.select, 0);
	                //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.6)', 2);
	                this.setSvg( this.c[3], 'stroke', this.colorPlus, 1 );
	            break;
	        }

	        this.cmode = mode;
	        return true;

	    },

	    

	    mousemove: function ( e ) {

	        //this.mode(1);

	        if( !this.isDown ) { return; }

	        var off = this.offset;

	        off.x = this.radius - ( e.clientX - this.zone.x );
	        off.y = this.radius - ( e.clientY - this.zone.y - this.top );

	        this.r = - Math.atan2( off.x, off.y );

	        if( this.oldr !== null ) { this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r; }

	        this.r = this.r > this.mPI ? this.mPI : this.r;
	        this.r = this.r < -this.mPI ? -this.mPI : this.r;

	        var steps = 1 / this.cirRange;
	        var value = (this.r + this.mPI) * steps;

	        var n = ( ( this.range * value ) + this.min ) - this.old;

	        if(n >= this.step || n <= this.step){ 
	            n = Math.floor( n / this.step );
	            this.value = this.numValue( this.old + ( n * this.step ) );
	            this.update( true );
	            this.old = this.value;
	            this.oldr = this.r;
	        }

	    },

	    makeGrad: function () {

	        var d = '', step, range, a, x, y, x2, y2, r = 64;
	        var startangle = Math.PI + this.mPI;
	        var endangle = Math.PI - this.mPI;
	        //var step = this.step>5 ? this.step : 1;

	        if(this.step>5){
	            range =  this.range / this.step;
	            step = ( startangle - endangle ) / range;
	        } else {
	            step = (( startangle - endangle ) / r)*2;
	            range = r*0.5;
	        }

	        for ( var i = 0; i <= range; ++i ) {

	            a = startangle - ( step * i );
	            x = r + Math.sin( a ) * ( r - 20 );
	            y = r + Math.cos( a ) * ( r - 20 );
	            x2 = r + Math.sin( a ) * ( r - 24 );
	            y2 = r + Math.cos( a ) * ( r - 24 );
	            d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

	        }

	        return d;

	    },

	    update: function ( up ) {

	        this.c[2].textContent = this.value;
	        this.percent = (this.value - this.min) / this.range;

	       // var r = 50;
	       // var d = 64; 
	        var r = ( (this.percent * this.cirRange) - (this.mPI));//* this.toDeg;

	        var sin = Math.sin(r);
	        var cos = Math.cos(r);

	        var x1 = (25 * sin) + 64;
	        var y1 = -(25 * cos) + 64;
	        var x2 = (20 * sin) + 64;
	        var y2 = -(20 * cos) + 64;

	        //this.setSvg( this.c[3], 'cx', x, 1 );
	        //this.setSvg( this.c[3], 'cy', y, 1 );

	        this.setSvg( this.c[3], 'd', 'M ' + x1 +' ' + y1 + ' L ' + x2 +' ' + y2, 1 );

	        //this.setSvg( this.c[3], 'transform', 'rotate('+ r +' '+64+' '+64+')', 1 );

	        if( up ) { this.send(); }
	        
	    },

	} );

	function List ( o ) {

	    Proto.call( this, o );

	    // images
	    this.path = o.path || '';
	    this.format = o.format || '';
	    this.imageSize = o.imageSize || [20,20];

	    this.isWithImage = this.path !== '' ? true:false;
	    this.preLoadComplete = false;

	    this.tmpImage = {};
	    this.tmpUrl = [];

	    this.autoHeight = false;
	    var align = o.align || 'center';

	    this.sMode = 0;
	    this.tMode = 0;

	    this.buttonColor = o.bColor || this.colors.button;

	    var fltop = Math.floor(this.h*0.5)-5;

	    this.c[2] = this.dom( 'div', this.css.basic + 'top:0; display:none;' );
	    this.c[3] = this.dom( 'div', this.css.txt + 'text-align:'+align+'; line-height:'+(this.h-4)+'px; top:1px; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px;' );
	    this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.fontColor, stroke:'none'});

	    this.scroller = this.dom( 'div', this.css.basic + 'right:5px;  width:10px; background:#666; display:none;');

	    this.c[3].style.color = this.fontColor;

	    this.list = o.list || [];
	    this.items = [];

	    this.prevName = '';

	    this.baseH = this.h;

	    this.itemHeight = o.itemHeight || (this.h-3);

	    // force full list 
	    this.full = o.full || false;

	    this.py = 0;
	    this.ww = this.sb;
	    this.scroll = false;
	    this.isDown = false;

	    this.current = null;

	    // list up or down
	    this.side = o.side || 'down';
	    this.up = this.side === 'down' ? 0 : 1;

	    if( this.up ){

	        this.c[2].style.top = 'auto';
	        this.c[3].style.top = 'auto';
	        this.c[4].style.top = 'auto';
	        //this.c[5].style.top = 'auto';

	        this.c[2].style.bottom = this.h-2 + 'px';
	        this.c[3].style.bottom = '1px';
	        this.c[4].style.bottom = fltop + 'px';
	        //this.c[5].style.bottom = '2px';

	    } else {
	        this.c[2].style.top = this.baseH + 'px';
	        //this.c[6].style.top = this.h + 'px';
	    }

	    this.listIn = this.dom( 'div', this.css.basic + 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2);');
	    this.listIn.name = 'list';

	    this.topList = 0;
	    
	    this.c[2].appendChild( this.listIn );
	    this.c[2].appendChild( this.scroller );

	    if( o.value !== undefined ){
	        if(!isNaN(o.value)) { this.value = this.list[ o.value ]; }
	        else { this.value = o.value; }
	    }else{
	        this.value = this.list[0];
	    }

	    this.isOpenOnStart = o.open || false;

	    

	    //this.c[0].style.background = '#FF0000'
	    if( this.isWithImage ) { this.preloadImage(); }
	   // } else {
	        // populate list
	        this.setList( this.list );
	        this.init();
	        if( this.isOpenOnStart ) { this.open(); }
	   // }

	}

	List.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: List,

	    // image list

	    preloadImage: function () {

	        this.preLoadComplete = false;

	        this.tmpImage = {};
	        for( var i=0; i<this.list.length; i++ ) { this.tmpUrl.push( this.list[i] ); }
	        this.loadOne();
	        
	    },

	    nextImg: function () {

	        this.tmpUrl.shift();
	        if( this.tmpUrl.length === 0 ){ 

	            this.preLoadComplete = true;

	            this.addImages();
	            /*this.setList( this.list );
	            this.init();
	            if( this.isOpenOnStart ) this.open();*/

	        }
	        else { this.loadOne(); }

	    },

	    loadOne: function(){

	        var self = this;
	        var name = this.tmpUrl[0];
	        var img = document.createElement('img');
	        img.style.cssText = 'position:absolute; width:'+self.imageSize[0]+'px; height:'+self.imageSize[1]+'px';
	        img.setAttribute('src', this.path + name + this.format );

	        img.addEventListener('load', function() {

	            self.imageSize[2] = img.width;
	            self.imageSize[3] = img.height;
	            self.tmpImage[name] = img;
	            self.nextImg();

	        });

	    },

	    //

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }

	        if( this.up && this.isOpen ){
	            if( l.y > this.h - this.baseH ) { return 'title'; }
	            else{
	                if( this.scroll && ( l.x > (this.sa+this.sb-20)) ) { return 'scroll'; }
	                if(l.x > this.sa) { return this.testItems( l.y-this.baseH ); }
	            }

	        } else {
	            if( l.y < this.baseH+2 ) { return 'title'; }
	            else{
	                if( this.isOpen ){
	                    if( this.scroll && ( l.x > (this.sa+this.sb-20)) ) { return 'scroll'; }
	                    if(l.x > this.sa) { return this.testItems( l.y-this.baseH ); }
	                }
	            }

	        }

	        return '';

	    },

	    testItems: function ( y ) {

	        var name = '';

	        var i = this.items.length, item, a, b;
	        while(i--){
	            item = this.items[i];
	            a = item.posy + this.topList;
	            b = item.posy + this.itemHeight + 1 + this.topList;
	            if( y >= a && y <= b ){ 
	                name = 'item' + i;
	                this.unSelected();
	                this.current = item;
	                this.selected();
	                return name;
	            }

	        }

	        return name;

	    },

	    unSelected: function () {

	        if( this.current ){
	            this.current.style.background = 'rgba(0,0,0,0.2)';
	            this.current.style.color = this.fontColor;
	            this.current = null;
	        }

	    },

	    selected: function () {

	        this.current.style.background = this.colors.select;
	        this.current.style.color = '#FFF';

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup: function ( e ) {

	        this.isDown = false;

	    },

	    mousedown: function ( e ) {

	        var name = this.testZone( e );

	        if( !name ) { return false; }

	        if( name === 'scroll' ){

	            this.isDown = true;
	            this.mousemove( e );

	        } else if( name === 'title' ){

	            this.modeTitle(2);
	            if( !this.isOpen ) { this.open(); }
	            else { this.close(); }
	        
	        } else {
	            if( this.current ){
	                this.value = this.list[this.current.id];
	                //this.value = this.current.textContent;
	                this.setTopItem();
	                this.send();
	                this.close();
	            }
	            
	        }

	        return true;

	    },

	    mousemove: function ( e ) {

	        var nup = false;
	        var name = this.testZone( e );

	        if( !name ) { return nup; }

	        if( name === 'title' ){
	            this.unSelected();
	            this.modeTitle(1);
	            this.cursor('pointer');

	        } else if( name === 'scroll' ){

	            this.cursor('s-resize');
	            this.modeScroll(1);
	            if( this.isDown ){
	                this.modeScroll(2);
	                var top = this.zone.y+this.baseH-2;
	                this.update( ( e.clientY - top  ) - ( this.sh*0.5 ) );
	            }
	            //if(this.isDown) this.listmove(e);
	        } else {

	            // is item
	            this.modeTitle(0);
	            this.modeScroll(0);
	            this.cursor('pointer');
	        
	        }

	        if( name !== this.prevName ) { nup = true; }
	        this.prevName = name;

	        return nup;

	    },

	    wheel: function ( e ) {

	        var name = this.testZone( e );
	        if( name === 'title' ) { return false; } 
	        this.py += e.delta*10;
	        this.update(this.py);
	        return true;

	    },



	    // ----------------------

	    reset: function () {

	        this.prevName = '';
	        this.unSelected();
	        this.modeTitle(0);
	        this.modeScroll(0);
	        
	    },

	    modeScroll: function ( mode ) {

	        if( mode === this.sMode ) { return; }

	        switch(mode){
	            case 0: // base
	                this.scroller.style.background = this.buttonColor;
	            break;
	            case 1: // over
	                this.scroller.style.background = this.colors.select;
	            break;
	            case 2: // edit / down
	                this.scroller.style.background = this.colors.down;
	            break;

	        }

	        this.sMode = mode;
	    },

	    modeTitle: function ( mode ) {

	        if( mode === this.tMode ) { return; }

	        var s = this.s;

	        switch(mode){
	            case 0: // base
	                s[3].color = this.fontColor;
	                s[3].background = this.buttonColor;
	            break;
	            case 1: // over
	                s[3].color = '#FFF';
	                s[3].background = this.colors.select;
	            break;
	            case 2: // edit / down
	                s[3].color = this.fontColor;
	                s[3].background = this.colors.down;
	            break;

	        }

	        this.tMode = mode;

	    },

	    clearList: function () {

	        while ( this.listIn.children.length ) { this.listIn.removeChild( this.listIn.lastChild ); }
	        this.items = [];

	    },

	    setList: function ( list ) {

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
	            this.ww = this.sb - 20;
	            this.scroll = true;
	        }

	        var item, n;//, l = this.sb;
	        for( var i=0; i<this.length; i++ ){

	            n = this.list[i];
	            item = this.dom( 'div', this.css.item + 'width:'+this.ww+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px; color:'+this.fontColor+';' );
	            item.name = 'item'+i;
	            item.id = i;
	            item.posy = (this.itemHeight+1)*i;
	            this.listIn.appendChild( item );
	            this.items.push( item );

	            //if( this.isWithImage ) item.appendChild( this.tmpImage[n] );
	            if( !this.isWithImage ) { item.textContent = n; }

	        }

	        this.setTopItem();
	        
	    },

	    addImages: function (){
	        var lng = this.list.length;
	        for( var i=0; i<lng; i++ ){
	            this.items[i].appendChild( this.tmpImage[this.list[i]] );
	        }
	        this.setTopItem();
	    },

	    setTopItem: function (){

	        if( this.isWithImage ){ 

	            if( !this.preLoadComplete ) { return; }

	            if(!this.c[3].children.length){
	                this.canvas = document.createElement('canvas');
	                this.canvas.width = this.imageSize[0];
	                this.canvas.height = this.imageSize[1];
	                this.canvas.style.cssText = 'position:absolute; top:0px; left:0px;';
	                this.ctx = this.canvas.getContext("2d");
	                this.c[3].appendChild( this.canvas );
	            }

	            var img = this.tmpImage[ this.value ];
	            this.ctx.drawImage( this.tmpImage[ this.value ], 0, 0, this.imageSize[2], this.imageSize[3], 0,0, this.imageSize[0], this.imageSize[1] );

	        }
	        else { this.c[3].textContent = this.value; }

	    },


	    // ----- LIST

	    update: function ( y ) {

	        if( !this.scroll ) { return; }

	        y = y < 0 ? 0 : y;
	        y = y > this.range ? this.range : y;

	        this.topList = -Math.floor( y / this.ratio );

	        this.listIn.style.top = this.topList+'px';
	        this.scroller.style.top = Math.floor( y )  + 'px';

	        this.py = y;

	    },

	    parentHeight: function ( t ) {

	        if ( this.parentGroup !== null ) { this.parentGroup.calc( t ); }
	        else if ( this.isUI ) { this.main.calc( t ); }

	    },

	    open: function () {

	        Proto.prototype.open.call( this );

	        this.update( 0 );
	        this.h = this.maxHeight + this.baseH + 5;
	        if( !this.scroll ){
	            this.topList = 0;
	            this.h = this.baseH + 5 + this.max;
	            this.scroller.style.display = 'none';
	        } else {
	            this.scroller.style.display = 'block';
	        }
	        this.s[0].height = this.h + 'px';
	        this.s[2].display = 'block';

	        if( this.up ){ 
	            this.zone.y -= this.h - (this.baseH-10);
	            this.setSvg( this.c[4], 'd', this.svgs.arrowUp );
	        } else {
	            this.setSvg( this.c[4], 'd', this.svgs.arrowDown );
	        }

	        this.rSizeContent();

	        var t = this.h - this.baseH;

	        this.zone.h = this.h;

	        this.parentHeight( t );

	    },

	    close: function () {

	        Proto.prototype.close.call( this );

	        if( this.up ) { this.zone.y += this.h - (this.baseH-10); }

	        var t = this.h - this.baseH;

	        this.h = this.baseH;
	        this.s[0].height = this.h + 'px';
	        this.s[2].display = 'none';
	        this.setSvg( this.c[4], 'd', this.svgs.arrow );

	        this.zone.h = this.h;

	        this.parentHeight( -t );

	    },

	    // -----

	    text: function ( txt ) {

	        this.c[3].textContent = txt;

	    },

	    rSizeContent: function () {

	        var i = this.length;
	        while(i--) { this.listIn.children[i].style.width = this.ww + 'px'; }

	    },

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	        var s = this.s;
	        var w = this.sb;
	        var d = this.sa;

	        if(s[2]=== undefined) { return; }

	        s[2].width = w + 'px';
	        s[2].left = d +'px';

	        s[3].width = w + 'px';
	        s[3].left = d + 'px';

	        s[4].left = d + w - 17 + 'px';

	        this.ww = w;
	        if( this.max > this.maxHeight ) { this.ww = w-20; }
	        if(this.isOpen) { this.rSizeContent(); }

	    }

	} );

	function Numeric( o ){

	    Proto.call( this, o );

	    this.setTypeNumber( o );

	    this.allway = o.allway || false;

	    this.isDown = false;

	    this.value = [0];
	    this.toRad = 1;
	    this.isNumber = true;
	    this.isAngle = false;
	    this.isVector = false;

	    this.isDrag = o.drag || false;

	    if( o.value !== undefined ){
	        if(!isNaN(o.value)){ this.value = [o.value];}
	        else if(o.value instanceof Array ){ this.value = o.value; this.isNumber=false;}
	        else if(o.value instanceof Object ){ 
	            this.value = [];
	            if(o.value.x) { this.value[0] = o.value.x; }
	            if(o.value.y) { this.value[1] = o.value.y; }
	            if(o.value.z) { this.value[2] = o.value.z; }
	            if(o.value.w) { this.value[3] = o.value.w; }
	            this.isVector = true;
	        }
	    }

	    this.lng = this.value.length;
	    this.tmp = [];

	    if(o.isAngle){
	        this.isAngle = true;
	        this.toRad = Math.PI/180;
	    }

	    this.current = -1;
	    this.prev = { x:0, y:0, d:0, v:0 };

	    // bg
	    this.c[2] = this.dom( 'div', this.css.basic + ' background:' + this.colors.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' );

	    this.cMode = [];
	    
	    var i = this.lng;
	    while(i--){

	        if(this.isAngle) { this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision ); }
	        this.c[3+i] = this.dom( 'div', this.css.txtselect + ' height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');//letter-spacing:-1px;
	        if(o.center) { this.c[2+i].style.textAlign = 'center'; }
	        this.c[3+i].textContent = this.value[i];
	        this.c[3+i].style.color = this.fontColor;
	        this.c[3+i].isNum = true;

	        this.cMode[i] = 0;

	    }

	    // cursor
	    this.cursorId = 3 + this.lng;
	    this.c[ this.cursorId ] = this.dom( 'div', this.css.basic + 'top:4px; height:' + (this.h-8) + 'px; width:0px; background:'+this.fontColor+';' );

	    this.init();
	}

	Numeric.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Numeric,

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }

	        var i = this.lng;
	        var t = this.tmp;
	        

	        while( i-- ){
	            if( l.x>t[i][0] && l.x<t[i][2] ) { return i; }
	        }

	        return '';

	    },

	   /* mode: function ( n, name ) {

	        if( n === this.cMode[name] ) return false;

	        //var m;

	        /*switch(n){

	            case 0: m = this.colors.border; break;
	            case 1: m = this.colors.borderOver; break;
	            case 2: m = this.colors.borderSelect;  break;

	        }*/

	   /*     this.reset();
	        //this.c[name+2].style.borderColor = m;
	        this.cMode[name] = n;

	        return true;

	    },*/

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mousedown: function ( e ) {

	        var name = this.testZone( e );

	        if( !this.isDown ){
	            this.isDown = true;
	            if( name !== '' ){ 
	            	this.current = name;
	            	this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isNumber ? parseFloat(this.value) : parseFloat( this.value[ this.current ] )  };
	            	this.setInput( this.c[ 3 + this.current ] );
	            }
	            return this.mousemove( e );
	        }

	        return false;
	        /*

	        if( name === '' ) return false;


	        this.current = name;
	        this.isDown = true;

	        this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isNumber ? parseFloat(this.value) : parseFloat( this.value[ this.current ] )  };


	        return this.mode( 2, name );*/

	    },

	    mouseup: function ( e ) {

	    	if( this.isDown ){
	            
	            this.isDown = false;
	            //this.current = -1;
	            this.prev = { x:0, y:0, d:0, v:0 };

	            return this.mousemove( e );
	        }

	        return false;

	        /*var name = this.testZone( e );
	        this.isDown = false;

	        if( this.current !== -1 ){ 

	            //var tm = this.current;
	            var td = this.prev.d;

	            this.current = -1;
	            this.prev = { x:0, y:0, d:0, v:0 };

	            if( !td ){

	                this.setInput( this.c[ 3 + name ] );
	                return true;//this.mode( 2, name );

	            } else {
	                return this.reset();//this.mode( 0, tm );
	            }

	        }*/

	    },

	    mousemove: function ( e ) {

	        var nup = false;
	        var x = 0;

	        var name = this.testZone( e );

	        if( name === '' ) { this.cursor(); }
	        else{ 
	        	if(!this.isDrag) { this.cursor('text'); }
	        	else { this.cursor( this.current !== -1 ? 'move' : 'pointer' ); }
	        }

	        

	        if( this.isDrag ){
	        	if( this.current !== -1 ){

	        	this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );

	            var n = this.prev.v + ( this.prev.d * this.step);

	            this.value[ this.current ] = this.numValue(n);
	            this.c[ 3 + this.current ].textContent = this.value[this.current];

	            this.validate();

	            this.prev.x = e.clientX;
	            this.prev.y = e.clientY;

	            nup = true;
	             }

	        } else {

	        	if( this.isDown ) { x = e.clientX - this.zone.x -3; }
	        	if( this.current !== -1 ) { x -= this.tmp[this.current][0]; }
	        	return this.upInput( x, this.isDown );

	        }

	        


	        return nup;

	    },

	    //keydown: function ( e ) { return true; },

	    // ----------------------

	    reset: function () {

	        var nup = false;
	        //this.isDown = false;

	        //this.current = 0;

	       /* var i = this.lng;
	        while(i--){ 
	            if(this.cMode[i]!==0){
	                this.cMode[i] = 0;
	                //this.c[2+i].style.borderColor = this.colors.border;
	                nup = true;
	            }
	        }*/

	        return nup;

	    },


	    setValue: function ( v, n ) {

	        n = n || 0;
	        this.value[n] = this.numValue( v );
	        this.c[ 3 + n ].textContent = this.value[n];

	    },


	    // ----------------------
	    //   INPUT
	    // ----------------------

	    select: function ( c, e, w ) {

	        var s = this.s;
	        var d = this.current !== -1 ? this.tmp[this.current][0] + 5 : 0;
	        s[this.cursorId].width = '1px';
	        s[this.cursorId].left = ( d + c ) + 'px';
	        s[2].left = ( d + e ) + 'px';
	        s[2].width = w + 'px';
	    
	    },

	    unselect: function () {

	        var s = this.s;
	        s[2].width = 0 + 'px';
	        s[this.cursorId].width = 0 + 'px';

	    },

	    validate: function () {

	        var ar = [];
	        var i = this.lng;

	        while(i--){ 
	        	
	        	if(!isNaN( this.c[ 3 + i ].textContent )){ 
	                var nx = this.numValue( this.c[ 3 + i ].textContent );
	                this.c[ 3 + i ].textContent = nx;
	                this.value[i] = nx;
	            } else { // not number
	                this.c[ 3 + i ].textContent = this.value[i];
	            }

	        	ar[i] = this.value[i] * this.toRad;
	        }

	        if( this.isNumber ) { this.send( ar[0] ); }
	        else { this.send( ar ); }

	    },

	    // ----------------------
	    //   REZISE
	    // ----------------------

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	        var w = Math.floor( ( this.sb + 5 ) / this.lng )-5;
	        var s = this.s;
	        var i = this.lng;
	        while(i--){
	            this.tmp[i] = [ Math.floor( this.sa + ( w * i )+( 5 * i )), w ];
	            this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
	            s[ 3 + i ].left = this.tmp[i][0] + 'px';
	            s[ 3 + i ].width = this.tmp[i][1] + 'px';
	        }

	    }

	} );

	function Slide ( o ){

	    Proto.call( this, o );

	    this.setTypeNumber( o );


	    this.model = o.stype || 0;
	    if( o.mode !== undefined ) { this.model = o.mode; }
	    this.buttonColor = o.bColor || this.colors.button;

	    this.defaultBorderColor = this.colors.hide;

	    this.isDown = false;
	    this.isOver = false;
	    this.allway = o.allway || false;

	    this.firstImput = false;

	    //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.fontColor );
	    this.c[2] = this.dom( 'div', this.css.txtselect + 'text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.fontColor );
	    //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; color:'+ this.fontColor );
	    this.c[3] = this.dom( 'div', this.css.basic + ' top:0; height:'+this.h+'px;' );
	    this.c[4] = this.dom( 'div', this.css.basic + 'background:'+this.colors.scrollback+'; top:2px; height:'+(this.h-4)+'px;' );
	    this.c[5] = this.dom( 'div', this.css.basic + 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + this.fontColor +';' );

	    this.c[2].isNum = true;
	    //this.c[2].style.height = (this.h-4) + 'px';
	    //this.c[2].style.lineHeight = (this.h-8) + 'px';
	    this.c[2].style.height = (this.h-2) + 'px';
	    this.c[2].style.lineHeight = (this.h-10) + 'px';

	    if(this.model !== 0){
	        if(this.model === 1 || this.model === 3){
	            var h1 = 4;
	            var h2 = 8;
	            var ww = this.h-4;
	            var ra = 20;
	        }

	        if(this.model === 2){
	            h1 = 4;//2
	            h2 = 8;
	            ra = 2;
	            ww = (this.h-4)*0.5;
	        }

	        if(this.model === 3) { this.c[5].style.visible = 'none'; }

	        this.c[4].style.borderRadius = h1 + 'px';
	        this.c[4].style.height = h2 + 'px';
	        this.c[4].style.top = (this.h*0.5) - h1 + 'px';
	        this.c[5].style.borderRadius = (h1*0.5) + 'px';
	        this.c[5].style.height = h1 + 'px';
	        this.c[5].style.top = (this.h*0.5)-(h1*0.5) + 'px';

	        this.c[6] = this.dom( 'div', this.css.basic + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+this.colors.border+'; background:'+this.buttonColor+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );
	    }

	    this.init();

	}

	Slide.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Slide,

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }
	        
	        if( l.x >= this.txl ) { return 'text'; }
	        else if( l.x >= this.sa ) { return 'scroll'; }
	        else { return ''; }

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup: function ( e ) {
	        
	        if( this.isDown ) { this.isDown = false; }
	        
	    },

	    mousedown: function ( e ) {

	        var name = this.testZone( e );

	        if( !name ) { return false; }

	        if( name === 'scroll' ){ 
	            this.isDown = true;
	            this.old = this.value;
	            this.mousemove( e );
	            
	        }

	        if( name === 'text' ){
	            this.setInput( this.c[2], function(){ this.validate(); }.bind(this) );
	        }

	        return true;

	    },

	    mousemove: function ( e ) {

	        var nup = false;

	        var name = this.testZone( e );

	        if( name === 'scroll' ) {
	            this.mode(1);
	            this.cursor('w-resize');
	        } else if(name === 'text'){ 
	            this.cursor('pointer');
	        } else {
	            this.cursor();
	        }

	        if( this.isDown ){

	            var n = ((( e.clientX - (this.zone.x+this.sa) - 3 ) / this.ww ) * this.range + this.min ) - this.old;
	            if(n >= this.step || n <= this.step){ 
	                n = Math.floor( n / this.step );
	                this.value = this.numValue( this.old + ( n * this.step ) );
	                this.update( true );
	                this.old = this.value;
	            }
	            nup = true;
	        }

	        return nup;

	    },

	    keydown: function ( e ) { return true; },

	    // ----------------------

	    validate: function () {
	        
	        var n = this.c[2].textContent;

	        if(!isNaN( n )){ 
	            this.value = this.numValue( n ); 
	            this.update(true); 
	        }

	        else { this.c[2].textContent = this.value; }

	    },


	    reset: function () {

	        //this.clearInput();
	        this.isDown = false;
	        this.mode(0);

	    },

	    mode: function ( mode ) {

	        var s = this.s;

	        switch(mode){
	            case 0: // base
	               // s[2].border = '1px solid ' + this.colors.hide;
	                s[2].color = this.fontColor;
	                s[4].background = this.colors.scrollback;
	                s[5].background = this.fontColor;
	            break;
	            case 1: // scroll over
	                //s[2].border = '1px dashed ' + this.colors.hide;
	                s[2].color = this.colorPlus;
	                s[4].background = this.colors.scrollbackover;
	                s[5].background = this.colorPlus;
	            break;
	           /* case 2: 
	                s[2].border = '1px solid ' + this.colors.borderSelect;
	            break;
	            case 3: 
	                s[2].border = '1px dashed ' + this.fontColor;//this.colors.borderSelect;
	            break;
	            case 4: 
	                s[2].border = '1px dashed ' + this.colors.hide;
	            break;*/


	        }
	    },

	    update: function ( up ) {

	        var ww = Math.floor( this.ww * (( this.value - this.min ) / this.range ));
	       
	        if(this.model !== 3) { this.s[5].width = ww + 'px'; }
	        if(this.s[6]) { this.s[6].left = ( this.sa + ww + 3 ) + 'px'; }
	        this.c[2].textContent = this.value;

	        if( up ) { this.send(); }

	    },

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	        var w = this.sb - this.sc;
	        this.ww = w - 6;

	        var tx = this.sc;
	        if(this.isUI || !this.simple) { tx = this.sc+10; }
	        this.txl = this.w - tx + 2;

	        //var ty = Math.floor(this.h * 0.5) - 8;

	        var s = this.s;

	        s[2].width = (this.sc -6 )+ 'px';
	        s[2].left = (this.txl +4) + 'px';
	        //s[2].top = ty + 'px';
	        s[3].left = this.sa + 'px';
	        s[3].width = w + 'px';
	        s[4].left = this.sa + 'px';
	        s[4].width = w + 'px';
	        s[5].left = (this.sa + 3) + 'px';

	        this.update();

	    },

	} );

	function TextInput( o ){

	    Proto.call( this, o );

	    this.cmode = 0;

	    this.value = o.value || '';
	    this.placeHolder = o.placeHolder || '';

	    this.allway = o.allway || false;
	    //this.firstImput = false;

	    this.isDown = false;

	    // bg
	    this.c[2] = this.dom( 'div', this.css.basic + ' background:' + this.colors.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' );

	    this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; line-height:'+(this.h-8)+'px; background:' + this.colors.inputBg + '; borderColor:' + this.colors.inputBorder+'; border-radius:'+this.radius+'px;' );
	    this.c[3].textContent = this.value;

	    // cursor
	    this.c[4] = this.dom( 'div', this.css.basic + 'top:4px; height:' + (this.h-8) + 'px; width:0px; background:'+this.fontColor+';' );


	    this.init();

	}

	TextInput.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: TextInput,

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }
	        if( l.x >= this.sa ) { return 'text'; }
	        return '';

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup: function ( e ) {

	        if( this.isDown ){
	            this.isDown = false;
	            return this.mousemove( e );
	        }

	        return false;

	    },

	    mousedown: function ( e ) {

	        var name = this.testZone( e );

	        if( !this.isDown ){
	            this.isDown = true;
	            if( name === 'text' ) { this.setInput( this.c[3] ); }
	            return this.mousemove( e );
	        }

	        return false;

	    },

	    mousemove: function ( e ) {

	        var name = this.testZone( e );

	        //var l = this.local;
	        //if( l.x === -1 && l.y === -1 ){ return;}

	        //if( l.x >= this.sa ) this.cursor('text');
	        //else this.cursor();

	        var x = 0;

	        if( name === 'text' ) { this.cursor('text'); }
	        else { this.cursor(); }

	        if( this.isDown ) { x = e.clientX - this.zone.x; }

	        return this.upInput( x - this.sa -3, this.isDown );

	    },

	    render: function ( c, e, s ) {

	        this.s[4].width = '1px';
	        this.s[4].left = (this.sa + c+5) + 'px';

	        this.s[2].left = (this.sa + e+5) + 'px';
	        this.s[2].width = s+'px';
	    
	    },


	    reset: function () {

	        this.cursor();

	    },

	    // ----------------------
	    //   INPUT
	    // ----------------------

	    select: function ( c, e, w ) {

	        var s = this.s;
	        var d = this.sa + 5;
	        s[4].width = '1px';
	        s[4].left = ( d + c ) + 'px';
	        s[2].left = ( d + e ) + 'px';
	        s[2].width = w + 'px';
	    
	    },

	    unselect: function () {

	        var s = this.s;
	        s[2].width = 0 + 'px';
	        s[4].width = 0 + 'px';

	    },

	    validate: function () {

	        this.value = this.c[3].textContent;
	        this.send();

	    },

	    // ----------------------
	    //   REZISE
	    // ----------------------

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	        var s = this.s;
	        s[3].left = this.sa + 'px';
	        s[3].width = this.sb + 'px';
	     
	    },


	});

	function Title ( o ) {
	    
	    Proto.call( this, o );

	    var prefix = o.prefix || '';

	    this.c[2] = this.dom( 'div', this.css.txt + 'text-align:right; width:60px; line-height:'+ (this.h-8) + 'px; color:' + this.fontColor );

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
	        this.s[1].width = this.w - 50 + 'px';
	        this.s[2].left = this.w - ( 50 + 26 ) + 'px';

	    },

	} );

	function Selector ( o ) {

	    Proto.call( this, o );

	    this.values = o.values;
	    if(typeof this.values === 'string' ) { this.values = [ this.values ]; }

	    this.value = o.value || this.values[0];



	    //this.selected = null;
	    this.isDown = false;

	    this.buttonColor = o.bColor || this.colors.button;

	    this.lng = this.values.length;
	    this.tmp = [];
	    this.stat = [];

	    var sel;

	    for(var i = 0; i < this.lng; i++){

	        sel = false;
	        if( this.values[i] === this.value ) { sel = true; }

	        this.c[i+2] = this.dom( 'div', this.css.txt + 'text-align:center; top:1px; background:'+(sel? this.colors.select : this.buttonColor)+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px; line-height:'+(this.h-4)+'px;' );
	        this.c[i+2].style.color = sel ? '#FFF' : this.fontColor;
	        this.c[i+2].innerHTML = this.values[i];
	        //this.c[i+2].name = this.values[i];
	        
	        this.stat[i] = sel ? 3:1;
	    }

	    this.init();

	}

	Selector.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Selector,

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }

	        var i = this.lng;
	        var t = this.tmp;
	        
	        while( i-- ){
	        	if( l.x>t[i][0] && l.x<t[i][2] ) { return i+2; }
	        }

	        return ''

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mouseup: function ( e ) {
	    
	        if( this.isDown ){
	            //this.value = false;
	            this.isDown = false;
	            //this.send();
	            return this.mousemove( e );
	        }

	        return false;

	    },

	    mousedown: function ( e ) {

	    	var name = this.testZone( e );

	        if( !name ) { return false; }

	    	this.isDown = true;
	        this.value = this.values[ name-2 ];
	        this.send();
	    	return this.mousemove( e );
	 
	        // true;

	    },

	    mousemove: function ( e ) {

	        var up = false;

	        var name = this.testZone( e );
	        //var sel = false;

	        

	        //console.log(name)

	        if( name !== '' ){
	            this.cursor('pointer');
	            up = this.modes( this.isDown ? 3 : 2, name );
	        } else {
	        	up = this.reset();
	        }

	        return up;

	    },

	    // ----------------------

	    modes: function ( n, name ) {

	        var v, r = false;

	        for( var i = 0; i < this.lng; i++ ){

	            if( i === name-2 && this.values[ i ] !== this.value ) { v = this.mode( n, i+2 ); }
	            else{ 

	                if( this.values[ i ] === this.value ) { v = this.mode( 3, i+2 ); }
	                else { v = this.mode( 1, i+2 ); }

	            }

	            if(v) { r = true; }

	        }

	        return r;

	    },

	    mode: function ( n, name ) {

	        var change = false;

	        var i = name - 2;


	        if( this.stat[i] !== n ){

	           
	        
	            switch( n ){

	                case 1: this.stat[i] = 1; this.s[ i+2 ].color = this.fontColor; this.s[ i+2 ].background = this.buttonColor; break;
	                case 2: this.stat[i] = 2; this.s[ i+2 ].color = '#FFF';         this.s[ i+2 ].background = this.colors.over; break;
	                case 3: this.stat[i] = 3; this.s[ i+2 ].color = '#FFF';         this.s[ i+2 ].background = this.colors.select; break;

	            }

	            change = true;

	        }
	        

	        return change;

	    },

	    // ----------------------

	    reset: function () {

	        this.cursor();

	        var v, r = false;

	        for( var i = 0; i < this.lng; i++ ){

	            if( this.values[ i ] === this.value ) { v = this.mode( 3, i+2 ); }
	            else { v = this.mode( 1, i+2 ); }
	            if(v) { r = true; }
	        }

	        return r;//this.modes( 1 , 2 );

	    	/*if( this.selected ){
	    		this.s[ this.selected ].color = this.fontColor;
	            this.s[ this.selected ].background = this.buttonColor;
	            this.selected = null;
	            
	            return true;
	    	}
	        return false;*/

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

	        	this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
	        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
	            s[i+2].left = this.tmp[i][0] + 'px';
	            s[i+2].width = this.tmp[i][1] + 'px';

	        }

	    }

	} );

	function Empty ( o ){

	    o.simple = true;
	    o.isEmpty = true;

	    Proto.call( this, o );

	    this.init();

	}

	Empty.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Empty,

	} );

	function Item ( o ){

	    Proto.call( this, o );
	    this.p = 100;
	    this.value = this.txt;
	    this.status = 1;

	    this.graph = this.svgs[o.itype || 'none'];

	    var fltop = Math.floor(this.h*0.5)-7;

	    this.c[2] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.graph, fill:this.fontColor, stroke:'none'});

	    this.s[1].marginLeft = 20 + 'px';

	    this.init();

	}

	Item.prototype = Object.assign( Object.create( Proto.prototype ), {

	    constructor: Item,

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    mousemove: function ( e ) {

	        this.cursor('pointer');

	        //up = this.modes( this.isDown ? 3 : 2, name );

	    },

	    mousedown: function ( e ) {

	        if( this.isUI ) { this.main.resetItem(); }

	        this.selected( true );

	        this.send();

	        return true;

	    },

	    uiout: function () {

	        if( this.isSelect ) { this.mode(3); }
	        else { this.mode(1); }

	    },

	    uiover: function () {

	        if( this.isSelect ) { this.mode(4); }
	        else { this.mode(2); }

	    },

	    update: function () {
	            
	    },

	    rSize: function () {

	        Proto.prototype.rSize.call( this );

	    },

	    mode: function ( n ) {

	        var change = false;

	        if( this.status !== n ){

	            this.status = n;
	        
	            switch( n ){

	                case 1: this.status = 1; this.s[1].color = this.fontColor; this.s[0].background = 'none'; break;
	                case 2: this.status = 2; this.s[1].color = this.fontColor; this.s[0].background = this.bgOver; break;
	                case 3: this.status = 3; this.s[1].color = '#FFF';         this.s[0].background = this.colors.select; break;
	                case 4: this.status = 4; this.s[1].color = '#FFF';         this.s[0].background = this.colors.down; break;

	            }

	            change = true;

	        }

	        return change;

	    },

	    reset: function () {

	        this.cursor();
	       // return this.mode( 1 );

	    },

	    selected: function ( b ){

	        if( this.isSelect ) { this.mode(1); }

	        this.isSelect = b || false;

	        if( this.isSelect ) { this.mode(3); }
	        
	    },


	} );

	/*function autoType () {

	    var a = arguments;
	    var type = 'Slide';
	    if( a[2].type ) type = a[2].type;
	    return type;

	};*/

	function add () {

	    var a = arguments; 

	    var type, o, ref = false, n = null;

	    if( typeof a[0] === 'string' ){ 

	        type = a[0];
	        o = a[1] || {};

	    } else if ( typeof a[0] === 'object' ){ // like dat gui

	        ref = true;
	        if( a[2] === undefined ) { [].push.call(a, {}); }

	        type = a[2].type ? a[2].type : 'slide';//autoType.apply( this, a );

	        o = a[2];
	        o.name = a[1];
	        o.value = a[0][a[1]];

	    }

	    var name = type.toLowerCase();

	    if( name === 'group' ) { o.add = add; }

	    switch( name ){

	        case 'bool': n = new Bool(o); break;
	        case 'button': n = new Button(o); break;
	        case 'circular': n = new Circular(o); break;
	        case 'color': n = new Color(o); break;
	        case 'fps': n = new Fps(o); break;
	        case 'graph': n = new Graph(o); break;
	        case 'group': n = new Group(o); break;
	        case 'joystick': n = new Joystick(o); break;
	        case 'knob': n = new Knob(o); break;
	        case 'list': n = new List(o); break;
	        case 'numeric': case 'number': n = new Numeric(o); break;
	        case 'slide': n = new Slide(o); break;
	        case 'textInput': case 'string': n = new TextInput(o); break;
	        case 'title': n = new Title(o); break;
	        case 'selector': n = new Selector(o); break;
	        case 'empty': case 'space': n = new Empty(o); break;
	        case 'item': n = new Item(o); break;

	    }

	    if( n !== null ){

	        if( ref ) { n.setReferency( a[0], a[1] ); }
	        return n;

	    }
	    

	}

	/**
	 * @author lth / https://github.com/lo-th
	 */

	function Gui ( o ) {

	    this.canvas = null;

	    o = o || {};

	    // color
	    this.colors = Tools.cloneColor();
	    this.css = Tools.cloneCss();


	    if( o.config ) { this.setConfig( o.config ); }


	    this.bg = o.bg || this.colors.background;

	    if( o.transparent !== undefined ){
	        this.colors.background = 'none';
	        this.colors.backgroundOver = 'none';
	    }

	    //if( o.callback ) this.callback =  o.callback;

	    this.isReset = true;

	    this.tmpAdd = null;
	    this.tmpH = 0;

	    this.isCanvas = o.isCanvas || false;
	    this.isCanvasOnly = false;
	    this.cssGui = o.css !== undefined ? o.css : '';
	    this.callback = o.callback  === undefined ? null : o.callback;

	    this.forceHeight = o.maxHeight || 0;
	    this.lockHeight = o.lockHeight || false;

	    this.isItemMode = o.itemMode !== undefined ? o.itemMode : false;

	    this.cn = '';
	    
	    // size define
	    this.size = Tools.size;
	    if( o.p !== undefined ) { this.size.p = o.p; }
	    if( o.w !== undefined ) { this.size.w = o.w; }
	    if( o.h !== undefined ) { this.size.h = o.h; }
	    if( o.s !== undefined ) { this.size.s = o.s; }

	    this.size.h = this.size.h < 11 ? 11 : this.size.h;

	    // local mouse and zone
	    this.local = new V2().neg();
	    this.zone = { x:0, y:0, w:this.size.w, h:0 };

	    // virtual mouse
	    this.mouse = new V2().neg();

	    this.h = 0;
	    this.prevY = -1;
	    this.sw = 0;

	    

	    // bottom and close height
	    this.isWithClose = o.close !== undefined ? o.close : true;
	    this.bh = !this.isWithClose ? 0 : this.size.h;

	    this.autoResize = o.autoResize === undefined ? true : o.autoResize;
	    
	    this.isCenter = o.center || false;
	    this.isOpen = true;
	    this.isDown = false;
	    this.isScroll = false;

	    this.uis = [];

	    this.current = -1;
	    this.target = null;
	    this.decal = 0;
	    this.ratio = 1;
	    this.oy = 0;



	    this.isNewTarget = false;

	    this.content = Tools.dom( 'div', this.css.basic + ' width:0px; height:auto; top:0px; ' + this.cssGui );

	    this.innerContent = Tools.dom( 'div', this.css.basic + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
	    this.content.appendChild( this.innerContent );

	    this.inner = Tools.dom( 'div', this.css.basic + 'width:100%; left:0; ');
	    this.innerContent.appendChild(this.inner);

	    // scroll
	    this.scrollBG = Tools.dom( 'div', this.css.basic + 'right:0; top:0; width:'+ (this.size.s - 1) +'px; height:10px; display:none; background:'+this.bg+';');
	    this.content.appendChild( this.scrollBG );

	    this.scroll = Tools.dom( 'div', this.css.basic + 'background:'+this.colors.scroll+'; right:2px; top:0; width:'+(this.size.s-4)+'px; height:10px;');
	    this.scrollBG.appendChild( this.scroll );

	    // bottom button
	    this.bottom = Tools.dom( 'div',  this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:10px;  border-bottom-left-radius:10px; text-align:center; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px; border-top:1px solid '+Tools.colors.stroke+';');
	    this.content.appendChild( this.bottom );
	    this.bottom.textContent = 'close';
	    this.bottom.style.background = this.bg;

	    //

	    this.parent = o.parent !== undefined ? o.parent : null;
	    
	    if( this.parent === null && !this.isCanvas ){ 
	    	this.parent = document.body;
	        // default position
	    	if( !this.isCenter ) { this.content.style.right = '10px'; } 
	    }

	    if( this.parent !== null ) { this.parent.appendChild( this.content ); }

	    if( this.isCanvas && this.parent === null ) { this.isCanvasOnly = true; }

	    if( !this.isCanvasOnly ) { this.content.style.pointerEvents = 'auto'; }


	    this.setWidth();

	    if( this.isCanvas ) { this.makeCanvas(); }

	    Roots.add( this );

	}

	Object.assign( Gui.prototype, {

	    constructor: Gui,

	    isGui: true,

	    setTop: function ( t, h ) {

	        this.content.style.top = t + 'px';
	        if( h !== undefined ) { this.forceHeight = h; }
	        this.setHeight();

	    },

	    //callback: function () {},

	    dispose: function () {

	        this.clear();
	        if( this.parent !== null ) { this.parent.removeChild( this.content ); }
	        Roots.remove( this );

	    },

	    // ----------------------
	    //   CANVAS
	    // ----------------------

	    onDraw: function () { },

	    makeCanvas: function () {

	    	this.canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', "canvas" );
	    	this.canvas.width = this.zone.w;
	    	this.canvas.height = this.forceHeight ? this.forceHeight : this.zone.h;

	    },

	    draw: function ( force ) {

	    	if( this.canvas === null ) { return; }

	    	var w = this.zone.w;
	    	var h = this.forceHeight ? this.forceHeight : this.zone.h;
	    	Roots.toCanvas( this, w, h, force );

	    },

	    //////

	    getDom: function () {

	        return this.content;

	    },

	    setMouse: function( m ){

	        this.mouse.set( m.x, m.y );

	    },

	    setConfig: function ( o ) {

	        this.setColors( o );
	        this.setText( o.fontSize, o.text, o.font, o.shadow );

	    },

	    setColors: function ( o ) {

	        for( var c in o ){
	            if( this.colors[c] ) { this.colors[c] = o[c]; }
	        }

	    },

	    setText: function ( size, color, font, shadow ) {

	        Tools.setText( size, color, font, shadow, this.colors, this.css );

	    },

	    hide: function ( b ) {

	        this.content.style.display = b ? 'none' : 'block';
	        
	    },

	    onChange: function ( f ) {

	        this.callback = f;
	        return this;

	    },

	    // ----------------------
	    //   STYLES
	    // ----------------------

	    mode: function ( n ) {

	    	var needChange = false;

	    	if( n !== this.cn ){

		    	this.cn = n;

		    	switch( n ){

		    		case 'def': 
		    		   this.scroll.style.background = this.colors.scroll; 
		    		   this.bottom.style.background = this.colors.background;
		    		   this.bottom.style.color = this.colors.text;
		    		break;

		    		//case 'scrollDef': this.scroll.style.background = this.colors.scroll; break;
		    		case 'scrollOver': this.scroll.style.background = this.colors.select; break;
		    		case 'scrollDown': this.scroll.style.background = this.colors.down; break;

		    		//case 'bottomDef': this.bottom.style.background = this.colors.background; break;
		    		case 'bottomOver': this.bottom.style.background = this.colors.backgroundOver; this.bottom.style.color = '#FFF'; break;
		    		//case 'bottomDown': this.bottom.style.background = this.colors.select; this.bottom.style.color = '#000'; break;

		    	}

		    	needChange = true;

		    }

	    	return needChange;

	    },

	    // ----------------------
	    //   TARGET
	    // ----------------------

	    clearTarget: function () {

	    	if( this.current === -1 ) { return false; }
	        //if(!this.target) return;
	        this.target.uiout();
	        this.target.reset();
	        this.target = null;
	        this.current = -1;

	        ///console.log(this.isDown)//if(this.isDown)Roots.clearInput();

	        

	        Roots.cursor();
	        return true;

	    },

	    // ----------------------
	    //   ZONE TEST
	    // ----------------------

	    testZone: function ( e ) {

	        var l = this.local;
	        if( l.x === -1 && l.y === -1 ) { return ''; }

	        this.isReset = false;

	        var name = '';

	        var s = this.isScroll ?  this.zone.w  - this.size.s : this.zone.w;
	        
	        if( l.y > this.zone.h - this.bh &&  l.y < this.zone.h ) { name = 'bottom'; }
	        else { name = l.x > s ? 'scroll' : 'content'; }

	        return name;

	    },

	    // ----------------------
	    //   EVENTS
	    // ----------------------

	    handleEvent: function ( e ) {

	    	var type = e.type;

	    	var change = false;
	    	var targetChange = false;

	    	var name = this.testZone( e );

	        

	    	if( type === 'mouseup' && this.isDown ) { this.isDown = false; }
	    	if( type === 'mousedown' && !this.isDown ) { this.isDown = true; }

	        if( this.isDown && this.isNewTarget ){ Roots.clearInput(); this.isNewTarget=false; }

	    	if( !name ) { return; }

	    	switch( name ){

	    		case 'content':

	                e.clientY = this.isScroll ?  e.clientY + this.decal : e.clientY;

	                if( Roots.isMobile && type === 'mousedown' ) { this.getNext( e, change ); }

		    		if( this.target ) { targetChange = this.target.handleEvent( e ); }

		    		if( type === 'mousemove' ) { change = this.mode('def'); }
	                if( type === 'wheel' && !targetChange && this.isScroll ) { change = this.onWheel( e ); }
	               
		    		if( !Roots.lock ) {
	                    this.getNext( e, change );
	                }

	    		break;
	    		case 'bottom':

		    		this.clearTarget();
		    		if( type === 'mousemove' ) { change = this.mode('bottomOver'); }
		    		if( type === 'mousedown' ) {
		    			this.isOpen = this.isOpen ? false : true;
			            this.bottom.textContent = this.isOpen ? 'close' : 'open';
			            this.setHeight();
			            this.mode('def');
			            change = true;
		    		}

	    		break;
	    		case 'scroll':

		    		this.clearTarget();
		    		if( type === 'mousemove' ) { change = this.mode('scrollOver'); }
		    		if( type === 'mousedown' ) { change = this.mode('scrollDown'); } 
	                if( type === 'wheel' ) { change = this.onWheel( e ); } 
		    		if( this.isDown ) { this.update( (e.clientY-this.zone.y)-(this.sh*0.5) ); }

	    		break;


	    	}

	    	if( this.isDown ) { change = true; }
	    	if( targetChange ) { change = true; }

	        if( type === 'keyup' ) { change = true; }
	        if( type === 'keydown' ) { change = true; }

	    	if( change ) { this.draw(); }

	    },

	    getNext: function ( e, change ) {



	        var next = Roots.findTarget( this.uis, e );

	        if( next !== this.current ){
	            this.clearTarget();
	            this.current = next;

	            this.isNewTarget = true;

	        }

	        if( next !== -1 ){ 
	            this.target = this.uis[ this.current ];
	            this.target.uiover();
	        }

	    },

	    onWheel: function ( e ) {

	        this.oy += 20*e.delta;
	        this.update( this.oy );
	        return true;

	    },

	    // ----------------------
	    //   RESET
	    // ----------------------

	    reset: function ( force ) {

	        if( this.isReset ) { return; }

	        //this.resetItem();

	        this.mouse.neg();
	        this.isDown = false;

	        //Roots.clearInput();
	        var r = this.mode('def');
	        var r2 = this.clearTarget();

	        if( r || r2 ) { this.draw( true ); }

	        this.isReset = true;

	        //Roots.lock = false;

	    },

	    // ----------------------
	    //   ADD NODE
	    // ----------------------

	    add: function () {

	        var a = arguments;

	        if( typeof a[1] === 'object' ){ 

	            a[1].isUI = true;
	            a[1].main = this;

	        } else if( typeof a[1] === 'string' ){

	            if( a[2] === undefined ) { [].push.call(a, { isUI:true, main:this }); }
	            else {
	                a[2].isUI = true;
	                a[2].main = this;
	            }
	            
	        } 

	        var u = add.apply( this, a );

	        if( u === null ) { return; }


	        //var n = add.apply( this, a );
	        //var n = UIL.add( ...args );

	        this.uis.push( u );
	        //n.py = this.h;

	        if( !u.autoWidth ){
	            var y = u.c[0].getBoundingClientRect().top;
	            if( this.prevY !== y ){
	                this.calc( u.h + 1 );
	                this.prevY = y;
	            }
	        }else{
	            this.prevY = 0;//-1;
	            this.calc( u.h + 1 );
	        }

	        return u;

	    },

	    applyCalc: function () {

	        //console.log(this.uis.length, this.tmpH )

	        this.calc( this.tmpH );
	        //this.tmpH = 0;
	        this.tmpAdd = null;

	    },

	    calcUis: function () {

	        Roots.calcUis( this.uis, this.zone, this.zone.y );

	    },

	    // remove one node

	    remove: function ( n ) { 

	        var i = this.uis.indexOf( n ); 
	        if ( i !== -1 ) { this.uis[i].clear(); }

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

	    clear: function () {

	        var i = this.uis.length;
	        while(i--) { this.uis[i].clear(); }

	        this.uis = [];
	        Roots.listens = [];

	        this.calc( -this.h );

	    },

	    // ----------------------
	    //   ITEMS SPECIAL
	    // ----------------------


	    resetItem: function () {

	        if( !this.isItemMode ) { return; }

	        var i = this.uis.length;
	        while(i--) { this.uis[i].selected(); }

	    },

	    setItem: function ( name ) {

	        if( !this.isItemMode ) { return; }

	        this.resetItem();

	        var i = this.uis.length;
	        while(i--){ 
	            if( this.uis[i].value  === name ){ 
	                this.uis[i].selected( true );
	                if( this.isScroll ) { this.update( ( i*(this.size.h+1) )*this.ratio ); }
	            }
	        }

	    },



	    // ----------------------
	    //   SCROLL
	    // ----------------------

	    upScroll: function ( b ) {

	        this.sw = b ? this.size.s : 0;
	        this.oy = b ? this.oy : 0;
	        this.scrollBG.style.display = b ? 'block' : 'none';

	        if( b ){

	            this.total = this.h;

	            this.maxView = this.maxHeight;

	            this.ratio = this.maxView / this.total;
	            this.sh = this.maxView * this.ratio;

	            //if( this.sh < 20 ) this.sh = 20;

	            this.range = this.maxView - this.sh;

	            this.oy = Tools.clamp( this.oy, 0, this.range );

	            this.scrollBG.style.height = this.maxView + 'px';
	            this.scroll.style.height = this.sh + 'px';

	        }

	        this.setItemWidth( this.zone.w - this.sw );
	        this.update( this.oy );

	    },

	    update: function ( y ) {

	        y = Tools.clamp( y, 0, this.range );

	        this.decal = Math.floor( y / this.ratio );
	        this.inner.style.top = - this.decal + 'px';
	        this.scroll.style.top = Math.floor( y ) + 'px';
	        this.oy = y;

	    },

	    // ----------------------
	    //   RESIZE FUNCTION
	    // ----------------------

	    calc: function ( y ) {

	        this.h += y;
	        clearTimeout( this.tmp );
	        this.tmp = setTimeout( this.setHeight.bind(this), 10 );

	    },

	    setHeight: function () {

	        if( this.tmp ) { clearTimeout( this.tmp ); }

	        //console.log(this.h )

	        this.zone.h = this.bh;
	        this.isScroll = false;

	        if( this.isOpen ){

	            var hhh = this.forceHeight ? this.forceHeight + this.zone.y : window.innerHeight;

	            this.maxHeight = hhh - this.zone.y - this.bh;

	            var diff = this.h - this.maxHeight;

	            //console.log(diff)

	            if( diff > 1 ){ //this.h > this.maxHeight ){

	                this.isScroll = true;
	                this.zone.h = this.maxHeight + this.bh;

	            } else {

	                this.zone.h = this.h + this.bh;
	                
	            }

	        }

	        this.upScroll( this.isScroll );

	        this.innerContent.style.height = this.zone.h - this.bh + 'px';
	        this.content.style.height = this.zone.h + 'px';
	        this.bottom.style.top = this.zone.h - this.bh + 'px';

	        if( this.forceHeight && this.lockHeight ) { this.content.style.height = this.forceHeight + 'px'; }

	        if( this.isOpen ) { this.calcUis(); }
	        if( this.isCanvas ) { this.draw( true ); }

	    },

	    setWidth: function ( w ) {

	        if( w ) { this.zone.w = w; }

	        this.content.style.width = this.zone.w + 'px';

	        if( this.isCenter ) { this.content.style.marginLeft = -(Math.floor(this.zone.w*0.5)) + 'px'; }

	        this.setItemWidth( this.zone.w - this.sw );

	        this.setHeight();

	        if( !this.isCanvasOnly ) { Roots.needReZone = true; }
	        //this.resize();

	    },

	    setItemWidth: function ( w ) {

	        var i = this.uis.length;
	        while(i--){
	            this.uis[i].setSize( w );
	            this.uis[i].rSize();
	        }

	    },


	} );

	var REVISION = '2.66';

	exports.Bool = Bool;
	exports.Button = Button;
	exports.Circular = Circular;
	exports.Color = Color;
	exports.Fps = Fps;
	exports.Group = Group;
	exports.Gui = Gui;
	exports.Joystick = Joystick;
	exports.Knob = Knob;
	exports.List = List;
	exports.Numeric = Numeric;
	exports.Proto = Proto;
	exports.REVISION = REVISION;
	exports.Slide = Slide;
	exports.TextInput = TextInput;
	exports.Title = Title;
	exports.Tools = Tools;
	exports.add = add;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlsLmpzIiwic291cmNlcyI6WyIuLi9zcmMvcG9seWZpbGxzLmpzIiwiLi4vc3JjL2NvcmUvVG9vbHMuanMiLCIuLi9zcmMvY29yZS9Sb290cy5qcyIsIi4uL3NyYy9jb3JlL1YyLmpzIiwiLi4vc3JjL2NvcmUvUHJvdG8uanMiLCIuLi9zcmMvcHJvdG8vQm9vbC5qcyIsIi4uL3NyYy9wcm90by9CdXR0b24uanMiLCIuLi9zcmMvcHJvdG8vQ2lyY3VsYXIuanMiLCIuLi9zcmMvcHJvdG8vQ29sb3IuanMiLCIuLi9zcmMvcHJvdG8vRnBzLmpzIiwiLi4vc3JjL3Byb3RvL0dyYXBoLmpzIiwiLi4vc3JjL3Byb3RvL0dyb3VwLmpzIiwiLi4vc3JjL3Byb3RvL0pveXN0aWNrLmpzIiwiLi4vc3JjL3Byb3RvL0tub2IuanMiLCIuLi9zcmMvcHJvdG8vTGlzdC5qcyIsIi4uL3NyYy9wcm90by9OdW1lcmljLmpzIiwiLi4vc3JjL3Byb3RvL1NsaWRlLmpzIiwiLi4vc3JjL3Byb3RvL1RleHRJbnB1dC5qcyIsIi4uL3NyYy9wcm90by9UaXRsZS5qcyIsIi4uL3NyYy9wcm90by9TZWxlY3Rvci5qcyIsIi4uL3NyYy9wcm90by9FbXB0eS5qcyIsIi4uL3NyYy9wcm90by9JdGVtLmpzIiwiLi4vc3JjL2NvcmUvYWRkLmpzIiwiLi4vc3JjL2NvcmUvR3VpLmpzIiwiLi4vc3JjL1VpbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb2x5ZmlsbHNcclxuXHJcbmlmICggTnVtYmVyLkVQU0lMT04gPT09IHVuZGVmaW5lZCApIHtcclxuXHJcblx0TnVtYmVyLkVQU0lMT04gPSBNYXRoLnBvdyggMiwgLSA1MiApO1xyXG5cclxufVxyXG5cclxuLy9cclxuXHJcbmlmICggTWF0aC5zaWduID09PSB1bmRlZmluZWQgKSB7XHJcblxyXG5cdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL01hdGgvc2lnblxyXG5cclxuXHRNYXRoLnNpZ24gPSBmdW5jdGlvbiAoIHggKSB7XHJcblxyXG5cdFx0cmV0dXJuICggeCA8IDAgKSA/IC0gMSA6ICggeCA+IDAgKSA/IDEgOiArIHg7XHJcblxyXG5cdH07XHJcblxyXG59XHJcblxyXG5pZiAoIEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQgKSB7XHJcblxyXG5cdC8vIE1pc3NpbmcgaW4gSUU5LTExLlxyXG5cdC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL25hbWVcclxuXHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBGdW5jdGlvbi5wcm90b3R5cGUsICduYW1lJywge1xyXG5cclxuXHRcdGdldDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdFx0cmV0dXJuIHRoaXMudG9TdHJpbmcoKS5tYXRjaCggL15cXHMqZnVuY3Rpb25cXHMqKFteXFwoXFxzXSopLyApWyAxIF07XHJcblxyXG5cdFx0fVxyXG5cclxuXHR9ICk7XHJcblxyXG59XHJcblxyXG5pZiAoIE9iamVjdC5hc3NpZ24gPT09IHVuZGVmaW5lZCApIHtcclxuXHJcblx0Ly8gTWlzc2luZyBpbiBJRS5cclxuXHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduXHJcblxyXG5cdCggZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbiAoIHRhcmdldCApIHtcclxuXHJcblx0XHRcdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0XHRcdGlmICggdGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsICkge1xyXG5cclxuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCAnQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0JyApO1xyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0dmFyIG91dHB1dCA9IE9iamVjdCggdGFyZ2V0ICk7XHJcblxyXG5cdFx0XHRmb3IgKCB2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4ICsrICkge1xyXG5cclxuXHRcdFx0XHR2YXIgc291cmNlID0gYXJndW1lbnRzWyBpbmRleCBdO1xyXG5cclxuXHRcdFx0XHRpZiAoIHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCApIHtcclxuXHJcblx0XHRcdFx0XHRmb3IgKCB2YXIgbmV4dEtleSBpbiBzb3VyY2UgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRpZiAoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCggc291cmNlLCBuZXh0S2V5ICkgKSB7XHJcblxyXG5cdFx0XHRcdFx0XHRcdG91dHB1dFsgbmV4dEtleSBdID0gc291cmNlWyBuZXh0S2V5IF07XHJcblxyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRyZXR1cm4gb3V0cHV0O1xyXG5cclxuXHRcdH07XHJcblxyXG5cdH0gKSgpO1xyXG5cclxufVxyXG4iLCIvKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG52YXIgVCA9IHtcclxuXHJcbiAgICBmcmFnOiBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXHJcblxyXG4gICAgY29sb3JSaW5nOiBudWxsLFxyXG4gICAgam95c3RpY2tfMDogbnVsbCxcclxuICAgIGpveXN0aWNrXzE6IG51bGwsXHJcbiAgICBjaXJjdWxhcjogbnVsbCxcclxuICAgIGtub2I6IG51bGwsXHJcbiAgICAvL2dyYXBoOiBudWxsLFxyXG5cclxuICAgIHN2Z25zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXHJcbiAgICBodG1sczogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXHJcblxyXG4gICAgRE9NX1NJWkU6IFsgJ2hlaWdodCcsICd3aWR0aCcsICd0b3AnLCAnbGVmdCcsICdib3R0b20nLCAncmlnaHQnLCAnbWFyZ2luLWxlZnQnLCAnbWFyZ2luLXJpZ2h0JywgJ21hcmdpbi10b3AnLCAnbWFyZ2luLWJvdHRvbSddLFxyXG4gICAgU1ZHX1RZUEVfRDogWyAncGF0dGVybicsICdkZWZzJywgJ3RyYW5zZm9ybScsICdzdG9wJywgJ2FuaW1hdGUnLCAncmFkaWFsR3JhZGllbnQnLCAnbGluZWFyR3JhZGllbnQnLCAnYW5pbWF0ZU1vdGlvbicgXSxcclxuICAgIFNWR19UWVBFX0c6IFsgJ3N2ZycsICdyZWN0JywgJ2NpcmNsZScsICdwYXRoJywgJ3BvbHlnb24nLCAndGV4dCcsICdnJywgJ2xpbmUnLCAnZm9yZWlnbk9iamVjdCcgXSxcclxuXHJcbiAgICBUd29QSTogNi4yODMxODUzMDcxNzk1ODYsXHJcblxyXG4gICAgc2l6ZTogeyAgdzogMjQwLCBoOiAyMCwgcDogMzAsIHM6IDIwIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDT0xPUlxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNsb25lQ29sb3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIGNjID0gT2JqZWN0LmFzc2lnbih7fSwgVC5jb2xvcnMgKTtcclxuICAgICAgICByZXR1cm4gY2M7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZUNzczogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgY2MgPSBPYmplY3QuYXNzaWduKHt9LCBULmNzcyApO1xyXG4gICAgICAgIHJldHVybiBjYztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNvbG9yczoge1xyXG5cclxuICAgICAgICB0ZXh0IDogJyNDMEMwQzAnLFxyXG4gICAgICAgIHRleHRPdmVyIDogJyNGRkZGRkYnLFxyXG4gICAgICAgIHR4dHNlbGVjdGJnIDogJ25vbmUnLFxyXG5cclxuICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSg0NCw0NCw0NCwwLjMpJyxcclxuICAgICAgICBiYWNrZ3JvdW5kT3ZlcjogJ3JnYmEoMTEsMTEsMTEsMC41KScsXHJcblxyXG4gICAgICAgIC8vaW5wdXQ6ICcjMDA1QUFBJyxcclxuXHJcbiAgICAgICAgaW5wdXRCb3JkZXI6ICcjNDU0NTQ1JyxcclxuICAgICAgICBpbnB1dEJvcmRlclNlbGVjdDogJyMwMDVBQUEnLFxyXG4gICAgICAgIGlucHV0Qmc6ICdyZ2JhKDAsMCwwLDAuMiknLFxyXG4gICAgICAgIGlucHV0T3ZlcjogJ3JnYmEoODAsODAsMTcwLDAuMiknLFxyXG5cclxuICAgICAgICBib3JkZXIgOiAnIzQ1NDU0NScsXHJcbiAgICAgICAgYm9yZGVyT3ZlciA6ICcjNTA1MEFBJyxcclxuICAgICAgICBib3JkZXJTZWxlY3QgOiAnIzMwOEFGRicsXHJcblxyXG4gICAgICAgIHNjcm9sbGJhY2s6J3JnYmEoNDQsNDQsNDQsMC4yKScsXHJcbiAgICAgICAgc2Nyb2xsYmFja292ZXI6J3JnYmEoNDQsNDQsNDQsMC4yKScsXHJcblxyXG4gICAgICAgIGJ1dHRvbiA6ICcjNDA0MDQwJyxcclxuICAgICAgICBib29sYmcgOiAnIzE4MTgxOCcsXHJcbiAgICAgICAgYm9vbG9uIDogJyNDMEMwQzAnLFxyXG5cclxuICAgICAgICBzZWxlY3QgOiAnIzMwOEFGRicsXHJcbiAgICAgICAgbW92aW5nIDogJyMwM2FmZmYnLFxyXG4gICAgICAgIGRvd24gOiAnIzAyNDY5OScsXHJcbiAgICAgICAgb3ZlciA6ICcjMDI0Njk5JyxcclxuXHJcbiAgICAgICAgc3Ryb2tlOiAncmdiYSgxMSwxMSwxMSwwLjUpJyxcclxuICAgICAgICBzY3JvbGw6ICcjMzMzMzMzJyxcclxuXHJcbiAgICAgICAgaGlkZTogJ3JnYmEoMCwwLDAsMCknLFxyXG5cclxuICAgICAgICBncm91cEJvcmRlcjogJ25vbmUnLFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gc3R5bGUgY3NzXHJcblxyXG4gICAgY3NzIDoge1xyXG4gICAgICAgIC8vdW5zZWxlY3Q6ICctby11c2VyLXNlbGVjdDpub25lOyAtbXMtdXNlci1zZWxlY3Q6bm9uZTsgLWtodG1sLXVzZXItc2VsZWN0Om5vbmU7IC13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsgLW1vei11c2VyLXNlbGVjdDpub25lOycsIFxyXG4gICAgICAgIGJhc2ljOiAncG9zaXRpb246YWJzb2x1dGU7IHBvaW50ZXItZXZlbnRzOm5vbmU7IGJveC1zaXppbmc6Ym9yZGVyLWJveDsgbWFyZ2luOjA7IHBhZGRpbmc6MDsgb3ZlcmZsb3c6aGlkZGVuOyAnICsgJy1vLXVzZXItc2VsZWN0Om5vbmU7IC1tcy11c2VyLXNlbGVjdDpub25lOyAta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTsgLXdlYmtpdC11c2VyLXNlbGVjdDpub25lOyAtbW96LXVzZXItc2VsZWN0Om5vbmU7JyxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gc3ZnIHBhdGhcclxuXHJcbiAgICBzdmdzOiB7XHJcblxyXG4gICAgICAgIGdyb3VwOidNIDcgNyBMIDcgOCA4IDggOCA3IDcgNyBNIDUgNyBMIDUgOCA2IDggNiA3IDUgNyBNIDMgNyBMIDMgOCA0IDggNCA3IDMgNyBNIDcgNSBMIDcgNiA4IDYgOCA1IDcgNSBNIDYgNiBMIDYgNSA1IDUgNSA2IDYgNiBNIDcgMyBMIDcgNCA4IDQgOCAzIDcgMyBNIDYgNCBMIDYgMyA1IDMgNSA0IDYgNCBNIDMgNSBMIDMgNiA0IDYgNCA1IDMgNSBNIDMgMyBMIDMgNCA0IDQgNCAzIDMgMyBaJyxcclxuICAgICAgICBhcnJvdzonTSAzIDggTCA4IDUgMyAyIDMgOCBaJyxcclxuICAgICAgICBhcnJvd0Rvd246J00gNSA4IEwgOCAzIDIgMyA1IDggWicsXHJcbiAgICAgICAgYXJyb3dVcDonTSA1IDIgTCAyIDcgOCA3IDUgMiBaJyxcclxuXHJcbiAgICAgICAgc29saWQ6J00gMTMgMTAgTCAxMyAxIDQgMSAxIDQgMSAxMyAxMCAxMyAxMyAxMCBNIDExIDMgTCAxMSA5IDkgMTEgMyAxMSAzIDUgNSAzIDExIDMgWicsXHJcbiAgICAgICAgYm9keTonTSAxMyAxMCBMIDEzIDEgNCAxIDEgNCAxIDEzIDEwIDEzIDEzIDEwIE0gMTEgMyBMIDExIDkgOSAxMSAzIDExIDMgNSA1IDMgMTEgMyBNIDUgNCBMIDQgNSA0IDEwIDkgMTAgMTAgOSAxMCA0IDUgNCBaJyxcclxuICAgICAgICB2ZWhpY2xlOidNIDEzIDYgTCAxMSAxIDMgMSAxIDYgMSAxMyAzIDEzIDMgMTEgMTEgMTEgMTEgMTMgMTMgMTMgMTMgNiBNIDIuNCA2IEwgNCAyIDEwIDIgMTEuNiA2IDIuNCA2IE0gMTIgOCBMIDEyIDEwIDEwIDEwIDEwIDggMTIgOCBNIDQgOCBMIDQgMTAgMiAxMCAyIDggNCA4IFonLFxyXG4gICAgICAgIGFydGljdWxhdGlvbjonTSAxMyA5IEwgMTIgOSA5IDIgOSAxIDUgMSA1IDIgMiA5IDEgOSAxIDEzIDUgMTMgNSA5IDQgOSA2IDUgOCA1IDEwIDkgOSA5IDkgMTMgMTMgMTMgMTMgOSBaJyxcclxuICAgICAgICBjaGFyYWN0ZXI6J00gMTMgNCBMIDEyIDMgOSA0IDUgNCAyIDMgMSA0IDUgNiA1IDggNCAxMyA2IDEzIDcgOSA4IDEzIDEwIDEzIDkgOCA5IDYgMTMgNCBNIDYgMSBMIDYgMyA4IDMgOCAxIDYgMSBaJyxcclxuICAgICAgICB0ZXJyYWluOidNIDEzIDggTCAxMiA3IFEgOS4wNiAtMy42NyA1Ljk1IDQuODUgNC4wNCAzLjI3IDIgNyBMIDEgOCA3IDEzIDEzIDggTSAzIDggUSAzLjc4IDUuNDIwIDUuNCA2LjYgNS4yMCA3LjI1IDUgOCBMIDcgOCBRIDguMzkgLTAuMTYgMTEgOCBMIDcgMTEgMyA4IFonLFxyXG4gICAgICAgIGpvaW50OidNIDcuNyA3LjcgUSA4IDcuNDUgOCA3IDggNi42IDcuNyA2LjMgNy40NSA2IDcgNiA2LjYgNiA2LjMgNi4zIDYgNi42IDYgNyA2IDcuNDUgNi4zIDcuNyA2LjYgOCA3IDggNy40NSA4IDcuNyA3LjcgTSAzLjM1IDguNjUgTCAxIDExIDMgMTMgNS4zNSAxMC42NSBRIDYuMSAxMSA3IDExIDguMjggMTEgOS4yNSAxMC4yNSBMIDcuOCA4LjggUSA3LjQ1IDkgNyA5IDYuMTUgOSA1LjU1IDguNCA1IDcuODUgNSA3IDUgNi41NCA1LjE1IDYuMTUgTCAzLjcgNC43IFEgMyA1LjcxMiAzIDcgMyA3LjkgMy4zNSA4LjY1IE0gMTAuMjUgOS4yNSBRIDExIDguMjggMTEgNyAxMSA2LjEgMTAuNjUgNS4zNSBMIDEzIDMgMTEgMSA4LjY1IDMuMzUgUSA3LjkgMyA3IDMgNS43IDMgNC43IDMuNyBMIDYuMTUgNS4xNSBRIDYuNTQgNSA3IDUgNy44NSA1IDguNCA1LjU1IDkgNi4xNSA5IDcgOSA3LjQ1IDguOCA3LjggTCAxMC4yNSA5LjI1IFonLFxyXG4gICAgICAgIHJheTonTSA5IDExIEwgNSAxMSA1IDEyIDkgMTIgOSAxMSBNIDEyIDUgTCAxMSA1IDExIDkgMTIgOSAxMiA1IE0gMTEuNSAxMCBRIDEwLjkgMTAgMTAuNDUgMTAuNDUgMTAgMTAuOSAxMCAxMS41IDEwIDEyLjIgMTAuNDUgMTIuNTUgMTAuOSAxMyAxMS41IDEzIDEyLjIgMTMgMTIuNTUgMTIuNTUgMTMgMTIuMiAxMyAxMS41IDEzIDEwLjkgMTIuNTUgMTAuNDUgMTIuMiAxMCAxMS41IDEwIE0gOSAxMCBMIDEwIDkgMiAxIDEgMiA5IDEwIFonLFxyXG4gICAgICAgIGNvbGxpc2lvbjonTSAxMSAxMiBMIDEzIDEwIDEwIDcgMTMgNCAxMSAyIDcuNSA1LjUgOSA3IDcuNSA4LjUgMTEgMTIgTSAzIDIgTCAxIDQgNCA3IDEgMTAgMyAxMiA4IDcgMyAyIFonLFxyXG4gICAgICAgIG5vbmU6J00gOSA1IEwgNSA1IDUgOSA5IDkgOSA1IFonLFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gY3VzdG9tIHRleHRcclxuXHJcbiAgICBzZXRUZXh0IDogZnVuY3Rpb24oIHNpemUsIGNvbG9yLCBmb250LCBzaGFkb3csIGNvbG9ycywgY3NzICl7XHJcblxyXG4gICAgICAgIHNpemUgPSBzaXplIHx8IDEzO1xyXG4gICAgICAgIGNvbG9yID0gY29sb3IgfHwgJyNDQ0MnO1xyXG4gICAgICAgIGZvbnQgPSBmb250IHx8ICdDb25zb2xhcyxtb25hY28sbW9ub3NwYWNlOyc7Ly8nTW9ub3NwYWNlJzsvLydcIkNvbnNvbGFzXCIsIFwiTHVjaWRhIENvbnNvbGVcIiwgTW9uYWNvLCBtb25vc3BhY2UnO1xyXG5cclxuICAgICAgICBjb2xvcnMgPSBjb2xvcnMgfHwgVC5jb2xvcnM7XHJcbiAgICAgICAgY3NzID0gY3NzIHx8IFQuY3NzO1xyXG5cclxuICAgICAgICBjb2xvcnMudGV4dCA9IGNvbG9yO1xyXG4gICAgICAgIGNzcy50eHQgPSBjc3MuYmFzaWMgKyAnZm9udC1mYW1pbHk6Jytmb250Kyc7IGZvbnQtc2l6ZTonK3NpemUrJ3B4OyBjb2xvcjonK2NvbG9yKyc7IHBhZGRpbmc6MnB4IDEwcHg7IGxlZnQ6MDsgdG9wOjJweDsgaGVpZ2h0OjE2cHg7IHdpZHRoOjEwMHB4OyBvdmVyZmxvdzpoaWRkZW47IHdoaXRlLXNwYWNlOiBub3dyYXA7JztcclxuICAgICAgICBpZiggc2hhZG93ICkgY3NzLnR4dCArPSAnIHRleHQtc2hhZG93OicrIHNoYWRvdyArICc7ICc7IC8vXCIxcHggMXB4IDFweCAjZmYwMDAwXCI7XHJcbiAgICAgICAgY3NzLnR4dHNlbGVjdCA9IGNzcy50eHQgKyAncGFkZGluZzoycHggNXB4OyBib3JkZXI6MXB4IGRhc2hlZCAnICsgY29sb3JzLmJvcmRlciArICc7IGJhY2tncm91bmQ6JysgY29sb3JzLnR4dHNlbGVjdGJnKyc7JztcclxuICAgICAgICBjc3MuaXRlbSA9IGNzcy50eHQgKyAncG9zaXRpb246cmVsYXRpdmU7IGJhY2tncm91bmQ6cmdiYSgwLDAsMCwwLjIpOyBtYXJnaW4tYm90dG9tOjFweDsnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG8uY2xvbmVOb2RlKCB0cnVlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRTdmc6IGZ1bmN0aW9uKCBkb20sIHR5cGUsIHZhbHVlLCBpZCApe1xyXG5cclxuICAgICAgICBpZiggaWQgPT09IC0xICkgZG9tLnNldEF0dHJpYnV0ZU5TKCBudWxsLCB0eXBlLCB2YWx1ZSApO1xyXG4gICAgICAgIGVsc2UgZG9tLmNoaWxkTm9kZXNbIGlkIHx8IDAgXS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENzczogZnVuY3Rpb24oIGRvbSwgY3NzICl7XHJcblxyXG4gICAgICAgIGZvciggdmFyIHIgaW4gY3NzICl7XHJcbiAgICAgICAgICAgIGlmKCBULkRPTV9TSVpFLmluZGV4T2YocikgIT09IC0xICkgZG9tLnN0eWxlW3JdID0gY3NzW3JdICsgJ3B4JztcclxuICAgICAgICAgICAgZWxzZSBkb20uc3R5bGVbcl0gPSBjc3Nbcl07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0OiBmdW5jdGlvbiggZywgbyApe1xyXG5cclxuICAgICAgICBmb3IoIHZhciBhdHQgaW4gbyApe1xyXG4gICAgICAgICAgICBpZiggYXR0ID09PSAndHh0JyApIGcudGV4dENvbnRlbnQgPSBvWyBhdHQgXTtcclxuICAgICAgICAgICAgZy5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgYXR0LCBvWyBhdHQgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0OiBmdW5jdGlvbiggZG9tLCBpZCApe1xyXG5cclxuICAgICAgICBpZiggaWQgPT09IHVuZGVmaW5lZCApIHJldHVybiBkb207IC8vIHJvb3RcclxuICAgICAgICBlbHNlIGlmKCAhaXNOYU4oIGlkICkgKSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkIF07IC8vIGZpcnN0IGNoaWxkXHJcbiAgICAgICAgZWxzZSBpZiggaWQgaW5zdGFuY2VvZiBBcnJheSApe1xyXG4gICAgICAgICAgICBpZihpZC5sZW5ndGggPT09IDIpIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWRbMF0gXS5jaGlsZE5vZGVzWyBpZFsxXSBdO1xyXG4gICAgICAgICAgICBpZihpZC5sZW5ndGggPT09IDMpIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWRbMF0gXS5jaGlsZE5vZGVzWyBpZFsxXSBdLmNoaWxkTm9kZXNbIGlkWzJdIF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZG9tIDogZnVuY3Rpb24gKCB0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCApIHtcclxuXHJcbiAgICAgICAgdHlwZSA9IHR5cGUgfHwgJ2Rpdic7XHJcblxyXG4gICAgICAgIGlmKCBULlNWR19UWVBFX0QuaW5kZXhPZih0eXBlKSAhPT0gLTEgfHwgVC5TVkdfVFlQRV9HLmluZGV4T2YodHlwZSkgIT09IC0xICl7IC8vIGlzIHN2ZyBlbGVtZW50XHJcblxyXG4gICAgICAgICAgICBpZiggdHlwZSA9PT0nc3ZnJyApe1xyXG5cclxuICAgICAgICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3N2ZycgKTtcclxuICAgICAgICAgICAgICAgIFQuc2V0KCBkb20sIG9iaiApO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgc3ZnIGlmIG5vdCBkZWZcclxuICAgICAgICAgICAgICAgIGlmKCBkb20gPT09IHVuZGVmaW5lZCApIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3N2ZycgKTtcclxuICAgICAgICAgICAgICAgIFQuYWRkQXR0cmlidXRlcyggZG9tLCB0eXBlLCBvYmosIGlkICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7IC8vIGlzIGh0bWwgZWxlbWVudFxyXG5cclxuICAgICAgICAgICAgaWYoIGRvbSA9PT0gdW5kZWZpbmVkICkgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULmh0bWxzLCB0eXBlICk7XHJcbiAgICAgICAgICAgIGVsc2UgZG9tID0gZG9tLmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuaHRtbHMsIHR5cGUgKSApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBjc3MgKSBkb20uc3R5bGUuY3NzVGV4dCA9IGNzczsgXHJcblxyXG4gICAgICAgIGlmKCBpZCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGRvbTtcclxuICAgICAgICBlbHNlIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWQgfHwgMCBdO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkQXR0cmlidXRlcyA6IGZ1bmN0aW9uKCBkb20sIHR5cGUsIG8sIGlkICl7XHJcblxyXG4gICAgICAgIHZhciBnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCB0eXBlICk7XHJcbiAgICAgICAgVC5zZXQoIGcsIG8gKTtcclxuICAgICAgICBULmdldCggZG9tLCBpZCApLmFwcGVuZENoaWxkKCBnICk7XHJcbiAgICAgICAgaWYoIFQuU1ZHX1RZUEVfRy5pbmRleE9mKHR5cGUpICE9PSAtMSApIGcuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICByZXR1cm4gZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyIDogZnVuY3Rpb24oIGRvbSApe1xyXG5cclxuICAgICAgICBULnB1cmdlKCBkb20gKTtcclxuICAgICAgICB3aGlsZSAoZG9tLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgaWYgKCBkb20uZmlyc3RDaGlsZC5maXJzdENoaWxkICkgVC5jbGVhciggZG9tLmZpcnN0Q2hpbGQgKTtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUNoaWxkKCBkb20uZmlyc3RDaGlsZCApOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwdXJnZSA6IGZ1bmN0aW9uICggZG9tICkge1xyXG5cclxuICAgICAgICB2YXIgYSA9IGRvbS5hdHRyaWJ1dGVzLCBpLCBuO1xyXG4gICAgICAgIGlmIChhKSB7XHJcbiAgICAgICAgICAgIGkgPSBhLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgICAgIG4gPSBhW2ldLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRvbVtuXSA9PT0gJ2Z1bmN0aW9uJykgZG9tW25dID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBhID0gZG9tLmNoaWxkTm9kZXM7XHJcbiAgICAgICAgaWYgKGEpIHtcclxuICAgICAgICAgICAgaSA9IGEubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICAgICAgICAgIFQucHVyZ2UoIGRvbS5jaGlsZE5vZGVzW2ldICk7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xhbXA6IGZ1bmN0aW9uICggdmFsdWUsIG1pbiwgbWF4ICkge1xyXG5cclxuICAgICAgICAvL3JldHVybiB2YWx1ZSA8PSBtaW4gPyBtaW4gOiB2YWx1ZSA+PSBtYXggPyBtYXggOiB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdmFsdWUgPCBtaW4gPyBtaW4gOiB2YWx1ZSA+IG1heCA/IG1heCA6IHZhbHVlO1xyXG4gICAgICAgIC8vcmV0dXJuIE1hdGgubWF4KCBtaW4sIE1hdGgubWluKCBtYXgsIHZhbHVlICkgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ29sb3IgZnVuY3Rpb25cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBDb2xvckx1bWEgOiBmdW5jdGlvbiAoIGhleCwgbCApIHtcclxuXHJcbiAgICAgICAgLy8gdmFsaWRhdGUgaGV4IHN0cmluZ1xyXG4gICAgICAgIGhleCA9IFN0cmluZyhoZXgpLnJlcGxhY2UoL1teMC05YS1mXS9naSwgJycpO1xyXG4gICAgICAgIGlmIChoZXgubGVuZ3RoIDwgNikge1xyXG4gICAgICAgICAgICBoZXggPSBoZXhbMF0raGV4WzBdK2hleFsxXStoZXhbMV0raGV4WzJdK2hleFsyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbCA9IGwgfHwgMDtcclxuXHJcbiAgICAgICAgLy8gY29udmVydCB0byBkZWNpbWFsIGFuZCBjaGFuZ2UgbHVtaW5vc2l0eVxyXG4gICAgICAgIHZhciByZ2IgPSBcIiNcIiwgYywgaTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICAgICAgICAgIGMgPSBwYXJzZUludChoZXguc3Vic3RyKGkqMiwyKSwgMTYpO1xyXG4gICAgICAgICAgICBjID0gTWF0aC5yb3VuZChNYXRoLm1pbihNYXRoLm1heCgwLCBjICsgKGMgKiBsKSksIDI1NSkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgcmdiICs9IChcIjAwXCIrYykuc3Vic3RyKGMubGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZ2I7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBmaW5kRGVlcEludmVyOiBmdW5jdGlvbiAoIGMgKSB7IFxyXG5cclxuICAgICAgICByZXR1cm4gKGNbMF0gKiAwLjMgKyBjWzFdICogLjU5ICsgY1syXSAqIC4xMSkgPD0gMC42O1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgaGV4VG9IdG1sOiBmdW5jdGlvbiAoIHYgKSB7IFxyXG4gICAgICAgIHYgPSB2ID09PSB1bmRlZmluZWQgPyAweDAwMDAwMCA6IHY7XHJcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgKFwiMDAwMDAwXCIgKyB2LnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgaHRtbFRvSGV4OiBmdW5jdGlvbiAoIHYgKSB7IFxyXG5cclxuICAgICAgICByZXR1cm4gdi50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoXCIjXCIsIFwiMHhcIik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1MjU1OiBmdW5jdGlvbiAoYywgaSkge1xyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoYy5zdWJzdHJpbmcoaSwgaSArIDIpLCAxNikgLyAyNTU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1MTY6IGZ1bmN0aW9uICggYywgaSApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGMuc3Vic3RyaW5nKGksIGkgKyAxKSwgMTYpIC8gMTU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1bnBhY2s6IGZ1bmN0aW9uKCBjICl7XHJcblxyXG4gICAgICAgIGlmIChjLmxlbmd0aCA9PSA3KSByZXR1cm4gWyBULnUyNTUoYywgMSksIFQudTI1NShjLCAzKSwgVC51MjU1KGMsIDUpIF07XHJcbiAgICAgICAgZWxzZSBpZiAoYy5sZW5ndGggPT0gNCkgcmV0dXJuIFsgVC51MTYoYywxKSwgVC51MTYoYywyKSwgVC51MTYoYywzKSBdO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaHRtbFJnYjogZnVuY3Rpb24oIGMgKXtcclxuXHJcbiAgICAgICAgcmV0dXJuICdyZ2IoJyArIE1hdGgucm91bmQoY1swXSAqIDI1NSkgKyAnLCcrIE1hdGgucm91bmQoY1sxXSAqIDI1NSkgKyAnLCcrIE1hdGgucm91bmQoY1syXSAqIDI1NSkgKyAnKSc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZ2JUb0hleCA6IGZ1bmN0aW9uKCBjICl7XHJcblxyXG4gICAgICAgIHJldHVybiAnIycgKyAoICcwMDAwMDAnICsgKCAoIGNbMF0gKiAyNTUgKSA8PCAxNiBeICggY1sxXSAqIDI1NSApIDw8IDggXiAoIGNbMl0gKiAyNTUgKSA8PCAwICkudG9TdHJpbmcoIDE2ICkgKS5zbGljZSggLSA2ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBodWVUb1JnYjogZnVuY3Rpb24oIHAsIHEsIHQgKXtcclxuXHJcbiAgICAgICAgaWYgKCB0IDwgMCApIHQgKz0gMTtcclxuICAgICAgICBpZiAoIHQgPiAxICkgdCAtPSAxO1xyXG4gICAgICAgIGlmICggdCA8IDEgLyA2ICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogdDtcclxuICAgICAgICBpZiAoIHQgPCAxIC8gMiApIHJldHVybiBxO1xyXG4gICAgICAgIGlmICggdCA8IDIgLyAzICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogKCAyIC8gMyAtIHQgKTtcclxuICAgICAgICByZXR1cm4gcDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJnYlRvSHNsOiBmdW5jdGlvbiAoIGMgKSB7XHJcblxyXG4gICAgICAgIHZhciByID0gY1swXSwgZyA9IGNbMV0sIGIgPSBjWzJdLCBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSwgbWF4ID0gTWF0aC5tYXgociwgZywgYiksIGRlbHRhID0gbWF4IC0gbWluLCBoID0gMCwgcyA9IDAsIGwgPSAobWluICsgbWF4KSAvIDI7XHJcbiAgICAgICAgaWYgKGwgPiAwICYmIGwgPCAxKSBzID0gZGVsdGEgLyAobCA8IDAuNSA/ICgyICogbCkgOiAoMiAtIDIgKiBsKSk7XHJcbiAgICAgICAgaWYgKGRlbHRhID4gMCkge1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IHIgJiYgbWF4ICE9IGcpIGggKz0gKGcgLSBiKSAvIGRlbHRhO1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IGcgJiYgbWF4ICE9IGIpIGggKz0gKDIgKyAoYiAtIHIpIC8gZGVsdGEpO1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IGIgJiYgbWF4ICE9IHIpIGggKz0gKDQgKyAociAtIGcpIC8gZGVsdGEpO1xyXG4gICAgICAgICAgICBoIC89IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbIGgsIHMsIGwgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGhzbFRvUmdiOiBmdW5jdGlvbiAoIGMgKSB7XHJcblxyXG4gICAgICAgIHZhciBwLCBxLCBoID0gY1swXSwgcyA9IGNbMV0sIGwgPSBjWzJdO1xyXG5cclxuICAgICAgICBpZiAoIHMgPT09IDAgKSByZXR1cm4gWyBsLCBsLCBsIF07XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHEgPSBsIDw9IDAuNSA/IGwgKiAocyArIDEpIDogbCArIHMgLSAoIGwgKiBzICk7XHJcbiAgICAgICAgICAgIHAgPSBsICogMiAtIHE7XHJcbiAgICAgICAgICAgIHJldHVybiBbIFQuaHVlVG9SZ2IocCwgcSwgaCArIDAuMzMzMzMpLCBULmh1ZVRvUmdiKHAsIHEsIGgpLCBULmh1ZVRvUmdiKHAsIHEsIGggLSAwLjMzMzMzKSBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU1ZHIE1PREVMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbWFrZUdyYWRpYW50OiBmdW5jdGlvbiAoIHR5cGUsIHNldHRpbmdzLCBwYXJlbnQsIGNvbG9ycyApIHtcclxuXHJcbiAgICAgICAgVC5kb20oIHR5cGUsIG51bGwsIHNldHRpbmdzLCBwYXJlbnQsIDAgKTtcclxuXHJcbiAgICAgICAgdmFyIG4gPSBwYXJlbnQuY2hpbGROb2Rlc1swXS5jaGlsZE5vZGVzLmxlbmd0aCAtIDEsIGM7XHJcblxyXG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgY29sb3JzLmxlbmd0aDsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBjID0gY29sb3JzW2ldO1xyXG4gICAgICAgICAgICBULmRvbSggJ3N0b3AnLCBudWxsLCB7IG9mZnNldDpjWzBdKyclJywgc3R5bGU6J3N0b3AtY29sb3I6JytjWzFdKyc7IHN0b3Atb3BhY2l0eTonK2NbMl0rJzsnIH0sIHBhcmVudCwgWzAsbl0gKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyptYWtlR3JhcGg6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIHcgPSAxMjg7XHJcbiAgICAgICAgdmFyIHJhZGl1cyA9IDM0O1xyXG4gICAgICAgIHZhciBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo0LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgLy9ULmRvbSggJ3JlY3QnLCAnJywgeyB4OjEwLCB5OjEwLCB3aWR0aDoxMDgsIGhlaWdodDoxMDgsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6VC5jb2xvcnMuYnV0dG9uLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjggfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMrNywgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo3ICwgZmlsbDonbm9uZSd9LCBzdmcgKTsvLzJcclxuICAgICAgICAvL1QuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZToncmdiYSgyNTUsMjU1LDI1NSwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J3JvdW5kJywgJ3N0cm9rZS1vcGFjaXR5JzowLjUgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgVC5ncmFwaCA9IHN2ZztcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgbWFrZUtub2I6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIHZhciB3ID0gMTI4O1xyXG4gICAgICAgIHZhciByYWRpdXMgPSAzNDtcclxuICAgICAgICB2YXIgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6VC5jb2xvcnMuYnV0dG9uLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjggfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOlQuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOjQsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcgfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzKzcsIHN0cm9rZToncmdiYSgwLDAsMCwwLjEpJywgJ3N0cm9rZS13aWR0aCc6NyAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOidyZ2JhKDI1NSwyNTUsMjU1LDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoyLCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzoncm91bmQnLCAnc3Ryb2tlLW9wYWNpdHknOjAuNSB9LCBzdmcgKTsvLzNcclxuICAgICAgICBULmtub2IgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlQ2lyY3VsYXI6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIHZhciB3ID0gMTI4O1xyXG4gICAgICAgIHZhciByYWRpdXMgPSA0MDtcclxuICAgICAgICB2YXIgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIHN0cm9rZToncmdiYSgwLDAsMCwwLjEpJywgJ3N0cm9rZS13aWR0aCc6MTAsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo3LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgVC5jaXJjdWxhciA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VKb3lzdGljazogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgLy8rJyBiYWNrZ3JvdW5kOiNmMDA7J1xyXG5cclxuICAgICAgICB2YXIgdyA9IDEyODtcclxuICAgICAgICB2YXIgcmFkaXVzID0gTWF0aC5mbG9vcigody0zMCkqMC41KTtcclxuICAgICAgICB2YXIgaW5uZXJSYWRpdXMgPSBNYXRoLmZsb29yKHJhZGl1cyowLjYpO1xyXG4gICAgICAgIHZhciBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAnZGVmcycsIG51bGwsIHt9LCBzdmcgKTtcclxuICAgICAgICBULmRvbSggJ2cnLCBudWxsLCB7fSwgc3ZnICk7XHJcblxyXG4gICAgICAgIGlmKCBtb2RlbCA9PT0gMCApe1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYWRpYW4gYmFja2dyb3VuZFxyXG4gICAgICAgICAgICB2YXIgY2NjID0gWyBbNDAsICdyZ2IoMCwwLDApJywgMC4zXSwgWzgwLCAncmdiKDAsMCwwKScsIDBdLCBbOTAsICdyZ2IoNTAsNTAsNTApJywgMC40XSwgWzEwMCwgJ3JnYig1MCw1MCw1MCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZCcsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIHNoYWRvd1xyXG4gICAgICAgICAgICBjY2MgPSBbIFs2MCwgJ3JnYigwLDAsMCknLCAwLjVdLCBbMTAwLCAncmdiKDAsMCwwKScsIDBdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkUycsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIHN0aWNrXHJcbiAgICAgICAgICAgIHZhciBjYzAgPSBbJ3JnYig0MCw0MCw0MCknLCAncmdiKDQ4LDQ4LDQ4KScsICdyZ2IoMzAsMzAsMzApJ107XHJcbiAgICAgICAgICAgIHZhciBjYzEgPSBbJ3JnYigxLDkwLDE5NyknLCAncmdiKDMsOTUsMjA3KScsICdyZ2IoMCw2NSwxNjcpJ107XHJcblxyXG4gICAgICAgICAgICBjY2MgPSBbIFszMCwgY2MwWzBdLCAxXSwgWzYwLCBjYzBbMV0sIDFdLCBbODAsIGNjMFsxXSwgMV0sIFsxMDAsIGNjMFsyXSwgMV0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRJbicsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICBjY2MgPSBbIFszMCwgY2MxWzBdLCAxXSwgWzYwLCBjYzFbMV0sIDFdLCBbODAsIGNjMVsxXSwgMV0sIFsxMDAsIGNjMVsyXSwgMV0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRJbjInLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhcGhcclxuXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDondXJsKCNncmFkKScgfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQrNSwgY3k6NjQrMTAsIHI6aW5uZXJSYWRpdXMrMTAsIGZpbGw6J3VybCgjZ3JhZFMpJyB9LCBzdmcgKTsvLzNcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMsIGZpbGw6J3VybCgjZ3JhZEluKScgfSwgc3ZnICk7Ly80XHJcblxyXG4gICAgICAgICAgICBULmpveXN0aWNrXzAgPSBzdmc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAvLyBncmFkaWFuIHNoYWRvd1xyXG4gICAgICAgICAgICBjY2MgPSBbIFs2OSwgJ3JnYigwLDAsMCknLCAwXSxbNzAsICdyZ2IoMCwwLDApJywgMC4zXSwgWzEwMCwgJ3JnYigwLDAsMCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZFgnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOidub25lJywgc3Ryb2tlOidyZ2JhKDEwMCwxMDAsMTAwLDAuMjUpJywgJ3N0cm9rZS13aWR0aCc6JzQnIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjppbm5lclJhZGl1cysxNCwgZmlsbDondXJsKCNncmFkWCknIH0sIHN2ZyApOy8vM1xyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjppbm5lclJhZGl1cywgZmlsbDonbm9uZScsIHN0cm9rZToncmdiKDEwMCwxMDAsMTAwKScsICdzdHJva2Utd2lkdGgnOic0JyB9LCBzdmcgKTsvLzRcclxuXHJcbiAgICAgICAgICAgIFQuam95c3RpY2tfMSA9IHN2ZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbWFrZUNvbG9yUmluZzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgdyA9IDI1NjtcclxuICAgICAgICB2YXIgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2RlZnMnLCBudWxsLCB7fSwgc3ZnICk7XHJcbiAgICAgICAgVC5kb20oICdnJywgbnVsbCwge30sIHN2ZyApO1xyXG5cclxuICAgICAgICB2YXIgcyA9IDQwOy8vc3Ryb2tlXHJcbiAgICAgICAgdmFyIHIgPSggdy1zICkqMC41O1xyXG4gICAgICAgIHZhciBtaWQgPSB3KjAuNTtcclxuICAgICAgICB2YXIgbiA9IDI0LCBudWRnZSA9IDggLyByIC8gbiAqIE1hdGguUEksIGExID0gMCwgZDE7XHJcbiAgICAgICAgdmFyIGFtLCB0YW4sIGQyLCBhMiwgYXIsIGksIGosIHBhdGgsIGNjYztcclxuICAgICAgICB2YXIgY29sb3IgPSBbXTtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKCBpID0gMDsgaSA8PSBuOyArK2kpIHtcclxuXHJcbiAgICAgICAgICAgIGQyID0gaSAvIG47XHJcbiAgICAgICAgICAgIGEyID0gZDIgKiBULlR3b1BJO1xyXG4gICAgICAgICAgICBhbSA9IChhMSArIGEyKSAqIDAuNTtcclxuICAgICAgICAgICAgdGFuID0gMSAvIE1hdGguY29zKChhMiAtIGExKSAqIDAuNSk7XHJcblxyXG4gICAgICAgICAgICBhciA9IFtcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGExKSwgLU1hdGguY29zKGExKSwgXHJcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihhbSkgKiB0YW4sIC1NYXRoLmNvcyhhbSkgKiB0YW4sIFxyXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oYTIpLCAtTWF0aC5jb3MoYTIpXHJcbiAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBjb2xvclsxXSA9IFQucmdiVG9IZXgoIFQuaHNsVG9SZ2IoW2QyLCAxLCAwLjVdKSApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaiA9IDY7XHJcbiAgICAgICAgICAgICAgICB3aGlsZShqLS0pe1xyXG4gICAgICAgICAgICAgICAgICAgYXJbal0gPSAoKGFyW2pdKnIpK21pZCkudG9GaXhlZCgyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBwYXRoID0gJyBNJyArIGFyWzBdICsgJyAnICsgYXJbMV0gKyAnIFEnICsgYXJbMl0gKyAnICcgKyBhclszXSArICcgJyArIGFyWzRdICsgJyAnICsgYXJbNV07XHJcblxyXG4gICAgICAgICAgICAgICAgY2NjID0gWyBbMCxjb2xvclswXSwxXSwgWzEwMCxjb2xvclsxXSwxXSBdO1xyXG4gICAgICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdsaW5lYXJHcmFkaWVudCcsIHsgaWQ6J0cnK2ksIHgxOmFyWzBdLCB5MTphclsxXSwgeDI6YXJbNF0sIHkyOmFyWzVdLCBncmFkaWVudFVuaXRzOlwidXNlclNwYWNlT25Vc2VcIiB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6cGF0aCwgJ3N0cm9rZS13aWR0aCc6cywgc3Ryb2tlOid1cmwoI0cnK2krJyknLCAnc3Ryb2tlLWxpbmVjYXAnOlwiYnV0dFwiIH0sIHN2ZywgMSApO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYTEgPSBhMiAtIG51ZGdlOyBcclxuICAgICAgICAgICAgY29sb3JbMF0gPSBjb2xvclsxXTtcclxuICAgICAgICAgICAgZDEgPSBkMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBiciA9ICgxMjggLSBzICkgKyAyO1xyXG4gICAgICAgIHZhciBidyA9IDYwO1xyXG5cclxuICAgICAgICAvLyBibGFjayAvIHdoaXRlXHJcbiAgICAgICAgY2NjID0gWyBbMCwgJyNGRkZGRkYnLCAxXSwgWzUwLCAnI0ZGRkZGRicsIDBdLCBbNTAsICcjMDAwMDAwJywgMF0sIFsxMDAsICcjMDAwMDAwJywgMV0gXTtcclxuICAgICAgICBULm1ha2VHcmFkaWFudCggJ2xpbmVhckdyYWRpZW50JywgeyBpZDonR0wxJywgeDE6bWlkLWJ3LCB5MTptaWQtYncsIHgyOm1pZC1idywgeTI6bWlkK2J3LCBncmFkaWVudFVuaXRzOlwidXNlclNwYWNlT25Vc2VcIiB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAvLyBzYXR1cmF0aW9uXHJcbiAgICAgICAgY2NjID0gWyBbMCwgJyM3ZjdmN2YnLCAwXSwgWzUwLCAnIzdmN2Y3ZicsIDAuNV0sIFsxMDAsICcjN2Y3ZjdmJywgMV0gXTtcclxuICAgICAgICBULm1ha2VHcmFkaWFudCggJ2xpbmVhckdyYWRpZW50JywgeyBpZDonR0wyJywgeDE6bWlkLWJ3LCB5MTptaWQtYncsIHgyOm1pZCtidywgeTI6bWlkLWJ3LCBncmFkaWVudFVuaXRzOlwidXNlclNwYWNlT25Vc2VcIiB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjEyOCwgY3k6MTI4LCByOmJyLCBmaWxsOidyZWQnIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MTI4LCBjeToxMjgsIHI6YnIsIGZpbGw6J3VybCgjR0wyKScgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDoxMjgsIGN5OjEyOCwgcjpiciwgZmlsbDondXJsKCNHTDEpJyB9LCBzdmcgKTsvLzRcclxuXHJcbiAgICAgICAgLy9ULmRvbSggJ3BvbHlnb24nLCAnJywgeyBwb2ludHM6JzEyOCwwIDI1NiwxOTAgMCwyMTAnLCByOmJyLCBmaWxsOid1cmwoI0dMMSknIH0sIHN2ZyApOy8vNFxyXG5cclxuICAgICAgICAvL1QuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MCwgY3k6MCwgcjo2LCAnc3Ryb2tlLXdpZHRoJzozLCBzdHJva2U6JyNGRkYnLCBmaWxsOidub25lJyB9LCBzdmcgKTsvLzVcclxuICAgICAgICAvL1QuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MCwgY3k6MCwgcjo2LCAnc3Ryb2tlLXdpZHRoJzozLCBzdHJva2U6JyMwMDAnLCBmaWxsOidub25lJyB9LCBzdmcgKTsvLzZcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjAsIGN5OjAsIHI6OCwgJ3N0cm9rZS13aWR0aCc6NCwgc3Ryb2tlOicjRkZGJywgZmlsbDonbm9uZScgfSwgc3ZnICk7Ly81XHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDowLCBjeTowLCByOjgsICdzdHJva2Utd2lkdGgnOjQsIHN0cm9rZTonIzAwMCcsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vNlxyXG5cclxuXHJcbiAgICAgICAgVC5jb2xvclJpbmcgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpY29uOiBmdW5jdGlvbiAoIHR5cGUsIGNvbG9yLCB3ICl7XHJcblxyXG4gICAgICAgIHcgPSB3IHx8IDQwO1xyXG4gICAgICAgIGNvbG9yID0gY29sb3IgfHwgJyNERURFREUnO1xyXG4gICAgICAgIHZhciB2aWV3Qm94ID0gJzAgMCAyNTYgMjU2JztcclxuICAgICAgICB2YXIgdCA9IFtcIjxzdmcgeG1sbnM9J1wiK1Quc3ZnbnMrXCInIHZlcnNpb249JzEuMScgeG1sbnM6eGxpbms9J1wiK1QuaHRtbHMrXCInIHN0eWxlPSdwb2ludGVyLWV2ZW50czpub25lOycgcHJlc2VydmVBc3BlY3RSYXRpbz0neE1pbllNYXggbWVldCcgeD0nMHB4JyB5PScwcHgnIHdpZHRoPSdcIit3K1wicHgnIGhlaWdodD0nXCIrdytcInB4JyB2aWV3Qm94PSdcIit2aWV3Qm94K1wiJz48Zz5cIl07XHJcbiAgICAgICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgICAgICBjYXNlICdsb2dvJzpcclxuICAgICAgICAgICAgLy90WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgc3Ryb2tlPSdcIitjb2xvcitcIicgc3Ryb2tlLXdpZHRoPScxNicgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J3NxdWFyZScgZmlsbD0nbm9uZScgZD0nTSAxOTIgNDQgTCAxOTIgMTQ4IFEgMTkyIDE3NC41IDE3My4zIDE5My4yNSAxNTQuNTUgMjEyIDEyOCAyMTIgMTAxLjUgMjEyIDgyLjc1IDE5My4yNSA2NCAxNzQuNSA2NCAxNDggTCA2NCA0NCBNIDE2MCA0NCBMIDE2MCAxNDggUSAxNjAgMTYxLjI1IDE1MC42NSAxNzAuNjUgMTQxLjI1IDE4MCAxMjggMTgwIDExNC43NSAxODAgMTA1LjM1IDE3MC42NSA5NiAxNjEuMjUgOTYgMTQ4IEwgOTYgNDQnLz5cIjtcclxuICAgICAgICAgICAgdFsxXT1cIjxwYXRoIGlkPSdsb2dvaW4nIGZpbGw9J1wiK2NvbG9yK1wiJyBzdHJva2U9J25vbmUnIGQ9J1wiK1QubG9nb0ZpbGxfZCtcIicvPlwiO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggc3Ryb2tlPSdcIitjb2xvcitcIicgc3Ryb2tlLXdpZHRoPSc0JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIGZpbGw9J25vbmUnIGQ9J00gMjYuMTI1IDE3IEwgMjAgMjIuOTUgMTQuMDUgMTcgTSAyMCA5Ljk1IEwgMjAgMjIuOTUnLz48cGF0aCBzdHJva2U9J1wiK2NvbG9yK1wiJyBzdHJva2Utd2lkdGg9JzIuNScgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBmaWxsPSdub25lJyBkPSdNIDMyLjYgMjMgTCAzMi42IDI1LjUgUSAzMi42IDI4LjUgMjkuNiAyOC41IEwgMTAuNiAyOC41IFEgNy42IDI4LjUgNy42IDI1LjUgTCA3LjYgMjMnLz5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRbMl0gPSBcIjwvZz48L3N2Zz5cIjtcclxuICAgICAgICByZXR1cm4gdC5qb2luKFwiXFxuXCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbG9nb0ZpbGxfZDogW1xyXG4gICAgXCJNIDE3MSAxNTAuNzUgTCAxNzEgMzMuMjUgMTU1LjUgMzMuMjUgMTU1LjUgMTUwLjc1IFEgMTU1LjUgMTYyLjIgMTQ3LjQ1IDE3MC4yIDEzOS40NSAxNzguMjUgMTI4IDE3OC4yNSAxMTYuNiAxNzguMjUgMTA4LjU1IDE3MC4yIDEwMC41IDE2Mi4yIDEwMC41IDE1MC43NSBcIixcclxuICAgIFwiTCAxMDAuNSAzMy4yNSA4NSAzMy4yNSA4NSAxNTAuNzUgUSA4NSAxNjguNjUgOTcuNTUgMTgxLjE1IDExMC4xNSAxOTMuNzUgMTI4IDE5My43NSAxNDUuOSAxOTMuNzUgMTU4LjQgMTgxLjE1IDE3MSAxNjguNjUgMTcxIDE1MC43NSBcIixcclxuICAgIFwiTSAyMDAgMzMuMjUgTCAxODQgMzMuMjUgMTg0IDE1MC44IFEgMTg0IDE3NC4xIDE2Ny42IDE5MC40IDE1MS4zIDIwNi44IDEyOCAyMDYuOCAxMDQuNzUgMjA2LjggODguMyAxOTAuNCA3MiAxNzQuMSA3MiAxNTAuOCBMIDcyIDMzLjI1IDU2IDMzLjI1IDU2IDE1MC43NSBcIixcclxuICAgIFwiUSA1NiAxODAuNTUgNzcuMDUgMjAxLjYgOTguMiAyMjIuNzUgMTI4IDIyMi43NSAxNTcuOCAyMjIuNzUgMTc4LjkgMjAxLjYgMjAwIDE4MC41NSAyMDAgMTUwLjc1IEwgMjAwIDMzLjI1IFpcIixcclxuICAgIF0uam9pbignXFxuJyksXHJcblxyXG59XHJcblxyXG5ULnNldFRleHQoKTtcclxuXHJcbnZhciBUb29scyA9IFQ7XHJcbmV4cG9ydCB7IFRvb2xzIH07IiwiXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbi8vIElOVEVOQUwgRlVOQ1RJT05cclxuXHJcbnZhciBSID0ge1xyXG5cclxuXHR1aTogW10sXHJcblxyXG5cdElEOiBudWxsLFxyXG4gICAgbG9jazpmYWxzZSxcclxuICAgIHdsb2NrOmZhbHNlLFxyXG4gICAgY3VycmVudDotMSxcclxuXHJcblx0bmVlZFJlWm9uZTogdHJ1ZSxcclxuXHRpc0V2ZW50c0luaXQ6IGZhbHNlLFxyXG5cclxuICAgIHByZXZEZWZhdWx0OiBbJ2NvbnRleHRtZW51JywgJ21vdXNlZG93bicsICdtb3VzZW1vdmUnLCAnbW91c2V1cCddLFxyXG5cclxuXHR4bWxzZXJpYWxpemVyOiBuZXcgWE1MU2VyaWFsaXplcigpLFxyXG5cdHRtcFRpbWU6IG51bGwsXHJcbiAgICB0bXBJbWFnZTogbnVsbCxcclxuXHJcbiAgICBvbGRDdXJzb3I6J2F1dG8nLFxyXG5cclxuICAgIGlucHV0OiBudWxsLFxyXG4gICAgcGFyZW50OiBudWxsLFxyXG4gICAgZmlyc3RJbXB1dDogdHJ1ZSxcclxuICAgIC8vY2FsbGJhY2tJbXB1dDogbnVsbCxcclxuICAgIGhpZGRlbkltcHV0Om51bGwsXHJcbiAgICBoaWRkZW5TaXplcjpudWxsLFxyXG4gICAgaGFzRm9jdXM6ZmFsc2UsXHJcbiAgICBzdGFydElucHV0OmZhbHNlLFxyXG4gICAgaW5wdXRSYW5nZSA6IFswLDBdLFxyXG4gICAgY3Vyc29ySWQgOiAwLFxyXG4gICAgc3RyOicnLFxyXG4gICAgcG9zOjAsXHJcbiAgICBzdGFydFg6LTEsXHJcbiAgICBtb3ZlWDotMSxcclxuXHJcbiAgICBkZWJ1Z0lucHV0OmZhbHNlLFxyXG5cclxuICAgIGlzTG9vcDogZmFsc2UsXHJcbiAgICBsaXN0ZW5zOiBbXSxcclxuXHJcbiAgICBlOntcclxuICAgICAgICB0eXBlOm51bGwsXHJcbiAgICAgICAgY2xpZW50WDowLFxyXG4gICAgICAgIGNsaWVudFk6MCxcclxuICAgICAgICBrZXlDb2RlOk5hTixcclxuICAgICAgICBrZXk6bnVsbCxcclxuICAgICAgICBkZWx0YTowLFxyXG4gICAgfSxcclxuXHJcbiAgICBpc01vYmlsZTogZmFsc2UsXHJcblxyXG4gICAgXHJcblxyXG5cdGFkZDogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICBSLnVpLnB1c2goIG8gKTtcclxuICAgICAgICBSLmdldFpvbmUoIG8gKTtcclxuXHJcbiAgICAgICAgaWYoICFSLmlzRXZlbnRzSW5pdCApIFIuaW5pdEV2ZW50cygpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdGVzdE1vYmlsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgbiA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XHJcbiAgICAgICAgaWYgKG4ubWF0Y2goL0FuZHJvaWQvaSkgfHwgbi5tYXRjaCgvd2ViT1MvaSkgfHwgbi5tYXRjaCgvaVBob25lL2kpIHx8IG4ubWF0Y2goL2lQYWQvaSkgfHwgbi5tYXRjaCgvaVBvZC9pKSB8fCBuLm1hdGNoKC9CbGFja0JlcnJ5L2kpIHx8IG4ubWF0Y2goL1dpbmRvd3MgUGhvbmUvaSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIGZhbHNlOyAgXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmU6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgdmFyIGkgPSBSLnVpLmluZGV4T2YoIG8gKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoIGkgIT09IC0xICkge1xyXG4gICAgICAgICAgICBSLnJlbW92ZUxpc3RlbiggbyApO1xyXG4gICAgICAgICAgICBSLnVpLnNwbGljZSggaSwgMSApOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBSLnVpLmxlbmd0aCA9PT0gMCApe1xyXG4gICAgICAgICAgICBSLnJlbW92ZUV2ZW50cygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaW5pdEV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggUi5pc0V2ZW50c0luaXQgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBkb21FbGVtZW50ID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgICAgICAgUi5pc01vYmlsZSA9IFIudGVzdE1vYmlsZSgpO1xyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSApe1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3doZWVsJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgUiwgZmFsc2UgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBSLnJlc2l6ZSAsIGZhbHNlICk7XHJcbiAgICAgICAgLy93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIFIsIGZhbHNlICk7XHJcblxyXG4gICAgICAgIFIuaXNFdmVudHNJbml0ID0gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZUV2ZW50czogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIVIuaXNFdmVudHNJbml0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgZG9tRWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICl7XHJcbiAgICAgICAgICAgIGRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnd2hlZWwnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgUiApO1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5dXAnLCBSICk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBSLnJlc2l6ZSAgKTtcclxuXHJcbiAgICAgICAgUi5pc0V2ZW50c0luaXQgPSBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBSLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG5cclxuICAgICAgICB2YXIgaSA9IFIudWkubGVuZ3RoLCB1O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuXHJcbiAgICAgICAgICAgIHUgPSBSLnVpW2ldO1xyXG4gICAgICAgICAgICBpZiggdS5pc0d1aSAmJiAhdS5pc0NhbnZhc09ubHkgJiYgdS5hdXRvUmVzaXplICkgdS5zZXRIZWlnaHQoKTtcclxuICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEhBTkRMRSBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIFxyXG5cclxuICAgIGhhbmRsZUV2ZW50OiBmdW5jdGlvbiAoIGV2ZW50ICkge1xyXG5cclxuICAgICAgICAvL2lmKCFldmVudC50eXBlKSByZXR1cm47XHJcblxyXG4gICAgICAvLyAgY29uc29sZS5sb2coIGV2ZW50LnR5cGUgKVxyXG5cclxuICAgICAgICBpZiggZXZlbnQudHlwZS5pbmRleE9mKCBSLnByZXZEZWZhdWx0ICkgIT09IC0xICkgZXZlbnQucHJldmVudERlZmF1bHQoKTsgXHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAnY29udGV4dG1lbnUnICkgcmV0dXJuOyBcclxuXHJcbiAgICAgICAgLy9pZiggZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nKXsgUi5lZGl0VGV4dCggZXZlbnQgKTsgcmV0dXJuO31cclxuXHJcbiAgICAgICAgLy9pZiggZXZlbnQudHlwZSAhPT0gJ2tleWRvd24nICYmIGV2ZW50LnR5cGUgIT09ICd3aGVlbCcgKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIC8vZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIFIuZmluZFpvbmUoKTtcclxuICAgICAgIFxyXG4gICAgICAgIHZhciBlID0gUi5lO1xyXG5cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nKSBSLmtleWRvd24oIGV2ZW50ICk7XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdrZXl1cCcpIFIua2V5dXAoIGV2ZW50ICk7XHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAnd2hlZWwnICkgZS5kZWx0YSA9IGV2ZW50LmRlbHRhWSA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgZWxzZSBlLmRlbHRhID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBlLmNsaWVudFggPSBldmVudC5jbGllbnRYIHx8IDA7XHJcbiAgICAgICAgZS5jbGllbnRZID0gZXZlbnQuY2xpZW50WSB8fCAwO1xyXG4gICAgICAgIGUudHlwZSA9IGV2ZW50LnR5cGU7XHJcblxyXG4gICAgICAgIC8vIG1vYmlsZVxyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPiAwICl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFggPSBldmVudC50b3VjaGVzWyAwIF0uY2xpZW50WCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRZID0gZXZlbnQudG91Y2hlc1sgMCBdLmNsaWVudFkgfHwgMDtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIGUudHlwZSA9ICdtb3VzZWRvd24nO1xyXG4gICAgICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNoZW5kJykgZS50eXBlID0gJ21vdXNldXAnXHJcbiAgICAgICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2htb3ZlJykgZS50eXBlID0gJ21vdXNlbW92ZSc7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvKlxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpeyBlLnR5cGUgPSAnbW91c2Vkb3duJzsgUi5maW5kSUQoIGUgKTsgfVxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hlbmQnKXsgZS50eXBlID0gJ21vdXNldXAnOyAgaWYoIFIuSUQgIT09IG51bGwgKSBSLklELmhhbmRsZUV2ZW50KCBlICk7IFIuY2xlYXJPbGRJRCgpOyB9XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKXsgZS50eXBlID0gJ21vdXNlbW92ZSc7ICB9XHJcbiAgICAgICAgKi9cclxuXHJcblxyXG4gICAgICAgIGlmKCBlLnR5cGUgPT09ICdtb3VzZWRvd24nICkgUi5sb2NrID0gdHJ1ZTtcclxuICAgICAgICBpZiggZS50eXBlID09PSAnbW91c2V1cCcgKSBSLmxvY2sgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNNb2JpbGUgJiYgZS50eXBlID09PSAnbW91c2Vkb3duJyApIFIuZmluZElEKCBlICk7XHJcbiAgICAgICAgaWYoIGUudHlwZSA9PT0gJ21vdXNlbW92ZScgJiYgIVIubG9jayApIFIuZmluZElEKCBlICk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCBSLklEICE9PSBudWxsICl7XHJcblxyXG4gICAgICAgICAgICBpZiggUi5JRC5pc0NhbnZhc09ubHkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRYID0gUi5JRC5tb3VzZS54O1xyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRZID0gUi5JRC5tb3VzZS55O1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgUi5JRC5oYW5kbGVFdmVudCggZSApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICYmIGUudHlwZSA9PT0gJ21vdXNldXAnICkgUi5jbGVhck9sZElEKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElEXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZmluZElEOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBpID0gUi51aS5sZW5ndGgsIG5leHQgPSAtMSwgdSwgeCwgeTtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cclxuICAgICAgICAgICAgdSA9IFIudWlbaV07XHJcblxyXG4gICAgICAgICAgICBpZiggdS5pc0NhbnZhc09ubHkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgeCA9IHUubW91c2UueDtcclxuICAgICAgICAgICAgICAgIHkgPSB1Lm1vdXNlLnk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHggPSBlLmNsaWVudFg7XHJcbiAgICAgICAgICAgICAgICB5ID0gZS5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIFIub25ab25lKCB1LCB4LCB5ICkgKXsgXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5leHQgPSBpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiggbmV4dCAhPT0gUi5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5jbGVhck9sZElEKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5jdXJyZW50ID0gbmV4dDtcclxuICAgICAgICAgICAgICAgICAgICBSLklEID0gdTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ID09PSAtMSApIFIuY2xlYXJPbGRJRCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJPbGRJRDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIVIuSUQgKSByZXR1cm47XHJcbiAgICAgICAgUi5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgUi5JRC5yZXNldCgpO1xyXG4gICAgICAgIFIuSUQgPSBudWxsO1xyXG4gICAgICAgIFIuY3Vyc29yKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEdVSSAvIEdST1VQIEZVTkNUSU9OXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2FsY1VpczogZnVuY3Rpb24gKCB1aXMsIHpvbmUsIHB5ICkge1xyXG5cclxuICAgICAgICB2YXIgbG5nID0gdWlzLmxlbmd0aCwgdSwgaSwgcHggPSAwLCBteSA9IDA7XHJcblxyXG4gICAgICAgIGZvciggaSA9IDA7IGkgPCBsbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdSA9IHVpc1tpXTtcclxuXHJcbiAgICAgICAgICAgIHUuem9uZS53ID0gdS53O1xyXG4gICAgICAgICAgICB1LnpvbmUuaCA9IHUuaDtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhdS5hdXRvV2lkdGggKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggcHggPT09IDAgKSBweSArPSB1LmggKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHUuem9uZS54ID0gem9uZS54ICsgcHg7XHJcbiAgICAgICAgICAgICAgICB1LnpvbmUueSA9IHB4ID09PSAwID8gcHkgLSB1LmggOiBteTtcclxuXHJcbiAgICAgICAgICAgICAgICBteSA9IHUuem9uZS55O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBweCArPSB1Lnc7XHJcbiAgICAgICAgICAgICAgICBpZiggcHggKyB1LncgPiB6b25lLncgKSBweCA9IDA7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHUuem9uZS54ID0gem9uZS54O1xyXG4gICAgICAgICAgICAgICAgdS56b25lLnkgPSBweTtcclxuICAgICAgICAgICAgICAgIHB5ICs9IHUuaCArIDE7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggdS5pc0dyb3VwICkgdS5jYWxjVWlzKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuXHJcblx0ZmluZFRhcmdldDogZnVuY3Rpb24gKCB1aXMsIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBpID0gdWlzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggUi5vblpvbmUoIHVpc1tpXSwgZS5jbGllbnRYLCBlLmNsaWVudFkgKSApIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBaT05FXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZmluZFpvbmU6IGZ1bmN0aW9uICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhUi5uZWVkUmVab25lICYmICFmb3JjZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGkgPSBSLnVpLmxlbmd0aCwgdTtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApeyBcclxuXHJcbiAgICAgICAgICAgIHUgPSBSLnVpW2ldO1xyXG4gICAgICAgICAgICBSLmdldFpvbmUoIHUgKTtcclxuICAgICAgICAgICAgaWYoIHUuaXNHdWkgKSB1LmNhbGNVaXMoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSLm5lZWRSZVpvbmUgPSBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG9uWm9uZTogZnVuY3Rpb24gKCBvLCB4LCB5ICkge1xyXG5cclxuICAgICAgICBpZiggeCA9PT0gdW5kZWZpbmVkIHx8IHkgPT09IHVuZGVmaW5lZCApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIHogPSBvLnpvbmU7XHJcbiAgICAgICAgdmFyIG14ID0geCAtIHoueDtcclxuICAgICAgICB2YXIgbXkgPSB5IC0gei55O1xyXG5cclxuICAgICAgICB2YXIgb3ZlciA9ICggbXggPj0gMCApICYmICggbXkgPj0gMCApICYmICggbXggPD0gei53ICkgJiYgKCBteSA8PSB6LmggKTtcclxuXHJcbiAgICAgICAgaWYoIG92ZXIgKSBvLmxvY2FsLnNldCggbXgsIG15ICk7XHJcbiAgICAgICAgZWxzZSBvLmxvY2FsLm5lZygpO1xyXG5cclxuICAgICAgICByZXR1cm4gb3ZlcjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGdldFpvbmU6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgaWYoIG8uaXNDYW52YXNPbmx5ICkgcmV0dXJuO1xyXG4gICAgICAgIHZhciByID0gby5nZXREb20oKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBvLnpvbmUgPSB7IHg6ci5sZWZ0LCB5OnIudG9wLCB3OnIud2lkdGgsIGg6ci5oZWlnaHQgfTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ1VSU09SXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY3Vyc29yOiBmdW5jdGlvbiAoIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIG5hbWUgPSBuYW1lID8gbmFtZSA6ICdhdXRvJztcclxuICAgICAgICBpZiggbmFtZSAhPT0gUi5vbGRDdXJzb3IgKXtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBuYW1lO1xyXG4gICAgICAgICAgICBSLm9sZEN1cnNvciA9IG5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDQU5WQVNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB0b0NhbnZhczogZnVuY3Rpb24gKCBvLCB3LCBoLCBmb3JjZSApIHtcclxuXHJcbiAgICAgICAgLy8gcHJldmVudCBleGVzaXZlIHJlZHJhd1xyXG5cclxuICAgICAgICBpZiggZm9yY2UgJiYgUi50bXBUaW1lICE9PSBudWxsICkgeyBjbGVhclRpbWVvdXQoUi50bXBUaW1lKTsgUi50bXBUaW1lID0gbnVsbDsgIH1cclxuXHJcbiAgICAgICAgaWYoIFIudG1wVGltZSAhPT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIFIubG9jayApIFIudG1wVGltZSA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7IFIudG1wVGltZSA9IG51bGw7IH0sIDEwICk7XHJcblxyXG4gICAgICAgIC8vL1xyXG5cclxuICAgICAgICB2YXIgaXNOZXdTaXplID0gZmFsc2U7XHJcbiAgICAgICAgaWYoIHcgIT09IG8uY2FudmFzLndpZHRoIHx8IGggIT09IG8uY2FudmFzLmhlaWdodCApIGlzTmV3U2l6ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCBSLnRtcEltYWdlID09PSBudWxsICkgUi50bXBJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICB2YXIgaW1nID0gUi50bXBJbWFnZTsgLy9uZXcgSW1hZ2UoKTtcclxuXHJcbiAgICAgICAgdmFyIGh0bWxTdHJpbmcgPSBSLnhtbHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoIG8uY29udGVudCApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBzdmcgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCInK3crJ1wiIGhlaWdodD1cIicraCsnXCI+PGZvcmVpZ25PYmplY3Qgc3R5bGU9XCJwb2ludGVyLWV2ZW50czogbm9uZTsgbGVmdDowO1wiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj4nKyBodG1sU3RyaW5nICsnPC9mb3JlaWduT2JqZWN0Pjwvc3ZnPic7XHJcblxyXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBjdHggPSBvLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgICAgICBpZiggaXNOZXdTaXplICl7IFxyXG4gICAgICAgICAgICAgICAgby5jYW52YXMud2lkdGggPSB3O1xyXG4gICAgICAgICAgICAgICAgby5jYW52YXMuaGVpZ2h0ID0gaFxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoIDAsIDAsIHcsIGggKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKCB0aGlzLCAwLCAwICk7XHJcblxyXG4gICAgICAgICAgICBvLm9uRHJhdygpO1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudChzdmcpO1xyXG4gICAgICAgIC8vaW1nLnNyYyA9ICdkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LCcrIHdpbmRvdy5idG9hKCBzdmcgKTtcclxuICAgICAgICBpbWcuY3Jvc3NPcmlnaW4gPSAnJztcclxuXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElOUFVUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0SGlkZGVuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLmhpZGRlbkltcHV0ID09PSBudWxsICl7XHJcblxyXG4gICAgICAgICAgICB2YXIgaGlkZSA9IFIuZGVidWdJbnB1dCA/ICcnIDogJ29wYWNpdHk6MDsgekluZGV4OjA7JztcclxuXHJcbiAgICAgICAgICAgIHZhciBjc3MgPSBSLnBhcmVudC5jc3MudHh0ICsgJ3BhZGRpbmc6MDsgd2lkdGg6YXV0bzsgaGVpZ2h0OmF1dG87IHRleHQtc2hhZG93Om5vbmU7J1xyXG4gICAgICAgICAgICBjc3MgKz0gJ2xlZnQ6MTBweDsgdG9wOmF1dG87IGJvcmRlcjpub25lOyBjb2xvcjojRkZGOyBiYWNrZ3JvdW5kOiMwMDA7JyArIGhpZGU7XHJcblxyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC50eXBlID0gJ3RleHQnO1xyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0LnN0eWxlLmNzc1RleHQgPSBjc3MgKyAnYm90dG9tOjMwcHg7JyArIChSLmRlYnVnSW5wdXQgPyAnJyA6ICd0cmFuc2Zvcm06c2NhbGUoMCk7Jyk7O1xyXG5cclxuICAgICAgICAgICAgUi5oaWRkZW5TaXplciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICBSLmhpZGRlblNpemVyLnN0eWxlLmNzc1RleHQgPSBjc3MgKyAnYm90dG9tOjYwcHg7JztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIFIuaGlkZGVuSW1wdXQgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggUi5oaWRkZW5TaXplciApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFIuaGlkZGVuSW1wdXQuc3R5bGUud2lkdGggPSBSLmlucHV0LmNsaWVudFdpZHRoICsgJ3B4JztcclxuICAgICAgICBSLmhpZGRlbkltcHV0LnZhbHVlID0gUi5zdHI7XHJcbiAgICAgICAgUi5oaWRkZW5TaXplci5pbm5lckhUTUwgPSBSLnN0cjtcclxuXHJcbiAgICAgICAgUi5oYXNGb2N1cyA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhckhpZGRlbjogZnVuY3Rpb24gKCBwICkge1xyXG5cclxuICAgICAgICBpZiggUi5oaWRkZW5JbXB1dCA9PT0gbnVsbCApIHJldHVybjtcclxuICAgICAgICBSLmhhc0ZvY3VzID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGlja1BvczogZnVuY3Rpb24oIHggKXtcclxuXHJcbiAgICAgICAgdmFyIGkgPSBSLnN0ci5sZW5ndGgsIGwgPSAwLCBuID0gMDtcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGwgKz0gUi50ZXh0V2lkdGgoIFIuc3RyW25dICk7XHJcbiAgICAgICAgICAgIGlmKCBsID49IHggKSBicmVhaztcclxuICAgICAgICAgICAgbisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwSW5wdXQ6IGZ1bmN0aW9uICggeCwgZG93biApIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgdXAgPSBmYWxzZTtcclxuICAgICBcclxuICAgICAgICBpZiggZG93biApe1xyXG5cclxuICAgICAgICAgICAgdmFyIGlkID0gUi5jbGlja1BvcyggeCApO1xyXG5cclxuICAgICAgICAgICAgUi5tb3ZlWCA9IGlkO1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuc3RhcnRYID09PSAtMSApeyBcclxuXHJcbiAgICAgICAgICAgICAgICBSLnN0YXJ0WCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgUi5jdXJzb3JJZCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgUi5pbnB1dFJhbmdlID0gWyBSLnN0YXJ0WCwgUi5zdGFydFggXTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdmFyIGlzU2VsZWN0aW9uID0gUi5tb3ZlWCAhPT0gUi5zdGFydFg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIGlzU2VsZWN0aW9uICl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIFIuc3RhcnRYID4gUi5tb3ZlWCApIFIuaW5wdXRSYW5nZSA9IFsgUi5tb3ZlWCwgUi5zdGFydFggXTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIFIuaW5wdXRSYW5nZSA9IFsgUi5zdGFydFgsIFIubW92ZVggXTsgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGlmKCBSLnN0YXJ0WCAhPT0gLTEgKXtcclxuXHJcbiAgICAgICAgICAgICAgICBSLmhhc0ZvY3VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQgPSBSLmlucHV0UmFuZ2VbMF07XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnNlbGVjdGlvbkVuZCA9IFIuaW5wdXRSYW5nZVsxXTtcclxuICAgICAgICAgICAgICAgIFIuc3RhcnRYID0gLTE7XHJcblxyXG4gICAgICAgICAgICAgICAgdXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB1cCApIFIuc2VsZWN0UGFyZW50KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNlbGVjdFBhcmVudDogZnVuY3Rpb24gKCl7XHJcblxyXG4gICAgICAgIHZhciBjID0gUi50ZXh0V2lkdGgoIFIuc3RyLnN1YnN0cmluZyggMCwgUi5jdXJzb3JJZCApKTtcclxuICAgICAgICB2YXIgZSA9IFIudGV4dFdpZHRoKCBSLnN0ci5zdWJzdHJpbmcoIDAsIFIuaW5wdXRSYW5nZVswXSApKTtcclxuICAgICAgICB2YXIgcyA9IFIudGV4dFdpZHRoKCBSLnN0ci5zdWJzdHJpbmcoIFIuaW5wdXRSYW5nZVswXSwgIFIuaW5wdXRSYW5nZVsxXSApKTtcclxuXHJcbiAgICAgICAgUi5wYXJlbnQuc2VsZWN0KCBjLCBlLCBzICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXh0V2lkdGg6IGZ1bmN0aW9uICggdGV4dCApe1xyXG5cclxuICAgICAgICBpZiggUi5oaWRkZW5TaXplciA9PT0gbnVsbCApIHJldHVybiAwO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAvZywgJyZuYnNwOycpO1xyXG4gICAgICAgIFIuaGlkZGVuU2l6ZXIuaW5uZXJIVE1MID0gdGV4dDtcclxuICAgICAgICByZXR1cm4gUi5oaWRkZW5TaXplci5jbGllbnRXaWR0aDtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICBjbGVhcklucHV0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudCA9PT0gbnVsbCApIHJldHVybjtcclxuICAgICAgICBpZiggIVIuZmlyc3RJbXB1dCApIFIucGFyZW50LnZhbGlkYXRlKCk7XHJcblxyXG4gICAgICAgIFIuY2xlYXJIaWRkZW4oKTtcclxuICAgICAgICBSLnBhcmVudC51bnNlbGVjdCgpO1xyXG5cclxuICAgICAgICAvL1IuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgICAgICBSLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSBSLnBhcmVudC5jb2xvcnMuaW5wdXRCZztcclxuICAgICAgICBSLmlucHV0LnN0eWxlLmJvcmRlckNvbG9yID0gUi5wYXJlbnQuY29sb3JzLmlucHV0Qm9yZGVyO1xyXG4gICAgICAgIFIucGFyZW50LmlzRWRpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBSLmlucHV0ID0gbnVsbDtcclxuICAgICAgICBSLnBhcmVudCA9IG51bGw7XHJcbiAgICAgICAgUi5zdHIgPSAnJyxcclxuICAgICAgICBSLmZpcnN0SW1wdXQgPSB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0SW5wdXQ6IGZ1bmN0aW9uICggSW5wdXQsIHBhcmVudCApIHtcclxuXHJcbiAgICAgICAgUi5jbGVhcklucHV0KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgUi5pbnB1dCA9IElucHV0O1xyXG4gICAgICAgIFIucGFyZW50ID0gcGFyZW50O1xyXG5cclxuICAgICAgICBSLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSBSLnBhcmVudC5jb2xvcnMuaW5wdXRPdmVyO1xyXG4gICAgICAgIFIuaW5wdXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBSLnBhcmVudC5jb2xvcnMuaW5wdXRCb3JkZXJTZWxlY3Q7XHJcbiAgICAgICAgUi5zdHIgPSBSLmlucHV0LnRleHRDb250ZW50O1xyXG5cclxuICAgICAgICBSLnNldEhpZGRlbigpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLypzZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoIFwic2VsZWN0YWxsXCIsIG51bGwsIGZhbHNlICk7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIGtleWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIga2V5Q29kZSA9IGUud2hpY2g7XHJcblxyXG4gICAgICAgIFIuZmlyc3RJbXB1dCA9IGZhbHNlO1xyXG5cclxuXHJcbiAgICAgICAgaWYgKFIuaGFzRm9jdXMpIHtcclxuICAgICAgICAgICAgLy8gaGFjayB0byBmaXggdG91Y2ggZXZlbnQgYnVnIGluIGlPUyBTYWZhcmlcclxuICAgICAgICAgICAgd2luZG93LmZvY3VzKCk7XHJcbiAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuZm9jdXMoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgUi5wYXJlbnQuaXNFZGl0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAvLyBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIC8vIGFkZCBzdXBwb3J0IGZvciBDdHJsL0NtZCtBIHNlbGVjdGlvblxyXG4gICAgICAgIC8vaWYgKCBrZXlDb2RlID09PSA2NSAmJiAoZS5jdHJsS2V5IHx8IGUubWV0YUtleSApKSB7XHJcbiAgICAgICAgICAgIC8vUi5zZWxlY3RUZXh0KCk7XHJcbiAgICAgICAgICAgIC8vZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAvL3JldHVybiBzZWxmLnJlbmRlcigpO1xyXG4gICAgICAgIC8vfVxyXG5cclxuICAgICAgICBpZigga2V5Q29kZSA9PT0gMTMgKXsgLy9lbnRlclxyXG5cclxuICAgICAgICAgICAgUi5jbGVhcklucHV0KCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZigga2V5Q29kZSA9PT0gOSApeyAvL3RhYiBrZXlcclxuXHJcbiAgICAgICAgICAgLy8gUi5pbnB1dC50ZXh0Q29udGVudCA9ICcnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuaW5wdXQuaXNOdW0gKXtcclxuICAgICAgICAgICAgICAgIGlmICggKChlLmtleUNvZGUgPiA5NSkgJiYgKGUua2V5Q29kZSA8IDEwNikpIHx8IGUua2V5Q29kZSA9PT0gMTEwIHx8IGUua2V5Q29kZSA9PT0gMTA5ICl7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5yZWFkT25seSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQucmVhZE9ubHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBrZXl1cDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQgPT09IG51bGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIFIuc3RyID0gUi5oaWRkZW5JbXB1dC52YWx1ZTtcclxuICAgICAgICBSLmlucHV0LnRleHRDb250ZW50ID0gUi5zdHI7XHJcbiAgICAgICAgUi5jdXJzb3JJZCA9IFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgUi5pbnB1dFJhbmdlID0gWyBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0LCBSLmhpZGRlbkltcHV0LnNlbGVjdGlvbkVuZCBdO1xyXG5cclxuICAgICAgICBSLnNlbGVjdFBhcmVudCgpO1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQuYWxsd2F5ICkgUi5wYXJlbnQudmFsaWRhdGUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vXHJcbiAgICAvLyAgIExJU1RFTklOR1xyXG4gICAgLy9cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBsb29wOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTG9vcCApIHJlcXVlc3RBbmltYXRpb25GcmFtZSggUi5sb29wICk7XHJcbiAgICAgICAgUi51cGRhdGUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgaSA9IFIubGlzdGVucy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKSBSLmxpc3RlbnNbaV0ubGlzdGVuaW5nKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVMaXN0ZW46IGZ1bmN0aW9uICggcHJvdG8gKSB7XHJcblxyXG4gICAgICAgIHZhciBpZCA9IFIubGlzdGVucy5pbmRleE9mKCBwcm90byApO1xyXG4gICAgICAgIGlmKCBpZCAhPT0gLTEgKSBSLmxpc3RlbnMuc3BsaWNlKGlkLCAxKTtcclxuICAgICAgICBpZiggUi5saXN0ZW5zLmxlbmd0aCA9PT0gMCApIFIuaXNMb29wID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRMaXN0ZW46IGZ1bmN0aW9uICggcHJvdG8gKSB7XHJcblxyXG4gICAgICAgIHZhciBpZCA9IFIubGlzdGVucy5pbmRleE9mKCBwcm90byApO1xyXG5cclxuICAgICAgICBpZiggaWQgIT09IC0xICkgcmV0dXJuOyBcclxuXHJcbiAgICAgICAgUi5saXN0ZW5zLnB1c2goIHByb3RvICk7XHJcblxyXG4gICAgICAgIGlmKCAhUi5pc0xvb3AgKXtcclxuICAgICAgICAgICAgUi5pc0xvb3AgPSB0cnVlO1xyXG4gICAgICAgICAgICBSLmxvb3AoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbn1cclxuXHJcbnZhciBSb290cyA9IFI7XHJcbmV4cG9ydCB7IFJvb3RzIH07IiwiXHJcbi8vIG1pbmltYWwgdmVjdG9yIDJcclxuXHJcbmZ1bmN0aW9uIFYyICggeCwgeSApe1xyXG5cclxuXHR0aGlzLnggPSB4IHx8IDA7XHJcblx0dGhpcy55ID0geSB8fCAwO1xyXG5cclxufVxyXG5cclxuT2JqZWN0LmFzc2lnbiggVjIucHJvdG90eXBlLCB7XHJcblxyXG5cdHNldDogZnVuY3Rpb24gKCB4LCB5ICkge1xyXG5cclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9LFxyXG5cclxuXHRkaXZpZGU6IGZ1bmN0aW9uICggdiApIHtcclxuXHJcblx0XHR0aGlzLnggLz0gdi54O1xyXG5cdFx0dGhpcy55IC89IHYueTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblx0bXVsdGlwbHk6IGZ1bmN0aW9uICggdiApIHtcclxuXHJcblx0XHR0aGlzLnggKj0gdi54O1xyXG5cdFx0dGhpcy55ICo9IHYueTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblx0bXVsdGlwbHlTY2FsYXI6IGZ1bmN0aW9uICggc2NhbGFyICkge1xyXG5cclxuXHRcdHRoaXMueCAqPSBzY2FsYXI7XHJcblx0XHR0aGlzLnkgKj0gc2NhbGFyO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9LFxyXG5cclxuXHRkaXZpZGVTY2FsYXI6IGZ1bmN0aW9uICggc2NhbGFyICkge1xyXG5cclxuXHRcdHJldHVybiB0aGlzLm11bHRpcGx5U2NhbGFyKCAxIC8gc2NhbGFyICk7XHJcblxyXG5cdH0sXHJcblxyXG5cdGxlbmd0aDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSApO1xyXG5cclxuXHR9LFxyXG5cclxuXHRhbmdsZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdC8vIGNvbXB1dGVzIHRoZSBhbmdsZSBpbiByYWRpYW5zIHdpdGggcmVzcGVjdCB0byB0aGUgcG9zaXRpdmUgeC1heGlzXHJcblxyXG5cdFx0dmFyIGFuZ2xlID0gTWF0aC5hdGFuMiggdGhpcy55LCB0aGlzLnggKTtcclxuXHJcblx0XHRpZiAoIGFuZ2xlIDwgMCApIGFuZ2xlICs9IDIgKiBNYXRoLlBJO1xyXG5cclxuXHRcdHJldHVybiBhbmdsZTtcclxuXHJcblx0fSxcclxuXHJcblx0YWRkU2NhbGFyOiBmdW5jdGlvbiAoIHMgKSB7XHJcblxyXG5cdFx0dGhpcy54ICs9IHM7XHJcblx0XHR0aGlzLnkgKz0gcztcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblx0bmVnYXRlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dGhpcy54ICo9IC0xO1xyXG5cdFx0dGhpcy55ICo9IC0xO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9LFxyXG5cclxuXHRuZWc6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR0aGlzLnggPSAtMTtcclxuXHRcdHRoaXMueSA9IC0xO1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9LFxyXG5cclxuXHRpc1plcm86IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gKCB0aGlzLnggPT09IDAgJiYgdGhpcy55ID09PSAwICk7XHJcblxyXG5cdH0sXHJcblxyXG5cdGNvcHk6IGZ1bmN0aW9uICggdiApIHtcclxuXHJcblx0XHR0aGlzLnggPSB2Lng7XHJcblx0XHR0aGlzLnkgPSB2Lnk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH0sXHJcblxyXG5cdGVxdWFsczogZnVuY3Rpb24gKCB2ICkge1xyXG5cclxuXHRcdHJldHVybiAoICggdi54ID09PSB0aGlzLnggKSAmJiAoIHYueSA9PT0gdGhpcy55ICkgKTtcclxuXHJcblx0fSxcclxuXHJcblx0bmVhckVxdWFsczogZnVuY3Rpb24gKCB2LCBuICkge1xyXG5cclxuXHRcdHJldHVybiAoICggdi54LnRvRml4ZWQobikgPT09IHRoaXMueC50b0ZpeGVkKG4pICkgJiYgKCB2LnkudG9GaXhlZChuKSA9PT0gdGhpcy55LnRvRml4ZWQobikgKSApO1xyXG5cclxuXHR9LFxyXG5cclxuXHRsZXJwOiBmdW5jdGlvbiAoIHYsIGFscGhhICkge1xyXG5cclxuXHRcdGlmKHY9PT1udWxsKXtcclxuXHRcdFx0dGhpcy54IC09IHRoaXMueCAqIGFscGhhO1xyXG5cdFx0ICAgIHRoaXMueSAtPSB0aGlzLnkgKiBhbHBoYTtcclxuXHRcdH0gZWxzZSB7XHJcblx0XHRcdHRoaXMueCArPSAoIHYueCAtIHRoaXMueCApICogYWxwaGE7XHJcblx0XHQgICAgdGhpcy55ICs9ICggdi55IC0gdGhpcy55ICkgKiBhbHBoYTtcclxuXHRcdH1cclxuXHJcblx0XHRcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblxyXG5cclxufSApO1xyXG5cclxuXHJcbmV4cG9ydCB7IFYyIH07IiwiXHJcbmltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi9Sb290cyc7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi9Ub29scyc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi9WMic7XHJcblxyXG4vKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG5mdW5jdGlvbiBQcm90byAoIG8gKSB7XHJcblxyXG4gICAgbyA9IG8gfHwge307XHJcblxyXG5cclxuICAgIC8vIGlmIGlzIG9uIGd1aSBvciBncm91cFxyXG4gICAgdGhpcy5tYWluID0gby5tYWluIHx8IG51bGw7XHJcbiAgICB0aGlzLmlzVUkgPSBvLmlzVUkgfHwgZmFsc2U7XHJcbiAgICB0aGlzLnBhcmVudEdyb3VwID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmNzcyA9IHRoaXMubWFpbiA/IHRoaXMubWFpbi5jc3MgOiBUb29scy5jc3M7XHJcbiAgICB0aGlzLmNvbG9ycyA9IHRoaXMubWFpbiA/IHRoaXMubWFpbi5jb2xvcnMgOiBUb29scy5jb2xvcnM7XHJcblxyXG4gICAgdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5ib3JkZXI7XHJcbiAgICB0aGlzLnN2Z3MgPSBUb29scy5zdmdzO1xyXG5cclxuICAgIC8vIG9ubHkgc3BhY2UgXHJcbiAgICB0aGlzLmlzRW1wdHkgPSBvLmlzRW1wdHkgfHwgZmFsc2U7XHJcblxyXG4gICAgdGhpcy56b25lID0geyB4OjAsIHk6MCwgdzowLCBoOjAgfTtcclxuICAgIHRoaXMubG9jYWwgPSBuZXcgVjIoKS5uZWcoKTtcclxuXHJcbiAgICB0aGlzLmlzQ2FudmFzT25seSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaXNTZWxlY3QgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBwZXJjZW50IG9mIHRpdGxlXHJcbiAgICB0aGlzLnAgPSBvLnAgIT09IHVuZGVmaW5lZCA/IG8ucCA6IFRvb2xzLnNpemUucDtcclxuXHJcbiAgICB0aGlzLncgPSB0aGlzLmlzVUkgPyB0aGlzLm1haW4uc2l6ZS53IDogVG9vbHMuc2l6ZS53O1xyXG4gICAgaWYoIG8udyAhPT0gdW5kZWZpbmVkICkgdGhpcy53ID0gby53O1xyXG5cclxuICAgIHRoaXMuaCA9IHRoaXMuaXNVSSA/IHRoaXMubWFpbi5zaXplLmggOiBUb29scy5zaXplLmg7XHJcbiAgICBpZiggby5oICE9PSB1bmRlZmluZWQgKSB0aGlzLmggPSBvLmg7XHJcbiAgICBpZighdGhpcy5pc0VtcHR5KSB0aGlzLmggPSB0aGlzLmggPCAxMSA/IDExIDogdGhpcy5oO1xyXG5cclxuICAgIC8vIGlmIG5lZWQgcmVzaXplIHdpZHRoXHJcbiAgICB0aGlzLmF1dG9XaWR0aCA9IG8uYXV0byB8fCB0cnVlO1xyXG5cclxuICAgIC8vIG9wZW4gc3RhdHVcclxuICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgLy8gcmFkaXVzIGZvciB0b29sYm94XHJcbiAgICB0aGlzLnJhZGl1cyA9IG8ucmFkaXVzIHx8IDA7XHJcblxyXG4gICAgLy8gb25seSBmb3IgbnVtYmVyXHJcbiAgICB0aGlzLmlzTnVtYmVyID0gZmFsc2U7XHJcblxyXG4gICAgLy8gb25seSBtb3N0IHNpbXBsZSBcclxuICAgIHRoaXMubW9ubyA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHN0b3AgbGlzdGVuaW5nIGZvciBlZGl0IHNsaWRlIHRleHRcclxuICAgIHRoaXMuaXNFZGl0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gbm8gdGl0bGUgXHJcbiAgICB0aGlzLnNpbXBsZSA9IG8uc2ltcGxlIHx8IGZhbHNlO1xyXG4gICAgaWYoIHRoaXMuc2ltcGxlICkgdGhpcy5zYSA9IDA7XHJcblxyXG4gICAgXHJcblxyXG4gICAgLy8gZGVmaW5lIG9iaiBzaXplXHJcbiAgICB0aGlzLnNldFNpemUoIHRoaXMudyApO1xyXG5cclxuICAgIC8vIHRpdGxlIHNpemVcclxuICAgIGlmKG8uc2EgIT09IHVuZGVmaW5lZCApIHRoaXMuc2EgPSBvLnNhO1xyXG4gICAgaWYoby5zYiAhPT0gdW5kZWZpbmVkICkgdGhpcy5zYiA9IG8uc2I7XHJcblxyXG4gICAgaWYoIHRoaXMuc2ltcGxlICkgdGhpcy5zYiA9IHRoaXMudyAtIHRoaXMuc2E7XHJcblxyXG4gICAgLy8gbGFzdCBudW1iZXIgc2l6ZSBmb3Igc2xpZGVcclxuICAgIHRoaXMuc2MgPSBvLnNjID09PSB1bmRlZmluZWQgPyA0NyA6IG8uc2M7XHJcblxyXG4gICAgLy8gZm9yIGxpc3RlbmluZyBvYmplY3RcclxuICAgIHRoaXMub2JqZWN0TGluayA9IG51bGw7XHJcbiAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG4gICAgdGhpcy52YWwgPSBudWxsO1xyXG4gICAgXHJcbiAgICAvLyBCYWNrZ3JvdW5kXHJcbiAgICB0aGlzLmJnID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDsvL3RoaXMuaXNVSSA/IHRoaXMubWFpbi5iZyA6IFRvb2xzLmNvbG9ycy5iYWNrZ3JvdW5kO1xyXG4gICAgdGhpcy5iZ092ZXIgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kT3ZlcjtcclxuICAgIGlmKCBvLmJnICE9PSB1bmRlZmluZWQgKXsgdGhpcy5iZyA9IG8uYmc7IHRoaXMuYmdPdmVyID0gby5iZzsgfVxyXG4gICAgaWYoIG8uYmdPdmVyICE9PSB1bmRlZmluZWQgKXsgdGhpcy5iZ092ZXIgPSBvLmJnT3ZlcjsgfVxyXG5cclxuICAgIC8vIEZvbnQgQ29sb3I7XHJcbiAgICB0aGlzLnRpdGxlQ29sb3IgPSBvLnRpdGxlQ29sb3IgfHwgdGhpcy5jb2xvcnMudGV4dDtcclxuICAgIHRoaXMuZm9udENvbG9yID0gby5mb250Q29sb3IgfHwgdGhpcy5jb2xvcnMudGV4dDtcclxuXHJcbiAgICBpZiggby5jb2xvciAhPT0gdW5kZWZpbmVkICl7IFxyXG5cclxuICAgICAgICBpZihvLmNvbG9yID09PSAnbicpIG8uY29sb3IgPSAnI2ZmMDAwMCc7XHJcblxyXG4gICAgICAgIGlmKCBvLmNvbG9yICE9PSAnbm8nICkge1xyXG4gICAgICAgICAgICBpZiggIWlzTmFOKG8uY29sb3IpICkgdGhpcy5mb250Q29sb3IgPSBUb29scy5oZXhUb0h0bWwoby5jb2xvcik7XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy5mb250Q29sb3IgPSBvLmNvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnRpdGxlQ29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8qaWYoIG8uY29sb3IgIT09IHVuZGVmaW5lZCApeyBcclxuICAgICAgICBpZiggIWlzTmFOKG8uY29sb3IpICkgdGhpcy5mb250Q29sb3IgPSBUb29scy5oZXhUb0h0bWwoby5jb2xvcik7XHJcbiAgICAgICAgZWxzZSB0aGlzLmZvbnRDb2xvciA9IG8uY29sb3I7XHJcbiAgICAgICAgdGhpcy50aXRsZUNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICB9Ki9cclxuXHJcbiAgICB0aGlzLmNvbG9yUGx1cyA9IFRvb2xzLkNvbG9yTHVtYSggdGhpcy5mb250Q29sb3IsIDAuMyApO1xyXG5cclxuICAgIHRoaXMudHh0ID0gby5uYW1lIHx8ICdQcm90byc7XHJcbiAgICB0aGlzLnJlbmFtZSA9IG8ucmVuYW1lIHx8ICcnO1xyXG4gICAgdGhpcy50YXJnZXQgPSBvLnRhcmdldCB8fCBudWxsO1xyXG5cclxuICAgIHRoaXMuY2FsbGJhY2sgPSBvLmNhbGxiYWNrID09PSB1bmRlZmluZWQgPyBudWxsIDogby5jYWxsYmFjaztcclxuICAgIHRoaXMuZW5kQ2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICAgIGlmKCB0aGlzLmNhbGxiYWNrID09PSBudWxsICYmIHRoaXMuaXNVSSAmJiB0aGlzLm1haW4uY2FsbGJhY2sgIT09IG51bGwgKSB0aGlzLmNhbGxiYWNrID0gdGhpcy5tYWluLmNhbGxiYWNrO1xyXG5cclxuICAgIC8vIGVsZW1lbnRzXHJcbiAgICB0aGlzLmMgPSBbXTtcclxuXHJcbiAgICAvLyBzdHlsZSBcclxuICAgIHRoaXMucyA9IFtdO1xyXG5cclxuXHJcbiAgICB0aGlzLmNbMF0gPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjpyZWxhdGl2ZTsgaGVpZ2h0OjIwcHg7IGZsb2F0OmxlZnQ7IG92ZXJmbG93OmhpZGRlbjsnKTtcclxuICAgIHRoaXMuc1swXSA9IHRoaXMuY1swXS5zdHlsZTtcclxuXHJcbiAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5zWzBdLm1hcmdpbkJvdHRvbSA9ICcxcHgnO1xyXG4gICAgXHJcbiAgICAvLyB3aXRoIHRpdGxlXHJcbiAgICBpZiggIXRoaXMuc2ltcGxlICl7IFxyXG4gICAgICAgIHRoaXMuY1sxXSA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCApO1xyXG4gICAgICAgIHRoaXMuc1sxXSA9IHRoaXMuY1sxXS5zdHlsZTtcclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0aGlzLnJlbmFtZSA9PT0gJycgPyB0aGlzLnR4dCA6IHRoaXMucmVuYW1lO1xyXG4gICAgICAgIHRoaXMuc1sxXS5jb2xvciA9IHRoaXMudGl0bGVDb2xvcjtcclxuICAgIH1cclxuXHJcbiAgICBpZiggby5wb3MgKXtcclxuICAgICAgICB0aGlzLnNbMF0ucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgIGZvcih2YXIgcCBpbiBvLnBvcyl7XHJcbiAgICAgICAgICAgIHRoaXMuc1swXVtwXSA9IG8ucG9zW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1vbm8gPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCBvLmNzcyApIHRoaXMuc1swXS5jc3NUZXh0ID0gby5jc3M7IFxyXG4gICAgXHJcblxyXG59XHJcblxyXG5PYmplY3QuYXNzaWduKCBQcm90by5wcm90b3R5cGUsIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogUHJvdG8sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gbWFrZSBkZSBub2RlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMuczsgLy8gc3R5bGUgY2FjaGVcclxuICAgICAgICB2YXIgYyA9IHRoaXMuYzsgLy8gZGl2IGNhY2hcclxuXHJcbiAgICAgICAgc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1VJICApIHNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSAgKSBzWzBdLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgIC8vaWYoIHRoaXMuYXV0b0hlaWdodCApIHNbMF0udHJhbnNpdGlvbiA9ICdoZWlnaHQgMC4wMXMgZWFzZS1vdXQnO1xyXG4gICAgICAgIGlmKCBjWzFdICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hdXRvV2lkdGggKXtcclxuICAgICAgICAgICAgc1sxXSA9IGNbMV0uc3R5bGU7XHJcbiAgICAgICAgICAgIHNbMV0uaGVpZ2h0ID0gKHRoaXMuaC00KSArICdweCc7XHJcbiAgICAgICAgICAgIHNbMV0ubGluZUhlaWdodCA9ICh0aGlzLmgtOCkgKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGZyYWcgPSBUb29scy5mcmFnO1xyXG5cclxuICAgICAgICBmb3IoIHZhciBpID0gMSwgbG5nID0gYy5sZW5ndGg7IGkgIT09IGxuZzsgaSsrICl7XHJcbiAgICAgICAgICAgIGlmKCBjW2ldICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKCBjW2ldICk7XHJcbiAgICAgICAgICAgICAgICBzW2ldID0gY1tpXS5zdHlsZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5hcHBlbmRDaGlsZCggY1swXSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uaW5uZXIuYXBwZW5kQ2hpbGQoIGNbMF0gKTtcclxuICAgICAgICAgICAgZWxzZSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBjWzBdICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjWzBdLmFwcGVuZENoaWxkKCBmcmFnICk7XHJcblxyXG4gICAgICAgIHRoaXMuclNpemUoKTtcclxuXHJcbiAgICAgICAgLy8gISBzb2xvIHByb3RvXHJcbiAgICAgICAgaWYoICF0aGlzLmlzVUkgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1swXS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xyXG4gICAgICAgICAgICBSb290cy5hZGQoIHRoaXMgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gVFJBTlMgRlVOQ1RJT05TIGZyb20gVG9vbHNcclxuXHJcbiAgICBkb206IGZ1bmN0aW9uICggdHlwZSwgY3NzLCBvYmosIGRvbSwgaWQgKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBUb29scy5kb20oIHR5cGUsIGNzcywgb2JqLCBkb20sIGlkICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRTdmc6IGZ1bmN0aW9uICggZG9tLCB0eXBlLCB2YWx1ZSwgaWQgKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLnNldFN2ZyggZG9tLCB0eXBlLCB2YWx1ZSwgaWQgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENzczogZnVuY3Rpb24gKCBkb20sIGNzcyApIHtcclxuXHJcbiAgICAgICAgVG9vbHMuc2V0Q3NzKCBkb20sIGNzcyApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xhbXA6IGZ1bmN0aW9uICggdmFsdWUsIG1pbiwgbWF4ICkge1xyXG5cclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xhbXAoIHZhbHVlLCBtaW4sIG1heCApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Q29sb3JSaW5nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHMuY29sb3JSaW5nICkgVG9vbHMubWFrZUNvbG9yUmluZygpO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHMuY29sb3JSaW5nICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRKb3lzdGljazogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgaWYoICFUb29sc1sgJ2pveXN0aWNrXycrIG1vZGVsIF0gKSBUb29scy5tYWtlSm95c3RpY2soIG1vZGVsICk7XHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmNsb25lKCBUb29sc1sgJ2pveXN0aWNrXycrIG1vZGVsIF0gKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGdldENpcmN1bGFyOiBmdW5jdGlvbiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICBpZiggIVRvb2xzLmNpcmN1bGFyICkgVG9vbHMubWFrZUNpcmN1bGFyKCBtb2RlbCApO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHMuY2lyY3VsYXIgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGdldEtub2I6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHMua25vYiApIFRvb2xzLm1ha2VLbm9iKCBtb2RlbCApO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHMua25vYiApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLypnZXRHcmFwaDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAgaWYoICFUb29scy5ncmFwaCApIFRvb2xzLm1ha2VHcmFwaCgpO1xyXG4gICAgICAgICByZXR1cm4gVG9vbHMuY2xvbmUoIFRvb2xzLmdyYXBoICk7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIC8vIFRSQU5TIEZVTkNUSU9OUyBmcm9tIFJvb3RzXHJcblxyXG4gICAgY3Vyc29yOiBmdW5jdGlvbiAoIG5hbWUgKSB7XHJcblxyXG4gICAgICAgICBSb290cy5jdXJzb3IoIG5hbWUgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIFxyXG5cclxuICAgIC8vLy8vLy8vL1xyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgcmVzZXQ6ICBmdW5jdGlvbiAoKSB7fSxcclxuXHJcbiAgICAvLy8vLy8vLy9cclxuXHJcbiAgICBnZXREb206IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY1swXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVpb3V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRW1wdHkgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5iZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVpb3ZlcjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0VtcHR5ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmdPdmVyO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVuYW1lOiBmdW5jdGlvbiAoIHMgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGxpc3RlbjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBSb290cy5hZGRMaXN0ZW4oIHRoaXMgKTtcclxuICAgICAgICAvL1Jvb3RzLmxpc3RlbnMucHVzaCggdGhpcyApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbGlzdGVuaW5nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdExpbmsgPT09IG51bGwgKSByZXR1cm47XHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZW5kICkgcmV0dXJuO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzRWRpdCApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRWYWx1ZSggdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24gKCB2ICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc051bWJlciApIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB2ICk7XHJcbiAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gdjtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHVwZGF0ZSBldmVyeSBjaGFuZ2VcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCBmICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0VtcHR5ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gZjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHVwZGF0ZSBvbmx5IG9uIGVuZFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9uRmluaXNoQ2hhbmdlOiBmdW5jdGlvbiAoIGYgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRW1wdHkgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZW5kQ2FsbGJhY2sgPSBmO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2VuZDogZnVuY3Rpb24gKCB2ICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VuZCA9IHRydWU7XHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCApIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSA9IHYgfHwgdGhpcy52YWx1ZTtcclxuICAgICAgICBpZiggdGhpcy5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2soIHYgfHwgdGhpcy52YWx1ZSApO1xyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZW5kRW5kOiBmdW5jdGlvbiAoIHYgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmVuZENhbGxiYWNrICkgdGhpcy5lbmRDYWxsYmFjayggdiB8fCB0aGlzLnZhbHVlICk7XHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCApIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSA9IHYgfHwgdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGNsZWFyIG5vZGVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIFxyXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgVG9vbHMuY2xlYXIoIHRoaXMuY1swXSApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy50YXJnZXQgIT09IG51bGwgKXsgXHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnJlbW92ZUNoaWxkKCB0aGlzLmNbMF0gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNsZWFyT25lKCB0aGlzICk7XHJcbiAgICAgICAgICAgIGVsc2UgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggdGhpcy5jWzBdICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNVSSApIFJvb3RzLnJlbW92ZSggdGhpcyApO1xyXG5cclxuICAgICAgICB0aGlzLmMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMucyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gY2hhbmdlIHNpemUgXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0U2l6ZTogZnVuY3Rpb24gKCBzeCApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmF1dG9XaWR0aCApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy53ID0gc3g7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnNpbXBsZSApe1xyXG4gICAgICAgICAgICB0aGlzLnNiID0gdGhpcy53IC0gdGhpcy5zYTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgcHAgPSB0aGlzLncgKiAoIHRoaXMucCAvIDEwMCApO1xyXG4gICAgICAgICAgICB0aGlzLnNhID0gTWF0aC5mbG9vciggcHAgKyAxMCApO1xyXG4gICAgICAgICAgICB0aGlzLnNiID0gTWF0aC5mbG9vciggdGhpcy53IC0gcHAgLSAyMCApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5hdXRvV2lkdGggKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5zWzBdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuICAgICAgICBpZiggIXRoaXMuc2ltcGxlICkgdGhpcy5zWzFdLndpZHRoID0gdGhpcy5zYSArICdweCc7XHJcbiAgICBcclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gZm9yIG51bWVyaWMgdmFsdWVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRUeXBlTnVtYmVyOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNOdW1iZXIgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gMDtcclxuICAgICAgICBpZihvLnZhbHVlICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBpZiggdHlwZW9mIG8udmFsdWUgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZSA9IG8udmFsdWUgKiAxO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSBvLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5taW4gPSBvLm1pbiA9PT0gdW5kZWZpbmVkID8gLUluZmluaXR5IDogby5taW47XHJcbiAgICAgICAgdGhpcy5tYXggPSBvLm1heCA9PT0gdW5kZWZpbmVkID8gIEluZmluaXR5IDogby5tYXg7XHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gMiA6IG8ucHJlY2lzaW9uO1xyXG5cclxuICAgICAgICB2YXIgcztcclxuXHJcbiAgICAgICAgc3dpdGNoKHRoaXMucHJlY2lzaW9uKXtcclxuICAgICAgICAgICAgY2FzZSAwOiBzID0gMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogcyA9IDAuMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogcyA9IDAuMDE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6IHMgPSAwLjAwMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDogcyA9IDAuMDAwMTsgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnN0ZXAgPSBvLnN0ZXAgPT09IHVuZGVmaW5lZCA/ICBzIDogby5zdGVwO1xyXG4gICAgICAgIHRoaXMucmFuZ2UgPSB0aGlzLm1heCAtIHRoaXMubWluO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB0aGlzLnZhbHVlICk7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIG51bVZhbHVlOiBmdW5jdGlvbiAoIG4gKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBNYXRoLm1pbiggdGhpcy5tYXgsIE1hdGgubWF4KCB0aGlzLm1pbiwgbiApICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFMgREVGQVVMVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50OiBmdW5jdGlvbiAoIGUgKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSApIHJldHVybjtcclxuICAgICAgICByZXR1cm4gdGhpc1tlLnR5cGVdKGUpO1xyXG4gICAgXHJcbiAgICB9LFxyXG5cclxuICAgIHdoZWVsOiBmdW5jdGlvbiAoIGUgKSB7IHJldHVybiBmYWxzZTsgfSxcclxuXHJcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uKCBlICkgeyByZXR1cm4gZmFsc2U7IH0sXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiggZSApIHsgcmV0dXJuIGZhbHNlOyB9LFxyXG5cclxuICAgIG1vdXNldXA6IGZ1bmN0aW9uKCBlICkgeyByZXR1cm4gZmFsc2U7IH0sXHJcblxyXG4gICAga2V5ZG93bjogZnVuY3Rpb24oIGUgKSB7IHJldHVybiBmYWxzZTsgfSxcclxuXHJcbiAgICBrZXl1cDogZnVuY3Rpb24oIGUgKSB7IHJldHVybiBmYWxzZTsgfSxcclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gb2JqZWN0IHJlZmVyZW5jeVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNldFJlZmVyZW5jeTogZnVuY3Rpb24gKCBvYmosIHZhbCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5vYmplY3RMaW5rID0gb2JqO1xyXG4gICAgICAgIHRoaXMudmFsID0gdmFsO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZGlzcGxheTogZnVuY3Rpb24gKCB2ICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHYgPSB2IHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc1swXS5kaXNwbGF5ID0gdiA/ICdibG9jaycgOiAnbm9uZSc7XHJcbiAgICAgICAgLy90aGlzLmlzUmVhZHkgPSB2ID8gZmFsc2UgOiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gcmVzaXplIGhlaWdodCBcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvcGVuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHJldHVybjtcclxuICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBuZWVkWm9uZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG4gICAgXHJcbiAgICB9LFxyXG5cclxuICAgIHVuc2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRJbnB1dDogZnVuY3Rpb24gKCBJbnB1dCApIHtcclxuICAgICAgICBcclxuICAgICAgICBSb290cy5zZXRJbnB1dCggSW5wdXQsIHRoaXMgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwSW5wdXQ6IGZ1bmN0aW9uICggeCwgZG93biApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFJvb3RzLnVwSW5wdXQoIHgsIGRvd24gKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHNwZWNpYWwgaXRlbSBcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3RlZDogZnVuY3Rpb24gKCBiICl7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZWxlY3QgPSBiIHx8IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcblxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBQcm90byB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5mdW5jdGlvbiBCb29sICggbyApe1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuICAgIFxyXG4gICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgZmFsc2U7XHJcblxyXG4gICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICB0aGlzLmluaCA9IG8uaW5oIHx8IHRoaXMuaDtcclxuXHJcbiAgICB2YXIgdCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktKCh0aGlzLmluaC0yKSowLjUpO1xyXG5cclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYmFja2dyb3VuZDonKyB0aGlzLmNvbG9ycy5ib29sYmcgKyc7IGhlaWdodDonKyh0aGlzLmluaC0yKSsncHg7IHdpZHRoOjM2cHg7IHRvcDonK3QrJ3B4OyBib3JkZXItcmFkaXVzOjEwcHg7IGJvcmRlcjoycHggc29saWQgJyt0aGlzLmJvb2xiZyApO1xyXG4gICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdoZWlnaHQ6JysodGhpcy5pbmgtNikrJ3B4OyB3aWR0aDoxNnB4OyB0b3A6JysodCsyKSsncHg7IGJvcmRlci1yYWRpdXM6MTBweDsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsnICk7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxufVxyXG5cclxuQm9vbC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBCb29sLFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWUgPyBmYWxzZSA6IHRydWU7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudmFsdWUgKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHNbMl0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJvb2xvbjtcclxuICAgICAgICAgICAgc1syXS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmJvb2xvbjtcclxuICAgICAgICAgICAgc1szXS5tYXJnaW5MZWZ0ID0gJzE3cHgnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc1syXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYm9vbGJnO1xyXG4gICAgICAgICAgICBzWzJdLmJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9vbGJnO1xyXG4gICAgICAgICAgICBzWzNdLm1hcmdpbkxlZnQgPSAnMnB4JztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgclNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuICAgICAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSB0aGlzLnNhKzErICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgQm9vbCB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5mdW5jdGlvbiBCdXR0b24gKCBvICkge1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICB0aGlzLnZhbHVlID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy52YWx1ZXMgPSBvLnZhbHVlIHx8IHRoaXMudHh0O1xyXG5cclxuICAgIGlmKHR5cGVvZiB0aGlzLnZhbHVlcyA9PT0gJ3N0cmluZycgKSB0aGlzLnZhbHVlcyA9IFt0aGlzLnZhbHVlc107XHJcblxyXG4gICAgLy90aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICB0aGlzLmlzTG9hZEJ1dHRvbiA9IG8ubG9hZGVyIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5pc0RyYWdCdXR0b24gPSBvLmRyYWcgfHwgZmFsc2U7XHJcbiAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKSB0aGlzLmlzTG9hZEJ1dHRvbiA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlcy5sZW5ndGg7XHJcbiAgICB0aGlzLnRtcCA9IFtdO1xyXG4gICAgdGhpcy5zdGF0ID0gW107XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubG5nOyBpKyspe1xyXG4gICAgICAgIHRoaXMuY1tpKzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpjZW50ZXI7IHRvcDoxcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OycgKTtcclxuICAgICAgICB0aGlzLmNbaSsyXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHRoaXMuY1tpKzJdLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW2ldO1xyXG4gICAgICAgIHRoaXMuc3RhdFtpXSA9IDE7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gJyc7XHJcblxyXG4gICAgaWYoIHRoaXMuaXNMb2FkQnV0dG9uICkgdGhpcy5pbml0TG9hZGVyKCk7XHJcbiAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKXsgXHJcbiAgICAgICAgdGhpcy5sbmcgKys7XHJcbiAgICAgICAgdGhpcy5pbml0RHJhZ2VyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG59XHJcblxyXG5CdXR0b24ucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogQnV0dG9uLFxyXG5cclxuICAgIHRlc3Rab25lOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHZhciB0ID0gdGhpcy50bXA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgIFx0aWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGkrMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwOiBmdW5jdGlvbiAoIGUgKSB7XHJcbiAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgIFx0dmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbbmFtZS0yXVxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0xvYWRCdXR0b24gKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICAvL2Vsc2UgdGhpcy5maWxlU2VsZWN0KCBlLnRhcmdldC5maWxlc1swXSApO1xyXG4gICAgXHRyZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuIFxyXG4gICAgICAgIC8vIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIHVwID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgIC8vIGNvbnNvbGUubG9nKG5hbWUpXHJcblxyXG4gICAgICAgIGlmKCBuYW1lICE9PSAnJyApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMubW9kZXMoIHRoaXMuaXNEb3duID8gMyA6IDIsIG5hbWUgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIFx0dXAgPSB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHVwKVxyXG5cclxuICAgICAgICByZXR1cm4gdXA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZXM6IGZ1bmN0aW9uICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgdmFyIHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PT0gbmFtZS0yICkgdiA9IHRoaXMubW9kZSggbiwgaSsyICk7XHJcbiAgICAgICAgICAgIGVsc2UgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcblxyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vZGU6IGZ1bmN0aW9uICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgdmFyIGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgaSA9IG5hbWUgLSAyO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0W2ldICE9PSBuICl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0W2ldID0gMTsgdGhpcy5zWyBpKzIgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zdGF0W2ldID0gMjsgdGhpcy5zWyBpKzIgXS5jb2xvciA9ICcjRkZGJzsgICAgICAgICB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXRbaV0gPSAzOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gJyNGRkYnOyAgICAgICAgIHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIC8qdmFyIHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcbiAgICAgICAgICAgIHYgPSB0aGlzLm1vZGUoIDEsIGkrMiApO1xyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZXMoIDEgLCAyICk7XHJcblxyXG4gICAgXHQvKmlmKCB0aGlzLnNlbGVjdGVkICl7XHJcbiAgICBcdFx0dGhpcy5zWyB0aGlzLnNlbGVjdGVkIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5zWyB0aGlzLnNlbGVjdGVkIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBcdH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7Ki9cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBkcmFnb3ZlcjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICB0aGlzLnNbNF0uY29sb3IgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkcmFnZW5kOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzRdLmJvcmRlckNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgdGhpcy5zWzRdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkcm9wOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmFnZW5kKGUpO1xyXG4gICAgICAgIHRoaXMuZmlsZVNlbGVjdCggZS5kYXRhVHJhbnNmZXIuZmlsZXNbMF0gKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGluaXREcmFnZXI6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKycgdGV4dC1hbGlnbjpjZW50ZXI7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC04KSsncHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5mb250Q29sb3IrJzsgdG9wOjJweDsgIGhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OyBwb2ludGVyLWV2ZW50czphdXRvOycgKTsvLyBjdXJzb3I6ZGVmYXVsdDtcclxuICAgICAgICB0aGlzLmNbNF0udGV4dENvbnRlbnQgPSAnRFJBRyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1s0XS5hZGRFdmVudExpc3RlbmVyKCAnZHJhZ292ZXInLCBmdW5jdGlvbihlKXsgdGhpcy5kcmFnb3ZlcihlKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG4gICAgICAgIHRoaXMuY1s0XS5hZGRFdmVudExpc3RlbmVyKCAnZHJhZ2VuZCcsIGZ1bmN0aW9uKGUpeyB0aGlzLmRyYWdlbmQoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpeyB0aGlzLmRyYWdlbmQoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2Ryb3AnLCBmdW5jdGlvbihlKXsgdGhpcy5kcm9wKGUpOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdLmV2ZW50cyA9IFsgIF07XHJcbiAgICAgICAgLy90aGlzLmNbNF0uZXZlbnRzID0gWyAnZHJhZ292ZXInLCAnZHJhZ2VuZCcsICdkcmFnbGVhdmUnLCAnZHJvcCcgXTtcclxuXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0TG9hZGVyOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnaW5wdXQnLCB0aGlzLmNzcy5iYXNpYyArJ3RvcDowcHg7IG9wYWNpdHk6MDsgaGVpZ2h0OicrKHRoaXMuaCkrJ3B4OyBwb2ludGVyLWV2ZW50czphdXRvOyBjdXJzb3I6cG9pbnRlcjsnICk7Ly9cclxuICAgICAgICB0aGlzLmNbM10ubmFtZSA9ICdsb2FkZXInO1xyXG4gICAgICAgIHRoaXMuY1szXS50eXBlID0gXCJmaWxlXCI7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgZnVuY3Rpb24oZSl7IHRoaXMuZmlsZVNlbGVjdCggZS50YXJnZXQuZmlsZXNbMF0gKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG4gICAgICAgIC8vdGhpcy5jWzNdLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBmdW5jdGlvbihlKXsgIH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuXHJcbiAgICAgICAgLy90aGlzLmNbMl0uZXZlbnRzID0gWyAgXTtcclxuICAgICAgICAvL3RoaXMuY1szXS5ldmVudHMgPSBbICdjaGFuZ2UnLCAnbW91c2VvdmVyJywgJ21vdXNlZG93bicsICdtb3VzZXVwJywgJ21vdXNlb3V0JyBdO1xyXG5cclxuICAgICAgICAvL3RoaXMuaGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBmaWxlU2VsZWN0OiBmdW5jdGlvbiAoIGZpbGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhVXJsID0gWyAncG5nJywgJ2pwZycsICdtcDQnLCAnd2VibScsICdvZ2cnIF07XHJcbiAgICAgICAgdmFyIGRhdGFCdWYgPSBbICdzZWEnLCAneicsICdoZXgnLCAnYnZoJywgJ0JWSCcgXTtcclxuXHJcbiAgICAgICAgLy9pZiggISBlLnRhcmdldC5maWxlcyApIHJldHVybjtcclxuXHJcbiAgICAgICAgLy92YXIgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xyXG4gICAgICAgXHJcbiAgICAgICAgLy90aGlzLmNbM10udHlwZSA9IFwibnVsbFwiO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCB0aGlzLmNbNF0gKVxyXG5cclxuICAgICAgICBpZiggZmlsZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICB2YXIgZm5hbWUgPSBmaWxlLm5hbWU7XHJcbiAgICAgICAgdmFyIHR5cGUgPSBmbmFtZS5zdWJzdHJpbmcoZm5hbWUubGFzdEluZGV4T2YoJy4nKSsxLCBmbmFtZS5sZW5ndGggKTtcclxuXHJcbiAgICAgICAgaWYoIGRhdGFVcmwuaW5kZXhPZiggdHlwZSApICE9PSAtMSApIHJlYWRlci5yZWFkQXNEYXRhVVJMKCBmaWxlICk7XHJcbiAgICAgICAgZWxzZSBpZiggZGF0YUJ1Zi5pbmRleE9mKCB0eXBlICkgIT09IC0xICkgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlICk7Ly9yZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTtcclxuICAgICAgICBlbHNlIHJlYWRlci5yZWFkQXNUZXh0KCBmaWxlICk7XHJcblxyXG4gICAgICAgIC8vIGlmKCB0eXBlID09PSAncG5nJyB8fCB0eXBlID09PSAnanBnJyB8fCB0eXBlID09PSAnbXA0JyB8fCB0eXBlID09PSAnd2VibScgfHwgdHlwZSA9PT0gJ29nZycgKSByZWFkZXIucmVhZEFzRGF0YVVSTCggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSBpZiggdHlwZSA9PT0gJ3onICkgcmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSBpZiggdHlwZSA9PT0gJ3NlYScgfHwgdHlwZSA9PT0gJ2J2aCcgfHwgdHlwZSA9PT0gJ0JWSCcgfHwgdHlwZSA9PT0gJ3onKSByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoICApIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSByZWFkZXIucmVhZEFzVGV4dCggZmlsZSApO1xyXG5cclxuICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayggZS50YXJnZXQucmVzdWx0LCBmbmFtZSwgdHlwZSApO1xyXG4gICAgICAgICAgICAvL3RoaXMuY1szXS50eXBlID0gXCJmaWxlXCI7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCBlLnRhcmdldC5yZXN1bHQgKTsgXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbGFiZWw6IGZ1bmN0aW9uICggc3RyaW5nLCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuY1tuXS50ZXh0Q29udGVudCA9IHN0cmluZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGljb246IGZ1bmN0aW9uICggc3RyaW5nLCB5LCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuc1tuXS5wYWRkaW5nID0gKCB5IHx8IDAgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5jW25dLmlubmVySFRNTCA9IHN0cmluZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG4gICAgICAgIHZhciB3ID0gdGhpcy5zYjtcclxuICAgICAgICB2YXIgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgdmFyIGRjID0gIDM7XHJcbiAgICAgICAgdmFyIHNpemUgPSBNYXRoLmZsb29yKCAoIHctKGRjKihpLTEpKSApIC8gaSApO1xyXG5cclxuICAgICAgICB3aGlsZShpLS0pe1xyXG5cclxuICAgICAgICBcdHRoaXMudG1wW2ldID0gWyBNYXRoLmZsb29yKCBkICsgKCBzaXplICogaSApICsgKCBkYyAqIGkgKSksIHNpemUgXTtcclxuICAgICAgICBcdHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXTtcclxuICAgICAgICAgICAgc1tpKzJdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCc7XHJcbiAgICAgICAgICAgIHNbaSsyXS53aWR0aCA9IHRoaXMudG1wW2ldWzFdICsgJ3B4JztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKXsgXHJcbiAgICAgICAgICAgIHNbNF0ubGVmdCA9IChkK3NpemUrZGMpICsgJ3B4JztcclxuICAgICAgICAgICAgc1s0XS53aWR0aCA9IHNpemUgKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNMb2FkQnV0dG9uICl7XHJcbiAgICAgICAgICAgIHNbM10ubGVmdCA9IGQgKyAncHgnO1xyXG4gICAgICAgICAgICBzWzNdLndpZHRoID0gc2l6ZSArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IEJ1dHRvbiB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5mdW5jdGlvbiBDaXJjdWxhciAoIG8gKSB7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIC8vdGhpcy50eXBlID0gJ2NpcmN1bGFyJztcclxuICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5idXR0b25Db2xvciA9IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcbiAgICB0aGlzLnJhZGl1cyA9IHRoaXMudyAqIDAuNTsvL01hdGguZmxvb3IoKHRoaXMudy0yMCkqMC41KTtcclxuXHJcblxyXG4gICAgLy90aGlzLnd3ID0gdGhpcy5yYWRpdXMgKiAyO1xyXG5cclxuICAgLy8gdGhpcy5oID0gdGhpcy5oZWlnaHQgKyA0MDtcclxuXHJcblxyXG5cclxuICAgIHRoaXMudHdvUGkgPSBNYXRoLlBJICogMjtcclxuICAgIHRoaXMucGk5MCA9IE1hdGguUEkgKiAwLjU7XHJcblxyXG4gICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuXHJcbiAgICB0aGlzLmggPSBvLmggfHwgdGhpcy53ICsgMTA7XHJcbiAgICB0aGlzLnRvcCA9IDA7XHJcblxyXG4gICAgdGhpcy5jWzBdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG5cclxuICAgIGlmKHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICB0aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucGVyY2VudCA9IDA7XHJcblxyXG4gICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6Jyt0aGlzLncrJ3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgdGhpcy5jWzNdID0gdGhpcy5nZXRDaXJjdWxhcigpO1xyXG5cclxuICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAxICk7XHJcbiAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5mb250Q29sb3IsIDEgKTtcclxuXHJcbiAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLncrJyAnK3RoaXMudyApO1xyXG4gICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLncsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbn1cclxuXHJcbkNpcmN1bGFyLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IENpcmN1bGFyLFxyXG5cclxuICAgIG1vZGU6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY21vZGUgPT09IG1vZGUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIHN3aXRjaCggbW9kZSApe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC4xKScsIDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuY29sb3JQbHVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC4zKScsIDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuY29sb3JQbHVzLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IG1vZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2VuZEVuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoMCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLm9sZHIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICAvL3RoaXMubW9kZSgxKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIG9mZiA9IHRoaXMub2Zmc2V0O1xyXG5cclxuICAgICAgICBvZmYueCA9IHRoaXMucmFkaXVzIC0gKGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgb2ZmLnkgPSB0aGlzLnJhZGl1cyAtIChlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wICk7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IG9mZi5hbmdsZSgpIC0gdGhpcy5waTkwO1xyXG4gICAgICAgIHRoaXMuciA9ICgoKHRoaXMuciV0aGlzLnR3b1BpKSt0aGlzLnR3b1BpKSV0aGlzLnR3b1BpKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub2xkciAhPT0gbnVsbCApeyBcclxuXHJcbiAgICAgICAgICAgIHZhciBkaWYgPSB0aGlzLnIgLSB0aGlzLm9sZHI7XHJcbiAgICAgICAgICAgIHRoaXMuciA9IE1hdGguYWJzKGRpZikgPiBNYXRoLlBJID8gdGhpcy5vbGRyIDogdGhpcy5yO1xyXG5cclxuICAgICAgICAgICAgaWYoIGRpZiA+IDYgKSB0aGlzLnIgPSAwO1xyXG4gICAgICAgICAgICBpZiggZGlmIDwgLTYgKSB0aGlzLnIgPSB0aGlzLnR3b1BpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzdGVwcyA9IDEgLyB0aGlzLnR3b1BpO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IHRoaXMuciAqIHN0ZXBzO1xyXG5cclxuICAgICAgICB2YXIgbiA9ICggKCB0aGlzLnJhbmdlICogdmFsdWUgKSArIHRoaXMubWluICkgLSB0aGlzLm9sZDtcclxuXHJcbiAgICAgICAgaWYobiA+PSB0aGlzLnN0ZXAgfHwgbiA8PSB0aGlzLnN0ZXApeyBcclxuICAgICAgICAgICAgbiA9IH5+ICggbiAvIHRoaXMuc3RlcCApO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMub2xkciA9IHRoaXMucjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlUGF0aDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgciA9IDQwO1xyXG4gICAgICAgIHZhciBkID0gMjQ7XHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLnBlcmNlbnQgKiB0aGlzLnR3b1BpIC0gMC4wMDE7XHJcbiAgICAgICAgdmFyIHgyID0gKHIgKyByICogTWF0aC5zaW4oYSkpICsgZDtcclxuICAgICAgICB2YXIgeTIgPSAociAtIHIgKiBNYXRoLmNvcyhhKSkgKyBkO1xyXG4gICAgICAgIHZhciBiaWcgPSBhID4gTWF0aC5QSSA/IDEgOiAwO1xyXG4gICAgICAgIHJldHVybiBcIk0gXCIgKyAocitkKSArIFwiLFwiICsgZCArIFwiIEEgXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCBcIiArIGJpZyArIFwiIDEgXCIgKyB4MiArIFwiLFwiICsgeTI7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICggdXAgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gKCB0aGlzLnZhbHVlIC0gdGhpcy5taW4gKSAvIHRoaXMucmFuZ2U7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAxICk7XHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgQ2lyY3VsYXIgfTsiLCJpbXBvcnQgeyBUb29scyB9IGZyb20gJy4uL2NvcmUvVG9vbHMnO1xyXG5pbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZnVuY3Rpb24gQ29sb3IgKCBvICkge1xyXG4gICAgXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG4gICAgLy90aGlzLmF1dG9IZWlnaHQgPSB0cnVlO1xyXG5cclxuICAgIHRoaXMuY3R5cGUgPSBvLmN0eXBlIHx8ICdhcnJheSc7XHJcblxyXG4gICAgdGhpcy53Zml4ZSA9IHRoaXMuc2IgPiAyNTYgPyAyNTYgOiB0aGlzLnNiO1xyXG5cclxuICAgIC8vIGNvbG9yIHVwIG9yIGRvd25cclxuICAgIHRoaXMuc2lkZSA9IG8uc2lkZSB8fCAnZG93bic7XHJcbiAgICB0aGlzLnVwID0gdGhpcy5zaWRlID09PSAnZG93bicgPyAwIDogMTtcclxuICAgIFxyXG4gICAgdGhpcy5iYXNlSCA9IHRoaXMuaDtcclxuXHJcbiAgICB0aGlzLm9mZnNldCA9IG5ldyBWMigpO1xyXG4gICAgdGhpcy5kZWNhbCA9IG5ldyBWMigpO1xyXG5cclxuICAgIHRoaXMucGk5MCA9IE1hdGguUEkgKiAwLjU7XHJcblxyXG4gICAgLy90aGlzLmNbMF0uc3R5bGUuYmFja2dyb3VuZCA9ICcjRkYwMDAwJ1xyXG5cclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgIHRoaXMuY3NzLnR4dCArICdoZWlnaHQ6JysodGhpcy5oLTQpKydweDsnICsgJ2JvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC04KSsncHg7JyApO1xyXG4gICAgdGhpcy5zWzJdID0gdGhpcy5jWzJdLnN0eWxlO1xyXG5cclxuICAgIGlmKCB0aGlzLnVwICl7XHJcbiAgICAgICAgdGhpcy5zWzJdLnRvcCA9ICdhdXRvJztcclxuICAgICAgICB0aGlzLnNbMl0uYm90dG9tID0gJzJweCc7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jWzNdID0gdGhpcy5nZXRDb2xvclJpbmcoKTtcclxuICAgIHRoaXMuY1szXS5zdHlsZS52aXNpYmlsaXR5ICA9ICdoaWRkZW4nO1xyXG5cclxuICAgIHRoaXMuaHNsID0gbnVsbDtcclxuICAgIHRoaXMudmFsdWUgPSAnI2ZmZmZmZic7XHJcbiAgICBpZiggby52YWx1ZSAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgaWYoIG8udmFsdWUgaW5zdGFuY2VvZiBBcnJheSApIHRoaXMudmFsdWUgPSBUb29scy5yZ2JUb0hleCggby52YWx1ZSApO1xyXG4gICAgICAgIGVsc2UgaWYoIWlzTmFOKG8udmFsdWUpKSB0aGlzLnZhbHVlID0gVG9vbHMuaGV4VG9IdG1sKCBvLnZhbHVlICk7XHJcbiAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gby52YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmJjb2xvciA9IG51bGw7XHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuc2V0Q29sb3IoIHRoaXMudmFsdWUgKTtcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICBpZiggby5vcGVuICE9PSB1bmRlZmluZWQgKSB0aGlzLm9wZW4oKTtcclxuXHJcbn1cclxuXHJcbkNvbG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IENvbG9yLFxyXG5cclxuXHR0ZXN0Wm9uZTogZnVuY3Rpb24gKCBteCwgbXkgKSB7XHJcblxyXG5cdFx0dmFyIGwgPSB0aGlzLmxvY2FsO1xyXG5cdFx0aWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcblx0XHRpZiggdGhpcy51cCAmJiB0aGlzLmlzT3BlbiApe1xyXG5cclxuXHRcdFx0aWYoIGwueSA+IHRoaXMud2ZpeGUgKSByZXR1cm4gJ3RpdGxlJztcclxuXHRcdCAgICBlbHNlIHJldHVybiAnY29sb3InO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiggbC55IDwgdGhpcy5iYXNlSCsyICkgcmV0dXJuICd0aXRsZSc7XHJcblx0ICAgIFx0ZWxzZSBpZiggdGhpcy5pc09wZW4gKSByZXR1cm4gJ2NvbG9yJztcclxuXHJcblxyXG5cdFx0fVxyXG5cclxuICAgIH0sXHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdG1vdXNldXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcblx0ICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG5cdH0sXHJcblxyXG5cdG1vdXNlZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuXHJcblx0XHR2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUuY2xpZW50WCwgZS5jbGllbnRZICk7XHJcblxyXG5cclxuXHRcdC8vaWYoICFuYW1lICkgcmV0dXJuO1xyXG5cdFx0aWYobmFtZSA9PT0gJ3RpdGxlJyl7XHJcblx0XHRcdGlmKCAhdGhpcy5pc09wZW4gKSB0aGlzLm9wZW4oKTtcclxuXHQgICAgICAgIGVsc2UgdGhpcy5jbG9zZSgpO1xyXG5cdCAgICAgICAgcmV0dXJuIHRydWU7XHJcblx0XHR9XHJcblxyXG5cclxuXHRcdGlmKCBuYW1lID09PSAnY29sb3InICl7XHJcblx0XHRcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHQvKmRvd246IGZ1bmN0aW9uKCBlICl7XHJcblxyXG5cdCAgICBpZighdGhpcy5pc09wZW4pIHJldHVybjtcclxuXHQgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG5cdCAgICB0aGlzLm1vdmUoIGUgKTtcclxuXHQgICAgLy9yZXR1cm4gZmFsc2U7XHJcblxyXG5cclxuXHR9LCovXHJcblxyXG5cdG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuXHQgICAgdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlLmNsaWVudFgsIGUuY2xpZW50WSApO1xyXG5cclxuXHQgICAgdmFyIG9mZiwgZCwgaHVlLCBzYXQsIGx1bTtcclxuXHJcblx0ICAgIGlmKCBuYW1lID09PSAndGl0bGUnICl7XHJcblxyXG5cdCAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcblx0ICAgIH1cclxuXHJcblx0ICAgIGlmKCBuYW1lID09PSAnY29sb3InICl7XHJcblxyXG5cdCAgICBcdHRoaXMuY3Vyc29yKCdjcm9zc2hhaXInKTtcclxuXHJcblx0ICAgIFx0aWYoIHRoaXMuaXNEb3duICl7XHJcblxyXG5cdCAgICBcdFx0b2ZmID0gdGhpcy5vZmZzZXQ7XHJcblx0XHQgICAgXHRvZmYueCA9IGUuY2xpZW50WCAtICggdGhpcy56b25lLnggKyB0aGlzLmRlY2FsLnggKyB0aGlzLm1pZCApO1xyXG5cdFx0ICAgIFx0b2ZmLnkgPSBlLmNsaWVudFkgLSAoIHRoaXMuem9uZS55ICsgdGhpcy5kZWNhbC55ICsgdGhpcy5taWQgKTtcclxuXHRcdFx0ICAgIGQgPSBvZmYubGVuZ3RoKCkgKiB0aGlzLnJhdGlvO1xyXG5cclxuXHRcdFx0ICAgIGlmICggZCA8IDEyOCApIHtcclxuXHRcdFx0XHQgICAgaWYgKCBkID4gODggKSB7XHJcblxyXG5cdFx0XHRcdCAgICAgICAgaHVlID0gKCBvZmYuYW5nbGUoKSArIHRoaXMucGk5MCApIC8gNi4yODtcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuc2V0SFNMKFsoaHVlICsgMSkgJSAxLCB0aGlzLmhzbFsxXSwgdGhpcy5oc2xbMl1dKTtcclxuXHJcblx0XHRcdFx0ICAgIH0gZWxzZSB7XHJcblxyXG5cclxuXHRcdFx0XHQgICAgXHRzYXQgPSBNYXRoLm1heCggMCwgTWF0aC5taW4oIDEsIDAuNSAtICggb2ZmLnggKiB0aGlzLnNxdWFyZSAqIDAuNSApICkgKTtcclxuXHRcdFx0XHQgICAgICAgIGx1bSA9IE1hdGgubWF4KCAwLCBNYXRoLm1pbiggMSwgMC41IC0gKCBvZmYueSAqIHRoaXMuc3F1YXJlICogMC41ICkgKSApO1xyXG5cdFx0XHRcdCAgICAgICAgdGhpcy5zZXRIU0woW3RoaXMuaHNsWzBdLCBzYXQsIGx1bV0pO1xyXG5cclxuXHRcdFx0XHQgICAgfVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHQgICAgLy9jb25zb2xlLmxvZyh0aGlzLmlzRHJhdylcclxuXHJcblxyXG5cdH0sXHJcblxyXG5cdHNldEhlaWdodDogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHRoaXMuaCA9IHRoaXMuaXNPcGVuID8gdGhpcy53Zml4ZSArIHRoaXMuYmFzZUggKyA1IDogdGhpcy5iYXNlSDtcclxuXHRcdHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cdFx0dGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG5cdH0sXHJcblxyXG5cdHBhcmVudEhlaWdodDogZnVuY3Rpb24gKCB0ICkge1xyXG5cclxuXHRcdGlmICggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApIHRoaXMucGFyZW50R3JvdXAuY2FsYyggdCApO1xyXG5cdCAgICBlbHNlIGlmICggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHQgKTtcclxuXHJcblx0fSxcclxuXHJcblx0b3BlbjogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdFByb3RvLnByb3RvdHlwZS5vcGVuLmNhbGwoIHRoaXMgKTtcclxuXHJcblx0XHR0aGlzLnNldEhlaWdodCgpO1xyXG5cclxuXHRcdGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgLT0gdGhpcy53Zml4ZSArIDU7XHJcblxyXG5cdFx0dmFyIHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuXHQgICAgdGhpcy5zWzNdLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcblx0ICAgIC8vdGhpcy5zWzNdLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cdCAgICB0aGlzLnBhcmVudEhlaWdodCggdCApO1xyXG5cclxuXHR9LFxyXG5cclxuXHRjbG9zZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdFByb3RvLnByb3RvdHlwZS5jbG9zZS5jYWxsKCB0aGlzICk7XHJcblxyXG5cdFx0aWYoIHRoaXMudXAgKSB0aGlzLnpvbmUueSArPSB0aGlzLndmaXhlICsgNTtcclxuXHJcblx0XHR2YXIgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG5cdFx0dGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcblx0ICAgIHRoaXMuc1szXS52aXNpYmlsaXR5ICA9ICdoaWRkZW4nO1xyXG5cdCAgICAvL3RoaXMuc1szXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cdCAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcblx0fSxcclxuXHJcblx0dXBkYXRlOiBmdW5jdGlvbiAoIHVwICkge1xyXG5cclxuXHQgICAgdmFyIGNjID0gVG9vbHMucmdiVG9IZXgoIFRvb2xzLmhzbFRvUmdiKFsgdGhpcy5oc2xbMF0sIDEsIDAuNSBdKSApO1xyXG5cclxuXHQgICAgdGhpcy5tb3ZlTWFya2VycygpO1xyXG5cdCAgICBcclxuXHQgICAgdGhpcy52YWx1ZSA9IHRoaXMuYmNvbG9yO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCBjYywgMiApO1xyXG5cclxuXHQgICAgdGhpcy5zWzJdLmJhY2tncm91bmQgPSB0aGlzLmJjb2xvcjtcclxuXHQgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gVG9vbHMuaHRtbFRvSGV4KCB0aGlzLmJjb2xvciApO1xyXG5cclxuXHQgICAgdGhpcy5pbnZlcnQgPSBUb29scy5maW5kRGVlcEludmVyKCB0aGlzLnJnYiApO1xyXG5cdCAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmludmVydCA/ICcjZmZmJyA6ICcjMDAwJztcclxuXHJcblx0ICAgIGlmKCF1cCkgcmV0dXJuO1xyXG5cclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdhcnJheScgKSB0aGlzLnNlbmQoIHRoaXMucmdiICk7XHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAncmdiJyApIHRoaXMuc2VuZCggVG9vbHMuaHRtbFJnYiggdGhpcy5yZ2IgKSApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ2hleCcgKSB0aGlzLnNlbmQoIFRvb2xzLmh0bWxUb0hleCggdGhpcy52YWx1ZSApICk7XHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAnaHRtbCcgKSB0aGlzLnNlbmQoKTtcclxuXHJcblx0fSxcclxuXHJcblx0c2V0Q29sb3I6IGZ1bmN0aW9uICggY29sb3IgKSB7XHJcblxyXG5cdCAgICB2YXIgdW5wYWNrID0gVG9vbHMudW5wYWNrKGNvbG9yKTtcclxuXHQgICAgaWYgKHRoaXMuYmNvbG9yICE9IGNvbG9yICYmIHVucGFjaykge1xyXG5cdCAgICAgICAgdGhpcy5iY29sb3IgPSBjb2xvcjtcclxuXHQgICAgICAgIHRoaXMucmdiID0gdW5wYWNrO1xyXG5cdCAgICAgICAgdGhpcy5oc2wgPSBUb29scy5yZ2JUb0hzbCggdGhpcy5yZ2IgKTtcclxuXHQgICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblx0ICAgIH1cclxuXHQgICAgcmV0dXJuIHRoaXM7XHJcblxyXG5cdH0sXHJcblxyXG5cdHNldEhTTDogZnVuY3Rpb24gKCBoc2wgKSB7XHJcblxyXG5cdCAgICB0aGlzLmhzbCA9IGhzbDtcclxuXHQgICAgdGhpcy5yZ2IgPSBUb29scy5oc2xUb1JnYiggaHNsICk7XHJcblx0ICAgIHRoaXMuYmNvbG9yID0gVG9vbHMucmdiVG9IZXgoIHRoaXMucmdiICk7XHJcblx0ICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcblx0ICAgIHJldHVybiB0aGlzO1xyXG5cclxuXHR9LFxyXG5cclxuXHRtb3ZlTWFya2VyczogZnVuY3Rpb24gKCkge1xyXG5cclxuXHQgICAgdmFyIHNyID0gNjBcclxuXHQgICAgdmFyIHJhID0gMTI4LTIwOyBcclxuXHQgICAgdmFyIGMxID0gdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCc7XHJcblx0ICAgIHZhciBhID0gdGhpcy5oc2xbMF0gKiA2LjI4O1xyXG5cclxuXHQgICAgdmFyIHAgPSBuZXcgVjIoIE1hdGguc2luKGEpICogcmEsIC1NYXRoLmNvcyhhKSAqIHJhICkuYWRkU2NhbGFyKDEyOCk7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCBwLngsIDUgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgcC55LCA1ICk7XHJcblx0ICAgIFxyXG5cdCAgICBwLnNldCggMiAqIHNyICogKC41IC0gdGhpcy5oc2xbMV0pLCAyICogc3IgKiAoLjUgLSB0aGlzLmhzbFsyXSkgKS5hZGRTY2FsYXIoMTI4KTtcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHAueCwgNiApO1xyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCBwLnksIDYgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIGMxLCA2ICk7XHJcblxyXG5cdH0sXHJcblxyXG5cdHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdCAgICBQcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG5cclxuXHQgICAgdmFyIHMgPSB0aGlzLnM7XHJcblxyXG5cdCAgICBzWzJdLndpZHRoID0gdGhpcy5zYiArICdweCc7XHJcblx0ICAgIHNbMl0ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG5cclxuXHQgICAgdGhpcy5kZWNhbC54ID0gTWF0aC5mbG9vcigodGhpcy53IC0gdGhpcy53Zml4ZSkgKiAwLjUpO1xyXG5cdCAgICB0aGlzLmRlY2FsLnkgPSB0aGlzLnNpZGUgPT09ICd1cCcgPyAyIDogdGhpcy5iYXNlSCArIDI7XHJcblx0ICAgIHRoaXMubWlkID0gTWF0aC5mbG9vciggdGhpcy53Zml4ZSAqIDAuNSApO1xyXG5cclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnK3RoaXMud2ZpeGUrJyAnK3RoaXMud2ZpeGUgKTtcclxuXHQgICAgc1szXS53aWR0aCA9IHRoaXMud2ZpeGUgKyAncHgnO1xyXG5cdCAgICBzWzNdLmhlaWdodCA9IHRoaXMud2ZpeGUgKyAncHgnO1xyXG4gICAgXHRzWzNdLmxlZnQgPSB0aGlzLmRlY2FsLnggKyAncHgnO1xyXG5cdCAgICBzWzNdLnRvcCA9IHRoaXMuZGVjYWwueSArICdweCc7XHJcblxyXG5cdCAgIC8qIHRoaXMuY1s0XS53aWR0aCA9IHRoaXMuY1s0XS5oZWlnaHQgPSB0aGlzLnd3O1xyXG5cdCAgICBzWzRdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuXHQgICAgc1s0XS50b3AgPSB0aGlzLmRlY2FsICsgJ3B4JztcclxuXHJcblx0ICAgIHRoaXMuY1s1XS53aWR0aCA9IHRoaXMuY1s1XS5oZWlnaHQgPSB0aGlzLnd3O1xyXG5cdCAgICBzWzVdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuXHQgICAgc1s1XS50b3AgPSB0aGlzLmRlY2FsICsgJ3B4JztcclxuXHJcblx0ICAgIHRoaXMuY3R4TWFzay50cmFuc2xhdGUodGhpcy5taWQsIHRoaXMubWlkKTtcclxuXHQgICAgdGhpcy5jdHhPdmVybGF5LnRyYW5zbGF0ZSh0aGlzLm1pZCwgdGhpcy5taWQpO1xyXG5cclxuXHQgICAgaWYoIHRoaXMuaXNPcGVuICl7IFxyXG5cdCAgICAgICAgdGhpcy5yZWRyYXcoKTtcclxuXHJcblx0ICAgICAgICAvL3RoaXMub3BlbigpO1xyXG5cdCAgICAgICAgLy90aGlzLmggPSB0aGlzLnd3KzMwO1xyXG5cdCAgICAgICAgLy90aGlzLmNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHQgICAgICAgIC8vaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCk7XHJcblx0ICAgIH0qL1xyXG5cclxuXHJcblx0ICAgIHRoaXMucmF0aW8gPSAyNTYvdGhpcy53Zml4ZTtcclxuXHQgICAgdGhpcy5zcXVhcmUgPSAxIC8gKDYwKih0aGlzLndmaXhlLzI1NikpO1xyXG5cdCAgICBcclxuXHQgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHQgICAgXHJcblx0fVxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgQ29sb3IgfTsiLCJpbXBvcnQgeyBSb290cyB9IGZyb20gJy4uL2NvcmUvUm9vdHMnO1xyXG5pbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZnVuY3Rpb24gRnBzICggbyApIHtcclxuXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG4gICAgdGhpcy5yb3VuZCA9IE1hdGgucm91bmQ7XHJcblxyXG4gICAgdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG4gICAgdGhpcy5ocGx1cyA9IG8uaHBsdXMgfHwgNTA7XHJcblxyXG4gICAgdGhpcy5yZXMgPSBvLnJlcyB8fCA0MDtcclxuICAgIHRoaXMubCA9IDE7XHJcblxyXG4gICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiB8fCAwO1xyXG4gICAgXHJcblxyXG4gICAgdGhpcy5jdXN0b20gPSBvLmN1c3RvbSB8fCBmYWxzZTtcclxuICAgIHRoaXMubmFtZXMgPSBvLm5hbWVzIHx8IFsnRlBTJywgJ01TJ107XHJcbiAgICB2YXIgY2MgPSBvLmNjIHx8IFsnOTAsOTAsOTAnLCAnMjU1LDI1NSwwJ107XHJcblxyXG4gICAvLyB0aGlzLmRpdmlkID0gWyAxMDAsIDEwMCwgMTAwIF07XHJcbiAgIC8vIHRoaXMubXVsdHkgPSBbIDMwLCAzMCwgMzAgXTtcclxuXHJcbiAgICB0aGlzLmFkZGluZyA9IG8uYWRkaW5nIHx8IGZhbHNlO1xyXG5cclxuICAgIHRoaXMucmFuZ2UgPSBvLnJhbmdlIHx8IFsgMTY1LCAxMDAsIDEwMCBdO1xyXG5cclxuICAgIHRoaXMuYWxwaGEgPSBvLmFscGhhIHx8IDAuMjU7XHJcblxyXG4gICAgdGhpcy52YWx1ZXMgPSBbXTtcclxuICAgIHRoaXMucG9pbnRzID0gW107XHJcbiAgICB0aGlzLnRleHREaXNwbGF5ID0gW107XHJcblxyXG4gICAgaWYoIXRoaXMuY3VzdG9tKXtcclxuXHJcbiAgICAgICAgdGhpcy5ub3cgPSAoIHNlbGYucGVyZm9ybWFuY2UgJiYgc2VsZi5wZXJmb3JtYW5jZS5ub3cgKSA/IHNlbGYucGVyZm9ybWFuY2Uubm93LmJpbmQoIHBlcmZvcm1hbmNlICkgOiBEYXRlLm5vdztcclxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IDA7Ly90aGlzLm5vdygpXHJcbiAgICAgICAgdGhpcy5wcmV2VGltZSA9IDA7Ly90aGlzLnN0YXJ0VGltZTtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMubXMgPSAwO1xyXG4gICAgICAgIHRoaXMuZnBzID0gMDtcclxuICAgICAgICB0aGlzLm1lbSA9IDA7XHJcbiAgICAgICAgdGhpcy5tbSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuaXNNZW0gPSAoIHNlbGYucGVyZm9ybWFuY2UgJiYgc2VsZi5wZXJmb3JtYW5jZS5tZW1vcnkgKSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAvLyB0aGlzLmRpdmlkID0gWyAxMDAsIDIwMCwgMSBdO1xyXG4gICAgICAgLy8gdGhpcy5tdWx0eSA9IFsgMzAsIDMwLCAzMCBdO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc01lbSApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5uYW1lcy5wdXNoKCdNRU0nKTtcclxuICAgICAgICAgICAgY2MucHVzaCgnMCwyNTUsMjU1Jyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50eHQgPSAnRlBTJ1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgdmFyIGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS02O1xyXG5cclxuICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHRoaXMudHh0O1xyXG4gICAgdGhpcy5jWzBdLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgIHRoaXMuY1swXS5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xyXG5cclxuICAgIHZhciBwYW5lbENzcyA9ICdkaXNwbGF5Om5vbmU7IGxlZnQ6MTBweDsgdG9wOicrIHRoaXMuaCArICdweDsgaGVpZ2h0OicrKHRoaXMuaHBsdXMgLSA4KSsncHg7IGJveC1zaXppbmc6Ym9yZGVyLWJveDsgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjIpOyBib3JkZXI6JyArICh0aGlzLmNvbG9ycy5ncm91cEJvcmRlciAhPT0gJ25vbmUnPyB0aGlzLmNvbG9ycy5ncm91cEJvcmRlcisnOycgOiAnMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTsnKTtcclxuXHJcbiAgICBpZiggdGhpcy5yYWRpdXMgIT09IDAgKSBwYW5lbENzcyArPSAnYm9yZGVyLXJhZGl1czonICsgdGhpcy5yYWRpdXMrJ3B4Oyc7IFxyXG5cclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgcGFuZWxDc3MgLCB7fSApO1xyXG5cclxuICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy5yZXMrJyA1MCcgKTtcclxuICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsICcxMDAlJyApO1xyXG4gICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCAnMTAwJScgKTtcclxuICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAnbm9uZScgKTtcclxuXHJcblxyXG4gICAgLy90aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoMjU1LDI1NSwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6JyNGRjAnLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAvL3RoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgwLDI1NSwyNTUsMC4zKScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTonIzBGRicsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgIFxyXG4gICAgLy8gYXJyb3dcclxuICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxMHB4OyBoZWlnaHQ6MTBweDsgbGVmdDo0cHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmFycm93LCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgLy8gcmVzdWx0IHRlc3RcclxuICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3Bvc2l0aW9uOmFic29sdXRlOyBsZWZ0OjEwcHg7IHRvcDonKyh0aGlzLmgrMikgKydweDsgZGlzcGxheTpub25lOyB3aWR0aDoxMDAlOyB0ZXh0LWFsaWduOmNlbnRlcjsnICk7XHJcblxyXG4gICAgLy8gYm90dG9tIGxpbmVcclxuICAgIGlmKCBvLmJvdHRvbUxpbmUgKSB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IGJvdHRvbTowcHg7IGhlaWdodDoxcHg7IGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTsnKTtcclxuXHJcbiAgICB0aGlzLmlzU2hvdyA9IGZhbHNlO1xyXG5cclxuICAgIHZhciBzID0gdGhpcy5zO1xyXG5cclxuICAgIHNbMV0ubWFyZ2luTGVmdCA9ICcxMHB4JztcclxuICAgIHNbMV0ubGluZUhlaWdodCA9IHRoaXMuaC00O1xyXG4gICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgc1sxXS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG5cclxuICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApICBzWzBdLmJvcmRlclJhZGl1cyA9IHRoaXMucmFkaXVzKydweCc7IFxyXG4gICAgc1swXS5ib3JkZXIgPSB0aGlzLmNvbG9ycy5ncm91cEJvcmRlcjtcclxuXHJcbiAgICBcclxuXHJcblxyXG4gICAgZm9yKCB2YXIgaj0wOyBqPHRoaXMubmFtZXMubGVuZ3RoOyBqKysgKXtcclxuXHJcbiAgICAgICAgdmFyIGJhc2UgPSBbXTtcclxuICAgICAgICB2YXIgaSA9IHRoaXMucmVzKzE7XHJcbiAgICAgICAgd2hpbGUoIGktLSApIGJhc2UucHVzaCg1MCk7XHJcblxyXG4gICAgICAgIHRoaXMucmFuZ2Vbal0gPSAoIDEgLyB0aGlzLnJhbmdlW2pdICkgKiA0OTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnBvaW50cy5wdXNoKCBiYXNlICk7XHJcbiAgICAgICAgdGhpcy52YWx1ZXMucHVzaCgwKTtcclxuICAgICAgIC8vICB0aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoJytjY1tqXSsnLDAuNSknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6J3JnYmEoJytjY1tqXSsnLDEpJywgJ3ZlY3Rvci1lZmZlY3QnOidub24tc2NhbGluZy1zdHJva2UnIH0sIHRoaXMuY1syXSApO1xyXG4gICAgICAgIHRoaXMudGV4dERpc3BsYXkucHVzaCggXCI8c3BhbiBzdHlsZT0nY29sb3I6cmdiKFwiK2NjW2pdK1wiKSc+IFwiICsgdGhpcy5uYW1lc1tqXSArXCIgXCIpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBqID0gdGhpcy5uYW1lcy5sZW5ndGg7XHJcbiAgICB3aGlsZShqLS0pe1xyXG4gICAgICAgIHRoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgnK2NjW2pdKycsJyt0aGlzLmFscGhhKycpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOidyZ2JhKCcrY2Nbal0rJywxKScsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgLy9pZiggdGhpcy5pc1Nob3cgKSB0aGlzLnNob3coKTtcclxuXHJcbn07XHJcblxyXG5cclxuRnBzLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IEZwcyxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1Nob3cgKSB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm9wZW4oKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvKm1vZGU6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICAvL3NbMV0uYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgc1sxXS5jb2xvciA9ICcjRkZGJztcclxuICAgICAgICAgICAgICAgIC8vc1sxXS5iYWNrZ3JvdW5kID0gVUlMLlNFTEVDVDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdCAvIGRvd25cclxuICAgICAgICAgICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIC8vc1sxXS5iYWNrZ3JvdW5kID0gVUlMLlNFTEVDVERPV047XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9LCovXHJcblxyXG4gICAgdGljazogZnVuY3Rpb24gKCB2ICl7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gdjtcclxuICAgICAgICBpZiggIXRoaXMuaXNTaG93ICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZHJhd0dyYXBoKCk7XHJcbiAgICAgICAgdGhpcy51cFRleHQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VQYXRoOiBmdW5jdGlvbiAoIHBvaW50ICkge1xyXG5cclxuICAgICAgICB2YXIgcCA9ICcnO1xyXG4gICAgICAgIHAgKz0gJ00gJyArICgtMSkgKyAnICcgKyA1MDtcclxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnJlcyArIDE7IGkgKysgKSB7IHAgKz0gJyBMICcgKyBpICsgJyAnICsgcG9pbnRbaV07IH1cclxuICAgICAgICBwICs9ICcgTCAnICsgKHRoaXMucmVzICsgMSkgKyAnICcgKyA1MDtcclxuICAgICAgICByZXR1cm4gcDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwVGV4dDogZnVuY3Rpb24oIHZhbCApe1xyXG5cclxuICAgICAgICB2YXIgdiA9IHZhbCB8fCB0aGlzLnZhbHVlcywgdCA9ICcnO1xyXG4gICAgICAgIGZvciggdmFyIGo9MCwgbG5nID10aGlzLm5hbWVzLmxlbmd0aDsgajxsbmc7IGorKyApIHQgKz0gdGhpcy50ZXh0RGlzcGxheVtqXSArICh2W2pdKS50b0ZpeGVkKHRoaXMucHJlY2lzaW9uKSArICc8L3NwYW4+JztcclxuICAgICAgICB0aGlzLmNbNF0uaW5uZXJIVE1MID0gdDtcclxuICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3R3JhcGg6IGZ1bmN0aW9uKCApe1xyXG5cclxuICAgICAgICB2YXIgc3ZnID0gdGhpcy5jWzJdO1xyXG4gICAgICAgIHZhciBpID0gdGhpcy5uYW1lcy5sZW5ndGgsIHYsIG9sZCA9IDAsIG4gPSAwO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmFkZGluZyApIHYgPSAodGhpcy52YWx1ZXNbbl0rb2xkKSAqIHRoaXMucmFuZ2Vbbl07XHJcbiAgICAgICAgICAgIGVsc2UgIHYgPSAodGhpcy52YWx1ZXNbbl0gKiB0aGlzLnJhbmdlW25dKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludHNbbl0uc2hpZnQoKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludHNbbl0ucHVzaCggNTAgLSB2ICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCBzdmcsICdkJywgdGhpcy5tYWtlUGF0aCggdGhpcy5wb2ludHNbbl0gKSwgaSsxICk7XHJcbiAgICAgICAgICAgIG9sZCArPSB0aGlzLnZhbHVlc1tuXTtcclxuICAgICAgICAgICAgbisrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBvcGVuOiBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUub3Blbi5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuaHBsdXMgKyB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMuc3Zncy5hcnJvd0Rvd24gKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKXsgdGhpcy5wYXJlbnRHcm91cC5jYWxjKCB0aGlzLmhwbHVzICk7fVxyXG4gICAgICAgIGVsc2UgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB0aGlzLmhwbHVzICk7XHJcblxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKydweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmRpc3BsYXkgPSAnYmxvY2snOyBcclxuICAgICAgICB0aGlzLnNbNF0uZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgdGhpcy5pc1Nob3cgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VzdG9tICkgUm9vdHMuYWRkTGlzdGVuKCB0aGlzICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9zZTogZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLmNsb3NlLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3cgKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKXsgdGhpcy5wYXJlbnRHcm91cC5jYWxjKCAtdGhpcy5ocGx1cyApO31cclxuICAgICAgICBlbHNlIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggLXRoaXMuaHBsdXMgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc1s0XS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuaXNTaG93ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXN0b20gKSBSb290cy5yZW1vdmVMaXN0ZW4oIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzRdLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgLy8vLy8gQVVUTyBGUFMgLy8vLy8vXHJcblxyXG4gICAgYmVnaW46IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5ub3coKTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgZW5kOiBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICB2YXIgdGltZSA9IHRoaXMubm93KCk7XHJcbiAgICAgICAgdGhpcy5tcyA9IHRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgKys7XHJcblxyXG4gICAgICAgIGlmICggdGltZSA+IHRoaXMucHJldlRpbWUgKyAxMDAwICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mcHMgPSB0aGlzLnJvdW5kKCAoIHRoaXMuZnJhbWVzICogMTAwMCApIC8gKCB0aW1lIC0gdGhpcy5wcmV2VGltZSApICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZXZUaW1lID0gdGltZTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZXMgPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKCB0aGlzLmlzTWVtICkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBoZWFwU2l6ZSA9IHBlcmZvcm1hbmNlLm1lbW9yeS51c2VkSlNIZWFwU2l6ZTtcclxuICAgICAgICAgICAgICAgIHZhciBoZWFwU2l6ZUxpbWl0ID0gcGVyZm9ybWFuY2UubWVtb3J5LmpzSGVhcFNpemVMaW1pdDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbSA9IHRoaXMucm91bmQoIGhlYXBTaXplICogMC4wMDAwMDA5NTQgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubW0gPSBoZWFwU2l6ZSAvIGhlYXBTaXplTGltaXQ7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbIHRoaXMuZnBzLCB0aGlzLm1zICwgdGhpcy5tbSBdO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdHcmFwaCgpO1xyXG4gICAgICAgIHRoaXMudXBUZXh0KCBbIHRoaXMuZnBzLCB0aGlzLm1zLCB0aGlzLm1lbSBdICk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbGlzdGVuaW5nOiBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VzdG9tICkgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmVuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICByU2l6ZTogZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgdmFyIHcgPSB0aGlzLnc7XHJcblxyXG4gICAgICAgIHNbMF0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzFdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gMTAgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAody0yMCkgKyAncHgnO1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSAody0yMCkgKyAncHgnO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuICAgIFxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBGcHMgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZnVuY3Rpb24gR3JhcGggKCBvICkge1xyXG5cclxuXHRQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG5cdHRoaXMudmFsdWUgPSBvLnZhbHVlICE9PSB1bmRlZmluZWQgPyBvLnZhbHVlIDogWzAsMCwwXTtcclxuICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcblxyXG4gICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiAhPT0gdW5kZWZpbmVkID8gby5wcmVjaXNpb24gOiAyO1xyXG4gICAgdGhpcy5tdWx0aXBsaWNhdG9yID0gby5tdWx0aXBsaWNhdG9yIHx8IDE7XHJcbiAgICB0aGlzLm5lZyA9IG8ubmVnIHx8IGZhbHNlO1xyXG5cclxuICAgIHRoaXMubGluZSA9IG8ubGluZSAhPT0gdW5kZWZpbmVkID8gIG8ubGluZSA6IHRydWU7XHJcblxyXG4gICAgLy9pZih0aGlzLm5lZyl0aGlzLm11bHRpcGxpY2F0b3IqPTI7XHJcblxyXG4gICAgdGhpcy5hdXRvV2lkdGggPSBvLmF1dG9XaWR0aCAhPT0gdW5kZWZpbmVkID8gby5hdXRvV2lkdGggOiB0cnVlO1xyXG4gICAgdGhpcy5pc051bWJlciA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5oID0gby5oIHx8IDEyOCArIDEwO1xyXG4gICAgdGhpcy5yaCA9IHRoaXMuaCAtIDEwO1xyXG4gICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB7IC8vIHdpdGggdGl0bGVcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vdGhpcy5jWzFdLnN0eWxlLmJhY2tncm91bmQgPSAnI2ZmMDAwMCc7XHJcbiAgICAgICAgLy90aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZ2ggPSB0aGlzLnJoIC0gMjg7XHJcbiAgICB0aGlzLmd3ID0gdGhpcy53IC0gMjg7XHJcblxyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6Jyt0aGlzLncrJ3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB2YXIgc3ZnID0gdGhpcy5kb20oICdzdmcnLCB0aGlzLmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdGhpcy53KycgJyt0aGlzLnJoLCB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLnJoLCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICB0aGlzLnNldENzcyggc3ZnLCB7IHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMucmgsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuICAgIHRoaXMuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTp0aGlzLmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzoyLCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7XHJcbiAgICB0aGlzLmRvbSggJ3JlY3QnLCAnJywgeyB4OjEwLCB5OjEwLCB3aWR0aDp0aGlzLmd3KzgsIGhlaWdodDp0aGlzLmdoKzgsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MSAsIGZpbGw6J25vbmUnfSwgc3ZnICk7XHJcblxyXG4gICAgdGhpcy5pdyA9ICgodGhpcy5ndy0oNCoodGhpcy5sbmctMSkpKS90aGlzLmxuZyk7XHJcbiAgICB2YXIgdCA9IFtdO1xyXG4gICAgdGhpcy5jTW9kZSA9IFtdO1xyXG5cclxuICAgIHRoaXMudiA9IFtdO1xyXG5cclxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgIFx0dFtpXSA9IFsgMTQgKyAoaSp0aGlzLml3KSArIChpKjQpLCB0aGlzLml3IF07XHJcbiAgICBcdHRbaV1bMl0gPSB0W2ldWzBdICsgdFtpXVsxXTtcclxuICAgIFx0dGhpcy5jTW9kZVtpXSA9IDA7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm5lZyApIHRoaXMudltpXSA9ICgoMSsodGhpcy52YWx1ZVtpXSAvIHRoaXMubXVsdGlwbGljYXRvcikpKjAuNSk7XHJcbiAgICBcdGVsc2UgdGhpcy52W2ldID0gdGhpcy52YWx1ZVtpXSAvIHRoaXMubXVsdGlwbGljYXRvcjtcclxuXHJcbiAgICBcdHRoaXMuZG9tKCAncmVjdCcsICcnLCB7IHg6dFtpXVswXSwgeToxNCwgd2lkdGg6dFtpXVsxXSwgaGVpZ2h0OjEsIGZpbGw6dGhpcy5mb250Q29sb3IsICdmaWxsLW9wYWNpdHknOjAuMyB9LCBzdmcgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50bXAgPSB0O1xyXG4gICAgdGhpcy5jWzNdID0gc3ZnO1xyXG5cclxuICAgIC8vY29uc29sZS5sb2codGhpcy53KVxyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgIHRoaXMuY1sxXS5zdHlsZS50b3AgPSAwICsncHgnO1xyXG4gICAgICAgIHRoaXMuY1sxXS5zdHlsZS5oZWlnaHQgPSAyMCArJ3B4JztcclxuICAgICAgICB0aGlzLnNbMV0ubGluZUhlaWdodCA9ICgyMC01KSsncHgnXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy51cGRhdGUoIGZhbHNlICk7XHJcblxyXG59XHJcblxyXG5HcmFwaC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBHcmFwaCxcclxuXHJcbiAgICB1cGRhdGVTVkc6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubGluZSApIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAwICk7XHJcblxyXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGk8dGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdoZWlnaHQnLCB0aGlzLnZbaV0qdGhpcy5naCwgaSsyICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd5JywgMTQgKyAodGhpcy5naCAtIHRoaXMudltpXSp0aGlzLmdoKSwgaSsyICk7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLm5lZyApIHRoaXMudmFsdWVbaV0gPSAoICgodGhpcy52W2ldKjIpLTEpICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy52YWx1ZVtpXSA9ICggKHRoaXMudltpXSAqIHRoaXMubXVsdGlwbGljYXRvcikgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdGVzdFpvbmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuXHQgICAgaWYoIGwueT50aGlzLnRvcCAmJiBsLnk8dGhpcy5oLTIwICl7XHJcblx0ICAgICAgICB3aGlsZSggaS0tICl7XHJcblx0ICAgICAgICAgICAgaWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGk7XHJcblx0ICAgICAgICB9XHJcblx0ICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb2RlOiBmdW5jdGlvbiAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgXHRpZiggbiA9PT0gdGhpcy5jTW9kZVtuYW1lXSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdHZhciBhO1xyXG5cclxuICAgICAgICBzd2l0Y2gobil7XHJcbiAgICAgICAgICAgIGNhc2UgMDogYT0wLjM7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IGE9MC42OyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiBhPTE7IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbC1vcGFjaXR5JywgYSwgbmFtZSArIDIgKTtcclxuICAgICAgICB0aGlzLmNNb2RlW25hbWVdID0gbjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG5cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBcdHZhciBudXAgPSBmYWxzZTtcclxuICAgICAgICAvL3RoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmNNb2RlW2ldICE9PSAwICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNNb2RlW2ldID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsLW9wYWNpdHknLCAwLjMsIGkgKyAyICk7XHJcbiAgICAgICAgICAgICAgICBudXAgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2V1cDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICkgcmV0dXJuIHRoaXMucmVzZXQoKTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICBcdHZhciBudXAgPSBmYWxzZTtcclxuXHJcbiAgICBcdHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZShlKTtcclxuXHJcbiAgICBcdGlmKCBuYW1lID09PSAnJyApe1xyXG5cclxuICAgICAgICAgICAgbnVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgICAgICAvL3RoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7IFxyXG5cclxuICAgICAgICAgICAgbnVwID0gdGhpcy5tb2RlKCB0aGlzLmlzRG93biA/IDIgOiAxLCBuYW1lICk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJzb3IoIHRoaXMuY3VycmVudCAhPT0gLTEgPyAnbW92ZScgOiAncG9pbnRlcicgKTtcclxuICAgICAgICAgICAgaWYodGhpcy5pc0Rvd24pe1xyXG4gICAgICAgICAgICBcdHRoaXMudltuYW1lXSA9IHRoaXMuY2xhbXAoIDEgLSAoKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wIC0gMTAgKSAvIHRoaXMuZ2gpICwgMCwgMSApO1xyXG4gICAgICAgICAgICBcdHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoIHVwICkge1xyXG5cclxuICAgIFx0dGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlUGF0aDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIFx0dmFyIHAgPSBcIlwiLCBoLCB3LCB3biwgd20sIG93LCBvaDtcclxuICAgIFx0Ly92YXIgZyA9IHRoaXMuaXcqMC41XHJcblxyXG4gICAgXHRmb3IodmFyIGkgPSAwOyBpPHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICBcdFx0aCA9IDE0ICsgKHRoaXMuZ2ggLSB0aGlzLnZbaV0qdGhpcy5naCk7XHJcbiAgICBcdFx0dyA9ICgxNCArIChpKnRoaXMuaXcpICsgKGkqNCkpO1xyXG5cclxuICAgIFx0XHR3bSA9IHcgKyB0aGlzLml3KjAuNTtcclxuICAgIFx0XHR3biA9IHcgKyB0aGlzLml3O1xyXG5cclxuICAgIFx0XHRpZihpPT09MCkgcCs9J00gJyt3KycgJysgaCArICcgVCAnICsgd20gKycgJysgaDtcclxuICAgIFx0XHRlbHNlIHAgKz0gJyBDICcgKyBvdyArJyAnKyBvaCArICcsJyArIHcgKycgJysgaCArICcsJyArIHdtICsnICcrIGg7XHJcbiAgICBcdFx0aWYoaSA9PT0gdGhpcy5sbmctMSkgcCs9JyBUICcgKyB3biArJyAnKyBoO1xyXG5cclxuICAgIFx0XHRvdyA9IHduXHJcbiAgICBcdFx0b2ggPSBoIFxyXG5cclxuICAgIFx0fVxyXG5cclxuICAgIFx0cmV0dXJuIHA7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgXHJcblxyXG4gICAgclNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgc1sxXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcblxyXG4gICAgICAgIHZhciBndyA9IHRoaXMudyAtIDI4O1xyXG4gICAgICAgIHZhciBpdyA9ICgoZ3ctKDQqKHRoaXMubG5nLTEpKSkvdGhpcy5sbmcpO1xyXG5cclxuICAgICAgICB2YXIgdCA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHRbaV0gPSBbIDE0ICsgKGkqaXcpICsgKGkqNCksIGl3IF07XHJcbiAgICAgICAgICAgIHRbaV1bMl0gPSB0W2ldWzBdICsgdFtpXVsxXTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRtcCA9IHQ7XHJcblxyXG4gICAgfVxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgR3JhcGggfTsiLCJcclxuaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuLi9jb3JlL1Jvb3RzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuLy9pbXBvcnQgeyBhZGQgfSBmcm9tICcuLi9jb3JlL2FkZCc7XHJcblxyXG5mdW5jdGlvbiBHcm91cCAoIG8gKSB7XHJcbiBcclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICB0aGlzLkFERCA9IG8uYWRkO1xyXG5cclxuICAgIHRoaXMudWlzID0gW107XHJcblxyXG4gICAgdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuZGVjYWwgPSAwO1xyXG5cclxuICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcblxyXG4gICAgdmFyIGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS02O1xyXG5cclxuICAgIHRoaXMuaXNMaW5lID0gby5saW5lICE9PSB1bmRlZmluZWQgPyBvLmxpbmUgOiBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IGxlZnQ6MDsgaGVpZ2h0OmF1dG87IG92ZXJmbG93OmhpZGRlbjsgdG9wOicrdGhpcy5oKydweCcpO1xyXG4gICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjEwcHg7IGhlaWdodDoxMHB4OyBsZWZ0OjA7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmdyb3VwLCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcbiAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6NHB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5hcnJvdywgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG4gICAgLy8gYm90dG9tIGxpbmVcclxuICAgIGlmKHRoaXMuaXNMaW5lKSB0aGlzLmNbNV0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgICdiYWNrZ3JvdW5kOnJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTsgd2lkdGg6MTAwJTsgbGVmdDowOyBoZWlnaHQ6MXB4OyBib3R0b206MHB4Jyk7XHJcblxyXG4gICAgdmFyIHMgPSB0aGlzLnM7XHJcblxyXG4gICAgc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgc1sxXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgdGhpcy5jWzFdLm5hbWUgPSAnZ3JvdXAnO1xyXG5cclxuICAgIHNbMV0ubWFyZ2luTGVmdCA9ICcxMHB4JztcclxuICAgIHNbMV0ubGluZUhlaWdodCA9IHRoaXMuaC00O1xyXG4gICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgc1sxXS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG5cclxuICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApIHNbMF0uYm9yZGVyUmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4JzsgXHJcbiAgICBzWzBdLmJvcmRlciA9IHRoaXMuY29sb3JzLmdyb3VwQm9yZGVyO1xyXG5cclxuICAgIFxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgaWYoIG8uYmcgIT09IHVuZGVmaW5lZCApIHRoaXMuc2V0Qkcoby5iZyk7XHJcbiAgICBpZiggby5vcGVuICE9PSB1bmRlZmluZWQgKSB0aGlzLm9wZW4oKTtcclxuXHJcbn1cclxuXHJcbkdyb3VwLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IEdyb3VwLFxyXG5cclxuICAgIGlzR3JvdXA6IHRydWUsXHJcblxyXG4gICAgdGVzdFpvbmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGlmKCBsLnkgPCB0aGlzLmJhc2VIICkgbmFtZSA9ICd0aXRsZSc7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIG5hbWUgPSAnY29udGVudCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyVGFyZ2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgPT09IC0xICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgIC8vIGlmKCF0aGlzLnRhcmdldCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnVpb3V0KCk7XHJcbiAgICAgICAgdGhpcy50YXJnZXQucmVzZXQoKTtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaGFuZGxlRXZlbnQ6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIHR5cGUgPSBlLnR5cGU7XHJcblxyXG4gICAgICAgIHZhciBjaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICB2YXIgdGFyZ2V0Q2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHN3aXRjaCggbmFtZSApe1xyXG5cclxuICAgICAgICAgICAgY2FzZSAnY29udGVudCc6XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgICAgICBpZiggUm9vdHMuaXNNb2JpbGUgJiYgdHlwZSA9PT0gJ21vdXNlZG93bicgKSB0aGlzLmdldE5leHQoIGUsIGNoYW5nZSApO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMudGFyZ2V0ICkgdGFyZ2V0Q2hhbmdlID0gdGhpcy50YXJnZXQuaGFuZGxlRXZlbnQoIGUgKTtcclxuXHJcbiAgICAgICAgICAgIC8vaWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5zdHlsZXMoJ2RlZicpO1xyXG5cclxuICAgICAgICAgICAgaWYoICFSb290cy5sb2NrICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0aXRsZSc6XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyApe1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLm9wZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICBpZiggdGFyZ2V0Q2hhbmdlICkgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGdldE5leHQ6IGZ1bmN0aW9uICggZSwgY2hhbmdlICkge1xyXG5cclxuICAgICAgICB2YXIgbmV4dCA9IFJvb3RzLmZpbmRUYXJnZXQoIHRoaXMudWlzLCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IC0xICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMudWlzWyB0aGlzLmN1cnJlbnQgXTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQudWlvdmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNhbGNIOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBsbmcgPSB0aGlzLnVpcy5sZW5ndGgsIGksIHUsICBoPTAsIHB4PTAsIHRtcGg9MDtcclxuICAgICAgICBmb3IoIGkgPSAwOyBpIDwgbG5nOyBpKyspe1xyXG4gICAgICAgICAgICB1ID0gdGhpcy51aXNbaV07XHJcbiAgICAgICAgICAgIGlmKCAhdS5hdXRvV2lkdGggKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihweD09PTApIGggKz0gdS5oKzE7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZih0bXBoPHUuaCkgaCArPSB1LmgtdG1waDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRtcGggPSB1Lmg7XHJcblxyXG4gICAgICAgICAgICAgICAgLy90bXBoID0gdG1waCA8IHUuaCA/IHUuaCA6IHRtcGg7XHJcbiAgICAgICAgICAgICAgICBweCArPSB1Lnc7XHJcbiAgICAgICAgICAgICAgICBpZiggcHgrdS53ID4gdGhpcy53ICkgcHggPSAwO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGggKz0gdS5oKzE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaDtcclxuICAgIH0sXHJcblxyXG4gICAgY2FsY1VpczogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBSb290cy5jYWxjVWlzKCB0aGlzLnVpcywgdGhpcy56b25lLCB0aGlzLnpvbmUueSArIHRoaXMuYmFzZUggKTtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICBzZXRCRzogZnVuY3Rpb24gKCBjICkge1xyXG5cclxuICAgICAgICB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IGM7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnNldEJHKCBjICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIGFbMV0gPT09ICdvYmplY3QnICl7IFxyXG4gICAgICAgICAgICBhWzFdLmlzVUkgPSB0aGlzLmlzVUk7XHJcbiAgICAgICAgICAgIGFbMV0udGFyZ2V0ID0gdGhpcy5jWzJdO1xyXG4gICAgICAgICAgICBhWzFdLm1haW4gPSB0aGlzLm1haW47XHJcbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnc3RyaW5nJyApe1xyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHsgaXNVSTp0cnVlLCB0YXJnZXQ6dGhpcy5jWzJdLCBtYWluOnRoaXMubWFpbiB9KTtcclxuICAgICAgICAgICAgZWxzZXsgXHJcbiAgICAgICAgICAgICAgICBhWzJdLmlzVUkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYVsyXS50YXJnZXQgPSB0aGlzLmNbMl07XHJcbiAgICAgICAgICAgICAgICBhWzJdLm1haW4gPSB0aGlzLm1haW47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vdmFyIG4gPSBhZGQuYXBwbHkoIHRoaXMsIGEgKTtcclxuICAgICAgICB2YXIgbiA9IHRoaXMuQURELmFwcGx5KCB0aGlzLCBhICk7XHJcbiAgICAgICAgdGhpcy51aXMucHVzaCggbiApO1xyXG5cclxuICAgICAgICBpZiggbi5hdXRvSGVpZ2h0ICkgbi5wYXJlbnRHcm91cCA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiBuO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcGFyZW50SGVpZ2h0OiBmdW5jdGlvbiAoIHQgKSB7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApIHRoaXMucGFyZW50R3JvdXAuY2FsYyggdCApO1xyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUub3Blbi5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93RG93biApO1xyXG4gICAgICAgIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgICAgIHZhciB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnRIZWlnaHQoIHQgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5jbG9zZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHZhciB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3cgKTtcclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJHcm91cCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggLSh0aGlzLmggKzEgKSk7XHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLmNsZWFyLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyR3JvdXA6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5jbGVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLnVpcy5wb3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51aXMgPSBbXTtcclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2FsYzogZnVuY3Rpb24gKCB5ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiggeSAhPT0gdW5kZWZpbmVkICl7IFxyXG4gICAgICAgICAgICB0aGlzLmggKz0geTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB5ICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oID0gdGhpcy5jYWxjSCgpICsgdGhpcy5iYXNlSDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcblxyXG4gICAgICAgIC8vaWYodGhpcy5pc09wZW4pIHRoaXMuY2FsY1VpcygpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgclNpemVDb250ZW50OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnNldFNpemUoIHRoaXMudyApO1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5yU2l6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGMoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzWzNdLmxlZnQgPSAoIHRoaXMuc2EgKyB0aGlzLnNiIC0gMTcgKSArICdweCc7XHJcbiAgICAgICAgc1sxXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgfVxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgR3JvdXAgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZnVuY3Rpb24gSm95c3RpY2sgKCBvICkge1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudmFsdWUgPSBbMCwwXTtcclxuXHJcbiAgICB0aGlzLmpveVR5cGUgPSAnYW5hbG9naXF1ZSc7XHJcbiAgICB0aGlzLm1vZGVsID0gby5tb2RlICE9PSB1bmRlZmluZWQgPyBvLm1vZGUgOiAwO1xyXG5cclxuICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gfHwgMjtcclxuICAgIHRoaXMubXVsdGlwbGljYXRvciA9IG8ubXVsdGlwbGljYXRvciB8fCAxO1xyXG5cclxuICAgIHRoaXMucG9zID0gbmV3IFYyKCk7XHJcbiAgICB0aGlzLnRtcCA9IG5ldyBWMigpO1xyXG5cclxuICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xyXG5cclxuICAgIHRoaXMucmFkaXVzID0gdGhpcy53ICogMC41O1xyXG4gICAgdGhpcy5kaXN0YW5jZSA9IHRoaXMucmFkaXVzKjAuMjU7XHJcblxyXG4gICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArIDEwO1xyXG4gICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB7IC8vIHdpdGggdGl0bGVcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgIHRoaXMuY1sxXS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6Jyt0aGlzLncrJ3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB0aGlzLmNbM10gPSB0aGlzLmdldEpveXN0aWNrKCB0aGlzLm1vZGVsICk7XHJcbiAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLncrJyAnK3RoaXMudyApO1xyXG4gICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLncsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuXHJcbiAgICB0aGlzLnJhdGlvID0gMTI4L3RoaXMudztcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZShmYWxzZSk7XHJcbiAgICBcclxufVxyXG5cclxuSm95c3RpY2sucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogSm95c3RpY2ssXHJcblxyXG4gICAgbW9kZTogZnVuY3Rpb24gKCBtb2RlICkge1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5tb2RlbD09PTApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgJ3VybCgjZ3JhZEluKScsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJyMwMDAnLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiYSgxMDAsMTAwLDEwMCwwLjI1KScsIDIgKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiKDAsMCwwLDAuMSknLCAzICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICcjNjY2JywgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgJ25vbmUnLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5tb2RlbD09PTApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgJ3VybCgjZ3JhZEluMiknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2JhKDAsMCwwLDApJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYmEoNDgsMTM4LDI1NSwwLjI1KScsIDIgKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiKDAsMCwwLDAuMyknLCAzICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuY29sb3JzLnNlbGVjdCwgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgJ3JnYmEoNDgsMTM4LDI1NSwwLjI1KScsIDQgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdFxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFkZEludGVydmFsOiBmdW5jdGlvbiAoKXtcclxuICAgICAgICBpZiggdGhpcy5pbnRlcnZhbCAhPT0gbnVsbCApIHRoaXMuc3RvcEludGVydmFsKCk7XHJcbiAgICAgICAgaWYoIHRoaXMucG9zLmlzWmVybygpICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggZnVuY3Rpb24oKXsgdGhpcy51cGRhdGUoKTsgfS5iaW5kKHRoaXMpLCAxMCApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc3RvcEludGVydmFsOiBmdW5jdGlvbiAoKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaW50ZXJ2YWwgPT09IG51bGwgKSByZXR1cm47XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCggdGhpcy5pbnRlcnZhbCApO1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRJbnRlcnZhbCgpO1xyXG4gICAgICAgIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNldXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRJbnRlcnZhbCgpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIHRoaXMubW9kZSggMiApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy50bXAueCA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIHRoaXMudG1wLnkgPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCApO1xyXG5cclxuICAgICAgICB2YXIgZGlzdGFuY2UgPSB0aGlzLnRtcC5sZW5ndGgoKTtcclxuXHJcbiAgICAgICAgaWYgKCBkaXN0YW5jZSA+IHRoaXMuZGlzdGFuY2UgKSB7XHJcbiAgICAgICAgICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbjIodGhpcy50bXAueCwgdGhpcy50bXAueSk7XHJcbiAgICAgICAgICAgIHRoaXMudG1wLnggPSBNYXRoLnNpbiggYW5nbGUgKSAqIHRoaXMuZGlzdGFuY2U7XHJcbiAgICAgICAgICAgIHRoaXMudG1wLnkgPSBNYXRoLmNvcyggYW5nbGUgKSAqIHRoaXMuZGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvcy5jb3B5KCB0aGlzLnRtcCApLmRpdmlkZVNjYWxhciggdGhpcy5kaXN0YW5jZSApLm5lZ2F0ZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uICggdiApIHtcclxuXHJcbiAgICAgICAgaWYodj09PXVuZGVmaW5lZCkgdj1bMCwwXTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3Muc2V0KCB2WzBdIHx8IDAsIHZbMV0gIHx8IDAgKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNWRygpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoIHVwICkge1xyXG5cclxuICAgICAgICBpZiggdXAgPT09IHVuZGVmaW5lZCApIHVwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaW50ZXJ2YWwgIT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy5sZXJwKCBudWxsLCAwLjMgKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy54ID0gTWF0aC5hYnMoIHRoaXMucG9zLnggKSA8IDAuMDEgPyAwIDogdGhpcy5wb3MueDtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zLnkgPSBNYXRoLmFicyggdGhpcy5wb3MueSApIDwgMC4wMSA/IDAgOiB0aGlzLnBvcy55O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzVUkgJiYgdGhpcy5tYWluLmlzQ2FudmFzICkgdGhpcy5tYWluLmRyYXcoKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVNWRygpO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucG9zLmlzWmVybygpICkgdGhpcy5zdG9wSW50ZXJ2YWwoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZVNWRzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgeCA9IHRoaXMucmFkaXVzIC0gKCAtdGhpcy5wb3MueCAqIHRoaXMuZGlzdGFuY2UgKTtcclxuICAgICAgICB2YXIgeSA9IHRoaXMucmFkaXVzIC0gKCAtdGhpcy5wb3MueSAqIHRoaXMuZGlzdGFuY2UgKTtcclxuXHJcbiAgICAgICAgIGlmKHRoaXMubW9kZWwgPT09IDApe1xyXG5cclxuICAgICAgICAgICAgdmFyIHN4ID0geCArICgodGhpcy5wb3MueCkqNSkgKyA1O1xyXG4gICAgICAgICAgICB2YXIgc3kgPSB5ICsgKCh0aGlzLnBvcy55KSo1KSArIDEwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4Jywgc3gqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCBzeSp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgeCp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHkqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHgqdGhpcy5yYXRpbywgNCApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHkqdGhpcy5yYXRpbywgNCApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlWzBdID0gICggdGhpcy5wb3MueCAqIHRoaXMubXVsdGlwbGljYXRvciApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG4gICAgICAgIHRoaXMudmFsdWVbMV0gPSAgKCB0aGlzLnBvcy55ICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3RvcEludGVydmFsKClcclxuICAgICAgICBQcm90by5wcm90b3R5cGUuY2xlYXIuY2FsbCggdGhpcyApO1xyXG5cclxuICAgIH0sXHJcblxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBKb3lzdGljayB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IENpcmN1bGFyIH0gZnJvbSAnLi9DaXJjdWxhcic7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5mdW5jdGlvbiBLbm9iICggbyApIHtcclxuXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG4gICAgdGhpcy5hdXRvV2lkdGggPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmJ1dHRvbkNvbG9yID0gdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgIHRoaXMuc2V0VHlwZU51bWJlciggbyApO1xyXG5cclxuICAgIHRoaXMubVBJID0gTWF0aC5QSSAqIDAuODtcclxuICAgIHRoaXMudG9EZWcgPSAxODAgLyBNYXRoLlBJO1xyXG4gICAgdGhpcy5jaXJSYW5nZSA9IHRoaXMubVBJICogMjtcclxuXHJcbiAgICB0aGlzLm9mZnNldCA9IG5ldyBWMigpO1xyXG5cclxuICAgIHRoaXMucmFkaXVzID0gdGhpcy53ICogMC41Oy8vTWF0aC5mbG9vcigodGhpcy53LTIwKSowLjUpO1xyXG5cclxuICAgIC8vdGhpcy53dyA9IHRoaXMuaGVpZ2h0ID0gdGhpcy5yYWRpdXMgKiAyO1xyXG4gICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArIDEwO1xyXG4gICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICBpZih0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcbiAgICAgICAgdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBlcmNlbnQgPSAwO1xyXG5cclxuICAgIHRoaXMuY21vZGUgPSAwO1xyXG5cclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuXHJcbiAgICB0aGlzLmNbM10gPSB0aGlzLmdldEtub2IoKTtcclxuICAgIFxyXG4gICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcbiAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5mb250Q29sb3IsIDMgKTtcclxuICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlR3JhZCgpLCAzICk7XHJcbiAgICBcclxuXHJcbiAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLnd3KycgJyt0aGlzLnd3ICk7XHJcbiAgICB0aGlzLnNldENzcyggdGhpcy5jWzNdLCB7IHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMudywgbGVmdDowLCB0b3A6dGhpcy50b3AgfSk7XHJcblxyXG4gICAgdGhpcy5yID0gMDtcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxufVxyXG5cclxuS25vYi5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBDaXJjdWxhci5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBLbm9iLFxyXG5cclxuICAgIG1vZGU6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY21vZGUgPT09IG1vZGUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJyx0aGlzLmNvbG9ycy5idXR0b24sIDApO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywncmdiYSgwLDAsMCwwLjIpJywgMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5mb250Q29sb3IsIDEgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5jb2xvclBsdXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsdGhpcy5jb2xvcnMuc2VsZWN0LCAwKTtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC42KScsIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuY29sb3JQbHVzLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IG1vZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBcclxuXHJcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgLy90aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBvZmYgPSB0aGlzLm9mZnNldDtcclxuXHJcbiAgICAgICAgb2ZmLnggPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICBvZmYueSA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wICk7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IC0gTWF0aC5hdGFuMiggb2ZmLngsIG9mZi55ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9sZHIgIT09IG51bGwgKSB0aGlzLnIgPSBNYXRoLmFicyh0aGlzLnIgLSB0aGlzLm9sZHIpID4gTWF0aC5QSSA/IHRoaXMub2xkciA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgdGhpcy5yID0gdGhpcy5yID4gdGhpcy5tUEkgPyB0aGlzLm1QSSA6IHRoaXMucjtcclxuICAgICAgICB0aGlzLnIgPSB0aGlzLnIgPCAtdGhpcy5tUEkgPyAtdGhpcy5tUEkgOiB0aGlzLnI7XHJcblxyXG4gICAgICAgIHZhciBzdGVwcyA9IDEgLyB0aGlzLmNpclJhbmdlO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9ICh0aGlzLnIgKyB0aGlzLm1QSSkgKiBzdGVwcztcclxuXHJcbiAgICAgICAgdmFyIG4gPSAoICggdGhpcy5yYW5nZSAqIHZhbHVlICkgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcblxyXG4gICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgIG4gPSBNYXRoLmZsb29yKCBuIC8gdGhpcy5zdGVwICk7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB0aGlzLm9sZCArICggbiAqIHRoaXMuc3RlcCApICk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5vbGRyID0gdGhpcy5yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VHcmFkOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBkID0gJycsIHN0ZXAsIHJhbmdlLCBhLCB4LCB5LCB4MiwgeTIsIHIgPSA2NDtcclxuICAgICAgICB2YXIgc3RhcnRhbmdsZSA9IE1hdGguUEkgKyB0aGlzLm1QSTtcclxuICAgICAgICB2YXIgZW5kYW5nbGUgPSBNYXRoLlBJIC0gdGhpcy5tUEk7XHJcbiAgICAgICAgLy92YXIgc3RlcCA9IHRoaXMuc3RlcD41ID8gdGhpcy5zdGVwIDogMTtcclxuXHJcbiAgICAgICAgaWYodGhpcy5zdGVwPjUpe1xyXG4gICAgICAgICAgICByYW5nZSA9ICB0aGlzLnJhbmdlIC8gdGhpcy5zdGVwO1xyXG4gICAgICAgICAgICBzdGVwID0gKCBzdGFydGFuZ2xlIC0gZW5kYW5nbGUgKSAvIHJhbmdlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN0ZXAgPSAoKCBzdGFydGFuZ2xlIC0gZW5kYW5nbGUgKSAvIHIpKjI7XHJcbiAgICAgICAgICAgIHJhbmdlID0gciowLjU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPD0gcmFuZ2U7ICsraSApIHtcclxuXHJcbiAgICAgICAgICAgIGEgPSBzdGFydGFuZ2xlIC0gKCBzdGVwICogaSApO1xyXG4gICAgICAgICAgICB4ID0gciArIE1hdGguc2luKCBhICkgKiAoIHIgLSAyMCApO1xyXG4gICAgICAgICAgICB5ID0gciArIE1hdGguY29zKCBhICkgKiAoIHIgLSAyMCApO1xyXG4gICAgICAgICAgICB4MiA9IHIgKyBNYXRoLnNpbiggYSApICogKCByIC0gMjQgKTtcclxuICAgICAgICAgICAgeTIgPSByICsgTWF0aC5jb3MoIGEgKSAqICggciAtIDI0ICk7XHJcbiAgICAgICAgICAgIGQgKz0gJ00nICsgeCArICcgJyArIHkgKyAnIEwnICsgeDIgKyAnICcreTIgKyAnICc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGQ7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICggdXAgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gKHRoaXMudmFsdWUgLSB0aGlzLm1pbikgLyB0aGlzLnJhbmdlO1xyXG5cclxuICAgICAgIC8vIHZhciByID0gNTA7XHJcbiAgICAgICAvLyB2YXIgZCA9IDY0OyBcclxuICAgICAgICB2YXIgciA9ICggKHRoaXMucGVyY2VudCAqIHRoaXMuY2lyUmFuZ2UpIC0gKHRoaXMubVBJKSkvLyogdGhpcy50b0RlZztcclxuXHJcbiAgICAgICAgdmFyIHNpbiA9IE1hdGguc2luKHIpO1xyXG4gICAgICAgIHZhciBjb3MgPSBNYXRoLmNvcyhyKTtcclxuXHJcbiAgICAgICAgdmFyIHgxID0gKDI1ICogc2luKSArIDY0O1xyXG4gICAgICAgIHZhciB5MSA9IC0oMjUgKiBjb3MpICsgNjQ7XHJcbiAgICAgICAgdmFyIHgyID0gKDIwICogc2luKSArIDY0O1xyXG4gICAgICAgIHZhciB5MiA9IC0oMjAgKiBjb3MpICsgNjQ7XHJcblxyXG4gICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgeCwgMSApO1xyXG4gICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgeSwgMSApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsICdNICcgKyB4MSArJyAnICsgeTEgKyAnIEwgJyArIHgyICsnICcgKyB5MiwgMSApO1xyXG5cclxuICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd0cmFuc2Zvcm0nLCAncm90YXRlKCcrIHIgKycgJys2NCsnICcrNjQrJyknLCAxICk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IEtub2IgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZnVuY3Rpb24gTGlzdCAoIG8gKSB7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIC8vIGltYWdlc1xyXG4gICAgdGhpcy5wYXRoID0gby5wYXRoIHx8ICcnO1xyXG4gICAgdGhpcy5mb3JtYXQgPSBvLmZvcm1hdCB8fCAnJztcclxuICAgIHRoaXMuaW1hZ2VTaXplID0gby5pbWFnZVNpemUgfHwgWzIwLDIwXTtcclxuXHJcbiAgICB0aGlzLmlzV2l0aEltYWdlID0gdGhpcy5wYXRoICE9PSAnJyA/IHRydWU6ZmFsc2U7XHJcbiAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudG1wSW1hZ2UgPSB7fTtcclxuICAgIHRoaXMudG1wVXJsID0gW107XHJcblxyXG4gICAgdGhpcy5hdXRvSGVpZ2h0ID0gZmFsc2U7XHJcbiAgICB2YXIgYWxpZ24gPSBvLmFsaWduIHx8ICdjZW50ZXInO1xyXG5cclxuICAgIHRoaXMuc01vZGUgPSAwO1xyXG4gICAgdGhpcy50TW9kZSA9IDA7XHJcblxyXG4gICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICB2YXIgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTU7XHJcblxyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6MDsgZGlzcGxheTpub25lOycgKTtcclxuICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246JythbGlnbisnOyBsaW5lLWhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OyB0b3A6MXB4OyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmFycm93LCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgdGhpcy5zY3JvbGxlciA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncmlnaHQ6NXB4OyAgd2lkdGg6MTBweDsgYmFja2dyb3VuZDojNjY2OyBkaXNwbGF5Om5vbmU7Jyk7XHJcblxyXG4gICAgdGhpcy5jWzNdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcblxyXG4gICAgdGhpcy5saXN0ID0gby5saXN0IHx8IFtdO1xyXG4gICAgdGhpcy5pdGVtcyA9IFtdO1xyXG5cclxuICAgIHRoaXMucHJldk5hbWUgPSAnJztcclxuXHJcbiAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuICAgIHRoaXMuaXRlbUhlaWdodCA9IG8uaXRlbUhlaWdodCB8fCAodGhpcy5oLTMpO1xyXG5cclxuICAgIC8vIGZvcmNlIGZ1bGwgbGlzdCBcclxuICAgIHRoaXMuZnVsbCA9IG8uZnVsbCB8fCBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnB5ID0gMDtcclxuICAgIHRoaXMud3cgPSB0aGlzLnNiO1xyXG4gICAgdGhpcy5zY3JvbGwgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcclxuXHJcbiAgICAvLyBsaXN0IHVwIG9yIGRvd25cclxuICAgIHRoaXMuc2lkZSA9IG8uc2lkZSB8fCAnZG93bic7XHJcbiAgICB0aGlzLnVwID0gdGhpcy5zaWRlID09PSAnZG93bicgPyAwIDogMTtcclxuXHJcbiAgICBpZiggdGhpcy51cCApe1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG4gICAgICAgIHRoaXMuY1szXS5zdHlsZS50b3AgPSAnYXV0byc7XHJcbiAgICAgICAgdGhpcy5jWzRdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAvL3RoaXMuY1s1XS5zdHlsZS50b3AgPSAnYXV0byc7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS5zdHlsZS5ib3R0b20gPSB0aGlzLmgtMiArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzNdLnN0eWxlLmJvdHRvbSA9ICcxcHgnO1xyXG4gICAgICAgIHRoaXMuY1s0XS5zdHlsZS5ib3R0b20gPSBmbHRvcCArICdweCc7XHJcbiAgICAgICAgLy90aGlzLmNbNV0uc3R5bGUuYm90dG9tID0gJzJweCc7XHJcblxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gdGhpcy5iYXNlSCArICdweCc7XHJcbiAgICAgICAgLy90aGlzLmNbNl0uc3R5bGUudG9wID0gdGhpcy5oICsgJ3B4JztcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxpc3RJbiA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnbGVmdDowOyB0b3A6MDsgd2lkdGg6MTAwJTsgYmFja2dyb3VuZDpyZ2JhKDAsMCwwLDAuMik7Jyk7XHJcbiAgICB0aGlzLmxpc3RJbi5uYW1lID0gJ2xpc3QnO1xyXG5cclxuICAgIHRoaXMudG9wTGlzdCA9IDA7XHJcbiAgICBcclxuICAgIHRoaXMuY1syXS5hcHBlbmRDaGlsZCggdGhpcy5saXN0SW4gKTtcclxuICAgIHRoaXMuY1syXS5hcHBlbmRDaGlsZCggdGhpcy5zY3JvbGxlciApO1xyXG5cclxuICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICBpZighaXNOYU4oby52YWx1ZSkpIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbIG8udmFsdWUgXTtcclxuICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSBvLnZhbHVlO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubGlzdFswXTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmlzT3Blbk9uU3RhcnQgPSBvLm9wZW4gfHwgZmFsc2U7XHJcblxyXG4gICAgXHJcblxyXG4gICAgLy90aGlzLmNbMF0uc3R5bGUuYmFja2dyb3VuZCA9ICcjRkYwMDAwJ1xyXG4gICAgaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKSB0aGlzLnByZWxvYWRJbWFnZSgpO1xyXG4gICAvLyB9IGVsc2Uge1xyXG4gICAgICAgIC8vIHBvcHVsYXRlIGxpc3RcclxuICAgICAgICB0aGlzLnNldExpc3QoIHRoaXMubGlzdCApO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzT3Blbk9uU3RhcnQgKSB0aGlzLm9wZW4oKTtcclxuICAgLy8gfVxyXG5cclxufVxyXG5cclxuTGlzdC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBMaXN0LFxyXG5cclxuICAgIC8vIGltYWdlIGxpc3RcclxuXHJcbiAgICBwcmVsb2FkSW1hZ2U6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBJbWFnZSA9IHt9O1xyXG4gICAgICAgIGZvciggdmFyIGk9MDsgaTx0aGlzLmxpc3QubGVuZ3RoOyBpKysgKSB0aGlzLnRtcFVybC5wdXNoKCB0aGlzLmxpc3RbaV0gKTtcclxuICAgICAgICB0aGlzLmxvYWRPbmUoKTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgbmV4dEltZzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLnRtcFVybC5zaGlmdCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLnRtcFVybC5sZW5ndGggPT09IDAgKXsgXHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFkZEltYWdlcygpO1xyXG4gICAgICAgICAgICAvKnRoaXMuc2V0TGlzdCggdGhpcy5saXN0ICk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW5PblN0YXJ0ICkgdGhpcy5vcGVuKCk7Ki9cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgdGhpcy5sb2FkT25lKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBsb2FkT25lOiBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXNcclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudG1wVXJsWzBdO1xyXG4gICAgICAgIHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcclxuICAgICAgICBpbWcuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6JytzZWxmLmltYWdlU2l6ZVswXSsncHg7IGhlaWdodDonK3NlbGYuaW1hZ2VTaXplWzFdKydweCc7XHJcbiAgICAgICAgaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgdGhpcy5wYXRoICsgbmFtZSArIHRoaXMuZm9ybWF0ICk7XHJcblxyXG4gICAgICAgIGltZy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmltYWdlU2l6ZVsyXSA9IGltZy53aWR0aDtcclxuICAgICAgICAgICAgc2VsZi5pbWFnZVNpemVbM10gPSBpbWcuaGVpZ2h0O1xyXG4gICAgICAgICAgICBzZWxmLnRtcEltYWdlW25hbWVdID0gaW1nO1xyXG4gICAgICAgICAgICBzZWxmLm5leHRJbWcoKTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvL1xyXG5cclxuICAgIHRlc3Rab25lOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCAmJiB0aGlzLmlzT3BlbiApe1xyXG4gICAgICAgICAgICBpZiggbC55ID4gdGhpcy5oIC0gdGhpcy5iYXNlSCApIHJldHVybiAndGl0bGUnO1xyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuc2Nyb2xsICYmICggbC54ID4gKHRoaXMuc2ErdGhpcy5zYi0yMCkpICkgcmV0dXJuICdzY3JvbGwnO1xyXG4gICAgICAgICAgICAgICAgaWYobC54ID4gdGhpcy5zYSkgcmV0dXJuIHRoaXMudGVzdEl0ZW1zKCBsLnktdGhpcy5iYXNlSCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCBsLnkgPCB0aGlzLmJhc2VIKzIgKSByZXR1cm4gJ3RpdGxlJztcclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnNjcm9sbCAmJiAoIGwueCA+ICh0aGlzLnNhK3RoaXMuc2ItMjApKSApIHJldHVybiAnc2Nyb2xsJztcclxuICAgICAgICAgICAgICAgICAgICBpZihsLnggPiB0aGlzLnNhKSByZXR1cm4gdGhpcy50ZXN0SXRlbXMoIGwueS10aGlzLmJhc2VIICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJyc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXN0SXRlbXM6IGZ1bmN0aW9uICggeSApIHtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSAnJztcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLml0ZW1zLmxlbmd0aCwgaXRlbSwgYSwgYjtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICBpdGVtID0gdGhpcy5pdGVtc1tpXTtcclxuICAgICAgICAgICAgYSA9IGl0ZW0ucG9zeSArIHRoaXMudG9wTGlzdDtcclxuICAgICAgICAgICAgYiA9IGl0ZW0ucG9zeSArIHRoaXMuaXRlbUhlaWdodCArIDEgKyB0aGlzLnRvcExpc3Q7XHJcbiAgICAgICAgICAgIGlmKCB5ID49IGEgJiYgeSA8PSBiICl7IFxyXG4gICAgICAgICAgICAgICAgbmFtZSA9ICdpdGVtJyArIGk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVuU2VsZWN0ZWQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IGl0ZW07XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmFtZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBuYW1lO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdW5TZWxlY3RlZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5iYWNrZ3JvdW5kID0gJ3JnYmEoMCwwLDAsMC4yKSc7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNlbGVjdGVkOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG4gICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5jb2xvciA9ICcjRkZGJztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYoIG5hbWUgPT09ICd0aXRsZScgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDIpO1xyXG4gICAgICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbdGhpcy5jdXJyZW50LmlkXVxyXG4gICAgICAgICAgICAgICAgLy90aGlzLnZhbHVlID0gdGhpcy5jdXJyZW50LnRleHRDb250ZW50O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBudXAgPSBmYWxzZTtcclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIG51cDtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0aXRsZScgKXtcclxuICAgICAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDEpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYoIG5hbWUgPT09ICdzY3JvbGwnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncy1yZXNpemUnKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDEpO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZVNjcm9sbCgyKTtcclxuICAgICAgICAgICAgICAgIHZhciB0b3AgPSB0aGlzLnpvbmUueSt0aGlzLmJhc2VILTI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSggKCBlLmNsaWVudFkgLSB0b3AgICkgLSAoIHRoaXMuc2gqMC41ICkgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL2lmKHRoaXMuaXNEb3duKSB0aGlzLmxpc3Rtb3ZlKGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBpcyBpdGVtXHJcbiAgICAgICAgICAgIHRoaXMubW9kZVRpdGxlKDApO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmFtZSAhPT0gdGhpcy5wcmV2TmFtZSApIG51cCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB3aGVlbDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3RpdGxlJyApIHJldHVybiBmYWxzZTsgXHJcbiAgICAgICAgdGhpcy5weSArPSBlLmRlbHRhKjEwO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKHRoaXMucHkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9ICcnO1xyXG4gICAgICAgIHRoaXMudW5TZWxlY3RlZCgpO1xyXG4gICAgICAgIHRoaXMubW9kZVRpdGxlKDApO1xyXG4gICAgICAgIHRoaXMubW9kZVNjcm9sbCgwKTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgbW9kZVNjcm9sbDogZnVuY3Rpb24gKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggbW9kZSA9PT0gdGhpcy5zTW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdCAvIGRvd25cclxuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc01vZGUgPSBtb2RlO1xyXG4gICAgfSxcclxuXHJcbiAgICBtb2RlVGl0bGU6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIG1vZGUgPT09IHRoaXMudE1vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgc1szXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgc1szXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgc1szXS5jb2xvciA9ICcjRkZGJztcclxuICAgICAgICAgICAgICAgIHNbM10uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdCAvIGRvd25cclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHNbM10uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudE1vZGUgPSBtb2RlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJMaXN0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHdoaWxlICggdGhpcy5saXN0SW4uY2hpbGRyZW4ubGVuZ3RoICkgdGhpcy5saXN0SW4ucmVtb3ZlQ2hpbGQoIHRoaXMubGlzdEluLmxhc3RDaGlsZCApO1xyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldExpc3Q6IGZ1bmN0aW9uICggbGlzdCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhckxpc3QoKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ID0gbGlzdDtcclxuICAgICAgICB0aGlzLmxlbmd0aCA9IHRoaXMubGlzdC5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRoaXMubWF4SXRlbSA9IHRoaXMuZnVsbCA/IHRoaXMubGVuZ3RoIDogNTtcclxuICAgICAgICB0aGlzLm1heEl0ZW0gPSB0aGlzLmxlbmd0aCA8IHRoaXMubWF4SXRlbSA/IHRoaXMubGVuZ3RoIDogdGhpcy5tYXhJdGVtO1xyXG5cclxuICAgICAgICB0aGlzLm1heEhlaWdodCA9IHRoaXMubWF4SXRlbSAqICh0aGlzLml0ZW1IZWlnaHQrMSkgKyAyO1xyXG5cclxuICAgICAgICB0aGlzLm1heCA9IHRoaXMubGVuZ3RoICogKHRoaXMuaXRlbUhlaWdodCsxKSArIDI7XHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IHRoaXMubWF4SGVpZ2h0IC8gdGhpcy5tYXg7XHJcbiAgICAgICAgdGhpcy5zaCA9IHRoaXMubWF4SGVpZ2h0ICogdGhpcy5yYXRpbztcclxuICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXhIZWlnaHQgLSB0aGlzLnNoO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gdGhpcy5tYXhIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaCArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm1heCA+IHRoaXMubWF4SGVpZ2h0ICl7IFxyXG4gICAgICAgICAgICB0aGlzLnd3ID0gdGhpcy5zYiAtIDIwO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgaXRlbSwgbjsvLywgbCA9IHRoaXMuc2I7XHJcbiAgICAgICAgZm9yKCB2YXIgaT0wOyBpPHRoaXMubGVuZ3RoOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIG4gPSB0aGlzLmxpc3RbaV07XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLml0ZW0gKyAnd2lkdGg6Jyt0aGlzLnd3KydweDsgaGVpZ2h0OicrdGhpcy5pdGVtSGVpZ2h0KydweDsgbGluZS1oZWlnaHQ6JysodGhpcy5pdGVtSGVpZ2h0LTUpKydweDsgY29sb3I6Jyt0aGlzLmZvbnRDb2xvcisnOycgKTtcclxuICAgICAgICAgICAgaXRlbS5uYW1lID0gJ2l0ZW0nK2k7XHJcbiAgICAgICAgICAgIGl0ZW0uaWQgPSBpO1xyXG4gICAgICAgICAgICBpdGVtLnBvc3kgPSAodGhpcy5pdGVtSGVpZ2h0KzEpKmk7XHJcbiAgICAgICAgICAgIHRoaXMubGlzdEluLmFwcGVuZENoaWxkKCBpdGVtICk7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaCggaXRlbSApO1xyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5pc1dpdGhJbWFnZSApIGl0ZW0uYXBwZW5kQ2hpbGQoIHRoaXMudG1wSW1hZ2Vbbl0gKTtcclxuICAgICAgICAgICAgaWYoICF0aGlzLmlzV2l0aEltYWdlICkgaXRlbS50ZXh0Q29udGVudCA9IG47XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZEltYWdlczogZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgdmFyIGxuZyA9IHRoaXMubGlzdC5sZW5ndGg7XHJcbiAgICAgICAgZm9yKCB2YXIgaT0wOyBpPGxuZzsgaSsrICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXNbaV0uYXBwZW5kQ2hpbGQoIHRoaXMudG1wSW1hZ2VbdGhpcy5saXN0W2ldXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNldFRvcEl0ZW0oKTtcclxuICAgIH0sXHJcblxyXG4gICAgc2V0VG9wSXRlbTogZnVuY3Rpb24gKCl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzV2l0aEltYWdlICl7IFxyXG5cclxuICAgICAgICAgICAgaWYoICF0aGlzLnByZUxvYWRDb21wbGV0ZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNbM10uY2hpbGRyZW4ubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1hZ2VTaXplWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWFnZVNpemVbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlOyB0b3A6MHB4OyBsZWZ0OjBweDsnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1szXS5hcHBlbmRDaGlsZCggdGhpcy5jYW52YXMgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGltZyA9IHRoaXMudG1wSW1hZ2VbIHRoaXMudmFsdWUgXTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKCB0aGlzLnRtcEltYWdlWyB0aGlzLnZhbHVlIF0sIDAsIDAsIHRoaXMuaW1hZ2VTaXplWzJdLCB0aGlzLmltYWdlU2l6ZVszXSwgMCwwLCB0aGlzLmltYWdlU2l6ZVswXSwgdGhpcy5pbWFnZVNpemVbMV0gKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICAvLyAtLS0tLSBMSVNUXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoIHkgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5zY3JvbGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHkgPSB5IDwgMCA/IDAgOiB5O1xyXG4gICAgICAgIHkgPSB5ID4gdGhpcy5yYW5nZSA/IHRoaXMucmFuZ2UgOiB5O1xyXG5cclxuICAgICAgICB0aGlzLnRvcExpc3QgPSAtTWF0aC5mbG9vciggeSAvIHRoaXMucmF0aW8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0SW4uc3R5bGUudG9wID0gdGhpcy50b3BMaXN0KydweCc7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS50b3AgPSBNYXRoLmZsb29yKCB5ICkgICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5weSA9IHk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwYXJlbnRIZWlnaHQ6IGZ1bmN0aW9uICggdCApIHtcclxuXHJcbiAgICAgICAgaWYgKCB0aGlzLnBhcmVudEdyb3VwICE9PSBudWxsICkgdGhpcy5wYXJlbnRHcm91cC5jYWxjKCB0ICk7XHJcbiAgICAgICAgZWxzZSBpZiAoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB0ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBvcGVuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5vcGVuLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoIDAgKTtcclxuICAgICAgICB0aGlzLmggPSB0aGlzLm1heEhlaWdodCArIHRoaXMuYmFzZUggKyA1O1xyXG4gICAgICAgIGlmKCAhdGhpcy5zY3JvbGwgKXtcclxuICAgICAgICAgICAgdGhpcy50b3BMaXN0ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSCArIDUgKyB0aGlzLm1heDtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxlci5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudXAgKXsgXHJcbiAgICAgICAgICAgIHRoaXMuem9uZS55IC09IHRoaXMuaCAtICh0aGlzLmJhc2VILTEwKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3dVcCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93RG93biApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yU2l6ZUNvbnRlbnQoKTtcclxuXHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnRIZWlnaHQoIHQgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5jbG9zZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgKz0gdGhpcy5oIC0gKHRoaXMuYmFzZUgtMTApO1xyXG5cclxuICAgICAgICB2YXIgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3cgKTtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCAtdCApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS1cclxuXHJcbiAgICB0ZXh0OiBmdW5jdGlvbiAoIHR4dCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdHh0O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgclNpemVDb250ZW50OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKSB0aGlzLmxpc3RJbi5jaGlsZHJlbltpXS5zdHlsZS53aWR0aCA9IHRoaXMud3cgKyAncHgnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgclNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgdmFyIHcgPSB0aGlzLnNiO1xyXG4gICAgICAgIHZhciBkID0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgaWYoc1syXT09PSB1bmRlZmluZWQpIHJldHVybjtcclxuXHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IGQgKydweCc7XHJcblxyXG4gICAgICAgIHNbM10ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSBkICsgJ3B4JztcclxuXHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gZCArIHcgLSAxNyArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMud3cgPSB3O1xyXG4gICAgICAgIGlmKCB0aGlzLm1heCA+IHRoaXMubWF4SGVpZ2h0ICkgdGhpcy53dyA9IHctMjA7XHJcbiAgICAgICAgaWYodGhpcy5pc09wZW4pIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgfVxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgTGlzdCB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5mdW5jdGlvbiBOdW1lcmljKCBvICl7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIHRoaXMuc2V0VHlwZU51bWJlciggbyApO1xyXG5cclxuICAgIHRoaXMuYWxsd2F5ID0gby5hbGx3YXkgfHwgZmFsc2U7XHJcblxyXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnZhbHVlID0gWzBdO1xyXG4gICAgdGhpcy50b1JhZCA9IDE7XHJcbiAgICB0aGlzLmlzTnVtYmVyID0gdHJ1ZTtcclxuICAgIHRoaXMuaXNBbmdsZSA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc1ZlY3RvciA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaXNEcmFnID0gby5kcmFnIHx8IGZhbHNlO1xyXG5cclxuICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICBpZighaXNOYU4oby52YWx1ZSkpeyB0aGlzLnZhbHVlID0gW28udmFsdWVdO31cclxuICAgICAgICBlbHNlIGlmKG8udmFsdWUgaW5zdGFuY2VvZiBBcnJheSApeyB0aGlzLnZhbHVlID0gby52YWx1ZTsgdGhpcy5pc051bWJlcj1mYWxzZTt9XHJcbiAgICAgICAgZWxzZSBpZihvLnZhbHVlIGluc3RhbmNlb2YgT2JqZWN0ICl7IFxyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gW107XHJcbiAgICAgICAgICAgIGlmKG8udmFsdWUueCkgdGhpcy52YWx1ZVswXSA9IG8udmFsdWUueDtcclxuICAgICAgICAgICAgaWYoby52YWx1ZS55KSB0aGlzLnZhbHVlWzFdID0gby52YWx1ZS55O1xyXG4gICAgICAgICAgICBpZihvLnZhbHVlLnopIHRoaXMudmFsdWVbMl0gPSBvLnZhbHVlLno7XHJcbiAgICAgICAgICAgIGlmKG8udmFsdWUudykgdGhpcy52YWx1ZVszXSA9IG8udmFsdWUudztcclxuICAgICAgICAgICAgdGhpcy5pc1ZlY3RvciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcbiAgICB0aGlzLnRtcCA9IFtdO1xyXG5cclxuICAgIGlmKG8uaXNBbmdsZSl7XHJcbiAgICAgICAgdGhpcy5pc0FuZ2xlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnRvUmFkID0gTWF0aC5QSS8xODA7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICB0aGlzLnByZXYgPSB7IHg6MCwgeTowLCBkOjAsIHY6MCB9O1xyXG5cclxuICAgIC8vIGJnXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJyBiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9ycy5zZWxlY3QgKyAnOyB0b3A6NHB4OyB3aWR0aDowcHg7IGhlaWdodDonICsgKHRoaXMuaC04KSArICdweDsnICk7XHJcblxyXG4gICAgdGhpcy5jTW9kZSA9IFtdO1xyXG4gICAgXHJcbiAgICB2YXIgaSA9IHRoaXMubG5nO1xyXG4gICAgd2hpbGUoaS0tKXtcclxuXHJcbiAgICAgICAgaWYodGhpcy5pc0FuZ2xlKSB0aGlzLnZhbHVlW2ldID0gKHRoaXMudmFsdWVbaV0gKiAxODAgLyBNYXRoLlBJKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApO1xyXG4gICAgICAgIHRoaXMuY1szK2ldID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnIGhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLmgtOCkrJ3B4OycpOy8vbGV0dGVyLXNwYWNpbmc6LTFweDtcclxuICAgICAgICBpZihvLmNlbnRlcikgdGhpcy5jWzIraV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgdGhpcy5jWzMraV0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW2ldO1xyXG4gICAgICAgIHRoaXMuY1szK2ldLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgdGhpcy5jWzMraV0uaXNOdW0gPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmNNb2RlW2ldID0gMDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3Vyc29yXHJcbiAgICB0aGlzLmN1cnNvcklkID0gMyArIHRoaXMubG5nO1xyXG4gICAgdGhpcy5jWyB0aGlzLmN1cnNvcklkIF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3RvcDo0cHg7IGhlaWdodDonICsgKHRoaXMuaC04KSArICdweDsgd2lkdGg6MHB4OyBiYWNrZ3JvdW5kOicrdGhpcy5mb250Q29sb3IrJzsnICk7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcbn1cclxuXHJcbk51bWVyaWMucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogTnVtZXJpYyxcclxuXHJcbiAgICB0ZXN0Wm9uZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLmxuZztcclxuICAgICAgICB2YXIgdCA9IHRoaXMudG1wO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAvKiBtb2RlOiBmdW5jdGlvbiAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBuID09PSB0aGlzLmNNb2RlW25hbWVdICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAvL3ZhciBtO1xyXG5cclxuICAgICAgICAvKnN3aXRjaChuKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgMDogbSA9IHRoaXMuY29sb3JzLmJvcmRlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogbSA9IHRoaXMuY29sb3JzLmJvcmRlck92ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IG0gPSB0aGlzLmNvbG9ycy5ib3JkZXJTZWxlY3Q7ICBicmVhaztcclxuXHJcbiAgICAgICAgfSovXHJcblxyXG4gICAvKiAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIC8vdGhpcy5jW25hbWUrMl0uc3R5bGUuYm9yZGVyQ29sb3IgPSBtO1xyXG4gICAgICAgIHRoaXMuY01vZGVbbmFtZV0gPSBuO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiggbmFtZSAhPT0gJycgKXsgXHJcbiAgICAgICAgICAgIFx0dGhpcy5jdXJyZW50ID0gbmFtZTtcclxuICAgICAgICAgICAgXHR0aGlzLnByZXYgPSB7IHg6ZS5jbGllbnRYLCB5OmUuY2xpZW50WSwgZDowLCB2OiB0aGlzLmlzTnVtYmVyID8gcGFyc2VGbG9hdCh0aGlzLnZhbHVlKSA6IHBhcnNlRmxvYXQoIHRoaXMudmFsdWVbIHRoaXMuY3VycmVudCBdICkgIH07XHJcbiAgICAgICAgICAgIFx0dGhpcy5zZXRJbnB1dCggdGhpcy5jWyAzICsgdGhpcy5jdXJyZW50IF0gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvKlxyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJycgKSByZXR1cm4gZmFsc2U7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2ID0geyB4OmUuY2xpZW50WCwgeTplLmNsaWVudFksIGQ6MCwgdjogdGhpcy5pc051bWJlciA/IHBhcnNlRmxvYXQodGhpcy52YWx1ZSkgOiBwYXJzZUZsb2F0KCB0aGlzLnZhbHVlWyB0aGlzLmN1cnJlbnQgXSApICB9O1xyXG5cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSggMiwgbmFtZSApOyovXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZXVwOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgXHRpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMucHJldiA9IHsgeDowLCB5OjAsIGQ6MCwgdjowIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgLyp2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApeyBcclxuXHJcbiAgICAgICAgICAgIC8vdmFyIHRtID0gdGhpcy5jdXJyZW50O1xyXG4gICAgICAgICAgICB2YXIgdGQgPSB0aGlzLnByZXYuZDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLnByZXYgPSB7IHg6MCwgeTowLCBkOjAsIHY6MCB9O1xyXG5cclxuICAgICAgICAgICAgaWYoICF0ZCApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1sgMyArIG5hbWUgXSApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7Ly90aGlzLm1vZGUoIDIsIG5hbWUgKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNldCgpOy8vdGhpcy5tb2RlKCAwLCB0bSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBudXAgPSBmYWxzZTtcclxuICAgICAgICB2YXIgeCA9IDA7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJycgKSB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIGVsc2V7IFxyXG4gICAgICAgIFx0aWYoIXRoaXMuaXNEcmFnKSB0aGlzLmN1cnNvcigndGV4dCcpO1xyXG4gICAgICAgIFx0ZWxzZSB0aGlzLmN1cnNvciggdGhpcy5jdXJyZW50ICE9PSAtMSA/ICdtb3ZlJyA6ICdwb2ludGVyJyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRHJhZyApe1xyXG4gICAgICAgIFx0aWYoIHRoaXMuY3VycmVudCAhPT0gLTEgKXtcclxuXHJcbiAgICAgICAgXHR0aGlzLnByZXYuZCArPSAoIGUuY2xpZW50WCAtIHRoaXMucHJldi54ICkgLSAoIGUuY2xpZW50WSAtIHRoaXMucHJldi55ICk7XHJcblxyXG4gICAgICAgICAgICB2YXIgbiA9IHRoaXMucHJldi52ICsgKCB0aGlzLnByZXYuZCAqIHRoaXMuc3RlcCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZhbHVlWyB0aGlzLmN1cnJlbnQgXSA9IHRoaXMubnVtVmFsdWUobik7XHJcbiAgICAgICAgICAgIHRoaXMuY1sgMyArIHRoaXMuY3VycmVudCBdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVt0aGlzLmN1cnJlbnRdO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52YWxpZGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmV2LnggPSBlLmNsaWVudFg7XHJcbiAgICAgICAgICAgIHRoaXMucHJldi55ID0gZS5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgXHRpZiggdGhpcy5pc0Rvd24gKSB4ID0gZS5jbGllbnRYIC0gdGhpcy56b25lLnggLTM7XHJcbiAgICAgICAgXHRpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApIHggLT0gdGhpcy50bXBbdGhpcy5jdXJyZW50XVswXVxyXG4gICAgICAgIFx0cmV0dXJuIHRoaXMudXBJbnB1dCggeCwgdGhpcy5pc0Rvd24gKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvL2tleWRvd246IGZ1bmN0aW9uICggZSApIHsgcmV0dXJuIHRydWU7IH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBudXAgPSBmYWxzZTtcclxuICAgICAgICAvL3RoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jdXJyZW50ID0gMDtcclxuXHJcbiAgICAgICAvKiB2YXIgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICBpZih0aGlzLmNNb2RlW2ldIT09MCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNNb2RlW2ldID0gMDtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy5jWzIraV0uc3R5bGUuYm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5ib3JkZXI7XHJcbiAgICAgICAgICAgICAgICBudXAgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uICggdiwgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMDtcclxuICAgICAgICB0aGlzLnZhbHVlW25dID0gdGhpcy5udW1WYWx1ZSggdiApO1xyXG4gICAgICAgIHRoaXMuY1sgMyArIG4gXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbbl07XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdDogZnVuY3Rpb24gKCBjLCBlLCB3ICkge1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuICAgICAgICB2YXIgZCA9IHRoaXMuY3VycmVudCAhPT0gLTEgPyB0aGlzLnRtcFt0aGlzLmN1cnJlbnRdWzBdICsgNSA6IDA7XHJcbiAgICAgICAgc1t0aGlzLmN1cnNvcklkXS53aWR0aCA9ICcxcHgnO1xyXG4gICAgICAgIHNbdGhpcy5jdXJzb3JJZF0ubGVmdCA9ICggZCArIGMgKSArICdweCc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gKCBkICsgZSApICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gdyArICdweCc7XHJcbiAgICBcclxuICAgIH0sXHJcblxyXG4gICAgdW5zZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IDAgKyAncHgnO1xyXG4gICAgICAgIHNbdGhpcy5jdXJzb3JJZF0ud2lkdGggPSAwICsgJ3B4JztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHZhbGlkYXRlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBhciA9IFtdO1xyXG4gICAgICAgIHZhciBpID0gdGhpcy5sbmc7XHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgIFx0XHJcbiAgICAgICAgXHRpZighaXNOYU4oIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCApKXsgXHJcbiAgICAgICAgICAgICAgICB2YXIgbnggPSB0aGlzLm51bVZhbHVlKCB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IG54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZVtpXSA9IG54O1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBub3QgbnVtYmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW2ldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIFx0YXJbaV0gPSB0aGlzLnZhbHVlW2ldICogdGhpcy50b1JhZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzTnVtYmVyICkgdGhpcy5zZW5kKCBhclswXSApO1xyXG4gICAgICAgIGVsc2UgdGhpcy5zZW5kKCBhciApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVpJU0VcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByU2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICB2YXIgdyA9IE1hdGguZmxvb3IoICggdGhpcy5zYiArIDUgKSAvIHRoaXMubG5nICktNTtcclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuICAgICAgICB2YXIgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldID0gWyBNYXRoLmZsb29yKCB0aGlzLnNhICsgKCB3ICogaSApKyggNSAqIGkgKSksIHcgXTtcclxuICAgICAgICAgICAgdGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG4gICAgICAgICAgICBzWyAzICsgaSBdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCc7XHJcbiAgICAgICAgICAgIHNbIDMgKyBpIF0ud2lkdGggPSB0aGlzLnRtcFtpXVsxXSArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IE51bWVyaWMgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZnVuY3Rpb24gU2xpZGUgKCBvICl7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIHRoaXMuc2V0VHlwZU51bWJlciggbyApO1xyXG5cclxuXHJcbiAgICB0aGlzLm1vZGVsID0gby5zdHlwZSB8fCAwO1xyXG4gICAgaWYoIG8ubW9kZSAhPT0gdW5kZWZpbmVkICkgdGhpcy5tb2RlbCA9IG8ubW9kZTtcclxuICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5oaWRlO1xyXG5cclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzT3ZlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5hbGx3YXkgPSBvLmFsbHdheSB8fCBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmZpcnN0SW1wdXQgPSBmYWxzZTtcclxuXHJcbiAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2xldHRlci1zcGFjaW5nOi0xcHg7IHRleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IrJzsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ3RleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IrJzsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgIC8vdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnbGV0dGVyLXNwYWNpbmc6LTFweDsgdGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NDdweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIHRvcDowOyBoZWlnaHQ6Jyt0aGlzLmgrJ3B4OycgKTtcclxuICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYmFja2dyb3VuZDonK3RoaXMuY29sb3JzLnNjcm9sbGJhY2srJzsgdG9wOjJweDsgaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7JyApO1xyXG4gICAgdGhpcy5jWzVdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdsZWZ0OjRweDsgdG9wOjVweDsgaGVpZ2h0OicrKHRoaXMuaC0xMCkrJ3B4OyBiYWNrZ3JvdW5kOicgKyB0aGlzLmZvbnRDb2xvciArJzsnICk7XHJcblxyXG4gICAgdGhpcy5jWzJdLmlzTnVtID0gdHJ1ZTtcclxuICAgIC8vdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9ICh0aGlzLmgtNCkgKyAncHgnO1xyXG4gICAgLy90aGlzLmNbMl0uc3R5bGUubGluZUhlaWdodCA9ICh0aGlzLmgtOCkgKyAncHgnO1xyXG4gICAgdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9ICh0aGlzLmgtMikgKyAncHgnO1xyXG4gICAgdGhpcy5jWzJdLnN0eWxlLmxpbmVIZWlnaHQgPSAodGhpcy5oLTEwKSArICdweCc7XHJcblxyXG4gICAgaWYodGhpcy5tb2RlbCAhPT0gMCl7XHJcbiAgICAgICAgaWYodGhpcy5tb2RlbCA9PT0gMSB8fCB0aGlzLm1vZGVsID09PSAzKXtcclxuICAgICAgICAgICAgdmFyIGgxID0gNDtcclxuICAgICAgICAgICAgdmFyIGgyID0gODtcclxuICAgICAgICAgICAgdmFyIHd3ID0gdGhpcy5oLTQ7XHJcbiAgICAgICAgICAgIHZhciByYSA9IDIwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYodGhpcy5tb2RlbCA9PT0gMil7XHJcbiAgICAgICAgICAgIGgxID0gNDsvLzJcclxuICAgICAgICAgICAgaDIgPSA4O1xyXG4gICAgICAgICAgICByYSA9IDI7XHJcbiAgICAgICAgICAgIHd3ID0gKHRoaXMuaC00KSowLjVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgPT09IDMpIHRoaXMuY1s1XS5zdHlsZS52aXNpYmxlID0gJ25vbmUnO1xyXG5cclxuICAgICAgICB0aGlzLmNbNF0uc3R5bGUuYm9yZGVyUmFkaXVzID0gaDEgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1s0XS5zdHlsZS5oZWlnaHQgPSBoMiArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzRdLnN0eWxlLnRvcCA9ICh0aGlzLmgqMC41KSAtIGgxICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbNV0uc3R5bGUuYm9yZGVyUmFkaXVzID0gKGgxKjAuNSkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1s1XS5zdHlsZS5oZWlnaHQgPSBoMSArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzVdLnN0eWxlLnRvcCA9ICh0aGlzLmgqMC41KS0oaDEqMC41KSArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuY1s2XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYm9yZGVyLXJhZGl1czonK3JhKydweDsgbWFyZ2luLWxlZnQ6JysoLXd3KjAuNSkrJ3B4OyBib3JkZXI6MXB4IHNvbGlkICcrdGhpcy5jb2xvcnMuYm9yZGVyKyc7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7IGxlZnQ6NHB4OyB0b3A6MnB4OyBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsgd2lkdGg6Jyt3dysncHg7JyApO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG5cclxufVxyXG5cclxuU2xpZGUucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogU2xpZGUsXHJcblxyXG4gICAgdGVzdFpvbmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIGwueCA+PSB0aGlzLnR4bCApIHJldHVybiAndGV4dCc7XHJcbiAgICAgICAgZWxzZSBpZiggbC54ID49IHRoaXMuc2EgKSByZXR1cm4gJ3Njcm9sbCc7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gJyc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXA6IGZ1bmN0aW9uICggZSApIHtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKSB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdzY3JvbGwnICl7IFxyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3RleHQnICl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1syXSwgZnVuY3Rpb24oKXsgdGhpcy52YWxpZGF0ZSgpIH0uYmluZCh0aGlzKSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIG51cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdzY3JvbGwnICkge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGUoMSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCd3LXJlc2l6ZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZihuYW1lID09PSAndGV4dCcpeyBcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcblxyXG4gICAgICAgICAgICB2YXIgbiA9ICgoKCBlLmNsaWVudFggLSAodGhpcy56b25lLngrdGhpcy5zYSkgLSAzICkgLyB0aGlzLnd3ICkgKiB0aGlzLnJhbmdlICsgdGhpcy5taW4gKSAtIHRoaXMub2xkO1xyXG4gICAgICAgICAgICBpZihuID49IHRoaXMuc3RlcCB8fCBuIDw9IHRoaXMuc3RlcCl7IFxyXG4gICAgICAgICAgICAgICAgbiA9IE1hdGguZmxvb3IoIG4gLyB0aGlzLnN0ZXAgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB0aGlzLm9sZCArICggbiAqIHRoaXMuc3RlcCApICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG51cCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAga2V5ZG93bjogZnVuY3Rpb24gKCBlICkgeyByZXR1cm4gdHJ1ZTsgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgbiA9IHRoaXMuY1syXS50ZXh0Q29udGVudDtcclxuXHJcbiAgICAgICAgaWYoIWlzTmFOKCBuICkpeyBcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIG4gKTsgXHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKHRydWUpOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGVsc2UgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAvL3RoaXMuY2xlYXJJbnB1dCgpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW9kZTogZnVuY3Rpb24gKCBtb2RlICkge1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgLy8gc1syXS5ib3JkZXIgPSAnMXB4IHNvbGlkICcgKyB0aGlzLmNvbG9ycy5oaWRlO1xyXG4gICAgICAgICAgICAgICAgc1syXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgc1s0XS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2Nyb2xsYmFjaztcclxuICAgICAgICAgICAgICAgIHNbNV0uYmFja2dyb3VuZCA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBzY3JvbGwgb3ZlclxyXG4gICAgICAgICAgICAgICAgLy9zWzJdLmJvcmRlciA9ICcxcHggZGFzaGVkICcgKyB0aGlzLmNvbG9ycy5oaWRlO1xyXG4gICAgICAgICAgICAgICAgc1syXS5jb2xvciA9IHRoaXMuY29sb3JQbHVzO1xyXG4gICAgICAgICAgICAgICAgc1s0XS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2Nyb2xsYmFja292ZXI7XHJcbiAgICAgICAgICAgICAgICBzWzVdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9yUGx1cztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgLyogY2FzZSAyOiBcclxuICAgICAgICAgICAgICAgIHNbMl0uYm9yZGVyID0gJzFweCBzb2xpZCAnICsgdGhpcy5jb2xvcnMuYm9yZGVyU2VsZWN0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOiBcclxuICAgICAgICAgICAgICAgIHNbMl0uYm9yZGVyID0gJzFweCBkYXNoZWQgJyArIHRoaXMuZm9udENvbG9yOy8vdGhpcy5jb2xvcnMuYm9yZGVyU2VsZWN0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OiBcclxuICAgICAgICAgICAgICAgIHNbMl0uYm9yZGVyID0gJzFweCBkYXNoZWQgJyArIHRoaXMuY29sb3JzLmhpZGU7XHJcbiAgICAgICAgICAgIGJyZWFrOyovXHJcblxyXG5cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCB1cCApIHtcclxuXHJcbiAgICAgICAgdmFyIHd3ID0gTWF0aC5mbG9vciggdGhpcy53dyAqICgoIHRoaXMudmFsdWUgLSB0aGlzLm1pbiApIC8gdGhpcy5yYW5nZSApKTtcclxuICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgIT09IDMpIHRoaXMuc1s1XS53aWR0aCA9IHd3ICsgJ3B4JztcclxuICAgICAgICBpZih0aGlzLnNbNl0pIHRoaXMuc1s2XS5sZWZ0ID0gKCB0aGlzLnNhICsgd3cgKyAzICkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgclNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdmFyIHcgPSB0aGlzLnNiIC0gdGhpcy5zYztcclxuICAgICAgICB0aGlzLnd3ID0gdyAtIDY7XHJcblxyXG4gICAgICAgIHZhciB0eCA9IHRoaXMuc2M7XHJcbiAgICAgICAgaWYodGhpcy5pc1VJIHx8ICF0aGlzLnNpbXBsZSkgdHggPSB0aGlzLnNjKzEwO1xyXG4gICAgICAgIHRoaXMudHhsID0gdGhpcy53IC0gdHggKyAyO1xyXG5cclxuICAgICAgICAvL3ZhciB0eSA9IE1hdGguZmxvb3IodGhpcy5oICogMC41KSAtIDg7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzWzJdLndpZHRoID0gKHRoaXMuc2MgLTYgKSsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSAodGhpcy50eGwgKzQpICsgJ3B4JztcclxuICAgICAgICAvL3NbMl0udG9wID0gdHkgKyAncHgnO1xyXG4gICAgICAgIHNbM10ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzRdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzRdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1s1XS5sZWZ0ID0gKHRoaXMuc2EgKyAzKSArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IFNsaWRlIH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmZ1bmN0aW9uIFRleHRJbnB1dCggbyApe1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICB0aGlzLmNtb2RlID0gMDtcclxuXHJcbiAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCAnJztcclxuICAgIHRoaXMucGxhY2VIb2xkZXIgPSBvLnBsYWNlSG9sZGVyIHx8ICcnO1xyXG5cclxuICAgIHRoaXMuYWxsd2F5ID0gby5hbGx3YXkgfHwgZmFsc2U7XHJcbiAgICAvL3RoaXMuZmlyc3RJbXB1dCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgLy8gYmdcclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLnNlbGVjdCArICc7IHRvcDo0cHg7IHdpZHRoOjBweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OycgKTtcclxuXHJcbiAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdoZWlnaHQ6JyArICh0aGlzLmgtNCkgKyAncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC04KSsncHg7IGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLmlucHV0QmcgKyAnOyBib3JkZXJDb2xvcjonICsgdGhpcy5jb2xvcnMuaW5wdXRCb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnICk7XHJcbiAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgIC8vIGN1cnNvclxyXG4gICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6NHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7IHdpZHRoOjBweDsgYmFja2dyb3VuZDonK3RoaXMuZm9udENvbG9yKyc7JyApO1xyXG5cclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbn1cclxuXHJcblRleHRJbnB1dC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBUZXh0SW5wdXQsXHJcblxyXG4gICAgdGVzdFpvbmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgaWYoIGwueCA+PSB0aGlzLnNhICkgcmV0dXJuICd0ZXh0JztcclxuICAgICAgICByZXR1cm4gJyc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYoIG5hbWUgPT09ICd0ZXh0JyApIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1szXSApO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgLy92YXIgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgLy9pZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICl7IHJldHVybjt9XHJcblxyXG4gICAgICAgIC8vaWYoIGwueCA+PSB0aGlzLnNhICkgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICAvL2Vsc2UgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgdmFyIHggPSAwO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3RleHQnICkgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICBlbHNlIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApIHggPSBlLmNsaWVudFggLSB0aGlzLnpvbmUueDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXBJbnB1dCggeCAtIHRoaXMuc2EgLTMsIHRoaXMuaXNEb3duICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uICggYywgZSwgcyApIHtcclxuXHJcbiAgICAgICAgdGhpcy5zWzRdLndpZHRoID0gJzFweCc7XHJcbiAgICAgICAgdGhpcy5zWzRdLmxlZnQgPSAodGhpcy5zYSArIGMrNSkgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnNbMl0ubGVmdCA9ICh0aGlzLnNhICsgZSs1KSArICdweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLndpZHRoID0gcysncHgnO1xyXG4gICAgXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdDogZnVuY3Rpb24gKCBjLCBlLCB3ICkge1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuICAgICAgICB2YXIgZCA9IHRoaXMuc2EgKyA1O1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSAnMXB4JztcclxuICAgICAgICBzWzRdLmxlZnQgPSAoIGQgKyBjICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICggZCArIGUgKSArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgXHJcbiAgICB9LFxyXG5cclxuICAgIHVuc2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAwICsgJ3B4JztcclxuICAgICAgICBzWzRdLndpZHRoID0gMCArICdweCc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB2YWxpZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5jWzNdLnRleHRDb250ZW50O1xyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVpJU0VcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByU2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuICAgICAgICBzWzNdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzNdLndpZHRoID0gdGhpcy5zYiArICdweCc7XHJcbiAgICAgXHJcbiAgICB9LFxyXG5cclxuXHJcbn0pO1xyXG5cclxuZXhwb3J0IHsgVGV4dElucHV0IH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmZ1bmN0aW9uIFRpdGxlICggbyApIHtcclxuICAgIFxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIHZhciBwcmVmaXggPSBvLnByZWZpeCB8fCAnJztcclxuXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOnJpZ2h0OyB3aWR0aDo2MHB4OyBsaW5lLWhlaWdodDonKyAodGhpcy5oLTgpICsgJ3B4OyBjb2xvcjonICsgdGhpcy5mb250Q29sb3IgKTtcclxuXHJcbiAgICBpZiggdGhpcy5oID09PSAzMSApe1xyXG5cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMV0udG9wID0gOCArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9IDggKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0aGlzLnR4dC5zdWJzdHJpbmcoMCwxKS50b1VwcGVyQ2FzZSgpICsgdGhpcy50eHQuc3Vic3RyaW5nKDEpLnJlcGxhY2UoXCItXCIsIFwiIFwiKTtcclxuICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHByZWZpeDtcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbn1cclxuXHJcblRpdGxlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFRpdGxlLFxyXG5cclxuICAgIHRleHQ6IGZ1bmN0aW9uICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXh0MjogZnVuY3Rpb24gKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcbiAgICAgICAgdGhpcy5zWzFdLndpZHRoID0gdGhpcy53IC0gNTAgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5sZWZ0ID0gdGhpcy53IC0gKCA1MCArIDI2ICkgKyAncHgnO1xyXG5cclxuICAgIH0sXHJcblxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBUaXRsZSB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5mdW5jdGlvbiBTZWxlY3RvciAoIG8gKSB7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIHRoaXMudmFsdWVzID0gby52YWx1ZXM7XHJcbiAgICBpZih0eXBlb2YgdGhpcy52YWx1ZXMgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZXMgPSBbIHRoaXMudmFsdWVzIF07XHJcblxyXG4gICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgdGhpcy52YWx1ZXNbMF07XHJcblxyXG5cclxuXHJcbiAgICAvL3RoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZXMubGVuZ3RoO1xyXG4gICAgdGhpcy50bXAgPSBbXTtcclxuICAgIHRoaXMuc3RhdCA9IFtdO1xyXG5cclxuICAgIHZhciBzZWw7XHJcblxyXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubG5nOyBpKyspe1xyXG5cclxuICAgICAgICBzZWwgPSBmYWxzZTtcclxuICAgICAgICBpZiggdGhpcy52YWx1ZXNbaV0gPT09IHRoaXMudmFsdWUgKSBzZWwgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmNbaSsyXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6MXB4OyBiYWNrZ3JvdW5kOicrKHNlbD8gdGhpcy5jb2xvcnMuc2VsZWN0IDogdGhpcy5idXR0b25Db2xvcikrJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1tpKzJdLnN0eWxlLmNvbG9yID0gc2VsID8gJyNGRkYnIDogdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgdGhpcy5jW2krMl0uaW5uZXJIVE1MID0gdGhpcy52YWx1ZXNbaV07XHJcbiAgICAgICAgLy90aGlzLmNbaSsyXS5uYW1lID0gdGhpcy52YWx1ZXNbaV07XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zdGF0W2ldID0gc2VsID8gMzoxO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG5cclxufVxyXG5cclxuU2VsZWN0b3IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogU2VsZWN0b3IsXHJcblxyXG4gICAgdGVzdFpvbmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgXHRpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaSsyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXA6IGZ1bmN0aW9uICggZSApIHtcclxuICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICAvL3RoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICBcdHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzWyBuYW1lLTIgXTtcclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgIFx0cmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiBcclxuICAgICAgICAvLyB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICAvL3ZhciBzZWwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2cobmFtZSlcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgIT09ICcnICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgbmFtZSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHR1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb2RlczogZnVuY3Rpb24gKCBuLCBuYW1lICkge1xyXG5cclxuICAgICAgICB2YXIgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09PSBuYW1lLTIgJiYgdGhpcy52YWx1ZXNbIGkgXSAhPT0gdGhpcy52YWx1ZSApIHYgPSB0aGlzLm1vZGUoIG4sIGkrMiApO1xyXG4gICAgICAgICAgICBlbHNleyBcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy52YWx1ZXNbIGkgXSA9PT0gdGhpcy52YWx1ZSApIHYgPSB0aGlzLm1vZGUoIDMsIGkrMiApO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB2ID0gdGhpcy5tb2RlKCAxLCBpKzIgKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW9kZTogZnVuY3Rpb24gKCBuLCBuYW1lICkge1xyXG5cclxuICAgICAgICB2YXIgY2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBpID0gbmFtZSAtIDI7XHJcblxyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0W2ldICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdFtpXSA9IDE7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdFtpXSA9IDI7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSAnI0ZGRic7ICAgICAgICAgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMub3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdFtpXSA9IDM7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSAnI0ZGRic7ICAgICAgICAgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0OyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICB2YXIgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1sgaSBdID09PSB0aGlzLnZhbHVlICkgdiA9IHRoaXMubW9kZSggMywgaSsyICk7XHJcbiAgICAgICAgICAgIGVsc2UgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHI7Ly90aGlzLm1vZGVzKCAxICwgMiApO1xyXG5cclxuICAgIFx0LyppZiggdGhpcy5zZWxlY3RlZCApe1xyXG4gICAgXHRcdHRoaXMuc1sgdGhpcy5zZWxlY3RlZCBdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuc1sgdGhpcy5zZWxlY3RlZCBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgXHR9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlOyovXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBsYWJlbDogZnVuY3Rpb24gKCBzdHJpbmcsIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5jW25dLnRleHRDb250ZW50ID0gc3RyaW5nO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaWNvbjogZnVuY3Rpb24gKCBzdHJpbmcsIHksIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5zW25dLnBhZGRpbmcgPSAoIHkgfHwgMCApICsncHggMHB4JztcclxuICAgICAgICB0aGlzLmNbbl0uaW5uZXJIVE1MID0gc3RyaW5nO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgclNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgdmFyIHcgPSB0aGlzLnNiO1xyXG4gICAgICAgIHZhciBkID0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLmxuZztcclxuICAgICAgICB2YXIgZGMgPSAgMztcclxuICAgICAgICB2YXIgc2l6ZSA9IE1hdGguZmxvb3IoICggdy0oZGMqKGktMSkpICkgLyBpICk7XHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcblxyXG4gICAgICAgIFx0dGhpcy50bXBbaV0gPSBbIE1hdGguZmxvb3IoIGQgKyAoIHNpemUgKiBpICkgKyAoIGRjICogaSApKSwgc2l6ZSBdO1xyXG4gICAgICAgIFx0dGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG4gICAgICAgICAgICBzW2krMl0ubGVmdCA9IHRoaXMudG1wW2ldWzBdICsgJ3B4JztcclxuICAgICAgICAgICAgc1tpKzJdLndpZHRoID0gdGhpcy50bXBbaV1bMV0gKyAncHgnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgU2VsZWN0b3IgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZnVuY3Rpb24gRW1wdHkgKCBvICl7XHJcblxyXG4gICAgby5zaW1wbGUgPSB0cnVlO1xyXG4gICAgby5pc0VtcHR5ID0gdHJ1ZTtcclxuXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG59XHJcblxyXG5FbXB0eS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBFbXB0eSxcclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IEVtcHR5IH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmZ1bmN0aW9uIEl0ZW0gKCBvICl7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG4gICAgdGhpcy5wID0gMTAwO1xyXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMudHh0O1xyXG4gICAgdGhpcy5zdGF0dXMgPSAxO1xyXG5cclxuICAgIHRoaXMuZ3JhcGggPSB0aGlzLnN2Z3Nbby5pdHlwZSB8fCAnbm9uZSddO1xyXG5cclxuICAgIHZhciBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNztcclxuXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTRweDsgaGVpZ2h0OjE0cHg7IGxlZnQ6NXB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuZ3JhcGgsIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuXHJcbiAgICB0aGlzLnNbMV0ubWFyZ2luTGVmdCA9IDIwICsgJ3B4JztcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbn1cclxuXHJcbkl0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogSXRlbSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuICAgICAgICAvL3VwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgbmFtZSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4ucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQoIHRydWUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdWlvdXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMyk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1aW92ZXI6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoNCk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm1vZGUoMik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb2RlOiBmdW5jdGlvbiAoIG4gKSB7XHJcblxyXG4gICAgICAgIHZhciBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdHVzICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9IG47XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0dXMgPSAxOyB0aGlzLnNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgdGhpcy5zWzBdLmJhY2tncm91bmQgPSAnbm9uZSc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXR1cyA9IDI7IHRoaXMuc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmdPdmVyOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0dXMgPSAzOyB0aGlzLnNbMV0uY29sb3IgPSAnI0ZGRic7ICAgICAgICAgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiB0aGlzLnN0YXR1cyA9IDQ7IHRoaXMuc1sxXS5jb2xvciA9ICcjRkZGJzsgICAgICAgICB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgIC8vIHJldHVybiB0aGlzLm1vZGUoIDEgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNlbGVjdGVkOiBmdW5jdGlvbiAoIGIgKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZWxlY3QgPSBiIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSgzKTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgSXRlbSB9OyIsIlxyXG5pbXBvcnQgeyBCb29sIH0gZnJvbSAnLi4vcHJvdG8vQm9vbC5qcyc7XHJcbmltcG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4uL3Byb3RvL0J1dHRvbi5qcyc7XHJcbmltcG9ydCB7IENpcmN1bGFyIH0gZnJvbSAnLi4vcHJvdG8vQ2lyY3VsYXIuanMnO1xyXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJy4uL3Byb3RvL0NvbG9yLmpzJztcclxuaW1wb3J0IHsgRnBzIH0gZnJvbSAnLi4vcHJvdG8vRnBzLmpzJztcclxuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi9wcm90by9HcmFwaC5qcyc7XHJcbmltcG9ydCB7IEdyb3VwICB9IGZyb20gJy4uL3Byb3RvL0dyb3VwLmpzJztcclxuaW1wb3J0IHsgSm95c3RpY2sgfSBmcm9tICcuLi9wcm90by9Kb3lzdGljay5qcyc7XHJcbmltcG9ydCB7IEtub2IgfSBmcm9tICcuLi9wcm90by9Lbm9iLmpzJztcclxuaW1wb3J0IHsgTGlzdCB9IGZyb20gJy4uL3Byb3RvL0xpc3QuanMnO1xyXG5pbXBvcnQgeyBOdW1lcmljIH0gZnJvbSAnLi4vcHJvdG8vTnVtZXJpYy5qcyc7XHJcbmltcG9ydCB7IFNsaWRlIH0gZnJvbSAnLi4vcHJvdG8vU2xpZGUuanMnO1xyXG5pbXBvcnQgeyBUZXh0SW5wdXQgfSBmcm9tICcuLi9wcm90by9UZXh0SW5wdXQuanMnO1xyXG5pbXBvcnQgeyBUaXRsZSB9IGZyb20gJy4uL3Byb3RvL1RpdGxlLmpzJztcclxuaW1wb3J0IHsgU2VsZWN0b3IgfSBmcm9tICcuLi9wcm90by9TZWxlY3Rvci5qcyc7XHJcbmltcG9ydCB7IEVtcHR5IH0gZnJvbSAnLi4vcHJvdG8vRW1wdHkuanMnO1xyXG5pbXBvcnQgeyBJdGVtIH0gZnJvbSAnLi4vcHJvdG8vSXRlbS5qcyc7XHJcblxyXG4vKmZ1bmN0aW9uIGF1dG9UeXBlICgpIHtcclxuXHJcbiAgICB2YXIgYSA9IGFyZ3VtZW50cztcclxuICAgIHZhciB0eXBlID0gJ1NsaWRlJztcclxuICAgIGlmKCBhWzJdLnR5cGUgKSB0eXBlID0gYVsyXS50eXBlO1xyXG4gICAgcmV0dXJuIHR5cGU7XHJcblxyXG59OyovXHJcblxyXG5mdW5jdGlvbiBhZGQgKCkge1xyXG5cclxuICAgIHZhciBhID0gYXJndW1lbnRzOyBcclxuXHJcbiAgICB2YXIgdHlwZSwgbywgcmVmID0gZmFsc2UsIG4gPSBudWxsO1xyXG5cclxuICAgIGlmKCB0eXBlb2YgYVswXSA9PT0gJ3N0cmluZycgKXsgXHJcblxyXG4gICAgICAgIHR5cGUgPSBhWzBdO1xyXG4gICAgICAgIG8gPSBhWzFdIHx8IHt9O1xyXG5cclxuICAgIH0gZWxzZSBpZiAoIHR5cGVvZiBhWzBdID09PSAnb2JqZWN0JyApeyAvLyBsaWtlIGRhdCBndWlcclxuXHJcbiAgICAgICAgcmVmID0gdHJ1ZTtcclxuICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHt9KTtcclxuXHJcbiAgICAgICAgdHlwZSA9IGFbMl0udHlwZSA/IGFbMl0udHlwZSA6ICdzbGlkZSc7Ly9hdXRvVHlwZS5hcHBseSggdGhpcywgYSApO1xyXG5cclxuICAgICAgICBvID0gYVsyXTtcclxuICAgICAgICBvLm5hbWUgPSBhWzFdO1xyXG4gICAgICAgIG8udmFsdWUgPSBhWzBdW2FbMV1dO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YXIgbmFtZSA9IHR5cGUudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICBpZiggbmFtZSA9PT0gJ2dyb3VwJyApIG8uYWRkID0gYWRkO1xyXG5cclxuICAgIHN3aXRjaCggbmFtZSApe1xyXG5cclxuICAgICAgICBjYXNlICdib29sJzogbiA9IG5ldyBCb29sKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdidXR0b24nOiBuID0gbmV3IEJ1dHRvbihvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnY2lyY3VsYXInOiBuID0gbmV3IENpcmN1bGFyKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdjb2xvcic6IG4gPSBuZXcgQ29sb3Iobyk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2Zwcyc6IG4gPSBuZXcgRnBzKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdncmFwaCc6IG4gPSBuZXcgR3JhcGgobyk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2dyb3VwJzogbiA9IG5ldyBHcm91cChvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnam95c3RpY2snOiBuID0gbmV3IEpveXN0aWNrKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdrbm9iJzogbiA9IG5ldyBLbm9iKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdsaXN0JzogbiA9IG5ldyBMaXN0KG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdudW1lcmljJzogY2FzZSAnbnVtYmVyJzogbiA9IG5ldyBOdW1lcmljKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdzbGlkZSc6IG4gPSBuZXcgU2xpZGUobyk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3RleHRJbnB1dCc6IGNhc2UgJ3N0cmluZyc6IG4gPSBuZXcgVGV4dElucHV0KG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICd0aXRsZSc6IG4gPSBuZXcgVGl0bGUobyk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ3NlbGVjdG9yJzogbiA9IG5ldyBTZWxlY3RvcihvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZW1wdHknOiBjYXNlICdzcGFjZSc6IG4gPSBuZXcgRW1wdHkobyk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2l0ZW0nOiBuID0gbmV3IEl0ZW0obyk7IGJyZWFrO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpZiggbiAhPT0gbnVsbCApe1xyXG5cclxuICAgICAgICBpZiggcmVmICkgbi5zZXRSZWZlcmVuY3koIGFbMF0sIGFbMV0gKTtcclxuICAgICAgICByZXR1cm4gbjtcclxuXHJcbiAgICB9XHJcbiAgICBcclxuXHJcbn07XHJcblxyXG5leHBvcnQgeyBhZGQgfTsiLCJcclxuaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuL1Jvb3RzJztcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuL1Rvb2xzJztcclxuaW1wb3J0IHsgYWRkIH0gZnJvbSAnLi9hZGQnO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4vVjInO1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gR3VpICggbyApIHtcclxuXHJcbiAgICB0aGlzLmNhbnZhcyA9IG51bGw7XHJcblxyXG4gICAgbyA9IG8gfHwge307XHJcblxyXG4gICAgLy8gY29sb3JcclxuICAgIHRoaXMuY29sb3JzID0gVG9vbHMuY2xvbmVDb2xvcigpO1xyXG4gICAgdGhpcy5jc3MgPSBUb29scy5jbG9uZUNzcygpO1xyXG5cclxuXHJcbiAgICBpZiggby5jb25maWcgKSB0aGlzLnNldENvbmZpZyggby5jb25maWcgKTtcclxuXHJcblxyXG4gICAgdGhpcy5iZyA9IG8uYmcgfHwgdGhpcy5jb2xvcnMuYmFja2dyb3VuZDtcclxuXHJcbiAgICBpZiggby50cmFuc3BhcmVudCAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgdGhpcy5jb2xvcnMuYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgICAgICB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kT3ZlciA9ICdub25lJztcclxuICAgIH1cclxuXHJcbiAgICAvL2lmKCBvLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayA9ICBvLmNhbGxiYWNrO1xyXG5cclxuICAgIHRoaXMuaXNSZXNldCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy50bXBBZGQgPSBudWxsO1xyXG4gICAgdGhpcy50bXBIID0gMDtcclxuXHJcbiAgICB0aGlzLmlzQ2FudmFzID0gby5pc0NhbnZhcyB8fCBmYWxzZTtcclxuICAgIHRoaXMuaXNDYW52YXNPbmx5ID0gZmFsc2U7XHJcbiAgICB0aGlzLmNzc0d1aSA9IG8uY3NzICE9PSB1bmRlZmluZWQgPyBvLmNzcyA6ICcnO1xyXG4gICAgdGhpcy5jYWxsYmFjayA9IG8uY2FsbGJhY2sgID09PSB1bmRlZmluZWQgPyBudWxsIDogby5jYWxsYmFjaztcclxuXHJcbiAgICB0aGlzLmZvcmNlSGVpZ2h0ID0gby5tYXhIZWlnaHQgfHwgMDtcclxuICAgIHRoaXMubG9ja0hlaWdodCA9IG8ubG9ja0hlaWdodCB8fCBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmlzSXRlbU1vZGUgPSBvLml0ZW1Nb2RlICE9PSB1bmRlZmluZWQgPyBvLml0ZW1Nb2RlIDogZmFsc2U7XHJcblxyXG4gICAgdGhpcy5jbiA9ICcnO1xyXG4gICAgXHJcbiAgICAvLyBzaXplIGRlZmluZVxyXG4gICAgdGhpcy5zaXplID0gVG9vbHMuc2l6ZTtcclxuICAgIGlmKCBvLnAgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS5wID0gby5wO1xyXG4gICAgaWYoIG8udyAhPT0gdW5kZWZpbmVkICkgdGhpcy5zaXplLncgPSBvLnc7XHJcbiAgICBpZiggby5oICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUuaCA9IG8uaDtcclxuICAgIGlmKCBvLnMgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS5zID0gby5zO1xyXG5cclxuICAgIHRoaXMuc2l6ZS5oID0gdGhpcy5zaXplLmggPCAxMSA/IDExIDogdGhpcy5zaXplLmg7XHJcblxyXG4gICAgLy8gbG9jYWwgbW91c2UgYW5kIHpvbmVcclxuICAgIHRoaXMubG9jYWwgPSBuZXcgVjIoKS5uZWcoKTtcclxuICAgIHRoaXMuem9uZSA9IHsgeDowLCB5OjAsIHc6dGhpcy5zaXplLncsIGg6MCB9O1xyXG5cclxuICAgIC8vIHZpcnR1YWwgbW91c2VcclxuICAgIHRoaXMubW91c2UgPSBuZXcgVjIoKS5uZWcoKTtcclxuXHJcbiAgICB0aGlzLmggPSAwO1xyXG4gICAgdGhpcy5wcmV2WSA9IC0xO1xyXG4gICAgdGhpcy5zdyA9IDA7XHJcblxyXG4gICAgXHJcblxyXG4gICAgLy8gYm90dG9tIGFuZCBjbG9zZSBoZWlnaHRcclxuICAgIHRoaXMuaXNXaXRoQ2xvc2UgPSBvLmNsb3NlICE9PSB1bmRlZmluZWQgPyBvLmNsb3NlIDogdHJ1ZTtcclxuICAgIHRoaXMuYmggPSAhdGhpcy5pc1dpdGhDbG9zZSA/IDAgOiB0aGlzLnNpemUuaDtcclxuXHJcbiAgICB0aGlzLmF1dG9SZXNpemUgPSBvLmF1dG9SZXNpemUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvLmF1dG9SZXNpemU7XHJcbiAgICBcclxuICAgIHRoaXMuaXNDZW50ZXIgPSBvLmNlbnRlciB8fCBmYWxzZTtcclxuICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzU2Nyb2xsID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy51aXMgPSBbXTtcclxuXHJcbiAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuICAgIHRoaXMuZGVjYWwgPSAwO1xyXG4gICAgdGhpcy5yYXRpbyA9IDE7XHJcbiAgICB0aGlzLm95ID0gMDtcclxuXHJcblxyXG5cclxuICAgIHRoaXMuaXNOZXdUYXJnZXQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmNvbnRlbnQgPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgd2lkdGg6MHB4OyBoZWlnaHQ6YXV0bzsgdG9wOjBweDsgJyArIHRoaXMuY3NzR3VpICk7XHJcblxyXG4gICAgdGhpcy5pbm5lckNvbnRlbnQgPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyB0b3A6MDsgbGVmdDowOyBoZWlnaHQ6YXV0bzsgb3ZlcmZsb3c6aGlkZGVuOycpO1xyXG4gICAgdGhpcy5jb250ZW50LmFwcGVuZENoaWxkKCB0aGlzLmlubmVyQ29udGVudCApO1xyXG5cclxuICAgIHRoaXMuaW5uZXIgPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBsZWZ0OjA7ICcpO1xyXG4gICAgdGhpcy5pbm5lckNvbnRlbnQuYXBwZW5kQ2hpbGQodGhpcy5pbm5lcik7XHJcblxyXG4gICAgLy8gc2Nyb2xsXHJcbiAgICB0aGlzLnNjcm9sbEJHID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncmlnaHQ6MDsgdG9wOjA7IHdpZHRoOicrICh0aGlzLnNpemUucyAtIDEpICsncHg7IGhlaWdodDoxMHB4OyBkaXNwbGF5Om5vbmU7IGJhY2tncm91bmQ6Jyt0aGlzLmJnKyc7Jyk7XHJcbiAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuc2Nyb2xsQkcgKTtcclxuXHJcbiAgICB0aGlzLnNjcm9sbCA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2JhY2tncm91bmQ6Jyt0aGlzLmNvbG9ycy5zY3JvbGwrJzsgcmlnaHQ6MnB4OyB0b3A6MDsgd2lkdGg6JysodGhpcy5zaXplLnMtNCkrJ3B4OyBoZWlnaHQ6MTBweDsnKTtcclxuICAgIHRoaXMuc2Nyb2xsQkcuYXBwZW5kQ2hpbGQoIHRoaXMuc2Nyb2xsICk7XHJcblxyXG4gICAgLy8gYm90dG9tIGJ1dHRvblxyXG4gICAgdGhpcy5ib3R0b20gPSBUb29scy5kb20oICdkaXYnLCAgdGhpcy5jc3MudHh0ICsgJ3dpZHRoOjEwMCU7IHRvcDphdXRvOyBib3R0b206MDsgbGVmdDowOyBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czoxMHB4OyAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czoxMHB4OyB0ZXh0LWFsaWduOmNlbnRlcjsgaGVpZ2h0OicrdGhpcy5iaCsncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuYmgtNSkrJ3B4OyBib3JkZXItdG9wOjFweCBzb2xpZCAnK1Rvb2xzLmNvbG9ycy5zdHJva2UrJzsnKTtcclxuICAgIHRoaXMuY29udGVudC5hcHBlbmRDaGlsZCggdGhpcy5ib3R0b20gKTtcclxuICAgIHRoaXMuYm90dG9tLnRleHRDb250ZW50ID0gJ2Nsb3NlJztcclxuICAgIHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJnO1xyXG5cclxuICAgIC8vXHJcblxyXG4gICAgdGhpcy5wYXJlbnQgPSBvLnBhcmVudCAhPT0gdW5kZWZpbmVkID8gby5wYXJlbnQgOiBudWxsO1xyXG4gICAgXHJcbiAgICBpZiggdGhpcy5wYXJlbnQgPT09IG51bGwgJiYgIXRoaXMuaXNDYW52YXMgKXsgXHJcbiAgICBcdHRoaXMucGFyZW50ID0gZG9jdW1lbnQuYm9keTtcclxuICAgICAgICAvLyBkZWZhdWx0IHBvc2l0aW9uXHJcbiAgICBcdGlmKCAhdGhpcy5pc0NlbnRlciApIHRoaXMuY29udGVudC5zdHlsZS5yaWdodCA9ICcxMHB4JzsgXHJcbiAgICB9XHJcblxyXG4gICAgaWYoIHRoaXMucGFyZW50ICE9PSBudWxsICkgdGhpcy5wYXJlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuY29udGVudCApO1xyXG5cclxuICAgIGlmKCB0aGlzLmlzQ2FudmFzICYmIHRoaXMucGFyZW50ID09PSBudWxsICkgdGhpcy5pc0NhbnZhc09ubHkgPSB0cnVlO1xyXG5cclxuICAgIGlmKCAhdGhpcy5pc0NhbnZhc09ubHkgKSB0aGlzLmNvbnRlbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuXHJcblxyXG4gICAgdGhpcy5zZXRXaWR0aCgpO1xyXG5cclxuICAgIGlmKCB0aGlzLmlzQ2FudmFzICkgdGhpcy5tYWtlQ2FudmFzKCk7XHJcblxyXG4gICAgUm9vdHMuYWRkKCB0aGlzICk7XHJcblxyXG59XHJcblxyXG5PYmplY3QuYXNzaWduKCBHdWkucHJvdG90eXBlLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IEd1aSxcclxuXHJcbiAgICBpc0d1aTogdHJ1ZSxcclxuXHJcbiAgICBzZXRUb3A6IGZ1bmN0aW9uICggdCwgaCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50LnN0eWxlLnRvcCA9IHQgKyAncHgnO1xyXG4gICAgICAgIGlmKCBoICE9PSB1bmRlZmluZWQgKSB0aGlzLmZvcmNlSGVpZ2h0ID0gaDtcclxuICAgICAgICB0aGlzLnNldEhlaWdodCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy9jYWxsYmFjazogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNsZWFyKCk7XHJcbiAgICAgICAgaWYoIHRoaXMucGFyZW50ICE9PSBudWxsICkgdGhpcy5wYXJlbnQucmVtb3ZlQ2hpbGQoIHRoaXMuY29udGVudCApO1xyXG4gICAgICAgIFJvb3RzLnJlbW92ZSggdGhpcyApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDQU5WQVNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvbkRyYXc6IGZ1bmN0aW9uICgpIHsgfSxcclxuXHJcbiAgICBtYWtlQ2FudmFzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgXHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCBcImNhbnZhc1wiICk7XHJcbiAgICBcdHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy56b25lLnc7XHJcbiAgICBcdHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZm9yY2VIZWlnaHQgPyB0aGlzLmZvcmNlSGVpZ2h0IDogdGhpcy56b25lLmg7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkcmF3OiBmdW5jdGlvbiAoIGZvcmNlICkge1xyXG5cclxuICAgIFx0aWYoIHRoaXMuY2FudmFzID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgIFx0dmFyIHcgPSB0aGlzLnpvbmUudztcclxuICAgIFx0dmFyIGggPSB0aGlzLmZvcmNlSGVpZ2h0ID8gdGhpcy5mb3JjZUhlaWdodCA6IHRoaXMuem9uZS5oO1xyXG4gICAgXHRSb290cy50b0NhbnZhcyggdGhpcywgdywgaCwgZm9yY2UgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vLy8vL1xyXG5cclxuICAgIGdldERvbTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0TW91c2U6IGZ1bmN0aW9uKCBtICl7XHJcblxyXG4gICAgICAgIHRoaXMubW91c2Uuc2V0KCBtLngsIG0ueSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q29uZmlnOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0Q29sb3JzKCBvICk7XHJcbiAgICAgICAgdGhpcy5zZXRUZXh0KCBvLmZvbnRTaXplLCBvLnRleHQsIG8uZm9udCwgby5zaGFkb3cgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENvbG9yczogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICBmb3IoIHZhciBjIGluIG8gKXtcclxuICAgICAgICAgICAgaWYoIHRoaXMuY29sb3JzW2NdICkgdGhpcy5jb2xvcnNbY10gPSBvW2NdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFRleHQ6IGZ1bmN0aW9uICggc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdyApIHtcclxuXHJcbiAgICAgICAgVG9vbHMuc2V0VGV4dCggc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdywgdGhpcy5jb2xvcnMsIHRoaXMuY3NzICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBoaWRlOiBmdW5jdGlvbiAoIGIgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS5kaXNwbGF5ID0gYiA/ICdub25lJyA6ICdibG9jayc7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoIGYgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBmO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBTVFlMRVNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb2RlOiBmdW5jdGlvbiAoIG4gKSB7XHJcblxyXG4gICAgXHR2YXIgbmVlZENoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgIFx0aWYoIG4gIT09IHRoaXMuY24gKXtcclxuXHJcblx0ICAgIFx0dGhpcy5jbiA9IG47XHJcblxyXG5cdCAgICBcdHN3aXRjaCggbiApe1xyXG5cclxuXHQgICAgXHRcdGNhc2UgJ2RlZic6IFxyXG5cdCAgICBcdFx0ICAgdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbDsgXHJcblx0ICAgIFx0XHQgICB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDtcclxuXHQgICAgXHRcdCAgIHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gdGhpcy5jb2xvcnMudGV4dDtcclxuXHQgICAgXHRcdGJyZWFrO1xyXG5cclxuXHQgICAgXHRcdC8vY2FzZSAnc2Nyb2xsRGVmJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbDsgYnJlYWs7XHJcblx0ICAgIFx0XHRjYXNlICdzY3JvbGxPdmVyJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgYnJlYWs7XHJcblx0ICAgIFx0XHRjYXNlICdzY3JvbGxEb3duJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247IGJyZWFrO1xyXG5cclxuXHQgICAgXHRcdC8vY2FzZSAnYm90dG9tRGVmJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7IGJyZWFrO1xyXG5cdCAgICBcdFx0Y2FzZSAnYm90dG9tT3Zlcic6IHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kT3ZlcjsgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSAnI0ZGRic7IGJyZWFrO1xyXG5cdCAgICBcdFx0Ly9jYXNlICdib3R0b21Eb3duJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSAnIzAwMCc7IGJyZWFrO1xyXG5cclxuXHQgICAgXHR9XHJcblxyXG5cdCAgICBcdG5lZWRDaGFuZ2UgPSB0cnVlO1xyXG5cclxuXHQgICAgfVxyXG5cclxuICAgIFx0cmV0dXJuIG5lZWRDaGFuZ2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFRBUkdFVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNsZWFyVGFyZ2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgXHRpZiggdGhpcy5jdXJyZW50ID09PSAtMSApIHJldHVybiBmYWxzZTtcclxuICAgICAgICAvL2lmKCF0aGlzLnRhcmdldCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnVpb3V0KCk7XHJcbiAgICAgICAgdGhpcy50YXJnZXQucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcblxyXG4gICAgICAgIC8vL2NvbnNvbGUubG9nKHRoaXMuaXNEb3duKS8vaWYodGhpcy5pc0Rvd24pUm9vdHMuY2xlYXJJbnB1dCgpO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgUm9vdHMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFpPTkUgVEVTVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHRlc3Rab25lOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICB0aGlzLmlzUmVzZXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSAnJztcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLmlzU2Nyb2xsID8gIHRoaXMuem9uZS53ICAtIHRoaXMuc2l6ZS5zIDogdGhpcy56b25lLnc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIGwueSA+IHRoaXMuem9uZS5oIC0gdGhpcy5iaCAmJiAgbC55IDwgdGhpcy56b25lLmggKSBuYW1lID0gJ2JvdHRvbSc7XHJcbiAgICAgICAgZWxzZSBuYW1lID0gbC54ID4gcyA/ICdzY3JvbGwnIDogJ2NvbnRlbnQnO1xyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgaGFuZGxlRXZlbnQ6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICBcdHZhciB0eXBlID0gZS50eXBlO1xyXG5cclxuICAgIFx0dmFyIGNoYW5nZSA9IGZhbHNlO1xyXG4gICAgXHR2YXIgdGFyZ2V0Q2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgXHR2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgXHRpZiggdHlwZSA9PT0gJ21vdXNldXAnICYmIHRoaXMuaXNEb3duICkgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIFx0aWYoIHR5cGUgPT09ICdtb3VzZWRvd24nICYmICF0aGlzLmlzRG93biApIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICYmIHRoaXMuaXNOZXdUYXJnZXQgKXsgUm9vdHMuY2xlYXJJbnB1dCgpOyB0aGlzLmlzTmV3VGFyZ2V0PWZhbHNlOyB9XHJcblxyXG4gICAgXHRpZiggIW5hbWUgKSByZXR1cm47XHJcblxyXG4gICAgXHRzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICBcdFx0Y2FzZSAnY29udGVudCc6XHJcblxyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRZID0gdGhpcy5pc1Njcm9sbCA/ICBlLmNsaWVudFkgKyB0aGlzLmRlY2FsIDogZS5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBSb290cy5pc01vYmlsZSAmJiB0eXBlID09PSAnbW91c2Vkb3duJyApIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcblxyXG5cdCAgICBcdFx0aWYoIHRoaXMudGFyZ2V0ICkgdGFyZ2V0Q2hhbmdlID0gdGhpcy50YXJnZXQuaGFuZGxlRXZlbnQoIGUgKTtcclxuXHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlbW92ZScgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ2RlZicpO1xyXG4gICAgICAgICAgICAgICAgaWYoIHR5cGUgPT09ICd3aGVlbCcgJiYgIXRhcmdldENoYW5nZSAmJiB0aGlzLmlzU2Nyb2xsICkgY2hhbmdlID0gdGhpcy5vbldoZWVsKCBlICk7XHJcbiAgICAgICAgICAgICAgIFxyXG5cdCAgICBcdFx0aWYoICFSb290cy5sb2NrICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgXHRcdGJyZWFrO1xyXG4gICAgXHRcdGNhc2UgJ2JvdHRvbSc6XHJcblxyXG5cdCAgICBcdFx0dGhpcy5jbGVhclRhcmdldCgpO1xyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5tb2RlKCdib3R0b21PdmVyJyk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKSB7XHJcblx0ICAgIFx0XHRcdHRoaXMuaXNPcGVuID0gdGhpcy5pc09wZW4gPyBmYWxzZSA6IHRydWU7XHJcblx0XHQgICAgICAgICAgICB0aGlzLmJvdHRvbS50ZXh0Q29udGVudCA9IHRoaXMuaXNPcGVuID8gJ2Nsb3NlJyA6ICdvcGVuJztcclxuXHRcdCAgICAgICAgICAgIHRoaXMuc2V0SGVpZ2h0KCk7XHJcblx0XHQgICAgICAgICAgICB0aGlzLm1vZGUoJ2RlZicpO1xyXG5cdFx0ICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHQgICAgXHRcdH1cclxuXHJcbiAgICBcdFx0YnJlYWs7XHJcbiAgICBcdFx0Y2FzZSAnc2Nyb2xsJzpcclxuXHJcblx0ICAgIFx0XHR0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlbW92ZScgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ3Njcm9sbE92ZXInKTtcclxuXHQgICAgXHRcdGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyApIGNoYW5nZSA9IHRoaXMubW9kZSgnc2Nyb2xsRG93bicpOyBcclxuICAgICAgICAgICAgICAgIGlmKCB0eXBlID09PSAnd2hlZWwnICkgY2hhbmdlID0gdGhpcy5vbldoZWVsKCBlICk7IFxyXG5cdCAgICBcdFx0aWYoIHRoaXMuaXNEb3duICkgdGhpcy51cGRhdGUoIChlLmNsaWVudFktdGhpcy56b25lLnkpLSh0aGlzLnNoKjAuNSkgKTtcclxuXHJcbiAgICBcdFx0YnJlYWs7XHJcblxyXG5cclxuICAgIFx0fVxyXG5cclxuICAgIFx0aWYoIHRoaXMuaXNEb3duICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgIFx0aWYoIHRhcmdldENoYW5nZSApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlID09PSAna2V5dXAnICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICBpZiggdHlwZSA9PT0gJ2tleWRvd24nICkgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICBcdGlmKCBjaGFuZ2UgKSB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGdldE5leHQ6IGZ1bmN0aW9uICggZSwgY2hhbmdlICkge1xyXG5cclxuXHJcblxyXG4gICAgICAgIHZhciBuZXh0ID0gUm9vdHMuZmluZFRhcmdldCggdGhpcy51aXMsIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IHRoaXMuY3VycmVudCApe1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzTmV3VGFyZ2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gLTEgKXsgXHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy51aXNbIHRoaXMuY3VycmVudCBdO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC51aW92ZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBvbldoZWVsOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMub3kgKz0gMjAqZS5kZWx0YTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSggdGhpcy5veSApO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVNFVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1Jlc2V0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL3RoaXMucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIHRoaXMubW91c2UubmVnKCk7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy9Sb290cy5jbGVhcklucHV0KCk7XHJcbiAgICAgICAgdmFyIHIgPSB0aGlzLm1vZGUoJ2RlZicpO1xyXG4gICAgICAgIHZhciByMiA9IHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHJcbiAgICAgICAgaWYoIHIgfHwgcjIgKSB0aGlzLmRyYXcoIHRydWUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1Jlc2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy9Sb290cy5sb2NrID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEFERCBOT0RFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYWRkOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIGFbMV0gPT09ICdvYmplY3QnICl7IFxyXG5cclxuICAgICAgICAgICAgYVsxXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgICAgICAgYVsxXS5tYWluID0gdGhpcztcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgYVsxXSA9PT0gJ3N0cmluZycgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBhWzJdID09PSB1bmRlZmluZWQgKSBbXS5wdXNoLmNhbGwoYSwgeyBpc1VJOnRydWUsIG1haW46dGhpcyB9KTtcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhWzJdLmlzVUkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYVsyXS5tYWluID0gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICB2YXIgdSA9IGFkZC5hcHBseSggdGhpcywgYSApO1xyXG5cclxuICAgICAgICBpZiggdSA9PT0gbnVsbCApIHJldHVybjtcclxuXHJcblxyXG4gICAgICAgIC8vdmFyIG4gPSBhZGQuYXBwbHkoIHRoaXMsIGEgKTtcclxuICAgICAgICAvL3ZhciBuID0gVUlMLmFkZCggLi4uYXJncyApO1xyXG5cclxuICAgICAgICB0aGlzLnVpcy5wdXNoKCB1ICk7XHJcbiAgICAgICAgLy9uLnB5ID0gdGhpcy5oO1xyXG5cclxuICAgICAgICBpZiggIXUuYXV0b1dpZHRoICl7XHJcbiAgICAgICAgICAgIHZhciB5ID0gdS5jWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcDtcclxuICAgICAgICAgICAgaWYoIHRoaXMucHJldlkgIT09IHkgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FsYyggdS5oICsgMSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2WSA9IHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5wcmV2WSA9IDA7Ly8tMTtcclxuICAgICAgICAgICAgdGhpcy5jYWxjKCB1LmggKyAxICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFwcGx5Q2FsYzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMudWlzLmxlbmd0aCwgdGhpcy50bXBIIClcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjKCB0aGlzLnRtcEggKTtcclxuICAgICAgICAvL3RoaXMudG1wSCA9IDA7XHJcbiAgICAgICAgdGhpcy50bXBBZGQgPSBudWxsO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2FsY1VpczogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBSb290cy5jYWxjVWlzKCB0aGlzLnVpcywgdGhpcy56b25lLCB0aGlzLnpvbmUueSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gcmVtb3ZlIG9uZSBub2RlXHJcblxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoIG4gKSB7IFxyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMudWlzLmluZGV4T2YoIG4gKTsgXHJcbiAgICAgICAgaWYgKCBpICE9PSAtMSApIHRoaXMudWlzW2ldLmNsZWFyKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBjYWxsIGFmdGVyIHVpcyBjbGVhclxyXG5cclxuICAgIGNsZWFyT25lOiBmdW5jdGlvbiAoIG4gKSB7IFxyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMudWlzLmluZGV4T2YoIG4gKTsgXHJcbiAgICAgICAgaWYgKCBpICE9PSAtMSApIHtcclxuICAgICAgICAgICAgdGhpcy5pbm5lci5yZW1vdmVDaGlsZCggdGhpcy51aXNbaV0uY1swXSApO1xyXG4gICAgICAgICAgICB0aGlzLnVpcy5zcGxpY2UoIGksIDEgKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gY2xlYXIgYWxsIGd1aVxyXG5cclxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy51aXNbaV0uY2xlYXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy51aXMgPSBbXTtcclxuICAgICAgICBSb290cy5saXN0ZW5zID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuY2FsYyggLXRoaXMuaCApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJVEVNUyBTUEVDSUFMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAgIHJlc2V0SXRlbTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNJdGVtTW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKSB0aGlzLnVpc1tpXS5zZWxlY3RlZCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0SXRlbTogZnVuY3Rpb24gKCBuYW1lICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNJdGVtTW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5yZXNldEl0ZW0oKTtcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnVpc1tpXS52YWx1ZSAgPT09IG5hbWUgKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVpc1tpXS5zZWxlY3RlZCggdHJ1ZSApO1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNTY3JvbGwgKSB0aGlzLnVwZGF0ZSggKCBpKih0aGlzLnNpemUuaCsxKSApKnRoaXMucmF0aW8gKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBTQ1JPTExcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB1cFNjcm9sbDogZnVuY3Rpb24gKCBiICkge1xyXG5cclxuICAgICAgICB0aGlzLnN3ID0gYiA/IHRoaXMuc2l6ZS5zIDogMDtcclxuICAgICAgICB0aGlzLm95ID0gYiA/IHRoaXMub3kgOiAwO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsQkcuc3R5bGUuZGlzcGxheSA9IGIgPyAnYmxvY2snIDogJ25vbmUnO1xyXG5cclxuICAgICAgICBpZiggYiApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy50b3RhbCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWF4VmlldyA9IHRoaXMubWF4SGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yYXRpbyA9IHRoaXMubWF4VmlldyAvIHRoaXMudG90YWw7XHJcbiAgICAgICAgICAgIHRoaXMuc2ggPSB0aGlzLm1heFZpZXcgKiB0aGlzLnJhdGlvO1xyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5zaCA8IDIwICkgdGhpcy5zaCA9IDIwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4VmlldyAtIHRoaXMuc2g7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm95ID0gVG9vbHMuY2xhbXAoIHRoaXMub3ksIDAsIHRoaXMucmFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsQkcuc3R5bGUuaGVpZ2h0ID0gdGhpcy5tYXhWaWV3ICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGwuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaCArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRJdGVtV2lkdGgoIHRoaXMuem9uZS53IC0gdGhpcy5zdyApO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCB0aGlzLm95ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICggeSApIHtcclxuXHJcbiAgICAgICAgeSA9IFRvb2xzLmNsYW1wKCB5LCAwLCB0aGlzLnJhbmdlICk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVjYWwgPSBNYXRoLmZsb29yKCB5IC8gdGhpcy5yYXRpbyApO1xyXG4gICAgICAgIHRoaXMuaW5uZXIuc3R5bGUudG9wID0gLSB0aGlzLmRlY2FsICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNjcm9sbC5zdHlsZS50b3AgPSBNYXRoLmZsb29yKCB5ICkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMub3kgPSB5O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVNJWkUgRlVOQ1RJT05cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjYWxjOiBmdW5jdGlvbiAoIHkgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaCArPSB5O1xyXG4gICAgICAgIGNsZWFyVGltZW91dCggdGhpcy50bXAgKTtcclxuICAgICAgICB0aGlzLnRtcCA9IHNldFRpbWVvdXQoIHRoaXMuc2V0SGVpZ2h0LmJpbmQodGhpcyksIDEwICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRIZWlnaHQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudG1wICkgY2xlYXJUaW1lb3V0KCB0aGlzLnRtcCApO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuaCApXHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5iaDtcclxuICAgICAgICB0aGlzLmlzU2Nyb2xsID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApe1xyXG5cclxuICAgICAgICAgICAgdmFyIGhoaCA9IHRoaXMuZm9yY2VIZWlnaHQgPyB0aGlzLmZvcmNlSGVpZ2h0ICsgdGhpcy56b25lLnkgOiB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1heEhlaWdodCA9IGhoaCAtIHRoaXMuem9uZS55IC0gdGhpcy5iaDtcclxuXHJcbiAgICAgICAgICAgIHZhciBkaWZmID0gdGhpcy5oIC0gdGhpcy5tYXhIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRpZmYpXHJcblxyXG4gICAgICAgICAgICBpZiggZGlmZiA+IDEgKXsgLy90aGlzLmggPiB0aGlzLm1heEhlaWdodCApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLm1heEhlaWdodCArIHRoaXMuYmg7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oICsgdGhpcy5iaDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cFNjcm9sbCggdGhpcy5pc1Njcm9sbCApO1xyXG5cclxuICAgICAgICB0aGlzLmlubmVyQ29udGVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLnpvbmUuaCAtIHRoaXMuYmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLnpvbmUuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5ib3R0b20uc3R5bGUudG9wID0gdGhpcy56b25lLmggLSB0aGlzLmJoICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuZm9yY2VIZWlnaHQgJiYgdGhpcy5sb2NrSGVpZ2h0ICkgdGhpcy5jb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuZm9yY2VIZWlnaHQgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKSB0aGlzLmNhbGNVaXMoKTtcclxuICAgICAgICBpZiggdGhpcy5pc0NhbnZhcyApIHRoaXMuZHJhdyggdHJ1ZSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0V2lkdGg6IGZ1bmN0aW9uICggdyApIHtcclxuXHJcbiAgICAgICAgaWYoIHcgKSB0aGlzLnpvbmUudyA9IHc7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS53aWR0aCA9IHRoaXMuem9uZS53ICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNDZW50ZXIgKSB0aGlzLmNvbnRlbnQuc3R5bGUubWFyZ2luTGVmdCA9IC0oTWF0aC5mbG9vcih0aGlzLnpvbmUudyowLjUpKSArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SXRlbVdpZHRoKCB0aGlzLnpvbmUudyAtIHRoaXMuc3cgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzQ2FudmFzT25seSApIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG4gICAgICAgIC8vdGhpcy5yZXNpemUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldEl0ZW1XaWR0aDogZnVuY3Rpb24gKCB3ICkge1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRTaXplKCB3ICk7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnJTaXplKClcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG59ICk7XHJcblxyXG5cclxuZXhwb3J0IHsgR3VpIH07IiwiaW1wb3J0ICcuL3BvbHlmaWxscy5qcyc7XHJcblxyXG5leHBvcnQgdmFyIFJFVklTSU9OID0gJzIuNjYnO1xyXG5cclxuZXhwb3J0IHsgVG9vbHMgfSBmcm9tICcuL2NvcmUvVG9vbHMuanMnO1xyXG5leHBvcnQgeyBHdWkgfSBmcm9tICcuL2NvcmUvR3VpLmpzJztcclxuZXhwb3J0IHsgUHJvdG8gfSBmcm9tICcuL2NvcmUvUHJvdG8uanMnO1xyXG5leHBvcnQgeyBhZGQgfSBmcm9tICcuL2NvcmUvYWRkLmpzJztcclxuLy9cclxuZXhwb3J0IHsgQm9vbCB9IGZyb20gJy4vcHJvdG8vQm9vbC5qcyc7XHJcbmV4cG9ydCB7IEJ1dHRvbiB9IGZyb20gJy4vcHJvdG8vQnV0dG9uLmpzJztcclxuZXhwb3J0IHsgQ2lyY3VsYXIgfSBmcm9tICcuL3Byb3RvL0NpcmN1bGFyLmpzJztcclxuZXhwb3J0IHsgQ29sb3IgfSBmcm9tICcuL3Byb3RvL0NvbG9yLmpzJztcclxuZXhwb3J0IHsgRnBzIH0gZnJvbSAnLi9wcm90by9GcHMuanMnO1xyXG5leHBvcnQgeyBHcm91cCB9IGZyb20gJy4vcHJvdG8vR3JvdXAuanMnO1xyXG5leHBvcnQgeyBKb3lzdGljayB9IGZyb20gJy4vcHJvdG8vSm95c3RpY2suanMnO1xyXG5leHBvcnQgeyBLbm9iIH0gZnJvbSAnLi9wcm90by9Lbm9iLmpzJztcclxuZXhwb3J0IHsgTGlzdCB9IGZyb20gJy4vcHJvdG8vTGlzdC5qcyc7XHJcbmV4cG9ydCB7IE51bWVyaWMgfSBmcm9tICcuL3Byb3RvL051bWVyaWMuanMnO1xyXG5leHBvcnQgeyBTbGlkZSB9IGZyb20gJy4vcHJvdG8vU2xpZGUuanMnO1xyXG5leHBvcnQgeyBUZXh0SW5wdXQgfSBmcm9tICcuL3Byb3RvL1RleHRJbnB1dC5qcyc7XHJcbmV4cG9ydCB7IFRpdGxlIH0gZnJvbSAnLi9wcm90by9UaXRsZS5qcyc7Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztDQUFBOztDQUVBLEtBQUssTUFBTSxDQUFDLE9BQU8sS0FBSyxTQUFTLEdBQUc7O0VBRW5DLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQzs7RUFFckM7Ozs7Q0FJRCxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHOzs7O0VBSTlCLElBQUksQ0FBQyxJQUFJLEdBQUcsV0FBVyxDQUFDLEdBQUc7O0dBRTFCLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7O0dBRTdDLENBQUM7O0VBRUY7O0NBRUQsS0FBSyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxTQUFTLEdBQUc7Ozs7O0VBSzVDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUU7O0dBRWxELEdBQUcsRUFBRSxZQUFZOztJQUVoQixPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsMkJBQTJC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QUMsR0FBRztTQUN0QixDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1NBQ25DLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O01BRXZEOztLQUVELFNBQVMsRUFBRSxXQUFXLENBQUMsR0FBRzs7U0FFdEIsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzs7TUFFN0M7O0tBRUQsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTs7U0FFbEIsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7TUFFcEQ7O0tBRUQsR0FBRyxFQUFFLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRzs7U0FFbkIsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7TUFFbkQ7O0tBRUQsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFOztTQUVqQixJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFDO2NBQ2xFLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUM7O01BRXpFOztLQUVELE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRTs7U0FFbEIsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7O01BRTVHOztLQUVELFFBQVEsR0FBRyxVQUFVLENBQUMsRUFBRTs7U0FFcEIsT0FBTyxHQUFHLEdBQUcsRUFBRSxRQUFRLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxRQUFRLEVBQUUsRUFBRSxFQUFFLEdBQUcsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7O01BRWhJOztLQUVELFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFOztTQUV6QixLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUcsQ0FBQyxJQUFJLENBQUMsR0FBQztTQUNwQixLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUcsQ0FBQyxJQUFJLENBQUMsR0FBQztTQUNwQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFDO1NBQzlDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUcsT0FBTyxDQUFDLEdBQUM7U0FDMUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUM7U0FDMUQsT0FBTyxDQUFDLENBQUM7O01BRVo7O0tBRUQsUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUFHOztTQUVyQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDekksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUUsQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDO1NBQ2xFLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTthQUNYLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxHQUFDO2FBQy9DLElB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QUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDMUQsQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDOzs7YUFHOUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO2FBQzlELElBQUksR0FBRyxHQUFHLENBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxlQUFlLENBQUMsQ0FBQzs7YUFFOUQsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDOUUsQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDOzthQUUvRyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FB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QyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQ3pGLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7O1NBR3ZJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDdkUsQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDOztTQUV2SSxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FB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Ozs7S0FHdEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztLQUVoRCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3JELElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEtBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDOztLQUVyQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3JELElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEtBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDO0tBQ3JDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUM7OztLQUdyRCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDOzs7S0FHaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7OztLQUdwQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDOzs7S0FHNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7OztLQUd0QixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQzs7O0tBR2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDOzs7S0FHcEIsSUFB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LFNBQVMsS0FBSyxTQUFTLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUM7O1NBRTdELElBQUksQ0FBQyxDQUFDOztTQUVOLE9BQU8sSUFBSSxDQUFDLFNBQVM7YUFDakIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU07YUFDckIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU07YUFDdkIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLE1BQU07YUFDeEIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLE1BQU07YUFDekIsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE1BQU07VUFDN0I7O1NBRUQsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztTQUMvQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNqQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztNQUU1Qzs7S0FFRCxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQUc7O1NBRXJCLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztNQUV0Rjs7Ozs7OztLQU9ELFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBRTs7U0FFdkIsSUFBSSxJQUFJLENBQUMsT0FBTyxLQUFHLFNBQU87U0FDMUIsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxD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QUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDOUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7O0tBRS9FLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNaLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7RUFFakI7O0NBRUQsUUFBUSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFOztLQUVsRSxXQUFXLEVBQUUsUUFBUTs7S0FFckIsSUFBSSxFQUFFLFdBQVcsSUFBSSxHQUFHOztTQUVwQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxLQUFHLE9BQU8sS0FBSyxHQUFDOztTQUV2QyxRQUFRLElBQUk7YUFDUixLQUFLLENBQUM7aUJBQ0YsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztpQkFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDdkQsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQzFELE1BQU07YUFDTixLQUFLLENBQUM7aUJBQ0YsSUFBSSxDQUFD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LFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDOztHQUVsQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O0dBRWpCLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBQzs7R0FFNUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztNQUV6QixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7O01BRWpDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0dBRTFCOztFQUVELEtBQUssRUFBRSxZQUFZOztHQUVsQixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7O0dBRW5DLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBQzs7R0FFNUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztHQUU1QixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O01BRWQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDOztNQUVqQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7O0dBRTNCOztFQUVELE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRzs7TUFFcEIsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDOztNQUVu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QUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7TUFFckUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO01BQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7TUFFdkMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztNQUVqRixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7TUFDdkMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO01BQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDOztHQUU3Qzs7RUFFRCxLQUFLLEVBQUUsWUFBWTs7TUFFZixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7O01BRW5DLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7O01BRWYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztNQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDOztNQUUzQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO01BQ3ZELElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUN2RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQzs7O01BRzFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztNQUN0RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO01BQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7TUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7TUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FB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SSxDQUFDLENBQUMsQ0FBQzs7S0FFZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztLQUN6QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQzs7S0FFekIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsTUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFDO0tBQzlELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Ozs7O0tBS3RDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7U0FFcEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1NBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDbkIsT0FBTyxDQUFDLEVBQUUsS0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDOztTQUUzQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDOztTQUUzQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7U0FFcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJ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RyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3BCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7O1NBRTdDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7YUFDUixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBQztxQkFDckQsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDO2FBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDO2FBQzlCLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDOUQsR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEIsQ0FBQyxFQUFFLENBQUM7O1VBRVA7O01BRUo7O0tBRUQsSUFBSSxFQUFFLFVBQVU7O1NBRVosS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDOztTQUVsQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7U0FFakMsSUFBSSxDQUFDLE1BQU0s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QUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1NBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQztTQUMzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUM7O01BRTlCOztFQUVKLEVBQUUsQ0FBQzs7Q0NwVUosU0FBUyxLQUFLLEdBQUcsQ0FBQyxHQUFHOztFQUVwQixLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQzs7RUFFdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNwRCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDOztLQUU3QixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0tBQzdELElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUM7S0FDMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQzs7S0FFMUIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzs7OztLQUlsRCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxHQUFHLENB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QWEsR0FBQzs7TUFFcEQsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7O01BRW5IOztLQUVELElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQ2IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7Ozs7S0FJaEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztLQUVaLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7U0FDekIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7U0FDOUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUM7U0FDbEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUk7TUFDckM7O0tBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQzs7RUFFeEI7O0NBRUQsS0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFOztLQUUvRCxXQUFXLEVBQUUsS0FBSzs7S0FFbEIsU0FBUyxFQUFFLFlBQVk7O1NBRW5CLElBQUksSUFBSSxDQUFDLElBQUksS0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBQzs7U0FFbEUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7OzthQUc1QixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDM0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDdkUsSUFBSSxJQUFJLENBQUMsR0FBRyxLQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLEdBQUcsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUM7b0JBQ25HLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLElBQUksT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUM7O1VBRTNGOztT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LENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRzs7U0FFMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1NBQ3JDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7U0FDckMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7U0FDZCxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7TUFFaEI7O0tBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDckksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7S0FFbkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUMzQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDOUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUks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LFFBQVEsRUFBRSxDQUFDOztVQUVyRCxHQUFHLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDOzthQUVqQixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDbEMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDOzthQUVuQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQ2pELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7VUFDcEQsTUFBTTthQUNILElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztVQUNuRDs7OztTQUlELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFF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LEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDOztLQUVySSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7S0FFM0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQ3RELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztLQUN0RCxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7O0tBR2xELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztLQUNoRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzs7S0FFL0UsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O0tBRVgsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztLQUVaLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7RUFFakI7O0NBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFOztLQUVqRSxXQUFXLEVBQUUsSUFBSTs7S0FFakIsSUFBSSxFQUFFLFdBQVcsSUFBSSxHQUFHOztTQUVwQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxLQUFHLE9BQU8sS0FBSyxHQUFDOztTQUV2QyxPQUFPLElBQUk7YUFDUCxLQUFLLENBQUM7aUJBQ0YsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztpQkFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzs7aUJBRXRELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQzthQUMxRCxNQUFNO2FBQ04sS0FBSyxDQUFDO2lCQUNGLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7aUJBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7O2lCQUV0RCxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDMUQsTUFBTTtVQUNUOztTQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1NBQ2xCLE9BQU8sSUFBSSxDQUFDOztNQUVmOzs7O0tBSUQsU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUFHOzs7O1NBSXRCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFHLFNBQU87O1NBRTFCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O1NBRXRCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDbEQsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOztTQUU3RCxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7U0FFdEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksS0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUM7O1NBRTlGLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMvQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOztTQUVqRCxJQUFJLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztTQUM5QixJQUFJLEtBQUss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LEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7O01BRTNDOztLQUVELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsd0RBQXdELENBQUMsQ0FBQztLQUMxRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7O0tBRTFCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDOztLQUVqQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDckMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOztLQUV2QyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO1NBQ3ZCLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUM7Z0JBQ2pELElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBQztNQUM3QixJQUFJO1NBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQzdCOztLQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUM7Ozs7O0tBS3JDLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLEdBQUM7OztTQUd2QyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUMxQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDWixJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUcsSUFBSSxD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QyxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLHdDQUF1QztpQkFDbkUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDeEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2NBQ3hDOzthQUVELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7O1VBRTVJO2dCQUNJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUM7O01BRTNDOzs7OztLQUtELE1BQU0sRUFBRSxXQUFXLENBQUMsR0FBRzs7U0FFbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUcsU0FBTzs7U0FFMUIs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LEVBQUUsWUFBWTs7U0FFZixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7O1NBRW5DLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUM7O1NBRXRELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7U0FFNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ3BCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1NBQ2pDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztTQUMzQixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O1NBRS9DLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7O1NBRXJCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7TUFFM0I7Ozs7S0FJRCxJQUFJLEVBQUUsV0FBVyxHQUFHLEdBQUc7O1NBRW5CLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQzs7TUFFL0I7O0tBRUQsWUFBWSxFQUFFLFlBQVk7O1NBRXRCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7U0FDcEIsTUFBTSxDQUFDLEVBQUUsSUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENB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LEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOztLQUVyQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLDREQUE0RCxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7S0FFOUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQzs7S0FFakMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztFQUVmOztDQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBRTs7S0FFOUQsV0FBVyxFQUFFLElBQUk7Ozs7OztLQU1qQixTQUFTLEVBQUUsV0FBVyxDQUFDLEdBQUc7O1NBRXRCLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7Ozs7TUFJMUI7O0tBRUQsU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUFHOztTQUV0QixJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBQzs7U0FFdEMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQzs7U0FFdEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztTQUVaLE9BQU8sSUFBSSxDQUFDOztNQUVmOztLQUVELEtBQUssRUFBRSxZQUFZOztTQUVmLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFD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O1NBQzVDLEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07U0FDdEMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtTQUNsQyxLQUFLLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1NBQ3RDLEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07U0FDdEMsS0FBSyxVQUFVLEVBQUUsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtTQUM1QyxLQUFLLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1NBQ3BDLEtBQUssTUFBTSxFQUFFLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07U0FDcEMsS0FBSyxTQUFTLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1NBQ3pELEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07U0FDdEMsS0FBSyxXQUFXLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1NBQzdELEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07U0FDdEMsS0FBSyxVQUFVLEVBQUUsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtTQUM1QyxLQUFLLE9BQU8sQ0FBQyxDQUFDLEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07U0FDcEQsS0FBSyxNQUFNLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTs7TUFFdkM7O0tBRUQsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFOztTQUVaLElBQUksR0FBRyxLQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFDO1NBQ3ZDLE9BQU8sQ0FBQyxDQUFDOztNQUVaOzs7RUFHSjs7Ozs7O0NDNUVELFNBQVMsR0FBRyxHQUFHLENBQUMsR0FBRzs7S0FFZixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzs7S0FFbkIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7OztLQUdaLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ2pDLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDOzs7S0FHNUIsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFDOzs7S0FHMUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDOztLQUV6QyxJQUFJLENBQUMsQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO1NBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztTQUNoQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUM7TUFDdkM7Ozs7S0FJRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7S0FFcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7S0FDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7O0tBRWQsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQztLQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztLQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0tBQy9DLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7O0tBRTlELElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7S0FDcEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxJQUFJLEtBQUssQ0FBQzs7S0FFeEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7S0FFaEUsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7OztLQUdiLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztLQUN2QixJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxLQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUM7S0FDMUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsS0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDO0tBQzFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEtBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQztLQUMxQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxLQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUM7O0tBRTFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7OztLQUdsRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDOzs7S0FHN0MsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDOztLQUU1QixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDaEIsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Ozs7O0tBS1osSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztLQUMxRCxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0tBRTlDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUM7O0tBRW5FLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUM7S0FDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJ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
