import React, { useEffect, useRef, useState } from 'react';
import { MultilineTextInput } from 'oojs-ui-react';
import { ensureOOUI, unwrapJQuery } from '../../components/ooui';

type MultilineWidget = {
  $element: unknown;
  setValue: (v: string) => void;
  getValue: () => string;
};

function OriginalMultiline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<MultilineWidget | null>(null);
  const [status, setStatus] = useState('未初始化');
  const [value, setValue] = useState('');

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const widget = new (OO.ui.MultilineTextInputWidget as new (config?: Record<string, unknown>) => MultilineWidget)({
        autosize: true,
        rows: 3,
        maxRows: 10,
        placeholder: '原版autosize',
      });
      // $element为jQuery对象，取其包裹的真实DOM节点
      containerRef.current.appendChild(unwrapJQuery(widget.$element));
      widgetRef.current = widget;
      setStatus('原版已就绪');
    }).catch(() => setStatus('原版加载失败'));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <p>{status}</p>
      <div ref={containerRef} />
      <p>
        <button
          type='button'
          disabled={!widgetRef.current}
          onClick={() => {
            const v = '程序化赋值\nline2\nline3\nline4\nline5';
            widgetRef.current?.setValue(v);
            setValue(v);
          }}
        >
          原版setValue（5行）
        </button>
        <span style={{ marginLeft: '0.5em' }}>当前高度：{widgetRef.current ? '见上方输入框' : '-'}</span>
      </p>
    </div>
  );
}

function ComparePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState('');

  return (
    <>
      <h1>MultilineTextInput 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>对照点：autosize高度自适应、maxRows上限（rows=3时原版默认maxRows=10）、程序化赋值后高度重算。</p>
      <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalMultiline />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <div ref={containerRef} />
          <MultilineTextInput
            autosize
            rows={3}
            maxRows={10}
            placeholder='React版autosize'
            value={value}
            onChange={({ value: v }) => setValue(v)}
          />
          <p>
            <button
              type='button'
              onClick={() => {
                const v = '程序化赋值\nline2\nline3\nline4\nline5';
                setValue(v);
              }}
            >
              React版setValue（5行）
            </button>
          </p>
        </div>
      </div>
    </>
  );
}

ComparePage.displayName = 'MultilineComparePage';

export default ComparePage;
