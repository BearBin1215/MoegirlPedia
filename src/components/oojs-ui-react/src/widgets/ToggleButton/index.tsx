import React, { forwardRef, useRef } from 'react';
import clsx from 'clsx';
import { Button, type ButtonProps } from '../Button';
import { useControlledValue, useFieldLabelActivate, useMergedRefs } from '../../hooks';
import { mergeAriaLabelledBy } from '../../utils';

/**
 * 切换按钮属性：按钮形态复用ButtonProps（图标/指示器/标签/flags/framed等）。
 * 原版ToggleButtonWidget基于ButtonElement（无href能力），故去除链接相关属性；
 * active由开关状态驱动、onClick承载切换、aria-pressed随状态输出、widgetNames类链
 * 由本组件固定，均不外露
 */
export type ToggleButtonProps = Omit<
  ButtonProps,
  'active' | 'href' | 'target' | 'rel' | 'anchorRef' | 'onClick' | 'aria-pressed' | 'widgetNames'
> & {

  /** 是否开启（受控，传入即受控模式；对齐原版ToggleWidget的value配置） */
  checked?: boolean;

  /** 非受控初始开启态 */
  defaultChecked?: boolean;

  /** 开关状态变更回调（对齐原版change事件，仅回传新状态，无事件对象） */
  onChange?: (checked: boolean) => void;
};

/**
 * 切换按钮，对齐原版OO.ui.ToggleButtonWidget：Button形态 + on/off开关状态。
 * 结构与原版一致——根span（继承链ToggleWidget→ToggleButtonWidget，经widgetNames
 * 对齐，不含oo-ui-buttonWidget）承载开关类（oo-ui-toggleWidget-on/off）与buttonElement类，
 * 开启态经Button的active输出`oo-ui-buttonElement-active`，aria-pressed落在按钮元素上；
 * 点击切换（对齐原版onAction）
 */
export const ToggleButton = forwardRef<HTMLSpanElement, ToggleButtonProps>(({
  checked,
  defaultChecked,
  onChange,
  className,
  disabled,
  'aria-labelledby': ariaLabelledBy,
  children,
  ...rest
}, ref) => {
  const { value: isChecked, commit } = useControlledValue<boolean>(
    { value: checked, defaultValue: defaultChecked ?? false },
    onChange,
  );
  // FieldLayout标签联动（通道B）：点击标签聚焦按钮元素（对齐原版TabIndexedElement.simulateLabelClick
  // 基线focus()，禁用时不聚焦）
  const rootRef = useRef<HTMLSpanElement>(null);
  const setRootRef = useMergedRefs(ref, rootRef);
  const fieldLabelId = useFieldLabelActivate(() => {
    if (!disabled) {
      rootRef.current?.querySelector<HTMLElement>('a[role=button]')?.focus();
    }
  });

  return (
    <Button
      {...rest}
      // disabled须显式下传（解构后不在rest中）；Button内部再与ButtonGroup下发的组禁用取或
      disabled={disabled}
      className={clsx(
        className,
        isChecked ? 'oo-ui-toggleWidget-on' : 'oo-ui-toggleWidget-off',
      )}
      widgetNames={['toggle', 'toggleButton']}
      aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
      active={isChecked}
      aria-pressed={isChecked}
      onClick={() => commit(!isChecked)}
      ref={setRootRef}
    >
      {children}
    </Button>
  );
});

ToggleButton.displayName = 'ToggleButton';
