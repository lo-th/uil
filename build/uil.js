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
            if(this.uis[i].rSize) this.uis[i].rSize();
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

UIL.Group = function(){

}
UIL.Group.prototype = {
    constructor: UIL.Group,
    clear:function(){

    }
}
UIL.Proto = function(obj){

    obj = obj || {};

    this.h = 20;
    if(obj.color) UIL.COLOR = obj.color;
    this.color = UIL.COLOR;

    this.txt = obj.name || 'Proto';
    this.target = obj.target || null;
    this.callback = obj.callback || function(){};

    this.c = [];
    this.f = [];

    this.c[0] = UIL.DOM('UIL base');

    this.c[1] = UIL.DOM('UIL text');
    this.c[1].innerHTML = this.txt;
}

UIL.Proto.prototype = {
    constructor: UIL.Proto,

    init:function(){
        this.c[0].style.background = UIL.bgcolor(this.color);
        for(var i = 0; i<this.c.length; i++){
            if(i==0){ 
                if(this.target!==null) this.target.appendChild(this.c[0]);
                else UIL.main.inner.appendChild(this.c[0]);
            }
            else this.c[0].appendChild(this.c[i]);
        }
    },
    clear:function(){
        var ev = UIL.events;
        var i = this.c.length, j;
        while(i--){
            if(i==0){ 
                if(this.target!==null) this.target.removeChild(this.c[0]);
                else UIL.main.inner.removeChild(this.c[0]);
            } else {
                j = ev.length;
                while(j--){ if(this.c[i][ev[j]]!==null) this.c[i][ev[j]] = null; }
                this.c[0].removeChild(this.c[i]);
            }
            this.c[i] = null;
        }

        this.c = null;
        if(this.f){
            i = this.f.length;
            while(i--) this.f[i] = null;
            this.f = null
        }
        if(this.callback)this.callback = null;
        if(this.value)this.value = null;
    },
    setTypeNumber:function( obj ){
        
        this.min = -Infinity;
        this.max = Infinity;

        this.precision = 2;
        if(obj.precision !== undefined ) this.precision = obj.precision;
        //this.prev = null;
        this.step = 0.01;
        switch(this.precision){
            case 0:  this.step = 1; break;
            case 1:  this.step = 0.1; break;
            case 2:  this.step = 0.01; break;
            case 3:  this.step = 0.001; break;
            case 4:  this.step = 0.0001; break;
        }

        if(obj.min !== undefined ) this.min = obj.min;
        if(obj.max !== undefined ) this.max = obj.max;
        if(obj.step !== undefined ) this.step = obj.step;
        
    },
    numValue:function(n){
        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision )*1;
    },
    rSize:function(){
        this.c[0].style.width = UIL.WIDTH+'px';
        this.c[1].style.width = UIL.AW+'px';
    }
}
UIL.Title = function(obj){
    
    UIL.Proto.call( this, obj );

    this.h = 31;
    this.color = obj.prefix || 'N';

    var id = obj.id || 0;
    var prefix = obj.prefix || '';

    this.c[0].style.height = this.h+'px';
    this.c[1].className = 'UIL text-t';
    //this.c[1].style.width = UIL.WIDTH-50 + 'px';
    //this.c[1].style.top = '8px';
    this.c[2] = UIL.DOM('UIL text-m', 'div', 'top:8px;');

    var idt = id || 0;
    if(id<10) idt = '0'+id;

    this.c[1].innerHTML = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
    this.c[2].innerHTML = prefix.toUpperCase()+' '+idt;

    this.init();
}


UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;


UIL.Title.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    UIL.setDOM(this.c[1], 'width', UIL.WIDTH-50);
    UIL.setDOM(this.c[2], 'left', UIL.WIDTH-50);
};
UIL.String = function(obj){

    UIL.Proto.call( this, obj );

    this.value = obj.value || '';

    this.c[2] = UIL.DOM('UIL itext', 'input' );

    this.f[0] = function(e){
        if (!e) e = window.event;
        if ( e.keyCode === 13 ){ 
            this.callback( e.target.value );
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.c[2].value = this.value;
    this.c[2].onkeydown = this.f[0];

    this.init();
}

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;

UIL.String.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    UIL.setDOM(this.c[2], 'width', UIL.BW);
    UIL.setDOM(this.c[2], 'left', UIL.AW);
}
UIL.Number = function(obj){

    UIL.Proto.call( this, obj );

    this.setTypeNumber(obj);

    this.value = [0];
    this.toRad = 1;
    this.isNumber = true;
    this.isAngle = false;
    this.isVector = false;
    this.mask = UIL.main.mask;

    if(obj.value){
        if(!isNaN(obj.value)){ this.value = [obj.value];}
        else if(obj.value instanceof Array){ this.value = obj.value; this.isNumber=false;}
        else if(obj.value instanceof Object){ 
            this.value = [];
            if(obj.value.x) this.value[0] = obj.value.x;
            if(obj.value.y) this.value[1] = obj.value.y;
            if(obj.value.z) this.value[2] = obj.value.z;
            if(obj.value.w) this.value[3] = obj.value.w;
            this.isVector=true;
        }
    }

    this.length = this.value.length;

    if(obj.isAngle){
        this.isAngle = true;
        this.toRad = Math.PI/180;
    }

    this.w = ((UIL.BW+5)/(this.length))-5;
    this.current = null;

    var i = this.length;
    while(i--){
        if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
        this.c[2+i] = UIL.DOM('UIL itext', 'input', 'width:'+this.w+'px; left:'+(UIL.AW+(this.w*i)+(5*i))+'px;');
        this.c[2+i].name = i;
        this.c[2+i].value = this.value[i];
    }

    // key
    this.f[0] = function(e){
        if (!e) e = window.event;
        e.stopPropagation();
        if ( e.keyCode === 13 ){
            this.current = parseFloat(e.target.name);
            this.f[4](this.current);
            this.f[5]();
            e.target.blur();
        }
    }.bind(this);

    // mouseDown
    this.f[1] = function(e){
        if (!e) e = window.event;
        this.current = parseFloat(e.target.name);
        if(this.current == undefined) return;
        e.preventDefault();
        this.prev = { x:e.clientX, y:e.clientY, d:0, id:(this.current+2)};
        if(this.isNumber) this.prev.v = parseFloat(this.value);
        else this.prev.v = parseFloat(this.value[this.current]);

        this.mask.style.display = 'block';
        this.mask.onmousemove = this.f[2];
        this.mask.onmouseup = this.f[3];
        this.mask.onmouseout = this.f[3];

    }.bind(this);

    // mouseMove
    this.f[2] = function(e){
        if (!e) e = window.event;
        this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );
        var n = this.prev.v + ( this.prev.d * this.step);

        this.value[this.current] = this.numValue(n);
        this.c[this.prev.id].value = this.value[this.current];

        this.f[5]();

        this.prev.x = e.clientX;
        this.prev.y = e.clientY;
    }.bind(this);

    // mouseUp, mouseOut
    this.f[3] = function(e){
        if (!e) e = window.event;

        this.mask.style.display = 'none';
        this.mask.onmousemove = null;
        this.mask.onmouseup = null;
        this.mask.onmouseout = null;

        if ( Math.abs( this.prev.d ) < 2 ) {
            this.c[this.prev.id].focus();
            this.c[this.prev.id].select();
        }
    }.bind(this);

    // test value
    this.f[4] = function(n){
        if(!isNaN(this.c[2+n].value)) this.value[n] = this.c[2+n].value;
        else this.c[2+n].value = this.value[n];
    }.bind(this);

    // export
    this.f[5] = function(){
        var ar = [];
        var i = this.length;
        while(i--) ar[i]=this.value[i]*this.toRad;

        if(this.isNumber) this.callback( ar[0] );
        else this.callback( ar );

    }.bind(this);

    for(i=0; i<this.length; i++){
        this.c[2+i].onkeydown = this.f[0];
        this.c[2+i].onmousedown = this.f[1];
    }

    this.init();
}

UIL.Number.prototype = Object.create( UIL.Proto.prototype );
UIL.Number.prototype.constructor = UIL.Number;

UIL.Number.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.w = ((UIL.BW+5)/(this.length))-5;
    var i = this.length;
    while(i--){
        this.c[2+i].style.width = this.w+'px';
        this.c[2+i].style.left = (UIL.AW+(this.w*i)+(5*i))+'px';
    }
}
UIL.Color = function(obj){
    
    UIL.Proto.call( this, obj );

    this.type = obj.type || 'array';
    this.width = UIL.BW;
    this.oldWidth = 0;
   
    this.wheelWidth = this.width*0.1;
    this.decal = 22;
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    this.c[2] = UIL.DOM('UIL svgbox', 'rect', '',  { width:UIL.BW, height:15, fill:'#000' });
    this.c[3] = UIL.DOM('UIL text-r');
    
    this.c[4] = UIL.DOM('UIL', 'rect', 'left:'+ UIL.AW+'px;  top:'+this.decal+'px; width:'+this.width+'px; height:'+this.width+'px;',  {x:(this.mid - this.square), y:(this.mid - this.square), width:(this.square * 2 - 1), height:(this.square * 2 - 1), fill:'#000' });
    this.c[5] = UIL.DOM('UIL', 'canvas', 'left:'+ UIL.AW+'px;  top:'+this.decal+'px;  display:none;');
    this.c[6] = UIL.DOM('UIL', 'canvas', 'left:'+ UIL.AW+'px;  top:'+this.decal+'px;  pointer-events:auto; cursor:pointer; display:none;');

    this.c[5].width = this.c[5].height = this.width;
    this.c[6].width = this.c[6].height = this.width;

    this.ctxMask = this.c[5].getContext('2d');
    this.ctxOverlay = this.c[6].getContext('2d');
    this.ctxMask.translate(this.mid, this.mid);
    this.ctxOverlay.translate(this.mid, this.mid);

    //this.drawCircle();
    //this.drawMask();

    this.hsl = null;
    this.value = '#ffffff';
    if(obj.value){
        if(obj.value instanceof Array) this.value = UIL.pack(obj.value);
        else if(!isNaN(obj.value)) this.value = UIL.numFormat(obj.value);
        else this.value = obj.value;
    }
    this.bcolor = null;
    this.down = false;
    this.isShow = false;

    // click
    this.f[0] = function(e){
        if(!this.isShow)this.f[5]();
        else this.f[4]();
    }.bind(this);

    // mouseDown
    this.f[1] = function(e){
        if(!this.down){
            this.down = true;
            this.c[6].onmousemove = this.f[2];
            this.c[6].onmouseup = this.f[3];
        }
        this.offset = this.c[6].getBoundingClientRect();
        var pos = this.widgetCoords(e);
        this.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) > (this.square + 2);
        this.f[2](e);
        return false;
    }.bind(this);

    //mouseMove
    this.f[2] = function(e){
        var pos = this.widgetCoords(e);
        if (this.circleDrag) {
            var hue = Math.atan2(pos.x, -pos.y) / 6.28;
            this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);
        } else {
            var sat = Math.max(0, Math.min(1, -(pos.x / this.square * 0.5) + .5));
            var lum = Math.max(0, Math.min(1, -(pos.y / this.square * 0.5) + .5));
            this.setHSL([this.hsl[0], sat, lum]);
        }
        return false;
    }.bind(this);

    //mouseUp
    this.f[3] = function(e){
        this.c[6].onmouseup = null;
        this.c[6].onmousemove = null;
        
        this.down = false;
    }.bind(this);

    //hide
    this.f[4] = function(){
        this.isShow = false;
        this.h = 20;
        this.c[0].style.height = this.h+'px';
        this.c[4].style.display = 'none';
        this.c[5].style.display = 'none';
        this.c[6].style.display = 'none';
        this.c[6].onmousedown = null;
        this.c[6].onmouseout = null;
        UIL.main.calc();
    }.bind(this);

    //show
    this.f[5] = function(){
        if(this.oldWidth!==this.width) this.f[6]();
        this.isShow = true;
        this.h = this.width+30;// 194;
        this.c[0].style.height = this.h+'px';
        this.c[4].style.display = 'block';
        this.c[5].style.display = 'block';
        this.c[6].style.display = 'block';
        this.c[6].onmousedown = this.f[1];
        this.c[6].onmouseout = this.f[4];
        UIL.main.calc();
    }.bind(this);

    // redraw
    this.f[6] = function(){
        this.oldWidth = this.width;
        this.drawCircle();
        this.drawMask();
    }.bind(this);

    this.c[2].onclick = this.f[0];
    this.setColor(this.value);

    this.init();
}

UIL.Color.prototype = Object.create( UIL.Proto.prototype );
UIL.Color.prototype.constructor = UIL.Color;

UIL.Color.prototype.updateDisplay = function(){
    this.invert = (this.rgb[0] * 0.3 + this.rgb[1] * .59 + this.rgb[2] * .11) <= 0.6;
    //this.c[4].style.background = UIL.pack(UIL.HSLToRGB([this.hsl[0], 1, 0.5]));

    UIL.setSVG(this.c[4], 'fill',UIL.pack(UIL.HSLToRGB([this.hsl[0], 1, 0.5])));
    this.drawMarkers();
    
    this.value = this.bcolor;
    UIL.setSVG(this.c[2], 'fill', this.bcolor);
    //UIL.setSVG(this.c[4], 'fill',this.bcolor);
    this.c[3].innerHTML = UIL.hexFormat(this.value);

    
    var cc = this.invert ? '#fff' : '#000';
    
    this.c[3].style.color = cc;

    if(this.type=='array')this.callback( this.rgb );
    if(this.type=='html')this.callback( this.value );
};
UIL.Color.prototype.setColor = function(color){
    var unpack = UIL.unpack(color);
    if (this.bcolor != color && unpack) {
        this.bcolor = color;
        this.rgb = unpack;
        this.hsl = UIL.RGBtoHSL(this.rgb);
        this.updateDisplay();
    }
    return this;
};
UIL.Color.prototype.setHSL = function(hsl){
    this.hsl = hsl;
    this.rgb = UIL.HSLToRGB(hsl);
    this.bcolor = UIL.pack(this.rgb);
    this.updateDisplay();
    return this;
};
UIL.Color.prototype.calculateMask = function(sizex, sizey, outputPixel){
    var isx = 1 / sizex, isy = 1 / sizey;
    for (var y = 0; y <= sizey; ++y) {
        var l = 1 - y * isy;
        for (var x = 0; x <= sizex; ++x) {
            var s = 1 - x * isx;
            var a = 1 - 2 * Math.min(l * s, (1 - l) * s);
            var c = (a > 0) ? ((2 * l - 1 + a) * .5 / a) : 0;
            outputPixel(x, y, c, a);
        }
    }
};
UIL.Color.prototype.drawMask = function(){
    var size = this.square * 2, sq = this.square;
    var sz = Math.floor(size / 2);
    var buffer = document.createElement('canvas');
    buffer.width = buffer.height = sz + 1;
    var ctx = buffer.getContext('2d');
    var frame = ctx.getImageData(0, 0, sz + 1, sz + 1);

    var i = 0;
    this.calculateMask(sz, sz, function (x, y, c, a) {
        frame.data[i++] = frame.data[i++] = frame.data[i++] = c * 255;
        frame.data[i++] = a * 255;
    });

    ctx.putImageData(frame, 0, 0);
    this.ctxMask.drawImage(buffer, 0, 0, sz + 1, sz + 1, -sq, -sq, sq * 2, sq * 2);
};
UIL.Color.prototype.drawCircle = function(){
    var n = 24,r = this.radius, w = this.wheelWidth, nudge = 8 / r / n * Math.PI, m = this.ctxMask, a1 = 0, color1, d1;
    var ym, am, tan, xm, color2, d2, a2, ar;
    m.save();
    m.lineWidth = w / r;
    m.scale(r, r);
    for (var i = 0; i <= n; ++i) {
        d2 = i / n;
        a2 = d2 * Math.PI * 2;
        ar = [Math.sin(a1), -Math.cos(a1), Math.sin(a2), -Math.cos(a2)];
        am = (a1 + a2) * 0.5;
        tan = 1 / Math.cos((a2 - a1) * 0.5);
        xm = Math.sin(am) * tan, ym = -Math.cos(am) * tan;
        color2 = UIL.pack(UIL.HSLToRGB([d2, 1, 0.5]));
        if (i > 0) {
            var grad = m.createLinearGradient(ar[0], ar[1], ar[2], ar[3]);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            m.strokeStyle = grad;
            m.beginPath();
            m.moveTo(ar[0], ar[1]);
            m.quadraticCurveTo(xm, ym, ar[2], ar[3]);
            m.stroke();
        }
        a1 = a2 - nudge; 
        color1 = color2;
        d1 = d2;
    }
    m.restore();
};
UIL.Color.prototype.drawMarkers = function(){
    var m=this.markerSize, ra=this.radius, sz = this.width, lw = Math.ceil(m/ 4), r = m - lw + 1, c1 = this.invert ? '#fff' : '#000', c2 = this.invert ? '#000' : '#fff';
    var angle = this.hsl[0] * 6.28;
    var ar = [Math.sin(angle) * ra, -Math.cos(angle) * ra, 2 * this.square * (.5 - this.hsl[1]), 2 * this.square * (.5 - this.hsl[2]) ];
  
    var circles = [
        { x: ar[2], y: ar[3], r: m, c: c1,     lw: lw },
        { x: ar[2], y: ar[3], r: r, c: c2,     lw: lw + 1 },
        { x: ar[0], y: ar[1], r: m, c: '#fff', lw: lw },
        { x: ar[0], y: ar[1], r: r, c: '#000', lw: lw + 1 },
    ];
    this.ctxOverlay.clearRect(-this.mid, -this.mid, sz, sz);
    var i = circles.length;
    while(i--){
        var c = circles[i];
        this.ctxOverlay.lineWidth = c.lw;
        this.ctxOverlay.strokeStyle = c.c;
        this.ctxOverlay.beginPath();
        this.ctxOverlay.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
        this.ctxOverlay.stroke();
    }
};
UIL.Color.prototype.widgetCoords = function(e){
    return { x: e.pageX - this.offset.left - this.mid, y: e.pageY - this.offset.top - this.mid };
};
UIL.Color.prototype.clear = function(){
    if(this.isShow) this.f[4]();
    UIL.Proto.prototype.clear.call( this );
};

UIL.Color.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.width = UIL.BW;
    this.wheelWidth = this.width*0.1;
    this.decal = 22;
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    UIL.setSVG(this.c[2], 'width',UIL.BW);
    UIL.setDOM(this.c[2], 'width', UIL.BW);
    UIL.setDOM(this.c[2], 'left', UIL.AW);
    UIL.setDOM(this.c[3], 'width', UIL.BW);
    UIL.setDOM(this.c[3], 'left', UIL.AW);

    UIL.setDOM(this.c[4], 'left', UIL.AW);
    UIL.setDOM(this.c[4], 'width', this.width);
    UIL.setDOM(this.c[4], 'height', this.width);
    UIL.setDOM(this.c[5], 'left', UIL.AW);
    UIL.setDOM(this.c[6], 'left', UIL.AW);

    UIL.setSVG(this.c[4], 'width',this.square * 2 - 1);
    UIL.setSVG(this.c[4], 'height',this.square * 2 - 1);
    UIL.setSVG(this.c[4], 'x',this.mid - this.square);
    UIL.setSVG(this.c[4], 'y',this.mid - this.square);

    this.c[5].width = this.c[5].height = this.width;
    this.c[6].width = this.c[6].height = this.width;

    this.c[5].style.left = UIL.AW+'px';
    this.c[6].style.left = UIL.AW+'px';
    this.c[5].style.top = this.decal+'px';
    this.c[6].style.top = this.decal+'px';

    this.ctxMask.translate(this.mid, this.mid);
    this.ctxOverlay.translate(this.mid, this.mid);

    //this.drawCircle();
    //this.drawMask();
};

//-----------------------------------------
// COLOR FUNCTION

UIL.numFormat = function(v){ return "#"+v.toString(16); };
UIL.hexFormat = function(v){ return v.toUpperCase().replace("#", "0x"); };

UIL.pack = function(rgb){
    var r = Math.round(rgb[0] * 255);
    var g = Math.round(rgb[1] * 255);
    var b = Math.round(rgb[2] * 255);
    return '#' + UIL.dec2hex(r) + UIL.dec2hex(g) + UIL.dec2hex(b);
};
UIL.u255 = function(color, i){
    return parseInt(color.substring(i, i + 2), 16) / 255;
};
UIL.u16 = function(color, i){
    return parseInt(color.substring(i, i + 1), 16) / 15;
};
UIL.unpack = function(color){
    if (color.length == 7) return [ UIL.u255(color, 1), UIL.u255(color, 3), UIL.u255(color, 5) ];
    else if (color.length == 4) return [ UIL.u16(color,1), UIL.u16(color,2), UIL.u16(color,3) ];
};
UIL.packDX = function(c, a){
    return '#' + UIL.dec2hex(a) + UIL.dec2hex(c) + UIL.dec2hex(c) + UIL.dec2hex(c);
};
UIL.dec2hex = function(x){
    return (x < 16 ? '0' : '') + x.toString(16);
};
UIL.HSLToRGB = function(hsl){
    var m1, m2, r, g, b;
    var h = hsl[0], s = hsl[1], l = hsl[2];
    m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
    m1 = l * 2 - m2;
    return [ UIL.HUEtoRGB(m1, m2, h + 0.33333), UIL.HUEtoRGB(m1, m2, h), UIL.HUEtoRGB(m1, m2, h - 0.33333) ];
};
UIL.HUEtoRGB = function(m1, m2, h){
     h = (h + 1) % 1;
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (0.66666 - h) * 6;
    return m1;
};
UIL.RGBtoHSL = function(rgb){
    var r = rgb[0], g = rgb[1], b = rgb[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
    if (l > 0 && l < 1) {
        s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    }
    if (delta > 0) {
        if (max == r && max != g) h += (g - b) / delta;
        if (max == g && max != b) h += (2 + (b - r) / delta);
        if (max == b && max != r) h += (4 + (r - g) / delta);
        h /= 6;
    }
    return [h, s, l];
};
UIL.Slide = function(obj){

    UIL.Proto.call( this, obj );

    //this.min = obj.min || 0;
    //this.max = obj.max || 100;
    //this.precision = obj.precision || 0;

    this.setTypeNumber(obj)

    this.range = this.max - this.min;
    this.width = UIL.BW-40;
    this.w = this.width-8;
    this.height = 17;
    this.value = obj.value || 0;
    this.down = false;

    this.c[2] = UIL.DOM('UIL text-m');
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+this.height+'px; cursor:w-resize;', { width:this.width, height:this.height, fill:'rgba(0,0,0,0.2)' });
    this.c[4] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+this.height+'px; pointer-events:none;', {x:3, y:3, width:this.width-8, height:this.height-8, fill:'#CCC' });
    //

    //this.c[3] = UIL.DOM(null, 'rect', UIL.BASIC + 'top:1px; cursor:w-resize;', {width:this.width-2, height:this.height-2, fill:'rgba(0,0,0,0.2)' });
    //this.c[4] = UIL.DOM(null, 'rect', 'position:absolute; left:'+(UIL.AW+4)+'px; top:5px; pointer-events:none;', {width:this.width-8, height:this.height-8, fill:'#CCC' });

    // mouseOver
    this.f[0] = function(e){
        UIL.setSVG(this.c[3], 'fill','rgba(0,0,0,0.6)');
        UIL.setSVG(this.c[4], 'fill', UIL.SELECT );
        e.preventDefault(); 
    }.bind(this);

    // mouseOut
    this.f[1] = function(e){
        this.down = false;
        UIL.setSVG(this.c[3], 'fill','rgba(0,0,0,0.2)');
        UIL.setSVG(this.c[4], 'fill','#CCC');
        e.preventDefault();
    }.bind(this);

    // mouseUp
    this.f[2] = function(e){
        this.down = false;
        e.preventDefault();
    }.bind(this);

    // mouseDown
    this.f[3] = function(e){
        this.down = true;
        this.prev = { x:e.clientX, d:0, v:parseFloat(this.value)};
        this.f[4](e);
        e.preventDefault();
    }.bind(this);

    // mouseMove
    this.f[4] = function(e){
        if(this.down){
            var rect = this.c[3].getBoundingClientRect();
            //var nv = this.value-(((e.clientX-rect.left)/this.w)*this.range+this.min)//.toFixed(this.precision))*1;
            //var n = this.value + ( nv * this.step);

            //this.prev.d += e.clientX - this.prev.x ;//(e.clientX-rect.left)/this.w;
            //var n = this.prev.v + ( this.prev.d * this.step);

           // var n = ((((((e.clientX-rect.left-4)/this.w)*this.range+this.min).toFixed(this.precision))*1)-this.prev.v);
            var n = ((((e.clientX-rect.left-4)/this.w)*this.range+this.min)-this.prev.v);
            if(n > this.step || n < this.step){ 
                n = (n/this.step).toFixed(0)*1;
                this.value = this.numValue(this.prev.v+(n*this.step));
                this.f[5](true);
                this.prev.v = this.value;
            }
            //this.value = ((((e.clientX-rect.left)/this.w)*this.range+this.min).toFixed(this.precision))*1;
            //if(this.value<this.min) this.value = this.min;
            //if(this.value>this.max) this.value = this.max;

            //this.value = this.numValue(n);
            //this.f[5](true);

            //this.prev.x = e.clientX;
        }
        e.preventDefault(); 
    }.bind(this);

    // update
    this.f[5] = function(up){
        var ww = (this.w * ((this.value-this.min)/this.range));
        UIL.setSVG(this.c[4], 'width', ww );
        this.c[2].innerHTML = this.value;
        if(up)this.callback(this.value); 
    }.bind(this);

    this.c[3].onmouseover = this.f[0];
    this.c[3].onmouseout = this.f[1];
    this.c[3].onmouseup = this.f[2];
    this.c[3].onmousedown = this.f[3];
    this.c[3].onmousemove = this.f[4];
    this.f[5](false);

    this.init();
};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;

UIL.Slide.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.width = UIL.BW-40;
    this.w = this.width-8;
    UIL.setDOM(this.c[2], 'left', UIL.WIDTH-50);
    UIL.setSVG(this.c[3], 'width',this.width);
    UIL.setDOM(this.c[3], 'left', UIL.AW);
    UIL.setDOM(this.c[3], 'width', this.width);
    UIL.setDOM(this.c[4], 'left', UIL.AW);
    UIL.setDOM(this.c[4], 'width', this.width);
    
    this.f[5](false);
};
UIL.List = function(obj){

    UIL.Proto.call( this, obj );

    this.c[2] = UIL.DOM('UIL list');
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', '', {width:UIL.BW, height:15, fill:UIL.bgcolor(UIL.COLOR) });
    //this.c[4] = UIL.DOM('UIL', 'path', '',{x:160, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' }, this.c[3] );
    this.c[4] = UIL.DOM('UIL', 'path','position:absolute; width:16px; left:'+(UIL.AW+UIL.BW-17)+'px; top:1px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' } );
    this.c[5] = UIL.DOM('UIL text-r', 'div', 'text-align:center;');


    this.list = obj.list || [];
    if(obj.value){
        if(!isNaN(obj.value)) this.value = this.list[obj.value];
        else this.value = obj.value;
    }else{
        this.value = this.list[0];
    }
    
    this.show = false;
    this.length = this.list.length;
    this.max = this.length*18;
    this.w = UIL.BW;
    this.down = false;
    this.range = this.max - 90;
    this.py = 0;
    this.scroll = false;

    if(this.max>90){ 
        this.w = UIL.BW-20;
        this.scroll = true;
    }

    this.listIn = UIL.DOM('UIL list-in');
    this.listsel = UIL.DOM('UIL list-sel');
    this.listIn.name = 'list';
    this.listsel.name = 'list';
    this.c[2].appendChild(this.listIn);
    this.c[2].appendChild(this.listsel);

    // populate list
    var item, n, l = UIL.BW;
    for(var i=0; i<this.length; i++){
        n = this.list[i];
        item = UIL.DOM('UIL listItem', 'div', 'width:'+this.w+'px; height:18px;');
        item.innerHTML = n;
        item.name = n;
        this.listIn.appendChild(item);
    }

    this.c[5].innerHTML = this.value;
    this.c[2].name = 'list';

    // click top
    this.f[0] = function(e){
        if(this.show) this.f[1]();
        else this.f[2]();
    }.bind(this);

    // close
    this.f[1] = function(e){
        this.show = false;
        this.h = 20;
        this.c[0].style.height = this.h+'px';
        this.c[2].style.display = 'none';
        UIL.setSVG(this.c[4], 'd','M 6 4 L 10 8 6 12');
        UIL.main.calc();
    }.bind(this);

    // open
    this.f[2] = function(e){
        this.f[8](0);
        this.show = true;
        this.h = 120;
        if(!this.scroll){
            this.h = 30+this.max;
            this.listsel.style.display = 'none';
            this.c[2].onmousemove = null;
            this.c[2].onmousewheel = null; 
        }
        this.c[0].style.height = this.h+'px';
        this.c[2].style.display = 'block';
        UIL.setSVG(this.c[4], 'd','M 12 6 L 8 10 4 6');
        UIL.main.calc();
    }.bind(this);

    // mousedown
    this.f[3] = function(e){
        var name = e.target.name;
        if(name!=='list' && name!==undefined ){
            this.value = e.target.name;
            this.c[5].innerHTML = this.value;
            this.callback(this.value);
            this.f[1]();
        }else if (name=='list'){
            this.down = true;
            this.f[4](e);
            this.listIn.style.background = 'rgba(0,0,0,0.6)';
            this.listsel.style.backgroundColor = '#AAA';
            e.preventDefault();
        }
    }.bind(this);

    // mousemove
    this.f[4] = function(e){
       if(this.down){
            var rect =this.c[2].getBoundingClientRect();
            var y = e.clientY-rect.top;
            if(y<30) y = 30;
            if(y>100) y = 100;
            this.py = (((y-30)/70)*this.range).toFixed(0);
            this.f[8]();
        }
    }.bind(this);

    // mouseout
    this.f[5] = function(e){
        UIL.main.lockwheel = false;
        this.f[6]();
        var name = e.relatedTarget.name;
        if(name==undefined)this.f[1]();
    }.bind(this);

    // mouseup
    this.f[6] = function(e){
        this.down = false;
        this.listIn.style.background = 'rgba(0,0,0,0.2)';
        this.listsel.style.backgroundColor = '#666'
    }.bind(this);

    //onmousewheel
    this.f[7] = function(e){
        UIL.main.lockwheel = true;
        var delta = 0;
        if(e.wheelDeltaY) delta= -e.wheelDeltaY*0.04;
        else if(e.wheelDelta) delta= -e.wheelDelta*0.2;
        else if(e.detail) delta=e.detail*4.0;
        this.py+=delta;
        if(this.py<0) this.py=0;
        if(this.py>this.range) this.py=this.range;
        this.f[8]();
    }.bind(this);

    //update position
    this.f[8] = function(y){
        if(y !== undefined) this.py = y;
        this.listIn.style.top = -this.py+'px';
        this.listsel.style.top = ((this.py*70)/this.range)+'px';
    }.bind(this);

    this.f[9] = function(e){
        this.c[5].style.color = '#FFF';
        UIL.setSVG(this.c[3], 'fill', UIL.SELECT );
    }.bind(this);

    this.f[10] = function(e){
        this.c[5].style.color = '#CCC';
        UIL.setSVG(this.c[3], 'fill', UIL.bgcolor(UIL.COLOR) );
    }.bind(this);

    this.f[11] = function(e){
        this.c[5].style.color = '#CCC';
        UIL.setSVG(this.c[3], 'fill', UIL.SELECTDOWN );
    }.bind(this);

    this.c[3].onclick = this.f[0];
    this.c[2].onmousedown = this.f[3];
    this.c[2].onmousemove = this.f[4];
    this.c[2].onmouseout = this.f[5];
    this.c[2].onmouseup = this.f[6];
    this.c[2].onmousewheel = this.f[7]; 

    this.c[3].onmouseover = this.f[9];
    this.c[3].onmouseout = this.f[10];
    this.c[3].onmouseup = this.f[10];
    this.c[3].onmousedown = this.f[11];

    this.init();
}

UIL.List.prototype = Object.create( UIL.Proto.prototype );
UIL.List.prototype.constructor = UIL.List;
UIL.List.prototype.clear = function(){
   
    while (this.listIn.firstChild) {
       this.listIn.removeChild(this.listIn.firstChild);
    }
    while (this.c[2].firstChild) {
       this.c[2].removeChild(this.c[2].firstChild);
    }
    UIL.Proto.prototype.clear.call( this );
}

UIL.List.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    UIL.setSVG(this.c[3], 'width', UIL.BW);
    UIL.setDOM(this.c[3], 'width', UIL.BW);
    UIL.setDOM(this.c[3], 'left', UIL.AW);

    UIL.setDOM(this.c[4], 'left', UIL.AW+UIL.BW-17);

    UIL.setDOM(this.c[5], 'left', UIL.AW);
    UIL.setDOM(this.c[5], 'width', UIL.BW);

    UIL.setDOM(this.c[2], 'left', UIL.AW-20);
    UIL.setDOM(this.c[2], 'width', UIL.BW);

    this.w = UIL.BW;
    if(this.max>90) this.w = UIL.BW-20;
    for(var i=0; i<this.length; i++){
        UIL.setDOM(this.listIn.children[i], 'width', this.w);
    }
};
UIL.Bool = function(obj){

    UIL.Proto.call( this, obj );

    this.value = obj.value || false;

    //this.c[2] = UIL.DOM('UIL', 'rect', UIL.BASIC+'top:2px; border:solid 1px rgba(90,90,90,0.6);', {width:14, height:14, fill:'rgba(0,0,0,0.2)' });
    this.c[2] = UIL.DOM('UIL svgbox', 'rect', 'width:17px;', {width:15, height:15, fill:'rgba(0,0,0,0.2)' });
    this.c[3] = UIL.DOM('UIL svgbox', 'path','width:17px; pointer-events:none;',{width:16, height:16, d:'M 3 9 L 5 12 13 4', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' });

    if(!this.value) this.c[3].style.display = 'none';

    this.f[0] = function(e){
        if(this.value){
            this.value = false;
            this.c[3].style.display = 'none';
            UIL.setSVG(this.c[2], 'fill','rgba(0,0,0,0.2)');
        } else {
            this.value = true;
            this.c[3].style.display = 'block';
            UIL.setSVG(this.c[2], 'fill','rgba(0,0,0,0.4)');
        }
        this.callback( this.value );
    }.bind(this);

    this.c[2].onclick = this.f[0];

    this.init();
}

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;

UIL.Bool.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    UIL.setDOM(this.c[2], 'left', UIL.AW);
    UIL.setDOM(this.c[3], 'left', UIL.AW);
};
UIL.Button = function(obj){

    UIL.Proto.call( this, obj );

    this.value = obj.value || false;

    //this.c[2] = UIL.DOM('UIL', 'rect', UIL.BASIC+'top:1px; border:solid 1px rgba(90,90,90,0.6);', {width:UIL.BW-2, height:15, fill:UIL.bgcolor(UIL.COLOR) });

    this.c[2] = UIL.DOM('UIL svgbox', 'rect', '', {width:UIL.BW, height:15, fill:UIL.bgcolor(UIL.COLOR) });
    //UIL.DOM('UIL', 'text', UIL.BASIC+'top:1px;', {width:168, height:15, 'font-family':'Open Sans', fill:'#CCC' }, this.c[2]);
    this.c[3] = UIL.DOM('UIL text-r', 'div', 'text-align:center;');

    this.c[1].innerHTML = '';
    this.c[3].innerHTML = this.txt;

    this.f[0] = function(e){
        this.callback( this.value );
    }.bind(this);

    this.f[1] = function(e){
        this.c[3].style.color = '#FFF';
        UIL.setSVG(this.c[2], 'fill', UIL.SELECT );
    }.bind(this);

    this.f[2] = function(e){
        this.c[3].style.color = '#CCC';
        UIL.setSVG(this.c[2], 'fill', UIL.bgcolor(UIL.COLOR) );
    }.bind(this);

    this.f[3] = function(e){
        this.c[3].style.color = '#CCC';
        UIL.setSVG(this.c[2], 'fill', UIL.SELECTDOWN );
    }.bind(this);

    this.c[2].onclick = this.f[0];
    this.c[2].onmouseover = this.f[1];
    this.c[2].onmouseout = this.f[2];
    this.c[2].onmouseup = this.f[1];
    this.c[2].onmousedown = this.f[3];

    this.init();
}

UIL.Button.prototype = Object.create( UIL.Proto.prototype );
UIL.Button.prototype.constructor = UIL.Button;

UIL.Button.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    UIL.setSVG(this.c[2], 'width',UIL.BW);
    UIL.setDOM(this.c[2], 'width', UIL.BW);
    UIL.setDOM(this.c[2], 'left', UIL.AW);
    UIL.setDOM(this.c[3], 'width', UIL.BW);
    UIL.setDOM(this.c[3], 'left', UIL.AW);  
};
