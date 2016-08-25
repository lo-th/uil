/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2016
*    @author lo.th / https://github.com/lo-th
*
*    Universal Module Creator
*/

'use strict';

var UMC = UMC || ( function () {

    var doc = document;
    var head = doc.getElementsByTagName('head')[0];

    var UNS = '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;';
    var BASIC = UNS + 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; border:none; overflow:hidden; background:none;';
    var TXT = BASIC + 'font-family:"Lucida Console", Monaco, monospace; font-size:11px; color:#CCC; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';
    var TXTEDITE = BASIC + TXT + 'pointer-events:auto; padding:2px 5px; outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px dashed #4f4f4f; -ms-user-select:element;'
    var NUMBER =  BASIC + TXT + 'letter-spacing:-1px; padding:2px 5px;';

    var DOM_SIZE = [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'];
    var SVG_TYPE_D = [ 'pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient', 'animateMotion' ];
    var SVG_TYPE_G = [ 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject' ];

    var svgns = "http://www.w3.org/2000/svg";
    var htmls = "http://www.w3.org/1999/xhtml";

    var tmp;
    var img = new Image();

    var frg = doc.createDocumentFragment();

    UMC = function () {};

    UMC.frag = function(){
        return frg;//doc.createDocumentFragment();
    };

    UMC.setSvg = function( dom, type, value, id ){

        if( id === -1 ) dom.setAttributeNS( null, type, value );
        else dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

    };

    UMC.setDom = function( dom, type, value ){

        var ext = DOM_SIZE.indexOf(type) !== -1 ? 'px' : '';
        dom.style[type] = value + ext;

    };

    UMC.clear = function( dom ){

        UMC.purge( dom );

        while (dom.firstChild) {

            if ( dom.firstChild.firstChild ) UMC.clear( dom.firstChild );

            dom.removeChild( dom.firstChild ); 
            
        }

        /*while ( dom.children.length ){

            if( dom.lastChild.children.length ) UMC.clear( dom.lastChild );

            //if( dom.lastChild.children.length ){ while ( dom.lastChild.children.length ) dom.lastChild.removeChild( dom.lastChild.lastChild ); }
            dom.removeChild( dom.lastChild );

        }*/

    };

    UMC.purge = function ( dom ) {
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
                UMC.purge(dom.childNodes[i]); 
            }
        }
    };

    // DOM CREATOR

    UMC.dom = function ( Class, type, css, obj, dom, id ) {

        type = type || 'div';

        if( SVG_TYPE_D.indexOf(type) !== -1 || SVG_TYPE_G.indexOf(type) !== -1 ){ // is svg element

            // create new svg if not def
            if( dom === undefined ) dom = doc.createElementNS( svgns, 'svg' );

            UMC.add( dom, type, obj, id );
            
        } else { // is html element

            if( dom === undefined ) dom = doc.createElementNS( htmls, type );//doc.createElement( type );
            else dom = dom.appendChild( doc.createElementNS( htmls, type ) );

        }

        if( Class ){
            if(Class === 'UIL') css = BASIC + css; 
            else if(Class === 'UIL text') css = TXT + css;
            else if(Class === 'UIL textSelect') css = TXTEDITE + css; 
            else if(Class === 'UIL number') css = NUMBER + css; 
            else dom.setAttribute( 'class', Class );
        }
        if( css ) dom.style.cssText = css; 

        if( id === undefined ) return dom;
        else return dom.childNodes[ id || 0 ];

    };

    // ROOT CLASS DEFINITION

    UMC.cc = function ( name, rules, noAdd ) {

        var adds = noAdd === undefined ? '.' : '';
        
        if( name === '*' ) adds = '';

        var style = doc.createElement( 'style' );
        style.type = 'text/css';
        //style.innerHTML = rules;

        //style.setAttribute( 'type', 'text/css' );
        //style.setAttribute( 'id', name );

        head.appendChild(style);

        if( !(style.sheet || {} ).insertRule ) ( style.styleSheet || style.sheet ).addRule(adds+name, rules);
        else style.sheet.insertRule( adds + name + "{" + rules + "}" , 0 );

    };

    // SVG SIDE

    UMC.clone = function ( dom, deep ){

        if(deep===undefined) deep = true; 
        return dom.cloneNode(deep);
    
    };

    UMC.add = function( dom, type, o, id ){ // add attributes

        var g = document.createElementNS( svgns, type );

        this.set( g, o );
        this.get( dom, id ).appendChild( g );

        if( SVG_TYPE_G.indexOf(type) !== -1 ) g.style.pointerEvents = 'none';

        return g;

    };

    UMC.set = function( g, o ){

        for( var att in o ){
            if( att === 'txt' ) g.textContent = o[ att ];
            g.setAttributeNS( null, att, o[ att ] );
        }
        
    };

    UMC.get = function( dom, id ){

        if( id === undefined ) return dom; // root
        else if( !isNaN( id ) ) return dom.childNodes[ id ]; // first child
        else if( id instanceof Array ){
            if(id.length === 2) return dom.childNodes[ id[0] ].childNodes[ id[1] ];
            if(id.length === 3) return dom.childNodes[ id[0] ].childNodes[ id[1] ].childNodes[ id[2] ];
        }

    };

    UMC.toCanvas = function( canvas, content, w, h ){

        //var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

       // console.time("start copy");

        //canvas.width = w;
        //canvas.height = h;
        var dcopy = null;

        if( typeof content === 'string' ){

            dcopy = UMC.dom( null, 'iframe', 'position:abolute; left:0; top:0; width:'+w+'px; height:'+h+'px;' );
            dcopy.src = content;

            //console.log(dcopy)

            //document.body.appendChild(dcopy);

        }else{
            dcopy = content.cloneNode(true);//document.createElement('div');
            dcopy.style.left = 0;
        }
        


        //var clone = content.cloneNode(true);
        //dcopy.appendChild(clone);


        /*var dcopy = doc.createDocumentFragment();//
        var tmp = document.createElement('template');//UMC.dom(null, 'div', '' );
        tmp.innerHTML = content.innerHTML;
        //tmp.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        dcopy = tmp.content;*/

       // var dcopy = UMC.dom(null, 'div', 'width:'+w+'px; height:'+h+'px; top:0; left:0;' );
        //var tmp = doc.createDocumentFragment();//
        /*var dcopy = UMC.dom(null, 'div', '' );
        dcopy.innerHTML = content.innerHTML;
        dcopy.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');*/

        var svg = UMC.dom(null, 'foreignObject', 'position:abolute; left:0; top:0;', { width:w, height:h });

        svg.childNodes[0].appendChild( dcopy );



        
        svg.setAttribute("version", "1.1");
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg' );
        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

        svg.setAttribute('width', w );
        svg.setAttribute('height', h );
        svg.childNodes[0].setAttribute('width', '100%' );
        svg.childNodes[0].setAttribute('height', '100%' );

        //var data = "data:image/svg+xml;charset=utf-8,"+ (new XMLSerializer).serializeToString(svg);
        //var data = "data:image/svg+xml;utf8,"+ (new XMLSerializer).serializeToString(svg);
        var data = 'data:image/svg+xml;base64,'+ window.btoa((new XMLSerializer).serializeToString(svg));

        //var data = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent((new XMLSerializer).serializeToString(svg))))
        
 
        //var s = new XMLSerializer();
        //var data = (new XMLSerializer).serializeToString(svg);

        dcopy = null;

       // console.timeEnd("start copy");

        /*var data = "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>" +
             "<foreignObject width='100%' height='100%'>" +
               "<div xmlns='http://www.w3.org/1999/xhtml' style='font-size:40px'>" +
                 "<em>J'</em> aime <span style='color:white; text-shadow:0 0 2px blue;'>les licornes.</span>" +
               "</div>" +
             "</foreignObject>" +
           "</svg>";*/

        //console.log(data);


        //svg.childNodes[0].setAttribute('class','UIL');
        //svg.childNodes[0].appendChild((new XMLSerializer).serializeToString(this.content));
        //var DOMURL = window.webkitURL || window.URL;

        //console.time("start draw");

        //var DOMURL = self.URL || self.webkitURL || self;
        //var img = new Image();
        //img.width = w;
        //img.height = h;
        
        
        img.src = data;

       
        //clearTimeout( tmp );
        tmp = setTimeout(function() {
            ctx.clearRect( 0, 0, w, h );
            ctx.drawImage( img, 0, 0, w, h, 0, 0, w, h );
        }, 0);

        //var blob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
        //var url = DOMURL.createObjectURL(blob);
        /*img.onload = function() {
             img.onload = null; 
            //img.crossOrigin ='anonymous';
            ctx.clearRect( 0, 0, w, h );
            //console.log('done', img.width, img.height)
            //ctx.scale(0.4, 0.4);
            ctx.drawImage(img, 0, 0, w, h, 0, 0, w, h);
          //  DOMURL.revokeObjectURL(url);
            //console.timeEnd("start draw");
        };*/

        //img.src = data;

        //img.src = url;


        //document.body.appendChild(canvas);
    


        //console.log(svg);

    };

    return UMC;

})();
/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2016
*    @author lo.th / http://lo-th.github.io/labs/
*/



var define, module, exports, performance;

//var UMC = UMC || {};

var UIL = ( function () {

    'use strict';

    UIL = {

        REVISION : 1.0,

        frag : UMC.frag,
        DOM : UMC.dom,
        clear : UMC.clear,
        setSvg : UMC.setSvg,

        isLoop : false,
        listens : [],

        main : null,
        DEF : false,
        WIDTH : 240,
        HEIGHT : 20,
        P : 30,

        BASIC : '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none; position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; border:none;  background:none;',

        COLOR : 'N',
        BASECOLOR : '#C0C0C0',

        BUTTON : '#404040',
        BOOLBG : '#181818',

        SELECT : '#035fcf',
        MOVING : '#03afff',
        SELECTDOWN : '#024699',
        BG : 'rgba(0,0,0,0.3)',
        SVGB : 'rgba(0,0,0,0.3)',
        SVGC : 'rgba(120,120,120,0.6)',
        Border : '#4f4f4f',
        BorderSelect : '#035fcf',
        PNG : 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA',
        PNGP : 'oAAAAKAgMAAADwXCcuAAAACVBMVEVMaXHi4uLi4uLDusitAAAAAnRSTlMAgJsrThgAAAA',
        /*GroupBG : UIL.PNG + 'MAAAADAQMAAABs5if8AAAABlBMVEVMaXH///+a4ocPAAAAAnRSTlMAM8lDrC4AAAAOSURBVHicY2BgcGBgAAAAxgBBOTEMSwAAAABJRU5ErkJggg==)',
        SlideBG : UIL.PNG + 'UAAAAFAQMAAAC3obSmAAAABlBMVEVMaXH///+a4ocPAAAAAnRSTlMAM8lDrC4AAAASSURBVHicY3BgaGDgYBBgUAAABkIA+fbHMRYAAAAASUVORK5CYII=)',
        SlideBG_NN : UIL.PNG + 'UAAAAFCAYAAACNbyblAAAALElEQVQImV3MsQ0AIAwDwUsmYTRGyeg0SAi7eekKF8bbwu4ETCdAJ0Ddfr8H+wEEqTj7jz0AAAAASUVORK5CYII=)',


        F0 : UIL.PNG + UIL.PNGP + 'kSURBVHicY2BkYGBgc2BgYJwAZKSwMDBIckIwkA0SA8sxMAAAN24CxaaVoKMAAAAASUVORK5CYII=)',
        F1 : UIL.PNG + UIL.PNGP + 'kSURBVHicY2CAAgEGB4YUxokMkmxuDGyRnAyMS1gYGAJgsgwAPlADDRCT8ZwAAAAASUVORK5CYII=)',
        X0 : UIL.PNG + UIL.PNGP + 'lSURBVHicYxBgcGBIYZzIIMnmxsAWycnAuIQFjEFskBhIDqgGAGxoBXlOWpMvAAAAAElFTkSuQmCC)',*/

        setText : function( size, color, font ){

            size = size || 11;
            color = color || '#CCC';
            font = font || '"Consolas", "Lucida Console", Monaco, monospace';

            UIL.TXT =  UIL.BASIC + 'font-family:'+font+'; font-size:'+size+'px; color:'+color+'; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';
            UIL.TXTSELECT = UIL.TXT + 'pointer-events:auto; padding:2px 5px; outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px dashed ' + UIL.Border+'; -ms-user-select:element;';
            UIL.NUM = UIL.TXT + 'letter-spacing:-1px; padding:2px 5px;';
            UIL.ITEM = UIL.TXT + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px; pointer-events:auto; cursor:pointer;';

        },
    };

    UIL.GroupBG = UIL.PNG + 'MAAAADAQMAAABs5if8AAAABlBMVEVMaXH///+a4ocPAAAAAnRSTlMAM8lDrC4AAAAOSURBVHicY2BgcGBgAAAAxgBBOTEMSwAAAABJRU5ErkJggg==)';
    UIL.SlideBG = UIL.PNG + 'UAAAAFAQMAAAC3obSmAAAABlBMVEVMaXH///+a4ocPAAAAAnRSTlMAM8lDrC4AAAASSURBVHicY3BgaGDgYBBgUAAABkIA+fbHMRYAAAAASUVORK5CYII=)';
    UIL.SlideBG_NN = UIL.PNG + 'UAAAAFCAYAAACNbyblAAAALElEQVQImV3MsQ0AIAwDwUsmYTRGyeg0SAi7eekKF8bbwu4ETCdAJ0Ddfr8H+wEEqTj7jz0AAAAASUVORK5CYII=)';

    UIL.F0 = UIL.PNG + UIL.PNGP + 'kSURBVHicY2BkYGBgc2BgYJwAZKSwMDBIckIwkA0SA8sxMAAAN24CxaaVoKMAAAAASUVORK5CYII=)';
    UIL.F1 = UIL.PNG + UIL.PNGP + 'kSURBVHicY2CAAgEGB4YUxokMkmxuDGyRnAyMS1gYGAJgsgwAPlADDRCT8ZwAAAAASUVORK5CYII=)';
    UIL.X0 = UIL.PNG + UIL.PNGP + 'lSURBVHicYxBgcGBIYZzIIMnmxsAWycnAuIQFjEFskBhIDqgGAGxoBXlOWpMvAAAAAElFTkSuQmCC)';
    
    UIL.setText();

    return UIL;

})();


// UMD (Universal Module Definition)

( function ( root ) {
    if ( typeof define === 'function' && define.amd ) {// AMD
        define( 'uil', UIL );
    } else if ( 'undefined' !== typeof exports && 'undefined' !== typeof module ) {
        module.exports = UIL;
    } else {// Global variable
        root.UIL = UIL;
    }
})(this);

// ----------------------
//   Root function
// ----------------------

UIL.loop = function(){

    if( UIL.isLoop ) requestAnimationFrame( UIL.loop );
    UIL.update();

};

UIL.update = function(){

    var i = UIL.listens.length;
    while(i--) UIL.listens[i].listening();

};

UIL.removeListen = function ( proto ){

    var id = UIL.listens.indexOf( proto );
    UIL.listens.splice(id, 1);

    if( UIL.listens.length === 0 ) UIL.isLoop = false;

    //console.log( UIL.listens.length )

};

UIL.addListen = function ( proto ){

    var id = UIL.listens.indexOf( proto );

    if( id !== -1 ) return; 

    UIL.listens.push( proto );

    if( !UIL.isLoop ){
        UIL.isLoop = true;
        UIL.loop();
    }

    //console.log( UIL.listens.length )

};

UIL.add = function(){

    var a = arguments;

    var type, o, ref = false;

    if( typeof a[0] === 'string' ){ 

        type = a[0][0].toUpperCase() + a[0].slice(1);
        o = a[1] || {};

    } else if ( typeof a[0] === 'object' ){ // like dat gui

        ref = true;
        if( a[2] === undefined ) [].push.call(a, {});
        type = UIL.autoType.apply( this, a );//UIL.autoType( a[0], a[1] );
        o = a[2];

        o.name = a[1];
        o.value = a[0][a[1]];

    }

    var n = new UIL[type](o);
    if( ref ) n.setReferency( a[0], a[1] );
    return n;

};

UIL.autoType = function(){

    var a = arguments;

    var type = 'Slide';

    if(a[2].type) type = a[2].type;

    return type;

};




// ----------------------
//   Color function
// ----------------------
/*UIL.bgcolor = function(p, a, bg){
    var r=44, g=44, b=44;
    a = a || 0.66;
    if(p){
        switch(p){
            //case 'N': a = 1; break;
            case 'r': case 'R': case 'S': r=160; b=68; break;
            case 'g': case 'G': case 'E': g=120; b=68; break;
            case 'b': case 'B': case 'T': b=120; g=68; break;
            case 'no': case 'NO': a=0; break;
        }
    }
    if(bg){r-=20; g-=20; b-=20;}
    var color = 'rgba('+r+','+g+','+b+','+a+')';
    if(a === 0) color = 'none';
    return color;
};*/

UIL.ColorLuma = function ( hex, lum ) {

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

};

UIL.findDeepInver = function( rgb ){ 

    return (rgb[0] * 0.3 + rgb[1] * .59 + rgb[2] * .11) <= 0.6;
    
};


UIL.hexToHtml = function(v){ 
    v = v === undefined ? 0x000000 : v;
    return "#" + ("000000" + v.toString(16)).substr(-6);
    
};

UIL.htmlToHex = function(v){ 

    return v.toUpperCase().replace("#", "0x");

};

UIL.u255 = function(color, i){

    return parseInt(color.substring(i, i + 2), 16) / 255;

};

UIL.u16 = function( color, i ){

    return parseInt(color.substring(i, i + 1), 16) / 15;

};

UIL.unpack = function( color ){

    if (color.length == 7) return [ UIL.u255(color, 1), UIL.u255(color, 3), UIL.u255(color, 5) ];
    else if (color.length == 4) return [ UIL.u16(color,1), UIL.u16(color,2), UIL.u16(color,3) ];

};

UIL.htmlRgb = function( rgb ){
    return 'rgb(' + Math.round(rgb[0] * 255) + ','+ Math.round(rgb[1] * 255) + ','+ Math.round(rgb[2] * 255) + ')'
}

UIL.rgbToHex = function( rgb ){

    return '#' + ( '000000' + ( ( rgb[0] * 255 ) << 16 ^ ( rgb[1] * 255 ) << 8 ^ ( rgb[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

};

UIL.hueToRgb = function( p, q, t ){

    if ( t < 0 ) t += 1;
    if ( t > 1 ) t -= 1;
    if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
    if ( t < 1 / 2 ) return q;
    if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
    return p;

};

UIL.rgbToHsl = function(rgb){

    var r = rgb[0], g = rgb[1], b = rgb[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
    if (l > 0 && l < 1) s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    if (delta > 0) {
        if (max == r && max != g) h += (g - b) / delta;
        if (max == g && max != b) h += (2 + (b - r) / delta);
        if (max == b && max != r) h += (4 + (r - g) / delta);
        h /= 6;
    }
    return [ h, s, l ];

};

UIL.hslToRgb = function( hsl ){

    var p, q, h = hsl[0], s = hsl[1], l = hsl[2];

    if ( s === 0 ) return [ l, l, l ];
    else {
        q = l <= 0.5 ? l * (s + 1) : l + s - ( l * s );
        p = l * 2 - q;
        return [ UIL.hueToRgb(p, q, h + 0.33333), UIL.hueToRgb(p, q, h), UIL.hueToRgb(p, q, h - 0.33333) ];
    }

};
UIL.Gui = function( o ){

    o = o || {};

    //this.height = o.height || 20;

    if( o.Tpercent !== undefined ) UIL.P = o.Tpercent;
    if( o.css === undefined ) o.css = '';

    this.height = 20;
    this.width = o.width !== undefined ? o.width : UIL.WIDTH;
    this.width = o.size !== undefined ? o.size : UIL.WIDTH;
    //UIL.WIDTH = this.width;

    this.left = 0;
    this.top = o.top || 0;


    this.h = 0;//this.height;
    this.prevY = -1;

    // bottom and close height
    this.isWithClose = true;
    this.bh = o.bh || 20;

    if(o.close !== undefined ){
        this.isWithClose = o.close;
        this.bh = !this.isWithClose ? 0 : this.bh;
    }



    // scroll width
    this.sw = o.sw || 10;

    UIL.main = this;

    this.callback = o.callback  === undefined ? null : o.callback;

    this.color = o.color || UIL.COLOR;
    this.bg = o.bg || 'rgba(44,44,44,0.3)';
    
    this.isCenter = o.center || false;
    this.lockwheel = false;
    this.onWheel = false;
    this.isOpen = true;

    this.uis = [];

    this.content = UIL.DOM( null, 'div', UIL.BASIC + 'display:block; width:'+this.width+'px; height:auto; top:0; right:10px; transition:height 0.1s ease-out;' + o.css );
    document.body.appendChild( this.content );
    //this.content.style.background = UIL.bgcolor( this.color, 1, true );

    //this.top = this.content.getBoundingClientRect().top;

    this.innerContent = UIL.DOM( null, 'div', UIL.BASIC + 'width:100%; top:0; left:0; height:auto;');
    this.content.appendChild(this.innerContent);

    this.inner = UIL.DOM( null, 'div', UIL.BASIC + 'width:100%; top:0; left:0; height:auto;');
    this.innerContent.appendChild(this.inner);
    this.inner.name = 'inner';

    //this.scrollBG = UIL.DOM('UIL scroll-bg');
    this.scrollBG = UIL.DOM( null, 'div', UIL.BASIC + 'right:0; top:0; width:10px; height:10px; cursor:s-resize; pointer-events:auto; display:none;');
    this.content.appendChild(this.scrollBG);
    this.scrollBG.name = 'scroll';

    //this.scroll = UIL.DOM('UIL scroll');
    this.scroll = UIL.DOM( null, 'div', UIL.BASIC + 'background:#666; right:0; top:0; width:5px; height:10px;');
    this.scrollBG.appendChild( this.scroll );

    this.bottom = UIL.DOM( null, 'div',  UIL.TXT+'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:10px;  border-bottom-left-radius:10px; text-align:center; pointer-events:auto; cursor:pointer; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px;');
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
    //this.content.addEventListener( 'mousewheel', this, false );

    document.addEventListener( 'mousewheel', function(e){this.wheel(e)}.bind(this), false );
    
    window.addEventListener("resize", function(e){this.resize(e)}.bind(this), false );

    //

    this.setWidth( this.width );

}

UIL.Gui.prototype = {
    constructor: UIL.Gui,

    hide : function (b) {

        if(b) this.content.style.display = 'none';
        else this.content.style.display = 'block';
        
    },

    setBG : function(c){

        this.bg = c;

        var i = this.uis.length;
        while(i--){
            this.uis[i].setBG(c);
        }

        this.bottom.style.background = c;

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
        this.scroll.style.background = '#AAA';
        this.update( (e.clientY-this.top)-(this.sh*0.5) );

    },

    

    out: function( e ){

        if( !e.target.name ) return;

        if(e.target.name === 'scroll'){
            this.scroll.style.background = '#666';
        }

        if(e.target.name === 'bottom'){
            this.bottom.style.color = '#CCC';
        }

    },

    up: function( e ){

        this.isDown = false;
        this.scroll.style.background = '#666';
        document.removeEventListener( 'mouseup', this, false );
        document.removeEventListener( 'mousemove', this, false );

    },

    over: function( e ){

        if( !e.target.name ) return;
        if(e.target.name === 'scroll'){
            this.scroll.style.background = '#888';
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
        else if(e.detail) delta =e.detail*4.0;

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


        var n = UIL.add.apply( this, a );
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
        UIL.listens = [];

        this.calc( - this.h );

    },

    // -----------------------------------

    // Scroll

    update: function ( y ){

        y = y < 0 ? 0 :y;
        y = y > this.range ? this.range : y;

        this.inner.style.top = -( ~~ ( y / this.ratio ) ) + 'px';
        this.scroll.style.top = ( ~~ y ) + 'px';

        this.py = y;

        //this.onWheel = false;

    },

    showScroll:function(h){

        this.isScroll = true;

        this.total = this.h;
        this.maxView = this.maxHeight;// - this.height;

        this.ratio = this.maxView / this.total;
        this.sh = this.maxView * this.ratio;

        if( this.sh < 20 ) this.sh = 20;

        this.range = this.maxView - this.sh;

        this.scrollBG.style.display = 'block';
        this.scrollBG.style.height = this.maxView + 'px';
        this.scroll.style.height = this.sh + 'px';

        this.update( 0 );
    },

    hideScroll:function(){

        this.isScroll = false;
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
        this.tmp = setTimeout( this.testHeight.bind(this), 10);

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

            this.hideScroll();

        }

        this.innerContent.style.height = this.height - this.bh + 'px';
        this.content.style.height = this.height + 'px';
        this.bottom.style.top = this.height - this.bh + 'px';
        //this.zone.h = this.height;

    },

    setWidth:function( w ) {

        if( w ) this.width = w;
        this.content.style.width = this.width + 'px';

        //console.log(this.width)


        if( this.isCenter ) this.content.style.marginLeft = -(~~ (this.width*0.5)) + 'px';

        var l = this.uis.length;
        var i = l;
        while(i--){
            this.uis[i].setSize( this.width );
        }

        i = l;
        while(i--){
            this.uis[i].rSize();
        }

        this.resize();

    },


};
UIL.Proto = function( o ){

    o = o || {};

    this.main = o.main || null;

    //this.type = '';
    // percent of title
    this.p = o.p || o.tPercent || 0;

    // if need resize width
    this.autoWidth = true;

    this.isGroup = false;
    this.parentGroup = null;

    // if height can change
    this.autoHeight = false;

    // if is on ui pannel
    this.isUI = o.isUI || false;

    // only for number
    this.isNumber = false;

    // only most simple 
    this.mono = false;

    // stop listening for edite slide text
    this.isEdit = false;

    // no title 
    this.simple = o.simple || false;
    if(this.simple) this.sa = 0;

    this.width = this.isUI ? this.main.width : UIL.WIDTH;
    if(o.width !== undefined ) this.width = o.width;
    if(o.size !== undefined ) this.width = o.size;

    //console.log(this.width)

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

    var h = 20;
    if( this.isUI ) h = UIL.HEIGHT;//this.main.height;
    this.h = o.h || o.height || h;
    this.h = this.h < 11 ? 11 : this.h;
    
    this.bgcolor = UIL.COLOR || o.bgcolor;

    this.bg = this.isUI ? this.main.bg : 'rgba(44,44,44,0.3)';
    if(o.bg !== undefined ) this.bg = o.bg;



    //this.fontColor = o.fontColor === undefined ? UIL.BASECOLOR : o.fontColor;
    this.titleColor = o.titleColor || UIL.BASECOLOR;
    this.fontColor = o.fontColor || UIL.BASECOLOR;
    this.colorPlus = UIL.ColorLuma(this.fontColor, 0.3);
    

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

    //this.c[0] = UIL.DOM('UIL', 'div', 'position:relative; height:20px; float:left;');
    this.c[0] = UIL.DOM(null, 'div', UIL.BASIC + 'position:relative; height:20px; float:left; overflow:hidden;');
    this.s[0] = this.c[0].style;

    if( this.isUI ) this.s[0].marginBottom = '1px';
    

    if( !this.simple ){ 
        //this.c[1] = UIL.DOM('UIL text');
        this.c[1] = UIL.DOM(null, 'div', UIL.TXT );
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

};

UIL.Proto.prototype = {

    constructor: UIL.Proto,

    // make de node


    init: function (){

        var s = this.s; // style cached

        //s[0] = this.c[0].style;
        s[0].height = this.h + 'px';

        if( this.isUI ) this.s[0].background = this.bg;//this.isUI ? this.main.bg : UIL.bgcolor(this.bgcolor);
        if( this.autoHeight ) this.s[0].transition = 'height 0.1s ease-out';
        if( this.c[1] !== undefined && this.autoWidth ){
            s[1] = this.c[1].style;
            s[1].height = (this.h-4) + 'px';
            s[1].lineHeight = (this.h-8) + 'px';
        }

        var frag = UIL.frag();

        for( var i=1, lng = this.c.length; i !== lng; i++ ){
            if( this.c[i] !== undefined ) {
                frag.appendChild( this.c[i] );
                s[i] = this.c[i].style;
            }
        }


        if( this.target !== null ){ 
            this.target.appendChild( this.c[0] );
        } else {
            if( this.isUI ) this.main.inner.appendChild( this.c[0] );
            else document.body.appendChild( this.c[0] );
        }

        this.c[0].appendChild( frag );

        //this.s = s;

        this.rSize();
        this.addEvent();

    },

    rename:function(s){
        this.c[1].textContent = s;
    },

    setBG : function(c){

        this.bg = c;
        this.s[0].background = c;

    },

    listen : function( ){

        UIL.addListen( this );

        UIL.listens.push( this );
        return this;

    },

    listening : function(){

        if( this.parent === null ) return;
        if( this.isSend ) return;
        if( this.isEdit ) return;

        this.setValue( this.parent[ this.val ] );

    },

    setValue : function( v ){
        if( this.isNumber ) this.value = this.numValue( v );
        else this.value = v;

        this.update();

    },

    update: function( ) {
        
    },

    // update every change

    onChange : function( f ){

        this.callback = f;
        return this;

    },

    // update only on end

    onFinishChange : function( f ){

        this.callback = null;
        this.endCallback = f;
        return this;

    },

    send:function( v ){
        this.isSend = true;

        if( this.parent !== null ) this.parent[ this.val ] = v || this.value;
        if( this.callback ) this.callback( v || this.value );
        
        this.isSend = false;

    },

    sendEnd:function( v ){

        if( this.endCallback ) this.endCallback( v || this.value );
        if( this.parent !== null ) this.parent[ this.val ] = v || this.value;

    },

    

    // clear node
    
    clear:function(){

        this.clearEvent();
        UIL.clear( this.c[0] );

        if( this.target !== null ){ 
            this.target.removeChild( this.c[0] );
        } else {
            if( this.isUI ) this.main.clearOne( this );//this.main.inner.removeChild( this.c[0] );
            else document.body.removeChild( this.c[0] );
        }

        this.c = null;
        this.s = null;
        this.callback = null;
        this.target = null;

    },

    // change size 

    setSize:function( sx ){

        if( !this.autoWidth ) return;

        this.width = sx;// || UIL.WIDTH;
        if( !this.p ) this.p = UIL.P;

        if( this.simple ){
            //this.sa = 0;
            this.sb = this.width - this.sa;
        }else{
            var pp = this.width * ( this.p / 100 );
            this.sa = ~~ pp;
            this.sb = ~~ this.width - pp - 10;
        }

    },

    rSize:function(){

        if( !this.autoWidth ) return;

        this.s[0].width = this.width + 'px';
        if( !this.simple ) this.s[1].width = this.sa + 'px';
    
    },

    // for numeric value

    setTypeNumber:function( o ){

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

    numValue:function( n ){

        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision ) * 1;

    },

    // ----------------------
    //   Events dispatch
    // ----------------------

    addEvent: function(){

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

    clearEvent: function(){

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

    handleEvent: function( e ) {
        
    },

    // ----------------------
    // object referency
    // ----------------------

    setReferency: function(obj, val){

        this.parent = obj;
        this.val = val;

    },

    display:function(v){

        this.s[0].display = v ? 'block' : 'none';

    },


}
UIL.Group = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;
    this.isGroup = true;

    //this.bg = o.bg || null;
    

    //this.h = 25;
    this.baseH = this.h;

    this.isOpen = o.open || false;

    this.c[2] = UIL.DOM( null, 'div', UIL.BASIC + 'width:100%; left:0; height:auto; overflow:hidden; top:'+this.h+'px');
    this.c[3] = UIL.DOM( null, 'div', UIL.BASIC + 'top:2px; left:2px; height:'+(this.h-4)+'px; width:6px; background-image:'+ UIL.GroupBG );
    this.c[4] = UIL.DOM( null, 'div', UIL.BASIC + 'position:absolute; width:10px; height:10px; top:'+(~~(this.h*0.5)-5)+'px; pointer-events:none; background:'+ UIL.F0 );
    if(o.line) this.c[5] = UIL.DOM( null, 'div', UIL.BASIC +  'background:'+this.fontColor+'; width:100%; left:0; height:1px; bottom:0px');

    var s = this.s;

    s[0].height = this.h + 'px';
    s[1].height = this.h + 'px';
    s[1].top = 4 + 'px';
    s[1].left = 4 + 'px';
    s[1].pointerEvents = 'auto';
    s[1].cursor = 'pointer';
    this.c[1].name = 'group';

    this.s[1].color = this.fontColor;
    this.s[1].fontWeight = 'bold';

    this.uis = [];

    this.c[1].events = [ 'click' ];

    this.init();

    if( o.bg !== undefined ) this.setBG(o.bg);

    if( this.isOpen ) this.open();

};

UIL.Group.prototype = Object.create( UIL.Proto.prototype );
UIL.Group.prototype.constructor = UIL.Group;

UIL.Group.prototype.setBG = function( c ){

    this.s[0].background = c;

    var i = this.uis.length;
    while(i--){
        this.uis[i].setBG( c );
    }

};

UIL.Group.prototype.handleEvent = function( e ) {

    e.preventDefault();
    //e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click( e ); break;
    }

};


UIL.Group.prototype.click = function( e ){

    if( this.isOpen ) this.close();
    else this.open();

};

UIL.Group.prototype.add = function( ){

    var a = arguments;

    if( typeof a[1] === 'object' ){ 
        a[1].isUI = this.isUI;
        a[1].target = this.c[2];
    } else if( typeof arguments[1] === 'string' ){
        if( a[2] === undefined ) [].push.call(a, { isUI:true, target:this.c[2] });
        else{ 
            a[2].isUI = true;
            a[2].target = this.c[2];
        }
    }

    var n = UIL.Gui.prototype.add.apply( this, a );
    if( n.autoHeight ) n.parentGroup = this;

    return n;

};

UIL.Group.prototype.open = function(){

    this.isOpen = true;
    this.s[4].background = UIL.F1;
    this.rSizeContent();

    if( this.isUI ) this.main.calc( this.h - this.baseH );

};

UIL.Group.prototype.close = function(){

    if( this.isUI ) this.main.calc(-(this.h-this.baseH ));

    this.isOpen = false;
    this.s[4].background = UIL.F0;
    this.h = this.baseH;

    this.s[0].height = this.h + 'px';

};

UIL.Group.prototype.clear = function(){

    this.clearGroup();
    if( this.isUI ) this.main.calc( -(this.h +1 ));
    UIL.Proto.prototype.clear.call( this );

};

UIL.Group.prototype.clearGroup = function(){

    this.close();

    var i = this.uis.length;
    while(i--){
        this.uis[i].clear();
        this.uis.pop();
    }
    this.uis = [];

    //if( this.isUI ) this.main.calc( -this.h+ this.baseH );

    this.h = this.baseH;
    //this.s[0].height = this.h + 'px';
    //this.s[2].height = 0;

    


    //this.calc();

};

UIL.Group.prototype.calc = function( y ){

    if( !this.isOpen ) return;

    //this.h = this.baseH;

    if( y !== undefined ){ 
        this.h += y;
        if( this.isUI ) this.main.calc( y );

    }
    else this.h = this.c[2].offsetHeight + this.baseH;

    //var total = this.c[2].offsetHeight;
    //this.h += total;

    this.s[0].height = this.h + 'px';

    //

};

UIL.Group.prototype.rSizeContent = function(){

    var i = this.uis.length;
    while(i--){
        this.uis[i].setSize( this.width );
        this.uis[i].rSize();
    }
    this.calc();

};

UIL.Group.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    var s = this.s;

    s[4].left = ( this.sa + this.sb - 17 ) + 'px';
    s[1].width = this.width + 'px';
    s[2].width = this.width + 'px';

    if(this.isOpen) this.rSizeContent();

};
UIL.Title = function( o ){
    
    UIL.Proto.call( this, o );

    //this.type = 'title';

    //this.h = o.height || 31;

    var id = o.id || 0;
    var prefix = o.prefix || '';

    this.c[2] = UIL.DOM( null, 'div', UIL.TXT + 'text-align:right; width:60px; line-height:'+ (this.h-8) + 'px; color:' + this.fontColor );

    if( this.h === 31 ){

        this.s[0].height = this.h + 'px';
        this.s[1].top = 8 + 'px';
        this.c[2].style.top = 8 + 'px';

    }
    
    //var idt = id || 0;
    //if(id<10) idt = '0'+id;

    this.c[1].textContent = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
    this.c[2].textContent = prefix;//.toUpperCase()+' '+idt;

    this.init();

};

UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;


UIL.Title.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.s[1].width = this.width-50 + 'px';
    this.s[2].left = this.width-(50+26) + 'px';

};

UIL.Title.prototype.text = function(txt){

    this.c[1].textContent = txt;

};

UIL.Title.prototype.text2 = function(txt){

    this.c[2].textContent = txt;

};
UIL.String = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || '';
    this.allway = o.allway || false;

    this.c[2] = UIL.DOM( null, 'div',  UIL.TXTSELECT );//+ 'height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px; ' );
    this.c[2].name = 'input';
    //this.c[2].style.color = ;
    this.c[2].textContent = this.value;

    this.c[2].events = [ 'mousedown', 'keydown', 'keyup', 'blur', 'focus' ];

    this.init();

};

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;

UIL.String.prototype.handleEvent = function( e ) {

    switch( e.type ) {
        case 'mousedown': this.down( e ); break;
        case 'blur': this.blur( e ); break;
        case 'focus': this.focus( e ); break
        case 'keydown': this.keydown( e ); break;
        case 'keyup': this.keyup( e ); break;
    }

};

UIL.String.prototype.down = function( e ){

    e.target.contentEditable = true;
    e.target.focus();
    e.target.style.cursor = 'auto';

};

UIL.String.prototype.blur = function( e ){

    e.target.style.borderColor = UIL.Border;
    e.target.contentEditable = false;

};

UIL.String.prototype.focus = function( e ){

    e.target.style.borderColor = UIL.BorderSelect;

};

UIL.String.prototype.keydown = function( e ){
    
    e.stopPropagation();

    if( e.keyCode === 13 ){ 
        e.preventDefault();
        this.value = e.target.textContent;
        e.target.blur();
        this.send();
    }

};

UIL.String.prototype.keyup = function( e ){
    
    e.stopPropagation();

    this.value = e.target.textContent;
    if( this.allway ) this.send();
    
};

UIL.String.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.s[2].color = this.fontColor;
    this.s[2].left = this.sa + 'px';
    this.s[2].width = this.sb + 'px';
    this.s[2].height = this.h -4 + 'px';
    this.s[2].lineHeight = this.h - 8 + 'px';
 
};
UIL.Number = function( o ){

    UIL.Proto.call( this, o );

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

    this.w = ((UIL.BW+5)/(this.length))-5;
    this.current = undefined;
    
    var i = this.length;
    while(i--){
        if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
        this.c[2+i] = UIL.DOM(null, 'div', UIL.TXTSELECT + 'letter-spacing:-1px; cursor:pointer; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
        //this.c[2+i] = UIL.DOM('UIL textSelect', 'div', 'letter-spacing:-1px; cursor:pointer; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
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

UIL.Number.prototype = Object.create( UIL.Proto.prototype );
UIL.Number.prototype.constructor = UIL.Number;

UIL.Number.prototype.handleEvent = function( e ) {

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

};

UIL.Number.prototype.setValue = function( v, n ){

    n = n || 0;
    this.value[n] = this.numValue( v );
    this.c[2+n].textContent = this.value[n];

};

UIL.Number.prototype.keydown = function( e ){

    e.stopPropagation();

    if( e.keyCode === 13 ){
        e.preventDefault();
        this.testValue( parseFloat(e.target.name) );
        this.validate();
        e.target.blur();
    }

};

UIL.Number.prototype.keyup = function( e ){
    
    e.stopPropagation();

    if( this.allway ){ 
        this.testValue( parseFloat(e.target.name) );
        this.validate();
    }

};

UIL.Number.prototype.blur = function( e ){

    this.isSelect = false;
    e.target.style.borderColor = UIL.Border;
    e.target.contentEditable = false;
    //e.target.style.border = '1px solid rgba(255,255,255,0.1)';
    if(this.isDrag) e.target.style.cursor = 'move';
    else  e.target.style.cursor = 'pointer';

};

UIL.Number.prototype.focus = function( e ){

    this.isSelect = true;
    this.current = undefined;
    e.target.style.borderColor = UIL.BorderSelect;
    
    //e.target.style.border = '1px solid ' + UIL.BorderSelect;
    if(this.isDrag) e.target.style.cursor = 'auto';

};

UIL.Number.prototype.down = function( e ){

    if(this.isSelect) return;

    e.preventDefault();

    

    //e.target.style.border = '1px solid rgba(255,255,255,0.2)';
    this.current = parseFloat(e.target.name);

    this.prev = { x:e.clientX, y:e.clientY, d:0, id:(this.current+2)};
    if( this.isNumber ) this.prev.v = parseFloat(this.value);
    else this.prev.v = parseFloat( this.value[this.current] );



    document.addEventListener( 'mouseup', this, false );
    if(this.isDrag) document.addEventListener( 'mousemove', this, false );

};

////

UIL.Number.prototype.up = function( e ){

    e.preventDefault();

    document.removeEventListener( 'mouseup', this, false );
    if(this.isDrag) document.removeEventListener( 'mousemove', this, false );

    if(this.current !== undefined){ 

        if( this.current === parseFloat(e.target.name) ){ 
            e.target.contentEditable = true;
            e.target.focus();
        }

       // else e.target.style.borderColor = UIL.BorderSelect;;//this.c[2+this.current].style.border = '1px solid rgba(255,255,255,0.1)';


        //this.c[2+this.current].style.cursor = 'move';
    }

    

};

UIL.Number.prototype.move = function( e ){

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

};

/////

UIL.Number.prototype.testValue = function( n ){

    if(!isNaN( this.c[2+n].textContent )){ 
        var nx = this.numValue( this.c[2+n].textContent );
        this.c[2+n].textContent = nx;
        this.value[n] = nx;
    } else { // not number
        this.c[2+n].textContent = this.value[n];
    }

};

UIL.Number.prototype.validate = function(){

    var ar = [];
    var i = this.length;
    while(i--) ar[i] = this.value[i]*this.toRad;

    if( this.isNumber ) this.send( ar[0] );
    else this.send( ar );

};

UIL.Number.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.w = ~~( ( this.sb + 5 ) / this.length )-5;
    var s = this.s;
    var i = this.length;
    while(i--){
        s[2+i].left = (~~( this.sa + ( this.w * i )+( 5 * i ))) + 'px';
        s[2+i].width = this.w + 'px';
    }

};
UIL.Color = function( o ){
    
    UIL.Proto.call( this, o );

    this.autoHeight = true;

    this.ctype = o.ctype || 'array';
    this.ww = this.sb;
    this.oldWidth = 0;

    // color up or down
    this.side = o.side || 'down';
    this.holdTop = 0;
    
    this.wheelWidth = this.ww*0.1;
    this.decal = this.h + 2;
    
    this.radius = (this.ww - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.ww * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    this.baseH = this.h;

    this.c[2] = UIL.DOM( null, 'div',  UIL.TXT + 'height:'+(this.h-4)+'px;' + 'border-radius:6px; pointer-events:auto; cursor:pointer; border:1px solid '+ UIL.Border + '; line-height:'+(this.h-8)+'px;' );

    this.s[2] = this.c[2].style;

    if(this.side === 'up'){
        this.decal = 5;
        this.s[2].top = 'auto';
        this.s[2].bottom = '2px';
    }

    this.c[3] = UIL.DOM( null, 'div', UIL.BASIC + 'display:none' );
    this.c[4] = UIL.DOM( null, 'canvas', UIL.BASIC + 'display:none;');
    this.c[5] = UIL.DOM( null, 'canvas', UIL.BASIC + 'pointer-events:auto; cursor:pointer; display:none;');

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
        if(o.value instanceof Array) this.value = UIL.rgbToHex( o.value );
        else if(!isNaN(o.value)) this.value = UIL.hexToHtml( o.value );
        else this.value = o.value;
    }
    this.bcolor = null;
    this.isDown = false;
    this.isShow = false;

    this.c[2].events = [ 'click' ];
    this.c[5].events = [ 'mousedown', 'mousemove', 'mouseup', 'mouseout' ];

    this.setColor( this.value );

    this.init();

};

UIL.Color.prototype = Object.create( UIL.Proto.prototype );
UIL.Color.prototype.constructor = UIL.Color;

UIL.Color.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mousedown': this.down(e); break;
        case 'mousemove': this.move(e); break;
        case 'mouseup': this.up(e); break;
        case 'mouseout': this.out(e); break;
    }

};

/////

UIL.Color.prototype.click = function( e ){

    if( !this.isShow ) this.show();
    else this.hide();

};

UIL.Color.prototype.up = function( e ){

    this.isDown = false;

};

UIL.Color.prototype.out = function( e ){

    this.hide();

};

UIL.Color.prototype.down = function( e ){

    if(!this.isShow) return;
    this.isDown = true;
    this.move( e );
    return false;

};

UIL.Color.prototype.move = function( e ){

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

};


//////

UIL.Color.prototype.redraw = function(){
    this.oldWidth = this.ww;
    this.drawCircle();
    this.drawMask();
    this.drawMarkers();
};

UIL.Color.prototype.show = function(){

    if(this.oldWidth!==this.ww) this.redraw();
    this.isShow = true;
    this.h = this.ww + this.baseH + 10;
    this.s[0].height = this.h+'px';

    if(this.side=='up'){ 
        this.holdTop = this.s[0].top.substring(0,this.s[0].top.length-2) * 1 || 'auto';
        if(!isNaN(this.holdTop)) this.s[0].top = (this.holdTop-(this.h-20))+'px';
        setTimeout(function(){this.s[5].pointerEvents = 'auto';}.bind(this), 100);
    }

    this.s[3].display = 'block';
    this.s[4].display = 'block';
    this.s[5].display = 'block';

    if( this.parentGroup !== null ){ this.parentGroup.calc( this.h - this.baseH );}
    else if( this.isUI ) this.main.calc( this.h - this.baseH );

};

UIL.Color.prototype.hide = function(){

    if( this.parentGroup !== null ){ this.parentGroup.calc( -(this.h-this.baseH) );}
    else if( this.isUI ) this.main.calc( -(this.h-this.baseH) );

    this.isShow = false;
    this.h = this.baseH;
    if(this.side === 'up'){ 
        if(!isNaN(this.holdTop)) this.s[0].top = (this.holdTop)+'px';
        this.s[5].pointerEvents = 'none';
    }
    this.s[0].height = this.h+'px';
    this.s[3].display = 'none';
    this.s[4].display = 'none';
    this.s[5].display = 'none';
    
};

UIL.Color.prototype.update = function( up ){

    this.s[3].background = UIL.rgbToHex( UIL.hslToRgb([this.hsl[0], 1, 0.5]) );

    this.drawMarkers();
    
    this.value = this.bcolor;

    this.s[2].background = this.bcolor;
    this.c[2].textContent = UIL.htmlToHex(this.bcolor);

    this.invert = UIL.findDeepInver( this.rgb );
    this.s[2].color = this.invert ? '#fff' : '#000';;

    if(!up) return;

    if( this.ctype === 'array' ) this.send( this.rgb );
    if( this.ctype === 'rgb' ) this.send( UIL.htmlRgb( this.rgb ) );
    if( this.ctype === 'hex' ) this.send( UIL.htmlToHex( this.value ) );
    if( this.ctype === 'html' ) this.send();

};

UIL.Color.prototype.setColor = function( color ){

    var unpack = UIL.unpack(color);
    if (this.bcolor != color && unpack) {
        this.bcolor = color;
        this.rgb = unpack;
        this.hsl = UIL.rgbToHsl( this.rgb );
        this.update();
    }
    return this;

};

UIL.Color.prototype.setHSL = function( hsl ){

    this.hsl = hsl;
    this.rgb = UIL.hslToRgb( hsl );
    this.bcolor = UIL.rgbToHex( this.rgb );
    this.update( true );
    return this;

};

UIL.Color.prototype.calculateMask = function(sizex, sizey, outputPixel){
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
};

UIL.Color.prototype.drawMask = function(){
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
};

UIL.Color.prototype.drawCircle = function(){
    var n = 24,r = this.radius, w = this.wheelWidth, nudge = 8 / r / n * Math.PI, m = this.ctxMask, a1 = 0, color1, d1;
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
        color2 = UIL.rgbToHex( UIL.hslToRgb([d2, 1, 0.5]) );
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
};

UIL.Color.prototype.drawMarkers = function(){

    var m = this.markerSize, ra=this.radius, sz = this.ww, lw = Math.ceil(m/ 4), r = m - lw + 1, c1 = this.invert ? '#fff' : '#000', c2 = this.invert ? '#000' : '#fff';
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
};

UIL.Color.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.ww = this.sb;
    this.wheelWidth = this.ww*0.1;

    if( this.side === 'up' ) this.decal = 5;
    this.radius = (this.ww - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
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

    if( this.isShow ){ 
        this.redraw();
        this.h = this.ww+30;
        this.c[0].height = this.h + 'px';
        if( this.isUI ) this.main.calc();
    }

};
UIL.Slide = function( o ){

    UIL.Proto.call( this, o );

    this.setTypeNumber( o );

    this.stype = o.stype || 0;
    this.buttonColor = o.bColor || UIL.BUTTON;

    //this.old = this.value;
    this.isDown = false;
    this.isOver = false;
    this.allway = o.allway || false;

    //this.c[2] = UIL.DOM('UIL number', 'div', ' text-align:right; width:47px; color:'+ this.fontColor );
    this.c[2] = UIL.DOM(null, 'div', UIL.TXTSELECT + 'letter-spacing:-1px; padding:2px 5px; text-align:right; cursor:pointer; width:47px; border:none; color:'+ this.fontColor );
    //this.c[2] = UIL.DOM('UIL textSelect', 'div', ' text-align:right; cursor:pointer; width:47px; border:none; color:'+ this.fontColor );
    this.c[3] = UIL.DOM(null, 'div', UIL.BASIC + 'pointer-events:auto; cursor:w-resize; top:0; height:'+this.h+'px;' );
    this.c[4] = UIL.DOM(null, 'div', UIL.BASIC + 'border:1px solid '+UIL.Border+'; pointer-events:none; background:rgba(0,0,0,0.3); top:2px; height:'+(this.h-4)+'px;' );
    this.c[5] = UIL.DOM(null, 'div', UIL.BASIC + 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + this.fontColor +';' );

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
            ww = (this.h-4)*0.5
        }

        if(this.stype === 3) this.c[5].style.visible = 'none';

        this.c[4].style.borderRadius = h1 + 'px';
        this.c[4].style.height = h2 + 'px';
        this.c[4].style.top = (this.h*0.5) - h1 + 'px';
        this.c[5].style.borderRadius = (h1*0.5) + 'px';
        this.c[5].style.height = h1 + 'px';
        this.c[5].style.top = (this.h*0.5)-(h1*0.5) + 'px';

        this.c[6] = UIL.DOM(null, 'div', UIL.BASIC + 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+UIL.Border+'; background:'+this.buttonColor+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );
    }

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];
    this.c[2].events = [ 'keydown', 'keyup', 'mousedown', 'blur', 'focus' ];

    this.init();

};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;

UIL.Slide.prototype.handleEvent = function( e ) {

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

};

UIL.Slide.prototype.mode = function( mode ){

    var s = this.s;

    switch(mode){
        case 0: // base
            s[2].color = this.fontColor;
            s[4].background = 'rgba(0,0,0,0.3)';
            s[5].background = this.fontColor;
        break;
        case 1: // over
            s[2].color = this.colorPlus;
            if( !s[6] ) s[4].background = UIL.SlideBG;
            else s[4].background = 'rgba(0,0,0,0.6)';
            s[5].background = this.colorPlus;
        break;
    }
}

UIL.Slide.prototype.over = function( e ){

    e.preventDefault();
    e.stopPropagation();

    this.isOver = true;
    this.mode(1);

};

UIL.Slide.prototype.out = function( e ){

    e.preventDefault();
    e.stopPropagation();

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Slide.prototype.up = function( e ){

    e.preventDefault();
    e.stopPropagation();

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.isOver) this.mode(1);
    else this.mode(0);

    this.sendEnd();
    
};

UIL.Slide.prototype.down = function( e ){

    e.preventDefault();
    e.stopPropagation();

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    this.left = this.c[3].getBoundingClientRect().left;
    this.old = this.value;
    this.move( e );

};

UIL.Slide.prototype.move = function( e ){

    var n = ((( e.clientX - this.left - 3 ) / this.w ) * this.range + this.min ) - this.old;
    if(n >= this.step || n <= this.step){ 
        n = ~~ ( n / this.step );
        this.value = this.numValue( this.old + ( n * this.step ) );
        this.update( true );
        this.old = this.value;
    }

};

UIL.Slide.prototype.update = function( up ){

    var ww = this.w * (( this.value - this.min ) / this.range );
   
    if(this.stype !== 3) this.s[5].width = ~~ ww + 'px';
    if(this.s[6]) this.s[6].left = ~~ (this.sa +ww + 3) + 'px';
    this.c[2].textContent = this.value;

    if( up ) this.send();

};

UIL.Slide.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

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

};

// text

UIL.Slide.prototype.validate = function( e ){

    if(!isNaN( this.c[2].textContent )){ 
        this.value = this.numValue( this.c[2].textContent ); 
        this.update(true); 
    }
    else this.c[2].textContent = this.value;

};

UIL.Slide.prototype.textdown = function( e ){

    e.target.contentEditable = true;
    e.target.focus();
    this.isEdit = true;

};

UIL.Slide.prototype.keydown = function( e ){

    e.stopPropagation();

    if( e.keyCode === 13 ){
        e.preventDefault();
        this.validate();
        e.target.blur();
    }

};

UIL.Slide.prototype.keyup = function( e ){
    
    e.stopPropagation();
    if( this.allway ) this.validate();

};

UIL.Slide.prototype.blur = function( e ){

    e.target.style.border = 'none';
    e.target.contentEditable = false;
    this.isEdit = false;

};

UIL.Slide.prototype.focus = function( e ){

    e.target.style.border = '1px dashed ' + UIL.BorderSelect;

};
UIL.List = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;
    var align = o.align || 'center';

    this.buttonColor = UIL.BUTTON;

    this.c[2] = UIL.DOM( null, 'div', UIL.BASIC + 'box-sizing:content-box; border:20px solid transparent; border-bottom:10px solid transparent top:0px; height:90px; cursor:s-resize; pointer-events:auto; display:none;');
    this.c[3] = UIL.DOM( null, 'div', UIL.BASIC + 'border:1px solid '+UIL.Border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px;' );
    this.c[4] = UIL.DOM( null, 'div', UIL.BASIC + 'position:absolute; width:10px; height:10px; left:'+((this.sa+this.sb)-5)+'px; top:'+(~~(this.h*0.5)-5)+'px; background:'+ UIL.F0 );
    this.c[5] = UIL.DOM( null, 'div', UIL.TXT + 'text-align:'+align+'; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
    this.c[6] = UIL.DOM( null, 'div', UIL.BASIC + 'right:14px; top:'+this.h+'px; height:16px; width:10px; pointer-events:none; background:#666; display:none;');

    this.c[2].name = 'list';
    this.c[3].name = 'title';

    this.c[2].style.borderTop = this.h+'px solid transparent';
    this.c[5].style.color = this.fontColor;

    this.c[2].events = [ 'mousedown', 'mousemove', 'mouseup', 'mouseout', 'mousewheel', 'mouseover' ];
    this.c[3].events = [ 'click', 'mousedown', 'mouseover', 'mouseout' ];

    this.list = o.list || [];
    if(o.value){
        if(!isNaN(o.value)) this.value = this.list[o.value];
        else this.value = o.value;
    }else{
        this.value = this.list[0];
    }

    this.baseH = this.h;

    this.isShow = false;
    this.maxItem = o.maxItem || 5;
    this.itemHeight = o.itemHeight || (this.h-3);
    this.length = this.list.length;

    // force full list 
    this.full = o.full || false;
    if(this.full) this.maxItem = this.length;
    
    this.maxHeight = this.maxItem * (this.itemHeight+1);
    this.max = this.length * (this.itemHeight+1);
    //this.range = this.max - this.maxHeight;
    this.ratio = this.maxHeight / this.max;
    this.sh = this.maxHeight * this.ratio;
    //if( this.sh < 20 ) this.sh = 20;
    this.range = this.maxHeight - this.sh;
    this.c[6].style.height = this.sh + 'px';

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
        this.c[5].style.top = 'auto';
        this.c[2].style.bottom = '10px';
        this.c[3].style.bottom = '2px';
        this.c[4].style.bottom = '2px';
        this.c[5].style.bottom = '2px';

    }

    if( this.max > this.maxHeight ){ 
        this.w = this.sb-20;
        this.scroll = true;
    }

    this.listIn = UIL.DOM( null, 'div', UIL.BASIC + 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2); ');
    this.listIn.name = 'list';
    this.c[2].style.height = this.maxHeight + 'px';
    this.c[2].appendChild(this.listIn);

    // populate list
    var item, n, l = this.sb;
    for( var i=0; i<this.length; i++ ){
        n = this.list[i];
        item = UIL.DOM( null, 'div', UIL.ITEM + 'width:'+this.w+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px;');
        //item = UIL.DOM('UIL', 'div', UIL.TXT + 'position:relative; background:rgba(0,0,0,0.2); margin-bottom:1px; pointer-events:auto; cursor:pointer; width:'+this.w+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px;');
        item.textContent = n;
        item.style.color = this.fontColor;
        item.name = 'item';//n;
        this.listIn.appendChild(item);
    }

    this.c[5].textContent = this.value;
    

    this.init();

}

UIL.List.prototype = Object.create( UIL.Proto.prototype );
UIL.List.prototype.constructor = UIL.List;

UIL.List.prototype.handleEvent = function( e ) {

    e.preventDefault();

    var name = e.target.name || '';
    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mouseover': if(name === 'title') this.mode(1); else this.listover(e); break;
        case 'mousedown': if(name === 'title') this.mode(2); else this.listdown(e); break;
        case 'mouseup':   if(name === 'title') this.mode(0); else this.listup(e); break;
        case 'mouseout':  if(name === 'title') this.mode(0); else this.listout(e); break;
        case 'mousemove': this.listmove(e); break;
        case 'mousewheel': this.listwheel(e); break;
    }

}

UIL.List.prototype.mode = function( mode ){

    var s = this.s;

    switch(mode){
        case 0: // base
            s[5].color = this.fontColor;
            s[3].background = this.buttonColor;
        break;
        case 1: // over
            s[5].color = '#FFF';
            s[3].background = UIL.SELECT;
        break;
        case 2: // edit / down
            s[5].color = this.fontColor;
            s[3].background = UIL.SELECTDOWN;
        break;

    }
}

// -----

UIL.List.prototype.click = function( e ){

    if( this.isShow ) this.listHide();
    else this.listShow();

};

// ----- LIST

UIL.List.prototype.listover = function( e ){
    var name = e.target.name;
    //console.log(name)
    if( name === 'item' ){

        e.target.style.background = UIL.SELECT;
        e.target.style.color = '#FFF'; 
    }

};

UIL.List.prototype.listdown = function( e ){

    var name = e.target.name;
    if( name !== 'list' && name !== undefined ){
        this.value = e.target.textContent;//name;
        this.c[5].textContent = this.value;
        this.send();
        this.listHide();
    } else if ( name ==='list' && this.scroll ){
        this.isDown = true;
        this.listmove( e );
        this.listIn.style.background = 'rgba(0,0,0,0.6)';
        this.s[6].background = '#AAA';

        e.preventDefault();
    }

};

UIL.List.prototype.listmove = function( e ){

    if( this.isDown ){
        var rect = this.c[2].getBoundingClientRect();
        this.update( (e.clientY - rect.top - this.baseH)-(this.sh*0.5) );
    }

};

UIL.List.prototype.listup = function( e ){

    this.isDown = false;
    this.listIn.style.background = 'rgba(0,0,0,0.2)';
    this.s[6].background = '#666';

};

UIL.List.prototype.listout = function( e ){

    var n = e.target.name;
    if( n === 'item' ){

        e.target.style.background ='rgba(0,0,0,0.2)';
        e.target.style.color = this.fontColor; 
    }


    if( this.isUI ) this.main.lockwheel = false;
    this.listup();
    var name = e.relatedTarget.name;
    if( name === undefined ) this.listHide();

    

};

UIL.List.prototype.listwheel = function( e ){

    if( !this.scroll ) return;
    if( this.isUI ) this.main.lockwheel = true;
    var delta = 0;
    if( e.wheelDeltaY ) delta = -e.wheelDeltaY*0.04;
    else if( e.wheelDelta ) delta = -e.wheelDelta*0.2;
    else if( e.detail ) delta = e.detail*4.0;

    this.py += delta;

    this.update(this.py);

};


// ----- LIST

UIL.List.prototype.update = function( y ){

    if( !this.scroll ) return;

    y = y < 0 ? 0 :y;
    y = y > this.range ? this.range : y;

    this.listIn.style.top = -(~~( y / this.ratio ))+'px';
    this.s[6].top = ( ~~ y ) + this.baseH + 'px';

    this.py = y;

};

UIL.List.prototype.listShow = function(){

    this.update( 0 );
    this.isShow = true;
    this.h = this.maxHeight + this.baseH + 10;
    if( !this.scroll ){
        this.h = this.baseH + 10 + this.max;
        this.s[6].display = 'none';
        this.c[2].removeEventListener( 'mousewheel', this, false );
        this.c[2].removeEventListener( 'mousemove',  this, false ); 
    } else {
        this.s[6].display = 'block';
    }
    this.s[0].height = this.h+'px';
    this.s[2].display = 'block';
    if( this.side === 'up' ) this.s[4].background = UIL.F0;
    else this.s[4].background = UIL.F1;

    this.rSizeContent();

    if( this.parentGroup !== null ){ this.parentGroup.calc( this.h - this.baseH );}
    else if( this.isUI ) this.main.calc( this.h - this.baseH );

};

UIL.List.prototype.listHide = function(){

    if( this.parentGroup !== null ){ this.parentGroup.calc( -(this.h-this.baseH) );}
    else if( this.isUI ) this.main.calc(-(this.h-this.baseH));

    this.isShow = false;
    this.h = this.baseH;
    this.s[0].height = this.h + 'px';
    this.s[2].display = 'none';
    this.s[4].background = UIL.F0;
    
};

// -----

UIL.List.prototype.text = function( txt ){

    this.c[5].textContent = txt;

};

UIL.List.prototype.rSizeContent = function(){

    var i = this.length;
    while(i--) this.listIn.children[i].style.width = this.w + 'px';

};

UIL.List.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    var s = this.s;

    s[2].width = this.sb + 'px';
    s[2].left = this.sa - 20 +'px';

    s[3].width = this.sb + 'px';
    s[3].left = this.sa + 'px';

    s[4].left = this.sa + this.sb - 17 + 'px';

    s[5].width = this.sb + 'px';
    s[5].left = this.sa + 'px';

    this.w = this.sb;
    if(this.max > this.maxHeight) this.w = this.sb-20;

    if(this.isShow) this.rSizeContent();

};
UIL.Bool = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || false;

    this.buttonColor = UIL.BUTTON;

    this.inh = o.inh || this.h;

    var t = ~~ (this.h*0.5)-((this.inh-2)*0.5);



    this.c[2] = UIL.DOM( null, 'div', UIL.BASIC + 'background:'+ UIL.BOOLBG +'; height:'+(this.inh-2)+'px; width:36px; top:'+t+'px; border-radius:20px; pointer-events:auto; cursor:pointer; transition:0.1s ease-out;' );
    this.c[3] = UIL.DOM( null, 'div', UIL.BASIC + 'opasity:0, background:'+ UIL.BOOLBG +'; height:'+(this.inh-6)+'px; width:'+(this.inh-6)+'px; top:'+(t+2)+'px; border-radius:20px; ' );

    //this.c[3] = UIL.DOM('UIL', 'path', 'width:17px; top:'+(t+1)+'px;',{ width:17, height:17, d:'M 4 9 L 6 12 14 4', 'stroke-width':2, stroke:'#000', fill:'none', 'stroke-linecap':'butt' });
    this.c[4] = UIL.DOM( null, 'div', UIL.BASIC + 'border:1px solid '+UIL.Border+'; height:'+(this.inh-4)+'px; width:16px; top:'+(t+1)+'px; border-radius:20px; background:'+this.buttonColor+'; transition:margin 0.1s ease-out;' );

    /*this.c[2] = UIL.DOM('UIL', 'div', 'background:'+ UIL.BOOLBG +'; height:18px; width:36px; top:'+t+'px; border-radius:8px; pointer-events:auto; cursor:pointer;' );
    this.c[3] = UIL.DOM('UIL', 'path', 'width:17px; top:'+(t+1)+'px;',{ width:17, height:17, d:'M 4 9 L 6 12 14 4', 'stroke-width':2, stroke:'#000', fill:'none', 'stroke-linecap':'butt' });
    this.c[4] = UIL.DOM('UIL', 'div', 'height:16px; width:16px; top:'+(t+1)+'px; border-radius:8px; background:'+UIL.bgcolor(UIL.COLOR,1)+'; transition:margin 0.1s ease-out;' );*/

    if(this.value){
        this.c[4].style.marginLeft = '18px';
        this.c[2].style.background = this.fontColor;
        this.c[2].style.borderColor = this.fontColor;
    }

    this.c[2].events = [ 'click' ];

    this.init();

};

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;

UIL.Bool.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'click': this.click(e); break;
    }

};

UIL.Bool.prototype.click = function( e ){

    var s = this.s;

    if(this.value){
        this.value = false;
    } else {
        this.value = true;;
    }

    this.update();

    this.send();

};



UIL.Bool.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    var s = this.s;
    s[2].left = this.sa + 'px';
    s[3].left = this.sa+1+ 'px';
    s[4].left = this.sa+1 + 'px';

};

UIL.Bool.prototype.update = function() {

    var s = this.s;

    if(this.value){
        s[4].marginLeft = '18px';
        s[2].background = this.fontColor;
        s[2].borderColor = this.fontColor;
        s[4].borderColor = this.fontColor;
    } else {
        s[4].marginLeft = '0px';
        s[2].background = UIL.BOOLBG;
        s[2].borderColor = UIL.BOOLBG;
        s[4].borderColor = UIL.Border;
    }
        
};
UIL.Button = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || [this.txt];

    this.buttonColor = o.bColor || UIL.BUTTON;

    this.isLoadButton = o.loader || false;
    this.isDragButton = o.drag || false;
    if(this.isDragButton )this.isLoadButton=true;
    this.r = o.r || 0;

    this.lng = this.value.length;

    for(var i = 0; i < this.lng; i++){
        this.c[i+2] = UIL.DOM(null, 'div', UIL.TXT + UIL.BASIC +'text-align:center; border:1px solid '+UIL.Border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.r+'px; line-height:'+(this.h-4)+'px;' );
        this.c[i+2].style.color = this.fontColor;

        this.c[i+2].events = [ 'click', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];
        this.c[i+2].innerHTML = this.value[i];//this.txt;
        this.c[i+2].name = i;
    }

    if( this.c[1] !== undefined ) this.c[1].textContent = '';
    

    if( this.isLoadButton ) this.initLoader();
    if( this.isDragButton ) this.initDrager();

    this.init();

};

UIL.Button.prototype = Object.create( UIL.Proto.prototype );
UIL.Button.prototype.constructor = UIL.Button;

UIL.Button.prototype.handleEvent = function( e ) {

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

};

UIL.Button.prototype.dragover = function(){
    this.s[4].borderColor = UIL.SELECT;
    this.s[4].color = UIL.SELECT;
};
UIL.Button.prototype.dragend = function(){
    this.s[4].borderColor = this.fontColor;
    this.s[4].color = this.fontColor;
};
UIL.Button.prototype.drop = function(e){
    this.dragend();
    this.fileSelect( e.dataTransfer.files[0] );
};

UIL.Button.prototype.mode = function( mode, e ){

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
            s[i+2].background = UIL.SELECT;
        break;
        case 2: // edit / down
            s[i+2].color = this.fontColor;
            s[i+2].background = UIL.SELECTDOWN;
        break;

    }
}

UIL.Button.prototype.initDrager = function(){

    this.c[4] = UIL.DOM(null, 'div', UIL.TXT + UIL.BASIC +' text-align:center; line-height:'+(this.h-8)+'px; border:1px dashed '+this.fontColor+'; top:2px; pointer-events:auto; cursor:default; height:'+(this.h-4)+'px; border-radius:'+this.r+'px;' );
    this.c[4].textContent = 'DRAG';

    this.c[2].events = [  ];
    this.c[4].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];


};

UIL.Button.prototype.initLoader = function(){

    this.c[3] = UIL.DOM(null, 'input', UIL.BASIC +'border:1px solid '+UIL.Border+'; top:1px; opacity:0; pointer-events:auto; cursor:pointer; height:'+(this.h-2)+'px;' );
    this.c[3].name = 'loader';
    this.c[3].type = "file";

    this.c[2].events = [  ];
    this.c[3].events = [ 'change', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

    //this.hide = document.createElement('input');

};

UIL.Button.prototype.fileSelect = function( file ){

    //if( ! e.target.files ) return;

    //var file = e.target.files[0];
   
    this.c[3].type = "null";
    // console.log( this.c[4] )

    if( file === undefined ) return;

    var reader = new FileReader();
    var fname = file.name;
    var type = fname.substring(fname.indexOf('.')+1, fname.length );

    if( type === 'png' || type === 'jpg' ) reader.readAsDataURL( file );
    else if(type === 'z') reader.readAsBinaryString( file );
    else reader.readAsText( file );

    reader.onload = function(e) { 
        this.callback( e.target.result, fname, type );
         this.c[3].type = "file";
        //this.send( e.target.result ); 
    }.bind(this);

};

UIL.Button.prototype.click = function( e ){

    var i = e.target.name || 0;
    var v = this.value[i];

    this.send( v );

};

UIL.Button.prototype.label = function( string, n ){

    n = n || 2;
    this.c[n].textContent = string;

};

UIL.Button.prototype.icon = function( string, y, n ){

    n = n || 2;
    this.s[n].padding = ( y || 0 ) +'px 0px';
    this.c[n].innerHTML = string;

};

UIL.Button.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    var s = this.s;
    var w = this.sb;
    var d = this.sa;


    if( this.isDragButton ){ 
        w = ~~ w * 0.5;
        s[4].left = (d+w) + 'px';
        s[4].width = w-4 + 'px';
    }

    if( this.isLoadButton ){
        s[3].left = d + 'px';
        s[3].width = w + 'px';
    }

    var tt = ~~ (w / this.lng);

    for(var i = 0; i < this.lng; i++){

        s[i+2].left = d + (tt*i) + 'px';
        s[i+2].width = (tt-4) + 'px';

    }

    

};
UIL.Circular = function( o ){

    UIL.Proto.call( this, o );

    //this.type = 'circular';
    this.autoWidth = false;

    this.buttonColor = UIL.BUTTON;

    this.setTypeNumber( o );

    this.radius = o.radius || 15;
    
    this.width = (this.radius*2)+20;

    if(o.width !== undefined){
        this.width = o.width;
        this.radius = ~~ (this.width-20)*0.5;
    }

    if(o.size !== undefined){
        this.width = o.size;
        this.radius = ~~ (this.width-20)*0.5;
    }

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

    this.c[2] = UIL.DOM(null, 'div', UIL.NUM + 'text-align:center; top:'+(this.height+24)+'px; width:'+this.width+'px; color:'+ this.fontColor );

    this.c[3] = UIL.DOM(null, 'circle', UIL.BASIC + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = UIL.DOM(null, 'path', UIL.BASIC + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { d:this.makePath(), fill:this.fontColor });
    this.c[5] = UIL.DOM(null, 'circle', UIL.BASIC + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius, r:this.radius*0.5, fill:this.buttonColor, 'stroke-width':1, stroke:UIL.SVGC });

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    this.update();

};

UIL.Circular.prototype = Object.create( UIL.Proto.prototype );
UIL.Circular.prototype.constructor = UIL.Circular;

UIL.Circular.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout':  this.out( e );  break;

        case 'mouseup':   this.up( e );   break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Circular.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            this.s[2].color = this.fontColor;
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[4], 'fill', this.fontColor );
        break;
        case 1: // over
        this.s[2].color = this.colorPlus;
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
            UIL.setSvg( this.c[4], 'fill', this.colorPlus );
        break;

    }
}

UIL.Circular.prototype.over = function( e ){

    this.isOver = true;
    this.mode(1);

};

UIL.Circular.prototype.out = function( e ){

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Circular.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.isOver) this.mode(1);
    else this.mode(0);

    this.sendEnd();

};

UIL.Circular.prototype.down = function( e ){

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    this.rect = this.c[3].getBoundingClientRect();
    this.old = this.value;
    this.oldr = null;
    this.move( e );

};

UIL.Circular.prototype.move = function( e ){

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

};

UIL.Circular.prototype.makePath = function(){

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

};

UIL.Circular.prototype.update = function( up ){

    this.c[2].textContent = this.value;
    this.percent = ( this.value - this.min ) / this.range;
    UIL.setSvg( this.c[4], 'd', this.makePath() );
    if( up ) this.send();
    
};
UIL.Knob = function( o ){

    UIL.Proto.call( this, o );

    //this.type = 'knob';
    this.autoWidth = false;

    this.buttonColor = UIL.BUTTON;

    this.setTypeNumber( o );

    this.mPI = Math.PI * 0.8;
    this.toDeg = 180 / Math.PI;
    this.cirRange = this.mPI * 2;

    this.radius = o.radius || 15;
    
    this.width = (this.radius*2)+20;

    if(o.width !== undefined){
        this.width = o.width;
        this.radius = ~~ (this.width-20)*0.5;
    }

    if(o.size !== undefined){
        this.width = o.size;
        this.radius = ~~ (this.width-20)*0.5;
    }

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

    this.c[2] = UIL.DOM( null, 'div', UIL.NUM + 'text-align:center; top:'+(this.height+24)+'px; width:'+this.width+'px; color:'+ this.fontColor );

    this.c[3] = UIL.DOM( null, 'circle', UIL.BASIC + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;  pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius-4, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = UIL.DOM( null, 'circle', UIL.BASIC + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius*0.5, r:3, fill:this.fontColor });
    this.c[5] = UIL.DOM( null, 'path', UIL.BASIC + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { d:this.makeGrad(), 'stroke-width':1, stroke:UIL.SVGC });
    
    UIL.DOM( null, 'circle', null, { cx:this.radius, cy:this.radius, r:this.radius*0.7, fill:this.buttonColor, 'stroke-width':1, stroke:UIL.SVGC }, this.c[3] );

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.r = 0;

    this.init();

    this.update();

};

UIL.Knob.prototype = Object.create( UIL.Circular.prototype );
UIL.Knob.prototype.constructor = UIL.Knob;

UIL.Knob.prototype.move = function( e ){

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

};

UIL.Knob.prototype.makeGrad = function(){

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

};

UIL.Knob.prototype.update = function( up ){

    this.c[2].textContent = this.value;
    this.percent = (this.value - this.min) / this.range;

    var r = ( (this.percent * this.cirRange) - (this.mPI)) * this.toDeg;

    UIL.setSvg( this.c[4], 'transform', 'rotate('+ r +' '+this.radius+' '+this.radius+')' );

    if( up ) this.send();
    
};
UIL.Joystick = function( o ){

    UIL.Proto.call( this, o );

    this.autoWidth = false;

    this.value = [0,0];

    this.precision = o.precision || 2;
    this.multiplicator = o.multiplicator || 1;

    this.x = 0;
    this.y = 0;

    this.oldx = 0;
    this.oldy = 0;

    this.interval = null;

    this.radius = o.radius || 50;

    this.width = (this.radius*2)+20;

    if(o.width !== undefined){
        this.width = o.width;
        this.radius = ~~ (this.width-20)*0.5;
    }
    if(o.size !== undefined){
        this.width = o.size;
        this.radius = ~~ (this.width-20)*0.5;
    }

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

    this.c[2] = UIL.DOM( null, 'circle', UIL.BASIC + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;  pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'url(#grad)' });
    this.c[3] = UIL.DOM( null, 'circle', UIL.BASIC + 'left:0px; top:'+(this.top-10)+'px; width:'+(this.w+20)+'px; height:'+(this.height+20)+'px;', { cx:this.radius+10, cy:this.radius+10, r:this.innerRadius+10, fill:'url(#gradS)'});
    this.c[4] = UIL.DOM( null, 'circle', UIL.BASIC + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius, r:this.innerRadius, fill:'url(#gradIn)', 'stroke-width':1, stroke:'#000'  });
    this.c[5] = UIL.DOM( null, 'div', UIL.TXT + 'text-align:center; top:'+(this.height+20)+'px; width:'+this.width+'px; color:'+ this.fontColor );

    // gradian bakground
    var svg = this.c[2];
    UIL.DOM( null, 'defs', null, {}, svg );
    UIL.DOM( null, 'radialGradient', null, {id:'grad', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
    UIL.DOM( null, 'stop', null, { offset:'40%', style:'stop-color:rgb(0,0,0); stop-opacity:0.3;' }, svg, [1,0] );
    UIL.DOM( null, 'stop', null, { offset:'80%', style:'stop-color:rgb(0,0,0); stop-opacity:0;' }, svg, [1,0] );
    UIL.DOM( null, 'stop', null, { offset:'90%', style:'stop-color:rgb(50,50,50); stop-opacity:0.4;' }, svg, [1,0] );
    UIL.DOM( null, 'stop', null, { offset:'100%', style:'stop-color:rgb(50,50,50); stop-opacity:0;' }, svg, [1,0] );

    // gradian shadow
    svg = this.c[3];
    UIL.DOM( null, 'defs', null, {}, svg );
    UIL.DOM( null, 'radialGradient', null, {id:'gradS', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
    UIL.DOM( null, 'stop', null, { offset:'60%', style:'stop-color:rgb(0,0,0); stop-opacity:0.5;' }, svg, [1,0] );
    UIL.DOM( null, 'stop', null, { offset:'100%', style:'stop-color:rgb(0,0,0); stop-opacity:0;' }, svg, [1,0] );

    // gradian stick
    var color0 = 'rgb(40,40,40)';
    var color1 = 'rgb(48,48,48)';
    var color2 = 'rgb(30,30,30)';

    var color3 = 'rgb(1,90,197)';
    var color4 = 'rgb(3,95,207)';
    var color5 = 'rgb(0,65,167)';
    svg = this.c[4];
    UIL.DOM( null, 'defs', null, {}, svg );
    UIL.DOM( null, 'radialGradient', null, {id:'gradIn', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
    UIL.DOM( null, 'stop', null, { offset:'30%', style:'stop-color:'+color0+'; stop-opacity:1;' }, svg, [1,0] );
    UIL.DOM( null, 'stop', null, { offset:'60%', style:'stop-color:'+color1+'; stop-opacity:1;' }, svg, [1,0]  );
    UIL.DOM( null, 'stop', null, { offset:'80%', style:'stop-color:'+color1+'; stop-opacity:1;' }, svg, [1,0]  );
    UIL.DOM( null, 'stop', null, { offset:'100%', style:'stop-color:'+color2+'; stop-opacity:1;' }, svg, [1,0]  );

    UIL.DOM( null, 'radialGradient', null, {id:'gradIn2', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, this.c[4], 1 );
    UIL.DOM( null, 'stop', null, { offset:'30%', style:'stop-color:'+color3+'; stop-opacity:1;' }, svg, [1,1]  );
    UIL.DOM( null, 'stop', null, { offset:'60%', style:'stop-color:'+color4+'; stop-opacity:1;' }, svg, [1,1] );
    UIL.DOM( null, 'stop', null, { offset:'80%', style:'stop-color:'+color4+'; stop-opacity:1;' }, svg, [1,1] );
    UIL.DOM( null, 'stop', null, { offset:'100%', style:'stop-color:'+color5+'; stop-opacity:1;' }, svg, [1,1] );

    //console.log( this.c[4] )

    this.c[5].textContent = 'x'+ this.value[0] +' y' + this.value[1];

    this.c[2].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    this.update(false);
}

UIL.Joystick.prototype = Object.create( UIL.Proto.prototype );
UIL.Joystick.prototype.constructor = UIL.Joystick;

UIL.Joystick.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout':  this.out( e );  break;

        case 'mouseup':   this.up( e );   break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Joystick.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            //UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[4], 'fill','url(#gradIn)');
            UIL.setSvg( this.c[4], 'stroke', '#000' );
        break;
        case 1: // over
            //UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
            UIL.setSvg( this.c[4], 'fill', 'url(#gradIn2)' );
            UIL.setSvg( this.c[4], 'stroke', 'rgba(0,0,0,0)' );
        break;
        case 2: // edit
        break;

    }
}

UIL.Joystick.prototype.over = function( e ){

    this.isOver = true;
    this.mode(1);

};

UIL.Joystick.prototype.out = function( e ){

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Joystick.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    this.interval = setInterval(this.update.bind(this), 10);

    if(this.isOver) this.mode(1);
    else this.mode(0);
    

};

UIL.Joystick.prototype.down = function( e ){

  

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    this.rect = this.c[2].getBoundingClientRect();
    //this.old = this.value;
    //this.oldr = null;
    this.move( e );
    this.mode(2);

};

UIL.Joystick.prototype.move = function( e ){

    if( !this.isDown ) return;

    var x = this.radius - (e.clientX - this.rect.left);
    var y = this.radius - (e.clientY - this.rect.top);

    var distance = Math.sqrt(x * x + y * y);

    if (distance > this.maxDistance) {
        var angle = Math.atan2(x, y);
        x = Math.sin(angle) * this.maxDistance;
        y = Math.cos(angle) * this.maxDistance;
    }

    this.x = x / this.maxDistance;
    this.y = y / this.maxDistance;

    this.update();

};

UIL.Joystick.prototype.update = function(up){

    if(up === undefined) up = true;

    if(this.interval !== null){

        if( !this.isDown ){
            this.x += (0 - this.x)/3;
            this.y += (0 - this.y)/3;
        }

        if ( this.x.toFixed(2) === this.oldx.toFixed(2) && this.y.toFixed(2) === this.oldy.toFixed(2)){
            
            this.x = 0;
            this.y = 0;
        }

    }

    var rx = this.x * this.maxDistance
    var ry = this.y * this.maxDistance

    var x = this.radius - rx;
    var y = this.radius - ry;
    var sx = x + ((1-this.x)*5) + 5;
    var sy = y + ((1-this.y)*5) + 10;

    this.value[0] = -(this.x*this.multiplicator).toFixed(this.precision) * 1;
    this.value[1] =  (this.y*this.multiplicator).toFixed(this.precision) * 1;

    this.c[5].textContent = 'x'+ this.value[0] +' y' + this.value[1];

    UIL.setSvg( this.c[3], 'cx', sx );
    UIL.setSvg( this.c[3], 'cy', sy );
    UIL.setSvg( this.c[4], 'cx', x );
    UIL.setSvg( this.c[4], 'cy', y );

    this.oldx = this.x;
    this.oldy = this.y;

    if(up) this.send();

    if( this.interval !== null && this.x === 0 && this.y === 0 ){
        clearInterval(this.interval);
        this.interval = null;
    }

};
UIL.Fps = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;

    this.baseH = this.h;
    this.hplus = 50;

    //this.c[2] = UIL.DOM( null, 'div', UIL.TXT + 'width:100%; height:'+this.baseH+'px; cursor:pointer; pointer-events:auto; ');

    //this.c[2].textContent = 'FPS';
    this.c[1].textContent = 'FPS';
    this.c[0].style.cursor = 'pointer';
    this.c[0].style.pointerEvents = 'auto';

    var panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px; '

    this.c[2] = UIL.DOM( null, 'div', UIL.BASIC + panelCss + 'border:1px solid rgba(255, 255, 255, 0.2);');
    this.c[3] = UIL.DOM( null, 'div', UIL.BASIC + panelCss + 'border:1px solid rgba(255, 255, 255, 0);');
    this.c[4] = UIL.DOM( null, 'div', UIL.BASIC + panelCss + 'border:1px solid rgba(255, 255, 255, 0);');

    this.c[5] = UIL.DOM( null, 'div', UIL.BASIC + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');




    


   // this.c[2] = UIL.DOM( null, 'canvas', UIL.BASIC + 'display:none; left:10px; top:'+ (this.h + 10) + 'px;');

    
    //this.c[2].height = this.hplus - 20;

    //this.ctx = this.c[2].getContext('2d');

    this.isShow = o.show || false;


    this.now = ( self.performance && self.performance.now ) ? self.performance.now.bind( performance ) : Date.now;
    this.startTime = this.now()
    this.prevTime = this.startTime;
    this.frames = 0

    this.isMem = false;

    this.ms = 0;
    this.fps = 0;
    this.mem = 0;
    this.mm = 0;

    this.nFrame = 40;

    if ( self.performance && self.performance.memory ) this.isMem = true;

    this.initGraph(1);
    //this.mode = 0;


    this.c[0].events = [ 'click', 'mousedown', 'mouseover', 'mouseout' ];

    this.init();

}

UIL.Fps.prototype = Object.create( UIL.Proto.prototype );
UIL.Fps.prototype.constructor = UIL.Fps;

UIL.Fps.prototype.handleEvent = function( e ) {

    e.preventDefault();
    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mouseover': this.mode(1); break;
        case 'mousedown': this.mode(2); break;
        case 'mouseout':  this.mode(0); break;
    }

}

UIL.Fps.prototype.click = function( e ){

    if( this.isShow ) this.hide();
    else this.show();

};

UIL.Fps.prototype.mode = function( mode ){

    var s = this.s;

    switch(mode){
        case 0: // base
            s[1].color = this.fontColor;
            s[1].background = 'none';
        break;
        case 1: // over
            s[1].color = '#FFF';
            s[1].background = UIL.SELECT;
        break;
        case 2: // edit / down
            s[1].color = this.fontColor;
            s[1].background = UIL.SELECTDOWN;
        break;

    }
}

UIL.Fps.prototype.initGraph = function( l ){

    //while (this.c[2].firstChild) this.c[2].removeChild(this.c[2].firstChild);
    //while (this.c[3].firstChild) this.c[3].removeChild(this.c[3].firstChild);
    //while (this.c[2].firstChild) this.c[4].removeChild(this.c[4].firstChild);
    

    var e, f, g;

    //var l = Math.floor( w / 60 );

    //console.log(w, l, l*60)

    for ( var i = 0; i < this.nFrame; i ++ ) {

        e = document.createElement( 'span' );
        f = document.createElement( 'span' );
        
        e.style.cssText = 'position:relative; width:'+l+'px; height:1px; top:38px; float:left; border-bottom: 1px solid rgba(0,0,0,0.5); background:#CCC;  pointer-events:none;';
        f.style.cssText = 'position:relative; width:'+l+'px; height:1px; top:38px; float:left; border-bottom: 1px solid rgba(0,0,0,0.5); background:#CC0;  pointer-events:none;';


        //graph.appendChild( createElement( 'span', '', 'width:1px; height:30px; margin-top:10px; float:left; opacity:0.9; background:none; border-bottom: 1px solid '+ fg ) );

        this.c[2].appendChild( e );
        this.c[3].appendChild( f );

        if ( this.isMem ) {

            g = document.createElement( 'span' );
            g.style.cssText = 'position:relative; width:'+l+'px; height:1px; top:38px; float:left; border-bottom: 1px solid rgba(0,0,0,0.5); background:#0CC;  pointer-events:none;';
            this.c[4].appendChild( g );

        }


    }

}

UIL.Fps.prototype.resizeGraph = function( l ){

    for ( var i = 0; i < this.nFrame; i ++ ) {
        this.c[2].children[ i ].style.width = l + 'px';
        this.c[3].children[ i ].style.width = l + 'px';
        if ( this.isMem ) this.c[4].children[ i ].style.width = l + 'px';
    }

}

UIL.Fps.prototype.drawGraph = function( ){

    var c = this.c[2].appendChild( this.c[2].firstChild );
    c.style.top = 8 + Math.min( 30, 30 - (this.fps/ 100) * 30 ) + 'px';

    c = this.c[3].appendChild( this.c[3].firstChild );
    c.style.top = 8 + Math.min( 30, 30 - (this.ms/ 200) * 30 ) + 'px';

    if ( this.isMem ) {

        c = this.c[4].appendChild( this.c[4].firstChild );
        c.style.top = 8 + Math.min( 30, 30 - this.mm * 30 ) + 'px';

    }

}


UIL.Fps.prototype.show = function(){

    this.h = this.hplus + this.baseH;


    if( this.parentGroup !== null ){ this.parentGroup.calc( this.hplus );}
    else if( this.isUI ) this.main.calc( this.hplus );

    this.s[0].height = this.h +'px';
    this.s[2].display = 'block'; 
    this.s[3].display = 'block'; 
    this.s[4].display = 'block'; 
    this.isShow = true;

    UIL.addListen( this );

}

UIL.Fps.prototype.hide = function(){

    this.h = this.baseH;

    if( this.parentGroup !== null ){ this.parentGroup.calc( -this.hplus );}
    else if( this.isUI ) this.main.calc( -this.hplus );
    
    this.s[0].height = this.h +'px';
    this.s[2].display = 'none'; 
    this.s[3].display = 'none'; 
    this.s[4].display = 'none'; 
    this.isShow = false;

    UIL.removeListen( this );
    this.c[1].textContent = 'FPS';
    
}

UIL.Fps.prototype.rSize = function(){

    this.s[0].width = this.width + 'px';
    this.s[1].width = this.width + 'px';


    var l = Math.floor( (this.width - 20) / this.nFrame );
    var ww = (l * this.nFrame) + 2;
    var ll = Math.round((this.width - ww)*0.5);

    this.s[2].left = ll + 'px';
    this.s[3].left = ll + 'px';
    this.s[4].left = ll + 'px';

    this.s[2].width = ww + 'px';
    this.s[3].width = ww + 'px';
    this.s[4].width = ww + 'px';

    this.resizeGraph(  l  );

    
}

UIL.Fps.prototype.begin = function(){

    this.startTime = this.now();
    
}



UIL.Fps.prototype.end = function(){


    var time = this.now();
    this.ms = time - this.startTime;
    //msMin = Math.min( msMin, ms );
    //msMax = Math.max( msMax, ms );



    //msText.textContent = ( ms | 0 ) + ' ms';// (' + ( msMin | 0 ) + '-' + ( msMax | 0 ) + ')';
    //updateGraph( msGraph, ms / 200 );

    this.frames ++;

    if ( time > this.prevTime + 1000 ) {

        this.fps = Math.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );
        //fpsMin = Math.min( fpsMin, fps );
        //fpsMax = Math.max( fpsMax, fps );


        //fpsText.textContent = this.fps + ' fps';// (' + fpsMin + '-' + fpsMax + ')';
        //updateGraph( fpsGraph, fps / 100 );

        this.prevTime = time;
        this.frames = 0;

        if ( this.isMem ) {

            var heapSize = performance.memory.usedJSHeapSize;
            var heapSizeLimit = performance.memory.jsHeapSizeLimit;

            this.mem = Math.round( heapSize * 0.000000954 );

            this.mm = heapSize / heapSizeLimit;
            //memMin = Math.min( memMin, mem );
            //memMax = Math.max( memMax, mem );


            //memText.textContent = mem + ' mb';// (' + memMin + '-' + memMax + ')';
            //updateGraph( memGraph, heapSize / heapSizeLimit );

        }

    }

    this.drawGraph();
    this.c[1].innerHTML = 'FPS ' + this.fps + ' . <font color="yellow"> MS '+ ( this.ms | 0 ) + '</font> . <font color="cyan"> MB '+ this.mem + '</font>';

    return time;

    
}

UIL.Fps.prototype.listening = function(){

    this.startTime = this.end();
    
}
