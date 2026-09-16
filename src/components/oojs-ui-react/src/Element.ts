import type { HTMLAttributes, ReactNode } from 'react';

/**
 * 基础元素参数（对齐原版抽象基类Element，仅类型，无对应渲染组件）。
 * 各元素mixin（Icon/Indicator/Label/AccessKeyed/Flagged等）的契约类型与flag联合类型
 * （IconFlag/ButtonFlag等）集中于此，供组件与utils共享，避免类型散落在渲染组件目录
 * 造成依赖方向倒置
 */
export type ElementProps<T = HTMLDivElement> = Omit<HTMLAttributes<T>, 'defaultValue' | 'defaultChecked'>;

/** 快捷键元素参数（对齐原版AccessKeyedElement mixin，仅类型） */
export interface AccessKeyedElement {
  /** 快捷键 */
  accessKey?: string;
}

/**
 * FlaggedElement mixin的props类型（对齐原版OO.ui.mixin.FlaggedElement，仅类型，无渲染组件）：
 * 每个标志输出`oo-ui-flaggedElement-{flag}`类（类生成走flaggedElementClasses）。
 * 原版config.flags的对象形态为setFlags命令式toggle所用，声明式props仅收字符串/数组
 */
export interface FlaggedElement {
  /** 附加标志集；组件内部机制（如软校验的invalid）在其上叠加输出 */
  flags?: string | string[];
}

/** 标签元素参数（对齐原版LabelElement mixin，仅类型） */
export interface LabelElement {
  /** 标签显示内容 */
  label?: ReactNode;
  /** 标签可视 */
  invisibleLabel?: boolean;
}

/** 主题支持的图标变体集（对齐wikimediaui主题variants）：IconFlag由此派生，新增变体只改此处 */
export const ICON_FLAGS = ['progressive', 'destructive', 'invert', 'error', 'warning', 'success'] as const;

/** 主题支持的图标变体 */
export type IconFlag = typeof ICON_FLAGS[number];

/** 图标元素参数（对齐原版IconElement mixin，仅类型） */
export interface IconElement {
  /**
   * 组件图标
   * @see https://doc.wikimedia.org/oojs-ui/master/demos/?page=icons
   */
  icon?: string;
}

/** 主题支持的指示器集合 */
export type Indicators = 'clear' | 'up' | 'down' | 'required';

/** 指示器元素参数（对齐原版IndicatorElement mixin，仅类型） */
export interface IndicatorElement {
  /** 组件指示器 */
  indicator?: Indicators;
}

/** 按钮标志：图标变体之外扩展按钮专属的primary/safe/back/close */
export type ButtonFlag = IconFlag | 'primary' | 'safe' | 'back' | 'close';
