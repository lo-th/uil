
/**
 * @author lth / https://github.com/lo-th
 */

export const REVISION = '4.4.0';

// INTENAL FUNCTION

/*const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        console.log(entry)
        //const bounds = entry.boundingClientRect;
        entry.target.bounds = entry.boundingClientRect;
    }
    observer.disconnect();
})*/


const R = {

	ui: [],

    debug:false,

    dom:null,

	ID: null,
    lock:false,
    wlock:false,
    current:-1,

	needReZone: true,
    needResize:false,
    forceZone:false,
    isEventsInit: false,
    isLeave:false,

    downTime:0,
    prevTime:0,

    //prevDefault: ['contextmenu', 'wheel'],
    prevDefault: ['contextmenu'],
    pointerEvent: ['pointerdown', 'pointermove', 'pointerup'],
    eventOut: ['pointercancel', 'pointerout', 'pointerleave'],

	xmlserializer: null,
	tmpTime: null,
    tmpImage: null,

    oldCursor:'auto',

    input: null,
    parent: null,
    firstImput: true,
    
    hiddenImput:null,
    hiddenSizer:null,
    hasFocus:false,
    startInput:false,
    inputRange : [0,0],
    cursorId : 0,
    str:'',
    pos:0,
    startX:-1,
    moveX:-1,

    debugInput:false,

    isLoop: false,
    listens: [],

    e:{
        type:null,
        clientX:0,
        clientY:0,
        keyCode:NaN,
        key:null,
        delta:0,
    },

    isMobile: false,

    now: null,

    injectCss (css, styleName, parent) {
        const CSS_ID = styleName || 'codeflask-style'
        const PARENT = parent || document.head

        if (!css) return false

        if (document.getElementById(CSS_ID)) return true

        const style = document.createElement('style')
        style.innerHTML = css
        style.id = CSS_ID
        PARENT.appendChild(style)
        return true
    },

    

    getTime: function() {
        return ( self.performance && self.performance.now ) ? self.performance.now.bind( performance ) : Date.now;
    },

    testMobile: function () {

        let n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
        else return false;  

    },

    // ----------------------
    //   ADD / REMOVE
    // ----------------------

	add: function ( o ) {

        R.ui.push( o );
        R.getZone( o );

        if( !R.isEventsInit ) R.initEvents();

    },

    remove: function ( o ) {

        let i = R.ui.indexOf( o );
        
        if ( i !== -1 ) {
            R.removeListen( o );
            R.ui.splice( i, 1 ); 
        }

        if( R.ui.length === 0 ){
            R.removeEvents();

        }

        //console.log('remove:', R.ui.length)

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    initEvents: function () {

        if( R.isEventsInit ) return;

        let dom = document.body;

        R.isMobile = R.testMobile();
        R.now = R.getTime();


        if(!R.isMobile){
            dom.addEventListener( 'wheel', R, { passive: false } )
        } else {
            dom.style.touchAction = 'none'
        }

        
        dom.addEventListener( 'pointercancel', R )
        dom.addEventListener( 'pointerleave', R )
        //dom.addEventListener( 'pointerout', R )

        dom.addEventListener( 'pointermove', R )
        dom.addEventListener( 'pointerdown', R )
        dom.addEventListener( 'pointerup', R )
       

        dom.addEventListener( 'keydown', R, false )
        dom.addEventListener( 'keyup', R, false )
        window.addEventListener( 'resize', R.resize , false )

        //window.onblur = R.out;
        //window.onfocus = R.in;


        R.isEventsInit = true;
        R.dom = dom;

       

        //console.log('event is add !')

    },

    removeEvents: function () {

        if( !R.isEventsInit ) return;

        let dom = document.body;
            
        if(!R.isMobile){
            dom.removeEventListener( 'wheel', R )
        }
        
        
        dom.removeEventListener( 'pointercancel', R );
        dom.removeEventListener( 'pointerleave', R );
        //dom.removeEventListener( 'pointerout', R );

        dom.removeEventListener( 'pointermove', R );
        dom.removeEventListener( 'pointerdown', R );
        dom.removeEventListener( 'pointerup', R );
        

        dom.removeEventListener( 'keydown', R );
        dom.removeEventListener( 'keyup', R );
        window.removeEventListener( 'resize', R.resize  );

        R.isEventsInit = false;

        //console.log('event is remove !')

    },

    resize: function () {

        //console.log('resize !!')

        let i = R.ui.length, u;
        
        while( i-- ){

            u = R.ui[i];
            if( u.isGui && !u.isCanvasOnly && u.autoResize ) u.calc();
        
        }

        R.needReZone = true;
        R.needResize = false;

    },

    out: function () {

        console.log('im am out')
        R.clearOldID();

    },

    in: function () {

        console.log('im am in')
      //  R.clearOldID();

    },

    // ----------------------
    //   HANDLE EVENTS
    // ----------------------

    fakeUp: function(){

        this.handleEvent( {type:'pointerup'} )

    },
    

    handleEvent: function ( event ) {

        //if(!event.type) return;

        //if( R.prevDefault.indexOf( event.type ) !== -1 ) event.preventDefault(); 

        if( R.needResize ) R.resize()


        R.findZone( R.forceZone );
       
        let e = R.e;
        let leave = false;
        
        if( event.type === 'keydown') R.keydown( event );
        if( event.type === 'keyup') R.keyup( event );

        if( event.type === 'wheel' ) e.delta = event.deltaY > 0 ? 1 : -1;
        else e.delta = 0;

        let ptype = event.pointerType // mouse, pen, touch

        e.clientX = ( ptype === 'touch' ? event.pageX : event.clientX ) || 0
        e.clientY = ( ptype === 'touch' ? event.pageY : event.clientY ) || 0

        e.type = event.type;

        if( R.eventOut.indexOf( event.type ) !== -1 ){ 
            leave = true
            e.type = 'mouseup'
        }

        if( event.type === 'pointerleave') R.isLeave = true; 

        if( event.type === 'pointerdown') e.type = 'mousedown';
        if( event.type === 'pointerup') e.type = 'mouseup';
        if( event.type === 'pointermove'){ 
            if( R.isLeave ){ 
                // if user resize outside this document
                R.isLeave = false;
                R.resize();
            }
            e.type = 'mousemove';
        }

        // double click test
        if( e.type === 'mousedown' ) {
            R.downTime = R.now()
            let time = R.downTime - R.prevTime

            // double click on imput
            if( time < 200 ) { R.selectAll(); return false }
   
            R.prevTime = R.downTime
            R.forceZone = false
        }

        // for imput
        if( e.type === 'mousedown' ) R.clearInput()

        // mouse lock
        if( e.type === 'mousedown' ) R.lock = true;
        if( e.type === 'mouseup' ) R.lock = false;

        //if( R.current !== null && R.current.neverlock ) R.lock = false;

        /*if( e.type === 'mousedown' && event.button === 1){
            R.cursor()
            e.preventDefault();
            e.stopPropagation();
        }*/

        if( R.isMobile && e.type === 'mousedown' ) R.findID( e );
        if( e.type === 'mousemove' && !R.lock ) R.findID( e );
        
        if( R.ID !== null ){

            if( R.ID.isCanvasOnly ) {

                e.clientX = R.ID.mouse.x;
                e.clientY = R.ID.mouse.y;

            }

            //if( R.ID.marginDiv ) e.clientY -= R.ID.margin * 0.5

            R.ID.handleEvent( e );

        }

        if( R.isMobile && e.type === 'mouseup' ) R.clearOldID();
        if( leave ) R.clearOldID();

    },

    // ----------------------
    //   ID
    // ----------------------

    findID: function ( e ) {

        let i = R.ui.length, next = -1, u, x, y;



        while( i-- ){

            u = R.ui[i]



            if( u.isCanvasOnly ) {

                x = u.mouse.x;
                y = u.mouse.y;

            } else {

                x = e.clientX;
                y = e.clientY;

            }

            if( R.onZone( u, x, y ) ){ 
                
                next = i;
                
                if( next !== R.current ){
                    R.clearOldID();
                    R.current = next;
                    R.ID = u;
                }
                break;
            }
                
        }

        if( next === -1 ) R.clearOldID();

    },

    clearOldID: function () {

        if( !R.ID ) return;
        R.current = -1;
        R.ID.reset();
        R.ID = null;
        R.cursor();

    },

    // ----------------------
    //  GUI / GROUP FUNCTION
    //  need update if zone change !!
    // ----------------------

    calcUis: ( uis, zone, py, group = false ) => {

        if( R.debug ) console.log('calc_uis !!')

        let i = uis.length, u, px = 0, n = 0, tw, div;

        let height = 0;

        while( i-- ){

            u = uis[n];
            n++;

            if( !group && u.isGroup ) u.calcUis();

            let m = u.margin || 0;

            u.zone.w = u.w;
            u.zone.h = u.h + m;
            
            if( !u.autoWidth ){

                if( px === 0 ) height += u.h + m

                u.zone.x = zone.x + px
                u.zone.y = py// + u.mtop
                //if(div) u.zone.y += m * 0.5

                tw = R.getWidth(u);
                if( tw ) u.zone.w = u.w = tw
                else if( u.fw ) u.zone.w = u.w = u.fw
                
                px += u.zone.w

                if( px >= zone.w ) { 
                    py += u.h + m
                    //if(div) py += m * 0.5
                    px = 0
                }

            } else {

                px = 0

                u.zone.x = zone.x + u.dx;
                u.zone.y = py;
                py += u.h + m;

                height += (u.h + m) //-0.5;// ???

            }

        }

        return height

    },


	findTarget: function ( uis, e ) {

        let i = uis.length;

        while( i-- ){
            if( R.onZone( uis[i], e.clientX, e.clientY ) ) return i
        }

        return -1;

    },

    // ----------------------
    //   ZONE
    // ----------------------

    findZone: function ( force = false ) {

        if( force ) R.needReZone = force;
        if( !R.needReZone ) return;

        let i = R.ui.length, u;

        while( i-- ){ 

            u = R.ui[i];
            R.getZone( u );

            // TODO need for group open at start !!!
            if( u.isGui ) u.calcUis();

        }

        R.needReZone = false;

    },

    onZone: function ( o, x, y ) {

        //console.log(o, x, y)

        if( x === undefined || y === undefined ) return false;

        let z = o.zone;
        let mx = x - z.x;// - o.dx;
        let my = y - z.y;

        //if( this.marginDiv ) e.clientY -= this.margin * 0.5
        //if( o.group && o.group.marginDiv ) my += o.group.margin * 0.5
        //if( o.group !== null ) mx -= o.dx

        let over = ( mx >= 0 ) && ( my >= 0 ) && ( mx <= z.w ) && ( my <= z.h );

        //if( o.marginDiv ) my -= o.margin * 0.5

        if( over ) o.local.set( mx, my );
        else o.local.neg();

        return over;

    },

    getWidth: function ( o ) {



        //return o.getDom().offsetWidth
        return o.getDom().clientWidth;

        //let r = o.getDom().getBoundingClientRect();
        //return (r.width)
        //return Math.floor(r.width)

    },

    getZone: function ( o ) {

        if( o.isCanvasOnly ) return;
        if( o.isEmpty ) return;

        const element = o.getDom()
        const r = element.getBoundingClientRect();
        o.zone = { x:r.left, y:r.top, w:r.width, h:r.height };
        if( o.isBottom ) o.zone.y = o.realTop;


    },

    // ----------------------
    //   CURSOR
    // ----------------------

    cursor: function ( name ) {

        name = name ? name : 'auto';
        if( name !== R.oldCursor ){
            document.body.style.cursor = name;
            R.oldCursor = name;
        }

    },

    // ----------------------
    //   CANVAS
    // ----------------------

    toCanvas: function ( o, w, h, force ) {

        if( !R.xmlserializer ) R.xmlserializer = new XMLSerializer()

        // prevent exesive redraw

        if( force && R.tmpTime !== null ) { clearTimeout(R.tmpTime); R.tmpTime = null;  }

        if( R.tmpTime !== null ) return;

        if( R.lock ) R.tmpTime = setTimeout( function(){ R.tmpTime = null; }, 10 );

        ///

        let isNewSize = false;
        if( w !== o.canvas.width || h !== o.canvas.height ) isNewSize = true;

        if( R.tmpImage === null ) R.tmpImage = new Image();

        let img = R.tmpImage; //new Image();

        let htmlString = R.xmlserializer.serializeToString( o.content );
        
        let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><foreignObject style="pointer-events: none; left:0;" width="100%" height="100%">'+ htmlString +'</foreignObject></svg>';

        img.onload = function() {

            let ctx = o.canvas.getContext("2d");

            if( isNewSize ){ 
                o.canvas.width = w;
                o.canvas.height = h
            }else{
                ctx.clearRect( 0, 0, w, h );
            }
            ctx.drawImage( this, 0, 0 );

            o.onDraw();

        };

        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        //img.src = 'data:image/svg+xml;base64,'+ window.btoa( svg );
        img.crossOrigin = '';


    },

    // ----------------------
    //   INPUT
    // ----------------------

    setHidden: function () {


        if( R.hiddenImput === null ){

            //let css = R.parent.css.txtselect + 'padding:0; width:auto; height:auto; '
            //let css = R.parent.css.txt + 'padding:0; width:auto; height:auto; text-shadow:none;'
            //css += 'left:10px; top:auto; border:none; color:#FFF; background:#000;' + hide;

            R.hiddenImput = document.createElement('input');
            R.hiddenImput.type = 'text';
            //R.hiddenImput.style.cssText = css + 'bottom:30px;' + (R.debugInput ? '' : 'transform:scale(0);');

            R.hiddenSizer = document.createElement('div');
            //R.hiddenSizer.style.cssText = css + 'bottom:60px;';
            
            document.body.appendChild( R.hiddenImput );
            document.body.appendChild( R.hiddenSizer );

        }

        let hide = R.debugInput ? '' : 'opacity:0; zIndex:0;';
        let css = R.parent.css.txtselect + 'padding:0; width:auto; height:auto; left:10px; top:auto; color:#FFF; background:#000;'+ hide;
        R.hiddenImput.style.cssText = css + 'bottom:10px;' + (R.debugInput ? '' : 'transform:scale(0);');
        R.hiddenSizer.style.cssText = css + 'bottom:40px;';

        R.hiddenImput.style.width = R.input.clientWidth + 'px';
        R.hiddenImput.value = R.str;
        R.hiddenSizer.innerHTML = R.str;

        R.hasFocus = true;

    },

    clearHidden: function ( p ) {

        if( R.hiddenImput === null ) return;
        R.hasFocus = false;

    },

    clickPos: function( x ){

        let i = R.str.length, l = 0, n = 0;
        while( i-- ){
            l += R.textWidth( R.str[n] );
            if( l >= x ) break;
            n++;
        }
        return n;

    },

    upInput: function ( x, down ) {

        if( R.parent === null ) return false;

        let up = false;
     
        if( down ){

            let id = R.clickPos( x );

            R.moveX = id;

            if( R.startX === -1 ){ 

                R.startX = id;
                R.cursorId = id;
                R.inputRange = [ R.startX, R.startX ];

            } else {
            
                let isSelection = R.moveX !== R.startX;

                if( isSelection ){
                    if( R.startX > R.moveX ) R.inputRange = [ R.moveX, R.startX ];
                    else R.inputRange = [ R.startX, R.moveX ];    
                }
            }

            up = true;
            
        } else {

            if( R.startX !== -1 ){

                R.hasFocus = true;
                R.hiddenImput.focus();
                R.hiddenImput.selectionStart = R.inputRange[0];
                R.hiddenImput.selectionEnd = R.inputRange[1];
                R.startX = -1;

                up = true;

            }

        }

        if( up ) R.selectParent();

        return up;

    },

    selectAll: function (){

        if(!R.parent) return

        R.str = R.input.textContent;
        R.inputRange = [0, R.str.length ]
        R.hasFocus = true;
        R.hiddenImput.focus();
        R.hiddenImput.selectionStart = R.inputRange[0];
        R.hiddenImput.selectionEnd = R.inputRange[1];
        R.cursorId = R.inputRange[1]
        R.selectParent()

    },

    selectParent: function (){

        var c = R.textWidth( R.str.substring( 0, R.cursorId ));
        var e = R.textWidth( R.str.substring( 0, R.inputRange[0] ));
        var s = R.textWidth( R.str.substring( R.inputRange[0],  R.inputRange[1] ));

        R.parent.select( c, e, s, R.hiddenSizer.innerHTML );

    },

    textWidth: function ( text ){

        if( R.hiddenSizer === null ) return 0;
        text = text.replace(/ /g, '&nbsp;');
        R.hiddenSizer.innerHTML = text;
        return R.hiddenSizer.clientWidth;

    },


    clearInput: function () {

        if( R.parent === null ) return;
        if( !R.firstImput ) R.parent.validate( true );

        R.clearHidden();
        R.parent.unselect();

        //R.input.style.background = 'none';
        R.input.style.background = R.parent.colors.back;
        R.input.style.borderColor = R.parent.colors.border;
        //R.input.style.color = R.parent.colors.text;
        R.parent.isEdit = false;

        R.input = null;
        R.parent = null;
        R.str = '',
        R.firstImput = true;

    },

    setInput: function ( Input, parent ) {

        R.clearInput();
        
        R.input = Input;
        R.parent = parent;

        R.input.style.background = R.parent.colors.backoff;
        R.input.style.borderColor = R.parent.colors.select;
        //R.input.style.color = R.parent.colors.textSelect;
        R.str = R.input.textContent;

        R.setHidden();

    },

    keydown: function ( e ) {

        if( R.parent === null ) return;

        let keyCode = e.which, isShift = e.shiftKey;

        //console.log( keyCode )

        R.firstImput = false;


        if (R.hasFocus) {
            // hack to fix touch event bug in iOS Safari
            window.focus();
            R.hiddenImput.focus();

        }


        R.parent.isEdit = true;

       // e.preventDefault();

        // add support for Ctrl/Cmd+A selection
        //if ( keyCode === 65 && (e.ctrlKey || e.metaKey )) {
            //R.selectText();
            //e.preventDefault();
            //return self.render();
        //}

        if( keyCode === 13 ){ //enter

            R.clearInput();

        //} else if( keyCode === 9 ){ //tab key

           // R.input.textContent = '';

        } else {

            if( R.input.isNum ){
                if ( ((e.keyCode > 47) && (e.keyCode < 58)) || ((e.keyCode > 95) && (e.keyCode < 106)) || e.keyCode === 190 || e.keyCode === 110 || e.keyCode === 8 || e.keyCode === 109 ){
                    R.hiddenImput.readOnly = false;
                } else {
                    R.hiddenImput.readOnly = true;
                }
            } else {
                R.hiddenImput.readOnly = false;
            }

        }

    },

    keyup: function ( e ) {

        if( R.parent === null ) return;

        R.str = R.hiddenImput.value;

        if( R.parent.allEqual ) R.parent.sameStr( R.str );// numeric samùe value
        else R.input.textContent = R.str;

        R.cursorId = R.hiddenImput.selectionStart;
        R.inputRange = [ R.hiddenImput.selectionStart, R.hiddenImput.selectionEnd ];

        R.selectParent();

        //if( R.parent.allway ) 
        R.parent.validate();

    },

    // ----------------------
    //
    //   LISTENING
    //
    // ----------------------

    loop: function () {

        if( R.isLoop ) requestAnimationFrame( R.loop );
        R.update();

    },

    update: function () {

        let i = R.listens.length;
        while( i-- ) R.listens[i].listening();

    },

    removeListen: function ( proto ) {

        let id = R.listens.indexOf( proto );
        if( id !== -1 ) R.listens.splice(id, 1);
        if( R.listens.length === 0 ) R.isLoop = false;

    },

    addListen: function ( proto ) {

        let id = R.listens.indexOf( proto );

        if( id !== -1 ) return false; 

        R.listens.push( proto );

        if( !R.isLoop ){
            R.isLoop = true;
            R.loop();
        }

        return true;

    },

}

export const Roots = R;