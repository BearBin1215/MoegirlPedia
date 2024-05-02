import React, { FunctionComponent } from 'react';
import classNames from 'classnames';
import { processClassNames } from '../../utils/tool';
import type { ElementProps } from '../Element';

export interface WidgetProps<T = HTMLDivElement> extends ElementProps<T> {
  /** 是否禁用 */
  disabled?: boolean;
}

const Widget: FunctionComponent<WidgetProps<HTMLDivElement>> = ({
  children,
  className,
  disabled,
  ...rest
}) => {
  const classes = classNames(
    className,
    processClassNames({ disabled }),
  );
  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
    >
      {children}
    </div>
  );
};

export default Widget;
