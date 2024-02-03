const webpack = require('webpack');
const glob = require('glob');
const chalk = require('chalk');
const webpackConfig = require('./webpack.prod');

const { log } = console;

const gadgets = process.argv.slice(2);
let config = webpackConfig;

if (!gadgets.length) {
  log('未指定要打包的工具，即将全部打包……');
} else {
  const sourceFiles = glob.sync(`./src/gadgets/{${gadgets.join(',')},}/index.{js,jsx}`, {
    nocase: true,
  });
  if (!sourceFiles.length) {
    console.error('未找到指定的源代码，请检查拼写。');
    process.exit(1);
  }
  const entry = sourceFiles.map((filename) => filename
    .replace(/\\/g, '/')
    .replace(/^(?:.\/)?(.*)$/, './$1'))
    .reduce((entries, path) => {
      const entry = path.replace('./src/gadgets/', '').replace(/\/index\.(js|jsx)$/, '');
      entries[entry] = path;
      return entries;
    }, {});
  log(`即将打包：${Object.keys(entry).join('、')}`);
  config = {
    ...webpackConfig,
    entry,
  };
}

webpack(config, (err, stats) => {
  if (err) {
    console.error('打包出错：', err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }
  const { compilation: {
    startTime,
    endTime,
    assets,
  } } = stats;

  log(`打包成功，用时${endTime - startTime}ms。`);
  log('输出文件：');
  for (const [file, { _size }] of Object.entries(assets)) {
    log(`  ${chalk.green(file)}：${chalk.yellow((_size / 1024).toFixed(3))} KB (${chalk.underline(_size)}字节)`);
  }
});
