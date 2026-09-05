import React, {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createRoot } from 'react-dom/client';
import MessageDialog from './MessageDialog';
import type { DialogProps } from './Dialog';

export interface ConfirmAlertOptions {
  /** 弹窗标题 */
  title?: ReactNode;

  /** 确认按钮文本 */
  okLabel?: ReactNode;

  /** 取消按钮文本（仅confirm） */
  cancelLabel?: ReactNode;

  /** 弹窗大小 */
  size?: DialogProps['size'];
}

export type AlertOptions = Omit<ConfirmAlertOptions, 'cancelLabel'>;

// 对齐Dialog关闭动画250ms，留裕量后卸载
const CLOSE_DURATION = 300;

// 命令式挂载：自建Portal渲染受控MessageDialog，关闭动画结束后卸载并兑现Promise
function openMessageDialog(
  message: ReactNode,
  options: ConfirmAlertOptions,
  mode: 'confirm' | 'alert',
): Promise<boolean> {
  return new Promise((resolve) => {
    const portal = document.createElement('div');
    document.body.appendChild(portal);
    const root = createRoot(portal);

    const Host = () => {
      const [open, setOpen] = useState(false);
      const finishingRef = useRef(false);

      useEffect(() => {
        setOpen(true);
      }, []);

      const finish = (result: boolean) => {
        if (finishingRef.current) {
          return;
        }
        finishingRef.current = true;
        setOpen(false);
        setTimeout(() => {
          root.unmount();
          portal.remove();
          resolve(result);
        }, CLOSE_DURATION);
      };

      const handleOk = () => finish(true);
      const handleCancel = () => finish(false);

      return (
        <MessageDialog
          open={open}
          title={options.title}
          size={options.size}
          okLabel={options.okLabel}
          // alert仅含确定按钮，对齐原版alert只注册accept action的行为
          cancelLabel={mode === 'confirm' ? options.cancelLabel : null}
          escapable
          onEscape={handleCancel}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {message}
        </MessageDialog>
      );
    };

    root.render(<Host />);
  });
}

/**
 * 对齐原版`OO.ui.confirm`：弹出确认框，确定时兑现`true`，取消/ESC时兑现`false`。
 * 命令式API，与MessageDialog组件单向依赖（原版即为OO.ui命名空间下的独立函数）。
 */
export function confirm(message: ReactNode, options: ConfirmAlertOptions = {}): Promise<boolean> {
  return openMessageDialog(message, options, 'confirm');
}

/**
 * 对齐原版`OO.ui.alert`：弹出仅含确定按钮的提示框，关闭时兑现。
 * 命令式API，与MessageDialog组件单向依赖（原版即为OO.ui命名空间下的独立函数）。
 */
export function alert(message: ReactNode, options: AlertOptions = {}): Promise<void> {
  return openMessageDialog(message, options, 'alert').then(() => undefined);
}
