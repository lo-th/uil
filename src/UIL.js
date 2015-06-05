/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2015
*    @author lo.th / http://lo-th.github.io/labs/
*/

'use strict';

var UIL = UIL || ( function () {
    var _uis = [];
    return {
        REVISION: '1',
        events:[ 'onkeyup', 'onkeydown', 'onclick', 'onchange', 'onmouseover', 'onmouseout', 'onmousemove', 'onmousedown', 'onmouseup' ],
        nset:{
            width:300 , height:262, w:40, h:40, r:10, 
            rc1:'rgba(120,30,60,0.5)', gc1:'rgba(30,120,60,0.5)', bc1:'rgba(30,60,120,0.5)', nc1:'rgba(40,40,40,0.5)',
            rc2:'rgba(120,30,60,0.8)', gc2:'rgba(30,120,60,0.8)', bc2:'rgba(30,60,120,0.8)', nc2:'rgba(40,40,40,0.8)',
        },
        getAll: function () { return _uis; },
        removeAll: function () { _uis = []; },
        add: function ( ui ) { _uis.push( ui ); },
        remove: function ( ui ) { var i = _uis.indexOf( ui ); if ( i !== -1 ) { _uis.splice( i, 1 ); } },
        create:function(el){
            for(var i = 0; i<el.c.length; i++){
                if(i==0) el.c[0].appendChild(el.c[1]);
                else if(i>1) el.c[1].appendChild(el.c[i]);
            }
        },
        bgcolor: function(p){
            var color = this.nset.nc2;
            if(p){
                switch(p){
                    case 'r': case 'R': case 'S': color = this.nset.rc1; break;
                    case 'g': case 'G': case 'E': color = this.nset.gc1; break;
                    case 'b': case 'B': case 'T': color = this.nset.bc1; break;
                    case 'n': case 'N': color = this.nset.nc1; break;
                }
            }
            return color;
        },
        clear: function(dom){
            var i = dom.c.length, j;
            while(i--){
                if(i>1){ 
                    // clear function
                    j = this.events.length;
                    while(j--){ if(dom.c[i][this.events[j]]!==null) dom.c[i][this.events[j]] = null; }
                    dom.c[1].removeChild(dom.c[i]);
                }
                else if(i==1) dom.c[0].removeChild(dom.c[1]);
                dom.c[i] = null;
            }
            dom.c = null;
            if(dom.f){
                i = dom.f.length;
                while(i--) dom.f[i] = null;
                dom.f = null
            }
            if(dom.callback)dom.callback = null;
            if(dom.value)dom.value = null;
        },
        element:function(cName, type, css){ 
            type = type || 'div'; 
            var dom = document.createElement(type); 
            if(cName) dom.className = cName;
            if(css) dom.style.cssText = css; 
            return dom;
        },
        createClass:function(name,rules,noAdd){
            var adds = '.';
            if(noAdd)adds='';
            if(name == '*') adds = '';
            var style = document.createElement('style');
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
            if(!(style.sheet||{}).insertRule) (style.styleSheet || style.sheet).addRule(adds+name, rules);
            else style.sheet.insertRule(adds+name+"{"+rules+"}",0);
        }
    };
})();


UIL.txt1 = 'font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#e2e2e2;';
UIL.txt2 = 'font-family:Monospace; font-size:12px; color:#e2e2e2;';

UIL.createClass('UIL', 'box-sizing:border-box; -o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;');

UIL.createClass('UIL.base', 'width:'+(UIL.nset.width)+'px; height:20px; position:relative; left:0px; pointer-events:none; background:rgba(40,40,40,0.5); margin-bottom:1px;');
UIL.createClass('UIL.title', 'width:'+(UIL.nset.width)+'px; height:30px; position:relative; left:0px; pointer-events:none; margin-bottom:1px;'+UIL.txt1);

UIL.createClass('UIL.box', 'position:absolute; left:100px; top:3px; width:14px; height:14px; pointer-events:auto; cursor:pointer; border:2px solid rgba(255,255,255,0.4);');
UIL.createClass('UIL.text', 'position:absolute; width:90px; top:2px; height:16px; pointer-events:none; padding-left:10px; padding-right:5px; padding-top:2px; text-align:Left; overflow:hidden; white-space:nowrap;'+ UIL.txt1);

UIL.createClass('input.UIL.number', 'position:absolute; width:60px; height:16px; pointer-events:auto; margin-top:2px; padding-left:5px; padding-top:2px; background:rgba(0,0,0,0.2);' + UIL.txt2, true);
UIL.createClass('input.UIL.string', 'position:absolute; left:100px; width:170px; height:16px; pointer-events:auto; margin-top:2px; padding-left:4px; padding-top:2px; background:rgba(0,0,0,0.2);' + UIL.txt2, true);

UIL.createClass('UIL.boxbb', 'position:absolute; left:100px; top:3px; width:20px; height:14px; pointer-events:auto; cursor:col-resize; text-align:center; color:#000; font-size:12px; background:rgba(255,255,255,0.6); ');

UIL.createClass('UIL.big', 'position:absolute; width:400px; height:100px; left:-100px; top:-50px; pointer-events:auto; cursor:col-resize; border:1px solid #f00; background:rgba(0,0,0,0);');

UIL.createClass('UIL.Listtxt', 'border:1px solid #333; left:100px; font-size:12px; position:absolute; cursor:pointer; width:170px; height:16px; pointer-events:auto; margin-top:2px; text-align:center;'+UIL.txt1);
UIL.createClass('UIL.Listtxt:hover', 'border:1px solid #AAA;');
UIL.createClass('UIL.list', 'box-sizing:content-box; border:20px solid rgba(0,0,0,0);  border-bottom:10px solid rgba(0,0,0,0); position:absolute; left:80px; top:0px; width:170px; height:80px; overflow:hidden; cursor:s-resize; pointer-events:auto; display:none;');
UIL.createClass('UIL.list-in', 'position:absolute; left:0; top:0; width:170px; pointer-events:none; background:rgba(0,0,0,0.2); ');
UIL.createClass('UIL.listItem', 'position:relative; width:170px; height:16px; background:#020; padding-left:5px; border-bottom:1px solid #333; pointer-events:auto; cursor:pointer;'+UIL.txt1);
UIL.createClass('UIL.listItem:hover', 'background:#050; color:#e2e2e2;')
UIL.createClass('UIL.list-sel', 'position:absolute; right:5px; background:#666; width:10px; height:10px; pointer-events:none; margin-top:5px;');

UIL.createClass('UIL.scroll-bg', 'position:absolute; left:100px; top:2px; cursor:w-resize; pointer-events:auto;');
UIL.createClass('UIL.scroll-sel', 'position:absolute; left:104px; top:6px; pointer-events:none;');

UIL.createClass('UIL.canvas', 'position:absolute; pointer-events:none;');
UIL.createClass('UIL.cc', 'position:absolute; pointer-events:none;');

UIL.createClass('UIL.color-txt', 'position:absolute; width:170px; left:100px; top:3px; height:14px; padding-left:10px; pointer-events:auto; cursor:pointer; border-radius:6px;'+ UIL.txt2 );


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