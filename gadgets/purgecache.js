/**
 * 改自[[MediaWiki:Gadget-Purgecache.js]]，用于添加一个“清除缓存”按钮。
 * 试了半天，还是得重复调用函数，如果有更好的解决方法请不吝赐教。
 */

"use strict";
function purgeCache() {
    const containerNode = $('<a class="purge-button"/>');
    const statusNode = $("<span/>").text("清除缓存");
    let runningStatus = false;
    containerNode.append(statusNode);
    containerNode.on("click", () => {
        if (runningStatus) { return; }
        statusNode.text("正在清除…");
        runningStatus = true;
        const api = new mw.Api(),
            opt = {
                action: "purge",
                format: "json",
                forcelinkupdate: true,
                titles: mw.config.get("wgPageName"),
            };
        api.post(opt).then(() => {
            requestAnimationFrame(() => {
                api.post(opt).then(() => {
                    statusNode.text("清除成功！");
                    setTimeout(location.reload.bind(location), 200);
                }, () => {
                    statusNode.text("清除失败！");
                    runningStatus = false;
                    setTimeout(() => {
                        if (!runningStatus) { statusNode.text("清除缓存"); }
                    }, 2000);
                });
            });
        }, () => {
            statusNode.text("清除失败！");
            runningStatus = false;
            setTimeout(() => {
                if (!runningStatus) { statusNode.text("清除缓存"); }
            }, 1000);
        });
    });
    return containerNode;
}

$(() => {
    let containerNodeDesktop, containerNodeMobile;
    //判断是否特殊页面
    if (mw.config.get("wgNamespaceNumber") === -1) {
        containerNodeDesktop = $('<span class="special-page"/>');
        containerNodeDesktop.append("特殊页面");
    } else {
        containerNodeDesktop = purgeCache();
        containerNodeMobile = purgeCache();
    }
    let li;
    // 检测皮肤
    if (mw.config.get("skin") === "vector") {
        li = $('<li id="pt-purge"/>').appendTo("#p-personal>ul");
        li.append(containerNodeDesktop);
    } else {
        li = $('<div id="purge-cache-button"/>').prependTo("#moe-article-header-container #moe-article-header-top .right-block");
        const li2 = $('<li id="purge-cache-button-mobile"/>').appendTo("div.mobile-edit-button");
        li.append(containerNodeDesktop);
        li2.append(containerNodeMobile);
        //添加对应的css样式
        $("head").append("<style>#purge-cache-button{display:flex;align-items:center;height:22px;font-size:12px;line-height:1;transition:.3s all;}#purge-cache-button>.special-page{cursor:default;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}#purge-cache-button>.special-page,#purge-cache-button>a{display:flex;align-items:center;height:100%;padding:0 10px;color:#000;transition:.3s all;border-radius:22px;border:1px solid rgb(224,224,230);}#purge-cache-button>a:hover,#purge-cache-button>a:focus{text-decoration:none;}#purge-cache-button>.special-page:hover,#purge-cache-button>a:hover{border-color:#36ad6a;}#purge-cache-button>a:hover{color:#36ad6a;}.mobile-edit-button{display:flex;gap:.3em;}.mobile-edit-button li{list-style:none;display:inline-flex;flex-shrink:0;flex-wrap:nowrap;justify-content:center;align-items:center;height:28px;background-color:rgba(24,160,88,0.16);border-radius:3px;transition:color .3s cubic-bezier(0.4,0,0.2,1),background-color .3s cubic-bezier(0.4,0,0.2,1),opacity .3s cubic-bezier(0.4,0,0.2,1),border-color .3s cubic-bezier(0.4,0,0.2,1)}.mobile-edit-button li:hover{background:rgba(24,160,88,0.22);}.mobile-edit-button li a{color:#18a058;white-space:nowrap;font-size:14px;line-height:1;padding:0 5px;}.mobile-edit-button li a,.mobile-edit-button li span{display:flex;justify-content:center;align-items:center;height:100%;}.mobile-edit-button li a:hover,.mobile-edit-button li a:focus{text-decoration:none;}</style>");
    }
});
