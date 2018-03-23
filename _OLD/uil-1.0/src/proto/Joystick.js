import { Tools } from '../core/Tools';
import { Proto } from '../core/Proto';

function Joystick ( o ) {

    Proto.call( this, o );

    this.autoWidth = false;

    this.value = [0,0];

    this.joyType = 'analogique';

    this.precision = o.precision || 2;
    this.multiplicator = o.multiplicator || 1;

    this.x = 0;
    this.y = 0;

    this.oldx = 0;
    this.oldy = 0;

    this.interval = null;

    this.radius = Math.floor((this.width-20)*0.5);

    /*this.radius = o.radius || 50;

    this.width = (this.radius*2)+20;

    if(o.width !== undefined){
        this.width = o.width;
        this.radius = ~~ (( this.width-20 )*0.5);
    }
    if(o.size !== undefined){
        this.width = o.size;
        this.radius = ~~ (this.width-20)*0.5;
    }*/

    this.innerRadius = o.innerRadius || this.radius*0.6;
    this.maxDistance = this.radius - this.innerRadius - 5;
    this.height = this.radius*2;
    this.h = o.height || (this.height + 40);

    this.top = 0;

    this.c[0].style.width = this.width +'px';

    if(this.c[1] !== undefined) {

        this.c[1].style.width = this.width +'px';
        this.c[1].style.textAlign = 'center';
        this.top = 20;

    }

    this.c[2] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;  pointer-events:auto; cursor:pointer;', { cx:this.radius, cy:this.radius, r:this.radius, fill:'url(#grad)' });
    this.c[3] = Tools.dom( 'circle', Tools.css.basic + 'left:0px; top:'+(this.top-10)+'px; width:'+(this.w+20)+'px; height:'+(this.height+20)+'px;', { cx:this.radius+10, cy:this.radius+10, r:this.innerRadius+10, fill:'url(#gradS)'});
    this.c[4] = Tools.dom( 'circle', Tools.css.basic + 'left:10px; top:'+this.top+'px; width:'+this.w+'px; height:'+this.height+'px;', { cx:this.radius, cy:this.radius, r:this.innerRadius, fill:'url(#gradIn)', 'stroke-width':1, stroke:'#000'  });
    this.c[5] = Tools.dom( 'div', Tools.css.txt + 'text-align:center; top:'+(this.height+20)+'px; width:'+this.width+'px; color:'+ this.fontColor );

    // gradian bakground
    var svg = this.c[2];
    Tools.dom( 'defs', null, {}, svg );
    Tools.dom( 'radialGradient', null, {id:'grad', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
    Tools.dom( 'stop', null, { offset:'40%', style:'stop-color:rgb(0,0,0); stop-opacity:0.3;' }, svg, [1,0] );
    Tools.dom( 'stop', null, { offset:'80%', style:'stop-color:rgb(0,0,0); stop-opacity:0;' }, svg, [1,0] );
    Tools.dom( 'stop', null, { offset:'90%', style:'stop-color:rgb(50,50,50); stop-opacity:0.4;' }, svg, [1,0] );
    Tools.dom( 'stop', null, { offset:'100%', style:'stop-color:rgb(50,50,50); stop-opacity:0;' }, svg, [1,0] );

    // gradian shadow
    svg = this.c[3];
    Tools.dom( 'defs', null, {}, svg );
    Tools.dom( 'radialGradient', null, {id:'gradS', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
    Tools.dom( 'stop', null, { offset:'60%', style:'stop-color:rgb(0,0,0); stop-opacity:0.5;' }, svg, [1,0] );
    Tools.dom( 'stop', null, { offset:'100%', style:'stop-color:rgb(0,0,0); stop-opacity:0;' }, svg, [1,0] );

    // gradian stick

    var cc0 = ['rgb(40,40,40)', 'rgb(48,48,48)', 'rgb(30,30,30)'];
    var cc1 = ['rgb(1,90,197)', 'rgb(3,95,207)', 'rgb(0,65,167)'];

    svg = this.c[4];
    Tools.dom( 'defs', null, {}, svg );
    Tools.dom( 'radialGradient', null, {id:'gradIn', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, svg, 1 );
    Tools.dom( 'stop', null, { offset:'30%', style:'stop-color:'+cc0[0]+'; stop-opacity:1;' }, svg, [1,0] );
    Tools.dom( 'stop', null, { offset:'60%', style:'stop-color:'+cc0[1]+'; stop-opacity:1;' }, svg, [1,0]  );
    Tools.dom( 'stop', null, { offset:'80%', style:'stop-color:'+cc0[1]+'; stop-opacity:1;' }, svg, [1,0]  );
    Tools.dom( 'stop', null, { offset:'100%', style:'stop-color:'+cc0[2]+'; stop-opacity:1;' }, svg, [1,0]  );

    Tools.dom( 'radialGradient', null, {id:'gradIn2', cx:'50%', cy:'50%', r:'50%', fx:'50%', fy:'50%' }, this.c[4], 1 );
    Tools.dom( 'stop', null, { offset:'30%', style:'stop-color:'+cc1[0]+'; stop-opacity:1;' }, svg, [1,1]  );
    Tools.dom( 'stop', null, { offset:'60%', style:'stop-color:'+cc1[1]+'; stop-opacity:1;' }, svg, [1,1] );
    Tools.dom( 'stop', null, { offset:'80%', style:'stop-color:'+cc1[1]+'; stop-opacity:1;' }, svg, [1,1] );
    Tools.dom( 'stop', null, { offset:'100%', style:'stop-color:'+cc1[2]+'; stop-opacity:1;' }, svg, [1,1] );

    //console.log( this.c[4] )

    this.c[5].textContent = 'x'+ this.value[0] +' y' + this.value[1];

    this.c[2].events = [ 'mouseover', 'mousedown', 'mouseout' ];

    this.init();

    this.update(false);
}

Joystick.prototype = Object.assign( Object.create( Proto.prototype ), {

    constructor: Joystick,

    handleEvent: function ( e ) {

        e.preventDefault();

        switch( e.type ) {
            case 'mouseover': this.over( e ); break;
            case 'mousedown': this.down( e ); break;
            case 'mouseout':  this.out( e );  break;
            case 'mouseup':   this.up( e );   break;
            case 'mousemove': this.move( e ); break;
        }

    },

    mode: function ( mode ) {

        switch(mode){
            case 0: // base
                Tools.setSvg( this.c[4], 'fill','url(#gradIn)');
                Tools.setSvg( this.c[4], 'stroke', '#000' );
            break;
            case 1: // over
                Tools.setSvg( this.c[4], 'fill', 'url(#gradIn2)' );
                Tools.setSvg( this.c[4], 'stroke', 'rgba(0,0,0,0)' );
            break;
            case 2: // edit
            break;

        }
    },

    over: function( e ){

        this.isOver = true;
        this.mode(1);

    },

    out: function( e ){

        this.isOver = false;
        if(this.isDown) return;
        this.mode(0);

    },

    up: function( e ){

        this.isDown = false;
        document.removeEventListener( 'mouseup', this, false );
        document.removeEventListener( 'mousemove', this, false );

        this.interval = setInterval(this.update.bind(this), 10);

        if(this.isOver) this.mode(1);
        else this.mode(0);
        
    },

    down: function( e ){

        this.isDown = true;
        document.addEventListener( 'mouseup', this, false );
        document.addEventListener( 'mousemove', this, false );

        this.rect = this.c[2].getBoundingClientRect();
        this.move( e );
        this.mode( 2 );

    },

    move: function ( e ) {

        if( !this.isDown ) return;

        var x = this.radius - ( e.clientX - this.rect.left );
        var y = this.radius - ( e.clientY - this.rect.top );

        var distance = Math.sqrt( x * x + y * y );

        if ( distance > this.maxDistance ) {
            var angle = Math.atan2(x, y);
            x = Math.sin(angle) * this.maxDistance;
            y = Math.cos(angle) * this.maxDistance;
        }

        this.x = x / this.maxDistance;
        this.y = y / this.maxDistance;

        this.update();

    },

    setValue: function ( x, y ) {

        this.x = x || 0;
        this.y = y || 0;

        this.updateSVG();

    },

    update: function ( up ) {

        if(up === undefined) up = true;

        if( this.interval !== null ){

            if( !this.isDown ){
                this.x += (0 - this.x)/3;
                this.y += (0 - this.y)/3;
            }

            if ( this.x.toFixed(2) === this.oldx.toFixed(2) && this.y.toFixed(2) === this.oldy.toFixed(2)){
                
                this.x = 0;
                this.y = 0;
            }

        }

        this.updateSVG();

        if( up ) this.send();

        if( this.interval !== null && this.x === 0 && this.y === 0 ){
            clearInterval( this.interval );
            this.interval = null;
        }

    },

    updateSVG: function () {

        var rx = this.x * this.maxDistance;
        var ry = this.y * this.maxDistance;
        var x = this.radius - rx;
        var y = this.radius - ry;
        var sx = x + ((1-this.x)*5) + 5;
        var sy = y + ((1-this.y)*5) + 10;

        Tools.setSvg( this.c[3], 'cx', sx );
        Tools.setSvg( this.c[3], 'cy', sy );
        Tools.setSvg( this.c[4], 'cx', x );
        Tools.setSvg( this.c[4], 'cy', y );

        this.oldx = this.x;
        this.oldy = this.y;

        this.value[0] = -( this.x * this.multiplicator ).toFixed( this.precision ) * 1;
        this.value[1] =  ( this.y * this.multiplicator ).toFixed( this.precision ) * 1;

        this.c[5].textContent = 'x'+ this.value[0] +' y' + this.value[1];

    },

} );

export { Joystick };