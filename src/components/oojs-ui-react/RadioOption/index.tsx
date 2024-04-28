import React from 'react';
import classNames from 'classnames';
import LabelBase from '../Label/Base';
import RadioInput from '../RadioInput';
import { processClassNames } from '../utils/tool';
import type { FunctionComponent, MouseEventHandler, RefObject } from 'react';
import type { ChangeHandler } from '../types/utils';
import type { OptionProps } from '../types/props';

export interface RadioOptionProps extends Omit<OptionProps, 'onClick' | 'selected'> {
  onClick?: MouseEventHandler<HTMLLabelElement>;
  name?: string;
  onChange?: ChangeHandler<boolean, HTMLInputElement>;
  selected?: boolean;
  ref?: RefObject<HTMLLabelElement>;
  data: number | string;
}

const RadioOption: FunctionComponent<RadioOptionProps> = ({
  accessKey,
  className,
  disabled,
  children,
  name,
  onChange,
  selected,
  ...rest
}) => {
  const classes = classNames(
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
      onSelect={(e) => console.log(e)}
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
};

export default RadioOption;
