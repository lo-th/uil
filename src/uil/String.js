UIL.String = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'string';
    this.value = o.value || '';
    this.allway = o.allway || false;

    this.c[2] = UIL.DOM( 'UIL textSelect', 'div', 'pointer-events:auto; padding:3px 5px;' );
    //this.c[2].name = 'input';
    //this.c[2].value = this.value;
    this.c[2].style.color = this.fontColor;
    this.c[2].contentEditable = true;
    this.c[2].textContent = this.value;

    this.c[2].events = [ 'click', 'keydown', 'keyup' ];

    this.init();

};

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;

UIL.String.prototype.handleEvent = function( e ) {

    //e.preventDefault();
    //e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click( e ); break;
        case 'keydown': this.keydown( e ); break;
        case 'keyup': this.keyup( e ); break;
    }

};

UIL.String.prototype.click = function( e ){
//e.preventDefault();
//if(this.select) return;
    e.target.focus();
    e.target.style.cursor = 'auto';
  //  this.select = true;
   // console.log('select')

};

UIL.String.prototype.keydown = function( e ){

    if( e.keyCode === 13 ){ 
        e.preventDefault();
        this.value = e.target.textContent;//e.target.value;
        this.callback( this.value );
        e.target.blur();
    }

};

UIL.String.prototype.keyup = function( e ){

    if( this.allway ) this.callback( this.value );
    
};

UIL.String.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.c[2].style.left = this.sa + 'px';
    this.c[2].style.width = this.sb + 'px';

};