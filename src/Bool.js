UIL.Bool = function(obj){

    UIL.Proto.call( this, obj );

    this.value = obj.value || false;

    //this.c[2] = UIL.DOM('UIL', 'rect', UIL.BASIC+'top:2px; border:solid 1px rgba(90,90,90,0.6);', {width:14, height:14, fill:'rgba(0,0,0,0.2)' });
    this.c[2] = UIL.DOM('UIL svgbox', 'rect', 'width:17px;', {width:15, height:15, fill:'rgba(0,0,0,0.2)' });
    this.c[3] = UIL.DOM('UIL svgbox', 'path','width:17px; pointer-events:none;',{width:16, height:16, d:'M 3 9 L 5 12 13 4', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' });

    if(!this.value) this.c[3].style.display = 'none';

    this.f[0] = function(e){
        if(this.value){
            this.value = false;
            this.c[3].style.display = 'none';
            UIL.setSVG(this.c[2], 'fill','rgba(0,0,0,0.2)');
        } else {
            this.value = true;
            this.c[3].style.display = 'block';
            UIL.setSVG(this.c[2], 'fill','rgba(0,0,0,0.4)');
        }
        this.callback( this.value );
    }.bind(this);

    this.c[2].onclick = this.f[0];

    this.init();
}

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;

UIL.Bool.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    UIL.setDOM(this.c[2], 'left', UIL.AW);
    UIL.setDOM(this.c[3], 'left', UIL.AW);
};