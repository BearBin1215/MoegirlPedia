/**
 * @description 查询文件非链入使用。
 *
 * @todo 标记时跳出窗口可选输入用途
 */
import { pageSource } from '@/utils/api';

$(() => (async () => {
  // 本来想做一个检测当前页面文件存在不存在的，但想了想没啥必要。
  if (mw.config.get('wgNamespaceNumber') === 6) {
    await mw.loader.using(['mediawiki.api', 'mediawiki.ForeignApi', 'mediawiki.notification', 'oojs-ui']);
    const api = new mw.Api();
    const zhmoeApi = new mw.ForeignApi('https://mobile.moegirl.org.cn/api.php', { anonymous: true });
    const FILENAME = mw.config.get('wgTitle');
    const PAGENAME = mw.config.get('wgPageName');

    let pageList = [];

    // 重定向页面和其他页面元素有所区别，分别处理
    const funlNote = '<div id="funl-note">请注意：对过短的文件名使用本工具可能会出现误判，建议手动检查。</div>';
    if (mw.config.get('wgIsRedirect')) {
      $('.redirectMsg').after('<hr/>', funlNote);
    } else {
      $('#filelinks').after(funlNote);
    }
    // 搜索按钮
    const searchButton = new OO.ui.ButtonWidget({
      label: '查询非链入使用',
      flags: 'progressive',
      icon: 'search',
    });
    const $searchButtonAnchor = searchButton.$element.children('a');
    $('#funl-note').after(searchButton.$element);

    // 标记非链入使用按钮
    const markButton = new OO.ui.ButtonWidget({
      label: '标记非链入使用',
      flags: 'progressive',
      icon: 'tag',
    });
    const $markButtonLink = markButton.$element.children('a');
    searchButton.$element.after(markButton.$element);

    // 移除非链入使用标记按钮
    const removeButton = new OO.ui.ButtonWidget({
      label: '移除非链入标记',
      flags: 'progressive',
      icon: 'tag',
    });
    const $removeButtonAnchor = removeButton.$element.children('a');
    markButton.$element.after(removeButton.$element);

    markButton.$element.hide();
    removeButton.$element.hide();
    removeButton.$element.after(
      '<div id="search-result" style="margin:.6em 0">' +
      '<div id="result-overview"></div>' +
      '<ul id="result-list"></ul>' +
      '</div>' +
      '<hr/>',
    );

    /**
     * 直接在页面内获取链入使用的列表
     * 最多获取50个，但多于50个的文件根本不需要使用此工具，所以不用考虑这个问题
     * @returns 页面列表
     */
    const usedLinked = () => $('.mw-gu-onwiki-zh_moegirl_org_cn a').map((_, { text }) => text).get();

    /**
     * 搜索
     * @param {string} srsearch 搜索文本
     */
    const search = async (srsearch) => {
      return await zhmoeApi.get({
        action: 'query',
        list: 'search',
        srnamespace: '0|4|10|12|14|274|828',
        srwhat: 'text',
        srsearch,
      });
    };

    // 搜索
    const searchInSource = async () => {
      // 需要分别搜索未编码和编码后的文件名
      const [decodeSearchResult, encodeSearchResult] = await Promise.all([
        search(`insource:"${FILENAME.replaceAll('"', ' ')}"`), // 文件名可能带有半角双引号，和insource的引号混淆，要替换掉
        search(`insource:"${encodeURI(FILENAME).replaceAll('"', ' ').replaceAll('%20', ' ')}"`),
      ]);

      const notLinkedList = [];
      [...encodeSearchResult.query.search, ...decodeSearchResult.query.search].forEach((item) => {
        // 通过搜索结果的快照，检查搜索文本内是否有此文件名，用于解决大小写敏感问题
        // 但文件名中的符号可能会影响<span class="searchmatch">的位置插到文件名中间，因此要去掉这对标签
        const snippetTemp = item.snippet.replaceAll('_', ' ').replaceAll('<span class="searchmatch">', '').replaceAll('</span>', '');
        if (
          snippetTemp.includes(FILENAME.replaceAll('_', ' ')) ||
          snippetTemp.includes(encodeURI(FILENAME.replaceAll('_', ' '))) ||
          snippetTemp.includes(encodeURI(FILENAME.replaceAll('_', ' ')).replaceAll('%20', ' '))
        ) {
          notLinkedList.push(item.title); // 合并两个搜索结果并得到页面列表
        }
      });

      // 排除链入使用的页面
      const used = new Set([...usedLinked()]);
      let pageList = notLinkedList.filter((x) => !used.has(x));

      if (pageList.length === 0) {
        $('#result-overview').text('zh站没有查找到非链入使用此文件的页面。');
        return [];
      }
      $('#result-overview').text('文件在以下页面以非内链形式使用：');

      pageList = [...new Set(pageList)];
      $('#result-list').append(
        pageList.map((title) => `<li><a href="https://zh.moegirl.org.cn/${title}">zhmoe:${title}</a></li>`),
      );
      $searchButtonAnchor.removeClass('oo-ui-pendingElement-pending');
      return pageList;
    };

    /**
     * 添加[[T:非链入使用]]
     */
    const addMark = async () => {
      mw.notify('正在标记……');
      $markButtonLink.addClass('oo-ui-pendingElement-pending');
      const linkList = pageList.map((title) => `[[zhmoe:${title}]]`).join('、'); // 将页面列表写为[[zhmoe:A]]、[[zhmoe:B]]、[[zhmoe:C]]……的形式
      try {
        await api.postWithToken('csrf', {
          format: 'json',
          action: 'edit',
          watchlist: 'nochange',
          tags: 'Automation tool',
          minor: true,
          title: PAGENAME,
          appendtext: `{{非链入使用|${linkList}}}`,
          summary: '标记非链入使用的文件',
        }).done(() => {
          mw.notify('标记成功！将在2秒后刷新……');
          $markButtonLink.removeClass('oo-ui-pendingElement-pending');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        });
      } catch (err) {
        mw.notify(`标记失败：${err}`, 'error');
      }
    };

    /**
     * 移除[[T:非链入使用]]
     */
    const removeMark = async () => {
      mw.notify('正在移除标记……');
      $removeButtonAnchor.addClass('oo-ui-pendingElement-pending');
      try {
        const source = await pageSource(PAGENAME);
        const replacedSource = source.replace(/\{\{非链入使用\|[^{}]*\}\}/g, ''); // 移除非链入使用模板
        await api.postWithToken('csrf', {
          format: 'json',
          action: 'edit',
          watchlist: 'nochange',
          tags: 'Automation tool',
          minor: true,
          nocreate: true,
          title: PAGENAME,
          text: replacedSource,
          summary: '移除非链入使用标记',
        }).done(() => {
          mw.notify('移除成功！将在2秒后刷新……');
          $removeButtonAnchor.removeClass('oo-ui-pendingElement-pending');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        });
      } catch (err) {
        mw.notify(`移除失败：${err}`, 'error');
      }
    };

    // 执行体
    searchButton.on('click', async () => {
      mw.notify('正在查询……');
      $searchButtonAnchor.addClass('oo-ui-pendingElement-pending');
      pageList = await searchInSource();
      if (pageList.length && $('.used-not-linked').length === 0) {
        markButton.$element.show();
      } else if (pageList.length === 0 && $('.used-not-linked').length) {
        removeButton.$element.show();
      }
      mw.notify('查询完毕');
      $searchButtonAnchor.removeClass('oo-ui-pendingElement-pending');
    });

    markButton.on('click', addMark);
    removeButton.on('click', removeMark);
  }
})());
