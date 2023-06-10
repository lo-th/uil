<p align="center"><a href="http://lo-th.github.io/uil/"><img src="http://lo-th.github.io/uil/examples/assets/uil.jpg"/></a><br>UIL v4.3.0</p>

uil.js is a lightweight ui for javascript with a complete 3d display support.<br>
totally customizable, only 6 events, auto resize<br>
[**MAIN EXAMPLE**](http://lo-th.github.io/uil/index.html)

**1 - init engine**
```sh
var ui = new UIL.Gui( { w:300 } )
```
**2 - add value**
```sh
ui.add('title', { name:'Title'})
ui.add('bool', { name:'Bool' })
ui.add('color', { name:'Color', type:'rgba', value:[0,1,1,1]})
ui.add('slide', { name:'Slide', value:50})
let myList = ui.add('list', { name:'List', list:['i1', 'i2', ...]})
```
**3 - add value with object reference**
```sh
const obj = {
  name:'welcome to uil',
  value: 2,
  slider: 30,
  vector: { x:10, y:-30 }
}

ui.add( obj, 'string', { type:'string' })
ui.add( obj, 'value', { type:'number', min:0, max:10, precision:2, step:0.01 })
ui.add( obj, 'slider', { type:'slide' })
ui.add( obj, 'vector', { type:'number' })
```
**4 - callback return the value**
```sh
ui.add('number', { name:'Vector4', value:[0,0,0,0] }).onChange( function(v){ debug.innerHTML = v; } )
```
**5 - you can reset all value**
```sh
ui.clear();
```
**6 - other examples**

[**uil module**](http://lo-th.github.io/uil/examples/index_module.html)

[**uil listen**](http://lo-th.github.io/uil/examples/uil_listen.html)

[**uil color**](http://lo-th.github.io/uil/examples/uil_color.html)

[**uil stresstest**](http://lo-th.github.io/uil/examples/uil_stresstest.html)

[**uil group**](http://lo-th.github.io/uil/examples/uil_group.html)

[**uil to canvas**](http://lo-th.github.io/uil/examples/uil_to_canvas.html)

[**uil to three**](http://lo-th.github.io/uil/examples/uil_3d.html)

[**uil to three 2**](http://lo-th.github.io/uil/examples/uil_3d_2.html)

**7 - uil is on npm**
```sh
npm i uil