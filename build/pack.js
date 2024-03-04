const webpack = require('webpack');
const glob = require('glob');
const chalk = require('chalk');
const webpackConfig = require('./webpack.prod');

const { log } = console;

const gadgets = process.argv.slice(2); // 读取命令行输入的工具名
let config; // 打包配置

if (!gadgets.length) {
  log('未指定要打包的工具，即将全部打包……');
  config = webpackConfig;
} else {
  // 根据输入读取src/gadgets中的文件
  const sourceFiles = glob.sync(`./src/gadgets/{${gadgets.join(',')},}/index.{js,jsx,ts,tsx}`);
  // 没读取到多半是拼写错误
  if (!sourceFiles.length) {
    console.error('未找到指定的源代码，请检查拼写。');
    process.exit(1);
  }
  const entry = sourceFiles.map((filename) => filename
    .replace(/\\/g, '/') // windows系统反斜杠换成正斜杠
    .replace(/^(?:.\/)?(.*)$/, './$1'))
    .reduce((entries, path) => {
      const entry = path.replace('./src/gadgets/', '').replace(/\/index\.(js|jsx|ts|tsx)$/, '');
      entries[entry] = path;
      return entries;
    }, {});
  log(`即将打包：${Object.keys(entry).join('、')}`);
  config = {
    ...webpackConfig,
    entry,
  };
}

// 执行打包
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
    errors,
  } } = stats;

  if (errors.length) {
    console.error('打包出错', errors);
    return;
  }

  log(`打包成功，用时${endTime - startTime}ms。`);
  log('输出文件：');
  for (const [file, { _size }] of Object.entries(assets)) {
    log(`- ${chalk.green(`dist/gadgets/${file}`)}: ${chalk.yellow((_size / 1024).toFixed(3))}KB (${chalk.underline(_size)}字节)`);
  }
});
