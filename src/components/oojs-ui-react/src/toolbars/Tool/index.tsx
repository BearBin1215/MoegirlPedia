import React, {
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import clsx from 'clsx';
import { Icon } from '../../widgets/Icon';
import { IconBase } from '../../widgets/Icon/Base';
import { getWidgetClassName } from '../../utils';
import { useLatestRef, usePressedState } from '../../hooks';
import type { WidgetProps } from '../../widgets/Widget';

/**
 * 工具定义（对齐原版Tool的static属性，声明式传入ToolGroup）。
 * 原版的Tool为类+工厂注册模式，本工程改为纯数据props，激活态由调用方受控
 */
export interface ToolProps {

  /** 符号名，生成oo-ui-tool-name-{name}类（路径形式取前两段，如'a/b/c'→'oo-ui-tool-name-a-b'） */
  name: string;

  /** 工具标题：Bar组为tooltip，List/Menu组为标签文本 */
  title: string;

  /** 工具图标 */
  icon?: string;

  /** Bar组中同时展示图标与标签（默认仅图标，无图标时仅标签） */
  displayBothIconAndLabel?: boolean;

  /** 是否禁用 */
  disabled?: boolean;

  /** 是否激活（受控；Menu组按active工具合成组标签，各组展示按压选中态样式） */
  active?: boolean;

  /** 选择回调（点击或键盘Enter/空格触发） */
  onSelect?: () => void;
}

/** 路径形式符号名的类名转换（'a/b/c'→'oo-ui-tool-name-a-b'） */
export const getToolNameClassName = (name: string): string =>
  `oo-ui-tool-name-${name.replace(/^([^/]+)\/([^/]+).*$/, '$1-$2')}`;

export interface ToolViewProps {

  tool: ToolProps;

  /** 鼠标/键盘按压中（由组级按压流驱动） */
  pressed?: boolean;

  /** 是否以tooltip形式展示标题（Bar组为true，List/Menu组为false） */
  tooltip?: boolean;

  /** 组级禁用（组disabled或全部工具禁用）下发到链接：不可Tab聚焦且aria-disabled（工具自身disabled已由tool.disabled覆盖） */
  groupDisabled?: boolean;
}

/** 工具渲染，对齐原版Tool的DOM：span.oo-ui-tool > a.oo-ui-tool-link > checkIcon+icon+title+accel */
export function ToolView({ tool, pressed = false, tooltip = false, groupDisabled }: ToolViewProps) {
  const linkDisabled = !!tool.disabled || !!groupDisabled;
  const classes = clsx(
    getWidgetClassName({ disabled: tool.disabled, icon: tool.icon }),
    'oo-ui-tool',
    getToolNameClassName(tool.name),
    tool.icon && 'oo-ui-tool-with-icon',
    !!tool.title && tool.displayBothIconAndLabel && 'oo-ui-tool-with-label',
    (pressed || tool.active) && 'oo-ui-tool-active',
  );

  return (
    <span className={classes} aria-disabled={tool.disabled || undefined}>
      <a
        className='oo-ui-tool-link'
        role='button'
        tabIndex={linkDisabled ? -1 : 0}
        aria-disabled={linkDisabled || undefined}
        title={tooltip ? tool.title : undefined}
        data-tool-name={tool.name}
      >
        {/* checkIcon为完整IconWidget（对齐原版），工具图标为IconElement裸span */}
        <Icon icon='check' className='oo-ui-tool-checkIcon' />
        <IconBase icon={tool.icon} />
        <span className='oo-ui-tool-title'>{tool.title}</span>
        {/* 快捷键标签：原版OOUI不含快捷键系统，此为占位（getToolAccelerator缺省返回undefined） */}
        <span className='oo-ui-tool-accel' dir='ltr' lang='en' />
      </a>
    </span>
  );
}

/**
 * 组级按压流，对齐原版ToolGroup.onMouseKeyDown/onDocumentMouseKeyUp：
 * 左键在可用工具上按下进入按压态（oo-ui-tool-active），松开仍落在发起工具上时触发onSelect；
 * 工具链接的keydown/keyup（Enter/空格）同流程。按压流的进入/复位/document级监听由
 * usePressedState统一承担，本hook仅补充工具组的按压目标解析与视觉抑制
 */
export function useToolGroupPressed(tools: ToolProps[], disabled?: boolean) {
  // 工具集经ref读取最新：mousedown→mouseup期间props更新（active/onSelect变化）后
  // 仍取新值，对齐原版经实例属性（this.pressed等）的活引用，避免闭包捕获渲染时的过期tools
  const toolsRef = useLatestRef(tools);
  // 按压视觉是否已被指针/焦点移出抑制（对齐原版onMouseOutBlur：仅清除视觉，不结束按压流，
  // 移回同一工具或在其上松开仍会触发选择）
  const [pressedBlurred, setPressedBlurred] = useState(false);

  /** 从事件目标解析工具符号名（经`[data-tool-name]`就近向上匹配） */
  const findToolName = (node: EventTarget | null): string | null => {
    if (!(node instanceof Element)) {
      return null;
    }
    const link = node.closest('[data-tool-name]');
    return link?.getAttribute('data-tool-name') ?? null;
  };

  /** 从事件目标反查所属工具（读最新tools） */
  const findTool = (node: EventTarget | null): ToolProps | null => {
    const name = findToolName(node);
    return name ? toolsRef.current.find((tool) => tool.name === name) ?? null : null;
  };

  const {
    pressedTarget,
    onMouseDown,
    onKeyDown,
  } = usePressedState<string>({
    disabled,
    resolveTarget: findToolName,
    canPress: (name) => {
      const tool = toolsRef.current.find((item) => item.name === name);
      return !!tool && !tool.disabled;
    },
    onTrigger: (name) => {
      // 经toolsRef取最新工具集，onSelect使用props更新后的新引用
      toolsRef.current.find((item) => item.name === name)?.onSelect?.();
    },
    // 对齐原版onMouseKeyDown返回false：阻止默认（拖动选中文本/焦点转移）
    preventDefaultOnPress: true,
  });

  /**
   * 指针/焦点进出工具时切换按压视觉（对齐原版onMouseOverFocus/onMouseOutBlur）：
   * 仅作用于当前按压中的工具，`over`为进入与否
   */
  const onToolHoverChange = (node: EventTarget | null, over: boolean) => {
    const tool = findTool(node);
    if (tool && tool.name === pressedTarget) {
      setPressedBlurred(!over);
    }
  };

  // 按压开始时清除上一流残留的视觉抑制；按压被拒绝（非工具/禁用工具）时清除无副作用
  // （抑制态仅在按压中可见，此时pressedTarget为null）
  const onMouseKeyDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    setPressedBlurred(false);
    onMouseDown(e);
  };

  const onToolKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    setPressedBlurred(false);
    onKeyDown(e);
  };

  // 按压视觉名：被移出抑制时不上报按压态，使组件的pressed类随之清除
  return { pressedName: pressedBlurred ? null : pressedTarget, onMouseKeyDown, onToolKeyDown, onToolHoverChange };
}

/**
 * 组容器上委托的指针/焦点进出处理器（对齐原版ToolGroup把focus/blur/mouseover/mouseout
 * 一并绑定在$group上）。经事件委托识别工具，Bar/Popup两组共用
 */
export function getToolHoverHandlers(
  onToolHoverChange: (node: EventTarget | null, over: boolean) => void,
) {
  return {
    onMouseOver: (e: React.MouseEvent<HTMLDivElement>) => onToolHoverChange(e.target, true),
    onMouseOut: (e: React.MouseEvent<HTMLDivElement>) => onToolHoverChange(e.target, false),
    onFocus: (e: React.FocusEvent<HTMLDivElement>) => onToolHoverChange(e.target, true),
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => onToolHoverChange(e.target, false),
  };
}

/** 工具组通用包装参数 */
export interface ToolGroupBaseProps extends Omit<WidgetProps<HTMLDivElement>, 'children'> {

  /** 工具集 */
  tools: ToolProps[];

  /**
   * 工具组位置：`before`按声明顺序排在工具栏左侧，`after`排到右侧的
   * `oo-ui-toolbar-after`容器。对齐原版ToolGroup的`align`配置
   * @default 'before'
   */
  align?: 'before' | 'after';
}

/** 全部工具禁用时组自动禁用，驱动组容器的disabled-tools类 */
export const isGroupAutoDisabled = (tools: ToolProps[], disabled?: boolean): boolean =>
  !!disabled || (tools.length > 0 && tools.every((tool) => tool.disabled));
