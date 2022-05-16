import { Proto } from '../core/Proto.js';
import { Tools } from '../core/Tools.js';

export class Numeric extends Proto {

    constructor( o = {} ) {

        super( o )

        this.setTypeNumber( o )

        this.allway = o.allway || false

        this.isDown = false
        this.value = [0]
        this.multy = 1
        this.invmulty = 1
        this.isSingle = true
        this.isAngle = false
        this.isVector = false

        if( o.isAngle ){
            this.isAngle = true
            this.multy = Tools.torad
            this.invmulty = Tools.todeg
        }

        this.isDrag = o.drag || false

        if( o.value !== undefined ){
            if( !isNaN(o.value) ){
                this.value = [o.value]
            } else if( o.value instanceof Array ){ 
                this.value = o.value
                this.isSingle = false
            } else if( o.value instanceof Object ){ 
                this.value = []
                if( o.value.x !== undefined ) this.value[0] = o.value.x
                if( o.value.y !== undefined ) this.value[1] = o.value.y
                if( o.value.z !== undefined ) this.value[2] = o.value.z
                if( o.value.w !== undefined ) this.value[3] = o.value.w
                this.isSingle = false
                this.isVector = true
            }
        }

        this.lng = this.value.length
        this.tmp = []

        this.current = -1
        this.prev = { x:0, y:0, d:0, v:0 }

        let cc = this.colors

        // bg
        this.c[2] = this.dom( 'div', this.css.basic + ' background:' + cc.select + '; top:4px; width:0px; height:' + (this.h-8) + 'px;' )

        this.cMode = []
        
        let i = this.lng
        while(i--){

            if( this.isAngle ) this.value[i] = (this.value[i] * 180 / Math.PI).toFixed( this.precision )
            this.c[3+i] = this.dom( 'div', this.css.txtselect + 'top:1px; height:'+(this.h-2)+'px; color:' + cc.text + '; background:' + cc.back + '; borderColor:' + cc.border+'; border-radius:'+this.radius+'px;')
            if(o.center) this.c[2+i].style.textAlign = 'center'
            this.c[3+i].textContent = this.value[i]
            this.c[3+i].style.color = this.colors.text
            this.c[3+i].isNum = true
            this.cMode[i] = 0

        }

        // selection
        this.selectId = 3 + this.lng;
        this.c[this.selectId] = this.dom(  'div', this.css.txtselect + 'position:absolute; top:2px; height:' + (this.h-4) + 'px; padding:0px 0px; width:0px; color:' + cc.textSelect + '; background:' + cc.select + '; border:none; border-radius:0px;');

        // cursor
        this.cursorId = 4 + this.lng;
        this.c[ this.cursorId ] = this.dom( 'div', this.css.basic + 'top:2px; height:' + (this.h-4) + 'px; width:0px; background:'+cc.text+';' );

        this.init();
    }

    testZone ( e ) {

        let l = this.local
        if( l.x === -1 && l.y === -1 ) return ''

        let i = this.lng
        let t = this.tmp

        while( i-- ){
            if( l.x>t[i][0] && l.x<t[i][2] ) return i
        }

        return ''

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown ( e ) {

        let name = this.testZone( e )

        if( !this.isDown ){
            this.isDown = true
            if( name !== '' ){ 
            	this.current = name
            	this.prev = { x:e.clientX, y:e.clientY, d:0, v: this.isSingle ? parseFloat(this.value) : parseFloat( this.value[ this.current ] ) }
            	this.setInput( this.c[ 3 + this.current ] )
            }
            return this.mousemove( e )
        }

        return false

    }

    mouseup ( e ) {

    	if( this.isDown ){
            
            this.isDown = false
            this.prev = { x:0, y:0, d:0, v:0 }

            return this.mousemove( e )
        }

        return false

    }

    mousemove ( e ) {

        let nup = false
        let x = 0

        let name = this.testZone( e )

        if( name === '' ) this.cursor()
        else{ 
        	if(!this.isDrag) this.cursor('text');
        	else this.cursor( this.current !== -1 ? 'move' : 'pointer' );
        }

        

        if( this.isDrag ){

        	if( this.current !== -1 ){

            	this.prev.d += ( e.clientX - this.prev.x ) - ( e.clientY - this.prev.y )

                let n = this.prev.v + ( this.prev.d * this.step)

                this.value[ this.current ] = this.numValue(n)
                this.c[ 3 + this.current ].textContent = this.value[this.current]

                this.validate()

                this.prev.x = e.clientX
                this.prev.y = e.clientY

                nup = true
             }

        } else {

        	if( this.isDown ) x = e.clientX - this.zone.x -3
        	if( this.current !== -1 ) x -= this.tmp[this.current][0]
        	return this.upInput( x, this.isDown )

        }

        return nup

    }

    // ----------------------

    reset () {

        let nup = false
        return nup

    }


    setValue ( v ) {

        if( this.isVector ){
            if( v.x !== undefined ) this.value[0] = v.x
            if( v.y !== undefined ) this.value[1] = v.y
            if( v.z !== undefined ) this.value[2] = v.z
            if( v.w !== undefined ) this.value[3] = v.w
        } else {
            this.value = this.isSingle ? [v] : v  
        }

        this.update()

    }

    sameStr ( str ){

        let i = this.value.length
        while(i--) this.c[ 3 + i ].textContent = str

    }

    update ( up ) {

        let i = this.value.length

        while(i--){
             this.value[i] = this.numValue( this.value[i] * this.invmulty )
             this.c[ 3 + i ].textContent = this.value[i]
        }

        if( up ) this.send()

    }

    send ( v ) {

        v = v || this.value

        this.isSend = true

        if( this.objectLink !== null ){ 

            if( this.isVector ){
                this.objectLink[ this.objectKey ].fromArray( v )
            } else {
                this.objectLink[ this.objectKey ] = v
            }

        }

        if( this.callback ) this.callback( v, this.objectKey )
        this.isSend = false

    }


    // ----------------------
    //   INPUT
    // ----------------------

    select ( c, e, w, t ) {

        let s = this.s
        let d = this.current !== -1 ? this.tmp[this.current][0] + 5 : 0
        s[this.cursorId].width = '1px'
        s[this.cursorId].left = ( d + c ) + 'px'
        s[this.selectId].left =  ( d + e )  + 'px'
        s[this.selectId].width =  w  + 'px'
        this.c[this.selectId].innerHTML = t
    
    }

    unselect () {

        let s = this.s
        if(!s) return
        this.c[this.selectId].innerHTML = ''
        s[this.selectId].width = 0 + 'px'
        s[this.cursorId].width = 0 + 'px'

    }

    validate ( force ) {

        let ar = []
        let i = this.lng

        if( this.allway ) force = true

        while(i--){
        	if(!isNaN( this.c[ 3 + i ].textContent )){ 
                let nx = this.numValue( this.c[ 3 + i ].textContent );
                this.c[ 3 + i ].textContent = nx
                this.value[i] = nx
            } else { // not number
                this.c[ 3 + i ].textContent = this.value[i]
            }

        	ar[i] = this.value[i] * this.multy
        }

        if( !force ) return
        this.send( this.isSingle ? ar[0] : ar )

    }

    // ----------------------
    //   REZISE
    // ----------------------

    rSize () {

        super.rSize()
        let sx = this.colors.sx
        let ss = sx * (this.lng-1)
        let w = (this.sb-ss) / this.lng//(( this.sb + sx ) / this.lng )-sx
        let s = this.s
        let i = this.lng

        while(i--){
            //this.tmp[i] = [ Math.floor( this.sa + ( w * i )+( 5 * i )), w ];
            this.tmp[i] = [ ( this.sa + ( w * i )+( sx * i )), w ]
            this.tmp[i][2] = this.tmp[i][0] + this.tmp[i][1]
            s[ 3 + i ].left = this.tmp[i][0] + 'px'
            s[ 3 + i ].width = this.tmp[i][1] + 'px'
        }

    }

}