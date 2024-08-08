import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'oojs-ui-react';
import './index.less';
import type { FC } from 'react';

const AdvancedPanel: FC = () => {
  const [show, setShow] = useState(false);

  /** 展开或隐藏面板 */
  const toggle = () => {
    setShow(!show);
  };

  return (
    <div id='advanced-search-panel' className={show ? 'panel-show' : 'panel-hide'}>
      {createPortal( // 将按钮渲染在“搜索”按钮后面
        <Button onClick={toggle} id='advanced-search-toggle'>高级</Button>,
        document.querySelector('#mw-search-top-table .oo-ui-actionFieldLayout-button')!,
      )}
      高级搜索
    </div>
  );
};

export default AdvancedPanel;
