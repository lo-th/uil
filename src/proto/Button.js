import { Proto } from '../core/Proto';


export class Button extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = false;

        this.values = o.value || this.txt;

        if( typeof this.values === 'string' ) this.values = [this.values];

        //this.selected = null;
        this.isDown = false;

        // custom color
        this.cc = [ this.colors.button, this.colors.select, this.colors.down ];

        if( o.cBg !== undefined ) this.cc[0] = o.cBg;
        if( o.bColor !== undefined ) this.cc[0] = o.bColor;
        if( o.cSelect !== undefined ) this.cc[1] = o.cSelect;
        if( o.cDown !== undefined ) this.cc[2] = o.cDown;

        this.isLoadButton = o.loader || false;
        this.isDragButton = o.drag || false;
        
        if( this.isDragButton ) this.isLoadButton = true;

        this.lng = this.values.length;
        this.tmp = [];
        this.stat = [];

        for( let i = 0; i < this.lng; i++ ){

            this.c[i+2] = this.dom( 'div', this.css.txt + this.css.button + 'top:1px; background:'+this.cc[0]+'; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:'+this.radius+'px;' );
            this.c[i+2].style.color = this.fontColor;
            this.c[i+2].innerHTML = this.values[i];
            this.stat[i] = 1;

        }

        if( this.c[1] !== undefined ) this.c[1].textContent = '';

        if( this.isLoadButton ) this.initLoader();
        if( this.isDragButton ){ 
            this.lng ++;
            this.initDrager();
        }

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let i = this.lng;
        let t = this.tmp;
        
        while( i-- ){
        	if( l.x>t[i][0] && l.x<t[i][2] ) return i+2;
        }

        return ''

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

    	let name = this.testZone( e );

        if( !name ) return false;

    	this.isDown = true;
        this.value = this.values[name-2]
        if( !this.isLoadButton ) this.send();
        //else this.fileSelect( e.target.files[0] );
    	return this.mousemove( e );
 
        // true;

    }

    mousemove ( e ) {

        let up = false;

        let name = this.testZone( e );

       // console.log(name)

        if( name !== '' ){
            this.cursor('pointer');
            up = this.modes( this.isDown ? 3 : 2, name );
        } else {
        	up = this.reset();
        }

        //console.log(up)

        return up;

    }

    // ----------------------

    modes ( n, name ) {

        let v, r = false;

        for( let i = 0; i < this.lng; i++ ){

            if( i === name-2 ) v = this.mode( n, i+2 );
            else v = this.mode( 1, i+2 );

            if(v) r = true;

        }

        return r;

    }


    mode ( n, name ) {

        let change = false;

        let i = name - 2;

        if( this.stat[i] !== n ){
        
            switch( n ){

                case 1: this.stat[i] = 1; this.s[ i+2 ].color = this.fontColor; this.s[ i+2 ].background = this.cc[0]; break;
                case 2: this.stat[i] = 2; this.s[ i+2 ].color = this.fontSelect; this.s[ i+2 ].background = this.cc[1]; break;
                case 3: this.stat[i] = 3; this.s[ i+2 ].color = this.fontSelect; this.s[ i+2 ].background = this.cc[2]; break;

            }

            change = true;

        }
        

        return change;

    }

    // ----------------------

    reset () {

        this.cursor();

        /*let v, r = false;

        for( let i = 0; i < this.lng; i++ ){
            v = this.mode( 1, i+2 );
            if(v) r = true;
        }*/

        return this.modes( 1 , 2 );

    	/*if( this.selected ){
    		this.s[ this.selected ].color = this.fontColor;
            this.s[ this.selected ].background = this.buttonColor;
            this.selected = null;
            
            return true;
    	}
        return false;*/

    }

    // ----------------------

    dragover ( e ) {

        e.preventDefault();

        this.s[4].borderColor = this.colors.select;
        this.s[4].color = this.colors.select;

    }

    dragend ( e ) {

        e.preventDefault();

        this.s[4].borderColor = this.fontColor;
        this.s[4].color = this.fontColor;

    }

    drop ( e ) {

        e.preventDefault();

        this.dragend(e);
        this.fileSelect( e.dataTransfer.files[0] );

    }

    initDrager () {

        this.c[4] = this.dom( 'div', this.css.txt +' text-align:center; line-height:'+(this.h-8)+'px; border:1px dashed '+this.fontColor+'; top:2px;  height:'+(this.h-4)+'px; border-radius:'+this.radius+'px; pointer-events:auto;' );// cursor:default;
        this.c[4].textContent = 'DRAG';

        this.c[4].addEventListener( 'dragover', function(e){ this.dragover(e); }.bind(this), false );
        this.c[4].addEventListener( 'dragend', function(e){ this.dragend(e); }.bind(this), false );
        this.c[4].addEventListener( 'dragleave', function(e){ this.dragend(e); }.bind(this), false );
        this.c[4].addEventListener( 'drop', function(e){ this.drop(e); }.bind(this), false );

        //this.c[2].events = [  ];
        //this.c[4].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];


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
            
            if( this.callback ) this.callback( e.target.result, fname, type );
            //this.c[3].type = "file";
            //this.send( e.target.result ); 
        }.bind(this);

    }

    label ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

    }

    icon ( string, y, n ) {

        n = n || 2;
        this.s[n].padding = ( y || 0 ) +'px 0px';
        this.c[n].innerHTML = string;

    }

    rSize () {

        super.rSize();

        let s = this.s;
        let w = this.sb;
        let d = this.sa;

        let i = this.lng;
        let dc =  3;
        let size = Math.floor( ( w-(dc*(i-1)) ) / i );

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