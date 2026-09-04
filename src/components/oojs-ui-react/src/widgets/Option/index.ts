import type { ReactNode } from 'react';
import type { WidgetProps } from '../Widget';
import type { AccessKeyedElement } from '../../utils';

/** 选项数据（对齐原版OptionWidget的config，供options prop传入） */
export interface OptionData {
  /**
   * 选项值，同时作为选中态匹配依据与列表key
   * （原版OptionWidget的`data`配置；按React惯例命名value，不支持object类型）
   */
  value: string | number;

  /** 选项文本 */
  children?: ReactNode;
}

/**
 * 基础选项参数（对齐原版抽象基类OptionWidget，具体渲染由MenuOption/OutlineOption/TabOption等实现）
 * 选中/高亮态由Select系父组件根据value派生后传入，不在options数据中声明
 */
export type OptionProps<T = HTMLDivElement> =
  WidgetProps<T> &
  AccessKeyedElement &
  OptionData & {
    /** 是否为已选中项 */
    selected?: boolean;

    /** 是否为键盘导航高亮项 */
    highlighted?: boolean;
  };
