UIL.List = function( o ){

    UIL.Proto.call( this, o );

    this.c[2] = UIL.DOM('UIL list');
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', '', {width:'100%', height:17, fill:UIL.bgcolor(UIL.COLOR), 'stroke-width':1, stroke:UIL.SVGC  });
    this.c[4] = UIL.DOM('UIL', 'path','position:absolute; width:16px; height:16px; left:'+(this.sa+this.sb-17)+'px; top:1px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' } );
    this.c[5] = UIL.DOM('UIL text', 'div', 'text-align:center;');
    this.c[6] = UIL.DOM('UIL svgbox', 'rect', 'top:20px; height:90px; pointer-events:none;', { x:this.sb-15, y:0, width:10, height:16, fill:'#666', 'stroke-width':1, stroke:UIL.SVGC  });

    this.c[2].name = 'list';
    this.c[3].name = 'title';

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
        item.name = n;
        this.listIn.appendChild(item);
    }

    this.c[5].textContent = this.value;
    

    this.init();

}

UIL.List.prototype = Object.create( UIL.Proto.prototype );
UIL.List.prototype.constructor = UIL.List;

UIL.List.prototype.handleEvent = function( e ) {

    var name = e.target.name || '';
    switch( e.type ) {
        case 'click': this.click(e); break;
        case 'mouseover': this.over(e); break;
        case 'mousedown': if(name === 'title') this.down(e); else this.listdown(e); break;
        case 'mouseup': if(name === 'title') this.out(e); else this.listup(e); break;
        case 'mouseout': if(name === 'title') this.out(e); else this.listout(e); break;
        case 'mousemove': this.listmove(e); break;
        case 'mousewheel': this.listwheel(e); break;
    }

}

// -----

UIL.List.prototype.click = function( e ){

    if( this.show ) this.listHide();
    else this.listShow();

};

UIL.List.prototype.down = function( e ){

    this.c[5].style.color = '#CCC';
    UIL.setSvg( this.c[3], 'fill', UIL.SELECTDOWN );

};

UIL.List.prototype.over = function( e ){

    this.c[5].style.color = '#FFF';
    UIL.setSvg( this.c[3], 'fill', UIL.SELECT );

};

UIL.List.prototype.out = function( e ){

    this.c[5].style.color = '#CCC';
    UIL.setSvg( this.c[3], 'fill', UIL.bgcolor(UIL.COLOR) );

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

        this.listPos();
    }

};

UIL.List.prototype.listup = function( e ){

    this.isDown = false;
    this.listIn.style.background = 'rgba(0,0,0,0.2)';
    UIL.setSvg( this.c[6], 'fill', '#666' );

};

UIL.List.prototype.listout = function( e ){

    if( UIL.main ) UIL.main.lockwheel = false;
    this.listup();
    var name = e.relatedTarget.name;
    if( name === undefined ) this.listHide();

};

UIL.List.prototype.listwheel = function( e ){

    if( !this.scroll ) return;
    if( UIL.main ) UIL.main.lockwheel = true;
    var delta = 0;
    if( e.wheelDeltaY ) delta = -e.wheelDeltaY*0.04;
    else if( e.wheelDelta ) delta = -e.wheelDelta*0.2;
    else if( e.detail ) delta = e.detail*4.0;

    this.py += delta;

    if( this.py < 0 ) this.py=0;
    if(this.py > this.range ) this.py = this.range;

    this.listPos();

};


// ----- LIST

UIL.List.prototype.listPos = function( y ){

    if( !this.scroll ) return;
    this.py = y === undefined ? this.py : y;
    this.listIn.style.top = -this.py+'px';
    UIL.setSvg( this.c[6], 'y', ((this.py*70)/this.range)+2 );

};

UIL.List.prototype.listShow = function(){

    this.listPos( 0 );
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

    if(UIL.main) UIL.main.calc();

};

UIL.List.prototype.listHide = function(){

    this.show = false;
    this.h = 20;
    this.c[0].style.height = this.h + 'px';
    this.c[2].style.display = 'none';
    UIL.setSvg( this.c[4], 'd','M 6 4 L 10 8 6 12');

    if( UIL.main ) UIL.main.calc();

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