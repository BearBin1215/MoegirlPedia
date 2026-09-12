import React, {
  forwardRef,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { Label } from '../widgets/Label';
import { Button } from '../widgets/Button';
import { PanelLayout } from '../layouts/PanelLayout';
import { useCleanId } from '../hooks';
import { useMessage } from '../config';
import { Dialog, type DialogProps } from './Dialog';

export interface MessageDialogProps extends Omit<DialogProps, 'title'> {
  title?: ReactNode;

  /** 确认按钮文本 */
  okLabel?: ReactNode;

  /** 取消按钮文本，传`null`隐藏取消按钮（如alert场景） */
  cancelLabel?: ReactNode;

  /** 点击确定或按Ctrl/Cmd+Enter时触发，不携带事件参数 */
  onOk?: () => void;
  /** 点击取消时触发，不携带事件参数 */
  onCancel?: () => void;
}

export const MessageDialog = forwardRef<HTMLDivElement, MessageDialogProps>(({
  children,
  className,
  title,
  size = 'small',
  okLabel,
  cancelLabel,
  foot,
  onOk,
  onCancel,
  onReady,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) => {
  // 缺省按钮文案经useMessage读取（Provider/模块级覆盖>英文默认），对齐原版OO.ui.msg。
  // cancelLabel传null表示隐藏取消按钮（??会把null当缺省，须显式判null）
  const defaultOkLabel = useMessage('ooui-dialog-message-accept');
  const defaultCancelLabel = useMessage('ooui-dialog-message-reject');
  const resolvedOkLabel = okLabel ?? defaultOkLabel;
  const resolvedCancelLabel = cancelLabel === null ? null : cancelLabel ?? defaultCancelLabel;
  const classes = clsx(className, 'oo-ui-messageDialog');
  // 标题元素id：使弹窗根（role='dialog'）的aria-labelledby关联标题
  const titleId = useCleanId();
  // 对齐原版MessageDialog.getReadyProcess：ready后优先聚焦primary action按钮
  // （经Button的anchorRef直接持有可聚焦链接，不依赖其内部DOM结构）
  const okButtonRef = useRef<HTMLAnchorElement>(null);

  const focusPrimary = useCallback(() => {
    okButtonRef.current?.focus();
  }, []);

  // Dialog以onReady为effect依赖：引用不稳定会导致open期间每次重渲染都重跑聚焦
  const handleReady = useCallback(() => {
    if (!foot) {
      focusPrimary();
    }
    onReady?.();
  }, [foot, focusPrimary, onReady]);

  return (
    <Dialog
      {...rest}
      size={size}
      className={classes}
      contentClassName='oo-ui-messageDialog-content'
      aria-labelledby={ariaLabelledBy ?? titleId}
      onPrimaryAction={onOk}
      onReady={handleReady}
      foot={
        <div className='oo-ui-messageDialog-actions oo-ui-messageDialog-actions-horizontal'>
          {foot ?? (
            <>
              {resolvedCancelLabel !== null && <Button className='oo-ui-actionWidget' framed={false} flags='safe' onClick={() => onCancel?.()}>{resolvedCancelLabel}</Button>}
              <Button anchorRef={okButtonRef} className='oo-ui-actionWidget' framed={false} flags='primary' onClick={() => onOk?.()}>{resolvedOkLabel}</Button>
            </>
          )}
        </div>
      }
      ref={ref}
    >
      <PanelLayout className='oo-ui-messageDialog-container' scrollable expanded={false}>
        <PanelLayout className='oo-ui-messageDialog-text' padded expanded={false}>
          <Label id={titleId} className='oo-ui-messageDialog-title'>{title}</Label>
          {/* message须带oo-ui-messageDialog-message类：主题CSS将其display:block，
              缺失时保持inline，内部FieldLayout等块级内容宽度会被收缩 */}
          <Label className='oo-ui-messageDialog-message'>{children}</Label>
        </PanelLayout>
      </PanelLayout>
    </Dialog>
  );
});

MessageDialog.displayName = 'MessageDialog';

