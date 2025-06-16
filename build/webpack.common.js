const glob = require('glob');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const svgToMiniDataURI = require('mini-svg-data-uri');
const { VueLoaderPlugin } = require('vue-loader');

const entry = glob.sync(
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

const postCssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        ['autoprefixer'],
        ['cssnano', { preset: 'default' }],
      ],
    },
  },
};

const cssModuleLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      localIdentName: 'beartools__[local]--[hash:base64:5]',
    },
  },
};

/** @type {(import('webpack').Configuration)} */
module.exports = {
  entry,
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx', '.less'],
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
      '@': path.resolve(__dirname, '..', 'src'),
      "oojs-ui-react": path.resolve(__dirname, '..', 'src/components/oojs-ui-react'),
    },
  },
  cache: {
    type: 'filesystem',
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
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/],
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            targets: '> 0.3%, not dead',
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        oneOf: [
          {
            assert: { type: 'string' },
            type: 'asset/source',
            use: [postCssLoader, 'less-loader'],
          },
          /** import styles from 'foo.module.less'; 时作为CSS Module导入 */
          {
            test: /\.module\.less$/,
            use: [
              'style-loader',
              cssModuleLoader,
              postCssLoader,
              'less-loader',
            ],
          },
          {
            use: [
              'style-loader',
              'css-loader',
              postCssLoader,
              'less-loader',
            ],
          },
        ],
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            assert: { type: 'string' },
            type: 'asset/source', // css文件经过post-css处理后作为文本导入
            use: [postCssLoader],
          },
          {
            resourceQuery: /module/,
            use: [
              'style-loader',
              cssModuleLoader,
              postCssLoader,
            ],
          },
          {
            use: [
              'style-loader',
              'css-loader',
              postCssLoader,
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
          // `import svg from 'foo.svg' assert { type: 'xml' }`时作为完整的XML字符串导入
          {
            assert: { type: 'xml' },
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
  plugins: [new ForkTsCheckerWebpackPlugin(), new VueLoaderPlugin()],
  externals: {
    moment: 'moment',
    vue: 'Vue',
    pinia: 'window.Pinia',
  },
};
