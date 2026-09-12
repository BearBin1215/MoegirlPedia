import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { PopupToolGroupBase, type PopupToolGroupBaseProps } from '../PopupToolGroup';

export type MenuToolGroupProps = PopupToolGroupBaseProps;

/**
 * 菜单工具组，对齐原版OO.ui.MenuToolGroup：工具以标签横向排布收进下拉面板，
 * 组把手标签按激活工具的标题合成（无激活工具时为空白占位，对齐原版onUpdateState）
 */
export const MenuToolGroup = forwardRef<HTMLDivElement, MenuToolGroupProps>(({
  tools,
  label,
  toolsClassName,
  className,
  ...rest
}, ref) => {
  // 标签按激活工具合成（原版由toolbar的updateState事件驱动，此处由active props派生）
  const activeTitles = tools.filter((tool) => tool.active).map((tool) => tool.title);
  const groupLabel = activeTitles.length > 0 ? activeTitles.join(', ') : label;

  return (
    <PopupToolGroupBase
      {...rest}
      ref={ref}
      tools={tools}
      label={groupLabel}
      toolsClassName={clsx('oo-ui-menuToolGroup-tools', toolsClassName)}
      className={clsx(className, 'oo-ui-menuToolGroup')}
    />
  );
});

MenuToolGroup.displayName = 'MenuToolGroup';

