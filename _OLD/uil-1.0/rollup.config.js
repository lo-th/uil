export default {
	entry: 'src/Uil.js',
	indent: '\t',
	// sourceMap: true,
	targets: [
		{
			format: 'umd',
			moduleName: 'UIL',
			dest: 'build/uil.js'
		},
		{
			format: 'es',
			dest: 'build/uil.module.js'
		}
	]
};
