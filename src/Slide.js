UIL.Slide = function(obj){

    UIL.Proto.call( this, obj );

    this.min = obj.min || 0;
    this.max = obj.max || 100;
    this.precision = obj.precision || 0;

    this.valueRange = this.max - this.min;
    this.width = 140;
    this.height = 16;
    this.w = this.width-8;
    this.value = obj.value || 0;
    this.down = false;

    this.c[2] = UIL.element('UIL text', 'div', 'right:25px; text-align:right; width:40px;');
    this.c[3] = UIL.element('UIL scroll-bg', 'div', 'height:'+this.height+'px; width:'+this.width+'px; background:rgba(0,0,0,0.2);');
    //this.c[5] = UIL.element('UIL scroll-sel', 'div', 'height:'+(this.height-8)+'px; background:#666;');
    this.c[4] = UIL.element('UIL scroll-sel', 'rect', 'position:absolute; left:104px; top:6px; pointer-events:none;', {width:this.width-8, height:this.height-8, fill:'#666' });

    //this.c[3].innerHTML = this.value;
    //this.c[5].style.width = (this.w * ((this.value-this.min)/this.valueRange))+'px';

    // mouseOver
    this.f[0] = function(e){
        this.c[3].style.background = 'rgba(0,0,0,0.6)';
        //this.c[5].style.backgroundColor = '#AAA';
        UIL.setSVG(this.c[4], 'fill','#AAA');
        //this.c[5].childNodes[0].setAttributeNS(null, 'fill','#AAA' );
        e.preventDefault(); 
    }.bind(this);

    // mouseOut
    this.f[1] = function(e){
        this.down = false;
        this.c[3].style.background = 'rgba(0,0,0,0.2)'; 
        //this.c[5].style.background = '#666';
        UIL.setSVG(this.c[4], 'fill','#666');

        //this.c[5].childNodes[0].setAttributeNS(null, 'fill','#666' );
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
            var rect = this.c[3].getBoundingClientRect();
            this.value = ((((e.clientX-rect.left)/this.w)*this.valueRange+this.min).toFixed(this.precision))*1;
            if(this.value<this.min) this.value = this.min;
            if(this.value>this.max) this.value = this.max;
            this.f[5](true);
        }
        e.preventDefault(); 
    }.bind(this);

    // update
    this.f[5] = function(up){
        var ww = (this.w * ((this.value-this.min)/this.valueRange));
        //this.c[5].style.width = ww+'px';
        //this.c[5].childNodes[0].setAttributeNS(null, 'width', ww );
        UIL.setSVG(this.c[4], 'width', ww );
        this.c[2].innerHTML = this.value;
        if(up)this.callback(this.value); 
    }.bind(this);

    this.c[3].onmouseover = this.f[0];
    this.c[3].onmouseout = this.f[1];
    this.c[3].onmouseup = this.f[2];
    this.c[3].onmousedown = this.f[3];
    this.c[3].onmousemove = this.f[4];
    this.f[5]();

    this.init();
};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;