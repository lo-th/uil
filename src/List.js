UIL.List = function(obj){

    UIL.Proto.call( this, obj );

    this.c[2] = UIL.DOM('UIL list');
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', '', {width:UIL.BW, height:15, fill:UIL.bgcolor(UIL.COLOR) });
    //this.c[4] = UIL.DOM('UIL', 'path', '',{x:160, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' }, this.c[3] );
    this.c[4] = UIL.DOM('UIL', 'path','position:absolute; width:16px; left:'+(UIL.AW+UIL.BW-17)+'px; top:1px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' } );
    this.c[5] = UIL.DOM('UIL text-r', 'div', 'text-align:center;');


    this.list = obj.list || [];
    if(obj.value){
        if(!isNaN(obj.value)) this.value = this.list[obj.value];
        else this.value = obj.value;
    }else{
        this.value = this.list[0];
    }
    
    this.show = false;
    this.length = this.list.length;
    this.max = this.length*18;
    this.w = UIL.BW;
    this.down = false;
    this.range = this.max - 90;
    this.py = 0;
    this.scroll = false;

    if(this.max>90){ 
        this.w = UIL.BW-20;
        this.scroll = true;
    }

    this.listIn = UIL.DOM('UIL list-in');
    this.listsel = UIL.DOM('UIL list-sel');
    this.listIn.name = 'list';
    this.listsel.name = 'list';
    this.c[2].appendChild(this.listIn);
    this.c[2].appendChild(this.listsel);

    // populate list
    var item, n, l = UIL.BW;
    for(var i=0; i<this.length; i++){
        n = this.list[i];
        item = UIL.DOM('UIL listItem', 'div', 'width:'+this.w+'px; height:18px;');
        item.innerHTML = n;
        item.name = n;
        this.listIn.appendChild(item);
    }

    this.c[5].innerHTML = this.value;
    this.c[2].name = 'list';

    // click top
    this.f[0] = function(e){
        if(this.show) this.f[1]();
        else this.f[2]();
    }.bind(this);

    // close
    this.f[1] = function(e){
        this.show = false;
        this.h = 20;
        this.c[0].style.height = this.h+'px';
        this.c[2].style.display = 'none';
        UIL.setSVG(this.c[4], 'd','M 6 4 L 10 8 6 12');
        UIL.main.calc();
    }.bind(this);

    // open
    this.f[2] = function(e){
        this.f[8](0);
        this.show = true;
        this.h = 120;
        if(!this.scroll){
            this.h = 30+this.max;
            this.listsel.style.display = 'none';
            this.c[2].onmousemove = null;
            this.c[2].onmousewheel = null; 
        }
        this.c[0].style.height = this.h+'px';
        this.c[2].style.display = 'block';
        UIL.setSVG(this.c[4], 'd','M 12 6 L 8 10 4 6');
        UIL.main.calc();
    }.bind(this);

    // mousedown
    this.f[3] = function(e){
        var name = e.target.name;
        if(name!=='list' && name!==undefined ){
            this.value = e.target.name;
            this.c[5].innerHTML = this.value;
            this.callback(this.value);
            this.f[1]();
        }else if (name=='list'){
            this.down = true;
            this.f[4](e);
            this.listIn.style.background = 'rgba(0,0,0,0.6)';
            this.listsel.style.backgroundColor = '#AAA';
            e.preventDefault();
        }
    }.bind(this);

    // mousemove
    this.f[4] = function(e){
       if(this.down){
            var rect =this.c[2].getBoundingClientRect();
            var y = e.clientY-rect.top;
            if(y<30) y = 30;
            if(y>100) y = 100;
            this.py = (((y-30)/70)*this.range).toFixed(0);
            this.f[8]();
        }
    }.bind(this);

    // mouseout
    this.f[5] = function(e){
        UIL.main.lockwheel = false;
        this.f[6]();
        var name = e.relatedTarget.name;
        if(name==undefined)this.f[1]();
    }.bind(this);

    // mouseup
    this.f[6] = function(e){
        this.down = false;
        this.listIn.style.background = 'rgba(0,0,0,0.2)';
        this.listsel.style.backgroundColor = '#666'
    }.bind(this);

    //onmousewheel
    this.f[7] = function(e){
        UIL.main.lockwheel = true;
        var delta = 0;
        if(e.wheelDeltaY) delta= -e.wheelDeltaY*0.04;
        else if(e.wheelDelta) delta= -e.wheelDelta*0.2;
        else if(e.detail) delta=e.detail*4.0;
        this.py+=delta;
        if(this.py<0) this.py=0;
        if(this.py>this.range) this.py=this.range;
        this.f[8]();
    }.bind(this);

    //update position
    this.f[8] = function(y){
        if(y !== undefined) this.py = y;
        this.listIn.style.top = -this.py+'px';
        this.listsel.style.top = ((this.py*70)/this.range)+'px';
    }.bind(this);

    this.f[9] = function(e){
        this.c[5].style.color = '#FFF';
        UIL.setSVG(this.c[3], 'fill', UIL.SELECT );
    }.bind(this);

    this.f[10] = function(e){
        this.c[5].style.color = '#CCC';
        UIL.setSVG(this.c[3], 'fill', UIL.bgcolor(UIL.COLOR) );
    }.bind(this);

    this.f[11] = function(e){
        this.c[5].style.color = '#CCC';
        UIL.setSVG(this.c[3], 'fill', UIL.SELECTDOWN );
    }.bind(this);

    this.c[3].onclick = this.f[0];
    this.c[2].onmousedown = this.f[3];
    this.c[2].onmousemove = this.f[4];
    this.c[2].onmouseout = this.f[5];
    this.c[2].onmouseup = this.f[6];
    this.c[2].onmousewheel = this.f[7]; 

    this.c[3].onmouseover = this.f[9];
    this.c[3].onmouseout = this.f[10];
    this.c[3].onmouseup = this.f[10];
    this.c[3].onmousedown = this.f[11];

    this.init();
}

UIL.List.prototype = Object.create( UIL.Proto.prototype );
UIL.List.prototype.constructor = UIL.List;
UIL.List.prototype.clear = function(){
   
    while (this.listIn.firstChild) {
       this.listIn.removeChild(this.listIn.firstChild);
    }
    while (this.c[2].firstChild) {
       this.c[2].removeChild(this.c[2].firstChild);
    }
    UIL.Proto.prototype.clear.call( this );
}

UIL.List.prototype.rSize = function(){
    UIL.setSVG(this.c[3], 'width', UIL.BW);
    UIL.setDOM(this.c[3], 'width', UIL.BW);
    UIL.setDOM(this.c[3], 'left', UIL.AW);

    UIL.setDOM(this.c[4], 'left', UIL.AW+UIL.BW-17);

    UIL.setDOM(this.c[5], 'left', UIL.AW);
    UIL.setDOM(this.c[5], 'width', UIL.BW);

    UIL.setDOM(this.c[2], 'left', UIL.AW-20);
    UIL.setDOM(this.c[2], 'width', UIL.BW);


    this.w = UIL.BW;
    if(this.max>90) this.w = UIL.BW-20;
    for(var i=0; i<this.length; i++){
        UIL.setDOM(this.listIn.children[i], 'width', this.w);
    }
    
    /*this.width = UIL.BW-40;
    this.w = this.width-8;
    
    //UIL.setSVG(this.c[4], 'width',this.width);
    
    UIL.setDOM(this.c[4], 'left', UIL.AW);
    
    UIL.setDOM(this.c[4], 'width', this.width);

    UIL.setDOM(this.c[2], 'left', UIL.WIDTH-50);

    this.f[5](false);*/

    UIL.Proto.prototype.rSize.call( this );
};