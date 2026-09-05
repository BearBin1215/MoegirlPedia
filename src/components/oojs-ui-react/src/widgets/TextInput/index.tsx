import React, {
  useRef,
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName, hasLabel } from '../../utils';
import { useLabelPadding } from '../../hooks';
import type { InputProps } from '../Input';
import type { LabelElement, LabelPosition } from '../Label';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';

export interface TextInputProps<T = HTMLInputElement, P = HTMLDivElement> extends
  InputProps<string, T, P>,
  LabelElement,
  IconElement,
  IndicatorElement {

  /** 最大长度 */
  maxLength?: number;

  /**
   * 标签位置
   * @default 'after'
   */
  labelPosition?: LabelPosition;

  /** 是否只读 */
  readOnly?: boolean;
}

/**
 * 文本输入框
 */
const TextInput = forwardRef<HTMLDivElement, TextInputProps>(({
  accessKey,
  name,
  className,
  disabled,
  onChange,
  placeholder,
  maxLength,
  icon,
  indicator,
  label,
  labelPosition = 'after',
  readOnly,
  required,
  value,
  defaultValue,
  ...rest
}, ref) => {
  const labelRef = useRef<HTMLSpanElement>(null);
  const inputStyle = useLabelPadding(labelRef, label, labelPosition);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value, event);
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={ref}
    >
      <input
        accessKey={accessKey}
        type='text'
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className='oo-ui-inputWidget-input'
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        readOnly={readOnly}
        required={required}
        aria-required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        style={inputStyle}
      />
      <IconBase icon={icon} />
      <IndicatorBase indicator={indicator || (required ? 'required' : undefined)} />
      {hasLabel(label) && <LabelBase ref={labelRef}>{label}</LabelBase>}
    </div>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
