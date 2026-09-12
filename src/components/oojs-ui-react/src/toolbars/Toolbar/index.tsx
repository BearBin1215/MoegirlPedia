import React, {
  Children,
  createContext,
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import clsx from 'clsx';
import { useMergedRefs } from '../../hooks';
import type { ElementProps } from '../../Element';
import type { ToolGroupBaseProps } from '../Tool';

export interface ToolbarProps extends ElementProps<HTMLDivElement> {

  /** 工具组集合（BarToolGroup/ListToolGroup/MenuToolGroup） */
  children?: ReactNode;

  /**
   * 工具栏位置，影响弹出面板的展开方向与类名
   * @default 'top'
   */
  position?: 'top' | 'bottom';

  /** 动作区内容（渲染在工具组之后右侧的oo-ui-toolbar-actions区） */
  actions?: ReactNode;
}

/**
 * 工具栏位置上下文：经Toolbar统一下发给工具组（对齐原版工具组经this.toolbar
 * 读取position决定弹出面板展开方向），使用方无需向各工具组显式传position。
 * 内部实现，不进入公共导出面
 */
export const ToolbarPositionContext = createContext<'top' | 'bottom'>('top');

/**
 * 工具栏窄栏状态上下文：portal至body的工具组面板无法从Toolbar根继承
 * oo-ui-toolbar-narrow（原版setNarrow同步到$popups容器，面板内工具链接的
 * 窄栏样式均为后代选择器），经此下发到面板的窄栏载体。内部实现，不进入公共导出面
 */
export const ToolbarNarrowContext = createContext(false);

/**
 * 工具栏，对齐原版OO.ui.Toolbar：横栏容器承载各工具组。原版通过ToolFactory/ToolGroupFactory
 * 注册类并以include/exclude/promote/demote配置组装，本工程按声明式惯例改为直接传入
 * 工具组组件（工具为纯数据props）。窄栏模式的oo-ui-toolbar-narrow类对齐原版，
 * 窄栏下切换把手标签/图标（narrowConfig）未实现，见docs/TODO.md
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(({
  children,
  position = 'top',
  actions,
  className,
  ...rest
}, ref) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(rootRef, ref);
  const barRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  // 窄栏判定经state参与className（对齐原版onWindowResize加/移除oo-ui-toolbar-narrow）：
  // classList单改会被下一次受控className覆盖（className/position变化而children引用稳定时丢失），
  // state才是权威源；measure()内临时remove/add与setNarrow同源，仅用于取未压缩宽度
  const [narrow, setNarrow] = useState(false);
  const rafRef = useRef(0);

  /** 对齐原版onPointerDown（原版mousedown/keydown共用同一handler）：事件目标不在任何子
   * .oo-ui-widget内（点在工具栏空白处）或与工具栏自身同属一个widget时，返回false等效的
   * preventDefault+stopPropagation */
  const handlePointerDown = (ev: SyntheticEvent) => {
    const target = ev.target;
    if (!(target instanceof Element)) {
      return;
    }
    const closestWidget = target.closest('.oo-ui-widget');
    const ownWidget = rootRef.current?.closest('.oo-ui-widget') ?? null;
    if (!closestWidget || closestWidget === ownWidget) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  };

  useEffect(() => {
    // 窄栏判定：栏宽不足以容纳内容总宽时进入窄栏（bar.clientWidth <= contentWidth）
    const measure = () => {
      const bar = barRef.current;
      const root = rootRef.current;
      if (!bar || !root) {
        return;
      }
      // narrow类会压缩工具组宽度（主题CSS有多处.narrow规则），以压缩后宽度为基准会
      // 误判（判定撤销→内容恢复自然宽度溢出→bar宽度未变、RO不回调→状态长期错误）。
      // 测量前临时移除该类取自然宽度，判定后按结果恢复——对齐原版getNarrowThreshold
      // 惰性缓存「未压缩内容宽度」的基准语义，且能感知工具组增减（移除/恢复在同一
      // 同步块内，paint不发生于中间，无闪烁）
      root.classList.remove('oo-ui-toolbar-narrow');
      const contentWidth = (toolsRef.current?.offsetWidth ?? 0) +
        (afterRef.current?.offsetWidth ?? 0) +
        (actionsRef.current?.offsetWidth ?? 0);
      const next = bar.clientWidth <= contentWidth;
      if (next) {
        root.classList.add('oo-ui-toolbar-narrow');
      }
      setNarrow(next);
    };
    measure();
    // RO回调内经rAF排队测量：measure会改narrow类引发布局变化，同步执行在RO回调内
    // 会触发"ResizeObserver loop"错误通知；rAF将其移出RO交付周期，且天然按帧合并
    const scheduleMeasure = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };
    // 栏宽变化由RO(bar)承接；内容宽度变化（工具组/动作区增减、文本更新）由
    // MutationObserver承接——tools容器为display:inline不可被RO观察，而childList/
    // characterData变化正是窄栏判定内容项的真实变化源，也免去children引用入deps
    // 导致的每渲染强制布局。measure仅切换根上narrow类（attribute变化），不会反过来
    // 触发本观察器，无观察循环
    const observer = new ResizeObserver(scheduleMeasure);
    const contentObserver = new MutationObserver(scheduleMeasure);
    if (barRef.current) {
      observer.observe(barRef.current);
    }
    for (const el of [toolsRef.current, afterRef.current, actionsRef.current]) {
      if (el) {
        contentObserver.observe(el, { childList: true, characterData: true, subtree: true });
      }
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      contentObserver.disconnect();
    };
    // children每渲染新引用故不入deps（内容变化由MutationObserver承接）；
    // actions挂卸需重观察（条件渲染）；position/className变化亦重测，
    // 避免children/actions引用稳定时narrow判定过期
  }, [actions, position, className]);

  // 按工具组的align分发到左侧工具区或右侧after容器（对齐原版insertItemElements对
  // align:'after'的处理）。工具组为React元素，仅按其props.align分组，不改变组内顺序
  const beforeGroups: ReactNode[] = [];
  const afterGroups: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (React.isValidElement<ToolGroupBaseProps>(child) && child.props.align === 'after') {
      afterGroups.push(child);
    } else {
      beforeGroups.push(child);
    }
  });

  return (
    <div
      {...rest}
      className={clsx(className, 'oo-ui-toolbar', `oo-ui-toolbar-position-${position}`, narrow && 'oo-ui-toolbar-narrow')}
      onMouseDown={handlePointerDown}
      onKeyDown={handlePointerDown}
      ref={mergedRef}
    >
      <ToolbarPositionContext.Provider value={position}>
        <ToolbarNarrowContext.Provider value={narrow}>
          <div ref={barRef} className='oo-ui-toolbar-bar'>
            <div ref={toolsRef} className='oo-ui-toolbar-tools'>
              {beforeGroups}
            </div>
            <div ref={afterRef} className='oo-ui-toolbar-tools oo-ui-toolbar-after'>
              {afterGroups}
            </div>
            {actions && <div ref={actionsRef} className='oo-ui-toolbar-actions'>{actions}</div>}
            <div style={{ clear: 'both' }} />
          </div>
        </ToolbarNarrowContext.Provider>
      </ToolbarPositionContext.Provider>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

