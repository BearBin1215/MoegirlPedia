import clsx from 'clsx';
import type { ReactNode } from 'react';
import { ICON_FLAGS } from './Element';
import type {
  ButtonFlag,
  IconElement,
  IndicatorElement,
  Indicators,
  LabelElement,
} from './Element';

/**
 * 对齐原版OO.ui.mixin的纯函数层：每个导出对应原版一个Element mixin的「类名贡献」或
 * 「元素级状态解析」，与Element.ts的契约类型（同样按mixin组织）配套；少数通用归一化工具
 * （toFlagArray/hasLabel/mergeInvalidFlag）作为贡献器的共用输入处理也放在此处。
 * 原版mixin把「类名 + 属性落点 + 状态守卫」打包在一起，本工程拆为
 * Element.ts（契约类型）/ 本文件（类名与状态）/ 组件（落点与渲染）。
 * 与具体mixin无关的选择集派生、DOM查询与常量放utils.ts。
 * 类名贡献器即站点上OOUI主题CSS的选择器契约，改动前先核对原版对应mixin。
 */

/** 归一化标志参数：单个标志、标志数组与`undefined`统一为数组 */
export function toFlagArray<T extends string>(flags?: T | T[]): T[] {
  return typeof flags === 'string' ? [flags] : flags ?? [];
}

/** label是否实际渲染内容（`null`/`undefined`/`false`/`''`均视为无标签） */
export function hasLabel(label: unknown): boolean {
  return label !== null && label !== undefined && label !== false && label !== '';
}

/**
 * 合并软校验的invalid标志与配置flags（对齐原版setValidityFlag的setFlags({invalid})合并语义）：
 * 校验非法时invalid标志叠加在配置flags之上，合法时仅保留配置flags——配置flags为声明式
 * 基线，不随校验通过移除（原版config.flags与setFlags共享存储的移除语义不适用于声明式props）
 */
export function mergeInvalidFlag(flags: string[], invalid: boolean): string[] {
  return invalid && !flags.includes('invalid') ? [...flags, 'invalid'] : flags;
}

/**
 * 可聚焦元素的tabIndex取值（对齐原版`OO.ui.mixin.TabIndexedElement.updateTabIndex`）：
 * 禁用时不参与Tab序——原版注释“Do not index over disabled elements”，即disabled覆盖显式值；
 * 启用时取显式tabIndex，缺省0（原版config.tabIndex缺省0）
 */
export function resolveTabIndex(
  tabIndex: number | undefined,
  disabled?: boolean,
): number {
  return disabled ? -1 : (tabIndex ?? 0);
}

/**
 * 合并aria-labelledby取值（FieldLayout联动下发的labelId与调用方透传值并列，均有时以空格
 * 分隔），全部为空时返回undefined
 */
export function mergeAriaLabelledBy(...values: (string | undefined)[]): string | undefined {
  const merged = values.filter(Boolean).join(' ');
  return merged || undefined;
}

/**
 * TitledElement mixin的title解析（对齐原版TitledElement构造期与updateTitle）：
 * ①未显式给title且标签不可见时以label兜底——原版注释“If config for an invisible label is
 * present, use this as a fallback title”，使视觉上无文字的按钮仍有tooltip/可访问名；
 * ②组件同时是AccessKeyedElement时，title末尾附加快捷键提示（原版formatTitleWithAccessKey
 * 的`title + ' [' + accessKey + ']'`；原版优先取jquery.accessKeyLabel的修饰键文案——
 * MediaWiki侧经该插件显示“Alt+Shift+k”之类，纯DOM环境不可得，故按原版回落分支取原键值）。
 * 返回undefined表示不输出title属性（对齐原版removeAttr('title')）
 */
export function resolveTitle({
  title,
  label,
  invisibleLabel,
  accessKey,
}: {
  /** 调用方显式传入的title */
  title?: string;
  /** LabelElement的标签；仅字符串且标签不可见时用于兜底 */
  label?: ReactNode;
  /** 标签是否不可见（LabelElement） */
  invisibleLabel?: boolean;
  /** 快捷键（AccessKeyedElement），有值时附到title末尾 */
  accessKey?: string;
}): string | undefined {
  let resolved = title;
  if (resolved === undefined && invisibleLabel && typeof label === 'string') {
    resolved = label;
  }
  if (resolved === undefined) {
    return undefined;
  }
  return accessKey ? `${resolved} [${accessKey}]` : resolved;
}

/**
 * RequiredElement mixin的指示器缺省（对齐原版`setRequired`对indicatorElement的改写）：
 * 未显式声明indicator时，required为真输出`required`指示器。
 * 原版只在“当前指示器是对应位”时才改写（required为真时null→'required'，为假时
 * 'required'→null），以免破坏无关指示器；声明式下显式indicator恒优先，二者等价。
 * 需要“显式无指示器”的通道由调用方在传入前自行判定（如TextInput的indicatorOverride）
 */
export function resolveRequiredIndicator(
  indicator: Indicators | undefined,
  required?: boolean,
): Indicators | undefined {
  return indicator || (required ? 'required' : undefined);
}

/** Widget基类贡献器读取的最小字段（不引入渲染组件的Props类型，避免mixins ↔ widgets的类型反向依赖） */
interface DisableState {
  /** 是否禁用 */
  disabled?: boolean;
}

/** Widget基类的类贡献：`oo-ui-widget`根类 + disabled/enabled互斥态类 */
export function widgetClasses({ disabled }: DisableState): string {
  return clsx('oo-ui-widget', disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled');
}

/** IconElement mixin的类贡献：icon有值时输出`oo-ui-iconElement` */
export function iconElementClasses({ icon }: IconElement): string {
  return icon ? 'oo-ui-iconElement' : '';
}

/** IndicatorElement mixin的类贡献：indicator有值时输出`oo-ui-indicatorElement` */
export function indicatorElementClasses({ indicator }: IndicatorElement): string {
  return indicator ? 'oo-ui-indicatorElement' : '';
}

/**
 * LabelElement mixin的类贡献：仅"有效可见标签"输出`oo-ui-labelElement`。
 * 对齐原版setInvisibleLabel的"视同无标签"语义（上游注释：Pretend that there is no
 * label，大量CSS基于该假设编写），故invisibleLabel时即使有label也不输出
 */
export function labelElementClasses({ label, invisibleLabel }: LabelElement): string {
  return !invisibleLabel && hasLabel(label) ? 'oo-ui-labelElement' : '';
}

/** FlaggedElement mixin的类贡献：每个flag输出`oo-ui-flaggedElement-{flag}` */
export function flaggedElementClasses(flags?: string | string[]): string {
  return clsx(toFlagArray(flags).map((flag) => `oo-ui-flaggedElement-${flag}`));
}

/** Widget型组件的名称类：`oo-ui-{name}Widget`（多个按原版继承链叠加，如input/textInput/numberInput） */
export function widgetNameClasses(...widgetNames: string[]): string {
  return clsx(widgetNames.map((widgetName) => `oo-ui-${widgetName}Widget`));
}

/** Widget型组件组装基础类的完整入参（Widget基类与三个元素mixin的类型交集） */
type WidgetClassNameProps =
  DisableState &
  LabelElement &
  IconElement &
  IndicatorElement;

/**
 * 组装Widget型组件的根类。折叠自上方各mixin贡献器（对齐原版Widget+Element mixin的
 * 类派生规则），供整组类一起输出的常规场景；折叠组之外的贡献器（如按钮系的
 * buttonElementClasses）直接单独调用
 * @param props 组件属性，仅读取基础类相关字段
 * @param widgetNames 组件名，按原版继承链顺序叠加`oo-ui-{name}Widget`
 */
export function getWidgetClassName(
  { disabled, label, invisibleLabel, icon, indicator }: WidgetClassNameProps,
  ...widgetNames: string[]
): string {
  return clsx(
    widgetClasses({ disabled }),
    iconElementClasses({ icon }),
    indicatorElementClasses({ indicator }),
    labelElementClasses({ label, invisibleLabel }),
    widgetNameClasses(...widgetNames),
  );
}

/**
 * 图标/指示器变体类（对齐wikimediaui主题按image-{flag}着色的规则）。
 * 仅映射主题存在的image变体位——调用方可能传入ButtonFlag全集（如primary），
 * 非image位（primary/safe/back/close）不产生类。变体集即Element.ts的ICON_FLAGS
 * （IconFlag由其派生，两侧不会失配）。Icon与按钮系图标/指示器共用；
 * 消息提示按类型着色（`oo-ui-image-{type}`）亦经此，无对应变体的类型（notice）不出类
 */
export function imageVariantClasses(flags: readonly string[]): string {
  return clsx(
    flags
      .filter((flag) => (ICON_FLAGS as readonly string[]).includes(flag))
      .map((flag) => `oo-ui-image-${flag}`),
  );
}

/**
 * 按wikimediaui主题规则生成按钮内图标/指示器变体类（Button/ButtonInput/ButtonOption共用）：
 * 边框按钮在激活（选中）、禁用或primary时整体反色；禁用且非反色场景不出变体；
 * 其余按标志叠加image变体。返回空串表示无变体
 */
export function getButtonIconClasses({
  framed,
  active,
  disabled,
  flags,
}: {
  /** 是否生成边框（决定禁用/激活是否反色） */
  framed: boolean;
  /** 是否为激活状态 */
  active?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 附加给按钮的标志 */
  flags: ButtonFlag[];
}): string {
  if (framed && (active || disabled || flags.includes('primary'))) {
    return 'oo-ui-image-invert';
  }
  if (disabled) {
    return '';
  }
  return imageVariantClasses(flags);
}

/**
 * ButtonElement mixin的类贡献（对齐原版OO.ui.mixin.ButtonElement，Button/ButtonInput/ButtonOption共用）：
 * 根基类 + framed/frameless互斥态 + flagged变体 + 激活/按压态。pressed由调用方取或
 * （内部按压流usePressedState与外部受控按压，如ButtonMenuSelectWidget菜单打开期），
 * 禁用下的按压抑制由本函数的disabled位统一承担（对齐原版isDisabled时不输出按压类）
 */
export function buttonElementClasses({
  framed = true,
  active,
  disabled,
  pressed,
  flags = [],
}: {
  /** 是否生成边框（缺省带边框，对齐原版ButtonElement的framed缺省） */
  framed?: boolean;
  /** 是否为激活状态 */
  active?: boolean;
  /** 是否禁用（仅抑制按压类；widget禁用类由Widget基类贡献器承担） */
  disabled?: boolean;
  /** 是否为按压态（调用方取或后的最终值） */
  pressed?: boolean;
  /** 附加给按钮的标志 */
  flags?: ButtonFlag | ButtonFlag[];
}): string {
  return clsx(
    'oo-ui-buttonElement',
    framed ? 'oo-ui-buttonElement-framed' : 'oo-ui-buttonElement-frameless',
    flaggedElementClasses(flags),
    active && 'oo-ui-buttonElement-active',
    !disabled && pressed && 'oo-ui-buttonElement-pressed',
  );
}

/**
 * OptionWidget基类的状态类贡献（对齐原版OO.ui.OptionWidget的setSelected/setHighlighted/
 * setPressed）。原版三个状态各受static门槛把关（selectable/highlightable/pressable），
 * 未开启该能力的选项形态即使收到对应状态也不输出类，故调用方须按原版该类的static值传入
 * 门槛。`oo-ui-optionWidget`根基类由widgetNameClasses('option')输出，不在此重复；
 * aria-selected/aria-checked由调用方按选项语义输出（Radio/Checkbox型选项用checkbox语义，
 * 见docs/TODO.md）
 */
export function optionWidgetClasses({
  selected,
  highlighted,
  pressed,
  selectable = true,
  highlightable = true,
  pressable = true,
}: {
  /** 是否为已选中项 */
  selected?: boolean;
  /** 是否为键盘导航高亮项 */
  highlighted?: boolean;
  /** 是否为鼠标按压中的选项 */
  pressed?: boolean;
  /** 该选项形态是否可选（原版static.selectable） */
  selectable?: boolean;
  /** 该选项形态是否有高亮态（原版static.highlightable） */
  highlightable?: boolean;
  /** 该选项形态是否有按压态（原版static.pressable） */
  pressable?: boolean;
}): string {
  return clsx(
    selectable && selected && 'oo-ui-optionWidget-selected',
    highlightable && highlighted && 'oo-ui-optionWidget-highlighted',
    pressable && pressed && 'oo-ui-optionWidget-pressed',
  );
}

/**
 * PendingElement mixin的类贡献（对齐原版setPendingElement输出`oo-ui-pendingElement-pending`）。
 * pending的来源由调用方各自持有（缩略图加载、动作执行、弹窗流程计数），本函数只统一类口径
 */
export function pendingElementClasses(pending?: boolean): string {
  return pending ? 'oo-ui-pendingElement-pending' : '';
}
