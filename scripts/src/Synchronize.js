import fs from 'fs';
import MWBot from 'mwbot';
import config from './config.js';
import { execSync } from 'child_process';

// 获取最近一次提交所修改的页面
const changedGadgets = execSync('git diff-tree --no-commit-id --name-only -r HEAD^ HEAD')
  .toString()
  .split('\n')
  .filter((fileName) => fileName.includes('dist/gadgets/'))
  .map((fileName) => fileName.replace(/dist\/gadgets\/(.*)\.min\.js/, '$1'));

const list = config.sync.list.filter((gadgetName) => changedGadgets.includes(gadgetName)); // 同步工具列表

const maxRetry = 5; // 最大重试次数

if (!list.length) {
  console.log('列表中无小工具发生变化。');
} else {
  console.log(`发生变化的工具：${list.join('、')}。即将开始同步。`);

  const waitInterval = (time) => new Promise((resolve) => setTimeout(resolve, time));

  const bot = new MWBot({
    apiUrl: config.API_PATH,
  }, {
    timeout: 90000,
  });

  // 获取最近一次提交的消息
  const lastCommitMessage = execSync('git log -1 --pretty=%s').toString();

  // 执行同步
  await bot.loginGetEditToken({
    username: config.username,
    password: config.password,
  });
  console.log('登陆成功，开始同步');
  const errorList = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const title = `${config.sync.pagePath + item}.js`;
    const source = await fs.promises.readFile(`${config.sync.localPath + item}.min.js`, 'utf-8');
    const text = `var _addText = '{{Documentation|content=* 工具介绍见[[User:BearBin/js#${item}]]。\\n* 源代码见[https://github.com/BearBin1215/MoegirlPedia/blob/master/src/gadgets/${item} GitHub]。}}';\n\n// <nowiki>\n\n${source}\n\n// </nowiki>`;
    for (let j = 0; j <= maxRetry;) {
      try {
        const res = await bot.request({
          action: 'edit',
          title,
          text,
          summary: `同步GitHub更改：${lastCommitMessage}`,
          bot: true,
          tags: 'Bot',
          token: bot.editToken,
        });
        if (res.edit.nochange === '') {
          console.log(`${title}保存前后无变化。`);
        } else {
          console.log(`${item}已保存至${title}`);
        }
        break;
      } catch (e) {
        console.log(`${item}同步失败：${e}`);
        j++;
        if (j <= maxRetry) {
          console.log(`正在重试（${j}/${maxRetry}）`);
        } else {
          errorList.push(item);
        }
        continue;
      }
    }
    if (i < list.length) {
      await waitInterval(6000);
    }
  }
  if (errorList.length > 0) {
    throw new Error(`部分工具打包失败：\n${errorList.join('\n')}`);
  }
}
