import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'build/table-generators.cjs',
    format: 'cjs',
  },
  plugins: [
    nodeResolve({
      browser: false,
      exportConditions: ['node'],
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
    terser(),
    typescript(),
  ],
};
