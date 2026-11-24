import { afterEach, describe, expect, it, vi } from 'vitest';
import { isDarkTheme, subscribeTheme } from './theme';

/** 用最小页面环境验证皮肤标记与系统偏好的组合。 */
const stubTheme = (classes: string[], colorMode: string | null, prefersDark: boolean) => {
  const root = {
    getAttribute: () => colorMode,
    classList: { contains: (name: string) => classes.includes(name) },
  };
  vi.stubGlobal('document', { documentElement: root });
  vi.stubGlobal('window', { matchMedia: () => ({ matches: prefersDark }) });
};

afterEach(() => vi.unstubAllGlobals());

describe('页面主题', () => {
  it.each([
    { name: 'Vector 手动深色', classes: ['skin-theme-clientpref-night'], mode: null, system: false, expected: true },
    { name: 'Vector 手动浅色优先于系统深色', classes: ['skin-theme-clientpref-day'], mode: null, system: true, expected: false },
    { name: 'Vector 跟随系统深色', classes: ['skin-theme-clientpref-os'], mode: null, system: true, expected: true },
    { name: 'Vector 跟随系统浅色', classes: ['skin-theme-clientpref-os'], mode: null, system: false, expected: false },
    { name: '萌皮属性深色', classes: [], mode: 'dark', system: false, expected: true },
    { name: '萌皮属性浅色优先于系统深色', classes: [], mode: 'light', system: true, expected: false },
    { name: '萌皮兼容 dark 类', classes: ['dark'], mode: null, system: false, expected: true },
    { name: '无主题标记时使用浅色', classes: [], mode: null, system: true, expected: false },
  ])('$name', ({ classes, mode, system, expected }) => {
    stubTheme(classes, mode, system);
    expect(isDarkTheme()).toBe(expected);
  });

  it('监听皮肤与系统切换，并在取消订阅时清理', () => {
    const onChange = vi.fn();
    const observe = vi.fn();
    const disconnect = vi.fn();
    const system = new EventTarget();
    const removeListener = vi.spyOn(system, 'removeEventListener');
    let notifyMutation: (() => void) | undefined;
    stubTheme([], null, false);
    vi.stubGlobal('MutationObserver', class {
      observe = observe;
      disconnect = disconnect;
      constructor(callback: () => void) {
        notifyMutation = callback;
      }
    });
    vi.stubGlobal('window', { matchMedia: () => system });

    const unsubscribe = subscribeTheme(onChange);
    expect(observe).toHaveBeenCalledWith(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'color-mode'],
    });
    notifyMutation!();
    system.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenCalledTimes(2);

    unsubscribe();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(removeListener).toHaveBeenCalledWith('change', onChange);
    system.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
