import path from 'path';
import { fileURLToPath } from 'url';
import { rspack } from '@rspack/core';
import { defineConfig } from '@rspack/cli';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import { TsCheckerRspackPlugin } from 'ts-checker-rspack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  mode: 'development',
  entry: './tests/index.tsx',
  output: {},
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
            },
          },
          type: 'javascript/auto',
        },
      },
      {
        // 原版oojs-ui/jquery的dist脚本按静态资源URL引入（对照测试用），不做打包执行
        test: /[\\/]node_modules[\\/][^\\/]+[\\/](dist[\\/])?(jquery|oojs|oojs-ui|oojs-ui-wikimediaui)\.js$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        type: 'css/auto',
      },
      {
        test: /\.(png|jpe?g|gif)/,
        type: 'asset/resource',
      },
    ],
  },
  experiments: {
    css: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      'oojs-ui-react': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './tests/index.html',
    }),
    new ReactRefreshPlugin(),
    new rspack.HotModuleReplacementPlugin(),
    new TsCheckerRspackPlugin(),
  ],
  devServer: {
    port: 8090,
    open: true,
  },
  devtool: 'source-map',
});
