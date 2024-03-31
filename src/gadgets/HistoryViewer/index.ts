import queryString from 'query-string';
import { formatDiff } from '@/utils/api';
import type { ApiParseResponse, ApiCompareResponse } from '@/@types/api';
import './index.less';

$(() => {
  const { oldid, diff } = queryString.parse(location.search);
  const $moderationNotice = $('#mw-content-text>.moderation-notice');
  const api = new mw.Api();

  /** 根据标题解析页面HTML */
  const parsePage = async (page: string) => {
    const response = await api.post({
      action: 'parse',
      page,
    }) as ApiParseResponse;
    return response.parse.text['*'];
  };

  if (diff) {
    // 查看差异
    if (!($('.permissions-errors a[href]').text().includes('↺'))) {
      // 仅在有显示“返回最后的版本 ↺”按钮时加载
      return;
    }
    const $gadgetZone = $('<div class="bearbintool-historyviewer" />');
    const $loadDiffButton = $('<a>加载当前差异</a>') as JQuery<HTMLAnchorElement>;
    $loadDiffButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const response = await api.get({
          action: 'compare',
          fromrev: oldid as string,
          torev: diff as string,
        }) as ApiCompareResponse;
        const $diff = $(formatDiff(response.compare['*'], true, oldid as string, diff as string));
        $gadgetZone.text('加载成功！您现在可以正常查看版本差异。').append($diff);
      } catch (error) {
        $gadgetZone.empty().append(
          `加载失败：${error}。您可以尝试重新`,
          $loadDiffButton,
          '。',
        );
      }
    });

    $('#mw-content-text').append(
      $gadgetZone.append(
        '或 ',
        $loadDiffButton,
        '。',
      ),
    );
  } else if (oldid) {
    // 查看旧版本
  } else if ($moderationNotice.get(0) && !$moderationNotice.children('a[href*="Special:Moderation"]').length) {
    // 有提示当前版本未通过审核，且不是自己的编辑时
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

    $moderationNotice.append(
      $gadgetZone.append(
        '您也可以 ',
        $showCurrentButton,
        '。',
      ),
    );
  }
});
