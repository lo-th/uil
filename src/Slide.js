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