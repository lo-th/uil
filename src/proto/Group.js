
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

        let fltop = Math.floor(this.h*0.5)-3;

        const cc = this.colors;

        this.isLine = o.line !== undefined ? o.line : false;

        

        this.useFlex = true 
        let flexible = this.useFlex ? 'display:flex; flex-flow: row wrap;' : ''

        this.c[2] = this.dom( 'div', this.css.basic + flexible + 'width:100%; left:0; height:auto; overflow:hidden; top:'+(this.h-1)+'px')
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; left:0; top:'+fltop+'px;', { d:this.svgs.g1, fill:cc.text, stroke:'none'})
        //this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:0; top:'+fltop+'px;', { d:this.svgs.group, fill:cc.text, stroke:'none'})
        //this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:0; top:'+fltop+'px;', { d:this.svgs.group, fill:cc.text, stroke:'none'})
        //this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:'+(this.decal-1)+'px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:cc.text, stroke:'none'})



        // bottom line
        if( this.isLine ) this.c[5] = this.dom( 'div', this.css.basic +  'background:rgba(255, 255, 255, 0.2); width:100%; left:0; height:1px; bottom:0px');
        //else this.c[5] = this.dom( 'div', this.css.basic + 'width:100%; left:0; height:auto; top:'+(this.h-1)+'px')

        let s = this.s;
        s[0].height = this.h + 'px'
        this.c[1].name = 'group'

        if( cc.groups !== 'none' ){
            
            s[1].background = cc.groups
            s[1].border = cc.borderSize+'px solid '+ cc.border
            s[1].borderRadius = this.radius+'px'

            //s[5].border = '2px solid ' + '#000' 
            //s[1].marginRight = 10+'px';
        }

        //this.c[1].innerHTML = this.dd + this.name

        //s[1].padding = '0px ' + (10+this.decal)+'px';

        s[1].lineHeight = this.h-4;
        s[1].color = cc.text;
        //s[1].fontWeight = 'bold';





        this.init();

        if( this.radius !== 0 ){ 
            //s[0].borderRadius = this.radius+'px'

            s[1].borderRadius = this.radius+'px'
            s[2].borderRadius = this.radius+'px'
        }


        //s[1].paddingLeft = (10+this.decal)+'px'

        this.setBG( o.bg )

        if( o.open ) this.open()

    }

    setBG ( bg ) {

        const cc = this.colors;

        const s = this.s;

        //if( bg !== undefined ) this.colors.background = bg

        //this.c[0].style.background = this.colors.background;
        s[1].background = bg//this.colors.background
        s[2].background = bg

        //s[5].border = '1px solid ' + '#000' 
        // s[5].background =  '#000'



        let i = this.uis.length;
        while(i--){
            //this.uis[i].setBG( this.colors.background );
        }

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
            this.cursor();

            if( Roots.isMobile && type === 'mousedown' ) this.getNext( e, change )

            if( this.proto ) protoChange = this.proto.handleEvent( e )

            if( !Roots.lock ) this.getNext( e, change )

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

        super.open()

        this.setSvg( this.c[3], 'd', this.svgs.g2 )

        //this.setSvg( this.c[4], 'd', this.svgs.arrowDown )
        this.rSizeContent()

        let t = this.h - this.baseH

        const s = this.s

        if(this.radius){

            s[1].borderRadius = '0px'
            s[2].borderRadius = '0px'

            s[1].borderTopLeftRadius = this.radius+'px'
            s[1].borderTopRightRadius = this.radius+'px'
            s[2].borderBottomLeftRadius = this.radius+'px'
            s[2].borderBottomRightRadius = this.radius+'px'
        }
        



        this.parentHeight()

    }

    close () {

        super.close()

        let t = this.h - this.baseH

        this.setSvg( this.c[3], 'd', this.svgs.g1 )

        //this.setSvg( this.c[4], 'd', this.svgs.arrow )
        this.h = this.baseH

        const s = this.s
        s[0].height = this.h + 'px'
        if(this.radius) s[1].borderRadius = this.radius+'px'

        this.parentHeight()

    }

    calcUis () {

        if( !this.isOpen ) this.h = this.baseH;
        else this.h = Roots.calcUis( this.uis, this.zone, this.zone.y + this.baseH ) + this.baseH;

        this.s[0].height = this.h + 'px';

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
        //s[1].width = this.isbgGroup ? (this.w-5) + 'px' : this.w + 'px'

        s[1].width = this.w + 'px'
        s[2].width = this.w + 'px'
        //s[1].width = (this.w - this.decal) + 'px'
        //s[2].width = (this.w - this.decal) + 'px'

        s[1].left = (this.decal) + 'px'
        s[2].left = (this.decal) + 'px'



        if( this.isOpen ) this.rSizeContent()

    }

}