import React, {
  useRef,
  forwardRef,
  type ChangeEvent,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase, type IndicatorBaseProps } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { flaggedElementClasses, getWidgetClassName, hasLabel, mergeInvalidFlag, toFlagArray } from '../../mixins';
import { useControlledValue, useMergedRefs } from '../../hooks';
import { useInputProps, type UserInputProps } from '../Input/props';
import type { InputProps } from '../Input';
import type { LabelPosition } from '../Label';
import type { FlaggedElement, IconElement, IndicatorElement, Indicators, LabelElement } from '../../Element';

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

  /**
   * 内部输入元素的附加属性。组件props的`...rest`落在根元素div上，需写到原生input上时经此通道
   * （如`role`/`aria-*`/`autoComplete`）。合并规则：非事件属性冲突时以本通道为准；
   * onChange/onBlur/onFocus串联在组件自身逻辑之后（值管线与软校验不会被截断）；
   * value/defaultValue由组件值管线管理，不在通道类型内
   */
  inputProps?: UserInputProps<T>;
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
  invisibleLabel,
  labelPosition = 'after',
  readOnly,
  validate,
  flags,
  inputRef,
  inputProps,
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
  // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
  const { value: currentValue, commit } = useControlledValue<string, ChangeEvent<HTMLInputElement>>(
    { value, defaultValue: defaultValue ?? '' },
    onChange,
  );
  const internalInputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMergedRefs(inputRef, internalInputRef);
  // 输入元素的公共属性派生：属性落点、字段id、标签让位、指示器回退、装饰聚焦、软校验
  const {
    inputProps: commonInputProps,
    invalid,
    decorationProps,
    indicator: resolvedIndicator,
    indicatorProps: indicatorSlotProps,
  } = useInputProps<HTMLInputElement, string>({
    inputRef: internalInputRef,
    value: currentValue,
    validate: resolveValidate(validate),
    disabled,
    tabIndex,
    accessKey,
    name,
    readOnly,
    required,
    placeholder,
    maxLength,
    title,
    invisibleLabel,
    dir,
    labelRef,
    label,
    labelPosition,
    indicator,
    indicatorOverride,
    indicatorProps,
    onCommitValue: (next, event) => commit(next, event),
  });
  // type白名单校验（对齐原版getValidType）
  const validType = VALID_INPUT_TYPES.includes(type) ? type : 'text';

  const classes = clsx(
    className,
    // 指示器类按解析后的取值判定：required 且未显式给 indicator 时回退为 required 指示器
    getWidgetClassName({ disabled, icon, indicator: resolvedIndicator ?? undefined, label, invisibleLabel }, 'input', 'textInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    `oo-ui-textInputWidget-type-${validType}`,
    flaggedElementClasses(mergeInvalidFlag(toFlagArray(flags), invalid)),
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      <input
        ref={setInputRef}
        // 形态专属属性（type）与调用方的inputProps通道经useInputProps的合并规则并入
        {...commonInputProps({ type: validType }, inputProps)}
      />
      <IconBase icon={icon} {...decorationProps} />
      <IndicatorBase {...indicatorSlotProps} />
      {hasLabel(label) && <LabelBase ref={labelRef} invisible={invisibleLabel}>{label}</LabelBase>}
    </div>
  );
});

TextInput.displayName = 'TextInput';

