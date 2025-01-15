import type { Cmtype, ApiQueryResponse } from "@/@types/api";

/**
 * 获取分类成员，有权限用户使用api，无权限用户使用ajax。
 *
 * @param cmtitle 分类名
 * @param cmtype 获取类型
 * @returns 页面列表
 */
const getCategoryMembers = async (cmtitle: string, cmtype: Cmtype[] = ['page', 'subcat', 'file']) => {
  const api = new mw.Api();
  const pageList: string[] = [];
  // 有api权限的用户通过API获取，无权限用户通过ajax获取
  if (mw.config.get('wgUserGroups')!.some((group) => ['bot', 'flood', 'patroller', 'sysop'].includes(group))) {
    let cmcontinue: string | undefined = '';
    while (cmcontinue !== undefined) {
      const result = await api.post({
        action: 'query',
        format: 'json',
        utf8: true,
        list: 'categorymembers',
        cmlimit: 'max',
        cmtitle,
        cmprop: 'title',
        cmtype,
        cmcontinue,
      }) as ApiQueryResponse;
      if (result.query.categorymembers[0]) {
        pageList.push(...result.query.categorymembers.map(({ title }) => title));
      }
      cmcontinue = result.continue?.cmcontinue;
    }
  } else {
    /**
     * 对于未持有对应用户组的用户，通过ajax递归获取分类成员
     * @param {string} link
     */
    const getCategoryMembersByAjax = async (link: string) => {
      const $ajaxResult = $(await $.ajax(link));
      const selector = cmtype.map((type) => {
        switch (type) {
          case 'page':
            return '#mw-pages li a';
          case 'subcat':
            return '#mw-subcategories li a';
          case 'file':
            return '#mw-category-media li a.galleryfilename';
        }
      }).join(',');

      // 将分类内的页面加入列表
      const members = $ajaxResult.find(selector).map((_, ele) => {
        if (ele.classList.contains('CategoryTreeLabel')) {
          return `Category:${$(ele).text()}`;
        } else if (ele.classList.contains('galleryfilename')) {
          return `File:${$(ele).text()}`;
        }
        return $(ele).text();
      }).get();
      pageList.push(...members);

      // 获取下一页分类内页面
      if (cmtype.includes('page')) {
        const $pageContinueLink = $ajaxResult.find('a[href*="&pagefrom="]');
        if ($pageContinueLink.length) {
          await getCategoryMembersByAjax($pageContinueLink.eq(0).attr('href')!);
        }
      }

      // 获取下一页子分类
      if (cmtype.includes('subcat')) {
        const $catContinueLink = $ajaxResult.find('a[href*="&subcatfrom="]');
        if ($catContinueLink.length) {
          await getCategoryMembersByAjax($catContinueLink.eq(0).attr('href')!);
        }
      }

      // 获取下一页分类文件
      if (cmtype.includes('file')) {
        const $catContinueLink = $ajaxResult.find('a[href*="&filefrom="]');
        if ($catContinueLink.length) {
          await getCategoryMembersByAjax($catContinueLink.eq(0).attr('href')!);
        }
      }
    };

    await getCategoryMembersByAjax(`/${cmtitle}?useskin=vector&safemode=1`);
  }
  return pageList;
};

export const traverseCategoryMembers = async (cmtitle: string) => {
  const traversedCategoryList: string[] = [];

  const traverseCategory = async (category: string) => {
    const api = new mw.Api();
    const pageList: string[] = [];
    let gcmcontinue: string | undefined = '';
    while (gcmcontinue !== undefined) {
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
    }
    return [...new Set(pageList)];
  };

  return await traverseCategory(cmtitle);
};

export default getCategoryMembers;
