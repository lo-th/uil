<img src="http://lo-th.github.io/uil/images/logo.jpg"/>  uil v0.3 
=========
uil.js is a lightweight ui for javascript.<br>

[example](http://lo-th.github.io/uil/index.html)

1 - init engine<br>
    var ui = new UIL.Gui('top:150px; left:50%; margin-left:-150px;');<br><br>
2 - add value<br>
    ui.add('title',  { name:'Title'});<br>
    ui.add('bool',   { name:'Bool', callback:callback});<br>
    ui.add('color',  { name:'Color', callback:callback, type:'html', value:0xff0000});<br>
    ui.add('color',  { name:'Color', callback:callback, type:'rgba', value:[0,1,1,1]});<br>
    ui.add('slide',  { name:'Slide', callback:callback, value:50});<br>
    ui.add('string', { name:'String', callback:callback, value:'welcome to uil'});<br>
    ui.add('list',   { name:'List', callback:callback, list:list});<br>
    ui.add('number', { name:'Number', callback:callback, value:20, min:0, max:0, precision:2, step:0.01 });<br>
    ui.add('number', { name:'Vector2', callback:callback, value:[0,0] });<br>
    ui.add('number', { name:'Vector3', callback:callback, value:[0,0,0] });<br>
    ui.add('number', { name:'Vector4', callback:callback, value:[0,0,0,0] });<br><br>
3 - callback is simple function easy to define<br>
    var callback = function(value){ debug.innerHTML = value; }<br><br>
4 - you can reset all value<br>
    ui.clear();<br>