import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import type { LabelPosition } from '../Label';

/**
 * 测量前须从真实输入框同步到克隆节点的样式属性。
 * 克隆是独立渲染的兄弟节点，不继承真实输入框的运行时样式；而标签让位的内边距、
 * 字体与边框都会改变内容区宽度，未同步会让测得的滚动高度偏离实际值
 */
const CLONE_SYNC_PROPERTIES = [
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-variant',
  'font-stretch',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-indent',
  'text-transform',
  'border-top-width',
  'border-bottom-width',
  'border-left-width',
  'border-right-width',
  'box-sizing',
  'direction',
  'unicode-bidi',
  'white-space',
  'word-break',
  'overflow-wrap',
  'tab-size',
  'min-width',
  'max-width',
] as const;

/**
 * 多行输入框 autosize 的测量配置（对齐原版 MultilineTextInputWidget.adjustSize 的高度部分）。
 * 测量经一份不可见的同源克隆 textarea 完成：输入框最终高度无法直接由内容推出，
 * 须取"内容高度"与"maxRows 对应高度"两者中的较小者
 */
export interface AutosizeConfig {
  /** 是否开启自动高度（对应原版 config.autosize） */
  enabled: boolean;

  /** 真实输入框引用（测量对象与高度的最终落点） */
  textareaRef: RefObject<HTMLTextAreaElement | null>;

  /** 测量用克隆元素引用（由调用方渲染，与真实输入框同类名同源样式） */
  cloneRef: RefObject<HTMLTextAreaElement | null>;

  /** 最小行数；未指定时以空串取浏览器的缺省行数（对齐原版 minRows） */
  rows?: number;

  /** 最大行数（已含原版缺省规则：max(2×rows, 10)） */
  maxRows: number;

  /** 当前值；值变化（含非受控键入）即触发重算，对应原版 change→adjustSize */
  value: string;
}

/**
 * 多行输入框的自动高度：返回应写入输入框的内联高度样式。
 * 高度经 state 回到渲染流程（而非命令式写 DOM），使 autosize 与标签让位的内边距
 * 共用一个 style 来源，避免两处分别写 style 互相覆盖。
 * 触发时机两类：①value/行数配置变化后同步重测（对应原版 change→adjustSize，paint 前完成
 * 无闪烁）；②盒模型或宽度变化经 ResizeObserver 兜底重测——首帧测量早于标签让位内边距
 * 生效，字体加载与窗口缩放也不走值变更，仅靠①会滞留过期高度。
 * 测量过程对齐原版：①克隆设 rows=minRows、height=0 读内容 scrollHeight；②恢复高度读
 * 自然 inner/outerHeight；③克隆设 rows=maxRows、清空内容读上限 innerHeight；
 * ④以 maxInnerHeight 与 scrollHeight 的差补偿 Blink 缩放下的测量误差（原版 T133347）；
 * 内容未超出自然高度时清空内联高度，回落到 rows 的原生布局
 */
export function useAutosize({
  enabled,
  textareaRef,
  cloneRef,
  rows,
  maxRows,
  value,
}: AutosizeConfig): CSSProperties {
  const [height, setHeight] = useState('');

  const measure = useCallback(() => {
    const input = textareaRef.current;
    const clone = cloneRef.current;
    if (!input || !clone) {
      return;
    }
    const minRows = rows === undefined ? '' : String(rows);
    // 先同步盒模型与字体：两者决定内容区宽度，宽度不同则滚动高度不可比
    const computed = getComputedStyle(input);
    for (const property of CLONE_SYNC_PROPERTIES) {
      clone.style.setProperty(property, computed.getPropertyValue(property));
    }
    // 排除滚动条对测量的干扰（原版 T297963：克隆设 overflow hidden）
    clone.style.overflow = 'hidden';
    clone.classList.remove('oo-ui-element-hidden');

    // 高度归零以读取内容的 scrollHeight
    clone.style.height = '0';
    clone.setAttribute('rows', minRows);
    clone.value = input.value;
    // Firefox缩放/字体边缘下首次读取scrollHeight可能返回陈旧值（原版T1799404的显式双读），
    // 先读一次丢弃，令再次读取拿到该配置下的准确值
    void clone.scrollHeight;
    const { scrollHeight } = clone;

    // 恢复高度读取自然尺寸：inner 含 padding、outer 含 border，两者之差作为追加到内联高度的边框补偿
    clone.style.height = 'auto';
    const innerHeight = clone.clientHeight;
    const outerHeight = clone.offsetHeight;

    // 行数设为 maxRows 且清空内容，读取高度上限
    clone.setAttribute('rows', String(maxRows));
    clone.value = '';
    const maxInnerHeight = clone.clientHeight;

    // 无滚动条时 innerHeight 与 scrollHeight 的差值即测量误差（Blink 缩放相关，原版 T133347）
    const measurementError = maxInnerHeight - clone.scrollHeight;
    const idealHeight = Math.min(maxInnerHeight, scrollHeight + measurementError);

    clone.classList.add('oo-ui-element-hidden');
    clone.style.overflow = '';

    // 内容未超出自然高度时不写内联高度（回落到 rows 布局），超出时锁定高度
    const next = idealHeight > innerHeight ? `${idealHeight + (outerHeight - innerHeight)}px` : '';
    setHeight((prev) => (prev === next ? prev : next));
  }, [textareaRef, cloneRef, rows, maxRows]);

  // 值变化（含程序化赋值与非受控键入回流）与行数配置变化后同步重测
  useLayoutEffect(() => {
    if (!enabled) {
      setHeight('');
      return;
    }
    measure();
  }, [enabled, measure, value]);

  // 盒模型/宽度变化的兜底重测：自身高度回写触发的观察回调重测结果不变（同值短路），不形成循环
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const input = textareaRef.current;
    if (!input) {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(input);
    return () => observer.disconnect();
  }, [enabled, measure, textareaRef]);

  return useMemo(() => (height ? { height } : {}), [height]);
}

/** 滚动条让位的测量结果 */
export interface ScrollbarOffset {
  /** 垂直滚动条宽度（px）；无滚动条时为0。供输入框同侧内边距的让位计算（positionLabel对齐） */
  scrollbarWidth: number;
  /** 指示器应让位的样式；无滚动条时为undefined（清除偏移） */
  indicatorStyle?: CSSProperties;
  /** 标签应让位的样式（仅 labelPosition 为 after 时给出），无滚动条时为undefined */
  labelStyle?: CSSProperties;
}

/**
 * 输入元素出现垂直滚动条时给浮动元素（指示器与后置标签）让位，对齐原版
 * `MultilineTextInputWidget.adjustSize` 的 scrollWidth 分支：以滚动条宽度写
 * right（RTL 下为 left）。滚动条的出现/消失经 ResizeObserver 跟踪
 * （滚动条会改变 content-box 宽度，故尺寸变化即可捕获）
 */
export function useScrollbarOffset({
  inputRef,
  labelPosition = 'after',
}: {
  /** 被测量的输入元素（多行 textarea） */
  inputRef: RefObject<HTMLElement | null>;
  /** 标签位置，仅 after 时标签需要让位（对齐原版 labelPosition 判断） */
  labelPosition?: LabelPosition;
}): ScrollbarOffset {
  const [offset, setOffset] = useState({ width: 0, property: 'right' as 'left' | 'right' });

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const measure = () => {
      const width = input.offsetWidth - input.clientWidth;
      // 偏移落点跟随输入元素自身的有效方向：垂直滚动条物理上位于方向的起始侧
      // （与原版读根元素方向不同，见docs/TODO.md「增强」；dir prop按原版落点只在input上，
      // 读input才是滚动条的真实所在侧）
      const property = getComputedStyle(input).direction === 'rtl' ? 'left' : 'right';
      setOffset((prev) => (prev.width === width && prev.property === property
        ? prev
        : { width, property }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(input);
    return () => observer.disconnect();
  }, [inputRef]);

  return useMemo(() => {
    if (!offset.width) {
      return { scrollbarWidth: 0, indicatorStyle: undefined, labelStyle: undefined };
    }
    const style = { [offset.property]: offset.width } as CSSProperties;
    return {
      scrollbarWidth: offset.width,
      indicatorStyle: style,
      labelStyle: labelPosition === 'after' ? style : undefined,
    };
  }, [offset, labelPosition]);
}
