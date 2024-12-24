import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import RealtimeRecentChanges from './RealtimeRecentChanges';

$(() => {
  if (mw.config.get('wgCanonicalSpecialPageName') !== 'Recentchanges') {
    return;
  }
  mw.loader.using(['mediawiki.api', 'moment', 'oojs-ui', 'oojs-ui.styles.icons-media']).then(() => {
    const initialData = [];
    const rootNode = document.querySelector('.mw-changeslist');
    createRoot(rootNode!).render(
      <StrictMode>
        <RealtimeRecentChanges initialData={initialData} />
      </StrictMode>,
    );
  });
});
