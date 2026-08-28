import React, { useEffect, useRef, useState } from 'react';
import { NumberInput } from 'oojs-ui-react';
import { ensureOOUI } from '../../components/ooui';

type NumberWidget = { $element: unknown };

function OriginalNumber() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const widget = new (OO.ui.NumberInputWidget as unknown as new (config?: Record<string, unknown>) => NumberWidget)({
        min: 0,
        max: 10,
        step: 1,
        showButtons: true,
        value: 5,
      });
      containerRef.current.appendChild(unwrap(widget.$element));
      setStatus('原版已就绪（0-10，聚焦后滚轮/↑↓/PgUp/PgDn步进）');
    }).catch(() => setStatus('原版加载失败'));
    return () => {
      cancelled = true;
    };
  }, []);

  const unwrap = ($el: unknown): Node => ($el as { 0: Node })[0];

  return (
    <div>
      <p>{status}</p>
      <div ref={containerRef} />
    </div>
  );
}

function NumberComparePage() {
  const [value, setValue] = useState<number | ''>(5);

  return (
    <>
      <h1>NumberInput 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        对照点：键入越界值保留、清空为空、空值时+/-从0起步、
        ↑↓按buttonStep、PgUp/PgDn按pageStep步进、聚焦时滚轮步进、
        +/-按钮不抢焦点（aria-hidden）。
      </p>
      <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalNumber />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <p>当前值：{value === '' ? '（空）' : value}</p>
          <NumberInput
            min={0}
            max={10}
            step={1}
            showButtons
            value={value}
            onChange={({ value: v }) => setValue(v)}
          />
        </div>
      </div>
    </>
  );
}

NumberComparePage.displayName = 'NumberComparePage';

export default NumberComparePage;
