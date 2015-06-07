UIL.Bool = function(target, name, callback, value ){

    UIL.Proto.call( this, target, name, callback );

    this.value = value || false;

    //this.c[3] = UIL.element('UIL box', 'div');
    this.c[3] = UIL.element(null, 'rect','position:absolute; left:100px; top:3px; pointer-events:auto; cursor:pointer;',{width:14, height:14, fill:'rgba(0,0,0,0)', 'stroke-width':2, stroke:'#AAA'});

    this.f[0] = function(e){
        if(this.value){
            this.value = false;
            //this.c[3].style.background = 'none';
            UIL.setSVG(this.c[3], 'fill','rgba(0,0,0,0)');
        } else {
            this.value = true;
            //this.c[3].style.background = '#FFF';
            UIL.setSVG(this.c[3], 'fill','#AAA');
        }
        this.callback( this.value );
    }.bind(this);

    this.c[3].onclick = this.f[0];

    this.init();
}

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;