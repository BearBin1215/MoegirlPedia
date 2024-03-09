import React, { useState } from 'react';
import classNames from 'classnames';
import type { FunctionComponent, ChangeEvent, Ref } from 'react';
import type { InputChangeValue } from '../utils';
import type { WidgetProps } from '../props';
import type { AccessKeyElement } from '../mixin';

export interface InputWidgetProps<T extends string | number | boolean | undefined> extends
  Omit<WidgetProps<HTMLInputElement>, 'children' | 'ref'>,
  AccessKeyElement {

  /** input元素name属性 */
  name?: string;

  /** 输入提示 */
  placeholder?: string;

  /** 默认值 */
  defaultValue?: T;

  /** 值变化回调函数 */
  onChange?: (data: InputChangeValue<T>) => void;

  ref?: Ref<HTMLDivElement>;
}

const InputWidget: FunctionComponent<InputWidgetProps<string | number>> = ({
  accessKey,
  name,
  classes,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);

  const className = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-inputWidget',
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
      className={className}
      aria-disabled={false}
    >
      <input
        accessKey={accessKey}
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        disabled={disabled}
        value={value}
        placeholder={placeholder}
      />
    </div>
  );
};

export default InputWidget;
