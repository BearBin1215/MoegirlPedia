import React, {
  useEffect,
  useRef,
  forwardRef,
  type ChangeEvent,
  type KeyboardEventHandler,
} from 'react';
import clsx from 'clsx';
import { clamp } from 'es-toolkit';
import { Button } from '../Button';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { flaggedElementClasses, getWidgetClassName, hasLabel, mergeInvalidFlag, toFlagArray, type AccessKeyedElement, type FlaggedElement } from '../../utils';
import { useControlledValue, useValidityFlag } from '../../hooks';
import type { InputProps } from '../Input';
import type { LabelElement, LabelPosition } from '../Label';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';

/** 数字输入框属性。值为`number`，空值（清空或键入非数字）为`''` */
export interface NumberInputProps extends
  InputProps<number | '', HTMLInputElement, HTMLDivElement>,
  AccessKeyedElement,
  IconElement,
  IndicatorElement,
  LabelElement,
  FlaggedElement {

  /** 是否显示左右按钮 */
  showButtons?: boolean;

  /** 最小值 */
  min?: number;

  /** 最大值 */
  max?: number;

  /** 合法性步距，值需为其倍数；缺省不限制（对齐原版无step配置时输入任意数值，attr输出'any'） */
  step?: number;

  /** 是否仅允许整数（原版已废弃的兼容配置，等价于强制step=1；isInteger为其别名，同样支持） */
  allowInteger?: boolean;

  /** allowInteger的别名 */
  isInteger?: boolean;

  /** 点击按钮或按上下方向键时的步距，默认为step */
  buttonStep?: number;

  /** 按PageUp/PageDown时的步距，默认为buttonStep×10 */
  pageStep?: number;

  /** 标签位置 */
  labelPosition?: LabelPosition;

  /** 是否只读 */
  readOnly?: boolean;
}

/** 数字输入框 */
export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(({
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
  readOnly,
  required,
  showButtons = true,
  step: stepProp,
  allowInteger,
  isInteger,
  buttonStep: buttonStepProp,
  pageStep: pageStepProp,
  flags,
  value: controlledValue,
  defaultValue,
  ...rest
}, ref) => {
  // 对齐原版构造逻辑：allowInteger/isInteger为废弃兼容配置，置位时强制step=1（覆盖显式传入值）；
  // buttonStep缺省取step（无step时1）、pageStep缺省取buttonStep×10（原版setStep：buttonStep=step||1，pageStep=10*buttonStep）
  const step = allowInteger || isInteger ? 1 : stepProp;
  const buttonStep = buttonStepProp ?? (step ?? 1);
  const pageStep = pageStepProp ?? buttonStep * 10;
  const { value: currentValue, commit } = useControlledValue<number | '', ChangeEvent<HTMLInputElement>>(
    { value: controlledValue, defaultValue: defaultValue ?? '' },
    onChange,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  /** 展示值：空值/非数字时显示为空 */
  const displayValue = typeof currentValue === 'number' && !Number.isNaN(currentValue) ? currentValue : '';

  /** 当前值的数值形态，空值为NaN */
  const getNumericValue = () => (currentValue === '' ? NaN : currentValue);

  /**
   * 数值合法性判定（对齐原版validateNumber）：空值看required，非有限值/非step倍数/超出
   * [min,max]均非法。作为软校验的判定函数，不改写值
   */
  const validateNumber = (value: number | '') => {
    if (value === '') {
      return !required;
    }
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return false;
    }
    if (step !== undefined && Math.floor(value / step) !== value / step) {
      return false;
    }
    return (min === undefined || value >= min) && (max === undefined || value <= max);
  };

  // 软校验反馈（对齐原版TextInputWidget.setValidityFlag，NumberInput经setValidation接入validateNumber）
  const { invalid, handleBlur, handleFocus, revalidate } = useValidityFlag({
    inputRef,
    value: currentValue,
    validate: validateNumber,
  });
  // 约束配置变化立即重校验（对齐原版setRange/setStep的setValidityFlag；挂载期同样校验一次，
  // 复现原版构造期行为：空值+required在加载时即输出非法标记）
  useEffect(() => {
    revalidate();
  }, [min, max, step, required, revalidate]);

  /** 调整数值，对齐原版adjustValue：空值从0起步，非空钳制到[min,max]并按step取整 */
  const adjustValue = (delta: number) => {
    const v = getNumericValue();
    let n: number;
    if (isNaN(v)) {
      n = 0;
    } else {
      n = clamp(v + delta, min ?? -Infinity, max ?? Infinity);
      n = step ? Math.round(n / step) * step : n;
    }
    if (n !== v) {
      commit(n);
    }
  };

  // 滚轮步进，对齐原版onWheel：聚焦时按buttonStep调整并阻止页面滚动。
  // React合成wheel事件是passive的无法preventDefault，需挂原生监听；
  // 不设依赖数组，保证每轮渲染闭包为最新（随currentValue/buttonStep更新）。
  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const handleWheel = (ev: WheelEvent) => {
      if (disabled || readOnly) {
        return;
      }
      // 对齐原版onWheel：deltaY为0时回退取deltaX（横向滚轮/触摸板横滑）
      const delta = ev.deltaY ? -ev.deltaY : ev.deltaX;
      if (!delta) {
        return;
      }
      // 对齐原版onWheel前置条件（$input.is(':focus')）：仅聚焦时步进并阻止页面滚动，
      // 悬停未聚焦时不拦截，避免滚动页面误改数值
      if (document.activeElement !== input) {
        return;
      }
      ev.preventDefault();
      adjustValue(delta < 0 ? -buttonStep : buttonStep);
    };
    input.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      input.removeEventListener('wheel', handleWheel);
    };
  });

  const classes = clsx(
    className,
    getWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput', 'numberInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-number',
    showButtons && 'oo-ui-numberInputWidget-buttoned',
    flaggedElementClasses(mergeInvalidFlag(toFlagArray(flags), invalid)),
  );

  /** 值变更，对齐原版语义：保留输入不做钳制，空串保持为空 */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const parsed = +raw;
    const newValue = raw === '' || Number.isNaN(parsed) ? '' : parsed;
    commit(newValue, event);
  };

  /** 方向键/PageUp/Down步进 */
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
    if (disabled || readOnly) {
      return;
    }
    switch (ev.key) {
      case 'ArrowUp':
        ev.preventDefault();
        adjustValue(buttonStep);
        break;
      case 'ArrowDown':
        ev.preventDefault();
        adjustValue(-buttonStep);
        break;
      case 'PageUp':
        ev.preventDefault();
        adjustValue(pageStep);
        break;
      case 'PageDown':
        ev.preventDefault();
        adjustValue(-pageStep);
        break;
    }
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      <IconBase icon={icon} />
      {/* required指示器回退对齐原版RequiredElement：未显式声明indicator时输出required */}
      <IndicatorBase indicator={indicator || (required ? 'required' : undefined)} />
      <div className='oo-ui-numberInputWidget-field'>
        {showButtons && (
          <Button
            className='oo-ui-numberInputWidget-minusButton'
            icon='subtract'
            aria-hidden
            tabIndex={-1}
            disabled={disabled || readOnly}
            onClick={() => adjustValue(-buttonStep)}
          />
        )}
        <input
          accessKey={accessKey}
          type='number'
          name={name}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled || undefined}
          aria-invalid={invalid || undefined}
          className='oo-ui-inputWidget-input'
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-required={required}
          value={displayValue}
          placeholder={placeholder}
          min={min}
          max={max}
          // step缺省'any'（不限制小数），对齐原版setStep的attr输出
          step={step ?? 'any'}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          ref={inputRef}
        />
        {showButtons && (
          <Button
            className='oo-ui-numberInputWidget-plusButton'
            icon='add'
            aria-hidden
            tabIndex={-1}
            disabled={disabled || readOnly}
            onClick={() => adjustValue(buttonStep)}
          />
        )}
      </div>
      {hasLabel(label) && <LabelBase>{label}</LabelBase>}
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

