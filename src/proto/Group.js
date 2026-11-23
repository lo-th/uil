
import { Roots } from '../core/Roots.js';
import { Proto } from '../core/Proto.js';
import { Tools } from '../core/Tools.js';
//import { Empty } from './Empty.js';

export class Group extends Proto {

    constructor( o = {} ) {

        super( o );

        const cc = this.colors;

        this.isGroup = true;
        this.isDefGroup = false;
        this.autoHeight = true;
        this.isEmpty = true;
        this.useFlex = true ;

        if(!o.mark){ 
            o.mark = '#47484d';
            this.isDefGroup = true;
        }

        this.bgAlpha = 1;
        if( o.bgAlpha ) this.bgAlpha = o.bgAlpha;

        this.ADD = o.add;
        this.uis = []
        this.current = -1;
        this.proto = null;
        
        this.borderCC = o.mark ? 3 : 0;
        this.decal = o.group ? 8 : 0;
        this.baseH = this.h;
        //this.radius = 20;

        let fltop = Math.floor(this.h*0.5)-3;
        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : '';

        this.c[2] = this.dom( 'div', this.css.basic + flexible + 'width:100%; left:0;  overflow:hidden; top:'+(this.h)+'px');
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; left:0; top:'+fltop+'px;', { d:this.svgs.g1, fill:cc.text, stroke:'none'});

        //let bh = this.mtop === 0 ? this.margin : this.mtop;
        //let s = this.s;

        this.c[1].name = 'group';
        this.c[1].style.color = cc.text;

        this.init();
        this.setMark( o.mark );

        if( o.open ) this.open();

    }

    setMark ( mark ) {

        //return

        const cc = this.colors;
        const s = this.s;

        //if ( bg !== undefined ) cc.groups = bg;

        let hasBg = mark !== undefined && mark !== 'none';
        
        let titleColor = !this.isDefGroup ? Tools.ColorLuma( mark, -0.65 ) : ( cc.groups === 'none' ? cc.background : cc.groups );
        if( this.bgAlpha !== 1 ) titleColor = Tools.htmlRgba( mark, this.bgAlpha );
        s[ 1 ].background = titleColor;

        

        this.line = this.dom( 'div', 'position:absolute; left:0; top:2px; bottom:2px; width:' + this.borderCC + 'px; background:' + mark + '; pointer-events:none; z-index:10;' );
        this.c[ 0 ].appendChild( this.line );
        
    }

    /*setBG ( bg ) {

        const cc = this.colors
        const s = this.s

        if( bg !== undefined ) cc.groups = bg
        if(cc.groups === 'none') cc.groups = cc.background
        //    cc.background = 'none'

        s[0].background = 'none'//bg !== undefined ? 'none' : cc.content;
        s[1].background = cc.groups//bg !== undefined ? cc.groups : cc.content;
        //s[2].background = bg !== undefined ? cc.groups : cc.content

        //s[0].background = '#FF0';
        //s[4].background = '#FF0';
        //s[2].background = cc.background

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

    //}

    testZone ( e ) {

        //console.log( this.local)

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';

        let name = '';

        if( l.y < this.baseH + this.margin ) name = 'title';
        else {
            if( this.isOpen ) name = 'content';
        }

        return name;

    }

    clearTarget () {

        if( this.current === -1 ) return false;
        let changed = false;
        if( this.proto.s ){
            if ( this.proto.uiout() ) changed = true;
            if ( this.proto.reset() ) changed = true;
        }
        this.proto = null;
        this.current = -1;
        this.cursor();
        return changed

    }

    reset () {

        return this.clearTarget()

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    handleEvent ( e ) {

        let type = e.type;
        let change = false;
        let protoChange = false;

        let name = this.testZone( e );
        if ( !name ) return false;

        switch ( name ) {

            case 'content':

                this.cursor();

                if ( Roots.isMobile && type === 'mousedown' ) {
                    if ( this.getNext( e ) ) change = true;
                }

                if ( this.proto ) {
                    protoChange = this.proto.handleEvent( e );
                }

                if ( !Roots.lock ) {
                    if ( this.getNext( e ) ) change = true;
                }

            break;

            case 'title':

                if ( this.clearTarget() ) change = true;
                this.cursor( 'pointer' );
                if ( type === 'mousedown' ) {
                    if ( this.isOpen ) this.close();
                    else this.open();
                    if ( !this.isUI ) change = true;
                }

            break;

        }

        if ( protoChange ) change = true;
        return change;

    }

    getNext ( e ) {

        let next = Roots.findTarget( this.uis, e );
        let change = false;

        if ( next !== this.current ) {
            if ( this.clearTarget() ) change = true;
            this.current = next;

            if ( next !== -1 ) {
                this.proto = this.uis[ this.current ];
                if ( this.proto.uiover() ) change = true;
            }
        }

        return change;

    }

    /*handleEvent ( e ) {

        let type = e.type;

        let change = false;
        let protoChange = false;

        let name = this.testZone( e );

        if( !name ) return;

        switch( name ){

            case 'content':



            this.cursor()

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

    }*/

    // ----------------------

    

    add() {

        let a = arguments;

        if( typeof a[1] === 'object' ){ 
            a[1].isUI = this.isUI
            a[1].target = this.c[2]
            a[1].main = this.main
            a[1].group = this
        } else if( typeof arguments[1] === 'string' ){
            if( a[2] === undefined ) [].push.call( a, { isUI:true, target:this.c[2], main:this.main, group:this });
            else{ 
                a[2].isUI = true;
                a[2].target = this.c[2];
                a[2].main = this.main;
                a[2].group = this;
            }
        }

        let u = this.ADD.apply( this, a )

        if( u.isGroup ){ 
            //o.add = add;
            u.dx = 8
        }

        /*if ( !u.isGroup && u.s[1] ) {
            u.s[1].background = 'none';
        }*/
        
        //u.dx += 4
        //console.log(this.decal)
        //u.zone.d -= 8
        Roots.forceZone = true
        //u.margin += this.margin

        //console.log( u.margin )
        //Roots.needReZone = true

        //Roots.resize()
         //console.log(Roots.needResize)

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
        while ( this.uis.length ) {
            this.uis[ this.uis.length - 1 ].dispose();
        }
        this.isEmpty = true;
        this.h = this.baseH;

        /*this.close();

        let i = this.uis.length, item;

        while( i-- ){
            item = this.uis.pop()
            this.c[2].removeChild( item.c[0] )
            item.clear( true )

            //this.uis[i].clear()
        }

        this.isEmpty = true;
        this.h = this.baseH;*/

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

        const s = this.s;
        const cc = this.colors;

        s[2].top = (this.h+this.mtop) + 'px';

        /*if(this.radius){

            s[1].borderRadius = '0px'
            s[2].borderRadius = '0px'

            s[1].borderTopLeftRadius = this.radius+'px'
            s[1].borderTopRightRadius = this.radius+'px'
            s[2].borderBottomLeftRadius = this.radius+'px'
            s[2].borderBottomRightRadius = this.radius+'px'
        }*/

        if( cc.gborder !== 'none' ){

            s[2].border = cc.borderSize+'px solid '+ cc.gborder
            s[2].borderTop = 'none';
            s[1].borderBottom = cc.borderSize+'px solid rgba(0,0,0,0)'

        }

        
        
        if ( !this.isUI ) Roots.getZone( this );
        this.zone.w = this.w - this.decal;
        this.calcUis();
        this.parentHeight( this.h - this.baseH )

        Roots.needReZone = true

        //Roots.isLeave = true
        //Roots.needResize = true

    }

    close () {

        super.close()

        let t = this.h - this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.g1 );

        this.h = this.baseH;
        this.zone.h = this.h;

        const s = this.s;
        const cc = this.colors;
        
        s[0].height = this.h + 'px';
        s[2].top = ( this.h + this.mtop ) + 'px';

        if( cc.gborder !== 'none' ){
            s[2].border = 'none'
            s[1].border = cc.borderSize+'px solid '+ cc.gborder
        }

        

        //if(this.radius) s[1].borderRadius = this.radius+'px'

        this.parentHeight(-t)

        Roots.needReZone = true

    }

    calcUis () {

        if( !this.isOpen || this.isEmpty ) this.h = this.baseH
        else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH + this.margin, true ) + this.baseH;
        //else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH, true ) + this.baseH;
        //else this.h = Roots.calcUis( [...this.uis ], this.zone, this.zone.y + this.baseH + this.margin, true ) + this.baseH
       // else this.h = Roots.calcUis( [...this.uis, this.spaceY ], this.zone, this.zone.y + this.baseH + this.margin, true ) + this.baseH

        this.s[0].height = this.h + 'px'
        this.s[2].height = ( this.h - this.baseH ) + 'px'
        this.zone.h = this.h;

    }

    parentHeight ( t ) {


        if ( this.group !== null ) this.group.calc( t )
        else if ( this.isUI ) this.main.calc( t )

    }

    calc ( y ) {

        if ( !this.isOpen ) return;
        if ( y !== undefined ) {
            this.h += y;
            this.parentHeight( y );
        } else {
            this.calcUis();
        }
        this.s[0].height = this.h + 'px';
        this.s[2].height = ( this.h - this.baseH ) + 'px';
        this.zone.h = this.h;

    }

    /*calc ( y ) {

        if( !this.isOpen ) return
        if( this.isUI ) this.main.calc()
        else this.calcUis()

        this.s[0].height = this.h + 'px'
        this.s[2].height = this.h + 'px'

    }*/

    

    rSize () {

        //return

        super.rSize()

        let s = this.s;
        let w = this.w - this.decal;
        const oldH = this.h;

        s[3].left = ( this.sa + this.sb - 6 ) + 'px'

        s[1].width = w + 'px'
        s[2].width = w + 'px'
        s[1].left = this.decal + 'px'
        s[2].left = this.decal + 'px'

        this.zone.w = w;

        if ( this.isOpen ) {
            this.rSizeContent( w );
            this.calcUis();
        }

        if ( this.line ) this.line.style.left = this.decal + 'px';

        if ( this.h !== oldH ) this.parentHeight( this.h - oldH );
        Roots.needReZone = true;

        //if ( this.isUI && !this.group ) this.main.calc();
        //Roots.needReZone = true;

        //if( this.isOpen ) this.rSizeContent()

    }

    rSizeContent ( w = this.w - this.decal ) {

        let i = this.uis.length
        while(i--){
            this.uis[i].setSize( w )
            this.uis[i].rSize()
        }

    }

    //
/*
    uiout() {

        if( this.lock ) return;
        if(!this.overEffect) return;
        if(this.s) this.s[0].background = this.colors.background;

    }

    uiover() {

        if( this.lock ) return;
        if(!this.overEffect) return;
        //if( this.isOpen ) return;
        if(this.s) this.s[0].background = this.colors.backgroundOver;

    }
*/
}