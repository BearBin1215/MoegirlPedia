import React, {
  useEffect,
  useRef,
  forwardRef,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName, hasLabel } from '../../utils';
import { useControlledValue, useLabelPadding, useMergedRefs } from '../../hooks';
import type { TextInputProps } from '../TextInput';

export interface MultilineTextInputProps extends TextInputProps<HTMLTextAreaElement> {
  /** 行数 */
  rows?: number;

  /** 最大行数 */
  maxRows?: number;

  /** 是否自动高度 */
  autosize?: boolean;
}

/** 缺省maxRows：2×rows与10取大（对齐原版autosize缺省规则） */
const getDefaultMaxRows = (rows?: number) => Math.max(2 * (rows || 0), 10);

/**
 * 多行文本输入框，对齐原版OO.ui.MultilineTextInputWidget：autosize时经隐藏测量textarea
 * 实测内容与maxRows高度并回写真实input高度（测量流程见useEffect内注释），
 * 受控/非受控语义与其余输入类组件一致
 */
const MultilineTextInput = forwardRef<HTMLDivElement, MultilineTextInputProps>(({
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
  autosize,
  rows,
  maxRows: maxRowsProp,
  // title/dir对齐原版InputWidget的落点（TitledElement的$titled与setDir均为$input），不放外层div
  title,
  dir,
  value,
  defaultValue,
  // inputRef透传到内部textarea（父类型TextInputProps的泛型已参数化为HTMLTextAreaElement）
  inputRef: inputRefProp,
  ...rest
}: MultilineTextInputProps, ref) => {
  const maxRows = maxRowsProp ?? getDefaultMaxRows(rows);
  const labelRef = useRef<HTMLSpanElement>(null);
  const inputStyle = useLabelPadding(labelRef, label, labelPosition);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);
  const setTextareaRef = useMergedRefs(textareaRef, inputRefProp);
  // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
  const { value: currentValue, commit } = useControlledValue<string, ChangeEvent<HTMLTextAreaElement>>(
    { value, defaultValue: defaultValue ?? '' },
    onChange,
  );

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
  );

  const inputClasses = clsx(
    'oo-ui-inputWidget-input',
    autosize && 'oo-ui-textInputWidget-autosized',
  );

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    commit(event.target.value, event);
  };

  /** 最小行数 */
  const minRows = rows === undefined ? '' : String(rows);

  // 最新adjustSize实现存入ref（每轮渲染后刷新），使input监听不必随value变化重挂，
  // 避免受控模式下每次键入都remove/addEventListener
  const adjustSizeRef = useRef<() => void>(() => {});

  useEffect(() => {
    adjustSizeRef.current = () => {
      const input = textareaRef.current;
      const hidden = hiddenInputRef.current;
      if (!input || !hidden) {
        return;
      }
      // 排除滚动条对测量的干扰（原版T297963：clone设overflow hidden）
      hidden.style.overflow = 'hidden';
      hidden.classList.remove('oo-ui-element-hidden');

      // 高度设为0以获取内容的scrollHeight
      hidden.style.height = '0';
      hidden.setAttribute('rows', minRows);
      hidden.value = input.value;
      const { scrollHeight } = hidden;

      // 恢复高度读取innerHeight/outerHeight
      hidden.style.height = '';
      const innerHeight = hidden.clientHeight;
      const outerHeight = hidden.offsetHeight;

      // 行数设为maxRows、内容清空以获取最大高度
      hidden.setAttribute('rows', String(maxRows));
      hidden.style.height = 'auto';
      hidden.value = '';
      const maxInnerHeight = hidden.clientHeight;

      // Blink缩放下的测量误差补偿（原版T133347）
      const measurementError = maxInnerHeight - hidden.scrollHeight;
      const idealHeight = Math.min(maxInnerHeight, scrollHeight + measurementError);

      hidden.classList.add('oo-ui-element-hidden');
      hidden.style.overflow = '';

      // 内容未超出maxRows时清空inline高度回退rows布局，超出时锁定高度
      const newHeight = idealHeight > innerHeight ? `${idealHeight + (outerHeight - innerHeight)}px` : '';
      input.style.height = newHeight;
    };
  });

  // 键入即时调整（兼容非受控用法），监听只随autosize挂卸
  useEffect(() => {
    if (!autosize) {
      return;
    }
    const input = textareaRef.current;
    if (!input) {
      return;
    }
    const onInput = () => adjustSizeRef.current();
    input.addEventListener('input', onInput);
    return () => {
      input.removeEventListener('input', onInput);
    };
  }, [autosize]);

  // value变化（含程序化赋值与非受控键入回流）触发重算，对齐原版change事件驱动adjustSize的语义
  useEffect(() => {
    if (!autosize) {
      return;
    }
    adjustSizeRef.current();
  }, [autosize, maxRows, rows, currentValue]);

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      <textarea
        accessKey={accessKey}
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        className={inputClasses}
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
        rows={rows}
        ref={setTextareaRef}
      />
      {autosize && (
        // 测量用隐藏节点：不挂可聚焦属性（accessKey/tabIndex）与表单语义，避免主题CSS未就绪时进入tab序
        <textarea
          className='oo-ui-inputWidget-input oo-ui-element-hidden'
          style={{ paddingRight: '0px', height: 'auto' }}
          aria-hidden='true'
          rows={maxRows}
          ref={hiddenInputRef}
        />
      )}
      <IconBase icon={icon} />
      <IndicatorBase indicator={indicator || (required ? 'required' : undefined)} style={{ right: '2px' }} />
      {hasLabel(label) && <LabelBase ref={labelRef}>{label}</LabelBase>}
    </div>
  );
});

MultilineTextInput.displayName = 'MultilineTextInput';

export default MultilineTextInput;
