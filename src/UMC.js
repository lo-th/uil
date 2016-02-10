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

    var DOM_SIZE = [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'];
    var SVG_TYPE_D = [ 'pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient' ];
    var SVG_TYPE_G = [ 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject' ];

    var svgns = "http://www.w3.org/2000/svg";
    var htmls = "http://www.w3.org/1999/xhtml";

    UMC = function () {};

    UMC.setSvg = function( dom, type, value, id ){

        if( id === -1 ) dom.setAttributeNS( null, type, value );
        else dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

    };

    UMC.setDom = function( dom, type, value ){

        var ext = DOM_SIZE.indexOf(type) !== -1 ? 'px' : '';
        dom.style[type] = value + ext;

    };

    UMC.clearDom = function( dom ){

        while ( dom.children.length ){

            if( dom.lastChild.children ) while ( dom.lastChild.children.length ) dom.lastChild.removeChild( dom.lastChild.lastChild );
            dom.removeChild( dom.lastChild );

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

        }

        if( Class ) dom.setAttribute( 'class', Class );
        if( css ) dom.style.cssText = css; 

        if( id === undefined ) return dom;
        else return dom.childNodes[ id || 0 ];

    };

    // ROOT CLASS DEFINITION

    UMC.cc = function ( name, rules, noAdd ) {

        var adds = noAdd === undefined ? '.' : '';
        
        if( name === '*' ) adds = '';

        var style = doc.createElement( 'style' );
        style.setAttribute( 'type', 'text/css' );
        style.setAttribute( 'id', name );

        head.appendChild(style);

        if( !(style.sheet || {} ).insertRule ) ( style.styleSheet || style.sheet ).addRule(adds+name, rules);
        else style.sheet.insertRule( adds + name + "{" + rules + "}" , 0 );

    };

    // SVG SIDE

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
        else if(!isNaN( id )) return dom.childNodes[ id ]; // first child
        else if( id instanceof Array ){
            if(id.length === 2) return dom.childNodes[ id[0] ].childNodes[ id[1] ];
            if(id.length === 3) return dom.childNodes[ id[0] ].childNodes[ id[1] ].childNodes[ id[2] ];
        }

    };

    return UMC;

})();