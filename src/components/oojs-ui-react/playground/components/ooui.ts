// 原版dist脚本以?url引入（文件保留在node_modules，不入库），运行时按序注入<script>
import jqueryUrl from 'jquery/dist/jquery.js?url';
import oojsUrl from 'oojs/dist/oojs.js?url';
import oouiUrl from 'oojs-ui/dist/oojs-ui.js?url';
import oouiThemeUrl from 'oojs-ui/dist/oojs-ui-wikimediaui.js?url';
import oouiApexThemeUrl from 'oojs-ui/dist/oojs-ui-apex.js?url';
// 主题CSS以?inline文本导出：走Vite CSS管线，图标相对url已被重写为构建资源URL
import oouiWikimediaCssText from 'oojs-ui/dist/oojs-ui-wikimediaui.css?inline';
import oouiApexCssText from 'oojs-ui/dist/oojs-ui-apex.css?inline';
// 0.54起主题CSS引用Codex设计令牌（var(--*)，约450处）但自身不定义，令牌表须一并注入
import codexTokensCssText from '@wikimedia/codex-design-tokens/dist/theme-wikimedia-ui.css?inline';

type OOUIWindow = {
  // size仅在open的data中生效（MessageDialog.getSetupProcess每次open覆盖构造配置）
  open: (data?: { title?: string; message?: string; size?: string }) => void;
};

type OOUI = {
  ui: Record<string, unknown> & {
    WindowManager: new () => { $element: unknown; addWindows: (w: unknown[]) => void };
    MessageDialog: new (config?: Record<string, unknown>) => OOUIWindow;
    MultilineTextInputWidget: new (config?: Record<string, unknown>) => {
      $element: unknown;
      setValue: (v: string) => void;
      getValue: () => string;
    };
    ButtonWidget: new (config?: Record<string, unknown>) => {
      $element: unknown;
      on: (event: string, handler: () => void) => void;
    };
    PopupButtonWidget: new (config?: Record<string, unknown>) => {
      $element: unknown;
      getPopup: () => { $body: { append: (el: Node) => void } };
    };
    PopupWidget: new (config?: Record<string, unknown>) => {
      $element: unknown;
      toggle: (show?: boolean) => void;
    };
    FieldsetLayout: new (config?: Record<string, unknown>) => {
      $element: unknown;
      addItems: (items: unknown[]) => void;
    };
    FieldLayout: new (field: unknown, config?: Record<string, unknown>) => { $element: unknown };
    TextInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
    CheckboxInputWidget: new (config?: Record<string, unknown>) => { $element: unknown };
  };
};

export type { OOUI, OOUIWindow };

export const getOO = () => (window as unknown as { OO?: OOUI }).OO;

const SCRIPT_URLS = [
  ['ooui-loader-jquery', jqueryUrl],
  ['ooui-loader-oojs', oojsUrl],
  ['ooui-loader-oojs-ui', oouiUrl],
  ['ooui-loader-theme', oouiThemeUrl],
] as const;

// 按id缓存进行中/已完成的加载promise：并发调用（同一次模块实例内）复用同一promise
const scriptPromises = new Map<string, Promise<void>>();

const loadScript = (id: string, src: string) => {
  const cached = scriptPromises.get(id);
  if (cached) {
    return cached;
  }
  const promise = new Promise<void>((resolve, reject) => {
    // HMR重载模块后本Map已重建，但DOM标签可能仍在：以标签上的loaded标记为准，
    // 已标记的视为就绪；未完成的挂到现有标签的load/error事件上等待（不能仅凭
    // 标签存在即判就绪，否则依赖该脚本的全局对象可能尚未定义，如apex主题类）
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded) {
        resolve();
      } else {
        // 挂到现有标签的load/error事件上等待，任一触发后统一摘除监听
        const onSettled = (ev: Event) => {
          existing.removeEventListener('load', onSettled);
          existing.removeEventListener('error', onSettled);
          if (ev.type === 'load') {
            resolve();
          } else {
            reject(new Error(`加载失败: ${src}`));
          }
        };
        existing.addEventListener('load', onSettled);
        existing.addEventListener('error', onSettled);
      }
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    // 动态脚本默认async按下载完成顺序执行，必须禁用以保证插入顺序（jquery→oojs→ui→theme）
    script.async = false;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => {
      // 移除失败标签并清除缓存，否则重试时id去重/promise缓存会误判为已加载
      script.remove();
      scriptPromises.delete(id);
      reject(new Error(`加载失败: ${src}`));
    };
    document.head.appendChild(script);
  });
  scriptPromises.set(id, promise);
  return promise;
};

// 原版脚本只能注入一次（StrictMode下effect会双调用，需promise单例防重入）
let oouiPromise: Promise<OOUI> | null = null;

/**
 * 加载原版oojs-ui（jQuery+oojs+ui+主题）到全局，供对照页创建原版widget。
 * 原版库依赖全局jQuery与OO，故以脚本注入而非打包import。
 */
export function ensureOOUI(): Promise<OOUI> {
  const existing = getOO();
  if (existing?.ui?.MessageDialog) {
    return Promise.resolve(existing);
  }
  // 并发调用（StrictMode下effect双调用等）复用进行中的加载promise，而非各自新建
  if (oouiPromise) {
    return oouiPromise;
  }
  const promise = (async () => {
    for (const [id, url] of SCRIPT_URLS) {
      await loadScript(id, url);
    }
    const oo = getOO();
    if (!oo?.ui?.MessageDialog) {
      throw new Error('oojs-ui 加载失败');
    }
    return oo;
  })();
  oouiPromise = promise;
  // 失败时清空单例，后续调用可重试（loadScript失败时已移除对应标签）
  promise.catch(() => {
    if (oouiPromise === promise) {
      oouiPromise = null;
    }
  });
  return promise;
}

/** jQuery对象取包裹的真实DOM节点 */
export const unwrapJQuery = ($el: unknown): Node => ($el as { 0: Node })[0];

/** 可销毁的原版控件：Toolbar/ToolGroup/Tool/WindowManager提供destroy（附带监听清理与DOM移除） */
type OOUIDestroyable = { destroy?: () => void };

/**
 * 对照页原版控件登记器：effect内new出的原版控件逐个add登记，cleanup时统一destroyAll。
 * 原版0.54.1仅Toolbar/ToolGroup/Tool/WindowManager有destroy（会解除window级监听并移除DOM，
 * 如Toolbar的window resize监听仅destroy才解除）；普通widget无destroy，其监听均绑定在自身
 * 子树内，随React卸载移除宿主容器即一并清理
 */
export function createOOUIWidgets() {
  const widgets: OOUIDestroyable[] = [];
  return {
    // 原版widget的类型普遍只含$element等形状，与纯可选属性destroy不结构兼容
    // （weak type检查），入参放宽为object，登记后统一按可销毁形状使用
    add(...items: object[]): void {
      widgets.push(...(items as OOUIDestroyable[]));
    },
    destroyAll(): void {
      for (const widget of widgets) {
        widget.destroy?.();
      }
      widgets.length = 0;
    },
  };
}

/** 演示工程可切换的原版主题 */
export type OOUITheme = 'wikimediaui' | 'apex';

/** 默认主题：选项列表、state初值与首帧applyThemeCss共用同一来源 */
export const DEFAULT_THEME: OOUITheme = 'wikimediaui';

// 主题脚本内含主题类定义并在末尾实例化OO.ui.theme，两份脚本加载后类共存于OO.ui，可随时重建实例切换
const THEME_CLASSES: Record<OOUITheme, string> = {
  wikimediaui: 'WikimediaUITheme',
  apex: 'ApexTheme',
};

// wikimediaui主题脚本随ensureOOUI主流程注入（id保持一致以便去重），apex按需懒加载
const THEME_SCRIPTS: Record<OOUITheme, [id: string, url: string]> = {
  wikimediaui: ['ooui-loader-theme', oouiThemeUrl],
  apex: ['ooui-loader-theme-apex', oouiApexThemeUrl],
};

const THEME_CSS_TEXT: Record<OOUITheme, string> = {
  wikimediaui: oouiWikimediaCssText,
  apex: oouiApexCssText,
};

const themeCssUrls = new Map<OOUITheme, string>();

/** 主题CSS文本（图标url已被构建期重写为资源URL）+前置Codex令牌表，包成Blob URL（结果缓存） */
function getThemeCssUrl(theme: OOUITheme): string {
  let url = themeCssUrls.get(theme);
  if (!url) {
    url = URL.createObjectURL(new Blob(
      [codexTokensCssText, THEME_CSS_TEXT[theme]],
      { type: 'text/css' },
    ));
    themeCssUrls.set(theme, url);
  }
  return url;
}

let activeThemeLink: HTMLLinkElement | null = null;

/**
 * 应用原版主题样式表：同一时刻仅注入当前主题一个<link>，切换时替换节点强制重新加载。
 * 不用link.disabled互斥切换——disabled在样式表加载完成前设置会中止加载，后续翻转标志不会恢复
 */
export function applyThemeCss(theme: OOUITheme): void {
  if (activeThemeLink?.dataset.theme === theme) {
    return;
  }
  activeThemeLink?.remove();
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.dataset.theme = theme;
  link.href = getThemeCssUrl(theme);
  document.head.appendChild(link);
  activeThemeLink = link;
}

/**
 * 切换原版主题JS（重建OO.ui.theme实例）：懒加载对应主题脚本后重建实例。
 * 原版控件在构造时读取主题，切换仅影响此后新建的控件，已挂载控件需由调用方重建
 */
export async function setOOTheme(theme: OOUITheme): Promise<void> {
  await ensureOOUI();
  const [id, url] = THEME_SCRIPTS[theme];
  await loadScript(id, url);
  const ui = getOO()?.ui as unknown as Record<string, unknown> | undefined;
  const ThemeClass = ui?.[THEME_CLASSES[theme]] as (new () => unknown) | undefined;
  if (!ui || !ThemeClass) {
    throw new Error(`主题类加载失败: ${THEME_CLASSES[theme]}`);
  }
  ui.theme = new ThemeClass();
}
