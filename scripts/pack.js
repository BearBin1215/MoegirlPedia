import { rspack } from '@rspack/core';
import { sync as glob } from 'glob';
import chalk from 'chalk';
import webpackConfig from '../rspack.config.mjs';

// eslint-disable-next-line no-undef
const gadgets = process.argv.slice(2);

/** @type {import('@rspack/core').Configuration} */
let config;

if (!gadgets.length) {
  console.log('未指定要打包的工具，即将全部打包……');
  config = webpackConfig(void 0, { mode: 'production' });
} else {
  const sourceFiles = glob(`./src/gadgets/{${gadgets.join(',')},}/index.{js,jsx,ts,tsx}`);
  if (!sourceFiles.length) {
    console.error('未找到指定的源代码，请检查拼写。');
    // eslint-disable-next-line no-undef
    process.exit(1);
  }

  const entry = sourceFiles.reduce((entries, path) => {
    const normalizedPath = path.replace(/\\/g, '/').replace(/^(?:.\/)?(.*)$/, './$1');
    const gadgetName = normalizedPath.replace('./src/gadgets/', '').replace(/\/index\.(js|jsx|ts|tsx)$/, '');
    entries[gadgetName] = normalizedPath;
    return entries;
  }, {});

  console.log(`即将打包：${Object.keys(entry).join('、')}`);
  config = {
    ...webpackConfig(void 0, { mode: 'production' }),
    entry,
  };
}

// Rspack 打包执行
const compiler = rspack(config);
compiler.run((err, stats) => {
  if (err) {
    console.error('打包出错：', err.stack || err);
    return;
  }

  if (stats?.hasErrors()) {
    console.error('打包出错：', stats.toString('errors-only'));
    return;
  }

  const info = stats.toJson(void 0);
  console.log(`打包成功，用时${info.time}ms。`);
  console.log('输出文件：');

  info.assets.forEach((asset) => {
    console.log(`- ${chalk.green(`dist/gadgets/${asset.name}`)}: ${chalk.yellow((asset.size / 1024).toFixed(3))}KB (${chalk.underline(asset.size)}字节)`);
  });
});
