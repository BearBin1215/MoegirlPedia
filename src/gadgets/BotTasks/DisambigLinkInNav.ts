import waitInterval from '@/utils/wait';
import { traverseCategoryMembers } from '@/utils/api';

interface Title {
  title: string;
}

$(() => {

  const api = new mw.Api();

  /** 获取所有消歧义页标题及其重定向 */
  const getDisambigList = async (): Promise<string[]> => {
    try {
      const DisambigList: string[] = [];
      let gcmcontinue = undefined;
      do {
        const catMembers = await api.post({
          action: 'query',
          generator: 'categorymembers',
          prop: 'redirects',
          gcmlimit: 'max',
          rdlimit: 'max',
          gcmtitle: 'Category:消歧义页',
          gcmcontinue,
        });
        gcmcontinue = catMembers.continue?.gcmcontinue;
        for (const item of Object.values(catMembers.query.pages) as (Title & { redirects: Title[] })[]) {
          DisambigList.push(item.title);
          for (const rd of item.redirects || []) { // 加入同时获取到的重定向页面
            DisambigList.push(rd.title);
          }
        }
      } while (gcmcontinue !== undefined);
      return DisambigList;
    } catch (error) {
      throw new Error(`获取消歧义页列表出错：${error}`);
    }
  };


  /**
   * 获取模板内所有链接
   *
   * @param templates 模板列表
   * @param size 单次要获取连接的模板数，填50还是500取决于有没有apihighlimits
   * @returnslinks 各个模板的所有链接组成的对象
   */
  const getLinksInTemplates = async (templates: string[], size = 50) => {
    const linksInTemplates: Record<string, string[]> = {};
    for (let i = 0; i < templates.length; i += size) {
      let plcontinue = undefined;
      do {
        const response = await api.post({
          action: 'query',
          prop: 'links',
          titles: templates.slice(i, i + size).join('|'),
          pllimit: 'max',
          plcontinue,
        });
        plcontinue = response.continue?.plcontinue;
        // 检查模板的所有链接是否在消歧义页列表中
        for (const { title, links } of Object.values(response.query.pages) as (Title & { links: Title[] })[]) {
          linksInTemplates[title] ||= [];
          for (const link of links || []) {
            linksInTemplates[title].push(link.title);
          }
        }
        await waitInterval(5000);
      } while (plcontinue !== undefined);
      console.log(`正在读取模板内的链接（${Math.min(i + size, templates.length)}/${templates.length}）`);
    }
    return linksInTemplates;
  };

  /** 保存到指定页面 */
  const updatePage = async (text: string, title: string) => {
    try {
      await api.postWithToken('csrf', {
        action: 'edit',
        title,
        summary: '自动更新列表',
        text,
        bot: true,
        tags: 'Bot',
      });
      console.log(`成功保存到\x1B[4m${title}\x1B[0m。`);
    } catch (error) {
      throw new Error(`保存到\x1B[4m${title}\x1B[0m失败：${error}`);
    }
  };

  const main = async (retryCount = 5) => {
    let retries = 0;

    while (retries < retryCount) {
      try {
        const DisambigList = await getDisambigList();
        console.log(`获取到\x1B[4m${DisambigList.length}\x1B[0m个消歧义页及其重定向，正在获取所有导航模板……`);

        const templates = await traverseCategoryMembers('Category:导航模板');
        console.log(`获取到\x1B[4m${templates.length}\x1B[0m个模板。正在获取模板中包含的链接……`);

        const linksInTemplates = await getLinksInTemplates(templates, 500);

        // 用于存储模板内的消歧义链接
        const disambigInTemplates: Record<string, string[]> = {};
        // 遍历links
        Object.entries(linksInTemplates).forEach(([key, pages]) => {
          const filteredPages = pages.filter((page) => DisambigList.includes(page)); // 对于linksInTemplates的每个页面，筛选出其中含有消歧义链接的页面
          if (filteredPages.length > 0) {
            disambigInTemplates[key] = (disambigInTemplates[key] || []).concat(filteredPages);
          }
        });
        // 生成wikitext
        const text = [
          '本页面列出[[:Category:导航模板|导航模板]]中的消歧义链接。\n',
          '部分链接可能本意就是链接到消歧义页面，请注意甄别。\n',
          '由机器人于<u>每周四凌晨4:40左右</u>自动更新，其他时间如需更新请[[User_talk:BearBin|联系BearBin]]。',
          '----',
          Object.entries(disambigInTemplates)
            .map(([key, values]) => `;[[${key}]]<span class="plainlinks" style="font-weight:normal">【[{{fullurl:${key}|action=edit}} 编辑]】</span>\n:[[${values.join(']]\n:[[')}]]\n`)
            .join(''),
          '[[Category:萌娘百科数据报告]]',
        ].join('\n');

        await updatePage(text, '萌娘百科:链接到消歧义页面的导航模板');
        return;
      } catch (error) {
        console.error(`获取数据出错：${error}\n正在重试（${retries + 1}/${retryCount}）`);
        retries++;
      }
    }
    throw new Error(`运行失败：已连续尝试${retryCount}次。`);
  };

  main(1);
});
