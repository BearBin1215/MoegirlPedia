import { sync as globSync } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import { rspack } from '@rspack/core';
import { defineConfig } from '@rspack/cli';
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import svgToMiniDataURI from 'mini-svg-data-uri';

/** esm中模拟cjs的__dirname */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 入口文件 */
const entry = globSync(
  process.env.gadgetname
    ? `./src/gadgets/{${process.env.gadgetname},}/index.{js,jsx,ts,tsx}`
    : './src/gadgets/**/index.{js,jsx,ts,tsx}',
  { nocase: true })
  .map((filename) => filename
    .replace(/\\/g, '/') // windows下会输出反斜杠，需要替换
    .replace(/^(?:.\/)?(.*)$/, './$1'))
  .reduce((entries, filepath) => {
    const et = filepath.replace('./src/gadgets/', '').replace(/\/index\.(js|jsx|ts|tsx)$/, '');
    entries[et] = filepath;
    return entries;
  }, {});

/** 内置lightningcss-loader配置 */
const lightningcssLoader = {
  loader: 'builtin:lightningcss-loader',
  /** @type {import('@rspack/core').LightningcssLoaderOptions} */
  options: {
    targets: '> 0.3%, not dead',
    minify: true,
  },
};

/** CSS Module配置 */
const cssModuleLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      localIdentName: 'beartools__[local]--[hash:base64:5]',
    },
  },
};

export default (_, args) => defineConfig({
  mode: args.mode || 'development',
  devtool: args.mode === 'development' ? 'eval-source-map' : false,
  experiments: {
    lazyCompilation: true,
  },

  entry,
  output: args.mode === 'development' ? {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/dev'), // 开发模式下输出到dist/dev文件夹，不会提交到仓库
  } : {
    filename: '[name].min.js',
    path: path.resolve(__dirname, './dist/gadgets'), // 构建模式下输出到dist/gadgets
  },

  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.less', '.json'],
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      '@': path.resolve(__dirname, '.', 'src'),
      "oojs-ui-react": path.resolve(__dirname, '.', 'src/components/oojs-ui-react'),
    },
  },

  module: {
    parser: {
      javascript: {
        dynamicImportMode: 'eager',
      },
    },
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.[jt]sx?$/i,
        use: {
          loader: 'builtin:swc-loader',
          /** @type {import('@rspack/core').SwcLoaderOptions} */
          options: {
            env: {
              targets: '> 0.3%, not dead',
            },
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
            },
          },
        },
        type: 'javascript/auto',
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        oneOf: [
          /** import styles from 'foo.inline.less'; 时作为string导入 */
          {
            test: /\.(inline|raw)\.less$/,
            type: 'asset/source',
            use: [lightningcssLoader, 'less-loader'],
          },
          /** import styles from 'foo.module.less'; 时作为CSS Module导入 */
          {
            test: /\.module\.less$/,
            use: [
              'style-loader',
              cssModuleLoader,
              lightningcssLoader,
              'less-loader',
            ],
          },
          {
            use: [
              'style-loader',
              'css-loader',
              lightningcssLoader,
              'less-loader',
            ],
          },
        ],
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            test: /\.(inline|raw)\.css$/,
            type: 'asset/source',
            use: [lightningcssLoader],
          },
          {
            test: /\.module\.css$/,
            use: [
              'style-loader',
              cssModuleLoader,
              lightningcssLoader,
            ],
          },
          {
            use: [
              'style-loader',
              'css-loader',
              lightningcssLoader,
            ],
          },
        ],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.svg$/,
        oneOf: [
          // `import svg from 'foo.inline.svg';`时作为完整的XML字符串导入
          {
            test: /\.(inline|raw)\.svg$/,
            type: 'asset/source',
          },
          {
            issuer: /\.[jt]sx$/,
            use: ['@svgr/webpack'],
          },
          {
            type: 'asset/inline',
            generator: {
              dataUrl: (content) => svgToMiniDataURI(content.toString()),
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/,
        type: 'asset',
      },
    ],
  },
  plugins: [
    new TsCheckerRspackPlugin(),
    new VueLoaderPlugin(),
  ],
  externals: {
    moment: 'moment',
    vue: 'Vue',
    pinia: 'window.Pinia',
  },
  watchOptions: {
    ignored: /node_modules/,
  },
  optimization: {
    minimize: args.mode !== 'development',
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        extractComments: false,
        minimizerOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
});
