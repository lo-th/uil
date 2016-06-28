UIL.Slide = function( o ){

    UIL.Proto.call( this, o );

    this.m = 0;

    this.setTypeNumber( o );

    this.stype = o.stype || 0;
    this.buttonColor = o.bColor || UIL.BUTTON;

    //this.old = this.value;
    this.isDown = false;
    this.isOver = false;
    this.allway = o.allway || false;

    //this.c[2] = UIL.DOM('UIL number', 'div', ' text-align:right; width:47px; color:'+ this.fontColor );
    this.c[2] = UIL.DOM('UIL textSelect', 'div', ' text-align:right; pointer-events:none; width:47px; border:none; color:'+ this.fontColor );
    this.c[3] = UIL.DOM('UIL', 'div', 'top:0; height:'+this.h+'px;' );
    this.c[4] = UIL.DOM('UIL', 'div', 'border:1px solid '+UIL.Border+'; top:2px; height:'+(this.h-4)+'px;' );
    this.c[5] = UIL.DOM('UIL', 'div', 'left:4px; top:5px; height:'+(this.h-10)+'px; ' );

    this.c[2].name = 'text';
    this.c[3].name = 'scroll';

    
    if( this.stype === 1 || this.stype === 3 ){
        var h1 = 4;
        var h2 = 8;
        var ww = this.h-4;
        var ra = 20;
    }

    if(this.stype === 2){
        h1 = 2;
        h2 = 6;
        ra = 2;
        ww = (this.h-4)*0.5;
    }

    if(this.stype === 3) this.c[5].style.visible = 'none';

    if(this.stype !== 0){

        this.c[4].style.borderRadius = h1 + 'px';
        this.c[4].style.height = h2 + 'px';
        this.c[4].style.top = (this.h*0.5) - h1 + 'px';
        this.c[5].style.borderRadius = (h1*0.5) + 'px';
        this.c[5].style.height = h1 + 'px';
        this.c[5].style.top = (this.h*0.5)-(h1*0.5) + 'px';
        if(this.stype === 2) this.c[5].style.top = (this.h*0.5) + 'px';
        this.c[6] = UIL.DOM('UIL', 'div', 'border-radius:'+ra+'px; margin-left:'+(-ww*0.5)+'px; border:1px solid '+UIL.Border+'; background:'+this.buttonColor+'; left:4px; top:2px; height:'+(this.h-4)+'px; width:'+ww+'px;' );

    }

    // not on gui

    if( !this.isUI ){

        this.c[2].style.pointerEvents = 'auto';
        this.c[3].style.cursor = 'pointer';

        this.c[3].style.pointerEvents = 'auto'; 
        this.c[3].style.cursor = 'w-resize';

        this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];
        this.c[2].events = [ 'keydown', 'keyup', 'mousedown', 'blur' ];

    }

    this.init();

    this.mode(0);

};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;

UIL.Slide.prototype.handleEvent = function( e ) {

    //e.preventDefault();

    //console.log(e.target.name)

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': e.target.name === 'text' ? this.textdown( e ) : this.down( e ); break;
        case 'mouseout': this.out( e ); break;

        case 'mouseup': this.up( e ); break;
        case 'mousemove': if(this.isDown) this.move( e.clientX ); break;

        case 'blur': this.blur( e ); break;
        case 'focus': this.focus( e ); break;
        case 'keydown': this.keydown( e ); break;
        case 'keyup': this.keyup( e ); break;
    }

};

UIL.Slide.prototype.mouseAction = function( mouse ) {

    if( mouse === undefined ){

        if( this.m ){
            this.mode(0);
            this.mode(2);
            this.isDown = false;
            this.actif = false;

        }

    } else {

        // mouse over slide
        if( mouse.x >= this.sa && mouse.x <= this.sa + this.width ){

            this.isDown = mouse.down ? true : false;
            if( !this.m ) this.mode(1);
            this.actif = true;

        }

        // is text select
        if( mouse.x >= this.sa + this.width && mouse.x <= this.sa + this.width + this.sc ){

             this.mode(3);


        }

        if( this.isDown ){ 

            this.old = this.value;
            this.move( mouse.x );
            mouse.setCursor('w-resize');
            this.actif = true;

        } else {

            mouse.defCursor();

        }

    }

};

UIL.Slide.prototype.mode = function ( mode ) {

    var s = this.s;

    switch(mode){
        case 0: // base
            s[2].color = this.fontColor;
            s[4].background = 'rgba(0,0,0,0.2)';
            s[5].background = this.fontColor;
            this.m = 0;
        break;
        case 1: // over
            s[2].color = this.colorPlus;
            s[4].background = 'rgba(0,0,0,0.4)';
            s[5].background = this.colorPlus;
            this.m = 1;
        break;

        case 2: // text unselect
            s[2].color = this.fontColor;
            s[2].border = 'none';
            this.c[2].contentEditable = false;
            this.c[2].blur();
            this.isEdit = false;
            //this.m = 2;
        break;

        case 3: // text edit
            s[2].color = this.colorPlus;
            s[2].border = '1px dashed ' + UIL.BorderSelect;
            this.c[2].contentEditable = true;
            //.selection = [0,2];
            //this.c[2].selectionStart = 0;
            //this.c[2].selectionEnd = 2;
            this.c[2].focus();
            //this.c[2].setSelectionRange(0,2);
            this.isEdit = true;
            //this.m = 3;
        break;
    }
};

UIL.Slide.prototype.over = function ( e ) {

    e.preventDefault();
    e.stopPropagation();

    this.isOver = true;
    this.mode(1);

};

UIL.Slide.prototype.out = function ( e ) {

    e.preventDefault();
    e.stopPropagation();

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Slide.prototype.up = function ( e ) {

    e.preventDefault();
    e.stopPropagation();

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.isOver) this.mode(1);
    else this.mode(0);

    this.sendEnd();
    
};

UIL.Slide.prototype.down = function ( e ) {

    e.preventDefault();
    e.stopPropagation();

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    //this.left = this.c[3].getBoundingClientRect().left;
    this.old = this.value;
    this.move( e.clientX );

};

UIL.Slide.prototype.move = function ( x ) {

    var n = ((( x - this.left - 3 ) / this.w ) * this.range + this.min ) - this.old;
    if(n >= this.step || n <= this.step){ 
        n = ~~ ( n / this.step );
        this.value = this.numValue( this.old + ( n * this.step ) );
        this.update( true );
        this.old = this.value;
    }

};


UIL.Slide.prototype.update = function ( up ) {

    var ww = this.w * (( this.value - this.min ) / this.range );
   
    if(this.stype !== 3) this.s[5].width = ~~ ww + 'px';
    if(this.s[6]) this.s[6].left = ~~ (this.sa +ww + 3) + 'px';
    this.c[2].textContent = this.value;

    if( up ) this.send();

};

UIL.Slide.prototype.rSize = function () {

    UIL.Proto.prototype.rSize.call( this );

    this.width = this.sb - this.sc;
    this.w = this.width - 6;

    var tx = this.sc;
    if(this.isUI || !this.simple) tx = this.sc+10;

    if( this.simple ) this.left = this.c[3].getBoundingClientRect().left;
    else this.left = this.sa;

    var ty = ~~(this.h * 0.5) - 8;

    var s = this.s;

    s[2].width = (this.sc -2 )+ 'px';
    s[2].left = (this.size - tx +2) + 'px';
    s[2].top = ty + 'px';
    s[3].left = this.sa + 'px';
    s[3].width = this.width + 'px';
    s[4].left = this.sa + 'px';
    s[4].width = this.width + 'px';
    s[5].left = (this.sa + 3) + 'px';

    this.update();

};

// text

UIL.Slide.prototype.validate = function ( e ) {

    if(!isNaN( this.c[2].textContent )){ 
        this.value = this.numValue( this.c[2].textContent ); 
        this.update(true); 
    }
    else this.c[2].textContent = this.value;

};

UIL.Slide.prototype.textdown = function ( e ) {

    this.mode(3);

    //e.target.contentEditable = true;
    //e.target.focus();
    //this.isEdit = true;

};

UIL.Slide.prototype.keydown = function ( e ) {

    e.stopPropagation();

    if( e.keyCode === 13 ){
        e.preventDefault();
        this.validate();
        e.target.blur();
    }

};

UIL.Slide.prototype.keyup = function ( e ) {
    
    e.stopPropagation();
    if( this.allway ) this.validate();

};

UIL.Slide.prototype.blur = function ( e ) {

    this.mode(2);

    //e.target.style.border = 'none';
    //e.target.contentEditable = false;
    //this.isEdit = false;

};

UIL.Slide.prototype.focus = function ( e ) {

    //e.target.style.border = '1px dashed ' + UIL.BorderSelect;

};