/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2016
*    @author lo.th / https://github.com/lo-th
*/

'use strict';

var Crea = Crea || ( function () {

    var doc = document;
    var head = doc.getElementsByTagName('head')[0];
    var DOM_SIZE = [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'];
    var SVG_TYPE = [ 'rect', 'circle', 'path', 'polygon', 'text', 'pattern', 'defs', 'g', 'line', 'foreignObject', 'linearGradient', 'stop', 'animate', 'radialGradient' ];
    var SVG_TYPE_G = [ 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject', 'linearGradient', 'radialGradient' ];
    var svgns = "http://www.w3.org/2000/svg";
        

    Crea = function () {};

    Crea.setSvg = function( dom, type, value, id ){

        dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

    };

    Crea.setDom = function( dom, type, value ){

        var ext = DOM_SIZE.indexOf(type) !== -1 ? 'px' : '';
        dom.style[type] = value + ext;

    };

    Crea.clearDom = function( dom ){

        while ( dom.children.length ){

            if( dom.lastChild.children ) while ( dom.lastChild.children.length ) dom.lastChild.removeChild( dom.lastChild.lastChild );
            dom.removeChild( dom.lastChild );

        }

    };

    Crea.dom = function ( Class, type, css, obj, dom, id ) {

        type = type || 'div';

        if( SVG_TYPE.indexOf(type) !== -1 ){

            if( dom === undefined ){ 
                dom = doc.createElementNS( svgns, 'svg' );
            }

            var g = doc.createElementNS( svgns, type );
            if( SVG_TYPE_G.indexOf(type) !== -1 && id === undefined ) g.setAttributeNS( null, 'pointer-events', 'none' );

            for(var e in obj){

                if(e === 'txt' ) g.textContent = obj[e];
                else g.setAttributeNS( null, e, obj[e] );

            }

            if( id === undefined ) dom.appendChild( g );
            else dom.childNodes[ id || 0 ].appendChild( g );

            
        } else {

            if( dom === undefined ) dom = doc.createElement( type );
        }


        if( Class ) dom.setAttribute( 'class', Class );
        if( css ) dom.style.cssText = css; 

        if( id === undefined ) return dom;
        else return dom.childNodes[ id || 0 ];
    };

    Crea.cc = function ( name, rules, noAdd ) {

        var adds = noAdd === undefined ? '.' : '';
        
        if( name === '*' ) adds = '';

        var style = doc.createElement( 'style' );
        style.setAttribute( 'type', 'text/css' );
        style.setAttribute( 'id', name );

        head.appendChild(style);

        if( !(style.sheet || {} ).insertRule ) ( style.styleSheet || style.sheet ).addRule(adds+name, rules);
        else style.sheet.insertRule( adds + name + "{" + rules + "}" , 0 );

    };

    Crea.Svg = function ( ){

    };

    Crea.Svg.prototype = {
        constructor: Crea.svg,

    };



    return Crea;

})();