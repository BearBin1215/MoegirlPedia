import React, { useState, useEffect, type FC } from 'react';
import ReactJson from 'react18-json-view';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';

const isMoeskin = mw.config.get('skin') === 'moeskin';

const useDarkTheme = () => {
  if (isMoeskin) {
    return document.documentElement.getAttribute('color-mode') === 'dark';
  }
  return document.documentElement.classList.contains('skin-theme-clientpref-night');
};

const JSONViewer: FC<{ json: object }> = ({ json }) => {
  // 是否使用暗色模式
  const [dark, setDark] = useState(window.jsonViewerDark || useDarkTheme());

  useEffect(() => {
    if (isMoeskin) {
      /** 监视moeskin控制暗色模式的html属性产生变化 */
      const observer = new MutationObserver((mutations) => {
        mutations
          .filter(({ attributeName }) => attributeName === 'color-mode')
          .forEach(() => setDark(useDarkTheme()));
      });

      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['color-mode'],
      });

      return () => observer.disconnect();
    }
    /** 监视vector-2022控制暗色模式的html类产生变化 */
    const observer = new MutationObserver((mutations) => {
      mutations
        .filter(({ attributeName }) => attributeName === 'class')
        .forEach(() => setDark(useDarkTheme()));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

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
};

export default JSONViewer;
