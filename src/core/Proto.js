
import { Roots } from './Roots.js';
import { Tools } from './Tools.js';
import { V2 } from './V2.js';

/**
 * @author lth / https://github.com/lo-th
 */

export class Proto {

    constructor( o = {} ) {

        

        // disable mouse controle
        this.lock = o.lock || false;

        // for button
        this.neverlock = false

        // only simple space 
        this.isSpace = o.isSpace || false

        // if is on gui or group
        this.main = o.main || null;
        this.isUI = o.isUI || false;
        this.group = o.group || null;

        this.isListen = false;

        this.isSelectable = o.selectable !== undefined ? o.selectable : false
        this.unselectable =  o.unselect !== undefined ? o.unselect : this.isSelectable

        this.ontop = o.ontop ? o.ontop : false; // 'beforebegin' 'afterbegin' 'beforeend' 'afterend'

        this.css = this.main ? this.main.css : Tools.css

        this.colors = Tools.defineColor( o, this.main ? ( this.group ? this.group.colors : this.main.colors ) : Tools.colors )

        this.svgs = Tools.svgs

        this.zone = { x:0, y:0, w:0, h:0 }
        this.local = new V2().neg()

        this.isCanvasOnly = false
        this.isSelect = false

        // percent of title
        this.p = o.p !== undefined ? o.p : Tools.size.p;

        this.w = this.isUI ? this.main.size.w : Tools.size.w;
        if( o.w !== undefined ) this.w = o.w;

        this.h = this.isUI ? this.main.size.h : Tools.size.h;
        if( o.h !== undefined ) this.h = o.h;
        if( !this.isSpace ) this.h = this.h < 11 ? 11 : this.h;
        else this.lock = true


        // decale for canvas only
        this.fw = o.fw || 0

        this.autoWidth = o.auto || true;// auto width or flex 
        this.isOpen = false// open statu

        // radius for toolbox
        this.radius = o.radius || this.colors.radius;

        this.transition = o.transition || Tools.transition

        // only for number
        this.isNumber = false;
        this.noNeg = o.noNeg || false;
        this.allEqual = o.allEqual || false;
        
        // only most simple 
        this.mono = false;

        // stop listening for edit slide text
        this.isEdit = false;

        // no title 
        this.simple = o.simple || false;
        if( this.simple ) this.sa = 0;


        // define obj size
        this.setSize( this.w )

        // title size
        if( o.sa !== undefined ) this.sa = o.sa
        if( o.sb !== undefined ) this.sb = o.sb
        if( this.simple ) this.sb = this.w - this.sa

        // last number size for slide
        this.sc = o.sc === undefined ? 47 : o.sc

        // for listening object
        this.objectLink = null;
        this.isSend = false;
        this.objectKey = null;

        this.txt = o.name || '';
        this.name = o.rename || this.txt;
        this.target = o.target || null;

        // callback
        this.callback = o.callback === undefined ? null : o.callback;
        this.endCallback = null;
        this.openCallback = o.openCallback === undefined ? null : o.openCallback;
        this.closeCallback = o.closeCallback === undefined ? null : o.closeCallback;

        // if no callback take one from group or gui
        if( this.callback === null && this.isUI && this.main.callback !== null ){ 
            this.callback = this.group ? this.group.callback : this.main.callback;
        }

        // elements
        this.c = [];

        // style 
        this.s = [];


        this.useFlex = this.isUI ? this.main.useFlex : false 
        let flexible = this.useFlex ? 'display:flex; justify-content:center; align-items:center; text-align:center; flex: 1 100%;' : 'float:left;'

        this.c[0] = Tools.dom( 'div', this.css.basic + flexible + 'position:relative; height:20px;');


        this.s[0] = this.c[0].style

        // bottom margin
        this.margin = o.margin || 1
        if( this.isUI && this.margin ){ 
            this.s[0].boxSizing = 'content-box'
            //this.s[0].marginBottom = this.margin + 'px';
            if( this.margin*0.5===Math.floor(this.margin*0.5) ){
                this.s[0].borderTop = (this.margin*0.5) + 'px solid transparent'
                this.s[0].borderBottom = (this.margin*0.5) + 'px solid transparent'
            } else {
                this.s[0].borderBottom = this.margin + 'px solid transparent'
            }
            
        }
        
        // with title
        if( !this.simple ){ 
            this.c[1] = Tools.dom( 'div', this.css.txt )
            this.s[1] = this.c[1].style
            this.c[1].textContent = this.name
            this.s[1].color = this.lock ? this.colors.titleoff : this.colors.title
        }

        if( o.pos ){
            this.s[0].position = 'absolute';
            for(let p in o.pos){
                this.s[0][p] = o.pos[p];
            }
            this.mono = true;
        }




        if( o.css ) this.s[0].cssText = o.css; 
        

    }

    // ----------------------
    // make the node
    // ----------------------
    
    init() {

        this.zone.h = this.h;
        this.zone.w = this.w;

        let s = this.s; // style cache
        let c = this.c; // div cach

        s[0].height = this.h + 'px';

        if( this.isUI ) s[0].background = this.colors.background

        if(!this.autoWidth && this.useFlex ){
            s[0].flex = '1 0 auto'
            s[0].minWidth = this.minw+'px'
            s[0].textAlign = 'center'
        } else {
            if( this.isUI ) s[0].width = '100%'
        }

        //if( this.autoHeight ) s[0].transition = 'height 0.01s ease-out';
        if( c[1] !== undefined && this.autoWidth ){
            s[1] = c[1].style;
            s[1].height = (this.h-4) + 'px';
            s[1].lineHeight = (this.h-8) + 'px';
        }

        let frag = Tools.frag;

        for( let i = 1, lng = c.length; i !== lng; i++ ){
            if( c[i] !== undefined ) {
                frag.appendChild( c[i] );
                s[i] = c[i].style;
            }
        }

        let pp = this.target !== null ? this.target : ( this.isUI ? this.main.inner : document.body );

        if( this.ontop ) pp.insertAdjacentElement( 'afterbegin', c[0] );
        else pp.appendChild( c[0] );

        c[0].appendChild( frag );

        this.rSize()

        // ! solo proto
        if( !this.isUI ){

            this.c[0].style.pointerEvents = 'auto'
            Roots.add( this )
            
        }

        
        

    }

    addTransition(){

        if( this.baseH && this.transition && this.isUI ){
            this.c[0].style.transition = 'height '+this.transition+'s ease-out';
        }
        
    }

    // from Tools

    dom( type, css, obj, dom, id ) {

        return Tools.dom( type, css, obj, dom, id );

    }

    setSvg( dom, type, value, id, id2 ) {

        Tools.setSvg( dom, type, value, id, id2 );

    }

    setCss( dom, css ) {

        Tools.setCss( dom, css );

    }

    clamp( value, min, max ) {

        return Tools.clamp( value, min, max );

    }

    getColorRing() {

        if( !Tools.colorRing ) Tools.makeColorRing();
        return Tools.clone( Tools.colorRing );

    }

    getJoystick( model ) {

        if( !Tools[ 'joystick_'+ model ] ) Tools.makeJoystick( model )
        return Tools.clone( Tools[ 'joystick_'+ model ] )

    }

    getCircular( model ) {

        if( !Tools.circular ) Tools.makeCircular( model )
        return Tools.clone( Tools.circular )

    }

    getKnob( model ) {

        if( !Tools.knob ) Tools.makeKnob( model )
        return Tools.clone( Tools.knob )

    }

    getPad2d( model ) {

        if( !Tools.pad2d ) Tools.makePad( model )
        return Tools.clone( Tools.pad2d )

    }

    // from Roots

    cursor( name ) {

         Roots.cursor( name );

    }

    

    /////////

    update() {}

    reset() {}

    /////////

    getDom() {

        return this.c[0]

    }

    uiout() {

        if( this.lock ) return;

        if(this.s) this.s[0].background = this.colors.background;

    }

    uiover() {

        if( this.lock ) return;

        if(this.s) this.s[0].background = this.colors.backgroundOver;

    }

    rename( s ) {

        if( this.c[1] !== undefined) this.c[1].textContent = s;

    }

    listen() {

        this.isListen = Roots.addListen( this );
        return this;

    }

    listening() {

        if( this.objectLink === null ) return;
        if( this.isSend ) return;
        if( this.isEdit ) return;

        this.setValue( this.objectLink[ this.objectKey ] );

    }

    setValue( v ) {

        if( this.isNumber ) this.value = this.numValue( v );
        //else if( v instanceof Array && v.length === 1 ) v = v[0];
        else this.value = v;
        this.update();

    }

    // ----------------------
    // update every change
    // ----------------------

    onChange( f ) {

        if( this.isSpace ) return
        this.callback = f || null
        return this

    }

    // ----------------------
    // update only on end
    // ----------------------

    onFinishChange( f ) {

        if( this.isSpace ) return;
        this.callback = null
        this.endCallback = f
        return this

    }

    // ----------------------
    // event on open close
    // ----------------------

    onOpen( f ) {

        this.openCallback = f
        return this

    }

    onClose( f ) {

        this.closeCallback = f
        return this

    }

    // ----------------------
    //  send back value
    // ----------------------

    send( v ) {

        v = v || this.value;
        if( v instanceof Array && v.length === 1 ) v = v[0];

        this.isSend = true
        if( this.objectLink !== null ) this.objectLink[ this.objectKey ] = v
        if( this.callback ) this.callback( v, this.objectKey )
        this.isSend = false

    }

    sendEnd( v ) {

        v = v || this.value;
        if( v instanceof Array && v.length === 1 ) v = v[0];

        if( this.endCallback ) this.endCallback( v );
        if( this.objectLink !== null ) this.objectLink[ this.objectKey ] = v;

    }

    // ----------------------
    // clear node
    // ----------------------

    dispose(){

        if( this.isListen ) Roots.removeListen( this );

        Tools.clear( this.c[0] );

        if( this.target !== null ){ 

            if( this.group !== null  ) this.group.clearOne( this );
            else this.target.removeChild( this.c[0] );

        } else {

            if( this.isUI ) this.main.clearOne( this );
            else document.body.removeChild( this.c[0] );

        }

        if( !this.isUI ) Roots.remove( this );
        
        this.c = null;
        this.s = null;
        this.callback = null;
        this.target = null;
        this.isListen = false;

    }
    
    clear() {

    }

    // ----------------------
    // change size 
    // ----------------------

    getWidth() {

        let nw = Roots.getWidth( this )
        if(nw) this.w = nw

    }

    setSize( sx ) {

        if( !this.autoWidth ) return;
        
        this.w = sx;

        if( this.simple ){
            this.sb = this.w - this.sa
        } else {
            let pp = this.w * ( this.p / 100 )
            this.sa = Math.floor( pp + 10 )
            this.sb = Math.floor( this.w - pp - 20 )
        }

    }

    rSize() {

        if( !this.autoWidth ) return
        if( !this.isUI ) this.s[0].width = this.w + 'px'
        if( !this.simple ) this.s[1].width = this.sa + 'px'
    
    }

    // ----------------------
    // for numeric value
    // ----------------------

    setTypeNumber( o ) {

        this.isNumber = true;

        this.value = 0;
        if( o.value !== undefined ){
            if( typeof o.value === 'string' ) this.value = o.value * 1;
            else this.value = o.value;
        }

        this.min = o.min === undefined ? -Infinity : o.min;
        this.max = o.max === undefined ?  Infinity : o.max;
        this.precision = o.precision === undefined ? 2 : o.precision;

        let s;

        switch(this.precision){
            case 0: s = 1; break;
            case 1: s = 0.1; break;
            case 2: s = 0.01; break;
            case 3: s = 0.001; break;
            case 4: s = 0.0001; break;
            case 5: s = 0.00001; break;
        }

        this.step = o.step === undefined ?  s : o.step;
        this.range = this.max - this.min;
        this.value = this.numValue( this.value );
        
    }

    numValue( n ) {

        if( this.noNeg ) n = Math.abs( n );
        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision ) * 1;

    }


    // ----------------------
    //   EVENTS DEFAULT
    // ----------------------

    handleEvent( e ) {

        if( this.lock ) return

        if( this.neverlock ) Roots.lock = false

        if( !this[e.type] ) return console.error(e.type, 'this type of event no existe !')

        return this[e.type](e)
    
    }

    wheel( e ) { return false; }
    mousedown( e ) { return false; }
    mousemove( e ) { return false; }
    mouseup( e ) { return false; }
    keydown( e ) { return false; }
    keyup( e ) { return false; }


    // ----------------------
    // object referency
    // ----------------------

    setReferency( obj, key ) {

        this.objectLink = obj
        this.objectKey = key

    }

    display( v = false ) {
        this.s[0].visibility = v ? 'visible' : 'hidden'
    }

    // ----------------------
    // resize height 
    // ----------------------

    open () {

        if( this.isOpen ) return
        this.isOpen = true
        Roots.needResize = true
        if( this.openCallback ) this.openCallback()

    }

    close () {

        if( !this.isOpen ) return
        this.isOpen = false
        Roots.needResize = true
        if( this.closeCallback ) this.closeCallback()

    }

    needZone() {

        Roots.needReZone = true

    }

    rezone() {

        Roots.needReZone = true

    }

    // ----------------------
    //  INPUT
    // ----------------------

    select() {
    
    }

    unselect() {

    }

    setInput( Input ) {
        
        Roots.setInput( Input, this );

    }

    upInput( x, down ) {

        return Roots.upInput( x, down );

    }

    // ----------------------
    // special item 
    // ----------------------

    selected( b ){

        this.isSelect = b || false
        
    }

}