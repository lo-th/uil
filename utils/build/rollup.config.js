//import buble from 'rollup-plugin-buble';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

/*export default [
	{
		input: 'src/Uil.js',
		plugins: [
			buble( {
				transforms: {
					arrow: false,
					classes: true
				}
			} )
		],
		output: [
			{
				format: 'umd',
				name: 'UIL',
				file: 'build/uil.js',
				indent: '\t'
			}
		]
	},
	{
		input: 'src/Uil.js',
		plugins: [
		],
		output: [
			{
				format: 'esm',
				file: 'build/uil.module.js',
				indent: '\t'
			}
		]
	}
];*/

function babelCleanup() {

	const doubleSpaces = / {2}/g;

	return {

		transform( code ) {

			code = code.replace( doubleSpaces, '\t' );

			return {
				code: code,
				map: null
			};

		}

	};

}

function header() {

	/*return {

		renderChunk( code ) {

			//return '// threejs.org/license\n' + code;

		}

	};*/

}

function polyfills() {

	// for what ??

	return {

		transform( code, filePath ) {

			if ( filePath.endsWith( 'src/Uil.js' ) || filePath.endsWith( 'src\\Uil.js' ) ) {

				code = 'import \'regenerator-runtime\';\n' + code;

			}

			return {
				code: code,
				map: null
			};

		}

	};

}

const babelrc = {
	presets: [
		[
			'@babel/preset-env',
			{
				modules: false,
				// the supported browsers of the three.js browser bundle
				// https://browsersl.ist/?q=%3E0.3%25%2C+not+dead
				targets: '>0.3%, not dead',
				loose: true,
				bugfixes: true,
			}
		]
	]
};

export default [
	{
		input: 'src/Uil.js',
		plugins: [
			polyfills(),
			nodeResolve(),
			babel( {
				babelHelpers: 'bundled',
				compact: false,
				babelrc: false,
				...babelrc
			} ),
			babelCleanup(),
			header()
		],
		output: [
			{
				format: 'umd',
				name: 'UIL',
				file: 'build/uil.js',
				indent: '\t'
			}
		]
	},
	{
		input: 'src/Uil.js',
		plugins: [
			polyfills(),
			nodeResolve(),
			babel( {
				babelHelpers: 'bundled',
				babelrc: false,
				...babelrc
			} ),
			babelCleanup(),
			terser(),
			header()
		],
		output: [
			{
				format: 'umd',
				name: 'UIL',
				file: 'build/uil.min.js'
			}
		]
	},
	{
		input: 'src/Uil.js',
		plugins: [
			header()
		],
		output: [
			{
				format: 'esm',
				file: 'build/uil.module.js'
			}
		]
	}
];