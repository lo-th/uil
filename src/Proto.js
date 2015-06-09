UIL.Proto = function(obj){

    obj = obj || {};

    this.h = 21;
    this.color = obj.color || 'G';
    this.txt = obj.name || '';
    this.callback = obj.callback || function(){};

    this.c = [];
    this.f = [];

    this.c[0] = UIL.DOM('UIL base');
    if(this.txt!==''){
        this.c[1] = UIL.DOM('UIL text');
        this.c[1].innerHTML = this.txt;
    }
}

UIL.Proto.prototype = {
    constructor: UIL.Proto,

    init:function(){
        this.c[0].style.background = UIL.bgcolor(this.color);
        for(var i = 0; i<this.c.length; i++){
            if(i==0) UIL.main.inner.appendChild(this.c[0]);
            else this.c[0].appendChild(this.c[i]);
        }
    },
    clear:function(){
        var ev = UIL.events;
        var i = this.c.length, j;
        while(i--){
            if(i==0){ 
                UIL.main.inner.removeChild(this.c[0]);
            } else {
                j = ev.length;
                while(j--){ if(this.c[i][ev[j]]!==null) this.c[i][ev[j]] = null; }
                this.c[0].removeChild(this.c[i]);
            }
            this.c[i] = null;
        }

        this.c = null;
        if(this.f){
            i = this.f.length;
            while(i--) this.f[i] = null;
            this.f = null
        }
        if(this.callback)this.callback = null;
        if(this.value)this.value = null;
    },
    setTypeNumber:function( obj ){
        this.min = -Infinity;
        this.max = Infinity;
        this.precision = 0;
        this.prev = null;
        this.step = 1;

        if(obj.min !== undefined ) this.min = obj.min;
        if(obj.max !== undefined ) this.max = obj.max;
        if(obj.step !== undefined ) this.step = obj.step;
        if(obj.precision !== undefined ) this.precision = obj.precision;
    },
    numValue:function(n){
        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision );
    },
}