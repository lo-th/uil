/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2015
*    @author lo.th / http://lo-th.github.io/labs/
*/

'use strict';

var UIL = UIL || ( function () {

    return {
        main:null,
        REVISION: '0.8',
        DEF:false,
        WIDTH:300,
        BW:190,
        AW:100,

        DOM: Crea.dom,
        CC: Crea.cc,
        setDom : Crea.setDom,
        setSvg : Crea.setSvg,

        sizer:function(w){
            this.WIDTH = w.toFixed(0);
            var s = this.WIDTH/3;
            this.BW = (s*2)-10;
            this.AW = s;

            if(this.main) this.main.changeWidth();
        },
        classDefine:function(){
            UIL.COLOR = 'N';
            UIL.SELECT = '#035fcf';
            UIL.SELECTDOWN = '#024699';
            UIL.SVGB = 'rgba(0,0,0,0.2)';
            UIL.SVGC = 'rgba(120,120,120,0.6)';
            UIL.txt1 = 'font-family:"Lucida Console", Monaco, monospace; font-size:11px; color:#cccccc; background:none; padding:3px 10px; left:0; top:0px; height:17px; width:100px; overflow:hidden;';

            UIL.CC('UIL', 'position:absolute; pointer-events:none; box-sizing:border-box; -o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none; margin:0; padding:0; ');

            UIL.CC('UIL.content', 'width:300px; overflow:hidden; background:none;');
            UIL.CC('UIL.inner', 'width:300px; top:0; left:0; height:auto; overflow:hidden; background:none;');

            UIL.CC('UIL.base', 'position:relative; transition:height, 0.1s ease-out; height:20px; overflow:hidden;');

            UIL.CC('UIL.text', UIL.txt1);

            UIL.CC('input', 'border:solid 1px rgba(0,0,0,0.2); background:rgba(0,0,0,0.2); transition: 0.1s ease-out;', true);
            UIL.CC('input:focus', 'border: solid 1px rgba(0,0,0,0); background:rgba(0,0,0,0.6);', true);

            UIL.CC('UIL.list', 'box-sizing:content-box; border:20px solid transparent; border-bottom:10px solid transparent; left:80px; top:0px; width:190px; height:90px; overflow:hidden; cursor:s-resize; pointer-events:auto; display:none;');
            UIL.CC('UIL.list-in', 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2); ');
            UIL.CC('UIL.listItem', 'position:relative; height:18px; background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(0,0,0,0.2); pointer-events:auto; cursor:pointer;'+UIL.txt1);
            UIL.CC('UIL.listItem:hover', 'background:'+UIL.SELECT+'; color:#FFFFFF;')

            UIL.CC('UIL.scroll-bg', 'cursor:w-resize; pointer-events:auto; background:rgba(256,0,0,0.2);');
            //UIL.CC('UIL.svgbox', 'left:100px; top:1px; width:190px; height:17px; pointer-events:auto; cursor:pointer; font-family:"Open Sans", sans-serif; font-size:11px; text-align:center;');
            UIL.CC('UIL.svgbox', 'left:100px; top:1px; width:190px; height:17px; pointer-events:auto; cursor:pointer; font-family:"Lucida Console", Monaco, monospace; font-size:12px; text-align:center;');

            UIL.DEF = true;
        },

        bgcolor: function(p, a){
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
            if(a==0) color = 'none';
            return color;
        },
        
    };

})();


UIL.classDefine();

// UMD (Universal Module Definition)
/*( function ( root ) {
    if ( typeof define === 'function' && define.amd ) {// AMD
        define( [], function () { return UIL; } );
    } else if ( typeof exports === 'object' ) { // Node.js
        module.exports = UIL;
    } else {// Global variable
        root.UIL = UIL;
    }
})(this);*/