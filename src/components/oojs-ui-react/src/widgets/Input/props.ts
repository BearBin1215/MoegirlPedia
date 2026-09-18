import {
  useLayoutEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type InputHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
  type TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import { useAccessKeyLabel } from '../../config';
import { useFieldInputId, useLabelPadding, useValidityFlag } from '../../hooks';
import { resolveRequiredIndicator, resolveTabIndex, resolveTitle } from '../../mixins';
import { getElementDir } from '../../utils';
import type { Indicators } from '../../Element';
import type { IndicatorBaseProps } from '../Indicator/Base';
import type { LabelPosition } from '../Label';

/** 输入元素的属性约束（input 与 textarea 的并集，形态专属属性如 rows/min/max 皆在其内） */
type InputElementAttributes<T extends HTMLInputElement | HTMLTextAreaElement> =
  Partial<InputHTMLAttributes<T> & TextareaHTMLAttributes<T>>;

/**
 * 调用方经 inputProps 通道可传入的输入元素属性。value/defaultValue 由组件的值管线管理，
 * 从通道类型剔除（传入即与组件的受控/非受控语义打架）；onChange 允许传入，
 * 会被串联在组件自身逻辑之后（见 useInputProps 的合并规则）而非替换。
 * 泛型不约束元素类型：TextInputProps 的元素类型参数面向 Ref 透传，须接受任意 T
 */
export type UserInputProps<T = HTMLInputElement | HTMLTextAreaElement> =
  Partial<Omit<InputHTMLAttributes<T> & TextareaHTMLAttributes<T>, 'value' | 'defaultValue'>>;

/**
 * 输入类组件的公共派生配置（TextInput/MultilineTextInput/NumberInput/ComboBoxInput共用）。
 * 以下七项在原版同属 InputWidget/TextInputWidget 的行为分层，由 useInputProps 统一派生：
 * 属性落点（title/accessKey/tabIndex/dir 均落输入元素）、字段id（FieldLayout的通道A）、
 * 标签让位的内边距、required 指示器的缺省回退、图标与指示器的 mousedown 聚焦、软校验的
 * aria-invalid、指示器槽位的属性合并
 */
export interface InputCommonConfig<T extends HTMLInputElement | HTMLTextAreaElement, V extends string | number> {
  /** 内部输入元素引用（软校验的检查载体，也是装饰元素聚焦的执行目标） */
  inputRef: RefObject<T | null>;

  /**
   * 组件根元素引用：标签让位与滚动条让位的内边距落侧按**根元素**（样式表）方向解析
   * （对齐原版`positionLabel`读`$element.css('direction')`）。不能用输入元素自身的`dir`——
   * 按原版它只落在输入元素上、仅影响文本方向，不改变标签由主题CSS以物理left/right定位的落侧
   */
  rootRef: RefObject<HTMLElement | null>;

  /** 当前值（受控/非受控已由调用方收敛），用于软校验与输入框的value属性 */
  value: V;

  /** 是否禁用 */
  disabled?: boolean;

  /** 显式tabIndex（禁用时被覆盖为-1） */
  tabIndex?: number;

  /** 快捷键（与原版 AccessKeyedElement 一致落在输入元素上） */
  accessKey?: string;

  /** 表单字段名 */
  name?: string;

  /** 是否只读 */
  readOnly?: boolean;

  /** 是否必填（同时驱动 required 指示器的缺省回退） */
  required?: boolean;

  /** 输入提示 */
  placeholder?: string;

  /** 最大长度（原版经 maxlength 属性生效） */
  maxLength?: number;

  /** 原始title（与label/invisibleLabel/accessKey一并经resolveTitle解析后落输入元素） */
  title?: string;

  /** 标签不可见（tooltip兜底到title的判定入参，见resolveTitle） */
  invisibleLabel?: boolean;

  /** 文本方向（原版 setDir 落在 $input，故同样落输入元素而非根元素） */
  dir?: string;

  /** 标签元素引用，用于按标签宽度给输入框预留内边距 */
  labelRef: RefObject<HTMLElement | null>;

  /** 标签内容（同时用于标签让位的内边距测量与title兜底） */
  label?: ReactNode;

  /** 标签位置，决定预留内边距落在哪一侧 */
  labelPosition?: LabelPosition;

  /** 组件指示器 */
  indicator?: Indicators;

  /**
   * 指示器槽位覆写：非undefined时完全接管（null=明确无，抑制required缺省回退），
   * 对齐原版 SearchInputWidget 构造后经 setIndicator(null) 盖掉缺省指示器的做法
   */
  indicatorOverride?: Indicators | null;

  /** 指示器的附加属性（其 onMouseDown 与装饰聚焦串联，聚焦在前） */
  indicatorProps?: Omit<IndicatorBaseProps, 'indicator'>;

  /** 软校验（已归一化的判定函数）；缺省仅浏览器原生约束 */
  validate?: (value: V) => boolean | Promise<boolean>;

  /**
   * 挂载期即校验一次（不作"首值不校验"的跳过）。对齐原版构造期即输出的非法标记
   * （如空值+required在加载时即标记）；缺省false——其余输入形态与原版一致不在构造期标记
   */
  validateOnMount?: boolean;

  /**
   * 值变更提交：输入框原生字符串值→调用方的值形态（如NumberInput的数值解析）。
   * 该管线挂在onChange内最先执行，调用方经inputProps传入的onChange串联其后、无法截断
   */
  onCommitValue?: (value: string, event: ChangeEvent<T>) => void;

  /** 输入框的附加样式（autosize 高度等），与标签让位的内边距合并后输出 */
  inputStyle?: CSSProperties;

  /**
   * 垂直滚动条宽度（px）：出现滚动条且labelPosition为after时，把该宽度计入标签同侧的
   * 输入框内边距，对齐原版positionLabel的`labelWidth + (after ? scrollWidth : 0)`
   */
  scrollbarWidth?: number;
}

/**
 * 合并组件内部与调用方的同名事件处理器：两者皆为函数且键以`on`开头时串联为一个处理器，
 * **内部逻辑在前、调用方在后**，并把该键从调用方属性中移除（避免其后展开时覆盖串联结果）。
 * 其余键原样保留。用于`useInputProps`的`inputProps`通道——事件处理器不采用"调用方覆盖"
 * 语义，调用方传入处理器不应截断组件自身的交互管线
 * @param own 组件内部（形态专属）属性
 * @param user 调用方通道属性，返回的对象中已移除被串联消费掉的键
 */
export function chainEventHandlers(
  own: Record<string, unknown>,
  user: Record<string, unknown>,
): [Record<string, unknown>, Record<string, unknown>] {
  const chainedOwn = { ...own };
  const remainingUser = { ...user };
  for (const key of Object.keys(remainingUser)) {
    const ownHandler = chainedOwn[key];
    const userHandler = remainingUser[key];
    if (key.startsWith('on') && typeof ownHandler === 'function' && typeof userHandler === 'function') {
      chainedOwn[key] = (...args: unknown[]) => {
        (ownHandler as (...inner: unknown[]) => void)(...args);
        (userHandler as (...inner: unknown[]) => void)(...args);
      };
      delete remainingUser[key];
    }
  }
  return [chainedOwn, remainingUser];
}

/**
 * 组件根元素（样式表）的有效方向：标签由主题CSS以物理left/right定位，故内边距取侧须
 * 跟随样式表方向（对齐原版`positionLabel`读`$element.css('direction')`），不读输入元素
 * 自身的`dir`——按原版`dir`只落在输入元素上、仅影响文本方向。
 * 挂载时读一次即定：原版每次调`positionLabel`（元素attach、updatePosition、滚动条分支）
 * 都会重读方向，本工程不做这层重读（页面方向在会话内稳定；方向动态切换须重挂载才生效）
 */
function useRootDirection(rootRef: RefObject<HTMLElement | null>): boolean {
  const [rtl, setRtl] = useState(false);
  useLayoutEffect(() => {
    setRtl(getElementDir(rootRef.current) === 'rtl');
  }, [rootRef]);
  return rtl;
}

/**
 * 派生输入元素的公共属性与周边联动。
 * 值的 state 与 onChange 由调用方各自持有（值解析管线经 config.onCommitValue 注入），
 * 形态差异（type/rows/min/max/step/combobox角色/按键处理器）经返回的
 * `inputProps(overrides, userProps)` 传入，合并规则：
 * - className/style/id：公共项与两侧属性合并（公共项在前）；
 * - 事件处理器：两侧同名者一律串联（组件内部逻辑在前、调用方通道在后），调用方无法
 *   截断组件自身的交互管线（如ComboBoxInput的菜单导航、NumberInput的方向键步进）；
 * - 其余非事件属性：overrides先展开、userProps（调用方通道）后展开覆盖，
 *   作为声明过的逃生舱（如aria-*透传）
 */
export function useInputProps<T extends HTMLInputElement | HTMLTextAreaElement, V extends string | number>(
  config: InputCommonConfig<T, V>,
) {
  const {
    inputRef,
    rootRef,
    value,
    validate,
    validateOnMount = false,
    disabled,
    tabIndex,
    accessKey,
    name,
    readOnly,
    required,
    placeholder,
    maxLength,
    title,
    invisibleLabel,
    dir,
    labelRef,
    label,
    labelPosition = 'after',
    indicator,
    indicatorOverride,
    indicatorProps,
    onCommitValue,
    inputStyle,
    scrollbarWidth,
  } = config;

  // FieldLayout标签联动（通道A）：input认领字段id，与label的htmlFor原生关联
  const fieldInputId = useFieldInputId();
  // 标签让位的内边距落侧依据：根元素（样式表）方向，同时供滚动条宽度的并入侧使用
  const rtl = useRootDirection(rootRef);
  // 标签让位：input按标签宽度预留内边距（标签内容/字体变化经ResizeObserver跟踪）
  const labelPadding = useLabelPadding(labelRef, label, labelPosition, rtl);
  // 软校验反馈：非法时输入框输出 aria-invalid（根元素的 invalid 标志类由调用方取返回的 invalid 输出）
  const { invalid, handleBlur, handleFocus, revalidate } = useValidityFlag<T, V>({
    inputRef,
    value,
    validate,
    validateOnMount,
  });

  // title/accessKey同落input（原版$titled=$accessKeyed=$input，解析见resolveTitle）；
  // 快捷键文案由宿主解析（未提供时title附原键值）
  const accessKeyLabel = useAccessKeyLabel(accessKey);
  const resolvedTitle = resolveTitle({ title, label, invisibleLabel, accessKey, accessKeyLabel });

  /**
   * 对齐原版 onIconMouseDown/onIndicatorMouseDown：左键点击图标/指示器聚焦输入框
   * （先阻止默认以拦下焦点转移，再显式聚焦输入框）
   */
  const handleDecorationMouseDown: MouseEventHandler<HTMLElement> = (event) => {
    if (event.button === 0) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  };

  /** 指示器取值：覆写通道优先，否则经 RequiredElement 的缺省回退解析 */
  const resolvedIndicator = indicatorOverride !== undefined
    ? indicatorOverride
    : resolveRequiredIndicator(indicator, required);

  // 输入框的 style 单一来源：标签让位的内边距在前、滚动条让位居中、调用方附加样式在后
  const mergedStyle = useMemo<CSSProperties>(() => {
    const base = { ...labelPadding, ...inputStyle };
    if (!label || !scrollbarWidth || labelPosition !== 'after') {
      return base;
    }
    // 对齐原版positionLabel：after标签与滚动条同侧，滚动条出现时宽度计入该侧内边距
    // （原版在after之外的模式不加；side与useLabelPadding的取侧同源——同为根元素方向）
    const side = rtl ? 'paddingLeft' : 'paddingRight';
    const previous = labelPadding[side];
    return {
      ...base,
      [side]: previous ? `calc(${previous} + ${scrollbarWidth}px)` : `${scrollbarWidth}px`,
    };
  }, [label, labelPadding, labelPosition, rtl, scrollbarWidth, inputStyle]);

  /**
   * 输入元素属性
   * @param overrides 形态专属属性（type/rows/min/max/step/combobox角色/按键处理器等）
   * @param userProps 调用方inputProps通道的属性，按顶部注释的合并规则并入
   */
  const inputProps = <O extends InputElementAttributes<T>>(
    overrides?: O,
    userProps?: UserInputProps<T>,
  ) => {
    // 需与公共项合并的四类单独取出，其余按"覆盖"展开（形态专属属性优先）
    const { className, style, id, onChange, onBlur, onFocus, ...rest } = overrides ?? {} as O;
    const {
      className: userClassName,
      style: userStyle,
      id: userId,
      onChange: userOnChange,
      onBlur: userOnBlur,
      onFocus: userOnFocus,
      ...userRest
    } = userProps ?? {};
    // 其余同名事件处理器串联（组件内部逻辑在前、调用方通道在后）：不采用"调用方覆盖"语义，
    // 否则调用方经inputProps传入处理器会静默截断组件自身的交互管线（ComboBoxInput的菜单
    // 导航、NumberInput的方向键步进等）。非事件属性仍以调用方通道为准（声明的逃生舱）
    const [chainedRest, chainedUserRest] = chainEventHandlers(
      rest as Record<string, unknown>,
      userRest as Record<string, unknown>,
    );
    return {
      id: userId ?? id ?? fieldInputId,
      className: clsx('oo-ui-inputWidget-input', className, userClassName),
      name,
      accessKey,
      tabIndex: resolveTabIndex(tabIndex, disabled),
      disabled,
      readOnly,
      required,
      'aria-required': required,
      'aria-disabled': disabled || undefined,
      'aria-invalid': invalid || undefined,
      placeholder,
      maxLength,
      title: resolvedTitle,
      dir,
      style: { ...mergedStyle, ...style, ...userStyle },
      value,
      // 值管线→形态处理器→调用方处理器依次串联（任一存在即输出，故单独成链而非经上方的
      // 通用串联：即便两侧都未给处理器，本项也须输出以驱动值管线与软校验）
      onChange: (onChange || userOnChange || onCommitValue)
        ? (event: ChangeEvent<T>) => {
          onCommitValue?.(event.target.value, event);
          onChange?.(event);
          userOnChange?.(event);
        }
        : undefined,
      // 软校验的失焦/聚焦、形态处理器与调用方处理器依次执行
      onBlur: (event: FocusEvent<T>) => {
        handleBlur();
        onBlur?.(event);
        userOnBlur?.(event);
      },
      onFocus: (event: FocusEvent<T>) => {
        handleFocus();
        onFocus?.(event);
        userOnFocus?.(event);
      },
      // 断言还原声明类型：上方串联逻辑只在运行时改写同名 on* 的值，键与值类型未变
      ...(chainedRest as typeof rest),
      // 非事件属性冲突时以调用方通道为准（声明的逃生舱，如aria-*透传）；被串联消费掉的
      // 同名事件处理器已从本对象移除
      ...(chainedUserRest as typeof userRest),
    };
  };

  return {
    /** 输入元素属性工厂 */
    inputProps,
    /** 是否标记为非法（供根元素输出 invalid 标志类） */
    invalid,
    /** 立即重新校验（约束配置变化时由调用方触发） */
    revalidate,
    /** 图标/指示器共用的 mousedown 处理器（装饰元素聚焦输入框） */
    decorationProps: { onMouseDown: handleDecorationMouseDown },
    /** 解析后的指示器取值（null 为明确无）；根类的指示器判定同样应取此值 */
    indicator: resolvedIndicator,
    /** 指示器槽位属性：已并入解析后的指示器取值与装饰聚焦 */
    indicatorProps: {
      ...indicatorProps,
      indicator: resolvedIndicator ?? undefined,
      onMouseDown: (event: Parameters<MouseEventHandler<HTMLElement>>[0]) => {
        handleDecorationMouseDown(event);
        indicatorProps?.onMouseDown?.(event);
      },
    },
  };
}
