/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2015
*    @author lo.th / http://lo-th.github.io/labs/
*/

'use strict';

var UIL = UIL || ( function () {
    //var _uis = [];
    return {
        main:null,
        REVISION: '0.3',
        events:[ 'onkeyup', 'onkeydown', 'onclick', 'onchange', 'onmouseover', 'onmouseout', 'onmousemove', 'onmousedown', 'onmouseup' ],
        nset:{
            width:300 , height:262, w:40, h:40, r:10, 
            rc1:'rgba(120,30,60,0.5)', gc1:'rgba(30,120,60,0.5)', bc1:'rgba(30,60,120,0.5)', nc1:'rgba(40,40,40,0.5)',
            rc2:'rgba(120,30,60,0.8)', gc2:'rgba(30,120,60,0.8)', bc2:'rgba(30,60,120,0.8)', nc2:'rgba(40,40,40,0.8)',
        },
        //getAll: function () { return _uis; },
        //removeAll: function () { _uis = []; },
        //add: function ( ui ) { _uis.push( ui ); },
        //remove: function ( ui ) { var i = _uis.indexOf( ui ); if ( i !== -1 ) { _uis.splice( i, 1 ); } },  
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
        canvasURL:function(obj){
            var canvas = document.createElement( 'canvas' );
            canvas.width = obj.w || 20;
            canvas.height = obj.h || 20;

            var context = canvas.getContext( '2d' );
            context.fillStyle = '#444';
            context.fillRect( 0, 0, 20, 20 );
            return canvas.toDataURL();
        },
        setSVG:function(dom, type, value){
            dom.childNodes[0].setAttributeNS(null, type, value );
        },
        element:function(cName, type, css, obj){ 
            type = type || 'div'; 
            var dom = null;
            if(type=='rect' || type=='path' || type=='polygon'){ 
                dom = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
                var g = document.createElementNS( 'http://www.w3.org/2000/svg', type );
                dom.appendChild(g);
                for(var e in obj){
                    if(e=='width' || e=='height')dom.setAttribute( e, obj[e] );
                    g.setAttribute( e, obj[e] );
                }
            } else {
                dom = document.createElement(type);
                if(cName) dom.className = cName;
            }
            
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
        },
        calc:function(){
            var total = 0;
            var i = this.main.uis.length;
            while(i--) total+=this.main.uis[i].h;
            if(total>this.main.height) this.main.showScroll(total);
            else this.main.hideScroll();
        }
    };
})();


UIL.Gui = function(css){
    this.uis = [];
    UIL.main = this;
    this.content = UIL.element('UIL content', 'div', css);
    document.body.appendChild(this.content);

    this.inner = UIL.element('UIL inner');
    this.content.appendChild(this.inner);
    
    this.scrollBG = UIL.element('UIL scroll-bg', 'div', 'position:absolute; right:0; top:0; width:20px; height:100%; cursor:s-resize; display:none; ');
    this.content.appendChild(this.scrollBG);
    this.scrollBG.name = 'move';

    this.scrollBG2 = UIL.element('UIL scroll-bg', 'div', 'position:absolute; left:0; top:0; width:90px; height:100%; cursor:s-resize; display:none;background:none;');
    this.content.appendChild(this.scrollBG2);
    this.scrollBG2.name = 'move';
    
    this.scroll = UIL.element(null, 'rect', 'position:absolute; right:3px; top:6px; pointer-events:none;', {width:12, height:40, fill:'#666' });
    this.scrollBG.appendChild(this.scroll);

    this.down = false;

    this.f = [];

    this.f[0] = function(e){
        if(e.target.name){
            if(e.target.name=='move'){
                this.down = true;
                this.f[1](e);
                this.scrollBG.style.background = 'rgba(0,0,0,0.4)';
                UIL.setSVG(this.scroll, 'fill','#FFF');
                e.preventDefault();
            }
            
        }
    }.bind(this);

    // mousemove
    this.f[1] = function(e){
       if(this.down){
            var rect =this.content.getBoundingClientRect();
            var y = e.clientY-rect.top;
            if(y<20) y = 20;
            if(y>(this.height-20)) y = this.height-20;
            this.py = (((y-20)/(this.height-40))*this.range).toFixed(0);
            this.inner.style.top = -this.py+'px';
            this.scroll.style.top = (y-20)+'px';
        }
    }.bind(this);

    // mouseup
    this.f[2] = function(e){
        this.down = false;
        this.scrollBG.style.background = 'rgba(0,0,0,0.2)';
        UIL.setSVG(this.scroll, 'fill','#666');
    }.bind(this);

    // over
    this.f[3] = function(e){
        this.scrollBG.style.background = 'rgba(0,0,0,0.3)';
        UIL.setSVG(this.scroll, 'fill','#AAA');
    }.bind(this);

    this.content.onmousedown = this.f[0];
    this.content.onmousemove = this.f[1];
    this.content.onmouseout = this.f[2];
    this.content.onmouseup = this.f[2];
    this.content.onmouseover = this.f[3];

    this.height = 0;
    this.top = parseFloat(this.content.style.top.substring(0,this.content.style.top.length-2));
    this.height = window.innerHeight-this.top;

    this.content.style.height = this.height+'px';

    window.addEventListener("resize", function(e){this.resize(e)}.bind(this), false );
}

UIL.Gui.prototype = {
    constructor: UIL.Gui,
    show:function(){
        this.content.style.display = 'block';
    },
    hide:function(){
        this.content.style.display = 'none';
    },
    add:function(type, obj){
        var n;
        switch(type){
            case 'title':  n = new UIL.Title(obj);  break;
            case 'bool':   n = new UIL.Bool(obj);   break;
            case 'color':  n = new UIL.Color(obj);  break;
            case 'number': n = new UIL.Number(obj); break;
            case 'slide':  n = new UIL.Slide(obj);  break;
            case 'string': n = new UIL.String(obj); break;
            case 'list':   n = new UIL.List(obj);   break;
        }
        this.uis.push(n);
        UIL.calc();
    },
    resize:function(e){
        this.height = window.innerHeight-this.top;
        this.inner.style.top = '0px';
        this.scroll.style.top = '0px';
        this.content.style.height = this.height+'px';
        UIL.calc();
    },
    remove: function ( n ) { 
        var i = this.uis.indexOf( n ); 
        if ( i !== -1 ) { 
            this.uis[i].clear();
            this.uis.splice( i, 1 ); 
        }
    },
    clear:function(){
        var i = this.uis.length;
        while(i--){
            this.uis[i].clear();
            this.uis.pop();
        }
        this.uis = [];
        UIL.calc();
    },
    showScroll:function(h){
        console.log(h)
        //this.content.style.pointerEvent = 'auto';
        //this.inner.style.pointerEvent = 'auto';
        this.min = 0;
        this.max = h-this.height;
        this.range = this.max - this.min;
        this.scrollBG.style.display = 'block';
        this.scrollBG2.style.display = 'block';
    },
    hideScroll:function(){
        //this.content.style.pointerEvent = 'none';
        //this.inner.style.pointerEvent = 'none';
        this.scrollBG.style.display = 'none';
        this.scrollBG2.style.display = 'none';
    }
}








UIL.txt1 = 'font-family:Helvetica, Arial, sans-serif; font-size:12px; color:#e2e2e2;';
UIL.txt2 = 'font-family:Monospace; font-size:12px; color:#e2e2e2;';

UIL.createClass('UIL', 'box-sizing:border-box; -o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;');

UIL.createClass('UIL.content', 'position:absolute; width:'+(UIL.nset.width)+'px; pointer-events:none; overflow:hidden; background:none;');
UIL.createClass('UIL.inner', 'position:absolute; width:'+(UIL.nset.width)+'px; top:0; left:0; height:auto; pointer-events:none; overflow:hidden;background:none;');


UIL.createClass('UIL.base', 'width:'+(UIL.nset.width)+'px; height:21px; position:relative; left:0px; pointer-events:none; background:rgba(40,40,40,0.5); border-bottom:1px solid #333;');
//UIL.createClass('UIL.title', 'width:'+(UIL.nset.width)+'px; height:30px; position:relative; left:0px; pointer-events:none; margin-bottom:1px;'+UIL.txt1);

//UIL.createClass('UIL.box', 'position:absolute; left:100px; top:3px; width:14px; height:14px; pointer-events:auto; cursor:pointer; border:2px solid rgba(255,255,255,0.4);');
UIL.createClass('UIL.text', 'position:absolute; width:90px; top:2px; height:16px; pointer-events:none; padding-left:10px; padding-right:5px; padding-top:2px; text-align:Left; overflow:hidden; white-space:nowrap;'+ UIL.txt1);

UIL.createClass('input.UIL.number', 'position:absolute; width:60px; height:16px; pointer-events:auto; margin-top:2px; padding-left:5px; padding-top:2px; background:rgba(0,0,0,0.2);' + UIL.txt2, true);
UIL.createClass('input.UIL.string', 'position:absolute; left:100px; width:170px; height:16px; pointer-events:auto; margin-top:2px; padding-left:4px; padding-top:2px; background:rgba(0,0,0,0.2);' + UIL.txt2, true);

UIL.createClass('UIL.boxbb', 'position:absolute; left:100px; top:3px; width:20px; height:14px; pointer-events:auto; cursor:col-resize; text-align:center; color:#000; font-size:12px; background:rgba(255,255,255,0.6); ');

//UIL.createClass('UIL.big', 'position:absolute; width:400px; height:100px; left:-100px; top:-50px; pointer-events:auto; cursor:col-resize; background:rgba(255,0,0,0);');

UIL.createClass('UIL.Listtxt', 'border:1px solid #333; left:100px; font-size:12px; position:absolute; cursor:pointer; width:170px; height:16px; pointer-events:auto; margin-top:2px; text-align:center;'+UIL.txt1);
UIL.createClass('UIL.Listtxt:hover', 'border:1px solid #AAA;');
UIL.createClass('UIL.list', 'box-sizing:content-box; border:20px solid rgba(0,0,0,0);  border-bottom:10px solid rgba(0,0,0,0); position:absolute; left:80px; top:0px; width:170px; height:80px; overflow:hidden; cursor:s-resize; pointer-events:auto; display:none;');
UIL.createClass('UIL.list-in', 'position:absolute; left:0; top:0; width:170px; pointer-events:none; background:rgba(0,0,0,0.2); ');
UIL.createClass('UIL.listItem', 'position:relative; width:170px; height:16px; background:#020; padding-left:5px; border-bottom:1px solid #333; pointer-events:auto; cursor:pointer;'+UIL.txt1);
UIL.createClass('UIL.listItem:hover', 'background:#050; color:#e2e2e2;')
UIL.createClass('UIL.list-sel', 'position:absolute; right:5px; background:#666; width:10px; height:10px; pointer-events:none; margin-top:5px;');

UIL.createClass('UIL.scroll-bg', 'position:absolute;  cursor:w-resize; pointer-events:auto; background:rgba(0,0,0,0.2);');
//UIL.createClass('UIL.scroll-sel', 'position:absolute; left:104px; top:6px; pointer-events:none;');

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