<img src="http://lo-th.github.io/uil/images/uil.png"/> uil v0.7

uil.js is a lightweight ui for javascript.
[**example**](http://lo-th.github.io/uil/index.html)

**1 - init engine**
```sh
var ui = new UIL.Gui('top:150px; left:50%; margin-left:-150px;');
```
**2 - add value**
```sh
ui.add('title', { name:'Title'});
ui.add('bool', { name:'Bool', callback:callback});
ui.add('color', { name:'Color', callback:callback, type:'html', value:0xff0000});
ui.add('color', { name:'Color', callback:callback, type:'rgba', value:[0,1,1,1]});
ui.add('slide', { name:'Slide', callback:callback, value:50});
ui.add('string', { name:'String', callback:callback, value:'welcome to uil'});
ui.add('list', { name:'List', callback:callback, list:[item1, item2, ...]});
ui.add('number', { name:'Number', callback:callback, value:20, min:0, max:10, precision:2, step:0.01 });
ui.add('number', { name:'Vector2', callback:callback, value:[0,0] });
ui.add('number', { name:'Vector3', callback:callback, value:[0,0,0] });
ui.add('number', { name:'Vector4', callback:callback, value:[0,0,0,0] });
```
**3 - callback is simple function easy to define**
```sh
var callback = function(value){ debug.innerHTML = value; }
```
**4 - you can reset all value**
```sh
ui.clear();
```