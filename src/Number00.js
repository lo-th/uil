UIL.Number = function(obj){

    UIL.Proto.call( this, obj);

    this.setTypeNumber(obj);

    this.value = obj.value || 0;
    this.toRad = 1;
    if(obj.isAngle){ 
        this.value = (obj.value * 180 / Math.PI).toFixed( this.precision );
        this.toRad = Math.PI/180;
    };

    this.c[3] = UIL.element('UIL number', 'input', 'left:100px;');
    //this.c[4] = UIL.element('UIL big', 'div', 'display:none;');

    this.c[4] = UIL.element(null, 'rect', 'display:none; position:absolute; left:-50px; top:-40px; pointer-events:auto;  cursor:col-resize;', {width:400, height:100, fill:'rgba(255,0,0,0)'});

    
    
    this.f[0] = function(e){
        if (!e) e = window.event;
        e.stopPropagation();
        if ( e.keyCode === 13 ){ 
            if(!isNaN(e.target.value)){
                this.value =  this.numValue(e.target.value);
                this.callback( this.value * this.toRad );
            } else {
                e.target.value = this.value;
            }
            e.target.blur();
        }
    }.bind(this);

    this.f[1] = function(e){
        if (!e) e = window.event;
        e.preventDefault();
        this.prev = { x:e.clientX, y:e.clientY, v:parseFloat( this.value ), d:0};
        this.c[4].style.display = 'block';
        this.c[4].style.zIndex = 1;
        this.c[4].onmousemove = this.f[2];
        this.c[4].onmouseup = this.f[3];
        this.c[4].onmouseout = this.f[3];
    }.bind(this);

    this.f[2] = function(e){
        if (!e) e = window.event;
        this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );
        var n = this.prev.v + ( this.prev.d * this.step);
        this.value = this.numValue(n);
        this.c[3].value = this.value;
        this.callback( this.value * this.toRad );
        this.prev.x = e.clientX;
        this.prev.y = e.clientY;
    }.bind(this);

    this.f[3] = function(e){
        if (!e) e = window.event;
        this.c[4].style.display = 'none';
        this.c[4].style.zIndex = 0;
        this.c[4].onmousemove = null;
        this.c[4].onmouseup = null;
        this.c[4].onmouseout = null;
        if ( Math.abs( this.prev.d ) < 2 ) {
            this.c[3].focus();
            this.c[3].select();
        }
    }.bind(this);

    if(obj.isAngle) this.c[2].innerHTML = name+ '°';
    this.c[3].value = this.value;
    this.c[3].onkeydown = this.f[0];
    this.c[3].onmousedown = this.f[1];


    this.init();
}

UIL.Number.prototype = Object.create( UIL.Proto.prototype );
UIL.Number.prototype.constructor = UIL.Number;