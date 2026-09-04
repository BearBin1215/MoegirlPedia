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
    (label !== null && label !== void 0 && label !== false) && 'oo-ui-labelElement',
    widgetNames.map((widgetName) => `oo-ui-${widgetName}Widget`),
  );
}
