import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import LabelBase from '../Label/Base';
import RadioInput from '../RadioInput';
import { processClassNames } from '../../../utils/tool';
import type { MouseEventHandler } from 'react';
import type { ChangeHandler } from '../../../types/utils';
import type { OptionProps } from '../../../types/props';
import type { ElementRef } from '../../../types/ref';

export interface RadioOptionProps extends Omit<OptionProps<HTMLLabelElement>, 'onClick'> {
  onClick?: MouseEventHandler<HTMLLabelElement>;
  name?: string;
  onChange?: ChangeHandler<boolean, HTMLInputElement>;
  selected?: boolean;
  data: number | string | boolean;
}

const RadioOption = forwardRef<ElementRef<HTMLLabelElement>, RadioOptionProps>(({
  accessKey,
  className,
  disabled,
  children,
  name,
  onChange,
  selected,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLLabelElement>(null);

  const classes = classNames(
    className,
    processClassNames({ disabled, label: children }, 'option', 'radioOption'),
    selected && 'oo-ui-optionWidget-selected',
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }), []);

  return (
    <label
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='radio'
      aria-checked={!!selected}
      ref={elementRef}
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
