import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { acquireScrollLock, releaseScrollLock } from './scrollLock';

/**
 * 滚动锁的契约测试：登记计数与类同步即主题CSS的选择器契约
 * （body/html的oo-ui-windowManager-modal-active(-fullscreen)），逐项对齐原版
 * WindowManager.toggleGlobalEvents的栈语义。vitest为node环境，以桩document承载classList断言。
 */

/** 可断言classList的桩元素 */
function createFakeElement() {
  const classes = new Set<string>();
  return {
    classes,
    classList: {
      toggle(name: string, force?: boolean) {
        const next = force === undefined ? !classes.has(name) : force;
        if (next) {
          classes.add(name);
        } else {
          classes.delete(name);
        }
      },
    },
  };
}

/** 从桩document读取当前锁类状态 */
function lockState() {
  const body = (document as unknown as { body: ReturnType<typeof createFakeElement> }).body;
  const html = (document as unknown as { documentElement: ReturnType<typeof createFakeElement> }).documentElement;
  return {
    bodyLocked: body.classes.has('oo-ui-windowManager-modal-active'),
    htmlLocked: html.classes.has('oo-ui-windowManager-modal-active'),
    bodyFullscreen: body.classes.has('oo-ui-windowManager-modal-active-fullscreen'),
    htmlFullscreen: html.classes.has('oo-ui-windowManager-modal-active-fullscreen'),
  };
}

const HANDLE_A = {};
const HANDLE_B = {};

beforeEach(() => {
  vi.stubGlobal('document', { body: createFakeElement(), documentElement: createFakeElement() });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('滚动锁登记', () => {
  it('登记后body/html加锁类，无满屏变体', () => {
    acquireScrollLock(HANDLE_A, false);
    expect(lockState()).toEqual({ bodyLocked: true, htmlLocked: true, bodyFullscreen: false, htmlFullscreen: false });
  });

  it('注销最后一个登记后解锁', () => {
    acquireScrollLock(HANDLE_A, false);
    releaseScrollLock(HANDLE_A);
    expect(lockState()).toEqual({ bodyLocked: false, htmlLocked: false, bodyFullscreen: false, htmlFullscreen: false });
  });

  it('叠加登记按计数解锁：注销其一仍锁定，全部注销才解锁', () => {
    acquireScrollLock(HANDLE_A, false);
    acquireScrollLock(HANDLE_B, false);
    releaseScrollLock(HANDLE_A);
    expect(lockState().bodyLocked).toBe(true);
    releaseScrollLock(HANDLE_B);
    expect(lockState().bodyLocked).toBe(false);
  });

  it('任一登记满屏时输出fullscreen变体，满屏者注销后变体随之移除', () => {
    acquireScrollLock(HANDLE_A, false);
    acquireScrollLock(HANDLE_B, true);
    expect(lockState().bodyFullscreen).toBe(true);
    expect(lockState().htmlFullscreen).toBe(true);
    releaseScrollLock(HANDLE_B);
    expect(lockState().bodyFullscreen).toBe(false);
    expect(lockState().bodyLocked).toBe(true);
  });

  it('重复登记为幂等更新，可翻转满屏态', () => {
    acquireScrollLock(HANDLE_A, false);
    acquireScrollLock(HANDLE_A, true);
    expect(lockState().htmlFullscreen).toBe(true);
    releaseScrollLock(HANDLE_A);
    expect(lockState().htmlLocked).toBe(false);
  });

  it('注销未登记句柄为空操作，不影响现有锁', () => {
    acquireScrollLock(HANDLE_A, false);
    expect(() => releaseScrollLock(HANDLE_B)).not.toThrow();
    expect(lockState().bodyLocked).toBe(true);
  });
});
