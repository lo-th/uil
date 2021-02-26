
/**
 * @author lth / https://github.com/lo-th
 */

// INTENAL FUNCTION

const R = {

	ui: [],

	ID: null,
    lock:false,
    wlock:false,
    current:-1,

	needReZone: true,
	isEventsInit: false,

    prevDefault: ['contextmenu', 'mousedown', 'mousemove', 'mouseup'],

	xmlserializer: new XMLSerializer(),
	tmpTime: null,
    tmpImage: null,

    oldCursor:'auto',

    input: null,
    parent: null,
    firstImput: true,
    //callbackImput: null,
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

    

	add: function ( o ) {

        R.ui.push( o );
        R.getZone( o );

        if( !R.isEventsInit ) R.initEvents();

    },

    testMobile: function () {

        let n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
        else return false;  

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

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    initEvents: function () {

        if( R.isEventsInit ) return;

        let dom = document.body;

        R.isMobile = R.testMobile();

        if( R.isMobile ){
            dom.addEventListener( 'touchstart', R, false );
            dom.addEventListener( 'touchend', R, false );
            dom.addEventListener( 'touchmove', R, false );
        }else{
            dom.addEventListener( 'mousedown', R, false );
            dom.addEventListener( 'contextmenu', R, false );
            dom.addEventListener( 'wheel', R, false );
            document.addEventListener( 'mousemove', R, false );
            document.addEventListener( 'mouseup', R, false );
        }

        window.addEventListener( 'keydown', R, false );
        window.addEventListener( 'keyup', R, false );
        window.addEventListener( 'resize', R.resize , false );
        //window.addEventListener( 'mousedown', R, false );

        R.isEventsInit = true;

    },

    removeEvents: function () {

        if( !R.isEventsInit ) return;

        let dom = document.body;

        if( R.isMobile ){
            dom.removeEventListener( 'touchstart', R, false );
            dom.removeEventListener( 'touchend', R, false );
            dom.removeEventListener( 'touchmove', R, false );
        }else{
            dom.removeEventListener( 'mousedown', R, false );
            dom.removeEventListener( 'contextmenu', R, false );
            dom.removeEventListener( 'wheel', R, false );
            document.removeEventListener( 'mousemove', R, false );
            document.removeEventListener( 'mouseup', R, false );
        }

        window.removeEventListener( 'keydown', R );
        window.removeEventListener( 'keyup', R );
        window.removeEventListener( 'resize', R.resize  );

        R.isEventsInit = false;

    },

    resize: function () {

        R.needReZone = true;

        let i = R.ui.length, u;
        
        while( i-- ){

            u = R.ui[i];
            if( u.isGui && !u.isCanvasOnly && u.autoResize ) u.setHeight();
        
        }

    },

    // ----------------------
    //   HANDLE EVENTS
    // ----------------------
    

    handleEvent: function ( event ) {

        //if(!event.type) return;

      //  console.log( event.type )

        if( event.type.indexOf( R.prevDefault ) !== -1 ) event.preventDefault(); 

        if( event.type === 'contextmenu' ) return; 

        //if( event.type === 'keydown'){ R.editText( event ); return;}

        //if( event.type !== 'keydown' && event.type !== 'wheel' ) event.preventDefault();
        //event.stopPropagation();

        R.findZone();
       
        let e = R.e;

        if( event.type === 'keydown') R.keydown( event );
        if( event.type === 'keyup') R.keyup( event );

        if( event.type === 'wheel' ) e.delta = event.deltaY > 0 ? 1 : -1;
        else e.delta = 0;
        
        e.clientX = event.clientX || 0;
        e.clientY = event.clientY || 0;
        e.type = event.type;

        // mobile

        if( R.isMobile ){

            if( event.touches && event.touches.length > 0 ){
        
                e.clientX = event.touches[ 0 ].clientX || 0;
                e.clientY = event.touches[ 0 ].clientY || 0;

            }

            if( event.type === 'touchstart') e.type = 'mousedown';
            if( event.type === 'touchend') e.type = 'mouseup'
            if( event.type === 'touchmove') e.type = 'mousemove';

        }
        
        
        /*
        if( event.type === 'touchstart'){ e.type = 'mousedown'; R.findID( e ); }
        if( event.type === 'touchend'){ e.type = 'mouseup';  if( R.ID !== null ) R.ID.handleEvent( e ); R.clearOldID(); }
        if( event.type === 'touchmove'){ e.type = 'mousemove';  }
        */


        if( e.type === 'mousedown' ) R.lock = true;
        if( e.type === 'mouseup' ) R.lock = false;

        if( R.isMobile && e.type === 'mousedown' ) R.findID( e );
        if( e.type === 'mousemove' && !R.lock ) R.findID( e );
        

        if( R.ID !== null ){

            if( R.ID.isCanvasOnly ) {

                e.clientX = R.ID.mouse.x;
                e.clientY = R.ID.mouse.y;

            }

            R.ID.handleEvent( e );

        }

        if( R.isMobile && e.type === 'mouseup' ) R.clearOldID();

    },

    // ----------------------
    //   ID
    // ----------------------

    findID: function ( e ) {

        let i = R.ui.length, next = -1, u, x, y;

        while( i-- ){

            u = R.ui[i];

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
    //   GUI / GROUP FUNCTION
    // ----------------------

    calcUis: function ( uis, zone, py ) {

        let lng = uis.length, u, i, px = 0, my = 0;

        for( i = 0; i < lng; i++ ){

            u = uis[i];

            u.zone.w = u.w;
            u.zone.h = u.h;

            if( !u.autoWidth ){

                if( px === 0 ) py += u.h + 1;

                u.zone.x = zone.x + px;
                u.zone.y = px === 0 ? py - u.h : my;

                my = u.zone.y;
                
                px += u.w;
                if( px + u.w > zone.w ) px = 0;

            } else {

                u.zone.x = zone.x;
                u.zone.y = py;
                py += u.h + 1;

            }

            if( u.isGroup ) u.calcUis();

        }

    },


	findTarget: function ( uis, e ) {

        let i = uis.length;

        while( i-- ){
            if( R.onZone( uis[i], e.clientX, e.clientY ) ) return i;
        }

        return -1;

    },

    // ----------------------
    //   ZONE
    // ----------------------

    findZone: function ( force ) {

        if( !R.needReZone && !force ) return;

        var i = R.ui.length, u;

        while( i-- ){ 

            u = R.ui[i];
            R.getZone( u );
            if( u.isGui ) u.calcUis();

        }

        R.needReZone = false;

    },

    onZone: function ( o, x, y ) {

        if( x === undefined || y === undefined ) return false;

        let z = o.zone;
        let mx = x - z.x;
        let my = y - z.y;

        let over = ( mx >= 0 ) && ( my >= 0 ) && ( mx <= z.w ) && ( my <= z.h );

        if( over ) o.local.set( mx, my );
        else o.local.neg();

        return over;

    },

    getZone: function ( o ) {

        if( o.isCanvasOnly ) return;
        let r = o.getDom().getBoundingClientRect();
        o.zone = { x:r.left, y:r.top, w:r.width, h:r.height };

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

            let hide = R.debugInput ? '' : 'opacity:0; zIndex:0;';

            let css = R.parent.css.txt + 'padding:0; width:auto; height:auto; text-shadow:none;'
            css += 'left:10px; top:auto; border:none; color:#FFF; background:#000;' + hide;

            R.hiddenImput = document.createElement('input');
            R.hiddenImput.type = 'text';
            R.hiddenImput.style.cssText = css + 'bottom:30px;' + (R.debugInput ? '' : 'transform:scale(0);');;

            R.hiddenSizer = document.createElement('div');
            R.hiddenSizer.style.cssText = css + 'bottom:60px;';
            
            document.body.appendChild( R.hiddenImput );
            document.body.appendChild( R.hiddenSizer );

        }

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

    selectParent: function (){

        var c = R.textWidth( R.str.substring( 0, R.cursorId ));
        var e = R.textWidth( R.str.substring( 0, R.inputRange[0] ));
        var s = R.textWidth( R.str.substring( R.inputRange[0],  R.inputRange[1] ));

        R.parent.select( c, e, s );

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
        R.input.style.background = R.parent.colors.inputBg;
        R.input.style.borderColor = R.parent.colors.inputBorder;
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

        R.input.style.background = R.parent.colors.inputOver;
        R.input.style.borderColor = R.parent.colors.inputBorderSelect;
        R.str = R.input.textContent;

        R.setHidden();

    },

    /*select: function () {

        document.execCommand( "selectall", null, false );

    },*/

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

        if( id !== -1 ) return; 

        R.listens.push( proto );

        if( !R.isLoop ){
            R.isLoop = true;
            R.loop();
        }

    },

}

export const Roots = R;