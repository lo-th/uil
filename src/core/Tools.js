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
        Tools.css.txtedit = Tools.css.txt + 'pointer-events:auto; padding:2px 5px; outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px dashed #4f4f4f; -ms-user-select:element;'
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

}

Tools.setText();

export { Tools };