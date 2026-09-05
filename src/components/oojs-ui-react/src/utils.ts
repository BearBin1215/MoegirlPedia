import type { ChangeEvent, MutableRefObject, Ref } from 'react';
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

/** 合并多个ref（组件内需要持有元素引用、同时又要向外转发ref时使用） */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else {
        // React 18的RefObject.current为readonly，需断言
        (ref as MutableRefObject<T | null>).current = node;
      }
    }
  };
}

/** RefObject/HTMLElement/null三态统一解析为HTMLElement或null（浮动定位类组件共用） */
export function resolveElement(el: unknown): HTMLElement | null {
  if (el && typeof el === 'object' && 'current' in el) {
    return ((el as { current?: HTMLElement | null }).current) ?? null;
  }
  return (el as HTMLElement) ?? null;
}

/** label是否实际渲染内容（`null`/`undefined`/`false`均视为无标签，对齐LabelElement的可选语义） */
export function hasLabel(label: unknown): boolean {
  return label !== null && label !== undefined && label !== false;
}

/**
 * 生成常用类
 * @param props 组件属性
 * @param widgetNames 组件名称，用于生成`oo-ui-{widgetName}Widget`
 */
export function generateWidgetClassName(
  { disabled, label, invisibleLabel, icon, indicator }: ComponentProps,
  ...widgetNames: string[]
): string {
  return clsx(
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    icon && 'oo-ui-iconElement',
    indicator && 'oo-ui-indicatorElement',
    invisibleLabel && 'oo-ui-labelElement-invisible',
    hasLabel(label) && 'oo-ui-labelElement',
    widgetNames.map((widgetName) => `oo-ui-${widgetName}Widget`),
  );
}
