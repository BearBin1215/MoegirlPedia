import React, {
  useState,
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import { processClassNames } from '../../../utils/tool';
import type { ChangeHandler } from '../../../types/utils';
import type { WidgetProps } from '../Widget';
import type { AccessKeyElement } from '../../../types/mixin';

/**
 * @template T 输入值类型
 * @template P 输入框类型
 * @template S 组件最外层元素类型
 */
export interface InputProps<T extends string | number | boolean | undefined, P = HTMLInputElement, S = P> extends
  Omit<WidgetProps<S>, 'children'>,
  AccessKeyElement {

  /** input元素name属性 */
  name?: string;

  /** 输入提示 */
  placeholder?: string;

  /** 默认值 */
  defaultValue?: T;

  /** 值变化回调函数 */
  onChange?: ChangeHandler<T, P>;

  /** 是否必填 */
  required?: boolean;

  /** 输入框值（受控） */
  value?: T;
}

const Input = forwardRef<HTMLDivElement, InputProps<string | number, HTMLDivElement>>(({
  accessKey,
  name,
  className,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  required,
  value: controlledValue,
  ...rest
}, ref) => {
  const [value, setValue] = useState(defaultValue);

  const classes = clsx(
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
      ref={ref}
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
        value={controlledValue ?? value}
        placeholder={placeholder}
      />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
