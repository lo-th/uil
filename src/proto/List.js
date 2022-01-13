import { Proto } from '../core/Proto.js';
import { Roots } from '../core/Roots.js';

export class List extends Proto {

    constructor( o = {} ) {

        super( o );

        // images
        this.path = o.path || '';
        this.format = o.format || '';
        

        this.isWithImage = this.path !== '' ? true:false;
        this.preLoadComplete = false;

        this.tmpImage = {};
        this.tmpUrl = [];

        //this.autoHeight = false;

        let align = o.align || 'center';

        // scroll size
        let ss = o.scrollSize || 10
        this.ss = ss+1

        this.sMode = 0;
        this.tMode = 0;

        this.listOnly = o.listOnly || false;
        this.staticTop = o.staticTop || false;

        this.isSelectable = this.listOnly;
        if( o.select !== undefined ) o.selectable = o.select
        if( o.selectable !== undefined ) this.isSelectable = o.selectable

        if( this.txt === '' ) this.p = 0;


        let fltop = Math.floor(this.h*0.5)-5;
        let cc = this.colors



        this.c[2] = this.dom( 'div', this.css.basic + 'top:0; display:none; border-radius:'+this.radius+'px;' );
        this.c[3] = this.dom( 'div', this.css.item + 'position:absolute; text-align:'+align+'; line-height:'+(this.h-4)+'px; top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:1px solid '+cc.border+'; border-radius:'+this.radius+'px;' );
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:cc.text, stroke:'none'});

        this.scrollerBack = this.dom( 'div', this.css.basic + 'right:0px; width:'+ss+'px; background:'+cc.back+'; display:none;');
        this.scroller = this.dom( 'div', this.css.basic + 'right:'+((ss-(ss*0.25))*0.5)+'px; width:'+(ss*0.25)+'px; background:'+cc.text+'; display:none; ');

        this.c[3].style.color = cc.text;


        this.list = []
        this.refObject = null

        if(o.list){
            if( o.list instanceof Array ){
                this.list = o.list
            } else {
                this.refObject = o.list
                for( let g in this.refObject ) this.list.push(g)
            }
        }

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

        } else {
            this.c[2].style.top = this.baseH + 'px';
        }

        this.listIn = this.dom( 'div', this.css.basic + 'left:0; top:0; width:100%; background:none;');
        this.listIn.name = 'list';



        this.topList = 0;
        
        this.c[2].appendChild( this.listIn );
        this.c[2].appendChild( this.scrollerBack );
        this.c[2].appendChild( this.scroller );

        if( o.value !== undefined ){
            if(!isNaN(o.value)) this.value = this.list[ o.value ];
            else this.value = o.value;
        }else{
            this.value = this.list[0];
        }

        this.isOpenOnStart = o.open || false;

        if( this.listOnly ){
            this.baseH = 5;
            this.c[3].style.display = 'none';
            this.c[4].style.display = 'none';
            this.c[2].style.top = this.baseH+'px'
            this.isOpenOnStart = true;
        }


        this.miniCanvas = o.miniCanvas || false 
        this.canvasBg = o.canvasBg || 'rgba(0,0,0,0)'
        this.imageSize = o.imageSize || [20,20];

        // dragout function
        this.drag = o.drag || false
        this.dragout = o.dragout || false
        this.dragstart = o.dragstart || null
        this.dragend = o.dragend || null

        

        //this.c[0].style.background = '#FF0000'
        if( this.isWithImage ) this.preloadImage();
       // } else {
            // populate list
            this.setList( this.list );
            this.init();
            if( this.isOpenOnStart ) this.open( true );
       // }

    }

    /*send ( v ) {

        super.send( v );

        //Proto.prototype.send.call( this, v );
    }*/

    // image list

    preloadImage () {

        this.preLoadComplete = false;

        this.tmpImage = {};
        for( let i=0; i<this.list.length; i++ ) this.tmpUrl.push( this.list[i] );
        this.loadOne();
        
    }

    nextImg () {

        this.tmpUrl.shift();
        if( this.tmpUrl.length === 0 ){ 

            this.preLoadComplete = true;

            this.addImages();
            /*this.setList( this.list );
            this.init();
            if( this.isOpenOnStart ) this.open();*/

        }
        else this.loadOne();

    }

    loadOne(){

        let self = this
        let name = this.tmpUrl[0];
        let img = document.createElement('img');
        img.style.cssText = 'position:absolute; width:'+self.imageSize[0]+'px; height:'+self.imageSize[1]+'px';
        img.setAttribute('src', this.path + name + this.format );

        img.addEventListener('load', function() {

            self.imageSize[2] = img.width;
            self.imageSize[3] = img.height;
            self.tmpImage[name] = img;
            self.nextImg();

        });

    }

    //

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        if( this.up && this.isOpen ){
            if( l.y > this.h - this.baseH ) return 'title';
            else{
                if( this.scroll && ( l.x > (this.sa+this.sb-this.ss)) ) return 'scroll';
                if(l.x > this.sa) return this.testItems( l.y-this.baseH );
            }

        } else {
            if( l.y < this.baseH+2 ) return 'title';
            else{
                if( this.isOpen ){
                    if( this.scroll && ( l.x > (this.sa+this.sb-this.ss)) ) return 'scroll';
                    if(l.x > this.sa) return this.testItems( l.y-this.baseH );
                }
            }

        }

        return '';

    }

    testItems ( y ) {

        let name = '';

        let i = this.items.length, item, a, b;
        while(i--){
            item = this.items[i];
            a = item.posy + this.topList;
            b = item.posy + this.itemHeight + 1 + this.topList;
            if( y >= a && y <= b ){ 
                name = 'item' + i;
                this.modeItem(0)
                this.current = item;
                this.modeItem(1)
                return name;
            }

        }

        return name;

    }

    modeItem ( mode ) {

        if( !this.current ) return

        if( this.current.select && mode===0) mode = 2
        let cc = this.colors

        switch( mode ){

            case 0: // base
                this.current.style.background = cc.back
                this.current.style.color = cc.text;
            break;
            case 1: // over
                this.current.style.background = cc.over
                this.current.style.color = cc.textOver;
            break;
            case 2: // edit / down
                this.current.style.background = cc.select
                this.current.style.color = cc.textSelect;
            break;

        }
    }

    unSelected() {

        if( !this.current ) return
        this.modeItem(0)
        this.current = null

    }

    selected() {

        if( !this.current ) return
        this.resetItems()
        this.modeItem(2)
        this.current.select = true

    }

    resetItems() {

        let i = this.items.length
        while(i--){
            this.items[i].select = false
            this.items[i].style.background = this.colors.back;
            this.items[i].style.color = this.colors.text;
        }

    }

    // ----------------------
    //   EVENTS
    // ----------------------


    mouseup ( e ) {

        this.isDown = false;

    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false;

        if( name === 'scroll' ){

            this.isDown = true;
            this.mousemove( e );

        } else if( name === 'title' ){

            this.modeTitle(2);
            if( !this.listOnly ){
                if( !this.isOpen ) this.open();
                else this.close();
            }
        } else {
            // is item
            if( this.current ){

                this.value = this.list[ this.current.id ]

                if( this.isSelectable ) this.selected()
                //this.value = this.refObject !== null ? this.refObject[this.list[this.current.id]]  : this.list[this.current.id]
                //this.value = this.current.textContent;
                this.send( this.refObject !== null ? this.refObject[this.list[this.current.id]] : this.value );

                if( !this.listOnly ) {
                    this.close();
                    this.setTopItem();
                }
            }
            
        }

        return true;

    }

    mousemove ( e ) {

        let nup = false;
        let name = this.testZone( e );

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
                let top = this.zone.y+this.baseH-2;
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

    }

    wheel ( e ) {

        let name = this.testZone( e );
        if( name === 'title' ) return false; 
        this.py += e.delta*10;
        this.update(this.py);
        return true;

    }



    // ----------------------

    reset () {

        this.prevName = '';
        this.unSelected();
        this.modeTitle(0);
        this.modeScroll(0);

        //console.log('this is reset')
        
    }

    modeScroll ( mode ) {

        if( mode === this.sMode ) return;

        let s = this.scroller.style;
        let cc = this.colors

        switch(mode){
            case 0: // base
                s.background = cc.text;
            break;
            case 1: // over
                s.background = cc.select;
            break;
            case 2: // edit / down
                s.background = cc.select;
            break;

        }

        this.sMode = mode;
    }

    modeTitle ( mode ) {

        if( mode === this.tMode ) return;

        let s = this.s;
        let cc = this.colors

        switch(mode){
            case 0: // base
                s[3].color = cc.text;
                s[3].background = cc.button;
            break;
            case 1: // over
                s[3].color = cc.textOver;
                s[3].background = cc.overoff;
            break;
            case 2: // edit / down
                s[3].color = cc.textSelect;
                s[3].background = cc.overoff;
            break;

        }

        this.tMode = mode;

    }

    clearList () {

        while ( this.listIn.children.length ) this.listIn.removeChild( this.listIn.lastChild );
        this.items = [];

    }

    setList ( list ) {

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
        this.scrollerBack.style.height = this.maxHeight + 'px';
        this.scroller.style.height = this.sh + 'px';

        if( this.max > this.maxHeight ){ 
            this.ww = this.sb - this.ss;
            this.scroll = true;
        }

        if( this.miniCanvas ) {

            this.tmpCanvas = document.createElement('canvas')
            this.tmpCanvas.width = this.imageSize[0]
            this.tmpCanvas.height = this.imageSize[1]
            this.tmpCtx = this.tmpCanvas.getContext("2d")
            this.tmpCtx.fillStyle = this.canvasBg
            this.tmpCtx.fillRect(0, 0, this.imageSize[0], this.imageSize[1])

        }

        let item, n;//, l = this.sb;
        for( let i=0; i<this.length; i++ ){

            n = this.list[i];
            item = this.dom( 'div', this.css.item + 'width:'+this.ww+'px; height:'+this.itemHeight+'px; line-height:'+(this.itemHeight-5)+'px; color:'+this.colors.text+'; background:'+this.colors.back+';' );
            item.name = 'item'+i;
            item.id = i;
            item.select = false
            item.posy = (this.itemHeight+1)*i;
            this.listIn.appendChild( item );
            this.items.push( item );

            if( n === this.value ) this.current = item

            //if( this.isWithImage ) item.appendChild( this.tmpImage[n] );
            if( !this.isWithImage ) item.textContent = n;

            if( this.miniCanvas ){

                let c = new Image()
                c.src = this.tmpCanvas.toDataURL()


                /*let c = document.createElement('canvas')

                c.width = this.imageSize[0]
                c.height = this.imageSize[1]
                let ctx = c.getContext("2d")
                ctx.fillStyle = this.canvasBg
                ctx.fillRect(0, 0, this.imageSize[0], this.imageSize[1])*/
                c.style.cssText = 'position:relative; pointer-events:none; display:inline-block; float:left; margin-left:0px; margin-right:5px; top:2px'


                //c.style.cssText = 'display:flex; align-content: flex-start; flex-wrap: wrap;'
                //item.style.float = 'right'
                item.appendChild( c )

                this.tmpImage[n] = c

            }

            if(this.dragout){

                item.img = this.tmpImage[n]

                item.style.pointerEvents = 'auto';
                item.draggable="true"

                item.addEventListener('dragstart', this.dragstart || function(){ /*console.log('drag start')*/})
                item.addEventListener('drag', this.drag || function(){ /*console.log('drag start')*/})
                //item.addEventListener('dragover', this);
                //item.addEventListener('dragenter', this);
                item.addEventListener('dragleave', function(){ Roots.fakeUp(); } );
                item.addEventListener('dragend', this.dragend || function(){ /*console.log('drag end')*/ }.bind(this) )
                //item.addEventListener('drop', function(){console.log('drop')})

            }

        }

        this.setTopItem();
        if( this.isSelectable ) this.selected()
        
    }

    drawImage( name, image, x,y,w,h ){
        this.tmpCtx.clearRect(0, 0, this.imageSize[0], this.imageSize[1]);
        this.tmpCtx.drawImage(image, x, y, w, h, 0, 0, this.imageSize[0], this.imageSize[1])
        this.tmpImage[name].src = this.tmpCanvas.toDataURL()


        /*let c = this.tmpImage[name]
        let ctx = c.getContext("2d")
        ctx.drawImage(image, x, y, w, h, 0, 0, this.imageSize[0], this.imageSize[1])*/

    }

    addImages (){
        let lng = this.list.length;
        for( let i=0; i<lng; i++ ){
            this.items[i].appendChild( this.tmpImage[this.list[i]] );
        }
        this.setTopItem();
    }

    setValue ( value ) {

        if(!isNaN(value)) this.value = this.list[ value ];
        else this.value = value;

        this.setTopItem();

    }

    setTopItem (){

        if(this.staticTop) return;

        if( this.isWithImage ){ 

            if( !this.preLoadComplete ) return;

            if(!this.c[3].children.length){
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.imageSize[0];
                this.canvas.height = this.imageSize[1];
                this.canvas.style.cssText = 'position:absolute; top:0px; left:0px;'
                this.ctx = this.canvas.getContext("2d");
                this.c[3].appendChild( this.canvas );
            }

            let img = this.tmpImage[ this.value ];
            this.ctx.drawImage( this.tmpImage[ this.value ], 0, 0, this.imageSize[2], this.imageSize[3], 0,0, this.imageSize[0], this.imageSize[1] );

        }
        else this.c[3].textContent = this.value;


        if( this.miniCanvas ){

            if(!this.c[3].children.length){
                this.canvas = document.createElement('canvas');
                this.canvas.width = this.imageSize[0];
                this.canvas.height = this.imageSize[1];
                let h = ( this.h - this.imageSize[1] ) * 0.5
                this.canvas.style.cssText = 'position:relative; pointer-events:none; display:inline-block; float:left; margin-left:0px; margin-right:5px; top:2px'
                //this.canvas.style.cssText = 'position:absolute; top:'+h+'px; left:5px;'
                this.ctx = this.canvas.getContext("2d");
                this.c[3].style.textAlign = 'left'
                this.c[3].appendChild( this.canvas );

            }

            this.ctx.drawImage( this.tmpImage[ this.value ], 0, 0 );


        }

    }


    // ----- LIST

    update ( y ) {

        if( !this.scroll ) return;

        y = y < 0 ? 0 : y;
        y = y > this.range ? this.range : y;

        this.topList = -Math.floor( y / this.ratio );

        this.listIn.style.top = this.topList+'px';
        this.scroller.style.top = Math.floor( y )  + 'px';

        this.py = y;

    }

    parentHeight ( t ) {

        if ( this.group !== null ) this.group.calc( t );
        else if ( this.isUI ) this.main.calc( t );

    }

    open ( first ) {

        super.open();

        this.update( 0 )

        this.h = this.maxHeight + this.baseH + 5;
        if( !this.scroll ){
            this.topList = 0;
            this.h = this.baseH + 5 + this.max;
            this.scroller.style.display = 'none';
            this.scrollerBack.style.display = 'none';
        } else {
            this.scroller.style.display = 'block';
            this.scrollerBack.style.display = 'block';
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

        let t = this.h - this.baseH;

        this.zone.h = this.h;

        if(!first) this.parentHeight( t );

    }

    close () {

        super.close();

        if( this.up ) this.zone.y += this.h - (this.baseH-10);

        let t = this.h - this.baseH;

        this.h = this.baseH;
        this.s[0].height = this.h + 'px';
        this.s[2].display = 'none';
        this.setSvg( this.c[4], 'd', this.svgs.arrow );

        this.zone.h = this.h;

        this.parentHeight( -t );

    }

    // -----

    text ( txt ) {

        this.c[3].textContent = txt;

    }

    rSizeContent () {

        let i = this.length;
        while(i--) this.listIn.children[i].style.width = this.ww + 'px';

    }

    rSize () {

        super.rSize()

        //Proto.prototype.rSize.call( this );

        let s = this.s;
        let w = this.sb;
        let d = this.sa;

        if(s[2]=== undefined) return;

        s[2].width = w + 'px';
        s[2].left = d +'px';

        s[3].width = w + 'px';
        s[3].left = d + 'px';

        s[4].left = d + w - 17 + 'px';

        this.ww = w;
        if( this.max > this.maxHeight ) this.ww = w-this.ss;
        if(this.isOpen) this.rSizeContent();

    }

}