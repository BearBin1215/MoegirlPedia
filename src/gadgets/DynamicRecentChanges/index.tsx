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
    const initialData = [];
    const rootNode = document.querySelector('.mw-changeslist');
    /** 用户是否开启显示头像小工具 */
    const showAvatar = !!document.querySelector('.mw-changeslist .userlink-avatar');
    /** 用户是否开启显示用户组小工具 */
    const showGroup = !!document.querySelector('sup[class^="markrights"]');
    const userGroupStorage = localStorage.getItem('AnnTool-localObjectStorage/usergroup/cache');
    const userGroups = userGroupStorage && userGroupStorage.startsWith('JSON|')
      ? JSON.parse(userGroupStorage.replace('JSON|', '')).groups as CachedUserGroups
      : {};
    createRoot(rootNode!).render(
      <StrictMode>
        <UserLinkContext.Provider value={{ showAvatar, showGroup, userGroups }}>
          <DynamicRecentChanges initialData={initialData} />
        </UserLinkContext.Provider>
      </StrictMode>,
    );
  });
});
