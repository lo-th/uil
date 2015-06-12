UIL.Color = function(obj){
    
    UIL.Proto.call( this, obj );

    this.type = obj.type || 'array';
    this.width = UIL.BW;
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

    this.drawCircle();
    this.drawMask();

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

    this.drawCircle();
    this.drawMask();

    UIL.Proto.prototype.rSize.call( this );
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