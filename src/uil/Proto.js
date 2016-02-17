UIL.Proto = function( o ){

    o = o || {};

    //this.type = '';

    // if need resize width
    this.autoWidth = true;

    // if height can change
    this.autoHeight = false;

    // if is on ui pannel
    this.isUI = o.isUI || false;

    // only for number
    this.isNumber = false;

    // only most simple 
    this.mono = false;

    // no title 
    this.simple = o.simple || false;

    // define obj size
    this.setSize( o.size );

    if(o.sa !== undefined ) this.sa = o.sa;
    if(o.sb !== undefined ) this.sb = o.sb;

    // like dat gui
    this.parent = null;
    this.val = null;
    this.isSend = false;

    var h = 20;
    if( this.isUI ) h = UIL.main.height;
    this.h = o.height || h;
    this.h = this.h < 11 ? 11 : this.h;
    
    this.bgcolor = UIL.COLOR || o.bgcolor;



    //this.fontColor = o.fontColor === undefined ? UIL.BASECOLOR : o.fontColor;
    this.titleColor = o.titleColor || UIL.BASECOLOR;
    this.fontColor = o.fontColor || UIL.BASECOLOR;
    this.colorPlus = UIL.ColorLuma(this.fontColor, 0.3);
    

    this.txt = o.name || 'Proto';
    this.target = o.target || null;

    this.callback = o.callback === undefined ? null : o.callback;
    this.endCallback = null;

    if( this.callback === null && this.isUI && UIL.main.callback !== null ) this.callback = UIL.main.callback;

    // elements

    this.c = [];

    this.c[0] = UIL.DOM('UIL base');

    if( this.isUI ) this.c[0].style.marginBottom = '1px';
    

    if( !this.simple ){ 
        this.c[1] = UIL.DOM('UIL text');
        this.c[1].textContent = this.txt;
        this.c[1].style.color = this.titleColor;
    }

    if(o.pos){
        this.c[0].style.position = 'absolute';
        for(var p in o.pos){
            this.c[0].style[p] = o.pos[p];
        }
        this.mono = true;
    }

};

UIL.Proto.prototype = {

    constructor: UIL.Proto,

    // make de node

    init: function (){

        this.c[0].style.height = this.h + 'px';

        if( this.isUI ) this.c[0].style.background = UIL.bgcolor(this.bgcolor);
        if( this.autoHeight ) this.c[0].style.transition = 'height 0.1s ease-out';
        if( this.c[1] !== undefined && this.autoWidth ){
            this.c[1].style.height = (this.h-4) + 'px';
            this.c[1].style.lineHeight = (this.h-8) + 'px';
        }

        for( var i = 0; i < this.c.length; i++ ){
            if( i === 0 ){
                if( this.target !== null ){ 
                    this.target.appendChild( this.c[0] );
                } else {
                    if( this.isUI ) UIL.main.inner.appendChild( this.c[0] );
                    else document.body.appendChild( this.c[0] );
                }
            }
            else {
                if( this.c[i] !== undefined ) this.c[0].appendChild( this.c[i] );
            }
        }

        this.rSize();
        this.addEvent();

    },

    listen : function( ){

        UIL.listens.push( this );
        return this;

    },

    listening : function(){
        if( this.parent === null ) return;
        if( this.isSend ) return;
        if( this.isNumber ) this.value = this.numValue( this.parent[ this.val ] );
        else this.value = this.parent[ this.val ];
        this.update();

    },

    update: function( ) {
        
    },

    // update every change

    onChange : function( f ){

        this.callback = f;
        return this;

    },

    // update only on end

    onFinishChange : function( f ){

        this.callback = null;
        this.endCallback = f;
        return this;

    },

    send:function( v ){
        this.isSend = true;
        if( this.callback ) this.callback( v || this.value );
        if( this.parent !== null ) this.parent[ this.val ] = v || this.value;
        this.isSend = false;

    },

    sendEnd:function( v ){

        if( this.endCallback ) this.endCallback( v || this.value );
        if( this.parent !== null ) this.parent[ this.val ] = v || this.value;

    },

    

    // clear node
    
    clear:function(){

        this.clearEvent();
        UIL.clear( this.c[0] );

        if( this.target !== null ){ 
            this.target.removeChild( this.c[0] );
        } else {
            if( this.isUI ) UIL.main.inner.removeChild( this.c[0] );
            else document.body.removeChild( this.c[0] );
        }

        this.c = null;
        this.callback = null;
        this.target = null;

    },

    // change size 

    setSize:function(sx){

        if( !this.autoWidth ) return;

        this.size = sx || UIL.WIDTH;
        if( this.simple ){
            this.sa = 1;
            this.sb = sx-2;
        }else{
            this.sa = ~~ (this.size/3);
            this.sb = ~~ ((this.sa*2)-10);
        }

    },

    rSize:function(){

        if( !this.autoWidth ) return;

        this.c[0].style.width = this.size + 'px';
        if( !this.simple ) this.c[1].style.width = this.sa + 'px';
    
    },

    // for numeric value

    setTypeNumber:function( o ){

        this.isNumber = true;

        this.value = 0;
        if(o.value !== undefined){
            if( typeof o.value === 'string' ) this.value = o.value * 1;
            else this.value = o.value;
        }

        this.min = o.min === undefined ? -Infinity : o.min;
        this.max = o.max === undefined ?  Infinity : o.max;
        this.precision = o.precision === undefined ? 2 : o.precision;

        var s;

        switch(this.precision){
            case 0: s = 1; break;
            case 1: s = 0.1; break;
            case 2: s = 0.01; break;
            case 3: s = 0.001; break;
            case 4: s = 0.0001; break;
        }

        this.step = o.step === undefined ?  s : o.step;

        this.range = this.max - this.min;

        this.value = this.numValue( this.value );
        
    },

    numValue:function( n ){

        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision ) * 1;

    },

    // ----------------------
    //   Events dispatch
    // ----------------------

    addEvent: function(){

        var i = this.c.length, j, c;
        while( i-- ){
            c = this.c[i];
            if( c !== undefined ){
                if( c.events !== undefined ){
                    j = c.events.length;
                    while( j-- ) c.addEventListener( c.events[j], this, false );
                }
            }
        }

    },

    clearEvent: function(){

        var i = this.c.length, j, c;
        while( i-- ){
            c = this.c[i];
            if( c !== undefined ){
                if( c.events !== undefined ){
                    j = c.events.length;
                    while( j-- ) c.removeEventListener( c.events[j], this, false );
                }
            }
        }

    },

    handleEvent: function( e ) {
        
    },

    // ----------------------
    // object referency
    // ----------------------

    setReferency: function(obj, val){

        this.parent = obj;
        this.val = val;

    }


}