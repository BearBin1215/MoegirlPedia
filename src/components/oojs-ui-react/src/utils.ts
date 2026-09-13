import type { ChangeEvent, RefObject } from 'react';
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
 * FlaggedElement mixin的props类型（对齐原版OO.ui.mixin.FlaggedElement，仅类型，无渲染组件）：
 * 每个标志输出`oo-ui-flaggedElement-{flag}`类（类生成走flaggedElementClasses）。
 * 原版config.flags的对象形态为setFlags命令式toggle所用，声明式props仅收字符串/数组
 */
export interface FlaggedElement {
  /** 附加标志集；组件内部机制（如软校验的invalid）在其上叠加输出 */
  flags?: string | string[];
}

/**
 * 合并软校验的invalid标志与配置flags（对齐原版setValidityFlag的setFlags({invalid})合并语义）：
 * 校验非法时invalid标志叠加在配置flags之上，合法时仅保留配置flags——配置flags为声明式
 * 基线，不随校验通过移除（原版config.flags与setFlags共享存储的移除语义不适用于声明式props）
 */
export function mergeInvalidFlag(flags: string[], invalid: boolean): string[] {
  return invalid && !flags.includes('invalid') ? [...flags, 'invalid'] : flags;
}

/**
 * 组件值变化回调（值优先；第二参数为触发变更的原生change事件，仅输入类组件提供）
 * @example <TextInput value={text} onChange={setText} />
 */
export type ChangeHandler<T = any, P = HTMLElement> = (value: T, event?: ChangeEvent<P>) => void;

/** Widget型组件组装基础类的完整入参（Widget基类与三个元素mixin的类型交集） */
type WidgetClassNameProps =
  WidgetProps &
  LabelElement &
  IconElement &
  IndicatorElement;

/** 浮层锚点/忽略目标的入参形态：ref或真实元素（均可空） */
export type ElementOrRef = RefObject<HTMLElement | null> | HTMLElement | null | undefined;

/**
 * 把ref或真实元素统一解析为HTMLElement（皆无时返回null），浮动定位与浮层关闭类组件共用。
 * `current`是ref的判别特征（RefObject与HTMLElement在类型上无法直接区分，需运行时判别）
 */
export function resolveElement(el: ElementOrRef): HTMLElement | null {
  if (el && typeof el === 'object' && 'current' in el) {
    return el.current ?? null;
  }
  return el ?? null;
}

/**
 * 相对定位可选值（对齐原版SelectWidget.findRelativeSelectableItem）：从start（不含）沿
 * offset方向移动|offset|个可选值后取该项；start不在序列内时正向自首项前、反向自末项后
 * 起步（Home/End即经此取首末项）。命中项不满足filter时沿同方向继续找（前缀跳转的过滤语义）。
 * wrap时端点环绕（最多扫一整圈即终止），否则越过端点返回undefined。
 * Select/TabSelect/RadioSelect的键盘导航与前缀跳转共用
 */
export function findRelativeSelectableItem<T extends string | number>(
  selectableValues: T[],
  start: T | undefined,
  offset: number,
  filter?: (value: T) => boolean,
  wrap = true,
): T | undefined {
  const length = selectableValues.length;
  if (!length || offset === 0) {
    return undefined;
  }
  const step = offset > 0 ? 1 : -1;
  const startIndex = start === undefined ? -1 : selectableValues.indexOf(start);
  // 起点：start在序列内自其位置起；否则取序列外一格（正向自首项前、反向自末项后）
  let index = startIndex === -1 ? (offset > 0 ? -1 : length) : startIndex;
  // 先移动|offset|个位置到达目标
  for (let i = 0; i < Math.abs(offset); i++) {
    let next = index + step;
    if (next < 0 || next >= length) {
      if (!wrap) {
        return undefined;
      }
      next = (next + length) % length;
    }
    index = next;
  }
  // 目标项不满足filter时沿同方向继续找；环绕一整圈仍未命中返回undefined
  for (let i = 0; i < length; i++) {
    const candidate = selectableValues[index];
    if (!filter || filter(candidate)) {
      return candidate;
    }
    let next = index + step;
    if (next < 0 || next >= length) {
      if (!wrap) {
        return undefined;
      }
      next = (next + length) % length;
    }
    index = next;
  }
  return undefined;
}

/** 选项集的最小结构（仅用于可选性判定与值序列派生） */
interface OptionLike {
  value?: string | number;
  disabled?: boolean;
}

/**
 * 可选项判定（带value且未禁用）：分组标题（无value）与禁用项均不可选。
 * Select/Dropdown/ComboBoxInput/RadioSelect 等经此统一口径
 */
export function isSelectableOption<O extends OptionLike>(
  option: O,
): option is O & { value: string | number } {
  return option.value !== undefined && !option.disabled;
}

/** 取选项集的可选值序列（保持展示顺序）；键盘导航、悬停高亮、选中校验与拖拽共用 */
export function getSelectableValues(options: OptionLike[]): (string | number)[] {
  const values: (string | number)[] = [];
  for (const option of options) {
    if (isSelectableOption(option)) {
      values.push(option.value);
    }
  }
  return values;
}

/**
 * 受控值非法时的回退值：值在可选值集合内则原样返回，否则取首个可选值（无可选值则undefined）。
 * 对齐原版`DropdownInput`/`RadioSelectInput`的setValue回退语义（组件始终显示合法值）
 */
export function resolveSelectableValue<T extends string | number>(
  value: T | undefined,
  selectableValues: T[],
): T | undefined {
  return value !== undefined && selectableValues.includes(value) ? value : selectableValues[0];
}

/** 选项禁用态：选项未显式声明disabled时继承组级disabled（对齐原版OptionWidget.isDisabled） */
export function resolveOptionDisabled(
  option: { disabled?: boolean },
  groupDisabled?: boolean,
): boolean | undefined {
  return option.disabled ?? groupDisabled;
}

/**
 * 可聚焦元素的tabIndex取值（对齐原版`OO.ui.mixin.TabIndexedElement.updateTabIndex`）：
 * 禁用时不参与Tab序——原版注释“Do not index over disabled elements”，即disabled覆盖显式值；
 * 启用时取显式tabIndex，缺省0（原版config.tabIndex缺省0）。
 * 原版`setTabIndex(null)`的“不输出tabindex”语义未实现（React的tabIndex类型不接受null，
 * 经rest透传会破坏DOM属性类型；需要时用-1获得同样的不可Tab聚焦效果），见docs/TODO.md
 */
export function resolveTabIndex(
  tabIndex: number | undefined,
  disabled?: boolean,
): number {
  return disabled ? -1 : (tabIndex ?? 0);
}

/** label是否实际渲染内容（`null`/`undefined`/`false`/`''`均视为无标签） */
export function hasLabel(label: unknown): boolean {
  return label !== null && label !== undefined && label !== false && label !== '';
}

/**
 * 合并aria-labelledby取值（FieldLayout联动下发的labelId与调用方透传值并列，均有时以空格
 * 分隔），全部为空时返回undefined
 */
export function mergeAriaLabelledBy(...values: (string | undefined)[]): string | undefined {
  const merged = values.filter(Boolean).join(' ');
  return merged || undefined;
}

/** 浮动定位/钳高类组件的视口四周留白缺省值（px），可经OOUIProvider.viewportSpacing覆盖；MenuSelect/Popup/PopupToolGroup共用 */
export const VIEWPORT_SPACING = 5;

/** 浮层尚未完成定位时的哨兵坐标（px）：先置于视口外，避免首帧在左上角闪现；MenuSelect/Popup/PopupToolGroup共用 */
export const OFFSCREEN_POSITION = -9999;

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
 * 临时移除类执行同步测量后恢复原状态（工具栏窄栏判定需以未压缩宽度为基准）。
 * 恢复置于finally：测量抛错也不残留临时状态
 */
export function withTemporaryClass(el: HTMLElement, className: string, measure: () => void): void {
  const hadClass = el.classList.contains(className);
  if (hadClass) {
    el.classList.remove(className);
  }
  try {
    measure();
  } finally {
    if (hadClass) {
      el.classList.add(className);
    }
  }
}

/**
 * 归一化标志参数：单个标志、标志数组与`undefined`统一为数组
 * （Button/ButtonInput/Icon/ProcessDialog的标志类生成共用）
 */
export function toFlagArray<T extends string>(flags?: T | T[]): T[] {
  return typeof flags === 'string' ? [flags] : flags ?? [];
}

/** Widget基类的类贡献：`oo-ui-widget`根类 + disabled/enabled互斥态类 */
export function widgetClasses({ disabled }: WidgetProps): string {
  return clsx('oo-ui-widget', disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled');
}

/** IconElement mixin的类贡献：icon有值时输出`oo-ui-iconElement` */
export function iconElementClasses({ icon }: IconElement): string {
  return icon ? 'oo-ui-iconElement' : '';
}

/** IndicatorElement mixin的类贡献：indicator有值时输出`oo-ui-indicatorElement` */
export function indicatorElementClasses({ indicator }: IndicatorElement): string {
  return indicator ? 'oo-ui-indicatorElement' : '';
}

/**
 * LabelElement mixin的类贡献：仅"有效可见标签"输出`oo-ui-labelElement`。
 * 对齐原版setInvisibleLabel的"视同无标签"语义（上游注释：Pretend that there is no
 * label，大量CSS基于该假设编写），故invisibleLabel时即使有label也不输出
 */
export function labelElementClasses({ label, invisibleLabel }: LabelElement): string {
  return !invisibleLabel && hasLabel(label) ? 'oo-ui-labelElement' : '';
}

/** FlaggedElement mixin的类贡献：每个flag输出`oo-ui-flaggedElement-{flag}` */
export function flaggedElementClasses(flags?: string | string[]): string {
  return clsx(toFlagArray(flags).map((flag) => `oo-ui-flaggedElement-${flag}`));
}

/** Widget型组件的名称类：`oo-ui-{name}Widget`（多个按原版继承链叠加，如input/textInput/numberInput） */
export function widgetNameClasses(...widgetNames: string[]): string {
  return clsx(widgetNames.map((widgetName) => `oo-ui-${widgetName}Widget`));
}

/**
 * 组装Widget型组件的根类。折叠自上方各mixin贡献器（对齐原版Widget+Element mixin的
 * 类派生规则），供整组类一起输出的常规场景；单独需要某个mixin的类时（如ButtonInput
 * 自组flag类）直接调用对应贡献器
 * @param props 组件属性，仅读取基础类相关字段
 * @param widgetNames 组件名，按原版继承链顺序叠加`oo-ui-{name}Widget`
 */
export function getWidgetClassName(
  { disabled, label, invisibleLabel, icon, indicator }: WidgetClassNameProps,
  ...widgetNames: string[]
): string {
  return clsx(
    widgetClasses({ disabled }),
    iconElementClasses({ icon }),
    indicatorElementClasses({ indicator }),
    labelElementClasses({ label, invisibleLabel }),
    widgetNameClasses(...widgetNames),
  );
}
