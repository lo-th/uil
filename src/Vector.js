UIL.Vector = function(target, name, callback, value, min, max, precision, step ){

    UIL.Proto.call( this, target, name, callback );

    this.min = Number(min) || -Infinity;
    this.max = max || Infinity;
    this.precision = precision || 0;
    this.step = step || 1;
    this.prev = null;

    this.value = value || [0,0];
    this.length = this.value.length;
    this.w = (175/(this.length))-5;

    for(var i=0; i<this.length; i++){
        this.c[3+i] = UIL.element('UIL number', 'input', 'width:'+this.w+'px; left:'+(100+(this.w*i)+(5*i))+'px;');
        this.c[3+i].value = this.value[i];
        this.c[3+i].onkeydown = this.f[0];
    }
    this.c[3+this.length] = UIL.element('UIL big', 'div', 'display:none;');

    this.f[0] = function(e){
        if (!e) e = window.event;
        e.stopPropagation();
        if ( e.keyCode === 13 ){
            for(var i=0; i<this.length; i++){
                this.f[1](i);
            }
            this.callback( this.value );
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    // test value
    this.f[1] = function(n){
         if(!isNaN(this.c[3+n].value)) this.value[n] = this.c[3+n].value;
         else this.c[3+n].value = this.value[n];
    };

    this.init();
}

UIL.Vector.prototype = Object.create( UIL.Proto.prototype );
UIL.Vector.prototype.constructor = UIL.Vector;