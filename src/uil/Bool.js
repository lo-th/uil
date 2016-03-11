UIL.Bool = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || false;

    var t = ~~ (this.h*0.5)-8;

    this.c[2] = UIL.DOM('UIL', 'div', 'background:'+UIL.Border+'; height:18px; width:36px; top:'+t+'px; border-radius:8px; pointer-events:auto; cursor:pointer;' );
    
    this.c[3] = UIL.DOM('UIL', 'path', 'width:17px; top:'+(t+1)+'px;',{ width:17, height:17, d:'M 4 9 L 6 12 14 4', 'stroke-width':2, stroke:'#000', fill:'none', 'stroke-linecap':'butt' });
    this.c[4] = UIL.DOM('UIL', 'div', 'height:16px; width:16px; top:'+(t+1)+'px; border-radius:8px; background:'+UIL.bgcolor(UIL.COLOR,1)+'; transition:margin 0.1s ease-out;' );

    if(this.value){
        this.c[4].style.marginLeft = '18px';
        this.c[2].style.background = this.fontColor;
        this.c[2].style.borderColor = this.fontColor;
    }

    this.c[2].events = [ 'click' ];

    this.init();

};

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;

UIL.Bool.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'click': this.click(e); break;
    }

};

UIL.Bool.prototype.click = function( e ){

    if(this.value){
        this.value = false;
        this.c[4].style.marginLeft = '0px';
        this.c[2].style.background = UIL.Border;
        this.c[2].style.borderColor = UIL.Border;
    } else {
        this.value = true;
        this.c[4].style.marginLeft = '18px';
        this.c[2].style.background = this.fontColor;
        this.c[2].style.borderColor = this.fontColor;
    }

    this.send();

};



UIL.Bool.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.c[2].style.left = this.sa + 'px';
    this.c[3].style.left = this.sa+1 + 'px';
    this.c[4].style.left = this.sa+1 + 'px';

};