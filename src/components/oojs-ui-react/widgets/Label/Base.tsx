import React, { forwardRef } from 'react';
import classNames from 'classnames';
import type { RefObject, HTMLAttributes } from 'react';
import type { LabelElement } from '../../types/mixin';

export interface LabelBaseProps extends
  Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
  LabelElement {

  className?: string;

  ref?: RefObject<HTMLSpanElement>;
}

const LabelBase = forwardRef<HTMLSpanElement, LabelBaseProps>(({
  className,
  children,
  ...rest
}, ref) => {
  const classes = classNames('oo-ui-labelElement-label', className);

  return (
    <span
      {...rest}
      className={classes}
      ref={ref}
    >
      {children}
    </span>
  );
});

LabelBase.displayName = 'LabelBase';

export default LabelBase;
