import type { WidgetProps } from '../Widget';
import type { AccessKeyedElement, ChangeHandler } from '../../utils';

/**
 * 输入类组件基础参数（对齐原版抽象基类InputWidget，仅类型，无对应渲染组件）
 * @template T 输入值类型
 * @template P 输入框类型
 * @template S 组件最外层元素类型
 */
export interface InputProps<T extends string | number | boolean | undefined, P = HTMLInputElement, S = P> extends
  Omit<WidgetProps<S>, 'children'>,
  AccessKeyedElement {

  /** input元素name属性 */
  name?: string;

  /** 输入提示 */
  placeholder?: string;

  /** 值变化回调函数 */
  onChange?: ChangeHandler<T, P>;

  /** 是否必填 */
  required?: boolean;

  /** 输入框值（受控，传入即受控模式） */
  value?: T;

  /** 非受控初始值（不传value时生效） */
  defaultValue?: T;
}
