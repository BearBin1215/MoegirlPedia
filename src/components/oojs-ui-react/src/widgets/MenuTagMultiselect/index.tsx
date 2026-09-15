import React, { forwardRef } from 'react';
import {
  TagMultiselect,
  type TagMultiselectProps,
  type TagOptionProps,
} from '../TagMultiselect';

export type MenuTagMultiselectOptionProps = TagOptionProps;

export interface MenuTagMultiselectProps
  extends Omit<TagMultiselectProps, 'options' | 'clearInputOnChoose'> {
  /** 菜单选项集（必填：带候选菜单即本组件与TagMultiselect的区别） */
  options: TagOptionProps[];

  /**
   * 选定菜单项后是否清空输入框的过滤文本
   * @default true
   */
  clearInputOnChoose?: boolean;
}

/**
 * 带菜单的标签多选组件，对齐原版OO.ui.MenuTagMultiselectWidget：在TagMultiselect上预设候选菜单
 * （`options`必填）——输入即过滤菜单、↑↓移动高亮、Enter选定高亮项、点击切换标签；
 * 已添加标签对应的菜单项呈选中态，移除标签同步取消选中。未开启`allowArbitrary`时，
 * 菜单选项构成标签的合法值域（对齐原版getAllowedValues的菜单数据合并）。
 * 与`OutlineSelect`之于`Select`同构：具名组件锁定基础组件的组合通道
 */
export const MenuTagMultiselect = forwardRef<HTMLDivElement, MenuTagMultiselectProps>((props, ref) => (
  <TagMultiselect {...props} ref={ref} />
));

MenuTagMultiselect.displayName = 'MenuTagMultiselect';
