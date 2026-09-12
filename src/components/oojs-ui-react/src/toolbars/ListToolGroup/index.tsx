import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { PopupToolGroupBase, type PopupToolGroupBaseProps } from '../PopupToolGroup';
import { useControlledValue } from '../../hooks';
import { useMessage } from '../../config';
import type { ToolProps } from '../Tool';

export interface ListToolGroupProps extends Omit<PopupToolGroupBaseProps, 'tools' | 'keepOpenToolNames'> {

  tools: ToolProps[];

  /**
   * 允许折叠的工具符号名（折叠工具仅展开后可见，面板尾部出现More/Fewer切换项）
   */
  allowCollapse?: string[];

  /** 强制展开的工具符号名（未列出的工具均可折叠） */
  forceExpand?: string[];

  /** 展开态（受控，传入即受控模式，外部可重置） */
  expanded?: boolean;

  /** 非受控初始展开态（存在可折叠工具时生效） */
  defaultExpanded?: boolean;
}

/** 面板尾部展开/折叠切换项的符号名 */
const EXPAND_COLLAPSE_TOOL_NAME = 'more-fewer';

/**
 * 列表工具组，对齐原版OO.ui.ListToolGroup：工具以标签文本纵向列表收进下拉面板，
 * 尾部可出现More/Fewer切换项控制可折叠工具的显隐（选中该项不收起面板）
 */
const ListToolGroup = forwardRef<HTMLDivElement, ListToolGroupProps>(({
  tools,
  allowCollapse,
  forceExpand,
  expanded: expandedProp,
  defaultExpanded = false,
  toolsClassName,
  className,
  ...rest
}, ref) => {
  // 展开态：受控/非受控统一（受控时外部可重置），defaultExpanded作非受控初值
  const { value: expanded, commit: commitExpanded } = useControlledValue<boolean>(
    { value: expandedProp, defaultValue: defaultExpanded },
  );

  // 可折叠工具集合：优先allowCollapse；给出forceExpand时其余均可折叠。
  // 名单与实际tools取交集（对齐原版populate的collapsibleTools过滤，无效名不产生More/Fewer项）
  const toolNames = tools.map((tool) => tool.name);
  let requestedCollapsible: string[] = [];
  if (allowCollapse !== undefined) {
    requestedCollapsible = allowCollapse;
  } else if (forceExpand !== undefined) {
    requestedCollapsible = toolNames.filter((name) => !forceExpand.includes(name));
  }
  const collapsibleNames = requestedCollapsible.filter((name) => toolNames.includes(name));

  const visibleTools = tools.filter((tool) => !collapsibleNames.includes(tool.name) || expanded);

  // 缺省标题经useMessage读取（对齐原版ooui-toolgroup-expand/collapse消息）
  const expandLabel = useMessage('ooui-toolgroup-expand');
  const collapseLabel = useMessage('ooui-toolgroup-collapse');
  const extraTools: ToolProps[] = collapsibleNames.length > 0
    ? [{
      name: EXPAND_COLLAPSE_TOOL_NAME,
      title: expanded ? collapseLabel : expandLabel,
      icon: expanded ? 'collapse' : 'expand',
      onSelect: () => commitExpanded((prev) => !prev),
    }]
    : [];

  return (
    <PopupToolGroupBase
      {...rest}
      ref={ref}
      tools={[...visibleTools, ...extraTools]}
      keepOpenToolNames={[EXPAND_COLLAPSE_TOOL_NAME]}
      toolsClassName={clsx('oo-ui-listToolGroup-tools', toolsClassName)}
      className={clsx(className, 'oo-ui-listToolGroup')}
    />
  );
});

ListToolGroup.displayName = 'ListToolGroup';

export default ListToolGroup;
