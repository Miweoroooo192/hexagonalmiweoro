import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
	input: 'src/index.ts',
	output: {
		file: 'dist/bundle.js',
		format: 'iife'
	},
	plugins: [nodeResolve()]
};
