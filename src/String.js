UIL.String = function(target, name, callback, value, c ){

    this.callback = callback || function(){};

    this.c = [];
    this.f = [];

    this.c[0] = target;
    this.c[1] = UIL.element('UIL base', 'div', 'background:'+UIL.bgcolor(c || 'E')+';' );
    this.c[2] = UIL.element('UIL text');
    this.c[3] = UIL.element('UIL string', 'input' );

    this.f[0] = function(e){
        if (!e) e = window.event;
        if ( e.keyCode === 13 ){ 
            this.callback( e.target.value );
            e.target.blur();
        }
        e.stopPropagation();
    }.bind(this);

    this.c[2].innerHTML = name;
    this.c[3].value = value || '';
    this.c[3].onkeydown = this.f[0];

    UIL.create(this);
}
UIL.String.prototype = {
    constructor: UIL.String,
    clear:function(){
        UIL.clear(this);
    }
}