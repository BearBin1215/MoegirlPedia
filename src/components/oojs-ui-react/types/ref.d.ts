export interface ElementRef<T = HTMLElement> {
  element: T | null;
}

export interface InputWidgetRef<T = HTMLDivElement, P = any> extends ElementRef<T> {
  /** 读取输入值 */
  getValue: () => P;
  /** 设置值 */
  setValue: (value: P) => void;
}

export interface SelectWidgetRef<T = HTMLDivElement> extends ElementRef<T> {
  /** 是否已选中 */
  isSelected: () => boolean;
  /** 设置是否选中 */
  setSelected: (selected: boolean) => void;
}
