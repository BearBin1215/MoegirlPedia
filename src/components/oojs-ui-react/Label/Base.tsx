import React from 'react';
import classNames from 'classnames';
import type { RefObject, HTMLAttributes, FunctionComponent } from 'react';
import type { LabelElement } from '../mixin';

export interface LabelBaseProps extends
  Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
  LabelElement {

  classes?: string | string[];

  ref?: RefObject<HTMLSpanElement>;
}

const LabelBase: FunctionComponent<LabelBaseProps> = ({
  classes,
  children,
  ...rest
}) => {
  const className = classNames('oo-ui-labelElement-label', classes);

  return (
    <span
      className={className}
      {...rest}
    >
      {children}
    </span>
  );
};

export default LabelBase;
