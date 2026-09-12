import { useEffect, useRef, useState } from 'react';
import { createOOUIWidgets, ensureOOUI, unwrapJQuery, type OOUI } from './ooui';

/** 登记原版控件的回调，登记的控件在容器卸载时统一destroy */
export type RegisterWidget = (...items: object[]) => void;

/** build回调：oo为ensureOOUI返回的原版命名空间（oo.ui为OO.ui），container为待填充容器 */
export type OriginalBuilder = (
  oo: OOUI,
  container: HTMLElement,
  register: RegisterWidget,
) => void;

/**
 * 生成“名称+控件”行输出器：在容器内输出一行原版控件，
 * 与React侧的p行结构一致，保证两侧逐行对照。
 */
export function createRowAppender(container: HTMLElement, register: RegisterWidget) {
  return (
    Widget: new (config?: Record<string, unknown>) => { $element: unknown },
    name: string,
    config: Record<string, unknown>,
  ) => {
    const widget = new Widget(config);
    register(widget);
    const p = document.createElement('p');
    p.textContent = name;
    p.appendChild(unwrapJQuery(widget.$element));
    container.appendChild(p);
  };
}

/**
 * 原版控件容器：ensureOOUI就绪后执行build创建原版控件，组件卸载时统一destroy登记的
 * 原版控件（Toolbar/ToolGroup/WindowManager等有destroy）。build仅在挂载后执行一次，
 * 无需用useCallback保持引用稳定。
 * 需要向容器追加内容的页面必须把返回的containerRef渲染出来；不渲染容器的页面
 * （如命令式API、自带多个宿主ref的页面）不得在build内使用container参数。
 */
export function useOriginalWidgets(build: OriginalBuilder) {
  const containerRef = useRef<HTMLDivElement>(null);
  // build以ref持有：effect仅挂载时跑一次，用最新闭包执行即可，不作为effect依赖
  const buildRef = useRef(build);
  buildRef.current = build;
  const [status, setStatus] = useState('未初始化');

  useEffect(() => {
    let cancelled = false;
    const host = createOOUIWidgets();
    ensureOOUI().then((oo) => {
      // 不再校验containerRef.current：不渲染容器的页面（自持宿主ref）也需执行build
      if (cancelled) {
        return;
      }
      buildRef.current(oo, containerRef.current!, host.add);
      setStatus('原版已就绪');
    }).catch(() => {
      if (!cancelled) {
        setStatus('原版加载失败');
      }
    });
    return () => {
      cancelled = true;
      host.destroyAll();
    };
  }, []);

  return { containerRef, status };
}
