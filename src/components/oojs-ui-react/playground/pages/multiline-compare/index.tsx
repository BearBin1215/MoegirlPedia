import React, { useRef, useState } from 'react';
import { MultilineTextInput } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type MultilineWidget = {
  $element: unknown;
  setValue: (v: string) => void;
  getValue: () => string;
};

/** 原版侧：autosize高度自适应与程序化赋值后高度重算 */
function OriginalMultiline() {
  const widgetRef = useRef<MultilineWidget | null>(null);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const widget = new (oo.ui.MultilineTextInputWidget as unknown as new (config?: Record<string, unknown>) => MultilineWidget)({
      autosize: true,
      rows: 3,
      maxRows: 10,
      placeholder: '原版autosize',
    });
    register(widget);
    // $element为jQuery对象，取其包裹的真实DOM节点
    container.appendChild(unwrapJQuery(widget.$element));
    widgetRef.current = widget;
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>
        <button
          type='button'
          disabled={!widgetRef.current}
          onClick={() => {
            widgetRef.current?.setValue('程序化赋值\nline2\nline3\nline4\nline5');
          }}
        >
          原版setValue（5行）
        </button>
      </p>
    </div>
  );
}

function ReactMultiline() {
  const [value, setValue] = useState('');

  return (
    <div>
      <MultilineTextInput
        autosize
        rows={3}
        maxRows={10}
        placeholder='React版autosize'
        value={value}
        onChange={(v) => setValue(v)}
      />
      <p>
        <button
          type='button'
          onClick={() => {
            setValue('程序化赋值\nline2\nline3\nline4\nline5');
          }}
        >
          React版setValue（5行）
        </button>
      </p>
    </div>
  );
}

/** 原版侧：行数/图标/label/禁用变体 */
function OriginalVariants() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const Multiline = oo.ui.MultilineTextInputWidget as unknown as new (config?: Record<string, unknown>) => { $element: unknown };
    const row = createRowAppender(container, register);
    row(Multiline, '设定行数（rows=3）', { rows: 3 });
    row(Multiline, '带图标', { rows: 3, icon: 'edit', indicator: 'required' });
    row(Multiline, 'label after（默认）', { rows: 3, label: 'after (default)' });
    row(Multiline, 'label before', { rows: 3, label: 'before', labelPosition: 'before' });
    row(Multiline, '禁用', { rows: 3, disabled: true });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与原版逐行对应的变体 */
function ReactVariants() {
  return (
    <div>
      <p>设定行数（rows=3）<MultilineTextInput rows={3} /></p>
      <p>带图标<MultilineTextInput rows={3} icon='edit' indicator='required' /></p>
      <p>label after（默认）<MultilineTextInput rows={3} label='after (default)' /></p>
      <p>label before<MultilineTextInput rows={3} label='before' labelPosition='before' /></p>
      <p>禁用<MultilineTextInput rows={3} disabled /></p>
    </div>
  );
}

function MultilineComparePage() {
  return (
    <CompareLayout
      title='MultilineTextInput 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：autosize高度自适应、maxRows上限（rows=3时原版默认maxRows=10）、
          程序化赋值后高度重算、行数/图标/label位置/禁用变体。
        </>
      )}
    >
      <h2>autosize</h2>
      <CompareColumns original={<OriginalMultiline />}>
        <ReactMultiline />
      </CompareColumns>

      <h2>变体</h2>
      <CompareColumns original={<OriginalVariants />}>
        <ReactVariants />
      </CompareColumns>
    </CompareLayout>
  );
}

MultilineComparePage.displayName = 'MultilineComparePage';

export default MultilineComparePage;
