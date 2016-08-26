UIL.Fps = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;

    this.baseH = this.h;
    this.hplus = 50;


    this.nFrame = 40;
    this.l = 1;

    this.pa1 = [];
    this.pa2 = [];
    this.pa3 = [];

    var i = this.nFrame;
    while(i--){
        this.pa1.push(0);
        this.pa2.push(0);
        this.pa3.push(0);
    }

    //this.c[2] = UIL.DOM( null, 'div', UIL.TXT + 'width:100%; height:'+this.baseH+'px; cursor:pointer; pointer-events:auto; ');

    //this.c[2].textContent = 'FPS';
    this.c[1].textContent = 'FPS';
    this.c[0].style.cursor = 'pointer';
    this.c[0].style.pointerEvents = 'auto';

    var panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px;';

    this.c[2] = UIL.DOM( null, 'div', UIL.BASIC + panelCss + 'border:1px solid rgba(255, 255, 255, 0.2);');
    this.c[3] = UIL.DOM( null, 'div', UIL.BASIC + panelCss + 'border:1px solid rgba(255, 255, 255, 0);');
    this.c[4] = UIL.DOM( null, 'div', UIL.BASIC + panelCss + 'border:1px solid rgba(255, 255, 255, 0);');

    this.c[5] = UIL.DOM( null, 'div', UIL.BASIC + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');

    this.c[6] = UIL.DOM(null, 'path', UIL.BASIC + 'left:10px; top:'+this.h+'px; height:'+(this.hplus - 8)+'px;', {  height:(this.hplus - 8), d:this.makePath(this.pa1), 'stroke-width':2, stroke:'#F00' });

    //this.c[6].setAttribute('width', '100%' );
    //this.c[6].setAttribute('height', '100%' );

    console.log(this.c[6])
    




    


   // this.c[2] = UIL.DOM( null, 'canvas', UIL.BASIC + 'display:none; left:10px; top:'+ (this.h + 10) + 'px;');

    
    //this.c[2].height = this.hplus - 20;

    //this.ctx = this.c[2].getContext('2d');

    this.isShow = o.show || false;


    this.now = ( self.performance && self.performance.now ) ? self.performance.now.bind( performance ) : Date.now;
    this.startTime = this.now()
    this.prevTime = this.startTime;
    this.frames = 0

    this.isMem = false;

    this.ms = 0;
    this.fps = 0;
    this.mem = 0;
    this.mm = 0;

    

    if ( self.performance && self.performance.memory ) this.isMem = true;

    this.initGraph(1);
    //this.mode = 0;


    this.c[0].events = [ 'click', 'mousedown', 'mouseover', 'mouseout' ];

    this.init();

}

UIL.Fps.prototype = Object.create( UIL.Proto.prototype );
UIL.Fps.prototype.constructor = UIL.Fps;

UIL.Fps.prototype.handleEvent = function( e ) {

    e.preventDefault();
    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mouseover': this.mode(1); break;
        case 'mousedown': this.mode(2); break;
        case 'mouseout':  this.mode(0); break;
    }

}

UIL.Fps.prototype.click = function( e ){

    if( this.isShow ) this.hide();
    else this.show();

};

UIL.Fps.prototype.mode = function( mode ){

    var s = this.s;

    switch(mode){
        case 0: // base
            s[1].color = this.fontColor;
            s[1].background = 'none';
        break;
        case 1: // over
            s[1].color = '#FFF';
            s[1].background = UIL.SELECT;
        break;
        case 2: // edit / down
            s[1].color = this.fontColor;
            s[1].background = UIL.SELECTDOWN;
        break;

    }
}

UIL.Fps.prototype.initGraph = function( l ){

    //while (this.c[2].firstChild) this.c[2].removeChild(this.c[2].firstChild);
    //while (this.c[3].firstChild) this.c[3].removeChild(this.c[3].firstChild);
    //while (this.c[2].firstChild) this.c[4].removeChild(this.c[4].firstChild);
    

    var e, f, g;

    //var l = Math.floor( w / 60 );

    //console.log(w, l, l*60)

    for ( var i = 0; i < this.nFrame; i ++ ) {

        e = document.createElement( 'span' );
        f = document.createElement( 'span' );
        
        e.style.cssText = 'position:relative; width:'+l+'px; height:1px; top:38px; float:left; border-bottom: 1px solid rgba(0,0,0,0.5); background:#CCC;  pointer-events:none;';
        f.style.cssText = 'position:relative; width:'+l+'px; height:1px; top:38px; float:left; border-bottom: 1px solid rgba(0,0,0,0.5); background:#CC0;  pointer-events:none;';


        //graph.appendChild( createElement( 'span', '', 'width:1px; height:30px; margin-top:10px; float:left; opacity:0.9; background:none; border-bottom: 1px solid '+ fg ) );

        this.c[2].appendChild( e );
        this.c[3].appendChild( f );

        if ( this.isMem ) {

            g = document.createElement( 'span' );
            g.style.cssText = 'position:relative; width:'+l+'px; height:1px; top:38px; float:left; border-bottom: 1px solid rgba(0,0,0,0.5); background:#0CC;  pointer-events:none;';
            this.c[4].appendChild( g );

        }


    }

}

UIL.Fps.prototype.makePath = function ( point ) {

    var path = [];
    
    for ( var i = 0; i < this.nFrame; i ++ ) {
        if(i === 0 ) path.push( 'M ' + 0 + ' ' + point[i] );
        else path.push(' L ' + ((i+1)*this.l) + ' ' + point[i] );
    }

    return path;

};

UIL.Fps.prototype.resizeGraph = function( l ){

    for ( var i = 0; i < this.nFrame; i ++ ) {
        this.c[2].children[ i ].style.width = l + 'px';
        this.c[3].children[ i ].style.width = l + 'px';
        if ( this.isMem ) this.c[4].children[ i ].style.width = l + 'px';
    }

}

UIL.Fps.prototype.drawGraph = function( ){

    this.pa1.shift();
    this.pa1.push(  8 + Math.min( 30, 30 - (this.fps/ 100) * 30 ) );

    UIL.setSvg( this.c[6], 'd', this.makePath( this.pa1 ) );

    this.pa2.shift();
    this.pa2.push(  8 + Math.min( 30, 30 - (this.ms/ 200) * 30 ) );

    if ( this.isMem ) {

        this.pa3.shift();
        this.pa3.push(  8 + Math.min( 30, 30 - this.mm * 30 ) );

    }


    

    var c = this.c[2].appendChild( this.c[2].firstChild );
    c.style.top = 8 + Math.min( 30, 30 - (this.fps/ 100) * 30 ) + 'px';

    

    c = this.c[3].appendChild( this.c[3].firstChild );
    c.style.top = 8 + Math.min( 30, 30 - (this.ms/ 200) * 30 ) + 'px';

    if ( this.isMem ) {

        c = this.c[4].appendChild( this.c[4].firstChild );
        c.style.top = 8 + Math.min( 30, 30 - this.mm * 30 ) + 'px';

    }

}


UIL.Fps.prototype.show = function(){

    this.h = this.hplus + this.baseH;


    if( this.parentGroup !== null ){ this.parentGroup.calc( this.hplus );}
    else if( this.isUI ) this.main.calc( this.hplus );

    this.s[0].height = this.h +'px';
    this.s[2].display = 'block'; 
    this.s[3].display = 'block'; 
    this.s[4].display = 'block'; 
    this.isShow = true;

    UIL.addListen( this );

}

UIL.Fps.prototype.hide = function(){

    this.h = this.baseH;

    if( this.parentGroup !== null ){ this.parentGroup.calc( -this.hplus );}
    else if( this.isUI ) this.main.calc( -this.hplus );
    
    this.s[0].height = this.h +'px';
    this.s[2].display = 'none'; 
    this.s[3].display = 'none'; 
    this.s[4].display = 'none'; 
    this.isShow = false;

    UIL.removeListen( this );
    this.c[1].textContent = 'FPS';
    
}

UIL.Fps.prototype.rSize = function(){

    this.s[0].width = this.width + 'px';
    this.s[1].width = this.width + 'px';


    var l = Math.floor( (this.width - 20) / this.nFrame );
    var ww = (l * this.nFrame) + 2;
    var ll = Math.round((this.width - ww)*0.5);

    this.s[2].left = ll + 'px';
    this.s[3].left = ll + 'px';
    this.s[4].left = ll + 'px';

    this.s[2].width = ww + 'px';
    this.s[3].width = ww + 'px';
    this.s[4].width = ww + 'px';

    this.s[6].left = ll + 'px';
    this.s[6].width = ww + 'px';

    this.l = l;

    this.c[6].setAttribute('width', ww );
    //this.c[6].setAttribute('height', '100%' );

    //UIL.setSvg( this.c[6], 'width', ww );
    //UIL.setSvg( this.c[6], 'left', ll );

    this.resizeGraph(  l  );

    
}

UIL.Fps.prototype.begin = function(){

    this.startTime = this.now();
    
}



UIL.Fps.prototype.end = function(){


    var time = this.now();
    this.ms = time - this.startTime;
    //msMin = Math.min( msMin, ms );
    //msMax = Math.max( msMax, ms );



    //msText.textContent = ( ms | 0 ) + ' ms';// (' + ( msMin | 0 ) + '-' + ( msMax | 0 ) + ')';
    //updateGraph( msGraph, ms / 200 );

    this.frames ++;

    if ( time > this.prevTime + 1000 ) {

        this.fps = Math.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );
        //fpsMin = Math.min( fpsMin, fps );
        //fpsMax = Math.max( fpsMax, fps );


        //fpsText.textContent = this.fps + ' fps';// (' + fpsMin + '-' + fpsMax + ')';
        //updateGraph( fpsGraph, fps / 100 );

        this.prevTime = time;
        this.frames = 0;

        if ( this.isMem ) {

            var heapSize = performance.memory.usedJSHeapSize;
            var heapSizeLimit = performance.memory.jsHeapSizeLimit;

            this.mem = Math.round( heapSize * 0.000000954 );

            this.mm = heapSize / heapSizeLimit;
            //memMin = Math.min( memMin, mem );
            //memMax = Math.max( memMax, mem );


            //memText.textContent = mem + ' mb';// (' + memMin + '-' + memMax + ')';
            //updateGraph( memGraph, heapSize / heapSizeLimit );

        }

    }

    this.drawGraph();
    this.c[1].innerHTML = 'FPS ' + this.fps + ' . <font color="yellow"> MS '+ ( this.ms | 0 ) + '</font> . <font color="cyan"> MB '+ this.mem + '</font>';

    return time;

    
}

UIL.Fps.prototype.listening = function(){

    this.startTime = this.end();
    
}