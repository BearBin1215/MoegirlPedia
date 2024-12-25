import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
        <DynamicRecentChanges
          initialData={initialData}
          showAvatar={showAvatar}
        />
      </StrictMode>,
    );
  });
});
