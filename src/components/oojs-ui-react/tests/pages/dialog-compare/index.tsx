import React, { useEffect, useRef, useState } from 'react';
import { Button, MessageDialog } from 'oojs-ui-react';
import { ensureOOUI, unwrapJQuery } from '../../components/ooui';

type OOUIWindow = {
  open: (data?: { title?: string; message?: string }) => void;
};

function OriginalDialog() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<OOUIWindow | null>(null);
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    ensureOOUI().then((OO) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const manager = new OO.ui.WindowManager();
      // manager.$element为jQuery对象，取其包裹的真实DOM节点
      containerRef.current.appendChild(unwrapJQuery(manager.$element));
      const dialog = new OO.ui.MessageDialog();
      manager.addWindows([dialog]);
      dialogRef.current = dialog;
      setStatus('原版已就绪');
    }).catch(() => {
      setStatus('原版加载失败');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const openOriginal = () => {
    // 与React版相同的标题与内容，保证对照等价
    dialogRef.current?.open({
      title: 'Confirm',
      message: 'React版message content',
    });
  };

  return (
    <div>
      <Button onClick={openOriginal} disabled={status !== '原版已就绪'}>
        Open原版MessageDialog
      </Button>
      <span style={{ marginLeft: '0.5em' }}>{status}</span>
      <div ref={containerRef} />
    </div>
  );
}

function ComparePage() {
  const [reactOpen, setReactOpen] = useState(false);

  return (
    <>
      <h1>Dialog对照 - 原版oojs-ui vs oojs-ui-react</h1>
      <p>
        左侧为本地安装的原版oojs-ui（加载dist js），右侧为本组件库实现。
        两者行为对照点：打开/关闭动画时序、ESC关闭、Ctrl/Cmd+Enter触发primary按钮、焦点管理。
      </p>

      <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h2>原版oojs-ui</h2>
          <OriginalDialog />
        </div>
        <div style={{ flex: 1 }}>
          <h2>oojs-ui-react</h2>
          <Button onClick={() => setReactOpen(true)}>Open React版MessageDialog</Button>
          <MessageDialog
            open={reactOpen}
            title='Confirm'
            onEscape={() => setReactOpen(false)}
            onOk={() => setReactOpen(false)}
            onCancel={() => setReactOpen(false)}
          >
            React版message content
          </MessageDialog>
        </div>
      </div>
    </>
  );
}

ComparePage.displayName = 'ComparePage';

export default ComparePage;
