UIL.Gui = function(css, w, center, color){

    UIL.sizer( w || 245 );

    this.width = UIL.WIDTH;

    UIL.main = this;

    this.color = color || UIL.COLOR;
    
    this.isCenter = center || false;
    this.lockwheel = false;
    this.isOpen = true;

    this.uis = [];

    this.content = UIL.DOM('UIL content', 'div', css);
    document.body.appendChild( this.content );
    this.content.style.background = UIL.bgcolor( this.color, 1, true );

    this.inner = UIL.DOM('UIL inner');
    this.content.appendChild(this.inner);
    this.inner.name = 'inner';

    this.scrollBG = UIL.DOM('UIL scroll-bg');
    this.content.appendChild(this.scrollBG);
    this.scrollBG.name = 'scroll';

    this.scroll = UIL.DOM('UIL scroll');
    this.scrollBG.appendChild( this.scroll );

    this.bottom = UIL.DOM('UIL bottom');
    this.content.appendChild(this.bottom);
    this.bottom.textContent = 'close';
    this.bottom.name = 'bottom';
    //this.bottom.style.background = 'none';//UIL.bgcolor( this.color );

    this.changeWidth();

    this.isDown = false;
    this.isScroll = false;

    this.content.addEventListener( 'mousedown', this, false );
    this.content.addEventListener( 'mousemove', this, false );
    this.content.addEventListener( 'mouseout',  this, false );
    this.content.addEventListener( 'mouseup',   this, false );
    this.content.addEventListener( 'mouseover', this, false );
    //this.content.addEventListener( 'mousewheel', this, false );

    document.addEventListener( 'mousewheel', this, false );
    
    window.addEventListener("resize", function(e){this.resize(e)}.bind(this), false );

    this.resize();
}

UIL.Gui.prototype = {
    constructor: UIL.Gui,

    handleEvent : function( e ) {

        //e.preventDefault();
        //e.stopPropagation();

        switch( e.type ) {
            case 'mousedown': this.down( e ); break;
            case 'mouseout': this.out( e ); break;
            case 'mouseover': this.over( e ); break;
            case 'mousewheel': this.wheel( e ); break;

            case 'mouseup': this.up( e ); break;
            case 'mousemove': this.move( e ); break;
        }

    },

    

    ////

    down: function( e ){

        if( !e.target.name ) return;

        if(e.target.name === 'scroll'){
            this.isDown = true;
            this.move( e );
            //UIL.setSvg(this.scroll, 'fill','#FFF');

            this.scroll.style.background = '#AAAAAA';//'rgba(255,255,255,0.75)';

            document.addEventListener( 'mouseup', this, false );
            document.addEventListener( 'mousemove', this, false );

        }
        if(e.target.name === 'bottom'){

            this.isOpen = this.isOpen ? false : true;

            this.show();
            //this.calc();

        }
        
    },

    move: function( e ){

        if(!this.isDown) return;

        this.scroll.style.background = '#AAAAAA';

        this.update( (e.clientY-this.top)-(this.sh*0.5) );

    },

    

    out: function( e ){

        if( !e.target.name ) return;

        if(e.target.name === 'scroll'){
            this.scroll.style.background = '#666666';
        }

    },

    up: function( e ){

        this.isDown = false;
        this.scroll.style.background = '#666666';
        document.removeEventListener( 'mouseup', this, false );
        document.removeEventListener( 'mousemove', this, false );

    },

    over: function( e ){

        if( !e.target.name ) return;
        if(e.target.name === 'scroll'){
            this.scroll.style.background = '#888888';
        }

    },

    wheel: function ( e ){

        if( this.lockwheel ) return;
        if( !this.isScroll ) return;

        var x = e.clientX;
        var px = this.content.getBoundingClientRect().left

        if(x<px) return;
        if(x>(px+this.width)) return;

        var delta = 0;
        if(e.wheelDeltaY) delta= -e.wheelDeltaY*0.04;
        else if(e.wheelDelta) delta= -e.wheelDelta*0.2;
        else if(e.detail) delta=e.detail*4.0;

        this.py += delta;

        this.update(this.py);

    },

    ////

    update: function ( y ){

        y = y < 0 ? 0 :y;
        y = y > this.range ? this.range : y;

        this.inner.style.top = -(y/this.ratio)+'px';
        this.scroll.style.top = y + 'px';

        this.py = y;

    },

    ////

    add:function( type, o ){
        
        if( o.isUI === undefined ) o.isUI = true;

        type = type[0].toUpperCase() + type.slice(1);
        var n = new UIL[type](o);
        this.uis.push( n );
        this.calc();
        
        return n;
    },

    ////

    resize:function(e){

        this.calc();
        this.testHeight();

    },

    remove: function ( n ) { 

        var i = this.uis.indexOf( n ); 
        if ( i !== -1 ) { 
            this.uis[i].clear();
            this.uis.splice( i, 1 ); 
        }

    },

    clear:function(){

        this.update( 0 );
        var i = this.uis.length;
        while(i--){
            this.uis[i].clear();
            this.uis[i] = null;
            this.uis.pop();
        }
        this.uis = [];
        this.calc();

    },

    showScroll:function(h){

        this.isScroll = true;

        this.total = this.height-20;
        this.maxView = this.maxHeight-20;

        this.ratio = this.maxView / this.total;
        this.sh = this.maxView * this.ratio;

        if(this.sh<20) this.sh = 20;

        this.range = this.maxView - this.sh;

        this.scrollBG.style.display = 'block';

        this.scrollBG.style.height = this.maxView + 'px';
        this.scroll.style.height = this.sh + 'px';

        this.update( 0 );
    },

    hideScroll:function(){

        this.isScroll = false;
        this.update( 0 );
        this.scrollBG.style.display = 'none';

    },

    calc:function(ny) {

        if( ny !== undefined ){
            this.height += ny;
            this.content.style.height = this.height+'px';
        } else {
            var total = this.inner.offsetHeight;
            this.height = total+20;
            this.content.style.height = this.height+'px';

            if(  this.bottom.textContent !== 'close' ) this.bottom.textContent = 'close';
        }

        this.tmp = setTimeout( this.testHeight.bind(this), 10);

    },

    testHeight:function(){

        if(this.tmp) clearTimeout(this.tmp);

        this.top = this.content.getBoundingClientRect().top;
        this.maxHeight = window.innerHeight - this.top;// - 10;

        if(this.height>this.maxHeight){

            this.content.style.height = this.maxHeight+'px';
            this.bottom.style.background = UIL.bgcolor( this.color, 1 );
            this.showScroll();

        }else{
            this.hideScroll();
            this.bottom.style.background = UIL.bgcolor( this.color );
        }

    },

    changeWidth:function() {

        this.width = UIL.WIDTH;
        this.content.style.width = this.width + 'px';

        if( this.isCenter ){ 

            this.content.style.marginLeft = -(~~ (UIL.WIDTH*0.5)) + 'px';
        }

        var i = this.uis.length;
        while(i--){
            this.uis[i].setSize();
            //this.uis[i].rSize();
        }

        i = this.uis.length;
        while(i--){
            //this.uis[i].setSize();
            this.uis[i].rSize();
        }

        this.calc();

    },

    show:function(){

        if( this.isOpen ){
            this.inner.style.display = 'block';
            this.calc();
        }else{
            this.content.style.height = '20px';
            this.tmp = setTimeout( this.endHide.bind(this), 100 );
        }
        
    },

    endHide: function(){

        if( this.tmp ) clearTimeout(this.tmp);
        this.inner.style.display = 'none'; 
        this.bottom.textContent = 'open';

    }

};