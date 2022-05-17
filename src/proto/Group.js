
import { Roots } from '../core/Roots.js';
import { Proto } from '../core/Proto.js';

export class Group extends Proto {

    constructor( o = {} ) {

        super( o );

        this.isGroup = true

        this.ADD = o.add;

        this.autoHeight = true

        this.uis = []
        this.current = -1
        this.proto = null
        this.isEmpty = true

        this.decal = o.group ? 8 : 0

        this.baseH = this.h

        let fltop = Math.floor(this.h*0.5)-3

        const cc = this.colors

        this.useFlex = true 
        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : ''

        this.c[2] = this.dom( 'div', this.css.basic + flexible + 'width:100%; left:0; height:auto; overflow:hidden; top:'+(this.h)+'px')
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; left:0; top:'+fltop+'px;', { d:this.svgs.g1, fill:cc.text, stroke:'none'})

        let bh = this.mtop === 0 ? this.margin : this.mtop
        
        this.c[4] = this.dom( 'div', this.css.basic + 'width:100%; left:0; height:'+(bh+1)+'px; top:'+((this.h-1))+'px; background:none;')

        let s = this.s;
        this.c[1].name = 'group'

        this.init();

        this.setBG( o.bg )

        if( o.open ) this.open()

    }

    setBG ( bg ) {

        const cc = this.colors
        const s = this.s

        if( bg !== undefined ) cc.groups = bg
        if(cc.groups === 'none') cc.groups = cc.background
            cc.background = 'none'

        s[0].background = 'none';
        s[1].background = cc.groups
        s[2].background = cc.groups

        if( cc.gborder !== 'none' ){
            s[1].border = cc.borderSize+'px solid '+ cc.gborder
        }

        if( this.radius !== 0 ){

            s[1].borderRadius = this.radius+'px'
            s[2].borderRadius = this.radius+'px'

        }

        /*let i = this.uis.length;
        while(i--){
            this.uis[i].setBG( 'none' );
            //this.uis[i].setBG( this.colors.background );
        }*/

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let name = '';

        if( l.y < this.baseH + this.margin ) name = 'title';
        else {
            if( this.isOpen ) name = 'content';
        }

        //console.log(name)

        return name;

    }

    clearTarget () {

        if( this.current === -1 ) return false;
        if( this.proto.s ){
            // if no s target is delete !!
            this.proto.uiout();
            this.proto.reset();
        }
        this.proto = null;
        this.current = -1;
        this.cursor();
        return true;

    }

    reset () {

        this.clearTarget()

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent ( e ) {

        let type = e.type;

        let change = false;
        let protoChange = false;

        let name = this.testZone( e );

        if( !name ) return;

        switch( name ){

            case 'content':

            //this.cursor()

            //if( this.marginDiv ) e.clientY -= this.margin * 0.5

            if( Roots.isMobile && type === 'mousedown' ) this.getNext( e, change )

            if( this.proto ){ 
                //e.clientY -= this.margin
                protoChange = this.proto.handleEvent( e )
            }

            if( !Roots.lock ) this.getNext( e, change )

            break;
            case 'title':
            //this.cursor( this.isOpen ? 'n-resize':'s-resize' );
            this.cursor('pointer')
            if( type === 'mousedown' ){
                if( this.isOpen ) this.close()
                else this.open()
            }
            break;


        }

        if( this.isDown ) change = true;
        if( protoChange ) change = true;

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
            this.proto  = this.uis[ this.current ];
            this.proto.uiover();
        }

    }

    // ----------------------

    

    add() {

        let a = arguments;

        if( typeof a[1] === 'object' ){ 
            a[1].isUI = this.isUI
            a[1].target = this.c[2]
            a[1].main = this.main
            a[1].group = this
        } else if( typeof arguments[1] === 'string' ){
            if( a[2] === undefined ) [].push.call( a, { isUI:true, target:this.c[2], main:this.main });
            else{ 
                a[2].isUI = true;
                a[2].target = this.c[2];
                a[2].main = this.main;
                a[2].group = this;
            }
        }

        let u = this.ADD.apply( this, a )
        //u.margin += this.margin

        //console.log( u.margin )

        this.uis.push( u )

        this.isEmpty = false

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

    }

    clear() {

        this.empty()

    }

    empty () {

        this.close();

        let i = this.uis.length, item;

        while( i-- ){
            item = this.uis.pop()
            this.c[2].removeChild( item.c[0] )
            item.clear( true )

            //this.uis[i].clear()
        }

        this.isEmpty = true;
        this.h = this.baseH;

    }

    // clear one element

    clearOne ( n ) { 

        let id = this.uis.indexOf( n );

        if ( id !== -1 ) {
            this.calc( - ( this.uis[ id ].h + this.margin ) )
            this.c[2].removeChild( this.uis[ id ].c[0] )
            this.uis.splice( id, 1 )

            if( this.uis.length === 0 ){ 
                this.isEmpty = true;
                this.close();
            }
        }

    }

    

    open () {

        super.open()

        this.setSvg( this.c[3], 'd', this.svgs.g2 )
        this.rSizeContent()

        //let t = this.h - this.baseH

        const s = this.s
        const cc = this.colors

        //s[2].top = (this.h-1) + 'px'
        s[2].top = (this.h+this.mtop) + 'px'
        s[4].background = cc.groups//'#0f0'

        if(this.radius){

            s[1].borderRadius = '0px'
            s[2].borderRadius = '0px'

            s[1].borderTopLeftRadius = this.radius+'px'
            s[1].borderTopRightRadius = this.radius+'px'
            s[2].borderBottomLeftRadius = this.radius+'px'
            s[2].borderBottomRightRadius = this.radius+'px'
        }

        if( cc.gborder !== 'none' ){

            s[4].borderLeft = cc.borderSize+'px solid '+ cc.gborder
            s[4].borderRight = cc.borderSize+'px solid '+ cc.gborder

            s[2].border = cc.borderSize+'px solid '+ cc.gborder
            s[2].borderTop = 'none';
            s[1].borderBottom = cc.borderSize+'px solid rgba(0,0,0,0)'

        }
        
        this.parentHeight()

    }

    close () {

        super.close()

        //let t = this.h - this.baseH

        this.setSvg( this.c[3], 'd', this.svgs.g1 )

        this.h = this.baseH

        const s = this.s
        const cc = this.colors
        
        s[0].height = this.h + 'px'
        //s[1].height = (this.h-2) + 'px'
        //s[2].top = this.h + 'px'
        s[2].top = (this.h+this.mtop) + 'px'
        s[4].background = 'none'

        if( cc.gborder !== 'none' ){

            s[4].border = 'none'
            s[2].border = 'none'
            s[1].border = cc.borderSize+'px solid '+ cc.gborder
        }

        if(this.radius) s[1].borderRadius = this.radius+'px'

        this.parentHeight()

    }

    calcUis () {

        if( !this.isOpen ) this.h = this.baseH
        //else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH ) + this.baseH;
        else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH + this.margin ) + this.baseH

        this.s[0].height = this.h + 'px'

    }

    parentHeight ( t ) {

        if ( this.group !== null ) this.group.calc( t )
        else if ( this.isUI ) this.main.calc( t )

    }

    calc ( y ) {

        if( !this.isOpen ) return
        if( this.isUI ) this.main.calc()
        else this.calcUis()
        this.s[0].height = this.h + 'px'

    }

    rSizeContent () {

        let i = this.uis.length
        while(i--){
            this.uis[i].setSize( this.w )
            this.uis[i].rSize()
        }

    }

    rSize () {

        super.rSize()

        let s = this.s

        this.w = this.w - this.decal

        s[3].left = ( this.sa + this.sb - 6 ) + 'px'

        s[1].width = this.w + 'px'
        s[2].width = this.w + 'px'
        s[1].left = (this.decal) + 'px'
        s[2].left = (this.decal) + 'px'

        if( this.isOpen ) this.rSizeContent()

    }

    //

    uiout() {

        if( this.lock ) return;
        if(this.s) this.s[0].background = this.colors.background;

    }

    uiover() {

        if( this.lock ) return;
        //if( this.isOpen ) return;
        if(this.s) this.s[0].background = this.colors.backgroundOver;

    }

}