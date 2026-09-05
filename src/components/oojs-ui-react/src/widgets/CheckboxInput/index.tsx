import React, {
  forwardRef,
  useEffect,
  useRef,
  type ChangeEvent,
  type Ref,
} from 'react';
import clsx from 'clsx';
import Icon from '../Icon';
import { generateWidgetClassName, mergeRefs, type AccessKeyedElement } from '../../utils';
import { useControlledValue } from '../../hooks';
import type { InputProps } from '../Input';

export type CheckboxInputProps =
  Omit<InputProps<boolean, HTMLInputElement, HTMLSpanElement>, 'value' | 'defaultValue'> &
  AccessKeyedElement & {
    /** 是否勾选（受控，传入即受控模式） */
    checked?: boolean;

    /** 非受控初始勾选态 */
    defaultChecked?: boolean;

    /** input元素id（配合label的htmlFor使用），对齐原版inputId */
    inputId?: string;

    /** 半选状态 */
    indeterminate?: boolean;

    /** 获取内部input元素引用（组件ref指向外层span，需要直接操作input时使用） */
    inputRef?: Ref<HTMLInputElement>;
  };

const CheckboxInput = forwardRef<HTMLSpanElement, CheckboxInputProps>(({
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

  // indeterminate不是React受控属性，需手动同步到DOM
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'input', 'checkboxInput'),
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit(event.target.checked, event);
  };

  /** 同时服务内部indeterminate同步与外部inputRef */
  const setInputRef = mergeRefs(inputRef, inputRefProp);

  return (
    <span
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={ref}
    >
      {/* title/dir/tabIndex/accessKey/name等对齐原版InputWidget：均落在input元素上 */}
      <input
        ref={setInputRef}
        name={name}
        id={inputId}
        type='checkbox'
        required={required}
        title={title}
        dir={dir}
        accessKey={accessKey}
        tabIndex={tabIndex ?? (disabled ? -1 : 0)}
        aria-disabled={!!disabled}
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

export default CheckboxInput;
