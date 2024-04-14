import queryString from 'query-string';
import { formatDiff, pageSource } from '@/utils/api';
import type { ApiParseResponse, ApiCompareResponse, ApiParams } from '@/@types/api';
import './index.less';

declare global {
  interface Window {
    prettyPrint?: (opt_whenDone?: any, opt_root?: any) => void;
  }
}

mw.loader.using('mediawiki.api').then(() => {
  const { oldid, diff } = queryString.parse(location.search);
  const $moderationNotice = $('#mw-content-text>.moderation-notice');
  const api = new mw.Api();

  /** 根据输入参数解析页面HTML */
  const parsePage = async (parseConfig: ApiParams) => {
    const response = await api.post({
      action: 'parse',
      ...parseConfig,
    }) as ApiParseResponse;
    return response.parse.text['*'];
  };

  /** 生成用户链接 */
  const $userLink = (user: string, userid: number) => {
    return $(`<a href="/User:${user}" class="mw-userlink" />`).append(
      $('<span class="userlink-avatar" />').append(
        `<img class="userlink-avatar-small" src="https://img.moegirl.org.cn/common/avatars/${userid}/128.png" />`,
      ),
      `<bdi>${user}</bdi>`,
    );
  };

  /** 生成用户讨论和贡献链接 */
  const $userToolLinks = (user: string) => {
    return $('<span class="mw-usertoollinks" />').append(
      '（',
      `<a href="/User_talk:${user}" class="mw-usertoollinks-talk">讨论</a>`,
      ' | ',
      `<a href="/Special:用户贡献/${user}" class="mw-usertoollinks-contribs">贡献</a>`,
      '）',
    ) as JQuery<HTMLSpanElement>;
  };

  if (diff && oldid) {
    // 查看差异，仅在有显示“返回最后的版本 ↺”按钮时加载
    if (!($('.permissions-errors a[href]').text().includes('↺'))) {
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
          utf8: true,
          fromrev: oldid as string,
          torev: diff as string,
          prop: ['diff', 'user', 'parsedcomment', 'ids', 'title'],
        }) as ApiCompareResponse;
        const {
          fromtitle, fromrevid, fromparsedcomment, fromuser, fromuserid,
          totitle, torevid, toparsedcomment, touser, touserid,
        } = response.compare;
        // 按照正常差异格式生成元素。目前仅通过compare api无法获取到时间戳，可能要通过revisions，但会增加额外的请求因此暂不考虑。
        const $diff = $(formatDiff(
          response.compare['*'],
          true,
          [
            $('<div id="mw-diff-otitle1" />').append(
              $('<strong />').append(
                `<a href="/index.php?title=${fromtitle}&oldid=${fromrevid}">版本${fromrevid}</a>`,
                `<span class="mw-diff-edit">（<a href="/index.php?title=${fromtitle}action=edit&oldid=${fromrevid}">编辑</a>）</span>`,
              ),
            ),
            $('<div id="mw-diff-otitle2" />').append(
              $userLink(fromuser, fromuserid),
              $userToolLinks(fromuser),
            ),
            $(`<div id="mw-diff-otitle3" />`).append(
              fromparsedcomment ? `<span class="comment">（${fromparsedcomment}）</span>` : '',
            ),
          ],
          [
            $('<div id="mw-diff-ntitle1" />').append(
              $('<strong />').append(
                `<a href="/index.php?title=${totitle}&oldid=${torevid}">版本${torevid}</a>`,
                `<span class="mw-diff-edit">（<a href="/index.php?title=${totitle}&action=edit&oldid=${torevid}">编辑</a>）</span>`,
                `<span class="mw-diff-undo">（<a href="/index.php?title=${totitle}&action=edit&undoafter=${fromrevid}&undo=${torevid}">撤销</a>）</span>`,
              ),
            ),
            $('<div id="mw-diff-ntitle2" />').append(
              $userLink(touser, touserid),
              $userToolLinks(touser),
            ),
            $(`<div id="mw-diff-ntitle3" />`).append(
              toparsedcomment ? `<span class="comment">（${toparsedcomment}）</span>` : '',
            ),
          ],
        ));
        $gadgetZone.text('加载成功！您现在可以查看版本差异。因compare api不支持，编辑时间戳和标记（如小编辑、机器人）不会显示。').append($diff);
      } catch (error) {
        $gadgetZone.empty().append(`加载失败：${error}。您可以尝试重新`, $loadDiffButton, '。');
      }
      try {
        const currentHTML = await parsePage({ oldid } as ApiParams);
        $('#mw-content-text').append(
          '<hr class="diff-hr" id="mw-oldid">',
          `<h2 class="diff-currentversion-title">版本${oldid}</h2>`,
          $('<div class="mw-parser-output" />').html(currentHTML),
        );
      } catch (error) {
        $('#mw-content-text').append(`版本${oldid}解析失败：${error}。`);
      }
    });

    $('#mw-content-text').append($gadgetZone.append('或 ', $loadDiffButton, '。'));
  } else if (oldid) {
    // 查看旧版本
    if (!($('.permissions-errors a[href]').text().includes('↺'))) {
      // 仅在有显示“返回最后的版本 ↺”按钮时加载
      return;
    }
    const $gadgetZone = $('<div class="bearbintool-historyviewer" />');
    const $loadHTMLButton = $('<a>加载当前版本</a>') as JQuery<HTMLAnchorElement>;

    $loadHTMLButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const currentHTML = await parsePage({ oldid } as ApiParams);
        $('#mw-content-text').append($('<div class="mw-parser-output" />').html(currentHTML));
        $gadgetZone.text('加载成功，您现在看到的是最新版本。部分依赖于js的功能（如折叠、tabs模板）可能无法正常工作。');
      } catch (error) {
        $gadgetZone.empty().append(`加载失败：${error}。您可以尝试重新`, $loadHTMLButton, '。');
      }
    });

    $('#mw-content-text').append($gadgetZone.append('或 ', $loadHTMLButton, '。'));
  } else if ($moderationNotice.get(0) && !$moderationNotice.children('a[href*="Special:Moderation"]').length) {
    // 有提示当前版本未通过审核，且不是自己的编辑时
    const $gadgetZone = $('<div class="history-revert-showcurrent" />');
    const $showCurrentButton = $('<a>加载最新版本</a>') as JQuery<HTMLAnchorElement>;

    $showCurrentButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const currentHTML = await parsePage({ page: mw.config.get('wgPageName') });
        if (document.getElementById('mw-clearyourcache')) {
          const $mwcode = $('#mw-content-text>.mw-code');
          const $currentContent = $(currentHTML);
          $mwcode.replaceWith($currentContent);
          if (typeof window.prettyPrint === 'function') {
            const acceptsLangs = {
              javascript: "js",
              json: "json",
              css: "css",
              "sanitized-css": "css",
              Scribunto: "lua",
            };
            $currentContent.addClass(`prettyprint lang-${acceptsLangs[mw.config.get('wgPageContentModel')]} linenums`);
            window.prettyPrint();
          }
        } else {
          $('#mw-content-text>.mw-parser-output').html(currentHTML);
        }
        $gadgetZone.text('加载成功，您现在看到的是最新版本（部分依赖于js的功能可能无法正常工作）。');
      } catch (error) {
        $gadgetZone.empty().append(`加载失败：${error}。您可以尝试重新`, $showCurrentButton, '。');
      }
    });

    $moderationNotice.append($gadgetZone.append('您也可以 ', $showCurrentButton, '。'));
  } else if (document.querySelector('.permissions-errors a[href*="action=edit"]')) {
    const $gadgetZone = $('<div class="history-revert-showcurrent" />');
    const $showPageButton = $('<a>查看待审核内容</a>') as JQuery<HTMLAnchorElement>;

    $showPageButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const text = await pageSource(mw.config.get('wgPageName'));
        const currentHTML = await parsePage({ text } as ApiParams);
        $('#mw-content-text').append($('<div class="mw-parser-output" />').html(currentHTML));
        $gadgetZone.text('加载成功，您现在看到的是最新版本（部分依赖于js的功能可能无法正常工作）。');
      } catch (error) {
        $gadgetZone.empty().append(`加载失败：${error}。您可以尝试重新`, $showPageButton, '。');
      }
    });

    $('.permissions-errors').append($gadgetZone.append('您也可以', $showPageButton, '。'));
  }
});
