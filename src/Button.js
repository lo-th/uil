UIL.Button = function(obj){

    UIL.Proto.call( this, obj );

    this.value = obj.value || false;

    this.c[2] = UIL.DOM('UIL', 'rect', UIL.BASIC+'top:1px; border:solid 1px rgba(90,90,90,0.6);', {width:168, height:15, fill:UIL.bgcolor(UIL.COLOR) });
    //UIL.DOM('UIL', 'text', UIL.BASIC+'top:1px;', {width:168, height:15, 'font-family':'Open Sans', fill:'#CCC' }, this.c[2]);
    this.c[3] = UIL.DOM('UIL color-txt', 'div', 'top:1px; left:100px; text-align:center;');

    this.c[1].innerHTML = '';
    this.c[3].innerHTML = this.txt;

    this.f[0] = function(e){
        this.callback( this.value );
    }.bind(this);

    this.f[1] = function(e){
        this.c[3].style.color = '#FFF';
        UIL.setSVG(this.c[2], 'fill', UIL.SELECT );
    }.bind(this);

    this.f[2] = function(e){
        this.c[3].style.color = '#CCC';
        UIL.setSVG(this.c[2], 'fill', UIL.bgcolor(UIL.COLOR) );
    }.bind(this);

    this.f[3] = function(e){
        this.c[3].style.color = '#CCC';
        UIL.setSVG(this.c[2], 'fill', UIL.SELECTDOWN );
    }.bind(this);

    this.c[2].onclick = this.f[0];
    this.c[2].onmouseover = this.f[1];
    this.c[2].onmouseout = this.f[2];
    this.c[2].onmouseup = this.f[1];
    this.c[2].onmousedown = this.f[3];

    this.init();
}

UIL.Button.prototype = Object.create( UIL.Proto.prototype );
UIL.Button.prototype.constructor = UIL.Button;