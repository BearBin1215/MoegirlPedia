import React, { useState } from 'react';
import { CopyTextLayout } from 'oojs-ui-react';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type OriginalCopyText = {
  $element: unknown;
  on: (event: string, handler: (copied: boolean) => void) => void;
};

type CopyTextUi = {
  CopyTextLayout: new (config?: Record<string, unknown>) => OriginalCopyText;
};

/** 变体行：两侧共用同一份定义 */
type VariantSpec = {
  name: string;
  copyText: string;
  multiline?: boolean;
  label?: string;
  /** 文本框配置（原版config.textInput / React的textInputProps），仅取多行时用到的行数 */
  rows?: number;
  /** 自定义按钮（两侧同名语义：原版config.button / React的buttonProps） */
  button?: { label: string; icon: string };
};

const variants: VariantSpec[] = [
  {
    name: '单行',
    label: '分享链接',
    copyText: 'https://zh.moegirl.org.cn/Special:Random',
  },
  {
    name: '多行',
    label: '批量文本（按钮换行右浮）',
    multiline: true,
    rows: 3,
    copyText: '第一行文本\n第二行文本\n第三行文本',
  },
  {
    name: '自定义按钮',
    label: '自定义label与icon',
    copyText: 'custom',
    button: { label: '复制链接', icon: 'link' },
  },
];

/** 原版侧：CopyTextLayout逐变体输出（行结构与React侧的p一致） */
function OriginalCopyTextLayouts({ addLog }: { addLog: (msg: string) => void }) {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as CopyTextUi;
    const row = createRowAppender(container, register);
    for (const variant of variants) {
      const layout = row(ui.CopyTextLayout, variant.name, {
        copyText: variant.copyText,
        multiline: variant.multiline,
        label: variant.label,
        textInput: variant.rows !== undefined ? { rows: variant.rows } : undefined,
        button: variant.button ? { label: variant.button.label, icon: variant.button.icon } : undefined,
      });
      layout.on('copy', (copied) => addLog(`原版 ${variant.name} copy=${String(copied)}`));
    }
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与原版逐行对应 */
function ReactCopyTextLayouts({ addLog }: { addLog: (msg: string) => void }) {
  return (
    <div>
      {variants.map((variant) => (
        <p key={variant.name}>
          {variant.name}
          <CopyTextLayout
            label={variant.label}
            copyText={variant.copyText}
            multiline={variant.multiline}
            textInputProps={variant.rows !== undefined ? { rows: variant.rows } : undefined}
            buttonProps={variant.button ? { children: variant.button.label, icon: variant.button.icon } : undefined}
            onCopyResult={(copied) => addLog(`React ${variant.name} copy=${String(copied)}`)}
          />
        </p>
      ))}
    </div>
  );
}

function CopyTextComparePage() {
  const [log, setLog] = useState<string[]>([]);
  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-9), msg]);

  return (
    <CompareLayout
      title='CopyTextLayout 对照'
      description={(
        <>
          对照点：根元素同时带actionFieldLayout与copyTextLayout类、只读文本框的value取自copyText、
          复制按钮缺省label（ooui-copytextlayout-copy）与copy图标、聚焦文本框自动全选、
          点击按钮复制并回报结果、多行时剥去actionFieldLayout的连接类改用multiline-button类
          （按钮换行右浮）。复制实现差异：React优先navigator.clipboard，失败回落execCommand
          （原版仅execCommand）。
        </>
      )}
    >
      <CompareColumns original={<OriginalCopyTextLayouts addLog={addLog} />}>
        <ReactCopyTextLayouts addLog={addLog} />
      </CompareColumns>

      <h2>事件日志</h2>
      <ul>
        {log.map((msg, i) => <li key={i}>{msg}</li>)}
      </ul>
    </CompareLayout>
  );
}

CopyTextComparePage.displayName = 'CopyTextComparePage';

export default CopyTextComparePage;
