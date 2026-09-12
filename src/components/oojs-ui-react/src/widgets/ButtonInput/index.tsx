import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type MouseEvent,
  type MouseEventHandler,
  type KeyboardEventHandler,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { flaggedElementClasses, getWidgetClassName, toFlagArray, type AccessKeyedElement } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';
import { getButtonIconClasses, type ButtonFlag } from '../Button';

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
  const [pressed, setPressed] = useState(false);
  // 未复位的document级mouseup监听（按压后组件卸载的边界场景），卸载时兜底移除
  // （对齐Tool.tsx/Select.tsx的监听清理范式）；ref惰性初始化，避免每渲染新建Set即丢
  const documentMouseUpHandlersRef = useRef<Set<() => void> | null>(null);
  // 未复位的document级keyup监听（按住Enter/空格期间焦点移出后原位keyup不再触发），按住期间仅挂载一次
  const documentKeyUpHandlerRef = useRef<(() => void) | null>(null);
  useEffect(() => () => {
    for (const handler of documentMouseUpHandlersRef.current ?? []) {
      document.removeEventListener('mouseup', handler, true);
    }
    documentMouseUpHandlersRef.current?.clear();
    if (documentKeyUpHandlerRef.current) {
      document.removeEventListener('keyup', documentKeyUpHandlerRef.current, true);
      documentKeyUpHandlerRef.current = null;
    }
  }, []);
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
    'oo-ui-buttonElement',
    framed ? 'oo-ui-buttonElement-framed' : 'oo-ui-buttonElement-frameless',
    flaggedElementClasses(flags),
    active && 'oo-ui-buttonElement-active',
    pressed && !disabled && 'oo-ui-buttonElement-pressed',
  );

  const handleClick: ButtonInputProps['onClick'] = (ev) => {
    if (!disabled) {
      onClick?.(ev);
    }
  };

  const handleMouseUp: MouseEventHandler<HTMLElement> = (ev) => {
    if (!disabled) {
      setPressed(false);
    }
    onMouseUp?.(ev);
  };

  /** 对齐原版onMouseDown/onDocumentMouseUp：左键按下进入按压态；mouseup可能发生在按钮外，用document级capture监听确保复位 */
  const handleMouseDown: MouseEventHandler<HTMLElement> = (ev) => {
    if (!disabled && ev.button === 0) {
      setPressed(true);
      const onDocumentMouseUp = () => {
        setPressed(false);
        document.removeEventListener('mouseup', onDocumentMouseUp, true);
        documentMouseUpHandlersRef.current?.delete(onDocumentMouseUp);
      };
      (documentMouseUpHandlersRef.current ??= new Set()).add(onDocumentMouseUp);
      document.addEventListener('mouseup', onDocumentMouseUp, true);
    }
    onMouseDown?.(ev);
  };

  /** 按下Enter或空格键等同按下鼠标（原生button的click由浏览器触发，无需手动派发）。
   * 对齐原版onKeyDown：无论按住期间焦点是否移出，keyup均经document级capture监听复位按压态 */
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (ev) => {
    if (!disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      setPressed(true);
      if (!documentKeyUpHandlerRef.current) {
        const onDocumentKeyUp = () => {
          setPressed(false);
          document.removeEventListener('keyup', onDocumentKeyUp, true);
          documentKeyUpHandlerRef.current = null;
        };
        documentKeyUpHandlerRef.current = onDocumentKeyUp;
        document.addEventListener('keyup', onDocumentKeyUp, true);
      }
    }
    onKeyDown?.(ev);
  };

  const handleKeyUp: KeyboardEventHandler<HTMLElement> = (ev) => {
    if (!disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      setPressed(false);
    }
    onKeyUp?.(ev);
  };

  const inputProps = {
    type,
    name,
    className: 'oo-ui-inputWidget-input oo-ui-buttonElement-button',
    disabled,
    tabIndex: disabled ? -1 : (tabIndex ?? 0),
    title,
    accessKey,
    formNoValidate: formNoValidate || undefined,
    onClick: handleClick,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
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
          <IconBase
            icon={icon}
            className={iconClasses}
          />
          <LabelBase>{children}</LabelBase>
          <IndicatorBase
            indicator={indicator}
            className={iconClasses}
          />
        </button>
      )}
    </span>
  );
});

ButtonInput.displayName = 'ButtonInput';

