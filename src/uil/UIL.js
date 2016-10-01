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

        SELECT : '#308AFF',
        MOVING : '#03afff',
        SELECTDOWN : '#024699',
        BG : 'rgba(0,0,0,0.3)',
        SVGB : 'rgba(0,0,0,0.3)',
        SVGC : 'rgba(120,120,120,0.6)',
        Border : '#4f4f4f',
        BorderSelect : '#308AFF',
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
