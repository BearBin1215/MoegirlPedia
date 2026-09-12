import React, { useState } from 'react';
import { Message } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

const messageItems: Array<[string, Record<string, unknown>]> = [
  ['block notice', { label: 'Notice: 这是一条说明信息' }],
  ['block error', { label: 'Error: 这是一条错误信息', type: 'error' }],
  ['block warning', { label: 'Warning: 这是一条警告信息', type: 'warning' }],
  ['block success', { label: 'Success: 这是一条成功信息', type: 'success' }],
  ['inline notice', { label: 'Notice: 内联说明', inline: true }],
  ['inline error', { label: 'Error: 内联错误', type: 'error', inline: true }],
  ['block close', { label: '带关闭按钮的消息（点击关闭后由调用方隐藏）', type: 'warning', showClose: true }],
  ['custom icon', { label: '自定义图标（覆盖类型默认图标）', icon: 'help' }],
];

function OriginalMessages() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const MessageWidget = oo.ui.MessageWidget as unknown as new (config?: Record<string, unknown>) => { $element: unknown };
    for (const [, config] of messageItems) {
      const widget = new MessageWidget(config);
      register(widget);
      container.appendChild(unwrapJQuery(widget.$element));
    }
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

function ReactMessages() {
  const [closeVisible, setCloseVisible] = useState(true);

  return (
    <div>
      <Message>Notice: 这是一条说明信息</Message>
      <Message type='error'>Error: 这是一条错误信息</Message>
      <Message type='warning'>Warning: 这是一条警告信息</Message>
      <Message type='success'>Success: 这是一条成功信息</Message>
      <Message inline>Notice: 内联说明</Message>
      <Message inline type='error'>Error: 内联错误</Message>
      <div style={{ marginTop: '1em' }}>
        {closeVisible ? (
          <Message type='warning' showClose onClose={() => setCloseVisible(false)}>
            带关闭按钮的消息（点击关闭后由调用方隐藏）
          </Message>
        ) : (
          <button onClick={() => setCloseVisible(true)}>恢复被关闭的消息</button>
        )}
      </div>
      <Message icon='help'>自定义图标（覆盖类型默认图标）</Message>
    </div>
  );
}

function MessageComparePage() {
  return (
    <CompareLayout
      title='Message 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：四种type的图标与配色（notice/error/warning/success）、block与inline两种形态、
          自定义图标覆盖、showClose关闭按钮（inline形态无关闭按钮）、error的role=alert与其余类型的aria-live。
        </>
      )}
    >
      <CompareColumns original={<OriginalMessages />}>
        <ReactMessages />
      </CompareColumns>
    </CompareLayout>
  );
}

MessageComparePage.displayName = 'MessageComparePage';

export default MessageComparePage;
