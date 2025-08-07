import clsx from 'clsx';
import type { WidgetProps } from '../components/widgets/Widget';
import type { LabelElement, IconElement, IndicatorElement } from '../types/mixin';

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
