import './index.less';

const purgeCache = () => {
  const containerNode = $('<a class="purge-button"/>');
  const statusNode = $('<span/>').text('清除缓存');
  let runningStatus = false;
  containerNode.append(statusNode);
  containerNode.on('click', () => {
    if (runningStatus) { return; }
    statusNode.text('正在清除…');
    runningStatus = true;
    const api = new mw.Api(),
      opt = {
        action: 'purge',
        format: 'json',
        forcelinkupdate: true,
        titles: mw.config.get('wgPageName'),
      };
    api.post(opt).then(() => {
      requestAnimationFrame(() => {
        api.post(opt).then(() => {
          statusNode.text('清除成功！');
          setTimeout(location.reload.bind(location), 200);
        }, () => {
          statusNode.text('清除失败！');
          runningStatus = false;
          setTimeout(() => {
            if (!runningStatus) { statusNode.text('清除缓存'); }
          }, 2000);
        });
      });
    }, () => {
      statusNode.text('清除失败！');
      runningStatus = false;
      setTimeout(() => {
        if (!runningStatus) { statusNode.text('清除缓存'); }
      }, 1000);
    });
  });
  return containerNode;
};

let containerNodeDesktop, containerNodeMobile;
//判断是否特殊页面
if (mw.config.get('wgNamespaceNumber') === -1) {
  containerNodeDesktop = $('<span class="special-page"/>');
  containerNodeDesktop.append('特殊页面');
} else {
  containerNodeDesktop = purgeCache();
  containerNodeMobile = purgeCache();
}
let li;
// 检测皮肤
if (mw.config.get('skin') === 'vector') {
  li = $('<li id="pt-purge"/>').appendTo('#p-personal>ul');
  li.append(containerNodeDesktop);
} else {
  li = $('<div id="purge-cache-button"/>').prependTo('#moe-article-header-container #moe-article-header-top .right-block');
  const li2 = $('<li id="purge-cache-button-mobile"/>').appendTo('div.mobile-edit-button');
  li.append(containerNodeDesktop);
  li2.append(containerNodeMobile);
}