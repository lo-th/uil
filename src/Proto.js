UIL.Proto = function(target, name, callback){

    this.color = 'G';

    this.callback = callback || function(){};

    this.c = [];
    this.f = [];

    this.c[0] = target;
    this.c[1] = UIL.element('UIL base');
    if(name!==''){
        this.c[2] = UIL.element('UIL text');
        this.c[2].innerHTML = name;
    }
}

UIL.Proto.prototype = {
    constructor: UIL.Proto,

    init:function(){
        this.c[1].style.background = UIL.bgcolor(this.color);
        for(var i = 0; i<this.c.length; i++){
            if(i==0) this.c[0].appendChild(this.c[1]);
            else if(i>1) this.c[1].appendChild(this.c[i]);
        }
    },

    clear:function(){
        var ev = UIL.events;
        var i = this.c.length, j;
            while(i--){
            if(i>1){ 
                // clear function
                j = ev.length;
                while(j--){ if(this.c[i][ev[j]]!==null) this.c[i][ev[j]] = null; }
                this.c[1].removeChild(this.c[i]);
            }
            else if(i==1) this.c[0].removeChild(this.c[1]);
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
    setTypeNumber:function( min, max, precision, step ){
        this.min = -Infinity;
        this.max = Infinity;
        this.precision = 0;
        this.step = 1;
        this.prev = null;

        if(min !== undefined ) this.min = min;
        if(max !== undefined ) this.max = max;
        if(step !== undefined ) this.step = step;
        if(precision !== undefined ) this.precision = precision;
    },
    numValue:function(n){
        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision );
    },
    setRange:function(min,max){
        this.min=min;
        this.max=max;
        return this;
    },
    setPrecision:function(precision){
        this.precision=precision;
        return this;
    },


}