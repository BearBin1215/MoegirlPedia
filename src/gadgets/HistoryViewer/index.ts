import { formatDiff, pageSource } from '@/utils/api';
import type { ApiParseResponse, ApiQueryResponse, ApiCompareResponse, ApiParams } from '@/@types/api';
import './index.less';

declare global {
  interface Window {
    prettyPrint?: (opt_whenDone?: () => void, opt_root?: HTMLElement) => void;
  }
}

mw.loader.using('mediawiki.api').then(() => {
  const searchParams = new URLSearchParams(location.search);
  let oldid: number | string | null = searchParams.get('oldid');
  const diff = searchParams.get('diff');
  const $moderationNotice = $('#mw-content-text>.moderation-notice');
  const api = new mw.Api();
  const pageContentModel = mw.config.get('wgPageContentModel');
  const pageName = mw.config.get('wgPageName');

  /** 页面模型语言映射 */
  const acceptsLangs = {
    javascript: "js",
    json: "json",
    css: "css",
    "sanitized-css": "css",
    Scribunto: "lua",
  };

  const pretty = ($codeContent: JQuery<HTMLElement>) => {
    $codeContent.addClass(`prettyprint lang-${acceptsLangs[pageContentModel]} linenums`);
    if (typeof window.prettyPrint === 'function') {
      window.prettyPrint();
    } else {
      mw.loader.load('/index.php?title=MediaWiki:Gadget-code-prettify.js&action=raw&ctype=text/javascript');
      mw.loader.load('/index.php?title=MediaWiki:Gadget-code-prettify.css&action=raw&ctype=text/css', 'text/css');
    }
  };

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
        `<img class="userlink-avatar-small" src="//storage.moegirl.org.cn/moegirl/avatars/${userid}/latest.png!avatar" />`,
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
    // 查看差异，仅在有显示“返回XXX”按钮时加载
    if (!document.getElementById('mw-mod-error') || !($('#mw-returnto').text().includes('返回'))) {
      return;
    }
    const $gadgetZone = $('<div class="bearbintool-historyviewer" />');
    const $loadDiffButton = $('<a>加载当前差异</a>') as JQuery<HTMLAnchorElement>;

    $loadDiffButton.on('click', async (e) => {
      e.preventDefault();
      mw.loader.load(`${mw.config.get('wgScriptPath')}/load.php?modules=mediawiki.diff.styles&only=styles`, 'text/css');
      $gadgetZone.text('加载中……');
      try {
        if (oldid === 'prev') {
          const infoResponse = await api.post({
            action: 'query',
            utf8: true,
            prop: 'revisions',
            rvprop: 'ids',
            rvlimit: 2,
            rvstartid: diff,
            titles: pageName,
          }) as ApiQueryResponse;
          const oldRevInfo = Object.values(infoResponse.query.pages)[0]?.revisions?.[1];
          if (oldRevInfo) {
            oldid = oldRevInfo.revid;
          }
        }
        const response = await api.post({
          action: 'compare',
          utf8: true,
          fromrev: oldid!,
          ...(/\d+/.test(diff) ? {
            torev: diff,
          } : {
            torelative: diff,
          }),
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
        $gadgetZone.empty().append(`加载失败：${error}。`);
      }
      if (diff !== 'prev') {
        try {
          const currentHTML = await parsePage({
            oldid: diff,
          } as ApiParams);
          $('#mw-content-text').append(
            '<hr class="diff-hr" id="mw-oldid">',
            `<h2 class="diff-currentversion-title">版本${diff}</h2>`,
          );
          if (pageContentModel in acceptsLangs) {
            const $currentContent = $(currentHTML);
            $('#mw-content-text').append($currentContent);
            if (mw.loader.moduleRegistry['ext.gadget.code-prettify']) {
              pretty($currentContent);
            }
          } else {
            $('#mw-content-text').append($('<div class="mw-parser-output" />').html(currentHTML));
          }
        } catch (error) {
          $('#mw-content-text').append(`版本${diff}解析失败：${error}。`);
        }
      }
    });

    $('#mw-returnto').after($gadgetZone.append('您也可以', $loadDiffButton, '。'));
  } else if (oldid) {
    // 查看旧版本
    if (!document.getElementById('mw-mod-error') || !($('#mw-returnto').text().includes('返回'))) {
      return;
    }
    const $gadgetZone = $('<div class="bearbintool-historyviewer" />');
    const $loadHTMLButton = $('<a>加载当前版本</a>') as JQuery<HTMLAnchorElement>;

    $loadHTMLButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const currentHTML = await parsePage({
          oldid,
        } as ApiParams);
        if (pageContentModel in acceptsLangs) {
          const $currentContent = $(currentHTML);
          $('#mw-content-text').append($currentContent);
          if (mw.loader.moduleRegistry['ext.gadget.code-prettify']) {
            pretty($currentContent);
          }
        } else {
          $('#mw-content-text').append($('<div class="mw-parser-output" />').html(currentHTML));
        }
        $gadgetZone.text('加载成功，您现在看到的是最新版本。部分依赖于js的功能（如折叠、tabs模板）可能无法正常工作。');
      } catch (error) {
        $gadgetZone.empty().append(`加载失败：${error}。`);
      }
    });

    $('#mw-returnto').after($gadgetZone.append('您也可以', $loadHTMLButton, '。'));
  } else if ($moderationNotice.get(0) && !$moderationNotice.children('a[href*="Special:Moderation"]').length) {
    // 有提示当前版本未通过审核，且不是自己的编辑时
    const $gadgetZone = $('<div class="history-revert-showcurrent" />');
    const $showCurrentButton = $('<a>加载最新版本</a>') as JQuery<HTMLAnchorElement>;

    $showCurrentButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const currentHTML = await parsePage({
          page: pageName,
        });
        if (pageContentModel in acceptsLangs) {
          const $mwcode = $('#mw-content-text>.mw-code');
          const $currentContent = $(currentHTML);
          if ($mwcode.length) {
            $mwcode.replaceWith($currentContent);
          } else {
            $moderationNotice.after($currentContent);
          }
          if (mw.loader.moduleRegistry['ext.gadget.code-prettify']) {
            pretty($currentContent);
          }
        } else {
          let $mwParserOutput = $('#mw-content-text>.mw-parser-output');
          if (!$mwParserOutput.length) {
            $mwParserOutput = $('<div class="mw-parser-output" />');
            $moderationNotice.after($mwParserOutput);
          }
          $mwParserOutput.html(currentHTML);
        }
        $gadgetZone.text('加载成功，您现在看到的是最新版本（部分依赖于js的功能可能无法正常工作）。');
      } catch (error) {
        $gadgetZone.empty().append(`加载失败：${error}。`);
      }
    });

    $moderationNotice.append($gadgetZone.append('您也可以 ', $showCurrentButton, '。'));
  } else if ($('#mw-content-text').text().includes('的版本#0不存在。')) {
    console.log('新页面');
    // 新页面
    const $gadgetZone = $('<div class="history-revert-showcurrent" />');
    const $showPageButton = $('<a>查看待审核内容</a>') as JQuery<HTMLAnchorElement>;

    $showPageButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const text = await pageSource(pageName);
        const currentHTML = await parsePage({
          text,
          title: pageName,
        } as ApiParams);
        if (pageContentModel in acceptsLangs) {
          const $currentContent = $(currentHTML);
          $('#mw-content-text').append($currentContent);
          if (mw.loader.moduleRegistry['ext.gadget.code-prettify']) {
            pretty($currentContent);
          }
        } else {
          $('#mw-content-text').append($('<div class="mw-parser-output" />').html(currentHTML));
        }
        $gadgetZone.text('加载成功，您现在看到的是最新版本（部分依赖于js的功能可能无法正常工作）。');
      } catch (error) {
        $gadgetZone.empty().append(`加载失败：${error}`);
      }
    });

    $('#mw-content-text').append($gadgetZone.append('也可能当前页面未通过审核，您可以尝试', $showPageButton, '。'));
  } else if (mw.config.get('wgAction') === 'edit' && $('#mw-content-text').text().includes('此页面已受到保护')) {
    const $gadgetZone = $('<div class="bearbintool-historyviewer" />');
    const $showPageButton = $('<a>查看源代码</a>') as JQuery<HTMLAnchorElement>;

    $showPageButton.on('click', async (e) => {
      e.preventDefault();
      $gadgetZone.text('加载中……');
      try {
        const source = await pageSource(pageName);
        const $codeZone = $(`<pre lang="${acceptsLangs[pageContentModel] || pageContentModel}">${source}</pre>`);
        $('#mw-content-text').empty().append(
          '源代码加载成功',
          $codeZone,
        );
        pretty($codeZone);
      } catch (error) {
        $gadgetZone.empty().append(`加载失败：${error}。`);
      }
    });

    $('#mw-content-text').append($gadgetZone.append($showPageButton));
  }
});
