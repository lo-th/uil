/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2016
*    @author lo.th / http://lo-th.github.io/labs/
*/

'use strict';

var define, module, exports;

//var Crea = Crea || {};

var UIL = ( function () {

    UIL = function () {};

    UIL.REVISION =  '0.9';
    UIL.main = null;
    UIL.DEF = false;
    UIL.WIDTH = 300;
    UIL.BW = 190;
    UIL.AW = 100;

    UIL.UNS = '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;';
    UIL.US = '-o-user-select:text; -ms-user-select:text; -khtml-user-select:text; -webkit-user-select:text; -moz-user-select:text;';
    UIL.TXT = 'font-family:"Lucida Console", Monaco, monospace; font-size:11px; color:#cccccc; background:none; padding:3px 10px; left:0; top:0; height:17px; width:100px; overflow:hidden; white-space: nowrap;';

    UIL.DOM = Crea.dom;
    UIL.CC = Crea.cc;
        //setDom : Crea.setDom,
    UIL.setSvg = Crea.setSvg;


    UIL.COLOR = 'N';
    UIL.SELECT = '#035fcf';
    UIL.MOVING = '#03afff';
    UIL.SELECTDOWN = '#024699';
    UIL.SVGB = 'rgba(0,0,0,0.2)';
    UIL.SVGC = 'rgba(120,120,120,0.6)';
    UIL.BorderSelect = 'rgba(3,95,207,0.6)';

    UIL.sizer = function(w){

        this.WIDTH = ~~ w;
        var s = this.WIDTH/3;
        this.BW = ~~ ((s*2)-10);
        this.AW = ~~ s;

        if(this.main) this.main.changeWidth();

    };

    UIL.classDefine = function(){
            
        UIL.CC('UIL', UIL.UNS + ' position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; border:none; ');

        UIL.CC('UIL.content', ' display:block; width:300px; height:auto; top:0; left:0; overflow:hidden; background:none; transition:height, 0.1s ease-out;');
        UIL.CC('UIL.inner', 'width:100%; top:0; left:0; height:auto; overflow:hidden; background:none; ');
        UIL.CC('UIL.bottom', UIL.TXT+'width:100%; top:auto; bottom:0; left:0; height:20px; overflow:hidden; background:none; text-align:center; padding:5px 10px; pointer-events:auto; cursor:pointer;' );

        UIL.CC('UIL.base', 'position:relative; height:20px; overflow:hidden; float: left');

        UIL.CC('UIL.text', UIL.TXT );
        UIL.CC('UIL.textSelect', UIL.TXT + UIL.US + 'outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px solid rgba(255,255,255,0.1);' );

        UIL.CC('UIL.list', 'box-sizing:content-box; border:20px solid transparent; border-bottom:10px solid transparent; left:80px; top:0px; width:190px; height:90px; overflow:hidden; cursor:s-resize; pointer-events:auto; display:none;');
        UIL.CC('UIL.list-in', 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2); ');
        UIL.CC('UIL.listItem', 'position:relative; height:18px; background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(0,0,0,0.2); pointer-events:auto; cursor:pointer;'+UIL.TXT);
        UIL.CC('UIL.listItem:hover', 'background:'+UIL.SELECT+'; color:#FFFFFF;')

        UIL.CC('UIL.scroll-bg', 'cursor:w-resize; pointer-events:auto; background-image:linear-gradient(to right,  rgba(255,255,255,0), rgba(255,255,255,0.1));');
        UIL.CC('UIL.scroll', ' background:rgba(255,255,255,0.2);');
        UIL.CC('UIL.svgbox', 'left:100px; top:1px; width:190px; height:17px; pointer-events:auto; cursor:pointer;');

        UIL.DEF = true;
    };

    UIL.bgcolor = function(p, a){
        var r=48, g=48, b=48;
        a = a || 0.66;
        if(p){
            switch(p){
                case 'r': case 'R': case 'S': r=160; b=68; break;
                case 'g': case 'G': case 'E': g=120; b=68; break;
                case 'b': case 'B': case 'T': b=120; g=68; break;
                case 'no': case 'NO': a=0; break;
            }
        }
        var color = 'rgba('+r+','+g+','+b+','+a+')';
        if(a === 0) color = 'none';
        return color;
    };

    UIL.classDefine();

    return UIL;

})();


// UMD (Universal Module Definition)

( function ( root ) {
    if ( typeof define === 'function' && define.amd ) {// AMD
        define( 'uil', UIL );
        //define( [], function () { return UIL; } );
    } else if ( 'undefined' !== typeof exports && 'undefined' !== typeof module ) {// else if ( typeof exports === 'object' ) { // Node.js
        module.exports = UIL;
    } else {// Global variable
        root.UIL = UIL;
    }
})(this);
