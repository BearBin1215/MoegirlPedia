import path from 'path';
import { fileURLToPath } from 'url';
import { sync as globSync } from 'glob';
import { type Mode, rspack } from '@rspack/core';
import { defineConfig } from '@rspack/cli';
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import svgToMiniDataURI from 'mini-svg-data-uri';

/** esm中模拟cjs的__dirname */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 线上浏览器兼容目标，SWC转译与lightningcss处理共用 */
const browserTargets = '> 0.5%, not dead';

/** 生成 Rspack 构建配置。 */
export default (
  _env: Record<string, unknown> | undefined,
  args: { mode?: Mode },
  globString = './src/gadgets/**/index.{js,jsx,ts,tsx}',
) => defineConfig({
  mode: args.mode || 'development',
  devtool: args.mode === 'development' ? 'eval-source-map' : 'source-map',
  lazyCompilation: args.mode === 'development',

  entry: globSync(
    globString,
    { nocase: true },
  ).map((filename) => filename
    .replace(/\\/g, '/') // windows下会输出反斜杠，需要替换
    .replace(/^(?:.\/)?(.*)$/, './$1'), // 添加./
  ).reduce<Record<string, string>>((entries, filepath) => {
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
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, '.', 'src'),
    },
  },
  externals: {
    moment: 'moment',
    vue: 'Vue',
    pinia: 'window.Pinia',
    '@wikimedia/codex': 'window.Codex',
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
              targets: browserTargets,
            },
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
              transform: {
                react: {
                  // classic运行时：与tsconfig的jsx: react及源码中显式import React的写法保持一致
                  runtime: 'classic',
                },
              },
            },
          },
        },
        type: 'javascript/auto',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        oneOf: [
          /** import styles from 'foo.inline.css'; 时作为string导入 */
          {
            test: /\.inline\.css$/,
            type: 'asset/source',
            use: [
              {
                loader: 'builtin:lightningcss-loader',
                /** @type {import('@rspack/core').LightningcssLoaderOptions} */
                options: {
                  targets: args.mode !== 'development' ? browserTargets : void 0,
                  minify: args.mode !== 'development',
                },
              },
            ],
          },
          {
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'builtin:lightningcss-loader',
                /** @type {import('@rspack/core').LightningcssLoaderOptions} */
                options: {
                  targets: args.mode !== 'development' ? browserTargets : void 0,
                  minify: args.mode !== 'development',
                },
              },
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
              dataUrl: (content: Buffer) => svgToMiniDataURI(content.toString()),
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
