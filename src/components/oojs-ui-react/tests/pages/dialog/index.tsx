import React, { useState } from 'react';
import { alert, Button, confirm, Dialog, MessageDialog } from 'oojs-ui-react';

const sizes = ['small', 'medium', 'large', 'full'] as const;

function DialogPage() {
  const [openSize, setOpenSize] = useState<string | undefined>(void 0);
  const [messageOpen, setMessageOpen] = useState(false);
  const [staticResult, setStaticResult] = useState<string>('（尚未操作）');

  return (
    <>
      <h1>Dialog - 弹窗</h1>
      <p>打开弹窗后缩放窗口跨过尺寸阈值（如 large=700px），验证宽度/高度自适应是否实时更新。</p>

      <h2>尺寸</h2>
      <p>
        {sizes.map((size) => (
          <React.Fragment key={size}>
            <Button onClick={() => setOpenSize(size)}>Open {size}</Button>{' '}
            <Dialog
              open={openSize === size}
              size={size}
              head={<span>Dialog ({size})</span>}
              onEscape={() => setOpenSize(undefined)}
            >
              <p>content</p>
              <Button flags='primary' onClick={() => setOpenSize(undefined)}>
                Close
              </Button>
            </Dialog>
          </React.Fragment>
        ))}
      </p>

      <h2>MessageDialog</h2>
      <Button onClick={() => setMessageOpen(true)}>Open message</Button>
      <MessageDialog
        open={messageOpen}
        title='Confirm'
        okLabel='确定'
        cancelLabel='取消'
        onEscape={() => setMessageOpen(false)}
        onOk={() => setMessageOpen(false)}
        onCancel={() => setMessageOpen(false)}
      >
        message content（按ESC或Ctrl+Enter测试）
      </MessageDialog>

      <h2>命令式confirm/alert</h2>
      <p>
        <Button
          onClick={async () => {
            const result = await confirm('确定要执行吗？', { title: '确认' });
            setStaticResult(`confirm结果：${result}`);
          }}
        >
          confirm
        </Button>{' '}
        <Button
          onClick={async () => {
            await alert('操作已完成。', { title: '提示' });
            setStaticResult('alert已关闭');
          }}
        >
          alert
        </Button>
      </p>
      <p>最近一次结果：{staticResult}</p>
    </>
  );
}

DialogPage.displayName = 'DialogPage';

export default DialogPage;
