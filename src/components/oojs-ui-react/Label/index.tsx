import React from 'react';
import classNames from 'classnames';
import LabelBase from './Base';
import { processClassNames } from '../utils/tool';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../types/props';
import type { LabelElement } from '../types/mixin';

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
    className,
    processClassNames({ disabled, label: children }, 'label'),
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
