import terser from '@rollup/plugin-terser';

export default [
	{
		input: 'src/Uil.js',
		output: {
			format: 'umd',
			name: 'UIL',
			file: 'build/uil.min.js',
			plugins: [terser()]
		}
	},
	{
		input: 'src/Uil.module.js',
		output: [
			{
				format: 'esm',
				file: 'build/uil.module.js'
			},
			{
				format: 'esm',
				file: 'build/uil.module.min.js',
				plugins: [terser()]
			}
		]
	}
];