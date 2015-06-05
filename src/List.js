UIL.List = function(target, name, callback, value, list ){

    this.callback = callback || function(){};

    this.c = [];
    this.f = [];

    this.c[0] = target;
    this.c[1] = UIL.element('UIL base', 'div', 'background:'+UIL.bgcolor('G')+';');
    this.c[2] = UIL.element('UIL text');
    this.c[3] = UIL.element('UIL Listtxt', 'div', 'background:'+UIL.bgcolor('G')+';');
    this.c[4] = UIL.element('UIL list');

    if(!isNaN(value)) this.value = list[value];
    else this.value = value;
    this.list = list || [];
    this.show = false;
    this.length = this.list.length;
    this.max = this.length*16;
    this.w = 170;
    this.down = false;
    this.range = this.max - 80;
    this.py = 0;

    if(this.max>80) this.w = 150;

    this.listIn = UIL.element('UIL list-in');
    this.listsel = UIL.element('UIL list-sel');
    this.listIn.name = 'list';
    this.listsel.name = 'list';
    this.c[4].appendChild(this.listIn)
    this.c[4].appendChild(this.listsel)

    // populate list
    var item, n, l = 170;
    for(var i=0; i<this.length; i++){
        n = this.list[i];
        item = UIL.element('UIL listItem', 'div', 'width:'+this.w+'px;');
        item.innerHTML = n;
        item.name = n;
        this.listIn.appendChild(item);
    }

    this.c[2].innerHTML = name;
    this.c[3].innerHTML = this.value;
    this.c[4].name = 'list';

    // click top
    this.f[0] = function(e){
        if(this.show) this.f[1]();
        else this.f[2]();
    }.bind(this);

    // close
    this.f[1] = function(e){
        this.show = false;
        this.c[1].style.height = '20px';
        this.c[4].style.display = 'none';
    }.bind(this);

    // open
    this.f[2] = function(e){
        this.show = true;
        this.c[1].style.height = '110px';
        this.c[4].style.display = 'block';
    }.bind(this);

    // mousedown
    this.f[3] = function(e){
        var name = e.target.name;
        if(name!=='list' && name!==undefined ){
            this.value = e.target.name;
            this.c[3].innerHTML = this.value;
            this.callback(value);
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
            var rect =this.c[4].getBoundingClientRect();
            var y = e.clientY-rect.top;
            if(y<30) y = 30;
            if(y>90) y = 90;
            this.py = (((y-30)/60)*this.range).toFixed(0);
            this.listIn.style.top = -this.py+'px';
            this.listsel.style.top = (y-30)+'px';
        }
    }.bind(this);

    // mouseout
    this.f[5] = function(e){
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


    this.c[3].onclick = this.f[0];
    this.c[4].onmousedown = this.f[3];
    this.c[4].onmousemove = this.f[4];
    this.c[4].onmouseout = this.f[5];
    this.c[4].onmouseup = this.f[6];

    UIL.create(this);
}

UIL.List.prototype = {
    constructor: UIL.List,
    clear:function(){
       
        while (this.listIn.firstChild) {
           this.listIn.removeChild(this.listIn.firstChild);
        }
        while (this.c[4].firstChild) {
           this.c[4].removeChild(this.c[4].firstChild);
        }
        UIL.clear(this);
    }
}
