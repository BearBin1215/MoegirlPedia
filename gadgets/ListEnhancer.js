/**
 * 测试阶段，漏洞很多，慎用
 */

"use strict";
$(() => {
    if (mw.config.get("wgNamespaceNumber") !== -1) {
        return;
    }

    /**
     * 执行复制操作
     * @param {string} content 要复制的内容
     * @param {jQuery} $element 要改变文字的元素
     * @param {string} successText 复制成功显示的文字
     * @param {string} errorText 复制失败显示的文字
     */
    const copyAction = (content, $element, successText = "复制成功", errorText = "复制失败") => {
        const buttonText = $element.text();
        navigator.clipboard.writeText(content).then(() => {
            $element.text(successText);
            setTimeout(() => $element.text(buttonText), 3000); // 恢复内容
        }, (err) => {
            $element.text(errorText);
            console.error("复制失败: ", err);
            setTimeout(() => $element.text(buttonText), 3000);
        });
    };

    // Special:链入页面
    const linkshereEnhance = () => {
        $("#mw-content-text>p>strong").after($("<a>[复制列表]</a>").on("click", (e) => {
            const linkList = [];
            $("#mw-whatlinkshere-list>li>a").each((_, ele) => {
                linkList.push($(ele).text());
            });
            copyAction(linkList.join("\n"), $(e.target), "[复制成功]", "[复制失败]");
        }).css("padding-left", ".6em"));
    };

    // Special:搜索
    const searchEnhance = () => {
        mw.loader.addStyleTag(`
        .search-types {
            display: flex;
            float: none;
            align-items: center;
        }
        #bearbintools-searchplus {
            padding: .5em;
            user-select: none;
        }
        #bearbintools-searchplus a {
            display: inline;
            padding: 0;
        }
        .searchplus-edit {
            margin-left: .5em;
            float: right;
        }
        `);
        let showDetail = true;
        const linkList = [];

        // 复制一个按钮插入到多媒体搜索后面，用于搜索要用于替换的页面
        const $searchMedia = $(".search-types li").eq(1);
        const $nsToReplace = $searchMedia.clone(false);
        $nsToReplace.children("a")
            .text("替换空间")
            .attr("title", "主、模板等替换常用名字空间")
            .attr("href", function () {
                return this.href.replace("profile=images", "profile=advanced&limit=500&ns0=1&ns2=1&ns6=1&ns10=1&ns12=1&ns14=1&ns828=1"); // 太多了超时，所以500
            });
        $nsToReplace.insertAfter($searchMedia);

        // 在搜索结果的每个页面后添加编辑按钮，顺带存一个linkList列表用于后续复制列表
        $("a[data-serp-pos]").each((_, ele) => {
            linkList.push(decodeURIComponent($(ele).attr("href")).replace("/", "").replaceAll("_", " "));
            $(ele).before(`<a class="searchplus-edit" href="${ele.href}?action=edit">[编辑]</a>`);
        });

        // 添加详情开关和复制列表按钮
        const $detailToggle = $("<a>隐藏详情</a>").on("click", (e) => {
            if (showDetail) {
                $(".searchresult, .mw-search-result-data").hide(); // 隐藏除标题以外的详情
                $(".mw-search-results li").css("padding-bottom", "0.1em"); // 间距很大，需要控制
                $(e.target).text("显示详情");
                showDetail = false;
            } else {
                $(".searchresult, .mw-search-result-data").show();
                $(".mw-search-results li").css("padding-bottom", "");
                $(e.target).text("隐藏详情");
                showDetail = true;
            }
        });
        const $copyList = $("<a>复制列表</a>").on("click", (e) => {
            copyAction(linkList.join("\n"), $(e.target));
        });

        // 把按钮放到输入条下方的名字空间选择右侧
        $("#search .search-types, #powersearch .search-types").append($('<div id="bearbintools-searchplus"></div>').append(
            '<span class="mw-editsection-bracket">[</span>',
            $detailToggle,
            '<span class="mw-editsection-divider"> | </span>',
            $copyList,
            '<span class="mw-editsection-bracket">]</span>',
        ));

        // 把下方翻页条复制一份到上面
        $(".mw-search-pager-bottom").clone().prependTo($(".searchresults"));
    };

    // 根据特殊页面进行显示
    switch(mw.config.get("wgCanonicalSpecialPageName")) {
        case "Whatlinkshere":
            linkshereEnhance();
            break;
        case "Search":
            searchEnhance();
            break;
    }
});