UIL.Bool = function(target, name, callback, value ){

    UIL.Proto.call( this, target, name, callback );

    this.value = value || false;

    this.c[3] = UIL.element('UIL box', 'div');

    this.f[0] = function(e){
        if(this.value){
            this.value = false;
            this.c[3].style.background = 'none';
        } else {
            this.value = true;
            this.c[3].style.background = '#FFF';
        }
        this.callback( this.value );
    }.bind(this);

    this.c[3].onclick = this.f[0];

    this.init();
}

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;