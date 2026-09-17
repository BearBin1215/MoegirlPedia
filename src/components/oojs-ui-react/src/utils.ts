import type { ChangeEvent, RefObject } from 'react';

/**
 * 与具体mixin无关的共享工具：选择集的判定与派生（对齐原版SelectWidget/ItemWidget的方法）、
 * DOM与浮层通用工具（对齐原版Element.static与FloatableElement/ClippableElement的辅助逻辑）、
 * 以及跨组件共用的常量。
 * 对齐原版OO.ui.mixin的类名贡献与元素级状态解析见src/mixins.ts，契约类型见src/Element.ts
 */

/**
 * 组件值变化回调（值优先；第二参数为触发变更的原生change事件，仅输入类组件提供）
 * @example <TextInput value={text} onChange={setText} />
 */
export type ChangeHandler<T = any, P = HTMLElement> = (value: T, event?: ChangeEvent<P>) => void;

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

/**
 * 选项禁用态：组禁用时选项一律禁用，否则取选项自身的disabled
 * （对齐原版ItemWidget.isDisabled的`this.disabled || group.isDisabled()`——组禁用优先，
 * 选项无法在禁用组内单独启用）
 */
export function resolveOptionDisabled(
  option: { disabled?: boolean },
  groupDisabled?: boolean,
): boolean | undefined {
  return option.disabled || groupDisabled;
}

/** 浮动定位/钳高类组件的视口四周留白缺省值（px），可经OOUIProvider.viewportSpacing覆盖；MenuSelect/Popup/PopupToolGroup共用 */
export const VIEWPORT_SPACING = 5;

/** 浮层尚未完成定位时的哨兵坐标（px）：先置于视口外，避免首帧在左上角闪现；MenuSelect/Popup/PopupToolGroup共用 */
export const OFFSCREEN_POSITION = -9999;

/**
 * 就近可滚动容器（对齐原版`getClosestScrollableElementContainer`的简化版），无则回退根元素。
 * 浮层的裁剪/钳高与滚出判定以此为可视区，视口即根元素
 */
export function findScrollableContainer(el: HTMLElement | null): HTMLElement {
  let current = el?.parentElement ?? null;
  while (current && current !== document.body) {
    const style = getComputedStyle(current);
    if (/(auto|scroll|overlay)/.test(style.overflowY) || /(auto|scroll|overlay)/.test(style.overflowX)) {
      return current;
    }
    current = current.parentElement;
  }
  return document.documentElement;
}

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
