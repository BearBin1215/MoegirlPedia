import React, { useState } from 'react';
import classNames from 'classnames';
import { processClassNames } from '../utils/tool';
import type { FunctionComponent, ChangeEvent, Ref } from 'react';
import type { ChangeHandler } from '../types/utils';
import type { WidgetProps } from '../types/props';
import type { AccessKeyElement } from '../types/mixin';

export interface InputProps<T extends string | number | boolean | undefined> extends
  Omit<WidgetProps<HTMLInputElement>, 'children' | 'ref'>,
  AccessKeyElement {

  /** input元素name属性 */
  name?: string;

  /** 输入提示 */
  placeholder?: string;

  /** 默认值 */
  defaultValue?: T;

  /** 值变化回调函数 */
  onChange?: ChangeHandler<T, HTMLInputElement>;

  ref?: Ref<HTMLDivElement>;

  /** 是否必填 */
  required?: boolean;
}

const Input: FunctionComponent<InputProps<string | number>> = ({
  accessKey,
  name,
  className,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  required,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);

  const classes = classNames(
    className,
    processClassNames({ disabled }, 'input'),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (typeof onChange === 'function') {
      onChange({
        value: newValue,
        oldValue: value,
        event,
      });
    }
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
    >
      <input
        accessKey={accessKey}
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        disabled={disabled}
        required={required}
        value={value}
        placeholder={placeholder}
      />
    </div>
  );
};

export default Input;
