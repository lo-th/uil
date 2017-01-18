
import { Bool } from '../proto/Bool.js';
import { Button } from '../proto/Button.js';
import { Circular } from '../proto/Circular.js';
import { Color } from '../proto/Color.js';
import { Fps } from '../proto/Fps.js';
import { Group } from '../proto/Group.js';
import { Joystick } from '../proto/Joystick.js';
import { Knob } from '../proto/Knob.js';
import { List } from '../proto/List.js';
import { Numeric } from '../proto/Numeric.js';
import { Slide } from '../proto/Slide.js';
import { TextInput } from '../proto/TextInput.js';
import { Title } from '../proto/Title.js';

function getType( name, o ) {

        var n = null;

        switch( name ){

            case 'Bool': case 'bool': n = new Bool(o); break;
            case 'Button': case 'button': n = new Button(o); break;
            case 'Circular': case 'circular': n = new Circular(o); break;
            case 'Color': case 'color': n = new Color(o); break;
            case 'Fps': case 'fps': n = new Fps(o); break;
            case 'Group': case 'group': n = new Group(o); break;
            case 'Joystick': case 'joystick': n = new Joystick(o); break;
            case 'Knob': case 'knob': n = new Knob(o); break;
            case 'List': case 'list': n = new List(o); break;
            case 'Numeric':case 'Number': case 'numeric':case 'number': n = new Numeric(o); break;
            case 'Slide': case 'slide': n = new Slide(o); break;
            case 'TextInput':case 'String': case 'textInput':case 'string': n = new TextInput(o); break;
            case 'Title': case 'title': n = new Title(o); break;

        }

        return n;
};

function add (){

    var a = arguments; 

    var type, o, ref = false;

    if( typeof a[0] === 'string' ){ 

        type = a[0];//[0].toUpperCase() + a[0].slice(1);
        o = a[1] || {};

    } else if ( typeof a[0] === 'object' ){ // like dat gui

        ref = true;
        if( a[2] === undefined ) [].push.call(a, {});

        type = autoType.apply( this, a );

        o = a[2];

        o.name = a[1];
        o.value = a[0][a[1]];

    }

    var n = getType( type, o );

    if(n !== null ){
        if( ref ) n.setReferency( a[0], a[1] );
        return n;
    }
    

};

function autoType () {

    var a = arguments;

    var type = 'Slide';

    if(a[2].type) type = a[2].type;

    return type;

};

export { add };

export var REVISION = '1.0';