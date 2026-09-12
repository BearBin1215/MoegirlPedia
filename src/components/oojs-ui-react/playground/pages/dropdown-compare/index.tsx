import React, { useState } from 'react';
import { Dropdown } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type DropdownUi = {
  DropdownWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  MenuOptionWidget: new (config?: Record<string, unknown>) => unknown;
  MenuSectionOptionWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 原版侧：基础下拉（含禁用项与带图标项） */
function OriginalDropdown() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as DropdownUi;
    const items = [
      { data: 'a', label: 'foo' },
      { data: 'b', label: 'bar' },
      { data: 'check', label: '带图标', icon: 'check' },
      { data: 'c', label: 'disabled', disabled: true },
    ].map((opt) => new ui.MenuOptionWidget(opt));
    const dropdown = new ui.DropdownWidget({
      label: 'please select',
      menu: { items },
    });
    register(dropdown);
    container.appendChild(unwrapJQuery(dropdown.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>键盘：聚焦handle后Enter/Space开合菜单，↑↓移动高亮，Enter选中，ESC关闭</p>
    </div>
  );
}

const reactOptions = [
  { value: 'a', children: 'foo' },
  { value: 'b', children: 'bar' },
  { value: 'check', icon: 'check', children: '带图标（icon: "check"）' },
  { value: 'c', disabled: true, children: 'disabled' },
];

function ReactDropdown() {
  const [value, setValue] = useState<string | number | undefined>();

  return (
    <div>
      <Dropdown
        label='please select'
        options={reactOptions}
        value={value}
        onChange={(v) => setValue(v)}
      />
      <p>键盘：聚焦handle后Enter/Space开合菜单，↑↓移动高亮，Enter选中，ESC关闭</p>
    </div>
  );
}

/** 原版侧：分组下拉（MenuSectionOptionWidget作为分组标题） */
function OriginalGroupedDropdown() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as DropdownUi;
    const items = [
      new ui.MenuSectionOptionWidget({ label: 'group1', icon: 'check' }),
      new ui.MenuOptionWidget({ data: 'a', label: 'foo' }),
      new ui.MenuOptionWidget({ data: 'b', label: 'bar' }),
      new ui.MenuSectionOptionWidget({ label: 'group2', icon: 'cancel' }),
      new ui.MenuOptionWidget({ data: 'c', label: 'disabled', disabled: true }),
    ];
    const dropdown = new ui.DropdownWidget({
      label: 'please select',
      menu: { items },
    });
    register(dropdown);
    container.appendChild(unwrapJQuery(dropdown.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

// 不带value属性的选项作为分组，对应原版MenuSectionOptionWidget
const reactGroupedOptions = [
  { icon: 'check', children: 'group1' },
  { value: 'a', children: 'foo' },
  { value: 'b', children: 'bar' },
  { icon: 'cancel', children: 'group2' },
  { value: 'c', disabled: true, children: 'disabled' },
];

function ReactGroupedDropdown() {
  const [value, setValue] = useState<string | number | undefined>();

  return (
    <div>
      <Dropdown
        label='please select'
        options={reactGroupedOptions}
        value={value}
        onChange={(v) => setValue(v)}
      />
      <p>
        不带<code>value</code>属性的选项将作为分组。
      </p>
    </div>
  );
}

function DropdownComparePage() {
  return (
    <CompareLayout
      title='Dropdown 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：点击/Enter/Space开合菜单、↑↓键盘高亮移动、Enter选中高亮项、
          Home/End跳转、ESC/点击外部关闭、选中后label更新、分组标题项。
        </>
      )}
    >
      <h2>基础用法</h2>
      <CompareColumns original={<OriginalDropdown />}>
        <ReactDropdown />
      </CompareColumns>

      <h2>分组</h2>
      <CompareColumns original={<OriginalGroupedDropdown />}>
        <ReactGroupedDropdown />
      </CompareColumns>
    </CompareLayout>
  );
}

DropdownComparePage.displayName = 'DropdownComparePage';

export default DropdownComparePage;
