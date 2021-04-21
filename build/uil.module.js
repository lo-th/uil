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

    lerpColor: function( c1, c2, factor ) {
        let newColor = {};
        for ( let i = 0; i < 3; i++ ) {
          newColor[i] = c1[ i ] + ( c2[ i ] - c1[ i ] ) * factor;
        }
        return newColor;
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

    p255: function ( c ) {
        let h = Math.round( ( c * 255 ) ).toString( 16 );
        if ( h.length < 2 ) h = '0' + h;
        return h;
    },

    pack: function ( c ) {

        return '#' + T.p255( c[ 0 ] ) + T.p255( c[ 1 ] ) + T.p255( c[ 2 ] );

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

        this.isCyclic = o.cyclic || false;
        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;

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
                if ( this.model > 0 ) {

                    let color = Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( this.fontColor, -0.75) ), Tools.unpack( this.fontColor ), this.percent ) );
                    this.setSvg( this.c[3], 'stroke', color, 1 );
                
                } else {
                    this.setSvg( this.c[3], 'stroke', this.fontColor, 1 );
                }
            break;
            case 1: // over
                this.s[2].color = this.colorPlus;
                this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.3)', 0);
                if ( this.model > 0 ) {

                    let color = Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( this.fontColor, -0.75) ), Tools.unpack( this.fontColor ), this.percent ) );
                    this.setSvg( this.c[3], 'stroke', color, 1 );
                
                } else {
                    this.setSvg( this.c[3], 'stroke', this.colorPlus, 1 );
                }
            break;
        }

        this.cmode = mode;
        return true;

    }

    reset () {

        this.isDown = false;
        
    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        
        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
        else return 'circular';

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

    wheel ( e ) {

        let name = this.testZone( e );

        if( name === 'circular' ) {
    
            let v = this.value - this.step * e.delta;
    
            if ( v > this.max ) {
                v = this.isCyclic ? this.min : this.max;
            } else if ( v < this.min ) {
                v = this.isCyclic ? this.max : this.min;
            }
    
            this.setValue( v );
            this.old = v;
            this.update( true );

            return true;
    
        }
        return false;

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

        if ( this.model > 0 ) {

            let color = Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( this.fontColor, -0.75) ), Tools.unpack( this.fontColor ), this.percent ) );
            this.setSvg( this.c[3], 'stroke', color, 1 );
        
        }

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

        this.isCyclic = o.cyclic || false;
        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;

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

        if ( this.model > 0 ) {

            Tools.dom( 'path', '', { d: '', stroke: this.fontColor, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, this.c[3] ); //4

        }

        this.r = 0;

        this.init();

        this.update();

    }

    mode ( mode ) {

        if( this.cmode === mode ) return false;

        switch( mode ) {
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

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        
        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
        else return 'knob';

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

    wheel ( e ) {

        let name = this.testZone( e );

        if( name === 'knob' ) {
    
            let v = this.value - this.step * e.delta;
    
            if ( v > this.max ) {
                v = this.isCyclic ? this.min : this.max;
            } else if ( v < this.min ) {
                v = this.isCyclic ? this.max : this.min;
            }
    
            this.setValue( v );
            this.old = v;
            this.update( true );

            return true;
    
        }
        return false;

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

        let sa = Math.PI + this.mPI;
        let ea = ( ( this.percent * this.cirRange ) - ( this.mPI ) );

        let sin = Math.sin( ea );
        let cos = Math.cos( ea );

        let x1 = ( 25 * sin ) + 64;
        let y1 = -( 25 * cos ) + 64;
        let x2 = ( 20 * sin ) + 64;
        let y2 = -( 20 * cos ) + 64;

        this.setSvg( this.c[3], 'd', 'M ' + x1 +' ' + y1 + ' L ' + x2 +' ' + y2, 1 );
        
        if ( this.model > 0 ) {

            let x1 = 36 * Math.sin( sa ) + 64;
            let y1 = 36 * Math.cos( sa ) + 64;
            let x2 = 36 * sin + 64;
            let y2 = -36 * cos + 64;
            let big = ea <= Math.PI - this.mPI ? 0 : 1;
            this.setSvg( this.c[3], 'd', 'M ' + x1 + ',' + y1 + ' A ' + 36 + ',' + 36 + ' 1 ' + big + ' 1 ' + x2 + ',' + y2, 4 );

            let color = Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( this.fontColor, -0.75) ), Tools.unpack( this.fontColor ), this.percent ) );
            this.setSvg( this.c[3], 'stroke', color, 4 );
        
        }

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
        this.isCyclic = o.cyclic || false;

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

    wheel ( e ) {

        let name = this.testZone( e );
    
        if( name === 'scroll' ) {
    
            let v = this.value - this.step * e.delta;
    
            if ( v > this.max ) {
                v = this.isCyclic ? this.min : this.max;
            } else if ( v < this.min ) {
                v = this.isCyclic ? this.max : this.min;
            }
    
            this.setValue(v);
            this.old = v;
            this.update( true );

            return true;
    
        }
              
        return false;
    
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

        this.value = o.value || null;//this.values[0];

        this.isSelectable = true;
        if( o.selectable!== undefined ) this.isSelectable = o.selectable;



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
            if( this.values[i] === this.value && this.isSelectable ) sel = true;

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:'+this.radius+'px;' );
            this.c[i+2].style.background = sel ? this.buttonDown : this.buttonColor;
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
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i;
        }

        return -1;

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

    	//let name = this.testZone( e );

       // if( !name ) return false;

        let id = this.testZone( e );

        if( id < 0 ) return false;

    	this.isDown = true;
        //this.value = this.values[ name-2 ];
        this.value = this.values[ id ];
        this.send();
    	return this.mousemove( e );
 
        // true;

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
    //   MODE
    // ----------------------

    modes ( n, id ) {

        let v, r = false;

        let i = this.lng;
        while(i--){

            if( i === id ) v = this.mode( n, i );
            else {
                if( this.isSelectable ){
                    if( this.values[ i ] === this.value ) v = this.mode( 3, i );
                    else v = this.mode( 1, i );
                }
                else v = this.mode( 1, i );
            }

            if( v ) r = true;

        }

        return r;

    }

    mode ( n, id ) {

        let change = false;
        let i = id+2;

        if( this.stat[id] !== n ){

            switch( n ){

                case 1: this.stat[id] = 1; this.s[ i ].color = this.fontColor;  this.s[ i ].background = this.buttonColor; break;
                case 2: this.stat[id] = 2; this.s[ i ].color = this.fontSelect; this.s[ i ].background = this.buttonOver; break;
                case 3: this.stat[id] = 3; this.s[ i ].color = this.fontSelect; this.s[ i ].background = this.buttonDown; break;

            }

            change = true;

        }
        
        return change;

    }

    // ----------------------

    reset () {

        this.cursor();
        return this.modes( 1 , -1 );

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

        //this.value = o.value || false;
        this.values = o.values || [];

        if( typeof this.values === 'string' ) this.values = [ this.values ];

        this.value = o.value || null;


        this.isSelectable = o.selectable || false;

        //this.selected = null;
        this.isDown = false;

        this.buttonColor = o.bColor || this.colors.button;
        this.buttonOver = o.bOver || this.colors.over;
        this.buttonDown = o.bDown || this.colors.select;

        this.spaces = o.spaces || [5,3];
        this.bsize = o.bsize || [90,20];

        this.bsizeMax = this.bsize[0];

        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];
        this.grid = [ 2, Math.round( this.lng * 0.5 ) ];
        this.h = this.grid[1] * ( this.bsize[1] + this.spaces[1] ) + this.spaces[1];

        this.c[1].textContent = '';

        this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; top:'+(this.spaces[1]-2)+'px; height:auto; border-collapse:separate; border:none; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1]-2)+'px;' );

        let n = 0, b, td, tr, sel;

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

                    sel = false;
                    if( this.values[n] === this.value && this.isSelectable ) sel = true;

                    b = document.createElement( 'div' );
                    b.style.cssText = this.css.txt + this.css.button + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; border:'+this.colors.buttonBorder+'; left:auto; right:auto; border-radius:'+this.radius+'px;';
                    b.style.background = sel ? this.buttonDown : this.buttonColor;
                    b.style.color = sel ? this.fontSelect : this.fontColor;
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
            //this.value = false;
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
        this.value = this.values[ id ];
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
    //   MODE
    // -----------------------

    modes ( n, id ) {

        let v, r = false;

        let i = this.lng;
        while(i--){

            if( i === id ) v = this.mode( n, i );
            else {
                if( this.isSelectable ){
                    if( this.values[ i ] === this.value ) v = this.mode( 3, i );
                    else v = this.mode( 1, i );
                }
                else v = this.mode( 1, i );
            }

            if(v) r = true;

        }

        return r;

    }

    mode ( n, id ) {

        let change = false;

        if( this.stat[id] !== n ){
        
            switch( n ){

                case 1: this.stat[id] = 1; this.buttons[ id ].style.color = this.fontColor;  this.buttons[ id ].style.background = this.buttonColor; break;
                case 2: this.stat[id] = 2; this.buttons[ id ].style.color = this.fontSelect; this.buttons[ id ].style.background = this.buttonOver; break;
                case 3: this.stat[id] = 3; this.buttons[ id ].style.color = this.fontSelect; this.buttons[ id ].style.background = this.buttonDown; break;

            }

            change = true;

        }

        return change;

    }

    // ----------------------

    reset () {

        this.cursor();
        return this.modes( 1 , -1 );

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
        this.isOpen = o.open !== undefined ? o.open : true;
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
        this.bottomText = o.bottomText || ['open', 'close'];

        let r = o.radius || this.colors.radius;
        this.bottom = Tools.dom( 'div',  this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:'+r+'px;  border-bottom-left-radius:'+r+'px; text-align:center; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px;');// border-top:1px solid '+Tools.colors.stroke+';');
        this.content.appendChild( this.bottom );
        this.bottom.textContent = this.isOpen ? this.bottomText[1] : this.bottomText[0];
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
		            this.bottom.textContent = this.isOpen ? this.bottomText[1] : this.bottomText[0];
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
