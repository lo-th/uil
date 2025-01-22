import { Proto } from '../core/Proto.js';
import { Files } from '../core/Files.js';
import { Tools } from '../core/Tools.js';

export class Bitmap extends Proto {

    constructor( o = {} ) {

        super( o )

        this.value = o.value || ''
        this.colorSpace = o.colorSpace || ''


        //this.refTexture = o.texture || null;
        this.img = null

        if( this.value.isTexture ){
            if( this.value.image ){
                this.img = this.value.image;   
            }
        }

        
        


        this.isDown = false
        this.neverlock = true

        const cc = this.colors

        this.c[2] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+cc.buttonBorder+'; border-radius:2px; width:30px; ' )

        this.c[3] = this.dom( 'div', this.css.txtselect + 'height:' + (this.h-4) + 'px; background:' + cc.back + '; borderColor:' + cc.inputBorder+'; border-radius:'+this.radius+'px;' )
        //this.c[3].textContent = this.value;
        if(!this.img) this.c[3].textContent = 'null';
        

        let fltop = Math.floor(this.h*0.5)-7
        this.c[4] = this.dom( 'path', this.css.basic + 'position:absolute; width:14px; height:14px; left:5px; top:'+fltop+'px;', { d:this.svgs[ 'load' ], fill:cc.text, stroke:'none'})

        //this.c[5] = this.dom( 'div', this.css.txt + this.css.button + ' top:1px; background:'+cc.button+'; height:'+(this.h-2)+'px; border:'+cc.buttonBorder+'; border-radius:2px; width:30px; ' )

        this.stat = 1

        this.makePreview()

        this.init()

    }

    testZone ( e ) {

        let l = this.local;
        if( l.x === -1 && l.y === -1 ) return '';
        if( l.x > this.sa && l.x < this.sa+30 ) return 'over';
        if( l.x > this.sa-30 && l.x < this.sa ) return 'delete';
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
            Files.load( { callback:this.changeBitmap.bind(this), always:true, type:'image' } )

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

    makePreview(){

        if( this.img ){
            //let src = this.img.src ? this.img.src : this.img;
            this.c[3].style.background = 'url('+this.img.src+')';
            this.c[3].style.backgroundSize = (this.sb - 40) + 'px ' + (this.sb - 40) + 'px'
            //this.c[3].style.backgroundSize = 20 + 'px ' + 20 + 'px'
            this.c[3].style.backgroundPosition = 'center';
            this.c[3].style.backgroundRepeat = 'no-repeat';
        } else {
            this.c[3].style.background = this.colors.back;
            this.c[3].style.backgroundImage = 'none';
        }

    }

    changeBitmap( img, fname, type ){

        if( img ){
            this.img = img;
            this.apply( fname )
        } else {
            this.img = null;
            this.apply( 'null' )
        }

        this.makePreview();
        this.threeTexture();
        
    }

    // ----------------------

    threeTexture() {

        // need define UIL.Tools.texture = THREE.Texture;

        if( this.objectLink === null ) return;
        
        let texture = this.objectLink[this.objectKey];
        if( this.img ){
            if( texture !== null ){
                texture.image = this.img;
                this.objectLink[this.objectKey] = texture.clone();
                texture.dispose();
                this.objectLink[this.objectKey].needsUpdate = true;
            } else if( Tools.texture ){
                texture = new Tools.texture(this.img)
                //console.log('colorSpace',  texture.colorSpace )
                if( this.colorSpace ) texture.colorSpace = this.colorSpace;//'srgb';
                this.objectLink[this.objectKey] = texture;
                this.objectLink[this.objectKey].needsUpdate = true;
            }
        }
        else {
            this.objectLink[this.objectKey] = null;
        }
        this.objectLink.needsUpdate = true;
    }

    apply ( v ) {

        v = v || '';
        let name = this.objectLink !== null ? this.objectKey : this.name;

        if( v !== this.value ) {
            this.value = v;

            if( this.img !== null ){
                this.c[3].textContent = '';
                //if( this.objectLink !== null ) this.objectLink[ this.val ] = v
                if( this.callback ) this.callback( this.value, this.img, name )
            } else {
                this.c[3].textContent = 'null';
                //if( this.objectLink !== null ) this.objectLink[ this.val ] = v
                if( this.callback ) this.callback( null, null, name )
            }

            
            
        }
        
        this.mode(1);

    }

    update () {

        this.mode( 3 );

    }

    mode ( n, id ) {

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

        //s[3].backgroundSize = (this.sb - 40) + 'px' + (this.sb - 40) + 'px'
        //s[5].left = (this.w-30) + 'px';

    }

}