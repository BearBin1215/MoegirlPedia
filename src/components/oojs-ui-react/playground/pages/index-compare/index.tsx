import React from 'react';
import { IndexLayout } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

function OriginalIndexLayout() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const TabPanel = oo.ui.TabPanelLayout as unknown as new (
      name: string,
      config?: Record<string, unknown>,
    ) => { $element: { append: (...args: unknown[]) => void } };
    const Index = oo.ui.IndexLayout as unknown as new (
      config?: Record<string, unknown>,
    ) => { $element: unknown; addTabPanels: (panels: unknown[]) => void };

    const panel1 = new TabPanel('one', { label: '第一个页签' });
    panel1.$element.append('<p>第一个页签内容（纯文本）</p>');
    const panel2 = new TabPanel('two', { label: '第二个页签' });
    panel2.$element.append(
      '<p>第二个页签含可聚焦元素：</p>',
      '<input placeholder="可聚焦输入框">',
      '<button type="button">可聚焦按钮</button>',
    );
    const panel3 = new TabPanel('three', { label: '第三个页签' });
    panel3.$element.append('<p>第三个页签内容</p>');

    const index = new Index();
    register(index);
    index.addTabPanels([panel1, panel2, panel3]);
    container.appendChild(unwrapJQuery(index.$element));
  });

  return (
    <div>
      <p>点击页签切换；聚焦页签栏后←→切换观察自动聚焦</p>
      <div ref={containerRef} />
    </div>
  );
}

function IndexComparePage() {
  const options = [
    { value: 'one', label: '第一个页签', children: <p>第一个页签内容（纯文本）</p> },
    {
      value: 'two',
      label: '第二个页签',
      children: (
        <>
          <p>第二个页签含可聚焦元素：</p>
          <input placeholder='可聚焦输入框' />
          {' '}
          <button type='button'>可聚焦按钮</button>
        </>
      ),
    },
    { value: 'three', label: '第三个页签', children: <p>第三个页签内容</p> },
  ];

  return (
    <CompareLayout
      title='IndexLayout 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：顶部页签样式与选中态、点击切换、聚焦页签栏后←→/↑↓环绕切换、
          Enter确认、切换面板后自动聚焦面板内第一个可聚焦元素（autoFocus）、
          aria-controls/aria-labelledby 关联、非激活面板 hidden + aria-hidden。
        </>
      )}
    >
      <CompareColumns original={(
        // expanded（absolute定位）布局需要有高度的父容器
        <div style={{ position: 'relative', height: 320 }}>
          <OriginalIndexLayout />
        </div>
      )}
      >
        <div style={{ position: 'relative', height: 320 }}>
          <IndexLayout
            options={options}
            defaultValue='one'
          />
        </div>
      </CompareColumns>
    </CompareLayout>
  );
}

IndexComparePage.displayName = 'IndexComparePage';

export default IndexComparePage;
