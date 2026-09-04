import type { Cmtype, ApiQueryResponse } from "@/types/api";

/** 有权限使用api的用户组 */
const API_ALLOWED_GROUPS = ['bot', 'flood', 'patroller', 'sysop'];

/** ajax抓取分类页时固定的查询参数 */
const FIXED_CATEGORY_PARAMS = {
  useskin: 'vector-2022',
  safemode: '1',
  redirect: 'no',
} as const;

/** ajax方案中各成员类型对应的容器选择器、翻页参数名与命名空间前缀 */
const ajaxMemberMap: Record<Cmtype, { selector: string; continueParam: string; prefix?: string }> = {
  page: { selector: '#mw-pages li a', continueParam: 'pagefrom' },
  subcat: { selector: '#mw-subcategories li a', continueParam: 'subcatfrom', prefix: 'Category:' },
  file: { selector: '#mw-category-media li a.galleryfilename', continueParam: 'filefrom', prefix: 'File:' },
};

/**
 * 构建抓取用分类页链接：补全固定查询参数，可追加指定类型的翻页from
 * @param cmtitle 分类名
 * @param continueParam 翻页参数名
 * @param from 翻页起始值（成员sortkey）
 * @returns 补全参数后的链接
 */
const buildCategoryUrl = (cmtitle: string, continueParam?: string, from?: string): string => {
  const url = new URL(`/${cmtitle}`, location.origin);
  for (const [key, value] of Object.entries(FIXED_CATEGORY_PARAMS)) {
    url.searchParams.set(key, value);
  }
  if (continueParam && from) {
    url.searchParams.set(continueParam, from);
  }
  return url.toString();
};

/**
 * 从分类页HTML中抓取指定类型的成员，带前缀的类型统一补命名空间前缀
 * @param $result 分类页解析后的jQuery对象
 * @param type 成员类型
 * @returns 成员列表
 */
const extractMembers = ($result: JQuery<Node[]>, type: Cmtype): string[] => {
  const { selector, prefix } = ajaxMemberMap[type];
  return $result.find(selector).map((_, ele) => {
    const text = $(ele).text();
    return prefix ? `${prefix}${text}` : text;
  }).get();
};

/**
 * 从分类页HTML中解析指定类型的下一页from值。
 * "下一页"链接携带该参数；"上一页"链接使用pageuntil参数、语言变体链接继承当前from，
 * 均不会产生新候选值；排除当前值与已访问值后剩余的即为"下一页"，末页返回undefined。
 * @param $result 分类页解析后的jQuery对象
 * @param continueParam 翻页参数名
 * @param currentFrom 当前页的from值
 * @param visitedFroms 已请求过的from集合
 * @returns 下一页from值，无则undefined
 */
const resolveNextFrom = ($result: JQuery<Node[]>, continueParam: string, currentFrom: string | undefined, visitedFroms: Set<string>): string | undefined => {
  const nextFroms = $result
    .find(`a[href*="${continueParam}="]:not([href*="dir=prev"])`)
    .map((_, ele) => new URL($(ele).attr('href')!, location.origin).searchParams.get(continueParam) ?? '')
    .get()
    .filter((value) => value !== currentFrom && value !== '' && !visitedFroms.has(value));
  return nextFroms[nextFroms.length - 1];
};

/**
 * 通过ajax抓取分类页获取全部类型的成员。
 * 分类页一次会渲染page/subcat/file三个列表，但URL上只体现其中一种类型的翻页参数，
 * 因此首页由三种类型共享一次请求，此后每种类型独立翻页、只抓取自己容器的成员。
 * @param cmtitle 分类名
 * @param cmtype 成员类型列表
 * @returns 全部成员列表
 */
const fetchCategoryMembers = async (cmtitle: string, cmtype: Cmtype[]): Promise<string[]> => {
  const memberList: string[] = [];
  /** 各类型已请求过的from值，防止重复请求 */
  const visitedFromMap = new Map<Cmtype, Set<string>>();
  /** 各类型的下一页from值 */
  const pendingFromMap = new Map<Cmtype, string | undefined>();

  // 首页请求：三种类型共享同一次响应，避免重复请求相同的首页URL
  // 用$.parseHTML解析并剥离内联script，避免$(htmlString)直接执行脚本
  const $firstResult = $($.parseHTML(await $.ajax(buildCategoryUrl(cmtitle))));
  for (const type of cmtype) {
    const { continueParam } = ajaxMemberMap[type];
    const visitedFroms = new Set<string>();
    memberList.push(...extractMembers($firstResult, type));
    visitedFromMap.set(type, visitedFroms);
    pendingFromMap.set(type, resolveNextFrom($firstResult, continueParam, undefined, visitedFroms));
  }

  // 各类型从各自的下一页起独立翻页，直至无下一页链接
  for (const type of cmtype) {
    const { continueParam } = ajaxMemberMap[type];
    const visitedFroms = visitedFromMap.get(type)!;
    let from = pendingFromMap.get(type);
    while (from) {
      visitedFroms.add(from);
      const $result = $($.parseHTML(await $.ajax(buildCategoryUrl(cmtitle, continueParam, from))));
      memberList.push(...extractMembers($result, type));
      from = resolveNextFrom($result, continueParam, from, visitedFroms);
    }
  }
  return memberList;
};

/**
 * 获取分类成员，API白名单用户组使用本站API，其余用户通过ajax抓取分类页解析DOM。
 *
 * @param cmtitle 分类名
 * @param cmtype 获取类型
 * @returns 页面列表
 */
const getCategoryMembers = async (cmtitle: string, cmtype: Cmtype[] = ['page', 'subcat', 'file']) => {
  const api = new mw.Api();
  const pageList: string[] = [];
  if (mw.config.get('wgUserGroups')!.some((group) => API_ALLOWED_GROUPS.includes(group))) {
    let cmcontinue: string | undefined;
    do {
      const result = await api.post({
        action: 'query',
        format: 'json',
        utf8: true,
        list: 'categorymembers',
        cmlimit: 'max',
        cmtitle,
        cmprop: 'title',
        cmtype,
        ...(cmcontinue ? { cmcontinue } : {}),
      }) as ApiQueryResponse;
      if (result.query.categorymembers[0]) {
        pageList.push(...result.query.categorymembers.map(({ title }) => title));
      }
      cmcontinue = result.continue?.cmcontinue;

    } while (cmcontinue);
  } else {
    pageList.push(...await fetchCategoryMembers(cmtitle, cmtype));
  }
  return pageList;
};

export const traverseCategoryMembers = async (cmtitle: string) => {
  const traversedCategoryList: string[] = [];

  const traverseCategory = async (category: string) => {
    const api = new mw.Api();
    const pageList: string[] = [];
    let gcmcontinue: string | undefined = void 0;
    do {
      const response = await api.post({
        action: 'query',
        generator: 'categorymembers',
        gcmtitle: category,
        gcmtype: 'page|subcat',
        gcmlimit: 'max',
        gcmcontinue,
      }) as ApiQueryResponse;
      gcmcontinue = response.continue?.gcmcontinue;
      for (const { ns, title } of Object.values(response.query.pages)) {
        if (ns === 14 && !traversedCategoryList.includes(title)) {
          traversedCategoryList.push(title); // 避免套娃
          pageList.push(...await traverseCategory(title));
        } else {
          pageList.push(title);
        }
      }
      console.log(`\x1B[4m${category}\x1B[0m下查找到\x1B[4m${pageList.length}\x1B[0m个页面`);
    } while (gcmcontinue !== undefined);
    return [...new Set(pageList)];
  };

  return await traverseCategory(cmtitle);
};

export default getCategoryMembers;
