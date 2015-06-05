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