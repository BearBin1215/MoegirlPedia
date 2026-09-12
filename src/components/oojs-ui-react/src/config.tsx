import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { formatMessage, msg, type MessageKey, type MessageValue } from './i18n';

/** 全局配置。对齐原版OOUI的模块级全局（OO.ui.msg.messages消息表、$overlay浮层挂载点）在React语境下的对应物 */
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
}

const OOUIConfigContext = createContext<OOUIConfig>({});

/** 全局配置Provider：未包裹时组件使用英文默认文案与document.body浮层容器，行为与此前版本一致 */
export function OOUIProvider({ children, messages, getPortalContainer }: PropsWithChildren<OOUIConfig>) {
  const parent = useContext(OOUIConfigContext);
  // 嵌套Provider时子级同名字段覆盖父级；value经memo稳定引用避免子树无谓重渲染
  const value = useMemo<OOUIConfig>(() => ({
    messages: { ...parent.messages, ...messages },
    getPortalContainer: getPortalContainer ?? parent.getPortalContainer,
  }), [parent, messages, getPortalContainer]);

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
