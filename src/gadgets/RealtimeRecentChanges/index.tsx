import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import RealtimeRecentChanges from './RealtimeRecentChanges';

$(() => {
  if (mw.config.get('wgCanonicalSpecialPageName') !== 'Recentchanges') {
    return;
  }
  const initialData = [];
  const rootNode = document.querySelector('.mw-changeslist');
  createRoot(rootNode!).render(
    <StrictMode>
      <RealtimeRecentChanges initialData={initialData} />
    </StrictMode>,
  );
});
