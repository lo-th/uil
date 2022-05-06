///https://wicg.github.io/file-system-access/#api-filesystemfilehandle-getfile


export class Files {

    //-----------------------------
    //  FILE TYPE
    //-----------------------------

    static autoTypes( type ) {

        let t = []

        switch( type ){
            case 'svg':
            t = [ { accept: { 'image/svg+xml': '.svg'} }, ]
            break;
            case 'wav':
            t = [ { accept: { 'audio/wav': '.wav'} }, ]
            break;
            case 'mp3':
            t = [ { accept: { 'audio/mpeg': '.mp3'} }, ]
            break;
            case 'mp4':
            t = [ { accept: { 'video/mp4': '.mp4'} }, ]
            break;
            case 'bin':case 'hex':
            t = [ { description: 'Binary Files', accept: { 'application/octet-stream': ['.bin', '.hex'] } }, ]
            break;
            case 'text':
            t = [ { description: 'Text Files', accept: { 'text/plain': ['.txt', '.text'], 'text/html': ['.html', '.htm'] } }, ]
            break;
            case 'json':
            t = [ { description: 'JSON Files', accept: { 'application/json': ['.json'] } }, ]//text/plain
            break;
            case 'js':
            t = [ { description: 'JavaScript Files', accept: { 'text/javascript': ['.js'] } }, ]
            break;
            case 'image':
            t = [ { description: 'Images', accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg'] } }, ]
            break;

        }

        return t

    }


    //-----------------------------
    //  LOAD
    //-----------------------------

	static async load( o = {} ) {

        if (typeof window.showOpenFilePicker !== 'function') {
            window.showOpenFilePicker = this.showOpenFilePickerPolyfill
        }

        try {

        	let type = o.type || ''

            const options = {
                excludeAcceptAllOption: type ? true : false,
                multiple: false,
                //startIn:'./assets'
            };

            options.types = this.autoTypes( type )

            // create a new handle
            const handle = await window.showOpenFilePicker( options )
            const file = await handle[0].getFile()
            //let content = await file.text()

            if( !file ) return null

            let fname = file.name;
            let ftype = fname.substring( fname.lastIndexOf('.')+1, fname.length );

            const dataUrl = [ 'png', 'jpg', 'jpeg', 'mp4', 'webm', 'ogg', 'mp3' ];
            const dataBuf = [ 'sea', 'z', 'hex', 'bvh', 'BVH', 'glb', 'gltf' ];
            const reader = new FileReader();

            if( dataUrl.indexOf( ftype ) !== -1 ) reader.readAsDataURL( file )
            else if( dataBuf.indexOf( ftype ) !== -1 ) reader.readAsArrayBuffer( file )
            else reader.readAsText( file )

            reader.onload = function(e) {

                let content = e.target.result

                switch(type){
                    case 'image':
                        let img = new Image;
                        img.onload = function() {
                            if( o.callback ) o.callback( img, fname )
                        }
                        img.src = content
                    break;
                    case 'json':
                        if( o.callback ) o.callback( JSON.parse( content ), fname )
                    break;
                    default:
                        if( o.callback ) o.callback( content, fname )
                    break;
                }

            }

        } catch(e) {

            console.log(e)
            if( o.callback ) o.callback( null )

        }

    }

	static showOpenFilePickerPolyfill( options ) {
        return new Promise((resolve) => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = options.multiple;
            input.accept = options.types
                .map((type) => type.accept)
                .flatMap((inst) => Object.keys(inst).flatMap((key) => inst[key]))
                .join(",");

            input.addEventListener("change", () => {
                resolve(
                    [...input.files].map((file) => {
                        return {
                            getFile: async () =>
                                new Promise((resolve) => {
                                    resolve(file);
                                }),
                        };
                    })
                );
            });

            input.click();
        })
    }


    //-----------------------------
    //  SAVE
    //-----------------------------

    static async save( o = {} ) {

        this.usePoly = false;

        if (typeof window.showSaveFilePicker !== 'function') {
            window.showSaveFilePicker = this.showSaveFilePickerPolyfill
            this.usePoly = true;
        }

        try {

            let type = o.type || ''

            const options = {
                suggestedName: o.name || 'hello',
                data: o.data || ''
            };


            options.types = this.autoTypes( type )
            options.finalType = Object.keys(options.types[0].accept )[0]
            options.suggestedName += options.types[0].accept[options.finalType][0]


            // create a new handle
            const handle = await window.showSaveFilePicker( options );

            if( this.usePoly ) return

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

            a.addEventListener("click", () => {
                resolve(
                    setTimeout( () => URL.revokeObjectURL(a.href), 1000 )
                )
            })
            a.click()
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
                const file = await entry.getFile();
                files.push(file);
            }

            console.log(files)
            return files;

        } catch(e) {

            console.log(e);

        }
    
    }








    

}