import React, { useState } from 'react';
import { ButtonSelect } from 'oojs-ui-react';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type OriginalSelect = {
  $element: unknown;
  on: (event: string, handler: (item: unknown) => void) => void;
};

type ButtonSelectUi = {
  ButtonSelectWidget: new (config?: Record<string, unknown>) => OriginalSelect;
  ButtonOptionWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 选项配置：两侧共用同一份数据，保证逐行对照 */
type OptionSpec = {
  data: string;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: string;
};

/** 变体行：两侧共用同一份变体定义 */
type VariantSpec = {
  name: string;
  options: OptionSpec[];
  /** 整组禁用 */
  disabled?: boolean;
  /** 选项无边框（原版逐项framed:false） */
  frameless?: boolean;
};

const variants: VariantSpec[] = [
  {
    name: '常规（无选中）',
    options: [
      { data: 'a', label: '选项A' },
      { data: 'b', label: '选项B' },
      { data: 'c', label: '选项C' },
    ],
  },
  {
    name: '默认选中B',
    options: [
      { data: 'a', label: '选项A' },
      { data: 'b', label: '选项B', selected: true },
      { data: 'c', label: '选项C' },
    ],
  },
  {
    name: '含禁用项',
    options: [
      { data: 'a', label: '选项A' },
      { data: 'b', label: '禁用项', disabled: true },
      { data: 'c', label: '选项C' },
    ],
  },
  {
    name: '整组禁用',
    disabled: true,
    options: [
      { data: 'a', label: '选项A' },
      { data: 'b', label: '选项B', selected: true },
    ],
  },
  {
    name: '无边框',
    frameless: true,
    options: [
      { data: 'a', label: '选项A', selected: true },
      { data: 'b', label: '选项B' },
    ],
  },
  {
    name: '带图标',
    options: [
      { data: 'a', label: '编辑', icon: 'edit', selected: true },
      { data: 'b', label: '删除', icon: 'trash' },
    ],
  },
];

/** 原版侧：ButtonSelectWidget逐变体输出（行结构与React侧的p一致） */
function OriginalButtonSelects({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ButtonSelectUi;
    const row = createRowAppender(container, register);
    for (const variant of variants) {
      const select = row(ui.ButtonSelectWidget, variant.name, {
        disabled: variant.disabled,
        items: variant.options.map((option) => new ui.ButtonOptionWidget({
          data: option.data,
          label: option.label,
          selected: option.selected,
          disabled: option.disabled,
          icon: option.icon,
          framed: variant.frameless ? false : undefined,
        })),
      });
      select.on('select', (item) => {
        addLog(`原版 ${variant.name} select=${String((item as { data?: unknown } | null)?.data)}`);
      });
    }
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与原版逐行对应（defaultValue对应原版选项的selected） */
function ReactButtonSelects({ addLog }: { addLog: (msg: string) => void }) {
  return (
    <div>
      {variants.map((variant) => (
        <div key={variant.name}>
          {variant.name}
          <ButtonSelect
            disabled={variant.disabled}
            options={variant.options.map((option) => ({
              value: option.data,
              children: option.label,
              disabled: option.disabled,
              icon: option.icon,
              framed: variant.frameless ? false : undefined,
            }))}
            defaultValue={variant.options.find((option) => option.selected)?.data}
            onChange={(value) => addLog(`React ${variant.name} select=${String(value)}`)}
          />
        </div>
      ))}
    </div>
  );
}

function ButtonSelectComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title='ButtonSelect 对照'
      description={(
        <>
          对照点：按钮式选项的根类（optionWidget + buttonElement/buttonOption）、选中态同时给出
          optionWidget-selected与buttonElement-active、选项不可高亮（悬停不高亮、方向键直接改选而非
          移动高亮）、Enter重申当前项不产生选中事件、拖拽跨项选择、整组禁用时选项继承禁用类、
          aria-activedescendant指向选中项。键盘：Tab聚焦组根后↑↓←→改选。
        </>
      )}
    >
      <CompareColumns original={<OriginalButtonSelects addLog={addLog} />}>
        <ReactButtonSelects addLog={addLog} />
      </CompareColumns>

      <h2>事件日志</h2>
      <ul>
        {log.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </CompareLayout>
  );
}

ButtonSelectComparePage.displayName = 'ButtonSelectComparePage';

export default ButtonSelectComparePage;
