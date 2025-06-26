import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import del from 'rollup-plugin-delete';

const external = ['react', 'react-dom', 'clsx', 'lodash-es', 'tslib'];

/** @type {import('@rollup/plugin-babel').RollupBabelInputPluginOptions} */
const babelOptions = {
  babelHelpers: 'bundled',
  presets: [['@babel/preset-env', { modules: false }]],
  targets: '> 0.2%, not dead',
  extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
};

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'lib/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        rootDir: 'src',
        declaration: true,
        declarationDir: 'lib/cjs',
      }),
      babel(babelOptions),
      del({ targets: 'lib/cjs' }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      dir: 'lib/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        rootDir: 'src',
        declaration: true,
        declarationDir: 'lib/esm',
      }),
      babel(babelOptions),
      del({ targets: 'lib/esm' }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/umd/index.min.js',
      format: 'umd',
      name: 'oojs-ui-react',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
      },
    },
    external: ['react', 'react-dom'],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        declaration: false,
      }),
      babel(babelOptions),
      terser(),
      del({ targets: 'lib/umd' }),
    ],
  },
];
