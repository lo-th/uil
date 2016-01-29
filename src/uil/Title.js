UIL.Title = function( o ){
    
    UIL.Proto.call( this, o );

    this.h = o.height || 31;

    var id = o.id || 0;
    var prefix = o.prefix || '';

    this.c[2] = UIL.DOM( 'UIL text', 'div', 'text-align:right; width:40px; padding:3px 5px;');

    if( this.h === 31 ){

        this.c[0].style.height = this.h + 'px';
        this.c[1].style.top = 8 + 'px';
        this.c[2].style.top = 8 + 'px';

    }
    
    var idt = id || 0;
    if(id<10) idt = '0'+id;

    this.c[1].textContent = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
    this.c[2].textContent = prefix.toUpperCase()+' '+idt;

    this.init();

};

UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;


UIL.Title.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.c[2].style.left = this.size-(50+26) + 'px';
    this.c[1].style.width = this.size-50 + 'px';

};

UIL.Title.prototype.text = function(txt){

    this.c[1].textContent = txt;

};

UIL.Title.prototype.text2 = function(txt){

    this.c[2].textContent = txt;

};