UIL.Gui = function(css, w, center){

    UIL.sizer(w || 300);

    UIL.main = this;
    
    //if(!UIL.DEF)UIL.classDefine();

    
    this.isCenter = center || false;
    this.lockwheel = false;

    this.uis = [];

    this.content = UIL.DOM('UIL content', 'div', css);
    document.body.appendChild(this.content);

    this.top = parseFloat(this.content.style.top.substring(0,this.content.style.top.length-2));

    this.inner = UIL.DOM('UIL inner');
    this.content.appendChild(this.inner);
    
    this.scrollBG = UIL.DOM('UIL scroll-bg', 'div', 'right:0; top:0; width:10px; height:100%; cursor:s-resize; display:none; background:none; ');
    this.content.appendChild(this.scrollBG);
    this.scrollBG.name = 'move';

    this.scrollBG2 = UIL.DOM('UIL scroll-bg', 'div', 'left:0; top:0; width:'+UIL.AW+'px; height:100%; cursor:s-resize; display:none; background:none;');
    this.content.appendChild(this.scrollBG2);
    this.scrollBG2.name = 'move';
    
    this.scroll = UIL.DOM(null, 'rect', 'position:absolute; width:100%; height:100%; pointer-events:none;', {width:1, height:20, x:UIL.WIDTH-1, fill:'#666' });
    UIL.DOM(null, 'rect', '', {width:1, height:20, x:0, fill:'#666' }, this.scroll);
    UIL.DOM(null, 'rect', '', {width:300, height:1, x:0, fill:'#666' }, this.scroll);
    this.content.appendChild( this.scroll );

    this.changeWidth();

    this.isDown = false;
    this.isScroll = false;

    this.content.addEventListener( 'mousedown', this, false );
    this.content.addEventListener( 'mousemove', this, false );
    this.content.addEventListener( 'mouseout',  this, false );
    this.content.addEventListener( 'mouseup',   this, false );
    this.content.addEventListener( 'mouseover', this, false );
    this.content.addEventListener( 'mousewheel', this, false );
    
    window.addEventListener("resize", function(e){this.resize(e)}.bind(this), false );
    this.resize();
}

UIL.Gui.prototype = {
    constructor: UIL.Gui,

    handleEvent : function( e ) {

       // e.preventDefault();
        //e.stopPropagation();

        switch( e.type ) {
            case 'mousedown': this.down( e ); break;
            case 'mousemove': this.move( e ); break;
            case 'mouseup': this.out( e ); break;
            case 'mouseout': this.out( e ); break;
            case 'mouseover': this.over( e ); break;
            case 'mousewheel': this.wheel( e ); break;
        }

    },

    ////

    down: function( e ){
        if(e.target.name){
            if(e.target.name=='move'){
                this.isDown = true;
                this.move( e );
                UIL.setSvg(this.scroll, 'fill','#FFF');
                UIL.setSvg(this.scroll, 'fill','#FFF',1);
                UIL.setSvg(this.scroll, 'fill','#FFF',2);
                e.preventDefault();
            }
        }
    },

    move: function( e ){

        if(!this.isDown) return;
        var rect = this.content.getBoundingClientRect();
        var y = (e.clientY-rect.top)-(this.zone*0.5);

        if(y<0) y = 0;
        if(y>this.zone) y = this.zone;
        this.py = ((y/this.zone)*this.range);

        this.update();

    },

    out: function( e ){

        this.isDown = false;
        UIL.setSvg(this.scroll, 'fill','#666');
        UIL.setSvg(this.scroll, 'fill','#666',1);
        UIL.setSvg(this.scroll, 'fill','#666',2);

    },

    over: function( e ){

        UIL.setSvg(this.scroll, 'fill','#AAA');
        UIL.setSvg(this.scroll, 'fill','#AAA',1);
        UIL.setSvg(this.scroll, 'fill','#AAA',2);

    },

    wheel: function ( e ){

        if(this.lockwheel) return;
        if(!this.isScroll) return;
        var delta = 0;
        if(e.wheelDeltaY) delta= -e.wheelDeltaY*0.04;
        else if(e.wheelDelta) delta= -e.wheelDelta*0.2;
        else if(e.detail) delta=e.detail*4.0;
        this.py += delta;
        if(this.py < 0) this.py = 0;
        if(this.py > this.range) this.py = this.range;

        this.update();

    },

    ////

    update: function ( y ){

        this.py = y === undefined ? this.py : y;

        this.inner.style.top = -this.py+'px';
        var ty = ((this.py*(this.height-this.sh))/this.range) || 0;
        UIL.setSvg(this.scroll, 'y', ty);
        UIL.setSvg(this.scroll, 'y', ty,1);

        if(this.py==0) UIL.setSvg(this.scroll, 'y',0, 2);
        else if(this.py==this.max) UIL.setSvg(this.scroll, 'y',this.height-1, 2);
        else UIL.setSvg(this.scroll, 'y',-1, 2);

    },

    ////

    show:function(){
        this.content.style.display = 'block';
    },
    hide:function(){
        this.content.style.display = 'none';
    },

    add:function( type, o ){
        
        o.isUI = true;
        var n;
        switch(type){
            case 'button': n = new UIL.Button(o); break;
            case 'string': n = new UIL.String(o); break;
            case 'number': n = new UIL.Number(o); break;
            case 'title':  n = new UIL.Title(o);  break;
            case 'color':  n = new UIL.Color(o);  break;
            case 'slide':  n = new UIL.Slide(o);  break;
            case 'bool':   n = new UIL.Bool(o);   break;
            case 'list':   n = new UIL.List(o);   break;
            case 'group':  n = new UIL.Group(o);  break;
            case 'knob':   n = new UIL.Knob(o);   break;
            case 'circular':n = new UIL.Circular(o);   break;
        }
        this.uis.push(n);
        this.calc();
        return n;
    },

    resize:function(e){
        this.height = window.innerHeight-this.top-5;
        this.content.style.height = this.height+'px';
        this.zone = this.height-40;
        this.calc();
        this.update( 0 );
    },
    remove: function ( n ) { 
        var i = this.uis.indexOf( n ); 
        if ( i !== -1 ) { 
            this.uis[i].clear();
            this.uis.splice( i, 1 ); 
        }
    },
    clear:function(){
        this.update( 0 );
        var i = this.uis.length;
        while(i--){
            this.uis[i].clear();
            this.uis[i] = null;
            this.uis.pop();
        }
        this.uis = [];
        this.calc();
    },
    showScroll:function(h){

        this.isScroll = true;

        this.min = 0;
        this.max = h-this.height;
        this.range = this.max - this.min;
        this.sh =(this.height-40)-(this.max*100)/(this.height-40);
        if(this.sh<20)this.sh=20;

        UIL.setSvg(this.scroll, 'height',this.sh);
        UIL.setSvg(this.scroll, 'height',this.sh, 1);

        this.scroll.style.display = 'block';
        this.scrollBG.style.display = 'block';
        this.scrollBG2.style.display = 'block';

        this.update( 0 );
    },

    hideScroll:function(){

        this.isScroll = false;
        this.update( 0 );
        this.scroll.style.display = 'none';
        this.scrollBG.style.display = 'none';
        this.scrollBG2.style.display = 'none';

    },

    calc:function(){
        var total = 0;
        var i = this.uis.length;
        while(i--) total+=this.uis[i].h;
        if(total>this.height) this.showScroll(total);
        else this.hideScroll();
    },
    changeWidth:function(){
        UIL.setDom(this.content, 'width', UIL.WIDTH);
        var decal = 0;
        if(this.isCenter){
            decal = -UIL.WIDTH*0.5; 
            UIL.setDom(this.content, 'margin-left', decal);
        }

        UIL.setDom(this.inner, 'width', UIL.WIDTH);
        UIL.setSvg(this.scroll, 'x',UIL.WIDTH-1,0);
        UIL.setSvg(this.scroll, 'width',UIL.WIDTH,2);
        var i = this.uis.length;

        while(i--){
            this.uis[i].setSize();
            this.uis[i].rSize();
        }
    },
    liner:function(color){
        var l = UIL.DOM('UIL', 'line', 'width:100%; height:1px; bottom:0px;', {x1:0, y1:0, x2:'100%', y2:0, stroke:color || 'rgba(0,0,0,0.5)', 'stroke-width':1, 'stroke-linecap':'butt'} );
        return l;
    }
};