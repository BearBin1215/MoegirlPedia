import React, { forwardRef } from 'react';
import clsx from 'clsx';
import DecoratedOption, { type DecoratedOptionProps } from '../DecoratedOption';
import type { OptionProps } from '../Option';

export interface OutlineOptionProps extends Omit<DecoratedOptionProps, 'value'>, OptionProps {
  level?: number;

  /** 是否为鼠标按压中的选项（由Select系父组件拖拽逻辑驱动，对齐原版pressItem） */
  pressed?: boolean;
}

const OutlineOption = forwardRef<HTMLDivElement, OutlineOptionProps>(({
  className,
  level = 0,
  selected,
  highlighted,
  pressed,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-outlineOptionWidget',
    `oo-ui-outlineOptionWidget-level-${level}`,
    selected && 'oo-ui-optionWidget-selected',
    highlighted && 'oo-ui-optionWidget-highlighted',
    pressed && 'oo-ui-optionWidget-pressed',
  );

  return (
    <DecoratedOption
      {...rest}
      className={classes}
      aria-selected={!!selected}
      ref={ref}
    />
  );
});

OutlineOption.displayName = 'OutlineOption';

export default OutlineOption;
