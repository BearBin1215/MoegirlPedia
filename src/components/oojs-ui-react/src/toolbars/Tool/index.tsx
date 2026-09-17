import React, {
  useContext,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import clsx from 'clsx';
import { Icon } from '../../widgets/Icon';
import { IconBase } from '../../widgets/Icon/Base';
import { Popup, type PopupProps } from '../../widgets/Popup';
import { getWidgetClassName } from '../../mixins';
import { useControlledValue, useLatestRef, usePressedState } from '../../hooks';
import { ToolbarNarrowContext, ToolbarPositionContext } from '../Toolbar';
import type { WidgetProps } from '../../widgets/Widget';

/**
 * 弹出工具的浮层配置（对齐原版OO.ui.PopupTool的`popup`配置）。
 * 显隐由"选中工具"驱动（选中即开合，浮层显隐期间工具呈激活态，对齐原版
 * onSelect与onPopupToggle），`open`/`defaultOpen`/`onOpenChange`为可选受控通道；
 * 浮层的定位与自动关闭由工具自身接管，故`container`/`autoClose`/`position`等不接受覆盖
 */
// content与HTML原生属性同名（<meta content>），须先Omit再声明为ReactNode
export interface ToolPopupProps extends
  Omit<PopupProps, 'open' | 'onClose' | 'autoClose' | 'autoCloseIgnore' | 'container' | 'position' | 'content' | 'children'> {

  /** 浮层内容 */
  content: ReactNode;

  /** 是否打开（受控，传入即受控模式） */
  open?: boolean;

  /** 非受控初始打开态 */
  defaultOpen?: boolean;

  /** 打开态变化回调（选中工具、点击外部、关闭按钮、Escape均触发） */
  onOpenChange?: (open: boolean) => void;
}

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

  /**
   * 窄栏配置（对齐原版`Tool`的`config.narrowConfig`/`static.narrowConfig`）：工具栏处于
   * 窄栏时以其**已定义**字段替换工具的`displayBothIconAndLabel`/`title`/`icon`，退出窄栏还原
   */
  narrowConfig?: {
    displayBothIconAndLabel?: boolean;
    title?: string;
    icon?: string;
  };

  /** Bar组中同时展示图标与标签（默认仅图标，无图标时仅标签） */
  displayBothIconAndLabel?: boolean;

  /** 是否禁用 */
  disabled?: boolean;

  /** 是否激活（受控；Menu组按active工具合成组标签，各组展示按压选中态样式） */
  active?: boolean;

  /** 选择回调（点击或键盘Enter/空格触发） */
  onSelect?: () => void;

  /**
   * 弹出浮层（对齐原版OO.ui.PopupTool）：存在时该工具为弹出工具，选中即开合浮层，
   * 浮层显隐期间工具呈激活态。`onSelect`仍在选中时触发（本工程保留为通用回调）
   */
  popup?: ToolPopupProps;

  /**
   * 内嵌工具组（对齐原版OO.ui.ToolGroupTool）：工具位渲染为该工具组（如`<ListToolGroup/>`），
   * 不再渲染工具链接——把手与面板由内嵌工具组自行提供，选中工具与激活态也由它内部处理
   * （故`title`/`icon`/`active`/`onSelect`对本工具不生效，原版`$link.remove()`同样如此）。
   * 以React元素而非配置对象给出：工具组可再嵌工具组，递归由React的组件树承担，
   * 无需原版`ToolGroupFactory`式的注册（本工程已舍弃工厂，见docs/TODO.md）。
   * 须传入带`tools`的工具组元素（JSX元素类型不校验具体组件）；与`popup`同时给出时本项优先
   */
  group?: ReactElement<ToolGroupBaseProps>;
}

/** 路径形式符号名的类名转换（'a/b/c'→'oo-ui-tool-name-a-b'） */
export const getToolNameClassName = (name: string): string =>
  `oo-ui-tool-name-${name.replace(/^([^/]+)\/([^/]+).*$/, '$1-$2')}`;

/**
 * 全部工具禁用时组自动禁用，驱动组容器的disabled-tools类。
 * 空组同样判为禁用——对齐原版`updateDisabled`（items为空时循环不执行，allDisabled保持true），
 * 空组另有`oo-ui-toolGroup-empty`整体隐藏（见各工具组）
 */
export const isGroupAutoDisabled = (tools: ToolProps[], disabled?: boolean): boolean =>
  !!disabled || tools.every((tool) => tool.disabled);

export interface ToolViewProps {

  tool: ToolProps;

  /** 鼠标/键盘按压中（由组级按压流驱动） */
  pressed?: boolean;

  /** 是否以tooltip形式展示标题（Bar组为true，List/Menu组为false） */
  tooltip?: boolean;

  /** 组级禁用（组disabled或全部工具禁用）下发到链接：不可Tab聚焦且aria-disabled（工具自身disabled已由tool.disabled覆盖） */
  groupDisabled?: boolean;
}

/**
 * 弹出工具的浮层（对齐原版PopupTool的PopupElement）：锚定并忽略工具元素自身
 * （原版`$floatableContainer`/`$autoCloseIgnore`均为`this.$element`），故点击工具只触发
 * 开合、不触发自动关闭；方位按工具栏位置取below/above（原版构造期按toolbar.position设置）
 */
function ToolPopupView({ config, anchorRef, open, setOpen, position, narrow }: {
  /** 浮层配置 */
  config: ToolPopupProps;
  /** 工具根元素（浮层的定位锚点与自动关闭忽略目标） */
  anchorRef: RefObject<HTMLSpanElement | null>;
  /** 当前打开态 */
  open: boolean;
  /** 切换打开态 */
  setOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  /** 工具栏位置 */
  position: 'top' | 'bottom';
  /** 工具栏窄栏态（浮层内容里的窄栏后代选择器须由本浮层承接，见下方className） */
  narrow: boolean;
}) {
  const {
    content,
    // 受控三项由ToolView消费（驱动工具激活态），不透传给Popup
    open: _open,
    defaultOpen: _defaultOpen,
    onOpenChange: _onOpenChange,
    autoFlip,
    className,
    ...popupProps
  } = config;

  return (
    <Popup
      {...popupProps}
      // 窄栏载体：原版浮层挂在$popups（带oo-ui-toolbar-narrow）内，本工程portal至body后
      // 失去该祖先，故把窄栏类落在浮层根上，使浮层内容里的窄栏后代选择器同样命中
      className={clsx('oo-ui-popupTool-popup', narrow && 'oo-ui-toolbar-narrow', className)}
      open={open}
      container={anchorRef}
      autoClose
      autoCloseIgnore={anchorRef}
      // 对齐原版构造期的setAutoFlip(false)：工具栏内浮层不随空间翻转
      autoFlip={autoFlip ?? false}
      position={position === 'bottom' ? 'above' : 'below'}
      onClose={() => setOpen(false)}
    >
      {content}
    </Popup>
  );
}

/**
 * 应用窄栏配置（对齐原版`Tool.onToolbarResize`）：窄栏时以`narrowConfig`里的已定义字段
 * 替换工具字段，退出窄栏即还原——声明式下按narrow重算即可，无需原版wide*快照回滚
 */
function applyToolNarrowConfig(tool: ToolProps, narrow: boolean): ToolProps {
  const config = narrow ? tool.narrowConfig : undefined;
  if (!config) {
    return tool;
  }
  return {
    ...tool,
    ...(config.displayBothIconAndLabel !== undefined
      && { displayBothIconAndLabel: config.displayBothIconAndLabel }),
    ...(config.title !== undefined && { title: config.title }),
    ...(config.icon !== undefined && { icon: config.icon }),
  };
}

/** 工具渲染，对齐原版Tool的DOM：span.oo-ui-tool > a.oo-ui-tool-link > checkIcon+icon+title+accel */
export function ToolView({ tool, pressed = false, tooltip = false, groupDisabled }: ToolViewProps) {
  const linkDisabled = !!tool.disabled || !!groupDisabled;
  const narrow = useContext(ToolbarNarrowContext);
  // 窄栏配置：窄栏时替换icon/title/displayBothIconAndLabel（对齐原版Tool.onToolbarResize）
  const effective = applyToolNarrowConfig(tool, narrow);
  // 工具根元素：弹出工具的浮层锚点与自动关闭忽略目标（见ToolPopupView）
  const anchorRef = useRef<HTMLSpanElement>(null);
  const { value: popupOpen, commit: setPopupOpen } = useControlledValue<boolean>(
    { value: tool.popup?.open, defaultValue: tool.popup?.defaultOpen ?? false },
    (next) => tool.popup?.onOpenChange?.(next),
  );
  const position = useContext(ToolbarPositionContext);

  // 内嵌工具组（ToolGroupTool）：工具位不渲染链接，把手与面板由内嵌工具组自行提供。
  // 禁用态取内嵌工具组（自身disabled或组内工具全禁用，对齐原版onToolGroupDisable的反向同步）
  // 与工具自身/外层组的或；反向不传导——与原版一致，工具自身的disabled不下发给内嵌工具组，
  // 需在内嵌组的元素上自行声明
  if (tool.group) {
    // 元素props为any（JSX元素类型不约束具体工具组），未给tools的元素兜底空集
    const nestedTools: ToolProps[] = tool.group.props.tools ?? [];
    const nestedDisabled = isGroupAutoDisabled(
      nestedTools,
      tool.group.props.disabled || tool.disabled || groupDisabled,
    );
    return (
      <span
        className={clsx(
          getWidgetClassName({ disabled: nestedDisabled }),
          'oo-ui-tool',
          'oo-ui-toolGroupTool',
          getToolNameClassName(tool.name),
        )}
        aria-disabled={nestedDisabled || undefined}
      >
        {tool.group}
      </span>
    );
  }

  const classes = clsx(
    getWidgetClassName({ disabled: tool.disabled, icon: effective.icon }),
    'oo-ui-tool',
    getToolNameClassName(tool.name),
    effective.icon && 'oo-ui-tool-with-icon',
    !!effective.title && effective.displayBothIconAndLabel && 'oo-ui-tool-with-label',
    // 浮层开启期间工具呈激活态（对齐原版onPopupToggle的setActive）
    (pressed || tool.active || (!!tool.popup && popupOpen)) && 'oo-ui-tool-active',
    tool.popup && 'oo-ui-popupTool',
  );

  return (
    <span className={classes} aria-disabled={tool.disabled || undefined} ref={anchorRef}>
      <a
        className='oo-ui-tool-link'
        role='button'
        tabIndex={linkDisabled ? -1 : 0}
        aria-disabled={linkDisabled || undefined}
        title={tooltip ? effective.title : undefined}
        data-tool-name={tool.name}
        // 弹出工具的开合走工具自身的点击/按键：原版onSelect即popup.toggle()，
        // 而本工程的onSelect是调用方回调，按压流不会把它转成浮层显隐
        onClick={() => {
          if (tool.popup && !linkDisabled) {
            setPopupOpen((prev) => !prev);
          }
        }}
        onKeyUp={(e) => {
          if (tool.popup && !linkDisabled && (e.key === 'Enter' || e.key === ' ')) {
            setPopupOpen((prev) => !prev);
          }
        }}
      >
        {/* checkIcon为完整IconWidget（对齐原版），工具图标为IconElement裸span */}
        <Icon icon='check' className='oo-ui-tool-checkIcon' />
        <IconBase icon={effective.icon} />
        <span className='oo-ui-tool-title'>{effective.title}</span>
        {/* 快捷键标签：原版OOUI不含快捷键系统，此为占位（getToolAccelerator缺省返回undefined） */}
        <span className='oo-ui-tool-accel' dir='ltr' lang='en' />
      </a>
      {tool.popup && (
        <ToolPopupView
          config={tool.popup}
          anchorRef={anchorRef}
          open={popupOpen}
          setOpen={setPopupOpen}
          position={position}
          narrow={narrow}
        />
      )}
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
