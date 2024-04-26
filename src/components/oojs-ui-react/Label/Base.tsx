import React from 'react';
import classNames from 'classnames';
import type { RefObject, HTMLAttributes, FunctionComponent } from 'react';
import type { LabelElement } from '../mixin';

export interface LabelBaseProps extends
  Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
  LabelElement {

  className?: string;

  ref?: RefObject<HTMLSpanElement>;
}

const LabelBase: FunctionComponent<LabelBaseProps> = ({
  className,
  children,
  ...rest
}) => {
  const classes = classNames('oo-ui-labelElement-label', className);

  return (
    <span
      className={classes}
      {...rest}
    >
      {children}
    </span>
  );
};

export default LabelBase;
