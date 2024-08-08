import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from 'oojs-ui-react';
import './index.less';
import type { FC } from 'react';

/** 可用的搜索代码 */
type SearchCode =
  'insource' | // 源码包含
  'prefix' | // 前缀
  'intitle' | // 标题包含
  'incategory' | // 属于分类
  'linksto' | // 链接到
  'hastemplate' | // 嵌入模板
  'contentmodel' | // 内容模型
  'subpageof' | // 从属子页面
  'filetype' | // 文件类型
  'filemime' | // 文件MIME
  'filesize' | // 文件大小
  'filewidth' | // 文件宽度
  'fileheight' | // 文件高度
  'fileres' | // 文件分辨率
  'filebits' | // 文件色深
  undefined;

/** 搜索条件 */
interface Condition {
  type: SearchCode;
  text: string;
}

const AdvancedPanel: FC = () => {
  const [show, setShow] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([]);

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
