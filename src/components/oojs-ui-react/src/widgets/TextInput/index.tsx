import React, {
  useRef,
  useMemo,
  forwardRef,
  type ChangeEvent,
  type MouseEventHandler,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase, type IndicatorBaseProps, type Indicators } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { flaggedElementClasses, getWidgetClassName, hasLabel, mergeInvalidFlag, resolveTabIndex, toFlagArray } from '../../utils';
import { useControlledValue, useFieldInputId, useLabelPadding, useMergedRefs, useValidityFlag } from '../../hooks';
import type { InputProps } from '../Input';
import type { LabelElement, LabelPosition } from '../Label';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';
import type { FlaggedElement } from '../../utils';

/** type prop的合法值：原版getValidType白名单并入'search'——原版该类型经SearchInputWidget子类
 * 覆写getValidType绕过白名单实现，React版为免组合层另开口子而统一放行 */
const VALID_INPUT_TYPES = ['text', 'password', 'email', 'url', 'number', 'search'];

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
   * 输入元素type（对齐原版config.type）：input的type属性与根元素`oo-ui-textInputWidget-type-{type}`
   * 类共用；白名单为原版getValidType并入'search'，非法值回退'text'
   * @default 'text'
   */
  type?: string;

  /**
   * 指示器元素附加属性（透传至指示器span），对应原版$indicator上的事件绑定能力；
   * SearchInput经此挂清除交互。注意指示器的mousedown聚焦为内置行为，此处的onMouseDown
   * 会在其之后补充调用
   */
  indicatorProps?: Omit<IndicatorBaseProps, 'indicator'>;

  /**
   * 指示器槽位覆写（SearchInput内部通道，勿在组件外使用）：非undefined时完全接管指示器
   * 槽位，null=明确无（抑制required缺省回退）——对齐原版SearchInputWidget构造后经
   * updateSearchIndicator调setIndicator(null)盖掉RequiredElement缺省的覆写能力
   */
  indicatorOverride?: Indicators | null;

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
  type = 'text',
  indicatorProps,
  indicatorOverride,
  icon,
  indicator,
  label,
  labelPosition = 'after',
  readOnly,
  validate,
  flags,
  inputRef,
  required,
  // tabIndex落在input上（组件根为不可聚焦的div）；title/dir对齐原版InputWidget的落点
  // （TitledElement的$titled与setDir均为$input），同样不放外层div
  tabIndex,
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
  // FieldLayout标签联动（通道A）：input认领字段id与label的htmlFor原生关联
  const fieldInputId = useFieldInputId();
  // 软校验反馈（对齐原版setValidityFlag）：非法时输入元素aria-invalid + 根元素invalid标志类
  const validateFn = useMemo(() => resolveValidate(validate), [validate]);
  const { invalid, handleBlur, handleFocus } = useValidityFlag({
    inputRef: internalInputRef,
    value: currentValue,
    validate: validateFn,
  });
  // type白名单校验（对齐原版getValidType）
  const validType = VALID_INPUT_TYPES.includes(type) ? type : 'text';
  // 指示器解析（对齐原版构造期语义）：indicatorOverride非undefined时完全接管
  // （SearchInput内部通道）；否则indicator falsy（未指定）时回退required缺省——
  // 原版config无法表达"显式无"，falsy指示器+required同样显示required指示器
  const resolvedIndicator = indicatorOverride !== undefined
    ? indicatorOverride
    : indicator || (required ? 'required' : undefined);

  /** 对齐原版onIconMouseDown/onIndicatorMouseDown：左键点击图标/指示器聚焦输入框（preventDefault阻止焦点转移后显式聚焦） */
  const handleDecorationMouseDown: MouseEventHandler = (e) => {
    if (e.button === 0) {
      e.preventDefault();
      internalInputRef.current?.focus();
    }
  };

  const classes = clsx(
    className,
    getWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    `oo-ui-textInputWidget-type-${validType}`,
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
        id={fieldInputId}
        accessKey={accessKey}
        type={validType}
        name={name}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        tabIndex={resolveTabIndex(tabIndex, disabled)}
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
      <IconBase icon={icon} onMouseDown={handleDecorationMouseDown} />
      <IndicatorBase
        indicator={resolvedIndicator ?? undefined}
        {...indicatorProps}
        onMouseDown={(event) => {
          handleDecorationMouseDown(event);
          indicatorProps?.onMouseDown?.(event);
        }}
      />
      {hasLabel(label) && <LabelBase ref={labelRef}>{label}</LabelBase>}
    </div>
  );
});

TextInput.displayName = 'TextInput';

