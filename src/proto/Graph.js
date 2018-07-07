import { Proto } from '../core/Proto';
import { V2 } from '../core/V2';

function Graph ( o ) {

	Proto.call( this, o );

	this.value = o.value !== undefined ? o.value : [0,0,0];
    this.lng = this.value.length;

    this.precision = o.precision || 2;
    this.multiplicator = o.multiplicator || 1;

    this.autoWidth = true;
    this.isNumber = false;

    this.isDown = false;

    this.h = o.h || 128 + 10;
    this.rh = this.h - 10;
    this.top = 0;

    this.c[0].style.width = this.w +'px';

    if( this.c[1] !== undefined ) { // with title

        this.c[1].style.width = this.w +'px';
        
        
        //this.c[1].style.background = '#ff0000';
        //this.c[1].style.textAlign = 'center';
        this.top = 10;
        this.h += 10;

    }

    this.gh = this.rh - 28;
    this.gw = this.w - 28;

    this.c[2] = this.dom( 'div', this.css.txt + 'text-align:center; top:'+(this.h-20)+'px; width:'+this.w+'px; color:'+ this.fontColor );
    this.c[2].textContent = this.value;

    var svg = this.dom( 'svg', this.css.basic , { viewBox:'0 0 '+this.w+' '+this.rh, width:this.w, height:this.rh, preserveAspectRatio:'none' } );
    this.setCss( svg, { width:this.w, height:this.rh, left:0, top:this.top });

    this.dom( 'path', '', { d:'', stroke:this.colors.text, 'stroke-width':2, fill:'none', 'stroke-linecap':'butt' }, svg );
    this.dom( 'rect', '', { x:10, y:10, width:this.gw+8, height:this.gh+8, stroke:'rgba(0,0,0,0.3)', 'stroke-width':1 , fill:'none'}, svg );

    this.iw = ((this.gw-(4*(this.lng-1)))/this.lng);
    var t = [];
    this.cMode = [];

    this.v = [];

    for( var i = 0; i < this.lng; i++ ){

    	t[i] = [ 14 + (i*this.iw) + (i*4), this.iw ];
    	t[i][2] = t[i][0] + t[i][1];
    	this.cMode[i] = 0;
    	this.v[i] = this.value[i] / this.multiplicator;

    	this.dom( 'rect', '', { x:t[i][0], y:14, width:t[i][1], height:1, fill:this.fontColor, 'fill-opacity':0.3 }, svg );

    }

    this.tmp = t;
    this.c[3] = svg;

    this.init();

    if( this.c[1] !== undefined ){
        this.c[1].style.top = 0 +'px';
        this.c[1].style.height = 20 +'px';
        this.s[1].lineHeight = (20-5)+'px'
    }

    this.update( false );

}

Graph.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Graph,

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        var i = this.lng;
        var t = this.tmp;
        
	    if( l.y>this.top && l.y<this.h-20 ){
	        while( i-- ){
	            if( l.x>t[i][0] && l.x<t[i][2] ) return i;
	        }
	    }

        return ''

    },

    mode: function ( n, name ) {

    	if( n === this.cMode[name] ) return false;

    	var a;

        switch(n){
            case 0: a=0.3; break;
            case 1: a=0.6; break;
            case 2: a=1; break;
        }

        this.reset()

        this.setSvg( this.c[3], 'fill-opacity', a, name + 2 );
        this.cMode[name] = n;

        return true;



    },

    // ----------------------
    //   EVENTS
    // ----------------------

    reset: function () {

    	var nup = false;
        //this.isDown = false;

        var i = this.lng;
        while(i--){ 
            if( this.cMode[i] !== 0 ){
                this.cMode[i] = 0;
                this.setSvg( this.c[3], 'fill-opacity', 0.3, i + 2 );
                nup = true;
            }
        }

        return nup;

    },

    mouseup: function ( e ) {

        this.isDown = false;
        if( this.current !== -1 ) return this.reset();
        
    },

    mousedown: function ( e ) {

    	this.isDown = true;
        return this.mousemove( e );

    },

    mousemove: function ( e ) {

    	var nup = false;

    	var name = this.testZone(e);

    	if( name === '' ){

            nup = this.reset();
            //this.cursor();

        } else { 

            nup = this.mode( this.isDown ? 2 : 1, name );
            //this.cursor( this.current !== -1 ? 'move' : 'pointer' );
            if(this.isDown){
            	this.v[name] = this.clamp( 1 - (( e.clientY - this.zone.y - this.top - 10 ) / this.gh) , 0, 1 );
            	this.update( true );
            }

        }

        return nup;

    },

    update: function ( up ) {

    	this.updateSVG();

        if( up ) this.send();

    },

    makePath: function () {

    	var p = "", h, w, wn, wm, ow, oh;
    	//var g = this.iw*0.5

    	for(var i = 0; i<this.lng; i++ ){

    		h = 14 + (this.gh - this.v[i]*this.gh);
    		w = (14 + (i*this.iw) + (i*4));

    		wm = w + this.iw*0.5;
    		wn = w + this.iw;

    		if(i===0) p+='M '+w+' '+ h + ' T ' + wm +' '+ h;
    		else p += ' C ' + ow +' '+ oh + ',' + w +' '+ h + ',' + wm +' '+ h;
    		if(i === this.lng-1) p+=' T ' + wn +' '+ h;

    		ow = wn
    		oh = h 

    	}

    	return p;

    },


    updateSVG: function () {

        this.setSvg( this.c[3], 'd', this.makePath(), 0 );

    	for(var i = 0; i<this.lng; i++ ){

    		
    		this.setSvg( this.c[3], 'height', this.v[i]*this.gh, i+2 );
    		this.setSvg( this.c[3], 'y', 14 + (this.gh - this.v[i]*this.gh), i+2 );
    		this.value[i] = (this.v[i] * this.multiplicator).toFixed( this.precision ) * 1;

	    }

	    this.c[2].textContent = this.value;

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var s = this.s;
        if( this.c[1] !== undefined )s[1].width = this.w + 'px';
        s[2].width = this.w + 'px';
        s[3].width = this.w + 'px';

        var gw = this.w - 28;
        var iw = ((gw-(4*(this.lng-1)))/this.lng);

        var t = [];

        for( var i = 0; i < this.lng; i++ ){

            t[i] = [ 14 + (i*iw) + (i*4), iw ];
            t[i][2] = t[i][0] + t[i][1];

        }

        this.tmp = t;

    }

} );

export { Graph };