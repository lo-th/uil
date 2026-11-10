import { Roots } from '../core/Roots.js';
import { Proto } from '../core/Proto.js';

export class Checker extends Proto {

    constructor( o = {} ) {

        super( o );

        this.round = Math.round;

        //this.autoHeight = true;

        this.wfixe = 128
        this.hfixe = 84

        this.ratio = this.hfixe/this.wfixe

        this.hhh = this.w*this.ratio

        this.baseH = this.h;
        this.hplus = o.hplus || 50;

        this.res = o.res || 40;
        this.l = 1;

        this.precision = o.precision || 0;
        

        this.custom = o.custom || false;
        this.names = o.names || ['FPS', 'MS'];
        let cc = o.cc || ['220,220,220', '255,255,0'];

       // this.divid = [ 100, 100, 100 ];
       // this.multy = [ 30, 30, 30 ];

        this.adding = o.adding || false;

        this.range = o.range || [ 165, 100, 100 ];

        this.alpha = o.alpha || 0.25;

        this.values = [];
        this.points = [];
        this.textDisplay = [];

        if(!this.custom){

            this.now = Roots.getTime()
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

            this.txt = o.name || 'Checker'

        }


        let fltop = Math.floor(this.h*0.5)-3;
        const ccc = this.colors;

        this.c[1].textContent = this.txt;
        //this.c[1].innerHTML = '&#160;' + this.txt
        this.c[0].style.cursor = 'pointer';
        this.c[0].style.pointerEvents = 'auto';

        //let panelCss = 'display:none; left:10px; top:'+ this.h + 'px; height:'+(this.hplus - 8)+'px; box-sizing:border-box; background: rgba(0, 0, 0, 0.2); border:1px solid '+ ccc.border +';';

        //if( this.radius !== 0 ) panelCss += 'border-radius:' + this.radius+'px;'; 

        this.model = 'to'

        this.c[2] = this.getCkecker( this.model );
        this.setSvg( this.c[2], 'viewBox', '0 0 '+this.w+' '+this.hhh );
        this.setCss( this.c[2], { width:this.w, height:this.hhh, left:0, top:this.top });

       /* this.c[2] = this.dom( 'path', this.css.basic + panelCss , {} );*/

        //this.c[2].setAttribute('viewBox', '0 0 '+this.res+' 50' );
        //this.c[2].setAttribute('height', '100%' );
        //this.c[2].setAttribute('width', '100%' );
        //this.c[2].setAttribute('preserveAspectRatio', 'none' );
         this.c[2].setAttribute('display', 'none' );
       // this.s[2].display = 'none';


        //this.dom( 'path', null, { fill:'rgba(255,255,0,0.3)', 'stroke-width':1, stroke:'#FF0', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
        //this.dom( 'path', null, { fill:'rgba(0,255,255,0.3)', 'stroke-width':1, stroke:'#0FF', 'vector-effect':'non-scaling-stroke' }, this.c[2] );
        
        // arrow
        this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:6px; height:6px; left:0; top:'+fltop+'px;', { d:this.svgs.g1, fill:ccc.text, stroke:'none'})
        //this.c[3] = this.dom( 'path', this.css.basic + 'position:absolute; width:10px; height:10px; left:4px; top:'+fltop+'px;', { d:this.svgs.arrow, fill:this.colors.text, stroke:'none'});

        // result test
        //this.c[4] = this.dom( 'div', this.css.txt + 'position:absolute; left:10px; top:'+(this.h+2) +'px; display:none; width:100%; text-align:center;' );

        // bottom line
        //if( o.bottomLine ) this.c[4] = this.dom( 'div', this.css.basic + 'width:100%; bottom:0px; height:1px; background: rgba(255, 255, 255, 0.2);');

        this.isShow = false;



        let s = this.s;

        //s[1].marginLeft = '10px';
        s[1].lineHeight = this.h-4;
        s[1].color = ccc.text;
        //s[1].paddingLeft = '18px';
        //s[1].fontWeight = 'bold';

        if( this.radius !== 0 )  s[0].borderRadius = this.radius+'px';
        if( this.colors.gborder!=='none') s[0].border = '1px solid ' + ccc.gborder;




        /*let j = 0;

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
        }*/


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

    open () {

        super.open()

        this.h = this.hplus + this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.g2 );

        if( this.group !== null ){ this.group.calc( this.hplus );}
        else if( this.isUI ) this.main.calc( this.hplus );

        this.s[0].height = this.h +'px';
        this.s[2].display = 'block'; 
        //this.s[4].display = 'block';
        this.isShow = true;

        //if( !this.custom ) Roots.addListen( this );

    }

    close () {

        super.close()

        this.h = this.baseH;

        this.setSvg( this.c[3], 'd', this.svgs.g1 );

        if( this.group !== null ){ this.group.calc( -this.hplus );}
        else if( this.isUI ) this.main.calc( -this.hplus );
        
        this.s[0].height = this.h +'px';
        this.s[2].display = 'none';
        //this.s[4].display = 'none';
        this.isShow = false;

        //if( !this.custom ) Roots.removeListen( this );

        //this.c[4].innerHTML = '';
        
    }


    rSize () {

        let s = this.s;
        let w = this.w;

        s[3].left = ( this.sa + this.sb - 6 ) + 'px'

        s[0].width = w + 'px';
        s[1].width = w + 'px';
        s[2].left = 0 + 'px';
       // s[2].width = w + 'px';

        //s[4].width = (w-20) + 'px';
        
    }
    
}