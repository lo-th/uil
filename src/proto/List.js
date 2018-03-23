import { Proto } from '../core/Proto';

function List ( o ) {

    Proto.call( this, o );

    this.autoHeight = false;
    var align = o.align || 'center';

    this.sMode = 0;
    this.tMode = 0;

    this.buttonColor = o.bColor || this.colors.button;

    var fltop = Math.floor(this.h*0.5)-5;

    this.c[2] = this.dom( 'div', this.css.basic + 'top:0; display:none;' );
    this.c[3] = this.dom( 'div', this.css.txt + 'text-align:'+align+'; line-height:'+(this.h-4)+'px; top:1px;  background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border-radius:'+this.radius+'px;' );
    this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.fontColor, stroke:'none'});

    this.scroller = this.dom( 'div', this.css.basic + 'right:5px;  width:10px; background:#666; display:none;');

    this.c[3].style.color = this.fontColor;

    this.list = o.list || [];
    this.items = [];

    this.prevName = '';

    this.baseH = this.h;

    this.itemHeight = o.itemHeight || (this.h-3);

    // force full list 
    this.full = o.full || false;

    this.py = 0;
    this.ww = this.sb;
    this.scroll = false;
    this.isDown = false;

    this.current = null;

    // list up or down
    this.side = o.side || 'down';
    this.up = this.side === 'down' ? 0 : 1;

    if( this.up ){

        this.c[2].style.top = 'auto';
        this.c[3].style.top = 'auto';
        this.c[4].style.top = 'auto';
        //this.c[5].style.top = 'auto';

        this.c[2].style.bottom = this.h-2 + 'px';
        this.c[3].style.bottom = '1px';
        this.c[4].style.bottom = fltop + 'px';
        //this.c[5].style.bottom = '2px';

    } else {
        this.c[2].style.top = this.baseH + 'px';
        //this.c[6].style.top = this.h + 'px';
    }

    this.listIn = this.dom( 'div', this.css.basic + 'left:0; top:0; width:100%; background:rgba(0,0,0,0.2);');
    this.listIn.name = 'list';

    this.topList = 0;
    
    this.c[2].appendChild( this.listIn );
    this.c[2].appendChild( this.scroller );

    // populate list

    this.setList( this.list, o.value );

    //this.c[0].style.background = '#FF0000'

    this.init();

    if( o.open !== undefined ) this.open();

}

List.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: List,

    testZone: function ( e ) {

        var l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        if( this.up && this.isOpen ){
            if( l.y > this.h - this.baseH ) return 'title';
            else{
                if( this.scroll && ( l.x > (this.sa+this.sb-20)) ) return 'scroll';
                if(l.x > this.sa) return this.testItems( l.y-this.baseH );
            }

        } else {
            if( l.y < this.baseH+2 ) return 'title';
            else{
                if( this.isOpen ){
                    if( this.scroll && ( l.x > (this.sa+this.sb-20)) ) return 'scroll';
                    if(l.x > this.sa) return this.testItems( l.y-this.baseH );
                }
            }

        }

        return '';

    },

    testItems: function ( y ) {

        var name = '';

        var i = this.items.length, item, a, b;
        while(i--){
            item = this.items[i];
            a = item.posy + this.topList;
            b = item.posy + this.itemHeight + 1 + this.topList;
            if( y >= a && y <= b ){ 
                name = 'item' + i;
                this.unSelected();
                this.current = item;
                this.selected();
                return name;
            }

        }

        return name;

    },

    unSelected: function () {

        if( this.current ){
            this.current.style.background = 'rgba(0,0,0,0.2)';
            this.current.style.color = this.fontColor;
            this.current = null;
        }

    },

    selected: function () {

        this.current.style.background = this.colors.select;
        this.current.style.color = '#FFF';

    },

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup: function ( e ) {

        this.isDown = false;

    },

    mousedown: function ( e ) {

        var name = this.testZone( e );

        if( !name ) return false;

        if( name === 'scroll' ){

            this.isDown = true;
            this.mousemove( e );

        } else if( name === 'title' ){

            this.modeTitle(2);
            if( !this.isOpen ) this.open();
            else this.close();
        
        } else {
            if( this.current ){
                this.value = this.current.textContent;
                this.c[3].textContent = this.value;
                this.send();
                this.close();
            }
            
        }

        return true;

    },

    mousemove: function ( e ) {

        var nup = false;
        var name = this.testZone( e );

        if( !name ) return nup;

        if( name === 'title' ){
            this.unSelected();
            this.modeTitle(1);
            this.cursor('pointer');

        } else if( name === 'scroll' ){

            this.cursor('s-resize');
            this.modeScroll(1);
            if( this.isDown ){
                this.modeScroll(2);
                var top = this.zone.y+this.baseH-2;
                this.update( ( e.clientY - top  ) - ( this.sh*0.5 ) );
            }
            //if(this.isDown) this.listmove(e);
        } else {

            // is item
            this.modeTitle(0);
            this.modeScroll(0);
            this.cursor('pointer');
        
        }

        if( name !== this.prevName ) nup = true;
        this.prevName = name;

        return nup;

    },

    wheel: function ( e ) {

        var name = this.testZone( e );
        if( name === 'title' ) return false; 
        this.py += e.delta*10;
        this.update(this.py);
        return true;

    },



    // ----------------------

    reset: function () {

        this.prevName = '';
        this.unSelected();
        this.modeTitle(0);
        this.modeScroll(0);
        
    },

    modeScroll: function ( mode ) {

        if( mode === this.sMode ) return;

        switch(mode){
            case 0: // base
                this.scroller.style.background = this.buttonColor;
            break;
            case 1: // over
                this.scroller.style.background = this.colors.select;
            break;
            case 2: // edit / down
                this.scroller.style.background = this.colors.down;
            break;

        }

        this.sMode = mode;
    },

    modeTitle: function ( mode ) {

        if( mode === this.tMode ) return;

        var s = this.s;

        switch(mode){
            case 0: // base
                s[3].color = this.fontColor;
                s[3].background = this.buttonColor;
            break;
            case 1: // over
                s[3].color = '#FFF';
                s[3].background = this.colors.select;
            break;
            case 2: // edit / down
                s[3].color = this.fontColor;
                s[3].background = this.colors.down;
            break;

        }

        this.tMode = mode;

    },

    clearList: function () {

        while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );
        this.items = [];

    },

    setList: function ( list, value ) {

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
            this.ww = this.sb - 20;
            this.scroll = true;
        }

        var item, n;//, l = this.sb;
        for( var i=0; i<this.length; i++ ){
            n = this.list[i];
            item = this.dom( 'div', this.css.item + 'width:'+this.ww+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px; color:'+this.fontColor+';' );
            item.textContent = n;
            item.name = 'item'+i;
            item.posy = (this.itemHeight+1)*i;
            this.listIn.appendChild( item );
            this.items.push( item );
        }

        if( value !== undefined ){
            if(!isNaN(value)) this.value = this.list[ value ];
            else this.value = value;
        }else{
            this.value = this.list[0];
        }
        
        this.c[3].textContent = this.value;

    },


    // ----- LIST

    update: function ( y ) {

        if( !this.scroll ) return;

        y = y < 0 ? 0 : y;
        y = y > this.range ? this.range : y;

        this.topList = -Math.floor( y / this.ratio );

        this.listIn.style.top = this.topList+'px';
        this.scroller.style.top = Math.floor( y )  + 'px';

        this.py = y;

    },

    parentHeight: function ( t ) {

        if ( this.parentGroup !== null ) this.parentGroup.calc( t );
        else if ( this.isUI ) this.main.calc( t );

    },

    open: function () {

        Proto.prototype.open.call( this );

        this.update( 0 );
        this.h = this.maxHeight + this.baseH + 5;
        if( !this.scroll ){
            this.topList = 0;
            this.h = this.baseH + 5 + this.max;
            this.scroller.style.display = 'none';
        } else {
            this.scroller.style.display = 'block';
        }
        this.s[0].height = this.h + 'px';
        this.s[2].display = 'block';

        if( this.up ){ 
            this.zone.y -= this.h - (this.baseH-10);
            this.setSvg( this.c[4], 'd', this.svgs.arrowUp );
        } else {
            this.setSvg( this.c[4], 'd', this.svgs.arrowDown );
        }

        this.rSizeContent();

        var t = this.h - this.baseH;

        this.zone.h = this.h;

        this.parentHeight( t );

    },

    close: function () {

        Proto.prototype.close.call( this );

        if( this.up ) this.zone.y += this.h - (this.baseH-10);

        var t = this.h - this.baseH;

        this.h = this.baseH;
        this.s[0].height = this.h + 'px';
        this.s[2].display = 'none';
        this.setSvg( this.c[4], 'd', this.svgs.arrow );

        this.zone.h = this.h;

        this.parentHeight( -t );

    },

    // -----

    text: function ( txt ) {

        this.c[3].textContent = txt;

    },

    rSizeContent: function () {

        var i = this.length;
        while(i--) this.listIn.children[i].style.width = this.ww + 'px';

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

        this.ww = w;
        if( this.max > this.maxHeight ) this.ww = w-20;
        if(this.isOpen) this.rSizeContent();

    }

} );

export { List };