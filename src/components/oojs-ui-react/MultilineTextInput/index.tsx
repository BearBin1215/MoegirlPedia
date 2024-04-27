import React, { useState, useMemo, useRef } from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../utils/tool';
import type { CSSProperties, FunctionComponent, ChangeEvent } from 'react';
import type { TextInputProps } from '../types/props';

export interface MultilineTextInputProps extends TextInputProps<HTMLTextAreaElement> {
  /** 行数 */
  rows?: number;

  /** 最大行数 */
  maxRows?: number;

  /** 是否自动高度 */
  autosize?: boolean;
}

/**
 * @todo autosize功能
 */
const MultilineTextInput: FunctionComponent<MultilineTextInputProps> = ({
  accessKey,
  name,
  className,
  defaultValue,
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
  maxRows,
  ...rest
}) => {
  const [value, setValue] = useState(defaultValue || '');
  const labelRef = useRef<HTMLSpanElement>(null);

  const classes = classNames(
    className,
    processClassNames({ disabled, icon, indicator, label }, 'input', 'textInput'),
    label && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
  );

  const inputClasses = classNames(
    'oo-ui-inputWidget-input',
    autosize && 'oo-ui-textInputWidget-autosized',
  );

  /** 值变更响应 */
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (typeof onChange === 'function') {
      onChange({
        value: newValue,
        oldValue: value,
        event,
      });
    }
  };

  /** input的内边距是用内联样式控制的，要根据label判定 */
  const inputStyle = useMemo(() => {
    const style: CSSProperties = {};
    if (labelRef.current) {
      const paddingWidth = `${labelRef.current.offsetWidth + 2}px`;
      if (labelPosition === 'before') {
        style.paddingLeft = paddingWidth;
      } else {
        style.paddingRight = paddingWidth;
      }
    }
    return style;
  }, [label, labelPosition]);

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
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
        placeholder={placeholder}
        maxLength={maxLength}
        style={inputStyle}
        rows={rows}
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
        />
      )}
      <IconBase icon={icon} />
      <IndicatorBase indicator={indicator} style={{ right: '2px' }} />
      {label && <LabelBase>{label}</LabelBase>}
    </div>
  );
};

export default MultilineTextInput;
