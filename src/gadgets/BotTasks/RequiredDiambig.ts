mw.loader.using([
  'mediawiki.api',
]).then(() => {
  const api = new mw.Api();

  /**
   * 获取所有消歧义页标题及其重定向
   * @returns {Promise<Set<string>>} 消歧义页标题及其重定向列表
   */
  const getDisambigList = async () => {
    try {
      const DisambigList = new Set();
      let gcmcontinue: string | false = false;
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
        gcmcontinue = catMembers.continue?.gcmcontinue || false;
        for (const item of Object.values(catMembers.query.pages) as any) {
          DisambigList.add(item.title.replace('(消歧义页)', '')); // 去掉(消歧义页)后缀再加入列表，以免误判
          for (const rd of item.redirects || []) { // 加入同时获取到的重定向页面
            DisambigList.add(rd.title);
          }
        }
      } while (gcmcontinue !== false);
      return DisambigList;
    } catch (error) {
      throw new Error(`获取消歧义页列表出错：${error}`);
    }
  };

  /**
   * 获取所有条目标题（排除重定向）
   * @returns {Promise<string[]>} 所有条目标题列表
   */
  const getPageList = async () => {
    const PageList: string[] = [];
    let apcontinue: string | false = '';
    while (apcontinue !== false) {
      const allPages = await api.post({
        action: 'query',
        list: 'allpages',
        aplimit: 'max',
        apcontinue,
        apfilterredir: 'nonredirects',
      });
      apcontinue = allPages.continue?.apcontinue || false;
      for (const page of allPages.query.allpages) {
        PageList.push(page.title);
      }
    }
    return PageList;
  };

  /**
   * 获取需要建立的消歧义页面
   * @param {Set<string>} DisambigList 消歧义页标题及其重定向列表
   * @param {string[]} PageList 所有条目标题列表
   * @returns {string[]} 需要建立的消歧义页面列表
   */
  const getRequiredDisambig = (DisambigList, PageList) => {
    const RequiredDisambig: Record<string, string[]> = {};
    // 遍历所有页面标题
    for (const item of PageList) {
      // const SuffixPattern = /^([^:]+)\((.+)\)$/; // 后缀页面规则：以半角括号对结尾，括号前无半角冒号
      // const titleWithoutSuffix = item.replace(SuffixPattern, "$1");
      // const titleWithoutPrefix = item.replace(/^(.+):(.+)$/, "$2");
      const titleWithouFix = item
        .replace(/\d:\d{2}([^\d]*)/, '$1') // 排除时间
        .replace(/^([^(]+:)?([^:)]+)(\(.+\))?$/, '$2');
      if (
        // SuffixPattern.test(item) && // 标题带有后缀
        // !["单曲", "专辑"].includes(item.replace(SuffixPattern, "$2")) && // 排除特定后缀
        !DisambigList.has(titleWithouFix) && // 去掉前缀的页面不是消歧义页
        !item.includes('闪耀幻想曲:')
      ) {
        RequiredDisambig[titleWithouFix] ||= [];
        RequiredDisambig[titleWithouFix].push(item);
      }
    }

    return Object.entries(RequiredDisambig).filter(([_key, value]) => {
      return (
        value.length > 1 &&
        !(
          value.length === 2 &&
          value[0].replace(/\((单曲|专辑|音乐专辑)\)/, '') === value[1].replace(/\((单曲|专辑|音乐专辑)\)/, '') // 仅两个条目且互为单曲专辑
        ) &&

        // 一些专题内互相消歧义
        !value.every((item) => item.match(/^东方/)) &&
        !value.every((item) => item.match(/^Bilibili Moe \d{4} 动画角色人气大赏/)) &&

        !value.every((item) => item.includes('美少女花骑士:')) &&
        !value.every((item) => item.includes('碧蓝航线:')) &&
        !value.every((item) => item.includes('碧蓝航线/')) &&
        !value.every((item) => item.includes('工作细胞:')) &&
        !value.every((item) => item.includes('假面骑士')) &&
        !value.every((item) => item.includes('舰队Collection:')) &&
        !value.every((item) => item.includes('舰队Collection/')) &&
        !value.every((item) => item.includes('偶像大师')) &&
        !value.every((item) => item.includes('START:DASH!!')) &&
        !value.every((item) => item.includes('魂器学院:')) &&
        !value.every((item) => item.includes('黑塔利亚:')) &&
        !value.every((item) => item.includes('我的魔塔:')) &&
        !value.every((item) => item.includes('喜羊羊与灰太狼')) &&
        !value.every((item) => item.includes('植物大战僵尸')) &&
        !value.every((item) => item.includes('狗肉(辐射')) &&
        !value.every((item) => item.includes('极品飞车:最高通缉')) &&
        !value.every((item) => item.includes('白猫Project:')) &&
        !value.every((item) => item.includes('Aqours CHRONICLE (')) &&
        !value.every((item) => item.includes('决战平安京') || item.includes('百闻牌') || item.includes('阴阳师手游') || item.includes('妖怪屋')) && // 阴阳师系列

        // 一些角色消歧义
        !value.every((item) => item.includes('木之本樱')) &&
        !value.every((item) => item.includes('爱蜜莉雅')) &&

        // 其他
        !value.every((item) => item.includes('中国'))
      );
    }).map(([key, value]) => `;[[${key}]]\n: [[${value.join(']]\n: [[')}]]`);
  };

  /**
   * 保存到指定页面
   */
  const updatePage = async (TextList) => {
    const PAGENAME = 'User:BearBin/可能需要创建的消歧义页面';
    const text =
      `{{info\n` +
      `|leftimage=[[File:Nuvola_apps_important_blue.svg|50px|link=萌娘百科:消歧义方针]]\n` +
      `|仅供参考、慎重处理，别真一个个无脑建过去了。\n` +
      `}}\n${TextList.join('\n')}`;

    try {
      await api.postWithToken('csrf', {
        action: 'edit',
        title: PAGENAME,
        summary: '自动更新列表',
        text,
        bot: true,
        tags: 'Bot',
      });
      console.log(`成功保存到\x1B[4m${PAGENAME}\x1B[0m`);
    } catch (error) {
      throw new Error(`保存到\x1B[4m${PAGENAME}\x1B[0m失败：${error}`);
    }
  };

  /**
   * 主函数
   * @param {number} retryCount 重试次数
   */
  const main = async (retryCount = 5) => {
    let retries = 0;
    while (retries < retryCount) {
      try {
        const [DisambigList, PageList] = await Promise.all([getDisambigList(), getPageList()]);
        console.log(`获取到\x1B[4m${DisambigList.size}\x1B[0m个消歧义页面及其重定向，\x1B[4m${PageList.length}\x1B[0m个条目标题。`);
        const TextList = getRequiredDisambig(DisambigList, PageList);
        console.log('获取完成，即将保存。');

        await updatePage(TextList);
        return;
      } catch (err) {
        console.error(`获取数据出错，正在重试（${retries + 1}/${retryCount}）：${err}`);
        retries++;
      }
    }
    throw new Error(`运行失败：已连续尝试${retryCount}次。`);
  };
  main(5);
});
