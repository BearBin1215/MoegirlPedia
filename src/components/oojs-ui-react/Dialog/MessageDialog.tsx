import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import Dialog from './Dialog';
import Label from '../Label';
import type { ReactNode } from 'react';
import type { DialogProps } from './Dialog';

export interface MessageDialogProps extends DialogProps {
  title?: ReactNode,
}

const MessageDialog: FunctionComponent<MessageDialogProps> = ({
  children,
  className,
  title,
  foot,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-messageDialog',
  );

  return (
    <Dialog
      className={classes}
      contentClassName='oo-ui-messageDialog-content'
      {...rest}
      foot={
        <div className='oo-ui-messageDialog-actions oo-ui-messageDialog-actions-horizontal'>
          {foot}
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
