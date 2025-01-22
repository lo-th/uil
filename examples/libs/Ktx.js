export const Ktx = {

   //ktx2Loaded:dataLoaded,
   dataLoaded:imageFileDataLoaded,
   runEncode:runEncode,

   getBlob:getBlob,

   updateScale:updateScale,
   linearToSRGB:linearToSRGB,

   alphaBlend:alphaBlend,
   viewRGB:viewRGB,
   viewAlpha:viewAlpha,

   enableAllFormats:enableAllFormats,
   checkForGPUFormatSupport:checkForGPUFormatSupport,
  
}

let tmpData = null;
let tmpName = '';
let tmpExtension = '';

function runEncode() {
   logClear();
   imageFileDataLoaded();
}

function getBlob() {

   if (!encodedKTX2File) return null
   if (!encodedKTX2File.length) return null
   return new Blob([encodedKTX2File]);
   
}

const MAX_WORKER_THREADS = 18;

function log(s) {
   console.log(s)/*
   var div = document.createElement('div');
   div.innerHTML = s;
   document.getElementById('logger').appendChild(div);*/
}

function logClear() {
   console.clear()
   //elem('logger').innerHTML = '';
}

function logTime(desc, t) {
   log(t + 'ms ' + desc);
}

function isDef(v) {
   return typeof v != 'undefined';
}

/*function elem(id) {
   return setting[id];//document.getElementById(id);
}*/

let formatTable = function (rows) {
   var colLengths = [];

   for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      for (var j = 0; j < row.length; j++) {
         if (colLengths.length <= j) colLengths.push(0);
         if (colLengths[j] < row[j].length) colLengths[j] = row[j].length;
      }
   }

   function formatRow(row) {
      var parts = [];
      for (var i = 0; i < colLengths.length; i++) {
         var s = row.length > i ? row[i] : '';
         var padding = (new Array(1 + colLengths[i] - s.length)).join(' ');
         if (s && s[0] >= '0' && s[0] <= '9') {
            // Right-align numbers.
            parts.push(padding + s);
         } else {
            parts.push(s + padding);
         }
      }
      return parts.join(' | ');
   }

   var width = 0;
   for (var i = 0; i < colLengths.length; i++) {
      width += colLengths[i];
      // Add another 3 for the separator.
      if (i != 0) width += 3;
   }

   var lines = [];
   lines.push(formatRow(rows[0]));
   lines.push((new Array(width + 1)).join('-'));
   for (var i = 1; i < rows.length; i++) {
      lines.push(formatRow(rows[i]));
   }

   return lines.join('\n');
};

/*function loadArrayBuffer(uri, callback, errorCallback) {
   log('Loading ' + uri + '...');

   var xhr = new XMLHttpRequest();
   xhr.responseType = "arraybuffer";
   xhr.open('GET', uri, true);

   xhr.onreadystatechange = function (e) {
      if (xhr.readyState == 4) { // Request is done
         if (xhr.status == 200) {
            // Success, call the callback with the response
            callback(xhr.response, uri);
         } else {
            // Error, call the errorCallback with the status
            errorCallback('Failed to load file. Status: ' + xhr.status + ' - ' + xhr.statusText);
         }
      }
   };

   xhr.onerror = function (e) {
      // Network error or request couldn't be made
      errorCallback('Network error or request failed.');
   };

   xhr.send(null);
}*/

// ASTC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_astc/
const COMPRESSED_RGBA_ASTC_4x4_KHR = 0x93B0;
const COMPRESSED_RGBA_ASTC_6x6_KHR = 0x93B4;

// DXT formats, from:
// http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
const COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;
const COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;
const COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;
const COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;

// BC6H/BC7 formats, from:
// https://www.khronos.org/registry/webgl/extensions/EXT_texture_compression_bptc/
const COMPRESSED_RGBA_BPTC_UNORM = 0x8E8C;
const COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT = 0x8E8F;

// ETC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_etc1/
const COMPRESSED_RGB_ETC1_WEBGL = 0x8D64;

// PVRTC format, from:
// https://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_pvrtc/
const COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 0x8C00;
const COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 0x8C02;

// Half float RGBA, from:
// https://registry.khronos.org/webgl/extensions/OES_texture_half_float/
const HALF_FLOAT_OES = 0x8D61;

// Same as the Module.transcoder_texture_format enum
const BASIS_FORMAT = {
   cTFETC1: 0,
   cTFETC2: 1,
   cTFBC1: 2,
   cTFBC3: 3,
   cTFBC4: 4,
   cTFBC5: 5,
   cTFBC7: 6,
   cTFPVRTC1_4_RGB: 8,
   cTFPVRTC1_4_RGBA: 9,
   cTFASTC_4x4: 10,
   cTFATC_RGB: 11,
   cTFATC_RGBA_INTERPOLATED_ALPHA: 12,
   cTFRGBA32: 13,
   cTFRGB565: 14,
   cTFBGR565: 15,
   cTFRGBA4444: 16,
   cTFFXT1_RGB: 17,
   cTFPVRTC2_4_RGB: 18,
   cTFPVRTC2_4_RGBA: 19,
   cTFETC2_EAC_R11: 20,
   cTFETC2_EAC_RG11: 21,
   cTFBC6H: 22,
   cTFASTC_HDR_4x4_RGBA: 23,
   cTFRGB_HALF: 24,
   cTFRGBA_HALF: 25,
   cTFRGB_9E5: 26,
   cTFASTC_HDR_6x6_RGBA: 27
};

const BASIS_FORMAT_NAMES = {};
for (var name in BASIS_FORMAT) {
   BASIS_FORMAT_NAMES[BASIS_FORMAT[name]] = name;
}

const DXT_FORMAT_MAP = {};
DXT_FORMAT_MAP[BASIS_FORMAT.cTFBC1] = COMPRESSED_RGB_S3TC_DXT1_EXT;
DXT_FORMAT_MAP[BASIS_FORMAT.cTFBC3] = COMPRESSED_RGBA_S3TC_DXT5_EXT;
DXT_FORMAT_MAP[BASIS_FORMAT.cTFBC7] = COMPRESSED_RGBA_BPTC_UNORM;

let astcSupported = false, etcSupported = false, dxtSupported = false, bc7Supported = false, bc6hSupported = false, astcHDRSupported = false, 
   rgbaHalfSupported = false, halfFloatWebGLFormat = 0, pvrtcSupported = false;

let astcDisabled = false, etcDisabled = false, dxtDisabled = false, bc7Disabled = false, bc6hDisabled = false, astcHDRDisabled = false, rgbaHalfDisabled = false, pvrtcDisabled = false;

let drawMode = 0;
let drawScale = 1.0;
let ldrHDRUpconversionScale = 1.0;
let linearToSRGBFlag = false;

let tex, width, height, is_hdr, layers, levels, faces, has_alpha;
let alignedWidth, alignedHeight, format, displayWidth, displayHeight;

let curLoadedImageData = null, curLoadedImageURI = null;
let curLoadedKTX2Data = null, curLoadedKTX2URI = null;

function redraw() {

   if (!width) return;
   console.log('redraw')
   renderer.drawTexture(tex, displayWidth, displayHeight, drawMode, drawScale * ldrHDRUpconversionScale, linearToSRGBFlag);

}

function dumpKTX2FileDesc(ktx2File) {
   log('------');

   log('Width: ' + ktx2File.getWidth());
   log('Height: ' + ktx2File.getHeight());
   log('BasisTexFormat: ' + ktx2File.getBasisTexFormat());
   log('IsLDR: ' + ktx2File.isLDR());
   log('IsHDR: ' + ktx2File.isHDR());
   log('IsHDR4x4: ' + ktx2File.isHDR4x4());
   log('IsHDR6x6: ' + ktx2File.isHDR6x6());
   log('isUASTC: ' + ktx2File.isUASTC());
   log('isETC1S: ' + ktx2File.isETC1S());
   log('Faces: ' + ktx2File.getFaces());
   log('Layers: ' + ktx2File.getLayers());
   log('Levels: ' + ktx2File.getLevels());
   log('BlockWidth: ' + ktx2File.getBlockWidth());
   log('BlockHeight: ' + ktx2File.getBlockHeight());
   log('Has alpha: ' + ktx2File.getHasAlpha());
   log('Total Keys: ' + ktx2File.getTotalKeys());
   log('DFD Size: ' + ktx2File.getDFDSize());
   log('DFD Color Model: ' + ktx2File.getDFDColorModel());
   log('DFD Color Primaries: ' + ktx2File.getDFDColorPrimaries());
   log('DFD Transfer Function: ' + ktx2File.getDFDTransferFunc());
   log('DFD Flags: ' + ktx2File.getDFDFlags());
   log('DFD Total Samples: ' + ktx2File.getDFDTotalSamples());
   log('DFD Channel0: ' + ktx2File.getDFDChannelID0());
   log('DFD Channel1: ' + ktx2File.getDFDChannelID1());
   log('Is Video: ' + ktx2File.isVideo());

   var dfdSize = ktx2File.getDFDSize();
   var dvdData = new Uint8Array(dfdSize);
   ktx2File.getDFD(dvdData);

   log('DFD bytes:' + dvdData.toString());
   log('--');

   log('--');
   log('Key values:');
   var key_index;
   for (key_index = 0; key_index < ktx2File.getTotalKeys(); key_index++) {
      var key_name = ktx2File.getKey(key_index);
      log('Key ' + key_index + ': "' + key_name + '"');

      var valSize = ktx2File.getKeyValueSize(key_name);

      if (valSize != 0) {
         var val_data = new Uint8Array(valSize);
         var status = ktx2File.getKeyValue(key_name, val_data);
         if (!status)
            log('getKeyValue() failed');
         else {
            log('value size: ' + val_data.length);
            var i, str = "";

            for (i = 0; i < val_data.length; i++) {
               var c = val_data[i];
               str = str + String.fromCharCode(c);
            }

            log(str);
         }

      }
      else
         log('<empty value>');
   }

   log('--');
   log('Image level information:');
   var level_index;
   
   var total_texels = 0;
   
   for (level_index = 0; level_index < ktx2File.getLevels(); level_index++) {
      var layer_index;
      for (layer_index = 0; layer_index < Math.max(1, ktx2File.getLayers()); layer_index++) {
         var face_index;
         for (face_index = 0; face_index < ktx2File.getFaces(); face_index++) {
            var imageLevelInfo = ktx2File.getImageLevelInfo(level_index, layer_index, face_index);

            log('level: ' + level_index + ' layer: ' + layer_index + ' face: ' + face_index);

            log('orig_width: ' + imageLevelInfo.origWidth);
            log('orig_height: ' + imageLevelInfo.origHeight);
            log('width: ' + imageLevelInfo.width);
            log('height: ' + imageLevelInfo.height);
            log('numBlocksX: ' + imageLevelInfo.numBlocksX);
            log('numBlocksY: ' + imageLevelInfo.numBlocksY);
            log('blockWidth: ' + imageLevelInfo.blockWidth);
            log('blockHeight: ' + imageLevelInfo.blockHeight);
            log('totalBlocks: ' + imageLevelInfo.totalBlocks);
            log('alphaFlag: ' + imageLevelInfo.alphaFlag);
            log('iframeFlag: ' + imageLevelInfo.iframeFlag);
            if (ktx2File.isETC1S())
               log('ETC1S image desc image flags: ' + ktx2File.getETC1SImageDescImageFlags(level_index, layer_index, face_index));

            log('--');
            
            total_texels += imageLevelInfo.origWidth * imageLevelInfo.origHeight;
         }
      }
   }
   log('--');
   log('KTX2 header:');
   var hdr = ktx2File.getHeader();

   log('vkFormat: ' + hdr.vkFormat);
   log('typeSize: ' + hdr.typeSize);
   log('pixelWidth: ' + hdr.pixelWidth);
   log('pixelHeight: ' + hdr.pixelHeight);
   log('pixelDepth: ' + hdr.pixelDepth);
   log('layerCount: ' + hdr.layerCount);
   log('faceCount: ' + hdr.faceCount);
   log('levelCount: ' + hdr.levelCount);
   log('superCompressionScheme: ' + hdr.supercompressionScheme);
   log('dfdByteOffset: ' + hdr.dfdByteOffset);
   log('dfdByteLength: ' + hdr.dfdByteLength);
   log('kvdByteOffset: ' + hdr.kvdByteOffset);
   log('kvdByteLength: ' + hdr.kvdByteLength);
   log('sgdByteOffset: ' + hdr.sgdByteOffset);
   log('sgdByteLength: ' + hdr.sgdByteLength);

   log('------');
   
   return total_texels;
}
      
function dataLoaded(data, uri) {

   updateErrorLine("");

   log('Done loading .KTX2 file, decoded header:');

   const { KTX2File, initializeBasis, encodeBasisTexture } = Module;
            
   resetDrawSettings();

   initializeBasis();

   const startTime = performance.now();

   const ktx2File = new KTX2File(new Uint8Array(data));

   if (!ktx2File.isValid()) {
      updateErrorLine('Invalid or unsupported .ktx2 file');
      console.warn('Invalid or unsupported .ktx2 file');
      ktx2File.close();
      ktx2File.delete();
      return;
   }

   width = ktx2File.getWidth();
   height = ktx2File.getHeight();
   var basisTexFormat = ktx2File.getBasisTexFormat();
   var is_uastc = ktx2File.isUASTC();
   is_hdr = ktx2File.isHDR();
   layers = ktx2File.getLayers();
   levels = ktx2File.getLevels();
   faces = ktx2File.getFaces();
   has_alpha = ktx2File.getHasAlpha();
   
   // If a HDR KTX2 file was upconverted from LDR/SDR content by us, it'll have a key indicating the Nit scale that was appplied.
   // We can use that to make viewing the file work out of the box.
   var ldrHDRUpconversionNitMultiplier = ktx2File.getLDRHDRUpconversionNitMultiplier();
            
   if (ldrHDRUpconversionNitMultiplier > 0.0)
      ldrHDRUpconversionScale = 1.0 / ldrHDRUpconversionNitMultiplier;
   else
      ldrHDRUpconversionScale = 1.0;
      
   var srcBlockWidth = ktx2File.getBlockWidth();
   var srcBlockHeight = ktx2File.getBlockHeight();
   
   var dstBlockWidth = 4;
   var dstBlockHeight = 4;

   // To transcode to PVRTC1, the texture MUST be square and the dimensions must be a power of 2.
   var is_square_pow2 = (width == height) && ((width & (width - 1)) == 0);
   
   if ((!is_hdr) && (!is_square_pow2))
   {
      if ((pvrtcSupported) && (!pvrtcDisabled))
      {
         updateErrorLine("Note: PVRTC is available but the texture's dimensions are not square/power of 2.");
         log("Note: PVRTC is available but the texture's dimensions are not square/power of 2.");
      }
   }

   if (!width || !height || !levels) {
      updateErrorLine('Invalid .ktx2 file');
      console.warn('Invalid .ktx2 file');
      ktx2File.close();
      ktx2File.delete();
      return;
   }

   // Decide which texture format to transcode to.
   // Note: If the file is UASTC LDR, the preferred formats are ASTC/BC7. For UASTC HDR, ASTC HDR/BC6H.
   // If the file is ETC1S and doesn't have alpha, the preferred formats are ETC1 and BC1. For alpha, the preferred formats are ETC2, BC3 or BC7.

   var formatString = 'UNKNOWN';
   if (is_hdr) {
      if ((bc6hSupported) && (!bc6hDisabled)) {
         formatString = 'BC6H';
         format = BASIS_FORMAT.cTFBC6H;
      }
      else if ((astcHDRSupported) && (!astcHDRDisabled)) {
                        
         if (basisTexFormat == Module.basis_tex_format.cUASTC_HDR_4x4.value)
         {
            formatString = 'ASTC HDR 4x4';
            
            format = BASIS_FORMAT.cTFASTC_HDR_4x4_RGBA;
         }
         else
         {
            formatString = 'ASTC HDR 6x6';
            
            format = BASIS_FORMAT.cTFASTC_HDR_6x6_RGBA;
            
            dstBlockWidth = 6;
            dstBlockHeight = 6;
         }
      }
      else if ((rgbaHalfSupported) && (!rgbaHalfDisabled)) {
         formatString = 'RGBA_HALF';
         format = BASIS_FORMAT.cTFRGBA_HALF;
      }
      else {
         formatString = '32-bit RGBA';
         format = BASIS_FORMAT.cTFRGBA_HALF;

        log('Warning: Falling back to decoding texture to uncompressed 32-bit RGBA');
      }
   }
   else if ((astcSupported) && (!astcDisabled)) {
      formatString = 'ASTC';
      format = BASIS_FORMAT.cTFASTC_4x4;
   }
   else if ((bc7Supported) && (!bc7Disabled)) { 
      formatString = 'BC7';
      format = BASIS_FORMAT.cTFBC7;
   }
   else if ((dxtSupported) && (!dxtDisabled)) {
      if (has_alpha) {
         formatString = 'BC3';
         format = BASIS_FORMAT.cTFBC3;
      }
      else {
         formatString = 'BC1';
         format = BASIS_FORMAT.cTFBC1;
      }
   }
   else if ((pvrtcSupported) && (!pvrtcDisabled) && (is_square_pow2)) {
      if (has_alpha) {
         formatString = 'PVRTC1_RGBA';
         format = BASIS_FORMAT.cTFPVRTC1_4_RGBA;
      }
      else {
         formatString = 'PVRTC1_RGB';
         format = BASIS_FORMAT.cTFPVRTC1_4_RGB;
      }
   }
   else if ((etcSupported) && (!etcDisabled)) {
      formatString = 'ETC1';
      format = BASIS_FORMAT.cTFETC1;
   }
   else {
      formatString = 'RGB565';
      format = BASIS_FORMAT.cTFRGB565;
      log('Warning: Falling back to decoding texture data to uncompressed 16-bit 565');
   }
   
   var descString = formatString;
   if (is_hdr)
   {
      if (basisTexFormat == Module.basis_tex_format.cUASTC_HDR_4x4.value)         
         descString += ' from UASTC HDR 4x4';
      else if (basisTexFormat == Module.basis_tex_format.cASTC_HDR_6x6.value) 
         descString += ' from ASTC HDR 6x6';
      else
         descString += ' from ASTC HDR 6x6 Intermediate';
   }
   else if (is_uastc)
      descString += ' from UASTC LDR 4x4';
   else
      descString += ' from ETC1S';
      
   var total_texels = dumpKTX2FileDesc(ktx2File);
   var bpp = (data.byteLength * 8.0) / total_texels;
   descString += ` (${bpp.toFixed(3)} bits/pixel).`;

   //elem('format').innerText = descString;
   //elem('format') = descString;
   setting.format = descString
            
   if (!ktx2File.startTranscoding()) {
      updateErrorLine('startTranscoding failed');
      log('startTranscoding failed');
      console.warn('startTranscoding failed');
      basisFile.close();
      basisFile.delete();
      return;
   }
            
   const dstSize = ktx2File.getImageTranscodedSizeInBytes(0, 0, 0, format);
   const dst = new Uint8Array(dstSize);
   
   const levelIndex =0;
   const layerIndex = 0;
   const faceIndex = 0;         
   
   var flags = setting.highquality_transcoding ? Module.basisu_decode_flags.cDecodeFlagsHighQuality.value : 0;
   if (setting.etc1s_bc7_transcoder_no_chroma_filtering)
      flags = flags | Module.basisu_decode_flags.cDecodeFlagsNoETC1SChromaFiltering.value;
                              
   if (!ktx2File.transcodeImageWithFlags(dst, levelIndex, layerIndex, faceIndex, format, flags, -1, -1)) 
   {
      updateErrorLine('ktx2File.transcodeImage failed');
      log('ktx2File.transcodeImage failed');
      console.warn('transcodeImage failed');
      ktx2File.close();
      ktx2File.delete();

      return;
   }

   const elapsed = performance.now() - startTime;

   ktx2File.close();
   ktx2File.delete();

   log('width: ' + width);
   log('height: ' + height);
   log('basisTexFormat: ' + basisTexFormat);
   log('isUASTC: ' + is_uastc);
   log('isHDR: ' + is_hdr);
   log('srcBlockWidth: ' + srcBlockWidth);
   log('srcBlockHeight: ' + srcBlockHeight);
   log('dstBlockWidth: ' + dstBlockWidth);
   log('dstBlockHeight: ' + dstBlockHeight);
   log('levels: ' + levels);
   log('layers: ' + layers);
   log('faces: ' + faces);
   log('has_alpha: ' + has_alpha);
   log('ldrHDRUpconversionNitMultiplier: ' + ldrHDRUpconversionNitMultiplier);
   
   logTime('transcoding time', elapsed.toFixed(3));

   alignedWidth = Math.floor((width + dstBlockWidth - 1) / dstBlockWidth) * dstBlockWidth;
   alignedHeight = Math.floor((height + dstBlockHeight - 1) / dstBlockHeight) * dstBlockHeight;
                    
   displayWidth = alignedWidth;
   displayHeight = alignedHeight;

   var canvas = setting.canvas;
   canvas.width = alignedWidth;
   canvas.height = alignedHeight;
   
   // Now create the WebGL texture object.

   if ((format === BASIS_FORMAT.cTFASTC_4x4) || (format === BASIS_FORMAT.cTFASTC_HDR_4x4_RGBA)) {
      tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGBA_ASTC_4x4_KHR);
   }
   else if (format === BASIS_FORMAT.cTFASTC_HDR_6x6_RGBA) {
      tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGBA_ASTC_6x6_KHR);
   }
   else if ((format === BASIS_FORMAT.cTFBC3) || (format === BASIS_FORMAT.cTFBC1) || (format == BASIS_FORMAT.cTFBC7)) {
      tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, DXT_FORMAT_MAP[format]);
   }
   else if (format === BASIS_FORMAT.cTFETC1) {
      tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGB_ETC1_WEBGL);
   }
   else if (format === BASIS_FORMAT.cTFPVRTC1_4_RGB) {
      tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGB_PVRTC_4BPPV1_IMG);
   }
   else if (format === BASIS_FORMAT.cTFPVRTC1_4_RGBA) {
      tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGBA_PVRTC_4BPPV1_IMG);
   }
   else if (format === BASIS_FORMAT.cTFBC6H) {
      tex = renderer.createCompressedTexture(dst, alignedWidth, alignedHeight, COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT);
   }
   else if (format == BASIS_FORMAT.cTFRGBA_HALF) {
      // Uncompressed RGBA HALF or 32bpp (with no block alignment)
      displayWidth = width;
      displayHeight = height;
      canvas.width = width;
      canvas.height = height;

      if ((rgbaHalfSupported) && (!rgbaHalfDisabled)) {
         var numHalfs = dstSize / 2;

         // Create uint16 data from the uint8 data.
         var dstHalfs = new Uint16Array(numHalfs);

         // Convert the array of bytes to an array of uint16's.
         for (var i = 0; i < numHalfs; i++)
            dstHalfs[i] = dst[2 * i + 0] | (dst[2 * i + 1] << 8);

         tex = renderer.createHalfRGBATexture(dstHalfs, width, height, halfFloatWebGLFormat);
      }
      else {
         // No HDR texture formats are supported (TODO: 9e5?) Fall back to plain 32bpp RGBA, just to do *something*. (Could also convert to RGBM.)
         const dstRGBA = new Uint8Array(width * height * 4);

         // Convert the array of half floats to uint8_t's, clamping as needed.
         var srcOfs = 0, dstOfs = 0;
         for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
               for (var c = 0; c < 4; c++) {
                  var h = dst[srcOfs] | (dst[srcOfs + 1] << 8);
                  var f = Module.convertHalfToFloat(h) * ((c == 3) ? 1 : ldrHDRUpconversionScale);

                  dstRGBA[dstOfs] = Math.min(255, Math.max(0, Math.round(f * 255.0)));

                  srcOfs += 2;
                  dstOfs++;
               }
            }
         }

         tex = renderer.createRgbaTexture(dstRGBA, width, height);

         // We've applied the LDR->HDR upconversion scale when converting to 32bpp, so don't have the shader do it.
         ldrHDRUpconversionScale = 1.0;
      }
   }
   else {
      // Uncompressed 565 (with no block alignment)
      
      displayWidth = width;
      displayHeight = height;
      canvas.width = width;
      canvas.height = height;

      // WebGL requires each row to be aligned on a 4-byte boundary.            
      var widthWordAligned = (width + 1) & ~1;
      
      // Create 565 texture.
      var dstTex = new Uint16Array(widthWordAligned * height);

      // Convert the array of bytes to an array of uint16's.
      var pix = 0;
      for (var y = 0; y < height; y++)
      {
         const dstTexRowOfs = y * widthWordAligned;
         for (var x = 0; x < width; x++, pix++)
            dstTex[dstTexRowOfs + x] = dst[2 * pix + 0] | (dst[2 * pix + 1] << 8);
      }
            
      tex = renderer.createRgb565Texture(dstTex, width, height);
   }
   
   linearToSRGBFlag = is_hdr;
   //elem('linear_to_srgb').innerText = linearToSRGBFlag ? 'Enabled' : 'Disabled';
   //elem('linear_to_srgb') = linearToSRGBFlag// ? 'Enabled' : 'Disabled';
   setting.linear_to_srgb = linearToSRGBFlag

   redraw();
   
   curLoadedKTX2Data = data;
   curLoadedKTX2URI = uri;
}

function download_file(filename, body) {
   var element = document.createElement('a');

   //element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));

   const blob = new Blob([body]);
   const url = URL.createObjectURL(blob);
   element.setAttribute('href', url);

   element.setAttribute('download', filename);

   element.style.display = 'none';
   document.body.appendChild(element);

   element.click();

   document.body.removeChild(element);
}

var encodedKTX2File;

function resetDrawSettings() {
   drawMode = 0;
   
   linearToSRGBFlag = false;
   setting.LinearToSrgb = linearToSRGBFlag
  // elem('linear_to_srgb').innerText = linearToSRGBFlag ? 'Enabled' : 'Disabled';

//         drawScale = 1.0;         
//         elem('scale-slider').value = .5;
//         elem('scale-value').textContent = 1;

   ldrHDRUpconversionScale = 1.0;
}

function getFileExtension(url) {
   const extension = url

   // Remove any query parameters or fragments from the extension and convert to lowercase
   const cleanExtension = extension.split(/[\?#]/)[0].toLowerCase();

  // console.log('extension >>>>> ', cleanExtension )
   return cleanExtension;
}

function getETC1SCompLevel() {
   //var slider = document.getElementById('etc1s-comp-level-slider'); // Get the slider element
   //var compLevel = parseInt(slider.value, 10);  // Convert the slider value to an integer
   var compLevel = parseInt(setting.ETC1S_Compression, 10);
   return compLevel;
}

function getUASTCHDRQuality() {
   //var slider = document.getElementById('uastc-hdr-quality-slider'); // Get the slider element
   //var qualityLevel = parseInt(slider.value, 10);  // Convert the slider value to an integer
   var qualityLevel = parseInt(setting.UASTC_HDR_Quality, 10);
   return qualityLevel;
}

function getASTCHDR6x6CompLevel() {
   //var slider = document.getElementById('astc-hdr6x6-comp-level-slider');
   //var compLevel = parseInt(slider.value, 10);  // Convert the slider value to an integer
   var compLevel = parseInt(setting.astc_hdr6x6_comp_level, 10);
   return compLevel;
}

function getUASTCLDRQuality() {
   //var slider = document.getElementById('uastc-ldr-quality-slider'); // Get the slider element
   //var qualityLevel = parseInt(slider.value, 10);  // Convert the slider value to an integer
   var qualityLevel = parseInt(setting.UASTC_LDR_Quality, 10);
   return qualityLevel;
}

function getUASTCLDRRDOQuality() {
   //var rdoSlider = document.getElementById('rdo-quality-slider'); // Get the slider element
   //var rdoQuality = parseFloat(rdoSlider.value);  // Convert the slider value to a floating-point number
   var rdoQuality = parseInt(setting.RDO_Quality, 10);
   return rdoQuality;  // Return the current value
}

function getNumWorkerThreads() {
   //var slider = document.getElementById('num_worker_threads');
   //var num = parseInt(slider.value, 10);  // Convert the slider value to an integer

   var num = parseInt(setting.Worker_Threads, 10)
   
   num = Math.floor(num);
   
   if (num < 0)
      num = 0;
   else if (num > MAX_WORKER_THREADS)
      num = MAX_WORKER_THREADS;
      
   return num;
}

function imageFileDataLoaded(data, name, ext) {

   if( !data ){
      if( curLoadedImageData ) data = curLoadedImageData;
      else return;
   }
   //console.log('dddd', tmpData)

   if( ext ) tmpExtension = getFileExtension(ext);
   else {
      if( !tmpExtension ) return
   }

   if( name ) tmpName = name;

   setting.name = tmpName;

   updateErrorLine("");
                                    
   const { BasisFile, BasisEncoder, initializeBasis, encodeBasisTexture } = Module;

   var extension = tmpExtension//getFileExtension(uri);

   resetDrawSettings();

   initializeBasis();
   
   log("imageFileDataLoaded URI: " + tmpName + '.' + tmpExtension);
                     
   curLoadedImageData = data;
   curLoadedImageURI = tmpName + '.' + tmpExtension//uri;
   
   // Create a destination buffer to hold the compressed .basis file data. If this buffer isn't large enough compression will fail.
   var ktx2FileData = new Uint8Array(1024 * 1024 * 24);

   // Compress using the BasisEncoder class.
   log('BasisEncoder::encode() started:');

   const basisEncoder = new BasisEncoder();
   
   //basisEncoder.controlThreading(elem('multithreaded_encoding').checked, MAX_WORKER_THREADS);
   basisEncoder.controlThreading( setting.Multithreading, MAX_WORKER_THREADS );
                              
   var desiredBasisTexFormat = getSelectedBasisTexFormat();
   
   const isHDRSourceFile = (extension != null) && (extension === "exr" || extension === "hdr");
   
   if (Module.isBasisTexFormatLDR(desiredBasisTexFormat))
   {
      if (isHDRSourceFile)
      {
            log('Image is HDR - must encode to a HDR format. Defaulting to UASTC HDR 4x4.');
            desiredBasisTexFormat = Module.basis_tex_format.cUASTC_HDR_4x4.value;
            
            setDropdownValue('basis-tex-format', Module.basis_tex_format.cUASTC_HDR_4x4.value);
      }
   }

   basisEncoder.setCreateKTX2File(true);
   basisEncoder.setKTX2UASTCSupercompression(true);
   
   if (!isHDRSourceFile)
      basisEncoder.setKTX2SRGBTransferFunc(true);

   if (Module.isBasisTexFormatHDR(desiredBasisTexFormat))
   {
      var img_type = Module.hdr_image_type.cHITPNGImage.value;

      if (extension != null)
      {
         if (extension === "exr")
            img_type = Module.hdr_image_type.cHITEXRImage.value;
         else if (extension === "hdr")
            img_type = Module.hdr_image_type.cHITHDRImage.value;
         else if ((extension === "jpg") || (extension === "jpeg") || (extension === "jfif"))
            img_type = Module.hdr_image_type.cHITJPGImage.value;
      }
      
      var ldr_to_hdr_nit_multiplier = getNitMultiplier();
      
      basisEncoder.setSliceSourceImageHDR(0, new Uint8Array(data), 0, 0, img_type, setting.ConvertLDRToLinear, ldr_to_hdr_nit_multiplier);

      /*
              // Float image data test
              const checkerboard = new Float32Array(64);

              // Fill the checkerboard array as before
              for (let y = 0; y < 4; y++) {
                  for (let x = 0; x < 4; x++) {
                      const index = (y * 4 + x) * 4;
                      const isWhite = (x + y) % 2 === 0;

                      if (isWhite) {
                          checkerboard[index] = 1.0;
                          checkerboard[index + 1] = 0.0;
                          checkerboard[index + 2] = 1.0;
                          checkerboard[index + 3] = 1.0;
                      } else {
                          checkerboard[index] = 0.0;
                          checkerboard[index + 1] = 0.0;
                          checkerboard[index + 2] = 0.0;
                          checkerboard[index + 3] = 1.0;
                      }
                  }
              }

              // Convert Float32Array to Uint8Array by sharing the same buffer
              const byteArray = new Uint8Array(checkerboard.buffer);

              basisEncoder.setSliceSourceImageHDR(0, byteArray, 4, 4, Module.hdr_image_type.cHITRGBAFloat.value, elem('ConvertLDRToLinear').checked, 1.0);
      */

      /*
              // Half float image data test
              var W = 16;
              var H = 16;
              const checkerboard = new Uint16Array(W*H*4);

              // Values to represent 1.0 and 0 in 16-bit integers
              const VALUE_ONE = 0x3C00; // FP16 representation of 1.0
              const VALUE_ZERO = 0x0000; // FP16 representation of 0.0

              // Fill the checkerboard array
              for (let y = 0; y < H; y++) {
                  for (let x = 0; x < W; x++) {
                      const index = (y * W + x) * 4;
                      const isWhite = (x + y) % 2 === 0;

                      if (isWhite) {
                          checkerboard[index] = VALUE_ONE;       // R
                          checkerboard[index + 1] = VALUE_ONE;   // G
                          checkerboard[index + 2] = VALUE_ONE;   // B
                          checkerboard[index + 3] = VALUE_ONE;   // A
                      } else {
                          checkerboard[index] = VALUE_ZERO;      // R
                          checkerboard[index + 1] = VALUE_ZERO;  // G
                          checkerboard[index + 2] = VALUE_ZERO;  // B
                          checkerboard[index + 3] = VALUE_ONE;   // A (1.0)
                      }
                  }
              }

              // Convert Uint16Array to Uint8Array by sharing the same buffer
              const byteArray = new Uint8Array(checkerboard.buffer);

              basisEncoder.setSliceSourceImageHDR(0, byteArray, W, H, Module.hdr_image_type.cHITRGBAHalfFloat.value, elem('ConvertLDRToLinear').checked, 1.0);
      */
   }
   else 
   {
      var img_type = Module.ldr_image_type.cPNGImage.value;

      if (extension != null)
      {
         if ((extension === "jpg") || (extension === "jpeg") || (extension === "jfif"))
            img_type = Module.ldr_image_type.cJPGImage.value;
      }
   
      basisEncoder.setSliceSourceImage(0, new Uint8Array(data), 0, 0, img_type);
   }
   
   basisEncoder.setFormatMode(desiredBasisTexFormat);

   // Use UASTC HDR quality (0=fastest)
   basisEncoder.setUASTCHDRQualityLevel(getUASTCHDRQuality());
   
   basisEncoder.setASTC_HDR_6x6_Level(getASTCHDR6x6CompLevel());
   basisEncoder.setLambda(getASTC6x6RDOLambda());

   basisEncoder.setRec2020(setting.Rec2020);

   basisEncoder.setDebug(setting.Debug);
   basisEncoder.setComputeStats(setting.ComputeStats)
   basisEncoder.setPerceptual(setting.SRGB);
   basisEncoder.setMipSRGB(setting.SRGB);

   const etc1SQualityLevel = parseInt(setting.ETC1S_Quality, 10);
   basisEncoder.setQualityLevel(etc1SQualityLevel);
                     
   basisEncoder.setRDOUASTC(setting.UASTC_LDR_RDO);
   basisEncoder.setRDOUASTCQualityScalar(getUASTCLDRRDOQuality());
   
   basisEncoder.setMipGen(setting.Mipmaps);
   /*basisEncoder.setRec2020(elem('Rec2020').checked);

   basisEncoder.setDebug(elem('Debug').checked);
   basisEncoder.setComputeStats(elem('ComputeStats').checked);
   basisEncoder.setPerceptual(elem('SRGB').checked);
   basisEncoder.setMipSRGB(elem('SRGB').checked);

   const etc1SQualityLevel = parseInt(elem('EncodeQuality').value, 10);
   basisEncoder.setQualityLevel(etc1SQualityLevel);
                     
   basisEncoder.setRDOUASTC(elem('UASTC_LDR_RDO').checked);
   basisEncoder.setRDOUASTCQualityScalar(getUASTCLDRRDOQuality());
   
   basisEncoder.setMipGen(elem('Mipmaps').checked);*/


   basisEncoder.setCompressionLevel(getETC1SCompLevel());
   basisEncoder.setPackUASTCFlags(getUASTCLDRQuality());

   if (desiredBasisTexFormat === Module.basis_tex_format.cUASTC_HDR_4x4.value)
      log('Encoding to UASTC HDR 4x4 quality level ' + getUASTCHDRQuality());
   else if (desiredBasisTexFormat === Module.basis_tex_format.cASTC_HDR_6x6.value)
      log('Encoding to ASTC HDR 6x6');
   else if (desiredBasisTexFormat === Module.basis_tex_format.cASTC_HDR_6x6_INTERMEDIATE.value)
      log('Encoding to ASTC HDR 6x6 Intermediate');
   else if (desiredBasisTexFormat === Module.basis_tex_format.cUASTC4x4.value)
      log('Encoding to UASTC LDR 4x4');
   else 
      log('Encoding to ETC1S quality level ' + etc1SQualityLevel);

   showBusyModal();

   requestAnimationFrame(() => {
      requestAnimationFrame(() => {
      const startTime = performance.now();

      var num_output_bytes = basisEncoder.encode(ktx2FileData);

      const elapsed = performance.now() - startTime;

      hideBusyModal();

      logTime('encoding time', elapsed.toFixed(2));

      var actualKTX2FileData = new Uint8Array(ktx2FileData.buffer, 0, num_output_bytes);

      basisEncoder.delete();

      if (num_output_bytes == 0) {
         updateErrorLine('encodeBasisTexture() failed! Image may be too large to compress using 32-bit WASM.');
         
         log('encodeBasisTexture() failed!');
      } else {
         log('encodeBasisTexture() succeeded, output size ' + num_output_bytes);

         encodedKTX2File = actualKTX2FileData;
      }

      if (num_output_bytes != 0) {
         dataLoaded(actualKTX2FileData);
      }
   
   });         
 });
               
}

function dataLoadError(msg) {
   updateErrorLine(msg);
   log(msg);
}
/*
function runLoadFile() {
   logClear();
   loadArrayBuffer(elem('file').value, dataLoaded, dataLoadError);
}

function runEncodeImageFile() {
   logClear();
   
   if ((elem('imagefile').value === '<externally loaded>') && (curLoadedImageData != null))
   {
      //console.log("calling imageFileDataLoaded 1");
      
      imageFileDataLoaded(curLoadedImageData, curLoadedImageURI);
   }
   else
   {
      //console.log("calling imageFileDataLoaded 4");
      
      loadArrayBuffer(elem('imagefile').value, imageFileDataLoaded, dataLoadError);
   }
}

function onFilenameSelect() {
   // Get the selected value from the drop-down
   var dropdown = document.getElementById('filename-dropdown');
   var selectedFilename = dropdown.value;

   if (selectedFilename) {
      elem('imagefile').value = selectedFilename;
      
      logClear();
      
      //console.log("calling imageFileDataLoaded 3");
      
      loadArrayBuffer(selectedFilename, imageFileDataLoaded, dataLoadError);
   }
}
*/
function alphaBlend() { drawMode = 0; redraw(); }
function viewRGB() { drawMode = 1; redraw(); }
function viewAlpha() { drawMode = 2; redraw(); }

function BC7ChromaFilterClicked() 
{ 
   if (curLoadedKTX2Data != null) 
   {
      logClear();
      dataLoaded(curLoadedKTX2Data, curLoadedKTX2URI);
   }
}

function highQualityTranscodingClicked()
{
   // Force retranscoding with the changed flags
   if (curLoadedKTX2Data != null) {
      logClear();
      dataLoaded(curLoadedKTX2Data, curLoadedKTX2URI);
   }
}

function linearToSRGB() { 
   linearToSRGBFlag = !linearToSRGBFlag; 
   //elem('linear_to_srgb').innerText = linearToSRGBFlag ? 'Enabled' : 'Disabled'; 
   //elem('linear_to_srgb') = linearToSRGBFlag// ? 'Enabled' : 'Disabled'; 
   setting.linear_to_srgb = linearToSRGBFlag
   redraw(); 
}

function lerp(a, b, t) {
   return a + t * (b - a);
}

function updateScale(value) {

   var v = value;
   if (v < .5) {
      v = v / .5;
      v = v ** 3.0;
   }
   else {
      v = (v - .5) / .5;
      v = lerp(1.0, 32.0, v);
   }
   
   //document.getElementById('scale-value').textContent = v.toFixed(4);
   setting.realExposure.textContent = v.toFixed(3);
   drawScale = v;
   redraw();
}

function downloadEncodedFile() {
   if (encodedKTX2File) {
      if (encodedKTX2File.length)
         download_file("encoded_file.ktx2", encodedKTX2File);
   }
}
            
function disabledFormatsChanged() {
   updateSupportedFormats();
   updateDisableButtons();
   
   if (curLoadedKTX2Data != null) {
      logClear();
      dataLoaded(curLoadedKTX2Data, curLoadedKTX2URI);
   }
}
      
function disableASTC() {
   astcDisabled = !astcDisabled;
   disabledFormatsChanged();
}

function disableETC1() {
   etcDisabled = !etcDisabled;
   disabledFormatsChanged();
}

function disableDXT() {
   dxtDisabled = !dxtDisabled;
   disabledFormatsChanged();
}

function disablePVRTC() {
   pvrtcDisabled = !pvrtcDisabled;
   disabledFormatsChanged();
}

function disableBC7() {
   bc7Disabled = !bc7Disabled;
   disabledFormatsChanged();
}

function disableASTCHDR() 
{
   astcHDRDisabled = !astcHDRDisabled;
   disabledFormatsChanged();
}

function disableBC6H() {
   bc6hDisabled = !bc6hDisabled;
   disabledFormatsChanged();
}

function disableRGBA_HALF() {
   rgbaHalfDisabled = !rgbaHalfDisabled;
   disabledFormatsChanged();
}

function disableAllFormats()
{
   astcDisabled = true;
   etcDisabled = true;
   dxtDisabled = true;
   pvrtcDisabled = true;
   bc7Disabled = true;
   astcHDRDisabled = true;
   bc6hDisabled = true;
   rgbaHalfDisabled = true;
   //disabledFormatsChanged();
}

function enableAllFormats()
{
   astcDisabled = false;
   etcDisabled = false;
   dxtDisabled = false;
   pvrtcDisabled = false;
   bc7Disabled = false;
   astcHDRDisabled = false;
   bc6hDisabled = false;
   rgbaHalfDisabled = false;
   //disabledFormatsChanged();
}

function updateDisableButtons() {
   const buttonsDiv = elem('disable-buttons');
   buttonsDiv.innerHTML = '';  // Clear any previous buttons

   let buttonCount = 0; // Keep track of how many buttons are added

   function addButton(buttonHTML) {
      if (buttonCount > 0 && buttonCount % 3 === 0) {
         // Insert a line break after every 3rd button
         buttonsDiv.innerHTML += '<br>';
      }
      buttonsDiv.innerHTML += buttonHTML;
      buttonCount++;
   }

   if (astcSupported) {
      if (astcDisabled)
         addButton('<button onclick="disableASTC()">Enable ASTC LDR</button>');
      else
         addButton('<button onclick="disableASTC()">Disable ASTC LDR</button>');
   }
   if (etcSupported) {
      if (etcDisabled)
         addButton('<button onclick="disableETC1()">Enable ETC1</button>');
      else
         addButton('<button onclick="disableETC1()">Disable ETC1</button>');
   }
   if (dxtSupported) {
      if (dxtDisabled)
         addButton('<button onclick="disableDXT()">Enable DXT (BC1/BC3)</button>');
      else
         addButton('<button onclick="disableDXT()">Disable DXT (BC1/BC3)</button>');
   }
   if (pvrtcSupported) {
      if (pvrtcDisabled)
         addButton('<button onclick="disablePVRTC()">Enable PVRTC</button>');
      else
         addButton('<button onclick="disablePVRTC()">Disable PVRTC</button>');
   }
   if (bc7Supported) {
      if (bc7Disabled)
         addButton('<button onclick="disableBC7()">Enable BC7</button>');
      else
         addButton('<button onclick="disableBC7()">Disable BC7</button>');
   }
   if (astcHDRSupported) {
      if (astcHDRDisabled)
         addButton('<button onclick="disableASTCHDR()">Enable ASTC HDR</button>');
      else
         addButton('<button onclick="disableASTCHDR()">Disable ASTC HDR</button>');
   }
   if (bc6hSupported) {
      if (bc6hDisabled)
         addButton('<button onclick="disableBC6H()">Enable BC6H</button>');
      else
         addButton('<button onclick="disableBC6H()">Disable BC6H</button>');
   }
   if (rgbaHalfSupported) {
      if (rgbaHalfDisabled)
         addButton('<button onclick="disableRGBA_HALF()">Enable RGBA_HALF</button>');
      else
         addButton('<button onclick="disableRGBA_HALF()">Disable RGBA_HALF</button>');
   }
   
   addButton('<button onclick="disableAllFormats()">Disable All</button>');
   addButton('<button onclick="enableAllFormats()">Enable All</button>');
}

function updateSupportedFormats() {
   let supportedFormats = [];

   // Collect all supported formats
   if (astcSupported && !astcDisabled) supportedFormats.push('ASTC LDR');
   if (etcSupported && !etcDisabled) supportedFormats.push('ETC1');
   if (dxtSupported && !dxtDisabled) supportedFormats.push('BC1-5');
   if (pvrtcSupported && !pvrtcDisabled) supportedFormats.push('PVRTC');
   if (bc7Supported && !bc7Disabled) supportedFormats.push('BC7');
   if (astcHDRSupported && !astcHDRDisabled) supportedFormats.push('ASTC HDR');
   if (bc6hSupported && !bc6hDisabled) supportedFormats.push('BC6H');
   if (rgbaHalfSupported && !rgbaHalfDisabled) supportedFormats.push('RGBA_HALF');

   // Prepare the display string
   let supportedString = 'Supported WebGL formats: ';
   if (supportedFormats.length > 0) {
      for (let i = 0; i < supportedFormats.length; i++) {
         supportedString += supportedFormats[i];
         // Add a comma after each format except the last
         if (i < supportedFormats.length - 1) {
            supportedString += ', ';
         }
         // Start a new line after every 4 formats
         if ((i + 1) % 4 === 0) {
            supportedString += '<br>';
         }
      }
   } else {
      supportedString = 'No WebGL formats detected/enabled; using uncompressed fallback formats.';
   }

   // Update the HTML element
   //elem('supported-formats').innerHTML = 
   setting.supported_formats = supportedString;
}

function checkForGPUFormatSupport(gl) {
   astcSupported = !!gl.getExtension('WEBGL_compressed_texture_astc');
   etcSupported = !!gl.getExtension('WEBGL_compressed_texture_etc1');
   dxtSupported = !!gl.getExtension('WEBGL_compressed_texture_s3tc');
   pvrtcSupported = !!(gl.getExtension('WEBGL_compressed_texture_pvrtc')) || !!(gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc'));
   bc7Supported = !!gl.getExtension('EXT_texture_compression_bptc');

   // Check for BC6H support
   {
      var ext = gl.getExtension('EXT_texture_compression_bptc');
      if (ext) {
         bc6hSupported = !!ext.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      }
   }

   // Check for ASTC HDR support
   {
      var ext = gl.getExtension('WEBGL_compressed_texture_astc');

      if (ext) {
         var supportedProfiles = ext.getSupportedProfiles();

         var hdrProfiles = supportedProfiles.filter(profile => profile.includes('hdr'));

         if (hdrProfiles.length > 0) {
            astcHDRSupported = true;
         }
      }
   }

   // Check for half-float texture support.
   {
      var ext = gl.getExtension('OES_texture_half_float');
      if (ext) {
         rgbaHalfSupported = true;
         halfFloatWebGLFormat = ext.HALF_FLOAT_OES;
      }
   }

   // HACK HACK - for testing uncompressed fallbacks.
   //astcSupported = false;
   //etcSupported = false;
   //dxtSupported = false;
   //bc7Supported = false;
   //pvrtcSupported = false;
   //bc6hSupported = false;
   //astcHDRSupported = false;
   //rgbaHalfSupported = false;

   console.log('astcSupported: ' + astcSupported);
   console.log('etcSupported: ' + etcSupported);
   console.log('dxtSupported: ' + dxtSupported);
   console.log('bc7Supported: ' + bc7Supported);
   console.log('pvrtcSupported: ' + pvrtcSupported);
   console.log('bc6hSupported: ' + bc6hSupported);
   console.log('astcHDRSupported: ' + astcHDRSupported);
   console.log('rgbaHalfSupported: ' + rgbaHalfSupported);
   
   updateSupportedFormats();
   //updateDisableButtons();
}

function validateNitMultiplier(input) 
{
   const warning = document.getElementById('ldr-to-hdr-warning');
   const value = parseFloat(input.value);

   if (isNaN(value) || value < 0.1 || value > 1000) {
     // Show warning if value is invalid
     warning.style.display = 'inline';
   } 
   else 
   {
        // Hide warning if value is valid
      warning.style.display = 'none';
   }
}

function getNitMultiplier() 
{
   //const input = document.getElementById('ldr-to-hdr-multiplier');
   //const value = parseFloat(input.value);
   const value = parseFloat(setting.ldr_to_hdr_multiplier);

   if (!isNaN(value) && value >= 0.1 && value <= 1000) 
   {
      return value;
   } 
   else 
   {
      log('Invalid LDR to HDR Nit Multiplier value. Defaulting to 100.0');
      return 100.0; // Default value if invalid
   }
}

function getSelectedBasisTexFormat() 
{
   //const selectElem = document.getElementById('basis-tex-format');
   //const selectedValue = parseInt(selectElem.value, 10);

   const selectedValue = parseInt(setting.basis_tex_format, 10);

   return selectedValue;
}

function getASTC6x6RDOLambda()
{
   //const input = document.getElementById('astc6x6-rdo-lambda');
   //const value = parseFloat(input.value);
   const value = parseFloat(setting.astc6x6_rdo_lambda);

   if (!isNaN(value) && value >= 0.0 && value <= 1000000) 
   {
      return value;
   } 
   else 
   {
      log('Invalid lambda value. Defaulting to 0.0');
      return 0.0; // Default value if invalid
   }
}

function showBusyModal() {
   //console.log("Showing modal");
   setting.loader.style.display = 'flex';
}

function hideBusyModal() {
   //console.log("Hiding modal");
   setting.loader.style.display = 'none';
}

function setDropdownValue(selectId, value) {

   const formatList = ['ETC1S', 'UASTC LDR 4x4', 'UASTC HDR 4x4', 'RDO ASTC HDR 6x6', 'ASTC HDR 6x6 Intermediate'];
   setting.tex_format.setValue(formatList[value])

   setting.basis_tex_format = value;

   // change list value to new format

   /*const selectElement = document.getElementById(selectId);
   if (!selectElement)
      return;
      
   selectElement.value = value;
   selectElement.dispatchEvent(new Event('change'));*/
}
/*
function globalInit(){

  
   elem('SRGB').checked = true;

   var gl = elem('canvas').getContext('webgl');
   checkForGPUFormatSupport(gl);

   window.renderer = new Renderer(gl);

   /*elem('file').addEventListener('keydown', function (e) {
       if (e.keyCode == 13) {
           runLoadFile();
       }
   }, false);

   elem('imagefile').addEventListener('keydown', function (e) {
       if (e.keyCode == 13) {
           runEncodeImageFile();
       }
   }, false);*/
/*   {
       let etc1SLevelSlider = document.getElementById('etc1s-comp-level-slider');
       let etc1sLevelSliderValueDisplay = document.getElementById('etc1s-comp-level-slider-value');
       etc1SLevelSlider.oninput = function() {
           etc1sLevelSliderValueDisplay.textContent = this.value;
       }
   }

   {
       let uastcHDRSlider = document.getElementById('uastc-hdr-quality-slider');
       let qualityHDRValueDisplay = document.getElementById('uastc-hdr-quality-value');
       uastcHDRSlider.oninput = function() {
           qualityHDRValueDisplay.textContent = this.value;
       }
   }

   {
       let astcHDR6x6Slider = document.getElementById('astc-hdr6x6-comp-level-slider');
       let compLevelValueDisplay = document.getElementById('astc-hdr6x6-comp-level-value');
       astcHDR6x6Slider.oninput = function() {
           compLevelValueDisplay.textContent = this.value;
       }
   }

   {
       let uastcLDRSlider = document.getElementById('uastc-ldr-quality-slider');
       let qualityLDRValueDisplay = document.getElementById('uastc-ldr-quality-value');
       uastcLDRSlider.oninput = function() {
           qualityLDRValueDisplay.textContent = this.value;
       }
   }

   {
       let rdoSlider = document.getElementById('rdo-quality-slider');
       let rdoValueDisplay = document.getElementById('rdo-quality-value');
       rdoSlider.oninput = function() {
           rdoValueDisplay.textContent = parseFloat(this.value).toFixed(1);
       }
   }

   {
       let etc1SQualitySlider = document.getElementById('EncodeQuality');
       let etc1SQualitySliderValue = document.getElementById('encode-quality-value');
       etc1SQualitySlider.oninput = function() {
           etc1SQualitySliderValue.textContent = parseFloat(this.value).toFixed(0);
       }
   }
   
   runLoadFile();
}*/

function updateErrorLine(message) {

   if(message) console.error( message )
  /*const errorLine = document.getElementById('error-line');
  errorLine.textContent = message;
  errorLine.style.color = message.trim() ? 'red' : '';*/
}