import React, {
  useState,
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import Button from '../Button';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName } from '../../utils';
import type { AccessKeyedElement } from '../../mixins';
import type { InputProps } from '../Input';
import type { LabelElement, LabelPosition } from '../Label';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';

export interface NumberInputProps extends
  InputProps<number, HTMLDivElement>,
  AccessKeyedElement,
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
const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(({
  name,
  accessKey,
  className,
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
  value: controlledValue,
  ...rest
}, ref) => {
  const [value, setValue] = useState(controlledValue);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput', 'numberInput'),
    (label !== null && label !== void 0 && label !== false) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-number',
    showButtons && 'oo-ui-numberInputWidget-buttoned',
  );

  /** 值变更响应 */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = +event.target.value;
    setValue(newValue);
    if (typeof onChange === 'function') {
      onChange({
        value: (typeof min === 'number' && min > newValue) ? min : newValue,
        oldValue: value,
        event,
      });
    }
  };

  /** 点击-按钮按照step减少 */
  const handleMinus = () => {
    const newValue = (value || 0) - step;
    setValue(newValue);
    if (typeof onChange === 'function') {
      onChange({
        value: newValue,
        oldValue: value,
      });
    }
  };

  /** 点击+按钮按照step增加 */
  const handlePlus = () => {
    const newValue = (value || 0) + step;
    setValue(newValue);
    if (typeof onChange === 'function') {
      onChange({
        value: newValue,
        oldValue: value,
      });
    }
  };

  /** 失焦时，按照精度四舍五入 */
  const handleBlur = () => {
    if (typeof precision === 'number') {
      setValue(Math.round((value || 0) * 10 ** precision) / 10 ** precision);
    }
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={ref}
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
          aria-required={required}
          value={controlledValue ?? value}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={handleInputChange}
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
      {(label !== null && label !== void 0 && label !== false) && <LabelBase>{label}</LabelBase>}
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;
