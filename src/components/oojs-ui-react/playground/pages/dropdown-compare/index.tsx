import React, { useRef, useState } from 'react';
import { Dropdown } from 'oojs-ui-react';
import { AriaProbe, findOwnedMenu } from '../../components/AriaProbe';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

/** 菜单的动态ARIA属性：读数两侧取同一组属性名 */
const MENU_ARIA = ['aria-expanded', 'aria-owns', 'aria-activedescendant'];



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
      <p>键盘：聚焦handle后Enter/Space开合菜单，↑↓移动高亮，Enter/Space选中（空格选中为本工程增强），ESC关闭</p>
      <AriaProbe
        label='handle读数（持有焦点元素）'
        target={() => containerRef.current?.querySelector<HTMLElement>('.oo-ui-dropdownWidget-handle') ?? null}
        attrs={MENU_ARIA}
      />
      <AriaProbe
        label='handle声明拥有的菜单根读数'
        target={() => findOwnedMenu(containerRef.current?.querySelector<HTMLElement>('.oo-ui-dropdownWidget-handle'))}
        attrs={MENU_ARIA}
      />
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
  const paneRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div ref={paneRef}>
        <Dropdown
          label='please select'
          options={reactOptions}
          value={value}
          onChange={(v) => setValue(v)}
        />
      </div>
      <p>键盘：聚焦handle后Enter/Space开合菜单，↑↓移动高亮，Enter/Space选中（空格选中为本工程增强），ESC关闭</p>
      <AriaProbe
        label='handle读数（持有焦点元素）'
        target={() => paneRef.current?.querySelector<HTMLElement>('.oo-ui-dropdownWidget-handle') ?? null}
        attrs={MENU_ARIA}
      />
      <AriaProbe
        label='handle声明拥有的菜单根读数'
        target={() => findOwnedMenu(paneRef.current?.querySelector<HTMLElement>('.oo-ui-dropdownWidget-handle'))}
        attrs={MENU_ARIA}
      />
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

/**
 * 可滚动容器场景（对照"裁剪锚点=就近滚动容器"与"锚点滚出容器即隐藏菜单"）：
 * 容器固定高度、内容撑超出以产生滚动条，两侧同配
 */
const SCROLLER_STYLE = 'height:8em;overflow-y:auto;border:1px solid #c8ccd1;';

/** 原版侧：下拉位于可滚动容器内（容器即菜单的裁剪锚点） */
function OriginalScrolledDropdown() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as DropdownUi;
    const box = document.createElement('div');
    box.style.cssText = SCROLLER_STYLE;
    const dropdown = new ui.DropdownWidget({
      label: '滚动容器内',
      menu: {
        items: [
          new ui.MenuOptionWidget({ data: 'a', label: 'foo' }),
          new ui.MenuOptionWidget({ data: 'b', label: 'bar' }),
          new ui.MenuOptionWidget({ data: 'c', label: 'baz' }),
          new ui.MenuOptionWidget({ data: 'd', label: 'qux' }),
        ],
      },
    });
    register(dropdown);
    box.appendChild(unwrapJQuery(dropdown.$element));
    box.append(Object.assign(document.createElement('div'), { style: 'height:20em' }));
    container.appendChild(box);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactScrolledDropdown() {
  const [value, setValue] = useState<string | number | undefined>();

  return (
    <div style={{ height: '8em', overflowY: 'auto', border: '1px solid #c8ccd1' }}>
      <Dropdown
        label='滚动容器内'
        options={[
          { value: 'a', children: 'foo' },
          { value: 'b', children: 'bar' },
          { value: 'c', children: 'baz' },
          { value: 'd', children: 'qux' },
        ]}
        value={value}
        onChange={(v) => setValue(v)}
      />
      <div style={{ height: '20em' }} />
    </div>
  );
}

function DropdownComparePage() {
  return (
    <CompareLayout
      title='Dropdown 对照'
      description={(
        <>
          对照点：点击/Enter/Space开合菜单、↑↓键盘高亮移动、Enter/Space选中高亮项（空格选中为本工程增强）、
          Home/End跳转、ESC/点击外部关闭、选中后label更新、分组标题项；
          菜单浮动于handle下方并按就近可滚动容器钳高（含滚动条沟槽）、锚点滚出该容器即隐藏。
          <br />
          ARIA对照（基础用法区块下方实时读数）：handle作为持有焦点的combobox，
          须在<b>handle</b>上给出<code>aria-expanded</code>/<code>aria-owns</code>/
          <code>aria-activedescendant</code>（对齐原版<code>setFocusOwner(widget.$tabIndexed)</code>），
          菜单根自身不应输出<code>aria-activedescendant</code>。
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

      <h2>可滚动容器内（裁剪锚点＝就近滚动容器）</h2>
      <CompareColumns original={<OriginalScrolledDropdown />}>
        <ReactScrolledDropdown />
      </CompareColumns>
    </CompareLayout>
  );
}

DropdownComparePage.displayName = 'DropdownComparePage';

export default DropdownComparePage;
