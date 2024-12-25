import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { UserLinkContext } from '@/components/MediaWiki';
import DynamicRecentChanges from './DynamicRecentChanges';

$(() => {
  if (mw.config.get('wgCanonicalSpecialPageName') !== 'Recentchanges') {
    return;
  }
  mw.loader.using(['mediawiki.api', 'moment', 'oojs-ui', 'oojs-ui.styles.icons-media']).then(() => {
    const initialData = [];
    const rootNode = document.querySelector('.mw-changeslist');
    const showAvatar = !!document.getElementsByClassName('userlink-avatar')[0];
    createRoot(rootNode!).render(
      <StrictMode>
        <UserLinkContext.Provider value={{ showAvatar }}>
          <DynamicRecentChanges initialData={initialData} />
        </UserLinkContext.Provider>
      </StrictMode>,
    );
  });
});
