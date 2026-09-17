import React, { useRef, useState } from 'react';
import { ComboBoxInput } from 'oojs-ui-react';
import { AriaProbe, findOwnedMenu } from '../../components/AriaProbe';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

/** 菜单的动态ARIA属性：读数两侧取同一组属性名 */
const MENU_ARIA = ['aria-expanded', 'aria-owns', 'aria-activedescendant'];

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

    // 与原版对应：ComboBoxInputWidget继承TextInputWidget，同样具备标签与required指示器回退
    const Combo = oo.ui.ComboBoxInputWidget as unknown as new (config?: Record<string, unknown>) => { $element: unknown };
    const labelled = new Combo({
      options: comboOptions,
      label: '带标签',
      required: true,
      placeholder: 'label + required（指示器缺省回退）',
    });
    register(labelled);
    const row = document.createElement('div');
    row.textContent = '带标签';
    row.appendChild(unwrapJQuery(labelled.$element));
    container.appendChild(row);
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>当前值：{value}</p>
      <p>键盘：输入展开菜单、↑↓移动高亮、Enter选定并收起、Esc收起、下拉按钮切换</p>
      <AriaProbe
        label='输入框读数（持有焦点元素）'
        target={() => containerRef.current?.querySelector<HTMLElement>('input.oo-ui-inputWidget-input') ?? null}
        attrs={MENU_ARIA}
      />
      <AriaProbe
        label='输入框声明拥有的菜单根读数'
        target={() => findOwnedMenu(containerRef.current?.querySelector<HTMLElement>('input.oo-ui-inputWidget-input'))}
        attrs={MENU_ARIA}
      />
    </div>
  );
}

function ReactComboBox() {
  const [value, setValue] = useState<string>('');
  const paneRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div ref={paneRef}>
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
      </div>
      <p>当前值：{value === '' ? '（尚未修改）' : `"${value}"`}</p>
      <p>键盘：输入展开菜单、↑↓移动高亮、Enter选定并收起、Esc收起、下拉按钮切换</p>
      <AriaProbe
        label='输入框读数（持有焦点元素）'
        target={() => paneRef.current?.querySelector<HTMLElement>('input.oo-ui-inputWidget-input') ?? null}
        attrs={MENU_ARIA}
      />
      <AriaProbe
        label='输入框声明拥有的菜单根读数'
        target={() => findOwnedMenu(paneRef.current?.querySelector<HTMLElement>('input.oo-ui-inputWidget-input'))}
        attrs={MENU_ARIA}
      />
      <ComboBoxInput
        options={[
          { value: 'Option A', children: 'Option A' },
          { value: 'Option B', children: 'Option B' },
        ]}
        label='带标签'
        required
        placeholder='label + required（指示器缺省回退）'
      />
    </div>
  );
}

function ComboBoxComparePage() {
  return (
    <CompareLayout
      title='ComboBoxInput 对照'
      description={(
        <>
          对照点：输入即展开菜单、按值精确匹配选中项、↑↓键盘高亮（环绕）、Enter选定高亮项并收起、
          Esc/点击外部收起、下拉按钮切换菜单并聚焦输入框、无选项时隐藏按钮（empty类）。
          <br />
          ARIA对照（下方实时读数）：输入框作为持有焦点的combobox，须在<b>输入框</b>上给出
          <code>aria-owns</code>与键盘高亮项的<code>aria-activedescendant</code>
          （对齐原版<code>setFocusOwner(widget.$tabIndexed)</code>，此处$tabIndexed为$input），
          菜单根自身不应输出<code>aria-activedescendant</code>。
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
