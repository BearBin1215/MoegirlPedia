import {
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react';

/**
 * inline输入框宽度自适应的安全余量（px）。对齐原版`updateInputSize`的"-13"经验值
 * （原版注释自陈为"不想深究这几像素从哪来"的兜底留白）
 */
export const INLINE_INPUT_SAFETY_MARGIN = 13;

/**
 * TagMultiselect inline输入框的宽度自适应（对齐原版`TagMultiselectWidget.updateInputSize`）：
 * inline输入框应占满标签区最后一行的剩余空间，空间不足时换行取整行宽度。
 * 与原版同款步骤——先把输入框视同`1em`以量取内容固有宽度（实际值与占位符文本宽度取大者，
 * 占位符宽度只测一次并缓存），再按「内容宽度 − 输入框起始位置 − 输入框宽度 − 安全余量」
 * 求目标宽度；内容宽度仍超过目标宽度时退化为「整行宽度 − 安全余量」。
 * 测量走离屏克隆而非改写真实输入框：受控输入框的值由React持有，命令式改写其value会
 * 干扰值追踪与光标。宽度经命令式写入（React不接管该内联样式，不得写进JSX的style）
 *
 * 仅TagMultiselect使用（依赖其content/group/input的DOM契约），故与组件同目录而非入共享hooks
 */
export function useInlineInputWidth({
  enabled,
  contentRef,
  inputRef,
  placeholder,
  value,
  recomputeKey,
}: {
  /** 是否启用（inputPosition==='inline'且未禁用）；关闭时清除残留宽度 */
  enabled: boolean;
  /** `.oo-ui-tagMultiselectWidget-content`元素：宽度基准与输入框定位的offsetParent */
  contentRef: RefObject<HTMLElement | null>;
  /** inline输入框元素（inline模式下恒为标签组的末个子元素） */
  inputRef: RefObject<HTMLInputElement | null>;
  /** 占位符文本，用于占位符保底宽度的缓存 */
  placeholder?: string;
  /** 当前输入值 */
  value: string;
  /** 额外重算触发源（如标签集合变化） */
  recomputeKey?: unknown;
}): void {
  // 占位符文本宽度缓存（对齐原版contentWidthWithPlaceholder）：同一占位符只测量一次
  const placeholderWidthRef = useRef<{ text: string; width: number } | null>(null);
  // 上一次观测到的content宽度：resize只按宽度变化重算，避免高度变化（输入框换行）引发重算循环
  const lastWidthRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const content = contentRef.current;
    if (!input || !content) {
      return;
    }

    /** 用离屏克隆量取占位符文本的固有宽度（不改动真实输入框的value，避免干扰值追踪与光标） */
    const measurePlaceholderWidth = (el: HTMLInputElement, text: string): number => {
      const clone = el.cloneNode(false) as HTMLInputElement;
      clone.removeAttribute('id');
      clone.removeAttribute('name');
      clone.readOnly = true;
      clone.tabIndex = -1;
      clone.setAttribute('aria-hidden', 'true');
      clone.style.position = 'absolute';
      clone.style.visibility = 'hidden';
      clone.style.pointerEvents = 'none';
      clone.style.width = '1em';
      clone.value = text;
      // 追加在标签组末尾：不影响其前元素（含真实输入框）的位置
      el.parentElement?.appendChild(clone);
      const width = clone.scrollWidth;
      clone.remove();
      return width;
    };

    const measure = () => {
      const el = inputRef.current;
      const container = contentRef.current;
      // 容器无宽度（隐藏于未展开面板等）时测量无意义
      if (!el || !container || container.clientWidth === 0) {
        return;
      }
      const style = getComputedStyle(el);
      // 与原版同款：先把输入框钳到1em再读取。宽度不钳小的话，输入框可能被自身旧宽度挤到下一行，
      // 读到的就不是「紧接标签之后」的起始位置（这也是原版先钳1em的原因）
      el.style.width = '1em';
      const inputRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const boxWidth = inputRect.width;
      const valueWidth = el.scrollWidth;
      // 输入框起始位置：以content为基准（content为position:relative，是输入框的offsetParent），
      // 复刻jQuery position().left「相对offsetParent内边距、再减去元素自身marginLeft」的取值
      const startOffset = inputRect.left - containerRect.left - (parseFloat(style.marginLeft) || 0);
      if (placeholder && placeholderWidthRef.current?.text !== placeholder) {
        placeholderWidthRef.current = { text: placeholder, width: measurePlaceholderWidth(el, placeholder) };
      }
      // 内容宽度：实际值宽度与占位符宽度取较大者，避免占位符文本被裁切
      const contentWidth = Math.max(valueWidth, placeholderWidthRef.current?.width ?? 0);
      let bestWidth = container.clientWidth - startOffset - boxWidth - INLINE_INPUT_SAFETY_MARGIN;
      if (contentWidth > bestWidth) {
        // 剩余空间连内容固有宽度都放不下：接受换行，取整行宽度
        bestWidth = container.clientWidth - INLINE_INPUT_SAFETY_MARGIN;
      }
      // 与jQuery的.width(v)同语义：border-box元素写入的style.width须加上内边距与边框
      const extra = style.boxSizing === 'border-box'
        ? (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0)
          + (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.borderRightWidth) || 0)
        : 0;
      el.style.width = `${Math.floor(Math.max(0, bestWidth + extra))}px`;
    };

    if (!enabled) {
      // 非inline/禁用时清除命令式宽度，避免切到outline或重新启用后残留旧宽度
      input.style.width = '';
      return;
    }

    measure();
    // content宽度变化（父容器缩放等）时重算；只按宽度变化触发，避免自身高度变化引起重算循环
    lastWidthRef.current = content.clientWidth;
    const observer = new ResizeObserver(() => {
      const container = contentRef.current;
      if (!container) {
        return;
      }
      if (lastWidthRef.current === container.clientWidth) {
        return;
      }
      lastWidthRef.current = container.clientWidth;
      measure();
    });
    observer.observe(content);
    return () => observer.disconnect();
  }, [enabled, placeholder, value, contentRef, inputRef, recomputeKey]);
}
