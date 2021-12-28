import { Proto } from '../core/Proto.js';

export class Item extends Proto {

    constructor( o = {} ) {

        super( o );

        this.p = 100;
        this.value = this.txt;
        this.status = 1;

        this.itype = o.itype || 'none';
        this.val = this.itype;

        this.graph = this.svgs[ this.itype ];

        let fltop = Math.floor(this.h*0.5)-7;

        this.c[2] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.graph, fill:this.fontColor, stroke:'none'});

        this.s[1].marginLeft = 20 + 'px';

        this.init();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousemove ( e ) {

        this.cursor('pointer');

        //up = this.modes( this.isDown ? 3 : 2, name );

    }

    mousedown ( e ) {

        if( this.isUI ) this.main.resetItem();

        this.selected( true );

        this.send();

        return true;

    }

    uiout () {

        if( this.isSelect ) this.mode(3);
        else this.mode(1);

    }

    uiover () {

        if( this.isSelect ) this.mode(4);
        else this.mode(2);

    }

    update () {
            
    }

    /*rSize () {
        
        super.rSize();

    }*/

    mode ( n ) {

        let change = false;

        if( this.status !== n ){

            this.status = n;
        
            switch( n ){

                case 1: this.status = 1; this.s[1].color = this.fontColor; this.s[0].background = 'none'; break;
                case 2: this.status = 2; this.s[1].color = this.fontColor; this.s[0].background = this.bgOver; break;
                case 3: this.status = 3; this.s[1].color = '#FFF';         this.s[0].background = this.colors.select; break;
                case 4: this.status = 4; this.s[1].color = '#FFF';         this.s[0].background = this.colors.down; break;

            }

            change = true;

        }

        return change;

    }

    reset () {

        this.cursor();
       // return this.mode( 1 );

    }

    selected ( b ){

        if( this.isSelect ) this.mode(1);

        this.isSelect = b || false;

        if( this.isSelect ) this.mode(3);
        
    }


}