UIL.Group = function(obj){

    UIL.Proto.call( this, obj );

    this.h = 25;

    this.isOpen = false;

    this.c[2] = UIL.DOM('UIL', 'div', 'top:25px; overflow:hidden;');
    this.c[3] = UIL.DOM('UIL', 'path','position:absolute; width:16px; left:'+(this.sa+this.sb-17)+'px; top:4px; pointer-events:none;',{ width:16, height:16, 'd':'M 6 4 L 10 8 6 12', 'stroke-width':2, stroke:'#e2e2e2', fill:'none', 'stroke-linecap':'butt' } );

    this.setDom(0, 'height', this.h);
    this.setDom(1, 'height', this.h);
    this.setDom(1, 'top', 0);
    this.c[1].style.pointerEvents = 'auto';
    this.c[1].style.cursor = 'pointer';
    this.c[1].name = 'group';
    
    this.setDom(1, 'top', 4);

    this.uis = [];

    this.f[0] = function(){
        if(this.isOpen) this.close();
        else this.open();
        UIL.main.calc();
    }.bind(this);

    this.c[1].onclick = this.f[0];

    this.init();
}

UIL.Group.prototype = Object.create( UIL.Proto.prototype );
UIL.Group.prototype.constructor = UIL.Group;

UIL.Group.prototype.rSize = function(){
    UIL.Proto.prototype.rSize.call( this );
    this.setDom(3, 'left', this.sa+this.sb-17);
    this.setDom(1, 'width', this.size);
    this.setDom(2, 'width', this.size);
    var i = this.uis.length;
    while(i--){
        this.uis[i].setSize();
        this.uis[i].rSize();
    }
    this.calc();
};

UIL.Group.prototype.add = function(type, obj){
    obj.target = this.c[2];
    UIL.Gui.prototype.add.call( this, type, obj );
};

UIL.Group.prototype.calc = function(){
    if(!this.isOpen) return;
    this.h = 25;
    var i = this.uis.length;
    while(i--) this.h+=this.uis[i].h;

    this.setDom(2, 'height', this.h-25);
    this.setDom(0, 'height', this.h);
};

UIL.Group.prototype.open = function(){
    this.isOpen = true;
    this.setSvg(3, 'd','M 12 6 L 8 10 4 6');
    this.calc();
}

UIL.Group.prototype.close = function(){
    this.isOpen = false;
    this.setSvg(3, 'd','M 6 4 L 10 8 6 12');
    this.h = 25;
    this.setDom(2, 'height', 0);
    this.setDom(0, 'height', this.h);
}

UIL.Group.prototype.clear = function(){
    this.clearGroup();
    UIL.Proto.prototype.clear.call( this );
}

UIL.Group.prototype.clearGroup = function(){
    var i = this.uis.length;
    while(i--){
        this.uis[i].clear();
        this.uis.pop();
    }
    this.uis = [];
    this.calc();
};