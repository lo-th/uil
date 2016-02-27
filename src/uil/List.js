UIL.List = function( o ){

    UIL.Proto.call( this, o );

    this.autoHeight = true;
    var align = o.align || 'center';

    this.c[2] = UIL.DOM('UIL list');
    this.c[3] = UIL.DOM('UIL button', 'div', 'background:'+UIL.bgcolor(UIL.COLOR)+'; height:'+(this.h-2)+'px;' );
    this.c[4] = UIL.DOM('UIL', 'div', 'position:absolute; width:10px; height:10px; left:'+((this.sa+this.sb)-5)+'px; top:'+(~~(this.h*0.5)-5)+'px; background:'+ UIL.F0 );
    this.c[5] = UIL.DOM('UIL text', 'div', 'text-align:'+align+'; height:'+(this.h-4)+'px; line-height:'+(this.h-8)+'px;');
    this.c[6] = UIL.DOM('UIL', 'div', 'right:14px; top:'+this.h+'px; height:16px; width:10px; pointer-events:none; background:#666; display:none;');

    this.c[2].name = 'list';
    this.c[3].name = 'title';

    this.c[2].style.borderTop = this.h+'px solid transparent';

    this.c[5].style.color = this.fontColor;

    this.c[2].events = [ 'mousedown', 'mousemove', 'mouseup', 'mouseout', 'mousewheel' ];
    this.c[3].events = [ 'click', 'mousedown', 'mouseover', 'mouseout' ];

    this.list = o.list || [];
    if(o.value){
        if(!isNaN(o.value)) this.value = this.list[o.value];
        else this.value = o.value;
    }else{
        this.value = this.list[0];
    }

    this.baseH = this.h;

    this.show = false;
    this.maxItem = o.maxItem || 5;
    this.itemHeight = o.itemHeight || (this.h-3);
    this.length = this.list.length;

    // force full list 
    this.full = o.full || false;
    if(this.full) this.maxItem = this.length;
    
    this.maxHeight = this.maxItem * (this.itemHeight+1);
    this.max = this.length * (this.itemHeight+1);
    //this.range = this.max - this.maxHeight;
    this.ratio = this.maxHeight / this.max;
    this.sh = this.maxHeight * this.ratio;
    if( this.sh < 20 ) this.sh = 20;
    this.range = this.maxHeight - this.sh;
    this.c[6].style.height = this.sh + 'px';

    this.py = 0;
    this.w = this.sb;
    this.scroll = false;
    this.isDown = false;

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
        item = UIL.DOM('UIL listItem', 'div', 'width:'+this.w+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px;');
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
            this.c[3].style.background = UIL.bgcolor(UIL.COLOR);
        break;
        case 1: // over
            this.c[5].style.color = '#FFF';
            this.c[3].style.background = UIL.SELECT;
        break;
        case 2: // edit / down
            this.c[5].style.color = this.fontColor;
            this.c[3].style.background = UIL.SELECTDOWN;
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
        this.send();
        this.listHide();
    } else if ( name ==='list' && this.scroll ){
        this.isDown = true;
        this.listmove( e );
        this.listIn.style.background = 'rgba(0,0,0,0.6)';
        this.c[6].style.background = '#AAA';

        e.preventDefault();
    }

};

UIL.List.prototype.listmove = function( e ){

    if( this.isDown ){
        var rect = this.c[2].getBoundingClientRect();
        this.update( (e.clientY - rect.top - this.baseH)-(this.sh*0.5) );
    }

};

UIL.List.prototype.listup = function( e ){

    this.isDown = false;
    this.listIn.style.background = 'rgba(0,0,0,0.2)';
    this.c[6].style.background = '#666';

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

    this.update(this.py);

};


// ----- LIST

UIL.List.prototype.update = function( y ){

    if( !this.scroll ) return;

    y = y < 0 ? 0 :y;
    y = y > this.range ? this.range : y;

    this.listIn.style.top = -(~~( y / this.ratio ))+'px';
    this.c[6].style.top = ( ~~ y ) + this.baseH + 'px';

    this.py = y;

};

UIL.List.prototype.listShow = function(){

    this.update( 0 );
    this.show = true;
    this.h = this.maxHeight + this.baseH + 10;
    if( !this.scroll ){
        this.h = this.baseH + 10 + this.max;
        this.c[6].style.display = 'none';
        this.c[2].removeEventListener( 'mousewheel', this, false );
        this.c[2].removeEventListener( 'mousemove',  this, false ); 
    } else {
        this.c[6].style.display = 'block';
    }
    this.c[0].style.height = this.h+'px';
    this.c[2].style.display = 'block';
    if( this.side === 'up' ) this.c[4].style.background = UIL.F0;
    else this.c[4].style.background = UIL.F1;

    this.rSizeContent();

    if( this.parentGroup !== null ){ this.parentGroup.calc( this.h - this.baseH );}
    if( this.isUI ) UIL.main.calc( this.h - this.baseH );

};

UIL.List.prototype.listHide = function(){

    if( this.parentGroup !== null ){ this.parentGroup.calc( -(this.h-this.baseH) );}
    if( this.isUI ) UIL.main.calc(-(this.h-this.baseH));

    this.show = false;
    this.h = this.baseH;
    this.c[0].style.height = this.h + 'px';
    this.c[2].style.display = 'none';
    this.c[4].style.background = UIL.F0;
    
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

    this.c[2].style.width = this.sb + 'px';
    this.c[2].style.left = this.sa - 20 +'px';

    this.c[3].style.width = this.sb + 'px';
    this.c[3].style.left = this.sa + 'px';

    this.c[4].style.left = this.sa + this.sb - 17 + 'px';

    this.c[5].style.width = this.sb + 'px';
    this.c[5].style.left = this.sa + 'px';

    this.w = this.sb;
    if(this.max > this.maxHeight) this.w = this.sb-20;

    if(this.show) this.rSizeContent();

};