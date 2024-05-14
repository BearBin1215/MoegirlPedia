import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import LabelBase from '../Label/Base';
import { processClassNames } from '../../utils/tool';
import type { ReactNode } from 'react';
import type { WidgetProps } from '../../types/props';
import type { AccessKeyElement } from '../../types/mixin';
import type { ElementRef } from '../../types/ref';

export interface OptionData {
  /** 选项对应的数据 */
  data: string | number | boolean;

  /** 选项文本 */
  children?: ReactNode;

  /** 是否为已选中项 */
  selected?: boolean;
}

export interface OptionProps extends
  WidgetProps<HTMLDivElement>,
  AccessKeyElement,
  OptionData { }

const Option = forwardRef<ElementRef<HTMLDivElement>, OptionProps>(({
  accessKey,
  children,
  className,
  disabled,
  selected,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const classes = classNames(
    className,
    processClassNames({ disabled, label: children }, 'option'),
    selected && 'oo-ui-optionWidget-selected',
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      accessKey={accessKey}
      tabIndex={-1}
      role='option'
      aria-selected={false}
      ref={elementRef}
    >
      <LabelBase>{children}</LabelBase>
    </div>
  );
});

Option.displayName = 'Option';

export default Option;
