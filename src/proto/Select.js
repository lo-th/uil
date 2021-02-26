import { Proto } from '../core/Proto';

export class Select extends Proto {

    constructor( o = {} ) {

        super( o );

        this.value = o.value || '';

        this.isDown = false;

        this.onActif = o.onActif || function(){};

        this.buttonColor = o.bColor || this.colors.button;
        this.buttonOver = o.bOver || this.colors.over;
        this.buttonDown = o.bDown || this.colors.select;
        this.buttonAction = o.bAction || this.colors.action;

        let prefix = o.prefix || '';

        this.c[2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+this.buttonColor+'; height:'+(this.h-2)+'px; border:'+this.colors.buttonBorder+'; border-radius:15px; width:30px; left:10px;' );
        this.c[2].style.color = this.fontColor;

        this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; background:' + this.colors.inputBg + '; borderColor:' + this.colors.inputBorder+'; border-radius:'+this.radius+'px;' );
        this.c[3].textContent = this.value;

        let fltop = Math.floor(this.h*0.5)-7;
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.svgs[ 'cursor' ], fill:this.fontColor, stroke:'none'});

        this.stat = 1;
        this.isActif = false;

        this.init();

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x > this.sa && l.x < this.sa+30 ) return 'over';
        return '0'

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mouseup ( e ) {
    
        if( this.isDown ){
            //this.value = false;
            this.isDown = false;
            //this.send();
            return this.mousemove( e );
        }

        return false;

    }

    mousedown ( e ) {

        let name = this.testZone( e );

        if( !name ) return false;

        this.isDown = true;
        //this.value = this.values[ name-2 ];
        //this.send();
        return this.mousemove( e );

    }

    mousemove ( e ) {

        let up = false;

        let name = this.testZone( e );
        //let sel = false;

        

        //console.log(name)

        if( name === 'over' ){
            this.cursor('pointer');
            up = this.mode( this.isDown ? 3 : 2 );
        } else {
            up = this.reset();
        }

        return up;

    }

    // ----------------------

    apply ( v ) {

        v = v || '';

        if( v !== this.value ) {
            this.value = v;
            this.c[3].textContent = this.value;
            this.send();
        }
        
        this.mode(1);

    }

    update () {

        this.mode( 3 );

    }

    mode ( n ) {

        let change = false;

        if( this.stat !== n ){

            if( n===1 ) this.isActif = false;;

            if( n===3 ){ 
                if( !this.isActif ){ this.isActif = true; n=4; this.onActif( this ); }
                else { this.isActif = false; }
            }

            if( n===2 && this.isActif ) n = 4;

            switch( n ){

                case 1: this.stat = 1; this.s[ 2 ].color = this.fontColor;  this.s[ 2 ].background = this.buttonColor; break; // base
                case 2: this.stat = 2; this.s[ 2 ].color = this.fontSelect; this.s[ 2 ].background = this.buttonOver; break; // over
                case 3: this.stat = 3; this.s[ 2 ].color = this.fontSelect; this.s[ 2 ].background = this.buttonDown; break; // down
                case 4: this.stat = 4; this.s[ 2 ].color = this.fontSelect; this.s[ 2 ].background = this.buttonAction; break; // actif

            }

            change = true;

        }

        return change;



    }

    reset () {

        this.cursor();
        return this.mode( this.isActif ? 4 : 1 );

    }

    text ( txt ) {

        this.c[3].textContent = txt;

    }

    rSize () {

        super.rSize();

        let s = this.s;
        s[2].left = this.sa + 'px';
        s[3].left = (this.sa + 40) + 'px';
        s[3].width = (this.sb - 40) + 'px';
        s[4].left = (this.sa+8) + 'px';

    }

}