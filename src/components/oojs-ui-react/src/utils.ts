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

/** 组件change钩子参数 */
export interface ChangeValue<T = any, P = HTMLElement> {
  /** 变更后新值 */
  value: T;

  /** 变更前旧值 */
  oldValue?: T;

  /** 发生变化的dom事件 */
  event?: ChangeEvent<P>;
}

/**
 * 组件值变化钩子函数
 * @example <TextInput value={text} onChange={({ value }) => setText(value) />
 */
export type ChangeHandler<T = any, P = HTMLElement> = (change: ChangeValue<T, P>) => void;


/** 确保参数为数组，通常用来处理children */
export function processArray<T>(elements?: T | T[]) {
  let processedElements: T[] = [];
  if (elements) {
    processedElements = Array.isArray(elements) ? elements.filter((element) => element).map((element, index) => ({
      ...element,
      key: index,
    })) : [{ ...elements, key: 1 }]; // 确保子组件为数组
  }
  return processedElements;
}

type ComponentProps =
  WidgetProps &
  LabelElement &
  IconElement &
  IndicatorElement;

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
    (label !== null && label !== void 0 && label !== false) && 'oo-ui-labelElement',
    widgetNames.map((widgetName) => `oo-ui-${widgetName}Widget`),
  );
}
