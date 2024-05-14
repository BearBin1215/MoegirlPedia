import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Widget from '../Widget';
import type { ReactElement } from 'react';
import type { WidgetProps } from '../Widget';
import type { ButtonProps } from '../Button';
import type { ElementRef } from '../../types/ref';

export interface ButtonGroupProps extends WidgetProps {
  children: ReactElement<ButtonProps> | ReactElement<ButtonProps>[];
}

const ButtonGroup = forwardRef<ElementRef<HTMLDivElement>, ButtonGroupProps>(({
  className,
  children,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-buttonGroupWidget',
  );
  return (
    <Widget
      {...rest}
      className={classes}
      ref={ref}
    >
      {children}
    </Widget>
  );
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
