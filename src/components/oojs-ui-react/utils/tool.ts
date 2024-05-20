import classNames from 'classnames';
import type { WidgetProps } from '../widgets/Widget';
import type { LabelElement, IconElement, IndicatorElement } from '../types/mixin';

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

interface ComponentProps extends
  WidgetProps,
  LabelElement,
  IconElement,
  IndicatorElement { }

/**
 * 生成常用类
 * @param props 组件属性
 * @param widgetNames 组件名称，用于生成`oo-ui-{widgetName}Widget`
 */
export function processClassNames(
  { disabled, label, icon, indicator }: ComponentProps,
  ...widgetNames: string[]
): string {
  return classNames(
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    icon && 'oo-ui-iconElement',
    indicator && 'oo-ui-indicatorElement',
    label && 'oo-ui-labelElement',
    widgetNames.map((widgetName) => `oo-ui-${widgetName}Widget`),
  );
}
