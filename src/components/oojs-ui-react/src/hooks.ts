import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  // 以别名导入：DOM的KeyboardEvent在下文经globalThis引用，避免被React的类型遮蔽
  type KeyboardEvent as ReactKeyboardEvent,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type MutableRefObject,
  type Ref,
  type RefObject,
} from 'react';
import { clamp, debounce } from 'es-toolkit';
import { useDir, useViewportSpacing } from './config';
import {
  findRelativeSelectableItem,
  getFirstFocusable,
  getElementDir,
  resolveElement,
  type ElementOrRef,
} from './utils';

/**
 * FieldLayout与字段组件的标签联动通道（对齐原版FieldLayout按getInputId()分流的双路径）：
 * 含原生input的字段经`inputId`与label的htmlFor原生关联（原版path 1， getInputId为
 * 可标记元素自动生成id）；无原生input的组件注册标签点击激活回调（对齐原版
 * simulateLabelClick）并经`labelId`挂aria-labelledby（对齐原版setLabelledBy，原版path 2）。
 * 通道按组件形态认领：输入类组件只走通道A；组容器（RadioSelect/CheckboxMultiselect）经
 * useFieldGroupLabelLink屏蔽通道A后只走通道B，保证不双触发
 */
export interface FieldLabelLink {
  /** 原生input应使用的id（label的htmlFor指向它）；选项组容器经useFieldGroupLabelLink屏蔽后为undefined */
  inputId?: string;
  /** 标签元素id，供无原生input的组件经aria-labelledby引用 */
  labelId: string;
  /** 注册标签点击的激活回调，返回注销函数 */
  registerLabelActivate: (activate: () => void) => () => void;
}

const FieldLabelLinkContext = createContext<FieldLabelLink | null>(null);

/** FieldLayout向字段子树下发联动通道（仅供FieldLayout使用） */
export const FieldLabelLinkProvider = FieldLabelLinkContext.Provider;

/**
 * 输入类组件（通道A）：取原生input/select应挂的id，显式`inputId`优先，不在FieldLayout内时
 * 返回undefined。id与label的htmlFor配合后，点击标签的聚焦/切换由浏览器原生处理
 */
export function useFieldInputId(explicitId?: string): string | undefined {
  const link = useContext(FieldLabelLinkContext);
  return explicitId ?? link?.inputId;
}

/**
 * 选项组容器（RadioSelect/CheckboxMultiselect等）的通道A屏蔽：组内每个选项input都会认领
 * 同一个字段id——产生重复id，且label原生激活首个选项（原版组容器getInputId()为null，
 * 标签点击走simulateLabelClick聚焦而非切换）。经此改写下发值：仅屏蔽inputId，labelId与
 * 激活回调注册照常下发；不在FieldLayout内时返回null（无需再下发）
 */
export function useFieldGroupLabelLink(): FieldLabelLink | null {
  const link = useContext(FieldLabelLinkContext);
  return useMemo(() => (link ? { ...link, inputId: undefined } : null), [link]);
}

/**
 * 非input类组件（通道B）：注册标签点击的激活回调（激活逻辑随渲染更新经ref读取），
 * 返回标签元素id供组件根挂aria-labelledby；不在FieldLayout内时返回undefined且不注册
 */
export function useFieldLabelActivate(activate: () => void): string | undefined {
  const link = useContext(FieldLabelLinkContext);
  const activateRef = useRef(activate);
  activateRef.current = activate;
  const register = link?.registerLabelActivate;
  useEffect(
    () => (register ? register(() => activateRef.current()) : undefined),
    [register],
  );
  return link?.labelId;
}

/**
 * 稳定的多ref合并回调（回调引用跨渲染稳定）：
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
 * 通道B的标签点击激活（对齐原版`TabIndexedElement.simulateLabelClick`的默认实现）：
 * 点击FieldLayout标签时聚焦组件根元素，禁用时不聚焦（原版`focus()`内含isDisabled判断）。
 * 内部持有根元素ref并与外部转发的ref合并，返回合并后的ref回调、内部ref与标签元素id。
 * 落点不是根元素或需附带副作用的组件传`activate`覆盖默认的聚焦：
 * Dropdown聚焦handle、ToggleButton经内部锚点聚焦、ToggleSwitch额外翻转值、
 * CheckboxMultiselect聚焦首个可用选项（不经根元素）
 */
export function useFieldLabelFocus<T extends HTMLElement>({
  ref,
  disabled,
  activate,
}: {
  /** 外部转发的根元素ref */
  ref?: Ref<T>;
  /** 禁用时不激活 */
  disabled?: boolean;
  /** 自定义激活动作，入参为根元素；缺省聚焦根元素 */
  activate?: (el: T | null) => void;
}): {
  /** 合并内部ref与外部ref后的根元素ref回调 */
  setRef: (node: T | null) => void;
  /** 内部持有的根元素ref，供组件自身读取（如Dropdown的浮层忽略目标） */
  rootRef: RefObject<T | null>;
  /** 标签元素id，供根元素挂aria-labelledby */
  fieldLabelId: string | undefined;
} {
  const rootRef = useRef<T>(null);
  const setRef = useMergedRefs(ref, rootRef);
  // 激活回调经useFieldLabelActivate的ref读取，闭包里的disabled/activate恒为最新值
  const fieldLabelId = useFieldLabelActivate(() => {
    if (disabled) {
      return;
    }
    if (activate) {
      activate(rootRef.current);
    } else {
      rootRef.current?.focus();
    }
  });
  return { setRef, rootRef, fieldLabelId };
}

/**
 * 跟踪最新值的ref（渲染期同步），供事件监听/定时器等场景经ref读取最新props：
 * 既避免闭包过期，又使监听等只需挂载一次的资源不必随回调身份变化反复重挂
 */
export function useLatestRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

/**
 * 受控/非受控通用值状态（对齐React受控组件惯例，原版通过setters维护无对应物）：
 * 传入`value`即受控模式（内部state不生效）；否则维护内部state并以`defaultValue`初始化。
 * `commit`供事件回调使用：非受控时同步内部state，并始终转发给`onChange`；
 * 入参支持函数式更新（对齐setState惯例，经ref取最新已提交值）。
 * 另返回`commitIfChanged`（仅值变化时提交），供选择集类组件使用。
 * `commit`经useCallback稳定（内部经ref读最新值与回调），依赖它的effect不会因回调
 * 身份每渲染变化而重跑
 */
export function useControlledValue<T, E = never>(
  { value, defaultValue }: { value?: T; defaultValue?: T },
  onChange?: (value: T, event?: E) => void,
) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<T | undefined>(defaultValue);
  // 非受控时innerValue以defaultValue初始化，语义上始终有值；断言为T以保持调用侧类型简洁
  const currentValue = (isControlled ? value : innerValue) as T;
  const currentValueRef = useLatestRef(currentValue);
  const onChangeRef = useLatestRef(onChange);
  // 仅isControlled参与依赖：受控/非受控切换属模式变更（React不推荐），此时允许commit更新
  const commit = useCallback((nextValue: T | ((prev: T) => T), event?: E) => {
    const resolved = typeof nextValue === 'function'
      ? (nextValue as (prev: T) => T)(currentValueRef.current)
      : nextValue;
    if (!isControlled) {
      setInnerValue(resolved);
    }
    onChangeRef.current?.(resolved, event);
  }, [isControlled, currentValueRef, onChangeRef]);
  /**
   * 仅当值变化时提交。选择集类组件（Select/TabSelect/ButtonSelect/Dropdown/ComboBoxInput）的
   * 选中语义用它——对齐原版`SelectWidget.selectItem`对已选中项的提前返回（重复选中同一项不
   * 派发事件）。输入类组件**不要**用它：其`commit`的"始终转发"语义是刻意的（见上）
   */
  const commitIfChanged = useCallback((nextValue: T, event?: E) => {
    if (nextValue !== currentValueRef.current) {
      commit(nextValue, event);
    }
  }, [commit, currentValueRef]);
  return { value: currentValue, isControlled, commit, commitIfChanged } as const;
}

/**
 * 受控值非法时的回写：受控值不在可用值集合内（组件实际显示的是生效值）时，
 * 经`onNotify`把生效值交还父级，使父级state与显示值收敛，避免两者漂移。
 * 对齐原版受控语义：`DropdownInput`/`RadioSelectInput`的`setValue`会对非法值回退到
 * 首个可选值并写回组件值，React受控模式下该写回只能经回调交还父级。
 * 同一非法值只回写一次（父级未采纳时不会因外部重渲染反复触发）；无生效值可写时不动。
 * `useLayoutSelection`的受控回写共用同一守卫
 */
export function useControlledValueNotify<T>(
  controlledValue: T | undefined,
  effectiveValue: T | undefined,
  onNotify?: (value: T) => void,
): void {
  // 已回写过的非法受控值：父级若忽略回调，state不变，据此防止反复触发
  const notifiedRef = useRef<T | undefined>(undefined);
  const onNotifyRef = useLatestRef(onNotify);
  useEffect(() => {
    if (controlledValue === undefined || effectiveValue === undefined) {
      return;
    }
    if (controlledValue === effectiveValue || notifiedRef.current === controlledValue) {
      return;
    }
    notifiedRef.current = controlledValue;
    onNotifyRef.current?.(effectiveValue);
  }, [controlledValue, effectiveValue, onNotifyRef]);
}

/**
 * 计算布局类组件的生效激活值：值在options内则原样返回；值缺失（首次无值）或失效
 * （不在options内，如页被移除）时按邻近优先回退——据`prevOptions`中该值的位置取
 * 原位置→前一项→首项。prevOptions须为上一轮的options（失效值可能已不在新列表中）
 */
export function resolveLayoutSelection<T extends string | number>(
  value: T | undefined,
  options: { value: T }[],
  prevOptions: { value: T }[],
): T | undefined {
  if (options.length === 0) {
    return undefined;
  }
  if (value === undefined) {
    return options[0].value;
  }
  if (options.some((option) => option.value === value)) {
    return value;
  }
  const oldIndex = prevOptions.findIndex((option) => option.value === value);
  return (options[oldIndex] ?? options[oldIndex - 1] ?? options[0]).value;
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
  /**
   * 仅值变化时选择激活项（对齐原版`StackLayout.setItem`/`BookletLayout.setPage`
   * 对同值的提前返回），供用户主动切换页签的场景使用
   */
  selectIfChanged: (value: T) => void;
} {
  const { value: innerValue, isControlled, commit } = useControlledValue<T>({ value, defaultValue }, onChange);
  // 上一轮options：失效值需据其在旧列表中的位置定位相邻项。显式依赖options，
  // 使"上一轮"语义在批处理下确定（值失效与列表变化同批发生时，本渲染仍读旧列表）
  const prevOptionsRef = useRef(options);
  const effectiveValue = resolveLayoutSelection(innerValue, options, prevOptionsRef.current);

  useEffect(() => {
    prevOptionsRef.current = options;
  }, [options]);

  // 受控回写（同一非法值仅一次）与非受控内部state收敛：两条路径各自独立，
  // 受控时由父级决定是否采纳，非受控时立即提交使内部state与生效值一致
  useControlledValueNotify(isControlled ? innerValue : undefined, effectiveValue, onChange);
  useEffect(() => {
    if (!isControlled && effectiveValue !== undefined && effectiveValue !== innerValue) {
      commit(effectiveValue);
    }
  }, [isControlled, effectiveValue, innerValue, commit]);

  // 布局侧的选择入口统一为一元签名：调用方可能附带事件（如StackLayout的onPageFocus携带
  // FocusEvent），而ChangeHandler约定第二参数为change事件，故在此从运行时剥掉多余入参
  const select = useCallback((next: T) => commit(next), [commit]);
  /**
   * 仅在与生效值不同时选择（对齐原版`BookletLayout.setPage`与当前页比较的提前返回）：
   * 受控值非法时生效值已是回退值，点击该回退项不再重复派发
   */
  const selectIfChanged = useCallback((next: T) => {
    if (next !== effectiveValue) {
      commit(next);
    }
  }, [effectiveValue, commit]);

  return { effectiveValue, select, selectIfChanged };
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
  // label是否实际渲染内容：布尔化后入依赖（表达式直接写依赖数组无法被静态检查）
  const hasLabelContent = !!label;

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
  }, [labelRef, hasLabelContent]);

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
  ignore?: ElementOrRef[];
}): void {
  const onCloseRef = useLatestRef(onClose);
  const ignoreRef = useLatestRef(ignore);
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
  }, [enabled, onCloseRef, ignoreRef]);
}

/**
 * 按压态管理（Button/ButtonInput/Tool组共用，对齐原版ButtonElement/ToolGroup的
 * onDocumentMouseUp/onDocumentKeyUp范式）：鼠标左键或Enter/空格按下进入按压态，
 * document级capture监听mouseup/keyup复位（释放可能发生在目标外）；按压流可能在上一流
 * 结束前再次开始（鼠标→键盘混用），以集合管理document监听，卸载时兜底全量移除。
 * 按压目标经`resolveTarget`从事件target解析（组内委托场景如Tool组经data-tool-name反查），
 * 缺省为单元素按压；释放落在发起目标上时经`onTrigger`触发（Tool组的onSelect位，Button系
 * 依赖原生click触发无需传）
 */
export function usePressedState<T = boolean, E extends HTMLElement = HTMLElement>({
  disabled,
  resolveTarget,
  canPress,
  onTrigger,
  preventDefaultOnPress = false,
  onMouseDown: passMouseDown,
  onMouseUp: passMouseUp,
  onKeyDown: passKeyDown,
  onKeyUp: passKeyUp,
}: {
  /** 禁用时按下不进入按压态 */
  disabled?: boolean;
  /** 从事件目标解析按压目标，返回null表示不在任何可按压目标上；缺省单元素按压 */
  resolveTarget?: (node: EventTarget | null) => T | null;
  /** 按下准入校验（如Tool组排除disabled工具）；缺省全部可按 */
  canPress?: (target: T) => boolean;
  /** 释放（mouseup/keyup）落在发起目标上时触发 */
  onTrigger?: (target: T) => void;
  /** 按下被接受时阻止默认行为（Tool组防拖动选中文本/焦点转移；Button不阻止以保留点击聚焦） */
  preventDefaultOnPress?: boolean;
  /**
   * 调用方透传的mousedown回调，**先于**按压逻辑无条件转发：按压逻辑含disabled/非左键
   * 的提前返回，置于其后会导致这些分支下调用方收不到事件
   */
  onMouseDown?: MouseEventHandler<E>;
  /** 调用方透传的mouseup回调，同为先于按压复位无条件转发 */
  onMouseUp?: MouseEventHandler<E>;
  /** 调用方透传的keydown回调，同为先于按压逻辑无条件转发 */
  onKeyDown?: KeyboardEventHandler<E>;
  /** 调用方透传的keyup回调，同为先于按压复位无条件转发 */
  onKeyUp?: KeyboardEventHandler<E>;
}): {
  /** 是否处于按压中 */
  pressed: boolean;
  /** 按压中的目标；null为无按压（单元素按压时恒为真值） */
  pressedTarget: T | null;
  onMouseDown: MouseEventHandler<E>;
  onMouseUp: MouseEventHandler<E>;
  onKeyDown: KeyboardEventHandler<E>;
  onKeyUp: KeyboardEventHandler<E>;
} {
  const [pressedTarget, setPressedTarget] = useState<T | null>(null);
  // 活跃document监听的处理器集合（按压后组件卸载的边界场景），卸载时兜底移除；
  // ref惰性初始化，避免每渲染新建Set即丢
  const mouseUpHandlersRef = useRef<Set<(ev: globalThis.MouseEvent) => void> | null>(null);
  const keyUpHandlersRef = useRef<Set<(ev: globalThis.KeyboardEvent) => void> | null>(null);
  // 处理器闭包经ref读取最新配置：监听挂载期间props更新（disabled/onTrigger等）后仍取新值
  const configRef = useLatestRef({ disabled, resolveTarget, canPress, onTrigger });
  // 调用方透传的事件回调：与configRef同理经ref读取，在按压处理之后转发。
  // 对齐原版ButtonElement mixin在同一处处理按压与用户回调，React的单handler模型需手工串联
  const passThroughRef = useLatestRef({
    onMouseDown: passMouseDown,
    onMouseUp: passMouseUp,
    onKeyDown: passKeyDown,
    onKeyUp: passKeyUp,
  });
  useEffect(() => () => {
    for (const handler of mouseUpHandlersRef.current ?? []) {
      document.removeEventListener('mouseup', handler, true);
    }
    for (const handler of keyUpHandlersRef.current ?? []) {
      document.removeEventListener('keyup', handler, true);
    }
    mouseUpHandlersRef.current?.clear();
    keyUpHandlersRef.current?.clear();
  }, []);

  /** 挂载document级capture监听：释放时复位按压态并执行一次性释放逻辑（handler自移除并退出集合） */
  const armDocumentMouseUp = (onRelease: (ev: globalThis.MouseEvent) => void) => {
    const handler = (ev: globalThis.MouseEvent) => {
      document.removeEventListener('mouseup', handler, true);
      mouseUpHandlersRef.current?.delete(handler);
      setPressedTarget(null);
      onRelease(ev);
    };
    (mouseUpHandlersRef.current ??= new Set()).add(handler);
    document.addEventListener('mouseup', handler, true);
  };

  const armDocumentKeyUp = (onRelease: (ev: globalThis.KeyboardEvent) => void) => {
    const handler = (ev: globalThis.KeyboardEvent) => {
      document.removeEventListener('keyup', handler, true);
      keyUpHandlersRef.current?.delete(handler);
      setPressedTarget(null);
      onRelease(ev);
    };
    (keyUpHandlersRef.current ??= new Set()).add(handler);
    document.addEventListener('keyup', handler, true);
  };

  /** 解析按压目标：未提供resolveTarget时为单元素按压（恒定目标）；不可按压时返回null */
  const resolvePressTarget = (node: EventTarget | null): T | null => {
    const { resolveTarget: resolve, canPress: canPressNow } = configRef.current;
    const target = resolve ? resolve(node) : (true as T);
    if (target === null || (canPressNow && !canPressNow(target))) {
      return null;
    }
    return target;
  };

  const onMouseDown: MouseEventHandler<E> = (e) => {
    passThroughRef.current.onMouseDown?.(e);
    if (configRef.current.disabled || e.button !== 0) {
      return;
    }
    const target = resolvePressTarget(e.target);
    if (target === null) {
      return;
    }
    if (preventDefaultOnPress) {
      // 对齐原版onMouseKeyDown返回false：阻止默认（拖动选中文本/焦点转移）
      e.preventDefault();
    }
    setPressedTarget(target);
    armDocumentMouseUp((ev) => {
      const { resolveTarget: resolve, onTrigger: trigger } = configRef.current;
      // 释放落在发起目标上时触发（原版onDocumentMouseKeyUp的目标匹配语义）
      if (trigger && resolve && resolve(ev.target) === target) {
        trigger(target);
      }
    });
  };

  /** 鼠标在元素上释放时复位按压态（document监听兜底目标外释放） */
  const onMouseUp: MouseEventHandler<E> = (e) => {
    passThroughRef.current.onMouseUp?.(e);
    if (!configRef.current.disabled) {
      setPressedTarget(null);
    }
  };

  const onKeyDown: KeyboardEventHandler<E> = (e) => {
    passThroughRef.current.onKeyDown?.(e);
    // 长按自动重复的keydown不重复进入按压流，避免keyup时N个监听齐触发onTrigger
    if (e.repeat || configRef.current.disabled || (e.key !== 'Enter' && e.key !== ' ')) {
      return;
    }
    const target = resolvePressTarget(e.target);
    if (target === null) {
      return;
    }
    if (preventDefaultOnPress) {
      e.preventDefault();
    }
    setPressedTarget(target);
    // 记录发起按键：按住Enter再敲空格会先后建立两个并发流，keyup时两个监听都会触发，
    // 复位无碍，但onTrigger须匹配发起键防止重复触发（原版经单一pressed态天然串行化）
    const startKey = e.key;
    armDocumentKeyUp((ev) => {
      const { resolveTarget: resolve, onTrigger: trigger } = configRef.current;
      // 对齐原版onMouseKeyUp：keyup目标须仍解析到发起工具才触发
      if (trigger && resolve && ev.key === startKey && resolve(ev.target) === target) {
        trigger(target);
      }
    });
  };

  /** 元素上松开Enter/空格时复位键盘按压态 */
  const onKeyUp: KeyboardEventHandler<E> = (e) => {
    passThroughRef.current.onKeyUp?.(e);
    if (!configRef.current.disabled && (e.key === 'Enter' || e.key === ' ')) {
      setPressedTarget(null);
    }
  };

  return { pressed: pressedTarget !== null, pressedTarget, onMouseDown, onMouseUp, onKeyDown, onKeyUp };
}

/**
 * 面板内选项DOM的双向索引：值→元素（前缀匹配/滚动读取）与元素→值（事件target定位选项）。
 * `values`为当前渲染的全部选项值：值的ref回调按值缓存、跨渲染稳定（同值复用同一回调，
 * 避免每渲染detach/attach），值移除后其回调缓存随之淘汰（长期运行下不累积）。
 * 调用方须传入与渲染同一份来源的选项值列表
 */
export function useOptionRegistry<T extends string | number>(values: T[]) {
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

  // 淘汰已移除选项的回调缓存（选项集收窄时释放；未在本轮values中的值不会再有ref回调）
  useEffect(() => {
    const active = new Set(values);
    for (const value of callbacksRef.current.keys()) {
      if (!active.has(value)) {
        callbacksRef.current.delete(value);
        itemRefs.current.delete(value);
      }
    }
  }, [values]);

  // 卸载时清空索引与回调缓存
  useEffect(() => () => {
    itemRefs.current.clear();
    itemEls.current.clear();
    callbacksRef.current.clear();
  }, []);

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
  const validateRef = useLatestRef(validate);
  const valueRef = useLatestRef(value);
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
  }, [inputRef, validateRef, valueRef]);

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
  ignore?: ElementOrRef[];
}) {
  const [highlightedValue, setHighlightedValue] = useState<T>();

  /** 相对当前高亮按delta移动高亮，端点钳制不环绕（原版static.listWrapsAround=false） */
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

  /**
   * 菜单导航键处理（对齐原版MenuSelectWidget static.handleNavigationKeys=true的按键集）：
   * ↑↓移动高亮、Home/End跳首末、PageUp/PageDown翻页（±10步长，对齐原版翻页量）；
   * 返回是否消费了按键（空菜单或非导航键返回false），供调用方决定preventDefault
   */
  const handleNavigationKey = (key: string): boolean => {
    if (!values.length) {
      return false;
    }
    switch (key) {
      case 'ArrowUp':
        moveHighlight(-1);
        return true;
      case 'ArrowDown':
        moveHighlight(1);
        return true;
      case 'Home':
        setHighlightedValue(values[0]);
        return true;
      case 'End':
        setHighlightedValue(values[values.length - 1]);
        return true;
      case 'PageUp':
        moveHighlight(-10);
        return true;
      case 'PageDown':
        moveHighlight(10);
        return true;
      default:
        return false;
    }
  };

  useDismissablePopover({ enabled: open, onClose, ignore });

  /**
   * 菜单展开时消费导航键（对齐原版`SelectWidget.onDocumentKeyDown`由基类统一处理，
   * `MenuSelectWidget`继承后Dropdown与ComboBoxInput均经其菜单响应）：命中导航键时
   * 阻止默认行为，返回是否消费。与`handleNavigationKey`的区别是本函数额外包含
   * “仅展开时生效”与preventDefault，供组件的onKeyDown直接转调
   */
  const consumeNavigationKey = (
    event: Pick<ReactKeyboardEvent, 'key' | 'preventDefault'>,
  ): boolean => {
    if (!open || !handleNavigationKey(event.key)) {
      return false;
    }
    event.preventDefault();
    return true;
  };

  return {
    highlightedValue,
    setHighlightedValue,
    handleNavigationKey,
    consumeNavigationKey,
  };
}

/**
 * 直选型选项组的键盘改选（TabSelect/RadioSelect/ButtonSelect共用）。
 * 对齐原版`SelectWidget.onDocumentKeyDown`的直接改选形态：↑↓←→在可选值间环绕移动并直接改选
 * （选项无高亮态），无选中项时↓自首项、↑自末项起步；Enter重申当前选中项（值未变化故不提交，
 * 无选中项不响应）；Home/End/PageUp/PageDown不消费（static.handleNavigationKeys=false）。
 * 仅消费上述按键，其余交还原生行为
 */
export function useGroupKeyboardSelection<T extends string | number>({
  disabled,
  selectableValues,
  value,
  onCommit,
}: {
  /** 组禁用：禁用时所有按键不响应 */
  disabled?: boolean;
  /** 可选值序列（非禁用项，按展示顺序） */
  selectableValues: T[];
  /** 当前选中值 */
  value: T | undefined;
  /** 改选回调（仅值变化时调用：Enter重申当前项、组内仅一个可选值时方向键环绕回自身均不触发） */
  onCommit: (value: T) => void;
}): KeyboardEventHandler<HTMLElement> {
  return (e) => {
    if (disabled || !selectableValues.length) {
      return;
    }
    const currentIndex = value === undefined ? -1 : selectableValues.indexOf(value);
    let next: T | undefined;
    let handled = false;
    switch (e.key) {
      case 'Enter':
        if (currentIndex !== -1) {
          next = selectableValues[currentIndex];
          handled = true;
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'ArrowRight':
        next = findRelativeSelectableItem(
          selectableValues,
          value,
          e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1,
        );
        handled = true;
        break;
    }
    // 目标值即当前值（Enter重申，或组内仅一个可选值时方向键环绕回自身）时不提交：
    // 对齐原版SelectWidget.selectItem对已选中项的提前返回（不派发select事件）
    if (next !== undefined && next !== value) {
      onCommit(next);
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
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
    // 方向按锚点元素缓存：滚动/缩放重算不改文本方向，避免每次重算都触发样式重算
    // （getElementDir读取computed style，在滚动高频路径上会形成同步布局开销）
    let dirAnchorEl: HTMLElement | null = null;
    let cachedDir: 'ltr' | 'rtl' = 'ltr';
    const compute = (): AnchoredPanelLayout | null => {
      const el = panelRef.current;
      const anchorEl = resolveElement(anchor);
      if (!el || !anchorEl) {
        return null;
      }
      // 面板方向：Provider.dir覆盖锚点元素的继承方向（对齐原版Element config.dir优先）
      let dir = configDir;
      if (dir === undefined) {
        if (dirAnchorEl !== anchorEl) {
          dirAnchorEl = anchorEl;
          cachedDir = getElementDir(anchorEl);
        }
        dir = cachedDir;
      }
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
  const onBeforeFocusRef = useLatestRef(onBeforeFocus);
  const onAfterFocusRef = useLatestRef(onAfterFocus);
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
  }, [activeValue, enabled, rootRef, activeSelector, skipInitialFocus, recomputeKey, onBeforeFocusRef, onAfterFocusRef]);
}
