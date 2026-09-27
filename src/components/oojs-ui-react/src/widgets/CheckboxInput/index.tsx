import React, {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { Icon } from '../Icon';
import { getWidgetClassName, resolveTabIndex, resolveTitle } from '../../mixins';
import { useAccessKeyLabel } from '../../config';
import type { AccessKeyedElement } from '../../Element';
import { useControlledValue, useFieldInputId, useMergedRefs } from '../../hooks';
import type { InputProps } from '../Input';

export type CheckboxInputProps =
  Omit<InputProps<boolean, HTMLInputElement, HTMLSpanElement>, 'value' | 'defaultValue'> &
  AccessKeyedElement & {
    /** 是否勾选（受控，传入即受控模式） */
    checked?: boolean;

    /** 非受控初始勾选态 */
    defaultChecked?: boolean;

    /** 表单提交值（写入input的value属性，不影响勾选状态） */
    value?: string | number;

    /** input元素id（配合label的htmlFor使用） */
    inputId?: string;

    /** 半选状态 */
    indeterminate?: boolean;

    /** 获取内部input元素引用（组件ref指向外层span，需要直接操作input时使用） */
    inputRef?: Ref<HTMLInputElement>;
  };

export const CheckboxInput = forwardRef<HTMLSpanElement, CheckboxInputProps>(({
  name,
  inputId,
  accessKey,
  className,
  disabled,
  indeterminate,
  required,
  onChange,
  checked,
  defaultChecked,
  value,
  title,
  dir,
  tabIndex,
  inputRef: inputRefProp,
  ...rest
}, ref) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { value: isChecked, commit } = useControlledValue<boolean, ChangeEvent<HTMLInputElement>>(
    { value: checked, defaultValue: defaultChecked ?? false },
    onChange,
  );
  // FieldLayout标签联动（通道A）：显式inputId优先，否则认领字段id与label的htmlFor关联
  const fieldInputId = useFieldInputId(inputId);
  // title的键位后缀：快捷键文案由宿主解析（未提供时title附原键值）
  const accessKeyLabel = useAccessKeyLabel(accessKey);

  // indeterminate不是React受控属性，需手动同步到DOM
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const classes = clsx(
    className,
    getWidgetClassName({ disabled }, 'input', 'checkboxInput'),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit(event.target.checked, event);
  };

  /** 同时服务内部indeterminate同步与外部inputRef */
  const setInputRef = useMergedRefs(inputRef, inputRefProp);

  return (
    <span
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      {/* title/dir/tabIndex/accessKey/name等对齐原版InputWidget：均落在input元素上 */}
      <input
        ref={setInputRef}
        name={name}
        id={fieldInputId}
        type='checkbox'
        value={value === undefined ? undefined : String(value)}
        required={required}
        // title/accessKey同落input（原版InputWidget的$titled=$accessKeyed=$input）；
        // 本组件无标签元素，不做invisibleLabel兜底
        title={resolveTitle({ title, accessKey, accessKeyLabel })}
        dir={dir}
        accessKey={accessKey}
        tabIndex={resolveTabIndex(tabIndex, disabled)}
        aria-disabled={disabled || undefined}
        className='oo-ui-inputWidget-input'
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
      />
      <Icon
        icon='check'
        className='oo-ui-checkboxInputWidget-checkIcon oo-ui-image-invert'
      />
    </span>
  );
});

CheckboxInput.displayName = 'CheckboxInput';

