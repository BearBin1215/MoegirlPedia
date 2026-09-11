import React, { useState } from 'react';
import { BookletLayout, Button, TextInput } from 'oojs-ui-react';

function makeOptions(prefix: string) {
  return [1, 2, 3].map((i) => ({
    value: `${prefix}-${i}`,
    label: `${prefix} 第${i}页`,
    children: (
      <>
        <h2>{prefix} 第{i}页</h2>
        <p>自动聚焦测试：<TextInput /></p>
        <p>{Array.from({ length: 6 }, () => `这是${prefix}第${i}页的内容段落。`).join('')}</p>
      </>
    ),
  }));
}

function BookletPage() {
  const [plainValue, setPlainValue] = useState<string | number>('无大纲-1');
  const [continuousValue, setContinuousValue] = useState<string | number>('连续-1');
  const [editableOptions, setEditableOptions] = useState(() => [1, 2, 3].map((i) => ({
    value: `可编辑-${i}`,
    label: `可编辑 第${i}页`,
    movable: true,
    removable: true,
    children: (
      <>
        <h2>可编辑 第{i}页</h2>
        <p>这是可编辑大纲示例的第{i}页内容。</p>
      </>
    ),
  })));

  const moveOption = (value: string | number, direction: -1 | 1) => {
    setEditableOptions((prev) => {
      const index = prev.findIndex((o) => o.value === value);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeOption = (value: string | number) => {
    setEditableOptions((prev) => prev.filter((o) => o.value !== value));
  };

  const addOption = () => {
    setEditableOptions((prev) => {
      const next = prev.length + 1;
      return [...prev, {
        value: `可编辑-${next}`,
        label: `可编辑 第${next}页`,
        movable: true,
        removable: true,
        children: (
          <>
            <h2>可编辑 第{next}页</h2>
            <p>这是可编辑大纲示例的第{next}页内容。</p>
          </>
        ),
      }];
    });
  };

  return (
    <>
      <h1>BookletLayout - 册页布局</h1>

      <h2>无大纲（outlined=false，对齐原版默认值）</h2>
      <p>
        <Button onClick={() => setPlainValue('无大纲-2')}>切到第2页</Button>
      </p>
      <div style={{ border: '1px solid #aaa', height: 220, position: 'relative' }}>
        <BookletLayout
          value={plainValue}
          onChange={setPlainValue}
          options={makeOptions('无大纲')}
        />
      </div>

      <h2>连续模式（outlined + continuous，滚动联动）</h2>
      <div style={{ border: '1px solid #aaa', height: 260, overflow: 'hidden', position: 'relative' }}>
        <BookletLayout
          outlined
          continuous
          value={continuousValue}
          onChange={setContinuousValue}
          options={makeOptions('连续')}
        />
      </div>
      <p>当前页：{String(continuousValue)}</p>

      <h2>可编辑大纲（editable：上移/下移/移除）</h2>
      <div style={{ border: '1px solid #aaa', height: 260, position: 'relative' }}>
        <BookletLayout
          outlined
          editable
          defaultValue='可编辑-1'
          options={editableOptions}
          onMoveOption={moveOption}
          onRemoveOption={removeOption}
          outlineControlsExtra={(
            <Button framed={false} icon='add' title='添加' onClick={addOption} />
          )}
        />
      </div>
      <p>当前大纲项：{editableOptions.map((o) => String(o.value)).join('、')}</p>

      <h2>关闭自动聚焦（autoFocus=false）</h2>
      <div style={{ border: '1px solid #aaa', height: 220, position: 'relative' }}>
        <BookletLayout
          outlined
          autoFocus={false}
          defaultValue='无聚焦-1'
          options={makeOptions('无聚焦')}
        />
      </div>
    </>
  );
}

BookletPage.displayName = 'BookletPage';

export default BookletPage;
