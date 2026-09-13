import React, { useState } from 'react';
import { FieldLayout, ToggleButton, ToggleSwitch } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type ToggleUi = {
  ToggleSwitchWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  ToggleButtonWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  FieldLayout: new (field: unknown, config?: Record<string, unknown>) => { $element: unknown };
};

/** 原版侧：ToggleSwitch形态样本（与React侧逐行对照） */
function OriginalSwitches() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ToggleUi;
    const row = createRowAppender(container, register);
    row(ui.ToggleSwitchWidget, '关（默认）', {});
    row(ui.ToggleSwitchWidget, '开', { value: true });
    row(ui.ToggleSwitchWidget, '禁用·关', { disabled: true });
    row(ui.ToggleSwitchWidget, '禁用·开', { disabled: true, value: true });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactSwitches({ addLog }: { addLog: (msg: string) => void }) {
  const [controlled, setControlled] = useState(false);

  return (
    <div>
      {/* 名称与控件同行，与原版row()的p内嵌结构一致，保证两侧逐行对照 */}
      <p>关（默认）<ToggleSwitch onChange={(checked) => addLog(`change 常规=${checked}`)} /></p>
      <p>开<ToggleSwitch defaultChecked onChange={(checked) => addLog(`change 开=${checked}`)} /></p>
      <p>
        受控（当前：{controlled ? '开' : '关'}）
        <ToggleSwitch checked={controlled} onChange={setControlled} />
      </p>
      <p>禁用·关<ToggleSwitch disabled /></p>
      <p>禁用·开<ToggleSwitch disabled defaultChecked /></p>
    </div>
  );
}

/** 原版侧：ToggleButton形态样本 */
function OriginalToggleButtons() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ToggleUi;
    const row = createRowAppender(container, register);
    row(ui.ToggleButtonWidget, '关（默认）', { label: 'Toggle off' });
    row(ui.ToggleButtonWidget, '开', { label: 'Toggle on', value: true });
    row(ui.ToggleButtonWidget, '图标+flags', { label: 'Icon', icon: 'image', flags: 'progressive' });
    row(ui.ToggleButtonWidget, '禁用·开', { label: 'Disabled', disabled: true, value: true });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactToggleButtons({ addLog }: { addLog: (msg: string) => void }) {
  const [controlled, setControlled] = useState(true);

  return (
    <div>
      <p>关（默认）<ToggleButton onChange={(checked) => addLog(`change 常规=${checked}`)}>Toggle off</ToggleButton></p>
      <p>开<ToggleButton defaultChecked>Toggle on</ToggleButton></p>
      <p>
        受控（当前：{controlled ? '开' : '关'}）
        <ToggleButton checked={controlled} onChange={setControlled}>Controlled</ToggleButton>
      </p>
      <p>图标+flags<ToggleButton icon='image' flags='progressive'>Icon</ToggleButton></p>
      <p>禁用·开<ToggleButton disabled defaultChecked>Disabled</ToggleButton></p>
    </div>
  );
}

/** 原版侧：FieldLayout标签联动样本（点击标签翻转开关，对齐原版simulateLabelClick） */
function OriginalFieldLink() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ToggleUi;
    const layout = new ui.FieldLayout(new ui.ToggleSwitchWidget(), {
      label: '点击标签翻转开关',
      align: 'left',
    });
    const disabledLayout = new ui.FieldLayout(new ui.ToggleSwitchWidget({ disabled: true }), {
      label: '禁用（点击标签不翻转不聚焦）',
      align: 'left',
    });
    register(layout, disabledLayout);
    container.appendChild(unwrapJQuery(layout.$element));
    container.appendChild(unwrapJQuery(disabledLayout.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactFieldLink() {
  return (
    <div>
      <FieldLayout label='点击标签翻转开关' align='left'>
        <ToggleSwitch />
      </FieldLayout>
      <FieldLayout label='禁用（点击标签不翻转不聚焦）' align='left'>
        <ToggleSwitch disabled />
      </FieldLayout>
    </div>
  );
}

function ToggleComparePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title='ToggleSwitch / ToggleButton 对照'
      description={(
        <>
          对照点：ToggleSwitch的glow/grip结构与开合类（oo-ui-toggleWidget-on/off）、
          role=switch + aria-checked、左键点击与Space/Enter切换（Space不滚动页面）、
          禁用态；ToggleButton的buttonElement-active与aria-pressed随开合输出、
          受控/非受控两种用法（变更记录见日志）。
        </>
      )}
    >
      <h2>ToggleSwitch</h2>
      <CompareColumns original={<OriginalSwitches />}>
        <ReactSwitches addLog={addLog} />
      </CompareColumns>

      <h2>ToggleButton</h2>
      <CompareColumns original={<OriginalToggleButtons />}>
        <ReactToggleButtons addLog={addLog} />
      </CompareColumns>

      <h2>FieldLayout标签联动</h2>
      <CompareColumns original={<OriginalFieldLink />}>
        <ReactFieldLink />
      </CompareColumns>

      <h2>事件日志（React侧）</h2>
      <ul>
        {log.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </CompareLayout>
  );
}

ToggleComparePage.displayName = 'ToggleComparePage';

export default ToggleComparePage;
