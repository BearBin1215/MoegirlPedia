import React, {
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from 'oojs-ui-react/utils/tool';
import type { ChangeHandler } from '../../../types/utils';
import Widge, { type WidgetProps } from '../Widget';
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
  disabled,
  onChange,
  placeholder,
  required,
  value,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input'),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (typeof onChange === 'function') {
      onChange({
        value: newValue,
        oldValue: value,
        event,
      });
    }
  };

  return (
    <Widge
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
        value={value}
        placeholder={placeholder}
      />
    </Widge>
  );
});

Input.displayName = 'Input';

export default Input;
