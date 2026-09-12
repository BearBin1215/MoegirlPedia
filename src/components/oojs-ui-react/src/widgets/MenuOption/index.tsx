import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { DecoratedOption, type DecoratedOptionProps } from '../DecoratedOption';
import type { OptionProps } from '../Option';

export type MenuOptionProps =
  DecoratedOptionProps &
  OptionProps & {
    /** 是否为鼠标按压中的选项（由Select系父组件拖拽逻辑驱动） */
    pressed?: boolean;
  };

/** 选项组件，用于作为`Dropdown`子组件 */
export const MenuOption = forwardRef<HTMLDivElement, MenuOptionProps>(({
  className,
  disabled,
  selected,
  highlighted,
  pressed,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-menuOptionWidget',
    pressed && 'oo-ui-optionWidget-pressed',
    highlighted && 'oo-ui-optionWidget-highlighted',
    selected && 'oo-ui-optionWidget-selected',
  );

  return (
    <DecoratedOption
      {...rest}
      disabled={disabled}
      className={classes}
      aria-selected={!!selected}
      ref={ref}
    />
  );
});

MenuOption.displayName = 'MenuOption';

