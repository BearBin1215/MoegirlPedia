import path from 'path';
import { fileURLToPath } from 'url';
import { sync as globSync } from 'glob';
import { rspack } from '@rspack/core';
import { defineConfig } from '@rspack/cli';
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import svgToMiniDataURI from 'mini-svg-data-uri';

/** esm中模拟cjs的__dirname */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (_, args, globString = './src/gadgets/**/index.{js,jsx,ts,tsx}') => defineConfig({
  mode: args.mode || 'development',
  devtool: args.mode === 'development' ? 'eval-source-map' : 'source-map',
  experiments: {
    lazyCompilation: true,
  },

  entry: globSync(
    globString,
    { nocase: true },
  ).map((filename) => filename
    .replace(/\\/g, '/') // windows下会输出反斜杠，需要替换
    .replace(/^(?:.\/)?(.*)$/, './$1'), // 添加./
  ).reduce((entries, filepath) => {
    const et = filepath.replace('./src/gadgets/', '').replace(/\/index\.(js|jsx|ts|tsx)$/, '');
    entries[et] = filepath;
    return entries;
  }, {}),
  output: args.mode === 'development' ? {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist/dev'), // 开发模式下输出到dist/dev文件夹，不会提交到仓库
  } : {
    filename: '[name].min.js',
    path: path.resolve(__dirname, './dist/gadgets'), // 构建模式下输出到dist/gadgets/[name].mim.js
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
  externals: {
    moment: 'moment',
    vue: 'Vue',
    pinia: 'window.Pinia',
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
              targets: '> 0.5%, not dead',
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
        test: /\.(less|css)$/,
        // 所有样式表都经过less-loader和lightning-loader的处理
        use: [
          {
            loader: 'builtin:lightningcss-loader',
            /** @type {import('@rspack/core').LightningcssLoaderOptions} */
            options: {
              targets: args.mode !== 'development' ? '> 0.5%, not dead' : void 0,
              minify: args.mode !== 'development',
            },
          },
          'less-loader',
        ],
        oneOf: [
          /** import styles from 'foo.inline.less'; 时作为string导入 */
          {
            test: /\.(inline|raw)\.(less|css)$/,
            type: 'asset/source',
          },
          /** import styles from 'foo.module.less'; 时作为CSS Module导入 */
          {
            test: /\.module\.(less|css)$/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: 'beartools__[local]--[hash:base64:5]',
                  },
                },
              },
            ],
          },
          {
            use: [
              'style-loader',
              'css-loader',
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
          // 在jsx中作为react件引入
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
    args.mode === 'development' && new TsCheckerRspackPlugin(),
    new VueLoaderPlugin(),
  ],
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
