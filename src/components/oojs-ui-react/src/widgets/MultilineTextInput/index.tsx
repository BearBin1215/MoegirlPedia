import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { generateWidgetClassName } from '../../utils';
import type { TextInputProps } from '../TextInput';

export interface MultilineTextInputProps extends TextInputProps<HTMLTextAreaElement> {
  /** 行数 */
  rows?: number;

  /** 最大行数 */
  maxRows?: number;

  /** 是否自动高度 */
  autosize?: boolean;
}

/** 对齐原版：maxRows || max(2×rows, 10) */
const getDefaultMaxRows = (rows?: number) => Math.max(2 * (rows || 0), 10);

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
  value,
  defaultValue,
  ...rest
}: MultilineTextInputProps, ref) => {
  const maxRows = maxRowsProp ?? getDefaultMaxRows(rows);
  const [inputStyle, setInputStyle] = useState<CSSProperties>({});
  const labelRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hiddenInputRef = useRef<HTMLTextAreaElement>(null);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled, icon, indicator, label }, 'input', 'textInput'),
    (label !== null && label !== void 0 && label !== false) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
  );

  const inputClasses = clsx(
    'oo-ui-inputWidget-input',
    autosize && 'oo-ui-textInputWidget-autosized',
  );

  /** 值变更响应 */
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
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
    setInputStyle(style);
  }, [label, labelPosition]);

  /** 最小行数，对齐原版minRows */
  const minRows = rows === undefined ? '' : String(rows);

  // 最新adjustSize实现存入ref（每轮渲染后刷新），使input监听不必随value变化重挂，
  // 避免受控模式下每次键入都remove/addEventListener
  const adjustSizeRef = useRef<() => void>(() => {});

  useEffect(() => {
    adjustSizeRef.current = () => {
      const input = inputRef.current;
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
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const onInput = () => adjustSizeRef.current();
    input.addEventListener('input', onInput);
    return () => {
      input.removeEventListener('input', onInput);
    };
  }, [autosize]);

  // 受控模式下value变化（含程序化赋值）也触发重算，对齐原版change事件驱动adjustSize的语义
  useEffect(() => {
    if (!autosize) {
      return;
    }
    adjustSizeRef.current();
  }, [autosize, maxRows, rows, value]);

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={ref}
    >
      <textarea
        accessKey={accessKey}
        name={name}
        onChange={handleChange}
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className={inputClasses}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        readOnly={readOnly}
        required={required}
        aria-required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        style={inputStyle}
        rows={rows}
        ref={inputRef}
      />
      {autosize && (
        <textarea
          accessKey={accessKey}
          tabIndex={disabled ? -1 : 0}
          aria-disabled={!!disabled}
          className='oo-ui-inputWidget-input oo-ui-element-hidden'
          readOnly={readOnly}
          style={{ paddingRight: '0px', height: 'auto' }}
          aria-hidden='true'
          rows={maxRows}
          ref={hiddenInputRef}
        />
      )}
      <IconBase icon={icon} />
      <IndicatorBase indicator={indicator || (required ? 'required' : undefined)} style={{ right: '2px' }} />
      {(label !== null && label !== void 0 && label !== false) && <LabelBase ref={labelRef}>{label}</LabelBase>}
    </div>
  );
});

MultilineTextInput.displayName = 'MultilineTextInput';

export default MultilineTextInput;
