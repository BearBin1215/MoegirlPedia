import React, { useState } from 'react';
import { Button, ButtonGroup, CheckboxInput, CheckboxMultiselect, RadioSelect } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type ButtonCheckboxUi = {
  ButtonWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  CheckboxInputWidget: new (config?: Record<string, unknown>) => { $element: unknown; setIndeterminate: (state: boolean) => void; isIndeterminate: () => boolean };
};

/** 原版侧：按钮样式变体（与React侧逐行对照） */
function OriginalButtons() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ButtonCheckboxUi;
    const row = createRowAppender(container, register);
    row(ui.ButtonWidget, '常规', { label: 'Button' });
    row(ui.ButtonWidget, 'primary', { label: 'Primary', flags: 'primary' });
    row(ui.ButtonWidget, 'progressive', { label: 'Progressive', flags: 'progressive' });
    row(ui.ButtonWidget, 'destructive', { label: 'Destructive', flags: 'destructive' });
    row(ui.ButtonWidget, 'error', { label: 'Error', flags: 'error' });
    row(ui.ButtonWidget, '无边框destructive', { label: 'Frameless', framed: false, flags: 'destructive' });
    row(ui.ButtonWidget, '激活', { label: 'Active', active: true });
    row(ui.ButtonWidget, '禁用带链接', { label: 'Disabled', disabled: true, href: 'https://www.example.com' });
    row(ui.ButtonWidget, 'target+rel数组', {
      label: 'Target',
      href: 'https://www.example.com',
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
    });
    row(ui.ButtonWidget, '图标/指示器title', {
      label: 'Titles',
      icon: 'help',
      iconTitle: '图标提示',
      indicator: 'down',
      indicatorTitle: '指示器提示',
    });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactButtons({ addLog }: { addLog: (msg: string) => void }) {
  return (
    <div>
      {/* 名称与控件同行，与原版row()的div行结构一致（块级widget入p不合规），保证两侧逐行对照 */}
      <div>常规<Button onClick={() => addLog('click 常规')}>Button</Button></div>
      <div>primary<Button flags='primary'>Primary</Button></div>
      <div>progressive<Button flags='progressive'>Progressive</Button></div>
      <div>destructive<Button flags='destructive'>Destructive</Button></div>
      <div>error<Button flags='error'>Error</Button></div>
      <div>无边框destructive<Button framed={false} flags='destructive'>Frameless</Button></div>
      <div>激活<Button active>Active</Button></div>
      <div>禁用带链接<Button disabled href='https://www.example.com'>Disabled</Button></div>
      <div>
        target+rel数组
        <Button
          href='https://www.example.com'
          target='_blank'
          rel={['noopener', 'noreferrer']}
        >
          Target
        </Button>
      </div>
      <div>
        图标/指示器title
        <Button
          icon='help'
          iconProps={{ title: '图标提示' }}
          indicator='down'
          indicatorProps={{ title: '指示器提示' }}
        >
          Titles
        </Button>
      </div>
    </div>
  );
}

/** 原版侧：CheckboxInput（半选行经setIndeterminate切换，与React侧受控演示对称） */
function OriginalCheckboxes() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ButtonCheckboxUi;
    const row = createRowAppender(container, register);
    // 行顺序与React侧保持一一对应
    row(ui.CheckboxInputWidget, '常规', { selected: false });
    row(ui.CheckboxInputWidget, '选中', { selected: true });

    // 半选行的切换按钮单独构建（行内含原生button）
    const halfCheckbox = new ui.CheckboxInputWidget({ indeterminate: true });
    register(halfCheckbox);
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.textContent = '切换indeterminate';
    toggleButton.addEventListener('click', () => {
      halfCheckbox.setIndeterminate(!halfCheckbox.isIndeterminate());
    });
    const halfRow = document.createElement('div');
    halfRow.textContent = '半选';
    halfRow.append(toggleButton, unwrapJQuery(halfCheckbox.$element));
    container.appendChild(halfRow);

    row(ui.CheckboxInputWidget, '必填', { required: true, selected: false });
    row(ui.CheckboxInputWidget, '禁用', { disabled: true, selected: true });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactCheckboxes({ addLog, indeterminate, toggleIndeterminate }: {
  addLog: (msg: string) => void;
  indeterminate: boolean;
  toggleIndeterminate: () => void;
}) {
  return (
    <div>
      <div>常规<CheckboxInput onChange={(value) => addLog(`change 常规=${value}`)} /></div>
      <div>选中<CheckboxInput checked onChange={(value) => addLog(`change 选中=${value}`)} /></div>
      <div>
        半选
        <button type='button' onClick={toggleIndeterminate}>
          切换indeterminate
        </button>
        <CheckboxInput indeterminate={indeterminate} />
      </div>
      <div>必填<CheckboxInput required /></div>
      <div>禁用<CheckboxInput disabled checked /></div>
    </div>
  );
}

type SelectUi = {
  RadioSelectWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  RadioOptionWidget: new (config?: Record<string, unknown>) => unknown;
  CheckboxMultiselectWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  CheckboxMultioptionWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 原版侧：RadioSelect（radiogroup聚焦，↑↓←→在非禁用项间移动） */
function OriginalRadioSelect() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectUi;
    const radioSelect = new ui.RadioSelectWidget({
      items: [
        new ui.RadioOptionWidget({ data: 'a', label: '选项A' }),
        new ui.RadioOptionWidget({ data: 'b', label: '选项B', selected: true }),
        new ui.RadioOptionWidget({ data: 'c', label: '禁用项', disabled: true }),
      ],
    });
    register(radioSelect);
    container.appendChild(unwrapJQuery(radioSelect.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：RadioSelect（defaultValue对应原版OptionWidget的selected） */
function ReactRadioSelect() {
  return (
    <RadioSelect
      name='compare-radio'
      defaultValue='b'
      options={[
        { value: 'a', children: '选项A' },
        { value: 'b', children: '选项B' },
        { value: 'c', children: '禁用项', disabled: true },
      ]}
    />
  );
}

/** 原版侧：CheckboxMultiselect（支持Shift+点击范围选择） */
function OriginalMultiselect() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectUi;
    const multiselect = new ui.CheckboxMultiselectWidget({
      items: [
        new ui.CheckboxMultioptionWidget({ data: 'a', label: '选项A', selected: true }),
        new ui.CheckboxMultioptionWidget({ data: 'b', label: '选项B' }),
        new ui.CheckboxMultioptionWidget({ data: 'c', label: '禁用项', disabled: true }),
      ],
    });
    register(multiselect);
    container.appendChild(unwrapJQuery(multiselect.$element));
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactMultiselect() {
  const [selected, setSelected] = useState<Array<string | number>>(['a']);

  return (
    <div>
      <CheckboxMultiselect
        options={[
          { value: 'a', children: '选项A' },
          { value: 'b', children: '选项B' },
          { value: 'c', children: '禁用项', disabled: true },
        ]}
        value={selected}
        name='compare-multiselect'
        onChange={setSelected}
      />
      <p>当前选中：{JSON.stringify(selected)}</p>
    </div>
  );
}

type ButtonGroupUi = {
  ButtonGroupWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  ButtonWidget: new (config?: Record<string, unknown>) => unknown;
};

/** 原版侧：ButtonGroup（整组禁用经ButtonGroupWidget的disabled） */
function OriginalButtonGroups() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as ButtonGroupUi;
    const append = ($element: unknown) => {
      container.appendChild(unwrapJQuery($element));
      container.appendChild(document.createElement('br'));
    };
    const makeGroup = (disabled: boolean) => new ui.ButtonGroupWidget({
      disabled,
      items: [
        new ui.ButtonWidget({ label: 'One', icon: 'tag' }),
        new ui.ButtonWidget({ label: 'Two' }),
        new ui.ButtonWidget({ label: 'Three', disabled: true }),
      ],
    });
    const group = makeGroup(false);
    const disabledGroup = makeGroup(true);
    register(group, disabledGroup);
    append(group.$element);
    append(disabledGroup.$element);
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactButtonGroups() {
  return (
    <div>
      {/* 与原版侧一致：ButtonGroup为inline-block且无纵向margin，用br换行分隔（原版亦为group+br成对输出） */}
      <ButtonGroup>
        <Button icon='tag'>One</Button>
        <Button>Two</Button>
        <Button disabled>Three</Button>
      </ButtonGroup>
      <br />
      <ButtonGroup disabled>
        <Button icon='tag'>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <br />
    </div>
  );
}

function ButtonCheckboxComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const [indeterminate, setIndeterminate] = useState(true);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title='Button / CheckboxInput 对照'
      description={(
        <>
          对照点：图标/指示器变体类（primary/progressive/destructive/error/invert、激活、禁用）、
          禁用时移除href、target与rel数组拼接、mousedown阻止焦点转移且按钮外松开复位、
          Enter/空格触发click（keypress时机）、图标/指示器title提示、半选indeterminate、required落点。
          RadioSelect/CheckboxMultiselect：radiogroup聚焦与方向键导航、Shift+点击范围选择。
        </>
      )}
    >
      <h2>Button样式变体</h2>
      <CompareColumns original={<OriginalButtons />}>
        <ReactButtons addLog={addLog} />
      </CompareColumns>

      <h2>CheckboxInput</h2>
      <CompareColumns original={<OriginalCheckboxes />}>
        <ReactCheckboxes
          addLog={addLog}
          indeterminate={indeterminate}
          toggleIndeterminate={() => setIndeterminate((v) => !v)}
        />
      </CompareColumns>

      <h2>RadioSelect</h2>
      <CompareColumns original={<OriginalRadioSelect />}>
        <ReactRadioSelect />
      </CompareColumns>

      <h2>CheckboxMultiselect</h2>
      <CompareColumns original={<OriginalMultiselect />}>
        <ReactMultiselect />
      </CompareColumns>

      <h2>ButtonGroup</h2>
      <CompareColumns original={<OriginalButtonGroups />}>
        <ReactButtonGroups />
      </CompareColumns>

      <h2>事件日志</h2>
      <ul>
        {log.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </CompareLayout>
  );
}

ButtonCheckboxComparePage.displayName = 'ButtonCheckboxComparePage';

export default ButtonCheckboxComparePage;
