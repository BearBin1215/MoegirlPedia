import { sync as globSync } from 'glob';
import chalk from 'chalk';
import { type RspackOptions, rspack } from '@rspack/core';
import rspackConfig from '../rspack.config';

/** 命令行内输入的要打包的小工具名 */
const gadgets = [...new Set(process.argv.slice(2))];

let config: RspackOptions;

if (!gadgets.length) {
  console.log('未指定要打包的工具，即将全部打包……');
  config = rspackConfig(void 0, { mode: 'production' }) as RspackOptions;
} else {
  /** 根据输入的工具名生成glob匹配规则 */
  const entryGlobString = `./src/gadgets/{${gadgets.join(',')},}/index.{js,jsx,ts,tsx}`;
  /** 能匹配到文件的小工具名 */
  const matchedGadgets = globSync(entryGlobString).map((file) => file.replace(
    /src[/\\]gadgets[/\\](.*)[/\\]index\..*$/,
    '$1',
  ));
  // 输入的小工具名和匹配到的不一致，报错并退出
  if (matchedGadgets.length !== gadgets.length) {
    const unmatchedGadgets = gadgets.filter((gadget) =>
      !matchedGadgets.includes(gadget),
    );
    console.error(`未找到以下工具的源代码：${unmatchedGadgets.join('、')}`);
    process.exit(1);
  }

  console.log(`即将打包：${matchedGadgets.join('、')}`);
  config = rspackConfig(void 0, { mode: 'production' }, entryGlobString) as RspackOptions;
}

// Rspack 打包执行
const compiler = rspack(config);
compiler.run((err, stats) => {
  if (err) {
    console.error('打包出错：', err.stack || err);
    process.exitCode = 1;
    compiler.close(() => {});
    return;
  }

  if (stats?.hasErrors()) {
    console.error('打包出错：', stats.toString('errors-only'));
    process.exitCode = 1;
    compiler.close(() => {});
    return;
  }

  const info = stats!.toJson({ assets: true });
  console.log(`打包成功，用时${info.time}ms。`);
  console.log('输出文件：');

  info.assets!.forEach((asset) => {
    const size = chalk.yellow((asset.size / 1024).toFixed(3));
    console.log(`- ${chalk.green(`dist/gadgets/${asset.name}`)}: ${size}KB (${chalk.underline(asset.size)}字节)`);
  });
  compiler.close((closeErr) => {
    if (closeErr) {
      console.error('关闭编译器出错：', closeErr);
      process.exitCode = 1;
    }
  });
});
