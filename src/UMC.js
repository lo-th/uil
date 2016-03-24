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