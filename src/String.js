UIL.String = function(obj){

    UIL.Proto.call( this, obj );

    this.value = obj.value || '';
    this.allway = obj.allway || false;

    this.c[2] = UIL.DOM('UIL text', 'input', 'pointer-events:auto; padding:0px 5px; padding-bottom:2px;' );
    this.c[2].name = 'input';

    this.f[0] = function(e){
        //if(this.allway) this.callback( e.target.value );
        if ( e.keyCode === 13 ){ 
            this.callback( e.target.value );
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.f[1] = function(e){
        if(this.allway) this.callback( e.target.value );
        e.stopPropagation();
    }.bind(this);

    this.c[2].value = this.value;
    this.c[2].onkeydown = this.f[0];
    this.c[2].onkeyup = this.f[1];

    this.init();
}

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;

UIL.String.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.setDom(2, 'width', this.sb);
    this.setDom(2, 'left', this.sa);
}