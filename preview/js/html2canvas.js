/**
 * @author mrdoob / http://mrdoob.com/
 */

function html2canvas( canvas, element, w, h, notdirect ) {

    var range = document.createRange();

    function getRect( rect ) {

        return {
            left: rect.left - offset.left - 0.5,
            top: rect.top - offset.top - 0.5,
           // left: rect.left - 0.5,
            //top: rect.top - 0.5,
            width: rect.width,
            height: rect.height
        };

    }

    function drawText( style, x, y, string ) {

        context.font = style.fontSize + ' ' + style.fontFamily;
        context.textBaseline = 'top';
        context.fillStyle = style.color;
        context.fillText( string, x, y );

    }

    function drawImg( x, y, string ) {

        //console.log('image')

        var img = new Image;
        img.src = string;
        

       // img.onload = function(){
            context.drawImage( img, x, y );
       // }

        

    }

    function drawBorder( style, which, x, y, width, height ) {

        var borderWidth = style[ which + 'Width' ];
        var borderStyle = style[ which + 'Style' ];
        var borderColor = style[ which + 'Color' ];

        if ( borderWidth !== '0px' && borderStyle !== 'none' ) {

            context.strokeStyle = borderColor;
            context.beginPath();
            context.moveTo( x, y );
            context.lineTo( x + width, y + height );
            context.stroke();

        }

    }

    function drawElement( element, style ) {

        var rect;

        if ( element.nodeType === 3 ) {

            // text

            range.selectNode( element );

            rect = getRect( range.getBoundingClientRect() );

            drawText( style, rect.left, rect.top, element.nodeValue.trim() );

        } else {

            rect = getRect( element.getBoundingClientRect() );
            style = window.getComputedStyle( element );
           // console.log(element.style.backgroundImage)
            if (element.style.backgroundImage.slice(0, 3) === 'url' ) {

                drawImg( rect.left + parseInt( style.paddingLeft ), rect.top + parseInt( style.paddingTop ), element.style.backgroundImage.slice(5, -2) );

            } else {

            ///console.log(element.style.background.slice(4, -1))
            //console.log(element.style.background.slice(0, 3))

            context.fillStyle = style.backgroundColor;
            context.fillRect( rect.left, rect.top, rect.width, rect.height );

            drawBorder( style, 'borderTop', rect.left, rect.top, rect.width, 0 );
            drawBorder( style, 'borderLeft', rect.left, rect.top, 0, rect.height );
            drawBorder( style, 'borderBottom', rect.left, rect.top + rect.height, rect.width, 0 );
            drawBorder( style, 'borderRight', rect.left + rect.width, rect.top, 0, rect.height );

            
                if ( element.type === 'color' || element.type === 'text' ) {

                    drawText( style, rect.left + parseInt( style.paddingLeft ), rect.top + parseInt( style.paddingTop ), element.value );

                }
            }

            

        }

        /*
        // debug
        context.strokeStyle = '#' + Math.random().toString( 16 ).slice( - 3 );
        context.strokeRect( rect.left - 0.5, rect.top - 0.5, rect.width + 1, rect.height + 1 );
        */

        for ( var i = 0; i < element.childNodes.length; i ++ ) {

            drawElement( element.childNodes[ i ], style );

        }

    }

    var offset = element.getBoundingClientRect();

    if(notdirect){
        var cc = document.createElement( 'canvas' );
        cc.width = offset.width;
        cc.height = offset.height;
    }

    

    //var canvas = document.createElement( 'canvas' );

    canvas.width = offset.width;
    canvas.height = offset.height;

   // canvas.width = w;
   // canvas.height = h;

    var context; 
    if(notdirect) context = cc.getContext( '2d'/*, { alpha: false }*/ );
    else  context = canvas.getContext( '2d'/*, { alpha: false }*/ );

    drawElement( element );

    //return canvas;
    if(notdirect) canvas.getContext( '2d').drawImage(cc, 0, 0);

}