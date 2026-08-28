import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'oojs-ui-react';
import { ensureOOUI, unwrapJQuery } from '../../components/ooui';

function OriginalDropdown() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const ui = OO.ui as unknown as {
        DropdownWidget: new (config?: Record<string, unknown>) => { $element: unknown };
        MenuOptionWidget: new (config?: Record<string, unknown>) => unknown;
      };
      const items = [
        { data: 'a', label: 'foo' },
        { data: 'b', label: 'bar' },
        { data: 'c', label: 'disabled', disabled: true },
      ].map((opt) => new ui.MenuOptionWidget(opt));
      const dropdown = new ui.DropdownWidget({
        label: 'please select',
        menu: { items },
      });
      containerRef.current.appendChild(unwrapJQuery(dropdown.$element));
      setStatus('原版已就绪');
    }).catch(() => setStatus('原版加载失败'));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <p>{status}</p>
      <div ref={containerRef} />
      <p>键盘：聚焦handle后Enter/Space开合菜单，↑↓移动高亮，Enter选中，ESC关闭</p>
    </div>
  );
}

const reactOptions = [
  { key: 'a', data: 'a', children: 'foo' },
  { key: 'b', data: 'b', children: 'bar' },
  { key: 'c', data: 'c', disabled: true, children: 'disabled' },
];

function DropdownComparePage() {
  const [value, setValue] = useState<string | number | undefined>();

  return (
    <>
      <h1>Dropdown 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        对照点：点击/Enter/Space开合菜单、↑↓键盘高亮移动、Enter选中高亮项、
        Home/End跳转、ESC/点击外部关闭、选中后label更新。
      </p>
      <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalDropdown />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <p>当前值：{value === undefined ? '（未选择）' : value}</p>
          <Dropdown
            label='please select'
            options={reactOptions}
            value={value}
            onChange={({ value: v }) => setValue(v)}
          />
        </div>
      </div>
    </>
  );
}

DropdownComparePage.displayName = 'DropdownComparePage';

export default DropdownComparePage;
