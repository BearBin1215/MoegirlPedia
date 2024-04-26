import React from 'react';
import classNames from 'classnames';
import LabelBase from './Base';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { LabelElement } from '../mixin';

export interface LabelProps extends
  WidgetProps<HTMLSpanElement>,
  LabelElement { }

const Label: FunctionComponent<LabelProps> = ({
  className,
  children,
  disabled,
  ...rest
}) => {
  const classes = classNames(
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-labelElement',
    'oo-ui-labelWidget',
    className,
  );

  return (
    <LabelBase
      className={classes}
      aria-disabled={!!disabled}
      {...rest}
    >
      {children}
    </LabelBase>
  );
};

export default Label;
