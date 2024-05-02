import React from 'react';
import classNames from 'classnames';
import LabelBase from './Base';
import { processClassNames } from '../../utils/tool';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../../types/props';

export type LabelProps = WidgetProps<HTMLSpanElement>;

const Label: FunctionComponent<LabelProps> = ({
  className,
  children,
  disabled,
  ...rest
}) => {
  const classes = classNames(
    className,
    processClassNames({ disabled, label: children }, 'label'),
    'oo-ui-labelElement',
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
