import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UserLinkContext, type CachedUserGroups } from '@/components/MediaWiki';
import DynamicRecentChanges from './DynamicRecentChanges';

$(() => {
  if (mw.config.get('wgCanonicalSpecialPageName') !== 'Recentchanges') {
    return;
  }
  mw.loader.using([
    'mediawiki.api',
    'moment',
    'oojs-ui',
    'oojs-ui.styles.icons-media', // 用于启动按钮的play/stop图标样式
  ]).then(() => {
    // const rcLineNodes = document.querySelectorAll('.mw-enhanced-rc[data-mw-revid], .mw-enhanced-rc[data-mw-logid]');
    /** 从当前DOM读取的初始数据 */
    // const initialData = [...rcLineNodes].map((ele, index): ChangeslistLineProps => {
    //   const utcTimeString = ele.getAttribute('data-mw-ts')!;
    //   // 解析时间字符串
    //   const year = +utcTimeString.substring(0, 4);
    //   const month = +utcTimeString.substring(4, 6) - 1; // 月份从0开始
    //   const day = +utcTimeString.substring(6, 8);
    //   const hour = +utcTimeString.substring(8, 10);
    //   const minute = +utcTimeString.substring(10, 12);
    //   const second = +utcTimeString.substring(12, 14);

    //   let ns = 0;
    //   let type: 'edit' | 'log' | 'new' = 'edit';
    //   let unpatrolled = false;
    //   let patrolled = false;
    //   let autopatrolled = false;
    //   for (const className of ele.classList) {
    //     if (className.startsWith('mw-changeslist-ns-')) {
    //       ns = parseInt(className.substring(18), 10);
    //     }
    //     switch (className) {
    //       case 'mw-changeslist-log':
    //         type = 'log';
    //         break;
    //       case 'mw-changeslist-src-mw-new':
    //         type = 'new';
    //         break;
    //       case 'mw-changeslist-reviewstatus-unpatrolled':
    //         unpatrolled = true;
    //         break;
    //       case 'mw-changeslist-reviewstatus-manual':
    //         patrolled = true;
    //         break;
    //       case 'mw-changeslist-reviewstatus-auto':
    //         autopatrolled = true;
    //         break;
    //     }
    //   }

    //   const userLink = ele.querySelector<HTMLAnchorElement>('.mw-userlink')!;
    //   const historyLink = ele.querySelector<HTMLAnchorElement>('.mw-changeslist-history');
    //   const diffLink = ele.querySelector<HTMLAnchorElement>('.mw-changeslist-diff');
    //   const lenDiffElement = ele.querySelector('.mw-plusminus-pos, .mw-plusminus-neg')!;

    //   /** 根据长度变化元素计算更改前后长度 */
    //   const newlen = type === 'log' ? 0
    //     : +lenDiffElement.getAttribute('title')!.replace(/^.+(\d(,\d+)*).+$/, '$1');
    //   const difflen = type === 'log' ? 0
    //     : +lenDiffElement.textContent!.replace(/^.+(\d(,\d+)*).+$/, '$1');
    //   const oldlen = lenDiffElement?.className === 'mw-plusminus-pos' ? newlen - difflen : newlen + difflen;

    //   const logactionMatch = ele.getAttribute('data-mw-logaction')!.match(/^(.+)\/(.+)$/);

    //   return {
    //     rcid: index,
    //     type,
    //     timestamp: moment.utc([year, month, day, hour, minute, second]),
    //     title: ele.querySelector('[data-target-page]')!.getAttribute('data-target-page')!,
    //     pageid: type === 'log' ? 0 : +(new URLSearchParams(historyLink!.href).get('curid')!),
    //     ns,
    //     revid: ele.getAttribute('data-mw-revid')!,
    //     logid: ele.getAttribute('data-mw-logid')!,
    //     old_revid: type === 'log' ? 0 : +(new URLSearchParams(diffLink!.href).get('oldid')!),
    //     bot: !!ele.querySelector('.botedit'),
    //     unpatrolled,
    //     patrolled,
    //     autopatrolled,
    //     newlen,
    //     oldlen,
    //     user: userLink.textContent!,
    //     userid: +userLink.getAttribute('data-user-id')!,
    //     parsedcomment: ele.querySelector('.comment')?.innerHTML.replace(/^(（.+）)$/, '$1') || '',
    //     logtype: logactionMatch?.[1] || '',
    //     logaction: logactionMatch?.[2] || '',
    //     logparams: {

    //     },
    //   };
    // });
    /** 用户是否开启显示头像小工具 */
    const showAvatar = !!document.querySelector('.mw-changeslist .userlink-avatar');
    /** 用户是否开启显示用户组小工具 */
    const showGroup = !!document.querySelector('sup[class^="markrights"]');
    const userGroupStorage = localStorage.getItem('AnnTool-localObjectStorage/usergroup/cache');
    const userGroups = userGroupStorage && userGroupStorage.startsWith('JSON|{')
      ? JSON.parse(userGroupStorage.replace('JSON|', '')).groups as CachedUserGroups
      : {};

    const rootNode = document.createDocumentFragment();
    createRoot(rootNode).render(
      <StrictMode>
        <UserLinkContext.Provider value={{ showAvatar, showGroup, userGroups }}>
          {/* <DynamicRecentChanges initialData={mergeData([])} /> */}
          <DynamicRecentChanges />
        </UserLinkContext.Provider>
      </StrictMode>,
    );
    document.querySelector('.mw-changeslist')!.before(rootNode);
  });
});
