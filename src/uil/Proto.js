UIL.Proto = function( o ){

    o = o || {};

    // only most simple 
    this.mono = false;

    // no title 
    this.simple = o.simple || false;

    // bottom line
    this.liner = null;

    // define obj size
    this.setSize(o.size);

    this.h = 20;
    
    if(o.color) UIL.COLOR = o.color;
    this.color = UIL.COLOR;

    this.fontColor = o.fontColor === undefined ? '#cccccc' : o.fontColor;
    this.titleColor = o.titleColor === undefined ? '#cccccc' : o.titleColor;

    this.txt = o.name || 'Proto';
    this.target = o.target || null;
    this.callback = o.callback || function(){};

    // elements

    this.c = [];

    this.c[0] = UIL.DOM('UIL base');
    

    if(!this.simple){ 
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
    } else {
        if(UIL.main){
            this.liner = UIL.main.liner();
            this.c[0].appendChild( this.liner );
        }
    }
}

UIL.Proto.prototype = {

    constructor: UIL.Proto,

    init: function (){

        this.c[0].style.background = UIL.bgcolor(this.color);
        for( var i = 0; i < this.c.length; i++ ){
            if( i === 0 ){ 
                if(this.target !== null ) this.target.appendChild( this.c[0] );
                else UIL.main.inner.appendChild( this.c[0] );
            }
            else {
                if( this.c[i] !== undefined ) this.c[0].appendChild(this.c[i]);
            }
        }

        this.rSize();
        
        this.addEvent();

    },

    setCallBack:function(callback){
        if(this.callback) this.callback = null;
        this.callback = callback;
    },

    setSize:function(sx){

        this.size = sx || UIL.WIDTH;
        if( this.simple ){
            this.sa = 1;
            this.sb = sx-2;
        }else{
            this.sa = (this.size/3).toFixed(0)*1;
            this.sb = ((this.sa*2)-10).toFixed(0)*1;
        }

    },
    
    clear:function(){

        //console.log(event.this);
        
        this.clearEvent();

        var i = this.c.length;
        while(i--){
            if(i==0){
                if( this.liner !== null ){ 
                    this.c[0].removeChild( this.liner );
                    this.liner = null;
                }
                
            } else {
                if( this.c[i] !== undefined ){
                    if( this.c[i].children ) this.clearDOM( this.c[i] );
                    this.c[0].removeChild( this.c[i] );
                    this.c[i] = null;
                }
            }
        }

        if( this.target !== null ) this.target.removeChild(this.c[0]);
        else UIL.main.inner.removeChild(this.c[0]);

        this.c[0] = null;
        this.handleEvent = null;

        

        this.c = null;
        if(this.callback) this.callback = null;
        if(this.value) this.value = null;

        //this = null;
    },

    clearDOM:function(dom){
        while ( dom.children.length ){
            if(dom.lastChild.children) while ( dom.lastChild.children.length ) dom.lastChild.removeChild( dom.lastChild.lastChild );
            dom.removeChild( dom.lastChild );
        }
    },

    setTypeNumber:function( obj ){

        this.min = obj.min === undefined ? -Infinity : obj.min;
        this.max = obj.max === undefined ?  Infinity : obj.max;
        this.step = obj.step === undefined ?  0.01 : obj.step;
        this.precision = obj.precision === undefined ? 2 : obj.precision;

        switch(this.precision){
            case 0:  this.step = 1; break;
            case 1:  this.step = 0.1; break;
            case 2:  this.step = 0.01; break;
            case 3:  this.step = 0.001; break;
            case 4:  this.step = 0.0001; break;
        }
        
    },

    numValue:function( n ){

        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision )*1;

    },

    rSize:function(){

        this.c[0].style.width = this.size+'px';
        if( !this.simple ) this.c[1].style.width = this.sa+'px';
    
    },

    // EVENTS DISPATCH

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
        
    }
}