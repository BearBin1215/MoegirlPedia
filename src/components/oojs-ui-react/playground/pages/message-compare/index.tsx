import React, { useEffect, useRef, useState } from 'react';
import { Message } from 'oojs-ui-react';
import { createOOUIWidgets, ensureOOUI, unwrapJQuery, compareLayoutStyle } from '../../components/ooui';

function OriginalMessages() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    const host = createOOUIWidgets();
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const ui = OO.ui as unknown as {
        MessageWidget: new (config?: Record<string, unknown>) => { $element: unknown };
      };
      const items: Array<[string, Record<string, unknown>]> = [
        ['block notice', { label: 'Notice: 这是一条说明信息' }],
        ['block error', { label: 'Error: 这是一条错误信息', type: 'error' }],
        ['block warning', { label: 'Warning: 这是一条警告信息', type: 'warning' }],
        ['block success', { label: 'Success: 这是一条成功信息', type: 'success' }],
        ['inline notice', { label: 'Notice: 内联说明', inline: true }],
        ['inline error', { label: 'Error: 内联错误', type: 'error', inline: true }],
        ['block close', { label: '带关闭按钮的消息（点击关闭后由调用方隐藏）', type: 'warning', showClose: true }],
        ['custom icon', { label: '自定义图标（覆盖类型默认图标）', icon: 'help' }],
      ];
      for (const [, config] of items) {
        const widget = new ui.MessageWidget(config);
        host.add(widget);
        containerRef.current.appendChild(unwrapJQuery(widget.$element));
      }
      setStatus('原版已就绪');
    }).catch(() => setStatus('原版加载失败'));
    return () => {
      cancelled = true;
      host.destroyAll();
    };
  }, []);

  return (
    <div>
      <p>{status}</p>
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
    <>
      <h1>Message 对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        对照点：四种type的图标与配色（notice/error/warning/success）、block与inline两种形态、
        自定义图标覆盖、showClose关闭按钮（inline形态无关闭按钮）、error的role=alert与其余类型的aria-live。
      </p>
      <div style={compareLayoutStyle}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalMessages />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <ReactMessages />
        </div>
      </div>
    </>
  );
}

MessageComparePage.displayName = 'MessageComparePage';

export default MessageComparePage;
