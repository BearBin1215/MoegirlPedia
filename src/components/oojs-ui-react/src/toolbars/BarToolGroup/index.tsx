import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { generateWidgetClassName } from '../../utils';
import {
  ToolView,
  getToolHoverHandlers,
  isGroupAutoDisabled,
  useToolGroupPressed,
  type ToolGroupBaseProps,
} from '../Tool';

export type BarToolGroupProps = ToolGroupBaseProps;

/**
 * 平铺工具组，对齐原版OO.ui.BarToolGroup：工具以图标按钮横向平铺，
 * 标题以tooltip展示（titleTooltips/accelTooltips为true）
 */
const BarToolGroup = forwardRef<HTMLDivElement, BarToolGroupProps>(({
  tools,
  className,
  disabled,
  // align由Toolbar读取后决定挂载位置，本体不渲染，解构掉避免落成DOM属性
  align: _align,
  ...rest
}, ref) => {
  const groupDisabled = isGroupAutoDisabled(tools, disabled);
  const { pressedName, onMouseKeyDown, onToolKeyDown, onToolHoverChange, findTool } = useToolGroupPressed(tools, groupDisabled);

  // 对齐原版isDisabled：全部工具禁用时组自动禁用，root类与aria随之切换
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled: groupDisabled }),
    'oo-ui-toolGroup',
    'oo-ui-barToolGroup',
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={groupDisabled || undefined}
      ref={ref}
    >
      <div
        className={clsx(
          'oo-ui-toolGroup-tools',
          'oo-ui-barToolGroup-tools',
          groupDisabled ? 'oo-ui-toolGroup-disabled-tools' : 'oo-ui-toolGroup-enabled-tools',
        )}
        onMouseDown={onMouseKeyDown}
        onKeyDown={(e) => {
          const tool = findTool(e.target);
          if (tool) {
            onToolKeyDown(e, tool);
          }
        }}
        {...getToolHoverHandlers(onToolHoverChange)}
      >
        {tools.map((tool) => (
          <ToolView key={tool.name} tool={tool} pressed={pressedName === tool.name} tooltip groupDisabled={groupDisabled} />
        ))}
      </div>
    </div>
  );
});

BarToolGroup.displayName = 'BarToolGroup';

export default BarToolGroup;
