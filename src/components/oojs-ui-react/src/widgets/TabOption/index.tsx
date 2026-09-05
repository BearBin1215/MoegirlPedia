import React, { forwardRef, type MouseEventHandler, type ReactNode } from 'react';
import clsx from 'clsx';
import LabelBase from '../Label/Base';
import { generateWidgetClassName } from '../../utils';
import type { OptionProps } from '../Option';

export type TabOptionProps = OptionProps & {
  /** 是否为鼠标按压中的选项（由TabSelect拖拽逻辑驱动，对齐原版pressItem） */
  pressed?: boolean;

  /** 页签集复用时随对象透入的标签，仅供组件吞掉以避免落成DOM属性（渲染用children） */
  label?: ReactNode;
};

/** 选项组件，用于作为`TabSelect`子组件，对齐原版`TabOptionWidget`（不可高亮） */
const TabOption = forwardRef<HTMLDivElement, TabOptionProps>(({
  children,
  className,
  value: _value,
  disabled,
  highlighted: _highlighted,
  selected,
  pressed,
  label: _label,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, label: children }, 'option', 'tabOption'),
    selected && 'oo-ui-optionWidget-selected',
    pressed && 'oo-ui-optionWidget-pressed',
  );

  /** 阻止默认行为以保持焦点在tablist上（原版onMouseDown返回false） */
  const handlePress: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='tab'
      aria-selected={!!selected}
      onMouseDown={handlePress}
      ref={ref}
    >
      <LabelBase>{children}</LabelBase>
    </div>
  );
});

TabOption.displayName = 'TabOption';

export default TabOption;
