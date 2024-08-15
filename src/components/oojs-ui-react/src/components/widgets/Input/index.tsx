import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  type ChangeEvent,
} from 'react';
import classNames from 'classnames';
import { processClassNames } from '../../../utils/tool';
import type { ChangeHandler } from '../../../types/utils';
import type { WidgetProps } from '../../../types/props';
import type { AccessKeyElement } from '../../../types/mixin';
import type { InputWidgetRef } from '../../../types/ref';

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

const Input = forwardRef<InputWidgetRef<HTMLDivElement>, InputProps<string | number>>(({
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
  const elementRef = useRef<HTMLDivElement>(null);

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

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
    getValue: () => value,
    setValue,
  }));

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={elementRef}
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
