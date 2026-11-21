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

        

        // color
        if( o.config ) o.colors = o.config
        if ( o.colors ) this.setConfig( o.colors )
        else this.colors = Tools.defineColor( o )

        //this.cleanning = false
        

        // style
        this.css = Tools.cloneCss()

        this.isReset = true
        this.tmpAdd = null
        //this.tmpH = 0

        this.isCanvas = o.isCanvas || false
        this.isCanvasOnly = false
        this.canvasScale = o.canvasScale || 1
        
        this.callback = o.callback  === undefined ? null : o.callback

        this.autoShow = o.autoShow  === undefined ? true : o.autoShow

        this.forceHeight = o.maxHeight || 0
        this.lockHeight = o.lockHeight || false

        this.isItemMode = o.itemMode !== undefined ? o.itemMode : false

        this.cn = ''
        
        // size define
        this.size = { ...Tools.size };//Tools.size;
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

        this.margin = this.colors.sy
        this.marginDiv = Tools.isDivid( this.margin )

        // bottom and close height
        this.isWithClose = o.close !== undefined ? o.close : true;
        
        // top close
        this.retractSide = o.topClose === 'left' ? 'left' : ( o.topClose ? 'right' : null );
        this.isTopClose = this.retractSide !== null;

        this.isWithClose = o.close !== undefined ? o.close : !this.isTopClose;
        this.bh = !this.isWithClose ? 0 : this.size.h;
        this.th = this.isTopClose ? this.size.h : 0;
        this.fullW = this.size.w;

        //

        this.bh = !this.isWithClose ? 0 : this.size.h;

        this.autoResize = o.autoResize === undefined ? true : o.autoResize;

        // default position
        this.isCenter = o.center || false;
        this.isBottom = o.bottom !== undefined ? true : false;
        this.realTop = 0;
        this.bottomPosition = o.bottom || 0;

        //this.cssGui = o.css !== undefined ? o.css : (this.isCenter ? '' : 'right:10px;')

        this.cssGui = o.css !== undefined ? o.css : ( this.isCenter ? '' : ( this.retractSide === 'left' ? 'left:10px; right:auto;' : 'right:10px; left:auto;' ) );

        this.isOpen = o.open !== undefined ? o.open : true;
        this.isDown = false;
        this.isScroll = false;

        this.uis = []
        this.current = -1
        this.proto = null
        this.isEmpty = true
        this.decal = 0
        this.ratio = 1
        this.oy = 0

        this.isNewTarget = false;

        let cc = this.colors

        let border = 'border: 2px solid ' + cc.content + '; '
        //let border = 'border-left: 2px solid ' + cc.content + '; border-right: 2px solid ' + cc.content + '; ';

        this.content = Tools.dom( 'div', this.css.basic + ' width:0px; height:auto; top:0px; background:'+cc.content+'; ' + this.cssGui + border );
        
        this.innerContent = Tools.dom( 'div', this.css.basic + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
        //this.innerContent = Tools.dom( 'div', this.css.basic + this.css.button + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
        this.content.appendChild( this.innerContent );

        //this.inner = Tools.dom( 'div', this.css.basic + 'width:100%; left:0; ')
        this.useFlex = true; 
        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : '' //' display:flex; justify-content:start; align-items:start;flex-direction: column; justify-content: center; align-items: center;';
        this.inner = Tools.dom( 'div', this.css.basic + flexible + 'width:100%; left:0; ');
        this.innerContent.appendChild(this.inner);

        this.isScrollDown = false;
        this.scrollOffset = 0;

        // scroll
        let sw = this.size.s;
        let r = cc.radius;
        this.scrollBG = Tools.dom( 'div', this.css.basic + 'right:0; top:0; width:' + sw + 'px; height:10px; display:none; background:' + cc.content + '; border-left:1px solid ' + cc.background + ';' );
        this.content.appendChild( this.scrollBG );

        this.scroll = Tools.dom( 'div', this.css.basic + 'background:' + cc.button + '; left:2px; top:0; width:' + (sw - 4) + 'px; height:10px; border-radius:' + Math.max(2, r) + 'px;' );
        this.scrollBG.appendChild( this.scroll );

        // bottom button
        this.bottomText = o.bottomText || ['open', 'close'];

        
        this.bottom = Tools.dom( 'div',  this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:'+r+'px; border-bottom-left-radius:'+r+'px; justify-content:center; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px; color:' + cc.text+';' );// border-top:1px solid '+Tools.colors.stroke+';');
        this.content.appendChild( this.bottom )
        this.bottom.textContent = this.isOpen ? this.bottomText[1] : this.bottomText[0]
        this.bottom.style.background = cc.background
        if(this.bh===0) this.bottom.style.visibility = 'hidden' 

        if ( this.isTopClose ) {

            const bSize = this.th - 4; // Taille intérieure du bouton (sans la bordure de 2px)
            const sSize = bSize - 8;   // Marge exacte de 4px de chaque côté

            this.iconOpen  = `<svg width="${sSize}" height="${sSize}" viewBox="0 0 16 16"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2.2"/></svg>`;
            this.iconClose = `<svg width="${sSize}" height="${sSize}" viewBox="0 0 16 16"><path d="M1 3 H15 M1 8 H15 M1 13 H15" stroke="currentColor" stroke-width="2.2"/></svg>`;
            this.topBtn = Tools.dom( 'div', this.css.txt + 'right:0; top:0; left:auto; padding:0; display:flex; align-items:center; justify-content:center; width:' + bSize + 'px; height:' + bSize + 'px; background:' + cc.background + '; color:' + cc.text + ';' );

            //this.topBtn.textContent = this.isOpen ? '⛌' : '☰';
            this.topBtn.innerHTML = this.isOpen ? this.iconOpen : this.iconClose;
            this.content.appendChild( this.topBtn );
        }

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
        this.transition = o.transition!==undefined? o.transition : Tools.transition
        if( this.transition ) setTimeout( this.addTransition.bind( this ), 1000 );
        

        this.setWidth();

        if( this.isCanvas ) this.makeCanvas();

        Roots.add( this );

    }

    setLeft( v ) {

        this.content.style.left = v + 'px';
        Roots.needReZone = true;

    }

    setTop( t, h ) {

        this.content.style.top = t + 'px';
        if( h !== undefined ) this.forceHeight = h;
        this.calc();

        Roots.needReZone = true;

    }

    addTransition(){

        if ( this.isCanvas ) return;

        if( this.transition && !this.isCanvas ){
            this.innerContent.style.transition = 'height '+this.transition+'s ease-out';
            //this.content.style.transition = 'height '+this.transition+'s ease-out';
            //this.content.style.transition = 'height ' + this.transition + 's ease-out, width ' + this.transition + 's ease-out';
            this.content.style.transition = 'height ' + this.transition + 's ease-out, width ' + this.transition + 's ease-out, margin-left ' + this.transition + 's ease-out, margin-right ' + this.transition + 's ease-out';
            this.bottom.style.transition = 'top '+this.transition+'s ease-out';
            //this.bottom.addEventListener("transitionend", Roots.resize, true);
        }

        let i = this.uis.length
        while( i-- ) this.uis[i].addTransition()

    }

    // ----------------------
    //   CANVAS
    // ----------------------

    onDraw () {}

    makeCanvas () {

    	this.canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', "canvas" );
    	this.canvas.width = this.zone.w;
    	this.canvas.height = this.forceHeight ? this.forceHeight : this.zone.h;

    }

    draw ( force ) {

    	if( this.canvas === null ) return;

    	let w = this.zone.w;
    	let h = this.forceHeight ? this.forceHeight : this.zone.h;
    	Roots.toCanvas( this, w, h, force, this.canvasScale );

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
        this.mouse.multiplyScalar(1/this.canvasScale);

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
        this.content.style.visibility = b ? 'hidden' : 'visible'; 
    }

    display( v = false ) {
        this.content.style.visibility = v ? 'visible' : 'hidden'
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
                   if ( this.topBtn ) {
                        this.topBtn.style.background = cc.background;
                        this.topBtn.style.color = cc.text;
                    }
	    		break;

	    		case 'scrollOver': 
                    Roots.cursor('ns-resize');
                    this.scroll.style.background = cc.select
                break;
	    		case 'scrollDown': 
                    this.scroll.style.background = cc.select
                break;

	    		case 'bottomOver': 
                    Roots.cursor('pointer');
                    this.bottom.style.background = cc.backgroundOver; 
                    this.bottom.style.color = cc.textOver; 
                break;

                case 'topOver':
                    Roots.cursor('pointer');
                    if ( this.topBtn ) {
                        this.topBtn.style.background = cc.select//backgroundOver;
                        this.topBtn.style.color = cc.textOver;
                    }
                break;

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
        let changed = false;
        if( this.proto.s ){
            if ( this.proto.uiout() ) changed = true;
            if ( this.proto.reset() ) changed = true;
        }
        this.proto = null;
        this.current = -1;
        
        Roots.cursor();
        return changed;

    }

    // ----------------------
    //   ZONE TEST
    // ----------------------

    testZone ( e ) {



        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        //console.log('test', this.zone)

        this.isReset = false;

        let name = '';

        let s = this.isScroll ?  this.zone.w - this.size.s : this.zone.w;

        if ( this.isTopClose && l.y < this.th && l.x > this.zone.w - this.th ) return 'top';
        if ( l.y > this.zone.h - this.bh && l.y < this.zone.h ) name = 'bottom';
        else name = l.x > s ? 'scroll' : 'content';
        
        //if( l.y > this.zone.h - this.bh &&  l.y < this.zone.h ) name = 'bottom';
        //else name = l.x > s ? 'scroll' : 'content';

        return name;

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent ( e ) {

        //if( this.cleanning ) return

    	let type = e.type;

    	let change = false;
    	let protoChange = false;

    	let name = this.testZone( e );

        if ( type === 'mouseup' ) {
            this.isDown = false;
            this.isScrollDown = false;
        }

        if ( type === 'mousedown' && !this.isDown ) this.isDown = true;

        if ( this.isDown && this.isNewTarget ) { Roots.clearInput(); this.isNewTarget = false; }

        // Si on est en train de glisser la scrollbar, on garde le focus même si la souris sort à gauche/droite
        if ( this.isScrollDown ) {
            this.update( ( e.clientY - this.zone.y ) - this.scrollOffset );
            if ( this.isCanvas ) this.draw();
            return;
        }

    	/*if( type === 'mouseup' && this.isDown ) this.isDown = false;
    	if( type === 'mousedown' && !this.isDown ) this.isDown = true;

        if( this.isDown && this.isNewTarget ){ Roots.clearInput(); this.isNewTarget=false; }*/

    	if( !name ) return;

    	switch( name ){

            case 'top':

                this.clearTarget();
                if ( type === 'mousemove' ) change = this.mode('topOver');
                if ( type === 'mousedown' ) {
                    this.isOpen = !this.isOpen;
                    //this.topBtn.textContent = this.isOpen ? '⛌' : '☰';
                    this.topBtn.innerHTML = this.isOpen ? this.iconOpen : this.iconClose;
                    this.calc();
                    this.mode('def');
                    change = true;
                }

            break;

    		case 'content':

                if ( !this.isOpen ) break;

                e.clientY = this.isScroll ? e.clientY + this.decal : e.clientY;

                if( Roots.isMobile && type === 'mousedown' ){ 
                    //this.getNext( e, change )
                    if ( this.getNext( e ) ) change = true;
                }

	    		if( this.proto ) protoChange = this.proto.handleEvent( e )

	    		//if( type === 'mousemove' ) change = this.mode('def');

                if ( type === 'mousemove' && this.mode('def') ) change = true;
                if ( type === 'wheel' && !protoChange && this.isScroll ) change = this.onWheel( e );

                //if( type === 'wheel' && !protoChange && this.isScroll ) change = this.onWheel( e )
               
	    		if( !Roots.lock ) {
                    if ( this.getNext( e ) ) change = true;
                    //this.getNext( e, change )
                }

    		break;

    		case 'bottom':

	    		this.clearTarget();
	    		if( type === 'mousemove' ) change = this.mode('bottomOver')
	    		if( type === 'mousedown' ) {
	    			this.isOpen = this.isOpen ? false : true
		            this.bottom.textContent = this.isOpen ? this.bottomText[1] : this.bottomText[0]
		            //this.setHeight();
                    this.calc()
		            this.mode('def')
		            change = true
	    		}

    		break;

            case 'scroll':

                this.clearTarget();
                if ( type === 'mousemove' ) change = this.mode('scrollOver');
                if ( type === 'mousedown' ) {
                    change = this.mode('scrollDown');
                    this.isScrollDown = true;
                    let ly = e.clientY - this.zone.y;
                    // Si on clique sur le curseur, on garde l'offset ; sinon on centre sur le clic
                    if ( ly >= this.oy && ly <= this.oy + this.sh ) this.scrollOffset = ly - this.oy;
                    else this.scrollOffset = this.sh * 0.5;
                    this.update( ly - this.scrollOffset );
                }
                if ( type === 'wheel' ) change = this.onWheel( e );

            break;


    	}

    	//if( this.isDown ) change = true;
    	if( protoChange ) change = true;
        //if( this.isNewTarget ){ this.isNewTarget = false; change = true; } // a voir ?
        if( type === 'keyup' || type === 'keydown' ) change = true;

    	if( change ) this.draw();

    }

    getNext ( e ) {

        let next = Roots.findTarget( this.uis, e );
        let change = false;

        if ( next !== this.current ) {
            if ( this.clearTarget() ) change = true;
            this.current = next;
            this.isNewTarget = true;

            if ( next !== -1 ) {
                this.proto = this.uis[ this.current ];
                if ( this.proto.uiover() ) change = true;
            }
        }

        return change;

    }

    /*getNext ( e, change ) {

        let next = Roots.findTarget( this.uis, e );

        if( next !== this.current ){
            this.clearTarget();
            this.current = next;
            change = true;
            this.isNewTarget = true;

        }

        if( next !== -1 ){ 
            this.proto = this.uis[ this.current ];
            this.proto.uiover();
        }

    }*/

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

        //if(this.cleanning) this.cleanning = false

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

        this.calc()

        this.isEmpty = false

        return u

    }

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

        while (this.uis.length) {
            this.uis[this.uis.length - 1].dispose();
        }
        this.isEmpty = true;
        this.calc();

        //this.cleanning = true

        //this.close();

        /*let i = this.uis.length, item

        while( i-- ){
            item = this.uis.pop()
            this.inner.removeChild( item.c[0] )
            item.dispose()
        }

        this.uis = []
        this.isEmpty = true
        this.calc()*/

    }

    clear() {

        this.empty()

    }

    clear2() {

        setTimeout( this.empty.bind(this), 0 )

    }

    dispose() {

        if ( this.tmp ) { clearTimeout( this.tmp ); this.tmp = null; }

        this.clear();
        if( this.parent !== null ) this.parent.removeChild( this.content );
        this.canvas = null;
        Roots.remove( this );

    }


    // ----------------------
    //   ITEMS SPECIAL
    // ----------------------

    resetItem () {

        if( !this.isItemMode ) return;
        let i = this.uis.length;
        while(i--) this.uis[i].selected()

    }

    setItem ( name ) {

        if( !this.isItemMode ) return;

        name = name || ''
        this.resetItem()

        if( !name ){
            this.update(0)
            return
        } 

        let i = this.uis.length
        while(i--){ 
            if( this.uis[i].value === name ){ 
                this.uis[i].selected( true )
                if( this.isScroll ) this.update( ( i*(this.uis[i].h+this.margin) )*this.ratio )
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

        if ( b ) {

            this.total = this.h;
            this.maxView = this.maxHeight;

            this.ratio = this.maxView / this.total;
            this.sh = Math.max( 20, Math.floor( this.maxView * this.ratio ) );
            this.range = this.maxView - this.sh;
            this.ratio = this.range / ( this.total - this.maxView );

            this.oy = Tools.clamp( this.oy, 0, this.range );

            this.scrollBG.style.height = this.maxView + 'px';
            this.scroll.style.height = this.sh + 'px';

        }

        this.setItemWidth( this.zone.w - this.sw )
        this.update( this.oy )

    }

    update ( y ) {

        y = Tools.clamp( y, 0, this.range );
        this.decal = Math.floor( y / this.ratio );
        //this.inner.style.top = - this.decal + 'px';
        //this.scroll.style.top = Math.floor( y ) + 'px';

        this.inner.style.transform = `translate3d(0, ${-this.decal}px, 0)`;
        this.scroll.style.transform = `translate3d(0, ${Math.floor(y)}px, 0)`;
        this.oy = y;

        //if ( this.isScroll ) this.cull();
        //if ( !this.isScroll && this.isCull) this.uncull();

    }

    /*cull () {

        const top = this.zone.y + this.decal;
        const bottom = top + this.maxView;
        const uis = this.uis;
        let i = uis.length;

        this.isCull = true;

        while ( i-- ) {
            const u = uis[ i ];
            const uy = u.zone.y;
            const visible = ( uy + u.zone.h >= top ) && ( uy <= bottom );
            if ( u._vis !== visible ) {
                u._vis = visible;
                u.s[0].visibility = visible ? 'visible' : 'hidden';
            }
        }

    }

    uncull() {

        const uis = this.uis;
        let i = uis.length;

        while ( i-- ) {
            const u = uis[ i ];
            if ( u._vis !== true ) {
                u._vis = visible;
                u.s[0].visibility = 'visible';
            }
        }

    }*/

    // ----------------------
    //   RESIZE FUNCTION
    // ----------------------

    calcUis() {

        return Roots.calcUis( this.uis, this.zone, this.zone.y );

    }

    calc() {

        if (this.tmp) clearTimeout(this.tmp);
        this.tmp = setTimeout(() => {
            this.tmp = null;
            this.setHeight();
        }, 10);

    }

    setHeight() {

        this.zone.h = this.isTopClose ? Math.max( this.bh, this.th ) : this.bh;
        this.isScroll = false;

        if ( this.isTopClose ) {
            const offset = this.isOpen ? 0 : ( this.fullW - this.th );
            this.zone.w = this.isOpen ? this.fullW : this.th;
            this.content.style.width = this.zone.w + 'px';

            if ( this.isCenter ) {
                const half = Math.floor( this.fullW * 0.5 );
                if ( this.retractSide === 'right' ) this.content.style.marginLeft = ( -half + offset ) + 'px';
                else if ( this.retractSide === 'left' ) this.content.style.marginLeft = -half + 'px';
                else this.content.style.marginLeft = -Math.floor( this.zone.w * 0.5 ) + 'px';
            } else {
                this.content.style.marginLeft = ( this.retractSide === 'right' ? offset : 0 ) + 'px';
                this.content.style.marginRight = ( this.retractSide === 'left' ? offset : 0 ) + 'px';
            }
        }

        if( this.isOpen ){

            this.h = this.calcUis();
            if ( this.uis.length > 0 ) this.h -= this.uis[ this.uis.length - 1 ].margin;

            let hhh = this.forceHeight ? this.forceHeight + this.zone.y : window.innerHeight;
            let py = this.isBottom ? this.bottomPosition : this.zone.y;

            this.maxHeight = hhh - py - this.bh;

            let diff = this.h - this.maxHeight;

            if( diff > 1 ){
                this.isScroll = true;
                this.zone.h = this.maxHeight + this.bh;
            } else {
                this.zone.h = this.h + this.bh;
            }

        }

        this.upScroll( this.isScroll );

        //this.innerContent.style.height = Math.max( 0, this.zone.h - this.bh ) + 'px';
        this.innerContent.style.height = ( this.isOpen ? Math.max( 0, this.zone.h - this.bh ) : 0 ) + 'px';
        this.content.style.height = ( this.isOpen ? this.zone.h + 4 : this.zone.h ) + 'px';
        if( this.autoShow ) this.content.style.visibility = this.zone.h !== 0 ? 'visible' : 'hidden';
        this.bottom.style.top = ( this.zone.h - this.bh ) + 'px';

        if( this.isBottom ){
            this.realTop = window.innerHeight - this.zone.h - this.bottomPosition;
            this.zone.y = this.realTop;
            this.content.style.top = this.realTop + 'px';
            this.calcUis();
        }

        if( this.forceHeight && this.lockHeight ) this.content.style.height = this.forceHeight + 'px';
        if( this.isCanvas ) this.draw( true );

        Roots.needReZone = true;

    }

    /*setHeight() {

        this.zone.h = this.isTopClose ? Math.max( this.bh, this.th ) : this.bh;
        this.isScroll = false;
        if ( this.isTopClose ) {
            this.zone.w = this.isOpen ? this.fullW : this.th;
            this.content.style.width = this.zone.w + 'px';
        }

        if( this.isOpen ){

            this.h = this.calcUis();
            if ( this.uis.length > 0 ) this.h -= this.uis[ this.uis.length - 1 ].margin;

            let hhh = this.forceHeight ? this.forceHeight + this.zone.y : window.innerHeight;
            let py = this.isBottom ? this.bottomPosition : this.zone.y;
            this.maxHeight = hhh - py - this.bh;

            let diff = this.h - this.maxHeight;
            if ( diff > 1 ) {
                this.isScroll = true;
                this.zone.h = this.maxHeight + this.bh;
            } else {
                this.zone.h = this.h + this.bh;
            }

        }

        this.upScroll( this.isScroll );

        this.innerContent.style.height = Math.max( 0, this.zone.h - this.bh - this.th ) + 'px';
        this.content.style.height = this.zone.h + 'px';
        if( this.autoShow )this.content.style.visibility = this.zone.h !== 0 ? 'visible' : 'hidden'
        this.bottom.style.top = ( this.zone.h - this.bh ) + 'px';

        if( this.isBottom ){

            this.realTop = window.innerHeight-this.zone.h-this.bottomPosition;
            this.zone.y = this.realTop;
            this.content.style.top = this.realTop+'px';
            this.calcUis()

        }


        if( this.forceHeight && this.lockHeight ) this.content.style.height = this.forceHeight + 'px';
        if( this.isCanvas ) this.draw( true );

        Roots.needReZone = true


    }*/

    resizeRoot () {
        Roots.resize();
        Roots.initEvents();
    }

    rezone () {
        Roots.needReZone = true;
    }

    getRoot () {
        return Roots;
    }

    zoneReset () {
        //console.log(Roots)
        //Roots.findZone(true);
    }

    

    setWidth ( w ) {

        if ( w ) this.fullW = Math.floor( w );
        this.zone.w = ( this.isTopClose && !this.isOpen ) ? this.th : this.fullW;
        this.content.style.width = this.zone.w + 'px';
        this.inner.style.width = this.fullW + 'px'; // Empêche le reflow des éléments pendant le repli
        if ( this.isCenter ) this.content.style.marginLeft = -( Math.floor( this.zone.w * 0.5 ) ) + 'px';
        this.setItemWidth( this.fullW - this.sw );

    }

    setItemWidth ( w ) {

        let i = this.uis.length;
        while(i--){
            this.uis[i].setSize( w )
            this.uis[i].rSize()
        }

    }

}