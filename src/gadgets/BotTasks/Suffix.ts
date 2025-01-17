/**
 * 用于更新[[萌娘百科:疑似多余消歧义后缀]]
 */

const whiteList = [
  'Bilibili Moe 2016 动画角色人气大赏',
  'Bilibili Moe 2017 动画角色人气大赏',
  'Bilibili Moe 2018 动画角色人气大赏',
  'L!L!L!',
  'L！L！L！',
  '碧蓝航线/图鉴/',
];

const api = new mw.Api();

/**
 * 获取所有页面标题
 * @returns 页面列表
 */
const getAllPages = async (): Promise<Set<string>> => {
  const PageList = new Set<string>();
  let apcontinue: string | boolean = '';
  while (apcontinue !== false) {
    try {
      const allPages = await api.post({
        action: 'query',
        list: 'allpages',
        aplimit: 'max',
        apcontinue,
      });
      apcontinue = allPages.continue?.apcontinue || false;
      for (const page of allPages.query.allpages) {
        PageList.add(page.title);
      }
      console.log(`已获取${PageList.size}个页面`);
    } catch (error) {
      throw new Error(`获取全站主名字空间页面列表出错：${error}`);
    }
  }
  return PageList;
};

/**
 * 根据页面列表分析出多余的消歧义后缀
 * @param PageList 页面列表
 * @returns 疑似多余消歧义后缀列表
 */
const getAbsentList = (PageList: Set<string>): string[] => {
  const AbsentList: string[] = [];
  for (const title of PageList) {
    if (
      title.slice(-1) === ')' &&
      title[0] !== '(' &&
      (!title.includes(':') || title.indexOf(':') > title.indexOf('('))
    ) {
      const titleWithoutSuffix = title.replace(/\(.*\)/, '').trim();
      if (
        !PageList.has(titleWithoutSuffix) &&
        !whiteList.some((item) => title.indexOf(item) === 0)
      ) {
        AbsentList.push(`* [[${title}]]→[[${titleWithoutSuffix}]]`);
      }
    }
  }
  return AbsentList;
};


interface RedirectData {
  from: string;
  to: string;
}

/**
 * 获取全站重定向页面列表，分析得到后缀重定向至无后缀和无后缀重定向至后缀
 * @returns [ 后缀重定向至无后缀, 无后缀重定向至后缀 ]
 */
const getRedirects = async (): Promise<[string[], string[]]> => {
  const Suffix2Origin: string[] = [];
  const Origin2Suffix: string[] = [];
  let garcontinue: string | boolean = '|';
  while (garcontinue !== false) {
    try {
      const allRedirects = await api.post({
        action: 'query',
        generator: 'allredirects',
        redirects: true,
        garlimit: 'max',
        garcontinue,
      });
      garcontinue = allRedirects.continue?.garcontinue || false;
      for (const item of Object.values(allRedirects.query.redirects as Record<string, RedirectData>)) {
        // 后缀重定向至无后缀
        if (item.from.replace(/^(.*)\(.*\)$/, '$1') === item.to) {
          Suffix2Origin.push(`* [{{canonicalurl:${item.from}|redirect=no}} ${item.from}]→[[${item.to}]]`);
        }
        // 无后缀重定向至后缀
        if (item.from === item.to.replace(/^(.*)\(.*\)$/, '$1')) {
          Origin2Suffix.push(`* [{{canonicalurl:${item.from}|redirect=no}} ${item.from}]→[[${item.to}]]`);
        }
      }
    } catch (error) {
      throw new Error(`获取重定向页面时出错：${error}`);
    }
  }
  return [Suffix2Origin, Origin2Suffix];
};

/**
 * 编辑保存
 * @param absentList 后缀存在、无后缀不存在的标题列表
 * @param suffix2origin 有后缀重定向到无后缀列表
 * @param origin2suffix 无后缀重定向到有后缀列表
 */
const updatePage = async (absentList: string[], suffix2origin: string[], origin2suffix: string[]) => {
  const PAGENAME = '萌娘百科:疑似多余消歧义后缀';
  const text = [
    '本页面列举疑似多余的消歧义后缀，分为三类：',
    '# “FOO(BAR)”存在，“FOO”不存在；',
    '# “FOO(BAR)”重定向到“FOO”；',
    '# “FOO”重定向到“FOO(BAR)”。',
    '本页面由机器人于每周一凌晨4:40左右自动更新，其他时间如需更新请[[User_talk:BearBin|联系BearBin]]。',
    '',
    '__TOC__<div class="plainlinks>' +
    '',
    '== 后缀存在、无后缀不存在 ==',
    absentList.join('\n'),
    '',
    '== 有后缀重定向到无后缀 ==',
    '',
    suffix2origin.join('\n'),
    '',
    '== 无后缀重定向到有后缀 ==',
    '',
    origin2suffix.join('\n'),
    '</div>',
    '[[Category:萌娘百科数据报告]][[Category:积压工作]]',
  ].join('\n');

  try {
    await api.postWithToken('csrf', {
      action: 'edit',
      title: PAGENAME,
      text,
      summary: '自动更新列表',
      bot: true,
      tags: 'Bot',
    });
    console.log(`成功保存到\x1B[4m${PAGENAME}\x1B[0m。`);
  } catch (error) {
    throw new Error(`保存到\x1B[4m${PAGENAME}\x1B[0m失败：${error}`);
  }
};

/**
 * 主函数
 * @param retryCount 重试次数
 */
const main = async (retryCount = 5) => {
  let retries = 0;
  while (retries < retryCount) {
    try {
      // await api.login();
      // console.log('登录成功。正在获取所有页面……');

      const allPages = await getAllPages();
      const absentList = getAbsentList(allPages);
      console.log(`获取到\x1B[4m${absentList.length}\x1B[0m个疑似多余的消歧义后缀页面。`);

      const [suffix2origin, origin2suffix] = await getRedirects();
      console.log(`获取到\x1B[4m${suffix2origin.length}\x1B[0m个后缀重定向至无后缀，\x1B[4m${origin2suffix.length}\x1B[0m个无后缀重定向至后缀。`);

      await updatePage(absentList, suffix2origin, origin2suffix);
      return;
    } catch (error) {
      console.error(`获取数据出错，正在重试（${retries + 1}/${retryCount}）：${error}`);
      retries++;
    }
  }
  throw new Error(`运行失败：已连续尝试${retryCount}次。`);
};

main(1);
