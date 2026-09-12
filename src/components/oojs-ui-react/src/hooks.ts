import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
  type MutableRefObject,
  type Ref,
  type RefObject,
} from 'react';
import { clamp, debounce } from 'es-toolkit';
import { useDir, useViewportSpacing } from './config';
import { getFirstFocusable, getElementDir, resolveElement } from './utils';
/**
 * 受控/非受控通用值状态（对齐React受控组件惯例，原版通过setters维护无对应物）：
 * 传入`value`即受控模式（内部state不生效）；否则维护内部state并以`defaultValue`初始化。
 * `commit`供事件回调使用：非受控时同步内部state，并始终转发给`onChange`；
 * 入参支持函数式更新（对齐setState惯例，经ref取最新已提交值）
 */
export function useControlledValue<T, E = never>(
  { value, defaultValue }: { value?: T; defaultValue?: T },
  onChange?: (value: T, event?: E) => void,
) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<T | undefined>(defaultValue);
  // 非受控时innerValue以defaultValue初始化，语义上始终有值；断言为T以保持调用侧类型简洁
  const currentValue = (isControlled ? value : innerValue) as T;
  const currentValueRef = useRef(currentValue);
  currentValueRef.current = currentValue;
  const commit = (nextValue: T | ((prev: T) => T), event?: E) => {
    const resolved = typeof nextValue === 'function'
      ? (nextValue as (prev: T) => T)(currentValueRef.current)
      : nextValue;
    if (!isControlled) {
      setInnerValue(resolved);
    }
    onChange?.(resolved, event);
  };
  return { value: currentValue, isControlled, commit } as const;
}

/**
 * 受控值非法时的回写：受控值不在可用值集合内（组件实际显示的是回退值）时，
 * 经`onChange`把生效的回退值回写给父级，使父级state与显示值收敛，避免两者漂移。
 * 对齐原版受控语义：`DropdownInput`/`RadioSelectInput`的`setValue`会对非法值回退到
 * 首个可选值并写回组件值，React受控模式下该写回只能经`onChange`交还父级。
 * 同一非法值只回写一次（父级未采纳时不会因外部重渲染反复触发）；无回退值可写时不动。
 */
export function useControlledValueFallback<T>(
  controlledValue: T | undefined,
  effectiveValue: T | undefined,
  onChange?: (value: T) => void,
): void {
  // 已回写过的非法受控值：父级若忽略onChange，state不变，据此防止反复触发
  const notifiedRef = useRef<T | undefined>(undefined);
  useEffect(() => {
    if (controlledValue === undefined || effectiveValue === undefined) {
      return;
    }
    if (controlledValue === effectiveValue || notifiedRef.current === controlledValue) {
      return;
    }
    notifiedRef.current = controlledValue;
    onChange?.(effectiveValue);
  }, [controlledValue, effectiveValue, onChange]);
}

/**
 * 布局类组件的激活项选择（IndexLayout/BookletLayout共用），统一"派生 + 失效补选"策略：
 * 激活值缺失（首次无值）或失效（不在options内，如页被移除）时按邻近优先回退
 * （原位置→前一项→首项），有效值原样返回。
 * 非受控模式提交回退值使内部state收敛；受控模式经onChange把生效的回退值回写父级，
 * 同一非法值只回写一次，由父级决定是否采纳（对齐原版IndexLayout自动选中首个可选页签）
 */
export function useLayoutSelection<T extends string | number>({
  value,
  defaultValue,
  onChange,
  options,
}: {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
  /** 备选项；仅`value`参与匹配 */
  options: { value: T }[];
}): {
  /** 生效的激活值（缺失/失效时已回退） */
  effectiveValue: T | undefined;
  /** 选择激活项：非受控同步内部state，并始终转发onChange */
  select: (value: T) => void;
} {
  const { value: innerValue, isControlled, commit } = useControlledValue<T>({ value, defaultValue }, onChange);
  // 上一轮options：失效值需据其在旧列表中的位置定位相邻项
  const prevOptionsRef = useRef(options);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const effectiveValue = (() => {
    if (options.length === 0) {
      return undefined;
    }
    if (innerValue === undefined) {
      return options[0].value;
    }
    if (options.some((option) => option.value === innerValue)) {
      return innerValue;
    }
    const oldIndex = prevOptionsRef.current.findIndex((option) => option.value === innerValue);
    return (options[oldIndex] ?? options[oldIndex - 1] ?? options[0]).value;
  })();

  useEffect(() => {
    prevOptionsRef.current = options;
  });

  // 回退值写回：非受控提交收敛内部state；受控经onChange回写父级（同一非法值仅一次）
  const notifiedRef = useRef<T | undefined>(undefined);
  useEffect(() => {
    if (effectiveValue === undefined || effectiveValue === innerValue) {
      return;
    }
    if (isControlled) {
      if (notifiedRef.current === innerValue) {
        return;
      }
      notifiedRef.current = innerValue;
      onChangeRef.current?.(effectiveValue);
    } else {
      commit(effectiveValue);
    }
  }, [effectiveValue, innerValue, isControlled, commit]);

  return { effectiveValue, select: commit };
}

/**
 * 稳定的多ref合并回调（等价原utils.mergeRefs，但回调引用跨渲染稳定）：
 * 组件内需同时持有元素引用并向外转发ref时使用。经ref读取最新refs数组，
 * 回调仅创建一次，避免每渲染新函数导致的detach/attach
 */
export function useMergedRefs<T>(...refs: (Ref<T> | undefined)[]): (node: T | null) => void {
  const refsRef = useRef(refs);
  refsRef.current = refs;
  return useMemo(() => (node: T | null) => {
    for (const ref of refsRef.current) {
      if (!ref) {
        continue;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else {
        // React 18的RefObject.current为readonly，需断言
        (ref as MutableRefObject<T | null>).current = node;
      }
    }
  }, []);
}

/**
 * TextInput系组件：label渲染在input旁，input需按label宽度预留内边距。
 * useLayoutEffect在paint前完成测量（无首帧闪烁）；尺寸变化（内容/字体加载等）
 * 经ResizeObserver跟踪，不依赖label引用稳定性（label为节点时每渲染新引用）
 */
export function useLabelPadding(
  labelRef: RefObject<HTMLElement | null>,
  label: unknown,
  labelPosition: 'before' | 'after',
): CSSProperties {
  const [paddingWidth, setPaddingWidth] = useState(0);

  useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) {
      return;
    }
    const update = () => setPaddingWidth(el.offsetWidth);
    // RO注册后会对初始尺寸异步回调一次，这里同步测量保证本帧paint前生效
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
    // 仅在label挂载状态变化时重挂观察；labelRef稳定，label内容变化由RO捕获
  }, [labelRef, !!label]);

  const style: CSSProperties = {};
  if (paddingWidth > 0) {
    // +2px为label与输入内容之间的间距余量
    const padding = `${paddingWidth + 2}px`;
    if (labelPosition === 'before') {
      style.paddingLeft = padding;
    } else {
      style.paddingRight = padding;
    }
  }
  return style;
}

/**
 * 生成不含React `useId`冒号分隔符的id片段：`:`在CSS选择器中非法，
 * 元素id与`aria-labelledby`/`aria-controls`等关联属性统一经此生成
 */
export function useCleanId(): string {
  return useId().replace(/:/g, '');
}

/** 浮层关闭的忽略目标：ref或真实元素均可 */
type DismissIgnoreTarget = RefObject<HTMLElement | null> | HTMLElement | null | undefined;

/**
 * 浮层关闭：点击浮层与锚点之外（document mousedown）或按Escape时请求关闭。
 * Escape在捕获阶段处理：先于React根容器上的冒泡处理器（如Dialog的onKeyDown），
 * 处理后`stopPropagation`使嵌套浮层只关最内层（对齐原版Popup的onDocumentKeyDown），
 * 已`defaultPrevented`的Escape不重复处理。
 * 回调与忽略目标经ref读取最新，内联函数不导致监听反复重挂
 */
export function useDismissablePopover({
  enabled,
  onClose,
  ignore,
}: {
  /** 是否处于需响应关闭的开启态；关闭时不挂监听，避免吞掉外层浮层的Escape */
  enabled: boolean;
  /** 请求关闭（由调用方负责把open置false） */
  onClose: () => void;
  /** 视为内部的目标：其内部点击不触发关闭（组件根、portal后的浮层等） */
  ignore?: DismissIgnoreTarget[];
}): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const ignoreRef = useRef(ignore);
  ignoreRef.current = ignore;
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const handleMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      for (const item of ignoreRef.current ?? []) {
        if (resolveElement(item)?.contains(target)) {
          return;
        }
      }
      onCloseRef.current();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        onCloseRef.current();
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
  }, [enabled]);
}

/**
 * 面板内选项DOM的双向索引：值→元素（前缀匹配/滚动读取）与元素→值（事件target定位选项）。
 * 值的ref回调按值缓存、跨渲染稳定，避免每渲染detach/attach造成索引抖动
 */
export function useOptionRegistry<T extends string | number>() {
  const itemRefs = useRef(new Map<T, HTMLElement>());
  const itemEls = useRef(new Map<Element, T>());
  const callbacksRef = useRef(new Map<T, (el: HTMLElement | null) => void>());

  /** 取某选项值对应的ref回调（同值复用同一回调） */
  const registerItem = (value: T) => {
    let callback = callbacksRef.current.get(value);
    if (!callback) {
      callback = (el) => {
        if (el) {
          itemRefs.current.set(value, el);
          itemEls.current.set(el, value);
        } else {
          const registered = itemRefs.current.get(value);
          if (registered) {
            itemEls.current.delete(registered);
          }
          itemRefs.current.delete(value);
        }
      };
      callbacksRef.current.set(value, callback);
    }
    return callback;
  };

  /** 从事件target沿祖先链定位选项值 */
  const findItemFromNode = (node: EventTarget | null): T | null => {
    let el = node instanceof Element ? node : null;
    while (el) {
      const value = itemEls.current.get(el);
      if (value !== undefined) {
        return value;
      }
      el = el.parentElement;
    }
    return null;
  };

  return { itemRefs, registerItem, findItemFromNode };
}

/**
 * Select系组件的拖拽选择，对齐原版SelectWidget.onMouseDown/onDocumentMouseMove/
 * onDocumentMouseUp（TabSelectWidget继承SelectWidget）：左键在可选项上按下进入拖拽态，
 * 拖动跨项时按压项随之移动，mouseup时选中目标项（拖拽未落在选项上时，mouseup落在的
 * 可选项也参与选择）；pointercancel仅清理不提交
 */
export function useOptionDrag<T extends string | number>({
  disabled,
  isValueSelectable,
  findItemFromNode,
  onCommit,
}: {
  disabled?: boolean;
  /** 值是否可选（带value且未禁用）；拖拽只在可选项间移动 */
  isValueSelectable: (value: T) => boolean;
  /** 从事件target定位选项值（见useOptionRegistry） */
  findItemFromNode: (node: EventTarget | null) => T | null;
  /** mouseup落在可选项上时提交选择 */
  onCommit: (value: T) => void;
}) {
  const [pressed, setPressed] = useState(false);
  // 拖拽过程中被按压的选项值，驱动选项的pressed类（对齐原版pressItem）
  const [pressedValue, setPressedValue] = useState<T>();
  // 拖拽选择态：mousedown起点的可选项，拖动跨项时更新，mouseup时选中（对齐原版selecting）
  const selectingRef = useRef<T | null>(null);
  // 卸载时中止未完成的拖拽监听
  const cleanupDragRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupDragRef.current?.(), []);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    // 原版onMouseDown恒返回false：阻止拖动过程中选中文本
    e.preventDefault();
    if (disabled || e.button !== 0) {
      return;
    }
    setPressed(true);
    // 重置上一次拖拽的残留状态（原版selecting同样存在丢失mouseup后的残留缺陷，此处有意改良）
    selectingRef.current = null;
    setPressedValue(undefined);
    const start = findItemFromNode(e.target);
    if (start !== null && isValueSelectable(start)) {
      selectingRef.current = start;
      setPressedValue(start);
    }
    const onMove = (ev: MouseEvent) => {
      const optionValue = findItemFromNode(ev.target);
      if (optionValue !== null && optionValue !== selectingRef.current && isValueSelectable(optionValue)) {
        selectingRef.current = optionValue;
        setPressedValue(optionValue);
      }
    };
    const onUp = (ev: MouseEvent) => {
      cleanupDragRef.current?.();
      setPressed(false);
      setPressedValue(undefined);
      let optionValue = selectingRef.current;
      selectingRef.current = null;
      if (optionValue === null) {
        const target = findItemFromNode(ev.target);
        optionValue = target !== null && isValueSelectable(target) ? target : null;
      }
      if (optionValue !== null) {
        onCommit(optionValue);
      }
    };
    // 拖拽被系统中断（如触屏滚动接管）时仅清理，不提交选择
    const onPointercancel = () => {
      cleanupDragRef.current?.();
      setPressed(false);
      setPressedValue(undefined);
      selectingRef.current = null;
    };
    const cleanupDrag = () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('mouseup', onUp, true);
      document.removeEventListener('pointercancel', onPointercancel, true);
      cleanupDragRef.current = null;
    };
    cleanupDragRef.current = cleanupDrag;
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);
    document.addEventListener('pointercancel', onPointercancel, true);
  };

  const handleUnpress = () => {
    setPressed(false);
  };

  return { pressed, pressedValue, handleMouseDown, handleUnpress };
}

/**
 * 输入类组件的软校验反馈（对齐原版TextInputWidget.setValidityFlag的标记输出）：
 * 值不满足约束时在输入元素输出`aria-invalid`（根元素的invalid标志类由调用方按返回的
 * `invalid`输出），不改写值。触发时机对齐原版：值变更防抖250ms后校验（原版change事件
 * 的OO.ui.debounce）、失焦立即校验、聚焦视为有效（原版onFocus的setValidityFlag(true)）；
 * 初始值不主动校验（原版构造期无change事件，NumberInput的挂载期校验由调用方经revalidate补齐）
 */
export function useValidityFlag<T extends HTMLInputElement | HTMLTextAreaElement, V extends string | number>({
  inputRef,
  value,
  validate,
}: {
  /** 内部输入元素引用（checkValidity浏览器约束检查的载体） */
  inputRef: RefObject<T | null>;
  /** 当前输入值，作为自定义校验函数的入参 */
  value: V;
  /** 自定义合法性判定（缺省仅浏览器checkValidity）；返回Promise时按其决议结果标记，拒绝视为非法 */
  validate?: (value: V) => boolean | Promise<boolean>;
}): {
  /** 当前是否标记为非法 */
  invalid: boolean;
  /** 输入元素失焦回调：立即重新校验 */
  handleBlur: () => void;
  /** 输入元素聚焦回调：清除非法标记 */
  handleFocus: () => void;
  /** 立即重新校验（约束配置变化时由调用方触发，对齐原版setRange/setStep的setValidityFlag） */
  revalidate: () => void;
} {
  const [invalid, setInvalid] = useState(false);
  const validateRef = useRef(validate);
  validateRef.current = validate;
  const valueRef = useRef(value);
  valueRef.current = value;
  // 首个生效值不校验（对齐原版构造期不触发标记）；发生过变化后即使回到初始值也照常校验
  // （如表单重置回初始值需清除既有标记），保证状态不滞留
  const initialValueRef = useRef(value);
  const interactedRef = useRef(false);

  const check = useCallback(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    // 先浏览器约束（required/min/max等），通过后再自定义校验，对齐原版getValidity的次序
    let result: boolean | Promise<boolean> = !input.checkValidity || input.checkValidity();
    if (result && validateRef.current) {
      result = validateRef.current(valueRef.current);
    }
    Promise.resolve(result).then(
      (valid) => setInvalid(!valid),
      () => setInvalid(true),
    );
  }, [inputRef]);

  // 防抖句柄跨渲染复用：值快速连续变更时只保留最后一次校验
  const debouncedCheck = useMemo(() => debounce(check, 250), [check]);
  useEffect(() => () => debouncedCheck.cancel(), [debouncedCheck]);

  useEffect(() => {
    if (!interactedRef.current && value === initialValueRef.current) {
      return;
    }
    interactedRef.current = true;
    debouncedCheck();
  }, [value, debouncedCheck]);

  return {
    invalid,
    handleBlur: check,
    handleFocus: () => setInvalid(false),
    revalidate: check,
  };
}

/**
 * Dropdown/ComboBoxInput共用的菜单键盘高亮：移动端点钳制不环绕
 * （对齐原版MenuSelectWidget static.listWrapsAround=false），
 * 无高亮时↓从首项、↑从末项起步；菜单开启时点击外部/Escape关闭
 */
export function useMenuPopup<T extends string | number>({
  open,
  onClose,
  values,
  ignore,
}: {
  open: boolean;
  onClose: () => void;
  /** 可选项值集合（有value且未禁用） */
  values: T[];
  ignore?: DismissIgnoreTarget[];
}) {
  const [highlightedValue, setHighlightedValue] = useState<T>();

  const moveHighlight = (delta: number) => {
    if (!values.length) {
      return;
    }
    const currentIndex = highlightedValue === undefined ? -1 : values.indexOf(highlightedValue);
    const nextIndex = currentIndex === -1
      ? (delta > 0 ? 0 : values.length - 1)
      : clamp(currentIndex + delta, 0, values.length - 1);
    setHighlightedValue(values[nextIndex]);
  };

  useDismissablePopover({ enabled: open, onClose, ignore });

  return { highlightedValue, setHighlightedValue, moveHighlight };
}

/** 锚定浮层布局结果（页面坐标，portal至body后使用） */
export interface AnchoredPanelLayout {
  /** 面板左上角页面坐标 */
  top: number;
  /** 面板左上角页面坐标 */
  left: number;
  /** 需要写入的宽度；仅matchAnchorWidth时给出 */
  width?: number;
  /** 内容需裁剪时的maxHeight（px）；undefined表示清除裁剪 */
  maxHeight?: number;
  /** 锚点滚出视口（仅hideWhenOutOfView时判定） */
  outOfView: boolean;
  /** 面板有效文本方向（Provider.dir覆盖锚点继承方向），供浮层根设置dir属性 */
  dir: 'ltr' | 'rtl';
}

/**
 * 锚定浮层的定位与视口钳高（MenuSelect/PopupToolGroup共用）：
 * 面板按页面坐标定位于锚点正下/正上方（页面坐标随滚动自然跟随），水平对齐锚点起始边
 * （RTL下为右缘，对齐原版horizontalPosition:'start'的语义），空间不足时将内容钳至可用
 * 高度并改为内部滚动；开启/滚动/缩放及recomputeKey变化时重算。
 * 返回布局供调用方写入style（React受控渲染或命令式均可）
 */
export function useAnchoredPanelLayout({
  open,
  anchor,
  panelRef,
  position = 'below',
  matchAnchorWidth = false,
  hideWhenOutOfView = false,
  clip = true,
  recomputeKey,
}: {
  open: boolean;
  /** 锚点元素或其ref（MenuSelect的container可为元素） */
  anchor: RefObject<HTMLElement | null> | HTMLElement | null | undefined;
  panelRef: RefObject<HTMLElement | null>;
  /** 展开方向：below为锚点下方，above为锚点上方 */
  position?: 'above' | 'below';
  /** 面板宽度是否取锚点宽度（下拉菜单对齐输入框宽度） */
  matchAnchorWidth?: boolean;
  /** 锚点滚出视口时是否上报outOfView（并跳过裁剪） */
  hideWhenOutOfView?: boolean;
  /** 是否按视口空间钳高（关闭则只定位） */
  clip?: boolean;
  /** 额外重算触发源（如PopupToolGroup的工具集变化导致面板高度变化） */
  recomputeKey?: unknown;
}): AnchoredPanelLayout | null {
  const [layout, setLayout] = useState<AnchoredPanelLayout | null>(null);
  const configDir = useDir();
  const spacing = useViewportSpacing();

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open) {
      setLayout(null);
      // 关闭时还原裁剪，避免下次测量取到被钳制的尺寸
      if (panel) {
        panel.style.maxHeight = '';
        panel.style.overflowY = '';
      }
      return;
    }
    const compute = (): AnchoredPanelLayout | null => {
      const el = panelRef.current;
      const anchorEl = resolveElement(anchor);
      if (!el || !anchorEl) {
        return null;
      }
      // 面板方向：Provider.dir覆盖锚点元素的继承方向（对齐原版Element config.dir优先）
      const dir = configDir ?? getElementDir(anchorEl);
      // 清除上一轮钳高，测量自然尺寸（避免以钳后高度为基准逐轮收缩）
      el.style.maxHeight = '';
      el.style.overflowY = '';
      const rect = anchorEl.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const outOfView = hideWhenOutOfView
        && (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw);
      // maxHeight为content-box高度：需扣除面板上下border，否则钳高后面板边缘仍越界视口
      const naturalHeight = el.offsetHeight;
      const borderHeight = el.offsetHeight - el.clientHeight;
      let top: number;
      let maxHeight: number | undefined;
      if (position === 'above') {
        const available = Math.max(0, rect.top - spacing.top);
        // 钳高后底缘仍贴锚点顶缘，向上收缩
        const clampedHeight = Math.min(naturalHeight, available);
        top = rect.top + scrollY - clampedHeight;
        if (naturalHeight > available) {
          maxHeight = Math.max(0, available - borderHeight);
        }
      } else {
        top = rect.bottom + scrollY;
        if (!outOfView && clip) {
          const available = vh - rect.bottom - spacing.bottom;
          if (naturalHeight > available) {
            maxHeight = Math.max(0, available - borderHeight);
          }
        }
      }
      // 水平对齐锚点起始边；RTL下起始边为右缘（matchAnchorWidth时面板宽度等于锚点，坐标一致）
      const left = dir === 'rtl' && !matchAnchorWidth
        ? rect.left + rect.width - el.offsetWidth + scrollX
        : rect.left + scrollX;
      return {
        top,
        left,
        width: matchAnchorWidth ? rect.width : undefined,
        maxHeight,
        outOfView,
        dir,
      };
    };

    setLayout(compute());
    const recompute = () => setLayout(compute());
    window.addEventListener('resize', recompute);
    document.addEventListener('scroll', recompute, true);
    return () => {
      window.removeEventListener('resize', recompute);
      document.removeEventListener('scroll', recompute, true);
    };
  }, [open, anchor, panelRef, position, matchAnchorWidth, hideWhenOutOfView, clip, recomputeKey, configDir, spacing]);

  return layout;
}

/**
 * 切换激活面板后自动聚焦其内首个可聚焦元素，对齐原版Index/BookletLayout.onStackLayoutSet：
 * 焦点已在该面板内时不重复聚焦。`onBeforeFocus`供调用方在聚焦前执行滚动等动作
 * （每轮激活变化调用一次，含首次）；`skipInitialFocus`用于首帧不聚焦（IndexLayout行为）
 */
export function useAutoFocusPanel({
  activeValue,
  enabled = true,
  rootRef,
  activeSelector,
  skipInitialFocus = false,
  onBeforeFocus,
  onAfterFocus,
  recomputeKey,
}: {
  activeValue: string | number | undefined;
  /** 是否执行聚焦（autoFocus）；false时仍调用onBeforeFocus */
  enabled?: boolean;
  /** 面板容器根节点 */
  rootRef: RefObject<HTMLElement | null>;
  /** 激活面板的选择器（如`.oo-ui-tabPanelLayout-active`） */
  activeSelector: string;
  /** 首次生效（挂载）时是否跳过聚焦 */
  skipInitialFocus?: boolean;
  /** 聚焦前回调（如continuous模式下滚动至目标页）；入参isFirst标记是否首次生效 */
  onBeforeFocus?: (activePanel: HTMLElement, isFirst: boolean) => void;
  /** 聚焦后回调（如携带事件通知调用方） */
  onAfterFocus?: (activePanel: HTMLElement, focusable: HTMLElement | undefined) => void;
  /** 额外重算触发源（如BookletLayout的continuous变化） */
  recomputeKey?: unknown;
}): void {
  const isFirstRef = useRef(true);
  // 回调经ref读取最新，避免内联函数导致effect反复触发
  const onBeforeFocusRef = useRef(onBeforeFocus);
  onBeforeFocusRef.current = onBeforeFocus;
  const onAfterFocusRef = useRef(onAfterFocus);
  onAfterFocusRef.current = onAfterFocus;
  useEffect(() => {
    if (activeValue === undefined) {
      return;
    }
    const activePanel = rootRef.current?.querySelector<HTMLElement>(activeSelector);
    if (!activePanel) {
      return;
    }
    const isFirst = isFirstRef.current;
    isFirstRef.current = false;
    onBeforeFocusRef.current?.(activePanel, isFirst);
    if (!enabled || (skipInitialFocus && isFirst)) {
      return;
    }
    if (activePanel.contains(document.activeElement)) {
      return;
    }
    const focusable = getFirstFocusable(activePanel);
    focusable?.focus();
    onAfterFocusRef.current?.(activePanel, focusable);
  }, [activeValue, enabled, rootRef, activeSelector, skipInitialFocus, recomputeKey]);
}
