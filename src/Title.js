UIL.Title = function(obj){
    
    UIL.Proto.call( this, obj );

    this.h = 31;
    this.color = obj.prefix || 'N';

    var id = obj.id || 0;
    //var type = obj.type || 'Title';
    var prefix = obj.prefix || '';

    //this.c[0] = target;
    //this.c[1] = UIL.element('UIL title', 'div', 'background:'+UIL.bgcolor(prefix)+';' );
    this.c[0].style.height = this.h+'px';
    this.c[1].style.width = '200px';
    this.c[1].style.top = '8px';
    //this.c[2] = UIL.element('UIL text', 'div', 'width:200px; font-size:12px; top:8px;');
    this.c[2] = UIL.element('UIL text', 'div', 'right:25px; text-align:right; font-size:12px; top:8px;');

    var idt = id || 0;
    if(id<10) idt = '0'+id;

    this.c[1].innerHTML = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
    this.c[2].innerHTML = prefix.toUpperCase()+' '+idt;

    this.init();
}


UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;