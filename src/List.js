UIL.List = function(obj){

    UIL.Proto.call( this, obj );

    this.c[2] = UIL.DOM('UIL list');
    this.c[3] = UIL.DOM('UIL svgbox', 'rect', '', {width:this.sb, height:17, fill:UIL.bgcolor(UIL.COLOR), 'stroke-width':1, stroke:UIL.SVGC  });
    this.c[4] = UIL.DOM('UIL', 'path','position:absolute; width:16px; left:'+(this.sa+this.sb-17)+'px; top:1px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' } );
    this.c[5] = UIL.DOM('UIL text', 'div', 'text-align:center;');
    this.c[6] = UIL.DOM('UIL svgbox', 'rect', 'top:20px; height:90; pointer-events:none;', { x:this.sb-15, y:0, width:10, height:16, fill:'#666', 'stroke-width':1, stroke:UIL.SVGC  });


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
    this.w = this.sb;
    this.down = false;
    this.range = this.max - 90;
    this.py = 0;
    this.scroll = false;

    // list up or down
    this.side = obj.side || 'down';

    // force full list 
    this.full = obj.full || false;


    if(this.max>90){ 
        this.w = this.sb-20;
        this.scroll = true;
    }


    //console.log(this.scroll)

    this.listIn = UIL.DOM('UIL list-in');
    this.listIn.name = 'list';
    this.c[2].appendChild(this.listIn);

    // populate list
    var item, n, l = this.sb;
    for(var i=0; i<this.length; i++){
        n = this.list[i];
        item = UIL.DOM('UIL listItem', 'div', 'width:'+this.w+'px; height:18px;');
        item.textContent = n;
        item.name = n;
        this.listIn.appendChild(item);
    }

    this.c[5].textContent = this.value;
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
        this.setSvg(4, 'd','M 6 4 L 10 8 6 12');
        if(UIL.main)UIL.main.calc();
    }.bind(this);

    // open
    this.f[2] = function(e){
        this.f[8](0);
        this.show = true;
        this.h = 120;
        if(!this.scroll){
            this.h = 30+this.max;
            this.c[6].style.display = 'none';
            this.c[2].onmousemove = null;
            this.c[2].onmousewheel = null; 
        }
        this.c[0].style.height = this.h+'px';
        this.c[2].style.display = 'block';
        this.setSvg(4, 'd','M 12 6 L 8 10 4 6');
        if(UIL.main)UIL.main.calc();
    }.bind(this);

    // mousedown
    this.f[3] = function(e){
        var name = e.target.name;
        if(name!=='list' && name!==undefined ){
            this.value = e.target.name;
            this.c[5].textContent = this.value;
            this.callback(this.value);
            this.f[1]();
        }else if (name=='list' && this.scroll){
            this.down = true;
            this.f[4](e);
            this.listIn.style.background = 'rgba(0,0,0,0.6)';
            this.setSvg(6, 'fill', '#AAA');
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
        if(UIL.main)UIL.main.lockwheel = false;
        this.f[6]();
        var name = e.relatedTarget.name;
        if(name==undefined)this.f[1]();
    }.bind(this);

    // mouseup
    this.f[6] = function(e){
        this.down = false;
        this.listIn.style.background = 'rgba(0,0,0,0.2)';
        this.setSvg(6, 'fill', '#666');
    }.bind(this);

    //onmousewheel
    this.f[7] = function(e){
        if(!this.scroll)return;
        if(UIL.main)UIL.main.lockwheel = true;
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
        if(!this.scroll)return;
        if(y !== undefined) this.py = y;
        this.listIn.style.top = -this.py+'px';
        this.setSvg(6, 'y', ((this.py*70)/this.range)+2 );
    }.bind(this);

    this.f[9] = function(e){
        this.c[5].style.color = '#FFF';
        this.setSvg(3, 'fill', UIL.SELECT );
    }.bind(this);

    this.f[10] = function(e){
        this.c[5].style.color = '#CCC';
        this.setSvg(3, 'fill', UIL.bgcolor(UIL.COLOR));
    }.bind(this);

    this.f[11] = function(e){
        this.c[5].style.color = '#CCC';
        this.setSvg(3, 'fill', UIL.SELECTDOWN );
    }.bind(this);

    
    this.c[2].onmousedown = this.f[3];
    this.c[2].onmousemove = this.f[4];
    this.c[2].onmouseout = this.f[5];
    this.c[2].onmouseup = this.f[6];
    this.c[2].onmousewheel = this.f[7]; 

    this.c[3].onclick = this.f[0];
    this.c[3].onmouseover = this.f[9];
    this.c[3].onmouseout = this.f[10];
    this.c[3].onmouseup = this.f[10];
    this.c[3].onmousedown = this.f[11];

    this.init();
}

UIL.List.prototype = Object.create( UIL.Proto.prototype );
UIL.List.prototype.constructor = UIL.List;

UIL.List.prototype.text = function(txt){
    this.c[5].textContent = txt;
}

UIL.List.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.setSvg(3, 'width', this.sb);
    this.setDom(3, 'width', this.sb);
    this.setDom(3, 'left', this.sa);

    this.setDom(4, 'left', this.sa+this.sb-17);

    this.setDom(5, 'left', this.sa);
    this.setDom(5, 'width', this.sb);

    this.setDom(2, 'left', this.sa-20);
    this.setDom(2, 'width', this.sb);

    this.setDom(6, 'left', this.sa);
    this.setDom(6, 'width', this.sb);
    this.setSvg(6, 'x', this.sb-15);

    this.w = this.sb;
    if(this.max>90) this.w = this.sb-20;
    for(var i=0; i<this.length; i++){
        UIL.setDOM(this.listIn.children[i], 'width', this.w);
    }
};