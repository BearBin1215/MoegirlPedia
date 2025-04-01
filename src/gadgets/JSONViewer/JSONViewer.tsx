import React, { useState, useEffect, type FC } from 'react';
import ReactJson from 'react18-json-view';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';

const useDarkTheme = () => document.body.classList.contains('theme-dark');

const JSONViewer: FC<{ json: object }> = ({ json }) => {
  // 是否使用暗色模式
  const [dark, setDark] = useState(window.jsonViewerDark || useDarkTheme());

  useEffect(() => {
    if (mw.config.get('skin') !== 'moeskin') {
      return;
    }
    /** 监视moeskin控制暗色模式的类产生变化 */
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && useDarkTheme()) {
          setDark(true);
        } else if (mutation.attributeName === 'class' && !useDarkTheme()) {
          setDark(false);
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ReactJson
      src={json}
      displaySize
      editable
      collapseStringMode='word'
      theme={window.jsonViewerTheme || 'vscode'}
      dark={dark}
    />
  );
};

export default JSONViewer;
