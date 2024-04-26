import React from 'react';
import classNames from 'classnames';
import LabelBase from '../Label/Base';
import type { ReactNode, FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { AccessKeyElement } from '../mixin';

export interface OptionData {
  /** 选项对应的数据 */
  data: any;

  /** 选项文本 */
  children?: ReactNode;

  /** 是否为已选中项 */
  selected?: boolean;
}

export interface OptionProps extends
  Omit<WidgetProps<HTMLDivElement>, 'ref'>,
  AccessKeyElement,
  OptionData { }

const Option: FunctionComponent<OptionProps> = ({
  accessKey,
  children,
  classes,
  disabled,
  selected,
}) => {
  const optionClassName = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    children && 'oo-ui-labelElement',
    'oo-ui-optionWidget',
    selected && 'oo-ui-optionWidget-selected',
  );

  return (
    <div
      className={optionClassName}
      aria-disabled={!!disabled}
      accessKey={accessKey}
      tabIndex={-1}
      role='option'
      aria-selected={false}
    >
      <LabelBase>{children}</LabelBase>
    </div>
  );
};

export default Option;
