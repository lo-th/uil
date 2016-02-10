/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2016
*    @author lo.th / https://github.com/lo-th
*/

'use strict';

var Crea = Crea || ( function () {

    var doc = document;
    var head = doc.getElementsByTagName('head')[0];

    var DOM_SIZE = [ 'height', 'width', 'top', 'left', 'bottom', 'right', 'margin-left', 'margin-right', 'margin-top', 'margin-bottom'];
    var SVG_TYPE = [ 'rect', 'circle', 'path', 'polygon', 'text', 'pattern', 'defs', 'g', 'transform',, 'line', 'foreignObject', 'linearGradient', 'stop', 'animate', 'radialGradient' ];
    //var SVG_TYPE_G = [ 'rect', 'circle', 'path', 'polygon', 'text', 'g', 'line', 'foreignObject' ];

    var svgns = "http://www.w3.org/2000/svg";
    var htmls = "http://www.w3.org/1999/xhtml";

    //var matrix = document.createElementNS("http://www.w3.org/2000/svg", "svg");//.createSVGMatrix();
    //console.log(matrix)
        

    Crea = function () {};

    Crea.setSvg = function( dom, type, value, id ){

        if( id === -1 ) dom.setAttributeNS( null, type, value );
        else dom.childNodes[ id || 0 ].setAttributeNS( null, type, value );

    };

    Crea.setDom = function( dom, type, value ){

        var ext = DOM_SIZE.indexOf(type) !== -1 ? 'px' : '';
        dom.style[type] = value + ext;

    };

    Crea.clearDom = function( dom ){

        while ( dom.children.length ){

            if( dom.lastChild.children ) while ( dom.lastChild.children.length ) dom.lastChild.removeChild( dom.lastChild.lastChild );
            dom.removeChild( dom.lastChild );

        }

    };

    // DOM CREATOR

    Crea.dom = function ( Class, type, css, obj, dom, id ) {

        type = type || 'div';

        if( SVG_TYPE.indexOf(type) !== -1 ){ // is svg element

            // create new svg if not def
            if( dom === undefined ) dom = doc.createElementNS( svgns, 'svg' );

            Crea.add( dom, type, obj, id );

            // create the element 
            /*var g = doc.createElementNS( svgns, type );

            // add attributes
            for(var att in obj){

                if( att === 'txt' ) g.textContent = obj[ att ];
                else g.setAttributeNS( null, att, obj[ att ] );

            }

            if( SVG_TYPE_G.indexOf(type) !== -1 && id === undefined  ) g.setAttributeNS( null, 'pointer-events', 'none' );

            if( id === undefined ) dom.appendChild( g );
            else dom.childNodes[ id || 0 ].appendChild( g );*/

            
        } else { // is html element

            if( dom === undefined ) dom = doc.createElementNS( htmls, type );//doc.createElement( type );

        }


        if( Class ) dom.setAttribute( 'class', Class );
        if( css ) dom.style.cssText = css; 

        if( id === undefined ) return dom;
        else return dom.childNodes[ id || 0 ];

    };

    // ROOT CLASS DEFINITION

    Crea.cc = function ( name, rules, noAdd ) {

        var adds = noAdd === undefined ? '.' : '';
        
        if( name === '*' ) adds = '';

        var style = doc.createElement( 'style' );
        style.setAttribute( 'type', 'text/css' );
        style.setAttribute( 'id', name );

        head.appendChild(style);

        if( !(style.sheet || {} ).insertRule ) ( style.styleSheet || style.sheet ).addRule(adds+name, rules);
        else style.sheet.insertRule( adds + name + "{" + rules + "}" , 0 );

    };

    // SVG SIDE

    Crea.add = function( dom, type, o, id ){ // add attributes

        var g = document.createElementNS( svgns, type );

        this.set( g, o );
        this.get( dom, id ).appendChild( g );

        return g;

    };

    Crea.set = function( g, o ){

        for( var att in o ){
            if( att === 'txt' ) g.textContent = o[ att ];
            g.setAttributeNS( null, att, o[ att ] );
        }

        // only root can have mouse event
        //g.setAttributeNS( null, 'pointer-events', 'none' );
        g.style.pointerEvents = 'none';

    };

    Crea.get = function( dom, id ){

        if( id === undefined ) return dom; // root
        else if(!isNaN( id )) return dom.childNodes[ id ]; // first child
        else if( id instanceof Array ){
            if(id.length === 2) return dom.childNodes[ id[0] ].childNodes[ id[1] ];
            if(id.length === 3) return dom.childNodes[ id[0] ].childNodes[ id[1] ].childNodes[ id[2] ];
        }

    };

    return Crea;

})();
/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_| 2015
*    @author lo.th / http://lo-th.github.io/labs/
*/

'use strict';

var define, module, exports;

//var Crea = Crea || {};

var UIL = ( function () {

    UIL = function () {};

    UIL.main = null;
    UIL.REVISION =  '0.9';
    UIL.DEF = false;
    UIL.WIDTH = 300;
    UIL.BW = 190;
    UIL.AW = 100;

    UIL.UNS = '-o-user-select:none; -ms-user-select:none; -khtml-user-select:none; -webkit-user-select:none; -moz-user-select:none;';
    UIL.US = '-o-user-select:text; -ms-user-select:text; -khtml-user-select:text; -webkit-user-select:text; -moz-user-select:text;';
    UIL.TXT = 'font-family:"Lucida Console", Monaco, monospace; font-size:11px; color:#cccccc; background:none; padding:3px 10px; left:0; top:0; height:17px; width:100px; overflow:hidden; white-space: nowrap;';

    UIL.DOM = Crea.dom;
    UIL.CC = Crea.cc;
        //setDom : Crea.setDom,
    UIL.setSvg = Crea.setSvg;


    UIL.COLOR = 'N';
    UIL.SELECT = '#035fcf';
    UIL.MOVING = '#03afff';
    UIL.SELECTDOWN = '#024699';
    UIL.SVGB = 'rgba(0,0,0,0.2)';
    UIL.SVGC = 'rgba(120,120,120,0.6)';
    UIL.BorderSelect = 'rgba(3,95,207,0.6)';

    UIL.sizer = function(w){

        this.WIDTH = ~~ w;
        var s = this.WIDTH/3;
        this.BW = ~~ ((s*2)-10);
        this.AW = ~~ s;

        if(this.main) this.main.changeWidth();

    };

    UIL.classDefine = function(){
            
        UIL.CC('UIL', UIL.UNS + ' position:absolute; pointer-events:none; box-sizing:border-box; margin:0; padding:0; border:none; ');

        UIL.CC('UIL.content', ' display:block; width:300px; height:auto; top:0; left:0; overflow:hidden; background:none; transition:height, 0.1s ease-out;');
        UIL.CC('UIL.inner', 'width:100%; top:0; left:0; height:auto; overflow:hidden; background:none; ');
        UIL.CC('UIL.bottom', UIL.TXT+'width:100%; top:auto; bottom:0; left:0; height:20px; overflow:hidden; background:none; text-align:center; padding:5px 10px; pointer-events:auto; cursor:pointer;' );

        UIL.CC('UIL.base', 'position:relative; height:20px; overflow:hidden; float: left');

        UIL.CC('UIL.text', UIL.TXT );
        UIL.CC('UIL.textSelect', UIL.TXT + UIL.US + 'outline:none; -webkit-appearance:none; -moz-appearance:none; border:1px solid rgba(255,255,255,0.1);' );

        UIL.CC('UIL.list', 'box-sizing:content-box; border:20px solid transparent; border-bottom:10px solid transparent; left:80px; top:0px; width:190px; height:90px; overflow:hidden; cursor:s-resize; pointer-events:auto; display:none;');
        UIL.CC('UIL.list-in', 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2); ');
        UIL.CC('UIL.listItem', 'position:relative; height:18px; background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(0,0,0,0.2); pointer-events:auto; cursor:pointer;'+UIL.TXT);
        UIL.CC('UIL.listItem:hover', 'background:'+UIL.SELECT+'; color:#FFFFFF;')

        UIL.CC('UIL.scroll-bg', 'cursor:w-resize; pointer-events:auto; background-image:linear-gradient(to right,  rgba(255,255,255,0), rgba(255,255,255,0.1));');
        UIL.CC('UIL.scroll', ' background:rgba(255,255,255,0.2);');
        UIL.CC('UIL.svgbox', 'left:100px; top:1px; width:190px; height:17px; pointer-events:auto; cursor:pointer;');

        UIL.DEF = true;
    };

    UIL.bgcolor = function(p, a){
        var r=48, g=48, b=48;
        a = a || 0.66;
        if(p){
            switch(p){
                case 'r': case 'R': case 'S': r=160; b=68; break;
                case 'g': case 'G': case 'E': g=120; b=68; break;
                case 'b': case 'B': case 'T': b=120; g=68; break;
                case 'no': case 'NO': a=0; break;
            }
        }
        var color = 'rgba('+r+','+g+','+b+','+a+')';
        if(a === 0) color = 'none';
        return color;
    };

    UIL.classDefine();

    return UIL;

})();


//UIL.classDefine();

// UMD (Universal Module Definition)

( function ( root ) {
    if ( typeof define === 'function' && define.amd ) {// AMD
        define( 'uil', UIL );
        //define( [], function () { return UIL; } );
    } else if ( 'undefined' !== typeof exports && 'undefined' !== typeof module ) {// else if ( typeof exports === 'object' ) { // Node.js
        module.exports = UIL;
    } else {// Global variable
        root.UIL = UIL;
    }
})(this);

UIL.Gui = function(css, w, center, color){

    UIL.sizer( w || 300 );

    this.width = UIL.WIDTH;

    UIL.main = this;

    this.color = color || UIL.COLOR;
    
    this.isCenter = center || false;
    this.lockwheel = false;
    this.isOpen = true;

    this.uis = [];

    this.content = UIL.DOM('UIL content', 'div', css);
    document.body.appendChild( this.content );

    this.inner = UIL.DOM('UIL inner');
    this.content.appendChild(this.inner);
    this.inner.name = 'inner';

    
    
    this.scrollBG = UIL.DOM('UIL scroll-bg', 'div', 'right:0; top:0; width:10px; height:10px; cursor:s-resize; display:none; ');
    this.content.appendChild(this.scrollBG);
    this.scrollBG.name = 'scroll';

    this.scroll = UIL.DOM('UIL scroll', 'div', 'left:4px; top:0; width:3px; height:10px;  ');
    this.scrollBG.appendChild( this.scroll );

    this.bottom = UIL.DOM('UIL bottom');
    this.content.appendChild(this.bottom);
    this.bottom.textContent = 'close';
    this.bottom.name = 'bottom';
    this.bottom.style.background = UIL.bgcolor( this.color );

    this.changeWidth();

    this.isDown = false;
    this.isScroll = false;

    this.content.addEventListener( 'mousedown', this, false );
    this.content.addEventListener( 'mousemove', this, false );
    this.content.addEventListener( 'mouseout',  this, false );
    this.content.addEventListener( 'mouseup',   this, false );
    this.content.addEventListener( 'mouseover', this, false );
    //this.content.addEventListener( 'mousewheel', this, false );

    document.addEventListener( 'mousewheel', this, false );
    
    window.addEventListener("resize", function(e){this.resize(e)}.bind(this), false );

    this.resize();
}

UIL.Gui.prototype = {
    constructor: UIL.Gui,

    handleEvent : function( e ) {

        //e.preventDefault();
        //e.stopPropagation();

        switch( e.type ) {
            case 'mousedown': this.down( e ); break;
            case 'mouseout': this.out( e ); break;
            case 'mouseover': this.over( e ); break;
            case 'mousewheel': this.wheel( e ); break;

            case 'mouseup': this.up( e ); break;
            case 'mousemove': this.move( e ); break;
        }

    },

    

    ////

    down: function( e ){

        if( !e.target.name ) return;

        if(e.target.name === 'scroll'){
            this.isDown = true;
            this.move( e );
            //UIL.setSvg(this.scroll, 'fill','#FFF');

            this.scroll.style.background = 'rgba(255,255,255,0.75)';

            document.addEventListener( 'mouseup', this, false );
            document.addEventListener( 'mousemove', this, false );

        }
        if(e.target.name === 'bottom'){

            this.isOpen = this.isOpen ? false : true;

            this.show();
            //this.calc();

        }
        
    },

    move: function( e ){

        if(!this.isDown) return;

        this.scroll.style.background = 'rgba(255,255,255,0.75)';

        this.update( (e.clientY-this.top)-(this.sh*0.5) );

    },

    

    out: function( e ){

        if( !e.target.name ) return;

        if(e.target.name === 'scroll'){
            this.scroll.style.background = 'rgba(255,255,255,0.2)';
        }

    },

    up: function( e ){

        this.isDown = false;
        this.scroll.style.background = 'rgba(255,255,255,0.2)';
        document.removeEventListener( 'mouseup', this, false );
        document.removeEventListener( 'mousemove', this, false );

    },

    over: function( e ){

        if( !e.target.name ) return;
        if(e.target.name === 'scroll'){
            this.scroll.style.background = 'rgba(255,255,255,0.5)';
        }

    },

    wheel: function ( e ){

        if( this.lockwheel ) return;
        if( !this.isScroll ) return;

        var x = e.clientX;
        var px = this.content.getBoundingClientRect().left

        if(x<px) return;
        if(x>(px+this.width)) return;

        var delta = 0;
        if(e.wheelDeltaY) delta= -e.wheelDeltaY*0.04;
        else if(e.wheelDelta) delta= -e.wheelDelta*0.2;
        else if(e.detail) delta=e.detail*4.0;

        this.py += delta;

        this.update(this.py);

    },

    ////

    update: function ( y ){

        y = y < 0 ? 0 :y;
        y = y > this.range ? this.range : y;

        this.inner.style.top = -(y/this.ratio)+'px';
        this.scroll.style.top = y + 'px';

        this.py = y;

    },

    ////

    add:function( type, o ){
        
        o.isUI = true;
        var n;
        switch(type){
            case 'button': n = new UIL.Button(o); break;
            case 'string': n = new UIL.String(o); break;
            case 'number': n = new UIL.Number(o); break;
            case 'title':  n = new UIL.Title(o);  break;
            case 'color':  n = new UIL.Color(o);  break;
            case 'slide':  n = new UIL.Slide(o);  break;
            case 'bool':   n = new UIL.Bool(o);   break;
            case 'list':   n = new UIL.List(o);   break;
            case 'group':  n = new UIL.Group(o);  break;
            case 'knob':   n = new UIL.Knob(o);   break;
            case 'circular':n = new UIL.Circular(o);   break;
            case 'joystick':n = new UIL.Joystick(o);   break;
        }
        this.uis.push(n);
        this.calc();
        return n;
    },

    resize:function(e){

        this.calc();
        this.testHeight();

    },

    remove: function ( n ) { 

        var i = this.uis.indexOf( n ); 
        if ( i !== -1 ) { 
            this.uis[i].clear();
            this.uis.splice( i, 1 ); 
        }

    },

    clear:function(){

        this.update( 0 );
        var i = this.uis.length;
        while(i--){
            this.uis[i].clear();
            this.uis[i] = null;
            this.uis.pop();
        }
        this.uis = [];
        this.calc();

    },

    showScroll:function(h){

        this.isScroll = true;

        this.total = this.height-20;
        this.maxView = this.maxHeight-20;

        this.ratio = this.maxView / this.total;
        this.sh = this.maxView * this.ratio;

        if(this.sh<20) this.sh = 20;

        this.range = this.maxView - this.sh;

        this.scrollBG.style.display = 'block';

        this.scrollBG.style.height = this.maxView + 'px';
        this.scroll.style.height = this.sh + 'px';

        this.update( 0 );
    },

    hideScroll:function(){

        this.isScroll = false;
        this.update( 0 );
        this.scrollBG.style.display = 'none';

    },

    calc:function(ny) {

        if( ny !== undefined ){
            this.height += ny;
            this.content.style.height = this.height+'px';
        } else {
            var total = this.inner.offsetHeight;
            this.height = total+20;
            this.content.style.height = this.height+'px';

            if(  this.bottom.textContent !== 'close' ) this.bottom.textContent = 'close';
        }

        this.tmp = setTimeout( this.testHeight.bind(this), 10);

    },

    testHeight:function(){

        if(this.tmp) clearTimeout(this.tmp);

        this.top = this.content.getBoundingClientRect().top;
        this.maxHeight = window.innerHeight - this.top - 10;

        if(this.height>this.maxHeight){

            this.content.style.height = this.maxHeight+'px';
            this.bottom.style.background = UIL.bgcolor( this.color, 1 );
            this.showScroll();

        }else{
            this.hideScroll();
            this.bottom.style.background = UIL.bgcolor( this.color );
        }

    },

    changeWidth:function() {

        this.width = UIL.WIDTH;
        this.content.style.width = this.width + 'px';


        if( this.isCenter ) this.content.style.marginLeft = -(~~ (UIL.WIDTH*0.5)) + 'px';

        var i = this.uis.length;
        while(i--){
            this.uis[i].setSize();
            this.uis[i].rSize();
        }

        this.calc();

    },

    show:function(){

        if( this.isOpen ){
            this.inner.style.display = 'block';
            this.calc();
        }else{
            this.content.style.height = '20px';
            this.tmp = setTimeout( this.endHide.bind(this), 100 );
        }
        
    },

    endHide: function(){

        if( this.tmp ) clearTimeout(this.tmp);
        this.inner.style.display = 'none'; 
        this.bottom.textContent = 'open';

    }

};
UIL.Proto = function( o ){

    o = o || {};

    this.type = '';

    // if is on ui pannel
    this.isUI = o.isUI || false;

    // only most simple 
    this.mono = false;

    // no title 
    this.simple = o.simple || false;

    // define obj size
    this.setSize( o.size );

    this.h = 20;
    
    if(o.color) UIL.COLOR = o.color;
    this.color = UIL.COLOR;

    this.fontColor = o.fontColor === undefined ? '#cccccc' : o.fontColor;
    this.titleColor = o.titleColor === undefined ? '#cccccc' : o.titleColor;

    this.txt = o.name || 'Proto';
    this.target = o.target || null;
    this.callback = o.callback || function(){};

    // elements

    this.c = [];

    this.c[0] = UIL.DOM('UIL base');

    if(this.isUI) this.c[0].style.marginBottom = '1px';
    

    if(!this.simple){ 
        this.c[1] = UIL.DOM('UIL text');
        this.c[1].textContent = this.txt;
        this.c[1].style.color = this.titleColor;
    }

    if(o.pos){
        this.c[0].style.position = 'absolute';
        for(var p in o.pos){
            this.c[0].style[p] = o.pos[p];
        }
        this.mono = true;
    }/* else {
        if(UIL.main){
            this.liner = UIL.main.liner();
            this.c[0].appendChild( this.liner );
        }
    }*/
}

UIL.Proto.prototype = {

    constructor: UIL.Proto,

    init: function (){

        this.c[0].style.height = this.h + 'px';
        this.c[0].style.background = UIL.bgcolor(this.color);

        if(this.type==='list' || this.type==='group' || this.type==='color') this.c[0].style.transition = 'height, 0.1s ease-out';

        for( var i = 0; i < this.c.length; i++ ){
            if( i === 0 ){ 
                if(this.target !== null ) this.target.appendChild( this.c[0] );
                else UIL.main.inner.appendChild( this.c[0] );
            }
            else {
                if( this.c[i] !== undefined ) this.c[0].appendChild(this.c[i]);
            }
        }

        this.rSize();
        
        this.addEvent();

    },

    setCallBack:function(callback){
        if(this.callback) this.callback = null;
        this.callback = callback;
    },

    setSize:function(sx){

        if(this.type === 'circular' || this.type === 'knob' ) return;

        this.size = sx || UIL.WIDTH;
        if( this.simple ){
            this.sa = 1;
            this.sb = sx-2;
        }else{
            this.sa = ~~ (this.size/3);
            this.sb = ~~ ((this.sa*2)-10);
        }

    },
    
    clear:function(){

        //console.log(event.this);
        
        this.clearEvent();

        var i = this.c.length;
        while(i--){
            //if(i==0){
                /*if( this.liner !== null ){ 
                    this.c[0].removeChild( this.liner );
                    this.liner = null;
                }*/
                
            //} else {
            if(i !== 0){
                if( this.c[i] !== undefined ){
                    if( this.c[i].children ) this.clearDOM( this.c[i] );
                    this.c[0].removeChild( this.c[i] );
                    this.c[i] = null;
                }
            }
        }

        if( this.target !== null ) this.target.removeChild( this.c[0] );
        else UIL.main.inner.removeChild( this.c[0] );

        this.c[0] = null;
        this.handleEvent = null;

        

        this.c = null;
        if(this.callback) this.callback = null;
        if(this.value) this.value = null;

        //this = null;
    },

    clearDOM:function(dom){
        while ( dom.children.length ){
            if(dom.lastChild.children) while ( dom.lastChild.children.length ) dom.lastChild.removeChild( dom.lastChild.lastChild );
            dom.removeChild( dom.lastChild );
        }
    },

    setTypeNumber:function( o ){

        this.min = o.min === undefined ? -Infinity : o.min;
        this.max = o.max === undefined ?  Infinity : o.max;
        this.precision = o.precision === undefined ? 2 : o.precision;

        var step;

        switch(this.precision){
            case 0:  step = 1; break;
            case 1:  step = 0.1; break;
            case 2:  step = 0.01; break;
            case 3:  step = 0.001; break;
            case 4:  step = 0.0001; break;
        }

        this.step = o.step === undefined ?  step : o.step;
        
    },

    numValue:function( n ){

        return Math.min( this.max, Math.max( this.min, n ) ).toFixed( this.precision )*1;

    },

    rSize:function(){

        if(this.type === 'circular' || this.type === 'knob' || this.type === 'joystick' ) return;

        this.c[0].style.width = this.size+'px';
        if( !this.simple ) this.c[1].style.width = this.sa+'px';
    
    },

    // ----------------------
    //   EVENTS DISPATCH
    // ----------------------

    addEvent: function(){

        var i = this.c.length, j, c;
        while( i-- ){
            c = this.c[i];
            if( c !== undefined ){
                if( c.events !== undefined ){
                    j = c.events.length;
                    while( j-- ) c.addEventListener( c.events[j], this, false );
                }
            }
        }

    },

    clearEvent: function(){

        var i = this.c.length, j, c;
        while( i-- ){
            c = this.c[i];
            if( c !== undefined ){
                if( c.events !== undefined ){
                    j = c.events.length;
                    while( j-- ) c.removeEventListener( c.events[j], this, false );
                }
            }
        }

    },

    handleEvent: function( e ) {
        
    }
}
UIL.Group = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'group';

    this.h = 25;

    this.isOpen = o.open || false;

    this.c[2] = UIL.DOM('UIL inner', 'div', 'top:25px');//UIL.DOM('UIL', 'div', 'top:25px; overflow:hidden; height:auto;');
    this.c[3] = UIL.DOM('UIL', 'path','position:absolute; width:16px; left:'+(this.sa+this.sb-17)+'px; top:4px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:this.fontColor, fill:'none', 'stroke-linecap':'butt' } );
    //this.c[4] = UIL.DOM('UIL inner');

    this.c[0].style.height = this.h + 'px';
    this.c[1].style.height = this.h + 'px';
    this.c[1].style.top = 4 + 'px';
    this.c[1].style.pointerEvents = 'auto';
    this.c[1].style.cursor = 'pointer';
    this.c[1].name = 'group';

    this.uis = [];

    this.c[1].events = [ 'click' ];

    this.init();

    if( this.isOpen ) this.open();
    //if( UIL.main ) UIL.main.calc();

};

UIL.Group.prototype = Object.create( UIL.Proto.prototype );
UIL.Group.prototype.constructor = UIL.Group;

UIL.Group.prototype.handleEvent = function( e ) {

    e.preventDefault();
    //e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click( e ); break;
    }

};

UIL.Group.prototype.click = function( e ){

    if( this.isOpen ) this.close();
    else this.open();

};



UIL.Group.prototype.add = function(type, obj){
    obj.target = this.c[2];
    UIL.Gui.prototype.add.call( this, type, obj );
};



UIL.Group.prototype.open = function(){

    this.isOpen = true;
    UIL.setSvg( this.c[3], 'd','M 12 6 L 8 10 4 6');
    this.calc();

    if( this.isUI ) UIL.main.calc( this.h -25 );

};

UIL.Group.prototype.close = function(){

    if( this.isUI ) UIL.main.calc(-(this.h-25 ));

    this.isOpen = false;
    UIL.setSvg( this.c[3], 'd','M 6 4 L 10 8 6 12');
    this.h = 25;

    //this.c[2].style.height = 0 + 'px';
    this.c[0].style.height = this.h + 'px';

};

UIL.Group.prototype.clear = function(){

    this.clearGroup();
    UIL.Proto.prototype.clear.call( this );

};

UIL.Group.prototype.clearGroup = function(){

    var i = this.uis.length;
    while(i--){
        this.uis[i].clear();
        this.uis.pop();
    }
    this.uis = [];
    this.calc();

};

UIL.Group.prototype.calc = function(){

    if( !this.isOpen ) return;
    this.h = 25;

    var total = this.c[2].offsetHeight;
    this.h += total;

    this.c[0].style.height = this.h + 'px';

};

UIL.Group.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.c[3].style.left = ( this.sa + this.sb - 17 ) + 'px';
    this.c[1].style.width = this.size + 'px';
    this.c[2].style.width = this.size + 'px';

    var i = this.uis.length;
    while(i--){
        this.uis[i].setSize();
        this.uis[i].rSize();
    }
    this.calc();

};
UIL.Title = function( o ){
    
    UIL.Proto.call( this, o );

    this.type = 'title';

    this.h = o.height || 31;

    var id = o.id || 0;
    var prefix = o.prefix || '';

    this.c[2] = UIL.DOM( 'UIL text', 'div', 'text-align:right; width:40px; padding:3px 5px;');
    this.c[2].style.color = this.fontColor;

    if( this.h === 31 ){

        this.c[0].style.height = this.h + 'px';
        this.c[1].style.top = 8 + 'px';
        this.c[2].style.top = 8 + 'px';

    }
    
    var idt = id || 0;
    if(id<10) idt = '0'+id;

    this.c[1].textContent = this.txt.substring(0,1).toUpperCase() + this.txt.substring(1).replace("-", " ");
    this.c[2].textContent = prefix.toUpperCase()+' '+idt;

    this.init();

};

UIL.Title.prototype = Object.create( UIL.Proto.prototype );
UIL.Title.prototype.constructor = UIL.Title;


UIL.Title.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.c[1].style.width = this.size-50 + 'px';
    this.c[2].style.left = this.size-(50+26) + 'px';

};

UIL.Title.prototype.text = function(txt){

    this.c[1].textContent = txt;

};

UIL.Title.prototype.text2 = function(txt){

    this.c[2].textContent = txt;

};
UIL.String = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'string';
    this.value = o.value || '';
    this.allway = o.allway || false;

    this.c[2] = UIL.DOM( 'UIL textSelect', 'div', 'pointer-events:auto; padding:3px 5px;' );
    //this.c[2].name = 'input';
    //this.c[2].value = this.value;
    this.c[2].style.color = this.fontColor;
    this.c[2].contentEditable = true;
    this.c[2].textContent = this.value;

    this.c[2].events = [ 'click', 'keydown', 'keyup' ];

    this.init();

};

UIL.String.prototype = Object.create( UIL.Proto.prototype );
UIL.String.prototype.constructor = UIL.String;

UIL.String.prototype.handleEvent = function( e ) {

    //e.preventDefault();
    //e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click( e ); break;
        case 'keydown': this.keydown( e ); break;
        case 'keyup': this.keyup( e ); break;
    }

};

UIL.String.prototype.click = function( e ){
//e.preventDefault();
//if(this.select) return;
    e.target.focus();
    e.target.style.cursor = 'auto';
    e.target.style.border = '1px solid ' + UIL.BorderSelect;
  //  this.select = true;
   // console.log('select')

};

UIL.String.prototype.keydown = function( e ){

    if( e.keyCode === 13 ){ 
        e.preventDefault();
        this.value = e.target.textContent;//e.target.value;
        this.callback( this.value );
        e.target.blur();
    }

};

UIL.String.prototype.keyup = function( e ){

    if( this.allway ) this.callback( this.value );
    
};

UIL.String.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.c[2].style.left = this.sa + 'px';
    this.c[2].style.width = this.sb + 'px';

};
UIL.Number = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'number';

    this.setTypeNumber( o );

    this.allway = o.allway || false;
    this.value = [0];
    this.toRad = 1;
    this.isNumber = true;
    this.isAngle = false;
    this.isVector = false;

    this.isSelect = false;

    if(o.value !== undefined){
        if(!isNaN(o.value)){ this.value = [o.value];}
        else if(o.value instanceof Array ){ this.value = o.value; this.isNumber=false;}
        else if(o.value instanceof Object ){ 
            this.value = [];
            if(o.value.x) this.value[0] = o.value.x;
            if(o.value.y) this.value[1] = o.value.y;
            if(o.value.z) this.value[2] = o.value.z;
            if(o.value.w) this.value[3] = o.value.w;
            this.isVector=true;
        }
    }

    this.length = this.value.length;

    if(o.isAngle){
        this.isAngle = true;
        this.toRad = Math.PI/180;
    }

    this.w = ((UIL.BW+5)/(this.length))-5;
    this.current = undefined;

    var i = this.length;
    while(i--){
        if(this.isAngle) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision );
        //this.c[2+i] = UIL.DOM('UIL text', 'input', 'pointer-events:auto; padding:0px 5px; padding-bottom:2px; width:'+this.w+'px; left:'+(UIL.AW+(this.w*i)+(5*i))+'px;');
        this.c[2+i] = UIL.DOM('UIL textSelect', 'div', 'pointer-events:auto; cursor:move; padding:3px 5px; width:'+this.w+'px; left:'+(UIL.AW+(this.w*i)+(5*i))+'px;');
        this.c[2+i].name = i;
       // this.c[2+i].value = this.value[i];
        this.c[2+i].textContent = this.value[i];
        this.c[2+i].style.color = this.fontColor;
        this.c[2+i].contentEditable = true;
        this.c[2+i].events = [ 'keydown', 'keyup', 'mousedown', 'blur', 'focus' ]; //'click', 

    }

    this.init();
}

UIL.Number.prototype = Object.create( UIL.Proto.prototype );
UIL.Number.prototype.constructor = UIL.Number;

UIL.Number.prototype.handleEvent = function( e ) {

    //e.preventDefault();
    //e.stopPropagation();

    switch( e.type ) {
        //case 'click': this.click( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'keydown': this.keydown( e ); break;
        case 'keyup': this.keyup( e ); break;

        case 'blur': this.blur( e ); break;
        case 'focus': this.focus( e ); break;

        // document
        case 'mouseup': this.up( e ); break;
        case 'mousemove': this.move( e ); break;

    }

};

UIL.Number.prototype.keydown = function( e ){

    if( e.keyCode === 13 ){
        e.preventDefault();
        this.testValue( parseFloat(e.target.name) );
        this.validate();
        e.target.blur();
    }

};

UIL.Number.prototype.keyup = function( e ){

    if( this.allway ){ 
        this.testValue( parseFloat(e.target.name) );
        this.validate();
    }

};

UIL.Number.prototype.blur = function( e ){

    this.isSelect = false;
    e.target.style.border = '1px solid rgba(255,255,255,0.1)';
    e.target.style.cursor = 'move';

};

UIL.Number.prototype.focus = function( e ){

    this.isSelect = true;
    this.current = undefined;
    e.target.style.border = '1px solid ' + UIL.BorderSelect;
    e.target.style.cursor = 'auto';

};

/*UIL.Number.prototype.click = function( e ){

    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    e.target.focus();
    e.target.style.cursor = 'auto';
    
    this.isSelect = true;

};*/

UIL.Number.prototype.down = function( e ){

    if(this.isSelect) return;

    e.preventDefault();

    e.target.style.border = '1px solid rgba(255,255,255,0.2)';
    this.current = parseFloat(e.target.name);

    this.prev = { x:e.clientX, y:e.clientY, d:0, id:(this.current+2)};
    if( this.isNumber ) this.prev.v = parseFloat(this.value);
    else this.prev.v = parseFloat( this.value[this.current] );

    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

};

////

UIL.Number.prototype.up = function( e ){

    e.preventDefault();

    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.current !== undefined){ 

        if( this.current === parseFloat(e.target.name) ) e.target.focus();

        else this.c[2+this.current].style.border = '1px solid rgba(255,255,255,0.1)';


        //this.c[2+this.current].style.cursor = 'move';
    }

    

};

UIL.Number.prototype.move = function( e ){

    e.preventDefault();

    if( this.current === undefined ) return;

    this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y );
    var n = this.prev.v + ( this.prev.d * this.step);

    this.value[this.current] = this.numValue(n);
    //this.c[2+this.current].value = this.value[this.current];

    this.c[2+this.current].textContent = this.value[this.current];

    this.validate();

    this.prev.x = e.clientX;
    this.prev.y = e.clientY;

};

/////

UIL.Number.prototype.testValue = function( n ){

    

    if(!isNaN( this.c[2+n].textContent )) this.value[n] = this.c[2+n].textContent;
    else this.c[2+n].textContent = this.value[n];
  //  if(!isNaN( this.c[2+n].value )) this.value[n] = this.c[2+n].value;
    //else this.c[2+n].value = this.value[n];

};

UIL.Number.prototype.validate = function(){

    var ar = [];
    var i = this.length;
    while(i--) ar[i] = this.value[i]*this.toRad;

    if( this.isNumber ) this.callback( ar[0] );
    else this.callback( ar );

};

UIL.Number.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.w = ((this.sb+5)/(this.length))-5;
    var i = this.length;
    while(i--){
        this.c[2+i].style.left = (this.sa+(this.w*i)+(5*i)) + 'px';
        this.c[2+i].style.width = this.w + 'px';
    }

};
UIL.Color = function( o ){
    
    UIL.Proto.call( this, o );

    this.type = 'color';

    this.type = o.type || 'array';
    this.width = this.sb;
    this.oldWidth = 0;

    // color up or down
    this.side = o.side || 'down';
    this.holdTop = 0;
    
    this.wheelWidth = this.width*0.1;
    this.decal = 22;
    
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    this.c[2] = UIL.DOM('UIL svgbox', 'rect', '',  { width:'100%', height:17, fill:'#000', 'stroke-width':1, stroke:UIL.SVGC });
    this.c[3] = UIL.DOM('UIL text', 'div', 'padding:4px 10px');

    if(this.side === 'up'){
        this.decal = 5;
        this.c[3].style.top = 'auto';
        this.c[2].style.top = 'auto';
        this.c[3].style.bottom = '2px';
        this.c[2].style.bottom = '2px';
    }

    this.c[4] = UIL.DOM('UIL', 'rect', 'left:'+ this.sa+'px;  top:'+this.decal+'px; width:'+this.width+'px; height:'+this.width+'px;',  { x:(this.mid - this.square), y:(this.mid - this.square), width:(this.square * 2 - 1), height:(this.square * 2 - 1), fill:'#000' });
    this.c[5] = UIL.DOM('UIL', 'canvas', 'left:'+ this.sa+'px;  top:'+this.decal+'px; display:none;');
    this.c[6] = UIL.DOM('UIL', 'canvas', 'left:'+ this.sa+'px;  top:'+this.decal+'px; pointer-events:auto; cursor:pointer; display:none;');

    if(this.side === 'up') this.c[6].style.pointerEvents = 'none';

    this.c[5].width = this.c[5].height = this.width;
    this.c[6].width = this.c[6].height = this.width;

    this.ctxMask = this.c[5].getContext('2d');
    this.ctxOverlay = this.c[6].getContext('2d');
    this.ctxMask.translate(this.mid, this.mid);
    this.ctxOverlay.translate(this.mid, this.mid);

    this.hsl = null;
    this.value = '#ffffff';
    if( o.value !== undefined ){
        if(o.value instanceof Array) this.value = UIL.pack(o.value);
        else if(!isNaN(o.value)) this.value = UIL.numFormat(o.value);
        else this.value = o.value;
    }
    this.bcolor = null;
    this.isDown = false;
    this.isShow = false;

    this.c[2].events = [ 'click' ];
    this.c[6].events = [ 'mousedown', 'mousemove', 'mouseup', 'mouseout' ];

    this.setColor( this.value );

    this.init();

};

UIL.Color.prototype = Object.create( UIL.Proto.prototype );
UIL.Color.prototype.constructor = UIL.Color;

UIL.Color.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mousedown': this.down(e); break;
        case 'mousemove': this.move(e); break;
        case 'mouseup': this.up(e); break;
        case 'mouseout': this.out(e); break;
    }

};

/////

UIL.Color.prototype.click = function( e ){

    if( !this.isShow ) this.show();
    else this.hide();

};

UIL.Color.prototype.up = function( e ){

    this.isDown = false;

};

UIL.Color.prototype.out = function( e ){

    this.hide();

};

UIL.Color.prototype.down = function( e ){

    if(!this.isShow) return;
    this.isDown = true;
    this.move( e );
    return false;

};

UIL.Color.prototype.move = function( e ){

    if(!this.isDown) return;

    this.offset = this.c[6].getBoundingClientRect();
    var pos = { x: e.pageX - this.offset.left - this.mid, y: e.pageY - this.offset.top - this.mid };
    this.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) > (this.square + 2);

    if ( this.circleDrag ) {
        var hue = Math.atan2(pos.x, -pos.y) / 6.28;
        this.setHSL([(hue + 1) % 1, this.hsl[1], this.hsl[2]]);
    } else {
        var sat = Math.max(0, Math.min(1, -( pos.x / this.square * 0.5) + .5) );
        var lum = Math.max(0, Math.min(1, -( pos.y / this.square * 0.5) + .5) );
        this.setHSL([this.hsl[0], sat, lum]);
    }

};


//////

UIL.Color.prototype.redraw = function(){
    this.oldWidth = this.width;
    this.drawCircle();
    this.drawMask();
    this.drawMarkers();
};

UIL.Color.prototype.show = function(){

    if(this.oldWidth!==this.width) this.redraw();
    this.isShow = true;
    this.h = this.width + 30;
    this.c[0].style.height = this.h+'px';

    if(this.side=='up'){ 
        this.holdTop = this.c[0].style.top.substring(0,this.c[0].style.top.length-2) * 1 || 'auto';
        if(!isNaN(this.holdTop)) this.c[0].style.top = (this.holdTop-(this.h-20))+'px';
        setTimeout(function(){this.c[6].style.pointerEvents = 'auto';}.bind(this), 100);
    }

    this.c[4].style.display = 'block';
    this.c[5].style.display = 'block';
    this.c[6].style.display = 'block';

    if( this.isUI ) UIL.main.calc( this.h-20 );

};

UIL.Color.prototype.hide = function(){

    if( this.isUI ) UIL.main.calc( -(this.h-20) );
    this.isShow = false;
    this.h = 20;
    if(this.side=='up'){ 
        if(!isNaN(this.holdTop)) this.c[0].style.top = (this.holdTop)+'px';
        this.c[6].style.pointerEvents = 'none';
    }
    this.c[0].style.height = this.h+'px';
    this.c[4].style.display = 'none';
    this.c[5].style.display = 'none';
    this.c[6].style.display = 'none';
    //this.c[6].onmousedown = null;
    //this.c[6].onmouseout = null;
    
};

UIL.Color.prototype.updateDisplay = function(){
    this.invert = (this.rgb[0] * 0.3 + this.rgb[1] * .59 + this.rgb[2] * .11) <= 0.6;

    UIL.setSvg( this.c[4], 'fill',UIL.pack(UIL.HSLToRGB([this.hsl[0], 1, 0.5])));
    this.drawMarkers();
    
    this.value = this.bcolor;
    UIL.setSvg( this.c[2], 'fill', this.bcolor);
    this.c[3].textContent = UIL.hexFormat(this.bcolor);//this.value);

    
    var cc = this.invert ? '#fff' : '#000';
    
    this.c[3].style.color = cc;

    if( this.type === 'array' ) this.callback( this.rgb );
    if( this.type === 'html' ) this.callback( this.value );
    if( this.type === 'hex' ) this.callback( this.value );
};

UIL.Color.prototype.setColor = function( color ){

    var unpack = UIL.unpack(color);
    if (this.bcolor != color && unpack) {
        this.bcolor = color;
        this.rgb = unpack;
        this.hsl = UIL.RGBtoHSL(this.rgb);
        this.updateDisplay();
    }
    return this;

};

UIL.Color.prototype.setHSL = function( hsl ){

    this.hsl = hsl;
    this.rgb = UIL.HSLToRGB(hsl);
    this.bcolor = UIL.pack(this.rgb);
    this.updateDisplay();
    return this;

};

UIL.Color.prototype.calculateMask = function(sizex, sizey, outputPixel){
    var isx = 1 / sizex, isy = 1 / sizey;
    for (var y = 0; y <= sizey; ++y) {
        var l = 1 - y * isy;
        for (var x = 0; x <= sizex; ++x) {
            var s = 1 - x * isx;
            var a = 1 - 2 * Math.min(l * s, (1 - l) * s);
            var c = (a > 0) ? ((2 * l - 1 + a) * .5 / a) : 0;
            outputPixel(x, y, c, a);
        }
    }
};

UIL.Color.prototype.drawMask = function(){
    var size = this.square * 2, sq = this.square;
    var sz = Math.floor(size / 2);
    var buffer = document.createElement('canvas');
    buffer.width = buffer.height = sz + 1;
    var ctx = buffer.getContext('2d');
    var frame = ctx.getImageData(0, 0, sz + 1, sz + 1);

    var i = 0;
    this.calculateMask(sz, sz, function (x, y, c, a) {
        frame.data[i++] = frame.data[i++] = frame.data[i++] = c * 255;
        frame.data[i++] = a * 255;
    });

    ctx.putImageData(frame, 0, 0);
    this.ctxMask.drawImage(buffer, 0, 0, sz + 1, sz + 1, -sq, -sq, sq * 2, sq * 2);
};

UIL.Color.prototype.drawCircle = function(){
    var n = 24,r = this.radius, w = this.wheelWidth, nudge = 8 / r / n * Math.PI, m = this.ctxMask, a1 = 0, color1, d1;
    var ym, am, tan, xm, color2, d2, a2, ar;
    m.save();
    m.lineWidth = w / r;
    m.scale(r, r);
    for (var i = 0; i <= n; ++i) {
        d2 = i / n;
        a2 = d2 * Math.PI * 2;
        ar = [Math.sin(a1), -Math.cos(a1), Math.sin(a2), -Math.cos(a2)];
        am = (a1 + a2) * 0.5;
        tan = 1 / Math.cos((a2 - a1) * 0.5);
        xm = Math.sin(am) * tan, ym = -Math.cos(am) * tan;
        color2 = UIL.pack(UIL.HSLToRGB([d2, 1, 0.5]));
        if (i > 0) {
            var grad = m.createLinearGradient(ar[0], ar[1], ar[2], ar[3]);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            m.strokeStyle = grad;
            m.beginPath();
            m.moveTo(ar[0], ar[1]);
            m.quadraticCurveTo(xm, ym, ar[2], ar[3]);
            m.stroke();
        }
        a1 = a2 - nudge; 
        color1 = color2;
        d1 = d2;
    }
    m.restore();
};

UIL.Color.prototype.drawMarkers = function(){

    var m = this.markerSize, ra=this.radius, sz = this.width, lw = Math.ceil(m/ 4), r = m - lw + 1, c1 = this.invert ? '#fff' : '#000', c2 = this.invert ? '#000' : '#fff';
    var angle = this.hsl[0] * 6.28;
    var ar = [Math.sin(angle) * ra, -Math.cos(angle) * ra, 2 * this.square * (.5 - this.hsl[1]), 2 * this.square * (.5 - this.hsl[2]) ];
  
    var circles = [
        { x: ar[2], y: ar[3], r: m, c: c1,     lw: lw },
        { x: ar[2], y: ar[3], r: r, c: c2,     lw: lw + 1 },
        { x: ar[0], y: ar[1], r: m, c: '#fff', lw: lw },
        { x: ar[0], y: ar[1], r: r, c: '#000', lw: lw + 1 },
    ];
    this.ctxOverlay.clearRect(-this.mid, -this.mid, sz, sz);
    var i = circles.length;
    while(i--){
        var c = circles[i];
        this.ctxOverlay.lineWidth = c.lw;
        this.ctxOverlay.strokeStyle = c.c;
        this.ctxOverlay.beginPath();
        this.ctxOverlay.arc(c.x, c.y, c.r, 0, Math.PI * 2, true);
        this.ctxOverlay.stroke();
    }
};

UIL.Color.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.width = this.sb;
    this.wheelWidth = this.width*0.1;

    this.decal = 22;
    if( this.side === 'up' ) this.decal = 5;
    this.radius = (this.width - this.wheelWidth) * 0.5 - 1;
    this.square = Math.floor((this.radius - this.wheelWidth * 0.5) * 0.7) - 1;
    this.mid = Math.floor(this.width * 0.5 );
    this.markerSize = this.wheelWidth * 0.3;

    this.c[2].style.width = this.sb + 'px';
    this.c[2].style.left = this.sa + 'px';

    this.c[3].style.width = this.sb + 'px';
    this.c[3].style.left = this.sa + 'px';

    this.c[4].style.width = this.width + 'px';
    this.c[4].style.height = this.width + 'px';
    this.c[4].style.left = this.sa + 'px';

    this.c[5].width = this.c[5].height = this.width;
    this.c[5].style.left = this.sa + 'px';

    this.c[6].width = this.c[6].height = this.width;
    this.c[6].style.left = this.sa + 'px';
    this.c[5].style.top = this.decal + 'px';
    this.c[6].style.top = this.decal + 'px';

    //UIL.setSvg( this.c[2], 'width',this.sb);
    UIL.setSvg( this.c[4], 'width',this.square * 2 - 1);
    UIL.setSvg( this.c[4], 'height',this.square * 2 - 1);
    UIL.setSvg( this.c[4], 'x',this.mid - this.square);
    UIL.setSvg( this.c[4], 'y',this.mid - this.square);

    this.ctxMask.translate(this.mid, this.mid);
    this.ctxOverlay.translate(this.mid, this.mid);

    if( this.isShow ){ 
        this.redraw();
        this.h = this.width+30;
        this.c[0].height = this.h + 'px';
        if( this.isUI ) UIL.main.calc();
    }

};

//-----------------------------------------
// COLOR FUNCTION
UIL.hexToHtml = function(v){ 
    return "#" + ("000000" + v.toString(16)).substr(-6);
};

UIL.numFormat = function(v){ 
    return "#" + ("000000" + v.toString(16)).substr(-6);
    //return "#"+v.toString(16);
};
UIL.hexFormat = function(v){ return v.toUpperCase().replace("#", "0x"); };

UIL.pack = function(rgb){
    var r = Math.round(rgb[0] * 255);
    var g = Math.round(rgb[1] * 255);
    var b = Math.round(rgb[2] * 255);
    return '#' + UIL.dec2hex(r) + UIL.dec2hex(g) + UIL.dec2hex(b);
};
UIL.u255 = function(color, i){
    return parseInt(color.substring(i, i + 2), 16) / 255;
};
UIL.u16 = function(color, i){
    return parseInt(color.substring(i, i + 1), 16) / 15;
};
UIL.unpack = function(color){
    if (color.length == 7) return [ UIL.u255(color, 1), UIL.u255(color, 3), UIL.u255(color, 5) ];
    else if (color.length == 4) return [ UIL.u16(color,1), UIL.u16(color,2), UIL.u16(color,3) ];
};
UIL.packDX = function(c, a){
    return '#' + UIL.dec2hex(a) + UIL.dec2hex(c) + UIL.dec2hex(c) + UIL.dec2hex(c);
};
UIL.dec2hex = function(x){
    return (x < 16 ? '0' : '') + x.toString(16);
};

UIL.HSLToRGB = function(hsl){
    var m1, m2, r, g, b;
    var h = hsl[0], s = hsl[1], l = hsl[2];
    m2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
    m1 = l * 2 - m2;
    return [ UIL.HUEtoRGB(m1, m2, h + 0.33333), UIL.HUEtoRGB(m1, m2, h), UIL.HUEtoRGB(m1, m2, h - 0.33333) ];
};
UIL.HUEtoRGB = function(m1, m2, h){
     h = (h + 1) % 1;
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (0.66666 - h) * 6;
    return m1;
};
UIL.RGBtoHSL = function(rgb){
    var r = rgb[0], g = rgb[1], b = rgb[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
    if (l > 0 && l < 1) {
        s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    }
    if (delta > 0) {
        if (max == r && max != g) h += (g - b) / delta;
        if (max == g && max != b) h += (2 + (b - r) / delta);
        if (max == b && max != r) h += (4 + (r - g) / delta);
        h /= 6;
    }
    return [h, s, l];
};
UIL.Slide = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'slide';

    this.setTypeNumber( o );

    this.range = this.max - this.min;
    this.width = UIL.BW - 40;
    this.w = this.width - 8;

    this.h = o.height || 20;
    this.h = this.h < 11 ? 11 : this.h;

    //this.height = this.h - 3;
    this.value = o.value || 0;
    this.old = this.value;
    this.isDown = false;
    this.isOver = false;

    var ty = (o.height * 0.5) - 10;

    if(this.c[1]!==undefined) this.c[1].style.top = ty + 'px';

    this.c[2] = UIL.DOM('UIL text', 'div', 'top:'+ty+'px; text-align:right; width:40px; padding:3px 5px; color:'+ this.fontColor );
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', 'width:'+this.width+'px; height:'+(this.h-3)+'px; cursor:w-resize;', { width:'100%', height:this.h-3, fill:UIL.SVGB, 'stroke-width':1, stroke:UIL.SVGC });
    this.c[4] = UIL.DOM('UIL svgbox', 'rect', 'left:4px; top:4px; width:'+(this.width-8)+'px; height:'+(this.h-10)+'px; pointer-events:none;', { width:'100%', height:'100%', fill: this.fontColor });

    // pattern test
    UIL.DOM( null, 'defs', null, {}, this.c[3] );
    UIL.DOM( null, 'pattern', null, {id:'sripe', x:0, y:0, width:10, height:10, patternUnits:'userSpaceOnUse' }, this.c[3], 1 );
    UIL.DOM( null, 'line', null, { x1:5, x2:0, y1:0, y2:10, stroke:UIL.SVGC, 'stroke-width':1  }, this.c[3].childNodes[1], 0 );
    UIL.DOM( null, 'line', null, { x1:10, x2:5, y1:0, y2:10, stroke:UIL.SVGC, 'stroke-width':1  }, this.c[3].childNodes[1], 0 );

    //console.log(this.c[3])

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    //if(UIL.main) UIL.main.calc();

};

UIL.Slide.prototype = Object.create( UIL.Proto.prototype );
UIL.Slide.prototype.constructor = UIL.Slide;

UIL.Slide.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout': this.out( e ); break;

        case 'mouseup': this.up( e ); break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Slide.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[4], 'fill', this.fontColor );
        break;
        case 1: // over
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
            UIL.setSvg( this.c[4], 'fill', UIL.SELECT );
        break;
        case 2: // edit
            UIL.setSvg( this.c[3], 'fill','url(#sripe)');
            UIL.setSvg( this.c[4], 'fill', UIL.MOVING );
        break;

    }
}

UIL.Slide.prototype.over = function( e ){

    this.isOver = true;
    this.mode(1);

};

UIL.Slide.prototype.out = function( e ){

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Slide.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.isOver) this.mode(1);
    else this.mode(0);
    

};

UIL.Slide.prototype.down = function( e ){

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    this.left = this.c[3].getBoundingClientRect().left;
    this.old = this.value;
    this.move( e );
    this.mode(2);

};

UIL.Slide.prototype.move = function( e ){

    if( this.isDown ){
        var n = ((( e.clientX - this.left - 4 ) / this.w ) * this.range + this.min ) - this.old;
        if(n >= this.step || n <= this.step){ 
            n = ~~ ( n / this.step );
            this.value = this.numValue( this.old + ( n * this.step ) );
            this.update( true );
            this.old = this.value;
        }
    }

};

UIL.Slide.prototype.listen = function( v ){

    this.value = v;
    this.update();

};

UIL.Slide.prototype.update = function( up ){

    var ww = this.w * (( this.value - this.min ) / this.range );
    this.c[4].style.width = ww + 'px';
    this.c[2].textContent = this.value;
    if( up ) this.callback( this.value );

};

UIL.Slide.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.width = this.sb - 40;
    this.w = this.width - 8;

    this.c[2].style.left = this.size - 50 + 'px';
    this.c[3].style.left = this.sa + 'px';
    this.c[3].style.width = this.width + 'px';
    this.c[4].style.left = (this.sa + 4) + 'px';

    
    
    this.update();

};
UIL.List = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'list';

    this.c[2] = UIL.DOM('UIL list');
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', '', {width:'100%', height:17, fill:UIL.bgcolor(UIL.COLOR), 'stroke-width':1, stroke:UIL.SVGC  });
    this.c[4] = UIL.DOM('UIL', 'path','position:absolute; width:16px; height:16px; left:'+(this.sa+this.sb-17)+'px; top:1px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:this.fontColor, fill:'none', 'stroke-linecap':'butt' } );
    this.c[5] = UIL.DOM('UIL text', 'div', 'text-align:center; padding:4px 10px; ');
    this.c[6] = UIL.DOM('UIL svgbox', 'rect', 'top:20px; height:90px; pointer-events:none;', { x:this.sb-15, y:0, width:10, height:16, fill:'#666', 'stroke-width':1, stroke:UIL.SVGC  });

    this.c[2].name = 'list';
    this.c[3].name = 'title';

    this.c[5].style.color = this.fontColor;

    this.c[2].events = [ 'mousedown', 'mousemove', 'mouseup', 'mouseout', 'mousewheel' ];
    this.c[3].events = [ 'click', 'mousedown', 'mouseover', 'mouseout', 'mouseup' ];

    this.list = o.list || [];
    if(o.value){
        if(!isNaN(o.value)) this.value = this.list[o.value];
        else this.value = o.value;
    }else{
        this.value = this.list[0];
    }

    this.show = false;
    this.maxItem = o.maxItem || 5;
    this.length = this.list.length;

    // force full list 
    this.full = o.full || false;
    if(this.full) this.maxItem = this.length;
    
    this.maxHeight = this.maxItem * 18;
    this.max = this.length * 18;
    this.w = this.sb;
    this.isDown = false;
    this.range = this.max - this.maxHeight;
    this.py = 0;
    this.scroll = false;

    // list up or down
    this.side = o.side || 'down';
    this.holdTop = 0;


    if( this.side === 'up' ){

        this.c[2].style.top = 'auto';
        this.c[3].style.top = 'auto';
        this.c[4].style.top = 'auto';
        this.c[5].style.top = 'auto';
        this.c[2].style.bottom = '10px';
        this.c[3].style.bottom = '2px';
        this.c[4].style.bottom = '2px';
        this.c[5].style.bottom = '2px';

    }

    if( this.max > this.maxHeight ){ 
        this.w = this.sb-20;
        this.scroll = true;
    }

    this.listIn = UIL.DOM('UIL list-in');
    this.listIn.name = 'list';
    this.c[2].style.height = this.maxHeight + 'px';
    this.c[2].appendChild(this.listIn);

    // populate list
    var item, n, l = this.sb;
    for( var i=0; i<this.length; i++ ){
        n = this.list[i];
        item = UIL.DOM('UIL listItem', 'div', 'width:'+this.w+'px; height:18px;');
        item.textContent = n;
        item.style.color = this.fontColor;
        item.name = n;
        this.listIn.appendChild(item);
    }

    this.c[5].textContent = this.value;
    

    this.init();

}

UIL.List.prototype = Object.create( UIL.Proto.prototype );
UIL.List.prototype.constructor = UIL.List;

UIL.List.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    var name = e.target.name || '';
    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mouseover': this.mode(1); break;
        case 'mousedown': if(name === 'title') this.mode(2); else this.listdown(e); break;
        case 'mouseup': if(name === 'title') this.mode(0); else this.listup(e); break;
        case 'mouseout': if(name === 'title') this.mode(0); else this.listout(e); break;
        case 'mousemove': this.listmove(e); break;
        case 'mousewheel': this.listwheel(e); break;
    }

}

UIL.List.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            this.c[5].style.color = this.fontColor;
            //this.c[3].style.background = UIL.bgcolor(UIL.COLOR);
            UIL.setSvg(this.c[3], 'fill', UIL.bgcolor(UIL.COLOR) );
        break;
        case 1: // over
            this.c[5].style.color = '#FFF';
            //this.c[3].style.background = UIL.SELECT;
            UIL.setSvg(this.c[3], 'fill', UIL.SELECT );
        break;
        case 2: // edit / down
            this.c[5].style.color = this.fontColor;
            //this.c[3].style.background = UIL.SELECTDOWN;
            UIL.setSvg(this.c[3], 'fill', UIL.SELECTDOWN );
        break;

    }
}

// -----

UIL.List.prototype.click = function( e ){

    if( this.show ) this.listHide();
    else this.listShow();

};

// ----- LIST

UIL.List.prototype.listdown = function( e ){

    var name = e.target.name;
    if( name !== 'list' && name !== undefined ){
        this.value = e.target.name;
        this.c[5].textContent = this.value;
        this.callback( this.value );
        this.listHide();
    } else if ( name ==='list' && this.scroll ){
        this.isDown = true;
        this.listmove( e );
        this.listIn.style.background = 'rgba(0,0,0,0.6)';
        UIL.setSvg( this.c[6], 'fill', '#AAA');
        e.preventDefault();
    }

};

UIL.List.prototype.listmove = function( e ){

    if( this.isDown ){
        var rect = this.c[2].getBoundingClientRect();
        var y = e.clientY - rect.top;
        if( y < 30 ) y = 30;
        if( y > 100 ) y = 100;
        this.py = ~~(((y-30)/70)*this.range);//.toFixed(0);

        this.update();
    }

};

UIL.List.prototype.listup = function( e ){

    this.isDown = false;
    this.listIn.style.background = 'rgba(0,0,0,0.2)';
    UIL.setSvg( this.c[6], 'fill', '#666' );

};

UIL.List.prototype.listout = function( e ){

    if( this.isUI ) UIL.main.lockwheel = false;
    this.listup();
    var name = e.relatedTarget.name;
    if( name === undefined ) this.listHide();

};

UIL.List.prototype.listwheel = function( e ){

    if( !this.scroll ) return;
    if( this.isUI ) UIL.main.lockwheel = true;
    var delta = 0;
    if( e.wheelDeltaY ) delta = -e.wheelDeltaY*0.04;
    else if( e.wheelDelta ) delta = -e.wheelDelta*0.2;
    else if( e.detail ) delta = e.detail*4.0;

    this.py += delta;

    if( this.py < 0 ) this.py=0;
    if(this.py > this.range ) this.py = this.range;

    this.update();

};


// ----- LIST

UIL.List.prototype.update = function( y ){

    if( !this.scroll ) return;
    this.py = y === undefined ? this.py : y;
    this.listIn.style.top = -this.py+'px';
    UIL.setSvg( this.c[6], 'y', ((this.py*70)/this.range)+2 );

};

UIL.List.prototype.listShow = function(){

    this.update( 0 );
    this.show = true;
    this.h = this.maxHeight + 30;
    if( !this.scroll ){
        this.h = 30 + this.max;
        this.c[6].style.display = 'none';
        this.c[2].removeEventListener( 'mousewheel', this, false );
        this.c[2].removeEventListener( 'mousemove',  this, false ); 
    }
    this.c[0].style.height = this.h+'px';
    this.c[2].style.display = 'block';
    if( this.side === 'up' ) UIL.setSvg( this.c[4], 'd','M 12 10 L 8 6 4 10');
    else UIL.setSvg( this.c[4], 'd','M 12 6 L 8 10 4 6');

    if( this.isUI ) UIL.main.calc(this.h-20);

};

UIL.List.prototype.listHide = function(){

    if( this.isUI ) UIL.main.calc(-(this.h-20));

    this.show = false;
    this.h = 20;
    this.c[0].style.height = this.h + 'px';
    this.c[2].style.display = 'none';
    UIL.setSvg( this.c[4], 'd','M 6 4 L 10 8 6 12');

    

};

// -----

UIL.List.prototype.text = function( txt ){

    this.c[5].textContent = txt;

};

UIL.List.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.c[2].style.width = this.sb+'px';
    this.c[2].style.left = this.sa - 20 +'px';

    this.c[3].style.width = this.sb+'px';
    this.c[3].style.left = this.sa+'px';

    this.c[4].style.left = this.sa + this.sb - 17 +'px';

    this.c[5].style.width = this.sb+'px';
    this.c[5].style.left = this.sa+'px';

    this.c[6].style.width = this.sb+'px';
    this.c[6].style.left = this.sa+'px';

   // UIL.setSvg( this.c[3], 'width', this.sb );
    UIL.setSvg( this.c[6], 'x', this.sb-15 );

    this.w = this.sb;
    if(this.max > this.maxHeight) this.w = this.sb-20;
    var i = this.length;
    while(i--) this.listIn.children[i].style.width = this.w + 'px';

};
UIL.Bool = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'bool';

    this.value = o.value || false;

    this.c[2] = UIL.DOM('UIL svgbox', 'rect', 'width:17px;', {width:17, height:17, fill:UIL.SVGB, 'stroke-width':1, stroke:UIL.SVGC });
    this.c[3] = UIL.DOM('UIL svgbox', 'path','width:17px; pointer-events:none;',{ width:17, height:17, d:'M 4 9 L 6 12 14 4', 'stroke-width':2, stroke:this.fontColor, fill:'none', 'stroke-linecap':'butt' });

    if(!this.value) this.c[3].style.display = 'none';

    this.c[2].events = [ 'click' ];

   

    this.init();

};

UIL.Bool.prototype = Object.create( UIL.Proto.prototype );
UIL.Bool.prototype.constructor = UIL.Bool;

UIL.Bool.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click(e); break;
    }

};

UIL.Bool.prototype.click = function( e ){

    if(this.value){
        this.value = false;
        this.c[3].style.display = 'none';
        UIL.setSvg( this.c[2], 'fill', 'rgba(0,0,0,0.2)' );
    } else {
        this.value = true;
        this.c[3].style.display = 'block';
        UIL.setSvg( this.c[2], 'fill', 'rgba(0,0,0,0.4)' );
    }

    this.callback( this.value );

};



UIL.Bool.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );
    this.c[2].style.left = this.sa + 'px';
    this.c[3].style.left = this.sa + 'px';

};
UIL.Button = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'button';

    this.value = o.value || false;

    this.c[2] = UIL.DOM('UIL svgbox', 'rect', '', { width:'100%', height:17, fill:UIL.bgcolor(UIL.COLOR), 'stroke-width':1, stroke:UIL.SVGC  });
    this.c[3] = UIL.DOM('UIL text', 'div', 'text-align:center; padding:4px 10px');// border:1px solid rgba(120,120,120,0.6);');
    this.c[3].style.color = this.fontColor;

    this.c[2].events = [ 'click', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

    if( this.c[1] !== undefined ) this.c[1].textContent = '';
    this.c[3].innerHTML = this.txt;

    this.init();

};

UIL.Button.prototype = Object.create( UIL.Proto.prototype );
UIL.Button.prototype.constructor = UIL.Button;

UIL.Button.prototype.handleEvent = function( e ) {

    e.preventDefault();
    e.stopPropagation();

    switch( e.type ) {
        case 'click': this.click( e ); break;
        case 'mouseover': this.mode( 1 ); break;
        case 'mousedown': this.mode( 2 ); break;
        case 'mouseup': this.mode( 0 ); break;
        case 'mouseout': this.mode( 0 ); break;
    }

};

UIL.Button.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            this.c[3].style.color = this.fontColor;
            //this.c[3].style.background = UIL.bgcolor(UIL.COLOR);
            UIL.setSvg(this.c[2], 'fill', UIL.bgcolor(UIL.COLOR) );
        break;
        case 1: // over
            this.c[3].style.color = '#FFF';
            //this.c[3].style.background = UIL.SELECT;
            UIL.setSvg(this.c[2], 'fill', UIL.SELECT );
        break;
        case 2: // edit / down
            this.c[3].style.color = this.fontColor;
            //this.c[3].style.background = UIL.SELECTDOWN;
            UIL.setSvg(this.c[2], 'fill', UIL.SELECTDOWN );
        break;

    }
}

UIL.Button.prototype.click = function( e ){

    this.callback( this.value );

};

UIL.Button.prototype.label = function( string ){

    this.c[3].textContent = string;

};

UIL.Button.prototype.icon = function( string ){

    this.c[3].style.padding = '0px 0px';
    this.c[3].innerHTML = string;

};

UIL.Button.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    this.c[2].style.left = this.sa + 'px';
    this.c[3].style.left = this.sa + 'px';
    this.c[2].style.width = this.sb + 'px';
    this.c[3].style.width = this.sb + 'px';

};
UIL.Circular = function( o ){

    UIL.Proto.call( this, o );
    this.type = 'circular';
    
    this.setTypeNumber( o );

    this.range = this.max - this.min;

    this.value = o.value || 0;

    this.radius = o.radius || 15;
    
    this.size = (this.radius*2)+20;

    if(o.size !== undefined){
        this.size = o.size;
        this.radius = ~~ (this.size-20)*0.5;
    }

    this.w = this.radius*2;
    this.height = this.radius*2;
    this.h = o.height || (this.height + 40);

    this.twoPi = Math.PI * 2;

    this.top = 0;

    this.c[0].style.width = this.size +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.size +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.percent = 0;

    this.c[2] = UIL.DOM('UIL text', 'div', 'top:'+(this.height+20)+'px; text-align:center; width:'+this.size+'px; padding:3px 5px; color:'+ this.fontColor );

    this.c[3] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = UIL.DOM('UIL svgbox', 'path', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { d:this.makePath(), fill:this.fontColor });
    this.c[5] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { cx:this.radius, cy:this.radius, r:this.radius*0.5, fill:UIL.bgcolor(UIL.COLOR, 1), 'stroke-width':1, stroke:UIL.SVGC });

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    this.update();

};

UIL.Circular.prototype = Object.create( UIL.Proto.prototype );
UIL.Circular.prototype.constructor = UIL.Circular;

UIL.Circular.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout':  this.out( e );  break;

        case 'mouseup':   this.up( e );   break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Circular.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[4], 'fill', this.fontColor );
        break;
        case 1: // over
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
            UIL.setSvg( this.c[4], 'fill', UIL.SELECT );
        break;
        case 2: // edit
            UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[4], 'fill', UIL.MOVING );
        break;

    }
}

UIL.Circular.prototype.over = function( e ){

    this.isOver = true;
    this.mode(1);

};

UIL.Circular.prototype.out = function( e ){

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Circular.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    if(this.isOver) this.mode(1);
    else this.mode(0);
    

};

UIL.Circular.prototype.down = function( e ){

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    this.rect = this.c[3].getBoundingClientRect();
    this.old = this.value;
    this.oldr = null;
    this.move( e );
    this.mode(2);

};

UIL.Circular.prototype.move = function( e ){

    if( !this.isDown ) return;

    var x = this.radius - (e.clientX - this.rect.left);
    var y = this.radius - (e.clientY - this.rect.top);

    this.r = Math.atan2( y, x ) - (Math.PI * 0.5);
    this.r = (((this.r%this.twoPi)+this.twoPi)%this.twoPi);

    if( this.oldr !== null ){ 

        var dif = this.r - this.oldr;
        this.r = Math.abs(dif) > Math.PI ? this.oldr : this.r;

        if(dif>6) this.r = 0;
        if(dif<-6) this.r = this.twoPi;

    }

    var steps = 1 / this.twoPi;
    var value = this.r * steps;

    var n = ( ( this.range * value ) + this.min ) - this.old;

    if(n >= this.step || n <= this.step){ 
        n = ~~ ( n / this.step );
        this.value = this.numValue( this.old + ( n * this.step ) );
        this.update( true );
        this.old = this.value;
        this.oldr = this.r;
    }

};

UIL.Circular.prototype.makePath = function(){

    var r = this.radius;
    var unit = this.twoPi;  
    var start = 0;
    var end = this.percent * unit - 0.001;
    var x1 = r + r * Math.sin(start);
    var y1 = r - r * Math.cos(start);
    var x2 = r + r * Math.sin(end);
    var y2 = r - r * Math.cos(end);
    var big = end - start > Math.PI ? 1 : 0;
    return "M " + r + "," + r + " L " + x1 + "," + y1 + " A " + r + "," + r + " 0 " + big + " 1 " + x2 + "," + y2 + " Z";

};

UIL.Circular.prototype.update = function( up ){

    this.c[2].textContent = this.value;
    this.percent = (this.value - this.min) / this.range;
    UIL.setSvg( this.c[4], 'd', this.makePath() );
    if( up ) this.callback(this.value);
    
};
UIL.Knob = function( o ){

    UIL.Proto.call( this, o );

    this.type = 'knob';

    this.setTypeNumber( o );

    this.range = this.max - this.min;
    this.mPI = Math.PI * 0.8;
    this.toDeg = 180 / Math.PI;
    this.cirRange = this.mPI * 2;

    this.value = o.value || 0;

    this.radius = o.radius || 15;
    
    this.size = (this.radius*2)+20;

    if(o.size !== undefined){
        this.size = o.size;
        this.radius = ~~ (this.size-20)*0.5;
    }

    this.w = this.radius*2;
    this.height = this.radius*2;
    this.h = o.height || (this.height + 40);
    this.top = 0;

    this.c[0].style.width = this.size +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.size +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.percent = 0;

    this.c[2] = UIL.DOM('UIL text', 'div', 'top:'+(this.height+20)+'px; text-align:center; width:'+this.size+'px; padding:3px 5px; color:'+ this.fontColor );

    this.c[3] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius-4, fill:'rgba(0,0,0,0.3)' });
    this.c[4] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { cx:this.radius, cy:this.radius*0.5, r:3, fill:this.fontColor });
    this.c[5] = UIL.DOM('UIL svgbox', 'path', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { d:this.makeGrad(), 'stroke-width':1, stroke:UIL.SVGC });
    
    UIL.DOM( null, 'circle', null, { cx:this.radius, cy:this.radius, r:this.radius*0.7, fill:UIL.bgcolor(UIL.COLOR, 1), 'stroke-width':1, stroke:UIL.SVGC }, this.c[3] );

    this.c[3].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.r = 0;

    this.init();

    this.update();

};

UIL.Knob.prototype = Object.create( UIL.Circular.prototype );
UIL.Knob.prototype.constructor = UIL.Knob;

UIL.Knob.prototype.move = function( e ){

    if( !this.isDown ) return;

    var x = this.radius - (e.clientX - this.rect.left);
    var y = this.radius - (e.clientY - this.rect.top);
    this.r = - Math.atan2( x, y );

    if( this.oldr !== null ) this.r = Math.abs(this.r - this.oldr) > Math.PI ? this.oldr : this.r;

    this.r = this.r > this.mPI ? this.mPI : this.r;
    this.r = this.r < -this.mPI ? -this.mPI : this.r;

    var steps = 1 / this.cirRange;
    var value = (this.r + this.mPI) * steps;

    var n = ( ( this.range * value ) + this.min ) - this.old;

    if(n >= this.step || n <= this.step){ 
        n = ~~ ( n / this.step );
        this.value = this.numValue( this.old + ( n * this.step ) );
        this.update( true );
        this.old = this.value;
        this.oldr = this.r;
    }
    

};

UIL.Knob.prototype.makeGrad = function(){

    var d = '';
    var startangle = Math.PI+this.mPI;
    var endangle = Math.PI-this.mPI;
    var step = (startangle-endangle)/this.radius;
    var r = this.radius;

    var a, x, y, x2, y2;

    for ( var i = 0; i <= this.radius; ++i ) {

        a = startangle-(step*i);
        x = r + Math.sin(a)*r;
        y = r + Math.cos(a)*r;
        x2 = r + Math.sin(a)*(r-3);
        y2 = r + Math.cos(a)*(r-3);
        d += 'M' + x + ' ' + y + ' L' + x2 + ' '+y2 + ' ';

    }

    return d;

};

UIL.Knob.prototype.update = function( up ){

    this.c[2].textContent = this.value;
    this.percent = (this.value - this.min) / this.range;

    this.rr = ( (this.percent*this.cirRange) - (this.mPI)) * this.toDeg;

    UIL.setSvg( this.c[4], 'transform', 'rotate('+this.rr+' '+this.radius+' '+this.radius+')' );

    if( up ) this.callback(this.value);
    
};
UIL.Joystick = function( o ){

    UIL.Proto.call( this, o );
    this.type = 'joystick';

    this.value = [0,0];

    this.precision = o.precision || 2;
    this.multiplicator = o.multiplicator || 1;

    this.x = 0;
    this.y = 0;

    this.oldx = 0;
    this.oldy = 0;

    this.interval = null;

    this.radius = o.radius || 50;

    this.size = (this.radius*2)+20;

    if(o.size !== undefined){
        this.size = o.size;
        this.radius = ~~ (this.size-20)*0.5;
    }

    this.innerRadius = o.innerRadius || this.radius*0.6;
    this.maxDistance = this.radius - this.innerRadius - 5;
    this.height = this.radius*2;
    this.h = o.height || (this.height + 40);

    this.top = 0;

    this.c[0].style.width = this.size +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.size +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.c[2] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'url(#grad)' });
    this.c[3] = UIL.DOM('UIL svgbox', 'circle', 'left:0px; top:'+(this.top-10)+'px; width:'+(this.w+20)+'px; height:'+(this.height+20)+'px; pointer-events:none;', { cx:this.radius+10, cy:this.radius+10, r:this.innerRadius+10, fill:'url(#gradS)'});
    this.c[4] = UIL.DOM('UIL svgbox', 'circle', 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px; pointer-events:none;', { cx:this.radius, cy:this.radius, r:this.innerRadius, fill:'url(#gradIn)', 'stroke-width':1, stroke:'#000'  });
    this.c[5] = UIL.DOM('UIL text', 'div', 'top:'+(this.height+20)+'px; text-align:center; width:'+this.size+'px; padding:3px 5px; color:'+ this.fontColor );

    // gradian bakground
    UIL.DOM( null, 'defs', null, {}, this.c[2] );
    UIL.DOM( null, 'radialGradient', null, {id:'grad', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, this.c[2], 1 );
    UIL.DOM( null, 'stop', null, { offset:'40%', style:'stop-color:rgb(0,0,0); stop-opacity:0.3;' }, this.c[2].childNodes[1], 0 );
    UIL.DOM( null, 'stop', null, { offset:'80%', style:'stop-color:rgb(0,0,0); stop-opacity:0;' }, this.c[2].childNodes[1], 0 );
    UIL.DOM( null, 'stop', null, { offset:'90%', style:'stop-color:rgb(50,50,50); stop-opacity:0.4;' }, this.c[2].childNodes[1], 0 );
    UIL.DOM( null, 'stop', null, { offset:'100%', style:'stop-color:rgb(50,50,50); stop-opacity:0;' }, this.c[2].childNodes[1], 0 );

    // gradian shadow
    UIL.DOM( null, 'defs', null, {}, this.c[3] );
    UIL.DOM( null, 'radialGradient', null, {id:'gradS', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, this.c[3], 1 );
    UIL.DOM( null, 'stop', null, { offset:'60%', style:'stop-color:rgb(0,0,0); stop-opacity:0.5;' }, this.c[3].childNodes[1], 0 );
    UIL.DOM( null, 'stop', null, { offset:'100%', style:'stop-color:rgb(0,0,0); stop-opacity:0;' }, this.c[3].childNodes[1], 0 );

    // gradian stick
    var color0 = 'rgb(40,40,40)';
    var color1 = 'rgb(48,48,48)';
    var color2 = 'rgb(30,30,30)';

    var color3 = 'rgb(1,90,197)';
    var color4 = 'rgb(3,95,207)';
    var color5 = 'rgb(0,65,167)';
    UIL.DOM( null, 'defs', null, {}, this.c[4] );
    UIL.DOM( null, 'radialGradient', null, {id:'gradIn', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, this.c[4], 1 );
    UIL.DOM( null, 'stop', null, { offset:'30%', style:'stop-color:'+color0+'; stop-opacity:1;' }, this.c[4].childNodes[1], 0 );
    UIL.DOM( null, 'stop', null, { offset:'60%', style:'stop-color:'+color1+'; stop-opacity:1;' }, this.c[4].childNodes[1], 0 );
    UIL.DOM( null, 'stop', null, { offset:'80%', style:'stop-color:'+color1+'; stop-opacity:1;' }, this.c[4].childNodes[1], 0 );
    UIL.DOM( null, 'stop', null, { offset:'100%', style:'stop-color:'+color2+'; stop-opacity:1;' }, this.c[4].childNodes[1], 0 );

    UIL.DOM( null, 'radialGradient', null, {id:'gradIn2', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, this.c[4], 1 );
    UIL.DOM( null, 'stop', null, { offset:'30%', style:'stop-color:'+color3+'; stop-opacity:1;' }, this.c[4].childNodes[1], 1 );
    UIL.DOM( null, 'stop', null, { offset:'60%', style:'stop-color:'+color4+'; stop-opacity:1;' }, this.c[4].childNodes[1], 1 );
    UIL.DOM( null, 'stop', null, { offset:'80%', style:'stop-color:'+color4+'; stop-opacity:1;' }, this.c[4].childNodes[1], 1 );
    UIL.DOM( null, 'stop', null, { offset:'100%', style:'stop-color:'+color5+'; stop-opacity:1;' }, this.c[4].childNodes[1], 1 );

    this.c[5].textContent = 'x'+ this.value[0] +' y' + this.value[1];

    this.c[2].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    this.update(false);
}

UIL.Joystick.prototype = Object.create( UIL.Proto.prototype );
UIL.Joystick.prototype.constructor = UIL.Joystick;

UIL.Joystick.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'mouseover': this.over( e ); break;
        case 'mousedown': this.down( e ); break;
        case 'mouseout':  this.out( e );  break;

        case 'mouseup':   this.up( e );   break;
        case 'mousemove': this.move( e ); break;
    }

};

UIL.Joystick.prototype.mode = function( mode ){

    switch(mode){
        case 0: // base
            //UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.2)');
            UIL.setSvg( this.c[4], 'fill','url(#gradIn)');
            UIL.setSvg( this.c[4], 'stroke', '#000' );
        break;
        case 1: // over
            //UIL.setSvg( this.c[3], 'fill','rgba(0,0,0,0.6)');
            UIL.setSvg( this.c[4], 'fill', 'url(#gradIn2)' );
            UIL.setSvg( this.c[4], 'stroke', 'rgba(0,0,0,0)' );
        break;
        case 2: // edit
        break;

    }
}

UIL.Joystick.prototype.over = function( e ){

    this.isOver = true;
    this.mode(1);

};

UIL.Joystick.prototype.out = function( e ){

    this.isOver = false;
    if(this.isDown) return;
    this.mode(0);

};

UIL.Joystick.prototype.up = function( e ){

    this.isDown = false;
    document.removeEventListener( 'mouseup', this, false );
    document.removeEventListener( 'mousemove', this, false );

    this.interval = setInterval(this.update.bind(this), 10);

    if(this.isOver) this.mode(1);
    else this.mode(0);
    

};

UIL.Joystick.prototype.down = function( e ){

  

    this.isDown = true;
    document.addEventListener( 'mouseup', this, false );
    document.addEventListener( 'mousemove', this, false );

    this.rect = this.c[2].getBoundingClientRect();
    //this.old = this.value;
    //this.oldr = null;
    this.move( e );
    this.mode(2);

};

UIL.Joystick.prototype.move = function( e ){

    if( !this.isDown ) return;

    var x = this.radius - (e.clientX - this.rect.left);
    var y = this.radius - (e.clientY - this.rect.top);

    var distance = Math.sqrt(x * x + y * y);

    if (distance > this.maxDistance) {
        var angle = Math.atan2(x, y);
        x = Math.sin(angle) * this.maxDistance;
        y = Math.cos(angle) * this.maxDistance;
    }

    this.x = x / this.maxDistance;
    this.y = y / this.maxDistance;

    this.update();

};

UIL.Joystick.prototype.update = function(up){

    if(up === undefined) up = true;

    if(this.interval !== null){

        if( !this.isDown ){
            this.x += (0 - this.x)/3;
            this.y += (0 - this.y)/3;
        }

        if ( this.x.toFixed(2) === this.oldx.toFixed(2) && this.y.toFixed(2) === this.oldy.toFixed(2)){
            
            this.x = 0;
            this.y = 0;
        }

    }

    var rx = this.x * this.maxDistance
    var ry = this.y * this.maxDistance

    var x = this.radius - rx;
    var y = this.radius - ry;
    var sx = x + ((1-this.x)*5) + 5;
    var sy = y + ((1-this.y)*5) + 10;

    this.value[0] = -(this.x*this.multiplicator).toFixed(this.precision) * 1;
    this.value[1] =  (this.y*this.multiplicator).toFixed(this.precision) * 1;

    this.c[5].textContent = 'x'+ this.value[0] +' y' + this.value[1];

    UIL.setSvg( this.c[3], 'cx', sx );
    UIL.setSvg( this.c[3], 'cy', sy );
    UIL.setSvg( this.c[4], 'cx', x );
    UIL.setSvg( this.c[4], 'cy', y );

    this.oldx = this.x;
    this.oldy = this.y;

    if(up) this.callback(this.value);

    if( this.interval !== null && this.x === 0 && this.y === 0 ){
        clearInterval(this.interval);
        this.interval = null;
    }

};
