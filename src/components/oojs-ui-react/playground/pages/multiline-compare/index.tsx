import React, { useRef, useState } from 'react';
import { MultilineTextInput } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

/** 超出可见行数的文本样本：用于对照滚动条出现时指示器与后置标签的让位宽度 */
const SCROLL_SAMPLE = 'line1\nline2\nline3\nline4\nline5';

type MultilineWidget = {
  $element: unknown;
  setValue: (v: string) => void;
  getValue: () => string;
  on: (event: string, handler: () => void) => void;
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
    row(Multiline, '长文本+指示器（滚动条让位）', {
      rows: 3,
      indicator: 'required',
      label: 'after',
      value: SCROLL_SAMPLE,
    });
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
      <div>设定行数（rows=3）<MultilineTextInput rows={3} /></div>
      <div>带图标<MultilineTextInput rows={3} icon='edit' indicator='required' /></div>
      <div>label after（默认）<MultilineTextInput rows={3} label='after (default)' /></div>
      <div>label before<MultilineTextInput rows={3} label='before' labelPosition='before' /></div>
      <div>禁用<MultilineTextInput rows={3} disabled /></div>
      <div>
        长文本+指示器（滚动条让位）
        <MultilineTextInput
          rows={3}
          indicator='required'
          label='after'
          defaultValue={SCROLL_SAMPLE}
        />
      </div>
    </div>
  );
}

/**
 * 原版侧：allowLinebreaks控制换行，两者都经Ctrl/Cmd+Enter派发enter事件（计数见下方文字区）。
 * 该配置缺省为true：Enter插入换行；置false时Enter被吞，且cleanUpValue把粘贴的多行合并为空格
 */
function OriginalLinebreaks() {
  const [allowedCount, setAllowedCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const Multiline = oo.ui.MultilineTextInputWidget as unknown as new (config?: Record<string, unknown>) => MultilineWidget;
    const allowed = new Multiline({
      rows: 3,
      placeholder: 'allowLinebreaks缺省(true)：Enter换行，Ctrl/Cmd+Enter派发enter',
    });
    const blocked = new Multiline({
      rows: 3,
      allowLinebreaks: false,
      placeholder: 'allowLinebreaks=false：Enter被吞，多行粘贴合并为空格',
    });
    register(allowed, blocked);
    allowed.on('enter', () => setAllowedCount((count) => count + 1));
    blocked.on('enter', () => setBlockedCount((count) => count + 1));
    const allowedRow = document.createElement('div');
    allowedRow.textContent = 'allowLinebreaks=true（缺省）';
    allowedRow.appendChild(unwrapJQuery(allowed.$element));
    const blockedRow = document.createElement('div');
    blockedRow.textContent = 'allowLinebreaks=false';
    blockedRow.appendChild(unwrapJQuery(blocked.$element));
    container.append(allowedRow, blockedRow);
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>
        Ctrl/Cmd+Enter派发enter事件次数：允许换行 {allowedCount} / 禁止换行 {blockedCount}
      </p>
    </div>
  );
}

/**
 * React侧：Enter恒插入换行。本工程不提供allowLinebreaks配置与enter事件回调
 * （已登记为「舍弃」，见docs/TODO.md），本区块确认换行行为与原版allowLinebreaks=true一致
 */
function ReactLinebreaks() {
  const [value, setValue] = useState('');

  return (
    <div>
      <div>
        Enter换行（无allowLinebreaks配置）
        <MultilineTextInput
          rows={3}
          placeholder='Enter插入换行；Ctrl/Cmd+Enter无enter事件'
          value={value}
          onChange={setValue}
        />
      </div>
      <p>
        本工程不提供 allowLinebreaks 与 enter 事件回调，Enter恒插入换行
        （决策见 docs/TODO.md「舍弃」节）。
      </p>
    </div>
  );
}

function MultilineComparePage() {
  return (
    <CompareLayout
      title='MultilineTextInput 对照'
      description={(
        <>
          对照点：autosize高度自适应、maxRows上限（rows=3时原版默认maxRows=10）、
          程序化赋值后高度重算、行数/图标/label位置/禁用变体、Enter换行。
          <br />
          差异：原版<code>allowLinebreaks</code>（缺省true）可禁止换行并把Ctrl/Cmd+Enter改作enter事件，
          本工程不提供该配置与enter事件，React侧恒等价于allowLinebreaks=true（见docs/TODO.md「舍弃」节）。
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

      <h2>换行与Enter</h2>
      <CompareColumns original={<OriginalLinebreaks />}>
        <ReactLinebreaks />
      </CompareColumns>
    </CompareLayout>
  );
}

MultilineComparePage.displayName = 'MultilineComparePage';

export default MultilineComparePage;
