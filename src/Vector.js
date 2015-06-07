UIL.Vector = function(target, name, callback, value, min, max, precision, step ){

    UIL.Proto.call( this, target, name, callback );

    this.setTypeNumber(min, max, precision, step);

    this.value = value || [0,0];
    this.length = this.value.length;
    this.w = (175/(this.length))-5;
    this.big = 3+this.length;
    this.current = null;

    for(var i=0; i<this.length; i++){
        this.c[3+i] = UIL.element('UIL number', 'input', 'width:'+this.w+'px; left:'+(100+(this.w*i)+(5*i))+'px;');
        this.c[3+i].name = i;
        this.c[3+i].value = this.value[i];
    }
    //this.c[this.big] = UIL.element('UIL big', 'div', 'display:none;');
    this.c[this.big] = UIL.element(null, 'rect', 'display:none; position:absolute; left:-50px; top:-40px; pointer-events:auto; cursor:col-resize;', {width:400, height:100, fill:'rgba(255,0,0,0)'});

    this.f[0] = function(e){
        if (!e) e = window.event;
        e.stopPropagation();
        if ( e.keyCode === 13 ){
            for(var i=0; i<this.length; i++){
                this.f[4](i);
            }
            this.callback( this.value );
            e.target.blur();
        }
    }.bind(this);

    this.f[1] = function(e){
        if (!e) e = window.event;
        this.current = parseFloat(e.target.name);
        if(this.current == undefined) return;
        e.preventDefault();
        this.prev = { x:e.clientX, y:e.clientY, v:parseFloat( this.value[this.current] ), d:0, id:(this.current+3)};
        this.c[this.big].style.display = 'block';
        this.c[this.big].style.zIndex = 1;
        this.c[this.big].onmousemove = this.f[2];
        this.c[this.big].onmouseup = this.f[3];
        this.c[this.big].onmouseout = this.f[3];
    }.bind(this);

    this.f[2] = function(e){
        if (!e) e = window.event;
        this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );
        var n = this.prev.v + ( this.prev.d * this.step);
        this.value[this.current] = this.numValue(n);
        this.c[this.prev.id].value = this.value[this.current];
        this.callback( this.value );
        this.prev.x = e.clientX;
        this.prev.y = e.clientY;
    }.bind(this);

    this.f[3] = function(e){
        if (!e) e = window.event;
        this.c[this.big].style.display = 'none';
        this.c[this.big].style.zIndex = 0;
        this.c[this.big].onmousemove = null;
        this.c[this.big].onmouseup = null;
        this.c[this.big].onmouseout = null;
        if ( Math.abs( this.prev.d ) < 2 ) {
            this.c[this.prev.id].focus();
            this.c[this.prev.id].select();
        }
    }.bind(this);

    // test value
    this.f[4] = function(n){
         if(!isNaN(this.c[3+n].value)) this.value[n] = this.c[3+n].value;
         else this.c[3+n].value = this.value[n];
    };

    for(var i=0; i<this.length; i++){
        this.c[3+i].onkeydown = this.f[0];
        this.c[3+i].onmousedown = this.f[1];
    }

    this.init();
}

UIL.Vector.prototype = Object.create( UIL.Proto.prototype );
UIL.Vector.prototype.constructor = UIL.Vector;