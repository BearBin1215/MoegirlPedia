import React, { useState, forwardRef, type MouseEventHandler } from 'react';
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
import LabelBase from '../Label/Base';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { OptionData } from '../Option';

export interface TabOptionProps extends WidgetProps<HTMLDivElement>, OptionData {}

/** 选项组件，用于作为`TabSelect`子组件，对齐原版`TabOptionWidget`（不可高亮） */
const TabOption = forwardRef<HTMLDivElement, TabOptionProps>(({
  children,
  className,
  data,
  disabled,
  highlighted,
  selected,
  ...rest
}, ref) => {
  const [pressed, setPressed] = useState(false);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, label: children }, 'option', 'tabOption'),
    selected && 'oo-ui-optionWidget-selected',
    pressed && 'oo-ui-optionWidget-pressed',
  );

  /** 按住鼠标，阻止默认行为以保持焦点在tablist上（原版onMouseDown返回false） */
  const handlePress: MouseEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setPressed(true);
  };

  /** 松开或移出 */
  const handleUnpress = () => {
    setPressed(false);
  };

  return (
    <div
      {...omit(rest, 'label')}
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='tab'
      aria-selected={!!selected}
      onMouseDown={handlePress}
      onMouseUp={handleUnpress}
      onMouseLeave={handleUnpress}
      ref={ref}
    >
      <LabelBase>{children}</LabelBase>
    </div>
  );
});

TabOption.displayName = 'TabOption';

export default TabOption;
