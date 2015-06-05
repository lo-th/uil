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