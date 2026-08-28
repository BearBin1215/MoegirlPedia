import React, { useEffect, useRef, useState } from 'react';
import { Button, CheckboxInput } from 'oojs-ui-react';
import { ensureOOUI, unwrapJQuery, compareLayoutStyle } from '../../components/ooui';

/** 原版按钮与复选框样例（与React侧保持一致以便对照） */
function OriginalWidgets() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((oo) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const ui = oo.ui as unknown as Record<
        string,
        new (config?: Record<string, unknown>) => { $element: unknown }
      >;
      const wrap = (name: string, $element: unknown) => {
        const p = document.createElement('p');
        p.textContent = name;
        p.appendChild(unwrapJQuery($element));
        return p;
      };
      const button = (name: string, config: Record<string, unknown>) =>
        wrap(name, new ui.ButtonWidget(config).$element);
      const checkbox = (name: string, config: Record<string, unknown>) =>
        wrap(name, new ui.CheckboxInputWidget(config).$element);
      containerRef.current.append(
        button('常规', { label: 'Button' }),
        button('primary', { label: 'Primary', flags: 'primary' }),
        button('progressive', { label: 'Progressive', flags: 'progressive' }),
        button('destructive', { label: 'Destructive', flags: 'destructive' }),
        button('无边框destructive', { label: 'Frameless', framed: false, flags: 'destructive' }),
        button('激活', { label: 'Active', active: true }),
        button('禁用带链接', { label: 'Disabled', disabled: true, href: 'https://www.example.com' }),
        checkbox('常规', { selected: false }),
        checkbox('选中', { selected: true }),
        checkbox('半选', { indeterminate: true }),
        checkbox('必填', { required: true, selected: false }),
        checkbox('禁用', { disabled: true, selected: true }),
      );
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
    </div>
  );
}

function ButtonCheckboxComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState(true);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <div>
      <h1>Button/CheckboxInput 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        对照点：图标/指示器变体类（primary/progressive/destructive/invert、激活、禁用）、
        禁用时移除href、mousedown阻止焦点转移且按钮外松开复位、
        Enter/空格触发click（keypress时机）、半选indeterminate、required落点。
      </p>
      <div style={compareLayoutStyle}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalWidgets />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <p>常规</p>
          <Button onClick={() => addLog('click 常规')}>Button</Button>
          <p>primary</p>
          <Button flags='primary'>Primary</Button>
          <p>progressive</p>
          <Button flags='progressive'>Progressive</Button>
          <p>destructive</p>
          <Button flags='destructive'>Destructive</Button>
          <p>无边框destructive</p>
          <Button framed={false} flags='destructive'>Frameless</Button>
          <p>激活</p>
          <Button active>Active</Button>
          <p>禁用带链接</p>
          <Button disabled href='https://www.example.com'>Disabled</Button>
          <p>常规</p>
          <CheckboxInput onChange={({ value }) => addLog(`change 常规=${value}`)} />
          <p>选中</p>
          <CheckboxInput value onChange={({ value }) => addLog(`change 选中=${value}`)} />
          <p>
            半选
            {' '}
            <button type='button' onClick={() => setIndeterminate((v) => !v)}>
              切换indeterminate
            </button>
          </p>
          <CheckboxInput indeterminate={indeterminate} />
          <p>必填</p>
          <CheckboxInput required />
          <p>禁用</p>
          <CheckboxInput disabled value />
        </div>
      </div>
      <h2>事件日志</h2>
      <ul>
        {log.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </div>
  );
}

ButtonCheckboxComparePage.displayName = 'ButtonCheckboxComparePage';

export default ButtonCheckboxComparePage;
