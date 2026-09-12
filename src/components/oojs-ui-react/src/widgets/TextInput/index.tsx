import React, {
  useRef,
  useMemo,
  forwardRef,
  type ChangeEvent,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { flaggedElementClasses, getWidgetClassName, hasLabel, mergeInvalidFlag, toFlagArray } from '../../utils';
import { useControlledValue, useLabelPadding, useMergedRefs, useValidityFlag } from '../../hooks';
import type { InputProps } from '../Input';
import type { LabelElement, LabelPosition } from '../Label';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';
import type { FlaggedElement } from '../../utils';

/**
 * 合法性校验入参，对齐原版setValidation的三种形态：
 * 正则（test判定）、函数（返回布尔或Promise）、符号名（'non-empty'非空、'integer'纯数字）
 */
export type TextInputValidate =
  | RegExp
  | ((value: string) => boolean | Promise<boolean>)
  | 'non-empty'
  | 'integer';

export interface TextInputProps<T = HTMLInputElement, P = HTMLDivElement> extends
  InputProps<string, T, P>,
  LabelElement,
  IconElement,
  IndicatorElement,
  FlaggedElement {

  /** 最大长度 */
  maxLength?: number;

  /**
   * 标签位置
   * @default 'after'
   */
  labelPosition?: LabelPosition;

  /** 是否只读 */
  readOnly?: boolean;

  /**
   * 合法性校验（软反馈）：值不满足时输入元素输出`aria-invalid`、根元素输出invalid标志类，
   * 不改写值；缺省仅浏览器原生约束（required等）。触发时机：值变更（防抖）、失焦、聚焦清除
   */
  validate?: TextInputValidate;

  /** 获取内部输入元素引用（组件ref指向外层div，需要聚焦输入元素等场景使用；随泛型参数化为input/textarea元素类型） */
  inputRef?: Ref<T>;
}

/** 将validate入参归一化为校验函数（符号名对齐原版static.validationPatterns） */
export const resolveValidate = (validate: TextInputValidate | undefined) => {
  if (validate instanceof RegExp) {
    return (value: string) => validate.test(value);
  }
  if (typeof validate === 'function') {
    return validate;
  }
  if (validate === 'non-empty') {
    return (value: string) => /^./.test(value);
  }
  if (validate === 'integer') {
    return (value: string) => /^\d+$/.test(value);
  }
  return undefined;
};

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
  validate,
  flags,
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
  const internalInputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMergedRefs(inputRef, internalInputRef);
  // 软校验反馈（对齐原版setValidityFlag）：非法时输入元素aria-invalid + 根元素invalid标志类
  const validateFn = useMemo(() => resolveValidate(validate), [validate]);
  const { invalid, handleBlur, handleFocus } = useValidityFlag({
    inputRef: internalInputRef,
    value: currentValue,
    validate: validateFn,
  });
  const classes = clsx(
    className,
    getWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
    flaggedElementClasses(mergeInvalidFlag(toFlagArray(flags), invalid)),
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
        ref={setInputRef}
        accessKey={accessKey}
        type='text'
        name={name}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid || undefined}
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

