export const KtxEditor = {

    init:loadBasisModule,
  
}


const isWasmThreadingSupported = () => {

    try{
        if (typeof WebAssembly === "object" && typeof WebAssembly.Memory === "function"){
            const testMemory = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
            return testMemory instanceof WebAssembly.Memory;
        }
        return false;
    } catch (e) {
        return false;
    }
}

const loadBasisModule = async () => {
   
    // Safari 26.0-26.2 has a WebKit heap-grow bug that crashes multithreaded encoding.
    // Show a persistent warning; getNumWorkerThreads() forces single-threaded for both
    // encode paths when this is detected.
    /*if (isBuggySafari()){

        const banner = document.getElementById('safari-bug-banner');
        if (banner) banner.style.display = 'block';
    
    }*/

    // Determine if WASM threading and WASM64 are available
    const threadingSupported = window.wasmFeatureDetect ? await wasmFeatureDetect.threads() : isWasmThreadingSupported();
    const wasm64Supported = window.wasmFeatureDetect ? await wasmFeatureDetect.memory64() : false;

    window.isThreaded = threadingSupported; // Set global variable to indicate threading support
    window.wasm64 = wasm64Supported;

    // Select WASM module
    const scriptSrc = (wasm64Supported && threadingSupported) ? "./basis_encoder_threads_wasm64.js" :
        (threadingSupported ? "./basis_encoder_threads.js" : "./basis_encoder.js");

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.onload = () => {
        BASIS({
            onRuntimeInitialized: () => {

                console.warn('isThreaded: ' + window.isThreaded);
                console.warn('isWASM64: ' + window.wasm64);

                globalInit();

                const threadingIndicator = document.getElementById("threading-indicator");

                if (!threadingSupported) {
                      threadingIndicator.style.color = "red";
                      threadingIndicator.innerText = "Multithreading not supported! Running in non-threaded mode.";

                      const threadingCheckbox = document.getElementById("multithreaded_encoding");
                      threadingCheckbox.checked = false;
                }
                else
                {
                  threadingIndicator.innerText = "Multithreading is supported.";
                }

                if (!wasm64Supported)
                {
                    threadingIndicator.innerText += " WASM64 is NOT supported. Without WASM64 the maximum image size is limited (to avoid running out of memory).";
                    // Safari has no WASM64 support yet -- point users to a browser that does.
                    if (isSafari())
                        threadingIndicator.innerText += " For WASM64 support, use Chrome or Firefox.";
                }
                else
                    threadingIndicator.innerText += " Using WASM64.";

                if (!threadingSupported) {
                    const slider = document.getElementById("xuastc_ldr_effort_level_slider");
                    const label  = document.getElementById("xuastc_ldr_effort_level_value");

                    if (slider && label) {
                        slider.value = 0;
                        label.textContent = "0";
                    }
                }
            }

        }).then(module => { window.Module = module;

          if (module.initializeBasis)
          {
             module.initializeBasis();
             console.log("module.initializeBasis() called successfully.");
          }
          else {
             console.error("module.initializeBasis() is not available on the Module object.");
          }

          }

        );
    };

    script.onerror = () => {
        console.error("Failed to load the Basis module.");
        updateErrorLine("Failed to load Basis module. Check console for details.");
    };

    document.head.appendChild(script);
}