UIL.String = function(obj){

    UIL.Proto.call( this, obj );

    this.value = obj.value || '';

    this.c[2] = UIL.DOM('UIL itext', 'input' );

    this.f[0] = function(e){
        if (!e) e = window.event;
        if ( e.keyCode === 13 ){ 
            this.callback( e.target.value );
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.c[2].value = this.value;
    this.c[2].onkeydown = this.f[0];

    this.init();
}

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;

UIL.String.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.setDom(2, 'width', this.sb);
    this.setDom(2, 'left', this.sa);
}