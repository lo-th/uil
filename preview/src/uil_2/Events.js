
// ----------------------
//  Event dispatcher
// ----------------------

UIL.Events = function ( root, element ) {

    this.root = root;

    /*element.addEventListener( 'dblclick',   this, false );
    element.addEventListener( 'mousedown',  this, false );
    element.addEventListener( 'mousemove',  this, false );
    element.addEventListener( 'mouseout',   this, false );
    element.addEventListener( 'mouseup',    this, false );
    element.addEventListener( 'mouseover',  this, false );
    element.addEventListener( 'mousewheel', this, false );

    element.addEventListener( 'keydown',    this, false );
    element.addEventListener( 'keyup',      this, false );
    element.addEventListener( 'focus',      this, false );
    element.addEventListener( 'blur',       this, false );*/

    document.addEventListener( 'dblclick',   this, false );
    document.addEventListener( 'mousemove',  this, false );
    document.addEventListener( 'mousedown',  this, false );
    document.addEventListener( 'mouseup',    this, false );
   // document.addEventListener( 'mouseout',   this, false );
    
   /// document.addEventListener( 'mouseover',  this, false );
    document.addEventListener( 'mousewheel', this, false );

    document.addEventListener( 'keydown',    this, false );
    document.addEventListener( 'keyup',      this, false );
    //document.addEventListener( 'focus',      this, false );
    //document.addEventListener( 'blur',       this, false );

    document.addEventListener( 'dragstart',      this, false );

    window.addEventListener("resize", this, false );

};

UIL.Events.prototype = {

    constructor: UIL.Events,

    /*add : function ( t ) {

        this.targets.push( t );

    },

    clear: function () {

        this.targets = [];

    },*/

    handleEvent : function ( e ) {

        e = e || window.event;

        if( type === 'dragstart' ) return false;

        if(e.stopPropagation) e.stopPropagation();
        if(e.preventDefault) e.preventDefault();

        var type = e.type.substring(0,5);

        if( type === 'mouse' ){
            if(e.type === 'mousewheel' ){
                var delta;
                if(e.wheelDeltaY) delta = -e.wheelDeltaY*0.04;
                else if(e.wheelDelta) delta = -e.wheelDelta*0.2;
                else if(e.detail) delta = e.detail*4.0;
                this.root.mouse.delta = delta;
            } else {
                if(e.type === 'mousedown' ) this.root.mouse.down = 1;
                if(e.type === 'mouseup' ) this.root.mouse.down = 0;
                if( !this.root.is3d ) this.root.mouse.set( e.clientX, e.clientY );
                this.root.mouseAction();

                //if(this.root.mouse.over(this.root)) debug.innerHTML = 'x:'+this.root.mouse.x+' y:'+this.root.mouse.y;
                //else debug.innerHTML = 'none'
            }
            
        } else {
             if( this.root[ e.type ] ) this.root[ e.type ]( e );
        }


       

    },

};


 UIL.Mouse = function () {

    this.down = 0;

    this.ox = 0;
    this.oy = 0;

    this.x = 0;
    this.y = 0;

    this.dx = 0;
    this.dy = 0;

    this.sy = 0;

    this.delta = 0;

    this.clientX = 0;
    this.clientY = 0;

};

UIL.Mouse.prototype = {

    set: function ( x, y ) {

        this.ox = x;
        this.oy = y;

        this.x = this.ox - this.dx;
        this.y = this.oy - this.dy;

        this.clientX = this.x;
        this.clientY = this.y;

    },

    setDecal: function ( x, y ) {

        this.dx = x;
        this.dy = y;
    
    },

    setScroll: function (y) {

        this.sy = y;

    },

    setCursor:function( name ){
        document.body.style.cursor = name;
    },

    defCursor:function(){
        document.body.style.cursor = 'auto';
    },

    over: function ( obj ) {

        var o = obj.zone, x = this.ox, y = this.oy;
        return ( x >= o.x ) && ( y >= o.y ) && ( x <= o.x + o.w ) && ( y <= o.y + o.h );

    }

}