import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { LabelBase } from '../Label/Base';
import { RadioInput } from '../RadioInput';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import type { OptionProps } from '../Option';

// highlighted不适用：radio选项无键盘高亮态（对齐原版RadioOptionWidget.static.highlightable=false），
// Omit避免其随props落入<label>
export interface RadioOptionProps extends Omit<OptionProps<HTMLLabelElement>, 'highlighted'> {
  name?: string;
  onChange?: ChangeHandler<boolean, HTMLInputElement>;
  selected?: boolean;
}

export const RadioOption = forwardRef<HTMLLabelElement, RadioOptionProps>(({
  accessKey,
  className,
  disabled,
  children,
  name,
  onChange,
  selected,
  value: _value,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, label: children }, 'option', 'radioOption'),
    selected && 'oo-ui-optionWidget-selected',
  );

  return (
    <label
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      role='radio'
      aria-checked={!!selected}
      ref={ref}
    >
      <RadioInput
        accessKey={accessKey}
        disabled={disabled}
        name={name}
        onChange={onChange}
        checked={selected}
        // 对齐原版RadioOptionWidget：内层radio以tabIndex:-1+role:presentation屏蔽
        // 原生语义，由外层label（role=radio）承担可聚焦与读屏语义，避免radio套radio
        // 重复播报与多余的tab停靠点
        tabIndex={-1}
        role='presentation'
      />
      <LabelBase>{children}</LabelBase>
    </label>
  );
});

RadioOption.displayName = 'RadioOption';

