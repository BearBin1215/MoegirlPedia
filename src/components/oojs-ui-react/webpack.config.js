/** @description webpack配置，用于搭建开发服务器 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** PostCSS配置 */
const postCSSLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [
        ['autoprefixer'],
      ],
    },
  },
};

/** @type {(_: any, argv: any) => (import('webpack').Configuration)} */
module.exports = (_, argv) => {
  return {
    mode: argv.mode,
    entry: path.resolve(__dirname, 'tests/index.tsx'),
    output: {},
    module: {
      rules: [
        {
          test: /\.tsx?$/i,
          exclude: /node_modules/,
          use: ['ts-loader'],
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            'css-loader',
            postCSSLoader,
          ],
        },
        {
          test: /\.less$/i,
          use: [
            'style-loader',
            'css-loader',
            postCSSLoader,
            'less-loader',
          ],
        },
        {
          test: /\.(png|jpe?g|gif)/,
          type: 'asset/resource',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        'oojs-ui-react': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './tests/index.html',
      }),
    ],
    devServer: {
      port: 8090,
      open: true,
      hot: true,
    },
    devtool: 'source-map',
  };
};
