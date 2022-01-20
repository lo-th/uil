import { Roots } from './Roots.js';
import { Tools } from './Tools.js';
import { add } from './add.js';
import { V2 } from './V2.js';

/**
 * @author lth / https://github.com/lo-th
 */

export class Gui {

    constructor( o = {} ) {

        this.isGui = true

        this.name = 'gui'

        // for 3d
        this.canvas = null
        this.screen = null
        this.plane = o.plane || null

        this.isEmpty = true

        // color
        if( o.config ) o.colors = o.config
        
        if ( o.colors ) this.setConfig( o.colors )
        else this.colors = Tools.defineColor( o )

        // style
        this.css = Tools.cloneCss()

        this.isReset = true
        this.tmpAdd = null
        //this.tmpH = 0

        this.isCanvas = o.isCanvas || false
        this.isCanvasOnly = false
        
        this.callback = o.callback  === undefined ? null : o.callback

        this.forceHeight = o.maxHeight || 0
        this.lockHeight = o.lockHeight || false

        this.isItemMode = o.itemMode !== undefined ? o.itemMode : false

        this.cn = ''
        
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
        //this.prevY = -1;
        this.sw = 0;

        

        // bottom and close height
        this.isWithClose = o.close !== undefined ? o.close : true;
        this.bh = !this.isWithClose ? 0 : this.size.h;

        this.autoResize = o.autoResize === undefined ? true : o.autoResize;

        // default position
        this.isCenter = o.center || false
        this.cssGui = o.css !== undefined ? o.css : (this.isCenter ? '' : 'right:10px;')

        this.isOpen = o.open !== undefined ? o.open : true;
        this.isDown = false;
        this.isScroll = false;

        this.uis = [];

        this.current = -1;
        this.target = null;
        this.decal = 0;
        this.ratio = 1;
        this.oy = 0;


        this.isNewTarget = false;

        let cc = this.colors

        this.content = Tools.dom( 'div', this.css.basic + ' width:0px; height:auto; top:0px; background:'+cc.content+'; ' + this.cssGui );

        this.innerContent = Tools.dom( 'div', this.css.basic + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
        //this.innerContent = Tools.dom( 'div', this.css.basic + this.css.button + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
        this.content.appendChild( this.innerContent );

        //this.inner = Tools.dom( 'div', this.css.basic + 'width:100%; left:0; ')
        this.useFlex = true 
        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : '' //' display:flex; justify-content:start; align-items:start;flex-direction: column; justify-content: center; align-items: center;';
        this.inner = Tools.dom( 'div', this.css.basic + flexible + 'width:100%; left:0; ');
        this.innerContent.appendChild(this.inner);

        // scroll
        this.scrollBG = Tools.dom( 'div', this.css.basic + 'right:0; top:0; width:'+ (this.size.s - 1) +'px; height:10px; display:none; background:'+cc.background+';');
        this.content.appendChild( this.scrollBG );

        this.scroll = Tools.dom( 'div', this.css.basic + 'background:'+cc.button+'; right:2px; top:0; width:'+(this.size.s-4)+'px; height:10px;');
        this.scrollBG.appendChild( this.scroll );

        // bottom button
        this.bottomText = o.bottomText || ['open', 'close'];

        let r = cc.radius;
        this.bottom = Tools.dom( 'div',  this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:'+r+'px; border-bottom-left-radius:'+r+'px; justify-content:center; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px; color:' + cc.text+';' );// border-top:1px solid '+Tools.colors.stroke+';');
        this.content.appendChild( this.bottom )
        this.bottom.textContent = this.isOpen ? this.bottomText[1] : this.bottomText[0]
        this.bottom.style.background = cc.background

        //

        this.parent = o.parent !== undefined ? o.parent : null;
        this.parent = o.target !== undefined ? o.target : this.parent;
        
        if( this.parent === null && !this.isCanvas ){ 
        	this.parent = document.body
        }

        if( this.parent !== null ) this.parent.appendChild( this.content );

        if( this.isCanvas && this.parent === null ) this.isCanvasOnly = true;

        if( !this.isCanvasOnly ){ 
            this.content.style.pointerEvents = 'auto';
        } else {
            this.content.style.left = '0px';
            this.content.style.right = 'auto';
            o.transition = 0
        }


        // height transition
        this.transition = o.transition || Tools.transition
        if( this.transition ) setTimeout( this.addTransition.bind( this ), 0 );
        

        this.setWidth();

        if( this.isCanvas ) this.makeCanvas();

        Roots.add( this );

    }

    setTop( t, h ) {

        this.content.style.top = t + 'px';
        if( h !== undefined ) this.forceHeight = h;
        this.calc();

        Roots.needReZone = true;

    }

    addTransition(){

        if( this.transition && !this.isCanvas ){
            this.innerContent.style.transition = 'height '+this.transition+'s ease-out';
            this.content.style.transition = 'height '+this.transition+'s ease-out';
            this.bottom.style.transition = 'top '+this.transition+'s ease-out';
            //this.bottom.addEventListener("transitionend", Roots.resize, true);
        }

    }

    // ----------------------
    //   CANVAS
    // ----------------------

    onDraw () {}

    makeCanvas () {

    	this.canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', "canvas" );
    	this.canvas.width = this.zone.w;
    	this.canvas.height = this.forceHeight ? this.forceHeight : this.zone.h;

        //console.log( this.canvas.width, this.canvas.height )

    }

    draw ( force ) {

    	if( this.canvas === null ) return;

    	let w = this.zone.w;
    	let h = this.forceHeight ? this.forceHeight : this.zone.h;
    	Roots.toCanvas( this, w, h, force );

    }

    //////

    getDom () {

        return this.content;

    }

    noMouse () {

        this.mouse.neg();

    }

    setMouse ( uv, flip = true ) {

        if(flip) this.mouse.set( Math.round( uv.x * this.canvas.width ), this.canvas.height - Math.round( uv.y * this.canvas.height ) );
        else this.mouse.set( Math.round( uv.x * this.canvas.width ), Math.round( uv.y * this.canvas.height ) );
        //this.mouse.set( m.x, m.y );

    }

    setConfig ( o ) {

        // reset to default text 
        Tools.setText()
        this.colors = Tools.defineColor( o )

    }

    setColors ( o ) {

        for( let c in o ){
            if( this.colors[c] ) this.colors[c] = o[c];
        }

    }

    setText ( size, color, font, shadow ) {

        Tools.setText( size, color, font, shadow );

    }

    hide ( b ) {

        this.content.style.display = b ? 'none' : 'block';
        
    }

    onChange ( f ) {

        this.callback = f || null;
        return this;

    }

    // ----------------------
    //   STYLES
    // ----------------------

    mode ( n ) {

    	let needChange = false;
        let cc = this.colors;

    	if( n !== this.cn ){

	    	this.cn = n;

	    	switch( n ){

	    		case 'def':
                   Roots.cursor();
	    		   this.scroll.style.background = cc.button; 
	    		   this.bottom.style.background = cc.background
	    		   this.bottom.style.color = cc.text
	    		break;

	    		//case 'scrollDef': this.scroll.style.background = this.colors.scroll; break;
	    		case 'scrollOver': 
                    Roots.cursor('ns-resize');
                    this.scroll.style.background = cc.select
                break;
	    		case 'scrollDown': 
                    this.scroll.style.background = cc.select
                break;

	    		//case 'bottomDef': this.bottom.style.background = this.colors.background; break;
	    		case 'bottomOver': 
                    Roots.cursor('pointer');
                    this.bottom.style.background = cc.backgroundOver; 
                    this.bottom.style.color = cc.textOver; 
                break;
	    		//case 'bottomDown': this.bottom.style.background = this.colors.select; this.bottom.style.color = '#000'; break;

	    	}

	    	needChange = true;

	    }

    	return needChange;

    }

    // ----------------------
    //   TARGET
    // ----------------------

    clearTarget () {

    	if( this.current === -1 ) return false;
        if( this.target.s ){
            // if no s target is delete !!
            this.target.uiout();
            this.target.reset();
        }
        
        this.target = null;
        this.current = -1;

        ///console.log(this.isDown)//if(this.isDown)Roots.clearInput();

        

        Roots.cursor();
        return true;

    }

    // ----------------------
    //   ZONE TEST
    // ----------------------

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        this.isReset = false;

        let name = '';

        let s = this.isScroll ?  this.zone.w - this.size.s : this.zone.w;
        
        if( l.y > this.zone.h - this.bh &&  l.y < this.zone.h ) name = 'bottom';
        else name = l.x > s ? 'scroll' : 'content';

        return name;

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent ( e ) {

    	let type = e.type;

    	let change = false;
    	let targetChange = false;

    	let name = this.testZone( e );

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
		            this.bottom.textContent = this.isOpen ? this.bottomText[1] : this.bottomText[0];
		            //this.setHeight();
                    this.calc();
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

    }

    getNext ( e, change ) {



        let next = Roots.findTarget( this.uis, e );

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

    }

    onWheel ( e ) {

        this.oy += 20*e.delta;
        this.update( this.oy );
        return true;

    }

    // ----------------------
    //   RESET
    // ----------------------

    reset ( force ) {

        if( this.isReset ) return;

        //this.resetItem();

        this.mouse.neg();
        this.isDown = false;

        //Roots.clearInput();
        let r = this.mode('def');
        let r2 = this.clearTarget();

        if( r || r2 ) this.draw( true );

        this.isReset = true;

        //Roots.lock = false;

    }

    // ----------------------
    //   ADD NODE
    // ----------------------

    add () {

        let a = arguments
        let ontop = false

        if( typeof a[1] === 'object' ){ 

            a[1].isUI = true;
            a[1].main = this;

            ontop = a[1].ontop ? a[1].ontop : false;

        } else if( typeof a[1] === 'string' ){

            if( a[2] === undefined ) [].push.call(a, { isUI:true, main:this });
            else {
                a[2].isUI = true;
                a[2].main = this;
                //ontop = a[1].ontop ? a[1].ontop : false;
                ontop = a[2].ontop ? a[2].ontop : false
            }
            
        } 

        let u = add.apply( this, a )

        if( u === null ) return;

        if( ontop ) this.uis.unshift( u )
        else this.uis.push( u )

        /*if( !u.autoWidth ){
            let y = u.c[0].getBoundingClientRect().top;
            if( this.prevY !== y ){
                this.calc( u.h + 1 );
                this.prevY = y;
            }
        }else{
            this.prevY = 0;//-1;
            this.calc( u.h + 1 );
        }*/

        this.calc()

        this.isEmpty = false

        return u

    }

    /*applyCalc () {

        //console.log(this.uis.length, this.tmpH )

        this.calc( this.tmpH );
        //this.tmpH = 0;
        this.tmpAdd = null;

    }*/

    

    // remove one node

    remove ( n ) {

        if( n.dispose ) n.dispose();

    }

    // call after uis clear

    clearOne ( n ) { 

        let id = this.uis.indexOf( n ); 
        if ( id !== -1 ) {
            //this.calc( - (this.uis[ id ].h + 1 ) );
            this.inner.removeChild( this.uis[ id ].c[0] );
            this.uis.splice( id, 1 );
            this.calc() 
        }

    }

    // clear all gui

    empty() {

        //this.close();

        let i = this.uis.length, item;

        while( i-- ){
            item = this.uis.pop();
            this.inner.removeChild( item.c[0] );
            item.dispose()

            //this.uis[i].clear()
        }

        this.uis = [];
        this.isEmpty = true;
        //this.zone = { x:0, y:0, w:this.size.w, h:0 };
        //this.setWidth()
        //Roots.listens = [];
        this.calc();



    }

    clear() {

        this.empty()

    }

    dispose() {

        this.clear();
        if( this.parent !== null ) this.parent.removeChild( this.content );
        Roots.remove( this );

    }

    // ----------------------
    //   ITEMS SPECIAL
    // ----------------------


    resetItem () {

        if( !this.isItemMode ) return;

        let i = this.uis.length;
        while(i--) this.uis[i].selected();

    }

    setItem ( name ) {

        if( !this.isItemMode ) return;

        name = name || '';

        this.resetItem();

        if( !name ){
            this.update(0);
            return;
        } 

        let i = this.uis.length;
        while(i--){ 
            if( this.uis[i].value === name ){ 
                this.uis[i].selected( true );
                if( this.isScroll ) this.update( ( i*(this.uis[i].h+1) )*this.ratio );
            }
        }

    }



    // ----------------------
    //   SCROLL
    // ----------------------

    upScroll ( b ) {

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

    }

    update ( y ) {

        y = Tools.clamp( y, 0, this.range );

        this.decal = Math.floor( y / this.ratio );
        this.inner.style.top = - this.decal + 'px';
        this.scroll.style.top = Math.floor( y ) + 'px';
        this.oy = y;

    }

    // ----------------------
    //   RESIZE FUNCTION
    // ----------------------

    calcUis() {
        
        return Roots.calcUis( this.uis, this.zone, this.zone.y )
    }

    calc() {

        clearTimeout( this.tmp )
        this.tmp = setTimeout( this.setHeight.bind( this ), 10 )

    }

    setHeight() {

        if( this.tmp ) clearTimeout( this.tmp )

        this.zone.h = this.bh
        this.isScroll = false

        if( this.isOpen ){

            this.h = this.calcUis()

            let hhh = this.forceHeight ? this.forceHeight + this.zone.y : window.innerHeight;

            this.maxHeight = hhh - this.zone.y - this.bh;

            let diff = this.h - this.maxHeight;

            if( diff > 1 ){ //this.h > this.maxHeight ){

                this.isScroll = true;
                this.zone.h = this.maxHeight + this.bh;

            } else {

                this.zone.h = this.h + this.bh;
                
            }

        }

        //if( this.forceHeight ) this.zone.h = this.forceHeight

        this.upScroll( this.isScroll )

        this.innerContent.style.height = this.zone.h - this.bh + 'px'
        this.content.style.height = this.zone.h + 'px'
        this.bottom.style.top = this.zone.h - this.bh + 'px'


        if( this.forceHeight && this.lockHeight ) this.content.style.height = this.forceHeight + 'px';

        //console.log( this.zone, this.bh )

        //if( this.isOpen ) this.calcUis()
        if( this.isCanvas ) this.draw( true )
        //else if( !this.transition ) this.rezone()

    }

    rezone () {
        Roots.needReZone = true;
    }

    setWidth ( w ) {

        if( w ) this.zone.w = w;

        this.zone.w = Math.floor( this.zone.w )

        //console.log( this.zone.w )

        this.content.style.width = this.zone.w + 'px';

        if( this.isCenter ) this.content.style.marginLeft = -(Math.floor(this.zone.w*0.5)) + 'px';

        this.setItemWidth( this.zone.w - this.sw );

        //this.setHeight();
        //this.calc()

        //if( this.isCanvasOnly ) Roots.needReZone = true;
        //Roots.resize();

    }

    setItemWidth ( w ) {

        let i = this.uis.length;
        while(i--){
            this.uis[i].setSize( w )
            this.uis[i].rSize()
        }

    }

}