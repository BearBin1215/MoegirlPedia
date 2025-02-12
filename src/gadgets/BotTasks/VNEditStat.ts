import waitInterval from '@/utils/wait';
import { pageSource } from "@/utils/api";

mw.loader.using([
  'mediawiki.api',
  'moment',
]).then(() => {
  const api = new mw.Api();

  const title = 'User:BearBin/视研会30日编辑数统计';//  要编辑的页面
  const template = 'Template:萌百视觉小说研究会';//  名单获取来源，不要更改！
  const timeLength = 30;//  时间范围（天）
  const ucnamespace = '0|10|14|828';//  有效的名字空间

  const ucstart = moment().unix();
  const ucend = moment().subtract(timeLength, 'days').unix();

  /**
   * 源代码获取用户列表
   * @param {string} source 源代码
   */
  const getUserList = (source) => {
    const list = source
      .replace(/.*<!-- *列表起点 *-->(.*)<!-- *列表终点 *-->.*/gs, '$1') // 识别列表起点终点
      .replace(/<!--[\s\S]*?-->/g, '') // 去除注释
      .replace(/\* */g, '') // 去除无序列表头
      .trim()
      .split('\n') // 分割为数组
      .map((str) => {
        const match = str.trim().match(/^([^<(]*)(\(([^)]*)\))?(<.*>)?$/); // 解析昵称和下标
        return match[1];
      });
    return list;
  };

  /**
   * 获取用户指定时间内的编辑量
   * @returns
   */
  const getEditCount = async (ucuser, maxRetry = 5) => {
    let retryCount = 0;
    while (retryCount < maxRetry) {
      try {
        const { query: { usercontribs } } = await api.post({
          action: 'query',
          list: 'usercontribs',
          uclimit: 'max',
          ucprop: '',
          ucstart,
          ucend,
          ucnamespace,
          ucuser,
        });
        return usercontribs.length;
      } catch (error) {
        console.error(`获取用户编辑数出错：${error}，即将重试(${++retryCount}/${maxRetry})`);
        await waitInterval(3000);
      }
    }
  };

  const main = async () => {
    const source = await pageSource(template);
    const userList = getUserList(source);
    const editCountData: { user: string, editCount: number }[] = [];
    for (const user of userList) {
      const editCount = await getEditCount(user);
      console.log(`${user}: ${editCount}`);
      editCountData.push({
        user,
        editCount,
      });
      await waitInterval(4000);
    }
    const text = `*本页面为机器人生成的[[T:萌百视觉小说研究会|视研会]]成员30日内编辑数统计（主<code>(namespace=0)</code>、分类<code>(category:)</code>、模板<code>(template:)</code>、模块<code>(module:)</code>）\n*生成时间：{{subst:#time:Y年n月j日 (D) H:i (T)|||1}}｜{{subst:#time:Y年n月j日 (D) H:i (T)}}\n` +
      `<center>\n` +
      `{| class="wikitable sortable"\n` +
      `! 用户名 !! 30日编辑数\n|-\n${editCountData.map(({ user, editCount }) => `| [[User:${user}|${user}]] || ${editCount}`).join('\n|-\n')
      }\n|}\n</center>`;//  提交到页面的内容
    await api.postWithToken('csrf', {
      action: 'edit',
      title,
      summary: '自动更新列表', //  编辑摘要:自动更新列表,半自动更新列表,本次为手动更新
      text,
      bot: true,
      tags: 'Bot', // 标签:Bot,Automation tool
    });
  };

  main();
});
