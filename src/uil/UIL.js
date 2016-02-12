/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2016
*    @author lo.th / http://lo-th.github.io/labs/
*/

'use strict';

var define, module, exports;

//var UMC = UMC || {};

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
    UIL.TXT = 'font-family:"Lucida Console", Monaco, monospace; font-size:11px; color:#cccccc; letter-spacing: -1px; padding:3px 10px; left:0; top:0; height:17px; width:100px; overflow:hidden; white-space: nowrap;';

    UIL.DOM = UMC.dom;
    UIL.CC = UMC.cc;
        //setDom : Crea.setDom,
    UIL.setSvg = UMC.setSvg;
    UIL.clone = UMC.clone;
    UIL.clear = UMC.clear;


    UIL.COLOR = 'N';
    UIL.SELECT = '#035fcf';
    UIL.MOVING = '#03afff';
    UIL.SELECTDOWN = '#024699';
    UIL.SVGB = 'rgba(0,0,0,0.3)';
    UIL.SVGC = 'rgba(120,120,120,0.6)';
    UIL.Border = 'rgba(120,120,120,0.3)';
    UIL.BorderSelect = 'rgba(3,95,207,0.6)';
    UIL.GroupBG = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAADAQMAAABs5if8AAAABlBMVEVMaXH///+a4ocPAAAAAnRSTlMAM8lDrC4AAAAOSURBVHicY2BgcGBgAAAAxgBBOTEMSwAAAABJRU5ErkJggg==)';
    UIL.SlideBG = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFAQMAAAC3obSmAAAABlBMVEVMaXH///+a4ocPAAAAAnRSTlMAM8lDrC4AAAASSURBVHicY3BgaGDgYBBgUAAABkIA+fbHMRYAAAAASUVORK5CYII=)';
    UIL.sizer = function(w){

        this.WIDTH = ~~ w;
        var s = this.WIDTH/3;
        this.BW = ~~ ((s*2)-10);
        this.AW = ~~ s;

        if(this.main) this.main.changeWidth();

    };

    UIL.classDefine = function(){
            
        UIL.CC('UIL', UIL.UNS + ' position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; border:none; overflow:hidden; background:none;');

        UIL.CC('UIL.content', ' display:block; width:300px; height:auto; top:0; right:10px; transition:height 0.1s ease-out;');
        UIL.CC('UIL.inner', 'width:100%; top:0; left:0; height:auto; ');
        UIL.CC('UIL.bottom', UIL.TXT+'width:100%; top:auto; bottom:0; left:0; height:20px; text-align:center; padding:5px 10px; pointer-events:auto; cursor:pointer;' );

        UIL.CC('UIL.base', 'position:relative; height:20px; float:left;');

        UIL.CC('UIL.text', UIL.TXT );
        UIL.CC('UIL.textSelect', UIL.TXT + UIL.US + 'outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px solid rgba(255,255,255,0.1);' );

        UIL.CC('UIL.slidebg', 'border:1px solid '+UIL.Border+'; left:100px; top:1px; pointer-events:auto; cursor:w-resize; background-image:'+UIL.SlideBG+';' );

        UIL.CC('UIL.button', 'border:1px solid '+UIL.Border+'; left:100px; top:1px; height:17px; pointer-events:auto; cursor:pointer;' );

        UIL.CC('UIL.list', 'box-sizing:content-box; border:20px solid transparent; border-bottom:10px solid transparent; left:80px; top:0px; width:190px; height:90px; cursor:s-resize; pointer-events:auto; display:none;');
        UIL.CC('UIL.list-in', 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2); ');
        UIL.CC('UIL.listItem', 'position:relative; height:18px; background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(0,0,0,0.2); pointer-events:auto; cursor:pointer;'+UIL.TXT);
        UIL.CC('UIL.listItem:hover', 'background:'+UIL.SELECT+'; color:#FFFFFF;')

        UIL.CC('UIL.scroll-bg', 'right:0; top:0; width:10px; height:10px; cursor:s-resize; pointer-events:auto; display:none;');
        UIL.CC('UIL.scroll', ' background:#666; right:0; top:0; width:5px; height:10px;');

        UIL.CC('UIL.svgbox', 'left:100px; top:1px; width:190px; height:17px; pointer-events:auto; cursor:pointer;');

        UIL.DEF = true;
    };

    UIL.bgcolor = function(p, a, bg){
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
