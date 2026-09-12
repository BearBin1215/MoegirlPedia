import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { formatMessage, msg, type MessageKey, type MessageValue } from './i18n';
import { VIEWPORT_SPACING } from './utils';

/** 视口四周留白（px），浮层贴边/钳高时计入。对齐原版OO.ui.getViewportSpacing的返回结构 */
export interface ViewportSpacing {
  /** 顶部留白 */
  top: number;
  /** 右侧留白 */
  right: number;
  /** 底部留白 */
  bottom: number;
  /** 左侧留白 */
  left: number;
}

/** viewportSpacing配置入参：数值（四边同值）或逐边覆盖对象 */
export type ViewportSpacingInput = number | Partial<ViewportSpacing>;

/** 文本方向 */
export type Direction = 'ltr' | 'rtl';

/** 将viewportSpacing配置归一化为四边数值：缺省边取VIEWPORT_SPACING（本工程的默认留白） */
export function normalizeViewportSpacing(input: ViewportSpacingInput | undefined): ViewportSpacing {
  if (typeof input === 'number') {
    return { top: input, right: input, bottom: input, left: input };
  }
  return {
    top: input?.top ?? VIEWPORT_SPACING,
    right: input?.right ?? VIEWPORT_SPACING,
    bottom: input?.bottom ?? VIEWPORT_SPACING,
    left: input?.left ?? VIEWPORT_SPACING,
  };
}

/** 全局配置。对齐原版OOUI的模块级全局（OO.ui.msg.messages消息表、isMobile/getViewportSpacing/
 * getTeleportTarget等可覆写全局函数、Element的dir配置）在React语境下的对应物 */
export interface OOUIConfig {
  /** 消息覆盖表，覆盖英文默认（见src/i18n.ts）。声明式组件渲染时读取，切换即响应式更新 */
  messages?: Partial<Record<MessageKey, MessageValue>>;

  /**
   * 浮层portal容器（Popup/MenuSelect/PopupToolGroup面板），缺省document.body。
   * 对应原版$overlay配置与antd的getPopupContainer；弹窗内嵌浮层时传入弹窗容器，
   * 使浮层与弹窗同层渲染避免z-index层级问题。入参为浮层的锚点元素。
   * 注意容器不应建立新的定位上下文（浮层按页面坐标绝对定位）
   */
  getPortalContainer?: (trigger: HTMLElement) => HTMLElement;

  /**
   * 移动端形态开关，对应原版OO.ui.isMobile()（原版为恒false的桩，由宿主环境覆写）。
   * 缺省false；消费点：Index/BookletLayout的autoFocus移动端抑制、ProcessDialog的
   * oo-ui-isMobile类。宿主可接matchMedia等自行判定后传入
   */
  isMobile?: boolean;

  /**
   * 浮层文本方向，覆盖锚点元素的继承方向（缺省按锚点computed direction解析，
   * 对齐原版Element.static.getDir）。浮层portal至body后不随内容区继承方向，
   * RTL站点（如html[dir=rtl]）依赖此配置外的自动解析即可，无需显式配置
   */
  dir?: Direction;

  /**
   * 视口留白，浮层贴边/钳高时计入（数值或逐边覆盖，缺省各边VIEWPORT_SPACING）。
   * 对应原版OO.ui.getViewportSpacing（原版缺省0，供站点避开固定头栏等悬浮元素）
   */
  viewportSpacing?: ViewportSpacingInput;
}

const OOUIConfigContext = createContext<OOUIConfig>({});

/** 全局配置Provider：未包裹时组件使用英文默认文案与document.body浮层容器，行为与此前版本一致 */
export function OOUIProvider({
  children,
  messages,
  getPortalContainer,
  isMobile,
  dir,
  viewportSpacing,
}: PropsWithChildren<OOUIConfig>) {
  const parent = useContext(OOUIConfigContext);
  // 嵌套Provider时子级同名字段覆盖父级；value经memo稳定引用避免子树无谓重渲染
  const value = useMemo<OOUIConfig>(() => ({
    messages: { ...parent.messages, ...messages },
    getPortalContainer: getPortalContainer ?? parent.getPortalContainer,
    isMobile: isMobile ?? parent.isMobile,
    dir: dir ?? parent.dir,
    viewportSpacing: viewportSpacing ?? parent.viewportSpacing,
  }), [parent, messages, getPortalContainer, isMobile, dir, viewportSpacing]);

  return (
    <OOUIConfigContext.Provider value={value}>
      {children}
    </OOUIConfigContext.Provider>
  );
}

OOUIProvider.displayName = 'OOUIProvider';

/** 读取全局配置；未包Provider时为空对象 */
export function useOOUIConfig(): OOUIConfig {
  return useContext(OOUIConfigContext);
}

/**
 * 读取一条消息：OOUIProvider覆盖 > 模块级registerMessages > 英文默认。
 * 组件的默认文案统一经此读取，勿直接使用msg（那是命令式API/非React场景的通道）
 */
export function useMessage(key: MessageKey, ...params: unknown[]): string {
  const { messages } = useOOUIConfig();
  const override = messages?.[key];
  if (override !== undefined) {
    return formatMessage(override, params);
  }
  return msg(key, ...params);
}

/**
 * 解析浮层portal容器：配置的getPortalContainer以锚点元素调用，未配置或锚点未挂载时
 * 回落document.body。返回值在配置与锚点间保持缓存，避免容器身份漂移导致portal重挂载
 */
export function usePortalContainer(): (trigger: HTMLElement | null) => HTMLElement {
  const { getPortalContainer } = useOOUIConfig();
  return useCallback((trigger) => (
    trigger && getPortalContainer ? getPortalContainer(trigger) : document.body
  ), [getPortalContainer]);
}

/** 读取移动端形态开关（对应原版OO.ui.isMobile()），未配置时false */
export function useIsMobile(): boolean {
  return useOOUIConfig().isMobile ?? false;
}

/** 读取浮层文本方向覆盖；未配置时返回undefined，由组件按锚点元素继承方向解析 */
export function useDir(): Direction | undefined {
  return useOOUIConfig().dir;
}

/** 读取归一化的视口留白（四边数值），未配置时各边取VIEWPORT_SPACING */
export function useViewportSpacing(): ViewportSpacing {
  const { viewportSpacing } = useOOUIConfig();
  // 经useMemo稳定引用：配置不变时归一化结果同一对象，浮层定位effect不因引用漂移重挂
  return useMemo(() => normalizeViewportSpacing(viewportSpacing), [viewportSpacing]);
}
