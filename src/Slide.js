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
    this.width = UIL.BW-40;
    this.w = this.width-8;
    UIL.setSVG(this.c[3], 'width',this.width);
    //UIL.setSVG(this.c[4], 'width',this.width);
    UIL.setDOM(this.c[3], 'left', UIL.AW);
    UIL.setDOM(this.c[4], 'left', UIL.AW);
    UIL.setDOM(this.c[3], 'width', this.width);
    UIL.setDOM(this.c[4], 'width', this.width);

    UIL.setDOM(this.c[2], 'left', UIL.WIDTH-50);

    this.f[5](false);

    UIL.Proto.prototype.rSize.call( this );
};