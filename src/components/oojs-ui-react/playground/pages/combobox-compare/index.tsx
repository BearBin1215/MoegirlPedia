import React, { useState } from 'react';
import { ComboBoxInput } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

const comboOptions = [
  { data: 'Option A', label: 'Option A' },
  { data: 'Option B', label: 'Option B' },
  { data: 'Option C', label: 'Option C' },
  { data: 'Other', label: '自定义输入也合法' },
];

function OriginalComboBox() {
  const [value, setValue] = useState('（尚未修改）');
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const combo = new (oo.ui.ComboBoxInputWidget as unknown as new (config?: Record<string, unknown>) => {
      $element: unknown;
      on: (event: string, handler: (v?: string) => void) => void;
      getValue: () => string;
    })({
      options: comboOptions,
      placeholder: '输入或从下拉选择',
    });
    register(combo);
    combo.on('change', () => setValue(combo.getValue()));
    container.appendChild(unwrapJQuery(combo.$element));
  });

  return (
    <div>
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
    <CompareLayout
      title='ComboBoxInput 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：输入即展开菜单、按值精确匹配选中项、↑↓键盘高亮（环绕）、Enter选定高亮项并收起、
          Esc/点击外部收起、下拉按钮切换菜单并聚焦输入框、无选项时隐藏按钮（empty类）。
        </>
      )}
    >
      <CompareColumns original={<OriginalComboBox />}>
        <ReactComboBox />
      </CompareColumns>
    </CompareLayout>
  );
}

ComboBoxComparePage.displayName = 'ComboBoxComparePage';

export default ComboBoxComparePage;
