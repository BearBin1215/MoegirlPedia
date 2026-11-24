import React, { useSyncExternalStore } from 'react';
import ReactJson from 'react18-json-view';
import { isDarkTheme, subscribeTheme } from '@/utils/theme';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';

/** 展示 JSON 内容，并实时跟随页面主题；显式设为 true 时始终使用暗色。 */
function JSONViewer({ json }: { json: object }) {
  const skinDark = useSyncExternalStore(subscribeTheme, isDarkTheme);
  const dark = window.jsonViewerDark === true || skinDark;

  return (
    <ReactJson
      src={json}
      displaySize
      collapseStringMode='word'
      collapseStringsAfterLength={150}
      theme={window.jsonViewerTheme || 'vscode'}
      dark={dark}
    />
  );
}

export default JSONViewer;
