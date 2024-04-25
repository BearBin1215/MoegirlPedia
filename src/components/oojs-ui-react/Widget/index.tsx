import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import type { ElementProps } from '../Element';

export interface WidgetProps<T> extends ElementProps<T> {
  /** 是否禁用 */
  disabled?: boolean;
}

const Widget: FunctionComponent<WidgetProps<HTMLDivElement>> = ({
  children,
  classes,
  disabled,
  ...rest
}) => {
  const className = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
  );
  return (
    <div
      {...rest}
      className={className}
      aria-disabled={!!disabled}
    >
      {children}
    </div>
  );
};

export default Widget;
