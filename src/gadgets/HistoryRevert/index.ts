import queryString from 'query-string';
import type { ApiParseResponse } from '@/@types/api';

$(() => {
  const { oldid, diff, action } = queryString.parse(location.search);
  const moderationNotice = $('#mw-content-text>.moderation-notice');
  const api = new mw.Api();

  /** 根据标题解析页面HTML */
  const parsePage = async (page: string) => {
    const response = await api.post({
      action: 'parse',
      page,
    }) as ApiParseResponse;
    return response.parse.text['*'];
  };

  if (action === 'history') {
    // 页面历史处调整
  } else if (diff) {
    // 查看差异
  } else if (oldid) {
    // 查看旧版本
  } else if (moderationNotice.get(0)) {
    const $gadgetZone = $('<div class="history-revert-showcurrent" />');
    const $showCurrentButton = $('<a>加载最新版本</a>') as JQuery<HTMLAnchorElement>;
    $showCurrentButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const currentHTML = await parsePage(mw.config.get('wgPageName'));
        $('#mw-content-text>.mw-parser-output').html(currentHTML);
        $gadgetZone.text('加载成功，您现在看到的是最新版本（部分依赖于js的功能可能无法正常工作）。');
      } catch (error) {
        $gadgetZone.empty().append(
          `加载失败：${error}。您可以尝试重新`,
          $showCurrentButton,
          '。',
        );
      }
    });
    moderationNotice.append(
      $gadgetZone.append(
        '您也可以 ',
        $showCurrentButton,
        '。',
      ),
    );
  }
});
