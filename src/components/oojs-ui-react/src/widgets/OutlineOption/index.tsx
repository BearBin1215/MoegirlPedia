import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { clamp } from 'es-toolkit';
import { DecoratedOption, type DecoratedOptionProps } from '../DecoratedOption';
import type { OptionProps } from '../Option';

export interface OutlineOptionProps extends Omit<DecoratedOptionProps, 'value'>, OptionProps {
  /** 缩进层级0–2（超出钳制，主题CSS仅定义三级，见下方clampedLevel） */
  level?: number;

  /** 是否为鼠标按压中的选项（由Select系父组件拖拽逻辑驱动，对齐原版pressItem） */
  pressed?: boolean;
}

/** 大纲选项，对齐原版OO.ui.OutlineOptionWidget：按level输出缩进层级类，供OutlineSelect渲染 */
export const OutlineOption = forwardRef<HTMLDivElement, OutlineOptionProps>(({
  className,
  level = 0,
  selected,
  highlighted,
  pressed,
  ...rest
}, ref) => {
  // 对齐原版setLevel：钳制到[0, levels-1]（原版static.levels=3，主题CSS仅定义level-0/1/2）
  const clampedLevel = clamp(level, 0, 2);
  const classes = clsx(
    className,
    'oo-ui-outlineOptionWidget',
    `oo-ui-outlineOptionWidget-level-${clampedLevel}`,
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

