import React, {
  forwardRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import LabelBase from '../Label/Base';
import { generateWidgetClassName, type AccessKeyedElement } from '../../utils';
import type { WidgetProps } from '../Widget';

export interface OptionData {
  /** 选项对应的数据 */
  data: string | number;

  /** 选项文本 */
  children?: ReactNode;

  /** 是否为已选中项 */
  selected?: boolean;

  /** 是否为键盘导航高亮项 */
  highlighted?: boolean;
}

export type OptionProps<T = HTMLDivElement> =
  WidgetProps<T> &
  AccessKeyedElement &
  OptionData;

/** 基础选项组件 */
const Option = forwardRef<HTMLDivElement, OptionProps>(({
  accessKey,
  children,
  className,
  disabled,
  selected,
  highlighted,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, label: children }, 'option'),
    selected && 'oo-ui-optionWidget-selected',
    highlighted && 'oo-ui-optionWidget-highlighted',
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      accessKey={accessKey}
      tabIndex={-1}
      role='option'
      aria-selected={!!selected}
      ref={ref}
    >
      <LabelBase>{children}</LabelBase>
    </div>
  );
});

Option.displayName = 'Option';

export default Option;
