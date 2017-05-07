import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function Button ( o ) {

    Proto.call( this, o );

    this.value = o.value || [this.txt];

    this.buttonColor = o.bColor || Tools.colors.button;

    this.isLoadButton = o.loader || false;
    this.isDragButton = o.drag || false;
    if(this.isDragButton ) this.isLoadButton = true;
    //this.r = o.r || 3;

    this.lng = this.value.length;

    for(var i = 0; i < this.lng; i++){
        //this.c[i+2] = Tools.dom( 'div', Tools.css.txt + 'text-align:center; border:1px solid ' + Tools.colors.border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.r+'px; line-height:'+(this.h-4)+'px;' );
        this.c[i+2] = Tools.dom( 'div', Tools.css.txt + 'text-align:center; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px; line-height:'+(this.h-4)+'px;' );
        this.c[i+2].style.color = this.fontColor;

        this.c[i+2].events = [ 'click', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];
        this.c[i+2].innerHTML = this.value[i];//this.txt;
        this.c[i+2].name = i;
    }

    if( this.c[1] !== undefined ) this.c[1].textContent = '';
    

    if( this.isLoadButton ) this.initLoader();
    if( this.isDragButton ){ 
        this.lng ++;
        this.initDrager();
    }

    this.init();

};

Button.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Button,

    handleEvent: function ( e ) {

        e.preventDefault();

        switch( e.type ) {
            case 'click': this.click( e ); break;
            case 'mouseover': this.mode( 1, e ); break;
            case 'mousedown': this.mode( 2, e ); break;
            case 'mouseup': this.mode( 0, e ); break;
            case 'mouseout': this.mode( 0, e ); break;
            case 'change': this.fileSelect( e.target.files[0] ); break;

            case 'dragover': this.dragover(); break;
            case 'dragend': this.dragend(); break;
            case 'dragleave': this.dragend(); break;
            case 'drop': this.drop( e ); break;
        }

    },

    mode: function ( mode, e ) {

        var s = this.s;
        var i = e.target.name || 0;
        if(i==='loader') i = 0;

        switch( mode ){
            case 0: // base
                s[i+2].color = this.fontColor;
                s[i+2].background = this.buttonColor;
            break;
            case 1: // over
                s[i+2].color = '#FFF';
                s[i+2].background = Tools.colors.select;
            break;
            case 2: // edit / down
                s[i+2].color = this.fontColor;
                s[i+2].background = Tools.colors.down;
            break;

        }
    },

    dragover: function () {

        this.s[4].borderColor = Tools.colors.select;
        this.s[4].color = Tools.colors.select;

    },

    dragend: function () {

        this.s[4].borderColor = this.fontColor;
        this.s[4].color = this.fontColor;
    },

    drop: function ( e ) {

        this.dragend();
        this.fileSelect( e.dataTransfer.files[0] );

    },

    

    initDrager: function () {

        this.c[4] = Tools.dom( 'div', Tools.css.txt +' text-align:center; line-height:'+(this.h-8)+'px; border:1px dashed '+this.fontColor+'; top:2px; pointer-events:auto; cursor:default; height:'+(this.h-4)+'px; border-radius:'+this.r+'px;' );
        this.c[4].textContent = 'DRAG';

        this.c[2].events = [  ];
        this.c[4].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];


    },

    initLoader: function () {

        this.c[3] = Tools.dom( 'input', Tools.css.basic +'border:1px solid '+Tools.colors.border+'; top:1px; opacity:0; pointer-events:auto; cursor:pointer; height:'+(this.h-2)+'px;' );
        this.c[3].name = 'loader';
        this.c[3].type = "file";

        this.c[2].events = [  ];
        this.c[3].events = [ 'change', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

        //this.hide = document.createElement('input');

    },

    fileSelect: function ( file ) {

        var dataUrl = [ 'png', 'jpg', 'mp4', 'webm', 'ogg' ];
        var dataBuf = [ 'sea', 'bvh', 'BVH', 'z' ];

        //if( ! e.target.files ) return;

        //var file = e.target.files[0];
       
        //this.c[3].type = "null";
        // console.log( this.c[4] )

        if( file === undefined ) return;

        var reader = new FileReader();
        var fname = file.name;
        var type = fname.substring(fname.lastIndexOf('.')+1, fname.length );

        if( dataUrl.indexOf( type ) !== -1 ) reader.readAsDataURL( file );
        else if( dataBuf.indexOf( type ) !== -1 ) reader.readAsArrayBuffer( file );
        else reader.readAsText( file );

        // if( type === 'png' || type === 'jpg' || type === 'mp4' || type === 'webm' || type === 'ogg' ) reader.readAsDataURL( file );
        //else if( type === 'z' ) reader.readAsBinaryString( file );
        //else if( type === 'sea' || type === 'bvh' || type === 'BVH' || type === 'z') reader.readAsArrayBuffer( file );
        //else if(  ) reader.readAsArrayBuffer( file );
        //else reader.readAsText( file );

        reader.onload = function(e) {
            
            if( this.callback ) this.callback( e.target.result, fname, type );
            //this.c[3].type = "file";
            //this.send( e.target.result ); 
        }.bind(this);

    },

    click: function ( e ) {

        var i = e.target.name || 0;
        var v = this.value[i];

        this.send( v );

    },

    label: function ( string, n ) {

        n = n || 2;
        this.c[n].textContent = string;

    },

    icon: function ( string, y, n ) {

        n = n || 2;
        this.s[n].padding = ( y || 0 ) +'px 0px';
        this.c[n].innerHTML = string;

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var s = this.s;
        var w = this.sb;
        var d = this.sa;

        var i = this.lng;
        var dc =  3;
        var size = Math.floor( ( w-(dc*(i-1)) ) / i );

        while(i--){
            
            s[i+2].width = size + 'px';
            s[i+2].left = d + ( size * i ) + ( dc * i) + 'px';

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

} );

export { Button };