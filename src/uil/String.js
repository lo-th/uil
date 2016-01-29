UIL.String = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || '';
    this.allway = o.allway || false;

    this.c[2] = UIL.DOM( 'UIL text', 'input', 'pointer-events:auto; padding:0px 5px; padding-bottom:2px;' );
    this.c[2].name = 'input';
    this.c[2].value = this.value;

    this.c[2].events = [ 'keydown', 'keyup' ];

    this.init();

};

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;

UIL.String.prototype.handleEvent = function( e ) {

    switch( e.type ) {
        case 'keydown': this.keydown( e ); break;
        case 'keyup': this.keyup( e ); break;
    }

};

UIL.String.prototype.keydown = function( e ){

    if( e.keyCode === 13 ){ 
        this.value = e.target.value;
        this.callback( this.value );
        e.target.blur();
    }
    e.stopPropagation();

};

UIL.String.prototype.keyup = function( e ){

    if( this.allway ) this.callback( this.value );
    e.stopPropagation();

};

UIL.String.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.c[2].style.left = this.sa + 'px';
    this.c[2].style.width = this.sb + 'px';

};