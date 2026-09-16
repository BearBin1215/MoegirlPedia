import React, {
  forwardRef,
  type MouseEvent,
  type MouseEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { buttonElementClasses, getButtonIconClasses, getWidgetClassName, resolveTabIndex, toFlagArray } from '../../utils';
import { usePressedState } from '../../hooks';
import type { AccessKeyedElement, ButtonFlag, IconElement, IndicatorElement } from '../../Element';
import type { WidgetProps } from '../Widget';
import { ButtonSlots } from '../Button/slots';

export interface ButtonInputProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'children' | 'onClick' | 'onMouseDown' | 'onMouseUp' | 'onKeyDown' | 'onKeyUp'>,
  AccessKeyedElement,
  IconElement,
  IndicatorElement {

  /** 按钮文本 */
  children?: ReactNode;

  /**
   * HTML `type`属性
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /** 渲染为`<input>`元素而非`<button>`（不支持图标/指示器/value，标签仅支持纯文本） */
  useInputTag?: boolean;

  /** 是否生成边框 */
  framed?: boolean;

  /** 附加给按钮的标志 */
  flags?: ButtonFlag | ButtonFlag[];

  /** 是否为激活状态 */
  active?: boolean;

  /** 表单提交值（useInputTag时无效，`<input>`的value为标签文本） */
  value?: string;

  /** 提交时跳过表单校验 */
  formNoValidate?: boolean;

  /** 表单提交字段名 */
  name?: string;

  /** 点击回调（原生button，键盘Enter/空格触发时同样触发click） */
  onClick?: (ev: MouseEvent<HTMLButtonElement | HTMLInputElement>) => void;

  onMouseDown?: MouseEventHandler<HTMLElement>;
  onMouseUp?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
  onKeyUp?: KeyboardEventHandler<HTMLElement>;
}

/**
 * 表单按钮，对齐原版OO.ui.ButtonInputWidget：真实`<button>`/`<input>`元素，用于FormLayout提交，
 * 无表单提交需求时请使用Button
 */
export const ButtonInput = forwardRef<HTMLSpanElement, ButtonInputProps>(({
  active,
  accessKey,
  children,
  className,
  disabled,
  framed = true,
  formNoValidate,
  icon,
  indicator,
  name,
  type = 'button',
  useInputTag = false,
  value,
  flags = [],
  tabIndex,
  title,
  onClick,
  onMouseDown,
  onMouseUp,
  onKeyDown,
  onKeyUp,
  ...rest
}, ref) => {
  /**
   * 按压态，由JS维护并输出`oo-ui-buttonElement-pressed`类，对齐原版ButtonElement：
   * 键盘为Enter/空格按下与抬起；鼠标为左键按下加类，mouseup可能发生在按钮外，
   * 通过document级capture监听复位（原版onDocumentMouseUp同款）
   */
  const {
    pressed,
    onMouseDown: pressedMouseDown,
    onMouseUp: pressedMouseUp,
    onKeyDown: pressedKeyDown,
    onKeyUp: pressedKeyUp,
  } = usePressedState({
    disabled,
    onMouseDown,
    onMouseUp,
    onKeyDown,
    onKeyUp,
  });
  const flagList = toFlagArray(flags);
  const iconClasses = getButtonIconClasses(framed, active, disabled, flagList);

  const classes = clsx(
    className,
    getWidgetClassName({
      disabled,
      // useInputTag的<input>不支持图标/指示器展示
      icon: useInputTag ? undefined : icon,
      indicator: useInputTag ? undefined : indicator,
      label: children,
    }, 'input', 'buttonInput'),
    buttonElementClasses({ framed, active, disabled, pressed, flags: flagList }),
  );

  const handleClick: ButtonInputProps['onClick'] = (ev) => {
    if (!disabled) {
      onClick?.(ev);
    }
  };

  const inputProps = {
    type,
    name,
    className: 'oo-ui-inputWidget-input oo-ui-buttonElement-button',
    disabled,
    tabIndex: resolveTabIndex(tabIndex, disabled),
    'aria-disabled': disabled || undefined,
    title,
    accessKey,
    formNoValidate: formNoValidate || undefined,
    onClick: handleClick,
    onMouseDown: pressedMouseDown,
    onMouseUp: pressedMouseUp,
    onKeyDown: pressedKeyDown,
    onKeyUp: pressedKeyUp,
  } as const;

  return (
    <span
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      {useInputTag ? (
        <input
          {...inputProps}
          value={typeof children === 'string' ? children : ''}
          readOnly
        />
      ) : (
        <button {...inputProps} value={value}>
          <ButtonSlots
            icon={icon}
            variantClasses={iconClasses}
            label={children}
            indicator={indicator}
          />
        </button>
      )}
    </span>
  );
});

ButtonInput.displayName = 'ButtonInput';
