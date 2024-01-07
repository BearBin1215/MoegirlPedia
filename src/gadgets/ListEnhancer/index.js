import { categoryMembers } from "../../utils/api";

mw.loader.using(['mediawiki.notification', 'mediawiki.api']).done(() => {
    /**
     * 执行复制操作
     * @param {string} content 要复制的内容
     * @param {JQuery<HTMLElement>} $element 要改变文字的元素
     * @param {string} successText 复制成功显示的文字
     * @param {string} errorText 复制失败显示的文字
     */
    const copyAction = (content, $element, successText = '复制成功', errorText = '复制失败') => {
        const buttonText = $element.text();
        navigator.clipboard.writeText(content).then(() => {
            $element.text(successText);
            setTimeout(() => $element.text(buttonText), 3000); // 恢复内容
        }, (err) => {
            $element.text(errorText);
            mw.notify(`复制失败: ${err}`, {
                type: 'error',
                autoHideSeconds: 'long',
            });
            setTimeout(() => $element.text(buttonText), 3000);
        });
    };

    if (mw.config.get('wgNamespaceNumber') === -1) {
        // Special:链入页面
        const linkshereEnhance = () => {
            $('#mw-content-text>p>strong').after($('<a>[复制列表]</a>').on('click', ({ target }) => {
                const linkList = [];
                $('#mw-whatlinkshere-list>li>a').each((_, ele) => {
                    linkList.push($(ele).text());
                });
                copyAction(linkList.join('\n'), $(target), '[复制成功]', '[复制失败]');
            }).css('padding-left', '.6em'));
        };

        // Special:搜索
        const searchEnhance = () => {
            mw.loader.addStyleTag('.search-types{display:flex;float:none;align-items:center;}#bearbintools-searchplus{padding:.5em;user-select:none;}#bearbintools-searchplus a{display:inline;padding:0;}.searchplus-edit{margin-left:.5em;float:right;}');
            let showDetail = true;
            const linkList = [];

            // 复制一个按钮插入到多媒体搜索后面，用于搜索要用于替换的页面
            const $searchMedia = $('.search-types li').eq(1);
            const $nsToReplace = $searchMedia.clone(false);
            $nsToReplace.children('a')
                .text('替换空间')
                .attr('title', '主、模板等替换常用名字空间')
                .attr('href', (_, attr) => attr.replace('profile=images', 'profile=advanced&limit=500&ns0=1&ns2=1&ns6=1&ns10=1&ns12=1&ns14=1&ns828=1')); // 太多了超时，所以500
            $nsToReplace.insertAfter($searchMedia);

            // 在搜索结果的每个页面后添加编辑按钮，顺带存一个linkList列表用于后续复制列表
            $('a[data-serp-pos]').each((_, ele) => {
                linkList.push(decodeURIComponent($(ele).attr('href')).replace('/', '').replaceAll('_', ' '));
                $(ele).before(`<a class="searchplus-edit" href="${ele.href}?action=edit">[编辑]</a>`);
            });

            // 添加详情开关和复制列表按钮
            const $detailToggle = $('<a>隐藏详情</a>').on('click', (e) => {
                if (showDetail) {
                    $('.searchresult, .mw-search-result-data').hide(); // 隐藏除标题以外的详情
                    $('.mw-search-results li').css('padding-bottom', '0.1em'); // 间距很大，需要控制
                    $(e.target).text('显示详情');
                    showDetail = false;
                } else {
                    $('.searchresult, .mw-search-result-data').show();
                    $('.mw-search-results li').css('padding-bottom', '');
                    $(e.target).text('隐藏详情');
                    showDetail = true;
                }
            });
            const $copyList = $('<a>复制列表</a>').on('click', (e) => {
                copyAction(linkList.join('\n'), $(e.target));
            });

            // 把按钮放到输入条下方的名字空间选择右侧
            $('#search .search-types, #powersearch .search-types').append($('<div id="bearbintools-searchplus"></div>').append(
                '<span class="mw-editsection-bracket">[</span>',
                $detailToggle,
                '<span class="mw-editsection-divider"> | </span>',
                $copyList,
                '<span class="mw-editsection-bracket">]</span>',
            ));

            // 把下方翻页条复制一份到上面
            $('.mw-search-pager-bottom').clone().prependTo($('.searchresults'));
        };

        // 根据特殊页面进行显示
        switch (mw.config.get('wgCanonicalSpecialPageName')) {
            case "Whatlinkshere":
                linkshereEnhance();
                break;
            case "Search":
                searchEnhance();
                break;
        }
    } else if (mw.config.get('wgNamespaceNumber') === 14) {
        const $subCategories = $('#mw-subcategories'); // 子分类
        const $categoryMembers = $('#mw-pages'); // 分类内页面
        const $categoryFiles = $('#mw-category-media'); // 分类内文件
        $subCategories.find('h2').append(
            $('<span class="mw-editsection"></span>').append(
                '<span class="mw-editsection-bracket">[</span>',
                $('<a>复制本页</a>').on('click', ({ target }) => {
                    copyAction($subCategories.find('li a').map((_, ele) => `Category:${$(ele).text()}`).get().join("\n"), $(target));
                }),
                $subCategories.children('a').length
                    ? '<span class="mw-editsection-divider"> | </span>'
                    : null,
                $subCategories.children('a').length
                    ? $('<a>复制全部</a>').on('click', async ({ target }) => {
                        const pageList = await categoryMembers(mw.config.get('wgPageName'), ['subcat']);
                        copyAction(pageList.join('\n'), $(target));
                    })
                    : null,
                '<span class="mw-editsection-bracket">]</span>',
            ),
        );

        $categoryMembers.find('h2').append(
            $('<span class="mw-editsection"></span>').append(
                '<span class="mw-editsection-bracket">[</span>',
                $('<a>复制本页</a>').on('click', ({ target }) => {
                    copyAction($categoryMembers.find('li a').map((_, ele) => $(ele).text()).get().join("\n"), $(target));
                }),
                $categoryMembers.children('a').length
                    ? '<span class="mw-editsection-divider"> | </span>'
                    : null,
                $categoryMembers.children('a').length
                    ? $('<a>复制全部</a>').on('click', async ({ target }) => {
                        const pageList = await categoryMembers(mw.config.get('wgPageName'), ['page']);
                        copyAction(pageList.join('\n'), $(target));
                    })
                    : null,
                '<span class="mw-editsection-bracket">]</span>',
            ),
        );

        $categoryFiles.find('h2').append(
            $('<span class="mw-editsection"></span>').append(
                '<span class="mw-editsection-bracket">[</span>',
                $('<a>复制本页</a>').on('click', ({ target }) => {
                    copyAction($categoryFiles.find('li a.galleryfilename').map((_, ele) => `File:${$(ele).text()}`).get().join("\n"), $(target));
                }),
                $categoryFiles.children('a').length
                    ? '<span class="mw-editsection-divider"> | </span>'
                    : null,
                $categoryFiles.children('a').length
                    ? $('<a>复制全部</a>').on('click', async ({ target }) => {
                        const pageList = await categoryMembers(mw.config.get('wgPageName'), ['file']);
                        copyAction(pageList.join('\n'), $(target));
                    })
                    : null,
                '<span class="mw-editsection-bracket">]</span>',
            ),
        );
    }
});