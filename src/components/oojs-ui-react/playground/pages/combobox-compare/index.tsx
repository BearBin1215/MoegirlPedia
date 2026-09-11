import React, { useEffect, useRef, useState } from 'react';
import { ComboBoxInput } from 'oojs-ui-react';
import { createOOUIWidgets, ensureOOUI, unwrapJQuery, compareLayoutStyle } from '../../components/ooui';

const comboOptions = [
  { data: 'Option A', label: 'Option A' },
  { data: 'Option B', label: 'Option B' },
  { data: 'Option C', label: 'Option C' },
  { data: 'Other', label: '自定义输入也合法' },
];

function OriginalComboBox() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');
  const [value, setValue] = useState('（尚未修改）');

  useEffect(() => {
    let cancelled = false;
    const host = createOOUIWidgets();
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const ui = OO.ui as unknown as {
        ComboBoxInputWidget: new (config?: Record<string, unknown>) => {
          $element: unknown;
          on: (event: string, handler: (v?: string) => void) => void;
          getValue: () => string;
        };
      };
      const combo = new ui.ComboBoxInputWidget({
        options: comboOptions,
        placeholder: '输入或从下拉选择',
      });
      host.add(combo);
      combo.on('change', () => setValue(combo.getValue()));
      containerRef.current.appendChild(unwrapJQuery(combo.$element));
      setStatus('原版已就绪');
    }).catch(() => setStatus('原版加载失败'));
    return () => {
      cancelled = true;
      host.destroyAll();
    };
  }, []);

  return (
    <div>
      <p>{status}</p>
      <div ref={containerRef} />
      <p>当前值：{value}</p>
      <p>键盘：输入展开菜单、↑↓移动高亮、Enter选定并收起、Esc收起、下拉按钮切换</p>
    </div>
  );
}

function ReactComboBox() {
  const [value, setValue] = useState<string>('');

  return (
    <div>
      <ComboBoxInput
        options={[
          { value: 'Option A', children: 'Option A' },
          { value: 'Option B', children: 'Option B' },
          { value: 'Option C', children: 'Option C' },
          { value: 'Other', children: '自定义输入也合法' },
        ]}
        placeholder='输入或从下拉选择'
        value={value}
        onChange={(next) => setValue(next)}
      />
      <p>当前值：{value === '' ? '（尚未修改）' : `"${value}"`}</p>
      <p>键盘：输入展开菜单、↑↓移动高亮、Enter选定并收起、Esc收起、下拉按钮切换</p>
    </div>
  );
}

function ComboBoxComparePage() {
  return (
    <>
      <h1>ComboBoxInput 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        对照点：输入即展开菜单、按值精确匹配选中项、↑↓键盘高亮（环绕）、Enter选定高亮项并收起、
        Esc/点击外部收起、下拉按钮切换菜单并聚焦输入框、无选项时隐藏按钮（empty类）。
      </p>
      <div style={compareLayoutStyle}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalComboBox />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <ReactComboBox />
        </div>
      </div>
    </>
  );
}

ComboBoxComparePage.displayName = 'ComboBoxComparePage';

export default ComboBoxComparePage;
