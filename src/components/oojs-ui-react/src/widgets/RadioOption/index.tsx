import React, { forwardRef } from 'react';
import clsx from 'clsx';
import LabelBase from '../Label/Base';
import RadioInput from '../RadioInput';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import type { OptionProps } from '../Option';

export interface RadioOptionProps extends OptionProps<HTMLLabelElement> {
  name?: string;
  onChange?: ChangeHandler<boolean, HTMLInputElement>;
  selected?: boolean;
}

const RadioOption = forwardRef<HTMLLabelElement, RadioOptionProps>(({
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
      aria-disabled={!!disabled}
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
      />
      <LabelBase>{children}</LabelBase>
    </label>
  );
});

RadioOption.displayName = 'RadioOption';

export default RadioOption;
