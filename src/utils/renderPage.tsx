import React, { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * 替换页面内容
 * @param component 页面内容
 * @param header 页面标题
 * @param suffix 显示落款
 */
const renderPage = (
  component: ReactNode,
  header?: string,
  suffix: boolean | ReactNode = true,
) => {
  // 页面内容及元数据初始化
  if (mw.config.get('wgNamespaceNumber') === -1) {
    mw.config.set('wgCanonicalSpecialPageName', mw.config.get('wgTitle'));
    $('.mw-invalidspecialpage').removeClass('mw-invalidspecialpage');
  }
  $('#contentSub').remove();

  // 渲染页面主体
  const pageRoot = createRoot(document.getElementById('mw-content-text')!);
  pageRoot.render(
    <StrictMode>
      {component}
    </StrictMode>,
  );

  // 渲染页面标题
  if (header) {
    document.title = `${header} - 萌娘百科_万物皆可萌的百科全书`;
    const firstHeading = document.getElementById('firstHeading')!;
    $(firstHeading).css({
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    });
    const headerRoot = createRoot(firstHeading);
    headerRoot.render(
      <>
        {header}
        {suffix === true && (
          <div style={{ fontSize: '0.6em' }}>
            By
            {' '}
            <a href='/User:BearBin'>BearBin</a>
          </div>
        )}
        {suffix && suffix !== true && suffix}
      </>,
    );
  }
};

export default renderPage;
