/**
 * 获取分类成员，有权限用户使用api，无权限用户使用ajax。
 * 
 * @param {string} category 
 * @returns 
 */
const getCategoryMembers = async (category) => {
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
                cmtitle: category,
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
        const getCategoryMembersByAjax = async (link) => {
            const ajaxResult = await $.ajax(link);
            // 将分类内的页面加入列表
            const members = $(ajaxResult).find('li a').map((_, ele) => {
                if (ele.classList.contains('CategoryTreeLabel')) {
                    return `Category:${$(ele).text()}`;
                }
                return $(ele).text();
            }).get();
            pageList.push(...members);

            // 获取下一页分类内页面
            const $pageContinueLink = $(ajaxResult).find('a[href*="&pagefrom="]');
            if ($pageContinueLink.length > 0) {
                await getCategoryMembersByAjax($pageContinueLink.eq(0).attr('href'));
            }

            // 获取下一页子分类
            const $catContinueLink = $(ajaxResult).find('a[href*="&subcatfrom="]');
            if ($catContinueLink.length > 0) {
                await getCategoryMembersByAjax($catContinueLink.eq(0).attr('href'));
            }
        };
        await getCategoryMembersByAjax(`/${category}?action=render`);
    }
    return pageList;
};

export default getCategoryMembers;