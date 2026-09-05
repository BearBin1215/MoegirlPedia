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
import LabelBase from '../Label/Base';
import Icon from '../Icon';
import Button from '../Button';
import { generateWidgetClassName, resolveElement } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { IconElement } from '../Icon';
import type { LabelElement } from '../Label';

export type PopupPosition = 'above' | 'below' | 'before' | 'after';

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
  align?: 'forwards' | 'center' | 'backwards';

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

/** 就近可滚动容器（对齐原版getClosestScrollableElementContainer的简化版），无则回退根元素 */
function findScrollableContainer(el: HTMLElement | null): HTMLElement {
  let current = el?.parentElement ?? null;
  while (current && current !== document.body) {
    const style = getComputedStyle(current);
    if (/(auto|scroll|overlay)/.test(style.overflowY) || /(auto|scroll|overlay)/.test(style.overflowX)) {
      return current;
    }
    current = current.parentElement;
  }
  return document.documentElement;
}

interface PopupLayout {
  top: number;
  left: number;
  anchorEdge: 'top' | 'bottom' | 'start' | 'end';
  anchorOffset: number;
  /** 裁剪轴上的自然尺寸（above/below为高度，before/after为宽度） */
  unclippedSize: number;
}

const OPPOSITE: Record<PopupPosition, PopupPosition> = {
  below: 'above', above: 'below', before: 'after', after: 'before',
};

/** @description 弹出层，对齐原版OO.ui.PopupWidget（浮动定位+锚点箭头+自动翻转+自动关闭+ClippableElement裁剪+Tab边界关闭）。容器探测与翻转空间比较为简化实现，见TODO.md */
const Popup = forwardRef<HTMLDivElement, PopupProps>(({
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
  const popupRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<PopupLayout | null>(null);
  // 锚定容器滚出可视区时的表现层隐藏（不改变open）
  const [outOfView, setOutOfView] = useState(false);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'popup'),
    anchor && layout && `oo-ui-popupWidget-anchored oo-ui-popupWidget-anchored-${layout.anchorEdge}`,
    (!open || outOfView) && 'oo-ui-element-hidden',
  );

  // 对齐原版computePosition：按container与popup尺寸计算绝对定位与锚点偏移（页面坐标，portal至body）
  useLayoutEffect(() => {
    if (!open) {
      return;
    }
    const popup = popupRef.current;
    if (!popup) {
      return;
    }
    const containerEl = resolveElement(container);
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
      const base = containerEl?.getBoundingClientRect() ?? { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
      const pw = popupRef.current.offsetWidth;
      const ph = popupRef.current.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let position = positionProp;
      if (autoFlip) {
        // 对齐原版toggle中的翻转判定：常态方向放不下时翻转；对侧也放不下时保留空间更大的一侧
        const spaces: Record<PopupPosition, number> = {
          below: vh - base.bottom,
          above: base.top,
          after: vw - base.right,
          before: base.left,
        };
        const fits = (pos: PopupPosition) => spaces[pos] >= (pos === 'above' || pos === 'below' ? ph : pw);
        if (!fits(position)) {
          const opposite = OPPOSITE[position];
          if (fits(opposite) || spaces[opposite] > spaces[position]) {
            position = opposite;
          }
        }
      }

      const vertical = position === 'above' || position === 'below';
      const ANCHOR_SIZE = 9;
      // 箭头占位由CSS的anchored-{top,bottom,start,end} margin实现（9px）。below/after用top/left定位时
      // margin参与margin box偏移而自动生效；above/before需按原版改用bottom/right定位的效果手动补偏移
      const anchorShift = anchor ? ANCHOR_SIZE : 0;
      let top = 0;
      let left = 0;
      if (position === 'below') {
        top = base.bottom + scrollY;
      } else if (position === 'above') {
        top = base.top + scrollY - ph - anchorShift;
      } else if (position === 'before') {
        left = base.left + scrollX - pw - anchorShift;
      } else {
        left = base.right + scrollX;
      }
      if (vertical) {
        if (alignProp === 'center') {
          left = base.left + scrollX + (base.width - pw) / 2;
        } else if (alignProp === 'forwards') {
          left = base.left + scrollX;
        } else {
          left = base.right + scrollX - pw;
        }
      } else {
        if (alignProp === 'center') {
          top = base.top + scrollY + (base.height - ph) / 2;
        } else if (alignProp === 'forwards') {
          top = base.top + scrollY;
        } else {
          top = base.bottom + scrollY - ph;
        }
      }

      // 锚点指向container中线（记录未调整的原始偏移，随弹层平移，对齐原版computePosition）
      const anchorEdge = position === 'above' ? 'bottom'
        : position === 'below' ? 'top'
          : position === 'before' ? 'end' : 'start';
      // above/below弹层的锚点与钳制沿水平轴，before/after沿垂直轴（对齐原版sizeProp的取轴）
      const anchorAxisX = vertical;
      const popupStart = anchorAxisX ? left : top;
      const popupSize = anchorAxisX ? pw : ph;
      const rawAnchorOffset = anchorAxisX
        ? base.left + base.width / 2 + scrollX - popupStart
        : base.top + base.height / 2 + scrollY - popupStart;

      // 对齐原版两段positionAdjustment：
      // 1) 锚点距弹层两端不足2*箭头宽度时平移弹层，为箭头腾出空间
      let adjust = 0;
      if (anchor) {
        if (rawAnchorOffset < 2 * ANCHOR_SIZE) {
          adjust = rawAnchorOffset - 2 * ANCHOR_SIZE;
        } else if (rawAnchorOffset > popupSize - 2 * ANCHOR_SIZE) {
          adjust = rawAnchorOffset - (popupSize - 2 * ANCHOR_SIZE);
        }
      }
      // 2) 容器边界钳制：就近滚动容器（缺省视口）内缩containerPadding（对齐原版$container逻辑）
      let boundsNear: number;
      let boundsFar: number;
      const scroller = findScrollableContainer(containerEl);
      if (scroller === document.documentElement) {
        boundsNear = 0;
        boundsFar = anchorAxisX ? vw : vh;
      } else {
        const sr = scroller.getBoundingClientRect();
        boundsNear = anchorAxisX ? sr.left + scrollX : sr.top + scrollY;
        boundsFar = boundsNear + (anchorAxisX ? scroller.clientWidth : scroller.clientHeight);
      }
      const adjustedStart = popupStart + adjust;
      if (adjustedStart < boundsNear + containerPadding) {
        adjust += boundsNear + containerPadding - adjustedStart;
      } else if (adjustedStart + popupSize > boundsFar - containerPadding) {
        adjust -= adjustedStart + popupSize - (boundsFar - containerPadding);
      }

      const top2 = anchorAxisX ? top : top + adjust;
      const left2 = anchorAxisX ? left + adjust : left;

      return {
        top: top2,
        left: left2,
        anchorEdge,
        // 对齐原版：锚点偏移按总调整量反向修正，钳制/腾挪后箭头仍指向触发器中心
        anchorOffset: rawAnchorOffset - adjust,
        // 裁剪轴上的自然尺寸，供裁剪计算使用（裁剪会改变实际rect，不能以实际rect为基准）
        unclippedSize: anchorAxisX ? ph : pw,
      };
    };

    const initial = compute();
    setLayout(initial);
    // 滚动/缩放后重新计算定位（含翻转判定）；对齐原版position()在滚动时同时更新裁剪与滚出隐藏
    const recompute = () => setLayout(compute());
    window.addEventListener('resize', recompute);
    document.addEventListener('scroll', recompute, true);
    return () => {
      window.removeEventListener('resize', recompute);
      document.removeEventListener('scroll', recompute, true);
    };
    // 对齐原版setFloatableContainer/setPopupPosition等setter即时重定位的语义：
    // 影响布局的props变化时（含open期间切换container/anchor）须重新计算
  }, [open, positionProp, alignProp, autoFlip, width, height, containerPadding, container, anchor]);

  // 对齐原版onDocumentMouseDown：点击popup与忽略元素之外时请求关闭
  useEffect(() => {
    if (!open || !autoClose) {
      return;
    }
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const root = popupRef.current?.parentElement ?? null;
      if (root?.contains(target)) {
        return;
      }
      const ignoreEl = resolveElement(autoCloseIgnore);
      if (ignoreEl?.contains(target)) {
        return;
      }
      onClose?.();
    };
    // 对齐原版onDocumentKeyDown：ESC关闭。原版为document捕获阶段监听，stopPropagation后
    // 事件不会到达Dialog等冒泡阶段的处理器，故弹窗内嵌套popup时ESC只关popup
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        onClose?.();
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open, autoClose, autoCloseIgnore, onClose]);

  // 对齐原版toggle中的焦点圈闭：autoClose时，Tab走出最后一个焦点元素（或Shift+Tab走出第一个）即关闭弹层
  useEffect(() => {
    if (!open || !autoClose) {
      return;
    }
    const root = popupRef.current;
    if (!root) {
      return;
    }
    const focusables = [...root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )];
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
    const spacing = 5;
    const buffer = 7;
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
          top: spacing,
          left: spacing,
          right: window.innerWidth - spacing,
          bottom: window.innerHeight - spacing,
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
      const alloted = Math.ceil(availSize - extraSize);
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
  }, [open, hideWhenOutOfView, layout, container]);

  return createPortal(
    <div
      {...rest}
      className={classes}
      style={{
        position: 'absolute',
        top: layout?.top ?? -9999,
        left: layout?.left ?? -9999,
      }}
      ref={ref}
    >
      <div
        className='oo-ui-popupWidget-popup'
        style={{ width, height }}
        ref={popupRef}
      >
        {head && (
          <div className='oo-ui-popupWidget-head'>
            <Icon icon={icon} />
            <LabelBase>{label}</LabelBase>
            {head && !hideCloseButton && (
              <Button
                framed={false}
                icon='close'
                aria-label='关闭'
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
    document.body,
  );
});

Popup.displayName = 'Popup';

export default Popup;
