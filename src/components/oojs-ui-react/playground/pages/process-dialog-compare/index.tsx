import React, { useRef, useState } from 'react';
import { ProcessDialog, ProgressBar, type ProcessDialogErrorProps } from 'oojs-ui-react';
import { unwrapJQuery } from '../../components/ooui';
import { useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

/** 两侧各自维护尝试计数：第奇数次点击continue模拟失败（可恢复错误），偶数次成功并关闭 */

function OriginalProcessDialog() {
  const progressRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>([]);
  const attemptRef = useRef(0);
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as any;

    // 进度条样本（普通widget无destroy，随容器卸载清理）
    const progressHost = progressRef.current;
    for (const progress of [0, 40, 100, false]) {
      const bar = new ui.ProgressBarWidget({ progress });
      progressHost?.appendChild(unwrapJQuery(bar.$element));
    }

    const DemoDialog: any = function (this: any, config: Record<string, unknown>) {
      ui.ProcessDialog.call(this, config);
    };
    DemoDialog.prototype = Object.create(ui.ProcessDialog.prototype);
    // 修正constructor指向：OOJS实例经this.constructor.static读取子类配置
    DemoDialog.prototype.constructor = DemoDialog;
    DemoDialog.static = Object.create(ui.ProcessDialog.static);
    Object.assign(DemoDialog.static, {
      name: 'demoProcessDialog',
      title: '流程弹窗（原版）',
      actions: [
        { action: 'continue', label: '继续', flags: ['primary', 'progressive'] },
        { action: 'cancel', label: '取消', flags: 'safe' },
      ],
    });
    DemoDialog.prototype.initialize = function (...args: unknown[]) {
      ui.ProcessDialog.prototype.initialize.apply(this, args);
      this.panel = new ui.PanelLayout({ padded: true, expanded: false });
      this.panel.$element.append('<p>点击“继续”执行异步流程：奇数次模拟失败展示错误面板，重试后成功关闭。</p>');
      this.$body.append(this.panel.$element);
    };
    DemoDialog.prototype.getBodyHeight = () => 120;
    DemoDialog.prototype.getActionProcess = function (action: string) {
      if (action === 'continue') {
        attemptRef.current += 1;
        const willFail = attemptRef.current % 2 === 1;
        return new ui.Process().next(() => new Promise<void>((resolve, reject) => {
          setLog((prev) => [willFail ? '执行：失败（模拟错误）' : '执行：成功并关闭', ...prev].slice(0, 5));
          setTimeout(() => {
            if (willFail) {
              reject([new ui.Error('模拟保存失败，请重试', { recoverable: true })]);
            } else {
              resolve();
            }
          }, 600);
        })).next(() => {
          this.close();
        });
      }
      return ui.ProcessDialog.prototype.getActionProcess.call(this, action);
    };

    const windowManager = new ui.WindowManager();
    register(windowManager);
    container.appendChild(unwrapJQuery(windowManager.$element));
    const openButton = document.createElement('button');
    openButton.textContent = '打开原版ProcessDialog';
    openButton.addEventListener('click', () => {
      const dialog = new DemoDialog({ size: 'medium' });
      windowManager.addWindows([dialog]);
      windowManager.openWindow(dialog);
    });
    container.prepend(openButton);

    // 不可恢复错误样本：错误后触发动作被禁用（setAbilities持续到关闭），错误面板仅能经Back退出
    const FatalDialog: any = function (this: any, config: Record<string, unknown>) {
      ui.ProcessDialog.call(this, config);
    };
    FatalDialog.prototype = Object.create(ui.ProcessDialog.prototype);
    FatalDialog.prototype.constructor = FatalDialog;
    FatalDialog.static = Object.create(ui.ProcessDialog.static);
    Object.assign(FatalDialog.static, {
      name: 'demoProcessDialogFatal',
      title: '不可恢复错误（原版）',
      actions: [
        { action: 'continue', label: '继续', flags: ['primary', 'progressive'] },
        { action: 'cancel', label: '取消', flags: 'safe' },
      ],
    });
    FatalDialog.prototype.initialize = function (...args: unknown[]) {
      ui.ProcessDialog.prototype.initialize.apply(this, args);
      this.panel = new ui.PanelLayout({ padded: true, expanded: false });
      this.panel.$element.append('<p>点击“继续”始终失败（不可恢复）：continue按钮禁用持续到关闭。</p>');
      this.$body.append(this.panel.$element);
    };
    FatalDialog.prototype.getBodyHeight = () => 120;
    FatalDialog.prototype.getActionProcess = function (action: string) {
      if (action === 'continue') {
        return new ui.Process().next(() => new Promise<void>((resolve, reject) => {
          setTimeout(() => reject([new ui.Error('致命错误，动作已禁用', { recoverable: false })]), 300);
        }));
      }
      return ui.ProcessDialog.prototype.getActionProcess.call(this, action);
    };

    const fatalManager = new ui.WindowManager();
    register(fatalManager);
    container.appendChild(unwrapJQuery(fatalManager.$element));
    const fatalButton = document.createElement('button');
    fatalButton.textContent = '打开原版不可恢复错误示例';
    fatalButton.addEventListener('click', () => {
      const dialog = new FatalDialog({ size: 'medium' });
      fatalManager.addWindows([dialog]);
      fatalManager.openWindow(dialog);
    });
    container.prepend(fatalButton);
  });

  return (
    <div>
      <div ref={containerRef} />
      <h3>进度条样本（0/40/100/不定）</h3>
      <div ref={progressRef} style={{ maxWidth: 320 }} />
      <h3>执行记录</h3>
      <ul>
        {log.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

function ReactProcessDialog() {
  const [open, setOpen] = useState(false);
  const [fatalOpen, setFatalOpen] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const attemptRef = useRef(0);

  const handleAction = (action: string): Promise<void> => {
    if (action !== 'continue') {
      // 对齐原版默认getActionProcess：空流程后close
      setOpen(false);
      return Promise.resolve();
    }
    attemptRef.current += 1;
    const willFail = attemptRef.current % 2 === 1;
    setLog((prev) => [willFail ? '执行：失败（模拟错误）' : '执行：成功并关闭', ...prev].slice(0, 5));
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (willFail) {
          const error: ProcessDialogErrorProps = { message: '模拟保存失败，请重试', recoverable: true };
          reject([error]);
        } else {
          resolve();
        }
      }, 600);
    }).then(() => {
      setOpen(false);
    });
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>打开React ProcessDialog</button>
      <ProcessDialog
        open={open}
        title='流程弹窗（React）'
        size='medium'
        actions={[
          { action: 'continue', label: '继续', flags: ['primary', 'progressive'] },
          { action: 'cancel', label: '取消', flags: 'safe' },
        ]}
        onAction={handleAction}
        onEscape={() => setOpen(false)}
      >
        <div style={{ padding: '1em' }}>
          <p>点击“继续”执行异步流程：奇数次模拟失败展示错误面板，重试后成功关闭。</p>
        </div>
      </ProcessDialog>
      <button onClick={() => setFatalOpen(true)}>打开React不可恢复错误示例</button>
      <ProcessDialog
        open={fatalOpen}
        title='不可恢复错误（React）'
        size='medium'
        actions={[
          { action: 'continue', label: '继续', flags: ['primary', 'progressive'] },
          { action: 'cancel', label: '取消', flags: 'safe' },
        ]}
        onAction={(action) => {
          if (action !== 'continue') {
            setFatalOpen(false);
            return Promise.resolve();
          }
          // 始终失败：continue按钮禁用持续到关闭（对齐原版setAbilities）
          return new Promise<void>((resolve, reject) => {
            setTimeout(() => reject([{ message: '致命错误，动作已禁用', recoverable: false }]), 300);
          });
        }}
        onEscape={() => setFatalOpen(false)}
      >
        <div style={{ padding: '1em' }}>
          <p>点击“继续”始终失败（不可恢复）：continue按钮禁用持续到关闭。</p>
        </div>
      </ProcessDialog>
      <h3>进度条样本（0/40/100/不定）</h3>
      <div style={{ maxWidth: 320 }}>
        <ProgressBar progress={0} />
        <ProgressBar progress={40} />
        <ProgressBar progress={100} />
        <ProgressBar />
      </div>
      <h3>执行记录</h3>
      <ul>
        {log.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}

function ProcessDialogComparePage() {
  return (
    <CompareLayout
      title='ProcessDialog/ProgressBar 对照 - 原版oojs-ui vs oojs-ui-react'
      description={(
        <>
          对照点：头部safe（左）/标题（中）/primary（右）布局、ESC触发safe动作、Ctrl/Cmd+Enter触发primary、
          动作执行期间头部pending条纹、失败错误面板（挂载于content、绝对定位覆盖整个弹窗；
          Dismiss/重试按钮、警告文案Continue）、不可恢复错误时触发动作禁用持续到关闭、
          进度条0/40/100/不定进度形态。
        </>
      )}
    >
      <CompareColumns original={<OriginalProcessDialog />}>
        <ReactProcessDialog />
      </CompareColumns>
    </CompareLayout>
  );
}

ProcessDialogComparePage.displayName = 'ProcessDialogComparePage';

export default ProcessDialogComparePage;
