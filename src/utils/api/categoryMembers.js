/**
 * 获取分类成员，有权限用户使用api，无权限用户使用ajax。
 *
 * @param {string} cmtitle 分类名
 * @param {('page' | 'subcat' | 'file')[]} cmtype 获取类型
 * @returns
 */
const getCategoryMembers = async (cmtitle, cmtype = ['page', 'subcat', 'file']) => {
    const api = new mw.Api();
    const pageList = [];
    // 有api权限的用户通过API获取，无权限用户通过ajax获取
    if (mw.config.get('wgUserGroups').some((group) => ['bot', 'flood', 'patroller', 'sysop'].includes(group))) {
        let cmcontinue = "";
        while (cmcontinue !== undefined) {
            const result = await api.get({
                action: "query",
                list: "categorymembers",
                cmlimit: "max",
                cmtitle,
                cmtype: cmtype.join('|'),
                cmcontinue,
            });
            if (result.query.categorymembers[0]) {
                for (const page of result.query.categorymembers) {
                    pageList.push(page.title);
                }
            }
            cmcontinue = result.continue?.cmcontinue;
        }
    } else {
        /**
         * 对于未持有对应用户组的用户，通过ajax递归获取分类成员
         * @param {string} link
         */
        const getCategoryMembersByAjax = async (link) => {
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
                    await getCategoryMembersByAjax($pageContinueLink.eq(0).attr('href'));
                }
            }

            // 获取下一页子分类
            if (cmtype.includes('subcat')) {
                const $catContinueLink = $ajaxResult.find('a[href*="&subcatfrom="]');
                if ($catContinueLink.length) {
                    await getCategoryMembersByAjax($catContinueLink.eq(0).attr('href'));
                }
            }

            // 获取下一页分类文件
            if (cmtype.includes('file')) {
                const $catContinueLink = $ajaxResult.find('a[href*="&filefrom="]');
                if ($catContinueLink.length) {
                    await getCategoryMembersByAjax($catContinueLink.eq(0).attr('href'));
                }
            }
        };

        await getCategoryMembersByAjax(`/${cmtitle}?action=render`);
    }
    return pageList;
};

export default getCategoryMembers;