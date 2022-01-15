import * as THREE from '../build/three.module.js';
import { Lensflare, LensflareElement } from '../examples/jsm/objects/Lensflare.js';


export class SuperSky extends THREE.Mesh {

	constructor( o = {} ) {

		super()

		this.skyResolution = 512;

		this.size = o.size || 10000;
		this.callback = o.callback || function(){};

		this.setting = {

			t:0,
			fog:0,
			cloud_size: .45,
			cloud_covr: .3,
			cloud_dens: 40,

			inclination: 45,
			azimuth: 90,
			hour:12,

		}

		this.scene = o.scene;
		this.renderer = o.renderer;

		this.sceneSky = new THREE.Scene();

		this.urls = ['./assets/glsl/base_vs.glsl', './assets/glsl/dome_fs.glsl', './assets/glsl/sky_fs.glsl'];
		this.shaders = {};
		this.textureLoader = new THREE.TextureLoader();

		this.geometry = new THREE.SphereBufferGeometry( this.size, 30, 15 );
		this.material = new THREE.ShaderMaterial();

		//THREE.Mesh.call( this, this.geometry, this.material );

		this.visible = false;
		this.castShadow = false;
	    this.receiveShadow = false;
	    this.needsUpdate = false;
	    this.torad = 0.0174532925199432957; 

	    this.addLight();
	    this.load();

	}


    load() {
		if( this.urls.length === 0 ){ 

		    // load noise map
			this.noiseMap = this.textureLoader.load( "./assets/textures/sky/noise.png", function ( texture ) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.flipY = false; this.init(); }.bind(this) )

		} else{ 
			this.loadShader( this.urls.shift() );
		}
	}

    loadShader( link ) {

		var name = link.substring( link.lastIndexOf('/')+1, link.lastIndexOf('.') );
		var xhr = new XMLHttpRequest();
        xhr.open('GET', link, true );

        xhr.onreadystatechange = function () {

	    if ( xhr.readyState === 2 ) { 
	        } else if ( xhr.readyState === 3 ) { //  progress
	        } else if ( xhr.readyState === 4 ) {
	            if ( xhr.status === 200 || xhr.status === 0 ){ 
	            	this.shaders[name] = xhr.response;
	            	this.load();
	            }
	            else console.error( "Couldn't load ["+ name + "] [" + xhr.status + "]" );
	        }
	    }.bind(this);

        xhr.send( null );

	}

	addLight() {

		this.sunMaterial = new THREE.SpriteMaterial( { map: this.textureLoader.load("assets/textures/sky/lensflare1.png"), blending:THREE.AdditiveBlending, opacity:0.5 } );
		var sunSprite = new THREE.Sprite( this.sunMaterial );
		sunSprite.scale.set( 40, 40, 1 );
				
		this.sun = new THREE.DirectionalLight( 0xffffff, 4 );
		this.sun.add( sunSprite );

    	var dd = 20;
        this.sun.shadow.camera.top = dd;
		this.sun.shadow.camera.bottom = - dd;
		this.sun.shadow.camera.left = - dd;
		this.sun.shadow.camera.right = dd;
		this.sun.shadow.camera.near = 880;
		this.sun.shadow.camera.far = 920;
        this.sun.shadow.mapSize.width = 1024;
        this.sun.shadow.mapSize.height = 1024;
        //this.sun.shadow.bias = 0.001;
        this.sun.shadow.radius = 2;
        this.sun.castShadow = true;

        this.moonMaterial = new THREE.SpriteMaterial( { map: this.textureLoader.load("assets/textures/sky/lensflare2.png"), opacity:0.3 } );
		var moonSprite = new THREE.Sprite( this.moonMaterial );
		moonSprite.scale.set( 70, 70, 1 );

    	this.moon = new THREE.DirectionalLight( 0xffffff, 0.8 );//new THREE.PointLight( 0x909090, 0.5, 10000, 2 );
    	this.moon.add( moonSprite );

    	this.ambient = new THREE.AmbientLight( 0x3b4c5a, 0.5 );
    	//this.ambient = new THREE.HemisphereLight(0, 0x3b4c5a, 0.1);

    	this.scene.add( this.sun );
    	this.scene.add( this.moon );

    	//this.scene.add( new THREE.CameraHelper( this.sun.shadow.camera ) );
    	this.scene.add( this.ambient );

    	this.sunSph = new THREE.Spherical(this.size-this.size*0.1);
		this.moonSph = new THREE.Spherical(this.size-this.size*0.1);

		this.sunPosition = new THREE.Vector3();
		this.moonPosition = new THREE.Vector3();

		var textureFlare3 = this.textureLoader.load("assets/textures/sky/lensflare3.png")
		this.lensflare = new Lensflare();
		this.lensflare.addElement( new LensflareElement( this.textureLoader.load("assets/textures/sky/lensflare0.png"), this.size*0.1, 0, this.sun.color ) );
		this.lensflare.addElement( new LensflareElement( textureFlare3, 60, 0.6, this.sun.color ) );
		this.lensflare.addElement( new LensflareElement( textureFlare3, 70, 0.7, this.sun.color ) );
		this.lensflare.addElement( new LensflareElement( textureFlare3, 120, 0.9, this.sun.color ) );
		this.lensflare.addElement( new LensflareElement( textureFlare3, 70, 1, this.sun.color ) );
		this.sun.add(this.lensflare);

	}

	init(){

		this.materialSky = new THREE.ShaderMaterial( {

			uniforms: {
				lightdir: { value: this.sunPosition },
				noiseMap: { value: this.noiseMap },
                cloud_size: { value: this.setting.cloud_size },
                cloud_covr: { value: this.setting.cloud_covr },
                cloud_dens: { value: this.setting.cloud_dens },
                cloudColor: { value: new THREE.Color(0xFFFFFF) },
                groundColor: { value: new THREE.Color(0x3b4c5a) },
                fogColor: { value: new THREE.Color(0xff0000) },
                fog: { value: this.setting.fog },
                t: { value: this.setting.t }
			},
			vertexShader: this.shaders['base_vs'],
			fragmentShader: this.shaders['sky_fs'],
			depthWrite: false,
			depthTest: false,
			side:THREE.BackSide,
			
		});

		var t = new THREE.IcosahedronGeometry( 1, 1 );
		var cmesh = new THREE.Mesh( t, this.materialSky );
		this.sceneSky.add( cmesh );

		this.cubeCameraRender = new THREE.WebGLCubeRenderTarget( this.skyResolution, {
					format: THREE.RGBFormat,
					generateMipmaps: true,
					minFilter: THREE.LinearMipmapLinearFilter,
					//encoding: THREE.sRGBEncoding
				});

		this.cubeCamera = new THREE.CubeCamera( 0.5, 2, this.cubeCameraRender );
		this.sceneSky.add( this.cubeCamera );


		//this.render();

		this.envMap = this.cubeCameraRender.texture;
		//this.envMap.encoding = THREE.sRGBEncoding
		//this.envMap.minFilter = THREE.LinearMipMapLinearFilter;
		//this.envMap.format = THREE.RGBAFormat;

		

		this.material = new THREE.ShaderMaterial( {

			uniforms: {
				lightdir: { value: this.sunPosition },
				lunardir: { value: new THREE.Vector3(0, -.2, 1) },
				tCube: { value: this.envMap },
                tDome: { value: this.textureLoader.load( "./assets/textures/sky/milkyway.png",  function ( t ) { t.encoding = THREE.sRGBEncoding; } ) },
			},
			vertexShader: this.shaders['base_vs'],
			fragmentShader: this.shaders['dome_fs'],
			side:THREE.BackSide,
			
		});

		this.material.needsUpdate = true;

		this.update();

		this.callback();

	}

	k(e, t) {
        var n = t.dot(t),
            a = 2 * t.dot(e),
            o = e.dot(e) - 1,
            r = a * a - 4 * n * o,
            i = Math.sqrt(r),
            l = (-a - i) / 2,
            s = o / l;
        return s
    }

    z(e, t, n, a) {
        var o = new THREE.Vector3(.188, .458, .682),
            r = a.y >= 0 ? 1 : 0;
        return this.r = (t.x - t.x * Math.pow(o.x, n / e)) * r, this.g = (t.y - t.y * Math.pow(o.y, n / e)) * r, this.b = (t.z - t.z * Math.pow(o.z, n / e)) * r, this
    }

    setData( d ) {

        this.setting = d;
        this.update();

    }

	update() {

		var setting = this.setting;

		setting.inclination = (setting.hour*15)-90;

        this.sunSph.phi = (setting.inclination-90) * this.torad;
        this.sunSph.theta = (setting.azimuth-90) * this.torad;
        this.sun.position.setFromSpherical( this.sunSph );

        this.moonSph.phi = (setting.inclination+90) * this.torad;
        this.moonSph.theta = (setting.azimuth-90) * this.torad;
        this.moon.position.setFromSpherical( this.moonSph )

        this.sunPosition = this.sun.position.clone().normalize();
        this.moonPosition = this.sun.position.clone().normalize();

        // sun color formule
        var n = this.k(new THREE.Vector3(0, .99, 0), this.sunPosition), a = this.z(n, new THREE.Vector3(1.8, 1.8, 1.8), .028, this.sunPosition);
        a.r = a.r > 1.0 ? 1.0:a.r;
        a.g = a.g > 1.0 ? 1.0:a.g;
        a.b = a.b > 1.0 ? 1.0:a.b;

        this.day = a.r;

        this.sun.color.setRGB(a.r, a.g, a.b);
        this.sunMaterial.color.copy( this.sun.color )

        this.sun.intensity = a.r;

        var ma = 1 - a.r;
        var mg = 1 - a.g;
        var mb = 1 - a.b;
        this.moon.intensity = ma*0.35;
        this.moon.color.setRGB(ma, mg, mb);
        this.moonMaterial.color.copy( this.moon.color );

		this.materialSky.uniforms.t.value = setting.t;
		this.materialSky.uniforms.fog.value = setting.fog;
		this.materialSky.uniforms.cloud_size.value = setting.cloud_size;
		this.materialSky.uniforms.cloud_covr.value = setting.cloud_covr;
		this.materialSky.uniforms.cloud_dens.value = setting.cloud_dens;
		this.materialSky.uniforms.lightdir.value = this.sunPosition;
		this.material.uniforms.lightdir.value = this.sunPosition;

		this.needsUpdate = true;

		if( !this.visible ) this.visible = true;

		//this.render()

	}

	render() {

		this.cubeCamera.update( this.renderer, this.sceneSky );
		this.needsUpdate = false;

	}





}