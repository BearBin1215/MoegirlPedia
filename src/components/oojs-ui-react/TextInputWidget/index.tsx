import React, { useState } from 'react';
import classNames from 'classnames';
import type { FunctionComponent, ChangeEvent } from 'react';
import type { InputWidgetProps } from '../props';
import type { LabelElement, IconElement, IndicatorElement } from '../mixin';
import type { LabelPosition } from '../utils';

export interface TextInputWidgetProps extends
  InputWidgetProps<string | undefined>,
  LabelElement,
  IconElement,
  IndicatorElement {

  /** 最大长度 */
  maxLength?: number;

  /** 标签位置 */
  labelPosition?: LabelPosition;
}

/**
 * 文本输入框
 * @returns
 */
const TextInputWidget: FunctionComponent<TextInputWidgetProps> = ({
  name,
  classes,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  maxLength,
  icon,
  indicator,
  label,
  labelPosition,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue || '');

  const className = classNames(
    classes,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    'oo-ui-inputWidget',
    icon && 'oo-ui-iconElement',
    indicator && 'oo-ui-indicatorElement',
    label && [
      'oo-ui-labelElement',
      labelPosition === 'before'
        ? 'oo-ui-textInputWidget-labelPosition-before'
        : 'oo-ui-textInputWidget-labelPosition-after',
    ],
    'oo-ui-textInputWidget',
    'oo-ui-textInputWidget-type-text',
  );

  /** 左侧图标类 */
  const iconClassName = classNames(
    'oo-ui-iconElement-icon',
    icon && `oo-ui-icon-${icon}`,
  );

  /** 右侧指示器类 */
  const indicatorClassName = classNames(
    'oo-ui-indicatorElement-indicator',
    indicator && `oo-ui-indicator-${indicator}`,
  );

  /** 值变更响应 */
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
        type='text'
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      <span className={iconClassName} />
      <span className={indicatorClassName} />
      {label && (
        <span className='oo-ui-labelElement-label'>{label}</span>
      )}
    </div>
  );
};

export default TextInputWidget;
