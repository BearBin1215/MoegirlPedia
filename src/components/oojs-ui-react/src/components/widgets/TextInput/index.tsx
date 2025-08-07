import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName } from '../../../utils/tool';
import type { InputProps } from '../Input';
import type { LabelElement, IconElement, IndicatorElement } from '../../../types/mixin';
import type { LabelPosition } from '../../../types/utils';

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
 * @returns
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
  ...rest
}, ref) => {
  const [inputStyle, setInputStype] = useState<CSSProperties>({});
  const labelRef = useRef<HTMLSpanElement>(null);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput'),
    (label !== null && label !== void 0 && label !== false) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
  );

  /** 值变更响应 */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (typeof onChange === 'function') {
      onChange({
        value: newValue,
        oldValue: value,
        event,
      });
    }
  };

  // input的内边距是用内联样式控制的，要根据label判定
  // 在第一次渲染完成后用useEffect检测labelRef才不会为空，label发生变化后重新计算
  useEffect(() => {
    const style: CSSProperties = {};
    if (labelRef.current) {
      const paddingWidth = `${labelRef.current.offsetWidth + 2}px`;
      if (labelPosition === 'before') {
        style.paddingLeft = paddingWidth;
      } else {
        style.paddingRight = paddingWidth;
      }
    }
    setInputStype(style);
  }, [label]);

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
        readOnly={readOnly}
        required={required}
        aria-required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        style={inputStyle}
      />
      <IconBase icon={icon} />
      <IndicatorBase indicator={indicator || (required ? 'required' : undefined)} />
      {(label !== null && label !== void 0 && label !== false) && <LabelBase ref={labelRef}>{label}</LabelBase>}
    </div>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
