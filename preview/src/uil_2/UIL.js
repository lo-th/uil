/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2016
*    @author lo.th / http://lo-th.github.io/labs/
*/



//var define, module, exports;

//var UMC = UMC || {};

var UIL = ( function () {

    'use strict';

    UIL = function () {};

   

    //UIL.mouse = new UIL.Mouse();

    UIL.REVISION = 0.96;
    UIL.main = null;
    UIL.DEF = false;
    UIL.WIDTH = 300;
    UIL.HEIGHT = 20;
    //UIL.BW = 190;
    //UIL.AW = 100;
    UIL.P = 30;

    UIL.UNS = '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;';
    //UIL.US = '-o-user-select:text; -ms-user-select:text; -khtml-user-select:text; -webkit-user-select:text; -moz-user-select:text;';
    UIL.BASIC = UIL.UNS + 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; border:none; overflow:hidden; background:none;';
    UIL.TXT = 'font-family:"Lucida Console", Monaco, monospace; font-size:11px; color:#CCC; padding:2px 10px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap;';

    UIL.frag = UMC.frag;
    UIL.DOM = UMC.dom;
    UIL.CC = UMC.cc;
    UIL.clear = UMC.clear;
    UIL.setSvg = UMC.setSvg;

    UIL.listens = [];

    UIL.COLOR = 'N';
    UIL.BASECOLOR = '#C0C0C0';

    UIL.BUTTON = '#404040';
    UIL.BOOLBG = '#181818'

    UIL.SELECT = '#035fcf';
    UIL.MOVING = '#03afff';
    UIL.SELECTDOWN = '#024699';
    UIL.BG = 'rgba(0,0,0,0.3)';
    UIL.SVGB = 'rgba(0,0,0,0.3)';
    UIL.SVGC = 'rgba(120,120,120,0.6)';
    UIL.Border = 'rgba(120,120,120,0.3)';
    UIL.BorderSelect = UIL.SELECT;//'rgba(3,95,207,0.6)';
    UIL.PNG = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA';
    UIL.PNGP = 'oAAAAKAgMAAADwXCcuAAAACVBMVEVMaXHi4uLi4uLDusitAAAAAnRSTlMAgJsrThgAAAA';
    UIL.GroupBG = UIL.PNG + 'MAAAADAQMAAABs5if8AAAABlBMVEVMaXH///+a4ocPAAAAAnRSTlMAM8lDrC4AAAAOSURBVHicY2BgcGBgAAAAxgBBOTEMSwAAAABJRU5ErkJggg==)';
    UIL.SlideBG = UIL.PNG + 'UAAAAFAQMAAAC3obSmAAAABlBMVEVMaXH///+a4ocPAAAAAnRSTlMAM8lDrC4AAAASSURBVHicY3BgaGDgYBBgUAAABkIA+fbHMRYAAAAASUVORK5CYII=)';
    //UIL.SlideBG_B = UIL.PNG + 'UAAAAFCAYAAACNbyblAAAAHUlEQVQImWNgYGBg+A8FDDCAIQATROcz4lOAYgwAzyYj3rE9lZIAAAAASUVORK5CYII=)';
    //UIL.SlideBG_N = UIL.PNG + 'UAAAAFCAYAAACNbyblAAAAG0lEQVQImWNggID/UAwHGAIMWAT+MxJQgDAGAOa6CPmLYuUPAAAAAElFTkSuQmCC)';
    UIL.SlideBG_NN = UIL.PNG + 'UAAAAFCAYAAACNbyblAAAALElEQVQImV3MsQ0AIAwDwUsmYTRGyeg0SAi7eekKF8bbwu4ETCdAJ0Ddfr8H+wEEqTj7jz0AAAAASUVORK5CYII=)';


    UIL.F0 = UIL.PNG + UIL.PNGP + 'kSURBVHicY2BkYGBgc2BgYJwAZKSwMDBIckIwkA0SA8sxMAAAN24CxaaVoKMAAAAASUVORK5CYII=)';
    UIL.F1 = UIL.PNG + UIL.PNGP + 'kSURBVHicY2CAAgEGB4YUxokMkmxuDGyRnAyMS1gYGAJgsgwAPlADDRCT8ZwAAAAASUVORK5CYII=)';
    UIL.X0 = UIL.PNG + UIL.PNGP + 'lSURBVHicYxBgcGBIYZzIIMnmxsAWycnAuIQFjEFskBhIDqgGAGxoBXlOWpMvAAAAAElFTkSuQmCC)';



    UIL.classDefine = function () {
            
        UIL.CC('UIL', UIL.UNS + ' position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; border:none; overflow:hidden; background:none;');

        UIL.CC('UIL.text', UIL.TXT );
        UIL.CC('UIL.number', UIL.TXT + 'letter-spacing:-1px; padding:2px 5px;' );
        UIL.CC('UIL.textSelect', UIL.TXT + 'pointer-events:auto; padding:2px 5px; outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px dashed ' + UIL.Border+'; -ms-user-select:element;' );

    };

    

    UIL.classDefine();

    return UIL;

})();


// UMD (Universal Module Definition)

/*( function ( root ) {
    if ( typeof define === 'function' && define.amd ) {// AMD
        define( 'uil', UIL );
    } else if ( 'undefined' !== typeof exports && 'undefined' !== typeof module ) {
        module.exports = UIL;
    } else {// Global variable
        root.UIL = UIL;
    }
})(this);*/
