import path from 'path';
import { fileURLToPath } from 'url';
import { rspack } from '@rspack/core';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('@rspack/core').RspackOptions} */
export default {
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
        test: /\.css$/i,
        type: 'css/auto',
      },
      {
        test: /\.less$/,
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
  ],
  devServer: {
    port: 8090,
    open: true,
    hot: true,
  },
  devtool: 'source-map',
};
