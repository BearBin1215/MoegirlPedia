export interface ElementRef<T = HTMLElement> {
  element: T;
}

export interface InputWidgetRef<T = HTMLInputElement, P = any> extends ElementRef<T> {
  getValue: () => P;
}

export interface SelectWidgetRef extends ElementRef {
  isSelected: () => boolean;
}
