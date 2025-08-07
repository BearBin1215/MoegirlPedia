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
        },
        type: 'javascript/auto',
      },
      {
        test: /\.(css|less)$/,
        type: 'css/auto',
        use: ['less-loader'],
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
