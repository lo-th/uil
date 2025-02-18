import terser from '@rollup/plugin-terser';

function polyfills() {

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

export default [
    
	{
		input: 'src/Uil.js',
		plugins: [
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
			terser()
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
		    terser()
		],
		output: [
			{
				format: 'esm',
				file: 'build/uil.module.js'
			}
		]
	}
	
];