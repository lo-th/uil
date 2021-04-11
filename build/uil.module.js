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

    size: {  w: 240, h: 20, p: 30, s: 8 },

    // ----------------------
    //   COLOR
    // ----------------------

    colors: {

        text : '#dcdcdc',
        textOver : '#FFFFFF',
        txtselectbg : 'none',

        background: 'rgba(50,50,50,0.5)',//'rgba(44,44,44,0.3)',
        backgroundOver: 'rgba(50,50,50,0.5)',//'rgba(11,11,11,0.5)',

        //input: '#005AAA',

        inputBorder: '#454545',
        inputHolder: '#808080',
        inputBorderSelect: '#005AAA',
        inputBg: 'rgba(0,0,0,0.1)',
        inputOver: 'rgba(0,0,0,0.2)',

        // input border
        border : '#454545',
        borderOver : '#5050AA',
        borderSelect : '#308AFF',

        button : '#3c3c3c', //'#404040',
        boolbg : '#181818',
        boolon : '#C0C0C0',

        select : '#308AFF',
        moving : '#03afff',
        down : '#024699',
        over : '#024699',
        action: '#FF3300',

        stroke: 'rgba(11,11,11,0.5)',

        scroll: '#333333',
        scrollback:'rgba(44,44,44,0.2)',
        scrollbackover:'rgba(44,44,44,0.2)',

        hide: 'rgba(0,0,0,0)',

        groupBorder: '#3e3e3e', //'none',
        buttonBorder: '#4a4a4a',//'none',

        fontFamily: 'Tahoma',
        fontShadow: 'none',
        fontSize:11,

        radius:4,

    },

    // style css

    css : {
        //unselect: '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;', 
        basic: 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; overflow:hidden; ' + '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;',
        button:'display:flex; justify-content:center; align-items:center; text-align:center;',

        /*txt: T.css.basic + 'font-family:'+ T.colors.fontFamily +'; font-size:'+T.colors.fontSize+'px; color:'+T.colors.text+'; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;',
        txtselect:  T.css.txt + 'display:flex; justify-content:left; align-items:center; text-align:left;' +'padding:2px 5px; border:1px dashed ' + T.colors.border + '; background:'+ T.colors.txtselectbg+';',
        item: T.css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px;',*/
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

    setStyle : function ( data ){

        for ( var o in data ){
            if( T.colors[o] ) T.colors[o] = data[o];
        }

        T.setText();

    },

    // ----------------------
    // custom text
    // ----------------------

    setText : function( size, color, font, shadow ){

        let c = T.colors;

        if( font !== undefined ) c.fontFamily = font;
        if( color !== undefined ) c.text = color;
        if( size !== undefined ) c.fontSize = size;

        T.css.txt = T.css.basic + 'font-family:'+ c.fontFamily +'; font-size:'+c.fontSize+'px; color:'+c.text+'; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';
        if( shadow !== undefined ) T.css.txt += ' text-shadow:'+ shadow + '; '; //"1px 1px 1px #ff0000";
        if( c.fontShadow !== 'none' ) T.css.txt += ' text-shadow: 1px 1px 1px '+c.fontShadow+';';
        T.css.txtselect = T.css.txt + 'display:flex; justify-content:left; align-items:center; text-align:left;' +'padding:2px 5px; border:1px dashed ' + c.border + '; background:'+ c.txtselectbg+';';
        T.css.item = T.css.txt + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px;';

    },


    // intern function

    cloneColor: function () {

        let cc = Object.assign({}, T.colors );
        return cc;

    },

    cloneCss: function () {

        let cc = Object.assign({}, T.css );
        return cc;

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
            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logoFill_d+"'/>";
            break;
            case 'save':
            t[1]="<path stroke='"+color+"' stroke-width='4' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 26.125 17 L 20 22.95 14.05 17 M 20 9.95 L 20 22.95'/><path stroke='"+color;
            t[1]+="' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 32.6 23 L 32.6 25.5 Q 32.6 28.5 29.6 28.5 L 10.6 28.5 Q 7.6 28.5 7.6 25.5 L 7.6 23'/>";
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
    pointerEvent: ['pointerdown', 'pointermove', 'pointerup'],

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
            
            dom.addEventListener( 'contextmenu', R, false );
            dom.addEventListener( 'wheel', R, false );
            
            document.addEventListener( 'click', R, false );

            /*dom.addEventListener( 'mousedown', R, false );
            document.addEventListener( 'mousemove', R, false );
            document.addEventListener( 'mouseup', R, false );*/

            dom.addEventListener( 'pointerdown', R, false );
            document.addEventListener( 'pointermove', R, false );
            document.addEventListener( 'pointerup', R, false );
        }

        window.addEventListener( 'keydown', R, false );
        window.addEventListener( 'keyup', R, false );
        window.addEventListener( 'resize', R.resize , false );

        //window.onblur = R.out;
        //window.onfocus = R.in;

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
            
            dom.removeEventListener( 'contextmenu', R, false );
            dom.removeEventListener( 'wheel', R, false );
            document.removeEventListener( 'click', R, false );

            /*dom.removeEventListener( 'mousedown', R, false );
            document.removeEventListener( 'mousemove', R, false );
            document.removeEventListener( 'mouseup', R, false );*/
            
            dom.removeEventListener( 'pointerdown', R, false );
            document.removeEventListener( 'pointermove', R, false );
            document.removeEventListener( 'pointerup', R, false );

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

    out: function () {

        console.log('im am out');
        R.clearOldID();

    },

    in: function () {

        console.log('im am in');
      //  R.clearOldID();

    },

    // ----------------------
    //   HANDLE EVENTS
    // ----------------------
    

    handleEvent: function ( event ) {

        //if(!event.type) return;

      //  console.log( event.type )

        if( event.type.indexOf( R.prevDefault ) !== -1 ) event.preventDefault(); 


        if( event.type.indexOf( R.pointerEvent ) !== -1 ) {

            if( event.pointerType!=='mouse' || event.pointerType!=='pen' ) return;

        }

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

        if( event.type === 'pointerdown') e.type = 'mousedown';
        if( event.type === 'pointerup') e.type = 'mouseup';
        if( event.type === 'pointermove') e.type = 'mousemove';

       //if( 'pointerdown' 'pointermove', 'pointerup')
        
        
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

        if( id !== -1 ) return false; 

        R.listens.push( proto );

        if( !R.isLoop ){
            R.isLoop = true;
            R.loop();
        }

        return true;

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
        this.group = null;

        this.isListen = false;
        //this.parentGroup = null;

        this.ontop = o.ontop ? o.ontop : false; // 'beforebegin' 'afterbegin' 'beforeend' 'afterend'

        this.css = this.main ? this.main.css : Tools.css;
        this.colors = this.main ? this.main.colors : Tools.colors;

        this.defaultBorderColor = this.colors.border;
        this.svgs = Tools.svgs;

        // only space 
        this.isSpace = o.isSpace || false;

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
        if( !this.isSpace ) this.h = this.h < 11 ? 11 : this.h;

        // if need resize width
        this.autoWidth = o.auto || true;

        // open statu
        this.isOpen = false;

        // radius for toolbox
        this.radius = o.radius || this.colors.radius;

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
        this.bg = this.colors.background;
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

        this.txt = o.name || '';
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
        //if( this.isSpace  ) s[0].background = 'none';

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

        let pp = this.target !== null ? this.target : (this.isUI ? this.main.inner : document.body);

        if( this.ontop ) pp.insertAdjacentElement( 'afterbegin', c[0] );
        else pp.appendChild( c[0] );

        

        /*if( this.target !== null ){ 
            this.target.appendChild( c[0] );
        } else {
            if( this.isUI ) this.main.inner.appendChild( c[0] );
            else document.body.appendChild( c[0] );
        }*/

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

        if( this.isSpace ) return;

        if(this.s) this.s[0].background = this.bg;

    }

    uiover () {

        if( this.isSpace ) return;

        if(this.s) this.s[0].background = this.bgOver;

    }

    rename ( s ) {

        if( this.c[1] !== undefined) this.c[1].textContent = s;

    }

    listen () {

        this.isListen = Roots.addListen( this );
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

        if( this.isSpace ) return;

        this.callback = f || null;
        return this;

    }

    // ----------------------
    // update only on end
    // ----------------------

    onFinishChange ( f ) {

        if( this.isSpace ) return;

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
    
    clear ( nofull ) {

        if( this.isListen ) Roots.removeListen( this );

        Tools.clear( this.c[0] );

        if( !nofull ){

            if( this.target !== null ){ 

                if( this.group !== null  ) this.group.clearOne( this );
                else this.target.removeChild( this.c[0] );

            } else {

                if( this.isUI ) this.main.clearOne( this );
                else document.body.removeChild( this.c[0] );

            }

            if( !this.isUI ) Roots.remove( this );

        }

        this.c = null;
        this.s = null;
        this.callback = null;
        this.target = null;
        this.isListen = false;

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

        if( this.isSpace ) return;
        return this[e.type](e);
    
    }

    wheel ( e ) { return false; }

    mousedown ( e ) { return false; }

    mousemove ( e ) { return false; }

    mouseup ( e ) { return false; }

    keydown ( e ) { return false; }

    click ( e ) { return false; }

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

        this.onName = o.onName || '';

        this.on = false;

        if( typeof this.values === 'string' ) this.values = [ this.values ];

        //this.selected = null;
        this.isDown = false;

        this.isLink = o.link || false;

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

    onOff ( ){

        this.on = !this.on;
        this.c[2].innerHTML = this.on ? this.onName : this.values[0];

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

    click ( e ) {

        if( this.onName!== '' ) this.onOff();

        if( this.isLink ){

            let name = this.testZone( e );
            if( !name ) return false;

            this.value = this.values[name-2];
            this.send();
            return this.reset();
        }

    }

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

        if( this.isLink ) return false;

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

	    this.wfixe = 256;

	    this.cw = this.sb > 256 ? 256 : this.sb;
	    if(o.cw != undefined ) this.cw = o.cw;

	    // color up or down
	    this.side = o.side || 'down';
	    this.up = this.side === 'down' ? 0 : 1;
	    
	    this.baseH = this.h;

	    this.offset = new V2();
	    this.decal = new V2();
	    this.pp = new V2();

	    this.c[2] = this.dom( 'div', this.css.txt + 'height:'+(this.h-4)+'px;' + 'border-radius:'+this.radius+'px; line-height:'+(this.h-8)+'px;' );
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

		if ( this.group !== null ) this.group.calc( t );
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

		let p = this.pp;
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

	    this.rSizeColor( this.cw );

	    this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);
	    s[3].left = this.decal.x + 'px';
	    
	}

	rSizeColor ( w ) {

		if( w === this.wfixe ) return;

		this.wfixe = w;

		let s = this.s;

		//this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);
	    this.decal.y = this.side === 'up' ? 2 : this.baseH + 2;
	    this.mid = Math.floor( this.wfixe * 0.5 );

	    this.setSvg( this.c[3], 'viewBox', '0 0 '+ this.wfixe + ' '+ this.wfixe );
	    s[3].width = this.wfixe + 'px';
	    s[3].height = this.wfixe + 'px';
    	//s[3].left = this.decal.x + 'px';
	    s[3].top = this.decal.y + 'px';

	    this.ratio = 256 / this.wfixe;
	    this.square = 1 / (60*(this.wfixe/256));
	    this.setHeight();

	}


}

class Fps extends Proto {

    constructor( o = {} ) {

        super( o );

        this.round = Math.round;

        //this.autoHeight = true;

        this.baseH = this.h;
        this.hplus = o.hplus || 50;

        this.res = o.res || 40;
        this.l = 1;

        this.precision = o.precision || 0;
        

        this.custom = o.custom || false;
        this.names = o.names || ['FPS', 'MS'];
        let cc = o.cc || ['220,220,220', '255,255,0'];

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

            this.txt = o.name || 'Fps';

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

        if( this.group !== null ){ this.group.calc( this.hplus );}
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

        if( this.group !== null ){ this.group.calc( -this.hplus );}
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

        this.isEmpty = true;

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
        if( this.isLine ) this.c[5] = this.dom( 'div', this.css.basic +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');

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

        //if( o.bg !== undefined ) this.setBG(o.bg);
        this.setBG( this.bg );
        if( o.open !== undefined ) this.open();


        //s[0].background = this.bg;

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
            if( a[2] === undefined ) [].push.call( a, { isUI:true, target:this.c[2], main:this.main });
            else { 
                a[2].isUI = true;
                a[2].target = this.c[2];
                a[2].main = this.main;
            }
        }

        //let n = add.apply( this, a );
        let u = this.ADD.apply( this, a );

        this.uis.push( u );

        //if( u.autoHeight ) u.parentGroup = this;
        //if( u.isGroup ) 

        u.group = this;

        this.isEmpty = false;

        return u;

    }

    // remove one node

    remove ( n ) {

        if( n.clear ) n.clear();

    }

    // clear all iner 

    empty () {

        this.close();

        let i = this.uis.length, item;

        while( i-- ){
            item = this.uis.pop();
            this.c[2].removeChild( item.c[0] );
            item.clear( true );

            //this.uis[i].clear()
        }

        this.isEmpty = true;
        this.h = this.baseH;

    }

    // clear one element

    clearOne ( n ) { 

        let id = this.uis.indexOf( n );

        if ( id !== -1 ) {
            this.calc( - ( this.uis[ id ].h + 1 ) );
            this.c[2].removeChild( this.uis[ id ].c[0] );
            this.uis.splice( id, 1 ); 

            if( this.uis.length === 0 ){ 
                this.isEmpty = true;
                this.close();
            }
        }

    }

    parentHeight ( t ) {

        //if ( this.parentGroup !== null ) this.parentGroup.calc( t );
        if ( this.group !== null ) this.group.calc( t );
        else if ( this.isUI ) this.main.calc( t );

    }

    open () {

        super.open();

        this.setSvg( this.c[4], 'd', this.svgs.arrowDown );
        this.rSizeContent();

        let t = this.h - this.baseH;

        this.parentHeight( t );

        //console.log( this.uis );

    }

    close () {

        super.close();

        let t = this.h - this.baseH;

        this.setSvg( this.c[4], 'd', this.svgs.arrow );
        this.h = this.baseH;
        this.s[0].height = this.h + 'px';

        this.parentHeight( -t );

        //console.log( this.uis );

    }

    clear () {

        this.empty();
        if( this.isUI ) this.main.calc( -( this.h + 1 ));
        Proto.prototype.clear.call( this );

    }

    clearGroup () {

        this.empty();

        /*this.close();

        let i = this.uis.length;
        while(i--){
            this.uis[i].clear();   
        }
        this.uis = [];
        this.h = this.baseH;*/

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

class Knob extends Proto {

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

        //this.autoHeight = false;

        let align = o.align || 'center';

        this.sMode = 0;
        this.tMode = 0;

        this.listOnly = o.listOnly || false;

        if( this.txt === '' ) this.p = 0;

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

        if ( this.group !== null ) this.group.calc( t );
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

    update ( ) {

        this.c[3].textContent = this.value;
        
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

        let s = this.s;

        s[1].textAlign = o.align || 'left';
        s[1].fontWeight = o.fontWeight || 'bold';


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
        this.s[1].width = this.w + 'px'; //- 50 + 'px';
        this.s[2].left = this.w + 'px';//- ( 50 + 26 ) + 'px';

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
	    o.isSpace = true;

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
        this.bsize = o.bsize || [100,20];

        this.bsizeMax = this.bsize[0];

        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];
        this.grid = [ 2, Math.round( this.lng * 0.5 ) ];
        this.h = this.grid[1] * ( this.bsize[1] + this.spaces[1] ) + this.spaces[1];

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

    testW () {

        let vw = this.spaces[0]*3 + this.bsizeMax*2, rz = false;
        if( vw > this.w ) {
            this.bsize[0] = ( this.w-(this.spaces[0]*3) ) * 0.5;
            rz = true;
        } else {
            if( this.bsize[0] !== this.bsizeMax ) {
                this.bsize[0] = this.bsizeMax;
                rz = true;
            }
        }

        if( !rz ) return;

        let i = this.buttons.length;
        while(i--) this.buttons[i].style.width = this.bsize[0] + 'px';

    }

    rSize () {

        super.rSize();

        this.testW();

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

const add = function () {

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

};

/**
 * @author lth / https://github.com/lo-th
 */

class Gui {

    constructor( o = {} ) {

        this.canvas = null;

        this.isEmpty = true;

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

        let r = o.radius || this.colors.radius;
        this.bottom = Tools.dom( 'div',  this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:'+r+'px;  border-bottom-left-radius:'+r+'px; text-align:center; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px;');// border-top:1px solid '+Tools.colors.stroke+';');
        this.content.appendChild( this.bottom );
        this.bottom.textContent = 'Close';
        this.bottom.style.background = this.bg;

        //

        this.parent = o.parent !== undefined ? o.parent : null;
        this.parent = o.target !== undefined ? o.target : this.parent;
        
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
		            this.bottom.textContent = this.isOpen ? 'Close' : 'Open';
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

        let ontop = false;

        if( typeof a[1] === 'object' ){ 

            a[1].isUI = true;
            a[1].main = this;

            ontop = a[1].ontop ? a[1].ontop : false;

        } else if( typeof a[1] === 'string' ){

            if( a[2] === undefined ) [].push.call(a, { isUI:true, main:this });
            else {
                a[2].isUI = true;
                a[2].main = this;

                ontop = a[1].ontop ? a[1].ontop : false;
            }
            
        } 

        let u = add.apply( this, a );

        if( u === null ) return;

        if(ontop) this.uis.unshift( u );
        else this.uis.push( u );

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

        this.isEmpty = false;

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

        if( n.clear ) n.clear();

    }

    // call after uis clear

    clearOne ( n ) { 

        let id = this.uis.indexOf( n ); 
        if ( id !== -1 ) {
            this.calc( - (this.uis[ id ].h + 1 ) );
            this.inner.removeChild( this.uis[ id ].c[0] );
            this.uis.splice( id, 1 ); 
        }

    }

    // clear all gui

    empty () {

        //this.close();

        let i = this.uis.length, item;

        while( i-- ){
            item = this.uis.pop();
            this.inner.removeChild( item.c[0] );
            item.clear( true );

            //this.uis[i].clear()
        }

        this.isEmpty = true;
        //Roots.listens = [];
        this.calc( -this.h );

    }

    clear () {

        this.empty();

        //this.callback = null;

        /*let i = this.uis.length;
        while( i-- ) this.uis[i].clear();

        this.uis = [];
        Roots.listens = [];

        this.calc( -this.h );*/

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

const REVISION = '3.0';

export { Bool, Button, Circular, Color, Fps, Group, Gui, Joystick, Knob, List, Numeric, Proto, REVISION, Slide, TextInput, Title, Tools, add };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlsLm1vZHVsZS5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvcmUvVG9vbHMuanMiLCIuLi9zcmMvY29yZS9Sb290cy5qcyIsIi4uL3NyYy9jb3JlL1YyLmpzIiwiLi4vc3JjL2NvcmUvUHJvdG8uanMiLCIuLi9zcmMvcHJvdG8vQm9vbC5qcyIsIi4uL3NyYy9wcm90by9CdXR0b24uanMiLCIuLi9zcmMvcHJvdG8vQ2lyY3VsYXIuanMiLCIuLi9zcmMvcHJvdG8vQ29sb3IuanMiLCIuLi9zcmMvcHJvdG8vRnBzLmpzIiwiLi4vc3JjL3Byb3RvL0dyYXBoLmpzIiwiLi4vc3JjL3Byb3RvL0dyb3VwLmpzIiwiLi4vc3JjL3Byb3RvL0pveXN0aWNrLmpzIiwiLi4vc3JjL3Byb3RvL0tub2IuanMiLCIuLi9zcmMvcHJvdG8vTGlzdC5qcyIsIi4uL3NyYy9wcm90by9OdW1lcmljLmpzIiwiLi4vc3JjL3Byb3RvL1NsaWRlLmpzIiwiLi4vc3JjL3Byb3RvL1RleHRJbnB1dC5qcyIsIi4uL3NyYy9wcm90by9UaXRsZS5qcyIsIi4uL3NyYy9wcm90by9TZWxlY3QuanMiLCIuLi9zcmMvcHJvdG8vU2VsZWN0b3IuanMiLCIuLi9zcmMvcHJvdG8vRW1wdHkuanMiLCIuLi9zcmMvcHJvdG8vSXRlbS5qcyIsIi4uL3NyYy9wcm90by9HcmlkLmpzIiwiLi4vc3JjL2NvcmUvYWRkLmpzIiwiLi4vc3JjL2NvcmUvR3VpLmpzIiwiLi4vc3JjL1VpbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG5jb25zdCBUID0ge1xyXG5cclxuICAgIGZyYWc6IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxcclxuXHJcbiAgICBjb2xvclJpbmc6IG51bGwsXHJcbiAgICBqb3lzdGlja18wOiBudWxsLFxyXG4gICAgam95c3RpY2tfMTogbnVsbCxcclxuICAgIGNpcmN1bGFyOiBudWxsLFxyXG4gICAga25vYjogbnVsbCxcclxuXHJcbiAgICBzdmduczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxyXG4gICAgbGlua3M6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxyXG4gICAgaHRtbHM6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiLFxyXG5cclxuICAgIERPTV9TSVpFOiBbICdoZWlnaHQnLCAnd2lkdGgnLCAndG9wJywgJ2xlZnQnLCAnYm90dG9tJywgJ3JpZ2h0JywgJ21hcmdpbi1sZWZ0JywgJ21hcmdpbi1yaWdodCcsICdtYXJnaW4tdG9wJywgJ21hcmdpbi1ib3R0b20nXSxcclxuICAgIFNWR19UWVBFX0Q6IFsgJ3BhdHRlcm4nLCAnZGVmcycsICd0cmFuc2Zvcm0nLCAnc3RvcCcsICdhbmltYXRlJywgJ3JhZGlhbEdyYWRpZW50JywgJ2xpbmVhckdyYWRpZW50JywgJ2FuaW1hdGVNb3Rpb24nLCAndXNlJywgJ2ZpbHRlcicsICdmZUNvbG9yTWF0cml4JyBdLFxyXG4gICAgU1ZHX1RZUEVfRzogWyAnc3ZnJywgJ3JlY3QnLCAnY2lyY2xlJywgJ3BhdGgnLCAncG9seWdvbicsICd0ZXh0JywgJ2cnLCAnbGluZScsICdmb3JlaWduT2JqZWN0JyBdLFxyXG5cclxuICAgIFBJOiBNYXRoLlBJLFxyXG4gICAgVHdvUEk6IE1hdGguUEkqMixcclxuICAgIHBpOTA6IE1hdGguUEkgKiAwLjUsXHJcbiAgICBwaTYwOiBNYXRoLlBJLzMsXHJcbiAgICBcclxuICAgIHRvcmFkOiBNYXRoLlBJIC8gMTgwLFxyXG4gICAgdG9kZWc6IDE4MCAvIE1hdGguUEksXHJcblxyXG4gICAgY2xhbXA6IGZ1bmN0aW9uICh2LCBtaW4sIG1heCkge1xyXG5cclxuICAgICAgICB2ID0gdiA8IG1pbiA/IG1pbiA6IHY7XHJcbiAgICAgICAgdiA9IHYgPiBtYXggPyBtYXggOiB2O1xyXG4gICAgICAgIHJldHVybiB2O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2l6ZTogeyAgdzogMjQwLCBoOiAyMCwgcDogMzAsIHM6IDggfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENPTE9SXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY29sb3JzOiB7XHJcblxyXG4gICAgICAgIHRleHQgOiAnI2RjZGNkYycsXHJcbiAgICAgICAgdGV4dE92ZXIgOiAnI0ZGRkZGRicsXHJcbiAgICAgICAgdHh0c2VsZWN0YmcgOiAnbm9uZScsXHJcblxyXG4gICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDUwLDUwLDUwLDAuNSknLC8vJ3JnYmEoNDQsNDQsNDQsMC4zKScsXHJcbiAgICAgICAgYmFja2dyb3VuZE92ZXI6ICdyZ2JhKDUwLDUwLDUwLDAuNSknLC8vJ3JnYmEoMTEsMTEsMTEsMC41KScsXHJcblxyXG4gICAgICAgIC8vaW5wdXQ6ICcjMDA1QUFBJyxcclxuXHJcbiAgICAgICAgaW5wdXRCb3JkZXI6ICcjNDU0NTQ1JyxcclxuICAgICAgICBpbnB1dEhvbGRlcjogJyM4MDgwODAnLFxyXG4gICAgICAgIGlucHV0Qm9yZGVyU2VsZWN0OiAnIzAwNUFBQScsXHJcbiAgICAgICAgaW5wdXRCZzogJ3JnYmEoMCwwLDAsMC4xKScsXHJcbiAgICAgICAgaW5wdXRPdmVyOiAncmdiYSgwLDAsMCwwLjIpJyxcclxuXHJcbiAgICAgICAgLy8gaW5wdXQgYm9yZGVyXHJcbiAgICAgICAgYm9yZGVyIDogJyM0NTQ1NDUnLFxyXG4gICAgICAgIGJvcmRlck92ZXIgOiAnIzUwNTBBQScsXHJcbiAgICAgICAgYm9yZGVyU2VsZWN0IDogJyMzMDhBRkYnLFxyXG5cclxuICAgICAgICBidXR0b24gOiAnIzNjM2MzYycsIC8vJyM0MDQwNDAnLFxyXG4gICAgICAgIGJvb2xiZyA6ICcjMTgxODE4JyxcclxuICAgICAgICBib29sb24gOiAnI0MwQzBDMCcsXHJcblxyXG4gICAgICAgIHNlbGVjdCA6ICcjMzA4QUZGJyxcclxuICAgICAgICBtb3ZpbmcgOiAnIzAzYWZmZicsXHJcbiAgICAgICAgZG93biA6ICcjMDI0Njk5JyxcclxuICAgICAgICBvdmVyIDogJyMwMjQ2OTknLFxyXG4gICAgICAgIGFjdGlvbjogJyNGRjMzMDAnLFxyXG5cclxuICAgICAgICBzdHJva2U6ICdyZ2JhKDExLDExLDExLDAuNSknLFxyXG5cclxuICAgICAgICBzY3JvbGw6ICcjMzMzMzMzJyxcclxuICAgICAgICBzY3JvbGxiYWNrOidyZ2JhKDQ0LDQ0LDQ0LDAuMiknLFxyXG4gICAgICAgIHNjcm9sbGJhY2tvdmVyOidyZ2JhKDQ0LDQ0LDQ0LDAuMiknLFxyXG5cclxuICAgICAgICBoaWRlOiAncmdiYSgwLDAsMCwwKScsXHJcblxyXG4gICAgICAgIGdyb3VwQm9yZGVyOiAnIzNlM2UzZScsIC8vJ25vbmUnLFxyXG4gICAgICAgIGJ1dHRvbkJvcmRlcjogJyM0YTRhNGEnLC8vJ25vbmUnLFxyXG5cclxuICAgICAgICBmb250RmFtaWx5OiAnVGFob21hJyxcclxuICAgICAgICBmb250U2hhZG93OiAnbm9uZScsXHJcbiAgICAgICAgZm9udFNpemU6MTEsXHJcblxyXG4gICAgICAgIHJhZGl1czo0LFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gc3R5bGUgY3NzXHJcblxyXG4gICAgY3NzIDoge1xyXG4gICAgICAgIC8vdW5zZWxlY3Q6ICctby11c2VyLXNlbGVjdDpub25lOyAtbXMtdXNlci1zZWxlY3Q6bm9uZTsgLWtodG1sLXVzZXItc2VsZWN0Om5vbmU7IC13ZWJraXQtdXNlci1zZWxlY3Q6bm9uZTsgLW1vei11c2VyLXNlbGVjdDpub25lOycsIFxyXG4gICAgICAgIGJhc2ljOiAncG9zaXRpb246YWJzb2x1dGU7IHBvaW50ZXItZXZlbnRzOm5vbmU7IGJveC1zaXppbmc6Ym9yZGVyLWJveDsgbWFyZ2luOjA7IHBhZGRpbmc6MDsgb3ZlcmZsb3c6aGlkZGVuOyAnICsgJy1vLXVzZXItc2VsZWN0Om5vbmU7IC1tcy11c2VyLXNlbGVjdDpub25lOyAta2h0bWwtdXNlci1zZWxlY3Q6bm9uZTsgLXdlYmtpdC11c2VyLXNlbGVjdDpub25lOyAtbW96LXVzZXItc2VsZWN0Om5vbmU7JyxcclxuICAgICAgICBidXR0b246J2Rpc3BsYXk6ZmxleDsganVzdGlmeS1jb250ZW50OmNlbnRlcjsgYWxpZ24taXRlbXM6Y2VudGVyOyB0ZXh0LWFsaWduOmNlbnRlcjsnLFxyXG5cclxuICAgICAgICAvKnR4dDogVC5jc3MuYmFzaWMgKyAnZm9udC1mYW1pbHk6JysgVC5jb2xvcnMuZm9udEZhbWlseSArJzsgZm9udC1zaXplOicrVC5jb2xvcnMuZm9udFNpemUrJ3B4OyBjb2xvcjonK1QuY29sb3JzLnRleHQrJzsgcGFkZGluZzoycHggMTBweDsgbGVmdDowOyB0b3A6MnB4OyBoZWlnaHQ6MTZweDsgd2lkdGg6MTAwcHg7IG92ZXJmbG93OmhpZGRlbjsgd2hpdGUtc3BhY2U6IG5vd3JhcDsnLFxyXG4gICAgICAgIHR4dHNlbGVjdDogIFQuY3NzLnR4dCArICdkaXNwbGF5OmZsZXg7IGp1c3RpZnktY29udGVudDpsZWZ0OyBhbGlnbi1pdGVtczpjZW50ZXI7IHRleHQtYWxpZ246bGVmdDsnICsncGFkZGluZzoycHggNXB4OyBib3JkZXI6MXB4IGRhc2hlZCAnICsgVC5jb2xvcnMuYm9yZGVyICsgJzsgYmFja2dyb3VuZDonKyBULmNvbG9ycy50eHRzZWxlY3RiZysnOycsXHJcbiAgICAgICAgaXRlbTogVC5jc3MudHh0ICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOyBiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsMC4yKTsgbWFyZ2luLWJvdHRvbToxcHg7JywqL1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBzdmcgcGF0aFxyXG5cclxuICAgIHN2Z3M6IHtcclxuXHJcbiAgICAgICAgZ3JvdXA6J00gNyA3IEwgNyA4IDggOCA4IDcgNyA3IE0gNSA3IEwgNSA4IDYgOCA2IDcgNSA3IE0gMyA3IEwgMyA4IDQgOCA0IDcgMyA3IE0gNyA1IEwgNyA2IDggNiA4IDUgNyA1IE0gNiA2IEwgNiA1IDUgNSA1IDYgNiA2IE0gNyAzIEwgNyA0IDggNCA4IDMgNyAzIE0gNiA0IEwgNiAzIDUgMyA1IDQgNiA0IE0gMyA1IEwgMyA2IDQgNiA0IDUgMyA1IE0gMyAzIEwgMyA0IDQgNCA0IDMgMyAzIFonLFxyXG4gICAgICAgIGFycm93OidNIDMgOCBMIDggNSAzIDIgMyA4IFonLFxyXG4gICAgICAgIGFycm93RG93bjonTSA1IDggTCA4IDMgMiAzIDUgOCBaJyxcclxuICAgICAgICBhcnJvd1VwOidNIDUgMiBMIDIgNyA4IDcgNSAyIFonLFxyXG5cclxuICAgICAgICBzb2xpZDonTSAxMyAxMCBMIDEzIDEgNCAxIDEgNCAxIDEzIDEwIDEzIDEzIDEwIE0gMTEgMyBMIDExIDkgOSAxMSAzIDExIDMgNSA1IDMgMTEgMyBaJyxcclxuICAgICAgICBib2R5OidNIDEzIDEwIEwgMTMgMSA0IDEgMSA0IDEgMTMgMTAgMTMgMTMgMTAgTSAxMSAzIEwgMTEgOSA5IDExIDMgMTEgMyA1IDUgMyAxMSAzIE0gNSA0IEwgNCA1IDQgMTAgOSAxMCAxMCA5IDEwIDQgNSA0IFonLFxyXG4gICAgICAgIHZlaGljbGU6J00gMTMgNiBMIDExIDEgMyAxIDEgNiAxIDEzIDMgMTMgMyAxMSAxMSAxMSAxMSAxMyAxMyAxMyAxMyA2IE0gMi40IDYgTCA0IDIgMTAgMiAxMS42IDYgMi40IDYgTSAxMiA4IEwgMTIgMTAgMTAgMTAgMTAgOCAxMiA4IE0gNCA4IEwgNCAxMCAyIDEwIDIgOCA0IDggWicsXHJcbiAgICAgICAgYXJ0aWN1bGF0aW9uOidNIDEzIDkgTCAxMiA5IDkgMiA5IDEgNSAxIDUgMiAyIDkgMSA5IDEgMTMgNSAxMyA1IDkgNCA5IDYgNSA4IDUgMTAgOSA5IDkgOSAxMyAxMyAxMyAxMyA5IFonLFxyXG4gICAgICAgIGNoYXJhY3RlcjonTSAxMyA0IEwgMTIgMyA5IDQgNSA0IDIgMyAxIDQgNSA2IDUgOCA0IDEzIDYgMTMgNyA5IDggMTMgMTAgMTMgOSA4IDkgNiAxMyA0IE0gNiAxIEwgNiAzIDggMyA4IDEgNiAxIFonLFxyXG4gICAgICAgIHRlcnJhaW46J00gMTMgOCBMIDEyIDcgUSA5LjA2IC0zLjY3IDUuOTUgNC44NSA0LjA0IDMuMjcgMiA3IEwgMSA4IDcgMTMgMTMgOCBNIDMgOCBRIDMuNzggNS40MjAgNS40IDYuNiA1LjIwIDcuMjUgNSA4IEwgNyA4IFEgOC4zOSAtMC4xNiAxMSA4IEwgNyAxMSAzIDggWicsXHJcbiAgICAgICAgam9pbnQ6J00gNy43IDcuNyBRIDggNy40NSA4IDcgOCA2LjYgNy43IDYuMyA3LjQ1IDYgNyA2IDYuNiA2IDYuMyA2LjMgNiA2LjYgNiA3IDYgNy40NSA2LjMgNy43IDYuNiA4IDcgOCA3LjQ1IDggNy43IDcuNyBNIDMuMzUgOC42NSBMIDEgMTEgMyAxMyA1LjM1IDEwLjY1IFEgNi4xIDExIDcgMTEgOC4yOCAxMSA5LjI1IDEwLjI1IEwgNy44IDguOCBRIDcuNDUgOSA3IDkgNi4xNSA5IDUuNTUgOC40IDUgNy44NSA1IDcgNSA2LjU0IDUuMTUgNi4xNSBMIDMuNyA0LjcgUSAzIDUuNzEyIDMgNyAzIDcuOSAzLjM1IDguNjUgTSAxMC4yNSA5LjI1IFEgMTEgOC4yOCAxMSA3IDExIDYuMSAxMC42NSA1LjM1IEwgMTMgMyAxMSAxIDguNjUgMy4zNSBRIDcuOSAzIDcgMyA1LjcgMyA0LjcgMy43IEwgNi4xNSA1LjE1IFEgNi41NCA1IDcgNSA3Ljg1IDUgOC40IDUuNTUgOSA2LjE1IDkgNyA5IDcuNDUgOC44IDcuOCBMIDEwLjI1IDkuMjUgWicsXHJcbiAgICAgICAgcmF5OidNIDkgMTEgTCA1IDExIDUgMTIgOSAxMiA5IDExIE0gMTIgNSBMIDExIDUgMTEgOSAxMiA5IDEyIDUgTSAxMS41IDEwIFEgMTAuOSAxMCAxMC40NSAxMC40NSAxMCAxMC45IDEwIDExLjUgMTAgMTIuMiAxMC40NSAxMi41NSAxMC45IDEzIDExLjUgMTMgMTIuMiAxMyAxMi41NSAxMi41NSAxMyAxMi4yIDEzIDExLjUgMTMgMTAuOSAxMi41NSAxMC40NSAxMi4yIDEwIDExLjUgMTAgTSA5IDEwIEwgMTAgOSAyIDEgMSAyIDkgMTAgWicsXHJcbiAgICAgICAgY29sbGlzaW9uOidNIDExIDEyIEwgMTMgMTAgMTAgNyAxMyA0IDExIDIgNy41IDUuNSA5IDcgNy41IDguNSAxMSAxMiBNIDMgMiBMIDEgNCA0IDcgMSAxMCAzIDEyIDggNyAzIDIgWicsXHJcbiAgICAgICAgbWFwOidNIDEzIDEgTCAxIDEgMSAxMyAxMyAxMyAxMyAxIE0gMTIgMiBMIDEyIDcgNyA3IDcgMTIgMiAxMiAyIDcgNyA3IDcgMiAxMiAyIFonLFxyXG4gICAgICAgIG1hdGVyaWFsOidNIDEzIDEgTCAxIDEgMSAxMyAxMyAxMyAxMyAxIE0gMTIgMiBMIDEyIDcgNyA3IDcgMTIgMiAxMiAyIDcgNyA3IDcgMiAxMiAyIFonLFxyXG4gICAgICAgIHRleHR1cmU6J00gMTMgNCBMIDEzIDEgMSAxIDEgNCA1IDQgNSAxMyA5IDEzIDkgNCAxMyA0IFonLFxyXG4gICAgICAgIG9iamVjdDonTSAxMCAxIEwgNyA0IDQgMSAxIDEgMSAxMyA0IDEzIDQgNSA3IDggMTAgNSAxMCAxMyAxMyAxMyAxMyAxIDEwIDEgWicsXHJcbiAgICAgICAgbm9uZTonTSA5IDUgTCA1IDUgNSA5IDkgOSA5IDUgWicsXHJcbiAgICAgICAgY3Vyc29yOidNIDQgNyBMIDEgMTAgMSAxMiAyIDEzIDQgMTMgNyAxMCA5IDE0IDE0IDAgMCA1IDQgNyBaJyxcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFN0eWxlIDogZnVuY3Rpb24gKCBkYXRhICl7XHJcblxyXG4gICAgICAgIGZvciAoIHZhciBvIGluIGRhdGEgKXtcclxuICAgICAgICAgICAgaWYoIFQuY29sb3JzW29dICkgVC5jb2xvcnNbb10gPSBkYXRhW29dO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVC5zZXRUZXh0KCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjdXN0b20gdGV4dFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNldFRleHQgOiBmdW5jdGlvbiggc2l6ZSwgY29sb3IsIGZvbnQsIHNoYWRvdyApe1xyXG5cclxuICAgICAgICBsZXQgYyA9IFQuY29sb3JzO1xyXG5cclxuICAgICAgICBpZiggZm9udCAhPT0gdW5kZWZpbmVkICkgYy5mb250RmFtaWx5ID0gZm9udDtcclxuICAgICAgICBpZiggY29sb3IgIT09IHVuZGVmaW5lZCApIGMudGV4dCA9IGNvbG9yO1xyXG4gICAgICAgIGlmKCBzaXplICE9PSB1bmRlZmluZWQgKSBjLmZvbnRTaXplID0gc2l6ZTtcclxuXHJcbiAgICAgICAgVC5jc3MudHh0ID0gVC5jc3MuYmFzaWMgKyAnZm9udC1mYW1pbHk6JysgYy5mb250RmFtaWx5ICsnOyBmb250LXNpemU6JytjLmZvbnRTaXplKydweDsgY29sb3I6JytjLnRleHQrJzsgcGFkZGluZzoycHggMTBweDsgbGVmdDowOyB0b3A6MnB4OyBoZWlnaHQ6MTZweDsgd2lkdGg6MTAwcHg7IG92ZXJmbG93OmhpZGRlbjsgd2hpdGUtc3BhY2U6IG5vd3JhcDsnO1xyXG4gICAgICAgIGlmKCBzaGFkb3cgIT09IHVuZGVmaW5lZCApIFQuY3NzLnR4dCArPSAnIHRleHQtc2hhZG93OicrIHNoYWRvdyArICc7ICc7IC8vXCIxcHggMXB4IDFweCAjZmYwMDAwXCI7XHJcbiAgICAgICAgaWYoIGMuZm9udFNoYWRvdyAhPT0gJ25vbmUnICkgVC5jc3MudHh0ICs9ICcgdGV4dC1zaGFkb3c6IDFweCAxcHggMXB4ICcrYy5mb250U2hhZG93Kyc7JztcclxuICAgICAgICBULmNzcy50eHRzZWxlY3QgPSBULmNzcy50eHQgKyAnZGlzcGxheTpmbGV4OyBqdXN0aWZ5LWNvbnRlbnQ6bGVmdDsgYWxpZ24taXRlbXM6Y2VudGVyOyB0ZXh0LWFsaWduOmxlZnQ7JyArJ3BhZGRpbmc6MnB4IDVweDsgYm9yZGVyOjFweCBkYXNoZWQgJyArIGMuYm9yZGVyICsgJzsgYmFja2dyb3VuZDonKyBjLnR4dHNlbGVjdGJnKyc7JztcclxuICAgICAgICBULmNzcy5pdGVtID0gVC5jc3MudHh0ICsgJ3Bvc2l0aW9uOnJlbGF0aXZlOyBiYWNrZ3JvdW5kOnJnYmEoMCwwLDAsMC4yKTsgbWFyZ2luLWJvdHRvbToxcHg7JztcclxuXHJcbiAgICB9LFxyXG5cclxuXHJcbiAgICAvLyBpbnRlcm4gZnVuY3Rpb25cclxuXHJcbiAgICBjbG9uZUNvbG9yOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCBjYyA9IE9iamVjdC5hc3NpZ24oe30sIFQuY29sb3JzICk7XHJcbiAgICAgICAgcmV0dXJuIGNjO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xvbmVDc3M6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGNjID0gT2JqZWN0LmFzc2lnbih7fSwgVC5jc3MgKTtcclxuICAgICAgICByZXR1cm4gY2M7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbG9uZTogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICByZXR1cm4gby5jbG9uZU5vZGUoIHRydWUgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldFN2ZzogZnVuY3Rpb24oIGRvbSwgdHlwZSwgdmFsdWUsIGlkLCBpZDIgKXtcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSAtMSApIGRvbS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuICAgICAgICBlbHNlIGlmKCBpZDIgIT09IHVuZGVmaW5lZCApIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF0uY2hpbGROb2Rlc1sgaWQyIHx8IDAgXS5zZXRBdHRyaWJ1dGVOUyggbnVsbCwgdHlwZSwgdmFsdWUgKTtcclxuICAgICAgICBlbHNlIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF0uc2V0QXR0cmlidXRlTlMoIG51bGwsIHR5cGUsIHZhbHVlICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRDc3M6IGZ1bmN0aW9uKCBkb20sIGNzcyApe1xyXG5cclxuICAgICAgICBmb3IoIGxldCByIGluIGNzcyApe1xyXG4gICAgICAgICAgICBpZiggVC5ET01fU0laRS5pbmRleE9mKHIpICE9PSAtMSApIGRvbS5zdHlsZVtyXSA9IGNzc1tyXSArICdweCc7XHJcbiAgICAgICAgICAgIGVsc2UgZG9tLnN0eWxlW3JdID0gY3NzW3JdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHNldDogZnVuY3Rpb24oIGcsIG8gKXtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgYXR0IGluIG8gKXtcclxuICAgICAgICAgICAgaWYoIGF0dCA9PT0gJ3R4dCcgKSBnLnRleHRDb250ZW50ID0gb1sgYXR0IF07XHJcbiAgICAgICAgICAgIGlmKCBhdHQgPT09ICdsaW5rJyApIGcuc2V0QXR0cmlidXRlTlMoIFQubGlua3MsICd4bGluazpocmVmJywgb1sgYXR0IF0gKTtcclxuICAgICAgICAgICAgZWxzZSBnLnNldEF0dHJpYnV0ZU5TKCBudWxsLCBhdHQsIG9bIGF0dCBdICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcbiAgICBnZXQ6IGZ1bmN0aW9uKCBkb20sIGlkICl7XHJcblxyXG4gICAgICAgIGlmKCBpZCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGRvbTsgLy8gcm9vdFxyXG4gICAgICAgIGVsc2UgaWYoICFpc05hTiggaWQgKSApIHJldHVybiBkb20uY2hpbGROb2Rlc1sgaWQgXTsgLy8gZmlyc3QgY2hpbGRcclxuICAgICAgICBlbHNlIGlmKCBpZCBpbnN0YW5jZW9mIEFycmF5ICl7XHJcbiAgICAgICAgICAgIGlmKGlkLmxlbmd0aCA9PT0gMikgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZFswXSBdLmNoaWxkTm9kZXNbIGlkWzFdIF07XHJcbiAgICAgICAgICAgIGlmKGlkLmxlbmd0aCA9PT0gMykgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZFswXSBdLmNoaWxkTm9kZXNbIGlkWzFdIF0uY2hpbGROb2Rlc1sgaWRbMl0gXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBkb20gOiBmdW5jdGlvbiAoIHR5cGUsIGNzcywgb2JqLCBkb20sIGlkICkge1xyXG5cclxuICAgICAgICB0eXBlID0gdHlwZSB8fCAnZGl2JztcclxuXHJcbiAgICAgICAgaWYoIFQuU1ZHX1RZUEVfRC5pbmRleE9mKHR5cGUpICE9PSAtMSB8fCBULlNWR19UWVBFX0cuaW5kZXhPZih0eXBlKSAhPT0gLTEgKXsgLy8gaXMgc3ZnIGVsZW1lbnRcclxuXHJcbiAgICAgICAgICAgIGlmKCB0eXBlID09PSdzdmcnICl7XHJcblxyXG4gICAgICAgICAgICAgICAgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICAgICAgICAgICAgVC5zZXQoIGRvbSwgb2JqICk7XHJcblxyXG4gICAgICAgICAgLyogIH0gZWxzZSBpZiAoIHR5cGUgPT09ICd1c2UnICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5zdmducywgJ3VzZScgKTtcclxuICAgICAgICAgICAgICAgIFQuc2V0KCBkb20sIG9iaiApO1xyXG4qL1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRlIG5ldyBzdmcgaWYgbm90IGRlZlxyXG4gICAgICAgICAgICAgICAgaWYoIGRvbSA9PT0gdW5kZWZpbmVkICkgZG9tID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBULnN2Z25zLCAnc3ZnJyApO1xyXG4gICAgICAgICAgICAgICAgVC5hZGRBdHRyaWJ1dGVzKCBkb20sIHR5cGUsIG9iaiwgaWQgKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgfSBlbHNlIHsgLy8gaXMgaHRtbCBlbGVtZW50XHJcblxyXG4gICAgICAgICAgICBpZiggZG9tID09PSB1bmRlZmluZWQgKSBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuaHRtbHMsIHR5cGUgKTtcclxuICAgICAgICAgICAgZWxzZSBkb20gPSBkb20uYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggVC5odG1scywgdHlwZSApICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIGNzcyApIGRvbS5zdHlsZS5jc3NUZXh0ID0gY3NzOyBcclxuXHJcbiAgICAgICAgaWYoIGlkID09PSB1bmRlZmluZWQgKSByZXR1cm4gZG9tO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIGRvbS5jaGlsZE5vZGVzWyBpZCB8fCAwIF07XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBhZGRBdHRyaWJ1dGVzIDogZnVuY3Rpb24oIGRvbSwgdHlwZSwgbywgaWQgKXtcclxuXHJcbiAgICAgICAgbGV0IGcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIFQuc3ZnbnMsIHR5cGUgKTtcclxuICAgICAgICBULnNldCggZywgbyApO1xyXG4gICAgICAgIFQuZ2V0KCBkb20sIGlkICkuYXBwZW5kQ2hpbGQoIGcgKTtcclxuICAgICAgICBpZiggVC5TVkdfVFlQRV9HLmluZGV4T2YodHlwZSkgIT09IC0xICkgZy5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnO1xyXG4gICAgICAgIHJldHVybiBnO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgY2xlYXIgOiBmdW5jdGlvbiggZG9tICl7XHJcblxyXG4gICAgICAgIFQucHVyZ2UoIGRvbSApO1xyXG4gICAgICAgIHdoaWxlIChkb20uZmlyc3RDaGlsZCkge1xyXG4gICAgICAgICAgICBpZiAoIGRvbS5maXJzdENoaWxkLmZpcnN0Q2hpbGQgKSBULmNsZWFyKCBkb20uZmlyc3RDaGlsZCApO1xyXG4gICAgICAgICAgICBkb20ucmVtb3ZlQ2hpbGQoIGRvbS5maXJzdENoaWxkICk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHB1cmdlIDogZnVuY3Rpb24gKCBkb20gKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gZG9tLmF0dHJpYnV0ZXMsIGksIG47XHJcbiAgICAgICAgaWYgKGEpIHtcclxuICAgICAgICAgICAgaSA9IGEubGVuZ3RoO1xyXG4gICAgICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICAgICAgbiA9IGFbaV0ubmFtZTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZG9tW25dID09PSAnZnVuY3Rpb24nKSBkb21bbl0gPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGEgPSBkb20uY2hpbGROb2RlcztcclxuICAgICAgICBpZiAoYSkge1xyXG4gICAgICAgICAgICBpID0gYS5sZW5ndGg7XHJcbiAgICAgICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICAgICAgVC5wdXJnZSggZG9tLmNoaWxkTm9kZXNbaV0gKTsgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENvbG9yIGZ1bmN0aW9uXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgQ29sb3JMdW1hIDogZnVuY3Rpb24gKCBoZXgsIGwgKSB7XHJcblxyXG4gICAgICAgIGlmKCBoZXggPT09ICduJyApIGhleCA9ICcjMDAwJztcclxuXHJcbiAgICAgICAgLy8gdmFsaWRhdGUgaGV4IHN0cmluZ1xyXG4gICAgICAgIGhleCA9IFN0cmluZyhoZXgpLnJlcGxhY2UoL1teMC05YS1mXS9naSwgJycpO1xyXG4gICAgICAgIGlmIChoZXgubGVuZ3RoIDwgNikge1xyXG4gICAgICAgICAgICBoZXggPSBoZXhbMF0raGV4WzBdK2hleFsxXStoZXhbMV0raGV4WzJdK2hleFsyXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbCA9IGwgfHwgMDtcclxuXHJcbiAgICAgICAgLy8gY29udmVydCB0byBkZWNpbWFsIGFuZCBjaGFuZ2UgbHVtaW5vc2l0eVxyXG4gICAgICAgIGxldCByZ2IgPSBcIiNcIiwgYywgaTtcclxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICAgICAgICAgIGMgPSBwYXJzZUludChoZXguc3Vic3RyKGkqMiwyKSwgMTYpO1xyXG4gICAgICAgICAgICBjID0gTWF0aC5yb3VuZChNYXRoLm1pbihNYXRoLm1heCgwLCBjICsgKGMgKiBsKSksIDI1NSkpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgcmdiICs9IChcIjAwXCIrYykuc3Vic3RyKGMubGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByZ2I7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBmaW5kRGVlcEludmVyOiBmdW5jdGlvbiAoIGMgKSB7IFxyXG5cclxuICAgICAgICByZXR1cm4gKGNbMF0gKiAwLjMgKyBjWzFdICogLjU5ICsgY1syXSAqIC4xMSkgPD0gMC42O1xyXG4gICAgICAgIFxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgaGV4VG9IdG1sOiBmdW5jdGlvbiAoIHYgKSB7IFxyXG4gICAgICAgIHYgPSB2ID09PSB1bmRlZmluZWQgPyAweDAwMDAwMCA6IHY7XHJcbiAgICAgICAgcmV0dXJuIFwiI1wiICsgKFwiMDAwMDAwXCIgKyB2LnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtcclxuICAgICAgICBcclxuICAgIH0sXHJcblxyXG4gICAgaHRtbFRvSGV4OiBmdW5jdGlvbiAoIHYgKSB7IFxyXG5cclxuICAgICAgICByZXR1cm4gdi50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoXCIjXCIsIFwiMHhcIik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1MjU1OiBmdW5jdGlvbiAoYywgaSkge1xyXG5cclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoYy5zdWJzdHJpbmcoaSwgaSArIDIpLCAxNikgLyAyNTU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1MTY6IGZ1bmN0aW9uICggYywgaSApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KGMuc3Vic3RyaW5nKGksIGkgKyAxKSwgMTYpIC8gMTU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICB1bnBhY2s6IGZ1bmN0aW9uKCBjICl7XHJcblxyXG4gICAgICAgIGlmIChjLmxlbmd0aCA9PSA3KSByZXR1cm4gWyBULnUyNTUoYywgMSksIFQudTI1NShjLCAzKSwgVC51MjU1KGMsIDUpIF07XHJcbiAgICAgICAgZWxzZSBpZiAoYy5sZW5ndGggPT0gNCkgcmV0dXJuIFsgVC51MTYoYywxKSwgVC51MTYoYywyKSwgVC51MTYoYywzKSBdO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgaHRtbFJnYjogZnVuY3Rpb24oIGMgKXtcclxuXHJcbiAgICAgICAgcmV0dXJuICdyZ2IoJyArIE1hdGgucm91bmQoY1swXSAqIDI1NSkgKyAnLCcrIE1hdGgucm91bmQoY1sxXSAqIDI1NSkgKyAnLCcrIE1hdGgucm91bmQoY1syXSAqIDI1NSkgKyAnKSc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBwYWQ6IGZ1bmN0aW9uKCBuICl7XHJcbiAgICAgICAgaWYobi5sZW5ndGggPT0gMSluID0gJzAnICsgbjtcclxuICAgICAgICByZXR1cm4gbjtcclxuICAgIH0sXHJcblxyXG4gICAgcmdiVG9IZXggOiBmdW5jdGlvbiggYyApe1xyXG5cclxuICAgICAgICBsZXQgciA9IE1hdGgucm91bmQoY1swXSAqIDI1NSkudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgIGxldCBnID0gTWF0aC5yb3VuZChjWzFdICogMjU1KS50b1N0cmluZygxNik7XHJcbiAgICAgICAgbGV0IGIgPSBNYXRoLnJvdW5kKGNbMl0gKiAyNTUpLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICByZXR1cm4gJyMnICsgVC5wYWQocikgKyBULnBhZChnKSArIFQucGFkKGIpO1xyXG5cclxuICAgICAgIC8vIHJldHVybiAnIycgKyAoICcwMDAwMDAnICsgKCAoIGNbMF0gKiAyNTUgKSA8PCAxNiBeICggY1sxXSAqIDI1NSApIDw8IDggXiAoIGNbMl0gKiAyNTUgKSA8PCAwICkudG9TdHJpbmcoIDE2ICkgKS5zbGljZSggLSA2ICk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBodWVUb1JnYjogZnVuY3Rpb24oIHAsIHEsIHQgKXtcclxuXHJcbiAgICAgICAgaWYgKCB0IDwgMCApIHQgKz0gMTtcclxuICAgICAgICBpZiAoIHQgPiAxICkgdCAtPSAxO1xyXG4gICAgICAgIGlmICggdCA8IDEgLyA2ICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogdDtcclxuICAgICAgICBpZiAoIHQgPCAxIC8gMiApIHJldHVybiBxO1xyXG4gICAgICAgIGlmICggdCA8IDIgLyAzICkgcmV0dXJuIHAgKyAoIHEgLSBwICkgKiA2ICogKCAyIC8gMyAtIHQgKTtcclxuICAgICAgICByZXR1cm4gcDtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHJnYlRvSHNsOiBmdW5jdGlvbiAoIGMgKSB7XHJcblxyXG4gICAgICAgIGxldCByID0gY1swXSwgZyA9IGNbMV0sIGIgPSBjWzJdLCBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSwgbWF4ID0gTWF0aC5tYXgociwgZywgYiksIGRlbHRhID0gbWF4IC0gbWluLCBoID0gMCwgcyA9IDAsIGwgPSAobWluICsgbWF4KSAvIDI7XHJcbiAgICAgICAgaWYgKGwgPiAwICYmIGwgPCAxKSBzID0gZGVsdGEgLyAobCA8IDAuNSA/ICgyICogbCkgOiAoMiAtIDIgKiBsKSk7XHJcbiAgICAgICAgaWYgKGRlbHRhID4gMCkge1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IHIgJiYgbWF4ICE9IGcpIGggKz0gKGcgLSBiKSAvIGRlbHRhO1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IGcgJiYgbWF4ICE9IGIpIGggKz0gKDIgKyAoYiAtIHIpIC8gZGVsdGEpO1xyXG4gICAgICAgICAgICBpZiAobWF4ID09IGIgJiYgbWF4ICE9IHIpIGggKz0gKDQgKyAociAtIGcpIC8gZGVsdGEpO1xyXG4gICAgICAgICAgICBoIC89IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbIGgsIHMsIGwgXTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGhzbFRvUmdiOiBmdW5jdGlvbiAoIGMgKSB7XHJcblxyXG4gICAgICAgIGxldCBwLCBxLCBoID0gY1swXSwgcyA9IGNbMV0sIGwgPSBjWzJdO1xyXG5cclxuICAgICAgICBpZiAoIHMgPT09IDAgKSByZXR1cm4gWyBsLCBsLCBsIF07XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHEgPSBsIDw9IDAuNSA/IGwgKiAocyArIDEpIDogbCArIHMgLSAoIGwgKiBzICk7XHJcbiAgICAgICAgICAgIHAgPSBsICogMiAtIHE7XHJcbiAgICAgICAgICAgIHJldHVybiBbIFQuaHVlVG9SZ2IocCwgcSwgaCArIDAuMzMzMzMpLCBULmh1ZVRvUmdiKHAsIHEsIGgpLCBULmh1ZVRvUmdiKHAsIHEsIGggLSAwLjMzMzMzKSBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU1ZHIE1PREVMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbWFrZUdyYWRpYW50OiBmdW5jdGlvbiAoIHR5cGUsIHNldHRpbmdzLCBwYXJlbnQsIGNvbG9ycyApIHtcclxuXHJcbiAgICAgICAgVC5kb20oIHR5cGUsIG51bGwsIHNldHRpbmdzLCBwYXJlbnQsIDAgKTtcclxuXHJcbiAgICAgICAgbGV0IG4gPSBwYXJlbnQuY2hpbGROb2Rlc1swXS5jaGlsZE5vZGVzLmxlbmd0aCAtIDEsIGM7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgY29sb3JzLmxlbmd0aDsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBjID0gY29sb3JzW2ldO1xyXG4gICAgICAgICAgICAvL1QuZG9tKCAnc3RvcCcsIG51bGwsIHsgb2Zmc2V0OmNbMF0rJyUnLCBzdHlsZTonc3RvcC1jb2xvcjonK2NbMV0rJzsgc3RvcC1vcGFjaXR5OicrY1syXSsnOycgfSwgcGFyZW50LCBbMCxuXSApO1xyXG4gICAgICAgICAgICBULmRvbSggJ3N0b3AnLCBudWxsLCB7IG9mZnNldDpjWzBdKyclJywgJ3N0b3AtY29sb3InOmNbMV0sICAnc3RvcC1vcGFjaXR5JzpjWzJdIH0sIHBhcmVudCwgWzAsbl0gKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLyptYWtlR3JhcGg6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAxMjg7XHJcbiAgICAgICAgbGV0IHJhZGl1cyA9IDM0O1xyXG4gICAgICAgIGxldCBzdmcgPSBULmRvbSggJ3N2ZycsIFQuY3NzLmJhc2ljICwgeyB2aWV3Qm94OicwIDAgJyt3KycgJyt3LCB3aWR0aDp3LCBoZWlnaHQ6dywgcHJlc2VydmVBc3BlY3RSYXRpbzonbm9uZScgfSApO1xyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo0LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgLy9ULmRvbSggJ3JlY3QnLCAnJywgeyB4OjEwLCB5OjEwLCB3aWR0aDoxMDgsIGhlaWdodDoxMDgsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6VC5jb2xvcnMuYnV0dG9uLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjggfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMrNywgc3Ryb2tlOidyZ2JhKDAsMCwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzo3ICwgZmlsbDonbm9uZSd9LCBzdmcgKTsvLzJcclxuICAgICAgICAvL1QuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZToncmdiYSgyNTUsMjU1LDI1NSwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MiwgZmlsbDonbm9uZScsICdzdHJva2UtbGluZWNhcCc6J3JvdW5kJywgJ3N0cm9rZS1vcGFjaXR5JzowLjUgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgVC5ncmFwaCA9IHN2ZztcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgbWFrZUtub2I6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMTI4O1xyXG4gICAgICAgIGxldCByYWRpdXMgPSAzNDtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6VC5jb2xvcnMuYnV0dG9uLCBzdHJva2U6J3JnYmEoMCwwLDAsMC4zKScsICdzdHJva2Utd2lkdGgnOjggfSwgc3ZnICk7Ly8wXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOlQuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOjQsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOidyb3VuZCcgfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6cmFkaXVzKzcsIHN0cm9rZToncmdiYSgwLDAsMCwwLjEpJywgJ3N0cm9rZS13aWR0aCc6NyAsIGZpbGw6J25vbmUnfSwgc3ZnICk7Ly8yXHJcbiAgICAgICAgVC5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOidyZ2JhKDI1NSwyNTUsMjU1LDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoyLCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzoncm91bmQnLCAnc3Ryb2tlLW9wYWNpdHknOjAuNSB9LCBzdmcgKTsvLzNcclxuICAgICAgICBULmtub2IgPSBzdmc7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBtYWtlQ2lyY3VsYXI6IGZ1bmN0aW9uICggbW9kZWwgKSB7XHJcblxyXG4gICAgICAgIGxldCB3ID0gMTI4O1xyXG4gICAgICAgIGxldCByYWRpdXMgPSA0MDtcclxuICAgICAgICBsZXQgc3ZnID0gVC5kb20oICdzdmcnLCBULmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdysnICcrdywgd2lkdGg6dywgaGVpZ2h0OncsIHByZXNlcnZlQXNwZWN0UmF0aW86J25vbmUnIH0gKTtcclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIHN0cm9rZToncmdiYSgwLDAsMCwwLjEpJywgJ3N0cm9rZS13aWR0aCc6MTAsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vMFxyXG4gICAgICAgIFQuZG9tKCAncGF0aCcsICcnLCB7IGQ6JycsIHN0cm9rZTpULmNvbG9ycy50ZXh0LCAnc3Ryb2tlLXdpZHRoJzo3LCBmaWxsOidub25lJywgJ3N0cm9rZS1saW5lY2FwJzonYnV0dCcgfSwgc3ZnICk7Ly8xXHJcbiAgICAgICAgVC5jaXJjdWxhciA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VKb3lzdGljazogZnVuY3Rpb24gKCBtb2RlbCApIHtcclxuXHJcbiAgICAgICAgLy8rJyBiYWNrZ3JvdW5kOiNmMDA7J1xyXG5cclxuICAgICAgICBsZXQgdyA9IDEyOCwgY2NjO1xyXG4gICAgICAgIGxldCByYWRpdXMgPSBNYXRoLmZsb29yKCh3LTMwKSowLjUpO1xyXG4gICAgICAgIGxldCBpbm5lclJhZGl1cyA9IE1hdGguZmxvb3IocmFkaXVzKjAuNik7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdkZWZzJywgbnVsbCwge30sIHN2ZyApO1xyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHt9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgaWYoIG1vZGVsID09PSAwICl7XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAgICAgLy8gZ3JhZGlhbiBiYWNrZ3JvdW5kXHJcbiAgICAgICAgICAgIGNjYyA9IFsgWzQwLCAncmdiKDAsMCwwKScsIDAuM10sIFs4MCwgJ3JnYigwLDAsMCknLCAwXSwgWzkwLCAncmdiKDUwLDUwLDUwKScsIDAuNF0sIFsxMDAsICdyZ2IoNTAsNTAsNTApJywgMF0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWQnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhZGlhbiBzaGFkb3dcclxuICAgICAgICAgICAgY2NjID0gWyBbNjAsICdyZ2IoMCwwLDApJywgMC41XSwgWzEwMCwgJ3JnYigwLDAsMCknLCAwXSBdO1xyXG4gICAgICAgICAgICBULm1ha2VHcmFkaWFudCggJ3JhZGlhbEdyYWRpZW50JywgeyBpZDonZ3JhZFMnLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgLy8gZ3JhZGlhbiBzdGlja1xyXG4gICAgICAgICAgICBsZXQgY2MwID0gWydyZ2IoNDAsNDAsNDApJywgJ3JnYig0OCw0OCw0OCknLCAncmdiKDMwLDMwLDMwKSddO1xyXG4gICAgICAgICAgICBsZXQgY2MxID0gWydyZ2IoMSw5MCwxOTcpJywgJ3JnYigzLDk1LDIwNyknLCAncmdiKDAsNjUsMTY3KSddO1xyXG5cclxuICAgICAgICAgICAgY2NjID0gWyBbMzAsIGNjMFswXSwgMV0sIFs2MCwgY2MwWzFdLCAxXSwgWzgwLCBjYzBbMV0sIDFdLCBbMTAwLCBjYzBbMl0sIDFdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkSW4nLCBjeDonNTAlJywgY3k6JzUwJScsIHI6JzUwJScsIGZ4Oic1MCUnLCBmeTonNTAlJyB9LCBzdmcsIGNjYyApO1xyXG5cclxuICAgICAgICAgICAgY2NjID0gWyBbMzAsIGNjMVswXSwgMV0sIFs2MCwgY2MxWzFdLCAxXSwgWzgwLCBjYzFbMV0sIDFdLCBbMTAwLCBjYzFbMl0sIDFdIF07XHJcbiAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAncmFkaWFsR3JhZGllbnQnLCB7IGlkOidncmFkSW4yJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGdyYXBoXHJcblxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0LCBjeTo2NCwgcjpyYWRpdXMsIGZpbGw6J3VybCgjZ3JhZCknIH0sIHN2ZyApOy8vMlxyXG4gICAgICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjY0KzUsIGN5OjY0KzEwLCByOmlubmVyUmFkaXVzKzEwLCBmaWxsOid1cmwoI2dyYWRTKScgfSwgc3ZnICk7Ly8zXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOmlubmVyUmFkaXVzLCBmaWxsOid1cmwoI2dyYWRJbiknIH0sIHN2ZyApOy8vNFxyXG5cclxuICAgICAgICAgICAgVC5qb3lzdGlja18wID0gc3ZnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgLy8gZ3JhZGlhbiBzaGFkb3dcclxuICAgICAgICAgICAgY2NjID0gWyBbNjksICdyZ2IoMCwwLDApJywgMF0sWzcwLCAncmdiKDAsMCwwKScsIDAuM10sIFsxMDAsICdyZ2IoMCwwLDApJywgMF0gXTtcclxuICAgICAgICAgICAgVC5tYWtlR3JhZGlhbnQoICdyYWRpYWxHcmFkaWVudCcsIHsgaWQ6J2dyYWRYJywgY3g6JzUwJScsIGN5Oic1MCUnLCByOic1MCUnLCBmeDonNTAlJywgZnk6JzUwJScgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgIFQuZG9tKCAnY2lyY2xlJywgJycsIHsgY3g6NjQsIGN5OjY0LCByOnJhZGl1cywgZmlsbDonbm9uZScsIHN0cm9rZToncmdiYSgxMDAsMTAwLDEwMCwwLjI1KScsICdzdHJva2Utd2lkdGgnOic0JyB9LCBzdmcgKTsvLzJcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMrMTQsIGZpbGw6J3VybCgjZ3JhZFgpJyB9LCBzdmcgKTsvLzNcclxuICAgICAgICAgICAgVC5kb20oICdjaXJjbGUnLCAnJywgeyBjeDo2NCwgY3k6NjQsIHI6aW5uZXJSYWRpdXMsIGZpbGw6J25vbmUnLCBzdHJva2U6J3JnYigxMDAsMTAwLDEwMCknLCAnc3Ryb2tlLXdpZHRoJzonNCcgfSwgc3ZnICk7Ly80XHJcblxyXG4gICAgICAgICAgICBULmpveXN0aWNrXzEgPSBzdmc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG1ha2VDb2xvclJpbmc6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHcgPSAyNTY7XHJcbiAgICAgICAgbGV0IHN2ZyA9IFQuZG9tKCAnc3ZnJywgVC5jc3MuYmFzaWMgLCB7IHZpZXdCb3g6JzAgMCAnK3crJyAnK3csIHdpZHRoOncsIGhlaWdodDp3LCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgVC5kb20oICdkZWZzJywgbnVsbCwge30sIHN2ZyApO1xyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHt9LCBzdmcgKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSAzMDsvL3N0cm9rZVxyXG4gICAgICAgIGxldCByID0oIHctcyApKjAuNTtcclxuICAgICAgICBsZXQgbWlkID0gdyowLjU7XHJcbiAgICAgICAgbGV0IG4gPSAyNCwgbnVkZ2UgPSA4IC8gciAvIG4gKiBNYXRoLlBJLCBhMSA9IDAsIGQxO1xyXG4gICAgICAgIGxldCBhbSwgdGFuLCBkMiwgYTIsIGFyLCBpLCBqLCBwYXRoLCBjY2M7XHJcbiAgICAgICAgbGV0IGNvbG9yID0gW107XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPD0gbjsgKytpKSB7XHJcblxyXG4gICAgICAgICAgICBkMiA9IGkgLyBuO1xyXG4gICAgICAgICAgICBhMiA9IGQyICogVC5Ud29QSTtcclxuICAgICAgICAgICAgYW0gPSAoYTEgKyBhMikgKiAwLjU7XHJcbiAgICAgICAgICAgIHRhbiA9IDEgLyBNYXRoLmNvcygoYTIgLSBhMSkgKiAwLjUpO1xyXG5cclxuICAgICAgICAgICAgYXIgPSBbXHJcbiAgICAgICAgICAgICAgICBNYXRoLnNpbihhMSksIC1NYXRoLmNvcyhhMSksIFxyXG4gICAgICAgICAgICAgICAgTWF0aC5zaW4oYW0pICogdGFuLCAtTWF0aC5jb3MoYW0pICogdGFuLCBcclxuICAgICAgICAgICAgICAgIE1hdGguc2luKGEyKSwgLU1hdGguY29zKGEyKVxyXG4gICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgY29sb3JbMV0gPSBULnJnYlRvSGV4KCBULmhzbFRvUmdiKFtkMiwgMSwgMC41XSkgKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGogPSA2O1xyXG4gICAgICAgICAgICAgICAgd2hpbGUoai0tKXtcclxuICAgICAgICAgICAgICAgICAgIGFyW2pdID0gKChhcltqXSpyKSttaWQpLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcGF0aCA9ICcgTScgKyBhclswXSArICcgJyArIGFyWzFdICsgJyBRJyArIGFyWzJdICsgJyAnICsgYXJbM10gKyAnICcgKyBhcls0XSArICcgJyArIGFyWzVdO1xyXG5cclxuICAgICAgICAgICAgICAgIGNjYyA9IFsgWzAsY29sb3JbMF0sMV0sIFsxMDAsY29sb3JbMV0sMV0gXTtcclxuICAgICAgICAgICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHJytpLCB4MTphclswXSwgeTE6YXJbMV0sIHgyOmFyWzRdLCB5Mjphcls1XSwgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOnBhdGgsICdzdHJva2Utd2lkdGgnOnMsIHN0cm9rZTondXJsKCNHJytpKycpJywgJ3N0cm9rZS1saW5lY2FwJzpcImJ1dHRcIiB9LCBzdmcsIDEgKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGExID0gYTIgLSBudWRnZTsgXHJcbiAgICAgICAgICAgIGNvbG9yWzBdID0gY29sb3JbMV07XHJcbiAgICAgICAgICAgIGQxID0gZDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgYnIgPSAoMTI4IC0gcyApICsgMjtcclxuICAgICAgICBsZXQgYncgPSA2MDtcclxuXHJcbiAgICAgICAgbGV0IHR3ID0gODQuOTA7XHJcblxyXG4gICAgICAgIC8vIGJsYWNrIC8gd2hpdGVcclxuICAgICAgICBjY2MgPSBbIFswLCAnI0ZGRkZGRicsIDFdLCBbNTAsICcjRkZGRkZGJywgMF0sIFs1MCwgJyMwMDAwMDAnLCAwXSwgWzEwMCwgJyMwMDAwMDAnLCAxXSBdO1xyXG4gICAgICAgIFQubWFrZUdyYWRpYW50KCAnbGluZWFyR3JhZGllbnQnLCB7IGlkOidHTDAnLCB4MTowLCB5MTptaWQtdHcsIHgyOjAsIHkyOm1pZCt0dywgZ3JhZGllbnRVbml0czpcInVzZXJTcGFjZU9uVXNlXCIgfSwgc3ZnLCBjY2MgKTtcclxuXHJcbiAgICAgICAgY2NjID0gWyBbMCwgJyM3ZjdmN2YnLCAxXSwgWzUwLCAnIzdmN2Y3ZicsIDAuNV0sIFsxMDAsICcjN2Y3ZjdmJywgMF0gXTtcclxuICAgICAgICBULm1ha2VHcmFkaWFudCggJ2xpbmVhckdyYWRpZW50JywgeyBpZDonR0wxJywgeDE6bWlkLTQ5LjA1LCB5MTowLCB4MjptaWQrOTgsIHkyOjAsIGdyYWRpZW50VW5pdHM6XCJ1c2VyU3BhY2VPblVzZVwiIH0sIHN2ZywgY2NjICk7XHJcblxyXG4gICAgICAgIFQuZG9tKCAnZycsIG51bGwsIHsgJ3RyYW5zZm9ybS1vcmlnaW4nOiAnMTI4cHggMTI4cHgnLCAndHJhbnNmb3JtJzoncm90YXRlKDApJyB9LCBzdmcgKTsvLzJcclxuICAgICAgICBULmRvbSggJ3BvbHlnb24nLCAnJywgeyBwb2ludHM6Jzc4Ljk1IDQzLjEgNzguOTUgMjEyLjg1IDIyNiAxMjgnLCAgZmlsbDoncmVkJyAgfSwgc3ZnLCAyICk7Ly8gMiwwXHJcbiAgICAgICAgVC5kb20oICdwb2x5Z29uJywgJycsIHsgcG9pbnRzOic3OC45NSA0My4xIDc4Ljk1IDIxMi44NSAyMjYgMTI4JywgIGZpbGw6J3VybCgjR0wxKScsJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOid1cmwoI0dMMSknICB9LCBzdmcsIDIgKTsvLzIsMVxyXG4gICAgICAgIFQuZG9tKCAncG9seWdvbicsICcnLCB7IHBvaW50czonNzguOTUgNDMuMSA3OC45NSAyMTIuODUgMjI2IDEyOCcsICBmaWxsOid1cmwoI0dMMCknLCdzdHJva2Utd2lkdGgnOjEsIHN0cm9rZTondXJsKCNHTDApJyAgfSwgc3ZnLCAyICk7Ly8yLDJcclxuICAgICAgICBULmRvbSggJ3BhdGgnLCAnJywgeyBkOidNIDI1NS43NSAxMzYuNSBRIDI1NiAxMzIuMyAyNTYgMTI4IDI1NiAxMjMuNyAyNTUuNzUgMTE5LjUgTCAyNDEgMTI4IDI1NS43NSAxMzYuNSBaJywgIGZpbGw6J25vbmUnLCdzdHJva2Utd2lkdGgnOjIsIHN0cm9rZTonIzAwMCcgIH0sIHN2ZywgMiApOy8vMiwzXHJcbiAgICAgICAgLy9ULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjEyOCsxMTMsIGN5OjEyOCwgcjo2LCAnc3Ryb2tlLXdpZHRoJzozLCBzdHJva2U6JyMwMDAnLCBmaWxsOidub25lJyB9LCBzdmcsIDIgKTsvLzIuM1xyXG5cclxuICAgICAgICBULmRvbSggJ2NpcmNsZScsICcnLCB7IGN4OjEyOCwgY3k6MTI4LCByOjYsICdzdHJva2Utd2lkdGgnOjIsIHN0cm9rZTonIzAwMCcsIGZpbGw6J25vbmUnIH0sIHN2ZyApOy8vM1xyXG5cclxuICAgICAgICBULmNvbG9yUmluZyA9IHN2ZztcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGljb246IGZ1bmN0aW9uICggdHlwZSwgY29sb3IsIHcgKXtcclxuXHJcbiAgICAgICAgdyA9IHcgfHwgNDA7XHJcbiAgICAgICAgY29sb3IgPSBjb2xvciB8fCAnI0RFREVERSc7XHJcbiAgICAgICAgbGV0IHZpZXdCb3ggPSAnMCAwIDI1NiAyNTYnO1xyXG4gICAgICAgIGxldCB0ID0gW1wiPHN2ZyB4bWxucz0nXCIrVC5zdmducytcIicgdmVyc2lvbj0nMS4xJyB4bWxuczp4bGluaz0nXCIrVC5odG1scytcIicgc3R5bGU9J3BvaW50ZXItZXZlbnRzOm5vbmU7JyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSd4TWluWU1heCBtZWV0JyB4PScwcHgnIHk9JzBweCcgd2lkdGg9J1wiK3crXCJweCcgaGVpZ2h0PSdcIit3K1wicHgnIHZpZXdCb3g9J1wiK3ZpZXdCb3grXCInPjxnPlwiXTtcclxuICAgICAgICBzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgICAgIGNhc2UgJ2xvZ28nOlxyXG4gICAgICAgICAgICB0WzFdPVwiPHBhdGggaWQ9J2xvZ29pbicgZmlsbD0nXCIrY29sb3IrXCInIHN0cm9rZT0nbm9uZScgZD0nXCIrVC5sb2dvRmlsbF9kK1wiJy8+XCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzYXZlJzpcclxuICAgICAgICAgICAgdFsxXT1cIjxwYXRoIHN0cm9rZT0nXCIrY29sb3IrXCInIHN0cm9rZS13aWR0aD0nNCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCcgc3Ryb2tlLWxpbmVjYXA9J3JvdW5kJyBmaWxsPSdub25lJyBkPSdNIDI2LjEyNSAxNyBMIDIwIDIyLjk1IDE0LjA1IDE3IE0gMjAgOS45NSBMIDIwIDIyLjk1Jy8+PHBhdGggc3Ryb2tlPSdcIitjb2xvcjtcclxuICAgICAgICAgICAgdFsxXSs9XCInIHN0cm9rZS13aWR0aD0nMi41JyBzdHJva2UtbGluZWpvaW49J3JvdW5kJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIGZpbGw9J25vbmUnIGQ9J00gMzIuNiAyMyBMIDMyLjYgMjUuNSBRIDMyLjYgMjguNSAyOS42IDI4LjUgTCAxMC42IDI4LjUgUSA3LjYgMjguNSA3LjYgMjUuNSBMIDcuNiAyMycvPlwiO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdFsyXSA9IFwiPC9nPjwvc3ZnPlwiO1xyXG4gICAgICAgIHJldHVybiB0LmpvaW4oXCJcXG5cIik7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBsb2dvRmlsbF9kOiBbXHJcbiAgICBcIk0gMTcxIDE1MC43NSBMIDE3MSAzMy4yNSAxNTUuNSAzMy4yNSAxNTUuNSAxNTAuNzUgUSAxNTUuNSAxNjIuMiAxNDcuNDUgMTcwLjIgMTM5LjQ1IDE3OC4yNSAxMjggMTc4LjI1IDExNi42IDE3OC4yNSAxMDguNTUgMTcwLjIgMTAwLjUgMTYyLjIgMTAwLjUgMTUwLjc1IFwiLFxyXG4gICAgXCJMIDEwMC41IDMzLjI1IDg1IDMzLjI1IDg1IDE1MC43NSBRIDg1IDE2OC42NSA5Ny41NSAxODEuMTUgMTEwLjE1IDE5My43NSAxMjggMTkzLjc1IDE0NS45IDE5My43NSAxNTguNCAxODEuMTUgMTcxIDE2OC42NSAxNzEgMTUwLjc1IFwiLFxyXG4gICAgXCJNIDIwMCAzMy4yNSBMIDE4NCAzMy4yNSAxODQgMTUwLjggUSAxODQgMTc0LjEgMTY3LjYgMTkwLjQgMTUxLjMgMjA2LjggMTI4IDIwNi44IDEwNC43NSAyMDYuOCA4OC4zIDE5MC40IDcyIDE3NC4xIDcyIDE1MC44IEwgNzIgMzMuMjUgNTYgMzMuMjUgNTYgMTUwLjc1IFwiLFxyXG4gICAgXCJRIDU2IDE4MC41NSA3Ny4wNSAyMDEuNiA5OC4yIDIyMi43NSAxMjggMjIyLjc1IDE1Ny44IDIyMi43NSAxNzguOSAyMDEuNiAyMDAgMTgwLjU1IDIwMCAxNTAuNzUgTCAyMDAgMzMuMjUgWlwiLFxyXG4gICAgXS5qb2luKCdcXG4nKSxcclxuXHJcbn1cclxuXHJcblQuc2V0VGV4dCgpO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRvb2xzID0gVDsiLCJcclxuLyoqXHJcbiAqIEBhdXRob3IgbHRoIC8gaHR0cHM6Ly9naXRodWIuY29tL2xvLXRoXHJcbiAqL1xyXG5cclxuLy8gSU5URU5BTCBGVU5DVElPTlxyXG5cclxuY29uc3QgUiA9IHtcclxuXHJcblx0dWk6IFtdLFxyXG5cclxuXHRJRDogbnVsbCxcclxuICAgIGxvY2s6ZmFsc2UsXHJcbiAgICB3bG9jazpmYWxzZSxcclxuICAgIGN1cnJlbnQ6LTEsXHJcblxyXG5cdG5lZWRSZVpvbmU6IHRydWUsXHJcblx0aXNFdmVudHNJbml0OiBmYWxzZSxcclxuXHJcbiAgICBwcmV2RGVmYXVsdDogWydjb250ZXh0bWVudScsICdtb3VzZWRvd24nLCAnbW91c2Vtb3ZlJywgJ21vdXNldXAnXSxcclxuICAgIHBvaW50ZXJFdmVudDogWydwb2ludGVyZG93bicsICdwb2ludGVybW92ZScsICdwb2ludGVydXAnXSxcclxuXHJcblx0eG1sc2VyaWFsaXplcjogbmV3IFhNTFNlcmlhbGl6ZXIoKSxcclxuXHR0bXBUaW1lOiBudWxsLFxyXG4gICAgdG1wSW1hZ2U6IG51bGwsXHJcblxyXG4gICAgb2xkQ3Vyc29yOidhdXRvJyxcclxuXHJcbiAgICBpbnB1dDogbnVsbCxcclxuICAgIHBhcmVudDogbnVsbCxcclxuICAgIGZpcnN0SW1wdXQ6IHRydWUsXHJcbiAgICAvL2NhbGxiYWNrSW1wdXQ6IG51bGwsXHJcbiAgICBoaWRkZW5JbXB1dDpudWxsLFxyXG4gICAgaGlkZGVuU2l6ZXI6bnVsbCxcclxuICAgIGhhc0ZvY3VzOmZhbHNlLFxyXG4gICAgc3RhcnRJbnB1dDpmYWxzZSxcclxuICAgIGlucHV0UmFuZ2UgOiBbMCwwXSxcclxuICAgIGN1cnNvcklkIDogMCxcclxuICAgIHN0cjonJyxcclxuICAgIHBvczowLFxyXG4gICAgc3RhcnRYOi0xLFxyXG4gICAgbW92ZVg6LTEsXHJcblxyXG4gICAgZGVidWdJbnB1dDpmYWxzZSxcclxuXHJcbiAgICBpc0xvb3A6IGZhbHNlLFxyXG4gICAgbGlzdGVuczogW10sXHJcblxyXG4gICAgZTp7XHJcbiAgICAgICAgdHlwZTpudWxsLFxyXG4gICAgICAgIGNsaWVudFg6MCxcclxuICAgICAgICBjbGllbnRZOjAsXHJcbiAgICAgICAga2V5Q29kZTpOYU4sXHJcbiAgICAgICAga2V5Om51bGwsXHJcbiAgICAgICAgZGVsdGE6MCxcclxuICAgIH0sXHJcblxyXG4gICAgaXNNb2JpbGU6IGZhbHNlLFxyXG5cclxuICAgIFxyXG5cclxuXHRhZGQ6IGZ1bmN0aW9uICggbyApIHtcclxuXHJcbiAgICAgICAgUi51aS5wdXNoKCBvICk7XHJcbiAgICAgICAgUi5nZXRab25lKCBvICk7XHJcblxyXG4gICAgICAgIGlmKCAhUi5pc0V2ZW50c0luaXQgKSBSLmluaXRFdmVudHMoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRlc3RNb2JpbGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgbGV0IG4gPSBuYXZpZ2F0b3IudXNlckFnZW50O1xyXG4gICAgICAgIGlmIChuLm1hdGNoKC9BbmRyb2lkL2kpIHx8IG4ubWF0Y2goL3dlYk9TL2kpIHx8IG4ubWF0Y2goL2lQaG9uZS9pKSB8fCBuLm1hdGNoKC9pUGFkL2kpIHx8IG4ubWF0Y2goL2lQb2QvaSkgfHwgbi5tYXRjaCgvQmxhY2tCZXJyeS9pKSB8fCBuLm1hdGNoKC9XaW5kb3dzIFBob25lL2kpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBlbHNlIHJldHVybiBmYWxzZTsgIFxyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlOiBmdW5jdGlvbiAoIG8gKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gUi51aS5pbmRleE9mKCBvICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKCBpICE9PSAtMSApIHtcclxuICAgICAgICAgICAgUi5yZW1vdmVMaXN0ZW4oIG8gKTtcclxuICAgICAgICAgICAgUi51aS5zcGxpY2UoIGksIDEgKTsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggUi51aS5sZW5ndGggPT09IDAgKXtcclxuICAgICAgICAgICAgUi5yZW1vdmVFdmVudHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGluaXRFdmVudHM6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNFdmVudHNJbml0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgZG9tID0gZG9jdW1lbnQuYm9keTtcclxuXHJcbiAgICAgICAgUi5pc01vYmlsZSA9IFIudGVzdE1vYmlsZSgpO1xyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSApe1xyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZG9tLmFkZEV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5hZGRFdmVudExpc3RlbmVyKCAnd2hlZWwnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgUiwgZmFsc2UgKTtcclxuXHJcbiAgICAgICAgICAgIC8qZG9tLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBSLCBmYWxzZSApOyovXHJcblxyXG4gICAgICAgICAgICBkb20uYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJkb3duJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJtb3ZlJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3BvaW50ZXJ1cCcsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgUi5yZXNpemUgLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAvL3dpbmRvdy5vbmJsdXIgPSBSLm91dDtcclxuICAgICAgICAvL3dpbmRvdy5vbmZvY3VzID0gUi5pbjtcclxuXHJcbiAgICAgICAgUi5pc0V2ZW50c0luaXQgPSB0cnVlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlRXZlbnRzOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhUi5pc0V2ZW50c0luaXQgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBkb20gPSBkb2N1bWVudC5ib2R5O1xyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSApe1xyXG4gICAgICAgICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgUiwgZmFsc2UgKTtcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZG9tLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjb250ZXh0bWVudScsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAnd2hlZWwnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCBSLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAgICAgLypkb20ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIFIsIGZhbHNlICk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIFIsIGZhbHNlICk7Ki9cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGRvbS5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcmRvd24nLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcm1vdmUnLCBSLCBmYWxzZSApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAncG9pbnRlcnVwJywgUiwgZmFsc2UgKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBSICk7XHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIFIgKTtcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIFIucmVzaXplICApO1xyXG5cclxuICAgICAgICBSLmlzRXZlbnRzSW5pdCA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVzaXplOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIFIubmVlZFJlWm9uZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGxldCBpID0gUi51aS5sZW5ndGgsIHU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cclxuICAgICAgICAgICAgdSA9IFIudWlbaV07XHJcbiAgICAgICAgICAgIGlmKCB1LmlzR3VpICYmICF1LmlzQ2FudmFzT25seSAmJiB1LmF1dG9SZXNpemUgKSB1LnNldEhlaWdodCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIG91dDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBjb25zb2xlLmxvZygnaW0gYW0gb3V0JylcclxuICAgICAgICBSLmNsZWFyT2xkSUQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGluOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKCdpbSBhbSBpbicpXHJcbiAgICAgIC8vICBSLmNsZWFyT2xkSUQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSEFORExFIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgXHJcblxyXG4gICAgaGFuZGxlRXZlbnQ6IGZ1bmN0aW9uICggZXZlbnQgKSB7XHJcblxyXG4gICAgICAgIC8vaWYoIWV2ZW50LnR5cGUpIHJldHVybjtcclxuXHJcbiAgICAgIC8vICBjb25zb2xlLmxvZyggZXZlbnQudHlwZSApXHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlLmluZGV4T2YoIFIucHJldkRlZmF1bHQgKSAhPT0gLTEgKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBcclxuXHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlLmluZGV4T2YoIFIucG9pbnRlckV2ZW50ICkgIT09IC0xICkge1xyXG5cclxuICAgICAgICAgICAgaWYoIGV2ZW50LnBvaW50ZXJUeXBlIT09J21vdXNlJyB8fCBldmVudC5wb2ludGVyVHlwZSE9PSdwZW4nICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAnY29udGV4dG1lbnUnICkgcmV0dXJuOyBcclxuXHJcbiAgICAgICAgLy9pZiggZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nKXsgUi5lZGl0VGV4dCggZXZlbnQgKTsgcmV0dXJuO31cclxuXHJcbiAgICAgICAgLy9pZiggZXZlbnQudHlwZSAhPT0gJ2tleWRvd24nICYmIGV2ZW50LnR5cGUgIT09ICd3aGVlbCcgKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIC8vZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIFIuZmluZFpvbmUoKTtcclxuICAgICAgIFxyXG4gICAgICAgIGxldCBlID0gUi5lO1xyXG5cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ2tleWRvd24nKSBSLmtleWRvd24oIGV2ZW50ICk7XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdrZXl1cCcpIFIua2V5dXAoIGV2ZW50ICk7XHJcblxyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAnd2hlZWwnICkgZS5kZWx0YSA9IGV2ZW50LmRlbHRhWSA+IDAgPyAxIDogLTE7XHJcbiAgICAgICAgZWxzZSBlLmRlbHRhID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBlLmNsaWVudFggPSBldmVudC5jbGllbnRYIHx8IDA7XHJcbiAgICAgICAgZS5jbGllbnRZID0gZXZlbnQuY2xpZW50WSB8fCAwO1xyXG4gICAgICAgIGUudHlwZSA9IGV2ZW50LnR5cGU7XHJcblxyXG4gICAgICAgIC8vIG1vYmlsZVxyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlcy5sZW5ndGggPiAwICl7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFggPSBldmVudC50b3VjaGVzWyAwIF0uY2xpZW50WCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRZID0gZXZlbnQudG91Y2hlc1sgMCBdLmNsaWVudFkgfHwgMDtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2hzdGFydCcpIGUudHlwZSA9ICdtb3VzZWRvd24nO1xyXG4gICAgICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNoZW5kJykgZS50eXBlID0gJ21vdXNldXAnXHJcbiAgICAgICAgICAgIGlmKCBldmVudC50eXBlID09PSAndG91Y2htb3ZlJykgZS50eXBlID0gJ21vdXNlbW92ZSc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICdwb2ludGVyZG93bicpIGUudHlwZSA9ICdtb3VzZWRvd24nO1xyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAncG9pbnRlcnVwJykgZS50eXBlID0gJ21vdXNldXAnO1xyXG4gICAgICAgIGlmKCBldmVudC50eXBlID09PSAncG9pbnRlcm1vdmUnKSBlLnR5cGUgPSAnbW91c2Vtb3ZlJztcclxuXHJcbiAgICAgICAvL2lmKCAncG9pbnRlcmRvd24nICdwb2ludGVybW92ZScsICdwb2ludGVydXAnKVxyXG4gICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jyl7IGUudHlwZSA9ICdtb3VzZWRvd24nOyBSLmZpbmRJRCggZSApOyB9XHJcbiAgICAgICAgaWYoIGV2ZW50LnR5cGUgPT09ICd0b3VjaGVuZCcpeyBlLnR5cGUgPSAnbW91c2V1cCc7ICBpZiggUi5JRCAhPT0gbnVsbCApIFIuSUQuaGFuZGxlRXZlbnQoIGUgKTsgUi5jbGVhck9sZElEKCk7IH1cclxuICAgICAgICBpZiggZXZlbnQudHlwZSA9PT0gJ3RvdWNobW92ZScpeyBlLnR5cGUgPSAnbW91c2Vtb3ZlJzsgIH1cclxuICAgICAgICAqL1xyXG5cclxuXHJcbiAgICAgICAgaWYoIGUudHlwZSA9PT0gJ21vdXNlZG93bicgKSBSLmxvY2sgPSB0cnVlO1xyXG4gICAgICAgIGlmKCBlLnR5cGUgPT09ICdtb3VzZXVwJyApIFIubG9jayA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggUi5pc01vYmlsZSAmJiBlLnR5cGUgPT09ICdtb3VzZWRvd24nICkgUi5maW5kSUQoIGUgKTtcclxuICAgICAgICBpZiggZS50eXBlID09PSAnbW91c2Vtb3ZlJyAmJiAhUi5sb2NrICkgUi5maW5kSUQoIGUgKTtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgaWYoIFIuSUQgIT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCBSLklELmlzQ2FudmFzT25seSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFggPSBSLklELm1vdXNlLng7XHJcbiAgICAgICAgICAgICAgICBlLmNsaWVudFkgPSBSLklELm1vdXNlLnk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBSLklELmhhbmRsZUV2ZW50KCBlICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIFIuaXNNb2JpbGUgJiYgZS50eXBlID09PSAnbW91c2V1cCcgKSBSLmNsZWFyT2xkSUQoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSURcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBmaW5kSUQ6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBSLnVpLmxlbmd0aCwgbmV4dCA9IC0xLCB1LCB4LCB5O1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcblxyXG4gICAgICAgICAgICB1ID0gUi51aVtpXTtcclxuXHJcbiAgICAgICAgICAgIGlmKCB1LmlzQ2FudmFzT25seSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICB4ID0gdS5tb3VzZS54O1xyXG4gICAgICAgICAgICAgICAgeSA9IHUubW91c2UueTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgeCA9IGUuY2xpZW50WDtcclxuICAgICAgICAgICAgICAgIHkgPSBlLmNsaWVudFk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggUi5vblpvbmUoIHUsIHgsIHkgKSApeyBcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbmV4dCA9IGk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmKCBuZXh0ICE9PSBSLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgICAgICAgICBSLmNsZWFyT2xkSUQoKTtcclxuICAgICAgICAgICAgICAgICAgICBSLmN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgIFIuSUQgPSB1O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5leHQgPT09IC0xICkgUi5jbGVhck9sZElEKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBjbGVhck9sZElEOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhUi5JRCApIHJldHVybjtcclxuICAgICAgICBSLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICBSLklELnJlc2V0KCk7XHJcbiAgICAgICAgUi5JRCA9IG51bGw7XHJcbiAgICAgICAgUi5jdXJzb3IoKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgR1VJIC8gR1JPVVAgRlVOQ1RJT05cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjYWxjVWlzOiBmdW5jdGlvbiAoIHVpcywgem9uZSwgcHkgKSB7XHJcblxyXG4gICAgICAgIGxldCBsbmcgPSB1aXMubGVuZ3RoLCB1LCBpLCBweCA9IDAsIG15ID0gMDtcclxuXHJcbiAgICAgICAgZm9yKCBpID0gMDsgaSA8IGxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICB1ID0gdWlzW2ldO1xyXG5cclxuICAgICAgICAgICAgdS56b25lLncgPSB1Lnc7XHJcbiAgICAgICAgICAgIHUuem9uZS5oID0gdS5oO1xyXG5cclxuICAgICAgICAgICAgaWYoICF1LmF1dG9XaWR0aCApe1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBweCA9PT0gMCApIHB5ICs9IHUuaCArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgdS56b25lLnggPSB6b25lLnggKyBweDtcclxuICAgICAgICAgICAgICAgIHUuem9uZS55ID0gcHggPT09IDAgPyBweSAtIHUuaCA6IG15O1xyXG5cclxuICAgICAgICAgICAgICAgIG15ID0gdS56b25lLnk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHB4ICs9IHUudztcclxuICAgICAgICAgICAgICAgIGlmKCBweCArIHUudyA+IHpvbmUudyApIHB4ID0gMDtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdS56b25lLnggPSB6b25lLng7XHJcbiAgICAgICAgICAgICAgICB1LnpvbmUueSA9IHB5O1xyXG4gICAgICAgICAgICAgICAgcHkgKz0gdS5oICsgMTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCB1LmlzR3JvdXAgKSB1LmNhbGNVaXMoKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG5cclxuXHRmaW5kVGFyZ2V0OiBmdW5jdGlvbiAoIHVpcywgZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB1aXMubGVuZ3RoO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCBSLm9uWm9uZSggdWlzW2ldLCBlLmNsaWVudFgsIGUuY2xpZW50WSApICkgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gLTE7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFpPTkVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBmaW5kWm9uZTogZnVuY3Rpb24gKCBmb3JjZSApIHtcclxuXHJcbiAgICAgICAgaWYoICFSLm5lZWRSZVpvbmUgJiYgIWZvcmNlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgaSA9IFIudWkubGVuZ3RoLCB1O1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7IFxyXG5cclxuICAgICAgICAgICAgdSA9IFIudWlbaV07XHJcbiAgICAgICAgICAgIFIuZ2V0Wm9uZSggdSApO1xyXG4gICAgICAgICAgICBpZiggdS5pc0d1aSApIHUuY2FsY1VpcygpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFIubmVlZFJlWm9uZSA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgb25ab25lOiBmdW5jdGlvbiAoIG8sIHgsIHkgKSB7XHJcblxyXG4gICAgICAgIGlmKCB4ID09PSB1bmRlZmluZWQgfHwgeSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgeiA9IG8uem9uZTtcclxuICAgICAgICBsZXQgbXggPSB4IC0gei54O1xyXG4gICAgICAgIGxldCBteSA9IHkgLSB6Lnk7XHJcblxyXG4gICAgICAgIGxldCBvdmVyID0gKCBteCA+PSAwICkgJiYgKCBteSA+PSAwICkgJiYgKCBteCA8PSB6LncgKSAmJiAoIG15IDw9IHouaCApO1xyXG5cclxuICAgICAgICBpZiggb3ZlciApIG8ubG9jYWwuc2V0KCBteCwgbXkgKTtcclxuICAgICAgICBlbHNlIG8ubG9jYWwubmVnKCk7XHJcblxyXG4gICAgICAgIHJldHVybiBvdmVyO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Wm9uZTogZnVuY3Rpb24gKCBvICkge1xyXG5cclxuICAgICAgICBpZiggby5pc0NhbnZhc09ubHkgKSByZXR1cm47XHJcbiAgICAgICAgbGV0IHIgPSBvLmdldERvbSgpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIG8uem9uZSA9IHsgeDpyLmxlZnQsIHk6ci50b3AsIHc6ci53aWR0aCwgaDpyLmhlaWdodCB9O1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDVVJTT1JcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjdXJzb3I6IGZ1bmN0aW9uICggbmFtZSApIHtcclxuXHJcbiAgICAgICAgbmFtZSA9IG5hbWUgPyBuYW1lIDogJ2F1dG8nO1xyXG4gICAgICAgIGlmKCBuYW1lICE9PSBSLm9sZEN1cnNvciApe1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9IG5hbWU7XHJcbiAgICAgICAgICAgIFIub2xkQ3Vyc29yID0gbmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIENBTlZBU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHRvQ2FudmFzOiBmdW5jdGlvbiAoIG8sIHcsIGgsIGZvcmNlICkge1xyXG5cclxuICAgICAgICAvLyBwcmV2ZW50IGV4ZXNpdmUgcmVkcmF3XHJcblxyXG4gICAgICAgIGlmKCBmb3JjZSAmJiBSLnRtcFRpbWUgIT09IG51bGwgKSB7IGNsZWFyVGltZW91dChSLnRtcFRpbWUpOyBSLnRtcFRpbWUgPSBudWxsOyAgfVxyXG5cclxuICAgICAgICBpZiggUi50bXBUaW1lICE9PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiggUi5sb2NrICkgUi50bXBUaW1lID0gc2V0VGltZW91dCggZnVuY3Rpb24oKXsgUi50bXBUaW1lID0gbnVsbDsgfSwgMTAgKTtcclxuXHJcbiAgICAgICAgLy8vXHJcblxyXG4gICAgICAgIGxldCBpc05ld1NpemUgPSBmYWxzZTtcclxuICAgICAgICBpZiggdyAhPT0gby5jYW52YXMud2lkdGggfHwgaCAhPT0gby5jYW52YXMuaGVpZ2h0ICkgaXNOZXdTaXplID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIFIudG1wSW1hZ2UgPT09IG51bGwgKSBSLnRtcEltYWdlID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIGxldCBpbWcgPSBSLnRtcEltYWdlOyAvL25ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICBsZXQgaHRtbFN0cmluZyA9IFIueG1sc2VyaWFsaXplci5zZXJpYWxpemVUb1N0cmluZyggby5jb250ZW50ICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHN2ZyA9ICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIicrdysnXCIgaGVpZ2h0PVwiJytoKydcIj48Zm9yZWlnbk9iamVjdCBzdHlsZT1cInBvaW50ZXItZXZlbnRzOiBub25lOyBsZWZ0OjA7XCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPicrIGh0bWxTdHJpbmcgKyc8L2ZvcmVpZ25PYmplY3Q+PC9zdmc+JztcclxuXHJcbiAgICAgICAgaW1nLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgbGV0IGN0eCA9IG8uY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCBpc05ld1NpemUgKXsgXHJcbiAgICAgICAgICAgICAgICBvLmNhbnZhcy53aWR0aCA9IHc7XHJcbiAgICAgICAgICAgICAgICBvLmNhbnZhcy5oZWlnaHQgPSBoXHJcbiAgICAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgICAgY3R4LmNsZWFyUmVjdCggMCwgMCwgdywgaCApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoIHRoaXMsIDAsIDAgKTtcclxuXHJcbiAgICAgICAgICAgIG8ub25EcmF3KCk7XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHN2Zyk7XHJcbiAgICAgICAgLy9pbWcuc3JjID0gJ2RhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsJysgd2luZG93LmJ0b2EoIHN2ZyApO1xyXG4gICAgICAgIGltZy5jcm9zc09yaWdpbiA9ICcnO1xyXG5cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgSU5QVVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRIaWRkZW46IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaGlkZGVuSW1wdXQgPT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBoaWRlID0gUi5kZWJ1Z0lucHV0ID8gJycgOiAnb3BhY2l0eTowOyB6SW5kZXg6MDsnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNzcyA9IFIucGFyZW50LmNzcy50eHQgKyAncGFkZGluZzowOyB3aWR0aDphdXRvOyBoZWlnaHQ6YXV0bzsgdGV4dC1zaGFkb3c6bm9uZTsnXHJcbiAgICAgICAgICAgIGNzcyArPSAnbGVmdDoxMHB4OyB0b3A6YXV0bzsgYm9yZGVyOm5vbmU7IGNvbG9yOiNGRkY7IGJhY2tncm91bmQ6IzAwMDsnICsgaGlkZTtcclxuXHJcbiAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0LnR5cGUgPSAndGV4dCc7XHJcbiAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuc3R5bGUuY3NzVGV4dCA9IGNzcyArICdib3R0b206MzBweDsnICsgKFIuZGVidWdJbnB1dCA/ICcnIDogJ3RyYW5zZm9ybTpzY2FsZSgwKTsnKTs7XHJcblxyXG4gICAgICAgICAgICBSLmhpZGRlblNpemVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIFIuaGlkZGVuU2l6ZXIuc3R5bGUuY3NzVGV4dCA9IGNzcyArICdib3R0b206NjBweDsnO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggUi5oaWRkZW5JbXB1dCApO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBSLmhpZGRlblNpemVyICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgUi5oaWRkZW5JbXB1dC5zdHlsZS53aWR0aCA9IFIuaW5wdXQuY2xpZW50V2lkdGggKyAncHgnO1xyXG4gICAgICAgIFIuaGlkZGVuSW1wdXQudmFsdWUgPSBSLnN0cjtcclxuICAgICAgICBSLmhpZGRlblNpemVyLmlubmVySFRNTCA9IFIuc3RyO1xyXG5cclxuICAgICAgICBSLmhhc0ZvY3VzID0gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsZWFySGlkZGVuOiBmdW5jdGlvbiAoIHAgKSB7XHJcblxyXG4gICAgICAgIGlmKCBSLmhpZGRlbkltcHV0ID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIFIuaGFzRm9jdXMgPSBmYWxzZTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGNsaWNrUG9zOiBmdW5jdGlvbiggeCApe1xyXG5cclxuICAgICAgICBsZXQgaSA9IFIuc3RyLmxlbmd0aCwgbCA9IDAsIG4gPSAwO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgbCArPSBSLnRleHRXaWR0aCggUi5zdHJbbl0gKTtcclxuICAgICAgICAgICAgaWYoIGwgPj0geCApIGJyZWFrO1xyXG4gICAgICAgICAgICBuKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBJbnB1dDogZnVuY3Rpb24gKCB4LCBkb3duICkge1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQgPT09IG51bGwgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG4gICAgIFxyXG4gICAgICAgIGlmKCBkb3duICl7XHJcblxyXG4gICAgICAgICAgICBsZXQgaWQgPSBSLmNsaWNrUG9zKCB4ICk7XHJcblxyXG4gICAgICAgICAgICBSLm1vdmVYID0gaWQ7XHJcblxyXG4gICAgICAgICAgICBpZiggUi5zdGFydFggPT09IC0xICl7IFxyXG5cclxuICAgICAgICAgICAgICAgIFIuc3RhcnRYID0gaWQ7XHJcbiAgICAgICAgICAgICAgICBSLmN1cnNvcklkID0gaWQ7XHJcbiAgICAgICAgICAgICAgICBSLmlucHV0UmFuZ2UgPSBbIFIuc3RhcnRYLCBSLnN0YXJ0WCBdO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBsZXQgaXNTZWxlY3Rpb24gPSBSLm1vdmVYICE9PSBSLnN0YXJ0WDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiggaXNTZWxlY3Rpb24gKXtcclxuICAgICAgICAgICAgICAgICAgICBpZiggUi5zdGFydFggPiBSLm1vdmVYICkgUi5pbnB1dFJhbmdlID0gWyBSLm1vdmVYLCBSLnN0YXJ0WCBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgUi5pbnB1dFJhbmdlID0gWyBSLnN0YXJ0WCwgUi5tb3ZlWCBdOyAgICBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdXAgPSB0cnVlO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuc3RhcnRYICE9PSAtMSApe1xyXG5cclxuICAgICAgICAgICAgICAgIFIuaGFzRm9jdXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5zZWxlY3Rpb25TdGFydCA9IFIuaW5wdXRSYW5nZVswXTtcclxuICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uRW5kID0gUi5pbnB1dFJhbmdlWzFdO1xyXG4gICAgICAgICAgICAgICAgUi5zdGFydFggPSAtMTtcclxuXHJcbiAgICAgICAgICAgICAgICB1cCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHVwICkgUi5zZWxlY3RQYXJlbnQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgc2VsZWN0UGFyZW50OiBmdW5jdGlvbiAoKXtcclxuXHJcbiAgICAgICAgdmFyIGMgPSBSLnRleHRXaWR0aCggUi5zdHIuc3Vic3RyaW5nKCAwLCBSLmN1cnNvcklkICkpO1xyXG4gICAgICAgIHZhciBlID0gUi50ZXh0V2lkdGgoIFIuc3RyLnN1YnN0cmluZyggMCwgUi5pbnB1dFJhbmdlWzBdICkpO1xyXG4gICAgICAgIHZhciBzID0gUi50ZXh0V2lkdGgoIFIuc3RyLnN1YnN0cmluZyggUi5pbnB1dFJhbmdlWzBdLCAgUi5pbnB1dFJhbmdlWzFdICkpO1xyXG5cclxuICAgICAgICBSLnBhcmVudC5zZWxlY3QoIGMsIGUsIHMgKTtcclxuXHJcbiAgICB9LFxyXG5cclxuICAgIHRleHRXaWR0aDogZnVuY3Rpb24gKCB0ZXh0ICl7XHJcblxyXG4gICAgICAgIGlmKCBSLmhpZGRlblNpemVyID09PSBudWxsICkgcmV0dXJuIDA7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvIC9nLCAnJm5ic3A7Jyk7XHJcbiAgICAgICAgUi5oaWRkZW5TaXplci5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgIHJldHVybiBSLmhpZGRlblNpemVyLmNsaWVudFdpZHRoO1xyXG5cclxuICAgIH0sXHJcblxyXG5cclxuICAgIGNsZWFySW5wdXQ6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGlmKCAhUi5maXJzdEltcHV0ICkgUi5wYXJlbnQudmFsaWRhdGUoIHRydWUgKTtcclxuXHJcbiAgICAgICAgUi5jbGVhckhpZGRlbigpO1xyXG4gICAgICAgIFIucGFyZW50LnVuc2VsZWN0KCk7XHJcblxyXG4gICAgICAgIC8vUi5pbnB1dC5zdHlsZS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xyXG4gICAgICAgIFIuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9IFIucGFyZW50LmNvbG9ycy5pbnB1dEJnO1xyXG4gICAgICAgIFIuaW5wdXQuc3R5bGUuYm9yZGVyQ29sb3IgPSBSLnBhcmVudC5jb2xvcnMuaW5wdXRCb3JkZXI7XHJcbiAgICAgICAgUi5wYXJlbnQuaXNFZGl0ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIFIuaW5wdXQgPSBudWxsO1xyXG4gICAgICAgIFIucGFyZW50ID0gbnVsbDtcclxuICAgICAgICBSLnN0ciA9ICcnLFxyXG4gICAgICAgIFIuZmlyc3RJbXB1dCA9IHRydWU7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRJbnB1dDogZnVuY3Rpb24gKCBJbnB1dCwgcGFyZW50ICkge1xyXG5cclxuICAgICAgICBSLmNsZWFySW5wdXQoKTtcclxuICAgICAgICBcclxuICAgICAgICBSLmlucHV0ID0gSW5wdXQ7XHJcbiAgICAgICAgUi5wYXJlbnQgPSBwYXJlbnQ7XHJcblxyXG4gICAgICAgIFIuaW5wdXQuc3R5bGUuYmFja2dyb3VuZCA9IFIucGFyZW50LmNvbG9ycy5pbnB1dE92ZXI7XHJcbiAgICAgICAgUi5pbnB1dC5zdHlsZS5ib3JkZXJDb2xvciA9IFIucGFyZW50LmNvbG9ycy5pbnB1dEJvcmRlclNlbGVjdDtcclxuICAgICAgICBSLnN0ciA9IFIuaW5wdXQudGV4dENvbnRlbnQ7XHJcblxyXG4gICAgICAgIFIuc2V0SGlkZGVuKCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICAvKnNlbGVjdDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCggXCJzZWxlY3RhbGxcIiwgbnVsbCwgZmFsc2UgKTtcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAga2V5ZG93bjogZnVuY3Rpb24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggUi5wYXJlbnQgPT09IG51bGwgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBrZXlDb2RlID0gZS53aGljaCwgaXNTaGlmdCA9IGUuc2hpZnRLZXk7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coIGtleUNvZGUgKVxyXG5cclxuICAgICAgICBSLmZpcnN0SW1wdXQgPSBmYWxzZTtcclxuXHJcblxyXG4gICAgICAgIGlmIChSLmhhc0ZvY3VzKSB7XHJcbiAgICAgICAgICAgIC8vIGhhY2sgdG8gZml4IHRvdWNoIGV2ZW50IGJ1ZyBpbiBpT1MgU2FmYXJpXHJcbiAgICAgICAgICAgIHdpbmRvdy5mb2N1cygpO1xyXG4gICAgICAgICAgICBSLmhpZGRlbkltcHV0LmZvY3VzKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIFIucGFyZW50LmlzRWRpdCA9IHRydWU7XHJcblxyXG4gICAgICAgLy8gZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAvLyBhZGQgc3VwcG9ydCBmb3IgQ3RybC9DbWQrQSBzZWxlY3Rpb25cclxuICAgICAgICAvL2lmICgga2V5Q29kZSA9PT0gNjUgJiYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgKSkge1xyXG4gICAgICAgICAgICAvL1Iuc2VsZWN0VGV4dCgpO1xyXG4gICAgICAgICAgICAvL2UucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgLy9yZXR1cm4gc2VsZi5yZW5kZXIoKTtcclxuICAgICAgICAvL31cclxuXHJcbiAgICAgICAgaWYoIGtleUNvZGUgPT09IDEzICl7IC8vZW50ZXJcclxuXHJcbiAgICAgICAgICAgIFIuY2xlYXJJbnB1dCgpO1xyXG5cclxuICAgICAgICAvL30gZWxzZSBpZigga2V5Q29kZSA9PT0gOSApeyAvL3RhYiBrZXlcclxuXHJcbiAgICAgICAgICAgLy8gUi5pbnB1dC50ZXh0Q29udGVudCA9ICcnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgaWYoIFIuaW5wdXQuaXNOdW0gKXtcclxuICAgICAgICAgICAgICAgIGlmICggKChlLmtleUNvZGUgPiA0NykgJiYgKGUua2V5Q29kZSA8IDU4KSkgfHwgKChlLmtleUNvZGUgPiA5NSkgJiYgKGUua2V5Q29kZSA8IDEwNikpIHx8IGUua2V5Q29kZSA9PT0gMTkwIHx8IGUua2V5Q29kZSA9PT0gMTEwIHx8IGUua2V5Q29kZSA9PT0gOCB8fCBlLmtleUNvZGUgPT09IDEwOSApe1xyXG4gICAgICAgICAgICAgICAgICAgIFIuaGlkZGVuSW1wdXQucmVhZE9ubHkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgUi5oaWRkZW5JbXB1dC5yZWFkT25seSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBSLmhpZGRlbkltcHV0LnJlYWRPbmx5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcblxyXG4gICAga2V5dXA6IGZ1bmN0aW9uICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIFIucGFyZW50ID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBSLnN0ciA9IFIuaGlkZGVuSW1wdXQudmFsdWU7XHJcblxyXG4gICAgICAgIGlmKCBSLnBhcmVudC5hbGxFcXVhbCApIFIucGFyZW50LnNhbWVTdHIoIFIuc3RyICk7Ly8gbnVtZXJpYyBzYW3DuWUgdmFsdWVcclxuICAgICAgICBlbHNlIFIuaW5wdXQudGV4dENvbnRlbnQgPSBSLnN0cjtcclxuXHJcbiAgICAgICAgUi5jdXJzb3JJZCA9IFIuaGlkZGVuSW1wdXQuc2VsZWN0aW9uU3RhcnQ7XHJcbiAgICAgICAgUi5pbnB1dFJhbmdlID0gWyBSLmhpZGRlbkltcHV0LnNlbGVjdGlvblN0YXJ0LCBSLmhpZGRlbkltcHV0LnNlbGVjdGlvbkVuZCBdO1xyXG5cclxuICAgICAgICBSLnNlbGVjdFBhcmVudCgpO1xyXG5cclxuICAgICAgICAvL2lmKCBSLnBhcmVudC5hbGx3YXkgKSBcclxuICAgICAgICBSLnBhcmVudC52YWxpZGF0ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy9cclxuICAgIC8vICAgTElTVEVOSU5HXHJcbiAgICAvL1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGxvb3A6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgaWYoIFIuaXNMb29wICkgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBSLmxvb3AgKTtcclxuICAgICAgICBSLnVwZGF0ZSgpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gUi5saXN0ZW5zLmxlbmd0aDtcclxuICAgICAgICB3aGlsZSggaS0tICkgUi5saXN0ZW5zW2ldLmxpc3RlbmluZygpO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgcmVtb3ZlTGlzdGVuOiBmdW5jdGlvbiAoIHByb3RvICkge1xyXG5cclxuICAgICAgICBsZXQgaWQgPSBSLmxpc3RlbnMuaW5kZXhPZiggcHJvdG8gKTtcclxuICAgICAgICBpZiggaWQgIT09IC0xICkgUi5saXN0ZW5zLnNwbGljZShpZCwgMSk7XHJcbiAgICAgICAgaWYoIFIubGlzdGVucy5sZW5ndGggPT09IDAgKSBSLmlzTG9vcCA9IGZhbHNlO1xyXG5cclxuICAgIH0sXHJcblxyXG4gICAgYWRkTGlzdGVuOiBmdW5jdGlvbiAoIHByb3RvICkge1xyXG5cclxuICAgICAgICBsZXQgaWQgPSBSLmxpc3RlbnMuaW5kZXhPZiggcHJvdG8gKTtcclxuXHJcbiAgICAgICAgaWYoIGlkICE9PSAtMSApIHJldHVybiBmYWxzZTsgXHJcblxyXG4gICAgICAgIFIubGlzdGVucy5wdXNoKCBwcm90byApO1xyXG5cclxuICAgICAgICBpZiggIVIuaXNMb29wICl7XHJcbiAgICAgICAgICAgIFIuaXNMb29wID0gdHJ1ZTtcclxuICAgICAgICAgICAgUi5sb29wKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LFxyXG5cclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IFJvb3RzID0gUjsiLCJleHBvcnQgY2xhc3MgVjIge1xyXG5cclxuXHRjb25zdHJ1Y3RvciggeCA9IDAsIHkgPSAwICkge1xyXG5cclxuXHRcdHRoaXMueCA9IHg7XHJcblx0XHR0aGlzLnkgPSB5O1xyXG5cclxuXHR9XHJcblxyXG5cdHNldCAoIHgsIHkgKSB7XHJcblxyXG5cdFx0dGhpcy54ID0geDtcclxuXHRcdHRoaXMueSA9IHk7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRkaXZpZGUgKCB2ICkge1xyXG5cclxuXHRcdHRoaXMueCAvPSB2Lng7XHJcblx0XHR0aGlzLnkgLz0gdi55O1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bXVsdGlwbHkgKCB2ICkge1xyXG5cclxuXHRcdHRoaXMueCAqPSB2Lng7XHJcblx0XHR0aGlzLnkgKj0gdi55O1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bXVsdGlwbHlTY2FsYXIgKCBzY2FsYXIgKSB7XHJcblxyXG5cdFx0dGhpcy54ICo9IHNjYWxhcjtcclxuXHRcdHRoaXMueSAqPSBzY2FsYXI7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRkaXZpZGVTY2FsYXIgKCBzY2FsYXIgKSB7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlTY2FsYXIoIDEgLyBzY2FsYXIgKTtcclxuXHJcblx0fVxyXG5cclxuXHRsZW5ndGggKCkge1xyXG5cclxuXHRcdHJldHVybiBNYXRoLnNxcnQoIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSApO1xyXG5cclxuXHR9XHJcblxyXG5cdGFuZ2xlICgpIHtcclxuXHJcblx0XHQvLyBjb21wdXRlcyB0aGUgYW5nbGUgaW4gcmFkaWFucyB3aXRoIHJlc3BlY3QgdG8gdGhlIHBvc2l0aXZlIHgtYXhpc1xyXG5cclxuXHRcdHZhciBhbmdsZSA9IE1hdGguYXRhbjIoIHRoaXMueSwgdGhpcy54ICk7XHJcblxyXG5cdFx0aWYgKCBhbmdsZSA8IDAgKSBhbmdsZSArPSAyICogTWF0aC5QSTtcclxuXHJcblx0XHRyZXR1cm4gYW5nbGU7XHJcblxyXG5cdH1cclxuXHJcblx0YWRkU2NhbGFyICggcyApIHtcclxuXHJcblx0XHR0aGlzLnggKz0gcztcclxuXHRcdHRoaXMueSArPSBzO1xyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0bmVnYXRlICgpIHtcclxuXHJcblx0XHR0aGlzLnggKj0gLTE7XHJcblx0XHR0aGlzLnkgKj0gLTE7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRuZWcgKCkge1xyXG5cclxuXHRcdHRoaXMueCA9IC0xO1xyXG5cdFx0dGhpcy55ID0gLTE7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRpc1plcm8gKCkge1xyXG5cclxuXHRcdHJldHVybiAoIHRoaXMueCA9PT0gMCAmJiB0aGlzLnkgPT09IDAgKTtcclxuXHJcblx0fVxyXG5cclxuXHRjb3B5ICggdiApIHtcclxuXHJcblx0XHR0aGlzLnggPSB2Lng7XHJcblx0XHR0aGlzLnkgPSB2Lnk7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcblx0ZXF1YWxzICggdiApIHtcclxuXHJcblx0XHRyZXR1cm4gKCAoIHYueCA9PT0gdGhpcy54ICkgJiYgKCB2LnkgPT09IHRoaXMueSApICk7XHJcblxyXG5cdH1cclxuXHJcblx0bmVhckVxdWFscyAoIHYsIG4gKSB7XHJcblxyXG5cdFx0cmV0dXJuICggKCB2LngudG9GaXhlZChuKSA9PT0gdGhpcy54LnRvRml4ZWQobikgKSAmJiAoIHYueS50b0ZpeGVkKG4pID09PSB0aGlzLnkudG9GaXhlZChuKSApICk7XHJcblxyXG5cdH1cclxuXHJcblx0bGVycCAoIHYsIGFscGhhICkge1xyXG5cclxuXHRcdGlmKCB2ID09PSBudWxsICl7XHJcblx0XHRcdHRoaXMueCAtPSB0aGlzLnggKiBhbHBoYTtcclxuXHRcdCAgICB0aGlzLnkgLT0gdGhpcy55ICogYWxwaGE7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR0aGlzLnggKz0gKCB2LnggLSB0aGlzLnggKSAqIGFscGhhO1xyXG5cdFx0ICAgIHRoaXMueSArPSAoIHYueSAtIHRoaXMueSApICogYWxwaGE7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXM7XHJcblxyXG5cdH1cclxuXHJcbn0iLCJcclxuaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuL1Jvb3RzJztcclxuaW1wb3J0IHsgVG9vbHMgfSBmcm9tICcuL1Rvb2xzJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuL1YyJztcclxuXHJcbi8qKlxyXG4gKiBAYXV0aG9yIGx0aCAvIGh0dHBzOi8vZ2l0aHViLmNvbS9sby10aFxyXG4gKi9cclxuXHJcbmNsYXNzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICAvLyBpZiBpcyBvbiBndWkgb3IgZ3JvdXBcclxuICAgICAgICB0aGlzLm1haW4gPSBvLm1haW4gfHwgbnVsbDtcclxuICAgICAgICB0aGlzLmlzVUkgPSBvLmlzVUkgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuaXNMaXN0ZW4gPSBmYWxzZTtcclxuICAgICAgICAvL3RoaXMucGFyZW50R3JvdXAgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLm9udG9wID0gby5vbnRvcCA/IG8ub250b3AgOiBmYWxzZTsgLy8gJ2JlZm9yZWJlZ2luJyAnYWZ0ZXJiZWdpbicgJ2JlZm9yZWVuZCcgJ2FmdGVyZW5kJ1xyXG5cclxuICAgICAgICB0aGlzLmNzcyA9IHRoaXMubWFpbiA/IHRoaXMubWFpbi5jc3MgOiBUb29scy5jc3M7XHJcbiAgICAgICAgdGhpcy5jb2xvcnMgPSB0aGlzLm1haW4gPyB0aGlzLm1haW4uY29sb3JzIDogVG9vbHMuY29sb3JzO1xyXG5cclxuICAgICAgICB0aGlzLmRlZmF1bHRCb3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmJvcmRlcjtcclxuICAgICAgICB0aGlzLnN2Z3MgPSBUb29scy5zdmdzO1xyXG5cclxuICAgICAgICAvLyBvbmx5IHNwYWNlIFxyXG4gICAgICAgIHRoaXMuaXNTcGFjZSA9IG8uaXNTcGFjZSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy56b25lID0geyB4OjAsIHk6MCwgdzowLCBoOjAgfTtcclxuICAgICAgICB0aGlzLmxvY2FsID0gbmV3IFYyKCkubmVnKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaXNDYW52YXNPbmx5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZWxlY3QgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gcGVyY2VudCBvZiB0aXRsZVxyXG4gICAgICAgIHRoaXMucCA9IG8ucCAhPT0gdW5kZWZpbmVkID8gby5wIDogVG9vbHMuc2l6ZS5wO1xyXG5cclxuICAgICAgICB0aGlzLncgPSB0aGlzLmlzVUkgPyB0aGlzLm1haW4uc2l6ZS53IDogVG9vbHMuc2l6ZS53O1xyXG4gICAgICAgIGlmKCBvLncgIT09IHVuZGVmaW5lZCApIHRoaXMudyA9IG8udztcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5pc1VJID8gdGhpcy5tYWluLnNpemUuaCA6IFRvb2xzLnNpemUuaDtcclxuICAgICAgICBpZiggby5oICE9PSB1bmRlZmluZWQgKSB0aGlzLmggPSBvLmg7XHJcbiAgICAgICAgaWYoICF0aGlzLmlzU3BhY2UgKSB0aGlzLmggPSB0aGlzLmggPCAxMSA/IDExIDogdGhpcy5oO1xyXG5cclxuICAgICAgICAvLyBpZiBuZWVkIHJlc2l6ZSB3aWR0aFxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gby5hdXRvIHx8IHRydWU7XHJcblxyXG4gICAgICAgIC8vIG9wZW4gc3RhdHVcclxuICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyByYWRpdXMgZm9yIHRvb2xib3hcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IG8ucmFkaXVzIHx8IHRoaXMuY29sb3JzLnJhZGl1cztcclxuXHJcbiAgICAgICAgLy8gb25seSBmb3IgbnVtYmVyXHJcbiAgICAgICAgdGhpcy5pc051bWJlciA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubm9OZWcgPSBvLm5vTmVnIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYWxsRXF1YWwgPSBvLmFsbEVxdWFsIHx8IGZhbHNlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIG9ubHkgbW9zdCBzaW1wbGUgXHJcbiAgICAgICAgdGhpcy5tb25vID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIHN0b3AgbGlzdGVuaW5nIGZvciBlZGl0IHNsaWRlIHRleHRcclxuICAgICAgICB0aGlzLmlzRWRpdCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBubyB0aXRsZSBcclxuICAgICAgICB0aGlzLnNpbXBsZSA9IG8uc2ltcGxlIHx8IGZhbHNlO1xyXG4gICAgICAgIGlmKCB0aGlzLnNpbXBsZSApIHRoaXMuc2EgPSAwO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy8gZGVmaW5lIG9iaiBzaXplXHJcbiAgICAgICAgdGhpcy5zZXRTaXplKCB0aGlzLncgKTtcclxuXHJcbiAgICAgICAgLy8gdGl0bGUgc2l6ZVxyXG4gICAgICAgIGlmKG8uc2EgIT09IHVuZGVmaW5lZCApIHRoaXMuc2EgPSBvLnNhO1xyXG4gICAgICAgIGlmKG8uc2IgIT09IHVuZGVmaW5lZCApIHRoaXMuc2IgPSBvLnNiO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zaW1wbGUgKSB0aGlzLnNiID0gdGhpcy53IC0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgLy8gbGFzdCBudW1iZXIgc2l6ZSBmb3Igc2xpZGVcclxuICAgICAgICB0aGlzLnNjID0gby5zYyA9PT0gdW5kZWZpbmVkID8gNDcgOiBvLnNjO1xyXG5cclxuICAgICAgICAvLyBmb3IgbGlzdGVuaW5nIG9iamVjdFxyXG4gICAgICAgIHRoaXMub2JqZWN0TGluayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnZhbCA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gQmFja2dyb3VuZFxyXG4gICAgICAgIHRoaXMuYmcgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kO1xyXG4gICAgICAgIHRoaXMuYmdPdmVyID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZE92ZXI7XHJcbiAgICAgICAgaWYoIG8uYmcgIT09IHVuZGVmaW5lZCApeyB0aGlzLmJnID0gby5iZzsgdGhpcy5iZ092ZXIgPSBvLmJnOyB9XHJcbiAgICAgICAgaWYoIG8uYmdPdmVyICE9PSB1bmRlZmluZWQgKXsgdGhpcy5iZ092ZXIgPSBvLmJnT3ZlcjsgfVxyXG5cclxuICAgICAgICAvLyBGb250IENvbG9yO1xyXG4gICAgICAgIHRoaXMudGl0bGVDb2xvciA9IG8udGl0bGVDb2xvciB8fCB0aGlzLmNvbG9ycy50ZXh0O1xyXG4gICAgICAgIHRoaXMuZm9udENvbG9yID0gby5mb250Q29sb3IgfHwgdGhpcy5jb2xvcnMudGV4dDtcclxuICAgICAgICB0aGlzLmZvbnRTZWxlY3QgPSBvLmZvbnRTZWxlY3QgfHwgdGhpcy5jb2xvcnMudGV4dE92ZXI7XHJcblxyXG4gICAgICAgIGlmKCBvLmNvbG9yICE9PSB1bmRlZmluZWQgKSB0aGlzLmZvbnRDb2xvciA9IG8uY29sb3I7XHJcbiAgICAgICAgICAgIC8qeyBcclxuXHJcbiAgICAgICAgICAgIGlmKG8uY29sb3IgPT09ICduJykgby5jb2xvciA9ICcjZmYwMDAwJztcclxuXHJcbiAgICAgICAgICAgIGlmKCBvLmNvbG9yICE9PSAnbm8nICkge1xyXG4gICAgICAgICAgICAgICAgaWYoICFpc05hTihvLmNvbG9yKSApIHRoaXMuZm9udENvbG9yID0gVG9vbHMuaGV4VG9IdG1sKG8uY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLmZvbnRDb2xvciA9IG8uY29sb3I7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpdGxlQ29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9Ki9cclxuICAgICAgICBcclxuICAgICAgICAvKmlmKCBvLmNvbG9yICE9PSB1bmRlZmluZWQgKXsgXHJcbiAgICAgICAgICAgIGlmKCAhaXNOYU4oby5jb2xvcikgKSB0aGlzLmZvbnRDb2xvciA9IFRvb2xzLmhleFRvSHRtbChvLmNvbG9yKTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLmZvbnRDb2xvciA9IG8uY29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMudGl0bGVDb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgIH0qL1xyXG5cclxuICAgICAgICB0aGlzLmNvbG9yUGx1cyA9IFRvb2xzLkNvbG9yTHVtYSggdGhpcy5mb250Q29sb3IsIDAuMyApO1xyXG5cclxuICAgICAgICB0aGlzLnR4dCA9IG8ubmFtZSB8fCAnJztcclxuICAgICAgICB0aGlzLnJlbmFtZSA9IG8ucmVuYW1lIHx8ICcnO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gby50YXJnZXQgfHwgbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG8uY2FsbGJhY2sgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvLmNhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMuZW5kQ2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jYWxsYmFjayA9PT0gbnVsbCAmJiB0aGlzLmlzVUkgJiYgdGhpcy5tYWluLmNhbGxiYWNrICE9PSBudWxsICkgdGhpcy5jYWxsYmFjayA9IHRoaXMubWFpbi5jYWxsYmFjaztcclxuXHJcbiAgICAgICAgLy8gZWxlbWVudHNcclxuICAgICAgICB0aGlzLmMgPSBbXTtcclxuXHJcbiAgICAgICAgLy8gc3R5bGUgXHJcbiAgICAgICAgdGhpcy5zID0gW107XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNbMF0gPSBUb29scy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjpyZWxhdGl2ZTsgaGVpZ2h0OjIwcHg7IGZsb2F0OmxlZnQ7IG92ZXJmbG93OmhpZGRlbjsnKTtcclxuICAgICAgICB0aGlzLnNbMF0gPSB0aGlzLmNbMF0uc3R5bGU7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLnNbMF0ubWFyZ2luQm90dG9tID0gJzFweCc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gd2l0aCB0aXRsZVxyXG4gICAgICAgIGlmKCAhdGhpcy5zaW1wbGUgKXsgXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXSA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCApO1xyXG4gICAgICAgICAgICB0aGlzLnNbMV0gPSB0aGlzLmNbMV0uc3R5bGU7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS50ZXh0Q29udGVudCA9IHRoaXMucmVuYW1lID09PSAnJyA/IHRoaXMudHh0IDogdGhpcy5yZW5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXS5jb2xvciA9IHRoaXMudGl0bGVDb2xvcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBvLnBvcyApe1xyXG4gICAgICAgICAgICB0aGlzLnNbMF0ucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xyXG4gICAgICAgICAgICBmb3IobGV0IHAgaW4gby5wb3Mpe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzBdW3BdID0gby5wb3NbcF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5tb25vID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCBvLmNzcyApIHRoaXMuc1swXS5jc3NUZXh0ID0gby5jc3M7IFxyXG4gICAgICAgIFxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBtYWtlIHRoZSBub2RlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBcclxuICAgIGluaXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLnpvbmUuaCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7IC8vIHN0eWxlIGNhY2hlXHJcbiAgICAgICAgbGV0IGMgPSB0aGlzLmM7IC8vIGRpdiBjYWNoXHJcblxyXG4gICAgICAgIHNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNVSSAgKSBzWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnO1xyXG4gICAgICAgIC8vaWYoIHRoaXMuaXNTcGFjZSAgKSBzWzBdLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgIC8vaWYoIHRoaXMuYXV0b0hlaWdodCApIHNbMF0udHJhbnNpdGlvbiA9ICdoZWlnaHQgMC4wMXMgZWFzZS1vdXQnO1xyXG4gICAgICAgIGlmKCBjWzFdICE9PSB1bmRlZmluZWQgJiYgdGhpcy5hdXRvV2lkdGggKXtcclxuICAgICAgICAgICAgc1sxXSA9IGNbMV0uc3R5bGU7XHJcbiAgICAgICAgICAgIHNbMV0uaGVpZ2h0ID0gKHRoaXMuaC00KSArICdweCc7XHJcbiAgICAgICAgICAgIHNbMV0ubGluZUhlaWdodCA9ICh0aGlzLmgtOCkgKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGZyYWcgPSBUb29scy5mcmFnO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBpID0gMSwgbG5nID0gYy5sZW5ndGg7IGkgIT09IGxuZzsgaSsrICl7XHJcbiAgICAgICAgICAgIGlmKCBjW2ldICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgICAgICAgICBmcmFnLmFwcGVuZENoaWxkKCBjW2ldICk7XHJcbiAgICAgICAgICAgICAgICBzW2ldID0gY1tpXS5zdHlsZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHBwID0gdGhpcy50YXJnZXQgIT09IG51bGwgPyB0aGlzLnRhcmdldCA6ICh0aGlzLmlzVUkgPyB0aGlzLm1haW4uaW5uZXIgOiBkb2N1bWVudC5ib2R5KTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub250b3AgKSBwcC5pbnNlcnRBZGphY2VudEVsZW1lbnQoICdhZnRlcmJlZ2luJywgY1swXSApO1xyXG4gICAgICAgIGVsc2UgcHAuYXBwZW5kQ2hpbGQoIGNbMF0gKTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8qaWYoIHRoaXMudGFyZ2V0ICE9PSBudWxsICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC5hcHBlbmRDaGlsZCggY1swXSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uaW5uZXIuYXBwZW5kQ2hpbGQoIGNbMF0gKTtcclxuICAgICAgICAgICAgZWxzZSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBjWzBdICk7XHJcbiAgICAgICAgfSovXHJcblxyXG4gICAgICAgIGNbMF0uYXBwZW5kQ2hpbGQoIGZyYWcgKTtcclxuXHJcbiAgICAgICAgdGhpcy5yU2l6ZSgpO1xyXG5cclxuICAgICAgICAvLyAhIHNvbG8gcHJvdG9cclxuICAgICAgICBpZiggIXRoaXMuaXNVSSApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzBdLnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XHJcbiAgICAgICAgICAgIFJvb3RzLmFkZCggdGhpcyApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZyb20gVG9vbHNcclxuXHJcbiAgICBkb20gKCB0eXBlLCBjc3MsIG9iaiwgZG9tLCBpZCApIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFRvb2xzLmRvbSggdHlwZSwgY3NzLCBvYmosIGRvbSwgaWQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0U3ZnICggZG9tLCB0eXBlLCB2YWx1ZSwgaWQsIGlkMiApIHtcclxuXHJcbiAgICAgICAgVG9vbHMuc2V0U3ZnKCBkb20sIHR5cGUsIHZhbHVlLCBpZCwgaWQyICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldENzcyAoIGRvbSwgY3NzICkge1xyXG5cclxuICAgICAgICBUb29scy5zZXRDc3MoIGRvbSwgY3NzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsYW1wICggdmFsdWUsIG1pbiwgbWF4ICkge1xyXG5cclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xhbXAoIHZhbHVlLCBtaW4sIG1heCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2xvclJpbmcgKCkge1xyXG5cclxuICAgICAgICBpZiggIVRvb2xzLmNvbG9yUmluZyApIFRvb2xzLm1ha2VDb2xvclJpbmcoKTtcclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xvbmUoIFRvb2xzLmNvbG9yUmluZyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXRKb3lzdGljayAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICBpZiggIVRvb2xzWyAnam95c3RpY2tfJysgbW9kZWwgXSApIFRvb2xzLm1ha2VKb3lzdGljayggbW9kZWwgKTtcclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xvbmUoIFRvb2xzWyAnam95c3RpY2tfJysgbW9kZWwgXSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXRDaXJjdWxhciAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICBpZiggIVRvb2xzLmNpcmN1bGFyICkgVG9vbHMubWFrZUNpcmN1bGFyKCBtb2RlbCApO1xyXG4gICAgICAgIHJldHVybiBUb29scy5jbG9uZSggVG9vbHMuY2lyY3VsYXIgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0S25vYiAoIG1vZGVsICkge1xyXG5cclxuICAgICAgICBpZiggIVRvb2xzLmtub2IgKSBUb29scy5tYWtlS25vYiggbW9kZWwgKTtcclxuICAgICAgICByZXR1cm4gVG9vbHMuY2xvbmUoIFRvb2xzLmtub2IgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZnJvbSBSb290c1xyXG5cclxuICAgIGN1cnNvciAoIG5hbWUgKSB7XHJcblxyXG4gICAgICAgICBSb290cy5jdXJzb3IoIG5hbWUgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgXHJcblxyXG4gICAgLy8vLy8vLy8vXHJcblxyXG4gICAgdXBkYXRlICgpIHt9XHJcblxyXG4gICAgcmVzZXQgKCkge31cclxuXHJcbiAgICAvLy8vLy8vLy9cclxuXHJcbiAgICBnZXREb20gKCkge1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5jWzBdO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW91dCAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU3BhY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKHRoaXMucykgdGhpcy5zWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW92ZXIgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NwYWNlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZih0aGlzLnMpIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5iZ092ZXI7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlbmFtZSAoIHMgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCkgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gcztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0xpc3RlbiA9IFJvb3RzLmFkZExpc3RlbiggdGhpcyApO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW5pbmcgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vYmplY3RMaW5rID09PSBudWxsICkgcmV0dXJuO1xyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VuZCApIHJldHVybjtcclxuICAgICAgICBpZiggdGhpcy5pc0VkaXQgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWUoIHRoaXMub2JqZWN0TGlua1sgdGhpcy52YWwgXSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSAoIHYgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzTnVtYmVyICkgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHYgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoIHYgaW5zdGFuY2VvZiBBcnJheSAmJiB2Lmxlbmd0aCA9PT0gMSApIHYgPSB2WzBdO1xyXG4gICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IHY7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHVwZGF0ZSBldmVyeSBjaGFuZ2VcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvbkNoYW5nZSAoIGYgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU3BhY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBmIHx8IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHVwZGF0ZSBvbmx5IG9uIGVuZFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9uRmluaXNoQ2hhbmdlICggZiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTcGFjZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5lbmRDYWxsYmFjayA9IGY7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbmQgKCB2ICkge1xyXG5cclxuICAgICAgICB2ID0gdiB8fCB0aGlzLnZhbHVlO1xyXG4gICAgICAgIGlmKCB2IGluc3RhbmNlb2YgQXJyYXkgJiYgdi5sZW5ndGggPT09IDEgKSB2ID0gdlswXTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbmQgPSB0cnVlO1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdExpbmsgIT09IG51bGwgKSB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gPSB2O1xyXG4gICAgICAgIGlmKCB0aGlzLmNhbGxiYWNrICkgdGhpcy5jYWxsYmFjayggdiwgdGhpcy52YWwgKTtcclxuICAgICAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZW5kRW5kICggdiApIHtcclxuXHJcbiAgICAgICAgdiA9IHYgfHwgdGhpcy52YWx1ZTtcclxuICAgICAgICBpZiggdiBpbnN0YW5jZW9mIEFycmF5ICYmIHYubGVuZ3RoID09PSAxICkgdiA9IHZbMF07XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmVuZENhbGxiYWNrICkgdGhpcy5lbmRDYWxsYmFjayggdiApO1xyXG4gICAgICAgIGlmKCB0aGlzLm9iamVjdExpbmsgIT09IG51bGwgKSB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gPSB2O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjbGVhciBub2RlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBcclxuICAgIGNsZWFyICggbm9mdWxsICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0xpc3RlbiApIFJvb3RzLnJlbW92ZUxpc3RlbiggdGhpcyApO1xyXG5cclxuICAgICAgICBUb29scy5jbGVhciggdGhpcy5jWzBdICk7XHJcblxyXG4gICAgICAgIGlmKCAhbm9mdWxsICl7XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy50YXJnZXQgIT09IG51bGwgKXsgXHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuZ3JvdXAgIT09IG51bGwgICkgdGhpcy5ncm91cC5jbGVhck9uZSggdGhpcyApO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLnRhcmdldC5yZW1vdmVDaGlsZCggdGhpcy5jWzBdICk7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2xlYXJPbmUoIHRoaXMgKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCggdGhpcy5jWzBdICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiggIXRoaXMuaXNVSSApIFJvb3RzLnJlbW92ZSggdGhpcyApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zID0gbnVsbDtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5pc0xpc3RlbiA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBjaGFuZ2Ugc2l6ZSBcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZXRTaXplICggc3ggKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5hdXRvV2lkdGggKSByZXR1cm47XHJcblxyXG4gICAgICAgIHRoaXMudyA9IHN4O1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zaW1wbGUgKXtcclxuICAgICAgICAgICAgdGhpcy5zYiA9IHRoaXMudyAtIHRoaXMuc2E7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHBwID0gdGhpcy53ICogKCB0aGlzLnAgLyAxMDAgKTtcclxuICAgICAgICAgICAgdGhpcy5zYSA9IE1hdGguZmxvb3IoIHBwICsgMTAgKTtcclxuICAgICAgICAgICAgdGhpcy5zYiA9IE1hdGguZmxvb3IoIHRoaXMudyAtIHBwIC0gMjAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmF1dG9XaWR0aCApIHJldHVybjtcclxuICAgICAgICB0aGlzLnNbMF0ud2lkdGggPSB0aGlzLncgKyAncHgnO1xyXG4gICAgICAgIGlmKCAhdGhpcy5zaW1wbGUgKSB0aGlzLnNbMV0ud2lkdGggPSB0aGlzLnNhICsgJ3B4JztcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIGZvciBudW1lcmljIHZhbHVlXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0VHlwZU51bWJlciAoIG8gKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNOdW1iZXIgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gMDtcclxuICAgICAgICBpZihvLnZhbHVlICE9PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICBpZiggdHlwZW9mIG8udmFsdWUgPT09ICdzdHJpbmcnICkgdGhpcy52YWx1ZSA9IG8udmFsdWUgKiAxO1xyXG4gICAgICAgICAgICBlbHNlIHRoaXMudmFsdWUgPSBvLnZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5taW4gPSBvLm1pbiA9PT0gdW5kZWZpbmVkID8gLUluZmluaXR5IDogby5taW47XHJcbiAgICAgICAgdGhpcy5tYXggPSBvLm1heCA9PT0gdW5kZWZpbmVkID8gIEluZmluaXR5IDogby5tYXg7XHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiA9PT0gdW5kZWZpbmVkID8gMiA6IG8ucHJlY2lzaW9uO1xyXG5cclxuICAgICAgICBsZXQgcztcclxuXHJcbiAgICAgICAgc3dpdGNoKHRoaXMucHJlY2lzaW9uKXtcclxuICAgICAgICAgICAgY2FzZSAwOiBzID0gMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogcyA9IDAuMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogcyA9IDAuMDE7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6IHMgPSAwLjAwMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDogcyA9IDAuMDAwMTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTogcyA9IDAuMDAwMDE7IGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zdGVwID0gby5zdGVwID09PSB1bmRlZmluZWQgPyAgcyA6IG8uc3RlcDtcclxuICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5tYXggLSB0aGlzLm1pbjtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggdGhpcy52YWx1ZSApO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG51bVZhbHVlICggbiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMubm9OZWcgKSBuID0gTWF0aC5hYnMoIG4gKTtcclxuICAgICAgICByZXR1cm4gTWF0aC5taW4oIHRoaXMubWF4LCBNYXRoLm1heCggdGhpcy5taW4sIG4gKSApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFMgREVGQVVMVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50ICggZSApe1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NwYWNlICkgcmV0dXJuO1xyXG4gICAgICAgIHJldHVybiB0aGlzW2UudHlwZV0oZSk7XHJcbiAgICBcclxuICAgIH1cclxuXHJcbiAgICB3aGVlbCAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICBrZXlkb3duICggZSApIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgY2xpY2sgKCBlICkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICBrZXl1cCAoIGUgKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyBvYmplY3QgcmVmZXJlbmN5XHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2V0UmVmZXJlbmN5ICggb2JqLCB2YWwgKSB7XHJcblxyXG4gICAgICAgIHRoaXMub2JqZWN0TGluayA9IG9iajtcclxuICAgICAgICB0aGlzLnZhbCA9IHZhbDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZGlzcGxheSAoIHYgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdiA9IHYgfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zWzBdLmRpc3BsYXkgPSB2ID8gJ2Jsb2NrJyA6ICdub25lJztcclxuICAgICAgICAvL3RoaXMuaXNSZWFkeSA9IHYgPyBmYWxzZSA6IHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHJlc2l6ZSBoZWlnaHQgXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgb3BlbiAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHJldHVybjtcclxuICAgICAgICB0aGlzLmlzT3BlbiA9IHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHJldHVybjtcclxuICAgICAgICB0aGlzLmlzT3BlbiA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBuZWVkWm9uZSAoKSB7XHJcblxyXG4gICAgICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXpvbmUgKCkge1xyXG5cclxuICAgICAgICBSb290cy5uZWVkUmVab25lID0gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gIElOUFVUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2VsZWN0ICgpIHtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHVuc2VsZWN0ICgpIHtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0SW5wdXQgKCBJbnB1dCApIHtcclxuICAgICAgICBcclxuICAgICAgICBSb290cy5zZXRJbnB1dCggSW5wdXQsIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBJbnB1dCAoIHgsIGRvd24gKSB7XHJcblxyXG4gICAgICAgIHJldHVybiBSb290cy51cElucHV0KCB4LCBkb3duICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIHNwZWNpYWwgaXRlbSBcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzZWxlY3RlZCAoIGIgKXtcclxuXHJcbiAgICAgICAgdGhpcy5pc1NlbGVjdCA9IGIgfHwgZmFsc2U7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5leHBvcnQgeyBQcm90byB9OyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgQm9vbCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLmluaCA9IG8uaW5oIHx8IE1hdGguZmxvb3IoIHRoaXMuaCowLjggKTtcclxuICAgICAgICB0aGlzLmludyA9IG8uaW53IHx8IDM2O1xyXG5cclxuICAgICAgICBsZXQgdCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktKCh0aGlzLmluaC0yKSowLjUpO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2JhY2tncm91bmQ6JysgdGhpcy5jb2xvcnMuYm9vbGJnICsnOyBoZWlnaHQ6JysodGhpcy5pbmgtMikrJ3B4OyB3aWR0aDonK3RoaXMuaW53KydweDsgdG9wOicrdCsncHg7IGJvcmRlci1yYWRpdXM6MTBweDsgYm9yZGVyOjJweCBzb2xpZCAnK3RoaXMuYm9vbGJnICk7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICdoZWlnaHQ6JysodGhpcy5pbmgtNikrJ3B4OyB3aWR0aDoxNnB4OyB0b3A6JysodCsyKSsncHg7IGJvcmRlci1yYWRpdXM6MTBweDsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsnICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWUgPyBmYWxzZSA6IHRydWU7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHVwZGF0ZSAoKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBpZiggdGhpcy52YWx1ZSApe1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgc1syXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYm9vbG9uO1xyXG4gICAgICAgICAgICBzWzJdLmJvcmRlckNvbG9yID0gdGhpcy5jb2xvcnMuYm9vbG9uO1xyXG4gICAgICAgICAgICBzWzNdLm1hcmdpbkxlZnQgPSAnMTdweCc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBzWzJdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5ib29sYmc7XHJcbiAgICAgICAgICAgIHNbMl0uYm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5ib29sYmc7XHJcbiAgICAgICAgICAgIHNbM10ubWFyZ2luTGVmdCA9ICcycHgnO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgdyA9ICh0aGlzLncgLSAxMCApIC0gdGhpcy5pbnc7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gdyArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gdyArICdweCc7XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEJ1dHRvbiBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gby52YWx1ZSB8fCB0aGlzLnR4dDtcclxuXHJcbiAgICAgICAgdGhpcy5vbk5hbWUgPSBvLm9uTmFtZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5vbiA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIHRoaXMudmFsdWVzID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWVzID0gWyB0aGlzLnZhbHVlcyBdO1xyXG5cclxuICAgICAgICAvL3RoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNMaW5rID0gby5saW5rIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBjdXN0b20gY29sb3JcclxuICAgICAgICB0aGlzLmNjID0gWyB0aGlzLmNvbG9ycy5idXR0b24sIHRoaXMuY29sb3JzLnNlbGVjdCwgdGhpcy5jb2xvcnMuZG93biBdO1xyXG5cclxuICAgICAgICBpZiggby5jQmcgIT09IHVuZGVmaW5lZCApIHRoaXMuY2NbMF0gPSBvLmNCZztcclxuICAgICAgICBpZiggby5iQ29sb3IgIT09IHVuZGVmaW5lZCApIHRoaXMuY2NbMF0gPSBvLmJDb2xvcjtcclxuICAgICAgICBpZiggby5jU2VsZWN0ICE9PSB1bmRlZmluZWQgKSB0aGlzLmNjWzFdID0gby5jU2VsZWN0O1xyXG4gICAgICAgIGlmKCBvLmNEb3duICE9PSB1bmRlZmluZWQgKSB0aGlzLmNjWzJdID0gby5jRG93bjtcclxuXHJcbiAgICAgICAgdGhpcy5pc0xvYWRCdXR0b24gPSBvLmxvYWRlciB8fCBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzRHJhZ0J1dHRvbiA9IG8uZHJhZyB8fCBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0RyYWdCdXR0b24gKSB0aGlzLmlzTG9hZEJ1dHRvbiA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMubG5nID0gdGhpcy52YWx1ZXMubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMudG1wID0gW107XHJcbiAgICAgICAgdGhpcy5zdGF0ID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jW2krMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArIHRoaXMuY3NzLmJ1dHRvbiArICd0b3A6MXB4OyBiYWNrZ3JvdW5kOicrdGhpcy5jY1swXSsnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOicrdGhpcy5jb2xvcnMuYnV0dG9uQm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5zdHlsZS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5pbm5lckhUTUwgPSB0aGlzLnZhbHVlc1tpXTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0W2ldID0gMTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSAnJztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNMb2FkQnV0dG9uICkgdGhpcy5pbml0TG9hZGVyKCk7XHJcbiAgICAgICAgaWYoIHRoaXMuaXNEcmFnQnV0dG9uICl7IFxyXG4gICAgICAgICAgICB0aGlzLmxuZyArKztcclxuICAgICAgICAgICAgdGhpcy5pbml0RHJhZ2VyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgb25PZmYgKCApe1xyXG5cclxuICAgICAgICB0aGlzLm9uID0gIXRoaXMub247XHJcbiAgICAgICAgdGhpcy5jWzJdLmlubmVySFRNTCA9IHRoaXMub24gPyB0aGlzLm9uTmFtZSA6IHRoaXMudmFsdWVzWzBdO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIGxldCB0ID0gdGhpcy50bXA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgIFx0aWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGkrMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJ1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGNsaWNrICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub25OYW1lIT09ICcnICkgdGhpcy5vbk9mZigpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0xpbmsgKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG4gICAgICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbbmFtZS0yXVxyXG4gICAgICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzTGluayApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG5cclxuICAgICAgICBpZiggIW5hbWUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzW25hbWUtMl1cclxuICAgICAgICBpZiggIXRoaXMuaXNMb2FkQnV0dG9uICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgLy9lbHNlIHRoaXMuZmlsZVNlbGVjdCggZS50YXJnZXQuZmlsZXNbMF0gKTtcclxuICAgIFx0cmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiBcclxuICAgICAgICAvLyB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgdXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgLy8gY29uc29sZS5sb2cobmFtZSlcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgIT09ICcnICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgbmFtZSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHR1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codXApXHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGVzICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PT0gbmFtZS0yICkgdiA9IHRoaXMubW9kZSggbiwgaSsyICk7XHJcbiAgICAgICAgICAgIGVsc2UgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcblxyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIG1vZGUgKCBuLCBuYW1lICkge1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBpID0gbmFtZSAtIDI7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXRbaV0gIT09IG4gKXtcclxuICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnN0YXRbaV0gPSAxOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuY2NbMF07IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXRbaV0gPSAyOyB0aGlzLnNbIGkrMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIGkrMiBdLmJhY2tncm91bmQgPSB0aGlzLmNjWzFdOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0W2ldID0gMzsgdGhpcy5zWyBpKzIgXS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5jY1syXTsgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIC8qbGV0IHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcbiAgICAgICAgICAgIHYgPSB0aGlzLm1vZGUoIDEsIGkrMiApO1xyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZXMoIDEgLCAyICk7XHJcblxyXG4gICAgXHQvKmlmKCB0aGlzLnNlbGVjdGVkICl7XHJcbiAgICBcdFx0dGhpcy5zWyB0aGlzLnNlbGVjdGVkIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5zWyB0aGlzLnNlbGVjdGVkIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBcdH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7Ki9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGRyYWdvdmVyICggZSApIHtcclxuXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNbNF0uYm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgdGhpcy5zWzRdLmNvbG9yID0gdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkcmFnZW5kICggZSApIHtcclxuXHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnNbNF0uYm9yZGVyQ29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICB0aGlzLnNbNF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZHJvcCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmFnZW5kKGUpO1xyXG4gICAgICAgIHRoaXMuZmlsZVNlbGVjdCggZS5kYXRhVHJhbnNmZXIuZmlsZXNbMF0gKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaW5pdERyYWdlciAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsnIHRleHQtYWxpZ246Y2VudGVyOyBsaW5lLWhlaWdodDonKyh0aGlzLmgtOCkrJ3B4OyBib3JkZXI6MXB4IGRhc2hlZCAnK3RoaXMuZm9udENvbG9yKyc7IHRvcDoycHg7ICBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsgcG9pbnRlci1ldmVudHM6YXV0bzsnICk7Ly8gY3Vyc29yOmRlZmF1bHQ7XHJcbiAgICAgICAgdGhpcy5jWzRdLnRleHRDb250ZW50ID0gJ0RSQUcnO1xyXG5cclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSl7IHRoaXMuZHJhZ292ZXIoZSk7IH0uYmluZCh0aGlzKSwgZmFsc2UgKTtcclxuICAgICAgICB0aGlzLmNbNF0uYWRkRXZlbnRMaXN0ZW5lciggJ2RyYWdlbmQnLCBmdW5jdGlvbihlKXsgdGhpcy5kcmFnZW5kKGUpOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcbiAgICAgICAgdGhpcy5jWzRdLmFkZEV2ZW50TGlzdGVuZXIoICdkcmFnbGVhdmUnLCBmdW5jdGlvbihlKXsgdGhpcy5kcmFnZW5kKGUpOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcbiAgICAgICAgdGhpcy5jWzRdLmFkZEV2ZW50TGlzdGVuZXIoICdkcm9wJywgZnVuY3Rpb24oZSl7IHRoaXMuZHJvcChlKTsgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAvL3RoaXMuY1syXS5ldmVudHMgPSBbICBdO1xyXG4gICAgICAgIC8vdGhpcy5jWzRdLmV2ZW50cyA9IFsgJ2RyYWdvdmVyJywgJ2RyYWdlbmQnLCAnZHJhZ2xlYXZlJywgJ2Ryb3AnIF07XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBpbml0TG9hZGVyICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdpbnB1dCcsIHRoaXMuY3NzLmJhc2ljICsndG9wOjBweDsgb3BhY2l0eTowOyBoZWlnaHQ6JysodGhpcy5oKSsncHg7IHBvaW50ZXItZXZlbnRzOmF1dG87IGN1cnNvcjpwb2ludGVyOycgKTsvL1xyXG4gICAgICAgIHRoaXMuY1szXS5uYW1lID0gJ2xvYWRlcic7XHJcbiAgICAgICAgdGhpcy5jWzNdLnR5cGUgPSBcImZpbGVcIjtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdLmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCBmdW5jdGlvbihlKXsgdGhpcy5maWxlU2VsZWN0KCBlLnRhcmdldC5maWxlc1swXSApOyB9LmJpbmQodGhpcyksIGZhbHNlICk7XHJcbiAgICAgICAgLy90aGlzLmNbM10uYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpeyAgfS5iaW5kKHRoaXMpLCBmYWxzZSApO1xyXG5cclxuICAgICAgICAvL3RoaXMuY1syXS5ldmVudHMgPSBbICBdO1xyXG4gICAgICAgIC8vdGhpcy5jWzNdLmV2ZW50cyA9IFsgJ2NoYW5nZScsICdtb3VzZW92ZXInLCAnbW91c2Vkb3duJywgJ21vdXNldXAnLCAnbW91c2VvdXQnIF07XHJcblxyXG4gICAgICAgIC8vdGhpcy5oaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZmlsZVNlbGVjdCAoIGZpbGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBkYXRhVXJsID0gWyAncG5nJywgJ2pwZycsICdtcDQnLCAnd2VibScsICdvZ2cnIF07XHJcbiAgICAgICAgbGV0IGRhdGFCdWYgPSBbICdzZWEnLCAneicsICdoZXgnLCAnYnZoJywgJ0JWSCcsICdnbGInIF07XHJcblxyXG4gICAgICAgIC8vaWYoICEgZS50YXJnZXQuZmlsZXMgKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vbGV0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXTtcclxuICAgICAgIFxyXG4gICAgICAgIC8vdGhpcy5jWzNdLnR5cGUgPSBcIm51bGxcIjtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyggdGhpcy5jWzRdIClcclxuXHJcbiAgICAgICAgaWYoIGZpbGUgPT09IHVuZGVmaW5lZCApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XHJcbiAgICAgICAgbGV0IGZuYW1lID0gZmlsZS5uYW1lO1xyXG4gICAgICAgIGxldCB0eXBlID0gZm5hbWUuc3Vic3RyaW5nKGZuYW1lLmxhc3RJbmRleE9mKCcuJykrMSwgZm5hbWUubGVuZ3RoICk7XHJcblxyXG4gICAgICAgIGlmKCBkYXRhVXJsLmluZGV4T2YoIHR5cGUgKSAhPT0gLTEgKSByZWFkZXIucmVhZEFzRGF0YVVSTCggZmlsZSApO1xyXG4gICAgICAgIGVsc2UgaWYoIGRhdGFCdWYuaW5kZXhPZiggdHlwZSApICE9PSAtMSApIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlciggZmlsZSApOy8vcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlICk7XHJcbiAgICAgICAgZWxzZSByZWFkZXIucmVhZEFzVGV4dCggZmlsZSApO1xyXG5cclxuICAgICAgICAvLyBpZiggdHlwZSA9PT0gJ3BuZycgfHwgdHlwZSA9PT0gJ2pwZycgfHwgdHlwZSA9PT0gJ21wNCcgfHwgdHlwZSA9PT0gJ3dlYm0nIHx8IHR5cGUgPT09ICdvZ2cnICkgcmVhZGVyLnJlYWRBc0RhdGFVUkwoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoIHR5cGUgPT09ICd6JyApIHJlYWRlci5yZWFkQXNCaW5hcnlTdHJpbmcoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgaWYoIHR5cGUgPT09ICdzZWEnIHx8IHR5cGUgPT09ICdidmgnIHx8IHR5cGUgPT09ICdCVkgnIHx8IHR5cGUgPT09ICd6JykgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKCBmaWxlICk7XHJcbiAgICAgICAgLy9lbHNlIGlmKCAgKSByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoIGZpbGUgKTtcclxuICAgICAgICAvL2Vsc2UgcmVhZGVyLnJlYWRBc1RleHQoIGZpbGUgKTtcclxuXHJcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiggdGhpcy5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2soIGUudGFyZ2V0LnJlc3VsdCwgZm5hbWUsIHR5cGUgKTtcclxuICAgICAgICAgICAgLy90aGlzLmNbM10udHlwZSA9IFwiZmlsZVwiO1xyXG4gICAgICAgICAgICAvL3RoaXMuc2VuZCggZS50YXJnZXQucmVzdWx0ICk7IFxyXG4gICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGFiZWwgKCBzdHJpbmcsIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5jW25dLnRleHRDb250ZW50ID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpY29uICggc3RyaW5nLCB5LCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuc1tuXS5wYWRkaW5nID0gKCB5IHx8IDAgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5jW25dLmlubmVySFRNTCA9IHN0cmluZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgdyA9IHRoaXMuc2I7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLnNhO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG4gICAgICAgIGxldCBkYyA9ICAzO1xyXG4gICAgICAgIGxldCBzaXplID0gTWF0aC5mbG9vciggKCB3LShkYyooaS0xKSkgKSAvIGkgKTtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG5cclxuICAgICAgICBcdHRoaXMudG1wW2ldID0gWyBNYXRoLmZsb29yKCBkICsgKCBzaXplICogaSApICsgKCBkYyAqIGkgKSksIHNpemUgXTtcclxuICAgICAgICBcdHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXTtcclxuXHJcbiAgICAgICAgICAgIHNbaSsyXS5sZWZ0ID0gdGhpcy50bXBbaV1bMF0gKyAncHgnO1xyXG4gICAgICAgICAgICBzW2krMl0ud2lkdGggPSB0aGlzLnRtcFtpXVsxXSArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEcmFnQnV0dG9uICl7IFxyXG4gICAgICAgICAgICBzWzRdLmxlZnQgPSAoZCtzaXplK2RjKSArICdweCc7XHJcbiAgICAgICAgICAgIHNbNF0ud2lkdGggPSBzaXplICsgJ3B4JztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzTG9hZEJ1dHRvbiApe1xyXG4gICAgICAgICAgICBzWzNdLmxlZnQgPSBkICsgJ3B4JztcclxuICAgICAgICAgICAgc1szXS53aWR0aCA9IHNpemUgKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuaW1wb3J0IHsgVjIgfSBmcm9tICcuLi9jb3JlL1YyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBDaXJjdWxhciBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSB0aGlzLncgKiAwLjU7Ly9NYXRoLmZsb29yKCh0aGlzLnctMjApKjAuNSk7XHJcblxyXG4gICAgICAgIHRoaXMudHdvUGkgPSBNYXRoLlBJICogMjtcclxuICAgICAgICB0aGlzLnBpOTAgPSBNYXRoLlBJICogMC41O1xyXG5cclxuICAgICAgICB0aGlzLm9mZnNldCA9IG5ldyBWMigpO1xyXG5cclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgdGhpcy53ICsgMTA7XHJcbiAgICAgICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOmNlbnRlcjsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyB3aWR0aDonK3RoaXMudysncHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5nZXRDaXJjdWxhcigpO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMubWFrZVBhdGgoKSwgMSApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmZvbnRDb2xvciwgMSApO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLncrJyAnK3RoaXMudyApO1xyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCB0aGlzLmNbM10sIHsgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy53LCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNtb2RlID09PSBtb2RlICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBzd2l0Y2goIG1vZGUgKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuMSknLCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmZvbnRDb2xvciwgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmNvbG9yUGx1cztcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCdyZ2JhKDAsMCwwLDAuMyknLCAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmNvbG9yUGx1cywgMSApO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSBtb2RlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIFxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2VuZEVuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoMCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgdGhpcy5vbGRyID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIC8vdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNEb3duICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgb2ZmID0gdGhpcy5vZmZzZXQ7XHJcblxyXG4gICAgICAgIG9mZi54ID0gdGhpcy5yYWRpdXMgLSAoZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICBvZmYueSA9IHRoaXMucmFkaXVzIC0gKGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3AgKTtcclxuXHJcbiAgICAgICAgdGhpcy5yID0gb2ZmLmFuZ2xlKCkgLSB0aGlzLnBpOTA7XHJcbiAgICAgICAgdGhpcy5yID0gKCgodGhpcy5yJXRoaXMudHdvUGkpK3RoaXMudHdvUGkpJXRoaXMudHdvUGkpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5vbGRyICE9PSBudWxsICl7IFxyXG5cclxuICAgICAgICAgICAgdmFyIGRpZiA9IHRoaXMuciAtIHRoaXMub2xkcjtcclxuICAgICAgICAgICAgdGhpcy5yID0gTWF0aC5hYnMoZGlmKSA+IE1hdGguUEkgPyB0aGlzLm9sZHIgOiB0aGlzLnI7XHJcblxyXG4gICAgICAgICAgICBpZiggZGlmID4gNiApIHRoaXMuciA9IDA7XHJcbiAgICAgICAgICAgIGlmKCBkaWYgPCAtNiApIHRoaXMuciA9IHRoaXMudHdvUGk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHN0ZXBzID0gMSAvIHRoaXMudHdvUGk7XHJcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5yICogc3RlcHM7XHJcblxyXG4gICAgICAgIHZhciBuID0gKCAoIHRoaXMucmFuZ2UgKiB2YWx1ZSApICsgdGhpcy5taW4gKSAtIHRoaXMub2xkO1xyXG5cclxuICAgICAgICBpZihuID49IHRoaXMuc3RlcCB8fCBuIDw9IHRoaXMuc3RlcCl7IFxyXG4gICAgICAgICAgICBuID0gfn4gKCBuIC8gdGhpcy5zdGVwICk7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB0aGlzLm9sZCArICggbiAqIHRoaXMuc3RlcCApICk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5vbGRyID0gdGhpcy5yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1ha2VQYXRoICgpIHtcclxuXHJcbiAgICAgICAgdmFyIHIgPSA0MDtcclxuICAgICAgICB2YXIgZCA9IDI0O1xyXG4gICAgICAgIHZhciBhID0gdGhpcy5wZXJjZW50ICogdGhpcy50d29QaSAtIDAuMDAxO1xyXG4gICAgICAgIHZhciB4MiA9IChyICsgciAqIE1hdGguc2luKGEpKSArIGQ7XHJcbiAgICAgICAgdmFyIHkyID0gKHIgLSByICogTWF0aC5jb3MoYSkpICsgZDtcclxuICAgICAgICB2YXIgYmlnID0gYSA+IE1hdGguUEkgPyAxIDogMDtcclxuICAgICAgICByZXR1cm4gXCJNIFwiICsgKHIrZCkgKyBcIixcIiArIGQgKyBcIiBBIFwiICsgciArIFwiLFwiICsgciArIFwiIDAgXCIgKyBiaWcgKyBcIiAxIFwiICsgeDIgKyBcIixcIiArIHkyO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAoIHRoaXMudmFsdWUgLSB0aGlzLm1pbiApIC8gdGhpcy5yYW5nZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLm1ha2VQYXRoKCksIDEgKTtcclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBUb29scyB9IGZyb20gJy4uL2NvcmUvVG9vbHMnO1xyXG5pbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBWMiB9IGZyb20gJy4uL2NvcmUvVjInO1xyXG5cclxuZXhwb3J0IGNsYXNzIENvbG9yIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG5cdCAgICAvL3RoaXMuYXV0b0hlaWdodCA9IHRydWU7XHJcblxyXG5cdCAgICB0aGlzLmN0eXBlID0gby5jdHlwZSB8fCAnaGV4JztcclxuXHJcblx0ICAgIHRoaXMud2ZpeGUgPSAyNTY7XHJcblxyXG5cdCAgICB0aGlzLmN3ID0gdGhpcy5zYiA+IDI1NiA/IDI1NiA6IHRoaXMuc2I7XHJcblx0ICAgIGlmKG8uY3cgIT0gdW5kZWZpbmVkICkgdGhpcy5jdyA9IG8uY3c7XHJcblxyXG5cdCAgICAvLyBjb2xvciB1cCBvciBkb3duXHJcblx0ICAgIHRoaXMuc2lkZSA9IG8uc2lkZSB8fCAnZG93bic7XHJcblx0ICAgIHRoaXMudXAgPSB0aGlzLnNpZGUgPT09ICdkb3duJyA/IDAgOiAxO1xyXG5cdCAgICBcclxuXHQgICAgdGhpcy5iYXNlSCA9IHRoaXMuaDtcclxuXHJcblx0ICAgIHRoaXMub2Zmc2V0ID0gbmV3IFYyKCk7XHJcblx0ICAgIHRoaXMuZGVjYWwgPSBuZXcgVjIoKTtcclxuXHQgICAgdGhpcy5wcCA9IG5ldyBWMigpO1xyXG5cclxuXHQgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAnaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7JyArICdib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLmgtOCkrJ3B4OycgKTtcclxuXHQgICAgdGhpcy5zWzJdID0gdGhpcy5jWzJdLnN0eWxlO1xyXG5cclxuXHQgICAgaWYoIHRoaXMudXAgKXtcclxuXHQgICAgICAgIHRoaXMuc1syXS50b3AgPSAnYXV0byc7XHJcblx0ICAgICAgICB0aGlzLnNbMl0uYm90dG9tID0gJzJweCc7XHJcblx0ICAgIH1cclxuXHJcblx0ICAgIHRoaXMuY1szXSA9IHRoaXMuZ2V0Q29sb3JSaW5nKCk7XHJcblx0ICAgIHRoaXMuY1szXS5zdHlsZS52aXNpYmlsaXR5ICA9ICdoaWRkZW4nO1xyXG5cclxuXHQgICAgdGhpcy5oc2wgPSBudWxsO1xyXG5cdCAgICB0aGlzLnZhbHVlID0gJyNmZmZmZmYnO1xyXG5cdCAgICBpZiggby52YWx1ZSAhPT0gdW5kZWZpbmVkICl7XHJcblx0ICAgICAgICBpZiggby52YWx1ZSBpbnN0YW5jZW9mIEFycmF5ICkgdGhpcy52YWx1ZSA9IFRvb2xzLnJnYlRvSGV4KCBvLnZhbHVlICk7XHJcblx0ICAgICAgICBlbHNlIGlmKCFpc05hTihvLnZhbHVlKSkgdGhpcy52YWx1ZSA9IFRvb2xzLmhleFRvSHRtbCggby52YWx1ZSApO1xyXG5cdCAgICAgICAgZWxzZSB0aGlzLnZhbHVlID0gby52YWx1ZTtcclxuXHQgICAgfVxyXG5cclxuXHQgICAgdGhpcy5iY29sb3IgPSBudWxsO1xyXG5cdCAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cdCAgICB0aGlzLmZpc3REb3duID0gZmFsc2U7XHJcblxyXG5cdCAgICB0aGlzLnRyID0gOTg7XHJcblx0ICAgIHRoaXMudHNsID0gTWF0aC5zcXJ0KDMpICogdGhpcy50cjtcclxuXHJcblx0ICAgIHRoaXMuaHVlID0gMDtcclxuXHQgICAgdGhpcy5kID0gMjU2O1xyXG5cclxuXHQgICAgdGhpcy5zZXRDb2xvciggdGhpcy52YWx1ZSApO1xyXG5cclxuXHQgICAgdGhpcy5pbml0KCk7XHJcblxyXG5cdCAgICBpZiggby5vcGVuICE9PSB1bmRlZmluZWQgKSB0aGlzLm9wZW4oKTtcclxuXHJcblx0fVxyXG5cclxuXHR0ZXN0Wm9uZSAoIG14LCBteSApIHtcclxuXHJcblx0XHRsZXQgbCA9IHRoaXMubG9jYWw7XHJcblx0XHRpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuXHJcblxyXG5cdFx0aWYoIHRoaXMudXAgJiYgdGhpcy5pc09wZW4gKXtcclxuXHJcblx0XHRcdGlmKCBsLnkgPiB0aGlzLndmaXhlICkgcmV0dXJuICd0aXRsZSc7XHJcblx0XHQgICAgZWxzZSByZXR1cm4gJ2NvbG9yJztcclxuXHJcblx0XHR9IGVsc2Uge1xyXG5cclxuXHRcdFx0aWYoIGwueSA8IHRoaXMuYmFzZUgrMiApIHJldHVybiAndGl0bGUnO1xyXG5cdCAgICBcdGVsc2UgaWYoIHRoaXMuaXNPcGVuICkgcmV0dXJuICdjb2xvcic7XHJcblxyXG5cclxuXHRcdH1cclxuXHJcbiAgICB9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cdG1vdXNldXAgKCBlICkge1xyXG5cclxuXHQgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHQgICAgdGhpcy5kID0gMjU2O1xyXG5cclxuXHR9XHJcblxyXG5cdG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG5cclxuXHRcdGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZS5jbGllbnRYLCBlLmNsaWVudFkgKTtcclxuXHJcblxyXG5cdFx0Ly9pZiggIW5hbWUgKSByZXR1cm47XHJcblx0XHRpZihuYW1lID09PSAndGl0bGUnKXtcclxuXHRcdFx0aWYoICF0aGlzLmlzT3BlbiApIHRoaXMub3BlbigpO1xyXG5cdCAgICAgICAgZWxzZSB0aGlzLmNsb3NlKCk7XHJcblx0ICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHRcdH1cclxuXHJcblxyXG5cdFx0aWYoIG5hbWUgPT09ICdjb2xvcicgKXtcclxuXHJcblx0XHRcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHRcdFx0dGhpcy5maXN0RG93biA9IHRydWVcclxuXHRcdFx0dGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG5cdCAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUuY2xpZW50WCwgZS5jbGllbnRZICk7XHJcblxyXG5cdCAgICBsZXQgb2ZmLCBkLCBodWUsIHNhdCwgbHVtLCByYWQsIHgsIHksIHJyLCBUID0gVG9vbHM7XHJcblxyXG5cdCAgICBpZiggbmFtZSA9PT0gJ3RpdGxlJyApIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG5cdCAgICBpZiggbmFtZSA9PT0gJ2NvbG9yJyApe1xyXG5cclxuXHQgICAgXHRvZmYgPSB0aGlzLm9mZnNldDtcclxuXHRcdCAgICBvZmYueCA9IGUuY2xpZW50WCAtICggdGhpcy56b25lLnggKyB0aGlzLmRlY2FsLnggKyB0aGlzLm1pZCApO1xyXG5cdFx0ICAgIG9mZi55ID0gZS5jbGllbnRZIC0gKCB0aGlzLnpvbmUueSArIHRoaXMuZGVjYWwueSArIHRoaXMubWlkICk7XHJcblx0XHRcdGQgPSBvZmYubGVuZ3RoKCkgKiB0aGlzLnJhdGlvO1xyXG5cdFx0XHRyciA9IG9mZi5hbmdsZSgpO1xyXG5cdFx0XHRpZihyciA8IDApIHJyICs9IDIgKiBULlBJO1xyXG5cdFx0XHRcdFx0XHRcclxuXHJcblx0ICAgIFx0aWYgKCBkIDwgMTI4ICkgdGhpcy5jdXJzb3IoJ2Nyb3NzaGFpcicpO1xyXG5cdCAgICBcdGVsc2UgaWYoICF0aGlzLmlzRG93biApIHRoaXMuY3Vyc29yKClcclxuXHJcblx0ICAgIFx0aWYoIHRoaXMuaXNEb3duICl7XHJcblxyXG5cdFx0XHQgICAgaWYoIHRoaXMuZmlzdERvd24gKXtcclxuXHRcdFx0ICAgIFx0dGhpcy5kID0gZDtcclxuXHRcdFx0ICAgIFx0dGhpcy5maXN0RG93biA9IGZhbHNlO1xyXG5cdFx0XHQgICAgfVxyXG5cclxuXHRcdFx0ICAgIGlmICggdGhpcy5kIDwgMTI4ICkge1xyXG5cclxuXHRcdFx0XHQgICAgaWYgKCB0aGlzLmQgPiB0aGlzLnRyICkgeyAvLyBvdXRzaWRlIGh1ZVxyXG5cclxuXHRcdFx0XHQgICAgICAgIGh1ZSA9ICggcnIgKyBULnBpOTAgKSAvIFQuVHdvUEk7XHJcblx0XHRcdFx0ICAgICAgICB0aGlzLmh1ZSA9IChodWUgKyAxKSAlIDE7XHJcblx0XHRcdFx0ICAgICAgICB0aGlzLnNldEhTTChbKGh1ZSArIDEpICUgMSwgdGhpcy5oc2xbMV0sIHRoaXMuaHNsWzJdXSk7XHJcblxyXG5cdFx0XHRcdCAgICB9IGVsc2UgeyAvLyB0cmlhbmdsZVxyXG5cclxuXHRcdFx0XHQgICAgXHR4ID0gb2ZmLnggKiB0aGlzLnJhdGlvO1xyXG5cdFx0XHRcdCAgICBcdHkgPSBvZmYueSAqIHRoaXMucmF0aW87XHJcblxyXG5cdFx0XHRcdCAgICBcdGxldCByciA9ICh0aGlzLmh1ZSAqIFQuVHdvUEkpICsgVC5QSTtcclxuXHRcdFx0XHQgICAgXHRpZihyciA8IDApIHJyICs9IDIgKiBULlBJO1xyXG5cclxuXHRcdFx0XHQgICAgXHRyYWQgPSBNYXRoLmF0YW4yKC15LCB4KTtcclxuXHRcdFx0XHQgICAgXHRpZihyYWQgPCAwKSByYWQgKz0gMiAqIFQuUEk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdCAgICBcdGxldCByYWQwID0gKCByYWQgKyBULnBpOTAgKyBULlR3b1BJICsgcnIgKSAlIChULlR3b1BJKSxcclxuXHRcdFx0XHQgICAgXHRyYWQxID0gcmFkMCAlICgoMi8zKSAqIFQuUEkpIC0gKFQucGk2MCksXHJcblx0XHRcdFx0ICAgIFx0YSAgICA9IDAuNSAqIHRoaXMudHIsXHJcblx0XHRcdFx0ICAgIFx0YiAgICA9IE1hdGgudGFuKHJhZDEpICogYSxcclxuXHRcdFx0XHQgICAgXHRyICAgID0gTWF0aC5zcXJ0KHgqeCArIHkqeSksXHJcblx0XHRcdFx0ICAgIFx0bWF4UiA9IE1hdGguc3FydChhKmEgKyBiKmIpO1xyXG5cclxuXHRcdFx0XHQgICAgXHRpZiggciA+IG1heFIgKSB7XHJcblx0XHRcdFx0XHRcdFx0bGV0IGR4ID0gTWF0aC50YW4ocmFkMSkgKiByO1xyXG5cdFx0XHRcdFx0XHRcdGxldCByYWQyID0gTWF0aC5hdGFuKGR4IC8gbWF4Uik7XHJcblx0XHRcdFx0XHRcdFx0aWYocmFkMiA+IFQucGk2MCkgIHJhZDIgPSBULnBpNjA7XHJcblx0XHRcdFx0XHRcdCAgICBlbHNlIGlmKCByYWQyIDwgLVQucGk2MCApIHJhZDIgPSAtVC5waTYwO1xyXG5cdFx0XHRcdFx0XHRcclxuXHRcdFx0XHRcdFx0XHRyYWQgKz0gcmFkMiAtIHJhZDE7XHJcblxyXG5cdFx0XHRcdFx0XHRcdHJhZDAgPSAocmFkICsgVC5waTkwICArIFQuVHdvUEkgKyBycikgJSAoVC5Ud29QSSksXHJcblx0XHRcdFx0XHRcdFx0cmFkMSA9IHJhZDAgJSAoKDIvMykgKiBULlBJKSAtIChULnBpNjApO1xyXG5cdFx0XHRcdFx0XHRcdGIgPSBNYXRoLnRhbihyYWQxKSAqIGE7XHJcblx0XHRcdFx0XHRcdFx0ciA9IG1heFIgPSBNYXRoLnNxcnQoYSphICsgYipiKTtcclxuXHRcdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHRcdFx0bHVtID0gKChNYXRoLnNpbihyYWQwKSAqIHIpIC8gdGhpcy50c2wpICsgMC41O1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdFx0XHRsZXQgdyA9IDEgLSAoTWF0aC5hYnMobHVtIC0gMC41KSAqIDIpO1xyXG5cdFx0XHRcdFx0XHRzYXQgPSAoKChNYXRoLmNvcyhyYWQwKSAqIHIpICsgKHRoaXMudHIgLyAyKSkgLyAoMS41ICogdGhpcy50cikpIC8gdztcclxuXHRcdFx0XHRcdFx0c2F0ID0gVC5jbGFtcCggc2F0LCAwLCAxICk7XHJcblx0XHRcdFx0XHRcdFxyXG5cdFx0XHRcdCAgICAgICAgdGhpcy5zZXRIU0woW3RoaXMuaHNsWzBdLCBzYXQsIGx1bV0pO1xyXG5cclxuXHRcdFx0XHQgICAgfVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHR9XHJcblxyXG5cdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblx0c2V0SGVpZ2h0ICgpIHtcclxuXHJcblx0XHR0aGlzLmggPSB0aGlzLmlzT3BlbiA/IHRoaXMud2ZpeGUgKyB0aGlzLmJhc2VIICsgNSA6IHRoaXMuYmFzZUg7XHJcblx0XHR0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuXHRcdHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuXHR9XHJcblxyXG5cdHBhcmVudEhlaWdodCAoIHQgKSB7XHJcblxyXG5cdFx0aWYgKCB0aGlzLmdyb3VwICE9PSBudWxsICkgdGhpcy5ncm91cC5jYWxjKCB0ICk7XHJcblx0ICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuXHR9XHJcblxyXG5cdG9wZW4gKCkge1xyXG5cclxuXHRcdHN1cGVyLm9wZW4oKTtcclxuXHJcblx0XHR0aGlzLnNldEhlaWdodCgpO1xyXG5cclxuXHRcdGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgLT0gdGhpcy53Zml4ZSArIDU7XHJcblxyXG5cdFx0bGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuXHQgICAgdGhpcy5zWzNdLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcblx0ICAgIC8vdGhpcy5zWzNdLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cdCAgICB0aGlzLnBhcmVudEhlaWdodCggdCApO1xyXG5cclxuXHR9XHJcblxyXG5cdGNsb3NlICgpIHtcclxuXHJcblx0XHRzdXBlci5jbG9zZSgpO1xyXG5cclxuXHRcdGlmKCB0aGlzLnVwICkgdGhpcy56b25lLnkgKz0gdGhpcy53Zml4ZSArIDU7XHJcblxyXG5cdFx0bGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuXHRcdHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG5cdCAgICB0aGlzLnNbM10udmlzaWJpbGl0eSAgPSAnaGlkZGVuJztcclxuXHQgICAgLy90aGlzLnNbM10uZGlzcGxheSA9ICdub25lJztcclxuXHQgICAgdGhpcy5wYXJlbnRIZWlnaHQoIC10ICk7XHJcblxyXG5cdH1cclxuXHJcblx0dXBkYXRlICggdXAgKSB7XHJcblxyXG5cdCAgICBsZXQgY2MgPSBUb29scy5yZ2JUb0hleCggVG9vbHMuaHNsVG9SZ2IoWyB0aGlzLmhzbFswXSwgMSwgMC41IF0pICk7XHJcblxyXG5cdCAgICB0aGlzLm1vdmVNYXJrZXJzKCk7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLnZhbHVlID0gdGhpcy5iY29sb3I7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsIGNjLCAyLCAwICk7XHJcblxyXG5cclxuXHQgICAgdGhpcy5zWzJdLmJhY2tncm91bmQgPSB0aGlzLmJjb2xvcjtcclxuXHQgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gVG9vbHMuaHRtbFRvSGV4KCB0aGlzLmJjb2xvciApO1xyXG5cclxuXHQgICAgdGhpcy5pbnZlcnQgPSBUb29scy5maW5kRGVlcEludmVyKCB0aGlzLnJnYiApO1xyXG5cdCAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmludmVydCA/ICcjZmZmJyA6ICcjMDAwJztcclxuXHJcblx0ICAgIGlmKCF1cCkgcmV0dXJuO1xyXG5cclxuXHQgICAgaWYoIHRoaXMuY3R5cGUgPT09ICdhcnJheScgKSB0aGlzLnNlbmQoIHRoaXMucmdiICk7XHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAncmdiJyApIHRoaXMuc2VuZCggVG9vbHMuaHRtbFJnYiggdGhpcy5yZ2IgKSApO1xyXG5cdCAgICBpZiggdGhpcy5jdHlwZSA9PT0gJ2hleCcgKSB0aGlzLnNlbmQoIFRvb2xzLmh0bWxUb0hleCggdGhpcy52YWx1ZSApICk7XHJcblx0ICAgIGlmKCB0aGlzLmN0eXBlID09PSAnaHRtbCcgKSB0aGlzLnNlbmQoKTtcclxuXHJcblx0fVxyXG5cclxuXHRzZXRDb2xvciAoIGNvbG9yICkge1xyXG5cclxuXHQgICAgbGV0IHVucGFjayA9IFRvb2xzLnVucGFjayhjb2xvcik7XHJcblx0ICAgIGlmICh0aGlzLmJjb2xvciAhPSBjb2xvciAmJiB1bnBhY2spIHtcclxuXHJcblx0ICAgICAgICB0aGlzLmJjb2xvciA9IGNvbG9yO1xyXG5cdCAgICAgICAgdGhpcy5yZ2IgPSB1bnBhY2s7XHJcblx0ICAgICAgICB0aGlzLmhzbCA9IFRvb2xzLnJnYlRvSHNsKCB0aGlzLnJnYiApO1xyXG5cclxuXHQgICAgICAgIHRoaXMuaHVlID0gdGhpcy5oc2xbMF07XHJcblxyXG5cdCAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHQgICAgfVxyXG5cdCAgICByZXR1cm4gdGhpcztcclxuXHJcblx0fVxyXG5cclxuXHRzZXRIU0wgKCBoc2wgKSB7XHJcblxyXG5cdCAgICB0aGlzLmhzbCA9IGhzbDtcclxuXHQgICAgdGhpcy5yZ2IgPSBUb29scy5oc2xUb1JnYiggaHNsICk7XHJcblx0ICAgIHRoaXMuYmNvbG9yID0gVG9vbHMucmdiVG9IZXgoIHRoaXMucmdiICk7XHJcblx0ICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcblx0ICAgIHJldHVybiB0aGlzO1xyXG5cclxuXHR9XHJcblxyXG5cdG1vdmVNYXJrZXJzICgpIHtcclxuXHJcblx0XHRsZXQgcCA9IHRoaXMucHA7XHJcblx0XHRsZXQgVCA9IFRvb2xzO1xyXG5cclxuXHQgICAgbGV0IGMxID0gdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCc7XHJcblx0ICAgIGxldCBhID0gdGhpcy5oc2xbMF0gKiBULlR3b1BJO1xyXG5cdCAgICBsZXQgdGhpcmQgPSAoMi8zKSAqIFQuUEk7XHJcblx0ICAgIGxldCByID0gdGhpcy50cjtcclxuXHQgICAgbGV0IGggPSB0aGlzLmhzbFswXTtcclxuXHQgICAgbGV0IHMgPSB0aGlzLmhzbFsxXTtcclxuXHQgICAgbGV0IGwgPSB0aGlzLmhzbFsyXTtcclxuXHJcblx0ICAgIGxldCBhbmdsZSA9ICggYSAtIFQucGk5MCApICogVC50b2RlZztcclxuXHJcblx0ICAgIGggPSAtIGEgKyBULnBpOTA7XHJcblxyXG5cdFx0bGV0IGh4ID0gTWF0aC5jb3MoaCkgKiByO1xyXG5cdFx0bGV0IGh5ID0gLU1hdGguc2luKGgpICogcjtcclxuXHRcdGxldCBzeCA9IE1hdGguY29zKGggLSB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IHN5ID0gLU1hdGguc2luKGggLSB0aGlyZCkgKiByO1xyXG5cdFx0bGV0IHZ4ID0gTWF0aC5jb3MoaCArIHRoaXJkKSAqIHI7XHJcblx0XHRsZXQgdnkgPSAtTWF0aC5zaW4oaCArIHRoaXJkKSAqIHI7XHJcblx0XHRsZXQgbXggPSAoc3ggKyB2eCkgLyAyLCBteSA9IChzeSArIHZ5KSAvIDI7XHJcblx0XHRhICA9ICgxIC0gMiAqIE1hdGguYWJzKGwgLSAuNSkpICogcztcclxuXHRcdGxldCB4ID0gc3ggKyAodnggLSBzeCkgKiBsICsgKGh4IC0gbXgpICogYTtcclxuXHRcdGxldCB5ID0gc3kgKyAodnkgLSBzeSkgKiBsICsgKGh5IC0gbXkpICogYTtcclxuXHJcblx0ICAgIHAuc2V0KCB4LCB5ICkuYWRkU2NhbGFyKDEyOCk7XHJcblxyXG5cdCAgICAvL2xldCBmZiA9ICgxLWwpKjI1NTtcclxuXHQgICAgLy8gdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2IoJytmZisnLCcrZmYrJywnK2ZmKycpJywgMyApO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3RyYW5zZm9ybScsICdyb3RhdGUoJythbmdsZSsnICknLCAyICk7XHJcblxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCBwLngsIDMgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N5JywgcC55LCAzICk7XHJcblx0ICAgIFxyXG5cdCAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5pbnZlcnQgPyAnI2ZmZicgOiAnIzAwMCcsIDIsIDMgKTtcclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuaW52ZXJ0ID8gJyNmZmYnIDogJyMwMDAnLCAzICk7XHJcblx0ICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJyx0aGlzLmJjb2xvciwgMyApO1xyXG5cclxuXHR9XHJcblxyXG5cdHJTaXplICgpIHtcclxuXHJcblx0ICAgIC8vUHJvdG8ucHJvdG90eXBlLnJTaXplLmNhbGwoIHRoaXMgKTtcclxuXHQgICAgc3VwZXIuclNpemUoKTtcclxuXHJcblx0ICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuXHQgICAgc1syXS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG5cdCAgICBzWzJdLmxlZnQgPSB0aGlzLnNhICsgJ3B4JztcclxuXHJcblx0ICAgIHRoaXMuclNpemVDb2xvciggdGhpcy5jdyApO1xyXG5cclxuXHQgICAgdGhpcy5kZWNhbC54ID0gTWF0aC5mbG9vcigodGhpcy53IC0gdGhpcy53Zml4ZSkgKiAwLjUpO1xyXG5cdCAgICBzWzNdLmxlZnQgPSB0aGlzLmRlY2FsLnggKyAncHgnO1xyXG5cdCAgICBcclxuXHR9XHJcblxyXG5cdHJTaXplQ29sb3IgKCB3ICkge1xyXG5cclxuXHRcdGlmKCB3ID09PSB0aGlzLndmaXhlICkgcmV0dXJuO1xyXG5cclxuXHRcdHRoaXMud2ZpeGUgPSB3O1xyXG5cclxuXHRcdGxldCBzID0gdGhpcy5zO1xyXG5cclxuXHRcdC8vdGhpcy5kZWNhbC54ID0gTWF0aC5mbG9vcigodGhpcy53IC0gdGhpcy53Zml4ZSkgKiAwLjUpO1xyXG5cdCAgICB0aGlzLmRlY2FsLnkgPSB0aGlzLnNpZGUgPT09ICd1cCcgPyAyIDogdGhpcy5iYXNlSCArIDI7XHJcblx0ICAgIHRoaXMubWlkID0gTWF0aC5mbG9vciggdGhpcy53Zml4ZSAqIDAuNSApO1xyXG5cclxuXHQgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3ZpZXdCb3gnLCAnMCAwICcrIHRoaXMud2ZpeGUgKyAnICcrIHRoaXMud2ZpeGUgKTtcclxuXHQgICAgc1szXS53aWR0aCA9IHRoaXMud2ZpeGUgKyAncHgnO1xyXG5cdCAgICBzWzNdLmhlaWdodCA9IHRoaXMud2ZpeGUgKyAncHgnO1xyXG4gICAgXHQvL3NbM10ubGVmdCA9IHRoaXMuZGVjYWwueCArICdweCc7XHJcblx0ICAgIHNbM10udG9wID0gdGhpcy5kZWNhbC55ICsgJ3B4JztcclxuXHJcblx0ICAgIHRoaXMucmF0aW8gPSAyNTYgLyB0aGlzLndmaXhlO1xyXG5cdCAgICB0aGlzLnNxdWFyZSA9IDEgLyAoNjAqKHRoaXMud2ZpeGUvMjU2KSk7XHJcblx0ICAgIHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG5cdH1cclxuXHJcblxyXG59IiwiaW1wb3J0IHsgUm9vdHMgfSBmcm9tICcuLi9jb3JlL1Jvb3RzJztcclxuaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBGcHMgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5yb3VuZCA9IE1hdGgucm91bmQ7XHJcblxyXG4gICAgICAgIC8vdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5iYXNlSCA9IHRoaXMuaDtcclxuICAgICAgICB0aGlzLmhwbHVzID0gby5ocGx1cyB8fCA1MDtcclxuXHJcbiAgICAgICAgdGhpcy5yZXMgPSBvLnJlcyB8fCA0MDtcclxuICAgICAgICB0aGlzLmwgPSAxO1xyXG5cclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uIHx8IDA7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuY3VzdG9tID0gby5jdXN0b20gfHwgZmFsc2U7XHJcbiAgICAgICAgdGhpcy5uYW1lcyA9IG8ubmFtZXMgfHwgWydGUFMnLCAnTVMnXTtcclxuICAgICAgICBsZXQgY2MgPSBvLmNjIHx8IFsnMjIwLDIyMCwyMjAnLCAnMjU1LDI1NSwwJ107XHJcblxyXG4gICAgICAgLy8gdGhpcy5kaXZpZCA9IFsgMTAwLCAxMDAsIDEwMCBdO1xyXG4gICAgICAgLy8gdGhpcy5tdWx0eSA9IFsgMzAsIDMwLCAzMCBdO1xyXG5cclxuICAgICAgICB0aGlzLmFkZGluZyA9IG8uYWRkaW5nIHx8IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnJhbmdlID0gby5yYW5nZSB8fCBbIDE2NSwgMTAwLCAxMDAgXTtcclxuXHJcbiAgICAgICAgdGhpcy5hbHBoYSA9IG8uYWxwaGEgfHwgMC4yNTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnBvaW50cyA9IFtdO1xyXG4gICAgICAgIHRoaXMudGV4dERpc3BsYXkgPSBbXTtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuY3VzdG9tKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubm93ID0gKCBzZWxmLnBlcmZvcm1hbmNlICYmIHNlbGYucGVyZm9ybWFuY2Uubm93ICkgPyBzZWxmLnBlcmZvcm1hbmNlLm5vdy5iaW5kKCBwZXJmb3JtYW5jZSApIDogRGF0ZS5ub3c7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lID0gMDsvL3RoaXMubm93KClcclxuICAgICAgICAgICAgdGhpcy5wcmV2VGltZSA9IDA7Ly90aGlzLnN0YXJ0VGltZTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZXMgPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tcyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZnBzID0gMDtcclxuICAgICAgICAgICAgdGhpcy5tZW0gPSAwO1xyXG4gICAgICAgICAgICB0aGlzLm1tID0gMDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaXNNZW0gPSAoIHNlbGYucGVyZm9ybWFuY2UgJiYgc2VsZi5wZXJmb3JtYW5jZS5tZW1vcnkgKSA/IHRydWUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgLy8gdGhpcy5kaXZpZCA9IFsgMTAwLCAyMDAsIDEgXTtcclxuICAgICAgICAgICAvLyB0aGlzLm11bHR5ID0gWyAzMCwgMzAsIDMwIF07XHJcblxyXG4gICAgICAgICAgICBpZiggdGhpcy5pc01lbSApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubmFtZXMucHVzaCgnTUVNJyk7XHJcbiAgICAgICAgICAgICAgICBjYy5wdXNoKCcwLDI1NSwyNTUnKTtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudHh0ID0gby5uYW1lIHx8ICdGcHMnXHJcblxyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNjtcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gdGhpcy50eHQ7XHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUucG9pbnRlckV2ZW50cyA9ICdhdXRvJztcclxuXHJcbiAgICAgICAgbGV0IHBhbmVsQ3NzID0gJ2Rpc3BsYXk6bm9uZTsgbGVmdDoxMHB4OyB0b3A6JysgdGhpcy5oICsgJ3B4OyBoZWlnaHQ6JysodGhpcy5ocGx1cyAtIDgpKydweDsgYm94LXNpemluZzpib3JkZXItYm94OyBiYWNrZ3JvdW5kOiByZ2JhKDAsIDAsIDAsIDAuMik7IGJvcmRlcjonICsgKHRoaXMuY29sb3JzLmdyb3VwQm9yZGVyICE9PSAnbm9uZSc/IHRoaXMuY29sb3JzLmdyb3VwQm9yZGVyKyc7JyA6ICcxcHggc29saWQgcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpOycpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5yYWRpdXMgIT09IDAgKSBwYW5lbENzcyArPSAnYm9yZGVyLXJhZGl1czonICsgdGhpcy5yYWRpdXMrJ3B4Oyc7IFxyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArIHBhbmVsQ3NzICwge30gKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgndmlld0JveCcsICcwIDAgJyt0aGlzLnJlcysnIDUwJyApO1xyXG4gICAgICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsICcxMDAlJyApO1xyXG4gICAgICAgIHRoaXMuY1syXS5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgJzEwMCUnICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLnNldEF0dHJpYnV0ZSgncHJlc2VydmVBc3BlY3RSYXRpbycsICdub25lJyApO1xyXG5cclxuXHJcbiAgICAgICAgLy90aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoMjU1LDI1NSwwLDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6JyNGRjAnLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAgICAgLy90aGlzLmRvbSggJ3BhdGgnLCBudWxsLCB7IGZpbGw6J3JnYmEoMCwyNTUsMjU1LDAuMyknLCAnc3Ryb2tlLXdpZHRoJzoxLCBzdHJva2U6JyMwRkYnLCAndmVjdG9yLWVmZmVjdCc6J25vbi1zY2FsaW5nLXN0cm9rZScgfSwgdGhpcy5jWzJdICk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgLy8gYXJyb3dcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6NHB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5hcnJvdywgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgICAgICAvLyByZXN1bHQgdGVzdFxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3Bvc2l0aW9uOmFic29sdXRlOyBsZWZ0OjEwcHg7IHRvcDonKyh0aGlzLmgrMikgKydweDsgZGlzcGxheTpub25lOyB3aWR0aDoxMDAlOyB0ZXh0LWFsaWduOmNlbnRlcjsnICk7XHJcblxyXG4gICAgICAgIC8vIGJvdHRvbSBsaW5lXHJcbiAgICAgICAgaWYoIG8uYm90dG9tTGluZSApIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgYm90dG9tOjBweDsgaGVpZ2h0OjFweDsgYmFja2dyb3VuZDogcmdiYSgyNTUsIDI1NSwgMjU1LCAwLjIpOycpO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2hvdyA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc1sxXS5tYXJnaW5MZWZ0ID0gJzEwcHgnO1xyXG4gICAgICAgIHNbMV0ubGluZUhlaWdodCA9IHRoaXMuaC00O1xyXG4gICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICBzWzFdLmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApICBzWzBdLmJvcmRlclJhZGl1cyA9IHRoaXMucmFkaXVzKydweCc7IFxyXG4gICAgICAgIHNbMF0uYm9yZGVyID0gdGhpcy5jb2xvcnMuZ3JvdXBCb3JkZXI7XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgIGxldCBqID0gMDtcclxuXHJcbiAgICAgICAgZm9yKCBqPTA7IGo8dGhpcy5uYW1lcy5sZW5ndGg7IGorKyApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGJhc2UgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGkgPSB0aGlzLnJlcysxO1xyXG4gICAgICAgICAgICB3aGlsZSggaS0tICkgYmFzZS5wdXNoKDUwKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucmFuZ2Vbal0gPSAoIDEgLyB0aGlzLnJhbmdlW2pdICkgKiA0OTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRzLnB1c2goIGJhc2UgKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXMucHVzaCgwKTtcclxuICAgICAgICAgICAvLyAgdGhpcy5kb20oICdwYXRoJywgbnVsbCwgeyBmaWxsOidyZ2JhKCcrY2Nbal0rJywwLjUpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOidyZ2JhKCcrY2Nbal0rJywxKScsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0RGlzcGxheS5wdXNoKCBcIjxzcGFuIHN0eWxlPSdjb2xvcjpyZ2IoXCIrY2Nbal0rXCIpJz4gXCIgKyB0aGlzLm5hbWVzW2pdICtcIiBcIik7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaiA9IHRoaXMubmFtZXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGotLSl7XHJcbiAgICAgICAgICAgIHRoaXMuZG9tKCAncGF0aCcsIG51bGwsIHsgZmlsbDoncmdiYSgnK2NjW2pdKycsJyt0aGlzLmFscGhhKycpJywgJ3N0cm9rZS13aWR0aCc6MSwgc3Ryb2tlOidyZ2JhKCcrY2Nbal0rJywxKScsICd2ZWN0b3ItZWZmZWN0Jzonbm9uLXNjYWxpbmctc3Ryb2tlJyB9LCB0aGlzLmNbMl0gKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgLy9pZiggdGhpcy5pc1Nob3cgKSB0aGlzLnNob3coKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1Nob3cgKSB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgZWxzZSB0aGlzLm9wZW4oKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIC8qbW9kZTogZnVuY3Rpb24gKCBtb2RlICkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcbiAgICAgICAgc3dpdGNoKG1vZGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6IC8vIGJhc2VcclxuICAgICAgICAgICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIC8vc1sxXS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBzWzFdLmNvbG9yID0gJyNGRkYnO1xyXG4gICAgICAgICAgICAgICAgLy9zWzFdLmJhY2tncm91bmQgPSBVSUwuU0VMRUNUO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0IC8gZG93blxyXG4gICAgICAgICAgICAgICAgc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgLy9zWzFdLmJhY2tncm91bmQgPSBVSUwuU0VMRUNURE9XTjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH0sKi9cclxuXHJcbiAgICB0aWNrICggdiApIHtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSB2O1xyXG4gICAgICAgIGlmKCAhdGhpcy5pc1Nob3cgKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5kcmF3R3JhcGgoKTtcclxuICAgICAgICB0aGlzLnVwVGV4dCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtYWtlUGF0aCAoIHBvaW50ICkge1xyXG5cclxuICAgICAgICBsZXQgcCA9ICcnO1xyXG4gICAgICAgIHAgKz0gJ00gJyArICgtMSkgKyAnICcgKyA1MDtcclxuICAgICAgICBmb3IgKCBsZXQgaSA9IDA7IGkgPCB0aGlzLnJlcyArIDE7IGkgKysgKSB7IHAgKz0gJyBMICcgKyBpICsgJyAnICsgcG9pbnRbaV07IH1cclxuICAgICAgICBwICs9ICcgTCAnICsgKHRoaXMucmVzICsgMSkgKyAnICcgKyA1MDtcclxuICAgICAgICByZXR1cm4gcDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBUZXh0ICggdmFsICkge1xyXG5cclxuICAgICAgICBsZXQgdiA9IHZhbCB8fCB0aGlzLnZhbHVlcywgdCA9ICcnO1xyXG4gICAgICAgIGZvciggbGV0IGo9MCwgbG5nID10aGlzLm5hbWVzLmxlbmd0aDsgajxsbmc7IGorKyApIHQgKz0gdGhpcy50ZXh0RGlzcGxheVtqXSArICh2W2pdKS50b0ZpeGVkKHRoaXMucHJlY2lzaW9uKSArICc8L3NwYW4+JztcclxuICAgICAgICB0aGlzLmNbNF0uaW5uZXJIVE1MID0gdDtcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGRyYXdHcmFwaCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBzdmcgPSB0aGlzLmNbMl07XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLm5hbWVzLmxlbmd0aCwgdiwgb2xkID0gMCwgbiA9IDA7XHJcblxyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICAgICAgaWYoIHRoaXMuYWRkaW5nICkgdiA9ICh0aGlzLnZhbHVlc1tuXStvbGQpICogdGhpcy5yYW5nZVtuXTtcclxuICAgICAgICAgICAgZWxzZSAgdiA9ICh0aGlzLnZhbHVlc1tuXSAqIHRoaXMucmFuZ2Vbbl0pO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50c1tuXS5zaGlmdCgpO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50c1tuXS5wdXNoKCA1MCAtIHYgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHN2ZywgJ2QnLCB0aGlzLm1ha2VQYXRoKCB0aGlzLnBvaW50c1tuXSApLCBpKzEgKTtcclxuICAgICAgICAgICAgb2xkICs9IHRoaXMudmFsdWVzW25dO1xyXG4gICAgICAgICAgICBuKys7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgb3BlbiAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLm9wZW4oKTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5ocGx1cyArIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5zdmdzLmFycm93RG93biApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5ncm91cCAhPT0gbnVsbCApeyB0aGlzLmdyb3VwLmNhbGMoIHRoaXMuaHBsdXMgKTt9XHJcbiAgICAgICAgZWxzZSBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHRoaXMuaHBsdXMgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdibG9jayc7IFxyXG4gICAgICAgIHRoaXMuc1s0XS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICB0aGlzLmlzU2hvdyA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXN0b20gKSBSb290cy5hZGRMaXN0ZW4oIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZCcsIHRoaXMuc3Zncy5hcnJvdyApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5ncm91cCAhPT0gbnVsbCApeyB0aGlzLmdyb3VwLmNhbGMoIC10aGlzLmhwbHVzICk7fVxyXG4gICAgICAgIGVsc2UgaWYoIHRoaXMuaXNVSSApIHRoaXMubWFpbi5jYWxjKCAtdGhpcy5ocGx1cyApO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKydweCc7XHJcbiAgICAgICAgdGhpcy5zWzJdLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5zWzRdLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgdGhpcy5pc1Nob3cgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmN1c3RvbSApIFJvb3RzLnJlbW92ZUxpc3RlbiggdGhpcyApO1xyXG5cclxuICAgICAgICB0aGlzLmNbNF0uaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vLy8vIEFVVE8gRlBTIC8vLy8vL1xyXG5cclxuICAgIGJlZ2luICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLm5vdygpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGVuZCAoKSB7XHJcblxyXG4gICAgICAgIGxldCB0aW1lID0gdGhpcy5ub3coKTtcclxuICAgICAgICB0aGlzLm1zID0gdGltZSAtIHRoaXMuc3RhcnRUaW1lO1xyXG5cclxuICAgICAgICB0aGlzLmZyYW1lcyArKztcclxuXHJcbiAgICAgICAgaWYgKCB0aW1lID4gdGhpcy5wcmV2VGltZSArIDEwMDAgKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmZwcyA9IHRoaXMucm91bmQoICggdGhpcy5mcmFtZXMgKiAxMDAwICkgLyAoIHRpbWUgLSB0aGlzLnByZXZUaW1lICkgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMucHJldlRpbWUgPSB0aW1lO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lcyA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoIHRoaXMuaXNNZW0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGhlYXBTaXplID0gcGVyZm9ybWFuY2UubWVtb3J5LnVzZWRKU0hlYXBTaXplO1xyXG4gICAgICAgICAgICAgICAgbGV0IGhlYXBTaXplTGltaXQgPSBwZXJmb3JtYW5jZS5tZW1vcnkuanNIZWFwU2l6ZUxpbWl0O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubWVtID0gdGhpcy5yb3VuZCggaGVhcFNpemUgKiAwLjAwMDAwMDk1NCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tbSA9IGhlYXBTaXplIC8gaGVhcFNpemVMaW1pdDtcclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnZhbHVlcyA9IFsgdGhpcy5mcHMsIHRoaXMubXMgLCB0aGlzLm1tIF07XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd0dyYXBoKCk7XHJcbiAgICAgICAgdGhpcy51cFRleHQoIFsgdGhpcy5mcHMsIHRoaXMubXMsIHRoaXMubWVtIF0gKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRpbWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGxpc3RlbmluZyAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5jdXN0b20gKSB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuZW5kKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBsZXQgdyA9IHRoaXMudztcclxuXHJcbiAgICAgICAgc1swXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbMV0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSAxMCArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9ICh3LTIwKSArICdweCc7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9ICh3LTIwKSArICdweCc7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5leHBvcnQgY2xhc3MgR3JhcGggZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICBcdHRoaXMudmFsdWUgPSBvLnZhbHVlICE9PSB1bmRlZmluZWQgPyBvLnZhbHVlIDogWzAsMCwwXTtcclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cclxuICAgICAgICB0aGlzLnByZWNpc2lvbiA9IG8ucHJlY2lzaW9uICE9PSB1bmRlZmluZWQgPyBvLnByZWNpc2lvbiA6IDI7XHJcbiAgICAgICAgdGhpcy5tdWx0aXBsaWNhdG9yID0gby5tdWx0aXBsaWNhdG9yIHx8IDE7XHJcbiAgICAgICAgdGhpcy5uZWcgPSBvLm5lZyB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5saW5lID0gby5saW5lICE9PSB1bmRlZmluZWQgPyAgby5saW5lIDogdHJ1ZTtcclxuXHJcbiAgICAgICAgLy9pZih0aGlzLm5lZyl0aGlzLm11bHRpcGxpY2F0b3IqPTI7XHJcblxyXG4gICAgICAgIHRoaXMuYXV0b1dpZHRoID0gby5hdXRvV2lkdGggIT09IHVuZGVmaW5lZCA/IG8uYXV0b1dpZHRoIDogdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzTnVtYmVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IG8uaCB8fCAxMjggKyAxMDtcclxuICAgICAgICB0aGlzLnJoID0gdGhpcy5oIC0gMTA7XHJcbiAgICAgICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmNbMV0gIT09IHVuZGVmaW5lZCApIHsgLy8gd2l0aCB0aXRsZVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vdGhpcy5jWzFdLnN0eWxlLmJhY2tncm91bmQgPSAnI2ZmMDAwMCc7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5naCA9IHRoaXMucmggLSAyODtcclxuICAgICAgICB0aGlzLmd3ID0gdGhpcy53IC0gMjg7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246Y2VudGVyOyB0b3A6JysodGhpcy5oLTIwKSsncHg7IHdpZHRoOicrdGhpcy53KydweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG5cclxuICAgICAgICBsZXQgc3ZnID0gdGhpcy5kb20oICdzdmcnLCB0aGlzLmNzcy5iYXNpYyAsIHsgdmlld0JveDonMCAwICcrdGhpcy53KycgJyt0aGlzLnJoLCB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLnJoLCBwcmVzZXJ2ZUFzcGVjdFJhdGlvOidub25lJyB9ICk7XHJcbiAgICAgICAgdGhpcy5zZXRDc3MoIHN2ZywgeyB3aWR0aDp0aGlzLncsIGhlaWdodDp0aGlzLnJoLCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5kb20oICdwYXRoJywgJycsIHsgZDonJywgc3Ryb2tlOnRoaXMuY29sb3JzLnRleHQsICdzdHJva2Utd2lkdGgnOjIsIGZpbGw6J25vbmUnLCAnc3Ryb2tlLWxpbmVjYXAnOididXR0JyB9LCBzdmcgKTtcclxuICAgICAgICB0aGlzLmRvbSggJ3JlY3QnLCAnJywgeyB4OjEwLCB5OjEwLCB3aWR0aDp0aGlzLmd3KzgsIGhlaWdodDp0aGlzLmdoKzgsIHN0cm9rZToncmdiYSgwLDAsMCwwLjMpJywgJ3N0cm9rZS13aWR0aCc6MSAsIGZpbGw6J25vbmUnfSwgc3ZnICk7XHJcblxyXG4gICAgICAgIHRoaXMuaXcgPSAoKHRoaXMuZ3ctKDQqKHRoaXMubG5nLTEpKSkvdGhpcy5sbmcpO1xyXG4gICAgICAgIGxldCB0ID0gW107XHJcbiAgICAgICAgdGhpcy5jTW9kZSA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLnYgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgIFx0dFtpXSA9IFsgMTQgKyAoaSp0aGlzLml3KSArIChpKjQpLCB0aGlzLml3IF07XHJcbiAgICAgICAgXHR0W2ldWzJdID0gdFtpXVswXSArIHRbaV1bMV07XHJcbiAgICAgICAgXHR0aGlzLmNNb2RlW2ldID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLm5lZyApIHRoaXMudltpXSA9ICgoMSsodGhpcy52YWx1ZVtpXSAvIHRoaXMubXVsdGlwbGljYXRvcikpKjAuNSk7XHJcbiAgICAgICAgXHRlbHNlIHRoaXMudltpXSA9IHRoaXMudmFsdWVbaV0gLyB0aGlzLm11bHRpcGxpY2F0b3I7XHJcblxyXG4gICAgICAgIFx0dGhpcy5kb20oICdyZWN0JywgJycsIHsgeDp0W2ldWzBdLCB5OjE0LCB3aWR0aDp0W2ldWzFdLCBoZWlnaHQ6MSwgZmlsbDp0aGlzLmZvbnRDb2xvciwgJ2ZpbGwtb3BhY2l0eSc6MC4zIH0sIHN2ZyApO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudG1wID0gdDtcclxuICAgICAgICB0aGlzLmNbM10gPSBzdmc7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy53KVxyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS50b3AgPSAwICsncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUuaGVpZ2h0ID0gMjAgKydweCc7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXS5saW5lSGVpZ2h0ID0gKDIwLTUpKydweCdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCBmYWxzZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVTVkcgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5saW5lICkgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2QnLCB0aGlzLm1ha2VQYXRoKCksIDAgKTtcclxuXHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaTx0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2hlaWdodCcsIHRoaXMudltpXSp0aGlzLmdoLCBpKzIgKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3knLCAxNCArICh0aGlzLmdoIC0gdGhpcy52W2ldKnRoaXMuZ2gpLCBpKzIgKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMubmVnICkgdGhpcy52YWx1ZVtpXSA9ICggKCh0aGlzLnZbaV0qMiktMSkgKiB0aGlzLm11bHRpcGxpY2F0b3IgKS50b0ZpeGVkKCB0aGlzLnByZWNpc2lvbiApICogMTtcclxuICAgICAgICAgICAgZWxzZSB0aGlzLnZhbHVlW2ldID0gKCAodGhpcy52W2ldICogdGhpcy5tdWx0aXBsaWNhdG9yKSApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuXHQgICAgaWYoIGwueT50aGlzLnRvcCAmJiBsLnk8dGhpcy5oLTIwICl7XHJcblx0ICAgICAgICB3aGlsZSggaS0tICl7XHJcblx0ICAgICAgICAgICAgaWYoIGwueD50W2ldWzBdICYmIGwueDx0W2ldWzJdICkgcmV0dXJuIGk7XHJcblx0ICAgICAgICB9XHJcblx0ICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBuLCBuYW1lICkge1xyXG5cclxuICAgIFx0aWYoIG4gPT09IHRoaXMuY01vZGVbbmFtZV0gKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHRsZXQgYTtcclxuXHJcbiAgICAgICAgc3dpdGNoKG4pe1xyXG4gICAgICAgICAgICBjYXNlIDA6IGE9MC4zOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiBhPTAuNjsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogYT0xOyBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwtb3BhY2l0eScsIGEsIG5hbWUgKyAyICk7XHJcbiAgICAgICAgdGhpcy5jTW9kZVtuYW1lXSA9IG47XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgIFx0bGV0IG51cCA9IGZhbHNlO1xyXG4gICAgICAgIC8vdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0peyBcclxuICAgICAgICAgICAgaWYoIHRoaXMuY01vZGVbaV0gIT09IDAgKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY01vZGVbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2ZpbGwtb3BhY2l0eScsIDAuMywgaSArIDIgKTtcclxuICAgICAgICAgICAgICAgIG51cCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgIT09IC0xICkgcmV0dXJuIHRoaXMucmVzZXQoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgIFx0dGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgIFx0bGV0IG51cCA9IGZhbHNlO1xyXG5cclxuICAgIFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKGUpO1xyXG5cclxuICAgIFx0aWYoIG5hbWUgPT09ICcnICl7XHJcblxyXG4gICAgICAgICAgICBudXAgPSB0aGlzLnJlc2V0KCk7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHsgXHJcblxyXG4gICAgICAgICAgICBudXAgPSB0aGlzLm1vZGUoIHRoaXMuaXNEb3duID8gMiA6IDEsIG5hbWUgKTtcclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvciggdGhpcy5jdXJyZW50ICE9PSAtMSA/ICdtb3ZlJyA6ICdwb2ludGVyJyApO1xyXG4gICAgICAgICAgICBpZih0aGlzLmlzRG93bil7XHJcbiAgICAgICAgICAgIFx0dGhpcy52W25hbWVdID0gdGhpcy5jbGFtcCggMSAtICgoIGUuY2xpZW50WSAtIHRoaXMuem9uZS55IC0gdGhpcy50b3AgLSAxMCApIC8gdGhpcy5naCkgLCAwLCAxICk7XHJcbiAgICAgICAgICAgIFx0dGhpcy51cGRhdGUoIHRydWUgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICBcdHRoaXMudXBkYXRlU1ZHKCk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtYWtlUGF0aCAoKSB7XHJcblxyXG4gICAgXHRsZXQgcCA9IFwiXCIsIGgsIHcsIHduLCB3bSwgb3csIG9oO1xyXG4gICAgXHQvL2xldCBnID0gdGhpcy5pdyowLjVcclxuXHJcbiAgICBcdGZvcihsZXQgaSA9IDA7IGk8dGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgIFx0XHRoID0gMTQgKyAodGhpcy5naCAtIHRoaXMudltpXSp0aGlzLmdoKTtcclxuICAgIFx0XHR3ID0gKDE0ICsgKGkqdGhpcy5pdykgKyAoaSo0KSk7XHJcblxyXG4gICAgXHRcdHdtID0gdyArIHRoaXMuaXcqMC41O1xyXG4gICAgXHRcdHduID0gdyArIHRoaXMuaXc7XHJcblxyXG4gICAgXHRcdGlmKGk9PT0wKSBwKz0nTSAnK3crJyAnKyBoICsgJyBUICcgKyB3bSArJyAnKyBoO1xyXG4gICAgXHRcdGVsc2UgcCArPSAnIEMgJyArIG93ICsnICcrIG9oICsgJywnICsgdyArJyAnKyBoICsgJywnICsgd20gKycgJysgaDtcclxuICAgIFx0XHRpZihpID09PSB0aGlzLmxuZy0xKSBwKz0nIFQgJyArIHduICsnICcrIGg7XHJcblxyXG4gICAgXHRcdG93ID0gd25cclxuICAgIFx0XHRvaCA9IGggXHJcblxyXG4gICAgXHR9XHJcblxyXG4gICAgXHRyZXR1cm4gcDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSBzWzFdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuICAgICAgICBzWzJdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuICAgICAgICBzWzNdLndpZHRoID0gdGhpcy53ICsgJ3B4JztcclxuXHJcbiAgICAgICAgbGV0IGd3ID0gdGhpcy53IC0gMjg7XHJcbiAgICAgICAgbGV0IGl3ID0gKChndy0oNCoodGhpcy5sbmctMSkpKS90aGlzLmxuZyk7XHJcblxyXG4gICAgICAgIGxldCB0ID0gW107XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgdFtpXSA9IFsgMTQgKyAoaSppdykgKyAoaSo0KSwgaXcgXTtcclxuICAgICAgICAgICAgdFtpXVsyXSA9IHRbaV1bMF0gKyB0W2ldWzFdO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudG1wID0gdDtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiXHJcbmltcG9ydCB7IFJvb3RzIH0gZnJvbSAnLi4vY29yZS9Sb290cyc7XHJcbmltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgR3JvdXAgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5BREQgPSBvLmFkZDtcclxuXHJcbiAgICAgICAgdGhpcy51aXMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvSGVpZ2h0ID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuZGVjYWwgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTY7XHJcblxyXG4gICAgICAgIHRoaXMuaXNMaW5lID0gby5saW5lICE9PSB1bmRlZmluZWQgPyBvLmxpbmUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyBsZWZ0OjA7IGhlaWdodDphdXRvOyBvdmVyZmxvdzpoaWRkZW47IHRvcDonK3RoaXMuaCsncHgnKTtcclxuICAgICAgICB0aGlzLmNbM10gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6MDsgdG9wOicrZmx0b3ArJ3B4OycsIHsgZDp0aGlzLnN2Z3MuZ3JvdXAsIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IGxlZnQ6NHB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Zncy5hcnJvdywgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG4gICAgICAgIC8vIGJvdHRvbSBsaW5lXHJcbiAgICAgICAgaWYoIHRoaXMuaXNMaW5lICkgdGhpcy5jWzVdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICAnYmFja2dyb3VuZDpyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMik7IHdpZHRoOjEwMCU7IGxlZnQ6MDsgaGVpZ2h0OjFweDsgYm90dG9tOjBweCcpO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMucztcclxuXHJcblxyXG5cclxuICAgICAgICBzWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgc1sxXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1sxXS5uYW1lID0gJ2dyb3VwJztcclxuXHJcbiAgICAgICAgc1sxXS5tYXJnaW5MZWZ0ID0gJzEwcHgnO1xyXG4gICAgICAgIHNbMV0ubGluZUhlaWdodCA9IHRoaXMuaC00O1xyXG4gICAgICAgIHNbMV0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICBzWzFdLmZvbnRXZWlnaHQgPSAnYm9sZCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnJhZGl1cyAhPT0gMCApIHNbMF0uYm9yZGVyUmFkaXVzID0gdGhpcy5yYWRpdXMrJ3B4JzsgXHJcbiAgICAgICAgc1swXS5ib3JkZXIgPSB0aGlzLmNvbG9ycy5ncm91cEJvcmRlcjtcclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgICAgIC8vaWYoIG8uYmcgIT09IHVuZGVmaW5lZCApIHRoaXMuc2V0Qkcoby5iZyk7XHJcbiAgICAgICAgdGhpcy5zZXRCRyggdGhpcy5iZyApO1xyXG4gICAgICAgIGlmKCBvLm9wZW4gIT09IHVuZGVmaW5lZCApIHRoaXMub3BlbigpO1xyXG5cclxuXHJcbiAgICAgICAgLy9zWzBdLmJhY2tncm91bmQgPSB0aGlzLmJnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9ICcnO1xyXG5cclxuICAgICAgICBpZiggbC55IDwgdGhpcy5iYXNlSCApIG5hbWUgPSAndGl0bGUnO1xyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5pc09wZW4gKSBuYW1lID0gJ2NvbnRlbnQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG5hbWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyVGFyZ2V0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY3VycmVudCA9PT0gLTEgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgLy8gaWYoIXRoaXMudGFyZ2V0KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50YXJnZXQudWlvdXQoKTtcclxuICAgICAgICB0aGlzLnRhcmdldC5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBoYW5kbGVFdmVudCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB0eXBlID0gZS50eXBlO1xyXG5cclxuICAgICAgICBsZXQgY2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHRhcmdldENoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ2NvbnRlbnQnOlxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgICAgICAgICAgaWYoIFJvb3RzLmlzTW9iaWxlICYmIHR5cGUgPT09ICdtb3VzZWRvd24nICkgdGhpcy5nZXROZXh0KCBlLCBjaGFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnRhcmdldCApIHRhcmdldENoYW5nZSA9IHRoaXMudGFyZ2V0LmhhbmRsZUV2ZW50KCBlICk7XHJcblxyXG4gICAgICAgICAgICAvL2lmKCB0eXBlID09PSAnbW91c2Vtb3ZlJyApIGNoYW5nZSA9IHRoaXMuc3R5bGVzKCdkZWYnKTtcclxuXHJcbiAgICAgICAgICAgIGlmKCAhUm9vdHMubG9jayApIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcblxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAndGl0bGUnOlxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICBpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKXtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgdGhpcy5vcGVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgaWYoIHRhcmdldENoYW5nZSApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldE5leHQgKCBlLCBjaGFuZ2UgKSB7XHJcblxyXG4gICAgICAgIGxldCBuZXh0ID0gUm9vdHMuZmluZFRhcmdldCggdGhpcy51aXMsIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IHRoaXMuY3VycmVudCApe1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG5leHQ7XHJcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggbmV4dCAhPT0gLTEgKXsgXHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy51aXNbIHRoaXMuY3VycmVudCBdO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC51aW92ZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjYWxjSCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBsbmcgPSB0aGlzLnVpcy5sZW5ndGgsIGksIHUsICBoPTAsIHB4PTAsIHRtcGg9MDtcclxuICAgICAgICBmb3IoIGkgPSAwOyBpIDwgbG5nOyBpKyspe1xyXG4gICAgICAgICAgICB1ID0gdGhpcy51aXNbaV07XHJcbiAgICAgICAgICAgIGlmKCAhdS5hdXRvV2lkdGggKXtcclxuXHJcbiAgICAgICAgICAgICAgICBpZihweD09PTApIGggKz0gdS5oKzE7XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZih0bXBoPHUuaCkgaCArPSB1LmgtdG1waDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRtcGggPSB1Lmg7XHJcblxyXG4gICAgICAgICAgICAgICAgLy90bXBoID0gdG1waCA8IHUuaCA/IHUuaCA6IHRtcGg7XHJcbiAgICAgICAgICAgICAgICBweCArPSB1Lnc7XHJcbiAgICAgICAgICAgICAgICBpZiggcHgrdS53ID4gdGhpcy53ICkgcHggPSAwO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGggKz0gdS5oKzE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaDtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjVWlzICgpIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHJldHVybjtcclxuXHJcbiAgICAgICAgUm9vdHMuY2FsY1VpcyggdGhpcy51aXMsIHRoaXMuem9uZSwgdGhpcy56b25lLnkgKyB0aGlzLmJhc2VIICk7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzZXRCRyAoIGMgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gYztcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uc2V0QkcoIGMgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGFkZCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gYXJndW1lbnRzO1xyXG5cclxuICAgICAgICBpZiggdHlwZW9mIGFbMV0gPT09ICdvYmplY3QnICl7IFxyXG4gICAgICAgICAgICBhWzFdLmlzVUkgPSB0aGlzLmlzVUk7XHJcbiAgICAgICAgICAgIGFbMV0udGFyZ2V0ID0gdGhpcy5jWzJdO1xyXG4gICAgICAgICAgICBhWzFdLm1haW4gPSB0aGlzLm1haW47XHJcbiAgICAgICAgfSBlbHNlIGlmKCB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnc3RyaW5nJyApe1xyXG4gICAgICAgICAgICBpZiggYVsyXSA9PT0gdW5kZWZpbmVkICkgW10ucHVzaC5jYWxsKCBhLCB7IGlzVUk6dHJ1ZSwgdGFyZ2V0OnRoaXMuY1syXSwgbWFpbjp0aGlzLm1haW4gfSk7XHJcbiAgICAgICAgICAgIGVsc2V7IFxyXG4gICAgICAgICAgICAgICAgYVsyXS5pc1VJID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGFbMl0udGFyZ2V0ID0gdGhpcy5jWzJdO1xyXG4gICAgICAgICAgICAgICAgYVsyXS5tYWluID0gdGhpcy5tYWluO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvL2xldCBuID0gYWRkLmFwcGx5KCB0aGlzLCBhICk7XHJcbiAgICAgICAgbGV0IHUgPSB0aGlzLkFERC5hcHBseSggdGhpcywgYSApO1xyXG5cclxuICAgICAgICB0aGlzLnVpcy5wdXNoKCB1ICk7XHJcblxyXG4gICAgICAgIC8vaWYoIHUuYXV0b0hlaWdodCApIHUucGFyZW50R3JvdXAgPSB0aGlzO1xyXG4gICAgICAgIC8vaWYoIHUuaXNHcm91cCApIFxyXG5cclxuICAgICAgICB1Lmdyb3VwID0gdGhpcztcclxuXHJcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHJldHVybiB1O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyByZW1vdmUgb25lIG5vZGVcclxuXHJcbiAgICByZW1vdmUgKCBuICkge1xyXG5cclxuICAgICAgICBpZiggbi5jbGVhciApIG4uY2xlYXIoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2xlYXIgYWxsIGluZXIgXHJcblxyXG4gICAgZW1wdHkgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoLCBpdGVtO1xyXG5cclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGl0ZW0gPSB0aGlzLnVpcy5wb3AoKTtcclxuICAgICAgICAgICAgdGhpcy5jWzJdLnJlbW92ZUNoaWxkKCBpdGVtLmNbMF0gKTtcclxuICAgICAgICAgICAgaXRlbS5jbGVhciggdHJ1ZSApO1xyXG5cclxuICAgICAgICAgICAgLy90aGlzLnVpc1tpXS5jbGVhcigpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNsZWFyIG9uZSBlbGVtZW50XHJcblxyXG4gICAgY2xlYXJPbmUgKCBuICkgeyBcclxuXHJcbiAgICAgICAgbGV0IGlkID0gdGhpcy51aXMuaW5kZXhPZiggbiApO1xyXG5cclxuICAgICAgICBpZiAoIGlkICE9PSAtMSApIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxjKCAtICggdGhpcy51aXNbIGlkIF0uaCArIDEgKSApO1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0ucmVtb3ZlQ2hpbGQoIHRoaXMudWlzWyBpZCBdLmNbMF0gKTtcclxuICAgICAgICAgICAgdGhpcy51aXMuc3BsaWNlKCBpZCwgMSApOyBcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnVpcy5sZW5ndGggPT09IDAgKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLmlzRW1wdHkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwYXJlbnRIZWlnaHQgKCB0ICkge1xyXG5cclxuICAgICAgICAvL2lmICggdGhpcy5wYXJlbnRHcm91cCAhPT0gbnVsbCApIHRoaXMucGFyZW50R3JvdXAuY2FsYyggdCApO1xyXG4gICAgICAgIGlmICggdGhpcy5ncm91cCAhPT0gbnVsbCApIHRoaXMuZ3JvdXAuY2FsYyggdCApO1xyXG4gICAgICAgIGVsc2UgaWYgKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggdCApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBvcGVuICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIub3BlbigpO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5hcnJvd0Rvd24gKTtcclxuICAgICAgICB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgICAgICBsZXQgdCA9IHRoaXMuaCAtIHRoaXMuYmFzZUg7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCB0ICk7XHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2coIHRoaXMudWlzICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuY2xvc2UoKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5hcnJvdyApO1xyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUg7XHJcbiAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMucGFyZW50SGVpZ2h0KCAtdCApO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKCB0aGlzLnVpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjbGVhciAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZW1wdHkoKTtcclxuICAgICAgICBpZiggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIC0oIHRoaXMuaCArIDEgKSk7XHJcbiAgICAgICAgUHJvdG8ucHJvdG90eXBlLmNsZWFyLmNhbGwoIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJHcm91cCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLyp0aGlzLmNsb3NlKCk7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLmNsZWFyKCk7ICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudWlzID0gW107XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5iYXNlSDsqL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjYWxjICggeSApIHtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYoIHkgIT09IHVuZGVmaW5lZCApeyBcclxuICAgICAgICAgICAgdGhpcy5oICs9IHk7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4uY2FsYyggeSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaCA9IHRoaXMuY2FsY0goKSArIHRoaXMuYmFzZUg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG5cclxuICAgICAgICAvL2lmKHRoaXMuaXNPcGVuKSB0aGlzLmNhbGNVaXMoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemVDb250ZW50ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uc2V0U2l6ZSggdGhpcy53ICk7XHJcbiAgICAgICAgICAgIHRoaXMudWlzW2ldLnJTaXplKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2FsYygpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzWzNdLmxlZnQgPSAoIHRoaXMuc2EgKyB0aGlzLnNiIC0gMTcgKSArICdweCc7XHJcbiAgICAgICAgc1sxXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcbiAgICAgICAgc1syXS53aWR0aCA9IHRoaXMudyArICdweCc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgfVxyXG5cclxufVxyXG5cclxuR3JvdXAucHJvdG90eXBlLmlzR3JvdXAgPSB0cnVlOyIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5leHBvcnQgY2xhc3MgSm95c3RpY2sgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdXRvV2lkdGggPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IFswLDBdO1xyXG5cclxuICAgICAgICB0aGlzLmpveVR5cGUgPSAnYW5hbG9naXF1ZSc7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG8ubW9kZSAhPT0gdW5kZWZpbmVkID8gby5tb2RlIDogMDtcclxuXHJcbiAgICAgICAgdGhpcy5wcmVjaXNpb24gPSBvLnByZWNpc2lvbiB8fCAyO1xyXG4gICAgICAgIHRoaXMubXVsdGlwbGljYXRvciA9IG8ubXVsdGlwbGljYXRvciB8fCAxO1xyXG5cclxuICAgICAgICB0aGlzLnBvcyA9IG5ldyBWMigpO1xyXG4gICAgICAgIHRoaXMudG1wID0gbmV3IFYyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW50ZXJ2YWwgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHRoaXMudyAqIDAuNTtcclxuICAgICAgICB0aGlzLmRpc3RhbmNlID0gdGhpcy5yYWRpdXMqMC4yNTtcclxuXHJcbiAgICAgICAgdGhpcy5oID0gby5oIHx8IHRoaXMudyArIDEwO1xyXG4gICAgICAgIHRoaXMudG9wID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzBdLnN0eWxlLndpZHRoID0gdGhpcy53ICsncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jWzFdICE9PSB1bmRlZmluZWQgKSB7IC8vIHdpdGggdGl0bGVcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS53aWR0aCA9IHRoaXMudyArJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzFdLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLnRvcCA9IDEwO1xyXG4gICAgICAgICAgICB0aGlzLmggKz0gMTA7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jWzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjpjZW50ZXI7IHRvcDonKyh0aGlzLmgtMjApKydweDsgd2lkdGg6Jyt0aGlzLncrJ3B4OyBjb2xvcjonKyB0aGlzLmZvbnRDb2xvciApO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZ2V0Sm95c3RpY2soIHRoaXMubW9kZWwgKTtcclxuICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAndmlld0JveCcsICcwIDAgJyt0aGlzLncrJyAnK3RoaXMudyApO1xyXG4gICAgICAgIHRoaXMuc2V0Q3NzKCB0aGlzLmNbM10sIHsgd2lkdGg6dGhpcy53LCBoZWlnaHQ6dGhpcy53LCBsZWZ0OjAsIHRvcDp0aGlzLnRvcCB9KTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMucmF0aW8gPSAxMjgvdGhpcy53O1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoZmFsc2UpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG1vZGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5tb2RlbD09PTApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgJ3VybCgjZ3JhZEluKScsIDQgKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJyMwMDAnLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiYSgxMDAsMTAwLDEwMCwwLjI1KScsIDIgKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiKDAsMCwwLDAuMSknLCAzICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICcjNjY2JywgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgJ25vbmUnLCA0ICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgaWYodGhpcy5tb2RlbD09PTApe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgJ3VybCgjZ3JhZEluMiknLCA0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsICdyZ2JhKDAsMCwwLDApJywgNCApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgJ3JnYmEoNDgsMTM4LDI1NSwwLjI1KScsIDIgKTtcclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCAncmdiKDAsMCwwLDAuMyknLCAzICk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuY29sb3JzLnNlbGVjdCwgNCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJywgJ3JnYmEoNDgsMTM4LDI1NSwwLjI1KScsIDQgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjogLy8gZWRpdFxyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYWRkSW50ZXJ2YWwgKCl7XHJcbiAgICAgICAgaWYoIHRoaXMuaW50ZXJ2YWwgIT09IG51bGwgKSB0aGlzLnN0b3BJbnRlcnZhbCgpO1xyXG4gICAgICAgIGlmKCB0aGlzLnBvcy5pc1plcm8oKSApIHJldHVybjtcclxuICAgICAgICB0aGlzLmludGVydmFsID0gc2V0SW50ZXJ2YWwoIGZ1bmN0aW9uKCl7IHRoaXMudXBkYXRlKCk7IH0uYmluZCh0aGlzKSwgMTAgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc3RvcEludGVydmFsICgpe1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pbnRlcnZhbCA9PT0gbnVsbCApIHJldHVybjtcclxuICAgICAgICBjbGVhckludGVydmFsKCB0aGlzLmludGVydmFsICk7XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IG51bGw7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRJbnRlcnZhbCgpO1xyXG4gICAgICAgIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkSW50ZXJ2YWwoKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgdGhpcy5tb2RlKCAyICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy50bXAueCA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFggLSB0aGlzLnpvbmUueCApO1xyXG4gICAgICAgIHRoaXMudG1wLnkgPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRZIC0gdGhpcy56b25lLnkgLSB0aGlzLnRvcCApO1xyXG5cclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSB0aGlzLnRtcC5sZW5ndGgoKTtcclxuXHJcbiAgICAgICAgaWYgKCBkaXN0YW5jZSA+IHRoaXMuZGlzdGFuY2UgKSB7XHJcbiAgICAgICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIodGhpcy50bXAueCwgdGhpcy50bXAueSk7XHJcbiAgICAgICAgICAgIHRoaXMudG1wLnggPSBNYXRoLnNpbiggYW5nbGUgKSAqIHRoaXMuZGlzdGFuY2U7XHJcbiAgICAgICAgICAgIHRoaXMudG1wLnkgPSBNYXRoLmNvcyggYW5nbGUgKSAqIHRoaXMuZGlzdGFuY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvcy5jb3B5KCB0aGlzLnRtcCApLmRpdmlkZVNjYWxhciggdGhpcy5kaXN0YW5jZSApLm5lZ2F0ZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRWYWx1ZSAoIHYgKSB7XHJcblxyXG4gICAgICAgIGlmKHY9PT11bmRlZmluZWQpIHY9WzAsMF07XHJcblxyXG4gICAgICAgIHRoaXMucG9zLnNldCggdlswXSB8fCAwLCB2WzFdICB8fCAwICk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTVkcoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIGlmKCB1cCA9PT0gdW5kZWZpbmVkICkgdXAgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pbnRlcnZhbCAhPT0gbnVsbCApe1xyXG5cclxuICAgICAgICAgICAgaWYoICF0aGlzLmlzRG93biApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucG9zLmxlcnAoIG51bGwsIDAuMyApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMucG9zLnggPSBNYXRoLmFicyggdGhpcy5wb3MueCApIDwgMC4wMSA/IDAgOiB0aGlzLnBvcy54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3MueSA9IE1hdGguYWJzKCB0aGlzLnBvcy55ICkgPCAwLjAxID8gMCA6IHRoaXMucG9zLnk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNVSSAmJiB0aGlzLm1haW4uaXNDYW52YXMgKSB0aGlzLm1haW4uZHJhdygpO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlU1ZHKCk7XHJcblxyXG4gICAgICAgIGlmKCB1cCApIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBpZiggdGhpcy5wb3MuaXNaZXJvKCkgKSB0aGlzLnN0b3BJbnRlcnZhbCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVTVkcgKCkge1xyXG5cclxuICAgICAgICBsZXQgeCA9IHRoaXMucmFkaXVzIC0gKCAtdGhpcy5wb3MueCAqIHRoaXMuZGlzdGFuY2UgKTtcclxuICAgICAgICBsZXQgeSA9IHRoaXMucmFkaXVzIC0gKCAtdGhpcy5wb3MueSAqIHRoaXMuZGlzdGFuY2UgKTtcclxuXHJcbiAgICAgICAgIGlmKHRoaXMubW9kZWwgPT09IDApe1xyXG5cclxuICAgICAgICAgICAgbGV0IHN4ID0geCArICgodGhpcy5wb3MueCkqNSkgKyA1O1xyXG4gICAgICAgICAgICBsZXQgc3kgPSB5ICsgKCh0aGlzLnBvcy55KSo1KSArIDEwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4Jywgc3gqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCBzeSp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ2N4JywgeCp0aGlzLnJhdGlvLCAzICk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHkqdGhpcy5yYXRpbywgMyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeCcsIHgqdGhpcy5yYXRpbywgNCApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdjeScsIHkqdGhpcy5yYXRpbywgNCApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlWzBdID0gICggdGhpcy5wb3MueCAqIHRoaXMubXVsdGlwbGljYXRvciApLnRvRml4ZWQoIHRoaXMucHJlY2lzaW9uICkgKiAxO1xyXG4gICAgICAgIHRoaXMudmFsdWVbMV0gPSAgKCB0aGlzLnBvcy55ICogdGhpcy5tdWx0aXBsaWNhdG9yICkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKSAqIDE7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyICgpIHtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnN0b3BJbnRlcnZhbCgpO1xyXG4gICAgICAgIHN1cGVyLmNsZWFyKCk7XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi4vY29yZS9WMic7XHJcblxyXG5leHBvcnQgY2xhc3MgS25vYiBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9XaWR0aCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgICAgICB0aGlzLnNldFR5cGVOdW1iZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5tUEkgPSBNYXRoLlBJICogMC44O1xyXG4gICAgICAgIHRoaXMudG9EZWcgPSAxODAgLyBNYXRoLlBJO1xyXG4gICAgICAgIHRoaXMuY2lyUmFuZ2UgPSB0aGlzLm1QSSAqIDI7XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gbmV3IFYyKCk7XHJcblxyXG4gICAgICAgIHRoaXMucmFkaXVzID0gdGhpcy53ICogMC41Oy8vTWF0aC5mbG9vcigodGhpcy53LTIwKSowLjUpO1xyXG5cclxuICAgICAgICAvL3RoaXMud3cgPSB0aGlzLmhlaWdodCA9IHRoaXMucmFkaXVzICogMjtcclxuICAgICAgICB0aGlzLmggPSBvLmggfHwgdGhpcy53ICsgMTA7XHJcbiAgICAgICAgdGhpcy50b3AgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMF0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuY1sxXSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbMV0uc3R5bGUud2lkdGggPSB0aGlzLncgKydweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY1sxXS5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcclxuICAgICAgICAgICAgdGhpcy50b3AgPSAxMDtcclxuICAgICAgICAgICAgdGhpcy5oICs9IDEwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucGVyY2VudCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY21vZGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dCArICd0ZXh0LWFsaWduOmNlbnRlcjsgdG9wOicrKHRoaXMuaC0yMCkrJ3B4OyB3aWR0aDonK3RoaXMudysncHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcblxyXG4gICAgICAgIHRoaXMuY1szXSA9IHRoaXMuZ2V0S25vYigpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmZvbnRDb2xvciwgMSApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdzdHJva2UnLCB0aGlzLmZvbnRDb2xvciwgMyApO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgdGhpcy5tYWtlR3JhZCgpLCAzICk7XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICd2aWV3Qm94JywgJzAgMCAnK3RoaXMud3crJyAnK3RoaXMud3cgKTtcclxuICAgICAgICB0aGlzLnNldENzcyggdGhpcy5jWzNdLCB7IHdpZHRoOnRoaXMudywgaGVpZ2h0OnRoaXMudywgbGVmdDowLCB0b3A6dGhpcy50b3AgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY21vZGUgPT09IG1vZGUgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNbMl0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdmaWxsJyx0aGlzLmNvbG9ycy5idXR0b24sIDApO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywncmdiYSgwLDAsMCwwLjIpJywgMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnc3Ryb2tlJywgdGhpcy5mb250Q29sb3IsIDEgKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogLy8gb3ZlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5zWzJdLmNvbG9yID0gdGhpcy5jb2xvclBsdXM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnZmlsbCcsdGhpcy5jb2xvcnMuc2VsZWN0LCAwKTtcclxuICAgICAgICAgICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsJ3JnYmEoMCwwLDAsMC42KScsIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3N0cm9rZScsIHRoaXMuY29sb3JQbHVzLCAxICk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IG1vZGU7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zZW5kRW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLm9sZHIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kZSgxKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vtb3ZlICggZSApIHtcclxuXHJcbiAgICAgICAgLy90aGlzLm1vZGUoMSk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBvZmYgPSB0aGlzLm9mZnNldDtcclxuXHJcbiAgICAgICAgb2ZmLnggPSB0aGlzLnJhZGl1cyAtICggZS5jbGllbnRYIC0gdGhpcy56b25lLnggKTtcclxuICAgICAgICBvZmYueSA9IHRoaXMucmFkaXVzIC0gKCBlLmNsaWVudFkgLSB0aGlzLnpvbmUueSAtIHRoaXMudG9wICk7XHJcblxyXG4gICAgICAgIHRoaXMuciA9IC0gTWF0aC5hdGFuMiggb2ZmLngsIG9mZi55ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLm9sZHIgIT09IG51bGwgKSB0aGlzLnIgPSBNYXRoLmFicyh0aGlzLnIgLSB0aGlzLm9sZHIpID4gTWF0aC5QSSA/IHRoaXMub2xkciA6IHRoaXMucjtcclxuXHJcbiAgICAgICAgdGhpcy5yID0gdGhpcy5yID4gdGhpcy5tUEkgPyB0aGlzLm1QSSA6IHRoaXMucjtcclxuICAgICAgICB0aGlzLnIgPSB0aGlzLnIgPCAtdGhpcy5tUEkgPyAtdGhpcy5tUEkgOiB0aGlzLnI7XHJcblxyXG4gICAgICAgIGxldCBzdGVwcyA9IDEgLyB0aGlzLmNpclJhbmdlO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9ICh0aGlzLnIgKyB0aGlzLm1QSSkgKiBzdGVwcztcclxuXHJcbiAgICAgICAgbGV0IG4gPSAoICggdGhpcy5yYW5nZSAqIHZhbHVlICkgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcblxyXG4gICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgIG4gPSBNYXRoLmZsb29yKCBuIC8gdGhpcy5zdGVwICk7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLm51bVZhbHVlKCB0aGlzLm9sZCArICggbiAqIHRoaXMuc3RlcCApICk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgIHRoaXMub2xkID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5vbGRyID0gdGhpcy5yO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbWFrZUdyYWQgKCkge1xyXG5cclxuICAgICAgICBsZXQgZCA9ICcnLCBzdGVwLCByYW5nZSwgYSwgeCwgeSwgeDIsIHkyLCByID0gNjQ7XHJcbiAgICAgICAgbGV0IHN0YXJ0YW5nbGUgPSBNYXRoLlBJICsgdGhpcy5tUEk7XHJcbiAgICAgICAgbGV0IGVuZGFuZ2xlID0gTWF0aC5QSSAtIHRoaXMubVBJO1xyXG4gICAgICAgIC8vbGV0IHN0ZXAgPSB0aGlzLnN0ZXA+NSA/IHRoaXMuc3RlcCA6IDE7XHJcblxyXG4gICAgICAgIGlmKHRoaXMuc3RlcD41KXtcclxuICAgICAgICAgICAgcmFuZ2UgPSAgdGhpcy5yYW5nZSAvIHRoaXMuc3RlcDtcclxuICAgICAgICAgICAgc3RlcCA9ICggc3RhcnRhbmdsZSAtIGVuZGFuZ2xlICkgLyByYW5nZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzdGVwID0gKCggc3RhcnRhbmdsZSAtIGVuZGFuZ2xlICkgLyByKSoyO1xyXG4gICAgICAgICAgICByYW5nZSA9IHIqMC41O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yICggbGV0IGkgPSAwOyBpIDw9IHJhbmdlOyArK2kgKSB7XHJcblxyXG4gICAgICAgICAgICBhID0gc3RhcnRhbmdsZSAtICggc3RlcCAqIGkgKTtcclxuICAgICAgICAgICAgeCA9IHIgKyBNYXRoLnNpbiggYSApICogKCByIC0gMjAgKTtcclxuICAgICAgICAgICAgeSA9IHIgKyBNYXRoLmNvcyggYSApICogKCByIC0gMjAgKTtcclxuICAgICAgICAgICAgeDIgPSByICsgTWF0aC5zaW4oIGEgKSAqICggciAtIDI0ICk7XHJcbiAgICAgICAgICAgIHkyID0gciArIE1hdGguY29zKCBhICkgKiAoIHIgLSAyNCApO1xyXG4gICAgICAgICAgICBkICs9ICdNJyArIHggKyAnICcgKyB5ICsgJyBMJyArIHgyICsgJyAnK3kyICsgJyAnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBkO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuICAgICAgICB0aGlzLnBlcmNlbnQgPSAodGhpcy52YWx1ZSAtIHRoaXMubWluKSAvIHRoaXMucmFuZ2U7XHJcblxyXG4gICAgICAgLy8gbGV0IHIgPSA1MDtcclxuICAgICAgIC8vIGxldCBkID0gNjQ7IFxyXG4gICAgICAgIGxldCByID0gKCAodGhpcy5wZXJjZW50ICogdGhpcy5jaXJSYW5nZSkgLSAodGhpcy5tUEkpKS8vKiB0aGlzLnRvRGVnO1xyXG5cclxuICAgICAgICBsZXQgc2luID0gTWF0aC5zaW4ocik7XHJcbiAgICAgICAgbGV0IGNvcyA9IE1hdGguY29zKHIpO1xyXG5cclxuICAgICAgICBsZXQgeDEgPSAoMjUgKiBzaW4pICsgNjQ7XHJcbiAgICAgICAgbGV0IHkxID0gLSgyNSAqIGNvcykgKyA2NDtcclxuICAgICAgICBsZXQgeDIgPSAoMjAgKiBzaW4pICsgNjQ7XHJcbiAgICAgICAgbGV0IHkyID0gLSgyMCAqIGNvcykgKyA2NDtcclxuXHJcbiAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3gnLCB4LCAxICk7XHJcbiAgICAgICAgLy90aGlzLnNldFN2ZyggdGhpcy5jWzNdLCAnY3knLCB5LCAxICk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbM10sICdkJywgJ00gJyArIHgxICsnICcgKyB5MSArICcgTCAnICsgeDIgKycgJyArIHkyLCAxICk7XHJcblxyXG4gICAgICAgIC8vdGhpcy5zZXRTdmcoIHRoaXMuY1szXSwgJ3RyYW5zZm9ybScsICdyb3RhdGUoJysgciArJyAnKzY0KycgJys2NCsnKScsIDEgKTtcclxuXHJcbiAgICAgICAgaWYoIHVwICkgdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBMaXN0IGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIC8vIGltYWdlc1xyXG4gICAgICAgIHRoaXMucGF0aCA9IG8ucGF0aCB8fCAnJztcclxuICAgICAgICB0aGlzLmZvcm1hdCA9IG8uZm9ybWF0IHx8ICcnO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VTaXplID0gby5pbWFnZVNpemUgfHwgWzIwLDIwXTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1dpdGhJbWFnZSA9IHRoaXMucGF0aCAhPT0gJycgPyB0cnVlOmZhbHNlO1xyXG4gICAgICAgIHRoaXMucHJlTG9hZENvbXBsZXRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudG1wSW1hZ2UgPSB7fTtcclxuICAgICAgICB0aGlzLnRtcFVybCA9IFtdO1xyXG5cclxuICAgICAgICAvL3RoaXMuYXV0b0hlaWdodCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgYWxpZ24gPSBvLmFsaWduIHx8ICdjZW50ZXInO1xyXG5cclxuICAgICAgICB0aGlzLnNNb2RlID0gMDtcclxuICAgICAgICB0aGlzLnRNb2RlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0T25seSA9IG8ubGlzdE9ubHkgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnR4dCA9PT0gJycgKSB0aGlzLnAgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG5cclxuICAgICAgICBsZXQgZmx0b3AgPSBNYXRoLmZsb29yKHRoaXMuaCowLjUpLTU7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjA7IGRpc3BsYXk6bm9uZTsnICk7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyAndGV4dC1hbGlnbjonK2FsaWduKyc7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7IHRvcDoxcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7IGhlaWdodDonKyh0aGlzLmgtMikrJ3B4OyBib3JkZXItcmFkaXVzOicrdGhpcy5yYWRpdXMrJ3B4OycgKTtcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTBweDsgaGVpZ2h0OjEwcHg7IHRvcDonK2ZsdG9wKydweDsnLCB7IGQ6dGhpcy5zdmdzLmFycm93LCBmaWxsOnRoaXMuZm9udENvbG9yLCBzdHJva2U6J25vbmUnfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIgPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3JpZ2h0OjVweDsgIHdpZHRoOjEwcHg7IGJhY2tncm91bmQ6IzY2NjsgZGlzcGxheTpub25lOycpO1xyXG5cclxuICAgICAgICB0aGlzLmNbM10uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5saXN0ID0gby5saXN0IHx8IFtdO1xyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmJhc2VIID0gdGhpcy5oO1xyXG5cclxuICAgICAgICB0aGlzLml0ZW1IZWlnaHQgPSBvLml0ZW1IZWlnaHQgfHwgKHRoaXMuaC0zKTtcclxuXHJcbiAgICAgICAgLy8gZm9yY2UgZnVsbCBsaXN0IFxyXG4gICAgICAgIHRoaXMuZnVsbCA9IG8uZnVsbCB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5weSA9IDA7XHJcbiAgICAgICAgdGhpcy53dyA9IHRoaXMuc2I7XHJcbiAgICAgICAgdGhpcy5zY3JvbGwgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBsaXN0IHVwIG9yIGRvd25cclxuICAgICAgICB0aGlzLnNpZGUgPSBvLnNpZGUgfHwgJ2Rvd24nO1xyXG4gICAgICAgIHRoaXMudXAgPSB0aGlzLnNpZGUgPT09ICdkb3duJyA/IDAgOiAxO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAgICAgdGhpcy5jWzRdLnN0eWxlLnRvcCA9ICdhdXRvJztcclxuICAgICAgICAgICAgLy90aGlzLmNbNV0uc3R5bGUudG9wID0gJ2F1dG8nO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmJvdHRvbSA9IHRoaXMuaC0yICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzNdLnN0eWxlLmJvdHRvbSA9ICcxcHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUuYm90dG9tID0gZmx0b3AgKyAncHgnO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNbMl0uc3R5bGUudG9wID0gdGhpcy5iYXNlSCArICdweCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxpc3RJbiA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnbGVmdDowOyB0b3A6MDsgd2lkdGg6MTAwJTsgYmFja2dyb3VuZDpyZ2JhKDAsMCwwLDAuMik7Jyk7XHJcbiAgICAgICAgdGhpcy5saXN0SW4ubmFtZSA9ICdsaXN0JztcclxuXHJcbiAgICAgICAgdGhpcy50b3BMaXN0ID0gMDtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmNbMl0uYXBwZW5kQ2hpbGQoIHRoaXMubGlzdEluICk7XHJcbiAgICAgICAgdGhpcy5jWzJdLmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbGVyICk7XHJcblxyXG4gICAgICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgaWYoIWlzTmFOKG8udmFsdWUpKSB0aGlzLnZhbHVlID0gdGhpcy5saXN0WyBvLnZhbHVlIF07XHJcbiAgICAgICAgICAgIGVsc2UgdGhpcy52YWx1ZSA9IG8udmFsdWU7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmxpc3RbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlzT3Blbk9uU3RhcnQgPSBvLm9wZW4gfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmxpc3RPbmx5ICl7XHJcbiAgICAgICAgICAgIHRoaXMuYmFzZUggPSA1O1xyXG4gICAgICAgICAgICB0aGlzLmNbM10uc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICAgICAgdGhpcy5jWzRdLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRoaXMuY1syXS5zdHlsZS50b3AgPSB0aGlzLmJhc2VIKydweCdcclxuICAgICAgICAgICAgdGhpcy5pc09wZW5PblN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICAvL3RoaXMuY1swXS5zdHlsZS5iYWNrZ3JvdW5kID0gJyNGRjAwMDAnXHJcbiAgICAgICAgaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKSB0aGlzLnByZWxvYWRJbWFnZSgpO1xyXG4gICAgICAgLy8gfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gcG9wdWxhdGUgbGlzdFxyXG4gICAgICAgICAgICB0aGlzLnNldExpc3QoIHRoaXMubGlzdCApO1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuT25TdGFydCApIHRoaXMub3BlbiggdHJ1ZSApO1xyXG4gICAgICAgLy8gfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBpbWFnZSBsaXN0XHJcblxyXG4gICAgcHJlbG9hZEltYWdlICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBJbWFnZSA9IHt9O1xyXG4gICAgICAgIGZvciggbGV0IGk9MDsgaTx0aGlzLmxpc3QubGVuZ3RoOyBpKysgKSB0aGlzLnRtcFVybC5wdXNoKCB0aGlzLmxpc3RbaV0gKTtcclxuICAgICAgICB0aGlzLmxvYWRPbmUoKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBuZXh0SW1nICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy50bXBVcmwuc2hpZnQoKTtcclxuICAgICAgICBpZiggdGhpcy50bXBVcmwubGVuZ3RoID09PSAwICl7IFxyXG5cclxuICAgICAgICAgICAgdGhpcy5wcmVMb2FkQ29tcGxldGUgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRJbWFnZXMoKTtcclxuICAgICAgICAgICAgLyp0aGlzLnNldExpc3QoIHRoaXMubGlzdCApO1xyXG4gICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNPcGVuT25TdGFydCApIHRoaXMub3BlbigpOyovXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHRoaXMubG9hZE9uZSgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBsb2FkT25lKCl7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpc1xyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50bXBVcmxbMF07XHJcbiAgICAgICAgbGV0IGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgICAgIGltZy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlOyB3aWR0aDonK3NlbGYuaW1hZ2VTaXplWzBdKydweDsgaGVpZ2h0Oicrc2VsZi5pbWFnZVNpemVbMV0rJ3B4JztcclxuICAgICAgICBpbWcuc2V0QXR0cmlidXRlKCdzcmMnLCB0aGlzLnBhdGggKyBuYW1lICsgdGhpcy5mb3JtYXQgKTtcclxuXHJcbiAgICAgICAgaW1nLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuaW1hZ2VTaXplWzJdID0gaW1nLndpZHRoO1xyXG4gICAgICAgICAgICBzZWxmLmltYWdlU2l6ZVszXSA9IGltZy5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHNlbGYudG1wSW1hZ2VbbmFtZV0gPSBpbWc7XHJcbiAgICAgICAgICAgIHNlbGYubmV4dEltZygpO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy9cclxuXHJcbiAgICB0ZXN0Wm9uZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBsID0gdGhpcy5sb2NhbDtcclxuICAgICAgICBpZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICkgcmV0dXJuICcnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCAmJiB0aGlzLmlzT3BlbiApe1xyXG4gICAgICAgICAgICBpZiggbC55ID4gdGhpcy5oIC0gdGhpcy5iYXNlSCApIHJldHVybiAndGl0bGUnO1xyXG4gICAgICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuc2Nyb2xsICYmICggbC54ID4gKHRoaXMuc2ErdGhpcy5zYi0yMCkpICkgcmV0dXJuICdzY3JvbGwnO1xyXG4gICAgICAgICAgICAgICAgaWYobC54ID4gdGhpcy5zYSkgcmV0dXJuIHRoaXMudGVzdEl0ZW1zKCBsLnktdGhpcy5iYXNlSCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCBsLnkgPCB0aGlzLmJhc2VIKzIgKSByZXR1cm4gJ3RpdGxlJztcclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLmlzT3BlbiApe1xyXG4gICAgICAgICAgICAgICAgICAgIGlmKCB0aGlzLnNjcm9sbCAmJiAoIGwueCA+ICh0aGlzLnNhK3RoaXMuc2ItMjApKSApIHJldHVybiAnc2Nyb2xsJztcclxuICAgICAgICAgICAgICAgICAgICBpZihsLnggPiB0aGlzLnNhKSByZXR1cm4gdGhpcy50ZXN0SXRlbXMoIGwueS10aGlzLmJhc2VIICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gJyc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3RJdGVtcyAoIHkgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5pdGVtcy5sZW5ndGgsIGl0ZW0sIGEsIGI7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgaXRlbSA9IHRoaXMuaXRlbXNbaV07XHJcbiAgICAgICAgICAgIGEgPSBpdGVtLnBvc3kgKyB0aGlzLnRvcExpc3Q7XHJcbiAgICAgICAgICAgIGIgPSBpdGVtLnBvc3kgKyB0aGlzLml0ZW1IZWlnaHQgKyAxICsgdGhpcy50b3BMaXN0O1xyXG4gICAgICAgICAgICBpZiggeSA+PSBhICYmIHkgPD0gYiApeyBcclxuICAgICAgICAgICAgICAgIG5hbWUgPSAnaXRlbScgKyBpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51blNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBpdGVtO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5hbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbmFtZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdW5TZWxlY3RlZCAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmJhY2tncm91bmQgPSAncmdiYSgwLDAsMCwwLjIpJztcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RlZCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG4gICAgICAgIHRoaXMuY3VycmVudC5zdHlsZS5jb2xvciA9ICcjRkZGJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZXVwICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdzY3JvbGwnICl7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiggbmFtZSA9PT0gJ3RpdGxlJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb2RlVGl0bGUoMik7XHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5saXN0T25seSApe1xyXG4gICAgICAgICAgICAgICAgaWYoICF0aGlzLmlzT3BlbiApIHRoaXMub3BlbigpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiggdGhpcy5jdXJyZW50ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5saXN0W3RoaXMuY3VycmVudC5pZF1cclxuICAgICAgICAgICAgICAgIC8vdGhpcy52YWx1ZSA9IHRoaXMuY3VycmVudC50ZXh0Q29udGVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgICAgICAgICAgICAgaWYoICF0aGlzLmxpc3RPbmx5ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFRvcEl0ZW0oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBudXA7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGl0bGUnICl7XHJcbiAgICAgICAgICAgIHRoaXMudW5TZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgxKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3MtcmVzaXplJyk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZVNjcm9sbCgxKTtcclxuICAgICAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVTY3JvbGwoMik7XHJcbiAgICAgICAgICAgICAgICBsZXQgdG9wID0gdGhpcy56b25lLnkrdGhpcy5iYXNlSC0yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUoICggZS5jbGllbnRZIC0gdG9wICApIC0gKCB0aGlzLnNoKjAuNSApICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9pZih0aGlzLmlzRG93bikgdGhpcy5saXN0bW92ZShlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gaXMgaXRlbVxyXG4gICAgICAgICAgICB0aGlzLm1vZGVUaXRsZSgwKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlU2Nyb2xsKDApO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5hbWUgIT09IHRoaXMucHJldk5hbWUgKSBudXAgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucHJldk5hbWUgPSBuYW1lO1xyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB3aGVlbCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBuYW1lID0gdGhpcy50ZXN0Wm9uZSggZSApO1xyXG4gICAgICAgIGlmKCBuYW1lID09PSAndGl0bGUnICkgcmV0dXJuIGZhbHNlOyBcclxuICAgICAgICB0aGlzLnB5ICs9IGUuZGVsdGEqMTA7XHJcbiAgICAgICAgdGhpcy51cGRhdGUodGhpcy5weSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5wcmV2TmFtZSA9ICcnO1xyXG4gICAgICAgIHRoaXMudW5TZWxlY3RlZCgpO1xyXG4gICAgICAgIHRoaXMubW9kZVRpdGxlKDApO1xyXG4gICAgICAgIHRoaXMubW9kZVNjcm9sbCgwKTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb2RlU2Nyb2xsICggbW9kZSApIHtcclxuXHJcbiAgICAgICAgaWYoIG1vZGUgPT09IHRoaXMuc01vZGUgKSByZXR1cm47XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IC8vIGVkaXQgLyBkb3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5kb3duO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNNb2RlID0gbW9kZTtcclxuICAgIH1cclxuXHJcbiAgICBtb2RlVGl0bGUgKCBtb2RlICkge1xyXG5cclxuICAgICAgICBpZiggbW9kZSA9PT0gdGhpcy50TW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHN3aXRjaChtb2RlKXtcclxuICAgICAgICAgICAgY2FzZSAwOiAvLyBiYXNlXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBzWzNdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOiAvLyBvdmVyXHJcbiAgICAgICAgICAgICAgICBzWzNdLmNvbG9yID0gJyNGRkYnO1xyXG4gICAgICAgICAgICAgICAgc1szXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOiAvLyBlZGl0IC8gZG93blxyXG4gICAgICAgICAgICAgICAgc1szXS5jb2xvciA9IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICAgICAgc1szXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuZG93bjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50TW9kZSA9IG1vZGU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyTGlzdCAoKSB7XHJcblxyXG4gICAgICAgIHdoaWxlICggdGhpcy5saXN0SW4uY2hpbGRyZW4ubGVuZ3RoICkgdGhpcy5saXN0SW4ucmVtb3ZlQ2hpbGQoIHRoaXMubGlzdEluLmxhc3RDaGlsZCApO1xyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0TGlzdCAoIGxpc3QgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJMaXN0KCk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdCA9IGxpc3Q7XHJcbiAgICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLmxpc3QubGVuZ3RoO1xyXG5cclxuICAgICAgICB0aGlzLm1heEl0ZW0gPSB0aGlzLmZ1bGwgPyB0aGlzLmxlbmd0aCA6IDU7XHJcbiAgICAgICAgdGhpcy5tYXhJdGVtID0gdGhpcy5sZW5ndGggPCB0aGlzLm1heEl0ZW0gPyB0aGlzLmxlbmd0aCA6IHRoaXMubWF4SXRlbTtcclxuXHJcbiAgICAgICAgdGhpcy5tYXhIZWlnaHQgPSB0aGlzLm1heEl0ZW0gKiAodGhpcy5pdGVtSGVpZ2h0KzEpICsgMjtcclxuXHJcbiAgICAgICAgdGhpcy5tYXggPSB0aGlzLmxlbmd0aCAqICh0aGlzLml0ZW1IZWlnaHQrMSkgKyAyO1xyXG4gICAgICAgIHRoaXMucmF0aW8gPSB0aGlzLm1heEhlaWdodCAvIHRoaXMubWF4O1xyXG4gICAgICAgIHRoaXMuc2ggPSB0aGlzLm1heEhlaWdodCAqIHRoaXMucmF0aW87XHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4SGVpZ2h0IC0gdGhpcy5zaDtcclxuXHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9IHRoaXMubWF4SGVpZ2h0ICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmhlaWdodCA9IHRoaXMuc2ggKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5tYXggPiB0aGlzLm1heEhlaWdodCApeyBcclxuICAgICAgICAgICAgdGhpcy53dyA9IHRoaXMuc2IgLSAyMDtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGl0ZW0sIG47Ly8sIGwgPSB0aGlzLnNiO1xyXG4gICAgICAgIGZvciggbGV0IGk9MDsgaTx0aGlzLmxlbmd0aDsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBuID0gdGhpcy5saXN0W2ldO1xyXG4gICAgICAgICAgICBpdGVtID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5pdGVtICsgJ3dpZHRoOicrdGhpcy53dysncHg7IGhlaWdodDonK3RoaXMuaXRlbUhlaWdodCsncHg7IGxpbmUtaGVpZ2h0OicrKHRoaXMuaXRlbUhlaWdodC01KSsncHg7IGNvbG9yOicrdGhpcy5mb250Q29sb3IrJzsnICk7XHJcbiAgICAgICAgICAgIGl0ZW0ubmFtZSA9ICdpdGVtJytpO1xyXG4gICAgICAgICAgICBpdGVtLmlkID0gaTtcclxuICAgICAgICAgICAgaXRlbS5wb3N5ID0gKHRoaXMuaXRlbUhlaWdodCsxKSppO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RJbi5hcHBlbmRDaGlsZCggaXRlbSApO1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2goIGl0ZW0gKTtcclxuXHJcbiAgICAgICAgICAgIC8vaWYoIHRoaXMuaXNXaXRoSW1hZ2UgKSBpdGVtLmFwcGVuZENoaWxkKCB0aGlzLnRtcEltYWdlW25dICk7XHJcbiAgICAgICAgICAgIGlmKCAhdGhpcy5pc1dpdGhJbWFnZSApIGl0ZW0udGV4dENvbnRlbnQgPSBuO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIGFkZEltYWdlcyAoKXtcclxuICAgICAgICBsZXQgbG5nID0gdGhpcy5saXN0Lmxlbmd0aDtcclxuICAgICAgICBmb3IoIGxldCBpPTA7IGk8bG5nOyBpKysgKXtcclxuICAgICAgICAgICAgdGhpcy5pdGVtc1tpXS5hcHBlbmRDaGlsZCggdGhpcy50bXBJbWFnZVt0aGlzLmxpc3RbaV1dICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0VG9wSXRlbSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRvcEl0ZW0gKCl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzV2l0aEltYWdlICl7IFxyXG5cclxuICAgICAgICAgICAgaWYoICF0aGlzLnByZUxvYWRDb21wbGV0ZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmKCF0aGlzLmNbM10uY2hpbGRyZW4ubGVuZ3RoKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1hZ2VTaXplWzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWFnZVNpemVbMV07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhcy5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlOyB0b3A6MHB4OyBsZWZ0OjBweDsnXHJcbiAgICAgICAgICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1szXS5hcHBlbmRDaGlsZCggdGhpcy5jYW52YXMgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltZyA9IHRoaXMudG1wSW1hZ2VbIHRoaXMudmFsdWUgXTtcclxuICAgICAgICAgICAgdGhpcy5jdHguZHJhd0ltYWdlKCB0aGlzLnRtcEltYWdlWyB0aGlzLnZhbHVlIF0sIDAsIDAsIHRoaXMuaW1hZ2VTaXplWzJdLCB0aGlzLmltYWdlU2l6ZVszXSwgMCwwLCB0aGlzLmltYWdlU2l6ZVswXSwgdGhpcy5pbWFnZVNpemVbMV0gKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgdGhpcy5jWzNdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tIExJU1RcclxuXHJcbiAgICB1cGRhdGUgKCB5ICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuc2Nyb2xsICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB5ID0geSA8IDAgPyAwIDogeTtcclxuICAgICAgICB5ID0geSA+IHRoaXMucmFuZ2UgPyB0aGlzLnJhbmdlIDogeTtcclxuXHJcbiAgICAgICAgdGhpcy50b3BMaXN0ID0gLU1hdGguZmxvb3IoIHkgLyB0aGlzLnJhdGlvICk7XHJcblxyXG4gICAgICAgIHRoaXMubGlzdEluLnN0eWxlLnRvcCA9IHRoaXMudG9wTGlzdCsncHgnO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUudG9wID0gTWF0aC5mbG9vciggeSApICArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMucHkgPSB5O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwYXJlbnRIZWlnaHQgKCB0ICkge1xyXG5cclxuICAgICAgICBpZiAoIHRoaXMuZ3JvdXAgIT09IG51bGwgKSB0aGlzLmdyb3VwLmNhbGMoIHQgKTtcclxuICAgICAgICBlbHNlIGlmICggdGhpcy5pc1VJICkgdGhpcy5tYWluLmNhbGMoIHQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgb3BlbiAoIGZpcnN0ICkge1xyXG5cclxuICAgICAgICBzdXBlci5vcGVuKCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlKCAwICk7XHJcbiAgICAgICAgdGhpcy5oID0gdGhpcy5tYXhIZWlnaHQgKyB0aGlzLmJhc2VIICsgNTtcclxuICAgICAgICBpZiggIXRoaXMuc2Nyb2xsICl7XHJcbiAgICAgICAgICAgIHRoaXMudG9wTGlzdCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuaCA9IHRoaXMuYmFzZUggKyA1ICsgdGhpcy5tYXg7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsZXIuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbGVyLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNbMF0uaGVpZ2h0ID0gdGhpcy5oICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0uZGlzcGxheSA9ICdibG9jayc7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnVwICl7IFxyXG4gICAgICAgICAgICB0aGlzLnpvbmUueSAtPSB0aGlzLmggLSAodGhpcy5iYXNlSC0xMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93VXAgKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldFN2ZyggdGhpcy5jWzRdLCAnZCcsIHRoaXMuc3Zncy5hcnJvd0Rvd24gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuclNpemVDb250ZW50KCk7XHJcblxyXG4gICAgICAgIGxldCB0ID0gdGhpcy5oIC0gdGhpcy5iYXNlSDtcclxuXHJcbiAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLmg7XHJcblxyXG4gICAgICAgIGlmKCFmaXJzdCkgdGhpcy5wYXJlbnRIZWlnaHQoIHQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5jbG9zZSgpO1xyXG5cclxuICAgICAgICBpZiggdGhpcy51cCApIHRoaXMuem9uZS55ICs9IHRoaXMuaCAtICh0aGlzLmJhc2VILTEwKTtcclxuXHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLmggLSB0aGlzLmJhc2VIO1xyXG5cclxuICAgICAgICB0aGlzLmggPSB0aGlzLmJhc2VIO1xyXG4gICAgICAgIHRoaXMuc1swXS5oZWlnaHQgPSB0aGlzLmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gICAgICAgIHRoaXMuc2V0U3ZnKCB0aGlzLmNbNF0sICdkJywgdGhpcy5zdmdzLmFycm93ICk7XHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oO1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudEhlaWdodCggLXQgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS1cclxuXHJcbiAgICB0ZXh0ICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplQ29udGVudCAoKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKSB0aGlzLmxpc3RJbi5jaGlsZHJlbltpXS5zdHlsZS53aWR0aCA9IHRoaXMud3cgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIFByb3RvLnByb3RvdHlwZS5yU2l6ZS5jYWxsKCB0aGlzICk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy5zYjtcclxuICAgICAgICBsZXQgZCA9IHRoaXMuc2E7XHJcblxyXG4gICAgICAgIGlmKHNbMl09PT0gdW5kZWZpbmVkKSByZXR1cm47XHJcblxyXG4gICAgICAgIHNbMl0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSBkICsncHgnO1xyXG5cclxuICAgICAgICBzWzNdLndpZHRoID0gdyArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gZCArICdweCc7XHJcblxyXG4gICAgICAgIHNbNF0ubGVmdCA9IGQgKyB3IC0gMTcgKyAncHgnO1xyXG5cclxuICAgICAgICB0aGlzLnd3ID0gdztcclxuICAgICAgICBpZiggdGhpcy5tYXggPiB0aGlzLm1heEhlaWdodCApIHRoaXMud3cgPSB3LTIwO1xyXG4gICAgICAgIGlmKHRoaXMuaXNPcGVuKSB0aGlzLnJTaXplQ29udGVudCgpO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4uL2NvcmUvVG9vbHMnO1xyXG5cclxuZXhwb3J0IGNsYXNzIE51bWVyaWMgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMuYWxsd2F5ID0gby5hbGx3YXkgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBbMF07XHJcbiAgICAgICAgdGhpcy5tdWx0eSA9IDE7XHJcbiAgICAgICAgdGhpcy5pbnZtdWx0eSA9IDE7XHJcbiAgICAgICAgdGhpcy5pc1NpbmdsZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pc0FuZ2xlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pc1ZlY3RvciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggby5pc0FuZ2xlICl7XHJcbiAgICAgICAgICAgIHRoaXMuaXNBbmdsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMubXVsdHkgPSBUb29scy50b3JhZDtcclxuICAgICAgICAgICAgdGhpcy5pbnZtdWx0eSA9IFRvb2xzLnRvZGVnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc0RyYWcgPSBvLmRyYWcgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCBvLnZhbHVlICE9PSB1bmRlZmluZWQgKXtcclxuICAgICAgICAgICAgaWYoIWlzTmFOKG8udmFsdWUpKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gW28udmFsdWVdO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoIG8udmFsdWUgaW5zdGFuY2VvZiBBcnJheSApeyBcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlOyBcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTaW5nbGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmKCBvLnZhbHVlIGluc3RhbmNlb2YgT2JqZWN0ICl7IFxyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUueCAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVswXSA9IG8udmFsdWUueDtcclxuICAgICAgICAgICAgICAgIGlmKCBvLnZhbHVlLnkgIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMV0gPSBvLnZhbHVlLnk7XHJcbiAgICAgICAgICAgICAgICBpZiggby52YWx1ZS56ICE9PSB1bmRlZmluZWQgKSB0aGlzLnZhbHVlWzJdID0gby52YWx1ZS56O1xyXG4gICAgICAgICAgICAgICAgaWYoIG8udmFsdWUudyAhPT0gdW5kZWZpbmVkICkgdGhpcy52YWx1ZVszXSA9IG8udmFsdWUudztcclxuICAgICAgICAgICAgICAgIHRoaXMuaXNWZWN0b3IgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc1NpbmdsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMudG1wID0gW107XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSAtMTtcclxuICAgICAgICB0aGlzLnByZXYgPSB7IHg6MCwgeTowLCBkOjAsIHY6MCB9O1xyXG5cclxuICAgICAgICAvLyBiZ1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLnNlbGVjdCArICc7IHRvcDo0cHg7IHdpZHRoOjBweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jTW9kZSA9IFtdO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuXHJcbiAgICAgICAgICAgIGlmKHRoaXMuaXNBbmdsZSkgdGhpcy52YWx1ZVtpXSA9ICh0aGlzLnZhbHVlW2ldICogMTgwIC8gTWF0aC5QSSkudG9GaXhlZCggdGhpcy5wcmVjaXNpb24gKTtcclxuICAgICAgICAgICAgdGhpcy5jWzMraV0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICcgaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7IGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLmlucHV0QmcgKyAnOyBib3JkZXJDb2xvcjonICsgdGhpcy5jb2xvcnMuaW5wdXRCb3JkZXIrJzsgYm9yZGVyLXJhZGl1czonK3RoaXMucmFkaXVzKydweDsnKTtcclxuICAgICAgICAgICAgaWYoby5jZW50ZXIpIHRoaXMuY1syK2ldLnN0eWxlLnRleHRBbGlnbiA9ICdjZW50ZXInO1xyXG4gICAgICAgICAgICB0aGlzLmNbMytpXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbaV07XHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuY1szK2ldLmlzTnVtID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY01vZGVbaV0gPSAwO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGN1cnNvclxyXG4gICAgICAgIHRoaXMuY3Vyc29ySWQgPSAzICsgdGhpcy5sbmc7XHJcbiAgICAgICAgdGhpcy5jWyB0aGlzLmN1cnNvcklkIF0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3RvcDo0cHg7IGhlaWdodDonICsgKHRoaXMuaC04KSArICdweDsgd2lkdGg6MHB4OyBiYWNrZ3JvdW5kOicrdGhpcy5mb250Q29sb3IrJzsnICk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAnJztcclxuXHJcbiAgICB9XHJcblxyXG4gICAvKiBtb2RlOiBmdW5jdGlvbiAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGlmKCBuID09PSB0aGlzLmNNb2RlW25hbWVdICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICAvL2xldCBtO1xyXG5cclxuICAgICAgICAvKnN3aXRjaChuKXtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgMDogbSA9IHRoaXMuY29sb3JzLmJvcmRlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTogbSA9IHRoaXMuY29sb3JzLmJvcmRlck92ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6IG0gPSB0aGlzLmNvbG9ycy5ib3JkZXJTZWxlY3Q7ICBicmVhaztcclxuXHJcbiAgICAgICAgfSovXHJcblxyXG4gICAvKiAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIC8vdGhpcy5jW25hbWUrMl0uc3R5bGUuYm9yZGVyQ29sb3IgPSBtO1xyXG4gICAgICAgIHRoaXMuY01vZGVbbmFtZV0gPSBuO1xyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICB9LCovXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBFVkVOVFNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmKCBuYW1lICE9PSAnJyApeyBcclxuICAgICAgICAgICAgXHR0aGlzLmN1cnJlbnQgPSBuYW1lO1xyXG4gICAgICAgICAgICBcdHRoaXMucHJldiA9IHsgeDplLmNsaWVudFgsIHk6ZS5jbGllbnRZLCBkOjAsIHY6IHRoaXMuaXNTaW5nbGUgPyBwYXJzZUZsb2F0KHRoaXMudmFsdWUpIDogcGFyc2VGbG9hdCggdGhpcy52YWx1ZVsgdGhpcy5jdXJyZW50IF0gKSAgfTtcclxuICAgICAgICAgICAgXHR0aGlzLnNldElucHV0KCB0aGlzLmNbIDMgKyB0aGlzLmN1cnJlbnQgXSApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIC8qXHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnJyApIHJldHVybiBmYWxzZTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLnByZXYgPSB7IHg6ZS5jbGllbnRYLCB5OmUuY2xpZW50WSwgZDowLCB2OiB0aGlzLmlzU2luZ2xlID8gcGFyc2VGbG9hdCh0aGlzLnZhbHVlKSA6IHBhcnNlRmxvYXQoIHRoaXMudmFsdWVbIHRoaXMuY3VycmVudCBdICkgIH07XHJcblxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKCAyLCBuYW1lICk7Ki9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgXHRpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgICAgIHRoaXMucHJldiA9IHsgeDowLCB5OjAsIGQ6MCwgdjowIH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgLypsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApeyBcclxuXHJcbiAgICAgICAgICAgIC8vbGV0IHRtID0gdGhpcy5jdXJyZW50O1xyXG4gICAgICAgICAgICBsZXQgdGQgPSB0aGlzLnByZXYuZDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLnByZXYgPSB7IHg6MCwgeTowLCBkOjAsIHY6MCB9O1xyXG5cclxuICAgICAgICAgICAgaWYoICF0ZCApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW5wdXQoIHRoaXMuY1sgMyArIG5hbWUgXSApO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7Ly90aGlzLm1vZGUoIDIsIG5hbWUgKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNldCgpOy8vdGhpcy5tb2RlKCAwLCB0bSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0qL1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbnVwID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IHggPSAwO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICcnICkgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICBlbHNleyBcclxuICAgICAgICBcdGlmKCF0aGlzLmlzRHJhZykgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICBcdGVsc2UgdGhpcy5jdXJzb3IoIHRoaXMuY3VycmVudCAhPT0gLTEgPyAnbW92ZScgOiAncG9pbnRlcicgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0RyYWcgKXtcclxuXHJcbiAgICAgICAgXHRpZiggdGhpcy5jdXJyZW50ICE9PSAtMSApe1xyXG5cclxuICAgICAgICAgICAgXHR0aGlzLnByZXYuZCArPSAoIGUuY2xpZW50WCAtIHRoaXMucHJldi54ICkgLSAoIGUuY2xpZW50WSAtIHRoaXMucHJldi55ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG4gPSB0aGlzLnByZXYudiArICggdGhpcy5wcmV2LmQgKiB0aGlzLnN0ZXApO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWVbIHRoaXMuY3VycmVudCBdID0gdGhpcy5udW1WYWx1ZShuKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sgMyArIHRoaXMuY3VycmVudCBdLnRleHRDb250ZW50ID0gdGhpcy52YWx1ZVt0aGlzLmN1cnJlbnRdO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmFsaWRhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnByZXYueCA9IGUuY2xpZW50WDtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldi55ID0gZS5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgICAgIG51cCA9IHRydWU7XHJcbiAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIFx0aWYoIHRoaXMuaXNEb3duICkgeCA9IGUuY2xpZW50WCAtIHRoaXMuem9uZS54IC0zO1xyXG4gICAgICAgIFx0aWYoIHRoaXMuY3VycmVudCAhPT0gLTEgKSB4IC09IHRoaXMudG1wW3RoaXMuY3VycmVudF1bMF1cclxuICAgICAgICBcdHJldHVybiB0aGlzLnVwSW5wdXQoIHgsIHRoaXMuaXNEb3duICk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcblxyXG5cclxuICAgICAgICByZXR1cm4gbnVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL2tleWRvd246IGZ1bmN0aW9uICggZSApIHsgcmV0dXJuIHRydWU7IH0sXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IG51cCA9IGZhbHNlO1xyXG4gICAgICAgIC8vdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy90aGlzLmN1cnJlbnQgPSAwO1xyXG5cclxuICAgICAgIC8qIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgd2hpbGUoaS0tKXsgXHJcbiAgICAgICAgICAgIGlmKHRoaXMuY01vZGVbaV0hPT0wKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuY01vZGVbaV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgLy90aGlzLmNbMitpXS5zdHlsZS5ib3JkZXJDb2xvciA9IHRoaXMuY29sb3JzLmJvcmRlcjtcclxuICAgICAgICAgICAgICAgIG51cCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgcmV0dXJuIG51cDtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHNldFZhbHVlICggdiApIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNWZWN0b3IgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCB2LnggIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMF0gPSB2Lng7XHJcbiAgICAgICAgICAgIGlmKCB2LnkgIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMV0gPSB2Lnk7XHJcbiAgICAgICAgICAgIGlmKCB2LnogIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbMl0gPSB2Lno7XHJcbiAgICAgICAgICAgIGlmKCB2LncgIT09IHVuZGVmaW5lZCApIHRoaXMudmFsdWVbM10gPSB2Lnc7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgLy9sZXQgaSA9IHRoaXMudmFsdWUubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKm4gPSBuIHx8IDA7XHJcbiAgICAgICAgdGhpcy52YWx1ZVtuXSA9IHRoaXMubnVtVmFsdWUoIHYgKTtcclxuICAgICAgICB0aGlzLmNbIDMgKyBuIF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW25dOyovXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNhbWVTdHIgKCBzdHIgKXtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnZhbHVlLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IHN0cjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICggdXAgKSB7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy52YWx1ZS5sZW5ndGg7XHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgICAgICB0aGlzLnZhbHVlW2ldID0gdGhpcy5udW1WYWx1ZSggdGhpcy52YWx1ZVtpXSAqIHRoaXMuaW52bXVsdHkgKTtcclxuICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWVbaV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VuZCAoIHYgKSB7XHJcblxyXG4gICAgICAgIHYgPSB2IHx8IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIHRoaXMuaXNTZW5kID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMub2JqZWN0TGluayAhPT0gbnVsbCApeyBcclxuXHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmlzVmVjdG9yICl7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdLmZyb21BcnJheSggdiApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8qdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdLnggPSB2WzBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdLnkgPSB2WzFdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vYmplY3RMaW5rWyB0aGlzLnZhbCBdLnogPSB2WzJdO1xyXG4gICAgICAgICAgICAgICAgaWYoIHZbM10gKSB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0udyA9IHZbM107Ki9cclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdExpbmtbIHRoaXMudmFsIF0gPSB2O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIHRoaXMuY2FsbGJhY2sgKSB0aGlzLmNhbGxiYWNrKCB2LCB0aGlzLnZhbCApO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VuZCA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJTlBVVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNlbGVjdCAoIGMsIGUsIHcgKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5jdXJyZW50ICE9PSAtMSA/IHRoaXMudG1wW3RoaXMuY3VycmVudF1bMF0gKyA1IDogMDtcclxuICAgICAgICBzW3RoaXMuY3Vyc29ySWRdLndpZHRoID0gJzFweCc7XHJcbiAgICAgICAgc1t0aGlzLmN1cnNvcklkXS5sZWZ0ID0gKCBkICsgYyApICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSAoIGQgKyBlICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHVuc2VsZWN0ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgaWYoIXMpIHJldHVybjtcclxuICAgICAgICBzWzJdLndpZHRoID0gMCArICdweCc7XHJcbiAgICAgICAgc1t0aGlzLmN1cnNvcklkXS53aWR0aCA9IDAgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZSAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBsZXQgYXIgPSBbXTtcclxuICAgICAgICBsZXQgaSA9IHRoaXMubG5nO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5hbGx3YXkgKSBmb3JjZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcbiAgICAgICAgXHRpZighaXNOYU4oIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCApKXsgXHJcbiAgICAgICAgICAgICAgICBsZXQgbnggPSB0aGlzLm51bVZhbHVlKCB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY1sgMyArIGkgXS50ZXh0Q29udGVudCA9IG54O1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZVtpXSA9IG54O1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBub3QgbnVtYmVyXHJcbiAgICAgICAgICAgICAgICB0aGlzLmNbIDMgKyBpIF0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlW2ldO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIFx0YXJbaV0gPSB0aGlzLnZhbHVlW2ldICogdGhpcy5tdWx0eTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCAhZm9yY2UgKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2luZ2xlICkgdGhpcy5zZW5kKCBhclswXSApO1xyXG4gICAgICAgIGVsc2UgdGhpcy5zZW5kKCBhciApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFJFWklTRVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHcgPSBNYXRoLmZsb29yKCAoIHRoaXMuc2IgKyA1ICkgLyB0aGlzLmxuZyApLTU7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICB3aGlsZShpLS0pe1xyXG4gICAgICAgICAgICB0aGlzLnRtcFtpXSA9IFsgTWF0aC5mbG9vciggdGhpcy5zYSArICggdyAqIGkgKSsoIDUgKiBpICkpLCB3IF07XHJcbiAgICAgICAgICAgIHRoaXMudG1wW2ldWzJdID0gdGhpcy50bXBbaV1bMF0gKyB0aGlzLnRtcFtpXVsxXTtcclxuICAgICAgICAgICAgc1sgMyArIGkgXS5sZWZ0ID0gdGhpcy50bXBbaV1bMF0gKyAncHgnO1xyXG4gICAgICAgICAgICBzWyAzICsgaSBdLndpZHRoID0gdGhpcy50bXBbaV1bMV0gKyAncHgnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcblxyXG5leHBvcnQgY2xhc3MgU2xpZGUgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRUeXBlTnVtYmVyKCBvICk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLm1vZGVsID0gby5zdHlwZSB8fCAwO1xyXG4gICAgICAgIGlmKCBvLm1vZGUgIT09IHVuZGVmaW5lZCApIHRoaXMubW9kZWwgPSBvLm1vZGU7XHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuXHJcbiAgICAgICAgdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IgPSB0aGlzLmNvbG9ycy5oaWRlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNPdmVyID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hbGx3YXkgPSBvLmFsbHdheSB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pc0RlZyA9IG8uaXNEZWcgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuZmlyc3RJbXB1dCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2xldHRlci1zcGFjaW5nOi0xcHg7IHRleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IrJzsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ3RleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGJvcmRlcjoxcHggZGFzaGVkICcrdGhpcy5kZWZhdWx0Qm9yZGVyQ29sb3IrJzsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ2RpdicsIHRoaXMuY3NzLnR4dHNlbGVjdCArICdib3JkZXI6bm9uZTsgd2lkdGg6NDdweDsgY29sb3I6JysgdGhpcy5mb250Q29sb3IgKTtcclxuICAgICAgICAvL3RoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2xldHRlci1zcGFjaW5nOi0xcHg7IHRleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjQ3cHg7IGNvbG9yOicrIHRoaXMuZm9udENvbG9yICk7XHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy5iYXNpYyArICcgdG9wOjA7IGhlaWdodDonK3RoaXMuaCsncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYmFja2dyb3VuZDonK3RoaXMuY29sb3JzLnNjcm9sbGJhY2srJzsgdG9wOjJweDsgaGVpZ2h0OicrKHRoaXMuaC00KSsncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1s1XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnbGVmdDo0cHg7IHRvcDo1cHg7IGhlaWdodDonKyh0aGlzLmgtMTApKydweDsgYmFja2dyb3VuZDonICsgdGhpcy5mb250Q29sb3IgKyc7JyApO1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0uaXNOdW0gPSB0cnVlO1xyXG4gICAgICAgIC8vdGhpcy5jWzJdLnN0eWxlLmhlaWdodCA9ICh0aGlzLmgtNCkgKyAncHgnO1xyXG4gICAgICAgIC8vdGhpcy5jWzJdLnN0eWxlLmxpbmVIZWlnaHQgPSAodGhpcy5oLTgpICsgJ3B4JztcclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuaGVpZ2h0ID0gKHRoaXMuaC0yKSArICdweCc7XHJcbiAgICAgICAgdGhpcy5jWzJdLnN0eWxlLmxpbmVIZWlnaHQgPSAodGhpcy5oLTEwKSArICdweCc7XHJcblxyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgIT09IDApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGgxID0gNCwgaDIgPSA4LCB3dyA9IHRoaXMuaC00LCByYSA9IDIwO1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMubW9kZWwgPT09IDIgKXtcclxuICAgICAgICAgICAgICAgIGgxID0gNDsvLzJcclxuICAgICAgICAgICAgICAgIGgyID0gODtcclxuICAgICAgICAgICAgICAgIHJhID0gMjtcclxuICAgICAgICAgICAgICAgIHd3ID0gKHRoaXMuaC00KSowLjVcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYodGhpcy5tb2RlbCA9PT0gMykgdGhpcy5jWzVdLnN0eWxlLnZpc2libGUgPSAnbm9uZSc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUuYm9yZGVyUmFkaXVzID0gaDEgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUuaGVpZ2h0ID0gaDIgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNF0uc3R5bGUudG9wID0gKHRoaXMuaCowLjUpIC0gaDEgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNV0uc3R5bGUuYm9yZGVyUmFkaXVzID0gKGgxKjAuNSkgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNV0uc3R5bGUuaGVpZ2h0ID0gaDEgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmNbNV0uc3R5bGUudG9wID0gKHRoaXMuaCowLjUpLShoMSowLjUpICsgJ3B4JztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1s2XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnYm9yZGVyLXJhZGl1czonK3JhKydweDsgbWFyZ2luLWxlZnQ6JysoLXd3KjAuNSkrJ3B4OyBib3JkZXI6MXB4IHNvbGlkICcrdGhpcy5jb2xvcnMuYm9yZGVyKyc7IGJhY2tncm91bmQ6Jyt0aGlzLmJ1dHRvbkNvbG9yKyc7IGxlZnQ6NHB4OyB0b3A6MnB4OyBoZWlnaHQ6JysodGhpcy5oLTQpKydweDsgd2lkdGg6Jyt3dysncHg7JyApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIGwueCA+PSB0aGlzLnR4bCApIHJldHVybiAndGV4dCc7XHJcbiAgICAgICAgZWxzZSBpZiggbC54ID49IHRoaXMuc2EgKSByZXR1cm4gJ3Njcm9sbCc7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gJyc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICkgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3Njcm9sbCcgKXsgXHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5vbGQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qaWYoIG5hbWUgPT09ICd0ZXh0JyApe1xyXG4gICAgICAgICAgICB0aGlzLnNldElucHV0KCB0aGlzLmNbMl0sIGZ1bmN0aW9uKCl7IHRoaXMudmFsaWRhdGUoKSB9LmJpbmQodGhpcykgKTtcclxuICAgICAgICB9Ki9cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBudXAgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnc2Nyb2xsJyApIHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigndy1yZXNpemUnKTtcclxuICAgICAgICAvL30gZWxzZSBpZihuYW1lID09PSAndGV4dCcpeyBcclxuICAgICAgICAgICAgLy90aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuXHJcbiAgICAgICAgICAgIGxldCBuID0gKCgoIGUuY2xpZW50WCAtICh0aGlzLnpvbmUueCt0aGlzLnNhKSAtIDMgKSAvIHRoaXMud3cgKSAqIHRoaXMucmFuZ2UgKyB0aGlzLm1pbiApIC0gdGhpcy5vbGQ7XHJcbiAgICAgICAgICAgIGlmKG4gPj0gdGhpcy5zdGVwIHx8IG4gPD0gdGhpcy5zdGVwKXsgXHJcbiAgICAgICAgICAgICAgICBuID0gTWF0aC5mbG9vciggbiAvIHRoaXMuc3RlcCApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMubnVtVmFsdWUoIHRoaXMub2xkICsgKCBuICogdGhpcy5zdGVwICkgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlKCB0cnVlICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9sZCA9IHRoaXMudmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbnVwID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBudXA7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8va2V5ZG93bjogZnVuY3Rpb24gKCBlICkgeyByZXR1cm4gdHJ1ZTsgfSxcclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdmFsaWRhdGUgKCkge1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBuID0gdGhpcy5jWzJdLnRleHRDb250ZW50O1xyXG5cclxuICAgICAgICBpZighaXNOYU4oIG4gKSl7IFxyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5udW1WYWx1ZSggbiApOyBcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUodHJ1ZSk7IFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZWxzZSB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlICsgKHRoaXMuaXNEZWcgPyAnwrAnOicnKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgLy90aGlzLmNsZWFySW5wdXQoKTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubW9kZSgwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG1vZGUgKSB7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzd2l0Y2gobW9kZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMDogLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAvLyBzWzJdLmJvcmRlciA9ICcxcHggc29saWQgJyArIHRoaXMuY29sb3JzLmhpZGU7XHJcbiAgICAgICAgICAgICAgICBzWzJdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgICAgICBzWzRdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGxiYWNrO1xyXG4gICAgICAgICAgICAgICAgc1s1XS5iYWNrZ3JvdW5kID0gdGhpcy5mb250Q29sb3I7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6IC8vIHNjcm9sbCBvdmVyXHJcbiAgICAgICAgICAgICAgICAvL3NbMl0uYm9yZGVyID0gJzFweCBkYXNoZWQgJyArIHRoaXMuY29sb3JzLmhpZGU7XHJcbiAgICAgICAgICAgICAgICBzWzJdLmNvbG9yID0gdGhpcy5jb2xvclBsdXM7XHJcbiAgICAgICAgICAgICAgICBzWzRdLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5zY3JvbGxiYWNrb3ZlcjtcclxuICAgICAgICAgICAgICAgIHNbNV0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JQbHVzO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAvKiBjYXNlIDI6IFxyXG4gICAgICAgICAgICAgICAgc1syXS5ib3JkZXIgPSAnMXB4IHNvbGlkICcgKyB0aGlzLmNvbG9ycy5ib3JkZXJTZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6IFxyXG4gICAgICAgICAgICAgICAgc1syXS5ib3JkZXIgPSAnMXB4IGRhc2hlZCAnICsgdGhpcy5mb250Q29sb3I7Ly90aGlzLmNvbG9ycy5ib3JkZXJTZWxlY3Q7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6IFxyXG4gICAgICAgICAgICAgICAgc1syXS5ib3JkZXIgPSAnMXB4IGRhc2hlZCAnICsgdGhpcy5jb2xvcnMuaGlkZTtcclxuICAgICAgICAgICAgYnJlYWs7Ki9cclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCB1cCApIHtcclxuXHJcbiAgICAgICAgbGV0IHd3ID0gTWF0aC5mbG9vciggdGhpcy53dyAqICgoIHRoaXMudmFsdWUgLSB0aGlzLm1pbiApIC8gdGhpcy5yYW5nZSApKTtcclxuICAgICAgIFxyXG4gICAgICAgIGlmKHRoaXMubW9kZWwgIT09IDMpIHRoaXMuc1s1XS53aWR0aCA9IHd3ICsgJ3B4JztcclxuICAgICAgICBpZih0aGlzLnNbNl0pIHRoaXMuc1s2XS5sZWZ0ID0gKCB0aGlzLnNhICsgd3cgKyAzICkgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY1syXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWUgKyAodGhpcy5pc0RlZyA/ICfCsCc6JycpO1xyXG5cclxuICAgICAgICBpZiggdXAgKSB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpO1xyXG5cclxuICAgICAgICBsZXQgdyA9IHRoaXMuc2IgLSB0aGlzLnNjO1xyXG4gICAgICAgIHRoaXMud3cgPSB3IC0gNjtcclxuXHJcbiAgICAgICAgbGV0IHR4ID0gdGhpcy5zYztcclxuICAgICAgICBpZih0aGlzLmlzVUkgfHwgIXRoaXMuc2ltcGxlKSB0eCA9IHRoaXMuc2MrMTA7XHJcbiAgICAgICAgdGhpcy50eGwgPSB0aGlzLncgLSB0eCArIDI7XHJcblxyXG4gICAgICAgIC8vbGV0IHR5ID0gTWF0aC5mbG9vcih0aGlzLmggKiAwLjUpIC0gODtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcblxyXG4gICAgICAgIHNbMl0ud2lkdGggPSAodGhpcy5zYyAtNiApKyAncHgnO1xyXG4gICAgICAgIHNbMl0ubGVmdCA9ICh0aGlzLnR4bCArNCkgKyAncHgnO1xyXG4gICAgICAgIC8vc1syXS50b3AgPSB0eSArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS53aWR0aCA9IHcgKyAncHgnO1xyXG4gICAgICAgIHNbNF0ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgICAgIHNbNF0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgICAgICBzWzVdLmxlZnQgPSAodGhpcy5zYSArIDMpICsgJ3B4JztcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuXHJcbiAgICB9XHJcblxyXG59IiwiaW1wb3J0IHsgUHJvdG8gfSBmcm9tICcuLi9jb3JlL1Byb3RvJztcclxuXHJcbmV4cG9ydCBjbGFzcyBUZXh0SW5wdXQgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5jbW9kZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWUgPSBvLnZhbHVlIHx8ICcnO1xyXG4gICAgICAgIHRoaXMucGxhY2VIb2xkZXIgPSBvLnBsYWNlSG9sZGVyIHx8ICcnO1xyXG5cclxuICAgICAgICB0aGlzLmFsbHdheSA9IG8uYWxsd2F5IHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZWRpdGFibGUgPSBvLmVkaXQgIT09IHVuZGVmaW5lZCA/IG8uZWRpdCA6IHRydWU7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBiZ1xyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIGJhY2tncm91bmQ6JyArIHRoaXMuY29sb3JzLnNlbGVjdCArICc7IHRvcDo0cHg7IHdpZHRoOjBweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OycgKTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9ycy5pbnB1dEJnICsgJzsgYm9yZGVyQ29sb3I6JyArIHRoaXMuY29sb3JzLmlucHV0Qm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIC8vIGN1cnNvclxyXG4gICAgICAgIHRoaXMuY1s0XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAndG9wOjRweDsgaGVpZ2h0OicgKyAodGhpcy5oLTgpICsgJ3B4OyB3aWR0aDowcHg7IGJhY2tncm91bmQ6Jyt0aGlzLmZvbnRDb2xvcisnOycgKTtcclxuXHJcbiAgICAgICAgLy8gZmFrZVxyXG4gICAgICAgIHRoaXMuY1s1XSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0c2VsZWN0ICsgJ2hlaWdodDonICsgKHRoaXMuaC00KSArICdweDsganVzdGlmeS1jb250ZW50OiBjZW50ZXI7IGZvbnQtc3R5bGU6IGl0YWxpYzsgY29sb3I6Jyt0aGlzLmNvbG9ycy5pbnB1dEhvbGRlcisnOycgKTtcclxuICAgICAgICBpZiggdGhpcy52YWx1ZSA9PT0gJycgKSB0aGlzLmNbNV0udGV4dENvbnRlbnQgPSB0aGlzLnBsYWNlSG9sZGVyO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcbiAgICAgICAgaWYoIGwueCA+PSB0aGlzLnNhICkgcmV0dXJuICd0ZXh0JztcclxuICAgICAgICByZXR1cm4gJyc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCF0aGlzLmVkaXRhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApe1xyXG4gICAgICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW91c2Vkb3duICggZSApIHtcclxuXHJcbiAgICAgICAgaWYoIXRoaXMuZWRpdGFibGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiggbmFtZSA9PT0gJ3RleHQnICkgdGhpcy5zZXRJbnB1dCggdGhpcy5jWzNdICk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZW1vdmUgKCBlICkge1xyXG5cclxuICAgICAgICBpZighdGhpcy5lZGl0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgLy9sZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgLy9pZiggbC54ID09PSAtMSAmJiBsLnkgPT09IC0xICl7IHJldHVybjt9XHJcblxyXG4gICAgICAgIC8vaWYoIGwueCA+PSB0aGlzLnNhICkgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICAvL2Vsc2UgdGhpcy5jdXJzb3IoKTtcclxuXHJcbiAgICAgICAgbGV0IHggPSAwO1xyXG5cclxuICAgICAgICBpZiggbmFtZSA9PT0gJ3RleHQnICkgdGhpcy5jdXJzb3IoJ3RleHQnKTtcclxuICAgICAgICBlbHNlIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzRG93biApIHggPSBlLmNsaWVudFggLSB0aGlzLnpvbmUueDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMudXBJbnB1dCggeCAtIHRoaXMuc2EgLTMsIHRoaXMuaXNEb3duICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZW5kZXIgKCBjLCBlLCBzICkge1xyXG5cclxuICAgICAgICB0aGlzLnNbNF0ud2lkdGggPSAnMXB4JztcclxuICAgICAgICB0aGlzLnNbNF0ubGVmdCA9ICh0aGlzLnNhICsgYys1KSArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuc1syXS5sZWZ0ID0gKHRoaXMuc2EgKyBlKzUpICsgJ3B4JztcclxuICAgICAgICB0aGlzLnNbMl0ud2lkdGggPSBzKydweCc7XHJcbiAgICBcclxuICAgIH1cclxuXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIElOUFVUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgc2VsZWN0ICggYywgZSwgdyApIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLnNhICsgNTtcclxuICAgICAgICBzWzRdLndpZHRoID0gJzFweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gKCBkICsgYyApICsgJ3B4JztcclxuICAgICAgICBzWzJdLmxlZnQgPSAoIGQgKyBlICkgKyAncHgnO1xyXG4gICAgICAgIHNbMl0ud2lkdGggPSB3ICsgJ3B4JztcclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHVuc2VsZWN0ICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgaWYoIXMpIHJldHVybjtcclxuICAgICAgICBzWzJdLndpZHRoID0gMCArICdweCc7XHJcbiAgICAgICAgc1s0XS53aWR0aCA9IDAgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZSAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5hbGx3YXkgKSBmb3JjZSA9IHRydWU7IFxyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5jWzNdLnRleHRDb250ZW50O1xyXG5cclxuICAgICAgICBpZih0aGlzLnZhbHVlICE9PSAnJykgdGhpcy5jWzVdLnRleHRDb250ZW50ID0gJyc7XHJcbiAgICAgICAgZWxzZSB0aGlzLmNbNV0udGV4dENvbnRlbnQgPSB0aGlzLnBsYWNlSG9sZGVyO1xyXG5cclxuICAgICAgICBpZiggIWZvcmNlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVpJU0VcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG4gICAgICAgIHNbM10ubGVmdCA9IHRoaXMuc2EgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSB0aGlzLnNiICsgJ3B4JztcclxuXHJcbiAgICAgICAgc1s1XS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1s1XS53aWR0aCA9IHRoaXMuc2IgKyAncHgnO1xyXG4gICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBUaXRsZSBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICBsZXQgcHJlZml4ID0gby5wcmVmaXggfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgJ3RleHQtYWxpZ246cmlnaHQ7IHdpZHRoOjYwcHg7IGxpbmUtaGVpZ2h0OicrICh0aGlzLmgtOCkgKyAncHg7IGNvbG9yOicgKyB0aGlzLmZvbnRDb2xvciApO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5oID09PSAzMSApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zWzBdLmhlaWdodCA9IHRoaXMuaCArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuc1sxXS50b3AgPSA4ICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5jWzJdLnN0eWxlLnRvcCA9IDggKyAncHgnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzID0gdGhpcy5zO1xyXG5cclxuICAgICAgICBzWzFdLnRleHRBbGlnbiA9IG8uYWxpZ24gfHwgJ2xlZnQnO1xyXG4gICAgICAgIHNbMV0uZm9udFdlaWdodCA9IG8uZm9udFdlaWdodCB8fCAnYm9sZCc7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0aGlzLnR4dC5zdWJzdHJpbmcoMCwxKS50b1VwcGVyQ2FzZSgpICsgdGhpcy50eHQuc3Vic3RyaW5nKDEpLnJlcGxhY2UoXCItXCIsIFwiIFwiKTtcclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSBwcmVmaXg7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0ICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMV0udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRleHQyICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuICAgICAgICB0aGlzLnNbMV0ud2lkdGggPSB0aGlzLncgKyAncHgnOyAvLy0gNTAgKyAncHgnO1xyXG4gICAgICAgIHRoaXMuc1syXS5sZWZ0ID0gdGhpcy53ICsgJ3B4JzsvLy0gKCA1MCArIDI2ICkgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlbGVjdCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkFjdGlmID0gby5vbkFjdGlmIHx8IGZ1bmN0aW9uKCl7fTtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25Db2xvciA9IG8uYkNvbG9yIHx8IHRoaXMuY29sb3JzLmJ1dHRvbjtcclxuICAgICAgICB0aGlzLmJ1dHRvbk92ZXIgPSBvLmJPdmVyIHx8IHRoaXMuY29sb3JzLm92ZXI7XHJcbiAgICAgICAgdGhpcy5idXR0b25Eb3duID0gby5iRG93biB8fCB0aGlzLmNvbG9ycy5zZWxlY3Q7XHJcbiAgICAgICAgdGhpcy5idXR0b25BY3Rpb24gPSBvLmJBY3Rpb24gfHwgdGhpcy5jb2xvcnMuYWN0aW9uO1xyXG5cclxuICAgICAgICBsZXQgcHJlZml4ID0gby5wcmVmaXggfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAnZGl2JywgdGhpcy5jc3MudHh0ICsgdGhpcy5jc3MuYnV0dG9uICsgJyB0b3A6MXB4OyBiYWNrZ3JvdW5kOicrdGhpcy5idXR0b25Db2xvcisnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOicrdGhpcy5jb2xvcnMuYnV0dG9uQm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6MTVweDsgd2lkdGg6MzBweDsgbGVmdDoxMHB4OycgKTtcclxuICAgICAgICB0aGlzLmNbMl0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuXHJcbiAgICAgICAgdGhpcy5jWzNdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHRzZWxlY3QgKyAnaGVpZ2h0OicgKyAodGhpcy5oLTQpICsgJ3B4OyBiYWNrZ3JvdW5kOicgKyB0aGlzLmNvbG9ycy5pbnB1dEJnICsgJzsgYm9yZGVyQ29sb3I6JyArIHRoaXMuY29sb3JzLmlucHV0Qm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgIHRoaXMuY1szXS50ZXh0Q29udGVudCA9IHRoaXMudmFsdWU7XHJcblxyXG4gICAgICAgIGxldCBmbHRvcCA9IE1hdGguZmxvb3IodGhpcy5oKjAuNSktNztcclxuICAgICAgICB0aGlzLmNbNF0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTRweDsgaGVpZ2h0OjE0cHg7IGxlZnQ6NXB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuc3Znc1sgJ2N1cnNvcicgXSwgZmlsbDp0aGlzLmZvbnRDb2xvciwgc3Ryb2tlOidub25lJ30pO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXQgPSAxO1xyXG4gICAgICAgIHRoaXMuaXNBY3RpZiA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdGVzdFpvbmUgKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbCA9IHRoaXMubG9jYWw7XHJcbiAgICAgICAgaWYoIGwueCA9PT0gLTEgJiYgbC55ID09PSAtMSApIHJldHVybiAnJztcclxuICAgICAgICBpZiggbC54ID4gdGhpcy5zYSAmJiBsLnggPCB0aGlzLnNhKzMwICkgcmV0dXJuICdvdmVyJztcclxuICAgICAgICByZXR1cm4gJzAnXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcbiAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgLy90aGlzLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgaWYoICFuYW1lICkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgLy90aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbIG5hbWUtMiBdO1xyXG4gICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICAvL2xldCBzZWwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2cobmFtZSlcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgPT09ICdvdmVyJyApe1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcigncG9pbnRlcicpO1xyXG4gICAgICAgICAgICB1cCA9IHRoaXMubW9kZSggdGhpcy5pc0Rvd24gPyAzIDogMiApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5yZXNldCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVwO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYXBwbHkgKCB2ICkge1xyXG5cclxuICAgICAgICB2ID0gdiB8fCAnJztcclxuXHJcbiAgICAgICAgaWYoIHYgIT09IHRoaXMudmFsdWUgKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2O1xyXG4gICAgICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0aGlzLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUgKCkge1xyXG5cclxuICAgICAgICB0aGlzLm1vZGUoIDMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4gKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdCAhPT0gbiApe1xyXG5cclxuICAgICAgICAgICAgaWYoIG49PT0xICkgdGhpcy5pc0FjdGlmID0gZmFsc2U7O1xyXG5cclxuICAgICAgICAgICAgaWYoIG49PT0zICl7IFxyXG4gICAgICAgICAgICAgICAgaWYoICF0aGlzLmlzQWN0aWYgKXsgdGhpcy5pc0FjdGlmID0gdHJ1ZTsgbj00OyB0aGlzLm9uQWN0aWYoIHRoaXMgKTsgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7IHRoaXMuaXNBY3RpZiA9IGZhbHNlOyB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKCBuPT09MiAmJiB0aGlzLmlzQWN0aWYgKSBuID0gNDtcclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0ID0gMTsgdGhpcy5zWyAyIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjsgIHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkNvbG9yOyBicmVhazsgLy8gYmFzZVxyXG4gICAgICAgICAgICAgICAgY2FzZSAyOiB0aGlzLnN0YXQgPSAyOyB0aGlzLnNbIDIgXS5jb2xvciA9IHRoaXMuZm9udFNlbGVjdDsgdGhpcy5zWyAyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uT3ZlcjsgYnJlYWs7IC8vIG92ZXJcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0ID0gMzsgdGhpcy5zWyAyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgMiBdLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkRvd247IGJyZWFrOyAvLyBkb3duXHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHRoaXMuc3RhdCA9IDQ7IHRoaXMuc1sgMiBdLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLnNbIDIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25BY3Rpb247IGJyZWFrOyAvLyBhY3RpZlxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RlKCB0aGlzLmlzQWN0aWYgPyA0IDogMSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB0ZXh0ICggdHh0ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNbM10udGV4dENvbnRlbnQgPSB0eHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJTaXplICgpIHtcclxuXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgc1syXS5sZWZ0ID0gdGhpcy5zYSArICdweCc7XHJcbiAgICAgICAgc1szXS5sZWZ0ID0gKHRoaXMuc2EgKyA0MCkgKyAncHgnO1xyXG4gICAgICAgIHNbM10ud2lkdGggPSAodGhpcy5zYiAtIDQwKSArICdweCc7XHJcbiAgICAgICAgc1s0XS5sZWZ0ID0gKHRoaXMuc2ErOCkgKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlbGVjdG9yIGV4dGVuZHMgUHJvdG8ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCBvID0ge30gKSB7XHJcblxyXG4gICAgICAgIHN1cGVyKCBvICk7XHJcblxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gby52YWx1ZXM7XHJcbiAgICAgICAgaWYodHlwZW9mIHRoaXMudmFsdWVzID09PSAnc3RyaW5nJyApIHRoaXMudmFsdWVzID0gWyB0aGlzLnZhbHVlcyBdO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gby52YWx1ZSB8fCB0aGlzLnZhbHVlc1swXTtcclxuXHJcblxyXG5cclxuICAgICAgICAvL3RoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYnV0dG9uQ29sb3IgPSBvLmJDb2xvciB8fCB0aGlzLmNvbG9ycy5idXR0b247XHJcbiAgICAgICAgdGhpcy5idXR0b25PdmVyID0gby5iT3ZlciB8fCB0aGlzLmNvbG9ycy5vdmVyO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uRG93biA9IG8uYkRvd24gfHwgdGhpcy5jb2xvcnMuc2VsZWN0O1xyXG5cclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWVzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLnRtcCA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3RhdCA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgc2VsO1xyXG5cclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyl7XHJcblxyXG4gICAgICAgICAgICBzZWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzW2ldID09PSB0aGlzLnZhbHVlICkgc2VsID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY1tpKzJdID0gdGhpcy5kb20oICdkaXYnLCB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAnIHRvcDoxcHg7IGJhY2tncm91bmQ6Jysoc2VsPyB0aGlzLmJ1dHRvbkRvd24gOiB0aGlzLmJ1dHRvbkNvbG9yKSsnOyBoZWlnaHQ6JysodGhpcy5oLTIpKydweDsgYm9yZGVyOicrdGhpcy5jb2xvcnMuYnV0dG9uQm9yZGVyKyc7IGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JyApO1xyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5zdHlsZS5jb2xvciA9IHNlbCA/IHRoaXMuZm9udFNlbGVjdCA6IHRoaXMuZm9udENvbG9yO1xyXG4gICAgICAgICAgICB0aGlzLmNbaSsyXS5pbm5lckhUTUwgPSB0aGlzLnZhbHVlc1tpXTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdFtpXSA9IHNlbCA/IDM6MTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5sbmc7XHJcbiAgICAgICAgbGV0IHQgPSB0aGlzLnRtcDtcclxuICAgICAgICBcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgXHRpZiggbC54PnRbaV1bMF0gJiYgbC54PHRbaV1bMl0gKSByZXR1cm4gaSsyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICcnXHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgRVZFTlRTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW91c2V1cCAoIGUgKSB7XHJcbiAgICBcclxuICAgICAgICBpZiggdGhpcy5pc0Rvd24gKXtcclxuICAgICAgICAgICAgLy90aGlzLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuaXNEb3duID0gZmFsc2U7XHJcbiAgICAgICAgICAgIC8vdGhpcy5zZW5kKCk7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdXNlbW92ZSggZSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZWRvd24gKCBlICkge1xyXG5cclxuICAgIFx0bGV0IG5hbWUgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICBcdHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZXNbIG5hbWUtMiBdO1xyXG4gICAgICAgIHRoaXMuc2VuZCgpO1xyXG4gICAgXHRyZXR1cm4gdGhpcy5tb3VzZW1vdmUoIGUgKTtcclxuIFxyXG4gICAgICAgIC8vIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuICAgICAgICAvL2xldCBzZWwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIC8vY29uc29sZS5sb2cobmFtZSlcclxuXHJcbiAgICAgICAgaWYoIG5hbWUgIT09ICcnICl7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcbiAgICAgICAgICAgIHVwID0gdGhpcy5tb2RlcyggdGhpcy5pc0Rvd24gPyAzIDogMiwgbmFtZSApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHR1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGVzICggbiwgbmFtZSApIHtcclxuXHJcbiAgICAgICAgbGV0IHYsIHIgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmxuZzsgaSsrICl7XHJcblxyXG4gICAgICAgICAgICBpZiggaSA9PT0gbmFtZS0yICYmIHRoaXMudmFsdWVzWyBpIF0gIT09IHRoaXMudmFsdWUgKSB2ID0gdGhpcy5tb2RlKCBuLCBpKzIgKTtcclxuICAgICAgICAgICAgZWxzZXsgXHJcblxyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzWyBpIF0gPT09IHRoaXMudmFsdWUgKSB2ID0gdGhpcy5tb2RlKCAzLCBpKzIgKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgdiA9IHRoaXMubW9kZSggMSwgaSsyICk7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZih2KSByID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbW9kZSAoIG4sIG5hbWUgKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBuYW1lIC0gMjtcclxuXHJcblxyXG4gICAgICAgIGlmKCB0aGlzLnN0YXRbaV0gIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIHN3aXRjaCggbiApe1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMTogdGhpcy5zdGF0W2ldID0gMTsgdGhpcy5zWyBpKzIgXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyAgdGhpcy5zWyBpKzIgXS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdFtpXSA9IDI7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uT3ZlcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDM6IHRoaXMuc3RhdFtpXSA9IDM7IHRoaXMuc1sgaSsyIF0uY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuc1sgaSsyIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uRG93bjsgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCk7XHJcblxyXG4gICAgICAgIGxldCB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIHRoaXMudmFsdWVzWyBpIF0gPT09IHRoaXMudmFsdWUgKSB2ID0gdGhpcy5tb2RlKCAzLCBpKzIgKTtcclxuICAgICAgICAgICAgZWxzZSB2ID0gdGhpcy5tb2RlKCAxLCBpKzIgKTtcclxuICAgICAgICAgICAgaWYodikgciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcjsvL3RoaXMubW9kZXMoIDEgLCAyICk7XHJcblxyXG4gICAgXHQvKmlmKCB0aGlzLnNlbGVjdGVkICl7XHJcbiAgICBcdFx0dGhpcy5zWyB0aGlzLnNlbGVjdGVkIF0uY29sb3IgPSB0aGlzLmZvbnRDb2xvcjtcclxuICAgICAgICAgICAgdGhpcy5zWyB0aGlzLnNlbGVjdGVkIF0uYmFja2dyb3VuZCA9IHRoaXMuYnV0dG9uQ29sb3I7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICBcdH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7Ki9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgbGFiZWwgKCBzdHJpbmcsIG4gKSB7XHJcblxyXG4gICAgICAgIG4gPSBuIHx8IDI7XHJcbiAgICAgICAgdGhpcy5jW25dLnRleHRDb250ZW50ID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpY29uICggc3RyaW5nLCB5LCBuICkge1xyXG5cclxuICAgICAgICBuID0gbiB8fCAyO1xyXG4gICAgICAgIHRoaXMuc1tuXS5wYWRkaW5nID0gKCB5IHx8IDAgKSArJ3B4IDBweCc7XHJcbiAgICAgICAgdGhpcy5jW25dLmlubmVySFRNTCA9IHN0cmluZztcclxuXHJcbiAgICB9XHJcblxyXG4gICAgclNpemUgKCkge1xyXG5cclxuICAgICAgICBzdXBlci5yU2l6ZSgpOztcclxuXHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnM7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLnNiO1xyXG4gICAgICAgIGxldCBkID0gdGhpcy5zYTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLmxuZztcclxuICAgICAgICBsZXQgZGMgPSAgMztcclxuICAgICAgICBsZXQgc2l6ZSA9IE1hdGguZmxvb3IoICggdy0oZGMqKGktMSkpICkgLyBpICk7XHJcblxyXG4gICAgICAgIHdoaWxlKGktLSl7XHJcblxyXG4gICAgICAgIFx0dGhpcy50bXBbaV0gPSBbIE1hdGguZmxvb3IoIGQgKyAoIHNpemUgKiBpICkgKyAoIGRjICogaSApKSwgc2l6ZSBdO1xyXG4gICAgICAgIFx0dGhpcy50bXBbaV1bMl0gPSB0aGlzLnRtcFtpXVswXSArIHRoaXMudG1wW2ldWzFdO1xyXG4gICAgICAgICAgICBzW2krMl0ubGVmdCA9IHRoaXMudG1wW2ldWzBdICsgJ3B4JztcclxuICAgICAgICAgICAgc1tpKzJdLndpZHRoID0gdGhpcy50bXBbaV1bMV0gKyAncHgnO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgRW1wdHkgZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcblx0ICAgIG8uc2ltcGxlID0gdHJ1ZTtcclxuXHQgICAgby5pc1NwYWNlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuXHJcbiAgICB9XHJcbiAgICBcclxufVxyXG4iLCJpbXBvcnQgeyBQcm90byB9IGZyb20gJy4uL2NvcmUvUHJvdG8nO1xyXG5cclxuZXhwb3J0IGNsYXNzIEl0ZW0gZXh0ZW5kcyBQcm90byB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoIG8gPSB7fSApIHtcclxuXHJcbiAgICAgICAgc3VwZXIoIG8gKTtcclxuXHJcbiAgICAgICAgdGhpcy5wID0gMTAwO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnR4dDtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IDE7XHJcblxyXG4gICAgICAgIHRoaXMuaXR5cGUgPSBvLml0eXBlIHx8ICdub25lJztcclxuICAgICAgICB0aGlzLnZhbCA9IHRoaXMuaXR5cGU7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JhcGggPSB0aGlzLnN2Z3NbIHRoaXMuaXR5cGUgXTtcclxuXHJcbiAgICAgICAgbGV0IGZsdG9wID0gTWF0aC5mbG9vcih0aGlzLmgqMC41KS03O1xyXG5cclxuICAgICAgICB0aGlzLmNbMl0gPSB0aGlzLmRvbSggJ3BhdGgnLCB0aGlzLmNzcy5iYXNpYyArICdwb3NpdGlvbjphYnNvbHV0ZTsgd2lkdGg6MTRweDsgaGVpZ2h0OjE0cHg7IGxlZnQ6NXB4OyB0b3A6JytmbHRvcCsncHg7JywgeyBkOnRoaXMuZ3JhcGgsIGZpbGw6dGhpcy5mb250Q29sb3IsIHN0cm9rZTonbm9uZSd9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zWzFdLm1hcmdpbkxlZnQgPSAyMCArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yKCdwb2ludGVyJyk7XHJcblxyXG4gICAgICAgIC8vdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBuYW1lICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzVUkgKSB0aGlzLm1haW4ucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQoIHRydWUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZW5kKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW91dCAoKSB7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDMpO1xyXG4gICAgICAgIGVsc2UgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1aW92ZXIgKCkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1NlbGVjdCApIHRoaXMubW9kZSg0KTtcclxuICAgICAgICBlbHNlIHRoaXMubW9kZSgyKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlICgpIHtcclxuICAgICAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgLypyU2l6ZSAoKSB7XHJcbiAgICAgICAgXHJcbiAgICAgICAgc3VwZXIuclNpemUoKTtcclxuXHJcbiAgICB9Ki9cclxuXHJcbiAgICBtb2RlICggbiApIHtcclxuXHJcbiAgICAgICAgbGV0IGNoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5zdGF0dXMgIT09IG4gKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzID0gbjtcclxuICAgICAgICBcclxuICAgICAgICAgICAgc3dpdGNoKCBuICl7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAxOiB0aGlzLnN0YXR1cyA9IDE7IHRoaXMuc1sxXS5jb2xvciA9IHRoaXMuZm9udENvbG9yOyB0aGlzLnNbMF0uYmFja2dyb3VuZCA9ICdub25lJzsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdHVzID0gMjsgdGhpcy5zWzFdLmNvbG9yID0gdGhpcy5mb250Q29sb3I7IHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5iZ092ZXI7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAzOiB0aGlzLnN0YXR1cyA9IDM7IHRoaXMuc1sxXS5jb2xvciA9ICcjRkZGJzsgICAgICAgICB0aGlzLnNbMF0uYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IHRoaXMuc3RhdHVzID0gNDsgdGhpcy5zWzFdLmNvbG9yID0gJyNGRkYnOyAgICAgICAgIHRoaXMuc1swXS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuZG93bjsgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0ICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IoKTtcclxuICAgICAgIC8vIHJldHVybiB0aGlzLm1vZGUoIDEgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0ZWQgKCBiICl7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzU2VsZWN0ICkgdGhpcy5tb2RlKDEpO1xyXG5cclxuICAgICAgICB0aGlzLmlzU2VsZWN0ID0gYiB8fCBmYWxzZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNTZWxlY3QgKSB0aGlzLm1vZGUoMyk7XHJcbiAgICAgICAgXHJcbiAgICB9XHJcblxyXG5cclxufSIsImltcG9ydCB7IFByb3RvIH0gZnJvbSAnLi4vY29yZS9Qcm90byc7XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZCBleHRlbmRzIFByb3RvIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICBzdXBlciggbyApO1xyXG5cclxuICAgICAgICB0aGlzLnZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBvLnZhbHVlcyB8fCBbXTtcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiB0aGlzLnZhbHVlcyA9PT0gJ3N0cmluZycgKSB0aGlzLnZhbHVlcyA9IFsgdGhpcy52YWx1ZXMgXTtcclxuXHJcbiAgICAgICAgLy90aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbkNvbG9yID0gby5iQ29sb3IgfHwgdGhpcy5jb2xvcnMuYnV0dG9uO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uT3ZlciA9IG8uYk92ZXIgfHwgdGhpcy5jb2xvcnMub3ZlcjtcclxuICAgICAgICB0aGlzLmJ1dHRvbkRvd24gPSBvLmJEb3duIHx8IHRoaXMuY29sb3JzLnNlbGVjdDtcclxuXHJcbiAgICAgICAgdGhpcy5zcGFjZXMgPSBvLnNwYWNlcyB8fCBbMTAsM107XHJcbiAgICAgICAgdGhpcy5ic2l6ZSA9IG8uYnNpemUgfHwgWzEwMCwyMF07XHJcblxyXG4gICAgICAgIHRoaXMuYnNpemVNYXggPSB0aGlzLmJzaXplWzBdO1xyXG5cclxuICAgICAgICB0aGlzLmxuZyA9IHRoaXMudmFsdWVzLmxlbmd0aDtcclxuICAgICAgICB0aGlzLnRtcCA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3RhdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuZ3JpZCA9IFsgMiwgTWF0aC5yb3VuZCggdGhpcy5sbmcgKiAwLjUgKSBdO1xyXG4gICAgICAgIHRoaXMuaCA9IHRoaXMuZ3JpZFsxXSAqICggdGhpcy5ic2l6ZVsxXSArIHRoaXMuc3BhY2VzWzFdICkgKyB0aGlzLnNwYWNlc1sxXTtcclxuXHJcbiAgICAgICAgdGhpcy5jWzFdLnRleHRDb250ZW50ID0gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuY1syXSA9IHRoaXMuZG9tKCAndGFibGUnLCB0aGlzLmNzcy5iYXNpYyArICd3aWR0aDoxMDAlOyB0b3A6JysodGhpcy5zcGFjZXNbMV0tMikrJ3B4OyBoZWlnaHQ6YXV0bzsgYm9yZGVyLWNvbGxhcHNlOnNlcGFyYXRlOyBib3JkZXI6bm9uZTsgYm9yZGVyLXNwYWNpbmc6ICcrKHRoaXMuc3BhY2VzWzBdLTIpKydweCAnKyh0aGlzLnNwYWNlc1sxXS0yKSsncHg7JyApO1xyXG5cclxuICAgICAgICBsZXQgbiA9IDAsIGIsIG1pZCwgdGQsIHRyO1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbnMgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXQgPSBbXTtcclxuICAgICAgICB0aGlzLnRtcFggPSBbXTtcclxuICAgICAgICB0aGlzLnRtcFkgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0aGlzLmdyaWRbMV07IGkrKyApe1xyXG4gICAgICAgICAgICB0ciA9IHRoaXMuY1syXS5pbnNlcnRSb3coKTtcclxuICAgICAgICAgICAgdHIuc3R5bGUuY3NzVGV4dCA9ICdwb2ludGVyLWV2ZW50czpub25lOyc7XHJcbiAgICAgICAgICAgIGZvciggbGV0IGogPSAwOyBqIDwgdGhpcy5ncmlkWzBdOyBqKysgKXtcclxuXHJcbiAgICAgICAgICAgICAgICB0ZCA9IHRyLmluc2VydENlbGwoKTtcclxuICAgICAgICAgICAgICAgIHRkLnN0eWxlLmNzc1RleHQgPSAncG9pbnRlci1ldmVudHM6bm9uZTsnO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCB0aGlzLnZhbHVlc1tuXSApe1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcclxuICAgICAgICAgICAgICAgICAgICBiLnN0eWxlLmNzc1RleHQgPSB0aGlzLmNzcy50eHQgKyB0aGlzLmNzcy5idXR0b24gKyAncG9zaXRpb246c3RhdGljOyB3aWR0aDonK3RoaXMuYnNpemVbMF0rJ3B4OyBoZWlnaHQ6Jyt0aGlzLmJzaXplWzFdKydweDsgYm9yZGVyOicrdGhpcy5jb2xvcnMuYnV0dG9uQm9yZGVyKyc7IGxlZnQ6YXV0bzsgcmlnaHQ6YXV0bzsgYmFja2dyb3VuZDonK3RoaXMuYnV0dG9uQ29sb3IrJzsgIGJvcmRlci1yYWRpdXM6Jyt0aGlzLnJhZGl1cysncHg7JztcclxuICAgICAgICAgICAgICAgICAgICBiLmlubmVySFRNTCA9IHRoaXMudmFsdWVzW25dO1xyXG4gICAgICAgICAgICAgICAgICAgIHRkLmFwcGVuZENoaWxkKCBiICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9ucy5wdXNoKGIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdC5wdXNoKDEpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xyXG4gICAgICAgICAgICAgICAgICAgIGIuc3R5bGUuY3NzVGV4dCA9IHRoaXMuY3NzLnR4dCArICdwb3NpdGlvbjpzdGF0aWM7IHdpZHRoOicrdGhpcy5ic2l6ZVswXSsncHg7IGhlaWdodDonK3RoaXMuYnNpemVbMV0rJ3B4OyB0ZXh0LWFsaWduOmNlbnRlcjsgIGxlZnQ6YXV0bzsgcmlnaHQ6YXV0bzsgYmFja2dyb3VuZDpub25lOyc7XHJcbiAgICAgICAgICAgICAgICAgICAgdGQuYXBwZW5kQ2hpbGQoIGIgKTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoaj09PTApIGIuc3R5bGUuY3NzVGV4dCArPSAnZmxvYXQ6cmlnaHQ7JztcclxuICAgICAgICAgICAgICAgIGVsc2UgYi5zdHlsZS5jc3NUZXh0ICs9ICdmbG9hdDpsZWZ0Oyc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgbisrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gLTE7XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHR4ID0gdGhpcy50bXBYO1xyXG4gICAgICAgIGxldCB0eSA9IHRoaXMudG1wWTtcclxuXHJcbiAgICAgICAgbGV0IGlkID0gLTE7XHJcbiAgICAgICAgbGV0IGMgPSAtMTtcclxuICAgICAgICBsZXQgbGluZSA9IC0xO1xyXG4gICAgICAgIGxldCBpID0gdGhpcy5ncmlkWzBdO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKXtcclxuICAgICAgICBcdGlmKCBsLnggPiB0eFtpXVswXSAmJiBsLnggPCB0eFtpXVsxXSApIGMgPSBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHRoaXMuZ3JpZFsxXTtcclxuICAgICAgICB3aGlsZSggaS0tICl7XHJcbiAgICAgICAgICAgIGlmKCBsLnkgPiB0eVtpXVswXSAmJiBsLnkgPCB0eVtpXVsxXSApIGxpbmUgPSBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoYyE9PS0xICYmIGxpbmUhPT0tMSl7XHJcbiAgICAgICAgICAgIGlkID0gYyArIChsaW5lKjIpO1xyXG4gICAgICAgICAgICBpZihpZD50aGlzLmxuZy0xKSBpZCA9IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlkO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vdXNldXAgKCBlICkge1xyXG4gICAgXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICl7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgICAgICAgICAgLy90aGlzLnNlbmQoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlZG93biAoIGUgKSB7XHJcblxyXG4gICAgXHRsZXQgaWQgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBpZCA8IDAgKSByZXR1cm4gZmFsc2U7XHJcblxyXG4gICAgXHR0aGlzLmlzRG93biA9IHRydWU7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsdWVzW2lkXTtcclxuICAgICAgICB0aGlzLnNlbmQoKTtcclxuICAgIFx0cmV0dXJuIHRoaXMubW91c2Vtb3ZlKCBlICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlbW92ZSAoIGUgKSB7XHJcblxyXG4gICAgICAgIGxldCB1cCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgaWQgPSB0aGlzLnRlc3Rab25lKCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBpZCAhPT0gLTEgKXtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3IoJ3BvaW50ZXInKTtcclxuICAgICAgICAgICAgdXAgPSB0aGlzLm1vZGVzKCB0aGlzLmlzRG93biA/IDMgOiAyLCBpZCApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHR1cCA9IHRoaXMucmVzZXQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB1cDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG1vZGVzICggbiwgaWQgKSB7XHJcblxyXG4gICAgICAgIGxldCB2LCByID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5sbmc7IGkrKyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGkgPT09IGlkICkgdiA9IHRoaXMubW9kZSggbiwgaSApO1xyXG4gICAgICAgICAgICBlbHNlIHYgPSB0aGlzLm1vZGUoIDEsIGkgKTtcclxuXHJcbiAgICAgICAgICAgIGlmKHYpIHIgPSB0cnVlO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb2RlICggbiwgaWQgKSB7XHJcblxyXG4gICAgICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IGkgPSBpZDtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuc3RhdFtpXSAhPT0gbiApe1xyXG4gICAgICAgIFxyXG4gICAgICAgICAgICBzd2l0Y2goIG4gKXtcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHRoaXMuc3RhdFtpXSA9IDE7IHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250Q29sb3I7ICB0aGlzLmJ1dHRvbnNbIGkgXS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25Db2xvcjsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6IHRoaXMuc3RhdFtpXSA9IDI7IHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmNvbG9yID0gdGhpcy5mb250U2VsZWN0OyB0aGlzLmJ1dHRvbnNbIGkgXS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5idXR0b25PdmVyOyBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzogdGhpcy5zdGF0W2ldID0gMzsgdGhpcy5idXR0b25zWyBpIF0uc3R5bGUuY29sb3IgPSB0aGlzLmZvbnRTZWxlY3Q7IHRoaXMuYnV0dG9uc1sgaSBdLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJ1dHRvbkRvd247IGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG5cclxuICAgICAgICByZXR1cm4gY2hhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcmVzZXQgKCkge1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1vZGVzKCAxICwgMCApO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBsYWJlbCAoIHN0cmluZywgbiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5idXR0b25zW25dLnRleHRDb250ZW50ID0gc3RyaW5nO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBpY29uICggc3RyaW5nLCB5LCBuICkge1xyXG5cclxuICAgICAgICB0aGlzLmJ1dHRvbnNbbl0uc3R5bGUucGFkZGluZyA9ICggeSB8fCAwICkgKydweCAwcHgnO1xyXG4gICAgICAgIHRoaXMuYnV0dG9uc1tuXS5pbm5lckhUTUwgPSBzdHJpbmc7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHRlc3RXICgpIHtcclxuXHJcbiAgICAgICAgbGV0IHZ3ID0gdGhpcy5zcGFjZXNbMF0qMyArIHRoaXMuYnNpemVNYXgqMiwgcnogPSBmYWxzZTtcclxuICAgICAgICBpZiggdncgPiB0aGlzLncgKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnNpemVbMF0gPSAoIHRoaXMudy0odGhpcy5zcGFjZXNbMF0qMykgKSAqIDAuNTtcclxuICAgICAgICAgICAgcnogPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLmJzaXplWzBdICE9PSB0aGlzLmJzaXplTWF4ICkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ic2l6ZVswXSA9IHRoaXMuYnNpemVNYXg7XHJcbiAgICAgICAgICAgICAgICByeiA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKCAhcnogKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy5idXR0b25zLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMuYnV0dG9uc1tpXS5zdHlsZS53aWR0aCA9IHRoaXMuYnNpemVbMF0gKyAncHgnO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByU2l6ZSAoKSB7XHJcblxyXG4gICAgICAgIHN1cGVyLnJTaXplKCk7XHJcblxyXG4gICAgICAgIHRoaXMudGVzdFcoKTtcclxuXHJcbiAgICAgICAgbGV0IG4gPSAwLCBiLCBtaWQ7XHJcblxyXG4gICAgICAgIHRoaXMudG1wWCA9IFtdO1xyXG4gICAgICAgIHRoaXMudG1wWSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IoIGxldCBqID0gMDsgaiA8IHRoaXMuZ3JpZFswXTsgaisrICl7XHJcblxyXG4gICAgICAgICAgICBpZihqPT09MCl7XHJcbiAgICAgICAgICAgICAgICBtaWQgPSAoIHRoaXMudyowLjUgKSAtICggdGhpcy5zcGFjZXNbMF0qMC41ICk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRtcFgucHVzaCggWyBtaWQtdGhpcy5ic2l6ZVswXSwgbWlkIF0gKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1pZCA9ICggdGhpcy53KjAuNSApICsgKCB0aGlzLnNwYWNlc1swXSowLjUgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudG1wWC5wdXNoKCBbIG1pZCwgbWlkK3RoaXMuYnNpemVbMF0gXSApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbWlkID0gdGhpcy5zcGFjZXNbMV07XHJcblxyXG4gICAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy5ncmlkWzFdOyBpKysgKXtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudG1wWS5wdXNoKCBbIG1pZCwgbWlkICsgdGhpcy5ic2l6ZVsxXSBdICk7XHJcbiAgICAgICAgICAgIG1pZCArPSB0aGlzLmJzaXplWzFdICsgdGhpcy5zcGFjZXNbMV07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG59IiwiXHJcbmltcG9ydCB7IEJvb2wgfSBmcm9tICcuLi9wcm90by9Cb29sLmpzJztcclxuaW1wb3J0IHsgQnV0dG9uIH0gZnJvbSAnLi4vcHJvdG8vQnV0dG9uLmpzJztcclxuaW1wb3J0IHsgQ2lyY3VsYXIgfSBmcm9tICcuLi9wcm90by9DaXJjdWxhci5qcyc7XHJcbmltcG9ydCB7IENvbG9yIH0gZnJvbSAnLi4vcHJvdG8vQ29sb3IuanMnO1xyXG5pbXBvcnQgeyBGcHMgfSBmcm9tICcuLi9wcm90by9GcHMuanMnO1xyXG5pbXBvcnQgeyBHcmFwaCB9IGZyb20gJy4uL3Byb3RvL0dyYXBoLmpzJztcclxuaW1wb3J0IHsgR3JvdXAgIH0gZnJvbSAnLi4vcHJvdG8vR3JvdXAuanMnO1xyXG5pbXBvcnQgeyBKb3lzdGljayB9IGZyb20gJy4uL3Byb3RvL0pveXN0aWNrLmpzJztcclxuaW1wb3J0IHsgS25vYiB9IGZyb20gJy4uL3Byb3RvL0tub2IuanMnO1xyXG5pbXBvcnQgeyBMaXN0IH0gZnJvbSAnLi4vcHJvdG8vTGlzdC5qcyc7XHJcbmltcG9ydCB7IE51bWVyaWMgfSBmcm9tICcuLi9wcm90by9OdW1lcmljLmpzJztcclxuaW1wb3J0IHsgU2xpZGUgfSBmcm9tICcuLi9wcm90by9TbGlkZS5qcyc7XHJcbmltcG9ydCB7IFRleHRJbnB1dCB9IGZyb20gJy4uL3Byb3RvL1RleHRJbnB1dC5qcyc7XHJcbmltcG9ydCB7IFRpdGxlIH0gZnJvbSAnLi4vcHJvdG8vVGl0bGUuanMnO1xyXG5pbXBvcnQgeyBTZWxlY3QgfSBmcm9tICcuLi9wcm90by9TZWxlY3QuanMnO1xyXG5pbXBvcnQgeyBTZWxlY3RvciB9IGZyb20gJy4uL3Byb3RvL1NlbGVjdG9yLmpzJztcclxuaW1wb3J0IHsgRW1wdHkgfSBmcm9tICcuLi9wcm90by9FbXB0eS5qcyc7XHJcbmltcG9ydCB7IEl0ZW0gfSBmcm9tICcuLi9wcm90by9JdGVtLmpzJztcclxuaW1wb3J0IHsgR3JpZCB9IGZyb20gJy4uL3Byb3RvL0dyaWQuanMnO1xyXG5cclxuXHJcbmV4cG9ydCBjb25zdCBhZGQgPSBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIGxldCBhID0gYXJndW1lbnRzOyBcclxuXHJcbiAgICAgICAgbGV0IHR5cGUsIG8sIHJlZiA9IGZhbHNlLCBuID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYoIHR5cGVvZiBhWzBdID09PSAnc3RyaW5nJyApeyBcclxuXHJcbiAgICAgICAgICAgIHR5cGUgPSBhWzBdO1xyXG4gICAgICAgICAgICBvID0gYVsxXSB8fCB7fTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmICggdHlwZW9mIGFbMF0gPT09ICdvYmplY3QnICl7IC8vIGxpa2UgZGF0IGd1aVxyXG5cclxuICAgICAgICAgICAgcmVmID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYoIGFbMl0gPT09IHVuZGVmaW5lZCApIFtdLnB1c2guY2FsbChhLCB7fSk7XHJcblxyXG4gICAgICAgICAgICB0eXBlID0gYVsyXS50eXBlID8gYVsyXS50eXBlIDogJ3NsaWRlJzsvL2F1dG9UeXBlLmFwcGx5KCB0aGlzLCBhICk7XHJcblxyXG4gICAgICAgICAgICBvID0gYVsyXTtcclxuICAgICAgICAgICAgby5uYW1lID0gYVsxXTtcclxuICAgICAgICAgICAgby52YWx1ZSA9IGFbMF1bYVsxXV07XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5hbWUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgICAgIGlmKCBuYW1lID09PSAnZ3JvdXAnICkgby5hZGQgPSBhZGQ7XHJcblxyXG4gICAgICAgIHN3aXRjaCggbmFtZSApe1xyXG5cclxuICAgICAgICAgICAgY2FzZSAnYm9vbCc6IG4gPSBuZXcgQm9vbChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ2J1dHRvbic6IG4gPSBuZXcgQnV0dG9uKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnY2lyY3VsYXInOiBuID0gbmV3IENpcmN1bGFyKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnY29sb3InOiBuID0gbmV3IENvbG9yKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZnBzJzogbiA9IG5ldyBGcHMobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdncmFwaCc6IG4gPSBuZXcgR3JhcGgobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdncm91cCc6IG4gPSBuZXcgR3JvdXAobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdqb3lzdGljayc6IG4gPSBuZXcgSm95c3RpY2sobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdrbm9iJzogbiA9IG5ldyBLbm9iKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnbGlzdCc6IG4gPSBuZXcgTGlzdChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ251bWVyaWMnOiBjYXNlICdudW1iZXInOiBuID0gbmV3IE51bWVyaWMobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdzbGlkZSc6IG4gPSBuZXcgU2xpZGUobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0ZXh0SW5wdXQnOiBjYXNlICdzdHJpbmcnOiBuID0gbmV3IFRleHRJbnB1dChvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RpdGxlJzogbiA9IG5ldyBUaXRsZShvKTsgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3NlbGVjdCc6IG4gPSBuZXcgU2VsZWN0KG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnc2VsZWN0b3InOiBuID0gbmV3IFNlbGVjdG9yKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZW1wdHknOiBjYXNlICdzcGFjZSc6IG4gPSBuZXcgRW1wdHkobyk7IGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdpdGVtJzogbiA9IG5ldyBJdGVtKG8pOyBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAnZ3JpZCc6IG4gPSBuZXcgR3JpZChvKTsgYnJlYWs7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG4gIT09IG51bGwgKXtcclxuXHJcbiAgICAgICAgICAgIGlmKCByZWYgKSBuLnNldFJlZmVyZW5jeSggYVswXSwgYVsxXSApO1xyXG4gICAgICAgICAgICByZXR1cm4gbjtcclxuXHJcbiAgICAgICAgfVxyXG5cclxufSIsIlxyXG5pbXBvcnQgeyBSb290cyB9IGZyb20gJy4vUm9vdHMnO1xyXG5pbXBvcnQgeyBUb29scyB9IGZyb20gJy4vVG9vbHMnO1xyXG5pbXBvcnQgeyBhZGQgfSBmcm9tICcuL2FkZCc7XHJcbmltcG9ydCB7IFYyIH0gZnJvbSAnLi9WMic7XHJcblxyXG4vKipcclxuICogQGF1dGhvciBsdGggLyBodHRwczovL2dpdGh1Yi5jb20vbG8tdGhcclxuICovXHJcblxyXG5leHBvcnQgY2xhc3MgR3VpIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciggbyA9IHt9ICkge1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhcyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XHJcblxyXG4gICAgICAgIC8vIGNvbG9yXHJcbiAgICAgICAgdGhpcy5jb2xvcnMgPSBUb29scy5jbG9uZUNvbG9yKCk7XHJcbiAgICAgICAgdGhpcy5jc3MgPSBUb29scy5jbG9uZUNzcygpO1xyXG5cclxuXHJcbiAgICAgICAgaWYoIG8uY29uZmlnICkgdGhpcy5zZXRDb25maWcoIG8uY29uZmlnICk7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmJnID0gby5iZyB8fCB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kO1xyXG5cclxuICAgICAgICBpZiggby50cmFuc3BhcmVudCAhPT0gdW5kZWZpbmVkICl7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzLmJhY2tncm91bmQgPSAnbm9uZSc7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JzLmJhY2tncm91bmRPdmVyID0gJ25vbmUnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9pZiggby5jYWxsYmFjayApIHRoaXMuY2FsbGJhY2sgPSAgby5jYWxsYmFjaztcclxuXHJcbiAgICAgICAgdGhpcy5pc1Jlc2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy50bXBBZGQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudG1wSCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuaXNDYW52YXMgPSBvLmlzQ2FudmFzIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNDYW52YXNPbmx5ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jc3NHdWkgPSBvLmNzcyAhPT0gdW5kZWZpbmVkID8gby5jc3MgOiAnJztcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gby5jYWxsYmFjayAgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvLmNhbGxiYWNrO1xyXG5cclxuICAgICAgICB0aGlzLmZvcmNlSGVpZ2h0ID0gby5tYXhIZWlnaHQgfHwgMDtcclxuICAgICAgICB0aGlzLmxvY2tIZWlnaHQgPSBvLmxvY2tIZWlnaHQgfHwgZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaXNJdGVtTW9kZSA9IG8uaXRlbU1vZGUgIT09IHVuZGVmaW5lZCA/IG8uaXRlbU1vZGUgOiBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jbiA9ICcnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIC8vIHNpemUgZGVmaW5lXHJcbiAgICAgICAgdGhpcy5zaXplID0gVG9vbHMuc2l6ZTtcclxuICAgICAgICBpZiggby5wICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUucCA9IG8ucDtcclxuICAgICAgICBpZiggby53ICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUudyA9IG8udztcclxuICAgICAgICBpZiggby5oICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUuaCA9IG8uaDtcclxuICAgICAgICBpZiggby5zICE9PSB1bmRlZmluZWQgKSB0aGlzLnNpemUucyA9IG8ucztcclxuXHJcbiAgICAgICAgdGhpcy5zaXplLmggPSB0aGlzLnNpemUuaCA8IDExID8gMTEgOiB0aGlzLnNpemUuaDtcclxuXHJcbiAgICAgICAgLy8gbG9jYWwgbW91c2UgYW5kIHpvbmVcclxuICAgICAgICB0aGlzLmxvY2FsID0gbmV3IFYyKCkubmVnKCk7XHJcbiAgICAgICAgdGhpcy56b25lID0geyB4OjAsIHk6MCwgdzp0aGlzLnNpemUudywgaDowIH07XHJcblxyXG4gICAgICAgIC8vIHZpcnR1YWwgbW91c2VcclxuICAgICAgICB0aGlzLm1vdXNlID0gbmV3IFYyKCkubmVnKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaCA9IDA7XHJcbiAgICAgICAgdGhpcy5wcmV2WSA9IC0xO1xyXG4gICAgICAgIHRoaXMuc3cgPSAwO1xyXG5cclxuICAgICAgICBcclxuXHJcbiAgICAgICAgLy8gYm90dG9tIGFuZCBjbG9zZSBoZWlnaHRcclxuICAgICAgICB0aGlzLmlzV2l0aENsb3NlID0gby5jbG9zZSAhPT0gdW5kZWZpbmVkID8gby5jbG9zZSA6IHRydWU7XHJcbiAgICAgICAgdGhpcy5iaCA9ICF0aGlzLmlzV2l0aENsb3NlID8gMCA6IHRoaXMuc2l6ZS5oO1xyXG5cclxuICAgICAgICB0aGlzLmF1dG9SZXNpemUgPSBvLmF1dG9SZXNpemUgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvLmF1dG9SZXNpemU7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5pc0NlbnRlciA9IG8uY2VudGVyIHx8IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNPcGVuID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmlzRG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNTY3JvbGwgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy51aXMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZGVjYWwgPSAwO1xyXG4gICAgICAgIHRoaXMucmF0aW8gPSAxO1xyXG4gICAgICAgIHRoaXMub3kgPSAwO1xyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuaXNOZXdUYXJnZXQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50ID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnIHdpZHRoOjBweDsgaGVpZ2h0OmF1dG87IHRvcDowcHg7ICcgKyB0aGlzLmNzc0d1aSApO1xyXG5cclxuICAgICAgICB0aGlzLmlubmVyQ29udGVudCA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3dpZHRoOjEwMCU7IHRvcDowOyBsZWZ0OjA7IGhlaWdodDphdXRvOyBvdmVyZmxvdzpoaWRkZW47Jyk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LmFwcGVuZENoaWxkKCB0aGlzLmlubmVyQ29udGVudCApO1xyXG5cclxuICAgICAgICB0aGlzLmlubmVyID0gVG9vbHMuZG9tKCAnZGl2JywgdGhpcy5jc3MuYmFzaWMgKyAnd2lkdGg6MTAwJTsgbGVmdDowOyAnKTtcclxuICAgICAgICB0aGlzLmlubmVyQ29udGVudC5hcHBlbmRDaGlsZCh0aGlzLmlubmVyKTtcclxuXHJcbiAgICAgICAgLy8gc2Nyb2xsXHJcbiAgICAgICAgdGhpcy5zY3JvbGxCRyA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ3JpZ2h0OjA7IHRvcDowOyB3aWR0aDonKyAodGhpcy5zaXplLnMgLSAxKSArJ3B4OyBoZWlnaHQ6MTBweDsgZGlzcGxheTpub25lOyBiYWNrZ3JvdW5kOicrdGhpcy5iZysnOycpO1xyXG4gICAgICAgIHRoaXMuY29udGVudC5hcHBlbmRDaGlsZCggdGhpcy5zY3JvbGxCRyApO1xyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbCA9IFRvb2xzLmRvbSggJ2RpdicsIHRoaXMuY3NzLmJhc2ljICsgJ2JhY2tncm91bmQ6Jyt0aGlzLmNvbG9ycy5zY3JvbGwrJzsgcmlnaHQ6MnB4OyB0b3A6MDsgd2lkdGg6JysodGhpcy5zaXplLnMtNCkrJ3B4OyBoZWlnaHQ6MTBweDsnKTtcclxuICAgICAgICB0aGlzLnNjcm9sbEJHLmFwcGVuZENoaWxkKCB0aGlzLnNjcm9sbCApO1xyXG5cclxuICAgICAgICAvLyBib3R0b20gYnV0dG9uXHJcblxyXG4gICAgICAgIGxldCByID0gby5yYWRpdXMgfHwgdGhpcy5jb2xvcnMucmFkaXVzO1xyXG4gICAgICAgIHRoaXMuYm90dG9tID0gVG9vbHMuZG9tKCAnZGl2JywgIHRoaXMuY3NzLnR4dCArICd3aWR0aDoxMDAlOyB0b3A6YXV0bzsgYm90dG9tOjA7IGxlZnQ6MDsgYm9yZGVyLWJvdHRvbS1yaWdodC1yYWRpdXM6JytyKydweDsgIGJvcmRlci1ib3R0b20tbGVmdC1yYWRpdXM6JytyKydweDsgdGV4dC1hbGlnbjpjZW50ZXI7IGhlaWdodDonK3RoaXMuYmgrJ3B4OyBsaW5lLWhlaWdodDonKyh0aGlzLmJoLTUpKydweDsnKTsvLyBib3JkZXItdG9wOjFweCBzb2xpZCAnK1Rvb2xzLmNvbG9ycy5zdHJva2UrJzsnKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnQuYXBwZW5kQ2hpbGQoIHRoaXMuYm90dG9tICk7XHJcbiAgICAgICAgdGhpcy5ib3R0b20udGV4dENvbnRlbnQgPSAnQ2xvc2UnO1xyXG4gICAgICAgIHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmJnO1xyXG5cclxuICAgICAgICAvL1xyXG5cclxuICAgICAgICB0aGlzLnBhcmVudCA9IG8ucGFyZW50ICE9PSB1bmRlZmluZWQgPyBvLnBhcmVudCA6IG51bGw7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBvLnRhcmdldCAhPT0gdW5kZWZpbmVkID8gby50YXJnZXQgOiB0aGlzLnBhcmVudDtcclxuICAgICAgICBcclxuICAgICAgICBpZiggdGhpcy5wYXJlbnQgPT09IG51bGwgJiYgIXRoaXMuaXNDYW52YXMgKXsgXHJcbiAgICAgICAgXHR0aGlzLnBhcmVudCA9IGRvY3VtZW50LmJvZHk7XHJcbiAgICAgICAgICAgIC8vIGRlZmF1bHQgcG9zaXRpb25cclxuICAgICAgICBcdGlmKCAhdGhpcy5pc0NlbnRlciApIHRoaXMuY29udGVudC5zdHlsZS5yaWdodCA9ICcxMHB4JzsgXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiggdGhpcy5wYXJlbnQgIT09IG51bGwgKSB0aGlzLnBhcmVudC5hcHBlbmRDaGlsZCggdGhpcy5jb250ZW50ICk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzQ2FudmFzICYmIHRoaXMucGFyZW50ID09PSBudWxsICkgdGhpcy5pc0NhbnZhc09ubHkgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNDYW52YXNPbmx5ICkgdGhpcy5jb250ZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSAnYXV0byc7XHJcblxyXG5cclxuICAgICAgICB0aGlzLnNldFdpZHRoKCk7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzQ2FudmFzICkgdGhpcy5tYWtlQ2FudmFzKCk7XHJcblxyXG4gICAgICAgIFJvb3RzLmFkZCggdGhpcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRUb3AgKCB0LCBoICkge1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRlbnQuc3R5bGUudG9wID0gdCArICdweCc7XHJcbiAgICAgICAgaWYoIGggIT09IHVuZGVmaW5lZCApIHRoaXMuZm9yY2VIZWlnaHQgPSBoO1xyXG4gICAgICAgIHRoaXMuc2V0SGVpZ2h0KCk7XHJcblxyXG4gICAgICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvL2NhbGxiYWNrOiBmdW5jdGlvbiAoKSB7fSxcclxuXHJcbiAgICBkaXNwb3NlICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIGlmKCB0aGlzLnBhcmVudCAhPT0gbnVsbCApIHRoaXMucGFyZW50LnJlbW92ZUNoaWxkKCB0aGlzLmNvbnRlbnQgKTtcclxuICAgICAgICBSb290cy5yZW1vdmUoIHRoaXMgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBDQU5WQVNcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBvbkRyYXcgKCkge31cclxuXHJcbiAgICBtYWtlQ2FudmFzICgpIHtcclxuXHJcbiAgICBcdHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsIFwiY2FudmFzXCIgKTtcclxuICAgIFx0dGhpcy5jYW52YXMud2lkdGggPSB0aGlzLnpvbmUudztcclxuICAgIFx0dGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5mb3JjZUhlaWdodCA/IHRoaXMuZm9yY2VIZWlnaHQgOiB0aGlzLnpvbmUuaDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZHJhdyAoIGZvcmNlICkge1xyXG5cclxuICAgIFx0aWYoIHRoaXMuY2FudmFzID09PSBudWxsICkgcmV0dXJuO1xyXG5cclxuICAgIFx0bGV0IHcgPSB0aGlzLnpvbmUudztcclxuICAgIFx0bGV0IGggPSB0aGlzLmZvcmNlSGVpZ2h0ID8gdGhpcy5mb3JjZUhlaWdodCA6IHRoaXMuem9uZS5oO1xyXG4gICAgXHRSb290cy50b0NhbnZhcyggdGhpcywgdywgaCwgZm9yY2UgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8vLy8vXHJcblxyXG4gICAgZ2V0RG9tICgpIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudDtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0TW91c2UgKCBtICkge1xyXG5cclxuICAgICAgICB0aGlzLm1vdXNlLnNldCggbS54LCBtLnkgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29uZmlnICggbyApIHtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRDb2xvcnMoIG8gKTtcclxuICAgICAgICB0aGlzLnNldFRleHQoIG8uZm9udFNpemUsIG8udGV4dCwgby5mb250LCBvLnNoYWRvdyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZXRDb2xvcnMgKCBvICkge1xyXG5cclxuICAgICAgICBmb3IoIGxldCBjIGluIG8gKXtcclxuICAgICAgICAgICAgaWYoIHRoaXMuY29sb3JzW2NdICkgdGhpcy5jb2xvcnNbY10gPSBvW2NdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCAoIHNpemUsIGNvbG9yLCBmb250LCBzaGFkb3cgKSB7XHJcblxyXG4gICAgICAgIFRvb2xzLnNldFRleHQoIHNpemUsIGNvbG9yLCBmb250LCBzaGFkb3csIHRoaXMuY29sb3JzLCB0aGlzLmNzcyApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBoaWRlICggYiApIHtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50LnN0eWxlLmRpc3BsYXkgPSBiID8gJ25vbmUnIDogJ2Jsb2NrJztcclxuICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBvbkNoYW5nZSAoIGYgKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBmIHx8IG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU1RZTEVTXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgbW9kZSAoIG4gKSB7XHJcblxyXG4gICAgXHRsZXQgbmVlZENoYW5nZSA9IGZhbHNlO1xyXG5cclxuICAgIFx0aWYoIG4gIT09IHRoaXMuY24gKXtcclxuXHJcblx0ICAgIFx0dGhpcy5jbiA9IG47XHJcblxyXG5cdCAgICBcdHN3aXRjaCggbiApe1xyXG5cclxuXHQgICAgXHRcdGNhc2UgJ2RlZic6IFxyXG5cdCAgICBcdFx0ICAgdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbDsgXHJcblx0ICAgIFx0XHQgICB0aGlzLmJvdHRvbS5zdHlsZS5iYWNrZ3JvdW5kID0gdGhpcy5jb2xvcnMuYmFja2dyb3VuZDtcclxuXHQgICAgXHRcdCAgIHRoaXMuYm90dG9tLnN0eWxlLmNvbG9yID0gdGhpcy5jb2xvcnMudGV4dDtcclxuXHQgICAgXHRcdGJyZWFrO1xyXG5cclxuXHQgICAgXHRcdC8vY2FzZSAnc2Nyb2xsRGVmJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNjcm9sbDsgYnJlYWs7XHJcblx0ICAgIFx0XHRjYXNlICdzY3JvbGxPdmVyJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgYnJlYWs7XHJcblx0ICAgIFx0XHRjYXNlICdzY3JvbGxEb3duJzogdGhpcy5zY3JvbGwuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmRvd247IGJyZWFrO1xyXG5cclxuXHQgICAgXHRcdC8vY2FzZSAnYm90dG9tRGVmJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLmJhY2tncm91bmQ7IGJyZWFrO1xyXG5cdCAgICBcdFx0Y2FzZSAnYm90dG9tT3Zlcic6IHRoaXMuYm90dG9tLnN0eWxlLmJhY2tncm91bmQgPSB0aGlzLmNvbG9ycy5iYWNrZ3JvdW5kT3ZlcjsgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSAnI0ZGRic7IGJyZWFrO1xyXG5cdCAgICBcdFx0Ly9jYXNlICdib3R0b21Eb3duJzogdGhpcy5ib3R0b20uc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JzLnNlbGVjdDsgdGhpcy5ib3R0b20uc3R5bGUuY29sb3IgPSAnIzAwMCc7IGJyZWFrO1xyXG5cclxuXHQgICAgXHR9XHJcblxyXG5cdCAgICBcdG5lZWRDaGFuZ2UgPSB0cnVlO1xyXG5cclxuXHQgICAgfVxyXG5cclxuICAgIFx0cmV0dXJuIG5lZWRDaGFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgVEFSR0VUXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2xlYXJUYXJnZXQgKCkge1xyXG5cclxuICAgIFx0aWYoIHRoaXMuY3VycmVudCA9PT0gLTEgKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgLy9pZighdGhpcy50YXJnZXQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnRhcmdldC51aW91dCgpO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0LnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IC0xO1xyXG5cclxuICAgICAgICAvLy9jb25zb2xlLmxvZyh0aGlzLmlzRG93bikvL2lmKHRoaXMuaXNEb3duKVJvb3RzLmNsZWFySW5wdXQoKTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgICAgIFJvb3RzLmN1cnNvcigpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIFpPTkUgVEVTVFxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHRlc3Rab25lICggZSApIHtcclxuXHJcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxvY2FsO1xyXG4gICAgICAgIGlmKCBsLnggPT09IC0xICYmIGwueSA9PT0gLTEgKSByZXR1cm4gJyc7XHJcblxyXG4gICAgICAgIHRoaXMuaXNSZXNldCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9ICcnO1xyXG5cclxuICAgICAgICBsZXQgcyA9IHRoaXMuaXNTY3JvbGwgPyAgdGhpcy56b25lLncgIC0gdGhpcy5zaXplLnMgOiB0aGlzLnpvbmUudztcclxuICAgICAgICBcclxuICAgICAgICBpZiggbC55ID4gdGhpcy56b25lLmggLSB0aGlzLmJoICYmICBsLnkgPCB0aGlzLnpvbmUuaCApIG5hbWUgPSAnYm90dG9tJztcclxuICAgICAgICBlbHNlIG5hbWUgPSBsLnggPiBzID8gJ3Njcm9sbCcgOiAnY29udGVudCc7XHJcblxyXG4gICAgICAgIHJldHVybiBuYW1lO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAgIEVWRU5UU1xyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIGhhbmRsZUV2ZW50ICggZSApIHtcclxuXHJcbiAgICBcdGxldCB0eXBlID0gZS50eXBlO1xyXG5cclxuICAgIFx0bGV0IGNoYW5nZSA9IGZhbHNlO1xyXG4gICAgXHRsZXQgdGFyZ2V0Q2hhbmdlID0gZmFsc2U7XHJcblxyXG4gICAgXHRsZXQgbmFtZSA9IHRoaXMudGVzdFpvbmUoIGUgKTtcclxuXHJcbiAgICAgICAgXHJcblxyXG4gICAgXHRpZiggdHlwZSA9PT0gJ21vdXNldXAnICYmIHRoaXMuaXNEb3duICkgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuICAgIFx0aWYoIHR5cGUgPT09ICdtb3VzZWRvd24nICYmICF0aGlzLmlzRG93biApIHRoaXMuaXNEb3duID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNEb3duICYmIHRoaXMuaXNOZXdUYXJnZXQgKXsgUm9vdHMuY2xlYXJJbnB1dCgpOyB0aGlzLmlzTmV3VGFyZ2V0PWZhbHNlOyB9XHJcblxyXG4gICAgXHRpZiggIW5hbWUgKSByZXR1cm47XHJcblxyXG4gICAgXHRzd2l0Y2goIG5hbWUgKXtcclxuXHJcbiAgICBcdFx0Y2FzZSAnY29udGVudCc6XHJcblxyXG4gICAgICAgICAgICAgICAgZS5jbGllbnRZID0gdGhpcy5pc1Njcm9sbCA/ICBlLmNsaWVudFkgKyB0aGlzLmRlY2FsIDogZS5jbGllbnRZO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmKCBSb290cy5pc01vYmlsZSAmJiB0eXBlID09PSAnbW91c2Vkb3duJyApIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcblxyXG5cdCAgICBcdFx0aWYoIHRoaXMudGFyZ2V0ICkgdGFyZ2V0Q2hhbmdlID0gdGhpcy50YXJnZXQuaGFuZGxlRXZlbnQoIGUgKTtcclxuXHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlbW92ZScgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ2RlZicpO1xyXG4gICAgICAgICAgICAgICAgaWYoIHR5cGUgPT09ICd3aGVlbCcgJiYgIXRhcmdldENoYW5nZSAmJiB0aGlzLmlzU2Nyb2xsICkgY2hhbmdlID0gdGhpcy5vbldoZWVsKCBlICk7XHJcbiAgICAgICAgICAgICAgIFxyXG5cdCAgICBcdFx0aWYoICFSb290cy5sb2NrICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0TmV4dCggZSwgY2hhbmdlICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgXHRcdGJyZWFrO1xyXG4gICAgXHRcdGNhc2UgJ2JvdHRvbSc6XHJcblxyXG5cdCAgICBcdFx0dGhpcy5jbGVhclRhcmdldCgpO1xyXG5cdCAgICBcdFx0aWYoIHR5cGUgPT09ICdtb3VzZW1vdmUnICkgY2hhbmdlID0gdGhpcy5tb2RlKCdib3R0b21PdmVyJyk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlZG93bicgKSB7XHJcblx0ICAgIFx0XHRcdHRoaXMuaXNPcGVuID0gdGhpcy5pc09wZW4gPyBmYWxzZSA6IHRydWU7XHJcblx0XHQgICAgICAgICAgICB0aGlzLmJvdHRvbS50ZXh0Q29udGVudCA9IHRoaXMuaXNPcGVuID8gJ0Nsb3NlJyA6ICdPcGVuJztcclxuXHRcdCAgICAgICAgICAgIHRoaXMuc2V0SGVpZ2h0KCk7XHJcblx0XHQgICAgICAgICAgICB0aGlzLm1vZGUoJ2RlZicpO1xyXG5cdFx0ICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuXHQgICAgXHRcdH1cclxuXHJcbiAgICBcdFx0YnJlYWs7XHJcbiAgICBcdFx0Y2FzZSAnc2Nyb2xsJzpcclxuXHJcblx0ICAgIFx0XHR0aGlzLmNsZWFyVGFyZ2V0KCk7XHJcblx0ICAgIFx0XHRpZiggdHlwZSA9PT0gJ21vdXNlbW92ZScgKSBjaGFuZ2UgPSB0aGlzLm1vZGUoJ3Njcm9sbE92ZXInKTtcclxuXHQgICAgXHRcdGlmKCB0eXBlID09PSAnbW91c2Vkb3duJyApIGNoYW5nZSA9IHRoaXMubW9kZSgnc2Nyb2xsRG93bicpOyBcclxuICAgICAgICAgICAgICAgIGlmKCB0eXBlID09PSAnd2hlZWwnICkgY2hhbmdlID0gdGhpcy5vbldoZWVsKCBlICk7IFxyXG5cdCAgICBcdFx0aWYoIHRoaXMuaXNEb3duICkgdGhpcy51cGRhdGUoIChlLmNsaWVudFktdGhpcy56b25lLnkpLSh0aGlzLnNoKjAuNSkgKTtcclxuXHJcbiAgICBcdFx0YnJlYWs7XHJcblxyXG5cclxuICAgIFx0fVxyXG5cclxuICAgIFx0aWYoIHRoaXMuaXNEb3duICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgIFx0aWYoIHRhcmdldENoYW5nZSApIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlID09PSAna2V5dXAnICkgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICBpZiggdHlwZSA9PT0gJ2tleWRvd24nICkgY2hhbmdlID0gdHJ1ZTtcclxuXHJcbiAgICBcdGlmKCBjaGFuZ2UgKSB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TmV4dCAoIGUsIGNoYW5nZSApIHtcclxuXHJcblxyXG5cclxuICAgICAgICBsZXQgbmV4dCA9IFJvb3RzLmZpbmRUYXJnZXQoIHRoaXMudWlzLCBlICk7XHJcblxyXG4gICAgICAgIGlmKCBuZXh0ICE9PSB0aGlzLmN1cnJlbnQgKXtcclxuICAgICAgICAgICAgdGhpcy5jbGVhclRhcmdldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXh0O1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pc05ld1RhcmdldCA9IHRydWU7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoIG5leHQgIT09IC0xICl7IFxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMudWlzWyB0aGlzLmN1cnJlbnQgXTtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQudWlvdmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBvbldoZWVsICggZSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5veSArPSAyMCplLmRlbHRhO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCB0aGlzLm95ICk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgUkVTRVRcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICByZXNldCAoIGZvcmNlICkge1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc1Jlc2V0ICkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvL3RoaXMucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIHRoaXMubW91c2UubmVnKCk7XHJcbiAgICAgICAgdGhpcy5pc0Rvd24gPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy9Sb290cy5jbGVhcklucHV0KCk7XHJcbiAgICAgICAgbGV0IHIgPSB0aGlzLm1vZGUoJ2RlZicpO1xyXG4gICAgICAgIGxldCByMiA9IHRoaXMuY2xlYXJUYXJnZXQoKTtcclxuXHJcbiAgICAgICAgaWYoIHIgfHwgcjIgKSB0aGlzLmRyYXcoIHRydWUgKTtcclxuXHJcbiAgICAgICAgdGhpcy5pc1Jlc2V0ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgLy9Sb290cy5sb2NrID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgQUREIE5PREVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBhZGQgKCkge1xyXG5cclxuICAgICAgICBsZXQgYSA9IGFyZ3VtZW50cztcclxuXHJcbiAgICAgICAgbGV0IG9udG9wID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0eXBlb2YgYVsxXSA9PT0gJ29iamVjdCcgKXsgXHJcblxyXG4gICAgICAgICAgICBhWzFdLmlzVUkgPSB0cnVlO1xyXG4gICAgICAgICAgICBhWzFdLm1haW4gPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgb250b3AgPSBhWzFdLm9udG9wID8gYVsxXS5vbnRvcCA6IGZhbHNlO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYoIHR5cGVvZiBhWzFdID09PSAnc3RyaW5nJyApe1xyXG5cclxuICAgICAgICAgICAgaWYoIGFbMl0gPT09IHVuZGVmaW5lZCApIFtdLnB1c2guY2FsbChhLCB7IGlzVUk6dHJ1ZSwgbWFpbjp0aGlzIH0pO1xyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFbMl0uaXNVSSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBhWzJdLm1haW4gPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgICAgIG9udG9wID0gYVsxXS5vbnRvcCA/IGFbMV0ub250b3AgOiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICB9IFxyXG5cclxuICAgICAgICBsZXQgdSA9IGFkZC5hcHBseSggdGhpcywgYSApO1xyXG5cclxuICAgICAgICBpZiggdSA9PT0gbnVsbCApIHJldHVybjtcclxuXHJcbiAgICAgICAgaWYob250b3ApIHRoaXMudWlzLnVuc2hpZnQoIHUgKTtcclxuICAgICAgICBlbHNlIHRoaXMudWlzLnB1c2goIHUgKTtcclxuXHJcbiAgICAgICAgaWYoICF1LmF1dG9XaWR0aCApe1xyXG4gICAgICAgICAgICBsZXQgeSA9IHUuY1swXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XHJcbiAgICAgICAgICAgIGlmKCB0aGlzLnByZXZZICE9PSB5ICl7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGMoIHUuaCArIDEgKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucHJldlkgPSB5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMucHJldlkgPSAwOy8vLTE7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsYyggdS5oICsgMSApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc0VtcHR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHJldHVybiB1O1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBhcHBseUNhbGMgKCkge1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMudWlzLmxlbmd0aCwgdGhpcy50bXBIIClcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjKCB0aGlzLnRtcEggKTtcclxuICAgICAgICAvL3RoaXMudG1wSCA9IDA7XHJcbiAgICAgICAgdGhpcy50bXBBZGQgPSBudWxsO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjYWxjVWlzICgpIHtcclxuXHJcbiAgICAgICAgUm9vdHMuY2FsY1VpcyggdGhpcy51aXMsIHRoaXMuem9uZSwgdGhpcy56b25lLnkgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gcmVtb3ZlIG9uZSBub2RlXHJcblxyXG4gICAgcmVtb3ZlICggbiApIHtcclxuXHJcbiAgICAgICAgaWYoIG4uY2xlYXIgKSBuLmNsZWFyKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNhbGwgYWZ0ZXIgdWlzIGNsZWFyXHJcblxyXG4gICAgY2xlYXJPbmUgKCBuICkgeyBcclxuXHJcbiAgICAgICAgbGV0IGlkID0gdGhpcy51aXMuaW5kZXhPZiggbiApOyBcclxuICAgICAgICBpZiAoIGlkICE9PSAtMSApIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxjKCAtICh0aGlzLnVpc1sgaWQgXS5oICsgMSApICk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5uZXIucmVtb3ZlQ2hpbGQoIHRoaXMudWlzWyBpZCBdLmNbMF0gKTtcclxuICAgICAgICAgICAgdGhpcy51aXMuc3BsaWNlKCBpZCwgMSApOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNsZWFyIGFsbCBndWlcclxuXHJcbiAgICBlbXB0eSAoKSB7XHJcblxyXG4gICAgICAgIC8vdGhpcy5jbG9zZSgpO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aCwgaXRlbTtcclxuXHJcbiAgICAgICAgd2hpbGUoIGktLSApe1xyXG4gICAgICAgICAgICBpdGVtID0gdGhpcy51aXMucG9wKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaW5uZXIucmVtb3ZlQ2hpbGQoIGl0ZW0uY1swXSApO1xyXG4gICAgICAgICAgICBpdGVtLmNsZWFyKCB0cnVlICk7XHJcblxyXG4gICAgICAgICAgICAvL3RoaXMudWlzW2ldLmNsZWFyKClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNFbXB0eSA9IHRydWU7XHJcbiAgICAgICAgLy9Sb290cy5saXN0ZW5zID0gW107XHJcbiAgICAgICAgdGhpcy5jYWxjKCAtdGhpcy5oICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvL3RoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG5cclxuICAgICAgICAvKmxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKCBpLS0gKSB0aGlzLnVpc1tpXS5jbGVhcigpO1xyXG5cclxuICAgICAgICB0aGlzLnVpcyA9IFtdO1xyXG4gICAgICAgIFJvb3RzLmxpc3RlbnMgPSBbXTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxjKCAtdGhpcy5oICk7Ki9cclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBJVEVNUyBTUEVDSUFMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAgIHJlc2V0SXRlbSAoKSB7XHJcblxyXG4gICAgICAgIGlmKCAhdGhpcy5pc0l0ZW1Nb2RlICkgcmV0dXJuO1xyXG5cclxuICAgICAgICBsZXQgaSA9IHRoaXMudWlzLmxlbmd0aDtcclxuICAgICAgICB3aGlsZShpLS0pIHRoaXMudWlzW2ldLnNlbGVjdGVkKCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNldEl0ZW0gKCBuYW1lICkge1xyXG5cclxuICAgICAgICBpZiggIXRoaXMuaXNJdGVtTW9kZSApIHJldHVybjtcclxuXHJcbiAgICAgICAgbmFtZSA9IG5hbWUgfHwgJyc7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXRJdGVtKCk7XHJcblxyXG4gICAgICAgIGlmKCAhbmFtZSApe1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgwKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gXHJcblxyXG4gICAgICAgIGxldCBpID0gdGhpcy51aXMubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlKGktLSl7IFxyXG4gICAgICAgICAgICBpZiggdGhpcy51aXNbaV0udmFsdWUgPT09IG5hbWUgKXsgXHJcbiAgICAgICAgICAgICAgICB0aGlzLnVpc1tpXS5zZWxlY3RlZCggdHJ1ZSApO1xyXG4gICAgICAgICAgICAgICAgaWYoIHRoaXMuaXNTY3JvbGwgKSB0aGlzLnVwZGF0ZSggKCBpKih0aGlzLnVpc1tpXS5oKzEpICkqdGhpcy5yYXRpbyApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vICAgU0NST0xMXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgdXBTY3JvbGwgKCBiICkge1xyXG5cclxuICAgICAgICB0aGlzLnN3ID0gYiA/IHRoaXMuc2l6ZS5zIDogMDtcclxuICAgICAgICB0aGlzLm95ID0gYiA/IHRoaXMub3kgOiAwO1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsQkcuc3R5bGUuZGlzcGxheSA9IGIgPyAnYmxvY2snIDogJ25vbmUnO1xyXG5cclxuICAgICAgICBpZiggYiApe1xyXG5cclxuICAgICAgICAgICAgdGhpcy50b3RhbCA9IHRoaXMuaDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubWF4VmlldyA9IHRoaXMubWF4SGVpZ2h0O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yYXRpbyA9IHRoaXMubWF4VmlldyAvIHRoaXMudG90YWw7XHJcbiAgICAgICAgICAgIHRoaXMuc2ggPSB0aGlzLm1heFZpZXcgKiB0aGlzLnJhdGlvO1xyXG5cclxuICAgICAgICAgICAgLy9pZiggdGhpcy5zaCA8IDIwICkgdGhpcy5zaCA9IDIwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMubWF4VmlldyAtIHRoaXMuc2g7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm95ID0gVG9vbHMuY2xhbXAoIHRoaXMub3ksIDAsIHRoaXMucmFuZ2UgKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsQkcuc3R5bGUuaGVpZ2h0ID0gdGhpcy5tYXhWaWV3ICsgJ3B4JztcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGwuc3R5bGUuaGVpZ2h0ID0gdGhpcy5zaCArICdweCc7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXRJdGVtV2lkdGgoIHRoaXMuem9uZS53IC0gdGhpcy5zdyApO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCB0aGlzLm95ICk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSAoIHkgKSB7XHJcblxyXG4gICAgICAgIHkgPSBUb29scy5jbGFtcCggeSwgMCwgdGhpcy5yYW5nZSApO1xyXG5cclxuICAgICAgICB0aGlzLmRlY2FsID0gTWF0aC5mbG9vciggeSAvIHRoaXMucmF0aW8gKTtcclxuICAgICAgICB0aGlzLmlubmVyLnN0eWxlLnRvcCA9IC0gdGhpcy5kZWNhbCArICdweCc7XHJcbiAgICAgICAgdGhpcy5zY3JvbGwuc3R5bGUudG9wID0gTWF0aC5mbG9vciggeSApICsgJ3B4JztcclxuICAgICAgICB0aGlzLm95ID0geTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gICBSRVNJWkUgRlVOQ1RJT05cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjYWxjICggeSApIHtcclxuXHJcbiAgICAgICAgdGhpcy5oICs9IHk7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KCB0aGlzLnRtcCApO1xyXG4gICAgICAgIHRoaXMudG1wID0gc2V0VGltZW91dCggdGhpcy5zZXRIZWlnaHQuYmluZCh0aGlzKSwgMTAgKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0SGVpZ2h0ICgpIHtcclxuXHJcbiAgICAgICAgaWYoIHRoaXMudG1wICkgY2xlYXJUaW1lb3V0KCB0aGlzLnRtcCApO1xyXG5cclxuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuaCApXHJcblxyXG4gICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5iaDtcclxuICAgICAgICB0aGlzLmlzU2Nyb2xsID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmKCB0aGlzLmlzT3BlbiApe1xyXG5cclxuICAgICAgICAgICAgbGV0IGhoaCA9IHRoaXMuZm9yY2VIZWlnaHQgPyB0aGlzLmZvcmNlSGVpZ2h0ICsgdGhpcy56b25lLnkgOiB3aW5kb3cuaW5uZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1heEhlaWdodCA9IGhoaCAtIHRoaXMuem9uZS55IC0gdGhpcy5iaDtcclxuXHJcbiAgICAgICAgICAgIGxldCBkaWZmID0gdGhpcy5oIC0gdGhpcy5tYXhIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICBpZiggZGlmZiA+IDEgKXsgLy90aGlzLmggPiB0aGlzLm1heEhlaWdodCApe1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNTY3JvbGwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy56b25lLmggPSB0aGlzLm1heEhlaWdodCArIHRoaXMuYmg7XHJcblxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuem9uZS5oID0gdGhpcy5oICsgdGhpcy5iaDtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cFNjcm9sbCggdGhpcy5pc1Njcm9sbCApO1xyXG5cclxuICAgICAgICB0aGlzLmlubmVyQ29udGVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLnpvbmUuaCAtIHRoaXMuYmggKyAncHgnO1xyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLnpvbmUuaCArICdweCc7XHJcbiAgICAgICAgdGhpcy5ib3R0b20uc3R5bGUudG9wID0gdGhpcy56b25lLmggLSB0aGlzLmJoICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuZm9yY2VIZWlnaHQgJiYgdGhpcy5sb2NrSGVpZ2h0ICkgdGhpcy5jb250ZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuZm9yY2VIZWlnaHQgKyAncHgnO1xyXG5cclxuICAgICAgICBpZiggdGhpcy5pc09wZW4gKSB0aGlzLmNhbGNVaXMoKTtcclxuICAgICAgICBpZiggdGhpcy5pc0NhbnZhcyApIHRoaXMuZHJhdyggdHJ1ZSApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXpvbmUgKCkge1xyXG4gICAgICAgIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFdpZHRoICggdyApIHtcclxuXHJcbiAgICAgICAgaWYoIHcgKSB0aGlzLnpvbmUudyA9IHc7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudC5zdHlsZS53aWR0aCA9IHRoaXMuem9uZS53ICsgJ3B4JztcclxuXHJcbiAgICAgICAgaWYoIHRoaXMuaXNDZW50ZXIgKSB0aGlzLmNvbnRlbnQuc3R5bGUubWFyZ2luTGVmdCA9IC0oTWF0aC5mbG9vcih0aGlzLnpvbmUudyowLjUpKSArICdweCc7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0SXRlbVdpZHRoKCB0aGlzLnpvbmUudyAtIHRoaXMuc3cgKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgaWYoICF0aGlzLmlzQ2FudmFzT25seSApIFJvb3RzLm5lZWRSZVpvbmUgPSB0cnVlO1xyXG4gICAgICAgIC8vdGhpcy5yZXNpemUoKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2V0SXRlbVdpZHRoICggdyApIHtcclxuXHJcbiAgICAgICAgbGV0IGkgPSB0aGlzLnVpcy5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUoaS0tKXtcclxuICAgICAgICAgICAgdGhpcy51aXNbaV0uc2V0U2l6ZSggdyApO1xyXG4gICAgICAgICAgICB0aGlzLnVpc1tpXS5yU2l6ZSgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn1cclxuXHJcbkd1aS5wcm90b3R5cGUuaXNHdWkgPSB0cnVlOyIsIi8vaW1wb3J0ICcuL3BvbHlmaWxscy5qcyc7XHJcblxyXG5leHBvcnQgY29uc3QgUkVWSVNJT04gPSAnMy4wJztcclxuXHJcbmV4cG9ydCB7IFRvb2xzIH0gZnJvbSAnLi9jb3JlL1Rvb2xzLmpzJztcclxuZXhwb3J0IHsgR3VpIH0gZnJvbSAnLi9jb3JlL0d1aS5qcyc7XHJcbmV4cG9ydCB7IFByb3RvIH0gZnJvbSAnLi9jb3JlL1Byb3RvLmpzJztcclxuZXhwb3J0IHsgYWRkIH0gZnJvbSAnLi9jb3JlL2FkZC5qcyc7XHJcbi8vXHJcbmV4cG9ydCB7IEJvb2wgfSBmcm9tICcuL3Byb3RvL0Jvb2wuanMnO1xyXG5leHBvcnQgeyBCdXR0b24gfSBmcm9tICcuL3Byb3RvL0J1dHRvbi5qcyc7XHJcbmV4cG9ydCB7IENpcmN1bGFyIH0gZnJvbSAnLi9wcm90by9DaXJjdWxhci5qcyc7XHJcbmV4cG9ydCB7IENvbG9yIH0gZnJvbSAnLi9wcm90by9Db2xvci5qcyc7XHJcbmV4cG9ydCB7IEZwcyB9IGZyb20gJy4vcHJvdG8vRnBzLmpzJztcclxuZXhwb3J0IHsgR3JvdXAgfSBmcm9tICcuL3Byb3RvL0dyb3VwLmpzJztcclxuZXhwb3J0IHsgSm95c3RpY2sgfSBmcm9tICcuL3Byb3RvL0pveXN0aWNrLmpzJztcclxuZXhwb3J0IHsgS25vYiB9IGZyb20gJy4vcHJvdG8vS25vYi5qcyc7XHJcbmV4cG9ydCB7IExpc3QgfSBmcm9tICcuL3Byb3RvL0xpc3QuanMnO1xyXG5leHBvcnQgeyBOdW1lcmljIH0gZnJvbSAnLi9wcm90by9OdW1lcmljLmpzJztcclxuZXhwb3J0IHsgU2xpZGUgfSBmcm9tICcuL3Byb3RvL1NsaWRlLmpzJztcclxuZXhwb3J0IHsgVGV4dElucHV0IH0gZnJvbSAnLi9wcm90by9UZXh0SW5wdXQuanMnO1xyXG5leHBvcnQgeyBUaXRsZSB9IGZyb20gJy4vcHJvdG8vVGl0bGUuanMnOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sQ0FBQyxHQUFHO0FBQ1Y7QUFDQSxJQUFJLElBQUksRUFBRSxRQUFRLENBQUMsc0JBQXNCLEVBQUU7QUFDM0M7QUFDQSxJQUFJLFNBQVMsRUFBRSxJQUFJO0FBQ25CLElBQUksVUFBVSxFQUFFLElBQUk7QUFDcEIsSUFBSSxVQUFVLEVBQUUsSUFBSTtBQUNwQixJQUFJLFFBQVEsRUFBRSxJQUFJO0FBQ2xCLElBQUksSUFBSSxFQUFFLElBQUk7QUFDZDtBQUNBLElBQUksS0FBSyxFQUFFLDRCQUE0QjtBQUN2QyxJQUFJLEtBQUssRUFBRSw4QkFBOEI7QUFDekMsSUFBSSxLQUFLLEVBQUUsOEJBQThCO0FBQ3pDO0FBQ0EsSUFBSSxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7QUFDbEksSUFBSSxVQUFVLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRTtBQUM1SixJQUFJLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsZUFBZSxFQUFFO0FBQ3BHO0FBQ0EsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFD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QyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNqSDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFO0FBQ3RCLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQyxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsUUFBUSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ2pDO0FBQ0EsUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLFFBQVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0RCxRQUFRLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7QUFDbEMsUUFBUSxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUNsRSxRQUFRLE9BQU8sQ0FBQyxDQUFDO0FBQ2pCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLEVBQUUsV0FBVyxDQUFDLEdBQUc7QUFDN0I7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJ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QUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztBQUMxSCxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDdkMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3BDO0FBQ0EsUUFBUSxJQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzVILFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3pIO0FBQ0E7QUFDQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN0RSxZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxSDtBQUNBO0FBQ0EsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDMUUsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsZUFBZSxDQUFDLENBQUM7QUFDMUU7QUFDQSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzFGLFlBQVksQ0FBQyxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQzNIO0FBQ0EsWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMxRixZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM1SDtBQUNBO0FBQ0E7QUFDQSxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUN0RixZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwRyxZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUM3RjtBQUNBLFlBQVksQ0FBQyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFDL0I7QUFDQSxTQUFTLE1BQU07QUFDZjtBQUNBLFlBQVksR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM1RixZQUFZLENBQUMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMxSDtBQUNBLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsd0JBQXdCLEVBQUUsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3JJLFlBQVksQ0FBQyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUMvRixZQUFZLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLGtCQUFrQixFQUFFLGNBQWMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNwSTtBQUNBLFlBQVksQ0FBQyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUM7QUFDL0IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksYUFBYSxFQUFFLFlBQVk7QUFDL0I7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNwQixRQUFRLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQUUsbUJBQW1CLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztBQUMxSCxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDdkMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3BDO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBUSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQzNCLFFBQVEsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUN4QixRQUFXLElBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBSztBQUM1RCxRQUFRLElBQUksRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUM7QUFDakQsUUFBUSxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDdkI7QUFDQSxRQUFRLE1BQU0sQ0FB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LEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxNQUFNLENBQUM7QUFDcEMsUUFBUSxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFO0FBQ2xDLFlBQVksUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUM5QyxZQUFZLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEdBQUc7QUFDMUM7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLElBQUksR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHO0FBQ3pGO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssSUFBSSxHQUFHLE9BQU87QUFDeEM7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLFVBQVUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQ25GO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQzlCLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDN0U7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFD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QUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM3RCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMvRDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDO0FBQ3hDO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNyRDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUM5QixRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUM7QUFDdEMsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDO0FBQzVDO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQzFCO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUM7QUFDeEMsUUFBUSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9CO0FBQ0E7QUFDQSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQy9DLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDL0M7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNyRDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEtBQUssU0FBUyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ2pEO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDNUIsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUN4QjtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3pDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztBQUNqRCxRQUFRLElBQUksQ0FBQyxDQUFDLEVBQUUsS0FBSyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN2RSxRQUFRLElBQUksQ0FBQyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUMvRDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDM0QsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7QUFDekQsUUFBUSxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDL0Q7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDaEU7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7QUFDaEMsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ3JDLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztBQUN2QztBQUNBLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FB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LENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDdEMsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7QUFDM0QsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQzNELFFBQVEsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxLQUFLLFNBQVMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQztBQUNyRTtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUM7QUFDZDtBQUNBLFFBQVEsT0FBTyxJQUFJLENBQUMsU0FBUztBQUM3QixZQUFZLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNO0FBQ2pDLFlBQVksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU07QUFDbkMsWUFBWSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsTUFBTTtBQUNwQyxZQUFZLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxNQUFNO0FBQ3JDLFlBQVksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLE1BQU07QUFDdEMsWUFBWSxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsTUFBTTtBQUN2QyxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDdkQsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdB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LEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNyRCxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFDL0I7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzFEO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLDJDQUEyQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMvTSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFDQUFxQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDdks7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQixRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0I7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFNBQVMsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNwQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDL0MsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdEIsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEIsUUFBUSxPQUFPLElBQUksQ0FBQztBQUNwQjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLE1BQU0sQ0FBQyxHQUFHO0FBQ2Q7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUN4QjtBQUNBLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNqRCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDbEQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUNyQztBQUNBLFNBQVMsTUFBTTtBQUNmO0FBQ0EsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQ2pELFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNsRCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3BDO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQzFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzdCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzdCO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FDekVPLE1BQU0sTUFBTSxTQUFTLEtBQUssQ0FBQztBQUNsQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDM0I7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQzFDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO0FBQ3JDO0FBQ0EsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztBQUN4QjtBQUNBLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDNUU7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUM7QUFDdEM7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDL0U7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3JELFFBQVEsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDM0QsUUFBUSxJQUFJLENBQUMsQ0FBQyxPQUFPLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUM3RCxRQUFRLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3pEO0FBQ0EsUUFBUSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQztBQUM1QztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3pEO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxD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RUFBRTtBQUNwQjtBQUNBLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1RSxTQUFTLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFEO0FBQ0EsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNoRCxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2pEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDL0IsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDO0FBQzNDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQy9CLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3BYTyxNQUFNLFFBQVEsU0FBUyxLQUFLLENBQUM7QUFDcEM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQy9CO0FBQ0EsUUFBUSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzlDO0FBQ0EsUUFBUSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ25DO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNsQztBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQy9CO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEMsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNyQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQzdDO0FBQ0EsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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QUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2xFO0FBQ0EsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDckMsWUFBWSxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDL0M7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ25DLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDbkM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDakU7QUFDQSxRQUFRLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckMsWUFBWSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7QUFDdkUsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQ2hDLFlBQVksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2xDLFlBQVksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQy9CLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLFFBQVEsQ0FBQyxHQUFHO0FBQ2hCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbkIsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xELFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN0QyxRQUFRLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNsRztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzlEO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUMxRCxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3JLTyxNQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDakM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQTtBQUNBO0FBQ0EsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDO0FBQ25DO0FBQ0EsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUN0QjtBQUNBLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUM3QyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzNDO0FBQ0E7QUFDQSxLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxNQUFNLENBQUM7QUFDbEMsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDNUM7QUFDQSxLQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6QjtBQUNBLEtBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDO0FBQzVCLEtBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFB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RSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25FO0FBQ0EsU0FBUyxNQUFNO0FBQ2Y7QUFDQSxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDaEMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2hDO0FBQ0EsU0FBUyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzlDLFNBQVMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNuQztBQUNBLFNBQVMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDakMsU0FBUyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3JDO0FBQ0EsU0FBUyxJQUFJLElBQUksR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDL0QsU0FBUyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNoRCxTQUFTLENBQUMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUU7QUFDN0IsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ2xDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BDLFNBQVMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckM7QUFDQSxTQUFTLElBQUksQ0FBQyxHQUFHLElBQUksR0FBRztBQUN4QixPQUFPLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLE9BQU8sSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDdkMsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hDLGVBQWUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDbkQ7QUFDQSxPQUFPLEdBQUcsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQzFCO0FBQ0EsT0FBTyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3hELE9BQU8sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QixPQUFPLENBQUMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN2QyxPQUFPO0FBQ1A7QUFDQSxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDcEQ7QUFDQSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1QyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNFLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNqQztBQUNBLFlBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDakQ7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMLElBQUk7QUFDSixHQUFHO0FBQ0g7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxTQUFTLENBQUMsR0FBRztBQUNkO0FBQ0EsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ2xFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbkMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCO0FBQ0EsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbEQsVUFBVSxLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDL0M7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLElBQUksQ0FBQyxHQUFHO0FBQ1Q7QUFDQSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNmO0FBQ0EsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbkI7QUFDQSxFQUFFLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM5QztBQUNBLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzlCO0FBQ0EsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7QUFDdEM7QUFDQSxLQUFLLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDNUI7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssQ0FBQyxHQUFHO0FBQ1Y7QUFDQSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoQjtBQUNBLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQzlDO0FB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ekIsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QjtBQUNBLEtBQUssSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzFDO0FBQ0EsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUN0QjtBQUNBLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLEVBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDcEMsRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkMsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0MsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0QyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDN0MsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdDO0FBQ0EsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDcEU7QUFDQSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1QyxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1QztBQUNBLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzdFLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDMUUsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDckQ7QUFDQSxFQUFFO0FBQ0Y7QUFDQSxDQUFDLEtBQUssQ0FBQyxHQUFHO0FBQ1Y7QUFDQTtBQUNBLEtBQUssS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ25CO0FBQ0EsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3BCO0FBQ0EsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ2pDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNoQztBQUNBLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDaEM7QUFDQSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUM7QUFDNUQsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNyQztBQUNBLEVBQUU7QUFDRjtBQUNBLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ2xCO0FBQ0EsRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU87QUFDaEM7QUFDQSxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCO0FBQ0EsRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2pCO0FBQ0E7QUFDQSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUM1RCxLQUFLLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQy9DO0FBQ0EsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDL0UsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ3BDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNyQztBQUNBLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDcEM7QUFDQSxLQUFLLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbkMsS0FBSyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzdDLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsRUFBRTtB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LENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxRQUFRLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDdkU7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNsRSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNsRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUNqRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxDQUFDO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyw0REFBNEQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQzNMO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsb0NBQW9DLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxrREFBa0QsRUFBRSxDQUFDO0FBQzFKO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLDJFQUEyRSxDQUFDLENBQUM7QUFDdEo7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCO0FBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUNqQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDcEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQztBQUNqQztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0FBQ3RFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCO0FBQ0EsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDO0FBQ0EsWUFBWSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7QUFDMUIsWUFBWSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMs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QUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUMxRDtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7QUFDeEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDcEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDcEMsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUMzQjtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNuRDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN2RDtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDbkUsYUFBYSxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDM0Q7QUFDQSxRQUFRLElBQUksQ0FBQyxD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SSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQ3RELFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsU0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMzQjtBQUNBLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDdEYsY0FBYyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztBQUM3RDtBQUNBLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDNUg7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDeEI7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEVBQUU7QUFDckMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUMxQyxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDO0FBQzlDLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUk7QUFDOUMsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQzdCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsR0FBRztBQUNqQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzFFO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QztBQUNBO0FBQ0EsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDdkUsWUFBWSxJQUFJLENBQUMs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QSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksUUFBUSxDQUFDLEdBQUc7QUFDaEI7QUFDQSxLQUFLLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUN0QztBQUNBO0FBQ0EsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNyQztBQUNBLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzdDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JDO0FBQ0EsTUFBTSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDO0FBQzNCLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3ZCO0FBQ0EsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDdEQsV0FBVyxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDekUsTUFBTSxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ2pEO0FBQ0EsTUFBTSxFQUFFLEdBQUcsR0FBRTtBQUNiLE1BQU0sRUFBRSxHQUFHLEVBQUM7QUFDWjtBQUNBLE1BQU07QUFDTjtBQUNBLEtBQUssT0FBTyxDQUFDLENBQUM7QUFDZDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ2pFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNuQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDbkM7QUFDQSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzdCLFFBQVEsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0M7QUFDQSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDO0FBQy9DLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEM7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0FBQ3JCO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FDN1FPLE1BQU0sS0FBSyxTQUFTLEtBQUssQ0FBQztBQUNqQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQ3pCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUN0QjtBQUNBLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUMxQixRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUN2QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzVCO0FBQ0EsUUFBUSxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdDO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQzVEO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLHdEQUF3RCxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUgsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLDBEQUEwRCxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDekwsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLDREQUE0RCxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDM0w7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxF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QUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNuQztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUM5QztBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUM7QUFDRDtBQUNBLEtBQUssQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLElBQUk7O0FDdll2QixNQUFNLFFBQVEsU0FBUyxLQUFLLENBQUM7QUFDcEM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBQy9CO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLENBQUMsT0FBTyxHQUFHLFlBQVksQ0FBQztBQUNwQyxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDdkQ7QUFDQSxRQUFRLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7QUFDMUMsUUFBUSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDO0FBQ2xEO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7QUFDNUIsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQzdCO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO0FBQ25DLFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN6QztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BDLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFDckI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRztBQUN0QztBQUNBLFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO0FBQ2pELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUNqRCxZQUFZLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQzFCLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekI7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcseUJBQXlCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzdJLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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QUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDM0QsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0QsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7QUFDM0QsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN6RTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDbkI7QUFDQSxRQUFRLEdBQUcsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0FBQzlDLFFBQVEsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3pCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUc7QUFDbEI7QUFDQSxRQUFRLElBQUksRUFBRSxLQUFLLFNBQVMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3pDO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO0FBQ3BDO0FBQ0EsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUM5QjtBQUNBLGdCQUFnQixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDM0M7QUFDQSxnQkFBZ0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDNUUsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzVFO0FBQ0EsZ0JBQWdCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZFO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDekI7QUFDQSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3QjtBQUNBO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BEO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsR0FBRztBQUNqQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM5RCxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDOUQ7QUFDQSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7QUFDN0I7QUFDQSxZQUFZLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM5QyxZQUFZLElBQUksRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMvQztBQUNBLFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3RCxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDN0QsU0FBUyxNQUFNO0FBQ2YsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVELFlBQVksSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM1RCxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FB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SUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPO0FBQ2xDO0FBQ0EsUUFBUSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0FBQzlCO0FBQ0EsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQzFELFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3JFO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUM5QztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdEc7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2RCxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDekQ7QUFDQSxRQUFRLElBQUksS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0FBQ3RDLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDO0FBQ2hEO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEtBQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQ2pFO0FBQ0EsUUFBUSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzVDLFlBQVksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM1QyxZQUFZLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztBQUN2RSxZQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7QUFDaEMsWUFBWSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDbEMsWUFBWSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDL0IsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxRQUFRLENBQUMsR0FBRztBQUNoQjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3pELFFBQVEsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQzVDLFFBQVEsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO0FBQzFDO0FBQ0E7QUFDQSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkIsWUFBWSxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzVDLFlBQVksSUFBSSxHQUFHLEVBQUUsVUFBVSxHQUFHLFFBQVEsS0FBSyxLQUFLLENBQUM7QUFDckQsU0FBUyxNQUFNO0FBQ2YsWUFBWSxJQUFJLEdBQUcsQ0FBQyxFQUFFLFVBQVUsR0FBRyxRQUFRLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyRCxZQUFZLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO0FBQzFCLFNBQVM7QUFDVDtBQUNBLFFBQVEsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRztBQUMzQztBQUNBLFlBQVksQ0FBQyxHQUFHLFVBQVUsS0FBSyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDMUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQy9DLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztBQUMvQyxZQUFZLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7QUFDaEQsWUFBWSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDO0FBQ2hELFlBQVksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDO0FBQzlEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxPQUFPLENBQUMsQ0FBQztBQUNqQjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzNDLFFBQVEsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzVEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFDO0FBQzlEO0FBQ0EsUUFBUSxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFFBQVEsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QjtBQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUNqQyxRQUFRLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNsQyxRQUFRLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFDakMsUUFBUSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNyRjtBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3QjtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3JNTyxNQUFNLElBQUksU0FBUyxLQUFLLENBQUM7QUFDaEM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNqQyxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7QUFDckMsUUFBUSxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUN6RCxRQUFRLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO0FBQ3JDO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUMzQixRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxRQUFRLENBQUM7QUFDeEM7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDdkI7QUFDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUM7QUFDNUM7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekM7QUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUMxRDtBQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxzQkFBc0IsRUFBRSxDQUFDO0FBQy9FLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2hOLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxrREFBa0QsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2pMO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLHdEQUF3RCxDQUFDLENBQUM7QUFDcEg7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQy9DO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ2pDLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDeEI7QUFDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3JEO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUM7QUFDcEM7QUFDQSxRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJ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QUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoRTtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDL0MsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM5QyxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQzlDO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDdkQsUUFBUSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDcEQ7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ3ZDLFlBQVksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNuQyxZQUFZLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFNBQVM7QUFDVDtBQUNBLFFBQVEsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3BCLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUM7QUFDQSxZQUFZLENBQUMsR0FBRyxJQUFJ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LENBQUMsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3BDO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUU7QUFDckIsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDcEQsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0QsU0FBUyxNQUFNO0FBQ2YsWUFBWSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDL0QsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNwQztBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM3QjtBQUNBLFFBQVEsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzFDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUQ7QUFDQSxRQUFRLElBQUksQ0FB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QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUU7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ2xDLFFBQVEsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ3JEO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUc7QUFDbEI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQ2xDO0FBQ0EsUUFBUSxNQUFNLENBQUMsRUFBRSxDQUFDO0FBQ2xCLGFBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzVFLGFBQWEsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekQsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0I7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRztBQUNmO0FBQ0EsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQzNCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO0FBQ3RDO0FBQ0EsWUFBWSxJQUFJLElBQUksQ0FB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RSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQzVFLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsWUFBWSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNwRCxZQUFZLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3JELFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3ZaTyxNQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDakM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEM7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQztBQUNsQyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3ZELFFBQVEsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0FBQzFEO0FBQ0Es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LENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDbEY7QUFDQSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztBQUN6RCxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUM7QUFDbkUsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ25FO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0I7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ2xDLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO0FBQ3pCLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDdEQsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNuQztBQUNBO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDdkI7QUFDQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDekMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDO0FBQ3pDO0FBQ0EsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ25DLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzlCLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQztBQUNuQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUM5QixRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDekM7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QjtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQzNPTyxNQUFNLFNBQVMsU0FBUyxLQUFLLENBQUM7QUFDckM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFD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QUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN0QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLElBQUksS0FBSyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsRCxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMzQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3REO0FBQ0EsUUFBUSxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMzRDtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLElBQUk7QUFDZjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUMzQztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3ZCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDaEMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUM7QUFDaEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxD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LENBQUMsQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDO0FBQzNDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQztBQUNqRDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoSCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQztBQUN2QztBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3BCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUc7QUFDakI7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUNwQztBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEVBQUUsR0FBRyxHQUFHO0FBQ2xCO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDcEM7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQ3hDLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FB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LFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNFO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUMxRCxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN0RCxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN4RDtBQUNBLFFBQVEsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN0QyxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQVEsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDdkI7QUFDQSxRQUFRLElBQUksR0FBRyxDQUFDO0FBQ2hCO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN6QztBQUNBLFlBQVksR0FBRyxHQUFHLEtBQUssQ0FBQztBQUN4QixZQUFZLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7QUFDM0Q7QUFDQSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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LEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTTtBQUNuSSxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsTUFBTTtBQUNuSTtBQUNBLGFBQWE7QUFDYjtBQUNBLFlBQVksTUFBTSxHQUFHLElBQUksQ0FBQztBQUMxQjtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQUN0QjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxJQUFJLEtBQUssQ0FBQyxHQUFHO0FBQ2I7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN0QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQztBQUN6QjtBQUNBLFFBQVEsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0M7QUFDQSxZQUFZLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDMUUsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDekMsWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzNCLFNBQVM7QUFDVDtBQUNBLFFBQVEsT0FBTyxDQUFDLENBQUM7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUc7QUFDeEI7QUFDQSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25CLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDO0FBQ3ZDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRztBQUMxQjtBQUNBLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkIsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDO0FBQ2pELFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDO0FBQ3JDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQ3JCO0FBQ0EsUUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUN4QixRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7QUFDeEI7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDekIsUUFBUSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDcEIsUUFBUSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztBQUN0RDtBQUNBLFFBQVEsTUFBTSxDQUFDLEVBQUUsQ0FBQztBQUNsQjtBQUNBLFNBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUM1RSxTQUFTLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzFELFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDaEQsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUNqRDtBQUNBLFNBQVM7QUFDVDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ3RPTyxNQUFNLEtBQUssU0FBUyxLQUFLLENBQUM7QUFDakM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsS0FBSyxDQUFDLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNyQixLQUFLLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3RCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQjtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQ2JPLE1BQU0sSUFBSSxTQUFTLEtBQUssQ0FBQztBQUNoQztBQUNBLElBQUksV0FBVyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUc7QUFDMUI7QUFDQSxRQUFRLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNuQjtBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7QUFDckIsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7QUFDOUIsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUN4QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQztBQUN2QyxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM5QjtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QztBQUNBLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyw0REFBNEQsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEw7QUFDQSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDekM7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDL0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDcEI7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQzlDO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0FBQzlCO0FBQ0EsUUFBUSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDcEI7QUFDQSxRQUFRLE9BQU8sSUFBSSxDQUFDO0FBQ3BCO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxLQUFLLENBQUMsR0FBRztBQUNiO0FBQ0EsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QyxhQUFhLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUI7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLE1BQU0sQ0FBQyxHQUFHO0FBQ2Q7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLGFBQWEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxQjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksTUFBTSxDQUFDLEdBQUc7QUFDZDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ2Y7QUFDQSxRQUFRLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUMzQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMvQjtBQUNBLFlBQVksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDNUI7QUFDQSxZQUFZLFFBQVEsQ0FBQztBQUNyQjtBQUNBLGdCQUFnQixLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsQ0FBQyxNQUFNO0FBQ2hILGdCQUFnQixLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTTtBQUNySCxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU07QUFDNUgsZ0JBQWdCLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNO0FBQzFIO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsWUFBWSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQzFCO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxPQUFPLE1BQU0sQ0FBQztBQUN0QjtBQUNBLEtBQUs7QUFDTDtBQUNBLElBQUksS0FBSyxDQUFDLEdBQUc7QUFDYjtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUNsQjtBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekM7QUFDQSxRQUFRLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQztBQUNuQztBQUNBLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQ3BITyxNQUFNLElBQUksU0FBUyxLQUFLLENBQUM7QUFDaEM7QUFDQSxJQUFJLFdBQVcsRUFBRSxDQUFDLEdBQUcsRUFBRSxHQUFHO0FBQzFCO0FBQ0EsUUFBUSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkI7QUFDQSxRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzNCLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUNyQztBQUNBLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDNUU7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDNUI7QUFDQSxRQUFRLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUMxRCxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztBQUN0RCxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUN4RDtBQUNBLFFBQVEsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3pDLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3pDO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEM7QUFDQSxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDdEMsUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUN0QixRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3ZC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LENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2pEO0FBQ0EsUUFBUSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzNCLFFBQVEsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUMzQjtBQUNBLFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDcEIsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQixRQUFRLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLFFBQVEsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixRQUFRLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDcEIsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdEQsU0FBUztBQUNUO0FBQ0EsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6QixRQUFRLE9BQU8sQ0FBQyxFQUFFLEVBQUU7QUFDcEIsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7QUFDNUQsU0FBUztBQUNUO0FBQ0EsUUFBUSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENB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QUcsQ0FBQyxDQUFDO0FBQ3RCO0FBQ0EsUUFBUSxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDO0FBQzVDLFFBQVEsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDbEMsUUFBUSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ3ZELFFBQVEsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxNQUFNLFNBQVMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztBQUN0RTtBQUNBLFFBQVEsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztBQUM1QyxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUM7QUFDaEQ7QUFDQSxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFFBQVEsS0FBSyxTQUFTLEdBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDeEU7QUFDQSxRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ3JCO0FBQ0E7QUFDQSxRQUFRLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztBQUMvQixRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRCxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsRDtBQUNBLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMxRDtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDcEMsUUFBUSxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDckQ7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3BDO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNuQixRQUFRLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDeEIsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSyxLQUFLLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsRSxRQUFRLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN0RDtBQUNBLFFBQVEsSUFBSSxDQUFD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UUFBUSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzFFO0FBQ0EsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxRQUFRLENBQUM7QUFDaEYsYUFBYSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLFNBQVMsQ0FBQztBQUNuRDtBQUNBLFFBQVEsT0FBTyxJQUFJLENBQUM7QUFDcEI7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHO0FBQ3RCO0FBQ0EsS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3ZCO0FBQ0EsS0FBSyxJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDeEIsS0FBSyxJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7QUFDOUI7QUFDQSxLQUFLLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0EsS0FBSyxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNqRSxLQUFLLElBQUksSUFBSSxLQUFLLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkU7QUFDQSxRQUFRLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJ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QyxLQUFLLENBQUM7QUFDaEQ7QUFDQTtBQUNBO0FBQ0EsWUFBWSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztBQUNoRDtBQUNBLFlBQVksSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM1RDtBQUNBLFlBQVksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQzdELFlBQVksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDO0FBQ3REO0FBQ0EsU0FBUztBQUNUO0FBQ0EsUUFBUSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztBQUNuRCxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQy9CO0FBQ0EsS0FBSztBQUNMO0FBQ0EsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUc7QUFDakI7QUFDQSxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzVDO0FBQ0EsUUFBUSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNsRCxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ25ELFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENB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
