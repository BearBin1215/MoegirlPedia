import React from 'react';
import classNames from 'classnames';
import LabelBase from '../Label/Base';
import { processClassNames } from '../../utils/tool';
import type { ReactNode, FunctionComponent } from 'react';
import type { WidgetProps } from '../../types/props';
import type { AccessKeyElement } from '../../types/mixin';

export interface OptionData {
  /** 选项对应的数据 */
  data?: string | number | boolean;

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
  className,
  disabled,
  selected,
  ...rest
}) => {
  const classes = classNames(
    className,
    processClassNames({ disabled, label: children }, 'option'),
    selected && 'oo-ui-optionWidget-selected',
  );

  return (
    <div
      {...rest}
      className={classes}
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
