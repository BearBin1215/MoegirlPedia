import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdvancedPanel from './AdvancedPanel';

$(() => {
  if (mw.config.get('wgCanonicalSpecialPageName') !== 'Search') {
    return;
  }
  const rootNode = document.createDocumentFragment();
  createRoot(rootNode).render(
    <StrictMode>
      <AdvancedPanel />
    </StrictMode>,
  );
  document.querySelector('#search .mw-search-visualclear')!.after(rootNode);
});
