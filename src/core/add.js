

import { Tools } from './Tools';
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

            case 'Bool': n = new Bool(o); break;
            case 'Button': n = new Button(o); break;
            case 'Circular': n = new Circular(o); break;
            case 'Color': n = new Color(o); break;
            case 'Fps': n = new Fps(o); break;
            case 'Group': n = new Group(o); break;
            case 'Joystick': n = new Joystick(o); break;
            case 'Knob': n = new Knob(o); break;
            case 'List': n = new List(o); break;
            case 'Numeric':case 'Number': n = new Numeric(o); break;
            case 'Slide': n = new Slide(o); break;
            case 'TextInput':case 'String': n = new TextInput(o); break;
            case 'Title': n = new Title(o); break;

        }

        return n;
};

function add (){

    var a = arguments; 

    var type, o, ref = false;

    if( typeof a[0] === 'string' ){ 

        type = a[0][0].toUpperCase() + a[0].slice(1);
        o = a[1] || {};

    } else if ( typeof a[0] === 'object' ){ // like dat gui

        ref = true;
        if( a[2] === undefined ) [].push.call(a, {});
        type = Tools.autoType.apply( Tools, a );
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

export { add };

export var REVISION = '1.0';