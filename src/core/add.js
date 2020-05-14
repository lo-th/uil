
import { Bool } from '../proto/Bool.js';
import { Button } from '../proto/Button.js';
import { Circular } from '../proto/Circular.js';
import { Color } from '../proto/Color.js';
import { Fps } from '../proto/Fps.js';
import { Graph } from '../proto/Graph.js';
import { Group  } from '../proto/Group.js';
import { Joystick } from '../proto/Joystick.js';
import { Knob } from '../proto/Knob.js';
import { List } from '../proto/List.js';
import { Numeric } from '../proto/Numeric.js';
import { Slide } from '../proto/Slide.js';
import { TextInput } from '../proto/TextInput.js';
import { Title } from '../proto/Title.js';
import { Selector } from '../proto/Selector.js';
import { Empty } from '../proto/Empty.js';
import { Item } from '../proto/Item.js';
import { Grid } from '../proto/Grid.js';
/*function autoType () {

    var a = arguments;
    var type = 'Slide';
    if( a[2].type ) type = a[2].type;
    return type;

};*/

function add () {

    var a = arguments; 

    var type, o, ref = false, n = null;

    if( typeof a[0] === 'string' ){ 

        type = a[0];
        o = a[1] || {};

    } else if ( typeof a[0] === 'object' ){ // like dat gui

        ref = true;
        if( a[2] === undefined ) [].push.call(a, {});

        type = a[2].type ? a[2].type : 'slide';//autoType.apply( this, a );

        o = a[2];
        o.name = a[1];
        o.value = a[0][a[1]];

    }

    var name = type.toLowerCase();

    if( name === 'group' ) o.add = add;

    switch( name ){

        case 'bool': n = new Bool(o); break;
        case 'button': n = new Button(o); break;
        case 'circular': n = new Circular(o); break;
        case 'color': n = new Color(o); break;
        case 'fps': n = new Fps(o); break;
        case 'graph': n = new Graph(o); break;
        case 'group': n = new Group(o); break;
        case 'joystick': n = new Joystick(o); break;
        case 'knob': n = new Knob(o); break;
        case 'list': n = new List(o); break;
        case 'numeric': case 'number': n = new Numeric(o); break;
        case 'slide': n = new Slide(o); break;
        case 'textInput': case 'string': n = new TextInput(o); break;
        case 'title': n = new Title(o); break;
        case 'selector': n = new Selector(o); break;
        case 'empty': case 'space': n = new Empty(o); break;
        case 'item': n = new Item(o); break;
        case 'grid': n = new Grid(o); break;

    }

    if( n !== null ){

        if( ref ) n.setReferency( a[0], a[1] );
        return n;

    }
    

};

export { add };