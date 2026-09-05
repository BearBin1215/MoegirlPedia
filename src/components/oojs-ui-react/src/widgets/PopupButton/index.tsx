import React, { useRef, useState, forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import Button, { type ButtonProps } from '../Button';
import Popup, { type PopupProps } from '../Popup';
import { mergeRefs } from '../../utils';

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

    /** 弹层内容（children作为按钮内容，二者分离对齐原版label与popup.$content） */
    popupContent?: ReactNode;
  };

/** @description 弹出按钮，对齐原版OO.ui.PopupButtonWidget：点击按钮切换popup，popup默认autoClose并忽略按钮自身 */
const PopupButton = forwardRef<HTMLSpanElement, PopupButtonProps>(({
  children,
  popupContent,
  open: openProp,
  defaultOpen = false,
  onClose,
  onClick,
  // Popup专属参数不透传给按钮
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
  label,
  icon,
  ...buttonRest
}, ref) => {
  const buttonRef = useRef<HTMLSpanElement | null>(null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : innerOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) {
      setInnerOpen(next);
    }
    if (!next) {
      onClose?.();
    }
  };

  return (
    <>
      <Button
        {...buttonRest}
        icon={icon}
        className={clsx(buttonRest.className, 'oo-ui-popupButtonWidget')}
        ref={mergeRefs(buttonRef, ref)}
        onClick={(ev) => {
          onClick?.(ev);
          setOpen(!open);
        }}
      >
        {children}
      </Button>
      <Popup
        position={position}
        align={align}
        anchor={anchor}
        autoFlip={autoFlip}
        head={head}
        hideCloseButton={hideCloseButton}
        padded={padded}
        width={width}
        height={height}
        footer={footer}
        container={container ?? buttonRef}
        label={label}
        open={open}
        autoClose
        autoCloseIgnore={buttonRef}
        onClose={() => setOpen(false)}
      >
        {popupContent}
      </Popup>
    </>
  );
});

PopupButton.displayName = 'PopupButton';

export default PopupButton;
