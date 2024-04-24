import React from 'react';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { AccessKeyElement } from '../mixin';

export interface OptionProps extends
  Omit<WidgetProps<HTMLInputElement>, 'ref'>,
  AccessKeyElement {

  data?: any;
}

const Option: FunctionComponent<OptionProps> = ({
  accessKey,
  children,
  classes,
  disabled,
}) => {
  const optionClassName = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    children && 'oo-ui-labelElement',
    'oo-ui-optionWidget',
  );

  return (
    <div
      className={optionClassName}
      aria-disabled={false}
      accessKey={accessKey}
      tabIndex={-1}
      role='option'
      aria-selected={false}
    >
      <span className='oo-ui-labelElement-label'>{children}</span>
    </div>
  );
};

export default Option;
