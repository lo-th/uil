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
        REVISION: '0.5',
        events:[ 'onkeyup', 'onkeydown', 'onclick', 'onchange', 'onmouseover', 'onmouseout', 'onmousemove', 'onmousedown', 'onmouseup', 'onmousewheel' ],
        WIDTH:0,
        BW:0,
        AW:0, 
        svgns:"http://www.w3.org/2000/svg",
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
            UIL.SELECTDOWN = '#024699'
            UIL.txt1 = 'font-family:"Open Sans", sans-serif; font-size:12px; color:#cccccc; outline:none; padding:0px 10px; left:0; top:1px; height:17px; width:'+this.AW+'px; overflow:hidden;';
            UIL.txt2 = UIL.txt1 + 'width:'+UIL.BW+'px; left:'+ this.AW+'px;';
            //UIL.BASIC = 'position:absolute; left:'+this.AW+'px; pointer-events:auto; cursor:pointer; border:solid 1px rgba(0,0,0,0.2);'

            UIL.CC('UIL', 'position:absolute; pointer-events:none; box-sizing:border-box; -o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;');

            UIL.CC('UIL.content', 'width:'+(UIL.WIDTH)+'px; margin-left:0px; overflow:hidden; background:none;');
            UIL.CC('UIL.mask', 'width:'+(UIL.WIDTH+100)+'px; height:100%; margin-left:-50px; pointer-events:auto; cursor:col-resize; background:none; display:none;');
            UIL.CC('UIL.inner', 'width:'+(UIL.WIDTH)+'px; top:0; left:0; height:auto; overflow:hidden; background:none;');

            UIL.CC('UIL.base', 'position:relative; transition: 0.1s ease-out; width:'+(UIL.WIDTH)+'px; height:20px; left:0; background:rgba(40,40,40,0.5); border-bottom:1px solid rgba(0,0,0,0.2); overflow:hidden;');

            UIL.CC('UIL.text', UIL.txt1);
            UIL.CC('UIL.text-t', UIL.txt1+'width:'+(this.WIDTH-50)+'px; top:8px; ');
            UIL.CC('UIL.text-m', UIL.txt1+'left:'+(this.WIDTH-50)+'px; text-align:right; width:40px; padding:0px 5px;');
            UIL.CC('UIL.text-r', UIL.txt2);
            UIL.CC('UIL.itext', 'pointer-events:auto; padding:0px 5px;');

            UIL.CC('input', ' border:solid 1px rgba(0,0,0,0.2); background:rgba(0,0,0,0.2); transition: 0.1s ease-out;'+UIL.txt2, true);
            UIL.CC('input:focus', 'border: solid 1px rgba(0,0,0,0); background:rgba(0,0,0,0.6);', true);

            UIL.CC('UIL.list', 'box-sizing:content-box; border:20px solid transparent; border-bottom:10px solid transparent; left:'+(this.AW-20)+'px; top:0px; width:'+UIL.BW+'px; height:90px; overflow:hidden; cursor:s-resize; pointer-events:auto; display:none;');
            UIL.CC('UIL.list-in', 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2); ');
            UIL.CC('UIL.listItem', 'position:relative; height:18px; background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(0,0,0,0.2); pointer-events:auto; cursor:pointer;'+UIL.txt1);
            UIL.CC('UIL.listItem:hover', 'background:'+UIL.SELECT+'; color:#FFFFFF;')
            UIL.CC('UIL.list-sel', 'width:10px; height:10px; right:5px; background:#666; margin-top:5px;');

            UIL.CC('UIL.scroll-bg', 'cursor:w-resize; pointer-events:auto; background:rgba(256,0,0,0.2);');
            UIL.CC('UIL.svgbox', 'left:'+(this.AW)+'px; top:1px; width:'+(this.BW)+'px; height:17px; top:1px; pointer-events:auto; cursor:pointer; border:solid 1px rgba(90,90,90,0.6);');
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
            return 'rgba('+r+','+g+','+b+','+a+')';
        },
        /*canvasURL:function(obj){
            var canvas = document.createElement( 'canvas' );
            canvas.width = obj.w || 20;
            canvas.height = obj.h || 20;

            var context = canvas.getContext( '2d' );
            context.fillStyle = '#444';
            context.fillRect( 0, 0, 20, 20 );
            return canvas.toDataURL();
        },*/
        setSVG:function(dom, type, value, id){
            dom.childNodes[id || 0].setAttributeNS(null, type, value );
        },
        setDOM:function(dom, type, value){
            dom.style[type] = value+'px';
        },

        DOM:function(cc, type, css, obj, dom){ 
            type = type || 'div';
            if(type=='rect' || type=='path' || type=='polygon' || type=='text'){
                if(dom==undefined){ 
                    dom = document.createElementNS( this.svgns, 'svg' );
                }
                var g = document.createElementNS( this.svgns, type );
                if(type=='text'){ 
                    var textNode = document.createTextNode('YOOOOO');
                    g.appendChild(textNode);
                }
                dom.appendChild(g);
                
                for(var e in obj){
                    //if(e=='width' || e=='height') dom.setAttribute( e, obj[e] );
                    g.setAttribute( e, obj[e] );
                }
                if(cc) dom.setAttribute('class', cc);
            } else {
                if(dom==undefined) dom = document.createElement(type);
                if(cc) dom.className = cc;
            }
            
            if(css) dom.style.cssText = css; 
            return dom;
            //else return g;
        },
        CC:function(name,rules,noAdd){
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


UIL.Gui = function(css, w, center){
    this.isCenter = center || false;
    UIL.sizer(w || 300);
    UIL.classDefine();
    this.uis = [];

    this.lockwheel = false;

    this.content = UIL.DOM('UIL content', 'div', css);
    document.body.appendChild(this.content);

    this.top = parseFloat(this.content.style.top.substring(0,this.content.style.top.length-2));

    this.mask = UIL.DOM('UIL mask', 'div', css);
    document.body.appendChild(this.mask);

    this.inner = UIL.DOM('UIL inner');
    this.content.appendChild(this.inner);
    
    this.scrollBG = UIL.DOM('UIL scroll-bg', 'div', 'right:0; top:0; width:10px; height:100%; cursor:s-resize; display:none; background:none; ');
    this.content.appendChild(this.scrollBG);
    this.scrollBG.name = 'move';

    this.scrollBG2 = UIL.DOM('UIL scroll-bg', 'div', 'left:0; top:0; width:'+UIL.AW+'px; height:100%; cursor:s-resize; display:none; background:none;');
    this.content.appendChild(this.scrollBG2);
    this.scrollBG2.name = 'move';
    
    this.scroll = UIL.DOM(null, 'rect', 'position:absolute; width:100%; height:100%; pointer-events:none;', {width:1, height:20, x:UIL.WIDTH-1, fill:'#666' });
    UIL.DOM(null, 'rect', '', {width:1, height:20, x:0, fill:'#666' }, this.scroll);
    UIL.DOM(null, 'rect', '', {width:300, height:1, x:0, fill:'#666' }, this.scroll);
    this.content.appendChild(this.scroll);  

    UIL.main = this;

    this.changeWidth();

    this.down = false;

    this.f = [];

    // onmousedown
    this.f[0] = function(e){
        if(e.target.name){
            if(e.target.name=='move'){
                this.down = true;
                this.f[1](e);
                UIL.setSVG(this.scroll, 'fill','#FFF');
                UIL.setSVG(this.scroll, 'fill','#FFF',1);
                UIL.setSVG(this.scroll, 'fill','#FFF',2);
                e.preventDefault();
            }
        }
    }.bind(this);

    // mousemove
    this.f[1] = function(e){
        if(!this.down) return;
        var rect = this.content.getBoundingClientRect();
        var y = (e.clientY-rect.top)-(this.zone*0.5);

        if(y<0) y = 0;
        if(y>this.zone) y = this.zone;
        this.py = ((y/this.zone)*this.range);

        this.f[5]();

    }.bind(this);

    // mouseup
    this.f[2] = function(e){
        this.down = false;
        UIL.setSVG(this.scroll, 'fill','#666');
        UIL.setSVG(this.scroll, 'fill','#666',1);
        UIL.setSVG(this.scroll, 'fill','#666',2);
    }.bind(this);

    // over
    this.f[3] = function(e){
        UIL.setSVG(this.scroll, 'fill','#AAA');
        UIL.setSVG(this.scroll, 'fill','#AAA',1);
        UIL.setSVG(this.scroll, 'fill','#AAA',2);
    }.bind(this);

    //onmousewheel
    this.f[4] = function(e){
        if(this.lockwheel) return;
        var delta = 0;
        if(e.wheelDeltaY) delta= -e.wheelDeltaY*0.04;
        else if(e.wheelDelta) delta= -e.wheelDelta*0.2;
        else if(e.detail) delta=e.detail*4.0;
        this.py+=delta;
        if(this.py<0) this.py=0;
        if(this.py>this.range) this.py=this.range;

        this.f[5]();

    }.bind(this);

    //update position
    this.f[5] = function(y){
        if(y !== undefined) this.py = y;
        this.inner.style.top = -this.py+'px';
        var ty = ((this.py*(this.height-this.sh))/this.range) || 0;
        UIL.setSVG(this.scroll, 'y', ty);
        UIL.setSVG(this.scroll, 'y', ty,1);

        if(this.py==0) UIL.setSVG(this.scroll, 'y',0, 2);
        else if(this.py==this.max) UIL.setSVG(this.scroll, 'y',this.height-1, 2);
        else UIL.setSVG(this.scroll, 'y',-1, 2);

    }.bind(this);

    this.content.onmousedown = this.f[0];
    this.content.onmousemove = this.f[1];
    this.content.onmouseout = this.f[2];
    this.content.onmouseup = this.f[2];
    this.content.onmouseover = this.f[3];
    

    window.addEventListener("resize", function(e){this.resize(e)}.bind(this), false );
    this.resize();
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
            case 'button': n = new UIL.Button(obj); break;
            case 'string': n = new UIL.String(obj); break;
            case 'number': n = new UIL.Number(obj); break;
            case 'title':  n = new UIL.Title(obj);  break;
            case 'color':  n = new UIL.Color(obj);  break;
            case 'slide':  n = new UIL.Slide(obj);  break;
            case 'bool':   n = new UIL.Bool(obj);   break;
            case 'list':   n = new UIL.List(obj);   break;
        }
        this.uis.push(n);
        this.calc();
    },
    resize:function(e){
        this.height = window.innerHeight-this.top-5;
        this.content.style.height = this.height+'px';
        this.zone = this.height-40;
        this.calc();
        this.f[5](0);
    },
    remove: function ( n ) { 
        var i = this.uis.indexOf( n ); 
        if ( i !== -1 ) { 
            this.uis[i].clear();
            this.uis.splice( i, 1 ); 
        }
    },
    clear:function(){
        this.f[5](0);
        var i = this.uis.length;
        while(i--){
            this.uis[i].clear();
            this.uis.pop();
        }
        this.uis = [];
        this.calc();
    },
    showScroll:function(h){
        this.min = 0;
        this.max = h-this.height;
        this.range = this.max - this.min;
        this.sh =(this.height-40)-(this.max*100)/(this.height-40);
        if(this.sh<20)this.sh=20;

        UIL.setSVG(this.scroll, 'height',this.sh);
        UIL.setSVG(this.scroll, 'height',this.sh, 1);

        this.scroll.style.display = 'block';
        this.scrollBG.style.display = 'block';
        this.scrollBG2.style.display = 'block';

        this.content.onmousewheel = this.f[4];

        this.f[5](0);
    },
    hideScroll:function(){
        this.f[5](0);
        this.scroll.style.display = 'none';
        this.scrollBG.style.display = 'none';
        this.scrollBG2.style.display = 'none';

        this.content.onmousewheel = null;
    },
    calc:function(){
        var total = 0;
        var i = this.uis.length;
        while(i--) total+=this.uis[i].h;
        if(total>this.height) this.showScroll(total);
        else this.hideScroll();
    },
    changeWidth:function(){
        UIL.setDOM(this.content, 'width', UIL.WIDTH);
        var decal = 0;
        if(this.isCenter){
            decal = -UIL.WIDTH*0.5; 
            UIL.setDOM(this.content, 'margin-left', decal);
        }


        UIL.setDOM(this.mask, 'margin-left', decal-50);
        UIL.setDOM(this.mask, 'width', UIL.WIDTH+100);

        UIL.setDOM(this.inner, 'width', UIL.WIDTH);
        UIL.setSVG(this.scroll, 'x',UIL.WIDTH-1,0);
        UIL.setSVG(this.scroll, 'width',UIL.WIDTH,2);
        var i = this.uis.length;

        while(i--){
            this.uis[i].setSize();
            this.uis[i].rSize();
        }
    }
}






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