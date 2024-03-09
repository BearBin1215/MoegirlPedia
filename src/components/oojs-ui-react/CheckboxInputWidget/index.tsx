import React, { useState } from 'react';
import classNames from 'classnames';
import IconWidget from '../IconWidget';
import type { Ref, FunctionComponent, ChangeEvent } from 'react';
import type { InputWidgetProps } from '../props';
import type { AccessKeyElement } from '../mixin';

export interface CheckBoxInputWidgetProps extends
  Omit<InputWidgetProps<boolean>, 'placeholder' | 'ref'>,
  AccessKeyElement {

  ref: Ref<HTMLSpanElement>;
}

const CheckBoxInputWidget: FunctionComponent<CheckBoxInputWidgetProps> = ({
  name,
  accessKey,
  classes,
  defaultValue = false,
  disabled,
  onChange,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);

  const widgetClassName = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-inputWidget',
    'oo-ui-checkboxInputWidget',
  );

  /** 值变更响应 */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.checked;
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
    <span
      {...rest}
      className={widgetClassName}
      aria-disabled={disabled}
    >
      <input
        name={name}
        type='checkbox'
        tabIndex={disabled ? -1 : 0}
        accessKey={accessKey}
        aria-disabled={disabled}
        className='oo-ui-inputWidget-input'
        checked={value}
        disabled={disabled}
        onChange={handleChange}
      />
      <IconWidget
        icon='check'
        classes={[
          'oo-ui-labelElement-invisible',
          'oo-ui-image-invert',
        ]}
      />
    </span>
  );
};

export default CheckBoxInputWidget;
