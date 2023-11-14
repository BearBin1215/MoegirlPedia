const { merge } = require('webpack-merge');
const { resolve } = require('path');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  output: {
    filename: '[name].js',
    path: resolve(__dirname, '../dist/dev'),
  },
});