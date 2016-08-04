UIL.Gui = function( o ){

    o = o || {};

    //this.height = o.height || 20;

    if( o.Tpercent !== undefined ) UIL.P = o.Tpercent;
    if( o.css === undefined ) o.css = '';

    this.height = 20;
    this.width = o.width !== undefined ? o.width : UIL.WIDTH;
    this.width = o.size !== undefined ? o.size : UIL.WIDTH;
    //UIL.WIDTH = this.width;

    this.left = 0;
    this.top = o.top || 0;


    this.h = 0;//this.height;
    this.prevY = -1;

    // bottom and close height
    this.isWithClose = true;
    this.bh = o.bh || 20;

    if(o.close !== undefined ){
        this.isWithClose = o.close;
        this.bh = !this.isWithClose ? 0 : this.bh;
    }



    // scroll width
    this.sw = o.sw || 10;

    UIL.main = this;

    this.callback = o.callback  === undefined ? null : o.callback;

    this.color = o.color || UIL.COLOR;
    this.bg = o.bg || 'rgba(44,44,44,0.3)';
    
    this.isCenter = o.center || false;
    this.lockwheel = false;
    this.onWheel = false;
    this.isOpen = true;

    this.uis = [];

    this.content = UIL.DOM( null, 'div', UIL.BASIC + 'display:block; width:'+this.width+'px; height:auto; top:0; right:10px; transition:height 0.1s ease-out;' + o.css );
    document.body.appendChild( this.content );
    //this.content.style.background = UIL.bgcolor( this.color, 1, true );

    //this.top = this.content.getBoundingClientRect().top;

    this.innerContent = UIL.DOM( null, 'div', UIL.BASIC + 'width:100%; top:0; left:0; height:auto;');
    this.content.appendChild(this.innerContent);

    this.inner = UIL.DOM( null, 'div', UIL.BASIC + 'width:100%; top:0; left:0; height:auto;');
    this.innerContent.appendChild(this.inner);
    this.inner.name = 'inner';

    //this.scrollBG = UIL.DOM('UIL scroll-bg');
    this.scrollBG = UIL.DOM( null, 'div', UIL.BASIC + 'right:0; top:0; width:10px; height:10px; cursor:s-resize; pointer-events:auto; display:none;');
    this.content.appendChild(this.scrollBG);
    this.scrollBG.name = 'scroll';

    //this.scroll = UIL.DOM('UIL scroll');
    this.scroll = UIL.DOM( null, 'div', UIL.BASIC + 'background:#666; right:0; top:0; width:5px; height:10px;');
    this.scrollBG.appendChild( this.scroll );

    this.bottom = UIL.DOM( null, 'div',  UIL.TXT+'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:10px;  border-bottom-left-radius:10px; text-align:center; pointer-events:auto; cursor:pointer; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px;');
    this.content.appendChild(this.bottom);
    this.bottom.textContent = 'close';
    this.bottom.name = 'bottom';
    this.bottom.style.background = this.bg;
    
    this.isDown = false;
    this.isScroll = false;

    this.callbackClose = function(){};

    this.content.addEventListener( 'mousedown', this, false );
    this.content.addEventListener( 'mousemove', this, false );
    this.content.addEventListener( 'mouseout',  this, false );
    this.content.addEventListener( 'mouseup',   this, false );
    this.content.addEventListener( 'mouseover', this, false );
    //this.content.addEventListener( 'mousewheel', this, false );

    document.addEventListener( 'mousewheel', this, false );
    
    window.addEventListener("resize", function(e){this.resize(e)}.bind(this), false );

    //

    this.setWidth( this.width );

}

UIL.Gui.prototype = {
    constructor: UIL.Gui,

    hide : function (b) {

        if(b) this.content.style.display = 'none';
        else this.content.style.display = 'block';
        
    },

    setBG : function(c){

        this.bg = c;

        var i = this.uis.length;
        while(i--){
            this.uis[i].setBG(c);
        }

        this.bottom.style.background = c;

    },

    getHTML : function(){

        return this.content;

    },

    onChange : function( f ){

        this.callback = f;
        return this;

    },

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

    // Mouse event

    down: function( e ){

        if( !e.target.name ) return;

        if(e.target.name === 'scroll'){
            this.isDown = true;
            this.move( e );
            document.addEventListener( 'mouseup', this, false );
            document.addEventListener( 'mousemove', this, false );
        }
        if(e.target.name === 'bottom'){
            this.isOpen = this.isOpen ? false : true;
            this.bottom.textContent = this.isOpen ? 'close' : 'open';
            this.testHeight();
        }
        
    },

    move: function( e ){

        if(!this.isDown) return;
        this.scroll.style.background = '#AAA';
        this.update( (e.clientY-this.top)-(this.sh*0.5) );

    },

    

    out: function( e ){

        if( !e.target.name ) return;

        if(e.target.name === 'scroll'){
            this.scroll.style.background = '#666';
        }

        if(e.target.name === 'bottom'){
            this.bottom.style.color = '#CCC';
        }

    },

    up: function( e ){

        this.isDown = false;
        this.scroll.style.background = '#666';
        document.removeEventListener( 'mouseup', this, false );
        document.removeEventListener( 'mousemove', this, false );

    },

    over: function( e ){

        if( !e.target.name ) return;
        if(e.target.name === 'scroll'){
            this.scroll.style.background = '#888';
        }
        if(e.target.name === 'bottom'){
            this.bottom.style.color = '#FFF';
        }

    },

    // Wheel event

    wheel: function ( e ){

        e.preventDefault();
        e.stopPropagation();

        if( this.lockwheel || !this.isScroll ) return;

        //this.onWheel = true;

        var x = e.clientX;
        var px = this.content.getBoundingClientRect().left;

        if(x<px) return;
        if(x>(px+this.width)) return;

        var delta = 0;
        if(e.wheelDeltaY) delta = -e.wheelDeltaY*0.04;
        else if(e.wheelDelta) delta = -e.wheelDelta*0.2;
        else if(e.detail) delta =e.detail*4.0;

        this.py += delta;

        this.update( this.py );

    },

    // -----------------------------------

    // Add node to gui

    add:function(){

        var a = arguments;

        if( typeof a[1] === 'object' ){ 

            a[1].isUI = true;
            a[1].main = this;

        } else if( typeof a[1] === 'string' ){

            if( a[2] === undefined ) [].push.call(a, { isUI:true, main:this });
            else {
                a[2].isUI = true;
                a[2].main = this;
            }
            
        } 


        var n = UIL.add.apply( this, a );
        //var n = UIL.add( ...args );

        this.uis.push( n );
        n.py = this.h;

        if( !n.autoWidth ){
            var y = n.c[0].getBoundingClientRect().top;
            if( this.prevY !== y ){
                this.calc( n.h + 1 );
                this.prevY = y;
            }
        }else{
            this.prevY = -1;
            this.calc( n.h + 1 );
        }

        return n;
    },

    // remove one node

    remove: function ( n ) { 

        var i = this.uis.indexOf( n ); 
        if ( i !== -1 ) this.uis[i].clear();

    },

    // call after uis clear

    clearOne: function ( n ) { 

        var i = this.uis.indexOf( n ); 
        if ( i !== -1 ) {
            this.inner.removeChild( this.uis[i].c[0] );
            this.uis.splice( i, 1 ); 
        }

    },

    // clear all gui

    clear:function(){

        var i = this.uis.length;
        while(i--) this.uis[i].clear();

        this.uis = [];
        UIL.listens = [];

        this.calc( - this.h );

    },

    // -----------------------------------

    // Scroll

    update: function ( y ){

        y = y < 0 ? 0 :y;
        y = y > this.range ? this.range : y;

        this.inner.style.top = -( ~~ ( y / this.ratio ) ) + 'px';
        this.scroll.style.top = ( ~~ y ) + 'px';

        this.py = y;

        //this.onWheel = false;

    },

    showScroll:function(h){

        this.isScroll = true;

        this.total = this.h;
        this.maxView = this.maxHeight;// - this.height;

        this.ratio = this.maxView / this.total;
        this.sh = this.maxView * this.ratio;

        if( this.sh < 20 ) this.sh = 20;

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

    // -----------------------------------

    resize:function(e){

        this.testHeight();

    },

    calc:function( y ) {

        this.h += y;
        clearTimeout( this.tmp );
        this.tmp = setTimeout( this.testHeight.bind(this), 10);

    },

    testHeight:function(){

        if( this.tmp ) clearTimeout( this.tmp );

        this.height = this.top + this.bh;

        if( this.isOpen ){

            this.maxHeight = window.innerHeight - this.top - this.bh;

            if( this.h > this.maxHeight ){

                this.height = this.maxHeight + this.bh;
                this.showScroll();

            }else{

                this.height = this.h + this.bh;
                this.hideScroll();

            }

        } else {

            this.hideScroll();

        }

        this.innerContent.style.height = this.height - this.bh + 'px';
        this.content.style.height = this.height + 'px';
        this.bottom.style.top = this.height - this.bh + 'px';
        //this.zone.h = this.height;

    },

    setWidth:function( w ) {

        if( w ) this.width = w;
        this.content.style.width = this.width + 'px';

        //console.log(this.width)


        if( this.isCenter ) this.content.style.marginLeft = -(~~ (this.width*0.5)) + 'px';

        var l = this.uis.length;
        var i = l;
        while(i--){
            this.uis[i].setSize( this.width );
        }

        i = l;
        while(i--){
            this.uis[i].rSize();
        }

        this.resize();

    },


};