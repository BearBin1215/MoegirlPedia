import React, { useEffect, useRef, useState } from 'react';
import { IndexLayout } from 'oojs-ui-react';
import { ensureOOUI, unwrapJQuery, compareLayoutStyle } from '../../components/ooui';

function OriginalIndexLayout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const TabPanel = OO.ui.TabPanelLayout as unknown as new (
        name: string,
        config?: Record<string, unknown>,
      ) => { $element: { append: (...args: unknown[]) => void } };
      const Index = OO.ui.IndexLayout as unknown as new (
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
      index.addTabPanels([panel1, panel2, panel3]);
      containerRef.current.appendChild(unwrapJQuery(index.$element));
      setStatus('原版已就绪（点击页签切换；聚焦页签栏后←→切换观察自动聚焦）');
    }).catch(() => setStatus('原版加载失败'));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <p>{status}</p>
      <div ref={containerRef} />
    </div>
  );
}

function IndexComparePage() {
  const [activeKey, setActiveKey] = useState<string>();

  const options = [
    { key: 'one', label: '第一个页签', children: <p>第一个页签内容（纯文本）</p> },
    {
      key: 'two',
      label: '第二个页签',
      children: (
        <>
          <p>第二个页签含可聚焦元素：</p>
          <input placeholder="可聚焦输入框" />
          {' '}
          <button type="button">可聚焦按钮</button>
        </>
      ),
    },
    { key: 'three', label: '第三个页签', children: <p>第三个页签内容</p> },
  ];

  return (
    <>
      <h1>IndexLayout 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        对照点：顶部页签样式与选中态、点击切换、聚焦页签栏后←→/↑↓环绕切换、
        Enter确认、切换面板后自动聚焦面板内第一个可聚焦元素（autoFocus）、
        aria-controls/aria-labelledby 关联、非激活面板 hidden + aria-hidden。
      </p>
      <div style={compareLayoutStyle}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          {/* expanded（absolute定位）布局需要有高度的父容器 */}
          <div style={{ position: 'relative', height: 320 }}>
            <OriginalIndexLayout />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <p>当前页签：{activeKey ?? 'one（默认选中第一个）'}</p>
          <div style={{ position: 'relative', height: 320 }}>
            <IndexLayout
              options={options}
              defaultKey='one'
              onChange={({ value }) => setActiveKey(value as string)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

IndexComparePage.displayName = 'IndexComparePage';

export default IndexComparePage;
