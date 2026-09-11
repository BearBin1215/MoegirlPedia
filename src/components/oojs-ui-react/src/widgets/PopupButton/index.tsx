import React, { useRef, forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import Button, { type ButtonProps } from '../Button';
import Popup, { type PopupProps } from '../Popup';
import { useControlledValue, useMergedRefs } from '../../hooks';

export type PopupButtonProps = Omit<ButtonProps, 'onClick' | 'active'> &
  Omit<PopupProps, 'open' | 'onClose' | 'autoClose' | 'autoCloseIgnore' | 'children'> & {
    /** 点击回调（在切换开关状态前触发） */
    onClick?: ButtonProps['onClick'];

    /** 是否打开（受控，传入即受控模式） */
    open?: boolean;

    /** 非受控初始打开态 */
    defaultOpen?: boolean;

    /** 弹层请求关闭时触发（点外部/关闭按钮/再次点击按钮） */
    onClose?: () => void;

    /** 弹层内容（children作为按钮内容，二者分离，对应原版label与popup.$content） */
    popupContent?: ReactNode;
  };

/** 弹出按钮，对齐原版OO.ui.PopupButtonWidget：点击按钮切换popup，popup默认autoClose并忽略按钮自身 */
const PopupButton = forwardRef<HTMLSpanElement, PopupButtonProps>(({
  children,
  popupContent,
  open: openProp,
  defaultOpen = false,
  onClose,
  onClick,
  // Popup专属参数经单次解构归组后整体转发（而非逐个手抄），
  // 避免新增Popup prop时遗漏其落入buttonRest被误传给Button
  position,
  align,
  anchor,
  autoFlip,
  head,
  hideCloseButton,
  padded,
  width,
  height,
  footer,
  container,
  hideWhenOutOfView,
  containerPadding,
  label,
  icon,
  invisibleLabel,
  ...buttonRest
}, ref) => {
  const buttonRef = useRef<HTMLSpanElement | null>(null);
  const mergedRef = useMergedRefs(buttonRef, ref);
  const popupProps: Omit<PopupProps, 'open' | 'onClose' | 'autoClose' | 'autoCloseIgnore' | 'children'> = {
    position,
    align,
    anchor,
    autoFlip,
    head,
    hideCloseButton,
    padded,
    width,
    height,
    footer,
    container,
    hideWhenOutOfView,
    containerPadding,
    label,
    invisibleLabel,
  };
  // 由useControlledValue统一管理受控/非受控状态；commit(false)请求关闭时触发onClose
  const { value: open, commit: setOpen } = useControlledValue<boolean>(
    { value: openProp, defaultValue: defaultOpen },
    (next) => {
      if (!next) {
        onClose?.();
      }
    },
  );

  return (
    <>
      <Button
        {...buttonRest}
        icon={icon}
        invisibleLabel={invisibleLabel}
        className={clsx(buttonRest.className, 'oo-ui-popupButtonWidget')}
        ref={mergedRef}
        onClick={(ev) => {
          onClick?.(ev);
          setOpen((prev) => !prev);
        }}
      >
        {children}
      </Button>
      <Popup
        {...popupProps}
        open={open}
        autoClose
        autoCloseIgnore={buttonRef}
        container={container ?? buttonRef}
        onClose={() => setOpen(false)}
      >
        {popupContent}
      </Popup>
    </>
  );
});

PopupButton.displayName = 'PopupButton';

export default PopupButton;
