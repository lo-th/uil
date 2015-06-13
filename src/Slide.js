UIL.Slide = function(obj){

    UIL.Proto.call( this, obj );

    this.setTypeNumber(obj)

    this.range = this.max - this.min;
    this.width = UIL.BW-40;
    this.w = this.width-8;
    this.height = 17;
    this.value = obj.value || 0;
    this.down = false;

    //this.c[2] = UIL.DOM('UIL text-m');
    this.c[2] = UIL.DOM('UIL text', 'div', 'text-align:right; width:40px; padding:0px 5px;');

    this.c[3] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+this.height+'px; cursor:w-resize;', { width:this.width, height:this.height, fill:UIL.SVGB, 'stroke-width':1, stroke:UIL.SVGC });
    this.c[4] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+this.height+'px; pointer-events:none;', {x:4, y:4, width:this.width-8, height:this.height-8, fill:'#CCC', 'stroke-width':1, stroke:UIL.SVGC });

    // mouseOver
    this.f[0] = function(e){
        this.setSvg(3, 'fill','rgba(0,0,0,0.6)');
        this.setSvg(4, 'fill', UIL.SELECT );
    }.bind(this);

    // mouseOut
    this.f[1] = function(e){
        this.down = false;
        this.setSvg(3, 'fill','rgba(0,0,0,0.2)');
        this.setSvg(4, 'fill','#CCC');
    }.bind(this);

    // mouseUp
    this.f[2] = function(e){
        this.down = false;
    }.bind(this);

    // mouseDown
    this.f[3] = function(e){
        this.down = true;
        this.prev = { x:e.clientX, d:0, v:parseFloat(this.value)};
        this.f[4](e);
    }.bind(this);

    // mouseMove
    this.f[4] = function(e){
        if(this.down){
            e.preventDefault(); 
            var rect = this.c[3].getBoundingClientRect();
            var n = ((((e.clientX-rect.left-4)/this.w)*this.range+this.min)-this.prev.v);
            if(n > this.step || n < this.step){ 
                n = (n/this.step).toFixed(0)*1;
                this.value = this.numValue(this.prev.v+(n*this.step));
                this.f[5](true);
                this.prev.v = this.value;
            }
        }
    }.bind(this);

    // update
    this.f[5] = function(up){
        var ww = (this.w * ((this.value-this.min)/this.range));
        this.setSvg(4, 'width', ww );
        this.c[2].innerHTML = this.value;
        if(up) this.callback(this.value); 
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
    this.width = this.sb-40;
    this.w = this.width-8;
    this.setDom(2, 'left', this.size-50);
    this.setSvg(3, 'width',this.width);
    this.setDom(3, 'left', this.sa);
    this.setDom(3, 'width', this.width);
    this.setDom(4, 'left', this.sa);
    this.setDom(4, 'width', this.width);
    
    this.f[5](false);
};