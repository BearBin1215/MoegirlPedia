import React, {
  useRef,
  forwardRef,
  type ChangeEvent,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { getWidgetClassName, hasLabel } from '../../utils';
import { useControlledValue, useLabelPadding } from '../../hooks';
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

  /** 获取内部输入元素引用（组件ref指向外层div，需要聚焦输入元素等场景使用；随泛型参数化为input/textarea元素类型） */
  inputRef?: Ref<T>;
}

/**
 * 文本输入框
 */
export const TextInput = forwardRef<HTMLDivElement, TextInputProps>(({
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
  inputRef,
  required,
  // title/dir对齐原版InputWidget的落点（TitledElement的$titled与setDir均为$input），不放外层div
  title,
  dir,
  value,
  defaultValue,
  ...rest
}, ref) => {
  const labelRef = useRef<HTMLSpanElement>(null);
  const inputStyle = useLabelPadding(labelRef, label, labelPosition);
  // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
  const { value: currentValue, commit } = useControlledValue<string, ChangeEvent<HTMLInputElement>>(
    { value, defaultValue: defaultValue ?? '' },
    onChange,
  );

  const classes = clsx(
    className,
    getWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit(event.target.value, event);
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      <input
        ref={inputRef}
        accessKey={accessKey}
        type='text'
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        className='oo-ui-inputWidget-input'
        disabled={disabled}
        value={currentValue}
        readOnly={readOnly}
        required={required}
        aria-required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        title={title}
        dir={dir}
        style={inputStyle}
      />
      <IconBase icon={icon} />
      <IndicatorBase indicator={indicator || (required ? 'required' : undefined)} />
      {hasLabel(label) && <LabelBase ref={labelRef}>{label}</LabelBase>}
    </div>
  );
});

TextInput.displayName = 'TextInput';

