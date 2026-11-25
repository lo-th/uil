/**
 * @author lth / https://github.com/lo-th
 */

const REVISION = '5.0.6';

// INTENAL FUNCTION

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

    prevDefault: ['contextmenu'],
    pointerEvent: ['pointerdown', 'pointermove', 'pointerup'],
    eventOut: ['pointercancel', 'pointerout', 'pointerleave'],

	xmlserializer: null,
	tmpTime: null,
    tmpImage: null,

    oldCursor:'auto',

    resizeTimeout:null,

    input: null,
    parent: null,
    firstImput: true,
    
    hiddenImput: null,
    hiddenSizer: null,
    hasFocus: false,
    startInput: false,
    inputRange: [0,0],
    cursorId: 0,
    str:'',
    pos: 0,
    startX:-1,
    moveX:-1,
    debugInput:false,
    isWheelInit: false,

    // Animation loo
    isLoop: false,
    listens: [],
    inputs: [],
    keys: new Set(),

    e:{
        type:null,
        clientX:0,
        clientY:0,
        pageX: 0,
        pageY: 0,
        pressure: 0,
        isPrimary: true,
        pointerType: '',
        keyCode:NaN,
        key:null,
        delta:0,
    },

    isMobile: false,
    now: null,

    injectCss: (css, styleName, parent) => {

        const CSS_ID = styleName || 'codeflask-style';
        const PARENT = parent || document.head;

        if (!css) return false

        if (document.getElementById(CSS_ID)) return true

        const style = document.createElement('style');
        style.innerHTML = css;
        style.id = CSS_ID;
        PARENT.appendChild(style);
        return true

    },

    getTime: () => {
        return ( self.performance && self.performance.now ) ? self.performance.now.bind( performance ) : Date.now;
    },

    testMobile: () => {

        let n = navigator.userAgent;
        if (n.match(/Android/i) || n.match(/webOS/i) || n.match(/iPhone/i) || n.match(/iPad/i) || n.match(/iPod/i) || n.match(/BlackBerry/i) || n.match(/Windows Phone/i)) return true;
        else return false;  

    },

    // ----------------------
    //   ADD / REMOVE
    // ----------------------

	add: ( o ) => {

        R.ui.push( o );
        R.getZone( o );

        if( !R.isEventsInit ) R.initEvents();

    },

    remove: ( o ) => {

        if ( R.ID === o ) R.clearOldID();

        let i = R.ui.indexOf( o );
        
        if ( i !== -1 ) {
            R.removeListen( o );
            R.ui.splice( i, 1 ); 
        }

        if ( R.ui.length === 0 ) {
            R.removeEvents();
        }

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    initEvents: () => {

        if ( R.isEventsInit ) return;

        R.isMobile = R.testMobile();
        R.now = R.getTime();

        if ( R.isMobile ) document.body.style.touchAction = 'none';

        document.addEventListener( 'pointermove', R, { passive: true } );
        document.addEventListener( 'pointerdown', R, { passive: true } );
        document.addEventListener( 'pointerup', R, { passive: true } );
        document.addEventListener( 'pointercancel', R, { passive: true } );
        document.addEventListener( 'pointerleave', R, { passive: true } );

        R.onResize = () => {
            R.needReZone = true;
            R.needResize = true;
            R.resize();
        };

        R.onBlur = () => {
            R.keys.clear();
            R.lock = false;
            R.clearOldID();
        };

        window.addEventListener( 'resize', R.onResize, { passive: true } );
        window.addEventListener( 'blur', R.onBlur, { passive: true } );

        R.isEventsInit = true;
        R.dom = document;

    },

    removeEvents: () => {

        if ( !R.isEventsInit ) return;

        R.setWheel( false );
        R.clearInput();

        document.removeEventListener( 'pointercancel', R );
        document.removeEventListener( 'pointerleave', R );
        document.removeEventListener( 'pointermove', R );
        document.removeEventListener( 'pointerdown', R );
        document.removeEventListener( 'pointerup', R );
        window.removeEventListener( 'resize', R.onResize );
        window.removeEventListener( 'blur', R.onBlur );

        R.isEventsInit = false;

    },

    resize: () => {

        R.needResize = false;
        if (R.resizeTimeout) clearTimeout(R.resizeTimeout);

        R.resizeTimeout = setTimeout( () => {

            let i = R.ui.length, u;
            
            while( i-- ){

                u = R.ui[i];
                if( u.isGui && !u.isCanvasOnly && u.autoResize ){
                    u.calc();
                    if(u.innerHeight) u.innerHeight = u.content.offsetHeight;
                }
            
            }

            R.needReZone = true;
            R.resizeTimeout = null;

        }, 100);

    },

    // ----------------------
    //   HANDLE EVENTS
    // ----------------------

    fakeUp: () => {

        R.handleEvent( {type:'pointerup'} );

    },

    handleEvent: ( event ) => {

        const type = event.type;

        // 1. Sortie immédiate pour le clavier (évite tout calcul de souris/zone)
        if ( type === 'keydown' ) { R.keydown( event ); return; }
        if ( type === 'keyup' ) { R.keyup( event ); return; }

        // 2. Si on ne surveille aucune UI et qu'on ne clique pas, ignorer le survol vide rapidement
        if ( R.ui.length === 0 ) return;

        if ( R.needResize ) R.resize();
        if ( R.needReZone || R.forceZone ) R.findZone( R.forceZone );

        const ptype = event.pointerType;
        const e = R.e;

        e.pageX = event.pageX || 0;
        e.pageY = event.pageY || 0;
        e.clientX = ( ptype === 'touch' ? event.pageX : event.clientX ) || 0;
        e.clientY = ( ptype === 'touch' ? event.pageY : event.clientY ) || 0;
        e.pressure = event.pressure || 0;
        e.isPrimary = event.isPrimary !== undefined ? event.isPrimary : true;
        e.pointerType = ptype || '';
        e.delta = type === 'wheel' ? ( event.deltaY > 0 ? 1 : -1 ) : 0;

        if ( type === 'pointerdown' ) {

            e.type = 'mousedown';
            R.downTime = R.now();

            if ( R.downTime - R.prevTime < 200 ) { R.selectAll(); return; }

            R.prevTime = R.downTime;
            R.forceZone = false;
            R.clearInput();
            
            if ( R.ID === null || R.isMobile ) R.findID( e );

            R.lock = true;


            //if ( R.isMobile ) R.findID( e );
            if ( R.ID !== null && event.target?.setPointerCapture ) {
                try { event.target.setPointerCapture( event.pointerId ); } catch (_) {}
            }

        } else if ( type === 'pointerup' || type === 'pointercancel' ) {

            e.type = 'mouseup';
            R.lock = false;

        } else if ( type === 'pointermove' ) {

            e.type = 'mousemove';
            if ( !R.lock ) R.findID( e );

        } else if ( type === 'pointerleave' ) {

            if ( !R.lock ) R.clearOldID();
            return;

        } else {

            e.type = type;

        }

        if ( R.ID !== null ) {

            if ( R.ID.isCanvasOnly ) {
                e.clientX = R.ID.mouse.x;
                e.clientY = R.ID.mouse.y;
            }

            R.ID.handleEvent( e );

        }

        if ( R.isMobile && e.type === 'mouseup' ) R.clearOldID();

    },

    // ----------------------
    //   ID
    // ----------------------

    setWheel: ( active ) => {

        if ( R.isMobile ) return;

        if ( active && !R.isWheelInit ) {
            R.dom.addEventListener( 'wheel', R, { passive: false } );
            R.isWheelInit = true;
        } else if ( !active && R.isWheelInit ) {
            R.dom.removeEventListener( 'wheel', R );
            R.isWheelInit = false;
        }

    },

    findID: ( e ) => {

        let i = R.ui.length, next = -1, u, x, y;

        while ( i-- ) {

            u = R.ui[i];

            if ( u.isCanvasOnly ) {
                x = u.mouse.x;
                y = u.mouse.y;
            } else {
                x = e.clientX;
                y = e.clientY;
            }

            if ( R.onZone( u, x, y ) ) {

                next = i;

                if ( next !== R.current ) {
                    R.clearOldID();
                    R.current = next;
                    R.ID = u;
                    R.setWheel( true ); // Active le wheel uniquement ici
                }
                break;
            }

        }

        if ( next === -1 ) R.clearOldID();

    },

    clearOldID: () => {

        if ( !R.ID ) return;
        R.current = -1;
        R.ID.reset();
        R.ID = null;
        R.setWheel( false ); // Coupe le wheel dès que la souris sort
        R.cursor();

    },

    // ----------------------
    //  GUI / GROUP FUNCTION
    //  need update if zone change !!
    // ----------------------

    calcUis: ( uis, zone, py, group = false ) => {

        if( R.debug ) console.log('calc_uis !!');

        let i = uis.length, u, px = 0, n = 0, tw;

        let height = 0;

        while( i-- ){

            u = uis[n];
            n++;

            if( !group && u.isGroup ) u.calcUis();
            //if( u.isGroup ) u.calcUis();

            let m = u.margin || 0;

            u.zone.w = u.w;
            u.zone.h = u.h + m;
            
            if( !u.autoWidth ){

                if( px === 0 ) height += u.h + m;

                u.zone.x = zone.x + px;
                u.zone.y = py;// + u.mtop
                //if(div) u.zone.y += m * 0.5

                tw = R.getWidth(u);
                //if(u.isKnob) console.log(tw)
                if( tw ) u.zone.w = u.w = tw;
                else if( u.fw ) u.zone.w = u.w = u.fw;

                //if(u.isKnob) u.zone.w = 93//console.log('knob', tw)
                //if(u.isKnob) console.log(u.zone.w)
                
                px += u.zone.w+1;

                if( px >= zone.w ) {

                // TODO solve stress test but break all ?
                //if( px+u.zone.w >= zone.w ) { 
                    py += u.h + m;
                    //if(div) py += m * 0.5
                    px = 0;
                }

            } else {

                px = 0;

                u.zone.x = zone.x + u.dx;
                u.zone.y = py;

                if ( u.isGroup ) u.calcUis();

                py += u.h + m;
                height += (u.h + m); //-0.5;// ???

            }

        }

        return height

    },

    findTarget: ( uis, e ) => {

        let low = 0;
        let high = uis.length - 1;
        const y = e.clientY;

        while ( low <= high ) {
            const mid = ( low + high ) >> 1;
            const u = uis[ mid ];
            const z = u.zone;

            if ( y < z.y ) {
                high = mid - 1;
            } else if ( y > z.y + z.h ) {
                low = mid + 1;
            } else {
                // La souris est dans la bande verticale Y, on vérifie X (et les éléments sur la même ligne si autoWidth = false)
                if ( R.onZone( u, e.clientX, y ) ) return mid;
                // Si plusieurs boutons sont côte à côte sur la même ligne Y, on vérifie les voisins proches
                let left = mid - 1;
                while ( left >= 0 && uis[left].zone.y === z.y ) {
                    if ( R.onZone( uis[left], e.clientX, y ) ) return left;
                    left--;
                }
                let right = mid + 1;
                while ( right < uis.length && uis[right].zone.y === z.y ) {
                    if ( R.onZone( uis[right], e.clientX, y ) ) return right;
                    right++;
                }
                return -1;
            }
        }

        return -1;

    },


    // ----------------------
    //   ZONE
    // ----------------------

    findZone: ( force = false ) => {

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

    onZone: ( o, x, y ) => {

        //

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

    getWidth: ( o ) => {



        //return o.getDom().offsetWidth
        return o.getDom().clientWidth;

        //let r = o.getDom().getBoundingClientRect();
        //return (r.width)
        //return Math.floor(r.width)

    },

    getZone: ( o ) => {

        if( o.isCanvasOnly || o.isCanvas ) return;
        if( o.isEmpty ) return;

        const element = o.getDom();
        const r = element.getBoundingClientRect();
        o.zone = { x:r.left, y:r.top, w:r.width, h:r.height };
        if( o.isBottom ) o.zone.y = o.realTop;

    },

    // ----------------------
    //   CURSOR
    // ----------------------

    cursor: ( name ) => {

        name = name ? name : 'auto';
        if( name !== R.oldCursor ){
            document.body.style.cursor = name;
            R.oldCursor = name;
        }

    },

    // ----------------------
    //   CANVAS
    // ----------------------

    toCanvas: ( o, w, h, force, scale = 1 ) => {

        if ( !o.canvas ) return;

        if( !R.xmlserializer ) R.xmlserializer = new XMLSerializer();

        // prevent exesive redraw
        if( force && R.tmpTime !== null ) { clearTimeout(R.tmpTime); R.tmpTime = null;  }
        if( R.tmpTime !== null ) return;
        if( R.lock ) R.tmpTime = setTimeout( ()=>{ R.tmpTime = null; }, 16 );

        //console.log('up')

        const targetW = Math.round( w * scale );
        const targetH = Math.round( h * scale );
        const isNewSize = ( targetW !== o.canvas.width || targetH !== o.canvas.height );

        ///

        if ( !o._canvasImg ) o._canvasImg = new Image();
        const img = o._canvasImg;

        //if( R.tmpImage === null ) R.tmpImage = new Image();

        //let img = R.tmpImage; //new Image();

        let htmlString = R.xmlserializer.serializeToString( o.content );
        //let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+targetW+'" height="'+targetH+'"><foreignObject style="pointer-events: none; left:0;" width="'+w+'" height="'+h+'">'+ htmlString +'</foreignObject></svg>';

        let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="'+targetW+'" height="'+targetH+'" viewBox="0 0 '+w+' '+h+'">' +
              '<foreignObject style="pointer-events: none; left:0;" width="'+w+'" height="'+h+'">'+ htmlString +'</foreignObject>' +
              '</svg>';

        img.onload = function() {

            if ( !o.canvas ) return;
            let ctx = o.canvas.getContext("2d");

            if( isNewSize ){ 
                o.canvas.width = targetW;
                o.canvas.height = targetH;
            }else {
                ctx.clearRect( 0, 0, targetW, targetH );
            }
            ctx.drawImage( this, 0, 0, targetW, targetH );

            o.onDraw();

        };

        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        //img.src = 'data:image/svg+xml;base64,'+ window.btoa( svg );
        //img.crossOrigin = '';


    },

    // ----------------------
    //   INPUT
    // ----------------------

    addInput: function ( input, parent ) {

        input.setAttribute( 'tabindex', '0' );
        R.inputs.push( { input: input, parent: parent } );

        // Permet d'entrer dans le premier champ avec Tab depuis l'extérieur
        /*input.addEventListener( 'focus', () => {
            if ( R.parent !== parent ) {
                R.setInput( input, parent );
                R.selectAll();
            }
        });*/

    },

    removeInput: function ( parent ) {

        R.inputs = R.inputs.filter( item => item.parent !== parent );

    },

    setInput: ( Input, parent ) => {

        R.clearInput();

        R.input = Input;
        R.parent = parent;

        R.input.style.background = R.parent.colors.backoff;
        R.input.style.borderColor = R.parent.colors.select;
        R.str = R.input.textContent;

        R.setHidden();

        // Écoute le clavier uniquement pendant la saisie
        document.addEventListener( 'keydown', R, false );
        document.addEventListener( 'keyup', R, false );

    },

    clearInput: () => {

        if ( R.parent === null ) return;
        if ( !R.firstImput ) R.parent.validate( true );

        document.removeEventListener( 'keydown', R, false );
        document.removeEventListener( 'keyup', R, false );

        R.clearHidden();
        R.parent.unselect();

        R.input.style.background = R.parent.colors.back || 'none';
        R.input.style.borderColor = R.parent.colors.border;
        R.parent.isEdit = false;

        R.input = null;
        R.parent = null;
        R.str = '';
        R.firstImput = true;

    },

    setHidden: () => {


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

        let hide = R.debugInput ? '' : 'opacity:0; z-index:0;';
        let css = R.parent.css.txtselect + 'padding:0; width:auto; height:auto; left:10px; top:auto; color:#FFF; background:#000;'+ hide;
        R.hiddenImput.style.cssText = css + 'bottom:10px;' + (R.debugInput ? '' : 'transform:scale(0);');
        R.hiddenSizer.style.cssText = css + 'bottom:40px;';

        R.hiddenImput.style.width = R.input.clientWidth + 'px';
        R.hiddenImput.value = R.str;
        R.hiddenSizer.innerHTML = R.str;

        R.hasFocus = true;

    },

    clearHidden: ( p ) => {

        if( R.hiddenImput === null ) return;
        R.hasFocus = false;

    },

    clickPos: ( x ) => {

        let i = R.str.length, l = 0, n = 0;
        while( i-- ){
            l += R.textWidth( R.str[n] );
            if( l >= x ) break;
            n++;
        }
        return n;

    },

    upInput: ( x, down ) => {

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

    selectAll: () => {

        if(!R.parent) return

        R.str = R.input.textContent;
        R.inputRange = [ 0, R.str.length ];
        R.hasFocus = true;
        R.hiddenImput.focus();
        R.hiddenImput.selectionStart = R.inputRange[0];
        R.hiddenImput.selectionEnd = R.inputRange[1];
        R.cursorId = R.inputRange[1];
        R.selectParent();

    },

    selectParent: () => {

        const c = R.textWidth( R.str.substring( 0, R.cursorId ));
        const e = R.textWidth( R.str.substring( 0, R.inputRange[0] ));
        const s = R.textWidth( R.str.substring( R.inputRange[0],  R.inputRange[1] ));
        const full = R.textWidth( R.str );

        R.parent.select( c, e, s, R.hiddenSizer.innerHTML, full );

    },

    textWidth: ( text ) => {

        if (!text) return 0;
        if( R.parent === null ) return 0;
        if(!R.hiddenSizer) R.setHidden();

        R.hiddenSizer.innerHTML = text.replace( / /g, '&nbsp;' );
        return R.hiddenSizer.clientWidth;

    },

    // ----------------------
    //   KEY
    // ----------------------

    keydown: ( e ) => {

        if ( R.parent === null ) return;

        if ( e.key === 'Shift' ) { 
            R.keys.add( e.key );
            return;
        }

        const isShift = R.keys.has( 'Shift' );

        if ( e.key === 'Enter' ) {
            R.clearInput();
            return;
        }

        if ( e.key === 'Tab' ) {
            e.preventDefault();

            let visible = R.inputs.filter( item => item.input.offsetParent !== null );
            if ( visible.length === 0 ) return;

            let idx = visible.findIndex( item => item.input === R.input );
            let nextIdx = isShift ? idx - 1 : idx + 1;

            if ( nextIdx >= visible.length ) nextIdx = 0;
            if ( nextIdx < 0 ) nextIdx = visible.length - 1;

            let next = visible[ nextIdx ];

            R.setInput( next.input, next.parent );
            R.parent.isEdit = true;
            R.selectAll();
            return;
        }

        R.firstImput = false;

        if ( R.hasFocus ) {
            window.focus();
            R.hiddenImput.focus();
        }

        R.parent.isEdit = true;

        if ( R.input.isNum ) {
            const ok = /^[0-9.\-]$/.test(e.key) || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key) || e.ctrlKey || e.metaKey;
            R.hiddenImput.readOnly = !ok;
        } else {
            R.hiddenImput.readOnly = false;
        }

    },

    keyup: ( e ) => {

        if ( R.parent === null ) return;

        if ( e.key === 'Shift' ) { 
            R.keys.delete( e.key );
            return;
        }

        // Ne pas écraser la sélection faite par Tab
        if ( e.key === 'Tab' ) return;

        R.str = R.hiddenImput.value;

        if ( R.parent.allEqual ) R.parent.sameStr( R.str );
        else R.input.textContent = R.str;

        R.cursorId = R.hiddenImput.selectionStart;
        R.inputRange = [ R.hiddenImput.selectionStart, R.hiddenImput.selectionEnd ];

        R.selectParent();

        R.parent.validate();

    },

    /*keydown: ( e ) => {

        if( R.parent === null ) return;

        if (e.key === 'Shift'){ 
            R.keys.add(e.key);
        }

        //let keyCode = e.which, isShift = e.shiftKey;

        //console.log(e.key)

        R.firstImput = false;

        const isShift = R.keys.has('Shift');


        if (R.hasFocus) {
            // hack to fix touch event bug in iOS Safari
            window.focus();
            R.hiddenImput.focus();

        }

        R.parent.isEdit = true;

        if (e.key === 'Enter') {
            R.clearInput();
        } else if (e.key === 'Tab') {
            console.log('is Tab')

             e.preventDefault();

            // Ne garder que les champs visibles à l'écran
            let visible = R.inputs.filter( item => item.input.offsetParent !== null );
            if ( visible.length === 0 ) return;

            let idx = visible.findIndex( item => item.input === R.input );
            let nextIdx = isShift ? idx - 1 : idx + 1;

            // Boucler au début ou à la fin
            if ( nextIdx >= visible.length ) nextIdx = 0;
            if ( nextIdx < 0 ) nextIdx = visible.length - 1;

            let next = visible[ nextIdx ];

            R.setInput( next.input, next.parent );
            R.parent.isEdit = true;
            R.selectAll(); // Sélectionne le texte du champ suivant

             return;

        } else if (R.input.isNum) {
            const ok = /^[0-9.\-]$/.test(e.key) || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key) || e.ctrlKey || e.metaKey;
            R.hiddenImput.readOnly = !ok;
        } else {
            R.hiddenImput.readOnly = false;
        }

    },

    keyup: ( e ) => {

        if( R.parent === null ) return;

        if (e.key === 'Shift'){ 
            R.keys.delete(e.key);
        }

        R.str = R.hiddenImput.value;

        if( R.parent.allEqual ) R.parent.sameStr( R.str );// numeric samùe value
        else R.input.textContent = R.str;

        R.cursorId = R.hiddenImput.selectionStart;
        R.inputRange = [ R.hiddenImput.selectionStart, R.hiddenImput.selectionEnd ];

        R.selectParent();

        //if( R.parent.allway ) 
        R.parent.validate();

    },*/

    // ----------------------
    //
    //   LISTENING
    //
    // ----------------------

    loop: () => {

        if( R.isLoop ) requestAnimationFrame( R.loop );
        R.update();

    },

    update: () => {

        let i = R.listens.length;
        while( i-- ) R.listens[i].listening();

    },

    removeListen: ( proto ) => {

        let id = R.listens.indexOf( proto );
        if( id !== -1 ) R.listens.splice(id, 1);
        if( R.listens.length === 0 ) R.isLoop = false;

    },

    addListen: ( proto ) => {

        let id = R.listens.indexOf( proto );

        if( id !== -1 ) return false; 

        R.listens.push( proto );

        if( !R.isLoop ){
            R.isLoop = true;
            R.loop();
        }

        return true;

    },

};

const Roots = R;

///https://wicg.github.io/file-system-access/#api-filesystemfilehandle-getfile


class Files {

    //-----------------------------
    //  FILE TYPE
    //-----------------------------

    static autoTypes( type ) {

        let t = [];

        switch( type ){

            case 'svg': t = [ { description: 'SVG', accept: { 'image/svg+xml': ['.svg'] } } ]; break;
            case 'wav': t = [ { description: 'WAV', accept: { 'audio/wav': ['.wav'] } } ]; break;
            case 'mp3': t = [ { description: 'MP3', accept: { 'audio/mpeg': ['.mp3'] } } ]; break;
            case 'mp4': t = [ { description: 'MP4', accept: { 'video/mp4': ['.mp4'] } } ]; break;
            case 'bin': case 'hex': t = [ { description: 'Binary Files', accept: { 'application/octet-stream': ['.bin', '.hex'] } }, ]; break;
            case 'text': t = [ { description: 'Text Files', accept: { 'text/plain': ['.txt', '.text'], 'text/html': ['.html', '.htm'] } }, ]; break;
            case 'json': t = [ { description: 'JSON Files', accept: { 'application/json': ['.json'] } }, ]; break;
            case 'js': t = [ { description: 'JavaScript Files', accept: { 'text/javascript': ['.js'] } }, ]; break;
            case 'ktx2': t = [ { description: 'ktx2', accept: { 'image/ktx2': ['.ktx2'] } }, ]; break;
            case 'image': t = [ { description: 'Images', accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.hdr', '.exr'] } }, ]; break;
            case 'gif': t = [ { description: 'Images', accept: { 'image/*': ['.gif'] } }, ]; break;
            case 'png': t = [ { description: 'Images', accept: { 'image/*': ['.png'] } }, ]; break;
            case 'exr': t = [ { description: 'Images', accept: { 'image/exr': ['.exr'] } }, ]; break;
            case 'hdr': t = [ { description: 'Images', accept: { 'image/hdr': ['.hdr'] } }, ]; break;
            case 'jpg': t = [ { description: 'Images', accept: { 'image/*': ['.jpg', '.jpeg'] } }, ]; break;
            case 'icon': t = [ { description: 'Icons', accept: { 'image/x-ico': ['.ico'] } }, ]; break;
            case 'lut': t = [ { description: 'Lut', accept: { 'text/plain': ['.cube', '.3dl'] } }, ]; break;

        }

        return t

    }


    //-----------------------------
    //  LOAD
    //-----------------------------

    //• Avec await (moderne) : const img = await Files.load({ type: 'image' });
    //• Avec callback (existant) : Files.load({ type: 'image', callback: (img, name) => ... });


    /*
    const res = await Files.load({ type: 'image' });
    if ( res ) {
        const { data, name, type, dim, bytes } = res;
        console.log( name, dim, bytes );
    }
    */

    static async load( o = {} ) {

        if ( typeof window.showOpenFilePicker !== 'function' ) {
            window.showOpenFilePicker = Files.showOpenFilePickerPolyfill;
        }

        try {

            let type = o.type || '';

            const options = {
                excludeAcceptAllOption: Boolean( type ),
                multiple: false,
            };

            options.types = Files.autoTypes( type );

            const [ fileHandle ] = await window.showOpenFilePicker( options );
            const file = await fileHandle.getFile();

            if ( !file ) return null;

            const fname = file.name;
            const ftype = fname.substring( fname.lastIndexOf('.') + 1 ).toLowerCase();
            const bytes = file.size;

            const dataUrl = [ 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mp3' ];
            const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'glb', 'gltf', 'exr', 'ktx2', 'hdr', 'bin' ];

            return await new Promise( ( resolve, reject ) => {

                const reader = new FileReader();

                const cleanup = () => {
                    reader.removeEventListener( 'load', onLoad );
                    reader.removeEventListener( 'error', onError );
                };

                const onError = ( err ) => {
                    cleanup();
                    reject( err );
                };

                const onLoad = ( e ) => {
                    const content = e.target.result;
                    cleanup();

                    if ( type === 'image' && typeof content === 'string' ) {
                        const img = new Image();
                        img.onload = () => {
                            const dim = [ img.width, img.height ];
                            if ( o.callback ) o.callback( img, fname, ftype, dim );
                            resolve( { data: img, name: fname, type: ftype, bytes, dim } );
                        };
                        img.onerror = reject;
                        img.src = content;
                    } else if ( type === 'json' ) {
                        const json = JSON.parse( content );
                        if ( o.callback ) o.callback( json, fname, ftype );
                        resolve( { data: json, name: fname, type: ftype, bytes } );
                    } else {
                        if ( o.callback ) o.callback( content, fname, ftype );
                        resolve( { data: content, name: fname, type: ftype, bytes } );
                    }
                };

                reader.addEventListener( 'load', onLoad );
                reader.addEventListener( 'error', onError );

                if ( o.forceType === 'ArrayBuffer' ) {
                    reader.readAsArrayBuffer( file );
                } else if ( dataUrl.includes( ftype ) ) {
                    reader.readAsDataURL( file );
                } else if ( dataBuf.includes( ftype ) ) {
                    reader.readAsArrayBuffer( file );
                } else {
                    reader.readAsText( file );
                }

            });

        } catch ( e ) {

            console.log( e );
            if ( o.always && o.callback ) o.callback( null );
            return null;

        }

    }



	/*static async load( o = {} ) {

        if (typeof window.showOpenFilePicker !== 'function') {
            window.showOpenFilePicker = Files.showOpenFilePickerPolyfill
        }

        try {

        	let type = o.type || ''

            const options = {
                excludeAcceptAllOption: type ? true : false,
                multiple: false,
                //startIn:'./assets'
            };

            options.types = Files.autoTypes( type )

            // create a new handle
            const handle = await window.showOpenFilePicker( options )
            const file = await handle[0].getFile()
            //let content = await file.text()

            if( !file ) return null

            let fname = file.name;
            let ftype = fname.substring( fname.lastIndexOf('.') + 1 ).toLowerCase();
            //let ftype = fname.substring( fname.lastIndexOf('.')+1, fname.length );
            let realType = ''

            const dataUrl = [ 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mp3' ];
            const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'glb', 'gltf', 'exr', 'ktx2', 'hdr', 'bin' ];

            //const dataUrl = [ 'png', 'jpg', 'jpeg', 'mp4', 'webm', 'ogg', 'mp3' ];
            //const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'BVH', 'glb', 'gltf', 'exr', 'ktx2', 'hdr' ];
            const reader = new FileReader();

            const cleanupReader = () => reader.removeEventListener('load', onLoad);

            if(o.forceType === 'ArrayBuffer') {
                reader.readAsArrayBuffer( file );
                //type = ''
            } else {
                if( dataUrl.indexOf( ftype ) !== -1 ) reader.readAsDataURL( file )
                else if( dataBuf.indexOf( ftype ) !== -1 ) reader.readAsArrayBuffer( file )
                else reader.readAsText( file )
            }

            
            const onLoad = (e) => {

                let content = e.target.result

                cleanupReader();

                switch(type){
                    case 'image':
                        let img = new Image();
                        img.onload = function() {
                            img.width = img.width;
                            img.height = img.height;
                            if( o.callback ) o.callback( img, fname, ftype, [img.width, img.height] )
                        }
                        img.src = content
                    break;
                    case 'json':
                        if( o.callback ) o.callback( JSON.parse( content ), fname, ftype )
                    break;
                    default:
                        if( o.callback ) o.callback( content, fname, ftype );
                    break;
                }

            }

            reader.addEventListener('load', onLoad);

        } catch(e) {

            console.log(e)
            if( o.always && o.callback ) o.callback( null )

        }

    }*/

	static showOpenFilePickerPolyfill( options ) {

        return new Promise((resolve, reject) => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = options.multiple;
            input.accept = options.types
                .map((type) => type.accept)
                .flatMap((inst) => Object.keys(inst).flatMap((key) => inst[key]))
                .join(",");

            const cleanup = () => {
                input.removeEventListener("change", onChange);
                input.removeEventListener( "cancel", onCancel );
                if (input.parentNode) input.parentNode.removeChild(input);
            };

            const onCancel = () => {
                cleanup();
                reject( new Error('Cancelled') );
            };

            const onChange = (e) => {
                resolve(
                    [...input.files].map((file) => ({
                        getFile: async () => file
                    }))
                );
                cleanup(); // Nettoyage immédiat
            };

            input.addEventListener( "change", onChange );
            input.addEventListener( "cancel", onCancel );
            input.click();

        })
    }


    //-----------------------------
    //  SAVE
    //-----------------------------

    static async save( o = {} ) {

        let usePoly = false;

        if (typeof window.showSaveFilePicker !== 'function') {
            window.showSaveFilePicker = Files.showSaveFilePickerPolyfill;
            usePoly = true;
        }

        try {

            let type = o.type || '';

            const options = {
                suggestedName: o.name || 'hello',
                data: o.data || ''
            };

            options.types = Files.autoTypes( type );

            if ( options.types.length > 0 ) {
                options.finalType = Object.keys( options.types[0].accept )[0];
                const ext = options.types[0].accept[ options.finalType ][0];
                if ( !options.suggestedName.endsWith( ext ) ) options.suggestedName += ext;
            } else {
                options.finalType = 'text/plain';
            }
            //options.finalType = Object.keys( options.types[0].accept )[0]
            //options.suggestedName += options.types[0].accept[options.finalType][0]


            // create a new handle
            const handle = await window.showSaveFilePicker( options );

            if( usePoly ) return

            // create a FileSystemWritableFileStream to write to
            const file = await handle.createWritable();

            let blob = new Blob([ options.data ], { type: options.finalType });

            // write our file
            await file.write(blob);

            // close the file and write the contents to disk.
            await file.close();

        } catch(e) {

            console.log(e);

        }

    }

    static showSaveFilePickerPolyfill( options ) {

        return new Promise((resolve) => {
            const a = document.createElement("a");
            a.download = options.suggestedName || "my-file.txt";
            let blob = new Blob([ options.data ], { type:options.finalType });
            a.href = URL.createObjectURL( blob );

            const revoke = () => URL.revokeObjectURL(a.href);

            a.addEventListener("click", () => {
                resolve(
                    setTimeout(() => {
                        revoke();
                        if (a.parentNode) a.parentNode.removeChild(a);
                    }, 1000)
                );
            });
            a.click();

            /*a.addEventListener("click", () => {
                resolve(
                    setTimeout( () => URL.revokeObjectURL(a.href), 1000 )
                )
            })
            a.click()*/
        })
    }


    //-----------------------------
    //  FOLDER not possible in poly
    //-----------------------------

    static async getFolder() {

        try {
    
            const handle = await window.showDirectoryPicker();
            const files = [];
            for await (const entry of handle.values()) {
                if ( entry.kind === 'file' ) {
                    const file = await entry.getFile();
                    files.push( file );
                }
            }

            console.log(files);
            return files;

        } catch(e) {

            console.log(e);

        }
    
    }








    

}

/**
 * @author lth / https://github.com/lo-th
 */

//import { PixelFont } from './PixelFont.js';

const T = {

    size: {  w:320, h:24, p:30, s:8 },

    // three reference class
    THREE: null,
    texture: null,

    transition: 0.1,

    frag: document.createDocumentFragment(),

    colorRing: null,
    joystick_0: null,
    joystick_1: null,
    circular: null,
    knob: null,
    pad2d: null,

    svgns: "http://www.w3.org/2000/svg",
    links: "http://www.w3.org/1999/xlink",
    htmls: "http://www.w3.org/1999/xhtml",

    //DOM_SIZE: [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'],
    /*DOM_SIZE: [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom'],
    SVG_TYPE_D: [ 'pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient', 'animateMotion', 'use', 'filter', 'feColorMatrix' ],
    SVG_TYPE_G: [ 'svg', 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject' ],*/

    DOM_SIZE: new Set(['height', 'width', 'top', 'left', 'bottom', 'right', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom']),
    SVG_TYPE_D: new Set(['pattern', 'defs', 'transform', 'stop', 'animate', 'radialGradient', 'linearGradient', 'animateMotion', 'use', 'filter', 'feColorMatrix']),
    SVG_TYPE_G: new Set(['svg', 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject']),

    PI: Math.PI,
    TwoPI: Math.PI*2,
    pi90: Math.PI * 0.5,
    pi60: Math.PI/3,
    
    torad: Math.PI / 180,
    todeg: 180 / Math.PI,

    clamp: ( v, min, max ) => {

        v = v < min ? min : v;
        v = v > max ? max : v;
        return v;

    },

    isDivid: ( v ) => ( v*0.5 === Math.floor(v*0.5) ),

    
    // ----------------------
    //   COLOR
    // ----------------------

    defineColor: ( o, cc = T.colors ) => {

        //Roots.injectCss(PixelFont, null)

        let color = { ...cc };

        let textChange = ['fontFamily', 'fontWeight', 'fontShadow', 'fontSize' ];
        let changeText = false;

        if( o.font ) o.fontFamily = o.font;
        if( o.shadow ) o.fontShadow = o.shadow;
        if( o.weight ) o.fontWeight = o.weight;

        if( o.fontColor ) o.text = o.fontColor;
        if( o.color ) o.text = o.color;

        if( o.text ){
            color.text = o.text;
            if( !o.fontColor && !o.color ){ 
                color.title = T.ColorLuma( o.text, -0.25 );
                color.titleoff = T.ColorLuma( o.text, -0.5 );
            }
            color.textOver = T.ColorLuma( o.text, 0.25 );
            color.textSelect = T.ColorLuma( o.text, 0.5 );
        }

        if( o.button ){
            color.button = o.button;
            color.border = T.ColorLuma( o.button, 0.1 );
            color.overoff = T.ColorLuma( o.button, 0.2 );
        }

        if( o.select ){
            color.select = o.select;
            color.over = T.ColorLuma( o.select, -0.1 );
        }

        if( o.itemBg ) o.back = o.itemBg;

        if( o.back ){
            color.back = o.back;
            color.backoff = T.ColorLuma( o.back, -0.1 );
        }

        if( o.fontSelect ) color.textSelect = o.fontSelect;
        if( o.groupBorder ) color.gborder = o.groupBorder;

        //if( o.transparent ) o.bg = 'none'
        //if( o.bg ) color.background = color.backgroundOver = o.bg
        if( o.bg ) color.background = o.bg;
        if( o.bgOver ) color.backgroundOver = o.bgOver;

        for( let m in color ){
            if(o[m]!==undefined) color[m] = o[m];
        }

        for( let m in o ){
            if( textChange.indexOf(m) !== -1 ) changeText = true; 
        }

        if( changeText ) T.defineText( color );

        return color

    },

    colors: {

        sx: 4,//4
        sy: 0,//2
        radius:0,//2

        showOver : 1,
        //groupOver : 1,

        content:'#37383d',//#28292e',//'none',
        background: '#28292e',//'rgba(30,30,30,0)',
        backgroundOver: 'rgba(40,40,40,0)',

        title : '#CCC',
        titleoff : '#BBB',
        text : '#DDD',
        textOver : '#EEE',
        textSelect : '#FFF',
        
        back:'rgba(0,0,0,0.2)',
        backoff:'rgba(0,0,0,0.3)',

        // input and button border
        border : '#4c4c4c',
        borderSize : 1,

        gborder : 'none',
        groups : 'none',
        
        button : '#3c3c3c',
        overoff : '#5c5c5c',
        over : '#024699',
        select : '#308AFF',
        action: '#FF3300',
        
        //fontFamily: 'Tahoma',
        //fontFamily: 'Consolas, monospace',
        //fontFamily:"'SegoeUI', 'Segoe UI', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif",
        //fontFamily:"'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        //fontFamily:"'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontFamily: "'Roboto Mono', Source Code Pro, Menlo, Courier, monospace",
        
        //fontFamily: "'Roboto Mono', 'Source Code Pro', Menlo, Courier, monospace",
        fontWeight: 'normal',
        //fontShadow: 'none', //'#000',
        fontShadow: 'rgba(0,0,0,0.8)', //'#000'
        fontSize:11,

        joyOver:'rgba(48,138,255,0.25)',
        joyOut: 'rgba(100,100,100,0.5)',
        joySelect: '#308AFF',

        
        hide: 'rgba(0,0,0,0)',

    },

    // style css

    css : {

        basic: 'position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; overflow:hidden; ' + '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;'+'letter-spacing: -0.01em; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; ',
        button:'display:flex; align-items:center; justify-content:center; text-align:center;',
        middle:'display:flex; align-items:center; justify-content:left; text-align:left; flex-direction: row-reverse;',
        //edit:'display:flex; align-items:left; justify-content:left; text-align:left; flex-direction: row | row-reverse | column | column-reverse;',
        edit:'display:flex; align-items:right; justify-content:right; text-align:right; flex-direction: row | row-reverse | column | column-reverse;'
    },

    // svg path

    svgs: {

        g1:'M 6 4 L 0 4 0 6 6 6 6 4 M 6 0 L 0 0 0 2 6 2 6 0 Z',
        g2:'M 6 0 L 4 0 4 6 6 6 6 0 M 2 0 L 0 0 0 6 2 6 2 0 Z',

        group:'M 7 7 L 7 8 8 8 8 7 7 7 M 5 7 L 5 8 6 8 6 7 5 7 M 3 7 L 3 8 4 8 4 7 3 7 M 7 5 L 7 6 8 6 8 5 7 5 M 6 6 L 6 5 5 5 5 6 6 6 M 7 3 L 7 4 8 4 8 3 7 3 M 6 4 L 6 3 5 3 5 4 6 4 M 3 5 L 3 6 4 6 4 5 3 5 M 3 3 L 3 4 4 4 4 3 3 3 Z',
        arrow:'M 3 8 L 8 5 3 2 3 8 Z',

        arrowDown:'M 5 8 L 8 3 2 3 5 8 Z',
        arrowUp:'M 5 2 L 2 7 8 7 5 2 Z',

        solid:'M 13 10 L 13 1 4 1 1 4 1 13 10 13 13 10 M 11 3 L 11 9 9 11 3 11 3 5 5 3 11 3 Z',
        body:'M 13 10 L 13 1 4 1 1 4 1 13 10 13 13 10 M 11 3 L 11 9 9 11 3 11 3 5 5 3 11 3 M 5 4 L 4 5 4 10 9 10 10 9 10 4 5 4 Z',
        vehicle:'M 13 6 L 11 1 3 1 1 6 1 13 3 13 3 11 11 11 11 13 13 13 13 6 M 2.4 6 L 4 2 10 2 11.6 6 2.4 6 M 12 8 L 12 10 10 10 10 8 12 8 M 4 8 L 4 10 2 10 2 8 4 8 Z',
        articulation:'M 13 9 L 12 9 9 2 9 1 5 1 5 2 2 9 1 9 1 13 5 13 5 9 4 9 6 5 8 5 10 9 9 9 9 13 13 13 13 9 Z',
        character:'M 13 4 L 12 3 9 4 5 4 2 3 1 4 5 6 5 8 4 13 6 13 7 9 8 13 10 13 9 8 9 6 13 4 M 6 1 L 6 3 8 3 8 1 6 1 Z',
        terrain:'M 13 8 L 12 7 Q 9.06 -3.67 5.95 4.85 4.04 3.27 2 7 L 1 8 7 13 13 8 M 3 8 Q 3.78 5.420 5.4 6.6 5.20 7.25 5 8 L 7 8 Q 8.39 -0.16 11 8 L 7 11 3 8 Z',
        joint:'M 7.7 7.7 Q 8 7.45 8 7 8 6.6 7.7 6.3 7.45 6 7 6 6.6 6 6.3 6.3 6 6.6 6 7 6 7.45 6.3 7.7 6.6 8 7 8 7.45 8 7.7 7.7 M 3.35 8.65 L 1 11 3 13 5.35 10.65 Q 6.1 11 7 11 8.28 11 9.25 10.25 L 7.8 8.8 Q 7.45 9 7 9 6.15 9 5.55 8.4 5 7.85 5 7 5 6.54 5.15 6.15 L 3.7 4.7 Q 3 5.712 3 7 3 7.9 3.35 8.65 M 10.25 9.25 Q 11 8.28 11 7 11 6.1 10.65 5.35 L 13 3 11 1 8.65 3.35 Q 7.9 3 7 3 5.7 3 4.7 3.7 L 6.15 5.15 Q 6.54 5 7 5 7.85 5 8.4 5.55 9 6.15 9 7 9 7.45 8.8 7.8 L 10.25 9.25 Z',
        ray:'M 9 11 L 5 11 5 12 9 12 9 11 M 12 5 L 11 5 11 9 12 9 12 5 M 11.5 10 Q 10.9 10 10.45 10.45 10 10.9 10 11.5 10 12.2 10.45 12.55 10.9 13 11.5 13 12.2 13 12.55 12.55 13 12.2 13 11.5 13 10.9 12.55 10.45 12.2 10 11.5 10 M 9 10 L 10 9 2 1 1 2 9 10 Z',
        collision:'M 11 12 L 13 10 10 7 13 4 11 2 7.5 5.5 9 7 7.5 8.5 11 12 M 3 2 L 1 4 4 7 1 10 3 12 8 7 3 2 Z',
        map:'M 13 1 L 1 1 1 13 13 13 13 1 M 12 2 L 12 7 7 7 7 12 2 12 2 7 7 7 7 2 12 2 Z',
        material:'M 13 1 L 1 1 1 13 13 13 13 1 M 12 2 L 12 7 7 7 7 12 2 12 2 7 7 7 7 2 12 2 Z',
        texture:'M 13 4 L 13 1 1 1 1 4 5 4 5 13 9 13 9 4 13 4 Z',
        object:'M 10 1 L 7 4 4 1 1 1 1 13 4 13 4 5 7 8 10 5 10 13 13 13 13 1 10 1 Z',
        none:'M 9 5 L 5 5 5 9 9 9 9 5 Z',
        cursor:'M 4 7 L 1 10 1 12 2 13 4 13 7 10 9 14 14 0 0 5 4 7 Z',
        load:'M 13 8 L 11.5 6.5 9 9 9 3 5 3 5 9 2.5 6.5 1 8 7 14 13 8 M 9 2 L 9 0 5 0 5 2 9 2 Z',
        save:'M 9 12 L 5 12 5 14 9 14 9 12 M 11.5 7.5 L 13 6 7 0 1 6 2.5 7.5 5 5 5 11 9 11 9 5 11.5 7.5 Z',
        extern:'M 14 14 L 14 0 0 0 0 14 14 14 M 12 6 L 12 12 2 12 2 6 12 6 M 12 2 L 12 4 2 4 2 2 12 2 Z',

    },

    setDebug ( v ) {
        Roots.debug = v;
    },

    rezone () {
        Roots.needReZone = true;
    },

    getImput: function(){

        return Roots.input ? true : false

    },

    setStyle : function ( data ){

        for ( var o in data ){
            if( T.colors[o] ) T.colors[o] = data[o];
        }

        T.setText();

    },

    // ----------------------
    // custom text
    // ----------------------

    defineText: function( o ){

        T.setText( o.fontSize, o.text, o.fontFamily, o.fontShadow, o.fontWeight );

    },

    setText: function( size, color, font, shadow, weight ){

        let cc = T.colors;

        if( font === undefined ) font = cc.fontFamily;
        if( size === undefined ) size = cc.fontSize;
        if( shadow === undefined ) shadow = cc.fontShadow;
        if( weight === undefined ) weight = cc.fontWeight;
        if( color === undefined ) color = cc.text;

        if( isNaN(size) ){ if( size.search('em')===-1 ) size += 'px';}
        else size += 'px';
        

        //let align = 'display:flex; justify-content:left; align-items:center; text-align:left;'

        T.css.txt = T.css.basic + T.css.middle + ' font-family:'+ font +'; font-weight:'+weight+'; font-size:'+size+'; color:'+cc.text+'; padding:0px 8px; left:0; top:2px; height:16px; width:100px; overflow:hidden; white-space: nowrap; letter-spacing:normal;';//letter-spacing: normal;
        if( shadow !== 'none' ) T.css.txt += ' text-shadow: 1px 1px 0px '+shadow+';';

        T.css.txtselect = T.css.txt + T.css.edit + 'line-height: normal; padding:0px 4px; border:1px dashed ' + cc.border + ';';
        T.css.item = T.css.txt + 'padding:0px 4px; position:relative; margin-bottom:1px; ';

    },


    // note

    //https://developer.mozilla.org/fr/docs/Web/CSS/css_flexible_box_layout/aligning_items_in_a_flex_container

    /*cloneColor: function () {

        let cc = Object.assign({}, T.colors );
        return cc;

    },*/

    // intern function

    cloneCss: function () {

        //let cc = Object.assign({}, T.css );
        return { ...T.css };

    },

    clone: function ( o ) {

        return o.cloneNode( true );

    },

    setSvg: function( dom, type, value, id, id2 ){

        if( id === -1 ) dom.setAttributeNS( null, type, value );
        else if( id2 !== undefined ) dom.childNodes[ id || 0 ].childNodes[ id2 || 0 ].setAttributeNS( null, type, value );
        else dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

    },

    setCss: function( dom, css ){

        for( let r in css ){
            if(T.DOM_SIZE.has(r)) dom.style[r] = css[r] + 'px';
            //if( T.DOM_SIZE.indexOf(r) !== -1 ) dom.style[r] = css[r] + 'px';
            else dom.style[r] = css[r];
        }

    },

    set: function( g, o ){

        for (let att in o) {
            if (att === 'txt') g.textContent = o[att];
            else if (att === 'link') g.setAttributeNS(T.links, 'xlink:href', o[att]);
            else g.setAttributeNS(null, att, o[att]);
        }

        /*for( let att in o ){
            if( att === 'txt' ) g.textContent = o[ att ];
            if( att === 'link' ) g.setAttributeNS( T.links, 'xlink:href', o[ att ] );
            else g.setAttributeNS( null, att, o[ att ] );
        }*/
        
    },

    get: function( dom, id ){

        if( id === undefined ) return dom; // root
        else if( !isNaN( id ) ) return dom.childNodes[ id ]; // first child
        else if( id instanceof Array ){
            if(id.length === 2) return dom.childNodes[ id[0] ].childNodes[ id[1] ];
            if(id.length === 3) return dom.childNodes[ id[0] ].childNodes[ id[1] ].childNodes[ id[2] ];
        }

    },

    dom : function ( type, css, obj, dom, id ) {

        type = type || 'div';

        // if( T.SVG_TYPE_D.indexOf(type) !== -1 || T.SVG_TYPE_G.indexOf(type) !== -1 ){ // is svg element
        if (T.SVG_TYPE_D.has(type) || T.SVG_TYPE_G.has(type)){ // is svg element

            if( type ==='svg' ){

                dom = document.createElementNS( T.svgns, 'svg' );
                T.set( dom, obj );

          /*  } else if ( type === 'use' ) {

                dom = document.createElementNS( T.svgns, 'use' );
                T.set( dom, obj );
*/
            } else {
                // create new svg if not def
                if( dom === undefined ) dom = document.createElementNS( T.svgns, 'svg' );
                T.addAttributes( dom, type, obj, id );

            }
            
        } else { // is html element

            if( dom === undefined ) dom = document.createElementNS( T.htmls, type );
            else dom = dom.appendChild( document.createElementNS( T.htmls, type ) );

        }

        if( css ) dom.style.cssText = css; 

        if( id === undefined ) return dom;
        else return dom.childNodes[ id || 0 ];

    },

    addAttributes : function( dom, type, o, id ){

        let g = document.createElementNS( T.svgns, type );
        T.set( g, o );
        T.get( dom, id ).appendChild( g );
        //if( T.SVG_TYPE_G.indexOf(type) !== -1 ) g.style.pointerEvents = 'none';
        if( T.SVG_TYPE_G.has(type) ) g.style.pointerEvents = 'none';
        return g;

    },

    clear : function( dom ){

        dom.replaceChildren();

    },


    // ----------------------
    //   SVG Effects function
    // ----------------------

    addSVGGlowEffect: function () {

        if ( document.getElementById( 'UILGlow') !== null ) return;

        let svgFilter = T.initUILEffects();

        let filter = T.addAttributes( svgFilter, 'filter', { id: 'UILGlow', x: '-20%', y: '-20%', width: '140%', height: '140%' } );
        T.addAttributes( filter, 'feGaussianBlur', { in: 'SourceGraphic', stdDeviation: '3', result: 'uilBlur' } );
        let feMerge = T.addAttributes( filter, 'feMerge', {  } );
        
        for( let i = 0; i <= 3; i++ ) {

            T.addAttributes( feMerge, 'feMergeNode', { in: 'uilBlur' } );
        
        }

        T.addAttributes( feMerge, 'feMergeNode', { in: 'SourceGraphic' } );

    },

    initUILEffects: function () {

        let svgFilter = document.getElementById( 'UILSVGEffects');
        
        if ( svgFilter === null ) {
            
            svgFilter = T.dom( 'svg', undefined , { id: 'UILSVGEffects', width: '0', height: '0' } );
            document.body.appendChild( svgFilter );
 
        }

        return svgFilter;

    },

    // ----------------------
    //   Color function
    // ----------------------

    ColorLuma : ( hex, l ) => {

        //if( hex.substring(0, 3) === 'rgba' ) hex = '#000';
        if ( typeof hex === 'number' ) hex = T.hexToHtml( hex );

        if( hex === 'n' ) hex = '#000';

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        l = l || 0;

        // convert to decimal and change luminosity
        let rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * l)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;

    },

    findDeepInver: ( c ) => ( (c[0] * 0.3 + c[1] * .59 + c[2] * .11) <= 0.6 ),

    lerpColor: ( c1, c2, factor ) => {
        let newColor = {};
        for ( let i = 0; i < 3; i++ ) {
          newColor[i] = c1[ i ] + ( c2[ i ] - c1[ i ] ) * factor;
        }
        return newColor;
    },

    hexToHtml: ( v = 0x000000 ) => ('#' + v.toString(16).padStart(6, '0')),
    htmlToHex: ( v ) => ( v.toUpperCase().replace("#", "0x") ),
    u255: ( c, i ) => ( parseInt(c.substring(i, i + 2), 16) / 255 ),
    u16: ( c, i ) => ( parseInt(c.substring(i, i + 1), 16) / 15 ),

    unpack: ( c ) => {

        if (c.length == 7) return [ T.u255(c, 1), T.u255(c, 3), T.u255(c, 5) ];
        else if (c.length == 4) return [ T.u16(c,1), T.u16(c,2), T.u16(c,3) ];

    },

    p255: ( c ) => {
        let h = Math.round( ( c * 255 ) ).toString( 16 );
        if ( h.length < 2 ) h = '0' + h;
        return h;
    },

    pack: ( c ) => ( '#' + T.p255( c[ 0 ] ) + T.p255( c[ 1 ] ) + T.p255( c[ 2 ] )),
    htmlRgb: ( c, a ) => ( 'rgb(' + Math.round(c[0] * 255) + ','+ Math.round(c[1] * 255) + ','+ Math.round(c[2] * 255) + ')'),

    htmlRgba: ( c, a ) => {
         c = T.unpack(c);
        return 'rgba(' + Math.round(c[0] * 255) + ','+ Math.round(c[1] * 255) + ','+ Math.round(c[2] * 255) + ','+ a + ')';
    },

    

    pad: ( n ) => {
        if(n.length == 1) n = '0' + n;
        return n;
    },

    rgbToHex : ( c ) => {

        const r = Math.round(c[0] * 255).toString(16).padStart(2, '0');
        const g = Math.round(c[1] * 255).toString(16).padStart(2, '0');
        const b = Math.round(c[2] * 255).toString(16).padStart(2, '0');
        return '#' + r + g + b;

        /*let r = Math.round(c[0] * 255).toString(16);
        let g = Math.round(c[1] * 255).toString(16);
        let b = Math.round(c[2] * 255).toString(16);
        return '#' + T.pad(r) + T.pad(g) + T.pad(b);*/

       // return '#' + ( '000000' + ( ( c[0] * 255 ) << 16 ^ ( c[1] * 255 ) << 8 ^ ( c[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

    },

    hueToRgb: ( p, q, t ) => {

        if ( t < 0 ) t += 1;
        if ( t > 1 ) t -= 1;
        if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
        if ( t < 1 / 2 ) return q;
        if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
        return p;

    },

    rgbToHsl: ( c ) => {

        let r = c[0], g = c[1], b = c[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
        if (l > 0 && l < 1) s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
        if (delta > 0) {
            if (max == r && max != g) h += (g - b) / delta;
            if (max == g && max != b) h += (2 + (b - r) / delta);
            if (max == b && max != r) h += (4 + (r - g) / delta);
            h /= 6;
        }
        return [ h, s, l ];

    },

    hslToRgb: ( c ) => {

        let p, q, h = c[0], s = c[1], l = c[2];

        if ( s === 0 ) return [ l, l, l ];
        else {
            q = l <= 0.5 ? l * (s + 1) : l + s - ( l * s );
            p = l * 2 - q;
            return [ T.hueToRgb(p, q, h + 0.33333), T.hueToRgb(p, q, h), T.hueToRgb(p, q, h - 0.33333) ];
        }

    },

    // ----------------------
    //   SVG MODEL
    // ----------------------

    makeGradiant: function ( type, settings, parent, colors ) {

        T.dom( type, null, settings, parent, 0 );

        let n = parent.childNodes[0].childNodes.length - 1, c;

        for( let i = 0; i < colors.length; i++ ){

            c = colors[i];
            //T.dom( 'stop', null, { offset:c[0]+'%', style:'stop-color:'+c[1]+'; stop-opacity:'+c[2]+';' }, parent, [0,n] );
            T.dom( 'stop', null, { offset:c[0]+'%', 'stop-color':c[1],  'stop-opacity':c[2] }, parent, [0,n] );

        }

    },

    /*makeGraph: function () {

        let w = 128;
        let radius = 34;
        let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'butt' }, svg );//0
        //T.dom( 'rect', '', { x:10, y:10, width:108, height:108, stroke:'rgba(0,0,0,0.3)', 'stroke-width':2 , fill:'none'}, svg );//1
        //T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
        
        //T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.3)', 'stroke-width':7 , fill:'none'}, svg );//2
        //T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//3
        T.graph = svg;

    },*/

    makeChecker: function ( model ) {

        let ww = 128;
        let space = 2;
        let box = ( ww - ( space * 5 ) ) / 6;
        let hh = ( box * 4 ) + ( space * 3 );
        //let box = ww/6 - (space*4);
        //let hh = (box*4) + (space*2)

        let svg = T.dom( 'svg', T.css.basic , { viewBox:'0 0 '+ww+' '+hh, width:ww, height:hh, preserveAspectRatio:'none' } );

        let x = 0;
        let y = 0;
        let n = 0;

        let colors = [
            "#2B292B", "#50504E", "#797674", "#A09D9A", "#C9C6C3", "#F8F2EE",
            "#233684", "#539048", "#A93036", "#EDCF3A", "#B1548F", "#3A7C9D",
            "#E1A235", "#A3BB48", "#4F3B68", "#B45860", "#6256BF", "#CF7D31",
            "#6A4E3E", "#BC947F", "#5F7799", "#576940", "#7E7DAB", "#7AB8A7",
        ];

        for(let i = 0; i<24; i++){

            Tools.dom( 'rect', '', { x: x, y: y,  width: box, height: box, fill:colors[i] }, svg );
            x += box+space;
            n ++;
            if(n>5){
                x = 0;
                y += box+space;
                n = 0;
            }
        }
        T.checker = svg;

    },

    makePad: function ( model ) {

        let ww = 256;
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+ww+' '+ww, width:ww, height:ww, preserveAspectRatio:'none' } );
        let w = 200; 
        let d = (ww-w)*0.5, m = 20;
        Tools.dom( 'rect', '', { x: d, y: d,  width: w, height: w, fill:T.colors.back }, svg ); // 0
        Tools.dom( 'rect', '', { x: d+m*0.5, y: d+m*0.5, width: w - m , height: w - m, fill:T.colors.button }, svg ); // 1
        // Pointer
        Tools.dom( 'line', '', { x1: d+(m*0.5), y1: ww *0.5, x2: d+(w-m*0.5), y2: ww * 0.5, stroke:T.colors.back, 'stroke-width': 2 }, svg ); // 2
        Tools.dom( 'line', '', { x1: ww * 0.5, x2: ww * 0.5, y1: d+(m*0.5), y2: d+(w-m*0.5), stroke:T.colors.back, 'stroke-width': 2 }, svg ); // 3
        Tools.dom( 'circle', '', { cx: ww * 0.5, cy: ww * 0.5, r:5, stroke: T.colors.text, 'stroke-width': 5, fill:'none' }, svg ); // 4
        T.pad2d = svg;

    },

    makeKnob: function ( model ) {

        let w = 128;
        let radius = 34;
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:T.colors.button, stroke:'rgba(0,0,0,0.3)', 'stroke-width':8 }, svg );//0
        T.dom( 'circle', '', { cx:64, cy:64, r:radius-10, fill:'rgba(255,255,255,0.1)', stroke:'none'  }, svg );//1
        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':4, fill:'none', 'stroke-linecap':'round' }, svg );//2
        T.dom( 'circle', '', { cx:64, cy:64, r:radius+7, stroke:'rgba(0,0,0,0.1)', 'stroke-width':7 , fill:'none'}, svg );//3
        T.dom( 'path', '', { d:'', stroke:'rgba(255,255,255,0.3)', 'stroke-width':2, fill:'none', 'stroke-linecap':'round', 'stroke-opacity':0.5 }, svg );//4

        //

        T.knob = svg;

    },

    makeCircular: function ( model ) {

        let w = 128;
        let radius = 40;
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'circle', '', { cx:64, cy:64, r:radius, stroke:'rgba(0,0,0,0.1)', 'stroke-width':10, fill:'none' }, svg );//0
        T.dom( 'path', '', { d:'', stroke:T.colors.text, 'stroke-width':7, fill:'none', 'stroke-linecap':'butt' }, svg );//1
        T.circular = svg;

    },

    makeJoystick: function ( model ) {

        //+' background:#f00;'

        let w = 128, ccc;
        let radius = Math.floor((w-30)*0.5);
        let innerRadius = Math.floor(radius*0.6);
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'defs', null, {}, svg );
        T.dom( 'g', null, {}, svg );

        if( model === 0 ){

        

            // gradian background
            ccc = [ [40, 'rgb(0,0,0)', 0.3], [80, 'rgb(0,0,0)', 0], [90, 'rgb(50,50,50)', 0.4], [100, 'rgb(50,50,50)', 0] ];
            T.makeGradiant( 'radialGradient', { id:'grad', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

            // gradian shadow
            ccc = [ [60, 'rgb(0,0,0)', 0.5], [100, 'rgb(0,0,0)', 0] ];
            T.makeGradiant( 'radialGradient', { id:'gradS', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

            // gradian stick
            let cc0 = ['rgb(40,40,40)', 'rgb(48,48,48)', 'rgb(30,30,30)'];
            let cc1 = ['rgb(1,90,197)', 'rgb(3,95,207)', 'rgb(0,65,167)'];

            ccc = [ [30, cc0[0], 1], [60, cc0[1], 1], [80, cc0[1], 1], [100, cc0[2], 1] ];
            T.makeGradiant( 'radialGradient', { id:'gradIn', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

            ccc = [ [30, cc1[0], 1], [60, cc1[1], 1], [80, cc1[1], 1], [100, cc1[2], 1] ];
            T.makeGradiant( 'radialGradient', { id:'gradIn2', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

            // graph

            T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:'url(#grad)' }, svg );//2
            T.dom( 'circle', '', { cx:64+5, cy:64+10, r:innerRadius+10, fill:'url(#gradS)' }, svg );//3
            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius, fill:'url(#gradIn)' }, svg );//4

            T.joystick_0 = svg;

        } else {
             // gradian shadow
            ccc = [ [69, 'rgb(0,0,0)', 0],[70, 'rgb(0,0,0)', 0.3], [100, 'rgb(0,0,0)', 0] ];
            T.makeGradiant( 'radialGradient', { id:'gradX', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, ccc );

            T.dom( 'circle', '', { cx:64, cy:64, r:radius, fill:'none', stroke:'rgba(100,100,100,0.25)', 'stroke-width':'4' }, svg );//2
            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius+14, fill:'url(#gradX)' }, svg );//3
            T.dom( 'circle', '', { cx:64, cy:64, r:innerRadius, fill:'none', stroke:'rgb(100,100,100)', 'stroke-width':'4' }, svg );//4

            T.joystick_1 = svg;
        }

        

    },

    makeColorRing: function () {

        let w = 256;
        let svg = T.dom( 'svg', T.css.basic + 'position:relative;', { viewBox:'0 0 '+w+' '+w, width:w, height:w, preserveAspectRatio:'none' } );
        T.dom( 'defs', null, {}, svg );
        T.dom( 'g', null, {}, svg );

        let s = 30;//stroke
        let r =( w-s )*0.5;
        let mid = w*0.5;
        let n = 24, nudge = 8 / r / n * Math.PI, a1 = 0;
        let am, tan, d2, a2, ar, i, j, path, ccc;
        let color = [];
        
        for ( i = 0; i <= n; ++i) {

            d2 = i / n;
            a2 = d2 * T.TwoPI;
            am = (a1 + a2) * 0.5;
            tan = 1 / Math.cos((a2 - a1) * 0.5);

            ar = [
                Math.sin(a1), -Math.cos(a1), 
                Math.sin(am) * tan, -Math.cos(am) * tan, 
                Math.sin(a2), -Math.cos(a2)
            ];
            
            color[1] = T.rgbToHex( T.hslToRgb([d2, 1, 0.5]) );

            if (i > 0) {

                j = 6;
                while(j--){
                   ar[j] = ((ar[j]*r)+mid).toFixed(2);
                }

                path = ' M' + ar[0] + ' ' + ar[1] + ' Q' + ar[2] + ' ' + ar[3] + ' ' + ar[4] + ' ' + ar[5];

                ccc = [ [0,color[0],1], [100,color[1],1] ];
                T.makeGradiant( 'linearGradient', { id:'G'+i, x1:ar[0], y1:ar[1], x2:ar[4], y2:ar[5], gradientUnits:"userSpaceOnUse" }, svg, ccc );

                T.dom( 'path', '', { d:path, 'stroke-width':s, stroke:'url(#G'+i+')', 'stroke-linecap':"butt" }, svg, 1 );
                
            }
            a1 = a2 - nudge; 
            color[0] = color[1];
        }

        let tw = 84.90;

        // black / white
        ccc = [ [0, '#FFFFFF', 1], [50, '#FFFFFF', 0], [50, '#000000', 0], [100, '#000000', 1] ];
        T.makeGradiant( 'linearGradient', { id:'GL0', x1:0, y1:mid-tw, x2:0, y2:mid+tw, gradientUnits:"userSpaceOnUse" }, svg, ccc );

        ccc = [ [0, '#7f7f7f', 1], [50, '#7f7f7f', 0.5], [100, '#7f7f7f', 0] ];
        T.makeGradiant( 'linearGradient', { id:'GL1', x1:mid-49.05, y1:0, x2:mid+98, y2:0, gradientUnits:"userSpaceOnUse" }, svg, ccc );

        T.dom( 'g', null, { 'transform-origin': '128px 128px', 'transform':'rotate(0)' }, svg );//2
        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'red'  }, svg, 2 );// 2,0
        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'url(#GL1)','stroke-width':1, stroke:'url(#GL1)'  }, svg, 2 );//2,1
        T.dom( 'polygon', '', { points:'78.95 43.1 78.95 212.85 226 128',  fill:'url(#GL0)','stroke-width':1, stroke:'url(#GL0)'  }, svg, 2 );//2,2
        T.dom( 'path', '', { d:'M 255.75 136.5 Q 256 132.3 256 128 256 123.7 255.75 119.5 L 241 128 255.75 136.5 Z',  fill:'none','stroke-width':2, stroke:'#000'  }, svg, 2 );//2,3
        //T.dom( 'circle', '', { cx:128+113, cy:128, r:6, 'stroke-width':3, stroke:'#000', fill:'none' }, svg, 2 );//2.3

        T.dom( 'circle', '', { cx:128, cy:128, r:6, 'stroke-width':2, stroke:'#000', fill:'none' }, svg );//3

        T.colorRing = svg;

    },

    icon: function ( type, color, w ){

        w = w || 40;
        //color = color || '#DEDEDE';
        let viewBox = '0 0 256 256';
        //let viewBox = '0 0 '+ w +' '+ w;
        let t = ["<svg xmlns='"+T.svgns+"' version='1.1' xmlns:xlink='"+T.htmls+"' style='pointer-events:none;' preserveAspectRatio='xMinYMax meet' x='0px' y='0px' width='"+w+"px' height='"+w+"px' viewBox='"+viewBox+"'><g>"];
        switch(type){
            case 'logo':
            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logoFill_d+"'/>";
            break;
            
            case 'neo':
            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logo_neo+"'/>";
            break;
            case 'phy':
            t[1]="<path id='logoin' stroke='"+color+"' stroke-width='49' stroke-linejoin='round' stroke-linecap='butt' fill='none' d='"+T.logo_phy+"'/>";
            break;
            case 'config':
            t[1]="<path id='logoin' stroke='"+color+"' stroke-width='49' stroke-linejoin='round' stroke-linecap='butt' fill='none' d='"+T.logo_config+"'/>";
            break;
            case 'github':
            t[1]="<path id='logoin' fill='"+color+"' stroke='none' d='"+T.logo_github+"'/>";
            break;
            case 'save':
            t[1]="<path stroke='"+color+"' stroke-width='4' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 26.125 17 L 20 22.95 14.05 17 M 20 9.95 L 20 22.95'/><path stroke='"+color;
            t[1]+="' stroke-width='2.5' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 32.6 23 L 32.6 25.5 Q 32.6 28.5 29.6 28.5 L 10.6 28.5 Q 7.6 28.5 7.6 25.5 L 7.6 23'/>";
            break;
        }
        t[2] = "</g></svg>";
        return t.join("\n");

    },

    logoFill_d:`
    M 171 150.75 L 171 33.25 155.5 33.25 155.5 150.75 Q 155.5 162.2 147.45 170.2 139.45 178.25 128 178.25 116.6 178.25 108.55 170.2 100.5 162.2 100.5 150.75 
    L 100.5 33.25 85 33.25 85 150.75 Q 85 168.65 97.55 181.15 110.15 193.75 128 193.75 145.9 193.75 158.4 181.15 171 168.65 171 150.75 
    M 200 33.25 L 184 33.25 184 150.8 Q 184 174.1 167.6 190.4 151.3 206.8 128 206.8 104.75 206.8 88.3 190.4 72 174.1 72 150.8 L 72 33.25 56 33.25 56 150.75 
    Q 56 180.55 77.05 201.6 98.2 222.75 128 222.75 157.8 222.75 178.9 201.6 200 180.55 200 150.75 L 200 33.25 Z
    `,

    logo_github:`
    M 180.5 70 Q 186.3 82.4 181.55 96.55 196.5 111.5 189.7 140.65 183.65 168.35 146 172.7 152.5 178.7 152.55 185.9 L 152.55 218.15 Q 152.84 224.56 159.15 223.3 
    159.21 223.3 159.25 223.3 181.14 216.25 198.7 198.7 228 169.4 228 128 228 86.6 198.7 57.3 169.4 28 128 28 86.6 28 57.3 57.3 28 86.6 28 128 28 169.4 57.3 198.7 74.85 
    216.25 96.75 223.3 96.78 223.3 96.8 223.3 103.16 224.54 103.45 218.15 L 103.45 200 Q 82.97 203.1 75.1 196.35 69.85 191.65 68.4 185.45 64.27 177.055 59.4 174.15 49.20 
    166.87 60.8 167.8 69.85 169.61 75.7 180 81.13 188.09 90 188.55 98.18 188.86 103.45 185.9 103.49 178.67 110 172.7 72.33 168.33 66.3 140.65 59.48 111.49 74.45 96.55 69.7 
    82.41 75.5 70 84.87 68.74 103.15 80 115.125 76.635 128 76.85 140.85 76.65 152.85 80 171.1 68.75 180.5 70 Z
    `,

    logo_neo:`
    M 219 52 L 206 52 206 166 Q 206 183.4 193.75 195.65 181.4 208 164 208 146.6 208 134.35 195.65 122 183.4 122 166 L 122 90 Q 122 77.6 113.15 68.85 104.4 60 92 60 79.55 
    60 70.75 68.85 62 77.6 62 90 L 62 204 75 204 75 90 Q 75 83 79.95 78 84.95 73 92 73 99 73 104 78 109 83 109 90 L 109 166 Q 109 188.8 125.15 204.85 141.2 221 164 221 
    186.75 221 202.95 204.85 219 188.8 219 166 L 219 52 M 194 52 L 181 52 181 166 Q 181 173 176.05 178 171.05 183 164 183 157 183 152 178 147 173 147 166 L 147 90 Q 147 
    67.2 130.85 51.15 114.8 35 92 35 69.25 35 53.05 51.15 37 67.2 37 90 L 37 204 50 204 50 90 Q 50 72.6 62.25 60.35 74.6 48 92 48 109.4 48 121.65 60.35 134 72.6 134 90 L 
    134 166 Q 134 178.4 142.85 187.15 151.6 196 164 196 176.45 196 185.25 187.15 194 178.4 194 166 L 194 52 Z
    `,

    logo_phy:`
    M 103.55 37.95 L 127.95 37.95 Q 162.35 37.95 186.5 55 210.9 72.35 210.9 96.5 210.9 120.65 186.5 137.7 162.35 155 127.95 155 L 127.95 237.95 M 127.95 155 
    Q 93.55 155 69.15 137.7 45 120.65 45 96.5 45 72.35 69.15 55 70.9 53.8 72.85 52.85 M 127.95 155 L 127.95 37.95
    `,

    logo_config:`
    M 204.35 51.65 L 173.25 82.75 Q 192 101.5 192 128 L 236 128 M 192 128 Q 192 154.55 173.25 173.25 L 204.4 204.4 M 51.65 51.65 L 82.75 82.75 Q 101.5 64 128 64 
    L 128 20 M 51.6 204.4 L 82.75 173.25 Q 64 154.55 64 128 L 20 128 M 128 236 L 128 192 Q 101.5 192 82.75 173.25 M 64 128 Q 64 101.5 82.75 82.75 M 173.25 173.25 
    Q 154.55 192 128 192 M 128 64 Q 154.55 64 173.25 82.75
    `,

};

T.setText();

const Tools = T;

class V2 {

	constructor( x = 0, y = 0 ) {

		this.x = x;
		this.y = y;

	}

	set ( x, y ) {

		this.x = x;
		this.y = y;
		return this;

	}

	divide ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		return this;

	}

	multiply ( v ) {

		this.x *= v.x;
		this.y *= v.y;
		return this;

	}

	multiplyScalar ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		return this;

	}

	divideScalar ( scalar ) {

		return this.multiplyScalar( 1 / scalar );

	}

	length () {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	}

	angle () {

		// computes the angle in radians with respect to the positive x-axis

		var angle = Math.atan2( this.y, this.x );

		if ( angle < 0 ) angle += 2 * Math.PI;

		return angle;

	}

	addScalar ( s ) {

		this.x += s;
		this.y += s;
		return this;

	}

	negate () {

		this.x *= -1;
		this.y *= -1;
		return this;

	}

	neg () {

		this.x = -1;
		this.y = -1;
		return this;

	}

	isZero () {

		return ( this.x === 0 && this.y === 0 );

	}

	copy ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	}

	equals ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	}

	nearEquals ( v, n ) {

		return ( ( v.x.toFixed(n) === this.x.toFixed(n) ) && ( v.y.toFixed(n) === this.y.toFixed(n) ) );

	}

	lerp ( v, alpha ) {

		if( v === null ){
			this.x -= this.x * alpha;
		    this.y -= this.y * alpha;
		} else {
			this.x += ( v.x - this.x ) * alpha;
		    this.y += ( v.y - this.y ) * alpha;
		}

		return this;

	}

}

/**
 * @author lth / https://github.com/lo-th
 */

class Proto {

    constructor( o = {} ) {

        // disable mouse controle
        this.lock = o.lock || false;

        // for button
        this.neverlock = false;

        // only simple space 
        this.isSpace = o.isSpace || false;

        // if proto have imput
        this.haveInput = false;

        // if Proto is in gui or group
        this.main = o.main || null;
        this.isUI = o.isUI || false;
        this.group = o.group || null;

        this.isListen = false;
        this.isCanvasOnly = false;
        this.isSelect = false;

        this.top = 0;
        this.ytop = 0;
        this.dx = o.dx || 0;

        this.isSelectMulty = o.selectmulty !== undefined ? o.selectmulty : false;
        this.isSelectable = o.selectable !== undefined ? o.selectable : false;
        this.unselectable =  o.unselect !== undefined ? o.unselect : this.isSelectable;

        this.ontop = o.ontop ? o.ontop : false; // 'beforebegin' 'afterbegin' 'beforeend' 'afterend'

        this.css = this.main ? this.main.css : Tools.css;

        this.colors = Tools.defineColor( o, this.main ? ( this.group ? this.group.colors : this.main.colors ) : Tools.colors );

        this.overEffect = this.colors.showOver;

        this.svgs = Tools.svgs;

        this.zone = { x:0, y:0, w:0, h:0, d:0 };
        this.local = new V2();

        // percent of title
        this.p = o.p !== undefined ? o.p : Tools.size.p;

        this.w = this.isUI ? this.main.size.w : Tools.size.w;
        if( o.w !== undefined ) this.w = o.w;

        this.h = this.isUI ? this.main.size.h : Tools.size.h;
        if( o.h !== undefined ) this.h = o.h;
        if( !this.isSpace ) this.h = this.h < 11 ? 11 : this.h;
        else this.lock = true;

        // decale for canvas only
        this.fw = o.fw || 0;

        this.autoWidth = o.auto || true;// auto width or flex 
        this.isOpen = false;//false// open statu

        // radius for toolbox
        const radius = o.radius || this.colors.radius;
        this.radius = !isNaN(radius) && radius !== '' ? `${radius}px` : radius;

        this.transition = o.transition || Tools.transition;

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
        this.setSize( this.w );

        // title size
        if( o.sa !== undefined ) this.sa = o.sa;
        if( o.sb !== undefined ) this.sb = o.sb;
        if( this.simple ) this.sb = this.w - this.sa;

        // last number size for slide
        this.sc = o.sc === undefined ? 47 : o.sc;

        // for listening object
        this.objectLink = null;
        this.isSend = false;
        this.objectKey = null;

        this.txt = o.name || '';
        this.name = o.rename || this.txt;
        if(o.parent && !o.target) o.target = o.parent;
        this.target = o.target || null;

        // callback
        this.callback = o.callback === undefined ? null : o.callback;
        this.endCallback = o.endCallback === undefined ? null : o.endCallback;        this.openCallback = o.openCallback === undefined ? null : o.openCallback;
        this.closeCallback = o.closeCallback === undefined ? null : o.closeCallback;

        // if no callback take one from GUI or Group
        if( this.callback === null ) { 
            if( this.isUI && this.main.callback !== null ) this.callback = this.main.callback;
            if( this.group && this.group.callback !== null ) this.callback = this.group.callback;
        }

        if( this.endCallback === null ) { 
            if( this.isUI && this.main.endCallback !== null ) this.endCallback = this.main.endCallback;
            if( this.group && this.group.endCallback !== null ) this.endCallback = this.group.endCallback;
        }

        this.c = [];// elements
        this.s = [];// style 


        this.useFlex = this.isUI ? this.main.useFlex : false; 
        let flexible = this.useFlex ? 'display:flex; justify-content:center; align-items:center; text-align:center; flex: 1 100%;' : 'float:left;';

        const virtual = this.isUI ? 'content-visibility:auto; contain-intrinsic-size:auto ' + this.h + 'px;' : '';

        this.c[0] = Tools.dom( 'div', this.css.basic + flexible + 'position:relative; height:20px;' + virtual );
        this.s[0] = this.c[0].style;

        // bottom margin
        this.margin = this.colors.sy;
        this.mtop = 0;
        let marginDiv = Tools.isDivid( this.margin );

        if( this.isUI && this.margin ){ 
            this.s[0].boxSizing = 'content-box';
            if (marginDiv) {
                this.mtop = this.margin * 0.5;
                this.s[0].borderTop = `${this.mtop}px solid transparent`;
                this.s[0].borderBottom = `${this.mtop}px solid transparent`;
            } else {
                this.s[0].borderBottom = `${this.margin}px solid transparent`;
            }
        }
        
        // with title
        if( !this.simple ){ 
            this.c[1] = Tools.dom( 'div', this.css.txt + this.css.middle );
            this.s[1] = this.c[1].style;
            this.c[1].textContent = this.name;
            this.s[1].color = this.lock ? this.colors.titleoff : this.colors.title;
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

        this.ytop = this.top + this.mtop;
        this.zone.h = this.h + this.margin;
        this.zone.w = this.w;

        let s = this.s; // style cache
        let c = this.c; // div cach

        s[0].height = this.h + 'px';

        //if( this.isUI ) s[0].background = this.colors.background
        if ( this.isUI ) {
            s[0].background = this.colors.background;
            //s[0].backgroundClip = 'padding-box';
        }
           

        if(!this.autoWidth && this.useFlex ){
            s[0].flex = '1 0 auto';
            s[0].minWidth = this.minw+'px';
            s[0].textAlign = 'center';
        } else {
            if( this.isUI ) s[0].width = '100%';
        }

        //if( this.autoHeight ) s[0].transition = 'height 0.01s ease-out';
        if( c[1] !== undefined && this.autoWidth ){
            s[1] = c[1].style;
            s[1].top = 1 + 'px';
            s[1].height = (this.h-2) + 'px';
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

        this.rSize();

        // ! solo proto
        if( !this.isUI ){

            this.c[0].style.pointerEvents = 'auto';
            Roots.add( this );
            
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

    getCkecker( model ) {

        if( !Tools[ 'checker' ] ) Tools.makeChecker( model );
        return Tools.clone( Tools[ 'checker' ] )

    }

    getJoystick( model ) {

        if( !Tools[ 'joystick_'+ model ] ) Tools.makeJoystick( model );
        return Tools.clone( Tools[ 'joystick_'+ model ] )

    }

    getCircular( model ) {

        if( !Tools.circular ) Tools.makeCircular( model );
        return Tools.clone( Tools.circular )

    }

    getKnob( model ) {

        if( !Tools.knob ) Tools.makeKnob( model );
        return Tools.clone( Tools.knob )

    }

    getPad2d( model ) {

        if( !Tools.pad2d ) Tools.makePad( model );
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

    appendChild( m ){
        this.c[0].appendChild( m );
    }

    content() {

        return this.c[0]

    }

    getDom() {

        return this.c[0]

    }

    uiout() {

        if ( this.lock || !this.overEffect || this.isGroup || this.isTitle ) return false;
        if ( this.s ) this.s[0].background = this.colors.background;
        return true;

    }

    uiover() {

        if ( this.lock || !this.overEffect || this.isGroup || this.isTitle ) return false;
        if ( this.s ) this.s[0].background = this.colors.backgroundOver;
        return true;

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
        this.callback = f || null;
        return this

    }

    // ----------------------
    // update only on end
    // ----------------------

    onFinishChange( f ) {

        if( this.isSpace ) return;
        this.callback = null;
        this.endCallback = f;
        return this

    }

    onEnd( f ) { return this.onFinishChange(f); }

    // ----------------------
    // event on open close
    // ----------------------

    onOpen( f ) {

        this.openCallback = f;
        return this

    }

    onClose( f ) {

        this.closeCallback = f;
        return this

    }

    // ----------------------
    //  send back value
    // ----------------------

    send( v ) {

        //v = v || this.value;
        v = v ?? this.value;
        if( v instanceof Array && v.length === 1 ) v = v[0];

        // for list
        if(this.refObject) v = this.refObject[v];

        this.isSend = true;
        if( this.objectLink !== null ){ 
            if( this.objectLink[ this.objectKey ] && this.objectLink[ this.objectKey ].isColor ) this.objectLink[ this.objectKey ].setHex( v );
            else this.objectLink[ this.objectKey ] = v;
        }
        if( this.callback ) this.callback( v, this.objectKey );
        this.isSend = false;

    }

    sendEnd( v ) {

        if ( this.endCallback === null ) return;

        v = v ?? this.value;
        if ( v instanceof Array && v.length === 1 ) v = v[0];

        if ( this.refObject ) v = this.refObject[v];

        this.isSend = true;
        if ( this.objectLink !== null ) { 
            if ( this.objectLink[ this.objectKey ] && this.objectLink[ this.objectKey ].isColor ) this.objectLink[ this.objectKey ].setHex( v );
            else this.objectLink[ this.objectKey ] = v;
        }
        this.endCallback( v );
        this.isSend = false;

        /*if( this.endCallback === null ) return;

        //v = v || this.value;
        v = v ?? this.value;
        if( v instanceof Array && v.length === 1 ) v = v[0];

        if(this.refObject) v = this.refObject[v]

        this.isSend = true
        if( this.objectLink !== null ){ 
            if( this.objectLink[ this.objectKey ] && this.objectLink[ this.objectKey ].isColor ) this.objectLink[ this.objectKey ].setHex( v );
            else this.objectLink[ this.objectKey ] = v
        }
        this.endCallback( v )*/

        //if( this.endCallback ) this.endCallback( v );
        //if( this.objectLink !== null ) this.objectLink[ this.objectKey ] = v;

    }

    // ----------------------
    // clear node
    // ----------------------

    dispose(){

        this.clear();

        if( this.isListen ) Roots.removeListen( this );
        if( this.haveInput ) Roots.removeInput( this );

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

        let nw = Roots.getWidth( this );
        if(nw) this.w = nw;

    }

    setSize( sx ) {

        if( !this.autoWidth ) return;
        
        this.w = sx;

        if( this.simple ){
            this.sb = this.w - this.sa;
        } else {
            let pp = this.w * ( this.p / 100 );
            //this.sa = Math.floor( pp + 10 )
            //this.sb = Math.floor( this.w - pp - 20 )
            this.sa = Math.floor( pp + 8 );
            this.sb = Math.floor( this.w - pp - 16 );
        }

    }

    rSize() {

        if( !this.autoWidth ) return
        if( !this.isUI ) this.s[0].width = this.w + 'px';
        if( !this.simple ) this.s[1].width = this.sa + 'px';
    
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

        this.precision = o.precision ?? 2;
        this.step = o.step ?? Number(Math.pow(10, -this.precision).toFixed(this.precision));
        this.range = this.max - this.min;
        this.value = this.numValue( this.value );
        
    }

    numValue( n ) {

        if( this.noNeg ) n = Math.abs( n );
        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision ) * 1

    }


    // ----------------------
    //   EVENTS DEFAULT
    // ----------------------

    handleEvent( e ) {

        if( this.lock ) return
        if( this.neverlock ) Roots.lock = false;
        if( !this[e.type] ) return console.error(e.type, 'this type of event no existe !')


        // TODO !!!!

        //if( this.marginDiv ) z.d -= this.margin * 0.5
        //if( this.marginDiv ) e.clientY -= this.margin * 0.5
        //if( this.group && this.group.marginDiv ) e.clientY -= this.group.margin * 0.5

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

        this.objectLink = obj;
        this.objectKey = key;

    }

    display( v = false ) {

        this.s[0].visibility = v ? 'visible' : 'hidden';

    }

    // ----------------------
    // resize height 
    // ----------------------

    open () {

        if( this.isOpen ) return
        this.isOpen = true;
        Roots.needResize = true;
        if( this.openCallback ) this.openCallback();

    }

    close () {

        if( !this.isOpen ) return
        this.isOpen = false;
        Roots.needResize = true;
        if( this.closeCallback ) this.closeCallback();

    }

    needZone() {

        Roots.needReZone = true;

    }

    rezone() {

        Roots.needReZone = true;

    }

    // ----------------------
    //  INPUT
    // ----------------------

    addInput( Input ) {

        Roots.addInput( Input, this );

    }

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

        this.isSelect = b || false;
        
    }

}

class Bool extends Proto {

    constructor( o = {} ) {

        super( o );
        
        this.value = o.value || false;
        this.model = o.mode !== undefined ? o.mode : 2;

        this.onName = o.rename || this.txt;
        if( o.onName ) o.onname = o.onName;
        if( o.onname ) this.onName = o.onname;

        this.inh = o.inh || Math.floor( this.h*0.8 );
        this.inw = o.inw || 36;

        let cc = this.colors;
       
        if( this.model === 0 ){
            let t = Math.floor(this.h*0.5)-((this.inh-2)*0.5);
            this.c[2] = this.dom( 'div', this.css.basic + 'background:'+ cc.inputBg +'; height:'+(this.inh-2)+'px; width:'+this.inw+'px; top:'+t+'px; border-radius:10px; border:2px solid '+ cc.back );
            this.c[3] = this.dom( 'div', this.css.basic + 'height:'+(this.inh-6)+'px; width:16px; top:'+(t+2)+'px; border-radius:10px; background:'+ cc.button+';' );
        } else if ( this.model === 2 ) {
            let box = this.inh - 2;
            let t = Math.floor( (this.h - box) * 0.5 );
            this.inw = box;
            this.c[2] = this.dom( 'div', this.css.txt + this.css.middle + 'padding:0; line-height:1; justify-content:center; background:' + cc.inputBg + '; height:' + box + 'px; width:' + box + 'px; top:' + t + 'px; border-radius:' + this.radius + '; border:' + cc.borderSize + 'px solid ' + cc.border + '; font-size:' + (box - 4) + 'px;' );
        } else {
            this.p = 0;
            if( this.c[1] !== undefined ) this.c[1].textContent = '';
            this.c[2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; border-radius:'+this.radius+'px;' );
        }

        this.stat = -1;

        this.init();
        this.update();

    }

    // ----------------------
    //   EVENTS
    // ----------------------
    mouseup () { 
        this.sendEnd(); 
        return false; 
    }

    mousedown ( e ) {

        this.value = !this.value;
        this.update( true );
        this.mousemove( e );
        return true 

    }

    mousemove ( e ) {

        this.cursor('pointer');
        return this.mode( true )
        
    }

    reset () {

        this.cursor();
        //return this.mode()
        return this.mode( false );

    }

    // ----------------------
    //   MODE
    // ----------------------

    mode ( over ) {

        if ( over !== undefined ) this.isOver = over;

        let change = false;
        let cc = this.colors, s = this.s, v = this.value;
        let n = this.isOver ? ( v ? 4 : 3 ) : ( v ? 2 : 1 );

        if( this.stat !== n ){

            this.stat = n;

            if( this.model === 1 ){

                switch( n ){

                    case 1: s[2].color = cc.text; s[2].background = cc.button; break;
                    case 2: s[2].color = cc.textSelect; s[2].background = cc.select; break;
                    case 3: s[2].color = cc.textOver; s[2].background = cc.overoff; break;
                    case 4: s[2].color = cc.textOver; s[2].background = cc.over; break;

                }

                if ( this.c[2] !== undefined )  this.c[2].textContent = v ? this.onName : this.name;

            } else if ( this.model === 2 ) {

                    switch ( n ) {
                        case 1: s[2].background = cc.backoff; s[2].borderColor = cc.border; break; // off out
                        case 2: s[2].background = cc.back; s[2].borderColor = cc.overoff; s[2].color = cc.textSelect; break; // on out
                        case 3: s[2].background = cc.back; s[2].borderColor = cc.overoff; break; // off over
                        case 4: s[2].background = cc.backoff; s[2].borderColor = cc.border; s[2].color = cc.textOver; break; // on over
                    }
                    if ( this.c[2] ) this.c[2].textContent = v ? '✖' : '';
                    if ( this.c[1] ) this.c[1].textContent = v ? this.onName : this.name;

            } else {

                switch( n ){

                    case 1: s[2].background = s[2].borderColor = cc.backoff; s[3].background = cc.button; break;// off out
                    case 2: s[2].background = s[2].borderColor = cc.back; s[3].background = cc.textOver; break;// on over
                    case 3: s[2].background = s[2].borderColor = cc.back; s[3].background = cc.overoff; break;// off over
                    case 4: s[2].background = s[2].borderColor = cc.backoff; s[3].background = cc.textSelect; break;// on out

                }

                s[3].marginLeft = v ? ( this.inw - 20 ) + 'px' : '4px';
                this.c[1].textContent = v ? this.onName : this.name;

            }

            change = true;

        }

        return change

    }

    // ----------------------

    update ( up ) {

        this.mode();
        if( up ) this.send();
            
    }

    rSize () {

        super.rSize();

        let s = this.s;
        let w = (this.w - 10 ) - this.inw;
        if( this.model === 0 ){
            s[2].left = w + 'px';
            s[3].left = w + 'px';
        } else if( this.model === 2 ){
            s[2].left = w + 'px';
        } else {
            s[2].left = this.sa + 'px';
            s[2].width = this.sb  + 'px';
        }
        
    }

}

class Button extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = '';
        if( o.value !== undefined ) this.value = o.value;

        this.values = o.value || this.txt;
        if( o.values ) this.values = o.values;

        if( !o.values && !o.value ) this.txt = '';

        this.onName = o.onName || null;

        this.on = false;

        // force button width
        this.bw = o.forceWidth || 0;
        if(o.bw) this.bw = o.bw;
        this.space = o.space || this.colors.sx;

        if( typeof this.values === 'string' ) this.values = [ this.values ];

        this.isDown = false;
        this.neverlock = true;
        this.res = 0;

        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];

        let sel, cc = this.colors;

        for( let i = 0; i < this.lng; i++ ){

            sel = false;
            if( this.values[i] === this.value && this.isSelectable ) sel = true;

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; height:'+(this.h-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; border-radius:'+this.radius+';' );
            this.c[i+2].style.background = sel ? cc.select : cc.button;
            this.c[i+2].style.color = sel ? cc.textSelect : cc.text;
            this.c[i+2].innerHTML = this.values[i];
            this.stat[i] = sel ? 3:1;

        }


        if( this.txt==='' ) this.p = 0 ;

        if( (!o.value && !o.values) || this.p === 0 ){
            if( this.c[1] !== undefined ) this.c[1].textContent = '';
        } 
        

        this.init();

    }

    onOff() {

        this.on = !this.on;
        this.label( this.on ? this.onName : this.value );
        
    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return -1

        let i = this.lng;
        let t = this.tmp;
        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i
        }

        return -1

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        if( !this.isDown ) return false

        this.isDown = false;
        if( this.res !== -1 ){
            if( this.value === this.values[this.res] && this.unselectable ) this.value = '';
            else this.value = this.values[this.res];
            if( this.onName !== null ) this.onOff();
            this.send();
        }

        return this.mousemove( e )

    }

    mousedown ( e ) {

        if( this.isDown ) return false
        this.isDown = true;
    	return this.mousemove( e )

    }

    mousemove ( e ) {

        let up = false;
        this.res = this.testZone( e );

        if( this.res !== -1 ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, this.res );
        } else {
        	up = this.reset();
        }

        return up

    }

    // ----------------------

    modes ( N = 1, id = -1 ) {

        let i = this.lng, w, n, r = false;

        while( i-- ){

            n = N;
            w = this.isSelectable ? this.values[ i ] === this.value : false;
            
            if( i === id ){
                if( w && n === 2 ) n = 3; 
            } else {
                n = 1;
                if( w ) n = 4;
            }

            if( this.mode( n, i ) ) r = true;
            //r = this.mode( n, i )

        }

        return r

    }

    mode ( n, id ) {

        //if(!this.s) return false
 
        let change = false;
        let cc = this.colors, s = this.s;
        let i = id+2;

        if( this.stat[id] !== n ){

            this.stat[id] = n;
        
            switch( n ){

                case 1: s[i].color = cc.text; s[i].background = cc.button; break
                case 2: s[i].color = cc.textOver; s[i].background = cc.overoff; break
                case 3: s[i].color = cc.textOver; s[i].background = cc.over; break
                case 4: s[i].color = cc.textSelect; s[i].background = cc.select; break

            }

            change = true;

        }

        return change

    }

    // ----------------------

    reset () {

        this.isDown = false;
        this.res = -1;
        this.cursor();
        return this.modes()

    }

    setValue ( v ) {
        this.value = v;
        this.modes();
    }

    label ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

    }

    switchValues( n, string ){
        this.c[n+2].innerHTML = this.values[n] = string;
    }

    icon ( string, y = 0, n = 2 ) {

        //if(y) this.s[n].margin = ( y ) +'px 0px';
        this.s[n].padding = ( y ) +'px 0px';
        this.c[n].innerHTML = string;

        return this

    }

    rSize () {

        super.rSize();

        let s = this.s;
        let w = this.sb;
        let d = this.sa;

        let i = this.lng;
        let sx = this.space;// !== undefined ? this.colors.sx //this.space;
        //let size = Math.floor( ( w-(dc*(i-1)) ) / i );
        let size = ( w-(sx*(i-1)) ) / i; 

        if( this.bw ){ 
            size = this.bw < size ? this.bw : size;
            //d = Math.floor((this.w-( (size * i) + (dc * (i-1)) ))*0.5)
            d = ((this.w-( (size * i) + (sx * (i-1)) ))*0.5);
        }

        while( i-- ){

            if ( !this.tmp[i] ) this.tmp[i] = [];

            this.tmp[i][0] = ( d + ( size * i ) + ( sx * i ));
            this.tmp[i][1] = size;

        	//this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
            //this.tmp[i] = [ ( d + ( size * i ) + ( sx * i )), size ];
        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];

            s[i+2].left = this.tmp[i][0] + 'px';
            s[i+2].width = this.tmp[i][1] + 'px';

        }

    }

}

class Circular extends Proto {

    constructor( o = {} ) {

        super( o );

        this.isCyclic = o.cyclic || false;
        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;



        this.autoWidth = false;
        this.minw = this.w;
        this.diam = o.diam || this.w; 

        //this.fw = this.w

        this.setTypeNumber( o );

        this.twoPi = Tools.TwoPI;
        this.pi90 = Tools.pi90;

        this.offset = new V2();

        this.h = o.h || this.w + 10;

        this.c[0].style.width = this.w +'px';
        this.c[0].style.display = 'block';

        this.top = 0;
        this.isDown = false;

        if(this.c[1] !== undefined) {

            this.c[1].style.width = '100%';
            this.c[1].style.justifyContent = 'center';
            this.top = 14;
            this.h += 14;

        }



        this.percent = 0;
        this.cmode = 0;
        let cc = this.colors;

        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+(this.h-16)+'px; width:100%; color:'+ cc.text );

        // svg
        
        this.c[3] = this.getCircular();

        this.setSvg( this.c[3], 'stroke', cc.back, 0 );
        this.setSvg( this.c[3], 'd', this.makePath(), 1 );
        this.setSvg( this.c[3], 'stroke', cc.text, 1 );

        this.setSvg( this.c[3], 'viewBox', '0 0 128 128' );
        this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top });

        if ( this.model > 0 ) {

            this.colors01 = Tools.unpack( Tools.ColorLuma( cc.text, -0.75) );
            this.colors02 = Tools.unpack( cc.text );
            
        }

        this.init();
        this.update();

    }

    mode ( mode ) {

        if( this.cmode === mode ) return false;

        let cc = this.colors;
        let color;

        switch( mode ){

            case 0: // base
                this.s[2].color = cc.text;
                this.setSvg( this.c[3], 'stroke', cc.back, 0 );
                color = this.model > 0 ? Tools.pack( Tools.lerpColor( this.colors01, this.colors02, this.percent ) ) : cc.text;
                this.setSvg( this.c[3], 'stroke', color, 1 );
            break;
            case 1: // down
                this.s[2].color = cc.textOver;
                this.setSvg( this.c[3], 'stroke', cc.backoff, 0 );
                color = this.model > 0 ? Tools.pack( Tools.lerpColor( this.colors01, this.colors02, this.percent ) ) : cc.textOver;
                this.setSvg( this.c[3], 'stroke', color, 1 );
            break;
            /*case 0: // base

                this.s[2].color = cc.text;
                this.setSvg( this.c[3], 'stroke', cc.back, 0);
                color = this.model > 0 ? Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( cc.text, -0.75) ), Tools.unpack( cc.text ), this.percent ) ) : cc.text;
                this.setSvg( this.c[3], 'stroke', color, 1 );
                
            break;
            case 1: // down

                this.s[2].color = cc.textOver;
                this.setSvg( this.c[3], 'stroke', cc.backoff, 0);
                color = this.model > 0 ? Tools.pack( Tools.lerpColor( Tools.unpack( Tools.ColorLuma( cc.text, -0.75) ), Tools.unpack( cc.text ), this.percent ) ) : cc.textOver
                this.setSvg( this.c[3], 'stroke', color, 1 );
                
            break;*/
        }

        this.cmode = mode;
        return true;

    }

    reset () {

        this.isDown = false;
        this.cursor();
        return this.mode(0);
        
    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( this.c[1] && l.y <= this.c[1].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[2].offsetHeight ) return 'text';
        else return 'circular'; 
        
        /*if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
        else return 'circular';*/

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        if ( this.isDown ) this.sendEnd();
        this.isDown = false;
        return this.mode(0);

    }

    mousedown ( e ) {

        this.isDown = true;
        this.old = this.value;
        this.oldr = null;
        this.mousemove( e );
        return this.mode(1);

    }

    mousemove ( e ) {

        if( !this.isDown ) {
            let name = this.testZone( e );
            if( name === 'circular' || name === 'knob' ) {
                this.cursor('pointer');
                return this.mode(1);
            }
            return this.reset();
        }

        //console.log('over')
        this.cursor('pointer');

        let off = this.offset;
        off.x = (this.w*0.5) - ( e.clientX - this.zone.x );
        off.y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.ytop );

        this.r = off.angle() - this.pi90;
        this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

        if ( this.oldr !== null ) {
            let dif = this.r - this.oldr;
            if ( Math.abs( dif ) > Math.PI ) {
                if ( !this.isCyclic ) this.r = dif > 0 ? 0 : this.twoPi;
            }
        }

        let value = this.r / this.twoPi;
        let n = Math.trunc( ( ( ( this.range * value ) + this.min ) - this.old ) / this.step );

        if ( n !== 0 ) {
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
            return true;
        }

        /*if( this.oldr !== null ){ 

            let dif = this.r - this.oldr;
            this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

            if( dif > 6 ) this.r = 0;
            if( dif < -6 ) this.r = this.twoPi;

        }

        let steps = 1 / this.twoPi;
        let value = this.r * steps;

        let n = ( ( this.range * value ) + this.min ) - this.old;

        if(n >= this.step || n <= this.step){ 
            n = ~~ ( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
            return true;
        }*/

        return false;

    }

    wheel ( e ) {

        let name = this.testZone( e );

        if( name === 'circular' ) {
    
            let v = this.value - this.step * e.delta;
    
            if ( v > this.max ) {
                v = this.isCyclic ? this.min : this.max;
            } else if ( v < this.min ) {
                v = this.isCyclic ? this.max : this.min;
            }
    
            this.setValue( v );
            this.old = v;
            this.update( true );

            return true;
    
        }
        return false;

    }

    // ----------------------

    makePath () {

        let r = 40;
        let d = 24;
        let a = this.percent * this.twoPi - 0.001;
        let x2 = (r + r * Math.sin(a)) + d;
        let y2 = (r - r * Math.cos(a)) + d;
        let big = a > Math.PI ? 1 : 0;
        return "M " + (r+d) + "," + d + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2;

    }

    update ( up ) {

        this.c[2].textContent = this.value;
        this.percent = ( this.value - this.min ) / this.range;

        this.setSvg( this.c[3], 'd', this.makePath(), 1 );

        if ( this.model > 0 ) {

            

            this.colors;
            let color = Tools.pack( Tools.lerpColor( this.colors01, this.colors02, this.percent ) );
            this.setSvg( this.c[3], 'stroke', color, 1 );
        
        }

        if( up ) this.send();
        
    }

    /*rSize () {

        super.rSize();
        this.s[3].left = Math.floor( ( this.w - this.diam ) * 0.5 ) + 'px';

    }*/

}

class Color extends Proto {

    constructor( o = {} ) {

        super( o );

	    //this.autoHeight = true;

	    this.ctype = o.ctype || 'hex';

	    this.wfixe = 0;//256;

	    this.cw = this.sb > 256 ? 256 : this.sb;
	    if(o.cw != undefined ) this.cw = o.cw;

	    // color up or down
	    this.side = o.side || 'down';
	    this.up = this.side === 'down' ? 0 : 1;
	    
	    this.baseH = this.h;

	    this.offset = new V2();
	    this.decal = new V2();
	    this.pp = new V2();

	    this.third = (2/3) * Tools.PI;

	    let cc = this.colors;

	    this.c[2] = this.dom( 'div', `${this.css.txt} ${this.css.middle} top:1px; height:${this.h-2}px; border-radius:${this.radius}; text-shadow:none; border:${cc.borderSize}px solid ${cc.border};` );
	  
	    this.c[0].style.display = 'block';
	    this.c[3] = this.getColorRing();
	    this.c[3].style.visibility  = 'hidden';

	    this.hsl = null;
	    this.value = '#ffffff';
	    if( o.value !== undefined ){
	    	if( o.value.isColor ){ this.value = '#' + o.value.getHexString('srgb'); }
	        else if( o.value instanceof Array ) this.value = Tools.rgbToHex( o.value );
	        else if(!isNaN(o.value)) this.value = Tools.hexToHtml( o.value );
	        else this.value = o.value;
	    }

	    this.line = this.dom( 'div', 'position:absolute; left:0; top:2px; bottom:2px; width:4px; background:#000; pointer-events:none; z-index:10;' );
	    this.c[ 1 ].appendChild( this.line );

	    this.bcolor = null;
	    this.isDown = false;
	    this.fistDown = false;

	    this.notext = o.notext || false;

	    this.tr = 98;
	    this.tsl = Math.sqrt(3) * this.tr;

	    this.hue = 0;
	    this.d = 256;

	    this.init();

	    

	    this.setColor( this.value );

	    if( o.open !== undefined ) this.open();

	}

	testZone ( mx, my ) {

		let l = this.local;
		if( l.x === -1 && l.y === -1 ) return ''

		if( this.up && this.isOpen ){

			if( l.y > this.wfixe ) return 'title'
		    else return 'color'

		} else {

			if( l.y < this.baseH+2 ) return 'title'
	    	else if( this.isOpen ) return 'color'

		}

    }

	// ----------------------
    //   EVENTS
    // ----------------------

	mouseup ( e ) {

	    this.isDown = false;
	    this.d = 256;
	    this.sendEnd();

	}

	mousedown ( e ) {

		let name = this.testZone( e.clientX, e.clientY );

		if ( name === 'title' ) {
			if ( !this.isOpen ) this.open();
			else this.close();
			return true;
		}

		if ( name === 'color' ) {
			this.isDown = true;
			this.fistDown = true;
			return this.mousemove( e );
		}

		return false;

	}

	mousemove ( e ) {

	    let name = this.testZone( e.clientX, e.clientY );
	    let off, d, hue, sat, lum, rad, x, y, rr, T = Tools;
	    let changed = false;

	    if ( name === 'title' ) this.cursor('pointer');

	    if ( name === 'color' ) {

	    	off = this.offset;
		    off.x = e.clientX - ( this.zone.x + this.decal.x + this.mid );
		    off.y = e.clientY - ( this.zone.y + this.decal.y + this.mid ) - this.ytop;
			d = off.length() * this.ratio;
			rr = off.angle();
			if ( rr < 0 ) rr += 2 * T.PI;

	    	if ( d < 128 ) this.cursor('crosshair');
	    	else if ( !this.isDown ) this.cursor();

	    	if ( this.isDown ) {

			    if ( this.fistDown ) {
			    	this.d = d;
			    	this.fistDown = false;
			    }

			    if ( this.d < 128 ) {

				    if ( this.d > this.tr ) { // outside hue

				        hue = ( rr + T.pi90 ) / T.TwoPI;
				        this.hue = ( hue + 1 ) % 1;
				        this.setHSL( [ this.hue, this.hsl[1], this.hsl[2] ] );
				        changed = true;

				    } else { // triangle

				    	x = off.x * this.ratio;
				    	y = off.y * this.ratio;

				    	let rr = ( this.hue * T.TwoPI ) + T.PI;
				    	if ( rr < 0 ) rr += 2 * T.PI;

				    	rad = Math.atan2( -y, x );
				    	if ( rad < 0 ) rad += 2 * T.PI;
						
				    	let rad0 = ( rad + T.pi90 + T.TwoPI + rr ) % ( T.TwoPI ),
				    	rad1 = rad0 % ( (2/3) * T.PI ) - ( T.pi60 ),
				    	a    = 0.5 * this.tr,
				    	b    = Math.tan( rad1 ) * a,
				    	r    = Math.sqrt( x*x + y*y ),
				    	maxR = Math.sqrt( a*a + b*b );

				    	if ( r > maxR ) {
							let dx = Math.tan( rad1 ) * r;
							let rad2 = Math.atan( dx / maxR );
							if ( rad2 > T.pi60 ) rad2 = T.pi60;
						    else if ( rad2 < -T.pi60 ) rad2 = -T.pi60;
						
							rad += rad2 - rad1;

							rad0 = ( rad + T.pi90 + T.TwoPI + rr ) % ( T.TwoPI );
							rad1 = rad0 % ( (2/3) * T.PI ) - ( T.pi60 );
							b = Math.tan( rad1 ) * a;
							r = maxR = Math.sqrt( a*a + b*b );
						}

						lum = ( ( Math.sin( rad0 ) * r ) / this.tsl ) + 0.5;
						let w = 1 - ( Math.abs( lum - 0.5 ) * 2 );
						sat = w > 0.0001 ? ( ( ( Math.cos( rad0 ) * r ) + ( this.tr / 2 ) ) / ( 1.5 * this.tr ) ) / w : 0;
						sat = T.clamp( sat, 0, 1 );
						
				        this.setHSL( [ this.hsl[0], sat, lum ] );
				        changed = true;

				    }
				}
			}
		}

		return changed;

	}

	

	// ----------------------

	setHeight () {

		this.h = this.isOpen ? this.wfixe + this.baseH + 5 : this.baseH;
		this.s[0].height = this.h + 'px';
		this.zone.h = this.h;

	}

	parentHeight ( t ) {

		if ( this.group !== null ) this.group.calc( t );
	    else if ( this.isUI ) this.main.calc( t );

	}

	open () {

		super.open();

		this.setHeight();

		if( this.up ) this.zone.y -= this.wfixe + 5;

		let t = this.h - this.baseH;

	    this.s[3].visibility = 'visible';
	    //this.s[3].display = 'block';
	    this.parentHeight( t );

	}

	close () {

		super.close();

		if( this.up ) this.zone.y += this.wfixe + 5;

		let t = this.h - this.baseH;

		this.setHeight();

	    this.s[3].visibility  = 'hidden';
	    //this.s[3].display = 'none';
	    this.parentHeight( -t );

	}

	update ( up ) {

	    let cc = Tools.rgbToHex( Tools.hslToRgb([ this.hsl[0], 1, 0.5 ]) );

	    this.invert = Tools.findDeepInver( this.rgb );
	    this.moveMarkers();
	    
	    this.value = this.bcolor;

	    this.setSvg( this.c[3], 'fill', cc, 2, 0 );

	    this.s[2].background = this.bcolor;
	    this.line.style.background = this.bcolor;
	    if(!this.notext) this.c[2].textContent = Tools.htmlToHex( this.bcolor );

	    
	    this.s[2].color = this.invert ? '#fff' : '#000';

	    if(!up) return;

	    if( this.ctype === 'array' ) this.send( this.rgb );
	    if( this.ctype === 'rgb' ) this.send( Tools.htmlRgb( this.rgb ) );
	    if( this.ctype === 'hex' ) this.send( Tools.htmlToHex( this.value ) );
	    if( this.ctype === 'html' ) this.send();

	}

	setValue ( v ){

		//if ( v && v.isColor ) this.value = '#' + v.getHexString();
	    if( v instanceof Array ) this.value = Tools.rgbToHex( v );
        else if(!isNaN(v)) this.value = Tools.hexToHtml( v );
        else this.value = v;

		this.setColor( this.value );

	}

	setColor ( color ) {

	    let unpack = Tools.unpack(color);
	    if (this.bcolor !== color && unpack) {

	        this.bcolor = color;
	        this.rgb = unpack;
	        this.hsl = Tools.rgbToHsl( this.rgb );
	        this.hue = this.hsl[0];
	        this.update();
	    }
	    return this;

	}

	setHSL ( hsl ) {

	    this.hsl = hsl;
	    this.rgb = Tools.hslToRgb( hsl );
	    this.bcolor = Tools.rgbToHex( this.rgb );
	    this.update( true );
	    return this;

	}

	moveMarkers () {

		let p = this.pp;
		let T = Tools;

	    let c1 = this.invert ? '#fff' : '#000';
	    let a = this.hsl[0] * T.TwoPI;
	    
	    let r = this.tr;
	    let h = this.hsl[0];
	    let s = this.hsl[1];
	    let l = this.hsl[2];

	    let angle = ( a - T.pi90 ) * T.todeg;

	    h = - a + T.pi90;

		let hx = Math.cos(h) * r;
		let hy = -Math.sin(h) * r;
		let sx = Math.cos(h - this.third) * r;
		let sy = -Math.sin(h - this.third) * r;
		let vx = Math.cos(h + this.third) * r;
		let vy = -Math.sin(h + this.third) * r;
		let mx = (sx + vx) / 2, my = (sy + vy) / 2;
		a  = (1 - 2 * Math.abs(l - .5)) * s;
		let x = sx + (vx - sx) * l + (hx - mx) * a;
		let y = sy + (vy - sy) * l + (hy - my) * a;

	    p.set( x, y ).addScalar(128);

	    //let ff = (1-l)*255;
	    // this.setSvg( this.c[3], 'stroke', 'rgb('+ff+','+ff+','+ff+')', 3 );

	    this.setSvg( this.c[3], 'transform', 'rotate('+angle+' )', 2 );

	    this.setSvg( this.c[3], 'cx', p.x, 3 );
	    this.setSvg( this.c[3], 'cy', p.y, 3 );
	    
	    this.setSvg( this.c[3], 'stroke', c1, 2, 3 );
	    this.setSvg( this.c[3], 'stroke', c1, 3 );
	    this.setSvg( this.c[3], 'fill',this.bcolor, 3 );

	}

	/*rSize () {

	    super.rSize();

	    let s = this.s;

	    s[2].width = this.sb + 'px';
	    s[2].left = this.sa + 'px';

	    this.cw = this.sb > 256 ? 256 : this.sb;
	    this.rSizeColor( this.cw );

	    this.decal.x = Math.floor( ( this.w - this.wfixe ) * 0.5 );
	    s[2].left = this.decal.x + 'px';

	}

	rSizeColor ( w ) {

		if ( w === this.wfixe ) return;

		const oldH = this.h;
		this.wfixe = w;

	    this.decal.y = this.side === 'up' ? 2 : this.baseH + 2;
	    this.mid = Math.floor( this.wfixe * 0.5 );

	    let s = this.s;
	    this.setSvg( this.c[3], 'viewBox', '0 0 256 256' );
	    s[3].width = this.wfixe + 'px';
	    s[3].height = this.wfixe + 'px';
	    s[3].top = this.decal.y + 'px';

	    this.ratio = 256 / this.wfixe;
	    this.square = 1 / ( 60 * ( this.wfixe / 256 ) );
	    this.setHeight();

	    if ( this.isOpen && oldH && this.h !== oldH ) this.parentHeight( this.h - oldH );

	}*/

	rSize () {

	    //Proto.prototype.rSize.call( this );
	    super.rSize();

	    let s = this.s;

	    s[2].width = this.sb + 'px';
	    s[2].left = this.sa + 'px';

	    this.cw = this.sb > 256 ? 256 : this.sb;
	    this.rSizeColor( this.cw );
	    this.decal.x = Math.floor((this.w - this.wfixe) * 0.5);

	    
	}

	rSizeColor ( w ) {


		if( w === this.wfixe ) return;

		const oldH = this.h;
		this.wfixe = w;

		let s = this.s;

	    this.decal.y = this.side === 'up' ? 2 : this.baseH + 2;
	    this.mid = Math.floor( this.wfixe * 0.5 );

	    this.setSvg( this.c[3], 'viewBox', '0 0 256 256' );
	    s[3].width = this.wfixe + 'px';
	    s[3].height = this.wfixe + 'px';
	    s[3].top = this.decal.y + 'px';

	    this.ratio = 256 / this.wfixe;
	    this.square = 1 / (60*(this.wfixe/256));
	    this.setHeight();

	    if ( this.isOpen && oldH && this.h !== oldH ) this.parentHeight( this.h - oldH );


	}


}

class Fps extends Proto {

    constructor( o = {} ) {

        super( o );

        this.round = Math.round;

        //this.autoHeight = true;

        this.baseH = this.h;
        this.hplus = o.hplus || 50;

        this.res = o.res || 40;
        this.l = 1;

        this.precision = o.precision || 0;
        

        this.custom = o.custom || false;
        this.names = o.names || ['FPS', 'MS'];
        let cc = o.cc || ['220,220,220', '255,255,0'];

       // this.divid = [ 100, 100, 100 ];
       // this.multy = [ 30, 30, 30 ];

        this.adding = o.adding || false;

        this.range = o.range || [ 165, 100, 100 ];

        this.alpha = o.alpha || 0.25;

        this.values = [];
        this.points = [];
        this.textDisplay = [];

        if(!this.custom){

            this.now = Roots.getTime();
            this.startTime = 0;//this.now()
            this.prevTime = 0;//this.startTime;
            this.frames = 0;

            this.ms = 0;
            this.fps = 0;
            this.mem = 0;
            this.mm = 0;

            this.isMem = ( self.performance && self.performance.memory ) ? true : false;

           // this.divid = [ 100, 200, 1 ];
           // this.multy = [ 30, 30, 30 ];

            if( this.isMem ){

                this.names.push('MEM');
                cc.push('0,255,255');

            }

            this.txt = o.name || 'Fps';

        }


        let fltop = Math.floor(this.h*0.5)-3;
        const ccc = this.colors;

        this.c[1].textContent = this.txt;
        //this.c[1].innerHTML = '&#160;' + this.txt
        this.c[0].style.cursor = 'pointer';
        this.c[0].style.pointerEvents = 'auto';

        let panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px; box-sizing:border-box; background: rgba(0, 0, 0, 0.2); border:1px solid '+ ccc.border +';';

        if( this.radius !== '0px' ) panelCss += 'border-radius:' + this.radius; 

        this.c[2] = this.dom( 'path', this.css.basic + panelCss , {} );

        this.c[2].setAttribute('viewBox', '0 0 '+this.res+' 50' );
        this.c[2].setAttribute('height', '100%' );
        this.c[2].setAttribute('width', '100%' );
        this.c[2].setAttribute('preserveAspectRatio', 'none' );


        //this.dom( 'path', null, { fill:'rgba(255,255,0,0.3)', 'stroke-width':1, stroke:'#FF0', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
        //this.dom( 'path', null, { fill:'rgba(0,255,255,0.3)', 'stroke-width':1, stroke:'#0FF', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
        
        // arrow
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; left:0; top:'+fltop+'px;', { d:this.svgs.g1, fill:ccc.text, stroke:'none'});
        //this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.colors.text, stroke:'none'});

        // result test
        this.c[4] = this.dom( 'div', this.css.txt + 'position:absolute; left:10px; top:'+(this.h+2) +'px; display:none; width:100%; text-align:center;' );

        // bottom line
        if( o.bottomLine ) this.c[4] = this.dom( 'div', this.css.basic + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');

        this.isShow = false;



        let s = this.s;

        //s[1].marginLeft = '10px';
        s[1].lineHeight = this.h-4;
        s[1].color = ccc.text;
        //s[1].paddingLeft = '18px';
        //s[1].fontWeight = 'bold';

        if( this.radius !== '0px' )  s[0].borderRadius = this.radius;
        if( this.colors.gborder!=='none') s[0].border = '1px solid ' + ccc.gborder;




        let j = 0;

        for( j=0; j<this.names.length; j++ ){

            let base = [];
            let i = this.res+1;
            while( i-- ) base.push(50);

            this.range[j] = ( 1 / this.range[j] ) * 49;
            
            this.points.push( base );
            this.values.push(0);
           //  this.dom( 'path', null, { fill:'rgba('+cc[j]+',0.5)', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
            this.textDisplay.push( "<span style='color:rgb("+cc[j]+")'> " + this.names[j] +" ");

        }

        j = this.names.length;
        while(j--){
            this.dom( 'path', null, { fill:'rgba('+cc[j]+','+this.alpha+')', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
        }


        this.init();

        //if( this.isShow ) this.show();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown ( e ) {

        if( this.isShow ) this.close();
        else this.open();

    }

    // ----------------------

    /*mode: function ( mode ) {

        let s = this.s;

        switch(mode){
            case 0: // base
                s[1].color = this.colors.text;
                //s[1].background = 'none';
            break;
            case 1: // over
                s[1].color = '#FFF';
                //s[1].background = UIL.SELECT;
            break;
            case 2: // edit / down
                s[1].color = this.colors.text;
                //s[1].background = UIL.SELECTDOWN;
            break;

        }
    },*/

    tick ( v ) {

        this.values = v;
        if( !this.isShow ) return;
        this.drawGraph();
        this.upText();

    }

    makePath ( point ) {

        let p = '';
        p += 'M ' + (-1) + ' ' + 50;
        for ( let i = 0; i < this.res + 1; i ++ ) { p += ' L ' + i + ' ' + point[i]; }
        p += ' L ' + (this.res + 1) + ' ' + 50;
        return p;

    }

    upText ( val ) {

        let v = val || this.values, t = '';
        for( let j=0, lng =this.names.length; j<lng; j++ ) t += this.textDisplay[j] + (v[j]).toFixed(this.precision) + '</span>';
        this.c[4].innerHTML = t;
    
    }

    drawGraph () {

        let svg = this.c[2];
        let i = this.names.length, v, old = 0, n = 0;

        while( i-- ){
            if( this.adding ) v = (this.values[n]+old) * this.range[n];
            else  v = (this.values[n] * this.range[n]);
            this.points[n].shift();
            this.points[n].push( 50 - v );
            this.setSvg( svg, 'd', this.makePath( this.points[n] ), i+1 );
            old += this.values[n];
            n++;

        }

    }

    open () {

        super.open();

        this.h = this.hplus + this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.g2 );

        if( this.group !== null ){ this.group.calc( this.hplus );}
        else if( this.isUI ) this.main.calc( this.hplus );

        this.s[0].height = this.h +'px';
        this.s[2].display = 'block'; 
        this.s[4].display = 'block';
        this.isShow = true;

        if( !this.custom ) Roots.addListen( this );

    }

    close () {

        super.close();

        this.h = this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.g1 );

        if( this.group !== null ){ this.group.calc( -this.hplus );}
        else if( this.isUI ) this.main.calc( -this.hplus );
        
        this.s[0].height = this.h +'px';
        this.s[2].display = 'none';
        this.s[4].display = 'none';
        this.isShow = false;

        if( !this.custom ) Roots.removeListen( this );

        this.c[4].innerHTML = '';
        
    }


    ///// AUTO FPS //////

    begin () {

        this.startTime = this.now();
        
    }

    end () {

        let time = this.now();
        this.ms = time - this.startTime;

        this.frames ++;

        if ( time > this.prevTime + 1000 ) {

            this.fps = this.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );

            this.prevTime = time;
            this.frames = 0;

            if ( this.isMem ) {

                let heapSize = performance.memory.usedJSHeapSize;
                let heapSizeLimit = performance.memory.jsHeapSizeLimit;

                this.mem = this.round( heapSize * 0.000000954 );
                this.mm = heapSize / heapSizeLimit;

            }

        }

        this.values = [ this.fps, this.ms , this.mm ];

        this.drawGraph();
        this.upText( [ this.fps, this.ms, this.mem ] );

        return time;

    }

    listening () {

        if( !this.custom ) this.startTime = this.end();
        
    }

    rSize () {

        let s = this.s;
        let w = this.w;

        s[3].left = ( this.sa + this.sb - 6 ) + 'px';

        s[0].width = w + 'px';
        s[1].width = w + 'px';
        s[2].left = 10 + 'px';
        s[2].width = (w-20) + 'px';
        s[4].width = (w-20) + 'px';
        
    }
    
}

//import { V2 } from '../core/V2.js';

class Graph extends Proto {

    constructor( o = {} ) {

        super( o );

    	this.value = o.value !== undefined ? o.value : [0,0,0];
        this.lng = this.value.length;

        this.precision = o.precision !== undefined ? o.precision : 2;
        this.multiplicator = o.multiplicator || 1;
        this.neg = o.neg || false;

        this.line = o.line !== undefined ?  o.line : true;

        //if(this.neg)this.multiplicator*=2;

        this.autoWidth = o.autoWidth !== undefined ? o.autoWidth : true;
        this.isNumber = false;

        this.isDown = false;

        this.h = o.h || 128 + 10;
        this.rh = this.h - 10;
        this.top = 0;

        this.c[0].style.width = this.w +'px';

        if( this.c[1] !== undefined ) { // with title

            this.c[1].style.width = this.w +'px';

            if(!this.autoWidth){
                this.c[1].style.width = '100%';
                this.c[1].style.justifyContent = 'center';
            }
            
            
            //this.c[1].style.background = '#ff0000';
            //this.c[1].style.textAlign = 'center';
            this.top = 10;
            this.h += 10;

        }

        this.gh = this.rh - 28;
        this.gw = this.w - 28;

      
        //this.c[2] = this.dom( 'div', this.css.txt + 'display:block; text-align:center; padding:0px 0px; top:'+(this.h-20)+'px; left:14px; width:'+this.gw+'px;  color:'+ this.colors.text );
        //this.c[2].innerHTML = this.valueToHtml();

        this.c[ 2 ] = this.dom( 'div', this.css.txt + 'display:flex; justify-content:space-between; text-align:center; padding:0px; top:' + (this.h - 20) + 'px; left:14px; width:' + this.gw + 'px; color:' + this.colors.text );
        this.txts = [];
        for ( let i = 0; i < this.lng; i++ ) {
            const sp = this.dom( 'span', 'flex:1; text-align:center;' );
            this.c[ 2 ].appendChild( sp );
            this.txts.push( sp );
        }

        let svg = this.dom( 'svg', this.css.basic , { viewBox:'0 0 '+this.w+' '+this.rh, width:this.w, height:this.rh, preserveAspectRatio:'none' } );
        this.setCss( svg, { width:this.w, height:this.rh, left:0, top:this.top });

        this.dom( 'path', '', { d:'', stroke:this.colors.text, 'stroke-width':2, fill:'none', 'stroke-linecap':'butt' }, svg );
        this.dom( 'rect', '', { x:10, y:10, width:this.gw+8, height:this.gh+8, stroke:'rgba(0,0,0,0.3)', 'stroke-width':1 , fill:'none'}, svg );

        this.iw = ((this.gw-(4*(this.lng-1)))/this.lng);
        let t = [];
        this.cMode = [];

        this.v = [];

        for( let i = 0; i < this.lng; i++ ){

        	t[i] = [ 14 + (i*this.iw) + (i*4), this.iw ];
        	t[i][2] = t[i][0] + t[i][1];
        	this.cMode[i] = 0;

            if( this.neg ) this.v[i] = ((1+(this.value[i] / this.multiplicator))*0.5);
        	else this.v[i] = this.value[i] / this.multiplicator;

        	this.dom( 'rect', '', { x:t[i][0], y:14, width:t[i][1], height:1, fill:this.colors.text, 'fill-opacity':0.3 }, svg );

        }

        this.tmp = t;
        this.c[3] = svg;

        //console.log(this.w)

        this.init();

        if( this.c[1] !== undefined ){
            this.c[1].style.top = 0 +'px';
            this.c[1].style.height = 20 +'px';
            this.s[1].lineHeight = (20-5)+'px';
        }

        this.update( false );

    }

    setValue ( value ) {

        this.value = value;
        this.lng = this.value.length;
        for (var i = 0; i < this.lng; i++) {
            if (this.neg) this.v[i] = (1 + value[i] / this.multiplicator) * 0.5;
            else this.v[i] = value[i] / this.multiplicator;
        }
        this.update();

    }

    /*valueToHtml() {

        let i = this.lng, n=0, r = '<table style="width:100%;"><tr>'
        let w = 100 / this.lng
        let style = 'width:'+ w +'%;'//' text-align:center;'
        while(i--){
            if(n===this.lng-1) r += '<td style='+style+'>' + this.value[n] + '</td></tr></table>'
            else r += '<td style='+style+'>' + this.value[n] + '</td>'
            n++
        }
        return r
    }*/

    updateSVG () {

        if( this.line ) this.setSvg( this.c[3], 'd', this.makePath(), 0 );

        for(let i = 0; i<this.lng; i++ ){

            this.setSvg( this.c[3], 'height', this.v[i]*this.gh, i+2 );
            this.setSvg( this.c[3], 'y', 14 + (this.gh - this.v[i]*this.gh), i+2 );
            if( this.neg ) this.value[i] = ( ((this.v[i]*2)-1) * this.multiplicator ).toFixed( this.precision ) * 1;
            else this.value[i] = ( (this.v[i] * this.multiplicator) ).toFixed( this.precision ) * 1;

            this.txts[ (this.lng-1)-i ].textContent = this.value[ i ];

        }

        //this.c[2].textContent = this.value;
        //this.c[2].innerHTML = this.valueToHtml();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let i = this.lng;
        let t = this.tmp;
        
	    if( l.y>this.top && l.y<this.h-20 ){
	        while( i-- ){
	            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
	        }
	    }

        return ''

    }

    mode ( n, name ) {

    	if( n === this.cMode[name] ) return false;

    	let a;

        switch(n){
            case 0: a=0.3; break;
            case 1: a=0.6; break;
            case 2: a=1; break;
        }

        this.reset();

        this.setSvg( this.c[3], 'fill-opacity', a, name + 2 );
        this.cMode[name] = n;

        return true;



    }

    // ----------------------
    //   EVENTS
    // ----------------------

    reset () {

    	let nup = false;
        //this.isDown = false;

        let i = this.lng;
        while(i--){ 
            if( this.cMode[i] !== 0 ){
                this.cMode[i] = 0;
                this.setSvg( this.c[3], 'fill-opacity', 0.3, i + 2 );
                nup = true;
            }
        }

        return nup;

    }

    mouseup ( e ) {

        if ( this.isDown ) {
            this.isDown = false;
            this.sendEnd();
            return this.mousemove( e );
        }
        return false;

        //this.isDown = false;
        //if( this.current !== -1 ) return this.reset();
        
    }

    mousedown ( e ) {

    	this.isDown = true;
        return this.mousemove( e );

    }

    mousemove ( e ) {

    	let nup = false;

    	let name = this.testZone(e);

    	if( name === '' ){

            nup = this.reset();
            //this.cursor();

        } else { 

            nup = this.mode( this.isDown ? 2 : 1, name );
            //this.cursor( this.current !== -1 ? 'move' : 'pointer' );
            if(this.isDown){
            	this.v[name] = this.clamp( 1 - (( e.clientY - this.zone.y - this.ytop - 10 ) / this.gh) , 0, 1 );
            	this.update( true );
                nup = true;
            }

        }

        return nup;

    }

    // ----------------------

    update ( up ) {

    	this.updateSVG();

        if( up ) this.send();

    }

    makePath () {

    	let p = "", h, w, wn, wm, ow, oh;
    	//let g = this.iw*0.5

    	for(let i = 0; i<this.lng; i++ ){

    		h = 14 + (this.gh - this.v[i]*this.gh);
    		w = (14 + (i*this.iw) + (i*4));

    		wm = w + this.iw*0.5;
    		wn = w + this.iw;

    		if( i === 0 ) p+='M '+w+' '+ h + ' T ' + wm +' '+ h;
    		else p += ' C ' + ow +' '+ oh + ',' + w +' '+ h + ',' + wm +' '+ h;
    		if( i === this.lng-1 ) p+=' T ' + wn +' '+ h;

    		ow = wn;
    		oh = h; 

    	}

    	return p

    }

    /*rSize () {
        super.rSize();

        let s = this.s;
        if ( this.c[ 1 ] !== undefined ) s[ 1 ].width = this.w + 'px';

        this.gw = this.w - 28;
        this.iw = ( this.gw - ( 4 * ( this.lng - 1 ) ) ) / this.lng;

        s[ 2 ].width = this.gw + 'px';
        s[ 3 ].width = this.w + 'px';
        this.setSvg( this.c[ 3 ], 'viewBox', '0 0 ' + this.w + ' ' + this.rh );
        this.setSvg( this.c[ 3 ], 'width', this.w );
        this.setSvg( this.c[ 3 ], 'width', this.gw + 8, 1 );

        for ( let i = 0; i < this.lng; i++ ) {
            const x = 14 + ( i * this.iw ) + ( i * 4 );
            this.tmp[ i ][ 0 ] = x;
            this.tmp[ i ][ 1 ] = this.iw;
            this.tmp[ i ][ 2 ] = x + this.iw;
           //this.setSvg( this.c[ 3 ], 'x', x, i + 2 );
            //this.setSvg( this.c[ 3 ], 'width', this.iw, i + 2 );
        }

        //this.updateSVG();
    }*/

    rSize () {

        super.rSize();

        let s = this.s;
        if( this.c[1] !== undefined ) s[1].width = this.w + 'px';
        s[3].width = this.w + 'px';

        let gw = this.w - 28;
        let iw = ((gw-(4*(this.lng-1)))/this.lng);

        s[2].width = gw + 'px';

        for( let i = 0; i < this.lng; i++ ){

            const x = 14 + ( i * iw ) + ( i * 4 );
            this.tmp[ i ][ 0 ] = x;
            this.tmp[ i ][ 1 ] = iw;
            this.tmp[ i ][ 2 ] = x + iw;

            //t[i] = [ 14 + (i*iw) + (i*4), iw ]
            //t[i][2] = t[i][0] + t[i][1]

        }

        //this.tmp = t

    }

}

//import { Empty } from './Empty.js';

class Group extends Proto {

    constructor( o = {} ) {

        super( o );

        const cc = this.colors;

        this.isGroup = true;
        this.isDefGroup = false;
        this.autoHeight = true;
        this.isEmpty = true;
        this.useFlex = true ;

        if(!o.mark){ 
            o.mark = '#47484d';
            this.isDefGroup = true;
        }

        this.bgAlpha = 1;
        if( o.bgAlpha ) this.bgAlpha = o.bgAlpha;

        this.ADD = o.add;
        this.uis = [];
        this.current = -1;
        this.proto = null;
        
        this.borderCC = o.mark ? 3 : 0;
        this.decal = o.group ? 8 : 0;
        this.baseH = this.h;
        //this.radius = 20;

        let fltop = Math.floor(this.h*0.5)-3;
        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : '';

        this.c[2] = this.dom( 'div', this.css.basic + flexible + 'width:100%; left:0;  overflow:hidden; top:'+(this.h)+'px');
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; left:0; top:'+fltop+'px;', { d:this.svgs.g1, fill:cc.text, stroke:'none'});

        //let bh = this.mtop === 0 ? this.margin : this.mtop;
        //let s = this.s;

        this.c[1].name = 'group';
        this.c[1].style.color = cc.text;

        this.init();
        this.setMark( o.mark );

        if( o.open ) this.open();

    }

    setMark ( mark ) {

        //return

        const cc = this.colors;
        const s = this.s;
        
        let titleColor = !this.isDefGroup ? Tools.ColorLuma( mark, -0.65 ) : ( cc.groups === 'none' ? cc.background : cc.groups );
        if( this.bgAlpha !== 1 ) titleColor = Tools.htmlRgba( mark, this.bgAlpha );
        s[ 1 ].background = titleColor;

        

        this.line = this.dom( 'div', 'position:absolute; left:0; top:2px; bottom:2px; width:' + this.borderCC + 'px; background:' + mark + '; pointer-events:none; z-index:10;' );
        this.c[ 0 ].appendChild( this.line );
        
    }

    /*setBG ( bg ) {

        const cc = this.colors
        const s = this.s

        if( bg !== undefined ) cc.groups = bg
        if(cc.groups === 'none') cc.groups = cc.background
        //    cc.background = 'none'

        s[0].background = 'none'//bg !== undefined ? 'none' : cc.content;
        s[1].background = cc.groups//bg !== undefined ? cc.groups : cc.content;
        //s[2].background = bg !== undefined ? cc.groups : cc.content

        //s[0].background = '#FF0';
        //s[4].background = '#FF0';
        //s[2].background = cc.background

        if( cc.gborder !== 'none' ){
            s[1].border = cc.borderSize+'px solid '+ cc.gborder
        }

        if( this.radius !== 0 ){

            s[1].borderRadius = this.radius+'px'
            s[2].borderRadius = this.radius+'px'

        }

        /*let i = this.uis.length;
        while(i--){
            this.uis[i].setBG( 'none' );
            //this.uis[i].setBG( this.colors.background );
        }*/

    //}

    testZone ( e ) {

        //console.log( this.local)

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let name = '';

        if( l.y < this.baseH + this.margin ) name = 'title';
        else {
            if( this.isOpen ) name = 'content';
        }

        return name;

    }

    clearTarget () {

        if( this.current === -1 ) return false;
        let changed = false;
        if( this.proto.s ){
            if ( this.proto.uiout() ) changed = true;
            if ( this.proto.reset() ) changed = true;
        }
        this.proto = null;
        this.current = -1;
        this.cursor();
        return changed

    }

    reset () {

        return this.clearTarget()

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent ( e ) {

        let type = e.type;
        let change = false;
        let protoChange = false;

        let name = this.testZone( e );
        if ( !name ) return false;

        switch ( name ) {

            case 'content':

                this.cursor();

                if ( Roots.isMobile && type === 'mousedown' ) {
                    if ( this.getNext( e ) ) change = true;
                }

                if ( this.proto ) {
                    protoChange = this.proto.handleEvent( e );
                }

                if ( !Roots.lock ) {
                    if ( this.getNext( e ) ) change = true;
                }

            break;

            case 'title':

                if ( this.clearTarget() ) change = true;
                this.cursor( 'pointer' );
                if ( type === 'mousedown' ) {
                    if ( this.isOpen ) this.close();
                    else this.open();
                    if ( !this.isUI ) change = true;
                }

            break;

        }

        if ( protoChange ) change = true;
        return change;

    }

    getNext ( e ) {

        let next = Roots.findTarget( this.uis, e );
        let change = false;

        if ( next !== this.current ) {
            if ( this.clearTarget() ) change = true;
            this.current = next;

            if ( next !== -1 ) {
                this.proto = this.uis[ this.current ];
                if ( this.proto.uiover() ) change = true;
            }
        }

        return change;

    }

    /*handleEvent ( e ) {

        let type = e.type;

        let change = false;
        let protoChange = false;

        let name = this.testZone( e );

        if( !name ) return;

        switch( name ){

            case 'content':



            this.cursor()

            //if( this.marginDiv ) e.clientY -= this.margin * 0.5

            if( Roots.isMobile && type === 'mousedown' ) this.getNext( e, change )

            if( this.proto ){ 
                //e.clientY -= this.margin
                protoChange = this.proto.handleEvent( e )
            }

            if( !Roots.lock ) this.getNext( e, change )

            break;
            case 'title':
            //this.cursor( this.isOpen ? 'n-resize':'s-resize' );
            this.cursor('pointer')
            if( type === 'mousedown' ){
                if( this.isOpen ) this.close()
                else this.open()
            }
            break;


        }

        if( this.isDown ) change = true;
        if( protoChange ) change = true;

        return change;

    }

    getNext ( e, change ) {

        let next = Roots.findTarget( this.uis, e );



        if( next !== this.current ){
            this.clearTarget();
            this.current = next;
            change = true;
        }

        if( next !== -1 ){ 
            this.proto  = this.uis[ this.current ];
            this.proto.uiover();
        }

    }*/

    // ----------------------

    

    add() {

        let a = arguments;

        if( typeof a[1] === 'object' ){ 
            a[1].isUI = this.isUI;
            a[1].target = this.c[2];
            a[1].main = this.main;
            a[1].group = this;
        } else if( typeof arguments[1] === 'string' ){
            if( a[2] === undefined ) [].push.call( a, { isUI:true, target:this.c[2], main:this.main, group:this });
            else { 
                a[2].isUI = true;
                a[2].target = this.c[2];
                a[2].main = this.main;
                a[2].group = this;
            }
        }

        let u = this.ADD.apply( this, a );

        if( u.isGroup ){ 
            //o.add = add;
            u.dx = 8;
        }

        /*if ( !u.isGroup && u.s[1] ) {
            u.s[1].background = 'none';
        }*/
        
        //u.dx += 4
        //console.log(this.decal)
        //u.zone.d -= 8
        Roots.forceZone = true;
        //u.margin += this.margin

        //console.log( u.margin )
        //Roots.needReZone = true

        //Roots.resize()
         //console.log(Roots.needResize)

        this.uis.push( u );

        this.isEmpty = false;

        return u;

    }

    // remove one node

    remove ( n ) {

        if( n.dispose ) n.dispose();

    }

    // clear all iner 

    dispose() {

        this.clear();
        if( this.isUI ) this.main.calc();
        super.dispose();

    }

    clear() {

        this.empty();

    }

    empty () {

        this.close();
        while ( this.uis.length ) {
            this.uis[ this.uis.length - 1 ].dispose();
        }
        this.isEmpty = true;
        this.h = this.baseH;

        /*this.close();

        let i = this.uis.length, item;

        while( i-- ){
            item = this.uis.pop()
            this.c[2].removeChild( item.c[0] )
            item.clear( true )

            //this.uis[i].clear()
        }

        this.isEmpty = true;
        this.h = this.baseH;*/

    }

    // clear one element

    clearOne ( n ) { 

        let id = this.uis.indexOf( n );

        if ( id !== -1 ) {
            this.calc( - ( this.uis[ id ].h + this.margin ) );
            this.c[2].removeChild( this.uis[ id ].c[0] );
            this.uis.splice( id, 1 );

            if( this.uis.length === 0 ){ 
                this.isEmpty = true;
                this.close();
            }
        }

    }

    

    open () {

        super.open();

        this.setSvg( this.c[3], 'd', this.svgs.g2 );
        this.rSizeContent();

        const s = this.s;
        const cc = this.colors;

        s[2].top = (this.h+this.mtop) + 'px';

        /*if(this.radius){

            s[1].borderRadius = '0px'
            s[2].borderRadius = '0px'

            s[1].borderTopLeftRadius = this.radius+'px'
            s[1].borderTopRightRadius = this.radius+'px'
            s[2].borderBottomLeftRadius = this.radius+'px'
            s[2].borderBottomRightRadius = this.radius+'px'
        }*/

        if( cc.gborder !== 'none' ){

            s[2].border = cc.borderSize+'px solid '+ cc.gborder;
            s[2].borderTop = 'none';
            s[1].borderBottom = cc.borderSize+'px solid rgba(0,0,0,0)';

        }

        
        
        if ( !this.isUI ) Roots.getZone( this );
        this.zone.w = this.w - this.decal;
        this.calcUis();
        this.parentHeight( this.h - this.baseH );

        Roots.needReZone = true;

        //Roots.isLeave = true
        //Roots.needResize = true

    }

    close () {

        super.close();

        let t = this.h - this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.g1 );

        this.h = this.baseH;
        this.zone.h = this.h;

        const s = this.s;
        const cc = this.colors;
        
        s[0].height = this.h + 'px';
        s[2].top = ( this.h + this.mtop ) + 'px';

        if( cc.gborder !== 'none' ){
            s[2].border = 'none';
            s[1].border = cc.borderSize+'px solid '+ cc.gborder;
        }

        

        //if(this.radius) s[1].borderRadius = this.radius+'px'

        this.parentHeight(-t);

        Roots.needReZone = true;

    }

    calcUis () {

        if( !this.isOpen || this.isEmpty ) this.h = this.baseH;
        else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH + this.margin, true ) + this.baseH;
        //else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH, true ) + this.baseH;
        //else this.h = Roots.calcUis( [...this.uis ], this.zone, this.zone.y + this.baseH + this.margin, true ) + this.baseH
       // else this.h = Roots.calcUis( [...this.uis, this.spaceY ], this.zone, this.zone.y + this.baseH + this.margin, true ) + this.baseH

        this.s[0].height = this.h + 'px';
        this.s[2].height = ( this.h - this.baseH ) + 'px';
        this.zone.h = this.h;

    }

    parentHeight ( t ) {


        if ( this.group !== null ) this.group.calc( t );
        else if ( this.isUI ) this.main.calc( t );

    }

    calc ( y ) {

        if ( !this.isOpen ) return;
        if ( y !== undefined ) {
            this.h += y;
            this.parentHeight( y );
        } else {
            this.calcUis();
        }
        this.s[0].height = this.h + 'px';
        this.s[2].height = ( this.h - this.baseH ) + 'px';
        this.zone.h = this.h;

    }

    /*calc ( y ) {

        if( !this.isOpen ) return
        if( this.isUI ) this.main.calc()
        else this.calcUis()

        this.s[0].height = this.h + 'px'
        this.s[2].height = this.h + 'px'

    }*/

    

    rSize () {

        //return

        super.rSize();

        let s = this.s;
        let w = this.w - this.decal;
        const oldH = this.h;

        s[3].left = ( this.sa + this.sb - 6 ) + 'px';

        s[1].width = w + 'px';
        s[2].width = w + 'px';
        s[1].left = this.decal + 'px';
        s[2].left = this.decal + 'px';

        this.zone.w = w;

        if ( this.isOpen ) {
            this.rSizeContent( w );
            this.calcUis();
        }

        if ( this.line ) this.line.style.left = this.decal + 'px';

        if ( this.h !== oldH ) this.parentHeight( this.h - oldH );
        Roots.needReZone = true;

        //if ( this.isUI && !this.group ) this.main.calc();
        //Roots.needReZone = true;

        //if( this.isOpen ) this.rSizeContent()

    }

    rSizeContent ( w = this.w - this.decal ) {

        let i = this.uis.length;
        while(i--){
            this.uis[i].setSize( w );
            this.uis[i].rSize();
        }

    }

    //
/*
    uiout() {

        if( this.lock ) return;
        if(!this.overEffect) return;
        if(this.s) this.s[0].background = this.colors.background;

    }

    uiover() {

        if( this.lock ) return;
        if(!this.overEffect) return;
        //if( this.isOpen ) return;
        if(this.s) this.s[0].background = this.colors.backgroundOver;

    }
*/
}

class Joystick extends Proto {

    constructor( o = {} ) {

        super( o );

        this.autoWidth = false;

        this.value = [0,0];

        this.minw  = this.w;
        this.diam = o.diam || this.w; 

        this.joyType = 'analogique';
        this.model = o.mode !== undefined ? o.mode : 0;

        this.precision = o.precision !== undefined ? o.precision : 2;
        this.isDown = false;
        this.cmode = -1;

        this.multiplicator = o.multiplicator || 1;

        this.pos = new V2();
        this.tmp = new V2();

        this.interval = null;
        this.c[0].style.display = 'block';
        this.haveText = o.text !== undefined ? o.text : true; 
        this.distance = (this.diam*0.5)*0.25;

        this.h = o.h || this.w + (this.haveText ? 10 : 0);

        this.c[0].style.width = this.w +'px';

        if( this.c[1] !== undefined ) { // with title

            this.c[1].style.width = '100%';
            this.c[1].style.justifyContent = 'center';
            this.top = 10;
            this.h += 10;

        }

        let cc = this.colors;

        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+(this.h-20)+'px; width:100%; color:'+ cc.text );
        this.c[2].textContent = this.haveText ? this.value : '';

        this.c[3] = this.getJoystick( this.model );
        //this.setSvg( this.c[3], 'viewBox', '0 0 '+this.diam+' '+this.diam );
        //this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top });

        this.setSvg( this.c[3], 'viewBox', '0 0 128 128' );
        this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top } );
        this.ratio = 128 / this.diam;

        this.mode(0);


        //this.ratio = 128/this.w;

        this.init();

        this.update(false);
        
    }

    mode ( mode ) {

        if ( this.cmode === mode ) return false;
        this.cmode = mode;

        let cc = this.colors;

        switch ( mode ) {
            case 0: // base
                if ( this.model === 0 ) {
                    this.setSvg( this.c[3], 'fill', 'url(#gradIn)', 4 );
                    this.setSvg( this.c[3], 'stroke', '#000', 4 );
                } else {
                    this.setSvg( this.c[3], 'stroke', cc.joyOut, 2 );
                    this.setSvg( this.c[3], 'stroke', cc.joyOut, 4 );
                    this.setSvg( this.c[3], 'fill', 'none', 4 );
                }
            break;
            case 1: // over
                if ( this.model === 0 ) {
                    this.setSvg( this.c[3], 'fill', 'url(#gradIn2)', 4 );
                    this.setSvg( this.c[3], 'stroke', 'rgba(0,0,0,0)', 4 );
                } else {
                    this.setSvg( this.c[3], 'stroke', cc.joyOver, 2 );
                    this.setSvg( this.c[3], 'stroke', cc.joySelect, 4 );
                    this.setSvg( this.c[3], 'fill', cc.joyOver, 4 );
                }
            break;
        }

        return true;

    }

    /*mode ( mode ) {

        let cc = this.colors

        switch(mode){
            case 0: // base
                if(this.model===0){
                    this.setSvg( this.c[3], 'fill', 'url(#gradIn)', 4 );
                    this.setSvg( this.c[3], 'stroke', '#000', 4 );
                } else {
                    this.setSvg( this.c[3], 'stroke', cc.joyOut, 2 );
                    //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.1)', 3 );
                    this.setSvg( this.c[3], 'stroke', cc.joyOut, 4 );
                    this.setSvg( this.c[3], 'fill', 'none', 4 );
                }
                
            break;
            case 1: // over
                if(this.model===0){
                    this.setSvg( this.c[3], 'fill', 'url(#gradIn2)', 4 );
                    this.setSvg( this.c[3], 'stroke', 'rgba(0,0,0,0)', 4 );
                } else {
                    this.setSvg( this.c[3], 'stroke', cc.joyOver, 2 );
                    //this.setSvg( this.c[3], 'stroke', 'rgb(0,0,0,0.3)', 3 );
                    this.setSvg( this.c[3], 'stroke', cc.joySelect, 4 );
                    this.setSvg( this.c[3], 'fill', cc.joyOver, 4 );
                }
            break;
            case 2: // edit
            break;

        }
    }*/

    // ----------------------
    //   EVENTS
    // ----------------------

    addInterval (){
        if( this.interval !== null ) this.stopInterval();
        if( this.pos.isZero() ) return;
        this.interval = setInterval( () => this.update(), 10 );

    }

    stopInterval (){

        if( this.interval === null ) return;
        clearInterval( this.interval );
        this.interval = null;

    }

    reset () {

        this.isDown = false;
        this.addInterval();
        this.cursor();
        return this.mode( 0 );

    }

    mouseup ( e ) {

        if ( this.isDown ) {
            this.isDown = false;
            this.addInterval();
            this.sendEnd();
            return this.mousemove( e );
        }
        return false;
    
    }

    mousedown ( e ) {

        this.isDown = true;
        this.mousemove( e );
        this.mode( 2 );

    }

    mousemove ( e ) {

        let nup = this.mode( 1 );
        this.cursor( this.isDown ? 'move' : 'pointer' );

        if ( !this.isDown ) return nup;

        this.tmp.x = ( this.w * 0.5 ) - ( e.clientX - this.zone.x );
        this.tmp.y = ( this.diam * 0.5 ) - ( e.clientY - this.zone.y - this.ytop );

        let distance = this.tmp.length();

        if ( distance > this.distance ) {
            let angle = Math.atan2( this.tmp.x, this.tmp.y );
            this.tmp.x = Math.sin( angle ) * this.distance;
            this.tmp.y = Math.cos( angle ) * this.distance;
        }

        let ox = this.pos.x;
        let oy = this.pos.y;

        this.pos.copy( this.tmp ).divideScalar( this.distance ).negate();
        if ( this.pos.x !== ox || this.pos.y !== oy ) {
            this.update();
            return true;
        }

        return nup;

    }

    /*mousemove ( e ) {

        let nup = this.mode( 1 );
        this.cursor( this.isDown ? 'move' : 'pointer' );

        if ( !this.isDown ) return nup;

        this.tmp.x = ( this.w * 0.5 ) - ( e.clientX - this.zone.x );
        this.tmp.y = ( this.diam * 0.5 ) - ( e.clientY - this.zone.y - this.ytop );

        let distance = this.tmp.length();

        if ( distance > this.distance ) {
            let angle = Math.atan2( this.tmp.x, this.tmp.y );
            this.tmp.x = Math.sin( angle ) * this.distance;
            this.tmp.y = Math.cos( angle ) * this.distance;
        }

        this.pos.copy( this.tmp ).divideScalar( this.distance ).negate();
        if ( this.pos.x !== ox || this.pos.y !== oy ) {
            this.update();
            return true;
        }

        return nup;

    }*/

    setValue ( v ) {

        if(v===undefined) v=[0,0];

        this.pos.set( v[0] || 0, v[1]  || 0 );
        this.updateSVG();

    }

    update ( up ) {

        if( up === undefined ) up = true;

        if( this.interval !== null ){

            if( !this.isDown ){

                this.pos.lerp( null, 0.3 );

                this.pos.x = Math.abs( this.pos.x ) < 0.01 ? 0 : this.pos.x;
                this.pos.y = Math.abs( this.pos.y ) < 0.01 ? 0 : this.pos.y;

                if( this.isUI && this.main.isCanvas ) this.main.draw();

            }

        }

        this.updateSVG();

        if( up ) this.send();
        

        if( this.pos.isZero() ) this.stopInterval();

    }

    updateSVG () {

        let x = (this.diam*0.5) - ( -this.pos.x * this.distance );
        let y = (this.diam*0.5) - ( -this.pos.y * this.distance );

        if(this.model === 0){

            let sx = x + ((this.pos.x)*5) + 5;
            let sy = y + ((this.pos.y)*5) + 10;

            this.setSvg( this.c[3], 'cx', sx*this.ratio, 3 );
            this.setSvg( this.c[3], 'cy', sy*this.ratio, 3 );
        } else {
            this.setSvg( this.c[3], 'cx', x*this.ratio, 3 );
            this.setSvg( this.c[3], 'cy', y*this.ratio, 3 );
        }

        

        this.setSvg( this.c[3], 'cx', x*this.ratio, 4 );
        this.setSvg( this.c[3], 'cy', y*this.ratio, 4 );

        this.value[0] =  ( this.pos.x * this.multiplicator ).toFixed( this.precision ) * 1;
        this.value[1] =  ( this.pos.y * this.multiplicator ).toFixed( this.precision ) * 1;

        if(this.haveText) this.c[2].textContent = this.value;

    }

    clear () {
        
        this.stopInterval();
        super.clear();

    }

    dispose(){

        this.stopInterval();
        super.dispose();
        this.clear();
        
    }

    rSize () {

        super.rSize();
        let x = Math.floor( ( this.w - this.diam ) * 0.5 );
        this.s[3].left = x + 'px';

    }

}

class Knob extends Proto {

    constructor( o = {} ) {

        super( o );

        this.isKnob = true;

        this.isCyclic = o.cyclic || false;
        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;

        this.autoWidth = false;

        this.setTypeNumber( o );

        this.minw  = this.w;
        this.diam = o.diam || this.w; 

        this.limiteRange = o.limit || false;

        this.mPI = Math.PI * 0.8;
        this.toDeg = 180 / Math.PI;
        this.cirRange = this.mPI * 2;

        this.offset = new V2();

        this.h = o.h || this.w + 10;

        this.c[0].style.width = this.w +'px';
        this.c[0].style.display = 'block';

        this.top = 0;
        this.isDown = false;


        if(this.c[1] !== undefined) {

            this.c[1].style.width = '100%';
            this.c[1].style.justifyContent = 'center';
            this.top = 14;
            this.h += 14;

        }

        this.percent = 0;

        this.cmode = 0;
        let cc = this.colors;

        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+(this.h-16)+'px; width:100%; color:'+ cc.text );

        this.c[3] = this.getKnob();
        this.setSvg( this.c[3], 'fill', cc.button, 0 );
        this.setSvg( this.c[3], 'stroke', cc.text, 2 );
        this.setSvg( this.c[3], 'stroke', cc.text, 4 );
        this.setSvg( this.c[3], 'd', this.makeGrad(), 4 );
        
        this.setSvg( this.c[3], 'viewBox', '0 0 128 128' );
        this.setCss( this.c[3], { width:this.diam, height:this.diam, left:0, top:this.top });

        if ( this.model > 0 ) {

            Tools.dom( 'path', '', { d: '', stroke:cc.text, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, this.c[3] ); //4

            if ( this.model == 2) {
            
                Tools.addSVGGlowEffect();
                this.setSvg( this.c[3], 'style', 'filter: url("#UILGlow");', 5 );
            
            }

        }

        if ( this.model > 0 ) {

            this.colors01 = Tools.unpack( Tools.ColorLuma( cc.text, -0.75) );
            this.colors02 = Tools.unpack( cc.text );
            
        }

        this.r = 0;

        this.init();


        this.update();

    }

    mode ( mode ) {

        let cc = this.colors;

        if( this.cmode === mode ) return false;

        switch( mode ) {
            case 0: // base
                this.s[2].color = cc.text;
                this.setSvg( this.c[3], 'fill', cc.button, 0);
                //this.setSvg( this.c[3], 'stroke','rgba(255,0,0,0.2)', 2);
                this.setSvg( this.c[3], 'stroke', cc.text, 2 );
            break;
            case 1: // down
                this.s[2].color = cc.textOver;
                this.setSvg( this.c[3], 'fill', cc.select, 0);
                //this.setSvg( this.c[3], 'stroke','rgba(0,0,0,0.6)', 2);
                this.setSvg( this.c[3], 'stroke', cc.textOver, 2 );
            break;
        }

        this.cmode = mode;
        return true;

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( this.c[1] && l.y <= this.c[1].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[2].offsetHeight ) return 'text';
        else return 'knob'; 

        /*let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.y <= this.c[ 1 ].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
        else return 'knob';*/

    }

    reset () {

        this.isDown = false;
        this.cursor();
        return this.mode(0);
        
    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        if ( this.isDown ) this.sendEnd();
        this.isDown = false;
        return this.mode(0)

    }

    mousedown ( e ) {

        this.isDown = true;
        this.old = this.value;
        this.oldr = null;
        this.mousemove( e );
        return this.mode(1)

    }

    mousemove ( e ) {

        if ( !this.isDown ) {
            let name = this.testZone( e );
            if ( name === 'circular' || name === 'knob' ) {
                this.cursor('pointer');
                return this.mode(1);
            }
            return this.reset();
        }

        this.cursor('pointer');

        let off = this.offset;
        off.x = ( this.w * 0.5 ) - ( e.clientX - this.zone.x );
        off.y = ( this.diam * 0.5 ) - ( e.clientY - this.zone.y - this.ytop );

        this.r = -Math.atan2( off.x, off.y );

        if ( this.oldr !== null ) this.r = Math.abs( this.r - this.oldr ) > Math.PI ? this.oldr : this.r;

        this.r = this.r > this.mPI ? this.mPI : this.r;
        this.r = this.r < -this.mPI ? -this.mPI : this.r;

        let value = ( this.r + this.mPI ) / this.cirRange;
        let n = Math.trunc( ( ( ( this.range * value ) + this.min ) - this.old ) / this.step );

        if ( n !== 0 ) {
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
            this.oldr = this.r;
            return true;
        }

        return false;

    }

    wheel ( e ) {

        let name = this.testZone( e );

        if( name === 'knob' ) {
    
            let v = this.value - this.step * e.delta;
    
            if ( v > this.max ) {
                v = this.isCyclic ? this.min : this.max;
            } else if ( v < this.min ) {
                v = this.isCyclic ? this.max : this.min;
            }
    
            this.setValue( v );
            this.old = v;
            this.update( true );

            return true;
    
        }
        return false;

    }

    makeGrad () {

        let d = '', step, range, a, x, y, x2, y2, r = 64;
        let startangle = Math.PI + this.mPI;
        let endangle = Math.PI - this.mPI;
        //let step = this.step>5 ? this.step : 1;

        if(this.step>5 || this.limiteRange){
            range = this.range / this.step;
            step = ( startangle - endangle ) / range;
        } else {
            step = (( startangle - endangle ) / r)*2;
            range = r*0.5;
        }

        for ( let i = 0; i <= range; ++i ) {

            a = startangle - ( step * i );
            x = r + Math.sin( a ) * ( r - 20 );
            y = r + Math.cos( a ) * ( r - 20 );
            x2 = r + Math.sin( a ) * ( r - 24 );
            y2 = r + Math.cos( a ) * ( r - 24 );
            d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

        }

        return d;

    }

    update ( up ) {

        this.c[2].textContent = this.value;
        this.percent = (this.value - this.min) / this.range;

        let sa = Math.PI + this.mPI;
        let ea = ( ( this.percent * this.cirRange ) - ( this.mPI ) );

        let sin = Math.sin( ea );
        let cos = Math.cos( ea );

        let x1 = ( 25 * sin ) + 64;
        let y1 = -( 25 * cos ) + 64;
        let x2 = ( 20 * sin ) + 64;
        let y2 = -( 20 * cos ) + 64;

        this.setSvg( this.c[3], 'd', 'M ' + x1 +' ' + y1 + ' L ' + x2 +' ' + y2, 2 );
        
        if ( this.model > 0 ) {

            let x1 = 36 * Math.sin( sa ) + 64;
            let y1 = 36 * Math.cos( sa ) + 64;
            let x2 = 36 * sin + 64;
            let y2 = -36 * cos + 64;
            //let big = ea <= Math.PI - this.mPI ? 0 : 1;
            let big = ( this.percent * this.cirRange ) > Math.PI ? 1 : 0;
            this.setSvg( this.c[3], 'd', 'M ' + x1 + ',' + y1 + ' A ' + 36 + ',' + 36 + ' 1 ' + big + ' 1 ' + x2 + ',' + y2, 5 );

            let color = Tools.pack( Tools.lerpColor( this.colors01, this.colors02, this.percent ) );
            this.setSvg( this.c[3], 'stroke', color, 5 );
        
        }

        if( up ) this.send();
        
    }

    /*rSize () {

        super.rSize();
        this.s[3].left = Math.floor( ( this.w - this.diam ) * 0.5 ) + 'px';

    }*/

}

class List extends Proto {

    constructor( o = {} ) {

        super( o );

        // TODO not work
        this.hideCurrent = false;

        // images
        this.path = o.path || '';
        this.format = o.format || '';
        

        this.isWithImage = this.path !== '' ? true:false;
        this.preLoadComplete = false;

        this.tmpImage = {};
        this.tmpUrl = [];

        this.openItem = o.openItem || 5;

        this.m = o.m !== undefined ? o.m : 5;


        let align = o.align || 'left';

        // scroll size
        let ss = o.scrollSize || 10;
        this.ss = ss+1;

        this.sMode = 0;
        this.tMode = 0;

        this.listOnly = o.listOnly || false;
        this.staticTop = o.staticTop || false;

        this.isSelectable = this.listOnly;
        if( o.select !== undefined ) o.selectable = o.select;
        if( o.selectable !== undefined ) this.isSelectable = o.selectable;

        if( this.txt === '' ) this.p = 0;

        this.targetPy = 0;
        this.lastWheelTime = 0;
        this.wheelSpeed = 1;


        let fltop = Math.floor(this.h*0.5)-3;
        let cc = this.colors;

        this.c[2] = this.dom( 'div', this.css.basic + 'top:0; display:none; border-radius:'+this.radius+';' );
        this.c[3] = this.dom( 'div', this.css.item + 'padding:0px '+this.m+'px; margin-bottom:0px; position:absolute; justify-content:'+align+'; text-align:'+align+'; line-height:'+(this.h-4)+'px; top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:1px solid '+cc.border+'; border-radius:'+this.radius+';' );
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; top:'+fltop+'px;', { d:this.svgs.g1, fill:cc.text, stroke:'none'});

        this.scrollerBack = this.dom( 'div', this.css.basic + 'right:0px; width:'+ss+'px; background:'+cc.back+'; display:none;');
        //this.scroller = this.dom( 'div', this.css.basic + 'right:'+((ss-(ss*0.25))*0.5)+'px; width:'+(ss*0.25)+'px; background:'+cc.text+'; display:none; ');
        this.scroller = this.dom( 'div', this.css.basic + 'right:'+(2)+'px; width:'+(ss-4)+'px; background:'+cc.text+'; display:none;  transition: transform 0.2s ease-out;');


        this.c[3].style.color = cc.text;


        this.list = [];
        this.refObject = null;

        if( o.list ){
            if( o.list instanceof Array ){
                this.list = o.list;
            } else if( o.list instanceof Object ){
                this.refObject = o.list;
                for( let g in this.refObject ) this.list.push( g );
            }
        }

        this.items = [];

        this.prevName = '';

        this.tmpId = 0;

        this.baseH = this.h;

        this.itemHeight = o.itemHeight || this.h;//(this.h-3);

        // force full list 
        this.full = o.full || false;

        this.py = 0;
        this.ww = this.sb;
        this.scroll = false;
        this.isDown = false;

        this.current = null;

        // list up or down
        this.side = o.side || 'down';
        this.up = this.side === 'down' ? 0 : 1;

        if( this.up ){

            this.c[2].style.top = 'auto';
            this.c[3].style.top = 'auto';
            this.c[4].style.top = 'auto';

            this.c[2].style.bottom = this.h-2 + 'px';
            this.c[3].style.bottom = '1px';
            this.c[4].style.bottom = fltop + 'px';

        } else {
            this.c[2].style.top = this.baseH + 'px';
        }

        this.listIn = this.dom( 'div', this.css.basic + 'left:0; top:0; width:100%; background:none; will-change: transform; transition: transform 0.2s ease-out;');
        this.listIn.name = 'list';

        this.topList = 0;
        
        this.c[2].appendChild( this.listIn );
        this.c[2].appendChild( this.scrollerBack );
        this.c[2].appendChild( this.scroller );

        if( o.value !== undefined ){

            if(this.refObject){
                let ccc = null;
                for( let g in this.refObject ){ if(this.refObject[g] === o.value ) ccc = g; }
                if(ccc) this.value = this.list[ this.list.indexOf(ccc) ];
            } else {
                if(!isNaN(o.value)) this.value = this.list[ o.value ];
                else this.value = o.value;
            }
            
        }else {
            this.value = this.list[0];
        }



        this.isOpenOnStart = o.open || false;

        if( this.listOnly ){
            this.baseH = 5;
            this.c[3].style.display = 'none';
            this.c[4].style.display = 'none';
            this.c[2].style.top = this.baseH+'px';
            this.isOpenOnStart = true;
        }

        this.miniIcon = o.miniIcon || false; 
        this.emojii = o.emojii || [];
        this.extraSpace = o.extraSpace || 5;

        //if(this.miniIcon) this.m += this.itemHeight


        this.miniCanvas = o.miniCanvas || false; 
        this.canvasBg = o.canvasBg || 'rgba(0,0,0,0)';
        this.imageSize = o.imageSize || [20,20];

        // dragout function
        this.drag = o.drag || false;
        this.dragout = o.dragout || false;
        this.dragstart = o.dragstart || null;
        this.dragend = o.dragend || null;

        

        //this.c[0].style.background = '#FF0000'
        ///if( this.isWithImage ) this.preloadImage();
            
        this.setList( this.list );
        this.init();
        if( this.isWithImage ) this.preloadImage();
        if( this.isOpenOnStart ) this.open( true );

        this.baseH += this.mtop;

    }

    // image list

    preloadImage () {

        this.preLoadComplete = false;

        this.tmpImage = {};
        for( let i=0; i<this.list.length; i++ ) this.tmpUrl.push( this.list[i] );
        this.loadOne();
        
    }

    nextImg () {

        if(this.c === null) return

        this.tmpUrl.shift();
        if( this.tmpUrl.length === 0 ){ 

            this.preLoadComplete = true;

            this.addImages();
            /*this.setList( this.list );
            this.init();
            if( this.isOpenOnStart ) this.open();*/

        }
        else this.loadOne();

    }

    loadOne(){

        let self = this;
        let name = this.tmpUrl[0];
        let img = document.createElement('img');
        img.style.cssText = 'position:absolute; width:'+self.imageSize[0]+'px; height:'+self.imageSize[1]+'px';
        img.setAttribute('src', this.path + name + this.format );

        img.addEventListener('load', function() {

            self.imageSize[2] = img.width;
            self.imageSize[3] = img.height;
            self.tmpImage[name] = img;
            self.nextImg();

        });

    }

    //

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        if( this.up && this.isOpen ){
            if( l.y > this.h - this.baseH ) return 'title';
            else {
                if( this.scroll && ( l.x > (this.sa+this.sb-this.ss)) ) return 'scroll';
                if(l.x > this.sa) return this.testItems( l.y-this.baseH );
            }

        } else {
            if( l.y < this.baseH+2 ) return 'title';
            else {
                if( this.isOpen ){
                    if( this.scroll && ( l.x > (this.sa+this.sb-this.ss)) ) return 'scroll';
                    if(l.x > this.sa) return this.testItems( l.y-this.baseH );
                }
            }

        }

        return '';

    }

    getVisualTop () {

        if( !this.scroll ) return 0;

        // Récupère le transform calculé par le navigateur (ex: "matrix(1, 0, 0, 1, 0, -45.5)")
        let transform = window.getComputedStyle( this.listIn ).transform;
        
        if( transform && transform !== 'none' ){
            let matrix = new DOMMatrix( transform );
            return matrix.m42; // m42 est la translation Y actuelle en pixels
        }

        return this.topList;

    }

    testItems ( y ) {

        const pos = y - this.topList;
        const id = Math.floor( pos / (this.itemHeight + 1) );

        if ( id >= 0 && id < this.items.length ) {
            const item = this.items[id];
            if ( this.current !== item ) {
                this.modeItem(0);
                this.current = item;
                this.modeItem(1);
            }
            return 'item' + id;
        }
        return '';

    }

    /*testItems ( y ) {

        let name = '';
        let items = this.items

        // Position visuelle exacte, même en plein milieu de la transition CSS
        let currentTop = this.getVisualTop();

        let i = items.length, item, a, b;
        while(i--){

            item = items[i];
            a = item.posy + currentTop//this.topList;
            b = item.posy + this.itemHeight + 1 + currentTop//this.topList;

            if( y >= a && y <= b ){ 
                name = 'item' + i;
                this.modeItem(0)
                this.current = item;
                this.modeItem(1)
                return name;
            }

        }

        return name;

    }*/

    modeItem ( mode ) {

        if( !this.current ) return

        if( this.current.select && mode===0) mode = 2;
        let cc = this.colors;

        switch( mode ){

            case 0: // base
                this.current.style.background = cc.back;
                this.current.style.color = cc.text;
            break;
            case 1: // over
                this.current.style.background = cc.over;
                this.current.style.color = cc.textOver;
            break;
            case 2: // edit / down
                this.current.style.background = cc.select;
                this.current.style.color = cc.textSelect;
            break;

        }
    }

    unSelected() {

        if( !this.current ) return
        this.modeItem(0);
        this.current = null;

    }

    selected() {

        if( !this.current ) return
        this.resetItems();
        this.modeItem(2);
        this.current.select = true;

    }

    resetItems() {

        let i = this.items.length;
        while(i--){
            this.items[i].select = false;
            this.items[i].style.background = this.colors.back;
            this.items[i].style.color = this.colors.text;
        }

    }

    hideActive() {

        if( !this.hideCurrent ) return
        //if( !this.current ) return
        if( this.current ) this.tmpId = this.current.id;
        this.resetHide();
        //this.items[this.tmpId].style.height = 0+'px'
        
    }

    resetHide() {

        console.log(this.tmpId);

        let i = this.items.length;
        while(i--){
            if(i===this.tmpId){
                this.items[i].style.height = 0+'px';
                this.items[i].posy = -1;
            } else {
                this.items[i].style.height = this.itemHeight+'px';
                this.items[i].posy = (this.itemHeight+1)*(i-1);
            }
            //this.items[i].style.display = 'flex'
            
            /*this.items[i].select = false
            this.items[i].style.background = this.colors.back;
            this.items[i].style.color = this.colors.text;*/
        }

    }

    // ----------------------
    //   EVENTS
    // ----------------------


    mouseup ( e ) {

        if( this.isDown ){
            this.listIn.style.transition = 'transform 0.2s ease-out';
            this.scroller.style.transition = 'transform 0.2s ease-out';
        }

        this.isDown = false;

    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false;

        //this.scroll = false

        if( name === 'scroll' ){

            this.isDown = true;
            this.listIn.style.transition = 'none';
            this.scroller.style.transition = 'none';
            this.mousemove( e );

        } else if( name === 'title' ){

            this.modeTitle(2);
            if( !this.listOnly ){
                this.hideActive();
                if( !this.isOpen ) this.open();
                else this.close();
            }
        } else {
            // is item
            if( this.current ){

                this.value = this.list[ this.current.id ];
                //this.tmpId = this.current.id

                if( this.isSelectable ) this.selected();

                //this.send( this.refObject !== null ? this.refObject[ this.list[this.current.id]] : this.value );
                this.send( this.value );

                if( !this.listOnly ) {
                    this.close();
                    this.setTopItem();
                    //this.hideActive()
                }
            }
            
        }

        return true;

    }

    mousemove ( e ) {

        let nup = false;
        let name = this.testZone( e );

        if( !name ) return nup;

        if( name === 'title' ){
            this.unSelected();
            this.modeTitle(1);
            this.cursor('pointer');

        } else if( name === 'scroll' ){

            this.cursor('s-resize');
            this.modeScroll(1);
            if( this.isDown ){
                this.modeScroll(2);
                //this.update( ( e.clientY - top  ) - ( this.sh*0.5 ) );
                let top = this.zone.y+this.baseH-2;
                this.update( ( e.clientY - top  ) - ( this.sh*0.5 ) );
                nup = true;
            }
            //if(this.isDown) this.listmove(e);
        } else {

            // is item
            this.modeTitle(0);
            this.modeScroll(0);
            this.cursor('pointer');
        
        }

        if( name !== this.prevName ) nup = true;
        this.prevName = name;

        return nup;

    }

    wheel ( e ) {

        let name = this.testZone( e );
        if( name === 'title' || !this.scroll ) return false;

        let now = performance.now();
        let dt = now - this.lastWheelTime;
        this.lastWheelTime = now;

        // Accélération progressive si on tourne la molette vite (coups espacés de moins de 120ms)
        if ( dt < 120 ) {
            this.wheelSpeed = Math.min( this.wheelSpeed + 0.5, 4 ); // Plafond à 6x
        } else {
            this.wheelSpeed = 1; // Retour à la vitesse normale
        }

        // Bonus proportionnel à la longueur de la liste (ex: +1 item tous les 40 éléments)
        let listBoost = Math.max( 1, Math.floor( this.length / 50 ) );

        // Calcul du déplacement final
        let itemsToScroll = listBoost * this.wheelSpeed;
        let step = itemsToScroll * ( this.itemHeight + 1 ) * this.ratio;

        this.py += ( e.delta > 0 ? 1 : -1 ) * step;
        this.update( this.py );
        this.testZone( e );

        return true;

    }

    /*wheel ( e ) {

        let name = this.testZone( e );
        if( name === 'title' || !this.scroll ) return false
        //this.py += e.delta*10;
        
        let step = ( this.itemHeight + 1 ) * this.ratio;
        this.py += ( e.delta > 0 ? 1 : -1 ) * step;

        this.update(this.py);
        
        this.testZone( e );

        return true;

    }*/

    // ----------------------

    reset () {

        this.prevName = '';
        this.unSelected();
        this.modeTitle(0);
        this.modeScroll(0);

        //console.log('this is reset')
        
    }

    modeScroll ( mode ) {

        if( mode === this.sMode ) return;

        let s = this.scroller.style;
        let cc = this.colors;

        switch(mode){
            case 0: // base
                s.background = cc.text;
            break;
            case 1: // over
                s.background = cc.select;
            break;
            case 2: // edit / down
                s.background = cc.select;
            break;

        }

        this.sMode = mode;
    }

    modeTitle ( mode ) {

        if( mode === this.tMode ) return;

        let s = this.s;
        let cc = this.colors;

        switch(mode){
            case 0: // base
                s[3].color = cc.text;
                s[3].background = cc.button;
            break;
            case 1: // over
                s[3].color = cc.textOver;
                s[3].background = cc.overoff;
            break;
            case 2: // edit / down
                s[3].color = cc.textSelect;
                s[3].background = cc.overoff;
            break;

        }

        this.tMode = mode;

    }

    clearList () {

        this.listIn.replaceChildren();
        this.items = [];
        this.scroll = false;
        this.ww = this.sb;

        //while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );
        //this.items = [];

    }

    setList ( list ) {

        this.clearList();

        this.list = list;
        this.length = this.list.length;

        let lng = this.hideCurrent? this.length-1 : this.length;

        this.maxItem = this.full ? lng : this.openItem;
        this.maxItem = lng < this.maxItem ? lng : this.maxItem;

        this.maxHeight = this.maxItem * (this.itemHeight+1) + 2;
        
        this.max = lng * (this.itemHeight+1) + 2;
        this.ratio = this.maxHeight / this.max;
        //this.sh = this.maxHeight * this.ratio;
        //this.range = this.maxHeight - this.sh;

        this.sh = Math.max( 20, this.maxHeight * this.ratio );
        this.range = this.maxHeight - this.sh;

        this.c[2].style.height = this.maxHeight + 'px';
        this.scrollerBack.style.height = this.maxHeight + 'px';
        this.scroller.style.height = this.sh + 'px';

        if( this.max > this.maxHeight ){ 
            this.ww = this.sb - this.ss;
            this.scroll = true;
        }

        if( this.miniCanvas ) {

            this.tmpCanvas = document.createElement('canvas');
            this.tmpCanvas.width = this.imageSize[0];
            this.tmpCanvas.height = this.imageSize[1];
            this.tmpCtx = this.tmpCanvas.getContext("2d");
            this.tmpCtx.fillStyle = this.canvasBg;
            this.tmpCtx.fillRect(0, 0, this.imageSize[0], this.imageSize[1]);

        }

        let item, n;//, l = this.sb;
        for( let i=0; i<this.length; i++ ){

            n = this.list[i];
            item = this.dom( 'div', this.css.item + 'padding:0px '+(this.m+1)+'px; width:'+this.ww+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-2)+'px; color:'+this.colors.text+'; background:'+this.colors.back+';' );
            item.name = 'item'+ i;
            item.id = i;
            item.select = false;
            item.posy = (this.itemHeight+1)*i;
            this.listIn.appendChild( item );
            this.items.push( item );

            if( n === this.value ) this.current = item;

            //if( this.isWithImage ) item.appendChild( this.tmpImage[n] );
            if( !this.isWithImage ) item.textContent = n;

            if( this.miniIcon ){



                /*let c = this.dom( 'div', this.css.basic + 'margin-right:4px; width:'+this.itemHeight+'px; height:'+this.itemHeight+'px' );
                c.innerHTML = '◉'
                item.appendChild( c )
                this.tmpImage[n] = c*/



                let t = '';
                let tn = this.extraSpace;
                while(tn--)t += '&nbsp;';

                item.innerHTML =t+n;

                let ic = document.createElement("div");
                ic.style.cssText ='font-size:'+(this.itemHeight-4)+'px; line-height:'+(this.itemHeight-4)+'px; left:0px; top:0px; position:absolute;';
                ic.innerHTML = this.emojii[i] ? this.emojii[i] : '🟢';
                item.appendChild( ic );
                //document.body.appendChild(ic)
                this.tmpImage[n] = ic;

            }

            if( this.miniCanvas ){

                let c = new Image();
                c.src = this.tmpCanvas.toDataURL();

                //item.style.marginLeft = (this.imageSize[0]+8)+'px'


                /*let c = document.createElement('canvas')

                c.width = this.imageSize[0]
                c.height = this.imageSize[1]
                let ctx = c.getContext("2d")
                ctx.fillStyle = this.canvasBg
                ctx.fillRect(0, 0, this.imageSize[0], this.imageSize[1])*/
                
                //c.style.cssText = 'position:relative; pointer-events:none; display:inline-block; float:left; margin-left:0px; margin-right:5px; top:2px'
               // c.style.cssText =' flex-shrink: 0;'

                c.style.cssText ='margin-right:4px;';


                //c.style.cssText = 'display:flex; align-content: flex-start; flex-wrap: wrap;'
                //item.style.float = 'right'
                item.appendChild( c );

                this.tmpImage[n] = c;

            }

            if( this.dragout ){



                item.img = this.tmpImage[n];
                item.name = this.list[i];

                item.style.pointerEvents = 'auto';
                item.draggable = "true";

                item.addEventListener('dragstart', this.dragstart || function(e){ 

                    e.stopPropagation();
                    e.dataTransfer.effectAllowed = 'all';
                    e.dataTransfer.dropEffect = 'move';
                    e.dataTransfer.setData('text/html', this.name );
                    this.img.style.transform = "translateX(-100%)";
                    e.dataTransfer.setDragImage( this.img, this.img.offsetWidth*0.5 , this.img.offsetHeight*0.5 );


                });
                item.addEventListener('drag', this.drag || function(){ /*console.log('drag start')*/});
                //item.addEventListener('dragover', this);
                //item.addEventListener('dragenter', this);
                item.addEventListener('dragleave', function(){ Roots.fakeUp(); } );
                item.addEventListener('dragend', this.dragend || function(){ 
                    this.img.style.transform = "translateX(0)";
                /*console.log('drag end')*/ } );
                //item.addEventListener('drop', function(){console.log('drop')})
                

            }

        }

        this.setTopItem();
        if( this.isSelectable ) this.selected();
        
    }

    drawImage( name, image, x,y,w,h ){

        this.tmpCtx.clearRect(0, 0, this.imageSize[0], this.imageSize[1]);
        this.tmpCtx.drawImage(image, x, y, w, h, 0, 0, this.imageSize[0], this.imageSize[1]);
        this.tmpImage[name].src = this.tmpCanvas.toDataURL();


        /*let c = this.tmpImage[name]
        let ctx = c.getContext("2d")
        ctx.drawImage(image, x, y, w, h, 0, 0, this.imageSize[0], this.imageSize[1])*/

    }

    addImages (){
        let lng = this.list.length;
        for( let i=0; i<lng; i++ ){
            this.items[i].appendChild( this.tmpImage[this.list[i]] );
        }
        this.setTopItem();
    }

    setValue ( value ) {

        if ( this.refObject ) {
            for ( let g in this.refObject ) {
                if ( this.refObject[g] === value ) {
                    this.value = g;
                    break;
                }
            }
        } else {
            this.value = !isNaN(value) ? this.list[value] : value;
        }
        this.setTopItem();

    }

    /*setValue ( value ) {

        if(this.refObject){
            let ccc = null
            for( let g in this.refObject ){ if(this.refObject[g] === this.value ) ccc = g }
            if(ccc) this.value = this.list[ this.list.indexOf(ccc) ];
        } else {
            if(!isNaN(value)) this.value = this.list[ value ];
            else this.value = value;
        }

        this.setTopItem();

    }*/

    setTopItem (){

        if( this.staticTop ) return;

        

        if( this.isWithImage ){

            if(!this.preLoadComplete ) return;

            if(!this.c[3].children.length){
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.imageSize[0];
                this.canvas.height = this.imageSize[1];
                this.canvas.style.cssText ='margin-right:4px;';
                this.ctx = this.canvas.getContext("2d");
                this.c[3].style.textAlign = 'left';
                this.c[3].style.justifyContent = 'left';
                this.c[3].appendChild( this.canvas );
            }

            this.tmpImage[ this.value ];
            this.ctx.drawImage( this.tmpImage[ this.value ], 0, 0, this.imageSize[2], this.imageSize[3], 0,0, this.imageSize[0], this.imageSize[1] );

        }
        else this.c[3].textContent = this.value;

        if( this.miniIcon ){

            if(this.c[3].children.length) this.c[3].removeChild( this.c[3].children[0] );

            let t = '';
            let tn = this.extraSpace;
            while(tn--) t += '&nbsp;';

            this.c[3].innerHTML =t+this.value;

            if(this.current){

                let id = this.current.id;

                let ic = document.createElement("div");
                ic.style.cssText ='font-size:'+(this.itemHeight-4)+'px; line-height:'+(this.itemHeight-4)+'px; left:0px; top:0px; position:absolute;';
                ic.innerHTML = this.emojii[id] ? this.emojii[id] : '🟢';
                this.c[3].appendChild( ic );
            }

        }

        if( this.miniCanvas ){

            if(!this.c[3].children.length){
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.imageSize[0];
                this.canvas.height = this.imageSize[1];
                this.canvas.style.cssText ='margin-right:4px;';
                this.ctx = this.canvas.getContext("2d");
                this.c[3].style.textAlign = 'left';
                this.c[3].style.justifyContent = 'left';
                this.c[3].appendChild( this.canvas );
            }

            this.ctx.drawImage( this.tmpImage[ this.value ], 0, 0 );

        }

    }


    // ----- LIST

    /*smoothScroll () {

        if ( !this.scroll || Math.abs( this.targetPy - this.py ) < 0.1 ) return;

        // 0.2 = facteur de fluidité (plus il est bas, plus l'inertie est longue)
        this.py += ( this.targetPy - this.py ) * 0.2;
        this.update( this.py );

    }*/

    update ( y ) {

        if( !this.scroll ) return;

        y = y < 0 ? 0 : y;
        y = y > this.range ? this.range : y;

        this.topList = -Math.floor( y / this.ratio );

        //this.listIn.style.top = this.topList+'px';
        //this.listIn.style.transform = 'translate3d(0,' + this.topList + 'px, 0)'
        //this.scroller.style.top = Math.floor( y )  + 'px';

        // Accélération GPU + déclenchement automatique de la transition CSS
        this.listIn.style.transform = 'translate3d(0, ' + this.topList + 'px, 0)';
        this.scroller.style.transform = 'translate3d(0, ' + Math.floor( y ) + 'px, 0)';



        this.py = y;

    }

    parentHeight ( t ) {

        if ( this.group !== null ) this.group.calc( t );
        else if ( this.isUI ) this.main.calc( t );

    }

    open ( first ) {

        super.open();

        this.update( this.py );

        this.h = this.maxHeight + this.baseH + 5;
        if( !this.scroll ){
            this.topList = 0;
            this.h = this.baseH + 5 + this.max;
            this.scroller.style.display = 'none';
            this.scrollerBack.style.display = 'none';
        } else {
            this.scroller.style.display = 'block';
            this.scrollerBack.style.display = 'block';
        }
        this.s[0].height = this.h + 'px';
        this.s[2].display = 'block';

        if( this.up ){ 
            this.zone.y -= this.h - (this.baseH-10);
            this.setSvg( this.c[4], 'd', this.svgs.g1 );
        } else {
            this.setSvg( this.c[4], 'd', this.svgs.g2 );
        }

        this.rSizeContent();

        let t = this.h - this.baseH;

        this.zone.h = this.h;

        if(!first) this.parentHeight( t );

    }

    close () {

        super.close();

        if( this.up ) this.zone.y += this.h - (this.baseH-10);

        let t = this.h - this.baseH;

        this.h = this.baseH;
        this.s[0].height = this.h + 'px';
        this.s[2].display = 'none';
        this.setSvg( this.c[4], 'd', this.svgs.g1 );

        this.zone.h = this.h;

        this.parentHeight( -t );

    }

    // -----

    text ( txt ) {

        this.c[3].textContent = txt;

    }

    rSizeContent () {

        let i = this.length;
        while(i--) this.listIn.children[i].style.width = this.ww + 'px';

    }

    rSize () {

        super.rSize();

        //Proto.prototype.rSize.call( this );

        let s = this.s;
        let w = this.sb;
        let d = this.sa;

        if(s[2]=== undefined) return;

        s[2].width = w + 'px';
        s[2].left = d +'px';

        s[3].width = w + 'px';
        s[3].left = d + 'px';

        s[4].left = d + w - 15 + 'px';

        this.ww = w;
        if( this.max > this.maxHeight ) this.ww = w-this.ss;
        if(this.isOpen) this.rSizeContent();

    }

}

class Numeric extends Proto {

    constructor( o = {} ) {

        super( o );

        this.setTypeNumber( o );

        this.allway = o.allway || false;

        this.isDown = false;
        this.value = [0];
        this.multy = 1;
        this.invmulty = 1;
        this.isSingle = true;
        this.isAngle = false;
        this.isVector = false;
        this.haveInput = true;

        if( o.isAngle ){
            this.isAngle = true;
            this.multy = Tools.torad;
            this.invmulty = Tools.todeg;
        }

        this.isDrag = o.drag || false;

        if( o.value !== undefined ){
            if( !isNaN(o.value) ){
                this.value = [o.value];
            } else if( o.value instanceof Array ){ 
                this.value = o.value;
                this.isSingle = false;
            } else if( o.value instanceof Object ){ 
                this.value = [];
                if( o.value.x !== undefined ) this.value[0] = o.value.x;
                if( o.value.y !== undefined ) this.value[1] = o.value.y;
                if( o.value.z !== undefined ) this.value[2] = o.value.z;
                if( o.value.w !== undefined ) this.value[3] = o.value.w;
                this.isSingle = false;
                this.isVector = true;
            }
        }

        this.lng = this.value.length;
        this.tmp = [];

        this.current = -1;
        this.prev = { x:0, y:0, d:0, v:0 };

        this.center = o.center || false;

        let cc = this.colors;

        // bg
        this.c[2] = this.dom( 'div', this.css.basic + ' background:' + cc.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' );

        this.cMode = [];

        for(let i = 0; i<this.lng; i++){

            if( this.isAngle ) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );

            this.c[3+i] = this.dom( 'div', this.css.txtselect + 'top:1px; height:'+(this.h-2)+'px; color:' + cc.text + '; background:' + cc.back + '; border:' + cc.borderSize + 'px solid ' + cc.border + '; border-radius:'+this.radius+';' );
            if ( o.center ) this.c[3+i].style.justifyContent = 'center';
            this.c[3+i].textContent = this.value[i];
            this.c[3+i].style.color = this.colors.text;
            this.c[3+i].isNum = true;
            this.cMode[i] = 0;

            this.addInput( this.c[3+i] );

        }

        this.init();

    }

    //----> ZONE

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return ''

        let i = this.lng;
        let t = this.tmp;

        while( i-- ){
            if( l.x>t[i][0] && l.x<t[i][2] ) return i
        }

        return ''

    }

    //----> EVENTS

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !this.isDown ){
            this.isDown = true;
            if( name !== '' ){ 
            	this.current = name;
                this.prev.x = e.clientX;
                this.prev.y = e.clientY;
                this.prev.d = 0;
                //this.prev.v = parseFloat( this.value[ this.current ] );
                this.prev.v = this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] );
            	//this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] ) }
            	this.setInput( this.c[ 3 + this.current ] );
            }
            return this.mousemove( e )
        }

        return false

    }

    mouseup ( e ) {

        if( this.isDown ){
            
            this.isDown = false;
            this.prev.x = 0;
            this.prev.y = 0;
            this.prev.d = 0;
            this.prev.v = 0;

            if ( this.isDrag ) {
                this.current = -1;
                this.validate( true );
            }

            return this.mousemove( e )
        }

        return false

    }

    mousemove ( e ) {

        let nup = false;
        let x = 0;

        let name = this.testZone( e );

        if( name === '' ) this.cursor();
        else { 
        	if(!this.isDrag) this.cursor('text');
        	else this.cursor( this.current !== -1 ? 'move' : 'pointer' );
        }

        if( this.isDrag ){

        	if( this.current !== -1 ){

            	this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );

                let n = this.prev.v + ( this.prev.d * this.step);

                this.value[ this.current ] = this.numValue(n);
                this.c[ 3 + this.current ].textContent = this.value[this.current];

                //this.validate()
                this.validate( true );

                this.prev.x = e.clientX;
                this.prev.y = e.clientY;

                nup = true;
             }

        } else {

            if ( this.isDown && this.current !== -1 ) {
                const el = this.c[ 3 + this.current ];
                const pad = 5 - this.colors.borderSize;
                const full = Roots.textWidth( el.textContent );
                const elW = el.clientWidth || ( this.tmp[ this.current ][ 1 ] - this.colors.borderSize * 2 );
                const left = this.center ? ( elW - full ) * 0.5 : ( elW - pad - full );
                x = ( e.clientX - this.zone.x - this.tmp[ this.current ][ 0 ] ) - left;
            }
            return this.upInput( x, this.isDown );

        }

        return nup

    }

    //----> ACTION

    reset () {

        let nup = false;
        return nup;

    }

    setValue ( v ) {

        if( this.isVector ){
            if( v.x !== undefined ) this.value[0] = v.x;
            if( v.y !== undefined ) this.value[1] = v.y;
            if( v.z !== undefined ) this.value[2] = v.z;
            if( v.w !== undefined ) this.value[3] = v.w;
        } else {
            this.value = this.isSingle ? [v] : v ;
        }

        this.update();

    }

    sameStr ( str ){

        let i = this.value.length;
        while(i--) this.c[ 3 + i ].textContent = str;

    }

    update ( up ) {

        let i = this.value.length;

        while(i--){
             this.value[i] = this.numValue( this.value[i] * this.invmulty );
             this.c[ 3 + i ].textContent = this.value[i];
        }

        if( up ) this.send();

    }

    send ( v ) {

        v = v ?? ( this.isSingle ? this.value[0] * this.multy : this.value.map( n => n * this.multy ) );

        this.isSend = true;
        if ( this.objectLink !== null ) {
            if ( this.isVector ) this.objectLink[ this.objectKey ].fromArray( v );
            else this.objectLink[ this.objectKey ] = v;
        }
        if ( this.callback ) this.callback( v, this.objectKey );
        this.isSend = false;

    }

    validate ( force ) {

        let ar = [];
        let i = this.lng;

        if( this.allway ) force = true;

        while(i--){
            if(!isNaN( this.c[ 3 + i ].textContent )){ 
                let nx = this.numValue( this.c[ 3 + i ].textContent );
                this.c[ 3 + i ].textContent = nx;
                this.value[i] = nx;
            } else { // not number
                this.c[ 3 + i ].textContent = this.value[i];
            }

            ar[i] = this.value[i] * this.multy;
        }

        if( !force ) return
        this.send( this.isSingle ? ar[0] : ar );

    }

    //----> REZISE

    rSize () {

        super.rSize();
        let sx = this.colors.sx;
        let ss = sx * (this.lng-1);
        let w = (this.sb-ss) / this.lng;
        let s = this.s;
        let i = this.lng;

        while(i--){
            //this.tmp[i] = [ Math.floor( this.sa + ( w * i )+( 5 * i )), w ];
            this.tmp[i] = [ ( this.sa + ( w * i )+( sx * i )), w ];
            this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];
            s[ 3 + i ].left = this.tmp[i][0] + 'px';
            s[ 3 + i ].width = this.tmp[i][1] + 'px';
        }

    }

    //----> INPUT-

    select ( c, e, w, t, full ) {

        const idx = this.c.indexOf( Roots.input );
        if ( idx >= 3 ) this.current = idx - 3;

        if ( this.current === -1 ) return;
        const cc = this.colors;
        const el = this.c[ 3 + this.current ];
        const st = this.s[ 3 + this.current ];

        const pad = 5 - this.colors.borderSize;
        const elW = el.clientWidth || ( this.tmp[ this.current ][ 1 ] - cc.borderSize * 2 );
        const left = this.center ? ( elW - (full || 0) ) * 0.5 : ( elW - pad - (full || 0) );
        //const left = this.center ? ( el.clientWidth - (full || 0) ) * 0.5 : ( el.clientWidth - pad - (full || 0) );

        //const left = this.center ? ( el.clientWidth - (full || 0) ) * 0.5 : ( el.clientWidth - 5 - (full || 0) );
        const start = left + e;
        const end = start + w;
        const cur = left + c;

        st.background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;

    }

    unselect () {

        if ( !this.s || this.current === -1 ) return;
        this.s[ 3 + this.current ].background = this.colors.back;
    
    }

}

class Slide extends Proto {

    constructor( o = {} ) {

        super( o );

        this.setTypeNumber( o );

        this.model = o.stype!== undefined ? o.stype : 1;
        if( o.mode !== undefined ) this.model = o.mode;

        this.isDown = false;
        this.isOver = false;
        this.allway = o.allway || false;

        this.editable = o.editable !== undefined ? o.editable : false;
        this.haveInput = this.editable;

        this.autoValue = true;
        if( o.autoValue!==undefined ) this.autoValue = false;

        this.isDeg = o.isDeg || false;
        this.isCyclic = o.cyclic || false;
        this.isTime = o.isTime || false;

        this.firstImput = false;
        this.cmode = 0;

        let cc = this.colors;

        this.c[2] = this.dom( 'div', this.css.txtselect + 'border:none; background:none; width:47px; color:'+ cc.text +';' );
        this.c[3] = this.dom( 'div', this.css.basic + ' top:0; height:'+this.h+'px;' );
        this.c[4] = this.dom( 'div', this.css.basic + 'background:'+cc.back+'; top:2px; height:'+(this.h-4)+'px;' );
        this.c[5] = this.dom( 'div', this.css.basic + 'left:4px; top:5px; height:'+(this.h-10)+'px; background:' + cc.text +';' );

        this.c[2].isNum = true;
        this.c[2].style.height = (this.h-2) + 'px';
        this.c[2].style.lineHeight = (this.h-10) + 'px';

        if(this.editable) this.addInput( this.c[2] );

        if ( this.model > 0 ) {

            let r1 = 4, h1 = 3, h2 = 6, ww = this.h * 0.5, ra = '100%';

            if ( this.model === 2 ) {
                r1 = 0;
                ra = '0px';
                ww = ( this.h - 6 ) * 0.5;
            }

            this.thumbSize = ww;

            if ( this.model === 3 ) this.c[ 5 ].style.visibility = 'hidden';

            this.c[ 4 ].style.borderRadius = r1 + 'px';
            this.c[ 4 ].style.height = h2 + 'px';
            this.c[ 4 ].style.top = ( this.h * 0.5 ) - h1 + 'px';

            this.c[ 5 ].style.borderRadius = ( r1 * 0.5 ) + 'px';
            this.c[ 5 ].style.height = h1 + 'px';
            this.c[ 5 ].style.top = ( this.h * 0.5 ) - ( h1 * 0.5 ) + 'px';

            // Sans margin-left, positionné en (0,0) et déplacé par le GPU
            this.c[ 6 ] = this.dom( 'div', this.css.basic + `border-radius:${ra}; background:${cc.text}; left:0px; top:0px; height:${ww}px; width:${ww}px; will-change:transform;` );

        }

        this.init();

    }

    //----> ZONE

    testZone ( e ) {

        let l = this.local;
        if ( l.x === -1 && l.y === -1 ) return '';

        const pad = this.model > 0 ? this.thumbSize * 0.5 : 0;
        if ( l.x >= this.sa - pad && l.x <= this.txl + pad ) return 'scroll';
        if ( l.x > this.txl + pad ) return 'text';
        return '';

    }

    //----> EVENTS

    mousedown ( e ) {

        let name = this.testZone( e );
        if ( !name ) return false;

        if ( !this.isDown ) {
            this.isDown = true;
            if ( name === 'scroll' ) {
                this.isScroll = true; 
                this.old = this.value;
            } else if ( name === 'text' && this.editable ) {
                this.isScroll = false;
                this.c[2].textContent = this.value;
                this.setInput( this.c[2] );
            }
            return this.mousemove( e );
        }
        return false;

    }

    mouseup ( e ) {

        if ( this.isDown ) {
            this.isDown = false;
            if ( this.isScroll ) {
                this.isScroll = false;
                this.sendEnd();
                return false;
            }
            return this.mousemove( e );
        }
        return false;
    }

    mousemove ( e ) {

        let nup = false;

        if ( this.isScroll && this.isDown ) {
            // Le centre de la piste utile commence à (this.zone.x + this.sa + 3)
            const mouseX = e.clientX - ( this.zone.x + this.sa + 3 );
            const rawPct = Math.max( 0, Math.min( 1, mouseX / this.ww ) );
            const rawVal = rawPct * this.range + this.min;
            const nv = this.numValue( Math.round( rawVal / this.step ) * this.step );

            if ( nv !== this.value ) {
                this.value = nv;
                this.update( true );
                nup = true;
            }
            return nup;
        }

        let name = this.testZone( e );

        if ( name === 'text' && this.editable ) {
            this.cursor( 'text' );
        } else if ( name === 'scroll' ) {
            if ( this.mode( 1 ) ) nup = true;
            this.cursor( 'w-resize' );
        } else {
            if ( this.mode( 0 ) ) nup = true;
            this.cursor();
        }

        if ( this.editable && !this.isScroll ) {
            let x = 0;
            if ( this.isDown ) {
                const idxText = 2;
                const el = this.c[ idxText ];
                const full = Roots.textWidth( el.textContent );
                const elW = el.clientWidth || ( this.sc - 6 );
                const left = elW - 5 - full;
                x = ( e.clientX - this.zone.x - ( this.txl + 4 ) ) - left;
            }
            return this.upInput( x, this.isDown );
        }

        return nup;

    }

    //----> ACTION

    formatOutput(){

        let v = this.value;
        if(this.isDeg) v+='°';
        if(this.isTime){

            const heures = Math.floor(this.value);
            const minutes = Math.round((this.value - heures) * 60);

            if(minutes === 60) { v = `${heures + 1}h00`; }
            else {
                const minutesFormatees = minutes < 10 ? '0' + minutes : minutes;
                v = `${heures}h${minutesFormatees}`;
            }

        }

        return v 

    }

    validate ( force ) {

        if ( this.allway ) force = true;
        let n = this.c[2].textContent;
        if ( !isNaN( n ) && n !== '' ) {
            this.value = this.numValue( n );
            this.update( force );
        } else if ( force && this.autoValue ) {
            this.c[2].textContent = this.formatOutput();
        }

    }

    reset () {

        this.isDown = false;
        this.mode(0);

    }

    mode ( mode ) {

        if ( this.cmode === mode ) return false;
        this.cmode = mode;
        let s = this.s, cc = this.colors;
        const isOver = mode === 1;

        s[2].color = isOver ? cc.textOver : cc.text;
        s[4].background = cc.back;
        s[5].background = isOver ? cc.textOver : cc.text;
        if ( this.model !== 0 ) s[6].background = isOver ? cc.textOver : cc.text;
        return true;

    }

    update ( up ) {

        const pct = this.range > 0 ? ( this.value - this.min ) / this.range : 0;
        const ww = this.ww * pct;

        if ( this.model !== 3 ) this.s[ 5 ].width = ww + 'px';

        if ( this.s[ 6 ] ) {
            // Centre exact sur (this.sa + 3 + ww) horizontalement et (this.h * 0.5) verticalement
            const x = ( this.sa + 3 + ww ) - ( this.thumbSize * 0.5 );
            const y = ( this.h - this.thumbSize ) * 0.5;
            this.s[ 6 ].transform = `translate3d(${x}px, ${y}px, 0)`;
        }

        if ( !this.isEdit && this.autoValue ) this.c[ 2 ].textContent = this.formatOutput();

        if ( up ) this.send();

    }

    //----> REZISE

    rSize () {

        super.rSize();

        let w = this.sb - this.sc;
        this.ww = w - 6;

        let tx = this.sc;
        if(this.isUI || !this.simple) tx = this.sc+10;
        this.txl = this.w - tx + 2;

        const s = this.s;

        s[2].width = (this.sc -6 )+ 'px';
        s[2].left = (this.txl +4) + 'px';
        //s[2].top = ty + 'px';
        s[3].left = this.sa + 'px';
        s[3].width = w + 'px';
        s[4].left = this.sa + 'px';
        s[4].width = w + 'px';
        s[5].left = (this.sa + 3) + 'px';

        this.update();

    }

    //----> INPUT

    select ( c, e, w, t, full ) {
        
        if ( !this.editable ) return;
        const cc = this.colors;
        const pad = 5;
        const el = this.c[ 2 ];
        const st = this.s[ 2 ];

        const elW = el.clientWidth || ( this.sc - 6 );
        const left = elW - pad - ( full || 0 );
        const start = left + e;
        const end = start + w;
        const cur = left + c;

        st.background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;

    }

    unselect () {

        if ( !this.s ) return;
        this.s[2].background = 'none';
        if ( this.autoValue ) this.c[2].textContent = this.formatOutput();

    }

}

class TextInput extends Proto {

    constructor( o = {} ) {

        super( o );

        this.haveInput = true;

        this.value = o.value !== undefined ? o.value : '';
        this.placeHolder = o.placeHolder || 'text';

        this.allway = o.allway || false;
        this.editable = o.edit !== undefined ? o.edit : true;

        this.isDown = false;

        let cc = this.colors;

        // text
        this.c[2] = this.dom( 'div', this.css.txtselect + 'top:1px; height:' + (this.h-2) + 'px; color:' + cc.text + '; background:' + cc.back + '; border:' + cc.borderSize + 'px solid ' + cc.border + '; border-radius:' + this.radius + ';' );
        this.c[2].textContent = this.value;

        // fake
        this.c[3] = this.dom( 'div', this.css.txtselect + 'top:1px; height:' + (this.h-2) + 'px; border:none; justify-content: center; font-style: italic; color:'+cc.border+';' );
        if( this.value === '' ) this.c[3].textContent = this.placeHolder;

        this.addInput( this.c[2] );

        this.init();

    }

    //----> ZONE

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x >= this.sa ) return 'text';
        return '';

    }

    //----> EVENTS

    mouseup ( e ) {

        if(!this.editable) return;

        if( this.isDown ){
            this.isDown = false;
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

        if(!this.editable) return;

        let name = this.testZone( e );

        if( !this.isDown ){
            this.isDown = true;
            if( name === 'text' ) this.setInput( this.c[2] );
            return this.mousemove( e );
        }

        return false;

    }

    mousemove ( e ) {

        if(!this.editable) return;

        let name = this.testZone( e );

        let x = 0;

        if( name === 'text' ) this.cursor('text');
        else this.cursor();

        if ( this.isDown ) {
            const el = this.c[ 2 ];
            const pad = 5 - this.colors.borderSize;
            const full = Roots.textWidth( el.textContent );
            const w = el.clientWidth || ( this.sb - this.colors.borderSize * 2 );
            const left = w - pad - full;
            x = ( e.clientX - this.zone.x - this.sa ) - left;
        }

        return this.upInput( x, this.isDown );

    }

    //----> ACTION

    update ( ) {

        this.c[2].textContent = this.value;
        
    }

    dispose() {
        
        super.dispose();


    }

    reset () {

        this.cursor();

    }

    validate ( force ) {

        if( this.allway ) force = true; 
        this.value = this.c[2].textContent;
        if(this.value !== '') this.c[3].textContent = '';
        else this.c[3].textContent = this.placeHolder;
        if( !force ) return;
        this.send();

    }

    //----> REZISE

    rSize () {

        super.rSize();

        let s = this.s;
        s[2].left = this.sa + 'px';
        s[2].width = this.sb + 'px';

        s[3].left = this.sa + 'px';
        s[3].width = this.sb + 'px';
     
    }

    //----> INPUT

    select ( c, e, w, t, full ) {

        if ( !this.editable ) return;
        const cc = this.colors;
        const pad = 5 - cc.borderSize;
        const el = this.c[ 2 ];
        const st = this.s[ 2 ];

        const width = el.clientWidth || ( this.sb - cc.borderSize * 2 );
        const left = width - pad - ( full || 0 );
        const start = left + e;
        const end = start + w;
        const cur = left + c;

        st.background = `linear-gradient(90deg, 
            ${cc.backoff} 0px, ${cc.backoff} ${start}px, 
            ${cc.select} ${start}px, ${cc.select} ${end}px, 
            ${cc.backoff} ${end}px, ${cc.backoff} ${cur}px, 
            ${cc.text} ${cur}px, ${cc.text} ${cur + 1}px, 
            ${cc.backoff} ${cur + 1}px)`;

    }

    unselect () {

        if ( !this.s ) return;
        this.s[2].background = this.colors.back;

    }

}

class Title extends Proto {

    constructor( o = {} ) {

        if ( !o.name && !o.txt ) o.name = ' ';
        super( o );

        this.isTitle = true;

        const s1 = this.s[1];
        const align = o.align || 'left';

        s1.justifyContent = align === 'right' ? 'flex-start' : ( align === 'center' ? 'center' : 'flex-end' );
        s1.textAlign = align;
        if ( o.fontSize ) s1.fontSize = typeof o.fontSize === 'number' ? o.fontSize + 'px' : o.fontSize;
        s1.fontWeight = o.weight || 'normal';
        s1.color = o.color || this.colors.text;

        this.text( this.txt );
        this.init();

    }

    handleEvent () { return false; }

    text( txt ) {

        const el = this.c[1];
        if ( !el ) return;
        if ( typeof txt === 'string' && txt.indexOf( '<' ) !== -1 ) el.innerHTML = txt;
        else el.textContent = txt;

    }


    rSize() {

        super.rSize();
        this.s[1].width = this.w + 'px'; //- 50 + 'px';
        //this.s[2].left = this.w + 'px';//- ( 50 + 26 ) + 'px';

    }

    setColor( c ) {
        this.s[1].color = c;
    }

}

class Select extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = o.value || '';
        this.isDown = false;
        this.onActif = o.onActif || function(){};

        //let prefix = o.prefix || '';
        const cc = this.colors;

        this.c[2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+ cc.buttonBorder+'; border-radius:15px; width:30px; left:10px;' );
        //this.c[2].style.color = this.fontColor;

        this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; background:' + cc.inputBg + '; borderColor:' + cc.inputBorder+'; border-radius:'+this.radius+';' );
        this.c[3].textContent = this.value;

        let fltop = Math.floor(this.h*0.5)-7;
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.svgs[ 'cursor' ], fill:cc.text, stroke:'none'});

        this.stat = 1;
        this.isActif = false;

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return ''
        if( l.x > this.sa && l.x < this.sa+30 ) return 'over'
        return '0'

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            //this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e )
        }

        return false

    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false

        this.isDown = true;
        //this.value = this.values[ name-2 ];
        //this.send();
        return this.mousemove( e )

    }

    mousemove ( e ) {

        let up = false;
        let name = this.testZone( e );

        if( name === 'over' ){
            this.cursor('pointer');
            up = this.mode( this.isDown ? 3 : 2 );
        } else {
            up = this.reset();
        }

        return up

    }

    // ----------------------

    apply ( v ) {

        v = v || '';

        if( v !== this.value ) {
            this.value = v;
            this.c[3].textContent = this.value;
            this.send();
        }
        
        this.mode(1);

    }

    update () {

        this.mode( 3 );

    }

    mode ( n ) {

        let change = false;
        let cc = this.colors;

        if( this.stat !== n ){

            if( n===1 ) this.isActif = false;
            if( n===3 ){ 
                if( !this.isActif ){ this.isActif = true; n=4; this.onActif( this ); }
                else { this.isActif = false; }
            }

            if( n===2 && this.isActif ) n = 4;

            this.stat = n;

            switch( n ){

                case 1: this.s[ 2 ].color = cc.text; this.s[ 2 ].background = cc.button; break; // base
                case 2: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.overoff; break; // over
                case 3: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.action; break; // down
                case 4: this.s[ 2 ].color = cc.textSelect; this.s[ 2 ].background = cc.action; break; // actif

            }

            change = true;

        }

        return change



    }

    reset () {

        this.cursor();
        return this.mode( this.isActif ? 4 : 1 )

    }

    text ( txt ) {

        this.c[3].textContent = txt;

    }

    rSize () {

        super.rSize();

        let s = this.s;
        s[2].left = this.sa + 'px';
        s[3].left = (this.sa + 40) + 'px';
        s[3].width = (this.sb - 40) + 'px';
        s[4].left = (this.sa+8) + 'px';

    }

}

class Bitmap extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = o.value || '';
        this.colorSpace = o.colorSpace || '';


        //this.refTexture = o.texture || null;
        this.img = null;

        if( this.value.isTexture ){
            if( this.value.image ){
                this.img = this.value.image; 
                //console.log(this.value, this.img)
            }
        }

        
        


        this.isDown = false;
        this.neverlock = true;

        const cc = this.colors;

        this.c[2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:' + cc.button + '; height:' + (this.h - 2) + 'px; border:' + cc.borderSize + 'px solid ' + cc.border + '; border-radius:' + this.radius + '; width:30px;' );
        this.c[3] = this.dom( 'div', this.css.txtselect + 'top:1px; height:' + (this.h - 2) + 'px; background:' + cc.back + '; border:' + cc.borderSize + 'px solid ' + cc.border + '; border-radius:' + this.radius + '; justify-content:center;' );
        if(!this.img) this.c[3].textContent = 'null';
        

        let fltop = Math.floor(this.h*0.5)-7;
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.svgs[ 'load' ], fill:cc.text, stroke:'none'});

        //this.c[5] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+cc.buttonBorder+'; border-radius:2px; width:30px; ' )

        this.stat = 1;

        this.makePreview();

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x > this.sa && l.x < this.sa+30 ) return 'over';
        if( l.x > this.sa-30 && l.x < this.sa ) return 'delete';
        return '0'

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            //this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

        let name = this.testZone( e );
        if( !name ) return false;

        if( name === 'over' ){
            this.isDown = true;
            Files.load( { callback:this.changeBitmap.bind(this), always:true, type:'image' } );

        } else if ( name === 'delete' ) {
            this.changeBitmap( null );
        }

        return this.mousemove( e );

    }

    mousemove ( e ) {

        let up = false;

        let name = this.testZone( e );

        if( name === 'over' ){
            this.cursor('pointer');
            up = this.mode( this.isDown ? 3 : 2 );
        } else {
            up = this.reset();
        }

        return up;

    }

    // ----------------------

    makePreview () {

        const el = this.c[3];

        if ( this.img ) {
            let url = this.img.src;

            // Si c'est un ImageBitmap (sans .src) ou un blob:, on dessine une miniature via Canvas
            if ( !url || url.startsWith('blob:') ) {
                const c = document.createElement('canvas');
                c.width = 64;
                c.height = 64;
                c.getContext('2d').drawImage( this.img, 0, 0, 64, 64 );
                url = c.toDataURL();
            }

            el.style.backgroundImage = `url("${url}")`;
            el.style.backgroundSize = 'cover';
            el.style.backgroundPosition = 'center';
            el.style.backgroundRepeat = 'no-repeat';
        } else {
            el.style.background = this.colors.back;
            el.style.backgroundImage = 'none';
        }

    }

    /*makePreview(){

        if( this.img ){

            let src = this.img.src

            if(src.search('blob:')!==-1){ 
                let src2 = src.substring(5)

                //  TODO find a way to display blob ???

                
                /*let reader = new FileReader();
                reader.onload = () => {
                    console.log( reader.result );
                };
                reader.readAsDataURL( src2 );
                console.log(src, src2)*/
                //src = URL.createObjectURL(src)
                //this.c[3].style.background = 'url('+src2+')';
                //this.c[3].style.backgroundSize = (this.sb - 40) + 'px ' + (this.sb - 40) + 'px'
                //this.c[3].style.backgroundSize = 20 + 'px ' + 20 + 'px'
                //this.c[3].style.backgroundPosition = 'center';
                //this.c[3].style.backgroundRepeat = 'no-repeat';
       /*         this.c[3].style.background = '#00ff00';
                this.c[3].style.backgroundImage = 'none';
            } else {
                //console.log(this.value)
                //let src = this.img.src ? this.img.src : this.img;
                this.c[3].style.background = 'url('+src+')';
                this.c[3].style.backgroundSize = (this.sb - 40) + 'px ' + (this.sb - 40) + 'px'
                //this.c[3].style.backgroundSize = 20 + 'px ' + 20 + 'px'
                this.c[3].style.backgroundPosition = 'center';
                this.c[3].style.backgroundRepeat = 'no-repeat';
            }

            
        } else {
            this.c[3].style.background = this.colors.back;
            this.c[3].style.backgroundImage = 'none';
        }

    }*/

    changeBitmap( img, fname, type ){

        if( img ){
            this.img = img;
            this.apply( fname );
        } else {
            this.img = null;
            this.apply( 'null' );
        }

        this.makePreview();
        this.threeTexture();
        
    }

    // ----------------------

    threeTexture () {

        if ( this.objectLink === null ) return;

        let texture = this.objectLink[ this.objectKey ];
        let colorSpace = this.colorSpace || ( this.objectKey === 'map' ? 'srgb' : '' );

        //if(this.objectKey === 'map') colorSpace = 'srgb'


        if ( this.img ) {
            if ( texture && texture.isTexture ) {
                const old = texture;
                texture = old.clone();
                texture.image = this.img;
                texture.colorSpace = colorSpace;
                texture.needsUpdate = true;
                this.objectLink[ this.objectKey ] = texture;
                old.dispose();
            } else if ( Tools.texture ) {
                texture = new Tools.texture( this.img );
                texture.colorSpace = colorSpace;
                texture.needsUpdate = true;
                this.objectLink[ this.objectKey ] = texture;
            }
        } else {
            if ( texture && texture.isTexture ) texture.dispose();
            this.objectLink[ this.objectKey ] = null;
        }

        this.objectLink.needsUpdate = true;

    }

    /*threeTexture() {

        // need define UIL.Tools.texture = THREE.Texture;

        if( this.objectLink === null ) return;
        
        let texture = this.objectLink[this.objectKey];
        if( this.img ){
            if( texture !== null ){
                texture.image = this.img;
                this.objectLink[this.objectKey] = texture.clone();
                texture.dispose();
                this.objectLink[this.objectKey].needsUpdate = true;
            } else if( Tools.texture ){
                texture = new Tools.texture(this.img)
                //console.log('colorSpace',  texture.colorSpace )
                if( this.colorSpace ) texture.colorSpace = this.colorSpace;//'srgb';
                this.objectLink[this.objectKey] = texture;
                this.objectLink[this.objectKey].needsUpdate = true;
            }
        }
        else {
            this.objectLink[this.objectKey] = null;
        }
        this.objectLink.needsUpdate = true;
    }*/

    apply ( v ) {

        v = v || '';
        let name = this.objectLink !== null ? this.objectKey : this.name;

        if( v !== this.value ) {
            this.value = v;

            if( this.img !== null ){
                this.c[3].textContent = '';
                //if( this.objectLink !== null ) this.objectLink[ this.val ] = v
                if( this.callback ) this.callback( this.value, this.img, name );
            } else {
                this.c[3].textContent = 'null';
                //if( this.objectLink !== null ) this.objectLink[ this.val ] = v
                if( this.callback ) this.callback( null, null, name );
            }

            
            
        }
        
        this.mode(1);

    }

    update () {

        this.mode( 3 );

    }

    mode ( n, id ) {

        let change = false;
        let cc = this.colors;

        if( this.stat !== n ){

            this.stat = n;

            switch( n ){

                case 1: this.s[ 2 ].color = cc.text; this.s[ 2 ].background = cc.button; break; // base
                case 2: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.overoff; break; // over
                case 3: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.over; break; // down
                case 4: this.s[ 2 ].color = cc.textSelect; this.s[ 2 ].background = cc.select; break; // actif

            }

            this.setSvg( this.c[4], 'fill', this.s[ 2 ].color, -1 );

            change = true;

        }

        return change;



    }

    reset () {

        this.cursor();
        return this.mode( this.isActif ? 4 : 1 );

    }

    text ( txt ) {

        this.c[3].textContent = txt;

    }

    rSize () {

        super.rSize();

        let s = this.s;
        s[2].left = this.sa + 'px';
        s[3].left = (this.sa + 40) + 'px';
        s[3].width = (this.sb - 40) + 'px';
        s[4].left = (this.sa+8) + 'px';

        //s[3].backgroundSize = (this.sb - 40) + 'px' + (this.sb - 40) + 'px'
        //s[5].left = (this.w-30) + 'px';

    }

}

//import { Proto } from '../core/Proto.js';

class Selector extends Button {

    constructor( o = {} ) {

        if( o.selectable === undefined ) o.selectable = true;
        super( o );
     
    }

}

class Empty extends Proto {

    constructor( o = {} ) {

        super( { ...o, isSpace: true, margin: 0, h: o.h !== undefined ? o.h : 10 } );

        this.s[ 0 ].pointerEvents = 'none';
        this.init();

    }

    handleEvent () { return false; }
    
}

class Item extends Proto {

    constructor( o = {} ) {

        super( o );

        this.p = 100;
        this.value = this.txt;
        this.status = 1;

        this.itype = o.itype || 'none';
        this.val = this.itype;

        this.graph = this.svgs[ this.itype ];

        let fltop = Math.floor(this.h*0.5)-7;

        this.c[2] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.graph, fill:this.colors.text, stroke:'none'});

        this.s[1].marginLeft = 20 + 'px';

        this.init();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousemove ( e ) {

        this.cursor('pointer');

        //up = this.modes( this.isDown ? 3 : 2, name );

    }

    mousedown ( e ) {

        if( this.isUI ) this.main.resetItem();

        this.selected( true );

        this.send();

        return true;

    }

    uiout () {

        if( this.isSelect ) this.mode(3);
        else this.mode(1);

    }

    uiover () {

        if( this.isSelect ) this.mode(4);
        else this.mode(2);

    }

    update () {
            
    }

    /*rSize () {
        
        super.rSize();

    }*/

    mode ( n ) {

        let change = false;

        if( this.status !== n ){

            this.status = n;
            let s = this.s, cc = this.colors;
        
            switch( n ){

                case 1: this.status = 1; s[1].color = cc.text; s[0].background = 'none'; break;
                case 2: this.status = 2; s[1].color = cc.textOver; s[0].background = cc.back; break;
                case 3: this.status = 3; s[1].color = cc.textSelect; s[0].background = cc.select; break;
                case 4: this.status = 4; s[1].color = cc.textOver; s[0].background = cc.over; break;

            }

            change = true;

        }

        return change;

    }

    reset () {

        this.cursor();
       // return this.mode( 1 );

    }

    selected ( b ){

        if( this.isSelect ) this.mode(1);

        this.isSelect = b || false;

        if( this.isSelect ) this.mode(3);
        
    }


}

class Grid extends Proto {

    constructor( o = {} ) {

        super( o );

        /*this.values = o.values || [];

        if( typeof this.values === 'string' ) this.values = [ this.values ];*/

        this.values = [];

        if( o.values ){
            if( o.values instanceof Array ){
                this.values = o.values;
            } else if( o.values instanceof String ){
                this.values = [ o.values ];
            } else if( o.values instanceof Object ){
                this.refObject = o.values;
                for( let g in this.refObject ) this.values.push( g );
            }
        }

        this.lng = this.values.length;



        this.value = o.value || null;




        let cc = this.colors;


        this.isSelectable = o.selectable || false;
        this.spaces = o.spaces || [ cc.sx, cc.sy ];
        this.bsize = o.bsize || [ 90, this.h ];

        this.bsizeMax = this.bsize[0];

        this.tmp = [];
        this.stat = [];
        this.grid = [ 2, Math.round( this.lng * 0.5 ) ];

        this.h = ( this.grid[1] * this.bsize[1] ) + ( this.grid[1] * this.spaces[1] ); //+ 4 - (this.mtop*2) //+ (this.spaces[1] - this.mtop);

        this.c[1].textContent = '';
        //this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; top:'+(this.spaces[1]-2)+'px; height:auto; border-collapse:separate; border:none; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1]-2)+'px;' );
        this.c[2] = this.dom( 'table', this.css.basic + 'width:100%; border-spacing: '+(this.spaces[0]-2)+'px '+(this.spaces[1])+'px; border:none;' );

        let n = 0, b, td, tr, sel;

        this.res = -1;
        this.isDown = false;
        this.neverlock = true;

        this.buttons = []; 
        this.stat = [];
        this.tmpX = [];
        this.tmpY = [];

        for( let i = 0; i < this.grid[1]; i++ ){

            tr = this.c[2].insertRow();
            tr.style.cssText = 'pointer-events:none;';
            for( let j = 0; j < this.grid[0]; j++ ){

                td = tr.insertCell();
                td.style.cssText = 'pointer-events:none;';

                if( this.values[n] ){

                    sel = false;
                    if( this.values[n] === this.value && this.isSelectable ) sel = true;

                    b = document.createElement( 'div' );
                    b.style.cssText = this.css.txt + this.css.button + 'position:static; top:1px; width:'+this.bsize[0]+'px; height:'+(this.bsize[1]-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; left:auto; right:auto; border-radius:'+this.radius+';';
                    b.style.background = sel ? cc.select : cc.button;
                    b.style.color = sel ? cc.textSelect : cc.text;
                    b.innerHTML = this.values[n];
                    td.appendChild( b );

                    this.buttons.push(b);
                    this.stat.push(1);

                } else {

                    b = document.createElement( 'div' );
                    b.style.cssText = this.css.txt + 'position:static; width:'+this.bsize[0]+'px; height:'+this.bsize[1]+'px; text-align:center; left:auto; right:auto; background:none;';
                    td.appendChild( b );

                }

                if(j===0) b.style.cssText += 'float:right;';
                else b.style.cssText += 'float:left;';
            
                n++;

            }
        }

        this.s[0].border = 'none';

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return -1;

        l.y += this.mtop;
        
        let tx = this.tmpX;
        let ty = this.tmpY;

        let id = -1;
        let c = -1;
        let line = -1;
        let i = this.grid[0];
        while( i-- ){
        	if( l.x > tx[i][0] && l.x < tx[i][1] ) c = i;
        }

        i = this.grid[1];
        while( i-- ){
            if( l.y > ty[i][0] && l.y < ty[i][1] ) line = i;
        }

        if(c!==-1 && line!==-1){
            id = c + (line*2);
            if(id>this.lng-1) id = -1;
        }

        return id;

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {

        if( !this.isDown ) return false

        this.isDown = false;
        if( this.res !== -1 ){
            this.value = this.values[this.res];
            this.send();
        }

        return this.mousemove( e )

    }

    mousedown ( e ) {

        if( this.isDown ) return false
        this.isDown = true;
        return this.mousemove( e )

    }

    mousemove ( e ) {

        let up = false;
        this.res = this.testZone( e );

        if( this.res !== -1 ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, this.res );
        } else {
        	up = this.reset();
        }

        return up;

    }

    update () {

        this.modes( 2, this.values.indexOf(this.value) );

    }

    // ----------------------
    //   MODE
    // -----------------------

    modes ( N = 1, id = -1 ) {

        let i = this.lng, w, n, r = false;

        while( i-- ){

            n = N;
            w = this.isSelectable ? this.values[ i ] === this.value : false;
            
            if( i === id ){
                if( w && n === 2 ) n = 3; 
            } else {
                n = 1;
                if( w ) n = 4;
            }

            if( this.mode( n, i ) ) r = true;

        }

        return r

    }

    mode ( n, id ) {

        let change = false;
        let cc = this.colors, s = this.buttons;
        let i = id;

        if( this.stat[id] !== n ){

            this.stat[id] = n;
        
            switch( n ){

                case 1: s[i].style.color = cc.text; s[i].style.background = cc.button; break;
                case 2: s[i].style.color = cc.textOver; s[i].style.background = cc.overoff; break;
                case 3: s[i].style.color = cc.textOver; s[i].style.background = cc.over; break;
                case 4: s[i].style.color = cc.textSelect; s[i].style.background = cc.select; break;

            }

            change = true;

        }

        return change;

    }

    // ----------------------

    reset () {

        this.res = -1;
        this.cursor();
        return this.modes()

    }


    label ( string, n ) {

        this.buttons[n].textContent = string;

    }

    icon ( string, y, n ) {

        this.buttons[n].style.padding = ( y || 0 ) +'px 0px';
        this.buttons[n].innerHTML = string;

    }

    testW () {

        let vw = this.spaces[0]*3 + this.bsizeMax*2, rz = false;
        if( vw > this.w ) {
            this.bsize[0] = ( this.w-(this.spaces[0]*3) ) * 0.5;
            rz = true;
        } else {
            if( this.bsize[0] !== this.bsizeMax ) {
                this.bsize[0] = this.bsizeMax;
                rz = true;
            }
        }

        if( !rz ) return;

        let i = this.buttons.length;
        while(i--) this.buttons[i].style.width = this.bsize[0] + 'px';

    }

    rSize () {

        super.rSize();

        this.testW();

        let mid;

        this.tmpX = [];
        this.tmpY = [];

        for( let j = 0; j < this.grid[0]; j++ ){

            if(j===0){
                mid = ( this.w*0.5 ) - ( this.spaces[0]*0.5 );
                this.tmpX.push( [ mid-this.bsize[0], mid ] );
            } else {
                mid = ( this.w*0.5 ) + ( this.spaces[0]*0.5 );
                this.tmpX.push( [ mid, mid+this.bsize[0] ] );
            }

        }

        mid = this.spaces[1];

        for( let i = 0; i < this.grid[1]; i++ ){

            this.tmpY.push( [ mid, mid + this.bsize[1] ] );
            mid += this.bsize[1] + this.spaces[1];
            
        }

    }

}

class Pad2D extends Proto {

    constructor( o = {} ) {

        super( o );

        this.autoWidth = false;
        this.minw  = this.w;
        this.diam = o.diam || this.w; 

        //this.margin = 15;
        this.pos = new V2(0,0);
        this.maxPos = 90;

        this.model = o.stype || 0;
        if( o.mode !== undefined ) this.model = o.mode;

        this.min = o.min === undefined ? -1 : o.min;
        this.max = o.max === undefined ? 1 : o.max;

        this.range = (this.max - this.min)*0.5;  

        this.cmode = 0;
        this.flipY = o.flipY || false;


        //console.log(this.range)

        this.c[0].style.display = 'block';

        this.precision = o.precision === undefined ? 2 : o.precision;

        /*this.bounds = {};
        this.bounds.x1 = o.x1 || -1;
        this.bounds.x2 = o.x2 || 1;
        this.bounds.y1 = o.y1 || -1;
        this.bounds.y2 = o.y2 || 1;

        this.lerpX = this.lerp( this.margin, this.w - this.margin , this.bounds.x1, this.bounds.x2 );
        this.lerpY = this.lerp( this.margin, this.w - this.margin , this.bounds.y1, this.bounds.y2 );

        this.alerpX = this.lerp( this.bounds.x1, this.bounds.x2, this.margin, this.w - this.margin );
        this.alerpY = this.lerp( this.bounds.y1, this.bounds.y2, this.margin, this.w - this.margin );*/

        this.value = ( Array.isArray( o.value ) && o.value.length == 2 ) ? o.value : [ 0, 0 ];
        
        
        this.h = o.h || this.w + 10;

        this.c[0].style.width = this.w + 'px';

        // Title
        if( this.c[1] !== undefined ) { // with title

            this.c[1].style.width = '100%';
            this.c[1].style.justifyContent = 'center';
            this.top = 10;
            this.h += 10;

        }

        //this.top -= this.margin

        let cc = this.colors;


        // Value
        this.c[2] = this.dom( 'div', this.css.txt + 'justify-content:center; top:'+ ( this.h - 20 ) + 'px; width:100%; color:' + cc.text );
        this.c[2].textContent = this.value;

        // Pad

        let pad = this.getPad2d();

        this.setSvg( pad, 'fill', cc.back, 0 );
        this.setSvg( pad, 'fill', cc.button, 1 );
        this.setSvg( pad, 'stroke', cc.back, 2 );
        this.setSvg( pad, 'stroke', cc.back, 3 );
        this.setSvg( pad, 'stroke', cc.text, 4 );

        //this.setSvg( pad, 'viewBox', '0 0 '+this.diam+' '+this.diam )
        this.setSvg( pad, 'viewBox', '0 0 256 256' );
        this.setCss( pad, { width:this.diam, height:this.diam, left:0, top:this.top });

        this.c[3] = pad;

        this.init();
        this.setValue();

    }
    
    testZone ( e ) {
        
        let l = this.local;

        if( l.x === -1 && l.y === -1 ) return '';



        if( this.c[ 1 ] !== undefined && l.y <= this.c[ 1 ].offsetHeight ) return 'title';
        else if ( l.y > this.h - this.c[ 2 ].offsetHeight ) return 'text';
        else return 'pad';

        /*if( ( l.x >= this.margin ) && ( l.x <= this.w - this.margin ) && ( l.y >= this.top + this.margin ) && ( l.y <= this.top + this.w - this.margin ) ) {
            return 'pad';
        }*/
        
        //return '';

    }

    mouseup ( e ) {

        this.isDown = false;
        this.sendEnd();
        return this.mode(0);

    }

    mousedown ( e ) {

        if ( this.testZone(e) === 'pad' ) {

            this.isDown = true;
            this.mousemove( e );
            return this.mode(1);
        }

    }

    mousemove ( e ) {

        if ( !this.isDown ) {
            if ( this.testZone( e ) === 'pad' ) {
                this.cursor('pointer');
                return this.mode(1);
            }
            this.cursor();
            return this.mode(0);
        }

        //if( !this.isDown ) return;

        let x = (this.w*0.5) - ( e.clientX - this.zone.x );
        let y = (this.diam*0.5) - ( e.clientY - this.zone.y - this.ytop );
        

        let r = 256 / this.diam;

        x = -(x*r);
        y = -(y*r);

        x = Tools.clamp( x, -this.maxPos, this.maxPos );
        y = Tools.clamp( y, -this.maxPos, this.maxPos );

        //let x = e.clientX - this.zone.x;
        //let y = e.clientY - this.zone.y - this.top;

        /*if( x < this.margin ) x = this.margin;
        if( x > this.w - this.margin ) x = this.w - this.margin;
        if( y < this.margin ) y = this.margin;
        if( y > this.w - this.margin ) y = this.w - this.margin;*/

        //console.log(x,y)

        this.setPos( [ x , y ] );
        this.update( true );
        return true;

    }

    reset () {

        this.isDown = false;
        this.cursor();
        return this.mode(0)

    }

    mode ( mode ) {

        if( this.cmode === mode ) return false;

        let cc = this.colors;

        switch( mode ){
            case 0: // base

                this.s[2].color = cc.text;
                this.setSvg( this.c[3], 'fill', cc.back, 0);
                this.setSvg( this.c[3], 'fill', cc.button, 1);
                this.setSvg( this.c[3], 'stroke', cc.back, 2);
                this.setSvg( this.c[3], 'stroke', cc.back, 3);
                this.setSvg( this.c[3], 'stroke', cc.text, 4 );
                
            break;
            case 1: // down

                this.s[2].color = cc.textSelect;
                this.setSvg( this.c[3], 'fill', cc.backoff, 0);
                this.setSvg( this.c[3], 'fill', cc.overoff, 1);
                this.setSvg( this.c[3], 'stroke', cc.backoff, 2);
                this.setSvg( this.c[3], 'stroke', cc.backoff, 3);
                this.setSvg( this.c[3], 'stroke', cc.textSelect, 4 );
                
            break;
        }

        this.cmode = mode;
        return true;



    }

    update ( up ) {

        //if( up === undefined ) up = true;
        
        this.c[2].textContent = this.value;

        this.updateSVG();

        if( up ) this.send();

    }

    updateSVG() {

        if ( this.model == 1 ) {

            this.setSvg( this.c[3], 'y1', this.pos.y, 2 );
            this.setSvg( this.c[3], 'y2', this.pos.y, 2 );

            this.setSvg( this.c[3], 'x1', this.pos.x, 3 );
            this.setSvg( this.c[3], 'x2', this.pos.x, 3 );

        }

        this.setSvg( this.c[3], 'cx', this.pos.x, 4 );
        this.setSvg( this.c[3], 'cy', this.pos.y, 4 );

    }

    setPos ( p ) {

        //if( p === undefined ) p = [ this.w / 2, this.w / 2 ];

        this.pos.set( p[0]+128 , p[1]+128 );

        let r = 1/this.maxPos;
        let m = this.flipY ? 1:-1;

        //this.value[0] = ((p[0]*r)*this.range).toFixed( this.precision );
        //this.value[1] = m * ((p[1]*r)*this.range).toFixed( this.precision );

        this.value[0] = ((p[0] * r) * this.range).toFixed( this.precision ) * 1;
        this.value[1] = m * ((p[1] * r) * this.range).toFixed( this.precision ) * 1;

    }

    setValue ( v, up = false ) {

        if( v === undefined ) v = this.value;

        let m = this.flipY ? 1:-1;

        this.value[0] = Math.min( this.max, Math.max( this.min, v[0] ) ).toFixed( this.precision ) * 1;
        this.value[1] = Math.min( this.max, Math.max( this.min, v[1] ) ).toFixed( this.precision ) * 1;

        this.pos.set( ((this.value[0]/this.range)*this.maxPos)+128  , m*((this.value[1]/this.range)*this.maxPos)+128 );

        this.update( up );

    }

    /*rSize () {
        super.rSize();
        let x = Math.floor( ( this.w - this.diam ) * 0.5 );
        this.s.left = x + 'px';
    }*/

    /*lerp( s1, s2, d1, d2, c = true ) {

        let s = ( d2 - d1 ) / ( s2 - s1 );

        return c ? ( v ) => { 
            return ( ( v < s1 ? s1 : v > s2 ? s2 : v ) - s1 ) * s + d1
        } : ( v ) => { 
          return ( v - s1 ) * s + d1
        }

    }*/

}

class Checker extends Proto {

    constructor( o = {} ) {

        super( o );

        this.wfixe = 128;
        this.hfixe = 85;

        this.ratio = this.hfixe/this.wfixe;

        this.hhh = this.w*this.ratio;

        this.baseH = this.h;
        this.hplus = o.hplus || this.hhh;

        this.c[1].textContent = this.txt;
        this.c[0].style.cursor = 'pointer';
        this.c[0].style.pointerEvents = 'auto';

        this.c[2] = this.getCkecker( this.model );
        this.setSvg( this.c[2], 'viewBox', '0 0 128 85' );
        this.setCss( this.c[2], { width:this.w, height:this.hhh, left:0, top:this.baseH  });
        this.c[2].setAttribute('display', 'none' );

        this.isShow = false;

        this.s;

        this.init();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown ( e ) {

        if( this.isShow ) this.close();
        else this.open();

    }

    open () {

        super.open();

        this.hplus = (this.w*this.ratio);
        this.h = this.hplus + this.baseH;

        if( this.group !== null ){ this.group.calc( this.hplus );}
        else if( this.isUI ) this.main.calc( this.hplus );

        this.s[0].height = this.h +'px';
        this.s[2].display = 'block'; 
        this.isShow = true;

    }

    close () {

        super.close();

        this.h = this.baseH;

        if( this.group !== null ){ this.group.calc( -this.hplus );}
        else if( this.isUI ) this.main.calc( -this.hplus );
        
        this.s[0].height = this.h +'px';
        this.s[2].display = 'none';
        this.isShow = false;
        
    }


    rSize () {

        let s = this.s;
        let w = this.w;

        s[0].width = w + 'px';
        s[1].width = w + 'px';
        s[2].width = w + 'px';
        s[2].height = (w*this.ratio) + 'px';
        
    }
    
}

const add = function () {

        let a = arguments; 

        let type, o, ref = false, n = null;

        if( typeof a[0] === 'string' ){ 

            type = a[0];
            o = a[1] || {};

        } else if ( typeof a[0] === 'object' ){ // like dat gui

            ref = true;
            if( a[2] === undefined ) [].push.call(a, {});
                
            type = a[2].type ? a[2].type : autoType( a[0][a[1]], a[2] );

            o = a[2];
            o.name = a[1];
            if( type === 'list' && !o.list ){ o.list = a[0][a[1]]; }
            else o.value = a[0][a[1]];

        }

        let name = type.toLowerCase();

        if( name === 'group' ) o.add = add;
        
        switch( name ){

            case 'bool': case 'boolean': n = new Bool(o); break;
            case 'button': n = new Button(o); break;
            case 'circular': n = new Circular(o); break;
            case 'color': n = new Color(o); break;
            case 'fps': n = new Fps(o); break;
            case 'graph': n = new Graph(o); break;
            case 'group': n = new Group(o); break;
            case 'joystick': n = new Joystick(o); break;
            case 'knob': n = new Knob(o); break;
            case 'list': n = new List(o); break;
            case 'numeric': case 'number': n = new Numeric(o); break;
            case 'slide': n = new Slide(o); break;
            case 'textInput': case 'string': n = new TextInput(o); break;
            case 'title': case 'text': case 'note': n = new Title(o); break;
            case 'select': n = new Select(o); break;
            case 'bitmap': n = new Bitmap(o); break;
            case 'selector': n = new Selector(o); break;
            case 'empty': case 'space': n = new Empty(o); break;
            case 'item': n = new Item(o); break;
            case 'grid': n = new Grid(o); break;
            case 'pad2d': case 'pad': n = new Pad2D(o); break;
            case 'checker': n = new Checker(o); break;

        }

        if( n !== null ){

            Roots.needResize = true;
            if( ref ) n.setReferency( a[0], a[1] );
            return n;

        }

};

const autoType = function ( v, o ) {

    let type = 'slide';

    if( v.isColor ) type = 'color';
    else if( v.isTexture ) type = 'bitmap';
    else {
        if( typeof v === 'boolean' ) type = 'bool'; 
        else if( typeof v === 'string' ){ 
            if( v.substring(0,1) === '#' ) type = 'color';
            else type = 'string'; 
        } else if( typeof v === 'number' ){ 
            if( o.ctype ) type = 'color';
            else type = 'slide';
        } else if( typeof v === 'array' && v instanceof Array ){
            if( typeof v[0] === 'number' ) type = 'number';
            else if( typeof v[0] === 'string' ) type = 'list';
        } else if( typeof v === 'object' && v instanceof Object ){
            if( v.x !== undefined ) type = 'number';
            else type = 'list';
        }
    }

    return type

};

/**
 * @author lth / https://github.com/lo-th
 */

class Gui {

    constructor( o = {} ) {

        this.isGui = true;

        this.name = 'gui';

        // for 3d
        this.canvas = null;
        this.screen = null;
        this.plane = o.plane || null;

        

        // color
        if( o.config ) o.colors = o.config;
        if ( o.colors ) this.setConfig( o.colors );
        else this.colors = Tools.defineColor( o );

        //this.cleanning = false
        

        // style
        this.css = Tools.cloneCss();

        this.isReset = true;
        this.tmpAdd = null;
        //this.tmpH = 0

        this.isCanvas = o.isCanvas || false;
        this.isCanvasOnly = false;
        this.canvasScale = o.canvasScale || 1;
        
        this.callback = o.callback  === undefined ? null : o.callback;
        this.endCallback = o.endCallback  === undefined ? null : o.endCallback;

        this.autoShow = o.autoShow  === undefined ? true : o.autoShow;

        this.forceHeight = o.maxHeight || 0;
        this.lockHeight = o.lockHeight || false;

        this.isItemMode = o.itemMode !== undefined ? o.itemMode : false;

        this.cn = '';
        
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

        this.margin = this.colors.sy;
        this.marginDiv = Tools.isDivid( this.margin );

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
        this.prevOpen = this.isOpen;
        this.isTransitionInit = false;
        this.isDown = false;
        this.isScroll = false;

        this.uis = [];
        this.current = -1;
        this.proto = null;
        this.isEmpty = true;
        this.decal = 0;
        this.ratio = 1;
        this.oy = 0;

        this.isNewTarget = false;

        let cc = this.colors;

        let border = 'border: 2px solid ' + cc.content + '; ';
        //let border = 'border-left: 2px solid ' + cc.content + '; border-right: 2px solid ' + cc.content + '; ';

        this.content = Tools.dom( 'div', this.css.basic + ' width:0px; height:auto; top:0px; background:'+cc.content+'; ' + this.cssGui + border );
        
        this.innerContent = Tools.dom( 'div', this.css.basic + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
        //this.innerContent = Tools.dom( 'div', this.css.basic + this.css.button + 'width:100%; top:0; left:0; height:auto; overflow:hidden;');
        this.content.appendChild( this.innerContent );

        //this.inner = Tools.dom( 'div', this.css.basic + 'width:100%; left:0; ')
        this.useFlex = true; 
        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : ''; //' display:flex; justify-content:start; align-items:start;flex-direction: column; justify-content: center; align-items: center;';
        this.inner = Tools.dom( 'div', this.css.basic + flexible + 'width:100%; left:0; ');
        this.innerContent.appendChild(this.inner);

        this.isScrollDown = false;
        this.scrollOffset = 0;

        // scroll
        let sw = this.size.s;
        let r = cc.radius;
        this.scrollBG = Tools.dom( 'div', this.css.basic + 'right:0; top:0; width:' + sw + 'px; height:10px; display:none; background:' + cc.content + '; border-left:1px solid ' + cc.background + ';' );
        this.content.appendChild( this.scrollBG );

        this.scroll = Tools.dom( 'div', this.css.basic + 'background:' + cc.text + '; left:2px; top:0; width:' + (sw - 4) + 'px; height:10px; border-radius:' + Math.max(2, r) + 'px;' );
        this.scrollBG.appendChild( this.scroll );

        // bottom button
        this.bottomText = o.bottomText || ['open', 'close'];

        
        this.bottom = Tools.dom( 'div',  this.css.txt + 'width:100%; top:auto; bottom:0; left:0; border-bottom-right-radius:'+r+'px; border-bottom-left-radius:'+r+'px; justify-content:center; height:'+this.bh+'px; line-height:'+(this.bh-5)+'px; color:' + cc.text+';' );// border-top:1px solid '+Tools.colors.stroke+';');
        this.content.appendChild( this.bottom );
        this.bottom.textContent = this.isOpen ? this.bottomText[1] : this.bottomText[0];
        this.bottom.style.background = cc.background;
        if(this.bh===0) this.bottom.style.visibility = 'hidden'; 

        if ( this.isTopClose ) {

            const bSize = this.th - 4; // Taille intérieure du bouton (sans la bordure de 2px)
            const sSize = bSize - 8;   // Marge exacte de 4px de chaque côté

            this.iconOpen  = `<svg width="${sSize}" height="${sSize}" viewBox="0 0 16 16"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="2.2"/></svg>`;
            this.iconClose = `<svg width="${sSize}" height="${sSize}" viewBox="0 0 16 16"><path d="M1 3 H15 M1 8 H15 M1 13 H15" stroke="currentColor" stroke-width="2.2"/></svg>`;

            const sideCss = this.retractSide === 'left' ? 'left:0; right:auto; z-index:2;' : 'right:0; left:auto; z-index:2;';
            this.topBtn = Tools.dom( 'div', this.css.txt + sideCss + ' top:0; padding:0; display:flex; align-items:center; justify-content:center; width:' + bSize + 'px; height:' + bSize + 'px; background:' + cc.background + '; color:' + cc.text + ';' );

            //this.topBtn.textContent = this.isOpen ? '⛌' : '☰';
            this.topBtn.innerHTML = this.isOpen ? this.iconOpen : this.iconClose;
            this.content.appendChild( this.topBtn );
        }

        //

        this.parent = o.parent !== undefined ? o.parent : null;
        this.parent = o.target !== undefined ? o.target : this.parent;
        
        if( this.parent === null && !this.isCanvas ){ 
        	this.parent = document.body;
        }

        if( this.parent !== null ) this.parent.appendChild( this.content );

        if( this.isCanvas && this.parent === null ) this.isCanvasOnly = true;

        if( !this.isCanvasOnly ){ 
            this.content.style.pointerEvents = 'auto';
        } else {
            this.content.style.left = '0px';
            this.content.style.right = 'auto';
            o.transition = 0;
        }


        // height transition
        this.transition = o.transition!==undefined? o.transition : Tools.transition;
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
            this.isTransitionInit = true;
            this.innerContent.style.transition = 'height ' + this.transition + 's ease-out, opacity 0.15s ease-out';
            this.content.style.transition = 'height ' + this.transition + 's ease-out, width ' + this.transition + 's ease-out, margin-left ' + this.transition + 's ease-out, margin-right ' + this.transition + 's ease-out';
            this.bottom.style.transition = 'top ' + this.transition + 's ease-out';

            this.content.addEventListener( 'transitionend', ( e ) => {
                if ( e.target !== this.content ) return;
                Roots.needReZone = true;
                if ( this.isTopClose && this.isOpen ) {
                    this.innerContent.style.visibility = 'visible';
                    this.innerContent.style.opacity = '1';
                }
            }, { passive: true } );
        }

        let i = this.uis.length;
        while( i-- ) this.uis[i].addTransition();

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
        Tools.setText();
        this.colors = Tools.defineColor( o );

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
        this.content.style.visibility = v ? 'visible' : 'hidden';
    }

    // ----------------------
    //   CALLBACK
    // ----------------------

    onChange ( f ) {

        this.callback = f || null;
        return this;

    }

    onFinishChange( f ) {

        this.callback = null;
        this.endCallback = f;
        return this

    }

    onEnd( f ) { return this.onFinishChange(f); }

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
	    		   this.scroll.style.background = cc.text; 
	    		   this.bottom.style.background = cc.background;
	    		   this.bottom.style.color = cc.text;
                   if ( this.topBtn ) {
                        this.topBtn.style.background = cc.background;
                        this.topBtn.style.color = cc.text;
                    }
	    		break;

	    		case 'scrollOver': 
                    Roots.cursor('ns-resize');
                    this.scroll.style.background = cc.select;
                break;
	    		case 'scrollDown': 
                    this.scroll.style.background = cc.select;
                break;

	    		case 'bottomOver': 
                    Roots.cursor('pointer');
                    this.bottom.style.background = cc.backgroundOver; 
                    this.bottom.style.color = cc.textOver; 
                break;

                case 'topOver':
                    Roots.cursor('pointer');
                    if ( this.topBtn ) {
                        this.topBtn.style.background = cc.select;//backgroundOver;
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

        if ( this.isTopClose && l.y < this.th ) {
            if ( this.retractSide === 'left' ? l.x < this.th : l.x > this.zone.w - this.th ) return 'top';
        }

        //if ( this.isTopClose && l.y < this.th && l.x > this.zone.w - this.th ) return 'top';
        if ( l.y > this.zone.h - this.bh && l.y < this.zone.h ) name = 'bottom';
        else name = l.x > s ? 'scroll' : 'content';
        
        //if( l.y > this.zone.h - this.bh &&  l.y < this.zone.h ) name = 'bottom';
        //else name = l.x > s ? 'scroll' : 'content';

        return name;

    }

    // ----------------------
    //   CUSTOM EVENTS
    // ----------------------

    _computeXY(u, v, flipY) {
        const x = this.zone.x + Math.round(u * this.zone.w);
        const y = this.zone.y + Math.round((flipY ? 1 - v : v) * this.zone.h);
        if (isNaN(x) || isNaN(y)) {
            console.warn("Gui._computeXY: invalid coordinates", u, v);
            return null;
        }
        return { x, y };
    }

    removeEvents(){
        if ( Roots.isEventsInit ) Roots.removeEvents();
    }

    triggerMouseUV( type, u, v, flipY = true ){

        // type can be "down", "up", "move"

        const etype = 'pointer' + type;

        const coords = this._computeXY(u, v, flipY);

        Roots.handleEvent({

            type: etype,
            clientX: coords.x,
            clientY: coords.y,
            delta: 0,
            key: null,
            keyCode: NaN,

        });
    
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

	    		if( this.proto ) protoChange = this.proto.handleEvent( e );

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

        let a = arguments;
        let ontop = false;

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
                ontop = a[2].ontop ? a[2].ontop : false;
            }
            
        } 

        let u = add.apply( this, a );

        if( u === null ) return;

        if( ontop ) this.uis.unshift( u );
        else this.uis.push( u );

        this.calc();

        this.isEmpty = false;

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
            this.calc(); 
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

        this.empty();

    }

    clear2() {

        setTimeout( this.empty.bind(this), 0 );

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
        while(i--) this.uis[i].selected();

    }

    setItem ( name ) {

        if( !this.isItemMode ) return;

        name = name || '';
        this.resetItem();

        if( !name ){
            this.update(0);
            return
        } 

        let i = this.uis.length;
        while(i--){ 
            if( this.uis[i].value === name ){ 
                this.uis[i].selected( true );
                if( this.isScroll ) this.update( ( i*(this.uis[i].h+this.margin) )*this.ratio );
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

        this.setItemWidth( this.zone.w - this.sw );
        this.update( this.oy );

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

            const stateChanged = this.isOpen !== this.prevOpen;
            this.prevOpen = this.isOpen;

            if ( stateChanged && this.isTransitionInit && !this.isCanvas ) {
                // Masque instantanément pendant l'animation de pliage/dépliage
                this.innerContent.style.visibility = 'hidden';
                this.innerContent.style.opacity = '0';
            } else {
                // Affichage immédiat au démarrage ou lors d'un simple resize
                this.innerContent.style.visibility = this.isOpen ? 'visible' : 'hidden';
                this.innerContent.style.opacity = this.isOpen ? '1' : '0';
            }

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

        /*if ( this.isTopClose ) {
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
        }*/

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
            this.uis[i].setSize( w );
            this.uis[i].rSize();
        }

    }

}

var Uil = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Files: Files,
    Gui: Gui,
    REVISION: REVISION,
    Tools: Tools,
    add: add
});

export { Files, Gui, REVISION, Tools, Uil as UIL, add };
