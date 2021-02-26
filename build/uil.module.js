/**
 * @author lth / https://github.com/lo-th
 */

const T = {

    frag: document.createDocumentFragment(),

    colorRing: null,
    joystick_0: null,
    joystick_1: null,
    circular: null,
    knob: null,

    svgns: "http://www.w3.org/2000/svg",
    links: "http://www.w3.org/1999/xlink",
    htmls: "http://www.w3.org/1999/xhtml",

    DOM_SIZE: [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'],
    SVG_TYPE_D: [ 'pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient', 'animateMotion', 'use', 'filter', 'feColorMatrix' ],
    SVG_TYPE_G: [ 'svg', 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject' ],

    PI: Math.PI,
    TwoPI: Math.PI*2,
    pi90: Math.PI * 0.5,
    pi60: Math.PI/3,
    
    torad: Math.PI / 180,
    todeg: 180 / Math.PI,

    clamp: function (v, min, max) {

        v = v < min ? min : v;
        v = v > max ? max : v;
        return v;

    },

    size: {  w: 240, h: 20, p: 30, s: 20 },

    // ----------------------
    //   COLOR
    // ----------------------

    cloneColor: function () {

        let cc = Object.assign({}, T.colors );
        return cc;

    },

    cloneCss: function () {

        let cc = Object.assign({}, T.css );
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
        inputHolder: '#808080',
        inputBorderSelect: '#005AAA',
        inputBg: 'rgba(0,0,0,0.1)',
        inputOver: 'rgba(0,0,0,0.2)',

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
        action: '#FF3300',

        stroke: 'rgba(11,11,11,0.5)',
        scroll: '#333333',

        hide: 'rgba(0,0,0,0)',

        groupBorder: 'none',
        buttonBorder: 'none',

    },

    // style css

    css : {
        //unselect: '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;', 
        basic: 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; overflow:hidden; ' + '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;',
        button:'display:flex; justify-content:center; align-items:center; text-align:center;',
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
        map:'M 13 1 L 1 1 1 13 13 13 13 1 M 12 2 L 12 7 7 7 7 12 2 12 2 7 7 7 7 2 12 2 Z',
        material:'M 13 1 L 1 1 1 13 13 13 13 1 M 12 2 L 12 7 7 7 7 12 2 12 2 7 7 7 7 2 12 2 Z',
        texture:'M 13 4 L 13 1 1 1 1 4 5 4 5 13 9 13 9 4 13 4 Z',
        object:'M 10 1 L 7 4 4 1 1 1 1 13 4 13 4 5 7 8 10 5 10 13 13 13 13 1 10 1 Z',
        none:'M 9 5 L 5 5 5 9 9 9 9 5 Z',
        cursor:'M 4 7 L 1 10 1 12 2 13 4 13 7 10 9 14 14 0 0 5 4 7 Z',

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
        css.txtselect = css.txt + 'display:flex; justify-content:left; align-items:center; text-align:left;' +'padding:2px 5px; border:1px dashed ' + colors.border + '; background:'+ colors.txtselectbg+';';
        css.item = css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px;';

    },

    clone: function ( o ) {

        return o.cloneNode( true );

    },

    setSvg: function( dom, type, value, id, id2 ){

        if( id === -1 ) dom.setAttributeNS( null, type, value );
        else if( id2 !== undefined ) dom.childNodes[ id || 0 ].childNodes[ id2 || 0 ].setAttributeNS( null, type, value );
        else dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

    },

    setCss: function( dom, css ){

        for( let r in css ){
            if( T.DOM_SIZE.indexOf(r) !== -1 ) dom.style[r] = css[r] + 'px';
            else dom.style[r] = css[r];
        }

    },

    set: function( g, o ){

        for( let att in o ){
            if( att === 'txt' ) g.textContent = o[ att ];
            if( att === 'link' ) g.setAttributeNS( T.links, 'xlink:href', o[ att ] );
            else g.setAttributeNS( null, att, o[ att ] );
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

          /*  } else if ( type === 'use' ) {

                dom = document.createElementNS( T.svgns, 'use' );
                T.set( dom, obj );
*/
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

        let g = document.createElementNS( T.svgns, type );
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

        let a = dom.attributes, i, n;
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

    // ----------------------
    //   Color function
    // ----------------------

    ColorLuma : function ( hex, l ) {

        if( hex === 'n' ) hex = '#000';

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        l = l || 0;

        // convert to decimal and change luminosity
        let rgb = "#", c, i;
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

    pad: function( n ){
        if(n.length == 1)n = '0' + n;
        return n;
    },

    rgbToHex : function( c ){

        let r = Math.round(c[0] * 255).toString(16);
        let g = Math.round(c[1] * 255).toString(16);
        let b = Math.round(c[2] * 255).toString(16);
        return '#' + T.pad(r) + T.pad(g) + T.pad(b);

       // return '#' + ( '000000' + ( ( c[0] * 255 ) << 16 ^ ( c[1] * 255 ) << 8 ^ ( c[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

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

        let r = c[0], g = c[1], b = c[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
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

        let p, q, h = c[0], s = c[1], l = c[2];

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

        let n = parent.childNodes[0].childNodes.length - 1, c;

        for( let i = 0; i < colors.length; i++ ){

            c = colors[i];
            //T.dom( 'stop', null, { offset:c[0]+'%', style:'stop-color:'+c[1]+'; stop-opacity:'+c[2]+';' }, parent, [0,n] );
            T.dom( 'stop', null, { offset:c[0]+'%', 'stop-color':c[1],  'stop-opacity':c[2] }, parent, [0,n] );

        }

    },

    /*makeGraph: function () {

        let w = 128;
        let radius = 34;
        let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'butt' }, svg );//0
        //T.dom( 'rect', '', { x:10, y:10, width:108, height:108, stroke:'rgba(0,0,0,0.3)', 'stroke-width':2 , fill:'none'}, svg );//1
        //T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
        
        //T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.3)', 'stroke-width':7 , fill:'none'}, svg );//2
        //T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
        T.graph = svg;

    },*/

    makeKnob: function ( model ) {

        let w = 128;
        let radius = 34;
        let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'round' }, svg );//1
        T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.1)', 'stroke-width':7 , fill:'none'}, svg );//2
        T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
        T.knob = svg;

    },

    makeCircular: function ( model ) {

        let w = 128;
        let radius = 40;
        let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'circle', '', { cx:64, cy:64, r:radius, stroke:'rgba(0,0,0,0.1)', 'stroke-width':10, fill:'none' }, svg );//0
        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':7, fill:'none', 'stroke-linecap':'butt' }, svg );//1
        T.circular = svg;

    },

    makeJoystick: function ( model ) {

        //+' background:#f00;'

        let w = 128, ccc;
        let radius = Math.floor((w-30)*0.5);
        let innerRadius = Math.floor(radius*0.6);
        let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'defs', null, {}, svg );
        T.dom( 'g', null, {}, svg );

        if( model === 0 ){

        

            // gradian background
            ccc = [ [40, 'rgb(0,0,0)', 0.3], [80, 'rgb(0,0,0)', 0], [90, 'rgb(50,50,50)', 0.4], [100, 'rgb(50,50,50)', 0] ];
            T.makeGradiant( 'radialGradient', { id:'grad', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

            // gradian shadow
            ccc = [ [60, 'rgb(0,0,0)', 0.5], [100, 'rgb(0,0,0)', 0] ];
            T.makeGradiant( 'radialGradient', { id:'gradS', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

            // gradian stick
            let cc0 = ['rgb(40,40,40)', 'rgb(48,48,48)', 'rgb(30,30,30)'];
            let cc1 = ['rgb(1,90,197)', 'rgb(3,95,207)', 'rgb(0,65,167)'];

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

        let w = 256;
        let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'defs', null, {}, svg );
        T.dom( 'g', null, {}, svg );

        let s = 30;//stroke
        let r =( w-s )*0.5;
        let mid = w*0.5;
        let n = 24, nudge = 8 / r / n * Math.PI, a1 = 0;
        let am, tan, d2, a2, ar, i, j, path, ccc;
        let color = [];
        
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

        let tw = 84.90;

        // black / white
        ccc = [ [0, '#FFFFFF', 1], [50, '#FFFFFF', 0], [50, '#000000', 0], [100, '#000000', 1] ];
        T.makeGradiant( 'linearGradient', { id:'GL0', x1:0, y1:mid-tw, x2:0, y2:mid+tw, gradientUnits:"userSpaceOnUse" }, svg, ccc );

        ccc = [ [0, '#7f7f7f', 1], [50, '#7f7f7f', 0.5], [100, '#7f7f7f', 0] ];
        T.makeGradiant( 'linearGradient', { id:'GL1', x1:mid-49.05, y1:0, x2:mid+98, y2:0, gradientUnits:"userSpaceOnUse" }, svg, ccc );

        T.dom( 'g', null, { 'transform-origin': '128px 128px', 'transform':'rotate(0)' }, svg );//2
        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'red'  }, svg, 2 );// 2,0
        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'url(#GL1)','stroke-width':1, stroke:'url(#GL1)'  }, svg, 2 );//2,1
        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'url(#GL0)','stroke-width':1, stroke:'url(#GL0)'  }, svg, 2 );//2,2
        T.dom( 'path', '', { d:'M 255.75 136.5 Q 256 132.3 256 128 256 123.7 255.75 119.5 L 241 128 255.75 136.5 Z',  fill:'none','stroke-width':2, stroke:'#000'  }, svg, 2 );//2,3
        //T.dom( 'circle', '', { cx:128+113, cy:128, r:6, 'stroke-width':3, stroke:'#000', fill:'none' }, svg, 2 );//2.3

        T.dom( 'circle', '', { cx:128, cy:128, r:6, 'stroke-width':2, stroke:'#000', fill:'none' }, svg );//3

        T.colorRing = svg;

    },

    icon: function ( type, color, w ){

        w = w || 40;
        color = color || '#DEDEDE';
        let viewBox = '0 0 256 256';
        let t = ["<svg xmlns='"+T.svgns+"' version='1.1' xmlns:xlink='"+T.htmls+"' style='pointer-events:none;' preserveAspectRatio='xMinYMax meet' x='0px' y='0px' width='"+w+"px' height='"+w+"px' viewBox='"+viewBox+"'><g>"];
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

const Tools = T;

/**
 * @author lth / https://github.com/lo-th
 */

// INTENAL FUNCTION

const R = {

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

        let n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
        else return false;  

    },

    remove: function ( o ) {

        let i = R.ui.indexOf( o );
        
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

        let dom = document.body;

        R.isMobile = R.testMobile();

        if( R.isMobile ){
            dom.addEventListener( 'touchstart', R, false );
            dom.addEventListener( 'touchend', R, false );
            dom.addEventListener( 'touchmove', R, false );
        }else {
            dom.addEventListener( 'mousedown', R, false );
            dom.addEventListener( 'contextmenu', R, false );
            dom.addEventListener( 'wheel', R, false );
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

        let dom = document.body;

        if( R.isMobile ){
            dom.removeEventListener( 'touchstart', R, false );
            dom.removeEventListener( 'touchend', R, false );
            dom.removeEventListener( 'touchmove', R, false );
        }else {
            dom.removeEventListener( 'mousedown', R, false );
            dom.removeEventListener( 'contextmenu', R, false );
            dom.removeEventListener( 'wheel', R, false );
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

        let i = R.ui.length, u;
        
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
       
        let e = R.e;

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

        let i = R.ui.length, next = -1, u, x, y;

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

        let lng = uis.length, u, i, px = 0, my = 0;

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

        let i = uis.length;

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

        let z = o.zone;
        let mx = x - z.x;
        let my = y - z.y;

        let over = ( mx >= 0 ) && ( my >= 0 ) && ( mx <= z.w ) && ( my <= z.h );

        if( over ) o.local.set( mx, my );
        else o.local.neg();

        return over;

    },

    getZone: function ( o ) {

        if( o.isCanvasOnly ) return;
        let r = o.getDom().getBoundingClientRect();
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

        let isNewSize = false;
        if( w !== o.canvas.width || h !== o.canvas.height ) isNewSize = true;

        if( R.tmpImage === null ) R.tmpImage = new Image();

        let img = R.tmpImage; //new Image();

        let htmlString = R.xmlserializer.serializeToString( o.content );
        
        let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><foreignObject style="pointer-events: none; left:0;" width="100%" height="100%">'+ htmlString +'</foreignObject></svg>';

        img.onload = function() {

            let ctx = o.canvas.getContext("2d");

            if( isNewSize ){ 
                o.canvas.width = w;
                o.canvas.height = h;
            }else {
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

            let hide = R.debugInput ? '' : 'opacity:0; zIndex:0;';

            let css = R.parent.css.txt + 'padding:0; width:auto; height:auto; text-shadow:none;';
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

        let i = R.str.length, l = 0, n = 0;
        while( i-- ){
            l += R.textWidth( R.str[n] );
            if( l >= x ) break;
            n++;
        }
        return n;

    },

    upInput: function ( x, down ) {

        if( R.parent === null ) return false;

        let up = false;
     
        if( down ){

            let id = R.clickPos( x );

            R.moveX = id;

            if( R.startX === -1 ){ 

                R.startX = id;
                R.cursorId = id;
                R.inputRange = [ R.startX, R.startX ];

            } else {
            
                let isSelection = R.moveX !== R.startX;

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
        if( !R.firstImput ) R.parent.validate( true );

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

        let keyCode = e.which; e.shiftKey;

        //console.log( keyCode )

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

        //} else if( keyCode === 9 ){ //tab key

           // R.input.textContent = '';

        } else {

            if( R.input.isNum ){
                if ( ((e.keyCode > 47) && (e.keyCode < 58)) || ((e.keyCode > 95) && (e.keyCode < 106)) || e.keyCode === 190 || e.keyCode === 110 || e.keyCode === 8 || e.keyCode === 109 ){
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

        if( R.parent.allEqual ) R.parent.sameStr( R.str );// numeric samùe value
        else R.input.textContent = R.str;

        R.cursorId = R.hiddenImput.selectionStart;
        R.inputRange = [ R.hiddenImput.selectionStart, R.hiddenImput.selectionEnd ];

        R.selectParent();

        //if( R.parent.allway ) 
        R.parent.validate();

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

        let i = R.listens.length;
        while( i-- ) R.listens[i].listening();

    },

    removeListen: function ( proto ) {

        let id = R.listens.indexOf( proto );
        if( id !== -1 ) R.listens.splice(id, 1);
        if( R.listens.length === 0 ) R.isLoop = false;

    },

    addListen: function ( proto ) {

        let id = R.listens.indexOf( proto );

        if( id !== -1 ) return; 

        R.listens.push( proto );

        if( !R.isLoop ){
            R.isLoop = true;
            R.loop();
        }

    },

};

const Roots = R;

class V2 {

	constructor( x = 0, y = 0 ) {

		this.x = x;
		this.y = y;

	}

	set ( x, y ) {

		this.x = x;
		this.y = y;
		return this;

	}

	divide ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		return this;

	}

	multiply ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		return this;

	}

	multiplyScalar ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		return this;

	}

	divideScalar ( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	length () {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}

	angle () {

		// computes the angle in radians with respect to the positive x-axis

		var angle = Math.atan2( this.y, this.x );

		if ( angle < 0 ) angle += 2 * Math.PI;

		return angle;

	}

	addScalar ( s ) {

		this.x += s;
		this.y += s;
		return this;

	}

	negate () {

		this.x *= -1;
		this.y *= -1;
		return this;

	}

	neg () {

		this.x = -1;
		this.y = -1;
		return this;

	}

	isZero () {

		return ( this.x === 0 && this.y === 0 );

	}

	copy ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	}

	equals ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	}

	nearEquals ( v, n ) {

		return ( ( v.x.toFixed(n) === this.x.toFixed(n) ) && ( v.y.toFixed(n) === this.y.toFixed(n) ) );

	}

	lerp ( v, alpha ) {

		if( v === null ){
			this.x -= this.x * alpha;
		    this.y -= this.y * alpha;
		} else {
			this.x += ( v.x - this.x ) * alpha;
		    this.y += ( v.y - this.y ) * alpha;
		}

		return this;

	}

}

/**
 * @author lth / https://github.com/lo-th
 */

class Proto {

    constructor( o = {} ) {

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
        this.noNeg = o.noNeg || false;
        this.allEqual = o.allEqual || false;
        
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
        this.fontSelect = o.fontSelect || this.colors.textOver;

        if( o.color !== undefined ) this.fontColor = o.color;
            /*{ 

            if(o.color === 'n') o.color = '#ff0000';

            if( o.color !== 'no' ) {
                if( !isNaN(o.color) ) this.fontColor = Tools.hexToHtml(o.color);
                else this.fontColor = o.color;
                this.titleColor = this.fontColor;
            }
            
        }*/
        
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
            for(let p in o.pos){
                this.s[0][p] = o.pos[p];
            }
            this.mono = true;
        }

        if( o.css ) this.s[0].cssText = o.css; 
        

    }

    // ----------------------
    // make the node
    // ----------------------
    
    init () {

        this.zone.h = this.h;


        let s = this.s; // style cache
        let c = this.c; // div cach

        s[0].height = this.h + 'px';

        if( this.isUI  ) s[0].background = this.bg;
        if( this.isEmpty  ) s[0].background = 'none';

        //if( this.autoHeight ) s[0].transition = 'height 0.01s ease-out';
        if( c[1] !== undefined && this.autoWidth ){
            s[1] = c[1].style;
            s[1].height = (this.h-4) + 'px';
            s[1].lineHeight = (this.h-8) + 'px';
        }

        let frag = Tools.frag;

        for( let i = 1, lng = c.length; i !== lng; i++ ){
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

    }

    // from Tools

    dom ( type, css, obj, dom, id ) {

        return Tools.dom( type, css, obj, dom, id );

    }

    setSvg ( dom, type, value, id, id2 ) {

        Tools.setSvg( dom, type, value, id, id2 );

    }

    setCss ( dom, css ) {

        Tools.setCss( dom, css );

    }

    clamp ( value, min, max ) {

        return Tools.clamp( value, min, max );

    }

    getColorRing () {

        if( !Tools.colorRing ) Tools.makeColorRing();
        return Tools.clone( Tools.colorRing );

    }

    getJoystick ( model ) {

        if( !Tools[ 'joystick_'+ model ] ) Tools.makeJoystick( model );
        return Tools.clone( Tools[ 'joystick_'+ model ] );

    }

    getCircular ( model ) {

        if( !Tools.circular ) Tools.makeCircular( model );
        return Tools.clone( Tools.circular );

    }

    getKnob ( model ) {

        if( !Tools.knob ) Tools.makeKnob( model );
        return Tools.clone( Tools.knob );

    }

    // from Roots

    cursor ( name ) {

         Roots.cursor( name );

    }

    

    /////////

    update () {}

    reset () {}

    /////////

    getDom () {

        return this.c[0];

    }

    uiout () {

        if( this.isEmpty ) return;

        if(this.s) this.s[0].background = this.bg;

    }

    uiover () {

        if( this.isEmpty ) return;

        if(this.s) this.s[0].background = this.bgOver;

    }

    rename ( s ) {

        if( this.c[1] !== undefined) this.c[1].textContent = s;

    }

    listen () {

        Roots.addListen( this );
        return this;

    }

    listening () {

        if( this.objectLink === null ) return;
        if( this.isSend ) return;
        if( this.isEdit ) return;

        this.setValue( this.objectLink[ this.val ] );

    }

    setValue ( v ) {

        if( this.isNumber ) this.value = this.numValue( v );
        //else if( v instanceof Array && v.length === 1 ) v = v[0];
        else this.value = v;
        this.update();

    }


    // ----------------------
    // update every change
    // ----------------------

    onChange ( f ) {

        if( this.isEmpty ) return;

        this.callback = f || null;
        return this;

    }

    // ----------------------
    // update only on end
    // ----------------------

    onFinishChange ( f ) {

        if( this.isEmpty ) return;

        this.callback = null;
        this.endCallback = f;
        return this;

    }

    send ( v ) {

        v = v || this.value;
        if( v instanceof Array && v.length === 1 ) v = v[0];

        this.isSend = true;
        if( this.objectLink !== null ) this.objectLink[ this.val ] = v;
        if( this.callback ) this.callback( v, this.val );
        this.isSend = false;

    }

    sendEnd ( v ) {

        v = v || this.value;
        if( v instanceof Array && v.length === 1 ) v = v[0];

        if( this.endCallback ) this.endCallback( v );
        if( this.objectLink !== null ) this.objectLink[ this.val ] = v;

    }

    // ----------------------
    // clear node
    // ----------------------
    
    clear () {

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

    }

    // ----------------------
    // change size 
    // ----------------------

    setSize ( sx ) {

        if( !this.autoWidth ) return;

        this.w = sx;

        if( this.simple ){
            this.sb = this.w - this.sa;
        } else {
            let pp = this.w * ( this.p / 100 );
            this.sa = Math.floor( pp + 10 );
            this.sb = Math.floor( this.w - pp - 20 );
        }

    }

    rSize () {

        if( !this.autoWidth ) return;
        this.s[0].width = this.w + 'px';
        if( !this.simple ) this.s[1].width = this.sa + 'px';
    
    }

    // ----------------------
    // for numeric value
    // ----------------------

    setTypeNumber ( o ) {

        this.isNumber = true;

        this.value = 0;
        if(o.value !== undefined){
            if( typeof o.value === 'string' ) this.value = o.value * 1;
            else this.value = o.value;
        }

        this.min = o.min === undefined ? -Infinity : o.min;
        this.max = o.max === undefined ?  Infinity : o.max;
        this.precision = o.precision === undefined ? 2 : o.precision;

        let s;

        switch(this.precision){
            case 0: s = 1; break;
            case 1: s = 0.1; break;
            case 2: s = 0.01; break;
            case 3: s = 0.001; break;
            case 4: s = 0.0001; break;
            case 5: s = 0.00001; break;
        }

        this.step = o.step === undefined ?  s : o.step;
        this.range = this.max - this.min;
        this.value = this.numValue( this.value );
        
    }

    numValue ( n ) {

        if( this.noNeg ) n = Math.abs( n );
        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision ) * 1;

    }


    // ----------------------
    //   EVENTS DEFAULT
    // ----------------------

    handleEvent ( e ){

        if( this.isEmpty ) return;
        return this[e.type](e);
    
    }

    wheel ( e ) { return false; }

    mousedown ( e ) { return false; }

    mousemove ( e ) { return false; }

    mouseup ( e ) { return false; }

    keydown ( e ) { return false; }

    keyup ( e ) { return false; }


    // ----------------------
    // object referency
    // ----------------------

    setReferency ( obj, val ) {

        this.objectLink = obj;
        this.val = val;

    }

    display ( v ) {
        
        v = v || false;
        this.s[0].display = v ? 'block' : 'none';
        //this.isReady = v ? false : true;

    }

    // ----------------------
    // resize height 
    // ----------------------

    open () {

        if( this.isOpen ) return;
        this.isOpen = true;

    }

    close () {

        if( !this.isOpen ) return;
        this.isOpen = false;

    }

    needZone () {

        Roots.needReZone = true;

    }

    rezone () {

        Roots.needReZone = true;

    }

    // ----------------------
    //  INPUT
    // ----------------------

    select () {
    
    }

    unselect () {

    }

    setInput ( Input ) {
        
        Roots.setInput( Input, this );

    }

    upInput ( x, down ) {

        return Roots.upInput( x, down );

    }

    // ----------------------
    // special item 
    // ----------------------

    selected ( b ){

        this.isSelect = b || false;
        
    }

}

class Bool extends Proto {

    constructor( o = {} ) {

        super( o );
        
        this.value = o.value || false;

        this.buttonColor = o.bColor || this.colors.button;

        this.inh = o.inh || Math.floor( this.h*0.8 );
        this.inw = o.inw || 36;

        let t = Math.floor(this.h*0.5)-((this.inh-2)*0.5);

        this.c[2] = this.dom( 'div', this.css.basic + 'background:'+ this.colors.boolbg +'; height:'+(this.inh-2)+'px; width:'+this.inw+'px; top:'+t+'px; border-radius:10px; border:2px solid '+this.boolbg );
        this.c[3] = this.dom( 'div', this.css.basic + 'height:'+(this.inh-6)+'px; width:16px; top:'+(t+2)+'px; border-radius:10px; background:'+this.buttonColor+';' );

        this.init();
        this.update();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousemove ( e ) {

        this.cursor('pointer');

    }

    mousedown ( e ) {

        this.value = this.value ? false : true;
        this.update();
        this.send();
        return true;

    }

    // ----------------------

    update () {

        let s = this.s;

        if( this.value ){
            
            s[2].background = this.colors.boolon;
            s[2].borderColor = this.colors.boolon;
            s[3].marginLeft = '17px';

        } else {
            
            s[2].background = this.colors.boolbg;
            s[2].borderColor = this.colors.boolbg;
            s[3].marginLeft = '2px';

        }
            
    }

    rSize () {

        super.rSize();
        let s = this.s;
        let w = (this.w - 10 ) - this.inw;
        s[2].left = w + 'px';
        s[3].left = w + 'px';

    }

}

class Button extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = false;

        this.values = o.value || this.txt;

        if( typeof this.values === 'string' ) this.values = [this.values];

        //this.selected = null;
        this.isDown = false;

        // custom color
        this.cc = [ this.colors.button, this.colors.select, this.colors.down ];

        if( o.cBg !== undefined ) this.cc[0] = o.cBg;
        if( o.bColor !== undefined ) this.cc[0] = o.bColor;
        if( o.cSelect !== undefined ) this.cc[1] = o.cSelect;
        if( o.cDown !== undefined ) this.cc[2] = o.cDown;

        this.isLoadButton = o.loader || false;
        this.isDragButton = o.drag || false;
        
        if( this.isDragButton ) this.isLoadButton = true;

        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];

        for( let i = 0; i < this.lng; i++ ){

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; background:'+this.cc[0]+'; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:'+this.radius+'px;' );
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

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let i = this.lng;
        let t = this.tmp;
        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i+2;
        }

        return ''

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

    	let name = this.testZone( e );

        if( !name ) return false;

    	this.isDown = true;
        this.value = this.values[name-2];
        if( !this.isLoadButton ) this.send();
        //else this.fileSelect( e.target.files[0] );
    	return this.mousemove( e );
 
        // true;

    }

    mousemove ( e ) {

        let up = false;

        let name = this.testZone( e );

       // console.log(name)

        if( name !== '' ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, name );
        } else {
        	up = this.reset();
        }

        //console.log(up)

        return up;

    }

    // ----------------------

    modes ( n, name ) {

        let v, r = false;

        for( let i = 0; i < this.lng; i++ ){

            if( i === name-2 ) v = this.mode( n, i+2 );
            else v = this.mode( 1, i+2 );

            if(v) r = true;

        }

        return r;

    }


    mode ( n, name ) {

        let change = false;

        let i = name - 2;

        if( this.stat[i] !== n ){
        
            switch( n ){

                case 1: this.stat[i] = 1; this.s[ i+2 ].color = this.fontColor; this.s[ i+2 ].background = this.cc[0]; break;
                case 2: this.stat[i] = 2; this.s[ i+2 ].color = this.fontSelect; this.s[ i+2 ].background = this.cc[1]; break;
                case 3: this.stat[i] = 3; this.s[ i+2 ].color = this.fontSelect; this.s[ i+2 ].background = this.cc[2]; break;

            }

            change = true;

        }
        

        return change;

    }

    // ----------------------

    reset () {

        this.cursor();

        /*let v, r = false;

        for( let i = 0; i < this.lng; i++ ){
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

    }

    // ----------------------

    dragover ( e ) {

        e.preventDefault();

        this.s[4].borderColor = this.colors.select;
        this.s[4].color = this.colors.select;

    }

    dragend ( e ) {

        e.preventDefault();

        this.s[4].borderColor = this.fontColor;
        this.s[4].color = this.fontColor;

    }

    drop ( e ) {

        e.preventDefault();

        this.dragend(e);
        this.fileSelect( e.dataTransfer.files[0] );

    }

    initDrager () {

        this.c[4] = this.dom( 'div', this.css.txt +' text-align:center; line-height:'+(this.h-8)+'px; border:1px dashed '+this.fontColor+'; top:2px;  height:'+(this.h-4)+'px; border-radius:'+this.radius+'px; pointer-events:auto;' );// cursor:default;
        this.c[4].textContent = 'DRAG';

        this.c[4].addEventListener( 'dragover', function(e){ this.dragover(e); }.bind(this), false );
        this.c[4].addEventListener( 'dragend', function(e){ this.dragend(e); }.bind(this), false );
        this.c[4].addEventListener( 'dragleave', function(e){ this.dragend(e); }.bind(this), false );
        this.c[4].addEventListener( 'drop', function(e){ this.drop(e); }.bind(this), false );

        //this.c[2].events = [  ];
        //this.c[4].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];


    }

    initLoader () {

        this.c[3] = this.dom( 'input', this.css.basic +'top:0px; opacity:0; height:'+(this.h)+'px; pointer-events:auto; cursor:pointer;' );//
        this.c[3].name = 'loader';
        this.c[3].type = "file";

        this.c[3].addEventListener( 'change', function(e){ this.fileSelect( e.target.files[0] ); }.bind(this), false );
        //this.c[3].addEventListener( 'mousedown', function(e){  }.bind(this), false );

        //this.c[2].events = [  ];
        //this.c[3].events = [ 'change', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

        //this.hide = document.createElement('input');

    }

    fileSelect ( file ) {

        let dataUrl = [ 'png', 'jpg', 'mp4', 'webm', 'ogg' ];
        let dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'BVH', 'glb' ];

        //if( ! e.target.files ) return;

        //let file = e.target.files[0];
       
        //this.c[3].type = "null";
        // console.log( this.c[4] )

        if( file === undefined ) return;

        let reader = new FileReader();
        let fname = file.name;
        let type = fname.substring(fname.lastIndexOf('.')+1, fname.length );

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

    }

    label ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

    }

    icon ( string, y, n ) {

        n = n || 2;
        this.s[n].padding = ( y || 0 ) +'px 0px';
        this.c[n].innerHTML = string;

    }

    rSize () {

        super.rSize();

        let s = this.s;
        let w = this.sb;
        let d = this.sa;

        let i = this.lng;
        let dc =  3;
        let size = Math.floor( ( w-(dc*(i-1)) ) / i );

        while( i-- ){

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

}

class Circular extends Proto {

    constructor( o = {} ) {

        super( o );

        this.autoWidth = false;

        this.buttonColor = this.colors.button;

        this.setTypeNumber( o );

        this.radius = this.w * 0.5;//Math.floor((this.w-20)*0.5);

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

    mode ( mode ) {

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

    }


    reset () {

        this.isDown = false;
        

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        this.isDown = false;
        this.sendEnd();
        return this.mode(0);

    }

    mousedown ( e ) {

        this.isDown = true;
        this.old = this.value;
        this.oldr = null;
        this.mousemove( e );
        return this.mode(1);

    }

    mousemove ( e ) {

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

    }

    // ----------------------

    makePath () {

        var r = 40;
        var d = 24;
        var a = this.percent * this.twoPi - 0.001;
        var x2 = (r + r * Math.sin(a)) + d;
        var y2 = (r - r * Math.cos(a)) + d;
        var big = a > Math.PI ? 1 : 0;
        return "M " + (r+d) + "," + d + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2;

    }

    update ( up ) {

        this.c[2].textContent = this.value;
        this.percent = ( this.value - this.min ) / this.range;

        this.setSvg( this.c[3], 'd', this.makePath(), 1 );
        if( up ) this.send();
        
    }

}

class Color extends Proto {

    constructor( o = {} ) {

        super( o );

	    //this.autoHeight = true;

	    this.ctype = o.ctype || 'hex';

	    this.wfixe = this.sb > 256 ? 256 : this.sb;

	    if(o.cw != undefined ) this.wfixe = o.cw;

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

	testZone ( mx, my ) {

		let l = this.local;
		if( l.x === -1 && l.y === -1 ) return '';



		if( this.up && this.isOpen ){

			if( l.y > this.wfixe ) return 'title';
		    else return 'color';

		} else {

			if( l.y < this.baseH+2 ) return 'title';
	    	else if( this.isOpen ) return 'color';


		}

    }

	// ----------------------
    //   EVENTS
    // ----------------------

	mouseup ( e ) {

	    this.isDown = false;
	    this.d = 256;

	}

	mousedown ( e ) {


		let name = this.testZone( e.clientX, e.clientY );


		//if( !name ) return;
		if(name === 'title'){
			if( !this.isOpen ) this.open();
	        else this.close();
	        return true;
		}


		if( name === 'color' ){

			this.isDown = true;
			this.fistDown = true;
			this.mousemove( e );
		}
	}

	mousemove ( e ) {

	    let name = this.testZone( e.clientX, e.clientY );

	    let off, d, hue, sat, lum, rad, x, y, rr, T = Tools;

	    if( name === 'title' ) this.cursor('pointer');

	    if( name === 'color' ){

	    	off = this.offset;
		    off.x = e.clientX - ( this.zone.x + this.decal.x + this.mid );
		    off.y = e.clientY - ( this.zone.y + this.decal.y + this.mid );
			d = off.length() * this.ratio;
			rr = off.angle();
			if(rr < 0) rr += 2 * T.PI;
						

	    	if ( d < 128 ) this.cursor('crosshair');
	    	else if( !this.isDown ) this.cursor();

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

				    	let rr = (this.hue * T.TwoPI) + T.PI;
				    	if(rr < 0) rr += 2 * T.PI;

				    	rad = Math.atan2(-y, x);
				    	if(rad < 0) rad += 2 * T.PI;
						
				    	let rad0 = ( rad + T.pi90 + T.TwoPI + rr ) % (T.TwoPI),
				    	rad1 = rad0 % ((2/3) * T.PI) - (T.pi60),
				    	a    = 0.5 * this.tr,
				    	b    = Math.tan(rad1) * a,
				    	r    = Math.sqrt(x*x + y*y),
				    	maxR = Math.sqrt(a*a + b*b);

				    	if( r > maxR ) {
							let dx = Math.tan(rad1) * r;
							let rad2 = Math.atan(dx / maxR);
							if(rad2 > T.pi60)  rad2 = T.pi60;
						    else if( rad2 < -T.pi60 ) rad2 = -T.pi60;
						
							rad += rad2 - rad1;

							rad0 = (rad + T.pi90  + T.TwoPI + rr) % (T.TwoPI),
							rad1 = rad0 % ((2/3) * T.PI) - (T.pi60);
							b = Math.tan(rad1) * a;
							r = maxR = Math.sqrt(a*a + b*b);
						}

						lum = ((Math.sin(rad0) * r) / this.tsl) + 0.5;
				
						let w = 1 - (Math.abs(lum - 0.5) * 2);
						sat = (((Math.cos(rad0) * r) + (this.tr / 2)) / (1.5 * this.tr)) / w;
						sat = T.clamp( sat, 0, 1 );
						
				        this.setHSL([this.hsl[0], sat, lum]);

				    }
				}
			}
		}

	}

	// ----------------------

	setHeight () {

		this.h = this.isOpen ? this.wfixe + this.baseH + 5 : this.baseH;
		this.s[0].height = this.h + 'px';
		this.zone.h = this.h;

	}

	parentHeight ( t ) {

		if ( this.parentGroup !== null ) this.parentGroup.calc( t );
	    else if ( this.isUI ) this.main.calc( t );

	}

	open () {

		super.open();

		this.setHeight();

		if( this.up ) this.zone.y -= this.wfixe + 5;

		let t = this.h - this.baseH;

	    this.s[3].visibility = 'visible';
	    //this.s[3].display = 'block';
	    this.parentHeight( t );

	}

	close () {

		super.close();

		if( this.up ) this.zone.y += this.wfixe + 5;

		let t = this.h - this.baseH;

		this.setHeight();

	    this.s[3].visibility  = 'hidden';
	    //this.s[3].display = 'none';
	    this.parentHeight( -t );

	}

	update ( up ) {

	    let cc = Tools.rgbToHex( Tools.hslToRgb([ this.hsl[0], 1, 0.5 ]) );

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

	}

	setColor ( color ) {

	    let unpack = Tools.unpack(color);
	    if (this.bcolor != color && unpack) {

	        this.bcolor = color;
	        this.rgb = unpack;
	        this.hsl = Tools.rgbToHsl( this.rgb );

	        this.hue = this.hsl[0];

	        this.update();
	    }
	    return this;

	}

	setHSL ( hsl ) {

	    this.hsl = hsl;
	    this.rgb = Tools.hslToRgb( hsl );
	    this.bcolor = Tools.rgbToHex( this.rgb );
	    this.update( true );
	    return this;

	}

	moveMarkers () {

		let p = this.p;
		let T = Tools;

	    this.invert ? '#fff' : '#000';
	    let a = this.hsl[0] * T.TwoPI;
	    let third = (2/3) * T.PI;
	    let r = this.tr;
	    let h = this.hsl[0];
	    let s = this.hsl[1];
	    let l = this.hsl[2];

	    let angle = ( a - T.pi90 ) * T.todeg;

	    h = - a + T.pi90;

		let hx = Math.cos(h) * r;
		let hy = -Math.sin(h) * r;
		let sx = Math.cos(h - third) * r;
		let sy = -Math.sin(h - third) * r;
		let vx = Math.cos(h + third) * r;
		let vy = -Math.sin(h + third) * r;
		let mx = (sx + vx) / 2, my = (sy + vy) / 2;
		a  = (1 - 2 * Math.abs(l - .5)) * s;
		let x = sx + (vx - sx) * l + (hx - mx) * a;
		let y = sy + (vy - sy) * l + (hy - my) * a;

	    p.set( x, y ).addScalar(128);

	    //let ff = (1-l)*255;
	    // this.setSvg( this.c[3], 'stroke', 'rgb('+ff+','+ff+','+ff+')', 3 );

	    this.setSvg( this.c[3], 'transform', 'rotate('+angle+' )', 2 );

	    this.setSvg( this.c[3], 'cx', p.x, 3 );
	    this.setSvg( this.c[3], 'cy', p.y, 3 );
	    
	    this.setSvg( this.c[3], 'stroke', this.invert ? '#fff' : '#000', 2, 3 );
	    this.setSvg( this.c[3], 'stroke', this.invert ? '#fff' : '#000', 3 );
	    this.setSvg( this.c[3], 'fill',this.bcolor, 3 );

	}

	rSize () {

	    //Proto.prototype.rSize.call( this );
	    super.rSize();

	    let s = this.s;

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

}

class Fps extends Proto {

    constructor( o = {} ) {

        super( o );

        this.round = Math.round;

        this.autoHeight = true;

        this.baseH = this.h;
        this.hplus = o.hplus || 50;

        this.res = o.res || 40;
        this.l = 1;

        this.precision = o.precision || 0;
        

        this.custom = o.custom || false;
        this.names = o.names || ['FPS', 'MS'];
        let cc = o.cc || ['90,90,90', '255,255,0'];

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


        let fltop = Math.floor(this.h*0.5)-6;

        this.c[1].textContent = this.txt;
        this.c[0].style.cursor = 'pointer';
        this.c[0].style.pointerEvents = 'auto';

        let panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px; box-sizing:border-box; background: rgba(0, 0, 0, 0.2); border:' + (this.colors.groupBorder !== 'none'? this.colors.groupBorder+';' : '1px solid rgba(255, 255, 255, 0.2);');

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

        let s = this.s;

        s[1].marginLeft = '10px';
        s[1].lineHeight = this.h-4;
        s[1].color = this.fontColor;
        s[1].fontWeight = 'bold';

        if( this.radius !== 0 )  s[0].borderRadius = this.radius+'px'; 
        s[0].border = this.colors.groupBorder;




        let j = 0;

        for( j=0; j<this.names.length; j++ ){

            let base = [];
            let i = this.res+1;
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

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown ( e ) {

        if( this.isShow ) this.close();
        else this.open();

    }

    // ----------------------

    /*mode: function ( mode ) {

        let s = this.s;

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

    tick ( v ) {

        this.values = v;
        if( !this.isShow ) return;
        this.drawGraph();
        this.upText();

    }

    makePath ( point ) {

        let p = '';
        p += 'M ' + (-1) + ' ' + 50;
        for ( let i = 0; i < this.res + 1; i ++ ) { p += ' L ' + i + ' ' + point[i]; }
        p += ' L ' + (this.res + 1) + ' ' + 50;
        return p;

    }

    upText ( val ) {

        let v = val || this.values, t = '';
        for( let j=0, lng =this.names.length; j<lng; j++ ) t += this.textDisplay[j] + (v[j]).toFixed(this.precision) + '</span>';
        this.c[4].innerHTML = t;
    
    }

    drawGraph () {

        let svg = this.c[2];
        let i = this.names.length, v, old = 0, n = 0;

        while( i-- ){
            if( this.adding ) v = (this.values[n]+old) * this.range[n];
            else  v = (this.values[n] * this.range[n]);
            this.points[n].shift();
            this.points[n].push( 50 - v );
            this.setSvg( svg, 'd', this.makePath( this.points[n] ), i+1 );
            old += this.values[n];
            n++;

        }

    }

    open () {

        super.open();

        this.h = this.hplus + this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.arrowDown );

        if( this.parentGroup !== null ){ this.parentGroup.calc( this.hplus );}
        else if( this.isUI ) this.main.calc( this.hplus );

        this.s[0].height = this.h +'px';
        this.s[2].display = 'block'; 
        this.s[4].display = 'block';
        this.isShow = true;

        if( !this.custom ) Roots.addListen( this );

    }

    close () {

        super.close();

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
        
    }


    ///// AUTO FPS //////

    begin () {

        this.startTime = this.now();
        
    }

    end () {

        let time = this.now();
        this.ms = time - this.startTime;

        this.frames ++;

        if ( time > this.prevTime + 1000 ) {

            this.fps = this.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );

            this.prevTime = time;
            this.frames = 0;

            if ( this.isMem ) {

                let heapSize = performance.memory.usedJSHeapSize;
                let heapSizeLimit = performance.memory.jsHeapSizeLimit;

                this.mem = this.round( heapSize * 0.000000954 );
                this.mm = heapSize / heapSizeLimit;

            }

        }

        this.values = [ this.fps, this.ms , this.mm ];

        this.drawGraph();
        this.upText( [ this.fps, this.ms, this.mem ] );

        return time;

    }

    listening () {

        if( !this.custom ) this.startTime = this.end();
        
    }

    rSize () {

        let s = this.s;
        let w = this.w;

        s[0].width = w + 'px';
        s[1].width = w + 'px';
        s[2].left = 10 + 'px';
        s[2].width = (w-20) + 'px';
        s[4].width = (w-20) + 'px';
        
    }
    
}

class Graph extends Proto {

    constructor( o = {} ) {

        super( o );

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

        let svg = this.dom( 'svg', this.css.basic , { viewBox:'0 0 '+this.w+' '+this.rh, width:this.w, height:this.rh, preserveAspectRatio:'none' } );
        this.setCss( svg, { width:this.w, height:this.rh, left:0, top:this.top });

        this.dom( 'path', '', { d:'', stroke:this.colors.text, 'stroke-width':2, fill:'none', 'stroke-linecap':'butt' }, svg );
        this.dom( 'rect', '', { x:10, y:10, width:this.gw+8, height:this.gh+8, stroke:'rgba(0,0,0,0.3)', 'stroke-width':1 , fill:'none'}, svg );

        this.iw = ((this.gw-(4*(this.lng-1)))/this.lng);
        let t = [];
        this.cMode = [];

        this.v = [];

        for( let i = 0; i < this.lng; i++ ){

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

    updateSVG () {

        if( this.line ) this.setSvg( this.c[3], 'd', this.makePath(), 0 );

        for(let i = 0; i<this.lng; i++ ){

            
            this.setSvg( this.c[3], 'height', this.v[i]*this.gh, i+2 );
            this.setSvg( this.c[3], 'y', 14 + (this.gh - this.v[i]*this.gh), i+2 );
            if( this.neg ) this.value[i] = ( ((this.v[i]*2)-1) * this.multiplicator ).toFixed( this.precision ) * 1;
            else this.value[i] = ( (this.v[i] * this.multiplicator) ).toFixed( this.precision ) * 1;

        }

        this.c[2].textContent = this.value;

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let i = this.lng;
        let t = this.tmp;
        
	    if( l.y>this.top && l.y<this.h-20 ){
	        while( i-- ){
	            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
	        }
	    }

        return ''

    }

    mode ( n, name ) {

    	if( n === this.cMode[name] ) return false;

    	let a;

        switch(n){
            case 0: a=0.3; break;
            case 1: a=0.6; break;
            case 2: a=1; break;
        }

        this.reset();

        this.setSvg( this.c[3], 'fill-opacity', a, name + 2 );
        this.cMode[name] = n;

        return true;



    }

    // ----------------------
    //   EVENTS
    // ----------------------

    reset () {

    	let nup = false;
        //this.isDown = false;

        let i = this.lng;
        while(i--){ 
            if( this.cMode[i] !== 0 ){
                this.cMode[i] = 0;
                this.setSvg( this.c[3], 'fill-opacity', 0.3, i + 2 );
                nup = true;
            }
        }

        return nup;

    }

    mouseup ( e ) {

        this.isDown = false;
        if( this.current !== -1 ) return this.reset();
        
    }

    mousedown ( e ) {

    	this.isDown = true;
        return this.mousemove( e );

    }

    mousemove ( e ) {

    	let nup = false;

    	let name = this.testZone(e);

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

    }

    // ----------------------

    update ( up ) {

    	this.updateSVG();

        if( up ) this.send();

    }

    makePath () {

    	let p = "", h, w, wn, wm, ow, oh;
    	//let g = this.iw*0.5

    	for(let i = 0; i<this.lng; i++ ){

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

    }

    rSize () {

        super.rSize();

        let s = this.s;
        if( this.c[1] !== undefined ) s[1].width = this.w + 'px';
        s[2].width = this.w + 'px';
        s[3].width = this.w + 'px';

        let gw = this.w - 28;
        let iw = ((gw-(4*(this.lng-1)))/this.lng);

        let t = [];

        for( let i = 0; i < this.lng; i++ ){

            t[i] = [ 14 + (i*iw) + (i*4), iw ];
            t[i][2] = t[i][0] + t[i][1];

        }

        this.tmp = t;

    }

}

class Group extends Proto {

    constructor( o = {} ) {

        super( o );

        this.ADD = o.add;

        this.uis = [];

        this.autoHeight = true;
        this.current = -1;
        this.target = null;

        this.decal = 0;

        this.baseH = this.h;

        let fltop = Math.floor(this.h*0.5)-6;

        this.isLine = o.line !== undefined ? o.line : false;

        this.c[2] = this.dom( 'div', this.css.basic + 'width:100%; left:0; height:auto; overflow:hidden; top:'+this.h+'px');
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:0; top:'+fltop+'px;', { d:this.svgs.group, fill:this.fontColor, stroke:'none'});
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.fontColor, stroke:'none'});
        // bottom line
        if(this.isLine) this.c[5] = this.dom( 'div', this.css.basic +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');

        let s = this.s;

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

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let name = '';

        if( l.y < this.baseH ) name = 'title';
        else {
            if( this.isOpen ) name = 'content';
        }

        return name;

    }

    clearTarget () {

        if( this.current === -1 ) return false;

       // if(!this.target) return;
        this.target.uiout();
        this.target.reset();
        this.current = -1;
        this.target = null;
        this.cursor();
        return true;

    }

    reset () {

        this.clearTarget();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent ( e ) {

        let type = e.type;

        let change = false;
        let targetChange = false;

        let name = this.testZone( e );

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

    }

    getNext ( e, change ) {

        let next = Roots.findTarget( this.uis, e );

        if( next !== this.current ){
            this.clearTarget();
            this.current = next;
        }

        if( next !== -1 ){ 
            this.target = this.uis[ this.current ];
            this.target.uiover();
        }

    }

    // ----------------------

    calcH () {

        let lng = this.uis.length, i, u,  h=0, px=0, tmph=0;
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
    }

    calcUis () {

        if( !this.isOpen ) return;

        Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH );

    }


    setBG ( c ) {

        this.s[0].background = c;

        let i = this.uis.length;
        while(i--){
            this.uis[i].setBG( c );
        }

    }

    add () {

        let a = arguments;

        if( typeof a[1] === 'object' ){ 
            a[1].isUI = this.isUI;
            a[1].target = this.c[2];
            a[1].main = this.main;
        } else if( typeof arguments[1] === 'string' ){
            if( a[2] === undefined ) [].push.call(a, { isUI:true, target:this.c[2], main:this.main });
            else { 
                a[2].isUI = true;
                a[2].target = this.c[2];
                a[2].main = this.main;
            }
        }

        //let n = add.apply( this, a );
        let n = this.ADD.apply( this, a );
        this.uis.push( n );

        if( n.autoHeight ) n.parentGroup = this;

        return n;

    }

    parentHeight ( t ) {

        if ( this.parentGroup !== null ) this.parentGroup.calc( t );
        else if ( this.isUI ) this.main.calc( t );

    }

    open () {

        super.open();

        this.setSvg( this.c[4], 'd', this.svgs.arrowDown );
        this.rSizeContent();

        let t = this.h - this.baseH;

        this.parentHeight( t );

    }

    close () {

        super.close();

        let t = this.h - this.baseH;

        this.setSvg( this.c[4], 'd', this.svgs.arrow );
        this.h = this.baseH;
        this.s[0].height = this.h + 'px';

        this.parentHeight( -t );

    }

    clear () {

        this.clearGroup();
        if( this.isUI ) this.main.calc( -(this.h +1 ));
        Proto.prototype.clear.call( this );

    }

    clearGroup () {

        this.close();

        let i = this.uis.length;
        while(i--){
            this.uis[i].clear();
            this.uis.pop();
        }
        this.uis = [];
        this.h = this.baseH;

    }

    calc ( y ) {

        if( !this.isOpen ) return;

        if( y !== undefined ){ 
            this.h += y;
            if( this.isUI ) this.main.calc( y );
        } else {
            this.h = this.calcH() + this.baseH;
        }
        this.s[0].height = this.h + 'px';

        //if(this.isOpen) this.calcUis();

    }

    rSizeContent () {

        let i = this.uis.length;
        while(i--){
            this.uis[i].setSize( this.w );
            this.uis[i].rSize();
        }
        this.calc();

    }

    rSize () {

        super.rSize();

        let s = this.s;

        s[3].left = ( this.sa + this.sb - 17 ) + 'px';
        s[1].width = this.w + 'px';
        s[2].width = this.w + 'px';

        if( this.isOpen ) this.rSizeContent();

    }

}

Group.prototype.isGroup = true;

class Joystick extends Proto {

    constructor( o = {} ) {

        super( o );

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

    mode ( mode ) {

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

        }
    }

    // ----------------------
    //   EVENTS
    // ----------------------

    addInterval (){
        if( this.interval !== null ) this.stopInterval();
        if( this.pos.isZero() ) return;
        this.interval = setInterval( function(){ this.update(); }.bind(this), 10 );

    }

    stopInterval (){

        if( this.interval === null ) return;
        clearInterval( this.interval );
        this.interval = null;

    }

    reset () {

        this.addInterval();
        this.mode(0);

    }

    mouseup ( e ) {

        this.addInterval();
        this.isDown = false;
    
    }

    mousedown ( e ) {

        this.isDown = true;
        this.mousemove( e );
        this.mode( 2 );

    }

    mousemove ( e ) {

        this.mode(1);

        if( !this.isDown ) return;

        this.tmp.x = this.radius - ( e.clientX - this.zone.x );
        this.tmp.y = this.radius - ( e.clientY - this.zone.y - this.top );

        let distance = this.tmp.length();

        if ( distance > this.distance ) {
            let angle = Math.atan2(this.tmp.x, this.tmp.y);
            this.tmp.x = Math.sin( angle ) * this.distance;
            this.tmp.y = Math.cos( angle ) * this.distance;
        }

        this.pos.copy( this.tmp ).divideScalar( this.distance ).negate();

        this.update();

    }

    setValue ( v ) {

        if(v===undefined) v=[0,0];

        this.pos.set( v[0] || 0, v[1]  || 0 );
        this.updateSVG();

    }

    update ( up ) {

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

    }

    updateSVG () {

        let x = this.radius - ( -this.pos.x * this.distance );
        let y = this.radius - ( -this.pos.y * this.distance );

         if(this.model === 0){

            let sx = x + ((this.pos.x)*5) + 5;
            let sy = y + ((this.pos.y)*5) + 10;

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

    }

    clear () {
        
        this.stopInterval();
        super.clear();

    }

}

class Knob extends Circular {

    constructor( o = {} ) {

        super( o );

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

    mode ( mode ) {

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

    }


    mousemove ( e ) {

        //this.mode(1);

        if( !this.isDown ) return;

        let off = this.offset;

        off.x = this.radius - ( e.clientX - this.zone.x );
        off.y = this.radius - ( e.clientY - this.zone.y - this.top );

        this.r = - Math.atan2( off.x, off.y );

        if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

        this.r = this.r > this.mPI ? this.mPI : this.r;
        this.r = this.r < -this.mPI ? -this.mPI : this.r;

        let steps = 1 / this.cirRange;
        let value = (this.r + this.mPI) * steps;

        let n = ( ( this.range * value ) + this.min ) - this.old;

        if(n >= this.step || n <= this.step){ 
            n = Math.floor( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
        }

    }

    makeGrad () {

        let d = '', step, range, a, x, y, x2, y2, r = 64;
        let startangle = Math.PI + this.mPI;
        let endangle = Math.PI - this.mPI;
        //let step = this.step>5 ? this.step : 1;

        if(this.step>5){
            range =  this.range / this.step;
            step = ( startangle - endangle ) / range;
        } else {
            step = (( startangle - endangle ) / r)*2;
            range = r*0.5;
        }

        for ( let i = 0; i <= range; ++i ) {

            a = startangle - ( step * i );
            x = r + Math.sin( a ) * ( r - 20 );
            y = r + Math.cos( a ) * ( r - 20 );
            x2 = r + Math.sin( a ) * ( r - 24 );
            y2 = r + Math.cos( a ) * ( r - 24 );
            d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

        }

        return d;

    }

    update ( up ) {

        this.c[2].textContent = this.value;
        this.percent = (this.value - this.min) / this.range;

       // let r = 50;
       // let d = 64; 
        let r = ( (this.percent * this.cirRange) - (this.mPI));//* this.toDeg;

        let sin = Math.sin(r);
        let cos = Math.cos(r);

        let x1 = (25 * sin) + 64;
        let y1 = -(25 * cos) + 64;
        let x2 = (20 * sin) + 64;
        let y2 = -(20 * cos) + 64;

        //this.setSvg( this.c[3], 'cx', x, 1 );
        //this.setSvg( this.c[3], 'cy', y, 1 );

        this.setSvg( this.c[3], 'd', 'M ' + x1 +' ' + y1 + ' L ' + x2 +' ' + y2, 1 );

        //this.setSvg( this.c[3], 'transform', 'rotate('+ r +' '+64+' '+64+')', 1 );

        if( up ) this.send();
        
    }

}

class List extends Proto {

    constructor( o = {} ) {

        super( o );

        // images
        this.path = o.path || '';
        this.format = o.format || '';
        this.imageSize = o.imageSize || [20,20];

        this.isWithImage = this.path !== '' ? true:false;
        this.preLoadComplete = false;

        this.tmpImage = {};
        this.tmpUrl = [];

        this.autoHeight = false;
        let align = o.align || 'center';

        this.sMode = 0;
        this.tMode = 0;

        this.listOnly = o.listOnly || false;

        this.buttonColor = o.bColor || this.colors.button;

        let fltop = Math.floor(this.h*0.5)-5;

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

        } else {
            this.c[2].style.top = this.baseH + 'px';
        }

        this.listIn = this.dom( 'div', this.css.basic + 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2);');
        this.listIn.name = 'list';

        this.topList = 0;
        
        this.c[2].appendChild( this.listIn );
        this.c[2].appendChild( this.scroller );

        if( o.value !== undefined ){
            if(!isNaN(o.value)) this.value = this.list[ o.value ];
            else this.value = o.value;
        }else {
            this.value = this.list[0];
        }

        this.isOpenOnStart = o.open || false;

        if( this.listOnly ){
            this.baseH = 5;
            this.c[3].style.display = 'none';
            this.c[4].style.display = 'none';
            this.c[2].style.top = this.baseH+'px';
            this.isOpenOnStart = true;
        }

        

        //this.c[0].style.background = '#FF0000'
        if( this.isWithImage ) this.preloadImage();
       // } else {
            // populate list
            this.setList( this.list );
            this.init();
            if( this.isOpenOnStart ) this.open( true );
       // }

    }

    // image list

    preloadImage () {

        this.preLoadComplete = false;

        this.tmpImage = {};
        for( let i=0; i<this.list.length; i++ ) this.tmpUrl.push( this.list[i] );
        this.loadOne();
        
    }

    nextImg () {

        this.tmpUrl.shift();
        if( this.tmpUrl.length === 0 ){ 

            this.preLoadComplete = true;

            this.addImages();
            /*this.setList( this.list );
            this.init();
            if( this.isOpenOnStart ) this.open();*/

        }
        else this.loadOne();

    }

    loadOne(){

        let self = this;
        let name = this.tmpUrl[0];
        let img = document.createElement('img');
        img.style.cssText = 'position:absolute; width:'+self.imageSize[0]+'px; height:'+self.imageSize[1]+'px';
        img.setAttribute('src', this.path + name + this.format );

        img.addEventListener('load', function() {

            self.imageSize[2] = img.width;
            self.imageSize[3] = img.height;
            self.tmpImage[name] = img;
            self.nextImg();

        });

    }

    //

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        if( this.up && this.isOpen ){
            if( l.y > this.h - this.baseH ) return 'title';
            else {
                if( this.scroll && ( l.x > (this.sa+this.sb-20)) ) return 'scroll';
                if(l.x > this.sa) return this.testItems( l.y-this.baseH );
            }

        } else {
            if( l.y < this.baseH+2 ) return 'title';
            else {
                if( this.isOpen ){
                    if( this.scroll && ( l.x > (this.sa+this.sb-20)) ) return 'scroll';
                    if(l.x > this.sa) return this.testItems( l.y-this.baseH );
                }
            }

        }

        return '';

    }

    testItems ( y ) {

        let name = '';

        let i = this.items.length, item, a, b;
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

    }

    unSelected () {

        if( this.current ){
            this.current.style.background = 'rgba(0,0,0,0.2)';
            this.current.style.color = this.fontColor;
            this.current = null;
        }

    }

    selected () {

        this.current.style.background = this.colors.select;
        this.current.style.color = '#FFF';

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        this.isDown = false;

    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false;

        if( name === 'scroll' ){

            this.isDown = true;
            this.mousemove( e );

        } else if( name === 'title' ){

            this.modeTitle(2);
            if( !this.listOnly ){
                if( !this.isOpen ) this.open();
                else this.close();
            }
        } else {
            if( this.current ){
                this.value = this.list[this.current.id];
                //this.value = this.current.textContent;
                this.send();
                if( !this.listOnly ) {
                    this.close();
                    this.setTopItem();
                }
            }
            
        }

        return true;

    }

    mousemove ( e ) {

        let nup = false;
        let name = this.testZone( e );

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
                let top = this.zone.y+this.baseH-2;
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

    }

    wheel ( e ) {

        let name = this.testZone( e );
        if( name === 'title' ) return false; 
        this.py += e.delta*10;
        this.update(this.py);
        return true;

    }



    // ----------------------

    reset () {

        this.prevName = '';
        this.unSelected();
        this.modeTitle(0);
        this.modeScroll(0);
        
    }

    modeScroll ( mode ) {

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
    }

    modeTitle ( mode ) {

        if( mode === this.tMode ) return;

        let s = this.s;

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

    }

    clearList () {

        while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );
        this.items = [];

    }

    setList ( list ) {

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

        let item, n;//, l = this.sb;
        for( let i=0; i<this.length; i++ ){

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
        
    }

    addImages (){
        let lng = this.list.length;
        for( let i=0; i<lng; i++ ){
            this.items[i].appendChild( this.tmpImage[this.list[i]] );
        }
        this.setTopItem();
    }

    setTopItem (){

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

            this.tmpImage[ this.value ];
            this.ctx.drawImage( this.tmpImage[ this.value ], 0, 0, this.imageSize[2], this.imageSize[3], 0,0, this.imageSize[0], this.imageSize[1] );

        }
        else this.c[3].textContent = this.value;

    }


    // ----- LIST

    update ( y ) {

        if( !this.scroll ) return;

        y = y < 0 ? 0 : y;
        y = y > this.range ? this.range : y;

        this.topList = -Math.floor( y / this.ratio );

        this.listIn.style.top = this.topList+'px';
        this.scroller.style.top = Math.floor( y )  + 'px';

        this.py = y;

    }

    parentHeight ( t ) {

        if ( this.parentGroup !== null ) this.parentGroup.calc( t );
        else if ( this.isUI ) this.main.calc( t );

    }

    open ( first ) {

        super.open();

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

        let t = this.h - this.baseH;

        this.zone.h = this.h;

        if(!first) this.parentHeight( t );

    }

    close () {

        super.close();

        if( this.up ) this.zone.y += this.h - (this.baseH-10);

        let t = this.h - this.baseH;

        this.h = this.baseH;
        this.s[0].height = this.h + 'px';
        this.s[2].display = 'none';
        this.setSvg( this.c[4], 'd', this.svgs.arrow );

        this.zone.h = this.h;

        this.parentHeight( -t );

    }

    // -----

    text ( txt ) {

        this.c[3].textContent = txt;

    }

    rSizeContent () {

        let i = this.length;
        while(i--) this.listIn.children[i].style.width = this.ww + 'px';

    }

    rSize () {

        Proto.prototype.rSize.call( this );

        let s = this.s;
        let w = this.sb;
        let d = this.sa;

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

}

class Numeric extends Proto {

    constructor( o = {} ) {

        super( o );

        this.setTypeNumber( o );

        this.allway = o.allway || false;

        this.isDown = false;

        this.value = [0];
        this.multy = 1;
        this.invmulty = 1;
        this.isSingle = true;
        this.isAngle = false;
        this.isVector = false;

        if( o.isAngle ){
            this.isAngle = true;
            this.multy = Tools.torad;
            this.invmulty = Tools.todeg;
        }

        this.isDrag = o.drag || false;

        if( o.value !== undefined ){
            if(!isNaN(o.value)){ 
                this.value = [o.value];
            } else if( o.value instanceof Array ){ 
                this.value = o.value; 
                this.isSingle = false;
            } else if( o.value instanceof Object ){ 
                this.value = [];
                if( o.value.x !== undefined ) this.value[0] = o.value.x;
                if( o.value.y !== undefined ) this.value[1] = o.value.y;
                if( o.value.z !== undefined ) this.value[2] = o.value.z;
                if( o.value.w !== undefined ) this.value[3] = o.value.w;
                this.isVector = true;
                this.isSingle = false;
            }
        }

        this.lng = this.value.length;
        this.tmp = [];

        

        this.current = -1;
        this.prev = { x:0, y:0, d:0, v:0 };

        // bg
        this.c[2] = this.dom( 'div', this.css.basic + ' background:' + this.colors.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' );

        this.cMode = [];
        
        let i = this.lng;
        while(i--){

            if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
            this.c[3+i] = this.dom( 'div', this.css.txtselect + ' height:'+(this.h-4)+'px; background:' + this.colors.inputBg + '; borderColor:' + this.colors.inputBorder+'; border-radius:'+this.radius+'px;');
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

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let i = this.lng;
        let t = this.tmp;
        

        while( i-- ){
            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
        }

        return '';

    }

   /* mode: function ( n, name ) {

        if( n === this.cMode[name] ) return false;

        //let m;

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

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !this.isDown ){
            this.isDown = true;
            if( name !== '' ){ 
            	this.current = name;
            	this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] )  };
            	this.setInput( this.c[ 3 + this.current ] );
            }
            return this.mousemove( e );
        }

        return false;
        /*

        if( name === '' ) return false;


        this.current = name;
        this.isDown = true;

        this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] )  };


        return this.mode( 2, name );*/

    }

    mouseup ( e ) {

    	if( this.isDown ){
            
            this.isDown = false;
            //this.current = -1;
            this.prev = { x:0, y:0, d:0, v:0 };

            return this.mousemove( e );
        }

        return false;

        /*let name = this.testZone( e );
        this.isDown = false;

        if( this.current !== -1 ){ 

            //let tm = this.current;
            let td = this.prev.d;

            this.current = -1;
            this.prev = { x:0, y:0, d:0, v:0 };

            if( !td ){

                this.setInput( this.c[ 3 + name ] );
                return true;//this.mode( 2, name );

            } else {
                return this.reset();//this.mode( 0, tm );
            }

        }*/

    }

    mousemove ( e ) {

        let nup = false;
        let x = 0;

        let name = this.testZone( e );

        if( name === '' ) this.cursor();
        else { 
        	if(!this.isDrag) this.cursor('text');
        	else this.cursor( this.current !== -1 ? 'move' : 'pointer' );
        }

        

        if( this.isDrag ){

        	if( this.current !== -1 ){

            	this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );

                let n = this.prev.v + ( this.prev.d * this.step);

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

    }

    //keydown: function ( e ) { return true; },

    // ----------------------

    reset () {

        let nup = false;
        //this.isDown = false;

        //this.current = 0;

       /* let i = this.lng;
        while(i--){ 
            if(this.cMode[i]!==0){
                this.cMode[i] = 0;
                //this.c[2+i].style.borderColor = this.colors.border;
                nup = true;
            }
        }*/

        return nup;

    }


    setValue ( v ) {

        if( this.isVector ){

            if( v.x !== undefined ) this.value[0] = v.x;
            if( v.y !== undefined ) this.value[1] = v.y;
            if( v.z !== undefined ) this.value[2] = v.z;
            if( v.w !== undefined ) this.value[3] = v.w;

        } else {
            this.value = v;
        }

        
        
        this.update();

        //let i = this.value.length;

        /*n = n || 0;
        this.value[n] = this.numValue( v );
        this.c[ 3 + n ].textContent = this.value[n];*/

    }

    sameStr ( str ){

        let i = this.value.length;
        while(i--) this.c[ 3 + i ].textContent = str;

    }

    update ( up ) {

        let i = this.value.length;

        while(i--){
             this.value[i] = this.numValue( this.value[i] * this.invmulty );
             this.c[ 3 + i ].textContent = this.value[i];
        }

        if( up ) this.send();

    }

    send ( v ) {

        v = v || this.value;

        this.isSend = true;

        if( this.objectLink !== null ){ 

            if( this.isVector ){

                this.objectLink[ this.val ].fromArray( v );

                /*this.objectLink[ this.val ].x = v[0];
                this.objectLink[ this.val ].y = v[1];
                this.objectLink[ this.val ].z = v[2];
                if( v[3] ) this.objectLink[ this.val ].w = v[3];*/

            } else {
                this.objectLink[ this.val ] = v;
            }

        }

        if( this.callback ) this.callback( v, this.val );

        this.isSend = false;

    }


    // ----------------------
    //   INPUT
    // ----------------------

    select ( c, e, w ) {

        let s = this.s;
        let d = this.current !== -1 ? this.tmp[this.current][0] + 5 : 0;
        s[this.cursorId].width = '1px';
        s[this.cursorId].left = ( d + c ) + 'px';
        s[2].left = ( d + e ) + 'px';
        s[2].width = w + 'px';
    
    }

    unselect () {

        let s = this.s;
        if(!s) return;
        s[2].width = 0 + 'px';
        s[this.cursorId].width = 0 + 'px';

    }

    validate ( force ) {

        let ar = [];
        let i = this.lng;

        if( this.allway ) force = true;

        while(i--){
        	if(!isNaN( this.c[ 3 + i ].textContent )){ 
                let nx = this.numValue( this.c[ 3 + i ].textContent );
                this.c[ 3 + i ].textContent = nx;
                this.value[i] = nx;
            } else { // not number
                this.c[ 3 + i ].textContent = this.value[i];
            }

        	ar[i] = this.value[i] * this.multy;
        }

        if( !force ) return;

        if( this.isSingle ) this.send( ar[0] );
        else this.send( ar );

    }

    // ----------------------
    //   REZISE
    // ----------------------

    rSize () {

        super.rSize();

        let w = Math.floor( ( this.sb + 5 ) / this.lng )-5;
        let s = this.s;
        let i = this.lng;
        while(i--){
            this.tmp[i] = [ Math.floor( this.sa + ( w * i )+( 5 * i )), w ];
            this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
            s[ 3 + i ].left = this.tmp[i][0] + 'px';
            s[ 3 + i ].width = this.tmp[i][1] + 'px';
        }

    }

}

class Slide extends Proto {

    constructor( o = {} ) {

        super( o );

        this.setTypeNumber( o );


        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;
        this.buttonColor = o.bColor || this.colors.button;

        this.defaultBorderColor = this.colors.hide;

        this.isDown = false;
        this.isOver = false;
        this.allway = o.allway || false;

        this.isDeg = o.isDeg || false;

        this.firstImput = false;

        //this.c[2] = this.dom( 'div', this.css.txtselect + 'letter-spacing:-1px; text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.fontColor );
        //this.c[2] = this.dom( 'div', this.css.txtselect + 'text-align:right; width:47px; border:1px dashed '+this.defaultBorderColor+'; color:'+ this.fontColor );
        this.c[2] = this.dom( 'div', this.css.txtselect + 'border:none; width:47px; color:'+ this.fontColor );
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

            let h1 = 4, h2 = 8, ww = this.h-4, ra = 20;

            if( this.model === 2 ){
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

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        
        if( l.x >= this.txl ) return 'text';
        else if( l.x >= this.sa ) return 'scroll';
        else return '';

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
        
        if( this.isDown ) this.isDown = false;
        
    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false;

        if( name === 'scroll' ){ 
            this.isDown = true;
            this.old = this.value;
            this.mousemove( e );
            
        }

        /*if( name === 'text' ){
            this.setInput( this.c[2], function(){ this.validate() }.bind(this) );
        }*/

        return true;

    }

    mousemove ( e ) {

        let nup = false;

        let name = this.testZone( e );

        if( name === 'scroll' ) {
            this.mode(1);
            this.cursor('w-resize');
        //} else if(name === 'text'){ 
            //this.cursor('pointer');
        } else {
            this.cursor();
        }

        if( this.isDown ){

            let n = ((( e.clientX - (this.zone.x+this.sa) - 3 ) / this.ww ) * this.range + this.min ) - this.old;
            if(n >= this.step || n <= this.step){ 
                n = Math.floor( n / this.step );
                this.value = this.numValue( this.old + ( n * this.step ) );
                this.update( true );
                this.old = this.value;
            }
            nup = true;
        }

        return nup;

    }

    //keydown: function ( e ) { return true; },

    // ----------------------

    validate () {
        
        let n = this.c[2].textContent;

        if(!isNaN( n )){ 
            this.value = this.numValue( n ); 
            this.update(true); 
        }

        else this.c[2].textContent = this.value + (this.isDeg ? '°':'');

    }


    reset () {

        //this.clearInput();
        this.isDown = false;
        this.mode(0);

    }

    mode ( mode ) {

        let s = this.s;

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
    }

    update ( up ) {

        let ww = Math.floor( this.ww * (( this.value - this.min ) / this.range ));
       
        if(this.model !== 3) this.s[5].width = ww + 'px';
        if(this.s[6]) this.s[6].left = ( this.sa + ww + 3 ) + 'px';
        this.c[2].textContent = this.value + (this.isDeg ? '°':'');

        if( up ) this.send();

    }

    rSize () {

        super.rSize();

        let w = this.sb - this.sc;
        this.ww = w - 6;

        let tx = this.sc;
        if(this.isUI || !this.simple) tx = this.sc+10;
        this.txl = this.w - tx + 2;

        //let ty = Math.floor(this.h * 0.5) - 8;

        let s = this.s;

        s[2].width = (this.sc -6 )+ 'px';
        s[2].left = (this.txl +4) + 'px';
        //s[2].top = ty + 'px';
        s[3].left = this.sa + 'px';
        s[3].width = w + 'px';
        s[4].left = this.sa + 'px';
        s[4].width = w + 'px';
        s[5].left = (this.sa + 3) + 'px';

        this.update();

    }

}

class TextInput extends Proto {

    constructor( o = {} ) {

        super( o );

        this.cmode = 0;

        this.value = o.value || '';
        this.placeHolder = o.placeHolder || '';

        this.allway = o.allway || false;
        this.editable = o.edit !== undefined ? o.edit : true;


        this.isDown = false;

        // bg
        this.c[2] = this.dom( 'div', this.css.basic + ' background:' + this.colors.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' );

        this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; background:' + this.colors.inputBg + '; borderColor:' + this.colors.inputBorder+'; border-radius:'+this.radius+'px;' );
        this.c[3].textContent = this.value;

        // cursor
        this.c[4] = this.dom( 'div', this.css.basic + 'top:4px; height:' + (this.h-8) + 'px; width:0px; background:'+this.fontColor+';' );

        // fake
        this.c[5] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; justify-content: center; font-style: italic; color:'+this.colors.inputHolder+';' );
        if( this.value === '' ) this.c[5].textContent = this.placeHolder;


        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x >= this.sa ) return 'text';
        return '';

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        if(!this.editable) return;

        if( this.isDown ){
            this.isDown = false;
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

        if(!this.editable) return;

        let name = this.testZone( e );

        if( !this.isDown ){
            this.isDown = true;
            if( name === 'text' ) this.setInput( this.c[3] );
            return this.mousemove( e );
        }

        return false;

    }

    mousemove ( e ) {

        if(!this.editable) return;

        let name = this.testZone( e );

        //let l = this.local;
        //if( l.x === -1 && l.y === -1 ){ return;}

        //if( l.x >= this.sa ) this.cursor('text');
        //else this.cursor();

        let x = 0;

        if( name === 'text' ) this.cursor('text');
        else this.cursor();

        if( this.isDown ) x = e.clientX - this.zone.x;

        return this.upInput( x - this.sa -3, this.isDown );

    }

    // ----------------------

    render ( c, e, s ) {

        this.s[4].width = '1px';
        this.s[4].left = (this.sa + c+5) + 'px';

        this.s[2].left = (this.sa + e+5) + 'px';
        this.s[2].width = s+'px';
    
    }


    reset () {

        this.cursor();

    }

    // ----------------------
    //   INPUT
    // ----------------------

    select ( c, e, w ) {

        let s = this.s;
        let d = this.sa + 5;
        s[4].width = '1px';
        s[4].left = ( d + c ) + 'px';
        s[2].left = ( d + e ) + 'px';
        s[2].width = w + 'px';
    
    }

    unselect () {

        let s = this.s;
        if(!s) return;
        s[2].width = 0 + 'px';
        s[4].width = 0 + 'px';

    }

    validate ( force ) {

        if( this.allway ) force = true; 

        this.value = this.c[3].textContent;

        if(this.value !== '') this.c[5].textContent = '';
        else this.c[5].textContent = this.placeHolder;

        if( !force ) return;

        this.send();

    }

    // ----------------------
    //   REZISE
    // ----------------------

    rSize () {

        super.rSize();

        let s = this.s;
        s[3].left = this.sa + 'px';
        s[3].width = this.sb + 'px';

        s[5].left = this.sa + 'px';
        s[5].width = this.sb + 'px';
     
    }


}

class Title extends Proto {

    constructor( o = {} ) {

        super( o );

        let prefix = o.prefix || '';

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

    text ( txt ) {

        this.c[1].textContent = txt;

    }

    text2 ( txt ) {

        this.c[2].textContent = txt;

    }

    rSize () {

        super.rSize();
        this.s[1].width = this.w - 50 + 'px';
        this.s[2].left = this.w - ( 50 + 26 ) + 'px';

    }

}

class Select extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = o.value || '';

        this.isDown = false;

        this.onActif = o.onActif || function(){};

        this.buttonColor = o.bColor || this.colors.button;
        this.buttonOver = o.bOver || this.colors.over;
        this.buttonDown = o.bDown || this.colors.select;
        this.buttonAction = o.bAction || this.colors.action;

        o.prefix || '';

        this.c[2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:15px; width:30px; left:10px;' );
        this.c[2].style.color = this.fontColor;

        this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; background:' + this.colors.inputBg + '; borderColor:' + this.colors.inputBorder+'; border-radius:'+this.radius+'px;' );
        this.c[3].textContent = this.value;

        let fltop = Math.floor(this.h*0.5)-7;
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.svgs[ 'cursor' ], fill:this.fontColor, stroke:'none'});

        this.stat = 1;
        this.isActif = false;

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x > this.sa && l.x < this.sa+30 ) return 'over';
        return '0'

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            //this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false;

        this.isDown = true;
        //this.value = this.values[ name-2 ];
        //this.send();
        return this.mousemove( e );

    }

    mousemove ( e ) {

        let up = false;

        let name = this.testZone( e );
        //let sel = false;

        

        //console.log(name)

        if( name === 'over' ){
            this.cursor('pointer');
            up = this.mode( this.isDown ? 3 : 2 );
        } else {
            up = this.reset();
        }

        return up;

    }

    // ----------------------

    apply ( v ) {

        v = v || '';

        if( v !== this.value ) {
            this.value = v;
            this.c[3].textContent = this.value;
            this.send();
        }
        
        this.mode(1);

    }

    update () {

        this.mode( 3 );

    }

    mode ( n ) {

        let change = false;

        if( this.stat !== n ){

            if( n===1 ) this.isActif = false;
            if( n===3 ){ 
                if( !this.isActif ){ this.isActif = true; n=4; this.onActif( this ); }
                else { this.isActif = false; }
            }

            if( n===2 && this.isActif ) n = 4;

            switch( n ){

                case 1: this.stat = 1; this.s[ 2 ].color = this.fontColor;  this.s[ 2 ].background = this.buttonColor; break; // base
                case 2: this.stat = 2; this.s[ 2 ].color = this.fontSelect; this.s[ 2 ].background = this.buttonOver; break; // over
                case 3: this.stat = 3; this.s[ 2 ].color = this.fontSelect; this.s[ 2 ].background = this.buttonDown; break; // down
                case 4: this.stat = 4; this.s[ 2 ].color = this.fontSelect; this.s[ 2 ].background = this.buttonAction; break; // actif

            }

            change = true;

        }

        return change;



    }

    reset () {

        this.cursor();
        return this.mode( this.isActif ? 4 : 1 );

    }

    text ( txt ) {

        this.c[3].textContent = txt;

    }

    rSize () {

        super.rSize();

        let s = this.s;
        s[2].left = this.sa + 'px';
        s[3].left = (this.sa + 40) + 'px';
        s[3].width = (this.sb - 40) + 'px';
        s[4].left = (this.sa+8) + 'px';

    }

}

class Selector extends Proto {

    constructor( o = {} ) {

        super( o );

        this.values = o.values;
        if(typeof this.values === 'string' ) this.values = [ this.values ];

        this.value = o.value || this.values[0];



        //this.selected = null;
        this.isDown = false;

        this.buttonColor = o.bColor || this.colors.button;
        this.buttonOver = o.bOver || this.colors.over;
        this.buttonDown = o.bDown || this.colors.select;

        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];

        let sel;

        for(let i = 0; i < this.lng; i++){

            sel = false;
            if( this.values[i] === this.value ) sel = true;

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+(sel? this.buttonDown : this.buttonColor)+'; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:'+this.radius+'px;' );
            this.c[i+2].style.color = sel ? this.fontSelect : this.fontColor;
            this.c[i+2].innerHTML = this.values[i];
            
            this.stat[i] = sel ? 3:1;
        }

        this.init();
     
    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let i = this.lng;
        let t = this.tmp;
        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i+2;
        }

        return ''

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            //this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

    	let name = this.testZone( e );

        if( !name ) return false;

    	this.isDown = true;
        this.value = this.values[ name-2 ];
        this.send();
    	return this.mousemove( e );
 
        // true;

    }

    mousemove ( e ) {

        let up = false;

        let name = this.testZone( e );
        //let sel = false;

        

        //console.log(name)

        if( name !== '' ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, name );
        } else {
        	up = this.reset();
        }

        return up;

    }

    // ----------------------

    modes ( n, name ) {

        let v, r = false;

        for( let i = 0; i < this.lng; i++ ){

            if( i === name-2 && this.values[ i ] !== this.value ) v = this.mode( n, i+2 );
            else { 

                if( this.values[ i ] === this.value ) v = this.mode( 3, i+2 );
                else v = this.mode( 1, i+2 );

            }

            if(v) r = true;

        }

        return r;

    }

    mode ( n, name ) {

        let change = false;

        let i = name - 2;


        if( this.stat[i] !== n ){

           
        
            switch( n ){

                case 1: this.stat[i] = 1; this.s[ i+2 ].color = this.fontColor;  this.s[ i+2 ].background = this.buttonColor; break;
                case 2: this.stat[i] = 2; this.s[ i+2 ].color = this.fontSelect; this.s[ i+2 ].background = this.buttonOver; break;
                case 3: this.stat[i] = 3; this.s[ i+2 ].color = this.fontSelect; this.s[ i+2 ].background = this.buttonDown; break;

            }

            change = true;

        }
        

        return change;

    }

    // ----------------------

    reset () {

        this.cursor();

        let v, r = false;

        for( let i = 0; i < this.lng; i++ ){

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

    }

    label ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

    }

    icon ( string, y, n ) {

        n = n || 2;
        this.s[n].padding = ( y || 0 ) +'px 0px';
        this.c[n].innerHTML = string;

    }

    rSize () {

        super.rSize();
        let s = this.s;
        let w = this.sb;
        let d = this.sa;

        let i = this.lng;
        let dc =  3;
        let size = Math.floor( ( w-(dc*(i-1)) ) / i );

        while(i--){

        	this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
            s[i+2].left = this.tmp[i][0] + 'px';
            s[i+2].width = this.tmp[i][1] + 'px';

        }

    }

}

class Empty extends Proto {

    constructor( o = {} ) {

	    o.simple = true;
	    o.isEmpty = true;

        super( o );
        this.init();

    }
    
}

class Item extends Proto {

    constructor( o = {} ) {

        super( o );

        this.p = 100;
        this.value = this.txt;
        this.status = 1;

        this.itype = o.itype || 'none';
        this.val = this.itype;

        this.graph = this.svgs[ this.itype ];

        let fltop = Math.floor(this.h*0.5)-7;

        this.c[2] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.graph, fill:this.fontColor, stroke:'none'});

        this.s[1].marginLeft = 20 + 'px';

        this.init();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousemove ( e ) {

        this.cursor('pointer');

        //up = this.modes( this.isDown ? 3 : 2, name );

    }

    mousedown ( e ) {

        if( this.isUI ) this.main.resetItem();

        this.selected( true );

        this.send();

        return true;

    }

    uiout () {

        if( this.isSelect ) this.mode(3);
        else this.mode(1);

    }

    uiover () {

        if( this.isSelect ) this.mode(4);
        else this.mode(2);

    }

    update () {
            
    }

    /*rSize () {
        
        super.rSize();

    }*/

    mode ( n ) {

        let change = false;

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

    }

    reset () {

        this.cursor();
       // return this.mode( 1 );

    }

    selected ( b ){

        if( this.isSelect ) this.mode(1);

        this.isSelect = b || false;

        if( this.isSelect ) this.mode(3);
        
    }


}

class Grid extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = false;

        this.values = o.values || [];

        if( typeof this.values === 'string' ) this.values = [ this.values ];

        //this.selected = null;
        this.isDown = false;

        this.buttonColor = o.bColor || this.colors.button;
        this.buttonOver = o.bOver || this.colors.over;
        this.buttonDown = o.bDown || this.colors.select;

        this.spaces = o.spaces || [10,3];
        this.bsize = o.bsize || [90,20];



        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];
        this.grid = [2, Math.round( this.lng * 0.5 ) ];
        this.h = Math.round( this.lng * 0.5 ) * ( this.bsize[1] + this.spaces[1] ) + this.spaces[1]; 
        this.c[1].textContent = '';

        this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; top:'+(this.spaces[1]-2)+'px; height:auto; border-collapse:separate; border:none; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1]-2)+'px;' );

        let n = 0, b, td, tr;

        this.buttons = [];
        this.stat = [];
        this.tmpX = [];
        this.tmpY = [];


        for( let i = 0; i < this.grid[1]; i++ ){
            tr = this.c[2].insertRow();
            tr.style.cssText = 'pointer-events:none;';
            for( let j = 0; j < this.grid[0]; j++ ){

                td = tr.insertCell();
                td.style.cssText = 'pointer-events:none;';

                if( this.values[n] ){

                    b = document.createElement( 'div' );
                    b.style.cssText = this.css.txt + this.css.button + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; border:'+this.colors.buttonBorder+'; left:auto; right:auto; background:'+this.buttonColor+';  border-radius:'+this.radius+'px;';
                    b.innerHTML = this.values[n];
                    td.appendChild( b );

                    this.buttons.push(b);
                    this.stat.push(1);

                } else {

                    b = document.createElement( 'div' );
                    b.style.cssText = this.css.txt + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; text-align:center;  left:auto; right:auto; background:none;';
                    td.appendChild( b );

                }

                if(j===0) b.style.cssText += 'float:right;';
                else b.style.cssText += 'float:left;';
            
                n++;

            }
        }

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return -1;

        
        let tx = this.tmpX;
        let ty = this.tmpY;

        let id = -1;
        let c = -1;
        let line = -1;
        let i = this.grid[0];
        while( i-- ){
        	if( l.x > tx[i][0] && l.x < tx[i][1] ) c = i;
        }

        i = this.grid[1];
        while( i-- ){
            if( l.y > ty[i][0] && l.y < ty[i][1] ) line = i;
        }

        if(c!==-1 && line!==-1){
            id = c + (line*2);
            if(id>this.lng-1) id = -1;
        }

        return id;

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

    	let id = this.testZone( e );

        if( id < 0 ) return false;

    	this.isDown = true;
        this.value = this.values[id];
        this.send();
    	return this.mousemove( e );

    }

    mousemove ( e ) {

        let up = false;

        let id = this.testZone( e );

        if( id !== -1 ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, id );
        } else {
        	up = this.reset();
        }

        return up;

    }

    // ----------------------

    modes ( n, id ) {

        let v, r = false;

        for( let i = 0; i < this.lng; i++ ){

            if( i === id ) v = this.mode( n, i );
            else v = this.mode( 1, i );

            if(v) r = true;

        }

        return r;

    }

    mode ( n, id ) {

        let change = false;

        let i = id;

        if( this.stat[i] !== n ){
        
            switch( n ){

                case 1: this.stat[i] = 1; this.buttons[ i ].style.color = this.fontColor;  this.buttons[ i ].style.background = this.buttonColor; break;
                case 2: this.stat[i] = 2; this.buttons[ i ].style.color = this.fontSelect; this.buttons[ i ].style.background = this.buttonOver; break;
                case 3: this.stat[i] = 3; this.buttons[ i ].style.color = this.fontSelect; this.buttons[ i ].style.background = this.buttonDown; break;

            }

            change = true;

        }
        

        return change;

    }

    // ----------------------

    reset () {

        this.cursor();
        return this.modes( 1 , 0 );
    }


    label ( string, n ) {

        this.buttons[n].textContent = string;

    }

    icon ( string, y, n ) {

        this.buttons[n].style.padding = ( y || 0 ) +'px 0px';
        this.buttons[n].innerHTML = string;

    }

    rSize () {

        super.rSize();

        let mid;

        this.tmpX = [];
        this.tmpY = [];

        for( let j = 0; j < this.grid[0]; j++ ){

            if(j===0){
                mid = ( this.w*0.5 ) - ( this.spaces[0]*0.5 );
                this.tmpX.push( [ mid-this.bsize[0], mid ] );
            } else {
                mid = ( this.w*0.5 ) + ( this.spaces[0]*0.5 );
                this.tmpX.push( [ mid, mid+this.bsize[0] ] );
            }

        }

        mid = this.spaces[1];

        for( let i = 0; i < this.grid[1]; i++ ){

            this.tmpY.push( [ mid, mid + this.bsize[1] ] );

            mid += this.bsize[1] + this.spaces[1];
            
        }

    }

}

class add {

    constructor () {

        let a = arguments; 

        let type, o, ref = false, n = null;

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

        let name = type.toLowerCase();

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
            case 'select': n = new Select(o); break;
            case 'selector': n = new Selector(o); break;
            case 'empty': case 'space': n = new Empty(o); break;
            case 'item': n = new Item(o); break;
            case 'grid': n = new Grid(o); break;

        }

        if( n !== null ){

            if( ref ) n.setReferency( a[0], a[1] );
            return n;

        }

    }
}

/**
 * @author lth / https://github.com/lo-th
 */

class Gui {

    constructor( o = {} ) {

        this.canvas = null;

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

    setTop ( t, h ) {

        this.content.style.top = t + 'px';
        if( h !== undefined ) this.forceHeight = h;
        this.setHeight();

        Roots.needReZone = true;

    }

    //callback: function () {},

    dispose () {

        this.clear();
        if( this.parent !== null ) this.parent.removeChild( this.content );
        Roots.remove( this );

    }

    // ----------------------
    //   CANVAS
    // ----------------------

    onDraw () {}

    makeCanvas () {

    	this.canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', "canvas" );
    	this.canvas.width = this.zone.w;
    	this.canvas.height = this.forceHeight ? this.forceHeight : this.zone.h;

    }

    draw ( force ) {

    	if( this.canvas === null ) return;

    	let w = this.zone.w;
    	let h = this.forceHeight ? this.forceHeight : this.zone.h;
    	Roots.toCanvas( this, w, h, force );

    }

    //////

    getDom () {

        return this.content;

    }

    setMouse ( m ) {

        this.mouse.set( m.x, m.y );

    }

    setConfig ( o ) {

        this.setColors( o );
        this.setText( o.fontSize, o.text, o.font, o.shadow );

    }

    setColors ( o ) {

        for( let c in o ){
            if( this.colors[c] ) this.colors[c] = o[c];
        }

    }

    setText ( size, color, font, shadow ) {

        Tools.setText( size, color, font, shadow, this.colors, this.css );

    }

    hide ( b ) {

        this.content.style.display = b ? 'none' : 'block';
        
    }

    onChange ( f ) {

        this.callback = f || null;
        return this;

    }

    // ----------------------
    //   STYLES
    // ----------------------

    mode ( n ) {

    	let needChange = false;

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

    }

    // ----------------------
    //   TARGET
    // ----------------------

    clearTarget () {

    	if( this.current === -1 ) return false;
        //if(!this.target) return;
        this.target.uiout();
        this.target.reset();
        this.target = null;
        this.current = -1;

        ///console.log(this.isDown)//if(this.isDown)Roots.clearInput();

        

        Roots.cursor();
        return true;

    }

    // ----------------------
    //   ZONE TEST
    // ----------------------

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        this.isReset = false;

        let name = '';

        let s = this.isScroll ?  this.zone.w  - this.size.s : this.zone.w;
        
        if( l.y > this.zone.h - this.bh &&  l.y < this.zone.h ) name = 'bottom';
        else name = l.x > s ? 'scroll' : 'content';

        return name;

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent ( e ) {

    	let type = e.type;

    	let change = false;
    	let targetChange = false;

    	let name = this.testZone( e );

        

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

    }

    getNext ( e, change ) {



        let next = Roots.findTarget( this.uis, e );

        if( next !== this.current ){
            this.clearTarget();
            this.current = next;

            this.isNewTarget = true;

        }

        if( next !== -1 ){ 
            this.target = this.uis[ this.current ];
            this.target.uiover();
        }

    }

    onWheel ( e ) {

        this.oy += 20*e.delta;
        this.update( this.oy );
        return true;

    }

    // ----------------------
    //   RESET
    // ----------------------

    reset ( force ) {

        if( this.isReset ) return;

        //this.resetItem();

        this.mouse.neg();
        this.isDown = false;

        //Roots.clearInput();
        let r = this.mode('def');
        let r2 = this.clearTarget();

        if( r || r2 ) this.draw( true );

        this.isReset = true;

        //Roots.lock = false;

    }

    // ----------------------
    //   ADD NODE
    // ----------------------

    add () {

        let a = arguments;

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

        let u = add.apply( this, a );

        if( u === null ) return;


        //let n = add.apply( this, a );
        //let n = UIL.add( ...args );

        this.uis.push( u );
        //n.py = this.h;

        if( !u.autoWidth ){
            let y = u.c[0].getBoundingClientRect().top;
            if( this.prevY !== y ){
                this.calc( u.h + 1 );
                this.prevY = y;
            }
        }else {
            this.prevY = 0;//-1;
            this.calc( u.h + 1 );
        }

        return u;

    }

    applyCalc () {

        //console.log(this.uis.length, this.tmpH )

        this.calc( this.tmpH );
        //this.tmpH = 0;
        this.tmpAdd = null;

    }

    calcUis () {

        Roots.calcUis( this.uis, this.zone, this.zone.y );

    }

    // remove one node

    remove ( n ) { 

        let i = this.uis.indexOf( n ); 
        if ( i !== -1 ) this.uis[i].clear();

    }

    // call after uis clear

    clearOne ( n ) { 

        let i = this.uis.indexOf( n ); 
        if ( i !== -1 ) {
            this.inner.removeChild( this.uis[i].c[0] );
            this.uis.splice( i, 1 ); 
        }

    }

    // clear all gui

    clear () {

        //this.callback = null;

        let i = this.uis.length;
        while(i--) this.uis[i].clear();

        this.uis = [];
        Roots.listens = [];

        this.calc( -this.h );

    }

    // ----------------------
    //   ITEMS SPECIAL
    // ----------------------


    resetItem () {

        if( !this.isItemMode ) return;

        let i = this.uis.length;
        while(i--) this.uis[i].selected();

    }

    setItem ( name ) {

        if( !this.isItemMode ) return;

        name = name || '';

        this.resetItem();

        if( !name ){
            this.update(0);
            return;
        } 

        let i = this.uis.length;
        while(i--){ 
            if( this.uis[i].value === name ){ 
                this.uis[i].selected( true );
                if( this.isScroll ) this.update( ( i*(this.uis[i].h+1) )*this.ratio );
            }
        }

    }



    // ----------------------
    //   SCROLL
    // ----------------------

    upScroll ( b ) {

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

    }

    update ( y ) {

        y = Tools.clamp( y, 0, this.range );

        this.decal = Math.floor( y / this.ratio );
        this.inner.style.top = - this.decal + 'px';
        this.scroll.style.top = Math.floor( y ) + 'px';
        this.oy = y;

    }

    // ----------------------
    //   RESIZE FUNCTION
    // ----------------------

    calc ( y ) {

        this.h += y;
        clearTimeout( this.tmp );
        this.tmp = setTimeout( this.setHeight.bind(this), 10 );

    }

    setHeight () {

        if( this.tmp ) clearTimeout( this.tmp );

        //console.log(this.h )

        this.zone.h = this.bh;
        this.isScroll = false;

        if( this.isOpen ){

            let hhh = this.forceHeight ? this.forceHeight + this.zone.y : window.innerHeight;

            this.maxHeight = hhh - this.zone.y - this.bh;

            let diff = this.h - this.maxHeight;

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

    }

    rezone () {
        Roots.needReZone = true;
    }

    setWidth ( w ) {

        if( w ) this.zone.w = w;

        this.content.style.width = this.zone.w + 'px';

        if( this.isCenter ) this.content.style.marginLeft = -(Math.floor(this.zone.w*0.5)) + 'px';

        this.setItemWidth( this.zone.w - this.sw );

        this.setHeight();

        if( !this.isCanvasOnly ) Roots.needReZone = true;
        //this.resize();

    }

    setItemWidth ( w ) {

        let i = this.uis.length;
        while(i--){
            this.uis[i].setSize( w );
            this.uis[i].rSize();
        }

    }

}

Gui.prototype.isGui = true;

//import './polyfills.js';

const REVISION = '2.8';

export { Bool, Button, Circular, Color, Fps, Group, Gui, Joystick, Knob, List, Numeric, Proto, REVISION, Slide, TextInput, Title, Tools, add };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlsLm1vZHVsZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvVG9vbHMuanMiLCIuLi9zcmMvY29yZS9Sb290cy5qcyIsIi4uL3NyYy9jb3JlL1YyLmpzIiwiLi4vc3JjL2NvcmUvUHJvdG8uanMiLCIuLi9zcmMvcHJvdG8vQm9vbC5qcyIsIi4uL3NyYy9wcm90by9CdXR0b24uanMiLCIuLi9zcmMvcHJvdG8vQ2lyY3VsYXIuanMiLCIuLi9zcmMvcHJvdG8vQ29sb3IuanMiLCIuLi9zcmMvcHJvdG8vRnBzLmpzIiwiLi4vc3JjL3Byb3RvL0dyYXBoLmpzIiwiLi4vc3JjL3Byb3RvL0dyb3VwLmpzIiwiLi4vc3JjL3Byb3RvL0pveXN0aWNrLmpzIiwiLi4vc3JjL3Byb3RvL0tub2IuanMiLCIuLi9zcmMvcHJvdG8vTGlzdC5qcyIsIi4uL3NyYy9wcm90by9OdW1lcmljLmpzIiwiLi4vc3JjL3Byb3RvL1NsaWRlLmpzIiwiLi4vc3JjL3Byb3RvL1RleHRJbnB1dC5qcyIsIi4uL3NyYy9wcm90by9UaXRsZS5qcyIsIi4uL3NyYy9wcm90by9TZWxlY3QuanMiLCIuLi9zcmMvcHJvdG8vU2VsZWN0b3IuanMiLCIuLi9zcmMvcHJvdG8vRW1wdHkuanMiLCIuLi9zcmMvcHJvdG8vSXRlbS5qcyIsIi4uL3NyYy9wcm90by9HcmlkLmpzIiwiLi4vc3JjL2NvcmUvYWRkLmpzIiwiLi4vc3JjL2NvcmUvR3VpLmpzIiwiLi4vc3JjL1VpbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG5jb25zdCBUID0ge1xyXG5cclxuICAgIGZyYWc6IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxcclxuXHJcbiAgICBjb2xvclJpbmc6IG51bGwsXHJcbiAgICBqb3lzdGlja18wOiBudWxsLFxyXG4gICAgam95c3RpY2tfMTogbnVsbCxcclxuICAgIGNpcmN1bGFyOiBudWxsLFxyXG4gICAga25vYjogbnVsbCxcclxuXHJcbiAgICBzdmduczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxyXG4gICAgbGlua3M6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxyXG4gICAgaHRtbHM6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFxyXG5cclxuICAgIERPTV9TSVpFOiBbICdoZWlnaHQnLCAnd2lkdGgnLCAndG9wJywgJ2xlZnQnLCAnYm90dG9tJywgJ3JpZ2h0JywgJ21hcmdpbi1sZWZ0JywgJ21hcmdpbi1yaWdodCcsICdtYXJnaW4tdG9wJywgJ21hcmdpbi1ib3R0b20nXSxcclxuICAgIFNWR19UWVBFX0Q6IFsgJ3BhdHRlcm4nLCAnZGVmcycsICd0cmFuc2Zvcm0nLCAnc3RvcCcsICdhbmltYXRlJywgJ3JhZGlhbEdyYWRpZW50JywgJ2xpbmVhckdyYWRpZW50JywgJ2FuaW1hdGVNb3Rpb24nLCAndXNlJywgJ2ZpbHRlcicsICdmZUNvbG9yTWF0cml4JyBdLFxyXG4gICAgU1ZHX1RZUEVfRzogWyAnc3ZnJywgJ3JlY3QnLCAnY2lyY2xlJywgJ3BhdGgnLCAncG9seWdvbicsICd0ZXh0JywgJ2cnLCAnbGluZScsICdmb3JlaWduT2JqZWN0JyBdLFxyXG5cclxuICAgIFBJOiBNYXRoLlBJLFxyXG4gICAgVHdvUEk6IE1hdGguUEkqMixcclxuICAgIHBpOTA6IE1hdGguUEkgKiAwLjUsXHJcbiAgICBwaTYwOiBNYXRoLlBJLzMsXHJcbiAgICBcclxuICAgIHRvcmFkOiBNYXRoLlBJIC8gMTgwLFxyXG4gICAgdG9kZWc6IDE4MCAvIE1hdGguUEksXHJcblxyXG4gICAgY2xhbXA6IGZ1bmN0aW9uICh2LCBtaW4sIG1heCkge1xyXG5cclxuICAgICAgICB2ID0gdiA8IG1pbiA/IG1pbiA6IHY7XHJcbiAgICAgICAgdiA9IHYgPiBtYXggPyBtYXggOiB2O1xyXG4gICAgICAgIHJldHVybiB2O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2l6ZTogeyAgdzogMjQwLCBoOiAyMCwgcDogMzAsIHM6IDIwIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDT0xPUlxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNsb25lQ29sb3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGNjID0gT2JqZWN0LmFzc2lnbih7fSwgVC5jb2xvcnMgKTtcclxuICAgICAgICByZXR1cm4gY2M7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZUNzczogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgY2MgPSBPYmplY3QuYXNzaWduKHt9LCBULmNzcyApO1xyXG4gICAgICAgIHJldHVybiBjYztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNvbG9yczoge1xyXG5cclxuICAgICAgICB0ZXh0IDogJyNDMEMwQzAnLFxyXG4gICAgICAgIHRleHRPdmVyIDogJyNGRkZGRkYnLFxyXG4gICAgICAgIHR4dHNlbGVjdGJnIDogJ25vbmUnLFxyXG5cclxuICAgICAgICBiYWNrZ3JvdW5kOiAncmdiYSg0NCw0NCw0NCwwLjMpJyxcclxuICAgICAgICBiYWNrZ3JvdW5kT3ZlcjogJ3JnYmEoMTEsMTEsMTEsMC41KScsXHJcblxyXG4gICAgICAgIC8vaW5wdXQ6ICcjMDA1QUFBJyxcclxuXHJcbiAgICAgICAgaW5wdXRCb3JkZXI6ICcjNDU0NTQ1JyxcclxuICAgICAgICBpbnB1dEhvbGRlcjogJyM4MDgwODAnLFxyXG4gICAgICAgIGlucHV0Qm9yZGVyU2VsZWN0OiAnIzAwNUFBQScsXHJcbiAgICAgICAgaW5wdXRCZzogJ3JnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgaW5wdXRPdmVyOiAncmdiYSgwLDAsMCwwLjIpJyxcclxuXHJcbiAgICAgICAgYm9yZGVyIDogJyM0NTQ1NDUnLFxyXG4gICAgICAgIGJvcmRlck92ZXIgOiAnIzUwNTBBQScsXHJcbiAgICAgICAgYm9yZGVyU2VsZWN0IDogJyMzMDhBRkYnLFxyXG5cclxuICAgICAgICBzY3JvbGxiYWNrOidyZ2JhKDQ0LDQ0LDQ0LDAuMiknLFxyXG4gICAgICAgIHNjcm9sbGJhY2tvdmVyOidyZ2JhKDQ0LDQ0LDQ0LDAuMiknLFxyXG5cclxuICAgICAgICBidXR0b24gOiAnIzQwNDA0MCcsXHJcbiAgICAgICAgYm9vbGJnIDogJyMxODE4MTgnLFxyXG4gICAgICAgIGJvb2xvbiA6ICcjQzBDMEMwJyxcclxuXHJcbiAgICAgICAgc2VsZWN0IDogJyMzMDhBRkYnLFxyXG4gICAgICAgIG1vdmluZyA6ICcjMDNhZmZmJyxcclxuICAgICAgICBkb3duIDogJyMwMjQ2OTknLFxyXG4gICAgICAgIG92ZXIgOiAnIzAyNDY5OScsXHJcbiAgICAgICAgYWN0aW9uOiAnI0ZGMzMwMCcsXHJcblxyXG4gICAgICAgIHN0cm9rZTogJ3JnYmEoMTEsMTEsMTEsMC41KScsXHJcbiAgICAgICAgc2Nyb2xsOiAnIzMzMzMzMycsXHJcblxyXG4gICAgICAgIGhpZGU6ICdyZ2JhKDAsMCwwLDApJyxcclxuXHJcbiAgICAgICAgZ3JvdXBCb3JkZXI6ICdub25lJyxcclxuICAgICAgICBidXR0b25Cb3JkZXI6ICdub25lJyxcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIHN0eWxlIGNzc1xyXG5cclxuICAgIGNzcyA6IHtcclxuICAgICAgICAvL3Vuc2VsZWN0OiAnLW8tdXNlci1zZWxlY3Q6bm9uZTsgLW1zLXVzZXItc2VsZWN0Om5vbmU7IC1raHRtbC11c2VyLXNlbGVjdDpub25lOyAtd2Via2l0LXVzZXItc2VsZWN0Om5vbmU7IC1tb3otdXNlci1zZWxlY3Q6bm9uZTsnLCBcclxuICAgICAgICBiYXNpYzogJ3Bvc2l0aW9uOmFic29sdXRlOyBwb2ludGVyLWV2ZW50czpub25lOyBib3gtc2l6aW5nOmJvcmRlci1ib3g7IG1hcmdpbjowOyBwYWRkaW5nOjA7IG92ZXJmbG93OmhpZGRlbjsgJyArICctby11c2VyLXNlbGVjdDpub25lOyAtbXMtdXNlci1zZWxlY3Q6bm9uZTsgLWtodG1sLXVzZXItc2VsZWN0Om5vbmU7IC13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsgLW1vei11c2VyLXNlbGVjdDpub25lOycsXHJcbiAgICAgICAgYnV0dG9uOidkaXNwbGF5OmZsZXg7IGp1c3RpZnktY29udGVudDpjZW50ZXI7IGFsaWduLWl0ZW1zOmNlbnRlcjsgdGV4dC1hbGlnbjpjZW50ZXI7JyxcclxuICAgIH0sXHJcblxyXG4gICAgLy8gc3ZnIHBhdGhcclxuXHJcbiAgICBzdmdzOiB7XHJcblxyXG4gICAgICAgIGdyb3VwOidNIDcgNyBMIDcgOCA4IDggOCA3IDcgNyBNIDUgNyBMIDUgOCA2IDggNiA3IDUgNyBNIDMgNyBMIDMgOCA0IDggNCA3IDMgNyBNIDcgNSBMIDcgNiA4IDYgOCA1IDcgNSBNIDYgNiBMIDYgNSA1IDUgNSA2IDYgNiBNIDcgMyBMIDcgNCA4IDQgOCAzIDcgMyBNIDYgNCBMIDYgMyA1IDMgNSA0IDYgNCBNIDMgNSBMIDMgNiA0IDYgNCA1IDMgNSBNIDMgMyBMIDMgNCA0IDQgNCAzIDMgMyBaJyxcclxuICAgICAgICBhcnJvdzonTSAzIDggTCA4IDUgMyAyIDMgOCBaJyxcclxuICAgICAgICBhcnJvd0Rvd246J00gNSA4IEwgOCAzIDIgMyA1IDggWicsXHJcbiAgICAgICAgYXJyb3dVcDonTSA1IDIgTCAyIDcgOCA3IDUgMiBaJyxcclxuXHJcbiAgICAgICAgc29saWQ6J00gMTMgMTAgTCAxMyAxIDQgMSAxIDQgMSAxMyAxMCAxMyAxMyAxMCBNIDExIDMgTCAxMSA5IDkgMTEgMyAxMSAzIDUgNSAzIDExIDMgWicsXHJcbiAgICAgICAgYm9keTonTSAxMyAxMCBMIDEzIDEgNCAxIDEgNCAxIDEzIDEwIDEzIDEzIDEwIE0gMTEgMyBMIDExIDkgOSAxMSAzIDExIDMgNSA1IDMgMTEgMyBNIDUgNCBMIDQgNSA0IDEwIDkgMTAgMTAgOSAxMCA0IDUgNCBaJyxcclxuICAgICAgICB2ZWhpY2xlOidNIDEzIDYgTCAxMSAxIDMgMSAxIDYgMSAxMyAzIDEzIDMgMTEgMTEgMTEgMTEgMTMgMTMgMTMgMTMgNiBNIDIuNCA2IEwgNCAyIDEwIDIgMTEuNiA2IDIuNCA2IE0gMTIgOCBMIDEyIDEwIDEwIDEwIDEwIDggMTIgOCBNIDQgOCBMIDQgMTAgMiAxMCAyIDggNCA4IFonLFxyXG4gICAgICAgIGFydGljdWxhdGlvbjonTSAxMyA5IEwgMTIgOSA5IDIgOSAxIDUgMSA1IDIgMiA5IDEgOSAxIDEzIDUgMTMgNSA5IDQgOSA2IDUgOCA1IDEwIDkgOSA5IDkgMTMgMTMgMTMgMTMgOSBaJyxcclxuICAgICAgICBjaGFyYWN0ZXI6J00gMTMgNCBMIDEyIDMgOSA0IDUgNCAyIDMgMSA0IDUgNiA1IDggNCAxMyA2IDEzIDcgOSA4IDEzIDEwIDEzIDkgOCA5IDYgMTMgNCBNIDYgMSBMIDYgMyA4IDMgOCAxIDYgMSBaJyxcclxuICAgICAgICB0ZXJyYWluOidNIDEzIDggTCAxMiA3IFEgOS4wNiAtMy42NyA1Ljk1IDQuODUgNC4wNCAzLjI3IDIgNyBMIDEgOCA3IDEzIDEzIDggTSAzIDggUSAzLjc4IDUuNDIwIDUuNCA2LjYgNS4yMCA3LjI1IDUgOCBMIDcgOCBRIDguMzkgLTAuMTYgMTEgOCBMIDcgMTEgMyA4IFonLFxyXG4gICAgICAgIGpvaW50OidNIDcuNyA3LjcgUSA4IDcuNDUgOCA3IDggNi42IDcuNyA2LjMgNy40NSA2IDcgNiA2LjYgNiA2LjMgNi4zIDYgNi42IDYgNyA2IDcuNDUgNi4zIDcuNyA2LjYgOCA3IDggNy40NSA4IDcuNyA3LjcgTSAzLjM1IDguNjUgTCAxIDExIDMgMTMgNS4zNSAxMC42NSBRIDYuMSAxMSA3IDExIDguMjggMTEgOS4yNSAxMC4yNSBMIDcuOCA4LjggUSA3LjQ1IDkgNyA5IDYuMTUgOSA1LjU1IDguNCA1IDcuODUgNSA3IDUgNi41NCA1LjE1IDYuMTUgTCAzLjcgNC43IFEgMyA1LjcxMiAzIDcgMyA3LjkgMy4zNSA4LjY1IE0gMTAuMjUgOS4yNSBRIDExIDguMjggMTEgNyAxMSA2LjEgMTAuNjUgNS4zNSBMIDEzIDMgMTEgMSA4LjY1IDMuMzUgUSA3LjkgMyA3IDMgNS43IDMgNC43IDMuNyBMIDYuMTUgNS4xNSBRIDYuNTQgNSA3IDUgNy44NSA1IDguNCA1LjU1IDkgNi4xNSA5IDcgOSA3LjQ1IDguOCA3LjggTCAxMC4yNSA5LjI1IFonLFxyXG4gICAgICAgIHJheTonTSA5IDExIEwgNSAxMSA1IDEyIDkgMTIgOSAxMSBNIDEyIDUgTCAxMSA1IDExIDkgMTIgOSAxMiA1IE0gMTEuNSAxMCBRIDEwLjkgMTAgMTAuNDUgMTAuNDUgMTAgMTAuOSAxMCAxMS41IDEwIDEyLjIgMTAuNDUgMTIuNTUgMTAuOSAxMyAxMS41IDEzIDEyLjIgMTMgMTIuNTUgMTIuNTUgMTMgMTIuMiAxMyAxMS41IDEzIDEwLjkgMTIuNTUgMTAuNDUgMTIuMiAxMCAxMS41IDEwIE0gOSAxMCBMIDEwIDkgMiAxIDEgMiA5IDEwIFonLFxyXG4gICAgICAgIGNvbGxpc2lvbjonTSAxMSAxMiBMIDEzIDEwIDEwIDcgMTMgNCAxMSAyIDcuNSA1LjUgOSA3IDcuNSA4LjUgMTEgMTIgTSAzIDIgTCAxIDQgNCA3IDEgMTAgMyAxMiA4IDcgMyAyIFonLFxyXG4gICAgICAgIG1hcDonTSAxMyAxIEwgMSAxIDEgMTMgMTMgMTMgMTMgMSBNIDEyIDIgTCAxMiA3IDcgNyA3IDEyIDIgMTIgMiA3IDcgNyA3IDIgMTIgMiBaJyxcclxuICAgICAgICBtYXRlcmlhbDonTSAxMyAxIEwgMSAxIDEgMTMgMTMgMTMgMTMgMSBNIDEyIDIgTCAxMiA3IDcgNyA3IDEyIDIgMTIgMiA3IDcgNyA3IDIgMTIgMiBaJyxcclxuICAgICAgICB0ZXh0dXJlOidNIDEzIDQgTCAxMyAxIDEgMSAxIDQgNSA0IDUgMTMgOSAxMyA5IDQgMTMgNCBaJyxcclxuICAgICAgICBvYmplY3Q6J00gMTAgMSBMIDcgNCA0IDEgMSAxIDEgMTMgNCAxMyA0IDUgNyA4IDEwIDUgMTAgMTMgMTMgMTMgMTMgMSAxMCAxIFonLFxyXG4gICAgICAgIG5vbmU6J00gOSA1IEwgNSA1IDUgOSA5IDkgOSA1IFonLFxyXG4gICAgICAgIGN1cnNvcjonTSA0IDcgTCAxIDEwIDEgMTIgMiAxMyA0IDEzIDcgMTAgOSAxNCAxNCAwIDAgNSA0IDcgWicsXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBjdXN0b20gdGV4dFxyXG5cclxuICAgIHNldFRleHQgOiBmdW5jdGlvbiggc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdywgY29sb3JzLCBjc3MgKXtcclxuXHJcbiAgICAgICAgc2l6ZSA9IHNpemUgfHwgMTM7XHJcbiAgICAgICAgY29sb3IgPSBjb2xvciB8fCAnI0NDQyc7XHJcbiAgICAgICAgZm9udCA9IGZvbnQgfHwgJ0NvbnNvbGFzLG1vbmFjbyxtb25vc3BhY2U7JzsvLydNb25vc3BhY2UnOy8vJ1wiQ29uc29sYXNcIiwgXCJMdWNpZGEgQ29uc29sZVwiLCBNb25hY28sIG1vbm9zcGFjZSc7XHJcblxyXG4gICAgICAgIGNvbG9ycyA9IGNvbG9ycyB8fCBULmNvbG9ycztcclxuICAgICAgICBjc3MgPSBjc3MgfHwgVC5jc3M7XHJcblxyXG4gICAgICAgIGNvbG9ycy50ZXh0ID0gY29sb3I7XHJcbiAgICAgICAgY3NzLnR4dCA9IGNzcy5iYXNpYyArICdmb250LWZhbWlseTonK2ZvbnQrJzsgZm9udC1zaXplOicrc2l6ZSsncHg7IGNvbG9yOicrY29sb3IrJzsgcGFkZGluZzoycHggMTBweDsgbGVmdDowOyB0b3A6MnB4OyBoZWlnaHQ6MTZweDsgd2lkdGg6MTAwcHg7IG92ZXJmbG93OmhpZGRlbjsgd2hpdGUtc3BhY2U6IG5vd3JhcDsnO1xyXG4gICAgICAgIGlmKCBzaGFkb3cgKSBjc3MudHh0ICs9ICcgdGV4dC1zaGFkb3c6Jysgc2hhZG93ICsgJzsgJzsgLy9cIjFweCAxcHggMXB4ICNmZjAwMDBcIjtcclxuICAgICAgICBjc3MudHh0c2VsZWN0ID0gY3NzLnR4dCArICdkaXNwbGF5OmZsZXg7IGp1c3RpZnktY29udGVudDpsZWZ0OyBhbGlnbi1pdGVtczpjZW50ZXI7IHRleHQtYWxpZ246bGVmdDsnICsncGFkZGluZzoycHggNXB4OyBib3JkZXI6MXB4IGRhc2hlZCAnICsgY29sb3JzLmJvcmRlciArICc7IGJhY2tncm91bmQ6JysgY29sb3JzLnR4dHNlbGVjdGJnKyc7JztcclxuICAgICAgICBjc3MuaXRlbSA9IGNzcy50eHQgKyAncG9zaXRpb246cmVsYXRpdmU7IGJhY2tncm91bmQ6cmdiYSgwLDAsMCwwLjIpOyBtYXJnaW4tYm90dG9tOjFweDsnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmU6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIG8uY2xvbmVOb2RlKCB0cnVlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRTdmc6IGZ1bmN0aW9uKCBkb20sIHR5cGUsIHZhbHVlLCBpZCwgaWQyICl7XHJcblxyXG4gICAgICAgIGlmKCBpZCA9PT0gLTEgKSBkb20uc2V0QXR0cmlidXRlTlMoIG51bGwsIHR5cGUsIHZhbHVlICk7XHJcbiAgICAgICAgZWxzZSBpZiggaWQyICE9PSB1bmRlZmluZWQgKSBkb20uY2hpbGROb2Rlc1sgaWQgfHwgMCBdLmNoaWxkTm9kZXNbIGlkMiB8fCAwIF0uc2V0QXR0cmlidXRlTlMoIG51bGwsIHR5cGUsIHZhbHVlICk7XHJcbiAgICAgICAgZWxzZSBkb20uY2hpbGROb2Rlc1sgaWQgfHwgMCBdLnNldEF0dHJpYnV0ZU5TKCBudWxsLCB0eXBlLCB2YWx1ZSApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0Q3NzOiBmdW5jdGlvbiggZG9tLCBjc3MgKXtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgciBpbiBjc3MgKXtcclxuICAgICAgICAgICAgaWYoIFQuRE9NX1NJWkUuaW5kZXhPZihyKSAhPT0gLTEgKSBkb20uc3R5bGVbcl0gPSBjc3Nbcl0gKyAncHgnO1xyXG4gICAgICAgICAgICBlbHNlIGRvbS5zdHlsZVtyXSA9IGNzc1tyXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXQ6IGZ1bmN0aW9uKCBnLCBvICl7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGF0dCBpbiBvICl7XHJcbiAgICAgICAgICAgIGlmKCBhdHQgPT09ICd0eHQnICkgZy50ZXh0Q29udGVudCA9IG9bIGF0dCBdO1xyXG4gICAgICAgICAgICBpZiggYXR0ID09PSAnbGluaycgKSBnLnNldEF0dHJpYnV0ZU5TKCBULmxpbmtzLCAneGxpbms6aHJlZicsIG9bIGF0dCBdICk7XHJcbiAgICAgICAgICAgIGVsc2UgZy5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgYXR0LCBvWyBhdHQgXSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0OiBmdW5jdGlvbiggZG9tLCBpZCApe1xyXG5cclxuICAgICAgICBpZiggaWQgPT09IHVuZGVmaW5lZCApIHJldHVybiBkb207IC8vIHJvb3RcclxuICAgICAgICBlbHNlIGlmKCAhaXNOYU4oIGlkICkgKSByZXR1cm4gZG9tLmNoaWxkTm9kZXNbIGlkIF07IC8vIGZpcnN0IGNoaWxkXHJcbiAgICAgICAgZWxzZSBpZiggaWQgaW5zdGFuY2VvZiBBcnJheSApe1xyXG4gICAgICAgICAgICBpZihpZC5sZW5ndGggPT09IDIpIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWRbMF0gXS5jaGlsZE5vZGVzWyBpZFsxXSBdO1xyXG4gICAgICAgICAgICBpZihpZC5sZW5ndGggPT09IDMpIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWRbMF0gXS5jaGlsZE5vZGVzWyBpZFsxXSBdLmNoaWxkTm9kZXNbIGlkWzJdIF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZG9tIDogZnVuY3Rpb24gKCB0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCApIHtcclxuXHJcbiAgICAgICAgdHlwZSA9IHR5cGUgfHwgJ2Rpdic7XHJcblxyXG4gICAgICAgIGlmKCBULlNWR19UWVBFX0QuaW5kZXhPZih0eXBlKSAhPT0gLTEgfHwgVC5TVkdfVFlQRV9HLmluZGV4T2YodHlwZSkgIT09IC0xICl7IC8vIGlzIHN2ZyBlbGVtZW50XHJcblxyXG4gICAgICAgICAgICBpZiggdHlwZSA9PT0nc3ZnJyApe1xyXG5cclxuICAgICAgICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3N2ZycgKTtcclxuICAgICAgICAgICAgICAgIFQuc2V0KCBkb20sIG9iaiApO1xyXG5cclxuICAgICAgICAgIC8qICB9IGVsc2UgaWYgKCB0eXBlID09PSAndXNlJyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsICd1c2UnICk7XHJcbiAgICAgICAgICAgICAgICBULnNldCggZG9tLCBvYmogKTtcclxuKi9cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIGNyZWF0ZSBuZXcgc3ZnIGlmIG5vdCBkZWZcclxuICAgICAgICAgICAgICAgIGlmKCBkb20gPT09IHVuZGVmaW5lZCApIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3N2ZycgKTtcclxuICAgICAgICAgICAgICAgIFQuYWRkQXR0cmlidXRlcyggZG9tLCB0eXBlLCBvYmosIGlkICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7IC8vIGlzIGh0bWwgZWxlbWVudFxyXG5cclxuICAgICAgICAgICAgaWYoIGRvbSA9PT0gdW5kZWZpbmVkICkgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULmh0bWxzLCB0eXBlICk7XHJcbiAgICAgICAgICAgIGVsc2UgZG9tID0gZG9tLmFwcGVuZENoaWxkKCBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuaHRtbHMsIHR5cGUgKSApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBjc3MgKSBkb20uc3R5bGUuY3NzVGV4dCA9IGNzczsgXHJcblxyXG4gICAgICAgIGlmKCBpZCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGRvbTtcclxuICAgICAgICBlbHNlIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWQgfHwgMCBdO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkQXR0cmlidXRlcyA6IGZ1bmN0aW9uKCBkb20sIHR5cGUsIG8sIGlkICl7XHJcblxyXG4gICAgICAgIGxldCBnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCB0eXBlICk7XHJcbiAgICAgICAgVC5zZXQoIGcsIG8gKTtcclxuICAgICAgICBULmdldCggZG9tLCBpZCApLmFwcGVuZENoaWxkKCBnICk7XHJcbiAgICAgICAgaWYoIFQuU1ZHX1RZUEVfRy5pbmRleE9mKHR5cGUpICE9PSAtMSApIGcuc3R5bGUucG9pbnRlckV2ZW50cyA9ICdub25lJztcclxuICAgICAgICByZXR1cm4gZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFyIDogZnVuY3Rpb24oIGRvbSApe1xyXG5cclxuICAgICAgICBULnB1cmdlKCBkb20gKTtcclxuICAgICAgICB3aGlsZSAoZG9tLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgICAgICAgaWYgKCBkb20uZmlyc3RDaGlsZC5maXJzdENoaWxkICkgVC5jbGVhciggZG9tLmZpcnN0Q2hpbGQgKTtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUNoaWxkKCBkb20uZmlyc3RDaGlsZCApOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwdXJnZSA6IGZ1bmN0aW9uICggZG9tICkge1xyXG5cclxuICAgICAgICBsZXQgYSA9IGRvbS5hdHRyaWJ1dGVzLCBpLCBuO1xyXG4gICAgICAgIGlmIChhKSB7XHJcbiAgICAgICAgICAgIGkgPSBhLmxlbmd0aDtcclxuICAgICAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgICAgIG4gPSBhW2ldLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGRvbVtuXSA9PT0gJ2Z1bmN0aW9uJykgZG9tW25dID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBhID0gZG9tLmNoaWxkTm9kZXM7XHJcbiAgICAgICAgaWYgKGEpIHtcclxuICAgICAgICAgICAgaSA9IGEubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICAgICAgICAgIFQucHVyZ2UoIGRvbS5jaGlsZE5vZGVzW2ldICk7IFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDb2xvciBmdW5jdGlvblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIENvbG9yTHVtYSA6IGZ1bmN0aW9uICggaGV4LCBsICkge1xyXG5cclxuICAgICAgICBpZiggaGV4ID09PSAnbicgKSBoZXggPSAnIzAwMCc7XHJcblxyXG4gICAgICAgIC8vIHZhbGlkYXRlIGhleCBzdHJpbmdcclxuICAgICAgICBoZXggPSBTdHJpbmcoaGV4KS5yZXBsYWNlKC9bXjAtOWEtZl0vZ2ksICcnKTtcclxuICAgICAgICBpZiAoaGV4Lmxlbmd0aCA8IDYpIHtcclxuICAgICAgICAgICAgaGV4ID0gaGV4WzBdK2hleFswXStoZXhbMV0raGV4WzFdK2hleFsyXStoZXhbMl07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGwgPSBsIHx8IDA7XHJcblxyXG4gICAgICAgIC8vIGNvbnZlcnQgdG8gZGVjaW1hbCBhbmQgY2hhbmdlIGx1bWlub3NpdHlcclxuICAgICAgICBsZXQgcmdiID0gXCIjXCIsIGMsIGk7XHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDM7IGkrKykge1xyXG4gICAgICAgICAgICBjID0gcGFyc2VJbnQoaGV4LnN1YnN0cihpKjIsMiksIDE2KTtcclxuICAgICAgICAgICAgYyA9IE1hdGgucm91bmQoTWF0aC5taW4oTWF0aC5tYXgoMCwgYyArIChjICogbCkpLCAyNTUpKS50b1N0cmluZygxNik7XHJcbiAgICAgICAgICAgIHJnYiArPSAoXCIwMFwiK2MpLnN1YnN0cihjLmxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmdiO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZmluZERlZXBJbnZlcjogZnVuY3Rpb24gKCBjICkgeyBcclxuXHJcbiAgICAgICAgcmV0dXJuIChjWzBdICogMC4zICsgY1sxXSAqIC41OSArIGNbMl0gKiAuMTEpIDw9IDAuNjtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG5cclxuICAgIGhleFRvSHRtbDogZnVuY3Rpb24gKCB2ICkgeyBcclxuICAgICAgICB2ID0gdiA9PT0gdW5kZWZpbmVkID8gMHgwMDAwMDAgOiB2O1xyXG4gICAgICAgIHJldHVybiBcIiNcIiArIChcIjAwMDAwMFwiICsgdi50b1N0cmluZygxNikpLnN1YnN0cigtNik7XHJcbiAgICAgICAgXHJcbiAgICB9LFxyXG5cclxuICAgIGh0bWxUb0hleDogZnVuY3Rpb24gKCB2ICkgeyBcclxuXHJcbiAgICAgICAgcmV0dXJuIHYudG9VcHBlckNhc2UoKS5yZXBsYWNlKFwiI1wiLCBcIjB4XCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdTI1NTogZnVuY3Rpb24gKGMsIGkpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGMuc3Vic3RyaW5nKGksIGkgKyAyKSwgMTYpIC8gMjU1O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdTE2OiBmdW5jdGlvbiAoIGMsIGkgKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJzZUludChjLnN1YnN0cmluZyhpLCBpICsgMSksIDE2KSAvIDE1O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdW5wYWNrOiBmdW5jdGlvbiggYyApe1xyXG5cclxuICAgICAgICBpZiAoYy5sZW5ndGggPT0gNykgcmV0dXJuIFsgVC51MjU1KGMsIDEpLCBULnUyNTUoYywgMyksIFQudTI1NShjLCA1KSBdO1xyXG4gICAgICAgIGVsc2UgaWYgKGMubGVuZ3RoID09IDQpIHJldHVybiBbIFQudTE2KGMsMSksIFQudTE2KGMsMiksIFQudTE2KGMsMykgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGh0bWxSZ2I6IGZ1bmN0aW9uKCBjICl7XHJcblxyXG4gICAgICAgIHJldHVybiAncmdiKCcgKyBNYXRoLnJvdW5kKGNbMF0gKiAyNTUpICsgJywnKyBNYXRoLnJvdW5kKGNbMV0gKiAyNTUpICsgJywnKyBNYXRoLnJvdW5kKGNbMl0gKiAyNTUpICsgJyknO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcGFkOiBmdW5jdGlvbiggbiApe1xyXG4gICAgICAgIGlmKG4ubGVuZ3RoID09IDEpbiA9ICcwJyArIG47XHJcbiAgICAgICAgcmV0dXJuIG47XHJcbiAgICB9LFxyXG5cclxuICAgIHJnYlRvSGV4IDogZnVuY3Rpb24oIGMgKXtcclxuXHJcbiAgICAgICAgbGV0IHIgPSBNYXRoLnJvdW5kKGNbMF0gKiAyNTUpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICBsZXQgZyA9IE1hdGgucm91bmQoY1sxXSAqIDI1NSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgIGxldCBiID0gTWF0aC5yb3VuZChjWzJdICogMjU1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgcmV0dXJuICcjJyArIFQucGFkKHIpICsgVC5wYWQoZykgKyBULnBhZChiKTtcclxuXHJcbiAgICAgICAvLyByZXR1cm4gJyMnICsgKCAnMDAwMDAwJyArICggKCBjWzBdICogMjU1ICkgPDwgMTYgXiAoIGNbMV0gKiAyNTUgKSA8PCA4IF4gKCBjWzJdICogMjU1ICkgPDwgMCApLnRvU3RyaW5nKCAxNiApICkuc2xpY2UoIC0gNiApO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaHVlVG9SZ2I6IGZ1bmN0aW9uKCBwLCBxLCB0ICl7XHJcblxyXG4gICAgICAgIGlmICggdCA8IDAgKSB0ICs9IDE7XHJcbiAgICAgICAgaWYgKCB0ID4gMSApIHQgLT0gMTtcclxuICAgICAgICBpZiAoIHQgPCAxIC8gNiApIHJldHVybiBwICsgKCBxIC0gcCApICogNiAqIHQ7XHJcbiAgICAgICAgaWYgKCB0IDwgMSAvIDIgKSByZXR1cm4gcTtcclxuICAgICAgICBpZiAoIHQgPCAyIC8gMyApIHJldHVybiBwICsgKCBxIC0gcCApICogNiAqICggMiAvIDMgLSB0ICk7XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZ2JUb0hzbDogZnVuY3Rpb24gKCBjICkge1xyXG5cclxuICAgICAgICBsZXQgciA9IGNbMF0sIGcgPSBjWzFdLCBiID0gY1syXSwgbWluID0gTWF0aC5taW4ociwgZywgYiksIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLCBkZWx0YSA9IG1heCAtIG1pbiwgaCA9IDAsIHMgPSAwLCBsID0gKG1pbiArIG1heCkgLyAyO1xyXG4gICAgICAgIGlmIChsID4gMCAmJiBsIDwgMSkgcyA9IGRlbHRhIC8gKGwgPCAwLjUgPyAoMiAqIGwpIDogKDIgLSAyICogbCkpO1xyXG4gICAgICAgIGlmIChkZWx0YSA+IDApIHtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSByICYmIG1heCAhPSBnKSBoICs9IChnIC0gYikgLyBkZWx0YTtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSBnICYmIG1heCAhPSBiKSBoICs9ICgyICsgKGIgLSByKSAvIGRlbHRhKTtcclxuICAgICAgICAgICAgaWYgKG1heCA9PSBiICYmIG1heCAhPSByKSBoICs9ICg0ICsgKHIgLSBnKSAvIGRlbHRhKTtcclxuICAgICAgICAgICAgaCAvPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gWyBoLCBzLCBsIF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBoc2xUb1JnYjogZnVuY3Rpb24gKCBjICkge1xyXG5cclxuICAgICAgICBsZXQgcCwgcSwgaCA9IGNbMF0sIHMgPSBjWzFdLCBsID0gY1syXTtcclxuXHJcbiAgICAgICAgaWYgKCBzID09PSAwICkgcmV0dXJuIFsgbCwgbCwgbCBdO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBxID0gbCA8PSAwLjUgPyBsICogKHMgKyAxKSA6IGwgKyBzIC0gKCBsICogcyApO1xyXG4gICAgICAgICAgICBwID0gbCAqIDIgLSBxO1xyXG4gICAgICAgICAgICByZXR1cm4gWyBULmh1ZVRvUmdiKHAsIHEsIGggKyAwLjMzMzMzKSwgVC5odWVUb1JnYihwLCBxLCBoKSwgVC5odWVUb1JnYihwLCBxLCBoIC0gMC4zMzMzMykgXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFNWRyBNT0RFTFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1ha2VHcmFkaWFudDogZnVuY3Rpb24gKCB0eXBlLCBzZXR0aW5ncywgcGFyZW50LCBjb2xvcnMgKSB7XHJcblxyXG4gICAgICAgIFQuZG9tKCB0eXBlLCBudWxsLCBzZXR0aW5ncywgcGFyZW50LCAwICk7XHJcblxyXG4gICAgICAgIGxldCBuID0gcGFyZW50LmNoaWxkTm9kZXNbMF0uY2hpbGROb2Rlcy5sZW5ndGggLSAxLCBjO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgYyA9IGNvbG9yc1tpXTtcclxuICAgICAgICAgICAgLy9ULmRvbSggJ3N0b3AnLCBudWxsLCB7IG9mZnNldDpjWzBdKyclJywgc3R5bGU6J3N0b3AtY29sb3I6JytjWzFdKyc7IHN0b3Atb3BhY2l0eTonK2NbMl0rJzsnIH0sIHBhcmVudCwgWzAsbl0gKTtcclxuICAgICAgICAgICAgVC5kb20oICdzdG9wJywgbnVsbCwgeyBvZmZzZXQ6Y1swXSsnJScsICdzdG9wLWNvbG9yJzpjWzFdLCAgJ3N0b3Atb3BhY2l0eSc6Y1syXSB9LCBwYXJlbnQsIFswLG5dICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8qbWFrZUdyYXBoOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMTI4O1xyXG4gICAgICAgIGxldCByYWRpdXMgPSAzNDtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6VC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6NCwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIC8vVC5kb20oICdyZWN0JywgJycsIHsgeDoxMCwgeToxMCwgd2lkdGg6MTA4LCBoZWlnaHQ6MTA4LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjIgLCBmaWxsOidub25lJ30sIHN2ZyApOy8vMVxyXG4gICAgICAgIC8vVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOlQuY29sb3JzLmJ1dHRvbiwgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo4IH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8vVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzKzcsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6NyAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgLy9ULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6J3JnYmEoMjU1LDI1NSwyNTUsMC4zKScsICdzdHJva2Utd2lkdGgnOjIsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcsICdzdHJva2Utb3BhY2l0eSc6MC41IH0sIHN2ZyApOy8vM1xyXG4gICAgICAgIFQuZ3JhcGggPSBzdmc7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIG1ha2VLbm9iOiBmdW5jdGlvbiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICBsZXQgdyA9IDEyODtcclxuICAgICAgICBsZXQgcmFkaXVzID0gMzQ7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOlQuY29sb3JzLmJ1dHRvbiwgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo4IH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo0LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzoncm91bmQnIH0sIHN2ZyApOy8vMVxyXG4gICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cys3LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4xKScsICdzdHJva2Utd2lkdGgnOjcgLCBmaWxsOidub25lJ30sIHN2ZyApOy8vMlxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZToncmdiYSgyNTUsMjU1LDI1NSwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J3JvdW5kJywgJ3N0cm9rZS1vcGFjaXR5JzowLjUgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgVC5rbm9iID0gc3ZnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbWFrZUNpcmN1bGFyOiBmdW5jdGlvbiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICBsZXQgdyA9IDEyODtcclxuICAgICAgICBsZXQgcmFkaXVzID0gNDA7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4xKScsICdzdHJva2Utd2lkdGgnOjEwLCBmaWxsOidub25lJyB9LCBzdmcgKTsvLzBcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOicnLCBzdHJva2U6VC5jb2xvcnMudGV4dCwgJ3N0cm9rZS13aWR0aCc6NywgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J2J1dHQnIH0sIHN2ZyApOy8vMVxyXG4gICAgICAgIFQuY2lyY3VsYXIgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlSm95c3RpY2s6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIC8vKycgYmFja2dyb3VuZDojZjAwOydcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjgsIGNjYztcclxuICAgICAgICBsZXQgcmFkaXVzID0gTWF0aC5mbG9vcigody0zMCkqMC41KTtcclxuICAgICAgICBsZXQgaW5uZXJSYWRpdXMgPSBNYXRoLmZsb29yKHJhZGl1cyowLjYpO1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAnZGVmcycsIG51bGwsIHt9LCBzdmcgKTtcclxuICAgICAgICBULmRvbSggJ2cnLCBudWxsLCB7fSwgc3ZnICk7XHJcblxyXG4gICAgICAgIGlmKCBtb2RlbCA9PT0gMCApe1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYWRpYW4gYmFja2dyb3VuZFxyXG4gICAgICAgICAgICBjY2MgPSBbIFs0MCwgJ3JnYigwLDAsMCknLCAwLjNdLCBbODAsICdyZ2IoMCwwLDApJywgMF0sIFs5MCwgJ3JnYig1MCw1MCw1MCknLCAwLjRdLCBbMTAwLCAncmdiKDUwLDUwLDUwKScsIDBdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYWRpYW4gc2hhZG93XHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzYwLCAncmdiKDAsMCwwKScsIDAuNV0sIFsxMDAsICdyZ2IoMCwwLDApJywgMF0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRTJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYWRpYW4gc3RpY2tcclxuICAgICAgICAgICAgbGV0IGNjMCA9IFsncmdiKDQwLDQwLDQwKScsICdyZ2IoNDgsNDgsNDgpJywgJ3JnYigzMCwzMCwzMCknXTtcclxuICAgICAgICAgICAgbGV0IGNjMSA9IFsncmdiKDEsOTAsMTk3KScsICdyZ2IoMyw5NSwyMDcpJywgJ3JnYigwLDY1LDE2NyknXTtcclxuXHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzMwLCBjYzBbMF0sIDFdLCBbNjAsIGNjMFsxXSwgMV0sIFs4MCwgY2MwWzFdLCAxXSwgWzEwMCwgY2MwWzJdLCAxXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZEluJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzMwLCBjYzFbMF0sIDFdLCBbNjAsIGNjMVsxXSwgMV0sIFs4MCwgY2MxWzFdLCAxXSwgWzEwMCwgY2MxWzJdLCAxXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZEluMicsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAvLyBncmFwaFxyXG5cclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzLCBmaWxsOid1cmwoI2dyYWQpJyB9LCBzdmcgKTsvLzJcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCs1LCBjeTo2NCsxMCwgcjppbm5lclJhZGl1cysxMCwgZmlsbDondXJsKCNncmFkUyknIH0sIHN2ZyApOy8vM1xyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjppbm5lclJhZGl1cywgZmlsbDondXJsKCNncmFkSW4pJyB9LCBzdmcgKTsvLzRcclxuXHJcbiAgICAgICAgICAgIFQuam95c3RpY2tfMCA9IHN2ZztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgIC8vIGdyYWRpYW4gc2hhZG93XHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzY5LCAncmdiKDAsMCwwKScsIDBdLFs3MCwgJ3JnYigwLDAsMCknLCAwLjNdLCBbMTAwLCAncmdiKDAsMCwwKScsIDBdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkWCcsIGN4Oic1MCUnLCBjeTonNTAlJywgcjonNTAlJywgZng6JzUwJScsIGZ5Oic1MCUnIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6J25vbmUnLCBzdHJva2U6J3JnYmEoMTAwLDEwMCwxMDAsMC4yNSknLCAnc3Ryb2tlLXdpZHRoJzonNCcgfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOmlubmVyUmFkaXVzKzE0LCBmaWxsOid1cmwoI2dyYWRYKScgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOmlubmVyUmFkaXVzLCBmaWxsOidub25lJywgc3Ryb2tlOidyZ2IoMTAwLDEwMCwxMDApJywgJ3N0cm9rZS13aWR0aCc6JzQnIH0sIHN2ZyApOy8vNFxyXG5cclxuICAgICAgICAgICAgVC5qb3lzdGlja18xID0gc3ZnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlQ29sb3JSaW5nOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMjU2O1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAnZGVmcycsIG51bGwsIHt9LCBzdmcgKTtcclxuICAgICAgICBULmRvbSggJ2cnLCBudWxsLCB7fSwgc3ZnICk7XHJcblxyXG4gICAgICAgIGxldCBzID0gMzA7Ly9zdHJva2VcclxuICAgICAgICBsZXQgciA9KCB3LXMgKSowLjU7XHJcbiAgICAgICAgbGV0IG1pZCA9IHcqMC41O1xyXG4gICAgICAgIGxldCBuID0gMjQsIG51ZGdlID0gOCAvIHIgLyBuICogTWF0aC5QSSwgYTEgPSAwLCBkMTtcclxuICAgICAgICBsZXQgYW0sIHRhbiwgZDIsIGEyLCBhciwgaSwgaiwgcGF0aCwgY2NjO1xyXG4gICAgICAgIGxldCBjb2xvciA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAoIGkgPSAwOyBpIDw9IG47ICsraSkge1xyXG5cclxuICAgICAgICAgICAgZDIgPSBpIC8gbjtcclxuICAgICAgICAgICAgYTIgPSBkMiAqIFQuVHdvUEk7XHJcbiAgICAgICAgICAgIGFtID0gKGExICsgYTIpICogMC41O1xyXG4gICAgICAgICAgICB0YW4gPSAxIC8gTWF0aC5jb3MoKGEyIC0gYTEpICogMC41KTtcclxuXHJcbiAgICAgICAgICAgIGFyID0gW1xyXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oYTEpLCAtTWF0aC5jb3MoYTEpLCBcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGFtKSAqIHRhbiwgLU1hdGguY29zKGFtKSAqIHRhbiwgXHJcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihhMiksIC1NYXRoLmNvcyhhMilcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGNvbG9yWzFdID0gVC5yZ2JUb0hleCggVC5oc2xUb1JnYihbZDIsIDEsIDAuNV0pICk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBqID0gNjtcclxuICAgICAgICAgICAgICAgIHdoaWxlKGotLSl7XHJcbiAgICAgICAgICAgICAgICAgICBhcltqXSA9ICgoYXJbal0qcikrbWlkKS50b0ZpeGVkKDIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHBhdGggPSAnIE0nICsgYXJbMF0gKyAnICcgKyBhclsxXSArICcgUScgKyBhclsyXSArICcgJyArIGFyWzNdICsgJyAnICsgYXJbNF0gKyAnICcgKyBhcls1XTtcclxuXHJcbiAgICAgICAgICAgICAgICBjY2MgPSBbIFswLGNvbG9yWzBdLDFdLCBbMTAwLGNvbG9yWzFdLDFdIF07XHJcbiAgICAgICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ2xpbmVhckdyYWRpZW50JywgeyBpZDonRycraSwgeDE6YXJbMF0sIHkxOmFyWzFdLCB4Mjphcls0XSwgeTI6YXJbNV0sIGdyYWRpZW50VW5pdHM6XCJ1c2VyU3BhY2VPblVzZVwiIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgICAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDpwYXRoLCAnc3Ryb2tlLXdpZHRoJzpzLCBzdHJva2U6J3VybCgjRycraSsnKScsICdzdHJva2UtbGluZWNhcCc6XCJidXR0XCIgfSwgc3ZnLCAxICk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhMSA9IGEyIC0gbnVkZ2U7IFxyXG4gICAgICAgICAgICBjb2xvclswXSA9IGNvbG9yWzFdO1xyXG4gICAgICAgICAgICBkMSA9IGQyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGJyID0gKDEyOCAtIHMgKSArIDI7XHJcbiAgICAgICAgbGV0IGJ3ID0gNjA7XHJcblxyXG4gICAgICAgIGxldCB0dyA9IDg0LjkwO1xyXG5cclxuICAgICAgICAvLyBibGFjayAvIHdoaXRlXHJcbiAgICAgICAgY2NjID0gWyBbMCwgJyNGRkZGRkYnLCAxXSwgWzUwLCAnI0ZGRkZGRicsIDBdLCBbNTAsICcjMDAwMDAwJywgMF0sIFsxMDAsICcjMDAwMDAwJywgMV0gXTtcclxuICAgICAgICBULm1ha2VHcmFkaWFudCggJ2xpbmVhckdyYWRpZW50JywgeyBpZDonR0wwJywgeDE6MCwgeTE6bWlkLXR3LCB4MjowLCB5MjptaWQrdHcsIGdyYWRpZW50VW5pdHM6XCJ1c2VyU3BhY2VPblVzZVwiIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgIGNjYyA9IFsgWzAsICcjN2Y3ZjdmJywgMV0sIFs1MCwgJyM3ZjdmN2YnLCAwLjVdLCBbMTAwLCAnIzdmN2Y3ZicsIDBdIF07XHJcbiAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdsaW5lYXJHcmFkaWVudCcsIHsgaWQ6J0dMMScsIHgxOm1pZC00OS4wNSwgeTE6MCwgeDI6bWlkKzk4LCB5MjowLCBncmFkaWVudFVuaXRzOlwidXNlclNwYWNlT25Vc2VcIiB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICBULmRvbSggJ2cnLCBudWxsLCB7ICd0cmFuc2Zvcm0tb3JpZ2luJzogJzEyOHB4IDEyOHB4JywgJ3RyYW5zZm9ybSc6J3JvdGF0ZSgwKScgfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgVC5kb20oICdwb2x5Z29uJywgJycsIHsgcG9pbnRzOic3OC45NSA0My4xIDc4Ljk1IDIxMi44NSAyMjYgMTI4JywgIGZpbGw6J3JlZCcgIH0sIHN2ZywgMiApOy8vIDIsMFxyXG4gICAgICAgIFQuZG9tKCAncG9seWdvbicsICcnLCB7IHBvaW50czonNzguOTUgNDMuMSA3OC45NSAyMTIuODUgMjI2IDEyOCcsICBmaWxsOid1cmwoI0dMMSknLCdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTondXJsKCNHTDEpJyAgfSwgc3ZnLCAyICk7Ly8yLDFcclxuICAgICAgICBULmRvbSggJ3BvbHlnb24nLCAnJywgeyBwb2ludHM6Jzc4Ljk1IDQzLjEgNzguOTUgMjEyLjg1IDIyNiAxMjgnLCAgZmlsbDondXJsKCNHTDApJywnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6J3VybCgjR0wwKScgIH0sIHN2ZywgMiApOy8vMiwyXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonTSAyNTUuNzUgMTM2LjUgUSAyNTYgMTMyLjMgMjU2IDEyOCAyNTYgMTIzLjcgMjU1Ljc1IDExOS41IEwgMjQxIDEyOCAyNTUuNzUgMTM2LjUgWicsICBmaWxsOidub25lJywnc3Ryb2tlLXdpZHRoJzoyLCBzdHJva2U6JyMwMDAnICB9LCBzdmcsIDIgKTsvLzIsM1xyXG4gICAgICAgIC8vVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDoxMjgrMTEzLCBjeToxMjgsIHI6NiwgJ3N0cm9rZS13aWR0aCc6Mywgc3Ryb2tlOicjMDAwJywgZmlsbDonbm9uZScgfSwgc3ZnLCAyICk7Ly8yLjNcclxuXHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDoxMjgsIGN5OjEyOCwgcjo2LCAnc3Ryb2tlLXdpZHRoJzoyLCBzdHJva2U6JyMwMDAnLCBmaWxsOidub25lJyB9LCBzdmcgKTsvLzNcclxuXHJcbiAgICAgICAgVC5jb2xvclJpbmcgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBpY29uOiBmdW5jdGlvbiAoIHR5cGUsIGNvbG9yLCB3ICl7XHJcblxyXG4gICAgICAgIHcgPSB3IHx8IDQwO1xyXG4gICAgICAgIGNvbG9yID0gY29sb3IgfHwgJyNERURFREUnO1xyXG4gICAgICAgIGxldCB2aWV3Qm94ID0gJzAgMCAyNTYgMjU2JztcclxuICAgICAgICBsZXQgdCA9IFtcIjxzdmcgeG1sbnM9J1wiK1Quc3ZnbnMrXCInIHZlcnNpb249JzEuMScgeG1sbnM6eGxpbms9J1wiK1QuaHRtbHMrXCInIHN0eWxlPSdwb2ludGVyLWV2ZW50czpub25lOycgcHJlc2VydmVBc3BlY3RSYXRpbz0neE1pbllNYXggbWVldCcgeD0nMHB4JyB5PScwcHgnIHdpZHRoPSdcIit3K1wicHgnIGhlaWdodD0nXCIrdytcInB4JyB2aWV3Qm94PSdcIit2aWV3Qm94K1wiJz48Zz5cIl07XHJcbiAgICAgICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgICAgICBjYXNlICdsb2dvJzpcclxuICAgICAgICAgICAgLy90WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgc3Ryb2tlPSdcIitjb2xvcitcIicgc3Ryb2tlLXdpZHRoPScxNicgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J3NxdWFyZScgZmlsbD0nbm9uZScgZD0nTSAxOTIgNDQgTCAxOTIgMTQ4IFEgMTkyIDE3NC41IDE3My4zIDE5My4yNSAxNTQuNTUgMjEyIDEyOCAyMTIgMTAxLjUgMjEyIDgyLjc1IDE5My4yNSA2NCAxNzQuNSA2NCAxNDggTCA2NCA0NCBNIDE2MCA0NCBMIDE2MCAxNDggUSAxNjAgMTYxLjI1IDE1MC42NSAxNzAuNjUgMTQxLjI1IDE4MCAxMjggMTgwIDExNC43NSAxODAgMTA1LjM1IDE3MC42NSA5NiAxNjEuMjUgOTYgMTQ4IEwgOTYgNDQnLz5cIjtcclxuICAgICAgICAgICAgdFsxXT1cIjxwYXRoIGlkPSdsb2dvaW4nIGZpbGw9J1wiK2NvbG9yK1wiJyBzdHJva2U9J25vbmUnIGQ9J1wiK1QubG9nb0ZpbGxfZCtcIicvPlwiO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NhdmUnOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggc3Ryb2tlPSdcIitjb2xvcitcIicgc3Ryb2tlLXdpZHRoPSc0JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIGZpbGw9J25vbmUnIGQ9J00gMjYuMTI1IDE3IEwgMjAgMjIuOTUgMTQuMDUgMTcgTSAyMCA5Ljk1IEwgMjAgMjIuOTUnLz48cGF0aCBzdHJva2U9J1wiK2NvbG9yK1wiJyBzdHJva2Utd2lkdGg9JzIuNScgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBmaWxsPSdub25lJyBkPSdNIDMyLjYgMjMgTCAzMi42IDI1LjUgUSAzMi42IDI4LjUgMjkuNiAyOC41IEwgMTAuNiAyOC41IFEgNy42IDI4LjUgNy42IDI1LjUgTCA3LjYgMjMnLz5cIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRbMl0gPSBcIjwvZz48L3N2Zz5cIjtcclxuICAgICAgICByZXR1cm4gdC5qb2luKFwiXFxuXCIpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgbG9nb0ZpbGxfZDogW1xyXG4gICAgXCJNIDE3MSAxNTAuNzUgTCAxNzEgMzMuMjUgMTU1LjUgMzMuMjUgMTU1LjUgMTUwLjc1IFEgMTU1LjUgMTYyLjIgMTQ3LjQ1IDE3MC4yIDEzOS40NSAxNzguMjUgMTI4IDE3OC4yNSAxMTYuNiAxNzguMjUgMTA4LjU1IDE3MC4yIDEwMC41IDE2Mi4yIDEwMC41IDE1MC43NSBcIixcclxuICAgIFwiTCAxMDAuNSAzMy4yNSA4NSAzMy4yNSA4NSAxNTAuNzUgUSA4NSAxNjguNjUgOTcuNTUgMTgxLjE1IDExMC4xNSAxOTMuNzUgMTI4IDE5My43NSAxNDUuOSAxOTMuNzUgMTU4LjQgMTgxLjE1IDE3MSAxNjguNjUgMTcxIDE1MC43NSBcIixcclxuICAgIFwiTSAyMDAgMzMuMjUgTCAxODQgMzMuMjUgMTg0IDE1MC44IFEgMTg0IDE3NC4xIDE2Ny42IDE5MC40IDE1MS4zIDIwNi44IDEyOCAyMDYuOCAxMDQuNzUgMjA2LjggODguMyAxOTAuNCA3MiAxNzQuMSA3MiAxNTAuOCBMIDcyIDMzLjI1IDU2IDMzLjI1IDU2IDE1MC43NSBcIixcclxuICAgIFwiUSA1NiAxODAuNTUgNzcuMDUgMjAxLjYgOTguMiAyMjIuNzUgMTI4IDIyMi43NSAxNTcuOCAyMjIuNzUgMTc4LjkgMjAxLjYgMjAwIDE4MC41NSAyMDAgMTUwLjc1IEwgMjAwIDMzLjI1IFpcIixcclxuICAgIF0uam9pbignXFxuJyksXHJcblxyXG59XHJcblxyXG5ULnNldFRleHQoKTtcclxuXHJcbmV4cG9ydCBjb25zdCBUb29scyA9IFQ7IiwiXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbi8vIElOVEVOQUwgRlVOQ1RJT05cclxuXHJcbmNvbnN0IFIgPSB7XHJcblxyXG5cdHVpOiBbXSxcclxuXHJcblx0SUQ6IG51bGwsXHJcbiAgICBsb2NrOmZhbHNlLFxyXG4gICAgd2xvY2s6ZmFsc2UsXHJcbiAgICBjdXJyZW50Oi0xLFxyXG5cclxuXHRuZWVkUmVab25lOiB0cnVlLFxyXG5cdGlzRXZlbnRzSW5pdDogZmFsc2UsXHJcblxyXG4gICAgcHJldkRlZmF1bHQ6IFsnY29udGV4dG1lbnUnLCAnbW91c2Vkb3duJywgJ21vdXNlbW92ZScsICdtb3VzZXVwJ10sXHJcblxyXG5cdHhtbHNlcmlhbGl6ZXI6IG5ldyBYTUxTZXJpYWxpemVyKCksXHJcblx0dG1wVGltZTogbnVsbCxcclxuICAgIHRtcEltYWdlOiBudWxsLFxyXG5cclxuICAgIG9sZEN1cnNvcjonYXV0bycsXHJcblxyXG4gICAgaW5wdXQ6IG51bGwsXHJcbiAgICBwYXJlbnQ6IG51bGwsXHJcbiAgICBmaXJzdEltcHV0OiB0cnVlLFxyXG4gICAgLy9jYWxsYmFja0ltcHV0OiBudWxsLFxyXG4gICAgaGlkZGVuSW1wdXQ6bnVsbCxcclxuICAgIGhpZGRlblNpemVyOm51bGwsXHJcbiAgICBoYXNGb2N1czpmYWxzZSxcclxuICAgIHN0YXJ0SW5wdXQ6ZmFsc2UsXHJcbiAgICBpbnB1dFJhbmdlIDogWzAsMF0sXHJcbiAgICBjdXJzb3JJZCA6IDAsXHJcbiAgICBzdHI6JycsXHJcbiAgICBwb3M6MCxcclxuICAgIHN0YXJ0WDotMSxcclxuICAgIG1vdmVYOi0xLFxyXG5cclxuICAgIGRlYnVnSW5wdXQ6ZmFsc2UsXHJcblxyXG4gICAgaXNMb29wOiBmYWxzZSxcclxuICAgIGxpc3RlbnM6IFtdLFxyXG5cclxuICAgIGU6e1xyXG4gICAgICAgIHR5cGU6bnVsbCxcclxuICAgICAgICBjbGllbnRYOjAsXHJcbiAgICAgICAgY2xpZW50WTowLFxyXG4gICAgICAgIGtleUNvZGU6TmFOLFxyXG4gICAgICAgIGtleTpudWxsLFxyXG4gICAgICAgIGRlbHRhOjAsXHJcbiAgICB9LFxyXG5cclxuICAgIGlzTW9iaWxlOiBmYWxzZSxcclxuXHJcbiAgICBcclxuXHJcblx0YWRkOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIFIudWkucHVzaCggbyApO1xyXG4gICAgICAgIFIuZ2V0Wm9uZSggbyApO1xyXG5cclxuICAgICAgICBpZiggIVIuaXNFdmVudHNJbml0ICkgUi5pbml0RXZlbnRzKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXN0TW9iaWxlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCBuID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcclxuICAgICAgICBpZiAobi5tYXRjaCgvQW5kcm9pZC9pKSB8fCBuLm1hdGNoKC93ZWJPUy9pKSB8fCBuLm1hdGNoKC9pUGhvbmUvaSkgfHwgbi5tYXRjaCgvaVBhZC9pKSB8fCBuLm1hdGNoKC9pUG9kL2kpIHx8IG4ubWF0Y2goL0JsYWNrQmVycnkvaSkgfHwgbi5tYXRjaCgvV2luZG93cyBQaG9uZS9pKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gZmFsc2U7ICBcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZTogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IFIudWkuaW5kZXhPZiggbyApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICggaSAhPT0gLTEgKSB7XHJcbiAgICAgICAgICAgIFIucmVtb3ZlTGlzdGVuKCBvICk7XHJcbiAgICAgICAgICAgIFIudWkuc3BsaWNlKCBpLCAxICk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIFIudWkubGVuZ3RoID09PSAwICl7XHJcbiAgICAgICAgICAgIFIucmVtb3ZlRXZlbnRzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBpbml0RXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzRXZlbnRzSW5pdCApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGRvbSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gICAgICAgIFIuaXNNb2JpbGUgPSBSLnRlc3RNb2JpbGUoKTtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNNb2JpbGUgKXtcclxuICAgICAgICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgUiwgZmFsc2UgKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ2NvbnRleHRtZW51JywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgUi5yZXNpemUgLCBmYWxzZSApO1xyXG4gICAgICAgIC8vd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBSLCBmYWxzZSApO1xyXG5cclxuICAgICAgICBSLmlzRXZlbnRzSW5pdCA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICByZW1vdmVFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoICFSLmlzRXZlbnRzSW5pdCApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGRvbSA9IGRvY3VtZW50LmJvZHk7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICl7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAnd2hlZWwnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgUiApO1xyXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5dXAnLCBSICk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCBSLnJlc2l6ZSAgKTtcclxuXHJcbiAgICAgICAgUi5pc0V2ZW50c0luaXQgPSBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlc2l6ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBSLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgaSA9IFIudWkubGVuZ3RoLCB1O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuXHJcbiAgICAgICAgICAgIHUgPSBSLnVpW2ldO1xyXG4gICAgICAgICAgICBpZiggdS5pc0d1aSAmJiAhdS5pc0NhbnZhc09ubHkgJiYgdS5hdXRvUmVzaXplICkgdS5zZXRIZWlnaHQoKTtcclxuICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEhBTkRMRSBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIFxyXG5cclxuICAgIGhhbmRsZUV2ZW50OiBmdW5jdGlvbiAoIGV2ZW50ICkge1xyXG5cclxuICAgICAgICAvL2lmKCFldmVudC50eXBlKSByZXR1cm47XHJcblxyXG4gICAgICAvLyAgY29uc29sZS5sb2coIGV2ZW50LnR5cGUgKVxyXG5cclxuICAgICAgICBpZiggZXZlbnQudHlwZS5pbmRleE9mKCBSLnByZXZEZWZhdWx0ICkgIT09IC0xICkgZXZlbnQucHJldmVudERlZmF1bHQoKTsgXHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAnY29udGV4dG1lbnUnICkgcmV0dXJuOyBcclxuXHJcbiAgICAgICAgLy9pZiggZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nKXsgUi5lZGl0VGV4dCggZXZlbnQgKTsgcmV0dXJuO31cclxuXHJcbiAgICAgICAgLy9pZiggZXZlbnQudHlwZSAhPT0gJ2tleWRvd24nICYmIGV2ZW50LnR5cGUgIT09ICd3aGVlbCcgKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIC8vZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIFIuZmluZFpvbmUoKTtcclxuICAgICAgIFxyXG4gICAgICAgIGxldCBlID0gUi5lO1xyXG5cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nKSBSLmtleWRvd24oIGV2ZW50ICk7XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdrZXl1cCcpIFIua2V5dXAoIGV2ZW50ICk7XHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAnd2hlZWwnICkgZS5kZWx0YSA9IGV2ZW50LmRlbHRhWSA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgZWxzZSBlLmRlbHRhID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBlLmNsaWVudFggPSBldmVudC5jbGllbnRYIHx8IDA7XHJcbiAgICAgICAgZS5jbGllbnRZID0gZXZlbnQuY2xpZW50WSB8fCAwO1xyXG4gICAgICAgIGUudHlwZSA9IGV2ZW50LnR5cGU7XHJcblxyXG4gICAgICAgIC8vIG1vYmlsZVxyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPiAwICl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFggPSBldmVudC50b3VjaGVzWyAwIF0uY2xpZW50WCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRZID0gZXZlbnQudG91Y2hlc1sgMCBdLmNsaWVudFkgfHwgMDtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIGUudHlwZSA9ICdtb3VzZWRvd24nO1xyXG4gICAgICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNoZW5kJykgZS50eXBlID0gJ21vdXNldXAnXHJcbiAgICAgICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2htb3ZlJykgZS50eXBlID0gJ21vdXNlbW92ZSc7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICAvKlxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpeyBlLnR5cGUgPSAnbW91c2Vkb3duJzsgUi5maW5kSUQoIGUgKTsgfVxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hlbmQnKXsgZS50eXBlID0gJ21vdXNldXAnOyAgaWYoIFIuSUQgIT09IG51bGwgKSBSLklELmhhbmRsZUV2ZW50KCBlICk7IFIuY2xlYXJPbGRJRCgpOyB9XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaG1vdmUnKXsgZS50eXBlID0gJ21vdXNlbW92ZSc7ICB9XHJcbiAgICAgICAgKi9cclxuXHJcblxyXG4gICAgICAgIGlmKCBlLnR5cGUgPT09ICdtb3VzZWRvd24nICkgUi5sb2NrID0gdHJ1ZTtcclxuICAgICAgICBpZiggZS50eXBlID09PSAnbW91c2V1cCcgKSBSLmxvY2sgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNNb2JpbGUgJiYgZS50eXBlID09PSAnbW91c2Vkb3duJyApIFIuZmluZElEKCBlICk7XHJcbiAgICAgICAgaWYoIGUudHlwZSA9PT0gJ21vdXNlbW92ZScgJiYgIVIubG9jayApIFIuZmluZElEKCBlICk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCBSLklEICE9PSBudWxsICl7XHJcblxyXG4gICAgICAgICAgICBpZiggUi5JRC5pc0NhbnZhc09ubHkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRYID0gUi5JRC5tb3VzZS54O1xyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRZID0gUi5JRC5tb3VzZS55O1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgUi5JRC5oYW5kbGVFdmVudCggZSApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTW9iaWxlICYmIGUudHlwZSA9PT0gJ21vdXNldXAnICkgUi5jbGVhck9sZElEKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElEXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZmluZElEOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gUi51aS5sZW5ndGgsIG5leHQgPSAtMSwgdSwgeCwgeTtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cclxuICAgICAgICAgICAgdSA9IFIudWlbaV07XHJcblxyXG4gICAgICAgICAgICBpZiggdS5pc0NhbnZhc09ubHkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgeCA9IHUubW91c2UueDtcclxuICAgICAgICAgICAgICAgIHkgPSB1Lm1vdXNlLnk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHggPSBlLmNsaWVudFg7XHJcbiAgICAgICAgICAgICAgICB5ID0gZS5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYoIFIub25ab25lKCB1LCB4LCB5ICkgKXsgXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIG5leHQgPSBpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiggbmV4dCAhPT0gUi5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5jbGVhck9sZElEKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5jdXJyZW50ID0gbmV4dDtcclxuICAgICAgICAgICAgICAgICAgICBSLklEID0gdTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ID09PSAtMSApIFIuY2xlYXJPbGRJRCgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXJPbGRJRDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBpZiggIVIuSUQgKSByZXR1cm47XHJcbiAgICAgICAgUi5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgUi5JRC5yZXNldCgpO1xyXG4gICAgICAgIFIuSUQgPSBudWxsO1xyXG4gICAgICAgIFIuY3Vyc29yKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEdVSSAvIEdST1VQIEZVTkNUSU9OXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2FsY1VpczogZnVuY3Rpb24gKCB1aXMsIHpvbmUsIHB5ICkge1xyXG5cclxuICAgICAgICBsZXQgbG5nID0gdWlzLmxlbmd0aCwgdSwgaSwgcHggPSAwLCBteSA9IDA7XHJcblxyXG4gICAgICAgIGZvciggaSA9IDA7IGkgPCBsbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdSA9IHVpc1tpXTtcclxuXHJcbiAgICAgICAgICAgIHUuem9uZS53ID0gdS53O1xyXG4gICAgICAgICAgICB1LnpvbmUuaCA9IHUuaDtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhdS5hdXRvV2lkdGggKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggcHggPT09IDAgKSBweSArPSB1LmggKyAxO1xyXG5cclxuICAgICAgICAgICAgICAgIHUuem9uZS54ID0gem9uZS54ICsgcHg7XHJcbiAgICAgICAgICAgICAgICB1LnpvbmUueSA9IHB4ID09PSAwID8gcHkgLSB1LmggOiBteTtcclxuXHJcbiAgICAgICAgICAgICAgICBteSA9IHUuem9uZS55O1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBweCArPSB1Lnc7XHJcbiAgICAgICAgICAgICAgICBpZiggcHggKyB1LncgPiB6b25lLncgKSBweCA9IDA7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHUuem9uZS54ID0gem9uZS54O1xyXG4gICAgICAgICAgICAgICAgdS56b25lLnkgPSBweTtcclxuICAgICAgICAgICAgICAgIHB5ICs9IHUuaCArIDE7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggdS5pc0dyb3VwICkgdS5jYWxjVWlzKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuXHJcblx0ZmluZFRhcmdldDogZnVuY3Rpb24gKCB1aXMsIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdWlzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggUi5vblpvbmUoIHVpc1tpXSwgZS5jbGllbnRYLCBlLmNsaWVudFkgKSApIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBaT05FXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZmluZFpvbmU6IGZ1bmN0aW9uICggZm9yY2UgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhUi5uZWVkUmVab25lICYmICFmb3JjZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyIGkgPSBSLnVpLmxlbmd0aCwgdTtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApeyBcclxuXHJcbiAgICAgICAgICAgIHUgPSBSLnVpW2ldO1xyXG4gICAgICAgICAgICBSLmdldFpvbmUoIHUgKTtcclxuICAgICAgICAgICAgaWYoIHUuaXNHdWkgKSB1LmNhbGNVaXMoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBSLm5lZWRSZVpvbmUgPSBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG9uWm9uZTogZnVuY3Rpb24gKCBvLCB4LCB5ICkge1xyXG5cclxuICAgICAgICBpZiggeCA9PT0gdW5kZWZpbmVkIHx8IHkgPT09IHVuZGVmaW5lZCApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHogPSBvLnpvbmU7XHJcbiAgICAgICAgbGV0IG14ID0geCAtIHoueDtcclxuICAgICAgICBsZXQgbXkgPSB5IC0gei55O1xyXG5cclxuICAgICAgICBsZXQgb3ZlciA9ICggbXggPj0gMCApICYmICggbXkgPj0gMCApICYmICggbXggPD0gei53ICkgJiYgKCBteSA8PSB6LmggKTtcclxuXHJcbiAgICAgICAgaWYoIG92ZXIgKSBvLmxvY2FsLnNldCggbXgsIG15ICk7XHJcbiAgICAgICAgZWxzZSBvLmxvY2FsLm5lZygpO1xyXG5cclxuICAgICAgICByZXR1cm4gb3ZlcjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGdldFpvbmU6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgaWYoIG8uaXNDYW52YXNPbmx5ICkgcmV0dXJuO1xyXG4gICAgICAgIGxldCByID0gby5nZXREb20oKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBvLnpvbmUgPSB7IHg6ci5sZWZ0LCB5OnIudG9wLCB3OnIud2lkdGgsIGg6ci5oZWlnaHQgfTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ1VSU09SXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY3Vyc29yOiBmdW5jdGlvbiAoIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIG5hbWUgPSBuYW1lID8gbmFtZSA6ICdhdXRvJztcclxuICAgICAgICBpZiggbmFtZSAhPT0gUi5vbGRDdXJzb3IgKXtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSBuYW1lO1xyXG4gICAgICAgICAgICBSLm9sZEN1cnNvciA9IG5hbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDQU5WQVNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB0b0NhbnZhczogZnVuY3Rpb24gKCBvLCB3LCBoLCBmb3JjZSApIHtcclxuXHJcbiAgICAgICAgLy8gcHJldmVudCBleGVzaXZlIHJlZHJhd1xyXG5cclxuICAgICAgICBpZiggZm9yY2UgJiYgUi50bXBUaW1lICE9PSBudWxsICkgeyBjbGVhclRpbWVvdXQoUi50bXBUaW1lKTsgUi50bXBUaW1lID0gbnVsbDsgIH1cclxuXHJcbiAgICAgICAgaWYoIFIudG1wVGltZSAhPT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIFIubG9jayApIFIudG1wVGltZSA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7IFIudG1wVGltZSA9IG51bGw7IH0sIDEwICk7XHJcblxyXG4gICAgICAgIC8vL1xyXG5cclxuICAgICAgICBsZXQgaXNOZXdTaXplID0gZmFsc2U7XHJcbiAgICAgICAgaWYoIHcgIT09IG8uY2FudmFzLndpZHRoIHx8IGggIT09IG8uY2FudmFzLmhlaWdodCApIGlzTmV3U2l6ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCBSLnRtcEltYWdlID09PSBudWxsICkgUi50bXBJbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICBsZXQgaW1nID0gUi50bXBJbWFnZTsgLy9uZXcgSW1hZ2UoKTtcclxuXHJcbiAgICAgICAgbGV0IGh0bWxTdHJpbmcgPSBSLnhtbHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoIG8uY29udGVudCApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBzdmcgPSAnPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCInK3crJ1wiIGhlaWdodD1cIicraCsnXCI+PGZvcmVpZ25PYmplY3Qgc3R5bGU9XCJwb2ludGVyLWV2ZW50czogbm9uZTsgbGVmdDowO1wiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj4nKyBodG1sU3RyaW5nICsnPC9mb3JlaWduT2JqZWN0Pjwvc3ZnPic7XHJcblxyXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBjdHggPSBvLmNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XHJcblxyXG4gICAgICAgICAgICBpZiggaXNOZXdTaXplICl7IFxyXG4gICAgICAgICAgICAgICAgby5jYW52YXMud2lkdGggPSB3O1xyXG4gICAgICAgICAgICAgICAgby5jYW52YXMuaGVpZ2h0ID0gaFxyXG4gICAgICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgICAgIGN0eC5jbGVhclJlY3QoIDAsIDAsIHcsIGggKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKCB0aGlzLCAwLCAwICk7XHJcblxyXG4gICAgICAgICAgICBvLm9uRHJhdygpO1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3N2Zyt4bWw7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudChzdmcpO1xyXG4gICAgICAgIC8vaW1nLnNyYyA9ICdkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LCcrIHdpbmRvdy5idG9hKCBzdmcgKTtcclxuICAgICAgICBpbWcuY3Jvc3NPcmlnaW4gPSAnJztcclxuXHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElOUFVUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0SGlkZGVuOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLmhpZGRlbkltcHV0ID09PSBudWxsICl7XHJcblxyXG4gICAgICAgICAgICBsZXQgaGlkZSA9IFIuZGVidWdJbnB1dCA/ICcnIDogJ29wYWNpdHk6MDsgekluZGV4OjA7JztcclxuXHJcbiAgICAgICAgICAgIGxldCBjc3MgPSBSLnBhcmVudC5jc3MudHh0ICsgJ3BhZGRpbmc6MDsgd2lkdGg6YXV0bzsgaGVpZ2h0OmF1dG87IHRleHQtc2hhZG93Om5vbmU7J1xyXG4gICAgICAgICAgICBjc3MgKz0gJ2xlZnQ6MTBweDsgdG9wOmF1dG87IGJvcmRlcjpub25lOyBjb2xvcjojRkZGOyBiYWNrZ3JvdW5kOiMwMDA7JyArIGhpZGU7XHJcblxyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC50eXBlID0gJ3RleHQnO1xyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0LnN0eWxlLmNzc1RleHQgPSBjc3MgKyAnYm90dG9tOjMwcHg7JyArIChSLmRlYnVnSW5wdXQgPyAnJyA6ICd0cmFuc2Zvcm06c2NhbGUoMCk7Jyk7O1xyXG5cclxuICAgICAgICAgICAgUi5oaWRkZW5TaXplciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgICAgICBSLmhpZGRlblNpemVyLnN0eWxlLmNzc1RleHQgPSBjc3MgKyAnYm90dG9tOjYwcHg7JztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIFIuaGlkZGVuSW1wdXQgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggUi5oaWRkZW5TaXplciApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFIuaGlkZGVuSW1wdXQuc3R5bGUud2lkdGggPSBSLmlucHV0LmNsaWVudFdpZHRoICsgJ3B4JztcclxuICAgICAgICBSLmhpZGRlbkltcHV0LnZhbHVlID0gUi5zdHI7XHJcbiAgICAgICAgUi5oaWRkZW5TaXplci5pbm5lckhUTUwgPSBSLnN0cjtcclxuXHJcbiAgICAgICAgUi5oYXNGb2N1cyA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhckhpZGRlbjogZnVuY3Rpb24gKCBwICkge1xyXG5cclxuICAgICAgICBpZiggUi5oaWRkZW5JbXB1dCA9PT0gbnVsbCApIHJldHVybjtcclxuICAgICAgICBSLmhhc0ZvY3VzID0gZmFsc2U7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGlja1BvczogZnVuY3Rpb24oIHggKXtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBSLnN0ci5sZW5ndGgsIGwgPSAwLCBuID0gMDtcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGwgKz0gUi50ZXh0V2lkdGgoIFIuc3RyW25dICk7XHJcbiAgICAgICAgICAgIGlmKCBsID49IHggKSBicmVhaztcclxuICAgICAgICAgICAgbisrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbjtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwSW5wdXQ6IGZ1bmN0aW9uICggeCwgZG93biApIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBmYWxzZTtcclxuICAgICBcclxuICAgICAgICBpZiggZG93biApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGlkID0gUi5jbGlja1BvcyggeCApO1xyXG5cclxuICAgICAgICAgICAgUi5tb3ZlWCA9IGlkO1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuc3RhcnRYID09PSAtMSApeyBcclxuXHJcbiAgICAgICAgICAgICAgICBSLnN0YXJ0WCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgUi5jdXJzb3JJZCA9IGlkO1xyXG4gICAgICAgICAgICAgICAgUi5pbnB1dFJhbmdlID0gWyBSLnN0YXJ0WCwgUi5zdGFydFggXTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbGV0IGlzU2VsZWN0aW9uID0gUi5tb3ZlWCAhPT0gUi5zdGFydFg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIGlzU2VsZWN0aW9uICl7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIFIuc3RhcnRYID4gUi5tb3ZlWCApIFIuaW5wdXRSYW5nZSA9IFsgUi5tb3ZlWCwgUi5zdGFydFggXTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIFIuaW5wdXRSYW5nZSA9IFsgUi5zdGFydFgsIFIubW92ZVggXTsgICAgXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGlmKCBSLnN0YXJ0WCAhPT0gLTEgKXtcclxuXHJcbiAgICAgICAgICAgICAgICBSLmhhc0ZvY3VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQgPSBSLmlucHV0UmFuZ2VbMF07XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnNlbGVjdGlvbkVuZCA9IFIuaW5wdXRSYW5nZVsxXTtcclxuICAgICAgICAgICAgICAgIFIuc3RhcnRYID0gLTE7XHJcblxyXG4gICAgICAgICAgICAgICAgdXAgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB1cCApIFIuc2VsZWN0UGFyZW50KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNlbGVjdFBhcmVudDogZnVuY3Rpb24gKCl7XHJcblxyXG4gICAgICAgIHZhciBjID0gUi50ZXh0V2lkdGgoIFIuc3RyLnN1YnN0cmluZyggMCwgUi5jdXJzb3JJZCApKTtcclxuICAgICAgICB2YXIgZSA9IFIudGV4dFdpZHRoKCBSLnN0ci5zdWJzdHJpbmcoIDAsIFIuaW5wdXRSYW5nZVswXSApKTtcclxuICAgICAgICB2YXIgcyA9IFIudGV4dFdpZHRoKCBSLnN0ci5zdWJzdHJpbmcoIFIuaW5wdXRSYW5nZVswXSwgIFIuaW5wdXRSYW5nZVsxXSApKTtcclxuXHJcbiAgICAgICAgUi5wYXJlbnQuc2VsZWN0KCBjLCBlLCBzICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB0ZXh0V2lkdGg6IGZ1bmN0aW9uICggdGV4dCApe1xyXG5cclxuICAgICAgICBpZiggUi5oaWRkZW5TaXplciA9PT0gbnVsbCApIHJldHVybiAwO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyAvZywgJyZuYnNwOycpO1xyXG4gICAgICAgIFIuaGlkZGVuU2l6ZXIuaW5uZXJIVE1MID0gdGV4dDtcclxuICAgICAgICByZXR1cm4gUi5oaWRkZW5TaXplci5jbGllbnRXaWR0aDtcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICBjbGVhcklucHV0OiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudCA9PT0gbnVsbCApIHJldHVybjtcclxuICAgICAgICBpZiggIVIuZmlyc3RJbXB1dCApIFIucGFyZW50LnZhbGlkYXRlKCB0cnVlICk7XHJcblxyXG4gICAgICAgIFIuY2xlYXJIaWRkZW4oKTtcclxuICAgICAgICBSLnBhcmVudC51bnNlbGVjdCgpO1xyXG5cclxuICAgICAgICAvL1IuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgICAgICBSLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSBSLnBhcmVudC5jb2xvcnMuaW5wdXRCZztcclxuICAgICAgICBSLmlucHV0LnN0eWxlLmJvcmRlckNvbG9yID0gUi5wYXJlbnQuY29sb3JzLmlucHV0Qm9yZGVyO1xyXG4gICAgICAgIFIucGFyZW50LmlzRWRpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBSLmlucHV0ID0gbnVsbDtcclxuICAgICAgICBSLnBhcmVudCA9IG51bGw7XHJcbiAgICAgICAgUi5zdHIgPSAnJyxcclxuICAgICAgICBSLmZpcnN0SW1wdXQgPSB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2V0SW5wdXQ6IGZ1bmN0aW9uICggSW5wdXQsIHBhcmVudCApIHtcclxuXHJcbiAgICAgICAgUi5jbGVhcklucHV0KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgUi5pbnB1dCA9IElucHV0O1xyXG4gICAgICAgIFIucGFyZW50ID0gcGFyZW50O1xyXG5cclxuICAgICAgICBSLmlucHV0LnN0eWxlLmJhY2tncm91bmQgPSBSLnBhcmVudC5jb2xvcnMuaW5wdXRPdmVyO1xyXG4gICAgICAgIFIuaW5wdXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBSLnBhcmVudC5jb2xvcnMuaW5wdXRCb3JkZXJTZWxlY3Q7XHJcbiAgICAgICAgUi5zdHIgPSBSLmlucHV0LnRleHRDb250ZW50O1xyXG5cclxuICAgICAgICBSLnNldEhpZGRlbigpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLypzZWxlY3Q6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuZXhlY0NvbW1hbmQoIFwic2VsZWN0YWxsXCIsIG51bGwsIGZhbHNlICk7XHJcblxyXG4gICAgfSwqL1xyXG5cclxuICAgIGtleWRvd246IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQga2V5Q29kZSA9IGUud2hpY2gsIGlzU2hpZnQgPSBlLnNoaWZ0S2V5O1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCBrZXlDb2RlIClcclxuXHJcbiAgICAgICAgUi5maXJzdEltcHV0ID0gZmFsc2U7XHJcblxyXG5cclxuICAgICAgICBpZiAoUi5oYXNGb2N1cykge1xyXG4gICAgICAgICAgICAvLyBoYWNrIHRvIGZpeCB0b3VjaCBldmVudCBidWcgaW4gaU9TIFNhZmFyaVxyXG4gICAgICAgICAgICB3aW5kb3cuZm9jdXMoKTtcclxuICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5mb2N1cygpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBSLnBhcmVudC5pc0VkaXQgPSB0cnVlO1xyXG5cclxuICAgICAgIC8vIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgLy8gYWRkIHN1cHBvcnQgZm9yIEN0cmwvQ21kK0Egc2VsZWN0aW9uXHJcbiAgICAgICAgLy9pZiAoIGtleUNvZGUgPT09IDY1ICYmIChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5ICkpIHtcclxuICAgICAgICAgICAgLy9SLnNlbGVjdFRleHQoKTtcclxuICAgICAgICAgICAgLy9lLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIHNlbGYucmVuZGVyKCk7XHJcbiAgICAgICAgLy99XHJcblxyXG4gICAgICAgIGlmKCBrZXlDb2RlID09PSAxMyApeyAvL2VudGVyXHJcblxyXG4gICAgICAgICAgICBSLmNsZWFySW5wdXQoKTtcclxuXHJcbiAgICAgICAgLy99IGVsc2UgaWYoIGtleUNvZGUgPT09IDkgKXsgLy90YWIga2V5XHJcblxyXG4gICAgICAgICAgIC8vIFIuaW5wdXQudGV4dENvbnRlbnQgPSAnJztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIGlmKCBSLmlucHV0LmlzTnVtICl7XHJcbiAgICAgICAgICAgICAgICBpZiAoICgoZS5rZXlDb2RlID4gNDcpICYmIChlLmtleUNvZGUgPCA1OCkpIHx8ICgoZS5rZXlDb2RlID4gOTUpICYmIChlLmtleUNvZGUgPCAxMDYpKSB8fCBlLmtleUNvZGUgPT09IDE5MCB8fCBlLmtleUNvZGUgPT09IDExMCB8fCBlLmtleUNvZGUgPT09IDggfHwgZS5rZXlDb2RlID09PSAxMDkgKXtcclxuICAgICAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQucmVhZE9ubHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5yZWFkT25seSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGtleXVwOiBmdW5jdGlvbiAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudCA9PT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICAgICAgUi5zdHIgPSBSLmhpZGRlbkltcHV0LnZhbHVlO1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQuYWxsRXF1YWwgKSBSLnBhcmVudC5zYW1lU3RyKCBSLnN0ciApOy8vIG51bWVyaWMgc2Ftw7llIHZhbHVlXHJcbiAgICAgICAgZWxzZSBSLmlucHV0LnRleHRDb250ZW50ID0gUi5zdHI7XHJcblxyXG4gICAgICAgIFIuY3Vyc29ySWQgPSBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0O1xyXG4gICAgICAgIFIuaW5wdXRSYW5nZSA9IFsgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25TdGFydCwgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25FbmQgXTtcclxuXHJcbiAgICAgICAgUi5zZWxlY3RQYXJlbnQoKTtcclxuXHJcbiAgICAgICAgLy9pZiggUi5wYXJlbnQuYWxsd2F5ICkgXHJcbiAgICAgICAgUi5wYXJlbnQudmFsaWRhdGUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vXHJcbiAgICAvLyAgIExJU1RFTklOR1xyXG4gICAgLy9cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBsb29wOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLmlzTG9vcCApIHJlcXVlc3RBbmltYXRpb25GcmFtZSggUi5sb29wICk7XHJcbiAgICAgICAgUi51cGRhdGUoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IFIubGlzdGVucy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoIGktLSApIFIubGlzdGVuc1tpXS5saXN0ZW5pbmcoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJlbW92ZUxpc3RlbjogZnVuY3Rpb24gKCBwcm90byApIHtcclxuXHJcbiAgICAgICAgbGV0IGlkID0gUi5saXN0ZW5zLmluZGV4T2YoIHByb3RvICk7XHJcbiAgICAgICAgaWYoIGlkICE9PSAtMSApIFIubGlzdGVucy5zcGxpY2UoaWQsIDEpO1xyXG4gICAgICAgIGlmKCBSLmxpc3RlbnMubGVuZ3RoID09PSAwICkgUi5pc0xvb3AgPSBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFkZExpc3RlbjogZnVuY3Rpb24gKCBwcm90byApIHtcclxuXHJcbiAgICAgICAgbGV0IGlkID0gUi5saXN0ZW5zLmluZGV4T2YoIHByb3RvICk7XHJcblxyXG4gICAgICAgIGlmKCBpZCAhPT0gLTEgKSByZXR1cm47IFxyXG5cclxuICAgICAgICBSLmxpc3RlbnMucHVzaCggcHJvdG8gKTtcclxuXHJcbiAgICAgICAgaWYoICFSLmlzTG9vcCApe1xyXG4gICAgICAgICAgICBSLmlzTG9vcCA9IHRydWU7XHJcbiAgICAgICAgICAgIFIubG9vcCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFJvb3RzID0gUjsiLCJleHBvcnQgY2xhc3MgVjIge1xyXG5cclxuXHRjb25zdHJ1Y3RvciggeCA9IDAsIHkgPSAwICkge1xyXG5cclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cclxuXHR9XHJcblxyXG5cdHNldCAoIHgsIHkgKSB7XHJcblxyXG5cdFx0dGhpcy54ID0geDtcclxuXHRcdHRoaXMueSA9IHk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRkaXZpZGUgKCB2ICkge1xyXG5cclxuXHRcdHRoaXMueCAvPSB2Lng7XHJcblx0XHR0aGlzLnkgLz0gdi55O1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bXVsdGlwbHkgKCB2ICkge1xyXG5cclxuXHRcdHRoaXMueCAqPSB2Lng7XHJcblx0XHR0aGlzLnkgKj0gdi55O1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bXVsdGlwbHlTY2FsYXIgKCBzY2FsYXIgKSB7XHJcblxyXG5cdFx0dGhpcy54ICo9IHNjYWxhcjtcclxuXHRcdHRoaXMueSAqPSBzY2FsYXI7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRkaXZpZGVTY2FsYXIgKCBzY2FsYXIgKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlTY2FsYXIoIDEgLyBzY2FsYXIgKTtcclxuXHJcblx0fVxyXG5cclxuXHRsZW5ndGggKCkge1xyXG5cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSApO1xyXG5cclxuXHR9XHJcblxyXG5cdGFuZ2xlICgpIHtcclxuXHJcblx0XHQvLyBjb21wdXRlcyB0aGUgYW5nbGUgaW4gcmFkaWFucyB3aXRoIHJlc3BlY3QgdG8gdGhlIHBvc2l0aXZlIHgtYXhpc1xyXG5cclxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoIHRoaXMueSwgdGhpcy54ICk7XHJcblxyXG5cdFx0aWYgKCBhbmdsZSA8IDAgKSBhbmdsZSArPSAyICogTWF0aC5QSTtcclxuXHJcblx0XHRyZXR1cm4gYW5nbGU7XHJcblxyXG5cdH1cclxuXHJcblx0YWRkU2NhbGFyICggcyApIHtcclxuXHJcblx0XHR0aGlzLnggKz0gcztcclxuXHRcdHRoaXMueSArPSBzO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bmVnYXRlICgpIHtcclxuXHJcblx0XHR0aGlzLnggKj0gLTE7XHJcblx0XHR0aGlzLnkgKj0gLTE7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRuZWcgKCkge1xyXG5cclxuXHRcdHRoaXMueCA9IC0xO1xyXG5cdFx0dGhpcy55ID0gLTE7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRpc1plcm8gKCkge1xyXG5cclxuXHRcdHJldHVybiAoIHRoaXMueCA9PT0gMCAmJiB0aGlzLnkgPT09IDAgKTtcclxuXHJcblx0fVxyXG5cclxuXHRjb3B5ICggdiApIHtcclxuXHJcblx0XHR0aGlzLnggPSB2Lng7XHJcblx0XHR0aGlzLnkgPSB2Lnk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0ZXF1YWxzICggdiApIHtcclxuXHJcblx0XHRyZXR1cm4gKCAoIHYueCA9PT0gdGhpcy54ICkgJiYgKCB2LnkgPT09IHRoaXMueSApICk7XHJcblxyXG5cdH1cclxuXHJcblx0bmVhckVxdWFscyAoIHYsIG4gKSB7XHJcblxyXG5cdFx0cmV0dXJuICggKCB2LngudG9GaXhlZChuKSA9PT0gdGhpcy54LnRvRml4ZWQobikgKSAmJiAoIHYueS50b0ZpeGVkKG4pID09PSB0aGlzLnkudG9GaXhlZChuKSApICk7XHJcblxyXG5cdH1cclxuXHJcblx0bGVycCAoIHYsIGFscGhhICkge1xyXG5cclxuXHRcdGlmKCB2ID09PSBudWxsICl7XHJcblx0XHRcdHRoaXMueCAtPSB0aGlzLnggKiBhbHBoYTtcclxuXHRcdCAgICB0aGlzLnkgLT0gdGhpcy55ICogYWxwaGE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnggKz0gKCB2LnggLSB0aGlzLnggKSAqIGFscGhhO1xyXG5cdFx0ICAgIHRoaXMueSArPSAoIHYueSAtIHRoaXMueSApICogYWxwaGE7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcbn0iLCJcclxuaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuL1Jvb3RzJztcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuL1Rvb2xzJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuL1YyJztcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmNsYXNzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICAvLyBpZiBpcyBvbiBndWkgb3IgZ3JvdXBcclxuICAgICAgICB0aGlzLm1haW4gPSBvLm1haW4gfHwgbnVsbDtcclxuICAgICAgICB0aGlzLmlzVUkgPSBvLmlzVUkgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5wYXJlbnRHcm91cCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuY3NzID0gdGhpcy5tYWluID8gdGhpcy5tYWluLmNzcyA6IFRvb2xzLmNzcztcclxuICAgICAgICB0aGlzLmNvbG9ycyA9IHRoaXMubWFpbiA/IHRoaXMubWFpbi5jb2xvcnMgOiBUb29scy5jb2xvcnM7XHJcblxyXG4gICAgICAgIHRoaXMuZGVmYXVsdEJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9yZGVyO1xyXG4gICAgICAgIHRoaXMuc3ZncyA9IFRvb2xzLnN2Z3M7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgc3BhY2UgXHJcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gby5pc0VtcHR5IHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnpvbmUgPSB7IHg6MCwgeTowLCB3OjAsIGg6MCB9O1xyXG4gICAgICAgIHRoaXMubG9jYWwgPSBuZXcgVjIoKS5uZWcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0NhbnZhc09ubHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbGVjdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBwZXJjZW50IG9mIHRpdGxlXHJcbiAgICAgICAgdGhpcy5wID0gby5wICE9PSB1bmRlZmluZWQgPyBvLnAgOiBUb29scy5zaXplLnA7XHJcblxyXG4gICAgICAgIHRoaXMudyA9IHRoaXMuaXNVSSA/IHRoaXMubWFpbi5zaXplLncgOiBUb29scy5zaXplLnc7XHJcbiAgICAgICAgaWYoIG8udyAhPT0gdW5kZWZpbmVkICkgdGhpcy53ID0gby53O1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmlzVUkgPyB0aGlzLm1haW4uc2l6ZS5oIDogVG9vbHMuc2l6ZS5oO1xyXG4gICAgICAgIGlmKCBvLmggIT09IHVuZGVmaW5lZCApIHRoaXMuaCA9IG8uaDtcclxuICAgICAgICBpZighdGhpcy5pc0VtcHR5KSB0aGlzLmggPSB0aGlzLmggPCAxMSA/IDExIDogdGhpcy5oO1xyXG5cclxuICAgICAgICAvLyBpZiBuZWVkIHJlc2l6ZSB3aWR0aFxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gby5hdXRvIHx8IHRydWU7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gc3RhdHVcclxuICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyByYWRpdXMgZm9yIHRvb2xib3hcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IG8ucmFkaXVzIHx8IDA7XHJcblxyXG4gICAgICAgIC8vIG9ubHkgZm9yIG51bWJlclxyXG4gICAgICAgIHRoaXMuaXNOdW1iZXIgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm5vTmVnID0gby5ub05lZyB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLmFsbEVxdWFsID0gby5hbGxFcXVhbCB8fCBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICAvLyBvbmx5IG1vc3Qgc2ltcGxlIFxyXG4gICAgICAgIHRoaXMubW9ubyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBzdG9wIGxpc3RlbmluZyBmb3IgZWRpdCBzbGlkZSB0ZXh0XHJcbiAgICAgICAgdGhpcy5pc0VkaXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gbm8gdGl0bGUgXHJcbiAgICAgICAgdGhpcy5zaW1wbGUgPSBvLnNpbXBsZSB8fCBmYWxzZTtcclxuICAgICAgICBpZiggdGhpcy5zaW1wbGUgKSB0aGlzLnNhID0gMDtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vIGRlZmluZSBvYmogc2l6ZVxyXG4gICAgICAgIHRoaXMuc2V0U2l6ZSggdGhpcy53ICk7XHJcblxyXG4gICAgICAgIC8vIHRpdGxlIHNpemVcclxuICAgICAgICBpZihvLnNhICE9PSB1bmRlZmluZWQgKSB0aGlzLnNhID0gby5zYTtcclxuICAgICAgICBpZihvLnNiICE9PSB1bmRlZmluZWQgKSB0aGlzLnNiID0gby5zYjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc2ltcGxlICkgdGhpcy5zYiA9IHRoaXMudyAtIHRoaXMuc2E7XHJcblxyXG4gICAgICAgIC8vIGxhc3QgbnVtYmVyIHNpemUgZm9yIHNsaWRlXHJcbiAgICAgICAgdGhpcy5zYyA9IG8uc2MgPT09IHVuZGVmaW5lZCA/IDQ3IDogby5zYztcclxuXHJcbiAgICAgICAgLy8gZm9yIGxpc3RlbmluZyBvYmplY3RcclxuICAgICAgICB0aGlzLm9iamVjdExpbmsgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy52YWwgPSBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIEJhY2tncm91bmRcclxuICAgICAgICB0aGlzLmJnID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDsvL3RoaXMuaXNVSSA/IHRoaXMubWFpbi5iZyA6IFRvb2xzLmNvbG9ycy5iYWNrZ3JvdW5kO1xyXG4gICAgICAgIHRoaXMuYmdPdmVyID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXI7XHJcbiAgICAgICAgaWYoIG8uYmcgIT09IHVuZGVmaW5lZCApeyB0aGlzLmJnID0gby5iZzsgdGhpcy5iZ092ZXIgPSBvLmJnOyB9XHJcbiAgICAgICAgaWYoIG8uYmdPdmVyICE9PSB1bmRlZmluZWQgKXsgdGhpcy5iZ092ZXIgPSBvLmJnT3ZlcjsgfVxyXG5cclxuICAgICAgICAvLyBGb250IENvbG9yO1xyXG4gICAgICAgIHRoaXMudGl0bGVDb2xvciA9IG8udGl0bGVDb2xvciB8fCB0aGlzLmNvbG9ycy50ZXh0O1xyXG4gICAgICAgIHRoaXMuZm9udENvbG9yID0gby5mb250Q29sb3IgfHwgdGhpcy5jb2xvcnMudGV4dDtcclxuICAgICAgICB0aGlzLmZvbnRTZWxlY3QgPSBvLmZvbnRTZWxlY3QgfHwgdGhpcy5jb2xvcnMudGV4dE92ZXI7XHJcblxyXG4gICAgICAgIGlmKCBvLmNvbG9yICE9PSB1bmRlZmluZWQgKSB0aGlzLmZvbnRDb2xvciA9IG8uY29sb3I7XHJcbiAgICAgICAgICAgIC8qeyBcclxuXHJcbiAgICAgICAgICAgIGlmKG8uY29sb3IgPT09ICduJykgby5jb2xvciA9ICcjZmYwMDAwJztcclxuXHJcbiAgICAgICAgICAgIGlmKCBvLmNvbG9yICE9PSAnbm8nICkge1xyXG4gICAgICAgICAgICAgICAgaWYoICFpc05hTihvLmNvbG9yKSApIHRoaXMuZm9udENvbG9yID0gVG9vbHMuaGV4VG9IdG1sKG8uY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLmZvbnRDb2xvciA9IG8uY29sb3I7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpdGxlQ29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9Ki9cclxuICAgICAgICBcclxuICAgICAgICAvKmlmKCBvLmNvbG9yICE9PSB1bmRlZmluZWQgKXsgXHJcbiAgICAgICAgICAgIGlmKCAhaXNOYU4oby5jb2xvcikgKSB0aGlzLmZvbnRDb2xvciA9IFRvb2xzLmhleFRvSHRtbChvLmNvbG9yKTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLmZvbnRDb2xvciA9IG8uY29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMudGl0bGVDb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICB0aGlzLmNvbG9yUGx1cyA9IFRvb2xzLkNvbG9yTHVtYSggdGhpcy5mb250Q29sb3IsIDAuMyApO1xyXG5cclxuICAgICAgICB0aGlzLnR4dCA9IG8ubmFtZSB8fCAnUHJvdG8nO1xyXG4gICAgICAgIHRoaXMucmVuYW1lID0gby5yZW5hbWUgfHwgJyc7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBvLnRhcmdldCB8fCBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gby5jYWxsYmFjayA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG8uY2FsbGJhY2s7XHJcbiAgICAgICAgdGhpcy5lbmRDYWxsYmFjayA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrID09PSBudWxsICYmIHRoaXMuaXNVSSAmJiB0aGlzLm1haW4uY2FsbGJhY2sgIT09IG51bGwgKSB0aGlzLmNhbGxiYWNrID0gdGhpcy5tYWluLmNhbGxiYWNrO1xyXG5cclxuICAgICAgICAvLyBlbGVtZW50c1xyXG4gICAgICAgIHRoaXMuYyA9IFtdO1xyXG5cclxuICAgICAgICAvLyBzdHlsZSBcclxuICAgICAgICB0aGlzLnMgPSBbXTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY1swXSA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOyBoZWlnaHQ6MjBweDsgZmxvYXQ6bGVmdDsgb3ZlcmZsb3c6aGlkZGVuOycpO1xyXG4gICAgICAgIHRoaXMuc1swXSA9IHRoaXMuY1swXS5zdHlsZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMuc1swXS5tYXJnaW5Cb3R0b20gPSAnMXB4JztcclxuICAgICAgICBcclxuICAgICAgICAvLyB3aXRoIHRpdGxlXHJcbiAgICAgICAgaWYoICF0aGlzLnNpbXBsZSApeyBcclxuICAgICAgICAgICAgdGhpcy5jWzFdID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICk7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXSA9IHRoaXMuY1sxXS5zdHlsZTtcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy5yZW5hbWUgPT09ICcnID8gdGhpcy50eHQgOiB0aGlzLnJlbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5zWzFdLmNvbG9yID0gdGhpcy50aXRsZUNvbG9yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG8ucG9zICl7XHJcbiAgICAgICAgICAgIHRoaXMuc1swXS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XHJcbiAgICAgICAgICAgIGZvcihsZXQgcCBpbiBvLnBvcyl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMF1bcF0gPSBvLnBvc1twXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm1vbm8gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG8uY3NzICkgdGhpcy5zWzBdLmNzc1RleHQgPSBvLmNzczsgXHJcbiAgICAgICAgXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIG1ha2UgdGhlIG5vZGVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIFxyXG4gICAgaW5pdCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7IC8vIHN0eWxlIGNhY2hlXHJcbiAgICAgICAgbGV0IGMgPSB0aGlzLmM7IC8vIGRpdiBjYWNoXHJcblxyXG4gICAgICAgIHNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSAgKSBzWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzRW1wdHkgICkgc1swXS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xyXG5cclxuICAgICAgICAvL2lmKCB0aGlzLmF1dG9IZWlnaHQgKSBzWzBdLnRyYW5zaXRpb24gPSAnaGVpZ2h0IDAuMDFzIGVhc2Utb3V0JztcclxuICAgICAgICBpZiggY1sxXSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuYXV0b1dpZHRoICl7XHJcbiAgICAgICAgICAgIHNbMV0gPSBjWzFdLnN0eWxlO1xyXG4gICAgICAgICAgICBzWzFdLmhlaWdodCA9ICh0aGlzLmgtNCkgKyAncHgnO1xyXG4gICAgICAgICAgICBzWzFdLmxpbmVIZWlnaHQgPSAodGhpcy5oLTgpICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmcmFnID0gVG9vbHMuZnJhZztcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDEsIGxuZyA9IGMubGVuZ3RoOyBpICE9PSBsbmc7IGkrKyApe1xyXG4gICAgICAgICAgICBpZiggY1tpXSAhPT0gdW5kZWZpbmVkICkge1xyXG4gICAgICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCggY1tpXSApO1xyXG4gICAgICAgICAgICAgICAgc1tpXSA9IGNbaV0uc3R5bGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnRhcmdldCAhPT0gbnVsbCApeyBcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQuYXBwZW5kQ2hpbGQoIGNbMF0gKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmlubmVyLmFwcGVuZENoaWxkKCBjWzBdICk7XHJcbiAgICAgICAgICAgIGVsc2UgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggY1swXSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY1swXS5hcHBlbmRDaGlsZCggZnJhZyApO1xyXG5cclxuICAgICAgICB0aGlzLnJTaXplKCk7XHJcblxyXG4gICAgICAgIC8vICEgc29sbyBwcm90b1xyXG4gICAgICAgIGlmKCAhdGhpcy5pc1VJICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMF0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuICAgICAgICAgICAgUm9vdHMuYWRkKCB0aGlzICk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZnJvbSBUb29sc1xyXG5cclxuICAgIGRvbSAoIHR5cGUsIGNzcywgb2JqLCBkb20sIGlkICkge1xyXG5cclxuICAgICAgICByZXR1cm4gVG9vbHMuZG9tKCB0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRTdmcgKCBkb20sIHR5cGUsIHZhbHVlLCBpZCwgaWQyICkge1xyXG5cclxuICAgICAgICBUb29scy5zZXRTdmcoIGRvbSwgdHlwZSwgdmFsdWUsIGlkLCBpZDIgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q3NzICggZG9tLCBjc3MgKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLnNldENzcyggZG9tLCBjc3MgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xhbXAgKCB2YWx1ZSwgbWluLCBtYXggKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBUb29scy5jbGFtcCggdmFsdWUsIG1pbiwgbWF4ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldENvbG9yUmluZyAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHMuY29sb3JSaW5nICkgVG9vbHMubWFrZUNvbG9yUmluZygpO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHMuY29sb3JSaW5nICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldEpveXN0aWNrICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHNbICdqb3lzdGlja18nKyBtb2RlbCBdICkgVG9vbHMubWFrZUpveXN0aWNrKCBtb2RlbCApO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHNbICdqb3lzdGlja18nKyBtb2RlbCBdICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldENpcmN1bGFyICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHMuY2lyY3VsYXIgKSBUb29scy5tYWtlQ2lyY3VsYXIoIG1vZGVsICk7XHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmNsb25lKCBUb29scy5jaXJjdWxhciApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXRLbm9iICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGlmKCAhVG9vbHMua25vYiApIFRvb2xzLm1ha2VLbm9iKCBtb2RlbCApO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHMua25vYiApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBmcm9tIFJvb3RzXHJcblxyXG4gICAgY3Vyc29yICggbmFtZSApIHtcclxuXHJcbiAgICAgICAgIFJvb3RzLmN1cnNvciggbmFtZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICAvLy8vLy8vLy9cclxuXHJcbiAgICB1cGRhdGUgKCkge31cclxuXHJcbiAgICByZXNldCAoKSB7fVxyXG5cclxuICAgIC8vLy8vLy8vL1xyXG5cclxuICAgIGdldERvbSAoKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmNbMF07XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3V0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYodGhpcy5zKSB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVpb3ZlciAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRW1wdHkgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKHRoaXMucykgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnT3ZlcjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVuYW1lICggcyApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkKSB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSBzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW4gKCkge1xyXG5cclxuICAgICAgICBSb290cy5hZGRMaXN0ZW4oIHRoaXMgKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuaW5nICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayA9PT0gbnVsbCApIHJldHVybjtcclxuICAgICAgICBpZiggdGhpcy5pc1NlbmQgKSByZXR1cm47XHJcbiAgICAgICAgaWYoIHRoaXMuaXNFZGl0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnNldFZhbHVlKCB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0VmFsdWUgKCB2ICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc051bWJlciApIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB2ICk7XHJcbiAgICAgICAgLy9lbHNlIGlmKCB2IGluc3RhbmNlb2YgQXJyYXkgJiYgdi5sZW5ndGggPT09IDEgKSB2ID0gdlswXTtcclxuICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSB2O1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyB1cGRhdGUgZXZlcnkgY2hhbmdlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgb25DaGFuZ2UgKCBmICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0VtcHR5ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gZiB8fCBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyB1cGRhdGUgb25seSBvbiBlbmRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvbkZpbmlzaENoYW5nZSAoIGYgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRW1wdHkgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZW5kQ2FsbGJhY2sgPSBmO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZW5kICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgdGhpcy52YWx1ZTtcclxuICAgICAgICBpZiggdiBpbnN0YW5jZW9mIEFycmF5ICYmIHYubGVuZ3RoID09PSAxICkgdiA9IHZbMF07XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gdHJ1ZTtcclxuICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rICE9PSBudWxsICkgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdID0gdjtcclxuICAgICAgICBpZiggdGhpcy5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2soIHYsIHRoaXMudmFsICk7XHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VuZEVuZCAoIHYgKSB7XHJcblxyXG4gICAgICAgIHYgPSB2IHx8IHRoaXMudmFsdWU7XHJcbiAgICAgICAgaWYoIHYgaW5zdGFuY2VvZiBBcnJheSAmJiB2Lmxlbmd0aCA9PT0gMSApIHYgPSB2WzBdO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5lbmRDYWxsYmFjayApIHRoaXMuZW5kQ2FsbGJhY2soIHYgKTtcclxuICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rICE9PSBudWxsICkgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdID0gdjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gY2xlYXIgbm9kZVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgXHJcbiAgICBjbGVhciAoKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLmNsZWFyKCB0aGlzLmNbMF0gKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5yZW1vdmVDaGlsZCggdGhpcy5jWzBdICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jbGVhck9uZSggdGhpcyApO1xyXG4gICAgICAgICAgICBlbHNlIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoIHRoaXMuY1swXSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzVUkgKSBSb290cy5yZW1vdmUoIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jID0gbnVsbDtcclxuICAgICAgICB0aGlzLnMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gY2hhbmdlIHNpemUgXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0U2l6ZSAoIHN4ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuYXV0b1dpZHRoICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLncgPSBzeDtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc2ltcGxlICl7XHJcbiAgICAgICAgICAgIHRoaXMuc2IgPSB0aGlzLncgLSB0aGlzLnNhO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBwcCA9IHRoaXMudyAqICggdGhpcy5wIC8gMTAwICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2EgPSBNYXRoLmZsb29yKCBwcCArIDEwICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2IgPSBNYXRoLmZsb29yKCB0aGlzLncgLSBwcCAtIDIwICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5hdXRvV2lkdGggKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5zWzBdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuICAgICAgICBpZiggIXRoaXMuc2ltcGxlICkgdGhpcy5zWzFdLndpZHRoID0gdGhpcy5zYSArICdweCc7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBmb3IgbnVtZXJpYyB2YWx1ZVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNldFR5cGVOdW1iZXIgKCBvICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzTnVtYmVyID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IDA7XHJcbiAgICAgICAgaWYoby52YWx1ZSAhPT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgaWYoIHR5cGVvZiBvLnZhbHVlID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWUgPSBvLnZhbHVlICogMTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gby52YWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWluID0gby5taW4gPT09IHVuZGVmaW5lZCA/IC1JbmZpbml0eSA6IG8ubWluO1xyXG4gICAgICAgIHRoaXMubWF4ID0gby5tYXggPT09IHVuZGVmaW5lZCA/ICBJbmZpbml0eSA6IG8ubWF4O1xyXG4gICAgICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gPT09IHVuZGVmaW5lZCA/IDIgOiBvLnByZWNpc2lvbjtcclxuXHJcbiAgICAgICAgbGV0IHM7XHJcblxyXG4gICAgICAgIHN3aXRjaCh0aGlzLnByZWNpc2lvbil7XHJcbiAgICAgICAgICAgIGNhc2UgMDogcyA9IDE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IHMgPSAwLjE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IHMgPSAwLjAxOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOiBzID0gMC4wMDE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6IHMgPSAwLjAwMDE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6IHMgPSAwLjAwMDAxOyBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc3RlcCA9IG8uc3RlcCA9PT0gdW5kZWZpbmVkID8gIHMgOiBvLnN0ZXA7XHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4IC0gdGhpcy5taW47XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHRoaXMudmFsdWUgKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBudW1WYWx1ZSAoIG4gKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm5vTmVnICkgbiA9IE1hdGguYWJzKCBuICk7XHJcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKCB0aGlzLm1heCwgTWF0aC5tYXgoIHRoaXMubWluLCBuICkgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTIERFRkFVTFRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBoYW5kbGVFdmVudCAoIGUgKXtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNFbXB0eSApIHJldHVybjtcclxuICAgICAgICByZXR1cm4gdGhpc1tlLnR5cGVdKGUpO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgd2hlZWwgKCBlICkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAga2V5ZG93biAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIGtleXVwICggZSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIG9iamVjdCByZWZlcmVuY3lcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRSZWZlcmVuY3kgKCBvYmosIHZhbCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5vYmplY3RMaW5rID0gb2JqO1xyXG4gICAgICAgIHRoaXMudmFsID0gdmFsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkaXNwbGF5ICggdiApIHtcclxuICAgICAgICBcclxuICAgICAgICB2ID0gdiB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLnNbMF0uZGlzcGxheSA9IHYgPyAnYmxvY2snIDogJ25vbmUnO1xyXG4gICAgICAgIC8vdGhpcy5pc1JlYWR5ID0gdiA/IGZhbHNlIDogdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gcmVzaXplIGhlaWdodCBcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvcGVuICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG5lZWRab25lICgpIHtcclxuXHJcbiAgICAgICAgUm9vdHMubmVlZFJlWm9uZSA9IHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlem9uZSAoKSB7XHJcblxyXG4gICAgICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3QgKCkge1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgdW5zZWxlY3QgKCkge1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRJbnB1dCAoIElucHV0ICkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIFJvb3RzLnNldElucHV0KCBJbnB1dCwgdGhpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cElucHV0ICggeCwgZG93biApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFJvb3RzLnVwSW5wdXQoIHgsIGRvd24gKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gc3BlY2lhbCBpdGVtIFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdGVkICggYiApe1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VsZWN0ID0gYiB8fCBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCB7IFByb3RvIH07IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBCb29sIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgICAgIHRoaXMuaW5oID0gby5pbmggfHwgTWF0aC5mbG9vciggdGhpcy5oKjAuOCApO1xyXG4gICAgICAgIHRoaXMuaW53ID0gby5pbncgfHwgMzY7XHJcblxyXG4gICAgICAgIGxldCB0ID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS0oKHRoaXMuaW5oLTIpKjAuNSk7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYmFja2dyb3VuZDonKyB0aGlzLmNvbG9ycy5ib29sYmcgKyc7IGhlaWdodDonKyh0aGlzLmluaC0yKSsncHg7IHdpZHRoOicrdGhpcy5pbncrJ3B4OyB0b3A6Jyt0KydweDsgYm9yZGVyLXJhZGl1czoxMHB4OyBib3JkZXI6MnB4IHNvbGlkICcrdGhpcy5ib29sYmcgKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2hlaWdodDonKyh0aGlzLmluaC02KSsncHg7IHdpZHRoOjE2cHg7IHRvcDonKyh0KzIpKydweDsgYm9yZGVyLXJhZGl1czoxMHB4OyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSA/IGZhbHNlIDogdHJ1ZTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdXBkYXRlICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnZhbHVlICl7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzWzJdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5ib29sb247XHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5ib29sb247XHJcbiAgICAgICAgICAgIHNbM10ubWFyZ2luTGVmdCA9ICcxN3B4JztcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHNbMl0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJvb2xiZztcclxuICAgICAgICAgICAgc1syXS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmJvb2xiZztcclxuICAgICAgICAgICAgc1szXS5tYXJnaW5MZWZ0ID0gJzJweCc7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gKHRoaXMudyAtIDEwICkgLSB0aGlzLmludztcclxuICAgICAgICBzWzJdLmxlZnQgPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzNdLmxlZnQgPSB3ICsgJ3B4JztcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBvLnZhbHVlIHx8IHRoaXMudHh0O1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIHRoaXMudmFsdWVzID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWVzID0gW3RoaXMudmFsdWVzXTtcclxuXHJcbiAgICAgICAgLy90aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBjdXN0b20gY29sb3JcclxuICAgICAgICB0aGlzLmNjID0gWyB0aGlzLmNvbG9ycy5idXR0b24sIHRoaXMuY29sb3JzLnNlbGVjdCwgdGhpcy5jb2xvcnMuZG93biBdO1xyXG5cclxuICAgICAgICBpZiggby5jQmcgIT09IHVuZGVmaW5lZCApIHRoaXMuY2NbMF0gPSBvLmNCZztcclxuICAgICAgICBpZiggby5iQ29sb3IgIT09IHVuZGVmaW5lZCApIHRoaXMuY2NbMF0gPSBvLmJDb2xvcjtcclxuICAgICAgICBpZiggby5jU2VsZWN0ICE9PSB1bmRlZmluZWQgKSB0aGlzLmNjWzFdID0gby5jU2VsZWN0O1xyXG4gICAgICAgIGlmKCBvLmNEb3duICE9PSB1bmRlZmluZWQgKSB0aGlzLmNjWzJdID0gby5jRG93bjtcclxuXHJcbiAgICAgICAgdGhpcy5pc0xvYWRCdXR0b24gPSBvLmxvYWRlciB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzRHJhZ0J1dHRvbiA9IG8uZHJhZyB8fCBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKSB0aGlzLmlzTG9hZEJ1dHRvbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZXMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMudG1wID0gW107XHJcbiAgICAgICAgdGhpcy5zdGF0ID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jW2krMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLmJ1dHRvbiArICd0b3A6MXB4OyBiYWNrZ3JvdW5kOicrdGhpcy5jY1swXSsnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOicrdGhpcy5jb2xvcnMuYnV0dG9uQm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5pbm5lckhUTUwgPSB0aGlzLnZhbHVlc1tpXTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0W2ldID0gMTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSAnJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNMb2FkQnV0dG9uICkgdGhpcy5pbml0TG9hZGVyKCk7XHJcbiAgICAgICAgaWYoIHRoaXMuaXNEcmFnQnV0dG9uICl7IFxyXG4gICAgICAgICAgICB0aGlzLmxuZyArKztcclxuICAgICAgICAgICAgdGhpcy5pbml0RHJhZ2VyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgdCA9IHRoaXMudG1wO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICBcdGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpKzI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJydcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgIFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbbmFtZS0yXVxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0xvYWRCdXR0b24gKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICAvL2Vsc2UgdGhpcy5maWxlU2VsZWN0KCBlLnRhcmdldC5maWxlc1swXSApO1xyXG4gICAgXHRyZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuIFxyXG4gICAgICAgIC8vIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAvLyBjb25zb2xlLmxvZyhuYW1lKVxyXG5cclxuICAgICAgICBpZiggbmFtZSAhPT0gJycgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBuYW1lICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyh1cClcclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZXMgKCBuLCBuYW1lICkge1xyXG5cclxuICAgICAgICBsZXQgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09PSBuYW1lLTIgKSB2ID0gdGhpcy5tb2RlKCBuLCBpKzIgKTtcclxuICAgICAgICAgICAgZWxzZSB2ID0gdGhpcy5tb2RlKCAxLCBpKzIgKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgbW9kZSAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBuYW1lIC0gMjtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpXSAhPT0gbiApe1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdFtpXSA9IDE7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5jY1swXTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdFtpXSA9IDI7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuY2NbMV07IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXRbaV0gPSAzOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmNjWzJdOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgLypsZXQgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuICAgICAgICAgICAgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlcyggMSAsIDIgKTtcclxuXHJcbiAgICBcdC8qaWYoIHRoaXMuc2VsZWN0ZWQgKXtcclxuICAgIFx0XHR0aGlzLnNbIHRoaXMuc2VsZWN0ZWQgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnNbIHRoaXMuc2VsZWN0ZWQgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIFx0fVxyXG4gICAgICAgIHJldHVybiBmYWxzZTsqL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZHJhZ292ZXIgKCBlICkge1xyXG5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuICAgICAgICB0aGlzLnNbNF0uY29sb3IgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRyYWdlbmQgKCBlICkge1xyXG5cclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc1s0XS5ib3JkZXJDb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIHRoaXMuc1s0XS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkcm9wICggZSApIHtcclxuXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICB0aGlzLmRyYWdlbmQoZSk7XHJcbiAgICAgICAgdGhpcy5maWxlU2VsZWN0KCBlLmRhdGFUcmFuc2Zlci5maWxlc1swXSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpbml0RHJhZ2VyICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKycgdGV4dC1hbGlnbjpjZW50ZXI7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC04KSsncHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5mb250Q29sb3IrJzsgdG9wOjJweDsgIGhlaWdodDonKyh0aGlzLmgtNCkrJ3B4OyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OyBwb2ludGVyLWV2ZW50czphdXRvOycgKTsvLyBjdXJzb3I6ZGVmYXVsdDtcclxuICAgICAgICB0aGlzLmNbNF0udGV4dENvbnRlbnQgPSAnRFJBRyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1s0XS5hZGRFdmVudExpc3RlbmVyKCAnZHJhZ292ZXInLCBmdW5jdGlvbihlKXsgdGhpcy5kcmFnb3ZlcihlKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG4gICAgICAgIHRoaXMuY1s0XS5hZGRFdmVudExpc3RlbmVyKCAnZHJhZ2VuZCcsIGZ1bmN0aW9uKGUpeyB0aGlzLmRyYWdlbmQoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpeyB0aGlzLmRyYWdlbmQoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2Ryb3AnLCBmdW5jdGlvbihlKXsgdGhpcy5kcm9wKGUpOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdLmV2ZW50cyA9IFsgIF07XHJcbiAgICAgICAgLy90aGlzLmNbNF0uZXZlbnRzID0gWyAnZHJhZ292ZXInLCAnZHJhZ2VuZCcsICdkcmFnbGVhdmUnLCAnZHJvcCcgXTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGluaXRMb2FkZXIgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ2lucHV0JywgdGhpcy5jc3MuYmFzaWMgKyd0b3A6MHB4OyBvcGFjaXR5OjA7IGhlaWdodDonKyh0aGlzLmgpKydweDsgcG9pbnRlci1ldmVudHM6YXV0bzsgY3Vyc29yOnBvaW50ZXI7JyApOy8vXHJcbiAgICAgICAgdGhpcy5jWzNdLm5hbWUgPSAnbG9hZGVyJztcclxuICAgICAgICB0aGlzLmNbM10udHlwZSA9IFwiZmlsZVwiO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10uYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsIGZ1bmN0aW9uKGUpeyB0aGlzLmZpbGVTZWxlY3QoIGUudGFyZ2V0LmZpbGVzWzBdICk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICAvL3RoaXMuY1szXS5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgZnVuY3Rpb24oZSl7ICB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jWzJdLmV2ZW50cyA9IFsgIF07XHJcbiAgICAgICAgLy90aGlzLmNbM10uZXZlbnRzID0gWyAnY2hhbmdlJywgJ21vdXNlb3ZlcicsICdtb3VzZWRvd24nLCAnbW91c2V1cCcsICdtb3VzZW91dCcgXTtcclxuXHJcbiAgICAgICAgLy90aGlzLmhpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmaWxlU2VsZWN0ICggZmlsZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGRhdGFVcmwgPSBbICdwbmcnLCAnanBnJywgJ21wNCcsICd3ZWJtJywgJ29nZycgXTtcclxuICAgICAgICBsZXQgZGF0YUJ1ZiA9IFsgJ3NlYScsICd6JywgJ2hleCcsICdidmgnLCAnQlZIJywgJ2dsYicgXTtcclxuXHJcbiAgICAgICAgLy9pZiggISBlLnRhcmdldC5maWxlcyApIHJldHVybjtcclxuXHJcbiAgICAgICAgLy9sZXQgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xyXG4gICAgICAgXHJcbiAgICAgICAgLy90aGlzLmNbM10udHlwZSA9IFwibnVsbFwiO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCB0aGlzLmNbNF0gKVxyXG5cclxuICAgICAgICBpZiggZmlsZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuICAgICAgICBsZXQgZm5hbWUgPSBmaWxlLm5hbWU7XHJcbiAgICAgICAgbGV0IHR5cGUgPSBmbmFtZS5zdWJzdHJpbmcoZm5hbWUubGFzdEluZGV4T2YoJy4nKSsxLCBmbmFtZS5sZW5ndGggKTtcclxuXHJcbiAgICAgICAgaWYoIGRhdGFVcmwuaW5kZXhPZiggdHlwZSApICE9PSAtMSApIHJlYWRlci5yZWFkQXNEYXRhVVJMKCBmaWxlICk7XHJcbiAgICAgICAgZWxzZSBpZiggZGF0YUJ1Zi5pbmRleE9mKCB0eXBlICkgIT09IC0xICkgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlICk7Ly9yZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTtcclxuICAgICAgICBlbHNlIHJlYWRlci5yZWFkQXNUZXh0KCBmaWxlICk7XHJcblxyXG4gICAgICAgIC8vIGlmKCB0eXBlID09PSAncG5nJyB8fCB0eXBlID09PSAnanBnJyB8fCB0eXBlID09PSAnbXA0JyB8fCB0eXBlID09PSAnd2VibScgfHwgdHlwZSA9PT0gJ29nZycgKSByZWFkZXIucmVhZEFzRGF0YVVSTCggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSBpZiggdHlwZSA9PT0gJ3onICkgcmVhZGVyLnJlYWRBc0JpbmFyeVN0cmluZyggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSBpZiggdHlwZSA9PT0gJ3NlYScgfHwgdHlwZSA9PT0gJ2J2aCcgfHwgdHlwZSA9PT0gJ0JWSCcgfHwgdHlwZSA9PT0gJ3onKSByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoICApIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciggZmlsZSApO1xyXG4gICAgICAgIC8vZWxzZSByZWFkZXIucmVhZEFzVGV4dCggZmlsZSApO1xyXG5cclxuICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayggZS50YXJnZXQucmVzdWx0LCBmbmFtZSwgdHlwZSApO1xyXG4gICAgICAgICAgICAvL3RoaXMuY1szXS50eXBlID0gXCJmaWxlXCI7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCBlLnRhcmdldC5yZXN1bHQgKTsgXHJcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsYWJlbCAoIHN0cmluZywgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMjtcclxuICAgICAgICB0aGlzLmNbbl0udGV4dENvbnRlbnQgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGljb24gKCBzdHJpbmcsIHksIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5zW25dLnBhZGRpbmcgPSAoIHkgfHwgMCApICsncHggMHB4JztcclxuICAgICAgICB0aGlzLmNbbl0uaW5uZXJIVE1MID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy5zYjtcclxuICAgICAgICBsZXQgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IGRjID0gIDM7XHJcbiAgICAgICAgbGV0IHNpemUgPSBNYXRoLmZsb29yKCAoIHctKGRjKihpLTEpKSApIC8gaSApO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgIFx0dGhpcy50bXBbaV0gPSBbIE1hdGguZmxvb3IoIGQgKyAoIHNpemUgKiBpICkgKyAoIGRjICogaSApKSwgc2l6ZSBdO1xyXG4gICAgICAgIFx0dGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG5cclxuICAgICAgICAgICAgc1tpKzJdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCc7XHJcbiAgICAgICAgICAgIHNbaSsyXS53aWR0aCA9IHRoaXMudG1wW2ldWzFdICsgJ3B4JztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKXsgXHJcbiAgICAgICAgICAgIHNbNF0ubGVmdCA9IChkK3NpemUrZGMpICsgJ3B4JztcclxuICAgICAgICAgICAgc1s0XS53aWR0aCA9IHNpemUgKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNMb2FkQnV0dG9uICl7XHJcbiAgICAgICAgICAgIHNbM10ubGVmdCA9IGQgKyAncHgnO1xyXG4gICAgICAgICAgICBzWzNdLndpZHRoID0gc2l6ZSArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZXhwb3J0IGNsYXNzIENpcmN1bGFyIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VHlwZU51bWJlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHRoaXMudyAqIDAuNTsvL01hdGguZmxvb3IoKHRoaXMudy0yMCkqMC41KTtcclxuXHJcbiAgICAgICAgdGhpcy50d29QaSA9IE1hdGguUEkgKiAyO1xyXG4gICAgICAgIHRoaXMucGk5MCA9IE1hdGguUEkgKiAwLjU7XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gbmV3IFYyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMDtcclxuICAgICAgICB0aGlzLnRvcCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICAgICAgaWYodGhpcy5jWzFdICE9PSB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmdldENpcmN1bGFyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAxICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnK3RoaXMudysnICcrdGhpcy53ICk7XHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLncsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY21vZGUgPT09IG1vZGUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIHN3aXRjaCggbW9kZSApe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC4xKScsIDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuY29sb3JQbHVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC4zKScsIDApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuY29sb3JQbHVzLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IG1vZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zZW5kRW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLm9sZHIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgLy90aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBvZmYgPSB0aGlzLm9mZnNldDtcclxuXHJcbiAgICAgICAgb2ZmLnggPSB0aGlzLnJhZGl1cyAtIChlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIG9mZi55ID0gdGhpcy5yYWRpdXMgLSAoZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCApO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSBvZmYuYW5nbGUoKSAtIHRoaXMucGk5MDtcclxuICAgICAgICB0aGlzLnIgPSAoKCh0aGlzLnIldGhpcy50d29QaSkrdGhpcy50d29QaSkldGhpcy50d29QaSk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9sZHIgIT09IG51bGwgKXsgXHJcblxyXG4gICAgICAgICAgICB2YXIgZGlmID0gdGhpcy5yIC0gdGhpcy5vbGRyO1xyXG4gICAgICAgICAgICB0aGlzLnIgPSBNYXRoLmFicyhkaWYpID4gTWF0aC5QSSA/IHRoaXMub2xkciA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgICAgIGlmKCBkaWYgPiA2ICkgdGhpcy5yID0gMDtcclxuICAgICAgICAgICAgaWYoIGRpZiA8IC02ICkgdGhpcy5yID0gdGhpcy50d29QaTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc3RlcHMgPSAxIC8gdGhpcy50d29QaTtcclxuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnIgKiBzdGVwcztcclxuXHJcbiAgICAgICAgdmFyIG4gPSAoICggdGhpcy5yYW5nZSAqIHZhbHVlICkgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcblxyXG4gICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgIG4gPSB+fiAoIG4gLyB0aGlzLnN0ZXAgKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHRoaXMub2xkICsgKCBuICogdGhpcy5zdGVwICkgKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm9sZHIgPSB0aGlzLnI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbWFrZVBhdGggKCkge1xyXG5cclxuICAgICAgICB2YXIgciA9IDQwO1xyXG4gICAgICAgIHZhciBkID0gMjQ7XHJcbiAgICAgICAgdmFyIGEgPSB0aGlzLnBlcmNlbnQgKiB0aGlzLnR3b1BpIC0gMC4wMDE7XHJcbiAgICAgICAgdmFyIHgyID0gKHIgKyByICogTWF0aC5zaW4oYSkpICsgZDtcclxuICAgICAgICB2YXIgeTIgPSAociAtIHIgKiBNYXRoLmNvcyhhKSkgKyBkO1xyXG4gICAgICAgIHZhciBiaWcgPSBhID4gTWF0aC5QSSA/IDEgOiAwO1xyXG4gICAgICAgIHJldHVybiBcIk0gXCIgKyAocitkKSArIFwiLFwiICsgZCArIFwiIEEgXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCBcIiArIGJpZyArIFwiIDEgXCIgKyB4MiArIFwiLFwiICsgeTI7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHVwICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIHRoaXMucGVyY2VudCA9ICggdGhpcy52YWx1ZSAtIHRoaXMubWluICkgLyB0aGlzLnJhbmdlO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMSApO1xyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFRvb2xzIH0gZnJvbSAnLi4vY29yZS9Ub29scyc7XHJcbmltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5leHBvcnQgY2xhc3MgQ29sb3IgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcblx0ICAgIC8vdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuXHJcblx0ICAgIHRoaXMuY3R5cGUgPSBvLmN0eXBlIHx8ICdoZXgnO1xyXG5cclxuXHQgICAgdGhpcy53Zml4ZSA9IHRoaXMuc2IgPiAyNTYgPyAyNTYgOiB0aGlzLnNiO1xyXG5cclxuXHQgICAgaWYoby5jdyAhPSB1bmRlZmluZWQgKSB0aGlzLndmaXhlID0gby5jdztcclxuXHJcblx0ICAgIC8vIGNvbG9yIHVwIG9yIGRvd25cclxuXHQgICAgdGhpcy5zaWRlID0gby5zaWRlIHx8ICdkb3duJztcclxuXHQgICAgdGhpcy51cCA9IHRoaXMuc2lkZSA9PT0gJ2Rvd24nID8gMCA6IDE7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuXHQgICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuXHQgICAgdGhpcy5kZWNhbCA9IG5ldyBWMigpO1xyXG5cdCAgICB0aGlzLnAgPSBuZXcgVjIoKTtcclxuXHJcblx0ICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgIHRoaXMuY3NzLnR4dCArICdoZWlnaHQ6JysodGhpcy5oLTQpKydweDsnICsgJ2JvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC04KSsncHg7JyApO1xyXG5cdCAgICB0aGlzLnNbMl0gPSB0aGlzLmNbMl0uc3R5bGU7XHJcblxyXG5cdCAgICBpZiggdGhpcy51cCApe1xyXG5cdCAgICAgICAgdGhpcy5zWzJdLnRvcCA9ICdhdXRvJztcclxuXHQgICAgICAgIHRoaXMuc1syXS5ib3R0b20gPSAnMnB4JztcclxuXHQgICAgfVxyXG5cclxuXHQgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRDb2xvclJpbmcoKTtcclxuXHQgICAgdGhpcy5jWzNdLnN0eWxlLnZpc2liaWxpdHkgID0gJ2hpZGRlbic7XHJcblxyXG5cdCAgICB0aGlzLmhzbCA9IG51bGw7XHJcblx0ICAgIHRoaXMudmFsdWUgPSAnI2ZmZmZmZic7XHJcblx0ICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuXHQgICAgICAgIGlmKCBvLnZhbHVlIGluc3RhbmNlb2YgQXJyYXkgKSB0aGlzLnZhbHVlID0gVG9vbHMucmdiVG9IZXgoIG8udmFsdWUgKTtcclxuXHQgICAgICAgIGVsc2UgaWYoIWlzTmFOKG8udmFsdWUpKSB0aGlzLnZhbHVlID0gVG9vbHMuaGV4VG9IdG1sKCBvLnZhbHVlICk7XHJcblx0ICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSBvLnZhbHVlO1xyXG5cdCAgICB9XHJcblxyXG5cdCAgICB0aGlzLmJjb2xvciA9IG51bGw7XHJcblx0ICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblx0ICAgIHRoaXMuZmlzdERvd24gPSBmYWxzZTtcclxuXHJcblx0ICAgIHRoaXMudHIgPSA5ODtcclxuXHQgICAgdGhpcy50c2wgPSBNYXRoLnNxcnQoMykgKiB0aGlzLnRyO1xyXG5cclxuXHQgICAgdGhpcy5odWUgPSAwO1xyXG5cdCAgICB0aGlzLmQgPSAyNTY7XHJcblxyXG5cdCAgICB0aGlzLnNldENvbG9yKCB0aGlzLnZhbHVlICk7XHJcblxyXG5cdCAgICB0aGlzLmluaXQoKTtcclxuXHJcblx0ICAgIGlmKCBvLm9wZW4gIT09IHVuZGVmaW5lZCApIHRoaXMub3BlbigpO1xyXG5cclxuXHR9XHJcblxyXG5cdHRlc3Rab25lICggbXgsIG15ICkge1xyXG5cclxuXHRcdGxldCBsID0gdGhpcy5sb2NhbDtcclxuXHRcdGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG5cclxuXHJcblx0XHRpZiggdGhpcy51cCAmJiB0aGlzLmlzT3BlbiApe1xyXG5cclxuXHRcdFx0aWYoIGwueSA+IHRoaXMud2ZpeGUgKSByZXR1cm4gJ3RpdGxlJztcclxuXHRcdCAgICBlbHNlIHJldHVybiAnY29sb3InO1xyXG5cclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiggbC55IDwgdGhpcy5iYXNlSCsyICkgcmV0dXJuICd0aXRsZSc7XHJcblx0ICAgIFx0ZWxzZSBpZiggdGhpcy5pc09wZW4gKSByZXR1cm4gJ2NvbG9yJztcclxuXHJcblxyXG5cdFx0fVxyXG5cclxuICAgIH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0bW91c2V1cCAoIGUgKSB7XHJcblxyXG5cdCAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cdCAgICB0aGlzLmQgPSAyNTY7XHJcblxyXG5cdH1cclxuXHJcblx0bW91c2Vkb3duICggZSApIHtcclxuXHJcblxyXG5cdFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlLmNsaWVudFgsIGUuY2xpZW50WSApO1xyXG5cclxuXHJcblx0XHQvL2lmKCAhbmFtZSApIHJldHVybjtcclxuXHRcdGlmKG5hbWUgPT09ICd0aXRsZScpe1xyXG5cdFx0XHRpZiggIXRoaXMuaXNPcGVuICkgdGhpcy5vcGVuKCk7XHJcblx0ICAgICAgICBlbHNlIHRoaXMuY2xvc2UoKTtcclxuXHQgICAgICAgIHJldHVybiB0cnVlO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRpZiggbmFtZSA9PT0gJ2NvbG9yJyApe1xyXG5cclxuXHRcdFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG5cdFx0XHR0aGlzLmZpc3REb3duID0gdHJ1ZVxyXG5cdFx0XHR0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0bW91c2Vtb3ZlICggZSApIHtcclxuXHJcblx0ICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZS5jbGllbnRYLCBlLmNsaWVudFkgKTtcclxuXHJcblx0ICAgIGxldCBvZmYsIGQsIGh1ZSwgc2F0LCBsdW0sIHJhZCwgeCwgeSwgcnIsIFQgPSBUb29scztcclxuXHJcblx0ICAgIGlmKCBuYW1lID09PSAndGl0bGUnICkgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcblx0ICAgIGlmKCBuYW1lID09PSAnY29sb3InICl7XHJcblxyXG5cdCAgICBcdG9mZiA9IHRoaXMub2Zmc2V0O1xyXG5cdFx0ICAgIG9mZi54ID0gZS5jbGllbnRYIC0gKCB0aGlzLnpvbmUueCArIHRoaXMuZGVjYWwueCArIHRoaXMubWlkICk7XHJcblx0XHQgICAgb2ZmLnkgPSBlLmNsaWVudFkgLSAoIHRoaXMuem9uZS55ICsgdGhpcy5kZWNhbC55ICsgdGhpcy5taWQgKTtcclxuXHRcdFx0ZCA9IG9mZi5sZW5ndGgoKSAqIHRoaXMucmF0aW87XHJcblx0XHRcdHJyID0gb2ZmLmFuZ2xlKCk7XHJcblx0XHRcdGlmKHJyIDwgMCkgcnIgKz0gMiAqIFQuUEk7XHJcblx0XHRcdFx0XHRcdFxyXG5cclxuXHQgICAgXHRpZiAoIGQgPCAxMjggKSB0aGlzLmN1cnNvcignY3Jvc3NoYWlyJyk7XHJcblx0ICAgIFx0ZWxzZSBpZiggIXRoaXMuaXNEb3duICkgdGhpcy5jdXJzb3IoKVxyXG5cclxuXHQgICAgXHRpZiggdGhpcy5pc0Rvd24gKXtcclxuXHJcblx0XHRcdCAgICBpZiggdGhpcy5maXN0RG93biApe1xyXG5cdFx0XHQgICAgXHR0aGlzLmQgPSBkO1xyXG5cdFx0XHQgICAgXHR0aGlzLmZpc3REb3duID0gZmFsc2U7XHJcblx0XHRcdCAgICB9XHJcblxyXG5cdFx0XHQgICAgaWYgKCB0aGlzLmQgPCAxMjggKSB7XHJcblxyXG5cdFx0XHRcdCAgICBpZiAoIHRoaXMuZCA+IHRoaXMudHIgKSB7IC8vIG91dHNpZGUgaHVlXHJcblxyXG5cdFx0XHRcdCAgICAgICAgaHVlID0gKCByciArIFQucGk5MCApIC8gVC5Ud29QSTtcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuaHVlID0gKGh1ZSArIDEpICUgMTtcclxuXHRcdFx0XHQgICAgICAgIHRoaXMuc2V0SFNMKFsoaHVlICsgMSkgJSAxLCB0aGlzLmhzbFsxXSwgdGhpcy5oc2xbMl1dKTtcclxuXHJcblx0XHRcdFx0ICAgIH0gZWxzZSB7IC8vIHRyaWFuZ2xlXHJcblxyXG5cdFx0XHRcdCAgICBcdHggPSBvZmYueCAqIHRoaXMucmF0aW87XHJcblx0XHRcdFx0ICAgIFx0eSA9IG9mZi55ICogdGhpcy5yYXRpbztcclxuXHJcblx0XHRcdFx0ICAgIFx0bGV0IHJyID0gKHRoaXMuaHVlICogVC5Ud29QSSkgKyBULlBJO1xyXG5cdFx0XHRcdCAgICBcdGlmKHJyIDwgMCkgcnIgKz0gMiAqIFQuUEk7XHJcblxyXG5cdFx0XHRcdCAgICBcdHJhZCA9IE1hdGguYXRhbjIoLXksIHgpO1xyXG5cdFx0XHRcdCAgICBcdGlmKHJhZCA8IDApIHJhZCArPSAyICogVC5QSTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0ICAgIFx0bGV0IHJhZDAgPSAoIHJhZCArIFQucGk5MCArIFQuVHdvUEkgKyByciApICUgKFQuVHdvUEkpLFxyXG5cdFx0XHRcdCAgICBcdHJhZDEgPSByYWQwICUgKCgyLzMpICogVC5QSSkgLSAoVC5waTYwKSxcclxuXHRcdFx0XHQgICAgXHRhICAgID0gMC41ICogdGhpcy50cixcclxuXHRcdFx0XHQgICAgXHRiICAgID0gTWF0aC50YW4ocmFkMSkgKiBhLFxyXG5cdFx0XHRcdCAgICBcdHIgICAgPSBNYXRoLnNxcnQoeCp4ICsgeSp5KSxcclxuXHRcdFx0XHQgICAgXHRtYXhSID0gTWF0aC5zcXJ0KGEqYSArIGIqYik7XHJcblxyXG5cdFx0XHRcdCAgICBcdGlmKCByID4gbWF4UiApIHtcclxuXHRcdFx0XHRcdFx0XHRsZXQgZHggPSBNYXRoLnRhbihyYWQxKSAqIHI7XHJcblx0XHRcdFx0XHRcdFx0bGV0IHJhZDIgPSBNYXRoLmF0YW4oZHggLyBtYXhSKTtcclxuXHRcdFx0XHRcdFx0XHRpZihyYWQyID4gVC5waTYwKSAgcmFkMiA9IFQucGk2MDtcclxuXHRcdFx0XHRcdFx0ICAgIGVsc2UgaWYoIHJhZDIgPCAtVC5waTYwICkgcmFkMiA9IC1ULnBpNjA7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRcdHJhZCArPSByYWQyIC0gcmFkMTtcclxuXHJcblx0XHRcdFx0XHRcdFx0cmFkMCA9IChyYWQgKyBULnBpOTAgICsgVC5Ud29QSSArIHJyKSAlIChULlR3b1BJKSxcclxuXHRcdFx0XHRcdFx0XHRyYWQxID0gcmFkMCAlICgoMi8zKSAqIFQuUEkpIC0gKFQucGk2MCk7XHJcblx0XHRcdFx0XHRcdFx0YiA9IE1hdGgudGFuKHJhZDEpICogYTtcclxuXHRcdFx0XHRcdFx0XHRyID0gbWF4UiA9IE1hdGguc3FydChhKmEgKyBiKmIpO1xyXG5cdFx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0XHRsdW0gPSAoKE1hdGguc2luKHJhZDApICogcikgLyB0aGlzLnRzbCkgKyAwLjU7XHJcblx0XHRcdFx0XHJcblx0XHRcdFx0XHRcdGxldCB3ID0gMSAtIChNYXRoLmFicyhsdW0gLSAwLjUpICogMik7XHJcblx0XHRcdFx0XHRcdHNhdCA9ICgoKE1hdGguY29zKHJhZDApICogcikgKyAodGhpcy50ciAvIDIpKSAvICgxLjUgKiB0aGlzLnRyKSkgLyB3O1xyXG5cdFx0XHRcdFx0XHRzYXQgPSBULmNsYW1wKCBzYXQsIDAsIDEgKTtcclxuXHRcdFx0XHRcdFx0XHJcblx0XHRcdFx0ICAgICAgICB0aGlzLnNldEhTTChbdGhpcy5oc2xbMF0sIHNhdCwgbHVtXSk7XHJcblxyXG5cdFx0XHRcdCAgICB9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdH1cclxuXHJcblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHRzZXRIZWlnaHQgKCkge1xyXG5cclxuXHRcdHRoaXMuaCA9IHRoaXMuaXNPcGVuID8gdGhpcy53Zml4ZSArIHRoaXMuYmFzZUggKyA1IDogdGhpcy5iYXNlSDtcclxuXHRcdHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cdFx0dGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG5cdH1cclxuXHJcblx0cGFyZW50SGVpZ2h0ICggdCApIHtcclxuXHJcblx0XHRpZiAoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKSB0aGlzLnBhcmVudEdyb3VwLmNhbGMoIHQgKTtcclxuXHQgICAgZWxzZSBpZiAoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB0ICk7XHJcblxyXG5cdH1cclxuXHJcblx0b3BlbiAoKSB7XHJcblxyXG5cdFx0c3VwZXIub3BlbigpO1xyXG5cclxuXHRcdHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG5cdFx0aWYoIHRoaXMudXAgKSB0aGlzLnpvbmUueSAtPSB0aGlzLndmaXhlICsgNTtcclxuXHJcblx0XHRsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG5cdCAgICB0aGlzLnNbM10udmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcclxuXHQgICAgLy90aGlzLnNbM10uZGlzcGxheSA9ICdibG9jayc7XHJcblx0ICAgIHRoaXMucGFyZW50SGVpZ2h0KCB0ICk7XHJcblxyXG5cdH1cclxuXHJcblx0Y2xvc2UgKCkge1xyXG5cclxuXHRcdHN1cGVyLmNsb3NlKCk7XHJcblxyXG5cdFx0aWYoIHRoaXMudXAgKSB0aGlzLnpvbmUueSArPSB0aGlzLndmaXhlICsgNTtcclxuXHJcblx0XHRsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG5cdFx0dGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcblx0ICAgIHRoaXMuc1szXS52aXNpYmlsaXR5ICA9ICdoaWRkZW4nO1xyXG5cdCAgICAvL3RoaXMuc1szXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG5cdCAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcblx0fVxyXG5cclxuXHR1cGRhdGUgKCB1cCApIHtcclxuXHJcblx0ICAgIGxldCBjYyA9IFRvb2xzLnJnYlRvSGV4KCBUb29scy5oc2xUb1JnYihbIHRoaXMuaHNsWzBdLCAxLCAwLjUgXSkgKTtcclxuXHJcblx0ICAgIHRoaXMubW92ZU1hcmtlcnMoKTtcclxuXHQgICAgXHJcblx0ICAgIHRoaXMudmFsdWUgPSB0aGlzLmJjb2xvcjtcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgY2MsIDIsIDAgKTtcclxuXHJcblxyXG5cdCAgICB0aGlzLnNbMl0uYmFja2dyb3VuZCA9IHRoaXMuYmNvbG9yO1xyXG5cdCAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSBUb29scy5odG1sVG9IZXgoIHRoaXMuYmNvbG9yICk7XHJcblxyXG5cdCAgICB0aGlzLmludmVydCA9IFRvb2xzLmZpbmREZWVwSW52ZXIoIHRoaXMucmdiICk7XHJcblx0ICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnO1xyXG5cclxuXHQgICAgaWYoIXVwKSByZXR1cm47XHJcblxyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ2FycmF5JyApIHRoaXMuc2VuZCggdGhpcy5yZ2IgKTtcclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdyZ2InICkgdGhpcy5zZW5kKCBUb29scy5odG1sUmdiKCB0aGlzLnJnYiApICk7XHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAnaGV4JyApIHRoaXMuc2VuZCggVG9vbHMuaHRtbFRvSGV4KCB0aGlzLnZhbHVlICkgKTtcclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdodG1sJyApIHRoaXMuc2VuZCgpO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldENvbG9yICggY29sb3IgKSB7XHJcblxyXG5cdCAgICBsZXQgdW5wYWNrID0gVG9vbHMudW5wYWNrKGNvbG9yKTtcclxuXHQgICAgaWYgKHRoaXMuYmNvbG9yICE9IGNvbG9yICYmIHVucGFjaykge1xyXG5cclxuXHQgICAgICAgIHRoaXMuYmNvbG9yID0gY29sb3I7XHJcblx0ICAgICAgICB0aGlzLnJnYiA9IHVucGFjaztcclxuXHQgICAgICAgIHRoaXMuaHNsID0gVG9vbHMucmdiVG9Ic2woIHRoaXMucmdiICk7XHJcblxyXG5cdCAgICAgICAgdGhpcy5odWUgPSB0aGlzLmhzbFswXTtcclxuXHJcblx0ICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cdCAgICB9XHJcblx0ICAgIHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdHNldEhTTCAoIGhzbCApIHtcclxuXHJcblx0ICAgIHRoaXMuaHNsID0gaHNsO1xyXG5cdCAgICB0aGlzLnJnYiA9IFRvb2xzLmhzbFRvUmdiKCBoc2wgKTtcclxuXHQgICAgdGhpcy5iY29sb3IgPSBUb29scy5yZ2JUb0hleCggdGhpcy5yZ2IgKTtcclxuXHQgICAgdGhpcy51cGRhdGUoIHRydWUgKTtcclxuXHQgICAgcmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bW92ZU1hcmtlcnMgKCkge1xyXG5cclxuXHRcdGxldCBwID0gdGhpcy5wO1xyXG5cdFx0bGV0IFQgPSBUb29scztcclxuXHJcblx0ICAgIGxldCBjMSA9IHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnO1xyXG5cdCAgICBsZXQgYSA9IHRoaXMuaHNsWzBdICogVC5Ud29QSTtcclxuXHQgICAgbGV0IHRoaXJkID0gKDIvMykgKiBULlBJO1xyXG5cdCAgICBsZXQgciA9IHRoaXMudHI7XHJcblx0ICAgIGxldCBoID0gdGhpcy5oc2xbMF07XHJcblx0ICAgIGxldCBzID0gdGhpcy5oc2xbMV07XHJcblx0ICAgIGxldCBsID0gdGhpcy5oc2xbMl07XHJcblxyXG5cdCAgICBsZXQgYW5nbGUgPSAoIGEgLSBULnBpOTAgKSAqIFQudG9kZWc7XHJcblxyXG5cdCAgICBoID0gLSBhICsgVC5waTkwO1xyXG5cclxuXHRcdGxldCBoeCA9IE1hdGguY29zKGgpICogcjtcclxuXHRcdGxldCBoeSA9IC1NYXRoLnNpbihoKSAqIHI7XHJcblx0XHRsZXQgc3ggPSBNYXRoLmNvcyhoIC0gdGhpcmQpICogcjtcclxuXHRcdGxldCBzeSA9IC1NYXRoLnNpbihoIC0gdGhpcmQpICogcjtcclxuXHRcdGxldCB2eCA9IE1hdGguY29zKGggKyB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IHZ5ID0gLU1hdGguc2luKGggKyB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IG14ID0gKHN4ICsgdngpIC8gMiwgbXkgPSAoc3kgKyB2eSkgLyAyO1xyXG5cdFx0YSAgPSAoMSAtIDIgKiBNYXRoLmFicyhsIC0gLjUpKSAqIHM7XHJcblx0XHRsZXQgeCA9IHN4ICsgKHZ4IC0gc3gpICogbCArIChoeCAtIG14KSAqIGE7XHJcblx0XHRsZXQgeSA9IHN5ICsgKHZ5IC0gc3kpICogbCArIChoeSAtIG15KSAqIGE7XHJcblxyXG5cdCAgICBwLnNldCggeCwgeSApLmFkZFNjYWxhcigxMjgpO1xyXG5cclxuXHQgICAgLy9sZXQgZmYgPSAoMS1sKSoyNTU7XHJcblx0ICAgIC8vIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiKCcrZmYrJywnK2ZmKycsJytmZisnKScsIDMgKTtcclxuXHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd0cmFuc2Zvcm0nLCAncm90YXRlKCcrYW5nbGUrJyApJywgMiApO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgcC54LCAzICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHAueSwgMyApO1xyXG5cdCAgICBcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnLCAyLCAzICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmludmVydCA/ICcjZmZmJyA6ICcjMDAwJywgMyApO1xyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsdGhpcy5iY29sb3IsIDMgKTtcclxuXHJcblx0fVxyXG5cclxuXHRyU2l6ZSAoKSB7XHJcblxyXG5cdCAgICAvL1Byb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblx0ICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG5cdCAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcblx0ICAgIHNbMl0ud2lkdGggPSB0aGlzLnNiICsgJ3B4JztcclxuXHQgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcblxyXG5cdCAgICB0aGlzLmRlY2FsLnggPSBNYXRoLmZsb29yKCh0aGlzLncgLSB0aGlzLndmaXhlKSAqIDAuNSk7XHJcblx0ICAgIHRoaXMuZGVjYWwueSA9IHRoaXMuc2lkZSA9PT0gJ3VwJyA/IDIgOiB0aGlzLmJhc2VIICsgMjtcclxuXHQgICAgdGhpcy5taWQgPSBNYXRoLmZsb29yKCB0aGlzLndmaXhlICogMC41ICk7XHJcblxyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy53Zml4ZSsnICcrdGhpcy53Zml4ZSApO1xyXG5cdCAgICBzWzNdLndpZHRoID0gdGhpcy53Zml4ZSArICdweCc7XHJcblx0ICAgIHNbM10uaGVpZ2h0ID0gdGhpcy53Zml4ZSArICdweCc7XHJcbiAgICBcdHNbM10ubGVmdCA9IHRoaXMuZGVjYWwueCArICdweCc7XHJcblx0ICAgIHNbM10udG9wID0gdGhpcy5kZWNhbC55ICsgJ3B4JztcclxuXHJcblx0ICAgIHRoaXMucmF0aW8gPSAyNTYvdGhpcy53Zml4ZTtcclxuXHQgICAgdGhpcy5zcXVhcmUgPSAxIC8gKDYwKih0aGlzLndmaXhlLzI1NikpO1xyXG5cdCAgICBcclxuXHQgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHQgICAgXHJcblx0fVxyXG5cclxufSIsImltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi4vY29yZS9Sb290cyc7XHJcbmltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgRnBzIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMucm91bmQgPSBNYXRoLnJvdW5kO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9IZWlnaHQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG4gICAgICAgIHRoaXMuaHBsdXMgPSBvLmhwbHVzIHx8IDUwO1xyXG5cclxuICAgICAgICB0aGlzLnJlcyA9IG8ucmVzIHx8IDQwO1xyXG4gICAgICAgIHRoaXMubCA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMucHJlY2lzaW9uID0gby5wcmVjaXNpb24gfHwgMDtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5jdXN0b20gPSBvLmN1c3RvbSB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLm5hbWVzID0gby5uYW1lcyB8fCBbJ0ZQUycsICdNUyddO1xyXG4gICAgICAgIGxldCBjYyA9IG8uY2MgfHwgWyc5MCw5MCw5MCcsICcyNTUsMjU1LDAnXTtcclxuXHJcbiAgICAgICAvLyB0aGlzLmRpdmlkID0gWyAxMDAsIDEwMCwgMTAwIF07XHJcbiAgICAgICAvLyB0aGlzLm11bHR5ID0gWyAzMCwgMzAsIDMwIF07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkaW5nID0gby5hZGRpbmcgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMucmFuZ2UgPSBvLnJhbmdlIHx8IFsgMTY1LCAxMDAsIDEwMCBdO1xyXG5cclxuICAgICAgICB0aGlzLmFscGhhID0gby5hbHBoYSB8fCAwLjI1O1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XHJcbiAgICAgICAgdGhpcy50ZXh0RGlzcGxheSA9IFtdO1xyXG5cclxuICAgICAgICBpZighdGhpcy5jdXN0b20pe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ub3cgPSAoIHNlbGYucGVyZm9ybWFuY2UgJiYgc2VsZi5wZXJmb3JtYW5jZS5ub3cgKSA/IHNlbGYucGVyZm9ybWFuY2Uubm93LmJpbmQoIHBlcmZvcm1hbmNlICkgOiBEYXRlLm5vdztcclxuICAgICAgICAgICAgdGhpcy5zdGFydFRpbWUgPSAwOy8vdGhpcy5ub3coKVxyXG4gICAgICAgICAgICB0aGlzLnByZXZUaW1lID0gMDsvL3RoaXMuc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lcyA9IDA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1zID0gMDtcclxuICAgICAgICAgICAgdGhpcy5mcHMgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLm1lbSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubW0gPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc01lbSA9ICggc2VsZi5wZXJmb3JtYW5jZSAmJiBzZWxmLnBlcmZvcm1hbmNlLm1lbW9yeSApID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAvLyB0aGlzLmRpdmlkID0gWyAxMDAsIDIwMCwgMSBdO1xyXG4gICAgICAgICAgIC8vIHRoaXMubXVsdHkgPSBbIDMwLCAzMCwgMzAgXTtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzTWVtICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5uYW1lcy5wdXNoKCdNRU0nKTtcclxuICAgICAgICAgICAgICAgIGNjLnB1c2goJzAsMjU1LDI1NScpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy50eHQgPSAnRlBTJ1xyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTY7XHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHRoaXMudHh0O1xyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XHJcblxyXG4gICAgICAgIGxldCBwYW5lbENzcyA9ICdkaXNwbGF5Om5vbmU7IGxlZnQ6MTBweDsgdG9wOicrIHRoaXMuaCArICdweDsgaGVpZ2h0OicrKHRoaXMuaHBsdXMgLSA4KSsncHg7IGJveC1zaXppbmc6Ym9yZGVyLWJveDsgYmFja2dyb3VuZDogcmdiYSgwLCAwLCAwLCAwLjIpOyBib3JkZXI6JyArICh0aGlzLmNvbG9ycy5ncm91cEJvcmRlciAhPT0gJ25vbmUnPyB0aGlzLmNvbG9ycy5ncm91cEJvcmRlcisnOycgOiAnMXB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTsnKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucmFkaXVzICE9PSAwICkgcGFuZWxDc3MgKz0gJ2JvcmRlci1yYWRpdXM6JyArIHRoaXMucmFkaXVzKydweDsnOyBcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyBwYW5lbENzcyAsIHt9ICk7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy5yZXMrJyA1MCcgKTtcclxuICAgICAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCdoZWlnaHQnLCAnMTAwJScgKTtcclxuICAgICAgICB0aGlzLmNbMl0uc2V0QXR0cmlidXRlKCd3aWR0aCcsICcxMDAlJyApO1xyXG4gICAgICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCAnbm9uZScgKTtcclxuXHJcblxyXG4gICAgICAgIC8vdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKDI1NSwyNTUsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOicjRkYwJywgJ3ZlY3Rvci1lZmZlY3QnOidub24tc2NhbGluZy1zdHJva2UnIH0sIHRoaXMuY1syXSApO1xyXG4gICAgICAgIC8vdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKDAsMjU1LDI1NSwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOicjMEZGJywgJ3ZlY3Rvci1lZmZlY3QnOidub24tc2NhbGluZy1zdHJva2UnIH0sIHRoaXMuY1syXSApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIGFycm93XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjEwcHg7IGhlaWdodDoxMHB4OyBsZWZ0OjRweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuYXJyb3csIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuXHJcbiAgICAgICAgLy8gcmVzdWx0IHRlc3RcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICdwb3NpdGlvbjphYnNvbHV0ZTsgbGVmdDoxMHB4OyB0b3A6JysodGhpcy5oKzIpICsncHg7IGRpc3BsYXk6bm9uZTsgd2lkdGg6MTAwJTsgdGV4dC1hbGlnbjpjZW50ZXI7JyApO1xyXG5cclxuICAgICAgICAvLyBib3R0b20gbGluZVxyXG4gICAgICAgIGlmKCBvLmJvdHRvbUxpbmUgKSB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IGJvdHRvbTowcHg7IGhlaWdodDoxcHg7IGJhY2tncm91bmQ6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTsnKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1Nob3cgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHNbMV0ubWFyZ2luTGVmdCA9ICcxMHB4JztcclxuICAgICAgICBzWzFdLmxpbmVIZWlnaHQgPSB0aGlzLmgtNDtcclxuICAgICAgICBzWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgc1sxXS5mb250V2VpZ2h0ID0gJ2JvbGQnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5yYWRpdXMgIT09IDAgKSAgc1swXS5ib3JkZXJSYWRpdXMgPSB0aGlzLnJhZGl1cysncHgnOyBcclxuICAgICAgICBzWzBdLmJvcmRlciA9IHRoaXMuY29sb3JzLmdyb3VwQm9yZGVyO1xyXG5cclxuXHJcblxyXG5cclxuICAgICAgICBsZXQgaiA9IDA7XHJcblxyXG4gICAgICAgIGZvciggaj0wOyBqPHRoaXMubmFtZXMubGVuZ3RoOyBqKysgKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBiYXNlID0gW107XHJcbiAgICAgICAgICAgIGxldCBpID0gdGhpcy5yZXMrMTtcclxuICAgICAgICAgICAgd2hpbGUoIGktLSApIGJhc2UucHVzaCg1MCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnJhbmdlW2pdID0gKCAxIC8gdGhpcy5yYW5nZVtqXSApICogNDk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnBvaW50cy5wdXNoKCBiYXNlICk7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzLnB1c2goMCk7XHJcbiAgICAgICAgICAgLy8gIHRoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgnK2NjW2pdKycsMC41KScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZToncmdiYSgnK2NjW2pdKycsMSknLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAgICAgICAgIHRoaXMudGV4dERpc3BsYXkucHVzaCggXCI8c3BhbiBzdHlsZT0nY29sb3I6cmdiKFwiK2NjW2pdK1wiKSc+IFwiICsgdGhpcy5uYW1lc1tqXSArXCIgXCIpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGogPSB0aGlzLm5hbWVzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShqLS0pe1xyXG4gICAgICAgICAgICB0aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoJytjY1tqXSsnLCcrdGhpcy5hbHBoYSsnKScsICdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZToncmdiYSgnK2NjW2pdKycsMSknLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIC8vaWYoIHRoaXMuaXNTaG93ICkgdGhpcy5zaG93KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTaG93ICkgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5vcGVuKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAvKm1vZGU6IGZ1bmN0aW9uICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICAvL3NbMV0uYmFja2dyb3VuZCA9ICdub25lJztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgc1sxXS5jb2xvciA9ICcjRkZGJztcclxuICAgICAgICAgICAgICAgIC8vc1sxXS5iYWNrZ3JvdW5kID0gVUlMLlNFTEVDVDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdCAvIGRvd25cclxuICAgICAgICAgICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIC8vc1sxXS5iYWNrZ3JvdW5kID0gVUlMLlNFTEVDVERPV047XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9LCovXHJcblxyXG4gICAgdGljayAoIHYgKSB7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gdjtcclxuICAgICAgICBpZiggIXRoaXMuaXNTaG93ICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZHJhd0dyYXBoKCk7XHJcbiAgICAgICAgdGhpcy51cFRleHQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbWFrZVBhdGggKCBwb2ludCApIHtcclxuXHJcbiAgICAgICAgbGV0IHAgPSAnJztcclxuICAgICAgICBwICs9ICdNICcgKyAoLTEpICsgJyAnICsgNTA7XHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDwgdGhpcy5yZXMgKyAxOyBpICsrICkgeyBwICs9ICcgTCAnICsgaSArICcgJyArIHBvaW50W2ldOyB9XHJcbiAgICAgICAgcCArPSAnIEwgJyArICh0aGlzLnJlcyArIDEpICsgJyAnICsgNTA7XHJcbiAgICAgICAgcmV0dXJuIHA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwVGV4dCAoIHZhbCApIHtcclxuXHJcbiAgICAgICAgbGV0IHYgPSB2YWwgfHwgdGhpcy52YWx1ZXMsIHQgPSAnJztcclxuICAgICAgICBmb3IoIGxldCBqPTAsIGxuZyA9dGhpcy5uYW1lcy5sZW5ndGg7IGo8bG5nOyBqKysgKSB0ICs9IHRoaXMudGV4dERpc3BsYXlbal0gKyAodltqXSkudG9GaXhlZCh0aGlzLnByZWNpc2lvbikgKyAnPC9zcGFuPic7XHJcbiAgICAgICAgdGhpcy5jWzRdLmlubmVySFRNTCA9IHQ7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICBkcmF3R3JhcGggKCkge1xyXG5cclxuICAgICAgICBsZXQgc3ZnID0gdGhpcy5jWzJdO1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5uYW1lcy5sZW5ndGgsIHYsIG9sZCA9IDAsIG4gPSAwO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmFkZGluZyApIHYgPSAodGhpcy52YWx1ZXNbbl0rb2xkKSAqIHRoaXMucmFuZ2Vbbl07XHJcbiAgICAgICAgICAgIGVsc2UgIHYgPSAodGhpcy52YWx1ZXNbbl0gKiB0aGlzLnJhbmdlW25dKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludHNbbl0uc2hpZnQoKTtcclxuICAgICAgICAgICAgdGhpcy5wb2ludHNbbl0ucHVzaCggNTAgLSB2ICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCBzdmcsICdkJywgdGhpcy5tYWtlUGF0aCggdGhpcy5wb2ludHNbbl0gKSwgaSsxICk7XHJcbiAgICAgICAgICAgIG9sZCArPSB0aGlzLnZhbHVlc1tuXTtcclxuICAgICAgICAgICAgbisrO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG9wZW4gKCkge1xyXG5cclxuICAgICAgICBzdXBlci5vcGVuKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuaHBsdXMgKyB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMuc3Zncy5hcnJvd0Rvd24gKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKXsgdGhpcy5wYXJlbnRHcm91cC5jYWxjKCB0aGlzLmhwbHVzICk7fVxyXG4gICAgICAgIGVsc2UgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB0aGlzLmhwbHVzICk7XHJcblxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKydweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmRpc3BsYXkgPSAnYmxvY2snOyBcclxuICAgICAgICB0aGlzLnNbNF0uZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgdGhpcy5pc1Nob3cgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VzdG9tICkgUm9vdHMuYWRkTGlzdGVuKCB0aGlzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3cgKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKXsgdGhpcy5wYXJlbnRHcm91cC5jYWxjKCAtdGhpcy5ocGx1cyApO31cclxuICAgICAgICBlbHNlIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggLXRoaXMuaHBsdXMgKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc1s0XS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuaXNTaG93ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXN0b20gKSBSb290cy5yZW1vdmVMaXN0ZW4oIHRoaXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzRdLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLy8vLyBBVVRPIEZQUyAvLy8vLy9cclxuXHJcbiAgICBiZWdpbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gdGhpcy5ub3coKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBlbmQgKCkge1xyXG5cclxuICAgICAgICBsZXQgdGltZSA9IHRoaXMubm93KCk7XHJcbiAgICAgICAgdGhpcy5tcyA9IHRpbWUgLSB0aGlzLnN0YXJ0VGltZTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZXMgKys7XHJcblxyXG4gICAgICAgIGlmICggdGltZSA+IHRoaXMucHJldlRpbWUgKyAxMDAwICkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5mcHMgPSB0aGlzLnJvdW5kKCAoIHRoaXMuZnJhbWVzICogMTAwMCApIC8gKCB0aW1lIC0gdGhpcy5wcmV2VGltZSApICk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnByZXZUaW1lID0gdGltZTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZXMgPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKCB0aGlzLmlzTWVtICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBoZWFwU2l6ZSA9IHBlcmZvcm1hbmNlLm1lbW9yeS51c2VkSlNIZWFwU2l6ZTtcclxuICAgICAgICAgICAgICAgIGxldCBoZWFwU2l6ZUxpbWl0ID0gcGVyZm9ybWFuY2UubWVtb3J5LmpzSGVhcFNpemVMaW1pdDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbSA9IHRoaXMucm91bmQoIGhlYXBTaXplICogMC4wMDAwMDA5NTQgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubW0gPSBoZWFwU2l6ZSAvIGhlYXBTaXplTGltaXQ7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbIHRoaXMuZnBzLCB0aGlzLm1zICwgdGhpcy5tbSBdO1xyXG5cclxuICAgICAgICB0aGlzLmRyYXdHcmFwaCgpO1xyXG4gICAgICAgIHRoaXMudXBUZXh0KCBbIHRoaXMuZnBzLCB0aGlzLm1zLCB0aGlzLm1lbSBdICk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aW1lO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5pbmcgKCkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuY3VzdG9tICkgdGhpcy5zdGFydFRpbWUgPSB0aGlzLmVuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLnc7XHJcblxyXG4gICAgICAgIHNbMF0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzFdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gMTAgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSAody0yMCkgKyAncHgnO1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSAody0yMCkgKyAncHgnO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZXhwb3J0IGNsYXNzIEdyYXBoIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgXHR0aGlzLnZhbHVlID0gby52YWx1ZSAhPT0gdW5kZWZpbmVkID8gby52YWx1ZSA6IFswLDAsMF07XHJcbiAgICAgICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiAhPT0gdW5kZWZpbmVkID8gby5wcmVjaXNpb24gOiAyO1xyXG4gICAgICAgIHRoaXMubXVsdGlwbGljYXRvciA9IG8ubXVsdGlwbGljYXRvciB8fCAxO1xyXG4gICAgICAgIHRoaXMubmVnID0gby5uZWcgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMubGluZSA9IG8ubGluZSAhPT0gdW5kZWZpbmVkID8gIG8ubGluZSA6IHRydWU7XHJcblxyXG4gICAgICAgIC8vaWYodGhpcy5uZWcpdGhpcy5tdWx0aXBsaWNhdG9yKj0yO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IG8uYXV0b1dpZHRoICE9PSB1bmRlZmluZWQgPyBvLmF1dG9XaWR0aCA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc051bWJlciA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgMTI4ICsgMTA7XHJcbiAgICAgICAgdGhpcy5yaCA9IHRoaXMuaCAtIDEwO1xyXG4gICAgICAgIHRoaXMudG9wID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB7IC8vIHdpdGggdGl0bGVcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvL3RoaXMuY1sxXS5zdHlsZS5iYWNrZ3JvdW5kID0gJyNmZjAwMDAnO1xyXG4gICAgICAgICAgICAvL3RoaXMuY1sxXS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2ggPSB0aGlzLnJoIC0gMjg7XHJcbiAgICAgICAgdGhpcy5ndyA9IHRoaXMudyAtIDI4O1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOmNlbnRlcjsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyB3aWR0aDonK3RoaXMudysncHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgbGV0IHN2ZyA9IHRoaXMuZG9tKCAnc3ZnJywgdGhpcy5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3RoaXMudysnICcrdGhpcy5yaCwgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy5yaCwgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCBzdmcsIHsgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy5yaCwgbGVmdDowLCB0b3A6dGhpcy50b3AgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTp0aGlzLmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzoyLCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7XHJcbiAgICAgICAgdGhpcy5kb20oICdyZWN0JywgJycsIHsgeDoxMCwgeToxMCwgd2lkdGg6dGhpcy5ndys4LCBoZWlnaHQ6dGhpcy5naCs4LCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjEgLCBmaWxsOidub25lJ30sIHN2ZyApO1xyXG5cclxuICAgICAgICB0aGlzLml3ID0gKCh0aGlzLmd3LSg0Kih0aGlzLmxuZy0xKSkpL3RoaXMubG5nKTtcclxuICAgICAgICBsZXQgdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuY01vZGUgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy52ID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICBcdHRbaV0gPSBbIDE0ICsgKGkqdGhpcy5pdykgKyAoaSo0KSwgdGhpcy5pdyBdO1xyXG4gICAgICAgIFx0dFtpXVsyXSA9IHRbaV1bMF0gKyB0W2ldWzFdO1xyXG4gICAgICAgIFx0dGhpcy5jTW9kZVtpXSA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5uZWcgKSB0aGlzLnZbaV0gPSAoKDErKHRoaXMudmFsdWVbaV0gLyB0aGlzLm11bHRpcGxpY2F0b3IpKSowLjUpO1xyXG4gICAgICAgIFx0ZWxzZSB0aGlzLnZbaV0gPSB0aGlzLnZhbHVlW2ldIC8gdGhpcy5tdWx0aXBsaWNhdG9yO1xyXG5cclxuICAgICAgICBcdHRoaXMuZG9tKCAncmVjdCcsICcnLCB7IHg6dFtpXVswXSwgeToxNCwgd2lkdGg6dFtpXVsxXSwgaGVpZ2h0OjEsIGZpbGw6dGhpcy5mb250Q29sb3IsICdmaWxsLW9wYWNpdHknOjAuMyB9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRtcCA9IHQ7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gc3ZnO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMudylcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApe1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUudG9wID0gMCArJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLmhlaWdodCA9IDIwICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLnNbMV0ubGluZUhlaWdodCA9ICgyMC01KSsncHgnXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSggZmFsc2UgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU1ZHICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubGluZSApIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlUGF0aCgpLCAwICk7XHJcblxyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGk8dGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdoZWlnaHQnLCB0aGlzLnZbaV0qdGhpcy5naCwgaSsyICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd5JywgMTQgKyAodGhpcy5naCAtIHRoaXMudltpXSp0aGlzLmdoKSwgaSsyICk7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLm5lZyApIHRoaXMudmFsdWVbaV0gPSAoICgodGhpcy52W2ldKjIpLTEpICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy52YWx1ZVtpXSA9ICggKHRoaXMudltpXSAqIHRoaXMubXVsdGlwbGljYXRvcikgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIGxldCB0ID0gdGhpcy50bXA7XHJcbiAgICAgICAgXHJcblx0ICAgIGlmKCBsLnk+dGhpcy50b3AgJiYgbC55PHRoaXMuaC0yMCApe1xyXG5cdCAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cdCAgICAgICAgICAgIGlmKCBsLng+dFtpXVswXSAmJiBsLng8dFtpXVsyXSApIHJldHVybiBpO1xyXG5cdCAgICAgICAgfVxyXG5cdCAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbiwgbmFtZSApIHtcclxuXHJcbiAgICBcdGlmKCBuID09PSB0aGlzLmNNb2RlW25hbWVdICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIFx0bGV0IGE7XHJcblxyXG4gICAgICAgIHN3aXRjaChuKXtcclxuICAgICAgICAgICAgY2FzZSAwOiBhPTAuMzsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogYT0wLjY7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IGE9MTsgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsLW9wYWNpdHknLCBhLCBuYW1lICsgMiApO1xyXG4gICAgICAgIHRoaXMuY01vZGVbbmFtZV0gPSBuO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICBcdGxldCBudXAgPSBmYWxzZTtcclxuICAgICAgICAvL3RoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmNNb2RlW2ldICE9PSAwICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNNb2RlW2ldID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsLW9wYWNpdHknLCAwLjMsIGkgKyAyICk7XHJcbiAgICAgICAgICAgICAgICBudXAgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApIHJldHVybiB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICBcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICBcdGxldCBudXAgPSBmYWxzZTtcclxuXHJcbiAgICBcdGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZShlKTtcclxuXHJcbiAgICBcdGlmKCBuYW1lID09PSAnJyApe1xyXG5cclxuICAgICAgICAgICAgbnVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgICAgICAvL3RoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7IFxyXG5cclxuICAgICAgICAgICAgbnVwID0gdGhpcy5tb2RlKCB0aGlzLmlzRG93biA/IDIgOiAxLCBuYW1lICk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJzb3IoIHRoaXMuY3VycmVudCAhPT0gLTEgPyAnbW92ZScgOiAncG9pbnRlcicgKTtcclxuICAgICAgICAgICAgaWYodGhpcy5pc0Rvd24pe1xyXG4gICAgICAgICAgICBcdHRoaXMudltuYW1lXSA9IHRoaXMuY2xhbXAoIDEgLSAoKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wIC0gMTAgKSAvIHRoaXMuZ2gpICwgMCwgMSApO1xyXG4gICAgICAgICAgICBcdHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgXHR0aGlzLnVwZGF0ZVNWRygpO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbWFrZVBhdGggKCkge1xyXG5cclxuICAgIFx0bGV0IHAgPSBcIlwiLCBoLCB3LCB3biwgd20sIG93LCBvaDtcclxuICAgIFx0Ly9sZXQgZyA9IHRoaXMuaXcqMC41XHJcblxyXG4gICAgXHRmb3IobGV0IGkgPSAwOyBpPHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICBcdFx0aCA9IDE0ICsgKHRoaXMuZ2ggLSB0aGlzLnZbaV0qdGhpcy5naCk7XHJcbiAgICBcdFx0dyA9ICgxNCArIChpKnRoaXMuaXcpICsgKGkqNCkpO1xyXG5cclxuICAgIFx0XHR3bSA9IHcgKyB0aGlzLml3KjAuNTtcclxuICAgIFx0XHR3biA9IHcgKyB0aGlzLml3O1xyXG5cclxuICAgIFx0XHRpZihpPT09MCkgcCs9J00gJyt3KycgJysgaCArICcgVCAnICsgd20gKycgJysgaDtcclxuICAgIFx0XHRlbHNlIHAgKz0gJyBDICcgKyBvdyArJyAnKyBvaCArICcsJyArIHcgKycgJysgaCArICcsJyArIHdtICsnICcrIGg7XHJcbiAgICBcdFx0aWYoaSA9PT0gdGhpcy5sbmctMSkgcCs9JyBUICcgKyB3biArJyAnKyBoO1xyXG5cclxuICAgIFx0XHRvdyA9IHduXHJcbiAgICBcdFx0b2ggPSBoIFxyXG5cclxuICAgIFx0fVxyXG5cclxuICAgIFx0cmV0dXJuIHA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICkgc1sxXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcblxyXG4gICAgICAgIGxldCBndyA9IHRoaXMudyAtIDI4O1xyXG4gICAgICAgIGxldCBpdyA9ICgoZ3ctKDQqKHRoaXMubG5nLTEpKSkvdGhpcy5sbmcpO1xyXG5cclxuICAgICAgICBsZXQgdCA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHRbaV0gPSBbIDE0ICsgKGkqaXcpICsgKGkqNCksIGl3IF07XHJcbiAgICAgICAgICAgIHRbaV1bMl0gPSB0W2ldWzBdICsgdFtpXVsxXTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRtcCA9IHQ7XHJcblxyXG4gICAgfVxyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4uL2NvcmUvUm9vdHMnO1xyXG5pbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEdyb3VwIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuQUREID0gby5hZGQ7XHJcblxyXG4gICAgICAgIHRoaXMudWlzID0gW107XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b0hlaWdodCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmRlY2FsID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlSCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS02O1xyXG5cclxuICAgICAgICB0aGlzLmlzTGluZSA9IG8ubGluZSAhPT0gdW5kZWZpbmVkID8gby5saW5lIDogZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgbGVmdDowOyBoZWlnaHQ6YXV0bzsgb3ZlcmZsb3c6aGlkZGVuOyB0b3A6Jyt0aGlzLmgrJ3B4Jyk7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjEwcHg7IGhlaWdodDoxMHB4OyBsZWZ0OjA7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmdyb3VwLCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjEwcHg7IGhlaWdodDoxMHB4OyBsZWZ0OjRweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuYXJyb3csIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuICAgICAgICAvLyBib3R0b20gbGluZVxyXG4gICAgICAgIGlmKHRoaXMuaXNMaW5lKSB0aGlzLmNbNV0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgICdiYWNrZ3JvdW5kOnJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yKTsgd2lkdGg6MTAwJTsgbGVmdDowOyBoZWlnaHQ6MXB4OyBib3R0b206MHB4Jyk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgc1sxXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1sxXS5uYW1lID0gJ2dyb3VwJztcclxuXHJcbiAgICAgICAgc1sxXS5tYXJnaW5MZWZ0ID0gJzEwcHgnO1xyXG4gICAgICAgIHNbMV0ubGluZUhlaWdodCA9IHRoaXMuaC00O1xyXG4gICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICBzWzFdLmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApIHNbMF0uYm9yZGVyUmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4JzsgXHJcbiAgICAgICAgc1swXS5ib3JkZXIgPSB0aGlzLmNvbG9ycy5ncm91cEJvcmRlcjtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIGlmKCBvLmJnICE9PSB1bmRlZmluZWQgKSB0aGlzLnNldEJHKG8uYmcpO1xyXG4gICAgICAgIGlmKCBvLm9wZW4gIT09IHVuZGVmaW5lZCApIHRoaXMub3BlbigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9ICcnO1xyXG5cclxuICAgICAgICBpZiggbC55IDwgdGhpcy5iYXNlSCApIG5hbWUgPSAndGl0bGUnO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW4gKSBuYW1lID0gJ2NvbnRlbnQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5hbWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyVGFyZ2V0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCA9PT0gLTEgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgLy8gaWYoIXRoaXMudGFyZ2V0KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50YXJnZXQudWlvdXQoKTtcclxuICAgICAgICB0aGlzLnRhcmdldC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBoYW5kbGVFdmVudCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB0eXBlID0gZS50eXBlO1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHRhcmdldENoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2NvbnRlbnQnOlxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICAgICAgaWYoIFJvb3RzLmlzTW9iaWxlICYmIHR5cGUgPT09ICdtb3VzZWRvd24nICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnRhcmdldCApIHRhcmdldENoYW5nZSA9IHRoaXMudGFyZ2V0LmhhbmRsZUV2ZW50KCBlICk7XHJcblxyXG4gICAgICAgICAgICAvL2lmKCB0eXBlID09PSAnbW91c2Vtb3ZlJyApIGNoYW5nZSA9IHRoaXMuc3R5bGVzKCdkZWYnKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhUm9vdHMubG9jayApIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAndGl0bGUnOlxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICBpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKXtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgaWYoIHRhcmdldENoYW5nZSApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldE5leHQgKCBlLCBjaGFuZ2UgKSB7XHJcblxyXG4gICAgICAgIGxldCBuZXh0ID0gUm9vdHMuZmluZFRhcmdldCggdGhpcy51aXMsIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IHRoaXMuY3VycmVudCApe1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gLTEgKXsgXHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy51aXNbIHRoaXMuY3VycmVudCBdO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC51aW92ZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjYWxjSCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBsbmcgPSB0aGlzLnVpcy5sZW5ndGgsIGksIHUsICBoPTAsIHB4PTAsIHRtcGg9MDtcclxuICAgICAgICBmb3IoIGkgPSAwOyBpIDwgbG5nOyBpKyspe1xyXG4gICAgICAgICAgICB1ID0gdGhpcy51aXNbaV07XHJcbiAgICAgICAgICAgIGlmKCAhdS5hdXRvV2lkdGggKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihweD09PTApIGggKz0gdS5oKzE7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZih0bXBoPHUuaCkgaCArPSB1LmgtdG1waDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRtcGggPSB1Lmg7XHJcblxyXG4gICAgICAgICAgICAgICAgLy90bXBoID0gdG1waCA8IHUuaCA/IHUuaCA6IHRtcGg7XHJcbiAgICAgICAgICAgICAgICBweCArPSB1Lnc7XHJcbiAgICAgICAgICAgICAgICBpZiggcHgrdS53ID4gdGhpcy53ICkgcHggPSAwO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGggKz0gdS5oKzE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaDtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjVWlzICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHJldHVybjtcclxuXHJcbiAgICAgICAgUm9vdHMuY2FsY1VpcyggdGhpcy51aXMsIHRoaXMuem9uZSwgdGhpcy56b25lLnkgKyB0aGlzLmJhc2VIICk7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzZXRCRyAoIGMgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gYztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uc2V0QkcoIGMgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGFkZCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIGFbMV0gPT09ICdvYmplY3QnICl7IFxyXG4gICAgICAgICAgICBhWzFdLmlzVUkgPSB0aGlzLmlzVUk7XHJcbiAgICAgICAgICAgIGFbMV0udGFyZ2V0ID0gdGhpcy5jWzJdO1xyXG4gICAgICAgICAgICBhWzFdLm1haW4gPSB0aGlzLm1haW47XHJcbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnc3RyaW5nJyApe1xyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKGEsIHsgaXNVSTp0cnVlLCB0YXJnZXQ6dGhpcy5jWzJdLCBtYWluOnRoaXMubWFpbiB9KTtcclxuICAgICAgICAgICAgZWxzZXsgXHJcbiAgICAgICAgICAgICAgICBhWzJdLmlzVUkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYVsyXS50YXJnZXQgPSB0aGlzLmNbMl07XHJcbiAgICAgICAgICAgICAgICBhWzJdLm1haW4gPSB0aGlzLm1haW47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vbGV0IG4gPSBhZGQuYXBwbHkoIHRoaXMsIGEgKTtcclxuICAgICAgICBsZXQgbiA9IHRoaXMuQURELmFwcGx5KCB0aGlzLCBhICk7XHJcbiAgICAgICAgdGhpcy51aXMucHVzaCggbiApO1xyXG5cclxuICAgICAgICBpZiggbi5hdXRvSGVpZ2h0ICkgbi5wYXJlbnRHcm91cCA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiBuO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwYXJlbnRIZWlnaHQgKCB0ICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKSB0aGlzLnBhcmVudEdyb3VwLmNhbGMoIHQgKTtcclxuICAgICAgICBlbHNlIGlmICggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgb3BlbiAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLm9wZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3dEb3duICk7XHJcbiAgICAgICAgdGhpcy5yU2l6ZUNvbnRlbnQoKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEhlaWdodCggdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIGxldCB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1s0XSwgJ2QnLCB0aGlzLnN2Z3MuYXJyb3cgKTtcclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNsZWFyR3JvdXAoKTtcclxuICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIC0odGhpcy5oICsxICkpO1xyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5jbGVhci5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyR3JvdXAgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudWlzLnBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVpcyA9IFtdO1xyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNhbGMgKCB5ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNPcGVuICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiggeSAhPT0gdW5kZWZpbmVkICl7IFxyXG4gICAgICAgICAgICB0aGlzLmggKz0geTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCB5ICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oID0gdGhpcy5jYWxjSCgpICsgdGhpcy5iYXNlSDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcblxyXG4gICAgICAgIC8vaWYodGhpcy5pc09wZW4pIHRoaXMuY2FsY1VpcygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZUNvbnRlbnQgKCkge1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5zZXRTaXplKCB0aGlzLncgKTtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uclNpemUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHNbM10ubGVmdCA9ICggdGhpcy5zYSArIHRoaXMuc2IgLSAxNyApICsgJ3B4JztcclxuICAgICAgICBzWzFdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNPcGVuICkgdGhpcy5yU2l6ZUNvbnRlbnQoKTtcclxuXHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5Hcm91cC5wcm90b3R5cGUuaXNHcm91cCA9IHRydWU7IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBKb3lzdGljayBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gWzAsMF07XHJcblxyXG4gICAgICAgIHRoaXMuam95VHlwZSA9ICdhbmFsb2dpcXVlJztcclxuICAgICAgICB0aGlzLm1vZGVsID0gby5tb2RlICE9PSB1bmRlZmluZWQgPyBvLm1vZGUgOiAwO1xyXG5cclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uIHx8IDI7XHJcbiAgICAgICAgdGhpcy5tdWx0aXBsaWNhdG9yID0gby5tdWx0aXBsaWNhdG9yIHx8IDE7XHJcblxyXG4gICAgICAgIHRoaXMucG9zID0gbmV3IFYyKCk7XHJcbiAgICAgICAgdGhpcy50bXAgPSBuZXcgVjIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gdGhpcy53ICogMC41O1xyXG4gICAgICAgIHRoaXMuZGlzdGFuY2UgPSB0aGlzLnJhZGl1cyowLjI1O1xyXG5cclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgdGhpcy53ICsgMTA7XHJcbiAgICAgICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHsgLy8gd2l0aCB0aXRsZVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUudGV4dEFsaWduID0gJ2NlbnRlcic7XHJcbiAgICAgICAgICAgIHRoaXMudG9wID0gMTA7XHJcbiAgICAgICAgICAgIHRoaXMuaCArPSAxMDtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOmNlbnRlcjsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyB3aWR0aDonK3RoaXMudysncHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRKb3lzdGljayggdGhpcy5tb2RlbCApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnK3RoaXMudysnICcrdGhpcy53ICk7XHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHRoaXMuY1szXSwgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLncsIGxlZnQ6MCwgdG9wOnRoaXMudG9wIH0pO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5yYXRpbyA9IDEyOC90aGlzLnc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZShmYWxzZSk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm1vZGVsPT09MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAndXJsKCNncmFkSW4pJywgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAnIzAwMCcsIDQgKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2JhKDEwMCwxMDAsMTAwLDAuMjUpJywgMiApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2IoMCwwLDAsMC4xKScsIDMgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJyM2NjYnLCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAnbm9uZScsIDQgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBpZih0aGlzLm1vZGVsPT09MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAndXJsKCNncmFkSW4yKScsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYmEoMCwwLDAsMCknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiYSg0OCwxMzgsMjU1LDAuMjUpJywgMiApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2IoMCwwLDAsMC4zKScsIDMgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5jb2xvcnMuc2VsZWN0LCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLCAncmdiYSg0OCwxMzgsMjU1LDAuMjUpJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhZGRJbnRlcnZhbCAoKXtcclxuICAgICAgICBpZiggdGhpcy5pbnRlcnZhbCAhPT0gbnVsbCApIHRoaXMuc3RvcEludGVydmFsKCk7XHJcbiAgICAgICAgaWYoIHRoaXMucG9zLmlzWmVybygpICkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCggZnVuY3Rpb24oKXsgdGhpcy51cGRhdGUoKTsgfS5iaW5kKHRoaXMpLCAxMCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzdG9wSW50ZXJ2YWwgKCl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoIHRoaXMuaW50ZXJ2YWwgKTtcclxuICAgICAgICB0aGlzLmludGVydmFsID0gbnVsbDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmFkZEludGVydmFsKCk7XHJcbiAgICAgICAgdGhpcy5tb2RlKDApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRJbnRlcnZhbCgpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB0aGlzLm1vZGUoIDIgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnRtcC54ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgdGhpcy50bXAueSA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wICk7XHJcblxyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHRoaXMudG1wLmxlbmd0aCgpO1xyXG5cclxuICAgICAgICBpZiAoIGRpc3RhbmNlID4gdGhpcy5kaXN0YW5jZSApIHtcclxuICAgICAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMih0aGlzLnRtcC54LCB0aGlzLnRtcC55KTtcclxuICAgICAgICAgICAgdGhpcy50bXAueCA9IE1hdGguc2luKCBhbmdsZSApICogdGhpcy5kaXN0YW5jZTtcclxuICAgICAgICAgICAgdGhpcy50bXAueSA9IE1hdGguY29zKCBhbmdsZSApICogdGhpcy5kaXN0YW5jZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9zLmNvcHkoIHRoaXMudG1wICkuZGl2aWRlU2NhbGFyKCB0aGlzLmRpc3RhbmNlICkubmVnYXRlKCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFZhbHVlICggdiApIHtcclxuXHJcbiAgICAgICAgaWYodj09PXVuZGVmaW5lZCkgdj1bMCwwXTtcclxuXHJcbiAgICAgICAgdGhpcy5wb3Muc2V0KCB2WzBdIHx8IDAsIHZbMV0gIHx8IDAgKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVNWRygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgaWYoIHVwID09PSB1bmRlZmluZWQgKSB1cCA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmludGVydmFsICE9PSBudWxsICl7XHJcblxyXG4gICAgICAgICAgICBpZiggIXRoaXMuaXNEb3duICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MubGVycCggbnVsbCwgMC4zICk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MueCA9IE1hdGguYWJzKCB0aGlzLnBvcy54ICkgPCAwLjAxID8gMCA6IHRoaXMucG9zLng7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvcy55ID0gTWF0aC5hYnMoIHRoaXMucG9zLnkgKSA8IDAuMDEgPyAwIDogdGhpcy5wb3MueTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggdGhpcy5pc1VJICYmIHRoaXMubWFpbi5pc0NhbnZhcyApIHRoaXMubWFpbi5kcmF3KCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnBvcy5pc1plcm8oKSApIHRoaXMuc3RvcEludGVydmFsKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNWRyAoKSB7XHJcblxyXG4gICAgICAgIGxldCB4ID0gdGhpcy5yYWRpdXMgLSAoIC10aGlzLnBvcy54ICogdGhpcy5kaXN0YW5jZSApO1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5yYWRpdXMgLSAoIC10aGlzLnBvcy55ICogdGhpcy5kaXN0YW5jZSApO1xyXG5cclxuICAgICAgICAgaWYodGhpcy5tb2RlbCA9PT0gMCl7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3ggPSB4ICsgKCh0aGlzLnBvcy54KSo1KSArIDU7XHJcbiAgICAgICAgICAgIGxldCBzeSA9IHkgKyAoKHRoaXMucG9zLnkpKjUpICsgMTA7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCBzeCp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHN5KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCB4KnRoaXMucmF0aW8sIDMgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgeSp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgeCp0aGlzLnJhdGlvLCA0ICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgeSp0aGlzLnJhdGlvLCA0ICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVbMF0gPSAgKCB0aGlzLnBvcy54ICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcbiAgICAgICAgdGhpcy52YWx1ZVsxXSA9ICAoIHRoaXMucG9zLnkgKiB0aGlzLm11bHRpcGxpY2F0b3IgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIgKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc3RvcEludGVydmFsKCk7XHJcbiAgICAgICAgc3VwZXIuY2xlYXIoKTtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgQ2lyY3VsYXIgfSBmcm9tICcuL0NpcmN1bGFyJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBLbm9iIGV4dGVuZHMgQ2lyY3VsYXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSB0aGlzLmNvbG9ycy5idXR0b247XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VHlwZU51bWJlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLm1QSSA9IE1hdGguUEkgKiAwLjg7XHJcbiAgICAgICAgdGhpcy50b0RlZyA9IDE4MCAvIE1hdGguUEk7XHJcbiAgICAgICAgdGhpcy5jaXJSYW5nZSA9IHRoaXMubVBJICogMjtcclxuXHJcbiAgICAgICAgdGhpcy5vZmZzZXQgPSBuZXcgVjIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSB0aGlzLncgKiAwLjU7Ly9NYXRoLmZsb29yKCh0aGlzLnctMjApKjAuNSk7XHJcblxyXG4gICAgICAgIC8vdGhpcy53dyA9IHRoaXMuaGVpZ2h0ID0gdGhpcy5yYWRpdXMgKiAyO1xyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCB0aGlzLncgKyAxMDtcclxuICAgICAgICB0aGlzLnRvcCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1swXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuXHJcbiAgICAgICAgaWYodGhpcy5jWzFdICE9PSB1bmRlZmluZWQpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRLbm9iKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAxICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuZm9udENvbG9yLCAzICk7XHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLm1ha2VHcmFkKCksIDMgKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrdGhpcy53dysnICcrdGhpcy53dyApO1xyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCB0aGlzLmNbM10sIHsgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy53LCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5yID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jbW9kZSA9PT0gbW9kZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuc1syXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwnLHRoaXMuY29sb3JzLmJ1dHRvbiwgMCk7XHJcbiAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuMiknLCAyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmZvbnRDb2xvciwgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmNvbG9yUGx1cztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJyx0aGlzLmNvbG9ycy5zZWxlY3QsIDApO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywncmdiYSgwLDAsMCwwLjYpJywgMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5jb2xvclBsdXMsIDEgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNtb2RlID0gbW9kZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIC8vdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgb2ZmID0gdGhpcy5vZmZzZXQ7XHJcblxyXG4gICAgICAgIG9mZi54ID0gdGhpcy5yYWRpdXMgLSAoIGUuY2xpZW50WCAtIHRoaXMuem9uZS54ICk7XHJcbiAgICAgICAgb2ZmLnkgPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCApO1xyXG5cclxuICAgICAgICB0aGlzLnIgPSAtIE1hdGguYXRhbjIoIG9mZi54LCBvZmYueSApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vbGRyICE9PSBudWxsICkgdGhpcy5yID0gTWF0aC5hYnModGhpcy5yIC0gdGhpcy5vbGRyKSA+IE1hdGguUEkgPyB0aGlzLm9sZHIgOiB0aGlzLnI7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IHRoaXMuciA+IHRoaXMubVBJID8gdGhpcy5tUEkgOiB0aGlzLnI7XHJcbiAgICAgICAgdGhpcy5yID0gdGhpcy5yIDwgLXRoaXMubVBJID8gLXRoaXMubVBJIDogdGhpcy5yO1xyXG5cclxuICAgICAgICBsZXQgc3RlcHMgPSAxIC8gdGhpcy5jaXJSYW5nZTtcclxuICAgICAgICBsZXQgdmFsdWUgPSAodGhpcy5yICsgdGhpcy5tUEkpICogc3RlcHM7XHJcblxyXG4gICAgICAgIGxldCBuID0gKCAoIHRoaXMucmFuZ2UgKiB2YWx1ZSApICsgdGhpcy5taW4gKSAtIHRoaXMub2xkO1xyXG5cclxuICAgICAgICBpZihuID49IHRoaXMuc3RlcCB8fCBuIDw9IHRoaXMuc3RlcCl7IFxyXG4gICAgICAgICAgICBuID0gTWF0aC5mbG9vciggbiAvIHRoaXMuc3RlcCApO1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy5vbGQgKyAoIG4gKiB0aGlzLnN0ZXAgKSApO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSggdHJ1ZSApO1xyXG4gICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMub2xkciA9IHRoaXMucjtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1ha2VHcmFkICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGQgPSAnJywgc3RlcCwgcmFuZ2UsIGEsIHgsIHksIHgyLCB5MiwgciA9IDY0O1xyXG4gICAgICAgIGxldCBzdGFydGFuZ2xlID0gTWF0aC5QSSArIHRoaXMubVBJO1xyXG4gICAgICAgIGxldCBlbmRhbmdsZSA9IE1hdGguUEkgLSB0aGlzLm1QSTtcclxuICAgICAgICAvL2xldCBzdGVwID0gdGhpcy5zdGVwPjUgPyB0aGlzLnN0ZXAgOiAxO1xyXG5cclxuICAgICAgICBpZih0aGlzLnN0ZXA+NSl7XHJcbiAgICAgICAgICAgIHJhbmdlID0gIHRoaXMucmFuZ2UgLyB0aGlzLnN0ZXA7XHJcbiAgICAgICAgICAgIHN0ZXAgPSAoIHN0YXJ0YW5nbGUgLSBlbmRhbmdsZSApIC8gcmFuZ2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3RlcCA9ICgoIHN0YXJ0YW5nbGUgLSBlbmRhbmdsZSApIC8gcikqMjtcclxuICAgICAgICAgICAgcmFuZ2UgPSByKjAuNTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAoIGxldCBpID0gMDsgaSA8PSByYW5nZTsgKytpICkge1xyXG5cclxuICAgICAgICAgICAgYSA9IHN0YXJ0YW5nbGUgLSAoIHN0ZXAgKiBpICk7XHJcbiAgICAgICAgICAgIHggPSByICsgTWF0aC5zaW4oIGEgKSAqICggciAtIDIwICk7XHJcbiAgICAgICAgICAgIHkgPSByICsgTWF0aC5jb3MoIGEgKSAqICggciAtIDIwICk7XHJcbiAgICAgICAgICAgIHgyID0gciArIE1hdGguc2luKCBhICkgKiAoIHIgLSAyNCApO1xyXG4gICAgICAgICAgICB5MiA9IHIgKyBNYXRoLmNvcyggYSApICogKCByIC0gMjQgKTtcclxuICAgICAgICAgICAgZCArPSAnTScgKyB4ICsgJyAnICsgeSArICcgTCcgKyB4MiArICcgJyt5MiArICcgJztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5wZXJjZW50ID0gKHRoaXMudmFsdWUgLSB0aGlzLm1pbikgLyB0aGlzLnJhbmdlO1xyXG5cclxuICAgICAgIC8vIGxldCByID0gNTA7XHJcbiAgICAgICAvLyBsZXQgZCA9IDY0OyBcclxuICAgICAgICBsZXQgciA9ICggKHRoaXMucGVyY2VudCAqIHRoaXMuY2lyUmFuZ2UpIC0gKHRoaXMubVBJKSkvLyogdGhpcy50b0RlZztcclxuXHJcbiAgICAgICAgbGV0IHNpbiA9IE1hdGguc2luKHIpO1xyXG4gICAgICAgIGxldCBjb3MgPSBNYXRoLmNvcyhyKTtcclxuXHJcbiAgICAgICAgbGV0IHgxID0gKDI1ICogc2luKSArIDY0O1xyXG4gICAgICAgIGxldCB5MSA9IC0oMjUgKiBjb3MpICsgNjQ7XHJcbiAgICAgICAgbGV0IHgyID0gKDIwICogc2luKSArIDY0O1xyXG4gICAgICAgIGxldCB5MiA9IC0oMjAgKiBjb3MpICsgNjQ7XHJcblxyXG4gICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgeCwgMSApO1xyXG4gICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgeSwgMSApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsICdNICcgKyB4MSArJyAnICsgeTEgKyAnIEwgJyArIHgyICsnICcgKyB5MiwgMSApO1xyXG5cclxuICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd0cmFuc2Zvcm0nLCAncm90YXRlKCcrIHIgKycgJys2NCsnICcrNjQrJyknLCAxICk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgTGlzdCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICAvLyBpbWFnZXNcclxuICAgICAgICB0aGlzLnBhdGggPSBvLnBhdGggfHwgJyc7XHJcbiAgICAgICAgdGhpcy5mb3JtYXQgPSBvLmZvcm1hdCB8fCAnJztcclxuICAgICAgICB0aGlzLmltYWdlU2l6ZSA9IG8uaW1hZ2VTaXplIHx8IFsyMCwyMF07XHJcblxyXG4gICAgICAgIHRoaXMuaXNXaXRoSW1hZ2UgPSB0aGlzLnBhdGggIT09ICcnID8gdHJ1ZTpmYWxzZTtcclxuICAgICAgICB0aGlzLnByZUxvYWRDb21wbGV0ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnRtcEltYWdlID0ge307XHJcbiAgICAgICAgdGhpcy50bXBVcmwgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvSGVpZ2h0ID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGFsaWduID0gby5hbGlnbiB8fCAnY2VudGVyJztcclxuXHJcbiAgICAgICAgdGhpcy5zTW9kZSA9IDA7XHJcbiAgICAgICAgdGhpcy50TW9kZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdE9ubHkgPSBvLmxpc3RPbmx5IHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTU7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjA7IGRpc3BsYXk6bm9uZTsnICk7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjonK2FsaWduKyc7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7IHRvcDoxcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycgKTtcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmFycm93LCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIgPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3JpZ2h0OjVweDsgIHdpZHRoOjEwcHg7IGJhY2tncm91bmQ6IzY2NjsgZGlzcGxheTpub25lOycpO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ID0gby5saXN0IHx8IFtdO1xyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuICAgICAgICB0aGlzLml0ZW1IZWlnaHQgPSBvLml0ZW1IZWlnaHQgfHwgKHRoaXMuaC0zKTtcclxuXHJcbiAgICAgICAgLy8gZm9yY2UgZnVsbCBsaXN0IFxyXG4gICAgICAgIHRoaXMuZnVsbCA9IG8uZnVsbCB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5weSA9IDA7XHJcbiAgICAgICAgdGhpcy53dyA9IHRoaXMuc2I7XHJcbiAgICAgICAgdGhpcy5zY3JvbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBsaXN0IHVwIG9yIGRvd25cclxuICAgICAgICB0aGlzLnNpZGUgPSBvLnNpZGUgfHwgJ2Rvd24nO1xyXG4gICAgICAgIHRoaXMudXAgPSB0aGlzLnNpZGUgPT09ICdkb3duJyA/IDAgOiAxO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAgICAgdGhpcy5jWzRdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAgICAgLy90aGlzLmNbNV0uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmJvdHRvbSA9IHRoaXMuaC0yICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLmJvdHRvbSA9ICcxcHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUuYm90dG9tID0gZmx0b3AgKyAncHgnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gdGhpcy5iYXNlSCArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxpc3RJbiA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnbGVmdDowOyB0b3A6MDsgd2lkdGg6MTAwJTsgYmFja2dyb3VuZDpyZ2JhKDAsMCwwLDAuMik7Jyk7XHJcbiAgICAgICAgdGhpcy5saXN0SW4ubmFtZSA9ICdsaXN0JztcclxuXHJcbiAgICAgICAgdGhpcy50b3BMaXN0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNbMl0uYXBwZW5kQ2hpbGQoIHRoaXMubGlzdEluICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbGVyICk7XHJcblxyXG4gICAgICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgaWYoIWlzTmFOKG8udmFsdWUpKSB0aGlzLnZhbHVlID0gdGhpcy5saXN0WyBvLnZhbHVlIF07XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IG8udmFsdWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzT3Blbk9uU3RhcnQgPSBvLm9wZW4gfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmxpc3RPbmx5ICl7XHJcbiAgICAgICAgICAgIHRoaXMuYmFzZUggPSA1O1xyXG4gICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgdGhpcy5jWzRdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5zdHlsZS50b3AgPSB0aGlzLmJhc2VIKydweCdcclxuICAgICAgICAgICAgdGhpcy5pc09wZW5PblN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvL3RoaXMuY1swXS5zdHlsZS5iYWNrZ3JvdW5kID0gJyNGRjAwMDAnXHJcbiAgICAgICAgaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKSB0aGlzLnByZWxvYWRJbWFnZSgpO1xyXG4gICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gcG9wdWxhdGUgbGlzdFxyXG4gICAgICAgICAgICB0aGlzLnNldExpc3QoIHRoaXMubGlzdCApO1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuT25TdGFydCApIHRoaXMub3BlbiggdHJ1ZSApO1xyXG4gICAgICAgLy8gfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbWFnZSBsaXN0XHJcblxyXG4gICAgcHJlbG9hZEltYWdlICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBJbWFnZSA9IHt9O1xyXG4gICAgICAgIGZvciggbGV0IGk9MDsgaTx0aGlzLmxpc3QubGVuZ3RoOyBpKysgKSB0aGlzLnRtcFVybC5wdXNoKCB0aGlzLmxpc3RbaV0gKTtcclxuICAgICAgICB0aGlzLmxvYWRPbmUoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBuZXh0SW1nICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy50bXBVcmwuc2hpZnQoKTtcclxuICAgICAgICBpZiggdGhpcy50bXBVcmwubGVuZ3RoID09PSAwICl7IFxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRJbWFnZXMoKTtcclxuICAgICAgICAgICAgLyp0aGlzLnNldExpc3QoIHRoaXMubGlzdCApO1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuT25TdGFydCApIHRoaXMub3BlbigpOyovXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHRoaXMubG9hZE9uZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsb2FkT25lKCl7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpc1xyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50bXBVcmxbMF07XHJcbiAgICAgICAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgIGltZy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDonK3NlbGYuaW1hZ2VTaXplWzBdKydweDsgaGVpZ2h0Oicrc2VsZi5pbWFnZVNpemVbMV0rJ3B4JztcclxuICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCB0aGlzLnBhdGggKyBuYW1lICsgdGhpcy5mb3JtYXQgKTtcclxuXHJcbiAgICAgICAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW1hZ2VTaXplWzJdID0gaW1nLndpZHRoO1xyXG4gICAgICAgICAgICBzZWxmLmltYWdlU2l6ZVszXSA9IGltZy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHNlbGYudG1wSW1hZ2VbbmFtZV0gPSBpbWc7XHJcbiAgICAgICAgICAgIHNlbGYubmV4dEltZygpO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCAmJiB0aGlzLmlzT3BlbiApe1xyXG4gICAgICAgICAgICBpZiggbC55ID4gdGhpcy5oIC0gdGhpcy5iYXNlSCApIHJldHVybiAndGl0bGUnO1xyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuc2Nyb2xsICYmICggbC54ID4gKHRoaXMuc2ErdGhpcy5zYi0yMCkpICkgcmV0dXJuICdzY3JvbGwnO1xyXG4gICAgICAgICAgICAgICAgaWYobC54ID4gdGhpcy5zYSkgcmV0dXJuIHRoaXMudGVzdEl0ZW1zKCBsLnktdGhpcy5iYXNlSCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCBsLnkgPCB0aGlzLmJhc2VIKzIgKSByZXR1cm4gJ3RpdGxlJztcclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnNjcm9sbCAmJiAoIGwueCA+ICh0aGlzLnNhK3RoaXMuc2ItMjApKSApIHJldHVybiAnc2Nyb2xsJztcclxuICAgICAgICAgICAgICAgICAgICBpZihsLnggPiB0aGlzLnNhKSByZXR1cm4gdGhpcy50ZXN0SXRlbXMoIGwueS10aGlzLmJhc2VIICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJyc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3RJdGVtcyAoIHkgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5pdGVtcy5sZW5ndGgsIGl0ZW0sIGEsIGI7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgaXRlbSA9IHRoaXMuaXRlbXNbaV07XHJcbiAgICAgICAgICAgIGEgPSBpdGVtLnBvc3kgKyB0aGlzLnRvcExpc3Q7XHJcbiAgICAgICAgICAgIGIgPSBpdGVtLnBvc3kgKyB0aGlzLml0ZW1IZWlnaHQgKyAxICsgdGhpcy50b3BMaXN0O1xyXG4gICAgICAgICAgICBpZiggeSA+PSBhICYmIHkgPD0gYiApeyBcclxuICAgICAgICAgICAgICAgIG5hbWUgPSAnaXRlbScgKyBpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdW5TZWxlY3RlZCAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgwLDAsMCwwLjIpJztcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RlZCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG4gICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5jb2xvciA9ICcjRkZGJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdzY3JvbGwnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiggbmFtZSA9PT0gJ3RpdGxlJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb2RlVGl0bGUoMik7XHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5saXN0T25seSApe1xyXG4gICAgICAgICAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHRoaXMub3BlbigpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5saXN0W3RoaXMuY3VycmVudC5pZF1cclxuICAgICAgICAgICAgICAgIC8vdGhpcy52YWx1ZSA9IHRoaXMuY3VycmVudC50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgaWYoICF0aGlzLmxpc3RPbmx5ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFRvcEl0ZW0oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBudXA7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGl0bGUnICl7XHJcbiAgICAgICAgICAgIHRoaXMudW5TZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgxKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3MtcmVzaXplJyk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZVNjcm9sbCgxKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMik7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9wID0gdGhpcy56b25lLnkrdGhpcy5iYXNlSC0yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoICggZS5jbGllbnRZIC0gdG9wICApIC0gKCB0aGlzLnNoKjAuNSApICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9pZih0aGlzLmlzRG93bikgdGhpcy5saXN0bW92ZShlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gaXMgaXRlbVxyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgwKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDApO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5hbWUgIT09IHRoaXMucHJldk5hbWUgKSBudXAgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucHJldk5hbWUgPSBuYW1lO1xyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGl0bGUnICkgcmV0dXJuIGZhbHNlOyBcclxuICAgICAgICB0aGlzLnB5ICs9IGUuZGVsdGEqMTA7XHJcbiAgICAgICAgdGhpcy51cGRhdGUodGhpcy5weSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9ICcnO1xyXG4gICAgICAgIHRoaXMudW5TZWxlY3RlZCgpO1xyXG4gICAgICAgIHRoaXMubW9kZVRpdGxlKDApO1xyXG4gICAgICAgIHRoaXMubW9kZVNjcm9sbCgwKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb2RlU2Nyb2xsICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIG1vZGUgPT09IHRoaXMuc01vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNNb2RlID0gbW9kZTtcclxuICAgIH1cclxuXHJcbiAgICBtb2RlVGl0bGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggbW9kZSA9PT0gdGhpcy50TW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gJyNGRkYnO1xyXG4gICAgICAgICAgICAgICAgc1szXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0IC8gZG93blxyXG4gICAgICAgICAgICAgICAgc1szXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgc1szXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuZG93bjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50TW9kZSA9IG1vZGU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyTGlzdCAoKSB7XHJcblxyXG4gICAgICAgIHdoaWxlICggdGhpcy5saXN0SW4uY2hpbGRyZW4ubGVuZ3RoICkgdGhpcy5saXN0SW4ucmVtb3ZlQ2hpbGQoIHRoaXMubGlzdEluLmxhc3RDaGlsZCApO1xyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGlzdCAoIGxpc3QgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdCA9IGxpc3Q7XHJcbiAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG5cclxuICAgICAgICB0aGlzLm1heEl0ZW0gPSB0aGlzLmZ1bGwgPyB0aGlzLmxlbmd0aCA6IDU7XHJcbiAgICAgICAgdGhpcy5tYXhJdGVtID0gdGhpcy5sZW5ndGggPCB0aGlzLm1heEl0ZW0gPyB0aGlzLmxlbmd0aCA6IHRoaXMubWF4SXRlbTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWlnaHQgPSB0aGlzLm1heEl0ZW0gKiAodGhpcy5pdGVtSGVpZ2h0KzEpICsgMjtcclxuXHJcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmxlbmd0aCAqICh0aGlzLml0ZW1IZWlnaHQrMSkgKyAyO1xyXG4gICAgICAgIHRoaXMucmF0aW8gPSB0aGlzLm1heEhlaWdodCAvIHRoaXMubWF4O1xyXG4gICAgICAgIHRoaXMuc2ggPSB0aGlzLm1heEhlaWdodCAqIHRoaXMucmF0aW87XHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4SGVpZ2h0IC0gdGhpcy5zaDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9IHRoaXMubWF4SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmhlaWdodCA9IHRoaXMuc2ggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5tYXggPiB0aGlzLm1heEhlaWdodCApeyBcclxuICAgICAgICAgICAgdGhpcy53dyA9IHRoaXMuc2IgLSAyMDtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGl0ZW0sIG47Ly8sIGwgPSB0aGlzLnNiO1xyXG4gICAgICAgIGZvciggbGV0IGk9MDsgaTx0aGlzLmxlbmd0aDsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBuID0gdGhpcy5saXN0W2ldO1xyXG4gICAgICAgICAgICBpdGVtID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5pdGVtICsgJ3dpZHRoOicrdGhpcy53dysncHg7IGhlaWdodDonK3RoaXMuaXRlbUhlaWdodCsncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaXRlbUhlaWdodC01KSsncHg7IGNvbG9yOicrdGhpcy5mb250Q29sb3IrJzsnICk7XHJcbiAgICAgICAgICAgIGl0ZW0ubmFtZSA9ICdpdGVtJytpO1xyXG4gICAgICAgICAgICBpdGVtLmlkID0gaTtcclxuICAgICAgICAgICAgaXRlbS5wb3N5ID0gKHRoaXMuaXRlbUhlaWdodCsxKSppO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RJbi5hcHBlbmRDaGlsZCggaXRlbSApO1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goIGl0ZW0gKTtcclxuXHJcbiAgICAgICAgICAgIC8vaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKSBpdGVtLmFwcGVuZENoaWxkKCB0aGlzLnRtcEltYWdlW25dICk7XHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5pc1dpdGhJbWFnZSApIGl0ZW0udGV4dENvbnRlbnQgPSBuO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGFkZEltYWdlcyAoKXtcclxuICAgICAgICBsZXQgbG5nID0gdGhpcy5saXN0Lmxlbmd0aDtcclxuICAgICAgICBmb3IoIGxldCBpPTA7IGk8bG5nOyBpKysgKXtcclxuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5hcHBlbmRDaGlsZCggdGhpcy50bXBJbWFnZVt0aGlzLmxpc3RbaV1dICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRvcEl0ZW0gKCl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzV2l0aEltYWdlICl7IFxyXG5cclxuICAgICAgICAgICAgaWYoICF0aGlzLnByZUxvYWRDb21wbGV0ZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNbM10uY2hpbGRyZW4ubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1hZ2VTaXplWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWFnZVNpemVbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlOyB0b3A6MHB4OyBsZWZ0OjBweDsnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1szXS5hcHBlbmRDaGlsZCggdGhpcy5jYW52YXMgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltZyA9IHRoaXMudG1wSW1hZ2VbIHRoaXMudmFsdWUgXTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKCB0aGlzLnRtcEltYWdlWyB0aGlzLnZhbHVlIF0sIDAsIDAsIHRoaXMuaW1hZ2VTaXplWzJdLCB0aGlzLmltYWdlU2l6ZVszXSwgMCwwLCB0aGlzLmltYWdlU2l6ZVswXSwgdGhpcy5pbWFnZVNpemVbMV0gKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tIExJU1RcclxuXHJcbiAgICB1cGRhdGUgKCB5ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuc2Nyb2xsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB5ID0geSA8IDAgPyAwIDogeTtcclxuICAgICAgICB5ID0geSA+IHRoaXMucmFuZ2UgPyB0aGlzLnJhbmdlIDogeTtcclxuXHJcbiAgICAgICAgdGhpcy50b3BMaXN0ID0gLU1hdGguZmxvb3IoIHkgLyB0aGlzLnJhdGlvICk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdEluLnN0eWxlLnRvcCA9IHRoaXMudG9wTGlzdCsncHgnO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUudG9wID0gTWF0aC5mbG9vciggeSApICArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMucHkgPSB5O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwYXJlbnRIZWlnaHQgKCB0ICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMucGFyZW50R3JvdXAgIT09IG51bGwgKSB0aGlzLnBhcmVudEdyb3VwLmNhbGMoIHQgKTtcclxuICAgICAgICBlbHNlIGlmICggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgb3BlbiAoIGZpcnN0ICkge1xyXG5cclxuICAgICAgICBzdXBlci5vcGVuKCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCAwICk7XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5tYXhIZWlnaHQgKyB0aGlzLmJhc2VIICsgNTtcclxuICAgICAgICBpZiggIXRoaXMuc2Nyb2xsICl7XHJcbiAgICAgICAgICAgIHRoaXMudG9wTGlzdCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUggKyA1ICsgdGhpcy5tYXg7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICl7IFxyXG4gICAgICAgICAgICB0aGlzLnpvbmUueSAtPSB0aGlzLmggLSAodGhpcy5iYXNlSC0xMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93VXAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5hcnJvd0Rvd24gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgICAgIGxldCB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIGlmKCFmaXJzdCkgdGhpcy5wYXJlbnRIZWlnaHQoIHQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCApIHRoaXMuem9uZS55ICs9IHRoaXMuaCAtICh0aGlzLmJhc2VILTEwKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93ICk7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS1cclxuXHJcbiAgICB0ZXh0ICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplQ29udGVudCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKSB0aGlzLmxpc3RJbi5jaGlsZHJlbltpXS5zdHlsZS53aWR0aCA9IHRoaXMud3cgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy5zYjtcclxuICAgICAgICBsZXQgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIGlmKHNbMl09PT0gdW5kZWZpbmVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHNbMl0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSBkICsncHgnO1xyXG5cclxuICAgICAgICBzWzNdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gZCArICdweCc7XHJcblxyXG4gICAgICAgIHNbNF0ubGVmdCA9IGQgKyB3IC0gMTcgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnd3ID0gdztcclxuICAgICAgICBpZiggdGhpcy5tYXggPiB0aGlzLm1heEhlaWdodCApIHRoaXMud3cgPSB3LTIwO1xyXG4gICAgICAgIGlmKHRoaXMuaXNPcGVuKSB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4uL2NvcmUvVG9vbHMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE51bWVyaWMgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxsd2F5ID0gby5hbGx3YXkgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBbMF07XHJcbiAgICAgICAgdGhpcy5tdWx0eSA9IDE7XHJcbiAgICAgICAgdGhpcy5pbnZtdWx0eSA9IDE7XHJcbiAgICAgICAgdGhpcy5pc1NpbmdsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc0FuZ2xlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZlY3RvciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggby5pc0FuZ2xlICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNBbmdsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubXVsdHkgPSBUb29scy50b3JhZDtcclxuICAgICAgICAgICAgdGhpcy5pbnZtdWx0eSA9IFRvb2xzLnRvZGVnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc0RyYWcgPSBvLmRyYWcgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgaWYoIWlzTmFOKG8udmFsdWUpKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gW28udmFsdWVdO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIG8udmFsdWUgaW5zdGFuY2VvZiBBcnJheSApeyBcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlOyBcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTaW5nbGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvLnZhbHVlIGluc3RhbmNlb2YgT2JqZWN0ICl7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUueCAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVswXSA9IG8udmFsdWUueDtcclxuICAgICAgICAgICAgICAgIGlmKCBvLnZhbHVlLnkgIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMV0gPSBvLnZhbHVlLnk7XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS56ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzJdID0gby52YWx1ZS56O1xyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUudyAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVszXSA9IG8udmFsdWUudztcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNWZWN0b3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NpbmdsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMudG1wID0gW107XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICB0aGlzLnByZXYgPSB7IHg6MCwgeTowLCBkOjAsIHY6MCB9O1xyXG5cclxuICAgICAgICAvLyBiZ1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLnNlbGVjdCArICc7IHRvcDo0cHg7IHdpZHRoOjBweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jTW9kZSA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuaXNBbmdsZSkgdGhpcy52YWx1ZVtpXSA9ICh0aGlzLnZhbHVlW2ldICogMTgwIC8gTWF0aC5QSSkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKTtcclxuICAgICAgICAgICAgdGhpcy5jWzMraV0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICcgaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7IGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLmlucHV0QmcgKyAnOyBib3JkZXJDb2xvcjonICsgdGhpcy5jb2xvcnMuaW5wdXRCb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnKTtcclxuICAgICAgICAgICAgaWYoby5jZW50ZXIpIHRoaXMuY1syK2ldLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLmNbMytpXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbaV07XHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldLmlzTnVtID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY01vZGVbaV0gPSAwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGN1cnNvclxyXG4gICAgICAgIHRoaXMuY3Vyc29ySWQgPSAzICsgdGhpcy5sbmc7XHJcbiAgICAgICAgdGhpcy5jWyB0aGlzLmN1cnNvcklkIF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3RvcDo0cHg7IGhlaWdodDonICsgKHRoaXMuaC04KSArICdweDsgd2lkdGg6MHB4OyBiYWNrZ3JvdW5kOicrdGhpcy5mb250Q29sb3IrJzsnICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAvKiBtb2RlOiBmdW5jdGlvbiAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBuID09PSB0aGlzLmNNb2RlW25hbWVdICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAvL2xldCBtO1xyXG5cclxuICAgICAgICAvKnN3aXRjaChuKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgMDogbSA9IHRoaXMuY29sb3JzLmJvcmRlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogbSA9IHRoaXMuY29sb3JzLmJvcmRlck92ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IG0gPSB0aGlzLmNvbG9ycy5ib3JkZXJTZWxlY3Q7ICBicmVhaztcclxuXHJcbiAgICAgICAgfSovXHJcblxyXG4gICAvKiAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIC8vdGhpcy5jW25hbWUrMl0uc3R5bGUuYm9yZGVyQ29sb3IgPSBtO1xyXG4gICAgICAgIHRoaXMuY01vZGVbbmFtZV0gPSBuO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKCBuYW1lICE9PSAnJyApeyBcclxuICAgICAgICAgICAgXHR0aGlzLmN1cnJlbnQgPSBuYW1lO1xyXG4gICAgICAgICAgICBcdHRoaXMucHJldiA9IHsgeDplLmNsaWVudFgsIHk6ZS5jbGllbnRZLCBkOjAsIHY6IHRoaXMuaXNTaW5nbGUgPyBwYXJzZUZsb2F0KHRoaXMudmFsdWUpIDogcGFyc2VGbG9hdCggdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gKSAgfTtcclxuICAgICAgICAgICAgXHR0aGlzLnNldElucHV0KCB0aGlzLmNbIDMgKyB0aGlzLmN1cnJlbnQgXSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIC8qXHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnJyApIHJldHVybiBmYWxzZTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnByZXYgPSB7IHg6ZS5jbGllbnRYLCB5OmUuY2xpZW50WSwgZDowLCB2OiB0aGlzLmlzU2luZ2xlID8gcGFyc2VGbG9hdCh0aGlzLnZhbHVlKSA6IHBhcnNlRmxvYXQoIHRoaXMudmFsdWVbIHRoaXMuY3VycmVudCBdICkgIH07XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKCAyLCBuYW1lICk7Ki9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgXHRpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMucHJldiA9IHsgeDowLCB5OjAsIGQ6MCwgdjowIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgLypsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApeyBcclxuXHJcbiAgICAgICAgICAgIC8vbGV0IHRtID0gdGhpcy5jdXJyZW50O1xyXG4gICAgICAgICAgICBsZXQgdGQgPSB0aGlzLnByZXYuZDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLnByZXYgPSB7IHg6MCwgeTowLCBkOjAsIHY6MCB9O1xyXG5cclxuICAgICAgICAgICAgaWYoICF0ZCApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1sgMyArIG5hbWUgXSApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7Ly90aGlzLm1vZGUoIDIsIG5hbWUgKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNldCgpOy8vdGhpcy5tb2RlKCAwLCB0bSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHggPSAwO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICcnICkgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICBlbHNleyBcclxuICAgICAgICBcdGlmKCF0aGlzLmlzRHJhZykgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICBcdGVsc2UgdGhpcy5jdXJzb3IoIHRoaXMuY3VycmVudCAhPT0gLTEgPyAnbW92ZScgOiAncG9pbnRlcicgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0RyYWcgKXtcclxuXHJcbiAgICAgICAgXHRpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApe1xyXG5cclxuICAgICAgICAgICAgXHR0aGlzLnByZXYuZCArPSAoIGUuY2xpZW50WCAtIHRoaXMucHJldi54ICkgLSAoIGUuY2xpZW50WSAtIHRoaXMucHJldi55ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG4gPSB0aGlzLnByZXYudiArICggdGhpcy5wcmV2LmQgKiB0aGlzLnN0ZXApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVbIHRoaXMuY3VycmVudCBdID0gdGhpcy5udW1WYWx1ZShuKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sgMyArIHRoaXMuY3VycmVudCBdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVt0aGlzLmN1cnJlbnRdO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXYueCA9IGUuY2xpZW50WDtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldi55ID0gZS5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgICAgIG51cCA9IHRydWU7XHJcbiAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIFx0aWYoIHRoaXMuaXNEb3duICkgeCA9IGUuY2xpZW50WCAtIHRoaXMuem9uZS54IC0zO1xyXG4gICAgICAgIFx0aWYoIHRoaXMuY3VycmVudCAhPT0gLTEgKSB4IC09IHRoaXMudG1wW3RoaXMuY3VycmVudF1bMF1cclxuICAgICAgICBcdHJldHVybiB0aGlzLnVwSW5wdXQoIHgsIHRoaXMuaXNEb3duICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL2tleWRvd246IGZ1bmN0aW9uICggZSApIHsgcmV0dXJuIHRydWU7IH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IG51cCA9IGZhbHNlO1xyXG4gICAgICAgIC8vdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy90aGlzLmN1cnJlbnQgPSAwO1xyXG5cclxuICAgICAgIC8qIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgIGlmKHRoaXMuY01vZGVbaV0hPT0wKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY01vZGVbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLmNbMitpXS5zdHlsZS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmJvcmRlcjtcclxuICAgICAgICAgICAgICAgIG51cCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNldFZhbHVlICggdiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNWZWN0b3IgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCB2LnggIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMF0gPSB2Lng7XHJcbiAgICAgICAgICAgIGlmKCB2LnkgIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMV0gPSB2Lnk7XHJcbiAgICAgICAgICAgIGlmKCB2LnogIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMl0gPSB2Lno7XHJcbiAgICAgICAgICAgIGlmKCB2LncgIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbM10gPSB2Lnc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgLy9sZXQgaSA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKm4gPSBuIHx8IDA7XHJcbiAgICAgICAgdGhpcy52YWx1ZVtuXSA9IHRoaXMubnVtVmFsdWUoIHYgKTtcclxuICAgICAgICB0aGlzLmNbIDMgKyBuIF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW25dOyovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNhbWVTdHIgKCBzdHIgKXtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnZhbHVlLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IHN0cjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgICB0aGlzLnZhbHVlW2ldID0gdGhpcy5udW1WYWx1ZSggdGhpcy52YWx1ZVtpXSAqIHRoaXMuaW52bXVsdHkgKTtcclxuICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbaV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VuZCAoIHYgKSB7XHJcblxyXG4gICAgICAgIHYgPSB2IHx8IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCApeyBcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzVmVjdG9yICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdLmZyb21BcnJheSggdiApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdLnggPSB2WzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdLnkgPSB2WzFdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdLnogPSB2WzJdO1xyXG4gICAgICAgICAgICAgICAgaWYoIHZbM10gKSB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0udyA9IHZbM107Ki9cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gPSB2O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY2FsbGJhY2sgKSB0aGlzLmNhbGxiYWNrKCB2LCB0aGlzLnZhbCApO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdCAoIGMsIGUsIHcgKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5jdXJyZW50ICE9PSAtMSA/IHRoaXMudG1wW3RoaXMuY3VycmVudF1bMF0gKyA1IDogMDtcclxuICAgICAgICBzW3RoaXMuY3Vyc29ySWRdLndpZHRoID0gJzFweCc7XHJcbiAgICAgICAgc1t0aGlzLmN1cnNvcklkXS5sZWZ0ID0gKCBkICsgYyApICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSAoIGQgKyBlICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHVuc2VsZWN0ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgaWYoIXMpIHJldHVybjtcclxuICAgICAgICBzWzJdLndpZHRoID0gMCArICdweCc7XHJcbiAgICAgICAgc1t0aGlzLmN1cnNvcklkXS53aWR0aCA9IDAgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZSAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBsZXQgYXIgPSBbXTtcclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5hbGx3YXkgKSBmb3JjZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgXHRpZighaXNOYU4oIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCApKXsgXHJcbiAgICAgICAgICAgICAgICBsZXQgbnggPSB0aGlzLm51bVZhbHVlKCB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IG54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZVtpXSA9IG54O1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBub3QgbnVtYmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW2ldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIFx0YXJbaV0gPSB0aGlzLnZhbHVlW2ldICogdGhpcy5tdWx0eTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCAhZm9yY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2luZ2xlICkgdGhpcy5zZW5kKCBhclswXSApO1xyXG4gICAgICAgIGVsc2UgdGhpcy5zZW5kKCBhciApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFWklTRVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHcgPSBNYXRoLmZsb29yKCAoIHRoaXMuc2IgKyA1ICkgLyB0aGlzLmxuZyApLTU7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnRtcFtpXSA9IFsgTWF0aC5mbG9vciggdGhpcy5zYSArICggdyAqIGkgKSsoIDUgKiBpICkpLCB3IF07XHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXTtcclxuICAgICAgICAgICAgc1sgMyArIGkgXS5sZWZ0ID0gdGhpcy50bXBbaV1bMF0gKyAncHgnO1xyXG4gICAgICAgICAgICBzWyAzICsgaSBdLndpZHRoID0gdGhpcy50bXBbaV1bMV0gKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgU2xpZGUgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvICk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLm1vZGVsID0gby5zdHlwZSB8fCAwO1xyXG4gICAgICAgIGlmKCBvLm1vZGUgIT09IHVuZGVmaW5lZCApIHRoaXMubW9kZWwgPSBvLm1vZGU7XHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5oaWRlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hbGx3YXkgPSBvLmFsbHdheSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0RlZyA9IG8uaXNEZWcgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuZmlyc3RJbXB1dCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2xldHRlci1zcGFjaW5nOi0xcHg7IHRleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IrJzsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ3RleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IrJzsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdib3JkZXI6bm9uZTsgd2lkdGg6NDdweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2xldHRlci1zcGFjaW5nOi0xcHg7IHRleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgdG9wOjA7IGhlaWdodDonK3RoaXMuaCsncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYmFja2dyb3VuZDonK3RoaXMuY29sb3JzLnNjcm9sbGJhY2srJzsgdG9wOjJweDsgaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1s1XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnbGVmdDo0cHg7IHRvcDo1cHg7IGhlaWdodDonKyh0aGlzLmgtMTApKydweDsgYmFja2dyb3VuZDonICsgdGhpcy5mb250Q29sb3IgKyc7JyApO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uaXNOdW0gPSB0cnVlO1xyXG4gICAgICAgIC8vdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9ICh0aGlzLmgtNCkgKyAncHgnO1xyXG4gICAgICAgIC8vdGhpcy5jWzJdLnN0eWxlLmxpbmVIZWlnaHQgPSAodGhpcy5oLTgpICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gKHRoaXMuaC0yKSArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmxpbmVIZWlnaHQgPSAodGhpcy5oLTEwKSArICdweCc7XHJcblxyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgIT09IDApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGgxID0gNCwgaDIgPSA4LCB3dyA9IHRoaXMuaC00LCByYSA9IDIwO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMubW9kZWwgPT09IDIgKXtcclxuICAgICAgICAgICAgICAgIGgxID0gNDsvLzJcclxuICAgICAgICAgICAgICAgIGgyID0gODtcclxuICAgICAgICAgICAgICAgIHJhID0gMjtcclxuICAgICAgICAgICAgICAgIHd3ID0gKHRoaXMuaC00KSowLjVcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5tb2RlbCA9PT0gMykgdGhpcy5jWzVdLnN0eWxlLnZpc2libGUgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUuYm9yZGVyUmFkaXVzID0gaDEgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUuaGVpZ2h0ID0gaDIgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUudG9wID0gKHRoaXMuaCowLjUpIC0gaDEgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNV0uc3R5bGUuYm9yZGVyUmFkaXVzID0gKGgxKjAuNSkgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNV0uc3R5bGUuaGVpZ2h0ID0gaDEgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNV0uc3R5bGUudG9wID0gKHRoaXMuaCowLjUpLShoMSowLjUpICsgJ3B4JztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1s2XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYm9yZGVyLXJhZGl1czonK3JhKydweDsgbWFyZ2luLWxlZnQ6JysoLXd3KjAuNSkrJ3B4OyBib3JkZXI6MXB4IHNvbGlkICcrdGhpcy5jb2xvcnMuYm9yZGVyKyc7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7IGxlZnQ6NHB4OyB0b3A6MnB4OyBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsgd2lkdGg6Jyt3dysncHg7JyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIGwueCA+PSB0aGlzLnR4bCApIHJldHVybiAndGV4dCc7XHJcbiAgICAgICAgZWxzZSBpZiggbC54ID49IHRoaXMuc2EgKSByZXR1cm4gJ3Njcm9sbCc7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gJyc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3Njcm9sbCcgKXsgXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qaWYoIG5hbWUgPT09ICd0ZXh0JyApe1xyXG4gICAgICAgICAgICB0aGlzLnNldElucHV0KCB0aGlzLmNbMl0sIGZ1bmN0aW9uKCl7IHRoaXMudmFsaWRhdGUoKSB9LmJpbmQodGhpcykgKTtcclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBudXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApIHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigndy1yZXNpemUnKTtcclxuICAgICAgICAvL30gZWxzZSBpZihuYW1lID09PSAndGV4dCcpeyBcclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBuID0gKCgoIGUuY2xpZW50WCAtICh0aGlzLnpvbmUueCt0aGlzLnNhKSAtIDMgKSAvIHRoaXMud3cgKSAqIHRoaXMucmFuZ2UgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcbiAgICAgICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgICAgICBuID0gTWF0aC5mbG9vciggbiAvIHRoaXMuc3RlcCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHRoaXMub2xkICsgKCBuICogdGhpcy5zdGVwICkgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8va2V5ZG93bjogZnVuY3Rpb24gKCBlICkgeyByZXR1cm4gdHJ1ZTsgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdmFsaWRhdGUgKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBuID0gdGhpcy5jWzJdLnRleHRDb250ZW50O1xyXG5cclxuICAgICAgICBpZighaXNOYU4oIG4gKSl7IFxyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggbiApOyBcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUodHJ1ZSk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZWxzZSB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlICsgKHRoaXMuaXNEZWcgPyAnwrAnOicnKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgLy90aGlzLmNsZWFySW5wdXQoKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAvLyBzWzJdLmJvcmRlciA9ICcxcHggc29saWQgJyArIHRoaXMuY29sb3JzLmhpZGU7XHJcbiAgICAgICAgICAgICAgICBzWzJdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBzWzRdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGxiYWNrO1xyXG4gICAgICAgICAgICAgICAgc1s1XS5iYWNrZ3JvdW5kID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIHNjcm9sbCBvdmVyXHJcbiAgICAgICAgICAgICAgICAvL3NbMl0uYm9yZGVyID0gJzFweCBkYXNoZWQgJyArIHRoaXMuY29sb3JzLmhpZGU7XHJcbiAgICAgICAgICAgICAgICBzWzJdLmNvbG9yID0gdGhpcy5jb2xvclBsdXM7XHJcbiAgICAgICAgICAgICAgICBzWzRdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGxiYWNrb3ZlcjtcclxuICAgICAgICAgICAgICAgIHNbNV0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JQbHVzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAvKiBjYXNlIDI6IFxyXG4gICAgICAgICAgICAgICAgc1syXS5ib3JkZXIgPSAnMXB4IHNvbGlkICcgKyB0aGlzLmNvbG9ycy5ib3JkZXJTZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6IFxyXG4gICAgICAgICAgICAgICAgc1syXS5ib3JkZXIgPSAnMXB4IGRhc2hlZCAnICsgdGhpcy5mb250Q29sb3I7Ly90aGlzLmNvbG9ycy5ib3JkZXJTZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6IFxyXG4gICAgICAgICAgICAgICAgc1syXS5ib3JkZXIgPSAnMXB4IGRhc2hlZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICAgICAgYnJlYWs7Ki9cclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgbGV0IHd3ID0gTWF0aC5mbG9vciggdGhpcy53dyAqICgoIHRoaXMudmFsdWUgLSB0aGlzLm1pbiApIC8gdGhpcy5yYW5nZSApKTtcclxuICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgIT09IDMpIHRoaXMuc1s1XS53aWR0aCA9IHd3ICsgJ3B4JztcclxuICAgICAgICBpZih0aGlzLnNbNl0pIHRoaXMuc1s2XS5sZWZ0ID0gKCB0aGlzLnNhICsgd3cgKyAzICkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWUgKyAodGhpcy5pc0RlZyA/ICfCsCc6JycpO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgdyA9IHRoaXMuc2IgLSB0aGlzLnNjO1xyXG4gICAgICAgIHRoaXMud3cgPSB3IC0gNjtcclxuXHJcbiAgICAgICAgbGV0IHR4ID0gdGhpcy5zYztcclxuICAgICAgICBpZih0aGlzLmlzVUkgfHwgIXRoaXMuc2ltcGxlKSB0eCA9IHRoaXMuc2MrMTA7XHJcbiAgICAgICAgdGhpcy50eGwgPSB0aGlzLncgLSB0eCArIDI7XHJcblxyXG4gICAgICAgIC8vbGV0IHR5ID0gTWF0aC5mbG9vcih0aGlzLmggKiAwLjUpIC0gODtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHNbMl0ud2lkdGggPSAodGhpcy5zYyAtNiApKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICh0aGlzLnR4bCArNCkgKyAncHgnO1xyXG4gICAgICAgIC8vc1syXS50b3AgPSB0eSArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbNF0ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzVdLmxlZnQgPSAodGhpcy5zYSArIDMpICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBUZXh0SW5wdXQgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8ICcnO1xyXG4gICAgICAgIHRoaXMucGxhY2VIb2xkZXIgPSBvLnBsYWNlSG9sZGVyIHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBvLmVkaXQgIT09IHVuZGVmaW5lZCA/IG8uZWRpdCA6IHRydWU7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBiZ1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLnNlbGVjdCArICc7IHRvcDo0cHg7IHdpZHRoOjBweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9ycy5pbnB1dEJnICsgJzsgYm9yZGVyQ29sb3I6JyArIHRoaXMuY29sb3JzLmlucHV0Qm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIC8vIGN1cnNvclxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjRweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OyB3aWR0aDowcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmZvbnRDb2xvcisnOycgKTtcclxuXHJcbiAgICAgICAgLy8gZmFrZVxyXG4gICAgICAgIHRoaXMuY1s1XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2hlaWdodDonICsgKHRoaXMuaC00KSArICdweDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZvbnQtc3R5bGU6IGl0YWxpYzsgY29sb3I6Jyt0aGlzLmNvbG9ycy5pbnB1dEhvbGRlcisnOycgKTtcclxuICAgICAgICBpZiggdGhpcy52YWx1ZSA9PT0gJycgKSB0aGlzLmNbNV0udGV4dENvbnRlbnQgPSB0aGlzLnBsYWNlSG9sZGVyO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgaWYoIGwueCA+PSB0aGlzLnNhICkgcmV0dXJuICd0ZXh0JztcclxuICAgICAgICByZXR1cm4gJyc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmVkaXRhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZWRpdGFibGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiggbmFtZSA9PT0gJ3RleHQnICkgdGhpcy5zZXRJbnB1dCggdGhpcy5jWzNdICk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBpZighdGhpcy5lZGl0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgLy9sZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgLy9pZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICl7IHJldHVybjt9XHJcblxyXG4gICAgICAgIC8vaWYoIGwueCA+PSB0aGlzLnNhICkgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICAvL2Vsc2UgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgbGV0IHggPSAwO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3RleHQnICkgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICBlbHNlIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApIHggPSBlLmNsaWVudFggLSB0aGlzLnpvbmUueDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXBJbnB1dCggeCAtIHRoaXMuc2EgLTMsIHRoaXMuaXNEb3duICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZW5kZXIgKCBjLCBlLCBzICkge1xyXG5cclxuICAgICAgICB0aGlzLnNbNF0ud2lkdGggPSAnMXB4JztcclxuICAgICAgICB0aGlzLnNbNF0ubGVmdCA9ICh0aGlzLnNhICsgYys1KSArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuc1syXS5sZWZ0ID0gKHRoaXMuc2EgKyBlKzUpICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0ud2lkdGggPSBzKydweCc7XHJcbiAgICBcclxuICAgIH1cclxuXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElOUFVUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2VsZWN0ICggYywgZSwgdyApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLnNhICsgNTtcclxuICAgICAgICBzWzRdLndpZHRoID0gJzFweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gKCBkICsgYyApICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSAoIGQgKyBlICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHVuc2VsZWN0ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgaWYoIXMpIHJldHVybjtcclxuICAgICAgICBzWzJdLndpZHRoID0gMCArICdweCc7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9IDAgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZSAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5hbGx3YXkgKSBmb3JjZSA9IHRydWU7IFxyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5jWzNdLnRleHRDb250ZW50O1xyXG5cclxuICAgICAgICBpZih0aGlzLnZhbHVlICE9PSAnJykgdGhpcy5jWzVdLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgZWxzZSB0aGlzLmNbNV0udGV4dENvbnRlbnQgPSB0aGlzLnBsYWNlSG9sZGVyO1xyXG5cclxuICAgICAgICBpZiggIWZvcmNlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVpJU0VcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIHNbM10ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSB0aGlzLnNiICsgJ3B4JztcclxuXHJcbiAgICAgICAgc1s1XS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1s1XS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG4gICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBUaXRsZSBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICBsZXQgcHJlZml4ID0gby5wcmVmaXggfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjYwcHg7IGxpbmUtaGVpZ2h0OicrICh0aGlzLmgtOCkgKyAncHg7IGNvbG9yOicgKyB0aGlzLmZvbnRDb2xvciApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5oID09PSAzMSApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXS50b3AgPSA4ICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9IDggKyAncHgnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHRoaXMudHh0LnN1YnN0cmluZygwLDEpLnRvVXBwZXJDYXNlKCkgKyB0aGlzLnR4dC5zdWJzdHJpbmcoMSkucmVwbGFjZShcIi1cIiwgXCIgXCIpO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHByZWZpeDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRleHQgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGV4dDIgKCB0eHQgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHR4dDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG4gICAgICAgIHRoaXMuc1sxXS53aWR0aCA9IHRoaXMudyAtIDUwICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0ubGVmdCA9IHRoaXMudyAtICggNTAgKyAyNiApICsgJ3B4JztcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTZWxlY3QgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMub25BY3RpZiA9IG8ub25BY3RpZiB8fCBmdW5jdGlvbigpe307XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcbiAgICAgICAgdGhpcy5idXR0b25PdmVyID0gby5iT3ZlciB8fCB0aGlzLmNvbG9ycy5vdmVyO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uRG93biA9IG8uYkRvd24gfHwgdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG4gICAgICAgIHRoaXMuYnV0dG9uQWN0aW9uID0gby5iQWN0aW9uIHx8IHRoaXMuY29sb3JzLmFjdGlvbjtcclxuXHJcbiAgICAgICAgbGV0IHByZWZpeCA9IG8ucHJlZml4IHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLmJ1dHRvbiArICcgdG9wOjFweDsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlcjonK3RoaXMuY29sb3JzLmJ1dHRvbkJvcmRlcisnOyBib3JkZXItcmFkaXVzOjE1cHg7IHdpZHRoOjMwcHg7IGxlZnQ6MTBweDsnICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2hlaWdodDonICsgKHRoaXMuaC00KSArICdweDsgYmFja2dyb3VuZDonICsgdGhpcy5jb2xvcnMuaW5wdXRCZyArICc7IGJvcmRlckNvbG9yOicgKyB0aGlzLmNvbG9ycy5pbnB1dEJvcmRlcisnOyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycgKTtcclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTc7XHJcbiAgICAgICAgdGhpcy5jWzRdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjE0cHg7IGhlaWdodDoxNHB4OyBsZWZ0OjVweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3NbICdjdXJzb3InIF0sIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ID0gMTtcclxuICAgICAgICB0aGlzLmlzQWN0aWYgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgaWYoIGwueCA+IHRoaXMuc2EgJiYgbC54IDwgdGhpcy5zYSszMCApIHJldHVybiAnb3Zlcic7XHJcbiAgICAgICAgcmV0dXJuICcwJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIC8vdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIC8vdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzWyBuYW1lLTIgXTtcclxuICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgLy9sZXQgc2VsID0gZmFsc2U7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKG5hbWUpXHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnb3ZlcicgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGUoIHRoaXMuaXNEb3duID8gMyA6IDIgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGFwcGx5ICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgJyc7XHJcblxyXG4gICAgICAgIGlmKCB2ICE9PSB0aGlzLnZhbHVlICkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdjtcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5tb2RlKCAzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBuICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXQgIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBuPT09MSApIHRoaXMuaXNBY3RpZiA9IGZhbHNlOztcclxuXHJcbiAgICAgICAgICAgIGlmKCBuPT09MyApeyBcclxuICAgICAgICAgICAgICAgIGlmKCAhdGhpcy5pc0FjdGlmICl7IHRoaXMuaXNBY3RpZiA9IHRydWU7IG49NDsgdGhpcy5vbkFjdGlmKCB0aGlzICk7IH1cclxuICAgICAgICAgICAgICAgIGVsc2UgeyB0aGlzLmlzQWN0aWYgPSBmYWxzZTsgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggbj09PTIgJiYgdGhpcy5pc0FjdGlmICkgbiA9IDQ7XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdCA9IDE7IHRoaXMuc1sgMiBdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7ICB0aGlzLnNbIDIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjsgYnJlYWs7IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIGNhc2UgMjogdGhpcy5zdGF0ID0gMjsgdGhpcy5zWyAyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbk92ZXI7IGJyZWFrOyAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdCA9IDM7IHRoaXMuc1sgMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIDIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Eb3duOyBicmVhazsgLy8gZG93blxyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiB0aGlzLnN0YXQgPSA0OyB0aGlzLnNbIDIgXS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQWN0aW9uOyBicmVhazsgLy8gYWN0aWZcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSggdGhpcy5pc0FjdGlmID8gNCA6IDEgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGV4dCAoIHR4dCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdHh0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgICAgIHNbM10ubGVmdCA9ICh0aGlzLnNhICsgNDApICsgJ3B4JztcclxuICAgICAgICBzWzNdLndpZHRoID0gKHRoaXMuc2IgLSA0MCkgKyAncHgnO1xyXG4gICAgICAgIHNbNF0ubGVmdCA9ICh0aGlzLnNhKzgpICsgJ3B4JztcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTZWxlY3RvciBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IG8udmFsdWVzO1xyXG4gICAgICAgIGlmKHR5cGVvZiB0aGlzLnZhbHVlcyA9PT0gJ3N0cmluZycgKSB0aGlzLnZhbHVlcyA9IFsgdGhpcy52YWx1ZXMgXTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IG8udmFsdWUgfHwgdGhpcy52YWx1ZXNbMF07XHJcblxyXG5cclxuXHJcbiAgICAgICAgLy90aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uT3ZlciA9IG8uYk92ZXIgfHwgdGhpcy5jb2xvcnMub3ZlcjtcclxuICAgICAgICB0aGlzLmJ1dHRvbkRvd24gPSBvLmJEb3duIHx8IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuXHJcbiAgICAgICAgdGhpcy5sbmcgPSB0aGlzLnZhbHVlcy5sZW5ndGg7XHJcbiAgICAgICAgdGhpcy50bXAgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXQgPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IHNlbDtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKyspe1xyXG5cclxuICAgICAgICAgICAgc2VsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1tpXSA9PT0gdGhpcy52YWx1ZSApIHNlbCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MuYnV0dG9uICsgJyB0b3A6MXB4OyBiYWNrZ3JvdW5kOicrKHNlbD8gdGhpcy5idXR0b25Eb3duIDogdGhpcy5idXR0b25Db2xvcikrJzsgaGVpZ2h0OicrKHRoaXMuaC0yKSsncHg7IGJvcmRlcjonK3RoaXMuY29sb3JzLmJ1dHRvbkJvcmRlcisnOyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycgKTtcclxuICAgICAgICAgICAgdGhpcy5jW2krMl0uc3R5bGUuY29sb3IgPSBzZWwgPyB0aGlzLmZvbnRTZWxlY3QgOiB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5jW2krMl0uaW5uZXJIVE1MID0gdGhpcy52YWx1ZXNbaV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLnN0YXRbaV0gPSBzZWwgPyAzOjE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICBcclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIGxldCB0ID0gdGhpcy50bXA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgIFx0aWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGkrMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIC8vdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICBcdGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzWyBuYW1lLTIgXTtcclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgIFx0cmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiBcclxuICAgICAgICAvLyB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcbiAgICAgICAgLy9sZXQgc2VsID0gZmFsc2U7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKG5hbWUpXHJcblxyXG4gICAgICAgIGlmKCBuYW1lICE9PSAnJyApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMubW9kZXMoIHRoaXMuaXNEb3duID8gMyA6IDIsIG5hbWUgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIFx0dXAgPSB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb2RlcyAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGxldCB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT09IG5hbWUtMiAmJiB0aGlzLnZhbHVlc1sgaSBdICE9PSB0aGlzLnZhbHVlICkgdiA9IHRoaXMubW9kZSggbiwgaSsyICk7XHJcbiAgICAgICAgICAgIGVsc2V7IFxyXG5cclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1sgaSBdID09PSB0aGlzLnZhbHVlICkgdiA9IHRoaXMubW9kZSggMywgaSsyICk7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHYgPSB0aGlzLm1vZGUoIDEsIGkrMiApO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodikgciA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBuLCBuYW1lICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBpID0gbmFtZSAtIDI7XHJcblxyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0W2ldICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdFtpXSA9IDE7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgIHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXRbaV0gPSAyOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbk92ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXRbaV0gPSAzOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkRvd247IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICBsZXQgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1sgaSBdID09PSB0aGlzLnZhbHVlICkgdiA9IHRoaXMubW9kZSggMywgaSsyICk7XHJcbiAgICAgICAgICAgIGVsc2UgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHI7Ly90aGlzLm1vZGVzKCAxICwgMiApO1xyXG5cclxuICAgIFx0LyppZiggdGhpcy5zZWxlY3RlZCApe1xyXG4gICAgXHRcdHRoaXMuc1sgdGhpcy5zZWxlY3RlZCBdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuc1sgdGhpcy5zZWxlY3RlZCBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgXHR9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlOyovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxhYmVsICggc3RyaW5nLCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuY1tuXS50ZXh0Q29udGVudCA9IHN0cmluZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWNvbiAoIHN0cmluZywgeSwgbiApIHtcclxuXHJcbiAgICAgICAgbiA9IG4gfHwgMjtcclxuICAgICAgICB0aGlzLnNbbl0ucGFkZGluZyA9ICggeSB8fCAwICkgKydweCAwcHgnO1xyXG4gICAgICAgIHRoaXMuY1tuXS5pbm5lckhUTUwgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTs7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy5zYjtcclxuICAgICAgICBsZXQgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IGRjID0gIDM7XHJcbiAgICAgICAgbGV0IHNpemUgPSBNYXRoLmZsb29yKCAoIHctKGRjKihpLTEpKSApIC8gaSApO1xyXG5cclxuICAgICAgICB3aGlsZShpLS0pe1xyXG5cclxuICAgICAgICBcdHRoaXMudG1wW2ldID0gWyBNYXRoLmZsb29yKCBkICsgKCBzaXplICogaSApICsgKCBkYyAqIGkgKSksIHNpemUgXTtcclxuICAgICAgICBcdHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXTtcclxuICAgICAgICAgICAgc1tpKzJdLmxlZnQgPSB0aGlzLnRtcFtpXVswXSArICdweCc7XHJcbiAgICAgICAgICAgIHNbaSsyXS53aWR0aCA9IHRoaXMudG1wW2ldWzFdICsgJ3B4JztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVtcHR5IGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG5cdCAgICBvLnNpbXBsZSA9IHRydWU7XHJcblx0ICAgIG8uaXNFbXB0eSA9IHRydWU7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG4gICAgXHJcbn1cclxuIiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBJdGVtIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMucCA9IDEwMDtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy50eHQ7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLml0eXBlID0gby5pdHlwZSB8fCAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy52YWwgPSB0aGlzLml0eXBlO1xyXG5cclxuICAgICAgICB0aGlzLmdyYXBoID0gdGhpcy5zdmdzWyB0aGlzLml0eXBlIF07XHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNztcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdwYXRoJywgdGhpcy5jc3MuYmFzaWMgKyAncG9zaXRpb246YWJzb2x1dGU7IHdpZHRoOjE0cHg7IGhlaWdodDoxNHB4OyBsZWZ0OjVweDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLmdyYXBoLCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc1sxXS5tYXJnaW5MZWZ0ID0gMjAgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG5cclxuICAgICAgICAvL3VwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgbmFtZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLnJlc2V0SXRlbSgpO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdGVkKCB0cnVlICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdWlvdXQgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSgzKTtcclxuICAgICAgICBlbHNlIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdWlvdmVyICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoNCk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm1vZGUoMik7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8qclNpemUgKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgfSovXHJcblxyXG4gICAgbW9kZSAoIG4gKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdHVzICE9PSBuICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9IG47XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0dXMgPSAxOyB0aGlzLnNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgdGhpcy5zWzBdLmJhY2tncm91bmQgPSAnbm9uZSc7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXR1cyA9IDI7IHRoaXMuc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuYmdPdmVyOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0dXMgPSAzOyB0aGlzLnNbMV0uY29sb3IgPSAnI0ZGRic7ICAgICAgICAgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiB0aGlzLnN0YXR1cyA9IDQ7IHRoaXMuc1sxXS5jb2xvciA9ICcjRkZGJzsgICAgICAgICB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAvLyByZXR1cm4gdGhpcy5tb2RlKCAxICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdGVkICggYiApe1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbGVjdCA9IGIgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDMpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWQgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IG8udmFsdWVzIHx8IFtdO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIHRoaXMudmFsdWVzID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWVzID0gWyB0aGlzLnZhbHVlcyBdO1xyXG5cclxuICAgICAgICAvL3RoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcbiAgICAgICAgdGhpcy5idXR0b25PdmVyID0gby5iT3ZlciB8fCB0aGlzLmNvbG9ycy5vdmVyO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uRG93biA9IG8uYkRvd24gfHwgdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG5cclxuICAgICAgICB0aGlzLnNwYWNlcyA9IG8uc3BhY2VzIHx8IFsxMCwzXTtcclxuICAgICAgICB0aGlzLmJzaXplID0gby5ic2l6ZSB8fCBbOTAsMjBdO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZXMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMudG1wID0gW107XHJcbiAgICAgICAgdGhpcy5zdGF0ID0gW107XHJcbiAgICAgICAgdGhpcy5ncmlkID0gWzIsIE1hdGgucm91bmQoIHRoaXMubG5nICogMC41ICkgXTtcclxuICAgICAgICB0aGlzLmggPSBNYXRoLnJvdW5kKCB0aGlzLmxuZyAqIDAuNSApICogKCB0aGlzLmJzaXplWzFdICsgdGhpcy5zcGFjZXNbMV0gKSArIHRoaXMuc3BhY2VzWzFdOyBcclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSAnJztcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICd0YWJsZScsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IHRvcDonKyh0aGlzLnNwYWNlc1sxXS0yKSsncHg7IGhlaWdodDphdXRvOyBib3JkZXItY29sbGFwc2U6c2VwYXJhdGU7IGJvcmRlcjpub25lOyBib3JkZXItc3BhY2luZzogJysodGhpcy5zcGFjZXNbMF0tMikrJ3B4ICcrKHRoaXMuc3BhY2VzWzFdLTIpKydweDsnICk7XHJcblxyXG4gICAgICAgIGxldCBuID0gMCwgYiwgbWlkLCB0ZCwgdHI7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9ucyA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3RhdCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWSA9IFtdO1xyXG5cclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRbMV07IGkrKyApe1xyXG4gICAgICAgICAgICB0ciA9IHRoaXMuY1syXS5pbnNlcnRSb3coKTtcclxuICAgICAgICAgICAgdHIuc3R5bGUuY3NzVGV4dCA9ICdwb2ludGVyLWV2ZW50czpub25lOyc7XHJcbiAgICAgICAgICAgIGZvciggbGV0IGogPSAwOyBqIDwgdGhpcy5ncmlkWzBdOyBqKysgKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0ZCA9IHRyLmluc2VydENlbGwoKTtcclxuICAgICAgICAgICAgICAgIHRkLnN0eWxlLmNzc1RleHQgPSAncG9pbnRlci1ldmVudHM6bm9uZTsnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1tuXSApe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICAgICAgICAgICAgICAgICAgICBiLnN0eWxlLmNzc1RleHQgPSB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAncG9zaXRpb246c3RhdGljOyB3aWR0aDonK3RoaXMuYnNpemVbMF0rJ3B4OyBoZWlnaHQ6Jyt0aGlzLmJzaXplWzFdKydweDsgYm9yZGVyOicrdGhpcy5jb2xvcnMuYnV0dG9uQm9yZGVyKyc7IGxlZnQ6YXV0bzsgcmlnaHQ6YXV0bzsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsgIGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JztcclxuICAgICAgICAgICAgICAgICAgICBiLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW25dO1xyXG4gICAgICAgICAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKCBiICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5wdXNoKGIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdC5wdXNoKDEpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuc3R5bGUuY3NzVGV4dCA9IHRoaXMuY3NzLnR4dCArICdwb3NpdGlvbjpzdGF0aWM7IHdpZHRoOicrdGhpcy5ic2l6ZVswXSsncHg7IGhlaWdodDonK3RoaXMuYnNpemVbMV0rJ3B4OyB0ZXh0LWFsaWduOmNlbnRlcjsgIGxlZnQ6YXV0bzsgcmlnaHQ6YXV0bzsgYmFja2dyb3VuZDpub25lOyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGQuYXBwZW5kQ2hpbGQoIGIgKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoaj09PTApIGIuc3R5bGUuY3NzVGV4dCArPSAnZmxvYXQ6cmlnaHQ7JztcclxuICAgICAgICAgICAgICAgIGVsc2UgYi5zdHlsZS5jc3NUZXh0ICs9ICdmbG9hdDpsZWZ0Oyc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbisrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gLTE7XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCB0eCA9IHRoaXMudG1wWDtcclxuICAgICAgICBsZXQgdHkgPSB0aGlzLnRtcFk7XHJcblxyXG4gICAgICAgIGxldCBpZCA9IC0xO1xyXG4gICAgICAgIGxldCBjID0gLTE7XHJcbiAgICAgICAgbGV0IGxpbmUgPSAtMTtcclxuICAgICAgICBsZXQgaSA9IHRoaXMuZ3JpZFswXTtcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgXHRpZiggbC54ID4gdHhbaV1bMF0gJiYgbC54IDwgdHhbaV1bMV0gKSBjID0gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSB0aGlzLmdyaWRbMV07XHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggbC55ID4gdHlbaV1bMF0gJiYgbC55IDwgdHlbaV1bMV0gKSBsaW5lID0gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKGMhPT0tMSAmJiBsaW5lIT09LTEpe1xyXG4gICAgICAgICAgICBpZCA9IGMgKyAobGluZSoyKTtcclxuICAgICAgICAgICAgaWYoaWQ+dGhpcy5sbmctMSkgaWQgPSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpZDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuICAgIFxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgIFx0bGV0IGlkID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggaWQgPCAwICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlc1tpZF07XHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcbiAgICBcdHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGlkID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggaWQgIT09IC0xICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgaWQgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgIFx0dXAgPSB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb2RlcyAoIG4sIGlkICkge1xyXG5cclxuICAgICAgICBsZXQgdiwgciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMubG5nOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpID09PSBpZCApIHYgPSB0aGlzLm1vZGUoIG4sIGkgKTtcclxuICAgICAgICAgICAgZWxzZSB2ID0gdGhpcy5tb2RlKCAxLCBpICk7XHJcblxyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4sIGlkICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBpID0gaWQ7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXRbaV0gIT09IG4gKXtcclxuICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnN0YXRbaV0gPSAxOyB0aGlzLmJ1dHRvbnNbIGkgXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyAgdGhpcy5idXR0b25zWyBpIF0uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXRbaV0gPSAyOyB0aGlzLmJ1dHRvbnNbIGkgXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5idXR0b25zWyBpIF0uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uT3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdFtpXSA9IDM7IHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLmJ1dHRvbnNbIGkgXS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Eb3duOyBicmVhaztcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoYW5nZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlcyggMSAsIDAgKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgbGFiZWwgKCBzdHJpbmcsIG4gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uc1tuXS50ZXh0Q29udGVudCA9IHN0cmluZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaWNvbiAoIHN0cmluZywgeSwgbiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25zW25dLnN0eWxlLnBhZGRpbmcgPSAoIHkgfHwgMCApICsncHggMHB4JztcclxuICAgICAgICB0aGlzLmJ1dHRvbnNbbl0uaW5uZXJIVE1MID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBuID0gMCwgYiwgbWlkO1xyXG5cclxuICAgICAgICB0aGlzLnRtcFggPSBbXTtcclxuICAgICAgICB0aGlzLnRtcFkgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaiA9IDA7IGogPCB0aGlzLmdyaWRbMF07IGorKyApe1xyXG5cclxuICAgICAgICAgICAgaWYoaj09PTApe1xyXG4gICAgICAgICAgICAgICAgbWlkID0gKCB0aGlzLncqMC41ICkgLSAoIHRoaXMuc3BhY2VzWzBdKjAuNSApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50bXBYLnB1c2goIFsgbWlkLXRoaXMuYnNpemVbMF0sIG1pZCBdICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtaWQgPSAoIHRoaXMudyowLjUgKSArICggdGhpcy5zcGFjZXNbMF0qMC41ICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRtcFgucHVzaCggWyBtaWQsIG1pZCt0aGlzLmJzaXplWzBdIF0gKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1pZCA9IHRoaXMuc3BhY2VzWzFdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMuZ3JpZFsxXTsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRtcFkucHVzaCggWyBtaWQsIG1pZCArIHRoaXMuYnNpemVbMV0gXSApO1xyXG5cclxuICAgICAgICAgICAgbWlkICs9IHRoaXMuYnNpemVbMV0gKyB0aGlzLnNwYWNlc1sxXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0iLCJcclxuaW1wb3J0IHsgQm9vbCB9IGZyb20gJy4uL3Byb3RvL0Jvb2wuanMnO1xyXG5pbXBvcnQgeyBCdXR0b24gfSBmcm9tICcuLi9wcm90by9CdXR0b24uanMnO1xyXG5pbXBvcnQgeyBDaXJjdWxhciB9IGZyb20gJy4uL3Byb3RvL0NpcmN1bGFyLmpzJztcclxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICcuLi9wcm90by9Db2xvci5qcyc7XHJcbmltcG9ydCB7IEZwcyB9IGZyb20gJy4uL3Byb3RvL0Zwcy5qcyc7XHJcbmltcG9ydCB7IEdyYXBoIH0gZnJvbSAnLi4vcHJvdG8vR3JhcGguanMnO1xyXG5pbXBvcnQgeyBHcm91cCAgfSBmcm9tICcuLi9wcm90by9Hcm91cC5qcyc7XHJcbmltcG9ydCB7IEpveXN0aWNrIH0gZnJvbSAnLi4vcHJvdG8vSm95c3RpY2suanMnO1xyXG5pbXBvcnQgeyBLbm9iIH0gZnJvbSAnLi4vcHJvdG8vS25vYi5qcyc7XHJcbmltcG9ydCB7IExpc3QgfSBmcm9tICcuLi9wcm90by9MaXN0LmpzJztcclxuaW1wb3J0IHsgTnVtZXJpYyB9IGZyb20gJy4uL3Byb3RvL051bWVyaWMuanMnO1xyXG5pbXBvcnQgeyBTbGlkZSB9IGZyb20gJy4uL3Byb3RvL1NsaWRlLmpzJztcclxuaW1wb3J0IHsgVGV4dElucHV0IH0gZnJvbSAnLi4vcHJvdG8vVGV4dElucHV0LmpzJztcclxuaW1wb3J0IHsgVGl0bGUgfSBmcm9tICcuLi9wcm90by9UaXRsZS5qcyc7XHJcbmltcG9ydCB7IFNlbGVjdCB9IGZyb20gJy4uL3Byb3RvL1NlbGVjdC5qcyc7XHJcbmltcG9ydCB7IFNlbGVjdG9yIH0gZnJvbSAnLi4vcHJvdG8vU2VsZWN0b3IuanMnO1xyXG5pbXBvcnQgeyBFbXB0eSB9IGZyb20gJy4uL3Byb3RvL0VtcHR5LmpzJztcclxuaW1wb3J0IHsgSXRlbSB9IGZyb20gJy4uL3Byb3RvL0l0ZW0uanMnO1xyXG5pbXBvcnQgeyBHcmlkIH0gZnJvbSAnLi4vcHJvdG8vR3JpZC5qcyc7XHJcblxyXG5leHBvcnQgY2xhc3MgYWRkIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gYXJndW1lbnRzOyBcclxuXHJcbiAgICAgICAgbGV0IHR5cGUsIG8sIHJlZiA9IGZhbHNlLCBuID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiBhWzBdID09PSAnc3RyaW5nJyApeyBcclxuXHJcbiAgICAgICAgICAgIHR5cGUgPSBhWzBdO1xyXG4gICAgICAgICAgICBvID0gYVsxXSB8fCB7fTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mIGFbMF0gPT09ICdvYmplY3QnICl7IC8vIGxpa2UgZGF0IGd1aVxyXG5cclxuICAgICAgICAgICAgcmVmID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYoIGFbMl0gPT09IHVuZGVmaW5lZCApIFtdLnB1c2guY2FsbChhLCB7fSk7XHJcblxyXG4gICAgICAgICAgICB0eXBlID0gYVsyXS50eXBlID8gYVsyXS50eXBlIDogJ3NsaWRlJzsvL2F1dG9UeXBlLmFwcGx5KCB0aGlzLCBhICk7XHJcblxyXG4gICAgICAgICAgICBvID0gYVsyXTtcclxuICAgICAgICAgICAgby5uYW1lID0gYVsxXTtcclxuICAgICAgICAgICAgby52YWx1ZSA9IGFbMF1bYVsxXV07XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnZ3JvdXAnICkgby5hZGQgPSBhZGQ7XHJcblxyXG4gICAgICAgIHN3aXRjaCggbmFtZSApe1xyXG5cclxuICAgICAgICAgICAgY2FzZSAnYm9vbCc6IG4gPSBuZXcgQm9vbChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2J1dHRvbic6IG4gPSBuZXcgQnV0dG9uKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnY2lyY3VsYXInOiBuID0gbmV3IENpcmN1bGFyKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnY29sb3InOiBuID0gbmV3IENvbG9yKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZnBzJzogbiA9IG5ldyBGcHMobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdncmFwaCc6IG4gPSBuZXcgR3JhcGgobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdncm91cCc6IG4gPSBuZXcgR3JvdXAobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdqb3lzdGljayc6IG4gPSBuZXcgSm95c3RpY2sobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdrbm9iJzogbiA9IG5ldyBLbm9iKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbGlzdCc6IG4gPSBuZXcgTGlzdChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ251bWVyaWMnOiBjYXNlICdudW1iZXInOiBuID0gbmV3IE51bWVyaWMobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzbGlkZSc6IG4gPSBuZXcgU2xpZGUobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0ZXh0SW5wdXQnOiBjYXNlICdzdHJpbmcnOiBuID0gbmV3IFRleHRJbnB1dChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RpdGxlJzogbiA9IG5ldyBUaXRsZShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6IG4gPSBuZXcgU2VsZWN0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2VsZWN0b3InOiBuID0gbmV3IFNlbGVjdG9yKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZW1wdHknOiBjYXNlICdzcGFjZSc6IG4gPSBuZXcgRW1wdHkobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdpdGVtJzogbiA9IG5ldyBJdGVtKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZ3JpZCc6IG4gPSBuZXcgR3JpZChvKTsgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG4gIT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCByZWYgKSBuLnNldFJlZmVyZW5jeSggYVswXSwgYVsxXSApO1xyXG4gICAgICAgICAgICByZXR1cm4gbjtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufSIsIlxyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4vUm9vdHMnO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4vVG9vbHMnO1xyXG5pbXBvcnQgeyBhZGQgfSBmcm9tICcuL2FkZCc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi9WMic7XHJcblxyXG4vKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG5leHBvcnQgY2xhc3MgR3VpIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIGNvbG9yXHJcbiAgICAgICAgdGhpcy5jb2xvcnMgPSBUb29scy5jbG9uZUNvbG9yKCk7XHJcbiAgICAgICAgdGhpcy5jc3MgPSBUb29scy5jbG9uZUNzcygpO1xyXG5cclxuXHJcbiAgICAgICAgaWYoIG8uY29uZmlnICkgdGhpcy5zZXRDb25maWcoIG8uY29uZmlnICk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmJnID0gby5iZyB8fCB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kO1xyXG5cclxuICAgICAgICBpZiggby50cmFuc3BhcmVudCAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzLmJhY2tncm91bmRPdmVyID0gJ25vbmUnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9pZiggby5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2sgPSAgby5jYWxsYmFjaztcclxuXHJcbiAgICAgICAgdGhpcy5pc1Jlc2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBBZGQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudG1wSCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuaXNDYW52YXMgPSBvLmlzQ2FudmFzIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNDYW52YXNPbmx5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jc3NHdWkgPSBvLmNzcyAhPT0gdW5kZWZpbmVkID8gby5jc3MgOiAnJztcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gby5jYWxsYmFjayAgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvLmNhbGxiYWNrO1xyXG5cclxuICAgICAgICB0aGlzLmZvcmNlSGVpZ2h0ID0gby5tYXhIZWlnaHQgfHwgMDtcclxuICAgICAgICB0aGlzLmxvY2tIZWlnaHQgPSBvLmxvY2tIZWlnaHQgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNJdGVtTW9kZSA9IG8uaXRlbU1vZGUgIT09IHVuZGVmaW5lZCA/IG8uaXRlbU1vZGUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jbiA9ICcnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHNpemUgZGVmaW5lXHJcbiAgICAgICAgdGhpcy5zaXplID0gVG9vbHMuc2l6ZTtcclxuICAgICAgICBpZiggby5wICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUucCA9IG8ucDtcclxuICAgICAgICBpZiggby53ICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUudyA9IG8udztcclxuICAgICAgICBpZiggby5oICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUuaCA9IG8uaDtcclxuICAgICAgICBpZiggby5zICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUucyA9IG8ucztcclxuXHJcbiAgICAgICAgdGhpcy5zaXplLmggPSB0aGlzLnNpemUuaCA8IDExID8gMTEgOiB0aGlzLnNpemUuaDtcclxuXHJcbiAgICAgICAgLy8gbG9jYWwgbW91c2UgYW5kIHpvbmVcclxuICAgICAgICB0aGlzLmxvY2FsID0gbmV3IFYyKCkubmVnKCk7XHJcbiAgICAgICAgdGhpcy56b25lID0geyB4OjAsIHk6MCwgdzp0aGlzLnNpemUudywgaDowIH07XHJcblxyXG4gICAgICAgIC8vIHZpcnR1YWwgbW91c2VcclxuICAgICAgICB0aGlzLm1vdXNlID0gbmV3IFYyKCkubmVnKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IDA7XHJcbiAgICAgICAgdGhpcy5wcmV2WSA9IC0xO1xyXG4gICAgICAgIHRoaXMuc3cgPSAwO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy8gYm90dG9tIGFuZCBjbG9zZSBoZWlnaHRcclxuICAgICAgICB0aGlzLmlzV2l0aENsb3NlID0gby5jbG9zZSAhPT0gdW5kZWZpbmVkID8gby5jbG9zZSA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5iaCA9ICF0aGlzLmlzV2l0aENsb3NlID8gMCA6IHRoaXMuc2l6ZS5oO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9SZXNpemUgPSBvLmF1dG9SZXNpemUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvLmF1dG9SZXNpemU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pc0NlbnRlciA9IG8uY2VudGVyIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNTY3JvbGwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy51aXMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZGVjYWwgPSAwO1xyXG4gICAgICAgIHRoaXMucmF0aW8gPSAxO1xyXG4gICAgICAgIHRoaXMub3kgPSAwO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuaXNOZXdUYXJnZXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50ID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIHdpZHRoOjBweDsgaGVpZ2h0OmF1dG87IHRvcDowcHg7ICcgKyB0aGlzLmNzc0d1aSApO1xyXG5cclxuICAgICAgICB0aGlzLmlubmVyQ29udGVudCA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IHRvcDowOyBsZWZ0OjA7IGhlaWdodDphdXRvOyBvdmVyZmxvdzpoaWRkZW47Jyk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LmFwcGVuZENoaWxkKCB0aGlzLmlubmVyQ29udGVudCApO1xyXG5cclxuICAgICAgICB0aGlzLmlubmVyID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgbGVmdDowOyAnKTtcclxuICAgICAgICB0aGlzLmlubmVyQ29udGVudC5hcHBlbmRDaGlsZCh0aGlzLmlubmVyKTtcclxuXHJcbiAgICAgICAgLy8gc2Nyb2xsXHJcbiAgICAgICAgdGhpcy5zY3JvbGxCRyA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3JpZ2h0OjA7IHRvcDowOyB3aWR0aDonKyAodGhpcy5zaXplLnMgLSAxKSArJ3B4OyBoZWlnaHQ6MTBweDsgZGlzcGxheTpub25lOyBiYWNrZ3JvdW5kOicrdGhpcy5iZysnOycpO1xyXG4gICAgICAgIHRoaXMuY29udGVudC5hcHBlbmRDaGlsZCggdGhpcy5zY3JvbGxCRyApO1xyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbCA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2JhY2tncm91bmQ6Jyt0aGlzLmNvbG9ycy5zY3JvbGwrJzsgcmlnaHQ6MnB4OyB0b3A6MDsgd2lkdGg6JysodGhpcy5zaXplLnMtNCkrJ3B4OyBoZWlnaHQ6MTBweDsnKTtcclxuICAgICAgICB0aGlzLnNjcm9sbEJHLmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbCApO1xyXG5cclxuICAgICAgICAvLyBib3R0b20gYnV0dG9uXHJcbiAgICAgICAgdGhpcy5ib3R0b20gPSBUb29scy5kb20oICdkaXYnLCAgdGhpcy5jc3MudHh0ICsgJ3dpZHRoOjEwMCU7IHRvcDphdXRvOyBib3R0b206MDsgbGVmdDowOyBib3JkZXItYm90dG9tLXJpZ2h0LXJhZGl1czoxMHB4OyAgYm9yZGVyLWJvdHRvbS1sZWZ0LXJhZGl1czoxMHB4OyB0ZXh0LWFsaWduOmNlbnRlcjsgaGVpZ2h0OicrdGhpcy5iaCsncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuYmgtNSkrJ3B4OyBib3JkZXItdG9wOjFweCBzb2xpZCAnK1Rvb2xzLmNvbG9ycy5zdHJva2UrJzsnKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuYm90dG9tICk7XHJcbiAgICAgICAgdGhpcy5ib3R0b20udGV4dENvbnRlbnQgPSAnY2xvc2UnO1xyXG4gICAgICAgIHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJnO1xyXG5cclxuICAgICAgICAvL1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudCA9IG8ucGFyZW50ICE9PSB1bmRlZmluZWQgPyBvLnBhcmVudCA6IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHRoaXMucGFyZW50ID09PSBudWxsICYmICF0aGlzLmlzQ2FudmFzICl7IFxyXG4gICAgICAgIFx0dGhpcy5wYXJlbnQgPSBkb2N1bWVudC5ib2R5O1xyXG4gICAgICAgICAgICAvLyBkZWZhdWx0IHBvc2l0aW9uXHJcbiAgICAgICAgXHRpZiggIXRoaXMuaXNDZW50ZXIgKSB0aGlzLmNvbnRlbnQuc3R5bGUucmlnaHQgPSAnMTBweCc7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMucGFyZW50ICE9PSBudWxsICkgdGhpcy5wYXJlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuY29udGVudCApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0NhbnZhcyAmJiB0aGlzLnBhcmVudCA9PT0gbnVsbCApIHRoaXMuaXNDYW52YXNPbmx5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzQ2FudmFzT25seSApIHRoaXMuY29udGVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ2F1dG8nO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5zZXRXaWR0aCgpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0NhbnZhcyApIHRoaXMubWFrZUNhbnZhcygpO1xyXG5cclxuICAgICAgICBSb290cy5hZGQoIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0VG9wICggdCwgaCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50LnN0eWxlLnRvcCA9IHQgKyAncHgnO1xyXG4gICAgICAgIGlmKCBoICE9PSB1bmRlZmluZWQgKSB0aGlzLmZvcmNlSGVpZ2h0ID0gaDtcclxuICAgICAgICB0aGlzLnNldEhlaWdodCgpO1xyXG5cclxuICAgICAgICBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9jYWxsYmFjazogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgZGlzcG9zZSAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICBpZiggdGhpcy5wYXJlbnQgIT09IG51bGwgKSB0aGlzLnBhcmVudC5yZW1vdmVDaGlsZCggdGhpcy5jb250ZW50ICk7XHJcbiAgICAgICAgUm9vdHMucmVtb3ZlKCB0aGlzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQ0FOVkFTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgb25EcmF3ICgpIHt9XHJcblxyXG4gICAgbWFrZUNhbnZhcyAoKSB7XHJcblxyXG4gICAgXHR0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnLCBcImNhbnZhc1wiICk7XHJcbiAgICBcdHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy56b25lLnc7XHJcbiAgICBcdHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuZm9yY2VIZWlnaHQgPyB0aGlzLmZvcmNlSGVpZ2h0IDogdGhpcy56b25lLmg7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcgKCBmb3JjZSApIHtcclxuXHJcbiAgICBcdGlmKCB0aGlzLmNhbnZhcyA9PT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICBcdGxldCB3ID0gdGhpcy56b25lLnc7XHJcbiAgICBcdGxldCBoID0gdGhpcy5mb3JjZUhlaWdodCA/IHRoaXMuZm9yY2VIZWlnaHQgOiB0aGlzLnpvbmUuaDtcclxuICAgIFx0Um9vdHMudG9DYW52YXMoIHRoaXMsIHcsIGgsIGZvcmNlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vLy8vL1xyXG5cclxuICAgIGdldERvbSAoKSB7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldE1vdXNlICggbSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5tb3VzZS5zZXQoIG0ueCwgbS55ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldENvbmZpZyAoIG8gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0Q29sb3JzKCBvICk7XHJcbiAgICAgICAgdGhpcy5zZXRUZXh0KCBvLmZvbnRTaXplLCBvLnRleHQsIG8uZm9udCwgby5zaGFkb3cgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29sb3JzICggbyApIHtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgYyBpbiBvICl7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmNvbG9yc1tjXSApIHRoaXMuY29sb3JzW2NdID0gb1tjXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQgKCBzaXplLCBjb2xvciwgZm9udCwgc2hhZG93ICkge1xyXG5cclxuICAgICAgICBUb29scy5zZXRUZXh0KCBzaXplLCBjb2xvciwgZm9udCwgc2hhZG93LCB0aGlzLmNvbG9ycywgdGhpcy5jc3MgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaGlkZSAoIGIgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS5kaXNwbGF5ID0gYiA/ICdub25lJyA6ICdibG9jayc7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgb25DaGFuZ2UgKCBmICkge1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gZiB8fCBudWxsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFNUWUxFU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGUgKCBuICkge1xyXG5cclxuICAgIFx0bGV0IG5lZWRDaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICBcdGlmKCBuICE9PSB0aGlzLmNuICl7XHJcblxyXG5cdCAgICBcdHRoaXMuY24gPSBuO1xyXG5cclxuXHQgICAgXHRzd2l0Y2goIG4gKXtcclxuXHJcblx0ICAgIFx0XHRjYXNlICdkZWYnOiBcclxuXHQgICAgXHRcdCAgIHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGw7IFxyXG5cdCAgICBcdFx0ICAgdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7XHJcblx0ICAgIFx0XHQgICB0aGlzLmJvdHRvbS5zdHlsZS5jb2xvciA9IHRoaXMuY29sb3JzLnRleHQ7XHJcblx0ICAgIFx0XHRicmVhaztcclxuXHJcblx0ICAgIFx0XHQvL2Nhc2UgJ3Njcm9sbERlZic6IHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGw7IGJyZWFrO1xyXG5cdCAgICBcdFx0Y2FzZSAnc2Nyb2xsT3Zlcic6IHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7IGJyZWFrO1xyXG5cdCAgICBcdFx0Y2FzZSAnc2Nyb2xsRG93bic6IHRoaXMuc2Nyb2xsLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duOyBicmVhaztcclxuXHJcblx0ICAgIFx0XHQvL2Nhc2UgJ2JvdHRvbURlZic6IHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kOyBicmVhaztcclxuXHQgICAgXHRcdGNhc2UgJ2JvdHRvbU92ZXInOiB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXI7IHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gJyNGRkYnOyBicmVhaztcclxuXHQgICAgXHRcdC8vY2FzZSAnYm90dG9tRG93bic6IHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7IHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gJyMwMDAnOyBicmVhaztcclxuXHJcblx0ICAgIFx0fVxyXG5cclxuXHQgICAgXHRuZWVkQ2hhbmdlID0gdHJ1ZTtcclxuXHJcblx0ICAgIH1cclxuXHJcbiAgICBcdHJldHVybiBuZWVkQ2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFRBUkdFVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNsZWFyVGFyZ2V0ICgpIHtcclxuXHJcbiAgICBcdGlmKCB0aGlzLmN1cnJlbnQgPT09IC0xICkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIC8vaWYoIXRoaXMudGFyZ2V0KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50YXJnZXQudWlvdXQoKTtcclxuICAgICAgICB0aGlzLnRhcmdldC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuXHJcbiAgICAgICAgLy8vY29uc29sZS5sb2codGhpcy5pc0Rvd24pLy9pZih0aGlzLmlzRG93bilSb290cy5jbGVhcklucHV0KCk7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBSb290cy5jdXJzb3IoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBaT05FIFRFU1RcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICB0aGlzLmlzUmVzZXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSAnJztcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLmlzU2Nyb2xsID8gIHRoaXMuem9uZS53ICAtIHRoaXMuc2l6ZS5zIDogdGhpcy56b25lLnc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIGwueSA+IHRoaXMuem9uZS5oIC0gdGhpcy5iaCAmJiAgbC55IDwgdGhpcy56b25lLmggKSBuYW1lID0gJ2JvdHRvbSc7XHJcbiAgICAgICAgZWxzZSBuYW1lID0gbC54ID4gcyA/ICdzY3JvbGwnIDogJ2NvbnRlbnQnO1xyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBoYW5kbGVFdmVudCAoIGUgKSB7XHJcblxyXG4gICAgXHRsZXQgdHlwZSA9IGUudHlwZTtcclxuXHJcbiAgICBcdGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuICAgIFx0bGV0IHRhcmdldENoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgIFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgIFx0aWYoIHR5cGUgPT09ICdtb3VzZXVwJyAmJiB0aGlzLmlzRG93biApIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICBcdGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyAmJiAhdGhpcy5pc0Rvd24gKSB0aGlzLmlzRG93biA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biAmJiB0aGlzLmlzTmV3VGFyZ2V0ICl7IFJvb3RzLmNsZWFySW5wdXQoKTsgdGhpcy5pc05ld1RhcmdldD1mYWxzZTsgfVxyXG5cclxuICAgIFx0aWYoICFuYW1lICkgcmV0dXJuO1xyXG5cclxuICAgIFx0c3dpdGNoKCBuYW1lICl7XHJcblxyXG4gICAgXHRcdGNhc2UgJ2NvbnRlbnQnOlxyXG5cclxuICAgICAgICAgICAgICAgIGUuY2xpZW50WSA9IHRoaXMuaXNTY3JvbGwgPyAgZS5jbGllbnRZICsgdGhpcy5kZWNhbCA6IGUuY2xpZW50WTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggUm9vdHMuaXNNb2JpbGUgJiYgdHlwZSA9PT0gJ21vdXNlZG93bicgKSB0aGlzLmdldE5leHQoIGUsIGNoYW5nZSApO1xyXG5cclxuXHQgICAgXHRcdGlmKCB0aGlzLnRhcmdldCApIHRhcmdldENoYW5nZSA9IHRoaXMudGFyZ2V0LmhhbmRsZUV2ZW50KCBlICk7XHJcblxyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5tb2RlKCdkZWYnKTtcclxuICAgICAgICAgICAgICAgIGlmKCB0eXBlID09PSAnd2hlZWwnICYmICF0YXJnZXRDaGFuZ2UgJiYgdGhpcy5pc1Njcm9sbCApIGNoYW5nZSA9IHRoaXMub25XaGVlbCggZSApO1xyXG4gICAgICAgICAgICAgICBcclxuXHQgICAgXHRcdGlmKCAhUm9vdHMubG9jayApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdldE5leHQoIGUsIGNoYW5nZSApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgIFx0XHRicmVhaztcclxuICAgIFx0XHRjYXNlICdib3R0b20nOlxyXG5cclxuXHQgICAgXHRcdHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHQgICAgXHRcdGlmKCB0eXBlID09PSAnbW91c2Vtb3ZlJyApIGNoYW5nZSA9IHRoaXMubW9kZSgnYm90dG9tT3ZlcicpO1xyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZWRvd24nICkge1xyXG5cdCAgICBcdFx0XHR0aGlzLmlzT3BlbiA9IHRoaXMuaXNPcGVuID8gZmFsc2UgOiB0cnVlO1xyXG5cdFx0ICAgICAgICAgICAgdGhpcy5ib3R0b20udGV4dENvbnRlbnQgPSB0aGlzLmlzT3BlbiA/ICdjbG9zZScgOiAnb3Blbic7XHJcblx0XHQgICAgICAgICAgICB0aGlzLnNldEhlaWdodCgpO1xyXG5cdFx0ICAgICAgICAgICAgdGhpcy5tb2RlKCdkZWYnKTtcclxuXHRcdCAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcblx0ICAgIFx0XHR9XHJcblxyXG4gICAgXHRcdGJyZWFrO1xyXG4gICAgXHRcdGNhc2UgJ3Njcm9sbCc6XHJcblxyXG5cdCAgICBcdFx0dGhpcy5jbGVhclRhcmdldCgpO1xyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5tb2RlKCdzY3JvbGxPdmVyJyk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ3Njcm9sbERvd24nKTsgXHJcbiAgICAgICAgICAgICAgICBpZiggdHlwZSA9PT0gJ3doZWVsJyApIGNoYW5nZSA9IHRoaXMub25XaGVlbCggZSApOyBcclxuXHQgICAgXHRcdGlmKCB0aGlzLmlzRG93biApIHRoaXMudXBkYXRlKCAoZS5jbGllbnRZLXRoaXMuem9uZS55KS0odGhpcy5zaCowLjUpICk7XHJcblxyXG4gICAgXHRcdGJyZWFrO1xyXG5cclxuXHJcbiAgICBcdH1cclxuXHJcbiAgICBcdGlmKCB0aGlzLmlzRG93biApIGNoYW5nZSA9IHRydWU7XHJcbiAgICBcdGlmKCB0YXJnZXRDaGFuZ2UgKSBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggdHlwZSA9PT0gJ2tleXVwJyApIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgaWYoIHR5cGUgPT09ICdrZXlkb3duJyApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgXHRpZiggY2hhbmdlICkgdGhpcy5kcmF3KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldE5leHQgKCBlLCBjaGFuZ2UgKSB7XHJcblxyXG5cclxuXHJcbiAgICAgICAgbGV0IG5leHQgPSBSb290cy5maW5kVGFyZ2V0KCB0aGlzLnVpcywgZSApO1xyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gdGhpcy5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV4dDtcclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNOZXdUYXJnZXQgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSAtMSApeyBcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnVpc1sgdGhpcy5jdXJyZW50IF07XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnVpb3ZlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgb25XaGVlbCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMub3kgKz0gMjAqZS5kZWx0YTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSggdGhpcy5veSApO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFU0VUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCBmb3JjZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNSZXNldCApIHJldHVybjtcclxuXHJcbiAgICAgICAgLy90aGlzLnJlc2V0SXRlbSgpO1xyXG5cclxuICAgICAgICB0aGlzLm1vdXNlLm5lZygpO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vUm9vdHMuY2xlYXJJbnB1dCgpO1xyXG4gICAgICAgIGxldCByID0gdGhpcy5tb2RlKCdkZWYnKTtcclxuICAgICAgICBsZXQgcjIgPSB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcblxyXG4gICAgICAgIGlmKCByIHx8IHIyICkgdGhpcy5kcmF3KCB0cnVlICk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNSZXNldCA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vUm9vdHMubG9jayA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEFERCBOT0RFXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYWRkICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGEgPSBhcmd1bWVudHM7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgYVsxXSA9PT0gJ29iamVjdCcgKXsgXHJcblxyXG4gICAgICAgICAgICBhWzFdLmlzVUkgPSB0cnVlO1xyXG4gICAgICAgICAgICBhWzFdLm1haW4gPSB0aGlzO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBhWzFdID09PSAnc3RyaW5nJyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGFbMl0gPT09IHVuZGVmaW5lZCApIFtdLnB1c2guY2FsbChhLCB7IGlzVUk6dHJ1ZSwgbWFpbjp0aGlzIH0pO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFbMl0uaXNVSSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBhWzJdLm1haW4gPSB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIGxldCB1ID0gYWRkLmFwcGx5KCB0aGlzLCBhICk7XHJcblxyXG4gICAgICAgIGlmKCB1ID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuXHJcbiAgICAgICAgLy9sZXQgbiA9IGFkZC5hcHBseSggdGhpcywgYSApO1xyXG4gICAgICAgIC8vbGV0IG4gPSBVSUwuYWRkKCAuLi5hcmdzICk7XHJcblxyXG4gICAgICAgIHRoaXMudWlzLnB1c2goIHUgKTtcclxuICAgICAgICAvL24ucHkgPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIGlmKCAhdS5hdXRvV2lkdGggKXtcclxuICAgICAgICAgICAgbGV0IHkgPSB1LmNbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wO1xyXG4gICAgICAgICAgICBpZiggdGhpcy5wcmV2WSAhPT0geSApe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxjKCB1LmggKyAxICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZZID0geTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICB0aGlzLnByZXZZID0gMDsvLy0xO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGMoIHUuaCArIDEgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBhcHBseUNhbGMgKCkge1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMudWlzLmxlbmd0aCwgdGhpcy50bXBIIClcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjKCB0aGlzLnRtcEggKTtcclxuICAgICAgICAvL3RoaXMudG1wSCA9IDA7XHJcbiAgICAgICAgdGhpcy50bXBBZGQgPSBudWxsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjYWxjVWlzICgpIHtcclxuXHJcbiAgICAgICAgUm9vdHMuY2FsY1VpcyggdGhpcy51aXMsIHRoaXMuem9uZSwgdGhpcy56b25lLnkgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIG9uZSBub2RlXHJcblxyXG4gICAgcmVtb3ZlICggbiApIHsgXHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMuaW5kZXhPZiggbiApOyBcclxuICAgICAgICBpZiAoIGkgIT09IC0xICkgdGhpcy51aXNbaV0uY2xlYXIoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2FsbCBhZnRlciB1aXMgY2xlYXJcclxuXHJcbiAgICBjbGVhck9uZSAoIG4gKSB7IFxyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmluZGV4T2YoIG4gKTsgXHJcbiAgICAgICAgaWYgKCBpICE9PSAtMSApIHtcclxuICAgICAgICAgICAgdGhpcy5pbm5lci5yZW1vdmVDaGlsZCggdGhpcy51aXNbaV0uY1swXSApO1xyXG4gICAgICAgICAgICB0aGlzLnVpcy5zcGxpY2UoIGksIDEgKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBjbGVhciBhbGwgZ3VpXHJcblxyXG4gICAgY2xlYXIgKCkge1xyXG5cclxuICAgICAgICAvL3RoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMudWlzW2ldLmNsZWFyKCk7XHJcblxyXG4gICAgICAgIHRoaXMudWlzID0gW107XHJcbiAgICAgICAgUm9vdHMubGlzdGVucyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGMoIC10aGlzLmggKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJVEVNUyBTUEVDSUFMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAgIHJlc2V0SXRlbSAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0l0ZW1Nb2RlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMudWlzW2ldLnNlbGVjdGVkKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldEl0ZW0gKCBuYW1lICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNJdGVtTW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApe1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICBpZiggdGhpcy51aXNbaV0udmFsdWUgPT09IG5hbWUgKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVpc1tpXS5zZWxlY3RlZCggdHJ1ZSApO1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNTY3JvbGwgKSB0aGlzLnVwZGF0ZSggKCBpKih0aGlzLnVpc1tpXS5oKzEpICkqdGhpcy5yYXRpbyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU0NST0xMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdXBTY3JvbGwgKCBiICkge1xyXG5cclxuICAgICAgICB0aGlzLnN3ID0gYiA/IHRoaXMuc2l6ZS5zIDogMDtcclxuICAgICAgICB0aGlzLm95ID0gYiA/IHRoaXMub3kgOiAwO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsQkcuc3R5bGUuZGlzcGxheSA9IGIgPyAnYmxvY2snIDogJ25vbmUnO1xyXG5cclxuICAgICAgICBpZiggYiApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy50b3RhbCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWF4VmlldyA9IHRoaXMubWF4SGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yYXRpbyA9IHRoaXMubWF4VmlldyAvIHRoaXMudG90YWw7XHJcbiAgICAgICAgICAgIHRoaXMuc2ggPSB0aGlzLm1heFZpZXcgKiB0aGlzLnJhdGlvO1xyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5zaCA8IDIwICkgdGhpcy5zaCA9IDIwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4VmlldyAtIHRoaXMuc2g7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm95ID0gVG9vbHMuY2xhbXAoIHRoaXMub3ksIDAsIHRoaXMucmFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsQkcuc3R5bGUuaGVpZ2h0ID0gdGhpcy5tYXhWaWV3ICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGwuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaCArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRJdGVtV2lkdGgoIHRoaXMuem9uZS53IC0gdGhpcy5zdyApO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCB0aGlzLm95ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHkgKSB7XHJcblxyXG4gICAgICAgIHkgPSBUb29scy5jbGFtcCggeSwgMCwgdGhpcy5yYW5nZSApO1xyXG5cclxuICAgICAgICB0aGlzLmRlY2FsID0gTWF0aC5mbG9vciggeSAvIHRoaXMucmF0aW8gKTtcclxuICAgICAgICB0aGlzLmlubmVyLnN0eWxlLnRvcCA9IC0gdGhpcy5kZWNhbCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zY3JvbGwuc3R5bGUudG9wID0gTWF0aC5mbG9vciggeSApICsgJ3B4JztcclxuICAgICAgICB0aGlzLm95ID0geTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVNJWkUgRlVOQ1RJT05cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjYWxjICggeSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5oICs9IHk7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KCB0aGlzLnRtcCApO1xyXG4gICAgICAgIHRoaXMudG1wID0gc2V0VGltZW91dCggdGhpcy5zZXRIZWlnaHQuYmluZCh0aGlzKSwgMTAgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0SGVpZ2h0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudG1wICkgY2xlYXJUaW1lb3V0KCB0aGlzLnRtcCApO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuaCApXHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5iaDtcclxuICAgICAgICB0aGlzLmlzU2Nyb2xsID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGhoaCA9IHRoaXMuZm9yY2VIZWlnaHQgPyB0aGlzLmZvcmNlSGVpZ2h0ICsgdGhpcy56b25lLnkgOiB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1heEhlaWdodCA9IGhoaCAtIHRoaXMuem9uZS55IC0gdGhpcy5iaDtcclxuXHJcbiAgICAgICAgICAgIGxldCBkaWZmID0gdGhpcy5oIC0gdGhpcy5tYXhIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiggZGlmZiA+IDEgKXsgLy90aGlzLmggPiB0aGlzLm1heEhlaWdodCApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLm1heEhlaWdodCArIHRoaXMuYmg7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oICsgdGhpcy5iaDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cFNjcm9sbCggdGhpcy5pc1Njcm9sbCApO1xyXG5cclxuICAgICAgICB0aGlzLmlubmVyQ29udGVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLnpvbmUuaCAtIHRoaXMuYmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLnpvbmUuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5ib3R0b20uc3R5bGUudG9wID0gdGhpcy56b25lLmggLSB0aGlzLmJoICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuZm9yY2VIZWlnaHQgJiYgdGhpcy5sb2NrSGVpZ2h0ICkgdGhpcy5jb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuZm9yY2VIZWlnaHQgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKSB0aGlzLmNhbGNVaXMoKTtcclxuICAgICAgICBpZiggdGhpcy5pc0NhbnZhcyApIHRoaXMuZHJhdyggdHJ1ZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXpvbmUgKCkge1xyXG4gICAgICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFdpZHRoICggdyApIHtcclxuXHJcbiAgICAgICAgaWYoIHcgKSB0aGlzLnpvbmUudyA9IHc7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS53aWR0aCA9IHRoaXMuem9uZS53ICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNDZW50ZXIgKSB0aGlzLmNvbnRlbnQuc3R5bGUubWFyZ2luTGVmdCA9IC0oTWF0aC5mbG9vcih0aGlzLnpvbmUudyowLjUpKSArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SXRlbVdpZHRoKCB0aGlzLnpvbmUudyAtIHRoaXMuc3cgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzQ2FudmFzT25seSApIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG4gICAgICAgIC8vdGhpcy5yZXNpemUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0SXRlbVdpZHRoICggdyApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uc2V0U2l6ZSggdyApO1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5yU2l6ZSgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbkd1aS5wcm90b3R5cGUuaXNHdWkgPSB0cnVlOyIsIi8vaW1wb3J0ICcuL3BvbHlmaWxscy5qcyc7XHJcblxyXG5leHBvcnQgY29uc3QgUkVWSVNJT04gPSAnMi44JztcclxuXHJcbmV4cG9ydCB7IFRvb2xzIH0gZnJvbSAnLi9jb3JlL1Rvb2xzLmpzJztcclxuZXhwb3J0IHsgR3VpIH0gZnJvbSAnLi9jb3JlL0d1aS5qcyc7XHJcbmV4cG9ydCB7IFByb3RvIH0gZnJvbSAnLi9jb3JlL1Byb3RvLmpzJztcclxuZXhwb3J0IHsgYWRkIH0gZnJvbSAnLi9jb3JlL2FkZC5qcyc7XHJcbi8vXHJcbmV4cG9ydCB7IEJvb2wgfSBmcm9tICcuL3Byb3RvL0Jvb2wuanMnO1xyXG5leHBvcnQgeyBCdXR0b24gfSBmcm9tICcuL3Byb3RvL0J1dHRvbi5qcyc7XHJcbmV4cG9ydCB7IENpcmN1bGFyIH0gZnJvbSAnLi9wcm90by9DaXJjdWxhci5qcyc7XHJcbmV4cG9ydCB7IENvbG9yIH0gZnJvbSAnLi9wcm90by9Db2xvci5qcyc7XHJcbmV4cG9ydCB7IEZwcyB9IGZyb20gJy4vcHJvdG8vRnBzLmpzJztcclxuZXhwb3J0IHsgR3JvdXAgfSBmcm9tICcuL3Byb3RvL0dyb3VwLmpzJztcclxuZXhwb3J0IHsgSm95c3RpY2sgfSBmcm9tICcuL3Byb3RvL0pveXN0aWNrLmpzJztcclxuZXhwb3J0IHsgS25vYiB9IGZyb20gJy4vcHJvdG8vS25vYi5qcyc7XHJcbmV4cG9ydCB7IExpc3QgfSBmcm9tICcuL3Byb3RvL0xpc3QuanMnO1xyXG5leHBvcnQgeyBOdW1lcmljIH0gZnJvbSAnLi9wcm90by9OdW1lcmljLmpzJztcclxuZXhwb3J0IHsgU2xpZGUgfSBmcm9tICcuL3Byb3RvL1NsaWRlLmpzJztcclxuZXhwb3J0IHsgVGV4dElucHV0IH0gZnJvbSAnLi9wcm90by9UZXh0SW5wdXQuanMnO1xyXG5leHBvcnQgeyBUaXRsZSB9IGZyb20gJy4vcHJvdG8vVGl0bGUuanMnOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sQ0FBQyxHQUFHO0FBQ1Y7QUFDQSxJQUFJLElBQUksRUFBRSxRQUFRLENBQUMsc0JBQXNCLEVBQUU7QUFDM0M7QUFDQSxJQUFJLFNBQVMsRUFBRSxJQUFJO0FBQ25CLElBQUksVUFBVSxFQUFFLElBQUk7QUFDcEIsSUFBSSxVQUFVLEVBQUUsSUFBSTtBQUNwQixJQUFJLFFBQVEsRUFBRSxJQUFJO0FBQ2xCLElBQUksSUFBSSxFQUFFLElBQUk7QUFDZDtBQUNBLElBQUksS0FBSyxFQUFFLDRCQUE0QjtBQUN2QyxJQUFJLEtBQUssRUFBRSw4QkFBOEI7QUFDekMsSUFBSSxLQUFLLEVBQUUsOEJBQThCO0FBQ3pDO0FBQ0EsSUFBSSxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7QUFDbEksSUFBSSxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRTtBQUM1SixJQUFJLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFO0FBQ3BHO0FBQ0EsSUFBSSxFQUFFLEVBQUUsSUFBSSxD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LENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM5RTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQzFCO0FBQ0EsUUFBUSxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNqSDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ3RCLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQyxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDO0FBQ0EsUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFFBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0RCxRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDbEMsUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNsRSxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQUc7QUFDN0I7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNqSixRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxRQUFRLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUN2QixZQUFZLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDO0FBQzNELFlBQVksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUM7QUFDakUsWUFBWSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztBQUNqRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsU0FBUztBQUNULFFBQVEsT0FBTyxFQUFFLENBQUMsRUFB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QVEsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUMsUUFBUSxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNqRCxRQUFRLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztBQUMxSCxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDdkMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3BDO0FBQ0EsUUFBUSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVILFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3pIO0FBQ0E7QUFDQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN0RSxZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxSDtBQUNBO0FBQ0EsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDMUUsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDMUU7QUFDQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzFGLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzNIO0FBQ0EsWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMxRixZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM1SDtBQUNBO0FBQ0E7QUFDQSxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUN0RixZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwRyxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3RjtBQUNBLFlBQVksQ0FBQyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFDL0I7QUFDQSxTQUFTLE1BQU07QUFDZjtBQUNBLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1RixZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxSDtBQUNBLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsd0JBQXdCLEVBQUUsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3JJLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUks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RyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDOUQ7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksTUFBTSxFQUFFLFdBQVcsSUFBSSxHQUFHO0FBQzlCO0FBQ0EsUUFBUSxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7QUFDcEMsUUFBUSxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ2xDLFlBQVksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUM5QyxZQUFZLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFDMUM7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUksR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHO0FBQ3pGO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxHQUFHLE9BQU87QUFDeEM7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ25GO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFB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R0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztBQUN6RCxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ2xFO0FBQ0EsUUFBUSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDckQsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDL0I7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQztBQUMxQztBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMzQyxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNwQztBQUNBLFFBQVEsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDbEM7QUFDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQzlCO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN4RDtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM3RCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdELFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsUUFBUSxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzdEO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7QUFDeEM7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDNUI7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUNwQztBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUM5QixRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUM7QUFDdEMsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDO0FBQzVDO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQzFCO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUM7QUFDeEMsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9CO0FBQ0E7QUFDQSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9DLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDL0M7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNyRDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2pEO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDNUIsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUN4QjtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3pDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUNqRCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN2RSxRQUFRLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMvRDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDM0QsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDekQsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDL0Q7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDaEU7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUM7QUFDckMsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztBQUN2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SSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzNGO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ3JCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTztBQUNsQyxRQUFRLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUNqQztBQUNBLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUNyQztBQUNBLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUNyQztBQUNBLElBQUksT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUNuQztBQUNBLElBQUksT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUNuQztBQUNBLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxLQUFLLENBQUMsRUFBRTtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFlBQVksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUc7QUFDOUI7QUFDQSxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQzlCLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxH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QUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQywyQ0FBMkMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDL00sUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQ0FBcUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3ZLO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEIsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdEI7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3BCO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQy9DLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEI7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsSUFBSSxNQUFNLENBQUMsR0FBRztBQUNkO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDeEI7QUFDQSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDakQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2xELFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDckM7QUFDQSxTQUFTLE1BQU07QUFDZjtBQUNBLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNqRCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDbEQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztBQUNwQztBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2QixRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMxQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM3QixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3pFTyxNQUFNLE1BQU0sU0FBUyxLQUFLLENBQUM7QUFDbEM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUMxQztBQUNBLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUU7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDNUI7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0U7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3JELFFBQVEsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDM0QsUUFBUSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxHQUFHLElBQUks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LENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUM5SCxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUM5SDtBQUNBLGFBQWE7QUFDYjtBQUNBLFlBQVksTUFBTSxHQUFHLElBQUksQ0FBQztBQUMxQjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQUN0QjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ25CO0FBQ0EsUUFBUSxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDM0I7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ25ELFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDN0M7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNsQjtBQUNBLFFBQVEsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQy9DLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUN6QztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ2Y7QUFDQSxRQUFRLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUMzQjtBQUNBLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN4QixRQUFRLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNuRDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksVUFBVSxDQUFDLEdBQUc7QUFDbEI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsa0NBQWtDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0FBQ3hPLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQ3ZDO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNyRyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQ25HLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUM7QUFDckcsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUM3RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxVQUFVLENBQUMsR0FBRztBQUNsQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSw2QkFBNkIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsMENBQTBDLEVBQUUsQ0FBQztBQUMzSSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztBQUNsQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUNoQztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUN2SDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksVUFBVSxDQUFDLEVBQUUsSUFBSSxHQUFHO0FBQ3hCO0FBQ0EsUUFBUSxJQUFJLE9BQU8sR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUM3RCxRQUFRLElBQUksT0FBTyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUNqRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLElBQUksS0FBSyxTQUFTLEdBQUcsT0FBTztBQUN4QztBQUNBLFFBQVEsSUFBSSxNQUFNLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztBQUN0QyxRQUFRLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDOUIsUUFBUSxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM1RTtBQUNBLFFBQVEsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDMUUsYUFBYSxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDO0FBQ25GLGFBQWEsTUFBTSxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsTUFBTSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsRUFBRTtBQUNyQztBQUNBLFlBQVksSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzlFO0FBQ0E7QUFDQSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHO0FBQ3hCO0FBQ0EsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUN2QztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDMUI7QUFDQSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25CLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQztBQUNqRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUNyQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN4QixRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDekIsUUFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEIsUUFBUSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUN0RDtBQUNBLFFBQVEsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUNwQjtBQUNBLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1RSxTQUFTLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFEO0FBQ0EsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNoRCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2pEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDL0IsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDO0FBQzNDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQy9CLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3JWTyxNQUFNLFFBQVEsU0FBUyxLQUFLLENBQUM7QUFDcEM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQy9CO0FBQ0EsUUFBUSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzlDO0FBQ0EsUUFBUSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ25DO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNsQztBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQy9CO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEMsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQzdDO0FBQ0EsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO0FBQ3BDO0FBQ0EsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7QUFDakQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQ2pELFlBQVksSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDMUIsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QjtBQUNBLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDekI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM3SSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3ZDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxRCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM5RDtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3RFLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcs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QUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN6RCxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNwRTtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN6QyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvRDtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtBQUNoQztBQUNBLFlBQVksSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3pDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2xFO0FBQ0EsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckMsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDL0M7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25DLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDbkM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDakU7QUFDQSxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckMsWUFBWSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7QUFDdkUsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hDLFlBQVksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2xDLFlBQVksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLFFBQVEsQ0FBQyxHQUFHO0FBQ2hCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xELFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxRQUFRLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNsRztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzlEO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxRCxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3JLTyxNQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDakM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQTtBQUNBO0FBQ0EsS0FBSyxJQUFJLENBQUMsS0FBSyxH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RyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN4QyxlQUFlLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ25EO0FBQ0EsT0FBTyxHQUFHLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUMxQjtBQUNBLE9BQU8sSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN4RCxPQUFPLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0MsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsT0FBTyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkMsT0FBTztBQUNQO0FBQ0EsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDO0FBQ3BEO0FBQ0EsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMzRSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDakM7QUFDQSxZQUFZLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2pEO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTCxJQUFJO0FBQ0osR0FBRztBQUNIO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBLENBQUMsU0FBUyxDQUFDLEdBQUc7QUFDZDtBQUNBLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNsRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ25DLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2QjtBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3BCO0FBQ0EsRUFBRSxLQUFLLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzlELFVBQVUsS0FBSyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQy9DO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxJQUFJLENBQUMsR0FBRztBQUNUO0FBQ0EsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDZjtBQUNBLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ25CO0FBQ0EsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDOUM7QUFDQSxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM5QjtBQUNBLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQ3RDO0FBQ0EsS0FBSyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVCO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLENBQUMsR0FBRztBQUNWO0FBQ0EsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEI7QUFDQSxFQUFFLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM5QztBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzlCO0FBQ0EsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbkI7QUFDQSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxJQUFJLFFBQVEsQ0FBQztBQUN0QztBQUNBLEtBQUssSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzdCO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUc7QUFDZjtBQUNBLEtBQUssSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3hFO0FBQ0EsS0FBSyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDeEI7QUFDQSxLQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUM5QjtBQUNBLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hEO0FBQ0E7QUFDQSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDeEMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM1RDtBQUNBLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuRCxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyRDtBQUNBLEtBQUssR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPO0FBQ3BCO0FBQ0EsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3hELEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDdkUsS0FB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QyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1QixFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEMsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdDLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3QztBQUNBLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3BFO0FBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUM7QUFDQSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3RSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzFFLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JEO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLENBQUMsR0FBRztBQUNWO0FBQ0E7QUFDQSxLQUFLLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNuQjtBQUNBLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwQjtBQUNBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNqQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDaEM7QUFDQSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUM7QUFDNUQsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDNUQsS0FBSyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUMvQztBQUNBO0FBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDM0UsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJ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SUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUMzTDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLG9DQUFvQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0RBQWtELEVBQUUsQ0FBQztBQUMxSjtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRywyRUFBMkUsQ0FBQyxDQUFDO0FBQ3RKO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUM1QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2QjtBQUNBLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDakMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25DLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3BDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDakM7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN0RSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFN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O0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDM0Q7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUM5RSxhQUFhLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDMUQ7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQ3hDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDM0I7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDbkQ7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJ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QUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ3JDO0FBQ0EsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ3JFLFFBQVEsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQztBQUNsRCxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUM7QUFDbEM7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3hFLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDOUI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNqQyxRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDOUIsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQzdDO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHO0FBQ3RDO0FBQ0EsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQzFCLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekI7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDL0IsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzlCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLHlCQUF5QixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUM3SSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0M7QUFDQSxRQUFRLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUM7QUFDdEosUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2xGO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDL0gsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDaEo7QUFDQSxRQUFRLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hELFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDeEI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsUUFBUSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMzQztBQUNBLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUN0RCxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDLFNBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0I7QUFDQSxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3RGLGNBQWMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7QUFDN0Q7QUFDQSxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzVIO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxFQUFFO0FBQ3JDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUM7QUFDMUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQztBQUM5QyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFJO0FBQzlDLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksU0FBUyxDQUFDLEdBQUc7QUFDakI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxRTtBQUNBLFFB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QVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxQixRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN2QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQzVEO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLHdEQUF3RCxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUgsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLDBEQUEwRCxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDekwsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLDREQUE0RCxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDM0w7QUFDQSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLGlGQUFpRixDQUFDLENBQUM7QUFDMUo7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkI7QUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDcEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO0FBQ2pDO0FBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDcEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUNqQztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxN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QUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDcEUsYUFBYSxLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbEQ7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxHQUFHO0FBQ1o7QUFDQSxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQjtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzNELFFBQVEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDcEM7QUFDQSxRQUFRLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDL0I7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3BDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdkQsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDNUIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUN6QztBQUNBLFFBQVEsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2hDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDMUIsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkQsUUFBUSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDM0M7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFVBQVUsQ0FBQyxHQUFHO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ2hDLFFBQVEsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUNsQixZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEMsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzNCLFNBQVM7QUFDVCxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzVCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDZjtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTztBQUNsQztBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO0FBQzdCLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDeEIsWUFBWSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEQsU0FBUyxNQUFNO0FBQ2YsWUFBWSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQy9DLFNBQVM7QUFDVCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksWUFBWSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ2hDLFFBQVEsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUNsQixZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMxQyxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEMsU0FBUztBQUNULFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkI7QUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLElBQUksQ0FBQztBQUN0RCxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbkMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ25DO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQzlDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsS0FBSyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSTs7QUNuVXZCLE1BQU0sUUFBUSxTQUFTLEtBQUssQ0FBQztBQUNwQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7QUFDL0I7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0I7QUFDQSxRQUFRLElBQUksQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUN2RDtBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztBQUMxQyxRQUFRLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUM7QUFDbEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUM1QixRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUM1QjtBQUNBLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDN0I7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDbkMsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3pDO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEMsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQzdDO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHO0FBQ3RDO0FBQ0EsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7QUFDakQsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQ2pELFlBQVksSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDMUIsWUFBWSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN6QjtBQUNBLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDN0ksUUFBUSxJ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SUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMzRCxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzRCxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUMzRCxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3pFO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdEI7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNuQjtBQUNBLFFBQVEsR0FBRyxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQztBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7QUFDOUMsUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekI7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRztBQUNsQjtBQUNBLFFBQVEsSUFBSSxFQUFFLEtBQUssU0FBUyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDekM7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLEVBQUU7QUFDcEM7QUFDQSxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQzlCO0FBQ0EsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMzQztBQUNBLGdCQUFnQixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1RSxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUU7QUFDQSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkU7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN6QjtBQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdCO0FBQ0E7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDcEQ7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFNBQVMsQ0FBQyxHQUFHO0FBQ2pCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzlELFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM5RDtBQUNBLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztBQUM3QjtBQUNBLFlBQVksSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlDLFlBQVksSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQy9DO0FBQ0EsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzdELFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3RCxTQUFTLE1BQU07QUFDZixZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUQsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVELFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVB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RSxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzlDO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN0RztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6RDtBQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDdEMsUUFBUSxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLENBQUM7QUFDaEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDakU7QUFDQSxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUMsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzVDLFlBQVksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQ3ZFLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNoQyxZQUFZLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNsQyxZQUFZLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMvQixTQUFTO0FBQ1Q7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsQ0FBQyxHQUFHO0FBQ2hCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekQsUUFBUSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDNUMsUUFBUSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDMUM7QUFDQTtBQUNBLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2QixZQUFZLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUMsWUFBWSxJQUFJLEdBQUcsRUFBRSxVQUFVLEdBQUcsUUFBUSxLQUFLLEtBQUssQ0FBQztBQUNyRCxTQUFTLE1BQU07QUFDZixZQUFZLElBQUksR0FBRyxDQUFDLEVBQUUsVUFBVSxHQUFHLFFBQVEsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELFlBQVksS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDMUIsU0FBUztBQUNUO0FBQ0EsUUFBUSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQyxHQUFHO0FBQzNDO0FBQ0EsWUFBWSxDQUFDLEdBQUcsVUFBVSxLQUFLLElBQUksR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUMxQyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDL0MsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQy9DLFlBQVksRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUNoRCxZQUFZLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDaEQsWUFBWSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUM7QUFDOUQ7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUc7QUFDbEI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0MsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDNUQ7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LEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDcEQ7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ3ZDLFlBQVksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNuQyxZQUFZLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUM7QUFDQSxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFlBQVksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDNUssWUFBWSxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDakMsWUFBWSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4QixZQUFZLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUMsWUFBWSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1QyxZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMs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QUFDLENBQUMsQ0FBQztBQUN2QixRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4RSxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUN2QyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUM7QUFDakQsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUM7QUFDckMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDOUI7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsQ0FBQyxHQUFHO0FBQ2hCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxPQUFPO0FBQ3RCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzlCLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMxQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxHQUFHO0FBQ3ZCO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3pCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztBQUN2QztBQUNBLFFBQVEsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUNsQixTQUFTLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDbEQsZ0JBQWdCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDdEUsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDakQsZ0JBQWdCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ25DLGFBQWEsTUFBTTtBQUNuQixnQkFBZ0IsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsYUFBYTtBQUNiO0FBQ0EsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzVDLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMvQyxhQUFhLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFDN0I7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzRCxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ3pCLFFBQVEsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUNsQixZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVFLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNwRCxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3JELFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3ZaTyxNQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDakM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNsQyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3ZELFFBQVEsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzFEO0FBQ0EsUUFBUSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDbkQ7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDNUIsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDO0FBQ3hDO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDO0FBQ3RDO0FBQ0EsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztBQUNoQztBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzlHO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FB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QSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2xDLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3pCLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEQsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNuQztBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkI7QUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDekMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO0FBQ3pDO0FBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzlCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNuQyxR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QU0sRUFBRTtBQUMxQixZQUFZLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFlBQVksSUFBSSxJQUFJLEtBQUssTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzdELFlBQVksT0FBTyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3ZDLFNBQVM7QUFDVDtBQUNBLFFBQVEsT0FBTyxLQUFLLENBQUM7QUFDckI7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtBQUNBLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsT0FBTztBQUNsQztBQUNBLFFBQVEsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLElBQUksS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRCxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMzQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3REO0FBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMzRDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3ZCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDaEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDaEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQztBQUNoRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDakM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3ZCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUIsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUMzQixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQztBQUNyQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQztBQUNyQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENB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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNyQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzNDO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoSCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUN2QztBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUc7QUFDakI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUNwQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDcEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUM3QyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNyRDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQzlDTyxNQUFNLE1BQU0sU0FBUyxLQUFLLENBQUM7QUFDbEM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7QUFDbkM7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxPQUFPLElBQUksVUFBVSxFQUFFLENBQUM7QUFDakQ7QUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUMxRCxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN0RCxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN4RCxRQUFRLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUM1RDtBQUNBLFFBQXFCLENBQUMsQ0FBQyxNQUFNLElBQUksR0FBRztBQUNwQztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyw4Q0FBOEMsRUFBRSxDQUFDO0FBQzlOLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDL0M7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMvTSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0M7QUFDQSxRQUFRLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0MsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLDREQUE0RCxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFD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SSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQVEsR0FBRyxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDM0U7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUM1QjtBQUNBLFFBQVEsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzFELFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3RELFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3hEO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3RDLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUN2QjtBQUNBLFFBQVEsSUFBSSxHQUFHLENBQUM7QUFDaEI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3pDO0FBQ0EsWUFBWSxHQUFHLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFlBQVksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUks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LElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3hCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN4QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztBQUN6QixRQUFRLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwQixRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQ3REO0FBQ0EsUUFBUSxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ2xCO0FBQ0EsU0FBUyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzVFLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNoRCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2pEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FDdE9PLE1BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUNqQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxLQUFLLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLEtBQUssQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDdEI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQixRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQjtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ1pPLE1BQU0sSUFBSSxTQUFTLEtBQUssQ0FBQztBQUNoQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDckIsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDOUIsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQztBQUN2QyxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM5QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyw0REFBNEQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEw7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDekM7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzlDO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzlCO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEI7QUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUI7QUFDQSxLQUFLO0FBQ0w7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QVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ3JDO0FBQ0EsUUFBUSxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM1RTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUM1QjtBQUNBLFFBQVEsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzFELFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3RELFFBQVEsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3hEO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeEM7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ3RDLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFH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LElBQUksQ0FBQyxLQUFLLENBQUM7QUFDM0IsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2pEO0FBQ0E7QUFDQSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDM0IsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwQixRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ25CLFFBQVEsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDdEIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFFBQVEsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUNwQixTQUFTLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0RCxTQUFTO0FBQ1Q7QUFDQSxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFFBQVEsT0FBTyxDQUFDLEVBQUUsRUFBRTtBQUNwQixZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUM1RCxTQUFTO0FBQ1Q7QUFDQSxRQUFRLEdBQUcsQ0FBQyxH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QztBQUNyQixZQUFZLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFlBQVksQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakM7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN0QztBQUNBLFFBQVEsSUFBSSxJQUFJLEtBQUssT0FBTyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQzNDO0FBQ0EsUUFBUSxRQUFRLElBQUk7QUFDcEI7QUFDQSxZQUFZLEtBQUssTUFBTSxFQUFFLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDaEQsWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ3BELFlBQVksS0FBSyxVQUFVLEVBQUUsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUN4RCxZQUFZLEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDbEQsWUFBWSxLQUFLLEtBQUssRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQzlDLFlBQVksS0FBSyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTTtBQUNsRCxZQUFZLEtBQUssT0FBTyxFQUFFLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU07QUFDbEQsWUFBWSxLQUFLLFVBQVUsRUFBRSxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMs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QztBQUM1QjtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUN0QjtBQUNBLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQztBQUM1QyxRQUFRLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQ2xDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUN2RCxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUM7QUFDdEU7QUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7QUFDNUMsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDO0FBQ2hEO0FBQ0EsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxRQUFRLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBQ3hFO0FBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNyQjtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7QUFDL0IsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDMUQ7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3JEO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNwQztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEUsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsS0FBSyxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUM7QUFDM0U7QUFDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUM7QUFDMUMsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUMzQixRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDOUI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzFCLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN2QixRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUNqQztBQUNBLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxvQ0FBb0MsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDL0c7QUFDQSxRQUFRLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsMERBQTBELENBQUMsQ0FBQztB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LEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3BDLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztBQUNoQyxRQUFRLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN2QztBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDdEIsUUFBUSxLQUFLLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUMzQjtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLFNBQVMsQ0FBQyxHQUFHO0FBQ2pCO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPO0FBQ3RDO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztBQUNoQyxRQUFRLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUMxQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksT0FBTyxDQUFDLEVBQUUsSUFBSSxHQUFHO0FBQ3JCO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxPQUFPO0FBQ3RDO0FBQ0EsUUFBUSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUMxQjtBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3pCO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ25C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QUMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztBQUN6RDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDdkI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO0FBQ2hDLFFBQVEsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUNsQixZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ3JDLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUU7QUFDL0IsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSTs7QUNqdEIxQjtBQUNBO0FBQ1ksTUFBQyxRQUFRLEdBQUc7Ozs7In0=
