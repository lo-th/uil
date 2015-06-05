UIL.String = function(target, name, callback, value, c ){

    UIL.Proto.call( this, target, name, callback, c);

    this.c[3] = UIL.element('UIL string', 'input' );

    this.f[0] = function(e){
        if (!e) e = window.event;
        if ( e.keyCode === 13 ){ 
            this.callback( e.target.value );
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.c[3].value = value || '';
    this.c[3].onkeydown = this.f[0];

    this.init();
}

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;