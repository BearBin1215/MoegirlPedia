import React, { useState } from 'react';
import classNames from 'classnames';
import ButtonWidget from '../Button';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import type { FunctionComponent, ChangeEvent } from 'react';
import type { InputProps } from '../props';
import type { AccessKeyElement, IconElement, IndicatorElement, LabelElement } from '../mixin';
import type { LabelPosition } from '../utils';

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
}

/** 数字输入框 */
const NumberInput: FunctionComponent<NumberInputProps> = ({
  name,
  accessKey,
  classes,
  defaultValue,
  disabled,
  onChange,
  placeholder,
  icon,
  indicator,
  label,
  labelPosition,
  showButtons,
  min,
  max,
  step = 1,
  precision,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue);

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
      className={className}
      aria-disabled={false}
    >
      <IconBase icon={icon} />
      <IndicatorBase indicator={indicator} />
      <div className='oo-ui-numberInputWidget-field'>
        {showButtons && (
          <ButtonWidget
            classes={['oo-ui-numberInputWidget-minusButton']}
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
          value={value}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {showButtons && (
          <ButtonWidget
            classes={['oo-ui-numberInputWidget-plusButton']}
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
