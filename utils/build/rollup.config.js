import buble from 'rollup-plugin-buble';

export default [
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
];
