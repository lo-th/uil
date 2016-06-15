UIL.Button = function( o ){

    UIL.Proto.call( this, o );

    this.value = o.value || false;
    this.buttonColor = o.bColor || UIL.BUTTON;

    this.isLoadButton = o.loader || false;
    this.isDragButton = o.drag || false;
    this.r = o.r || 0;

    this.c[2] = UIL.DOM('UIL', 'div', 'border:1px solid '+UIL.Border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.r+'px;' );
    this.c[3] = UIL.DOM('UIL text', 'div', 'text-align:center; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
    this.c[3].style.color = this.fontColor;

    this.c[2].events = [ 'click', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

    if( this.c[1] !== undefined ) this.c[1].textContent = '';
    this.c[3].innerHTML = this.txt;

    if( this.isLoadButton ) this.initLoader();
    if( this.isDragButton ) this.initDrager();

    this.init();

};

UIL.Button.prototype = Object.create( UIL.Proto.prototype );
UIL.Button.prototype.constructor = UIL.Button;

UIL.Button.prototype.handleEvent = function( e ) {

    e.preventDefault();

    switch( e.type ) {
        case 'click': this.click( e ); break;
        case 'mouseover': this.mode( 1 ); break;
        case 'mousedown': this.mode( 2 ); break;
        case 'mouseup': this.mode( 0 ); break;
        case 'mouseout': this.mode( 0 ); break;
        case 'change': this.fileSelect( e.target.files[0] ); break;

        case 'dragover': this.dragover(); break;
        case 'dragend': this.dragend(); break;
        case 'dragleave': this.dragend(); break;
        case 'drop': this.drop( e ); break;
    }

};

UIL.Button.prototype.dragover = function(){
    this.s[5].borderColor = UIL.SELECT;
    this.s[5].color = UIL.SELECT;
};
UIL.Button.prototype.dragend = function(){
    this.s[5].borderColor = this.fontColor;
    this.s[5].color = this.fontColor;
};
UIL.Button.prototype.drop = function(e){
    this.dragend();
    this.fileSelect( e.dataTransfer.files[0] );
};

UIL.Button.prototype.mode = function( mode ){

    var s = this.s;

    switch(mode){
        case 0: // base
            s[3].color = this.fontColor;
            s[2].background = this.buttonColor;
        break;
        case 1: // over
            s[3].color = '#FFF';
            s[2].background = UIL.SELECT;
        break;
        case 2: // edit / down
            s[3].color = this.fontColor;
            s[2].background = UIL.SELECTDOWN;
        break;

    }
}

UIL.Button.prototype.initDrager = function(){

    this.c[5] = UIL.DOM('UIL text', 'div', ' text-align:center; line-height:'+(this.h-8)+'px; border:1px dashed '+this.fontColor+'; top:2px; pointer-events:auto; cursor:default; height:'+(this.h-4)+'px; border-radius:'+this.r+'px;' );
    this.c[5].textContent = 'DRAG';

    this.c[2].events = [  ];
    this.c[5].events = [ 'dragover', 'dragend', 'dragleave', 'drop' ];


};

UIL.Button.prototype.initLoader = function(){

    this.c[4] = UIL.DOM('UIL', 'input', 'border:1px solid '+UIL.Border+'; top:1px; opacity:0; pointer-events:auto; cursor:pointer; height:'+(this.h-2)+'px;' );
    this.c[4].name = 'loader';
    this.c[4].type = "file";

    this.c[2].events = [  ];
    this.c[4].events = [ 'change', 'mouseover', 'mousedown', 'mouseup', 'mouseout' ];

    //this.hide = document.createElement('input');

};

UIL.Button.prototype.fileSelect = function( file ){

    //if( ! e.target.files ) return;

    //var file = e.target.files[0];
   
    this.c[4].type = "null";
    // console.log( this.c[4] )

    if( file === undefined ) return;

    var reader = new FileReader();
    var fname = file.name;
    var type = fname.substring(fname.indexOf('.')+1, fname.length );

    if( type === 'png' || type === 'jpg' ) reader.readAsDataURL( file );
    else if(type === 'z') reader.readAsBinaryString( file );
    else reader.readAsText( file );

    reader.onload = function(e) { 
        this.callback( e.target.result, fname, type );
         this.c[4].type = "file";
        //this.send( e.target.result ); 
    }.bind(this);

};

UIL.Button.prototype.click = function( e ){

    this.send();

};

UIL.Button.prototype.label = function( string ){

    this.c[3].textContent = string;

};

UIL.Button.prototype.icon = function( string, y ){

    this.s[3].padding = ( y || 0 )+'px 0px';
    this.c[3].innerHTML = string;

};

UIL.Button.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    var s = this.s;
    var w = this.sb;
    var d = this.sa;

    if(this.isDragButton){ 
        w = (w*0.5)-5;

        s[5].left = (d+w+5) + 'px';
        s[5].width = w + 'px';
    }

    s[2].left = d + 'px';
    s[2].width = w + 'px';

    s[3].left = d + 'px';
    s[3].width = w + 'px';

    if(s[4]){
        s[4].left = d + 'px';
        s[4].width = w + 'px';
    }

    

};