import { describe, expect, it, vi } from 'vitest';
import { formatMessage, msg, resolveMsg } from './i18n';

/**
 * i18n纯函数的契约测试：消息值解析（字符串/函数）、$n参数替换，以及覆盖表与英文默认表的
 * 优先级（registerMessages覆盖 > 英文默认），逐项对齐原版OO.ui.msg/resolveMsg/deferMsg。
 *
 * 覆盖表是模块级状态：涉及写入的用例统一经vi.resetModules + 动态import取全新模块实例，
 * 避免污染本文件顶部的静态实例（其断言"英文默认"的行为）。
 */
describe('resolveMsg / formatMessage（消息值解析与$n替换）', () => {
  it('字符串值直出，函数值调用后取值（对齐原版resolveMsg）', () => {
    expect(resolveMsg('原文')).toBe('原文');
    expect(resolveMsg(() => '延迟求值')).toBe('延迟求值');
  });

  it('$n按位置替换参数，数字参数转字符串', () => {
    expect(formatMessage('共$1项，已处理$2项', [5, 3])).toBe('共5项，已处理3项');
  });

  it('函数值同样参与替换', () => {
    expect(formatMessage(() => '共$1项', ['7'])).toBe('共7项');
  });

  it('缺参时保留$n字面量', () => {
    expect(formatMessage('$1与$2', ['仅一个'])).toBe('仅一个与$2');
  });

  it('多位数索引按序号解析（$10取第10个参数）', () => {
    const params = Array.from({ length: 10 }, (unused, index) => String(index + 1));
    expect(formatMessage('$10', params)).toBe('10');
    expect(formatMessage('$10', ['仅一个'])).toBe('$10');
  });
});

describe('msg（未注册覆盖时取英文默认表）', () => {
  it('读取英文默认文案', () => {
    expect(msg('ooui-dialog-message-accept')).toBe('OK');
    expect(msg('ooui-dialog-message-reject')).toBe('Cancel');
  });

  it('英文默认文案无占位符时不受多余参数影响', () => {
    expect(msg('ooui-dialog-message-reject', '多余参数')).toBe('Cancel');
  });
});

describe('registerMessages（模块级覆盖表）', () => {
  it('覆盖英文默认，后注册的同键覆盖先注册的', async () => {
    vi.resetModules();
    const i18n = await import('./i18n');
    i18n.registerMessages({ 'ooui-dialog-message-accept': '确定' });
    expect(i18n.msg('ooui-dialog-message-accept')).toBe('确定');
    i18n.registerMessages({ 'ooui-dialog-message-accept': '好的' });
    expect(i18n.msg('ooui-dialog-message-accept')).toBe('好的');
  });

  it('覆盖文案同样经$n参数替换', async () => {
    vi.resetModules();
    const i18n = await import('./i18n');
    i18n.registerMessages({ 'ooui-dialog-message-accept': '确定$1' });
    expect(i18n.msg('ooui-dialog-message-accept', '并关闭')).toBe('确定并关闭');
  });

  it('覆盖表按键合并：后注册的键不影响已有键，未注册键仍取英文默认', async () => {
    vi.resetModules();
    const i18n = await import('./i18n');
    i18n.registerMessages({ 'ooui-dialog-message-accept': '确定' });
    i18n.registerMessages({ 'ooui-dialog-message-reject': '取消' });
    expect(i18n.msg('ooui-dialog-message-accept')).toBe('确定');
    expect(i18n.msg('ooui-dialog-message-reject')).toBe('取消');
    expect(i18n.msg('ooui-dialog-process-error')).toBe('Something went wrong');
  });
});

describe('deferMsg（延迟取值）', () => {
  it('返回的函数在调用时才取值，可读到之后注册的覆盖', async () => {
    vi.resetModules();
    const i18n = await import('./i18n');
    const deferred = i18n.deferMsg('ooui-dialog-message-accept');
    expect(deferred()).toBe('OK');
    i18n.registerMessages({ 'ooui-dialog-message-accept': '确定' });
    expect(deferred()).toBe('确定');
  });

  it('deferMsg捕获的参数同样参与替换', async () => {
    vi.resetModules();
    const i18n = await import('./i18n');
    i18n.registerMessages({ 'ooui-dialog-message-accept': '确定$1' });
    expect(i18n.deferMsg('ooui-dialog-message-accept', '并关闭')()).toBe('确定并关闭');
  });
});
