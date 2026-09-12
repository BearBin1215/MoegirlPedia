import React, { useState } from 'react';
import { alert, confirm, prompt } from 'oojs-ui-react';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type StaticPromptUi = {
  prompt: (text: string, options?: Record<string, unknown>) => Promise<string | null>;
  alert: (text: string) => Promise<void>;
  confirm: (text: string) => Promise<boolean>;
};

function OriginalPrompt() {
  const [result, setResult] = useState('（尚未触发）');
  const { containerRef } = useOriginalWidgets((oo, container) => {
    const ui = oo.ui as unknown as StaticPromptUi;
    const onPrompt = () => {
      ui.prompt('请输入名称', { textInput: { placeholder: '原版输入框' } }).then((value) => {
        setResult(value === null ? 'null（取消/ESC）' : `"${value}"（确定）`);
      });
    };
    const onAlert = () => {
      ui.alert('这是一条alert提示').then(() => setResult('alert已关闭'));
    };
    const onConfirm = () => {
      ui.confirm('这是一条confirm确认').then((ok) => setResult(ok ? 'confirm确定' : 'confirm取消'));
    };
    const makeButton = (text: string, onClick: () => void) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.addEventListener('click', onClick);
      return button;
    };
    container.append(
      makeButton('打开原版prompt', onPrompt),
      makeButton('alert（对照）', onAlert),
      makeButton('confirm（对照）', onConfirm),
    );
  });

  return (
    <div>
      <div ref={containerRef} />
      <p>结果：{result}</p>
    </div>
  );
}

function ReactPrompt() {
  const [result, setResult] = useState('（尚未触发）');

  const handlePrompt = () => {
    prompt('请输入名称', { textInput: { placeholder: 'React输入框' } }).then((value) => {
      setResult(value === null ? 'null（取消/ESC）' : `"${value}"（确定）`);
    });
  };

  return (
    <div>
      <div>
        <button onClick={handlePrompt}>打开React prompt</button>
        <button
          onClick={() => {
            alert('这是一条alert提示').then(() => setResult('alert已关闭'));
          }}
        >
          alert（对照）
        </button>
        <button
          onClick={() => {
            confirm('这是一条confirm确认').then((ok) => setResult(ok ? 'confirm确定' : 'confirm取消'));
          }}
        >
          confirm（对照）
        </button>
      </div>
      <p>结果：{result}</p>
    </div>
  );
}

function PromptComparePage() {
  return (
    <CompareLayout
      title='Prompt 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：打开后自动聚焦文本输入框、输入框内按Enter等同点击确定、确定兑现输入值、
          取消/ESC兑现null、FieldLayout(top)标签布局。
        </>
      )}
    >
      <CompareColumns original={<OriginalPrompt />}>
        <ReactPrompt />
      </CompareColumns>
    </CompareLayout>
  );
}

PromptComparePage.displayName = 'PromptComparePage';

export default PromptComparePage;
