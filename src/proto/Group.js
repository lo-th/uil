
import { Roots } from '../core/Roots.js';
import { Proto } from '../core/Proto.js';

export class Group extends Proto {

    constructor( o = {} ) {

        super( o );

        this.isGroup = true

        this.ADD = o.add;

        this.uis = [];

        this.isEmpty = true;

        this.autoHeight = true;
        this.current = -1;
        this.targetIn  = null;

        this.decal = 0;

        this.baseH = this.h;

        let fltop = Math.floor(this.h*0.5)-6;

        this.isLine = o.line !== undefined ? o.line : false;

        this.decal = 0;

        if( o.group ){
            this.decal = o.group.decal ? o.group.decal : 0
            this.decal += 6
        }

        this.useFlex = true 
        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : ''

        this.c[2] = this.dom( 'div', this.css.basic + flexible + 'width:100%; left:0; height:auto; overflow:hidden; top:'+this.h+'px');// 
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:0; top:'+fltop+'px;', { d:this.svgs.group, fill:this.colors.text, stroke:'none'});
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:'+(4+this.decal)+'px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.colors.text, stroke:'none'});
        // bottom line
        if( this.isLine ) this.c[5] = this.dom( 'div', this.css.basic +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');

        let s = this.s;



        s[0].height = this.h + 'px';
        s[1].height = this.h + 'px';
        this.c[1].name = 'group';

        s[1].marginLeft = (10+this.decal)+'px';
        s[1].lineHeight = this.h-4;
        s[1].color = this.colors.text;
        s[1].fontWeight = 'bold';

        if( this.radius !== 0 ) s[0].borderRadius = this.radius+'px'; 
        //if( o.border ) s[0].border = '1px solid ' + o.border;


        /*if(this.decal){
            s[0].boxSizing = 'border-box';
            s[0].backgroundClip = 'border-box';
            s[0].border = (this.decal/3)+'px solid ' + o.group.colors.background;
        }*/

        

        
        this.init();

        this.setBG( o.bg );

        if( o.open !== undefined ) this.open();


        //s[0].background = this.bg;

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let name = '';

        if( l.y < this.baseH ) name = 'title';
        else {
            if( this.isOpen ) name = 'content';
        }

        return name;

    }

    clearTarget () {

        if( this.current === -1 ) return false;

       // if(!this.targetIn ) return;
        this.targetIn .uiout();
        this.targetIn .reset();
        this.current = -1;
        this.targetIn  = null;
        this.cursor();
        return true;

    }

    reset () {

        this.clearTarget();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent ( e ) {

        let type = e.type;

        let change = false;
        let targetChange = false;

        let name = this.testZone( e );

        if( !name ) return;

        switch( name ){

            case 'content':
            this.cursor();

            if( Roots.isMobile && type === 'mousedown' ) this.getNext( e, change );

            if( this.targetIn  ) targetChange = this.targetIn .handleEvent( e );

            //if( type === 'mousemove' ) change = this.styles('def');

            if( !Roots.lock ) this.getNext( e, change );

            break;
            case 'title':
            this.cursor('pointer');
            if( type === 'mousedown' ){
                if( this.isOpen ) this.close();
                else this.open();
            }
            break;


        }

        if( this.isDown ) change = true;
        if( targetChange ) change = true;

        return change;

    }

    getNext ( e, change ) {

        let next = Roots.findTarget( this.uis, e );

        if( next !== this.current ){
            this.clearTarget();
            this.current = next;
            change = true;
        }

        if( next !== -1 ){ 
            this.targetIn  = this.uis[ this.current ];
            this.targetIn .uiover();
        }

    }

    // ----------------------

    /*calcH () {

        let lng = this.uis.length, i, u,  h=0, px=0, tmph=0;
        for( i = 0; i < lng; i++){
            u = this.uis[i];
            if( !u.autoWidth ){

                if(px===0) h += u.h+1;
                else {
                    if(tmph<u.h) h += u.h-tmph;
                }
                tmph = u.h;

                //tmph = tmph < u.h ? u.h : tmph;
                px += u.w;
                if( px+u.w > this.w ) px = 0;

            }
            else h += u.h+1;
        }

        return h;
    }*/

    


    setBG ( bg ) {

        if( bg !== undefined ) this.colors.background = bg

        this.c[0].style.background = this.colors.background;

        let i = this.uis.length;
        while(i--){
            this.uis[i].setBG( this.colors.background );
        }

    }

    add() {

        let a = arguments;

        if( typeof a[1] === 'object' ){ 
            a[1].isUI = this.isUI;
            a[1].target = this.c[2];
            a[1].main = this.main;
            a[1].group = this;
        } else if( typeof arguments[1] === 'string' ){
            if( a[2] === undefined ) [].push.call( a, { isUI:true, target:this.c[2], main:this.main });
            else{ 
                a[2].isUI = true;
                a[2].target = this.c[2];
                a[2].main = this.main;
                a[2].group = this;
            }
        }

        //let n = add.apply( this, a );
        let u = this.ADD.apply( this, a );

        this.uis.push( u )

        //this.calc()



        this.isEmpty = false;

        return u;

    }

    // remove one node

    remove ( n ) {

        if( n.dispose ) n.dispose();

    }

    // clear all iner 

    dispose() {

        this.clear()
        if( this.isUI ) this.main.calc()

        super.dispose()
        //Proto.prototype.clear.call( this );

    }

    clear() {

        this.empty()

    }

    empty () {

        this.close();

        let i = this.uis.length, item;

        while( i-- ){
            item = this.uis.pop();
            this.c[2].removeChild( item.c[0] );
            item.clear( true );

            //this.uis[i].clear()
        }

        this.isEmpty = true;
        this.h = this.baseH;

    }

    // clear one element

    clearOne ( n ) { 

        let id = this.uis.indexOf( n );

        if ( id !== -1 ) {
            this.calc( - ( this.uis[ id ].h + 1 ) );
            this.c[2].removeChild( this.uis[ id ].c[0] );
            this.uis.splice( id, 1 ); 

            if( this.uis.length === 0 ){ 
                this.isEmpty = true;
                this.close();
            }
        }

    }

    

    open () {

        super.open();

        this.setSvg( this.c[4], 'd', this.svgs.arrowDown )
        this.rSizeContent()

        let t = this.h - this.baseH;

        this.parentHeight()

    }

    close () {

        super.close();

        let t = this.h - this.baseH;

        this.setSvg( this.c[4], 'd', this.svgs.arrow );
        this.h = this.baseH;
        this.s[0].height = this.h + 'px';

        this.parentHeight()

    }

    calcUis () {

        if( !this.isOpen ) this.h = this.baseH;
        else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH ) + this.baseH;

        this.s[0].height = this.h + 'px';

        //console.log('G', this.h)

        //if( !this.isOpen ) return;

        //this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH )+this.baseH;

    }

    parentHeight ( t ) {

        if ( this.group !== null ) this.group.calc( t )
        else if ( this.isUI ) this.main.calc( t )

    }

    calc ( y ) {

        if( !this.isOpen ) return;

        /*

        if( y !== undefined ){ 
            this.h += y;
            if( this.isUI ) this.main.calc( y );
        } else {
            this.h = this.calcH() + this.baseH;
        }
        this.s[0].height = this.h + 'px';*/

        // if(this.isOpen)
        if( this.isUI ) this.main.calc()
        else this.calcUis()
        
        this.s[0].height = this.h + 'px';

    }

    rSizeContent () {

        let i = this.uis.length;
        while(i--){
            this.uis[i].setSize( this.w );
            this.uis[i].rSize();
        }

        //this.calc()

    }

    rSize () {

        super.rSize();

        let s = this.s;

        s[3].left = ( this.sa + this.sb - 17 ) + 'px';
        s[1].width = this.w + 'px';
        s[2].width = this.w + 'px';

        if( this.isOpen ) this.rSizeContent();

    }

}