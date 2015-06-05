UIL.Vector = function(target, name, callback, value ){

    UIL.Proto.call( this, target, name, callback );

    this.value = value || [0,0];


    this.c[3] = UIL.element('UIL number', 'input', 'left:100px;');
    this.c[4] = UIL.element('UIL number', 'input', 'left:170px;');

    this.f[0] = function(e){
        if ( e.keyCode === 13 ){ 
            if(!isNaN(this.c[3].value) && !isNaN(this.c[4].value)){
                this.value = [this.c[3].value, this.c[4].value];
                this.callback( this.value );
            } else {
                this.c[3].value = this.value[0];
                this.c[4].value = this.value[1];
            }
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.c[3].value = this.value[0];
    this.c[4].value = this.value[1];
    this.c[3].onkeydown = this.f[0];
    this.c[4].onkeydown = this.f[0];

    this.init();
}

UIL.Vector.prototype = Object.create( UIL.Proto.prototype );
UIL.Vector.prototype.constructor = UIL.Vector;