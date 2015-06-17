UIL.Title = function(obj){
    
    UIL.Proto.call( this, obj );

    this.h = 31;
    this.color = obj.prefix || 'N';

    var id = obj.id || 0;
    var prefix = obj.prefix || '';

    this.c[2] = UIL.DOM('UIL text', 'div', 'text-align:right; width:40px; padding:0px 5px; top:8px;');

    this.setDom(0, 'height', this.h);
    this.setDom(1, 'top', 8);
    

    var idt = id || 0;
    if(id<10) idt = '0'+id;

    this.c[1].textContent = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
    this.c[2].textContent = prefix.toUpperCase()+' '+idt;

    this.init();
}


UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;


UIL.Title.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.setDom(1, 'width', this.size-50);
    this.setDom(2, 'left', this.size-(50+26));
};