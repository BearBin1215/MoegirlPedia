import React, { useState } from 'react';
import { NumberInput } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

function OriginalNumber() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const NumberInputWidget = oo.ui.NumberInputWidget as unknown as new (config?: Record<string, unknown>) => { $element: unknown };
    const widget = new NumberInputWidget({
      min: 0,
      max: 10,
      step: 1,
      showButtons: true,
      value: 5,
    });
    register(widget);
    container.appendChild(unwrapJQuery(widget.$element));

    // 软校验样本：required空值加载即标红，键入合法值后清除
    const requiredWidget = new NumberInputWidget({
      required: true,
      showButtons: false,
      placeholder: '必填',
    });
    register(requiredWidget);
    const label = document.createElement('p');
    label.textContent = 'required（空值/越界/非step倍数标红）';
    container.append(label, unwrapJQuery(requiredWidget.$element));
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
          +/-按钮不抢焦点（aria-hidden）；软校验反馈（required/min/max/step不满足时
          aria-invalid+invalid标志类标红，值变更防抖/失焦触发、聚焦清除）。
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
          <p>required（空值/越界/非step倍数标红）</p>
          <NumberInput required showButtons={false} placeholder='必填' />
        </div>
      </CompareColumns>
    </CompareLayout>
  );
}

NumberComparePage.displayName = 'NumberComparePage';

export default NumberComparePage;
