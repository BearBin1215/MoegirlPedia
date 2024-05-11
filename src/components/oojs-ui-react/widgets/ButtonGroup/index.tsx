import React from 'react';
import classNames from 'classnames';
import Widget from '../Widget';
import type { FunctionComponent, ReactElement } from 'react';
import type { WidgetProps } from '../Widget';
import type { ButtonProps } from '../Button';

export interface ButtonGroupProps extends WidgetProps {
  children: ReactElement<ButtonProps> | ReactElement<ButtonProps>[];
}

const ButtonGroup: FunctionComponent<ButtonGroupProps> = ({
  className,
  children,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-buttonGroupWidget',
  );
  return (
    <Widget
      {...rest}
      className={classes}
    >
      {children}
    </Widget>
  );
};

export default ButtonGroup;
