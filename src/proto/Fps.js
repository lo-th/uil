import { Roots } from '../core/Roots';
import { Proto } from '../core/Proto';

export class Fps extends Proto {

    constructor( o = {} ) {

        super( o );

        this.round = Math.round;

        this.autoHeight = true;

        this.baseH = this.h;
        this.hplus = o.hplus || 50;

        this.res = o.res || 40;
        this.l = 1;

        this.precision = o.precision || 0;
        

        this.custom = o.custom || false;
        this.names = o.names || ['FPS', 'MS'];
        let cc = o.cc || ['90,90,90', '255,255,0'];

       // this.divid = [ 100, 100, 100 ];
       // this.multy = [ 30, 30, 30 ];

        this.adding = o.adding || false;

        this.range = o.range || [ 165, 100, 100 ];

        this.alpha = o.alpha || 0.25;

        this.values = [];
        this.points = [];
        this.textDisplay = [];

        if(!this.custom){

            this.now = ( self.performance && self.performance.now ) ? self.performance.now.bind( performance ) : Date.now;
            this.startTime = 0;//this.now()
            this.prevTime = 0;//this.startTime;
            this.frames = 0;

            this.ms = 0;
            this.fps = 0;
            this.mem = 0;
            this.mm = 0;

            this.isMem = ( self.performance && self.performance.memory ) ? true : false;

           // this.divid = [ 100, 200, 1 ];
           // this.multy = [ 30, 30, 30 ];

            if( this.isMem ){

                this.names.push('MEM');
                cc.push('0,255,255');

            }

            this.txt = 'FPS'

        }


        let fltop = Math.floor(this.h*0.5)-6;

        this.c[1].textContent = this.txt;
        this.c[0].style.cursor = 'pointer';
        this.c[0].style.pointerEvents = 'auto';

        let panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px; box-sizing:border-box; background: rgba(0, 0, 0, 0.2); border:' + (this.colors.groupBorder !== 'none'? this.colors.groupBorder+';' : '1px solid rgba(255, 255, 255, 0.2);');

        if( this.radius !== 0 ) panelCss += 'border-radius:' + this.radius+'px;'; 

        this.c[2] = this.dom( 'path', this.css.basic + panelCss , {} );

        this.c[2].setAttribute('viewBox', '0 0 '+this.res+' 50' );
        this.c[2].setAttribute('height', '100%' );
        this.c[2].setAttribute('width', '100%' );
        this.c[2].setAttribute('preserveAspectRatio', 'none' );


        //this.dom( 'path', null, { fill:'rgba(255,255,0,0.3)', 'stroke-width':1, stroke:'#FF0', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
        //this.dom( 'path', null, { fill:'rgba(0,255,255,0.3)', 'stroke-width':1, stroke:'#0FF', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
        
        // arrow
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.fontColor, stroke:'none'});

        // result test
        this.c[4] = this.dom( 'div', this.css.txt + 'position:absolute; left:10px; top:'+(this.h+2) +'px; display:none; width:100%; text-align:center;' );

        // bottom line
        if( o.bottomLine ) this.c[4] = this.dom( 'div', this.css.basic + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');

        this.isShow = false;

        let s = this.s;

        s[1].marginLeft = '10px';
        s[1].lineHeight = this.h-4;
        s[1].color = this.fontColor;
        s[1].fontWeight = 'bold';

        if( this.radius !== 0 )  s[0].borderRadius = this.radius+'px'; 
        s[0].border = this.colors.groupBorder;




        let j = 0;

        for( j=0; j<this.names.length; j++ ){

            let base = [];
            let i = this.res+1;
            while( i-- ) base.push(50);

            this.range[j] = ( 1 / this.range[j] ) * 49;
            
            this.points.push( base );
            this.values.push(0);
           //  this.dom( 'path', null, { fill:'rgba('+cc[j]+',0.5)', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
            this.textDisplay.push( "<span style='color:rgb("+cc[j]+")'> " + this.names[j] +" ");

        }

        j = this.names.length;
        while(j--){
            this.dom( 'path', null, { fill:'rgba('+cc[j]+','+this.alpha+')', 'stroke-width':1, stroke:'rgba('+cc[j]+',1)', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
        }


        this.init();

        //if( this.isShow ) this.show();

    }

    // ----------------------
    //   EVENTS
    // ----------------------

    mousedown ( e ) {

        if( this.isShow ) this.close();
        else this.open();

    }

    // ----------------------

    /*mode: function ( mode ) {

        let s = this.s;

        switch(mode){
            case 0: // base
                s[1].color = this.fontColor;
                //s[1].background = 'none';
            break;
            case 1: // over
                s[1].color = '#FFF';
                //s[1].background = UIL.SELECT;
            break;
            case 2: // edit / down
                s[1].color = this.fontColor;
                //s[1].background = UIL.SELECTDOWN;
            break;

        }
    },*/

    tick ( v ) {

        this.values = v;
        if( !this.isShow ) return;
        this.drawGraph();
        this.upText();

    }

    makePath ( point ) {

        let p = '';
        p += 'M ' + (-1) + ' ' + 50;
        for ( let i = 0; i < this.res + 1; i ++ ) { p += ' L ' + i + ' ' + point[i]; }
        p += ' L ' + (this.res + 1) + ' ' + 50;
        return p;

    }

    upText ( val ) {

        let v = val || this.values, t = '';
        for( let j=0, lng =this.names.length; j<lng; j++ ) t += this.textDisplay[j] + (v[j]).toFixed(this.precision) + '</span>';
        this.c[4].innerHTML = t;
    
    }

    drawGraph () {

        let svg = this.c[2];
        let i = this.names.length, v, old = 0, n = 0;

        while( i-- ){
            if( this.adding ) v = (this.values[n]+old) * this.range[n];
            else  v = (this.values[n] * this.range[n]);
            this.points[n].shift();
            this.points[n].push( 50 - v );
            this.setSvg( svg, 'd', this.makePath( this.points[n] ), i+1 );
            old += this.values[n];
            n++;

        }

    }

    open () {

        super.open();

        this.h = this.hplus + this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.arrowDown );

        if( this.parentGroup !== null ){ this.parentGroup.calc( this.hplus );}
        else if( this.isUI ) this.main.calc( this.hplus );

        this.s[0].height = this.h +'px';
        this.s[2].display = 'block'; 
        this.s[4].display = 'block';
        this.isShow = true;

        if( !this.custom ) Roots.addListen( this );

    }

    close () {

        super.close();

        this.h = this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.arrow );

        if( this.parentGroup !== null ){ this.parentGroup.calc( -this.hplus );}
        else if( this.isUI ) this.main.calc( -this.hplus );
        
        this.s[0].height = this.h +'px';
        this.s[2].display = 'none';
        this.s[4].display = 'none';
        this.isShow = false;

        if( !this.custom ) Roots.removeListen( this );

        this.c[4].innerHTML = '';
        
    }


    ///// AUTO FPS //////

    begin () {

        this.startTime = this.now();
        
    }

    end () {

        let time = this.now();
        this.ms = time - this.startTime;

        this.frames ++;

        if ( time > this.prevTime + 1000 ) {

            this.fps = this.round( ( this.frames * 1000 ) / ( time - this.prevTime ) );

            this.prevTime = time;
            this.frames = 0;

            if ( this.isMem ) {

                let heapSize = performance.memory.usedJSHeapSize;
                let heapSizeLimit = performance.memory.jsHeapSizeLimit;

                this.mem = this.round( heapSize * 0.000000954 );
                this.mm = heapSize / heapSizeLimit;

            }

        }

        this.values = [ this.fps, this.ms , this.mm ];

        this.drawGraph();
        this.upText( [ this.fps, this.ms, this.mem ] );

        return time;

    }

    listening () {

        if( !this.custom ) this.startTime = this.end();
        
    }

    rSize () {

        let s = this.s;
        let w = this.w;

        s[0].width = w + 'px';
        s[1].width = w + 'px';
        s[2].left = 10 + 'px';
        s[2].width = (w-20) + 'px';
        s[4].width = (w-20) + 'px';
        
    }
    
}