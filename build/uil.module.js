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
        if( shadow ) css.txt += ' text-shadow:'+ shadow + '; '; //"1px 1px 1px #ff0000";
        css.txtselect = css.txt + 'padding:2px 5px; border:1px dashed ' + colors.border + '; background:'+ colors.txtselectbg+';';
        css.item = css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px;';

    },

    clone: function ( o ) {

        return o.cloneNode( true );

    },

    setSvg: function( dom, type, value, id ){

        if( id === -1 ) dom.setAttributeNS( null, type, value );
        else dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

    },

    setCss: function( dom, css ){

        for( var r in css ){
            if( T.DOM_SIZE.indexOf(r) !== -1 ) dom.style[r] = css[r] + 'px';
            else dom.style[r] = css[r];
        }

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

    dom : function ( type, css, obj, dom, id ) {

        type = type || 'div';

        if( T.SVG_TYPE_D.indexOf(type) !== -1 || T.SVG_TYPE_G.indexOf(type) !== -1 ){ // is svg element

            if( type ==='svg' ){

                dom = document.createElementNS( T.svgns, 'svg' );
                T.set( dom, obj );

            } else {
                // create new svg if not def
                if( dom === undefined ) dom = document.createElementNS( T.svgns, 'svg' );
                T.addAttributes( dom, type, obj, id );

            }
            
        } else { // is html element

            if( dom === undefined ) dom = document.createElementNS( T.htmls, type );
            else dom = dom.appendChild( document.createElementNS( T.htmls, type ) );

        }

        if( css ) dom.style.cssText = css; 

        if( id === undefined ) return dom;
        else return dom.childNodes[ id || 0 ];

    },

    addAttributes : function( dom, type, o, id ){

        var g = document.createElementNS( T.svgns, type );
        T.set( g, o );
        T.get( dom, id ).appendChild( g );
        if( T.SVG_TYPE_G.indexOf(type) !== -1 ) g.style.pointerEvents = 'none';
        return g;

    },

    clear : function( dom ){

        T.purge( dom );
        while (dom.firstChild) {
            if ( dom.firstChild.firstChild ) T.clear( dom.firstChild );
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

        if (c.length == 7) return [ T.u255(c, 1), T.u255(c, 3), T.u255(c, 5) ];
        else if (c.length == 4) return [ T.u16(c,1), T.u16(c,2), T.u16(c,3) ];

    },

    htmlRgb: function( c ){

        return 'rgb(' + Math.round(c[0] * 255) + ','+ Math.round(c[1] * 255) + ','+ Math.round(c[2] * 255) + ')';

    },

    rgbToHex : function( c ){

        return '#' + ( '000000' + ( ( c[0] * 255 ) << 16 ^ ( c[1] * 255 ) << 8 ^ ( c[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

    },

    hueToRgb: function( p, q, t ){

        if ( t < 0 ) t += 1;
        if ( t > 1 ) t -= 1;
        if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
        if ( t < 1 / 2 ) return q;
        if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
        return p;

    },

    rgbToHsl: function ( c ) {

        var r = c[0], g = c[1], b = c[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
        if (l > 0 && l < 1) s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
        if (delta > 0) {
            if (max == r && max != g) h += (g - b) / delta;
            if (max == g && max != b) h += (2 + (b - r) / delta);
            if (max == b && max != r) h += (4 + (r - g) / delta);
            h /= 6;
        }
        return [ h, s, l ];

    },

    hslToRgb: function ( c ) {

        var p, q, h = c[0], s = c[1], l = c[2];

        if ( s === 0 ) return [ l, l, l ];
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
    "Q 56 180.55 77.05 201.6 98.2 222.75 128 222.75 157.8 222.75 178.9 201.6 200 180.55 200 150.75 L 200 33.25 Z",
    ].join('\n'),

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

        if( !R.isEventsInit ) R.initEvents();

    },

    testMobile: function () {

        var n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
        else return false;  

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

        if( R.isEventsInit ) return;

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

        if( !R.isEventsInit ) return;

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
            if( u.isGui && !u.isCanvasOnly && u.autoResize ) u.setHeight();
        
        }

    },

    // ----------------------
    //   HANDLE EVENTS
    // ----------------------
    

    handleEvent: function ( event ) {

        //if(!event.type) return;

      //  console.log( event.type )

        if( event.type.indexOf( R.prevDefault ) !== -1 ) event.preventDefault(); 

        if( event.type === 'contextmenu' ) return; 

        //if( event.type === 'keydown'){ R.editText( event ); return;}

        //if( event.type !== 'keydown' && event.type !== 'wheel' ) event.preventDefault();
        //event.stopPropagation();

        R.findZone();
       
        var e = R.e;

        if( event.type === 'keydown') R.keydown( event );
        if( event.type === 'keyup') R.keyup( event );

        if( event.type === 'wheel' ) e.delta = event.deltaY > 0 ? 1 : -1;
        else e.delta = 0;
        
        e.clientX = event.clientX || 0;
        e.clientY = event.clientY || 0;
        e.type = event.type;

        // mobile

        if( R.isMobile ){

            if( event.touches && event.touches.length > 0 ){
        
                e.clientX = event.touches[ 0 ].clientX || 0;
                e.clientY = event.touches[ 0 ].clientY || 0;

            }

            if( event.type === 'touchstart') e.type = 'mousedown';
            if( event.type === 'touchend') e.type = 'mouseup';
            if( event.type === 'touchmove') e.type = 'mousemove';

        }
        
        
        /*
        if( event.type === 'touchstart'){ e.type = 'mousedown'; R.findID( e ); }
        if( event.type === 'touchend'){ e.type = 'mouseup';  if( R.ID !== null ) R.ID.handleEvent( e ); R.clearOldID(); }
        if( event.type === 'touchmove'){ e.type = 'mousemove';  }
        */


        if( e.type === 'mousedown' ) R.lock = true;
        if( e.type === 'mouseup' ) R.lock = false;

        if( R.isMobile && e.type === 'mousedown' ) R.findID( e );
        if( e.type === 'mousemove' && !R.lock ) R.findID( e );
        

        if( R.ID !== null ){

            if( R.ID.isCanvasOnly ) {

                e.clientX = R.ID.mouse.x;
                e.clientY = R.ID.mouse.y;

            }

            R.ID.handleEvent( e );

        }

        if( R.isMobile && e.type === 'mouseup' ) R.clearOldID();

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

        if( next === -1 ) R.clearOldID();

    },

    clearOldID: function () {

        if( !R.ID ) return;
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

                if( px === 0 ) py += u.h + 1;

                u.zone.x = zone.x + px;
                u.zone.y = px === 0 ? py - u.h : my;

                my = u.zone.y;
                
                px += u.w;
                if( px + u.w > zone.w ) px = 0;

            } else {

                u.zone.x = zone.x;
                u.zone.y = py;
                py += u.h + 1;

            }

            if( u.isGroup ) u.calcUis();

        }

    },


	findTarget: function ( uis, e ) {

        var i = uis.length;

        while( i-- ){
            if( R.onZone( uis[i], e.clientX, e.clientY ) ) return i;
        }

        return -1;

    },

    // ----------------------
    //   ZONE
    // ----------------------

    findZone: function ( force ) {

        if( !R.needReZone && !force ) return;

        var i = R.ui.length, u;

        while( i-- ){ 

            u = R.ui[i];
            R.getZone( u );
            if( u.isGui ) u.calcUis();

        }

        R.needReZone = false;

    },

    onZone: function ( o, x, y ) {

        if( x === undefined || y === undefined ) return false;

        var z = o.zone;
        var mx = x - z.x;
        var my = y - z.y;

        var over = ( mx >= 0 ) && ( my >= 0 ) && ( mx <= z.w ) && ( my <= z.h );

        if( over ) o.local.set( mx, my );
        else o.local.neg();

        return over;

    },

    getZone: function ( o ) {

        if( o.isCanvasOnly ) return;
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

        if( R.tmpTime !== null ) return;

        if( R.lock ) R.tmpTime = setTimeout( function(){ R.tmpTime = null; }, 10 );

        ///

        var isNewSize = false;
        if( w !== o.canvas.width || h !== o.canvas.height ) isNewSize = true;

        if( R.tmpImage === null ) R.tmpImage = new Image();

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

        if( R.hiddenImput === null ) return;
        R.hasFocus = false;

    },

    clickPos: function( x ){

        var i = R.str.length, l = 0, n = 0;
        while( i-- ){
            l += R.textWidth( R.str[n] );
            if( l >= x ) break;
            n++;
        }
        return n;

    },

    upInput: function ( x, down ) {

        if( R.parent === null ) return false;

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
                    if( R.startX > R.moveX ) R.inputRange = [ R.moveX, R.startX ];
                    else R.inputRange = [ R.startX, R.moveX ];    
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

        if( up ) R.selectParent();

        return up;

    },

    selectParent: function (){

        var c = R.textWidth( R.str.substring( 0, R.cursorId ));
        var e = R.textWidth( R.str.substring( 0, R.inputRange[0] ));
        var s = R.textWidth( R.str.substring( R.inputRange[0],  R.inputRange[1] ));

        R.parent.select( c, e, s );

    },

    textWidth: function ( text ){

        if( R.hiddenSizer === null ) return 0;
        text = text.replace(/ /g, '&nbsp;');
        R.hiddenSizer.innerHTML = text;
        return R.hiddenSizer.clientWidth;

    },


    clearInput: function () {

        if( R.parent === null ) return;
        if( !R.firstImput ) R.parent.validate();

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

        if( R.parent === null ) return;

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

        if( R.parent === null ) return;

        R.str = R.hiddenImput.value;
        R.input.textContent = R.str;
        R.cursorId = R.hiddenImput.selectionStart;
        R.inputRange = [ R.hiddenImput.selectionStart, R.hiddenImput.selectionEnd ];

        R.selectParent();

        if( R.parent.allway ) R.parent.validate();

    },

    // ----------------------
    //
    //   LISTENING
    //
    // ----------------------

    loop: function () {

        if( R.isLoop ) requestAnimationFrame( R.loop );
        R.update();

    },

    update: function () {

        var i = R.listens.length;
        while(i--) R.listens[i].listening();

    },

    removeListen: function ( proto ) {

        var id = R.listens.indexOf( proto );
        if( id !== -1 ) R.listens.splice(id, 1);
        if( R.listens.length === 0 ) R.isLoop = false;

    },

    addListen: function ( proto ) {

        var id = R.listens.indexOf( proto );

        if( id !== -1 ) return; 

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

		if ( angle < 0 ) angle += 2 * Math.PI;

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
    if( o.w !== undefined ) this.w = o.w;

    this.h = this.isUI ? this.main.size.h : Tools.size.h;
    if( o.h !== undefined ) this.h = o.h;
    if(!this.isEmpty) this.h = this.h < 11 ? 11 : this.h;

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
    if( this.simple ) this.sa = 0;

    

    // define obj size
    this.setSize( this.w );

    // title size
    if(o.sa !== undefined ) this.sa = o.sa;
    if(o.sb !== undefined ) this.sb = o.sb;

    if( this.simple ) this.sb = this.w - this.sa;

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

        if(o.color === 'n') o.color = '#ff0000';

        if( o.color !== 'no' ) {
            if( !isNaN(o.color) ) this.fontColor = Tools.hexToHtml(o.color);
            else this.fontColor = o.color;
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

    if( this.callback === null && this.isUI && this.main.callback !== null ) this.callback = this.main.callback;

    // elements
    this.c = [];

    // style 
    this.s = [];


    this.c[0] = Tools.dom( 'div', this.css.basic + 'position:relative; height:20px; float:left; overflow:hidden;');
    this.s[0] = this.c[0].style;

    if( this.isUI ) this.s[0].marginBottom = '1px';
    
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

    if( o.css ) this.s[0].cssText = o.css; 
    

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

        if( this.isUI  ) s[0].background = this.bg;
        if( this.isEmpty  ) s[0].background = 'none';

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
            if( this.isUI ) this.main.inner.appendChild( c[0] );
            else document.body.appendChild( c[0] );
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

        if( !Tools.colorRing ) Tools.makeColorRing();
        return Tools.clone( Tools.colorRing );

    },

    getJoystick: function ( model ) {

        if( !Tools[ 'joystick_'+ model ] ) Tools.makeJoystick( model );
        return Tools.clone( Tools[ 'joystick_'+ model ] );

    },

    getCircular: function ( model ) {

        if( !Tools.circular ) Tools.makeCircular( model );
        return Tools.clone( Tools.circular );

    },

    getKnob: function ( model ) {

        if( !Tools.knob ) Tools.makeKnob( model );
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

        if( this.isEmpty ) return;

        this.s[0].background = this.bg;

    },

    uiover: function () {

        if( this.isEmpty ) return;

        this.s[0].background = this.bgOver;

    },

    rename: function ( s ) {

        if( this.c[1] !== undefined) this.c[1].textContent = s;

    },

    listen: function () {

        Roots.addListen( this );
        //Roots.listens.push( this );
        return this;

    },

    listening: function () {

        if( this.objectLink === null ) return;
        if( this.isSend ) return;
        if( this.isEdit ) return;

        this.setValue( this.objectLink[ this.val ] );

    },

    setValue: function ( v ) {

        if( this.isNumber ) this.value = this.numValue( v );
        else this.value = v;
        this.update();

    },


    // ----------------------
    // update every change
    // ----------------------

    onChange: function ( f ) {

        if( this.isEmpty ) return;

        this.callback = f;
        return this;

    },

    // ----------------------
    // update only on end
    // ----------------------

    onFinishChange: function ( f ) {

        if( this.isEmpty ) return;

        this.callback = null;
        this.endCallback = f;
        return this;

    },

    send: function ( v ) {

        this.isSend = true;
        if( this.objectLink !== null ) this.objectLink[ this.val ] = v || this.value;
        if( this.callback ) this.callback( v || this.value );
        this.isSend = false;

    },

    sendEnd: function ( v ) {

        if( this.endCallback ) this.endCallback( v || this.value );
        if( this.objectLink !== null ) this.objectLink[ this.val ] = v || this.value;

    },

    // ----------------------
    // clear node
    // ----------------------
    
    clear: function () {

        Tools.clear( this.c[0] );

        if( this.target !== null ){ 
            this.target.removeChild( this.c[0] );
        } else {
            if( this.isUI ) this.main.clearOne( this );
            else document.body.removeChild( this.c[0] );
        }

        if( !this.isUI ) Roots.remove( this );

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

        if( !this.autoWidth ) return;
        this.s[0].width = this.w + 'px';
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
    //   EVENTS DEFAULT
    // ----------------------

    handleEvent: function ( e ){

        if( this.isEmpty ) return;
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

        if( this.isOpen ) return;
        this.isOpen = true;

    },

    close: function () {

        if( !this.isOpen ) return;
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

    if(typeof this.values === 'string' ) this.values = [this.values];

    //this.selected = null;
    this.isDown = false;

    this.buttonColor = o.bColor || this.colors.button;

    this.isLoadButton = o.loader || false;
    this.isDragButton = o.drag || false;
    if( this.isDragButton ) this.isLoadButton = true;

    this.lng = this.values.length;
    this.tmp = [];
    this.stat = [];

    for(var i = 0; i < this.lng; i++){
        this.c[i+2] = this.dom( 'div', this.css.txt + 'text-align:center; top:1px; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px; line-height:'+(this.h-4)+'px;' );
        this.c[i+2].style.color = this.fontColor;
        this.c[i+2].innerHTML = this.values[i];
        this.stat[i] = 1;
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

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        var i = this.lng;
        var t = this.tmp;
        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i+2;
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

        if( !name ) return false;

    	this.isDown = true;
        this.value = this.values[name-2];
        if( !this.isLoadButton ) this.send();
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

            if( i === name-2 ) v = this.mode( n, i+2 );
            else v = this.mode( 1, i+2 );

            if(v) r = true;

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

        if( file === undefined ) return;

        var reader = new FileReader();
        var fname = file.name;
        var type = fname.substring(fname.lastIndexOf('.')+1, fname.length );

        if( dataUrl.indexOf( type ) !== -1 ) reader.readAsDataURL( file );
        else if( dataBuf.indexOf( type ) !== -1 ) reader.readAsArrayBuffer( file );//reader.readAsArrayBuffer( file );
        else reader.readAsText( file );

        // if( type === 'png' || type === 'jpg' || type === 'mp4' || type === 'webm' || type === 'ogg' ) reader.readAsDataURL( file );
        //else if( type === 'z' ) reader.readAsBinaryString( file );
        //else if( type === 'sea' || type === 'bvh' || type === 'BVH' || type === 'z') reader.readAsArrayBuffer( file );
        //else if(  ) reader.readAsArrayBuffer( file );
        //else reader.readAsText( file );

        reader.onload = function (e) {
            
            if( this.callback ) this.callback( e.target.result, fname, type );
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

        if( this.cmode === mode ) return false;

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

        if( !this.isDown ) return;

        var off = this.offset;

        off.x = this.radius - (e.clientX - this.zone.x );
        off.y = this.radius - (e.clientY - this.zone.y - this.top );

        this.r = off.angle() - this.pi90;
        this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

        if( this.oldr !== null ){ 

            var dif = this.r - this.oldr;
            this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

            if( dif > 6 ) this.r = 0;
            if( dif < -6 ) this.r = this.twoPi;

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
        if( up ) this.send();
        
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
        if( o.value instanceof Array ) this.value = Tools.rgbToHex( o.value );
        else if(!isNaN(o.value)) this.value = Tools.hexToHtml( o.value );
        else this.value = o.value;
    }

    this.bcolor = null;
    this.isDown = false;

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

	    this.setSvg( this.c[3], 'fill', cc, 2 );

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

    if( this.radius !== 0 ) panelCss += 'border-radius:' + this.radius+'px;'; 

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
    if( o.bottomLine ) this.c[4] = this.dom( 'div', this.css.basic + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');

    this.isShow = false;

    var s = this.s;

    s[1].marginLeft = '10px';
    s[1].lineHeight = this.h-4;
    s[1].color = this.fontColor;
    s[1].fontWeight = 'bold';

    if( this.radius !== 0 )  s[0].borderRadius = this.radius+'px'; 
    s[0].border = this.colors.groupBorder;

    


    for( var j=0; j<this.names.length; j++ ){

        var base = [];
        var i = this.res+1;
        while( i-- ) base.push(50);

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

        if( this.isShow ) this.close();
        else this.open();

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
        if( !this.isShow ) return;
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
        for( var j=0, lng =this.names.length; j<lng; j++ ) t += this.textDisplay[j] + (v[j]).toFixed(this.precision) + '</span>';
        this.c[4].innerHTML = t;
    
    },

    drawGraph: function( ){

        var svg = this.c[2];
        var i = this.names.length, v, old = 0, n = 0;

        while( i-- ){
            if( this.adding ) v = (this.values[n]+old) * this.range[n];
            else  v = (this.values[n] * this.range[n]);
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
        else if( this.isUI ) this.main.calc( this.hplus );

        this.s[0].height = this.h +'px';
        this.s[2].display = 'block'; 
        this.s[4].display = 'block';
        this.isShow = true;

        if( !this.custom ) Roots.addListen( this );

    },

    close: function(){

        Proto.prototype.close.call( this );

        this.h = this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.arrow );

        if( this.parentGroup !== null ){ this.parentGroup.calc( -this.hplus );}
        else if( this.isUI ) this.main.calc( -this.hplus );
        
        this.s[0].height = this.h +'px';
        this.s[2].display = 'none';
        this.s[4].display = 'none';
        this.isShow = false;

        if( !this.custom ) Roots.removeListen( this );

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

        if( !this.custom ) this.startTime = this.end();
        
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

        if( this.neg ) this.v[i] = ((1+(this.value[i] / this.multiplicator))*0.5);
    	else this.v[i] = this.value[i] / this.multiplicator;

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

        if( this.line ) this.setSvg( this.c[3], 'd', this.makePath(), 0 );

        for(var i = 0; i<this.lng; i++ ){

            
            this.setSvg( this.c[3], 'height', this.v[i]*this.gh, i+2 );
            this.setSvg( this.c[3], 'y', 14 + (this.gh - this.v[i]*this.gh), i+2 );
            if( this.neg ) this.value[i] = ( ((this.v[i]*2)-1) * this.multiplicator ).toFixed( this.precision ) * 1;
            else this.value[i] = ( (this.v[i] * this.multiplicator) ).toFixed( this.precision ) * 1;

        }

        this.c[2].textContent = this.value;

    },

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        var i = this.lng;
        var t = this.tmp;
        
	    if( l.y>this.top && l.y<this.h-20 ){
	        while( i-- ){
	            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
	        }
	    }

        return ''

    },

    mode: function ( n, name ) {

    	if( n === this.cMode[name] ) return false;

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
        if( this.current !== -1 ) return this.reset();
        
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

        if( up ) this.send();

    },

    makePath: function () {

    	var p = "", h, w, wn, wm, ow, oh;
    	//var g = this.iw*0.5

    	for(var i = 0; i<this.lng; i++ ){

    		h = 14 + (this.gh - this.v[i]*this.gh);
    		w = (14 + (i*this.iw) + (i*4));

    		wm = w + this.iw*0.5;
    		wn = w + this.iw;

    		if(i===0) p+='M '+w+' '+ h + ' T ' + wm +' '+ h;
    		else p += ' C ' + ow +' '+ oh + ',' + w +' '+ h + ',' + wm +' '+ h;
    		if(i === this.lng-1) p+=' T ' + wn +' '+ h;

    		ow = wn;
    		oh = h; 

    	}

    	return p;

    },


    

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var s = this.s;
        if( this.c[1] !== undefined ) s[1].width = this.w + 'px';
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
    if(this.isLine) this.c[5] = this.dom( 'div', this.css.basic +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');

    var s = this.s;

    s[0].height = this.h + 'px';
    s[1].height = this.h + 'px';
    this.c[1].name = 'group';

    s[1].marginLeft = '10px';
    s[1].lineHeight = this.h-4;
    s[1].color = this.fontColor;
    s[1].fontWeight = 'bold';

    if( this.radius !== 0 ) s[0].borderRadius = this.radius+'px'; 
    s[0].border = this.colors.groupBorder;

    
    this.init();

    if( o.bg !== undefined ) this.setBG(o.bg);
    if( o.open !== undefined ) this.open();

}

Group.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Group,

    isGroup: true,

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        var name = '';

        if( l.y < this.baseH ) name = 'title';
        else {
            if( this.isOpen ) name = 'content';
        }

        return name;

    },

    clearTarget: function () {

        if( this.current === -1 ) return false;

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

        if( !name ) return;

        switch( name ){

            case 'content':
            this.cursor();

            if( Roots.isMobile && type === 'mousedown' ) this.getNext( e, change );

            if( this.target ) targetChange = this.target.handleEvent( e );

            //if( type === 'mousemove' ) change = this.styles('def');

            if( !Roots.lock ) this.getNext( e, change );

            break;
            case 'title':
            this.cursor('pointer');
            if( type === 'mousedown' ){
                if( this.isOpen ) this.close();
                else this.open();
            }
            break;


        }

        if( this.isDown ) change = true;
        if( targetChange ) change = true;

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

                if(px===0) h += u.h+1;
                else {
                    if(tmph<u.h) h += u.h-tmph;
                }
                tmph = u.h;

                //tmph = tmph < u.h ? u.h : tmph;
                px += u.w;
                if( px+u.w > this.w ) px = 0;

            }
            else h += u.h+1;
        }

        return h;
    },

    calcUis: function () {

        if( !this.isOpen ) return;

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
            if( a[2] === undefined ) [].push.call(a, { isUI:true, target:this.c[2], main:this.main });
            else{ 
                a[2].isUI = true;
                a[2].target = this.c[2];
                a[2].main = this.main;
            }
        }

        //var n = add.apply( this, a );
        var n = this.ADD.apply( this, a );
        this.uis.push( n );

        if( n.autoHeight ) n.parentGroup = this;

        return n;

    },

    parentHeight: function ( t ) {

        if ( this.parentGroup !== null ) this.parentGroup.calc( t );
        else if ( this.isUI ) this.main.calc( t );

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
        if( this.isUI ) this.main.calc( -(this.h +1 ));
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

        if( !this.isOpen ) return;

        if( y !== undefined ){ 
            this.h += y;
            if( this.isUI ) this.main.calc( y );
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

        if( this.isOpen ) this.rSizeContent();

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
        if( this.interval !== null ) this.stopInterval();
        if( this.pos.isZero() ) return;
        this.interval = setInterval( function(){ this.update(); }.bind(this), 10 );

    },

    stopInterval: function (){

        if( this.interval === null ) return;
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

        if( !this.isDown ) return;

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

        if(v===undefined) v=[0,0];

        this.pos.set( v[0] || 0, v[1]  || 0 );
        this.updateSVG();

    },

    update: function ( up ) {

        if( up === undefined ) up = true;

        if( this.interval !== null ){

            if( !this.isDown ){

                this.pos.lerp( null, 0.3 );

                this.pos.x = Math.abs( this.pos.x ) < 0.01 ? 0 : this.pos.x;
                this.pos.y = Math.abs( this.pos.y ) < 0.01 ? 0 : this.pos.y;

                if( this.isUI && this.main.isCanvas ) this.main.draw();

            }

        }

        this.updateSVG();

        if( up ) this.send();
        

        if( this.pos.isZero() ) this.stopInterval();

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

        if( this.cmode === mode ) return false;

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

        if( !this.isDown ) return;

        var off = this.offset;

        off.x = this.radius - ( e.clientX - this.zone.x );
        off.y = this.radius - ( e.clientY - this.zone.y - this.top );

        this.r = - Math.atan2( off.x, off.y );

        if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

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

        if( up ) this.send();
        
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
        if(!isNaN(o.value)) this.value = this.list[ o.value ];
        else this.value = o.value;
    }else{
        this.value = this.list[0];
    }

    this.isOpenOnStart = o.open || false;

    

    //this.c[0].style.background = '#FF0000'
    if( this.isWithImage ) this.preloadImage();
   // } else {
        // populate list
        this.setList( this.list );
        this.init();
        if( this.isOpenOnStart ) this.open();
   // }

}

List.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: List,

    // image list

    preloadImage: function () {

        this.preLoadComplete = false;

        this.tmpImage = {};
        for( var i=0; i<this.list.length; i++ ) this.tmpUrl.push( this.list[i] );
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
        else this.loadOne();

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
        if( l.x === -1 && l.y === -1 ) return '';

        if( this.up && this.isOpen ){
            if( l.y > this.h - this.baseH ) return 'title';
            else{
                if( this.scroll && ( l.x > (this.sa+this.sb-20)) ) return 'scroll';
                if(l.x > this.sa) return this.testItems( l.y-this.baseH );
            }

        } else {
            if( l.y < this.baseH+2 ) return 'title';
            else{
                if( this.isOpen ){
                    if( this.scroll && ( l.x > (this.sa+this.sb-20)) ) return 'scroll';
                    if(l.x > this.sa) return this.testItems( l.y-this.baseH );
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

        if( !name ) return false;

        if( name === 'scroll' ){

            this.isDown = true;
            this.mousemove( e );

        } else if( name === 'title' ){

            this.modeTitle(2);
            if( !this.isOpen ) this.open();
            else this.close();
        
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

        if( !name ) return nup;

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

        if( name !== this.prevName ) nup = true;
        this.prevName = name;

        return nup;

    },

    wheel: function ( e ) {

        var name = this.testZone( e );
        if( name === 'title' ) return false; 
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

        if( mode === this.sMode ) return;

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

        if( mode === this.tMode ) return;

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

        while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );
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
            if( !this.isWithImage ) item.textContent = n;

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

            if( !this.preLoadComplete ) return;

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
        else this.c[3].textContent = this.value;

    },


    // ----- LIST

    update: function ( y ) {

        if( !this.scroll ) return;

        y = y < 0 ? 0 : y;
        y = y > this.range ? this.range : y;

        this.topList = -Math.floor( y / this.ratio );

        this.listIn.style.top = this.topList+'px';
        this.scroller.style.top = Math.floor( y )  + 'px';

        this.py = y;

    },

    parentHeight: function ( t ) {

        if ( this.parentGroup !== null ) this.parentGroup.calc( t );
        else if ( this.isUI ) this.main.calc( t );

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

        if( this.up ) this.zone.y += this.h - (this.baseH-10);

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
        while(i--) this.listIn.children[i].style.width = this.ww + 'px';

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var s = this.s;
        var w = this.sb;
        var d = this.sa;

        if(s[2]=== undefined) return;

        s[2].width = w + 'px';
        s[2].left = d +'px';

        s[3].width = w + 'px';
        s[3].left = d + 'px';

        s[4].left = d + w - 17 + 'px';

        this.ww = w;
        if( this.max > this.maxHeight ) this.ww = w-20;
        if(this.isOpen) this.rSizeContent();

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
            if(o.value.x) this.value[0] = o.value.x;
            if(o.value.y) this.value[1] = o.value.y;
            if(o.value.z) this.value[2] = o.value.z;
            if(o.value.w) this.value[3] = o.value.w;
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

        if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
        this.c[3+i] = this.dom( 'div', this.css.txtselect + ' height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');//letter-spacing:-1px;
        if(o.center) this.c[2+i].style.textAlign = 'center';
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
        if( l.x === -1 && l.y === -1 ) return '';

        var i = this.lng;
        var t = this.tmp;
        

        while( i-- ){
            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
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

        if( name === '' ) this.cursor();
        else{ 
        	if(!this.isDrag) this.cursor('text');
        	else this.cursor( this.current !== -1 ? 'move' : 'pointer' );
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

        	if( this.isDown ) x = e.clientX - this.zone.x -3;
        	if( this.current !== -1 ) x -= this.tmp[this.current][0];
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

        if( this.isNumber ) this.send( ar[0] );
        else this.send( ar );

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
    if( o.mode !== undefined ) this.model = o.mode;
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

        if(this.model === 3) this.c[5].style.visible = 'none';

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
        if( l.x === -1 && l.y === -1 ) return '';
        
        if( l.x >= this.txl ) return 'text';
        else if( l.x >= this.sa ) return 'scroll';
        else return '';

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup: function ( e ) {
        
        if( this.isDown ) this.isDown = false;
        
    },

    mousedown: function ( e ) {

        var name = this.testZone( e );

        if( !name ) return false;

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

        else this.c[2].textContent = this.value;

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
       
        if(this.model !== 3) this.s[5].width = ww + 'px';
        if(this.s[6]) this.s[6].left = ( this.sa + ww + 3 ) + 'px';
        this.c[2].textContent = this.value;

        if( up ) this.send();

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var w = this.sb - this.sc;
        this.ww = w - 6;

        var tx = this.sc;
        if(this.isUI || !this.simple) tx = this.sc+10;
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
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x >= this.sa ) return 'text';
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
            if( name === 'text' ) this.setInput( this.c[3] );
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

        if( name === 'text' ) this.cursor('text');
        else this.cursor();

        if( this.isDown ) x = e.clientX - this.zone.x;

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
    if(typeof this.values === 'string' ) this.values = [ this.values ];

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
        if( this.values[i] === this.value ) sel = true;

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
        if( l.x === -1 && l.y === -1 ) return '';

        var i = this.lng;
        var t = this.tmp;
        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i+2;
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

        if( !name ) return false;

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

            if( i === name-2 && this.values[ i ] !== this.value ) v = this.mode( n, i+2 );
            else{ 

                if( this.values[ i ] === this.value ) v = this.mode( 3, i+2 );
                else v = this.mode( 1, i+2 );

            }

            if(v) r = true;

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

            if( this.values[ i ] === this.value ) v = this.mode( 3, i+2 );
            else v = this.mode( 1, i+2 );
            if(v) r = true;
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

        if( this.isUI ) this.main.resetItem();

        this.selected( true );

        this.send();

        return true;

    },

    uiout: function () {

        if( this.isSelect ) this.mode(3);
        else this.mode(1);

    },

    uiover: function () {

        if( this.isSelect ) this.mode(4);
        else this.mode(2);

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

        if( this.isSelect ) this.mode(1);

        this.isSelect = b || false;

        if( this.isSelect ) this.mode(3);
        
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
        if( a[2] === undefined ) [].push.call(a, {});

        type = a[2].type ? a[2].type : 'slide';//autoType.apply( this, a );

        o = a[2];
        o.name = a[1];
        o.value = a[0][a[1]];

    }

    var name = type.toLowerCase();

    if( name === 'group' ) o.add = add;

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

        if( ref ) n.setReferency( a[0], a[1] );
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


    if( o.config ) this.setConfig( o.config );


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
    if( o.p !== undefined ) this.size.p = o.p;
    if( o.w !== undefined ) this.size.w = o.w;
    if( o.h !== undefined ) this.size.h = o.h;
    if( o.s !== undefined ) this.size.s = o.s;

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
    	if( !this.isCenter ) this.content.style.right = '10px'; 
    }

    if( this.parent !== null ) this.parent.appendChild( this.content );

    if( this.isCanvas && this.parent === null ) this.isCanvasOnly = true;

    if( !this.isCanvasOnly ) this.content.style.pointerEvents = 'auto';


    this.setWidth();

    if( this.isCanvas ) this.makeCanvas();

    Roots.add( this );

}

Object.assign( Gui.prototype, {

    constructor: Gui,

    isGui: true,

    setTop: function ( t, h ) {

        this.content.style.top = t + 'px';
        if( h !== undefined ) this.forceHeight = h;
        this.setHeight();

    },

    //callback: function () {},

    dispose: function () {

        this.clear();
        if( this.parent !== null ) this.parent.removeChild( this.content );
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

    	if( this.canvas === null ) return;

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
            if( this.colors[c] ) this.colors[c] = o[c];
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

    	if( this.current === -1 ) return false;
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
        if( l.x === -1 && l.y === -1 ) return '';

        this.isReset = false;

        var name = '';

        var s = this.isScroll ?  this.zone.w  - this.size.s : this.zone.w;
        
        if( l.y > this.zone.h - this.bh &&  l.y < this.zone.h ) name = 'bottom';
        else name = l.x > s ? 'scroll' : 'content';

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

        

    	if( type === 'mouseup' && this.isDown ) this.isDown = false;
    	if( type === 'mousedown' && !this.isDown ) this.isDown = true;

        if( this.isDown && this.isNewTarget ){ Roots.clearInput(); this.isNewTarget=false; }

    	if( !name ) return;

    	switch( name ){

    		case 'content':

                e.clientY = this.isScroll ?  e.clientY + this.decal : e.clientY;

                if( Roots.isMobile && type === 'mousedown' ) this.getNext( e, change );

	    		if( this.target ) targetChange = this.target.handleEvent( e );

	    		if( type === 'mousemove' ) change = this.mode('def');
                if( type === 'wheel' && !targetChange && this.isScroll ) change = this.onWheel( e );
               
	    		if( !Roots.lock ) {
                    this.getNext( e, change );
                }

    		break;
    		case 'bottom':

	    		this.clearTarget();
	    		if( type === 'mousemove' ) change = this.mode('bottomOver');
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
	    		if( type === 'mousemove' ) change = this.mode('scrollOver');
	    		if( type === 'mousedown' ) change = this.mode('scrollDown'); 
                if( type === 'wheel' ) change = this.onWheel( e ); 
	    		if( this.isDown ) this.update( (e.clientY-this.zone.y)-(this.sh*0.5) );

    		break;


    	}

    	if( this.isDown ) change = true;
    	if( targetChange ) change = true;

        if( type === 'keyup' ) change = true;
        if( type === 'keydown' ) change = true;

    	if( change ) this.draw();

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

        if( this.isReset ) return;

        //this.resetItem();

        this.mouse.neg();
        this.isDown = false;

        //Roots.clearInput();
        var r = this.mode('def');
        var r2 = this.clearTarget();

        if( r || r2 ) this.draw( true );

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

            if( a[2] === undefined ) [].push.call(a, { isUI:true, main:this });
            else {
                a[2].isUI = true;
                a[2].main = this;
            }
            
        } 

        var u = add.apply( this, a );

        if( u === null ) return;


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

    clear: function () {

        var i = this.uis.length;
        while(i--) this.uis[i].clear();

        this.uis = [];
        Roots.listens = [];

        this.calc( -this.h );

    },

    // ----------------------
    //   ITEMS SPECIAL
    // ----------------------


    resetItem: function () {

        if( !this.isItemMode ) return;

        var i = this.uis.length;
        while(i--) this.uis[i].selected();

    },

    setItem: function ( name ) {

        if( !this.isItemMode ) return;

        this.resetItem();

        var i = this.uis.length;
        while(i--){ 
            if( this.uis[i].value  === name ){ 
                this.uis[i].selected( true );
                if( this.isScroll ) this.update( ( i*(this.size.h+1) )*this.ratio );
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

        if( this.tmp ) clearTimeout( this.tmp );

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

        if( this.forceHeight && this.lockHeight ) this.content.style.height = this.forceHeight + 'px';

        if( this.isOpen ) this.calcUis();
        if( this.isCanvas ) this.draw( true );

    },

    setWidth: function ( w ) {

        if( w ) this.zone.w = w;

        this.content.style.width = this.zone.w + 'px';

        if( this.isCenter ) this.content.style.marginLeft = -(Math.floor(this.zone.w*0.5)) + 'px';

        this.setItemWidth( this.zone.w - this.sw );

        this.setHeight();

        if( !this.isCanvasOnly ) Roots.needReZone = true;
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

export { Bool, Button, Circular, Color, Fps, Group, Gui, Joystick, Knob, List, Numeric, Proto, REVISION, Slide, TextInput, Title, Tools, add };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlsLm1vZHVsZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL3BvbHlmaWxscy5qcyIsIi4uL3NyYy9jb3JlL1Rvb2xzLmpzIiwiLi4vc3JjL2NvcmUvUm9vdHMuanMiLCIuLi9zcmMvY29yZS9WMi5qcyIsIi4uL3NyYy9jb3JlL1Byb3RvLmpzIiwiLi4vc3JjL3Byb3RvL0Jvb2wuanMiLCIuLi9zcmMvcHJvdG8vQnV0dG9uLmpzIiwiLi4vc3JjL3Byb3RvL0NpcmN1bGFyLmpzIiwiLi4vc3JjL3Byb3RvL0NvbG9yLmpzIiwiLi4vc3JjL3Byb3RvL0Zwcy5qcyIsIi4uL3NyYy9wcm90by9HcmFwaC5qcyIsIi4uL3NyYy9wcm90by9Hcm91cC5qcyIsIi4uL3NyYy9wcm90by9Kb3lzdGljay5qcyIsIi4uL3NyYy9wcm90by9Lbm9iLmpzIiwiLi4vc3JjL3Byb3RvL0xpc3QuanMiLCIuLi9zcmMvcHJvdG8vTnVtZXJpYy5qcyIsIi4uL3NyYy9wcm90by9TbGlkZS5qcyIsIi4uL3NyYy9wcm90by9UZXh0SW5wdXQuanMiLCIuLi9zcmMvcHJvdG8vVGl0bGUuanMiLCIuLi9zcmMvcHJvdG8vU2VsZWN0b3IuanMiLCIuLi9zcmMvcHJvdG8vRW1wdHkuanMiLCIuLi9zcmMvcHJvdG8vSXRlbS5qcyIsIi4uL3NyYy9jb3JlL2FkZC5qcyIsIi4uL3NyYy9jb3JlL0d1aS5qcyIsIi4uL3NyYy9VaWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9seWZpbGxzXHJcblxyXG5pZiAoIE51bWJlci5FUFNJTE9OID09PSB1bmRlZmluZWQgKSB7XHJcblxyXG5cdE51bWJlci5FUFNJTE9OID0gTWF0aC5wb3coIDIsIC0gNTIgKTtcclxuXHJcbn1cclxuXHJcbi8vXHJcblxyXG5pZiAoIE1hdGguc2lnbiA9PT0gdW5kZWZpbmVkICkge1xyXG5cclxuXHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXRoL3NpZ25cclxuXHJcblx0TWF0aC5zaWduID0gZnVuY3Rpb24gKCB4ICkge1xyXG5cclxuXHRcdHJldHVybiAoIHggPCAwICkgPyAtIDEgOiAoIHggPiAwICkgPyAxIDogKyB4O1xyXG5cclxuXHR9O1xyXG5cclxufVxyXG5cclxuaWYgKCBGdW5jdGlvbi5wcm90b3R5cGUubmFtZSA9PT0gdW5kZWZpbmVkICkge1xyXG5cclxuXHQvLyBNaXNzaW5nIGluIElFOS0xMS5cclxuXHQvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9GdW5jdGlvbi9uYW1lXHJcblxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggRnVuY3Rpb24ucHJvdG90eXBlLCAnbmFtZScsIHtcclxuXHJcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCkubWF0Y2goIC9eXFxzKmZ1bmN0aW9uXFxzKihbXlxcKFxcc10qKS8gKVsgMSBdO1xyXG5cclxuXHRcdH1cclxuXHJcblx0fSApO1xyXG5cclxufVxyXG5cclxuaWYgKCBPYmplY3QuYXNzaWduID09PSB1bmRlZmluZWQgKSB7XHJcblxyXG5cdC8vIE1pc3NpbmcgaW4gSUUuXHJcblx0Ly8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnblxyXG5cclxuXHQoIGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRPYmplY3QuYXNzaWduID0gZnVuY3Rpb24gKCB0YXJnZXQgKSB7XHJcblxyXG5cdFx0XHQndXNlIHN0cmljdCc7XHJcblxyXG5cdFx0XHRpZiAoIHRhcmdldCA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldCA9PT0gbnVsbCApIHtcclxuXHJcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvciggJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcgKTtcclxuXHJcblx0XHRcdH1cclxuXHJcblx0XHRcdHZhciBvdXRwdXQgPSBPYmplY3QoIHRhcmdldCApO1xyXG5cclxuXHRcdFx0Zm9yICggdmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCArKyApIHtcclxuXHJcblx0XHRcdFx0dmFyIHNvdXJjZSA9IGFyZ3VtZW50c1sgaW5kZXggXTtcclxuXHJcblx0XHRcdFx0aWYgKCBzb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBzb3VyY2UgIT09IG51bGwgKSB7XHJcblxyXG5cdFx0XHRcdFx0Zm9yICggdmFyIG5leHRLZXkgaW4gc291cmNlICkge1xyXG5cclxuXHRcdFx0XHRcdFx0aWYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoIHNvdXJjZSwgbmV4dEtleSApICkge1xyXG5cclxuXHRcdFx0XHRcdFx0XHRvdXRwdXRbIG5leHRLZXkgXSA9IHNvdXJjZVsgbmV4dEtleSBdO1xyXG5cclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuIG91dHB1dDtcclxuXHJcblx0XHR9O1xyXG5cclxuXHR9ICkoKTtcclxuXHJcbn1cclxuIiwiLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxudmFyIFQgPSB7XHJcblxyXG4gICAgZnJhZzogZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLFxyXG5cclxuICAgIGNvbG9yUmluZzogbnVsbCxcclxuICAgIGpveXN0aWNrXzA6IG51bGwsXHJcbiAgICBqb3lzdGlja18xOiBudWxsLFxyXG4gICAgY2lyY3VsYXI6IG51bGwsXHJcbiAgICBrbm9iOiBudWxsLFxyXG4gICAgLy9ncmFwaDogbnVsbCxcclxuXHJcbiAgICBzdmduczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxyXG4gICAgaHRtbHM6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFxyXG5cclxuICAgIERPTV9TSVpFOiBbICdoZWlnaHQnLCAnd2lkdGgnLCAndG9wJywgJ2xlZnQnLCAnYm90dG9tJywgJ3JpZ2h0JywgJ21hcmdpbi1sZWZ0JywgJ21hcmdpbi1yaWdodCcsICdtYXJnaW4tdG9wJywgJ21hcmdpbi1ib3R0b20nXSxcclxuICAgIFNWR19UWVBFX0Q6IFsgJ3BhdHRlcm4nLCAnZGVmcycsICd0cmFuc2Zvcm0nLCAnc3RvcCcsICdhbmltYXRlJywgJ3JhZGlhbEdyYWRpZW50JywgJ2xpbmVhckdyYWRpZW50JywgJ2FuaW1hdGVNb3Rpb24nIF0sXHJcbiAgICBTVkdfVFlQRV9HOiBbICdzdmcnLCAncmVjdCcsICdjaXJjbGUnLCAncGF0aCcsICdwb2x5Z29uJywgJ3RleHQnLCAnZycsICdsaW5lJywgJ2ZvcmVpZ25PYmplY3QnIF0sXHJcblxyXG4gICAgVHdvUEk6IDYuMjgzMTg1MzA3MTc5NTg2LFxyXG5cclxuICAgIHNpemU6IHsgIHc6IDI0MCwgaDogMjAsIHA6IDMwLCBzOiAyMCB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ09MT1JcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjbG9uZUNvbG9yOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBjYyA9IE9iamVjdC5hc3NpZ24oe30sIFQuY29sb3JzICk7XHJcbiAgICAgICAgcmV0dXJuIGNjO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmVDc3M6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIGNjID0gT2JqZWN0LmFzc2lnbih7fSwgVC5jc3MgKTtcclxuICAgICAgICByZXR1cm4gY2M7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjb2xvcnM6IHtcclxuXHJcbiAgICAgICAgdGV4dCA6ICcjQzBDMEMwJyxcclxuICAgICAgICB0ZXh0T3ZlciA6ICcjRkZGRkZGJyxcclxuICAgICAgICB0eHRzZWxlY3RiZyA6ICdub25lJyxcclxuXHJcbiAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoNDQsNDQsNDQsMC4zKScsXHJcbiAgICAgICAgYmFja2dyb3VuZE92ZXI6ICdyZ2JhKDExLDExLDExLDAuNSknLFxyXG5cclxuICAgICAgICAvL2lucHV0OiAnIzAwNUFBQScsXHJcblxyXG4gICAgICAgIGlucHV0Qm9yZGVyOiAnIzQ1NDU0NScsXHJcbiAgICAgICAgaW5wdXRCb3JkZXJTZWxlY3Q6ICcjMDA1QUFBJyxcclxuICAgICAgICBpbnB1dEJnOiAncmdiYSgwLDAsMCwwLjIpJyxcclxuICAgICAgICBpbnB1dE92ZXI6ICdyZ2JhKDgwLDgwLDE3MCwwLjIpJyxcclxuXHJcbiAgICAgICAgYm9yZGVyIDogJyM0NTQ1NDUnLFxyXG4gICAgICAgIGJvcmRlck92ZXIgOiAnIzUwNTBBQScsXHJcbiAgICAgICAgYm9yZGVyU2VsZWN0IDogJyMzMDhBRkYnLFxyXG5cclxuICAgICAgICBzY3JvbGxiYWNrOidyZ2JhKDQ0LDQ0LDQ0LDAuMiknLFxyXG4gICAgICAgIHNjcm9sbGJhY2tvdmVyOidyZ2JhKDQ0LDQ0LDQ0LDAuMiknLFxyXG5cclxuICAgICAgICBidXR0b24gOiAnIzQwNDA0MCcsXHJcbiAgICAgICAgYm9vbGJnIDogJyMxODE4MTgnLFxyXG4gICAgICAgIGJvb2xvbiA6ICcjQzBDMEMwJyxcclxuXHJcbiAgICAgICAgc2VsZWN0IDogJyMzMDhBRkYnLFxyXG4gICAgICAgIG1vdmluZyA6ICcjMDNhZmZmJyxcclxuICAgICAgICBkb3duIDogJyMwMjQ2OTknLFxyXG4gICAgICAgIG92ZXIgOiAnIzAyNDY5OScsXHJcblxyXG4gICAgICAgIHN0cm9rZTogJ3JnYmEoMTEsMTEsMTEsMC41KScsXHJcbiAgICAgICAgc2Nyb2xsOiAnIzMzMzMzMycsXHJcblxyXG4gICAgICAgIGhpZGU6ICdyZ2JhKDAsMCwwLDApJyxcclxuXHJcbiAgICAgICAgZ3JvdXBCb3JkZXI6ICdub25lJyxcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHN0eWxlIGNzc1xyXG5cclxuICAgIGNzcyA6IHtcclxuICAgICAgICAvL3Vuc2VsZWN0OiAnLW8tdXNlci1zZWxlY3Q6bm9uZTsgLW1zLXVzZXItc2VsZWN0Om5vbmU7IC1raHRtbC11c2VyLXNlbGVjdDpub25lOyAtd2Via2l0LXVzZXItc2VsZWN0Om5vbmU7IC1tb3otdXNlci1zZWxlY3Q6bm9uZTsnLCBcclxuICAgICAgICBiYXNpYzogJ3Bvc2l0aW9uOmFic29sdXRlOyBwb2ludGVyLWV2ZW50czpub25lOyBib3gtc2l6aW5nOmJvcmRlci1ib3g7IG1hcmdpbjowOyBwYWRkaW5nOjA7IG92ZXJmbG93OmhpZGRlbjsgJyArICctby11c2VyLXNlbGVjdDpub25lOyAtbXMtdXNlci1zZWxlY3Q6bm9uZTsgLWtodG1sLXVzZXItc2VsZWN0Om5vbmU7IC13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsgLW1vei11c2VyLXNlbGVjdDpub25lOycsXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHN2ZyBwYXRoXHJcblxyXG4gICAgc3Znczoge1xyXG5cclxuICAgICAgICBncm91cDonTSA3IDcgTCA3IDggOCA4IDggNyA3IDcgTSA1IDcgTCA1IDggNiA4IDYgNyA1IDcgTSAzIDcgTCAzIDggNCA4IDQgNyAzIDcgTSA3IDUgTCA3IDYgOCA2IDggNSA3IDUgTSA2IDYgTCA2IDUgNSA1IDUgNiA2IDYgTSA3IDMgTCA3IDQgOCA0IDggMyA3IDMgTSA2IDQgTCA2IDMgNSAzIDUgNCA2IDQgTSAzIDUgTCAzIDYgNCA2IDQgNSAzIDUgTSAzIDMgTCAzIDQgNCA0IDQgMyAzIDMgWicsXHJcbiAgICAgICAgYXJyb3c6J00gMyA4IEwgOCA1IDMgMiAzIDggWicsXHJcbiAgICAgICAgYXJyb3dEb3duOidNIDUgOCBMIDggMyAyIDMgNSA4IFonLFxyXG4gICAgICAgIGFycm93VXA6J00gNSAyIEwgMiA3IDggNyA1IDIgWicsXHJcblxyXG4gICAgICAgIHNvbGlkOidNIDEzIDEwIEwgMTMgMSA0IDEgMSA0IDEgMTMgMTAgMTMgMTMgMTAgTSAxMSAzIEwgMTEgOSA5IDExIDMgMTEgMyA1IDUgMyAxMSAzIFonLFxyXG4gICAgICAgIGJvZHk6J00gMTMgMTAgTCAxMyAxIDQgMSAxIDQgMSAxMyAxMCAxMyAxMyAxMCBNIDExIDMgTCAxMSA5IDkgMTEgMyAxMSAzIDUgNSAzIDExIDMgTSA1IDQgTCA0IDUgNCAxMCA5IDEwIDEwIDkgMTAgNCA1IDQgWicsXHJcbiAgICAgICAgdmVoaWNsZTonTSAxMyA2IEwgMTEgMSAzIDEgMSA2IDEgMTMgMyAxMyAzIDExIDExIDExIDExIDEzIDEzIDEzIDEzIDYgTSAyLjQgNiBMIDQgMiAxMCAyIDExLjYgNiAyLjQgNiBNIDEyIDggTCAxMiAxMCAxMCAxMCAxMCA4IDEyIDggTSA0IDggTCA0IDEwIDIgMTAgMiA4IDQgOCBaJyxcclxuICAgICAgICBhcnRpY3VsYXRpb246J00gMTMgOSBMIDEyIDkgOSAyIDkgMSA1IDEgNSAyIDIgOSAxIDkgMSAxMyA1IDEzIDUgOSA0IDkgNiA1IDggNSAxMCA5IDkgOSA5IDEzIDEzIDEzIDEzIDkgWicsXHJcbiAgICAgICAgY2hhcmFjdGVyOidNIDEzIDQgTCAxMiAzIDkgNCA1IDQgMiAzIDEgNCA1IDYgNSA4IDQgMTMgNiAxMyA3IDkgOCAxMyAxMCAxMyA5IDggOSA2IDEzIDQgTSA2IDEgTCA2IDMgOCAzIDggMSA2IDEgWicsXHJcbiAgICAgICAgdGVycmFpbjonTSAxMyA4IEwgMTIgNyBRIDkuMDYgLTMuNjcgNS45NSA0Ljg1IDQuMDQgMy4yNyAyIDcgTCAxIDggNyAxMyAxMyA4IE0gMyA4IFEgMy43OCA1LjQyMCA1LjQgNi42IDUuMjAgNy4yNSA1IDggTCA3IDggUSA4LjM5IC0wLjE2IDExIDggTCA3IDExIDMgOCBaJyxcclxuICAgICAgICBqb2ludDonTSA3LjcgNy43IFEgOCA3LjQ1IDggNyA4IDYuNiA3LjcgNi4zIDcuNDUgNiA3IDYgNi42IDYgNi4zIDYuMyA2IDYuNiA2IDcgNiA3LjQ1IDYuMyA3LjcgNi42IDggNyA4IDcuNDUgOCA3LjcgNy43IE0gMy4zNSA4LjY1IEwgMSAxMSAzIDEzIDUuMzUgMTAuNjUgUSA2LjEgMTEgNyAxMSA4LjI4IDExIDkuMjUgMTAuMjUgTCA3LjggOC44IFEgNy40NSA5IDcgOSA2LjE1IDkgNS41NSA4LjQgNSA3Ljg1IDUgNyA1IDYuNTQgNS4xNSA2LjE1IEwgMy43IDQuNyBRIDMgNS43MTIgMyA3IDMgNy45IDMuMzUgOC42NSBNIDEwLjI1IDkuMjUgUSAxMSA4LjI4IDExIDcgMTEgNi4xIDEwLjY1IDUuMzUgTCAxMyAzIDExIDEgOC42NSAzLjM1IFEgNy45IDMgNyAzIDUuNyAzIDQuNyAzLjcgTCA2LjE1IDUuMTUgUSA2LjU0IDUgNyA1IDcuODUgNSA4LjQgNS41NSA5IDYuMTUgOSA3IDkgNy40NSA4LjggNy44IEwgMTAuMjUgOS4yNSBaJyxcclxuICAgICAgICByYXk6J00gOSAxMSBMIDUgMTEgNSAxMiA5IDEyIDkgMTEgTSAxMiA1IEwgMTEgNSAxMSA5IDEyIDkgMTIgNSBNIDExLjUgMTAgUSAxMC45IDEwIDEwLjQ1IDEwLjQ1IDEwIDEwLjkgMTAgMTEuNSAxMCAxMi4yIDEwLjQ1IDEyLjU1IDEwLjkgMTMgMTEuNSAxMyAxMi4yIDEzIDEyLjU1IDEyLjU1IDEzIDEyLjIgMTMgMTEuNSAxMyAxMC45IDEyLjU1IDEwLjQ1IDEyLjIgMTAgMTEuNSAxMCBNIDkgMTAgTCAxMCA5IDIgMSAxIDIgOSAxMCBaJyxcclxuICAgICAgICBjb2xsaXNpb246J00gMTEgMTIgTCAxMyAxMCAxMCA3IDEzIDQgMTEgMiA3LjUgNS41IDkgNyA3LjUgOC41IDExIDEyIE0gMyAyIEwgMSA0IDQgNyAxIDEwIDMgMTIgOCA3IDMgMiBaJyxcclxuICAgICAgICBub25lOidNIDkgNSBMIDUgNSA1IDkgOSA5IDkgNSBaJyxcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIGN1c3RvbSB0ZXh0XHJcblxyXG4gICAgc2V0VGV4dCA6IGZ1bmN0aW9uKCBzaXplLCBjb2xvciwgZm9udCwgc2hhZG93LCBjb2xvcnMsIGNzcyApe1xyXG5cclxuICAgICAgICBzaXplID0gc2l6ZSB8fCAxMztcclxuICAgICAgICBjb2xvciA9IGNvbG9yIHx8ICcjQ0NDJztcclxuICAgICAgICBmb250ID0gZm9udCB8fCAnQ29uc29sYXMsbW9uYWNvLG1vbm9zcGFjZTsnOy8vJ01vbm9zcGFjZSc7Ly8nXCJDb25zb2xhc1wiLCBcIkx1Y2lkYSBDb25zb2xlXCIsIE1vbmFjbywgbW9ub3NwYWNlJztcclxuXHJcbiAgICAgICAgY29sb3JzID0gY29sb3JzIHx8IFQuY29sb3JzO1xyXG4gICAgICAgIGNzcyA9IGNzcyB8fCBULmNzcztcclxuXHJcbiAgICAgICAgY29sb3JzLnRleHQgPSBjb2xvcjtcclxuICAgICAgICBjc3MudHh0ID0gY3NzLmJhc2ljICsgJ2ZvbnQtZmFtaWx5OicrZm9udCsnOyBmb250LXNpemU6JytzaXplKydweDsgY29sb3I6Jytjb2xvcisnOyBwYWRkaW5nOjJweCAxMHB4OyBsZWZ0OjA7IHRvcDoycHg7IGhlaWdodDoxNnB4OyB3aWR0aDoxMDBweDsgb3ZlcmZsb3c6aGlkZGVuOyB3aGl0ZS1zcGFjZTogbm93cmFwOyc7XHJcbiAgICAgICAgaWYoIHNoYWRvdyApIGNzcy50eHQgKz0gJyB0ZXh0LXNoYWRvdzonKyBzaGFkb3cgKyAnOyAnOyAvL1wiMXB4IDFweCAxcHggI2ZmMDAwMFwiO1xyXG4gICAgICAgIGNzcy50eHRzZWxlY3QgPSBjc3MudHh0ICsgJ3BhZGRpbmc6MnB4IDVweDsgYm9yZGVyOjFweCBkYXNoZWQgJyArIGNvbG9ycy5ib3JkZXIgKyAnOyBiYWNrZ3JvdW5kOicrIGNvbG9ycy50eHRzZWxlY3RiZysnOyc7XHJcbiAgICAgICAgY3NzLml0ZW0gPSBjc3MudHh0ICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOyBiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsMC4yKTsgbWFyZ2luLWJvdHRvbToxcHg7JztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsb25lOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBvLmNsb25lTm9kZSggdHJ1ZSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0U3ZnOiBmdW5jdGlvbiggZG9tLCB0eXBlLCB2YWx1ZSwgaWQgKXtcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSAtMSApIGRvbS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuICAgICAgICBlbHNlIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF0uc2V0QXR0cmlidXRlTlMoIG51bGwsIHR5cGUsIHZhbHVlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDc3M6IGZ1bmN0aW9uKCBkb20sIGNzcyApe1xyXG5cclxuICAgICAgICBmb3IoIHZhciByIGluIGNzcyApe1xyXG4gICAgICAgICAgICBpZiggVC5ET01fU0laRS5pbmRleE9mKHIpICE9PSAtMSApIGRvbS5zdHlsZVtyXSA9IGNzc1tyXSArICdweCc7XHJcbiAgICAgICAgICAgIGVsc2UgZG9tLnN0eWxlW3JdID0gY3NzW3JdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldDogZnVuY3Rpb24oIGcsIG8gKXtcclxuXHJcbiAgICAgICAgZm9yKCB2YXIgYXR0IGluIG8gKXtcclxuICAgICAgICAgICAgaWYoIGF0dCA9PT0gJ3R4dCcgKSBnLnRleHRDb250ZW50ID0gb1sgYXR0IF07XHJcbiAgICAgICAgICAgIGcuc2V0QXR0cmlidXRlTlMoIG51bGwsIGF0dCwgb1sgYXR0IF0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIGdldDogZnVuY3Rpb24oIGRvbSwgaWQgKXtcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSB1bmRlZmluZWQgKSByZXR1cm4gZG9tOyAvLyByb290XHJcbiAgICAgICAgZWxzZSBpZiggIWlzTmFOKCBpZCApICkgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZCBdOyAvLyBmaXJzdCBjaGlsZFxyXG4gICAgICAgIGVsc2UgaWYoIGlkIGluc3RhbmNlb2YgQXJyYXkgKXtcclxuICAgICAgICAgICAgaWYoaWQubGVuZ3RoID09PSAyKSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkWzBdIF0uY2hpbGROb2Rlc1sgaWRbMV0gXTtcclxuICAgICAgICAgICAgaWYoaWQubGVuZ3RoID09PSAzKSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkWzBdIF0uY2hpbGROb2Rlc1sgaWRbMV0gXS5jaGlsZE5vZGVzWyBpZFsyXSBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGRvbSA6IGZ1bmN0aW9uICggdHlwZSwgY3NzLCBvYmosIGRvbSwgaWQgKSB7XHJcblxyXG4gICAgICAgIHR5cGUgPSB0eXBlIHx8ICdkaXYnO1xyXG5cclxuICAgICAgICBpZiggVC5TVkdfVFlQRV9ELmluZGV4T2YodHlwZSkgIT09IC0xIHx8IFQuU1ZHX1RZUEVfRy5pbmRleE9mKHR5cGUpICE9PSAtMSApeyAvLyBpcyBzdmcgZWxlbWVudFxyXG5cclxuICAgICAgICAgICAgaWYoIHR5cGUgPT09J3N2ZycgKXtcclxuXHJcbiAgICAgICAgICAgICAgICBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsICdzdmcnICk7XHJcbiAgICAgICAgICAgICAgICBULnNldCggZG9tLCBvYmogKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjcmVhdGUgbmV3IHN2ZyBpZiBub3QgZGVmXHJcbiAgICAgICAgICAgICAgICBpZiggZG9tID09PSB1bmRlZmluZWQgKSBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsICdzdmcnICk7XHJcbiAgICAgICAgICAgICAgICBULmFkZEF0dHJpYnV0ZXMoIGRvbSwgdHlwZSwgb2JqLCBpZCApO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9IGVsc2UgeyAvLyBpcyBodG1sIGVsZW1lbnRcclxuXHJcbiAgICAgICAgICAgIGlmKCBkb20gPT09IHVuZGVmaW5lZCApIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5odG1scywgdHlwZSApO1xyXG4gICAgICAgICAgICBlbHNlIGRvbSA9IGRvbS5hcHBlbmRDaGlsZCggZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULmh0bWxzLCB0eXBlICkgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggY3NzICkgZG9tLnN0eWxlLmNzc1RleHQgPSBjc3M7IFxyXG5cclxuICAgICAgICBpZiggaWQgPT09IHVuZGVmaW5lZCApIHJldHVybiBkb207XHJcbiAgICAgICAgZWxzZSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkIHx8IDAgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZEF0dHJpYnV0ZXMgOiBmdW5jdGlvbiggZG9tLCB0eXBlLCBvLCBpZCApe1xyXG5cclxuICAgICAgICB2YXIgZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgdHlwZSApO1xyXG4gICAgICAgIFQuc2V0KCBnLCBvICk7XHJcbiAgICAgICAgVC5nZXQoIGRvbSwgaWQgKS5hcHBlbmRDaGlsZCggZyApO1xyXG4gICAgICAgIGlmKCBULlNWR19UWVBFX0cuaW5kZXhPZih0eXBlKSAhPT0gLTEgKSBnLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnbm9uZSc7XHJcbiAgICAgICAgcmV0dXJuIGc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhciA6IGZ1bmN0aW9uKCBkb20gKXtcclxuXHJcbiAgICAgICAgVC5wdXJnZSggZG9tICk7XHJcbiAgICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSB7XHJcbiAgICAgICAgICAgIGlmICggZG9tLmZpcnN0Q2hpbGQuZmlyc3RDaGlsZCApIFQuY2xlYXIoIGRvbS5maXJzdENoaWxkICk7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVDaGlsZCggZG9tLmZpcnN0Q2hpbGQgKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcHVyZ2UgOiBmdW5jdGlvbiAoIGRvbSApIHtcclxuXHJcbiAgICAgICAgdmFyIGEgPSBkb20uYXR0cmlidXRlcywgaSwgbjtcclxuICAgICAgICBpZiAoYSkge1xyXG4gICAgICAgICAgICBpID0gYS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgICAgICBuID0gYVtpXS5uYW1lO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkb21bbl0gPT09ICdmdW5jdGlvbicpIGRvbVtuXSA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgYSA9IGRvbS5jaGlsZE5vZGVzO1xyXG4gICAgICAgIGlmIChhKSB7XHJcbiAgICAgICAgICAgIGkgPSBhLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgICAgICBULnB1cmdlKCBkb20uY2hpbGROb2Rlc1tpXSApOyBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsYW1wOiBmdW5jdGlvbiAoIHZhbHVlLCBtaW4sIG1heCApIHtcclxuXHJcbiAgICAgICAgLy9yZXR1cm4gdmFsdWUgPD0gbWluID8gbWluIDogdmFsdWUgPj0gbWF4ID8gbWF4IDogdmFsdWU7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlIDwgbWluID8gbWluIDogdmFsdWUgPiBtYXggPyBtYXggOiB2YWx1ZTtcclxuICAgICAgICAvL3JldHVybiBNYXRoLm1heCggbWluLCBNYXRoLm1pbiggbWF4LCB2YWx1ZSApICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENvbG9yIGZ1bmN0aW9uXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgQ29sb3JMdW1hIDogZnVuY3Rpb24gKCBoZXgsIGwgKSB7XHJcblxyXG4gICAgICAgIC8vIHZhbGlkYXRlIGhleCBzdHJpbmdcclxuICAgICAgICBoZXggPSBTdHJpbmcoaGV4KS5yZXBsYWNlKC9bXjAtOWEtZl0vZ2ksICcnKTtcclxuICAgICAgICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHtcclxuICAgICAgICAgICAgaGV4ID0gaGV4WzBdK2hleFswXStoZXhbMV0raGV4WzFdK2hleFsyXStoZXhbMl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGwgPSBsIHx8IDA7XHJcblxyXG4gICAgICAgIC8vIGNvbnZlcnQgdG8gZGVjaW1hbCBhbmQgY2hhbmdlIGx1bWlub3NpdHlcclxuICAgICAgICB2YXIgcmdiID0gXCIjXCIsIGMsIGk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xyXG4gICAgICAgICAgICBjID0gcGFyc2VJbnQoaGV4LnN1YnN0cihpKjIsMiksIDE2KTtcclxuICAgICAgICAgICAgYyA9IE1hdGgucm91bmQoTWF0aC5taW4oTWF0aC5tYXgoMCwgYyArIChjICogbCkpLCAyNTUpKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgIHJnYiArPSAoXCIwMFwiK2MpLnN1YnN0cihjLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmdiO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZmluZERlZXBJbnZlcjogZnVuY3Rpb24gKCBjICkgeyBcclxuXHJcbiAgICAgICAgcmV0dXJuIChjWzBdICogMC4zICsgY1sxXSAqIC41OSArIGNbMl0gKiAuMTEpIDw9IDAuNjtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG5cclxuICAgIGhleFRvSHRtbDogZnVuY3Rpb24gKCB2ICkgeyBcclxuICAgICAgICB2ID0gdiA9PT0gdW5kZWZpbmVkID8gMHgwMDAwMDAgOiB2O1xyXG4gICAgICAgIHJldHVybiBcIiNcIiArIChcIjAwMDAwMFwiICsgdi50b1N0cmluZygxNikpLnN1YnN0cigtNik7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIGh0bWxUb0hleDogZnVuY3Rpb24gKCB2ICkgeyBcclxuXHJcbiAgICAgICAgcmV0dXJuIHYudG9VcHBlckNhc2UoKS5yZXBsYWNlKFwiI1wiLCBcIjB4XCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdTI1NTogZnVuY3Rpb24gKGMsIGkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGMuc3Vic3RyaW5nKGksIGkgKyAyKSwgMTYpIC8gMjU1O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdTE2OiBmdW5jdGlvbiAoIGMsIGkgKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZUludChjLnN1YnN0cmluZyhpLCBpICsgMSksIDE2KSAvIDE1O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdW5wYWNrOiBmdW5jdGlvbiggYyApe1xyXG5cclxuICAgICAgICBpZiAoYy5sZW5ndGggPT0gNykgcmV0dXJuIFsgVC51MjU1KGMsIDEpLCBULnUyNTUoYywgMyksIFQudTI1NShjLCA1KSBdO1xyXG4gICAgICAgIGVsc2UgaWYgKGMubGVuZ3RoID09IDQpIHJldHVybiBbIFQudTE2KGMsMSksIFQudTE2KGMsMiksIFQudTE2KGMsMykgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGh0bWxSZ2I6IGZ1bmN0aW9uKCBjICl7XHJcblxyXG4gICAgICAgIHJldHVybiAncmdiKCcgKyBNYXRoLnJvdW5kKGNbMF0gKiAyNTUpICsgJywnKyBNYXRoLnJvdW5kKGNbMV0gKiAyNTUpICsgJywnKyBNYXRoLnJvdW5kKGNbMl0gKiAyNTUpICsgJyknO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmdiVG9IZXggOiBmdW5jdGlvbiggYyApe1xyXG5cclxuICAgICAgICByZXR1cm4gJyMnICsgKCAnMDAwMDAwJyArICggKCBjWzBdICogMjU1ICkgPDwgMTYgXiAoIGNbMV0gKiAyNTUgKSA8PCA4IF4gKCBjWzJdICogMjU1ICkgPDwgMCApLnRvU3RyaW5nKCAxNiApICkuc2xpY2UoIC0gNiApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaHVlVG9SZ2I6IGZ1bmN0aW9uKCBwLCBxLCB0ICl7XHJcblxyXG4gICAgICAgIGlmICggdCA8IDAgKSB0ICs9IDE7XHJcbiAgICAgICAgaWYgKCB0ID4gMSApIHQgLT0gMTtcclxuICAgICAgICBpZiAoIHQgPCAxIC8gNiApIHJldHVybiBwICsgKCBxIC0gcCApICogNiAqIHQ7XHJcbiAgICAgICAgaWYgKCB0IDwgMSAvIDIgKSByZXR1cm4gcTtcclxuICAgICAgICBpZiAoIHQgPCAyIC8gMyApIHJldHVybiBwICsgKCBxIC0gcCApICogNiAqICggMiAvIDMgLSB0ICk7XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZ2JUb0hzbDogZnVuY3Rpb24gKCBjICkge1xyXG5cclxuICAgICAgICB2YXIgciA9IGNbMF0sIGcgPSBjWzFdLCBiID0gY1syXSwgbWluID0gTWF0aC5taW4ociwgZywgYiksIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLCBkZWx0YSA9IG1heCAtIG1pbiwgaCA9IDAsIHMgPSAwLCBsID0gKG1pbiArIG1heCkgLyAyO1xyXG4gICAgICAgIGlmIChsID4gMCAmJiBsIDwgMSkgcyA9IGRlbHRhIC8gKGwgPCAwLjUgPyAoMiAqIGwpIDogKDIgLSAyICogbCkpO1xyXG4gICAgICAgIGlmIChkZWx0YSA+IDApIHtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSByICYmIG1heCAhPSBnKSBoICs9IChnIC0gYikgLyBkZWx0YTtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSBnICYmIG1heCAhPSBiKSBoICs9ICgyICsgKGIgLSByKSAvIGRlbHRhKTtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSBiICYmIG1heCAhPSByKSBoICs9ICg0ICsgKHIgLSBnKSAvIGRlbHRhKTtcclxuICAgICAgICAgICAgaCAvPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gWyBoLCBzLCBsIF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBoc2xUb1JnYjogZnVuY3Rpb24gKCBjICkge1xyXG5cclxuICAgICAgICB2YXIgcCwgcSwgaCA9IGNbMF0sIHMgPSBjWzFdLCBsID0gY1syXTtcclxuXHJcbiAgICAgICAgaWYgKCBzID09PSAwICkgcmV0dXJuIFsgbCwgbCwgbCBdO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBxID0gbCA8PSAwLjUgPyBsICogKHMgKyAxKSA6IGwgKyBzIC0gKCBsICogcyApO1xyXG4gICAgICAgICAgICBwID0gbCAqIDIgLSBxO1xyXG4gICAgICAgICAgICByZXR1cm4gWyBULmh1ZVRvUmdiKHAsIHEsIGggKyAwLjMzMzMzKSwgVC5odWVUb1JnYihwLCBxLCBoKSwgVC5odWVUb1JnYihwLCBxLCBoIC0gMC4zMzMzMykgXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFNWRyBNT0RFTFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1ha2VHcmFkaWFudDogZnVuY3Rpb24gKCB0eXBlLCBzZXR0aW5ncywgcGFyZW50LCBjb2xvcnMgKSB7XHJcblxyXG4gICAgICAgIFQuZG9tKCB0eXBlLCBudWxsLCBzZXR0aW5ncywgcGFyZW50LCAwICk7XHJcblxyXG4gICAgICAgIHZhciBuID0gcGFyZW50LmNoaWxkTm9kZXNbMF0uY2hpbGROb2Rlcy5sZW5ndGggLSAxLCBjO1xyXG5cclxuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgYyA9IGNvbG9yc1tpXTtcclxuICAgICAgICAgICAgVC5kb20oICdzdG9wJywgbnVsbCwgeyBvZmZzZXQ6Y1swXSsnJScsIHN0eWxlOidzdG9wLWNvbG9yOicrY1sxXSsnOyBzdG9wLW9wYWNpdHk6JytjWzJdKyc7JyB9LCBwYXJlbnQsIFswLG5dICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qbWFrZUdyYXBoOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciB3ID0gMTI4O1xyXG4gICAgICAgIHZhciByYWRpdXMgPSAzNDtcclxuICAgICAgICB2YXIgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6VC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6NCwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIC8vVC5kb20oICdyZWN0JywgJycsIHsgeDoxMCwgeToxMCwgd2lkdGg6MTA4LCBoZWlnaHQ6MTA4LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjIgLCBmaWxsOidub25lJ30sIHN2ZyApOy8vMVxyXG4gICAgICAgIC8vVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOlQuY29sb3JzLmJ1dHRvbiwgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo4IH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzKzcsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6NyAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgLy9ULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6J3JnYmEoMjU1LDI1NSwyNTUsMC4zKScsICdzdHJva2Utd2lkdGgnOjIsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcsICdzdHJva2Utb3BhY2l0eSc6MC41IH0sIHN2ZyApOy8vM1xyXG4gICAgICAgIFQuZ3JhcGggPSBzdmc7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIG1ha2VLbm9iOiBmdW5jdGlvbiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICB2YXIgdyA9IDEyODtcclxuICAgICAgICB2YXIgcmFkaXVzID0gMzQ7XHJcbiAgICAgICAgdmFyIHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOlQuY29sb3JzLmJ1dHRvbiwgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo4IH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo0LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzoncm91bmQnIH0sIHN2ZyApOy8vMVxyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cys3LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4xKScsICdzdHJva2Utd2lkdGgnOjcgLCBmaWxsOidub25lJ30sIHN2ZyApOy8vMlxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZToncmdiYSgyNTUsMjU1LDI1NSwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J3JvdW5kJywgJ3N0cm9rZS1vcGFjaXR5JzowLjUgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgVC5rbm9iID0gc3ZnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbWFrZUNpcmN1bGFyOiBmdW5jdGlvbiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICB2YXIgdyA9IDEyODtcclxuICAgICAgICB2YXIgcmFkaXVzID0gNDA7XHJcbiAgICAgICAgdmFyIHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4xKScsICdzdHJva2Utd2lkdGgnOjEwLCBmaWxsOidub25lJyB9LCBzdmcgKTsvLzBcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6VC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6NywgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApOy8vMVxyXG4gICAgICAgIFQuY2lyY3VsYXIgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlSm95c3RpY2s6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIC8vKycgYmFja2dyb3VuZDojZjAwOydcclxuXHJcbiAgICAgICAgdmFyIHcgPSAxMjg7XHJcbiAgICAgICAgdmFyIHJhZGl1cyA9IE1hdGguZmxvb3IoKHctMzApKjAuNSk7XHJcbiAgICAgICAgdmFyIGlubmVyUmFkaXVzID0gTWF0aC5mbG9vcihyYWRpdXMqMC42KTtcclxuICAgICAgICB2YXIgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2RlZnMnLCBudWxsLCB7fSwgc3ZnICk7XHJcbiAgICAgICAgVC5kb20oICdnJywgbnVsbCwge30sIHN2ZyApO1xyXG5cclxuICAgICAgICBpZiggbW9kZWwgPT09IDAgKXtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgICAgICAvLyBncmFkaWFuIGJhY2tncm91bmRcclxuICAgICAgICAgICAgdmFyIGNjYyA9IFsgWzQwLCAncmdiKDAsMCwwKScsIDAuM10sIFs4MCwgJ3JnYigwLDAsMCknLCAwXSwgWzkwLCAncmdiKDUwLDUwLDUwKScsIDAuNF0sIFsxMDAsICdyZ2IoNTAsNTAsNTApJywgMF0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWQnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhZGlhbiBzaGFkb3dcclxuICAgICAgICAgICAgY2NjID0gWyBbNjAsICdyZ2IoMCwwLDApJywgMC41XSwgWzEwMCwgJ3JnYigwLDAsMCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZFMnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhZGlhbiBzdGlja1xyXG4gICAgICAgICAgICB2YXIgY2MwID0gWydyZ2IoNDAsNDAsNDApJywgJ3JnYig0OCw0OCw0OCknLCAncmdiKDMwLDMwLDMwKSddO1xyXG4gICAgICAgICAgICB2YXIgY2MxID0gWydyZ2IoMSw5MCwxOTcpJywgJ3JnYigzLDk1LDIwNyknLCAncmdiKDAsNjUsMTY3KSddO1xyXG5cclxuICAgICAgICAgICAgY2NjID0gWyBbMzAsIGNjMFswXSwgMV0sIFs2MCwgY2MwWzFdLCAxXSwgWzgwLCBjYzBbMV0sIDFdLCBbMTAwLCBjYzBbMl0sIDFdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkSW4nLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgY2NjID0gWyBbMzAsIGNjMVswXSwgMV0sIFs2MCwgY2MxWzFdLCAxXSwgWzgwLCBjYzFbMV0sIDFdLCBbMTAwLCBjYzFbMl0sIDFdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkSW4yJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYXBoXHJcblxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6J3VybCgjZ3JhZCknIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0KzUsIGN5OjY0KzEwLCByOmlubmVyUmFkaXVzKzEwLCBmaWxsOid1cmwoI2dyYWRTKScgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOmlubmVyUmFkaXVzLCBmaWxsOid1cmwoI2dyYWRJbiknIH0sIHN2ZyApOy8vNFxyXG5cclxuICAgICAgICAgICAgVC5qb3lzdGlja18wID0gc3ZnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgLy8gZ3JhZGlhbiBzaGFkb3dcclxuICAgICAgICAgICAgY2NjID0gWyBbNjksICdyZ2IoMCwwLDApJywgMF0sWzcwLCAncmdiKDAsMCwwKScsIDAuM10sIFsxMDAsICdyZ2IoMCwwLDApJywgMF0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRYJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDonbm9uZScsIHN0cm9rZToncmdiYSgxMDAsMTAwLDEwMCwwLjI1KScsICdzdHJva2Utd2lkdGgnOic0JyB9LCBzdmcgKTsvLzJcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMrMTQsIGZpbGw6J3VybCgjZ3JhZFgpJyB9LCBzdmcgKTsvLzNcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMsIGZpbGw6J25vbmUnLCBzdHJva2U6J3JnYigxMDAsMTAwLDEwMCknLCAnc3Ryb2tlLXdpZHRoJzonNCcgfSwgc3ZnICk7Ly80XHJcblxyXG4gICAgICAgICAgICBULmpveXN0aWNrXzEgPSBzdmc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VDb2xvclJpbmc6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIHcgPSAyNTY7XHJcbiAgICAgICAgdmFyIHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdkZWZzJywgbnVsbCwge30sIHN2ZyApO1xyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHt9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgdmFyIHMgPSA0MDsvL3N0cm9rZVxyXG4gICAgICAgIHZhciByID0oIHctcyApKjAuNTtcclxuICAgICAgICB2YXIgbWlkID0gdyowLjU7XHJcbiAgICAgICAgdmFyIG4gPSAyNCwgbnVkZ2UgPSA4IC8gciAvIG4gKiBNYXRoLlBJLCBhMSA9IDAsIGQxO1xyXG4gICAgICAgIHZhciBhbSwgdGFuLCBkMiwgYTIsIGFyLCBpLCBqLCBwYXRoLCBjY2M7XHJcbiAgICAgICAgdmFyIGNvbG9yID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPD0gbjsgKytpKSB7XHJcblxyXG4gICAgICAgICAgICBkMiA9IGkgLyBuO1xyXG4gICAgICAgICAgICBhMiA9IGQyICogVC5Ud29QSTtcclxuICAgICAgICAgICAgYW0gPSAoYTEgKyBhMikgKiAwLjU7XHJcbiAgICAgICAgICAgIHRhbiA9IDEgLyBNYXRoLmNvcygoYTIgLSBhMSkgKiAwLjUpO1xyXG5cclxuICAgICAgICAgICAgYXIgPSBbXHJcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihhMSksIC1NYXRoLmNvcyhhMSksIFxyXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oYW0pICogdGFuLCAtTWF0aC5jb3MoYW0pICogdGFuLCBcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGEyKSwgLU1hdGguY29zKGEyKVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29sb3JbMV0gPSBULnJnYlRvSGV4KCBULmhzbFRvUmdiKFtkMiwgMSwgMC41XSkgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGogPSA2O1xyXG4gICAgICAgICAgICAgICAgd2hpbGUoai0tKXtcclxuICAgICAgICAgICAgICAgICAgIGFyW2pdID0gKChhcltqXSpyKSttaWQpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGF0aCA9ICcgTScgKyBhclswXSArICcgJyArIGFyWzFdICsgJyBRJyArIGFyWzJdICsgJyAnICsgYXJbM10gKyAnICcgKyBhcls0XSArICcgJyArIGFyWzVdO1xyXG5cclxuICAgICAgICAgICAgICAgIGNjYyA9IFsgWzAsY29sb3JbMF0sMV0sIFsxMDAsY29sb3JbMV0sMV0gXTtcclxuICAgICAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHJytpLCB4MTphclswXSwgeTE6YXJbMV0sIHgyOmFyWzRdLCB5Mjphcls1XSwgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOnBhdGgsICdzdHJva2Utd2lkdGgnOnMsIHN0cm9rZTondXJsKCNHJytpKycpJywgJ3N0cm9rZS1saW5lY2FwJzpcImJ1dHRcIiB9LCBzdmcsIDEgKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGExID0gYTIgLSBudWRnZTsgXHJcbiAgICAgICAgICAgIGNvbG9yWzBdID0gY29sb3JbMV07XHJcbiAgICAgICAgICAgIGQxID0gZDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgYnIgPSAoMTI4IC0gcyApICsgMjtcclxuICAgICAgICB2YXIgYncgPSA2MDtcclxuXHJcbiAgICAgICAgLy8gYmxhY2sgLyB3aGl0ZVxyXG4gICAgICAgIGNjYyA9IFsgWzAsICcjRkZGRkZGJywgMV0sIFs1MCwgJyNGRkZGRkYnLCAwXSwgWzUwLCAnIzAwMDAwMCcsIDBdLCBbMTAwLCAnIzAwMDAwMCcsIDFdIF07XHJcbiAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdsaW5lYXJHcmFkaWVudCcsIHsgaWQ6J0dMMScsIHgxOm1pZC1idywgeTE6bWlkLWJ3LCB4MjptaWQtYncsIHkyOm1pZCtidywgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgLy8gc2F0dXJhdGlvblxyXG4gICAgICAgIGNjYyA9IFsgWzAsICcjN2Y3ZjdmJywgMF0sIFs1MCwgJyM3ZjdmN2YnLCAwLjVdLCBbMTAwLCAnIzdmN2Y3ZicsIDFdIF07XHJcbiAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdsaW5lYXJHcmFkaWVudCcsIHsgaWQ6J0dMMicsIHgxOm1pZC1idywgeTE6bWlkLWJ3LCB4MjptaWQrYncsIHkyOm1pZC1idywgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDoxMjgsIGN5OjEyOCwgcjpiciwgZmlsbDoncmVkJyB9LCBzdmcgKTsvLzJcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjEyOCwgY3k6MTI4LCByOmJyLCBmaWxsOid1cmwoI0dMMiknIH0sIHN2ZyApOy8vM1xyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MTI4LCBjeToxMjgsIHI6YnIsIGZpbGw6J3VybCgjR0wxKScgfSwgc3ZnICk7Ly80XHJcblxyXG4gICAgICAgIC8vVC5kb20oICdwb2x5Z29uJywgJycsIHsgcG9pbnRzOicxMjgsMCAyNTYsMTkwIDAsMjEwJywgcjpiciwgZmlsbDondXJsKCNHTDEpJyB9LCBzdmcgKTsvLzRcclxuXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjAsIGN5OjAsIHI6NiwgJ3N0cm9rZS13aWR0aCc6Mywgc3Ryb2tlOicjRkZGJywgZmlsbDonbm9uZScgfSwgc3ZnICk7Ly81XHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjAsIGN5OjAsIHI6NiwgJ3N0cm9rZS13aWR0aCc6Mywgc3Ryb2tlOicjMDAwJywgZmlsbDonbm9uZScgfSwgc3ZnICk7Ly82XHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDowLCBjeTowLCByOjgsICdzdHJva2Utd2lkdGgnOjQsIHN0cm9rZTonI0ZGRicsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vNVxyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6MCwgY3k6MCwgcjo4LCAnc3Ryb2tlLXdpZHRoJzo0LCBzdHJva2U6JyMwMDAnLCBmaWxsOidub25lJyB9LCBzdmcgKTsvLzZcclxuXHJcblxyXG4gICAgICAgIFQuY29sb3JSaW5nID0gc3ZnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaWNvbjogZnVuY3Rpb24gKCB0eXBlLCBjb2xvciwgdyApe1xyXG5cclxuICAgICAgICB3ID0gdyB8fCA0MDtcclxuICAgICAgICBjb2xvciA9IGNvbG9yIHx8ICcjREVERURFJztcclxuICAgICAgICB2YXIgdmlld0JveCA9ICcwIDAgMjU2IDI1Nic7XHJcbiAgICAgICAgdmFyIHQgPSBbXCI8c3ZnIHhtbG5zPSdcIitULnN2Z25zK1wiJyB2ZXJzaW9uPScxLjEnIHhtbG5zOnhsaW5rPSdcIitULmh0bWxzK1wiJyBzdHlsZT0ncG9pbnRlci1ldmVudHM6bm9uZTsnIHByZXNlcnZlQXNwZWN0UmF0aW89J3hNaW5ZTWF4IG1lZXQnIHg9JzBweCcgeT0nMHB4JyB3aWR0aD0nXCIrdytcInB4JyBoZWlnaHQ9J1wiK3crXCJweCcgdmlld0JveD0nXCIrdmlld0JveCtcIic+PGc+XCJdO1xyXG4gICAgICAgIHN3aXRjaCh0eXBlKXtcclxuICAgICAgICAgICAgY2FzZSAnbG9nbyc6XHJcbiAgICAgICAgICAgIC8vdFsxXT1cIjxwYXRoIGlkPSdsb2dvaW4nIHN0cm9rZT0nXCIrY29sb3IrXCInIHN0cm9rZS13aWR0aD0nMTYnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS1saW5lY2FwPSdzcXVhcmUnIGZpbGw9J25vbmUnIGQ9J00gMTkyIDQ0IEwgMTkyIDE0OCBRIDE5MiAxNzQuNSAxNzMuMyAxOTMuMjUgMTU0LjU1IDIxMiAxMjggMjEyIDEwMS41IDIxMiA4Mi43NSAxOTMuMjUgNjQgMTc0LjUgNjQgMTQ4IEwgNjQgNDQgTSAxNjAgNDQgTCAxNjAgMTQ4IFEgMTYwIDE2MS4yNSAxNTAuNjUgMTcwLjY1IDE0MS4yNSAxODAgMTI4IDE4MCAxMTQuNzUgMTgwIDEwNS4zNSAxNzAuNjUgOTYgMTYxLjI1IDk2IDE0OCBMIDk2IDQ0Jy8+XCI7XHJcbiAgICAgICAgICAgIHRbMV09XCI8cGF0aCBpZD0nbG9nb2luJyBmaWxsPSdcIitjb2xvcitcIicgc3Ryb2tlPSdub25lJyBkPSdcIitULmxvZ29GaWxsX2QrXCInLz5cIjtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzYXZlJzpcclxuICAgICAgICAgICAgdFsxXT1cIjxwYXRoIHN0cm9rZT0nXCIrY29sb3IrXCInIHN0cm9rZS13aWR0aD0nNCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBmaWxsPSdub25lJyBkPSdNIDI2LjEyNSAxNyBMIDIwIDIyLjk1IDE0LjA1IDE3IE0gMjAgOS45NSBMIDIwIDIyLjk1Jy8+PHBhdGggc3Ryb2tlPSdcIitjb2xvcitcIicgc3Ryb2tlLXdpZHRoPScyLjUnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgZmlsbD0nbm9uZScgZD0nTSAzMi42IDIzIEwgMzIuNiAyNS41IFEgMzIuNiAyOC41IDI5LjYgMjguNSBMIDEwLjYgMjguNSBRIDcuNiAyOC41IDcuNiAyNS41IEwgNy42IDIzJy8+XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0WzJdID0gXCI8L2c+PC9zdmc+XCI7XHJcbiAgICAgICAgcmV0dXJuIHQuam9pbihcIlxcblwiKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGxvZ29GaWxsX2Q6IFtcclxuICAgIFwiTSAxNzEgMTUwLjc1IEwgMTcxIDMzLjI1IDE1NS41IDMzLjI1IDE1NS41IDE1MC43NSBRIDE1NS41IDE2Mi4yIDE0Ny40NSAxNzAuMiAxMzkuNDUgMTc4LjI1IDEyOCAxNzguMjUgMTE2LjYgMTc4LjI1IDEwOC41NSAxNzAuMiAxMDAuNSAxNjIuMiAxMDAuNSAxNTAuNzUgXCIsXHJcbiAgICBcIkwgMTAwLjUgMzMuMjUgODUgMzMuMjUgODUgMTUwLjc1IFEgODUgMTY4LjY1IDk3LjU1IDE4MS4xNSAxMTAuMTUgMTkzLjc1IDEyOCAxOTMuNzUgMTQ1LjkgMTkzLjc1IDE1OC40IDE4MS4xNSAxNzEgMTY4LjY1IDE3MSAxNTAuNzUgXCIsXHJcbiAgICBcIk0gMjAwIDMzLjI1IEwgMTg0IDMzLjI1IDE4NCAxNTAuOCBRIDE4NCAxNzQuMSAxNjcuNiAxOTAuNCAxNTEuMyAyMDYuOCAxMjggMjA2LjggMTA0Ljc1IDIwNi44IDg4LjMgMTkwLjQgNzIgMTc0LjEgNzIgMTUwLjggTCA3MiAzMy4yNSA1NiAzMy4yNSA1NiAxNTAuNzUgXCIsXHJcbiAgICBcIlEgNTYgMTgwLjU1IDc3LjA1IDIwMS42IDk4LjIgMjIyLjc1IDEyOCAyMjIuNzUgMTU3LjggMjIyLjc1IDE3OC45IDIwMS42IDIwMCAxODAuNTUgMjAwIDE1MC43NSBMIDIwMCAzMy4yNSBaXCIsXHJcbiAgICBdLmpvaW4oJ1xcbicpLFxyXG5cclxufVxyXG5cclxuVC5zZXRUZXh0KCk7XHJcblxyXG52YXIgVG9vbHMgPSBUO1xyXG5leHBvcnQgeyBUb29scyB9OyIsIlxyXG4vKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG4vLyBJTlRFTkFMIEZVTkNUSU9OXHJcblxyXG52YXIgUiA9IHtcclxuXHJcblx0dWk6IFtdLFxyXG5cclxuXHRJRDogbnVsbCxcclxuICAgIGxvY2s6ZmFsc2UsXHJcbiAgICB3bG9jazpmYWxzZSxcclxuICAgIGN1cnJlbnQ6LTEsXHJcblxyXG5cdG5lZWRSZVpvbmU6IHRydWUsXHJcblx0aXNFdmVudHNJbml0OiBmYWxzZSxcclxuXHJcbiAgICBwcmV2RGVmYXVsdDogWydjb250ZXh0bWVudScsICdtb3VzZWRvd24nLCAnbW91c2Vtb3ZlJywgJ21vdXNldXAnXSxcclxuXHJcblx0eG1sc2VyaWFsaXplcjogbmV3IFhNTFNlcmlhbGl6ZXIoKSxcclxuXHR0bXBUaW1lOiBudWxsLFxyXG4gICAgdG1wSW1hZ2U6IG51bGwsXHJcblxyXG4gICAgb2xkQ3Vyc29yOidhdXRvJyxcclxuXHJcbiAgICBpbnB1dDogbnVsbCxcclxuICAgIHBhcmVudDogbnVsbCxcclxuICAgIGZpcnN0SW1wdXQ6IHRydWUsXHJcbiAgICAvL2NhbGxiYWNrSW1wdXQ6IG51bGwsXHJcbiAgICBoaWRkZW5JbXB1dDpudWxsLFxyXG4gICAgaGlkZGVuU2l6ZXI6bnVsbCxcclxuICAgIGhhc0ZvY3VzOmZhbHNlLFxyXG4gICAgc3RhcnRJbnB1dDpmYWxzZSxcclxuICAgIGlucHV0UmFuZ2UgOiBbMCwwXSxcclxuICAgIGN1cnNvcklkIDogMCxcclxuICAgIHN0cjonJyxcclxuICAgIHBvczowLFxyXG4gICAgc3RhcnRYOi0xLFxyXG4gICAgbW92ZVg6LTEsXHJcblxyXG4gICAgZGVidWdJbnB1dDpmYWxzZSxcclxuXHJcbiAgICBpc0xvb3A6IGZhbHNlLFxyXG4gICAgbGlzdGVuczogW10sXHJcblxyXG4gICAgZTp7XHJcbiAgICAgICAgdHlwZTpudWxsLFxyXG4gICAgICAgIGNsaWVudFg6MCxcclxuICAgICAgICBjbGllbnRZOjAsXHJcbiAgICAgICAga2V5Q29kZTpOYU4sXHJcbiAgICAgICAga2V5Om51bGwsXHJcbiAgICAgICAgZGVsdGE6MCxcclxuICAgIH0sXHJcblxyXG4gICAgaXNNb2JpbGU6IGZhbHNlLFxyXG5cclxuICAgIFxyXG5cclxuXHRhZGQ6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgUi51aS5wdXNoKCBvICk7XHJcbiAgICAgICAgUi5nZXRab25lKCBvICk7XHJcblxyXG4gICAgICAgIGlmKCAhUi5pc0V2ZW50c0luaXQgKSBSLmluaXRFdmVudHMoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRlc3RNb2JpbGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIG4gPSBuYXZpZ2F0b3IudXNlckFnZW50O1xyXG4gICAgICAgIGlmIChuLm1hdGNoKC9BbmRyb2lkL2kpIHx8IG4ubWF0Y2goL3dlYk9TL2kpIHx8IG4ubWF0Y2goL2lQaG9uZS9pKSB8fCBuLm1hdGNoKC9pUGFkL2kpIHx8IG4ubWF0Y2goL2lQb2QvaSkgfHwgbi5tYXRjaCgvQmxhY2tCZXJyeS9pKSB8fCBuLm1hdGNoKC9XaW5kb3dzIFBob25lL2kpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBlbHNlIHJldHVybiBmYWxzZTsgIFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIHZhciBpID0gUi51aS5pbmRleE9mKCBvICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCBpICE9PSAtMSApIHtcclxuICAgICAgICAgICAgUi5yZW1vdmVMaXN0ZW4oIG8gKTtcclxuICAgICAgICAgICAgUi51aS5zcGxpY2UoIGksIDEgKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggUi51aS5sZW5ndGggPT09IDAgKXtcclxuICAgICAgICAgICAgUi5yZW1vdmVFdmVudHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGluaXRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNFdmVudHNJbml0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgZG9tRWxlbWVudCA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gICAgICAgIFIuaXNNb2JpbGUgPSBSLnRlc3RNb2JpbGUoKTtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNNb2JpbGUgKXtcclxuICAgICAgICAgICAgZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgUiwgZmFsc2UgKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY29udGV4dG1lbnUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgUi5yZXNpemUgLCBmYWxzZSApO1xyXG4gICAgICAgIC8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBSLCBmYWxzZSApO1xyXG5cclxuICAgICAgICBSLmlzRXZlbnRzSW5pdCA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoICFSLmlzRXZlbnRzSW5pdCApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGRvbUVsZW1lbnQgPSBkb2N1bWVudC5ib2R5O1xyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSApe1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb21FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3doZWVsJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgUiwgZmFsc2UgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIFIgKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgUiApO1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncmVzaXplJywgUi5yZXNpemUgICk7XHJcblxyXG4gICAgICAgIFIuaXNFdmVudHNJbml0ID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZXNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUi5uZWVkUmVab25lID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdmFyIGkgPSBSLnVpLmxlbmd0aCwgdTtcclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgICAgICB1ID0gUi51aVtpXTtcclxuICAgICAgICAgICAgaWYoIHUuaXNHdWkgJiYgIXUuaXNDYW52YXNPbmx5ICYmIHUuYXV0b1Jlc2l6ZSApIHUuc2V0SGVpZ2h0KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBIQU5ETEUgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBcclxuXHJcbiAgICBoYW5kbGVFdmVudDogZnVuY3Rpb24gKCBldmVudCApIHtcclxuXHJcbiAgICAgICAgLy9pZighZXZlbnQudHlwZSkgcmV0dXJuO1xyXG5cclxuICAgICAgLy8gIGNvbnNvbGUubG9nKCBldmVudC50eXBlIClcclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUuaW5kZXhPZiggUi5wcmV2RGVmYXVsdCApICE9PSAtMSApIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IFxyXG5cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2NvbnRleHRtZW51JyApIHJldHVybjsgXHJcblxyXG4gICAgICAgIC8vaWYoIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJyl7IFIuZWRpdFRleHQoIGV2ZW50ICk7IHJldHVybjt9XHJcblxyXG4gICAgICAgIC8vaWYoIGV2ZW50LnR5cGUgIT09ICdrZXlkb3duJyAmJiBldmVudC50eXBlICE9PSAnd2hlZWwnICkgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAvL2V2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG5cclxuICAgICAgICBSLmZpbmRab25lKCk7XHJcbiAgICAgICBcclxuICAgICAgICB2YXIgZSA9IFIuZTtcclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJykgUi5rZXlkb3duKCBldmVudCApO1xyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAna2V5dXAnKSBSLmtleXVwKCBldmVudCApO1xyXG5cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3doZWVsJyApIGUuZGVsdGEgPSBldmVudC5kZWx0YVkgPiAwID8gMSA6IC0xO1xyXG4gICAgICAgIGVsc2UgZS5kZWx0YSA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZS5jbGllbnRYID0gZXZlbnQuY2xpZW50WCB8fCAwO1xyXG4gICAgICAgIGUuY2xpZW50WSA9IGV2ZW50LmNsaWVudFkgfHwgMDtcclxuICAgICAgICBlLnR5cGUgPSBldmVudC50eXBlO1xyXG5cclxuICAgICAgICAvLyBtb2JpbGVcclxuXHJcbiAgICAgICAgaWYoIFIuaXNNb2JpbGUgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMCApe1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRYID0gZXZlbnQudG91Y2hlc1sgMCBdLmNsaWVudFggfHwgMDtcclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WSA9IGV2ZW50LnRvdWNoZXNbIDAgXS5jbGllbnRZIHx8IDA7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSBlLnR5cGUgPSAnbW91c2Vkb3duJztcclxuICAgICAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaGVuZCcpIGUudHlwZSA9ICdtb3VzZXVwJ1xyXG4gICAgICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNobW92ZScpIGUudHlwZSA9ICdtb3VzZW1vdmUnO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgLypcclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKXsgZS50eXBlID0gJ21vdXNlZG93bic7IFIuZmluZElEKCBlICk7IH1cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNoZW5kJyl7IGUudHlwZSA9ICdtb3VzZXVwJzsgIGlmKCBSLklEICE9PSBudWxsICkgUi5JRC5oYW5kbGVFdmVudCggZSApOyBSLmNsZWFyT2xkSUQoKTsgfVxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2htb3ZlJyl7IGUudHlwZSA9ICdtb3VzZW1vdmUnOyAgfVxyXG4gICAgICAgICovXHJcblxyXG5cclxuICAgICAgICBpZiggZS50eXBlID09PSAnbW91c2Vkb3duJyApIFIubG9jayA9IHRydWU7XHJcbiAgICAgICAgaWYoIGUudHlwZSA9PT0gJ21vdXNldXAnICkgUi5sb2NrID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICYmIGUudHlwZSA9PT0gJ21vdXNlZG93bicgKSBSLmZpbmRJRCggZSApO1xyXG4gICAgICAgIGlmKCBlLnR5cGUgPT09ICdtb3VzZW1vdmUnICYmICFSLmxvY2sgKSBSLmZpbmRJRCggZSApO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBpZiggUi5JRCAhPT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuSUQuaXNDYW52YXNPbmx5ICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WCA9IFIuSUQubW91c2UueDtcclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WSA9IFIuSUQubW91c2UueTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIFIuSUQuaGFuZGxlRXZlbnQoIGUgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSAmJiBlLnR5cGUgPT09ICdtb3VzZXVwJyApIFIuY2xlYXJPbGRJRCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJRFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGZpbmRJRDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgaSA9IFIudWkubGVuZ3RoLCBuZXh0ID0gLTEsIHUsIHgsIHk7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuXHJcbiAgICAgICAgICAgIHUgPSBSLnVpW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYoIHUuaXNDYW52YXNPbmx5ICkge1xyXG5cclxuICAgICAgICAgICAgICAgIHggPSB1Lm1vdXNlLng7XHJcbiAgICAgICAgICAgICAgICB5ID0gdS5tb3VzZS55O1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICB4ID0gZS5jbGllbnRYO1xyXG4gICAgICAgICAgICAgICAgeSA9IGUuY2xpZW50WTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCBSLm9uWm9uZSggdSwgeCwgeSApICl7IFxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBuZXh0ID0gaTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYoIG5leHQgIT09IFIuY3VycmVudCApe1xyXG4gICAgICAgICAgICAgICAgICAgIFIuY2xlYXJPbGRJRCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFIuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5JRCA9IHU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmV4dCA9PT0gLTEgKSBSLmNsZWFyT2xkSUQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyT2xkSUQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoICFSLklEICkgcmV0dXJuO1xyXG4gICAgICAgIFIuY3VycmVudCA9IC0xO1xyXG4gICAgICAgIFIuSUQucmVzZXQoKTtcclxuICAgICAgICBSLklEID0gbnVsbDtcclxuICAgICAgICBSLmN1cnNvcigpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBHVUkgLyBHUk9VUCBGVU5DVElPTlxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNhbGNVaXM6IGZ1bmN0aW9uICggdWlzLCB6b25lLCBweSApIHtcclxuXHJcbiAgICAgICAgdmFyIGxuZyA9IHVpcy5sZW5ndGgsIHUsIGksIHB4ID0gMCwgbXkgPSAwO1xyXG5cclxuICAgICAgICBmb3IoIGkgPSAwOyBpIDwgbG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHUgPSB1aXNbaV07XHJcblxyXG4gICAgICAgICAgICB1LnpvbmUudyA9IHUudztcclxuICAgICAgICAgICAgdS56b25lLmggPSB1Lmg7XHJcblxyXG4gICAgICAgICAgICBpZiggIXUuYXV0b1dpZHRoICl7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHB4ID09PSAwICkgcHkgKz0gdS5oICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICB1LnpvbmUueCA9IHpvbmUueCArIHB4O1xyXG4gICAgICAgICAgICAgICAgdS56b25lLnkgPSBweCA9PT0gMCA/IHB5IC0gdS5oIDogbXk7XHJcblxyXG4gICAgICAgICAgICAgICAgbXkgPSB1LnpvbmUueTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcHggKz0gdS53O1xyXG4gICAgICAgICAgICAgICAgaWYoIHB4ICsgdS53ID4gem9uZS53ICkgcHggPSAwO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICB1LnpvbmUueCA9IHpvbmUueDtcclxuICAgICAgICAgICAgICAgIHUuem9uZS55ID0gcHk7XHJcbiAgICAgICAgICAgICAgICBweSArPSB1LmggKyAxO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIHUuaXNHcm91cCApIHUuY2FsY1VpcygpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG5cdGZpbmRUYXJnZXQ6IGZ1bmN0aW9uICggdWlzLCBlICkge1xyXG5cclxuICAgICAgICB2YXIgaSA9IHVpcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaWYoIFIub25ab25lKCB1aXNbaV0sIGUuY2xpZW50WCwgZS5jbGllbnRZICkgKSByZXR1cm4gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAtMTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgWk9ORVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGZpbmRab25lOiBmdW5jdGlvbiAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBpZiggIVIubmVlZFJlWm9uZSAmJiAhZm9yY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBpID0gUi51aS5sZW5ndGgsIHU7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXsgXHJcblxyXG4gICAgICAgICAgICB1ID0gUi51aVtpXTtcclxuICAgICAgICAgICAgUi5nZXRab25lKCB1ICk7XHJcbiAgICAgICAgICAgIGlmKCB1LmlzR3VpICkgdS5jYWxjVWlzKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUi5uZWVkUmVab25lID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBvblpvbmU6IGZ1bmN0aW9uICggbywgeCwgeSApIHtcclxuXHJcbiAgICAgICAgaWYoIHggPT09IHVuZGVmaW5lZCB8fCB5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciB6ID0gby56b25lO1xyXG4gICAgICAgIHZhciBteCA9IHggLSB6Lng7XHJcbiAgICAgICAgdmFyIG15ID0geSAtIHoueTtcclxuXHJcbiAgICAgICAgdmFyIG92ZXIgPSAoIG14ID49IDAgKSAmJiAoIG15ID49IDAgKSAmJiAoIG14IDw9IHoudyApICYmICggbXkgPD0gei5oICk7XHJcblxyXG4gICAgICAgIGlmKCBvdmVyICkgby5sb2NhbC5zZXQoIG14LCBteSApO1xyXG4gICAgICAgIGVsc2Ugby5sb2NhbC5uZWcoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG92ZXI7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRab25lOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIGlmKCBvLmlzQ2FudmFzT25seSApIHJldHVybjtcclxuICAgICAgICB2YXIgciA9IG8uZ2V0RG9tKCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgby56b25lID0geyB4OnIubGVmdCwgeTpyLnRvcCwgdzpyLndpZHRoLCBoOnIuaGVpZ2h0IH07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENVUlNPUlxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGN1cnNvcjogZnVuY3Rpb24gKCBuYW1lICkge1xyXG5cclxuICAgICAgICBuYW1lID0gbmFtZSA/IG5hbWUgOiAnYXV0byc7XHJcbiAgICAgICAgaWYoIG5hbWUgIT09IFIub2xkQ3Vyc29yICl7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gbmFtZTtcclxuICAgICAgICAgICAgUi5vbGRDdXJzb3IgPSBuYW1lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ0FOVkFTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdG9DYW52YXM6IGZ1bmN0aW9uICggbywgdywgaCwgZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIC8vIHByZXZlbnQgZXhlc2l2ZSByZWRyYXdcclxuXHJcbiAgICAgICAgaWYoIGZvcmNlICYmIFIudG1wVGltZSAhPT0gbnVsbCApIHsgY2xlYXJUaW1lb3V0KFIudG1wVGltZSk7IFIudG1wVGltZSA9IG51bGw7ICB9XHJcblxyXG4gICAgICAgIGlmKCBSLnRtcFRpbWUgIT09IG51bGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCBSLmxvY2sgKSBSLnRtcFRpbWUgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpeyBSLnRtcFRpbWUgPSBudWxsOyB9LCAxMCApO1xyXG5cclxuICAgICAgICAvLy9cclxuXHJcbiAgICAgICAgdmFyIGlzTmV3U2l6ZSA9IGZhbHNlO1xyXG4gICAgICAgIGlmKCB3ICE9PSBvLmNhbnZhcy53aWR0aCB8fCBoICE9PSBvLmNhbnZhcy5oZWlnaHQgKSBpc05ld1NpemUgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggUi50bXBJbWFnZSA9PT0gbnVsbCApIFIudG1wSW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuXHJcbiAgICAgICAgdmFyIGltZyA9IFIudG1wSW1hZ2U7IC8vbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIHZhciBodG1sU3RyaW5nID0gUi54bWxzZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKCBvLmNvbnRlbnQgKTtcclxuICAgICAgICBcclxuICAgICAgICB2YXIgc3ZnID0gJzxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiJyt3KydcIiBoZWlnaHQ9XCInK2grJ1wiPjxmb3JlaWduT2JqZWN0IHN0eWxlPVwicG9pbnRlci1ldmVudHM6IG5vbmU7IGxlZnQ6MDtcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+JysgaHRtbFN0cmluZyArJzwvZm9yZWlnbk9iamVjdD48L3N2Zz4nO1xyXG5cclxuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgY3R4ID0gby5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG5cclxuICAgICAgICAgICAgaWYoIGlzTmV3U2l6ZSApeyBcclxuICAgICAgICAgICAgICAgIG8uY2FudmFzLndpZHRoID0gdztcclxuICAgICAgICAgICAgICAgIG8uY2FudmFzLmhlaWdodCA9IGhcclxuICAgICAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgICAgICBjdHguY2xlYXJSZWN0KCAwLCAwLCB3LCBoICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZSggdGhpcywgMCwgMCApO1xyXG5cclxuICAgICAgICAgICAgby5vbkRyYXcoKTtcclxuXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQoc3ZnKTtcclxuICAgICAgICAvL2ltZy5zcmMgPSAnZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCwnKyB3aW5kb3cuYnRvYSggc3ZnICk7XHJcbiAgICAgICAgaW1nLmNyb3NzT3JpZ2luID0gJyc7XHJcblxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNldEhpZGRlbjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggUi5oaWRkZW5JbXB1dCA9PT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgdmFyIGhpZGUgPSBSLmRlYnVnSW5wdXQgPyAnJyA6ICdvcGFjaXR5OjA7IHpJbmRleDowOyc7XHJcblxyXG4gICAgICAgICAgICB2YXIgY3NzID0gUi5wYXJlbnQuY3NzLnR4dCArICdwYWRkaW5nOjA7IHdpZHRoOmF1dG87IGhlaWdodDphdXRvOyB0ZXh0LXNoYWRvdzpub25lOydcclxuICAgICAgICAgICAgY3NzICs9ICdsZWZ0OjEwcHg7IHRvcDphdXRvOyBib3JkZXI6bm9uZTsgY29sb3I6I0ZGRjsgYmFja2dyb3VuZDojMDAwOycgKyBoaWRlO1xyXG5cclxuICAgICAgICAgICAgUi5oaWRkZW5JbXB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XHJcbiAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQudHlwZSA9ICd0ZXh0JztcclxuICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5zdHlsZS5jc3NUZXh0ID0gY3NzICsgJ2JvdHRvbTozMHB4OycgKyAoUi5kZWJ1Z0lucHV0ID8gJycgOiAndHJhbnNmb3JtOnNjYWxlKDApOycpOztcclxuXHJcbiAgICAgICAgICAgIFIuaGlkZGVuU2l6ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgUi5oaWRkZW5TaXplci5zdHlsZS5jc3NUZXh0ID0gY3NzICsgJ2JvdHRvbTo2MHB4Oyc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBSLmhpZGRlbkltcHV0ICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIFIuaGlkZGVuU2l6ZXIgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSLmhpZGRlbkltcHV0LnN0eWxlLndpZHRoID0gUi5pbnB1dC5jbGllbnRXaWR0aCArICdweCc7XHJcbiAgICAgICAgUi5oaWRkZW5JbXB1dC52YWx1ZSA9IFIuc3RyO1xyXG4gICAgICAgIFIuaGlkZGVuU2l6ZXIuaW5uZXJIVE1MID0gUi5zdHI7XHJcblxyXG4gICAgICAgIFIuaGFzRm9jdXMgPSB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJIaWRkZW46IGZ1bmN0aW9uICggcCApIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaGlkZGVuSW1wdXQgPT09IG51bGwgKSByZXR1cm47XHJcbiAgICAgICAgUi5oYXNGb2N1cyA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xpY2tQb3M6IGZ1bmN0aW9uKCB4ICl7XHJcblxyXG4gICAgICAgIHZhciBpID0gUi5zdHIubGVuZ3RoLCBsID0gMCwgbiA9IDA7XHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBsICs9IFIudGV4dFdpZHRoKCBSLnN0cltuXSApO1xyXG4gICAgICAgICAgICBpZiggbCA+PSB4ICkgYnJlYWs7XHJcbiAgICAgICAgICAgIG4rKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG47XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cElucHV0OiBmdW5jdGlvbiAoIHgsIGRvd24gKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudCA9PT0gbnVsbCApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIHVwID0gZmFsc2U7XHJcbiAgICAgXHJcbiAgICAgICAgaWYoIGRvd24gKXtcclxuXHJcbiAgICAgICAgICAgIHZhciBpZCA9IFIuY2xpY2tQb3MoIHggKTtcclxuXHJcbiAgICAgICAgICAgIFIubW92ZVggPSBpZDtcclxuXHJcbiAgICAgICAgICAgIGlmKCBSLnN0YXJ0WCA9PT0gLTEgKXsgXHJcblxyXG4gICAgICAgICAgICAgICAgUi5zdGFydFggPSBpZDtcclxuICAgICAgICAgICAgICAgIFIuY3Vyc29ySWQgPSBpZDtcclxuICAgICAgICAgICAgICAgIFIuaW5wdXRSYW5nZSA9IFsgUi5zdGFydFgsIFIuc3RhcnRYIF07XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHZhciBpc1NlbGVjdGlvbiA9IFIubW92ZVggIT09IFIuc3RhcnRYO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBpc1NlbGVjdGlvbiApe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCBSLnN0YXJ0WCA+IFIubW92ZVggKSBSLmlucHV0UmFuZ2UgPSBbIFIubW92ZVgsIFIuc3RhcnRYIF07XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBSLmlucHV0UmFuZ2UgPSBbIFIuc3RhcnRYLCBSLm1vdmVYIF07ICAgIFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1cCA9IHRydWU7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICBpZiggUi5zdGFydFggIT09IC0xICl7XHJcblxyXG4gICAgICAgICAgICAgICAgUi5oYXNGb2N1cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0ID0gUi5pbnB1dFJhbmdlWzBdO1xyXG4gICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25FbmQgPSBSLmlucHV0UmFuZ2VbMV07XHJcbiAgICAgICAgICAgICAgICBSLnN0YXJ0WCA9IC0xO1xyXG5cclxuICAgICAgICAgICAgICAgIHVwID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdXAgKSBSLnNlbGVjdFBhcmVudCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdXA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZWxlY3RQYXJlbnQ6IGZ1bmN0aW9uICgpe1xyXG5cclxuICAgICAgICB2YXIgYyA9IFIudGV4dFdpZHRoKCBSLnN0ci5zdWJzdHJpbmcoIDAsIFIuY3Vyc29ySWQgKSk7XHJcbiAgICAgICAgdmFyIGUgPSBSLnRleHRXaWR0aCggUi5zdHIuc3Vic3RyaW5nKCAwLCBSLmlucHV0UmFuZ2VbMF0gKSk7XHJcbiAgICAgICAgdmFyIHMgPSBSLnRleHRXaWR0aCggUi5zdHIuc3Vic3RyaW5nKCBSLmlucHV0UmFuZ2VbMF0sICBSLmlucHV0UmFuZ2VbMV0gKSk7XHJcblxyXG4gICAgICAgIFIucGFyZW50LnNlbGVjdCggYywgZSwgcyApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdGV4dFdpZHRoOiBmdW5jdGlvbiAoIHRleHQgKXtcclxuXHJcbiAgICAgICAgaWYoIFIuaGlkZGVuU2l6ZXIgPT09IG51bGwgKSByZXR1cm4gMDtcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKC8gL2csICcmbmJzcDsnKTtcclxuICAgICAgICBSLmhpZGRlblNpemVyLmlubmVySFRNTCA9IHRleHQ7XHJcbiAgICAgICAgcmV0dXJuIFIuaGlkZGVuU2l6ZXIuY2xpZW50V2lkdGg7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgY2xlYXJJbnB1dDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQgPT09IG51bGwgKSByZXR1cm47XHJcbiAgICAgICAgaWYoICFSLmZpcnN0SW1wdXQgKSBSLnBhcmVudC52YWxpZGF0ZSgpO1xyXG5cclxuICAgICAgICBSLmNsZWFySGlkZGVuKCk7XHJcbiAgICAgICAgUi5wYXJlbnQudW5zZWxlY3QoKTtcclxuXHJcbiAgICAgICAgLy9SLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgUi5pbnB1dC5zdHlsZS5iYWNrZ3JvdW5kID0gUi5wYXJlbnQuY29sb3JzLmlucHV0Qmc7XHJcbiAgICAgICAgUi5pbnB1dC5zdHlsZS5ib3JkZXJDb2xvciA9IFIucGFyZW50LmNvbG9ycy5pbnB1dEJvcmRlcjtcclxuICAgICAgICBSLnBhcmVudC5pc0VkaXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgUi5pbnB1dCA9IG51bGw7XHJcbiAgICAgICAgUi5wYXJlbnQgPSBudWxsO1xyXG4gICAgICAgIFIuc3RyID0gJycsXHJcbiAgICAgICAgUi5maXJzdEltcHV0ID0gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldElucHV0OiBmdW5jdGlvbiAoIElucHV0LCBwYXJlbnQgKSB7XHJcblxyXG4gICAgICAgIFIuY2xlYXJJbnB1dCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIFIuaW5wdXQgPSBJbnB1dDtcclxuICAgICAgICBSLnBhcmVudCA9IHBhcmVudDtcclxuXHJcbiAgICAgICAgUi5pbnB1dC5zdHlsZS5iYWNrZ3JvdW5kID0gUi5wYXJlbnQuY29sb3JzLmlucHV0T3ZlcjtcclxuICAgICAgICBSLmlucHV0LnN0eWxlLmJvcmRlckNvbG9yID0gUi5wYXJlbnQuY29sb3JzLmlucHV0Qm9yZGVyU2VsZWN0O1xyXG4gICAgICAgIFIuc3RyID0gUi5pbnB1dC50ZXh0Q29udGVudDtcclxuXHJcbiAgICAgICAgUi5zZXRIaWRkZW4oKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qc2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCBcInNlbGVjdGFsbFwiLCBudWxsLCBmYWxzZSApO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICBrZXlkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudCA9PT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGtleUNvZGUgPSBlLndoaWNoO1xyXG5cclxuICAgICAgICBSLmZpcnN0SW1wdXQgPSBmYWxzZTtcclxuXHJcblxyXG4gICAgICAgIGlmIChSLmhhc0ZvY3VzKSB7XHJcbiAgICAgICAgICAgIC8vIGhhY2sgdG8gZml4IHRvdWNoIGV2ZW50IGJ1ZyBpbiBpT1MgU2FmYXJpXHJcbiAgICAgICAgICAgIHdpbmRvdy5mb2N1cygpO1xyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIFIucGFyZW50LmlzRWRpdCA9IHRydWU7XHJcblxyXG4gICAgICAgLy8gZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAvLyBhZGQgc3VwcG9ydCBmb3IgQ3RybC9DbWQrQSBzZWxlY3Rpb25cclxuICAgICAgICAvL2lmICgga2V5Q29kZSA9PT0gNjUgJiYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgKSkge1xyXG4gICAgICAgICAgICAvL1Iuc2VsZWN0VGV4dCgpO1xyXG4gICAgICAgICAgICAvL2UucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgLy9yZXR1cm4gc2VsZi5yZW5kZXIoKTtcclxuICAgICAgICAvL31cclxuXHJcbiAgICAgICAgaWYoIGtleUNvZGUgPT09IDEzICl7IC8vZW50ZXJcclxuXHJcbiAgICAgICAgICAgIFIuY2xlYXJJbnB1dCgpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYoIGtleUNvZGUgPT09IDkgKXsgLy90YWIga2V5XHJcblxyXG4gICAgICAgICAgIC8vIFIuaW5wdXQudGV4dENvbnRlbnQgPSAnJztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGlmKCBSLmlucHV0LmlzTnVtICl7XHJcbiAgICAgICAgICAgICAgICBpZiAoICgoZS5rZXlDb2RlID4gOTUpICYmIChlLmtleUNvZGUgPCAxMDYpKSB8fCBlLmtleUNvZGUgPT09IDExMCB8fCBlLmtleUNvZGUgPT09IDEwOSApe1xyXG4gICAgICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQucmVhZE9ubHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5yZWFkT25seSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAga2V5dXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBSLnN0ciA9IFIuaGlkZGVuSW1wdXQudmFsdWU7XHJcbiAgICAgICAgUi5pbnB1dC50ZXh0Q29udGVudCA9IFIuc3RyO1xyXG4gICAgICAgIFIuY3Vyc29ySWQgPSBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIFIuaW5wdXRSYW5nZSA9IFsgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25TdGFydCwgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25FbmQgXTtcclxuXHJcbiAgICAgICAgUi5zZWxlY3RQYXJlbnQoKTtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50LmFsbHdheSApIFIucGFyZW50LnZhbGlkYXRlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvL1xyXG4gICAgLy8gICBMSVNURU5JTkdcclxuICAgIC8vXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbG9vcDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggUi5pc0xvb3AgKSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIFIubG9vcCApO1xyXG4gICAgICAgIFIudXBkYXRlKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIGkgPSBSLmxpc3RlbnMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgUi5saXN0ZW5zW2ldLmxpc3RlbmluZygpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlTGlzdGVuOiBmdW5jdGlvbiAoIHByb3RvICkge1xyXG5cclxuICAgICAgICB2YXIgaWQgPSBSLmxpc3RlbnMuaW5kZXhPZiggcHJvdG8gKTtcclxuICAgICAgICBpZiggaWQgIT09IC0xICkgUi5saXN0ZW5zLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgaWYoIFIubGlzdGVucy5sZW5ndGggPT09IDAgKSBSLmlzTG9vcCA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkTGlzdGVuOiBmdW5jdGlvbiAoIHByb3RvICkge1xyXG5cclxuICAgICAgICB2YXIgaWQgPSBSLmxpc3RlbnMuaW5kZXhPZiggcHJvdG8gKTtcclxuXHJcbiAgICAgICAgaWYoIGlkICE9PSAtMSApIHJldHVybjsgXHJcblxyXG4gICAgICAgIFIubGlzdGVucy5wdXNoKCBwcm90byApO1xyXG5cclxuICAgICAgICBpZiggIVIuaXNMb29wICl7XHJcbiAgICAgICAgICAgIFIuaXNMb29wID0gdHJ1ZTtcclxuICAgICAgICAgICAgUi5sb29wKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG59XHJcblxyXG52YXIgUm9vdHMgPSBSO1xyXG5leHBvcnQgeyBSb290cyB9OyIsIlxyXG4vLyBtaW5pbWFsIHZlY3RvciAyXHJcblxyXG5mdW5jdGlvbiBWMiAoIHgsIHkgKXtcclxuXHJcblx0dGhpcy54ID0geCB8fCAwO1xyXG5cdHRoaXMueSA9IHkgfHwgMDtcclxuXHJcbn1cclxuXHJcbk9iamVjdC5hc3NpZ24oIFYyLnByb3RvdHlwZSwge1xyXG5cclxuXHRzZXQ6IGZ1bmN0aW9uICggeCwgeSApIHtcclxuXHJcblx0XHR0aGlzLnggPSB4O1xyXG5cdFx0dGhpcy55ID0geTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblx0ZGl2aWRlOiBmdW5jdGlvbiAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54IC89IHYueDtcclxuXHRcdHRoaXMueSAvPSB2Lnk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH0sXHJcblxyXG5cdG11bHRpcGx5OiBmdW5jdGlvbiAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54ICo9IHYueDtcclxuXHRcdHRoaXMueSAqPSB2Lnk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH0sXHJcblxyXG5cdG11bHRpcGx5U2NhbGFyOiBmdW5jdGlvbiAoIHNjYWxhciApIHtcclxuXHJcblx0XHR0aGlzLnggKj0gc2NhbGFyO1xyXG5cdFx0dGhpcy55ICo9IHNjYWxhcjtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblx0ZGl2aWRlU2NhbGFyOiBmdW5jdGlvbiAoIHNjYWxhciApIHtcclxuXHJcblx0XHRyZXR1cm4gdGhpcy5tdWx0aXBseVNjYWxhciggMSAvIHNjYWxhciApO1xyXG5cclxuXHR9LFxyXG5cclxuXHRsZW5ndGg6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRyZXR1cm4gTWF0aC5zcXJ0KCB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKTtcclxuXHJcblx0fSxcclxuXHJcblx0YW5nbGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHQvLyBjb21wdXRlcyB0aGUgYW5nbGUgaW4gcmFkaWFucyB3aXRoIHJlc3BlY3QgdG8gdGhlIHBvc2l0aXZlIHgtYXhpc1xyXG5cclxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoIHRoaXMueSwgdGhpcy54ICk7XHJcblxyXG5cdFx0aWYgKCBhbmdsZSA8IDAgKSBhbmdsZSArPSAyICogTWF0aC5QSTtcclxuXHJcblx0XHRyZXR1cm4gYW5nbGU7XHJcblxyXG5cdH0sXHJcblxyXG5cdGFkZFNjYWxhcjogZnVuY3Rpb24gKCBzICkge1xyXG5cclxuXHRcdHRoaXMueCArPSBzO1xyXG5cdFx0dGhpcy55ICs9IHM7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH0sXHJcblxyXG5cdG5lZ2F0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHRcdHRoaXMueCAqPSAtMTtcclxuXHRcdHRoaXMueSAqPSAtMTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblx0bmVnOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0dGhpcy54ID0gLTE7XHJcblx0XHR0aGlzLnkgPSAtMTtcclxuXHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblx0aXNaZXJvOiBmdW5jdGlvbiAoKSB7XHJcblxyXG5cdFx0cmV0dXJuICggdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMCApO1xyXG5cclxuXHR9LFxyXG5cclxuXHRjb3B5OiBmdW5jdGlvbiAoIHYgKSB7XHJcblxyXG5cdFx0dGhpcy54ID0gdi54O1xyXG5cdFx0dGhpcy55ID0gdi55O1xyXG5cclxuXHRcdHJldHVybiB0aGlzO1xyXG5cclxuXHR9LFxyXG5cclxuXHRlcXVhbHM6IGZ1bmN0aW9uICggdiApIHtcclxuXHJcblx0XHRyZXR1cm4gKCAoIHYueCA9PT0gdGhpcy54ICkgJiYgKCB2LnkgPT09IHRoaXMueSApICk7XHJcblxyXG5cdH0sXHJcblxyXG5cdG5lYXJFcXVhbHM6IGZ1bmN0aW9uICggdiwgbiApIHtcclxuXHJcblx0XHRyZXR1cm4gKCAoIHYueC50b0ZpeGVkKG4pID09PSB0aGlzLngudG9GaXhlZChuKSApICYmICggdi55LnRvRml4ZWQobikgPT09IHRoaXMueS50b0ZpeGVkKG4pICkgKTtcclxuXHJcblx0fSxcclxuXHJcblx0bGVycDogZnVuY3Rpb24gKCB2LCBhbHBoYSApIHtcclxuXHJcblx0XHRpZih2PT09bnVsbCl7XHJcblx0XHRcdHRoaXMueCAtPSB0aGlzLnggKiBhbHBoYTtcclxuXHRcdCAgICB0aGlzLnkgLT0gdGhpcy55ICogYWxwaGE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnggKz0gKCB2LnggLSB0aGlzLnggKSAqIGFscGhhO1xyXG5cdFx0ICAgIHRoaXMueSArPSAoIHYueSAtIHRoaXMueSApICogYWxwaGE7XHJcblx0XHR9XHJcblxyXG5cdFx0XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH0sXHJcblxyXG5cclxuXHJcbn0gKTtcclxuXHJcblxyXG5leHBvcnQgeyBWMiB9OyIsIlxyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4vUm9vdHMnO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4vVG9vbHMnO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4vVjInO1xyXG5cclxuLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gUHJvdG8gKCBvICkge1xyXG5cclxuICAgIG8gPSBvIHx8IHt9O1xyXG5cclxuXHJcbiAgICAvLyBpZiBpcyBvbiBndWkgb3IgZ3JvdXBcclxuICAgIHRoaXMubWFpbiA9IG8ubWFpbiB8fCBudWxsO1xyXG4gICAgdGhpcy5pc1VJID0gby5pc1VJIHx8IGZhbHNlO1xyXG4gICAgdGhpcy5wYXJlbnRHcm91cCA9IG51bGw7XHJcblxyXG4gICAgdGhpcy5jc3MgPSB0aGlzLm1haW4gPyB0aGlzLm1haW4uY3NzIDogVG9vbHMuY3NzO1xyXG4gICAgdGhpcy5jb2xvcnMgPSB0aGlzLm1haW4gPyB0aGlzLm1haW4uY29sb3JzIDogVG9vbHMuY29sb3JzO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdEJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9yZGVyO1xyXG4gICAgdGhpcy5zdmdzID0gVG9vbHMuc3ZncztcclxuXHJcbiAgICAvLyBvbmx5IHNwYWNlIFxyXG4gICAgdGhpcy5pc0VtcHR5ID0gby5pc0VtcHR5IHx8IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuem9uZSA9IHsgeDowLCB5OjAsIHc6MCwgaDowIH07XHJcbiAgICB0aGlzLmxvY2FsID0gbmV3IFYyKCkubmVnKCk7XHJcblxyXG4gICAgdGhpcy5pc0NhbnZhc09ubHkgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmlzU2VsZWN0ID0gZmFsc2U7XHJcblxyXG4gICAgLy8gcGVyY2VudCBvZiB0aXRsZVxyXG4gICAgdGhpcy5wID0gby5wICE9PSB1bmRlZmluZWQgPyBvLnAgOiBUb29scy5zaXplLnA7XHJcblxyXG4gICAgdGhpcy53ID0gdGhpcy5pc1VJID8gdGhpcy5tYWluLnNpemUudyA6IFRvb2xzLnNpemUudztcclxuICAgIGlmKCBvLncgIT09IHVuZGVmaW5lZCApIHRoaXMudyA9IG8udztcclxuXHJcbiAgICB0aGlzLmggPSB0aGlzLmlzVUkgPyB0aGlzLm1haW4uc2l6ZS5oIDogVG9vbHMuc2l6ZS5oO1xyXG4gICAgaWYoIG8uaCAhPT0gdW5kZWZpbmVkICkgdGhpcy5oID0gby5oO1xyXG4gICAgaWYoIXRoaXMuaXNFbXB0eSkgdGhpcy5oID0gdGhpcy5oIDwgMTEgPyAxMSA6IHRoaXMuaDtcclxuXHJcbiAgICAvLyBpZiBuZWVkIHJlc2l6ZSB3aWR0aFxyXG4gICAgdGhpcy5hdXRvV2lkdGggPSBvLmF1dG8gfHwgdHJ1ZTtcclxuXHJcbiAgICAvLyBvcGVuIHN0YXR1XHJcbiAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgIC8vIHJhZGl1cyBmb3IgdG9vbGJveFxyXG4gICAgdGhpcy5yYWRpdXMgPSBvLnJhZGl1cyB8fCAwO1xyXG5cclxuICAgIC8vIG9ubHkgZm9yIG51bWJlclxyXG4gICAgdGhpcy5pc051bWJlciA9IGZhbHNlO1xyXG5cclxuICAgIC8vIG9ubHkgbW9zdCBzaW1wbGUgXHJcbiAgICB0aGlzLm1vbm8gPSBmYWxzZTtcclxuXHJcbiAgICAvLyBzdG9wIGxpc3RlbmluZyBmb3IgZWRpdCBzbGlkZSB0ZXh0XHJcbiAgICB0aGlzLmlzRWRpdCA9IGZhbHNlO1xyXG5cclxuICAgIC8vIG5vIHRpdGxlIFxyXG4gICAgdGhpcy5zaW1wbGUgPSBvLnNpbXBsZSB8fCBmYWxzZTtcclxuICAgIGlmKCB0aGlzLnNpbXBsZSApIHRoaXMuc2EgPSAwO1xyXG5cclxuICAgIFxyXG5cclxuICAgIC8vIGRlZmluZSBvYmogc2l6ZVxyXG4gICAgdGhpcy5zZXRTaXplKCB0aGlzLncgKTtcclxuXHJcbiAgICAvLyB0aXRsZSBzaXplXHJcbiAgICBpZihvLnNhICE9PSB1bmRlZmluZWQgKSB0aGlzLnNhID0gby5zYTtcclxuICAgIGlmKG8uc2IgIT09IHVuZGVmaW5lZCApIHRoaXMuc2IgPSBvLnNiO1xyXG5cclxuICAgIGlmKCB0aGlzLnNpbXBsZSApIHRoaXMuc2IgPSB0aGlzLncgLSB0aGlzLnNhO1xyXG5cclxuICAgIC8vIGxhc3QgbnVtYmVyIHNpemUgZm9yIHNsaWRlXHJcbiAgICB0aGlzLnNjID0gby5zYyA9PT0gdW5kZWZpbmVkID8gNDcgOiBvLnNjO1xyXG5cclxuICAgIC8vIGZvciBsaXN0ZW5pbmcgb2JqZWN0XHJcbiAgICB0aGlzLm9iamVjdExpbmsgPSBudWxsO1xyXG4gICAgdGhpcy5pc1NlbmQgPSBmYWxzZTtcclxuICAgIHRoaXMudmFsID0gbnVsbDtcclxuICAgIFxyXG4gICAgLy8gQmFja2dyb3VuZFxyXG4gICAgdGhpcy5iZyA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7Ly90aGlzLmlzVUkgPyB0aGlzLm1haW4uYmcgOiBUb29scy5jb2xvcnMuYmFja2dyb3VuZDtcclxuICAgIHRoaXMuYmdPdmVyID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXI7XHJcbiAgICBpZiggby5iZyAhPT0gdW5kZWZpbmVkICl7IHRoaXMuYmcgPSBvLmJnOyB0aGlzLmJnT3ZlciA9IG8uYmc7IH1cclxuICAgIGlmKCBvLmJnT3ZlciAhPT0gdW5kZWZpbmVkICl7IHRoaXMuYmdPdmVyID0gby5iZ092ZXI7IH1cclxuXHJcbiAgICAvLyBGb250IENvbG9yO1xyXG4gICAgdGhpcy50aXRsZUNvbG9yID0gby50aXRsZUNvbG9yIHx8IHRoaXMuY29sb3JzLnRleHQ7XHJcbiAgICB0aGlzLmZvbnRDb2xvciA9IG8uZm9udENvbG9yIHx8IHRoaXMuY29sb3JzLnRleHQ7XHJcblxyXG4gICAgaWYoIG8uY29sb3IgIT09IHVuZGVmaW5lZCApeyBcclxuXHJcbiAgICAgICAgaWYoby5jb2xvciA9PT0gJ24nKSBvLmNvbG9yID0gJyNmZjAwMDAnO1xyXG5cclxuICAgICAgICBpZiggby5jb2xvciAhPT0gJ25vJyApIHtcclxuICAgICAgICAgICAgaWYoICFpc05hTihvLmNvbG9yKSApIHRoaXMuZm9udENvbG9yID0gVG9vbHMuaGV4VG9IdG1sKG8uY29sb3IpO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMuZm9udENvbG9yID0gby5jb2xvcjtcclxuICAgICAgICAgICAgdGhpcy50aXRsZUNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKmlmKCBvLmNvbG9yICE9PSB1bmRlZmluZWQgKXsgXHJcbiAgICAgICAgaWYoICFpc05hTihvLmNvbG9yKSApIHRoaXMuZm9udENvbG9yID0gVG9vbHMuaGV4VG9IdG1sKG8uY29sb3IpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5mb250Q29sb3IgPSBvLmNvbG9yO1xyXG4gICAgICAgIHRoaXMudGl0bGVDb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgfSovXHJcblxyXG4gICAgdGhpcy5jb2xvclBsdXMgPSBUb29scy5Db2xvckx1bWEoIHRoaXMuZm9udENvbG9yLCAwLjMgKTtcclxuXHJcbiAgICB0aGlzLnR4dCA9IG8ubmFtZSB8fCAnUHJvdG8nO1xyXG4gICAgdGhpcy5yZW5hbWUgPSBvLnJlbmFtZSB8fCAnJztcclxuICAgIHRoaXMudGFyZ2V0ID0gby50YXJnZXQgfHwgbnVsbDtcclxuXHJcbiAgICB0aGlzLmNhbGxiYWNrID0gby5jYWxsYmFjayA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG8uY2FsbGJhY2s7XHJcbiAgICB0aGlzLmVuZENhbGxiYWNrID0gbnVsbDtcclxuXHJcbiAgICBpZiggdGhpcy5jYWxsYmFjayA9PT0gbnVsbCAmJiB0aGlzLmlzVUkgJiYgdGhpcy5tYWluLmNhbGxiYWNrICE9PSBudWxsICkgdGhpcy5jYWxsYmFjayA9IHRoaXMubWFpbi5jYWxsYmFjaztcclxuXHJcbiAgICAvLyBlbGVtZW50c1xyXG4gICAgdGhpcy5jID0gW107XHJcblxyXG4gICAgLy8gc3R5bGUgXHJcbiAgICB0aGlzLnMgPSBbXTtcclxuXHJcblxyXG4gICAgdGhpcy5jWzBdID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246cmVsYXRpdmU7IGhlaWdodDoyMHB4OyBmbG9hdDpsZWZ0OyBvdmVyZmxvdzpoaWRkZW47Jyk7XHJcbiAgICB0aGlzLnNbMF0gPSB0aGlzLmNbMF0uc3R5bGU7XHJcblxyXG4gICAgaWYoIHRoaXMuaXNVSSApIHRoaXMuc1swXS5tYXJnaW5Cb3R0b20gPSAnMXB4JztcclxuICAgIFxyXG4gICAgLy8gd2l0aCB0aXRsZVxyXG4gICAgaWYoICF0aGlzLnNpbXBsZSApeyBcclxuICAgICAgICB0aGlzLmNbMV0gPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKTtcclxuICAgICAgICB0aGlzLnNbMV0gPSB0aGlzLmNbMV0uc3R5bGU7XHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy5yZW5hbWUgPT09ICcnID8gdGhpcy50eHQgOiB0aGlzLnJlbmFtZTtcclxuICAgICAgICB0aGlzLnNbMV0uY29sb3IgPSB0aGlzLnRpdGxlQ29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgaWYoIG8ucG9zICl7XHJcbiAgICAgICAgdGhpcy5zWzBdLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcclxuICAgICAgICBmb3IodmFyIHAgaW4gby5wb3Mpe1xyXG4gICAgICAgICAgICB0aGlzLnNbMF1bcF0gPSBvLnBvc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tb25vID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiggby5jc3MgKSB0aGlzLnNbMF0uY3NzVGV4dCA9IG8uY3NzOyBcclxuICAgIFxyXG5cclxufVxyXG5cclxuT2JqZWN0LmFzc2lnbiggUHJvdG8ucHJvdG90eXBlLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFByb3RvLFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIG1ha2UgZGUgbm9kZVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgXHJcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7IC8vIHN0eWxlIGNhY2hlXHJcbiAgICAgICAgdmFyIGMgPSB0aGlzLmM7IC8vIGRpdiBjYWNoXHJcblxyXG4gICAgICAgIHNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSAgKSBzWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzRW1wdHkgICkgc1swXS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAvL2lmKCB0aGlzLmF1dG9IZWlnaHQgKSBzWzBdLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDAuMDFzIGVhc2Utb3V0JztcclxuICAgICAgICBpZiggY1sxXSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuYXV0b1dpZHRoICl7XHJcbiAgICAgICAgICAgIHNbMV0gPSBjWzFdLnN0eWxlO1xyXG4gICAgICAgICAgICBzWzFdLmhlaWdodCA9ICh0aGlzLmgtNCkgKyAncHgnO1xyXG4gICAgICAgICAgICBzWzFdLmxpbmVIZWlnaHQgPSAodGhpcy5oLTgpICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBmcmFnID0gVG9vbHMuZnJhZztcclxuXHJcbiAgICAgICAgZm9yKCB2YXIgaSA9IDEsIGxuZyA9IGMubGVuZ3RoOyBpICE9PSBsbmc7IGkrKyApe1xyXG4gICAgICAgICAgICBpZiggY1tpXSAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCggY1tpXSApO1xyXG4gICAgICAgICAgICAgICAgc1tpXSA9IGNbaV0uc3R5bGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnRhcmdldCAhPT0gbnVsbCApeyBcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuYXBwZW5kQ2hpbGQoIGNbMF0gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmlubmVyLmFwcGVuZENoaWxkKCBjWzBdICk7XHJcbiAgICAgICAgICAgIGVsc2UgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggY1swXSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY1swXS5hcHBlbmRDaGlsZCggZnJhZyApO1xyXG5cclxuICAgICAgICB0aGlzLnJTaXplKCk7XHJcblxyXG4gICAgICAgIC8vICEgc29sbyBwcm90b1xyXG4gICAgICAgIGlmKCAhdGhpcy5pc1VJICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMF0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuICAgICAgICAgICAgUm9vdHMuYWRkKCB0aGlzICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIFRSQU5TIEZVTkNUSU9OUyBmcm9tIFRvb2xzXHJcblxyXG4gICAgZG9tOiBmdW5jdGlvbiAoIHR5cGUsIGNzcywgb2JqLCBkb20sIGlkICkge1xyXG5cclxuICAgICAgICByZXR1cm4gVG9vbHMuZG9tKCB0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0U3ZnOiBmdW5jdGlvbiAoIGRvbSwgdHlwZSwgdmFsdWUsIGlkICkge1xyXG5cclxuICAgICAgICBUb29scy5zZXRTdmcoIGRvbSwgdHlwZSwgdmFsdWUsIGlkICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDc3M6IGZ1bmN0aW9uICggZG9tLCBjc3MgKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLnNldENzcyggZG9tLCBjc3MgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsYW1wOiBmdW5jdGlvbiAoIHZhbHVlLCBtaW4sIG1heCApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmNsYW1wKCB2YWx1ZSwgbWluLCBtYXggKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGdldENvbG9yUmluZzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIVRvb2xzLmNvbG9yUmluZyApIFRvb2xzLm1ha2VDb2xvclJpbmcoKTtcclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xvbmUoIFRvb2xzLmNvbG9yUmluZyApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Sm95c3RpY2s6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHNbICdqb3lzdGlja18nKyBtb2RlbCBdICkgVG9vbHMubWFrZUpveXN0aWNrKCBtb2RlbCApO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHNbICdqb3lzdGlja18nKyBtb2RlbCBdICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRDaXJjdWxhcjogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgaWYoICFUb29scy5jaXJjdWxhciApIFRvb2xzLm1ha2VDaXJjdWxhciggbW9kZWwgKTtcclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xvbmUoIFRvb2xzLmNpcmN1bGFyICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXRLbm9iOiBmdW5jdGlvbiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICBpZiggIVRvb2xzLmtub2IgKSBUb29scy5tYWtlS25vYiggbW9kZWwgKTtcclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xvbmUoIFRvb2xzLmtub2IgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qZ2V0R3JhcGg6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgIGlmKCAhVG9vbHMuZ3JhcGggKSBUb29scy5tYWtlR3JhcGgoKTtcclxuICAgICAgICAgcmV0dXJuIFRvb2xzLmNsb25lKCBUb29scy5ncmFwaCApO1xyXG5cclxuICAgIH0sKi9cclxuXHJcbiAgICAvLyBUUkFOUyBGVU5DVElPTlMgZnJvbSBSb290c1xyXG5cclxuICAgIGN1cnNvcjogZnVuY3Rpb24gKCBuYW1lICkge1xyXG5cclxuICAgICAgICAgUm9vdHMuY3Vyc29yKCBuYW1lICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBcclxuXHJcbiAgICAvLy8vLy8vLy9cclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHt9LFxyXG5cclxuICAgIHJlc2V0OiAgZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgLy8vLy8vLy8vXHJcblxyXG4gICAgZ2V0RG9tOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmNbMF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1aW91dDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0VtcHR5ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1aW92ZXI6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnT3ZlcjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmFtZTogZnVuY3Rpb24gKCBzICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQpIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBsaXN0ZW46IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUm9vdHMuYWRkTGlzdGVuKCB0aGlzICk7XHJcbiAgICAgICAgLy9Sb290cy5saXN0ZW5zLnB1c2goIHRoaXMgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGxpc3RlbmluZzogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VuZCApIHJldHVybjtcclxuICAgICAgICBpZiggdGhpcy5pc0VkaXQgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uICggdiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNOdW1iZXIgKSB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdiApO1xyXG4gICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IHY7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyB1cGRhdGUgZXZlcnkgY2hhbmdlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uICggZiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGY7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyB1cGRhdGUgb25seSBvbiBlbmRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvbkZpbmlzaENoYW5nZTogZnVuY3Rpb24gKCBmICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0VtcHR5ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVuZENhbGxiYWNrID0gZjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNlbmQ6IGZ1bmN0aW9uICggdiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSB0cnVlO1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdExpbmsgIT09IG51bGwgKSB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gPSB2IHx8IHRoaXMudmFsdWU7XHJcbiAgICAgICAgaWYoIHRoaXMuY2FsbGJhY2sgKSB0aGlzLmNhbGxiYWNrKCB2IHx8IHRoaXMudmFsdWUgKTtcclxuICAgICAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2VuZEVuZDogZnVuY3Rpb24gKCB2ICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5lbmRDYWxsYmFjayApIHRoaXMuZW5kQ2FsbGJhY2soIHYgfHwgdGhpcy52YWx1ZSApO1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdExpbmsgIT09IG51bGwgKSB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gPSB2IHx8IHRoaXMudmFsdWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjbGVhciBub2RlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBcclxuICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLmNsZWFyKCB0aGlzLmNbMF0gKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZW1vdmVDaGlsZCggdGhpcy5jWzBdICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jbGVhck9uZSggdGhpcyApO1xyXG4gICAgICAgICAgICBlbHNlIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoIHRoaXMuY1swXSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzVUkgKSBSb290cy5yZW1vdmUoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jID0gbnVsbDtcclxuICAgICAgICB0aGlzLnMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGNoYW5nZSBzaXplIFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNldFNpemU6IGZ1bmN0aW9uICggc3ggKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5hdXRvV2lkdGggKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMudyA9IHN4O1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zaW1wbGUgKXtcclxuICAgICAgICAgICAgdGhpcy5zYiA9IHRoaXMudyAtIHRoaXMuc2E7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdmFyIHBwID0gdGhpcy53ICogKCB0aGlzLnAgLyAxMDAgKTtcclxuICAgICAgICAgICAgdGhpcy5zYSA9IE1hdGguZmxvb3IoIHBwICsgMTAgKTtcclxuICAgICAgICAgICAgdGhpcy5zYiA9IE1hdGguZmxvb3IoIHRoaXMudyAtIHBwIC0gMjAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByU2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuYXV0b1dpZHRoICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuc1swXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcbiAgICAgICAgaWYoICF0aGlzLnNpbXBsZSApIHRoaXMuc1sxXS53aWR0aCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGZvciBudW1lcmljIHZhbHVlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0VHlwZU51bWJlcjogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzTnVtYmVyID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XHJcbiAgICAgICAgaWYoby52YWx1ZSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgaWYoIHR5cGVvZiBvLnZhbHVlID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWUgPSBvLnZhbHVlICogMTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gby52YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWluID0gby5taW4gPT09IHVuZGVmaW5lZCA/IC1JbmZpbml0eSA6IG8ubWluO1xyXG4gICAgICAgIHRoaXMubWF4ID0gby5tYXggPT09IHVuZGVmaW5lZCA/ICBJbmZpbml0eSA6IG8ubWF4O1xyXG4gICAgICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gPT09IHVuZGVmaW5lZCA/IDIgOiBvLnByZWNpc2lvbjtcclxuXHJcbiAgICAgICAgdmFyIHM7XHJcblxyXG4gICAgICAgIHN3aXRjaCh0aGlzLnByZWNpc2lvbil7XHJcbiAgICAgICAgICAgIGNhc2UgMDogcyA9IDE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IHMgPSAwLjE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IHMgPSAwLjAxOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOiBzID0gMC4wMDE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6IHMgPSAwLjAwMDE7IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zdGVwID0gby5zdGVwID09PSB1bmRlZmluZWQgPyAgcyA6IG8uc3RlcDtcclxuICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXggLSB0aGlzLm1pbjtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy52YWx1ZSApO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBudW1WYWx1ZTogZnVuY3Rpb24gKCBuICkge1xyXG5cclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oIHRoaXMubWF4LCBNYXRoLm1heCggdGhpcy5taW4sIG4gKSApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTIERFRkFVTFRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBoYW5kbGVFdmVudDogZnVuY3Rpb24gKCBlICl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRW1wdHkgKSByZXR1cm47XHJcbiAgICAgICAgcmV0dXJuIHRoaXNbZS50eXBlXShlKTtcclxuICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICB3aGVlbDogZnVuY3Rpb24gKCBlICkgeyByZXR1cm4gZmFsc2U7IH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiggZSApIHsgcmV0dXJuIGZhbHNlOyB9LFxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24oIGUgKSB7IHJldHVybiBmYWxzZTsgfSxcclxuXHJcbiAgICBtb3VzZXVwOiBmdW5jdGlvbiggZSApIHsgcmV0dXJuIGZhbHNlOyB9LFxyXG5cclxuICAgIGtleWRvd246IGZ1bmN0aW9uKCBlICkgeyByZXR1cm4gZmFsc2U7IH0sXHJcblxyXG4gICAga2V5dXA6IGZ1bmN0aW9uKCBlICkgeyByZXR1cm4gZmFsc2U7IH0sXHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIG9iamVjdCByZWZlcmVuY3lcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRSZWZlcmVuY3k6IGZ1bmN0aW9uICggb2JqLCB2YWwgKSB7XHJcblxyXG4gICAgICAgIHRoaXMub2JqZWN0TGluayA9IG9iajtcclxuICAgICAgICB0aGlzLnZhbCA9IHZhbDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGRpc3BsYXk6IGZ1bmN0aW9uICggdiApIHtcclxuICAgICAgICBcclxuICAgICAgICB2ID0gdiB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLnNbMF0uZGlzcGxheSA9IHYgPyAnYmxvY2snIDogJ25vbmUnO1xyXG4gICAgICAgIC8vdGhpcy5pc1JlYWR5ID0gdiA/IGZhbHNlIDogdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHJlc2l6ZSBoZWlnaHQgXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5pc09wZW4gPSB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHJldHVybjtcclxuICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbmVlZFpvbmU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICB1bnNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0SW5wdXQ6IGZ1bmN0aW9uICggSW5wdXQgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgUm9vdHMuc2V0SW5wdXQoIElucHV0LCB0aGlzICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cElucHV0OiBmdW5jdGlvbiAoIHgsIGRvd24gKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBSb290cy51cElucHV0KCB4LCBkb3duICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBzcGVjaWFsIGl0ZW0gXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2VsZWN0ZWQ6IGZ1bmN0aW9uICggYiApe1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VsZWN0ID0gYiB8fCBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgUHJvdG8gfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZnVuY3Rpb24gQm9vbCAoIG8gKXtcclxuXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcbiAgICBcclxuICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgdGhpcy5pbmggPSBvLmluaCB8fCB0aGlzLmg7XHJcblxyXG4gICAgdmFyIHQgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLSgodGhpcy5pbmgtMikqMC41KTtcclxuXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2JhY2tncm91bmQ6JysgdGhpcy5jb2xvcnMuYm9vbGJnICsnOyBoZWlnaHQ6JysodGhpcy5pbmgtMikrJ3B4OyB3aWR0aDozNnB4OyB0b3A6Jyt0KydweDsgYm9yZGVyLXJhZGl1czoxMHB4OyBib3JkZXI6MnB4IHNvbGlkICcrdGhpcy5ib29sYmcgKTtcclxuICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnaGVpZ2h0OicrKHRoaXMuaW5oLTYpKydweDsgd2lkdGg6MTZweDsgdG9wOicrKHQrMikrJ3B4OyBib3JkZXItcmFkaXVzOjEwcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7JyApO1xyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbn1cclxuXHJcbkJvb2wucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogQm9vbCxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnZhbHVlICl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzWzJdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5ib29sb247XHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5ib29sb247XHJcbiAgICAgICAgICAgIHNbM10ubWFyZ2luTGVmdCA9ICcxN3B4JztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHNbMl0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJvb2xiZztcclxuICAgICAgICAgICAgc1syXS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmJvb2xiZztcclxuICAgICAgICAgICAgc1szXS5tYXJnaW5MZWZ0ID0gJzJweCc7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gdGhpcy5zYSsxKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IEJvb2wgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZnVuY3Rpb24gQnV0dG9uICggbyApIHtcclxuXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG4gICAgdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudmFsdWVzID0gby52YWx1ZSB8fCB0aGlzLnR4dDtcclxuXHJcbiAgICBpZih0eXBlb2YgdGhpcy52YWx1ZXMgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZXMgPSBbdGhpcy52YWx1ZXNdO1xyXG5cclxuICAgIC8vdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgdGhpcy5pc0xvYWRCdXR0b24gPSBvLmxvYWRlciB8fCBmYWxzZTtcclxuICAgIHRoaXMuaXNEcmFnQnV0dG9uID0gby5kcmFnIHx8IGZhbHNlO1xyXG4gICAgaWYoIHRoaXMuaXNEcmFnQnV0dG9uICkgdGhpcy5pc0xvYWRCdXR0b24gPSB0cnVlO1xyXG5cclxuICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZXMubGVuZ3RoO1xyXG4gICAgdGhpcy50bXAgPSBbXTtcclxuICAgIHRoaXMuc3RhdCA9IFtdO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrKXtcclxuICAgICAgICB0aGlzLmNbaSsyXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6MXB4OyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsgbGluZS1oZWlnaHQ6JysodGhpcy5oLTQpKydweDsnICk7XHJcbiAgICAgICAgdGhpcy5jW2krMl0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICB0aGlzLmNbaSsyXS5pbm5lckhUTUwgPSB0aGlzLnZhbHVlc1tpXTtcclxuICAgICAgICB0aGlzLnN0YXRbaV0gPSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9ICcnO1xyXG5cclxuICAgIGlmKCB0aGlzLmlzTG9hZEJ1dHRvbiApIHRoaXMuaW5pdExvYWRlcigpO1xyXG4gICAgaWYoIHRoaXMuaXNEcmFnQnV0dG9uICl7IFxyXG4gICAgICAgIHRoaXMubG5nICsrO1xyXG4gICAgICAgIHRoaXMuaW5pdERyYWdlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG5cclxufVxyXG5cclxuQnV0dG9uLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IEJ1dHRvbixcclxuXHJcbiAgICB0ZXN0Wm9uZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLmxuZztcclxuICAgICAgICB2YXIgdCA9IHRoaXMudG1wO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICBcdGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpKzI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cDogZnVuY3Rpb24gKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICBcdHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzW25hbWUtMl1cclxuICAgICAgICBpZiggIXRoaXMuaXNMb2FkQnV0dG9uICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgLy9lbHNlIHRoaXMuZmlsZVNlbGVjdCggZS50YXJnZXQuZmlsZXNbMF0gKTtcclxuICAgIFx0cmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiBcclxuICAgICAgICAvLyB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAvLyBjb25zb2xlLmxvZyhuYW1lKVxyXG5cclxuICAgICAgICBpZiggbmFtZSAhPT0gJycgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBuYW1lICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh1cClcclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGVzOiBmdW5jdGlvbiAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIHZhciB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT09IG5hbWUtMiApIHYgPSB0aGlzLm1vZGUoIG4sIGkrMiApO1xyXG4gICAgICAgICAgICBlbHNlIHYgPSB0aGlzLm1vZGUoIDEsIGkrMiApO1xyXG5cclxuICAgICAgICAgICAgaWYodikgciA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb2RlOiBmdW5jdGlvbiAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIHZhciBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIGkgPSBuYW1lIC0gMjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpXSAhPT0gbiApe1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdFtpXSA9IDE7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdFtpXSA9IDI7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSAnI0ZGRic7ICAgICAgICAgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0OyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0W2ldID0gMzsgdGhpcy5zWyBpKzIgXS5jb2xvciA9ICcjRkZGJzsgICAgICAgICB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICAvKnZhciB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG4gICAgICAgICAgICB2ID0gdGhpcy5tb2RlKCAxLCBpKzIgKTtcclxuICAgICAgICAgICAgaWYodikgciA9IHRydWU7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVzKCAxICwgMiApO1xyXG5cclxuICAgIFx0LyppZiggdGhpcy5zZWxlY3RlZCApe1xyXG4gICAgXHRcdHRoaXMuc1sgdGhpcy5zZWxlY3RlZCBdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuc1sgdGhpcy5zZWxlY3RlZCBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgXHR9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlOyovXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZHJhZ292ZXI6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNbNF0uYm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgdGhpcy5zWzRdLmNvbG9yID0gdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZHJhZ2VuZDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS5ib3JkZXJDb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHRoaXMuc1s0XS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZHJvcDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhZ2VuZChlKTtcclxuICAgICAgICB0aGlzLmZpbGVTZWxlY3QoIGUuZGF0YVRyYW5zZmVyLmZpbGVzWzBdICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpbml0RHJhZ2VyOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsnIHRleHQtYWxpZ246Y2VudGVyOyBsaW5lLWhlaWdodDonKyh0aGlzLmgtOCkrJ3B4OyBib3JkZXI6MXB4IGRhc2hlZCAnK3RoaXMuZm9udENvbG9yKyc7IHRvcDoycHg7ICBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsgcG9pbnRlci1ldmVudHM6YXV0bzsnICk7Ly8gY3Vyc29yOmRlZmF1bHQ7XHJcbiAgICAgICAgdGhpcy5jWzRdLnRleHRDb250ZW50ID0gJ0RSQUcnO1xyXG5cclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSl7IHRoaXMuZHJhZ292ZXIoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2RyYWdlbmQnLCBmdW5jdGlvbihlKXsgdGhpcy5kcmFnZW5kKGUpOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcbiAgICAgICAgdGhpcy5jWzRdLmFkZEV2ZW50TGlzdGVuZXIoICdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKXsgdGhpcy5kcmFnZW5kKGUpOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcbiAgICAgICAgdGhpcy5jWzRdLmFkZEV2ZW50TGlzdGVuZXIoICdkcm9wJywgZnVuY3Rpb24oZSl7IHRoaXMuZHJvcChlKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAvL3RoaXMuY1syXS5ldmVudHMgPSBbICBdO1xyXG4gICAgICAgIC8vdGhpcy5jWzRdLmV2ZW50cyA9IFsgJ2RyYWdvdmVyJywgJ2RyYWdlbmQnLCAnZHJhZ2xlYXZlJywgJ2Ryb3AnIF07XHJcblxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaW5pdExvYWRlcjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2lucHV0JywgdGhpcy5jc3MuYmFzaWMgKyd0b3A6MHB4OyBvcGFjaXR5OjA7IGhlaWdodDonKyh0aGlzLmgpKydweDsgcG9pbnRlci1ldmVudHM6YXV0bzsgY3Vyc29yOnBvaW50ZXI7JyApOy8vXHJcbiAgICAgICAgdGhpcy5jWzNdLm5hbWUgPSAnbG9hZGVyJztcclxuICAgICAgICB0aGlzLmNbM10udHlwZSA9IFwiZmlsZVwiO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10uYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsIGZ1bmN0aW9uKGUpeyB0aGlzLmZpbGVTZWxlY3QoIGUudGFyZ2V0LmZpbGVzWzBdICk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICAvL3RoaXMuY1szXS5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSl7ICB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdLmV2ZW50cyA9IFsgIF07XHJcbiAgICAgICAgLy90aGlzLmNbM10uZXZlbnRzID0gWyAnY2hhbmdlJywgJ21vdXNlb3ZlcicsICdtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW91dCcgXTtcclxuXHJcbiAgICAgICAgLy90aGlzLmhpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZmlsZVNlbGVjdDogZnVuY3Rpb24gKCBmaWxlICkge1xyXG5cclxuICAgICAgICB2YXIgZGF0YVVybCA9IFsgJ3BuZycsICdqcGcnLCAnbXA0JywgJ3dlYm0nLCAnb2dnJyBdO1xyXG4gICAgICAgIHZhciBkYXRhQnVmID0gWyAnc2VhJywgJ3onLCAnaGV4JywgJ2J2aCcsICdCVkgnIF07XHJcblxyXG4gICAgICAgIC8vaWYoICEgZS50YXJnZXQuZmlsZXMgKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vdmFyIGZpbGUgPSBlLnRhcmdldC5maWxlc1swXTtcclxuICAgICAgIFxyXG4gICAgICAgIC8vdGhpcy5jWzNdLnR5cGUgPSBcIm51bGxcIjtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggdGhpcy5jWzRdIClcclxuXHJcbiAgICAgICAgaWYoIGZpbGUgPT09IHVuZGVmaW5lZCApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgdmFyIGZuYW1lID0gZmlsZS5uYW1lO1xyXG4gICAgICAgIHZhciB0eXBlID0gZm5hbWUuc3Vic3RyaW5nKGZuYW1lLmxhc3RJbmRleE9mKCcuJykrMSwgZm5hbWUubGVuZ3RoICk7XHJcblxyXG4gICAgICAgIGlmKCBkYXRhVXJsLmluZGV4T2YoIHR5cGUgKSAhPT0gLTEgKSByZWFkZXIucmVhZEFzRGF0YVVSTCggZmlsZSApO1xyXG4gICAgICAgIGVsc2UgaWYoIGRhdGFCdWYuaW5kZXhPZiggdHlwZSApICE9PSAtMSApIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciggZmlsZSApOy8vcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlICk7XHJcbiAgICAgICAgZWxzZSByZWFkZXIucmVhZEFzVGV4dCggZmlsZSApO1xyXG5cclxuICAgICAgICAvLyBpZiggdHlwZSA9PT0gJ3BuZycgfHwgdHlwZSA9PT0gJ2pwZycgfHwgdHlwZSA9PT0gJ21wNCcgfHwgdHlwZSA9PT0gJ3dlYm0nIHx8IHR5cGUgPT09ICdvZ2cnICkgcmVhZGVyLnJlYWRBc0RhdGFVUkwoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoIHR5cGUgPT09ICd6JyApIHJlYWRlci5yZWFkQXNCaW5hcnlTdHJpbmcoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoIHR5cGUgPT09ICdzZWEnIHx8IHR5cGUgPT09ICdidmgnIHx8IHR5cGUgPT09ICdCVkgnIHx8IHR5cGUgPT09ICd6JykgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlICk7XHJcbiAgICAgICAgLy9lbHNlIGlmKCAgKSByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgcmVhZGVyLnJlYWRBc1RleHQoIGZpbGUgKTtcclxuXHJcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiggdGhpcy5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2soIGUudGFyZ2V0LnJlc3VsdCwgZm5hbWUsIHR5cGUgKTtcclxuICAgICAgICAgICAgLy90aGlzLmNbM10udHlwZSA9IFwiZmlsZVwiO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCggZS50YXJnZXQucmVzdWx0ICk7IFxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGxhYmVsOiBmdW5jdGlvbiAoIHN0cmluZywgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMjtcclxuICAgICAgICB0aGlzLmNbbl0udGV4dENvbnRlbnQgPSBzdHJpbmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpY29uOiBmdW5jdGlvbiAoIHN0cmluZywgeSwgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMjtcclxuICAgICAgICB0aGlzLnNbbl0ucGFkZGluZyA9ICggeSB8fCAwICkgKydweCAwcHgnO1xyXG4gICAgICAgIHRoaXMuY1tuXS5pbm5lckhUTUwgPSBzdHJpbmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByU2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuICAgICAgICB2YXIgdyA9IHRoaXMuc2I7XHJcbiAgICAgICAgdmFyIGQgPSB0aGlzLnNhO1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHZhciBkYyA9ICAzO1xyXG4gICAgICAgIHZhciBzaXplID0gTWF0aC5mbG9vciggKCB3LShkYyooaS0xKSkgKSAvIGkgKTtcclxuXHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuXHJcbiAgICAgICAgXHR0aGlzLnRtcFtpXSA9IFsgTWF0aC5mbG9vciggZCArICggc2l6ZSAqIGkgKSArICggZGMgKiBpICkpLCBzaXplIF07XHJcbiAgICAgICAgXHR0aGlzLnRtcFtpXVsyXSA9IHRoaXMudG1wW2ldWzBdICsgdGhpcy50bXBbaV1bMV07XHJcbiAgICAgICAgICAgIHNbaSsyXS5sZWZ0ID0gdGhpcy50bXBbaV1bMF0gKyAncHgnO1xyXG4gICAgICAgICAgICBzW2krMl0ud2lkdGggPSB0aGlzLnRtcFtpXVsxXSArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEcmFnQnV0dG9uICl7IFxyXG4gICAgICAgICAgICBzWzRdLmxlZnQgPSAoZCtzaXplK2RjKSArICdweCc7XHJcbiAgICAgICAgICAgIHNbNF0ud2lkdGggPSBzaXplICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzTG9hZEJ1dHRvbiApe1xyXG4gICAgICAgICAgICBzWzNdLmxlZnQgPSBkICsgJ3B4JztcclxuICAgICAgICAgICAgc1szXS53aWR0aCA9IHNpemUgKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBCdXR0b24gfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZnVuY3Rpb24gQ2lyY3VsYXIgKCBvICkge1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICAvL3RoaXMudHlwZSA9ICdjaXJjdWxhcic7XHJcbiAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuYnV0dG9uQ29sb3IgPSB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvICk7XHJcblxyXG4gICAgdGhpcy5yYWRpdXMgPSB0aGlzLncgKiAwLjU7Ly9NYXRoLmZsb29yKCh0aGlzLnctMjApKjAuNSk7XHJcblxyXG5cclxuICAgIC8vdGhpcy53dyA9IHRoaXMucmFkaXVzICogMjtcclxuXHJcbiAgIC8vIHRoaXMuaCA9IHRoaXMuaGVpZ2h0ICsgNDA7XHJcblxyXG5cclxuXHJcbiAgICB0aGlzLnR3b1BpID0gTWF0aC5QSSAqIDI7XHJcbiAgICB0aGlzLnBpOTAgPSBNYXRoLlBJICogMC41O1xyXG5cclxuICAgIHRoaXMub2Zmc2V0ID0gbmV3IFYyKCk7XHJcblxyXG4gICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArIDEwO1xyXG4gICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICBpZih0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcbiAgICAgICAgdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnBlcmNlbnQgPSAwO1xyXG5cclxuICAgIHRoaXMuY21vZGUgPSAwO1xyXG5cclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgIHRoaXMuY1szXSA9IHRoaXMuZ2V0Q2lyY3VsYXIoKTtcclxuXHJcbiAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMSApO1xyXG4gICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcblxyXG4gICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy53KycgJyt0aGlzLncgKTtcclxuICAgIHRoaXMuc2V0Q3NzKCB0aGlzLmNbM10sIHsgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy53LCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG59XHJcblxyXG5DaXJjdWxhci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBDaXJjdWxhcixcclxuXHJcbiAgICBtb2RlOiBmdW5jdGlvbiAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNtb2RlID09PSBtb2RlICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBzd2l0Y2goIG1vZGUgKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuMSknLCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmZvbnRDb2xvciwgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmNvbG9yUGx1cztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuMyknLCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmNvbG9yUGx1cywgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSBtb2RlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNlbmRFbmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5vbGRyID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgLy90aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBvZmYgPSB0aGlzLm9mZnNldDtcclxuXHJcbiAgICAgICAgb2ZmLnggPSB0aGlzLnJhZGl1cyAtIChlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIG9mZi55ID0gdGhpcy5yYWRpdXMgLSAoZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCApO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSBvZmYuYW5nbGUoKSAtIHRoaXMucGk5MDtcclxuICAgICAgICB0aGlzLnIgPSAoKCh0aGlzLnIldGhpcy50d29QaSkrdGhpcy50d29QaSkldGhpcy50d29QaSk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9sZHIgIT09IG51bGwgKXsgXHJcblxyXG4gICAgICAgICAgICB2YXIgZGlmID0gdGhpcy5yIC0gdGhpcy5vbGRyO1xyXG4gICAgICAgICAgICB0aGlzLnIgPSBNYXRoLmFicyhkaWYpID4gTWF0aC5QSSA/IHRoaXMub2xkciA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgICAgIGlmKCBkaWYgPiA2ICkgdGhpcy5yID0gMDtcclxuICAgICAgICAgICAgaWYoIGRpZiA8IC02ICkgdGhpcy5yID0gdGhpcy50d29QaTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc3RlcHMgPSAxIC8gdGhpcy50d29QaTtcclxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnIgKiBzdGVwcztcclxuXHJcbiAgICAgICAgdmFyIG4gPSAoICggdGhpcy5yYW5nZSAqIHZhbHVlICkgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcblxyXG4gICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgIG4gPSB+fiAoIG4gLyB0aGlzLnN0ZXAgKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHRoaXMub2xkICsgKCBuICogdGhpcy5zdGVwICkgKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm9sZHIgPSB0aGlzLnI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbWFrZVBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIHIgPSA0MDtcclxuICAgICAgICB2YXIgZCA9IDI0O1xyXG4gICAgICAgIHZhciBhID0gdGhpcy5wZXJjZW50ICogdGhpcy50d29QaSAtIDAuMDAxO1xyXG4gICAgICAgIHZhciB4MiA9IChyICsgciAqIE1hdGguc2luKGEpKSArIGQ7XHJcbiAgICAgICAgdmFyIHkyID0gKHIgLSByICogTWF0aC5jb3MoYSkpICsgZDtcclxuICAgICAgICB2YXIgYmlnID0gYSA+IE1hdGguUEkgPyAxIDogMDtcclxuICAgICAgICByZXR1cm4gXCJNIFwiICsgKHIrZCkgKyBcIixcIiArIGQgKyBcIiBBIFwiICsgciArIFwiLFwiICsgciArIFwiIDAgXCIgKyBiaWcgKyBcIiAxIFwiICsgeDIgKyBcIixcIiArIHkyO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoIHVwICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMucGVyY2VudCA9ICggdGhpcy52YWx1ZSAtIHRoaXMubWluICkgLyB0aGlzLnJhbmdlO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMSApO1xyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IENpcmN1bGFyIH07IiwiaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuLi9jb3JlL1Rvb2xzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmZ1bmN0aW9uIENvbG9yICggbyApIHtcclxuICAgIFxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIC8vdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuXHJcbiAgICB0aGlzLmN0eXBlID0gby5jdHlwZSB8fCAnYXJyYXknO1xyXG5cclxuICAgIHRoaXMud2ZpeGUgPSB0aGlzLnNiID4gMjU2ID8gMjU2IDogdGhpcy5zYjtcclxuXHJcbiAgICAvLyBjb2xvciB1cCBvciBkb3duXHJcbiAgICB0aGlzLnNpZGUgPSBvLnNpZGUgfHwgJ2Rvd24nO1xyXG4gICAgdGhpcy51cCA9IHRoaXMuc2lkZSA9PT0gJ2Rvd24nID8gMCA6IDE7XHJcbiAgICBcclxuICAgIHRoaXMuYmFzZUggPSB0aGlzLmg7XHJcblxyXG4gICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuICAgIHRoaXMuZGVjYWwgPSBuZXcgVjIoKTtcclxuXHJcbiAgICB0aGlzLnBpOTAgPSBNYXRoLlBJICogMC41O1xyXG5cclxuICAgIC8vdGhpcy5jWzBdLnN0eWxlLmJhY2tncm91bmQgPSAnI0ZGMDAwMCdcclxuXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsICB0aGlzLmNzcy50eHQgKyAnaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7JyArICdib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLmgtOCkrJ3B4OycgKTtcclxuICAgIHRoaXMuc1syXSA9IHRoaXMuY1syXS5zdHlsZTtcclxuXHJcbiAgICBpZiggdGhpcy51cCApe1xyXG4gICAgICAgIHRoaXMuc1syXS50b3AgPSAnYXV0byc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmJvdHRvbSA9ICcycHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY1szXSA9IHRoaXMuZ2V0Q29sb3JSaW5nKCk7XHJcbiAgICB0aGlzLmNbM10uc3R5bGUudmlzaWJpbGl0eSAgPSAnaGlkZGVuJztcclxuXHJcbiAgICB0aGlzLmhzbCA9IG51bGw7XHJcbiAgICB0aGlzLnZhbHVlID0gJyNmZmZmZmYnO1xyXG4gICAgaWYoIG8udmFsdWUgIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgIGlmKCBvLnZhbHVlIGluc3RhbmNlb2YgQXJyYXkgKSB0aGlzLnZhbHVlID0gVG9vbHMucmdiVG9IZXgoIG8udmFsdWUgKTtcclxuICAgICAgICBlbHNlIGlmKCFpc05hTihvLnZhbHVlKSkgdGhpcy52YWx1ZSA9IFRvb2xzLmhleFRvSHRtbCggby52YWx1ZSApO1xyXG4gICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IG8udmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5iY29sb3IgPSBudWxsO1xyXG4gICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnNldENvbG9yKCB0aGlzLnZhbHVlICk7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgaWYoIG8ub3BlbiAhPT0gdW5kZWZpbmVkICkgdGhpcy5vcGVuKCk7XHJcblxyXG59XHJcblxyXG5Db2xvci5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBDb2xvcixcclxuXHJcblx0dGVzdFpvbmU6IGZ1bmN0aW9uICggbXgsIG15ICkge1xyXG5cclxuXHRcdHZhciBsID0gdGhpcy5sb2NhbDtcclxuXHRcdGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG5cdFx0aWYoIHRoaXMudXAgJiYgdGhpcy5pc09wZW4gKXtcclxuXHJcblx0XHRcdGlmKCBsLnkgPiB0aGlzLndmaXhlICkgcmV0dXJuICd0aXRsZSc7XHJcblx0XHQgICAgZWxzZSByZXR1cm4gJ2NvbG9yJztcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0aWYoIGwueSA8IHRoaXMuYmFzZUgrMiApIHJldHVybiAndGl0bGUnO1xyXG5cdCAgICBcdGVsc2UgaWYoIHRoaXMuaXNPcGVuICkgcmV0dXJuICdjb2xvcic7XHJcblxyXG5cclxuXHRcdH1cclxuXHJcbiAgICB9LFxyXG5cclxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRtb3VzZXVwOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG5cdCAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuXHR9LFxyXG5cclxuXHRtb3VzZWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcblxyXG5cdFx0dmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlLmNsaWVudFgsIGUuY2xpZW50WSApO1xyXG5cclxuXHJcblx0XHQvL2lmKCAhbmFtZSApIHJldHVybjtcclxuXHRcdGlmKG5hbWUgPT09ICd0aXRsZScpe1xyXG5cdFx0XHRpZiggIXRoaXMuaXNPcGVuICkgdGhpcy5vcGVuKCk7XHJcblx0ICAgICAgICBlbHNlIHRoaXMuY2xvc2UoKTtcclxuXHQgICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRpZiggbmFtZSA9PT0gJ2NvbG9yJyApe1xyXG5cdFx0XHR0aGlzLmlzRG93biA9IHRydWU7XHJcblx0XHRcdHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblx0XHR9XHJcblx0fSxcclxuXHJcblx0Lypkb3duOiBmdW5jdGlvbiggZSApe1xyXG5cclxuXHQgICAgaWYoIXRoaXMuaXNPcGVuKSByZXR1cm47XHJcblx0ICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHQgICAgdGhpcy5tb3ZlKCBlICk7XHJcblx0ICAgIC8vcmV0dXJuIGZhbHNlO1xyXG5cclxuXHJcblx0fSwqL1xyXG5cclxuXHRtb3VzZW1vdmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcblx0ICAgIHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZS5jbGllbnRYLCBlLmNsaWVudFkgKTtcclxuXHJcblx0ICAgIHZhciBvZmYsIGQsIGh1ZSwgc2F0LCBsdW07XHJcblxyXG5cdCAgICBpZiggbmFtZSA9PT0gJ3RpdGxlJyApe1xyXG5cclxuXHQgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG5cdCAgICB9XHJcblxyXG5cdCAgICBpZiggbmFtZSA9PT0gJ2NvbG9yJyApe1xyXG5cclxuXHQgICAgXHR0aGlzLmN1cnNvcignY3Jvc3NoYWlyJyk7XHJcblxyXG5cdCAgICBcdGlmKCB0aGlzLmlzRG93biApe1xyXG5cclxuXHQgICAgXHRcdG9mZiA9IHRoaXMub2Zmc2V0O1xyXG5cdFx0ICAgIFx0b2ZmLnggPSBlLmNsaWVudFggLSAoIHRoaXMuem9uZS54ICsgdGhpcy5kZWNhbC54ICsgdGhpcy5taWQgKTtcclxuXHRcdCAgICBcdG9mZi55ID0gZS5jbGllbnRZIC0gKCB0aGlzLnpvbmUueSArIHRoaXMuZGVjYWwueSArIHRoaXMubWlkICk7XHJcblx0XHRcdCAgICBkID0gb2ZmLmxlbmd0aCgpICogdGhpcy5yYXRpbztcclxuXHJcblx0XHRcdCAgICBpZiAoIGQgPCAxMjggKSB7XHJcblx0XHRcdFx0ICAgIGlmICggZCA+IDg4ICkge1xyXG5cclxuXHRcdFx0XHQgICAgICAgIGh1ZSA9ICggb2ZmLmFuZ2xlKCkgKyB0aGlzLnBpOTAgKSAvIDYuMjg7XHJcblx0XHRcdFx0ICAgICAgICB0aGlzLnNldEhTTChbKGh1ZSArIDEpICUgMSwgdGhpcy5oc2xbMV0sIHRoaXMuaHNsWzJdXSk7XHJcblxyXG5cdFx0XHRcdCAgICB9IGVsc2Uge1xyXG5cclxuXHJcblx0XHRcdFx0ICAgIFx0c2F0ID0gTWF0aC5tYXgoIDAsIE1hdGgubWluKCAxLCAwLjUgLSAoIG9mZi54ICogdGhpcy5zcXVhcmUgKiAwLjUgKSApICk7XHJcblx0XHRcdFx0ICAgICAgICBsdW0gPSBNYXRoLm1heCggMCwgTWF0aC5taW4oIDEsIDAuNSAtICggb2ZmLnkgKiB0aGlzLnNxdWFyZSAqIDAuNSApICkgKTtcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuc2V0SFNMKFt0aGlzLmhzbFswXSwgc2F0LCBsdW1dKTtcclxuXHJcblx0XHRcdFx0ICAgIH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0ICAgIC8vY29uc29sZS5sb2codGhpcy5pc0RyYXcpXHJcblxyXG5cclxuXHR9LFxyXG5cclxuXHRzZXRIZWlnaHQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHR0aGlzLmggPSB0aGlzLmlzT3BlbiA/IHRoaXMud2ZpeGUgKyB0aGlzLmJhc2VIICsgNSA6IHRoaXMuYmFzZUg7XHJcblx0XHR0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHRcdHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuXHR9LFxyXG5cclxuXHRwYXJlbnRIZWlnaHQ6IGZ1bmN0aW9uICggdCApIHtcclxuXHJcblx0XHRpZiAoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKSB0aGlzLnBhcmVudEdyb3VwLmNhbGMoIHQgKTtcclxuXHQgICAgZWxzZSBpZiAoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB0ICk7XHJcblxyXG5cdH0sXHJcblxyXG5cdG9wZW46IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRQcm90by5wcm90b3R5cGUub3Blbi5jYWxsKCB0aGlzICk7XHJcblxyXG5cdFx0dGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcblx0XHRpZiggdGhpcy51cCApIHRoaXMuem9uZS55IC09IHRoaXMud2ZpeGUgKyA1O1xyXG5cclxuXHRcdHZhciB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcblx0ICAgIHRoaXMuc1szXS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xyXG5cdCAgICAvL3RoaXMuc1szXS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuXHQgICAgdGhpcy5wYXJlbnRIZWlnaHQoIHQgKTtcclxuXHJcblx0fSxcclxuXHJcblx0Y2xvc2U6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0XHRQcm90by5wcm90b3R5cGUuY2xvc2UuY2FsbCggdGhpcyApO1xyXG5cclxuXHRcdGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgKz0gdGhpcy53Zml4ZSArIDU7XHJcblxyXG5cdFx0dmFyIHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuXHRcdHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG5cdCAgICB0aGlzLnNbM10udmlzaWJpbGl0eSAgPSAnaGlkZGVuJztcclxuXHQgICAgLy90aGlzLnNbM10uZGlzcGxheSA9ICdub25lJztcclxuXHQgICAgdGhpcy5wYXJlbnRIZWlnaHQoIC10ICk7XHJcblxyXG5cdH0sXHJcblxyXG5cdHVwZGF0ZTogZnVuY3Rpb24gKCB1cCApIHtcclxuXHJcblx0ICAgIHZhciBjYyA9IFRvb2xzLnJnYlRvSGV4KCBUb29scy5oc2xUb1JnYihbIHRoaXMuaHNsWzBdLCAxLCAwLjUgXSkgKTtcclxuXHJcblx0ICAgIHRoaXMubW92ZU1hcmtlcnMoKTtcclxuXHQgICAgXHJcblx0ICAgIHRoaXMudmFsdWUgPSB0aGlzLmJjb2xvcjtcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2MsIDIgKTtcclxuXHJcblx0ICAgIHRoaXMuc1syXS5iYWNrZ3JvdW5kID0gdGhpcy5iY29sb3I7XHJcblx0ICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IFRvb2xzLmh0bWxUb0hleCggdGhpcy5iY29sb3IgKTtcclxuXHJcblx0ICAgIHRoaXMuaW52ZXJ0ID0gVG9vbHMuZmluZERlZXBJbnZlciggdGhpcy5yZ2IgKTtcclxuXHQgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCc7XHJcblxyXG5cdCAgICBpZighdXApIHJldHVybjtcclxuXHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAnYXJyYXknICkgdGhpcy5zZW5kKCB0aGlzLnJnYiApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ3JnYicgKSB0aGlzLnNlbmQoIFRvb2xzLmh0bWxSZ2IoIHRoaXMucmdiICkgKTtcclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdoZXgnICkgdGhpcy5zZW5kKCBUb29scy5odG1sVG9IZXgoIHRoaXMudmFsdWUgKSApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ2h0bWwnICkgdGhpcy5zZW5kKCk7XHJcblxyXG5cdH0sXHJcblxyXG5cdHNldENvbG9yOiBmdW5jdGlvbiAoIGNvbG9yICkge1xyXG5cclxuXHQgICAgdmFyIHVucGFjayA9IFRvb2xzLnVucGFjayhjb2xvcik7XHJcblx0ICAgIGlmICh0aGlzLmJjb2xvciAhPSBjb2xvciAmJiB1bnBhY2spIHtcclxuXHQgICAgICAgIHRoaXMuYmNvbG9yID0gY29sb3I7XHJcblx0ICAgICAgICB0aGlzLnJnYiA9IHVucGFjaztcclxuXHQgICAgICAgIHRoaXMuaHNsID0gVG9vbHMucmdiVG9Ic2woIHRoaXMucmdiICk7XHJcblx0ICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiB0aGlzO1xyXG5cclxuXHR9LFxyXG5cclxuXHRzZXRIU0w6IGZ1bmN0aW9uICggaHNsICkge1xyXG5cclxuXHQgICAgdGhpcy5oc2wgPSBoc2w7XHJcblx0ICAgIHRoaXMucmdiID0gVG9vbHMuaHNsVG9SZ2IoIGhzbCApO1xyXG5cdCAgICB0aGlzLmJjb2xvciA9IFRvb2xzLnJnYlRvSGV4KCB0aGlzLnJnYiApO1xyXG5cdCAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG5cdCAgICByZXR1cm4gdGhpcztcclxuXHJcblx0fSxcclxuXHJcblx0bW92ZU1hcmtlcnM6IGZ1bmN0aW9uICgpIHtcclxuXHJcblx0ICAgIHZhciBzciA9IDYwXHJcblx0ICAgIHZhciByYSA9IDEyOC0yMDsgXHJcblx0ICAgIHZhciBjMSA9IHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnO1xyXG5cdCAgICB2YXIgYSA9IHRoaXMuaHNsWzBdICogNi4yODtcclxuXHJcblx0ICAgIHZhciBwID0gbmV3IFYyKCBNYXRoLnNpbihhKSAqIHJhLCAtTWF0aC5jb3MoYSkgKiByYSApLmFkZFNjYWxhcigxMjgpO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgcC54LCA1ICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHAueSwgNSApO1xyXG5cdCAgICBcclxuXHQgICAgcC5zZXQoIDIgKiBzciAqICguNSAtIHRoaXMuaHNsWzFdKSwgMiAqIHNyICogKC41IC0gdGhpcy5oc2xbMl0pICkuYWRkU2NhbGFyKDEyOCk7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCBwLngsIDYgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgcC55LCA2ICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCBjMSwgNiApO1xyXG5cclxuXHR9LFxyXG5cclxuXHRyU2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuXHQgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcblx0ICAgIHZhciBzID0gdGhpcy5zO1xyXG5cclxuXHQgICAgc1syXS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG5cdCAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuXHJcblx0ICAgIHRoaXMuZGVjYWwueCA9IE1hdGguZmxvb3IoKHRoaXMudyAtIHRoaXMud2ZpeGUpICogMC41KTtcclxuXHQgICAgdGhpcy5kZWNhbC55ID0gdGhpcy5zaWRlID09PSAndXAnID8gMiA6IHRoaXMuYmFzZUggKyAyO1xyXG5cdCAgICB0aGlzLm1pZCA9IE1hdGguZmxvb3IoIHRoaXMud2ZpeGUgKiAwLjUgKTtcclxuXHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLndmaXhlKycgJyt0aGlzLndmaXhlICk7XHJcblx0ICAgIHNbM10ud2lkdGggPSB0aGlzLndmaXhlICsgJ3B4JztcclxuXHQgICAgc1szXS5oZWlnaHQgPSB0aGlzLndmaXhlICsgJ3B4JztcclxuICAgIFx0c1szXS5sZWZ0ID0gdGhpcy5kZWNhbC54ICsgJ3B4JztcclxuXHQgICAgc1szXS50b3AgPSB0aGlzLmRlY2FsLnkgKyAncHgnO1xyXG5cclxuXHQgICAvKiB0aGlzLmNbNF0ud2lkdGggPSB0aGlzLmNbNF0uaGVpZ2h0ID0gdGhpcy53dztcclxuXHQgICAgc1s0XS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcblx0ICAgIHNbNF0udG9wID0gdGhpcy5kZWNhbCArICdweCc7XHJcblxyXG5cdCAgICB0aGlzLmNbNV0ud2lkdGggPSB0aGlzLmNbNV0uaGVpZ2h0ID0gdGhpcy53dztcclxuXHQgICAgc1s1XS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcblx0ICAgIHNbNV0udG9wID0gdGhpcy5kZWNhbCArICdweCc7XHJcblxyXG5cdCAgICB0aGlzLmN0eE1hc2sudHJhbnNsYXRlKHRoaXMubWlkLCB0aGlzLm1pZCk7XHJcblx0ICAgIHRoaXMuY3R4T3ZlcmxheS50cmFuc2xhdGUodGhpcy5taWQsIHRoaXMubWlkKTtcclxuXHJcblx0ICAgIGlmKCB0aGlzLmlzT3BlbiApeyBcclxuXHQgICAgICAgIHRoaXMucmVkcmF3KCk7XHJcblxyXG5cdCAgICAgICAgLy90aGlzLm9wZW4oKTtcclxuXHQgICAgICAgIC8vdGhpcy5oID0gdGhpcy53dyszMDtcclxuXHQgICAgICAgIC8vdGhpcy5jWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcblx0ICAgICAgICAvL2lmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYygpO1xyXG5cdCAgICB9Ki9cclxuXHJcblxyXG5cdCAgICB0aGlzLnJhdGlvID0gMjU2L3RoaXMud2ZpeGU7XHJcblx0ICAgIHRoaXMuc3F1YXJlID0gMSAvICg2MCoodGhpcy53Zml4ZS8yNTYpKTtcclxuXHQgICAgXHJcblx0ICAgIHRoaXMuc2V0SGVpZ2h0KCk7XHJcblx0ICAgIFxyXG5cdH1cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IENvbG9yIH07IiwiaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuLi9jb3JlL1Jvb3RzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmZ1bmN0aW9uIEZwcyAoIG8gKSB7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIHRoaXMucm91bmQgPSBNYXRoLnJvdW5kO1xyXG5cclxuICAgIHRoaXMuYXV0b0hlaWdodCA9IHRydWU7XHJcblxyXG4gICAgdGhpcy5iYXNlSCA9IHRoaXMuaDtcclxuICAgIHRoaXMuaHBsdXMgPSBvLmhwbHVzIHx8IDUwO1xyXG5cclxuICAgIHRoaXMucmVzID0gby5yZXMgfHwgNDA7XHJcbiAgICB0aGlzLmwgPSAxO1xyXG5cclxuICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gfHwgMDtcclxuICAgIFxyXG5cclxuICAgIHRoaXMuY3VzdG9tID0gby5jdXN0b20gfHwgZmFsc2U7XHJcbiAgICB0aGlzLm5hbWVzID0gby5uYW1lcyB8fCBbJ0ZQUycsICdNUyddO1xyXG4gICAgdmFyIGNjID0gby5jYyB8fCBbJzkwLDkwLDkwJywgJzI1NSwyNTUsMCddO1xyXG5cclxuICAgLy8gdGhpcy5kaXZpZCA9IFsgMTAwLCAxMDAsIDEwMCBdO1xyXG4gICAvLyB0aGlzLm11bHR5ID0gWyAzMCwgMzAsIDMwIF07XHJcblxyXG4gICAgdGhpcy5hZGRpbmcgPSBvLmFkZGluZyB8fCBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnJhbmdlID0gby5yYW5nZSB8fCBbIDE2NSwgMTAwLCAxMDAgXTtcclxuXHJcbiAgICB0aGlzLmFscGhhID0gby5hbHBoYSB8fCAwLjI1O1xyXG5cclxuICAgIHRoaXMudmFsdWVzID0gW107XHJcbiAgICB0aGlzLnBvaW50cyA9IFtdO1xyXG4gICAgdGhpcy50ZXh0RGlzcGxheSA9IFtdO1xyXG5cclxuICAgIGlmKCF0aGlzLmN1c3RvbSl7XHJcblxyXG4gICAgICAgIHRoaXMubm93ID0gKCBzZWxmLnBlcmZvcm1hbmNlICYmIHNlbGYucGVyZm9ybWFuY2Uubm93ICkgPyBzZWxmLnBlcmZvcm1hbmNlLm5vdy5iaW5kKCBwZXJmb3JtYW5jZSApIDogRGF0ZS5ub3c7XHJcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSAwOy8vdGhpcy5ub3coKVxyXG4gICAgICAgIHRoaXMucHJldlRpbWUgPSAwOy8vdGhpcy5zdGFydFRpbWU7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLm1zID0gMDtcclxuICAgICAgICB0aGlzLmZwcyA9IDA7XHJcbiAgICAgICAgdGhpcy5tZW0gPSAwO1xyXG4gICAgICAgIHRoaXMubW0gPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmlzTWVtID0gKCBzZWxmLnBlcmZvcm1hbmNlICYmIHNlbGYucGVyZm9ybWFuY2UubWVtb3J5ICkgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgLy8gdGhpcy5kaXZpZCA9IFsgMTAwLCAyMDAsIDEgXTtcclxuICAgICAgIC8vIHRoaXMubXVsdHkgPSBbIDMwLCAzMCwgMzAgXTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNNZW0gKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubmFtZXMucHVzaCgnTUVNJyk7XHJcbiAgICAgICAgICAgIGNjLnB1c2goJzAsMjU1LDI1NScpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudHh0ID0gJ0ZQUydcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHZhciBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNjtcclxuXHJcbiAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0aGlzLnR4dDtcclxuICAgIHRoaXMuY1swXS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICB0aGlzLmNbMF0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuXHJcbiAgICB2YXIgcGFuZWxDc3MgPSAnZGlzcGxheTpub25lOyBsZWZ0OjEwcHg7IHRvcDonKyB0aGlzLmggKyAncHg7IGhlaWdodDonKyh0aGlzLmhwbHVzIC0gOCkrJ3B4OyBib3gtc2l6aW5nOmJvcmRlci1ib3g7IGJhY2tncm91bmQ6IHJnYmEoMCwgMCwgMCwgMC4yKTsgYm9yZGVyOicgKyAodGhpcy5jb2xvcnMuZ3JvdXBCb3JkZXIgIT09ICdub25lJz8gdGhpcy5jb2xvcnMuZ3JvdXBCb3JkZXIrJzsnIDogJzFweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7Jyk7XHJcblxyXG4gICAgaWYoIHRoaXMucmFkaXVzICE9PSAwICkgcGFuZWxDc3MgKz0gJ2JvcmRlci1yYWRpdXM6JyArIHRoaXMucmFkaXVzKydweDsnOyBcclxuXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArIHBhbmVsQ3NzICwge30gKTtcclxuXHJcbiAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCd2aWV3Qm94JywgJzAgMCAnK3RoaXMucmVzKycgNTAnICk7XHJcbiAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCAnMTAwJScgKTtcclxuICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgJzEwMCUnICk7XHJcbiAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJywgJ25vbmUnICk7XHJcblxyXG5cclxuICAgIC8vdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKDI1NSwyNTUsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOicjRkYwJywgJ3ZlY3Rvci1lZmZlY3QnOidub24tc2NhbGluZy1zdHJva2UnIH0sIHRoaXMuY1syXSApO1xyXG4gICAgLy90aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoMCwyNTUsMjU1LDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6JyMwRkYnLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICBcclxuICAgIC8vIGFycm93XHJcbiAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6NHB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5hcnJvdywgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgIC8vIHJlc3VsdCB0ZXN0XHJcbiAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdwb3NpdGlvbjphYnNvbHV0ZTsgbGVmdDoxMHB4OyB0b3A6JysodGhpcy5oKzIpICsncHg7IGRpc3BsYXk6bm9uZTsgd2lkdGg6MTAwJTsgdGV4dC1hbGlnbjpjZW50ZXI7JyApO1xyXG5cclxuICAgIC8vIGJvdHRvbSBsaW5lXHJcbiAgICBpZiggby5ib3R0b21MaW5lICkgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBib3R0b206MHB4OyBoZWlnaHQ6MXB4OyBiYWNrZ3JvdW5kOiByZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7Jyk7XHJcblxyXG4gICAgdGhpcy5pc1Nob3cgPSBmYWxzZTtcclxuXHJcbiAgICB2YXIgcyA9IHRoaXMucztcclxuXHJcbiAgICBzWzFdLm1hcmdpbkxlZnQgPSAnMTBweCc7XHJcbiAgICBzWzFdLmxpbmVIZWlnaHQgPSB0aGlzLmgtNDtcclxuICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgIHNbMV0uZm9udFdlaWdodCA9ICdib2xkJztcclxuXHJcbiAgICBpZiggdGhpcy5yYWRpdXMgIT09IDAgKSAgc1swXS5ib3JkZXJSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnOyBcclxuICAgIHNbMF0uYm9yZGVyID0gdGhpcy5jb2xvcnMuZ3JvdXBCb3JkZXI7XHJcblxyXG4gICAgXHJcblxyXG5cclxuICAgIGZvciggdmFyIGo9MDsgajx0aGlzLm5hbWVzLmxlbmd0aDsgaisrICl7XHJcblxyXG4gICAgICAgIHZhciBiYXNlID0gW107XHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLnJlcysxO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKSBiYXNlLnB1c2goNTApO1xyXG5cclxuICAgICAgICB0aGlzLnJhbmdlW2pdID0gKCAxIC8gdGhpcy5yYW5nZVtqXSApICogNDk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaCggYmFzZSApO1xyXG4gICAgICAgIHRoaXMudmFsdWVzLnB1c2goMCk7XHJcbiAgICAgICAvLyAgdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKCcrY2Nbal0rJywwLjUpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOidyZ2JhKCcrY2Nbal0rJywxKScsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICB0aGlzLnRleHREaXNwbGF5LnB1c2goIFwiPHNwYW4gc3R5bGU9J2NvbG9yOnJnYihcIitjY1tqXStcIiknPiBcIiArIHRoaXMubmFtZXNbal0gK1wiIFwiKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaiA9IHRoaXMubmFtZXMubGVuZ3RoO1xyXG4gICAgd2hpbGUoai0tKXtcclxuICAgICAgICB0aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoJytjY1tqXSsnLCcrdGhpcy5hbHBoYSsnKScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZToncmdiYSgnK2NjW2pdKycsMSknLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIC8vaWYoIHRoaXMuaXNTaG93ICkgdGhpcy5zaG93KCk7XHJcblxyXG59O1xyXG5cclxuXHJcbkZwcy5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBGcHMsXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTaG93ICkgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5vcGVuKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgLyptb2RlOiBmdW5jdGlvbiAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgLy9zWzFdLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHNbMV0uY29sb3IgPSAnI0ZGRic7XHJcbiAgICAgICAgICAgICAgICAvL3NbMV0uYmFja2dyb3VuZCA9IFVJTC5TRUxFQ1Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICAvL3NbMV0uYmFja2dyb3VuZCA9IFVJTC5TRUxFQ1RET1dOO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfSwqL1xyXG5cclxuICAgIHRpY2s6IGZ1bmN0aW9uICggdiApe1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IHY7XHJcbiAgICAgICAgaWYoICF0aGlzLmlzU2hvdyApIHJldHVybjtcclxuICAgICAgICB0aGlzLmRyYXdHcmFwaCgpO1xyXG4gICAgICAgIHRoaXMudXBUZXh0KCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlUGF0aDogZnVuY3Rpb24gKCBwb2ludCApIHtcclxuXHJcbiAgICAgICAgdmFyIHAgPSAnJztcclxuICAgICAgICBwICs9ICdNICcgKyAoLTEpICsgJyAnICsgNTA7XHJcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdGhpcy5yZXMgKyAxOyBpICsrICkgeyBwICs9ICcgTCAnICsgaSArICcgJyArIHBvaW50W2ldOyB9XHJcbiAgICAgICAgcCArPSAnIEwgJyArICh0aGlzLnJlcyArIDEpICsgJyAnICsgNTA7XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cFRleHQ6IGZ1bmN0aW9uKCB2YWwgKXtcclxuXHJcbiAgICAgICAgdmFyIHYgPSB2YWwgfHwgdGhpcy52YWx1ZXMsIHQgPSAnJztcclxuICAgICAgICBmb3IoIHZhciBqPTAsIGxuZyA9dGhpcy5uYW1lcy5sZW5ndGg7IGo8bG5nOyBqKysgKSB0ICs9IHRoaXMudGV4dERpc3BsYXlbal0gKyAodltqXSkudG9GaXhlZCh0aGlzLnByZWNpc2lvbikgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgdGhpcy5jWzRdLmlubmVySFRNTCA9IHQ7XHJcbiAgICBcclxuICAgIH0sXHJcblxyXG4gICAgZHJhd0dyYXBoOiBmdW5jdGlvbiggKXtcclxuXHJcbiAgICAgICAgdmFyIHN2ZyA9IHRoaXMuY1syXTtcclxuICAgICAgICB2YXIgaSA9IHRoaXMubmFtZXMubGVuZ3RoLCB2LCBvbGQgPSAwLCBuID0gMDtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggdGhpcy5hZGRpbmcgKSB2ID0gKHRoaXMudmFsdWVzW25dK29sZCkgKiB0aGlzLnJhbmdlW25dO1xyXG4gICAgICAgICAgICBlbHNlICB2ID0gKHRoaXMudmFsdWVzW25dICogdGhpcy5yYW5nZVtuXSk7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzW25dLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzW25dLnB1c2goIDUwIC0gdiApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2Zyggc3ZnLCAnZCcsIHRoaXMubWFrZVBhdGgoIHRoaXMucG9pbnRzW25dICksIGkrMSApO1xyXG4gICAgICAgICAgICBvbGQgKz0gdGhpcy52YWx1ZXNbbl07XHJcbiAgICAgICAgICAgIG4rKztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgb3BlbjogZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLm9wZW4uY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmhwbHVzICsgdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3dEb3duICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnBhcmVudEdyb3VwICE9PSBudWxsICl7IHRoaXMucGFyZW50R3JvdXAuY2FsYyggdGhpcy5ocGx1cyApO31cclxuICAgICAgICBlbHNlIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdGhpcy5ocGx1cyApO1xyXG5cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ2Jsb2NrJzsgXHJcbiAgICAgICAgdGhpcy5zWzRdLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIHRoaXMuaXNTaG93ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1c3RvbSApIFJvb3RzLmFkZExpc3RlbiggdGhpcyApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvc2U6IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5jbG9zZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5zdmdzLmFycm93ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnBhcmVudEdyb3VwICE9PSBudWxsICl7IHRoaXMucGFyZW50R3JvdXAuY2FsYyggLXRoaXMuaHBsdXMgKTt9XHJcbiAgICAgICAgZWxzZSBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIC10aGlzLmhwbHVzICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLnNbNF0uZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB0aGlzLmlzU2hvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VzdG9tICkgUm9vdHMucmVtb3ZlTGlzdGVuKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHRoaXMuY1s0XS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG5cclxuICAgIC8vLy8vIEFVVE8gRlBTIC8vLy8vL1xyXG5cclxuICAgIGJlZ2luOiBmdW5jdGlvbigpe1xyXG5cclxuICAgICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMubm93KCk7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIGVuZDogZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdmFyIHRpbWUgPSB0aGlzLm5vdygpO1xyXG4gICAgICAgIHRoaXMubXMgPSB0aW1lIC0gdGhpcy5zdGFydFRpbWU7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVzICsrO1xyXG5cclxuICAgICAgICBpZiAoIHRpbWUgPiB0aGlzLnByZXZUaW1lICsgMTAwMCApIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZnBzID0gdGhpcy5yb3VuZCggKCB0aGlzLmZyYW1lcyAqIDEwMDAgKSAvICggdGltZSAtIHRoaXMucHJldlRpbWUgKSApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmV2VGltZSA9IHRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVzID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICggdGhpcy5pc01lbSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaGVhcFNpemUgPSBwZXJmb3JtYW5jZS5tZW1vcnkudXNlZEpTSGVhcFNpemU7XHJcbiAgICAgICAgICAgICAgICB2YXIgaGVhcFNpemVMaW1pdCA9IHBlcmZvcm1hbmNlLm1lbW9yeS5qc0hlYXBTaXplTGltaXQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW0gPSB0aGlzLnJvdW5kKCBoZWFwU2l6ZSAqIDAuMDAwMDAwOTU0ICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1tID0gaGVhcFNpemUgLyBoZWFwU2l6ZUxpbWl0O1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gWyB0aGlzLmZwcywgdGhpcy5tcyAsIHRoaXMubW0gXTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3R3JhcGgoKTtcclxuICAgICAgICB0aGlzLnVwVGV4dCggWyB0aGlzLmZwcywgdGhpcy5tcywgdGhpcy5tZW0gXSApO1xyXG5cclxuICAgICAgICByZXR1cm4gdGltZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGxpc3RlbmluZzogZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1c3RvbSApIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5lbmQoKTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgclNpemU6IGZ1bmN0aW9uKCl7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG4gICAgICAgIHZhciB3ID0gdGhpcy53O1xyXG5cclxuICAgICAgICBzWzBdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1sxXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IDEwICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gKHctMjApICsgJ3B4JztcclxuICAgICAgICBzWzRdLndpZHRoID0gKHctMjApICsgJ3B4JztcclxuICAgICAgICBcclxuICAgIH0sXHJcbiAgICBcclxufSApO1xyXG5cclxuZXhwb3J0IHsgRnBzIH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmZ1bmN0aW9uIEdyYXBoICggbyApIHtcclxuXHJcblx0UHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuXHR0aGlzLnZhbHVlID0gby52YWx1ZSAhPT0gdW5kZWZpbmVkID8gby52YWx1ZSA6IFswLDAsMF07XHJcbiAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cclxuICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gIT09IHVuZGVmaW5lZCA/IG8ucHJlY2lzaW9uIDogMjtcclxuICAgIHRoaXMubXVsdGlwbGljYXRvciA9IG8ubXVsdGlwbGljYXRvciB8fCAxO1xyXG4gICAgdGhpcy5uZWcgPSBvLm5lZyB8fCBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmxpbmUgPSBvLmxpbmUgIT09IHVuZGVmaW5lZCA/ICBvLmxpbmUgOiB0cnVlO1xyXG5cclxuICAgIC8vaWYodGhpcy5uZWcpdGhpcy5tdWx0aXBsaWNhdG9yKj0yO1xyXG5cclxuICAgIHRoaXMuYXV0b1dpZHRoID0gby5hdXRvV2lkdGggIT09IHVuZGVmaW5lZCA/IG8uYXV0b1dpZHRoIDogdHJ1ZTtcclxuICAgIHRoaXMuaXNOdW1iZXIgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaCA9IG8uaCB8fCAxMjggKyAxMDtcclxuICAgIHRoaXMucmggPSB0aGlzLmggLSAxMDtcclxuICAgIHRoaXMudG9wID0gMDtcclxuXHJcbiAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgeyAvLyB3aXRoIHRpdGxlXHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvL3RoaXMuY1sxXS5zdHlsZS5iYWNrZ3JvdW5kID0gJyNmZjAwMDAnO1xyXG4gICAgICAgIC8vdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmdoID0gdGhpcy5yaCAtIDI4O1xyXG4gICAgdGhpcy5ndyA9IHRoaXMudyAtIDI4O1xyXG5cclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgdmFyIHN2ZyA9IHRoaXMuZG9tKCAnc3ZnJywgdGhpcy5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3RoaXMudysnICcrdGhpcy5yaCwgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy5yaCwgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgdGhpcy5zZXRDc3MoIHN2ZywgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLnJoLCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcbiAgICB0aGlzLmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6dGhpcy5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApO1xyXG4gICAgdGhpcy5kb20oICdyZWN0JywgJycsIHsgeDoxMCwgeToxMCwgd2lkdGg6dGhpcy5ndys4LCBoZWlnaHQ6dGhpcy5naCs4LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjEgLCBmaWxsOidub25lJ30sIHN2ZyApO1xyXG5cclxuICAgIHRoaXMuaXcgPSAoKHRoaXMuZ3ctKDQqKHRoaXMubG5nLTEpKSkvdGhpcy5sbmcpO1xyXG4gICAgdmFyIHQgPSBbXTtcclxuICAgIHRoaXMuY01vZGUgPSBbXTtcclxuXHJcbiAgICB0aGlzLnYgPSBbXTtcclxuXHJcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICBcdHRbaV0gPSBbIDE0ICsgKGkqdGhpcy5pdykgKyAoaSo0KSwgdGhpcy5pdyBdO1xyXG4gICAgXHR0W2ldWzJdID0gdFtpXVswXSArIHRbaV1bMV07XHJcbiAgICBcdHRoaXMuY01vZGVbaV0gPSAwO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5uZWcgKSB0aGlzLnZbaV0gPSAoKDErKHRoaXMudmFsdWVbaV0gLyB0aGlzLm11bHRpcGxpY2F0b3IpKSowLjUpO1xyXG4gICAgXHRlbHNlIHRoaXMudltpXSA9IHRoaXMudmFsdWVbaV0gLyB0aGlzLm11bHRpcGxpY2F0b3I7XHJcblxyXG4gICAgXHR0aGlzLmRvbSggJ3JlY3QnLCAnJywgeyB4OnRbaV1bMF0sIHk6MTQsIHdpZHRoOnRbaV1bMV0sIGhlaWdodDoxLCBmaWxsOnRoaXMuZm9udENvbG9yLCAnZmlsbC1vcGFjaXR5JzowLjMgfSwgc3ZnICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudG1wID0gdDtcclxuICAgIHRoaXMuY1szXSA9IHN2ZztcclxuXHJcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudylcclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICB0aGlzLmNbMV0uc3R5bGUudG9wID0gMCArJ3B4JztcclxuICAgICAgICB0aGlzLmNbMV0uc3R5bGUuaGVpZ2h0ID0gMjAgKydweCc7XHJcbiAgICAgICAgdGhpcy5zWzFdLmxpbmVIZWlnaHQgPSAoMjAtNSkrJ3B4J1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMudXBkYXRlKCBmYWxzZSApO1xyXG5cclxufVxyXG5cclxuR3JhcGgucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogR3JhcGgsXHJcblxyXG4gICAgdXBkYXRlU1ZHOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmxpbmUgKSB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMCApO1xyXG5cclxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpPHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnaGVpZ2h0JywgdGhpcy52W2ldKnRoaXMuZ2gsIGkrMiApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAneScsIDE0ICsgKHRoaXMuZ2ggLSB0aGlzLnZbaV0qdGhpcy5naCksIGkrMiApO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5uZWcgKSB0aGlzLnZhbHVlW2ldID0gKCAoKHRoaXMudltpXSoyKS0xKSAqIHRoaXMubXVsdGlwbGljYXRvciApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMudmFsdWVbaV0gPSAoICh0aGlzLnZbaV0gKiB0aGlzLm11bHRpcGxpY2F0b3IpICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRlc3Rab25lOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHZhciB0ID0gdGhpcy50bXA7XHJcbiAgICAgICAgXHJcblx0ICAgIGlmKCBsLnk+dGhpcy50b3AgJiYgbC55PHRoaXMuaC0yMCApe1xyXG5cdCAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cdCAgICAgICAgICAgIGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpO1xyXG5cdCAgICAgICAgfVxyXG5cdCAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW9kZTogZnVuY3Rpb24gKCBuLCBuYW1lICkge1xyXG5cclxuICAgIFx0aWYoIG4gPT09IHRoaXMuY01vZGVbbmFtZV0gKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHR2YXIgYTtcclxuXHJcbiAgICAgICAgc3dpdGNoKG4pe1xyXG4gICAgICAgICAgICBjYXNlIDA6IGE9MC4zOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiBhPTAuNjsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogYT0xOyBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwtb3BhY2l0eScsIGEsIG5hbWUgKyAyICk7XHJcbiAgICAgICAgdGhpcy5jTW9kZVtuYW1lXSA9IG47XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgXHR2YXIgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgLy90aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICBpZiggdGhpcy5jTW9kZVtpXSAhPT0gMCApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbC1vcGFjaXR5JywgMC4zLCBpICsgMiApO1xyXG4gICAgICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNldXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApIHJldHVybiB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgIFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgXHR2YXIgbnVwID0gZmFsc2U7XHJcblxyXG4gICAgXHR2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoZSk7XHJcblxyXG4gICAgXHRpZiggbmFtZSA9PT0gJycgKXtcclxuXHJcbiAgICAgICAgICAgIG51cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICB9IGVsc2UgeyBcclxuXHJcbiAgICAgICAgICAgIG51cCA9IHRoaXMubW9kZSggdGhpcy5pc0Rvd24gPyAyIDogMSwgbmFtZSApO1xyXG4gICAgICAgICAgICAvL3RoaXMuY3Vyc29yKCB0aGlzLmN1cnJlbnQgIT09IC0xID8gJ21vdmUnIDogJ3BvaW50ZXInICk7XHJcbiAgICAgICAgICAgIGlmKHRoaXMuaXNEb3duKXtcclxuICAgICAgICAgICAgXHR0aGlzLnZbbmFtZV0gPSB0aGlzLmNsYW1wKCAxIC0gKCggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCAtIDEwICkgLyB0aGlzLmdoKSAsIDAsIDEgKTtcclxuICAgICAgICAgICAgXHR0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCB1cCApIHtcclxuXHJcbiAgICBcdHRoaXMudXBkYXRlU1ZHKCk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbWFrZVBhdGg6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBcdHZhciBwID0gXCJcIiwgaCwgdywgd24sIHdtLCBvdywgb2g7XHJcbiAgICBcdC8vdmFyIGcgPSB0aGlzLml3KjAuNVxyXG5cclxuICAgIFx0Zm9yKHZhciBpID0gMDsgaTx0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgXHRcdGggPSAxNCArICh0aGlzLmdoIC0gdGhpcy52W2ldKnRoaXMuZ2gpO1xyXG4gICAgXHRcdHcgPSAoMTQgKyAoaSp0aGlzLml3KSArIChpKjQpKTtcclxuXHJcbiAgICBcdFx0d20gPSB3ICsgdGhpcy5pdyowLjU7XHJcbiAgICBcdFx0d24gPSB3ICsgdGhpcy5pdztcclxuXHJcbiAgICBcdFx0aWYoaT09PTApIHArPSdNICcrdysnICcrIGggKyAnIFQgJyArIHdtICsnICcrIGg7XHJcbiAgICBcdFx0ZWxzZSBwICs9ICcgQyAnICsgb3cgKycgJysgb2ggKyAnLCcgKyB3ICsnICcrIGggKyAnLCcgKyB3bSArJyAnKyBoO1xyXG4gICAgXHRcdGlmKGkgPT09IHRoaXMubG5nLTEpIHArPScgVCAnICsgd24gKycgJysgaDtcclxuXHJcbiAgICBcdFx0b3cgPSB3blxyXG4gICAgXHRcdG9oID0gaCBcclxuXHJcbiAgICBcdH1cclxuXHJcbiAgICBcdHJldHVybiBwO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHNbMV0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG5cclxuICAgICAgICB2YXIgZ3cgPSB0aGlzLncgLSAyODtcclxuICAgICAgICB2YXIgaXcgPSAoKGd3LSg0Kih0aGlzLmxuZy0xKSkpL3RoaXMubG5nKTtcclxuXHJcbiAgICAgICAgdmFyIHQgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB0W2ldID0gWyAxNCArIChpKml3KSArIChpKjQpLCBpdyBdO1xyXG4gICAgICAgICAgICB0W2ldWzJdID0gdFtpXVswXSArIHRbaV1bMV07XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50bXAgPSB0O1xyXG5cclxuICAgIH1cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IEdyYXBoIH07IiwiXHJcbmltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi4vY29yZS9Sb290cyc7XHJcbmltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbi8vaW1wb3J0IHsgYWRkIH0gZnJvbSAnLi4vY29yZS9hZGQnO1xyXG5cclxuZnVuY3Rpb24gR3JvdXAgKCBvICkge1xyXG4gXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG4gICAgdGhpcy5BREQgPSBvLmFkZDtcclxuXHJcbiAgICB0aGlzLnVpcyA9IFtdO1xyXG5cclxuICAgIHRoaXMuYXV0b0hlaWdodCA9IHRydWU7XHJcbiAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLmRlY2FsID0gMDtcclxuXHJcbiAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuICAgIHZhciBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNjtcclxuXHJcbiAgICB0aGlzLmlzTGluZSA9IG8ubGluZSAhPT0gdW5kZWZpbmVkID8gby5saW5lIDogZmFsc2U7XHJcblxyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBsZWZ0OjA7IGhlaWdodDphdXRvOyBvdmVyZmxvdzpoaWRkZW47IHRvcDonK3RoaXMuaCsncHgnKTtcclxuICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAncGF0aCcsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDoxMHB4OyBoZWlnaHQ6MTBweDsgbGVmdDowOyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5ncm91cCwgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG4gICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjEwcHg7IGhlaWdodDoxMHB4OyBsZWZ0OjRweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuYXJyb3csIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuICAgIC8vIGJvdHRvbSBsaW5lXHJcbiAgICBpZih0aGlzLmlzTGluZSkgdGhpcy5jWzVdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICAnYmFja2dyb3VuZDpyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7IHdpZHRoOjEwMCU7IGxlZnQ6MDsgaGVpZ2h0OjFweDsgYm90dG9tOjBweCcpO1xyXG5cclxuICAgIHZhciBzID0gdGhpcy5zO1xyXG5cclxuICAgIHNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgIHNbMV0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgIHRoaXMuY1sxXS5uYW1lID0gJ2dyb3VwJztcclxuXHJcbiAgICBzWzFdLm1hcmdpbkxlZnQgPSAnMTBweCc7XHJcbiAgICBzWzFdLmxpbmVIZWlnaHQgPSB0aGlzLmgtNDtcclxuICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgIHNbMV0uZm9udFdlaWdodCA9ICdib2xkJztcclxuXHJcbiAgICBpZiggdGhpcy5yYWRpdXMgIT09IDAgKSBzWzBdLmJvcmRlclJhZGl1cyA9IHRoaXMucmFkaXVzKydweCc7IFxyXG4gICAgc1swXS5ib3JkZXIgPSB0aGlzLmNvbG9ycy5ncm91cEJvcmRlcjtcclxuXHJcbiAgICBcclxuICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIGlmKCBvLmJnICE9PSB1bmRlZmluZWQgKSB0aGlzLnNldEJHKG8uYmcpO1xyXG4gICAgaWYoIG8ub3BlbiAhPT0gdW5kZWZpbmVkICkgdGhpcy5vcGVuKCk7XHJcblxyXG59XHJcblxyXG5Hcm91cC5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBHcm91cCxcclxuXHJcbiAgICBpc0dyb3VwOiB0cnVlLFxyXG5cclxuICAgIHRlc3Rab25lOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9ICcnO1xyXG5cclxuICAgICAgICBpZiggbC55IDwgdGhpcy5iYXNlSCApIG5hbWUgPSAndGl0bGUnO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW4gKSBuYW1lID0gJ2NvbnRlbnQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5hbWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhclRhcmdldDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ID09PSAtMSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAvLyBpZighdGhpcy50YXJnZXQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnRhcmdldC51aW91dCgpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50OiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciB0eXBlID0gZS50eXBlO1xyXG5cclxuICAgICAgICB2YXIgY2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIHRhcmdldENoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2NvbnRlbnQnOlxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICAgICAgaWYoIFJvb3RzLmlzTW9iaWxlICYmIHR5cGUgPT09ICdtb3VzZWRvd24nICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnRhcmdldCApIHRhcmdldENoYW5nZSA9IHRoaXMudGFyZ2V0LmhhbmRsZUV2ZW50KCBlICk7XHJcblxyXG4gICAgICAgICAgICAvL2lmKCB0eXBlID09PSAnbW91c2Vtb3ZlJyApIGNoYW5nZSA9IHRoaXMuc3R5bGVzKCdkZWYnKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhUm9vdHMubG9jayApIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAndGl0bGUnOlxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICBpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKXtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgaWYoIHRhcmdldENoYW5nZSApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXROZXh0OiBmdW5jdGlvbiAoIGUsIGNoYW5nZSApIHtcclxuXHJcbiAgICAgICAgdmFyIG5leHQgPSBSb290cy5maW5kVGFyZ2V0KCB0aGlzLnVpcywgZSApO1xyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gdGhpcy5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV4dDtcclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSAtMSApeyBcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnVpc1sgdGhpcy5jdXJyZW50IF07XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnVpb3ZlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjYWxjSDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgbG5nID0gdGhpcy51aXMubGVuZ3RoLCBpLCB1LCAgaD0wLCBweD0wLCB0bXBoPTA7XHJcbiAgICAgICAgZm9yKCBpID0gMDsgaSA8IGxuZzsgaSsrKXtcclxuICAgICAgICAgICAgdSA9IHRoaXMudWlzW2ldO1xyXG4gICAgICAgICAgICBpZiggIXUuYXV0b1dpZHRoICl7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYocHg9PT0wKSBoICs9IHUuaCsxO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYodG1waDx1LmgpIGggKz0gdS5oLXRtcGg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0bXBoID0gdS5oO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vdG1waCA9IHRtcGggPCB1LmggPyB1LmggOiB0bXBoO1xyXG4gICAgICAgICAgICAgICAgcHggKz0gdS53O1xyXG4gICAgICAgICAgICAgICAgaWYoIHB4K3UudyA+IHRoaXMudyApIHB4ID0gMDtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBoICs9IHUuaCsxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGg7XHJcbiAgICB9LFxyXG5cclxuICAgIGNhbGNVaXM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHJldHVybjtcclxuXHJcbiAgICAgICAgUm9vdHMuY2FsY1VpcyggdGhpcy51aXMsIHRoaXMuem9uZSwgdGhpcy56b25lLnkgKyB0aGlzLmJhc2VIICk7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgc2V0Qkc6IGZ1bmN0aW9uICggYyApIHtcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmJhY2tncm91bmQgPSBjO1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRCRyggYyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgYSA9IGFyZ3VtZW50cztcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiBhWzFdID09PSAnb2JqZWN0JyApeyBcclxuICAgICAgICAgICAgYVsxXS5pc1VJID0gdGhpcy5pc1VJO1xyXG4gICAgICAgICAgICBhWzFdLnRhcmdldCA9IHRoaXMuY1syXTtcclxuICAgICAgICAgICAgYVsxXS5tYWluID0gdGhpcy5tYWluO1xyXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ3N0cmluZycgKXtcclxuICAgICAgICAgICAgaWYoIGFbMl0gPT09IHVuZGVmaW5lZCApIFtdLnB1c2guY2FsbChhLCB7IGlzVUk6dHJ1ZSwgdGFyZ2V0OnRoaXMuY1syXSwgbWFpbjp0aGlzLm1haW4gfSk7XHJcbiAgICAgICAgICAgIGVsc2V7IFxyXG4gICAgICAgICAgICAgICAgYVsyXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGFbMl0udGFyZ2V0ID0gdGhpcy5jWzJdO1xyXG4gICAgICAgICAgICAgICAgYVsyXS5tYWluID0gdGhpcy5tYWluO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL3ZhciBuID0gYWRkLmFwcGx5KCB0aGlzLCBhICk7XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLkFERC5hcHBseSggdGhpcywgYSApO1xyXG4gICAgICAgIHRoaXMudWlzLnB1c2goIG4gKTtcclxuXHJcbiAgICAgICAgaWYoIG4uYXV0b0hlaWdodCApIG4ucGFyZW50R3JvdXAgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4gbjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHBhcmVudEhlaWdodDogZnVuY3Rpb24gKCB0ICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKSB0aGlzLnBhcmVudEdyb3VwLmNhbGMoIHQgKTtcclxuICAgICAgICBlbHNlIGlmICggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHQgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG9wZW46IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLm9wZW4uY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5hcnJvd0Rvd24gKTtcclxuICAgICAgICB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgICAgICB2YXIgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCB0ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUuY2xvc2UuY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICB2YXIgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93ICk7XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5wYXJlbnRIZWlnaHQoIC10ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNsZWFyR3JvdXAoKTtcclxuICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIC0odGhpcy5oICsxICkpO1xyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5jbGVhci5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhckdyb3VwOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uY2xlYXIoKTtcclxuICAgICAgICAgICAgdGhpcy51aXMucG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWlzID0gW107XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNhbGM6IGZ1bmN0aW9uICggeSApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIHkgIT09IHVuZGVmaW5lZCApeyBcclxuICAgICAgICAgICAgdGhpcy5oICs9IHk7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggeSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaCA9IHRoaXMuY2FsY0goKSArIHRoaXMuYmFzZUg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cclxuICAgICAgICAvL2lmKHRoaXMuaXNPcGVuKSB0aGlzLmNhbGNVaXMoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplQ29udGVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRTaXplKCB0aGlzLncgKTtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uclNpemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByU2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc1szXS5sZWZ0ID0gKCB0aGlzLnNhICsgdGhpcy5zYiAtIDE3ICkgKyAncHgnO1xyXG4gICAgICAgIHNbMV0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKSB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgIH1cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IEdyb3VwIH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmZ1bmN0aW9uIEpveXN0aWNrICggbyApIHtcclxuXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG4gICAgdGhpcy5hdXRvV2lkdGggPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnZhbHVlID0gWzAsMF07XHJcblxyXG4gICAgdGhpcy5qb3lUeXBlID0gJ2FuYWxvZ2lxdWUnO1xyXG4gICAgdGhpcy5tb2RlbCA9IG8ubW9kZSAhPT0gdW5kZWZpbmVkID8gby5tb2RlIDogMDtcclxuXHJcbiAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uIHx8IDI7XHJcbiAgICB0aGlzLm11bHRpcGxpY2F0b3IgPSBvLm11bHRpcGxpY2F0b3IgfHwgMTtcclxuXHJcbiAgICB0aGlzLnBvcyA9IG5ldyBWMigpO1xyXG4gICAgdGhpcy50bXAgPSBuZXcgVjIoKTtcclxuXHJcbiAgICB0aGlzLmludGVydmFsID0gbnVsbDtcclxuXHJcbiAgICB0aGlzLnJhZGl1cyA9IHRoaXMudyAqIDAuNTtcclxuICAgIHRoaXMuZGlzdGFuY2UgPSB0aGlzLnJhZGl1cyowLjI1O1xyXG5cclxuICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMDtcclxuICAgIHRoaXMudG9wID0gMDtcclxuXHJcbiAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgeyAvLyB3aXRoIHRpdGxlXHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICB0aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgdGhpcy5jWzNdID0gdGhpcy5nZXRKb3lzdGljayggdGhpcy5tb2RlbCApO1xyXG4gICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy53KycgJyt0aGlzLncgKTtcclxuICAgIHRoaXMuc2V0Q3NzKCB0aGlzLmNbM10sIHsgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy53LCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcblxyXG4gICAgdGhpcy5yYXRpbyA9IDEyOC90aGlzLnc7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgdGhpcy51cGRhdGUoZmFsc2UpO1xyXG4gICAgXHJcbn1cclxuXHJcbkpveXN0aWNrLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IEpveXN0aWNrLFxyXG5cclxuICAgIG1vZGU6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kZWw9PT0wKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICd1cmwoI2dyYWRJbiknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICcjMDAwJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYmEoMTAwLDEwMCwxMDAsMC4yNSknLCAyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYigwLDAsMCwwLjEpJywgMyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAnIzY2NicsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICdub25lJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIGlmKHRoaXMubW9kZWw9PT0wKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICd1cmwoI2dyYWRJbjIpJywgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiYSgwLDAsMCwwKScsIDQgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2JhKDQ4LDEzOCwyNTUsMC4yNSknLCAyICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYigwLDAsMCwwLjMpJywgMyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmNvbG9ycy5zZWxlY3QsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsICdyZ2JhKDQ4LDEzOCwyNTUsMC4yNSknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXRcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhZGRJbnRlcnZhbDogZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgaWYoIHRoaXMuaW50ZXJ2YWwgIT09IG51bGwgKSB0aGlzLnN0b3BJbnRlcnZhbCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLnBvcy5pc1plcm8oKSApIHJldHVybjtcclxuICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoIGZ1bmN0aW9uKCl7IHRoaXMudXBkYXRlKCk7IH0uYmluZCh0aGlzKSwgMTAgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHN0b3BJbnRlcnZhbDogZnVuY3Rpb24gKCl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoIHRoaXMuaW50ZXJ2YWwgKTtcclxuICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkSW50ZXJ2YWwoKTtcclxuICAgICAgICB0aGlzLm1vZGUoMCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZXVwOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkSW50ZXJ2YWwoKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB0aGlzLm1vZGUoIDIgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMudG1wLnggPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICB0aGlzLnRtcC55ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3AgKTtcclxuXHJcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gdGhpcy50bXAubGVuZ3RoKCk7XHJcblxyXG4gICAgICAgIGlmICggZGlzdGFuY2UgPiB0aGlzLmRpc3RhbmNlICkge1xyXG4gICAgICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKHRoaXMudG1wLngsIHRoaXMudG1wLnkpO1xyXG4gICAgICAgICAgICB0aGlzLnRtcC54ID0gTWF0aC5zaW4oIGFuZ2xlICkgKiB0aGlzLmRpc3RhbmNlO1xyXG4gICAgICAgICAgICB0aGlzLnRtcC55ID0gTWF0aC5jb3MoIGFuZ2xlICkgKiB0aGlzLmRpc3RhbmNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb3MuY29weSggdGhpcy50bXAgKS5kaXZpZGVTY2FsYXIoIHRoaXMuZGlzdGFuY2UgKS5uZWdhdGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFZhbHVlOiBmdW5jdGlvbiAoIHYgKSB7XHJcblxyXG4gICAgICAgIGlmKHY9PT11bmRlZmluZWQpIHY9WzAsMF07XHJcblxyXG4gICAgICAgIHRoaXMucG9zLnNldCggdlswXSB8fCAwLCB2WzFdICB8fCAwICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCB1cCApIHtcclxuXHJcbiAgICAgICAgaWYoIHVwID09PSB1bmRlZmluZWQgKSB1cCA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsICE9PSBudWxsICl7XHJcblxyXG4gICAgICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MubGVycCggbnVsbCwgMC4zICk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MueCA9IE1hdGguYWJzKCB0aGlzLnBvcy54ICkgPCAwLjAxID8gMCA6IHRoaXMucG9zLng7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy55ID0gTWF0aC5hYnMoIHRoaXMucG9zLnkgKSA8IDAuMDEgPyAwIDogdGhpcy5wb3MueTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc1VJICYmIHRoaXMubWFpbi5pc0NhbnZhcyApIHRoaXMubWFpbi5kcmF3KCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnBvcy5pc1plcm8oKSApIHRoaXMuc3RvcEludGVydmFsKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGVTVkc6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdmFyIHggPSB0aGlzLnJhZGl1cyAtICggLXRoaXMucG9zLnggKiB0aGlzLmRpc3RhbmNlICk7XHJcbiAgICAgICAgdmFyIHkgPSB0aGlzLnJhZGl1cyAtICggLXRoaXMucG9zLnkgKiB0aGlzLmRpc3RhbmNlICk7XHJcblxyXG4gICAgICAgICBpZih0aGlzLm1vZGVsID09PSAwKXtcclxuXHJcbiAgICAgICAgICAgIHZhciBzeCA9IHggKyAoKHRoaXMucG9zLngpKjUpICsgNTtcclxuICAgICAgICAgICAgdmFyIHN5ID0geSArICgodGhpcy5wb3MueSkqNSkgKyAxMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHN4KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5Jywgc3kqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHgqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCB5KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCB4KnRoaXMucmF0aW8sIDQgKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCB5KnRoaXMucmF0aW8sIDQgKTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZVswXSA9ICAoIHRoaXMucG9zLnggKiB0aGlzLm11bHRpcGxpY2F0b3IgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuICAgICAgICB0aGlzLnZhbHVlWzFdID0gICggdGhpcy5wb3MueSAqIHRoaXMubXVsdGlwbGljYXRvciApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnN0b3BJbnRlcnZhbCgpXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLmNsZWFyLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICB9LFxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgSm95c3RpY2sgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBDaXJjdWxhciB9IGZyb20gJy4vQ2lyY3VsYXInO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZnVuY3Rpb24gS25vYiAoIG8gKSB7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5idXR0b25Db2xvciA9IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcbiAgICB0aGlzLm1QSSA9IE1hdGguUEkgKiAwLjg7XHJcbiAgICB0aGlzLnRvRGVnID0gMTgwIC8gTWF0aC5QSTtcclxuICAgIHRoaXMuY2lyUmFuZ2UgPSB0aGlzLm1QSSAqIDI7XHJcblxyXG4gICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuXHJcbiAgICB0aGlzLnJhZGl1cyA9IHRoaXMudyAqIDAuNTsvL01hdGguZmxvb3IoKHRoaXMudy0yMCkqMC41KTtcclxuXHJcbiAgICAvL3RoaXMud3cgPSB0aGlzLmhlaWdodCA9IHRoaXMucmFkaXVzICogMjtcclxuICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMDtcclxuICAgIHRoaXMudG9wID0gMDtcclxuXHJcbiAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgaWYodGhpcy5jWzFdICE9PSB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgIHRoaXMuY1sxXS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5wZXJjZW50ID0gMDtcclxuXHJcbiAgICB0aGlzLmNtb2RlID0gMDtcclxuXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOmNlbnRlcjsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyB3aWR0aDonK3RoaXMudysncHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcblxyXG4gICAgdGhpcy5jWzNdID0gdGhpcy5nZXRLbm9iKCk7XHJcbiAgICBcclxuICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmZvbnRDb2xvciwgMSApO1xyXG4gICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAzICk7XHJcbiAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZUdyYWQoKSwgMyApO1xyXG4gICAgXHJcblxyXG4gICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy53dysnICcrdGhpcy53dyApO1xyXG4gICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLncsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuICAgIHRoaXMuciA9IDA7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbn1cclxuXHJcbktub2IucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggQ2lyY3VsYXIucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogS25vYixcclxuXHJcbiAgICBtb2RlOiBmdW5jdGlvbiAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNtb2RlID09PSBtb2RlICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsdGhpcy5jb2xvcnMuYnV0dG9uLCAwKTtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC4yKScsIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuY29sb3JQbHVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLHRoaXMuY29sb3JzLnNlbGVjdCwgMCk7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuNiknLCAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmNvbG9yUGx1cywgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSBtb2RlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIC8vdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgb2ZmID0gdGhpcy5vZmZzZXQ7XHJcblxyXG4gICAgICAgIG9mZi54ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgb2ZmLnkgPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCApO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSAtIE1hdGguYXRhbjIoIG9mZi54LCBvZmYueSApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vbGRyICE9PSBudWxsICkgdGhpcy5yID0gTWF0aC5hYnModGhpcy5yIC0gdGhpcy5vbGRyKSA+IE1hdGguUEkgPyB0aGlzLm9sZHIgOiB0aGlzLnI7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IHRoaXMuciA+IHRoaXMubVBJID8gdGhpcy5tUEkgOiB0aGlzLnI7XHJcbiAgICAgICAgdGhpcy5yID0gdGhpcy5yIDwgLXRoaXMubVBJID8gLXRoaXMubVBJIDogdGhpcy5yO1xyXG5cclxuICAgICAgICB2YXIgc3RlcHMgPSAxIC8gdGhpcy5jaXJSYW5nZTtcclxuICAgICAgICB2YXIgdmFsdWUgPSAodGhpcy5yICsgdGhpcy5tUEkpICogc3RlcHM7XHJcblxyXG4gICAgICAgIHZhciBuID0gKCAoIHRoaXMucmFuZ2UgKiB2YWx1ZSApICsgdGhpcy5taW4gKSAtIHRoaXMub2xkO1xyXG5cclxuICAgICAgICBpZihuID49IHRoaXMuc3RlcCB8fCBuIDw9IHRoaXMuc3RlcCl7IFxyXG4gICAgICAgICAgICBuID0gTWF0aC5mbG9vciggbiAvIHRoaXMuc3RlcCApO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMub2xkciA9IHRoaXMucjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlR3JhZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgZCA9ICcnLCBzdGVwLCByYW5nZSwgYSwgeCwgeSwgeDIsIHkyLCByID0gNjQ7XHJcbiAgICAgICAgdmFyIHN0YXJ0YW5nbGUgPSBNYXRoLlBJICsgdGhpcy5tUEk7XHJcbiAgICAgICAgdmFyIGVuZGFuZ2xlID0gTWF0aC5QSSAtIHRoaXMubVBJO1xyXG4gICAgICAgIC8vdmFyIHN0ZXAgPSB0aGlzLnN0ZXA+NSA/IHRoaXMuc3RlcCA6IDE7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuc3RlcD41KXtcclxuICAgICAgICAgICAgcmFuZ2UgPSAgdGhpcy5yYW5nZSAvIHRoaXMuc3RlcDtcclxuICAgICAgICAgICAgc3RlcCA9ICggc3RhcnRhbmdsZSAtIGVuZGFuZ2xlICkgLyByYW5nZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGVwID0gKCggc3RhcnRhbmdsZSAtIGVuZGFuZ2xlICkgLyByKSoyO1xyXG4gICAgICAgICAgICByYW5nZSA9IHIqMC41O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDw9IHJhbmdlOyArK2kgKSB7XHJcblxyXG4gICAgICAgICAgICBhID0gc3RhcnRhbmdsZSAtICggc3RlcCAqIGkgKTtcclxuICAgICAgICAgICAgeCA9IHIgKyBNYXRoLnNpbiggYSApICogKCByIC0gMjAgKTtcclxuICAgICAgICAgICAgeSA9IHIgKyBNYXRoLmNvcyggYSApICogKCByIC0gMjAgKTtcclxuICAgICAgICAgICAgeDIgPSByICsgTWF0aC5zaW4oIGEgKSAqICggciAtIDI0ICk7XHJcbiAgICAgICAgICAgIHkyID0gciArIE1hdGguY29zKCBhICkgKiAoIHIgLSAyNCApO1xyXG4gICAgICAgICAgICBkICs9ICdNJyArIHggKyAnICcgKyB5ICsgJyBMJyArIHgyICsgJyAnK3kyICsgJyAnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoIHVwICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMucGVyY2VudCA9ICh0aGlzLnZhbHVlIC0gdGhpcy5taW4pIC8gdGhpcy5yYW5nZTtcclxuXHJcbiAgICAgICAvLyB2YXIgciA9IDUwO1xyXG4gICAgICAgLy8gdmFyIGQgPSA2NDsgXHJcbiAgICAgICAgdmFyIHIgPSAoICh0aGlzLnBlcmNlbnQgKiB0aGlzLmNpclJhbmdlKSAtICh0aGlzLm1QSSkpLy8qIHRoaXMudG9EZWc7XHJcblxyXG4gICAgICAgIHZhciBzaW4gPSBNYXRoLnNpbihyKTtcclxuICAgICAgICB2YXIgY29zID0gTWF0aC5jb3Mocik7XHJcblxyXG4gICAgICAgIHZhciB4MSA9ICgyNSAqIHNpbikgKyA2NDtcclxuICAgICAgICB2YXIgeTEgPSAtKDI1ICogY29zKSArIDY0O1xyXG4gICAgICAgIHZhciB4MiA9ICgyMCAqIHNpbikgKyA2NDtcclxuICAgICAgICB2YXIgeTIgPSAtKDIwICogY29zKSArIDY0O1xyXG5cclxuICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHgsIDEgKTtcclxuICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHksIDEgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCAnTSAnICsgeDEgKycgJyArIHkxICsgJyBMICcgKyB4MiArJyAnICsgeTIsIDEgKTtcclxuXHJcbiAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndHJhbnNmb3JtJywgJ3JvdGF0ZSgnKyByICsnICcrNjQrJyAnKzY0KycpJywgMSApO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBLbm9iIH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmZ1bmN0aW9uIExpc3QgKCBvICkge1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICAvLyBpbWFnZXNcclxuICAgIHRoaXMucGF0aCA9IG8ucGF0aCB8fCAnJztcclxuICAgIHRoaXMuZm9ybWF0ID0gby5mb3JtYXQgfHwgJyc7XHJcbiAgICB0aGlzLmltYWdlU2l6ZSA9IG8uaW1hZ2VTaXplIHx8IFsyMCwyMF07XHJcblxyXG4gICAgdGhpcy5pc1dpdGhJbWFnZSA9IHRoaXMucGF0aCAhPT0gJycgPyB0cnVlOmZhbHNlO1xyXG4gICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLnRtcEltYWdlID0ge307XHJcbiAgICB0aGlzLnRtcFVybCA9IFtdO1xyXG5cclxuICAgIHRoaXMuYXV0b0hlaWdodCA9IGZhbHNlO1xyXG4gICAgdmFyIGFsaWduID0gby5hbGlnbiB8fCAnY2VudGVyJztcclxuXHJcbiAgICB0aGlzLnNNb2RlID0gMDtcclxuICAgIHRoaXMudE1vZGUgPSAwO1xyXG5cclxuICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgdmFyIGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS01O1xyXG5cclxuICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjA7IGRpc3BsYXk6bm9uZTsnICk7XHJcbiAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOicrYWxpZ24rJzsgbGluZS1oZWlnaHQ6JysodGhpcy5oLTQpKydweDsgdG9wOjFweDsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjEwcHg7IGhlaWdodDoxMHB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5hcnJvdywgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgIHRoaXMuc2Nyb2xsZXIgPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3JpZ2h0OjVweDsgIHdpZHRoOjEwcHg7IGJhY2tncm91bmQ6IzY2NjsgZGlzcGxheTpub25lOycpO1xyXG5cclxuICAgIHRoaXMuY1szXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG5cclxuICAgIHRoaXMubGlzdCA9IG8ubGlzdCB8fCBbXTtcclxuICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuXHJcbiAgICB0aGlzLnByZXZOYW1lID0gJyc7XHJcblxyXG4gICAgdGhpcy5iYXNlSCA9IHRoaXMuaDtcclxuXHJcbiAgICB0aGlzLml0ZW1IZWlnaHQgPSBvLml0ZW1IZWlnaHQgfHwgKHRoaXMuaC0zKTtcclxuXHJcbiAgICAvLyBmb3JjZSBmdWxsIGxpc3QgXHJcbiAgICB0aGlzLmZ1bGwgPSBvLmZ1bGwgfHwgZmFsc2U7XHJcblxyXG4gICAgdGhpcy5weSA9IDA7XHJcbiAgICB0aGlzLnd3ID0gdGhpcy5zYjtcclxuICAgIHRoaXMuc2Nyb2xsID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuY3VycmVudCA9IG51bGw7XHJcblxyXG4gICAgLy8gbGlzdCB1cCBvciBkb3duXHJcbiAgICB0aGlzLnNpZGUgPSBvLnNpZGUgfHwgJ2Rvd24nO1xyXG4gICAgdGhpcy51cCA9IHRoaXMuc2lkZSA9PT0gJ2Rvd24nID8gMCA6IDE7XHJcblxyXG4gICAgaWYoIHRoaXMudXAgKXtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICB0aGlzLmNbM10uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG4gICAgICAgIHRoaXMuY1s0XS5zdHlsZS50b3AgPSAnYXV0byc7XHJcbiAgICAgICAgLy90aGlzLmNbNV0uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuYm90dG9tID0gdGhpcy5oLTIgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1szXS5zdHlsZS5ib3R0b20gPSAnMXB4JztcclxuICAgICAgICB0aGlzLmNbNF0uc3R5bGUuYm90dG9tID0gZmx0b3AgKyAncHgnO1xyXG4gICAgICAgIC8vdGhpcy5jWzVdLnN0eWxlLmJvdHRvbSA9ICcycHgnO1xyXG5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9IHRoaXMuYmFzZUggKyAncHgnO1xyXG4gICAgICAgIC8vdGhpcy5jWzZdLnN0eWxlLnRvcCA9IHRoaXMuaCArICdweCc7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5saXN0SW4gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2xlZnQ6MDsgdG9wOjA7IHdpZHRoOjEwMCU7IGJhY2tncm91bmQ6cmdiYSgwLDAsMCwwLjIpOycpO1xyXG4gICAgdGhpcy5saXN0SW4ubmFtZSA9ICdsaXN0JztcclxuXHJcbiAgICB0aGlzLnRvcExpc3QgPSAwO1xyXG4gICAgXHJcbiAgICB0aGlzLmNbMl0uYXBwZW5kQ2hpbGQoIHRoaXMubGlzdEluICk7XHJcbiAgICB0aGlzLmNbMl0uYXBwZW5kQ2hpbGQoIHRoaXMuc2Nyb2xsZXIgKTtcclxuXHJcbiAgICBpZiggby52YWx1ZSAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgaWYoIWlzTmFOKG8udmFsdWUpKSB0aGlzLnZhbHVlID0gdGhpcy5saXN0WyBvLnZhbHVlIF07XHJcbiAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gby52YWx1ZTtcclxuICAgIH1lbHNle1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbMF07XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5pc09wZW5PblN0YXJ0ID0gby5vcGVuIHx8IGZhbHNlO1xyXG5cclxuICAgIFxyXG5cclxuICAgIC8vdGhpcy5jWzBdLnN0eWxlLmJhY2tncm91bmQgPSAnI0ZGMDAwMCdcclxuICAgIGlmKCB0aGlzLmlzV2l0aEltYWdlICkgdGhpcy5wcmVsb2FkSW1hZ2UoKTtcclxuICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAvLyBwb3B1bGF0ZSBsaXN0XHJcbiAgICAgICAgdGhpcy5zZXRMaXN0KCB0aGlzLmxpc3QgKTtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICBpZiggdGhpcy5pc09wZW5PblN0YXJ0ICkgdGhpcy5vcGVuKCk7XHJcbiAgIC8vIH1cclxuXHJcbn1cclxuXHJcbkxpc3QucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogTGlzdCxcclxuXHJcbiAgICAvLyBpbWFnZSBsaXN0XHJcblxyXG4gICAgcHJlbG9hZEltYWdlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMucHJlTG9hZENvbXBsZXRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudG1wSW1hZ2UgPSB7fTtcclxuICAgICAgICBmb3IoIHZhciBpPTA7IGk8dGhpcy5saXN0Lmxlbmd0aDsgaSsrICkgdGhpcy50bXBVcmwucHVzaCggdGhpcy5saXN0W2ldICk7XHJcbiAgICAgICAgdGhpcy5sb2FkT25lKCk7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIG5leHRJbWc6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy50bXBVcmwuc2hpZnQoKTtcclxuICAgICAgICBpZiggdGhpcy50bXBVcmwubGVuZ3RoID09PSAwICl7IFxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRJbWFnZXMoKTtcclxuICAgICAgICAgICAgLyp0aGlzLnNldExpc3QoIHRoaXMubGlzdCApO1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuT25TdGFydCApIHRoaXMub3BlbigpOyovXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHRoaXMubG9hZE9uZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbG9hZE9uZTogZnVuY3Rpb24oKXtcclxuXHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzXHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnRtcFVybFswXTtcclxuICAgICAgICB2YXIgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAgICAgaW1nLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOicrc2VsZi5pbWFnZVNpemVbMF0rJ3B4OyBoZWlnaHQ6JytzZWxmLmltYWdlU2l6ZVsxXSsncHgnO1xyXG4gICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIHRoaXMucGF0aCArIG5hbWUgKyB0aGlzLmZvcm1hdCApO1xyXG5cclxuICAgICAgICBpbWcuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgc2VsZi5pbWFnZVNpemVbMl0gPSBpbWcud2lkdGg7XHJcbiAgICAgICAgICAgIHNlbGYuaW1hZ2VTaXplWzNdID0gaW1nLmhlaWdodDtcclxuICAgICAgICAgICAgc2VsZi50bXBJbWFnZVtuYW1lXSA9IGltZztcclxuICAgICAgICAgICAgc2VsZi5uZXh0SW1nKCk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy9cclxuXHJcbiAgICB0ZXN0Wm9uZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudXAgJiYgdGhpcy5pc09wZW4gKXtcclxuICAgICAgICAgICAgaWYoIGwueSA+IHRoaXMuaCAtIHRoaXMuYmFzZUggKSByZXR1cm4gJ3RpdGxlJztcclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnNjcm9sbCAmJiAoIGwueCA+ICh0aGlzLnNhK3RoaXMuc2ItMjApKSApIHJldHVybiAnc2Nyb2xsJztcclxuICAgICAgICAgICAgICAgIGlmKGwueCA+IHRoaXMuc2EpIHJldHVybiB0aGlzLnRlc3RJdGVtcyggbC55LXRoaXMuYmFzZUggKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggbC55IDwgdGhpcy5iYXNlSCsyICkgcmV0dXJuICd0aXRsZSc7XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc09wZW4gKXtcclxuICAgICAgICAgICAgICAgICAgICBpZiggdGhpcy5zY3JvbGwgJiYgKCBsLnggPiAodGhpcy5zYSt0aGlzLnNiLTIwKSkgKSByZXR1cm4gJ3Njcm9sbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYobC54ID4gdGhpcy5zYSkgcmV0dXJuIHRoaXMudGVzdEl0ZW1zKCBsLnktdGhpcy5iYXNlSCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdGVzdEl0ZW1zOiBmdW5jdGlvbiAoIHkgKSB7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy5pdGVtcy5sZW5ndGgsIGl0ZW0sIGEsIGI7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgaXRlbSA9IHRoaXMuaXRlbXNbaV07XHJcbiAgICAgICAgICAgIGEgPSBpdGVtLnBvc3kgKyB0aGlzLnRvcExpc3Q7XHJcbiAgICAgICAgICAgIGIgPSBpdGVtLnBvc3kgKyB0aGlzLml0ZW1IZWlnaHQgKyAxICsgdGhpcy50b3BMaXN0O1xyXG4gICAgICAgICAgICBpZiggeSA+PSBhICYmIHkgPD0gYiApeyBcclxuICAgICAgICAgICAgICAgIG5hbWUgPSAnaXRlbScgKyBpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVuU2VsZWN0ZWQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuYmFja2dyb3VuZCA9ICdyZ2JhKDAsMCwwLDAuMiknO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZWxlY3RlZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICB0aGlzLmN1cnJlbnQuc3R5bGUuY29sb3IgPSAnI0ZGRic7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3Njcm9sbCcgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lID09PSAndGl0bGUnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgyKTtcclxuICAgICAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHRoaXMub3BlbigpO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5saXN0W3RoaXMuY3VycmVudC5pZF1cclxuICAgICAgICAgICAgICAgIC8vdGhpcy52YWx1ZSA9IHRoaXMuY3VycmVudC50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBudXA7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGl0bGUnICl7XHJcbiAgICAgICAgICAgIHRoaXMudW5TZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgxKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3MtcmVzaXplJyk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZVNjcm9sbCgxKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMik7XHJcbiAgICAgICAgICAgICAgICB2YXIgdG9wID0gdGhpcy56b25lLnkrdGhpcy5iYXNlSC0yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoICggZS5jbGllbnRZIC0gdG9wICApIC0gKCB0aGlzLnNoKjAuNSApICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9pZih0aGlzLmlzRG93bikgdGhpcy5saXN0bW92ZShlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gaXMgaXRlbVxyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgwKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDApO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5hbWUgIT09IHRoaXMucHJldk5hbWUgKSBudXAgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucHJldk5hbWUgPSBuYW1lO1xyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgd2hlZWw6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0aXRsZScgKSByZXR1cm4gZmFsc2U7IFxyXG4gICAgICAgIHRoaXMucHkgKz0gZS5kZWx0YSoxMDtcclxuICAgICAgICB0aGlzLnVwZGF0ZSh0aGlzLnB5KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMucHJldk5hbWUgPSAnJztcclxuICAgICAgICB0aGlzLnVuU2VsZWN0ZWQoKTtcclxuICAgICAgICB0aGlzLm1vZGVUaXRsZSgwKTtcclxuICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMCk7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIG1vZGVTY3JvbGw6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIG1vZGUgPT09IHRoaXMuc01vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNNb2RlID0gbW9kZTtcclxuICAgIH0sXHJcblxyXG4gICAgbW9kZVRpdGxlOiBmdW5jdGlvbiAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBtb2RlID09PSB0aGlzLnRNb2RlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHNbM10uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHNbM10uY29sb3IgPSAnI0ZGRic7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRNb2RlID0gbW9kZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyTGlzdDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB3aGlsZSAoIHRoaXMubGlzdEluLmNoaWxkcmVuLmxlbmd0aCApIHRoaXMubGlzdEluLnJlbW92ZUNoaWxkKCB0aGlzLmxpc3RJbi5sYXN0Q2hpbGQgKTtcclxuICAgICAgICB0aGlzLml0ZW1zID0gW107XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRMaXN0OiBmdW5jdGlvbiAoIGxpc3QgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdCA9IGxpc3Q7XHJcbiAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG5cclxuICAgICAgICB0aGlzLm1heEl0ZW0gPSB0aGlzLmZ1bGwgPyB0aGlzLmxlbmd0aCA6IDU7XHJcbiAgICAgICAgdGhpcy5tYXhJdGVtID0gdGhpcy5sZW5ndGggPCB0aGlzLm1heEl0ZW0gPyB0aGlzLmxlbmd0aCA6IHRoaXMubWF4SXRlbTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWlnaHQgPSB0aGlzLm1heEl0ZW0gKiAodGhpcy5pdGVtSGVpZ2h0KzEpICsgMjtcclxuXHJcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmxlbmd0aCAqICh0aGlzLml0ZW1IZWlnaHQrMSkgKyAyO1xyXG4gICAgICAgIHRoaXMucmF0aW8gPSB0aGlzLm1heEhlaWdodCAvIHRoaXMubWF4O1xyXG4gICAgICAgIHRoaXMuc2ggPSB0aGlzLm1heEhlaWdodCAqIHRoaXMucmF0aW87XHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4SGVpZ2h0IC0gdGhpcy5zaDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9IHRoaXMubWF4SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmhlaWdodCA9IHRoaXMuc2ggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5tYXggPiB0aGlzLm1heEhlaWdodCApeyBcclxuICAgICAgICAgICAgdGhpcy53dyA9IHRoaXMuc2IgLSAyMDtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGl0ZW0sIG47Ly8sIGwgPSB0aGlzLnNiO1xyXG4gICAgICAgIGZvciggdmFyIGk9MDsgaTx0aGlzLmxlbmd0aDsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBuID0gdGhpcy5saXN0W2ldO1xyXG4gICAgICAgICAgICBpdGVtID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5pdGVtICsgJ3dpZHRoOicrdGhpcy53dysncHg7IGhlaWdodDonK3RoaXMuaXRlbUhlaWdodCsncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaXRlbUhlaWdodC01KSsncHg7IGNvbG9yOicrdGhpcy5mb250Q29sb3IrJzsnICk7XHJcbiAgICAgICAgICAgIGl0ZW0ubmFtZSA9ICdpdGVtJytpO1xyXG4gICAgICAgICAgICBpdGVtLmlkID0gaTtcclxuICAgICAgICAgICAgaXRlbS5wb3N5ID0gKHRoaXMuaXRlbUhlaWdodCsxKSppO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RJbi5hcHBlbmRDaGlsZCggaXRlbSApO1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goIGl0ZW0gKTtcclxuXHJcbiAgICAgICAgICAgIC8vaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKSBpdGVtLmFwcGVuZENoaWxkKCB0aGlzLnRtcEltYWdlW25dICk7XHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5pc1dpdGhJbWFnZSApIGl0ZW0udGV4dENvbnRlbnQgPSBuO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRJbWFnZXM6IGZ1bmN0aW9uICgpe1xyXG4gICAgICAgIHZhciBsbmcgPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG4gICAgICAgIGZvciggdmFyIGk9MDsgaTxsbmc7IGkrKyApe1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldLmFwcGVuZENoaWxkKCB0aGlzLnRtcEltYWdlW3RoaXMubGlzdFtpXV0gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRUb3BJdGVtKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHNldFRvcEl0ZW06IGZ1bmN0aW9uICgpe1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1dpdGhJbWFnZSApeyBcclxuXHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5wcmVMb2FkQ29tcGxldGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZighdGhpcy5jWzNdLmNoaWxkcmVuLmxlbmd0aCl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmltYWdlU2l6ZVswXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaW1hZ2VTaXplWzFdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjphYnNvbHV0ZTsgdG9wOjBweDsgbGVmdDowcHg7J1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbM10uYXBwZW5kQ2hpbGQoIHRoaXMuY2FudmFzICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBpbWcgPSB0aGlzLnRtcEltYWdlWyB0aGlzLnZhbHVlIF07XHJcbiAgICAgICAgICAgIHRoaXMuY3R4LmRyYXdJbWFnZSggdGhpcy50bXBJbWFnZVsgdGhpcy52YWx1ZSBdLCAwLCAwLCB0aGlzLmltYWdlU2l6ZVsyXSwgdGhpcy5pbWFnZVNpemVbM10sIDAsMCwgdGhpcy5pbWFnZVNpemVbMF0sIHRoaXMuaW1hZ2VTaXplWzFdICk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgLy8gLS0tLS0gTElTVFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCB5ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuc2Nyb2xsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB5ID0geSA8IDAgPyAwIDogeTtcclxuICAgICAgICB5ID0geSA+IHRoaXMucmFuZ2UgPyB0aGlzLnJhbmdlIDogeTtcclxuXHJcbiAgICAgICAgdGhpcy50b3BMaXN0ID0gLU1hdGguZmxvb3IoIHkgLyB0aGlzLnJhdGlvICk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdEluLnN0eWxlLnRvcCA9IHRoaXMudG9wTGlzdCsncHgnO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUudG9wID0gTWF0aC5mbG9vciggeSApICArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMucHkgPSB5O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcGFyZW50SGVpZ2h0OiBmdW5jdGlvbiAoIHQgKSB7XHJcblxyXG4gICAgICAgIGlmICggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApIHRoaXMucGFyZW50R3JvdXAuY2FsYyggdCApO1xyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUub3Blbi5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCAwICk7XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5tYXhIZWlnaHQgKyB0aGlzLmJhc2VIICsgNTtcclxuICAgICAgICBpZiggIXRoaXMuc2Nyb2xsICl7XHJcbiAgICAgICAgICAgIHRoaXMudG9wTGlzdCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUggKyA1ICsgdGhpcy5tYXg7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICl7IFxyXG4gICAgICAgICAgICB0aGlzLnpvbmUueSAtPSB0aGlzLmggLSAodGhpcy5iYXNlSC0xMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93VXAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5hcnJvd0Rvd24gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgICAgIHZhciB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCB0ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9zZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUuY2xvc2UuY2FsbCggdGhpcyApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCApIHRoaXMuem9uZS55ICs9IHRoaXMuaCAtICh0aGlzLmJhc2VILTEwKTtcclxuXHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93ICk7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tXHJcblxyXG4gICAgdGV4dDogZnVuY3Rpb24gKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplQ29udGVudDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy5saXN0SW4uY2hpbGRyZW5baV0uc3R5bGUud2lkdGggPSB0aGlzLnd3ICsgJ3B4JztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG4gICAgICAgIHZhciB3ID0gdGhpcy5zYjtcclxuICAgICAgICB2YXIgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIGlmKHNbMl09PT0gdW5kZWZpbmVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHNbMl0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSBkICsncHgnO1xyXG5cclxuICAgICAgICBzWzNdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gZCArICdweCc7XHJcblxyXG4gICAgICAgIHNbNF0ubGVmdCA9IGQgKyB3IC0gMTcgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnd3ID0gdztcclxuICAgICAgICBpZiggdGhpcy5tYXggPiB0aGlzLm1heEhlaWdodCApIHRoaXMud3cgPSB3LTIwO1xyXG4gICAgICAgIGlmKHRoaXMuaXNPcGVuKSB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgIH1cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IExpc3QgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZnVuY3Rpb24gTnVtZXJpYyggbyApe1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcbiAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy52YWx1ZSA9IFswXTtcclxuICAgIHRoaXMudG9SYWQgPSAxO1xyXG4gICAgdGhpcy5pc051bWJlciA9IHRydWU7XHJcbiAgICB0aGlzLmlzQW5nbGUgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNWZWN0b3IgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmlzRHJhZyA9IG8uZHJhZyB8fCBmYWxzZTtcclxuXHJcbiAgICBpZiggby52YWx1ZSAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgaWYoIWlzTmFOKG8udmFsdWUpKXsgdGhpcy52YWx1ZSA9IFtvLnZhbHVlXTt9XHJcbiAgICAgICAgZWxzZSBpZihvLnZhbHVlIGluc3RhbmNlb2YgQXJyYXkgKXsgdGhpcy52YWx1ZSA9IG8udmFsdWU7IHRoaXMuaXNOdW1iZXI9ZmFsc2U7fVxyXG4gICAgICAgIGVsc2UgaWYoby52YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCApeyBcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xyXG4gICAgICAgICAgICBpZihvLnZhbHVlLngpIHRoaXMudmFsdWVbMF0gPSBvLnZhbHVlLng7XHJcbiAgICAgICAgICAgIGlmKG8udmFsdWUueSkgdGhpcy52YWx1ZVsxXSA9IG8udmFsdWUueTtcclxuICAgICAgICAgICAgaWYoby52YWx1ZS56KSB0aGlzLnZhbHVlWzJdID0gby52YWx1ZS56O1xyXG4gICAgICAgICAgICBpZihvLnZhbHVlLncpIHRoaXMudmFsdWVbM10gPSBvLnZhbHVlLnc7XHJcbiAgICAgICAgICAgIHRoaXMuaXNWZWN0b3IgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG4gICAgdGhpcy50bXAgPSBbXTtcclxuXHJcbiAgICBpZihvLmlzQW5nbGUpe1xyXG4gICAgICAgIHRoaXMuaXNBbmdsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy50b1JhZCA9IE1hdGguUEkvMTgwO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgdGhpcy5wcmV2ID0geyB4OjAsIHk6MCwgZDowLCB2OjAgfTtcclxuXHJcbiAgICAvLyBiZ1xyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcnMuc2VsZWN0ICsgJzsgdG9wOjRweDsgd2lkdGg6MHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7JyApO1xyXG5cclxuICAgIHRoaXMuY01vZGUgPSBbXTtcclxuICAgIFxyXG4gICAgdmFyIGkgPSB0aGlzLmxuZztcclxuICAgIHdoaWxlKGktLSl7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuaXNBbmdsZSkgdGhpcy52YWx1ZVtpXSA9ICh0aGlzLnZhbHVlW2ldICogMTgwIC8gTWF0aC5QSSkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKTtcclxuICAgICAgICB0aGlzLmNbMytpXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJyBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsgbGluZS1oZWlnaHQ6JysodGhpcy5oLTgpKydweDsnKTsvL2xldHRlci1zcGFjaW5nOi0xcHg7XHJcbiAgICAgICAgaWYoby5jZW50ZXIpIHRoaXMuY1syK2ldLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgIHRoaXMuY1szK2ldLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVtpXTtcclxuICAgICAgICB0aGlzLmNbMytpXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHRoaXMuY1szK2ldLmlzTnVtID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGN1cnNvclxyXG4gICAgdGhpcy5jdXJzb3JJZCA9IDMgKyB0aGlzLmxuZztcclxuICAgIHRoaXMuY1sgdGhpcy5jdXJzb3JJZCBdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd0b3A6NHB4OyBoZWlnaHQ6JyArICh0aGlzLmgtOCkgKyAncHg7IHdpZHRoOjBweDsgYmFja2dyb3VuZDonK3RoaXMuZm9udENvbG9yKyc7JyApO1xyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG59XHJcblxyXG5OdW1lcmljLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IE51bWVyaWMsXHJcblxyXG4gICAgdGVzdFpvbmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgdmFyIHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgLyogbW9kZTogZnVuY3Rpb24gKCBuLCBuYW1lICkge1xyXG5cclxuICAgICAgICBpZiggbiA9PT0gdGhpcy5jTW9kZVtuYW1lXSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgLy92YXIgbTtcclxuXHJcbiAgICAgICAgLypzd2l0Y2gobil7XHJcblxyXG4gICAgICAgICAgICBjYXNlIDA6IG0gPSB0aGlzLmNvbG9ycy5ib3JkZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IG0gPSB0aGlzLmNvbG9ycy5ib3JkZXJPdmVyOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiBtID0gdGhpcy5jb2xvcnMuYm9yZGVyU2VsZWN0OyAgYnJlYWs7XHJcblxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgLyogICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgICAvL3RoaXMuY1tuYW1lKzJdLnN0eWxlLmJvcmRlckNvbG9yID0gbTtcclxuICAgICAgICB0aGlzLmNNb2RlW25hbWVdID0gbjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYoIG5hbWUgIT09ICcnICl7IFxyXG4gICAgICAgICAgICBcdHRoaXMuY3VycmVudCA9IG5hbWU7XHJcbiAgICAgICAgICAgIFx0dGhpcy5wcmV2ID0geyB4OmUuY2xpZW50WCwgeTplLmNsaWVudFksIGQ6MCwgdjogdGhpcy5pc051bWJlciA/IHBhcnNlRmxvYXQodGhpcy52YWx1ZSkgOiBwYXJzZUZsb2F0KCB0aGlzLnZhbHVlWyB0aGlzLmN1cnJlbnQgXSApICB9O1xyXG4gICAgICAgICAgICBcdHRoaXMuc2V0SW5wdXQoIHRoaXMuY1sgMyArIHRoaXMuY3VycmVudCBdICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLypcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICcnICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmFtZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMucHJldiA9IHsgeDplLmNsaWVudFgsIHk6ZS5jbGllbnRZLCBkOjAsIHY6IHRoaXMuaXNOdW1iZXIgPyBwYXJzZUZsb2F0KHRoaXMudmFsdWUpIDogcGFyc2VGbG9hdCggdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gKSAgfTtcclxuXHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoIDIsIG5hbWUgKTsqL1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2V1cDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgIFx0aWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvL3RoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLnByZXYgPSB7IHg6MCwgeTowLCBkOjAsIHY6MCB9O1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIC8qdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCAhPT0gLTEgKXsgXHJcblxyXG4gICAgICAgICAgICAvL3ZhciB0bSA9IHRoaXMuY3VycmVudDtcclxuICAgICAgICAgICAgdmFyIHRkID0gdGhpcy5wcmV2LmQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5wcmV2ID0geyB4OjAsIHk6MCwgZDowLCB2OjAgfTtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhdGQgKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldElucHV0KCB0aGlzLmNbIDMgKyBuYW1lIF0gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOy8vdGhpcy5tb2RlKCAyLCBuYW1lICk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzZXQoKTsvL3RoaXMubW9kZSggMCwgdG0gKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9Ki9cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIHggPSAwO1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICcnICkgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICBlbHNleyBcclxuICAgICAgICBcdGlmKCF0aGlzLmlzRHJhZykgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICBcdGVsc2UgdGhpcy5jdXJzb3IoIHRoaXMuY3VycmVudCAhPT0gLTEgPyAnbW92ZScgOiAncG9pbnRlcicgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0RyYWcgKXtcclxuICAgICAgICBcdGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICl7XHJcblxyXG4gICAgICAgIFx0dGhpcy5wcmV2LmQgKz0gKCBlLmNsaWVudFggLSB0aGlzLnByZXYueCApIC0gKCBlLmNsaWVudFkgLSB0aGlzLnByZXYueSApO1xyXG5cclxuICAgICAgICAgICAgdmFyIG4gPSB0aGlzLnByZXYudiArICggdGhpcy5wcmV2LmQgKiB0aGlzLnN0ZXApO1xyXG5cclxuICAgICAgICAgICAgdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gPSB0aGlzLm51bVZhbHVlKG4pO1xyXG4gICAgICAgICAgICB0aGlzLmNbIDMgKyB0aGlzLmN1cnJlbnQgXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbdGhpcy5jdXJyZW50XTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudmFsaWRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJldi54ID0gZS5jbGllbnRYO1xyXG4gICAgICAgICAgICB0aGlzLnByZXYueSA9IGUuY2xpZW50WTtcclxuXHJcbiAgICAgICAgICAgIG51cCA9IHRydWU7XHJcbiAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIFx0aWYoIHRoaXMuaXNEb3duICkgeCA9IGUuY2xpZW50WCAtIHRoaXMuem9uZS54IC0zO1xyXG4gICAgICAgIFx0aWYoIHRoaXMuY3VycmVudCAhPT0gLTEgKSB4IC09IHRoaXMudG1wW3RoaXMuY3VycmVudF1bMF1cclxuICAgICAgICBcdHJldHVybiB0aGlzLnVwSW5wdXQoIHgsIHRoaXMuaXNEb3duICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy9rZXlkb3duOiBmdW5jdGlvbiAoIGUgKSB7IHJldHVybiB0cnVlOyB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgLy90aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL3RoaXMuY3VycmVudCA9IDA7XHJcblxyXG4gICAgICAgLyogdmFyIGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICAgICAgaWYodGhpcy5jTW9kZVtpXSE9PTApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jTW9kZVtpXSA9IDA7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuY1syK2ldLnN0eWxlLmJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9yZGVyO1xyXG4gICAgICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIHNldFZhbHVlOiBmdW5jdGlvbiAoIHYsIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDA7XHJcbiAgICAgICAgdGhpcy52YWx1ZVtuXSA9IHRoaXMubnVtVmFsdWUoIHYgKTtcclxuICAgICAgICB0aGlzLmNbIDMgKyBuIF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW25dO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3Q6IGZ1bmN0aW9uICggYywgZSwgdyApIHtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgdmFyIGQgPSB0aGlzLmN1cnJlbnQgIT09IC0xID8gdGhpcy50bXBbdGhpcy5jdXJyZW50XVswXSArIDUgOiAwO1xyXG4gICAgICAgIHNbdGhpcy5jdXJzb3JJZF0ud2lkdGggPSAnMXB4JztcclxuICAgICAgICBzW3RoaXMuY3Vyc29ySWRdLmxlZnQgPSAoIGQgKyBjICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICggZCArIGUgKSArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgXHJcbiAgICB9LFxyXG5cclxuICAgIHVuc2VsZWN0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAwICsgJ3B4JztcclxuICAgICAgICBzW3RoaXMuY3Vyc29ySWRdLndpZHRoID0gMCArICdweCc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB2YWxpZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgYXIgPSBbXTtcclxuICAgICAgICB2YXIgaSA9IHRoaXMubG5nO1xyXG5cclxuICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICBcdFxyXG4gICAgICAgIFx0aWYoIWlzTmFOKCB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgKSl7IFxyXG4gICAgICAgICAgICAgICAgdmFyIG54ID0gdGhpcy5udW1WYWx1ZSggdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgPSBueDtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVbaV0gPSBueDtcclxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gbm90IG51bWJlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5jWyAzICsgaSBdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVtpXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICBcdGFyW2ldID0gdGhpcy52YWx1ZVtpXSAqIHRoaXMudG9SYWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc051bWJlciApIHRoaXMuc2VuZCggYXJbMF0gKTtcclxuICAgICAgICBlbHNlIHRoaXMuc2VuZCggYXIgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVaSVNFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgclNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdmFyIHcgPSBNYXRoLmZsb29yKCAoIHRoaXMuc2IgKyA1ICkgLyB0aGlzLmxuZyApLTU7XHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnRtcFtpXSA9IFsgTWF0aC5mbG9vciggdGhpcy5zYSArICggdyAqIGkgKSsoIDUgKiBpICkpLCB3IF07XHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXTtcclxuICAgICAgICAgICAgc1sgMyArIGkgXS5sZWZ0ID0gdGhpcy50bXBbaV1bMF0gKyAncHgnO1xyXG4gICAgICAgICAgICBzWyAzICsgaSBdLndpZHRoID0gdGhpcy50bXBbaV1bMV0gKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBOdW1lcmljIH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmZ1bmN0aW9uIFNsaWRlICggbyApe1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcblxyXG4gICAgdGhpcy5tb2RlbCA9IG8uc3R5cGUgfHwgMDtcclxuICAgIGlmKCBvLm1vZGUgIT09IHVuZGVmaW5lZCApIHRoaXMubW9kZWwgPSBvLm1vZGU7XHJcbiAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgIHRoaXMuZGVmYXVsdEJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuaGlkZTtcclxuXHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc092ZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuYWxsd2F5ID0gby5hbGx3YXkgfHwgZmFsc2U7XHJcblxyXG4gICAgdGhpcy5maXJzdEltcHV0ID0gZmFsc2U7XHJcblxyXG4gICAgLy90aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdsZXR0ZXItc3BhY2luZzotMXB4OyB0ZXh0LWFsaWduOnJpZ2h0OyB3aWR0aDo0N3B4OyBib3JkZXI6MXB4IGRhc2hlZCAnK3RoaXMuZGVmYXVsdEJvcmRlckNvbG9yKyc7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICd0ZXh0LWFsaWduOnJpZ2h0OyB3aWR0aDo0N3B4OyBib3JkZXI6MXB4IGRhc2hlZCAnK3RoaXMuZGVmYXVsdEJvcmRlckNvbG9yKyc7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2xldHRlci1zcGFjaW5nOi0xcHg7IHRleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJyB0b3A6MDsgaGVpZ2h0OicrdGhpcy5oKydweDsnICk7XHJcbiAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2JhY2tncm91bmQ6Jyt0aGlzLmNvbG9ycy5zY3JvbGxiYWNrKyc7IHRvcDoycHg7IGhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OycgKTtcclxuICAgIHRoaXMuY1s1XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnbGVmdDo0cHg7IHRvcDo1cHg7IGhlaWdodDonKyh0aGlzLmgtMTApKydweDsgYmFja2dyb3VuZDonICsgdGhpcy5mb250Q29sb3IgKyc7JyApO1xyXG5cclxuICAgIHRoaXMuY1syXS5pc051bSA9IHRydWU7XHJcbiAgICAvL3RoaXMuY1syXS5zdHlsZS5oZWlnaHQgPSAodGhpcy5oLTQpICsgJ3B4JztcclxuICAgIC8vdGhpcy5jWzJdLnN0eWxlLmxpbmVIZWlnaHQgPSAodGhpcy5oLTgpICsgJ3B4JztcclxuICAgIHRoaXMuY1syXS5zdHlsZS5oZWlnaHQgPSAodGhpcy5oLTIpICsgJ3B4JztcclxuICAgIHRoaXMuY1syXS5zdHlsZS5saW5lSGVpZ2h0ID0gKHRoaXMuaC0xMCkgKyAncHgnO1xyXG5cclxuICAgIGlmKHRoaXMubW9kZWwgIT09IDApe1xyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgPT09IDEgfHwgdGhpcy5tb2RlbCA9PT0gMyl7XHJcbiAgICAgICAgICAgIHZhciBoMSA9IDQ7XHJcbiAgICAgICAgICAgIHZhciBoMiA9IDg7XHJcbiAgICAgICAgICAgIHZhciB3dyA9IHRoaXMuaC00O1xyXG4gICAgICAgICAgICB2YXIgcmEgPSAyMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgPT09IDIpe1xyXG4gICAgICAgICAgICBoMSA9IDQ7Ly8yXHJcbiAgICAgICAgICAgIGgyID0gODtcclxuICAgICAgICAgICAgcmEgPSAyO1xyXG4gICAgICAgICAgICB3dyA9ICh0aGlzLmgtNCkqMC41XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLm1vZGVsID09PSAzKSB0aGlzLmNbNV0uc3R5bGUudmlzaWJsZSA9ICdub25lJztcclxuXHJcbiAgICAgICAgdGhpcy5jWzRdLnN0eWxlLmJvcmRlclJhZGl1cyA9IGgxICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbNF0uc3R5bGUuaGVpZ2h0ID0gaDIgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1s0XS5zdHlsZS50b3AgPSAodGhpcy5oKjAuNSkgLSBoMSArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzVdLnN0eWxlLmJvcmRlclJhZGl1cyA9IChoMSowLjUpICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbNV0uc3R5bGUuaGVpZ2h0ID0gaDEgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1s1XS5zdHlsZS50b3AgPSAodGhpcy5oKjAuNSktKGgxKjAuNSkgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLmNbNl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2JvcmRlci1yYWRpdXM6JytyYSsncHg7IG1hcmdpbi1sZWZ0OicrKC13dyowLjUpKydweDsgYm9yZGVyOjFweCBzb2xpZCAnK3RoaXMuY29sb3JzLmJvcmRlcisnOyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOyBsZWZ0OjRweDsgdG9wOjJweDsgaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7IHdpZHRoOicrd3crJ3B4OycgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbn1cclxuXHJcblNsaWRlLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFNsaWRlLFxyXG5cclxuICAgIHRlc3Rab25lOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCBsLnggPj0gdGhpcy50eGwgKSByZXR1cm4gJ3RleHQnO1xyXG4gICAgICAgIGVsc2UgaWYoIGwueCA+PSB0aGlzLnNhICkgcmV0dXJuICdzY3JvbGwnO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuICcnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwOiBmdW5jdGlvbiAoIGUgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApeyBcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0ZXh0JyApe1xyXG4gICAgICAgICAgICB0aGlzLnNldElucHV0KCB0aGlzLmNbMl0sIGZ1bmN0aW9uKCl7IHRoaXMudmFsaWRhdGUoKSB9LmJpbmQodGhpcykgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vtb3ZlOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBudXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApIHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigndy1yZXNpemUnKTtcclxuICAgICAgICB9IGVsc2UgaWYobmFtZSA9PT0gJ3RleHQnKXsgXHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG5cclxuICAgICAgICAgICAgdmFyIG4gPSAoKCggZS5jbGllbnRYIC0gKHRoaXMuem9uZS54K3RoaXMuc2EpIC0gMyApIC8gdGhpcy53dyApICogdGhpcy5yYW5nZSArIHRoaXMubWluICkgLSB0aGlzLm9sZDtcclxuICAgICAgICAgICAgaWYobiA+PSB0aGlzLnN0ZXAgfHwgbiA8PSB0aGlzLnN0ZXApeyBcclxuICAgICAgICAgICAgICAgIG4gPSBNYXRoLmZsb29yKCBuIC8gdGhpcy5zdGVwICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBudXAgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGtleWRvd246IGZ1bmN0aW9uICggZSApIHsgcmV0dXJuIHRydWU7IH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHZhbGlkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLmNbMl0udGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIGlmKCFpc05hTiggbiApKXsgXHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCBuICk7IFxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSh0cnVlKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBlbHNlIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgLy90aGlzLmNsZWFySW5wdXQoKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vZGU6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgIC8vIHNbMl0uYm9yZGVyID0gJzFweCBzb2xpZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICAgICAgICAgIHNbMl0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbGJhY2s7XHJcbiAgICAgICAgICAgICAgICBzWzVdLmJhY2tncm91bmQgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gc2Nyb2xsIG92ZXJcclxuICAgICAgICAgICAgICAgIC8vc1syXS5ib3JkZXIgPSAnMXB4IGRhc2hlZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICAgICAgICAgIHNbMl0uY29sb3IgPSB0aGlzLmNvbG9yUGx1cztcclxuICAgICAgICAgICAgICAgIHNbNF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbGJhY2tvdmVyO1xyXG4gICAgICAgICAgICAgICAgc1s1XS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvclBsdXM7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgIC8qIGNhc2UgMjogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggc29saWQgJyArIHRoaXMuY29sb3JzLmJvcmRlclNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggZGFzaGVkICcgKyB0aGlzLmZvbnRDb2xvcjsvL3RoaXMuY29sb3JzLmJvcmRlclNlbGVjdDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDogXHJcbiAgICAgICAgICAgICAgICBzWzJdLmJvcmRlciA9ICcxcHggZGFzaGVkICcgKyB0aGlzLmNvbG9ycy5oaWRlO1xyXG4gICAgICAgICAgICBicmVhazsqL1xyXG5cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICggdXAgKSB7XHJcblxyXG4gICAgICAgIHZhciB3dyA9IE1hdGguZmxvb3IoIHRoaXMud3cgKiAoKCB0aGlzLnZhbHVlIC0gdGhpcy5taW4gKSAvIHRoaXMucmFuZ2UgKSk7XHJcbiAgICAgICBcclxuICAgICAgICBpZih0aGlzLm1vZGVsICE9PSAzKSB0aGlzLnNbNV0ud2lkdGggPSB3dyArICdweCc7XHJcbiAgICAgICAgaWYodGhpcy5zWzZdKSB0aGlzLnNbNl0ubGVmdCA9ICggdGhpcy5zYSArIHd3ICsgMyApICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHZhciB3ID0gdGhpcy5zYiAtIHRoaXMuc2M7XHJcbiAgICAgICAgdGhpcy53dyA9IHcgLSA2O1xyXG5cclxuICAgICAgICB2YXIgdHggPSB0aGlzLnNjO1xyXG4gICAgICAgIGlmKHRoaXMuaXNVSSB8fCAhdGhpcy5zaW1wbGUpIHR4ID0gdGhpcy5zYysxMDtcclxuICAgICAgICB0aGlzLnR4bCA9IHRoaXMudyAtIHR4ICsgMjtcclxuXHJcbiAgICAgICAgLy92YXIgdHkgPSBNYXRoLmZsb29yKHRoaXMuaCAqIDAuNSkgLSA4O1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc1syXS53aWR0aCA9ICh0aGlzLnNjIC02ICkrICdweCc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gKHRoaXMudHhsICs0KSArICdweCc7XHJcbiAgICAgICAgLy9zWzJdLnRvcCA9IHR5ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuICAgICAgICBzWzNdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbNV0ubGVmdCA9ICh0aGlzLnNhICsgMykgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBTbGlkZSB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5mdW5jdGlvbiBUZXh0SW5wdXQoIG8gKXtcclxuXHJcbiAgICBQcm90by5jYWxsKCB0aGlzLCBvICk7XHJcblxyXG4gICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG4gICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgJyc7XHJcbiAgICB0aGlzLnBsYWNlSG9sZGVyID0gby5wbGFjZUhvbGRlciB8fCAnJztcclxuXHJcbiAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlO1xyXG4gICAgLy90aGlzLmZpcnN0SW1wdXQgPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgIC8vIGJnXHJcbiAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJyBiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9ycy5zZWxlY3QgKyAnOyB0b3A6NHB4OyB3aWR0aDowcHg7IGhlaWdodDonICsgKHRoaXMuaC04KSArICdweDsnICk7XHJcblxyXG4gICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLmgtOCkrJ3B4OyBiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9ycy5pbnB1dEJnICsgJzsgYm9yZGVyQ29sb3I6JyArIHRoaXMuY29sb3JzLmlucHV0Qm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAvLyBjdXJzb3JcclxuICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjRweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OyB3aWR0aDowcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmZvbnRDb2xvcisnOycgKTtcclxuXHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG59XHJcblxyXG5UZXh0SW5wdXQucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogVGV4dElucHV0LFxyXG5cclxuICAgIHRlc3Rab25lOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG4gICAgICAgIGlmKCBsLnggPj0gdGhpcy5zYSApIHJldHVybiAndGV4dCc7XHJcbiAgICAgICAgcmV0dXJuICcnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKCBuYW1lID09PSAndGV4dCcgKSB0aGlzLnNldElucHV0KCB0aGlzLmNbM10gKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIC8vdmFyIGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIC8vaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApeyByZXR1cm47fVxyXG5cclxuICAgICAgICAvL2lmKCBsLnggPj0gdGhpcy5zYSApIHRoaXMuY3Vyc29yKCd0ZXh0Jyk7XHJcbiAgICAgICAgLy9lbHNlIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIHZhciB4ID0gMDtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICd0ZXh0JyApIHRoaXMuY3Vyc29yKCd0ZXh0Jyk7XHJcbiAgICAgICAgZWxzZSB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKSB4ID0gZS5jbGllbnRYIC0gdGhpcy56b25lLng7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnVwSW5wdXQoIHggLSB0aGlzLnNhIC0zLCB0aGlzLmlzRG93biApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoIGMsIGUsIHMgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS53aWR0aCA9ICcxcHgnO1xyXG4gICAgICAgIHRoaXMuc1s0XS5sZWZ0ID0gKHRoaXMuc2EgKyBjKzUpICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy5zWzJdLmxlZnQgPSAodGhpcy5zYSArIGUrNSkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS53aWR0aCA9IHMrJ3B4JztcclxuICAgIFxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3Q6IGZ1bmN0aW9uICggYywgZSwgdyApIHtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgdmFyIGQgPSB0aGlzLnNhICsgNTtcclxuICAgICAgICBzWzRdLndpZHRoID0gJzFweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gKCBkICsgYyApICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSAoIGQgKyBlICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICB1bnNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgcyA9IHRoaXMucztcclxuICAgICAgICBzWzJdLndpZHRoID0gMCArICdweCc7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9IDAgKyAncHgnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdmFsaWRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMuY1szXS50ZXh0Q29udGVudDtcclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVaSVNFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgclNpemU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdmFyIHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG4gICAgIFxyXG4gICAgfSxcclxuXHJcblxyXG59KTtcclxuXHJcbmV4cG9ydCB7IFRleHRJbnB1dCB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5mdW5jdGlvbiBUaXRsZSAoIG8gKSB7XHJcbiAgICBcclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICB2YXIgcHJlZml4ID0gby5wcmVmaXggfHwgJyc7XHJcblxyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpyaWdodDsgd2lkdGg6NjBweDsgbGluZS1oZWlnaHQ6JysgKHRoaXMuaC04KSArICdweDsgY29sb3I6JyArIHRoaXMuZm9udENvbG9yICk7XHJcblxyXG4gICAgaWYoIHRoaXMuaCA9PT0gMzEgKXtcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zWzFdLnRvcCA9IDggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1syXS5zdHlsZS50b3AgPSA4ICsgJ3B4JztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy50eHQuc3Vic3RyaW5nKDAsMSkudG9VcHBlckNhc2UoKSArIHRoaXMudHh0LnN1YnN0cmluZygxKS5yZXBsYWNlKFwiLVwiLCBcIiBcIik7XHJcbiAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSBwcmVmaXg7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG59XHJcblxyXG5UaXRsZS5wcm90b3R5cGUgPSBPYmplY3QuYXNzaWduKCBPYmplY3QuY3JlYXRlKCBQcm90by5wcm90b3R5cGUgKSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBUaXRsZSxcclxuXHJcbiAgICB0ZXh0OiBmdW5jdGlvbiAoIHR4dCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdHh0O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdGV4dDI6IGZ1bmN0aW9uICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByU2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG4gICAgICAgIHRoaXMuc1sxXS53aWR0aCA9IHRoaXMudyAtIDUwICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0ubGVmdCA9IHRoaXMudyAtICggNTAgKyAyNiApICsgJ3B4JztcclxuXHJcbiAgICB9LFxyXG5cclxufSApO1xyXG5cclxuZXhwb3J0IHsgVGl0bGUgfTsiLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZnVuY3Rpb24gU2VsZWN0b3IgKCBvICkge1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuXHJcbiAgICB0aGlzLnZhbHVlcyA9IG8udmFsdWVzO1xyXG4gICAgaWYodHlwZW9mIHRoaXMudmFsdWVzID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWVzID0gWyB0aGlzLnZhbHVlcyBdO1xyXG5cclxuICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8IHRoaXMudmFsdWVzWzBdO1xyXG5cclxuXHJcblxyXG4gICAgLy90aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWVzLmxlbmd0aDtcclxuICAgIHRoaXMudG1wID0gW107XHJcbiAgICB0aGlzLnN0YXQgPSBbXTtcclxuXHJcbiAgICB2YXIgc2VsO1xyXG5cclxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrKXtcclxuXHJcbiAgICAgICAgc2VsID0gZmFsc2U7XHJcbiAgICAgICAgaWYoIHRoaXMudmFsdWVzW2ldID09PSB0aGlzLnZhbHVlICkgc2VsID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jW2krMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOmNlbnRlcjsgdG9wOjFweDsgYmFja2dyb3VuZDonKyhzZWw/IHRoaXMuY29sb3JzLnNlbGVjdCA6IHRoaXMuYnV0dG9uQ29sb3IpKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OycgKTtcclxuICAgICAgICB0aGlzLmNbaSsyXS5zdHlsZS5jb2xvciA9IHNlbCA/ICcjRkZGJyA6IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHRoaXMuY1tpKzJdLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW2ldO1xyXG4gICAgICAgIC8vdGhpcy5jW2krMl0ubmFtZSA9IHRoaXMudmFsdWVzW2ldO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3RhdFtpXSA9IHNlbCA/IDM6MTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmluaXQoKTtcclxuXHJcbn1cclxuXHJcblNlbGVjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IFNlbGVjdG9yLFxyXG5cclxuICAgIHRlc3Rab25lOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIHZhciBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIHZhciB0ID0gdGhpcy50bXA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgIFx0aWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGkrMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwOiBmdW5jdGlvbiAoIGUgKSB7XHJcbiAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgLy90aGlzLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW91c2Vkb3duOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgXHR2YXIgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1sgbmFtZS0yIF07XHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICBcdHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gXHJcbiAgICAgICAgLy8gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlbW92ZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgdXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgLy92YXIgc2VsID0gZmFsc2U7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKG5hbWUpXHJcblxyXG4gICAgICAgIGlmKCBuYW1lICE9PSAnJyApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMubW9kZXMoIHRoaXMuaXNEb3duID8gMyA6IDIsIG5hbWUgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIFx0dXAgPSB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZXM6IGZ1bmN0aW9uICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgdmFyIHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PT0gbmFtZS0yICYmIHRoaXMudmFsdWVzWyBpIF0gIT09IHRoaXMudmFsdWUgKSB2ID0gdGhpcy5tb2RlKCBuLCBpKzIgKTtcclxuICAgICAgICAgICAgZWxzZXsgXHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzWyBpIF0gPT09IHRoaXMudmFsdWUgKSB2ID0gdGhpcy5tb2RlKCAzLCBpKzIgKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vZGU6IGZ1bmN0aW9uICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgdmFyIGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB2YXIgaSA9IG5hbWUgLSAyO1xyXG5cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpXSAhPT0gbiApe1xyXG5cclxuICAgICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnN0YXRbaV0gPSAxOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXRbaV0gPSAyOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gJyNGRkYnOyAgICAgICAgIHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLm92ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXRbaV0gPSAzOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gJyNGRkYnOyAgICAgICAgIHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgdmFyIHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy52YWx1ZXNbIGkgXSA9PT0gdGhpcy52YWx1ZSApIHYgPSB0aGlzLm1vZGUoIDMsIGkrMiApO1xyXG4gICAgICAgICAgICBlbHNlIHYgPSB0aGlzLm1vZGUoIDEsIGkrMiApO1xyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByOy8vdGhpcy5tb2RlcyggMSAsIDIgKTtcclxuXHJcbiAgICBcdC8qaWYoIHRoaXMuc2VsZWN0ZWQgKXtcclxuICAgIFx0XHR0aGlzLnNbIHRoaXMuc2VsZWN0ZWQgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnNbIHRoaXMuc2VsZWN0ZWQgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIFx0fVxyXG4gICAgICAgIHJldHVybiBmYWxzZTsqL1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbGFiZWw6IGZ1bmN0aW9uICggc3RyaW5nLCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuY1tuXS50ZXh0Q29udGVudCA9IHN0cmluZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGljb246IGZ1bmN0aW9uICggc3RyaW5nLCB5LCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuc1tuXS5wYWRkaW5nID0gKCB5IHx8IDAgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5jW25dLmlubmVySFRNTCA9IHN0cmluZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJTaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5zO1xyXG4gICAgICAgIHZhciB3ID0gdGhpcy5zYjtcclxuICAgICAgICB2YXIgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgdmFyIGRjID0gIDM7XHJcbiAgICAgICAgdmFyIHNpemUgPSBNYXRoLmZsb29yKCAoIHctKGRjKihpLTEpKSApIC8gaSApO1xyXG5cclxuICAgICAgICB3aGlsZShpLS0pe1xyXG5cclxuICAgICAgICBcdHRoaXMudG1wW2ldID0gWyBNYXRoLmZsb29yKCBkICsgKCBzaXplICogaSApICsgKCBkYyAqIGkgKSksIHNpemUgXTtcclxuICAgICAgICBcdHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXTtcclxuICAgICAgICAgICAgc1tpKzJdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCc7XHJcbiAgICAgICAgICAgIHNbaSsyXS53aWR0aCA9IHRoaXMudG1wW2ldWzFdICsgJ3B4JztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IFNlbGVjdG9yIH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmZ1bmN0aW9uIEVtcHR5ICggbyApe1xyXG5cclxuICAgIG8uc2ltcGxlID0gdHJ1ZTtcclxuICAgIG8uaXNFbXB0eSA9IHRydWU7XHJcblxyXG4gICAgUHJvdG8uY2FsbCggdGhpcywgbyApO1xyXG5cclxuICAgIHRoaXMuaW5pdCgpO1xyXG5cclxufVxyXG5cclxuRW1wdHkucHJvdG90eXBlID0gT2JqZWN0LmFzc2lnbiggT2JqZWN0LmNyZWF0ZSggUHJvdG8ucHJvdG90eXBlICksIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcjogRW1wdHksXHJcblxyXG59ICk7XHJcblxyXG5leHBvcnQgeyBFbXB0eSB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5mdW5jdGlvbiBJdGVtICggbyApe1xyXG5cclxuICAgIFByb3RvLmNhbGwoIHRoaXMsIG8gKTtcclxuICAgIHRoaXMucCA9IDEwMDtcclxuICAgIHRoaXMudmFsdWUgPSB0aGlzLnR4dDtcclxuICAgIHRoaXMuc3RhdHVzID0gMTtcclxuXHJcbiAgICB0aGlzLmdyYXBoID0gdGhpcy5zdmdzW28uaXR5cGUgfHwgJ25vbmUnXTtcclxuXHJcbiAgICB2YXIgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTc7XHJcblxyXG4gICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjE0cHg7IGhlaWdodDoxNHB4OyBsZWZ0OjVweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLmdyYXBoLCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgdGhpcy5zWzFdLm1hcmdpbkxlZnQgPSAyMCArICdweCc7XHJcblxyXG4gICAgdGhpcy5pbml0KCk7XHJcblxyXG59XHJcblxyXG5JdGVtLnByb3RvdHlwZSA9IE9iamVjdC5hc3NpZ24oIE9iamVjdC5jcmVhdGUoIFByb3RvLnByb3RvdHlwZSApLCB7XHJcblxyXG4gICAgY29uc3RydWN0b3I6IEl0ZW0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZW1vdmU6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcbiAgICAgICAgLy91cCA9IHRoaXMubW9kZXMoIHRoaXMuaXNEb3duID8gMyA6IDIsIG5hbWUgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1vdXNlZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLnJlc2V0SXRlbSgpO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdGVkKCB0cnVlICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVpb3V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDMpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdWlvdmVyOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDQpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5tb2RlKDIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICByU2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBQcm90by5wcm90b3R5cGUuclNpemUuY2FsbCggdGhpcyApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbW9kZTogZnVuY3Rpb24gKCBuICkge1xyXG5cclxuICAgICAgICB2YXIgY2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXR1cyAhPT0gbiApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBuO1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdHVzID0gMTsgdGhpcy5zWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7IHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gJ25vbmUnOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zdGF0dXMgPSAyOyB0aGlzLnNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnT3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdHVzID0gMzsgdGhpcy5zWzFdLmNvbG9yID0gJyNGRkYnOyAgICAgICAgIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0OyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgNDogdGhpcy5zdGF0dXMgPSA0OyB0aGlzLnNbMV0uY29sb3IgPSAnI0ZGRic7ICAgICAgICAgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAvLyByZXR1cm4gdGhpcy5tb2RlKCAxICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZWxlY3RlZDogZnVuY3Rpb24gKCBiICl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VsZWN0ID0gYiB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMyk7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuXHJcbn0gKTtcclxuXHJcbmV4cG9ydCB7IEl0ZW0gfTsiLCJcclxuaW1wb3J0IHsgQm9vbCB9IGZyb20gJy4uL3Byb3RvL0Jvb2wuanMnO1xyXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9wcm90by9CdXR0b24uanMnO1xyXG5pbXBvcnQgeyBDaXJjdWxhciB9IGZyb20gJy4uL3Byb3RvL0NpcmN1bGFyLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi9wcm90by9Db2xvci5qcyc7XHJcbmltcG9ydCB7IEZwcyB9IGZyb20gJy4uL3Byb3RvL0Zwcy5qcyc7XHJcbmltcG9ydCB7IEdyYXBoIH0gZnJvbSAnLi4vcHJvdG8vR3JhcGguanMnO1xyXG5pbXBvcnQgeyBHcm91cCAgfSBmcm9tICcuLi9wcm90by9Hcm91cC5qcyc7XHJcbmltcG9ydCB7IEpveXN0aWNrIH0gZnJvbSAnLi4vcHJvdG8vSm95c3RpY2suanMnO1xyXG5pbXBvcnQgeyBLbm9iIH0gZnJvbSAnLi4vcHJvdG8vS25vYi5qcyc7XHJcbmltcG9ydCB7IExpc3QgfSBmcm9tICcuLi9wcm90by9MaXN0LmpzJztcclxuaW1wb3J0IHsgTnVtZXJpYyB9IGZyb20gJy4uL3Byb3RvL051bWVyaWMuanMnO1xyXG5pbXBvcnQgeyBTbGlkZSB9IGZyb20gJy4uL3Byb3RvL1NsaWRlLmpzJztcclxuaW1wb3J0IHsgVGV4dElucHV0IH0gZnJvbSAnLi4vcHJvdG8vVGV4dElucHV0LmpzJztcclxuaW1wb3J0IHsgVGl0bGUgfSBmcm9tICcuLi9wcm90by9UaXRsZS5qcyc7XHJcbmltcG9ydCB7IFNlbGVjdG9yIH0gZnJvbSAnLi4vcHJvdG8vU2VsZWN0b3IuanMnO1xyXG5pbXBvcnQgeyBFbXB0eSB9IGZyb20gJy4uL3Byb3RvL0VtcHR5LmpzJztcclxuaW1wb3J0IHsgSXRlbSB9IGZyb20gJy4uL3Byb3RvL0l0ZW0uanMnO1xyXG5cclxuLypmdW5jdGlvbiBhdXRvVHlwZSAoKSB7XHJcblxyXG4gICAgdmFyIGEgPSBhcmd1bWVudHM7XHJcbiAgICB2YXIgdHlwZSA9ICdTbGlkZSc7XHJcbiAgICBpZiggYVsyXS50eXBlICkgdHlwZSA9IGFbMl0udHlwZTtcclxuICAgIHJldHVybiB0eXBlO1xyXG5cclxufTsqL1xyXG5cclxuZnVuY3Rpb24gYWRkICgpIHtcclxuXHJcbiAgICB2YXIgYSA9IGFyZ3VtZW50czsgXHJcblxyXG4gICAgdmFyIHR5cGUsIG8sIHJlZiA9IGZhbHNlLCBuID0gbnVsbDtcclxuXHJcbiAgICBpZiggdHlwZW9mIGFbMF0gPT09ICdzdHJpbmcnICl7IFxyXG5cclxuICAgICAgICB0eXBlID0gYVswXTtcclxuICAgICAgICBvID0gYVsxXSB8fCB7fTtcclxuXHJcbiAgICB9IGVsc2UgaWYgKCB0eXBlb2YgYVswXSA9PT0gJ29iamVjdCcgKXsgLy8gbGlrZSBkYXQgZ3VpXHJcblxyXG4gICAgICAgIHJlZiA9IHRydWU7XHJcbiAgICAgICAgaWYoIGFbMl0gPT09IHVuZGVmaW5lZCApIFtdLnB1c2guY2FsbChhLCB7fSk7XHJcblxyXG4gICAgICAgIHR5cGUgPSBhWzJdLnR5cGUgPyBhWzJdLnR5cGUgOiAnc2xpZGUnOy8vYXV0b1R5cGUuYXBwbHkoIHRoaXMsIGEgKTtcclxuXHJcbiAgICAgICAgbyA9IGFbMl07XHJcbiAgICAgICAgby5uYW1lID0gYVsxXTtcclxuICAgICAgICBvLnZhbHVlID0gYVswXVthWzFdXTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5hbWUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgaWYoIG5hbWUgPT09ICdncm91cCcgKSBvLmFkZCA9IGFkZDtcclxuXHJcbiAgICBzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICAgICAgY2FzZSAnYm9vbCc6IG4gPSBuZXcgQm9vbChvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnYnV0dG9uJzogbiA9IG5ldyBCdXR0b24obyk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2NpcmN1bGFyJzogbiA9IG5ldyBDaXJjdWxhcihvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnY29sb3InOiBuID0gbmV3IENvbG9yKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdmcHMnOiBuID0gbmV3IEZwcyhvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnZ3JhcGgnOiBuID0gbmV3IEdyYXBoKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdncm91cCc6IG4gPSBuZXcgR3JvdXAobyk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2pveXN0aWNrJzogbiA9IG5ldyBKb3lzdGljayhvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAna25vYic6IG4gPSBuZXcgS25vYihvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbGlzdCc6IG4gPSBuZXcgTGlzdChvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnbnVtZXJpYyc6IGNhc2UgJ251bWJlcic6IG4gPSBuZXcgTnVtZXJpYyhvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAnc2xpZGUnOiBuID0gbmV3IFNsaWRlKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICd0ZXh0SW5wdXQnOiBjYXNlICdzdHJpbmcnOiBuID0gbmV3IFRleHRJbnB1dChvKTsgYnJlYWs7XHJcbiAgICAgICAgY2FzZSAndGl0bGUnOiBuID0gbmV3IFRpdGxlKG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdzZWxlY3Rvcic6IG4gPSBuZXcgU2VsZWN0b3Iobyk7IGJyZWFrO1xyXG4gICAgICAgIGNhc2UgJ2VtcHR5JzogY2FzZSAnc3BhY2UnOiBuID0gbmV3IEVtcHR5KG8pOyBicmVhaztcclxuICAgICAgICBjYXNlICdpdGVtJzogbiA9IG5ldyBJdGVtKG8pOyBicmVhaztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWYoIG4gIT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgaWYoIHJlZiApIG4uc2V0UmVmZXJlbmN5KCBhWzBdLCBhWzFdICk7XHJcbiAgICAgICAgcmV0dXJuIG47XHJcblxyXG4gICAgfVxyXG4gICAgXHJcblxyXG59O1xyXG5cclxuZXhwb3J0IHsgYWRkIH07IiwiXHJcbmltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi9Sb290cyc7XHJcbmltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi9Ub29scyc7XHJcbmltcG9ydCB7IGFkZCB9IGZyb20gJy4vYWRkJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuL1YyJztcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmZ1bmN0aW9uIEd1aSAoIG8gKSB7XHJcblxyXG4gICAgdGhpcy5jYW52YXMgPSBudWxsO1xyXG5cclxuICAgIG8gPSBvIHx8IHt9O1xyXG5cclxuICAgIC8vIGNvbG9yXHJcbiAgICB0aGlzLmNvbG9ycyA9IFRvb2xzLmNsb25lQ29sb3IoKTtcclxuICAgIHRoaXMuY3NzID0gVG9vbHMuY2xvbmVDc3MoKTtcclxuXHJcblxyXG4gICAgaWYoIG8uY29uZmlnICkgdGhpcy5zZXRDb25maWcoIG8uY29uZmlnICk7XHJcblxyXG5cclxuICAgIHRoaXMuYmcgPSBvLmJnIHx8IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7XHJcblxyXG4gICAgaWYoIG8udHJhbnNwYXJlbnQgIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgIHRoaXMuY29sb3JzLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXIgPSAnbm9uZSc7XHJcbiAgICB9XHJcblxyXG4gICAgLy9pZiggby5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2sgPSAgby5jYWxsYmFjaztcclxuXHJcbiAgICB0aGlzLmlzUmVzZXQgPSB0cnVlO1xyXG5cclxuICAgIHRoaXMudG1wQWRkID0gbnVsbDtcclxuICAgIHRoaXMudG1wSCA9IDA7XHJcblxyXG4gICAgdGhpcy5pc0NhbnZhcyA9IG8uaXNDYW52YXMgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmlzQ2FudmFzT25seSA9IGZhbHNlO1xyXG4gICAgdGhpcy5jc3NHdWkgPSBvLmNzcyAhPT0gdW5kZWZpbmVkID8gby5jc3MgOiAnJztcclxuICAgIHRoaXMuY2FsbGJhY2sgPSBvLmNhbGxiYWNrICA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG8uY2FsbGJhY2s7XHJcblxyXG4gICAgdGhpcy5mb3JjZUhlaWdodCA9IG8ubWF4SGVpZ2h0IHx8IDA7XHJcbiAgICB0aGlzLmxvY2tIZWlnaHQgPSBvLmxvY2tIZWlnaHQgfHwgZmFsc2U7XHJcblxyXG4gICAgdGhpcy5pc0l0ZW1Nb2RlID0gby5pdGVtTW9kZSAhPT0gdW5kZWZpbmVkID8gby5pdGVtTW9kZSA6IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuY24gPSAnJztcclxuICAgIFxyXG4gICAgLy8gc2l6ZSBkZWZpbmVcclxuICAgIHRoaXMuc2l6ZSA9IFRvb2xzLnNpemU7XHJcbiAgICBpZiggby5wICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUucCA9IG8ucDtcclxuICAgIGlmKCBvLncgIT09IHVuZGVmaW5lZCApIHRoaXMuc2l6ZS53ID0gby53O1xyXG4gICAgaWYoIG8uaCAhPT0gdW5kZWZpbmVkICkgdGhpcy5zaXplLmggPSBvLmg7XHJcbiAgICBpZiggby5zICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUucyA9IG8ucztcclxuXHJcbiAgICB0aGlzLnNpemUuaCA9IHRoaXMuc2l6ZS5oIDwgMTEgPyAxMSA6IHRoaXMuc2l6ZS5oO1xyXG5cclxuICAgIC8vIGxvY2FsIG1vdXNlIGFuZCB6b25lXHJcbiAgICB0aGlzLmxvY2FsID0gbmV3IFYyKCkubmVnKCk7XHJcbiAgICB0aGlzLnpvbmUgPSB7IHg6MCwgeTowLCB3OnRoaXMuc2l6ZS53LCBoOjAgfTtcclxuXHJcbiAgICAvLyB2aXJ0dWFsIG1vdXNlXHJcbiAgICB0aGlzLm1vdXNlID0gbmV3IFYyKCkubmVnKCk7XHJcblxyXG4gICAgdGhpcy5oID0gMDtcclxuICAgIHRoaXMucHJldlkgPSAtMTtcclxuICAgIHRoaXMuc3cgPSAwO1xyXG5cclxuICAgIFxyXG5cclxuICAgIC8vIGJvdHRvbSBhbmQgY2xvc2UgaGVpZ2h0XHJcbiAgICB0aGlzLmlzV2l0aENsb3NlID0gby5jbG9zZSAhPT0gdW5kZWZpbmVkID8gby5jbG9zZSA6IHRydWU7XHJcbiAgICB0aGlzLmJoID0gIXRoaXMuaXNXaXRoQ2xvc2UgPyAwIDogdGhpcy5zaXplLmg7XHJcblxyXG4gICAgdGhpcy5hdXRvUmVzaXplID0gby5hdXRvUmVzaXplID09PSB1bmRlZmluZWQgPyB0cnVlIDogby5hdXRvUmVzaXplO1xyXG4gICAgXHJcbiAgICB0aGlzLmlzQ2VudGVyID0gby5jZW50ZXIgfHwgZmFsc2U7XHJcbiAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcbiAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc1Njcm9sbCA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMudWlzID0gW107XHJcblxyXG4gICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICB0aGlzLmRlY2FsID0gMDtcclxuICAgIHRoaXMucmF0aW8gPSAxO1xyXG4gICAgdGhpcy5veSA9IDA7XHJcblxyXG5cclxuXHJcbiAgICB0aGlzLmlzTmV3VGFyZ2V0ID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5jb250ZW50ID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIHdpZHRoOjBweDsgaGVpZ2h0OmF1dG87IHRvcDowcHg7ICcgKyB0aGlzLmNzc0d1aSApO1xyXG5cclxuICAgIHRoaXMuaW5uZXJDb250ZW50ID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgdG9wOjA7IGxlZnQ6MDsgaGVpZ2h0OmF1dG87IG92ZXJmbG93OmhpZGRlbjsnKTtcclxuICAgIHRoaXMuY29udGVudC5hcHBlbmRDaGlsZCggdGhpcy5pbm5lckNvbnRlbnQgKTtcclxuXHJcbiAgICB0aGlzLmlubmVyID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgbGVmdDowOyAnKTtcclxuICAgIHRoaXMuaW5uZXJDb250ZW50LmFwcGVuZENoaWxkKHRoaXMuaW5uZXIpO1xyXG5cclxuICAgIC8vIHNjcm9sbFxyXG4gICAgdGhpcy5zY3JvbGxCRyA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3JpZ2h0OjA7IHRvcDowOyB3aWR0aDonKyAodGhpcy5zaXplLnMgLSAxKSArJ3B4OyBoZWlnaHQ6MTBweDsgZGlzcGxheTpub25lOyBiYWNrZ3JvdW5kOicrdGhpcy5iZysnOycpO1xyXG4gICAgdGhpcy5jb250ZW50LmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbEJHICk7XHJcblxyXG4gICAgdGhpcy5zY3JvbGwgPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdiYWNrZ3JvdW5kOicrdGhpcy5jb2xvcnMuc2Nyb2xsKyc7IHJpZ2h0OjJweDsgdG9wOjA7IHdpZHRoOicrKHRoaXMuc2l6ZS5zLTQpKydweDsgaGVpZ2h0OjEwcHg7Jyk7XHJcbiAgICB0aGlzLnNjcm9sbEJHLmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbCApO1xyXG5cclxuICAgIC8vIGJvdHRvbSBidXR0b25cclxuICAgIHRoaXMuYm90dG9tID0gVG9vbHMuZG9tKCAnZGl2JywgIHRoaXMuY3NzLnR4dCArICd3aWR0aDoxMDAlOyB0b3A6YXV0bzsgYm90dG9tOjA7IGxlZnQ6MDsgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6MTBweDsgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6MTBweDsgdGV4dC1hbGlnbjpjZW50ZXI7IGhlaWdodDonK3RoaXMuYmgrJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLmJoLTUpKydweDsgYm9yZGVyLXRvcDoxcHggc29saWQgJytUb29scy5jb2xvcnMuc3Ryb2tlKyc7Jyk7XHJcbiAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuYm90dG9tICk7XHJcbiAgICB0aGlzLmJvdHRvbS50ZXh0Q29udGVudCA9ICdjbG9zZSc7XHJcbiAgICB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5iZztcclxuXHJcbiAgICAvL1xyXG5cclxuICAgIHRoaXMucGFyZW50ID0gby5wYXJlbnQgIT09IHVuZGVmaW5lZCA/IG8ucGFyZW50IDogbnVsbDtcclxuICAgIFxyXG4gICAgaWYoIHRoaXMucGFyZW50ID09PSBudWxsICYmICF0aGlzLmlzQ2FudmFzICl7IFxyXG4gICAgXHR0aGlzLnBhcmVudCA9IGRvY3VtZW50LmJvZHk7XHJcbiAgICAgICAgLy8gZGVmYXVsdCBwb3NpdGlvblxyXG4gICAgXHRpZiggIXRoaXMuaXNDZW50ZXIgKSB0aGlzLmNvbnRlbnQuc3R5bGUucmlnaHQgPSAnMTBweCc7IFxyXG4gICAgfVxyXG5cclxuICAgIGlmKCB0aGlzLnBhcmVudCAhPT0gbnVsbCApIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKCB0aGlzLmNvbnRlbnQgKTtcclxuXHJcbiAgICBpZiggdGhpcy5pc0NhbnZhcyAmJiB0aGlzLnBhcmVudCA9PT0gbnVsbCApIHRoaXMuaXNDYW52YXNPbmx5ID0gdHJ1ZTtcclxuXHJcbiAgICBpZiggIXRoaXMuaXNDYW52YXNPbmx5ICkgdGhpcy5jb250ZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XHJcblxyXG5cclxuICAgIHRoaXMuc2V0V2lkdGgoKTtcclxuXHJcbiAgICBpZiggdGhpcy5pc0NhbnZhcyApIHRoaXMubWFrZUNhbnZhcygpO1xyXG5cclxuICAgIFJvb3RzLmFkZCggdGhpcyApO1xyXG5cclxufVxyXG5cclxuT2JqZWN0LmFzc2lnbiggR3VpLnByb3RvdHlwZSwge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yOiBHdWksXHJcblxyXG4gICAgaXNHdWk6IHRydWUsXHJcblxyXG4gICAgc2V0VG9wOiBmdW5jdGlvbiAoIHQsIGggKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS50b3AgPSB0ICsgJ3B4JztcclxuICAgICAgICBpZiggaCAhPT0gdW5kZWZpbmVkICkgdGhpcy5mb3JjZUhlaWdodCA9IGg7XHJcbiAgICAgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vY2FsbGJhY2s6IGZ1bmN0aW9uICgpIHt9LFxyXG5cclxuICAgIGRpc3Bvc2U6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIGlmKCB0aGlzLnBhcmVudCAhPT0gbnVsbCApIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKCB0aGlzLmNvbnRlbnQgKTtcclxuICAgICAgICBSb290cy5yZW1vdmUoIHRoaXMgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ0FOVkFTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgb25EcmF3OiBmdW5jdGlvbiAoKSB7IH0sXHJcblxyXG4gICAgbWFrZUNhbnZhczogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIFx0dGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJywgXCJjYW52YXNcIiApO1xyXG4gICAgXHR0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuem9uZS53O1xyXG4gICAgXHR0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmZvcmNlSGVpZ2h0ID8gdGhpcy5mb3JjZUhlaWdodCA6IHRoaXMuem9uZS5oO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZHJhdzogZnVuY3Rpb24gKCBmb3JjZSApIHtcclxuXHJcbiAgICBcdGlmKCB0aGlzLmNhbnZhcyA9PT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICBcdHZhciB3ID0gdGhpcy56b25lLnc7XHJcbiAgICBcdHZhciBoID0gdGhpcy5mb3JjZUhlaWdodCA/IHRoaXMuZm9yY2VIZWlnaHQgOiB0aGlzLnpvbmUuaDtcclxuICAgIFx0Um9vdHMudG9DYW52YXMoIHRoaXMsIHcsIGgsIGZvcmNlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLy8vLy9cclxuXHJcbiAgICBnZXREb206IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldE1vdXNlOiBmdW5jdGlvbiggbSApe1xyXG5cclxuICAgICAgICB0aGlzLm1vdXNlLnNldCggbS54LCBtLnkgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldENvbmZpZzogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICB0aGlzLnNldENvbG9ycyggbyApO1xyXG4gICAgICAgIHRoaXMuc2V0VGV4dCggby5mb250U2l6ZSwgby50ZXh0LCBvLmZvbnQsIG8uc2hhZG93ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDb2xvcnM6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgZm9yKCB2YXIgYyBpbiBvICl7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmNvbG9yc1tjXSApIHRoaXMuY29sb3JzW2NdID0gb1tjXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAoIHNpemUsIGNvbG9yLCBmb250LCBzaGFkb3cgKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLnNldFRleHQoIHNpemUsIGNvbG9yLCBmb250LCBzaGFkb3csIHRoaXMuY29sb3JzLCB0aGlzLmNzcyApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaGlkZTogZnVuY3Rpb24gKCBiICkge1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnQuc3R5bGUuZGlzcGxheSA9IGIgPyAnbm9uZScgOiAnYmxvY2snO1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKCBmICkge1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gZjtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU1RZTEVTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZTogZnVuY3Rpb24gKCBuICkge1xyXG5cclxuICAgIFx0dmFyIG5lZWRDaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICBcdGlmKCBuICE9PSB0aGlzLmNuICl7XHJcblxyXG5cdCAgICBcdHRoaXMuY24gPSBuO1xyXG5cclxuXHQgICAgXHRzd2l0Y2goIG4gKXtcclxuXHJcblx0ICAgIFx0XHRjYXNlICdkZWYnOiBcclxuXHQgICAgXHRcdCAgIHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGw7IFxyXG5cdCAgICBcdFx0ICAgdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7XHJcblx0ICAgIFx0XHQgICB0aGlzLmJvdHRvbS5zdHlsZS5jb2xvciA9IHRoaXMuY29sb3JzLnRleHQ7XHJcblx0ICAgIFx0XHRicmVhaztcclxuXHJcblx0ICAgIFx0XHQvL2Nhc2UgJ3Njcm9sbERlZic6IHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGw7IGJyZWFrO1xyXG5cdCAgICBcdFx0Y2FzZSAnc2Nyb2xsT3Zlcic6IHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7IGJyZWFrO1xyXG5cdCAgICBcdFx0Y2FzZSAnc2Nyb2xsRG93bic6IHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duOyBicmVhaztcclxuXHJcblx0ICAgIFx0XHQvL2Nhc2UgJ2JvdHRvbURlZic6IHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kOyBicmVhaztcclxuXHQgICAgXHRcdGNhc2UgJ2JvdHRvbU92ZXInOiB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXI7IHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gJyNGRkYnOyBicmVhaztcclxuXHQgICAgXHRcdC8vY2FzZSAnYm90dG9tRG93bic6IHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7IHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gJyMwMDAnOyBicmVhaztcclxuXHJcblx0ICAgIFx0fVxyXG5cclxuXHQgICAgXHRuZWVkQ2hhbmdlID0gdHJ1ZTtcclxuXHJcblx0ICAgIH1cclxuXHJcbiAgICBcdHJldHVybiBuZWVkQ2hhbmdlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBUQVJHRVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjbGVhclRhcmdldDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIFx0aWYoIHRoaXMuY3VycmVudCA9PT0gLTEgKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLy9pZighdGhpcy50YXJnZXQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnRhcmdldC51aW91dCgpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG5cclxuICAgICAgICAvLy9jb25zb2xlLmxvZyh0aGlzLmlzRG93bikvL2lmKHRoaXMuaXNEb3duKVJvb3RzLmNsZWFySW5wdXQoKTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIFJvb3RzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBaT05FIFRFU1RcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB0ZXN0Wm9uZTogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB2YXIgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgdGhpcy5pc1Jlc2V0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIHZhciBzID0gdGhpcy5pc1Njcm9sbCA/ICB0aGlzLnpvbmUudyAgLSB0aGlzLnNpemUucyA6IHRoaXMuem9uZS53O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmKCBsLnkgPiB0aGlzLnpvbmUuaCAtIHRoaXMuYmggJiYgIGwueSA8IHRoaXMuem9uZS5oICkgbmFtZSA9ICdib3R0b20nO1xyXG4gICAgICAgIGVsc2UgbmFtZSA9IGwueCA+IHMgPyAnc2Nyb2xsJyA6ICdjb250ZW50JztcclxuXHJcbiAgICAgICAgcmV0dXJuIG5hbWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50OiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgXHR2YXIgdHlwZSA9IGUudHlwZTtcclxuXHJcbiAgICBcdHZhciBjaGFuZ2UgPSBmYWxzZTtcclxuICAgIFx0dmFyIHRhcmdldENoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgIFx0dmFyIG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgIFx0aWYoIHR5cGUgPT09ICdtb3VzZXVwJyAmJiB0aGlzLmlzRG93biApIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICBcdGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyAmJiAhdGhpcy5pc0Rvd24gKSB0aGlzLmlzRG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biAmJiB0aGlzLmlzTmV3VGFyZ2V0ICl7IFJvb3RzLmNsZWFySW5wdXQoKTsgdGhpcy5pc05ld1RhcmdldD1mYWxzZTsgfVxyXG5cclxuICAgIFx0aWYoICFuYW1lICkgcmV0dXJuO1xyXG5cclxuICAgIFx0c3dpdGNoKCBuYW1lICl7XHJcblxyXG4gICAgXHRcdGNhc2UgJ2NvbnRlbnQnOlxyXG5cclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WSA9IHRoaXMuaXNTY3JvbGwgPyAgZS5jbGllbnRZICsgdGhpcy5kZWNhbCA6IGUuY2xpZW50WTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggUm9vdHMuaXNNb2JpbGUgJiYgdHlwZSA9PT0gJ21vdXNlZG93bicgKSB0aGlzLmdldE5leHQoIGUsIGNoYW5nZSApO1xyXG5cclxuXHQgICAgXHRcdGlmKCB0aGlzLnRhcmdldCApIHRhcmdldENoYW5nZSA9IHRoaXMudGFyZ2V0LmhhbmRsZUV2ZW50KCBlICk7XHJcblxyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5tb2RlKCdkZWYnKTtcclxuICAgICAgICAgICAgICAgIGlmKCB0eXBlID09PSAnd2hlZWwnICYmICF0YXJnZXRDaGFuZ2UgJiYgdGhpcy5pc1Njcm9sbCApIGNoYW5nZSA9IHRoaXMub25XaGVlbCggZSApO1xyXG4gICAgICAgICAgICAgICBcclxuXHQgICAgXHRcdGlmKCAhUm9vdHMubG9jayApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE5leHQoIGUsIGNoYW5nZSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgIFx0XHRicmVhaztcclxuICAgIFx0XHRjYXNlICdib3R0b20nOlxyXG5cclxuXHQgICAgXHRcdHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHQgICAgXHRcdGlmKCB0eXBlID09PSAnbW91c2Vtb3ZlJyApIGNoYW5nZSA9IHRoaXMubW9kZSgnYm90dG9tT3ZlcicpO1xyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZWRvd24nICkge1xyXG5cdCAgICBcdFx0XHR0aGlzLmlzT3BlbiA9IHRoaXMuaXNPcGVuID8gZmFsc2UgOiB0cnVlO1xyXG5cdFx0ICAgICAgICAgICAgdGhpcy5ib3R0b20udGV4dENvbnRlbnQgPSB0aGlzLmlzT3BlbiA/ICdjbG9zZScgOiAnb3Blbic7XHJcblx0XHQgICAgICAgICAgICB0aGlzLnNldEhlaWdodCgpO1xyXG5cdFx0ICAgICAgICAgICAgdGhpcy5tb2RlKCdkZWYnKTtcclxuXHRcdCAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblx0ICAgIFx0XHR9XHJcblxyXG4gICAgXHRcdGJyZWFrO1xyXG4gICAgXHRcdGNhc2UgJ3Njcm9sbCc6XHJcblxyXG5cdCAgICBcdFx0dGhpcy5jbGVhclRhcmdldCgpO1xyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5tb2RlKCdzY3JvbGxPdmVyJyk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ3Njcm9sbERvd24nKTsgXHJcbiAgICAgICAgICAgICAgICBpZiggdHlwZSA9PT0gJ3doZWVsJyApIGNoYW5nZSA9IHRoaXMub25XaGVlbCggZSApOyBcclxuXHQgICAgXHRcdGlmKCB0aGlzLmlzRG93biApIHRoaXMudXBkYXRlKCAoZS5jbGllbnRZLXRoaXMuem9uZS55KS0odGhpcy5zaCowLjUpICk7XHJcblxyXG4gICAgXHRcdGJyZWFrO1xyXG5cclxuXHJcbiAgICBcdH1cclxuXHJcbiAgICBcdGlmKCB0aGlzLmlzRG93biApIGNoYW5nZSA9IHRydWU7XHJcbiAgICBcdGlmKCB0YXJnZXRDaGFuZ2UgKSBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggdHlwZSA9PT0gJ2tleXVwJyApIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgaWYoIHR5cGUgPT09ICdrZXlkb3duJyApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgXHRpZiggY2hhbmdlICkgdGhpcy5kcmF3KCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBnZXROZXh0OiBmdW5jdGlvbiAoIGUsIGNoYW5nZSApIHtcclxuXHJcblxyXG5cclxuICAgICAgICB2YXIgbmV4dCA9IFJvb3RzLmZpbmRUYXJnZXQoIHRoaXMudWlzLCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc05ld1RhcmdldCA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IC0xICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMudWlzWyB0aGlzLmN1cnJlbnQgXTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQudWlvdmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgb25XaGVlbDogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLm95ICs9IDIwKmUuZGVsdGE7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoIHRoaXMub3kgKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVTRVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldDogZnVuY3Rpb24gKCBmb3JjZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNSZXNldCApIHJldHVybjtcclxuXHJcbiAgICAgICAgLy90aGlzLnJlc2V0SXRlbSgpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdXNlLm5lZygpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vUm9vdHMuY2xlYXJJbnB1dCgpO1xyXG4gICAgICAgIHZhciByID0gdGhpcy5tb2RlKCdkZWYnKTtcclxuICAgICAgICB2YXIgcjIgPSB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcblxyXG4gICAgICAgIGlmKCByIHx8IHIyICkgdGhpcy5kcmF3KCB0cnVlICk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNSZXNldCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vUm9vdHMubG9jayA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBBREQgTk9ERVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFkZDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgYSA9IGFyZ3VtZW50cztcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiBhWzFdID09PSAnb2JqZWN0JyApeyBcclxuXHJcbiAgICAgICAgICAgIGFbMV0uaXNVSSA9IHRydWU7XHJcbiAgICAgICAgICAgIGFbMV0ubWFpbiA9IHRoaXM7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiggdHlwZW9mIGFbMV0gPT09ICdzdHJpbmcnICl7XHJcblxyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHsgaXNVSTp0cnVlLCBtYWluOnRoaXMgfSk7XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYVsyXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGFbMl0ubWFpbiA9IHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBcclxuXHJcbiAgICAgICAgdmFyIHUgPSBhZGQuYXBwbHkoIHRoaXMsIGEgKTtcclxuXHJcbiAgICAgICAgaWYoIHUgPT09IG51bGwgKSByZXR1cm47XHJcblxyXG5cclxuICAgICAgICAvL3ZhciBuID0gYWRkLmFwcGx5KCB0aGlzLCBhICk7XHJcbiAgICAgICAgLy92YXIgbiA9IFVJTC5hZGQoIC4uLmFyZ3MgKTtcclxuXHJcbiAgICAgICAgdGhpcy51aXMucHVzaCggdSApO1xyXG4gICAgICAgIC8vbi5weSA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgaWYoICF1LmF1dG9XaWR0aCApe1xyXG4gICAgICAgICAgICB2YXIgeSA9IHUuY1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnByZXZZICE9PSB5ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGMoIHUuaCArIDEgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldlkgPSB5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMucHJldlkgPSAwOy8vLTE7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsYyggdS5oICsgMSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhcHBseUNhbGM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnVpcy5sZW5ndGgsIHRoaXMudG1wSCApXHJcblxyXG4gICAgICAgIHRoaXMuY2FsYyggdGhpcy50bXBIICk7XHJcbiAgICAgICAgLy90aGlzLnRtcEggPSAwO1xyXG4gICAgICAgIHRoaXMudG1wQWRkID0gbnVsbDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNhbGNVaXM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgUm9vdHMuY2FsY1VpcyggdGhpcy51aXMsIHRoaXMuem9uZSwgdGhpcy56b25lLnkgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHJlbW92ZSBvbmUgbm9kZVxyXG5cclxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCBuICkgeyBcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLnVpcy5pbmRleE9mKCBuICk7IFxyXG4gICAgICAgIGlmICggaSAhPT0gLTEgKSB0aGlzLnVpc1tpXS5jbGVhcigpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gY2FsbCBhZnRlciB1aXMgY2xlYXJcclxuXHJcbiAgICBjbGVhck9uZTogZnVuY3Rpb24gKCBuICkgeyBcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLnVpcy5pbmRleE9mKCBuICk7IFxyXG4gICAgICAgIGlmICggaSAhPT0gLTEgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5uZXIucmVtb3ZlQ2hpbGQoIHRoaXMudWlzW2ldLmNbMF0gKTtcclxuICAgICAgICAgICAgdGhpcy51aXMuc3BsaWNlKCBpLCAxICk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIGNsZWFyIGFsbCBndWlcclxuXHJcbiAgICBjbGVhcjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICB2YXIgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMudWlzW2ldLmNsZWFyKCk7XHJcblxyXG4gICAgICAgIHRoaXMudWlzID0gW107XHJcbiAgICAgICAgUm9vdHMubGlzdGVucyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGMoIC10aGlzLmggKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSVRFTVMgU1BFQ0lBTFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgICByZXNldEl0ZW06IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzSXRlbU1vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSkgdGhpcy51aXNbaV0uc2VsZWN0ZWQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldEl0ZW06IGZ1bmN0aW9uICggbmFtZSApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzSXRlbU1vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIHZhciBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICBpZiggdGhpcy51aXNbaV0udmFsdWUgID09PSBuYW1lICl7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy51aXNbaV0uc2VsZWN0ZWQoIHRydWUgKTtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzU2Nyb2xsICkgdGhpcy51cGRhdGUoICggaSoodGhpcy5zaXplLmgrMSkgKSp0aGlzLnJhdGlvICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU0NST0xMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdXBTY3JvbGw6IGZ1bmN0aW9uICggYiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5zdyA9IGIgPyB0aGlzLnNpemUucyA6IDA7XHJcbiAgICAgICAgdGhpcy5veSA9IGIgPyB0aGlzLm95IDogMDtcclxuICAgICAgICB0aGlzLnNjcm9sbEJHLnN0eWxlLmRpc3BsYXkgPSBiID8gJ2Jsb2NrJyA6ICdub25lJztcclxuXHJcbiAgICAgICAgaWYoIGIgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudG90YWwgPSB0aGlzLmg7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1heFZpZXcgPSB0aGlzLm1heEhlaWdodDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmF0aW8gPSB0aGlzLm1heFZpZXcgLyB0aGlzLnRvdGFsO1xyXG4gICAgICAgICAgICB0aGlzLnNoID0gdGhpcy5tYXhWaWV3ICogdGhpcy5yYXRpbztcclxuXHJcbiAgICAgICAgICAgIC8vaWYoIHRoaXMuc2ggPCAyMCApIHRoaXMuc2ggPSAyMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmFuZ2UgPSB0aGlzLm1heFZpZXcgLSB0aGlzLnNoO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5veSA9IFRvb2xzLmNsYW1wKCB0aGlzLm95LCAwLCB0aGlzLnJhbmdlICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbEJHLnN0eWxlLmhlaWdodCA9IHRoaXMubWF4VmlldyArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsLnN0eWxlLmhlaWdodCA9IHRoaXMuc2ggKyAncHgnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SXRlbVdpZHRoKCB0aGlzLnpvbmUudyAtIHRoaXMuc3cgKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSggdGhpcy5veSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoIHkgKSB7XHJcblxyXG4gICAgICAgIHkgPSBUb29scy5jbGFtcCggeSwgMCwgdGhpcy5yYW5nZSApO1xyXG5cclxuICAgICAgICB0aGlzLmRlY2FsID0gTWF0aC5mbG9vciggeSAvIHRoaXMucmF0aW8gKTtcclxuICAgICAgICB0aGlzLmlubmVyLnN0eWxlLnRvcCA9IC0gdGhpcy5kZWNhbCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zY3JvbGwuc3R5bGUudG9wID0gTWF0aC5mbG9vciggeSApICsgJ3B4JztcclxuICAgICAgICB0aGlzLm95ID0geTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVTSVpFIEZVTkNUSU9OXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2FsYzogZnVuY3Rpb24gKCB5ICkge1xyXG5cclxuICAgICAgICB0aGlzLmggKz0geTtcclxuICAgICAgICBjbGVhclRpbWVvdXQoIHRoaXMudG1wICk7XHJcbiAgICAgICAgdGhpcy50bXAgPSBzZXRUaW1lb3V0KCB0aGlzLnNldEhlaWdodC5iaW5kKHRoaXMpLCAxMCApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0SGVpZ2h0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnRtcCApIGNsZWFyVGltZW91dCggdGhpcy50bXAgKTtcclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLmggKVxyXG5cclxuICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMuYmg7XHJcbiAgICAgICAgdGhpcy5pc1Njcm9sbCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKXtcclxuXHJcbiAgICAgICAgICAgIHZhciBoaGggPSB0aGlzLmZvcmNlSGVpZ2h0ID8gdGhpcy5mb3JjZUhlaWdodCArIHRoaXMuem9uZS55IDogd2luZG93LmlubmVySGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tYXhIZWlnaHQgPSBoaGggLSB0aGlzLnpvbmUueSAtIHRoaXMuYmg7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGlmZiA9IHRoaXMuaCAtIHRoaXMubWF4SGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkaWZmKVxyXG5cclxuICAgICAgICAgICAgaWYoIGRpZmYgPiAxICl7IC8vdGhpcy5oID4gdGhpcy5tYXhIZWlnaHQgKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2Nyb2xsID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5tYXhIZWlnaHQgKyB0aGlzLmJoO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMuaCArIHRoaXMuYmg7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBTY3JvbGwoIHRoaXMuaXNTY3JvbGwgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbm5lckNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy56b25lLmggLSB0aGlzLmJoICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNvbnRlbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy56b25lLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuYm90dG9tLnN0eWxlLnRvcCA9IHRoaXMuem9uZS5oIC0gdGhpcy5iaCArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmZvcmNlSGVpZ2h0ICYmIHRoaXMubG9ja0hlaWdodCApIHRoaXMuY29udGVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmZvcmNlSGVpZ2h0ICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgdGhpcy5jYWxjVWlzKCk7XHJcbiAgICAgICAgaWYoIHRoaXMuaXNDYW52YXMgKSB0aGlzLmRyYXcoIHRydWUgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFdpZHRoOiBmdW5jdGlvbiAoIHcgKSB7XHJcblxyXG4gICAgICAgIGlmKCB3ICkgdGhpcy56b25lLncgPSB3O1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnQuc3R5bGUud2lkdGggPSB0aGlzLnpvbmUudyArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzQ2VudGVyICkgdGhpcy5jb250ZW50LnN0eWxlLm1hcmdpbkxlZnQgPSAtKE1hdGguZmxvb3IodGhpcy56b25lLncqMC41KSkgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnNldEl0ZW1XaWR0aCggdGhpcy56b25lLncgLSB0aGlzLnN3ICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0NhbnZhc09ubHkgKSBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuICAgICAgICAvL3RoaXMucmVzaXplKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRJdGVtV2lkdGg6IGZ1bmN0aW9uICggdyApIHtcclxuXHJcbiAgICAgICAgdmFyIGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uc2V0U2l6ZSggdyApO1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5yU2l6ZSgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG5cclxufSApO1xyXG5cclxuXHJcbmV4cG9ydCB7IEd1aSB9OyIsImltcG9ydCAnLi9wb2x5ZmlsbHMuanMnO1xyXG5cclxuZXhwb3J0IHZhciBSRVZJU0lPTiA9ICcyLjY2JztcclxuXHJcbmV4cG9ydCB7IFRvb2xzIH0gZnJvbSAnLi9jb3JlL1Rvb2xzLmpzJztcclxuZXhwb3J0IHsgR3VpIH0gZnJvbSAnLi9jb3JlL0d1aS5qcyc7XHJcbmV4cG9ydCB7IFByb3RvIH0gZnJvbSAnLi9jb3JlL1Byb3RvLmpzJztcclxuZXhwb3J0IHsgYWRkIH0gZnJvbSAnLi9jb3JlL2FkZC5qcyc7XHJcbi8vXHJcbmV4cG9ydCB7IEJvb2wgfSBmcm9tICcuL3Byb3RvL0Jvb2wuanMnO1xyXG5leHBvcnQgeyBCdXR0b24gfSBmcm9tICcuL3Byb3RvL0J1dHRvbi5qcyc7XHJcbmV4cG9ydCB7IENpcmN1bGFyIH0gZnJvbSAnLi9wcm90by9DaXJjdWxhci5qcyc7XHJcbmV4cG9ydCB7IENvbG9yIH0gZnJvbSAnLi9wcm90by9Db2xvci5qcyc7XHJcbmV4cG9ydCB7IEZwcyB9IGZyb20gJy4vcHJvdG8vRnBzLmpzJztcclxuZXhwb3J0IHsgR3JvdXAgfSBmcm9tICcuL3Byb3RvL0dyb3VwLmpzJztcclxuZXhwb3J0IHsgSm95c3RpY2sgfSBmcm9tICcuL3Byb3RvL0pveXN0aWNrLmpzJztcclxuZXhwb3J0IHsgS25vYiB9IGZyb20gJy4vcHJvdG8vS25vYi5qcyc7XHJcbmV4cG9ydCB7IExpc3QgfSBmcm9tICcuL3Byb3RvL0xpc3QuanMnO1xyXG5leHBvcnQgeyBOdW1lcmljIH0gZnJvbSAnLi9wcm90by9OdW1lcmljLmpzJztcclxuZXhwb3J0IHsgU2xpZGUgfSBmcm9tICcuL3Byb3RvL1NsaWRlLmpzJztcclxuZXhwb3J0IHsgVGV4dElucHV0IH0gZnJvbSAnLi9wcm90by9UZXh0SW5wdXQuanMnO1xyXG5leHBvcnQgeyBUaXRsZSB9IGZyb20gJy4vcHJvdG8vVGl0bGUuanMnOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQSxLQUFLLE1BQU0sQ0FBQyxPQUFPLEtBQUssU0FBUyxHQUFHOztDQUVuQyxNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7O0NBRXJDOzs7O0FBSUQsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsR0FBRzs7OztDQUk5QixJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxHQUFHOztFQUUxQixPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDOztFQUU3QyxDQUFDOztDQUVGOztBQUVELEtBQUssUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHOzs7OztDQUs1QyxNQUFNLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsTUFBTSxFQUFFOztFQUVsRCxHQUFHLEVBQUUsWUFBWTs7R0FFaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxFQUFFLDJCQUEy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QUcsQ0FBQyxFQUFFO1lBQ2hCLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuRDtRQUNELENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDOzs7UUFHWCxJQUFJLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwQixDQUFDLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNwQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNyRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDcEM7O1FBRUQsT0FBTyxHQUFHLENBQUM7O0tBRWQ7O0lBRUQsYUFBYSxFQUFFLFdBQVcsQ0FBQyxHQUFHOztRQUUxQixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssR0FBRyxDQUFDOztLQUV4RDs7O0lBR0QsU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUFHO1FBQ3RCLENBQUMsR0FBRyxDQUFDLEtBQUssU0FBUyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDbkMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7S0FFdkQ7O0lBRUQsU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUFHOztRQUV0QixPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDOztLQUU3Qzs7SUFFRCxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFOztRQUVsQixPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDOztLQUVwRDs7SUFFRCxHQUFHLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHOztRQUVuQixPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDOztLQUVuRDs7SUFFRCxNQUFNLEVBQUUsVUFBVSxDQUFDLEVBQUU7O1FBRWpCLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDbEUsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7S0FFekU7O0lBRUQsT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFOztRQUVsQixPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQzs7S0FFNUc7O0lBRUQsUUFBUSxHQUFHLFVBQVUsQ0FBQyxFQUFFOztRQUVwQixPQUFPLEdBQUcsR0FBRyxFQUFFLFFBQVEsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLFFBQVEsRUFBRSxFQUFFLEVBQUUsR0FBRyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7S0FFaEk7O0lBRUQsUUFBUSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7O1FBRXpCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BCLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDOUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMxRCxPQUFPLENBQUMsQ0FBQzs7S0FFWjs7SUFFRCxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQUc7O1FBRXJCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUN6SSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO1lBQ1gsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUM7WUFDL0MsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUM7WUFDckQsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUM7WUFDckQsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNWO1FBQ0QsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0tBRXRCOztJQUVELFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRzs7UUFFckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztRQUV2QyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDN0I7WUFDRCxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQy9DLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNkLE9BQU8sRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FB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Q3BDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztRQUNsSCxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQy9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7O1FBRTVCLElBQUksS0FBSyxLQUFLLENBQUMsRUFBRTs7Ozs7WUFLYixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3BILENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7O1lBRzdHLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUMxRCxDQUFDLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7OztZQUc5RyxJQUFJLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDOUQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDOztZQUU5RCxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUM5RSxDQUFDLENBQUMsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7O1lBRS9HLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzlFLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7OztZQUloSCxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDMUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ3hGLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7WUFFakYsQ0FBQyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7O1NBRXRCLE1BQU07O1lBRUgsR0FBRyxHQUFHLEVBQUUsQ0FBQyxF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QztZQUNYLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUNsQixFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQztZQUNyQixHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDOztZQUVwQyxFQUFFLEdBQUc7Z0JBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUMzQixJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRztnQkFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2FBQzlCLENBQUM7O1lBRUYsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDOztZQUVsRCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7O2dCQUVQLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ04sTUFBTSxDQUFDLEVBQUUsQ0FBQzttQkFDUCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDckM7O2dCQUVELElBQUksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Z0JBRTNGLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDM0MsQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDOztnQkFFbkksQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7O2FBRTdHO1lBQ0QsRUFBRSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUM7WUFDaEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxBQUNBLFNBQVM7O1FBRUQsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4QixJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7OztRQUdaLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3pGLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7O1FBR3ZJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkUsQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDOztRQUV2SSxDQUFDLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDakUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7Ozs7O1FBTXZFLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDOUYsQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7O1FBRzlGLENBQUMsQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDOztLQUVyQjs7SUFFRCxJQUFJLEVBQUUsV0FBVyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTs7UUFFN0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWixLQUFLLEdBQUcsS0FB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LEdBQUcsS0FBSyxDQUFDOztJQUUxQixJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7O0lBR3RCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7SUFFaEQsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNyRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7SUFFckMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNyRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7SUFHckQsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQzs7O0lBR2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDOzs7SUFHcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQzs7O0lBRzVCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDOzs7SUFHdEIsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENB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RS9CLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsS0FBSyxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7SUFDN0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7O0lBRXhCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzs7O0lBRzVHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDOzs7SUFHWixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7O0lBR1osSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyw4REFBOEQsQ0FBQyxDQUFDO0lBQy9HLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7O0lBRTVCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7OztJQUcvQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzVCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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Q0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOztJQUVwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7SUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDOztJQUV0QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDOzs7O0lBSTFCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM3SSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDOztJQUU1QixJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUU7UUFDVCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDdkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0tBQzVCOztJQUVELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ2hDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsSUFBSSxRQUFRLENBQUM7O0lB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SSxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7S0FFckUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7S0FFdkMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztLQUVqRixJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7S0FDdkMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQ3ZDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDOztFQUU3Qzs7Q0FFRCxLQUFLLEVBQUUsWUFBWTs7S0FFZixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7O0tBRW5DLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7O0tBRWYsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztLQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDOztLQUUzQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZELElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUN2RCxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQzs7O0tBRzFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN0RSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0tBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7S0FDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJ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QUMsTUFBTSxHQUFHLEtBQUssQ0FBQzs7SUFFcEIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzs7SUFFZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQzs7SUFFekIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzlELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7Ozs7O0lBS3RDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7UUFFcEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkIsT0FBTyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztRQUUzQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDOztRQUUzQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUks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LENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDOztLQUU5Qjs7Q0FFSixFQUFFLENBQUM7O0FDcFVKLFNBQVMsS0FBSyxHQUFHLENBQUMsR0FBRzs7Q0FFcEIsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0NBRXRCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7SUFFN0IsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUM3RCxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDO0lBQzFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUM7O0lBRTFCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Ozs7SUFJbEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUNoRSxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7SUFFdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7O0lBRXBCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ3pCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDdEIsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7O0lBRWIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDOztJQUVyQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHOztRQUUxQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7Ozs7O1FBS3JDLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7O0tBRWhCOztJQUVELElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7SUFFdEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7SUFFbkMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztJQUM5SSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDOztJQUUxRSxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7SUFDdkgsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDOztJQUV4SSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoRCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQzs7SUFFaEIsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7O0lBRVosS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O0tBRWxDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7S0FDN0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O1FBRWYsSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7VUFDeEUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7O0tBRXBELElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDOztLQUVuSDs7SUFFRCxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDOzs7O0lBSWhCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7SUFFWixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO1FBQ3pCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDO1FBQzlCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFJO0tBQ3JDOztJQUVELElBQUksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUM7O0NBRXhCOztBQUVELEtBQUssQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUUsRUFBRTs7SUFFL0QsV0FBVyxFQUFFLEtBQUs7O0lBRWxCLFNBQVMsRUFBRSxZQUFZOztRQUVuQixJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7O1FBRWxFLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFOzs7WUFHNUIsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzNELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3ZFLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUNuRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxJQUFJLE9B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QUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDOztRQUVuQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3pELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7UUFFM0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O1FBRTFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7UUFFWCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTs7WUFFL0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O1NBRS9COztRQUVELElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDOztLQUVoQjs7Q0FFSixFQUFFLENBQUM7O0FDalJKOztBQUVBLFNBQVMsS0FBSyxHQUFHLENBQUMsR0FBRzs7SUFFakIsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0lBRXRCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQzs7SUFFakIsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7O0lBRWQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzs7SUFFbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7O0lBRWYsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOztJQUVwQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUVyQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDOztJQUVwRCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLHdEQUF3RCxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEgsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRywwREFBMEQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2pMLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsNERBQTRELENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs7SUFFbkwsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksaUZBQWlGLENBQUMsQ0FBQzs7SUFFbEosSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQzs7SUFFZixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDNUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDOztJQUV6QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQzs7SUFFekIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzdELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7OztJQUd0QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O0lBRVosSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMxQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7Q0FFMUM7O0FBRUQsS0FBSyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFOztJQUUvRCxXQUFXLEVBQUUsS0FBSzs7SUFFbEIsT0FBTyxFQUFFLElBQUk7O0lBRWIsUUFBUSxFQUFFLFdBQVcsQ0FBQyxHQUFHOztRQUVyQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDOztRQUV6QyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7O1FBRWQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQzthQUNqQztZQUNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsU0FBUyxDQUFDO1NBQ3RDOztRQUVELE9BQU8sSUFBSSxDQUFDOztLQUVmOztJQUVELFdBQVcsRUFBRSxZQUFZOztRQUVyQixJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLEdBQUcsT0FBTyxLQUFLLENBQUM7OztRQUd2QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxPQUFPLElBQUksQ0FBQzs7S0FFZjs7SUFFRCxLQUFLLEVBQUUsWUFBWTs7UUFFZixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7O0tBRXRCOzs7Ozs7SUFNRCxXQUFXLEVBQUUsV0FBVyxDQUFDLEdBQUc7O1FBRXhCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7O1FBRWxCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7O1FBRXpCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7O1FBRTlCLElBQUksQ0FBQyxJQUFJLEdBQUcsT0FBTzs7UUFFbkIsUUFBUSxJQUFJOztZQUVSLEtBQUssU0FBUztZQUNkLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7WUFFZCxJQUFJLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxLQUFLLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7WUFFdkUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7OztZQUk5RCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQzs7WUFFNUMsTUFBTTtZQUNOLEtBQUssT0FBTztZQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdkIsSUFBSSxJQUFJLEtBQUssV0FBVyxFQUFFO2dCQUN0QixJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3FCQUMxQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDcEI7WUFDRCxNQUFNOzs7U0FHVDs7UUFFRCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNoQyxJQUFJLFlBQVksR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDOztRQUVqQyxPQUFPLE1BQU0sQ0FBQzs7S0FFakI7O0lBRUQsT0FBTyxFQUFFLFdBQVcsQ0FBQyxFQUFFLE1BQU0sR0FBRzs7UUFFNUIsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDOztRQUUzQyxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNoQyxBQUNBLFNBQVM7O1FBRUQsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDYixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDeEI7O0tBRUo7Ozs7SUFJRCxLQUFLLEVBQUUsWUFBWTs7UUFFZixJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3JCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFOztnQkFFZCxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqQjtvQkFDRCxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztpQkFDOUI7Z0JBQ0QsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7OztnQkFHWCxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDVixJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQzs7YUFFaEM7aUJBQ0ksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25COztRQUVELE9BQU8sQ0FBQyxDQUFDO0tBQ1o7O0lBRUQsT0FBTyxFQUFFLFlBQVk7O1FBRWpCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU87O1FBRTFCLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7S0FFbEU7OztJQUdELEtBQUssRUFBRSxXQUFXLENBQUMsR0FBRzs7UUFFbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDOztRQUV6QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUN4QixNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDMUI7O0tBRUo7O0lBRUQsR0FBRyxFQUFFLFlBQVk7O1FBRWIsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDOztRQUVsQixJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtZQUMxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDdEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztTQUN6QixNQUFNLElBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDdEY7Z0JBQ0EsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3pCO1NBQ0o7OztRQUdELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQzs7UUFFbkIsSUFBSSxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDOztRQUV4QyxPQUFPLENBQUMsQ0FBQzs7S0FFWjs7SUFFRCxZQUFZLEVBQUUsV0FBVyxDQUFDLEdBQUc7O1FBRXpCLEtBQUssSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDdkQsS0FBSyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDOztLQUU3Qzs7SUFFRCxJQUFJLEVBQUUsWUFBWTs7UUFFZCxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7O1FBRWxDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNuRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7O1FBRXBCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7UUFFNUIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUUsQ0FBQzs7S0FFMUI7O0lBRUQsS0FBSyxFQUFFLFlBQVk7O1FBRWYsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDOztRQUVuQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7O1FBRTVCLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMvQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7O1FBRWpDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7S0FFM0I7O0lBRUQsS0FBSyxFQUFFLFlBQVk7O1FBRWYsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xCLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMvQyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7O0tBRXRDOztJQUVELFVBQVUsRUFBRSxZQUFZOztRQUVwQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O1FBRWIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDeEIsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNsQjtRQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDOztLQUV2Qjs7SUFFRCxJQUFJLEVBQUUsV0FBVyxDQUFDLEdBQUc7O1FBRWpCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU87O1FBRTFCLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUNqQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNaLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUN2QyxNQUFNO1lBQ0gsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztTQUN0QztRQUNELElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDOzs7O0tBSXBDOztJQUVELFlBQVksRUFBRSxZQUFZOztRQUV0QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUN4QixNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ04sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDdkI7UUFDRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7O0tBRWY7O0lBRUQsS0FBSyxFQUFFLFlBQVk7O1FBRWYsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDOztRQUVuQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOztRQUVmLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLElBQUksQ0FBQztRQUM5QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7O1FBRTNCLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7O0tBRXpDOztDQUVKLEVBQUUsQ0FBQzs7QUN0VUosU0FBUyxRQUFRLEdBQUcsQ0FBQyxHQUFHOztJQUVwQixLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQzs7SUFFdEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7O0lBRXZCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRW5CLElBQUksQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO0lBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7O0lBRS9DLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7SUFDbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQzs7SUFFMUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0lBQ3BCLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQzs7SUFFcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7O0lBRXJCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQzs7SUFFakMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzVCLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDOztJQUViLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQzs7SUFFckMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRzs7UUFFMUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1FBQ3JDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDckMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7S0FFaEI7O0lBRUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDckksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzs7SUFFbkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUMzQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDOUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFD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RyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOztTQUVyRCxHQUFHLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDOztZQUVqQixJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDOztZQUVuQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ2pELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7U0FDcEQsTUFBTTtZQUNILElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztTQUNuRDs7OztRQUlELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFF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SSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDOztJQUVySSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7SUFFM0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3RELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUN0RCxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7O0lBR2xELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUNoRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQzs7SUFFL0UsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O0lBRVgsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDOztJQUVaLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7Q0FFakI7O0FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxFQUFFOztJQUVqRSxXQUFXLEVBQUUsSUFBSTs7SUFFakIsSUFBSSxFQUFFLFdBQVcsSUFBSSxHQUFHOztRQUVwQixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxHQUFHLE9BQU8sS0FBSyxDQUFDOztRQUV2QyxPQUFPLElBQUk7WUFDUCxLQUFLLENBQUM7Z0JBQ0YsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzs7Z0JBRXRELElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUMxRCxNQUFNO1lBQ04sS0FBSyxDQUFDO2dCQUNGLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7O2dCQUV0RCxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUM7WUFDMUQsTUFBTTtTQUNUOztRQUVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLE9BQU8sSUFBSSxDQUFDOztLQUVmOzs7O0lBSUQsU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUFHOzs7O1FBSXRCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU87O1FBRTFCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7O1FBRXRCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDbEQsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOztRQUU3RCxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7UUFFdEMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7O1FBRTlGLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDOztR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LENBQUMsQ0FBQyxDQUFDOzs7SUFHN0MsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQzs7SUFFNUIsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDWixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7SUFDcEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7O0lBRXBCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDOzs7SUFHcEIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQztJQUM3QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7O0lBRXZDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTs7UUFFVCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO1FBQzdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFDN0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQzs7O1FBRzdCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDekMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQzs7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QyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQzs7SUFFMUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7SUFFckMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyw0REFBNEQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7O0lBRTlLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7O0lBRWpDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7Q0FFZjs7QUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUU7O0lBRTlELFdBQVcsRUFBRSxJQUFJOzs7Ozs7SUFNakIsU0FBUyxFQUFFLFdBQVcsQ0FBQyxHQUFHOztRQUV0QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzs7O0tBSTFCOztJQUVELFNBQVMsRUFBRSxXQUFXLENBQUMsR0FBRzs7UUFFdEIsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7O1FBRXRDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7O1FBRXRCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7UUFFWixPQUFPLElBQUksQ0FBQzs7S0FFZjs7SUFFRCxLQUFLLEVBQUUsWUFBWTs7UUFFZixJ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LFVBQVUsRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQzVDLEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDdEMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUNsQyxLQUFLLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ3RDLEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDdEMsS0FBSyxVQUFVLEVBQUUsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUM1QyxLQUFLLE1BQU0sRUFBRSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ3BDLEtBQUssTUFBTSxFQUFFLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDcEMsS0FBSyxTQUFTLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQ3pELEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDdEMsS0FBSyxXQUFXLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRSxDQUFDLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO1FBQzdELEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07UUFDdEMsS0FBSyxVQUFVLEVB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QyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDMUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOztJQUUxQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7SUFHbEQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7O0lBRzdDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7SUFFNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzs7OztJQUtaLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDMUQsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDOztJQUU5QyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLEtBQUssU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDOztJQUVuRSxJQUFJLENBQUMsUUFBUSxH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
