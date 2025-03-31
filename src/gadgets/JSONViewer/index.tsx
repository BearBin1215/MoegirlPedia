import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ReactJson from 'react18-json-view';
import { pageSource } from '@/utils/api';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';
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
      <ReactJson
        src={JSON.parse(json!)}
        displaySize
        editable
        theme={window.jsonViewerTheme || 'vscode'}
        dark={window.jsonViewerDark}
      />
    </StrictMode>,
  );
})());
