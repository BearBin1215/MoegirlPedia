import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { DecoratedOption, type DecoratedOptionProps } from '../DecoratedOption';
import { getOptionIconClasses, optionWidgetClasses } from '../../mixins';
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
  // 原版MenuOptionWidget沿用OptionWidget基类static（selectable/highlightable/pressable皆true）
  const classes = clsx(
    className,
    'oo-ui-menuOptionWidget',
    optionWidgetClasses({ selected, highlighted, pressed }),
  );

  return (
    <DecoratedOption
      {...rest}
      disabled={disabled}
      className={classes}
      // 选中/按压态的图标着色（wikimediaui主题按选项类内置的变体规则，与flags无关）
      variantClasses={getOptionIconClasses({ selected, pressed, disabled })}
      aria-selected={!!selected}
      ref={ref}
    />
  );
});

MenuOption.displayName = 'MenuOption';

