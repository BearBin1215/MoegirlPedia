import React, { useRef, useState } from 'react';
import { alert, Button, confirm, MessageDialog } from 'oojs-ui-react';
import { ensureOOUI, unwrapJQuery, type OOUIWindow } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

const sizes = ['small', 'medium', 'large', 'larger', 'full'] as const;
type DialogSize = (typeof sizes)[number];

/** 原版侧：每种尺寸一个WindowManager（同类的static.name相同，同一manager只能挂一个MessageDialog），按钮逐个打开 */
function OriginalDialogs() {
  const dialogsRef = useRef<Partial<Record<DialogSize, OOUIWindow>>>({});
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const dialogs = sizes.map((size) => {
      const OriginalMessageDialog = oo.ui.MessageDialog as unknown as new (config?: Record<string, unknown>) => OOUIWindow;
      const manager = new oo.ui.WindowManager();
      // manager.$element为jQuery对象，取其包裹的真实DOM节点
      container.appendChild(unwrapJQuery(manager.$element));
      const dialog = new OriginalMessageDialog({ size });
      // destroy清理windowManager（clearWindows+移除DOM），避免窗口残留
      register(manager);
      manager.addWindows([dialog]);
      return [size, dialog] as const;
    });
    dialogsRef.current = Object.fromEntries(dialogs);
  });

  const openOriginal = (size: DialogSize) => {
    // 与React版相同的标题与内容，保证对照等价。
    // size必须经open的data传入：原版MessageDialog.getSetupProcess每次open都会以
    // data.size ?? static.size（'small'）覆盖构造时的size配置
    dialogsRef.current[size]?.open({
      title: `Confirm (${size})`,
      message: 'message content',
      size,
    });
  };

  return (
    <div>
      <p>
        {sizes.map((size) => (
          <Button
            key={size}
            onClick={() => openOriginal(size)}
            style={{ marginRight: '0.5em' }}
          >
            Open {size}
          </Button>
        ))}
      </p>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：五种尺寸的受控MessageDialog */
function ReactDialogs() {
  const [openSize, setOpenSize] = useState<DialogSize | undefined>(void 0);

  return (
    <div>
      <p>
        {sizes.map((size) => (
          <Button
            key={size}
            onClick={() => setOpenSize(size)}
            style={{ marginRight: '0.5em' }}
          >
            Open {size}
          </Button>
        ))}
      </p>
      {sizes.map((size) => (
        <MessageDialog
          key={size}
          open={openSize === size}
          size={size}
          title={`Confirm (${size})`}
          onEscape={() => setOpenSize(undefined)}
          onOk={() => setOpenSize(undefined)}
          onCancel={() => setOpenSize(undefined)}
        >
          message content
        </MessageDialog>
      ))}
    </div>
  );
}

/** 原版侧：OO.ui.confirm / OO.ui.alert静态命令式弹窗 */
function OriginalImperative() {
  const [result, setResult] = useState('（尚未操作）');
  // 命令式API无DOM宿主，仅借hook预加载原版库并展示状态；点击时经ensureOOUI调用
  const { containerRef } = useOriginalWidgets(() => undefined);

  const runConfirm = () => {
    ensureOOUI().then((oo) => {
      const ui = oo.ui as unknown as {
        confirm: (message: string, options?: Record<string, unknown>) => Promise<boolean>;
      };
      return ui.confirm('确定要执行吗？（原版OO.ui.confirm）', { title: '确认' });
    }).then((confirmed) => {
      setResult(`confirm结果：${confirmed}`);
    }).catch((error) => {
      console.error('原版confirm调用失败', error);
    });
  };

  const runAlert = () => {
    ensureOOUI().then((oo) => {
      const ui = oo.ui as unknown as {
        alert: (message: string, options?: Record<string, unknown>) => Promise<void>;
      };
      return ui.alert('操作已完成。（原版OO.ui.alert）', { title: '提示' });
    }).then(() => {
      setResult('alert已关闭');
    }).catch((error) => {
      console.error('原版alert调用失败', error);
    });
  };

  return (
    <div>
      {/* hook的容器占位（命令式API无控件需要挂载） */}
      <div ref={containerRef} />
      <p>
        <Button onClick={runConfirm} style={{ marginRight: '0.5em' }}>confirm</Button>
        <Button onClick={runAlert}>alert</Button>
      </p>
      <p>最近一次结果：{result}</p>
    </div>
  );
}

/** React侧：组件库导出的命令式confirm / alert */
function ReactImperative() {
  const [result, setResult] = useState('（尚未操作）');

  const runConfirm = async () => {
    const confirmed = await confirm('确定要执行吗？（React版confirm）', { title: '确认' });
    setResult(`confirm结果：${confirmed}`);
  };

  const runAlert = async () => {
    await alert('操作已完成。（React版alert）', { title: '提示' });
    setResult('alert已关闭');
  };

  return (
    <div>
      <p>
        <Button onClick={runConfirm} style={{ marginRight: '0.5em' }}>confirm</Button>
        <Button onClick={runAlert}>alert</Button>
      </p>
      <p>最近一次结果：{result}</p>
    </div>
  );
}

function DialogComparePage() {
  return (
    <CompareLayout
      title='Dialog 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          左侧为本地安装的原版oojs-ui，右侧为本组件库实现。
          两者行为对照点：打开/关闭动画时序、ESC关闭、Ctrl/Cmd+Enter触发primary按钮、焦点管理；
          打开弹窗后缩放窗口跨过尺寸阈值（如 large=700px），验证宽度/高度自适应是否实时更新。
        </>
      )}
    >
      <h2>MessageDialog尺寸</h2>
      <CompareColumns original={<OriginalDialogs />}>
        <ReactDialogs />
      </CompareColumns>

      <h2>命令式confirm/alert</h2>
      <CompareColumns original={<OriginalImperative />}>
        <ReactImperative />
      </CompareColumns>
    </CompareLayout>
  );
}

DialogComparePage.displayName = 'DialogComparePage';

export default DialogComparePage;
