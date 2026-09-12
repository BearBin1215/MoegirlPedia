import React, { useState } from 'react';
import { NumberInput } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

function OriginalNumber() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const widget = new (oo.ui.NumberInputWidget as unknown as new (config?: Record<string, unknown>) => { $element: unknown })({
      min: 0,
      max: 10,
      step: 1,
      showButtons: true,
      value: 5,
    });
    register(widget);
    container.appendChild(unwrapJQuery(widget.$element));
  });

  return (
    <div>
      <p>0-10，聚焦后滚轮/↑↓/PgUp/PgDn步进</p>
      <div ref={containerRef} />
    </div>
  );
}

function NumberComparePage() {
  const [value, setValue] = useState<number | ''>(5);

  return (
    <CompareLayout
      title='NumberInput 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：键入越界值保留、清空为空、空值时+/-从0起步、
          ↑↓按buttonStep、PgUp/PgDn按pageStep步进、聚焦时滚轮步进、
          +/-按钮不抢焦点（aria-hidden）。
        </>
      )}
    >
      <CompareColumns original={<OriginalNumber />}>
        <div>
          <p>当前值：{value === '' ? '（空）' : value}</p>
          <NumberInput
            min={0}
            max={10}
            step={1}
            showButtons
            value={value}
            onChange={(v) => setValue(v)}
          />
        </div>
      </CompareColumns>
    </CompareLayout>
  );
}

NumberComparePage.displayName = 'NumberComparePage';

export default NumberComparePage;
