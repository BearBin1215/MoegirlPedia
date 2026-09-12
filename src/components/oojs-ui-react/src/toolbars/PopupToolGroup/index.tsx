import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IconBase } from '../../widgets/Icon/Base';
import { IndicatorBase, type Indicators } from '../../widgets/Indicator/Base';
import { LabelBase } from '../../widgets/Label/Base';
import { generateWidgetClassName } from '../../utils';
import { useAnchoredPanelLayout, useDismissablePopover, useMergedRefs } from '../../hooks';
import { usePortalContainer } from '../../config';
import { ToolbarNarrowContext, ToolbarPositionContext } from '../Toolbar';
import {
  ToolView,
  getToolHoverHandlers,
  isGroupAutoDisabled,
  useToolGroupPressed,
  type ToolGroupBaseProps,
  type ToolProps,
} from '../Tool';

/** keepOpenToolNames的缺省空数组（模块级常量，避免每渲染新建字面量使useMemo失效） */
const NO_KEEP_OPEN_TOOLS: string[] = [];

export interface PopupToolGroupBaseProps extends ToolGroupBaseProps {

  /** 把手标签 */
  label?: React.ReactNode;

  /** 把手图标 */
  icon?: string;

  /** 把手指示器（缺省随工具栏位置翻转：bottom时up、其余down） */
  indicator?: Indicators;

  /** 把手tooltip */
  title?: string;

  /** 面板顶部说明文字 */
  header?: string;

  /** 选中这些符号名的工具后不收起面板（List组的more-fewer工具） */
  keepOpenToolNames?: string[];

  /** 工具容器附加类（oo-ui-listToolGroup-tools等，供CSS定制外观） */
  toolsClassName?: string;

  /** 工具选择回调 */
  onToolSelect?: (tool: ToolProps) => void;
}

/**
 * 弹出工具组基类（对齐原版OO.ui.PopupToolGroup，List/Menu组的公共实现，不对外导出）：
 * 把手（图标+标签+指示器）点击开合工具面板，面板portal至body定位在把手正下方
 * （原版FloatableElement会按左右空间选择对齐侧，此处简化为左对齐，见TODO），
 * 视口下方空间不足时钳高内部滚动；点击面板与把手之外或选中工具（keepOpenToolNames除外）收起
 */
export const PopupToolGroupBase = forwardRef<HTMLDivElement, PopupToolGroupBaseProps>(({
  tools,
  label,
  icon,
  indicator,
  title,
  header,
  keepOpenToolNames = NO_KEEP_OPEN_TOOLS,
  toolsClassName,
  className,
  disabled,
  // align由Toolbar读取后决定挂载位置，本体不渲染，解构掉避免落成DOM属性
  align: _align,
  onToolSelect,
  ...rest
}, ref) => {
  const [open, setOpen] = useState(false);
  // 工具栏位置：bottom时面板向上展开
  const position = useContext(ToolbarPositionContext);
  // 工具栏窄栏态：面板内工具链接的窄栏样式为后代选择器（原版setNarrow同步到$popups），
  // portal至body的面板经窄栏载体承接（对齐原版$popups.toggleClass）
  const narrow = useContext(ToolbarNarrowContext);
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);
  const handleRef = useRef<HTMLSpanElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const groupDisabled = isGroupAutoDisabled(tools, disabled);
  const effectiveIndicator = indicator ?? (position === 'bottom' ? 'up' : 'down');

  /** 工具选中后收起面板（keepOpenToolNames除外），并转发onSelect */
  const wrappedTools = useMemo(() => tools.map((tool) => ({
    ...tool,
    onSelect: () => {
      tool.onSelect?.();
      onToolSelect?.(tool);
      if (!keepOpenToolNames.includes(tool.name)) {
        setOpen(false);
      }
    },
  })), [tools, onToolSelect, keepOpenToolNames]);
  const { pressedName, onMouseKeyDown, onToolKeyDown, onToolHoverChange, findTool } = useToolGroupPressed(wrappedTools, groupDisabled);

  // 定位与钳高（open/tools变化与滚动/缩放时重算）：bottom工具栏的面板向上展开
  // （对齐原版verticalPosition:'above'），其余向下；面板portal至body（或Provider配置的
  // 容器，锚点为把手），经页面坐标定位
  const getPortalContainer = usePortalContainer();
  const portalTarget = getPortalContainer(handleRef.current);
  const layout = useAnchoredPanelLayout({
    open,
    anchor: handleRef,
    panelRef: toolsRef,
    position: position === 'bottom' ? 'above' : 'below',
    // tools入依赖：ListToolGroup经More/Fewer增减工具后面板高度变化需重新钳高
    recomputeKey: tools,
  });

  // 对齐原版setDisabled：禁用时收起面板
  useEffect(() => {
    if (groupDisabled && open) {
      setOpen(false);
    }
  }, [groupDisabled, open]);

  // 点击面板与把手之外、或按Escape时收起（Escape捕获阶段处理，嵌套于Dialog时不误关弹窗）
  useDismissablePopover({
    enabled: open,
    onClose: () => setOpen(false),
    ignore: [rootRef, toolsRef],
  });

  /** 面板内可聚焦工具链接（禁用工具链接tabIndex=-1已被排除） */
  const getPanelFocusables = (): HTMLElement[] =>
    Array.from(toolsRef.current?.querySelectorAll<HTMLElement>('a.oo-ui-tool-link') ?? [])
      .filter((el) => el.tabIndex >= 0);

  const handleHandleKeyDown = (e: ReactKeyboardEvent<HTMLSpanElement>) => {
    if (groupDisabled) {
      return;
    }
    // 对齐原版onHandleMouseKeyDown：面板开启时Tab跳到面板内首个可聚焦工具
    if (e.key === 'Tab' && !e.shiftKey && open) {
      const first = getPanelFocusables()[0];
      if (first) {
        e.preventDefault();
        first.focus();
        return;
      }
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  };

  // 对齐原版isDisabled：全部工具禁用时组自动禁用，root类与aria随之切换
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled: groupDisabled, icon, indicator: effectiveIndicator, label }),
    'oo-ui-toolGroup',
    'oo-ui-popupToolGroup',
    open && 'oo-ui-popupToolGroup-active',
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={groupDisabled || undefined}
      ref={mergedRef}
    >
      <span
        ref={handleRef}
        className='oo-ui-popupToolGroup-handle'
        role='button'
        aria-expanded={open}
        aria-disabled={groupDisabled || undefined}
        tabIndex={groupDisabled ? -1 : 0}
        title={title}
        onClick={() => {
          if (!groupDisabled) {
            setOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleHandleKeyDown}
      >
        <IconBase icon={icon} />
        <LabelBase>{label}</LabelBase>
        <IndicatorBase indicator={effectiveIndicator} />
      </span>
      {createPortal(
        // 窄栏载体：对齐原版$popups容器（携带oo-ui-toolbar-narrow供面板内后代选择器命中）；
        // 不携带oo-ui-toolbar-popups类——其position:absolute会成为面板的定位上下文，
        // 而本实现面板按页面坐标定位于body
        <div className={clsx(narrow && 'oo-ui-toolbar-narrow')}>
          <div
            ref={toolsRef}
            // dir取把手有效方向（RTL站点/Provider.dir配置下面板文本方向正确）
            dir={layout?.dir}
            className={clsx(
              'oo-ui-toolGroup-tools',
              'oo-ui-popupToolGroup-tools',
              toolsClassName,
              groupDisabled ? 'oo-ui-toolGroup-disabled-tools' : 'oo-ui-toolGroup-enabled-tools',
              open && 'oo-ui-popupToolGroup-active-tools',
              !open && 'oo-ui-element-hidden',
            )}
            onMouseDown={onMouseKeyDown}
            // 面板自首帧即为绝对定位（定位前置于视口外）：若首帧参与body常规流会撑高文档、
            // 引发布局回流导致锚点位移，使定位读到过期坐标而左右错位
            style={{
              position: 'absolute',
              top: layout?.top ?? -9999,
              left: layout?.left ?? -9999,
              maxHeight: layout?.maxHeight,
              overflowY: layout?.maxHeight !== undefined ? 'auto' : undefined,
            }}
            onKeyDown={(e) => {
              // 对齐原版onMouseKeyDown的Tab流转：首项Shift+Tab回把手；末项Tab回把手并收起
              // （末项不preventDefault：焦点已移至把手，浏览器默认Tab自把手继续）
              if (e.key === 'Tab') {
                const focusables = getPanelFocusables();
                const index = focusables.indexOf(e.target as HTMLElement);
                if (index !== -1) {
                  if (e.shiftKey && index === 0) {
                    e.preventDefault();
                    handleRef.current?.focus();
                    return;
                  }
                  if (!e.shiftKey && index === focusables.length - 1) {
                    handleRef.current?.focus();
                    setOpen(false);
                  }
                }
              }
              const tool = findTool(e.target);
              if (tool) {
                onToolKeyDown(e, tool);
              }
            }}
            {...getToolHoverHandlers(onToolHoverChange)}
          >
            {header && <span className='oo-ui-popupToolGroup-header'>{header}</span>}
            {wrappedTools.map((tool) => (
              <ToolView key={tool.name} tool={tool} pressed={pressedName === tool.name} groupDisabled={groupDisabled} />
            ))}
          </div>
        </div>,
        portalTarget,
      )}
    </div>
  );
});

PopupToolGroupBase.displayName = 'PopupToolGroupBase';
