///https://wicg.github.io/file-system-access/#api-filesystemfilehandle-getfile


export class Files {

    //-----------------------------
    //  FILE TYPE
    //-----------------------------

    static autoTypes( type ) {

        let t = []

        switch( type ){

            case 'svg': t = [ { description: 'SVG', accept: { 'image/svg+xml': ['.svg'] } } ]; break;
            case 'wav': t = [ { description: 'WAV', accept: { 'audio/wav': ['.wav'] } } ]; break;
            case 'mp3': t = [ { description: 'MP3', accept: { 'audio/mpeg': ['.mp3'] } } ]; break;
            case 'mp4': t = [ { description: 'MP4', accept: { 'video/mp4': ['.mp4'] } } ]; break;
            case 'bin': case 'hex': t = [ { description: 'Binary Files', accept: { 'application/octet-stream': ['.bin', '.hex'] } }, ]; break;
            case 'text': t = [ { description: 'Text Files', accept: { 'text/plain': ['.txt', '.text'], 'text/html': ['.html', '.htm'] } }, ]; break;
            case 'json': t = [ { description: 'JSON Files', accept: { 'application/json': ['.json'] } }, ]; break;
            case 'js': t = [ { description: 'JavaScript Files', accept: { 'text/javascript': ['.js'] } }, ]; break;
            case 'ktx2': t = [ { description: 'ktx2', accept: { 'image/ktx2': ['.ktx2'] } }, ]; break;
            case 'image': t = [ { description: 'Images', accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.hdr', '.exr'] } }, ]; break;
            case 'gif': t = [ { description: 'Images', accept: { 'image/*': ['.gif'] } }, ]; break;
            case 'png': t = [ { description: 'Images', accept: { 'image/*': ['.png'] } }, ]; break;
            case 'exr': t = [ { description: 'Images', accept: { 'image/exr': ['.exr'] } }, ]; break;
            case 'hdr': t = [ { description: 'Images', accept: { 'image/hdr': ['.hdr'] } }, ]; break;
            case 'jpg': t = [ { description: 'Images', accept: { 'image/*': ['.jpg', '.jpeg'] } }, ]; break;
            case 'icon': t = [ { description: 'Icons', accept: { 'image/x-ico': ['.ico'] } }, ]; break;
            case 'lut': t = [ { description: 'Lut', accept: { 'text/plain': ['.cube', '.3dl'] } }, ]; break;

        }

        return t

    }


    //-----------------------------
    //  LOAD
    //-----------------------------

    //• Avec await (moderne) : const img = await Files.load({ type: 'image' });
    //• Avec callback (existant) : Files.load({ type: 'image', callback: (img, name) => ... });


    /*
    const res = await Files.load({ type: 'image' });
    if ( res ) {
        const { data, name, type, dim, bytes } = res;
        console.log( name, dim, bytes );
    }
    */

    static async load( o = {} ) {

        if ( typeof window.showOpenFilePicker !== 'function' ) {
            window.showOpenFilePicker = Files.showOpenFilePickerPolyfill;
        }

        try {

            let type = o.type || '';

            const options = {
                excludeAcceptAllOption: Boolean( type ),
                multiple: false,
            };

            options.types = Files.autoTypes( type );

            const [ fileHandle ] = await window.showOpenFilePicker( options );
            const file = await fileHandle.getFile();

            if ( !file ) return null;

            const fname = file.name;
            const ftype = fname.substring( fname.lastIndexOf('.') + 1 ).toLowerCase();
            const bytes = file.size;

            const dataUrl = [ 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mp3' ];
            const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'glb', 'gltf', 'exr', 'ktx2', 'hdr', 'bin' ];

            return await new Promise( ( resolve, reject ) => {

                const reader = new FileReader();

                const cleanup = () => {
                    reader.removeEventListener( 'load', onLoad );
                    reader.removeEventListener( 'error', onError );
                };

                const onError = ( err ) => {
                    cleanup();
                    reject( err );
                };

                const onLoad = ( e ) => {
                    const content = e.target.result;
                    cleanup();

                    if ( type === 'image' && typeof content === 'string' ) {
                        const img = new Image();
                        img.onload = () => {
                            const dim = [ img.width, img.height ];
                            if ( o.callback ) o.callback( img, fname, ftype, dim );
                            resolve( { data: img, name: fname, type: ftype, bytes, dim } );
                        };
                        img.onerror = reject;
                        img.src = content;
                    } else if ( type === 'json' ) {
                        const json = JSON.parse( content );
                        if ( o.callback ) o.callback( json, fname, ftype );
                        resolve( { data: json, name: fname, type: ftype, bytes } );
                    } else {
                        if ( o.callback ) o.callback( content, fname, ftype );
                        resolve( { data: content, name: fname, type: ftype, bytes } );
                    }
                };

                reader.addEventListener( 'load', onLoad );
                reader.addEventListener( 'error', onError );

                if ( o.forceType === 'ArrayBuffer' ) {
                    reader.readAsArrayBuffer( file );
                } else if ( dataUrl.includes( ftype ) ) {
                    reader.readAsDataURL( file );
                } else if ( dataBuf.includes( ftype ) ) {
                    reader.readAsArrayBuffer( file );
                } else {
                    reader.readAsText( file );
                }

            });

        } catch ( e ) {

            console.log( e );
            if ( o.always && o.callback ) o.callback( null );
            return null;

        }

    }



	/*static async load( o = {} ) {

        if (typeof window.showOpenFilePicker !== 'function') {
            window.showOpenFilePicker = Files.showOpenFilePickerPolyfill
        }

        try {

        	let type = o.type || ''

            const options = {
                excludeAcceptAllOption: type ? true : false,
                multiple: false,
                //startIn:'./assets'
            };

            options.types = Files.autoTypes( type )

            // create a new handle
            const handle = await window.showOpenFilePicker( options )
            const file = await handle[0].getFile()
            //let content = await file.text()

            if( !file ) return null

            let fname = file.name;
            let ftype = fname.substring( fname.lastIndexOf('.') + 1 ).toLowerCase();
            //let ftype = fname.substring( fname.lastIndexOf('.')+1, fname.length );
            let realType = ''

            const dataUrl = [ 'png', 'jpg', 'jpeg', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mp3' ];
            const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'glb', 'gltf', 'exr', 'ktx2', 'hdr', 'bin' ];

            //const dataUrl = [ 'png', 'jpg', 'jpeg', 'mp4', 'webm', 'ogg', 'mp3' ];
            //const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'BVH', 'glb', 'gltf', 'exr', 'ktx2', 'hdr' ];
            const reader = new FileReader();

            const cleanupReader = () => reader.removeEventListener('load', onLoad);

            if(o.forceType === 'ArrayBuffer') {
                reader.readAsArrayBuffer( file );
                //type = ''
            } else {
                if( dataUrl.indexOf( ftype ) !== -1 ) reader.readAsDataURL( file )
                else if( dataBuf.indexOf( ftype ) !== -1 ) reader.readAsArrayBuffer( file )
                else reader.readAsText( file )
            }

            
            const onLoad = (e) => {

                let content = e.target.result

                cleanupReader();

                switch(type){
                    case 'image':
                        let img = new Image();
                        img.onload = function() {
                            img.width = img.width;
                            img.height = img.height;
                            if( o.callback ) o.callback( img, fname, ftype, [img.width, img.height] )
                        }
                        img.src = content
                    break;
                    case 'json':
                        if( o.callback ) o.callback( JSON.parse( content ), fname, ftype )
                    break;
                    default:
                        if( o.callback ) o.callback( content, fname, ftype );
                    break;
                }

            }

            reader.addEventListener('load', onLoad);

        } catch(e) {

            console.log(e)
            if( o.always && o.callback ) o.callback( null )

        }

    }*/

	static showOpenFilePickerPolyfill( options ) {

        return new Promise((resolve, reject) => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = options.multiple;
            input.accept = options.types
                .map((type) => type.accept)
                .flatMap((inst) => Object.keys(inst).flatMap((key) => inst[key]))
                .join(",");

            const cleanup = () => {
                input.removeEventListener("change", onChange);
                input.removeEventListener( "cancel", onCancel );
                if (input.parentNode) input.parentNode.removeChild(input);
            };

            const onCancel = () => {
                cleanup();
                reject( new Error('Cancelled') );
            };

            const onChange = (e) => {
                resolve(
                    [...input.files].map((file) => ({
                        getFile: async () => file
                    }))
                );
                cleanup(); // Nettoyage immédiat
            };

            input.addEventListener( "change", onChange );
            input.addEventListener( "cancel", onCancel );
            input.click();

        })
    }


    //-----------------------------
    //  SAVE
    //-----------------------------

    static async save( o = {} ) {

        let usePoly = false;

        if (typeof window.showSaveFilePicker !== 'function') {
            window.showSaveFilePicker = Files.showSaveFilePickerPolyfill
            usePoly = true;
        }

        try {

            let type = o.type || ''

            const options = {
                suggestedName: o.name || 'hello',
                data: o.data || ''
            };

            options.types = Files.autoTypes( type )

            if ( options.types.length > 0 ) {
                options.finalType = Object.keys( options.types[0].accept )[0];
                const ext = options.types[0].accept[ options.finalType ][0];
                if ( !options.suggestedName.endsWith( ext ) ) options.suggestedName += ext;
            } else {
                options.finalType = 'text/plain';
            }
            //options.finalType = Object.keys( options.types[0].accept )[0]
            //options.suggestedName += options.types[0].accept[options.finalType][0]


            // create a new handle
            const handle = await window.showSaveFilePicker( options );

            if( usePoly ) return

            // create a FileSystemWritableFileStream to write to
            const file = await handle.createWritable();

            let blob = new Blob([ options.data ], { type: options.finalType });

            // write our file
            await file.write(blob);

            // close the file and write the contents to disk.
            await file.close();

        } catch(e) {

            console.log(e);

        }

    }

    static showSaveFilePickerPolyfill( options ) {

        return new Promise((resolve) => {
            const a = document.createElement("a");
            a.download = options.suggestedName || "my-file.txt"
            let blob = new Blob([ options.data ], { type:options.finalType });
            a.href = URL.createObjectURL( blob )

            const revoke = () => URL.revokeObjectURL(a.href);

            a.addEventListener("click", () => {
                resolve(
                    setTimeout(() => {
                        revoke();
                        if (a.parentNode) a.parentNode.removeChild(a);
                    }, 1000)
                );
            });
            a.click();

            /*a.addEventListener("click", () => {
                resolve(
                    setTimeout( () => URL.revokeObjectURL(a.href), 1000 )
                )
            })
            a.click()*/
        })
    }


    //-----------------------------
    //  FOLDER not possible in poly
    //-----------------------------

    static async getFolder() {

        try {
    
            const handle = await window.showDirectoryPicker();
            const files = [];
            for await (const entry of handle.values()) {
                if ( entry.kind === 'file' ) {
                    const file = await entry.getFile();
                    files.push( file );
                }
            }

            console.log(files)
            return files;

        } catch(e) {

            console.log(e);

        }
    
    }








    

}