import React, {
  forwardRef,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import LabelBase from '../Label/Base';
import RadioInput from '../RadioInput';
import { processClassNames } from '../../../utils/tool';
import type { ChangeHandler } from '../../../types/utils';
import type { OptionProps } from '../Option';

export interface RadioOptionProps extends Omit<OptionProps<HTMLLabelElement>, 'onClick'> {
  onClick?: MouseEventHandler<HTMLLabelElement>;
  name?: string;
  onChange?: ChangeHandler<boolean, HTMLInputElement>;
  selected?: boolean;
  data: number | string;
}

const RadioOption = forwardRef<HTMLLabelElement, RadioOptionProps>(({
  accessKey,
  className,
  disabled,
  children,
  name,
  onChange,
  selected,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    processClassNames({ disabled, label: children }, 'option', 'radioOption'),
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
        selected={selected}
      />
      <LabelBase>{children}</LabelBase>
    </label>
  );
});

RadioOption.displayName = 'RadioOption';

export default RadioOption;
