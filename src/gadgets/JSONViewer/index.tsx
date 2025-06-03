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
  if (mw.config.get('wgAction') !== 'view') {
    return;
  }
  const jsonElement = document.getElementsByClassName('mw-json')[0] as HTMLDivElement;
  /** 渲染容器 */
  const container = document.createElement('div');
  container.id = 'bearbintools-jsonviewer';
  const root = createRoot(container);

  if (jsonElement && mw.config.get('wgPageContentModel') === 'json') {
    // 页面内容格式为JSON，获取JSON并渲染
    const urlParams = new URLSearchParams(window.location.search);
    const diff = urlParams.get('diff') ?? urlParams.get('oldid');
    const json = await pageSource(
      mw.config.get('wgPageName'),
      diff ? {
        rvstartid: +diff,
        rvendid: +diff,
      } : void 0,
    );
    jsonElement.replaceWith(container);

    root.render(
      <StrictMode>
        <JSONViewer json={JSON.parse(json!)} />
      </StrictMode>,
    );
  } else if (mw.config.get('wgPageContentModel') === 'text' && mw.config.get('wgTitle').includes('json')) {
    // 页面内容格式为纯文本，尝试解析页面文本
    try {
      const json = JSON.parse(document.getElementById('mw-content-text')!.textContent!);
      document.getElementById('mw-content-text')!.replaceChildren(container);
      root.render(
        <StrictMode>
          <JSONViewer json={json} />
        </StrictMode>,
      );
    } catch (e) {
      console.log('json格式无效');
    }
  }
})());
