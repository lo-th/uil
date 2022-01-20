import { Proto } from '../core/Proto.js';

export class Button extends Proto {

    constructor( o = {} ) {

        super( o )

        this.value = o.value || '';

        this.values = o.value || this.txt
        if( o.values ) this.values = o.values

        

        this.onName = o.onName || null;

        this.on = false;

        this.customSize = o.forceWidth || -1;

        if( typeof this.values === 'string' ) this.values = [ this.values ];

        this.isDown = false
        this.neverlock = true
        this.isLoadButton = o.loader || false
        this.isDragButton = o.drag || false
        this.res = 0
        
        if( this.isDragButton ) this.isLoadButton = true

        this.lng = this.values.length;
        this.tmp = []
        this.stat = []

        let sel, cc = this.colors;

        for( let i = 0; i < this.lng; i++ ){

            sel = false
            if( this.values[i] === this.value && this.isSelectable ) sel = true

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; height:'+(this.h-2)+'px; border:'+cc.borderSize+'px solid '+cc.border+'; border-radius:'+this.radius+'px;' );
            this.c[i+2].style.background = sel ? cc.select : cc.button
            this.c[i+2].style.color = sel ? cc.textSelect : cc.text
            this.c[i+2].innerHTML = this.values[i];
            this.stat[i] = sel ? 3:1;

        }

        if( !o.value && !o.values ){
            if( this.c[1] !== undefined ) { 
                this.txt = ''
                this.c[1].textContent = '';
            }
        } 
        if( !this.txt ) this.p = 0 

        //

        if( this.isLoadButton ) this.initLoader();
        if( this.isDragButton ){ 
            this.lng ++;
            this.initDrager();
        }

        //if( this.onName !== '' ) this.values[0] = this.on;

        this.init();

    }

    onOff() {

        this.on = !this.on;
        this.label( this.on ? this.onName : this.txt )
        
    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return -1

        let i = this.lng
        let t = this.tmp
        
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

        this.isDown = false
        if( this.res !== -1 ){
            if( this.value === this.values[this.res] && this.unselectable ) this.value = ''
            else this.value = this.values[this.res]
            if( this.onName !== null ) this.onOff()
            if( !this.isLoadButton ) this.send()
        }

        return this.mousemove( e )

    }

    mousedown ( e ) {

        if( this.isDown ) return false
        this.isDown = true
    	return this.mousemove( e )

    }

    mousemove ( e ) {

        let up = false
        this.res = this.testZone( e )

        if( this.res !== -1 ){
            this.cursor('pointer')
            up = this.modes( this.isDown ? 3 : 2, this.res )
        } else {
        	up = this.reset()
        }

        return up

    }

    // ----------------------

    modes ( N = 1, id = -1 ) {

        let i = this.lng, w, n, r = false

        while( i-- ){

            n = N
            w = this.isSelectable ? this.values[ i ] === this.value : false
            
            if( i === id ){
                if( w && n === 2 ) n = 3 
            } else {
                n = 1
                if( w ) n = 4
            }

            //if( this.mode( n, i ) ) r = true
            r = this.mode( n, i )

        }

        return r

    }

    mode ( n, id ) {

        //if(!this.s) return false
 
        let change = false;
        let cc = this.colors, s = this.s
        let i = id+2

        if( this.stat[id] !== n ){

            this.stat[id] = n;
        
            switch( n ){

                case 1: s[i].color = cc.text; s[i].background = cc.button; break;
                case 2: s[i].color = cc.textOver; s[i].background = cc.overoff; break;
                case 3: s[i].color = cc.textOver; s[i].background = cc.over; break;
                case 4: s[i].color = cc.textSelect; s[i].background = cc.select; break;

            }

            change = true;

        }

        return change

    }

    // ----------------------

    reset () {

        this.res = -1
        this.cursor()
        return this.modes()

    }

    // ----------------------

    dragover ( e ) {

        e.preventDefault();

        this.s[4].borderColor = this.colors.select;
        this.s[4].color = this.colors.select;

    }

    dragend ( e ) {

        e.preventDefault();

        this.s[4].borderColor = this.color.text;
        this.s[4].color = this.color.text;

    }

    drop ( e ) {

        e.preventDefault();

        this.dragend(e);
        this.fileSelect( e.dataTransfer.files[0] );

    }

    initDrager () {

        this.c[4] = this.dom( 'div', this.css.txt +' text-align:center; line-height:'+(this.h-8)+'px; border:1px dashed '+this.color.text+'; top:2px;  height:'+(this.h-4)+'px; border-radius:'+this.radius+'px; pointer-events:auto;' );// cursor:default;
        this.c[4].textContent = 'DRAG';

        this.c[4].addEventListener( 'dragover', function(e){ this.dragover(e); }.bind(this), false );
        this.c[4].addEventListener( 'dragend', function(e){ this.dragend(e); }.bind(this), false );
        this.c[4].addEventListener( 'dragleave', function(e){ this.dragend(e); }.bind(this), false );
        this.c[4].addEventListener( 'drop', function(e){ this.drop(e); }.bind(this), false );

        //this.c[2].events = [  ];
        //this.c[4].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];


    }

    addLoader( n, callbackLoad ){

        this.callbackLoad = callbackLoad

        let l = this.dom( 'input', this.css.basic +'top:0px; opacity:0; height:100%; width:100%; pointer-events:auto; cursor:pointer;' );//
        l.name = 'loader'
        l.type = "file"
        l.addEventListener( 'change', function(e){ this.fileSelect( e.target.files[0] ); }.bind(this), false )

        this.c[n].appendChild( l )

        return this

    }

    initLoader () {

        this.c[3] = this.dom( 'input', this.css.basic +'top:0px; opacity:0; height:'+(this.h)+'px; pointer-events:auto; cursor:pointer;' );//
        this.c[3].name = 'loader';
        this.c[3].type = "file";

        this.c[3].addEventListener( 'change', function(e){ this.fileSelect( e.target.files[0] ); }.bind(this), false );
        //this.c[3].addEventListener( 'mousedown', function(e){  }.bind(this), false );

        //this.c[2].events = [  ];
        //this.c[3].events = [ 'change', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

        //this.hide = document.createElement('input');

    }

    fileSelect ( file ) {

        let dataUrl = [ 'png', 'jpg', 'mp4', 'webm', 'ogg' ];
        let dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'BVH', 'glb' ];

        //if( ! e.target.files ) return;

        //let file = e.target.files[0];
       
        //this.c[3].type = "null";
        // console.log( this.c[4] )

        if( file === undefined ) return;

        let reader = new FileReader();
        let fname = file.name;
        let type = fname.substring(fname.lastIndexOf('.')+1, fname.length );

        if( dataUrl.indexOf( type ) !== -1 ) reader.readAsDataURL( file );
        else if( dataBuf.indexOf( type ) !== -1 ) reader.readAsArrayBuffer( file );//reader.readAsArrayBuffer( file );
        else reader.readAsText( file );

        // if( type === 'png' || type === 'jpg' || type === 'mp4' || type === 'webm' || type === 'ogg' ) reader.readAsDataURL( file );
        //else if( type === 'z' ) reader.readAsBinaryString( file );
        //else if( type === 'sea' || type === 'bvh' || type === 'BVH' || type === 'z') reader.readAsArrayBuffer( file );
        //else if(  ) reader.readAsArrayBuffer( file );
        //else reader.readAsText( file );

        reader.onload = function (e) {

            if( this.callbackLoad ) this.callbackLoad( e.target.result, fname, type );
            
            //if( this.callback ) this.callback( e.target.result, fname, type );
            //this.c[3].type = "file";
            //this.send( e.target.result ); 
        }.bind(this);

    }

    label ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

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
        let dc =  3;
        let size = Math.floor( ( w-(dc*(i-1)) ) / i );

        if( this.customSize !== -1 ){ 
            size = this.customSize
           // d = (this.s-size)*0.5

        }

        while( i-- ){

        	this.tmp[i] = [ Math.floor( d + ( size * i ) + ( dc * i )), size ];
        	this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1];

            s[i+2].left = this.tmp[i][0] + 'px';
            s[i+2].width = this.tmp[i][1] + 'px';

        }

        if( this.isDragButton ){ 
            s[4].left = (d+size+dc) + 'px';
            s[4].width = size + 'px';
        }

        if( this.isLoadButton ){
            s[3].left = d + 'px';
            s[3].width = size + 'px';
        }

    }

}