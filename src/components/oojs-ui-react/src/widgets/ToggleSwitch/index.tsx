import React, {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import clsx from 'clsx';
import { getWidgetClassName, mergeAriaLabelledBy, resolveTabIndex } from '../../utils';
import { useControlledValue, useFieldLabelFocus } from '../../hooks';
import type { WidgetProps } from '../Widget';

export interface ToggleSwitchProps extends Omit<WidgetProps<HTMLSpanElement>, 'children' | 'onChange'> {

  /** 是否开启（受控，传入即受控模式；对齐原版ToggleWidget的value配置） */
  checked?: boolean;

  /** 非受控初始开启态 */
  defaultChecked?: boolean;

  /** 开关状态变更回调（对齐原版change事件，仅回传新状态，无事件对象） */
  onChange?: (checked: boolean) => void;
}

/**
 * 滑动开关，对齐原版OO.ui.ToggleSwitchWidget：span根（role=switch + aria-checked）内含
 * glow/grip两个装饰子元素，开合形态由主题CSS按`oo-ui-toggleWidget-on/off`类驱动；
 * 左键点击或Space/Enter切换（原版onKeyPress的React等价实现，keydown阻止Space滚动页面）。
 * FieldLayout内点击标签翻转并聚焦（对齐原版覆写的simulateLabelClick）
 */
export const ToggleSwitch = forwardRef<HTMLSpanElement, ToggleSwitchProps>(({
  checked,
  defaultChecked,
  onChange,
  className,
  disabled,
  tabIndex,
  'aria-labelledby': ariaLabelledBy,
  // onClick/onKeyDown承载切换逻辑，rest透传的其余事件（悬停等）不受影响
  ...rest
}, ref) => {
  const { value: isChecked, commit } = useControlledValue<boolean>(
    { value: checked, defaultValue: defaultChecked ?? false },
    onChange,
  );
  // FieldLayout标签联动（通道B）：点击标签翻转+聚焦（对齐原版覆写的simulateLabelClick，
  // 禁用时既不翻转也不聚焦——原版focus()内含isDisabled判断）
  const { setRef: setRootRef, fieldLabelId } = useFieldLabelFocus<HTMLSpanElement>({
    ref,
    disabled,
    activate: (el) => {
      commit(!isChecked);
      el?.focus();
    },
  });

  const classes = clsx(
    className,
    getWidgetClassName({ disabled }, 'toggle', 'toggleSwitch'),
    isChecked ? 'oo-ui-toggleWidget-on' : 'oo-ui-toggleWidget-off',
  );

  /** 左键点击切换，对齐原版onClick（仅左键生效，禁用时不切换） */
  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (!disabled && e.button === 0) {
      commit(!isChecked);
    }
  };

  /** Space/Enter切换，对齐原版onKeyPress（Space默认滚动页面需阻止） */
  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      commit(!isChecked);
    }
  };

  return (
    <span
      {...rest}
      className={classes}
      role='switch'
      aria-checked={isChecked}
      aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
      aria-disabled={disabled || undefined}
      tabIndex={resolveTabIndex(tabIndex, disabled)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={setRootRef}
    >
      <span className='oo-ui-toggleSwitchWidget-glow' />
      <span className='oo-ui-toggleSwitchWidget-grip' />
    </span>
  );
});

ToggleSwitch.displayName = 'ToggleSwitch';
