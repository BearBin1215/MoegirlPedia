import React, { useState } from 'react';
import classNames from 'classnames';
import Button from '../Button';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../utils/tool';
import type { FunctionComponent, ChangeEvent } from 'react';
import type { InputProps } from '../types/props';
import type { AccessKeyElement, IconElement, IndicatorElement, LabelElement } from '../types/mixin';
import type { LabelPosition } from '../types/utils';

export interface NumberInputProps extends
  InputProps<number | undefined>,
  AccessKeyElement,
  IconElement,
  IndicatorElement,
  LabelElement {

  /** 是否显示左右按钮 */
  showButtons?: boolean;

  /** 最小值 */
  min?: number;

  /** 最大值 */
  max?: number;

  /** 间距 */
  step?: number;

  /** 精度 */
  precision?: number;

  /** 标签位置 */
  labelPosition?: LabelPosition;

  /** 是否只读 */
  readOnly?: boolean;
}

/** 数字输入框 */
const NumberInput: FunctionComponent<NumberInputProps> = ({
  name,
  accessKey,
  className,
  defaultValue,
  disabled,
  onChange,
  icon,
  indicator,
  label,
  labelPosition = 'after',
  min,
  max,
  placeholder,
  precision,
  readOnly,
  required,
  showButtons,
  step = 1,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);

  const classes = classNames(
    className,
    processClassNames({ disabled, icon, indicator, label }, 'input', 'textInput', 'numberInput'),
    label && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-number',
    showButtons && 'oo-ui-numberInputWidget-buttoned',
  );

  /** 值变更响应 */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = +event.target.value;
    setValue(newValue);
    if (typeof onChange === 'function') {
      onChange({
        value: newValue,
        oldValue: value,
        event,
      });
    }
  };

  /** 点击-按钮按照step减少 */
  const handleMinus = () => {
    setValue((value || 0) - step);
  };

  /** 点击+按钮按照step增加 */
  const handlePlus = () => {
    setValue((value || 0) + step);
  };

  /** 失焦时，按照精度四舍五入 */
  const handleBlur = () => {
    if (precision) {
      setValue(parseFloat((value || 0).toFixed(precision)));
    }
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
    >
      <IconBase icon={icon} />
      <IndicatorBase indicator={indicator} />
      <div className='oo-ui-numberInputWidget-field'>
        {showButtons && (
          <Button
            className='oo-ui-numberInputWidget-minusButton'
            icon='subtract'
            onClick={handleMinus}
          />
        )}
        <input
          accessKey={accessKey}
          type='number'
          name={name}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={!!disabled}
          className='oo-ui-inputWidget-input'
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {showButtons && (
          <Button
            className='oo-ui-numberInputWidget-plusButton'
            icon='add'
            onClick={handlePlus}
          />
        )}
      </div>
      {label && <LabelBase>{label}</LabelBase>}
    </div>
  );
};

export default NumberInput;
