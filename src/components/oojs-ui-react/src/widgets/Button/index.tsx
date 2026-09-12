import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type MouseEventHandler,
  type KeyboardEventHandler,
  type MouseEvent,
  type KeyboardEvent,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { generateWidgetClassName, toFlagArray, type AccessKeyedElement } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { IconElement, IconFlag } from '../Icon';
import type { IndicatorElement } from '../Indicator';

/** 按钮标志：图标变体之外扩展按钮专属的primary/safe/back/close */
export type ButtonFlag = IconFlag | 'primary' | 'safe' | 'back' | 'close';

/**
 * 按wikimediaui主题规则生成图标/指示器变体类（Button与ButtonInput共用）：
 * 边框按钮在active/disabled/primary时整体反色；否则按标志叠加progressive等变体
 */
export const getButtonIconClasses = (
  framed: boolean,
  active: boolean | undefined,
  disabled: boolean | undefined,
  flags: ButtonFlag[],
): string | undefined => {
  if (framed && (active || disabled || flags.includes('primary'))) {
    return 'oo-ui-image-invert';
  }
  if (disabled) {
    return undefined;
  }
  return clsx(
    flags.includes('progressive') && 'oo-ui-image-progressive',
    flags.includes('destructive') && 'oo-ui-image-destructive',
    flags.includes('invert') && 'oo-ui-image-invert',
    flags.includes('error') && 'oo-ui-image-error',
    flags.includes('warning') && 'oo-ui-image-warning',
    flags.includes('success') && 'oo-ui-image-success',
  );
};

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

  /** 链接打开位置（<a>的target） */
  target?: string;

  /** 内部<a>标签的rel属性（数组以空格拼接） */
  rel?: string | string[];

  /** 内部<a>标签的title */
  title?: string;

  /** 图标title提示 */
  iconTitle?: string;

  /** 指示器title提示 */
  indicatorTitle?: string;

  /** 点击回调（键盘Enter/空格触发时ev为KeyboardEvent） */
  onClick?: (ev: MouseEvent<HTMLSpanElement> | KeyboardEvent<HTMLSpanElement>) => void;

  /** 获取内部`<a>`元素引用（组件ref指向外层span，用于聚焦等直接操作链接的场景） */
  anchorRef?: Ref<HTMLAnchorElement>;
}

/**
 * 按钮组件，对齐原版OO.ui.ButtonWidget/ButtonElement：span内嵌a[role=button]结构，
 * 支持图标/标签/指示器、flags变体与链接；按压态含键盘Enter/空格（CSS无法覆盖，见事件处理）
 */
export const Button = forwardRef<HTMLSpanElement, ButtonProps>(({
  active,
  accessKey,
  children,
  className,
  disabled,
  framed = true,
  invisibleLabel,
  flags = [],
  href,
  target,
  icon,
  iconTitle,
  indicator,
  indicatorTitle,
  rel = ['nofollow'],
  title,
  tabIndex,
  'aria-label': ariaLabel,
  anchorRef,
  onClick,
  onMouseDown,
  onMouseUp,
  onKeyDown,
  onKeyPress,
  onKeyUp,
  ...rest
}, ref) => {
  /**
   * 按压态，由JS维护并输出`oo-ui-buttonElement-pressed`类，对齐原版ButtonElement：
   * 键盘为Enter/空格按下与抬起（CSS无法实现键盘按压）；鼠标为左键按下加类，
   * mouseup可能发生在按钮外，通过document级capture监听复位（原版onDocumentMouseUp同款）
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
  const relList = typeof rel === 'string' ? [rel] : rel;
  const iconClasses = getButtonIconClasses(framed, active, disabled, flagList);

  const classes = clsx(
    className,
    generateWidgetClassName({
      disabled,
      icon,
      // 原版LabelElement在invisibleLabel时不输出oo-ui-labelElement类
      label: invisibleLabel ? undefined : children,
      indicator,
    }, 'button'),
    'oo-ui-buttonElement',
    framed ? 'oo-ui-buttonElement-framed' : 'oo-ui-buttonElement-frameless',
    flagList.map((flag) => `oo-ui-flaggedElement-${flag}`),
    active && 'oo-ui-buttonElement-active',
    pressed && !disabled && 'oo-ui-buttonElement-pressed',
  );

  const handleClick: ButtonProps['onClick'] = (ev) => {
    if (!disabled && onClick) {
      onClick(ev);
    }
  };

  const handleMouseUp: MouseEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled) {
      setPressed(false);
    }
    if (onMouseUp) {
      onMouseUp(ev);
    }
  };

  /** 对齐原版onMouseDown/onDocumentMouseUp：左键按下进入按压态；mouseup可能发生在按钮外，用document级capture监听确保复位 */
  const handleMouseDown: MouseEventHandler<HTMLSpanElement> = (ev) => {
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
    if (onMouseDown) {
      onMouseDown(ev);
    }
  };

  /** 按下Enter或空格键等同按下鼠标（键盘按压态无法用CSS实现，需JS维护）。
   * 对齐原版onKeyDown：无论按住期间焦点是否移出，keyup均经document级capture监听复位按压态 */
  const handleKeyDown: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
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
    if (onKeyDown) {
      onKeyDown(ev);
    }
  };

  /** 松开Enter或空格键，复位键盘按压态 */
  const handleKeyUp: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && (ev.key === 'Enter' || ev.key === ' ')) {
      setPressed(false);
    }
    if (onKeyUp) {
      onKeyUp(ev);
    }
  };

  /** 对齐原版onKeyPress：Enter/空格触发click，存在click监听时阻止默认行为（空格滚动页面） */
  const handleKeyPress: KeyboardEventHandler<HTMLSpanElement> = (ev) => {
    if (!disabled && (ev.key === 'Enter' || ev.key === ' ')) {
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
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onKeyDown={handleKeyDown}
      onKeyPress={handleKeyPress}
      onKeyUp={handleKeyUp}
      aria-disabled={disabled || undefined}
    >
      <a
        className='oo-ui-buttonElement-button'
        role='button'
        ref={anchorRef}
        tabIndex={disabled ? -1 : (tabIndex ?? 0)}
        href={disabled ? undefined : href}
        target={target}
        rel={relList.join(' ') || undefined}
        title={title}
        accessKey={accessKey}
        // aria-label须落在可聚焦的<a>上（外层span为generic元素不可命名，且不会向子元素传播）
        aria-label={ariaLabel}
      >
        <IconBase
          icon={icon}
          className={iconClasses}
          title={iconTitle}
        />
        {/* invisible类须落在label元素上（对齐原版LabelElement.setInvisibleLabel），裁剪样式以该元素为选择器 */}
        <LabelBase className={clsx(invisibleLabel && 'oo-ui-labelElement-invisible')}>{children}</LabelBase>
        <IndicatorBase
          indicator={indicator}
          className={iconClasses}
          title={indicatorTitle}
        />
      </a>
    </span>
  );
});

Button.displayName = 'Button';

