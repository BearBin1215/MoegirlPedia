import { pageSource } from "@/utils/api";

$(() => {
  const api = new mw.Api();

  /**
   * 获取所有页面标题
   * @returns 页面列表
   */
  const getAllPages = async (): Promise<string[]> => {
    const pageList = new Set<string>();
    let apcontinue: string | false = false;
    do {
      try {
        const allPages = await api.post({
          action: 'query',
          list: 'allpages',
          aplimit: 'max',
          apcontinue,
        });
        apcontinue = allPages.continue?.apcontinue || false;
        for (const page of allPages.query.allpages) {
          pageList.add(page.title);
        }
        console.log(`已获取${pageList.size}个页面`);
      } catch (error) {
        throw new Error(`获取全站主名字空间页面列表出错：${error}`);
      }
    } while (apcontinue);
    return [...pageList];
  };

  const getWhiteList = async () => {
    try {
      const source = await pageSource('User:BearBin/可能需要改为全角标点标题的页面/排除页面');
      const list = source!
        .replaceAll('{{用户 允许他人编辑}}', '')
        .replaceAll(/\* *\[\[(.+)\]\]/g, '$1')
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item);
      return list;
    } catch (error) {
      throw new Error(`获取白名单失败：${error}`);
    }
  };

  const submitResult = async (pageList: string[], whiteList: string[]) => {
    const PAGENAME = 'User:BearBin/可能需要改为全角标点标题的页面';
    const badList: string[] = [];
    for (const page of pageList) {
      if (
        /[\u4e00-\u9fa5\u3040-\u30ff][!?,]/.test(page) &&
        !page.includes('BanG Dream!') &&
        !whiteList.includes(page)
      ) {
        badList.push(page);
      }
    }

    const text = `{{info|列表中部分属于“原文如此”，请注意判别。如有此类页面，欢迎前往[[/排除页面]]添加。}}-{\n* [[${badList.join(']]\n* [[')}]]\n}-`;

    try {
      const csrftoken = await api.getToken('csrf');
      await api.post({
        action: 'edit',
        title: PAGENAME,
        text,
        summary: '自动更新列表',
        bot: true,
        tags: 'Bot',
        token: csrftoken,
      });
      console.log(`成功保存到\x1B[4m${PAGENAME}\x1B[0m。`);
    } catch (error) {
      throw new Error(`保存到\x1B[4m${PAGENAME}\x1B[0m失败：${error}`);
    }
  };

  const main = async (retryCount = 5) => {
    let retries = 0;
    while (retries < retryCount) {
      try {
        const pageList = await getAllPages();
        console.log(`获取到${pageList.length}个页面。`);

        const whiteList = await getWhiteList();
        console.log(`从白名单中获取到${whiteList.length}个页面。`);

        await submitResult(pageList, whiteList);
        return;
      } catch (error) {
        console.error(`获取数据出错，正在重试（${retries + 1}/${retryCount}）：${error}`);
        retries++;
      }
    }
    throw new Error(`运行失败：已连续尝试${retryCount}次。`);
  };

  main(1);
});
