import React, {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { buttonElementClasses, getButtonIconClasses, getWidgetClassName, mergeAriaLabelledBy, resolveTabIndex, toFlagArray } from '../../utils';
import { useFieldLabelFocus, usePressedState } from '../../hooks';
import { useButtonGroupDisabled } from '../ButtonGroup/context';
import type { AccessKeyedElement, ButtonFlag, IconElement, IndicatorElement } from '../../Element';
import type { WidgetProps } from '../Widget';
import type { IconBaseProps } from '../Icon/Base';
import type { IndicatorBaseProps } from '../Indicator/Base';
import { ButtonSlots } from './slots';

/** Button的点击事件参数：鼠标点击为MouseEvent，键盘Enter/空格经handleKeyPress模拟触发时为KeyboardEvent */
export type ButtonClickEvent = MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>;

export interface ButtonProps extends
  Omit<WidgetProps<HTMLSpanElement>, 'onClick' | 'rel'>,
  AccessKeyedElement,
  IconElement,
  IndicatorElement {

  /** 是否为激活状态 */
  active?: boolean;

  /** 是否生成边框 */
  framed?: boolean;

  /** 标签可视（视觉隐藏但保留可访问名称） */
  invisibleLabel?: boolean;

  /** 附加给按钮的标志 */
  flags?: ButtonFlag | ButtonFlag[];

  /** 按钮跳转链接。原版会执行isSafeUrl净化，本工程省略 */
  href?: string;

  /**
   * 根元素widget名类链（原版继承链顺序，输出`oo-ui-{name}Widget`），默认['button']。
   * ToggleButton等Button组合形态经此对齐原版继承链——原版ToggleButtonWidget继承
   * ToggleWidget而非ButtonWidget，根不应有oo-ui-buttonWidget（主题的按钮行距规则
   * 不应命中）。组件内部组合通道，勿在常规使用中改动
   */
  widgetNames?: string[];

  /** 链接打开位置（<a>的target） */
  target?: string;

  /** 内部<a>标签的rel属性（数组以空格拼接） */
  rel?: string | string[];

  /** 内部<a>标签的title */
  title?: string;

  /** 图标span附加属性（经ButtonSlots透传至图标span，对齐原版$icon上的配置能力） */
  iconProps?: Omit<IconBaseProps, 'icon'>;

  /** 指示器span附加属性（经ButtonSlots透传至指示器span，对齐原版$indicator上的配置能力） */
  indicatorProps?: Omit<IndicatorBaseProps, 'indicator'>;

  /** 外部受控按压显示（如ButtonMenuSelectWidget菜单打开期间的按压态），与内部按压流取或 */
  pressed?: boolean;

  /** 点击回调（事件类型见ButtonClickEvent） */
  onClick?: (ev: ButtonClickEvent) => void;

  /** 获取内部`<a>`元素引用（组件ref指向外层span，用于聚焦等直接操作链接的场景） */
  anchorRef?: Ref<HTMLAnchorElement>;

  /**
   * 内部`<a>`的附加属性。供"按钮触发浮层/菜单"的组合把 `aria-haspopup`/`aria-owns`/`aria-expanded`
   * 写到锚点上——原版这类组件的 aria 状态挂在 `$button`（即锚点）上
   * （PopupButtonWidget、ButtonMenuSelectWidget）。组件自身计算的属性（role/tabIndex/aria-disabled 等）优先
   */
  anchorProps?: HTMLAttributes<HTMLAnchorElement>;

  /**
   * 锚点内的附加内容（渲染在图标/标签/指示器之后）。供需要把原生控件挂进
   * `.oo-ui-buttonElement-button`的场景使用——主题CSS以该锚点为直接父元素做选择
   * （如SelectFileInputWidget的`<input type=file>`覆盖层）。组件内部组合通道
   */
  anchorContent?: ReactNode;
}

/**
 * 按钮组件，对齐原版OO.ui.ButtonWidget/ButtonElement：span内嵌a[role=button]结构，
 * 支持图标/标签/指示器、flags变体与链接；按压态含键盘Enter/空格（CSS无键盘按压伪类，
 * 见事件处理）
 */
export const Button = forwardRef<HTMLSpanElement, ButtonProps>(({
  active,
  accessKey,
  anchorContent,
  anchorProps,
  children,
  className,
  disabled,
  framed = true,
  invisibleLabel,
  flags = [],
  href,
  target,
  icon,
  iconProps,
  indicator,
  indicatorProps,
  pressed,
  rel = ['nofollow'],
  title,
  tabIndex,
  widgetNames = ['button'],
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-labelledby': ariaLabelledBy,
  anchorRef,
  onClick,
  onMouseDown,
  onMouseUp,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  ...rest
}, ref) => {
  // 组级禁用（ButtonGroup经Context下发）与自身禁用取或
  const groupDisabled = useButtonGroupDisabled();
  const isDisabled = disabled || groupDisabled;
  /**
   * 内部按压态，由JS维护并输出`oo-ui-buttonElement-pressed`类，对齐原版ButtonElement：
   * 键盘为Enter/空格按下与抬起（CSS无法实现键盘按压）；鼠标为左键按下加类，
   * mouseup可能发生在按钮外，通过document级capture监听复位（原版onDocumentMouseUp同款）
   */
  const {
    pressed: internalPressed,
    onMouseDown: pressedMouseDown,
    onMouseUp: pressedMouseUp,
    onKeyDown: pressedKeyDown,
    onKeyUp: pressedKeyUp,
  } = usePressedState<boolean, HTMLSpanElement>({
    disabled: isDisabled,
    onMouseDown,
    onMouseUp,
    onKeyDown,
    onKeyUp,
  });
  // FieldLayout标签联动（通道B）：点击标签聚焦按钮元素（对齐原版TabIndexedElement.simulateLabelClick
  // 基线focus()，禁用时不聚焦）
  const { setRef: setAnchorRef, fieldLabelId } = useFieldLabelFocus<HTMLAnchorElement>({ ref: anchorRef, disabled: isDisabled });
  const flagList = toFlagArray(flags);
  const relList = typeof rel === 'string' ? [rel] : rel;
  const iconClasses = getButtonIconClasses(framed, active, isDisabled, flagList);

  const classes = clsx(
    className,
    getWidgetClassName({
      disabled: isDisabled,
      icon,
      label: children,
      invisibleLabel,
      indicator,
    }, ...widgetNames),
    buttonElementClasses({ framed, active, disabled: isDisabled, pressed: pressed || internalPressed, flags: flagList }),
  );

  const handleClick: ButtonProps['onClick'] = (ev) => {
    if (!isDisabled && onClick) {
      onClick(ev);
    }
  };

  /** 对齐原版onKeyPress：Enter/空格触发click，存在click监听时阻止默认行为（空格滚动页面） */
  const handleKeyPress: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!isDisabled && (ev.key === 'Enter' || ev.key === ' ')) {
      if (onClick) {
        ev.preventDefault();
      }
      handleClick(ev);
    }
    if (onKeyPress) {
      onKeyPress(ev);
    }
  };

  return (
    <span
      {...rest}
      ref={ref}
      className={classes}
      onClick={handleClick}
      onMouseDown={pressedMouseDown}
      onMouseUp={pressedMouseUp}
      onKeyDown={pressedKeyDown}
      onKeyPress={handleKeyPress}
      onKeyUp={pressedKeyUp}
      aria-disabled={isDisabled || undefined}
    >
      <a
        {...anchorProps}
        className='oo-ui-buttonElement-button'
        role='button'
        ref={setAnchorRef}
        tabIndex={resolveTabIndex(tabIndex, isDisabled)}
        // aria-disabled落在锚点上：原版TabIndexedElement.updateTabIndex写在$tabIndexed
        // （ChromeVox/NVDA不继承父元素的aria-disabled，放外层span会读不到）
        aria-disabled={isDisabled || undefined}
        href={isDisabled ? undefined : href}
        target={target}
        rel={relList.join(' ') || undefined}
        title={title}
        accessKey={accessKey}
        // aria-label/aria-pressed/aria-labelledby须落在可聚焦的<a>上（外层span为generic
        // 元素不可命名）：aria-label供显式命名，aria-pressed供ToggleButton等开关形态，
        // aria-labelledby供FieldLayout标签联动与调用方命名（原版$tabIndexed=$button）
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
      >
        <ButtonSlots
          icon={icon}
          iconProps={iconProps}
          variantClasses={iconClasses}
          label={children}
          labelInvisible={invisibleLabel}
          indicator={indicator}
          indicatorProps={indicatorProps}
          trailing={anchorContent}
        />
      </a>
    </span>
  );
});

Button.displayName = 'Button';
