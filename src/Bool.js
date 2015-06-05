
UIL.Bool = function(target, name, callback, value ){

    this.callback = callback || function(){};

    this.value = value || false;

    this.c = [];
    this.f = [];

    this.c[0] = target;
    this.c[1] = UIL.element('UIL base', 'div', 'background:'+UIL.bgcolor('G')+';' );
    this.c[2] = UIL.element('UIL text');
    this.c[3] = UIL.element('UIL box', 'div');

    this.f[0] = function(e){
        if(this.value){
            this.value = false;
            this.c[3].style.background = 'none';
        } else {
            this.value = true;
            this.c[3].style.background = '#FFF';
        }
        this.callback( this.value );
    }.bind(this);

    this.c[2].innerHTML = name;
    this.c[3].onclick = this.f[0];

    UIL.create(this);
}
UIL.Bool.prototype = {
    constructor: UIL.Bool,
    clear:function(){
        UIL.clear(this);
    }
}