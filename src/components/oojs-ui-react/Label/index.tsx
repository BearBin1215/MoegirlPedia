import React from 'react';
import classNames from 'classnames';
import LabelBase from './Base';
import type { HTMLAttributes, FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { LabelElement } from '../mixin';
import type { LabelBaseProps } from './Base';

export interface LabelProps extends
  Omit<HTMLAttributes<HTMLSpanElement>, 'className'>,
  WidgetProps<HTMLSpanElement>,
  LabelBaseProps,
  LabelElement { }

const Label: FunctionComponent<LabelProps> = ({
  classes,
  children,
  disabled,
  ...rest
}) => {
  const className = classNames(
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-labelElement',
    'oo-ui-labelWidget',
    classes,
  );

  return (
    <LabelBase
      classes={className}
      aria-disabled={disabled}
      {...rest}
    >
      {children}
    </LabelBase>
  );
};

export default Label;
