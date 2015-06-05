UIL.Title = function(target, type, id, prefix ){
    
    UIL.Proto.call( this, target, '', null );

    this.color = prefix || 'N';

    id = id || 0;
    type = type || '';
    prefix = prefix || '';

    //this.c[0] = target;
    //this.c[1] = UIL.element('UIL title', 'div', 'background:'+UIL.bgcolor(prefix)+';' );
    this.c[1].style.height = '30px';
    this.c[2] = UIL.element('UIL text', 'div', 'width:200px; font-size:12px; top:8px;');
    this.c[3] = UIL.element('UIL text', 'div', 'right:25px; text-align:right; font-size:12px; top:8px;');

    var idt = id || 0;
    if(id<10) idt = '0'+id;

    this.c[2].innerHTML = type.replace("-", " ").toUpperCase();
    this.c[3].innerHTML = prefix.toUpperCase()+' '+idt;

    this.init();
}


UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;