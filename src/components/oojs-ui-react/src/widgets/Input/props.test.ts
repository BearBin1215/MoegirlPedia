import { describe, expect, it, vi } from 'vitest';
import { chainEventHandlers } from './props';

/**
 * chainEventHandlers：inputProps通道的事件处理器合并契约。
 * 组件内部逻辑在前、调用方通道在后串联（调用方不能截断交互管线）；单侧处理器与非事件键
 * 原样保留；被串联消费掉的键须从调用方属性中移除，否则其后的展开会覆盖串联结果。
 */
describe('chainEventHandlers（inputProps通道的事件处理器串联）', () => {
  it('两侧同名事件处理器串联：内部在前、调用方在后，并从调用方属性中移除', () => {
    const order: string[] = [];
    const [chainedOwn, remainingUser] = chainEventHandlers(
      { onKeyDown: () => order.push('own') },
      { onKeyDown: () => order.push('user') },
    );
    (chainedOwn.onKeyDown as () => void)();
    expect(order).toEqual(['own', 'user']);
    expect('onKeyDown' in remainingUser).toBe(false);
  });

  it('串联后的处理器把入参透传给两侧', () => {
    const ownHandler = vi.fn();
    const userHandler = vi.fn();
    const [chainedOwn] = chainEventHandlers({ onMouseUp: ownHandler }, { onMouseUp: userHandler });
    (chainedOwn.onMouseUp as (event: string) => void)('event');
    expect(ownHandler).toHaveBeenCalledWith('event');
    expect(userHandler).toHaveBeenCalledWith('event');
  });

  it('仅一侧有处理器时原样保留（不包装）', () => {
    const ownHandler = vi.fn();
    const [chainedOwn, remainingUser] = chainEventHandlers({ onKeyDown: ownHandler }, {});
    expect(chainedOwn.onKeyDown).toBe(ownHandler);
    expect(remainingUser).toEqual({});

    const userHandler = vi.fn();
    const [chainedOwnWhenOnlyUser, remainingUserWhenOnlyUser] = chainEventHandlers(
      {},
      { onKeyDown: userHandler },
    );
    expect(chainedOwnWhenOnlyUser).toEqual({});
    expect(remainingUserWhenOnlyUser.onKeyDown).toBe(userHandler);
  });

  it('非on键与值为非函数的on键不串联，仍按调用方覆盖', () => {
    const [chainedOwn, remainingUser] = chainEventHandlers(
      { title: 'own', onFoo: 'not-a-function' },
      { title: 'user', onFoo: 'user-value' },
    );
    expect(chainedOwn).toEqual({ title: 'own', onFoo: 'not-a-function' });
    expect(remainingUser).toEqual({ title: 'user', onFoo: 'user-value' });
  });

  it('own同名键为非函数、user为函数时不串联，user函数经覆盖生效', () => {
    const userHandler = vi.fn();
    const [chainedOwn, remainingUser] = chainEventHandlers(
      { onFoo: 'not-a-function' },
      { onFoo: userHandler },
    );
    expect(chainedOwn.onFoo).toBe('not-a-function');
    expect(remainingUser.onFoo).toBe(userHandler);
  });

  it('不修改传入的两个对象', () => {
    const own = { onKeyDown: vi.fn() };
    const user = { onKeyDown: vi.fn() };
    chainEventHandlers(own, user);
    expect(Object.keys(own)).toEqual(['onKeyDown']);
    expect(Object.keys(user)).toEqual(['onKeyDown']);
  });
});
