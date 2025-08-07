import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  type CSSProperties,
  type ChangeEvent,
} from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from 'oojs-ui-react/utils/tool';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import type { TextInputProps } from '../TextInput';

export interface MultilineTextInputProps extends TextInputProps<HTMLTextAreaElement> {
  /** 行数 */
  rows?: number;

  /** 最大行数 */
  maxRows?: number;

  /** 是否自动高度 */
  autosize?: boolean;
}

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
  maxRows = 10,
  value,
  ...rest
}: MultilineTextInputProps, ref) => {
  const [inputStyle, setInputStype] = useState<CSSProperties>({});
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
    setInputStype(style);
  }, [label]);

  useEffect(() => {
    if (!autosize) {
      return;
    }

    /** 最小高度 */
    const minRows = rows === undefined ? '' : String(rows);
    /** 动态调整输入框高度 */
    const adjustSize = () => {
      if (inputRef.current && hiddenInputRef.current) {
        hiddenInputRef.current.classList.remove('oo-ui-element-hidden');

        // 将副输入框高度设为0以获取内容高度
        hiddenInputRef.current.style.height = '0';
        hiddenInputRef.current.setAttribute('rows', minRows);
        hiddenInputRef.current.value = inputRef.current.value;
        const { scrollHeight } = hiddenInputRef.current;

        // 将副输入框行数设为maxRows获取最大高度
        hiddenInputRef.current.style.height = 'auto';
        hiddenInputRef.current.setAttribute('rows', String(maxRows));
        hiddenInputRef.current.value = '';
        const { clientHeight } = hiddenInputRef.current;

        inputRef.current.style.height = `${Math.min(scrollHeight, clientHeight) + 2}px`;

        hiddenInputRef.current.classList.add('oo-ui-element-hidden');
      }
    };

    if (inputRef.current && hiddenInputRef.current) {
      inputRef.current.removeEventListener('input', adjustSize);
      inputRef.current.addEventListener('input', adjustSize);
    }

    return () => {
      inputRef.current?.removeEventListener('input', adjustSize);
    };
  }, [autosize, maxRows]);

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
