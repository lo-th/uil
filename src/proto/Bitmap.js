import { Proto } from '../core/Proto.js';
import { Files } from '../core/Files.js';


export class Bitmap extends Proto {

    constructor( o = {} ) {

        super( o )

        this.value = o.value || ''
        this.refTexture = o.texture || null;
        this.img = null

        this.isDown = false
        this.neverlock = true



        const cc = this.colors

        this.c[2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+cc.buttonBorder+'; border-radius:15px; width:30px; left:10px;' )

        this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; background:' + cc.inputBg + '; borderColor:' + cc.inputBorder+'; border-radius:'+this.radius+'px;' )
        this.c[3].textContent = this.value;

        let fltop = Math.floor(this.h*0.5)-7
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.svgs[ 'load' ], fill:cc.text, stroke:'none'})

        this.stat = 1

        this.init()

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

        if( name === 'over' ){
            this.isDown = true
            Files.load( { callback:this.changeBitmap.bind(this) } )

        }

        
        //this.value = this.values[ name-2 ];
        //this.send();
        return this.mousemove( e );

    }

    mousemove ( e ) {

        let up = false;

        let name = this.testZone( e );

        if( name === 'over' ){
            this.cursor('pointer');
            up = this.mode( this.isDown ? 3 : 2 )
        } else {
            up = this.reset();
        }

        return up;

    }

    // ----------------------

    changeBitmap( img, fname ){

        if( img ){
            this.img = img
            this.apply( fname )
        } else {
            this.img = null
            this.apply( 'null' )
        }
        
    }

    // ----------------------

    apply ( v ) {

        v = v || '';

        if( v !== this.value ) {
            this.value = v;
            this.c[3].textContent = this.value;

            if( this.img !== null ){
                if( this.objectLink !== null ) this.objectLink[ this.val ] = v
                if( this.callback ) this.callback( this.value, this.img, this.name )
            }
            
        }
        
        this.mode(1);

    }

    update () {

        this.mode( 3 );

    }

    mode ( n ) {

        let change = false
        let cc = this.colors

        if( this.stat !== n ){

            this.stat = n

            switch( n ){

                case 1: this.s[ 2 ].color = cc.text; this.s[ 2 ].background = cc.button; break; // base
                case 2: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.overoff; break; // over
                case 3: this.s[ 2 ].color = cc.textOver; this.s[ 2 ].background = cc.over; break; // down
                case 4: this.s[ 2 ].color = cc.textSelect; this.s[ 2 ].background = cc.select; break; // actif

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