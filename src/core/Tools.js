/**
 * @author lth / https://github.com/lo-th
 */

import { Roots } from './Roots.js';

const T = {

    transition: 0.2,

    frag: document.createDocumentFragment(),

    colorRing: null,
    joystick_0: null,
    joystick_1: null,
    circular: null,
    knob: null,
    pad2d: null,

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

    defineColor: function( o, cc = T.colors ) {

        let color = { ...cc }

        let textChange = ['fontFamily', 'fontWeight', 'fontShadow', 'fontSize' ]
        let changeText = false

        if( o.font ) o.fontFamily = o.font
        if( o.shadow ) o.fontShadow = o.shadow
        if( o.weight ) o.fontWeight = o.weight

        if( o.fontColor ) o.text = o.fontColor
        if( o.color ) o.text = o.color

        if( o.text ){
            color.text = o.text
            if( !o.fontColor && !o.color ){ 
                color.title = T.ColorLuma( o.text, -0.25 )
                color.titleoff = T.ColorLuma( o.text, -0.5 )
            }
            color.textOver = T.ColorLuma( o.text, 0.25 )
            color.textSelect = T.ColorLuma( o.text, 0.5 )
        }

        if( o.button ){
            color.button = o.button
            color.border = T.ColorLuma( o.button, 0.1 )
            color.overoff = T.ColorLuma( o.button, 0.2 )
        }

        if( o.select ){
            color.select = o.select
            color.over = T.ColorLuma( o.select, -0.1 )
        }

        if( o.itemBg ) o.back = o.itemBg

        if( o.back ){
            color.back = o.back
            color.backoff = T.ColorLuma( o.back, -0.1 )
        }

        if( o.fontSelect ) color.textSelect = o.fontSelect
        if( o.groupBorder ) color.gborder = o.groupBorder

        if( o.transparent ) o.bg = 'none'
        if( o.bg ) color.background = color.backgroundOver = o.bg
        if( o.bgOver ) color.backgroundOver = o.bgOver

        for( let m in color ){
            if(o[m]) color[m] = o[m]
        }

        for( let m in o ){
            if( textChange.indexOf(m) !== -1 ) changeText = true 
        }

        if( changeText ) T.defineText( color )

        return color

    },

    colors: {

        content:'none',
        background: 'rgba(50,50,50,0.3)',
        backgroundOver: 'rgba(50,50,50,0.4)',

        title : '#CCC',
        titleoff : '#BBB',
        text : '#DDD',
        textOver : '#EEE',
        textSelect : '#FFF',
        
        //inputBg: 'rgba(0,0,0,0.25)',
        //itemBg:'rgba(0,0,0,0.25)',

        back:'rgba(0,0,0,0.2)',
        backoff:'rgba(0,0,0,0.3)',
        //inputOver: 'rgba(0,0,0,0.2)',

        // input and button border
        border : '#4c4c4c',
        borderSize : 1,
        gborder : 'none',

        button : '#3c3c3c',
        overoff : '#5c5c5c',
        over : '#024699',
        select : '#308AFF',
        action: '#FF3300',
        

        //fontFamily: 'Tahoma',
        fontFamily: 'Consolas,monaco,monospace',
        fontWeight: 'normal',
        fontShadow: '#000',
        fontSize:12,


        radius:4,
        hide: 'rgba(0,0,0,0)',

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
        load:'M 14 8 L 12 8 12 12 2 12 2 8 0 8 0 14 14 14 14 8 M 8 5 L 8 0 6 0 6 5 3 5 7 9 11 5 8 5 Z',

    },

    rezone () {
        Roots.needReZone = true;
    },

    getImput: function(){

        return Roots.input ? true : false

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

    defineText: function( o ){

        T.setText( o.fontSize, o.text, o.fontFamily, o.fontShadow, o.fontWeight )

    },

    setText: function( size, color, font, shadow, weight ){

        let cc = T.colors;

        if( font === undefined ) font = cc.fontFamily
        if( size === undefined ) size = cc.fontSize
        if( shadow === undefined ) shadow = cc.fontShadow
        if( weight === undefined ) weight = cc.fontWeight
        if( color === undefined ) color = cc.text
        

        let align = 'display:flex; justify-content:left; align-items:center; text-align:left;'

        T.css.txt = T.css.basic + align + 'font-family:'+ font +'; font-weight:'+weight+'; font-size:'+size+'px; color:'+cc.text+'; padding:0px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';
        if( shadow !== 'none' ) T.css.txt += ' text-shadow: 1px 1px 1px '+shadow+';';

        T.css.txtselect = T.css.txt + 'padding:0px 4px; border:1px dashed ' + cc.border + ';';
        //T.css.item = T.css.txt + ' position:relative; margin-bottom:1px; '//display:block; padding:4px 4px;';//
        T.css.item = T.css.txt + ' position:relative; margin-bottom:1px; display:block; padding:2px 4px;';//

    },


    // note

    //https://developer.mozilla.org/fr/docs/Web/CSS/css_flexible_box_layout/aligning_items_in_a_flex_container

    /*cloneColor: function () {

        let cc = Object.assign({}, T.colors );
        return cc;

    },*/

    // intern function

    cloneCss: function () {

        //let cc = Object.assign({}, T.css );
        return { ...T.css };

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
    //   SVG Effects function
    // ----------------------

    addSVGGlowEffect: function () {

        if ( document.getElementById( 'UILGlow') !== null ) return;

        let svgFilter = T.initUILEffects();

        let filter = T.addAttributes( svgFilter, 'filter', { id: 'UILGlow', x: '-20%', y: '-20%', width: '140%', height: '140%' } );
        T.addAttributes( filter, 'feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '3', result: 'uilBlur' } );
        let feMerge = T.addAttributes( filter, 'feMerge', {  } );
        
        for( let i = 0; i <= 3; i++ ) {

            T.addAttributes( feMerge, 'feMergeNode', { in: 'uilBlur' } );
        
        }

        T.addAttributes( feMerge, 'feMergeNode', { in: 'SourceGraphic' } );

    },

    initUILEffects: function () {

        let svgFilter = document.getElementById( 'UILSVGEffects');
        
        if ( svgFilter === null ) {
            
            svgFilter = T.dom( 'svg', undefined , { id: 'UILSVGEffects', width: '0', height: '0' } );
            document.body.appendChild( svgFilter );
 
        }

        return svgFilter;

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

    makePad: function ( model ) {

        let ww = 256
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+ww+' '+ww, width:ww, height:ww, preserveAspectRatio:'none' } );
        let w = 200; 
        let d = (ww-w)*0.5, m = 20;
        Tools.dom( 'rect', '', { x: d, y: d,  width: w, height: w, fill:T.colors.back }, svg ); // 0
        Tools.dom( 'rect', '', { x: d+m*0.5, y: d+m*0.5, width: w - m , height: w - m, fill:T.colors.button }, svg ); // 1
        // Pointer
        Tools.dom( 'line', '', { x1: d+(m*0.5), y1: ww *0.5, x2: d+(w-m*0.5), y2: ww * 0.5, stroke:T.colors.back, 'stroke-width': 2 }, svg ); // 2
        Tools.dom( 'line', '', { x1: ww * 0.5, x2: ww * 0.5, y1: d+(m*0.5), y2: d+(w-m*0.5), stroke:T.colors.back, 'stroke-width': 2 }, svg ); // 3
        Tools.dom( 'circle', '', { cx: ww * 0.5, cy: ww * 0.5, r:5, stroke: T.colors.text, 'stroke-width': 5, fill:'none' }, svg ); // 4
        T.pad2d = svg;

    },

    makeKnob: function ( model ) {

        let w = 128;
        let radius = 34;
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'round' }, svg );//1
        T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.1)', 'stroke-width':7 , fill:'none'}, svg );//2
        T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
        T.knob = svg;

    },

    makeCircular: function ( model ) {

        let w = 128;
        let radius = 40;
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'circle', '', { cx:64, cy:64, r:radius, stroke:'rgba(0,0,0,0.1)', 'stroke-width':10, fill:'none' }, svg );//0
        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':7, fill:'none', 'stroke-linecap':'butt' }, svg );//1
        T.circular = svg;

    },

    makeJoystick: function ( model ) {

        //+' background:#f00;'

        let w = 128, ccc;
        let radius = Math.floor((w-30)*0.5);
        let innerRadius = Math.floor(radius*0.6);
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
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
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'defs', null, {}, svg );
        T.dom( 'g', null, {}, svg );

        let s = 30;//stroke
        let r =( w-s )*0.5;
        let mid = w*0.5;
        let n = 24, nudge = 8 / r / n * Math.PI, a1 = 0, d1;
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
            d1 = d2;
        }

        let br = (128 - s ) + 2;
        let bw = 60;

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
        //color = color || '#DEDEDE';
        let viewBox = '0 0 256 256';
        //let viewBox = '0 0 '+ w +' '+ w;
        let t = ["<svg xmlns='"+T.svgns+"' version='1.1' xmlns:xlink='"+T.htmls+"' style='pointer-events:none;' preserveAspectRatio='xMinYMax meet' x='0px' y='0px' width='"+w+"px' height='"+w+"px' viewBox='"+viewBox+"'><g>"];
        switch(type){
            case 'logo':
            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logoFill_d+"'/>";
            break;
            case 'donate':
            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logo_donate+"'/>";
            break;
            case 'neo':
            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logo_neo+"'/>";
            break;
            case 'github':
            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logo_github+"'/>";
            break;
            case 'save':
            t[1]="<path stroke='"+color+"' stroke-width='4' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 26.125 17 L 20 22.95 14.05 17 M 20 9.95 L 20 22.95'/><path stroke='"+color;
            t[1]+="' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 32.6 23 L 32.6 25.5 Q 32.6 28.5 29.6 28.5 L 10.6 28.5 Q 7.6 28.5 7.6 25.5 L 7.6 23'/>";
            break;
        }
        t[2] = "</g></svg>";
        return t.join("\n");

    },

    logoFill_d:`
    M 171 150.75 L 171 33.25 155.5 33.25 155.5 150.75 Q 155.5 162.2 147.45 170.2 139.45 178.25 128 178.25 116.6 178.25 108.55 170.2 100.5 162.2 100.5 150.75 
    L 100.5 33.25 85 33.25 85 150.75 Q 85 168.65 97.55 181.15 110.15 193.75 128 193.75 145.9 193.75 158.4 181.15 171 168.65 171 150.75 
    M 200 33.25 L 184 33.25 184 150.8 Q 184 174.1 167.6 190.4 151.3 206.8 128 206.8 104.75 206.8 88.3 190.4 72 174.1 72 150.8 L 72 33.25 56 33.25 56 150.75 
    Q 56 180.55 77.05 201.6 98.2 222.75 128 222.75 157.8 222.75 178.9 201.6 200 180.55 200 150.75 L 200 33.25 Z
    `,

    logo_github:`
    M 180.5 70 Q 186.3 82.4 181.55 96.55 196.5 111.5 189.7 140.65 183.65 168.35 146 172.7 152.5 178.7 152.55 185.9 L 152.55 218.15 Q 152.84 224.56 159.15 223.3 
    159.21 223.3 159.25 223.3 181.14 216.25 198.7 198.7 228 169.4 228 128 228 86.6 198.7 57.3 169.4 28 128 28 86.6 28 57.3 57.3 28 86.6 28 128 28 169.4 57.3 198.7 74.85 
    216.25 96.75 223.3 96.78 223.3 96.8 223.3 103.16 224.54 103.45 218.15 L 103.45 200 Q 82.97 203.1 75.1 196.35 69.85 191.65 68.4 185.45 64.27 177.055 59.4 174.15 49.20 
    166.87 60.8 167.8 69.85 169.61 75.7 180 81.13 188.09 90 188.55 98.18 188.86 103.45 185.9 103.49 178.67 110 172.7 72.33 168.33 66.3 140.65 59.48 111.49 74.45 96.55 69.7 
    82.41 75.5 70 84.87 68.74 103.15 80 115.125 76.635 128 76.85 140.85 76.65 152.85 80 171.1 68.75 180.5 70 Z
    `,

    logo_neo:`
    M 219 52 L 206 52 206 166 Q 206 183.4 193.75 195.65 181.4 208 164 208 146.6 208 134.35 195.65 122 183.4 122 166 L 122 90 Q 122 77.6 113.15 68.85 104.4 60 92 60 79.55 
    60 70.75 68.85 62 77.6 62 90 L 62 204 75 204 75 90 Q 75 83 79.95 78 84.95 73 92 73 99 73 104 78 109 83 109 90 L 109 166 Q 109 188.8 125.15 204.85 141.2 221 164 221 
    186.75 221 202.95 204.85 219 188.8 219 166 L 219 52 M 194 52 L 181 52 181 166 Q 181 173 176.05 178 171.05 183 164 183 157 183 152 178 147 173 147 166 L 147 90 Q 147 
    67.2 130.85 51.15 114.8 35 92 35 69.25 35 53.05 51.15 37 67.2 37 90 L 37 204 50 204 50 90 Q 50 72.6 62.25 60.35 74.6 48 92 48 109.4 48 121.65 60.35 134 72.6 134 90 L 
    134 166 Q 134 178.4 142.85 187.15 151.6 196 164 196 176.45 196 185.25 187.15 194 178.4 194 166 L 194 52 Z
    `,

    logo_donate:`
    M 171.3 80.3 Q 179.5 62.15 171.3 45.8 164.1 32.5 141.35 30.1 L 94.35 30.1 Q 89.35 30.4 88.3 35.15 L 70.5 148.05 Q 70.2 152.5 73.7 152.6 L 100.95 152.6 107 111.6 Q 108.75 
    106.55 112.6 106.45 130.45 108.05 145.3 103.9 163.35 98.75 171.3 80.3 M 179.8 71.5 Q 178.6 79.75 174.9 87.85 168.45 102.9 151.9 109.15 140.65 113.95 117.55 113 113.15 
    112.75 111 117.45 L 102.7 169.95 Q 102.45 173.8 105.5 173.85 L 128.95 173.85 Q 132.2 174.2 133.35 169.65 L 138.3 139.95 Q 139.75 135.6 143.1 135.5 146.6 135.75 150.6 135.65 
    154.55 135.5 157.35 135.1 160.15 134.7 166.75 132.35 181.35 127.4 187.9 111.2 194.25 95.75 189.5 81.95 186.75 74.85 179.8 71.5 M 103.5 209.9 Q 103.5 202.85 99.7 198.85 95.95 
    194.75 89.4 194.75 82.8 194.75 79.05 198.85 75.3 202.9 75.3 209.9 75.3 216.85 79.05 220.95 82.8 225.05 89.4 225.05 95.95 225.05 99.7 221 103.5 216.95 103.5 209.9 M 95.45 205.5 
    Q 95.95 207.3 95.95 209.9 95.95 212.65 95.45 214.35 94.95 216 94 217.3 93.1 218.45 91.9 219 90.7 219.55 89.4 219.55 88.15 219.55 86.95 219.05 85.75 218.55 84.8 217.3 83.9 216.15 
    83.4 214.35 82.85 212.6 82.85 209.9 82.85 207.3 83.4 205.45 83.95 203.55 84.85 202.45 85.9 201.2 86.95 200.75 88.05 200.25 89.4 200.25 90.7 200.25 91.85 200.8 93.05 201.3 94 202.5 
    94.9 203.65 95.45 205.5 M 153.3 195.35 L 145.3 195.35 135.5 224.45 142.8 224.45 144.6 218.5 153.75 218.5 155.6 224.45 163.1 224.45 153.3 195.35 M 152.15 213.25 L 146.25 213.25 
    149.2 203.65 152.15 213.25 M 116.75 195.35 L 107.8 195.35 107.8 224.45 114.5 224.45 114.5 204.2 125.7 224.45 132.75 224.45 132.75 195.35 126.05 195.35 126.05 212.05 116.75 195.35 M 
    66.5 197.65 Q 64.15 196.15 61.45 195.75 58.8 195.35 55.75 195.35 L 46.7 195.35 46.7 224.45 55.8 224.45 Q 58.8 224.45 61.5 224.05 64.15 223.6 66.4 222.15 69.15 220.45 70.9 217.2 
    72.7 214 72.7 209.95 72.7 205.7 71 202.6 69.35 199.5 66.5 197.65 M 64.2 205 Q 65.2 207 65.2 209.9 65.2 212.75 64.25 214.75 63.3 216.75 61.5 217.85 60 218.85 58.3 218.9 56.6 219 
    54.15 219 L 54 219 54 200.8 54.15 200.8 Q 56.4 200.8 58.05 200.9 59.7 200.95 61.15 201.75 63.2 202.95 64.2 205 M 210.2 195.35 L 190.5 195.35 190.5 224.45 210.2 224.45 210.2 218.9 
    197.75 218.9 197.75 211.55 209.2 211.55 209.2 206 197.75 206 197.75 200.9 210.2 200.9 210.2 195.35 M 187.5 195.35 L 163 195.35 163 200.9 171.6 200.9 171.6 224.45 178.9 224.45 178.9 
    200.9 187.5 200.9 187.5 195.35 Z
    `,

}

T.setText();

export const Tools = T;