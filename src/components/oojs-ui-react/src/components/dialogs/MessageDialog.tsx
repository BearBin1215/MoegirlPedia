import React, {
  forwardRef,
  type ReactNode,
  type MouseEventHandler,
} from 'react';
import classNames from 'classnames';
import Dialog, { type DialogProps } from './Dialog';
import Label from '../widgets/Label';
import Button from '../widgets/Button';
import PanelLayout from '../layouts/PanelLayout';

export interface MessageDialogProps extends Omit<DialogProps, 'title'> {
  title?: ReactNode;

  /** 点击确定回调 */
  onOk?: MouseEventHandler<HTMLSpanElement>;
  /** 点击取消回调 */
  onCancel?: MouseEventHandler<HTMLSpanElement>;
}

const MessageDialog = forwardRef<HTMLDivElement, MessageDialogProps>(({
  children,
  className,
  title,
  foot,
  onOk,
  onCancel,
  ...rest
}, ref) => {
  const classes = classNames(className, 'oo-ui-messageDialog');

  return (
    <Dialog
      {...rest}
      className={classes}
      contentClassName='oo-ui-messageDialog-content'
      foot={
        <div className='oo-ui-messageDialog-actions oo-ui-messageDialog-actions-horizontal'>
          {foot ?? (
            <>
              <Button framed={false} flags='safe' onClick={onCancel}>取消</Button>
              <Button framed={false} flags='primary' onClick={onOk}>确定</Button>
            </>
          )}
        </div>
      }
      ref={ref}
    >
      <PanelLayout className='oo-ui-messageDialog-container' scrollable expanded>
        <PanelLayout className='oo-ui-messageDialog-text' padded>
          <Label className='oo-ui-messageDialog-title'>{title}</Label>
          <Label>{children}</Label>
        </PanelLayout>
      </PanelLayout>
    </Dialog>
  );
});

MessageDialog.displayName = 'MessageDialog';

export default MessageDialog;
