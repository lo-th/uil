
import { Roots } from './Roots';
import { Tools } from './Tools';
import { add } from './add';
import { V2 } from './V2';

/**
 * @author lth / https://github.com/lo-th
 */

function Gui ( o ) {

    this.canvas = null;

    o = o || {};

    // color
    this.colors = Tools.cloneColor();
    this.css = Tools.cloneCss();


    if( o.config ) this.setConfig( o.config );


    this.bg = o.bg || this.colors.background;

    if( o.transparent !== undefined ){
        this.colors.background = 'none';
        this.colors.backgroundOver = 'none';
    }

    //if( o.callback ) this.callback =  o.callback;

    this.isReset = true;

    this.tmpAdd = null;
    this.tmpH = 0;

    this.isCanvas = o.isCanvas || false;
    this.isCanvasOnly = false;
    this.cssGui = o.css !== undefined ? o.css : '';
    this.callback = o.callback  === undefined ? null : o.callback;

    this.forceHeight = o.maxHeight || 0;
    this.lockHeight = o.lockHeight || false;

    this.isItemMode = o.itemMode !== undefined ? o.itemMode : false;

    this.cn = '';
    
    // size define
    this.size = Tools.size;
    if( o.p !== undefined ) this.size.p = o.p;
    if( o.w !== undefined ) this.size.w = o.w;
    if( o.h !== undefined ) this.size.h = o.h;
    if( o.s !== undefined ) this.size.s = o.s;

    this.size.h = this.size.h < 11 ? 11 : this.size.h;

    // local mouse and zone
    this.local = new V2().neg();
    this.zone = { x:0, y:0, w:this.size.w, h:0 };

    // virtual mouse
    this.mouse = new V2().neg();

    this.h = 0;
    this.prevY = -1;
    this.sw = 0;

    

    // bottom and close height
    this.isWithClose = o.close !== undefined ? o.close : true;
    this.bh = !this.isWithClose ? 0 : this.size.h;

    this.autoResize = o.autoResize === undefined ? true : o.autoResize;
    
    this.isCenter = o.center || false;
    this.isOpen = true;
    this.isDown = false;
    this.isScroll = false;

    this.uis = [];

    this.current = -1;
    this.target = null;
    this.decal = 0;
    this.ratio = 1;
    this.oy = 0;



    this.isNewTarget = false;

    this.content = Tools.dom( 'div', this.css.basic + ' width:0px; height:auto; top:0px; ' + this.cssGui );

    this.innerContent = Tools.dom( 'div', this.css.basic + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
    this.content.appendChild( this.innerContent );

    this.inner = Tools.dom( 'div', this.css.basic + 'width:100%; left:0; ');
    this.innerContent.appendChild(this.inner);

    // scroll
    this.scrollBG = Tools.dom( 'div', this.css.basic + 'right:0; top:0; width:'+ (this.size.s - 1) +'px; height:10px; display:none; background:'+this.bg+';');
    this.content.appendChild( this.scrollBG );

    this.scroll = Tools.dom( 'div', this.css.basic + 'background:'+this.colors.scroll+'; right:2px; top:0; width:'+(this.size.s-4)+'px; height:10px;');
    this.scrollBG.appendChild( this.scroll );

    // bottom button
    this.bottom = Tools.dom( 'div',  this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:10px;  border-bottom-left-radius:10px; text-align:center; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px; border-top:1px solid '+Tools.colors.stroke+';');
    this.content.appendChild( this.bottom );
    this.bottom.textContent = 'close';
    this.bottom.style.background = this.bg;

    //

    this.parent = o.parent !== undefined ? o.parent : null;
    
    if( this.parent === null && !this.isCanvas ){ 
    	this.parent = document.body;
        // default position
    	if( !this.isCenter ) this.content.style.right = '10px'; 
    }

    if( this.parent !== null ) this.parent.appendChild( this.content );

    if( this.isCanvas && this.parent === null ) this.isCanvasOnly = true;

    if( !this.isCanvasOnly ) this.content.style.pointerEvents = 'auto';


    this.setWidth();

    if( this.isCanvas ) this.makeCanvas();

    Roots.add( this );

}

Object.assign( Gui.prototype, {

    constructor: Gui,

    isGui: true,

    setTop: function ( t, h ) {

        this.content.style.top = t + 'px';
        if( h !== undefined ) this.forceHeight = h;
        this.setHeight();

    },

    //callback: function () {},

    dispose: function () {

        this.clear();
        if( this.parent !== null ) this.parent.removeChild( this.content );
        Roots.remove( this );

    },

    // ----------------------
    //   CANVAS
    // ----------------------

    onDraw: function () { },

    makeCanvas: function () {

    	this.canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', "canvas" );
    	this.canvas.width = this.zone.w;
    	this.canvas.height = this.forceHeight ? this.forceHeight : this.zone.h;

    },

    draw: function ( force ) {

    	if( this.canvas === null ) return;

    	var w = this.zone.w;
    	var h = this.forceHeight ? this.forceHeight : this.zone.h;
    	Roots.toCanvas( this, w, h, force );

    },

    //////

    getDom: function () {

        return this.content;

    },

    setMouse: function( m ){

        this.mouse.set( m.x, m.y );

    },

    setConfig: function ( o ) {

        this.setColors( o );
        this.setText( o.fontSize, o.text, o.font, o.shadow );

    },

    setColors: function ( o ) {

        for( var c in o ){
            if( this.colors[c] ) this.colors[c] = o[c];
        }

    },

    setText: function ( size, color, font, shadow ) {

        Tools.setText( size, color, font, shadow, this.colors, this.css );

    },

    hide: function ( b ) {

        this.content.style.display = b ? 'none' : 'block';
        
    },

    onChange: function ( f ) {

        this.callback = f;
        return this;

    },

    // ----------------------
    //   STYLES
    // ----------------------

    mode: function ( n ) {

    	var needChange = false;

    	if( n !== this.cn ){

	    	this.cn = n;

	    	switch( n ){

	    		case 'def': 
	    		   this.scroll.style.background = this.colors.scroll; 
	    		   this.bottom.style.background = this.colors.background;
	    		   this.bottom.style.color = this.colors.text;
	    		break;

	    		//case 'scrollDef': this.scroll.style.background = this.colors.scroll; break;
	    		case 'scrollOver': this.scroll.style.background = this.colors.select; break;
	    		case 'scrollDown': this.scroll.style.background = this.colors.down; break;

	    		//case 'bottomDef': this.bottom.style.background = this.colors.background; break;
	    		case 'bottomOver': this.bottom.style.background = this.colors.backgroundOver; this.bottom.style.color = '#FFF'; break;
	    		//case 'bottomDown': this.bottom.style.background = this.colors.select; this.bottom.style.color = '#000'; break;

	    	}

	    	needChange = true;

	    }

    	return needChange;

    },

    // ----------------------
    //   TARGET
    // ----------------------

    clearTarget: function () {

    	if( this.current === -1 ) return false;
        //if(!this.target) return;
        this.target.uiout();
        this.target.reset();
        this.target = null;
        this.current = -1;

        ///console.log(this.isDown)//if(this.isDown)Roots.clearInput();

        

        Roots.cursor();
        return true;

    },

    // ----------------------
    //   ZONE TEST
    // ----------------------

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        this.isReset = false;

        var name = '';

        var s = this.isScroll ?  this.zone.w  - this.size.s : this.zone.w;
        
        if( l.y > this.zone.h - this.bh &&  l.y < this.zone.h ) name = 'bottom';
        else name = l.x > s ? 'scroll' : 'content';

        return name;

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent: function ( e ) {

    	var type = e.type;

    	var change = false;
    	var targetChange = false;

    	var name = this.testZone( e );

        

    	if( type === 'mouseup' && this.isDown ) this.isDown = false;
    	if( type === 'mousedown' && !this.isDown ) this.isDown = true;

        if( this.isDown && this.isNewTarget ){ Roots.clearInput(); this.isNewTarget=false; }

    	if( !name ) return;

    	switch( name ){

    		case 'content':

                e.clientY = this.isScroll ?  e.clientY + this.decal : e.clientY;

                if( Roots.isMobile && type === 'mousedown' ) this.getNext( e, change );

	    		if( this.target ) targetChange = this.target.handleEvent( e );

	    		if( type === 'mousemove' ) change = this.mode('def');
                if( type === 'wheel' && !targetChange && this.isScroll ) change = this.onWheel( e );
               
	    		if( !Roots.lock ) {
                    this.getNext( e, change );
                }

    		break;
    		case 'bottom':

	    		this.clearTarget();
	    		if( type === 'mousemove' ) change = this.mode('bottomOver');
	    		if( type === 'mousedown' ) {
	    			this.isOpen = this.isOpen ? false : true;
		            this.bottom.textContent = this.isOpen ? 'close' : 'open';
		            this.setHeight();
		            this.mode('def');
		            change = true;
	    		}

    		break;
    		case 'scroll':

	    		this.clearTarget();
	    		if( type === 'mousemove' ) change = this.mode('scrollOver');
	    		if( type === 'mousedown' ) change = this.mode('scrollDown'); 
                if( type === 'wheel' ) change = this.onWheel( e ); 
	    		if( this.isDown ) this.update( (e.clientY-this.zone.y)-(this.sh*0.5) );

    		break;


    	}

    	if( this.isDown ) change = true;
    	if( targetChange ) change = true;

        if( type === 'keyup' ) change = true;
        if( type === 'keydown' ) change = true;

    	if( change ) this.draw();

    },

    getNext: function ( e, change ) {



        var next = Roots.findTarget( this.uis, e );

        if( next !== this.current ){
            this.clearTarget();
            this.current = next;
            change = true;

            this.isNewTarget = true;

        }

        if( next !== -1 ){ 
            this.target = this.uis[ this.current ];
            this.target.uiover();
        }

    },

    onWheel: function ( e ) {

        this.oy += 20*e.delta;
        this.update( this.oy );
        return true;

    },

    // ----------------------
    //   RESET
    // ----------------------

    reset: function ( force ) {

        if( this.isReset ) return;

        //this.resetItem();

        this.mouse.neg();
        this.isDown = false;

        //Roots.clearInput();
        var r = this.mode('def');
        var r2 = this.clearTarget();

        if( r || r2 ) this.draw( true );

        this.isReset = true;

        //Roots.lock = false;

    },

    // ----------------------
    //   ADD NODE
    // ----------------------

    add: function () {

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

        var u = add.apply( this, a );

        if( u === null ) return;


        //var n = add.apply( this, a );
        //var n = UIL.add( ...args );

        this.uis.push( u );
        //n.py = this.h;

        if( !u.autoWidth ){
            var y = u.c[0].getBoundingClientRect().top;
            if( this.prevY !== y ){
                this.calc( u.h + 1 );
                this.prevY = y;
            }
        }else{
            this.prevY = 0;//-1;
            this.calc( u.h + 1 );
        }

        return u;

    },

    applyCalc: function () {

        //console.log(this.uis.length, this.tmpH )

        this.calc( this.tmpH );
        //this.tmpH = 0;
        this.tmpAdd = null;

    },

    calcUis: function () {

        Roots.calcUis( this.uis, this.zone, this.zone.y );

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

    clear: function () {

        var i = this.uis.length;
        while(i--) this.uis[i].clear();

        this.uis = [];
        Roots.listens = [];

        this.calc( -this.h );

    },

    // ----------------------
    //   ITEMS SPECIAL
    // ----------------------


    resetItem: function () {

        if( !this.isItemMode ) return;

        var i = this.uis.length;
        while(i--) this.uis[i].selected();

    },

    setItem: function ( name ) {

        if( !this.isItemMode ) return;

        this.resetItem();

        var i = this.uis.length;
        while(i--){ 
            if( this.uis[i].value  === name ){ 
                this.uis[i].selected( true );
                if( this.isScroll ) this.update( ( i*(this.size.h+1) )*this.ratio );
            }
        }

    },



    // ----------------------
    //   SCROLL
    // ----------------------

    upScroll: function ( b ) {

        this.sw = b ? this.size.s : 0;
        this.oy = b ? this.oy : 0;
        this.scrollBG.style.display = b ? 'block' : 'none';

        if( b ){

            this.total = this.h;

            this.maxView = this.maxHeight;

            this.ratio = this.maxView / this.total;
            this.sh = this.maxView * this.ratio;

            //if( this.sh < 20 ) this.sh = 20;

            this.range = this.maxView - this.sh;

            this.oy = Tools.clamp( this.oy, 0, this.range );

            this.scrollBG.style.height = this.maxView + 'px';
            this.scroll.style.height = this.sh + 'px';

        }

        this.setItemWidth( this.zone.w - this.sw );
        this.update( this.oy );

    },

    update: function ( y ) {

        y = Tools.clamp( y, 0, this.range );

        this.decal = Math.floor( y / this.ratio );
        this.inner.style.top = - this.decal + 'px';
        this.scroll.style.top = Math.floor( y ) + 'px';
        this.oy = y;

    },

    // ----------------------
    //   RESIZE FUNCTION
    // ----------------------

    calc: function ( y ) {

        this.h += y;
        clearTimeout( this.tmp );
        this.tmp = setTimeout( this.setHeight.bind(this), 10 );

    },

    setHeight: function () {

        if( this.tmp ) clearTimeout( this.tmp );

        //console.log(this.h )

        this.zone.h = this.bh;
        this.isScroll = false;

        if( this.isOpen ){

            var hhh = this.forceHeight ? this.forceHeight + this.zone.y : window.innerHeight;

            this.maxHeight = hhh - this.zone.y - this.bh;

            var diff = this.h - this.maxHeight;

            //console.log(diff)

            if( diff > 1 ){ //this.h > this.maxHeight ){

                this.isScroll = true;
                this.zone.h = this.maxHeight + this.bh;

            } else {

                this.zone.h = this.h + this.bh;
                
            }

        }

        this.upScroll( this.isScroll );

        this.innerContent.style.height = this.zone.h - this.bh + 'px';
        this.content.style.height = this.zone.h + 'px';
        this.bottom.style.top = this.zone.h - this.bh + 'px';

        if( this.forceHeight && this.lockHeight ) this.content.style.height = this.forceHeight + 'px';

        if( this.isOpen ) this.calcUis();
        if( this.isCanvas ) this.draw( true );

    },

    setWidth: function ( w ) {

        if( w ) this.zone.w = w;

        this.content.style.width = this.zone.w + 'px';

        if( this.isCenter ) this.content.style.marginLeft = -(Math.floor(this.zone.w*0.5)) + 'px';

        this.setItemWidth( this.zone.w - this.sw );

        this.setHeight();

        if( !this.isCanvasOnly ) Roots.needReZone = true;
        //this.resize();

    },

    setItemWidth: function ( w ) {

        var i = this.uis.length;
        while(i--){
            this.uis[i].setSize( w );
            this.uis[i].rSize()
        }

    },


} );


export { Gui };