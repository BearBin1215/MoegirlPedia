/**
 * @todo 更多统计数据
 * @todo 容错（try catch等）
 * @todo 支持多分类同时查询以减少请求数
 */
import './index.less';

$(() => (async () => {
    if (mw.config.get('wgCanonicalSpecialPageName') !== 'Newpages') {
        return;
    }
    let apiPost = 0;
    await mw.loader.using(['mediawiki.api', 'mediawiki.user', 'oojs-ui']);
    const api = new mw.Api();

    // 构建表单
    const CategoryInput = new OO.ui.TextInputWidget({
        placeholder: '无需名字空间前缀',
    });
    const CategoryLayout = new OO.ui.FieldLayout(CategoryInput, {
        label: '分类名',
        align: 'left',
        classes: ['npic-flex'],
    });
    const periodSelect = new OO.ui.TextInputWidget({
        value: 7,
        label: '天',
    });
    const periodLayout = new OO.ui.FieldLayout(periodSelect, {
        label: '过去',
        align: 'left',
        classes: ['npic-flex'],
    });
    const rclimitInput = new OO.ui.TextInputWidget({
        value: 200,
        label: '个页面',
    });
    const rclimitLayout = new OO.ui.FieldLayout(rclimitInput, {
        label: '最多',
        align: 'left',
        classes: ['npic-flex'],
    });

    const submitButton = new OO.ui.ButtonWidget({
        label: '查询',
        flags: [
            'primary',
            'progressive',
        ],
        icon: 'search',
    });
    const $resultPanel = $('<div id="npic-result"></div>').hide();
    $resultPanel.append($('<h4>查询结果</h4>'));

    const fieldset = new OO.ui.FieldsetLayout({
        label: '统计新条目中属于某分类或其子分类的条目数',
        classes: ['oo-ui-panelLayout-framed', 'oo-ui-panelLayout-padded'],
        id: 'new-page-in-cat',
    });
    fieldset.addItems([
        CategoryLayout,
        periodLayout,
        rclimitLayout,
        submitButton,
    ]);
    fieldset.$element.append($resultPanel);

    /**
     * 获取过去${period}天内最多${rclimit}个新页面
     * 怎么会逝呢，为什么api不接受13位时间戳呢，明明文档写着可以的啊
     * @param {number|string} rclimit 限制数量
     * @param {number} period 查询天数
     * @return {array} 页面信息构成的数组
     */
    const getNewPages = async (rclimit, period) => {
        const rcstart = new Date().getTime();
        const rcend = rcstart - period * 24 * 3600000;
        console.log(`统计时间：${Date()}`);
        const pages = await api.post({
            action: 'query',
            list: 'recentchanges',
            rcend: new Date(rcend).toISOString(),
            rcstart: new Date(rcstart).toISOString(),
            rcnamespace: 0,
            rcshow: '!redirect',
            rclimit,
            rctype: 'new',
        });
        apiPost++;
        return pages.query.recentchanges;
    };

    /**
     * 筛选出未被打回的条目列表
     * @param {array} titles 条目列表
     * @return {array} 筛选后列表
     */
    const pageExist = async (titles) => {
        const filteredPages = [];
        const pageInfo = await api.post({
            action: 'query',
            prop: 'info',
            titles: titles.join('|'),
        });
        apiPost++;
        for (const page of Object.values(pageInfo.query.pages)) {
            if (page.pageid) {
                filteredPages.push(page.title);
            }
        }
        return filteredPages;
    };

    /**
     * 获取页面的直接分类
     * 将多个页面打包获取，减少请求数
     * @param {array} titles 页面列表
     * @return {array} 这些条目所属的直接分类
     */
    const articelCat = async (titles) => {
        const result = await api.post({
            action: 'query',
            prop: 'categories',
            titles: titles.join('|'),
            cllimit: 'max',
        });
        apiPost++;
        const categories = [];
        for (const page of Object.values(result.query.pages)) {
            if (page.categories) {
                for (const item of page.categories) {
                    categories.push(item.title);
                }
            }
        }
        return categories;
    };

    /**
     * 递归主体
     * @param {array} titles 页面名
     * @param {string} category 分类名
     * @return {boolean} 是否属于
     */
    const pageInCat = async (titles, category) => {
        try {
            const categories = await articelCat(titles);
            if (categories.includes(category)) {
                return true;
            }
            if (categories.length === 0) {
                return false;
            }
            return await pageInCat(categories, category);
        } catch (e) {
            console.log(e);
        }
    };

    // 执行体
    submitButton.on('click', async () => {
        $resultPanel.show();
        const UserRights = await mw.user.getRights();
        const category = CategoryInput.getValue();
        const rclimit = rclimitInput.getValue();
        const period = periodSelect.getValue();
        if (category === '') {
            OO.ui.alert('请输入分类名！', {
                title: '提醒',
                size: 'small',
            });
            return;
        }
        if (rclimit > 500 && !UserRights.includes('apihighlimits')) {
            OO.ui.alert('您未持有apihighlimits权限，最多请求500个页面。', {
                title: '提醒',
                size: 'small',
            });
            return;
        } else if (rclimit > 5000) {
            OO.ui.alert('最多请求5000个页面。', {
                title: '提醒',
                size: 'small',
            });
            return;
        }
        $resultPanel.addClass('oo-ui-pendingElement-pending');
        apiPost = 0;
        const pages = await getNewPages(rclimit || 'max', period); // 获取新页面列表
        const pageList = [];
        for (const item of pages) {
            pageList.push(item.title);
        }
        const slicedList = []; // 每组50个进行分组，以便查询超过50个页面
        for (let i = 0; i < pageList.length; i += 50) {
            slicedList.push(pageList.slice(i, i + 50));
        }
        let pageFiltered = []; // 筛选出存在的页面
        for (const subList of slicedList) {
            pageFiltered = [...pageFiltered, ...await pageExist(subList)];
        }
        if (period > 90) {
            $resultPanel.append($('<div>萌娘百科默认保存最近90天的编辑，更早的新条目无法统计。</div>'));
        }
        $resultPanel.append($(`<div>在最新的${pageList.length}个新条目中，有${pageFiltered.length}个未被移动（其他可能被打回）。</div>`));

        let pageCount = 0;
        for (const item of pageFiltered) {
            if (await pageInCat([item], `Category:${category}`)) {
                pageCount++;
                console.log(`${item}：属于`);
            } else {
                console.log(`${item}：不属于`);
            }
        }
        $resultPanel.append($(`<div>其中${pageCount}个属于<a href="/Category:${category}">分类:${category}</a>或其子分类。</div>`));
        console.log(`共计鸿儒${apiPost}个请求`);

        $resultPanel.removeClass('oo-ui-pendingElement-pending');
    });

    // 置入表单
    if (document.getElementsByClassName('mw-htmlform-ooui-wrapper')[0]) {
        $('div.mw-htmlform-ooui-wrapper').after(fieldset.$element); // 高版本
    } else {
        $('form.mw-htmlform').after(fieldset.$element); // 萌百
    }
})());