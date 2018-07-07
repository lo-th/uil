
import { Roots } from './Roots';
import { Tools } from './Tools';
import { V2 } from './V2';

/**
 * @author lth / https://github.com/lo-th
 */

function Proto ( o ) {

    o = o || {};

    this.css = Tools.css;
    this.colors = Tools.colors;
    this.svgs = Tools.svgs;

    this.zone = { x:0, y:0, w:0, h:0 };
    this.local = new V2().neg();

    this.isCanvasOnly = false;

    // if is on gui or group
    this.main = o.main || null;
    this.isUI = o.isUI || false;
    this.parentGroup = null;

    // percent of title
    this.p = o.p !== undefined ? o.p : Tools.size.p;

    this.w = this.isUI ? this.main.size.w : Tools.size.w;
    if( o.w !== undefined ) this.w = o.w;

    this.h = this.isUI ? this.main.size.h : Tools.size.h;
    if( o.h !== undefined ) this.h = o.h;
    this.h = this.h < 11 ? 11 : this.h;

    // if need resize width
    this.autoWidth = o.auto || true;

    // open statu
    this.isOpen = false;

    // radius for toolbox
    this.radius = o.radius || 0;

    // only for number
    this.isNumber = false;

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
    if(o.sa !== undefined ) this.sa = o.sa;
    if(o.sb !== undefined ) this.sb = o.sb;

    if( this.simple ) this.sb = this.w - this.sa;

    // last number size for slide
    this.sc = o.sc === undefined ? 47 : o.sc;

    // for listening object
    this.objectLink = null;
    this.isSend = false;
    this.val = null;
    
    // Background
    this.bg = this.isUI ? this.main.bg : Tools.colors.background;
    this.bgOver = Tools.colors.backgroundOver;
    if( o.bg !== undefined ){ this.bg = o.bg; this.bgOver = o.bg; }
    if( o.bgOver !== undefined ){ this.bgOver = o.bgOver; }

    // Font Color;
    this.titleColor = o.titleColor || Tools.colors.text;
    this.fontColor = o.fontColor || Tools.colors.text;
    
    if( o.color !== undefined ){ 
        if( !isNaN(o.color) ) this.fontColor = Tools.hexToHtml(o.color);
        else this.fontColor = o.color;
        this.titleColor = this.fontColor;
    }

    this.colorPlus = Tools.ColorLuma( this.fontColor, 0.3 );

    this.txt = o.name || 'Proto';
    this.rename = o.rename || '';
    this.target = o.target || null;

    this.callback = o.callback === undefined ? null : o.callback;
    this.endCallback = null;

    if( this.callback === null && this.isUI && this.main.callback !== null ) this.callback = this.main.callback;

    // elements
    this.c = [];

    // style 
    this.s = [];

    this.c[0] = Tools.dom( 'div', Tools.css.basic + 'position:relative; height:20px; float:left; overflow:hidden;');
    this.s[0] = this.c[0].style;

    if( this.isUI ) this.s[0].marginBottom = '1px';

    // with title
    if( !this.simple ){ 
        this.c[1] = Tools.dom( 'div', Tools.css.txt );
        this.s[1] = this.c[1].style;
        this.c[1].textContent = this.rename === '' ? this.txt : this.rename;
        this.s[1].color = this.titleColor;
    }

    if( o.pos ){
        this.s[0].position = 'absolute';
        for(var p in o.pos){
            this.s[0][p] = o.pos[p];
        }
        this.mono = true;
    }

    if( o.css ) this.s[0].cssText = o.css; 
    

}

Object.assign( Proto.prototype, {

    constructor: Proto,

    // ----------------------
    // make de node
    // ----------------------
    
    init: function () {

        var s = this.s; // style cache
        var c = this.c; // div cache

        s[0].height = this.h + 'px';
        this.zone.h = this.h;

        if( this.isUI ) s[0].background = this.bg;

        //if( this.autoHeight ) s[0].transition = 'height 0.01s ease-out';
        if( c[1] !== undefined && this.autoWidth ){
            s[1] = c[1].style;
            s[1].height = (this.h-4) + 'px';
            s[1].lineHeight = (this.h-8) + 'px';
        }

        var frag = Tools.frag;

        for( var i = 1, lng = c.length; i !== lng; i++ ){
            if( c[i] !== undefined ) {
                frag.appendChild( c[i] );
                s[i] = c[i].style;
            }
        }

        if( this.target !== null ){ 
            this.target.appendChild( c[0] );
        } else {
            if( this.isUI ) this.main.inner.appendChild( c[0] );
            else document.body.appendChild( c[0] );
        }

        c[0].appendChild( frag );

        this.rSize();

        // ! solo proto
        if( !this.isUI ){

            this.c[0].style.pointerEvents = 'auto';
            Roots.add( this );
            
        }

    },

    // TRANS FUNCTIONS from Tools

    dom: function ( type, css, obj, dom, id ) {

        return Tools.dom( type, css, obj, dom, id );

    },

    setSvg: function ( dom, type, value, id ) {

        Tools.setSvg( dom, type, value, id );

    },

    setCss: function ( dom, css ) {

        Tools.setCss( dom, css );

    },

    clamp: function ( value, min, max ) {

        return Tools.clamp( value, min, max );

    },

    getColorRing: function () {

        if( !Tools.colorRing ) Tools.makeColorRing();
        return Tools.clone( Tools.colorRing );

    },

    getJoystick: function ( model ) {

        if( !Tools[ 'joystick_'+ model ] ) Tools.makeJoystick( model );
        return Tools.clone( Tools[ 'joystick_'+ model ] );

    },

    getCircular: function ( model ) {

        if( !Tools.circular ) Tools.makeCircular( model );
        return Tools.clone( Tools.circular );

    },

    getKnob: function ( model ) {

        if( !Tools.knob ) Tools.makeKnob( model );
        return Tools.clone( Tools.knob );

    },

    /*getGraph: function () {

         if( !Tools.graph ) Tools.makeGraph();
         return Tools.clone( Tools.graph );

    },*/

    // TRANS FUNCTIONS from Roots

    cursor: function ( name ) {

         Roots.cursor( name );

    },

    setInput: function ( Input, Callback ) {

        Roots.setInput( Input, Callback, Tools.colors.input );

    },

    /////////

    update: function () {},

    reset:  function () {},

    /////////

    getDom: function () {

        return this.c[0];

    },

    uiout: function () {

        this.s[0].background = this.bg;

    },

    uiover: function () {

        this.s[0].background = this.bgOver;

    },

    rename: function ( s ) {

        if( this.c[1] !== undefined) this.c[1].textContent = s;

    },

    listen: function () {

        Roots.addListen( this );
        //Roots.listens.push( this );
        return this;

    },

    listening: function () {

        if( this.objectLink === null ) return;
        if( this.isSend ) return;
        if( this.isEdit ) return;

        this.setValue( this.objectLink[ this.val ] );

    },

    setValue: function ( v ) {

        if( this.isNumber ) this.value = this.numValue( v );
        else this.value = v;
        this.update();

    },


    // ----------------------
    // update every change
    // ----------------------

    onChange: function ( f ) {

        this.callback = f;
        return this;

    },

    // ----------------------
    // update only on end
    // ----------------------

    onFinishChange: function ( f ) {

        this.callback = null;
        this.endCallback = f;
        return this;

    },

    send: function ( v ) {

        this.isSend = true;
        if( this.objectLink !== null ) this.objectLink[ this.val ] = v || this.value;
        if( this.callback ) this.callback( v || this.value );
        this.isSend = false;

    },

    sendEnd: function ( v ) {

        if( this.endCallback ) this.endCallback( v || this.value );
        if( this.objectLink !== null ) this.objectLink[ this.val ] = v || this.value;

    },

    // ----------------------
    // clear node
    // ----------------------
    
    clear: function () {

        Tools.clear( this.c[0] );

        if( this.target !== null ){ 
            this.target.removeChild( this.c[0] );
        } else {
            if( this.isUI ) this.main.clearOne( this );
            else document.body.removeChild( this.c[0] );
        }

        if( !this.isUI ) Roots.remove( this );

        this.c = null;
        this.s = null;
        this.callback = null;
        this.target = null;

    },

    // ----------------------
    // change size 
    // ----------------------

    setSize: function ( sx ) {

        if( !this.autoWidth ) return;

        this.w = sx;

        if( this.simple ){
            //this.sa = 0;
            this.sb = this.w - this.sa;
        } else {
            var pp = this.w * ( this.p / 100 );
            this.sa = Math.floor( pp + 10 );
            this.sb = Math.floor( this.w - pp - 20 );
        }

    },

    rSize: function () {

        if( !this.autoWidth ) return;
        this.s[0].width = this.w + 'px';
        if( !this.simple ) this.s[1].width = this.sa + 'px';
    
    },

    // ----------------------
    // for numeric value
    // ----------------------

    setTypeNumber: function ( o ) {

        this.isNumber = true;

        this.value = 0;
        if(o.value !== undefined){
            if( typeof o.value === 'string' ) this.value = o.value * 1;
            else this.value = o.value;
        }

        this.min = o.min === undefined ? -Infinity : o.min;
        this.max = o.max === undefined ?  Infinity : o.max;
        this.precision = o.precision === undefined ? 2 : o.precision;

        var s;

        switch(this.precision){
            case 0: s = 1; break;
            case 1: s = 0.1; break;
            case 2: s = 0.01; break;
            case 3: s = 0.001; break;
            case 4: s = 0.0001; break;
        }

        this.step = o.step === undefined ?  s : o.step;
        this.range = this.max - this.min;
        this.value = this.numValue( this.value );
        
    },

    numValue: function ( n ) {

        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision ) * 1;

    },


    // ----------------------
    //   EVENTS DEFAULT
    // ----------------------

    handleEvent: function ( e ){

        return this[e.type](e);
    
    },

    wheel: function ( e ) { return false; },

    mousedown: function( e ) { return false; },

    mousemove: function( e ) { return false; },

    mouseup: function( e ) { return false; },

    keydown: function( e ) { return false; },


    // ----------------------
    // object referency
    // ----------------------

    setReferency: function ( obj, val ) {

        this.objectLink = obj;
        this.val = val;

    },

    display: function ( v ) {
        
        v = v || false;
        this.s[0].display = v ? 'block' : 'none';
        //this.isReady = v ? false : true;

    },

    // ----------------------
    // resize height 
    // ----------------------

    open: function () {

        if( this.isOpen ) return;
        this.isOpen = true;

    },

    close: function () {

        if( !this.isOpen ) return;
        this.isOpen = false;

    },

    needZone: function () {

        Roots.needReZone = true;

    },


} );

export { Proto };