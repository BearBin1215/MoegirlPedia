import type { CSSProperties } from 'react';

// 原版dist脚本经rspack asset/resource规则以URL引入（文件保留在node_modules，不入库）
import jqueryUrl from 'jquery/dist/jquery.js';
import oojsUrl from 'oojs/dist/oojs.js';
import oouiUrl from 'oojs-ui/dist/oojs-ui.js';
import oouiThemeUrl from 'oojs-ui/dist/oojs-ui-wikimediaui.js';

type OOUIWindow = {
  open: (data?: { title?: string; message?: string }) => void;
};

type OOUI = {
  ui: Record<string, unknown> & {
    WindowManager: new () => { $element: unknown; addWindows: (w: unknown[]) => void };
    MessageDialog: new () => OOUIWindow;
    MultilineTextInputWidget: new (config?: Record<string, unknown>) => {
      $element: unknown;
      setValue: (v: string) => void;
      getValue: () => string;
    };
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

const loadScript = (id: string, src: string) => new Promise<void>((resolve, reject) => {
  // 已注入过则跳过（HMR/StrictMode重渲染下防止重复执行）
  if (document.getElementById(id)) {
    resolve();
    return;
  }
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  // 动态脚本默认async按下载完成顺序执行，必须禁用以保证插入顺序（jquery→oojs→ui→theme）
  script.async = false;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error(`加载失败: ${src}`));
  document.head.appendChild(script);
});

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
  return promise;
}

/** jQuery对象取包裹的真实DOM节点 */
export const unwrapJQuery = ($el: unknown): Node => ($el as { 0: Node })[0];

/** 左右对照布局的简单样式 */
export const compareLayoutStyle: CSSProperties = {
  display: 'flex',
  gap: '2em',
  alignItems: 'flex-start',
};
