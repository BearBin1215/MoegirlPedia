/**
 * Popup的定位计算（纯函数，便于单测）：翻转判定、方位/对齐→页面坐标、箭头腾挪与容器边界钳制。
 * 与`useAnchoredPanelLayout`（MenuSelect/PopupToolGroup）分工不同：后者只处理上下方位与钳高，
 * 本模块覆盖四方位、箭头对齐与钳制
 */

/** 弹出方位（逻辑值，物理侧按文本方向解析） */
export type PopupPosition = 'above' | 'below' | 'before' | 'after';

/** 对齐方向：forwards(起始边)/center/backwards(终止边) */
export type PopupAlign = 'forwards' | 'center' | 'backwards';

/** 弹层锚点边（对应CSS类`oo-ui-popupWidget-anchored-{edge}`与箭头定位轴） */
export type PopupAnchorEdge = 'top' | 'bottom' | 'start' | 'end';

/** 元素位置与尺寸（getBoundingClientRect的最小结构） */
export interface PopupRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** 弹层定位结果（页面坐标） */
export interface PopupLayout {
  top: number;
  left: number;
  anchorEdge: PopupAnchorEdge;
  anchorOffset: number;
  /** 裁剪轴上的自然尺寸（above/below为高度，before/after为宽度） */
  unclippedSize: number;
  /** 弹层有效文本方向（写入浮层根dir属性；锚点继承方向，可被Provider.dir覆盖） */
  dir: 'ltr' | 'rtl';
}

/** 箭头占位尺寸（px）：CSS以`anchored-{edge}`的9px margin表现箭头 */
export const POPUP_ANCHOR_SIZE = 9;

/** 视口缺省矩形（锚点未挂载时的兜底，使弹层定位在视口左上） */
export const EMPTY_RECT: PopupRect = { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };

const OPPOSITE: Record<PopupPosition, PopupPosition> = {
  below: 'above', above: 'below', before: 'after', after: 'before',
};

/** 方位是否为纵向（above/below）；纵向弹层的箭头腾挪与钳制沿水平轴 */
export function isVerticalPosition(position: PopupPosition): boolean {
  return position === 'above' || position === 'below';
}

/** 锚点四侧可用空间（按逻辑方位求值，before/after随RTL换侧），供翻转判定 */
export function getPositionSpaces(
  base: PopupRect,
  viewport: { width: number; height: number },
  rtl: boolean,
): Record<PopupPosition, number> {
  return {
    below: viewport.height - base.bottom,
    above: base.top,
    before: rtl ? viewport.width - base.right : base.left,
    after: rtl ? base.left : viewport.width - base.right,
  };
}

/**
 * 翻转判定（对齐原版toggle的翻转逻辑）：常态方向放不下时翻转到对侧；
 * 对侧也放不下时保留空间更大的一侧（两侧都不足时不翻转）
 */
export function resolvePopupPosition(
  position: PopupPosition,
  spaces: Record<PopupPosition, number>,
  popup: { width: number; height: number },
): PopupPosition {
  const fits = (pos: PopupPosition) =>
    spaces[pos] >= (isVerticalPosition(pos) ? popup.height : popup.width);
  if (fits(position)) {
    return position;
  }
  const opposite = OPPOSITE[position];
  return fits(opposite) || spaces[opposite] > spaces[position] ? opposite : position;
}

/** 锚点边：above→bottom、below→top、before→end、after→start（箭头指向锚点中线） */
export function getAnchorEdge(position: PopupPosition): PopupAnchorEdge {
  if (position === 'above') {
    return 'bottom';
  }
  if (position === 'below') {
    return 'top';
  }
  return position === 'before' ? 'end' : 'start';
}

/**
 * 方位与对齐→弹层左上角页面坐标（未含箭头腾挪与容器钳制）。
 * `anchorShift`为箭头占位：below/after以top/left定位时CSS margin自动生效，
 * above/before需手动补足（本工程统一以top/left定位，原版用bottom/right）
 */
export function placePopup({
  base,
  position,
  align,
  rtl,
  anchorShift,
  scrollX,
  scrollY,
  popupWidth,
  popupHeight,
}: {
  base: PopupRect;
  position: PopupPosition;
  align: PopupAlign;
  rtl: boolean;
  anchorShift: number;
  scrollX: number;
  scrollY: number;
  popupWidth: number;
  popupHeight: number;
}): { top: number; left: number } {
  let top = 0;
  let left = 0;
  if (position === 'below') {
    top = base.bottom + scrollY;
  } else if (position === 'above') {
    top = base.top + scrollY - popupHeight - anchorShift;
  } else if (position === 'before') {
    // before为容器起始侧（LTR左/RTL右）
    left = rtl ? base.right + scrollX : base.left + scrollX - popupWidth - anchorShift;
  } else {
    // after为容器结束侧（LTR右/RTL左）
    left = rtl ? base.left + scrollX - popupWidth - anchorShift : base.right + scrollX;
  }
  if (isVerticalPosition(position)) {
    if (align === 'center') {
      left = base.left + scrollX + (base.width - popupWidth) / 2;
    } else if (rtl ? align === 'backwards' : align === 'forwards') {
      // forwards对齐起始边（LTR左缘/RTL右缘）
      left = base.left + scrollX;
    } else {
      left = base.right + scrollX - popupWidth;
    }
  } else if (align === 'center') {
    // 纵向对齐沿物理轴，不随RTL翻转
    top = base.top + scrollY + (base.height - popupHeight) / 2;
  } else if (align === 'forwards') {
    top = base.top + scrollY;
  } else {
    top = base.bottom + scrollY - popupHeight;
  }
  return { top, left };
}

/** 箭头腾挪量：锚点距弹层两端不足2倍箭头宽时平移弹层，为箭头留出指向空间 */
export function resolveAnchorAdjust(
  rawAnchorOffset: number,
  popupSize: number,
  anchorSize: number,
): number {
  if (rawAnchorOffset < 2 * anchorSize) {
    return rawAnchorOffset - 2 * anchorSize;
  }
  if (rawAnchorOffset > popupSize - 2 * anchorSize) {
    return rawAnchorOffset - (popupSize - 2 * anchorSize);
  }
  return 0;
}

/** 钳制边界（页面坐标，沿弹层被钳制的轴）：就近滚动容器内沿，缺省视口 */
export function getClampBounds(
  scroller: HTMLElement,
  anchorAxisX: boolean,
  viewport: { width: number; height: number },
  scroll: { x: number; y: number },
): { near: number; far: number } {
  if (scroller === document.documentElement) {
    return { near: 0, far: anchorAxisX ? viewport.width : viewport.height };
  }
  const sr = scroller.getBoundingClientRect();
  const near = anchorAxisX ? sr.left + scroll.x : sr.top + scroll.y;
  return { near, far: near + (anchorAxisX ? scroller.clientWidth : scroller.clientHeight) };
}

/** 容器边界钳制：起点越过任一内缩边界时返回补足位移，使弹层落入容器内（对齐原版$container逻辑） */
export function clampPopupToBounds(
  start: number,
  size: number,
  bounds: { near: number; far: number },
  padding: number,
): number {
  if (start < bounds.near + padding) {
    return bounds.near + padding - start;
  }
  if (start + size > bounds.far - padding) {
    return bounds.far - padding - (start + size);
  }
  return 0;
}
