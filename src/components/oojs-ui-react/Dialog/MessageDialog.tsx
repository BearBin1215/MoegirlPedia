import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import Dialog from './Dialog';
import Label from '../Label';
import Button from '../Button';
import type { ReactNode } from 'react';
import type { DialogProps } from './Dialog';

export interface MessageDialogProps extends DialogProps {
  title?: ReactNode;

  /** 点击确定回调 */
  onOk?: () => void;
  /** 点击取消回调 */
  onCancel?: () => void;
}

const MessageDialog: FunctionComponent<MessageDialogProps> = ({
  children,
  className,
  title,
  foot,
  onOk,
  onCancel,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-messageDialog',
  );

  return (
    <Dialog
      {...rest}
      className={classes}
      contentClassName='oo-ui-messageDialog-content'
      foot={
        <div className='oo-ui-messageDialog-actions oo-ui-messageDialog-actions-horizontal'>
          {foot || (
            <>
              <Button framed={false} flags='safe' onClick={onCancel}>取消</Button>
              <Button framed={false} flags='primary' onClick={onOk}>确定</Button>
            </>
          )}
        </div>
      }
    >
      <div className='oo-ui-messageDialog-container oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-scrollable oo-ui-panelLayout-expanded'>
        <div className='oo-ui-messageDialog-text oo-ui-layout oo-ui-panelLayout oo-ui-panelLayout-padded'>
          <Label className='oo-ui-messageDialog-title'>{title}</Label>
          <Label>{children}</Label>
        </div>
      </div>
    </Dialog>
  );
};

export default MessageDialog;
