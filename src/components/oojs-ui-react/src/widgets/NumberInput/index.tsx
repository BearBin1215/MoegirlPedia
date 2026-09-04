import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type ChangeEvent,
  type KeyboardEventHandler,
} from 'react';
import clsx from 'clsx';
import Button from '../Button';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName, type AccessKeyedElement } from '../../utils';
import type { InputProps } from '../Input';
import type { LabelElement, LabelPosition } from '../Label';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';

/** 数字输入框属性。值为`number`，空值（清空或键入非数字）为`''`，对齐原版`getValue`语义 */
export interface NumberInputProps extends
  InputProps<number | '', HTMLInputElement, HTMLDivElement>,
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

  /** 合法性步距，值需为其倍数 */
  step?: number;

  /** 点击按钮或按上下方向键时的步距，默认为step */
  buttonStep?: number;

  /** 按PageUp/PageDown时的步距，默认为buttonStep×10 */
  pageStep?: number;

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
  buttonStep = step,
  pageStep = buttonStep * 10,
  value: controlledValue,
  defaultValue,
  ...rest
}, ref) => {
  const isControlled = controlledValue !== undefined;
  const [innerValue, setInnerValue] = useState<number | ''>(defaultValue ?? '');
  const currentValue = isControlled ? controlledValue : innerValue;
  const inputRef = useRef<HTMLInputElement>(null);
  /** 展示值：空值/非数字时显示为空 */
  const displayValue = typeof currentValue === 'number' && !Number.isNaN(currentValue) ? currentValue : '';

  /** 当前值的数值形态，空值为NaN，对齐原版getNumericValue */
  const getNumericValue = () => (currentValue === '' ? NaN : currentValue);

  /** 提交新值并触发onChange（非受控时同步内部state） */
  const commit = (newValue: number | '', event?: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInnerValue(newValue);
    }
    onChange?.(newValue, event);
  };

  /** 调整数值，对齐原版adjustValue：空值从0起步，非空钳制到[min,max]并按step取整 */
  const adjustValue = (delta: number) => {
    const v = getNumericValue();
    let n: number;
    if (isNaN(v)) {
      n = 0;
    } else {
      n = Math.max(Math.min(v + delta, max ?? Infinity), min ?? -Infinity);
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
      if (disabled || readOnly || !ev.deltaY) {
        return;
      }
      ev.preventDefault();
      adjustValue(ev.deltaY < 0 ? buttonStep : -buttonStep);
    };
    input.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      input.removeEventListener('wheel', handleWheel);
    };
  });

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput', 'numberInput'),
    (label !== null && label !== void 0 && label !== false) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-number',
    showButtons && 'oo-ui-numberInputWidget-buttoned',
  );

  /** 值变更响应，对齐原版语义：保留输入不做钓制，空串保持为空 */
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const parsed = +raw;
    const newValue = raw === '' || Number.isNaN(parsed) ? '' : parsed;
    commit(newValue, event);
  };

  /** 失焦时，按照精度四舍五入 */
  const handleBlur = () => {
    const v = getNumericValue();
    if (typeof precision === 'number' && !Number.isNaN(v)) {
      const rounded = Math.round(v * 10 ** precision) / 10 ** precision;
      if (rounded !== v) {
        commit(rounded);
      }
    }
  };

  /** 方向键/PageUp/Down步进，对齐原版onKeyDown */
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
          aria-disabled={!!disabled}
          className='oo-ui-inputWidget-input'
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-required={required}
          value={displayValue}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
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
      {(label !== null && label !== void 0 && label !== false) && <LabelBase>{label}</LabelBase>}
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;
