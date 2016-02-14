
UIL.ColorLuma = function ( hex, lum ) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
    }

    return rgb;

};


UIL.hexToHtml = function(v){ 

    return "#" + ("000000" + v.toString(16)).substr(-6);
    
};

UIL.htmlToHex = function(v){ 

    return v.toUpperCase().replace("#", "0x");

};

UIL.u255 = function(color, i){

    return parseInt(color.substring(i, i + 2), 16) / 255;

};

UIL.u16 = function( color, i ){

    return parseInt(color.substring(i, i + 1), 16) / 15;

};

UIL.unpack = function( color ){

    if (color.length == 7) return [ UIL.u255(color, 1), UIL.u255(color, 3), UIL.u255(color, 5) ];
    else if (color.length == 4) return [ UIL.u16(color,1), UIL.u16(color,2), UIL.u16(color,3) ];

};

UIL.htmlRgb = function( rgb ){
    return 'rgb(' + Math.round(rgb[0] * 255) + ','+ Math.round(rgb[1] * 255) + ','+ Math.round(rgb[2] * 255) + ')'
}

UIL.rgbToHex = function( rgb ){

    return '#' + ( '000000' + ( ( rgb[0] * 255 ) << 16 ^ ( rgb[1] * 255 ) << 8 ^ ( rgb[2] * 255 ) << 0 ).toString( 16 ) ).slice( - 6 );

};

UIL.hueToRgb = function( p, q, t ){

    if ( t < 0 ) t += 1;
    if ( t > 1 ) t -= 1;
    if ( t < 1 / 6 ) return p + ( q - p ) * 6 * t;
    if ( t < 1 / 2 ) return q;
    if ( t < 2 / 3 ) return p + ( q - p ) * 6 * ( 2 / 3 - t );
    return p;

};

UIL.rgbToHsl = function(rgb){

    var r = rgb[0], g = rgb[1], b = rgb[2], min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h = 0, s = 0, l = (min + max) / 2;
    if (l > 0 && l < 1) s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    if (delta > 0) {
        if (max == r && max != g) h += (g - b) / delta;
        if (max == g && max != b) h += (2 + (b - r) / delta);
        if (max == b && max != r) h += (4 + (r - g) / delta);
        h /= 6;
    }
    return [ h, s, l ];

};

UIL.hslToRgb = function( hsl ){

    var p, q, h = hsl[0], s = hsl[1], l = hsl[2];

    if ( s === 0 ) return [ l, l, l ];
    else {
        q = l <= 0.5 ? l * (s + 1) : l + s - ( l * s );
        p = l * 2 - q;
        return [ UIL.hueToRgb(p, q, h + 0.33333), UIL.hueToRgb(p, q, h), UIL.hueToRgb(p, q, h - 0.33333) ];
    }

};