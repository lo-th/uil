UIL.String = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || '';
    this.allway = o.allway || false;

    this.c[2] = UIL.DOM( 'UIL textSelect', 'div', 'height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px; color:' +  this.fontColor );
    this.c[2].name = 'input';
    //this.c[2].style.color = ;
    this.c[2].textContent = this.value;

    this.c[2].events = [ 'mousedown', 'keydown', 'keyup', 'blur', 'focus' ];

    this.init();

};

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;

UIL.String.prototype.handleEvent = function( e ) {

    switch( e.type ) {
        case 'mousedown': this.down( e ); break;
        case 'blur': this.blur( e ); break;
        case 'focus': this.focus( e ); break
        case 'keydown': this.keydown( e ); break;
        case 'keyup': this.keyup( e ); break;
    }

};

UIL.String.prototype.down = function( e ){

    e.target.contentEditable = true;
    e.target.focus();
    e.target.style.cursor = 'auto';

};

UIL.String.prototype.blur = function( e ){

    e.target.style.borderColor = UIL.Border;
    e.target.contentEditable = false;

};

UIL.String.prototype.focus = function( e ){

    e.target.style.borderColor = UIL.BorderSelect;

};

UIL.String.prototype.keydown = function( e ){
    
    e.stopPropagation();

    if( e.keyCode === 13 ){ 
        e.preventDefault();
        this.value = e.target.textContent;
        e.target.blur();
        this.send();
    }

};

UIL.String.prototype.keyup = function( e ){
    
    e.stopPropagation();

    this.value = e.target.textContent;
    if( this.allway ) this.send();
    
};

UIL.String.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.s[2].left = this.sa + 'px';
    this.s[2].width = this.sb + 'px';

};