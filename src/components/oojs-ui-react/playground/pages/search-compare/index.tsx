import React, { useState } from 'react';
import { SearchInput } from 'oojs-ui-react';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type SearchUi = {
  SearchInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
};

/** 原版侧：SearchInput形态样本（与React侧逐行对照） */
function OriginalSearchInputs() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SearchUi;
    const row = createRowAppender(container, register);
    row(ui.SearchInputWidget, '常规（空值无清除指示器）', { placeholder: 'Search' });
    row(ui.SearchInputWidget, '带值（显示clear指示器）', { value: 'MediaWiki' });
    row(ui.SearchInputWidget, '禁用·带值（指示器隐藏）', { value: 'MediaWiki', disabled: true });
    row(ui.SearchInputWidget, '只读·带值（指示器隐藏）', { value: 'MediaWiki', readOnly: true });
    row(ui.SearchInputWidget, 'required（空值不回退required指示器）', { required: true });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactSearchInputs({ addLog }: { addLog: (msg: string) => void }) {
  const [value, setValue] = useState<string>('初始值');

  return (
    <div>
      {/* 名称与控件同行，与原版row()的p内嵌结构一致，保证两侧逐行对照 */}
      <p>常规（空值无清除指示器）<SearchInput placeholder='Search' onChange={(v) => addLog(`change 常规=${v}`)} /></p>
      <p>带值（显示clear指示器）<SearchInput defaultValue='MediaWiki' /></p>
      <p>
        受控（当前：{value === '' ? '（空）' : value}）
        <SearchInput value={value} onChange={setValue} />
      </p>
      <p>禁用·带值（指示器隐藏）<SearchInput defaultValue='MediaWiki' disabled /></p>
      <p>只读·带值（指示器隐藏）<SearchInput defaultValue='MediaWiki' readOnly /></p>
      <p>required（空值不回退required指示器）<SearchInput required /></p>
    </div>
  );
}

function SearchComparePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title='SearchInput 对照'
      description={(
        <>
          对照点：type=search语义与search缺省图标、clear清除指示器的显隐
          （值非空且未禁用/只读时显示，对齐updateSearchIndicator）、点击指示器或在其上按Enter
          清空并回焦输入框、指示器role=button与aria-label（ooui-item-remove消息）。
        </>
      )}
    >
      <h2>SearchInput</h2>
      <CompareColumns original={<OriginalSearchInputs />}>
        <ReactSearchInputs addLog={addLog} />
      </CompareColumns>

      <h2>事件日志（React侧）</h2>
      <ul>
        {log.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </CompareLayout>
  );
}

SearchComparePage.displayName = 'SearchComparePage';

export default SearchComparePage;
