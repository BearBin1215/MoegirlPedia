import React from 'react';
import classNames from 'classnames';
import LabelBase from '../Label/Base';
import RadioInput from '../RadioInput';
import { processClassNames } from '../utils/tool';
import type { FunctionComponent, MouseEventHandler } from 'react';
import type { OptionProps } from '../types/props';

export interface RadioOptionProps extends Omit<OptionProps, 'onClick' | 'selected'> {
  onClick?: MouseEventHandler<HTMLLabelElement>
}

const RadioOption: FunctionComponent<RadioOptionProps> = ({
  accessKey,
  className,
  disabled,
  children,
  ...rest
}) => {
  const optionClassName = classNames(
    className,
    processClassNames({ disabled, label: children }, 'option', 'radioOption'),
  );

  return (
    <label
      {...rest}
      className={optionClassName}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='radio'
      aria-checked={false}
    >
      <RadioInput
        accessKey={accessKey}
        disabled={disabled}
      />
      <LabelBase>{children}</LabelBase>
    </label>
  );
};

export default RadioOption;
