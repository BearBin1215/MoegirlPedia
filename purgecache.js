/**
 * 改自[[MediaWiki:Gadget-Purgecache.js]]，用于添加一个“清除缓存”按钮。相比原工具移除了时间显示等部分边缘功能，并对moeskin进行了样式和窄屏的适配。
 * 使用：common.js中插入代码：mw.loader.load('/index.php?title=User:BearBin/js/purgecache.js&action=raw&ctype=text/javascript');
 */

'use strict';
$(function () {
	//仅在非特殊页面执行
	if (mw.config.get('wgNamespaceNumber') != -1) {
		//检测皮肤
		var containerNode;
		containerNode = $('<a/>');
		var statusNode = $('<span/>').text('清除缓存'),
			runningStatus = false;
		containerNode.attr("href", 'javascript:void(0);');
		containerNode.append(statusNode);
		containerNode.on('click', function () {
			if (runningStatus) return;
			statusNode.text('正在清除……');
			runningStatus = true;
			var api = new mw.Api(),
				opt = {
					action: 'purge',
					format: 'json',
					forcelinkupdate: true,
					titles: mw.config.get('wgPageName')
				};
			api.post(opt).then(function () {
				requestAnimationFrame(function () {
					api.post(opt).then(function () {
						statusNode.text('清除成功！');
						requestAnimationFrame(location.reload.bind(location));
					}, function () {
						statusNode.text('清除失败！');
						runningStatus = false;
						requestAnimationFrame(function () {
							if (!runningStatus) statusNode.text('清除缓存');
						});
					});
				});
			}, function () {
				statusNode.text('清除失败！');
				runningStatus = false;
				requestAnimationFrame(function () {
					if (!runningStatus) statusNode.text('清除缓存');
				});
			});
		});
		var li;
		if (mw.config.get("skin") === "vector") {
			li = $('<li/>').appendTo("#p-personal>ul");
			li.append(containerNode);
		} else {
			li = $('<div id="purge-cache-button"/>').prependTo("#moe-article-header-container #moe-article-header-top .right-block");
			var li2 = $('<li id="purge-cache-button-mobile"/>').appendTo("div.mobile-edit-button");
			var containerNode2 = containerNode.clone();
			li.append(containerNode);
			li2.append(containerNode2);
			//添加对应的css样式
			$('head').append('<style>#purge-cache-button{height:22px;padding:0 10px;font-size:12px;line-height:1;border-radius:22px;border:1px solid rgb(224,224,230);transition:.3s all;display:flex;align-items:center;}#purge-cache-button a{font-size:0;color:#000;transition:.3s all;}#purge-cache-button:hover{border-color:#36ad6a;}#purge-cache-button:hover a{color:#36ad6a;}#purge-cache-button a span:first-child{font-size:12px;}.mobile-edit-button{display:flex;}.mobile-edit-button li{list-style:none;display:inline-flex;flex-shrink:0;flex-wrap:nowrap;justify-content:center;align-items:center;height:28px;margin-left:.25em;background-color:rgba(24,160,88,0.16);border-radius:3px;transition:color .3s cubic-bezier(0.4,0,0.2,1),background-color .3s cubic-bezier(0.4,0,0.2,1),opacity .3s cubic-bezier(0.4,0,0.2,1),border-color .3s cubic-bezier(0.4,0,0.2,1)}.mobile-edit-button li a{color:#18a058;padding:0 5px;white-space:nowrap;font-size:14px;line-height:1}.mobile-edit-button li:hover{background:rgba(24,160,88,0.22);}</style>')
		}
	}
});