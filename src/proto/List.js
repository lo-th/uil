import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function List ( o ) {

    Proto.call( this, o );

    this.autoHeight = true;
    var align = o.align || 'center';

    this.buttonColor = o.bColor || Tools.colors.button;

    var fltop = Math.floor(this.h*0.5)-5;

    //this.c[2] = Tools.dom( 'div', Tools.css.basic + 'top:0; height:90px; cursor:s-resize; pointer-events:auto; display:none; overflow:hidden; border:1px solid '+Tools.colors.border+';' );
    //this.c[3] = Tools.dom( 'div', Tools.css.txt + 'text-align:'+align+'; line-height:'+(this.h-4)+'px; border:1px solid '+Tools.colors.border+'; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px;' );

    this.c[2] = Tools.dom( 'div', Tools.css.basic + 'top:0; height:90px; cursor:s-resize; pointer-events:auto; display:none; overflow:hidden;' );
    this.c[3] = Tools.dom( 'div', Tools.css.txt + 'text-align:'+align+'; line-height:'+(this.h-4)+'px; top:1px; pointer-events:auto; cursor:pointer; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px;' );
    this.c[4] = Tools.dom( 'path', Tools.css.basic + 'position:absolute; width:10px; height:10px; top:'+fltop+'px;', { d:'M 3 8 L 8 5 3 2 3 8 Z', fill:this.fontColor, stroke:'none'});

    this.scroller = Tools.dom( 'div', Tools.css.basic + 'right:5px;  width:10px; pointer-events:none; background:#666; display:none;');

    this.c[2].name = 'list';
    this.c[3].name = 'title';

    //this.c[2].style.borderTop = this.h + 'px solid transparent';
    this.c[3].style.color = this.fontColor;

    this.c[2].events = [ 'mousedown', 'mousemove', 'mouseup', 'mousewheel', 'mouseout', 'mouseover' ];
    this.c[3].events = [ 'mousedown', 'mouseover' ,'mouseout']; 

    this.list = o.list || [];

    this.baseH = this.h;

    //this.maxItem = o.maxItem || 5;
    this.itemHeight = o.itemHeight || (this.h-3);
    //this.length = this.list.length;

    // force full list 
    this.full = o.full || false;

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
        //this.c[5].style.top = 'auto';

        this.c[2].style.bottom = this.h-2 + 'px';
        this.c[3].style.bottom = '1px';
        this.c[4].style.bottom = fltop + 'px';
        //this.c[5].style.bottom = '2px';

    } else {
        this.c[2].style.top = this.h-2 + 'px';
        //this.c[6].style.top = this.h + 'px';
    }

    this.listIn = Tools.dom( 'div', Tools.css.basic + 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2);');
    this.listIn.name = 'list';

    
    this.c[2].appendChild( this.listIn );
    this.c[2].appendChild( this.scroller );

    // populate list

    this.setList( this.list, o.value );

   
    this.init();

    if( o.open !== undefined ) this.open();

}

List.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: List,

    handleEvent: function( e ) {

        e.preventDefault();

        var name = e.target.name || '';
        switch( e.type ) {
            case 'click': this.click(e); break;
            case 'mouseover': if(name === 'title') this.mode(1); else this.listover(e); break;
            case 'mousedown': if(name === 'title') this.titleClick(e); else this.listdown(e); break;
            case 'mouseup':   if(name === 'title') this.mode(0); else this.listup(e); break;
            case 'mouseout':  if(name === 'title') this.mode(0);  else this.listout(e); break;
            case 'mousemove': this.listmove(e); break;
            case 'mousewheel': this.listwheel(e); break;
        }

    },

    mode: function( mode ){

        var s = this.s;

        switch(mode){
            case 0: // base
                s[3].color = this.fontColor;
                s[3].background = this.buttonColor;
            break;
            case 1: // over
                s[3].color = '#FFF';
                s[3].background = Tools.colors.select;
            break;
            case 2: // edit / down
                s[3].color = this.fontColor;
                s[3].background = Tools.colors.down;
            break;

        }
    },

    clearList: function() {

        while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );

    },

    setList: function( list, value ) {

        this.clearList();

        this.list = list;
        this.length = this.list.length;

        this.maxItem = this.full ? this.length : 5;
        this.maxItem = this.length < this.maxItem ? this.length : this.maxItem;

        this.maxHeight = this.maxItem * (this.itemHeight+1) + 2;

        this.max = this.length * (this.itemHeight+1) + 2;
        this.ratio = this.maxHeight / this.max;
        this.sh = this.maxHeight * this.ratio;
        this.range = this.maxHeight - this.sh;

        this.c[2].style.height = this.maxHeight + 'px';
        this.scroller.style.height = this.sh + 'px';

        if( this.max > this.maxHeight ){ 
            this.w = this.sb - 20;
            this.scroll = true;
        }

        var item, n;//, l = this.sb;
        for( var i=0; i<this.length; i++ ){
            n = this.list[i];
            item = Tools.dom( 'div', Tools.css.item + 'width:'+this.w+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px;');
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
        
        this.c[3].textContent = this.value;

    },

    // -----

    click: function( e ){

        var name = e.target.name;
        if( name !== 'title' && name !== 'list' ) this.close();

    },

    titleClick: function( e ){

        if( this.isOpen ) this.close();
        else {
            this.open(); 
            this.mode(2);
        }

    },

    // ----- LIST

    listover: function( e ){

        var name = e.target.name;
        //console.log(name)
        if( name === 'item' ){
            e.target.style.background = Tools.colors.select;
            e.target.style.color = '#FFF'; 
        }

    },

    listdown: function( e ){

        var name = e.target.name;
        if( name !== 'list' && name !== undefined ){
            this.value = e.target.textContent;//name;
            this.c[3].textContent = this.value;
            this.send();
           // this.close();
        } else if ( name ==='list' && this.scroll ){
            this.isDown = true;
            this.listmove( e );
            this.listIn.style.background = 'rgba(0,0,0,0.6)';
            this.scroller.style.background = '#AAA';
        }

    },

    listmove: function( e ){

        if( this.isDown ){
            var rect = this.c[2].getBoundingClientRect();
            this.update( ( e.clientY - rect.top  ) - ( this.sh*0.5 ) );
        }

    },

    listup: function( e ){

        this.isDown = false;
        this.listIn.style.background = 'rgba(0,0,0,0.2)';
        this.scroller.style.background = '#666';

    },

    listout: function( e ){

        var n = e.target.name;
        if( n === 'item' ){
            e.target.style.background ='rgba(0,0,0,0.2)';
            e.target.style.color = this.fontColor; 
        }


        if( this.isUI ) this.main.lockwheel = false;
        this.listup();
        //var name = e.relatedTarget.name;
        //if( name === undefined ) this.close();

        

    },

    listwheel: function( e ){

        if( !this.scroll ) return;
        if( this.isUI ) this.main.lockwheel = true;
        var delta = 0;
        if( e.wheelDeltaY ) delta = -e.wheelDeltaY*0.04;
        else if( e.wheelDelta ) delta = -e.wheelDelta*0.2;
        else if( e.detail ) delta = e.detail*4.0;

        this.py += delta;

        this.update(this.py);

    },


    // ----- LIST

    update: function( y ){

        if( !this.scroll ) return;

        y = y < 0 ? 0 : y;
        y = y > this.range ? this.range : y;

        this.listIn.style.top = -Math.floor( y / this.ratio )+'px';
        this.scroller.style.top = Math.floor( y )  + 'px';

        this.py = y;

    },

    open: function(){

        Proto.prototype.open.call( this );

        document.addEventListener( 'click', this, false );

        this.update( 0 );
        this.h = this.maxHeight + this.baseH + 10;
        if( !this.scroll ){
            this.h = this.baseH + 10 + this.max;
            this.scroller.style.display = 'none';
        } else {
            this.scroller.style.display = 'block';
        }
        this.s[0].height = this.h + 'px';
        this.s[2].display = 'block';
        if( this.side === 'up' ) Tools.setSvg( this.c[4], 'd','M 5 2 L 2 7 8 7 5 2 Z');
        else Tools.setSvg( this.c[4], 'd','M 5 8 L 8 3 2 3 5 8 Z');

        this.rSizeContent();

        if( this.parentGroup !== null ) this.parentGroup.calc( this.h - this.baseH );
        else if( this.isUI ) this.main.calc( this.h - this.baseH );

    },

    close: function(){

        Proto.prototype.close.call( this );

        document.removeEventListener( 'click', this, false );

        if( this.parentGroup !== null ) this.parentGroup.calc( -(this.h-this.baseH) );
        else if( this.isUI ) this.main.calc(-(this.h-this.baseH));

        this.h = this.baseH;
        this.s[0].height = this.h + 'px';
        this.s[2].display = 'none';
        Tools.setSvg( this.c[4], 'd','M 3 8 L 8 5 3 2 3 8 Z');
        
    },

    // -----

    text: function( txt ){

        this.c[3].textContent = txt;

    },

    rSizeContent: function () {

        var i = this.length;
        while(i--) this.listIn.children[i].style.width = this.w + 'px';

    },

    rSize: function () {

        Proto.prototype.rSize.call( this );

        var s = this.s;
        var w = this.sb;
        var d = this.sa;

        s[2].width = w + 'px';
        s[2].left = d +'px';

        s[3].width = w + 'px';
        s[3].left = d + 'px';

        s[4].left = d + w - 17 + 'px';

        //s[5].width = w + 'px';
        //s[5].left = d + 'px';

        this.w = w;
        if( this.max > this.maxHeight ) this.w = w-20;

        if(this.isOpen) this.rSizeContent();

    }

} );

export { List };