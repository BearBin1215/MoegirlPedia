import React, { useState } from 'react';
import { ButtonMenuSelectWidget } from 'oojs-ui-react';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type MenuSelectUi = {
  ButtonMenuSelectWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    getMenu: () => { on: (event: string, handler: (arg?: { getData?: () => string }) => void) => void };
  };
  MenuOptionWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 选项集（两侧同一组，含禁用项） */
const OPTION_DEFS: [string, string, boolean?][] = [
  ['alpha', '选项一'],
  ['beta', '选项二'],
  ['gamma', '选项三（禁用）', true],
];

/** 原版侧各行配置（React侧逐条对应） */
const ROWS: [string, Record<string, unknown>][] = [
  ['默认（选定后清除选中态）', {}],
  ['带图标', { icon: 'ellipsis' }],
  ['clearOnSelect=false（保留选中态）', { clearOnSelect: false }],
  ['禁用', { disabled: true }],
];

/** 原版侧：按钮触发菜单（menu.items传入选项） */
function OriginalButtonMenus({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as MenuSelectUi;
    const row = createRowAppender(container, register);
    ROWS.forEach(([name, config], index) => {
      const widget = row(ui.ButtonMenuSelectWidget, name, {
        label: name,
        menu: {
          items: OPTION_DEFS.map(([data, label, disabled]) => new ui.MenuOptionWidget({ data, label, disabled })),
        },
        ...config,
      });
      const menu = widget.getMenu();
      menu.on('choose', (item) => addLog(`原版${index} choose=${item?.getData?.()}`));
      menu.on('toggle', () => addLog(`原版${index} toggle`));
    });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与左侧逐行同配置 */
function ReactButtonMenus({ addLog }: { addLog: (msg: string) => void }) {
  const options = OPTION_DEFS.map(([value, label, disabled]) => ({ value, children: label, disabled }));

  return (
    <div>
      <div>
        默认（选定后清除选中态）
        <ButtonMenuSelectWidget
          options={options}
          onChoose={(value) => addLog(`react0 choose=${value}`)}
          onOpenChange={(open) => addLog(`react0 toggle=${open}`)}
        >
          默认（选定后清除选中态）
        </ButtonMenuSelectWidget>
      </div>
      <div>
        带图标
        <ButtonMenuSelectWidget icon='ellipsis' options={options} onChoose={(value) => addLog(`react1 choose=${value}`)}>
          带图标
        </ButtonMenuSelectWidget>
      </div>
      <div>
        clearOnSelect=false（保留选中态）
        <ButtonMenuSelectWidget
          clearOnSelect={false}
          options={options}
          onChoose={(value) => addLog(`react2 choose=${value}`)}
        >
          clearOnSelect=false（保留选中态）
        </ButtonMenuSelectWidget>
      </div>
      <div>
        禁用
        <ButtonMenuSelectWidget disabled options={options}>
          禁用
        </ButtonMenuSelectWidget>
      </div>
    </div>
  );
}

function ButtonMenuComparePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => setLog((prev) => [...prev.slice(-11), message]);

  return (
    <CompareLayout
      title='ButtonMenuSelectWidget 对照'
      description={(
        <>
          对照点：根类oo-ui-buttonMenuSelectWidget、锚点上的aria-haspopup=true/aria-expanded/aria-owns（互相关联菜单id）、
          菜单浮动于按钮下方且间距4px、菜单不是Tab停靠点、展开期间按钮呈pressed态、
          选定后收起并回调（clearOnSelect缺省清除菜单选中态，置false则保留）、
          键盘：收起时Enter/空格/↑↓展开，展开后↑↓移动高亮、Enter选定。
        </>
      )}
    >
      <CompareColumns original={<OriginalButtonMenus addLog={addLog} />}>
        <ReactButtonMenus addLog={addLog} />
      </CompareColumns>

      <h2>事件日志（两侧）</h2>
      <ul>
        {log.map((message, index) => <li key={index}>{message}</li>)}
      </ul>
    </CompareLayout>
  );
}

ButtonMenuComparePage.displayName = 'ButtonMenuComparePage';

export default ButtonMenuComparePage;
