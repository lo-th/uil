UIL.Title = function(obj){
    
    UIL.Proto.call( this, obj );

    this.h = 31;
    this.color = obj.prefix || 'N';

    var id = obj.id || 0;
    var prefix = obj.prefix || '';

    this.c[0].style.height = this.h+'px';
    this.c[1].className = 'UIL text-t';
    this.c[2] = UIL.DOM('UIL text-m', 'div', 'top:8px;');

    var idt = id || 0;
    if(id<10) idt = '0'+id;

    this.c[1].innerHTML = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
    this.c[2].innerHTML = prefix.toUpperCase()+' '+idt;

    this.init();
}


UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;


UIL.Title.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.setDom(1, 'width', this.size-50);
    this.setDom(2, 'left', this.size-50);
};