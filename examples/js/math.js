'use strict';

// performance.now

var now;

(function(w){
    var perfNow;
    var perfNowNames = ['now', 'webkitNow', 'msNow', 'mozNow'];
    if(!!w['performance']) for(var i = 0; i < perfNowNames.length; ++i){
        var n = perfNowNames[i];
        if(!!w['performance'][n]){
            perfNow = function(){return w['performance'][n]()};
            break;
        }
    }
    if(!perfNow) perfNow = Date.now;
    now = perfNow;
})(window);

/*
var PI = Math.PI;

//Faster replacement for Math object methods.
Math.round(PI) === PI + (PI < 0 ? -0.5 : +0.5) >> 0;
Math.ceil(PI) === PI + (PI < 0 ? -1 : 0) >> 0;
Math.floor(PI) === PI + (PI < 0 ? -1 : 0) >> 0;

//Conditional operator is faster than Math object methods.
Math.max(a, b) === (a > b) ? a : b;
Math.min(a, b) ===  (a < b) ? a : b;

Math.abs(n) === n = n > 0 ? -n : n;

var array = [1, 5, 3, 2, 4];
//Sort Array in ascending order
array.sort(function (a, b) { return a - b});
//Sort Aarray in descending order
array.sort(function (a, b) { return b - a});
*/
Math.torad = 0.0174532925199432957;
Math.todeg = 57.295779513082320876;
Math.Pi = 3.141592653589793;
Math.TwoPI = 6.283185307179586;
Math.PI90 = 1.570796326794896;
Math.PI45 = 0.7853981633973;
Math.PI270 = 4.712388980384689;
Math.inv255 = 0.003921569;
Math.golden = 10.166407384630519;

Math.int = function(x) { return Math.floor(x); };

//Math.golden = Math.TwoPI * (Math.sqrt(5) + 1) * 0.5;  // golden ratio

// RANDOM FUNCTION

Math.lerp = function ( x, y, t ) { return ( 1 - t ) * x + t * y; };
Math.rand = function ( low, high ) { return low + Math.random() * ( high - low ); };
Math.randInt = function ( low, high ) { return low + Math.floor( Math.random() * ( high - low + 1 ) ); };

Math.seed = function( s ) { return function() { s = Math.sin(s) * 10000; return s - Math.floor(s); }; };
Math.seed1 = Math.seed(32);
Math.seed2 = Math.seed(Math.seed1());
Math.ranSeed = Math.seed(Math.seed2());

//Math.ranSeed = Math.seed( Math.seed( Math.seed( 42 ) ) );
Math.randFix = function ( low, high ) { return low + Math.ranSeed() * ( high - low ); };
Math.randIntFix = function ( low, high ) { return low + Math.floor( Math.ranSeed() * ( high - low + 1 ) ); };

Math.distanceVector = function ( a, b ) { 

    var x = b.x-a.x;
    var y = b.y-a.y;
    var z = b.z-a.z;
    var d = Math.sqrt( x*x + y*y + z*z );
    return d;

};

Math.clamp = function (v, min, max) {
    v = v < min ? min : v;
    v = v > max ? max : v;
    return v;
}

Math.norm = function (v, min, max) {
    //v = v < min ? min : v;
    //v = v > max ? max : v;
    return (v - min) / (max - min);
}

Math.linear = function (a, n0, n1) {
    return ((1.0 - a) * (n0)) + (a * (n1));
},

Math.cubicSCurve = function (a) {
    a = (a);
    return (a * a * (3.0 - 2.0 * a));
},

Math.quinticSCurve = function (a) {
     a = (a);
    var a3 = (a * a * a);
    var a4 = (a3 * a);
    var a5 = (a4 * a);
    return ((6.0 * a5) - (15.0 * a4) + (10.0 * a3));
},

Math.vectorad = function ( r ) {

    var i = r.length;
    while(i--) r[i] *= Math.torad;
    return r;

};

Math.unwrapDeg = function ( r ) {

    r = r % 360;
    if (r > 180) r -= 360;
    if (r < -180) r += 360;
    return r;

};

Math.unwrapRad = function( r ){

    r = r % Math.TwoPI;
    if (r > Math.Pi ) r -= Math.TwoPI;
    if (r < - Math.Pi ) r += Math.TwoPI;
    return r;

};

Math.rot2d = function ( v, d, angle ) {

    v = v || { x:0, y:0 };
    var n = {};
    n.x = d * Math.cos( angle * Math.torad ) + v.x;
    n.y = d * Math.sin( angle * Math.torad ) + v.y;
    n.z = v.z;
    return n;

}

Math.dist2d = function ( v1, v2 ) {

    var dx = v2.x - v1.x;
    var dy = v2.y - v1.y;
    return Math.sqrt( dx * dx + dy * dy );

}

// COLOR FUNCTION

Math.colorDistance = function ( a, b ){

    var xd = a[0] - b[0];
    var yd = a[1] - b[1];
    var zd = a[2] - b[2];
    return Math.sqrt(xd*xd + yd*yd + zd*zd);

};

Math.rgbToHex = function( rgb ){

    return '0x' + ( '000000' + ( ( rgb[0] * 255 ) << 16 ^ ( rgb[1] * 255 ) << 8 ^ ( rgb[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

};

Math.hslToRgb = function (h, s, l){

    var r, g, b;
    h /= 255., s /= 255., l /= 255.;
    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = Math.hue2rgb(p, q, h + 1/3);
        g = Math.hue2rgb(p, q, h);
        b = Math.hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];

};

Math.hue2rgb = function (p, q, t){

    if(t < 0) t += 1;
    if(t > 1) t -= 1;
    if(t < 1/6) return p + (q - p) * 6 * t;
    if(t < 1/2) return q;
    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;

};

Math.rgbToHsl = function (r, g, b){

    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) * 0.5;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.round(h * 255), Math.round(s * 255), Math.round(l * 255)];

};

Math.orbit = function ( horizontal, vertical, radius, origine, revers ) {

    var p = { x:0, y:0, z:0 };
    if( origine === undefined ) origine = { x:0, y:0, z:0 };
    var lat = vertical * Math.torad;
    var lon = horizontal * Math.torad;
    if(revers){
        p.x = radius * Math.cos(lat) * Math.cos(lon);
        p.z = radius * Math.cos(lat) * Math.sin(lon);
        p.y = radius * Math.sin(lat);
    }else{
        p.x = radius * Math.sin(lat) * Math.cos(lon);
        p.z = radius * Math.sin(lat) * Math.sin(lon);
        p.y = radius * Math.cos(lat);
    }

    if( origine !== undefined ){
        p.x += origine.x;
        p.y += origine.y;
        p.z += origine.z;
    }
    
    return p;

}

Math.sphericalToUv = function ( v ) {

    var p = { u:0, v:0 };
    p.u = 0.5 + ( Math.atan2( v.x, v.z ) / Math.TwoPI );
    p.v = 0.5 + ( Math.asin( v.y ) / Math.Pi  );
    return p;

}

Math.spherical = function ( v ) {

    var p = { lat:0, lon:0 };
    var r = Math.sqrt( v.x* v.x + v.y* v.y+ v.z* v.z ); 
    p.lat = Math.asin( v.y / r ) * Math.todeg;
    p.lon = Math.atan2( v.z, v.x ) * Math.todeg;
    return p;

}

// EXTRA NOISE

Math.perlin = null;

Math.noise = function ( v, o ) {

    if( Math.perlin === null ) Math.perlin = new SimplexNoise();

    o = o || {};

    var level = o.level || [ 1, 0.2, 0.05 ];
    var frequency  = o.frequency  || [ 0.016, 0.05, 0.2 ];

    var i, f, c=0, d=0;

    for(i=0; i<level.length; i++){

        f = frequency[i];
        c += level[i] * ( 0.5 + Math.perlin.noise3d( v.x*f, v.y*f, v.z*f ) * 0.5 );
        d += level[i];

    }

    c/=d;

    return c;

}

/*
Math.Kalman = function ( R, Q, A, B, C ) {

    this.R = R===undefined ? 1:R; // noise power desirable
    this.Q = Q===undefined ? 1:Q; // noise power estimated

    this.A = A===undefined ? 1:A;// State vector
    this.C = C===undefined ? 0:B;//Control vector
    this.B = B===undefined ? 1:C;// Measurement vector
    this.cov = NaN;
    this.x = NaN; // estimated signal without noise

}

Math.Kalman.prototype = {

    filter: function(z, u){

        u = u || 0;

        if (isNaN(this.x)) {
          this.x = (1 / this.C) * z;
          this.cov = (1 / this.C) * this.Q * (1 / this.C);
        }
        else {

          // Compute prediction
          const predX = (this.A * this.x) + (this.B * u);
          const predCov = ((this.A * this.cov) * this.A) + this.R;

          // Kalman gain
          const K = predCov * this.C * (1 / ((this.C * predCov * this.C) + this.Q));

          // Correction
          this.x = predX + K * (z - (this.C * predX));
          this.cov = predCov - (K * this.C * predCov);
        }

        return this.x;

    },

    lastMeasurement: function(){
        return this.x;
    },

    setMeasurementNoise: function(noise){
        this.Q = noise;
    },

    setProcessNoise: function(noise){
        this.R = noise;
    },



}*/

/*Math.amp = function (smoothness, levels){
  //if(amp!=null) return amp;
  var divider = 0;
  for(var i = 0; i < levels; i++ ){
    divider += Math.pow(smoothness, i);
  }
  amp = Math.pow( smoothness, levels-1 ) / divider;
  return amp;
}*/

/*Math.spherical = function ( lat, y, lon, radius ) {

    var p = { x:0, y:0, z:0 };
    var phi = lat * Math.torad;
    var theta = lon * Math.torad;
    p.x = (radius+y) * Math.cos(phi) * Math.cos(theta);
    p.y = (radius+y) * Math.sin(phi) * Math.cos(theta);
    p.z = (radius+y) * Math.sin(theta);
    return p;

}*/

// PERLIN for terrain 
/*
var ARRAY8
if(!ARRAY8) ARRAY8 = (typeof Uint8Array !== 'undefined') ? Uint8Array : Array;


function Perlin(random) {
    this.F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    this.G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    if (!random) random = Math.random;
    this.p = new ARRAY8(256);
    this.perm = new ARRAY8(512);
    this.permMod12 = new ARRAY8(512);
    for (var i = 0; i < 256; i++) {
        this.p[i] = random() * 256;
    }
    for (i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
    }
};

Perlin.prototype = {
    grad3: new Float32Array([1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1]),
    noise: function (xin, yin) {
        var permMod12 = this.permMod12, perm = this.perm, grad3 = this.grad3;
        var n0=0, n1=0, n2=0;
        var s = (xin + yin) * this.F2;
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * this.G2;
        var X0 = i - t;
        var Y0 = j - t;
        var x0 = xin - X0;
        var y0 = yin - Y0;
        var i1, j1;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        }
        else {
            i1 = 0;
            j1 = 1;
        }
        var x1 = x0 - i1 + this.G2;
        var y1 = y0 - j1 + this.G2;
        var x2 = x0 - 1.0 + 2.0 * this.G2;
        var y2 = y0 - 1.0 + 2.0 * this.G2;
        var ii = i & 255;
        var jj = j & 255;
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            var gi0 = permMod12[ii + perm[jj]] * 3;
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0);
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
        }
        // return values in the interval [-1,1].
        return 70.0 * (n0 + n1 + n2);
    }
};*/