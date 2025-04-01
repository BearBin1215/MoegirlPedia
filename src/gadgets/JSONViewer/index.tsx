import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { pageSource } from '@/utils/api';
import JSONViewer from './JSONViewer';
import './index.less';

declare global {
  interface Window {
    /** 颜色主题 */
    jsonViewerTheme?: 'default' | 'a11y' | 'github' | 'vscode' | 'atom' | 'winter-is-coming';
    /** 暗色模式 */
    jsonViewerDark?: boolean;
  }
}

$(() => (async () => {
  const jsonElement = document.getElementsByClassName('mw-json')[0] as HTMLDivElement;
  if (!jsonElement || mw.config.get('wgPageContentModel') !== 'json') {
    return;
  }

  const json = await pageSource(mw.config.get('wgPageName'));
  const container = document.createElement('div');
  container.id = 'bearbintools-jsonviewer';
  jsonElement.replaceWith(container);

  createRoot(container).render(
    <StrictMode>
      <JSONViewer json={json!} />
    </StrictMode>,
  );
})());
