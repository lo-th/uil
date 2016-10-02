UIL.List = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;
    var align = o.align || 'center';

    this.buttonColor = UIL.BUTTON;

    var fltop = Math.floor(this.h*0.5)-5;
//transparent
    //this.c[2] = UIL.DOM( null, 'div', UIL.BASIC + 'box-sizing:content-box; border:20px solid transparent; border-bottom:10px solid transparent; top:0px; height:90px; cursor:s-resize; pointer-events:auto; display:none; overflow:hidden;');
    
    this.c[2] = UIL.DOM( null, 'div', UIL.BASIC + 'top:0; height:90px; cursor:s-resize; pointer-events:auto; display:none; overflow:hidden;');

    this.c[3] = UIL.DOM( null, 'div', UIL.BASIC + 'border:1px solid '+UIL.Border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px;' );
    this.c[4] = UIL.DOM( null, 'div', UIL.BASIC + 'position:absolute; width:10px; height:10px; left:'+((this.sa+this.sb)-5)+'px; top:'+fltop+'px; background:'+ UIL.F0 );
    this.c[5] = UIL.DOM( null, 'div', UIL.TXT   + 'text-align:'+align+'; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
    //this.c[6] = UIL.DOM( null, 'div', UIL.BASIC + 'right:14px; top:'+this.h+'px; height:16px; width:10px; pointer-events:none; background:#666; display:none;');

    this.scroller = UIL.DOM( null, 'div', UIL.BASIC + 'right:5px;  width:10px; pointer-events:none; background:#666; display:none;');

    this.c[2].name = 'list';
    this.c[3].name = 'title';

    //this.c[2].style.borderTop = this.h + 'px solid transparent';
    this.c[5].style.color = this.fontColor;

    this.c[2].events = [ 'mousedown', 'mousemove', 'mouseup', 'mousewheel', 'mouseout', 'mouseover' ];
    this.c[3].events = [ 'mousedown', 'mouseover' ,'mouseout']; 

    this.list = o.list || [];

    this.baseH = this.h;

    this.isShow = false;
    this.maxItem = o.maxItem || 5;
    this.itemHeight = o.itemHeight || (this.h-3);
    this.length = this.list.length;

    // force full list 
    this.full = o.full || false;
    //if(this.full) this.maxItem = this.length;
    
    this.maxHeight = this.maxItem * (this.itemHeight+1);

    this.py = 0;
    this.w = this.sb;
    this.scroll = false;
    this.isDown = false;

    // list up or down
    this.side = o.side || 'down';
    this.holdTop = 0;

    if( this.side === 'up' ){

        this.c[2].style.top = 'auto';
        //this.c[6].style.top = 'auto';
        this.c[3].style.top = 'auto';
        this.c[4].style.top = 'auto';
        this.c[5].style.top = 'auto';

        this.c[2].style.bottom = this.h + 'px';
        //this.c[6].style.bottom = this.h + 'px';
        this.c[3].style.bottom = '1px';
        this.c[4].style.bottom = fltop + 'px';
        this.c[5].style.bottom = '2px';

    } else {
        this.c[2].style.top = this.h + 'px';
        //this.c[6].style.top = this.h + 'px';
    }

    this.listIn = UIL.DOM( null, 'div', UIL.BASIC + 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2);');
    this.listIn.name = 'list';

    this.c[2].style.height = this.maxHeight + 'px';
    this.c[2].appendChild( this.listIn );

    this.c[2].appendChild( this.scroller );

    // populate list

    this.setList( this.list, o.value );

   
    

    this.init();

}

UIL.List.prototype = Object.create( UIL.Proto.prototype );
UIL.List.prototype.constructor = UIL.List;

UIL.List.prototype.clearList = function() {

    while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );

}

UIL.List.prototype.setList = function( list, value ) {

    this.clearList();

    this.list = list;
    this.length = this.list.length;

    if( this.full ) this.maxItem = this.length;
    this.max = this.length * (this.itemHeight+1);
    this.ratio = this.maxHeight / this.max;
    this.sh = this.maxHeight * this.ratio;
    this.range = this.maxHeight - this.sh;
    this.scroller.style.height = this.sh + 'px';

    if( this.max > this.maxHeight ){ 
        this.w = this.sb - 20;
        this.scroll = true;
    }

    var item, n, l = this.sb;
    for( var i=0; i<this.length; i++ ){
        n = this.list[i];
        item = UIL.DOM( null, 'div', UIL.ITEM + 'width:'+this.w+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px;');
        item.textContent = n;
        item.style.color = this.fontColor;
        item.name = 'item';
        this.listIn.appendChild( item );
    }

    if( value !== undefined ){
        if(!isNaN(value)) this.value = this.list[ value ];
        else this.value = value;
    }else{
        this.value = this.list[0];
    }
    
    this.c[5].textContent = this.value;

}

UIL.List.prototype.handleEvent = function( e ) {

    e.preventDefault();

    var name = e.target.name || '';
    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mouseover': if(name === 'title') this.mode(1); else this.listover(e); break;
        case 'mousedown': if(name === 'title') {  this.titleClick(e); } else this.listdown(e); break;
        case 'mouseup':   if(name === 'title') this.mode(0); else this.listup(e); break;
        case 'mouseout':  if(name === 'title') this.mode(0);  else this.listout(e); break;
        case 'mousemove': this.listmove(e); break;
        case 'mousewheel': this.listwheel(e); break;
    }

}

UIL.List.prototype.mode = function( mode ){

    var s = this.s;

    switch(mode){
        case 0: // base
            s[5].color = this.fontColor;
            s[3].background = this.buttonColor;
        break;
        case 1: // over
            s[5].color = '#FFF';
            s[3].background = UIL.SELECT;
        break;
        case 2: // edit / down
            s[5].color = this.fontColor;
            s[3].background = UIL.SELECTDOWN;
        break;

    }
}

// -----

UIL.List.prototype.click = function( e ){

    var name = e.target.name;
    if( name !== 'title' && name !== 'list' ) this.listHide();

};

UIL.List.prototype.titleClick = function( e ){

    if( this.isShow ) this.listHide();
    else {
        this.listShow(); 
        this.mode(2);
    }

};

// ----- LIST

UIL.List.prototype.listover = function( e ){
    var name = e.target.name;
    //console.log(name)
    if( name === 'item' ){
        e.target.style.background = UIL.SELECT;
        e.target.style.color = '#FFF'; 
    }

};

UIL.List.prototype.listdown = function( e ){

    var name = e.target.name;
    if( name !== 'list' && name !== undefined ){
        this.value = e.target.textContent;//name;
        this.c[5].textContent = this.value;
        this.send();
       // this.listHide();
    } else if ( name ==='list' && this.scroll ){
        this.isDown = true;
        this.listmove( e );
        this.listIn.style.background = 'rgba(0,0,0,0.6)';
        this.scroller.style.background = '#AAA';
    }

};

UIL.List.prototype.listmove = function( e ){

    if( this.isDown ){
        var rect = this.c[2].getBoundingClientRect();
        this.update( ( e.clientY - rect.top  ) - ( this.sh*0.5 ) );
    }

};

UIL.List.prototype.listup = function( e ){

    this.isDown = false;
    this.listIn.style.background = 'rgba(0,0,0,0.2)';
    this.scroller.style.background = '#666';

};

UIL.List.prototype.listout = function( e ){

    var n = e.target.name;
    if( n === 'item' ){
        e.target.style.background ='rgba(0,0,0,0.2)';
        e.target.style.color = this.fontColor; 
    }


    if( this.isUI ) this.main.lockwheel = false;
    this.listup();
    var name = e.relatedTarget.name;
    //if( name === undefined ) this.listHide();

    

};

UIL.List.prototype.listwheel = function( e ){

    if( !this.scroll ) return;
    if( this.isUI ) this.main.lockwheel = true;
    var delta = 0;
    if( e.wheelDeltaY ) delta = -e.wheelDeltaY*0.04;
    else if( e.wheelDelta ) delta = -e.wheelDelta*0.2;
    else if( e.detail ) delta = e.detail*4.0;

    this.py += delta;

    this.update(this.py);

};


// ----- LIST

UIL.List.prototype.update = function( y ){

    if( !this.scroll ) return;

    y = y < 0 ? 0 : y;
    y = y > this.range ? this.range : y;

    this.listIn.style.top = -Math.floor( y / this.ratio )+'px';
    this.scroller.style.top = Math.floor( y )  + 'px';

    this.py = y;

};

UIL.List.prototype.listShow = function(){

    document.addEventListener( 'click', this, false );

    this.update( 0 );
    this.isShow = true;
    this.h = this.maxHeight + this.baseH + 10;
    if( !this.scroll ){
        this.h = this.baseH + 10 + this.max;
        this.scroller.style.display = 'none';
    } else {
        this.scroller.style.display = 'block';
    }
    this.s[0].height = this.h + 'px';
    this.s[2].display = 'block';
    if( this.side === 'up' ) this.s[4].background = UIL.F0;
    else this.s[4].background = UIL.F1;

    this.rSizeContent();

    if( this.parentGroup !== null ) this.parentGroup.calc( this.h - this.baseH );
    else if( this.isUI ) this.main.calc( this.h - this.baseH );

};

UIL.List.prototype.listHide = function(){

    document.removeEventListener( 'click', this, false );

    if( this.parentGroup !== null ) this.parentGroup.calc( -(this.h-this.baseH) );
    else if( this.isUI ) this.main.calc(-(this.h-this.baseH));

    this.isShow = false;
    this.h = this.baseH;
    this.s[0].height = this.h + 'px';
    this.s[2].display = 'none';
    this.s[4].background = UIL.F0;
    
};

// -----

UIL.List.prototype.text = function( txt ){

    this.c[5].textContent = txt;

};

UIL.List.prototype.rSizeContent = function(){

    var i = this.length;
    while(i--) this.listIn.children[i].style.width = this.w + 'px';

};

UIL.List.prototype.rSize = function(){

    UIL.Proto.prototype.rSize.call( this );

    var s = this.s;

    s[2].width = this.sb + 'px';
    s[2].left = this.sa +'px';

    s[3].width = this.sb + 'px';
    s[3].left = this.sa + 'px';

    s[4].left = this.sa + this.sb - 17 + 'px';

    s[5].width = this.sb + 'px';
    s[5].left = this.sa + 'px';

    this.w = this.sb;
    if(this.max > this.maxHeight) this.w = this.sb-20;

    if(this.isShow) this.rSizeContent();

};