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
    'ext.gadget.LocalObjectStorage', // 用于读取ModerationStatus工具的缓存
  ]).then(() => {
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
          <DynamicRecentChanges />
        </UserLinkContext.Provider>
      </StrictMode>,
    );
    document.querySelector('.mw-changeslist')!.before(rootNode);
  });
});
