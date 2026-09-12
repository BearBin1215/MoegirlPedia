import type { ChangeEvent } from 'react';
import clsx from 'clsx';
import type { WidgetProps } from './widgets/Widget';
import type { LabelElement } from './widgets/Label';
import type { IconElement } from './widgets/Icon';
import type { IndicatorElement } from './widgets/Indicator';

/** 快捷键元素参数 */
export interface AccessKeyedElement {
  /** 快捷键 */
  accessKey?: string;
}

/**
 * 组件值变化回调（值优先；第二参数为触发变更的原生change事件，仅输入类组件提供）
 * @example <TextInput value={text} onChange={setText} />
 */
export type ChangeHandler<T = any, P = HTMLElement> = (value: T, event?: ChangeEvent<P>) => void;

type ComponentProps =
  WidgetProps &
  LabelElement &
  IconElement &
  IndicatorElement;

/** RefObject/HTMLElement/null三态统一解析为HTMLElement或null（浮动定位类组件共用） */
export function resolveElement(el: unknown): HTMLElement | null {
  if (el && typeof el === 'object' && 'current' in el) {
    return ((el as { current?: HTMLElement | null }).current) ?? null;
  }
  return (el as HTMLElement) ?? null;
}

/** label是否实际渲染内容（`null`/`undefined`/`false`/`''`均视为无标签） */
export function hasLabel(label: unknown): boolean {
  return label !== null && label !== undefined && label !== false && label !== '';
}

/** 浮动定位/钳高类组件的视口四周留白缺省值（px），可经OOUIProvider.viewportSpacing覆盖；MenuSelect/Popup/PopupToolGroup共用 */
export const VIEWPORT_SPACING = 5;

/**
 * 取元素的有效文本方向（'ltr'|'rtl'）。读取computed direction（继承dir属性与CSS），
 * 对齐原版`OO.ui.Element.static.getDir`的语义。portal至body的浮层无法继承内容区方向，
 * 以锚点元素的有效方向为准
 */
export function getElementDir(el: HTMLElement | null | undefined): 'ltr' | 'rtl' {
  return getComputedStyle(el ?? document.documentElement).direction === 'rtl' ? 'rtl' : 'ltr';
}

/**
 * 根节点内可聚焦元素选择器。对齐原版`OO.ui.findFocusable`的判定范围：
 * 含`iframe`与`contenteditable`，已排除`tabIndex=-1`；Dialog的焦点陷阱、
 * 布局切换的自动聚焦与Popup的Tab边界共用同一口径
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]:not([contenteditable="false"])',
].join(',');

/** 取根节点内可聚焦元素（文档顺序） */
export function getFocusableElements(root: ParentNode | null | undefined): HTMLElement[] {
  return Array.from(root?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
}

/** 取根节点内第一个可聚焦元素 */
export function getFirstFocusable(root: ParentNode | null | undefined): HTMLElement | undefined {
  return root?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? undefined;
}

/**
 * 归一化标志参数：单个标志、标志数组与`undefined`统一为数组
 * （Button/ButtonInput/Icon/ProcessDialog的标志类生成共用）
 */
export function toFlagArray<T extends string>(flags?: T | T[]): T[] {
  return typeof flags === 'string' ? [flags] : flags ?? [];
}

/**
 * 生成常用类
 * @param props 组件属性
 * @param widgetNames 组件名称，用于生成`oo-ui-{widgetName}Widget`
 */
export function generateWidgetClassName(
  { disabled, label, icon, indicator }: ComponentProps,
  ...widgetNames: string[]
): string {
  return clsx(
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    icon && 'oo-ui-iconElement',
    indicator && 'oo-ui-indicatorElement',
    hasLabel(label) && 'oo-ui-labelElement',
    widgetNames.map((widgetName) => `oo-ui-${widgetName}Widget`),
  );
}
