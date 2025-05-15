import React, { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * 替换特殊页面内容
 */
const renderSpecialPage = (
  /** 页面内容 */
  component: ReactNode,
  /** 页面标题 */
  header?: string,
  /** 显示落款 */
  suffix: boolean | ReactNode = true,
) => {
  mw.config.set('wgCanonicalSpecialPageName', mw.config.get('wgTitle'));
  $('.mw-invalidspecialpage').removeClass('mw-invalidspecialpage');
  $('#contentSub').remove();
  /** 渲染页面主体 */
  const pageRoot = createRoot(document.getElementById('mw-content-text')!);
  pageRoot.render(
    <StrictMode>
      {component}
    </StrictMode>,
  );
  if (header) {
    document.title = `${header} - 萌娘百科_万物皆可萌的百科全书`;
    /** 渲染页面标题 */
    const firstHeading = document.getElementById('firstHeading')!;
    $(firstHeading).css({
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    });
    const headerRoot = createRoot(firstHeading);
    headerRoot.render(
      <StrictMode>
        {header}
        {suffix === true && (
          <div style={{ fontSize: '0.6em' }}>
            By
            {' '}
            <a href='/User:BearBin'>BearBin</a>
          </div>
        )}
        {suffix && suffix !== true && suffix}
      </StrictMode>,
    );
  }
};

export default renderSpecialPage;
