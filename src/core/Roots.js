
/**
 * @author lth / https://github.com/lo-th
 */

// INTENAL FUNCTION

var R = {

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
    firstImput: true,
    callbackImput: null,

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

        var n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
        else return false;  

    },

    remove: function ( o ) {

        var i = R.ui.indexOf( o );
        
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

        var domElement = document.body;

        R.isMobile = R.testMobile();

        if( R.isMobile ){
            domElement.addEventListener( 'touchstart', R, false );
            domElement.addEventListener( 'touchend', R, false );
            domElement.addEventListener( 'touchmove', R, false );
        }else{
            domElement.addEventListener( 'mousedown', R, false );
            domElement.addEventListener( 'contextmenu', R, false );
            domElement.addEventListener( 'wheel', R, false );
            document.addEventListener( 'mousemove', R, false );
            document.addEventListener( 'mouseup', R, false );
        }

        window.addEventListener( 'keydown', R, false );
        window.addEventListener( 'resize', R.resize , false );

        R.isEventsInit = true;

    },

    removeEvents: function () {

        if( !R.isEventsInit ) return;

        var domElement = document.body;

        if( R.isMobile ){
            domElement.removeEventListener( 'touchstart', R, false );
            domElement.removeEventListener( 'touchend', R, false );
            domElement.removeEventListener( 'touchmove', R, false );
        }else{
            domElement.removeEventListener( 'mousedown', R, false );
            domElement.removeEventListener( 'contextmenu', R, false );
            domElement.removeEventListener( 'wheel', R, false );
            document.removeEventListener( 'mousemove', R, false );
            document.removeEventListener( 'mouseup', R, false );
        }

        window.removeEventListener( 'keydown', R );
        window.removeEventListener( 'resize', R.resize  );

        R.isEventsInit = false;

    },

    resize: function () {

        R.needReZone = true;

        var i = R.ui.length, u;
        
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
       
        var e = R.e;

        if( event.type === 'keydown') R.editText( event );

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

        var i = R.ui.length, next = -1, u, x, y;

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

        var lng = uis.length, u, i, px = 0, my = 0;

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

        var i = uis.length;

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

        var z = o.zone;
        var mx = x - z.x;
        var my = y - z.y;

        var over = ( mx >= 0 ) && ( my >= 0 ) && ( mx <= z.w ) && ( my <= z.h );

        if( over ) o.local.set( mx, my );
        else o.local.neg();

        return over;

    },

    getZone: function ( o ) {

        if( o.isCanvasOnly ) return;
        var r = o.getDom().getBoundingClientRect();
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

        var isNewSize = false;
        if( w !== o.canvas.width || h !== o.canvas.height ) isNewSize = true;

        if( R.tmpImage === null ) R.tmpImage = new Image();

        var img = R.tmpImage; //new Image();

        var htmlString = R.xmlserializer.serializeToString( o.content );
        
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><foreignObject style="pointer-events: none; left:0;" width="100%" height="100%">'+ htmlString +'</foreignObject></svg>';

        img.onload = function() {

            var ctx = o.canvas.getContext("2d");

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

    clearInput: function () {

        if( R.input === null ) return;
        if( !R.firstImput ) R.callbackImput();

        R.input.style.background = 'none';
        R.callbackImput = null;
        R.input = null;
        R.firstImput = true;

    },

    setInput: function ( Input, Callback, color ) {

        R.clearInput();
        
        R.callbackImput = Callback;
        R.input = Input;
        R.input.style.background = color;

    },

    select: function () {

        document.execCommand( "selectall", null, false );

    },

    editText: function ( e ) {

        if( R.input === null ) return;

        if( e.keyCode === 13 ){ //enter

            R.callbackImput();
            R.clearInput();

        } else {

            if( R.input.isNum ){
                if ( ((e.keyCode > 95) && (e.keyCode < 106)) || e.keyCode === 110 || e.keyCode === 109 ){
                    if( R.firstImput ){ R.input.textContent = e.key; R.firstImput = false; }
                    else R.input.textContent += e.key;
                }
            } else {
                if( R.firstImput ){ R.input.textContent = e.key; R.firstImput = false; }
                else R.input.textContent += e.key;
            }

        }

    },

    // ----------------------
    //   LISTENING
    // ----------------------

    loop: function () {

        if( R.isLoop ) requestAnimationFrame( R.loop );
        R.update();

    },

    update: function () {

        var i = R.listens.length;
        while(i--) R.listens[i].listening();

    },

    removeListen: function ( proto ) {

        var id = R.listens.indexOf( proto );
        if( id !== -1 ) R.listens.splice(id, 1);
        if( R.listens.length === 0 ) R.isLoop = false;

    },

    addListen: function ( proto ) {

        var id = R.listens.indexOf( proto );

        if( id !== -1 ) return; 

        R.listens.push( proto );

        if( !R.isLoop ){
            R.isLoop = true;
            R.loop();
        }

    },

}

var Roots = R;
export { Roots };