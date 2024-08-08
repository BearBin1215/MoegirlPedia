import React from 'react';
import { createRoot } from 'react-dom/client';
import AdvancedPanel from './AdvancedPanel';

$(() => {
  if (mw.config.get('wgCanonicalSpecialPageName') !== 'Search') {
    return;
  }
  const rootNode = document.createDocumentFragment();
  createRoot(rootNode).render(<AdvancedPanel />);
  document.getElementById('mw-search-top-table')!.after(rootNode);
});
