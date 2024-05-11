import React, { useState, useRef, useMemo } from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../../utils/tool';
import type { CSSProperties, FunctionComponent, ChangeEvent } from 'react';
import type { InputProps } from '../../types/props';
import type { LabelElement, IconElement, IndicatorElement } from '../../types/mixin';
import type { LabelPosition } from '../../types/utils';

export interface TextInputProps<T = HTMLInputElement, P = HTMLDivElement> extends
  InputProps<string | undefined, T, P>,
  LabelElement,
  IconElement,
  IndicatorElement {

  /** 最大长度 */
  maxLength?: number;

  /** 标签位置 */
  labelPosition?: LabelPosition;

  /** 是否只读 */
  readOnly?: boolean;
}

/**
 * 文本输入框
 * @returns
 */
const TextInput: FunctionComponent<TextInputProps> = ({
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

  /** 值变更响应 */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      const paddingWidth = `${labelRef.current.offsetWidth}px`;
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
      {label && <LabelBase ref={labelRef}>{label}</LabelBase>}
    </div>
  );
};

export default TextInput;
