import React, {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { LabelBase } from '../Label/Base';
import { IconBase } from '../Icon/Base';
import { Button } from '../Button';
import { useDir, useMessage, usePortalContainer, useViewportSpacing } from '../../config';
import { useDismissablePopover, useMergedRefs } from '../../hooks';
import {
  getWidgetClassName,
  getFocusableElements,
  getElementDir,
  resolveElement,
  OFFSCREEN_POSITION,
} from '../../utils';
import type { WidgetProps } from '../Widget';
import type { IconElement } from '../Icon';
import type { LabelElement } from '../Label';
import {
  EMPTY_RECT,
  POPUP_ANCHOR_SIZE,
  clampPopupToBounds,
  findScrollableContainer,
  getAnchorEdge,
  getClampBounds,
  getPositionSpaces,
  isVerticalPosition,
  placePopup,
  resolveAnchorAdjust,
  resolvePopupPosition,
  type PopupAlign,
  type PopupLayout,
  type PopupPosition,
} from './popupLayout';

export type { PopupAlign, PopupPosition };

/** 裁剪判定的视口内缩量（px） */
const CLIP_BUFFER = 7;

export interface PopupProps extends
  WidgetProps<HTMLDivElement>,
  IconElement,
  LabelElement {

  /** 是否打开 */
  open: boolean;

  /** 锚定容器，popup相对其定位；缺省时定位在body左上角 */
  container?: RefObject<HTMLElement | null> | HTMLElement | null;

  /** 弹出方位：above/below/before(左侧)/after(右侧)，默认below */
  position?: PopupPosition;

  /** 对齐方向：forwards(起始边)/center/backwards(终止边)，默认center */
  align?: PopupAlign;

  /** 是否显示指向锚定容器的箭头，默认true */
  anchor?: boolean;

  /** 点击popup外部时自动关闭 */
  autoClose?: boolean;

  /** 自动关闭的忽略元素（如触发按钮），点击其内部不触发关闭 */
  autoCloseIgnore?: RefObject<HTMLElement | null> | HTMLElement | null;

  /** 视口放不下时自动翻转到对侧，默认true。两个方向都放不下时保留空间更大的一侧（对齐原版） */
  autoFlip?: boolean;

  /** 锚定容器滚出可视区时隐藏弹层（滚回后恢复，不改变open状态），对齐原版hideWhenOutOfView，默认true */
  hideWhenOutOfView?: boolean;

  /** 容器钳制的内边距（px），对齐原版containerPadding，默认10 */
  containerPadding?: number;

  /** 是否渲染头部（icon+label+关闭按钮） */
  head?: boolean;

  /** 配合head使用，隐藏关闭按钮 */
  hideCloseButton?: boolean;

  /** 内容是否有内边距，默认false */
  padded?: boolean;

  /** 弹层宽度（px），对齐原版默认320 */
  width?: number | string;

  /** 弹层高度（px） */
  height?: number | string;

  /** 底部区域 */
  footer?: ReactNode;

  /** 请求关闭时触发（点关闭按钮/点外部），由调用方负责置open为false */
  onClose?: () => void;
}

/** 弹出层，对齐原版OO.ui.PopupWidget（浮动定位+锚点箭头+自动翻转+自动关闭+ClippableElement裁剪+Tab边界关闭）。容器探测与翻转空间比较为简化实现，见docs/TODO.md */
export const Popup = forwardRef<HTMLDivElement, PopupProps>(({
  open,
  container,
  position: positionProp = 'below',
  align: alignProp = 'center',
  anchor = true,
  autoClose,
  autoCloseIgnore,
  autoFlip = true,
  hideWhenOutOfView = true,
  containerPadding = 10,
  head,
  hideCloseButton,
  padded,
  invisibleLabel,
  width = 320,
  height,
  footer,
  onClose,
  icon,
  label,
  children,
  className,
  disabled,
  ...rest
}, ref) => {
  // portal根（外层div）：autoClose的内部判定范围连同浮层壳与箭头一起排除
  const rootRef = useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(rootRef, ref);
  const popupRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<PopupLayout | null>(null);
  // 锚定容器滚出可视区时的表现层隐藏（不改变open）
  const [outOfView, setOutOfView] = useState(false);
  // 关闭按钮的无障碍标签（对齐原版ooui-popup-widget-close-button-aria-label消息）
  const closeAriaLabel = useMessage('ooui-popup-widget-close-button-aria-label');
  // 浮层文本方向覆盖与视口留白（全局配置）
  const configDir = useDir();
  const spacing = useViewportSpacing();
  // 浮层portal容器：配置的getPortalContainer以锚点元素调用，缺省document.body
  const getPortalContainer = usePortalContainer();
  const portalTarget = getPortalContainer(resolveElement(container));

  const classes = clsx(
    className,
    getWidgetClassName({ disabled, label, invisibleLabel }, 'popup'),
    anchor && layout && `oo-ui-popupWidget-anchored oo-ui-popupWidget-anchored-${layout.anchorEdge}`,
    (!open || outOfView) && 'oo-ui-element-hidden',
  );

  // 对齐原版computePosition：按container与popup尺寸计算绝对定位与锚点偏移（页面坐标，portal至body）。
  // 影响布局的props变化时须重新计算（含open期间切换container/anchor），对齐原版setFloatableContainer/
  // setPosition等setter的即时重定位语义
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const popup = popupRef.current;
    if (!popup) {
      return;
    }
    const containerEl = resolveElement(container);
    // 弹层方向：Provider.dir覆盖锚点继承方向（对齐原版Element config.dir优先）
    const dir = configDir ?? getElementDir(containerEl);
    const compute = (): PopupLayout | null => {
      if (!popupRef.current) {
        return null;
      }
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      // 清除上一轮裁剪，测量未裁剪的自然尺寸（裁剪基于自然尺寸计算，避免逐轮收缩振荡）
      const body = popupRef.current.querySelector<HTMLElement>('.oo-ui-popupWidget-body');
      if (body) {
        body.style.overflow = '';
        body.style.height = '';
        body.style.width = '';
      }
      const base = containerEl?.getBoundingClientRect() ?? EMPTY_RECT;
      const pw = popupRef.current.offsetWidth;
      const ph = popupRef.current.offsetHeight;
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      // 方位与对齐为逻辑值，物理侧按方向解析（对齐原版FloatableElement按direction取start/end）
      const rtl = dir === 'rtl';

      // 翻转判定：常态方向放不下时翻转到对侧（autoFlip关闭时保持声明方位）
      const position = autoFlip
        ? resolvePopupPosition(positionProp, getPositionSpaces(base, viewport, rtl), { width: pw, height: ph })
        : positionProp;
      // 箭头占位：CSS 用 anchored-{top,bottom,start,end} 的 9px margin 实现。below/after 以 top/left
      // 定位时该 margin 自动生效；above/before 原版以 bottom/right 定位，本工程统一用 top/left，需手动补
      const anchorShift = anchor ? POPUP_ANCHOR_SIZE : 0;
      const { top, left } = placePopup({
        base,
        position,
        align: alignProp,
        rtl,
        anchorShift,
        scrollX,
        scrollY,
        popupWidth: pw,
        popupHeight: ph,
      });

      const anchorEdge = getAnchorEdge(position);
      // above/below弹层的锚点与钳制沿水平轴，before/after沿垂直轴（对齐原版sizeProp的取轴）
      const anchorAxisX = isVerticalPosition(position);
      const popupStart = anchorAxisX ? left : top;
      const popupSize = anchorAxisX ? pw : ph;
      // 锚点指向container中线（记录未调整的原始偏移，随弹层平移，对齐原版computePosition）
      const rawAnchorOffset = anchorAxisX
        ? base.left + base.width / 2 + scrollX - popupStart
        : base.top + base.height / 2 + scrollY - popupStart;

      // 对齐原版两段positionAdjustment：1) 锚点距弹层两端不足2*箭头宽度时平移弹层为其腾出空间；
      // 2) 容器边界钳制（就近滚动容器，缺省视口）内缩containerPadding
      const arrowAdjust = anchor ? resolveAnchorAdjust(rawAnchorOffset, popupSize, POPUP_ANCHOR_SIZE) : 0;
      const bounds = getClampBounds(
        findScrollableContainer(containerEl),
        anchorAxisX,
        viewport,
        { x: scrollX, y: scrollY },
      );
      const totalAdjust = arrowAdjust + clampPopupToBounds(popupStart + arrowAdjust, popupSize, bounds, containerPadding);

      return {
        // 钳制/腾挪沿被钳制的轴施加：纵向弹层平移left，横向弹层平移top
        top: anchorAxisX ? top : top + totalAdjust,
        left: anchorAxisX ? left + totalAdjust : left,
        anchorEdge,
        // 对齐原版：锚点偏移按总调整量反向修正，钳制/腾挪后箭头仍指向触发器中心
        anchorOffset: rawAnchorOffset - totalAdjust,
        // 裁剪轴上的自然尺寸，供裁剪计算使用（裁剪会改变实际rect，不能以实际rect为基准）
        unclippedSize: anchorAxisX ? ph : pw,
        dir,
      };
    };

    const initial = compute();
    setLayout(initial);
    // 滚动/缩放后重新计算定位（含翻转判定）；对齐原版position()在滚动时同时更新裁剪与滚出隐藏
    const recompute = () => setLayout(compute());
    // 壳尺寸变化（open期间切换head/footer、内容增减）触发重定位与重钳制；
    // 观察壳而非把head/footer等加入deps，内联节点每渲染新引用不会引发重定位。
    // 裁剪变化引起的壳尺寸回流会在同一帧内被裁剪effect复原，不会形成观察循环
    const shellObserver = new ResizeObserver(recompute);
    shellObserver.observe(popup);
    window.addEventListener('resize', recompute);
    document.addEventListener('scroll', recompute, true);
    return () => {
      shellObserver.disconnect();
      window.removeEventListener('resize', recompute);
      document.removeEventListener('scroll', recompute, true);
    };
  }, [open, positionProp, alignProp, autoFlip, width, height, containerPadding, container, anchor, configDir]);

  // 对齐原版onDocumentMouseDown/onDocumentKeyDown：点击popup与忽略元素之外、或按Escape时
  // 请求关闭。Escape捕获阶段处理并stopPropagation，嵌套Dialog等冒泡处理器时不误关外层；
  // 复用useDismissablePopover（comparison-guide约定浮层关闭统一走该hook）
  useDismissablePopover({
    enabled: open && !!autoClose,
    onClose: () => onClose?.(),
    ignore: [rootRef, autoCloseIgnore],
  });

  // 对齐原版toggle中的焦点圈闭：autoClose时，Tab走出最后一个焦点元素（或Shift+Tab走出第一个）即关闭弹层
  useEffect(() => {
    if (!open || !autoClose) {
      return;
    }
    const root = popupRef.current;
    if (!root) {
      return;
    }
    const focusables = getFocusableElements(root);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const handleFirst = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'Tab') {
        event.preventDefault();
        onClose?.();
      }
    };
    const handleLast = (event: KeyboardEvent) => {
      if (!event.shiftKey && event.key === 'Tab') {
        event.preventDefault();
        onClose?.();
      }
    };
    first?.addEventListener('keydown', handleFirst);
    last?.addEventListener('keydown', handleLast);
    return () => {
      first?.removeEventListener('keydown', handleFirst);
      last?.removeEventListener('keydown', handleLast);
    };
    // first/last为打开时的快照，对齐原版在toggle(show)时绑定一次的时机；layout滚动时高频
    // 变化，不能作为依赖（否则每次滚动都重新查询并重绑监听）
  }, [open, autoClose, onClose]);

  // 对齐原版position()：滚动/缩放时更新裁剪（ClippableElement.clip）与滚出隐藏（hideWhenOutOfView）
  useLayoutEffect(() => {
    if (!open) {
      setOutOfView(false);
      return;
    }
    const root = popupRef.current;
    if (!root) {
      return;
    }
    const body = root.querySelector<HTMLElement>('.oo-ui-popupWidget-body');
    const containerEl = resolveElement(container);
    const scroller = findScrollableContainer(containerEl);
    // 裁剪判定的视口内缩量（px）：留出弹层阴影/边框的余量，避免贴边即判定为需裁剪
    const buffer = CLIP_BUFFER;
    const applyVisualBounds = () => {
      // 滚出隐藏：锚定容器与可视区（就近滚动容器，缺省视口）无交集时隐藏
      if (hideWhenOutOfView && containerEl) {
        const cr = containerEl.getBoundingClientRect();
        const sr = scroller === document.documentElement
          ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
          : scroller.getBoundingClientRect();
        const out = cr.bottom < sr.top || cr.top > sr.bottom || cr.right < sr.left || cr.left > sr.right;
        setOutOfView(out);
        if (out) {
          return;
        }
      } else {
        setOutOfView(false);
      }
      if (!body || !layout) {
        return;
      }
      // 裁剪：body超出可视区时压至可用尺寸（对齐ClippableElement.clip）。
      // itemRect以未裁剪自然尺寸为基准（实际rect会随裁剪收缩，直接使用会逐轮振荡）
      const vp = scroller === document.documentElement
        ? {
          top: spacing.top,
          left: spacing.left,
          right: window.innerWidth - spacing.right,
          bottom: window.innerHeight - spacing.bottom,
        }
        : (() => {
          const r = scroller.getBoundingClientRect();
          return { top: r.top, left: r.left, right: r.right, bottom: r.bottom };
        })();
      vp.top += buffer;
      vp.left += buffer;
      vp.right -= buffer;
      vp.bottom -= buffer;
      const popupRect = root.getBoundingClientRect();
      const bodyRect = body.getBoundingClientRect();
      const verticalClip = layout.anchorEdge === 'top' || layout.anchorEdge === 'bottom';
      const startVP = verticalClip ? popupRect.top : popupRect.left;
      const size = layout.unclippedSize;
      // itemRect向锚点反方向扩展至可视区边界（对齐原版按anchorEdge扩展itemRect）：
      // anchor top/bottom（above/below弹层）：远离锚点的一端扩展到vp边界，靠近锚点的一端取自身位置
      let availSize: number;
      if (layout.anchorEdge === 'top') {
        availSize = vp.bottom - startVP;
      } else if (layout.anchorEdge === 'bottom') {
        availSize = startVP + size - vp.top;
      } else if (layout.anchorEdge === 'start') {
        availSize = vp.right - startVP;
      } else {
        availSize = startVP + size - vp.left;
      }
      availSize = Math.max(0, availSize);
      // extra为弹层壳（头部/边框）尺寸：壳不随裁剪收缩，用当前rect差值稳定
      const extraSize = verticalClip
        ? popupRect.height - bodyRect.height
        : popupRect.width - bodyRect.width;
      // 钳0：锚点贴近视口边缘时availSize不足以覆盖弹层壳，alloted为负是非法CSS值
      // 会被浏览器丢弃导致裁剪静默失效（与MenuSelect的钳0口径一致）
      const alloted = Math.max(0, Math.ceil(availSize - extraSize));
      const natural = verticalClip ? body.scrollHeight : body.scrollWidth;
      if (alloted < natural) {
        body.style.overflow = 'auto';
        if (verticalClip) {
          body.style.height = `${alloted}px`;
        } else {
          body.style.width = `${alloted}px`;
        }
      } else {
        body.style.overflow = '';
        body.style.height = '';
        body.style.width = '';
      }
    };
    applyVisualBounds();
    window.addEventListener('resize', applyVisualBounds);
    document.addEventListener('scroll', applyVisualBounds, true);
    return () => {
      window.removeEventListener('resize', applyVisualBounds);
      document.removeEventListener('scroll', applyVisualBounds, true);
      if (body) {
        body.style.overflow = '';
        body.style.height = '';
        body.style.width = '';
      }
    };
    // layout为state（滚动时更新），作为依赖触发本effect重算
  }, [open, hideWhenOutOfView, layout, container, spacing]);

  return createPortal(
    <div
      {...rest}
      className={classes}
      // dir取弹层有效方向（RTL站点/Provider.dir配置下浮层文本方向正确）
      dir={layout?.dir}
      style={{
        position: 'absolute',
        top: layout?.top ?? OFFSCREEN_POSITION,
        left: layout?.left ?? OFFSCREEN_POSITION,
      }}
      ref={setRootRef}
    >
      <div
        className='oo-ui-popupWidget-popup'
        style={{ width, height }}
        ref={popupRef}
      >
        {head && (
          <div className='oo-ui-popupWidget-head'>
            {/* 原版head图标是IconElement裸span（非IconWidget）：带widget盒子类会撑高head */}
            <IconBase icon={icon} />
            {/* invisibleLabel的裁剪类落在label元素上（对齐原版LabelElement.setInvisibleLabel） */}
            <LabelBase className={clsx(invisibleLabel && 'oo-ui-labelElement-invisible')}>{label}</LabelBase>
            {head && !hideCloseButton && (
              <Button
                framed={false}
                icon='close'
                className='oo-ui-popupWidget-closeButton'
                aria-label={closeAriaLabel}
                onClick={() => onClose?.()}
              />
            )}
          </div>
        )}
        <div className={clsx('oo-ui-popupWidget-body', padded && 'oo-ui-popupWidget-body-padded')}>
          {children}
        </div>
        {footer && <div className='oo-ui-popupWidget-footer'>{footer}</div>}
      </div>
      {anchor && <div className='oo-ui-popupWidget-anchor' style={layout ? (layout.anchorEdge === 'top' || layout.anchorEdge === 'bottom' ? { left: layout.anchorOffset } : { top: layout.anchorOffset }) : undefined} />}
    </div>,
    portalTarget,
  );
});

Popup.displayName = 'Popup';

