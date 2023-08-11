"use strict";
if (mw.config.get("wgNamespaceNumber") === -1) {
    /**
     * 复制内容到剪贴板
     * @param {string} text 要复制的文本
     * @param {string} selector 选择器，用于替换指定元素的文字内容
     */
    const copyAction = (text, selector) => {
        const $selector = $(selector);
        navigator.clipboard.writeText(text).then(() => {
            $selector.text("[复制成功]");
            setTimeout(() => $selector.text("[复制列表]"), 3000); // 恢复内容
        }, (err) => {
            $selector.text("[复制失败]");
            console.error("复制失败: ", err);
            setTimeout(() => $selector.text("[复制列表]"), 3000);
        });
    };

    // Special:链入页面
    if (mw.config.get("wgCanonicalSpecialPageName") === "Whatlinkshere") {
        $("#mw-content-text>p>strong").after($("<a>[复制列表]</a>").on("click", (e) => {
            const linkList = [];
            $("#mw-whatlinkshere-list>li>a").each((_, ele) => {
                linkList.push($(ele).text());
            });
            copyAction(linkList.join("\n"), e.target);
        }).css("padding-left", ".6em"));
    }

    // Special:搜索
    if (mw.config.get("wgCanonicalSpecialPageName") === "Search") {
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

        // 将“多媒体”改为搜索替换内容常的目标名字空间（主、用户、模板、帮助、分类、模块）
        const $imageSearch = $(".search-types li a").eq(1);
        $imageSearch
            .text("替换空间")
            .attr("href", $imageSearch.attr("href").replace("profile=images", "profile=advanced&limit=5000&ns0=1&ns2=1&ns10=1&ns12=1&ns14=1&ns828=1"));

        // 在搜索结果的每个页面后添加编辑按钮，顺带存一个linkList列表用于后续复制列表
        $(".mw-search-result-heading>a").each((_, ele) => {
            linkList.push(decodeURIComponent($(ele).attr("href")).replace("/", "").replaceAll("_", " "));
            $(ele).before(`<a class="searchplus-edit" href="${ele.href}?action=edit">[编辑]</a>`);
        });

        // 添加详情开关和复制完整列表按钮
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
            copyAction(linkList.join("\n"), e.target);
        });

        // 把按钮放到输入条下方的名字空间选择右侧
        $("#search .search-types, #powersearch .search-types").append($('<div id="bearbintools-searchplus"></div>').append(
            '<span class="mw-editsection-bracket">[</span>',
            $detailToggle,
            '<span class="mw-editsection-divider"> | </span>',
            $copyList,
            '<span class="mw-editsection-bracket">]</span>',
        ));
    }
}