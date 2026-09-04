import React, {
  forwardRef,
  useRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import Label from '../widgets/Label';
import Button from '../widgets/Button';
import PanelLayout from '../layouts/PanelLayout';
import Dialog, { type DialogProps } from './Dialog';

export interface MessageDialogProps extends Omit<DialogProps, 'title'> {
  title?: ReactNode;

  /** 确认按钮文本 */
  okLabel?: ReactNode;

  /** 取消按钮文本 */
  cancelLabel?: ReactNode;

  /** 点击确定或按Ctrl/Cmd+Enter时触发，不携带事件参数 */
  onOk?: () => void;
  /** 点击取消时触发，不携带事件参数 */
  onCancel?: () => void;
}

const MessageDialog = forwardRef<HTMLDivElement, MessageDialogProps>(({
  children,
  className,
  title,
  okLabel = 'OK',
  cancelLabel = 'Cancel',
  foot,
  onOk,
  onCancel,
  ...rest
}, ref) => {
  const classes = clsx(className, 'oo-ui-messageDialog');
  // 对齐原版Dialog.focus()：ready后优先聚焦primary action按钮
  const okButtonRef = useRef<HTMLSpanElement>(null);

  const focusPrimary = () => {
    okButtonRef.current?.querySelector('a')?.focus();
  };

  return (
    <Dialog
      {...rest}
      className={classes}
      contentClassName='oo-ui-messageDialog-content'
      onPrimaryAction={onOk}
      onReady={foot ? undefined : focusPrimary}
      foot={
        <div className='oo-ui-messageDialog-actions oo-ui-messageDialog-actions-horizontal'>
          {foot ?? (
            <>
              <Button className='oo-ui-actionWidget' framed={false} flags='safe' onClick={() => onCancel?.()}>{cancelLabel}</Button>
              <Button ref={okButtonRef} className='oo-ui-actionWidget' framed={false} flags='primary' onClick={() => onOk?.()}>{okLabel}</Button>
            </>
          )}
        </div>
      }
      ref={ref}
    >
      <PanelLayout className='oo-ui-messageDialog-container' scrollable expanded={false}>
        <PanelLayout className='oo-ui-messageDialog-text' padded expanded={false}>
          <Label className='oo-ui-messageDialog-title'>{title}</Label>
          <Label>{children}</Label>
        </PanelLayout>
      </PanelLayout>
    </Dialog>
  );
});

MessageDialog.displayName = 'MessageDialog';

export default MessageDialog;
