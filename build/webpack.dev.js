const { merge } = require('webpack-merge');
const { resolve } = require('path');
const common = require('./webpack.common');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',
  output: {
    filename: '[name].js',
    path: resolve(__dirname, '../dist/dev'),
  },
  watchOptions: {
    ignored: /node_modules/, // 忽略不需要监听变更的目录
    aggregateTimeout: 1000, // 防止重复保存时频繁重建
  },
});
