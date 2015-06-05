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
        REVISION: '0.1',
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
//UIL.createClass('UIL.title', 'width:'+(UIL.nset.width)+'px; height:30px; position:relative; left:0px; pointer-events:none; margin-bottom:1px;'+UIL.txt1);

UIL.createClass('UIL.box', 'position:absolute; left:100px; top:3px; width:14px; height:14px; pointer-events:auto; cursor:pointer; border:2px solid rgba(255,255,255,0.4);');
UIL.createClass('UIL.text', 'position:absolute; width:90px; top:2px; height:16px; pointer-events:none; padding-left:10px; padding-right:5px; padding-top:2px; text-align:Left; overflow:hidden; white-space:nowrap;'+ UIL.txt1);

UIL.createClass('input.UIL.number', 'position:absolute; width:60px; height:16px; pointer-events:auto; margin-top:2px; padding-left:5px; padding-top:2px; background:rgba(0,0,0,0.2);' + UIL.txt2, true);
UIL.createClass('input.UIL.string', 'position:absolute; left:100px; width:170px; height:16px; pointer-events:auto; margin-top:2px; padding-left:4px; padding-top:2px; background:rgba(0,0,0,0.2);' + UIL.txt2, true);

UIL.createClass('UIL.boxbb', 'position:absolute; left:100px; top:3px; width:20px; height:14px; pointer-events:auto; cursor:col-resize; text-align:center; color:#000; font-size:12px; background:rgba(255,255,255,0.6); ');

UIL.createClass('UIL.big', 'position:absolute; width:400px; height:100px; left:-100px; top:-50px; pointer-events:auto; cursor:col-resize; background:rgba(0,0,0,0);');

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

UIL.Group = function(){

}
UIL.Group.prototype = {
    constructor: UIL.Group,
    clear:function(){

    }
}
UIL.Proto = function(target, name, callback){

    this.color = 'G';

    this.callback = callback || function(){};

    this.c = [];
    this.f = [];

    this.c[0] = target;
    this.c[1] = UIL.element('UIL base');
    if(name!==''){
        this.c[2] = UIL.element('UIL text');
        this.c[2].innerHTML = name;
    }
}

UIL.Proto.prototype = {
    constructor: UIL.Proto,

    init:function(){
        this.c[1].style.background = UIL.bgcolor(this.color);
        for(var i = 0; i<this.c.length; i++){
            if(i==0) this.c[0].appendChild(this.c[1]);
            else if(i>1) this.c[1].appendChild(this.c[i]);
        }
    },

    clear:function(){
        var ev = UIL.events;
        var i = this.c.length, j;
            while(i--){
            if(i>1){ 
                // clear function
                j = ev.length;
                while(j--){ if(this.c[i][ev[j]]!==null) this.c[i][ev[j]] = null; }
                this.c[1].removeChild(this.c[i]);
            }
            else if(i==1) this.c[0].removeChild(this.c[1]);
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
    }

}
UIL.Title = function(target, type, id, prefix ){
    
    UIL.Proto.call( this, target, '', null );

    this.color = prefix || 'N';

    id = id || 0;
    type = type || '';
    prefix = prefix || '';

    //this.c[0] = target;
    //this.c[1] = UIL.element('UIL title', 'div', 'background:'+UIL.bgcolor(prefix)+';' );
    this.c[1].style.height = '30px';
    this.c[2] = UIL.element('UIL text', 'div', 'width:200px; font-size:12px; top:8px;');
    this.c[3] = UIL.element('UIL text', 'div', 'right:25px; text-align:right; font-size:12px; top:8px;');

    var idt = id || 0;
    if(id<10) idt = '0'+id;

    this.c[2].innerHTML = type.replace("-", " ").toUpperCase();
    this.c[3].innerHTML = prefix.toUpperCase()+' '+idt;

    this.init();
}


UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;
UIL.Vector = function(target, name, callback, value ){

    UIL.Proto.call( this, target, name, callback );

    this.value = value || [0,0];


    this.c[3] = UIL.element('UIL number', 'input', 'left:100px;');
    this.c[4] = UIL.element('UIL number', 'input', 'left:170px;');

    this.f[0] = function(e){
        if ( e.keyCode === 13 ){ 
            if(!isNaN(this.c[3].value) && !isNaN(this.c[4].value)){
                this.value = [this.c[3].value, this.c[4].value];
                this.callback( this.value );
            } else {
                this.c[3].value = this.value[0];
                this.c[4].value = this.value[1];
            }
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.c[3].value = this.value[0];
    this.c[4].value = this.value[1];
    this.c[3].onkeydown = this.f[0];
    this.c[4].onkeydown = this.f[0];

    this.init();
}

UIL.Vector.prototype = Object.create( UIL.Proto.prototype );
UIL.Vector.prototype.constructor = UIL.Vector;
UIL.String = function(target, name, callback, value, color ){

    UIL.Proto.call( this, target, name, callback );

    this.color = color || 'G';

    this.c[3] = UIL.element('UIL string', 'input' );

    this.f[0] = function(e){
        if (!e) e = window.event;
        if ( e.keyCode === 13 ){ 
            this.callback( e.target.value );
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.c[3].value = value || '';
    this.c[3].onkeydown = this.f[0];

    this.init();
}

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;
UIL.Number = function(target, name, callback, value, min, max, precision, step, isAngle ){

    UIL.Proto.call( this, target, name, callback );

    this.min = min || 0;//-Infinity;
    this.max = max || Infinity;
    this.precision = precision || 0;
    this.step = step || 1;
    this.prev = null;
    this.shiftKey = false;

    this.value = value || 0;
    this.toRad = 1;
    if(isAngle){ 
        this.value = (value * 180 / Math.PI).toFixed( this.precision );
        this.toRad = Math.PI/180;
    };

    this.c[3] = UIL.element('UIL number', 'input', 'left:100px;');
    this.c[4] = UIL.element('UIL boxbb', 'div', 'left:165px;');
    this.c[5] = UIL.element('UIL big', 'div', 'display:none;');
    
    this.f[0] = function(e){
        if (!e) e = window.event;
        if ( e.keyCode === 13 ){ 
            if(!isNaN(e.target.value)){
                this.value =  Math.min( this.max, Math.max( this.min, e.target.value ) ).toFixed( this.precision ) ;
                this.callback( this.value * this.toRad );
            } else {
                e.target.value = this.value;
            }
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.f[1] = function(e){
        if (!e) e = window.event;
        e.preventDefault();
        this.prev = { x:e.clientX, y:e.clientY, v:parseFloat( this.value ), d:0};
        this.c[5].style.display = 'block';
        this.c[5].onmousemove = this.f[2];
        this.c[5].onmouseup = this.f[3];
        this.c[5].onmouseout = this.f[3];
    }.bind(this);

    this.f[2] = function(e){
        if (!e) e = window.event;
        this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );
        var number = this.prev.v + ( this.prev.d * this.step);
        this.value = Math.min( this.max, Math.max( this.min, number ) ).toFixed( this.precision );
        this.c[3].value = this.value;
        this.callback( this.value * this.toRad );
        this.prev.x = e.clientX;
        this.prev.y = e.clientY;
    }.bind(this);

    this.f[3] = function(e){
        if (!e) e = window.event;
        e.preventDefault();
        this.c[5].style.display = 'none'
        this.c[5].onmousemove = null;
        this.c[5].onmouseup = null;
        this.c[5].onmouseout = null;
    }.bind(this);

    if(isAngle) this.c[2].innerHTML = name+ '°';
    this.c[3].value = this.value;
    this.c[3].onkeydown = this.f[0];
    this.c[4].onmousedown = this.f[1];
    this.c[4].innerHTML ='< >';

    this.init();
}

UIL.Number.prototype = Object.create( UIL.Proto.prototype );
UIL.Number.prototype.constructor = UIL.Number;
UIL.Color = function(target, name, callback, value ){
    
    UIL.Proto.call( this, target, name, callback );

    this.width = 170;
    this.wheelWidth = this.width*0.1;
    this.decalLeft = 100;
    this.decal = 22;
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;
   
    this.c[3] = UIL.element('UIL color-txt');
    this.c[4] = UIL.element('UIL cc', 'div', 'width:'+(this.square * 2 - 1)+'px; ' + 'height:'+(this.square * 2 - 1)+'px; ' + 'left:'+((this.mid - this.square)+this.decalLeft)+'px; '+ 'top:'+((this.mid - this.square)+this.decal)+'px;  display:none;');
    this.c[5] = UIL.element('UIL canvas', 'canvas', 'left:'+this.decalLeft+'px;  top:'+this.decal+'px;  display:none;');
    this.c[6] = UIL.element('UIL canvas', 'canvas', 'left:'+this.decalLeft+'px;  top:'+this.decal+'px;  pointer-events:auto; cursor:pointer; display:none;');

    this.c[5].width = this.c[5].height = this.width;
    this.c[6].width = this.c[6].height = this.width;

    this.ctxMask = this.c[5].getContext('2d');
    this.ctxOverlay = this.c[6].getContext('2d');
    this.ctxMask.translate(this.mid, this.mid);
    this.ctxOverlay.translate(this.mid, this.mid);

    this.drawCircle();
    this.drawMask();

    this.hsl = null;
    this.value = '#ffffff';
    if(value) this.value = this.pack(value);
    this.bcolor = null;
    this.dragging = false;
    this.isShow = false;

    // click
    this.f[0] = function(e){
        if(!this.isShow)this.show();
        else this.hide();
    }.bind(this);

    // mouseDown
    this.f[1] = function(e){
        if(!this.dragging){
            this.dragging = true;
            this.c[6].onmousemove = this.f[2];
            this.c[6].onmouseup = this.f[3];
        }
        this.offset = this.c[5].getBoundingClientRect();
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
        this.dragging = false;
    }.bind(this);


    this.c[3].onclick = this.f[0];

    this.updateValue(this.value);
    this.updateDisplay();

    this.init()
}

UIL.Color.prototype = Object.create( UIL.Proto.prototype );
UIL.Color.prototype.constructor = UIL.Color;

UIL.Color.prototype.updateDisplay = function(){
    this.invert = (this.rgb[0] * 0.3 + this.rgb[1] * .59 + this.rgb[2] * .11) <= 0.6;
    this.c[4].style.background = this.pack(this.HSLToRGB([this.hsl[0], 1, 0.5]));
    this.drawMarkers();
    
    this.value = this.bcolor;
    this.c[3].innerHTML = this.hexFormat(this.value);
    this.c[3].style.background = this.bcolor;
    var cc = this.invert ? '#fff' : '#000';
    this.c[3].style.color = cc;

    this.callback( this.rgb );
};
UIL.Color.prototype.hide = function(){
    this.isShow = false;
    this.c[1].style.height = '20px';
    this.c[4].style.display = 'none';
    this.c[5].style.display = 'none';
    this.c[6].style.display = 'none';
    this.c[6].onmousedown = null;
};
UIL.Color.prototype.show = function(){
    this.isShow = true;
    this.c[1].style.height = '194px';
    this.c[4].style.display = 'block';
    this.c[5].style.display = 'block';
    this.c[6].style.display = 'block';
    this.c[6].onmousedown = this.f[1];
};
UIL.Color.prototype.updateValue = function(e){
    if (this.value && this.value != this.bcolor) {
        this.setColor(this.value);
        this.c[3].innerHTML = this.hexFormat(this.value);
    }
};
UIL.Color.prototype.hexFormat = function(v){
    return v.toUpperCase().replace("#", "0x");
};
UIL.Color.prototype.setColor = function(color){
    var unpack = this.unpack(color);
    if (this.bcolor != color && unpack) {
        this.bcolor = color;
        this.rgb = unpack;
        this.hsl = this.RGBToHSL(this.rgb);
        this.updateDisplay();
    }
    return this;
};
UIL.Color.prototype.setHSL = function(hsl){
    this.hsl = hsl;
    this.rgb = this.HSLToRGB(hsl);
    this.bcolor = this.pack(this.rgb);
    this.updateDisplay();
    return this;
};
UIL.Color.prototype.calculateMask = function(sizex, sizey, outputPixel){
    var isx = 1 / sizex, isy = 1 / sizey;
    for (var y = 0; y <= sizey; ++y) {
        var l = 1 - y * isy;
        for (var x = 0; x <= sizex; ++x) {
            var s = 1 - x * isx;
            // From sat/lum to alpha and color (grayscale)
            var a = 1 - 2 * Math.min(l * s, (1 - l) * s);
            var c = (a > 0) ? ((2 * l - 1 + a) * .5 / a) : 0;
            outputPixel(x, y, c, a);
        }
    }
};
UIL.Color.prototype.drawMask = function(){
    var size = this.square * 2, sq = this.square;
    // Create half-resolution buffer.
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
    var n = 24,r = this.radius, w = this.wheelWidth, nudge = 8 / r / n * Math.PI, m = this.ctxMask, angle1 = 0, color1, d1;
    var x1, x2, y1, y2, ym, am, tan, xm, color2, d2, angle2;
    m.save();
    m.lineWidth = w / r;
    m.scale(r, r);
    // Each segment goes from angle1 to angle2.
    for (var i = 0; i <= n; ++i) {
        d2 = i / n;
        angle2 = d2 * Math.PI * 2;
        // Endpoints
        x1 = Math.sin(angle1);
        y1 = -Math.cos(angle1);
        x2 = Math.sin(angle2);
        y2 = -Math.cos(angle2);
        // Midpoint chosen so that the endpoints are tangent to the circle.
        am = (angle1 + angle2) * 0.5;
        tan = 1 / Math.cos((angle2 - angle1) * 0.5);
        xm = Math.sin(am) * tan, ym = -Math.cos(am) * tan;
        // New color
        color2 = this.pack(this.HSLToRGB([d2, 1, 0.5]));
        if (i > 0) {
            var grad = m.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            m.strokeStyle = grad;
            // Draw quadratic curve segment.
            m.beginPath();
            m.moveTo(x1, y1);
            m.quadraticCurveTo(xm, ym, x2, y2);
            m.stroke();
        }
        // Prevent seams where curves join.
        angle1 = angle2 - nudge; color1 = color2; d1 = d2;
    }
    m.restore();
};
UIL.Color.prototype.drawMarkers = function(){
    var sz = this.width, lw = Math.ceil(this.markerSize / 4), r = this.markerSize - lw + 1;
    var angle = this.hsl[0] * 6.28,
    x1 =  Math.sin(angle) * this.radius,
    y1 = -Math.cos(angle) * this.radius,
    x2 = 2 * this.square * (.5 - this.hsl[1]),
    y2 = 2 * this.square * (.5 - this.hsl[2]),
    c1 = this.invert ? '#fff' : '#000',
    c2 = this.invert ? '#000' : '#fff';
    var circles = [
        { x: x2, y: y2, r: this.markerSize, c: c1,     lw: lw },
        { x: x2, y: y2, r: r,             c: c2,     lw: lw + 1 },
        { x: x1, y: y1, r: this.markerSize, c: '#fff', lw: lw },
        { x: x1, y: y1, r: r,             c: '#000', lw: lw + 1 },
    ];
    // Update the overlay canvas.
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
UIL.Color.prototype.pack = function(rgb){
    var r = Math.round(rgb[0] * 255);
    var g = Math.round(rgb[1] * 255);
    var b = Math.round(rgb[2] * 255);
    return '#' + this.dec2hex(r) + this.dec2hex(g) + this.dec2hex(b);
};
UIL.Color.prototype.u255 = function(color, i){
    return parseInt(color.substring(i, i + 2), 16) / 255;
};
UIL.Color.prototype.u16 = function(color, i){
    return parseInt(color.substring(i, i + 1), 16) / 15;
};
UIL.Color.prototype.unpack = function(color){
    if (color.length == 7) return [ this.u255(color, 1), this.u255(color, 3), this.u255(color, 5) ];
    else if (color.length == 4) return [ this.u16(color,1), this.u16(color,2), this.u16(color,3) ];
};
UIL.Color.prototype.packDX = function(c, a){
    return '#' + this.dec2hex(a) + this.dec2hex(c) + this.dec2hex(c) + this.dec2hex(c);
};
UIL.Color.prototype.dec2hex = function(x){
    return (x < 16 ? '0' : '') + x.toString(16);
};
UIL.Color.prototype.HSLToRGB = function(hsl){
    var m1, m2, r, g, b;
    var h = hsl[0], s = hsl[1], l = hsl[2];
    m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
    m1 = l * 2 - m2;
    return [ this.hueToRGB(m1, m2, h + 0.33333), this.hueToRGB(m1, m2, h), this.hueToRGB(m1, m2, h - 0.33333) ];
};
UIL.Color.prototype.hueToRGB = function(m1, m2, h){
     h = (h + 1) % 1;
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (0.66666 - h) * 6;
    return m1;
};
UIL.Color.prototype.RGBToHSL = function(rgb){
    var r = rgb[0], g = rgb[1], b = rgb[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min,
    h = 0, s = 0, l = (min + max) / 2;
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
UIL.Color.prototype.clear = function(){
    if(this.isShow) this.hide();
    UIL.Proto.prototype.clear.call( this );
};
UIL.Slide = function(target, name, callback, value, min, max, precision){

    UIL.Proto.call( this, target, name, callback );

    this.min = min || 0;
    this.max = max || 100;
    this.precision = precision || 0;
    this.valueRange = this.max - this.min;
    this.callback = callback || function(){}; 
    this.width = 140;
    this.height = 16;
    this.w = this.width-8;
    this.value = value || 0;
    this.down = false;

    this.c[3] = UIL.element('UIL text', 'div', 'right:25px; text-align:right; width:40px;');
    this.c[4] = UIL.element('UIL scroll-bg', 'div', 'height:'+this.height+'px; width:'+this.width+'px; background:rgba(0,0,0,0.2);');
    this.c[5] = UIL.element('UIL scroll-sel', 'div', 'height:'+(this.height-8)+'px; background:#666;');

    this.c[3].innerHTML = this.value;
    this.c[5].style.width = (this.w * ((this.value-this.min)/this.valueRange))+'px';

    // mouseOver
    this.f[0] = function(e){
        this.c[4].style.background = 'rgba(0,0,0,0.6)';
        this.c[5].style.backgroundColor = '#AAA';
        e.preventDefault(); 
    }.bind(this);

    // mouseOut
    this.f[1] = function(e){
        this.down = false;
        this.c[4].style.background = 'rgba(0,0,0,0.2)'; 
        this.c[5].style.background = '#666';
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
        this.f[4](e);
        e.preventDefault(); 
    }.bind(this);

    // mouseMove
    this.f[4] = function(e){
        if(this.down){
            var rect = this.c[4].getBoundingClientRect();
            this.value = ((((e.clientX-rect.left)/this.w)*this.valueRange+this.min).toFixed(this.precision))*1;
            if(this.value<this.min) this.value = this.min;
            if(this.value>this.max) this.value = this.max;
            this.f[5]();
        }
        e.preventDefault(); 
    }.bind(this);

    // update
    this.f[5] = function(e){
        this.c[5].style.width = (this.w * ((this.value-this.min)/this.valueRange))+'px';
        this.c[3].innerHTML = this.value;
        this.callback(this.value); 
    }.bind(this);

    this.c[4].onmouseover = this.f[0];
    this.c[4].onmouseout = this.f[1];
    this.c[4].onmouseup = this.f[2];
    this.c[4].onmousedown = this.f[3];
    this.c[4].onmousemove = this.f[4];

    this.init();
};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;
UIL.List = function(target, name, callback, value, list ){

    UIL.Proto.call( this, target, name, callback );

    this.c[3] = UIL.element('UIL Listtxt', 'div', 'background:'+UIL.bgcolor('G')+';');
    this.c[4] = UIL.element('UIL list');

    if(!isNaN(value)) this.value = list[value];
    else this.value = value;
    this.list = list || [];
    this.show = false;
    this.length = this.list.length;
    this.max = this.length*16;
    this.w = 170;
    this.down = false;
    this.range = this.max - 80;
    this.py = 0;

    if(this.max>80) this.w = 150;

    this.listIn = UIL.element('UIL list-in');
    this.listsel = UIL.element('UIL list-sel');
    this.listIn.name = 'list';
    this.listsel.name = 'list';
    this.c[4].appendChild(this.listIn)
    this.c[4].appendChild(this.listsel)

    // populate list
    var item, n, l = 170;
    for(var i=0; i<this.length; i++){
        n = this.list[i];
        item = UIL.element('UIL listItem', 'div', 'width:'+this.w+'px;');
        item.innerHTML = n;
        item.name = n;
        this.listIn.appendChild(item);
    }

    //this.c[2].innerHTML = name;
    this.c[3].innerHTML = this.value;
    this.c[4].name = 'list';

    // click top
    this.f[0] = function(e){
        if(this.show) this.f[1]();
        else this.f[2]();
    }.bind(this);

    // close
    this.f[1] = function(e){
        this.show = false;
        this.c[1].style.height = '20px';
        this.c[4].style.display = 'none';
    }.bind(this);

    // open
    this.f[2] = function(e){
        this.show = true;
        this.c[1].style.height = '110px';
        this.c[4].style.display = 'block';
    }.bind(this);

    // mousedown
    this.f[3] = function(e){
        var name = e.target.name;
        if(name!=='list' && name!==undefined ){
            this.value = e.target.name;
            this.c[3].innerHTML = this.value;
            this.callback(value);
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
            var rect =this.c[4].getBoundingClientRect();
            var y = e.clientY-rect.top;
            if(y<30) y = 30;
            if(y>90) y = 90;
            this.py = (((y-30)/60)*this.range).toFixed(0);
            this.listIn.style.top = -this.py+'px';
            this.listsel.style.top = (y-30)+'px';
        }
    }.bind(this);

    // mouseout
    this.f[5] = function(e){
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


    this.c[3].onclick = this.f[0];
    this.c[4].onmousedown = this.f[3];
    this.c[4].onmousemove = this.f[4];
    this.c[4].onmouseout = this.f[5];
    this.c[4].onmouseup = this.f[6];

    this.init();
}

UIL.List.prototype = Object.create( UIL.Proto.prototype );
UIL.List.prototype.constructor = UIL.List;
UIL.List.prototype.clear = function(){
   
    while (this.listIn.firstChild) {
       this.listIn.removeChild(this.listIn.firstChild);
    }
    while (this.c[4].firstChild) {
       this.c[4].removeChild(this.c[4].firstChild);
    }
    UIL.Proto.prototype.clear.call( this );
}
UIL.Bool = function(target, name, callback, value ){

    UIL.Proto.call( this, target, name, callback );

    this.value = value || false;

    this.c[3] = UIL.element('UIL box', 'div');

    this.f[0] = function(e){
        if(this.value){
            this.value = false;
            this.c[3].style.background = 'none';
        } else {
            this.value = true;
            this.c[3].style.background = '#FFF';
        }
        this.callback( this.value );
    }.bind(this);

    this.c[3].onclick = this.f[0];

    this.init();
}

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;
