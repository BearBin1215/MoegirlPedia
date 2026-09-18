import React, {
  useRef,
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { flaggedElementClasses, getWidgetClassName, hasLabel, mergeInvalidFlag, toFlagArray } from '../../mixins';
import { useControlledValue, useMergedRefs } from '../../hooks';
import { useAutosize, useScrollbarOffset } from '../Input/autosize';
import { useInputProps } from '../Input/props';
import { resolveValidate, type TextInputProps } from '../TextInput';

export interface MultilineTextInputProps extends TextInputProps<HTMLTextAreaElement> {
  /** 最小行数 */
  rows?: number;

  /** 最大行数 */
  maxRows?: number;

  /** 是否自动高度 */
  autosize?: boolean;
}

/** 缺省maxRows：2×rows与10取大（对齐原版autosize缺省规则） */
const getDefaultMaxRows = (rows?: number) => Math.max(2 * (rows || 0), 10);

/**
 * 多行文本输入框，对齐原版OO.ui.MultilineTextInputWidget（继承TextInputWidget，
 * 故标签/图标/指示器/软校验等能力与TextInput同源，经由useInputProps共享派生）。
 * autosize时经一份不可见的同源克隆textarea测量内容高度与maxRows高度并回写真实输入框
 * （测量算法见useAutosize）；出现垂直滚动条时按滚动条宽度给指示器与后置标签让位，
 * 并把该宽度计入输入框标签同侧的内边距（对齐原版adjustSize的scrollWidth分支与
 * positionLabel，见useScrollbarOffset与useInputProps的scrollbarWidth）
 */
export const MultilineTextInput = forwardRef<HTMLDivElement, MultilineTextInputProps>(({
  accessKey,
  name,
  className,
  disabled,
  onChange,
  placeholder,
  maxLength,
  icon,
  indicator,
  indicatorProps,
  indicatorOverride,
  label,
  invisibleLabel,
  labelPosition = 'after',
  readOnly,
  required,
  // tabIndex落在textarea上（组件根为不可聚焦的div）
  tabIndex,
  validate,
  flags,
  autosize,
  rows,
  maxRows: maxRowsProp,
  // title/dir对齐原版InputWidget的落点（TitledElement的$titled与setDir均为$input），不放外层div
  title,
  dir,
  value,
  defaultValue,
  // inputRef透传到内部textarea，inputProps为原生textarea的附加属性通道
  inputRef: inputRefProp,
  inputProps,
  ...rest
}: MultilineTextInputProps, ref) => {
  const maxRows = maxRowsProp ?? getDefaultMaxRows(rows);
  const labelRef = useRef<HTMLSpanElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);
  const setTextareaRef = useMergedRefs(textareaRef, inputRefProp);
  // 根元素引用：标签让位的内边距落侧按根元素（样式表）方向解析（见useInputProps的rootRef）
  const internalRootRef = useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(ref, internalRootRef);
  // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
  const { value: currentValue, commit } = useControlledValue<string, ChangeEvent<HTMLTextAreaElement>>(
    { value, defaultValue: defaultValue ?? '' },
    onChange,
  );
  // autosize高度：经state回到渲染流程，与标签让位的内边距共用同一处style
  const autosizeStyle = useAutosize({
    enabled: !!autosize,
    textareaRef,
    cloneRef: hiddenInputRef,
    rows,
    maxRows,
    value: currentValue,
  });
  // 滚动条让位：垂直滚动条出现时，指示器与后置标签按滚动条宽度偏移；滚动条宽度同时计入
  // 输入框标签同侧的内边距（对齐原版positionLabel，经useInputProps的scrollbarWidth并入）。
  // 多行恒启用——固定行数（非autosize）时同样会出现滚动条，原版该分支也在autosize判断之外
  const { scrollbarWidth, indicatorStyle, labelStyle } = useScrollbarOffset({
    inputRef: textareaRef,
    labelPosition,
  });
  // 输入元素的公共属性派生：属性落点、字段id、标签让位、指示器回退、装饰聚焦、软校验
  const {
    inputProps: commonInputProps,
    invalid,
    decorationProps,
    indicator: resolvedIndicator,
    indicatorProps: indicatorSlotProps,
  } = useInputProps<HTMLTextAreaElement, string>({
    inputRef: textareaRef,
    rootRef: internalRootRef,
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
    inputStyle: autosizeStyle,
    scrollbarWidth,
  });

  const classes = clsx(
    className,
    // 指示器类按解析后的取值判定（required 且未显式给 indicator 时回退为 required 指示器）
    getWidgetClassName({ disabled, icon, indicator: resolvedIndicator ?? undefined, label, invisibleLabel }, 'input', 'textInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
    flaggedElementClasses(mergeInvalidFlag(toFlagArray(flags), invalid)),
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={setRootRef}
    >
      <textarea
        ref={setTextareaRef}
        // 形态专属属性（rows/autosized类）与调用方的inputProps通道经useInputProps的合并规则并入
        {...commonInputProps({
          rows,
          className: autosize ? 'oo-ui-textInputWidget-autosized' : undefined,
        }, inputProps)}
      />
      {autosize && (
        // 测量用隐藏节点：不挂可聚焦属性（accessKey/tabIndex）与表单语义，避免主题CSS未就绪时进入tab序。
        // 盒模型与字体由 useAutosize 在每次测量前从真实输入框同步；调用方inputProps的类与行内样式
        // 可能携带影响排版的声明（如字体/字距），一并镜像保持测量同源（height由测量流程管理）
        <textarea
          className={clsx('oo-ui-inputWidget-input', 'oo-ui-element-hidden', inputProps?.className)}
          style={{ height: 'auto', ...inputProps?.style }}
          aria-hidden='true'
          rows={maxRows}
          ref={hiddenInputRef}
        />
      )}
      <IconBase icon={icon} {...decorationProps} />
      {/* 滚动条让位样式叠在槽位属性（含调用方indicatorProps.style）之后：让位是布局校正值 */}
      <IndicatorBase {...indicatorSlotProps} style={{ ...indicatorSlotProps.style, ...indicatorStyle }} />
      {hasLabel(label) && (
        <LabelBase ref={labelRef} invisible={invisibleLabel} style={labelStyle}>{label}</LabelBase>
      )}
    </div>
  );
});

MultilineTextInput.displayName = 'MultilineTextInput';
