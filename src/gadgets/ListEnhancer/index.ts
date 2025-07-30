import { categoryMembers, linkList, includeList, redirectList } from '@/utils/api';
import { copyText } from '@/utils/clipboard';
import { editSection, bracketStart, bracketEnd, divider } from '@/utils/mwElements';
import type { Cmtype } from '@/@types/api';
import styles from './index.inline.less';

mw.loader.using(['mediawiki.notification', 'mediawiki.api']).done(() => {
  let cacheText: string;
  /**
   * 执行复制操作
   * @param content 要复制的内容
   * @param $element 要改变文字的元素
   * @param successText 复制成功显示的文字
   * @param errorText 复制失败显示的文字
   */
  const copyAction = (content: string, $element: JQuery<HTMLElement>, successText = '复制成功', errorText = '复制失败') => {
    const buttonText = $element.text();
    copyText(content).then(() => {
      $element.text(successText);
      setTimeout(() => $element.text(buttonText), 3000); // 恢复内容
    }, (err) => {
      $element.text(errorText);
      mw.notify($(`<span>复制失败: ${err}${err.includes('NotAllowedError') ? '<br/>您可能正在使用firefox，或请求响应时间过久，请重新尝试复制。' : ''}</span>`), {
        type: 'error',
        autoHideSeconds: 'long',
      });
      setTimeout(() => $element.text(buttonText), 3000);
    });
  };

  const ns = mw.config.get('wgNamespaceNumber');

  if (ns === -1) {
    $(document.head).append($(`<style>${styles}</style>`));
    // Special:链入页面
    const linkshereEnhance = () => $('#mw-whatlinkshere-list').before($('<span class="listenhancer-linkshere" />').append(
      '（',
      $('<a>复制本页</a>').on('click', ({ target }) => {
        const anchorList = $('#mw-whatlinkshere-list>li>bdi>a').map((_, ele) => $(ele).text()).get(); // 根据标签文本生成列表
        copyAction(anchorList.join('\n'), $(target));
      }),
      $('#mw-content-text a.mw-nextlink').length
        ? ' | '
        : '',
      $('#mw-content-text a.mw-nextlink').length
        ? $('<a>复制全部</a>').on('click', async ({ target }) => {
          $(target).text('正在读取……');
          // 理论上应该是可以一个请求全部获取，但这样搞简单，以后再改进吧（
          if (!cacheText) {
            const search = new URLSearchParams(location.search);
            const pageName = mw.config.get('wgRelevantPageName');
            const promises = [
              search.get('hidetrans') ? Promise.resolve([]) : includeList(pageName),
              search.get('hidelinks') ? Promise.resolve([]) : linkList(pageName),
              search.get('hideredirs') ? Promise.resolve([]) : redirectList(pageName),
            ];
            await Promise.all(promises).then((results) => {
              const pageList = ([] as string[]).concat(...results); // 二维数组展开为一维
              cacheText = pageList.join('\n');
            });
          }
          copyAction(cacheText, $(target));
        })
        : '',
      '）',
    ));

    // Special:搜索
    const searchEnhance = () => {
      let showDetail = true;
      const anchorList: string[] = [];

      // 复制一个按钮插入到多媒体搜索后面，用于搜索要用于替换的页面
      const $searchMedia = $('.search-types li').eq(1);
      const $nsToReplace = $searchMedia.clone(false);
      $nsToReplace.children('a')
        .text('替换空间')
        .attr('title', '主、模板等替换常用名字空间')
        .attr('href', (_, attr) => attr.replace('profile=images', 'profile=advanced&limit=500&ns0=1&ns2=1&ns6=1&ns10=1&ns12=1&ns14=1&ns828=1')); // 太多了超时，所以500
      $nsToReplace.insertAfter($searchMedia);

      // 在搜索结果的每个页面后添加编辑按钮，顺带存一个linkList列表用于后续复制列表
      ($('a[data-serp-pos]') as JQuery<HTMLAnchorElement>).each((_, ele) => {
        anchorList.push(decodeURIComponent(ele.href).replace(/(https:\/\/)?m?zh.moegirl.org.cn\//, '').replace(/_/g, ' '));
        $(ele).before(`<a class="listenhancer-search-edit" href="${ele.href}?action=edit">[编辑]</a>`);
      });

      // 添加详情开关和复制列表按钮
      const $detailToggle = $('<a>隐藏详情</a>').on('click', ({ target }) => {
        if (showDetail) {
          $('.searchresult, .mw-search-result-data').hide(); // 隐藏除标题以外的详情
          $('.mw-search-results li').css('padding-bottom', '0.1em'); // 间距很大，需要控制
          $(target).text('显示详情');
          showDetail = false;
        } else {
          $('.searchresult, .mw-search-result-data').show();
          $('.mw-search-results li').css('padding-bottom', '');
          $(target).text('隐藏详情');
          showDetail = true;
        }
      });
      const $copyList = $('<a>复制列表</a>').on('click', ({ target }) => {
        copyAction(anchorList.join('\n'), $(target));
      });

      // 把按钮放到输入条下方的名字空间选择右侧
      $('#search .search-types, #powersearch .search-types').append($('<div id="bearbintools-listenhancer-search" />').append(
        bracketStart,
        $detailToggle,
        divider,
        $copyList,
        bracketEnd,
      ));

      // 把下方翻页条复制一份到上面
      $('.mw-search-pager-bottom').clone().prependTo($('.searchresults'));
    };

    // 根据特殊页面进行显示
    switch (mw.config.get('wgCanonicalSpecialPageName')) {
      case 'Whatlinkshere':
        linkshereEnhance();
        break;
      case 'Search':
        searchEnhance();
        break;
    }
  } else if (ns === 14) {
    /**
     * 给对应的标题加上复制按钮及功能
     * @param $element 元素
     * @param type 分类成员类型
     * @param prefix 页面前缀
     * @param linkSelector 成员链接选择器
     */
    const addCopyButton = ($element: JQuery<HTMLElement>, type: Cmtype, prefix = '', linkSelector: JQuery.Selector = 'li a') => {
      $element.find('h2').append(
        $(editSection).append(
          bracketStart,
          $('<a>复制本页</a>').on('click', ({ target }) => {
            copyAction($element.find(linkSelector).map((_, ele) => `${prefix}${$(ele).text()}`).get().join('\n'), $(target));
          }),
          $element.children('a').length
            ? divider
            : '',
          $element.children('a').length
            ? $('<a>复制全部</a>').on('click', async ({ target }) => {
              if (!cacheText) {
                const pageList = await categoryMembers(mw.config.get('wgPageName'), [type]);
                cacheText = pageList.join('\n');
              }
              copyAction(cacheText, $(target));
            })
            : '',
          bracketEnd,
        ),
      );
    };

    // 子分类
    addCopyButton($('#mw-subcategories'), 'subcat', 'Category:');

    // 分类内页面
    addCopyButton($('#mw-pages'), 'page');

    // 分类内文件
    addCopyButton($('#mw-category-media'), 'file', 'File:', 'li a.galleryfilename');
  }
  if (mw.config.get('wgAction') === 'history' && document.getElementById('ca-edit')) {
    $('#pagehistory>li:not(:first-child)').each((num, ele) => {
      const oldid = $(ele).attr('data-mw-revid');
      const wgScript = mw.config.get('wgScript');
      $(ele)
        .children('.mw-history-undo')
        .children('a:first-child')
        .after(` | <a title="编辑自此版本" href="${wgScript}?action=edit&oldid=${oldid}&summary=编辑自[[Special:Permanentlink/${oldid}|版本${oldid}]]">编辑</a>`);
      if (num === $('#pagehistory>li:not(:first-child)').length - 1) {
        $(ele).append(`（<span class="mw-history-undo"><a title="编辑自此版本" href="${wgScript}?action=edit&oldid=${oldid}&summary=编辑自[[Special:Permanentlink/${oldid}|版本${oldid}]]">编辑</a></span>）`);
      }
    });
  }
});
