/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author lo.th / http://lo-th.github.io/labs/
*    AMMO LAB MAIN
*/

'use strict';

// transphere array for AMMO worker
//var Br, Cr, Jr, Hr, Sr;

// transphere array for CROWD worker
var Ar;

var demos = [ 
    'basic', 'terrain', 'supermaket', 'car', 'collision', 'ragdoll',
    'kinematics', 'multyCars', 'snowboard', 'cloth', 'rope', 'rope2', 'ellipsoid',
    'softmesh', 'softmeshbase', 'pigtest', 'testmesh', 'meshmove',
    'character', 'mecanum', 'joints', 'empty', 'human', 'planetoid', 'point2point', 'drone'
];

demos.sort();

var demo;
var update = function () {};
var postUpdate = function () {};

var demoName = 'basic';

//////////////////////////////

var direct = false;
var isWithCode = false;
var isBuffer = false;

function init(){

    view.init( next );
    user.init();
    //editor.init( launch, isWithCode );
    //ammo.init( ready, direct, isBuffer );
    
   //loop();

};

function next(){

    editor.init( launch, isWithCode );
    ammo.init( ready, direct, isBuffer );
    
   //loop();

};

/*function loop () {

    requestAnimationFrame( loop );
    //view.update();
    //user.update( true );
    update();
    view.render();

};*/

function ready () {

    var hash = location.hash.substr( 1 );
    if(hash !=='') demoName = hash;
    editor.load('demos/' + demoName + '.js');

};

function launch ( name ) {

    var full = true;
    var hash = location.hash.substr( 1 );
    if( hash === name ) full = false;

    location.hash = name;

    ammo.reset( full );
    

    demo = new window['demo'];

    // start Physics engine
    //setTimeout( ammo.start, 10 );
    //ammo.start();

};

function add ( o ) { return view.add( o ); };

function joint ( o ) { o.type = o.type == undefined ? 'joint' : o.type; view.add( o ); };

function character ( o ) { view.character( o ); };

function car ( o ) { view.vehicle( o ); };

function drive ( name ) { view.setDriveCar( name ); };

function follow ( name ) { view.setFollow( name ); };

function substep ( substep ) { ammo.send( 'substep', {substep:substep} ) ; };

function cam ( h,v,d,t ){ view.moveCamera( h, v, d, t || [0,0,0] ); };

function tell ( str ) { editor.tell( str ); };

function load ( name, callback ) { view.load( name, callback ); };

function anchor ( o ) { ammo.send( 'anchor', o ); };

function gravity ( a ) { ammo.send( 'gravity', {g:a} ); };

function water ( o ) { ammo.send( 'gravity', o ); };