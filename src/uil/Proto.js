UIL.Proto = function( o ){

    o = o || {};

    //this.type = '';

    // if need resize width
    this.autoWidth = true;

    // if height can change
    this.autoHeight = false;

    // if is on ui pannel
    this.isUI = o.isUI || false;

    // only most simple 
    this.mono = false;

    // no title 
    this.simple = o.simple || false;

    // define obj size
    this.setSize( o.size );

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

    if(this.isUI) this.c[0].style.marginBottom = '1px';
    

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
    }

};

UIL.Proto.prototype = {

    constructor: UIL.Proto,

    init: function (){

        this.c[0].style.height = this.h + 'px';
        if( this.isUI ) this.c[0].style.background = UIL.bgcolor(this.color);

        if( this.autoHeight ) this.c[0].style.transition = 'height 0.1s ease-out';

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
    
    clear:function(){
        
        this.clearEvent();

        this.purge(this.c[0])

        var i = this.c.length;
        while(i--){
            if(i !== 0){
                if( this.c[i] !== undefined ){
                    //if( this.c[i].children ) 
                    this.clearDOM( this.c[i] );
                    this.c[0].removeChild( this.c[i] );
                    this.c[i] = null;
                }
            }
        }

        this.c[0].innerHTML = '';

        if( this.target !== null ) this.target.removeChild( this.c[0] );
        else UIL.main.inner.removeChild( this.c[0] );

        this.c[0] = null;
        this.handleEvent = null;

        this.c = null;
        if(this.callback) this.callback = null;
        if(this.value) this.value = null;

        this.purge(this);

        //this = null;
    },

    purge : function (d) {
        var a = d.attributes, i, l, n;
        if (a) {
            for (i = a.length - 1; i >= 0; i -= 1) {
                n = a[i].name;
                if (typeof d[n] === 'function') {
                    d[n] = null;
                }
            }
        }
        a = d.childNodes;
        if (a) {
            l = a.length;
            for (i = 0; i < l; i += 1) {
                this.purge(d.childNodes[i]);
            }
        }
    },

    clearDOM:function(dom){
        while ( dom.lastChild ){
            if(dom.lastChild.children) while ( dom.lastChild.lastChild ) dom.lastChild.removeChild( dom.lastChild.lastChild );
            dom.removeChild( dom.lastChild );
        }

        /*while ( dom.children.length ){
            if(dom.lastChild.children) while ( dom.lastChild.children.length ) dom.lastChild.removeChild( dom.lastChild.lastChild );
            dom.removeChild( dom.lastChild );
        }*/
    },

    setTypeNumber:function( o ){

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
        
    },

    numValue:function( n ){

        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision ) * 1;

    },

    rSize:function(){

        if( !this.autoWidth ) return;

        this.c[0].style.width = this.size+'px';
        if( !this.simple ) this.c[1].style.width = this.sa+'px';
    
    },

    // ----------------------
    //   EVENTS DISPATCH
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
        
    }
}